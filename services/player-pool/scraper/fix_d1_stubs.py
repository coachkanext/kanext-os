"""
Fix NCAA D1 opponent stubs:
1. Merge 128 duplicate stubs (same name as real ESPN team) → move players/games to real team
2. Re-scrape 148 real ESPN teams that had 0 games (ESPN API may have data now)
3. Remove competitive_level_id from remaining non-D1 opponent stubs (or delete if empty)
"""
from __future__ import annotations

import json
import logging
import re
import sys

import httpx

import db
from config import SEASON

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("fix_d1_stubs")

ESPN_API = "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball"


def merge_duplicate_stubs(conn):
    """Merge opponent stubs that are duplicates of real ESPN teams."""
    # Find duplicates: opponent stub name matches real team name exactly
    dupes = conn.execute("""
        SELECT opp.id as opp_team_id, opp.name, opp.slug as opp_slug,
               real.id as real_team_id, real.slug as real_slug
        FROM teams opp
        JOIN competitive_levels cl ON opp.competitive_level_id = cl.id
        JOIN teams real ON real.name = opp.name
            AND real.slug LIKE 'espn-%%'
            AND NOT real.slug LIKE 'espn-opp-%%'
        WHERE cl.level_key = 'ncaa_d1'
            AND opp.slug LIKE 'espn-opp-%%'
    """).fetchall()

    log.info(f"Found {len(dupes)} duplicate stubs to merge")

    merged = 0
    for d in dupes:
        opp_id = str(d["opp_team_id"])
        real_id = str(d["real_team_id"])
        name = d["name"]

        # Get opp team_season
        opp_ts = conn.execute(
            "SELECT id FROM team_seasons WHERE team_id = %s AND season = %s",
            (opp_id, SEASON)
        ).fetchone()
        if not opp_ts:
            continue
        opp_ts_id = str(opp_ts["id"])

        # Get or create real team_season
        real_ts = conn.execute(
            "SELECT id FROM team_seasons WHERE team_id = %s AND season = %s",
            (real_id, SEASON)
        ).fetchone()
        if not real_ts:
            real_ts_id = str(db.upsert_team_season(conn, real_id, SEASON))
        else:
            real_ts_id = str(real_ts["id"])

        # Move games: update home/away team_season_id references
        conn.execute(
            "UPDATE games SET home_team_season_id = %s WHERE home_team_season_id = %s",
            (real_ts_id, opp_ts_id)
        )
        conn.execute(
            "UPDATE games SET away_team_season_id = %s WHERE away_team_season_id = %s",
            (real_ts_id, opp_ts_id)
        )

        # Move player_team_seasons: for each player on the opp stub,
        # check if they already have a pts on the real team
        opp_pts_rows = conn.execute(
            "SELECT id, player_id FROM player_team_seasons WHERE team_season_id = %s",
            (opp_ts_id,)
        ).fetchall()

        for pts_row in opp_pts_rows:
            pts_id = str(pts_row["id"])
            player_id = str(pts_row["player_id"])

            # Check if player already has a pts on real team
            existing = conn.execute(
                "SELECT id FROM player_team_seasons WHERE player_id = %s AND team_season_id = %s",
                (player_id, real_ts_id)
            ).fetchone()

            if existing:
                real_pts_id = str(existing["id"])
                # Move game stats from opp pts to real pts (skip if already exists)
                conn.execute("""
                    UPDATE player_game_stats SET player_team_season_id = %s
                    WHERE player_team_season_id = %s
                    AND game_id NOT IN (
                        SELECT game_id FROM player_game_stats WHERE player_team_season_id = %s
                    )
                """, (real_pts_id, pts_id, real_pts_id))
                # Delete remaining dupes
                conn.execute(
                    "DELETE FROM player_game_stats WHERE player_team_season_id = %s", (pts_id,)
                )
                # Move season stats (skip if exists)
                conn.execute("""
                    DELETE FROM player_season_stats WHERE player_team_season_id = %s
                """, (pts_id,))
                # Delete KR data if any
                conn.execute(
                    "DELETE FROM player_kr WHERE player_team_season_id = %s", (pts_id,)
                )
                conn.execute(
                    "DELETE FROM scholarship_nil_allocations WHERE player_team_season_id = %s", (pts_id,)
                )
                # Delete the opp pts
                conn.execute("DELETE FROM player_team_seasons WHERE id = %s", (pts_id,))
            else:
                # Just move the pts to the real team_season
                conn.execute(
                    "UPDATE player_team_seasons SET team_season_id = %s WHERE id = %s",
                    (real_ts_id, pts_id)
                )

        # Delete opp team_season and team
        conn.execute("DELETE FROM team_seasons WHERE id = %s", (opp_ts_id,))
        # Check if opp team has other seasons
        other = conn.execute(
            "SELECT COUNT(*) as n FROM team_seasons WHERE team_id = %s", (opp_id,)
        ).fetchone()
        if other["n"] == 0:
            conn.execute("DELETE FROM teams WHERE id = %s", (opp_id,))

        merged += 1
        if merged % 20 == 0:
            log.info(f"  Merged {merged}/{len(dupes)}")
            conn.commit()

    conn.commit()
    log.info(f"Merged {merged} duplicate stubs into real teams")
    return merged


def nullify_non_d1_stubs(conn):
    """Remove ncaa_d1 competitive_level_id from remaining opponent stubs
    that aren't real D1 teams."""
    result = conn.execute("""
        UPDATE teams SET competitive_level_id = NULL
        WHERE slug LIKE 'espn-opp-%%'
        AND competitive_level_id = (
            SELECT id FROM competitive_levels WHERE level_key = 'ncaa_d1'
        )
    """)
    count = result.rowcount
    conn.commit()
    log.info(f"Removed D1 level from {count} non-D1 opponent stubs")
    return count


def rescrape_empty_teams(conn):
    """Re-scrape the 148 real ESPN teams that have 0 games."""
    # Import here to avoid circular deps
    from espn_scraper import scrape_team, get_schedule

    level_id = db.get_competitive_level_id(conn, "ncaa_d1")
    division_id = db.get_division_id(conn, "ncaa", "d1")

    # Find real ESPN teams with no games
    empty = conn.execute("""
        SELECT t.id, t.name, t.slug
        FROM teams t
        JOIN competitive_levels cl ON t.competitive_level_id = cl.id
        WHERE cl.level_key = 'ncaa_d1'
            AND t.slug LIKE 'espn-%%'
            AND NOT t.slug LIKE 'espn-opp-%%'
            AND NOT EXISTS (
                SELECT 1 FROM team_seasons ts
                JOIN games g ON g.home_team_season_id = ts.id OR g.away_team_season_id = ts.id
                WHERE ts.team_id = t.id
            )
        ORDER BY t.name
    """).fetchall()

    log.info(f"Found {len(empty)} real ESPN teams with 0 games — re-scraping")

    stats = {"teams": 0, "games": 0, "pgs": 0}
    for i, row in enumerate(empty):
        espn_id = row["slug"].replace("espn-", "")
        name = row["name"]
        log.info(f"\n[{i+1}/{len(empty)}] {name} (ESPN #{espn_id})")

        try:
            result = scrape_team(conn, {
                "espn_id": espn_id,
                "name": name,
                "slug": row["slug"].replace("espn-", ""),
                "abbreviation": "",
            }, level_id, division_id)
            stats["teams"] += 1
            stats["games"] += result["games"]
            stats["pgs"] += result["player_game_stats"]
            log.info(f"  → {result['games']} games, {result['player_game_stats']} PGS")
        except Exception as e:
            log.error(f"  Error: {e}")
            conn.rollback()

    conn.commit()
    log.info(f"\nRe-scrape done: {stats['teams']} teams, {stats['games']} games, {stats['pgs']} PGS")
    return stats


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"
    conn = db.get_conn()

    try:
        if mode in ("merge", "all"):
            merge_duplicate_stubs(conn)

        if mode in ("nullify", "all"):
            nullify_non_d1_stubs(conn)

        if mode in ("rescrape", "all"):
            rescrape_empty_teams(conn)

        # Final counts
        real = conn.execute("""
            SELECT COUNT(*) as n FROM teams t
            JOIN competitive_levels cl ON t.competitive_level_id = cl.id
            WHERE cl.level_key = 'ncaa_d1' AND t.slug LIKE 'espn-%%' AND NOT t.slug LIKE 'espn-opp-%%'
        """).fetchone()
        stubs = conn.execute("""
            SELECT COUNT(*) as n FROM teams t
            JOIN competitive_levels cl ON t.competitive_level_id = cl.id
            WHERE cl.level_key = 'ncaa_d1' AND t.slug LIKE 'espn-opp-%%'
        """).fetchone()
        orphans = conn.execute("""
            SELECT COUNT(*) as n FROM teams WHERE slug LIKE 'espn-opp-%%' AND competitive_level_id IS NULL
        """).fetchone()

        log.info(f"\n{'='*60}")
        log.info(f"FINAL STATE:")
        log.info(f"  Real D1 teams: {real['n']}")
        log.info(f"  D1 opponent stubs remaining: {stubs['n']}")
        log.info(f"  Orphaned stubs (no level): {orphans['n']}")

    finally:
        conn.close()
