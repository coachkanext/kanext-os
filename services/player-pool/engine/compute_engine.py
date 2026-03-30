#!/usr/bin/env python3
"""
KaNeXT KR Computation Engine — V1 (Box-Score)
Processes all scraped players through:
  1. Season stats aggregation
  2. BPR computation (per-game and season)
  3. TPQ computation (Team Performance Quality)
  4. Player KR (KLVN + clusters + archetype)
  5. Team KR aggregation
  6. OSIE / DSIE system inference
  7. Scholarship & NIL allocation
  8. Audit logging

Usage:
    cd services/player-pool/engine
    python3 compute_engine.py              # process all
    python3 compute_engine.py --level naia # process one level only
    python3 compute_engine.py --team-only  # skip player KR, recompute team KR only
"""

from __future__ import annotations
import sys
import os
import time
import json
import argparse
from datetime import date

# Add scraper dir to path for db/config imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scraper"))

import psycopg
from psycopg.rows import dict_row
from config import DB_CONFIG

from bpr import compute_bpr, season_bpr, compute_bpr_trend
from clusters import compute_all_clusters, compute_derived_lenses
from player_kr import compute_player_kr, map_position
from badges import compute_badges
from team_kr import compute_team_kr
from osie_dsie import infer_offensive_system, infer_defensive_system
from klvn import compute_confidence, get_lambda, klvn_translate
from impact_scores import compute_game_bpr, compute_tpq, compute_season_game_bpr
# Retired term aliases kept for any callers not yet updated
compute_pgis = compute_game_bpr
compute_tgis = compute_tpq
compute_season_pgis = compute_season_game_bpr
from scholarship_nil import run_allocation, SCHOLARSHIP_CAPS
from context_engine import apply_context_adjustments
from context_layer import compute_context
from conference_map import resolve_d1_conference, assign_d1_tier

# Level keys that use Pro KR mode (higher thresholds, different weights)
PRO_LEVEL_KEYS = {"professional", "nba", "g_league", "overseas_pro"}

KR_VERSION = "v1.0-boxscore"


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
# STEP 1: Season Stats Aggregation
# ═══════════════════════════════════════════════════════════════════════════

def compute_season_stats(conn):
    """Aggregate player_game_stats into player_season_stats."""
    print("\n[1/8] Computing season stats...")

    # ── Sentinel fix: minutes=0/1 with real stats → NULL ──
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

    # Reset previous sentinel flags (in case of re-run with restored data)
    conn.execute("""
        UPDATE player_game_stats
        SET minutes_status = NULL
        WHERE minutes_status = 'MISSING_BOX_MINUTES'
    """)
    conn.commit()

    # Flag sentinel minutes: 0 or 1 with real stat production → NULL
    sentinel_result = conn.execute("""
        UPDATE player_game_stats
        SET minutes = NULL, minutes_status = 'MISSING_BOX_MINUTES'
        WHERE (minutes IS NOT NULL AND minutes <= 1)
          AND (COALESCE(pts, 0) + COALESCE(oreb, 0) + COALESCE(dreb, 0) +
               COALESCE(ast, 0) + COALESCE(stl, 0) + COALESCE(blk, 0) +
               COALESCE(fga, 0) + COALESCE(fta, 0)) > 0
        RETURNING id
    """).fetchall()
    conn.commit()
    print(f"  Sentinel fix: {len(sentinel_result)} game rows with minutes=0/1 → NULL")

    # Get all player_team_seasons with game data
    # NOTE: avg(pgs.minutes) automatically excludes NULLs (sentinel-fixed rows)
    rows = conn.execute("""
        SELECT
            pts.id AS pts_id,
            pts.player_id,
            pts.team_season_id,
            p.declared_positions,
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
            CASE WHEN sum(pgs.fta) > 0 THEN sum(pgs.ftm)::float / sum(pgs.fta) ELSE 0 END AS ft_pct,
            coalesce(sum(pgs.minutes), 0) AS total_minutes
        FROM player_team_seasons pts
        JOIN players p ON pts.player_id = p.id
        JOIN player_game_stats pgs ON pgs.player_team_season_id = pts.id
        GROUP BY pts.id, pts.player_id, pts.team_season_id, p.declared_positions
        HAVING count(pgs.id) >= 1
    """).fetchall()

    print(f"  Found {len(rows)} player-team-seasons with game data")

    # Clear existing
    conn.execute("DELETE FROM player_season_stats")

    inserted = 0
    for r in rows:
        # Usage rate approximation: (FGA + 0.44*FTA + TO) / (MIN/40 * team_poss)
        fga_pg = _f(r["fga_pg"])
        fta_pg = _f(r["fta_pg"])
        to_pg = _f(r["to_pg"])
        min_pg = _f(r["minutes_pg"])
        usage = ((fga_pg + 0.44 * fta_pg + to_pg) / (min_pg / 40.0 * 70.0) * 100) if min_pg > 5 else 0

        # Minutes coverage: fraction of games with real (non-sentinel) minutes
        gp = int(r["games_played"] or 0)
        gwm = int(r["games_with_minutes"] or 0)
        min_coverage = gwm / gp if gp > 0 else 0.0

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
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s
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
            gwm, round(min_coverage, 3),
        ))
        inserted += 1

    conn.commit()
    print(f"  Inserted {inserted} season stat rows")
    return rows


# ═══════════════════════════════════════════════════════════════════════════
# STEP 1.5: Data Validation — flag INVALID_SOURCE rows
# ═══════════════════════════════════════════════════════════════════════════

def validate_season_stats(conn) -> set[str]:
    """
    Cross-check player_season_stats vs player_game_stats totals.
    Returns set of player_team_season_ids that should be excluded from KR.

    Checks:
      1. Game count mismatch (reported GP vs actual PGS rows)
      2. Total minutes mismatch (GP * MPG vs SUM(pgs.minutes))
      3. Total points mismatch (GP * PPG vs SUM(pgs.pts))
    Tolerance: 15% for totals, exact for game count.
    """
    print("\n[1.5/8] Validating season stats...")

    rows = conn.execute("""
        SELECT pss.player_team_season_id,
               pss.games_played AS reported_gp,
               COUNT(pgs.id) AS actual_gp,
               COUNT(pgs.minutes) AS games_with_min,
               pss.minutes_per_game AS mpg,
               COUNT(pgs.minutes) * pss.minutes_per_game AS expected_min,
               COALESCE(SUM(pgs.minutes), 0) AS actual_min,
               pss.games_played * pss.pts_per_game AS expected_pts,
               COALESCE(SUM(pgs.pts), 0) AS actual_pts,
               pss.games_played * pss.to_per_game AS expected_to,
               COALESCE(SUM(pgs.turnovers), 0) AS actual_to
        FROM player_season_stats pss
        JOIN player_game_stats pgs ON pgs.player_team_season_id = pss.player_team_season_id
        WHERE pss.games_played >= 3 AND pss.minutes_per_game >= 5
        GROUP BY pss.player_team_season_id, pss.games_played,
                 pss.minutes_per_game, pss.pts_per_game, pss.to_per_game
    """).fetchall()

    invalid_ids: set[str] = set()
    reasons: dict[str, list[str]] = {}

    for r in rows:
        pts_id = str(r["player_team_season_id"])
        fails = []

        # Check 1: game count mismatch
        if r["reported_gp"] != r["actual_gp"]:
            fails.append(f"GP mismatch: reported={r['reported_gp']} actual={r['actual_gp']}")

        # Check 2: total minutes mismatch (> 15%)
        # Compare only against games that actually have minutes data (many box
        # scores omit minutes — NULL minutes != 0 minutes played).
        exp_min = float(r["expected_min"] or 0)   # games_with_min * MPG
        act_min = float(r["actual_min"] or 0)
        if exp_min > 0 and abs(act_min - exp_min) / exp_min > 0.15:
            fails.append(f"MIN mismatch: expected={exp_min:.0f} actual={act_min:.0f}")

        # Check 3: total points mismatch (> 15%)
        exp_pts = float(r["expected_pts"] or 0)
        act_pts = float(r["actual_pts"] or 0)
        if exp_pts > 5 and abs(act_pts - exp_pts) / exp_pts > 0.15:
            fails.append(f"PTS mismatch: expected={exp_pts:.0f} actual={act_pts:.0f}")

        if fails:
            invalid_ids.add(pts_id)
            reasons[pts_id] = fails

    if invalid_ids:
        print(f"  Flagged {len(invalid_ids)} player-seasons as INVALID_SOURCE")
        # Show first 5 examples
        for pts_id in list(invalid_ids)[:5]:
            print(f"    {pts_id}: {'; '.join(reasons[pts_id])}")
        if len(invalid_ids) > 5:
            print(f"    ... and {len(invalid_ids) - 5} more")
    else:
        print("  All season stats validated OK")

    return invalid_ids


# ═══════════════════════════════════════════════════════════════════════════
# STEP 2: BPR v2 Computation (per-game and season)
# ═══════════════════════════════════════════════════════════════════════════

def compute_all_bpr_pgis(conn):
    """Compute BPR v2 and PGIS for every player game stat row."""
    print("\n[2/8] Computing BPR v2 + PGIS for all games...")

    BPR_VERSION = "v2.0"

    # ── Precompute per-player context: position, level_key, season USG% ──
    print("  Precomputing player context (position / level / USG)...")
    context_rows = conn.execute("""
        SELECT pts.id AS pts_id,
               p.declared_positions,
               cl.level_key,
               pss.usage_rate
        FROM player_team_seasons pts
        JOIN players p ON pts.player_id = p.id
        JOIN team_seasons ts ON pts.team_season_id = ts.id
        JOIN teams t ON ts.team_id = t.id
        JOIN competitive_levels cl ON t.competitive_level_id = cl.id
        LEFT JOIN player_season_stats pss ON pss.player_team_season_id = pts.id
    """).fetchall()

    player_ctx: dict[str, dict] = {}
    for r in context_rows:
        raw_pos = (r["declared_positions"] or [None])[0]
        player_ctx[str(r["pts_id"])] = {
            "position": map_position(raw_pos),
            "level_key": r["level_key"] or "ncaa_d3",
            "usage_rate": float(r["usage_rate"]) if r["usage_rate"] else None,
        }

    # ── Precompute team depth scores per team_season_id ──
    print("  Precomputing team depth scores...")
    depth_rows = conn.execute("""
        SELECT pts.team_season_id,
               pts.id AS pts_id,
               pss.pts_per_game
        FROM player_team_seasons pts
        JOIN player_season_stats pss ON pss.player_team_season_id = pts.id
        WHERE pss.pts_per_game IS NOT NULL
        ORDER BY pts.team_season_id, pss.pts_per_game DESC
    """).fetchall()

    # Group PPG by team_season, build top-5-per-player depth scores
    from collections import defaultdict
    team_ppg: dict[str, list[tuple[str, float]]] = defaultdict(list)
    for r in depth_rows:
        team_ppg[str(r["team_season_id"])].append(
            (str(r["pts_id"]), float(r["pts_per_game"]))
        )

    # depth_score[pts_id] = (avg PPG of top-5 excluding self) / 10
    depth_score: dict[str, float] = {}
    for ts_id, members in team_ppg.items():
        # members already sorted descending by ppg
        for i, (pts_id, _) in enumerate(members):
            others = [ppg for j, (_, ppg) in enumerate(members) if j != i]
            top5 = sorted(others, reverse=True)[:5]
            avg5 = sum(top5) / len(top5) if top5 else 0.0
            depth_score[pts_id] = avg5 / 10.0

    # ── Main per-game loop ────────────────────────────────────────────────
    rows = conn.execute("""
        SELECT pgs.id, pgs.player_team_season_id,
               pgs.minutes, pgs.pts, pgs.fgm, pgs.fga,
               pgs.ftm, pgs.fta, pgs.three_pm, pgs.three_pa,
               pgs.oreb, pgs.dreb, pgs.ast, pgs.stl, pgs.blk,
               pgs.turnovers, pgs.pf,
               tgs.possessions AS team_poss
        FROM player_game_stats pgs
        JOIN player_team_seasons pts ON pgs.player_team_season_id = pts.id
        LEFT JOIN team_game_stats tgs ON tgs.game_id = pgs.game_id
            AND tgs.team_season_id = pts.team_season_id
        WHERE pgs.minutes > 0
    """).fetchall()

    print(f"  Processing {len(rows)} game stat rows...")

    updated = 0
    for r in rows:
        pts_id = str(r["player_team_season_id"])
        ctx = player_ctx.get(pts_id, {})

        bpr_val = compute_bpr(
            minutes=_f(r["minutes"]), pts=int(r["pts"] or 0),
            fgm=int(r["fgm"] or 0), fga=int(r["fga"] or 0),
            ftm=int(r["ftm"] or 0), fta=int(r["fta"] or 0),
            three_pm=int(r["three_pm"] or 0), three_pa=int(r["three_pa"] or 0),
            oreb=int(r["oreb"] or 0), dreb=int(r["dreb"] or 0),
            ast=int(r["ast"] or 0), stl=int(r["stl"] or 0), blk=int(r["blk"] or 0),
            turnovers=int(r["turnovers"] or 0), pf=int(r["pf"] or 0),
            team_poss=_f(r["team_poss"]) if r["team_poss"] else None,
            position=ctx.get("position", "W"),
            level_key=ctx.get("level_key", "ncaa_d3"),
            team_depth_score=depth_score.get(pts_id),
            usage_rate=ctx.get("usage_rate"),
        )

        game_bpr_display = compute_game_bpr(
            bpr=bpr_val or 0, minutes=_f(r["minutes"]),
            pts=int(r["pts"] or 0), fgm=int(r["fgm"] or 0), fga=int(r["fga"] or 0),
            ftm=int(r["ftm"] or 0), fta=int(r["fta"] or 0),
            three_pm=int(r["three_pm"] or 0),
            ast=int(r["ast"] or 0), stl=int(r["stl"] or 0), blk=int(r["blk"] or 0),
            oreb=int(r["oreb"] or 0), dreb=int(r["dreb"] or 0),
            turnovers=int(r["turnovers"] or 0), pf=int(r["pf"] or 0),
            team_poss=_f(r["team_poss"]) if r["team_poss"] else None,
        )

        conn.execute("""
            UPDATE player_game_stats
            SET bpr_value = %s, bpr_version = %s, pgis_value = %s
            WHERE id = %s
        """, (bpr_val, BPR_VERSION, game_bpr_display, r["id"]))
        updated += 1

    conn.commit()
    print(f"  Updated {updated} game stats with BPR v2 + PGIS")

    # ── Season BPR: minutes-weighted average + linear regression trend ────
    print("  Computing season BPR averages and trends...")
    game_bpr_rows = conn.execute("""
        SELECT pgs.player_team_season_id,
               pgs.bpr_value,
               pgs.minutes,
               g.game_date
        FROM player_game_stats pgs
        JOIN games g ON pgs.game_id = g.id
        WHERE pgs.bpr_value IS NOT NULL
        ORDER BY pgs.player_team_season_id, g.game_date ASC
    """).fetchall()

    # Group by player
    from collections import defaultdict
    player_games: dict[str, list[tuple[float, float]]] = defaultdict(list)
    for r in game_bpr_rows:
        player_games[str(r["player_team_season_id"])].append(
            (float(r["bpr_value"]), float(r["minutes"]))
        )

    season_updates = []
    for pts_id, games in player_games.items():
        avg = season_bpr(games)
        bpr_vals_ordered = [b for b, _ in games]
        trend = compute_bpr_trend(bpr_vals_ordered)
        season_updates.append((avg, trend, pts_id))

    with conn.cursor() as cur:
        cur.executemany("""
            UPDATE player_season_stats
            SET bpr_season_avg = %s, bpr_trend = %s
            WHERE player_team_season_id = %s
        """, season_updates)
    conn.commit()
    print(f"  Updated {len(season_updates)} player season BPR averages and trends")


# ═══════════════════════════════════════════════════════════════════════════
# STEP 3: TPQ Computation (per-game)
# Previously called TGIS — term retired per TPQ v1 spec (March 2026)
# ═══════════════════════════════════════════════════════════════════════════

def compute_all_tpq(conn):
    """Compute TPQ (Team Performance Quality) for every game."""
    print("\n[3/8] Computing TPQ for all games...")

    games = conn.execute("""
        SELECT g.id AS game_id,
               g.home_score, g.away_score,
               g.home_team_season_id, g.away_team_season_id,
               th.fgm AS h_fgm, th.fga AS h_fga,
               th.three_pm AS h_3pm, th.three_pa AS h_3pa,
               th.ftm AS h_ftm, th.fta AS h_fta,
               th.ast AS h_ast, th.stl AS h_stl, th.blk AS h_blk,
               th.oreb AS h_oreb, th.dreb AS h_dreb,
               th.turnovers AS h_to, th.pf AS h_pf,
               th.possessions AS h_poss,
               ta.fgm AS a_fgm, ta.fga AS a_fga,
               ta.three_pm AS a_3pm, ta.three_pa AS a_3pa,
               ta.ftm AS a_ftm, ta.fta AS a_fta,
               ta.ast AS a_ast, ta.stl AS a_stl, ta.blk AS a_blk,
               ta.oreb AS a_oreb, ta.dreb AS a_dreb,
               ta.turnovers AS a_to, ta.pf AS a_pf,
               ta.possessions AS a_poss
        FROM games g
        LEFT JOIN team_game_stats th ON th.game_id = g.id AND th.is_home = true
        LEFT JOIN team_game_stats ta ON ta.game_id = g.id AND ta.is_home = false
        WHERE g.home_score IS NOT NULL AND g.away_score IS NOT NULL
    """).fetchall()

    updated = 0
    for g in games:
        # Home TPQ
        if g["h_fga"] and g["h_poss"] and float(g["h_poss"]) > 0:
            home_tgis = compute_tpq(
                team_pts=g["home_score"] or 0, opp_pts=g["away_score"] or 0,
                team_fgm=g["h_fgm"] or 0, team_fga=g["h_fga"] or 0,
                team_three_pm=g["h_3pm"] or 0, team_three_pa=g["h_3pa"] or 0,
                team_ftm=g["h_ftm"] or 0, team_fta=g["h_fta"] or 0,
                team_ast=g["h_ast"] or 0, team_stl=g["h_stl"] or 0,
                team_blk=g["h_blk"] or 0,
                team_oreb=g["h_oreb"] or 0, team_dreb=g["h_dreb"] or 0,
                team_to=g["h_to"] or 0, team_pf=g["h_pf"] or 0,
                team_poss=float(g["h_poss"]), is_home=True,
            )
        else:
            home_tgis = None

        # Away TPQ
        if g["a_fga"] and g["a_poss"] and float(g["a_poss"]) > 0:
            away_tgis = compute_tpq(
                team_pts=g["away_score"] or 0, opp_pts=g["home_score"] or 0,
                team_fgm=g["a_fgm"] or 0, team_fga=g["a_fga"] or 0,
                team_three_pm=g["a_3pm"] or 0, team_three_pa=g["a_3pa"] or 0,
                team_ftm=g["a_ftm"] or 0, team_fta=g["a_fta"] or 0,
                team_ast=g["a_ast"] or 0, team_stl=g["a_stl"] or 0,
                team_blk=g["a_blk"] or 0,
                team_oreb=g["a_oreb"] or 0, team_dreb=g["a_dreb"] or 0,
                team_to=g["a_to"] or 0, team_pf=g["a_pf"] or 0,
                team_poss=float(g["a_poss"]), is_home=False,
            )
        else:
            away_tgis = None

        conn.execute("""
            UPDATE games SET tgis_home = %s, tgis_away = %s,
                             tgis_version = %s, tgis_mode = 'boxscore'
            WHERE id = %s
        """, (home_tgis, away_tgis, KR_VERSION, g["game_id"]))
        updated += 1

    conn.commit()
    print(f"  Updated {updated} games with TPQ")


# ═══════════════════════════════════════════════════════════════════════════
# STEP 4: Player KR + Clusters
# ═══════════════════════════════════════════════════════════════════════════

def compute_all_player_kr(conn, season_data: list[dict], debug_name: str | None = None,
                          invalid_ids: set[str] | None = None):
    """Compute clusters and KR for every player."""
    print("\n[4/8] Computing Player KR (clusters + archetype)...")

    # Ensure kr_status column exists
    conn.execute("""
        DO $$ BEGIN
            ALTER TABLE player_kr ADD COLUMN kr_status varchar DEFAULT 'FINAL';
        EXCEPTION WHEN duplicate_column THEN NULL;
        END $$
    """)
    # League-internal + translation columns
    for col, ctype in [
        ("kr_league_internal", "REAL DEFAULT 0"),
        ("off_kr_league_internal", "REAL DEFAULT 0"),
        ("def_kr_league_internal", "REAL DEFAULT 0"),
        ("level_offset", "REAL DEFAULT 0"),
        ("confidence_penalty", "REAL DEFAULT 0"),
        ("schedule_adjustment", "REAL DEFAULT 0"),
        ("context_delta", "REAL DEFAULT 0"),
        ("context_kr", "REAL DEFAULT 0"),
        ("context_flags", "TEXT[] DEFAULT '{}'"),
        ("context_explain", "TEXT[] DEFAULT '{}'"),
        ("context_cap_hit", "BOOLEAN DEFAULT FALSE"),
    ]:
        conn.execute(f"""
            DO $$ BEGIN
                ALTER TABLE player_kr ADD COLUMN {col} {ctype};
            EXCEPTION WHEN duplicate_column THEN NULL;
            END $$
        """)
    conn.execute("""
        DO $$ BEGIN
            ALTER TABLE player_kr_clusters ADD COLUMN score_league_internal REAL DEFAULT 0;
        EXCEPTION WHEN duplicate_column THEN NULL;
        END $$
    """)
    conn.commit()

    # Clear existing KR data (badges cascade from player_kr)
    conn.execute("DELETE FROM player_badges")
    conn.execute("DELETE FROM player_kr_traits")
    conn.execute("DELETE FROM player_kr_clusters")
    conn.execute("DELETE FROM player_kr")
    conn.commit()

    # Get level info + team name + conference for each team_season
    team_levels = {}
    team_meta = {}  # ts_id -> {level_key, team_name, db_conference}
    level_rows = conn.execute("""
        SELECT ts.id AS team_season_id, cl.level_key, t.name AS team_name,
               c.name AS db_conference
        FROM team_seasons ts
        JOIN teams t ON ts.team_id = t.id
        JOIN competitive_levels cl ON t.competitive_level_id = cl.id
        LEFT JOIN conferences c ON c.id = t.conference_id
    """).fetchall()
    for lr in level_rows:
        ts_key = str(lr["team_season_id"])
        lk = lr["level_key"]
        # D1 remap: ncaa_d1 → ncaa_d1_high_major / mid_major / low_major
        if lk == "ncaa_d1":
            conf = resolve_d1_conference(lr["team_name"], lr.get("db_conference"))
            lk = assign_d1_tier(conf)
        team_levels[ts_key] = lk
        team_meta[ts_key] = {
            "level_key": lk,
            "team_name": lr["team_name"],
            "db_conference": lr.get("db_conference"),
        }

    # D1 tier audit
    d1_conf_audit: dict[str, dict[str, int]] = {}  # conf -> {tier: count}
    d1_missing_conf: list[str] = []
    for ts_key, meta in team_meta.items():
        if meta["level_key"].startswith("ncaa_d1_"):
            conf = resolve_d1_conference(meta["team_name"], meta.get("db_conference"))
            tier = meta["level_key"]
            if not conf:
                d1_missing_conf.append(meta["team_name"])
            d1_conf_audit.setdefault(conf or "(no conference)", {}).setdefault(tier, 0)
            d1_conf_audit[conf or "(no conference)"][tier] += 1

    # Hard error: if any team_season still has bare "ncaa_d1"
    bare_d1 = [ts for ts, lk in team_levels.items() if lk == "ncaa_d1"]
    if bare_d1:
        raise RuntimeError(
            f"KLVN HARD ERROR: {len(bare_d1)} team_seasons still have level_key='ncaa_d1'. "
            f"All NCAA D1 must be remapped to ncaa_d1_high_major/mid_major/low_major."
        )

    # Get player height/weight + name
    player_info = {}
    pinfo_rows = conn.execute("""
        SELECT id, full_name, height_inches, weight_lbs, declared_positions
        FROM players
    """).fetchall()
    for pi in pinfo_rows:
        player_info[str(pi["id"])] = pi

    debug_lower = debug_name.lower() if debug_name else None

    inserted = 0
    for r in season_data:
        pts_id = str(r["pts_id"])
        player_id = str(r["player_id"])
        ts_id = str(r["team_season_id"])
        level_key = team_levels.get(ts_id, "naia")
        pinfo = player_info.get(player_id, {})

        # Skip invalid source data
        if invalid_ids and pts_id in invalid_ids:
            continue

        # Skip players with < 3 games or < 5 min/game
        if (r["games_played"] or 0) < 3:
            continue
        if (r["minutes_pg"] or 0) < 5:
            continue

        # Determine position
        positions = pinfo.get("declared_positions") or r.get("declared_positions") or []
        pos_raw = positions[0] if positions else None
        position = map_position(pos_raw)

        # Minutes coverage
        gwm = int(r.get("games_with_minutes") or r.get("games_played") or 0)
        gp_val = int(r["games_played"] or 0)
        min_cov = gwm / gp_val if gp_val > 0 else 0.0

        gs_val = int(r.get("games_started") or 0)
        stats = {
            "pts_pg": _f(r["pts_pg"]),
            "reb_pg": _f(r["reb_pg"]),
            "ast_pg": _f(r["ast_pg"]),
            "stl_pg": _f(r["stl_pg"]),
            "blk_pg": _f(r["blk_pg"]),
            "to_pg": _f(r["to_pg"]),
            "pf_pg": _f(r["pf_pg"]),
            "fg_pct": _f(r["fg_pct"]),
            "three_pct": _f(r["three_pct"]),
            "ft_pct": _f(r["ft_pct"]),
            "fga_pg": _f(r["fga_pg"]),
            "three_pa_pg": _f(r["three_pa_pg"]),
            "fta_pg": _f(r["fta_pg"]),
            "oreb_pg": _f(r["oreb_pg"]),
            "dreb_pg": _f(r["dreb_pg"]),
            "minutes_pg": _f(r["minutes_pg"]),
            "games_played": gp_val,
            "games_started": gs_val,
            "start_rate": gs_val / gp_val if gp_val > 0 else 0.5,
            "minutes_coverage_pct": min_cov,
            "usage_rate": ((_f(r["fga_pg"]) + 0.44 * _f(r["fta_pg"]) + _f(r["to_pg"]))
                           / (_f(r["minutes_pg"]) / 40.0 * 70.0) * 100)
                          if _f(r["minutes_pg"]) > 5 else 0.0,
        }

        # Compute clusters (returns tuple: clusters_cross, clusters_league, traits_list)
        clusters, clusters_league, trait_diagnostics = compute_all_clusters(
            stats=stats,
            level_key=level_key,
            height_inches=pinfo.get("height_inches"),
            weight_lbs=pinfo.get("weight_lbs"),
            position=pos_raw,
        )

        # Determine KR mode: pro or college
        kr_mode = "pro" if level_key in PRO_LEVEL_KEYS else "college"

        # Confidence (needed for KLVN)
        confidence = round(compute_confidence(r["games_played"] or 0, level_key) * 100)
        kr_status = "FINAL" if confidence >= 60 else "PROVISIONAL"

        # ── Pipeline: badges BEFORE KLVN, KLVN is the LAST step ──

        # Step 1: League-internal KR (within-league eval, per-level μ/σ0)
        kr_league = compute_player_kr(clusters_league, position, mode=kr_mode)

        # Step 2: Badges on league-internal clusters
        badge_result = compute_badges(clusters_league, mode=kr_mode)

        # Step 3: League-final with badges (overall-only — badges do NOT touch OKR/DKR)
        league_final_off = kr_league["base_off_kr"]
        league_final_def = kr_league["base_def_kr"]
        league_final_overall = min(100.0, kr_league["overall_kr"] + badge_result["overall_boost"])

        # Step 3.5: Context Engine (gated — disabled by default)
        ctx = apply_context_adjustments(
            league_final_off, league_final_def, league_final_overall,
            stats, clusters, level_key, position,
        )
        league_final_off = ctx["adjusted_off"]
        league_final_def = ctx["adjusted_def"]
        league_final_overall = ctx["adjusted_overall"]

        # Step 4: KLVN — cross-level translation (FINAL STEP, nothing added after)
        final_off_kr = klvn_translate(league_final_off, level_key, confidence_pct=confidence, coverage_pct=min_cov)
        final_def_kr = klvn_translate(league_final_def, level_key, confidence_pct=confidence, coverage_pct=min_cov)
        final_overall_kr = klvn_translate(league_final_overall, level_key, confidence_pct=confidence, coverage_pct=min_cov)

        # base_* columns = KLVN of league base (no badges) — used by team_kr
        base_off_kr = klvn_translate(kr_league["base_off_kr"], level_key, confidence_pct=confidence, coverage_pct=min_cov)
        base_def_kr = klvn_translate(kr_league["base_def_kr"], level_key, confidence_pct=confidence, coverage_pct=min_cov)
        base_overall_kr = klvn_translate(kr_league["overall_kr"], level_key, confidence_pct=confidence, coverage_pct=min_cov)

        # Translation components
        level_offset = round(final_overall_kr - league_final_overall, 2)
        confidence_penalty = 0.0  # placeholder
        schedule_adj = 0.0        # placeholder

        # Step 5: Context Layer — post-KLVN bounded overlay (does NOT modify final_kr)
        ctx_result = compute_context(
            final_kr=final_overall_kr,
            stats=stats,
            clusters=clusters,
            level_key=level_key,
            position=position,
        )

        # Participation %: total minutes / team total minutes
        total_min = r.get("total_minutes", 0) or 0
        participation = 0.0  # computed later at team level

        # ── Debug output ──────────────────────────────────────────────
        player_name = pinfo.get("full_name", "")
        if debug_lower and debug_lower in player_name.lower():
            print(f"\n{'=' * 60}")
            print(f"=== DEBUG: {player_name} ({level_key}, {position}) ===")
            print(f"{'=' * 60}")
            # Group traits by cluster
            by_cluster: dict[str, list[dict]] = {}
            for td in trait_diagnostics:
                c = td.get("cluster", "?")
                by_cluster.setdefault(c, []).append(td)
            for cname in ["shooting", "finishing", "playmaking",
                          "on_ball_defense", "team_defense",
                          "rebounding", "physical"]:
                ctraits = by_cluster.get(cname, [])
                cscore_l = clusters_league.get(cname, 0)
                print(f"  {cname.upper()} (league: {cscore_l})")
                for td in ctraits:
                    tk = td.get("trait_key", "?")
                    z_l = td.get("Z_league", "—")
                    skr_l = td.get("skill_kr_league", "—")
                    print(f"    {tk:<18} p={td['p']:<8} N={td['N']:<5} "
                          f"Z_league={z_l:<7} League={skr_l}")
            print(f"  league_kr_internal:    off={kr_league['base_off_kr']}  def={kr_league['base_def_kr']}  overall={kr_league['overall_kr']}")
            print(f"  badge_bonus_internal:  off={badge_result['off_boost']}  def={badge_result['def_boost']}  overall={badge_result['overall_boost']}")
            print(f"  league_final_internal: off={round(league_final_off, 1)}  def={round(league_final_def, 1)}  overall={round(league_final_overall, 1)}")
            print(f"  kr_pre_translation:    {round(league_final_overall, 1)}")
            print(f"  kr_post_translation:   {round(final_overall_kr, 1)}  (KLVN, \u03bb={get_lambda(level_key)})")
            print(f"  level_offset:          {level_offset}")
            print(f"  ── Context Layer ──")
            print(f"  context_delta:         {ctx_result['context_delta']}")
            print(f"  context_kr:            {ctx_result['context_kr']}")
            print(f"  context_cap_hit:       {ctx_result['context_cap_hit']}")
            for exp in ctx_result["context_explain"]:
                print(f"    → {exp}")
            if not ctx_result["context_flags"]:
                print(f"    (no context rules fired)")
            print(f"  Badges: {len(badge_result['badges'])} (based on league-internal clusters)")
            print(f"  Confidence: {confidence}% \u2192 {kr_status}")
            print(f"{'=' * 60}\n")

        # Insert player_kr
        kr_row = conn.execute("""
            INSERT INTO player_kr (
                player_team_season_id, base_off_kr, base_def_kr, overall_kr,
                off_badge_boost, def_badge_boost, overall_badge_boost,
                final_off_kr, final_def_kr, final_overall_kr,
                kr_version, eval_mode, confidence_pct, kr_status,
                primary_archetype, secondary_archetypes,
                participation_pct, klvn_level, computed_at,
                kr_league_internal, off_kr_league_internal, def_kr_league_internal,
                level_offset, confidence_penalty, schedule_adjustment,
                context_delta, context_kr, context_flags, context_explain, context_cap_hit
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, 'boxscore', %s, %s, %s, %s, %s, %s, now(),
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s
            ) RETURNING id
        """, (
            pts_id, round(base_off_kr, 1), round(base_def_kr, 1), round(base_overall_kr, 1),
            badge_result["off_boost"], badge_result["def_boost"], badge_result["overall_boost"],
            round(final_off_kr, 1), round(final_def_kr, 1), round(final_overall_kr, 1),
            KR_VERSION, confidence, kr_status,
            kr_league["primary_archetype"], kr_league["secondary_archetypes"],
            participation, level_key,
            round(kr_league["overall_kr"], 1),
            round(kr_league["base_off_kr"], 1),
            round(kr_league["base_def_kr"], 1),
            level_offset, confidence_penalty, schedule_adj,
            ctx_result["context_delta"], ctx_result["context_kr"],
            ctx_result["context_flags"], ctx_result["context_explain"],
            ctx_result["context_cap_hit"],
        )).fetchone()

        kr_id = str(kr_row["id"])

        # Insert cluster scores (cross-level + league-internal)
        for cluster_name, score in clusters.items():
            off_w = 1.0 if cluster_name in ("shooting", "finishing", "playmaking") else 0.0
            def_w = 1.0 if cluster_name in ("on_ball_defense", "team_defense", "rebounding", "physical") else 0.0
            league_score = clusters_league.get(cluster_name, score)
            conn.execute("""
                INSERT INTO player_kr_clusters (player_kr_id, cluster, score, weight_in_off_kr, weight_in_def_kr, score_league_internal)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (kr_id, cluster_name, score, off_w, def_w, league_score))

        # Insert per-trait diagnostics
        for td in trait_diagnostics:
            conn.execute("""
                INSERT INTO player_kr_traits (
                    player_kr_id, cluster, trait_key,
                    raw_score, klvn_score, confidence,
                    volume_rate, efficiency, sample_size
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                kr_id, td.get("cluster", ""),
                td.get("trait_key", ""),
                td.get("p"), td.get("skill_kr"),
                td.get("Z"),
                td.get("p_adj"), td.get("mu"),
                td.get("N"),
            ))

        # Insert earned badges
        for badge in badge_result["badges"]:
            conn.execute("""
                INSERT INTO player_badges (player_kr_id, badge_name, cluster, tier, effect)
                VALUES (%s, %s, %s, %s, %s)
            """, (kr_id, badge["name"], badge["cluster"], badge["tier"], badge["effect"]))

        # Compute and store derived defense lenses
        lenses = compute_derived_lenses(
            clusters, trait_diagnostics,
            blk_pg=_f(r["blk_pg"]),
            n_games=gp_val,
            level_key=level_key,
        )
        conn.execute("""
            INSERT INTO player_kr_clusters (player_kr_id, cluster, score, weight_in_off_kr, weight_in_def_kr, score_league_internal)
            VALUES (%s, 'perimeter_defense_lens', %s, 0, 0, %s),
                   (%s, 'interior_defense_lens', %s, 0, 0, %s)
        """, (
            kr_id, lenses["perimeter_defense_lens"], lenses["perimeter_defense_lens"],
            kr_id, lenses["interior_defense_lens"], lenses["interior_defense_lens"],
        ))

        inserted += 1
        if inserted % 500 == 0:
            conn.commit()
            print(f"  ... {inserted} players processed")

    conn.commit()
    print(f"  Inserted {inserted} player KR records")

    # ── D1 Tier Audit ──
    if d1_conf_audit:
        print(f"\n  ── D1 Conference → Tier Audit ──")
        print(f"  {'Conference':<30} {'Tier':<25} {'Teams':>6}")
        print(f"  {'─'*30} {'─'*25} {'─'*6}")
        for conf in sorted(d1_conf_audit.keys()):
            for tier, count in sorted(d1_conf_audit[conf].items()):
                print(f"  {conf:<30} {tier:<25} {count:>6}")
        if d1_missing_conf:
            unique_missing = sorted(set(d1_missing_conf))
            print(f"\n  WARNING: {len(unique_missing)} D1 teams missing conference → defaulted to low_major:")
            for t in unique_missing[:20]:
                print(f"    {t}")
            if len(unique_missing) > 20:
                print(f"    ... and {len(unique_missing) - 20} more")


# ═══════════════════════════════════════════════════════════════════════════
# STEP 5: Team KR Aggregation
# ═══════════════════════════════════════════════════════════════════════════

def compute_all_team_kr(conn):
    """Compute Team KR for every team_season."""
    print("\n[5/8] Computing Team KR...")

    team_seasons = conn.execute("""
        SELECT ts.id AS team_season_id
        FROM team_seasons ts
    """).fetchall()

    updated = 0
    for ts in team_seasons:
        ts_id = str(ts["team_season_id"])

        # Get all player KRs for this team season with minutes
        players = conn.execute("""
            SELECT pk.base_off_kr, pk.base_def_kr, pk.overall_kr,
                   coalesce(sum(pgs.minutes), 0) AS minutes_total
            FROM player_kr pk
            JOIN player_team_seasons pts ON pk.player_team_season_id = pts.id
            LEFT JOIN player_game_stats pgs ON pgs.player_team_season_id = pts.id
            WHERE pts.team_season_id = %s
            GROUP BY pk.id, pk.base_off_kr, pk.base_def_kr, pk.overall_kr
        """, (ts_id,)).fetchall()

        if not players:
            continue

        player_data = [
            {
                "base_off_kr": float(p["base_off_kr"] or 50),
                "base_def_kr": float(p["base_def_kr"] or 50),
                "overall_kr": float(p["overall_kr"] or 50),
                "minutes_total": float(p["minutes_total"] or 0),
            }
            for p in players
        ]

        tkr = compute_team_kr(player_data)

        conn.execute("""
            UPDATE team_seasons
            SET team_off_kr = %s, team_def_kr = %s, team_overall_kr = %s,
                kr_version = %s, last_updated = now()
            WHERE id = %s
        """, (
            tkr["team_off_kr"], tkr["team_def_kr"], tkr["team_overall_kr"],
            KR_VERSION, ts_id,
        ))

        # Update participation % for each player
        total_min = sum(p["minutes_total"] for p in player_data)
        if total_min > 0:
            for p in players:
                mins = float(p["minutes_total"] or 0)
                part_pct = round(mins / total_min * 100, 1)
                conn.execute("""
                    UPDATE player_kr SET participation_pct = %s
                    WHERE player_team_season_id IN (
                        SELECT pts.id FROM player_team_seasons pts
                        WHERE pts.team_season_id = %s
                    ) AND base_off_kr = %s AND base_def_kr = %s
                """, (part_pct, ts_id, p["base_off_kr"], p["base_def_kr"]))

        updated += 1

    conn.commit()
    print(f"  Updated {updated} team seasons with Team KR")


# ═══════════════════════════════════════════════════════════════════════════
# STEP 6: OSIE / DSIE System Inference
# ═══════════════════════════════════════════════════════════════════════════

def compute_all_osie_dsie(conn):
    """Infer offensive and defensive systems for each team."""
    print("\n[6/8] Running OSIE / DSIE...")

    # Clear existing
    conn.execute("DELETE FROM team_system_identity")

    team_seasons = conn.execute("""
        SELECT ts.id AS team_season_id,
               count(tgs.id) AS game_count,
               coalesce(avg(tgs.possessions), 70) AS avg_poss,
               coalesce(avg(tgs.off_ppp), 1.0) AS avg_ppp,
               CASE WHEN sum(tgs.fga) > 0
                    THEN sum(tgs.three_pa)::float / sum(tgs.fga) ELSE 0.33 END AS three_par,
               CASE WHEN sum(tgs.fga) > 0
                    THEN sum(tgs.fta)::float / sum(tgs.fga) ELSE 0.25 END AS ft_rate,
               CASE WHEN sum(tgs.fga) > 0
                    THEN sum(tgs.ast)::float / nullif(sum(tgs.fgm), 0) ELSE 0.50 END AS ast_rate,
               CASE WHEN sum(tgs.reb) > 0
                    THEN sum(tgs.oreb)::float / sum(tgs.reb) ELSE 0.25 END AS oreb_rate,
               CASE WHEN sum(tgs.fga) > 0
                    THEN sum(tgs.stl)::float / nullif(sum(tgs.possessions), 0) ELSE 0.07 END AS stl_rate,
               CASE WHEN sum(tgs.fga) > 0
                    THEN sum(tgs.blk)::float / nullif(sum(tgs.possessions), 0) ELSE 0.04 END AS blk_rate,
               CASE WHEN sum(tgs.possessions) > 0
                    THEN sum(tgs.turnovers)::float / sum(tgs.possessions) ELSE 0.15 END AS tov_forced_rate,
               CASE WHEN sum(tgs.possessions) > 0
                    THEN sum(tgs.pf)::float / sum(tgs.possessions) ELSE 0.20 END AS foul_rate
        FROM team_seasons ts
        JOIN team_game_stats tgs ON tgs.team_season_id = ts.id
        GROUP BY ts.id
        HAVING count(tgs.id) >= 1
    """).fetchall()

    inserted = 0
    for ts in team_seasons:
        ts_id = str(ts["team_season_id"])
        pace100 = float(ts["avg_poss"]) * (40.0 / 40.0)  # already per game

        # OSIE
        osie = infer_offensive_system(
            three_par=float(ts["three_par"]),
            ft_rate=float(ts["ft_rate"]),
            ast_rate=float(ts["ast_rate"]),
            pace100=pace100,
            off_ppp=float(ts["avg_ppp"]),
            oreb_rate=float(ts["oreb_rate"]),
        )

        # DSIE — use opponent stats as proxy
        # For box-score-only, we use the team's own defensive tendencies
        dsie = infer_defensive_system(
            opp_three_par=float(ts["three_par"]),  # proxy: own 3PA allowed
            opp_ft_rate=float(ts["ft_rate"]),
            stl_rate=float(ts["stl_rate"]),
            blk_rate=float(ts["blk_rate"]),
            tov_forced_rate=float(ts["tov_forced_rate"]),
            opp_off_ppp=float(ts["avg_ppp"]),
            foul_rate=float(ts["foul_rate"]),
        )

        # Update team_seasons
        conn.execute("""
            UPDATE team_seasons SET
                osie_system = %s, osie_confidence_pct = %s, osie_status = %s,
                dsie_system = %s, dsie_confidence_pct = %s, dsie_status = %s,
                pace100 = %s, pace_band = %s
            WHERE id = %s
        """, (
            osie["off_primary_system"], osie["off_confidence_pct"], osie["off_status"],
            dsie["def_primary_system"], dsie["def_confidence_pct"], dsie["def_status"],
            osie["pace100"], osie["pace_band"], ts_id,
        ))

        # Insert system identity snapshot
        conn.execute("""
            INSERT INTO team_system_identity (
                team_season_id, snapshot_date, games_sample,
                off_primary_system, off_system_score, off_confidence_pct,
                off_system_mix, off_status,
                def_primary_system, def_system_score, def_confidence_pct,
                def_system_mix, def_status,
                pace100, pace_band
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
        """, (
            ts_id, date.today().isoformat(), ts["game_count"],
            osie["off_primary_system"], osie["off_system_score"], osie["off_confidence_pct"],
            json.dumps(osie["off_system_mix"]) if osie["off_system_mix"] else None,
            osie["off_status"],
            dsie["def_primary_system"], dsie["def_system_score"], dsie["def_confidence_pct"],
            json.dumps(dsie["def_system_mix"]) if dsie["def_system_mix"] else None,
            dsie["def_status"],
            osie["pace100"], osie["pace_band"],
        ))
        inserted += 1

    conn.commit()
    print(f"  Inserted {inserted} team system identity records")


# ═══════════════════════════════════════════════════════════════════════════
# STEP 7: Scholarship & NIL Allocation
# ═══════════════════════════════════════════════════════════════════════════

def compute_all_scholarship_nil(conn):
    """Compute Scholarship & NIL allocations for every team."""
    print("\n[7/8] Computing Scholarship & NIL Allocations...")

    # Clear existing
    conn.execute("DELETE FROM scholarship_nil_allocations")
    conn.execute("DELETE FROM team_allocation_summary")
    conn.commit()

    # Get all team seasons with KR data
    team_seasons = conn.execute("""
        SELECT ts.id AS team_season_id,
               cl.level_key, t.name AS team_name, c.name AS db_conference,
               ts.team_off_kr, ts.team_def_kr, ts.team_overall_kr,
               ts.osie_system, ts.dsie_system
        FROM team_seasons ts
        JOIN teams t ON ts.team_id = t.id
        JOIN competitive_levels cl ON t.competitive_level_id = cl.id
        LEFT JOIN conferences c ON c.id = t.conference_id
        WHERE ts.team_overall_kr IS NOT NULL
    """).fetchall()

    teams_processed = 0
    players_allocated = 0

    for ts in team_seasons:
        ts_id = str(ts["team_season_id"])
        level_key = ts["level_key"]
        # D1 remap for scholarship allocation
        if level_key == "ncaa_d1":
            conf = resolve_d1_conference(ts.get("team_name", ""), ts.get("db_conference"))
            level_key = assign_d1_tier(conf)

        # Get players with KR data for this team
        players_raw = conn.execute("""
            SELECT pk.player_team_season_id,
                   pk.base_off_kr, pk.base_def_kr, pk.overall_kr,
                   pk.confidence_pct, pk.primary_archetype,
                   pk.participation_pct, pk.klvn_level,
                   pts.player_id,
                   p.declared_positions
            FROM player_kr pk
            JOIN player_team_seasons pts ON pk.player_team_season_id = pts.id
            JOIN players p ON pts.player_id = p.id
            WHERE pts.team_season_id = %s
            ORDER BY pk.overall_kr DESC
        """, (ts_id,)).fetchall()

        if not players_raw:
            continue

        # Get cluster scores for each player
        player_data = []
        for pr in players_raw:
            pts_id = str(pr["player_team_season_id"])
            cluster_rows = conn.execute("""
                SELECT pkc.cluster, pkc.score
                FROM player_kr_clusters pkc
                JOIN player_kr pk ON pkc.player_kr_id = pk.id
                WHERE pk.player_team_season_id = %s
            """, (pts_id,)).fetchall()

            clusters = {cr["cluster"]: float(cr["score"] or 50) for cr in cluster_rows}
            positions = pr["declared_positions"] or []
            from player_kr import map_position
            position = map_position(positions[0] if positions else None)

            player_data.append({
                "player_id": str(pr["player_id"]),
                "player_team_season_id": pts_id,
                "overall_kr": float(pr["overall_kr"] or 50),
                "base_off_kr": float(pr["base_off_kr"] or 50),
                "base_def_kr": float(pr["base_def_kr"] or 50),
                "confidence_pct": int(pr["confidence_pct"] or 50),
                "primary_archetype": pr["primary_archetype"],
                "participation_pct": float(pr["participation_pct"] or 0),
                "clusters": clusters,
                "position": position,
            })

        # Team cluster averages (for need scarcity)
        team_clusters_rows = conn.execute("""
            SELECT pkc.cluster, avg(pkc.score) AS avg_score
            FROM player_kr_clusters pkc
            JOIN player_kr pk ON pkc.player_kr_id = pk.id
            JOIN player_team_seasons pts ON pk.player_team_season_id = pts.id
            WHERE pts.team_season_id = %s
            GROUP BY pkc.cluster
        """, (ts_id,)).fetchall()
        team_cluster_avgs = {r["cluster"]: float(r["avg_score"] or 50) for r in team_clusters_rows}

        # NIL pool: use level-based estimate
        # (In production, coach sets this. For now: default by level)
        nil_pool = _estimate_nil_pool(level_key, len(player_data))

        # Run allocation
        result = run_allocation(
            players=player_data,
            level_key=level_key,
            nil_pool=nil_pool,
            team_cluster_averages=team_cluster_avgs,
            off_system=ts["osie_system"],
            def_system=ts["dsie_system"],
        )

        # Insert per-player allocations
        for a in result["allocations"]:
            conn.execute("""
                INSERT INTO scholarship_nil_allocations (
                    player_team_season_id, team_season_id, level_key,
                    tier, recommended_scholarship_pct, scholarship_equivalent,
                    recommended_nil_amount,
                    off_fit_pct, def_fit_pct, overall_fit_pct, need_scarcity,
                    scholarship_justification, nil_justification, warnings,
                    kr_version
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
            """, (
                a["player_team_season_id"], ts_id, level_key,
                a["tier"], a.get("recommended_scholarship_pct", 0),
                a.get("scholarship_equivalent", 0),
                a.get("recommended_nil_amount", 0),
                a.get("off_fit_pct"), a.get("def_fit_pct"), a.get("overall_fit_pct"),
                a.get("need_scarcity"),
                a.get("justification", ""), a.get("nil_justification", ""),
                a.get("warnings", []),
                KR_VERSION,
            ))
            players_allocated += 1

        # Insert team summary
        conn.execute("""
            INSERT INTO team_allocation_summary (
                team_season_id, level_key,
                scholarship_equivalents_used, scholarship_equivalents_cap,
                nil_pool, nil_used, warnings, kr_version
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (team_season_id) DO UPDATE SET
                scholarship_equivalents_used = EXCLUDED.scholarship_equivalents_used,
                scholarship_equivalents_cap = EXCLUDED.scholarship_equivalents_cap,
                nil_pool = EXCLUDED.nil_pool,
                nil_used = EXCLUDED.nil_used,
                warnings = EXCLUDED.warnings,
                kr_version = EXCLUDED.kr_version,
                computed_at = now()
        """, (
            ts_id, level_key,
            result["totals"]["scholarship_equivalents_used"],
            result["totals"]["scholarship_cap"],
            nil_pool, result["totals"]["nil_used"],
            result["warnings"],
            KR_VERSION,
        ))

        teams_processed += 1
        if teams_processed % 50 == 0:
            conn.commit()
            print(f"  ... {teams_processed} teams processed")

    conn.commit()
    print(f"  Processed {teams_processed} teams, {players_allocated} player allocations")


def _estimate_nil_pool(level_key: str, roster_size: int) -> float:
    """Estimate NIL pool by level when coach hasn't set one.
    Realistic estimates for college basketball."""
    base_pools = {
        "ncaa_d1_high_major": 2_000_000,
        "ncaa_d1_mid_major":    750_000,
        "ncaa_d1_low_major":    200_000,
        "ncaa_d2":               50_000,
        "ncaa_d3":               10_000,  # academic merit only, no NIL
        "naia":                  75_000,
        "njcaa_d1":              40_000,
        "njcaa_d2":              15_000,
        "njcaa_d3":               5_000,
        "cccaa":                 10_000,
        "uscaa":                  5_000,
        "nccaa_d1":              20_000,
        "nccaa_d2":               5_000,
    }
    return base_pools.get(level_key, 25_000)


# ═══════════════════════════════════════════════════════════════════════════
# STEP 8: Audit Logging
# ═══════════════════════════════════════════════════════════════════════════

def log_computation(conn, duration_ms: int, player_count: int, team_count: int):
    """Write computation audit log."""
    print("\n[8/8] Logging computation...")
    conn.execute("""
        INSERT INTO computation_log (computation_type, entity_id, version, computed_at, duration_ms)
        VALUES ('full_kr_engine', %s, %s, now(), %s)
    """, (
        f"players={player_count},teams={team_count}",
        KR_VERSION,
        duration_ms,
    ))
    conn.commit()


# ═══════════════════════════════════════════════════════════════════════════
# DEBUG COMPARE — Side-by-side trait diagnostic for two players
# ═══════════════════════════════════════════════════════════════════════════

DATA_SOURCE_MAP = {
    "njcaa_d1": "PrestoSports", "njcaa_d2": "PrestoSports", "njcaa_d3": "PrestoSports",
    "naia": "PrestoSports", "cccaa": "PrestoSports", "uscaa": "PrestoSports",
    "nccaa_d1": "Sidearm Sports", "nccaa_d2": "Sidearm Sports",
    "ncaa_d1_high_major": "ESPN API", "ncaa_d1_mid_major": "ESPN API",
    "ncaa_d1_low_major": "ESPN API",
    "ncaa_d2": "DB Only", "ncaa_d3": "DB Only",
}

N_COMPUTATION_DOCS = [
    ("three_pct",       "int(3PA/g × GP) = total 3PA"),
    ("three_pa_pg",     "GP (games played)"),
    ("two_pt_pct",      "int((FGA/g − 3PA/g) × GP) = total 2PT FGA"),
    ("ft_pct",          "int(FTA/g × GP) = total FTA"),
    ("two_fga_pg",      "GP (games played)"),
    ("foul_draw_rate",  "int(FGA/g × GP) = total FGA"),
    ("ast_pg",          "GP (games played)"),
    ("tov_per_usage",   "GP (usage_events = FGA + 0.44*FTA + TO)"),
    ("ast_to_ratio",    "GP (games played)"),
    ("stl_per_100",     "GP (games played)"),
    ("pf_per_100",      "GP (games played)"),
    ("blk_per_100",     "GP (games played)"),
    ("dreb_pg",         "GP (games played)"),
    ("oreb_pg",         "GP (games played)"),
    ("minutes_pg",      "GP (games played)"),
    ("height",          "1 (anthropometric, Z-score, no shrinkage)"),
    ("weight",          "1 (anthropometric, Z-score, no shrinkage)"),
]


def _lookup_player(conn, name: str) -> dict | None:
    """Look up a player by name substring, return season stats + metadata."""
    rows = conn.execute("""
        SELECT pss.games_played, pss.games_started, pss.minutes_per_game,
               pss.pts_per_game,
               pss.reb_per_game, pss.ast_per_game, pss.stl_per_game,
               pss.blk_per_game, pss.to_per_game, pss.pf_per_game,
               pss.fg_pct, pss.three_pct, pss.ft_pct,
               pss.oreb_per_game, pss.dreb_per_game,
               pss.fga_per_game, pss.three_pa_per_game, pss.fta_per_game,
               pss.games_with_minutes, pss.minutes_coverage_pct,
               pts.id AS pts_id, p.id AS player_id, p.full_name,
               p.height_inches, p.weight_lbs, p.declared_positions,
               cl.level_key, ts.season, t.name AS team_name,
               c.name AS db_conference
        FROM player_season_stats pss
        JOIN player_team_seasons pts ON pss.player_team_season_id = pts.id
        JOIN players p ON pts.player_id = p.id
        JOIN team_seasons ts ON pts.team_season_id = ts.id
        JOIN teams t ON ts.team_id = t.id
        JOIN competitive_levels cl ON t.competitive_level_id = cl.id
        LEFT JOIN conferences c ON c.id = t.conference_id
        WHERE p.full_name ILIKE %s
          AND pss.games_played >= 3 AND pss.minutes_per_game >= 5
        ORDER BY pss.games_played DESC
        LIMIT 1
    """, (f"%{name}%",)).fetchall()
    if not rows:
        return None
    row = dict(rows[0])
    # D1 remap
    if row["level_key"] == "ncaa_d1":
        conf = resolve_d1_conference(row["team_name"], row.get("db_conference"))
        row["level_key"] = assign_d1_tier(conf)
    return row


def _compute_player_debug(row: dict) -> dict:
    """Recompute clusters + KR for one player. Returns all diagnostics."""
    level_key = row["level_key"]
    positions = row.get("declared_positions") or []
    pos_raw = positions[0] if positions else None
    position = map_position(pos_raw)
    kr_mode = "pro" if level_key in PRO_LEVEL_KEYS else "college"

    gp = int(row.get("games_played") or 0)
    gs = int(row.get("games_started") or 0)
    gwm = int(row.get("games_with_minutes") or gp)
    min_cov = float(row.get("minutes_coverage_pct") or (gwm / gp if gp > 0 else 1.0))

    stats = {
        "pts_pg":      _f(row.get("pts_per_game")),
        "reb_pg":      _f(row.get("reb_per_game")),
        "ast_pg":      _f(row.get("ast_per_game")),
        "stl_pg":      _f(row.get("stl_per_game")),
        "blk_pg":      _f(row.get("blk_per_game")),
        "to_pg":       _f(row.get("to_per_game")),
        "pf_pg":       _f(row.get("pf_per_game")),
        "fg_pct":      _f(row.get("fg_pct")),
        "three_pct":   _f(row.get("three_pct")),
        "ft_pct":      _f(row.get("ft_pct")),
        "fga_pg":      _f(row.get("fga_per_game")),
        "three_pa_pg": _f(row.get("three_pa_per_game")),
        "fta_pg":      _f(row.get("fta_per_game")),
        "oreb_pg":     _f(row.get("oreb_per_game")),
        "dreb_pg":     _f(row.get("dreb_per_game")),
        "minutes_pg":  _f(row.get("minutes_per_game")),
        "games_played": gp,
        "games_started": gs,
        "start_rate": gs / gp if gp > 0 else 0.5,
        "minutes_coverage_pct": min_cov,
        "usage_rate": ((_f(row.get("fga_per_game")) + 0.44 * _f(row.get("fta_per_game")) + _f(row.get("to_per_game")))
                       / (_f(row.get("minutes_per_game")) / 40.0 * 70.0) * 100)
                      if _f(row.get("minutes_per_game")) > 5 else 0.0,
    }

    clusters, clusters_league, trait_diagnostics = compute_all_clusters(
        stats=stats,
        level_key=level_key,
        height_inches=row.get("height_inches"),
        weight_lbs=row.get("weight_lbs"),
        position=pos_raw,
    )

    # Pipeline: badges BEFORE KLVN, KLVN is the LAST step
    kr_league = compute_player_kr(clusters_league, position, mode=kr_mode)
    badge_result = compute_badges(clusters_league, mode=kr_mode)
    confidence = round(compute_confidence(stats["games_played"], level_key) * 100)
    kr_status = "FINAL" if confidence >= 60 else "PROVISIONAL"

    # League-final with badges (overall-only — badges do NOT touch OKR/DKR)
    league_final_off = kr_league["base_off_kr"]
    league_final_def = kr_league["base_def_kr"]
    league_final_overall = min(100.0, kr_league["overall_kr"] + badge_result["overall_boost"])

    # Context Engine (gated — disabled by default)
    ctx = apply_context_adjustments(
        league_final_off, league_final_def, league_final_overall,
        stats, clusters, level_key, position,
    )
    league_final_off = ctx["adjusted_off"]
    league_final_def = ctx["adjusted_def"]
    league_final_overall = ctx["adjusted_overall"]

    # KLVN — cross-level translation (FINAL STEP)
    final_off_kr = klvn_translate(league_final_off, level_key, confidence_pct=confidence, coverage_pct=min_cov)
    final_def_kr = klvn_translate(league_final_def, level_key, confidence_pct=confidence, coverage_pct=min_cov)
    final_overall_kr = klvn_translate(league_final_overall, level_key, confidence_pct=confidence, coverage_pct=min_cov)

    # Context Layer — post-KLVN
    ctx_result = compute_context(
        final_kr=final_overall_kr,
        stats=stats,
        clusters=clusters,
        level_key=level_key,
        position=position,
    )

    level_offset = round(final_overall_kr - league_final_overall, 2)

    return {
        "stats": stats,
        "clusters": clusters,
        "clusters_league": clusters_league,
        "traits": trait_diagnostics,
        "kr_league": kr_league,
        "badges": badge_result,
        "context": ctx,
        "context_layer": ctx_result,
        "confidence": confidence,
        "kr_status": kr_status,
        "league_final_off": round(league_final_off, 1),
        "league_final_def": round(league_final_def, 1),
        "league_final_overall": round(league_final_overall, 1),
        "final_off_kr": round(final_off_kr, 1),
        "final_def_kr": round(final_def_kr, 1),
        "final_overall_kr": round(final_overall_kr, 1),
        "level_offset": level_offset,
        "position": position,
        "level_key": level_key,
    }


def run_debug_compare(conn, name1: str, name2: str):
    """Print full trait diagnostic comparison for two players side-by-side."""
    p1_row = _lookup_player(conn, name1)
    p2_row = _lookup_player(conn, name2)

    if not p1_row:
        print(f"ERROR: No player found matching '{name1}' with >= 3 GP and >= 5 MPG")
        return
    if not p2_row:
        print(f"ERROR: No player found matching '{name2}' with >= 3 GP and >= 5 MPG")
        return

    d1 = _compute_player_debug(p1_row)
    d2 = _compute_player_debug(p2_row)

    W = 26  # column width

    def _row(label, v1, v2):
        print(f"  {label:<22} {str(v1):<{W}} {str(v2)}")

    print("=" * 80)
    print("DEBUG COMPARE")
    print("=" * 80)

    # ── Player Info ──
    print(f"\n{'─'*2} PLAYER INFO {'─'*64}")
    _row("", "[P1]", "[P2]")
    _row("player_id", p1_row["player_id"], p2_row["player_id"])
    _row("full_name", p1_row["full_name"], p2_row["full_name"])
    _row("level_key", d1["level_key"], d2["level_key"])
    _row("season_year", p1_row.get("season", "?"), p2_row.get("season", "?"))
    _row("team", p1_row.get("team_name", "?"), p2_row.get("team_name", "?"))
    _row("data_source",
         DATA_SOURCE_MAP.get(d1["level_key"], "Unknown"),
         DATA_SOURCE_MAP.get(d2["level_key"], "Unknown"))
    _row("position", d1["position"], d2["position"])
    _row("games_played", d1["stats"]["games_played"], d2["stats"]["games_played"])
    _row("minutes_pg", d1["stats"]["minutes_pg"], d2["stats"]["minutes_pg"])
    _row("min_coverage_pct",
         f"{d1['stats']['minutes_coverage_pct']:.1%}",
         f"{d2['stats']['minutes_coverage_pct']:.1%}")

    # ── Group traits by cluster ──
    def _group(traits):
        by = {}
        for t in traits:
            by.setdefault(t.get("cluster", "?"), {})[t["trait_key"]] = t
        return by

    tc1 = _group(d1["traits"])
    tc2 = _group(d2["traits"])

    cluster_order = ["shooting", "finishing", "playmaking",
                     "on_ball_defense", "team_defense",
                     "rebounding", "physical"]

    trait_fields = ["p", "v", "N", "mu", "alpha", "E_v", "sigma_v",
                    "p_adj", "delta", "Z", "skill_kr"]

    for cname in cluster_order:
        cs1 = d1["clusters"].get(cname, 0)
        cs2 = d2["clusters"].get(cname, 0)
        ls1 = d1["clusters_league"].get(cname, 0)
        ls2 = d2["clusters_league"].get(cname, 0)
        header = f" {cname.upper()} (cross: {cs1}|{cs2}  league: {ls1}|{ls2}) "
        print(f"\n{'─'*2}{header}{'─'*max(1, 76 - len(header))}")

        # Union of trait keys for this cluster
        t1 = tc1.get(cname, {})
        t2 = tc2.get(cname, {})
        all_keys = list(dict.fromkeys(list(t1.keys()) + list(t2.keys())))

        for tk in all_keys:
            td1 = t1.get(tk, {})
            td2 = t2.get(tk, {})
            print(f"  {tk}:")
            for field in trait_fields:
                v1 = td1.get(field, "\u2014")
                v2 = td2.get(field, "\u2014")
                _row(f"    {field}", v1, v2)
            # N function
            _row("    N_func",
                 td1.get("n_desc", "\u2014"),
                 td2.get("n_desc", "\u2014"))

    # ── Summary ──
    print(f"\n{'─'*2} SUMMARY {'─'*69}")
    _row("", "[P1]", "[P2]")
    _row("league_kr_internal", d1["kr_league"]["overall_kr"], d2["kr_league"]["overall_kr"])
    _row("  league_off_kr", d1["kr_league"]["base_off_kr"], d2["kr_league"]["base_off_kr"])
    _row("  league_def_kr", d1["kr_league"]["base_def_kr"], d2["kr_league"]["base_def_kr"])
    _row("  league_tkr", d1["kr_league"]["base_tkr"], d2["kr_league"]["base_tkr"])
    _row("  position_split", d1["kr_league"]["position_split"], d2["kr_league"]["position_split"])
    _row("badge_bonus_internal", d1["badges"]["overall_boost"], d2["badges"]["overall_boost"])
    _row("  off_badge_boost", d1["badges"]["off_boost"], d2["badges"]["off_boost"])
    _row("  def_badge_boost", d1["badges"]["def_boost"], d2["badges"]["def_boost"])
    _row("league_final_internal", d1["league_final_overall"], d2["league_final_overall"])
    _row("kr_pre_translation", d1["league_final_overall"], d2["league_final_overall"])
    _row("kr_post_translation", d1["final_overall_kr"], d2["final_overall_kr"])
    _row("  final_off_kr", d1["final_off_kr"], d2["final_off_kr"])
    _row("  final_def_kr", d1["final_def_kr"], d2["final_def_kr"])
    _row("level_offset", d1["level_offset"], d2["level_offset"])
    _row("primary_archetype", d1["kr_league"]["primary_archetype"], d2["kr_league"]["primary_archetype"])
    sec1 = ", ".join(d1["kr_league"]["secondary_archetypes"]) or "\u2014"
    sec2 = ", ".join(d2["kr_league"]["secondary_archetypes"]) or "\u2014"
    _row("secondary_arch", sec1, sec2)
    _row("kr_status", d1["kr_status"], d2["kr_status"])
    _row("confidence_pct", d1["confidence"], d2["confidence"])

    # ── Badges ──
    print(f"\n{'─'*2} BADGES {'─'*70}")
    b1 = d1["badges"]["badges"]
    b2 = d2["badges"]["badges"]
    max_b = max(len(b1), len(b2))
    _row("", "[P1]", "[P2]")
    for i in range(max_b):
        b1s = f"{b1[i]['name']} ({b1[i]['tier']}, +{b1[i]['effect']})" if i < len(b1) else "\u2014"
        b2s = f"{b2[i]['name']} ({b2[i]['tier']}, +{b2[i]['effect']})" if i < len(b2) else "\u2014"
        _row(f"  [{i+1}]", b1s, b2s)

    # ── N Computation Reference ──
    print(f"\n{'─'*2} N COMPUTATION REFERENCE {'─'*53}")
    print(f"  {'trait_key':<20} {'N formula'}")
    print(f"  {'─'*20} {'─'*50}")
    for tk, formula in N_COMPUTATION_DOCS:
        print(f"  {tk:<20} {formula}")

    print(f"\n{'=' * 80}")
    print("DONE.")


# ═══════════════════════════════════════════════════════════════════════════
# DEBUG CONTEXT — Print context layer diagnostics for one player
# ═══════════════════════════════════════════════════════════════════════════

def run_debug_context(conn, name: str):
    """Fast-path: look up player, recompute KR, print context layer details."""
    row = _lookup_player(conn, name)
    if not row:
        print(f"ERROR: No player found matching '{name}' with >= 3 GP and >= 5 MPG")
        return

    d = _compute_player_debug(row)
    ctx = d["context_layer"]

    print("=" * 70)
    print("CONTEXT LAYER v1 — POST-KLVN DIAGNOSTICS")
    print("=" * 70)

    print(f"\n  Player:       {row['full_name']}")
    print(f"  Level:        {d['level_key']}")
    print(f"  Position:     {d['position']}")
    print(f"  GP / MPG:     {d['stats']['games_played']} / {d['stats']['minutes_pg']:.1f}")
    print(f"  Min Coverage: {d['stats']['minutes_coverage_pct']:.1%}")
    print(f"  Usage Rate:   {d['stats']['usage_rate']:.1f}%")

    print(f"\n  Final KR (post-KLVN, pre-context): {d['final_overall_kr']}")
    print(f"  OKR: {d['final_off_kr']}  |  DKR: {d['final_def_kr']}")

    print(f"\n{'─'*2} RULES {'─'*61}")
    for rule in ctx["rules"]:
        status = "FIRED" if rule["fired"] else "---"
        print(f"  [{status:>5}]  {rule['rule']:<25}  delta={rule['delta']:+.2f}")
        if rule["fired"]:
            print(f"           {rule['explain']}")

    print(f"\n{'─'*2} TOTALS {'─'*60}")
    print(f"  Unclamped delta:  {ctx['unclamped_delta']:+.2f}")
    print(f"  Clamped delta:    {ctx['context_delta']:+.2f}  (cap ±3.0)")
    print(f"  Cap hit:          {ctx['context_cap_hit']}")

    print(f"\n  Final KR:         {d['final_overall_kr']}")
    print(f"  Context KR:       {ctx['context_kr']}")
    print(f"  Net adjustment:   {ctx['context_delta']:+.2f}")

    print(f"\n{'=' * 70}")
    print("DONE.")


# ═══════════════════════════════════════════════════════════════════════════
# AUDIT PACKET — Full KLVN pipeline transparency for named players
# ═══════════════════════════════════════════════════════════════════════════

CLUSTER_DISPLAY = {
    "shooting": "Shooting",
    "finishing": "Finishing",
    "playmaking": "Playmaking",
    "on_ball_defense": "OnBallDefense",
    "team_defense": "TeamDefense",
    "rebounding": "Rebounding",
    "physical": "Physical",
}

SUBMETRIC_WEIGHTS = {
    "shooting": {"three_pct": 0.42, "three_pa_pg": 0.18, "two_pt_pct": 0.25, "ft_pct": 0.15},
    "finishing": {"two_pt_pct": 0.55, "two_fga_pg": 0.25, "foul_draw_rate": 0.20},
    "playmaking": {"ast_pg": 0.50, "tov_per_usage": 0.20, "ast_to_ratio": 0.30},
    "on_ball_defense": {"stl_per_100": 0.65, "pf_per_100": 0.35},
    "team_defense": {"pf_per_100": 0.35, "stl_per_100": 0.25, "minutes_pg": 0.25, "start_rate": 0.15},
    "rebounding": {"dreb_pg": 0.55, "oreb_pg": 0.45},
    "physical": {"minutes_pg": 1.0},
    "physical_phys": {"height": 0.30, "weight": 0.25, "minutes_pg": 0.35},
}


def _build_player_audit(conn, name: str) -> dict | None:
    """Build full audit packet for one player matching exact JSON schema."""
    row = _lookup_player(conn, name)
    if not row:
        print(f"  WARNING: No player found matching '{name}'")
        return None

    debug = _compute_player_debug(row)
    level_key = debug["level_key"]
    position = debug["position"]
    kr_mode = "pro" if level_key in PRO_LEVEL_KEYS else "college"
    stats = debug["stats"]
    gp = stats["games_played"]
    pts_id = str(row["pts_id"])

    from player_kr import (POSITION_CLUSTER_WEIGHTS, PRO_POSITION_CLUSTER_WEIGHTS,
                           DEFAULT_WEIGHTS, OFF_KEYS, DEF_KEYS, TKR_KEYS,
                           POSITION_COMPONENT_SPLITS, DEFAULT_COMPONENT_SPLIT)

    if kr_mode == "pro":
        weights = PRO_POSITION_CLUSTER_WEIGHTS.get(position, DEFAULT_WEIGHTS)
    else:
        weights = POSITION_CLUSTER_WEIGHTS.get(position, DEFAULT_WEIGHTS)

    # ── raw_inputs: game-level aggregates ──
    pgs_rows = conn.execute("""
        SELECT pgs.minutes, pgs.pts, pgs.fgm, pgs.fga, pgs.three_pm, pgs.three_pa,
               pgs.ftm, pgs.fta, pgs.oreb, pgs.dreb, pgs.reb, pgs.ast, pgs.stl,
               pgs.blk, pgs.turnovers, pgs.pf, pgs.minutes_status,
               tgs.possessions AS team_poss
        FROM player_game_stats pgs
        LEFT JOIN team_game_stats tgs ON tgs.game_id = pgs.game_id
            AND tgs.team_season_id = (
                SELECT team_season_id FROM player_team_seasons WHERE id = %s
            )
        WHERE pgs.player_team_season_id = %s
        ORDER BY pgs.id
    """, (pts_id, pts_id)).fetchall()

    sentinel_games = sum(1 for r in pgs_rows
                         if r.get("minutes_status") == "MISSING_BOX_MINUTES")
    total_min = round(sum(_f(r["minutes"]) for r in pgs_rows
                          if r["minutes"] is not None), 1)
    poss_vals = [_f(r["team_poss"]) for r in pgs_rows if r.get("team_poss")]
    avg_poss = round(sum(poss_vals) / len(poss_vals), 1) if poss_vals else None

    raw_inputs = {
        "box_stats": {
            "points": sum(int(r["pts"] or 0) for r in pgs_rows),
            "fga": sum(int(r["fga"] or 0) for r in pgs_rows),
            "fta": sum(int(r["fta"] or 0) for r in pgs_rows),
            "three_pa": sum(int(r["three_pa"] or 0) for r in pgs_rows),
            "oreb": sum(int(r["oreb"] or 0) for r in pgs_rows),
            "dreb": sum(int(r["dreb"] or 0) for r in pgs_rows),
            "ast": sum(int(r["ast"] or 0) for r in pgs_rows),
            "tov": sum(int(r["turnovers"] or 0) for r in pgs_rows),
            "stl": sum(int(r["stl"] or 0) for r in pgs_rows),
            "blk": sum(int(r["blk"] or 0) for r in pgs_rows),
            "pf": sum(int(r["pf"] or 0) for r in pgs_rows),
        },
        "possession_proxies": {
            "avg_team_poss_per_game": avg_poss,
            "per_100_scalar": round(100 / 70, 4),
        },
    }

    # ── step_1: season aggregation ──
    min_cov = stats["minutes_coverage_pct"]
    validation_flags = []
    if gp < 3:
        validation_flags.append("BELOW_MIN_GAMES")
    if stats["minutes_pg"] < 5:
        validation_flags.append("BELOW_MIN_MPG")

    step_1 = {
        "player_season_stats": {k: v for k, v in stats.items()
                                 if k != "minutes_coverage_pct"},
        "minutes_sentinel_fix_applied": sentinel_games > 0,
        "any_validation_flags": validation_flags,
    }

    # ── Level population N from calibration params ──
    from klvn import _load_params
    cal_params = _load_params()
    level_pop_n = cal_params.get("sample_counts", {}).get(level_key, 0)

    # ── z_p99 for this level from DB ──
    p99_row = conn.execute("""
        SELECT percentile_cont(0.99) WITHIN GROUP (ORDER BY abs(pkt.confidence)) AS p99
        FROM player_kr_traits pkt
        JOIN player_kr pk ON pkt.player_kr_id = pk.id
        WHERE pk.klvn_level = %s AND pkt.confidence IS NOT NULL
    """, (level_key,)).fetchone()
    z_p99_level = round(float(p99_row["p99"]), 3) if p99_row and p99_row.get("p99") else None

    # ── Group trait diagnostics by cluster ──
    traits_by_cluster: dict[str, list[dict]] = {}
    for td in debug["traits"]:
        c = td.get("cluster", "?")
        traits_by_cluster.setdefault(c, []).append(td)

    cluster_order = ["shooting", "finishing", "playmaking",
                     "on_ball_defense", "team_defense",
                     "rebounding", "physical"]

    step_2_metrics: dict = {}
    step_3_metrics: dict = {}
    step_4_clusters: dict = {}
    z_all: list[float] = []

    for cname in cluster_order:
        display = CLUSTER_DISPLAY[cname]
        ctraits = traits_by_cluster.get(cname, [])
        cscore = debug["clusters"].get(cname, 0)

        has_phys = any(t["trait_key"] in ("height", "weight") for t in ctraits)
        if cname == "physical" and has_phys:
            smw = SUBMETRIC_WEIGHTS["physical_phys"]
        else:
            smw = SUBMETRIC_WEIGHTS.get(cname, {})

        submetrics_used = []
        metric_weights = {}

        for td in ctraits:
            tk = td["trait_key"]
            n_val = td.get("N", 0) or 0
            sqrt_n = n_val ** 0.5 if n_val > 0 else 0
            vol_corr = (1 + 0.25 * n_val) ** 0.5 if n_val > 0 else 1.0

            # step_2: distribution context per metric
            step_2_metrics[tk] = {
                "mu_level": td.get("mu"),
                "sigma0_level": td.get("sigma0"),
                "sigma_v_final": td.get("sigma_v"),
                "sigma_floor": td.get("sigma_floor"),
                "sigma_formula_components": {
                    "N": n_val,
                    "sqrtN": round(sqrt_n, 4),
                    "volume_correction_term": round(vol_corr, 4),
                    "pre_floor_sigma": td.get("pre_floor_sigma"),
                },
            }

            # step_3: z-scores per metric
            z_raw = td.get("z_raw", td.get("Z", 0))
            z_capped = td.get("Z", 0)
            step_3_metrics[tk] = {
                "value": td.get("p"),
                "z": z_raw,
                "z_capped": z_capped,
                "cap": "5*tanh(z/5)",
            }
            if isinstance(z_capped, (int, float)):
                z_all.append(z_capped)

            submetrics_used.append(tk)
            metric_weights[tk] = smw.get(tk, 0)

        step_4_clusters[display] = {
            "submetrics_used": submetrics_used,
            "metric_weights": metric_weights,
            "pre_badge_cluster_kr": cscore,
        }

    # step_2 final
    step_2 = {
        "level_population_n": level_pop_n,
        "for_each_metric": step_2_metrics,
    }

    # step_3 final with z_summary
    z_summary = {}
    if z_all:
        z_summary = {
            "z_min": round(min(z_all), 3),
            "z_max": round(max(z_all), 3),
            "z_p99_level": z_p99_level,
        }

    step_3 = {
        "for_each_metric": step_3_metrics,
        "z_summary": z_summary,
    }

    # step_4 final with overall pre-badge KR (league-internal)
    kr_league = debug["kr_league"]
    step_4 = {
        "clusters": step_4_clusters,
        "skillkr_overall_pre_badges": kr_league["overall_kr"],
    }

    # ── step_5: off/def/tkr rollup (league-internal, 3-way position split) ──
    off_c = {k: weights[k] for k in OFF_KEYS if k in weights}
    def_c = {k: weights[k] for k in DEF_KEYS if k in weights}
    off_sum = sum(off_c.values())
    def_sum = sum(def_c.values())

    off_w_norm = {CLUSTER_DISPLAY[k]: round(v / off_sum, 4)
                  for k, v in off_c.items()} if off_sum > 0 else {}
    def_w_norm = {CLUSTER_DISPLAY[k]: round(v / def_sum, 4)
                  for k, v in def_c.items()} if def_sum > 0 else {}

    w_ok, w_dk, w_tk = POSITION_COMPONENT_SPLITS.get(position, DEFAULT_COMPONENT_SPLIT)

    step_5 = {
        "off_clusters": ["Shooting", "Finishing", "Playmaking"],
        "def_clusters": ["OnBallDefense", "TeamDefense", "Rebounding"],
        "tkr_clusters": ["Physical"],
        "off_cluster_weights_alpha": off_w_norm,
        "def_cluster_weights_beta": def_w_norm,
        "position_split": {"OKR": w_ok, "DKR": w_dk, "TKR": w_tk},
        "off_kr_100": kr_league["base_off_kr"],
        "def_kr_100": kr_league["base_def_kr"],
        "tkr_100": kr_league["base_tkr"],
        "off_kr_scaled": round(w_ok * kr_league["base_off_kr"], 2),
        "def_kr_scaled": round(w_dk * kr_league["base_def_kr"], 2),
        "tkr_scaled": round(w_tk * kr_league["base_tkr"], 2),
        "league_kr_internal": kr_league["overall_kr"],
        "league_final_internal": debug["league_final_overall"],
        "kr_post_translation": debug["final_overall_kr"],
        "level_offset": debug["level_offset"],
    }

    # ── step_6: badges ──
    badge_result = debug["badges"]
    all_badges = []
    for b in badge_result["badges"]:
        cluster_key = b["cluster"]
        all_badges.append({
            "badge_id": b["name"],
            "badge_tier": b["tier"].title(),
            "cluster": CLUSTER_DISPLAY.get(cluster_key, cluster_key),
            "trigger_metric": CLUSTER_DISPLAY.get(cluster_key, cluster_key),
            "trigger_value": debug["clusters_league"].get(cluster_key, 0),
            "trigger_z": None,
        })

    badge_bonus_total = badge_result["overall_boost"]
    step_6 = {
        "all_badges_awarded": all_badges,
        "badge_bonus_total": badge_bonus_total,
        "final_overall_kr": debug["final_overall_kr"],
    }

    # ── sanity_checks ──
    out_of_range = [
        td["trait_key"] for td in debug["traits"]
        if td.get("skill_kr") is not None
        and isinstance(td["skill_kr"], (int, float))
        and (td["skill_kr"] < 0 or td["skill_kr"] > 100)
    ]
    has_nan = any(td.get("skill_kr") is None for td in debug["traits"])

    notes = []
    if min_cov < 0.70:
        notes.append(f"Minutes coverage {min_cov:.0%} < 70%: physical endurance disabled")
    if sentinel_games > 0:
        notes.append(f"{sentinel_games} games had sentinel minutes (fixed)")

    sanity = {
        "alpha_sum": round(sum(off_w_norm.values()), 4),
        "beta_sum": round(sum(def_w_norm.values()), 4),
        "any_nan": has_nan,
        "any_out_of_range": out_of_range,
        "notes": notes,
    }

    return {
        "player_id": str(row["player_id"]),
        "player_name": row["full_name"],
        "level_id": level_key,
        "season_id": str(row.get("season", "")),
        "gp": gp,
        "minutes_total": total_min,
        "mpg": stats["minutes_pg"],
        "raw_inputs": raw_inputs,
        "step_1_season_aggregation": step_1,
        "step_2_distribution_context": step_2,
        "step_3_zscores": step_3,
        "step_4_skillkr_by_cluster": step_4,
        "step_5_off_def_rollup": step_5,
        "step_6_badges": step_6,
        "sanity_checks": sanity,
    }


def run_audit_packet(conn):
    """Generate kr_audit_packet.json for Shannon and Dybantsa + random samples."""
    from datetime import datetime

    print("\n" + "=" * 60)
    print("AUDIT PACKET \u2014 kr_audit_packet.json")
    print("=" * 60)

    packet = {
        "engine_version": KR_VERSION,
        "run_timestamp": datetime.now().isoformat(),
        "players": [],
    }

    # Build audit for Terrence Shannon (NJCAA D2) and AJ Dybantsa (NCAA D1)
    levels_seen = set()
    for name in ["Terrence Shannon", "AJ Dybantsa"]:
        print(f"  Building audit for '{name}'...")
        audit = _build_player_audit(conn, name)
        if audit:
            packet["players"].append(audit)
            levels_seen.add(audit["level_id"])
            print(f"    \u2192 {audit['player_name']} ({audit['level_id']}, gp={audit['gp']}) "
                  f"final_kr={audit['step_6_badges']['final_overall_kr']}")
        else:
            print(f"    \u2192 NOT FOUND")

    # Random samples: 25 per level_id — lightweight fields only
    for level in sorted(levels_seen):
        rows = conn.execute("""
            SELECT p.id AS player_id, pk.klvn_level,
                   pss.games_played, pss.minutes_per_game,
                   pk.overall_kr, pk.final_overall_kr, pk.overall_badge_boost,
                   (SELECT min(pkt.confidence) FROM player_kr_traits pkt
                    WHERE pkt.player_kr_id = pk.id AND pkt.confidence IS NOT NULL) AS z_min,
                   (SELECT max(pkt.confidence) FROM player_kr_traits pkt
                    WHERE pkt.player_kr_id = pk.id AND pkt.confidence IS NOT NULL) AS z_max
            FROM player_kr pk
            JOIN player_team_seasons pts ON pk.player_team_season_id = pts.id
            JOIN players p ON pts.player_id = p.id
            JOIN player_season_stats pss ON pss.player_team_season_id = pts.id
            WHERE pk.klvn_level = %s
            ORDER BY random()
            LIMIT 25
        """, (level,)).fetchall()

        samples = []
        for r in rows:
            samples.append({
                "player_id": str(r["player_id"]),
                "level_id": r["klvn_level"],
                "gp": int(r["games_played"] or 0),
                "mpg": round(float(r["minutes_per_game"] or 0), 1),
                "base_overall_kr": round(float(r["overall_kr"] or 0), 1),
                "final_overall_kr": round(float(r["final_overall_kr"] or 0), 1),
                "skillkr_overall_pre_badges": round(float(r["overall_kr"] or 0), 1),
                "z_summary": {
                    "z_min": round(float(r["z_min"] or 0), 3),
                    "z_max": round(float(r["z_max"] or 0), 3),
                },
                "badge_bonus_total": round(float(r["overall_badge_boost"] or 0), 1),
            })

        packet.setdefault("samples", {})[level] = samples
        print(f"  {level}: {len(samples)} random samples")

    # Write output
    out_path = os.path.join(os.path.dirname(__file__), "kr_audit_packet.json")
    with open(out_path, "w") as f:
        json.dump(packet, f, indent=2, default=str)
    print(f"\n  Written to: {out_path}")
    print("=" * 60)

    return out_path



# ═══════════════════════════════════════════════════════════════════════════
# KLVN DIAGNOSTICS — Required every run
# ═══════════════════════════════════════════════════════════════════════════

def print_klvn_diagnostics(conn):
    """Print required KLVN diagnostics: level coverage, distributions, top 50, sanity checks."""
    from klvn import LEVEL_LAMBDA
    import statistics

    print(f"\n{'=' * 70}")
    print("KLVN DIAGNOSTICS")
    print(f"{'=' * 70}")

    # A) Level coverage audit
    print(f"\n── A) Level Coverage Audit ──")
    print(f"  {'level_key':<25} {'count':>6}  {'λ':>6}")
    print(f"  {'─'*25} {'─'*6}  {'─'*6}")
    level_counts = conn.execute("""
        SELECT pk.klvn_level, count(*) AS n
        FROM player_kr pk
        GROUP BY pk.klvn_level
        ORDER BY count(*) DESC
    """).fetchall()
    for r in level_counts:
        lk = r["klvn_level"]
        lam = LEVEL_LAMBDA.get(lk, None)
        lam_str = f"{lam:.3f}" if lam is not None else "MISSING!"
        print(f"  {lk:<25} {r['n']:>6}  {lam_str:>6}")

    # B) Per-level distribution summary
    print(f"\n── B) Per-Level Distribution ──")
    print(f"  {'level_key':<25} {'n':>5} {'max':>6} {'p99':>6} {'p95':>6} {'median':>6}")
    print(f"  {'─'*25} {'─'*5} {'─'*6} {'─'*6} {'─'*6} {'─'*6}")
    for r in level_counts:
        lk = r["klvn_level"]
        stats_rows = conn.execute("""
            SELECT final_overall_kr FROM player_kr WHERE klvn_level = %s
            ORDER BY final_overall_kr
        """, (lk,)).fetchall()
        vals = sorted([float(sr["final_overall_kr"]) for sr in stats_rows])
        if vals:
            n = len(vals)
            mx = vals[-1]
            p99 = vals[int(n * 0.99)] if n > 1 else mx
            p95 = vals[int(n * 0.95)] if n > 1 else mx
            med = statistics.median(vals)
            print(f"  {lk:<25} {n:>5} {mx:>6.1f} {p99:>6.1f} {p95:>6.1f} {med:>6.1f}")

    # C) Global leaderboard — Top 50
    print(f"\n── C) Global Top 50 ──")
    print(f"  {'#':>3} {'Player':<25} {'Team':<25} {'level_key':<22} {'league':>6} {'λ':>5} {'final':>6}")
    print(f"  {'─'*3} {'─'*25} {'─'*25} {'─'*22} {'─'*6} {'─'*5} {'─'*6}")
    top50 = conn.execute("""
        SELECT p.full_name, t.name AS team_name, pk.klvn_level,
               pk.kr_league_internal, pk.final_overall_kr
        FROM player_kr pk
        JOIN player_team_seasons pts ON pk.player_team_season_id = pts.id
        JOIN players p ON pts.player_id = p.id
        JOIN team_seasons ts ON pts.team_season_id = ts.id
        JOIN teams t ON ts.team_id = t.id
        ORDER BY pk.final_overall_kr DESC
        LIMIT 50
    """).fetchall()
    for i, r in enumerate(top50, 1):
        lk = r["klvn_level"]
        lam = LEVEL_LAMBDA.get(lk, 0)
        print(f"  {i:>3} {r['full_name']:<25} {r['team_name']:<25} {lk:<22} "
              f"{float(r['kr_league_internal']):>6.1f} {lam:>5.3f} {float(r['final_overall_kr']):>6.1f}")

    # D) Sanity checks
    print(f"\n── D) Sanity Checks ──")

    # Max KR per tier (should be HM >= MM >= LM >= D2 >= ...)
    tier_order = [
        "ncaa_d1_high_major", "ncaa_d1_mid_major", "ncaa_d1_low_major",
        "ncaa_d2", "njcaa_d1", "naia", "njcaa_d2", "cccaa", "ncaa_d3",
        "njcaa_d3", "uscaa", "nccaa_d1", "nccaa_d2",
    ]
    tier_maxes = {}
    for lk in tier_order:
        row = conn.execute("""
            SELECT max(final_overall_kr) AS mx FROM player_kr WHERE klvn_level = %s
        """, (lk,)).fetchone()
        tier_maxes[lk] = float(row["mx"]) if row and row["mx"] else 0.0

    monotonic = True
    prev_max = 999.0
    for lk in tier_order:
        mx = tier_maxes.get(lk, 0)
        ok = mx <= prev_max or mx == 0
        marker = "OK" if ok else "WARN"
        if not ok:
            monotonic = False
        if mx > 0:
            print(f"  {lk:<25} max={mx:>6.1f}  [{marker}]")
            prev_max = mx

    if monotonic:
        print(f"  Max KR monotonicity: PASS")
    else:
        print(f"  Max KR monotonicity: FAIL — higher tiers should dominate")

    # Top 25 composition
    top25_levels = conn.execute("""
        SELECT klvn_level, count(*) AS n FROM (
            SELECT klvn_level FROM player_kr ORDER BY final_overall_kr DESC LIMIT 25
        ) sub GROUP BY klvn_level ORDER BY n DESC
    """).fetchall()
    print(f"\n  Top 25 composition:")
    hm_mm_count = 0
    for r in top25_levels:
        lk = r["klvn_level"]
        if lk in ("ncaa_d1_high_major", "ncaa_d1_mid_major"):
            hm_mm_count += int(r["n"])
        print(f"    {lk}: {r['n']}")
    if hm_mm_count < 15:
        print(f"  WARNING: Only {hm_mm_count}/25 top players are D1 HM/MM (expected >= 15)")
    else:
        print(f"  Top 25 D1 HM/MM dominance: PASS ({hm_mm_count}/25)")

    print(f"{'=' * 70}")


# ═══════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="KaNeXT KR Computation Engine")
    parser.add_argument("--level", help="Process only this competitive level (e.g. 'naia')")
    parser.add_argument("--team-only", action="store_true", help="Skip player KR, recompute team KR only")
    parser.add_argument("--debug", metavar="NAME", help="Print per-trait diagnostics for matching player name (case-insensitive substring)")
    parser.add_argument("--debug_compare", nargs=2, metavar=("NAME1", "NAME2"),
                        help="Side-by-side trait diagnostic for two players (fast-path, no full engine run)")
    parser.add_argument("--audit_packet", action="store_true",
                        help="Generate kr_audit_packet.json for Shannon + Dybantsa (fast-path)")
    parser.add_argument("--debug-context", metavar="NAME",
                        help="Print context layer diagnostics for a player (fast-path, no full engine run)")
    args = parser.parse_args()

    conn = get_conn()

    # Fast-path: debug compare exits immediately
    if args.debug_compare:
        run_debug_compare(conn, args.debug_compare[0], args.debug_compare[1])
        conn.close()
        return

    # Fast-path: audit packet exits immediately
    if args.audit_packet:
        run_audit_packet(conn)
        conn.close()
        return

    # Fast-path: debug context layer for one player
    if args.debug_context:
        run_debug_context(conn, args.debug_context)
        conn.close()
        return

    start = time.time()
    print("=" * 70)
    print("KaNeXT KR Computation Engine — V1 (Box-Score)")
    print(f"Version: {KR_VERSION}")
    print("=" * 70)

    # Count data
    player_count = conn.execute("SELECT count(*) AS c FROM player_team_seasons").fetchone()["c"]
    team_count = conn.execute("SELECT count(*) AS c FROM team_seasons").fetchone()["c"]
    game_count = conn.execute("SELECT count(*) AS c FROM player_game_stats WHERE minutes > 0").fetchone()["c"]
    print(f"\nData: {player_count} player-seasons, {team_count} teams, {game_count} game stats")

    if not args.team_only:
        # Step 1: Season stats
        season_data = compute_season_stats(conn)

        # Step 1.5: Validate
        invalid_ids = validate_season_stats(conn)

        # Step 2: BPR + PGIS
        compute_all_bpr_pgis(conn)

        # Step 3: TPQ
        compute_all_tpq(conn)

        # Step 4: Player KR
        compute_all_player_kr(conn, season_data, debug_name=args.debug,
                              invalid_ids=invalid_ids)

    # Step 5: Team KR
    compute_all_team_kr(conn)

    # Step 6: OSIE / DSIE
    compute_all_osie_dsie(conn)

    # Step 7: Scholarship & NIL
    compute_all_scholarship_nil(conn)

    # Step 8: Audit
    elapsed_ms = int((time.time() - start) * 1000)
    log_computation(conn, elapsed_ms, player_count, team_count)

    # KLVN Diagnostics (required every run)
    print_klvn_diagnostics(conn)

    elapsed = time.time() - start
    print(f"\n{'=' * 70}")
    print(f"DONE in {elapsed:.1f}s")

    # Summary
    kr_count = conn.execute("SELECT count(*) AS c FROM player_kr").fetchone()["c"]
    team_kr_count = conn.execute("SELECT count(*) AS c FROM team_seasons WHERE team_overall_kr IS NOT NULL").fetchone()["c"]
    osie_count = conn.execute("SELECT count(*) AS c FROM team_system_identity").fetchone()["c"]
    bpr_count = conn.execute("SELECT count(*) AS c FROM player_game_stats WHERE bpr_value IS NOT NULL").fetchone()["c"]
    game_bpr_count = conn.execute("SELECT count(*) AS c FROM player_game_stats WHERE pgis_value IS NOT NULL").fetchone()["c"]
    tpq_count = conn.execute("SELECT count(*) AS c FROM games WHERE tgis_home IS NOT NULL").fetchone()["c"]

    sna_count = conn.execute("SELECT count(*) AS c FROM scholarship_nil_allocations").fetchone()["c"]
    tas_count = conn.execute("SELECT count(*) AS c FROM team_allocation_summary").fetchone()["c"]
    badge_count = conn.execute("SELECT count(*) AS c FROM player_badges").fetchone()["c"]
    gold_count = conn.execute("SELECT count(*) AS c FROM player_badges WHERE tier = 'gold'").fetchone()["c"]
    silver_count = conn.execute("SELECT count(*) AS c FROM player_badges WHERE tier = 'silver'").fetchone()["c"]
    bronze_count = conn.execute("SELECT count(*) AS c FROM player_badges WHERE tier = 'bronze'").fetchone()["c"]

    print(f"  Player KRs computed:    {kr_count}")
    print(f"  BPR values computed:    {bpr_count}")
    print(f"  Game BPR computed:      {game_bpr_count}")
    print(f"  TPQ values computed:    {tpq_count}")
    print(f"  Team KRs computed:      {team_kr_count}")
    print(f"  System identities:      {osie_count}")
    print(f"  Badges awarded:         {badge_count} (Gold: {gold_count}, Silver: {silver_count}, Bronze: {bronze_count})")
    print(f"  Scholarship/NIL allocs: {sna_count}")
    print(f"  Team alloc summaries:   {tas_count}")
    print(f"{'=' * 70}")

    conn.close()


if __name__ == "__main__":
    main()
