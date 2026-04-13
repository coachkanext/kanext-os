#!/usr/bin/env python3
"""
KaNeXT CCCAA Volleyball Scraper (Women's + Men's)
Source: cccaasports.org → PrestoSports S3 JSON (public, no Cloudflare)

Strategy: identical to cccaa_baseball_scraper.py —
  1. Fetch one CCCAA team page to extract the playersData S3 URL
  2. Fetch the S3 JSON — contains ALL CCCAA players for that sport
  3. Parse & upsert to DB

Women's volleyball (wvball): ~1,372 players, 92 teams
Men's   volleyball (mvball): ~329  players, 16 teams

DB tables:
  cccaa_vb_teams   — team name, conference, slug
  cccaa_vb_players — bio (name, pos, jersey, year, slug)
  cccaa_vb_stats   — kills, assists, digs, blocks, aces, service errors, hitting pct

Usage:
    python3 cccaa_vb_scraper.py             # both sports
    python3 cccaa_vb_scraper.py --sport wvball
    python3 cccaa_vb_scraper.py --sport mvball
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

BASE_URL = "https://cccaasports.org"
SEASON   = "2025-26"

ANCHOR_TEAMS = {
    "wvball": "alameda",
    "mvball": "palomar",
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

# ── DB Schema ──────────────────────────────────────────────────────────────────

CREATE_TEAMS = """
CREATE TABLE IF NOT EXISTS cccaa_vb_teams (
    id          SERIAL PRIMARY KEY,
    sport       TEXT NOT NULL,
    name        TEXT NOT NULL,
    slug        TEXT,
    conference  TEXT,
    season      TEXT NOT NULL,
    UNIQUE (sport, name, season)
);
"""

CREATE_PLAYERS = """
CREATE TABLE IF NOT EXISTS cccaa_vb_players (
    id          SERIAL PRIMARY KEY,
    team_id     INT  NOT NULL REFERENCES cccaa_vb_teams(id),
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

CREATE_STATS = """
CREATE TABLE IF NOT EXISTS cccaa_vb_stats (
    id          SERIAL PRIMARY KEY,
    player_id   INT  NOT NULL REFERENCES cccaa_vb_players(id),
    season      TEXT NOT NULL,
    gp          INT,
    sets        INT,
    kills       INT,
    kills_per_set  NUMERIC(6,3),
    errors      INT,
    total_att   INT,
    hit_pct     NUMERIC(6,4),
    assists     INT,
    assists_per_set NUMERIC(6,3),
    service_aces INT,
    aces_per_set NUMERIC(6,3),
    service_errors INT,
    digs        INT,
    digs_per_set NUMERIC(6,3),
    block_solos INT,
    block_assists INT,
    total_blocks INT,
    blocks_per_set NUMERIC(6,3),
    points      NUMERIC(8,1),
    pts_per_set NUMERIC(6,3),
    UNIQUE (player_id, season)
);
"""


def ensure_schema(conn):
    conn.execute(CREATE_TEAMS)
    conn.execute(CREATE_PLAYERS)
    conn.execute(CREATE_STATS)
    conn.commit()


# ── Helpers ────────────────────────────────────────────────────────────────────

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


# ── HTTP ───────────────────────────────────────────────────────────────────────

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
    for attempt in range(3):
        try:
            r = httpx.get(url, timeout=120)
            if r.status_code == 200:
                return r.json()
            print(f"  [s3 warn] {r.status_code}")
        except Exception as e:
            print(f"  [s3 err] {e}")
            time.sleep(5)
    return None


def get_players_data_url(sport: str) -> Optional[str]:
    anchor = ANCHOR_TEAMS[sport]
    page_url = f"{BASE_URL}/sports/{sport}/{SEASON}/teams/{anchor}"
    html = fetch_page(page_url)
    if not html:
        return None
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


# ── DB Writes ──────────────────────────────────────────────────────────────────

def upsert_team(conn, sport: str, name: str, slug: str, conference: str) -> int:
    row = conn.execute("""
        INSERT INTO cccaa_vb_teams (sport, name, slug, conference, season)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (sport, name, season) DO UPDATE SET
            slug       = COALESCE(EXCLUDED.slug,       cccaa_vb_teams.slug),
            conference = COALESCE(EXCLUDED.conference, cccaa_vb_teams.conference)
        RETURNING id
    """, (sport, name, slug or None, conference or None, SEASON)).fetchone()
    return row["id"]


def upsert_player(conn, team_id: int, p: dict) -> int:
    row = conn.execute("""
        INSERT INTO cccaa_vb_players
            (team_id, player_slug, full_name, first_name, last_name, position, class_year, jersey)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (team_id, full_name) DO UPDATE SET
            player_slug = COALESCE(EXCLUDED.player_slug, cccaa_vb_players.player_slug),
            position    = COALESCE(EXCLUDED.position,    cccaa_vb_players.position),
            class_year  = COALESCE(EXCLUDED.class_year,  cccaa_vb_players.class_year),
            jersey      = COALESCE(EXCLUDED.jersey,      cccaa_vb_players.jersey)
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


def upsert_stats(conn, player_id: int, s: dict):
    gp = _int(s.get("gp"))
    if gp is None or gp == 0:
        return
    conn.execute("""
        INSERT INTO cccaa_vb_stats (
            player_id, season, gp, sets, kills, kills_per_set, errors, total_att, hit_pct,
            assists, assists_per_set, service_aces, aces_per_set, service_errors,
            digs, digs_per_set, block_solos, block_assists, total_blocks, blocks_per_set,
            points, pts_per_set
        ) VALUES (
            %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
        )
        ON CONFLICT (player_id, season) DO UPDATE SET
            gp=EXCLUDED.gp, sets=EXCLUDED.sets, kills=EXCLUDED.kills,
            kills_per_set=EXCLUDED.kills_per_set, assists=EXCLUDED.assists,
            digs=EXCLUDED.digs, service_aces=EXCLUDED.service_aces,
            service_errors=EXCLUDED.service_errors,
            block_solos=EXCLUDED.block_solos, block_assists=EXCLUDED.block_assists,
            total_blocks=EXCLUDED.total_blocks, hit_pct=EXCLUDED.hit_pct, points=EXCLUDED.points
    """, (
        player_id, SEASON,
        gp,
        _int(s.get("sp") or s.get("ms")),    # sets played / matches started
        _int(s.get("k")),
        _float(s.get("kps"), 3),
        _int(s.get("e")),
        _int(s.get("ta")),
        _float(s.get("hpt"), 4),
        _int(s.get("a")),
        _float(s.get("aps"), 3),
        _int(s.get("sa")),
        _float(s.get("saps"), 3),
        _int(s.get("se")),
        _int(s.get("d")),
        _float(s.get("dps"), 3),
        _int(s.get("bs")),
        _int(s.get("ba")),
        _int(s.get("bt")),
        _float(s.get("bps"), 3),
        _float(s.get("pts"), 1),
        _float(s.get("ptsps"), 3),
    ))


# ── Main Load ──────────────────────────────────────────────────────────────────

def load_sport(conn, sport: str):
    label = "Women's VB" if sport == "wvball" else "Men's VB"
    print(f"\n{'='*60}")
    print(f"  {label} ({sport})")

    print(f"  Fetching S3 URL from team page...")
    s3_url = get_players_data_url(sport)
    if not s3_url:
        print(f"  ERROR: could not find playersData URL for {sport}")
        return
    print(f"  S3: {s3_url}")

    print(f"  Fetching S3 JSON...")
    data = fetch_s3_json(s3_url)
    if not data:
        print(f"  ERROR: failed to fetch S3 JSON")
        return

    individuals = data.get("individuals", [])
    print(f"  {len(individuals)} players from S3")

    team_cache: dict[str, int] = {}
    player_count = 0
    stat_count   = 0

    for p in individuals:
        team_name  = (p.get("team") or "").strip()
        team_slug  = (p.get("teamPageName") or "").strip()
        conference = (p.get("conference") or "").strip()
        full_name  = (p.get("fullName") or "").strip()

        if not full_name or not team_name:
            continue

        if team_name not in team_cache:
            team_cache[team_name] = upsert_team(conn, sport, team_name, team_slug, conference)
        team_id = team_cache[team_name]

        player_id = upsert_player(conn, team_id, p)
        player_count += 1

        s = p.get("stats", {})
        try:
            upsert_stats(conn, player_id, s)
            stat_count += 1
        except Exception as exc:
            print(f"  [stat err] {full_name}: {exc}")
            conn.rollback()

    conn.commit()

    # Summary
    top = conn.execute("""
        SELECT p.full_name, t.name AS team, s.kills, s.kills_per_set, s.digs, s.service_aces
        FROM cccaa_vb_stats s
        JOIN cccaa_vb_players p ON s.player_id = p.id
        JOIN cccaa_vb_teams t ON p.team_id = t.id
        WHERE t.sport = %s AND s.kills IS NOT NULL
        ORDER BY s.kills DESC NULLS LAST LIMIT 5
    """, (sport,)).fetchall()

    print(f"\n  {label} loaded:")
    print(f"    {len(team_cache)} teams")
    print(f"    {player_count} players")
    print(f"    {stat_count} stat rows")
    if top:
        print(f"  Top by kills:")
        for r in top:
            kps = float(r["kills_per_set"] or 0)
            print(f"    {r['full_name']:<28} {r['team']:<22} K={r['kills']} ({kps:.2f}/s) D={r['digs']} SA={r['service_aces']}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sport", choices=["wvball", "mvball"], help="Sport to load")
    args = parser.parse_args()

    conn = psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)
    ensure_schema(conn)

    sports = [args.sport] if args.sport else ["wvball", "mvball"]
    for sport in sports:
        load_sport(conn, sport)

    # Final counts
    cur = conn.cursor()
    cur.execute("SELECT sport, COUNT(*) n FROM cccaa_vb_teams GROUP BY sport")
    teams = {r["sport"]: r["n"] for r in cur.fetchall()}
    cur.execute("""
        SELECT t.sport, COUNT(DISTINCT p.id) players, COUNT(DISTINCT s.id) stats
        FROM cccaa_vb_teams t
        LEFT JOIN cccaa_vb_players p ON p.team_id = t.id
        LEFT JOIN cccaa_vb_stats s ON s.player_id = p.id
        GROUP BY t.sport
    """)
    print(f"\n{'='*60}")
    print("CCCAA VOLLEYBALL FINAL:")
    for r in cur.fetchall():
        print(f"  {r['sport']}: {teams.get(r['sport'],0)} teams, {r['players']} players, {r['stats']} stat rows")

    conn.close()


if __name__ == "__main__":
    main()
