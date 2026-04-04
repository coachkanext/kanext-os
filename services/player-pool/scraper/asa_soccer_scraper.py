#!/usr/bin/env python3
"""
ASA (American Soccer Analysis) Advanced Stats Scraper
=======================================================
Source: americansocceranalysis.com API via itscalledsoccer package
Covers: MLS, NWSL, USL Championship, USL League One, MLS NEXT Pro

Metrics pulled per player per season:
  • xG, xA, goals_minus_xG, assists_minus_xA, shots, shots_on_target
  • Goals Added (6 components: dribbling, fouling, interrupting, passing, receiving, shooting)

Writes to:
  prosc_asa_stats — keyed by (asa_player_id, competition, season)
  Soft-links prosc_players via player_name exact/partial match

Usage:
    python3 asa_soccer_scraper.py                  # all leagues, season 2024
    python3 asa_soccer_scraper.py --season 2023    # older season
    python3 asa_soccer_scraper.py --dry-run
"""
from __future__ import annotations

import argparse
import os
import sys
import math
from typing import Optional

import psycopg
from psycopg.rows import dict_row

sys.path.insert(0, os.path.dirname(__file__))
from config import DB_CONFIG

# ── Config ─────────────────────────────────────────────────────────────────────

DEFAULT_SEASON = "2024"

# ASA league codes → display names
LEAGUES = {
    "mls":   "Major League Soccer",
    "nwsl":  "National Women's Soccer League",
    "uslc":  "USL Championship",
    "usl1":  "USL League One",
    "mlsnp": "MLS NEXT Pro",
}

# ── DDL ────────────────────────────────────────────────────────────────────────

DDL = """
CREATE TABLE IF NOT EXISTS prosc_asa_stats (
    id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    asa_player_id           VARCHAR NOT NULL,
    player_name             VARCHAR NOT NULL,
    team_id                 VARCHAR,
    team_name               VARCHAR,
    competition             VARCHAR NOT NULL,
    season                  VARCHAR NOT NULL,
    general_position        VARCHAR,

    -- Shooting / xGoals
    minutes_played          INTEGER,
    shots                   INTEGER,
    shots_on_target         INTEGER,
    goals                   INTEGER,
    xgoals                  NUMERIC(8,4),
    goals_minus_xgoals      NUMERIC(8,4),

    -- Passing / xAssists
    key_passes              INTEGER,
    primary_assists         INTEGER,
    xassists                NUMERIC(8,4),
    assists_minus_xassists  NUMERIC(8,4),

    -- Goals Added (6 components, raw)
    goals_added_raw         NUMERIC(8,4),
    goals_added_above_avg   NUMERIC(8,4),
    ga_dribbling            NUMERIC(8,4),
    ga_fouling              NUMERIC(8,4),
    ga_interrupting         NUMERIC(8,4),
    ga_passing              NUMERIC(8,4),
    ga_receiving            NUMERIC(8,4),
    ga_shooting             NUMERIC(8,4),

    -- Soft link to ESPN prosc_players (best-effort name match)
    prosc_player_id         UUID REFERENCES prosc_players(id),

    created_at              TIMESTAMPTZ DEFAULT now(),
    updated_at              TIMESTAMPTZ DEFAULT now(),
    UNIQUE (asa_player_id, competition, season)
);
CREATE INDEX IF NOT EXISTS prosc_asa_stats_comp_season
    ON prosc_asa_stats(competition, season);
"""


# ── DB helpers ─────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg.connect(
        host=DB_CONFIG["host"], port=DB_CONFIG["port"],
        dbname=DB_CONFIG["dbname"], row_factory=dict_row, autocommit=False,
    )


def ensure_table(conn):
    conn.execute(DDL)
    conn.commit()


def _safe(v, cast):
    try:
        if v is None:
            return None
        f = float(v)
        if math.isnan(f) or math.isinf(f):
            return None
        return cast(round(f, 4) if cast is float else f)
    except (TypeError, ValueError):
        return None


# ── Player/Team name lookup ────────────────────────────────────────────────────

def build_player_map(asa, leagues: list[str]) -> dict[str, str]:
    """Returns {asa_player_id: player_name}."""
    try:
        df = asa.get_players(leagues=leagues)
        return {str(r["player_id"]): str(r.get("player_name", "")).strip()
                for _, r in df.iterrows() if r.get("player_id")}
    except Exception as e:
        print(f"  [warn] get_players failed: {e}")
        return {}


def build_team_map(asa, leagues: list[str]) -> dict[str, str]:
    """Returns {asa_team_id: team_name}."""
    try:
        df = asa.get_teams(leagues=leagues)
        return {str(r["team_id"]): str(r.get("team_name", "")).strip()
                for _, r in df.iterrows() if r.get("team_id")}
    except Exception as e:
        print(f"  [warn] get_teams failed: {e}")
        return {}


def build_prosc_lookup(conn) -> dict[str, str]:
    """Returns {lower(full_name): prosc_player_uuid}."""
    rows = conn.execute("SELECT id, full_name FROM prosc_players").fetchall()
    return {r["full_name"].lower().strip(): str(r["id"]) for r in rows}


def link_to_prosc(name: str, lookup: dict[str, str]) -> Optional[str]:
    key = name.lower().strip()
    if key in lookup:
        return lookup[key]
    # Try "Last, First" → "First Last"
    parts = key.split(",", 1)
    if len(parts) == 2:
        alt = f"{parts[1].strip()} {parts[0].strip()}"
        if alt in lookup:
            return lookup[alt]
    return None


# ── Pull + merge ───────────────────────────────────────────────────────────────

def pull_league_season(asa, league: str, season: str,
                       player_map: dict, team_map: dict) -> list[dict]:
    """
    Pull xgoals + goals_added for one league/season.
    Returns list of merged row dicts.
    """
    print(f"  [{league}] xgoals...")
    try:
        xg_df = asa.get_player_xgoals(leagues=[league], season_name=season)
        print(f"    {len(xg_df)} outfield rows")
    except Exception as e:
        print(f"    [warn] xgoals failed: {e}")
        return []

    print(f"  [{league}] goalkeeper xgoals...")
    try:
        gk_df = asa.get_goalkeeper_xgoals(leagues=[league], season_name=season)
        print(f"    {len(gk_df)} GK rows")
        import pandas as pd
        xg_df = pd.concat([xg_df, gk_df], ignore_index=True)
    except Exception as e:
        print(f"    [warn] gk xgoals failed (skipped): {e}")

    print(f"  [{league}] goals_added...")
    ga_by_pid: dict[str, dict] = {}
    try:
        ga_df = asa.get_player_goals_added(leagues=[league], season_name=season)
        for _, row in ga_df.iterrows():
            pid = str(row.get("player_id", ""))
            if not pid:
                continue
            entry = ga_by_pid.setdefault(pid, {"raw": 0.0, "above_avg": 0.0})
            for action in (row.get("data") or []):
                atype = action.get("action_type", "").lower().replace(" ", "_")
                raw_val = float(action.get("goals_added_raw", 0) or 0)
                abv_val = float(action.get("goals_added_above_avg", 0) or 0)
                entry["raw"] += raw_val
                entry["above_avg"] += abv_val
                entry[f"ga_{atype}"] = raw_val
        print(f"    {len(ga_by_pid)} players with goals_added")
    except Exception as e:
        print(f"    [warn] goals_added failed (skipped): {e}")

    # Merge
    results: list[dict] = []
    for _, row in xg_df.iterrows():
        pid = str(row.get("player_id", ""))
        tid = str(row.get("team_id", ""))
        name = player_map.get(pid, "")
        if not name:
            continue
        ga = ga_by_pid.get(pid, {})
        results.append({
            "asa_player_id": pid,
            "player_name": name,
            "team_id": tid,
            "team_name": team_map.get(tid, ""),
            "general_position": str(row.get("general_position", "") or ""),
            "minutes_played": _safe(row.get("minutes_played"), int),
            "shots": _safe(row.get("shots"), int),
            "shots_on_target": _safe(row.get("shots_on_target"), int),
            "goals": _safe(row.get("goals"), int),
            "xgoals": _safe(row.get("xgoals"), float),
            "goals_minus_xgoals": _safe(row.get("goals_minus_xgoals"), float),
            "key_passes": _safe(row.get("key_passes"), int),
            "primary_assists": _safe(row.get("primary_assists"), int),
            "xassists": _safe(row.get("xassists"), float),
            "assists_minus_xassists": _safe(row.get("primary_assists_minus_xassists"), float),
            "goals_added_raw": round(ga["raw"], 4) if ga else None,
            "goals_added_above_avg": round(ga["above_avg"], 4) if ga else None,
            "ga_dribbling":    round(ga.get("ga_dribbling", 0), 4) if ga else None,
            "ga_fouling":      round(ga.get("ga_fouling", 0), 4) if ga else None,
            "ga_interrupting": round(ga.get("ga_interrupting", 0), 4) if ga else None,
            "ga_passing":      round(ga.get("ga_passing", 0), 4) if ga else None,
            "ga_receiving":    round(ga.get("ga_receiving", 0), 4) if ga else None,
            "ga_shooting":     round(ga.get("ga_shooting", 0), 4) if ga else None,
        })

    return results


# ── Upsert ─────────────────────────────────────────────────────────────────────

def upsert_rows(conn, rows: list[dict], competition: str, season: str,
                prosc_lookup: dict[str, str]) -> tuple[int, int, int]:
    inserted = updated = linked = 0
    for row in rows:
        prosc_id = link_to_prosc(row["player_name"], prosc_lookup)
        if prosc_id:
            linked += 1
        r = conn.execute("""
            INSERT INTO prosc_asa_stats (
                asa_player_id, player_name, team_id, team_name,
                competition, season, general_position,
                minutes_played, shots, shots_on_target, goals,
                xgoals, goals_minus_xgoals,
                key_passes, primary_assists, xassists, assists_minus_xassists,
                goals_added_raw, goals_added_above_avg,
                ga_dribbling, ga_fouling, ga_interrupting,
                ga_passing, ga_receiving, ga_shooting,
                prosc_player_id
            ) VALUES (
                %(asa_player_id)s, %(player_name)s, %(team_id)s, %(team_name)s,
                %(competition)s, %(season)s, %(general_position)s,
                %(minutes_played)s, %(shots)s, %(shots_on_target)s, %(goals)s,
                %(xgoals)s, %(goals_minus_xgoals)s,
                %(key_passes)s, %(primary_assists)s, %(xassists)s, %(assists_minus_xassists)s,
                %(goals_added_raw)s, %(goals_added_above_avg)s,
                %(ga_dribbling)s, %(ga_fouling)s, %(ga_interrupting)s,
                %(ga_passing)s, %(ga_receiving)s, %(ga_shooting)s,
                %(prosc_player_id)s
            )
            ON CONFLICT (asa_player_id, competition, season) DO UPDATE SET
                player_name             = EXCLUDED.player_name,
                team_name               = EXCLUDED.team_name,
                minutes_played          = EXCLUDED.minutes_played,
                shots                   = EXCLUDED.shots,
                goals                   = EXCLUDED.goals,
                xgoals                  = EXCLUDED.xgoals,
                goals_minus_xgoals      = EXCLUDED.goals_minus_xgoals,
                primary_assists         = EXCLUDED.primary_assists,
                xassists                = EXCLUDED.xassists,
                goals_added_raw         = COALESCE(EXCLUDED.goals_added_raw,    prosc_asa_stats.goals_added_raw),
                goals_added_above_avg   = COALESCE(EXCLUDED.goals_added_above_avg, prosc_asa_stats.goals_added_above_avg),
                ga_dribbling            = COALESCE(EXCLUDED.ga_dribbling,       prosc_asa_stats.ga_dribbling),
                ga_fouling              = COALESCE(EXCLUDED.ga_fouling,         prosc_asa_stats.ga_fouling),
                ga_interrupting         = COALESCE(EXCLUDED.ga_interrupting,    prosc_asa_stats.ga_interrupting),
                ga_passing              = COALESCE(EXCLUDED.ga_passing,         prosc_asa_stats.ga_passing),
                ga_receiving            = COALESCE(EXCLUDED.ga_receiving,       prosc_asa_stats.ga_receiving),
                ga_shooting             = COALESCE(EXCLUDED.ga_shooting,        prosc_asa_stats.ga_shooting),
                prosc_player_id         = COALESCE(EXCLUDED.prosc_player_id,    prosc_asa_stats.prosc_player_id),
                updated_at              = now()
            RETURNING id, (xmax = 0) AS is_insert
        """, {**row, "competition": competition, "season": season, "prosc_player_id": prosc_id}).fetchone()
        if r["is_insert"]:
            inserted += 1
        else:
            updated += 1
    conn.commit()
    return inserted, updated, linked


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--season", default=DEFAULT_SEASON)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    print(f"\n=== ASA Soccer Scraper — season {args.season} ===")

    try:
        from itscalledsoccer.client import AmericanSoccerAnalysis
    except ImportError:
        print("ERROR: pip install itscalledsoccer")
        sys.exit(1)

    asa = AmericanSoccerAnalysis()

    conn = get_conn()
    ensure_table(conn)

    all_leagues = list(LEAGUES.keys())
    print(f"\n  Building player/team lookup maps...")
    player_map = build_player_map(asa, all_leagues)
    team_map   = build_team_map(asa, all_leagues)
    prosc_lookup = build_prosc_lookup(conn)
    print(f"  ASA players: {len(player_map)}, teams: {len(team_map)}, prosc: {len(prosc_lookup)}")

    total_ins = total_upd = total_lnk = 0

    for league, lname in LEAGUES.items():
        print(f"\n--- {lname} ({league}) ---")
        rows = pull_league_season(asa, league, args.season, player_map, team_map)
        if not rows:
            print(f"  No data — skipping")
            continue
        print(f"  {len(rows)} merged rows")

        if args.dry_run:
            sample = rows[:3]
            for r in sample:
                print(f"    {r['player_name']:<25} {r['team_name']:<20} "
                      f"xG={r['xgoals']} xA={r['xassists']} GA={r['goals_added_raw']}")
            continue

        ins, upd, lnk = upsert_rows(conn, rows, league, args.season, prosc_lookup)
        print(f"  → {ins} inserted, {upd} updated, {lnk}/{len(rows)} linked to prosc")
        total_ins += ins
        total_upd += upd
        total_lnk += lnk

    if not args.dry_run:
        total = conn.execute("SELECT COUNT(*) AS n FROM prosc_asa_stats").fetchone()["n"]
        rows_by = conn.execute("""
            SELECT competition, season, COUNT(*) AS n,
                   SUM(CASE WHEN prosc_player_id IS NOT NULL THEN 1 ELSE 0 END) AS linked
            FROM prosc_asa_stats
            GROUP BY competition, season ORDER BY competition, season
        """).fetchall()
        print(f"\n=== ASA DB Summary ===")
        for r in rows_by:
            print(f"  {r['competition']:<8} {r['season']}  {r['n']:>4} players  {r['linked']:>4} linked")
        print(f"  TOTAL: {total} rows  ({total_ins} new, {total_upd} updated)")
        print(f"  Overall linked: {total_lnk}")

    conn.close()
    print("\nDone.")


if __name__ == "__main__":
    main()
