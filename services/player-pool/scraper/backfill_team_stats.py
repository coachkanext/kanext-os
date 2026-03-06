"""
Backfill team_game_log and team_season_stats from player_game_stats.

For every game in the `games` table, sums player box scores from both sides
to produce team-level game logs with full opponent stats. Then aggregates
game logs into season totals.

Usage:
    python3 backfill_team_stats.py              # backfill all levels
    python3 backfill_team_stats.py ncaa_d1      # backfill one level
    python3 backfill_team_stats.py --dry-run    # preview without writing
"""

from __future__ import annotations

import sys
import time
from typing import Optional

import psycopg

DB = "postgresql://localhost:5432/kanext_player_pool"


def get_level_filter(args: list[str]) -> str | None:
    for a in args:
        if a != "--dry-run":
            return a
    return None


def is_dry_run(args: list[str]) -> bool:
    return "--dry-run" in args


def backfill_team_game_log(conn, level_key: str | None, dry_run: bool) -> int:
    """Build team_game_log rows from player_game_stats for each game."""

    level_clause = ""
    params: list = []
    if level_key:
        level_clause = """
            AND (cl_home.level_key = %s OR cl_away.level_key = %s)
        """
        params = [level_key, level_key]

    # Get all games that have player stats on at least one side
    # Two-sided games (both teams linked)
    games = conn.execute(f"""
        SELECT
            g.id AS game_id,
            g.game_date,
            g.home_score,
            g.away_score,
            g.home_team_season_id,
            g.away_team_season_id,
            ts_home.team_id AS home_team_id,
            ts_away.team_id AS away_team_id,
            t_away.name AS away_team_name,
            t_home.name AS home_team_name
        FROM games g
        JOIN team_seasons ts_home ON ts_home.id = g.home_team_season_id
        JOIN team_seasons ts_away ON ts_away.id = g.away_team_season_id
        JOIN teams t_home ON t_home.id = ts_home.team_id
        JOIN teams t_away ON t_away.id = ts_away.team_id
        LEFT JOIN competitive_levels cl_home ON cl_home.id = t_home.competitive_level_id
        LEFT JOIN competitive_levels cl_away ON cl_away.id = t_away.competitive_level_id
        WHERE g.home_team_season_id IS NOT NULL
          AND g.away_team_season_id IS NOT NULL
          {level_clause}
        ORDER BY g.game_date
    """, params).fetchall()

    # One-sided games (only one team linked — e.g. NCAA synthetic games)
    one_sided_clause = ""
    one_sided_params: list = []
    if level_key:
        one_sided_clause = "AND cl.level_key = %s"
        one_sided_params = [level_key]

    one_sided_games = conn.execute(f"""
        SELECT
            g.id AS game_id,
            g.game_date,
            g.home_score,
            g.away_score,
            g.home_team_season_id,
            g.away_team_season_id,
            COALESCE(ts.team_id) AS team_id,
            t.name AS team_name,
            CASE WHEN g.home_team_season_id IS NOT NULL THEN 'home' ELSE 'away' END AS side
        FROM games g
        JOIN team_seasons ts ON ts.id = COALESCE(g.home_team_season_id, g.away_team_season_id)
        JOIN teams t ON t.id = ts.team_id
        JOIN competitive_levels cl ON cl.id = t.competitive_level_id
        WHERE (g.home_team_season_id IS NULL) != (g.away_team_season_id IS NULL)
          {one_sided_clause}
        ORDER BY g.game_date
    """, one_sided_params).fetchall()

    print(f"  ({len(one_sided_games)} one-sided games to process)")

    print(f"Found {len(games)} games to process")

    # For each game, aggregate player stats for home and away teams
    inserted = 0
    skipped = 0

    for i, game in enumerate(games):
        game_id = game[0]
        game_date = game[1]
        home_score = game[2]
        away_score = game[3]
        home_ts_id = game[4]
        away_ts_id = game[5]
        home_team_id = game[6]
        away_team_id = game[7]
        away_team_name = game[8]
        home_team_name = game[9]

        # Sum player stats for each side
        def sum_side(team_season_id):
            row = conn.execute("""
                SELECT
                    COUNT(*) AS player_count,
                    SUM(minutes) AS min,
                    SUM(fgm) AS fgm,
                    SUM(fga) AS fga,
                    SUM(three_pm) AS three_pm,
                    SUM(three_pa) AS three_pa,
                    SUM(ftm) AS ftm,
                    SUM(fta) AS fta,
                    SUM(oreb) AS orb,
                    SUM(dreb) AS drb,
                    SUM(reb) AS trb,
                    SUM(ast) AS ast,
                    SUM(turnovers) AS tov,
                    SUM(stl) AS stl,
                    SUM(blk) AS blk,
                    SUM(pf) AS pf,
                    SUM(pts) AS pts
                FROM player_game_stats pgs
                JOIN player_team_seasons pts ON pts.id = pgs.player_team_season_id
                WHERE pgs.game_id = %s AND pts.team_season_id = %s
            """, [game_id, team_season_id]).fetchone()
            return row

        home_stats = sum_side(home_ts_id)
        away_stats = sum_side(away_ts_id)

        # Skip if no player stats on either side
        if home_stats[0] == 0 and away_stats[0] == 0:
            skipped += 1
            continue

        def to_int(v):
            return int(v) if v is not None else None

        def insert_row(team_id, team_season_id, is_home, team_stats, opp_stats,
                       opp_name, team_score, opp_score_val):
            if team_stats[0] == 0:
                return False

            result_val = None
            if team_score is not None and opp_score_val is not None:
                result_val = 'W' if team_score > opp_score_val else 'L'

            home_away = 'home' if is_home else 'away'

            conn.execute("""
                INSERT INTO team_game_log (
                    team_id, season, game_date, opponent_name, opponent_team_id,
                    home_away, result, team_score, opp_score,
                    min, fgm, fga, three_pm, three_pa, ftm, fta,
                    orb, drb, trb, ast, tov, stl, blk, pf, pts,
                    opp_fgm, opp_fga, opp_three_pm, opp_three_pa, opp_ftm, opp_fta,
                    opp_orb, opp_drb, opp_trb, opp_ast, opp_tov, opp_stl, opp_blk, opp_pf, opp_pts
                ) VALUES (
                    %s, 2025, %s, %s, %s,
                    %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT DO NOTHING
            """, [
                team_id, game_date, opp_name,
                away_team_id if is_home else home_team_id,
                home_away, result_val, team_score, opp_score_val,
                to_int(team_stats[1]),   # min
                to_int(team_stats[2]),   # fgm
                to_int(team_stats[3]),   # fga
                to_int(team_stats[4]),   # three_pm
                to_int(team_stats[5]),   # three_pa
                to_int(team_stats[6]),   # ftm
                to_int(team_stats[7]),   # fta
                to_int(team_stats[8]),   # orb
                to_int(team_stats[9]),   # drb
                to_int(team_stats[10]),  # trb
                to_int(team_stats[11]),  # ast
                to_int(team_stats[12]),  # tov
                to_int(team_stats[13]),  # stl
                to_int(team_stats[14]),  # blk
                to_int(team_stats[15]),  # pf
                to_int(team_stats[16]),  # pts
                # opponent stats
                to_int(opp_stats[2]) if opp_stats[0] > 0 else None,   # opp_fgm
                to_int(opp_stats[3]) if opp_stats[0] > 0 else None,   # opp_fga
                to_int(opp_stats[4]) if opp_stats[0] > 0 else None,   # opp_three_pm
                to_int(opp_stats[5]) if opp_stats[0] > 0 else None,   # opp_three_pa
                to_int(opp_stats[6]) if opp_stats[0] > 0 else None,   # opp_ftm
                to_int(opp_stats[7]) if opp_stats[0] > 0 else None,   # opp_fta
                to_int(opp_stats[8]) if opp_stats[0] > 0 else None,   # opp_orb
                to_int(opp_stats[9]) if opp_stats[0] > 0 else None,   # opp_drb
                to_int(opp_stats[10]) if opp_stats[0] > 0 else None,  # opp_trb
                to_int(opp_stats[11]) if opp_stats[0] > 0 else None,  # opp_ast
                to_int(opp_stats[12]) if opp_stats[0] > 0 else None,  # opp_tov
                to_int(opp_stats[13]) if opp_stats[0] > 0 else None,  # opp_stl
                to_int(opp_stats[14]) if opp_stats[0] > 0 else None,  # opp_blk
                to_int(opp_stats[15]) if opp_stats[0] > 0 else None,  # opp_pf
                to_int(opp_stats[16]) if opp_stats[0] > 0 else opp_score_val,  # opp_pts (fallback to game score)
            ])
            return True

        # Insert home team row
        if insert_row(home_team_id, home_ts_id, True, home_stats, away_stats,
                      away_team_name, home_score, away_score):
            inserted += 1

        # Insert away team row
        if insert_row(away_team_id, away_ts_id, False, away_stats, home_stats,
                      home_team_name, away_score, home_score):
            inserted += 1

        if (i + 1) % 2000 == 0:
            print(f"  processed {i + 1}/{len(games)} games, {inserted} rows inserted")

    print(f"  Skipped {skipped} games (no player stats)")

    # Process one-sided games
    one_sided_inserted = 0
    for game in one_sided_games:
        game_id = game[0]
        game_date = game[1]
        home_score = game[2]
        away_score = game[3]
        home_ts_id = game[4]
        away_ts_id = game[5]
        team_id = game[6]
        team_name = game[7]
        side = game[8]

        ts_id = home_ts_id if side == 'home' else away_ts_id
        team_stats = sum_side(ts_id)

        if team_stats[0] == 0:
            continue

        team_score = home_score if side == 'home' else away_score
        opp_score_val = away_score if side == 'home' else home_score
        result_val = None
        if team_score is not None and opp_score_val is not None:
            result_val = 'W' if team_score > opp_score_val else 'L'

        conn.execute("""
            INSERT INTO team_game_log (
                team_id, season, game_date, home_away,
                result, team_score, opp_score,
                min, fgm, fga, three_pm, three_pa, ftm, fta,
                orb, drb, trb, ast, tov, stl, blk, pf, pts
            ) VALUES (
                %s, 2025, %s, %s,
                %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            ON CONFLICT DO NOTHING
        """, [
            team_id, game_date, side,
            result_val, team_score, opp_score_val,
            to_int(team_stats[1]),   # min
            to_int(team_stats[2]),   # fgm
            to_int(team_stats[3]),   # fga
            to_int(team_stats[4]),   # three_pm
            to_int(team_stats[5]),   # three_pa
            to_int(team_stats[6]),   # ftm
            to_int(team_stats[7]),   # fta
            to_int(team_stats[8]),   # orb
            to_int(team_stats[9]),   # drb
            to_int(team_stats[10]),  # trb
            to_int(team_stats[11]),  # ast
            to_int(team_stats[12]),  # tov
            to_int(team_stats[13]),  # stl
            to_int(team_stats[14]),  # blk
            to_int(team_stats[15]),  # pf
            to_int(team_stats[16]),  # pts
        ])
        one_sided_inserted += 1

    if one_sided_inserted > 0:
        print(f"  Inserted {one_sided_inserted} one-sided game log rows")

    return inserted + one_sided_inserted


def backfill_team_season_stats(conn, level_key: str | None, dry_run: bool) -> int:
    """Aggregate team_game_log into team_season_stats."""

    level_clause = ""
    params: list = []
    if level_key:
        level_clause = "AND cl.level_key = %s"
        params = [level_key]

    # Get all teams that have game log data
    rows = conn.execute(f"""
        SELECT
            tgl.team_id,
            COUNT(*) AS gp,
            SUM(tgl.min) AS min,
            SUM(tgl.pts) AS pts,
            SUM(tgl.fgm) AS fgm,
            SUM(tgl.fga) AS fga,
            SUM(tgl.three_pm) AS three_pm,
            SUM(tgl.three_pa) AS three_pa,
            SUM(tgl.ftm) AS ftm,
            SUM(tgl.fta) AS fta,
            SUM(tgl.orb) AS orb,
            SUM(tgl.drb) AS drb,
            SUM(tgl.trb) AS trb,
            SUM(tgl.ast) AS ast,
            SUM(tgl.tov) AS tov,
            SUM(tgl.stl) AS stl,
            SUM(tgl.blk) AS blk,
            SUM(tgl.pf) AS pf,
            SUM(tgl.opp_pts) AS opp_pts,
            SUM(tgl.opp_fgm) AS opp_fgm,
            SUM(tgl.opp_fga) AS opp_fga,
            SUM(tgl.opp_three_pm) AS opp_three_pm,
            SUM(tgl.opp_three_pa) AS opp_three_pa,
            SUM(tgl.opp_ftm) AS opp_ftm,
            SUM(tgl.opp_fta) AS opp_fta,
            SUM(tgl.opp_orb) AS opp_orb,
            SUM(tgl.opp_drb) AS opp_drb,
            SUM(tgl.opp_trb) AS opp_trb,
            SUM(tgl.opp_ast) AS opp_ast,
            SUM(tgl.opp_tov) AS opp_tov,
            SUM(tgl.opp_stl) AS opp_stl,
            SUM(tgl.opp_blk) AS opp_blk,
            SUM(tgl.opp_pf) AS opp_pf
        FROM team_game_log tgl
        JOIN teams t ON t.id = tgl.team_id
        JOIN competitive_levels cl ON cl.id = t.competitive_level_id
        WHERE 1=1 {level_clause}
        GROUP BY tgl.team_id
    """, params).fetchall()

    print(f"  Aggregating season stats for {len(rows)} teams")

    inserted = 0
    for row in rows:
        team_id = row[0]
        vals = [int(v) if v is not None else None for v in row[1:]]

        conn.execute("""
            INSERT INTO team_season_stats (
                team_id, season, gp, min, pts, fgm, fga, three_pm, three_pa, ftm, fta,
                orb, drb, trb, ast, tov, stl, blk, pf,
                opp_pts, opp_fgm, opp_fga, opp_three_pm, opp_three_pa, opp_ftm, opp_fta,
                opp_orb, opp_drb, opp_trb, opp_ast, opp_tov, opp_stl, opp_blk, opp_pf
            ) VALUES (
                %s, 2025, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s
            )
            ON CONFLICT (team_id, season) DO UPDATE SET
                gp = EXCLUDED.gp,
                min = EXCLUDED.min,
                pts = EXCLUDED.pts,
                fgm = EXCLUDED.fgm,
                fga = EXCLUDED.fga,
                three_pm = EXCLUDED.three_pm,
                three_pa = EXCLUDED.three_pa,
                ftm = EXCLUDED.ftm,
                fta = EXCLUDED.fta,
                orb = EXCLUDED.orb,
                drb = EXCLUDED.drb,
                trb = EXCLUDED.trb,
                ast = EXCLUDED.ast,
                tov = EXCLUDED.tov,
                stl = EXCLUDED.stl,
                blk = EXCLUDED.blk,
                pf = EXCLUDED.pf,
                opp_pts = EXCLUDED.opp_pts,
                opp_fgm = EXCLUDED.opp_fgm,
                opp_fga = EXCLUDED.opp_fga,
                opp_three_pm = EXCLUDED.opp_three_pm,
                opp_three_pa = EXCLUDED.opp_three_pa,
                opp_ftm = EXCLUDED.opp_ftm,
                opp_fta = EXCLUDED.opp_fta,
                opp_orb = EXCLUDED.opp_orb,
                opp_drb = EXCLUDED.opp_drb,
                opp_trb = EXCLUDED.opp_trb,
                opp_ast = EXCLUDED.opp_ast,
                opp_tov = EXCLUDED.opp_tov,
                opp_stl = EXCLUDED.opp_stl,
                opp_blk = EXCLUDED.opp_blk,
                opp_pf = EXCLUDED.opp_pf,
                scraped_at = now()
        """, [team_id] + vals)
        inserted += 1

    return inserted


def main():
    args = sys.argv[1:]
    level_key = get_level_filter(args)
    dry_run = is_dry_run(args)

    label = level_key or "ALL levels"
    if dry_run:
        print(f"DRY RUN — {label}")
    else:
        print(f"Backfilling team stats — {label}")

    t0 = time.time()

    with psycopg.connect(DB) as conn:
        # Step 1: Clear existing data for clean rebuild
        if not dry_run:
            if level_key:
                # Delete only for the specified level
                conn.execute("""
                    DELETE FROM team_game_log
                    WHERE team_id IN (
                        SELECT t.id FROM teams t
                        JOIN competitive_levels cl ON cl.id = t.competitive_level_id
                        WHERE cl.level_key = %s
                    )
                """, [level_key])
                conn.execute("""
                    DELETE FROM team_season_stats
                    WHERE team_id IN (
                        SELECT t.id FROM teams t
                        JOIN competitive_levels cl ON cl.id = t.competitive_level_id
                        WHERE cl.level_key = %s
                    )
                """, [level_key])
                print(f"  Cleared existing team_game_log + team_season_stats for {level_key}")
            else:
                conn.execute("DELETE FROM team_game_log")
                conn.execute("DELETE FROM team_season_stats")
                print("  Cleared all team_game_log + team_season_stats")

        # Step 2: Build team_game_log from player_game_stats
        print("\n=== Step 1: Building team_game_log ===")
        if dry_run:
            print("  (skipped — dry run)")
            tgl_count = 0
        else:
            tgl_count = backfill_team_game_log(conn, level_key, dry_run)
            print(f"  Inserted {tgl_count} team_game_log rows")

        # Step 3: Aggregate into team_season_stats
        print("\n=== Step 2: Building team_season_stats ===")
        if dry_run:
            print("  (skipped — dry run)")
            tss_count = 0
        else:
            tss_count = backfill_team_season_stats(conn, level_key, dry_run)
            print(f"  Upserted {tss_count} team_season_stats rows")

        if not dry_run:
            conn.commit()

    elapsed = time.time() - t0
    print(f"\nDone in {elapsed:.1f}s — {tgl_count} game log rows, {tss_count} season stats rows")


if __name__ == "__main__":
    main()
