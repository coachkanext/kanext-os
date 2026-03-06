"""
Scrape jersey numbers from ESPN roster API for NCAA D1 teams.

Matches ESPN roster athletes to existing players in DB by name,
then updates player_team_seasons.jersey_number.

Usage:
    python3 jersey_scraper.py           # all D1 teams
    python3 jersey_scraper.py --test 5  # first 5 teams only
    python3 jersey_scraper.py --dry-run # preview without writing
"""

from __future__ import annotations

import sys
import time
import httpx
import psycopg

DB = "postgresql://localhost:5432/kanext_player_pool"
ESPN_ROSTER_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/{espn_id}/roster"
DELAY = 1.0  # seconds between requests


def normalize(name: str) -> str:
    """Normalize name for fuzzy matching."""
    return name.lower().strip().replace(".", "").replace("'", "").replace("-", " ").replace(",", " ")


def main():
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    test_n = None
    for i, a in enumerate(args):
        if a == "--test" and i + 1 < len(args):
            test_n = int(args[i + 1])

    with psycopg.connect(DB) as conn:
        # Get all D1 teams with ESPN slugs
        teams = conn.execute("""
            SELECT t.id, t.name, t.slug
            FROM teams t
            JOIN competitive_levels cl ON cl.id = t.competitive_level_id
            WHERE cl.level_key = 'ncaa_d1' AND t.slug LIKE 'espn-%'
            ORDER BY t.name
        """).fetchall()

        if test_n:
            teams = teams[:test_n]

        print(f"Processing {len(teams)} D1 teams")

        total_matched = 0
        total_updated = 0
        total_missed = 0

        client = httpx.Client(timeout=30)

        for idx, (team_id, team_name, slug) in enumerate(teams):
            espn_id = slug.replace("espn-", "")

            try:
                resp = client.get(ESPN_ROSTER_URL.format(espn_id=espn_id))
                resp.raise_for_status()
                data = resp.json()
            except Exception as e:
                print(f"  [{idx+1}/{len(teams)}] {team_name} — ERROR: {e}")
                time.sleep(DELAY)
                continue

            athletes = data.get("athletes", [])
            if not athletes:
                print(f"  [{idx+1}/{len(teams)}] {team_name} — no athletes in response")
                time.sleep(DELAY)
                continue

            # Build ESPN roster: normalized_name → jersey
            espn_roster = {}
            for a in athletes:
                name = a.get("displayName") or a.get("fullName")
                jersey = a.get("jersey")
                if name and jersey:
                    espn_roster[normalize(name)] = str(jersey)

            # Get our players for this team
            db_players = conn.execute("""
                SELECT pts.id, p.full_name, pts.jersey_number
                FROM player_team_seasons pts
                JOIN players p ON p.id = pts.player_id
                JOIN team_seasons ts ON ts.id = pts.team_season_id
                WHERE ts.team_id = %s
            """, [team_id]).fetchall()

            matched = 0
            updated = 0
            for pts_id, full_name, current_jersey in db_players:
                norm = normalize(full_name)
                jersey = espn_roster.get(norm)

                if jersey is None:
                    # Try last name match if only one match
                    last = norm.split()[-1] if norm.split() else ""
                    last_matches = [(k, v) for k, v in espn_roster.items() if k.split()[-1] == last]
                    if len(last_matches) == 1:
                        jersey = last_matches[0][1]

                if jersey:
                    matched += 1
                    if current_jersey != jersey:
                        if not dry_run:
                            conn.execute(
                                "UPDATE player_team_seasons SET jersey_number = %s WHERE id = %s",
                                [jersey, pts_id]
                            )
                        updated += 1

            missed = len(db_players) - matched
            total_matched += matched
            total_updated += updated
            total_missed += missed

            if (idx + 1) % 25 == 0 or idx == len(teams) - 1:
                print(f"  [{idx+1}/{len(teams)}] {team_name} — {matched}/{len(db_players)} matched, {updated} updated")

            time.sleep(DELAY)

        if not dry_run:
            conn.commit()

        client.close()

        print(f"\nDone — {total_matched} matched, {total_updated} updated, {total_missed} unmatched")


if __name__ == "__main__":
    main()
