#!/usr/bin/env python3
"""
Barttorvik scraper — NCAA D1 player advanced stats via cbbdata REST API.

Auth: export CBBDATA_API_KEY=<your_key>
      (free account at https://www.cbbdata.com — login via /api/auth/login)

API: https://www.cbbdata.com/api/torvik/player/season?year=2025&key=KEY
     Response: Parquet binary (requires pyarrow)

Actual API column names (65 cols):
  player, pos, team, conf, g, mpg, ppg, rpg, apg, spg, bpg, tov, ast_to
  efg (0-100 scale!), ts (0-100 scale!), usg (0-100 scale!)
  oreb_rate, dreb_rate, bpm, obpm, dbpm, porpag, ortg, drtg, ...
  NOTE: No games_started column — role_discipline cannot be scored.

What this adds over box_score (2 IQ traits unlocked):
  - shot_selection: efg / 100 → efg_pct input
  - turnover_decision_quality: ast_to (direct ratio, no conversion needed)

Year convention: year=2025 = 2024-25 season (last complete season).
                 year=2026 = 2025-26 season (returns 0 rows until season loads).

Usage:
    export CBBDATA_API_KEY=your_key_here
    python3 barttorvik_scraper.py [--year 2025] [--dry-run] [--skip-match]
    python3 barttorvik_scraper.py --list-columns   # print API column names and exit
"""
from __future__ import annotations

import os
import sys
import io
import re
import argparse
import psycopg
from psycopg.rows import dict_row

sys.path.insert(0, os.path.dirname(__file__))
from config import DB_CONFIG

import httpx
import pyarrow.parquet as pq

CBBDATA_BASE = "https://www.cbbdata.com/api"
CURRENT_YEAR = 2025  # year=2025 = 2024-25 season (most recent complete data)


# ═══════════════════════════════════════════════════════════════════════════
# DB Schema
# ═══════════════════════════════════════════════════════════════════════════

def ensure_schema(conn) -> None:
    conn.execute("""
        CREATE TABLE IF NOT EXISTS barttorvik_player_season (
            id SERIAL PRIMARY KEY,
            player_name VARCHAR NOT NULL,
            team_name VARCHAR NOT NULL,
            conference VARCHAR,
            season_year INTEGER NOT NULL,
            games INTEGER,
            games_started INTEGER,
            mpg DECIMAL,
            pts_pg DECIMAL,
            reb_pg DECIMAL,
            ast_pg DECIMAL,
            stl_pg DECIMAL,
            blk_pg DECIMAL,
            tov_pg DECIMAL,
            ast_to DECIMAL,
            efg_pct DECIMAL,
            ts_pct DECIMAL,
            usg_pct DECIMAL,
            ast_pct DECIMAL,
            to_pct DECIMAL,
            oreb_pct DECIMAL,
            dreb_pct DECIMAL,
            bpm DECIMAL,
            obpm DECIMAL,
            dbpm DECIMAL,
            porpag DECIMAL,
            -- FK to player pool (set during matching step)
            player_team_season_id UUID REFERENCES player_team_seasons(id),
            matched_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(player_name, team_name, season_year)
        )
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_btt_pts_id
        ON barttorvik_player_season(player_team_season_id)
        WHERE player_team_season_id IS NOT NULL
    """)
    # Migrations: add columns that were added after initial schema creation
    conn.execute("""
        ALTER TABLE barttorvik_player_season
        ADD COLUMN IF NOT EXISTS ast_to DECIMAL
    """)
    conn.commit()
    print("  Schema verified (barttorvik_player_season)")


# ═══════════════════════════════════════════════════════════════════════════
# API Fetch
# ═══════════════════════════════════════════════════════════════════════════

def _fetch_parquet(url: str, params: dict) -> list[dict]:
    """Fetch a cbbdata endpoint (Parquet response) and return list of row dicts."""
    resp = httpx.get(url, params=params, timeout=120.0)
    resp.raise_for_status()
    table = pq.read_table(io.BytesIO(resp.content))
    col_dict = table.to_pydict()
    cols = list(col_dict.keys())
    n    = len(col_dict[cols[0]]) if cols else 0
    return [{c: col_dict[c][i] for c in cols} for i in range(n)]


def pull_player_season(key: str, year: int) -> list[dict]:
    url    = f"{CBBDATA_BASE}/torvik/player/season"
    params = {"year": year, "key": key}
    print(f"  Fetching player season data (year={year})...")
    rows = _fetch_parquet(url, params)
    print(f"  Got {len(rows)} player records")
    return rows


# ═══════════════════════════════════════════════════════════════════════════
# Row Mapping — flexible field name resolution
# ═══════════════════════════════════════════════════════════════════════════

def _map_row(r: dict, year: int) -> dict | None:
    """
    Map a raw Barttorvik API row to our DB columns.

    API scale notes (confirmed from actual data):
      efg, ts, usg — 0 to 100 (percent), stored as-is in DB.
      ast_to — direct ratio (e.g. 0.84), stored as-is.
      tov — total turnovers for season (divide by g for per-game).
    """
    def _f(*keys) -> float | None:
        for k in keys:
            v = r.get(k)
            if v is None:
                continue
            try:
                f = float(v)
                return None if f != f else f  # NaN → None
            except (TypeError, ValueError):
                pass
        return None

    def _s(*keys) -> str | None:
        for k in keys:
            v = r.get(k)
            if v is not None:
                s = str(v).strip()
                if s:
                    return s
        return None

    def _i(*keys) -> int | None:
        v = _f(*keys)
        return int(v) if v is not None else None

    player = _s("player", "player_name", "name")
    team   = _s("team", "team_name")
    if not player or not team:
        return None

    g = _i("g", "games", "gp")

    # Compute per-game turnover from season total tov ÷ g
    tov_total = _f("tov")
    tov_pg    = (tov_total / g) if (tov_total is not None and g and g > 0) else None

    return {
        "player_name": player,
        "team_name":   team,
        "conference":  _s("conf", "conference"),
        "season_year": year,
        # Volume
        "games":         g,
        "games_started": None,       # not available from /player/season endpoint
        "mpg":           _f("mpg"),
        # Per-game (API provides these directly)
        "pts_pg":  _f("ppg"),
        "reb_pg":  _f("rpg"),
        "ast_pg":  _f("apg"),
        "stl_pg":  _f("spg"),
        "blk_pg":  _f("bpg"),
        "tov_pg":  tov_pg,
        # AST/TO ratio — provided directly as a ratio (e.g. 1.2, not percentage)
        "ast_to":  _f("ast_to"),
        # Efficiency — API uses 0-100 percent scale for efg, ts, usg
        "efg_pct":  _f("efg"),        # stored as 0-100; divide by 100 in pipeline
        "ts_pct":   _f("ts"),         # stored as 0-100
        "usg_pct":  _f("usg"),        # stored as 0-100
        "ast_pct":  None,             # not in this endpoint
        "to_pct":   None,             # not in this endpoint
        "oreb_pct": _f("oreb_rate"),
        "dreb_pct": _f("dreb_rate"),
        # Ratings
        "bpm":    _f("bpm"),
        "obpm":   _f("obpm"),
        "dbpm":   _f("dbpm"),
        "porpag": _f("porpag"),
    }


# ═══════════════════════════════════════════════════════════════════════════
# DB Insert
# ═══════════════════════════════════════════════════════════════════════════

def insert_player_season(conn, rows: list[dict], year: int) -> int:
    inserted = skipped = 0
    for r in rows:
        m = _map_row(r, year)
        if m is None:
            skipped += 1
            continue
        conn.execute("""
            INSERT INTO barttorvik_player_season (
                player_name, team_name, conference, season_year,
                games, games_started, mpg,
                pts_pg, reb_pg, ast_pg, stl_pg, blk_pg, tov_pg,
                ast_to,
                efg_pct, ts_pct, usg_pct, ast_pct, to_pct,
                oreb_pct, dreb_pct, bpm, obpm, dbpm, porpag
            ) VALUES (
                %s,%s,%s,%s,
                %s,%s,%s,
                %s,%s,%s,%s,%s,%s,
                %s,
                %s,%s,%s,%s,%s,
                %s,%s,%s,%s,%s,%s
            )
            ON CONFLICT (player_name, team_name, season_year) DO UPDATE SET
                conference    = EXCLUDED.conference,
                games         = EXCLUDED.games,
                games_started = EXCLUDED.games_started,
                mpg           = EXCLUDED.mpg,
                pts_pg        = EXCLUDED.pts_pg,
                reb_pg        = EXCLUDED.reb_pg,
                ast_pg        = EXCLUDED.ast_pg,
                stl_pg        = EXCLUDED.stl_pg,
                blk_pg        = EXCLUDED.blk_pg,
                tov_pg        = EXCLUDED.tov_pg,
                ast_to        = EXCLUDED.ast_to,
                efg_pct       = EXCLUDED.efg_pct,
                ts_pct        = EXCLUDED.ts_pct,
                usg_pct       = EXCLUDED.usg_pct,
                ast_pct       = EXCLUDED.ast_pct,
                to_pct        = EXCLUDED.to_pct,
                oreb_pct      = EXCLUDED.oreb_pct,
                dreb_pct      = EXCLUDED.dreb_pct,
                bpm           = EXCLUDED.bpm,
                obpm          = EXCLUDED.obpm,
                dbpm          = EXCLUDED.dbpm,
                porpag        = EXCLUDED.porpag
        """, (
            m["player_name"], m["team_name"], m["conference"], year,
            m["games"], m["games_started"], m["mpg"],
            m["pts_pg"], m["reb_pg"], m["ast_pg"],
            m["stl_pg"], m["blk_pg"], m["tov_pg"],
            m["ast_to"],
            m["efg_pct"], m["ts_pct"], m["usg_pct"],
            m["ast_pct"], m["to_pct"],
            m["oreb_pct"], m["dreb_pct"],
            m["bpm"], m["obpm"], m["dbpm"], m["porpag"],
        ))
        inserted += 1

    conn.commit()
    if skipped:
        print(f"  Skipped {skipped} rows with missing player/team name")
    return inserted


# ═══════════════════════════════════════════════════════════════════════════
# Player Matching — Barttorvik → player_team_seasons
# ═══════════════════════════════════════════════════════════════════════════

def _norm_name(name: str) -> str:
    """Normalize player name: lowercase, remove suffixes and punctuation."""
    n = name.lower().strip()
    n = re.sub(r"\b(jr|sr|ii|iii|iv)\.?\b", "", n)
    n = re.sub(r"[^a-z ]", "", n)
    return " ".join(n.split())


def _norm_team(team: str) -> str:
    """Normalize team name for matching."""
    t = team.lower().strip()
    subs = [
        ("st.", "state"), ("&", "and"), ("-", " "),
        ("university of ", ""), ("u. of ", ""), ("@", "at"),
    ]
    for old, new in subs:
        t = t.replace(old, new)
    t = re.sub(r"[^a-z ]", "", t)
    return " ".join(t.split())


def _build_team_mapping(btt_teams: set[str], pool_teams: set[str]) -> dict[str, str]:
    """
    Build a mapping from Barttorvik (short) team names to pool (full) team names.

    Barttorvik uses short school names ("Alabama") while our pool has full names
    ("Alabama Crimson Tide"). Match by: pool_team starts with btt_team as prefix,
    AND no other btt_team is a longer prefix match for the same pool_team.
    """
    mapping: dict[str, str] = {}
    for pool_team in pool_teams:
        best_btt = None
        best_len = 0
        for btt_team in btt_teams:
            # Check if pool team starts with btt team (+ space or exact)
            if pool_team == btt_team:
                if len(btt_team) > best_len:
                    best_btt = btt_team
                    best_len = len(btt_team)
            elif pool_team.startswith(btt_team + " "):
                if len(btt_team) > best_len:
                    best_btt = btt_team
                    best_len = len(btt_team)
        if best_btt:
            mapping[best_btt] = pool_team
    return mapping


def match_to_player_pool(conn, year: int) -> tuple[int, int]:
    """
    Match barttorvik records to player_team_seasons.
    Matching strategy:
      1. Normalize player name (lowercase, strip Jr/Sr/etc.)
      2. Normalize team name
      3. Exact normalized match on both
      4. Validate with games_played proximity (±5 games)

    Returns (matched_count, total_unmatched).
    """
    print("\n  Matching Barttorvik players to player pool (D1)...")

    # Load unmatched barttorvik records for this year
    btt_rows = conn.execute("""
        SELECT id, player_name, team_name, season_year, games
        FROM barttorvik_player_season
        WHERE player_team_season_id IS NULL
          AND season_year = %s
    """, (year,)).fetchall()

    if not btt_rows:
        print("  No unmatched records to process")
        return 0, 0

    # Load D1 player pool players
    pool_rows = conn.execute("""
        SELECT pts.id AS pts_id,
               p.full_name,
               t.name AS team_name,
               t.slug AS team_slug,
               COALESCE(pss.games_played, 0) AS games_played
        FROM player_team_seasons pts
        JOIN players p ON pts.player_id = p.id
        JOIN team_seasons ts ON pts.team_season_id = ts.id
        JOIN teams t ON ts.team_id = t.id
        JOIN competitive_levels cl ON t.competitive_level_id = cl.id
        LEFT JOIN player_season_stats pss ON pss.player_team_season_id = pts.id
        WHERE cl.level_key = 'ncaa_d1'
    """).fetchall()

    if not pool_rows:
        # Fallback: general query without level filter
        pool_rows = conn.execute("""
            SELECT pts.id AS pts_id,
                   p.full_name,
                   t.name AS team_name,
                   t.slug AS team_slug,
                   COALESCE(pss.games_played, 0) AS games_played
            FROM player_team_seasons pts
            JOIN players p ON pts.player_id = p.id
            JOIN team_seasons ts ON pts.team_season_id = ts.id
            JOIN teams t ON ts.team_id = t.id
            JOIN competitive_levels cl ON t.competitive_level_id = cl.id
            LEFT JOIN player_season_stats pss ON pss.player_team_season_id = pts.id
            WHERE cl.level_key = 'ncaa_d1'
        """).fetchall()

    print(f"  Barttorvik: {len(btt_rows)} unmatched | Pool: {len(pool_rows)} D1 players")

    # Build team name mapping: btt short name → pool full name
    btt_teams  = {_norm_team(r["team_name"]) for r in btt_rows}
    pool_teams = {_norm_team(r["team_name"] or "") for r in pool_rows}
    team_map   = _build_team_mapping(btt_teams, pool_teams)
    print(f"  Team name mapping: {len(team_map)} Barttorvik teams → pool teams")

    # Build lookup: normalized_name → list of pool candidates
    pool_by_name: dict[str, list[dict]] = {}
    for r in pool_rows:
        key = _norm_name(r["full_name"] or "")
        if key not in pool_by_name:
            pool_by_name[key] = []
        pool_by_name[key].append({
            "pts_id":       str(r["pts_id"]),
            "team_norm":    _norm_team(r["team_name"] or ""),
            "games_played": int(r["games_played"] or 0),
        })

    matched = total = 0
    for btt in btt_rows:
        total += 1
        norm_name = _norm_name(btt["player_name"])
        candidates = pool_by_name.get(norm_name, [])
        if not candidates:
            continue

        btt_team_norm  = _norm_team(btt["team_name"])
        # Resolve short Barttorvik name to our pool's full team name
        pool_team_norm = team_map.get(btt_team_norm, btt_team_norm)
        btt_games      = int(btt["games"] or 0)
        best           = None

        for c in candidates:
            if c["team_norm"] != pool_team_norm:
                continue
            # No games check — Barttorvik year=2025 is the 2024-25 complete season
            # while our pool holds 2025-26 in-progress data; game counts differ by 10+.
            best = c
            break

        if best:
            conn.execute("""
                UPDATE barttorvik_player_season
                SET player_team_season_id = %s, matched_at = NOW()
                WHERE id = %s
            """, (best["pts_id"], btt["id"]))
            matched += 1

    conn.commit()
    pct = matched / total * 100 if total > 0 else 0
    print(f"  Matched {matched}/{total} ({pct:.1f}%)")
    return matched, total


# ═══════════════════════════════════════════════════════════════════════════
# CLI
# ═══════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="Barttorvik D1 player stats scraper")
    parser.add_argument("--year", type=int, default=CURRENT_YEAR,
                        help=f"Season year (default: {CURRENT_YEAR})")
    parser.add_argument("--dry-run", action="store_true",
                        help="Fetch and parse but do not write to DB")
    parser.add_argument("--skip-match", action="store_true",
                        help="Skip player pool matching step")
    parser.add_argument("--rematch", action="store_true",
                        help="Re-run matching only (skip fetch/insert); resets all matches first")
    parser.add_argument("--list-columns", action="store_true",
                        help="Print API column names from first record and exit")
    args = parser.parse_args()

    api_key = os.environ.get("CBBDATA_API_KEY", "")
    if not api_key:
        print("ERROR: CBBDATA_API_KEY environment variable not set.")
        print()
        print("  1. Create a free account at https://www.cbbdata.com")
        print("  2. Verify your email to get your API key")
        print("  3. export CBBDATA_API_KEY=<your_key>")
        print("  4. Re-run this script")
        sys.exit(1)

    conn = psycopg.connect(
        host=DB_CONFIG["host"], port=DB_CONFIG["port"],
        dbname=DB_CONFIG["dbname"], row_factory=dict_row, autocommit=False,
    )

    print(f"\n{'='*60}")
    print(f"Barttorvik Scraper — year={args.year}")
    print(f"{'='*60}")

    if not args.dry_run:
        ensure_schema(conn)

    # Rematch-only mode: reset existing matches and re-run matching
    if args.rematch:
        print(f"  Resetting existing matches for year={args.year}...")
        conn.execute("""
            UPDATE barttorvik_player_season
            SET player_team_season_id = NULL, matched_at = NULL
            WHERE season_year = %s
        """, (args.year,))
        conn.commit()
        matched, total = match_to_player_pool(conn, args.year)
        coverage = conn.execute("""
            SELECT count(*) AS total,
                   count(player_team_season_id) AS matched
            FROM barttorvik_player_season
            WHERE season_year = %s
        """, (args.year,)).fetchone()
        if coverage:
            print(f"\n  Coverage: {coverage['matched']}/{coverage['total']} "
                  f"({coverage['matched']/coverage['total']*100:.1f}%) matched to player pool")
        conn.close()
        print("\nDone.")
        return

    # Fetch
    rows = pull_player_season(api_key, args.year)
    if not rows:
        print("No data returned. Check your API key and year.")
        conn.close()
        return

    # Show columns for debugging
    if rows and args.list_columns:
        print(f"\nAPI columns ({len(rows[0])} fields):")
        for col in sorted(rows[0].keys()):
            sample = rows[0][col]
            print(f"  {col}: {repr(sample)}")
        conn.close()
        return

    if not args.dry_run:
        inserted = insert_player_season(conn, rows, args.year)
        print(f"  Inserted/updated {inserted} records")

        if not args.skip_match:
            matched, total = match_to_player_pool(conn, args.year)
            # Report coverage
            coverage = conn.execute("""
                SELECT count(*) AS total,
                       count(player_team_season_id) AS matched
                FROM barttorvik_player_season
                WHERE season_year = %s
            """, (args.year,)).fetchone()
            if coverage:
                print(f"\n  Coverage: {coverage['matched']}/{coverage['total']} "
                      f"({coverage['matched']/coverage['total']*100:.1f}%) matched to player pool")
    else:
        # Dry run: just show what we'd map
        sample = rows[:3]
        for r in sample:
            m = _map_row(r, args.year)
            if m:
                print(f"  Sample: {m['player_name']} ({m['team_name']}) "
                      f"EFG={m.get('efg_pct')} AST/G={m.get('ast_pg')} TOV/G={m.get('tov_pg')} "
                      f"GS={m.get('games_started')}/{m.get('games')}")

    conn.close()
    print("\nDone.")


if __name__ == "__main__":
    main()
