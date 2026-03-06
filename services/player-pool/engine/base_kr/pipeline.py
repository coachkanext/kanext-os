#!/usr/bin/env python3
"""
Base KR Pipeline — 13-Step College KR Engine v2.1

Source: Base KR.pdf (updated) + System Risks.docx + 6 companion specs

Steps:
  1.  Level Assignment
  2.  Build Player Season Record + Derived Stats
  3.  Trait Scoring (51 traits)
  4.  Confidence Gate
  5.  Cluster Aggregation (7 clusters)
  6.  Position Framework (flat 7-cluster weights → raw KR)
  7.  KLVN Normalization
  8.  Archetype Assignment
  9.  Badges
  10. System Risks
  11. Overrides
  12. NPD Final KR
  13. Confidence (overall)

Usage:
    cd services/player-pool/engine
    python3 -m base_kr.pipeline              # all players
    python3 -m base_kr.pipeline --level naia # one level
    python3 -m base_kr.pipeline --test 10    # first 10 only
    python3 -m base_kr.pipeline --debug "John Smith"
    python3 -m base_kr.pipeline --prep       # also aggregate season stats first
"""
from __future__ import annotations

import sys
import os
import time
import json
import argparse
from datetime import date

# Add scraper dir to path for db/config imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scraper"))
from config import DB_CONFIG

import psycopg
from psycopg.rows import dict_row

from .constants import (
    LAMBDA_LEVEL, LEVEL_KEY_MAP, KR_VERSION,
    COVERAGE_BOX_SCORE, get_d1_level_key, get_lambda,
)
from .traits import (
    TRAIT_DEFS, TRAITS_BY_CLUSTER, CLUSTER_ORDER,
    score_all_traits, coverage_meets,
)
from .positions import map_position, compute_raw_kr, POSITIONS
from .archetypes import assign_archetypes
from .badges import compute_badges
from .overrides import evaluate_overrides
from .system_risks import evaluate_system_risks


def _f(v) -> float:
    """Safely convert DB Decimal/None to float."""
    if v is None:
        return 0.0
    return float(v)


def get_conn():
    return psycopg.connect(
        host=DB_CONFIG["host"], port=DB_CONFIG["port"],
        dbname=DB_CONFIG["dbname"], row_factory=dict_row, autocommit=False,
    )


# ═══════════════════════════════════════════════════════════════════════════
# PREP: Aggregate Season Stats (prerequisite)
# ═══════════════════════════════════════════════════════════════════════════

def aggregate_season_stats(conn):
    """Aggregate player_game_stats → player_season_stats (reused from v1 engine)."""
    print("\n[PREP] Aggregating season stats from game data...")

    # Sentinel fix columns
    conn.execute("""
        DO $$ BEGIN
            ALTER TABLE player_game_stats ADD COLUMN minutes_status varchar;
        EXCEPTION WHEN duplicate_column THEN NULL;
        END $$
    """)
    conn.execute("""
        DO $$ BEGIN
            ALTER TABLE player_season_stats ADD COLUMN games_with_minutes integer;
        EXCEPTION WHEN duplicate_column THEN NULL;
        END $$
    """)
    conn.execute("""
        DO $$ BEGIN
            ALTER TABLE player_season_stats ADD COLUMN minutes_coverage_pct numeric;
        EXCEPTION WHEN duplicate_column THEN NULL;
        END $$
    """)
    conn.commit()

    # Reset then re-flag sentinel minutes
    conn.execute("UPDATE player_game_stats SET minutes_status = NULL WHERE minutes_status = 'MISSING_BOX_MINUTES'")
    conn.commit()
    sentinel = conn.execute("""
        UPDATE player_game_stats
        SET minutes = NULL, minutes_status = 'MISSING_BOX_MINUTES'
        WHERE (minutes IS NOT NULL AND minutes <= 1)
          AND (COALESCE(pts, 0) + COALESCE(oreb, 0) + COALESCE(dreb, 0) +
               COALESCE(ast, 0) + COALESCE(stl, 0) + COALESCE(blk, 0) +
               COALESCE(fga, 0) + COALESCE(fta, 0)) > 0
        RETURNING id
    """).fetchall()
    conn.commit()
    print(f"  Sentinel fix: {len(sentinel)} game rows")

    rows = conn.execute("""
        SELECT pts.id AS pts_id, pts.player_id, pts.team_season_id,
            count(pgs.id) AS games_played,
            count(CASE WHEN pgs.started THEN 1 END) AS games_started,
            count(CASE WHEN pgs.minutes IS NOT NULL THEN 1 END) AS games_with_minutes,
            coalesce(avg(pgs.minutes), 0) AS minutes_pg,
            coalesce(avg(pgs.pts), 0) AS pts_pg,
            coalesce(avg(pgs.reb), 0) AS reb_pg,
            coalesce(avg(pgs.ast), 0) AS ast_pg,
            coalesce(avg(pgs.stl), 0) AS stl_pg,
            coalesce(avg(pgs.blk), 0) AS blk_pg,
            coalesce(avg(pgs.turnovers), 0) AS to_pg,
            coalesce(avg(pgs.pf), 0) AS pf_pg,
            coalesce(avg(pgs.oreb), 0) AS oreb_pg,
            coalesce(avg(pgs.dreb), 0) AS dreb_pg,
            coalesce(avg(pgs.fga), 0) AS fga_pg,
            coalesce(avg(pgs.three_pa), 0) AS three_pa_pg,
            coalesce(avg(pgs.fta), 0) AS fta_pg,
            CASE WHEN sum(pgs.fga) > 0 THEN sum(pgs.fgm)::float / sum(pgs.fga) ELSE 0 END AS fg_pct,
            CASE WHEN sum(pgs.three_pa) > 0 THEN sum(pgs.three_pm)::float / sum(pgs.three_pa) ELSE 0 END AS three_pct,
            CASE WHEN sum(pgs.fta) > 0 THEN sum(pgs.ftm)::float / sum(pgs.fta) ELSE 0 END AS ft_pct
        FROM player_team_seasons pts
        JOIN players p ON pts.player_id = p.id
        JOIN player_game_stats pgs ON pgs.player_team_season_id = pts.id
        GROUP BY pts.id, pts.player_id, pts.team_season_id
        HAVING count(pgs.id) >= 1
    """).fetchall()

    print(f"  Found {len(rows)} player-team-seasons with game data")

    # Ensure rebound rate columns exist
    for col in ("dreb_pct", "oreb_pct"):
        conn.execute(f"""
            DO $$ BEGIN
                ALTER TABLE player_season_stats ADD COLUMN {col} numeric;
            EXCEPTION WHEN duplicate_column THEN NULL;
            END $$
        """)
    conn.commit()

    conn.execute("DELETE FROM player_season_stats")
    for r in rows:
        fga_pg = _f(r["fga_pg"])
        fta_pg = _f(r["fta_pg"])
        to_pg = _f(r["to_pg"])
        min_pg = _f(r["minutes_pg"])
        usage = ((fga_pg + 0.44 * fta_pg + to_pg) / (min_pg / 40.0 * 70.0) * 100) if min_pg > 5 else 0
        gp = int(r["games_played"] or 0)
        gwm = int(r["games_with_minutes"] or 0)
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
            ) VALUES (
                %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
            )
        """, (
            r["pts_id"], r["games_played"], r["games_started"],
            round(_f(r["minutes_pg"]), 1), round(_f(r["pts_pg"]), 1),
            round(_f(r["reb_pg"]), 1), round(_f(r["ast_pg"]), 1),
            round(_f(r["stl_pg"]), 1), round(_f(r["blk_pg"]), 1),
            round(_f(r["to_pg"]), 1),
            round(_f(r["fg_pct"]), 3), round(_f(r["three_pct"]), 3), round(_f(r["ft_pct"]), 3),
            round(_f(r["oreb_pg"]), 1), round(_f(r["dreb_pg"]), 1),
            round(_f(r["fga_pg"]), 1), round(_f(r["three_pa_pg"]), 1), round(_f(r["fta_pg"]), 1),
            round(_f(r["pf_pg"]), 1), round(usage, 1),
            gwm, round(min_cov, 3),
        ))
    conn.commit()
    print(f"  Inserted {len(rows)} season stat rows")

    # Compute DREB% and OREB% from game-level data
    _compute_rebound_rates(conn)


def _compute_rebound_rates(conn):
    """
    Compute DREB% and OREB% from game-level data.

    DREB% = Player_DREB / (Team_DREB + Opponent_OREB) × (Team_MP / Player_MP / 5)
    OREB% = Player_OREB / (Team_OREB + Opponent_DREB) × (Team_MP / Player_MP / 5)

    Averaged across all games per player-season.
    """
    print("  Computing rebound rates from game-level data...")

    # Build per-game team totals: team DREB, team OREB, team minutes
    conn.execute("""
        CREATE TEMP TABLE _team_game_reb AS
        SELECT pgs.game_id, pts.team_season_id,
               COALESCE(SUM(pgs.dreb), 0) AS team_dreb,
               COALESCE(SUM(pgs.oreb), 0) AS team_oreb,
               COALESCE(SUM(pgs.minutes), 0) AS team_minutes
        FROM player_game_stats pgs
        JOIN player_team_seasons pts ON pgs.player_team_season_id = pts.id
        GROUP BY pgs.game_id, pts.team_season_id
    """)

    # Join with games to get opponent stats
    # For each player-game, compute per-game DREB% and OREB%, then average
    reb_rows = conn.execute("""
        WITH player_game_reb AS (
            SELECT
                pgs.player_team_season_id,
                pgs.game_id,
                pts.team_season_id,
                COALESCE(pgs.dreb, 0) AS p_dreb,
                COALESCE(pgs.oreb, 0) AS p_oreb,
                COALESCE(pgs.minutes, 0) AS p_minutes,
                tg.team_dreb,
                tg.team_oreb,
                tg.team_minutes,
                CASE
                    WHEN g.home_team_season_id = pts.team_season_id
                    THEN g.away_team_season_id
                    ELSE g.home_team_season_id
                END AS opp_team_season_id
            FROM player_game_stats pgs
            JOIN player_team_seasons pts ON pgs.player_team_season_id = pts.id
            JOIN games g ON pgs.game_id = g.id
            JOIN _team_game_reb tg ON tg.game_id = pgs.game_id AND tg.team_season_id = pts.team_season_id
            WHERE pgs.minutes IS NOT NULL AND pgs.minutes > 0
              AND pgs.dreb IS NOT NULL
        ),
        with_opp AS (
            SELECT pgr.*,
                   COALESCE(opp.team_oreb, 0) AS opp_oreb,
                   COALESCE(opp.team_dreb, 0) AS opp_dreb
            FROM player_game_reb pgr
            LEFT JOIN _team_game_reb opp ON opp.game_id = pgr.game_id AND opp.team_season_id = pgr.opp_team_season_id
        )
        SELECT player_team_season_id,
            AVG(
                CASE WHEN (team_dreb + opp_oreb) > 0 AND team_minutes > 0 AND p_minutes > 0
                THEN p_dreb::float / (team_dreb + opp_oreb) * (team_minutes / p_minutes / 5.0)
                ELSE NULL END
            ) AS dreb_pct,
            AVG(
                CASE WHEN (team_oreb + opp_dreb) > 0 AND team_minutes > 0 AND p_minutes > 0
                THEN p_oreb::float / (team_oreb + opp_dreb) * (team_minutes / p_minutes / 5.0)
                ELSE NULL END
            ) AS oreb_pct
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
                SET dreb_pct = %s, oreb_pct = %s
                WHERE player_team_season_id = %s
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
    """
    Assign level_key (one of 14 KLVN keys) to every team_season.
    D1 teams get conference-based resolution (HM/MM/LM).
    Returns mapping: team_season_id → level_key.
    """
    print("\n[1/13] Assigning level keys...")

    rows = conn.execute("""
        SELECT ts.id AS team_season_id,
               cl.level_key AS db_level_key,
               c.name AS conference_name,
               c.abbreviation AS conference_abbrev
        FROM team_seasons ts
        JOIN teams t ON ts.team_id = t.id
        JOIN competitive_levels cl ON t.competitive_level_id = cl.id
        LEFT JOIN conferences c ON t.conference_id = c.id
    """).fetchall()

    level_map: dict[str, str] = {}
    for r in rows:
        ts_id = str(r["team_season_id"])
        db_key = r["db_level_key"]

        if db_key == "ncaa_d1":
            # Resolve to HM/MM/LM based on conference
            conf = r["conference_name"] or r["conference_abbrev"] or ""
            level_map[ts_id] = get_d1_level_key(conf)
        else:
            level_map[ts_id] = LEVEL_KEY_MAP.get(db_key, db_key)

    # Count by level
    counts: dict[str, int] = {}
    for lk in level_map.values():
        counts[lk] = counts.get(lk, 0) + 1
    for lk, cnt in sorted(counts.items()):
        print(f"  {lk}: {cnt} team-seasons")

    return level_map


# ═══════════════════════════════════════════════════════════════════════════
# STEP 2: Build Player Season Record
# ═══════════════════════════════════════════════════════════════════════════

def load_player_records(conn, level_filter: str | None = None, test_limit: int | None = None):
    """
    Load all player-season records with box score stats + bio data.
    Returns list of dicts with all inputs needed for trait scoring.
    """
    print("\n[2/13] Loading player season records...")

    where_clauses = ["pss.games_played >= 3", "pss.minutes_per_game >= 5"]
    params: list = []

    if level_filter:
        where_clauses.append("cl.level_key = %s")
        params.append(level_filter)

    where_sql = " AND ".join(where_clauses)
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
        JOIN player_team_seasons pts ON pss.player_team_season_id = pts.id
        JOIN players p ON pts.player_id = p.id
        JOIN team_seasons ts ON pts.team_season_id = ts.id
        JOIN teams t ON ts.team_id = t.id
        JOIN competitive_levels cl ON t.competitive_level_id = cl.id
        LEFT JOIN conferences c ON t.conference_id = c.id
        WHERE {where_sql}
        ORDER BY p.full_name
        {limit_sql}
    """, params).fetchall()

    print(f"  Loaded {len(rows)} player-season records")
    return rows


def build_trait_inputs(player: dict) -> dict[str, float | None]:
    """
    Extract trait input values from a player's box score stats.

    Uses production proxies: maps available box score / derived stats
    to trait input keys.  Traits score with whatever inputs are available.
    """
    inputs: dict[str, float | None] = {}

    fg_pct = _f(player.get("fg_pct"))
    fga_pg = _f(player.get("fga_per_game"))
    three_pct = _f(player.get("three_pct"))
    three_pa_pg = _f(player.get("three_pa_per_game"))
    ft_pct = _f(player.get("ft_pct"))
    fta_pg = _f(player.get("fta_per_game"))
    pts_pg = _f(player.get("pts_per_game"))
    ast_pg = _f(player.get("ast_per_game"))
    stl_pg = _f(player.get("stl_per_game"))
    blk_pg = _f(player.get("blk_per_game"))
    to_pg = _f(player.get("to_per_game"))
    oreb_pg = _f(player.get("oreb_per_game"))
    dreb_pg = _f(player.get("dreb_per_game"))
    pf_pg = _f(player.get("pf_per_game"))
    min_pg = _f(player.get("minutes_per_game"))

    # ── SHOOTING ──────────────────────────────────────────────────────
    # Spot-Up 3PT: use overall 3P% and 3PA/G as production proxy
    if three_pct > 0 and three_pa_pg >= 1.0:
        inputs["cs_3p_pct"] = three_pct
        inputs["cs_3pa_pg"] = three_pa_pg

    # 2PT Jumper C&S: UNSCORED at box_score coverage.
    # Overall 2P% includes at-rim finishes (dunks/layups) which inflates
    # midrange scores for bigs. Needs Synergy play-type data to isolate.

    # Free Throw
    inputs["ft_pct"] = ft_pct if ft_pct > 0 and fta_pg >= 1.0 else None

    # ── FINISHING ─────────────────────────────────────────────────────
    # FTA rate as foul draw proxy (fta_per_drive → use fta/fga)
    if fga_pg > 0 and fta_pg > 0:
        inputs["fta_per_drive"] = fta_pg / fga_pg

    # Close Finishing: use 2P% and 2P FGA/G as production proxy
    # 2P% captures all non-3PT field goals (layups, floaters, midrange, dunks).
    # Valid as a FINISHING proxy for all positions (high 2P% = good finisher).
    two_p_fga = fga_pg - three_pa_pg
    if two_p_fga >= 1.0 and fg_pct > 0:
        fgm_pg = fga_pg * fg_pct
        three_pm_pg = three_pa_pg * three_pct
        two_p_fgm = fgm_pg - three_pm_pg
        two_p_pct = two_p_fgm / two_p_fga if two_p_fga > 0 else 0.0
        if two_p_pct > 0:
            inputs["close_pct"] = two_p_pct
            inputs["close_att_pg"] = two_p_fga

    # ── PLAYMAKING ────────────────────────────────────────────────────
    # Passing Vision: AST/G as proxy for adjusted assists
    # + estimated potential assists (AST * 2.0 heuristic: ~50% of potential assists convert)
    if ast_pg > 0:
        inputs["ast_adj_pg"] = ast_pg
        inputs["potential_ast_pg"] = ast_pg * 2.0

    # Ball Security: UNSCORED at box_score coverage
    # Requires per-100-touches rate which needs tracking touch data.
    # Can't be approximated from box score (possessions_used ≠ touches).

    # ── PERIMETER DEFENSE ─────────────────────────────────────────────
    # Steal: estimate per-100-defensive-possessions
    if stl_pg > 0 and min_pg > 5:
        est_def_poss = (min_pg / 40.0) * 70.0
        if est_def_poss > 0:
            inputs["stl_per_100_def_poss"] = (stl_pg / est_def_poss) * 100.0

    # Perimeter Foul Discipline: PF rate proxy
    if pf_pg >= 0 and min_pg > 5:
        est_poss = (min_pg / 40.0) * 70.0
        if est_poss > 0:
            inputs["perim_fouls_per_100"] = (pf_pg / est_poss) * 100.0

    # ── INTERIOR DEFENSE ──────────────────────────────────────────────
    # Block: BLK/G as volume proxy
    if blk_pg > 0:
        inputs["blk_att_pg"] = blk_pg

    # ── REBOUNDING ────────────────────────────────────────────────────
    inputs["dreb_pg"] = dreb_pg if dreb_pg > 0 else None
    inputs["oreb_pg"] = oreb_pg if oreb_pg > 0 else None
    dp = player.get("dreb_pct")
    op = player.get("oreb_pct")
    inputs["dreb_pct"] = float(dp) if dp is not None else None
    inputs["oreb_pct"] = float(op) if op is not None else None

    # ── DERIVED STATS (Step 2 additions) ───────────────────────────
    fgm_pg_d = fga_pg * fg_pct if fga_pg > 0 else 0.0
    three_pm_pg_d = three_pa_pg * three_pct if three_pa_pg > 0 else 0.0

    # 2P% = (FGM - 3PM) / (FGA - 3PA)
    two_p_fga_d = fga_pg - three_pa_pg
    if two_p_fga_d > 0:
        inputs["2p_pct"] = (fgm_pg_d - three_pm_pg_d) / two_p_fga_d
    else:
        inputs["2p_pct"] = None

    # eFG% = (FGM + 0.5 * 3PM) / FGA
    if fga_pg > 0:
        inputs["efg_pct"] = (fgm_pg_d + 0.5 * three_pm_pg_d) / fga_pg
    else:
        inputs["efg_pct"] = None

    # AST/TO ratio (cap at 99 if TOV == 0)
    if to_pg > 0:
        inputs["ast_to"] = ast_pg / to_pg
    elif ast_pg > 0:
        inputs["ast_to"] = 99.0
    else:
        inputs["ast_to"] = None

    # FTA rate = FTA / FGA
    if fga_pg > 0:
        inputs["fta_rate"] = fta_pg / fga_pg
    else:
        inputs["fta_rate"] = None

    # 3PA rate = 3PA / FGA
    if fga_pg > 0:
        inputs["3pa_rate"] = three_pa_pg / fga_pg
    else:
        inputs["3pa_rate"] = None

    return inputs


# ═══════════════════════════════════════════════════════════════════════════
# STEP 3-4: Trait Scoring + Confidence Gate
# ═══════════════════════════════════════════════════════════════════════════

def score_player_traits(
    player_inputs: dict[str, float | None],
    coverage_tier: str = COVERAGE_BOX_SCORE,
) -> tuple[dict[str, int | None], dict[str, float]]:
    """
    Score all 51 traits and compute per-trait confidence.

    Returns:
      - trait_scores: dict[trait_key → score or None]
      - trait_confidence: dict[trait_key → confidence 0-100]
    """
    trait_scores = score_all_traits(player_inputs, coverage_tier)

    # Confidence: 100% if scored, 0% if unscored
    # (Future: partial confidence for low sample size)
    trait_confidence = {}
    for key, score in trait_scores.items():
        trait_confidence[key] = 100.0 if score is not None else 0.0

    return trait_scores, trait_confidence


# ═══════════════════════════════════════════════════════════════════════════
# STEP 5: Cluster Aggregation
# ═══════════════════════════════════════════════════════════════════════════

def aggregate_clusters(
    trait_scores: dict[str, int | None],
) -> tuple[dict[str, float | None], dict[str, float]]:
    """
    Aggregate trait scores into 7 cluster scores.

    Each cluster score = average of SCORED traits in that cluster.
    Cluster confidence = (scored traits / total traits) * 100.

    Returns:
      - cluster_scores: dict[cluster → score or None]
      - cluster_confidence: dict[cluster → confidence 0-100]
    """
    cluster_scores: dict[str, float | None] = {}
    cluster_confidence: dict[str, float] = {}

    for cluster in CLUSTER_ORDER:
        traits_in_cluster = TRAITS_BY_CLUSTER.get(cluster, [])
        scored = []
        for tdef in traits_in_cluster:
            score = trait_scores.get(tdef["key"])
            if score is not None:
                scored.append(score)

        total = len(traits_in_cluster)
        if scored:
            cluster_scores[cluster] = sum(scored) / len(scored)
            cluster_confidence[cluster] = (len(scored) / total) * 100.0
        else:
            cluster_scores[cluster] = None
            cluster_confidence[cluster] = 0.0

    return cluster_scores, cluster_confidence


# ═══════════════════════════════════════════════════════════════════════════
# STEP 6-7: Position Framework + KLVN Normalization
# ═══════════════════════════════════════════════════════════════════════════

def compute_player_kr(
    cluster_scores: dict[str, float | None],
    position: str,
    level_key: str,
) -> dict[str, float | None]:
    """
    Compute position-weighted raw KR and apply KLVN normalization.

    Returns dict with:
      raw_player_kr, college_kr_base, level_key, position
    """
    # Step 6: Position framework (flat weights)
    components = compute_raw_kr(cluster_scores, position)

    # Step 7: KLVN normalization
    raw_kr = components.get("raw_player_kr")
    if raw_kr is not None:
        lam = get_lambda(level_key)
        components["college_kr_base"] = raw_kr * lam
    else:
        components["college_kr_base"] = None

    components["level_key"] = level_key
    components["position"] = position

    return components


# ═══════════════════════════════════════════════════════════════════════════
# STEPS 8-12: Archetypes + Badges + System Risks + Overrides → NPD Final KR
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
    """
    Apply archetypes (8), badges (9), system risks (10), overrides (11),
    compute npd_final_kr (12).
    """
    # Step 8: Archetypes (do NOT change KR)
    archetypes = assign_archetypes(trait_scores, cluster_scores)

    # Step 9: Badges (raw_player_kr as universal component gate)
    raw_kr = kr_components.get("raw_player_kr")
    badge_result = compute_badges(trait_scores, raw_kr)

    # Step 10: System Risks
    risk_result = evaluate_system_risks(
        season_stats, trait_inputs, height_inches,
        position, games_played, team_max_gp,
    )

    # Step 11: Overrides
    override = evaluate_overrides(trait_scores, cluster_scores, height_inches, position)

    # Step 12: NPD Final KR
    base = kr_components.get("college_kr_base")
    if base is not None:
        npd_final_kr = (
            base
            + badge_result["overall_boost"]
            + risk_result["total_penalty"]
        )
        if override:
            npd_final_kr += override["kr_boost"]
        # Clamp to 0-100
        npd_final_kr = max(0.0, min(100.0, npd_final_kr))
    else:
        npd_final_kr = None

    return {
        **kr_components,
        "archetypes": archetypes,
        "badges": badge_result["badges"],
        "badge_okr_boost": badge_result["okr_boost"],
        "badge_dkr_boost": badge_result["dkr_boost"],
        "badge_overall_boost": badge_result["overall_boost"],
        "system_risks": risk_result["risks"],
        "system_risk_penalty": risk_result["total_penalty"],
        "system_risk_keys": [r["key"] for r in risk_result["risks"]],
        "override": override,
        "npd_final_kr": npd_final_kr,
    }


# ═══════════════════════════════════════════════════════════════════════════
# DB Write — Persist Results
# ═══════════════════════════════════════════════════════════════════════════

def ensure_schema(conn):
    """Create/update tables for Base KR v2.1 output."""
    conn.execute("""
        CREATE TABLE IF NOT EXISTS player_kr_v2 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            player_team_season_id UUID NOT NULL REFERENCES player_team_seasons(id),
            level_key VARCHAR NOT NULL,
            position VARCHAR NOT NULL,
            coverage_tier VARCHAR NOT NULL DEFAULT 'box_score',
            okr DECIMAL,
            dkr DECIMAL,
            tkr DECIMAL,
            raw_player_kr DECIMAL,
            college_kr_base DECIMAL,
            badge_boost DECIMAL DEFAULT 0,
            override_key VARCHAR,
            override_boost DECIMAL DEFAULT 0,
            system_risk_penalty DECIMAL DEFAULT 0,
            system_risk_keys VARCHAR[],
            npd_final_kr DECIMAL,
            primary_archetype VARCHAR,
            all_archetypes VARCHAR[],
            confidence_pct INTEGER DEFAULT 0,
            kr_version VARCHAR NOT NULL,
            computed_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(player_team_season_id)
        )
    """)
    # Migrate existing table: add new columns if they don't exist
    for col, default in [
        ("system_risk_penalty", "DECIMAL DEFAULT 0"),
        ("system_risk_keys", "VARCHAR[]"),
        ("npd_final_kr", "DECIMAL"),
    ]:
        conn.execute(f"""
            DO $$ BEGIN
                ALTER TABLE player_kr_v2 ADD COLUMN {col} {default};
            EXCEPTION WHEN duplicate_column THEN NULL;
            END $$
        """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS player_traits_v2 (
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
        CREATE TABLE IF NOT EXISTS player_clusters_v2 (
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
        CREATE TABLE IF NOT EXISTS player_badges_v2 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            player_team_season_id UUID NOT NULL REFERENCES player_team_seasons(id),
            badge_key VARCHAR NOT NULL,
            badge_name VARCHAR NOT NULL,
            tier VARCHAR NOT NULL,
            effect DECIMAL NOT NULL,
            component VARCHAR NOT NULL,
            badge_group VARCHAR,
            UNIQUE(player_team_season_id, badge_key)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS player_system_risks_v2 (
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
    print("  Schema verified (player_kr_v2, player_traits_v2, player_clusters_v2, player_badges_v2, player_system_risks_v2)")


def write_results(
    conn,
    pts_id: str,
    trait_scores: dict[str, int | None],
    trait_confidence: dict[str, float],
    cluster_scores: dict[str, float | None],
    cluster_confidence: dict[str, float],
    kr_result: dict,
):
    """Persist all results to DB for one player-season."""
    from .traits import TRAIT_BY_KEY, TRAITS_BY_CLUSTER

    # --- player_kr_v2 ---
    conn.execute("""
        INSERT INTO player_kr_v2 (
            player_team_season_id, level_key, position, coverage_tier,
            okr, dkr, tkr, raw_player_kr, college_kr_base,
            badge_boost, override_key, override_boost,
            system_risk_penalty, system_risk_keys,
            npd_final_kr,
            primary_archetype, all_archetypes, confidence_pct, kr_version
        ) VALUES (
            %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, %s,
            %s, %s,
            %s,
            %s, %s, %s, %s
        )
        ON CONFLICT (player_team_season_id) DO UPDATE SET
            level_key = EXCLUDED.level_key,
            position = EXCLUDED.position,
            coverage_tier = EXCLUDED.coverage_tier,
            okr = EXCLUDED.okr, dkr = EXCLUDED.dkr, tkr = EXCLUDED.tkr,
            raw_player_kr = EXCLUDED.raw_player_kr,
            college_kr_base = EXCLUDED.college_kr_base,
            badge_boost = EXCLUDED.badge_boost,
            override_key = EXCLUDED.override_key,
            override_boost = EXCLUDED.override_boost,
            system_risk_penalty = EXCLUDED.system_risk_penalty,
            system_risk_keys = EXCLUDED.system_risk_keys,
            npd_final_kr = EXCLUDED.npd_final_kr,
            primary_archetype = EXCLUDED.primary_archetype,
            all_archetypes = EXCLUDED.all_archetypes,
            confidence_pct = EXCLUDED.confidence_pct,
            kr_version = EXCLUDED.kr_version,
            computed_at = NOW()
    """, (
        pts_id,
        kr_result.get("level_key", ""),
        kr_result.get("position", ""),
        COVERAGE_BOX_SCORE,
        None,  # okr — no longer computed, kept nullable for backward compat
        None,  # dkr
        None,  # tkr
        _round(kr_result.get("raw_player_kr")),
        _round(kr_result.get("college_kr_base")),
        _round(kr_result.get("badge_overall_boost")),
        kr_result["override"]["key"] if kr_result.get("override") else None,
        kr_result["override"]["kr_boost"] if kr_result.get("override") else 0,
        _round(kr_result.get("system_risk_penalty")),
        kr_result.get("system_risk_keys") or [],
        _round(kr_result.get("npd_final_kr")),
        kr_result["archetypes"][0] if kr_result.get("archetypes") else None,
        kr_result.get("archetypes") or [],
        _compute_overall_confidence(cluster_confidence),
        KR_VERSION,
    ))

    # --- player_system_risks_v2 ---
    conn.execute("DELETE FROM player_system_risks_v2 WHERE player_team_season_id = %s", (pts_id,))
    for risk in kr_result.get("system_risks", []):
        conn.execute("""
            INSERT INTO player_system_risks_v2 (
                player_team_season_id, risk_key, risk_name, risk_type, penalty, trigger_values
            ) VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            pts_id, risk["key"], risk["name"], risk["type"],
            risk["penalty"], json.dumps(risk.get("trigger_values")),
        ))

    # --- player_traits_v2 ---
    conn.execute("DELETE FROM player_traits_v2 WHERE player_team_season_id = %s", (pts_id,))
    for tdef in TRAIT_DEFS:
        key = tdef["key"]
        score = trait_scores.get(key)
        conf = trait_confidence.get(key, 0.0)
        conn.execute("""
            INSERT INTO player_traits_v2 (player_team_season_id, trait_key, cluster, score, confidence_pct, status)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            pts_id, key, tdef["cluster"],
            score, round(conf, 1),
            "SCORED" if score is not None else "UNSCORED",
        ))

    # --- player_clusters_v2 ---
    conn.execute("DELETE FROM player_clusters_v2 WHERE player_team_season_id = %s", (pts_id,))
    for cluster in CLUSTER_ORDER:
        traits_in = TRAITS_BY_CLUSTER.get(cluster, [])
        scored_count = sum(1 for t in traits_in if trait_scores.get(t["key"]) is not None)
        conn.execute("""
            INSERT INTO player_clusters_v2 (player_team_season_id, cluster, score, confidence_pct, scored_traits, total_traits)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            pts_id, cluster,
            _round(cluster_scores.get(cluster)),
            round(cluster_confidence.get(cluster, 0), 1),
            scored_count, len(traits_in),
        ))

    # --- player_badges_v2 ---
    conn.execute("DELETE FROM player_badges_v2 WHERE player_team_season_id = %s", (pts_id,))
    for badge in kr_result.get("badges", []):
        conn.execute("""
            INSERT INTO player_badges_v2 (player_team_season_id, badge_key, badge_name, tier, effect, component, badge_group)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            pts_id, badge["key"], badge["name"], badge["tier"],
            badge["effect"], badge["component"], badge.get("group"),
        ))


def _round(v, n=2):
    if v is None:
        return None
    return round(float(v), n)


def _compute_overall_confidence(cluster_confidence: dict[str, float]) -> int:
    """Overall confidence = average of cluster confidences."""
    vals = list(cluster_confidence.values())
    if not vals:
        return 0
    return round(sum(vals) / len(vals))


def _compute_team_max_gp(conn) -> dict[str, int]:
    """Compute max games played per team_season for fragility risk."""
    rows = conn.execute("""
        SELECT pts.team_season_id, MAX(pss.games_played) AS max_gp
        FROM player_season_stats pss
        JOIN player_team_seasons pts ON pss.player_team_season_id = pts.id
        GROUP BY pts.team_season_id
    """).fetchall()
    return {str(r["team_season_id"]): int(r["max_gp"]) for r in rows}


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
    """Execute the full 13-step Base KR pipeline."""
    start = time.time()
    print(f"\n{'='*70}")
    print(f"Base KR Pipeline v2.1 — {KR_VERSION}")
    print(f"{'='*70}")

    conn = get_conn()

    # Prerequisite: aggregate season stats if requested or table is empty
    count = conn.execute("SELECT count(*) AS c FROM player_season_stats").fetchone()
    if prep or (count and count["c"] == 0):
        aggregate_season_stats(conn)

    # Schema setup
    if not dry_run:
        ensure_schema(conn)

    # Step 1: Level assignment
    level_map = assign_level_keys(conn)

    # Precompute team max GP for fragility risk
    team_max_gp_map = _compute_team_max_gp(conn)

    # Step 2: Load player records
    players = load_player_records(conn, level_filter, test_limit)

    if debug_name:
        players = [p for p in players if debug_name.lower() in p["full_name"].lower()]
        print(f"  Debug filter: {len(players)} players matching '{debug_name}'")

    # Process each player
    processed = 0
    scored_any = 0
    kr_computed = 0

    for player in players:
        pts_id = str(player["player_team_season_id"])
        ts_id = str(player["team_season_id"])
        name = player["full_name"]

        # Step 1 (per-player): Resolve level key
        db_level = player["db_level_key"]
        if db_level == "ncaa_d1":
            conf = player["conference_name"] or player["conference_abbrev"] or ""
            level_key = get_d1_level_key(conf)
        else:
            level_key = LEVEL_KEY_MAP.get(db_level, db_level)

        if level_key is None:
            level_key = db_level  # fallback

        # Step 2: Build trait inputs (includes derived stats)
        trait_inputs = build_trait_inputs(player)

        # Step 3-4: Score traits + confidence
        trait_scores, trait_confidence = score_player_traits(trait_inputs, COVERAGE_BOX_SCORE)

        scored_count = sum(1 for v in trait_scores.values() if v is not None)
        if scored_count > 0:
            scored_any += 1

        # Step 5: Cluster aggregation
        cluster_scores, cluster_confidence = aggregate_clusters(trait_scores)

        # Step 6: Position mapping
        position = map_position(player.get("declared_positions"))

        # Step 6-7: Raw KR + KLVN
        kr_components = compute_player_kr(cluster_scores, position, level_key)

        if kr_components.get("college_kr_base") is not None:
            kr_computed += 1

        # Steps 8-12: Archetypes + Badges + System Risks + Overrides → NPD Final KR
        gp = int(player.get("games_played") or 0)
        team_max_gp = team_max_gp_map.get(ts_id, gp)

        kr_result = finalize_kr(
            kr_components, trait_scores, trait_inputs, cluster_scores,
            player.get("height_inches"), position,
            player, gp, team_max_gp,
        )

        # Debug output
        if debug_name:
            print(f"\n  --- {name} ---")
            print(f"  Position: {position} | Level: {level_key} | λ={get_lambda(level_key):.3f}")
            print(f"  Scored traits: {scored_count}/51")
            for key, score in trait_scores.items():
                if score is not None:
                    print(f"    {key}: {score}")
            print(f"  Clusters:")
            for c in CLUSTER_ORDER:
                cs = cluster_scores.get(c)
                cc = cluster_confidence.get(c, 0)
                print(f"    {c}: {cs if cs is not None else 'N/A'} (conf={cc:.0f}%)")
            print(f"  Raw KR: {_round(kr_components.get('raw_player_kr'))}")
            print(f"  College KR Base: {_round(kr_components.get('college_kr_base'))}")
            print(f"  Badge boost: {kr_result['badge_overall_boost']}")
            print(f"  System risks: {kr_result['system_risk_keys']} (penalty={kr_result['system_risk_penalty']})")
            print(f"  Override: {kr_result.get('override')}")
            print(f"  NPD Final KR: {_round(kr_result.get('npd_final_kr'))}")
            print(f"  Archetypes: {kr_result['archetypes']}")

        # Write to DB
        if not dry_run:
            write_results(
                conn, pts_id,
                trait_scores, trait_confidence,
                cluster_scores, cluster_confidence,
                kr_result,
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

    # Summary stats
    if not dry_run and kr_computed > 0:
        stats = conn.execute("""
            SELECT
                count(*) AS total,
                count(npd_final_kr) AS with_kr,
                round(avg(npd_final_kr)::numeric, 1) AS avg_kr,
                round(min(npd_final_kr)::numeric, 1) AS min_kr,
                round(max(npd_final_kr)::numeric, 1) AS max_kr,
                round(percentile_cont(0.5) WITHIN GROUP (ORDER BY npd_final_kr)::numeric, 1) AS p50
            FROM player_kr_v2
            WHERE npd_final_kr IS NOT NULL
        """).fetchone()
        if stats:
            print(f"\n  KR Distribution:")
            print(f"    Total with KR: {stats['with_kr']}")
            print(f"    Avg: {stats['avg_kr']} | Min: {stats['min_kr']} | Max: {stats['max_kr']} | P50: {stats['p50']}")

        # System risk summary
        risk_stats = conn.execute("""
            SELECT
                count(*) FILTER (WHERE system_risk_penalty < 0) AS with_risks,
                round(avg(system_risk_penalty) FILTER (WHERE system_risk_penalty < 0)::numeric, 2) AS avg_penalty
            FROM player_kr_v2
        """).fetchone()
        if risk_stats and risk_stats["with_risks"]:
            print(f"    Players with system risks: {risk_stats['with_risks']} (avg penalty: {risk_stats['avg_penalty']})")

    conn.close()


# ═══════════════════════════════════════════════════════════════════════════
# CLI Entry Point
# ═══════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="Base KR Pipeline v2")
    parser.add_argument("--level", type=str, help="Filter by level key (e.g. naia, ncaa_d1)")
    parser.add_argument("--test", type=int, help="Process only first N players")
    parser.add_argument("--debug", type=str, help="Debug output for player name match")
    parser.add_argument("--dry-run", action="store_true", help="Run without DB writes")
    parser.add_argument("--prep", action="store_true", help="Force re-aggregate season stats")
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
