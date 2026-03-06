"""
ESPN Batch scraper — scrape a specific list of NCAA D1 teams by ESPN ID.
Usage: python3 batch_espn.py <batch_file.txt>

Batch file format (one team per line):
  espn_id|Team Name
"""
from __future__ import annotations
import sys
import logging

import db
from espn_scraper import scrape_team, print_summary

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("batch_espn")

LEVEL_KEY = "ncaa_d1"
ASSOC_CODE = "ncaa"


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 batch_espn.py <batch_file.txt>")
        sys.exit(1)

    batch_file = sys.argv[1]

    teams = []
    with open(batch_file) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split("|", 1)
            espn_id = parts[0].strip()
            name = parts[1].strip() if len(parts) > 1 else f"Team #{espn_id}"
            teams.append({"espn_id": espn_id, "name": name, "slug": f"espn-{espn_id}"})

    log.info(f"Batch: {len(teams)} NCAA D1 teams via ESPN")

    conn = db.get_conn()
    try:
        level_id = db.get_competitive_level_id(conn, LEVEL_KEY)
        division_id = db.get_division_id(conn, ASSOC_CODE, "d1")

        stats = {"teams": 0, "games": 0, "pgs": 0}
        for i, team in enumerate(teams):
            log.info(f"\n[{i+1}/{len(teams)}] {team['name']}")
            try:
                result = scrape_team(conn, team, level_id, division_id)
                stats["teams"] += 1
                stats["games"] += result["games"]
                stats["pgs"] += result["player_game_stats"]
            except Exception as e:
                log.error(f"Error scraping {team['name']}: {e}")
                conn.rollback()
                continue

        log.info(f"\n{'='*60}")
        log.info(f"  BATCH COMPLETE: {stats['teams']} teams, {stats['games']} games, {stats['pgs']} PGS rows")
        log.info(f"{'='*60}")
        print_summary(conn, "ESPN BATCH")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
