"""
Scrape 5 missing NCAA D2 teams from ESPN API.

These are NAIA-to-D2 transitional programs that have ESPN pages but
weren't picked up by the NCAA scraper. Uses the same ESPN box score
API as espn_scraper.py but writes to existing D2 team records.

Usage:
    python3 scrape_missing_d2.py           # scrape all 5
    python3 scrape_missing_d2.py --dry-run # preview only
"""
from __future__ import annotations

import sys
import time
import logging

import db
from config import SEASON, CRAWL_DELAY
from espn_scraper import fetch_json, get_schedule, parse_box_score, fetch_roster, ESPN_API

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("scrape_missing_d2")

# ESPN ID → existing DB team_id
TEAMS = [
    {"espn_id": "2939",   "name": "Jamestown",      "team_id": "8ea65621-4a3f-4857-85bd-a19007ce7ac9"},
    {"espn_id": "109014", "name": "Middle Georgia",  "team_id": "d2f2690b-35c4-4e6c-94e4-fb99d6b71d79"},
    {"espn_id": "214",    "name": "Point Park",      "team_id": "1b054d59-3bd9-4e6e-8ffe-2fd893f108d9"},
    {"espn_id": "3163",   "name": "Roosevelt",       "team_id": "79b99c60-d292-4f2c-bf02-0c5c82795cf7"},
    {"espn_id": "3185",   "name": "UC Merced",       "team_id": "016dd7eb-894d-4e69-8c00-16cdc42f5eec"},
]


def scrape_team(conn, team: dict, level_id: str) -> dict:
    """Full ESPN scrape for one team, linking to existing DB records."""
    espn_id = team["espn_id"]
    team_id = team["team_id"]
    name = team["name"]
    log.info(f"Scraping: {name} (ESPN #{espn_id})")

    team_season_id = db.upsert_team_season(conn, team_id, SEASON)
    conn.commit()

    # Fetch roster for height/weight
    roster_bio = fetch_roster(conn, espn_id)
    log.info(f"  Roster bio: {len(roster_bio)} players")

    # Get schedule
    schedule = get_schedule(conn, espn_id)
    log.info(f"  Schedule: {len(schedule)} completed games")

    games_scraped = 0
    pgs_created = 0
    player_pts_map: dict[str, str] = {}

    for game in schedule:
        box = parse_box_score(conn, game["game_id"])
        if not box or len(box["teams"]) < 2:
            continue

        # Determine which side is our team
        t0 = box["teams"][0].lower()
        t1 = box["teams"][1].lower()
        tn = name.lower()

        if tn in t0 or t0 in tn:
            our_idx = 0
        elif tn in t1 or t1 in tn:
            our_idx = 1
        else:
            tn_words = set(tn.split())
            t0_overlap = len(tn_words & set(t0.split()))
            t1_overlap = len(tn_words & set(t1.split()))
            our_idx = 0 if t0_overlap >= t1_overlap else 1

        opp_idx = 1 - our_idx

        # Home/away
        is_home = game["home_team"] and name.lower() in game["home_team"].lower()

        # Upsert opponent as a generic team (may already exist)
        import re
        opp_name = box["teams"][opp_idx]
        opp_slug = f"espn-opp-{re.sub(r'[^a-z0-9]', '', opp_name.lower())}"
        opp_team_id = db.upsert_team(
            conn, opp_name, opp_slug, conference_id=None,
            competitive_level_id=level_id,
        )
        opp_team_season_id = db.upsert_team_season(conn, opp_team_id, SEASON)

        # Upsert game
        if is_home:
            home_ts_id = team_season_id
            away_ts_id = opp_team_season_id
        else:
            home_ts_id = opp_team_season_id
            away_ts_id = team_season_id

        game_db_id = db.upsert_game(
            conn, f"espn-{game['game_id']}", SEASON, game["date"],
            home_ts_id, away_ts_id,
            game["home_score"], game["away_score"],
            neutral_site=game.get("neutral", False),
        )

        # Our player stats
        for p in box["players"][our_idx]:
            p_name = p["name"]
            pts_id = player_pts_map.get(p_name)
            if not pts_id:
                bio = roster_bio.get(p_name, {})
                player_id = db.upsert_player(
                    conn, p_name,
                    positions=[p["position"]] if p.get("position") else None,
                    height_inches=bio.get("height_inches"),
                    weight_lbs=bio.get("weight_lbs"),
                )
                pts_id = db.upsert_player_team_season(conn, player_id, team_season_id)
                player_pts_map[p_name] = pts_id

            db.upsert_player_game_stats(conn, game_db_id, pts_id, p)
            pgs_created += 1

        # Opponent player stats
        opp_pts_map: dict[str, str] = {}
        for p in box["players"][opp_idx]:
            p_name = p["name"]
            pts_id = opp_pts_map.get(p_name)
            if not pts_id:
                player_id = db.upsert_player(
                    conn, p_name,
                    positions=[p["position"]] if p.get("position") else None,
                )
                pts_id = db.upsert_player_team_season(conn, player_id, opp_team_season_id)
                opp_pts_map[p_name] = pts_id

            db.upsert_player_game_stats(conn, game_db_id, pts_id, p)
            pgs_created += 1

        db.update_game_possessions(conn, game_db_id)
        conn.commit()
        games_scraped += 1

    log.info(f"  Done: {games_scraped} games, {pgs_created} player-game-stats, {len(player_pts_map)} players")
    return {"games": games_scraped, "pgs": pgs_created, "players": len(player_pts_map)}


def main():
    dry_run = "--dry-run" in sys.argv

    conn = db.get_conn()
    try:
        level_id = db.get_competitive_level_id(conn, "ncaa_d2")

        total = {"games": 0, "pgs": 0, "players": 0}
        for i, team in enumerate(TEAMS):
            log.info(f"\n[{i+1}/{len(TEAMS)}] {team['name']}")
            if dry_run:
                log.info("  (dry run — skipping)")
                continue
            result = scrape_team(conn, team, level_id)
            total["games"] += result["games"]
            total["pgs"] += result["pgs"]
            total["players"] += result["players"]

        conn.commit()
        log.info(f"\n{'='*60}")
        log.info(f"  DONE — {total['games']} games, {total['pgs']} player-game-stats, {total['players']} players")
        log.info(f"{'='*60}")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
