#!/usr/bin/env python3.12
"""
KaNeXT NJCAA Women's Basketball Stats Scraper
Source: 6 accessible NJCAA regional athletics sites

Access status (April 2026):
  region2athletics.com   ✅ ACCESSIBLE
  region15athletics.com  ✅ ACCESSIBLE
  njcaaregion5.com       ✅ ACCESSIBLE
  njcaaregion14.com      ✅ ACCESSIBLE
  njcaaregion19.com      ✅ ACCESSIBLE
  njcaaregion24.com      ✅ ACCESSIBLE
  njcaastats.prestosports.com  ❌ BLOCKED (Cloudflare)
  {school}.prestosports.com    ❌ BLOCKED (Cloudflare)

Data: each region's leaders page has 8 tables with top 6 players per category.
Categories: PPG, RPG, FG%, 3PT%, FT%, Steals (total), Assists (total), Blocks (total)

Row format varies by region:
  2-col: [player+school, stat_value]           — regions 2, 5, 15, 19, 24
  3-col: [player+school, GP, stat_value]        — region 14

Name format: "X LastNameSchool Name" (initial + last + school glued, no space)
Split strategy: find first lowercase→uppercase boundary after the initial token.

Tables written:
  wbb_adv_teams   — NJCAA teams (division='njcaa')
  wbb_adv_players — NJCAA players (division='njcaa', ncaa_player_id='njcaa:{region}:{slug}')
  wbb_adv_stats   — stats (division='njcaa', season='2025-26')

Usage:
    python3.12 njcaa_wbb_scraper.py [--dry-run]
"""
from __future__ import annotations

import re
import time
import math
import argparse
from typing import Optional

import httpx
import psycopg
from psycopg.rows import dict_row
from bs4 import BeautifulSoup

# ── Config ────────────────────────────────────────────────────────────────────

DB_CONFIG = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}
SEASON    = "2025-26"
DIVISION  = "njcaa"
DELAY     = 0.8  # seconds between requests

REGIONS = [
    ("r2",  "Region 2",  "https://region2athletics.com"),
    ("r5",  "Region 5",  "https://njcaaregion5.com"),
    ("r14", "Region 14", "https://njcaaregion14.com"),
    ("r15", "Region 15", "https://region15athletics.com"),
    ("r19", "Region 19", "https://njcaaregion19.com"),
    ("r24", "Region 24", "https://njcaaregion24.com"),
]

# (table_index, stat_key, is_total)
STAT_MAP = [
    (0, "ppg",     False),
    (1, "rpg",     False),
    (2, "fg_pct",  False),
    (3, "fg3_pct", False),
    (4, "ft_pct",  False),
    (5, "steals",  True),
    (6, "assists", True),
    (7, "blocks",  True),
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def safe_float(v) -> Optional[float]:
    if v is None:
        return None
    if isinstance(v, float) and math.isnan(v):
        return None
    try:
        s = str(v).replace("%", "").strip()
        return float(s) if s else None
    except (ValueError, TypeError):
        return None


def safe_int(v) -> Optional[int]:
    f = safe_float(v)
    return int(round(f)) if f is not None else None


def slugify(s: str) -> str:
    """Lowercase, strip non-alphanumeric, collapse spaces to hyphens."""
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"\s+", "-", s)
    return s


def split_player_school(raw: str) -> tuple[str, str]:
    """
    Split a glued "X LastNameSchool Name" string into (player_name, school).

    Strategy:
      1. Split on first space to isolate the initial: "X" + "LastNameSchool..."
      2. In the remainder, find the first lowercase→uppercase transition.
      3. Split there: prefix = last_name, suffix = school.

    Examples:
      "S BellWestchester Community College" → ("S Bell", "Westchester Community College")
      "A McGregorClarendon College"          → ("A McGregor", "Clarendon College")
      "D GeorgeRockland Community College"  → ("D George", "Rockland Community College")
    """
    raw = raw.strip()
    parts = raw.split(" ", 1)
    if len(parts) < 2:
        return raw, ""

    initial = parts[0]
    rest    = parts[1]  # "BellWestchester Community College"

    # Find first [a-z][A-Z] boundary
    m = re.search(r"(?<=[a-z])(?=[A-Z])", rest)
    if m:
        last_name = rest[: m.start()]
        school    = rest[m.start() :]
        return f"{initial} {last_name}", school

    # No boundary — might be just a school name or single token
    return raw, ""


# ── DB helpers ────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)


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


def upsert_player(conn, ncaa_id: str, full_name: str, team_id: str) -> str:
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
        """, (ncaa_id, full_name, team_id, DIVISION))
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


# ── Page fetching ─────────────────────────────────────────────────────────────

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,*/*",
}


def fetch_leaders(url: str) -> Optional[BeautifulSoup]:
    try:
        r = httpx.get(url, headers=HEADERS, timeout=20, follow_redirects=True)
        time.sleep(DELAY)
        if r.status_code == 200 and "Just a moment" not in r.text:
            return BeautifulSoup(r.text, "html.parser")
        print(f"    [warn] {r.status_code} {url}")
        return None
    except Exception as e:
        print(f"    [error] {url}: {e}")
        return None


def parse_leaders_page(soup: BeautifulSoup, region_code: str, region_name: str) -> list[dict]:
    """
    Parse the 8-table leaders page for one NJCAA region.

    Row formats:
      2-col: [player+school, stat_value]
      3-col: [player+school, GP, stat_value]

    Returns list of merged player dicts keyed by (region_code, player_slug).
    """
    tables = soup.find_all("table")
    # key: (name_slug, school_slug)  →  merged stat dict
    players: dict[tuple, dict] = {}

    for tbl_idx, stat_key, is_total in STAT_MAP:
        if tbl_idx >= len(tables):
            continue
        tbl = tables[tbl_idx]

        for row in tbl.find_all("tr"):
            if row.find("th"):
                continue  # skip header

            tds = row.find_all("td")
            if len(tds) < 2:
                continue

            raw_cell = tds[0].get_text(strip=True)
            player_name, school = split_player_school(raw_cell)

            if not school or not player_name:
                continue

            # 2-col vs 3-col
            if len(tds) == 2:
                gp_raw  = None
                val_raw = tds[1].get_text(strip=True)
            else:
                gp_raw  = tds[1].get_text(strip=True)
                val_raw = tds[2].get_text(strip=True)

            gp  = safe_int(gp_raw) if gp_raw else None
            val = safe_float(val_raw)
            if val is None:
                continue

            name_slug   = slugify(player_name)
            school_slug = slugify(school)
            key         = (name_slug, school_slug)

            if key not in players:
                players[key] = {
                    "region_code": region_code,
                    "region_name": region_name,
                    "name":        player_name,
                    "school":      school,
                    "name_slug":   name_slug,
                    "school_slug": school_slug,
                    "games":       gp,
                }
            else:
                # Update GP if we now have a higher count
                if gp and (not players[key]["games"] or gp > players[key]["games"]):
                    players[key]["games"] = gp

            # Store stat value
            if is_total:
                players[key][stat_key] = safe_int(val_raw)
            else:
                if stat_key in ("fg_pct", "fg3_pct", "ft_pct"):
                    players[key][stat_key] = round(val / 100.0, 4) if val > 1 else round(val, 4)
                else:
                    players[key][stat_key] = round(val, 4)

    return list(players.values())


# ── Main ──────────────────────────────────────────────────────────────────────

def load_njcaa(conn, dry_run: bool = False) -> int:
    # Accumulate across all regions: (region_code, name_slug, school_slug) → merged dict
    all_players: dict[tuple, dict] = {}

    for region_code, region_name, base_url in REGIONS:
        url  = f"{base_url}/sports/wbkb/{SEASON}/leaders"
        soup = fetch_leaders(url)
        if not soup:
            print(f"  [{region_name}] SKIPPED (no page)")
            continue

        rows = parse_leaders_page(soup, region_code, region_name)
        print(f"  [{region_name}] {len(rows)} unique players")

        for p in rows:
            key = (p["region_code"], p["name_slug"], p["school_slug"])
            if key not in all_players:
                all_players[key] = p
            else:
                # Merge any newly discovered stats
                for k, v in p.items():
                    if v is not None:
                        all_players[key].setdefault(k, v)

    total_collected = len(all_players)
    print(f"\n  Total unique players across all regions: {total_collected}")

    if dry_run:
        print("  [dry-run] Skipping DB writes.")
        # Print sample
        sample = list(all_players.values())[:5]
        for p in sample:
            print(f"    {p['name']:<22} {p['school']:<35} ppg={p.get('ppg')} rpg={p.get('rpg')} fg={p.get('fg_pct')}")
        return total_collected

    # Upsert to DB
    team_id_cache: dict[str, str] = {}
    written = 0

    for p in all_players.values():
        school      = p["school"]
        region_name = p["region_name"]
        region_code = p["region_code"]
        name        = p["name"]
        name_slug   = p["name_slug"]
        school_slug = p["school_slug"]

        # Upsert team (keyed by school name within njcaa division)
        t_key = school_slug
        if t_key not in team_id_cache:
            tid = upsert_team(conn, school, region_name)
            team_id_cache[t_key] = tid
        team_id = team_id_cache[t_key]

        # Unique player ID: njcaa:{region}:{name_slug}:{school_slug}
        ncaa_id   = f"njcaa:{region_code}:{name_slug}:{school_slug}"
        player_id = upsert_player(conn, ncaa_id, name, team_id)

        # Build stats
        gp = p.get("games") or 0
        stats = {"games": p.get("games")}

        for key in ("ppg", "rpg", "fg_pct", "fg3_pct", "ft_pct"):
            stats[key] = p.get(key)

        steals  = p.get("steals")
        assists = p.get("assists")
        blocks  = p.get("blocks")
        stats["steals"]  = steals
        stats["assists"] = assists
        stats["blocks"]  = blocks
        stats["spg"]  = round(steals  / gp, 4) if steals  and gp > 0 else None
        stats["apg"]  = round(assists / gp, 4) if assists and gp > 0 else None
        stats["bpg"]  = round(blocks  / gp, 4) if blocks  and gp > 0 else None

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
    stat_rows = cur.fetchone()["n"]
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

    print("\n============================================================")
    print("NJCAA WBB DONE")
    print(f"  Division  : {DIVISION}  Season: {SEASON}")
    print(f"  Regions   : {len(REGIONS)}")
    print(f"  Teams     : {teams}")
    print(f"  Players   : {players}")
    print(f"  Stat rows : {stat_rows}")
    print()
    print("  Top scorers:")
    for r in top:
        ppg = f"{r['ppg']:.1f}" if r["ppg"] else "—"
        rpg = f"{r['rpg']:.1f}" if r["rpg"] else "—"
        apg = f"{r['apg']:.1f}" if r["apg"] else "—"
        print(f"    {r['full_name']:<22} {r['team']:<30} {ppg} ppg {rpg} rpg {apg} apg")
    print("============================================================")


def main():
    parser = argparse.ArgumentParser(description="NJCAA WBB scraper")
    parser.add_argument("--dry-run", action="store_true", help="Parse only, skip DB writes")
    args = parser.parse_args()

    print(f"\n=== NJCAA WBB Scraper (season={SEASON}) ===")
    print(f"  Regions: {len(REGIONS)}")
    print()

    conn = get_conn()
    try:
        written = load_njcaa(conn, dry_run=args.dry_run)
        if not args.dry_run:
            print(f"\n  Upserted {written} player rows")
            print_summary(conn)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
