#!/usr/bin/env python3
"""
College Football Data (CFBD) Scraper
=====================================
Pulls 2024 player season stats, player PPA, and team ratings from the
CFBD API using the cfbd Python package.

API usage (very conservative — well within 1,000 calls/month free tier):
  ~20-30 calls for player stats (one per conference)
  1  call  for player PPA
  1  call  for SP+ ratings
  1  call  for SRS ratings
  1  call  for Elo ratings
  ─────────────────────────
  ~25-35 total calls

DB tables:
  cfb_player_season_stats  — per-player, per-category season totals (JSONB stats)
  cfb_player_ppa           — player predicted points added
  cfb_team_ratings         — SP+, SRS, Elo per team per season

Usage:
    python3 cfbd_scraper.py
    python3 cfbd_scraper.py --year 2023
    python3 cfbd_scraper.py --stats-only
    python3 cfbd_scraper.py --ratings-only
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time

import cfbd
import psycopg

sys.path.insert(0, os.path.dirname(__file__))
from config import DB_CONFIG

# ── Config ────────────────────────────────────────────────────────────────────

API_KEY = os.getenv(
    "CFBD_API_KEY",
    "Of1owfspCKaUO4PqaGMsBzji/e4HEFWLrQBFexgAdcAP9aUbO5OtMl/uaKtVHCOO",
)
YEAR    = 2024
DELAY   = 1.0   # seconds between API calls

# FBS conferences (2024 season)
FBS_CONFERENCES = [
    "ACC", "American", "Big 12", "Big Ten", "CUSA", "MAC",
    "Mountain West", "SEC", "Sun Belt", "Ind",
]
# FCS conferences (top ones with decent stats coverage)
FCS_CONFERENCES = [
    "ASUN", "Big South", "CAA", "Missouri Valley",
    "NEC", "OVC", "Patriot", "Pioneer", "Southern",
    "Southland", "SWAC", "WAC",
]

# ── DB Schema ─────────────────────────────────────────────────────────────────

CREATE_SQL = """
CREATE TABLE IF NOT EXISTS cfb_player_season_stats (
    id           SERIAL PRIMARY KEY,
    player_id    BIGINT,
    player       TEXT    NOT NULL,
    team         TEXT,
    conference   TEXT,
    position     TEXT,
    season       INT     NOT NULL,
    category     TEXT    NOT NULL,   -- passing, rushing, receiving, defensive, etc.
    stats        JSONB   NOT NULL,   -- { stat_type: value, ... }
    created_at   TIMESTAMPTZ DEFAULT now(),
    UNIQUE (player_id, player, team, season, category)
);
CREATE INDEX IF NOT EXISTS idx_cfb_pss_player_id ON cfb_player_season_stats (player_id);
CREATE INDEX IF NOT EXISTS idx_cfb_pss_team      ON cfb_player_season_stats (team);
CREATE INDEX IF NOT EXISTS idx_cfb_pss_season    ON cfb_player_season_stats (season);

CREATE TABLE IF NOT EXISTS cfb_player_ppa (
    id           SERIAL PRIMARY KEY,
    player_id    BIGINT,
    player       TEXT    NOT NULL,
    team         TEXT,
    conference   TEXT,
    position     TEXT,
    season       INT     NOT NULL,
    avg_ppa_all        NUMERIC(8,4),
    avg_ppa_pass       NUMERIC(8,4),
    avg_ppa_rush       NUMERIC(8,4),
    total_ppa_all      NUMERIC(10,4),
    total_ppa_pass     NUMERIC(10,4),
    total_ppa_rush     NUMERIC(10,4),
    created_at   TIMESTAMPTZ DEFAULT now(),
    UNIQUE (player_id, player, team, season)
);
CREATE INDEX IF NOT EXISTS idx_cfb_ppa_player_id ON cfb_player_ppa (player_id);

CREATE TABLE IF NOT EXISTS cfb_team_ratings (
    id           SERIAL PRIMARY KEY,
    team         TEXT    NOT NULL,
    conference   TEXT,
    season       INT     NOT NULL,
    -- SP+
    sp_overall   NUMERIC(8,4),
    sp_offense   NUMERIC(8,4),
    sp_defense   NUMERIC(8,4),
    -- SRS
    srs_rating   NUMERIC(8,4),
    -- Elo
    elo          NUMERIC(8,2),
    created_at   TIMESTAMPTZ DEFAULT now(),
    UNIQUE (team, season)
);
"""

# ── API Client ────────────────────────────────────────────────────────────────

def make_client() -> cfbd.ApiClient:
    cfg             = cfbd.Configuration()
    cfg.access_token = API_KEY
    return cfbd.ApiClient(cfg)


# ── Player Season Stats ────────────────────────────────────────────────────────

def pull_player_stats(client: cfbd.ApiClient, year: int, conn) -> int:
    """Pull per-player season stats for all FBS + FCS conferences."""
    api    = cfbd.StatsApi(client)
    total  = 0
    # Pivot rows into {player_id+team+category -> {stat_type: value}}
    grouped: dict[tuple, dict] = {}
    meta:    dict[tuple, dict] = {}  # identity fields

    all_conferences = FBS_CONFERENCES + FCS_CONFERENCES
    print(f"  Pulling player stats across {len(all_conferences)} conferences...")

    for conf in all_conferences:
        try:
            rows = api.get_player_season_stats(year=year, conference=conf)
        except Exception as e:
            print(f"    [{conf}] error: {e}")
            time.sleep(DELAY * 5)
            continue
        time.sleep(DELAY)

        for r in rows:
            key = (r.player_id or 0, r.player or "", r.team or "", r.category or "")
            if key not in grouped:
                grouped[key] = {}
                meta[key] = {
                    "player_id":  r.player_id,
                    "player":     r.player or "",
                    "team":       r.team or "",
                    "conference": r.conference or conf,
                    "position":   r.position or "",
                    "season":     year,
                    "category":   r.category or "",
                }
            if r.stat_type:
                grouped[key][r.stat_type] = r.stat

        print(f"    [{conf}] {len(rows):,} rows")

    # Upsert to DB
    print(f"  Inserting {len(grouped)} player-category records...")
    cur = conn.cursor()
    for key, stats in grouped.items():
        m = meta[key]
        cur.execute("""
            INSERT INTO cfb_player_season_stats
                (player_id, player, team, conference, position, season, category, stats)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (player_id, player, team, season, category)
            DO UPDATE SET stats=EXCLUDED.stats, conference=EXCLUDED.conference,
                          position=EXCLUDED.position
        """, (
            m["player_id"], m["player"], m["team"], m["conference"],
            m["position"], year, m["category"], json.dumps(stats),
        ))
        total += 1

    conn.commit()
    return total


# ── Player PPA ────────────────────────────────────────────────────────────────

def pull_player_ppa(client: cfbd.ApiClient, year: int, conn) -> int:
    api  = cfbd.MetricsApi(client)
    rows = api.get_predicted_points_added_by_player_season(year=year)
    time.sleep(DELAY)
    print(f"  PPA: {len(rows)} player records")
    cur  = conn.cursor()
    n    = 0
    for r in rows:
        ppa = r.averages if hasattr(r, "averages") and r.averages else None
        tot = r.totals   if hasattr(r, "totals")   and r.totals   else None

        def _avg(obj, attr):
            v = getattr(obj, attr, None) if obj else None
            return float(v) if v is not None else None

        cur.execute("""
            INSERT INTO cfb_player_ppa
                (player_id, player, team, conference, position, season,
                 avg_ppa_all, avg_ppa_pass, avg_ppa_rush,
                 total_ppa_all, total_ppa_pass, total_ppa_rush)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (player_id, player, team, season) DO UPDATE SET
                avg_ppa_all=EXCLUDED.avg_ppa_all,
                avg_ppa_pass=EXCLUDED.avg_ppa_pass,
                avg_ppa_rush=EXCLUDED.avg_ppa_rush,
                total_ppa_all=EXCLUDED.total_ppa_all,
                total_ppa_pass=EXCLUDED.total_ppa_pass,
                total_ppa_rush=EXCLUDED.total_ppa_rush
        """, (
            getattr(r, "player_id", None), getattr(r, "name", "") or "",
            getattr(r, "team", "") or "", getattr(r, "conference", "") or "",
            getattr(r, "position", "") or "", year,
            _avg(ppa, "all"), _avg(ppa, "pass"), _avg(ppa, "rush"),
            _avg(tot, "all"), _avg(tot, "pass"), _avg(tot, "rush"),
        ))
        n += 1

    conn.commit()
    return n


# ── Team Ratings ──────────────────────────────────────────────────────────────

def pull_team_ratings(client: cfbd.ApiClient, year: int, conn) -> int:
    ratings_api = cfbd.RatingsApi(client)

    # Build team lookup: team -> {sp_*, srs, elo}
    teams: dict[str, dict] = {}

    def _set(team, conf, field, val):
        if team not in teams:
            teams[team] = {"conference": conf}
        if val is not None:
            teams[team][field] = float(val)

    # SP+
    print("  Pulling SP+...")
    try:
        sp_rows = ratings_api.get_sp(year=year)
        time.sleep(DELAY)
        for r in sp_rows:
            t    = getattr(r, "team", "") or ""
            conf = getattr(r, "conference", "") or ""
            off  = getattr(r, "offense",  None)
            defe = getattr(r, "defense",  None)
            overall = getattr(r, "rating", None) or getattr(r, "overall", None)
            off_rating  = getattr(off,  "rating", None) if off  else getattr(r, "offense_rating",  None)
            def_rating  = getattr(defe, "rating", None) if defe else getattr(r, "defense_rating",  None)
            _set(t, conf, "sp_overall", overall)
            _set(t, conf, "sp_offense", off_rating)
            _set(t, conf, "sp_defense", def_rating)
        print(f"    SP+: {len(sp_rows)} teams")
    except Exception as e:
        print(f"    SP+ error: {e}")

    # SRS
    print("  Pulling SRS...")
    try:
        srs_rows = ratings_api.get_srs(year=year)
        time.sleep(DELAY)
        for r in srs_rows:
            t    = getattr(r, "team", "") or ""
            conf = getattr(r, "conference", "") or ""
            val  = getattr(r, "rating", None)
            _set(t, conf, "srs_rating", val)
        print(f"    SRS: {len(srs_rows)} teams")
    except Exception as e:
        print(f"    SRS error: {e}")

    # Elo
    print("  Pulling Elo...")
    try:
        elo_rows = ratings_api.get_elo(year=year)
        time.sleep(DELAY)
        for r in elo_rows:
            t    = getattr(r, "team", "") or ""
            conf = getattr(r, "conference", "") or ""
            val  = getattr(r, "elo", None)
            _set(t, conf, "elo", val)
        print(f"    Elo: {len(elo_rows)} teams")
    except Exception as e:
        print(f"    Elo error: {e}")

    # Upsert
    cur = conn.cursor()
    n = 0
    for team, d in teams.items():
        if not team:
            continue
        cur.execute("""
            INSERT INTO cfb_team_ratings
                (team, conference, season, sp_overall, sp_offense, sp_defense, srs_rating, elo)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (team, season) DO UPDATE SET
                conference=EXCLUDED.conference,
                sp_overall=COALESCE(EXCLUDED.sp_overall, cfb_team_ratings.sp_overall),
                sp_offense=COALESCE(EXCLUDED.sp_offense, cfb_team_ratings.sp_offense),
                sp_defense=COALESCE(EXCLUDED.sp_defense, cfb_team_ratings.sp_defense),
                srs_rating=COALESCE(EXCLUDED.srs_rating, cfb_team_ratings.srs_rating),
                elo=COALESCE(EXCLUDED.elo, cfb_team_ratings.elo)
        """, (
            team,
            d.get("conference"),
            year,
            d.get("sp_overall"),
            d.get("sp_offense"),
            d.get("sp_defense"),
            d.get("srs_rating"),
            d.get("elo"),
        ))
        n += 1

    conn.commit()
    return n


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--year", type=int, default=YEAR)
    parser.add_argument("--stats-only",   action="store_true")
    parser.add_argument("--ratings-only", action="store_true")
    parser.add_argument("--ppa-only",     action="store_true")
    args = parser.parse_args()

    year   = args.year
    client = make_client()

    print(f"\n=== CFBD Scraper — {year} ===")

    with psycopg.connect(
        host=DB_CONFIG["host"], port=DB_CONFIG["port"], dbname=DB_CONFIG["dbname"],
        row_factory=psycopg.rows.dict_row, autocommit=False,
    ) as conn:
        conn.execute(CREATE_SQL)
        conn.commit()

        do_all = not (args.stats_only or args.ratings_only or args.ppa_only)

        if do_all or args.stats_only:
            print("\n[1/3] Player Season Stats")
            n = pull_player_stats(client, year, conn)
            print(f"  → {n:,} player-category records inserted")

        if do_all or args.ppa_only:
            print("\n[2/3] Player PPA")
            n = pull_player_ppa(client, year, conn)
            print(f"  → {n:,} player PPA records inserted")

        if do_all or args.ratings_only:
            print("\n[3/3] Team Ratings (SP+, SRS, Elo)")
            n = pull_team_ratings(client, year, conn)
            print(f"  → {n:,} team rating records inserted")

        # Summary
        print("\n=== DB Summary ===")
        for tbl in ["cfb_player_season_stats", "cfb_player_ppa", "cfb_team_ratings"]:
            r = conn.execute(f"SELECT COUNT(*) AS n FROM {tbl}").fetchone()
            print(f"  {tbl:<35} {r['n']:>8,} rows")

    print("\nDone.")


if __name__ == "__main__":
    main()
