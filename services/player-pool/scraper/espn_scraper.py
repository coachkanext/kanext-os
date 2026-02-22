"""
ESPN NCAA D1 Basketball Scraper
Uses ESPN's public JSON API to get full per-game box scores for all D1 teams.
No Akamai, no bot protection — clean JSON endpoints.

API endpoints:
  - Teams:    site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams?limit=500
  - Schedule: site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/{id}/schedule?season=2026
  - Box score: site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/summary?event={gameId}

Box score stat labels: MIN, PTS, FG (M-A), 3PT (M-A), FT (M-A), OREB, DREB, REB, AST, STL, BLK, TO, PF
"""
from __future__ import annotations

import re
import sys
import time
import logging

import httpx

import db
from config import SEASON, CRAWL_DELAY

ESPN_API = "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball"
ESPN_SEASON = "2026"  # ESPN uses end-year for season (2025-26 → 2026)
LEVEL_KEY = "ncaa_d1"
ASSOC_CODE = "ncaa"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("espn_scraper")

_last_request_time = 0.0


def fetch_json(url: str, conn, params: dict | None = None) -> dict | None:
    """Fetch JSON from ESPN API with rate limiting."""
    global _last_request_time
    elapsed = time.time() - _last_request_time
    if elapsed < CRAWL_DELAY:
        time.sleep(CRAWL_DELAY - elapsed)

    try:
        r = httpx.get(url, params=params, follow_redirects=True, timeout=60)
        _last_request_time = time.time()
        status = "success" if r.status_code == 200 else "failed"
        db.log_scrape(conn, str(r.url), status, r.status_code, None, 0)
        conn.commit()
        if r.status_code != 200:
            log.warning(f"HTTP {r.status_code}: {url}")
            return None
        return r.json()
    except Exception as e:
        _last_request_time = time.time()
        db.log_scrape(conn, url, "failed", 0, str(e), 0)
        conn.commit()
        log.error(f"Request failed: {url} — {e}")
        return None


# ── Team Discovery ──

def discover_teams(conn) -> list[dict]:
    """Discover all D1 teams from ESPN API."""
    log.info("Discovering NCAA D1 teams from ESPN API...")
    data = fetch_json(f"{ESPN_API}/teams", conn, params={"limit": "500"})
    if not data:
        return []

    teams = []
    for entry in data.get("sports", [{}])[0].get("leagues", [{}])[0].get("teams", []):
        t = entry.get("team", {})
        espn_id = t.get("id")
        name = t.get("displayName", "")
        slug = t.get("slug", "")
        if espn_id and name:
            teams.append({
                "espn_id": espn_id,
                "name": name,
                "slug": slug,
                "abbreviation": t.get("abbreviation", ""),
            })

    log.info(f"Found {len(teams)} D1 teams")
    return teams


# ── Schedule ──

def get_schedule(conn, espn_team_id: str) -> list[dict]:
    """Get all completed games for a team this season."""
    data = fetch_json(
        f"{ESPN_API}/teams/{espn_team_id}/schedule",
        conn,
        params={"season": ESPN_SEASON},
    )
    if not data:
        return []

    games = []
    for event in data.get("events", []):
        # Only completed games
        status = event.get("competitions", [{}])[0].get("status", {}).get("type", {}).get("name", "")
        if status != "STATUS_FINAL":
            continue

        game_id = event.get("id")
        date_str = event.get("date", "")[:10]  # "2025-11-04T01:00Z" → "2025-11-04"

        # Parse competitors
        comp = event.get("competitions", [{}])[0]
        competitors = comp.get("competitors", [])
        home_team = away_team = None
        home_score = away_score = 0
        for c in competitors:
            if c.get("homeAway") == "home":
                home_team = c.get("team", {}).get("displayName", "")
                home_score = int(c.get("score", {}).get("value", 0) if isinstance(c.get("score"), dict) else c.get("score", 0))
            else:
                away_team = c.get("team", {}).get("displayName", "")
                away_score = int(c.get("score", {}).get("value", 0) if isinstance(c.get("score"), dict) else c.get("score", 0))

        neutral = comp.get("neutralSite", False)

        games.append({
            "game_id": str(game_id),
            "date": date_str,
            "home_team": home_team,
            "away_team": away_team,
            "home_score": home_score,
            "away_score": away_score,
            "neutral": neutral,
        })

    return games


# ── Box Score Parsing ──

def _parse_made_att(s: str) -> tuple[int, int]:
    """Parse 'M-A' format, e.g. '3-6' → (3, 6)."""
    m = re.match(r"(\d+)-(\d+)", s.strip())
    if m:
        return int(m.group(1)), int(m.group(2))
    return 0, 0


def _safe_int(s: str) -> int:
    try:
        return int(s.strip())
    except (ValueError, AttributeError):
        return 0


def parse_box_score(conn, game_id: str) -> dict | None:
    """
    Fetch and parse a box score from ESPN API.
    Returns dict with team1_players, team2_players, team names, scores.
    """
    data = fetch_json(f"{ESPN_API}/summary", conn, params={"event": game_id})
    if not data:
        return None

    bs = data.get("boxscore", {})
    player_groups = bs.get("players", [])

    if len(player_groups) < 2:
        return None

    result = {
        "teams": [],
        "players": [[], []],
    }

    for i, group in enumerate(player_groups[:2]):
        team_info = group.get("team", {})
        team_name = team_info.get("displayName", f"Team{i+1}")
        result["teams"].append(team_name)

        stats_blocks = group.get("statistics", [])
        if not stats_blocks:
            continue

        # First stats block has the main box score
        block = stats_blocks[0]
        labels = [l.upper() for l in block.get("labels", [])]

        for athlete_entry in block.get("athletes", []):
            athlete = athlete_entry.get("athlete", {})
            name = athlete.get("displayName", "")
            position = athlete.get("position", {}).get("abbreviation", "")
            starter = athlete_entry.get("starter", False)
            stat_values = athlete_entry.get("stats", [])

            if not name or not stat_values:
                continue

            # Build stat dict by label index
            stat_map = {}
            for j, label in enumerate(labels):
                if j < len(stat_values):
                    stat_map[label] = stat_values[j]

            # Parse stats
            minutes = _safe_int(stat_map.get("MIN", "0"))
            pts = _safe_int(stat_map.get("PTS", "0"))
            fgm, fga = _parse_made_att(stat_map.get("FG", "0-0"))
            tpm, tpa = _parse_made_att(stat_map.get("3PT", "0-0"))
            ftm, fta = _parse_made_att(stat_map.get("FT", "0-0"))
            oreb = _safe_int(stat_map.get("OREB", "0"))
            dreb = _safe_int(stat_map.get("DREB", "0"))
            reb = _safe_int(stat_map.get("REB", "0"))
            ast = _safe_int(stat_map.get("AST", "0"))
            stl = _safe_int(stat_map.get("STL", "0"))
            blk = _safe_int(stat_map.get("BLK", "0"))
            turnovers = _safe_int(stat_map.get("TO", "0"))
            pf = _safe_int(stat_map.get("PF", "0"))

            result["players"][i].append({
                "name": name,
                "position": position,
                "started": starter,
                "minutes": minutes,
                "pts": pts,
                "fgm": fgm, "fga": fga,
                "three_pm": tpm, "three_pa": tpa,
                "ftm": ftm, "fta": fta,
                "oreb": oreb, "dreb": dreb, "reb": reb,
                "ast": ast, "stl": stl, "blk": blk,
                "turnovers": turnovers, "pf": pf,
            })

    return result


# ── Database Loading ──

def scrape_team(conn, team_info: dict, level_id: str, division_id: str) -> dict:
    """Full scrape pipeline for one ESPN team."""
    name = team_info["name"]
    espn_id = team_info["espn_id"]
    slug = f"espn-{espn_id}"
    log.info(f"Scraping team: {name} (ESPN #{espn_id})")

    # Upsert team
    team_id = db.upsert_team(
        conn, name, slug, conference_id=None,
        competitive_level_id=level_id,
        base_url=f"https://www.espn.com/mens-college-basketball/team/_/id/{espn_id}",
    )
    team_season_id = db.upsert_team_season(conn, team_id, SEASON)
    conn.commit()

    # Get schedule
    schedule = get_schedule(conn, espn_id)
    log.info(f"  Schedule: {len(schedule)} completed games")

    games_scraped = 0
    pgs_created = 0
    player_pts_map: dict[str, str] = {}  # name → player_team_season_id

    for game in schedule:
        box = parse_box_score(conn, game["game_id"])
        if not box or len(box["teams"]) < 2:
            continue

        # Determine if our team is team 0 or 1 in box score
        t0 = box["teams"][0].lower()
        t1 = box["teams"][1].lower()
        tn = name.lower()

        if tn in t0 or t0 in tn:
            our_idx = 0
        elif tn in t1 or t1 in tn:
            our_idx = 1
        else:
            # Word overlap fallback
            tn_words = set(tn.split())
            t0_overlap = len(tn_words & set(t0.split()))
            t1_overlap = len(tn_words & set(t1.split()))
            our_idx = 0 if t0_overlap >= t1_overlap else 1

        opp_idx = 1 - our_idx

        # Determine home/away
        is_home = game["home_team"] and name.lower() in game["home_team"].lower()

        # Upsert opponent
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


# ── Full Pipeline ──

def scrape_all(conn, limit: int | None = None):
    """Scrape all D1 teams via ESPN API."""
    teams = discover_teams(conn)
    if not teams:
        return

    if limit:
        teams = teams[:limit]

    level_id = db.get_competitive_level_id(conn, LEVEL_KEY)
    division_id = db.get_division_id(conn, ASSOC_CODE, "d1")

    stats = {"teams": 0, "games": 0, "player_game_stats": 0}
    for i, team in enumerate(teams):
        log.info(f"\n[{i+1}/{len(teams)}] {team['name']}")
        try:
            result = scrape_team(conn, team, level_id, division_id)
            stats["teams"] += 1
            stats["games"] += result["games"]
            stats["player_game_stats"] += result["player_game_stats"]
        except Exception as e:
            log.error(f"Error scraping {team['name']}: {e}")
            conn.rollback()
            continue

    return stats


def print_summary(conn, label: str = "ESPN NCAA D1"):
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


# ── Entry point ──

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "one"

    conn = db.get_conn()
    try:
        if mode == "all":
            log.info(f"\n{'='*60}")
            log.info(f"  ESPN NCAA D1 — FULL SCRAPE")
            log.info(f"{'='*60}")
            scrape_all(conn)
            conn.commit()
            print_summary(conn)

        elif mode == "one":
            log.info("Test mode: scraping 1 team")
            scrape_all(conn, limit=1)
            conn.commit()
            print_summary(conn, "ESPN NCAA D1 TEST")

        elif mode == "five":
            log.info("Test mode: scraping 5 teams")
            scrape_all(conn, limit=5)
            conn.commit()
            print_summary(conn, "ESPN NCAA D1 TEST")

        else:
            print("Usage: python3 espn_scraper.py [one|five|all]")
            sys.exit(1)

    finally:
        conn.close()


if __name__ == "__main__":
    main()
