#!/usr/bin/env python3.12
"""
KaNeXT WNBA Advanced Stats — nba_api (league_id='10')
Writes to proball_* tables + proball_advanced_stats.

source_player_id namespace: 'wnba:{nba_player_id}'

NOTE: PER, BPM, OBPM, DBPM, WS, VORP are Basketball-Reference proprietary
      and are NOT exposed by nba_api.  PIE is the NBA's official equivalent.

Available advanced columns from nba_api:
  TS%, eFG%, USG%, PIE, OFF_RATING, DEF_RATING, NET_RATING
  AST%, AST/TO, TO%, OREB%, DREB%, REB%, PACE

Usage:
    python3.12 wnba_nba_api_scraper.py          # auto-detect season
    python3.12 wnba_nba_api_scraper.py 2024     # specific season year
"""
from __future__ import annotations

import sys
import time
import math
from typing import Optional

import psycopg
from psycopg.rows import dict_row

DB_CONFIG = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}
SEASON = "2024"   # overridden in main()


def get_conn():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)


# ── Safe helpers ──────────────────────────────────────────────────────────────

def safe_float(v) -> Optional[float]:
    if v is None:
        return None
    if isinstance(v, float) and math.isnan(v):
        return None
    try:
        return round(float(v), 4)
    except (ValueError, TypeError):
        return None


def safe_int(v) -> Optional[int]:
    f = safe_float(v)
    return int(f) if f is not None else None


def pct_to_float(v) -> Optional[float]:
    """nba_api Advanced returns EFG_PCT, TS_PCT, USG_PCT as 0-1 already."""
    f = safe_float(v)
    if f is None:
        return None
    return round(min(max(f, 0.0), 1.0), 4)


# ── DB helpers ────────────────────────────────────────────────────────────────

def upsert_league(conn, name: str, short_name: str, country: str, source: str) -> str:
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO proball_leagues (name, short_name, country, source)
            VALUES (%s,%s,%s,%s)
            ON CONFLICT (name) DO UPDATE SET
                short_name = EXCLUDED.short_name,
                country    = EXCLUDED.country,
                source     = EXCLUDED.source
            RETURNING id
        """, (name, short_name, country, source))
        return str(cur.fetchone()["id"])


def upsert_team(conn, name: str, league_id: str,
                wins: Optional[int] = None,
                losses: Optional[int] = None) -> str:
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO proball_teams (name, league_id)
            VALUES (%s,%s)
            ON CONFLICT (name, league_id) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
        """, (name, league_id))
        tid = str(cur.fetchone()["id"])

    if wins is not None or losses is not None:
        with conn.transaction():
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO proball_standings (team_id, league_id, season, wins, losses)
                VALUES (%s,%s,%s,%s,%s)
                ON CONFLICT (team_id, league_id, season) DO UPDATE SET
                    wins   = COALESCE(EXCLUDED.wins,   proball_standings.wins),
                    losses = COALESCE(EXCLUDED.losses, proball_standings.losses)
            """, (tid, league_id, SEASON, wins, losses))
    return tid


def upsert_player(conn, source_player_id: str, full_name: str,
                  team_id: Optional[str], league_id: str,
                  position: Optional[str] = None) -> str:
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO proball_players
                (source_player_id, full_name, team_id, league_id, position)
            VALUES (%s,%s,%s,%s,%s)
            ON CONFLICT (source_player_id) DO UPDATE SET
                full_name  = EXCLUDED.full_name,
                team_id    = EXCLUDED.team_id,
                league_id  = EXCLUDED.league_id,
                position   = COALESCE(EXCLUDED.position, proball_players.position),
                updated_at = now()
            RETURNING id
        """, (source_player_id, full_name, team_id, league_id, position))
        return str(cur.fetchone()["id"])


def upsert_basic_stats(conn, player_id: str, league_id: str,
                       gp, mpg, ppg, rpg, apg, spg, bpg, topg,
                       fg_pct, three_pt_pct, ft_pct, plus_minus):
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO proball_player_stats (
                player_id, league_id, season,
                gp, mpg, ppg, rpg, apg, spg, bpg, topg,
                fg_pct, three_pt_pct, ft_pct, plus_minus
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (player_id, league_id, season) DO UPDATE SET
                gp           = COALESCE(EXCLUDED.gp,           proball_player_stats.gp),
                mpg          = COALESCE(EXCLUDED.mpg,          proball_player_stats.mpg),
                ppg          = COALESCE(EXCLUDED.ppg,          proball_player_stats.ppg),
                rpg          = COALESCE(EXCLUDED.rpg,          proball_player_stats.rpg),
                apg          = COALESCE(EXCLUDED.apg,          proball_player_stats.apg),
                spg          = COALESCE(EXCLUDED.spg,          proball_player_stats.spg),
                bpg          = COALESCE(EXCLUDED.bpg,          proball_player_stats.bpg),
                topg         = COALESCE(EXCLUDED.topg,         proball_player_stats.topg),
                fg_pct       = COALESCE(EXCLUDED.fg_pct,       proball_player_stats.fg_pct),
                three_pt_pct = COALESCE(EXCLUDED.three_pt_pct, proball_player_stats.three_pt_pct),
                ft_pct       = COALESCE(EXCLUDED.ft_pct,       proball_player_stats.ft_pct),
                plus_minus   = COALESCE(EXCLUDED.plus_minus,   proball_player_stats.plus_minus),
                updated_at   = now()
        """, (player_id, league_id, SEASON,
              gp, mpg, ppg, rpg, apg, spg, bpg, topg,
              fg_pct, three_pt_pct, ft_pct, plus_minus))


def upsert_advanced_stats(conn, player_id: str, league_id: str,
                          off_rating, def_rating, net_rating,
                          efg_pct, ts_pct, usg_pct, ast_pct,
                          ast_to_ratio, to_pct,
                          oreb_pct, dreb_pct, reb_pct,
                          pie, pace):
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO proball_advanced_stats (
                player_id, league_id, season,
                off_rating, def_rating, net_rating,
                efg_pct, ts_pct, usg_pct, ast_pct,
                ast_to_ratio, to_pct,
                oreb_pct, dreb_pct, reb_pct,
                pie, pace
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (player_id, league_id, season) DO UPDATE SET
                off_rating   = COALESCE(EXCLUDED.off_rating,   proball_advanced_stats.off_rating),
                def_rating   = COALESCE(EXCLUDED.def_rating,   proball_advanced_stats.def_rating),
                net_rating   = COALESCE(EXCLUDED.net_rating,   proball_advanced_stats.net_rating),
                efg_pct      = COALESCE(EXCLUDED.efg_pct,      proball_advanced_stats.efg_pct),
                ts_pct       = COALESCE(EXCLUDED.ts_pct,       proball_advanced_stats.ts_pct),
                usg_pct      = COALESCE(EXCLUDED.usg_pct,      proball_advanced_stats.usg_pct),
                ast_pct      = COALESCE(EXCLUDED.ast_pct,      proball_advanced_stats.ast_pct),
                ast_to_ratio = COALESCE(EXCLUDED.ast_to_ratio, proball_advanced_stats.ast_to_ratio),
                to_pct       = COALESCE(EXCLUDED.to_pct,       proball_advanced_stats.to_pct),
                oreb_pct     = COALESCE(EXCLUDED.oreb_pct,     proball_advanced_stats.oreb_pct),
                dreb_pct     = COALESCE(EXCLUDED.dreb_pct,     proball_advanced_stats.dreb_pct),
                reb_pct      = COALESCE(EXCLUDED.reb_pct,      proball_advanced_stats.reb_pct),
                pie          = COALESCE(EXCLUDED.pie,          proball_advanced_stats.pie),
                pace         = COALESCE(EXCLUDED.pace,         proball_advanced_stats.pace),
                updated_at   = now()
        """, (player_id, league_id, SEASON,
              off_rating, def_rating, net_rating,
              efg_pct, ts_pct, usg_pct, ast_pct,
              ast_to_ratio, to_pct,
              oreb_pct, dreb_pct, reb_pct,
              pie, pace))


# ── Season detection ──────────────────────────────────────────────────────────

def detect_season() -> str:
    from nba_api.stats.endpoints import leaguedashteamstats
    for yr in ("2025", "2024"):
        try:
            test = leaguedashteamstats.LeagueDashTeamStats(
                league_id_nullable="10", season=yr
            )
            time.sleep(0.5)
            df = test.get_data_frames()[0]
            if len(df) > 0:
                print(f"[info] Using WNBA season: {yr} ({len(df)} teams found)")
                return yr
        except Exception as e:
            print(f"[info] Season {yr}: {e}")
    raise RuntimeError("Could not determine available WNBA season")


# ── Main load ─────────────────────────────────────────────────────────────────

def load_wnba(conn):
    from nba_api.stats.endpoints import leaguedashteamstats, leaguedashplayerstats

    print(f"\n=== WNBA (nba_api league_id='10', season={SEASON}) ===")

    league_id = upsert_league(conn, "WNBA", "WNBA", "USA", "nba_api")

    # ── Teams ─────────────────────────────────────────────────────────────────
    print("  Loading teams...")
    team_data = leaguedashteamstats.LeagueDashTeamStats(
        league_id_nullable="10", season=SEASON
    )
    time.sleep(0.6)
    teams_df = team_data.get_data_frames()[0]

    team_id_cache: dict[int, str] = {}
    for _, row in teams_df.iterrows():
        db_tid = upsert_team(
            conn, str(row["TEAM_NAME"]), league_id,
            wins=safe_int(row.get("W")),
            losses=safe_int(row.get("L")),
        )
        team_id_cache[int(row["TEAM_ID"])] = db_tid
    print(f"  Teams: {len(team_id_cache)}")

    # ── Basic per-game stats ──────────────────────────────────────────────────
    print("  Loading basic per-game stats...")
    basic_df = leaguedashplayerstats.LeagueDashPlayerStats(
        league_id_nullable="10", season=SEASON, per_mode_detailed="PerGame"
    ).get_data_frames()[0]
    time.sleep(0.6)
    print(f"  Basic rows: {len(basic_df)}")

    player_id_cache: dict[int, str] = {}

    for _, row in basic_df.iterrows():
        nba_pid    = int(row["PLAYER_ID"])
        source_id  = f"wnba:{nba_pid}"
        full_name  = str(row["PLAYER_NAME"]).strip()
        team_nba   = int(row["TEAM_ID"]) if row.get("TEAM_ID") else None
        db_team_id = team_id_cache.get(team_nba)

        player_db_id = upsert_player(conn, source_id, full_name, db_team_id, league_id)
        player_id_cache[nba_pid] = player_db_id

        upsert_basic_stats(
            conn, player_db_id, league_id,
            gp=safe_int(row.get("GP")),
            mpg=safe_float(row.get("MIN")),
            ppg=safe_float(row.get("PTS")),
            rpg=safe_float(row.get("REB")),
            apg=safe_float(row.get("AST")),
            spg=safe_float(row.get("STL")),
            bpg=safe_float(row.get("BLK")),
            topg=safe_float(row.get("TOV")),
            fg_pct=safe_float(row.get("FG_PCT")),
            three_pt_pct=safe_float(row.get("FG3_PCT")),
            ft_pct=safe_float(row.get("FT_PCT")),
            plus_minus=safe_float(row.get("PLUS_MINUS")),
        )

    print(f"  → {len(player_id_cache)} players written")

    # ── Advanced stats ────────────────────────────────────────────────────────
    print("  Loading advanced stats...")
    adv_df = leaguedashplayerstats.LeagueDashPlayerStats(
        league_id_nullable="10", season=SEASON,
        per_mode_detailed="PerGame",
        measure_type_detailed_defense="Advanced",
    ).get_data_frames()[0]
    time.sleep(0.6)
    print(f"  Advanced rows: {len(adv_df)}")

    adv_written = 0
    for _, row in adv_df.iterrows():
        nba_pid = int(row["PLAYER_ID"])
        player_db_id = player_id_cache.get(nba_pid)
        if not player_db_id:
            source_id = f"wnba:{nba_pid}"
            full_name = str(row.get("PLAYER_NAME", "")).strip()
            if not full_name:
                continue
            team_nba   = int(row["TEAM_ID"]) if row.get("TEAM_ID") else None
            db_team_id = team_id_cache.get(team_nba)
            player_db_id = upsert_player(conn, source_id, full_name, db_team_id, league_id)
            player_id_cache[nba_pid] = player_db_id

        upsert_advanced_stats(
            conn, player_db_id, league_id,
            off_rating=safe_float(row.get("OFF_RATING")),
            def_rating=safe_float(row.get("DEF_RATING")),
            net_rating=safe_float(row.get("NET_RATING")),
            efg_pct=pct_to_float(row.get("EFG_PCT")),
            ts_pct=pct_to_float(row.get("TS_PCT")),
            usg_pct=pct_to_float(row.get("USG_PCT")),
            ast_pct=pct_to_float(row.get("AST_PCT")),
            ast_to_ratio=safe_float(row.get("AST_TO")),
            to_pct=pct_to_float(row.get("TO_PCT")),
            oreb_pct=pct_to_float(row.get("OREB_PCT")),
            dreb_pct=pct_to_float(row.get("DREB_PCT")),
            reb_pct=pct_to_float(row.get("REB_PCT")),
            pie=pct_to_float(row.get("PIE")),
            pace=safe_float(row.get("PACE")),
        )
        adv_written += 1

    print(f"  → {adv_written} advanced rows written")


def print_summary(conn):
    conn.commit()
    cur = conn.cursor()

    cur.execute("""
        SELECT COUNT(*) AS n FROM proball_teams t
        JOIN proball_leagues l ON l.id = t.league_id WHERE l.name = 'WNBA'
    """)
    teams = cur.fetchone()["n"]

    cur.execute("""
        SELECT
            COUNT(DISTINCT p.id)  AS players,
            COUNT(DISTINCT ps.id) AS basic_rows,
            COUNT(DISTINCT pa.id) AS adv_rows
        FROM proball_leagues l
        JOIN proball_players p ON p.league_id = l.id
        LEFT JOIN proball_player_stats   ps ON ps.player_id = p.id AND ps.season = %s
        LEFT JOIN proball_advanced_stats pa ON pa.player_id = p.id AND pa.season = %s
        WHERE l.name = 'WNBA'
    """, (SEASON, SEASON))
    r = cur.fetchone()
    conn.commit()

    print("\n============================================================")
    print("WNBA (nba_api) DONE")
    print(f"  Season   : {SEASON}")
    print(f"  Teams    : {teams}")
    print(f"  Players  : {r['players']}")
    print(f"  Basic    : {r['basic_rows']} stat rows")
    print(f"  Advanced : {r['adv_rows']} stat rows")
    print()
    print("  Available advanced columns:")
    print("    TS%, eFG%, USG%, PIE (PER-equivalent)")
    print("    OFF_RATING, DEF_RATING, NET_RATING")
    print("    AST%, AST/TO, TO%, OREB%, DREB%, REB%, PACE")
    print()
    print("  NOT available (Basketball-Reference only):")
    print("    PER, BPM, OBPM, DBPM, WS, VORP")
    print("============================================================")


def main():
    global SEASON
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        SEASON = sys.argv[1]
        print(f"[info] Using season: {SEASON} (from arg)")
    else:
        SEASON = detect_season()

    conn = get_conn()
    try:
        load_wnba(conn)
        print_summary(conn)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
