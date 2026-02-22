"""
NCAA Stats Scraper — stats.ncaa.org
Discovers teams, extracts season-level rosters and stats, loads to PostgreSQL.

Architecture:
  - Team listing pages (/team/inst_team_list) work with curl_cffi (Chrome TLS impersonation)
  - Team detail pages (/teams/ID) are Akamai-protected (require JS challenge)
  - Individual player season stats come from national ranking pages (no Akamai)
  - Team search API (/team/search) provides conference mapping

Strategy:
  1. Discover teams per division from team listing page
  2. Map conferences via team search autocomplete API
  3. Scrape individual player season stats from ranking pages (PPG, RPG, APG, etc.)
  4. Merge stats by player name + team to build complete season stat lines
  5. Upsert everything into the shared kanext_player_pool database
"""
from __future__ import annotations

import re
import sys
import time
import logging
from typing import Optional

from bs4 import BeautifulSoup
from curl_cffi import requests as cffi_requests

import db
from config import (
    SEASON, CRAWL_DELAY,
    NCAA_BASE_URL, NCAA_SPORT_CODE, NCAA_ACADEMIC_YEAR,
    NCAA_DIV_TO_LEVEL_KEY, NCAA_DIV_DISPLAY,
    NCAA_STAT_SEQ, NCAA_TEAM_STAT_SEQ,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("ncaa_scraper")


# ── HTTP Session ──

_session: Optional[cffi_requests.Session] = None
_last_request_time: float = 0.0


def _get_session() -> cffi_requests.Session:
    """Get or create a curl_cffi session with Chrome TLS impersonation."""
    global _session
    if _session is None:
        _session = cffi_requests.Session(impersonate="chrome120")
        # Warm up the session with a main page visit to establish cookies
        log.info("Initializing session (warming up cookies)...")
        try:
            _session.get(f"{NCAA_BASE_URL}/", timeout=30)
            time.sleep(2)
        except Exception as e:
            log.warning(f"Session warmup failed: {e}")
    return _session


def fetch(url: str, conn, params: dict | None = None,
          headers: dict | None = None) -> cffi_requests.Response | None:
    """Fetch a URL with rate limiting, scrape logging, and Chrome TLS impersonation."""
    global _last_request_time
    elapsed = time.time() - _last_request_time
    if elapsed < CRAWL_DELAY:
        time.sleep(CRAWL_DELAY - elapsed)

    session = _get_session()
    try:
        r = session.get(url, params=params, headers=headers,
                        allow_redirects=True, timeout=60)
        _last_request_time = time.time()

        # Check for Akamai challenge
        if r.status_code == 200 and "bm-verify" in r.text:
            status = "challenged"
            db.log_scrape(conn, url, status, r.status_code, "Akamai challenge", 0)
            conn.commit()
            log.warning(f"Akamai challenge: {url}")
            return None

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
        log.error(f"Request failed: {url} -- {e}")
        return None


def fetch_json(url: str, conn, params: dict | None = None) -> dict | list | None:
    """Fetch a JSON API endpoint with proper Accept headers."""
    headers = {
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    }
    r = fetch(url, conn, params=params, headers=headers)
    if r is None:
        return None
    try:
        return r.json()
    except Exception:
        log.warning(f"JSON parse failed: {url}")
        return None


# ── Team Discovery ──

def discover_teams(conn, division: str) -> list[dict]:
    """
    Discover all teams for a division from the team listing page.
    Returns list of dicts with keys: name, ncaa_team_id, division.
    """
    label = NCAA_DIV_DISPLAY.get(division, f"Division {division}")
    url = f"{NCAA_BASE_URL}/team/inst_team_list"
    params = {
        "sport_code": NCAA_SPORT_CODE,
        "division": division,
    }
    log.info(f"Discovering {label} teams from {url}")

    r = fetch(url, conn, params=params)
    if not r:
        return []

    soup = BeautifulSoup(r.text, "lxml")
    teams = []

    for a in soup.find_all("a", href=re.compile(r"/teams/\d+")):
        m = re.search(r"/teams/(\d+)", a["href"])
        if m:
            name = a.get_text(strip=True)
            ncaa_team_id = m.group(1)
            if name and name not in ("", "Select team"):
                teams.append({
                    "name": name,
                    "ncaa_team_id": ncaa_team_id,
                    "division": division,
                })

    log.info(f"Found {len(teams)} teams in {label}")
    return teams


# ── Conference Mapping ──

def map_team_conferences(conn, teams: list[dict]) -> dict[str, str]:
    """
    Map team names to conference names using the team search autocomplete API.
    Returns dict of ncaa_team_id -> conference_name.
    """
    log.info("Mapping conferences via team search API...")

    # Build a lookup of all teams: first 3 chars of name -> search term
    search_terms = set()
    for t in teams:
        name = t["name"]
        # Use first word as search term (autocomplete returns partial matches)
        first_word = name.split()[0] if name.split() else name
        if len(first_word) >= 2:
            search_terms.add(first_word)

    # Fetch all search results and build name -> conference map
    name_conf_map: dict[str, str] = {}
    done = 0
    total = len(search_terms)

    for term in sorted(search_terms):
        data = fetch_json(
            f"{NCAA_BASE_URL}/team/search",
            conn,
            params={"term": term},
        )
        if data and isinstance(data, list):
            for item in data:
                label = item.get("label", "")
                # Format: "TeamName - Conference"
                if " - " in label:
                    parts = label.rsplit(" - ", 1)
                    team_label = parts[0].strip()
                    conference = parts[1].strip()
                    name_conf_map[team_label] = conference
        done += 1
        if done % 50 == 0:
            log.info(f"  Conference mapping: {done}/{total} search terms processed")

    # Match teams to conferences
    team_conf: dict[str, str] = {}
    matched = 0
    for t in teams:
        name = t["name"]
        conf = name_conf_map.get(name)
        if conf:
            team_conf[t["ncaa_team_id"]] = conf
            matched += 1

    log.info(f"Mapped {matched}/{len(teams)} teams to conferences")
    return team_conf


# ── Ranking Page Parsing ──

def _parse_player_from_ranking(player_text: str) -> dict:
    """
    Parse player string like 'AJ Dybantsa, BYU (Big 12)'.
    Returns dict with keys: full_name, team_name, conference.
    """
    # Pattern: "PlayerName, TeamName (Conference)"
    m = re.match(r"^(.+?),\s*(.+?)\s*\(([^)]+)\)\s*$", player_text)
    if m:
        return {
            "full_name": m.group(1).strip(),
            "team_name": m.group(2).strip(),
            "conference": m.group(3).strip(),
        }
    # Fallback: just name, team without conference
    m = re.match(r"^(.+?),\s*(.+)$", player_text)
    if m:
        return {
            "full_name": m.group(1).strip(),
            "team_name": m.group(2).strip(),
            "conference": None,
        }
    return {
        "full_name": player_text.strip(),
        "team_name": None,
        "conference": None,
    }


def _safe_int(s: str) -> int:
    """Parse integer, return 0 on failure."""
    try:
        return int(s.strip().replace(",", ""))
    except (ValueError, AttributeError):
        return 0


def _safe_float(s: str) -> float:
    """Parse float, return 0.0 on failure."""
    try:
        return float(s.strip().replace(",", ""))
    except (ValueError, AttributeError):
        return 0.0


def _parse_minutes(s: str) -> float:
    """Parse minutes string like '1031:54' (total) or '39:41' (per game) to decimal."""
    s = s.strip()
    m = re.match(r"(\d+):(\d+)", s)
    if m:
        mins = int(m.group(1))
        secs = int(m.group(2))
        return round(mins + secs / 60.0, 1)
    return _safe_float(s)


def _player_key(full_name: str, team_name: str | None) -> str:
    """Create a unique key for a player on a team."""
    return f"{(full_name or '').lower()}|{(team_name or '').lower()}"


def fetch_ranking_page(conn, stat_seq: str, division: str,
                       ranking_period: str = "120.0") -> list[dict]:
    """
    Fetch a national ranking page and parse all player rows.
    Returns list of dicts with player info and stat columns.
    """
    url = f"{NCAA_BASE_URL}/rankings/national_ranking"
    params = {
        "academic_year": NCAA_ACADEMIC_YEAR,
        "division": f"{division}.0",
        "ranking_period": ranking_period,
        "sport_code": NCAA_SPORT_CODE,
        "stat_seq": stat_seq,
    }

    r = fetch(url, conn, params=params)
    if not r:
        return []

    soup = BeautifulSoup(r.text, "lxml")
    table = soup.find("table")
    if not table:
        return []

    headers = [th.get_text(strip=True) for th in table.find_all("th")]
    rows = table.find_all("tr")[1:]  # skip header

    results = []
    for row in rows:
        cells = row.find_all(["td", "th"])
        if len(cells) < 3:
            continue

        texts = [c.get_text(strip=True) for c in cells]

        # Extract player link for NCAA player ID
        player_link = row.find("a", href=re.compile(r"/players/\d+"))
        ncaa_player_id = None
        if player_link:
            pm = re.search(r"/players/(\d+)", player_link["href"])
            if pm:
                ncaa_player_id = pm.group(1)

        # Build row dict keyed by header
        row_dict: dict = {"_headers": headers}
        for i, h in enumerate(headers):
            if i < len(texts):
                row_dict[h] = texts[i]

        # Parse player info from the "Player" column
        player_text = row_dict.get("Player", "")
        parsed = _parse_player_from_ranking(player_text)
        row_dict["full_name"] = parsed["full_name"]
        row_dict["team_name"] = parsed["team_name"]
        row_dict["conference"] = parsed["conference"]
        row_dict["ncaa_player_id"] = ncaa_player_id
        row_dict["class_year"] = row_dict.get("Cl", "")
        row_dict["height"] = row_dict.get("Ht", "")
        row_dict["position"] = row_dict.get("Pos", "")
        row_dict["games"] = _safe_int(row_dict.get("G", "0"))

        results.append(row_dict)

    return results


def fetch_team_ranking(conn, stat_seq: str, division: str,
                       ranking_period: str = "120.0") -> list[dict]:
    """Fetch a team-level ranking page. Returns list of team stat dicts."""
    url = f"{NCAA_BASE_URL}/rankings/national_ranking"
    params = {
        "academic_year": NCAA_ACADEMIC_YEAR,
        "division": f"{division}.0",
        "ranking_period": ranking_period,
        "sport_code": NCAA_SPORT_CODE,
        "stat_seq": stat_seq,
    }

    r = fetch(url, conn, params=params)
    if not r:
        return []

    soup = BeautifulSoup(r.text, "lxml")
    table = soup.find("table")
    if not table:
        return []

    headers = [th.get_text(strip=True) for th in table.find_all("th")]
    rows = table.find_all("tr")[1:]

    results = []
    for row in rows:
        cells = row.find_all(["td", "th"])
        if len(cells) < 3:
            continue

        texts = [c.get_text(strip=True) for c in cells]
        row_dict: dict = {}
        for i, h in enumerate(headers):
            if i < len(texts):
                row_dict[h] = texts[i]

        # Extract team link for NCAA team ID
        team_link = row.find("a", href=re.compile(r"/teams/\d+"))
        if team_link:
            tm = re.search(r"/teams/(\d+)", team_link["href"])
            if tm:
                row_dict["ncaa_team_id"] = tm.group(1)

        # Parse team name from "Team" column: "Alabama (SEC)"
        team_text = row_dict.get("Team", "")
        m = re.match(r"^(.+?)\s*\(([^)]+)\)\s*$", team_text)
        if m:
            row_dict["team_name"] = m.group(1).strip()
            row_dict["conference"] = m.group(2).strip()
        else:
            row_dict["team_name"] = team_text.strip()
            row_dict["conference"] = None

        results.append(row_dict)

    return results


# ── Ranking Period Detection ──

def detect_ranking_period(conn, division: str) -> str:
    """
    Detect the latest ranking period for a division by fetching the
    stats category page and reading the first option in the period dropdown.
    D1 uses ranking_period ~120, D2 ~59, D3 varies.
    Returns the ranking period string (e.g., '120.0', '59.0').
    """
    url = f"{NCAA_BASE_URL}/rankings/change_sport_year_div"
    params = {
        "sport_code": NCAA_SPORT_CODE,
        "academic_year": NCAA_ACADEMIC_YEAR.replace(".0", ""),
        "division": division,
        "team_individual": "I",
    }
    headers = {"X-Requested-With": "XMLHttpRequest"}

    r = fetch(url, conn, params=params, headers=headers)
    if not r:
        log.warning(f"Could not detect ranking period for division {division}, defaulting to 120.0")
        return "120.0"

    soup = BeautifulSoup(r.text, "lxml")

    # Find the ranking period select or stat links with ranking_period param
    for link in soup.find_all("a", href=re.compile(r"ranking_period=[\d.]+")):
        m = re.search(r"ranking_period=([\d.]+)", link["href"])
        if m:
            period = m.group(1)
            log.info(f"  Detected ranking period for division {division}: {period}")
            return period

    # Fallback: try the select dropdown
    for sel in soup.find_all("select"):
        sel_id = sel.get("id", sel.get("name", ""))
        if "rp" in sel_id.lower():
            first_opt = sel.find("option")
            if first_opt and first_opt.get("value"):
                period = first_opt["value"]
                log.info(f"  Detected ranking period for division {division}: {period}")
                return period

    log.warning(f"Could not detect ranking period for division {division}, defaulting to 120.0")
    return "120.0"


# ── Stat Merging ──

def merge_player_stats(conn, division: str) -> dict[str, dict]:
    """
    Fetch multiple ranking pages and merge into complete player stat records.
    Key pages:
      - PPG: FGM, 3FG(=3PM), FT(=FTM), PTS (most complete, ~1500 players)
      - FG%: FGM, FGA
      - Total FGM: FGM, FGA (broader coverage)
      - 3P%: 3FG, 3FGA
      - Total 3PM: 3FG, 3FGA (broader coverage)
      - FT%: FT, FTA
      - Total FTM: FT, FTA (broader coverage)
      - Total Rebounds: ORebs, DRebs, REB
      - A/TO Ratio: AST, TO
      - SPG: ST
      - BPG: BLKS
      - MPG: MP, MPG
    Returns dict of player_key -> merged stat dict.
    """
    # Auto-detect the correct ranking period for this division
    ranking_period = detect_ranking_period(conn, division)
    log.info(f"  Using ranking period: {ranking_period}")

    merged: dict[str, dict] = {}

    def _merge(rows: list[dict], stat_fields: dict):
        """Merge rows into the merged dict, mapping column names to our field names."""
        for row in rows:
            key = _player_key(row.get("full_name", ""), row.get("team_name"))
            if key not in merged:
                merged[key] = {
                    "full_name": row.get("full_name"),
                    "team_name": row.get("team_name"),
                    "conference": row.get("conference"),
                    "ncaa_player_id": row.get("ncaa_player_id"),
                    "class_year": row.get("class_year", ""),
                    "height": row.get("height", ""),
                    "position": row.get("position", ""),
                    "games": row.get("games", 0),
                }
            record = merged[key]
            # Update ncaa_player_id if we got one and didn't have it
            if row.get("ncaa_player_id") and not record.get("ncaa_player_id"):
                record["ncaa_player_id"] = row["ncaa_player_id"]
            # Merge stat fields
            for col_name, our_field in stat_fields.items():
                val = row.get(col_name)
                if val and our_field not in record:
                    record[our_field] = val

    # 1. PPG (primary — has the most players: ~1500)
    log.info(f"  Fetching PPG rankings...")
    ppg_rows = fetch_ranking_page(conn, NCAA_STAT_SEQ["ppg"], division, ranking_period)
    log.info(f"    {len(ppg_rows)} players from PPG")
    _merge(ppg_rows, {
        "FGM": "fgm_raw", "3FG": "three_pm_raw", "FT": "ftm_raw",
        "PTS": "pts_raw", "PPG": "ppg",
    })

    # 2. FG% — gives us FGA
    log.info(f"  Fetching FG% rankings...")
    fgp_rows = fetch_ranking_page(conn, NCAA_STAT_SEQ["fg_pct"], division, ranking_period)
    log.info(f"    {len(fgp_rows)} players from FG%")
    _merge(fgp_rows, {
        "FGM": "fgm_raw", "FGA": "fga_raw", "FG%": "fg_pct",
    })

    # 3. Total FGM — also has FGA (broader coverage than FG%, ~370 players)
    log.info(f"  Fetching Total FGM rankings...")
    tfgm_rows = fetch_ranking_page(conn, "611.0", division, ranking_period)
    log.info(f"    {len(tfgm_rows)} players from Total FGM")
    _merge(tfgm_rows, {
        "FGM": "fgm_raw", "FGA": "fga_raw",
    })

    # 4. 3P% — gives us 3FGA
    log.info(f"  Fetching 3P% rankings...")
    tpp_rows = fetch_ranking_page(conn, NCAA_STAT_SEQ["3p_pct"], division, ranking_period)
    log.info(f"    {len(tpp_rows)} players from 3P%")
    _merge(tpp_rows, {
        "3FG": "three_pm_raw", "3FGA": "three_pa_raw", "3FG%": "three_pct",
    })

    # 5. Total 3PM — also has 3FGA (broader coverage than 3P%, ~354 players)
    log.info(f"  Fetching Total 3PM rankings...")
    t3pm_rows = fetch_ranking_page(conn, "621.0", division, ranking_period)
    log.info(f"    {len(t3pm_rows)} players from Total 3PM")
    _merge(t3pm_rows, {
        "3FG": "three_pm_raw", "3FGA": "three_pa_raw",
    })

    # 6. FT% — gives us FTA
    log.info(f"  Fetching FT% rankings...")
    ftp_rows = fetch_ranking_page(conn, NCAA_STAT_SEQ["ft_pct"], division, ranking_period)
    log.info(f"    {len(ftp_rows)} players from FT%")
    _merge(ftp_rows, {
        "FT": "ftm_raw", "FTA": "fta_raw", "FT%": "ft_pct",
    })

    # 7. Total FTM — also has FTA (broader coverage than FT%, ~367 players)
    log.info(f"  Fetching Total FTM rankings...")
    tftm_rows = fetch_ranking_page(conn, "850.0", division, ranking_period)
    log.info(f"    {len(tftm_rows)} players from Total FTM")
    _merge(tftm_rows, {
        "FT": "ftm_raw", "FTA": "fta_raw",
    })

    # 8. Total Rebounds — gives us ORebs, DRebs, REB
    log.info(f"  Fetching Total Rebounds rankings...")
    reb_rows = fetch_ranking_page(conn, NCAA_STAT_SEQ["total_reb"], division, ranking_period)
    log.info(f"    {len(reb_rows)} players from Total Rebounds")
    _merge(reb_rows, {
        "ORebs": "oreb_raw", "DRebs": "dreb_raw", "REB": "reb_raw",
    })

    # 9. A/TO Ratio — gives us AST, TO
    log.info(f"  Fetching Assist/Turnover Ratio rankings...")
    ato_rows = fetch_ranking_page(conn, NCAA_STAT_SEQ["ato"], division, ranking_period)
    log.info(f"    {len(ato_rows)} players from A/TO Ratio")
    _merge(ato_rows, {
        "AST": "ast_raw", "TO": "to_raw",
    })

    # 10. SPG — gives us ST (steals total)
    log.info(f"  Fetching Steals Per Game rankings...")
    spg_rows = fetch_ranking_page(conn, NCAA_STAT_SEQ["spg"], division, ranking_period)
    log.info(f"    {len(spg_rows)} players from SPG")
    _merge(spg_rows, {
        "ST": "stl_raw",
    })

    # 11. BPG — gives us BLKS (blocks total)
    log.info(f"  Fetching Blocks Per Game rankings...")
    bpg_rows = fetch_ranking_page(conn, NCAA_STAT_SEQ["bpg"], division, ranking_period)
    log.info(f"    {len(bpg_rows)} players from BPG")
    _merge(bpg_rows, {
        "BLKS": "blk_raw",
    })

    # 12. MPG — gives us total minutes and per-game
    log.info(f"  Fetching Minutes Per Game rankings...")
    mpg_rows = fetch_ranking_page(conn, NCAA_STAT_SEQ["mpg"], division, ranking_period)
    log.info(f"    {len(mpg_rows)} players from MPG")
    _merge(mpg_rows, {
        "MP": "mp_raw", "MPG": "mpg_raw",
    })

    # 13. APG — gives us AST (assists total) for players not in A/TO list
    log.info(f"  Fetching Assists Per Game rankings...")
    apg_rows = fetch_ranking_page(conn, NCAA_STAT_SEQ["apg"], division, ranking_period)
    log.info(f"    {len(apg_rows)} players from APG")
    _merge(apg_rows, {
        "AST": "ast_raw",
    })

    # 14. RPG — gives us REB total for players not in total rebounds list
    log.info(f"  Fetching Rebounds Per Game rankings...")
    rpg_rows = fetch_ranking_page(conn, NCAA_STAT_SEQ["rpg"], division, ranking_period)
    log.info(f"    {len(rpg_rows)} players from RPG")
    _merge(rpg_rows, {
        "REB": "reb_raw",
    })

    log.info(f"  Merged stats for {len(merged)} unique players")
    return merged


# ── Database Loading ──

def _normalize_position(pos: str) -> list[str]:
    """Normalize NCAA position string to a list of positions."""
    if not pos:
        return []
    pos = pos.strip().upper()
    # Common NCAA positions: G, F, C, G/F, F/C, etc.
    parts = re.split(r"[/,]", pos)
    return [p.strip() for p in parts if p.strip()]


def load_teams(conn, teams: list[dict], team_conferences: dict[str, str],
               division: str) -> dict[str, dict]:
    """
    Upsert teams, conferences, and team_seasons into database.
    Returns dict of ncaa_team_id -> {team_id, team_season_id, name}.
    """
    level_key = NCAA_DIV_TO_LEVEL_KEY[division]
    level_id = db.get_competitive_level_id(conn, level_key)
    division_id = db.get_division_id(conn, "ncaa", f"d{division}")

    team_map: dict[str, dict] = {}

    for t in teams:
        ncaa_id = t["ncaa_team_id"]
        name = t["name"]
        slug = f"ncaa-{ncaa_id}"

        # Upsert conference if known
        conference_id = None
        conf_name = team_conferences.get(ncaa_id)
        if conf_name:
            conference_id = db.upsert_conference(conn, division_id, conf_name)

        # Upsert team
        team_id = db.upsert_team(
            conn, name, slug, conference_id=conference_id,
            competitive_level_id=level_id,
            base_url=f"{NCAA_BASE_URL}/teams/{ncaa_id}",
        )

        # Upsert team season
        team_season_id = db.upsert_team_season(conn, team_id, SEASON)

        team_map[ncaa_id] = {
            "team_id": team_id,
            "team_season_id": team_season_id,
            "name": name,
        }

    conn.commit()
    log.info(f"Loaded {len(team_map)} teams into database")
    return team_map


def _find_team_by_name(team_name: str, team_map: dict[str, dict]) -> dict | None:
    """Find a team in the team_map by name (fuzzy match)."""
    if not team_name:
        return None

    tn_lower = team_name.lower().strip()

    # Exact match first
    for ncaa_id, info in team_map.items():
        if info["name"].lower().strip() == tn_lower:
            return info

    # Substring match
    for ncaa_id, info in team_map.items():
        db_name = info["name"].lower().strip()
        if tn_lower in db_name or db_name in tn_lower:
            return info

    # Word overlap match
    tn_words = set(tn_lower.split())
    best_match = None
    best_overlap = 0
    for ncaa_id, info in team_map.items():
        db_words = set(info["name"].lower().split())
        overlap = len(tn_words & db_words)
        if overlap > best_overlap and overlap >= 1:
            best_overlap = overlap
            best_match = info

    return best_match


def load_player_stats(conn, merged_stats: dict[str, dict],
                      team_map: dict[str, dict]) -> dict:
    """
    Load merged player season stats into the database.
    Creates N synthetic per-game records (one per game played) so the KR engine
    sees realistic game counts and assigns proper confidence scores.
    Returns counts dict.
    """
    counts = {"players": 0, "matched": 0, "unmatched": 0, "pgs_created": 0}

    for key, record in merged_stats.items():
        full_name = record.get("full_name")
        team_name = record.get("team_name")

        if not full_name:
            continue

        # Find the team in our team_map
        team_info = _find_team_by_name(team_name, team_map)
        if not team_info:
            counts["unmatched"] += 1
            continue

        team_season_id = team_info["team_season_id"]
        positions = _normalize_position(record.get("position", ""))

        # Upsert player
        player_id = db.upsert_player(conn, full_name, positions=positions or None)

        # Upsert player_team_season (roster entry)
        pts_id = db.upsert_player_team_season(
            conn, player_id, team_season_id,
            class_year=record.get("class_year", ""),
            roster_status="active",
        )

        games = record.get("games", 0)
        if games <= 0:
            counts["matched"] += 1
            counts["players"] += 1
            continue

        # Parse raw stat values (season totals from ranking pages)
        fgm = _safe_int(record.get("fgm_raw", "0"))
        fga = _safe_int(record.get("fga_raw", "0"))
        three_pm = _safe_int(record.get("three_pm_raw", "0"))
        three_pa = _safe_int(record.get("three_pa_raw", "0"))
        ftm = _safe_int(record.get("ftm_raw", "0"))
        fta = _safe_int(record.get("fta_raw", "0"))
        pts = _safe_int(record.get("pts_raw", "0"))
        oreb = _safe_int(record.get("oreb_raw", "0"))
        dreb = _safe_int(record.get("dreb_raw", "0"))
        reb = _safe_int(record.get("reb_raw", "0"))
        ast = _safe_int(record.get("ast_raw", "0"))
        stl = _safe_int(record.get("stl_raw", "0"))
        blk = _safe_int(record.get("blk_raw", "0"))
        turnovers = _safe_int(record.get("to_raw", "0"))

        # If FGA is missing but we have FGM, estimate: FGA ≈ FGM / 0.44
        if fga == 0 and fgm > 0:
            fga = round(fgm / 0.44)
        # If 3PA missing but we have 3PM, estimate: 3PA ≈ 3PM / 0.34
        if three_pa == 0 and three_pm > 0:
            three_pa = round(three_pm / 0.34)
        # If FTA missing but we have FTM, estimate: FTA ≈ FTM / 0.73
        if fta == 0 and ftm > 0:
            fta = round(ftm / 0.73)
        # If PTS missing but we have components, compute: PTS = 2*(FGM-3PM) + 3*3PM + FTM
        if pts == 0 and fgm > 0:
            pts = 2 * (fgm - three_pm) + 3 * three_pm + ftm
        # If REB missing but we have OREB+DREB
        if reb == 0 and (oreb > 0 or dreb > 0):
            reb = oreb + dreb

        # Compute per-game averages
        mpg = _parse_minutes(record.get("mpg_raw", "0")) if record.get("mpg_raw") else 0
        if mpg == 0 and pts > 0 and games > 0:
            # Estimate MPG from usage: ~1.2 min per point is a reasonable heuristic
            mpg = min(round(pts / games * 1.2, 1), 40.0)

        avg_stats = {
            "started": True,
            "minutes": mpg,
            "fgm": round(fgm / games, 1),
            "fga": round(fga / games, 1),
            "three_pm": round(three_pm / games, 1),
            "three_pa": round(three_pa / games, 1),
            "ftm": round(ftm / games, 1),
            "fta": round(fta / games, 1),
            "oreb": round(oreb / games, 1),
            "dreb": round(dreb / games, 1),
            "reb": round(reb / games, 1),
            "ast": round(ast / games, 1),
            "stl": round(stl / games, 1),
            "blk": round(blk / games, 1),
            "turnovers": round(turnovers / games, 1),
            "pf": round(2.0, 1),  # NCAA avg ~2.0 PF/game; no ranking page for PF
            "pts": round(pts / games, 1),
        }

        # Create N synthetic games (one per game played) with identical per-game
        # averages. The KR engine computes BPR per game, so N records gives proper
        # confidence scores and avoids the single-game low-confidence trap.
        for g_idx in range(games):
            syn_game_id = f"ncaa-syn-{team_info['team_id']}-{SEASON}-g{g_idx+1:02d}"
            game_id = db.upsert_game(
                conn, syn_game_id, SEASON, None,
                team_season_id, None,
                None, None,
                game_type="SEASON_AVG",
            )
            db.upsert_player_game_stats(conn, game_id, pts_id, avg_stats)
            counts["pgs_created"] += 1

        counts["matched"] += 1
        counts["players"] += 1

    conn.commit()
    log.info(f"Loaded {counts['matched']} players, {counts['pgs_created']} synthetic game rows "
             f"({counts['unmatched']} unmatched to teams)")
    return counts


# ── Full Pipeline ──

def scrape_division(conn, division: str, limit: int | None = None,
                    skip_conferences: bool = False):
    """Full scrape pipeline for one NCAA division."""
    label = NCAA_DIV_DISPLAY.get(division, f"D{division}")
    log.info(f"\n{'='*60}")
    log.info(f"  STARTING {label}")
    log.info(f"{'='*60}")

    # Step 1: Discover teams
    teams = discover_teams(conn, division)
    if not teams:
        log.error(f"No teams found for {label}")
        return

    if limit:
        teams = teams[:limit]

    # Step 2: Map conferences (optional, can be slow for large divisions)
    team_conferences: dict[str, str] = {}
    if not skip_conferences:
        team_conferences = map_team_conferences(conn, teams)

    # Step 3: Load teams into database
    team_map = load_teams(conn, teams, team_conferences, division)

    # Step 4: Scrape and merge player stats from ranking pages
    log.info(f"\nScraping player season stats from ranking pages...")
    merged_stats = merge_player_stats(conn, division)

    # Step 5: Load player stats into database
    log.info(f"\nLoading player stats into database...")
    counts = load_player_stats(conn, merged_stats, team_map)

    log.info(f"\n{label} COMPLETE: {len(teams)} teams, "
             f"{counts['players']} players with stats")

    return {
        "teams": len(teams),
        "players": counts["players"],
        "matched": counts["matched"],
        "unmatched": counts["unmatched"],
    }


def print_summary(conn, label: str = "NCAA SCRAPER"):
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
    print(f"  {label} -- FINAL SUMMARY")
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
    mode = sys.argv[1] if len(sys.argv) > 1 else "d1-one"

    conn = db.get_conn()

    try:
        if mode == "d1":
            scrape_division(conn, "1")
            conn.commit()
            print_summary(conn, "NCAA D1 SCRAPER")

        elif mode == "d2":
            scrape_division(conn, "2")
            conn.commit()
            print_summary(conn, "NCAA D2 SCRAPER")

        elif mode == "d3":
            scrape_division(conn, "3")
            conn.commit()
            print_summary(conn, "NCAA D3 SCRAPER")

        elif mode == "all":
            for div in ["1", "2", "3"]:
                scrape_division(conn, div)
                conn.commit()
            print_summary(conn, "NCAA SCRAPER (ALL)")

        elif mode == "d1-one":
            # Test with one team's worth of data (limited team discovery)
            log.info("Test mode: scraping D1 with limit=5 teams, skip conferences")
            scrape_division(conn, "1", limit=5, skip_conferences=True)
            conn.commit()
            print_summary(conn, "NCAA D1 TEST")

        elif mode == "d2-one":
            log.info("Test mode: scraping D2 with limit=5 teams, skip conferences")
            scrape_division(conn, "2", limit=5, skip_conferences=True)
            conn.commit()
            print_summary(conn, "NCAA D2 TEST")

        elif mode == "d3-one":
            log.info("Test mode: scraping D3 with limit=5 teams, skip conferences")
            scrape_division(conn, "3", limit=5, skip_conferences=True)
            conn.commit()
            print_summary(conn, "NCAA D3 TEST")

        else:
            print("Usage: python3 ncaa_scraper.py [d1|d2|d3|all|d1-one|d2-one|d3-one]")
            print()
            print("Modes:")
            print("  d1       Scrape all NCAA Division I teams + player season stats")
            print("  d2       Scrape all NCAA Division II teams + player season stats")
            print("  d3       Scrape all NCAA Division III teams + player season stats")
            print("  all      Scrape all three NCAA divisions")
            print("  d1-one   Test mode: 5 D1 teams, skip conference mapping")
            print("  d2-one   Test mode: 5 D2 teams, skip conference mapping")
            print("  d3-one   Test mode: 5 D3 teams, skip conference mapping")
            sys.exit(1)

    finally:
        conn.close()


if __name__ == "__main__":
    main()
