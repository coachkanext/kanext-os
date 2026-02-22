"""
PrestoSports Scraper — NJCAA + NAIA + CCCAA
Discovers teams, extracts rosters/game logs, parses box scores, loads to PostgreSQL.
"""
from __future__ import annotations

import re
import sys
import time
import logging
from datetime import datetime
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup

import db
from config import (
    SPORT, SEASON, CRAWL_DELAY,
    NJCAA_BASE_URL, NJCAA_DIV_TO_LEVEL_KEY, NJCAA_DIV_DISPLAY,
    NAIA_BASE_URL, NAIA_LEVEL_KEY,
    CCCAA_BASE_URL, CCCAA_LEVEL_KEY,
    USCAA_BASE_URL, USCAA_LEVEL_KEY,
)

# Legacy aliases for backward compat within this file
BASE_URL = NJCAA_BASE_URL
DIV_TO_LEVEL_KEY = NJCAA_DIV_TO_LEVEL_KEY
DIV_DISPLAY = NJCAA_DIV_DISPLAY

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("scraper")

# ── URL helpers ──

def _team_path(base_url: str, division: str | None, slug: str) -> str:
    """Build team base URL: with or without division segment."""
    if division:
        return f"{base_url}/sports/{SPORT}/{SEASON}/{division}/teams/{slug}"
    return f"{base_url}/sports/{SPORT}/{SEASON}/teams/{slug}"


def _leaders_url(base_url: str, division: str | None) -> str:
    """Build leaders page URL."""
    if division:
        return f"{base_url}/sports/{SPORT}/{SEASON}/{division}/leaders"
    return f"{base_url}/sports/{SPORT}/{SEASON}/leaders"


def _team_regex(division: str | None) -> str:
    """Regex pattern to match team links in leaders page."""
    if division:
        return rf"/sports/{SPORT}/{SEASON}/{division}/teams/([^?/]+)"
    return rf"/sports/{SPORT}/{SEASON}/teams/([^?/]+)"


# ── HTTP client with rate limiting ──

_last_request_time = 0.0

def fetch(url: str, conn) -> httpx.Response | None:
    """Fetch a URL with rate limiting and scrape logging."""
    global _last_request_time
    elapsed = time.time() - _last_request_time
    if elapsed < CRAWL_DELAY:
        time.sleep(CRAWL_DELAY - elapsed)

    try:
        r = httpx.get(url, follow_redirects=True, timeout=60)
        _last_request_time = time.time()
        status = "success" if r.status_code == 200 else "failed"
        db.log_scrape(conn, url, status, r.status_code, None, 0)
        conn.commit()
        if r.status_code != 200:
            log.warning(f"HTTP {r.status_code}: {url}")
            return None
        return r
    except Exception as e:
        _last_request_time = time.time()
        db.log_scrape(conn, url, "failed", 0, str(e), 0)
        conn.commit()
        log.error(f"Request failed: {url} — {e}")
        return None


# ── Team Discovery ──

def discover_teams(conn, division: str | None, *, base_url: str = NJCAA_BASE_URL, display_name: str | None = None) -> list[dict]:
    """Discover all teams from the leaders page."""
    url = _leaders_url(base_url, division)
    label = display_name or (DIV_DISPLAY.get(division, division) if division else "NAIA")
    log.info(f"Discovering {label} teams from {url}")

    r = fetch(url, conn)
    if not r:
        return []

    soup = BeautifulSoup(r.text, "lxml")
    teams = []
    slug_names = {}  # slug → best name found

    pattern = _team_regex(division)

    # Find all team profile links
    for a in soup.find_all("a", href=True):
        href = a["href"]
        m = re.match(pattern, href)
        if m:
            slug = m.group(1)
            # Skip if we already have a good name for this slug
            if slug in slug_names and slug_names[slug]:
                continue
            name = a.get_text(strip=True)
            # Clean doubled names (e.g., "Butler CCButler CC")
            if name and len(name) > 4:
                half = len(name) // 2
                if name[:half] == name[half:]:
                    name = name[:half]
            # Skip non-name link texts (Stats, Roster, Schedule)
            if name and name.lower() not in ("stats", "roster", "schedule"):
                slug_names[slug] = name

    for slug, name in slug_names.items():
        teams.append({"name": name, "slug": slug, "division": division})

    log.info(f"Found {len(teams)} teams in {label}")
    return teams


# ── Roster Extraction ──

def extract_roster(conn, team_slug: str, division: str | None, *, base_url: str = NJCAA_BASE_URL) -> list[dict]:
    """Extract the full roster for a team."""
    url = _team_path(base_url, division, team_slug) + "?view=roster"
    r = fetch(url, conn)
    if not r:
        return []

    soup = BeautifulSoup(r.text, "lxml")
    players = []

    # Find the roster table (has headers: #, Name, Position, Year, Status)
    for table in soup.find_all("table"):
        headers = [th.get_text(strip=True).lower() for th in table.find_all("th")]
        if "name" in headers and ("#" in headers or "no." in headers):
            for row in table.find_all("tr")[1:]:  # skip header
                cells = row.find_all(["td", "th"])
                if len(cells) < 3:
                    continue

                cell_texts = [c.get_text(strip=True) for c in cells]

                # Skip section headers like "STARTERS", "BENCH"
                if any(cell_texts[0].upper() in ("STARTERS", "BENCH", "RESERVES", "") for _ in [1]):
                    if not cell_texts[1] or cell_texts[1].upper() in ("STARTERS", "BENCH", "RESERVES", ""):
                        continue

                jersey = cell_texts[0] if cell_texts[0].isdigit() or (len(cell_texts[0]) <= 3 and cell_texts[0]) else None
                name = cell_texts[1] if len(cell_texts) > 1 else ""
                position = cell_texts[2] if len(cell_texts) > 2 else ""
                class_year = cell_texts[3] if len(cell_texts) > 3 else ""
                status = cell_texts[4] if len(cell_texts) > 4 else "Active"

                if not name or name.upper() in ("STARTERS", "BENCH", "RESERVES", "TEAM", "TM"):
                    continue

                players.append({
                    "name": name,
                    "jersey": jersey,
                    "position": position,
                    "class_year": class_year,
                    "status": status.lower() if status else "active",
                })
            break  # Use first matching table

    return players


# ── Game Log Extraction ──

def extract_game_log(conn, team_slug: str, division: str | None, *, base_url: str = NJCAA_BASE_URL) -> list[dict]:
    """Extract game log with box score URLs."""
    page_url = _team_path(base_url, division, team_slug) + "?view=gamelog"
    r = fetch(page_url, conn)
    if not r:
        return []

    soup = BeautifulSoup(r.text, "lxml")
    games = []

    # Find the table with the MOST box-score links (not the first match,
    # which on PrestoSports is often a 10-game "recent results" widget).
    best_table = None
    best_count = 0
    for table in soup.find_all("table"):
        headers = [th.get_text(strip=True).lower() for th in table.find_all("th")]
        if "date" in headers and "opponent" in headers:
            rows = table.find_all("tr")[1:]
            box_count = sum(
                1 for row in rows
                if any('.xml' in a.get('href', '')
                       for a in row.find_all('a', href=True))
            )
            if box_count > best_count:
                best_count = box_count
                best_table = table

    if best_table:
        for row in best_table.find_all("tr")[1:]:
            cells = row.find_all(["td", "th"])
            if len(cells) < 3:
                continue

            cell_texts = [c.get_text(strip=True) for c in cells]
            date_str = cell_texts[0]
            opponent_raw = cell_texts[1]
            result_str = cell_texts[2] if len(cell_texts) > 2 else ""

            # Skip unplayed games (no result)
            if not result_str or result_str == "-":
                continue

            # Extract box score link
            box_link = None
            for a in row.find_all("a", href=True):
                h = a["href"]
                if "boxscore" in h.lower() or h.endswith(".xml"):
                    box_link = h
                    break

            if not box_link:
                continue

            # Parse location from opponent text
            opponent_clean = opponent_raw.strip()
            if opponent_clean.startswith("at"):
                location = "away"
                opponent_name = opponent_clean[2:].strip()
            elif opponent_clean.startswith("vs."):
                location = "neutral"
                opponent_name = opponent_clean[3:].strip()
            else:
                location = "home"
                opponent_name = opponent_clean

            # Parse score from result (e.g., "W, 121-81" or "L, 95-94")
            score_match = re.search(r"(\d+)-(\d+)", result_str)
            if not score_match:
                continue

            team_score = int(score_match.group(1))
            opp_score = int(score_match.group(2))
            won = result_str.strip().startswith("W")

            # Parse game date
            game_date = parse_game_date(date_str)

            # Build box score URL — relative links like ../boxscores/ID.xml
            box_url = urljoin(page_url, box_link)

            # Extract game_id from box score filename
            game_id_match = re.search(r"/boxscores/(.+?)\.xml", box_url)
            game_id = game_id_match.group(1) if game_id_match else box_link

            games.append({
                "date": game_date,
                "opponent": opponent_name,
                "location": location,
                "team_score": team_score,
                "opp_score": opp_score,
                "won": won,
                "box_url": box_url,
                "game_id": game_id,
            })

    return games


def parse_game_date(date_str: str) -> str | None:
    """Parse date string like 'Nov 3' or '1/14/2026' to YYYY-MM-DD."""
    date_str = date_str.strip()
    # Try MM/DD/YYYY format
    m = re.match(r"(\d{1,2})/(\d{1,2})/(\d{4})", date_str)
    if m:
        return f"{m.group(3)}-{int(m.group(1)):02d}-{int(m.group(2)):02d}"
    # Try "Mon DD" format — infer year from season
    try:
        # Try current season year range
        for year in [2025, 2026]:
            try:
                dt = datetime.strptime(f"{date_str} {year}", "%b %d %Y")
                # Season 2025-26: Nov-Dec=2025, Jan-Apr=2026
                if dt.month >= 8:
                    return f"2025-{dt.month:02d}-{dt.day:02d}"
                else:
                    return f"2026-{dt.month:02d}-{dt.day:02d}"
            except ValueError:
                continue
    except Exception:
        pass
    return None


# ── Box Score Parsing ──

def parse_box_score(conn, box_url: str) -> dict | None:
    """Parse a box score page, returning player stats and team totals."""
    r = fetch(box_url, conn)
    if not r:
        return None

    soup = BeautifulSoup(r.text, "lxml")

    # Find score table (Table 0: Final scores)
    score_table = None
    player_tables = []
    game_info = {}

    for table in soup.find_all("table"):
        headers = [th.get_text(strip=True) for th in table.find_all("th")]

        # Score table: has "Final", "1", "2", "T"
        if "Final" in headers or ("1" in headers and "2" in headers and "T" in headers):
            rows = table.find_all("tr")
            teams_in_score = []
            for row in rows[1:]:
                cells = [c.get_text(strip=True) for c in row.find_all(["td", "th"])]
                if cells and len(cells) >= 2:
                    teams_in_score.append({"name": cells[0], "total": cells[-1]})
            if len(teams_in_score) >= 2:
                game_info["team1"] = teams_in_score[0]["name"]
                game_info["team2"] = teams_in_score[1]["name"]
                game_info["score1"] = safe_int(teams_in_score[0]["total"])
                game_info["score2"] = safe_int(teams_in_score[1]["total"])
            continue

        # Player stat tables: have MIN, FGM-A, etc.
        if "MIN" in headers and "PTS" in headers:
            player_tables.append(table)

    if not game_info.get("team1"):
        log.warning(f"Could not parse score table from {box_url}")
        return None

    # Parse the first two player stat tables (full game stats for team1 and team2)
    result = {
        "game_info": game_info,
        "team1_players": [],
        "team2_players": [],
        "team1_totals": {},
        "team2_totals": {},
    }

    if len(player_tables) >= 2:
        result["team1_players"], result["team1_totals"] = parse_player_table(player_tables[0])
        result["team2_players"], result["team2_totals"] = parse_player_table(player_tables[1])

    return result


def parse_player_table(table) -> tuple[list[dict], dict]:
    """Parse a player stats table, returning (players, team_totals)."""
    players = []
    team_totals = {}
    is_starter_section = True

    rows = table.find_all("tr")
    for row in rows[1:]:  # skip header
        cells = row.find_all(["td", "th"])
        if len(cells) < 2:
            continue

        cell_texts = [c.get_text(strip=True) for c in cells]
        first_cell = cell_texts[0]

        # Section headers
        if first_cell.upper() in ("STARTERS", "BENCH", "RESERVES"):
            is_starter_section = first_cell.upper() == "STARTERS"
            continue

        # Team totals row
        if first_cell.upper() in ("TEAM", "TOTALS", "TEAM TOTALS", "TM"):
            if len(cell_texts) >= 14:
                team_totals = parse_stat_line(cell_texts[1:], is_team=True)
            continue

        # Regular player row
        if len(cell_texts) >= 14:
            name_raw = first_cell
            # Try position+jersey+name format first (g2Name, f10Name, c4Name)
            m = re.match(r"^[gfcGFC]\d{1,3}\s*(.+)", name_raw)
            if not m:
                # Try plain jersey+name format (02Josiah Kirkwood)
                m = re.match(r"^(\d{1,3})\s*(.+)", name_raw)
                if m:
                    name = m.group(2).strip()
                else:
                    name = name_raw.strip()
            else:
                name = m.group(1).strip()

            if not name or name.upper() in ("TEAM", "TM", "TOTALS"):
                continue

            stats = parse_stat_line(cell_texts[1:])
            stats["name"] = name
            stats["started"] = is_starter_section
            players.append(stats)

    return players, team_totals


def parse_stat_line(cells: list[str], is_team: bool = False) -> dict:
    """Parse stat cells: MIN, FGM-A, 3PM-A, FTM-A, OREB, DREB, REB, AST, STL, BLK, TO, PF, PTS"""
    stats = {}

    if len(cells) < 13:
        return stats

    stats["minutes"] = safe_float(cells[0])

    # FGM-A
    fgm, fga = parse_made_att(cells[1])
    stats["fgm"] = fgm
    stats["fga"] = fga

    # 3PM-A
    tpm, tpa = parse_made_att(cells[2])
    stats["three_pm"] = tpm
    stats["three_pa"] = tpa

    # FTM-A
    ftm, fta = parse_made_att(cells[3])
    stats["ftm"] = ftm
    stats["fta"] = fta

    stats["oreb"] = safe_int(cells[4])
    stats["dreb"] = safe_int(cells[5])
    stats["reb"] = safe_int(cells[6])
    stats["ast"] = safe_int(cells[7])
    stats["stl"] = safe_int(cells[8])
    stats["blk"] = safe_int(cells[9])
    stats["turnovers"] = safe_int(cells[10])
    stats["pf"] = safe_int(cells[11])
    stats["pts"] = safe_int(cells[12])

    # Compute percentages for team totals
    if is_team:
        stats["fg_pct"] = round(fgm / fga * 100, 1) if fga > 0 else None
        stats["three_pct"] = round(tpm / tpa * 100, 1) if tpa > 0 else None
        stats["ft_pct"] = round(ftm / fta * 100, 1) if fta > 0 else None

    return stats


def parse_made_att(s: str) -> tuple[int, int]:
    """Parse 'FGM-FGA' or 'FGM-A' format, e.g., '3-6' → (3, 6)."""
    m = re.match(r"(\d+)\s*-\s*(\d+)", s.strip())
    if m:
        return int(m.group(1)), int(m.group(2))
    return 0, 0


def safe_int(s: str) -> int:
    try:
        return int(s.strip())
    except (ValueError, AttributeError):
        return 0


def safe_float(s: str) -> float:
    try:
        return float(s.strip())
    except (ValueError, AttributeError):
        return 0.0


# ── Full Pipeline ──

def _match_team_to_box(team_name: str, game_info: dict) -> bool:
    """Determine if our team is team1 or team2 in the box score.
    Returns True if our team is team1, False if team2."""
    t1 = (game_info.get("team1") or "").lower()
    t2 = (game_info.get("team2") or "").lower()
    tn = team_name.lower()

    t1_match = tn in t1 or t1 in tn
    t2_match = tn in t2 or t2 in tn

    if t1_match and not t2_match:
        return True
    if t2_match and not t1_match:
        return False

    # Fallback: compare word overlap
    tn_words = set(tn.split())
    t1_words = set(t1.split())
    t2_words = set(t2.split())
    t1_overlap = len(tn_words & t1_words)
    t2_overlap = len(tn_words & t2_words)

    return t1_overlap >= t2_overlap


def scrape_team(conn, team_info: dict, division: str | None, *,
                base_url: str = NJCAA_BASE_URL,
                assoc_code: str = "njcaa",
                level_key: str | None = None):
    """Full scrape pipeline for one team."""
    name = team_info["name"]
    slug = team_info["slug"]
    log.info(f"Scraping team: {name} ({slug})")

    # Get competitive level
    if level_key is None:
        level_key = DIV_TO_LEVEL_KEY[division]
    level_id = db.get_competitive_level_id(conn, level_key)

    # Upsert division for conference
    if division:
        div_code = division.replace("div", "d")
    else:
        div_code = assoc_code  # e.g. "naia"
    division_id = db.get_division_id(conn, assoc_code, div_code)

    # Upsert team
    team_id = db.upsert_team(
        conn, name, slug, conference_id=None,
        competitive_level_id=level_id,
        base_url=_team_path(base_url, division, slug),
    )

    # Upsert team season
    team_season_id = db.upsert_team_season(conn, team_id, SEASON)
    conn.commit()

    # Extract roster
    roster = extract_roster(conn, slug, division, base_url=base_url)
    log.info(f"  Roster: {len(roster)} players")

    # Map player names → player_team_season_ids
    player_pts_map = {}
    for p in roster:
        if not p["name"]:
            continue
        player_id = db.upsert_player(
            conn, p["name"],
            positions=[p["position"]] if p["position"] else None,
        )
        pts_id = db.upsert_player_team_season(
            conn, player_id, team_season_id,
            jersey_number=p.get("jersey"),
            class_year=p.get("class_year"),
            roster_status=p.get("status", "active"),
        )
        player_pts_map[p["name"]] = pts_id
    conn.commit()

    # Extract game log
    games = extract_game_log(conn, slug, division, base_url=base_url)
    log.info(f"  Games: {len(games)} with box scores")

    games_scraped = 0
    pgs_created = 0

    for game in games:
        box_data = parse_box_score(conn, game["box_url"])
        if not box_data:
            continue

        gi = box_data["game_info"]

        # Determine home/away teams
        is_home = game["location"] in ("home", "neutral")
        if is_home:
            home_ts_id = team_season_id
            away_ts_id = None
            home_score = game["team_score"]
            away_score = game["opp_score"]
        else:
            home_ts_id = None
            away_ts_id = team_season_id
            home_score = game["opp_score"]
            away_score = game["team_score"]

        game_id = db.upsert_game(
            conn, game["game_id"], SEASON, game["date"],
            home_ts_id, away_ts_id,
            home_score, away_score,
            neutral_site=(game["location"] == "neutral"),
        )

        our_is_team1 = _match_team_to_box(name, gi)

        if our_is_team1:
            our_players = box_data["team1_players"]
            our_totals = box_data["team1_totals"]
            opp_players = box_data["team2_players"]
            opp_totals = box_data["team2_totals"]
        else:
            our_players = box_data["team2_players"]
            our_totals = box_data["team2_totals"]
            opp_players = box_data["team1_players"]
            opp_totals = box_data["team1_totals"]

        # Create opponent team/season
        opp_name = game["opponent"]
        opp_slug = re.sub(r"[^a-z0-9]", "", opp_name.lower())
        opp_team_id = db.upsert_team(
            conn, opp_name, opp_slug, conference_id=None,
            competitive_level_id=level_id,
        )
        opp_team_season_id = db.upsert_team_season(conn, opp_team_id, SEASON)

        # Update game with opponent team_season_id
        if is_home and away_ts_id is None:
            conn.execute(
                "UPDATE games SET away_team_season_id = %s WHERE id = %s AND away_team_season_id IS NULL",
                (opp_team_season_id, game_id),
            )
        elif not is_home and home_ts_id is None:
            conn.execute(
                "UPDATE games SET home_team_season_id = %s WHERE id = %s AND home_team_season_id IS NULL",
                (opp_team_season_id, game_id),
            )

        # Insert OUR team game stats
        if our_totals:
            db.upsert_team_game_stats(conn, game_id, team_season_id, is_home, our_totals)

        # Insert OPPONENT team game stats
        if opp_totals:
            db.upsert_team_game_stats(conn, game_id, opp_team_season_id, not is_home, opp_totals)

        # Insert OUR player game stats
        for p_stats in our_players:
            p_name = p_stats.get("name", "")
            pts_id = player_pts_map.get(p_name)
            if not pts_id:
                for roster_name, roster_pts_id in player_pts_map.items():
                    if roster_name.lower() == p_name.lower():
                        pts_id = roster_pts_id
                        break
                if not pts_id:
                    player_id = db.upsert_player(conn, p_name)
                    pts_id = db.upsert_player_team_season(
                        conn, player_id, team_season_id,
                    )
                    player_pts_map[p_name] = pts_id

            db.upsert_player_game_stats(conn, game_id, pts_id, p_stats)
            pgs_created += 1

        # Insert OPPONENT player game stats
        opp_pts_map = {}
        for p_stats in opp_players:
            p_name = p_stats.get("name", "")
            if not p_name:
                continue
            pts_id = opp_pts_map.get(p_name)
            if not pts_id:
                player_id = db.upsert_player(conn, p_name)
                pts_id = db.upsert_player_team_season(
                    conn, player_id, opp_team_season_id,
                )
                opp_pts_map[p_name] = pts_id

            db.upsert_player_game_stats(conn, game_id, pts_id, p_stats)
            pgs_created += 1

        # Update game possessions
        db.update_game_possessions(conn, game_id)
        conn.commit()
        games_scraped += 1

    log.info(f"  Loaded: {games_scraped} games, {pgs_created} player-game-stat rows")
    return {"games": games_scraped, "player_game_stats": pgs_created, "roster": len(roster)}


def scrape_division(conn, division: str, limit: int | None = None):
    """Scrape all teams in an NJCAA division."""
    teams = discover_teams(conn, division, base_url=NJCAA_BASE_URL, display_name=DIV_DISPLAY.get(division))
    if limit:
        teams = teams[:limit]

    stats = {"teams": 0, "games": 0, "player_game_stats": 0, "roster": 0}
    for i, team in enumerate(teams):
        log.info(f"\n[{i+1}/{len(teams)}] {team['name']}")
        try:
            result = scrape_team(conn, team, division,
                                 base_url=NJCAA_BASE_URL, assoc_code="njcaa")
            stats["teams"] += 1
            stats["games"] += result["games"]
            stats["player_game_stats"] += result["player_game_stats"]
            stats["roster"] += result["roster"]
        except Exception as e:
            log.error(f"Error scraping {team['name']}: {e}")
            conn.rollback()
            continue

    return stats


def scrape_naia(conn, limit: int | None = None):
    """Scrape all NAIA teams (single division, no division path segment)."""
    teams = discover_teams(conn, None, base_url=NAIA_BASE_URL, display_name="NAIA")
    if limit:
        teams = teams[:limit]

    stats = {"teams": 0, "games": 0, "player_game_stats": 0, "roster": 0}
    for i, team in enumerate(teams):
        log.info(f"\n[{i+1}/{len(teams)}] {team['name']}")
        try:
            result = scrape_team(conn, team, None,
                                 base_url=NAIA_BASE_URL,
                                 assoc_code="naia",
                                 level_key=NAIA_LEVEL_KEY)
            stats["teams"] += 1
            stats["games"] += result["games"]
            stats["player_game_stats"] += result["player_game_stats"]
            stats["roster"] += result["roster"]
        except Exception as e:
            log.error(f"Error scraping {team['name']}: {e}")
            conn.rollback()
            continue

    return stats


def scrape_cccaa(conn, limit: int | None = None):
    """Scrape all CCCAA teams (single division, no division path segment)."""
    teams = discover_teams(conn, None, base_url=CCCAA_BASE_URL, display_name="CCCAA")
    if limit:
        teams = teams[:limit]

    stats = {"teams": 0, "games": 0, "player_game_stats": 0, "roster": 0}
    for i, team in enumerate(teams):
        log.info(f"\n[{i+1}/{len(teams)}] {team['name']}")
        try:
            result = scrape_team(conn, team, None,
                                 base_url=CCCAA_BASE_URL,
                                 assoc_code="cccaa",
                                 level_key=CCCAA_LEVEL_KEY)
            stats["teams"] += 1
            stats["games"] += result["games"]
            stats["player_game_stats"] += result["player_game_stats"]
            stats["roster"] += result["roster"]
        except Exception as e:
            log.error(f"Error scraping {team['name']}: {e}")
            conn.rollback()
            continue

    return stats


def scrape_uscaa(conn, limit: int | None = None):
    """Scrape all USCAA teams (single division, no division path segment)."""
    teams = discover_teams(conn, None, base_url=USCAA_BASE_URL, display_name="USCAA")
    if limit:
        teams = teams[:limit]

    stats = {"teams": 0, "games": 0, "player_game_stats": 0, "roster": 0}
    for i, team in enumerate(teams):
        log.info(f"\n[{i+1}/{len(teams)}] {team['name']}")
        try:
            result = scrape_team(conn, team, None,
                                 base_url=USCAA_BASE_URL,
                                 assoc_code="uscaa",
                                 level_key=USCAA_LEVEL_KEY)
            stats["teams"] += 1
            stats["games"] += result["games"]
            stats["player_game_stats"] += result["player_game_stats"]
            stats["roster"] += result["roster"]
        except Exception as e:
            log.error(f"Error scraping {team['name']}: {e}")
            conn.rollback()
            continue

    return stats


def print_summary(conn, label: str = "SCRAPER"):
    """Print final summary of database state."""
    with conn.cursor() as cur:
        cur.execute("SELECT count(*) AS n FROM teams")
        total_teams = cur.fetchone()["n"]
        cur.execute("SELECT count(*) AS n FROM players")
        total_players = cur.fetchone()["n"]
        cur.execute("SELECT count(*) AS n FROM games")
        total_games = cur.fetchone()["n"]
        cur.execute("SELECT count(*) AS n FROM player_game_stats")
        total_pgs = cur.fetchone()["n"]
        cur.execute("SELECT count(*) AS n FROM team_game_stats")
        total_tgs = cur.fetchone()["n"]
        cur.execute("SELECT count(*) AS n FROM scrape_log WHERE status = 'failed'")
        failed = cur.fetchone()["n"]
        cur.execute("SELECT count(*) AS n FROM scrape_log")
        total_requests = cur.fetchone()["n"]

    print("\n" + "=" * 60)
    print(f"  {label} — FINAL SUMMARY")
    print("=" * 60)
    print(f"  Total teams discovered & scraped: {total_teams}")
    print(f"  Total players in database:        {total_players}")
    print(f"  Total games with box scores:      {total_games}")
    print(f"  Total player_game_stats rows:     {total_pgs}")
    print(f"  Total team_game_stats rows:       {total_tgs}")
    print(f"  Total HTTP requests:              {total_requests}")
    print(f"  Failed URLs (in scrape_log):      {failed}")
    print("=" * 60)


# ── Entry point ──

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "one"
    division = sys.argv[2] if len(sys.argv) > 2 else "div1"

    conn = db.get_conn()

    try:
        if mode == "one":
            # Test with one NJCAA team
            teams = discover_teams(conn, division, base_url=NJCAA_BASE_URL,
                                   display_name=DIV_DISPLAY.get(division))
            if teams:
                scrape_team(conn, teams[0], division,
                            base_url=NJCAA_BASE_URL, assoc_code="njcaa")
                conn.commit()
                print_summary(conn, "NJCAA SCRAPER")
        elif mode == "division":
            # Scrape entire NJCAA division
            scrape_division(conn, division)
            conn.commit()
            print_summary(conn, "NJCAA SCRAPER")
        elif mode == "all":
            # Scrape all NJCAA divisions
            for div in ["div1", "div2", "div3"]:
                log.info(f"\n{'='*60}")
                log.info(f"  STARTING {DIV_DISPLAY[div]}")
                log.info(f"{'='*60}")
                scrape_division(conn, div)
                conn.commit()
            print_summary(conn, "NJCAA SCRAPER")
        elif mode == "naia":
            # Scrape all NAIA teams
            log.info(f"\n{'='*60}")
            log.info(f"  STARTING NAIA")
            log.info(f"{'='*60}")
            scrape_naia(conn)
            conn.commit()
            print_summary(conn, "NAIA SCRAPER")
        elif mode == "naia-one":
            # Test with one NAIA team
            teams = discover_teams(conn, None, base_url=NAIA_BASE_URL,
                                   display_name="NAIA")
            if teams:
                scrape_team(conn, teams[0], None,
                            base_url=NAIA_BASE_URL, assoc_code="naia",
                            level_key=NAIA_LEVEL_KEY)
                conn.commit()
                print_summary(conn, "NAIA SCRAPER")
        elif mode == "cccaa":
            # Scrape all CCCAA teams
            log.info(f"\n{'='*60}")
            log.info(f"  STARTING CCCAA (3C2A)")
            log.info(f"{'='*60}")
            scrape_cccaa(conn)
            conn.commit()
            print_summary(conn, "CCCAA SCRAPER")
        elif mode == "cccaa-one":
            # Test with one CCCAA team
            teams = discover_teams(conn, None, base_url=CCCAA_BASE_URL,
                                   display_name="CCCAA")
            if teams:
                scrape_team(conn, teams[0], None,
                            base_url=CCCAA_BASE_URL, assoc_code="cccaa",
                            level_key=CCCAA_LEVEL_KEY)
                conn.commit()
                print_summary(conn, "CCCAA SCRAPER")
        elif mode == "uscaa":
            # Scrape all USCAA teams
            log.info(f"\n{'='*60}")
            log.info(f"  STARTING USCAA")
            log.info(f"{'='*60}")
            scrape_uscaa(conn)
            conn.commit()
            print_summary(conn, "USCAA SCRAPER")
        elif mode == "uscaa-one":
            # Test with one USCAA team
            teams = discover_teams(conn, None, base_url=USCAA_BASE_URL,
                                   display_name="USCAA")
            if teams:
                scrape_team(conn, teams[0], None,
                            base_url=USCAA_BASE_URL, assoc_code="uscaa",
                            level_key=USCAA_LEVEL_KEY)
                conn.commit()
                print_summary(conn, "USCAA SCRAPER")
        else:
            print("Usage: python scraper.py [one|division|all|naia|naia-one|cccaa|cccaa-one|uscaa|uscaa-one] [div1|div2|div3]")
            sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
