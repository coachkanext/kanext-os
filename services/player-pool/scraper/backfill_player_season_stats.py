"""
Backfill player_season_stats from player_game_stats.

For players who have game logs but no season stats, aggregates their
per-game box scores into season averages and totals.

Usage:
    python3 backfill_player_season_stats.py              # all levels
    python3 backfill_player_season_stats.py ncaa_d2      # one level
    python3 backfill_player_season_stats.py --dry-run    # preview
"""
from __future__ import annotations

import sys
import time

import psycopg

DB = "postgresql://localhost:5432/kanext_player_pool"


def main():
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    level_key = None
    for a in args:
        if a != "--dry-run":
            level_key = a

    label = level_key or "ALL levels"
    print(f"Backfilling player_season_stats — {label}{' (dry run)' if dry_run else ''}")

    t0 = time.time()

    with psycopg.connect(DB) as conn:
        level_clause = ""
        params: list = []
        if level_key:
            level_clause = "AND cl.level_key = %s"
            params = [level_key]

        # Find players missing season stats but having game stats
        rows = conn.execute(f"""
            SELECT
                pts.id AS pts_id,
                COUNT(pgs.id) AS gp,
                COUNT(pgs.id) FILTER (WHERE pgs.started = true) AS gs,
                COUNT(pgs.id) FILTER (WHERE pgs.minutes > 0) AS games_with_min,
                SUM(COALESCE(pgs.minutes, 0)) AS total_min,
                SUM(COALESCE(pgs.pts, 0)) AS total_pts,
                SUM(COALESCE(pgs.reb, 0)) AS total_reb,
                SUM(COALESCE(pgs.ast, 0)) AS total_ast,
                SUM(COALESCE(pgs.stl, 0)) AS total_stl,
                SUM(COALESCE(pgs.blk, 0)) AS total_blk,
                SUM(COALESCE(pgs.turnovers, 0)) AS total_tov,
                SUM(COALESCE(pgs.oreb, 0)) AS total_oreb,
                SUM(COALESCE(pgs.dreb, 0)) AS total_dreb,
                SUM(COALESCE(pgs.fgm, 0)) AS total_fgm,
                SUM(COALESCE(pgs.fga, 0)) AS total_fga,
                SUM(COALESCE(pgs.three_pm, 0)) AS total_3pm,
                SUM(COALESCE(pgs.three_pa, 0)) AS total_3pa,
                SUM(COALESCE(pgs.ftm, 0)) AS total_ftm,
                SUM(COALESCE(pgs.fta, 0)) AS total_fta,
                SUM(COALESCE(pgs.pf, 0)) AS total_pf
            FROM player_team_seasons pts
            JOIN team_seasons ts ON ts.id = pts.team_season_id
            JOIN teams t ON t.id = ts.team_id
            JOIN competitive_levels cl ON cl.id = t.competitive_level_id
            JOIN player_game_stats pgs ON pgs.player_team_season_id = pts.id
            LEFT JOIN player_season_stats pss ON pss.player_team_season_id = pts.id
            WHERE pss.id IS NULL {level_clause}
            GROUP BY pts.id
        """, params).fetchall()

        print(f"  Found {len(rows)} players to backfill")

        if dry_run or not rows:
            elapsed = time.time() - t0
            print(f"Done in {elapsed:.1f}s")
            return

        inserted = 0
        for row in rows:
            pts_id = row[0]
            gp = int(row[1])
            gs = int(row[2])
            games_with_min = int(row[3])
            total_min = float(row[4])
            total_pts = int(row[5])
            total_reb = int(row[6])
            total_ast = int(row[7])
            total_stl = int(row[8])
            total_blk = int(row[9])
            total_tov = int(row[10])
            total_oreb = int(row[11])
            total_dreb = int(row[12])
            total_fgm = int(row[13])
            total_fga = int(row[14])
            total_3pm = int(row[15])
            total_3pa = int(row[16])
            total_ftm = int(row[17])
            total_fta = int(row[18])
            total_pf = int(row[19])

            if gp == 0:
                continue

            # Per-game averages
            mpg = round(total_min / gp, 1)
            ppg = round(total_pts / gp, 1)
            rpg = round(total_reb / gp, 1)
            apg = round(total_ast / gp, 1)
            spg = round(total_stl / gp, 1)
            bpg = round(total_blk / gp, 1)
            topg = round(total_tov / gp, 1)
            orebpg = round(total_oreb / gp, 1)
            drebpg = round(total_dreb / gp, 1)
            fgapg = round(total_fga / gp, 1)
            tpapg = round(total_3pa / gp, 1)
            ftapg = round(total_fta / gp, 1)
            pfpg = round(total_pf / gp, 1)

            # Percentages
            fg_pct = round(total_fgm / total_fga * 100, 1) if total_fga > 0 else None
            three_pct = round(total_3pm / total_3pa * 100, 1) if total_3pa > 0 else None
            ft_pct = round(total_ftm / total_fta * 100, 1) if total_fta > 0 else None

            # Minutes coverage
            min_cov = round(games_with_min / gp * 100, 1) if gp > 0 else None

            conn.execute("""
                INSERT INTO player_season_stats (
                    player_team_season_id,
                    games_played, games_started, games_with_minutes,
                    minutes_per_game, pts_per_game, reb_per_game, ast_per_game,
                    stl_per_game, blk_per_game, to_per_game,
                    oreb_per_game, dreb_per_game,
                    fg_pct, three_pct, ft_pct,
                    fga_per_game, three_pa_per_game, fta_per_game, pf_per_game,
                    minutes_coverage_pct
                ) VALUES (
                    %s,
                    %s, %s, %s,
                    %s, %s, %s, %s,
                    %s, %s, %s,
                    %s, %s,
                    %s, %s, %s,
                    %s, %s, %s, %s,
                    %s
                )
            """, [
                pts_id,
                gp, gs, games_with_min,
                mpg, ppg, rpg, apg,
                spg, bpg, topg,
                orebpg, drebpg,
                fg_pct, three_pct, ft_pct,
                fgapg, tpapg, ftapg, pfpg,
                min_cov,
            ])
            inserted += 1

        conn.commit()
        elapsed = time.time() - t0
        print(f"  Inserted {inserted} player_season_stats rows")
        print(f"Done in {elapsed:.1f}s")


if __name__ == "__main__":
    main()
