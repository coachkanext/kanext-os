#!/usr/bin/env python3
"""
KaNeXT Baseball Reference International Scraper
Source: baseball-reference.com/register/

Scrapes full-season batting + pitching stats for international pro leagues:
  Winter leagues: LIDOM (Dominican), LVBP (Venezuelan), LMP (Mexican Pacific), PRWL (Puerto Rico)
  Asia:           NPB-Central (Japan), NPB-Pacific (Japan), KBO (Korea)
  Other intl:     LMB (Mexican League), DSL (Dominican Summer), CUBA (Cuban National Series),
                  CPBL (Taiwan), ABL (Australia)

All data from team pages — each team has a visible #team_batting table and
a commented-out #team_pitching table (BBRef renders pitching client-side).

DB tables:
  bbref_intl_teams    — league_code, season, team_name, bbref_team_id
  bbref_intl_players  — team_id, player_name, age_str, handedness
  bbref_intl_batting  — full batting line per player per season
  bbref_intl_pitching — full pitching line per player per season

Usage:
    python3 bbref_intl_scraper.py                    # all leagues, 2024/2024-25 season
    python3 bbref_intl_scraper.py --league LIDOM     # one league only
    python3 bbref_intl_scraper.py --league NPB-C     # Japan Central only
    python3 bbref_intl_scraper.py --season 2023      # prior season (looks up IDs dynamically)
"""
from __future__ import annotations

import argparse
import re
import sys
import time
from typing import Optional

import httpx
import psycopg
from bs4 import BeautifulSoup, Comment
from psycopg.rows import dict_row

# ── Config ─────────────────────────────────────────────────────────────────
DB_CONFIG   = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}
BASE_URL    = "https://www.baseball-reference.com"
SLEEP_TEAM   = 5.0   # seconds between team page fetches (BBRef rate limit)
SLEEP_LEAGUE = 10.0  # seconds between league page fetches

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Referer": "https://www.baseball-reference.com/register/",
    "Connection": "keep-alive",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Upgrade-Insecure-Requests": "1",
}

# ── League definitions ──────────────────────────────────────────────────────
# bbref_id: discovered from /register/league.cgi?year=2024 master table
# Hardcoded for 2024 / 2024-25 season; dynamic lookup used for other years.
LEAGUES = {
    "LIDOM":  {"name": "Dominican Winter League",  "bbref_id": "3d6041f6", "season": "2024-25", "type": "winter"},
    "LVBP":   {"name": "Venezuelan Winter League", "bbref_id": "8b7647c8", "season": "2024-25", "type": "winter"},
    "LMP":    {"name": "Mexican Pacific League",   "bbref_id": "5e972344", "season": "2024-25", "type": "winter"},
    "PRWL":   {"name": "Puerto Rican Winter League","bbref_id": "ea5c6086", "season": "2024-25", "type": "winter"},
    "NPB-C":  {"name": "Japan Central League",        "bbref_id": "5e1f8b77", "season": "2024",    "type": "npb"},
    "NPB-P":  {"name": "Japan Pacific League",        "bbref_id": "5677b62d", "season": "2024",    "type": "npb"},
    "KBO":    {"name": "Korea Baseball Organization", "bbref_id": "4b32bd8a", "season": "2024",    "type": "kbo"},
    # New leagues
    "LMB":    {"name": "Mexican League",              "bbref_id": "83fa0ab3", "season": "2024",    "type": "intl"},
    "DSL":    {"name": "Dominican Summer League",     "bbref_id": "6b7e8adc", "season": "2024",    "type": "intl"},
    "CUBA":   {"name": "Cuban National Series",       "bbref_id": "a5678475", "season": "2022-23", "type": "intl"},
    "CPBL":   {"name": "Chinese Professional Baseball League", "bbref_id": "f65db0d9", "season": "2024", "type": "intl"},
    "ABL":    {"name": "Australian Baseball League",  "bbref_id": "21cb7dd1", "season": "2024",    "type": "intl"},
}

# ── DDL ─────────────────────────────────────────────────────────────────────
DDL = """
CREATE TABLE IF NOT EXISTS bbref_intl_teams (
    id              SERIAL PRIMARY KEY,
    league_code     TEXT NOT NULL,
    season          TEXT NOT NULL,
    team_name       TEXT NOT NULL,
    bbref_team_id   TEXT NOT NULL,
    UNIQUE (league_code, season, bbref_team_id)
);

CREATE TABLE IF NOT EXISTS bbref_intl_players (
    id          SERIAL PRIMARY KEY,
    team_id     INT  NOT NULL REFERENCES bbref_intl_teams(id),
    player_name TEXT NOT NULL,
    age         INT,
    handedness  TEXT,
    UNIQUE (team_id, player_name)
);

CREATE TABLE IF NOT EXISTS bbref_intl_batting (
    id          SERIAL PRIMARY KEY,
    player_id   INT  NOT NULL REFERENCES bbref_intl_players(id),
    season      TEXT NOT NULL,
    g           INT,
    pa          INT,
    ab          INT,
    r           INT,
    h           INT,
    doubles     INT,
    triples     INT,
    hr          INT,
    rbi         INT,
    sb          INT,
    cs          INT,
    bb          INT,
    so          INT,
    ba          NUMERIC(6,3),
    obp         NUMERIC(6,3),
    slg         NUMERIC(6,3),
    ops         NUMERIC(6,3),
    tb          INT,
    gdp         INT,
    hbp         INT,
    sh          INT,
    sf          INT,
    ibb         INT,
    UNIQUE (player_id, season)
);

CREATE TABLE IF NOT EXISTS bbref_intl_pitching (
    id          SERIAL PRIMARY KEY,
    player_id   INT  NOT NULL REFERENCES bbref_intl_players(id),
    season      TEXT NOT NULL,
    w           INT,
    l           INT,
    era         NUMERIC(7,2),
    g           INT,
    gs          INT,
    gf          INT,
    cg          INT,
    sho         INT,
    sv          INT,
    ip          NUMERIC(7,1),
    h           INT,
    r           INT,
    er          INT,
    hr          INT,
    bb          INT,
    ibb         INT,
    so          INT,
    hbp         INT,
    bk          INT,
    wp          INT,
    bf          INT,
    whip        NUMERIC(7,3),
    h9          NUMERIC(7,2),
    hr9         NUMERIC(7,2),
    bb9         NUMERIC(7,2),
    so9         NUMERIC(7,2),
    so_w        NUMERIC(7,2),
    UNIQUE (player_id, season)
);
"""

# ── Helpers ─────────────────────────────────────────────────────────────────
def _int(v) -> Optional[int]:
    if v is None:
        return None
    s = str(v).strip().replace(",", "")
    if s in ("", "-", "—", "N/A"):
        return None
    try:
        return int(float(s))
    except (ValueError, TypeError):
        return None

def _flt(v, ndigits: int = 3) -> Optional[float]:
    if v is None:
        return None
    s = str(v).strip()
    if s in ("", "-", "—", ".---", "N/A", "inf", "∞", "INF"):
        return None
    try:
        f = float(s)
        if f != f or f == float("inf") or f == float("-inf"):
            return None
        return round(f, ndigits)
    except (ValueError, TypeError):
        return None

def clean_name(name: str) -> str:
    """Strip BBRef handedness markers (* = LHB, # = switch) and whitespace."""
    return name.replace("*", "").replace("#", "").strip()

def get_handedness(name: str) -> Optional[str]:
    if "*" in name:
        return "L"
    if "#" in name:
        return "S"
    return None

def fetch(url: str, retries: int = 3) -> Optional[BeautifulSoup]:
    backoff = 90  # seconds for first 429 retry
    for attempt in range(retries):
        try:
            r = httpx.get(url, headers=HEADERS, follow_redirects=True, timeout=30)
            if r.status_code == 429:
                if attempt < retries - 1:
                    print(f"  [429] Rate limited — waiting {backoff}s before retry {attempt+1}/{retries-1}...")
                    time.sleep(backoff)
                    backoff = min(backoff * 2, 300)  # cap at 5 min
                    continue
                print(f"  [429] Rate limited after {retries} attempts: {url}")
                return None
            if r.status_code != 200:
                print(f"  [HTTP {r.status_code}] {url}")
                return None
            return BeautifulSoup(r.text, "html.parser")
        except Exception as e:
            print(f"  [ERROR] {url}: {e}")
            if attempt < retries - 1:
                time.sleep(10)
    return None

def find_commented_table(soup: BeautifulSoup, table_id: str) -> Optional[BeautifulSoup]:
    """Find a BBRef table that is hidden inside an HTML comment block."""
    comments = soup.find_all(string=lambda t: isinstance(t, Comment))
    for c in comments:
        if table_id in str(c):
            csoup = BeautifulSoup(str(c), "html.parser")
            tbl = csoup.find("table", {"id": table_id})
            if tbl:
                return tbl
    return None

def parse_table(table) -> list[dict]:
    """Parse an HTML table into a list of dicts keyed by (cleaned) column header."""
    if table is None:
        return []

    # Build header list from <th> in <thead> rows
    headers = []
    thead = table.find("thead")
    if thead:
        for th in thead.find_all("th"):
            headers.append(th.get_text(strip=True))

    rows = []
    tbody = table.find("tbody")
    if not tbody:
        return []

    for tr in tbody.find_all("tr"):
        # Skip spacer / header repeater rows
        if "class" in tr.attrs and any(c in tr["class"] for c in ["spacer", "thead"]):
            continue

        cells = tr.find_all(["td", "th"])
        if not cells:
            continue

        row = {}
        for i, cell in enumerate(cells):
            key = headers[i] if i < len(headers) else f"col{i}"
            row[key] = cell.get_text(strip=True)

        # Skip totals / header-repeat rows
        name = row.get("Name", "")
        if not name or name in ("Name", "Team Totals", "Totals", "", "---"):
            continue
        # Skip rows where Rk is not numeric (team summary rows)
        rk = row.get("Rk", "")
        if rk and not rk.isdigit():
            continue

        rows.append(row)

    return rows


# ── DB ops ───────────────────────────────────────────────────────────────────
def upsert_team(conn, league_code: str, season: str, team_name: str, bbref_team_id: str) -> int:
    row = conn.execute(
        """INSERT INTO bbref_intl_teams (league_code, season, team_name, bbref_team_id)
           VALUES (%s, %s, %s, %s)
           ON CONFLICT (league_code, season, bbref_team_id) DO UPDATE
             SET team_name = EXCLUDED.team_name
           RETURNING id""",
        (league_code, season, team_name, bbref_team_id),
    ).fetchone()
    return row["id"]

def upsert_player(conn, team_id: int, player_name: str, age: Optional[int], handedness: Optional[str]) -> int:
    row = conn.execute(
        """INSERT INTO bbref_intl_players (team_id, player_name, age, handedness)
           VALUES (%s, %s, %s, %s)
           ON CONFLICT (team_id, player_name) DO UPDATE
             SET age = EXCLUDED.age, handedness = EXCLUDED.handedness
           RETURNING id""",
        (team_id, player_name, age, handedness),
    ).fetchone()
    return row["id"]

def upsert_batting(conn, player_id: int, season: str, row: dict) -> None:
    conn.execute(
        """INSERT INTO bbref_intl_batting
               (player_id, season, g, pa, ab, r, h, doubles, triples, hr,
                rbi, sb, cs, bb, so, ba, obp, slg, ops, tb,
                gdp, hbp, sh, sf, ibb)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
           ON CONFLICT (player_id, season) DO UPDATE
             SET g=EXCLUDED.g, pa=EXCLUDED.pa, ab=EXCLUDED.ab, r=EXCLUDED.r,
                 h=EXCLUDED.h, doubles=EXCLUDED.doubles, triples=EXCLUDED.triples,
                 hr=EXCLUDED.hr, rbi=EXCLUDED.rbi, sb=EXCLUDED.sb, cs=EXCLUDED.cs,
                 bb=EXCLUDED.bb, so=EXCLUDED.so, ba=EXCLUDED.ba, obp=EXCLUDED.obp,
                 slg=EXCLUDED.slg, ops=EXCLUDED.ops, tb=EXCLUDED.tb,
                 gdp=EXCLUDED.gdp, hbp=EXCLUDED.hbp, sh=EXCLUDED.sh,
                 sf=EXCLUDED.sf, ibb=EXCLUDED.ibb""",
        (
            player_id, season,
            _int(row.get("G")),   _int(row.get("PA")),  _int(row.get("AB")),
            _int(row.get("R")),   _int(row.get("H")),
            _int(row.get("2B")),  _int(row.get("3B")),  _int(row.get("HR")),
            _int(row.get("RBI")), _int(row.get("SB")),  _int(row.get("CS")),
            _int(row.get("BB")),  _int(row.get("SO")),
            _flt(row.get("BA"),  3), _flt(row.get("OBP"), 3),
            _flt(row.get("SLG"), 3), _flt(row.get("OPS"), 3),
            _int(row.get("TB")),  _int(row.get("GDP")),
            _int(row.get("HBP")), _int(row.get("SH")),
            _int(row.get("SF")),  _int(row.get("IBB")),
        ),
    )

def upsert_pitching(conn, player_id: int, season: str, row: dict) -> None:
    conn.execute(
        """INSERT INTO bbref_intl_pitching
               (player_id, season, w, l, era, g, gs, gf, cg, sho, sv,
                ip, h, r, er, hr, bb, ibb, so, hbp, bk, wp, bf,
                whip, h9, hr9, bb9, so9, so_w)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
           ON CONFLICT (player_id, season) DO UPDATE
             SET w=EXCLUDED.w, l=EXCLUDED.l, era=EXCLUDED.era, g=EXCLUDED.g,
                 gs=EXCLUDED.gs, gf=EXCLUDED.gf, cg=EXCLUDED.cg, sho=EXCLUDED.sho,
                 sv=EXCLUDED.sv, ip=EXCLUDED.ip, h=EXCLUDED.h, r=EXCLUDED.r,
                 er=EXCLUDED.er, hr=EXCLUDED.hr, bb=EXCLUDED.bb, ibb=EXCLUDED.ibb,
                 so=EXCLUDED.so, hbp=EXCLUDED.hbp, bk=EXCLUDED.bk, wp=EXCLUDED.wp,
                 bf=EXCLUDED.bf, whip=EXCLUDED.whip, h9=EXCLUDED.h9,
                 hr9=EXCLUDED.hr9, bb9=EXCLUDED.bb9, so9=EXCLUDED.so9,
                 so_w=EXCLUDED.so_w""",
        (
            player_id, season,
            _int(row.get("W")),    _int(row.get("L")),
            _flt(row.get("ERA"), 2),
            _int(row.get("G")),    _int(row.get("GS")),
            _int(row.get("GF")),   _int(row.get("CG")),   _int(row.get("SHO")),
            _int(row.get("SV")),
            _flt(row.get("IP"),  1),
            _int(row.get("H")),    _int(row.get("R")),    _int(row.get("ER")),
            _int(row.get("HR")),   _int(row.get("BB")),   _int(row.get("IBB")),
            _int(row.get("SO")),   _int(row.get("HBP")),  _int(row.get("BK")),
            _int(row.get("WP")),   _int(row.get("BF")),
            _flt(row.get("WHIP"), 3),
            _flt(row.get("H9"),  2), _flt(row.get("HR9"), 2),
            _flt(row.get("BB9"), 2), _flt(row.get("SO9"), 2),
            _flt(row.get("SO/W"),2),
        ),
    )


# ── Core scraping ─────────────────────────────────────────────────────────────
def get_team_ids(league_bbref_id: str) -> list[tuple[str, str]]:
    """Fetch league season page; return list of (team_name, bbref_team_id) tuples."""
    url = f"{BASE_URL}/register/league.cgi?id={league_bbref_id}"
    soup = fetch(url)
    if not soup:
        return []

    teams = []
    seen = set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        # Match /register/team.cgi?id=XXXXXXXX
        m = re.search(r"/register/team\.cgi\?id=([0-9a-f]+)", href)
        if m:
            tid = m.group(1)
            if tid not in seen:
                seen.add(tid)
                name = a.get_text(strip=True)
                teams.append((name, tid))

    return teams


def scrape_team(conn, league_code: str, season: str, team_name: str, bbref_team_id: str) -> tuple[int, int]:
    """Scrape one team page. Returns (bat_rows, pit_rows)."""
    url = f"{BASE_URL}/register/team.cgi?id={bbref_team_id}"
    soup = fetch(url)
    if not soup:
        return 0, 0

    team_id = upsert_team(conn, league_code, season, team_name, bbref_team_id)

    bat_count = 0
    pit_count = 0

    # ── Batting (visible table) ──────────────────────────────────────────
    bat_tbl = soup.find("table", {"id": "team_batting"})
    bat_rows = parse_table(bat_tbl)
    for row in bat_rows:
        raw_name = row.get("Name", "")
        if not raw_name:
            continue
        name = clean_name(raw_name)
        hand = get_handedness(raw_name)
        age  = _int(row.get("Age"))
        pid  = upsert_player(conn, team_id, name, age, hand)
        upsert_batting(conn, pid, season, row)
        bat_count += 1

    # ── Pitching (commented-out table) ───────────────────────────────────
    pit_tbl = find_commented_table(soup, "team_pitching")
    pit_rows = parse_table(pit_tbl)
    for row in pit_rows:
        raw_name = row.get("Name", "")
        if not raw_name:
            continue
        name = clean_name(raw_name)
        hand = get_handedness(raw_name)
        age  = _int(row.get("Age"))
        # Upsert player (may already exist from batting; update age/hand if new)
        pid  = upsert_player(conn, team_id, name, age, hand)
        upsert_pitching(conn, pid, season, row)
        pit_count += 1

    conn.commit()
    return bat_count, pit_count


def scrape_league(conn, code: str, info: dict) -> dict:
    """Scrape all teams in a league. Returns summary dict."""
    league_name = info["name"]
    bbref_id    = info["bbref_id"]
    season      = info["season"]

    print(f"\n{'='*60}")
    print(f"  {code} — {league_name} ({season})")
    print(f"  League page: /register/league.cgi?id={bbref_id}")

    teams = get_team_ids(bbref_id)
    if not teams:
        print(f"  [WARN] No teams found for {code}")
        return {"code": code, "teams": 0, "batters": 0, "pitchers": 0}

    print(f"  Found {len(teams)} teams")
    time.sleep(SLEEP_LEAGUE)

    total_bat = 0
    total_pit = 0

    for i, (team_name, team_id) in enumerate(teams, 1):
        bat, pit = scrape_team(conn, code, season, team_name, team_id)
        total_bat += bat
        total_pit += pit
        print(f"    {i:2}/{len(teams)} {team_name:<35} {bat:3}b  {pit:3}p")
        if i < len(teams):
            time.sleep(SLEEP_TEAM)

    return {
        "code":     code,
        "name":     league_name,
        "season":   season,
        "teams":    len(teams),
        "batters":  total_bat,
        "pitchers": total_pit,
    }


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Scrape BBRef international baseball stats")
    parser.add_argument("--league",  help="Single league code (LIDOM|LVBP|LMP|PRWL|NPB-C|NPB-P|KBO)")
    parser.add_argument("--list",    action="store_true", help="List available leagues and exit")
    args = parser.parse_args()

    if args.list:
        for code, info in LEAGUES.items():
            print(f"  {code:<8} {info['name']} ({info['season']})")
        return

    target_leagues = {}
    if args.league:
        code = args.league.upper()
        if code not in LEAGUES:
            print(f"Unknown league '{code}'. Valid: {', '.join(LEAGUES)}")
            sys.exit(1)
        target_leagues = {code: LEAGUES[code]}
    else:
        target_leagues = LEAGUES

    conn = psycopg.connect(
        host=DB_CONFIG["host"], port=DB_CONFIG["port"],
        dbname=DB_CONFIG["dbname"], row_factory=dict_row, autocommit=False,
    )

    # Create tables
    conn.execute(DDL)
    conn.commit()

    summaries = []
    for code, info in target_leagues.items():
        summary = scrape_league(conn, code, info)
        summaries.append(summary)

    conn.close()

    # ── Final report ────────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print("  FINAL SUMMARY")
    print(f"{'='*60}")
    total_teams   = 0
    total_batters = 0
    total_pitchers = 0
    for s in summaries:
        print(f"  {s['code']:<8} {s.get('name',''):<35} "
              f"{s['teams']:3} teams  "
              f"{s['batters']:4} batters  "
              f"{s['pitchers']:4} pitchers")
        total_teams    += s["teams"]
        total_batters  += s["batters"]
        total_pitchers += s["pitchers"]
    print(f"  {'TOTAL':<8} {'':35} {total_teams:3} teams  "
          f"{total_batters:4} batters  {total_pitchers:4} pitchers")


if __name__ == "__main__":
    main()
