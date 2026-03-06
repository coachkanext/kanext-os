"""
NCAA D2/D3 Basketball Scraper — uses ncaa-api.henrygd.me
Fetches real per-game box scores via the NCAA public API proxy.

Strategy (team-based batch mode):
  1. Fetch all game dates for the season from /schedule-alt
  2. For each date, fetch scoreboard and cache it
  3. For each team in the batch, find their games from cached scoreboards
  4. Fetch box scores for each game

Usage: python3 ncaa_api_scraper.py <batch_file.txt> [d2|d3]

Batch file format (one team per line):
  seo_slug|Team Name
"""
from __future__ import annotations

import re
import sys
import time
import logging

import httpx

import db
from config import SEASON

NCAA_API = "https://ncaa-api.henrygd.me"
CRAWL_DELAY = 0.25  # 5 req/s rate limit → 200ms min, use 250ms for safety

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("ncaa_api")

_last_request_time = 0.0


def fetch_json(url: str) -> dict | None:
    """Fetch JSON from NCAA API with rate limiting."""
    global _last_request_time
    elapsed = time.time() - _last_request_time
    if elapsed < CRAWL_DELAY:
        time.sleep(CRAWL_DELAY - elapsed)

    try:
        r = httpx.get(url, follow_redirects=True, timeout=60)
        _last_request_time = time.time()
        log.info(f"HTTP Request: GET {url} \"{r.status_code}\"")
        if r.status_code == 200:
            return r.json()
        return None
    except Exception as e:
        _last_request_time = time.time()
        log.error(f"Request failed: {url} — {e}")
        return None


def _safe_int(s) -> int:
    try:
        return int(str(s).strip())
    except (ValueError, AttributeError, TypeError):
        return 0


def _safe_float(s) -> float:
    try:
        return float(str(s).strip())
    except (ValueError, AttributeError, TypeError):
        return 0.0


# ── Step 1: Get all game dates ──

def get_game_dates(division: str) -> list[str]:
    """Fetch all dates that have games for the season. Returns list of 'YYYY/MM/DD'."""
    url = f"{NCAA_API}/schedule-alt/basketball-men/{division}/2026"
    data = fetch_json(url)
    if not data:
        return []

    dates = []
    games = data.get("data", {}).get("schedules", {}).get("games", [])
    for g in games:
        date_str = g.get("contestDate", "")  # "11/14/2025"
        if not date_str:
            continue
        parts = date_str.split("/")
        if len(parts) == 3:
            mm, dd, yyyy = parts
            dates.append(f"{yyyy}/{mm.zfill(2)}/{dd.zfill(2)}")

    log.info(f"  Found {len(dates)} game dates for {division}")
    return dates


# ── Step 2: Fetch and cache all scoreboards ──

def fetch_all_scoreboards(division: str, dates: list[str]) -> dict[str, list[dict]]:
    """Fetch scoreboard for each date. Returns {date: [games]}."""
    scoreboards = {}
    for i, date in enumerate(dates):
        if (i + 1) % 20 == 0:
            log.info(f"  Fetching scoreboards: {i+1}/{len(dates)}")
        url = f"{NCAA_API}/scoreboard/basketball-men/{division}/{date}"
        data = fetch_json(url)
        if data and "games" in data:
            scoreboards[date] = data["games"]
    log.info(f"  Cached {len(scoreboards)} scoreboards with {sum(len(g) for g in scoreboards.values())} total games")
    return scoreboards


# ── Step 3: Find games for a specific team ──

def find_team_games(team_slug: str, scoreboards: dict[str, list[dict]]) -> list[dict]:
    """Find all games for a team from cached scoreboards."""
    games = []
    seen_ids = set()
    for date, day_games in scoreboards.items():
        for entry in day_games:
            game = entry.get("game", {})
            game_id = game.get("gameID")
            if not game_id or game_id in seen_ids:
                continue

            state = game.get("gameState", "")
            if state != "final":
                continue

            home_seo = game.get("home", {}).get("names", {}).get("seo", "")
            away_seo = game.get("away", {}).get("names", {}).get("seo", "")

            if home_seo == team_slug or away_seo == team_slug:
                seen_ids.add(game_id)
                is_home = home_seo == team_slug
                games.append({
                    "game_id": game_id,
                    "date": date.replace("/", "-"),  # YYYY-MM-DD
                    "home_team": game.get("home", {}).get("names", {}).get("short", ""),
                    "away_team": game.get("away", {}).get("names", {}).get("short", ""),
                    "home_score": _safe_int(game.get("home", {}).get("score", 0)),
                    "away_score": _safe_int(game.get("away", {}).get("score", 0)),
                    "home_seo": home_seo,
                    "away_seo": away_seo,
                    "is_home": is_home,
                })
    return games


# ── Step 4: Fetch and parse box score ──

def parse_box_score(game_id: str) -> dict | None:
    """Fetch and parse a box score from NCAA API."""
    url = f"{NCAA_API}/game/{game_id}/boxscore"
    data = fetch_json(url)
    if not data:
        return None

    teams_info = data.get("teams", [])
    team_boxscores = data.get("teamBoxscore", [])

    if len(teams_info) < 2 or len(team_boxscores) < 2:
        return None

    result = {
        "teams": [],
        "seo_names": [],
        "players": [[], []],
    }

    for i, team in enumerate(teams_info[:2]):
        result["teams"].append(team.get("nameShort", f"Team{i+1}"))
        result["seo_names"].append(team.get("seoname", ""))

    for i, tb in enumerate(team_boxscores[:2]):
        for p in tb.get("playerStats", []):
            first = p.get("firstName", "")
            last = p.get("lastName", "")
            name = f"{first} {last}".strip()
            if not name:
                continue

            minutes_raw = p.get("minutesPlayed", "0")
            minutes = round(_safe_float(minutes_raw))

            oreb = _safe_int(p.get("offensiveRebounds", 0))
            reb = _safe_int(p.get("totalRebounds", 0))
            dreb = reb - oreb  # DREB not broken out separately

            result["players"][i].append({
                "name": name,
                "position": p.get("position", ""),
                "started": p.get("starter", False),
                "minutes": minutes,
                "pts": _safe_int(p.get("points", 0)),
                "fgm": _safe_int(p.get("fieldGoalsMade", 0)),
                "fga": _safe_int(p.get("fieldGoalsAttempted", 0)),
                "three_pm": _safe_int(p.get("threePointsMade", 0)),
                "three_pa": _safe_int(p.get("threePointsAttempted", 0)),
                "ftm": _safe_int(p.get("freeThrowsMade", 0)),
                "fta": _safe_int(p.get("freeThrowsAttempted", 0)),
                "oreb": oreb,
                "dreb": dreb,
                "reb": reb,
                "ast": _safe_int(p.get("assists", 0)),
                "stl": _safe_int(p.get("steals", 0)),
                "blk": _safe_int(p.get("blockedShots", 0)),
                "turnovers": _safe_int(p.get("turnovers", 0)),
                "pf": _safe_int(p.get("personalFouls", 0)),
            })

    return result


# ── Step 5: Scrape one team ──

def scrape_team(conn, team_slug: str, team_name: str,
                scoreboards: dict, level_id: str, division_id: str,
                level_key: str) -> dict:
    """Full scrape pipeline for one NCAA D2/D3 team."""
    log.info(f"Scraping team: {team_name} ({team_slug})")

    # Find games from cached scoreboards
    games = find_team_games(team_slug, scoreboards)
    log.info(f"  Schedule: {len(games)} completed games")

    # Upsert team
    slug_db = f"ncaa-{level_key}-{team_slug}"
    team_id = db.upsert_team(
        conn, team_name, slug_db, conference_id=None,
        competitive_level_id=level_id,
    )
    team_season_id = db.upsert_team_season(conn, team_id, SEASON)
    conn.commit()

    games_scraped = 0
    pgs_created = 0
    player_pts_map: dict[str, str] = {}

    for game in games:
        box = parse_box_score(game["game_id"])
        if not box or len(box["teams"]) < 2:
            continue

        # Determine which side is our team
        if len(box["seo_names"]) >= 2:
            if box["seo_names"][0] == team_slug:
                our_idx = 0
            elif box["seo_names"][1] == team_slug:
                our_idx = 1
            else:
                # Fallback to name matching
                t0 = box["teams"][0].lower()
                t1 = box["teams"][1].lower()
                tn = team_name.lower()
                our_idx = 0 if tn in t0 or t0 in tn else 1
        else:
            our_idx = 0

        opp_idx = 1 - our_idx
        is_home = game["is_home"]

        # Upsert opponent
        opp_name = box["teams"][opp_idx]
        opp_seo = box["seo_names"][opp_idx] if len(box["seo_names"]) > opp_idx else ""
        opp_slug = f"ncaa-{level_key}-{opp_seo}" if opp_seo else f"ncaa-{level_key}-opp-{re.sub(r'[^a-z0-9]', '', opp_name.lower())}"
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
            conn, f"ncaa-{game['game_id']}", SEASON, game["date"],
            home_ts_id, away_ts_id,
            game["home_score"], game["away_score"],
            neutral_site=False,
        )

        # Insert OUR player game stats
        for p in box["players"][our_idx]:
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

        # Insert OPPONENT player game stats
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

        # Update game possessions
        db.update_game_possessions(conn, game_db_id)
        conn.commit()
        games_scraped += 1

    log.info(f"  Loaded: {games_scraped} games, {pgs_created} player-game-stat rows")
    return {"games": games_scraped, "player_game_stats": pgs_created}


def print_summary(conn, label: str):
    """Print final summary."""
    with conn.cursor() as cur:
        cur.execute("SELECT count(*) AS n FROM teams")
        total_teams = cur.fetchone()["n"]
        cur.execute("SELECT count(*) AS n FROM players")
        total_players = cur.fetchone()["n"]
        cur.execute("SELECT count(*) AS n FROM games")
        total_games = cur.fetchone()["n"]
        cur.execute("SELECT count(*) AS n FROM player_game_stats")
        total_pgs = cur.fetchone()["n"]

    print("\n" + "=" * 60)
    print(f"  {label} — FINAL SUMMARY")
    print("=" * 60)
    print(f"  Total teams:                {total_teams}")
    print(f"  Total players:              {total_players}")
    print(f"  Total games:                {total_games}")
    print(f"  Total player_game_stats:    {total_pgs}")
    print("=" * 60)


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 ncaa_api_scraper.py <batch_file.txt> [d2|d3]")
        sys.exit(1)

    batch_file = sys.argv[1]
    division = sys.argv[2] if len(sys.argv) > 2 else "d2"

    if division == "d2":
        level_key = "ncaa_d2"
        assoc_code = "ncaa"
        div_code = "d2"
    elif division == "d3":
        level_key = "ncaa_d3"
        assoc_code = "ncaa"
        div_code = "d3"
    else:
        print(f"Unknown division: {division}")
        sys.exit(1)

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
            teams.append({"slug": slug, "name": name})

    log.info(f"Batch: {len(teams)} NCAA {division.upper()} teams")

    conn = db.get_conn()
    try:
        level_id = db.get_competitive_level_id(conn, level_key)
        division_id = db.get_division_id(conn, assoc_code, div_code)

        # Step 1+2: Fetch and cache all scoreboards
        log.info(f"Fetching all {division.upper()} scoreboards for the season...")
        dates = get_game_dates(division)
        scoreboards = fetch_all_scoreboards(division, dates)

        # Step 3-5: Scrape each team
        stats = {"teams": 0, "games": 0, "pgs": 0}
        for i, team in enumerate(teams):
            log.info(f"\n[{i+1}/{len(teams)}] {team['name']}")
            try:
                result = scrape_team(
                    conn, team["slug"], team["name"],
                    scoreboards, level_id, division_id, level_key,
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
        print_summary(conn, f"NCAA {division.upper()} BATCH")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
