"""
NFL Pro Player Pool Scraper — 2024 Season
Source: nfl_data_py (nflverse) — actively maintained
Loads: profb_teams, profb_players, profb_player_stats

Stats sources:
  import_seasonal_data   → offense/fantasy stats (345 skill-position players)
  import_seasonal_pfr    → PFR defensive stats (1008+ defensive players)
  import_ids             → pfr_id ↔ gsis_id bridge

Usage:
    python3 nfl_scraper.py              # load all
    python3 nfl_scraper.py teams        # teams only
    python3 nfl_scraper.py players      # teams + players
    python3 nfl_scraper.py stats        # stats only (players must exist)
    python3 nfl_scraper.py defense      # defensive stats only (fast refresh)
"""
from __future__ import annotations

import sys
import math
import re
from typing import Optional

import psycopg
from psycopg.rows import dict_row
import nfl_data_py as nfl
import pandas as pd

DB_CONFIG = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}
SEASON = 2024


# ── Helpers ──────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)


def safe_int(val) -> Optional[int]:
    try:
        if val is None or (isinstance(val, float) and math.isnan(val)):
            return None
        return int(float(val))
    except (ValueError, TypeError):
        return None


def safe_float(val) -> Optional[float]:
    try:
        if val is None or (isinstance(val, float) and math.isnan(val)):
            return None
        return float(val)
    except (ValueError, TypeError):
        return None


# ── Step 1: Teams ─────────────────────────────────────────────────────────────

# nflverse conference/division info
TEAM_INFO = {
    "ARI": ("NFC", "NFC West"),    "ATL": ("NFC", "NFC South"),
    "BAL": ("AFC", "AFC North"),   "BUF": ("AFC", "AFC East"),
    "CAR": ("NFC", "NFC South"),   "CHI": ("NFC", "NFC North"),
    "CIN": ("AFC", "AFC North"),   "CLE": ("AFC", "AFC North"),
    "DAL": ("NFC", "NFC East"),    "DEN": ("AFC", "AFC West"),
    "DET": ("NFC", "NFC North"),   "GB":  ("NFC", "NFC North"),
    "HOU": ("AFC", "AFC South"),   "IND": ("AFC", "AFC South"),
    "JAX": ("AFC", "AFC South"),   "KC":  ("AFC", "AFC West"),
    "LAC": ("AFC", "AFC West"),    "LA":  ("NFC", "NFC West"),
    "LV":  ("AFC", "AFC West"),    "MIA": ("AFC", "AFC East"),
    "MIN": ("NFC", "NFC North"),   "NE":  ("AFC", "AFC East"),
    "NO":  ("NFC", "NFC South"),   "NYG": ("NFC", "NFC East"),
    "NYJ": ("AFC", "AFC East"),    "PHI": ("NFC", "NFC East"),
    "PIT": ("AFC", "AFC North"),   "SEA": ("NFC", "NFC West"),
    "SF":  ("NFC", "NFC West"),    "TB":  ("NFC", "NFC South"),
    "TEN": ("AFC", "AFC South"),   "WAS": ("NFC", "NFC East"),
}

TEAM_FULLNAME = {
    "ARI": "Arizona Cardinals",    "ATL": "Atlanta Falcons",
    "BAL": "Baltimore Ravens",     "BUF": "Buffalo Bills",
    "CAR": "Carolina Panthers",    "CHI": "Chicago Bears",
    "CIN": "Cincinnati Bengals",   "CLE": "Cleveland Browns",
    "DAL": "Dallas Cowboys",       "DEN": "Denver Broncos",
    "DET": "Detroit Lions",        "GB":  "Green Bay Packers",
    "HOU": "Houston Texans",       "IND": "Indianapolis Colts",
    "JAX": "Jacksonville Jaguars", "KC":  "Kansas City Chiefs",
    "LAC": "Los Angeles Chargers", "LA":  "Los Angeles Rams",
    "LV":  "Las Vegas Raiders",    "MIA": "Miami Dolphins",
    "MIN": "Minnesota Vikings",    "NE":  "New England Patriots",
    "NO":  "New Orleans Saints",   "NYG": "New York Giants",
    "NYJ": "New York Jets",        "PHI": "Philadelphia Eagles",
    "PIT": "Pittsburgh Steelers",  "SEA": "Seattle Seahawks",
    "SF":  "San Francisco 49ers",  "TB":  "Tampa Bay Buccaneers",
    "TEN": "Tennessee Titans",     "WAS": "Washington Commanders",
}


def load_teams(conn) -> dict[str, str]:
    """Upsert all 32 NFL teams. Returns {abbr: uuid}."""
    team_uuid: dict[str, str] = {}
    with conn.transaction():
        cur = conn.cursor()
        for abbr, (conf, div) in TEAM_INFO.items():
            full = TEAM_FULLNAME.get(abbr, abbr)
            cur.execute("""
                INSERT INTO profb_teams (team_abbr, name, full_name, conference, division)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (team_abbr) DO UPDATE
                    SET name=EXCLUDED.name, conference=EXCLUDED.conference, division=EXCLUDED.division
                RETURNING id
            """, (abbr, abbr, full, conf, div))
            row = cur.fetchone()
            team_uuid[abbr] = str(row["id"])
    print(f"  Teams: {len(team_uuid)} upserted")
    return team_uuid


# ── Step 2: Players ───────────────────────────────────────────────────────────

def load_players(conn, team_uuid: dict[str, str]) -> dict[str, str]:
    """Pull 2024 seasonal rosters, upsert players. Returns {gsis_id: uuid}."""
    print("  Fetching nflverse seasonal rosters 2024 ...", flush=True)
    df = nfl.import_seasonal_rosters([SEASON])

    # Keep last week of regular season per player (most recent team assignment)
    df = df[df["game_type"] == "REG"].copy()
    df = df.sort_values("week").groupby("player_id").last().reset_index()

    print(f"  Roster rows: {len(df)}")
    player_uuid: dict[str, str] = {}
    inserted = updated = 0

    with conn.transaction():
        cur = conn.cursor()
        for _, row in df.iterrows():
            gsis = row.get("player_id")
            if not gsis or pd.isna(gsis):
                continue
            name = row.get("player_name") or ""
            if not name.strip():
                continue

            pos = row.get("position") or None
            ht = safe_int(row.get("height"))   # already in inches
            wt = safe_int(row.get("weight"))
            jersey = str(safe_int(row.get("jersey_number")) or "") or None
            yrs = safe_int(row.get("years_exp"))
            age = safe_int(row.get("age"))
            college = row.get("college") or None
            team_abbr = row.get("team") or None
            tid = team_uuid.get(team_abbr) if team_abbr else None

            cur.execute("""
                INSERT INTO profb_players
                    (gsis_id, full_name, position, height_inches, weight_lbs,
                     jersey_number, years_exp, age, college, team_id, season)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (gsis_id) DO UPDATE SET
                    full_name=EXCLUDED.full_name,
                    position=EXCLUDED.position,
                    height_inches=EXCLUDED.height_inches,
                    weight_lbs=EXCLUDED.weight_lbs,
                    jersey_number=EXCLUDED.jersey_number,
                    years_exp=EXCLUDED.years_exp,
                    age=EXCLUDED.age,
                    college=EXCLUDED.college,
                    team_id=EXCLUDED.team_id,
                    season=EXCLUDED.season,
                    updated_at=now()
                RETURNING id, (xmax = 0) AS is_insert
            """, (gsis, name, pos, ht, wt, jersey, yrs, age, college, tid, SEASON))
            r2 = cur.fetchone()
            player_uuid[gsis] = str(r2["id"])
            if r2["is_insert"]:
                inserted += 1
            else:
                updated += 1

    print(f"  Players: {inserted} inserted, {updated} updated ({len(player_uuid)} total)")
    return player_uuid


# ── Step 3: Stats ─────────────────────────────────────────────────────────────

def ensure_defense_columns(conn):
    """Add defensive stat columns to profb_player_stats if missing."""
    new_cols = [
        ("def_games",         "INT"),
        ("def_int",           "INT"),
        ("def_tgt",           "INT"),
        ("def_cmp",           "INT"),
        ("def_yards_allowed", "INT"),
        ("def_td_allowed",    "INT"),
        ("def_sacks",         "NUMERIC(5,1)"),
        ("def_tackles",       "INT"),
        ("def_missed_tackles","INT"),
        ("def_blitz",         "INT"),
        ("def_hurries",       "INT"),
    ]
    # Use autocommit cursor to avoid savepoint-vs-real-commit ambiguity
    cur = conn.cursor()
    for col, col_type in new_cols:
        cur.execute(f"""
            ALTER TABLE profb_player_stats
            ADD COLUMN IF NOT EXISTS {col} {col_type}
        """)
    conn.commit()
    print(f"  Defense columns ensured ({len(new_cols)} columns)")


def load_stats(conn, player_uuid: dict[str, str]):
    """Pull 2024 seasonal stats, upsert profb_player_stats."""
    print("  Fetching nflverse seasonal data 2024 ...", flush=True)
    df = nfl.import_seasonal_data([SEASON])
    df_reg = df[df["season_type"] == "REG"].copy()
    print(f"  Stat rows: {len(df_reg)}")

    inserted = updated = skipped = 0
    with conn.transaction():
        cur = conn.cursor()
        for _, row in df_reg.iterrows():
            gsis = row.get("player_id")
            if not gsis or gsis not in player_uuid:
                skipped += 1
                continue
            pid = player_uuid[gsis]

            cur.execute("""
                INSERT INTO profb_player_stats (
                    player_id, season, season_type,
                    games, fantasy_points, fantasy_ppr,
                    completions, pass_att, pass_yards, pass_td, interceptions, pass_epa,
                    carries, rush_yards, rush_td, rush_epa,
                    receptions, targets, rec_yards, rec_td, target_share,
                    special_td
                ) VALUES (
                    %s,%s,%s,
                    %s,%s,%s,
                    %s,%s,%s,%s,%s,%s,
                    %s,%s,%s,%s,
                    %s,%s,%s,%s,%s,
                    %s
                )
                ON CONFLICT (player_id, season, season_type) DO UPDATE SET
                    games=EXCLUDED.games,
                    fantasy_points=EXCLUDED.fantasy_points,
                    fantasy_ppr=EXCLUDED.fantasy_ppr,
                    completions=EXCLUDED.completions,
                    pass_att=EXCLUDED.pass_att,
                    pass_yards=EXCLUDED.pass_yards,
                    pass_td=EXCLUDED.pass_td,
                    interceptions=EXCLUDED.interceptions,
                    pass_epa=EXCLUDED.pass_epa,
                    carries=EXCLUDED.carries,
                    rush_yards=EXCLUDED.rush_yards,
                    rush_td=EXCLUDED.rush_td,
                    rush_epa=EXCLUDED.rush_epa,
                    receptions=EXCLUDED.receptions,
                    targets=EXCLUDED.targets,
                    rec_yards=EXCLUDED.rec_yards,
                    rec_td=EXCLUDED.rec_td,
                    target_share=EXCLUDED.target_share,
                    special_td=EXCLUDED.special_td
                RETURNING id, (xmax = 0) AS is_insert
            """, (
                pid, SEASON, "REG",
                safe_int(row.get("games")),
                safe_float(row.get("fantasy_points")),
                safe_float(row.get("fantasy_points_ppr")),
                safe_int(row.get("completions")),
                safe_int(row.get("attempts")),
                safe_int(row.get("passing_yards")),
                safe_int(row.get("passing_tds")),
                safe_int(row.get("interceptions")),
                safe_float(row.get("passing_epa")),
                safe_int(row.get("carries")),
                safe_int(row.get("rushing_yards")),
                safe_int(row.get("rushing_tds")),
                safe_float(row.get("rushing_epa")),
                safe_int(row.get("receptions")),
                safe_int(row.get("targets")),
                safe_int(row.get("receiving_yards")),
                safe_int(row.get("receiving_tds")),
                safe_float(row.get("target_share")),
                safe_int(row.get("special_teams_tds")),
            ))
            r2 = cur.fetchone()
            if r2["is_insert"]:
                inserted += 1
            else:
                updated += 1

    print(f"  Stats: {inserted} inserted, {updated} updated, {skipped} skipped (no player)")


def load_defensive_stats(conn, player_uuid: dict[str, str]):
    """
    Pull PFR seasonal defensive stats and upsert into profb_player_stats.
    Uses pfr_id → gsis_id mapping from import_ids().
    Covers ~1008 defensive players not in import_seasonal_data.
    """
    print("  Building pfr_id → gsis_id map ...", flush=True)
    ids_df  = nfl.import_ids()
    pfr_map = {}  # pfr_id → gsis_id
    for _, r in ids_df.iterrows():
        pfr = r.get("pfr_id")
        gsis = r.get("gsis_id")
        if pfr and not pd.isna(pfr) and gsis and not pd.isna(gsis):
            pfr_map[str(pfr)] = str(gsis)

    print(f"  pfr → gsis map: {len(pfr_map)} entries")

    print("  Fetching PFR seasonal defensive stats 2024 ...", flush=True)
    df_def = nfl.import_seasonal_pfr("def", years=[SEASON])
    print(f"  DEF rows: {len(df_def)}")

    inserted = updated = skipped = 0
    with conn.transaction():
        cur = conn.cursor()
        for _, row in df_def.iterrows():
            pfr_id = row.get("pfr_id")
            if not pfr_id or pd.isna(pfr_id):
                skipped += 1
                continue
            gsis = pfr_map.get(str(pfr_id))
            if not gsis or gsis not in player_uuid:
                skipped += 1
                continue
            pid = player_uuid[gsis]

            cur.execute("""
                INSERT INTO profb_player_stats (
                    player_id, season, season_type,
                    def_games, def_int, def_tgt, def_cmp, def_yards_allowed,
                    def_td_allowed, def_sacks, def_tackles, def_missed_tackles,
                    def_blitz, def_hurries
                ) VALUES (
                    %s, %s, %s,
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s,
                    %s, %s
                )
                ON CONFLICT (player_id, season, season_type) DO UPDATE SET
                    def_games         = EXCLUDED.def_games,
                    def_int           = EXCLUDED.def_int,
                    def_tgt           = EXCLUDED.def_tgt,
                    def_cmp           = EXCLUDED.def_cmp,
                    def_yards_allowed = EXCLUDED.def_yards_allowed,
                    def_td_allowed    = EXCLUDED.def_td_allowed,
                    def_sacks         = EXCLUDED.def_sacks,
                    def_tackles       = EXCLUDED.def_tackles,
                    def_missed_tackles= EXCLUDED.def_missed_tackles,
                    def_blitz         = EXCLUDED.def_blitz,
                    def_hurries       = EXCLUDED.def_hurries
                RETURNING id, (xmax = 0) AS is_insert
            """, (
                pid, SEASON, "REG",
                safe_int(row.get("g")),
                safe_int(row.get("int")),
                safe_int(row.get("tgt")),
                safe_int(row.get("cmp")),
                safe_int(row.get("yds")),
                safe_int(row.get("td")),
                safe_float(row.get("sk")),
                safe_int(row.get("comb")),
                safe_int(row.get("m_tkl")),
                safe_int(row.get("bltz")),
                safe_int(row.get("hrry")),
            ))
            r2 = cur.fetchone()
            if r2["is_insert"]:
                inserted += 1
            else:
                updated += 1

    conn.commit()
    print(f"  Defense: {inserted} inserted, {updated} updated, {skipped} skipped")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"
    conn = get_conn()
    try:
        if mode in ("all", "teams"):
            print("\n[1/4] Loading NFL teams ...")
            team_uuid = load_teams(conn)
        else:
            cur = conn.cursor()
            cur.execute("SELECT team_abbr, id FROM profb_teams")
            team_uuid = {r["team_abbr"]: str(r["id"]) for r in cur.fetchall()}

        if mode in ("all", "players"):
            print("\n[2/4] Loading NFL players ...")
            player_uuid = load_players(conn, team_uuid)
        else:
            cur = conn.cursor()
            cur.execute("SELECT gsis_id, id FROM profb_players WHERE season=%s", (SEASON,))
            player_uuid = {r["gsis_id"]: str(r["id"]) for r in cur.fetchall()}

        if mode in ("all", "stats"):
            print("\n[3/4] Loading offensive/fantasy stats ...")
            ensure_defense_columns(conn)
            load_stats(conn, player_uuid)

            print("\n[4/4] Loading PFR defensive stats ...")
            load_defensive_stats(conn, player_uuid)

        elif mode == "defense":
            print("\n[1/1] Loading PFR defensive stats ...")
            ensure_defense_columns(conn)
            load_defensive_stats(conn, player_uuid)

        # Summary
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) AS n FROM profb_teams")
        nt = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) AS n FROM profb_players")
        np_ = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) AS n FROM profb_player_stats")
        ns = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) AS n FROM profb_player_stats WHERE def_tackles IS NOT NULL")
        nd = cur.fetchone()["n"]
        print(f"\n=== NFL done: {nt} teams, {np_} players, {ns} stat rows ({nd} with def stats) ===")

    finally:
        conn.close()


if __name__ == "__main__":
    main()
