#!/usr/bin/env python3.12
"""
KaNeXT CCCAA Women's Basketball Stats Scraper
Source: cccaasports.org — state + conference leaders pages

Access status (March 2026):
  cccaasports.org         ✅ ACCESSIBLE  (no Cloudflare)
  naiastats.prestosports  ❌ BLOCKED     (Cloudflare JS challenge)
  njcaastats.prestosports ❌ BLOCKED     (Cloudflare JS challenge)
  stats.njcaa.org (hub)   ✅ accessible, but all stat links → blocked subdomain

Data available per leader page: PPG, RPG, FG%, 3P%, FT%, STL(total), AST(total), BLK(total)
SPG/APG/BPG computed from totals / GP.

Tables written:
  wbb_adv_teams   — CCCAA teams (division='cccaa')
  wbb_adv_players — CCCAA players (division='cccaa', ncaa_player_id='cccaa:{slug}')
  wbb_adv_stats   — stats (division='cccaa', season='2025-26')

Usage:
    python3.12 cccaa_wbb_scraper.py
"""
from __future__ import annotations

import re
import time
import math
from typing import Optional

import httpx
import psycopg
from psycopg.rows import dict_row
from bs4 import BeautifulSoup

# ── Config ────────────────────────────────────────────────────────────────────

DB_CONFIG = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}
BASE_URL   = "https://cccaasports.org"
SEASON     = "2025-26"
DIVISION   = "cccaa"
DELAY      = 1.0   # seconds between requests

CONFERENCES = [
    ("Bay Valley",          "Bay_Valley"),
    ("Big 8",               "Big_8"),
    ("Central Valley",      "Central_Valley"),
    ("Coast-North",         "Coast-North"),
    ("Coast-South",         "Coast-South"),
    ("Golden Valley",       "Golden_Valley"),
    ("Inland Empire",       "Inland_Empire_Athletic"),
    ("Orange Empire",       "Orange_Empire"),
    ("Pacific Coast",       "Pacific_Coast_Athletic"),
    ("South Coast-North",   "South_Coast-North"),
    ("South Coast-South",   "South_Coast-South"),
    ("Western State-North", "Western_State-North"),
    ("Western State-South", "Western_State-South"),
]

# (table_index, stat_key, is_total)
# is_total=True → value column is a season total; compute per-game = total/GP
STAT_MAP = [
    (0, "ppg",     False),   # Points per game
    (1, "rpg",     False),   # Rebounds per game
    (2, "fg_pct",  False),   # FG%
    (3, "fg3_pct", False),   # 3PT%
    (4, "ft_pct",  False),   # FT%
    (5, "steals",  True),    # Steals (total)
    (6, "assists", True),    # Assists (total)
    (7, "blocks",  True),    # Blocks (total)
]

# ── DB helpers ────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)


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


def upsert_player(conn, slug: str, full_name: str, team_id: str) -> str:
    ncaa_id = f"cccaa:{slug}"
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO wbb_adv_players
                (ncaa_player_id, full_name, team_id, division)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (ncaa_player_id) DO UPDATE SET
                full_name = EXCLUDED.full_name,
                team_id   = COALESCE(EXCLUDED.team_id, wbb_adv_players.team_id),
                updated_at = now()
            RETURNING id
        """, (ncaa_id, full_name, team_id, DIVISION))
        return str(cur.fetchone()["id"])


def upsert_stats(conn, player_id: str, stats: dict):
    """
    stats keys (all optional):
      games, ppg, rpg, fg_pct, fg3_pct, ft_pct,
      steals, spg, assists, apg, blocks, bpg
    """
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
            stats.get("ppg"),      stats.get("rpg"),
            stats.get("fg_pct"),   stats.get("fg3_pct"),  stats.get("ft_pct"),
            stats.get("steals"),   stats.get("spg"),
            stats.get("assists"),  stats.get("apg"),
            stats.get("blocks"),   stats.get("bpg"),
        ))


# ── Page fetching ─────────────────────────────────────────────────────────────

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
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


def parse_leaders_page(soup: BeautifulSoup, conference: str) -> list[dict]:
    """
    Parse all stat tables on a leaders page.
    Returns list of {slug, name, school, conference, gp, stat_key: value, ...}
    Players are deduplicated by slug; stats are merged if a player appears
    in multiple stat tables.
    """
    tables = soup.find_all("table")
    players: dict[str, dict] = {}   # slug → merged stat dict

    for tbl_idx, stat_key, is_total in STAT_MAP:
        if tbl_idx >= len(tables):
            continue
        tbl = tables[tbl_idx]
        for row in tbl.find_all("tr"):
            # Skip header rows
            if row.find("th"):
                continue

            tds = row.find_all("td")
            if len(tds) < 3:
                continue

            # Parse player cell
            player_cell = tds[0]
            name_a = player_cell.find("a", class_="player-name")
            team_a = player_cell.find("a", class_="player-team")

            if not name_a:
                continue

            full_name = name_a.get_text(strip=True)
            school    = team_a.get_text(strip=True) if team_a else ""

            # Extract player slug from href
            href  = name_a.get("href", "")
            slug_m = re.search(r"/players/([^/?\s]+)", href)
            if not slug_m:
                continue
            slug = slug_m.group(1)

            # Extract team slug from team href
            team_href  = team_a.get("href", "") if team_a else ""
            team_slug_m = re.search(r"/teams/([^/?\s]+)", team_href)
            team_slug = team_slug_m.group(1) if team_slug_m else school.lower().replace(" ", "")

            gp_raw  = tds[1].get_text(strip=True)
            val_raw = tds[2].get_text(strip=True)

            gp  = safe_int(gp_raw)
            val = safe_float(val_raw)

            # Initialize player record if new
            if slug not in players:
                players[slug] = {
                    "slug":       slug,
                    "team_slug":  team_slug,
                    "name":       full_name,
                    "school":     school,
                    "conference": conference,
                    "games":      gp,
                }
            else:
                # Update games if higher (more recent count)
                existing_gp = players[slug].get("games") or 0
                if gp and gp > existing_gp:
                    players[slug]["games"] = gp

            # Store the stat value
            if val is not None:
                if is_total:
                    # Store as integer total
                    players[slug][stat_key] = safe_int(val_raw)
                else:
                    # Store percentages as 0–1 decimal
                    if stat_key in ("fg_pct", "fg3_pct", "ft_pct"):
                        players[slug][stat_key] = round(val / 100.0, 4) if val > 1 else round(val, 4)
                    else:
                        players[slug][stat_key] = round(val, 4)

    return list(players.values())


# ── Main load ─────────────────────────────────────────────────────────────────

def load_cccaa(conn):
    # Master player dict across all pages: slug → merged record
    all_players: dict[str, dict] = {}

    # 1) State leaders page
    print("  Fetching state leaders...")
    state_url = f"{BASE_URL}/sports/wbkb/{SEASON}/leaders"
    soup = fetch_leaders(state_url)
    if soup:
        rows = parse_leaders_page(soup, "State")
        print(f"    → {len(rows)} players from state page")
        for p in rows:
            slug = p["slug"]
            if slug not in all_players:
                all_players[slug] = p
            else:
                all_players[slug].update({k: v for k, v in p.items() if v is not None})

    # 2) Conference leaders pages
    for conf_name, conf_path in CONFERENCES:
        url = f"{BASE_URL}/sports/wbkb/{SEASON}/Conference/{conf_path}/leaders"
        soup = fetch_leaders(url)
        if not soup:
            continue
        rows = parse_leaders_page(soup, conf_name)
        print(f"    {conf_name:<25} → {len(rows)} players")
        for p in rows:
            slug = p["slug"]
            if slug not in all_players:
                all_players[slug] = p
            else:
                # Merge — prefer conference page conference name over "State"
                existing = all_players[slug]
                for k, v in p.items():
                    if v is not None and k != "conference":
                        existing.setdefault(k, v)
                if existing.get("conference") == "State":
                    existing["conference"] = conf_name

    print(f"\n  Total unique players collected: {len(all_players)}")

    # 3) Upsert into DB
    team_id_cache: dict[str, str] = {}   # team_slug → wbb_adv_teams.id
    written = 0

    for slug, p in all_players.items():
        school    = p.get("school", "")
        team_slug = p.get("team_slug", "")
        conference = p.get("conference", "")

        if not school:
            continue

        # Upsert team
        t_key = team_slug or school
        if t_key not in team_id_cache:
            tid = upsert_team(conn, school, conference)
            team_id_cache[t_key] = tid
        team_id = team_id_cache[t_key]

        # Upsert player
        player_id = upsert_player(conn, slug, p["name"], team_id)

        # Build stats dict with per-game derivatives
        gp = p.get("games") or 0
        stats = {"games": p.get("games")}

        # Direct per-game stats
        for key in ("ppg", "rpg", "fg_pct", "fg3_pct", "ft_pct"):
            stats[key] = p.get(key)

        # Totals → compute per-game
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
    cur.execute("SELECT COUNT(DISTINCT t.id) AS teams FROM wbb_adv_teams t WHERE t.division=%s", (DIVISION,))
    teams = cur.fetchone()["teams"]
    cur.execute("SELECT COUNT(*) AS n FROM wbb_adv_players WHERE division=%s", (DIVISION,))
    players = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) AS n FROM wbb_adv_stats WHERE division=%s AND season=%s", (DIVISION, SEASON))
    stat_rows = cur.fetchone()["n"]
    conn.commit()

    # Top scorers sample
    cur.execute("""
        SELECT p.full_name, t.name AS team, s.ppg, s.rpg, s.apg
        FROM wbb_adv_stats s
        JOIN wbb_adv_players p ON p.id = s.player_id
        JOIN wbb_adv_teams   t ON t.id = p.team_id
        WHERE s.division=%s AND s.season=%s AND s.ppg IS NOT NULL
        ORDER BY s.ppg DESC LIMIT 5
    """, (DIVISION, SEASON))
    top = cur.fetchall()
    conn.commit()

    print("\n============================================================")
    print("CCCAA WBB DONE")
    print(f"  Division  : {DIVISION}  Season: {SEASON}")
    print(f"  Teams     : {teams}")
    print(f"  Players   : {players}")
    print(f"  Stat rows : {stat_rows}")
    print()
    print("  Top scorers (sample):")
    for r in top:
        ppg = f"{r['ppg']:.1f}" if r["ppg"] else "—"
        rpg = f"{r['rpg']:.1f}" if r["rpg"] else "—"
        apg = f"{r['apg']:.1f}" if r["apg"] else "—"
        print(f"    {r['full_name']:<22} {r['team']:<22} {ppg} ppg {rpg} rpg {apg} apg")
    print("============================================================")


def main():
    print(f"\n=== CCCAA WBB Scraper (season={SEASON}) ===")
    print(f"  Source: cccaasports.org")
    print(f"  State leaders + {len(CONFERENCES)} conference leaders pages")
    print()

    conn = get_conn()
    try:
        written = load_cccaa(conn)
        print(f"\n  Upserted {written} player rows")
        print_summary(conn)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
