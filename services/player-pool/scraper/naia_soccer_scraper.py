#!/usr/bin/env python3
"""
KaNeXT NAIA Soccer Stats Scraper
Source: Individual school Sidearm Sports athletics sites (229 schools)

Stats page patterns:
  Men:   {base_url}/sports/mens-soccer/stats/2025-26
  Women: {base_url}/sports/womens-soccer/stats/2025-26

Tables parsed (0-indexed on Sidearm stats page):
  Table 1 — season field players: #, Player, GP, GS, MIN, G, A, PTS, SH, SH%, SOG, SOG%
  Table 2 — season goalkeepers:   #, Player, GP, GS, MIN, GA, GAA, SV, SV%, W, L, T

DB tables written:
  njcaa_reg_soccer_teams   — region='naia', sport='msoc' or 'wsoc'
  njcaa_reg_soccer_players — standard player rows
  njcaa_reg_soccer_stats   — gp, gs, min_played, goals, assists, pts, shots, sh_pct, sog, sog_pct
                             (GA/saves/GAA in goals/assists/pts=0 for GKs flagged by position='GK')

Access status (April 2026):
  naiastats.prestosports.com  ❌ Cloudflare-blocked
  Individual Sidearm Sports   ✅ Accessible (no CF challenge)

Usage:
    python3 naia_soccer_scraper.py               # both sports
    python3 naia_soccer_scraper.py --sport msoc  # men only
    python3 naia_soccer_scraper.py --sport wsoc  # women only
    python3 naia_soccer_scraper.py --test 10     # first 10 schools
"""
from __future__ import annotations

import re
import json
import time
import argparse
from pathlib import Path
from typing import Optional

import httpx
import psycopg
from psycopg.rows import dict_row
from bs4 import BeautifulSoup

# ── Config ─────────────────────────────────────────────────────────────────────

DB_CONFIG = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}
SEASON    = "2025-26"
DELAY     = 1.2   # seconds between requests
TIMEOUT   = 20

SCHOOLS_FILE = Path(__file__).parent / "naia_schools.json"

SPORT_PATHS = {
    "msoc": "/sports/mens-soccer/stats/" + SEASON,
    "wsoc": "/sports/womens-soccer/stats/" + SEASON,
}

BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    # No Accept-Encoding — Sidearm Sports returns 0-table lightweight page with br/gzip
}

# ── Parsing helpers ─────────────────────────────────────────────────────────────

def _int(v: str | None) -> Optional[int]:
    if not v or v.strip() in ("-", "", "—"):
        return None
    try:
        return int(str(v).replace(",", "").strip())
    except ValueError:
        return None

def _float(v: str | None) -> Optional[float]:
    if not v or v.strip() in ("-", "", "—"):
        return None
    try:
        return round(float(str(v).strip()), 4)
    except ValueError:
        return None

_SKIP = {"name", "player", "totals", "total", "", "opponent", "opponents",
         "home", "away", "exhibition", "#"}

def _parse_field_table(table) -> list[dict]:
    """Parse field player stats table: #, Player, GP, GS, MIN, G, A, PTS, SH, SH%, SOG, SOG%"""
    rows = table.find_all("tr")
    if not rows:
        return []

    # Find header row (has GP or G column)
    header_idx = 0
    for i, tr in enumerate(rows[:3]):
        cells = [td.get_text(strip=True).upper() for td in tr.find_all(["th", "td"])]
        if "GP" in cells or "G" in cells:
            header_idx = i
            break

    hdrs = [td.get_text(strip=True).upper() for td in rows[header_idx].find_all(["th", "td"])]

    def ci(names: list[str]) -> int:
        for n in names:
            for i, h in enumerate(hdrs):
                if h == n:
                    return i
        return -1

    C_NO   = ci(["#", "NO", "NUM"])
    C_NAME = ci(["PLAYER", "NAME"])
    C_GP   = ci(["GP"])
    C_GS   = ci(["GS"])
    C_MIN  = ci(["MIN"])
    C_G    = ci(["G"])
    C_A    = ci(["A"])
    C_PTS  = ci(["PTS"])
    C_SH   = ci(["SH"])
    C_SHPCT= ci(["SH%"])
    C_SOG  = ci(["SOG"])
    C_SOGPCT= ci(["SOG%"])

    if C_NAME < 0 or C_G < 0:
        return []

    results = []
    for tr in rows[header_idx + 1:]:
        cells = tr.find_all(["td", "th"])
        if len(cells) < 5:
            continue

        def cell(i: int) -> str:
            return " ".join(cells[i].get_text(strip=True).split()) if 0 <= i < len(cells) else ""

        def clean_name(i: int) -> str:
            """Extract name from player cell — prefer <a> tag text to avoid mobile button duplication."""
            if not (0 <= i < len(cells)):
                return ""
            a = cells[i].find("a")
            if a:
                return " ".join(a.get_text(strip=True).split())
            return cell(i)

        name = clean_name(C_NAME)
        if not name or name.lower() in _SKIP:
            continue
        # Skip rows that are just header repeats
        if name.upper() in ("PLAYER", "NAME", "#"):
            continue

        results.append({
            "jersey":  cell(C_NO) or None,
            "name":    name,
            "pos":     None,
            "gp":      _int(cell(C_GP)),
            "gs":      _int(cell(C_GS)),
            "min":     _int(cell(C_MIN)),
            "goals":   _int(cell(C_G)),
            "assists": _int(cell(C_A)),
            "pts":     _int(cell(C_PTS)),
            "shots":   _int(cell(C_SH)),
            "sh_pct":  _float(cell(C_SHPCT)),
            "sog":     _int(cell(C_SOG)),
            "sog_pct": _float(cell(C_SOGPCT)),
            "is_gk":   False,
        })
    return results


def _parse_gk_table(table) -> list[dict]:
    """Parse goalkeeper stats table: #, Player, GP, GS, MIN, GA, GAA, SV, SV%, W, L, T"""
    rows = table.find_all("tr")
    if not rows:
        return []

    header_idx = 0
    for i, tr in enumerate(rows[:3]):
        cells = [td.get_text(strip=True).upper() for td in tr.find_all(["th", "td"])]
        if "GA" in cells or "GAA" in cells:
            header_idx = i
            break

    hdrs = [td.get_text(strip=True).upper() for td in rows[header_idx].find_all(["th", "td"])]

    def ci(names):
        for n in names:
            for i, h in enumerate(hdrs):
                if h == n:
                    return i
        return -1

    C_NO   = ci(["#", "NO"])
    C_NAME = ci(["PLAYER", "NAME"])
    C_GP   = ci(["GP"])
    C_GS   = ci(["GS"])
    C_MIN  = ci(["MIN"])

    if C_NAME < 0:
        return []

    results = []
    for tr in rows[header_idx + 1:]:
        cells = tr.find_all(["td", "th"])
        if len(cells) < 4:
            continue

        def cell(i: int) -> str:
            return " ".join(cells[i].get_text(strip=True).split()) if 0 <= i < len(cells) else ""

        def clean_name(i: int) -> str:
            if not (0 <= i < len(cells)):
                return ""
            a = cells[i].find("a")
            if a:
                return " ".join(a.get_text(strip=True).split())
            return cell(i)

        name = clean_name(C_NAME)
        if not name or name.lower() in _SKIP:
            continue
        if name.upper() in ("PLAYER", "NAME", "#"):
            continue

        results.append({
            "jersey":  cell(C_NO) or None,
            "name":    name,
            "pos":     "GK",
            "gp":      _int(cell(C_GP)),
            "gs":      _int(cell(C_GS)),
            "min":     _int(cell(C_MIN)),
            "goals":   None,
            "assists": None,
            "pts":     None,
            "shots":   None,
            "sh_pct":  None,
            "sog":     None,
            "sog_pct": None,
            "is_gk":   True,
        })
    return results


def parse_soccer_page(html: str) -> list[dict]:
    """
    Parse a Sidearm soccer stats page.
    Returns combined list of field players + GKs.
    """
    soup = BeautifulSoup(html, "html.parser")
    tables = soup.find_all("table")
    if len(tables) < 2:
        return []

    # Table 1 = season field players, Table 2 = season GKs
    # (Table 0 = team record, Tables 3+ = career / game logs)
    field_players = _parse_field_table(tables[1]) if len(tables) > 1 else []
    goalkeepers   = _parse_gk_table(tables[2])    if len(tables) > 2 else []

    return field_players + goalkeepers


# ── HTTP ─────────────────────────────────────────────────────────────────────

def fetch(url: str, retries: int = 2) -> Optional[httpx.Response]:
    for attempt in range(retries):
        try:
            r = httpx.get(url, headers=BROWSER_HEADERS, timeout=TIMEOUT, follow_redirects=True)
            return r
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(5)
    return None


# ── DB helpers ────────────────────────────────────────────────────────────────

def ensure_schema(conn):
    # njcaa_reg_soccer_* tables already exist; min_played column added by migration
    pass


def upsert_team(conn, sport: str, slug: str, name: str, base_url: str) -> int:
    row = conn.execute("""
        INSERT INTO njcaa_reg_soccer_teams (region, sport, slug, name, base_url, season)
        VALUES ('naia', %s, %s, %s, %s, %s)
        ON CONFLICT (region, sport, slug, season) DO UPDATE SET
            name    = COALESCE(EXCLUDED.name, njcaa_reg_soccer_teams.name),
            base_url= EXCLUDED.base_url
        RETURNING id
    """, (sport, slug, name, base_url, SEASON)).fetchone()
    return row["id"]


def upsert_player(conn, team_id: int, p: dict) -> int:
    row = conn.execute("""
        INSERT INTO njcaa_reg_soccer_players (team_id, jersey, full_name, position, class_year)
        VALUES (%s, %s, %s, %s, NULL)
        ON CONFLICT (team_id, full_name) DO UPDATE SET
            jersey   = COALESCE(EXCLUDED.jersey,   njcaa_reg_soccer_players.jersey),
            position = COALESCE(EXCLUDED.position, njcaa_reg_soccer_players.position)
        RETURNING id
    """, (team_id, p.get("jersey"), p["name"], p.get("pos"))).fetchone()
    return row["id"]


def upsert_stats(conn, player_id: int, p: dict):
    conn.execute("""
        INSERT INTO njcaa_reg_soccer_stats (
            player_id, season, gp, gs, min_played, goals, assists, pts,
            shots, sh_pct, sog, sog_pct
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (player_id, season) DO UPDATE SET
            gp         = COALESCE(EXCLUDED.gp,         njcaa_reg_soccer_stats.gp),
            gs         = COALESCE(EXCLUDED.gs,         njcaa_reg_soccer_stats.gs),
            min_played = COALESCE(EXCLUDED.min_played, njcaa_reg_soccer_stats.min_played),
            goals      = COALESCE(EXCLUDED.goals,      njcaa_reg_soccer_stats.goals),
            assists    = COALESCE(EXCLUDED.assists,     njcaa_reg_soccer_stats.assists),
            pts        = COALESCE(EXCLUDED.pts,        njcaa_reg_soccer_stats.pts),
            shots      = COALESCE(EXCLUDED.shots,      njcaa_reg_soccer_stats.shots),
            sh_pct     = COALESCE(EXCLUDED.sh_pct,     njcaa_reg_soccer_stats.sh_pct),
            sog        = COALESCE(EXCLUDED.sog,        njcaa_reg_soccer_stats.sog),
            sog_pct    = COALESCE(EXCLUDED.sog_pct,    njcaa_reg_soccer_stats.sog_pct)
    """, (
        player_id, SEASON,
        p.get("gp"), p.get("gs"), p.get("min"),
        p.get("goals"), p.get("assists"), p.get("pts"),
        p.get("shots"), p.get("sh_pct"), p.get("sog"), p.get("sog_pct"),
    ))


# ── Core scrape ───────────────────────────────────────────────────────────────

def scrape_school(conn, school: dict, sport: str) -> int:
    base = school["url"].rstrip("/")
    slug = school.get("slug") or re.sub(r"[^a-z0-9]", "", school["name"].lower())
    path = SPORT_PATHS[sport]
    url  = base + path

    r = fetch(url)
    if not r or r.status_code != 200 or len(r.content) < 5000:
        return 0

    players = parse_soccer_page(r.text)
    if not players:
        return 0

    team_id = upsert_team(conn, sport, slug, school["name"], base)
    saved = 0
    for p in players:
        if not p.get("name"):
            continue
        player_id = upsert_player(conn, team_id, p)
        upsert_stats(conn, player_id, p)
        saved += 1

    conn.commit()
    return saved


# ── Summary ──────────────────────────────────────────────────────────────────

def print_summary(conn):
    for sport, label in [("msoc", "Men's Soccer"), ("wsoc", "Women's Soccer")]:
        r = conn.execute("""
            SELECT COUNT(DISTINCT t.id) teams, COUNT(DISTINCT p.id) players, COUNT(s.id) stats
            FROM njcaa_reg_soccer_teams t
            JOIN njcaa_reg_soccer_players p ON p.team_id = t.id
            JOIN njcaa_reg_soccer_stats s ON s.player_id = p.id
            WHERE t.region = 'naia' AND t.sport = %s
        """, (sport,)).fetchone()
        print(f"  NAIA {label}: {r['teams']} teams, {r['players']} players, {r['stats']} stat rows")


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="NAIA Soccer Stats Scraper")
    parser.add_argument("--sport", choices=["msoc", "wsoc"], default=None)
    parser.add_argument("--test",  type=int, default=None, help="Only first N schools")
    args = parser.parse_args()

    schools = json.load(open(SCHOOLS_FILE))
    if args.test:
        schools = schools[:args.test]

    sports = [args.sport] if args.sport else ["msoc", "wsoc"]

    print(f"=== NAIA Soccer Scraper ===")
    print(f"  Season : {SEASON}")
    print(f"  Schools: {len(schools)}")
    print(f"  Sports : {', '.join(sports)}")

    with psycopg.connect(
        host=DB_CONFIG["host"], port=DB_CONFIG["port"], dbname=DB_CONFIG["dbname"],
        row_factory=dict_row, autocommit=False,
    ) as conn:
        for sport in sports:
            label = "Men's" if sport == "msoc" else "Women's"
            print(f"\n{'='*60}")
            print(f"  {label} Soccer ({sport})")
            total_schools = 0
            total_players = 0

            for i, school in enumerate(schools):
                n = scrape_school(conn, school, sport)
                if n > 0:
                    total_schools += 1
                    total_players += n
                    print(f"  {total_schools:>3} {school['name']:<40} {n:>3} players")
                if i < len(schools) - 1:
                    time.sleep(DELAY)

            print(f"\n  → {sport}: {total_players} players from {total_schools} schools")

        print()
        print_summary(conn)


if __name__ == "__main__":
    main()
