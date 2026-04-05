#!/usr/bin/env python3
"""
KaNeXT CCCAA Baseball + Softball Scraper
Source: cccaasports.org → PrestoSports S3 JSON (public, no Cloudflare)

Strategy:
  1. Fetch one CCCAA team page to extract the playersData S3 URL
  2. Fetch the S3 JSON — contains ALL CCCAA players for that sport in one file
  3. Parse & upsert to DB

Baseball (bsb):  ~87 teams, ~3,100 players
Softball (sball): ~72 teams, ~1,300 players

DB tables written:
  cccaa_bsb_teams    — team name, conference, slug
  cccaa_bsb_players  — bio (name, pos, jersey, year, slug)
  cccaa_bsb_batting  — full season batting stats
  cccaa_bsb_pitching — full season pitching stats

Usage:
    python3 cccaa_baseball_scraper.py              # both sports
    python3 cccaa_baseball_scraper.py --sport bsb
    python3 cccaa_baseball_scraper.py --sport sball
"""
from __future__ import annotations

import argparse
import os
import re
import sys
import time
from typing import Optional

import httpx
import psycopg
from bs4 import BeautifulSoup
from psycopg.rows import dict_row

sys.path.insert(0, os.path.dirname(__file__))
from config import DB_CONFIG

# ── Config ────────────────────────────────────────────────────────────────────

BASE_URL = "https://cccaasports.org"
SEASON   = "2025-26"

# Anchor team page used to extract the S3 playersData URL (one per sport)
ANCHOR_TEAMS = {
    "bsb":   "eastlosangeles",
    "sball": "eastlosangeles",
}

BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
}


# ── DB Schema ─────────────────────────────────────────────────────────────────

CREATE_TEAMS = """
CREATE TABLE IF NOT EXISTS cccaa_bsb_teams (
    id          SERIAL PRIMARY KEY,
    sport       TEXT NOT NULL,            -- 'bsb' or 'sball'
    name        TEXT NOT NULL,
    slug        TEXT,
    conference  TEXT,
    season      TEXT NOT NULL,
    UNIQUE (sport, name, season)
);
"""

CREATE_PLAYERS = """
CREATE TABLE IF NOT EXISTS cccaa_bsb_players (
    id          SERIAL PRIMARY KEY,
    team_id     INT  NOT NULL REFERENCES cccaa_bsb_teams(id),
    player_slug TEXT,
    full_name   TEXT NOT NULL,
    first_name  TEXT,
    last_name   TEXT,
    position    TEXT,
    class_year  TEXT,
    jersey      TEXT,
    UNIQUE (team_id, full_name)
);
"""

CREATE_BATTING = """
CREATE TABLE IF NOT EXISTS cccaa_bsb_batting (
    id         SERIAL PRIMARY KEY,
    player_id  INT  NOT NULL REFERENCES cccaa_bsb_players(id),
    season     TEXT NOT NULL,
    gp         INT,
    gs         INT,
    pa         INT,
    ab         INT,
    r          INT,
    h          INT,
    doubles    INT,
    triples    INT,
    hr         INT,
    rbi        INT,
    bb         INT,
    k          INT,
    sb         INT,
    cs         INT,
    hbp        INT,
    sf         INT,
    sh         INT,
    gdp        INT,
    tb         INT,
    xbh        INT,
    avg        NUMERIC(6,4),
    obp        NUMERIC(6,4),
    slg        NUMERIC(6,4),
    ops        NUMERIC(6,4),
    UNIQUE (player_id, season)
);
"""

CREATE_PITCHING = """
CREATE TABLE IF NOT EXISTS cccaa_bsb_pitching (
    id         SERIAL PRIMARY KEY,
    player_id  INT  NOT NULL REFERENCES cccaa_bsb_players(id),
    season     TEXT NOT NULL,
    app        INT,
    gs         INT,
    w          INT,
    l          INT,
    sv         INT,
    ip         NUMERIC(6,1),
    h          INT,
    r          INT,
    er         INT,
    bb         INT,
    so         INT,
    hr_allowed INT,
    hbp        INT,
    era        NUMERIC(7,2),
    whip       NUMERIC(6,2),
    opp_avg    NUMERIC(6,4),
    UNIQUE (player_id, season)
);
"""


def ensure_schema(conn):
    conn.execute(CREATE_TEAMS)
    conn.execute(CREATE_PLAYERS)
    conn.execute(CREATE_BATTING)
    conn.execute(CREATE_PITCHING)
    conn.commit()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _int(v) -> Optional[int]:
    if v is None:
        return None
    s = str(v).strip()
    if s in ("-", "", "—"):
        return None
    try:
        return int(float(s))
    except (ValueError, TypeError):
        return None


def _float(v, ndigits: int = 4) -> Optional[float]:
    if v is None:
        return None
    s = str(v).strip()
    if s in ("-", "", "—", "∞", "inf", "INF"):
        return None
    try:
        f = float(s)
        if f != f or abs(f) == float("inf"):
            return None
        return round(f, ndigits)
    except (ValueError, TypeError):
        return None


# ── HTTP ──────────────────────────────────────────────────────────────────────

def fetch_page(url: str, retries: int = 3) -> Optional[str]:
    for attempt in range(retries):
        try:
            r = httpx.get(url, headers=BROWSER_HEADERS, timeout=30, follow_redirects=True)
            if r.status_code == 202 and len(r.content) < 5000:
                wait = 60 * (attempt + 1)
                print(f"  [WAF] {url} — waiting {wait}s...")
                time.sleep(wait)
                continue
            if r.status_code == 200:
                return r.text
            print(f"  [warn] {r.status_code} for {url}")
            return None
        except Exception as e:
            print(f"  [err] {url}: {e}")
            time.sleep(5)
    return None


def fetch_s3_json(url: str) -> Optional[dict]:
    """Fetch S3 JSON directly — no auth, no WAF."""
    for attempt in range(3):
        try:
            r = httpx.get(url, timeout=120)
            if r.status_code == 200:
                return r.json()
            print(f"  [s3 warn] {r.status_code} for {url}")
        except Exception as e:
            print(f"  [s3 err] {e}")
            time.sleep(5)
    return None


def get_players_data_url(sport: str) -> Optional[str]:
    """Load one CCCAA team page and extract the playersData S3 URL."""
    anchor = ANCHOR_TEAMS.get(sport, "eastlosangeles")
    page_url = f"{BASE_URL}/sports/{sport}/{SEASON}/teams/{anchor}"
    html = fetch_page(page_url)
    if not html:
        return None

    # Find playersData URL in page scripts
    soup = BeautifulSoup(html, "html.parser")
    for script in soup.find_all("script"):
        text = script.get_text()
        if "playersData" in text or "amazonaws" in text:
            urls = re.findall(
                r"https://prestosports-downloads\.s3[^\"']+playersData[^\"']+\.json", text
            )
            if urls:
                return urls[0]
    return None


# ── DB Writes ─────────────────────────────────────────────────────────────────

def upsert_team(conn, sport: str, name: str, slug: str, conference: str) -> int:
    row = conn.execute("""
        INSERT INTO cccaa_bsb_teams (sport, name, slug, conference, season)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (sport, name, season) DO UPDATE SET
            slug       = COALESCE(EXCLUDED.slug,       cccaa_bsb_teams.slug),
            conference = COALESCE(EXCLUDED.conference, cccaa_bsb_teams.conference)
        RETURNING id
    """, (sport, name, slug or None, conference or None, SEASON)).fetchone()
    return row["id"]


def upsert_player(conn, team_id: int, p: dict) -> int:
    row = conn.execute("""
        INSERT INTO cccaa_bsb_players
            (team_id, player_slug, full_name, first_name, last_name, position, class_year, jersey)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (team_id, full_name) DO UPDATE SET
            player_slug = COALESCE(EXCLUDED.player_slug, cccaa_bsb_players.player_slug),
            position    = COALESCE(EXCLUDED.position,    cccaa_bsb_players.position),
            class_year  = COALESCE(EXCLUDED.class_year,  cccaa_bsb_players.class_year),
            jersey      = COALESCE(EXCLUDED.jersey,      cccaa_bsb_players.jersey)
        RETURNING id
    """, (
        team_id,
        p.get("pageName") or None,
        p.get("fullName", "").strip(),
        p.get("firstName", "").strip() or None,
        p.get("lastName", "").strip() or None,
        p.get("positionAbbreviation") or p.get("position") or None,
        p.get("year") or None,
        p.get("uniform") or None,
    )).fetchone()
    return row["id"]


def upsert_batting(conn, player_id: int, s: dict):
    ab = _int(s.get("ab"))
    if ab is None or ab == 0:
        return   # skip non-batters / no plate appearances
    doubles = _int(s.get("hd"))
    triples = _int(s.get("ht"))
    conn.execute("""
        INSERT INTO cccaa_bsb_batting (
            player_id, season, gp, gs, pa, ab, r, h, doubles, triples, hr, rbi,
            bb, k, sb, cs, hbp, sf, sh, gdp, tb, xbh, avg, obp, slg, ops
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
        ON CONFLICT (player_id, season) DO UPDATE SET
            gp=EXCLUDED.gp, gs=EXCLUDED.gs, pa=EXCLUDED.pa, ab=EXCLUDED.ab,
            r=EXCLUDED.r, h=EXCLUDED.h, doubles=EXCLUDED.doubles, triples=EXCLUDED.triples,
            hr=EXCLUDED.hr, rbi=EXCLUDED.rbi, bb=EXCLUDED.bb, k=EXCLUDED.k,
            sb=EXCLUDED.sb, cs=EXCLUDED.cs, hbp=EXCLUDED.hbp, sf=EXCLUDED.sf,
            sh=EXCLUDED.sh, gdp=EXCLUDED.gdp, tb=EXCLUDED.tb, xbh=EXCLUDED.xbh,
            avg=EXCLUDED.avg, obp=EXCLUDED.obp, slg=EXCLUDED.slg, ops=EXCLUDED.ops
    """, (
        player_id, SEASON,
        _int(s.get("gp")), _int(s.get("gs")),
        _int(s.get("pa")), ab,
        _int(s.get("r")), _int(s.get("h")),
        doubles, triples,
        _int(s.get("hr")), _int(s.get("rbi")),
        _int(s.get("bb")), _int(s.get("k")),
        _int(s.get("sb")), _int(s.get("cs")),
        _int(s.get("hbp")), _int(s.get("sf")),
        _int(s.get("sh")), _int(s.get("hdp")),
        _int(s.get("tb")), _int(s.get("xbh")),
        _float(s.get("avg")), _float(s.get("obp")),
        _float(s.get("slg")), _float(s.get("ops")),
    ))


def upsert_pitching(conn, player_id: int, s: dict):
    ip_raw = s.get("ip")
    try:
        ip = float(ip_raw or "0")
    except (ValueError, TypeError):
        ip = 0.0
    if ip == 0.0:
        return   # skip non-pitchers

    conn.execute("""
        INSERT INTO cccaa_bsb_pitching (
            player_id, season, app, gs, w, l, sv, ip, h, r, er, bb, so,
            hr_allowed, hbp, era, whip, opp_avg
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s
        )
        ON CONFLICT (player_id, season) DO UPDATE SET
            app=EXCLUDED.app, gs=EXCLUDED.gs, w=EXCLUDED.w, l=EXCLUDED.l,
            sv=EXCLUDED.sv, ip=EXCLUDED.ip, h=EXCLUDED.h, r=EXCLUDED.r,
            er=EXCLUDED.er, bb=EXCLUDED.bb, so=EXCLUDED.so,
            hr_allowed=EXCLUDED.hr_allowed, hbp=EXCLUDED.hbp,
            era=EXCLUDED.era, whip=EXCLUDED.whip, opp_avg=EXCLUDED.opp_avg
    """, (
        player_id, SEASON,
        _int(s.get("pgp")), _int(s.get("pgs")),
        _int(s.get("pw")), _int(s.get("pl")),
        _int(s.get("sv")),
        _float(ip, 1),
        _int(s.get("ph")), _int(s.get("pr")), _int(s.get("er")),
        _int(s.get("pbb")), _int(s.get("pk")),
        _int(s.get("phr")), _int(s.get("phbp")),
        _float(s.get("era"), 2), _float(s.get("whip"), 2),
        _float(s.get("pavg"), 4),
    ))


# ── Main Load ─────────────────────────────────────────────────────────────────

def load_sport(conn, sport: str):
    label = "Baseball" if sport == "bsb" else "Softball"
    print(f"\n{'='*60}")
    print(f"  {label} ({sport})")

    # Step 1: find the S3 playersData URL
    print(f"  Fetching S3 URL from team page...")
    s3_url = get_players_data_url(sport)
    if not s3_url:
        print(f"  ERROR: could not find playersData URL for {sport}")
        return
    print(f"  S3: {s3_url}")

    # Step 2: fetch the full players JSON from S3
    print(f"  Fetching S3 JSON...")
    data = fetch_s3_json(s3_url)
    if not data:
        print(f"  ERROR: failed to fetch S3 JSON")
        return

    individuals = data.get("individuals", [])
    print(f"  {len(individuals)} players from S3")

    # Step 3: parse and upsert
    team_cache: dict[str, int] = {}   # team name → db id
    bat_count = 0
    pit_count = 0
    player_count = 0

    for p in individuals:
        team_name  = (p.get("team") or "").strip()
        team_slug  = (p.get("teamPageName") or "").strip()
        conference = (p.get("conference") or "").strip()
        full_name  = (p.get("fullName") or "").strip()

        if not full_name or not team_name:
            continue

        # Upsert team
        if team_name not in team_cache:
            team_cache[team_name] = upsert_team(conn, sport, team_name, team_slug, conference)
        team_id = team_cache[team_name]

        # Upsert player
        player_id = upsert_player(conn, team_id, p)
        player_count += 1

        # Stats
        s = p.get("stats", {})
        try:
            upsert_batting(conn, player_id, s)
            bat_count += 1
        except Exception:
            conn.rollback()

        try:
            upsert_pitching(conn, player_id, s)
            pit_count += 1
        except Exception:
            conn.rollback()

    conn.commit()

    print(f"\n  {label} loaded:")
    print(f"    {len(team_cache)} teams")
    print(f"    {player_count} players")
    print(f"    {bat_count} batting rows")
    print(f"    {pit_count} pitching rows")

    # Top hitters
    top = conn.execute("""
        SELECT p.full_name, t.name AS team, b.avg, b.obp, b.slg, b.ops,
               b.h, b.ab, b.hr, b.rbi, b.sb
        FROM cccaa_bsb_batting b
        JOIN cccaa_bsb_players p ON b.player_id = p.id
        JOIN cccaa_bsb_teams t ON p.team_id = t.id
        WHERE t.sport = %s AND b.ab >= 50
        ORDER BY b.avg DESC NULLS LAST
        LIMIT 5
    """, (sport,)).fetchall()
    if top:
        print(f"\n  Top {label} hitters (min 50 AB):")
        for r in top:
            avg = float(r["avg"] or 0)
            obp = float(r["obp"] or 0)
            slg = float(r["slg"] or 0)
            ops = float(r["ops"] or 0)
            print(f"    {r['full_name']:<28} {r['team']:<22} "
                  f"AVG={avg:.3f} OBP={obp:.3f} SLG={slg:.3f} OPS={ops:.3f} "
                  f"H={r['h']} AB={r['ab']} HR={r['hr']} RBI={r['rbi']} SB={r['sb']}")

    # Top ERA pitchers
    top_p = conn.execute("""
        SELECT p.full_name, t.name AS team, pi.era, pi.whip,
               pi.ip, pi.so, pi.bb, pi.w, pi.l, pi.sv
        FROM cccaa_bsb_pitching pi
        JOIN cccaa_bsb_players p ON pi.player_id = p.id
        JOIN cccaa_bsb_teams t ON p.team_id = t.id
        WHERE t.sport = %s AND pi.ip >= 20
        ORDER BY pi.era ASC NULLS LAST
        LIMIT 5
    """, (sport,)).fetchall()
    if top_p:
        print(f"\n  Top {label} pitchers (min 20 IP):")
        for r in top_p:
            era = float(r["era"] or 99)
            whip = float(r["whip"] or 99)
            print(f"    {r['full_name']:<28} {r['team']:<22} "
                  f"ERA={era:.2f} WHIP={whip:.2f} IP={r['ip']} "
                  f"SO={r['so']} BB={r['bb']} W={r['w']} L={r['l']} SV={r['sv']}")


def main():
    parser = argparse.ArgumentParser(description="CCCAA Baseball/Softball Scraper")
    parser.add_argument("--sport", choices=["bsb", "sball"], default=None,
                        help="Sport to load (default: both)")
    args = parser.parse_args()
    sports = [args.sport] if args.sport else ["bsb", "sball"]

    print(f"=== CCCAA Baseball/Softball Scraper ===")
    print(f"  Sports: {', '.join(sports)}")
    print(f"  Season: {SEASON}")

    with psycopg.connect(
        host=DB_CONFIG["host"], port=DB_CONFIG["port"], dbname=DB_CONFIG["dbname"],
        row_factory=dict_row, autocommit=False,
    ) as conn:
        ensure_schema(conn)
        for sport in sports:
            load_sport(conn, sport)


if __name__ == "__main__":
    main()
