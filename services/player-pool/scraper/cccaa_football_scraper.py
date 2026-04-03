#!/usr/bin/env python3.12
"""
KaNeXT CCCAA Football Stats Scraper
Source: cccaasports.org — state + conference leaders pages

Access status (April 2026):
  cccaasports.org  ✅ ACCESSIBLE (AWS WAF intermittent, passes with browser headers)

Sport code: fball   Season: 2024-25 (fall sport)
URL pattern: https://cccaasports.org/sports/fball/2024-25/leaders  (state page only)

Note: CCCAA football does NOT have per-conference leaders pages (unlike WBB).
Only the state leaders page exists — 37 tables × 6 players = up to ~99 unique players.

Data: 37 stat tables — passing, rushing, receiving, defense, kicking.
Each table shows 6 players. Player cell uses class="player-name" / "player-team" links.
3-column rows: [player+school cell, GP, stat_value]

Tables written:
  cccaa_fb_teams   — CCCAA football teams
  cccaa_fb_players — CCCAA football players
  cccaa_fb_stats   — per-player stat rows (season=2024-25)

Usage:
    python3.12 cccaa_football_scraper.py
    python3.12 cccaa_football_scraper.py --dry-run
"""
from __future__ import annotations

import argparse
import math
import re
import time
from typing import Optional

import httpx
import psycopg
from bs4 import BeautifulSoup
from psycopg.rows import dict_row

# ── Config ────────────────────────────────────────────────────────────────────

DB_CONFIG  = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}
BASE_URL   = "https://cccaasports.org"
SPORT      = "fball"
SEASON     = "2024-25"
DELAY      = 1.2

# (table_index, stat_key, is_total)
# is_total=True  → integer season total
# is_total=False → float per-game/rate (PCT_FIELDS get normalized 0-100 → 0-1)
STAT_MAP = [
    # Passing (tables 0-9; table 6 is duplicate of 0 — skipped)
    (0,  "pass_ypg",    False),
    (1,  "pass_tds",    True),
    (2,  "completions", True),
    (3,  "comp_pct",    False),
    (4,  "pass_att",    True),
    (5,  "pass_yds",    True),
    (7,  "pass_ya",     False),
    (8,  "pass_int",    True),
    (9,  "pass_effic",  False),
    # Rushing (tables 10-14)
    (10, "rush_att",    True),
    (11, "rush_yds",    True),
    (12, "rush_ypg",    False),
    (13, "rush_avg",    False),
    (14, "rush_tds",    True),
    # Receiving (tables 15-19)
    (15, "receptions",  True),
    (16, "rec_yds",     True),
    (17, "rec_ypg",     False),
    (18, "rec_avg",     False),
    (19, "rec_tds",     True),
    # Defense (tables 20-28)
    (20, "solo_tkl",    True),
    (21, "asst_tkl",    True),
    (22, "total_tkl",   True),
    (23, "tkl_pg",      False),
    (24, "tfl",         False),   # 0.5-increment floats
    (25, "sacks",       False),   # 0.5-increment floats
    (26, "sack_yds",    True),
    (27, "fumble_rec",  True),
    (28, "def_int",     True),
    # Kicking (tables 29-36)
    (29, "fgm",         True),
    (30, "fga",         True),
    (31, "fg_pct",      False),
    (32, "fg_long",     True),
    (33, "xpm",         True),
    (34, "xpa",         True),
    (35, "xp_pct",      False),
    (36, "points",      True),
]

PCT_FIELDS = {"comp_pct", "fg_pct", "xp_pct"}

# ── DB ────────────────────────────────────────────────────────────────────────

CREATE_SQL = """
CREATE TABLE IF NOT EXISTS cccaa_fb_teams (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,
    slug       TEXT,
    conference TEXT,
    season     TEXT NOT NULL DEFAULT '2024-25',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (name, season)
);

CREATE TABLE IF NOT EXISTS cccaa_fb_players (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_key TEXT NOT NULL UNIQUE,
    full_name  TEXT NOT NULL,
    team_id    UUID REFERENCES cccaa_fb_teams(id),
    season     TEXT NOT NULL DEFAULT '2024-25',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cccaa_fb_stats (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id  UUID REFERENCES cccaa_fb_players(id),
    season     TEXT NOT NULL DEFAULT '2024-25',
    games      INT,
    -- Passing
    pass_ypg   FLOAT, pass_tds INT, completions INT, comp_pct FLOAT,
    pass_att   INT,   pass_yds INT, pass_ya FLOAT, pass_int INT, pass_effic FLOAT,
    -- Rushing
    rush_att   INT, rush_yds INT, rush_ypg FLOAT, rush_avg FLOAT, rush_tds INT,
    -- Receiving
    receptions INT, rec_yds INT, rec_ypg FLOAT, rec_avg FLOAT, rec_tds INT,
    -- Defense
    solo_tkl   INT, asst_tkl INT, total_tkl INT, tkl_pg FLOAT,
    tfl        FLOAT, sacks FLOAT, sack_yds INT, fumble_rec INT, def_int INT,
    -- Kicking
    fgm INT, fga INT, fg_pct FLOAT, fg_long INT,
    xpm INT, xpa INT, xp_pct FLOAT, points INT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (player_id, season)
);
"""


def get_conn():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)


def ensure_tables(conn):
    conn.execute(CREATE_SQL)
    conn.commit()


def upsert_team(conn, name: str, slug: str, conference: str) -> str:
    with conn.transaction():
        row = conn.execute("""
            INSERT INTO cccaa_fb_teams (name, slug, conference, season)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (name, season) DO UPDATE SET
                slug       = COALESCE(EXCLUDED.slug,       cccaa_fb_teams.slug),
                conference = COALESCE(EXCLUDED.conference, cccaa_fb_teams.conference)
            RETURNING id
        """, (name, slug or None, conference or None, SEASON)).fetchone()
    return str(row["id"])


def upsert_player(conn, player_key: str, full_name: str, team_id: str) -> str:
    with conn.transaction():
        row = conn.execute("""
            INSERT INTO cccaa_fb_players (player_key, full_name, team_id, season)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (player_key) DO UPDATE SET
                full_name  = EXCLUDED.full_name,
                team_id    = COALESCE(EXCLUDED.team_id, cccaa_fb_players.team_id),
                updated_at = now()
            RETURNING id
        """, (player_key, full_name, team_id, SEASON)).fetchone()
    return str(row["id"])


def upsert_stats(conn, player_id: str, s: dict):
    with conn.transaction():
        conn.execute("""
            INSERT INTO cccaa_fb_stats (
                player_id, season, games,
                pass_ypg, pass_tds, completions, comp_pct,
                pass_att, pass_yds, pass_ya, pass_int, pass_effic,
                rush_att, rush_yds, rush_ypg, rush_avg, rush_tds,
                receptions, rec_yds, rec_ypg, rec_avg, rec_tds,
                solo_tkl, asst_tkl, total_tkl, tkl_pg,
                tfl, sacks, sack_yds, fumble_rec, def_int,
                fgm, fga, fg_pct, fg_long, xpm, xpa, xp_pct, points
            ) VALUES (
                %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s
            )
            ON CONFLICT (player_id, season) DO UPDATE SET
                games       = COALESCE(EXCLUDED.games,       cccaa_fb_stats.games),
                pass_ypg    = COALESCE(EXCLUDED.pass_ypg,    cccaa_fb_stats.pass_ypg),
                pass_tds    = COALESCE(EXCLUDED.pass_tds,    cccaa_fb_stats.pass_tds),
                completions = COALESCE(EXCLUDED.completions, cccaa_fb_stats.completions),
                comp_pct    = COALESCE(EXCLUDED.comp_pct,    cccaa_fb_stats.comp_pct),
                pass_att    = COALESCE(EXCLUDED.pass_att,    cccaa_fb_stats.pass_att),
                pass_yds    = COALESCE(EXCLUDED.pass_yds,    cccaa_fb_stats.pass_yds),
                pass_ya     = COALESCE(EXCLUDED.pass_ya,     cccaa_fb_stats.pass_ya),
                pass_int    = COALESCE(EXCLUDED.pass_int,    cccaa_fb_stats.pass_int),
                pass_effic  = COALESCE(EXCLUDED.pass_effic,  cccaa_fb_stats.pass_effic),
                rush_att    = COALESCE(EXCLUDED.rush_att,    cccaa_fb_stats.rush_att),
                rush_yds    = COALESCE(EXCLUDED.rush_yds,    cccaa_fb_stats.rush_yds),
                rush_ypg    = COALESCE(EXCLUDED.rush_ypg,    cccaa_fb_stats.rush_ypg),
                rush_avg    = COALESCE(EXCLUDED.rush_avg,    cccaa_fb_stats.rush_avg),
                rush_tds    = COALESCE(EXCLUDED.rush_tds,    cccaa_fb_stats.rush_tds),
                receptions  = COALESCE(EXCLUDED.receptions,  cccaa_fb_stats.receptions),
                rec_yds     = COALESCE(EXCLUDED.rec_yds,     cccaa_fb_stats.rec_yds),
                rec_ypg     = COALESCE(EXCLUDED.rec_ypg,     cccaa_fb_stats.rec_ypg),
                rec_avg     = COALESCE(EXCLUDED.rec_avg,     cccaa_fb_stats.rec_avg),
                rec_tds     = COALESCE(EXCLUDED.rec_tds,     cccaa_fb_stats.rec_tds),
                solo_tkl    = COALESCE(EXCLUDED.solo_tkl,    cccaa_fb_stats.solo_tkl),
                asst_tkl    = COALESCE(EXCLUDED.asst_tkl,    cccaa_fb_stats.asst_tkl),
                total_tkl   = COALESCE(EXCLUDED.total_tkl,   cccaa_fb_stats.total_tkl),
                tkl_pg      = COALESCE(EXCLUDED.tkl_pg,      cccaa_fb_stats.tkl_pg),
                tfl         = COALESCE(EXCLUDED.tfl,         cccaa_fb_stats.tfl),
                sacks       = COALESCE(EXCLUDED.sacks,       cccaa_fb_stats.sacks),
                sack_yds    = COALESCE(EXCLUDED.sack_yds,    cccaa_fb_stats.sack_yds),
                fumble_rec  = COALESCE(EXCLUDED.fumble_rec,  cccaa_fb_stats.fumble_rec),
                def_int     = COALESCE(EXCLUDED.def_int,     cccaa_fb_stats.def_int),
                fgm         = COALESCE(EXCLUDED.fgm,         cccaa_fb_stats.fgm),
                fga         = COALESCE(EXCLUDED.fga,         cccaa_fb_stats.fga),
                fg_pct      = COALESCE(EXCLUDED.fg_pct,      cccaa_fb_stats.fg_pct),
                fg_long     = COALESCE(EXCLUDED.fg_long,     cccaa_fb_stats.fg_long),
                xpm         = COALESCE(EXCLUDED.xpm,         cccaa_fb_stats.xpm),
                xpa         = COALESCE(EXCLUDED.xpa,         cccaa_fb_stats.xpa),
                xp_pct      = COALESCE(EXCLUDED.xp_pct,      cccaa_fb_stats.xp_pct),
                points      = COALESCE(EXCLUDED.points,      cccaa_fb_stats.points),
                updated_at  = now()
        """, (
            player_id, SEASON, s.get("games"),
            s.get("pass_ypg"),   s.get("pass_tds"),  s.get("completions"), s.get("comp_pct"),
            s.get("pass_att"),   s.get("pass_yds"),  s.get("pass_ya"),     s.get("pass_int"),
            s.get("pass_effic"),
            s.get("rush_att"),   s.get("rush_yds"),  s.get("rush_ypg"),    s.get("rush_avg"),
            s.get("rush_tds"),
            s.get("receptions"), s.get("rec_yds"),   s.get("rec_ypg"),     s.get("rec_avg"),
            s.get("rec_tds"),
            s.get("solo_tkl"),   s.get("asst_tkl"),  s.get("total_tkl"),   s.get("tkl_pg"),
            s.get("tfl"),        s.get("sacks"),     s.get("sack_yds"),    s.get("fumble_rec"),
            s.get("def_int"),
            s.get("fgm"),        s.get("fga"),       s.get("fg_pct"),      s.get("fg_long"),
            s.get("xpm"),        s.get("xpa"),       s.get("xp_pct"),      s.get("points"),
        ))


# ── Fetch ─────────────────────────────────────────────────────────────────────

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
}


def fetch_leaders(url: str) -> Optional[BeautifulSoup]:
    try:
        r = httpx.get(url, headers=HEADERS, timeout=25, follow_redirects=True)
        time.sleep(DELAY)
        if r.status_code == 200 and len(r.text) > 2000 and "Just a moment" not in r.text:
            return BeautifulSoup(r.text, "html.parser")
        print(f"    [warn] {r.status_code} len={len(r.text)} {url}")
        return None
    except Exception as e:
        print(f"    [error] {url}: {e}")
        return None


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


# ── Parse ─────────────────────────────────────────────────────────────────────

def parse_leaders_page(soup: BeautifulSoup, conference: str) -> list[dict]:
    """
    Parse all 37 stat tables on a cccaasports.org football leaders page.
    Each row: [player+school cell (with .player-name / .player-team links), GP, stat_value]
    Returns list of merged per-player dicts keyed by slug.
    """
    tables = soup.find_all("table")
    players: dict[str, dict] = {}   # slug → merged dict

    for tbl_idx, stat_key, is_total in STAT_MAP:
        if tbl_idx >= len(tables):
            continue
        tbl = tables[tbl_idx]

        for row in tbl.find_all("tr"):
            if row.find("th"):
                continue   # skip header rows

            tds = row.find_all("td")
            if len(tds) < 3:
                continue

            # Player cell (td[0]) contains nested .player-name and .player-team links
            player_cell = tds[0]
            name_a = player_cell.find("a", class_="player-name")
            team_a = player_cell.find("a", class_="player-team")
            if not name_a:
                continue

            full_name = name_a.get_text(strip=True)
            school    = team_a.get_text(strip=True) if team_a else ""

            # Slug from player href
            href = name_a.get("href", "")
            slug_m = re.search(r"/players/([^/?]+)", href)
            if not slug_m:
                continue
            slug = slug_m.group(1)

            # Team slug from team href
            team_href   = team_a.get("href", "") if team_a else ""
            team_slug_m = re.search(r"/teams/([^/?]+)", team_href)
            team_slug   = team_slug_m.group(1) if team_slug_m else re.sub(r"[^a-z0-9]", "", school.lower())

            gp_raw  = tds[1].get_text(strip=True)
            val_raw = tds[2].get_text(strip=True)

            gp  = safe_int(gp_raw)
            val = safe_float(val_raw)
            if val is None:
                continue

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
                existing_gp = players[slug].get("games") or 0
                if gp and gp > existing_gp:
                    players[slug]["games"] = gp

            # Store stat value — don't overwrite with first occurrence only
            if stat_key not in players[slug]:
                if is_total:
                    players[slug][stat_key] = safe_int(val_raw)
                elif stat_key in PCT_FIELDS:
                    players[slug][stat_key] = round(val / 100.0, 4) if val > 1 else round(val, 4)
                else:
                    players[slug][stat_key] = round(val, 4)

    return list(players.values())


# ── Load ──────────────────────────────────────────────────────────────────────

def load_cccaa_football(conn, dry_run: bool = False) -> int:
    all_players: dict[str, dict] = {}

    # State leaders page (CCCAA football has no per-conference leaders pages)
    print("  Fetching state leaders...")
    state_url = f"{BASE_URL}/sports/{SPORT}/{SEASON}/leaders"
    soup = fetch_leaders(state_url)
    if soup:
        rows = parse_leaders_page(soup, "CCCAA")
        print(f"    → {len(rows)} players from state page")
        for p in rows:
            slug = p["slug"]
            if slug not in all_players:
                all_players[slug] = p
            else:
                all_players[slug].update({k: v for k, v in p.items() if v is not None})
    else:
        print("    [ERROR] Could not fetch state page — WAF blocked?")

    print(f"\n  Total unique players collected: {len(all_players)}")

    if dry_run:
        print("  [dry-run] skipping DB writes")
        sample = list(all_players.values())[:5]
        for p in sample:
            print(f"    {p['name']:<20} {p['school']:<22} tds={p.get('pass_tds')} rush_yds={p.get('rush_yds')} tkl={p.get('total_tkl')}")
        return len(all_players)

    # 3) Upsert
    team_id_cache: dict[str, str] = {}
    written = 0

    for slug, p in all_players.items():
        school     = p.get("school", "")
        team_slug  = p.get("team_slug", "")
        conference = p.get("conference", "")
        if not school:
            continue

        t_key = team_slug or school
        if t_key not in team_id_cache:
            tid = upsert_team(conn, school, team_slug, conference)
            team_id_cache[t_key] = tid
        team_id = team_id_cache[t_key]

        player_key = f"cccaa:{SEASON}:{slug}"
        player_id  = upsert_player(conn, player_key, p["name"], team_id)

        stats = {k: p.get(k) for k in (
            "games",
            "pass_ypg", "pass_tds", "completions", "comp_pct",
            "pass_att", "pass_yds", "pass_ya", "pass_int", "pass_effic",
            "rush_att", "rush_yds", "rush_ypg", "rush_avg", "rush_tds",
            "receptions", "rec_yds", "rec_ypg", "rec_avg", "rec_tds",
            "solo_tkl", "asst_tkl", "total_tkl", "tkl_pg",
            "tfl", "sacks", "sack_yds", "fumble_rec", "def_int",
            "fgm", "fga", "fg_pct", "fg_long", "xpm", "xpa", "xp_pct", "points",
        )}
        upsert_stats(conn, player_id, stats)
        written += 1

    conn.commit()
    return written


def print_summary(conn):
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) AS n FROM cccaa_fb_teams WHERE season=%s", (SEASON,))
    teams = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) AS n FROM cccaa_fb_players WHERE season=%s", (SEASON,))
    players = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) AS n FROM cccaa_fb_stats WHERE season=%s", (SEASON,))
    stat_rows = cur.fetchone()["n"]
    conn.commit()

    # Top passers
    cur.execute("""
        SELECT p.full_name, t.name AS team, s.pass_yds, s.pass_tds, s.comp_pct
        FROM cccaa_fb_stats s
        JOIN cccaa_fb_players p ON p.id = s.player_id
        JOIN cccaa_fb_teams   t ON t.id = p.team_id
        WHERE s.season=%s AND s.pass_yds IS NOT NULL
        ORDER BY s.pass_yds DESC LIMIT 5
    """, (SEASON,))
    passers = cur.fetchall()
    conn.commit()

    # Top rushers
    cur.execute("""
        SELECT p.full_name, t.name AS team, s.rush_yds, s.rush_tds
        FROM cccaa_fb_stats s
        JOIN cccaa_fb_players p ON p.id = s.player_id
        JOIN cccaa_fb_teams   t ON t.id = p.team_id
        WHERE s.season=%s AND s.rush_yds IS NOT NULL
        ORDER BY s.rush_yds DESC LIMIT 5
    """, (SEASON,))
    rushers = cur.fetchall()
    conn.commit()

    print("\n" + "=" * 60)
    print("CCCAA FOOTBALL DONE")
    print(f"  Season    : {SEASON}")
    print(f"  Teams     : {teams}")
    print(f"  Players   : {players}")
    print(f"  Stat rows : {stat_rows}")
    print()
    print("  Top passers (by total yards):")
    for r in passers:
        pct = f"{r['comp_pct']*100:.1f}%" if r["comp_pct"] else "—"
        print(f"    {r['full_name']:<22} {r['team']:<20} {r['pass_yds']} yds  {r['pass_tds']} TD  {pct}")
    print()
    print("  Top rushers (by total yards):")
    for r in rushers:
        print(f"    {r['full_name']:<22} {r['team']:<20} {r['rush_yds']} yds  {r['rush_tds']} TD")
    print("=" * 60)


def main():
    ap = argparse.ArgumentParser(description="CCCAA Football scraper")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    print(f"\n=== CCCAA Football Scraper (season={SEASON}) ===")
    print(f"  Source : cccaasports.org/sports/{SPORT}")
    print(f"  Pages  : state leaders (37 tables × 6 players)")
    print()

    conn = get_conn()
    try:
        ensure_tables(conn)
        written = load_cccaa_football(conn, dry_run=args.dry_run)
        if not args.dry_run:
            print(f"\n  Upserted {written} player stat rows")
            print_summary(conn)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
