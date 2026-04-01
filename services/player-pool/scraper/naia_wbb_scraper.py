#!/usr/bin/env python3.12
"""
KaNeXT NAIA Women's Basketball Stats Scraper
Source: Individual school Sidearm Sports athletics sites

229 NAIA schools discovered from naia.college-tour.com (March 2026).
School list lives in naia_schools.json alongside this file.

Stats page pattern: {base_url}/sports/womens-basketball/stats/2025-26

Tables parsed (0-indexed):
  Table 3 — shooting totals: #, Player, GP, GS, MIN, FGM, FGA, FG%, 3PT, 3PTA, 3PT%, FTM, FTA, FT%, PTS, AVG
  Table 4 — per-game rates:  #, Player, GP, MIN, FG%, 3PT%, FT%, OREB, DREB, REB, AST, STL, BLK, PTS, Total, OPP

Access status (March 2026):
  naiastats.prestosports.com   ❌ Cloudflare-blocked
  Individual PrestoSports subdomains ❌ Cloudflare-blocked
  Sidearm Sports custom domains ✅ Accessible (no CF challenge)

DB tables written:
  wbb_adv_teams   — NAIA teams (division='naia')
  wbb_adv_players — NAIA players (ncaa_player_id='naia:{school_slug}-{name_slug}')
  wbb_adv_stats   — stats (division='naia', season='2025-26')

Usage:
    python3.12 naia_wbb_scraper.py            # full run
    python3.12 naia_wbb_scraper.py --dry-run  # just probe URLs, no DB writes
    python3.12 naia_wbb_scraper.py --test 10  # first 10 schools only
"""
from __future__ import annotations

import re
import json
import time
import math
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
DIVISION  = "naia"
DELAY     = 1.5   # seconds between requests
TIMEOUT   = 20    # request timeout

STATS_PATH = f"/sports/womens-basketball/stats/{SEASON}"

# School list (229 NAIA schools, from naia.college-tour.com)
_SCHOOLS_FILE = Path(__file__).parent / "naia_schools.json"


# ── DB helpers ─────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)


def safe_float(v) -> Optional[float]:
    if v is None:
        return None
    if isinstance(v, float) and math.isnan(v):
        return None
    try:
        s = str(v).replace("%", "").replace(",", "").strip()
        return float(s) if s and s not in ("-", "—", ".") else None
    except (ValueError, TypeError):
        return None


def safe_int(v) -> Optional[int]:
    f = safe_float(v)
    return int(round(f)) if f is not None else None


def safe_pct(v) -> Optional[float]:
    """Parse a percentage value (could be .433 or 43.3 or .433)."""
    f = safe_float(v)
    if f is None:
        return None
    # Sidearm shows FG% as 0–1 decimal (e.g., .433)
    return round(f, 4)


def upsert_team(conn, name: str, conference: str) -> str:
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO wbb_adv_teams (name, conference, division)
            VALUES (%s, %s, %s)
            ON CONFLICT (name, division) DO UPDATE SET
                conference = COALESCE(EXCLUDED.conference, wbb_adv_teams.conference)
            RETURNING id
        """, (name, conference, DIVISION))
        return str(cur.fetchone()["id"])


def upsert_player(conn, naia_id: str, full_name: str, team_id: str) -> str:
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO wbb_adv_players
                (ncaa_player_id, full_name, team_id, division)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (ncaa_player_id) DO UPDATE SET
                full_name  = EXCLUDED.full_name,
                team_id    = COALESCE(EXCLUDED.team_id, wbb_adv_players.team_id),
                updated_at = now()
            RETURNING id
        """, (naia_id, full_name, team_id, DIVISION))
        return str(cur.fetchone()["id"])


def upsert_stats(conn, player_id: str, stats: dict):
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO wbb_adv_stats (
                player_id, division, season,
                games,
                ppg, rpg,
                fg_pct, fg3_pct, ft_pct,
                steals, spg,
                assists, apg,
                blocks, bpg
            ) VALUES (
                %s, %s, %s,
                %s,
                %s, %s,
                %s, %s, %s,
                %s, %s,
                %s, %s,
                %s, %s
            )
            ON CONFLICT (player_id, division, season) DO UPDATE SET
                games    = COALESCE(EXCLUDED.games,    wbb_adv_stats.games),
                ppg      = COALESCE(EXCLUDED.ppg,      wbb_adv_stats.ppg),
                rpg      = COALESCE(EXCLUDED.rpg,      wbb_adv_stats.rpg),
                fg_pct   = COALESCE(EXCLUDED.fg_pct,   wbb_adv_stats.fg_pct),
                fg3_pct  = COALESCE(EXCLUDED.fg3_pct,  wbb_adv_stats.fg3_pct),
                ft_pct   = COALESCE(EXCLUDED.ft_pct,   wbb_adv_stats.ft_pct),
                steals   = COALESCE(EXCLUDED.steals,   wbb_adv_stats.steals),
                spg      = COALESCE(EXCLUDED.spg,      wbb_adv_stats.spg),
                assists  = COALESCE(EXCLUDED.assists,  wbb_adv_stats.assists),
                apg      = COALESCE(EXCLUDED.apg,      wbb_adv_stats.apg),
                blocks   = COALESCE(EXCLUDED.blocks,   wbb_adv_stats.blocks),
                bpg      = COALESCE(EXCLUDED.bpg,      wbb_adv_stats.bpg),
                updated_at = now()
        """, (
            player_id, DIVISION, SEASON,
            stats.get("games"),
            stats.get("ppg"),     stats.get("rpg"),
            stats.get("fg_pct"),  stats.get("fg3_pct"), stats.get("ft_pct"),
            stats.get("steals"),  stats.get("spg"),
            stats.get("assists"), stats.get("apg"),
            stats.get("blocks"),  stats.get("bpg"),
        ))


# ── Parsing helpers ────────────────────────────────────────────────────────────

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept": "text/html,*/*",
}


def fetch_page(url: str) -> Optional[BeautifulSoup]:
    try:
        r = httpx.get(url, headers=HEADERS, timeout=TIMEOUT, follow_redirects=True)
        time.sleep(DELAY)
        if r.status_code == 200 and "Just a moment" not in r.text:
            return BeautifulSoup(r.text, "html.parser")
        return None
    except Exception:
        time.sleep(DELAY)
        return None


def clean_player_name(raw: str, jersey: str) -> Optional[str]:
    """
    Sidearm player cells duplicate the name with jersey# in between:
      'Rainey, Kalea11Rainey, Kalea' (jersey='11')
    Strip the duplication, then flip 'Last, First' → 'First Last'.
    """
    raw = raw.strip()
    # Strip jersey# duplication
    if jersey and jersey in raw:
        idx = raw.find(jersey)
        if idx > 0:
            raw = raw[:idx].strip()
    # Skip totals/team rows
    if re.match(r'^(Team|Totals?|Opponents?)$', raw, re.I):
        return None
    # Convert "Last, First" → "First Last"
    if "," in raw:
        parts = raw.split(",", 1)
        return f"{parts[1].strip()} {parts[0].strip()}"
    return raw


def make_naia_id(school_slug: str, name: str) -> str:
    """Build unique player ID: naia:{school_slug}-{name_slug}"""
    name_slug = re.sub(r"[^a-z0-9]", "", name.lower())
    return f"naia:{school_slug}-{name_slug}"


def extract_school_name_from_page(soup: BeautifulSoup) -> Optional[str]:
    """
    Extract school name from Sidearm stats page.
    Strategy 1: Page title  "..Stats - {School} Athletics"
    Strategy 2: Table 0 col-1 header "Florida Memorial (Fla.)"
    """
    # Strategy 1: page title
    if soup.title:
        title = soup.title.get_text(strip=True)
        # "2025-26 Women's Basketball Cumulative Statistics - Florida Memorial University Athletics"
        m = re.search(r" - (.+?) Athletics$", title)
        if m:
            return m.group(1).strip()
        # "Statistics - School Name"
        m2 = re.search(r"Statistics\s*[-–]\s*(.+)$", title)
        if m2:
            return m2.group(1).strip()

    # Strategy 2: Table 0, column 1 header
    tables = soup.find_all("table")
    if tables:
        ths = [th.get_text(strip=True) for th in tables[0].find_all("th")]
        if len(ths) >= 2:
            name = ths[1].replace("OPP", "").strip()
            name = re.sub(r"\s*\([A-Z][a-z]+\.\)$", "", name).strip()
            if name and name not in ("Statistic", "Opponents"):
                return name
    return None


def parse_stats_page(soup: BeautifulSoup, school_name: str,
                     conference: str, school_slug: str) -> list[dict]:
    """
    Parse Sidearm WBB season stats page.
    Returns list of player dicts with merged stats from Table 3 & Table 4.
    Also attempts to extract the real school name from Table 0.
    """
    tables = soup.find_all("table")
    if len(tables) < 5:
        return []

    # Try to get real school name from Table 0 header
    page_school_name = extract_school_name_from_page(soup)
    if page_school_name:
        school_name = page_school_name

    # Validate table headers before trusting table positions
    def get_hdrs(tbl):
        return {th.get_text(strip=True) for th in tbl.find_all("th")}

    # Find table with FGM/FGA (Table 3 equivalent)
    tbl_shoot = None
    tbl_pg = None
    for i, tbl in enumerate(tables):
        h = get_hdrs(tbl)
        if "FGM" in h and "FGA" in h and "3PT" in h:
            tbl_shoot = tbl
        if "OREB" in h and "DREB" in h and "AST" in h and "STL" in h:
            tbl_pg = tbl

    if not tbl_shoot and not tbl_pg:
        return []

    def parse_rows(tbl, col_map: dict) -> dict[str, dict]:
        """Parse table rows. col_map: {col_index: stat_key}"""
        players = {}
        for row in tbl.find_all("tr"):
            cells = [td.get_text(strip=True) for td in row.find_all("td")]
            if len(cells) < 3:
                continue
            jersey = cells[0].strip()
            raw_name = cells[1].strip()
            name = clean_player_name(raw_name, jersey)
            if not name:
                continue
            stats = {"name": name}
            for idx, key in col_map.items():
                if idx < len(cells):
                    stats[key] = cells[idx].strip()
            players[name] = stats
        return players

    # Column indices for shooting table
    # #(0), Player(1), GP(2), GS(3), MIN(4), FGM(5), FGA(6), FG%(7),
    # 3PT(8), 3PTA(9), 3PT%(10), FTM(11), FTA(12), FT%(13), PTS(14), AVG(15)
    SHOOT_COLS = {
        2: "_gp",
        7: "fg_pct",
        10: "fg3_pct",
        13: "ft_pct",
        15: "ppg",
    }

    # Column indices for per-game table
    # #(0), Player(1), GP(2), MIN(3), FG%(4), 3PT%(5), FT%(6),
    # OREB(7), DREB(8), REB(9), AST(10), STL(11), BLK(12), PTS(13)
    PG_COLS = {
        2: "_gp",
        9: "rpg",
        10: "apg",
        11: "spg",
        12: "bpg",
        13: "_ppg2",   # cross-check
    }

    players_s = parse_rows(tbl_shoot, SHOOT_COLS) if tbl_shoot else {}
    players_p = parse_rows(tbl_pg, PG_COLS) if tbl_pg else {}

    all_names = set(players_s) | set(players_p)
    results = []

    for name in all_names:
        rec: dict = {
            "name": name,
            "school": school_name,
            "conference": conference,
            "school_slug": school_slug,
        }

        # Merge shoot table stats
        if name in players_s:
            s = players_s[name]
            gp = safe_int(s.get("_gp"))
            rec["games"]   = gp
            rec["fg_pct"]  = safe_pct(s.get("fg_pct"))
            rec["fg3_pct"] = safe_pct(s.get("fg3_pct"))
            rec["ft_pct"]  = safe_pct(s.get("ft_pct"))
            rec["ppg"]     = safe_float(s.get("ppg"))

        # Merge per-game table stats
        if name in players_p:
            p = players_p[name]
            gp2 = safe_int(p.get("_gp"))
            if gp2 and not rec.get("games"):
                rec["games"] = gp2
            rec["rpg"] = safe_float(p.get("rpg"))
            rec["apg"] = safe_float(p.get("apg"))
            rec["spg"] = safe_float(p.get("spg"))
            rec["bpg"] = safe_float(p.get("bpg"))
            # Use PPG from per-game table if shoot table didn't have it
            ppg2 = safe_float(p.get("_ppg2"))
            if ppg2 and not rec.get("ppg"):
                rec["ppg"] = ppg2

        # Compute totals from per-game × games
        gp = rec.get("games") or 0
        if gp > 0:
            spg = rec.get("spg")
            apg = rec.get("apg")
            bpg = rec.get("bpg")
            rec["steals"]  = safe_int(spg * gp) if spg is not None else None
            rec["assists"] = safe_int(apg * gp) if apg is not None else None
            rec["blocks"]  = safe_int(bpg * gp) if bpg is not None else None

        results.append(rec)

    return results


# ── Main load ──────────────────────────────────────────────────────────────────

def load_school(conn, school: dict, dry_run: bool) -> int:
    """Scrape one school and write to DB. Returns player count."""
    name = school["name"]
    slug = school["slug"]
    conf = school["conference"]
    base_url = school["url"]

    stats_url = base_url + STATS_PATH

    soup = fetch_page(stats_url)
    if soup is None:
        return 0  # No WBB program or blocked

    players = parse_stats_page(soup, name, conf, slug)
    if not players:
        return 0

    # Use real school name extracted from page (players[0]["school"] was set by parse_stats_page)
    real_name = players[0].get("school") or name

    if dry_run:
        return len(players)

    # Upsert team once per school (use real name extracted from page)
    team_id = upsert_team(conn, real_name, conf)

    written = 0
    for p in players:
        naia_id = make_naia_id(slug, p["name"])
        player_id = upsert_player(conn, naia_id, p["name"], team_id)

        stats = {
            "games":   p.get("games"),
            "ppg":     p.get("ppg"),
            "rpg":     p.get("rpg"),
            "fg_pct":  p.get("fg_pct"),
            "fg3_pct": p.get("fg3_pct"),
            "ft_pct":  p.get("ft_pct"),
            "steals":  p.get("steals"),
            "spg":     p.get("spg"),
            "assists": p.get("assists"),
            "apg":     p.get("apg"),
            "blocks":  p.get("blocks"),
            "bpg":     p.get("bpg"),
        }
        upsert_stats(conn, player_id, stats)
        written += 1

    conn.commit()
    return written


def print_summary(conn):
    cur = conn.cursor()
    cur.execute("SELECT COUNT(DISTINCT id) AS n FROM wbb_adv_teams WHERE division=%s", (DIVISION,))
    teams = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) AS n FROM wbb_adv_players WHERE division=%s", (DIVISION,))
    players = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) AS n FROM wbb_adv_stats WHERE division=%s AND season=%s", (DIVISION, SEASON))
    stats = cur.fetchone()["n"]
    conn.commit()

    cur.execute("""
        SELECT p.full_name, t.name AS team, s.ppg, s.rpg, s.apg
        FROM wbb_adv_stats s
        JOIN wbb_adv_players p ON p.id = s.player_id
        JOIN wbb_adv_teams   t ON t.id = p.team_id
        WHERE s.division=%s AND s.season=%s AND s.ppg IS NOT NULL
        ORDER BY s.ppg DESC LIMIT 8
    """, (DIVISION, SEASON))
    top = cur.fetchall()
    conn.commit()

    print("\n" + "=" * 62)
    print("NAIA WBB DONE")
    print(f"  Division  : {DIVISION}  Season: {SEASON}")
    print(f"  Teams     : {teams}")
    print(f"  Players   : {players}")
    print(f"  Stat rows : {stats}")
    print()
    print("  Top scorers:")
    for r in top:
        ppg = f"{r['ppg']:.1f}" if r["ppg"] else "—"
        rpg = f"{r['rpg']:.1f}" if r["rpg"] else "—"
        apg = f"{r['apg']:.1f}" if r["apg"] else "—"
        print(f"    {r['full_name']:<24} {r['team']:<24} {ppg} ppg {rpg} rpg {apg} apg")
    print("=" * 62)


def main():
    parser = argparse.ArgumentParser(description="NAIA WBB Sidearm stats scraper")
    parser.add_argument("--dry-run", action="store_true", help="Probe URLs only, no DB writes")
    parser.add_argument("--test", type=int, default=0, metavar="N", help="Only scrape first N schools")
    parser.add_argument("--conference", type=str, default="", help="Only scrape schools in this conference")
    args = parser.parse_args()

    # Load school list
    with open(_SCHOOLS_FILE) as f:
        schools = json.load(f)

    if args.conference:
        schools = [s for s in schools if args.conference.lower() in s["conference"].lower()]
        print(f"  Filtered to conference '{args.conference}': {len(schools)} schools")

    if args.test:
        schools = schools[:args.test]

    print(f"\n=== NAIA WBB Scraper (season={SEASON}, dry_run={args.dry_run}) ===")
    print(f"  Schools to probe: {len(schools)}")
    print()

    conn = None if args.dry_run else get_conn()

    try:
        total_schools = 0
        total_players = 0
        no_wbb = 0

        for i, school in enumerate(schools):
            n = load_school(conn, school, args.dry_run)
            if n > 0:
                total_schools += 1
                total_players += n
                print(f"  [{i+1:3d}/{len(schools)}] {school['name']:<35} → {n} players")
            else:
                no_wbb += 1

            if (i + 1) % 25 == 0:
                print(f"  --- progress: {total_schools} schools with WBB, {total_players} players, {no_wbb} skipped ---")

        print(f"\n  Done: {total_schools} schools had WBB, {total_players} players, {no_wbb} without WBB/stats")

        if conn and not args.dry_run:
            print_summary(conn)

    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    main()
