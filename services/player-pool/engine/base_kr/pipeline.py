#!/usr/bin/env python3
"""
Base KR Pipeline — Block 1 (Base Truth) v4.0

Source: Basketball Player Intelligence v3 spec
  Block 1: System-agnostic player identity
  Block 2: System Context (not applied here — deferred to team eval)

Formula:
  Base Player KR = (OKR × OPF_off) + (DKR × OPF_def)
                 + (TKR × OPF_tools) + (IQKR × OPF_iq)
  College KR Base = Base Player KR × λ_level
  NPD Final KR   = College KR Base + badge_boost + override_boost + system_risk_penalty
  (clamped 0–100)

System risks are block-2 concerns but we apply player-intrinsic,
box-score-evaluable risks (Range Gap, Turnover Risk, Foul Machine,
Severe Undersize + 4 minor) in the standalone pipeline.

Usage:
    cd services/player-pool/engine
    python3 -m base_kr.pipeline              # all players
    python3 -m base_kr.pipeline --level naia # one level
    python3 -m base_kr.pipeline --test 10    # first 10 only
    python3 -m base_kr.pipeline --debug "John Smith"
    python3 -m base_kr.pipeline --prep       # also aggregate season stats first
    python3 -m base_kr.pipeline --dry-run    # no DB writes
"""
from __future__ import annotations

import sys
import os
import time
import json
import argparse
from datetime import date

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scraper"))
from config import DB_CONFIG

import psycopg
from psycopg.rows import dict_row

from .constants import (
    LAMBDA_LEVEL, LEVEL_KEY_MAP, KR_VERSION,
    COVERAGE_BOX_SCORE, COVERAGE_BARTTORVIK, get_d1_level_key, get_lambda,
)
from .traits import (
    TRAIT_DEFS, TRAITS_BY_CLUSTER, CLUSTER_ORDER,
    score_all_traits, coverage_meets,
)
from .positions import map_position, compute_position_kr
from .archetypes import assign_archetypes
from .badges import compute_badges
from .overrides import evaluate_overrides
from .system_risks import evaluate_system_risks
from .impact_modifiers import assign_impact_modifier


def _f(v) -> float:
    if v is None:
        return 0.0
    return float(v)


def get_conn():
    return psycopg.connect(
        host=DB_CONFIG["host"], port=DB_CONFIG["port"],
        dbname=DB_CONFIG["dbname"], row_factory=dict_row, autocommit=False,
    )


# ═══════════════════════════════════════════════════════════════════════════
# PREP: Aggregate Season Stats
# ═══════════════════════════════════════════════════════════════════════════

def aggregate_season_stats(conn):
    """Aggregate player_game_stats → player_season_stats."""
    print("\n[PREP] Aggregating season stats from game data...")

    for col, dtype in [
        ("minutes_status", "varchar"),
        ("games_with_minutes", "integer"),
        ("minutes_coverage_pct", "numeric"),
        ("dreb_pct", "numeric"),
        ("oreb_pct", "numeric"),
    ]:
        conn.execute(f"""
            DO $$ BEGIN
                ALTER TABLE player_game_stats ADD COLUMN {col} {dtype};
            EXCEPTION WHEN duplicate_column THEN NULL;
            END $$
        """)
    conn.commit()

    # Sentinel fix: clear invalid 0-1 minute rows
    conn.execute("UPDATE player_game_stats SET minutes_status = NULL WHERE minutes_status = 'MISSING_BOX_MINUTES'")
    conn.commit()
    sentinel = conn.execute("""
        UPDATE player_game_stats
        SET minutes = NULL, minutes_status = 'MISSING_BOX_MINUTES'
        WHERE (minutes IS NOT NULL AND minutes <= 1)
          AND (COALESCE(pts,0)+COALESCE(oreb,0)+COALESCE(dreb,0)+
               COALESCE(ast,0)+COALESCE(stl,0)+COALESCE(blk,0)+
               COALESCE(fga,0)+COALESCE(fta,0)) > 0
        RETURNING id
    """).fetchall()
    conn.commit()
    print(f"  Sentinel fix: {len(sentinel)} game rows")

    rows = conn.execute("""
        SELECT pts.id AS pts_id, pts.player_id, pts.team_season_id,
            count(pgs.id) AS games_played,
            count(CASE WHEN pgs.started THEN 1 END) AS games_started,
            count(CASE WHEN pgs.minutes IS NOT NULL THEN 1 END) AS games_with_minutes,
            coalesce(avg(pgs.minutes), 0)      AS minutes_pg,
            coalesce(avg(pgs.pts), 0)          AS pts_pg,
            coalesce(avg(pgs.reb), 0)          AS reb_pg,
            coalesce(avg(pgs.ast), 0)          AS ast_pg,
            coalesce(avg(pgs.stl), 0)          AS stl_pg,
            coalesce(avg(pgs.blk), 0)          AS blk_pg,
            coalesce(avg(pgs.turnovers), 0)    AS to_pg,
            coalesce(avg(pgs.pf), 0)           AS pf_pg,
            coalesce(avg(pgs.oreb), 0)         AS oreb_pg,
            coalesce(avg(pgs.dreb), 0)         AS dreb_pg,
            coalesce(avg(pgs.fga), 0)          AS fga_pg,
            coalesce(avg(pgs.three_pa), 0)     AS three_pa_pg,
            coalesce(avg(pgs.fta), 0)          AS fta_pg,
            CASE WHEN sum(pgs.fga)>0    THEN sum(pgs.fgm)::float/sum(pgs.fga)    ELSE 0 END AS fg_pct,
            CASE WHEN sum(pgs.three_pa)>0 THEN sum(pgs.three_pm)::float/sum(pgs.three_pa) ELSE 0 END AS three_pct,
            CASE WHEN sum(pgs.fta)>0    THEN sum(pgs.ftm)::float/sum(pgs.fta)    ELSE 0 END AS ft_pct
        FROM player_team_seasons pts
        JOIN players p ON pts.player_id = p.id
        JOIN player_game_stats pgs ON pgs.player_team_season_id = pts.id
        GROUP BY pts.id, pts.player_id, pts.team_season_id
        HAVING count(pgs.id) >= 1
    """).fetchall()

    print(f"  Found {len(rows)} player-team-seasons with game data")

    conn.execute("DELETE FROM player_season_stats")
    for r in rows:
        fga_pg  = _f(r["fga_pg"])
        fta_pg  = _f(r["fta_pg"])
        to_pg   = _f(r["to_pg"])
        min_pg  = _f(r["minutes_pg"])
        usage   = ((fga_pg + 0.44 * fta_pg + to_pg) / (min_pg / 40.0 * 70.0) * 100) if min_pg > 5 else 0
        gp      = int(r["games_played"] or 0)
        gwm     = int(r["games_with_minutes"] or 0)
        min_cov = gwm / gp if gp > 0 else 0.0

        conn.execute("""
            INSERT INTO player_season_stats (
                player_team_season_id, games_played, games_started,
                minutes_per_game, pts_per_game, reb_per_game, ast_per_game,
                stl_per_game, blk_per_game, to_per_game,
                fg_pct, three_pct, ft_pct,
                oreb_per_game, dreb_per_game,
                fga_per_game, three_pa_per_game, fta_per_game,
                pf_per_game, usage_rate,
                games_with_minutes, minutes_coverage_pct
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            r["pts_id"], r["games_played"], r["games_started"],
            round(_f(r["minutes_pg"]),1), round(_f(r["pts_pg"]),1),
            round(_f(r["reb_pg"]),1), round(_f(r["ast_pg"]),1),
            round(_f(r["stl_pg"]),1), round(_f(r["blk_pg"]),1),
            round(_f(r["to_pg"]),1),
            round(_f(r["fg_pct"]),3), round(_f(r["three_pct"]),3), round(_f(r["ft_pct"]),3),
            round(_f(r["oreb_pg"]),1), round(_f(r["dreb_pg"]),1),
            round(_f(r["fga_pg"]),1), round(_f(r["three_pa_pg"]),1), round(_f(r["fta_pg"]),1),
            round(_f(r["pf_pg"]),1), round(usage,1),
            gwm, round(min_cov,3),
        ))
    conn.commit()
    print(f"  Inserted {len(rows)} season stat rows")
    _compute_rebound_rates(conn)


def _compute_rebound_rates(conn):
    """Compute DREB% and OREB% from game-level data."""
    print("  Computing rebound rates...")
    conn.execute("""
        CREATE TEMP TABLE _team_game_reb AS
        SELECT pgs.game_id, pts.team_season_id,
               COALESCE(SUM(pgs.dreb),0) AS team_dreb,
               COALESCE(SUM(pgs.oreb),0) AS team_oreb,
               COALESCE(SUM(pgs.minutes),0) AS team_minutes
        FROM player_game_stats pgs
        JOIN player_team_seasons pts ON pgs.player_team_season_id = pts.id
        GROUP BY pgs.game_id, pts.team_season_id
    """)

    reb_rows = conn.execute("""
        WITH pgr AS (
            SELECT pgs.player_team_season_id, pgs.game_id, pts.team_season_id,
                   COALESCE(pgs.dreb,0) AS p_dreb, COALESCE(pgs.oreb,0) AS p_oreb,
                   COALESCE(pgs.minutes,0) AS p_minutes,
                   tg.team_dreb, tg.team_oreb, tg.team_minutes,
                   CASE WHEN g.home_team_season_id=pts.team_season_id
                        THEN g.away_team_season_id ELSE g.home_team_season_id
                   END AS opp_tsid
            FROM player_game_stats pgs
            JOIN player_team_seasons pts ON pgs.player_team_season_id=pts.id
            JOIN games g ON pgs.game_id=g.id
            JOIN _team_game_reb tg ON tg.game_id=pgs.game_id AND tg.team_season_id=pts.team_season_id
            WHERE pgs.minutes IS NOT NULL AND pgs.minutes>0 AND pgs.dreb IS NOT NULL
        ),
        with_opp AS (
            SELECT pgr.*, COALESCE(opp.team_oreb,0) AS opp_oreb,
                          COALESCE(opp.team_dreb,0) AS opp_dreb
            FROM pgr
            LEFT JOIN _team_game_reb opp ON opp.game_id=pgr.game_id AND opp.team_season_id=pgr.opp_tsid
        )
        SELECT player_team_season_id,
            AVG(CASE WHEN (team_dreb+opp_oreb)>0 AND team_minutes>0 AND p_minutes>0
                THEN p_dreb::float/(team_dreb+opp_oreb)*(team_minutes/p_minutes/5.0)
                ELSE NULL END) AS dreb_pct,
            AVG(CASE WHEN (team_oreb+opp_dreb)>0 AND team_minutes>0 AND p_minutes>0
                THEN p_oreb::float/(team_oreb+opp_dreb)*(team_minutes/p_minutes/5.0)
                ELSE NULL END) AS oreb_pct
        FROM with_opp
        GROUP BY player_team_season_id
    """).fetchall()

    updated = 0
    for r in reb_rows:
        dp = r["dreb_pct"]
        op = r["oreb_pct"]
        if dp is not None or op is not None:
            conn.execute("""
                UPDATE player_season_stats
                SET dreb_pct=%s, oreb_pct=%s
                WHERE player_team_season_id=%s
            """, (
                round(float(dp), 4) if dp is not None else None,
                round(float(op), 4) if op is not None else None,
                r["player_team_season_id"],
            ))
            updated += 1

    conn.execute("DROP TABLE IF EXISTS _team_game_reb")
    conn.commit()
    print(f"  Rebound rates computed for {updated} player-seasons")


# ═══════════════════════════════════════════════════════════════════════════
# STEP 1: Level Assignment
# ═══════════════════════════════════════════════════════════════════════════

def assign_level_keys(conn) -> dict[str, str]:
    """Assign KLVN level key to every team_season."""
    print("\n[1] Assigning level keys...")
    rows = conn.execute("""
        SELECT ts.id AS team_season_id,
               cl.level_key AS db_level_key,
               c.name AS conference_name,
               c.abbreviation AS conference_abbrev
        FROM team_seasons ts
        JOIN teams t ON ts.team_id=t.id
        JOIN competitive_levels cl ON t.competitive_level_id=cl.id
        LEFT JOIN conferences c ON t.conference_id=c.id
    """).fetchall()

    level_map: dict[str, str] = {}
    for r in rows:
        ts_id  = str(r["team_season_id"])
        db_key = r["db_level_key"]
        if db_key == "ncaa_d1":
            conf = r["conference_name"] or r["conference_abbrev"] or ""
            level_map[ts_id] = get_d1_level_key(conf)
        else:
            level_map[ts_id] = LEVEL_KEY_MAP.get(db_key, db_key)

    counts: dict[str, int] = {}
    for lk in level_map.values():
        counts[lk] = counts.get(lk, 0) + 1
    for lk, cnt in sorted(counts.items()):
        print(f"  {lk}: {cnt} team-seasons")
    return level_map


# ═══════════════════════════════════════════════════════════════════════════
# STEP 2: Load Player Records
# ═══════════════════════════════════════════════════════════════════════════

def load_player_records(conn, level_filter: str | None = None, test_limit: int | None = None):
    print("\n[2] Loading player season records...")
    where = ["pss.games_played >= 3", "pss.minutes_per_game >= 5"]
    params: list = []
    if level_filter:
        where.append("cl.level_key = %s")
        params.append(level_filter)
    limit_sql = f"LIMIT {test_limit}" if test_limit else ""

    rows = conn.execute(f"""
        SELECT
            pts.id AS player_team_season_id,
            pts.player_id,
            pts.team_season_id,
            p.full_name,
            p.height_inches,
            p.weight_lbs,
            p.declared_positions,
            cl.level_key AS db_level_key,
            c.name AS conference_name,
            c.abbreviation AS conference_abbrev,
            pss.games_played, pss.games_started,
            pss.minutes_per_game,
            pss.pts_per_game, pss.reb_per_game,
            pss.ast_per_game, pss.stl_per_game,
            pss.blk_per_game, pss.to_per_game,
            pss.fg_pct, pss.three_pct, pss.ft_pct,
            pss.oreb_per_game, pss.dreb_per_game,
            pss.fga_per_game, pss.three_pa_per_game,
            pss.fta_per_game, pss.pf_per_game,
            pss.usage_rate,
            pss.dreb_pct, pss.oreb_pct
        FROM player_season_stats pss
        JOIN player_team_seasons pts ON pss.player_team_season_id=pts.id
        JOIN players p ON pts.player_id=p.id
        JOIN team_seasons ts ON pts.team_season_id=ts.id
        JOIN teams t ON ts.team_id=t.id
        JOIN competitive_levels cl ON t.competitive_level_id=cl.id
        LEFT JOIN conferences c ON t.conference_id=c.id
        WHERE {" AND ".join(where)}
        ORDER BY p.full_name
        {limit_sql}
    """, params).fetchall()

    print(f"  Loaded {len(rows)} player-season records")
    return rows


# ═══════════════════════════════════════════════════════════════════════════
# STEP 2b: Build Trait Inputs from Box Score
# ═══════════════════════════════════════════════════════════════════════════

def build_trait_inputs(player: dict) -> dict[str, float | None]:
    """
    Map box-score stats to trait input keys for v3 trait library.

    Provides direct inputs for box-score-scoreable traits and proxies
    for a handful of others. All others remain None (UNSCORED).
    """
    inputs: dict[str, float | None] = {}

    fg_pct      = _f(player.get("fg_pct"))
    fga_pg      = _f(player.get("fga_per_game"))
    three_pct   = _f(player.get("three_pct"))
    three_pa_pg = _f(player.get("three_pa_per_game"))
    ft_pct      = _f(player.get("ft_pct"))
    fta_pg      = _f(player.get("fta_per_game"))
    pts_pg      = _f(player.get("pts_per_game"))
    ast_pg      = _f(player.get("ast_per_game"))
    stl_pg      = _f(player.get("stl_per_game"))
    blk_pg      = _f(player.get("blk_per_game"))
    to_pg       = _f(player.get("to_per_game"))
    oreb_pg     = _f(player.get("oreb_per_game"))
    dreb_pg     = _f(player.get("dreb_per_game"))
    pf_pg       = _f(player.get("pf_per_game"))
    min_pg      = _f(player.get("minutes_per_game"))
    gp          = int(player.get("games_played") or 0)
    gs          = int(player.get("games_started") or 0)

    # ── SHOOTING ──────────────────────────────────────────────────────
    # free_throw: direct box score
    inputs["ft_pct"] = ft_pct if ft_pct > 0 and fta_pg >= 1.0 else None

    # ── FINISHING ─────────────────────────────────────────────────────
    # foul_draw: FTA/FGA rate as proxy
    if fga_pg > 0 and fta_pg > 0:
        inputs["fta_per_drive"] = fta_pg / fga_pg

    # ── PLAYMAKING ────────────────────────────────────────────────────
    # passing_vision: AST/G proxy
    if ast_pg > 0:
        inputs["ast_adj_pg"]       = ast_pg
        inputs["potential_ast_pg"] = ast_pg * 2.0  # heuristic: ~50% of potential assists convert

    # ── POA DEFENSE ───────────────────────────────────────────────────
    # steal_timing: STL per 100 estimated defensive possessions
    if stl_pg > 0 and min_pg > 5:
        est_def_poss = (min_pg / 40.0) * 70.0
        if est_def_poss > 0:
            inputs["stl_per_100_def_poss"] = (stl_pg / est_def_poss) * 100.0

    # poa_foul_discipline: PF per 100 possessions
    if min_pg > 5:
        est_poss = (min_pg / 40.0) * 70.0
        if est_poss > 0:
            inputs["perim_fouls_per_100"] = (pf_pg / est_poss) * 100.0

    # ── TEAM DEFENSE ──────────────────────────────────────────────────
    # rim_protection: BLK/G proxy
    inputs["blk_att_pg"] = blk_pg if blk_pg > 0 else None

    # team_foul_discipline: PF per 100 (same proxy as poa_foul_discipline)
    if min_pg > 5:
        est_poss = (min_pg / 40.0) * 70.0
        if est_poss > 0:
            inputs["int_fouls_per_100"] = (pf_pg / est_poss) * 100.0

    # ── TOOLS ─────────────────────────────────────────────────────────
    # height: bio stat, always available
    h = player.get("height_inches")
    inputs["height_inches"] = float(h) if h is not None else None

    # strength: body weight proxy (v4.0)
    w = player.get("weight_lbs")
    inputs["weight_lbs"] = float(w) if w is not None else None

    # motor: (STL + BLK)/G hustle proxy (v4.0)
    if stl_pg > 0 or blk_pg > 0:
        inputs["motor_proxy"] = stl_pg + blk_pg

    # endurance: avg minutes per game proxy (v4.0)
    if min_pg > 0:
        inputs["endurance_proxy"] = min_pg

    # ── REBOUNDING ────────────────────────────────────────────────────
    inputs["dreb_pg"]  = dreb_pg if dreb_pg > 0 else None
    inputs["oreb_pg"]  = oreb_pg if oreb_pg > 0 else None
    dp = player.get("dreb_pct")
    op = player.get("oreb_pct")
    inputs["dreb_pct"] = float(dp) if dp is not None else None
    inputs["oreb_pct"] = float(op) if op is not None else None

    # second_jump_tip: vertical/tip activity proxy (v4.0) — avg(OREB, BLK)/G
    if oreb_pg > 0 or blk_pg > 0:
        inputs["tip_activity"] = (oreb_pg + blk_pg) / 2.0

    # ── IQ ────────────────────────────────────────────────────────────
    # All IQ traits are UNSCORED at box_score (coverage_min=synergy) in v4.0.
    # These inputs are still computed but won't be used until synergy data available.
    fgm_pg       = fga_pg * fg_pct if fga_pg > 0 else 0.0
    three_pm_pg  = three_pa_pg * three_pct if three_pa_pg > 0 else 0.0
    two_p_fga    = fga_pg - three_pa_pg
    inputs["2p_pct"] = ((fgm_pg - three_pm_pg) / two_p_fga) if two_p_fga > 0 else None
    inputs["efg_pct"] = ((fgm_pg + 0.5 * three_pm_pg) / fga_pg) if fga_pg > 0 else None

    inputs["started_pct"] = gs / gp if gp > 0 else None

    # Derived stats
    inputs["ast_to"] = (ast_pg / to_pg) if to_pg > 0 else (99.0 if ast_pg > 0 else None)
    inputs["fta_rate"] = (fta_pg / fga_pg) if fga_pg > 0 else None
    inputs["3pa_rate"] = (three_pa_pg / fga_pg) if fga_pg > 0 else None

    return inputs


# ═══════════════════════════════════════════════════════════════════════════
# Barttorvik Data — Load + Apply
# ═══════════════════════════════════════════════════════════════════════════

def load_barttorvik_data(conn) -> dict[str, dict]:
    """
    Load matched Barttorvik player records keyed by player_team_season_id.
    Returns empty dict if barttorvik_player_season table doesn't exist.
    """
    try:
        rows = conn.execute("""
            SELECT player_team_season_id::text AS pts_id,
                   efg_pct, ts_pct, usg_pct,
                   ast_to, ast_pg, tov_pg,
                   games, games_started,
                   oreb_pct, dreb_pct, bpm, obpm, dbpm, porpag
            FROM barttorvik_player_season
            WHERE player_team_season_id IS NOT NULL
        """).fetchall()
        result = {r["pts_id"]: dict(r) for r in rows}
        print(f"  Loaded {len(result)} Barttorvik records")
        return result
    except Exception:
        print("  Barttorvik table not found — run barttorvik_scraper.py first")
        return {}


def _apply_barttorvik_inputs(inputs: dict, btt: dict) -> None:
    """
    Supplement trait inputs with Barttorvik advanced stats (in-place).

    Unlocks 2 IQ traits at barttorvik coverage tier:
      shot_selection            → efg_pct (EFG% ÷ 100, API stores 0-100)
      turnover_decision_quality → ast_to  (direct ratio from Barttorvik)

    Note: role_discipline (started_pct) not available — Barttorvik player/season
    endpoint has no games_started column.
    """
    def _f(v) -> float | None:
        if v is None:
            return None
        try:
            f = float(v)
            return None if f != f else f  # NaN → None
        except (TypeError, ValueError):
            return None

    # shot_selection — EFG% (API stores as 0-100, trait expects 0.0-1.0)
    efg = _f(btt.get("efg_pct"))
    if efg is not None and efg > 1.0:   # guard: only divide if clearly on 0-100 scale
        inputs["efg_pct"] = efg / 100.0

    # turnover_decision_quality — AST/TO ratio (direct, no conversion needed)
    ast_to = _f(btt.get("ast_to"))
    if ast_to is not None:
        inputs["ast_to"] = ast_to


# ═══════════════════════════════════════════════════════════════════════════
# STEP 3-5: Trait Scoring → Cluster Aggregation
# ═══════════════════════════════════════════════════════════════════════════

def score_player_traits(
    player_inputs: dict,
    coverage_tier: str = COVERAGE_BOX_SCORE,
) -> tuple[dict[str, int | None], dict[str, float]]:
    """Score all 54 traits. Returns (trait_scores, trait_confidence)."""
    trait_scores = score_all_traits(player_inputs, coverage_tier)
    trait_confidence = {k: (100.0 if v is not None else 0.0) for k, v in trait_scores.items()}
    return trait_scores, trait_confidence


def aggregate_clusters(
    trait_scores: dict[str, int | None],
) -> tuple[dict[str, float | None], dict[str, float]]:
    """
    Aggregate 47 trait scores → 8 cluster scores.
    Each cluster = average of SCORED traits (renormalized for UNSCORED).
    """
    cluster_scores: dict[str, float | None]  = {}
    cluster_confidence: dict[str, float]     = {}

    for cluster in CLUSTER_ORDER:
        traits_in = TRAITS_BY_CLUSTER.get(cluster, [])
        scored    = [trait_scores[t["key"]] for t in traits_in if trait_scores.get(t["key"]) is not None]
        total     = len(traits_in)

        if scored:
            cluster_scores[cluster]     = sum(scored) / len(scored)
            cluster_confidence[cluster] = (len(scored) / total) * 100.0
        else:
            cluster_scores[cluster]     = None
            cluster_confidence[cluster] = 0.0

    return cluster_scores, cluster_confidence


# ═══════════════════════════════════════════════════════════════════════════
# STEPS 6-7: OKR/DKR/TKR/IQKR → Base Player KR → KLVN Normalization
# ═══════════════════════════════════════════════════════════════════════════

def compute_player_kr(
    trait_scores: dict[str, int | None],
    position: str,
    level_key: str,
    baselines: "dict | None" = None,
) -> dict[str, float | None]:
    """
    Compute OKR, DKR, TKR, IQKR, Base Player KR, and College KR Base.
    v4.0: uses per-trait weights directly from trait_scores.

    baselines: optional {trait_key: (avg_score, conf_weight)} for UNSCORED traits.

    Returns dict with all components including confidence_pct.
    """
    kr = compute_position_kr(trait_scores, position, level="college", baselines=baselines)

    # KLVN normalization
    base_kr = kr.get("base_player_kr")
    if base_kr is not None:
        lam = get_lambda(level_key)
        kr["college_kr_base"] = base_kr * lam
    else:
        kr["college_kr_base"] = None

    kr["level_key"] = level_key
    kr["position"]  = position
    return kr


# ═══════════════════════════════════════════════════════════════════════════
# STEPS 8-13: Archetypes → Badges → System Risks → Overrides
#             → Impact Modifiers → NPD Final KR
# ═══════════════════════════════════════════════════════════════════════════

def finalize_kr(
    kr_components: dict,
    trait_scores: dict[str, int | None],
    trait_inputs: dict[str, float | None],
    cluster_scores: dict[str, float | None],
    height_inches: int | None,
    position: str,
    season_stats: dict,
    games_played: int,
    team_max_gp: int,
) -> dict:
    """Apply badges, archetypes, system risks, overrides, impact modifiers → final KR."""

    # Step 8: Archetypes (descriptive, no KR change)
    archetypes = assign_archetypes(trait_scores, cluster_scores)

    # Step 9: Badges (Skill KR gate = base_player_kr, raw unnormalized)
    base_player_kr = kr_components.get("base_player_kr")
    badge_result   = compute_badges(trait_scores, base_player_kr)

    # Step 10: System Risks (Block 1 evaluable subset)
    risk_result = evaluate_system_risks(
        season_stats, trait_inputs, height_inches,
        position, games_played, team_max_gp,
    )

    # Step 11: Overrides (college positive, max 1)
    override = evaluate_overrides(trait_scores, cluster_scores, height_inches, position)

    # Step 12: Impact Modifiers (classification labels only)
    impact_mod = assign_impact_modifier(season_stats, cluster_scores)

    # Step 13: NPD Final KR
    base = kr_components.get("college_kr_base")
    if base is not None:
        npd_final_kr = base + badge_result["badge_boost"] + risk_result["total_penalty"]
        if override:
            npd_final_kr += override["kr_boost"]
        npd_final_kr = max(0.0, min(100.0, npd_final_kr))
    else:
        npd_final_kr = None

    return {
        **kr_components,
        "archetypes":          archetypes,
        "badges":              badge_result["badges"],
        "badge_boost":         badge_result["badge_boost"],
        "system_risks":        risk_result["risks"],
        "system_risk_penalty": risk_result["total_penalty"],
        "system_risk_keys":    [r["key"] for r in risk_result["risks"]],
        "override":            override,
        "impact_modifier":     impact_mod["modifier_type"],
        "impact_modifier_els": impact_mod.get("els"),
        "npd_final_kr":        npd_final_kr,
    }


# ═══════════════════════════════════════════════════════════════════════════
# DB Schema — v3 tables
# ═══════════════════════════════════════════════════════════════════════════

def ensure_schema(conn):
    """Create v3 tables if they don't exist."""
    conn.execute("""
        CREATE TABLE IF NOT EXISTS player_kr_v3 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            player_team_season_id UUID NOT NULL REFERENCES player_team_seasons(id),
            level_key VARCHAR NOT NULL,
            position VARCHAR NOT NULL,
            coverage_tier VARCHAR NOT NULL DEFAULT 'box_score',
            okr DECIMAL,
            dkr DECIMAL,
            tkr DECIMAL,
            iqkr DECIMAL,
            base_player_kr DECIMAL,
            college_kr_base DECIMAL,
            badge_boost DECIMAL DEFAULT 0,
            override_key VARCHAR,
            override_boost DECIMAL DEFAULT 0,
            system_risk_penalty DECIMAL DEFAULT 0,
            system_risk_keys VARCHAR[],
            npd_final_kr DECIMAL,
            primary_archetype VARCHAR,
            all_archetypes VARCHAR[],
            impact_modifier VARCHAR,
            confidence_pct INTEGER DEFAULT 0,
            kr_version VARCHAR NOT NULL,
            computed_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(player_team_season_id)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS player_traits_v3 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            player_team_season_id UUID NOT NULL REFERENCES player_team_seasons(id),
            trait_key VARCHAR NOT NULL,
            cluster VARCHAR NOT NULL,
            score INTEGER,
            confidence_pct DECIMAL DEFAULT 0,
            status VARCHAR NOT NULL DEFAULT 'UNSCORED',
            UNIQUE(player_team_season_id, trait_key)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS player_clusters_v3 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            player_team_season_id UUID NOT NULL REFERENCES player_team_seasons(id),
            cluster VARCHAR NOT NULL,
            score DECIMAL,
            confidence_pct DECIMAL DEFAULT 0,
            scored_traits INTEGER DEFAULT 0,
            total_traits INTEGER DEFAULT 0,
            UNIQUE(player_team_season_id, cluster)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS player_badges_v3 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            player_team_season_id UUID NOT NULL REFERENCES player_team_seasons(id),
            badge_key VARCHAR NOT NULL,
            badge_name VARCHAR NOT NULL,
            tier VARCHAR NOT NULL,
            effect DECIMAL NOT NULL,
            cluster VARCHAR,
            UNIQUE(player_team_season_id, badge_key)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS player_system_risks_v3 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            player_team_season_id UUID NOT NULL REFERENCES player_team_seasons(id),
            risk_key VARCHAR NOT NULL,
            risk_name VARCHAR NOT NULL,
            risk_type VARCHAR NOT NULL,
            penalty DECIMAL NOT NULL,
            trigger_values JSONB,
            UNIQUE(player_team_season_id, risk_key)
        )
    """)
    conn.commit()
    print("  Schema verified (player_kr_v3, _traits_v3, _clusters_v3, _badges_v3, _risks_v3)")


# ═══════════════════════════════════════════════════════════════════════════
# DB Write
# ═══════════════════════════════════════════════════════════════════════════

def _round(v, n=2):
    if v is None:
        return None
    return round(float(v), n)


def _compute_overall_confidence(cluster_confidence: dict[str, float]) -> int:
    vals = list(cluster_confidence.values())
    return round(sum(vals) / len(vals)) if vals else 0


def write_results(
    conn, pts_id: str,
    trait_scores: dict[str, int | None],
    trait_confidence: dict[str, float],
    cluster_scores: dict[str, float | None],
    cluster_confidence: dict[str, float],
    kr_result: dict,
    coverage_tier: str = COVERAGE_BOX_SCORE,
):
    """Persist all v3 results for one player-season."""
    # player_kr_v3
    conn.execute("""
        INSERT INTO player_kr_v3 (
            player_team_season_id, level_key, position, coverage_tier,
            okr, dkr, tkr, iqkr, base_player_kr, college_kr_base,
            badge_boost, override_key, override_boost,
            system_risk_penalty, system_risk_keys,
            npd_final_kr,
            primary_archetype, all_archetypes,
            impact_modifier, confidence_pct, kr_version
        ) VALUES (
            %s,%s,%s,%s,
            %s,%s,%s,%s,%s,%s,
            %s,%s,%s,
            %s,%s,
            %s,
            %s,%s,
            %s,%s,%s
        )
        ON CONFLICT (player_team_season_id) DO UPDATE SET
            level_key=EXCLUDED.level_key, position=EXCLUDED.position,
            coverage_tier=EXCLUDED.coverage_tier,
            okr=EXCLUDED.okr, dkr=EXCLUDED.dkr, tkr=EXCLUDED.tkr, iqkr=EXCLUDED.iqkr,
            base_player_kr=EXCLUDED.base_player_kr,
            college_kr_base=EXCLUDED.college_kr_base,
            badge_boost=EXCLUDED.badge_boost,
            override_key=EXCLUDED.override_key, override_boost=EXCLUDED.override_boost,
            system_risk_penalty=EXCLUDED.system_risk_penalty,
            system_risk_keys=EXCLUDED.system_risk_keys,
            npd_final_kr=EXCLUDED.npd_final_kr,
            primary_archetype=EXCLUDED.primary_archetype,
            all_archetypes=EXCLUDED.all_archetypes,
            impact_modifier=EXCLUDED.impact_modifier,
            confidence_pct=EXCLUDED.confidence_pct,
            kr_version=EXCLUDED.kr_version,
            computed_at=NOW()
    """, (
        pts_id,
        kr_result.get("level_key",""), kr_result.get("position",""), coverage_tier,
        _round(kr_result.get("okr")), _round(kr_result.get("dkr")),
        _round(kr_result.get("tkr")), _round(kr_result.get("iqkr")),
        _round(kr_result.get("base_player_kr")),
        _round(kr_result.get("college_kr_base")),
        _round(kr_result.get("badge_boost")),
        kr_result["override"]["key"]      if kr_result.get("override") else None,
        kr_result["override"]["kr_boost"] if kr_result.get("override") else 0,
        _round(kr_result.get("system_risk_penalty")),
        kr_result.get("system_risk_keys") or [],
        _round(kr_result.get("npd_final_kr")),
        kr_result["archetypes"][0] if kr_result.get("archetypes") else None,
        kr_result.get("archetypes") or [],
        kr_result.get("impact_modifier"),
        round(kr_result.get("confidence_pct") or 0),
        KR_VERSION,
    ))

    # player_system_risks_v3
    conn.execute("DELETE FROM player_system_risks_v3 WHERE player_team_season_id=%s", (pts_id,))
    for risk in kr_result.get("system_risks", []):
        conn.execute("""
            INSERT INTO player_system_risks_v3
              (player_team_season_id,risk_key,risk_name,risk_type,penalty,trigger_values)
            VALUES (%s,%s,%s,%s,%s,%s)
        """, (
            pts_id, risk["key"], risk["name"], risk["type"],
            risk["penalty"], json.dumps(risk.get("trigger_values")),
        ))

    # player_traits_v3
    conn.execute("DELETE FROM player_traits_v3 WHERE player_team_season_id=%s", (pts_id,))
    for tdef in TRAIT_DEFS:
        key   = tdef["key"]
        score = trait_scores.get(key)
        conf  = trait_confidence.get(key, 0.0)
        conn.execute("""
            INSERT INTO player_traits_v3
              (player_team_season_id,trait_key,cluster,score,confidence_pct,status)
            VALUES (%s,%s,%s,%s,%s,%s)
        """, (
            pts_id, key, tdef["cluster"],
            score, round(conf, 1),
            "SCORED" if score is not None else "UNSCORED",
        ))

    # player_clusters_v3
    conn.execute("DELETE FROM player_clusters_v3 WHERE player_team_season_id=%s", (pts_id,))
    for cluster in CLUSTER_ORDER:
        traits_in    = TRAITS_BY_CLUSTER.get(cluster, [])
        scored_count = sum(1 for t in traits_in if trait_scores.get(t["key"]) is not None)
        conn.execute("""
            INSERT INTO player_clusters_v3
              (player_team_season_id,cluster,score,confidence_pct,scored_traits,total_traits)
            VALUES (%s,%s,%s,%s,%s,%s)
        """, (
            pts_id, cluster,
            _round(cluster_scores.get(cluster)),
            round(cluster_confidence.get(cluster, 0), 1),
            scored_count, len(traits_in),
        ))

    # player_badges_v3
    conn.execute("DELETE FROM player_badges_v3 WHERE player_team_season_id=%s", (pts_id,))
    for badge in kr_result.get("badges", []):
        conn.execute("""
            INSERT INTO player_badges_v3
              (player_team_season_id,badge_key,badge_name,tier,effect,cluster)
            VALUES (%s,%s,%s,%s,%s,%s)
        """, (
            pts_id, badge["key"], badge["name"], badge["tier"],
            badge["effect"], badge.get("cluster"),
        ))


def _compute_team_max_gp(conn) -> dict[str, int]:
    rows = conn.execute("""
        SELECT pts.team_season_id, MAX(pss.games_played) AS max_gp
        FROM player_season_stats pss
        JOIN player_team_seasons pts ON pss.player_team_season_id=pts.id
        GROUP BY pts.team_season_id
    """).fetchall()
    return {str(r["team_season_id"]): int(r["max_gp"]) for r in rows}


# ═══════════════════════════════════════════════════════════════════════════
# Player-Specific Self-Consistent Baselines
# ═══════════════════════════════════════════════════════════════════════════

#: Confidence weight for within-component baseline (player's own scored avg fills unscored)
BASELINE_CONF_WITHIN = 0.50
#: Confidence weight for cross-component baseline (used for empty components like IQ)
BASELINE_CONF_CROSS = 0.30


def compute_player_baselines(
    trait_scores: dict[str, int | None],
    position: str,
) -> dict[str, tuple[float, float]]:
    """
    Compute player-specific baselines for UNSCORED traits.

    Strategy (self-consistent interpolation):
      Within each component, UNSCORED traits are estimated at the player's own
      scored component average — so OKR/DKR/TKR stay unchanged (self-consistent).

      For components with ZERO scored traits (e.g., IQ at box_score tier),
      fall back to the player's OPF-weighted cross-component estimate.

    This approach:
      - Preserves elite players' scores (no compression toward population mean)
      - Fills in completely empty components (IQ → player's overall scored KR)
      - Tracks confidence_pct correctly (fraction of weight from directly-scored traits)

    Parameters
    ----------
    trait_scores : scored trait dict (None = UNSCORED)
    position     : one of PG, SG, SF, PF, C

    Returns
    -------
    dict[trait_key → (baseline_score, conf_weight)]
    """
    from .constants import TRAIT_WEIGHTS_COLLEGE, OPF_COLLEGE

    weights = TRAIT_WEIGHTS_COLLEGE.get(position, TRAIT_WEIGHTS_COLLEGE["SF"])
    opf     = OPF_COLLEGE.get(position, OPF_COLLEGE["SF"])
    opf_off, opf_def, opf_tools, opf_iq = opf

    # Step 1: compute each component's scored average (renormalized)
    comp_avgs: dict[str, float | None] = {}
    for comp_key, comp_weights in weights.items():
        total_v = total_w = 0.0
        for tk, w in comp_weights.items():
            if w <= 0:
                continue
            score = trait_scores.get(tk)
            if score is not None:
                total_v += score * w
                total_w += w
        comp_avgs[comp_key] = total_v / total_w if total_w > 0 else None

    # Step 2: cross-component estimate = OPF-weighted KR from scored components
    # (used for empty components like IQ that have NO scored traits at box_score)
    cross_total_v = cross_total_w = 0.0
    for comp_key, opf_w in [
        ("okr", opf_off), ("dkr", opf_def), ("tkr", opf_tools), ("iqkr", opf_iq)
    ]:
        avg = comp_avgs.get(comp_key)
        if avg is not None:
            cross_total_v += avg * opf_w
            cross_total_w += opf_w
    cross_estimate = cross_total_v / cross_total_w if cross_total_w > 0 else None

    # Step 3: build baselines dict
    baselines: dict[str, tuple[float, float]] = {}
    for comp_key, comp_weights in weights.items():
        comp_avg = comp_avgs.get(comp_key)

        if comp_avg is not None:
            # within-component: use component scored avg for unscored traits
            for tk in comp_weights:
                if trait_scores.get(tk) is None:
                    baselines[tk] = (comp_avg, BASELINE_CONF_WITHIN)
        elif cross_estimate is not None:
            # cross-component fallback for empty components (e.g., all IQ traits)
            for tk in comp_weights:
                if trait_scores.get(tk) is None:
                    baselines[tk] = (cross_estimate, BASELINE_CONF_CROSS)

    return baselines


# ═══════════════════════════════════════════════════════════════════════════
# Main Pipeline
# ═══════════════════════════════════════════════════════════════════════════

def run_pipeline(
    level_filter: str | None = None,
    test_limit: int | None = None,
    debug_name: str | None = None,
    dry_run: bool = False,
    prep: bool = False,
):
    start = time.time()
    print(f"\n{'='*70}")
    print(f"Base KR Pipeline {KR_VERSION} — Block 1 (Base Truth)")
    print(f"{'='*70}")

    conn = get_conn()

    # Prerequisite: aggregate season stats
    count = conn.execute("SELECT count(*) AS c FROM player_season_stats").fetchone()
    if prep or (count and count["c"] == 0):
        aggregate_season_stats(conn)

    if not dry_run:
        ensure_schema(conn)

    level_map      = assign_level_keys(conn)
    team_max_gp    = _compute_team_max_gp(conn)
    players        = load_player_records(conn, level_filter, test_limit)
    barttorvik_map = load_barttorvik_data(conn)

    if debug_name:
        players = [p for p in players if debug_name.lower() in p["full_name"].lower()]
        print(f"  Debug filter: {len(players)} players matching '{debug_name}'")

    processed = scored_any = kr_computed = 0

    for player in players:
        pts_id = str(player["player_team_season_id"])
        ts_id  = str(player["team_season_id"])
        name   = player["full_name"]

        # Step 1: level key
        db_key = player["db_level_key"]
        if db_key == "ncaa_d1":
            conf      = player["conference_name"] or player["conference_abbrev"] or ""
            level_key = get_d1_level_key(conf)
        else:
            level_key = LEVEL_KEY_MAP.get(db_key, db_key)
        if not level_key:
            level_key = db_key

        # Step 2: trait inputs (box score base + barttorvik overlay for D1)
        trait_inputs   = build_trait_inputs(player)
        btt_data       = barttorvik_map.get(pts_id)
        coverage_tier  = COVERAGE_BOX_SCORE
        if btt_data:
            _apply_barttorvik_inputs(trait_inputs, btt_data)
            coverage_tier = COVERAGE_BARTTORVIK

        # Steps 3-4: trait scoring + confidence
        trait_scores, trait_confidence = score_player_traits(trait_inputs, coverage_tier)
        if any(v is not None for v in trait_scores.values()):
            scored_any += 1

        # Step 5: cluster aggregation
        cluster_scores, cluster_confidence = aggregate_clusters(trait_scores)

        # Step 6: position mapping
        position = map_position(player.get("declared_positions"))

        # Steps 6-7: OKR/DKR/TKR/IQKR + KLVN normalization (v4.0: uses trait_scores directly)
        # Player-specific baselines fill unscored traits with the player's own component
        # averages (self-consistent: OKR/DKR/TKR unchanged; IQ gets cross-component estimate)
        player_baselines = compute_player_baselines(trait_scores, position)
        kr_components = compute_player_kr(trait_scores, position, level_key, baselines=player_baselines)

        if kr_components.get("college_kr_base") is not None:
            kr_computed += 1

        # Steps 8-13: badges, archetypes, risks, overrides, modifiers, final KR
        gp          = int(player.get("games_played") or 0)
        t_max_gp    = team_max_gp.get(ts_id, gp)

        kr_result = finalize_kr(
            kr_components, trait_scores, trait_inputs, cluster_scores,
            player.get("height_inches"), position,
            player, gp, t_max_gp,
        )

        # Debug output
        if debug_name:
            print(f"\n  --- {name} ---")
            print(f"  Position: {position} | Level: {level_key} | λ={get_lambda(level_key):.3f}")
            scored = {k: v for k, v in trait_scores.items() if v is not None}
            print(f"  Scored traits ({len(scored)}/54): {scored}")
            print(f"  Clusters:")
            for c in CLUSTER_ORDER:
                cs = cluster_scores.get(c)
                cc = cluster_confidence.get(c, 0)
                print(f"    {c}: {round(cs,1) if cs is not None else 'N/A'} (conf={cc:.0f}%)")
            print(f"  OKR={_round(kr_components.get('okr'))} DKR={_round(kr_components.get('dkr'))} "
                  f"TKR={_round(kr_components.get('tkr'))} IQKR={_round(kr_components.get('iqkr'))}")
            print(f"  Base Player KR: {_round(kr_components.get('base_player_kr'))}")
            print(f"  College KR Base: {_round(kr_components.get('college_kr_base'))}")
            print(f"  Badge boost: {kr_result['badge_boost']}")
            print(f"  Risks: {kr_result['system_risk_keys']} (penalty={kr_result['system_risk_penalty']})")
            print(f"  Override: {kr_result.get('override')}")
            print(f"  Impact modifier: {kr_result['impact_modifier']}")
            print(f"  NPD Final KR: {_round(kr_result.get('npd_final_kr'))}")
            print(f"  Archetypes: {kr_result['archetypes']}")

        if not dry_run:
            write_results(
                conn, pts_id,
                trait_scores, trait_confidence,
                cluster_scores, cluster_confidence,
                kr_result,
                coverage_tier=coverage_tier,
            )

        processed += 1
        if processed % 500 == 0:
            if not dry_run:
                conn.commit()
            print(f"  Processed {processed}/{len(players)}...")

    if not dry_run:
        conn.commit()

    elapsed = time.time() - start
    print(f"\n{'='*70}")
    print(f"Pipeline complete in {elapsed:.1f}s")
    print(f"  Players processed: {processed}")
    print(f"  Players with scored traits: {scored_any}")
    print(f"  Players with KR: {kr_computed}")
    print(f"{'='*70}")

    if not dry_run and kr_computed > 0:
        stats = conn.execute("""
            SELECT count(*) AS total, count(npd_final_kr) AS with_kr,
                   round(avg(npd_final_kr)::numeric,1) AS avg_kr,
                   round(min(npd_final_kr)::numeric,1) AS min_kr,
                   round(max(npd_final_kr)::numeric,1) AS max_kr,
                   round(percentile_cont(0.5) WITHIN GROUP (ORDER BY npd_final_kr)::numeric,1) AS p50
            FROM player_kr_v3 WHERE npd_final_kr IS NOT NULL
        """).fetchone()
        if stats:
            print(f"\n  KR Distribution (v4):")
            print(f"    Total: {stats['with_kr']} | Avg: {stats['avg_kr']} | "
                  f"P50: {stats['p50']} | Min: {stats['min_kr']} | Max: {stats['max_kr']}")

        risk_stats = conn.execute("""
            SELECT count(*) FILTER (WHERE system_risk_penalty<0) AS with_risks,
                   round(avg(system_risk_penalty) FILTER (WHERE system_risk_penalty<0)::numeric,2) AS avg_pen
            FROM player_kr_v3
        """).fetchone()
        if risk_stats and risk_stats["with_risks"]:
            print(f"    Players with risks: {risk_stats['with_risks']} (avg penalty: {risk_stats['avg_pen']})")

        # Level distribution
        level_stats = conn.execute("""
            SELECT level_key,
                   count(*) AS n,
                   round(avg(npd_final_kr)::numeric,1) AS avg_kr
            FROM player_kr_v3
            WHERE npd_final_kr IS NOT NULL
            GROUP BY level_key
            ORDER BY avg_kr DESC
        """).fetchall()
        if level_stats:
            print(f"\n  KR by level:")
            for ls in level_stats:
                print(f"    {ls['level_key']}: n={ls['n']}, avg={ls['avg_kr']}")

        # Impact modifier distribution
        mod_stats = conn.execute("""
            SELECT impact_modifier, count(*) AS n
            FROM player_kr_v3
            GROUP BY impact_modifier
            ORDER BY n DESC
        """).fetchall()
        if mod_stats:
            print(f"\n  Impact modifiers:")
            for ms in mod_stats:
                print(f"    {ms['impact_modifier']}: {ms['n']}")

    conn.close()


# ═══════════════════════════════════════════════════════════════════════════
# CLI Entry Point
# ═══════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description=f"Base KR Pipeline {KR_VERSION}")
    parser.add_argument("--level",   type=str, help="Filter by level key (e.g. naia, ncaa_d1)")
    parser.add_argument("--test",    type=int, help="Process only first N players")
    parser.add_argument("--debug",   type=str, help="Debug output for player name match")
    parser.add_argument("--dry-run", action="store_true", help="Run without DB writes")
    parser.add_argument("--prep",    action="store_true", help="Force re-aggregate season stats")
    args = parser.parse_args()

    run_pipeline(
        level_filter=args.level,
        test_limit=args.test,
        debug_name=args.debug,
        dry_run=args.dry_run,
        prep=args.prep,
    )


if __name__ == "__main__":
    main()
