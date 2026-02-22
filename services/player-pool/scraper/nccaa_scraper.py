"""
NCCAA Scraper — Sidearm Sports (thenccaa.org)
Discovers teams, extracts player season stats + game logs via JSON API,
loads to PostgreSQL using shared db.py helpers.

Usage:
    python3 nccaa_scraper.py d1          # Scrape all NCCAA DI teams
    python3 nccaa_scraper.py d2          # Scrape all NCCAA DII teams
    python3 nccaa_scraper.py all         # Scrape both divisions
    python3 nccaa_scraper.py d1-one      # Test with one DI team
    python3 nccaa_scraper.py d2-one      # Test with one DII team
"""
from __future__ import annotations

import re
import sys
import time
import logging
from datetime import datetime

import httpx
from bs4 import BeautifulSoup

import db
from config import (
    SEASON, CRAWL_DELAY,
    NCCAA_BASE_URL, NCCAA_API_URL, NCCAA_SPORT_PATHS,
    NCCAA_DIV_TO_LEVEL_KEY, NCCAA_DIV_DISPLAY, NCCAA_YEAR,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("nccaa_scraper")

# Sidearm blocks default httpx User-Agent — must send a browser-like one
_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
}

# ── Rate limiting ──

_last_request_time = 0.0


def _rate_limit():
    """Enforce CRAWL_DELAY between requests."""
    global _last_request_time
    elapsed = time.time() - _last_request_time
    if elapsed < CRAWL_DELAY:
        time.sleep(CRAWL_DELAY - elapsed)
    _last_request_time = time.time()


def fetch_html(url: str, conn) -> str | None:
    """Fetch an HTML page with rate limiting and scrape logging."""
    _rate_limit()
    try:
        r = httpx.get(url, follow_redirects=True, timeout=60, headers=_HEADERS)
        db.log_scrape(conn, url, "success" if r.status_code == 200 else "failed",
                      r.status_code, None, 0)
        conn.commit()
        if r.status_code != 200:
            log.warning(f"HTTP {r.status_code}: {url}")
            return None
        return r.text
    except Exception as e:
        db.log_scrape(conn, url, "failed", 0, str(e), 0)
        conn.commit()
        log.error(f"Request failed: {url} — {e}")
        return None


def fetch_json(url: str, params: dict, conn) -> dict | None:
    """Fetch JSON from the Sidearm API with rate limiting and scrape logging."""
    _rate_limit()
    full_url = f"{url}?{'&'.join(f'{k}={v}' for k, v in params.items())}"
    try:
        r = httpx.get(url, params=params, follow_redirects=True, timeout=60, headers=_HEADERS)
        db.log_scrape(conn, full_url, "success" if r.status_code == 200 else "failed",
                      r.status_code, None, 0)
        conn.commit()
        if r.status_code != 200:
            log.warning(f"HTTP {r.status_code}: {full_url}")
            return None
        return r.json()
    except Exception as e:
        db.log_scrape(conn, full_url, "failed", 0, str(e), 0)
        conn.commit()
        log.error(f"Request failed: {full_url} — {e}")
        return None


# ── Team Discovery ──

def discover_teams(conn, division: str) -> list[dict]:
    """Discover all teams from the NCCAA overall stats page.

    Parses the HTML for links to /teamstats.aspx?path=...&school=SLUG
    and returns a list of {name, slug, division}.
    """
    sport_path = NCCAA_SPORT_PATHS[division]
    url = f"{NCCAA_BASE_URL}/stats.aspx?path={sport_path}&year={NCCAA_YEAR}"
    label = NCCAA_DIV_DISPLAY[division]
    log.info(f"Discovering {label} teams from {url}")

    html = fetch_html(url, conn)
    if not html:
        return []

    soup = BeautifulSoup(html, "lxml")
    teams = []
    seen_slugs = set()

    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "teamstats.aspx" not in href:
            continue
        m = re.search(r"school=([^&\"]+)", href)
        if not m:
            continue
        slug = m.group(1)
        if slug in seen_slugs:
            continue
        seen_slugs.add(slug)
        name = a.get_text(strip=True)
        if name:
            teams.append({"name": name, "slug": slug, "division": division})

    log.info(f"Found {len(teams)} teams in {label}")
    return teams


# ── Team ID Extraction ──

def get_sidearm_team_id(conn, slug: str, division: str) -> str | None:
    """Fetch the teamstats page and extract the Sidearm team_id from the
    embedded JavaScript AJAX call."""
    sport_path = NCCAA_SPORT_PATHS[division]
    url = f"{NCCAA_BASE_URL}/teamstats.aspx?path={sport_path}&year={NCCAA_YEAR}&school={slug}"

    html = fetch_html(url, conn)
    if not html:
        return None

    m = re.search(r"team_id:\s*'(\d+)'", html)
    if m:
        return m.group(1)

    log.warning(f"Could not find team_id for {slug} at {url}")
    return None


# ── JSON API Data Fetching ──

def fetch_team_data(conn, sidearm_team_id: str, division: str) -> dict | None:
    """Fetch full team data (players + games) from the Sidearm JSON API."""
    sport_path = NCCAA_SPORT_PATHS[division]
    return fetch_json(NCCAA_API_URL, {
        "method": "get_team_stats",
        "team_id": sidearm_team_id,
        "sport": sport_path,
        "year": NCCAA_YEAR,
        "conf": "False",
        "postseason": "False",
    }, conn)


# ── Stat Helpers ──

def safe_int(s) -> int:
    """Parse a string to int, returning 0 on failure."""
    try:
        return int(str(s).strip())
    except (ValueError, TypeError, AttributeError):
        return 0


def safe_float(s) -> float:
    """Parse a string to float, returning 0.0 on failure."""
    try:
        return float(str(s).strip())
    except (ValueError, TypeError, AttributeError):
        return 0.0


def parse_name(raw_name: str) -> str:
    """Convert 'Last,First' to 'First Last'. Pass through if no comma."""
    raw_name = raw_name.strip()
    if "," in raw_name:
        parts = raw_name.split(",", 1)
        last = parts[0].strip()
        first = parts[1].strip()
        return f"{first} {last}"
    return raw_name


def compute_per_game(total, games: int) -> float:
    """Compute per-game average, rounded to 1 decimal."""
    val = safe_float(total)
    if games > 0:
        return round(val / games, 1)
    return 0.0


def compute_season_stats_dict(player: dict) -> dict:
    """Build a player_season_stats dict from Sidearm player JSON."""
    s = player.get("stats_stats", {})
    gp = safe_int(s.get("games_played", player.get("games_played", 0)))
    gs = safe_int(player.get("games_started", 0))

    # Totals from the API
    minutes = safe_float(s.get("minutes_played", 0))
    pts = safe_int(s.get("points_scored", 0))
    reb = safe_int(s.get("total_rebounds", 0))
    oreb = safe_int(s.get("offensive_rebounds", 0))
    dreb = safe_int(s.get("defensive_rebounds", 0))
    ast = safe_int(s.get("assists", 0))
    stl = safe_int(s.get("steals", 0))
    blk = safe_int(s.get("blocked_shots", 0))
    to = safe_int(s.get("turnovers", 0))
    pf = safe_int(s.get("personal_fouls", 0))
    fga = safe_int(s.get("field_goals_attempted", 0))
    tpa = safe_int(s.get("three_points_attempted", 0))
    fta = safe_int(s.get("free_throws_attempted", 0))

    # Percentages — API provides these as strings like "0.43"
    fg_pct = safe_float(s.get("field_goals_pct", 0))
    three_pct = safe_float(s.get("three_points_pct", 0))
    ft_pct = safe_float(s.get("free_throws_pct", 0))

    # Per-game averages
    min_pg = compute_per_game(minutes, gp)
    pts_pg = compute_per_game(pts, gp)
    reb_pg = compute_per_game(reb, gp)
    oreb_pg = compute_per_game(oreb, gp)
    dreb_pg = compute_per_game(dreb, gp)
    ast_pg = compute_per_game(ast, gp)
    stl_pg = compute_per_game(stl, gp)
    blk_pg = compute_per_game(blk, gp)
    to_pg = compute_per_game(to, gp)
    pf_pg = compute_per_game(pf, gp)
    fga_pg = compute_per_game(fga, gp)
    tpa_pg = compute_per_game(tpa, gp)
    fta_pg = compute_per_game(fta, gp)

    # Usage rate approximation: (FGA + 0.44*FTA + TO) / (MIN/40 * team_poss) * 100
    # We approximate team_poss as 70 (typical college pace)
    usage = 0.0
    if min_pg > 5:
        usage = round((fga_pg + 0.44 * fta_pg + to_pg) / (min_pg / 40.0 * 70.0) * 100, 1)

    return {
        "games_played": gp,
        "games_started": gs,
        "minutes_per_game": min_pg,
        "pts_per_game": pts_pg,
        "reb_per_game": reb_pg,
        "ast_per_game": ast_pg,
        "stl_per_game": stl_pg,
        "blk_per_game": blk_pg,
        "to_per_game": to_pg,
        "fg_pct": round(fg_pct, 3),
        "three_pct": round(three_pct, 3),
        "ft_pct": round(ft_pct, 3),
        "oreb_per_game": oreb_pg,
        "dreb_per_game": dreb_pg,
        "fga_per_game": fga_pg,
        "three_pa_per_game": tpa_pg,
        "fta_per_game": fta_pg,
        "pf_per_game": pf_pg,
        "usage_rate": usage,
    }


def parse_game_date(date_str: str) -> str | None:
    """Parse date string like '11/14/2025' to YYYY-MM-DD."""
    date_str = (date_str or "").strip()
    m = re.match(r"(\d{1,2})/(\d{1,2})/(\d{4})", date_str)
    if m:
        return f"{m.group(3)}-{int(m.group(1)):02d}-{int(m.group(2)):02d}"
    return None


# ── Game Data Helpers ──

def build_team_game_stats(game: dict) -> dict:
    """Build a team_game_stats dict from Sidearm game JSON for OUR team."""
    fgm = safe_int(game.get("field_goals_made", 0))
    fga = safe_int(game.get("field_goals_a", 0))
    tpm = safe_int(game.get("three_point_made", 0))
    tpa = safe_int(game.get("three_pts_a", 0))
    ftm = safe_int(game.get("free_throws_made", 0))
    fta = safe_int(game.get("free_throws_a", 0))
    reb = safe_int(game.get("rebounds", 0))
    stl = safe_int(game.get("steals", 0))
    ast = safe_int(game.get("assists", 0))
    blk = safe_int(game.get("blocked_shots", 0))
    to = safe_int(game.get("turnovers", 0))
    pf = safe_int(game.get("personal_fouls", 0))
    pts = safe_int(game.get("own_score", 0))

    fg_pct = round(fgm / fga * 100, 1) if fga > 0 else None
    three_pct = round(tpm / tpa * 100, 1) if tpa > 0 else None
    ft_pct = round(ftm / fta * 100, 1) if fta > 0 else None

    return {
        "fgm": fgm, "fga": fga, "fg_pct": fg_pct,
        "three_pm": tpm, "three_pa": tpa, "three_pct": three_pct,
        "ftm": ftm, "fta": fta, "ft_pct": ft_pct,
        "oreb": 0, "dreb": 0, "reb": reb,
        "ast": ast, "stl": stl, "blk": blk,
        "turnovers": to, "pf": pf, "pts": pts,
    }


# ── Full Scrape Pipeline ──

def scrape_team(conn, team_info: dict, division: str):
    """Full scrape pipeline for one NCCAA team.

    1. Get Sidearm team_id from the teamstats page
    2. Fetch full data via JSON API
    3. Upsert team, team_season, players, player_team_seasons
    4. Insert player_season_stats (cumulative stats)
    5. Insert games + team_game_stats from the game log
    """
    name = team_info["name"]
    slug = team_info["slug"]
    log.info(f"Scraping team: {name} ({slug})")

    # Step 1: Get Sidearm team_id
    sidearm_id = get_sidearm_team_id(conn, slug, division)
    if not sidearm_id:
        log.warning(f"  Skipping {name}: could not resolve team_id")
        return {"roster": 0, "season_stats": 0, "games": 0}

    log.info(f"  Sidearm team_id: {sidearm_id}")

    # Step 2: Fetch team data via JSON API
    data = fetch_team_data(conn, sidearm_id, division)
    if not data:
        log.warning(f"  Skipping {name}: API returned no data")
        return {"roster": 0, "season_stats": 0, "games": 0}

    # Step 3: Upsert team + team_season
    level_key = NCCAA_DIV_TO_LEVEL_KEY[division]
    level_id = db.get_competitive_level_id(conn, level_key)
    division_id = db.get_division_id(conn, "nccaa", division)

    # Use nccaa- prefix for slug to avoid collisions with other associations
    db_slug = f"nccaa-{slug.replace(' ', '-').lower()}"
    sport_path = NCCAA_SPORT_PATHS[division]
    team_url = f"{NCCAA_BASE_URL}/teamstats.aspx?path={sport_path}&year={NCCAA_YEAR}&school={slug}"

    team_id = db.upsert_team(
        conn, name, db_slug, conference_id=None,
        competitive_level_id=level_id, base_url=team_url,
    )
    team_season_id = db.upsert_team_season(conn, team_id, SEASON)
    conn.commit()

    # Step 4: Process players
    players = data.get("players", [])
    player_pts_map = {}  # sidearm player key -> pts_id
    season_stats_count = 0
    roster_count = 0

    for p in players:
        raw_name = p.get("name", "")
        # Skip TEAM row
        if not raw_name or raw_name.upper() in ("TEAM", "TM", "TOTALS"):
            continue
        if p.get("uniform", "").upper() == "TM":
            continue

        player_name = parse_name(raw_name)
        position = p.get("position", "")
        # Sidearm uses "0" or "*" for unknown positions
        if position in ("0", "*", ""):
            position = None

        jersey = p.get("uniform", "")
        if jersey.upper() in ("TM", ""):
            jersey = None

        gp = safe_int(p.get("games_played", 0))

        # Upsert player
        positions = [position] if position else None
        player_id = db.upsert_player(conn, player_name, positions=positions)

        # Upsert player_team_season
        pts_id = db.upsert_player_team_season(
            conn, player_id, team_season_id,
            jersey_number=jersey,
            class_year=None,  # Sidearm "year" field is always "0"
            roster_status="active",
        )
        player_pts_map[raw_name] = pts_id
        roster_count += 1

        # Insert player_season_stats (only if player has games)
        if gp > 0:
            season_dict = compute_season_stats_dict(p)
            db.upsert_player_season_stats(conn, pts_id, season_dict)
            season_stats_count += 1

            # Also create N synthetic player_game_stats (one per game played)
            # so the KR engine can compute BPR with proper confidence.
            s = p.get("stats_stats", {})
            total_min = safe_float(s.get("minutes_played", 0))
            total_pts = safe_int(s.get("points_scored", 0))
            total_fgm = safe_int(s.get("field_goals_made", 0))
            total_fga = safe_int(s.get("field_goals_attempted", 0))
            total_tpm = safe_int(s.get("three_points_made", 0))
            total_tpa = safe_int(s.get("three_points_attempted", 0))
            total_ftm = safe_int(s.get("free_throws_made", 0))
            total_fta = safe_int(s.get("free_throws_attempted", 0))
            total_oreb = safe_int(s.get("offensive_rebounds", 0))
            total_dreb = safe_int(s.get("defensive_rebounds", 0))
            total_reb = safe_int(s.get("total_rebounds", 0))
            total_ast = safe_int(s.get("assists", 0))
            total_stl = safe_int(s.get("steals", 0))
            total_blk = safe_int(s.get("blocked_shots", 0))
            total_to = safe_int(s.get("turnovers", 0))
            total_pf = safe_int(s.get("personal_fouls", 0))

            avg_stats = {
                "started": safe_int(p.get("games_started", 0)) > 0,
                "minutes": round(total_min / gp, 1),
                "pts": round(total_pts / gp, 1),
                "fgm": round(total_fgm / gp, 1),
                "fga": round(total_fga / gp, 1),
                "three_pm": round(total_tpm / gp, 1),
                "three_pa": round(total_tpa / gp, 1),
                "ftm": round(total_ftm / gp, 1),
                "fta": round(total_fta / gp, 1),
                "oreb": round(total_oreb / gp, 1),
                "dreb": round(total_dreb / gp, 1),
                "reb": round(total_reb / gp, 1),
                "ast": round(total_ast / gp, 1),
                "stl": round(total_stl / gp, 1),
                "blk": round(total_blk / gp, 1),
                "turnovers": round(total_to / gp, 1),
                "pf": round(total_pf / gp, 1),
            }

            for g_idx in range(gp):
                syn_game_id = f"nccaa-syn-{sidearm_id}-{raw_name}-g{g_idx+1:02d}"
                syn_game_db_id = db.upsert_game(
                    conn, syn_game_id, SEASON, None,
                    team_season_id, None,
                    None, None,
                    game_type="SEASON_AVG",
                )
                db.upsert_player_game_stats(conn, syn_game_db_id, pts_id, avg_stats)

    conn.commit()
    log.info(f"  Roster: {roster_count} players, {season_stats_count} with season stats")

    # Step 5: Process games
    games = data.get("games", [])
    games_inserted = 0

    for g in games:
        game_id_raw = g.get("game_id", "")
        if not game_id_raw:
            continue

        # Build unique game ID: nccaa-{sidearm_team_code}-{game_id}
        game_key = f"nccaa-{sidearm_id}-{game_id_raw}"

        game_date = parse_game_date(g.get("date"))
        own_score = safe_int(g.get("own_score", 0))
        opp_score = safe_int(g.get("opp_score", 0))
        home_or_away = g.get("home_or_away", "H")
        neutral = g.get("neutral_game", "N") == "Y"
        is_conf = g.get("is_conf", False)
        venue = g.get("site")

        is_home = home_or_away == "H" or neutral

        if is_home:
            home_ts_id = team_season_id
            away_ts_id = None
            home_score = own_score
            away_score = opp_score
        else:
            home_ts_id = None
            away_ts_id = team_season_id
            home_score = opp_score
            away_score = own_score

        game_type = "CONF" if is_conf else "NON_CONF"

        game_db_id = db.upsert_game(
            conn, game_key, SEASON, game_date,
            home_ts_id, away_ts_id,
            home_score, away_score,
            game_type=game_type, neutral_site=neutral,
            venue=venue,
        )

        # Build and insert team_game_stats for our team
        team_stats = build_team_game_stats(g)
        db.upsert_team_game_stats(conn, game_db_id, team_season_id, is_home, team_stats)

        # Create opponent stub team + team_season
        opp_name = g.get("opp_name", "Unknown")
        opp_slug = f"nccaa-opp-{re.sub(r'[^a-z0-9]', '', opp_name.lower())}"
        opp_team_id = db.upsert_team(
            conn, opp_name, opp_slug, conference_id=None,
            competitive_level_id=level_id,
        )
        opp_ts_id = db.upsert_team_season(conn, opp_team_id, SEASON)

        # Fill in the opponent side of the game
        if is_home:
            conn.execute(
                "UPDATE games SET away_team_season_id = %s WHERE id = %s AND away_team_season_id IS NULL",
                (opp_ts_id, game_db_id),
            )
        else:
            conn.execute(
                "UPDATE games SET home_team_season_id = %s WHERE id = %s AND home_team_season_id IS NULL",
                (opp_ts_id, game_db_id),
            )

        conn.commit()
        games_inserted += 1

    log.info(f"  Games: {games_inserted} inserted")

    return {
        "roster": roster_count,
        "season_stats": season_stats_count,
        "games": games_inserted,
    }


def scrape_division(conn, division: str, limit: int | None = None):
    """Scrape all teams in an NCCAA division."""
    teams = discover_teams(conn, division)
    if limit:
        teams = teams[:limit]

    totals = {"teams": 0, "roster": 0, "season_stats": 0, "games": 0}
    for i, team in enumerate(teams):
        log.info(f"\n[{i+1}/{len(teams)}] {team['name']}")
        try:
            result = scrape_team(conn, team, division)
            totals["teams"] += 1
            totals["roster"] += result["roster"]
            totals["season_stats"] += result["season_stats"]
            totals["games"] += result["games"]
        except Exception as e:
            log.error(f"Error scraping {team['name']}: {e}")
            conn.rollback()
            continue

    return totals


def print_summary(label: str, totals: dict):
    """Print final summary."""
    print("\n" + "=" * 60)
    print(f"  {label} — FINAL SUMMARY")
    print("=" * 60)
    print(f"  Teams scraped:              {totals.get('teams', 0)}")
    print(f"  Players (roster entries):   {totals.get('roster', 0)}")
    print(f"  Player season stats rows:   {totals.get('season_stats', 0)}")
    print(f"  Games inserted:             {totals.get('games', 0)}")
    print("=" * 60)


# ── Entry point ──

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "d1-one"

    conn = db.get_conn()

    try:
        if mode == "d1":
            log.info(f"\n{'='*60}")
            log.info(f"  STARTING NCCAA DIVISION I")
            log.info(f"{'='*60}")
            totals = scrape_division(conn, "d1")
            conn.commit()
            print_summary("NCCAA DI SCRAPER", totals)

        elif mode == "d2":
            log.info(f"\n{'='*60}")
            log.info(f"  STARTING NCCAA DIVISION II")
            log.info(f"{'='*60}")
            totals = scrape_division(conn, "d2")
            conn.commit()
            print_summary("NCCAA DII SCRAPER", totals)

        elif mode == "all":
            all_totals = {"teams": 0, "roster": 0, "season_stats": 0, "games": 0}
            for div in ["d1", "d2"]:
                log.info(f"\n{'='*60}")
                log.info(f"  STARTING {NCCAA_DIV_DISPLAY[div]}")
                log.info(f"{'='*60}")
                totals = scrape_division(conn, div)
                conn.commit()
                for k in all_totals:
                    all_totals[k] += totals[k]
            print_summary("NCCAA SCRAPER (ALL)", all_totals)

        elif mode == "d1-one":
            teams = discover_teams(conn, "d1")
            if teams:
                result = scrape_team(conn, teams[0], "d1")
                conn.commit()
                print_summary("NCCAA DI SCRAPER (1 team)", {
                    "teams": 1, **result,
                })

        elif mode == "d2-one":
            teams = discover_teams(conn, "d2")
            if teams:
                result = scrape_team(conn, teams[0], "d2")
                conn.commit()
                print_summary("NCCAA DII SCRAPER (1 team)", {
                    "teams": 1, **result,
                })

        else:
            print("Usage: python3 nccaa_scraper.py [d1|d2|all|d1-one|d2-one]")
            sys.exit(1)

    finally:
        conn.close()


if __name__ == "__main__":
    main()
