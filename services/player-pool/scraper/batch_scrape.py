"""
Batch scraper — scrape a specific list of teams by slug.
Usage: python3 batch_scrape.py <batch_file.txt>

Batch file format (one team per line):
  slug|Name
"""
from __future__ import annotations
import sys
import logging

import db
from scraper import scrape_team, print_summary
from config import NJCAA_BASE_URL, SEASON

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("batch_scrape")


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 batch_scrape.py <batch_file.txt> [assoc_code] [level_key] [division] [base_url]")
        sys.exit(1)

    batch_file = sys.argv[1]
    assoc_code = sys.argv[2] if len(sys.argv) > 2 else "njcaa"
    level_key = sys.argv[3] if len(sys.argv) > 3 else "njcaa_d1"
    division = sys.argv[4] if len(sys.argv) > 4 else "div1"
    base_url = sys.argv[5] if len(sys.argv) > 5 else NJCAA_BASE_URL

    # Handle "none" for division (NAIA, CCCAA, etc.)
    if division.lower() == "none":
        division = None

    # Read batch file
    teams = []
    with open(batch_file) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split("|", 1)
            slug = parts[0].strip()
            name = parts[1].strip() if len(parts) > 1 else slug
            teams.append({"name": name, "slug": slug, "division": division})

    log.info(f"Batch: {len(teams)} teams, level={level_key}, assoc={assoc_code}")

    conn = db.get_conn()
    try:
        stats = {"teams": 0, "games": 0, "pgs": 0}
        for i, team in enumerate(teams):
            log.info(f"\n[{i+1}/{len(teams)}] {team['name']}")
            try:
                result = scrape_team(
                    conn, team, division,
                    base_url=base_url,
                    assoc_code=assoc_code,
                    level_key=level_key,
                )
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
        print_summary(conn, f"BATCH ({level_key})")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
