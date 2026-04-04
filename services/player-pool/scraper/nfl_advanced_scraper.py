#!/usr/bin/env python3
"""
NFL Advanced Stats Scraper — nfl-data-py
=========================================
Pulls weekly stats, seasonal stats, seasonal rosters, and combine data
from nfl-data-py and stores in profb_advanced_* tables.

Links to existing profb_players via player_id (gsis_id).

Tables written:
  profb_weekly_stats     — per-player weekly stats (2025 regular + post)
  profb_seasonal_stats   — per-player season aggregates (2025)
  profb_seasonal_rosters — roster snapshot with height/weight/age (2025)
  profb_combine          — combine measurables (2020-2025)

Usage:
    python3 nfl_advanced_scraper.py
    python3 nfl_advanced_scraper.py --weekly-only
    python3 nfl_advanced_scraper.py --rosters-only
    python3 nfl_advanced_scraper.py --combine-only
"""
from __future__ import annotations

import argparse
import os
import sys
import warnings

import psycopg

warnings.filterwarnings("ignore")

sys.path.insert(0, os.path.dirname(__file__))
from config import DB_CONFIG

# ── Schema ────────────────────────────────────────────────────────────────────

CREATE_SQL = """
CREATE TABLE IF NOT EXISTS profb_weekly_stats (
    id                    SERIAL PRIMARY KEY,
    player_id             TEXT,            -- nfl-data-py gsis_id
    player_name           TEXT,
    player_display_name   TEXT,
    position              TEXT,
    position_group        TEXT,
    team                  TEXT,
    opponent_team         TEXT,
    season                INT  NOT NULL,
    week                  INT  NOT NULL,
    season_type           TEXT,
    -- Passing
    completions           INT,
    attempts              INT,
    passing_yards         INT,
    passing_tds           INT,
    interceptions         INT,
    passing_air_yards     INT,
    passing_yards_after_catch INT,
    passing_epa           NUMERIC(10,4),
    -- Rushing
    carries               INT,
    rushing_yards         INT,
    rushing_tds           INT,
    rushing_epa           NUMERIC(10,4),
    -- Receiving
    receptions            INT,
    targets               INT,
    receiving_yards       INT,
    receiving_tds         INT,
    receiving_air_yards   INT,
    receiving_yards_after_catch INT,
    receiving_epa         NUMERIC(10,4),
    target_share          NUMERIC(6,4),
    air_yards_share       NUMERIC(6,4),
    -- Fantasy
    fantasy_points        NUMERIC(8,2),
    fantasy_points_ppr    NUMERIC(8,2),
    -- Special
    special_teams_tds     INT,
    created_at            TIMESTAMPTZ DEFAULT now(),
    UNIQUE (player_id, season, week, season_type)
);
CREATE INDEX IF NOT EXISTS idx_profb_weekly_player ON profb_weekly_stats (player_id);
CREATE INDEX IF NOT EXISTS idx_profb_weekly_season ON profb_weekly_stats (season, week);
CREATE INDEX IF NOT EXISTS idx_profb_weekly_team   ON profb_weekly_stats (team);

CREATE TABLE IF NOT EXISTS profb_seasonal_stats (
    id                    SERIAL PRIMARY KEY,
    player_id             TEXT,
    player_name           TEXT,
    position              TEXT,
    season                INT  NOT NULL,
    season_type           TEXT,
    games                 INT,
    -- Passing
    completions           INT,
    attempts              INT,
    passing_yards         INT,
    passing_tds           INT,
    interceptions         INT,
    sacks                 INT,
    passing_air_yards     INT,
    passing_yards_after_catch INT,
    passing_first_downs   INT,
    passing_epa           NUMERIC(10,4),
    pacr                  NUMERIC(8,4),
    dakota                NUMERIC(8,4),
    -- Rushing
    carries               INT,
    rushing_yards         INT,
    rushing_tds           INT,
    rushing_first_downs   INT,
    rushing_epa           NUMERIC(10,4),
    -- Receiving
    receptions            INT,
    targets               INT,
    receiving_yards       INT,
    receiving_tds         INT,
    receiving_air_yards   INT,
    receiving_yards_after_catch INT,
    receiving_first_downs INT,
    receiving_epa         NUMERIC(10,4),
    racr                  NUMERIC(8,4),
    target_share          NUMERIC(6,4),
    air_yards_share       NUMERIC(6,4),
    wopr                  NUMERIC(8,4),
    -- Fantasy
    fantasy_points        NUMERIC(8,2),
    fantasy_points_ppr    NUMERIC(8,2),
    special_teams_tds     INT,
    created_at            TIMESTAMPTZ DEFAULT now(),
    UNIQUE (player_id, season, season_type)
);
CREATE INDEX IF NOT EXISTS idx_profb_seasonal_player ON profb_seasonal_stats (player_id);

CREATE TABLE IF NOT EXISTS profb_seasonal_rosters (
    id                SERIAL PRIMARY KEY,
    player_id         TEXT,
    player_name       TEXT,
    first_name        TEXT,
    last_name         TEXT,
    position          TEXT,
    depth_chart_pos   TEXT,
    jersey_number     TEXT,
    team              TEXT,
    season            INT  NOT NULL,
    status            TEXT,
    height            TEXT,
    weight            INT,
    birth_date        DATE,
    age               NUMERIC(5,2),
    college           TEXT,
    years_exp         INT,
    headshot_url      TEXT,
    entry_year        INT,
    draft_club        TEXT,
    draft_number      INT,
    created_at        TIMESTAMPTZ DEFAULT now(),
    UNIQUE (player_id, season, team)
);
CREATE INDEX IF NOT EXISTS idx_profb_roster_player ON profb_seasonal_rosters (player_id);
CREATE INDEX IF NOT EXISTS idx_profb_roster_team   ON profb_seasonal_rosters (team, season);

CREATE TABLE IF NOT EXISTS profb_combine (
    id                SERIAL PRIMARY KEY,
    player_id         TEXT,
    player_name       TEXT,
    pos               TEXT,
    school            TEXT,
    draft_year        INT,
    draft_team        TEXT,
    draft_round       INT,
    draft_pick        INT,
    -- Measurables
    ht                TEXT,
    wt                INT,
    forty_yd          NUMERIC(5,3),
    vertical          NUMERIC(5,2),
    broad_jump        INT,
    cone              NUMERIC(5,3),
    shuttle           NUMERIC(5,3),
    bench             INT,
    created_at        TIMESTAMPTZ DEFAULT now(),
    UNIQUE (player_name, pos, draft_year)
);
CREATE INDEX IF NOT EXISTS idx_profb_combine_player ON profb_combine (player_id);
"""

# ── Helpers ───────────────────────────────────────────────────────────────────

def _safe(row, col, cast=None):
    """Safely extract value from pandas row, casting if needed."""
    import math
    v = row.get(col) if hasattr(row, "get") else getattr(row, col, None)
    if v is None or (isinstance(v, float) and math.isnan(v)):
        return None
    if cast:
        try:
            return cast(v)
        except (ValueError, TypeError):
            return None
    return v


def _str(row, col):
    v = _safe(row, col)
    return str(v).strip() if v is not None else None


def _int(row, col):
    return _safe(row, col, int)


def _float(row, col):
    return _safe(row, col, float)


def _date(row, col):
    v = _safe(row, col)
    if not v:
        return None
    try:
        import pandas as pd
        ts = pd.to_datetime(v, errors="coerce")
        return ts.date() if ts and ts is not pd.NaT else None
    except Exception:
        return None


# ── Weekly Stats ──────────────────────────────────────────────────────────────

def pull_weekly(conn, seasons: list[int]) -> int:
    import nfl_data_py as nfl
    print(f"  Fetching weekly data for {seasons}...")
    df = nfl.import_weekly_data(seasons)
    print(f"  {len(df):,} rows ({len(df.columns)} cols)")

    cur = conn.cursor()
    n = 0
    for _, row in df.iterrows():
        cur.execute("""
            INSERT INTO profb_weekly_stats (
                player_id, player_name, player_display_name, position, position_group,
                team, opponent_team, season, week, season_type,
                completions, attempts, passing_yards, passing_tds, interceptions,
                passing_air_yards, passing_yards_after_catch, passing_epa,
                carries, rushing_yards, rushing_tds, rushing_epa,
                receptions, targets, receiving_yards, receiving_tds,
                receiving_air_yards, receiving_yards_after_catch, receiving_epa,
                target_share, air_yards_share,
                fantasy_points, fantasy_points_ppr, special_teams_tds
            ) VALUES (
                %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                %s,%s,%s,%s,%s,%s,%s,%s,
                %s,%s,%s,%s,
                %s,%s,%s,%s,%s,%s,%s,%s,%s,
                %s,%s,%s
            )
            ON CONFLICT (player_id, season, week, season_type)
            DO UPDATE SET
                passing_yards=EXCLUDED.passing_yards,
                rushing_yards=EXCLUDED.rushing_yards,
                receiving_yards=EXCLUDED.receiving_yards,
                fantasy_points_ppr=EXCLUDED.fantasy_points_ppr
        """, (
            _str(row, "player_id"),
            _str(row, "player_name"),
            _str(row, "player_display_name"),
            _str(row, "position"),
            _str(row, "position_group"),
            _str(row, "recent_team") or _str(row, "team"),
            _str(row, "opponent_team"),
            _int(row, "season"),
            _int(row, "week"),
            _str(row, "season_type"),
            _int(row, "completions"),
            _int(row, "attempts"),
            _int(row, "passing_yards"),
            _int(row, "passing_tds"),
            _int(row, "interceptions"),
            _int(row, "passing_air_yards"),
            _int(row, "passing_yards_after_catch"),
            _float(row, "passing_epa"),
            _int(row, "carries"),
            _int(row, "rushing_yards"),
            _int(row, "rushing_tds"),
            _float(row, "rushing_epa"),
            _int(row, "receptions"),
            _int(row, "targets"),
            _int(row, "receiving_yards"),
            _int(row, "receiving_tds"),
            _int(row, "receiving_air_yards"),
            _int(row, "receiving_yards_after_catch"),
            _float(row, "receiving_epa"),
            _float(row, "target_share"),
            _float(row, "air_yards_share"),
            _float(row, "fantasy_points"),
            _float(row, "fantasy_points_ppr"),
            _int(row, "special_teams_tds"),
        ))
        n += 1

    conn.commit()
    return n


# ── Seasonal Stats ────────────────────────────────────────────────────────────

def pull_seasonal(conn, seasons: list[int]) -> int:
    import nfl_data_py as nfl
    print(f"  Fetching seasonal data for {seasons}...")
    df = nfl.import_seasonal_data(seasons)
    print(f"  {len(df):,} rows ({len(df.columns)} cols)")

    cur = conn.cursor()
    n = 0
    for _, row in df.iterrows():
        cur.execute("""
            INSERT INTO profb_seasonal_stats (
                player_id, season, season_type, games,
                completions, attempts, passing_yards, passing_tds, interceptions,
                sacks, passing_air_yards, passing_yards_after_catch, passing_first_downs,
                passing_epa, pacr, dakota,
                carries, rushing_yards, rushing_tds, rushing_first_downs, rushing_epa,
                receptions, targets, receiving_yards, receiving_tds,
                receiving_air_yards, receiving_yards_after_catch, receiving_first_downs,
                receiving_epa, racr, target_share, air_yards_share, wopr,
                fantasy_points, fantasy_points_ppr, special_teams_tds
            ) VALUES (
                %s,%s,%s,%s,
                %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                %s,%s,%s,%s,%s,
                %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                %s,%s,%s
            )
            ON CONFLICT (player_id, season, season_type) DO UPDATE SET
                games=EXCLUDED.games,
                passing_yards=EXCLUDED.passing_yards,
                rushing_yards=EXCLUDED.rushing_yards,
                receiving_yards=EXCLUDED.receiving_yards,
                fantasy_points_ppr=EXCLUDED.fantasy_points_ppr
        """, (
            _str(row, "player_id"),
            _int(row, "season"),
            _str(row, "season_type"),
            _int(row, "games"),
            _int(row, "completions"), _int(row, "attempts"),
            _int(row, "passing_yards"), _int(row, "passing_tds"),
            _int(row, "interceptions"), _int(row, "sacks"),
            _int(row, "passing_air_yards"), _int(row, "passing_yards_after_catch"),
            _int(row, "passing_first_downs"),
            _float(row, "passing_epa"), _float(row, "pacr"), _float(row, "dakota"),
            _int(row, "carries"), _int(row, "rushing_yards"),
            _int(row, "rushing_tds"), _int(row, "rushing_first_downs"),
            _float(row, "rushing_epa"),
            _int(row, "receptions"), _int(row, "targets"),
            _int(row, "receiving_yards"), _int(row, "receiving_tds"),
            _int(row, "receiving_air_yards"), _int(row, "receiving_yards_after_catch"),
            _int(row, "receiving_first_downs"),
            _float(row, "receiving_epa"), _float(row, "racr"),
            _float(row, "target_share"), _float(row, "air_yards_share"),
            _float(row, "wopr_x") or _float(row, "wopr_y"),
            _float(row, "fantasy_points"), _float(row, "fantasy_points_ppr"),
            _int(row, "special_teams_tds"),
        ))
        n += 1

    conn.commit()
    return n


# ── Rosters ───────────────────────────────────────────────────────────────────

def pull_rosters(conn, seasons: list[int]) -> int:
    import nfl_data_py as nfl
    print(f"  Fetching seasonal rosters for {seasons}...")
    df = nfl.import_seasonal_rosters(seasons)
    print(f"  {len(df):,} rows ({len(df.columns)} cols)")

    cur = conn.cursor()
    n = 0
    for _, row in df.iterrows():
        pid = _str(row, "player_id") or _str(row, "gsis_id")
        if not pid:
            continue
        cur.execute("""
            INSERT INTO profb_seasonal_rosters (
                player_id, player_name, first_name, last_name, position,
                depth_chart_pos, jersey_number, team, season, status,
                height, weight, birth_date, age, college,
                years_exp, headshot_url, entry_year, draft_club, draft_number
            ) VALUES (
                %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                %s,%s,%s,%s,%s,%s,%s,%s,%s,%s
            )
            ON CONFLICT (player_id, season, team) DO UPDATE SET
                position=COALESCE(EXCLUDED.position, profb_seasonal_rosters.position),
                weight=COALESCE(EXCLUDED.weight, profb_seasonal_rosters.weight),
                height=COALESCE(EXCLUDED.height, profb_seasonal_rosters.height),
                status=EXCLUDED.status
        """, (
            pid,
            _str(row, "player_name"),
            _str(row, "first_name"),
            _str(row, "last_name"),
            _str(row, "position"),
            _str(row, "depth_chart_position"),
            _str(row, "jersey_number"),
            _str(row, "team"),
            _int(row, "season"),
            _str(row, "status"),
            _str(row, "height"),
            _int(row, "weight"),
            _date(row, "birth_date"),
            _float(row, "age"),
            _str(row, "college"),
            _int(row, "years_exp"),
            _str(row, "headshot_url"),
            _int(row, "entry_year"),
            _str(row, "draft_club"),
            _int(row, "draft_number"),
        ))
        n += 1

    conn.commit()
    return n


# ── Combine ───────────────────────────────────────────────────────────────────

def pull_combine(conn, seasons: list[int]) -> int:
    import nfl_data_py as nfl
    print(f"  Fetching combine data for {seasons}...")
    df = nfl.import_combine_data(seasons)
    print(f"  {len(df):,} rows ({len(df.columns)} cols)")

    cur = conn.cursor()
    n = 0
    for _, row in df.iterrows():
        name = _str(row, "player_name")
        if not name:
            continue
        cur.execute("""
            INSERT INTO profb_combine (
                player_id, player_name, pos, school, draft_year,
                draft_team, draft_round, draft_pick,
                ht, wt, forty_yd, vertical, broad_jump, cone, shuttle, bench
            ) VALUES (
                %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
            )
            ON CONFLICT (player_name, pos, draft_year) DO UPDATE SET
                forty_yd=COALESCE(EXCLUDED.forty_yd, profb_combine.forty_yd),
                vertical=COALESCE(EXCLUDED.vertical, profb_combine.vertical),
                broad_jump=COALESCE(EXCLUDED.broad_jump, profb_combine.broad_jump),
                cone=COALESCE(EXCLUDED.cone, profb_combine.cone),
                shuttle=COALESCE(EXCLUDED.shuttle, profb_combine.shuttle),
                bench=COALESCE(EXCLUDED.bench, profb_combine.bench),
                wt=COALESCE(EXCLUDED.wt, profb_combine.wt),
                ht=COALESCE(EXCLUDED.ht, profb_combine.ht),
                draft_team=COALESCE(EXCLUDED.draft_team, profb_combine.draft_team),
                draft_round=COALESCE(EXCLUDED.draft_round, profb_combine.draft_round),
                draft_pick=COALESCE(EXCLUDED.draft_pick, profb_combine.draft_pick)
        """, (
            _str(row, "player_id") or _str(row, "gsis_id"),
            name,
            _str(row, "pos"),
            _str(row, "school"),
            _int(row, "draft_year") or _int(row, "year"),
            _str(row, "draft_team") or _str(row, "team"),
            _int(row, "draft_round") or _int(row, "round"),
            _int(row, "draft_pick") or _int(row, "pick"),
            _str(row, "ht"),
            _int(row, "wt"),
            _float(row, "forty_yd"),
            _float(row, "vertical"),
            _int(row, "broad_jump"),
            _float(row, "cone"),
            _float(row, "shuttle"),
            _int(row, "bench"),
        ))
        n += 1

    conn.commit()
    return n


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--weekly-only",   action="store_true")
    parser.add_argument("--seasonal-only", action="store_true")
    parser.add_argument("--rosters-only",  action="store_true")
    parser.add_argument("--combine-only",  action="store_true")
    args = parser.parse_args()

    do_all = not (args.weekly_only or args.seasonal_only or
                  args.rosters_only or args.combine_only)

    print("\n=== NFL Advanced Stats Scraper ===")

    with psycopg.connect(
        host=DB_CONFIG["host"], port=DB_CONFIG["port"], dbname=DB_CONFIG["dbname"],
        row_factory=psycopg.rows.dict_row, autocommit=False,
    ) as conn:
        conn.execute(CREATE_SQL)
        conn.commit()

        # nfl-data-py season labeling: stats use the season start year.
        # As of April 2026, the 2025 season stats haven't been published yet
        # (or 2025 = 2025-26 preseason rosters only). Use 2024 for stats.
        stats_seasons   = [2024]   # 2024 NFL season (Sept 2024–Feb 2025)
        roster_seasons  = [2025]   # 2025 rosters (available)
        combine_seasons = [2020, 2021, 2022, 2023, 2024, 2025]

        if do_all or args.weekly_only:
            print("\n[1/4] Weekly Stats (2024 — most recent available)")
            n = pull_weekly(conn, stats_seasons)
            print(f"  → {n:,} weekly rows inserted")

        if do_all or args.seasonal_only:
            print("\n[2/4] Seasonal Stats (2024 — most recent available)")
            n = pull_seasonal(conn, stats_seasons)
            print(f"  → {n:,} seasonal rows inserted")

        if do_all or args.rosters_only:
            print("\n[3/4] Seasonal Rosters (2025)")
            n = pull_rosters(conn, roster_seasons)
            print(f"  → {n:,} roster rows inserted")

        if do_all or args.combine_only:
            print("\n[4/4] Combine Data (2020-2025)")
            n = pull_combine(conn, combine_seasons)
            print(f"  → {n:,} combine rows inserted")

        # Summary
        print("\n=== DB Summary ===")
        for tbl in ["profb_weekly_stats", "profb_seasonal_stats",
                    "profb_seasonal_rosters", "profb_combine"]:
            try:
                r = conn.execute(f"SELECT COUNT(*) AS n FROM {tbl}").fetchone()
                print(f"  {tbl:<30} {r['n']:>8,} rows")
            except Exception as e:
                print(f"  {tbl}: {e}")

    print("\nDone.")


if __name__ == "__main__":
    main()
