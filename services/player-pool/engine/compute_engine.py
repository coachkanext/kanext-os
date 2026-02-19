#!/usr/bin/env python3
"""
KaNeXT KR Computation Engine — V1 (Box-Score)
Processes all scraped players through:
  1. Season stats aggregation
  2. BPR + PGIS computation
  3. TGIS computation
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

from bpr import compute_bpr, season_bpr
from clusters import compute_all_clusters
from player_kr import compute_player_kr, map_position
from team_kr import compute_team_kr
from osie_dsie import infer_offensive_system, infer_defensive_system
from klvn import compute_confidence, get_lambda
from impact_scores import compute_pgis, compute_tgis, compute_season_pgis
from scholarship_nil import run_allocation, SCHOLARSHIP_CAPS

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

    # Get all player_team_seasons with game data
    rows = conn.execute("""
        SELECT
            pts.id AS pts_id,
            pts.player_id,
            pts.team_season_id,
            p.declared_positions,
            count(pgs.id) AS games_played,
            count(CASE WHEN pgs.started THEN 1 END) AS games_started,
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

        conn.execute("""
            INSERT INTO player_season_stats (
                player_team_season_id, games_played, games_started,
                minutes_per_game, pts_per_game, reb_per_game, ast_per_game,
                stl_per_game, blk_per_game, to_per_game,
                fg_pct, three_pct, ft_pct,
                oreb_per_game, dreb_per_game,
                fga_per_game, three_pa_per_game, fta_per_game,
                pf_per_game, usage_rate
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
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
        ))
        inserted += 1

    conn.commit()
    print(f"  Inserted {inserted} season stat rows")
    return rows


# ═══════════════════════════════════════════════════════════════════════════
# STEP 2: BPR + PGIS Computation (per-game)
# ═══════════════════════════════════════════════════════════════════════════

def compute_all_bpr_pgis(conn):
    """Compute BPR and PGIS for every player game stat row."""
    print("\n[2/8] Computing BPR + PGIS for all games...")

    # Get all game stats with team possessions
    rows = conn.execute("""
        SELECT pgs.id, pgs.minutes, pgs.pts, pgs.fgm, pgs.fga,
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
        bpr_val = compute_bpr(
            minutes=_f(r["minutes"]), pts=int(r["pts"] or 0),
            fgm=int(r["fgm"] or 0), fga=int(r["fga"] or 0),
            ftm=int(r["ftm"] or 0), fta=int(r["fta"] or 0),
            three_pm=int(r["three_pm"] or 0), three_pa=int(r["three_pa"] or 0),
            oreb=int(r["oreb"] or 0), dreb=int(r["dreb"] or 0),
            ast=int(r["ast"] or 0), stl=int(r["stl"] or 0), blk=int(r["blk"] or 0),
            turnovers=int(r["turnovers"] or 0), pf=int(r["pf"] or 0),
            team_poss=_f(r["team_poss"]) if r["team_poss"] else None,
        )

        pgis_val = compute_pgis(
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
        """, (bpr_val, KR_VERSION, pgis_val, r["id"]))
        updated += 1

    conn.commit()
    print(f"  Updated {updated} game stats with BPR + PGIS")

    # Update season BPR averages
    conn.execute("""
        UPDATE player_season_stats pss
        SET bpr_season_avg = sub.avg_bpr,
            bpr_trend = sub.avg_bpr - sub.first5_bpr
        FROM (
            SELECT pgs.player_team_season_id,
                   avg(pgs.bpr_value) AS avg_bpr,
                   coalesce((
                       SELECT avg(x.bpr_value) FROM (
                           SELECT pgs2.bpr_value
                           FROM player_game_stats pgs2
                           JOIN games g2 ON pgs2.game_id = g2.id
                           WHERE pgs2.player_team_season_id = pgs.player_team_season_id
                             AND pgs2.bpr_value IS NOT NULL
                           ORDER BY g2.game_date ASC
                           LIMIT 5
                       ) x
                   ), avg(pgs.bpr_value)) AS first5_bpr
            FROM player_game_stats pgs
            WHERE pgs.bpr_value IS NOT NULL
            GROUP BY pgs.player_team_season_id
        ) sub
        WHERE pss.player_team_season_id = sub.player_team_season_id
    """)
    conn.commit()
    print("  Updated season BPR averages")


# ═══════════════════════════════════════════════════════════════════════════
# STEP 3: TGIS Computation (per-game)
# ═══════════════════════════════════════════════════════════════════════════

def compute_all_tgis(conn):
    """Compute TGIS for every game."""
    print("\n[3/8] Computing TGIS for all games...")

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
        # Home TGIS
        if g["h_fga"] and g["h_poss"] and float(g["h_poss"]) > 0:
            home_tgis = compute_tgis(
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

        # Away TGIS
        if g["a_fga"] and g["a_poss"] and float(g["a_poss"]) > 0:
            away_tgis = compute_tgis(
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
    print(f"  Updated {updated} games with TGIS")


# ═══════════════════════════════════════════════════════════════════════════
# STEP 4: Player KR + Clusters
# ═══════════════════════════════════════════════════════════════════════════

def compute_all_player_kr(conn, season_data: list[dict]):
    """Compute clusters and KR for every player."""
    print("\n[4/8] Computing Player KR (clusters + archetype)...")

    # Clear existing KR data
    conn.execute("DELETE FROM player_kr_traits")
    conn.execute("DELETE FROM player_kr_clusters")
    conn.execute("DELETE FROM player_kr")
    conn.commit()

    # Get level info for each team
    team_levels = {}
    level_rows = conn.execute("""
        SELECT ts.id AS team_season_id, cl.level_key
        FROM team_seasons ts
        JOIN teams t ON ts.team_id = t.id
        JOIN competitive_levels cl ON t.competitive_level_id = cl.id
    """).fetchall()
    for lr in level_rows:
        team_levels[str(lr["team_season_id"])] = lr["level_key"]

    # Get player height/weight
    player_info = {}
    pinfo_rows = conn.execute("""
        SELECT id, height_inches, weight_lbs, declared_positions
        FROM players
    """).fetchall()
    for pi in pinfo_rows:
        player_info[str(pi["id"])] = pi

    inserted = 0
    for r in season_data:
        pts_id = str(r["pts_id"])
        player_id = str(r["player_id"])
        ts_id = str(r["team_season_id"])
        level_key = team_levels.get(ts_id, "naia")
        pinfo = player_info.get(player_id, {})

        # Skip players with < 3 games or < 5 min/game
        if (r["games_played"] or 0) < 3:
            continue
        if (r["minutes_pg"] or 0) < 5:
            continue

        # Determine position
        positions = pinfo.get("declared_positions") or r.get("declared_positions") or []
        pos_raw = positions[0] if positions else None
        position = map_position(pos_raw)

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
            "games_played": int(r["games_played"] or 0),
        }

        # Compute clusters
        clusters = compute_all_clusters(
            stats=stats,
            level_key=level_key,
            height_inches=pinfo.get("height_inches"),
            weight_lbs=pinfo.get("weight_lbs"),
            position=pos_raw,
        )

        # Compute KR
        kr = compute_player_kr(clusters, position)

        # Confidence
        confidence = round(compute_confidence(r["games_played"] or 0, level_key) * 100)

        # Participation %: total minutes / team total minutes
        total_min = r.get("total_minutes", 0) or 0
        participation = 0.0  # computed later at team level

        # Insert player_kr
        kr_row = conn.execute("""
            INSERT INTO player_kr (
                player_team_season_id, base_off_kr, base_def_kr, overall_kr,
                kr_version, eval_mode, confidence_pct,
                primary_archetype, secondary_archetypes,
                participation_pct, klvn_level, computed_at
            ) VALUES (
                %s, %s, %s, %s, %s, 'boxscore', %s, %s, %s, %s, %s, now()
            ) RETURNING id
        """, (
            pts_id, kr["base_off_kr"], kr["base_def_kr"], kr["overall_kr"],
            KR_VERSION, confidence,
            kr["primary_archetype"], kr["secondary_archetypes"],
            participation, level_key,
        )).fetchone()

        kr_id = str(kr_row["id"])

        # Insert cluster scores
        for cluster_name, score in clusters.items():
            off_w = 1.0 if cluster_name in ("shooting", "finishing", "playmaking") else 0.0
            def_w = 1.0 if cluster_name in ("perimeter_defense", "interior_defense", "rebounding", "frame") else 0.0
            conn.execute("""
                INSERT INTO player_kr_clusters (player_kr_id, cluster, score, weight_in_off_kr, weight_in_def_kr)
                VALUES (%s, %s, %s, %s, %s)
            """, (kr_id, cluster_name, score, off_w, def_w))

        inserted += 1
        if inserted % 500 == 0:
            conn.commit()
            print(f"  ... {inserted} players processed")

    conn.commit()
    print(f"  Inserted {inserted} player KR records")


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
               cl.level_key,
               ts.team_off_kr, ts.team_def_kr, ts.team_overall_kr,
               ts.osie_system, ts.dsie_system
        FROM team_seasons ts
        JOIN teams t ON ts.team_id = t.id
        JOIN competitive_levels cl ON t.competitive_level_id = cl.id
        WHERE ts.team_overall_kr IS NOT NULL
    """).fetchall()

    teams_processed = 0
    players_allocated = 0

    for ts in team_seasons:
        ts_id = str(ts["team_season_id"])
        level_key = ts["level_key"]

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
        "ncaa_d1_mid_major":    500_000,
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
# MAIN
# ═══════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="KaNeXT KR Computation Engine")
    parser.add_argument("--level", help="Process only this competitive level (e.g. 'naia')")
    parser.add_argument("--team-only", action="store_true", help="Skip player KR, recompute team KR only")
    args = parser.parse_args()

    start = time.time()
    print("=" * 70)
    print("KaNeXT KR Computation Engine — V1 (Box-Score)")
    print(f"Version: {KR_VERSION}")
    print("=" * 70)

    conn = get_conn()

    # Count data
    player_count = conn.execute("SELECT count(*) AS c FROM player_team_seasons").fetchone()["c"]
    team_count = conn.execute("SELECT count(*) AS c FROM team_seasons").fetchone()["c"]
    game_count = conn.execute("SELECT count(*) AS c FROM player_game_stats WHERE minutes > 0").fetchone()["c"]
    print(f"\nData: {player_count} player-seasons, {team_count} teams, {game_count} game stats")

    if not args.team_only:
        # Step 1: Season stats
        season_data = compute_season_stats(conn)

        # Step 2: BPR + PGIS
        compute_all_bpr_pgis(conn)

        # Step 3: TGIS
        compute_all_tgis(conn)

        # Step 4: Player KR
        compute_all_player_kr(conn, season_data)

    # Step 5: Team KR
    compute_all_team_kr(conn)

    # Step 6: OSIE / DSIE
    compute_all_osie_dsie(conn)

    # Step 7: Scholarship & NIL
    compute_all_scholarship_nil(conn)

    # Step 8: Audit
    elapsed_ms = int((time.time() - start) * 1000)
    log_computation(conn, elapsed_ms, player_count, team_count)

    elapsed = time.time() - start
    print(f"\n{'=' * 70}")
    print(f"DONE in {elapsed:.1f}s")

    # Summary
    kr_count = conn.execute("SELECT count(*) AS c FROM player_kr").fetchone()["c"]
    team_kr_count = conn.execute("SELECT count(*) AS c FROM team_seasons WHERE team_overall_kr IS NOT NULL").fetchone()["c"]
    osie_count = conn.execute("SELECT count(*) AS c FROM team_system_identity").fetchone()["c"]
    bpr_count = conn.execute("SELECT count(*) AS c FROM player_game_stats WHERE bpr_value IS NOT NULL").fetchone()["c"]
    pgis_count = conn.execute("SELECT count(*) AS c FROM player_game_stats WHERE pgis_value IS NOT NULL").fetchone()["c"]
    tgis_count = conn.execute("SELECT count(*) AS c FROM games WHERE tgis_home IS NOT NULL").fetchone()["c"]

    sna_count = conn.execute("SELECT count(*) AS c FROM scholarship_nil_allocations").fetchone()["c"]
    tas_count = conn.execute("SELECT count(*) AS c FROM team_allocation_summary").fetchone()["c"]

    print(f"  Player KRs computed:    {kr_count}")
    print(f"  BPR values computed:    {bpr_count}")
    print(f"  PGIS values computed:   {pgis_count}")
    print(f"  TGIS values computed:   {tgis_count}")
    print(f"  Team KRs computed:      {team_kr_count}")
    print(f"  System identities:      {osie_count}")
    print(f"  Scholarship/NIL allocs: {sna_count}")
    print(f"  Team alloc summaries:   {tas_count}")
    print(f"{'=' * 70}")

    conn.close()


if __name__ == "__main__":
    main()
