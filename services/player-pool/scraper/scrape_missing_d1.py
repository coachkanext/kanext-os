"""Scrape the 148 D1 teams that the original ESPN scraper missed (0 games).
Uses 1s delay since ESPN is a public API (no robots.txt restriction)."""
import logging
import sys
import time

import db
import config

# Override crawl delay for ESPN — 1s is fine for their public API
config.CRAWL_DELAY = 1

from espn_scraper import scrape_team

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("missing_d1")

LEVEL_KEY = "ncaa_d1"
ASSOC_CODE = "ncaa"

# Load missing teams list
MISSING_TEAMS = []
with open("/tmp/missing_d1_teams.txt") as f:
    for line in f:
        parts = line.strip().split("|", 1)
        if len(parts) == 2:
            MISSING_TEAMS.append({"espn_id": parts[0], "name": parts[1],
                                  "slug": parts[0], "abbreviation": ""})

if __name__ == "__main__":
    # Skip already-completed teams
    skip = int(sys.argv[1]) if len(sys.argv) > 1 else 0

    conn = db.get_conn()
    level_id = db.get_competitive_level_id(conn, LEVEL_KEY)
    division_id = db.get_division_id(conn, ASSOC_CODE, "d1")

    remaining = MISSING_TEAMS[skip:]
    log.info(f"Scraping {len(remaining)} missing D1 teams (skipping first {skip})")

    stats = {"teams": 0, "games": 0, "pgs": 0, "failed": []}
    for i, team in enumerate(remaining):
        idx = i + skip + 1
        log.info(f"\n[{idx}/{len(MISSING_TEAMS)}] {team['name']} (ESPN #{team['espn_id']})")
        try:
            result = scrape_team(conn, team, level_id, division_id)
            stats["teams"] += 1
            stats["games"] += result["games"]
            stats["pgs"] += result["player_game_stats"]
            log.info(f"  → {result['games']} games, {result['player_game_stats']} PGS")
        except Exception as e:
            log.error(f"  Error: {e}")
            stats["failed"].append(team["name"])
            conn.rollback()

    log.info(f"\n{'='*60}")
    log.info(f"DONE: {stats['teams']}/{len(remaining)} teams, "
             f"{stats['games']} games, {stats['pgs']} PGS")
    if stats["failed"]:
        log.info(f"Failed ({len(stats['failed'])}): {', '.join(stats['failed'])}")

    conn.close()
