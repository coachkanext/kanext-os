"""
Scrape 3 missing NCAA D2 teams from their Sidearm Sports websites.

Middle Georgia, Point Park, Roosevelt — all have Sidearm-powered box scores
but no ESPN game data for 2025-26.

Parses HTML box score tables:
  Columns: ##, Player, GS, MIN, FG (M-A), 3PT (M-A), FT (M-A), ORB-DRB, REB, PF, A, TO, BLK, STL, PTS

Usage:
    python3 sidearm_d2_scraper.py           # scrape all 3
    python3 sidearm_d2_scraper.py --test 1  # first team only
    python3 sidearm_d2_scraper.py --dry-run # preview only
"""
from __future__ import annotations

import re
import sys
import time
import logging

import httpx

import db
from config import SEASON

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("sidearm_d2")

DELAY = 2.0  # seconds between requests

TEAMS = [
    {
        "name": "Middle Georgia",
        "team_id": "d2f2690b-35c4-4e6c-94e4-fb99d6b71d79",
        "base_url": "https://mgaknights.com",
        "schedule_path": "/sports/mens-basketball/schedule",
    },
    {
        "name": "Point Park",
        "team_id": "1b054d59-3bd9-4e6e-8ffe-2fd893f108d9",
        "base_url": "https://pointparksports.com",
        "schedule_path": "/sports/mens-basketball/schedule",
    },
    {
        "name": "Roosevelt",
        "team_id": "79b99c60-d292-4f2c-bf02-0c5c82795cf7",
        "base_url": "https://rooseveltlakers.com",
        "schedule_path": "/sports/mens-basketball/schedule",
    },
]


def fetch_html(client: httpx.Client, url: str) -> str | None:
    """Fetch HTML with rate limiting."""
    time.sleep(DELAY)
    try:
        r = client.get(url, follow_redirects=True, timeout=60)
        if r.status_code != 200:
            log.warning(f"HTTP {r.status_code}: {url}")
            return None
        return r.text
    except Exception as e:
        log.error(f"Request failed: {url} — {e}")
        return None


def get_box_score_urls(client: httpx.Client, base_url: str, schedule_path: str) -> list[str]:
    """Get all box score URLs from schedule page."""
    html = fetch_html(client, base_url + schedule_path)
    if not html:
        return []

    # Find box score links
    paths = set(re.findall(
        r'href="(/sports/mens-basketball/stats/2025-26/[^"]*boxscore/\d+)"', html
    ))
    urls = sorted([base_url + p for p in paths])
    return urls


def parse_made_att(s: str) -> tuple[int, int]:
    """Parse 'M-A' format, e.g. '3-6' -> (3, 6)."""
    m = re.match(r"(\d+)-(\d+)", s.strip())
    if m:
        return int(m.group(1)), int(m.group(2))
    return 0, 0


def safe_int(s: str) -> int:
    try:
        return int(s.strip())
    except (ValueError, AttributeError):
        return 0


def parse_box_score(client: httpx.Client, url: str, team_name: str) -> dict | None:
    """Parse a Sidearm box score HTML page.

    Returns dict with keys: home_players, away_players, home_team, away_team,
    home_score, away_score, game_date, our_side.
    """
    html = fetch_html(client, url)
    if not html:
        return None

    # Extract game date from page
    # Sidearm typically has date in a specific element
    date_match = re.search(
        r'(\w+ \d{1,2}, \d{4})', html[:10000]
    )
    game_date = None
    if date_match:
        from datetime import datetime
        try:
            game_date = datetime.strptime(date_match.group(1), "%B %d, %Y").strftime("%Y-%m-%d")
        except ValueError:
            try:
                game_date = datetime.strptime(date_match.group(1), "%b %d, %Y").strftime("%Y-%m-%d")
            except ValueError:
                pass

    # Extract final score
    # Look for score in the page — Sidearm shows "Team1 XX, Team2 YY" or similar
    score_match = re.search(
        r'<title[^>]*>([^<]*)</title>', html
    )
    title = score_match.group(1) if score_match else ""

    # Find all stat tables with player rows
    # Columns: ##, Player, GS, MIN, FG, 3PT, FT, ORB-DRB, REB, PF, A, TO, BLK, STL, PTS
    tables = re.findall(r'<table[^>]*>(.*?)</table>', html, re.S)

    team_stats = []  # list of (team_header, players_list)

    for table in tables:
        headers = re.findall(r'<th[^>]*>(.*?)</th>', table, re.S)
        headers_text = [re.sub(r'<[^>]+>', '', h).strip() for h in headers]

        if 'MIN' not in headers_text or 'PTS' not in headers_text:
            continue

        # This is a player stats table
        rows = re.findall(r'<tr[^>]*>(.*?)</tr>', table, re.S)
        players = []

        for row in rows:
            cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.S)
            cells_text = [re.sub(r'<[^>]+>', '', c).strip() for c in cells]

            if len(cells_text) < 14:
                continue

            # Skip totals row
            if 'Totals' in cells_text[1] or 'TOTALS' in cells_text[1] or 'Team' in cells_text[1]:
                continue

            # Columns: ##(0), Player(1), GS(2), MIN(3), FG(4), 3PT(5), FT(6),
            #          ORB-DRB(7), REB(8), PF(9), A(10), TO(11), BLK(12), STL(13), PTS(14)
            try:
                jersey = cells_text[0].strip()
                # Player name: "## Name, First" or "Name, First" — clean jersey prefix
                raw_name = cells_text[1].strip()
                # Remove leading jersey number from name
                raw_name = re.sub(r'^\d+\s+', '', raw_name)

                # Convert "Last, First" to "First Last"
                if ',' in raw_name:
                    parts = raw_name.split(',', 1)
                    name = f"{parts[1].strip()} {parts[0].strip()}"
                else:
                    name = raw_name

                started = cells_text[2].strip() == '*'
                minutes = safe_int(cells_text[3])
                fgm, fga = parse_made_att(cells_text[4])
                tpm, tpa = parse_made_att(cells_text[5])
                ftm, fta = parse_made_att(cells_text[6])

                # ORB-DRB
                orb_drb = cells_text[7]
                orb, drb = parse_made_att(orb_drb)

                reb = safe_int(cells_text[8])
                pf = safe_int(cells_text[9])
                ast = safe_int(cells_text[10])
                tov = safe_int(cells_text[11])
                blk = safe_int(cells_text[12])
                stl = safe_int(cells_text[13])
                pts = safe_int(cells_text[14]) if len(cells_text) > 14 else fgm * 2 + tpm + ftm

                players.append({
                    "name": name,
                    "jersey": jersey,
                    "started": started,
                    "minutes": minutes,
                    "pts": pts,
                    "fgm": fgm, "fga": fga,
                    "three_pm": tpm, "three_pa": tpa,
                    "ftm": ftm, "fta": fta,
                    "oreb": orb, "dreb": drb, "reb": reb,
                    "ast": ast, "stl": stl, "blk": blk,
                    "turnovers": tov, "pf": pf,
                    "position": "",
                })
            except (IndexError, ValueError) as e:
                continue

        if players:
            team_stats.append(players)

    if len(team_stats) < 2:
        log.warning(f"  Could not find 2 team tables in {url}")
        return None

    # Determine which table is our team (table 0 = home, table 1 = away typically)
    # The first table is usually the first team listed in the title
    # For Sidearm, the host team's box score page lists themselves first
    our_side = 0  # home team by default (host site lists themselves first)

    # Calculate team scores from player points
    team0_pts = sum(p["pts"] for p in team_stats[0])
    team1_pts = sum(p["pts"] for p in team_stats[1])

    return {
        "game_date": game_date,
        "our_players": team_stats[our_side],
        "opp_players": team_stats[1 - our_side],
        "our_score": team0_pts if our_side == 0 else team1_pts,
        "opp_score": team1_pts if our_side == 0 else team0_pts,
        "url": url,
    }


def scrape_team(conn, client: httpx.Client, team: dict, level_id: str) -> dict:
    """Full scrape for one Sidearm team."""
    name = team["name"]
    team_id = team["team_id"]
    log.info(f"Scraping: {name}")

    team_season_id = db.upsert_team_season(conn, team_id, SEASON)
    conn.commit()

    # Get box score URLs
    urls = get_box_score_urls(client, team["base_url"], team["schedule_path"])
    log.info(f"  Found {len(urls)} box score URLs")

    games_scraped = 0
    pgs_created = 0
    player_pts_map: dict[str, str] = {}

    for i, url in enumerate(urls):
        result = parse_box_score(client, url, name)
        if not result:
            continue

        # Create opponent team
        opp_slug = f"sidearm-opp-{re.sub(r'[^a-z0-9]', '', url.split('/')[-3])}"
        opp_name_raw = url.split('/')[-3].replace('-', ' ').title()
        opp_team_id = db.upsert_team(
            conn, opp_name_raw, opp_slug, conference_id=None,
            competitive_level_id=level_id,
        )
        opp_team_season_id = db.upsert_team_season(conn, opp_team_id, SEASON)

        # Create game
        game_key = f"sidearm-{team_id[:8]}-{url.split('/')[-1]}"
        game_db_id = db.upsert_game(
            conn, game_key, SEASON, result["game_date"],
            team_season_id,  # home (our team)
            opp_team_season_id,  # away (opponent)
            result["our_score"], result["opp_score"],
        )

        # Insert our player stats
        for p in result["our_players"]:
            p_name = p["name"]
            pts_id = player_pts_map.get(p_name)
            if not pts_id:
                player_id = db.upsert_player(
                    conn, p_name,
                    positions=[p["position"]] if p.get("position") else None,
                )
                pts_id = db.upsert_player_team_season(conn, player_id, team_season_id)
                player_pts_map[p_name] = pts_id

            db.upsert_player_game_stats(conn, game_db_id, pts_id, p)
            pgs_created += 1

        # Insert opponent player stats
        opp_pts_map: dict[str, str] = {}
        for p in result["opp_players"]:
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

        if (i + 1) % 10 == 0:
            log.info(f"  [{i+1}/{len(urls)}] {games_scraped} games, {pgs_created} pgs")

    log.info(f"  Done: {games_scraped} games, {pgs_created} pgs, {len(player_pts_map)} players")
    return {"games": games_scraped, "pgs": pgs_created, "players": len(player_pts_map)}


def main():
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    test_n = None
    for i, a in enumerate(args):
        if a == "--test" and i + 1 < len(args):
            test_n = int(args[i + 1])

    teams = TEAMS[:test_n] if test_n else TEAMS

    conn = db.get_conn()
    client = httpx.Client(timeout=60)

    try:
        level_id = db.get_competitive_level_id(conn, "ncaa_d2")

        total = {"games": 0, "pgs": 0, "players": 0}
        for i, team in enumerate(teams):
            log.info(f"\n[{i+1}/{len(teams)}] {team['name']}")
            if dry_run:
                urls = get_box_score_urls(client, team["base_url"], team["schedule_path"])
                log.info(f"  Would scrape {len(urls)} box scores (dry run)")
                continue
            result = scrape_team(conn, client, team, level_id)
            total["games"] += result["games"]
            total["pgs"] += result["pgs"]
            total["players"] += result["players"]

        conn.commit()
        log.info(f"\n{'='*60}")
        log.info(f"  DONE — {total['games']} games, {total['pgs']} pgs, {total['players']} players")
        log.info(f"{'='*60}")
    finally:
        client.close()
        conn.close()


if __name__ == "__main__":
    main()
