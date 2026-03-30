"""
scrape_team_metadata.py
Populates head_coach, wins, losses, conf_wins, conf_losses in team_seasons
and city/state in teams.

Sources:
  D1 (espn-{id} slugs):  ESPN core + site API (coach, record, city/state)
  D2/D3 (ncaa-{id/slug}): NCAA stats ranking page (win_pct seq 168)
                           + conf record computed from team_game_log
  NAIA:                   naiastats.prestosports.com conference standings (curl_cffi)
  NJCAA D1/D2/D3:         njcaastats.prestosports.com per-team teamData S3 JSON
  CCCAA:                  cccaasports.org conference standings HTML

Also supports --conf-abbr to populate conference abbreviations from a
hardcoded dict (no network calls).

Usage:
    python3 scrape_team_metadata.py                          # D1 all sub-levels
    python3 scrape_team_metadata.py --levels ncaa_d1_high_major
    python3 scrape_team_metadata.py --levels ncaa_d2,ncaa_d3
    python3 scrape_team_metadata.py --levels naia,njcaa_d1,njcaa_d2,njcaa_d3,cccaa
    python3 scrape_team_metadata.py --conf-abbr
    python3 scrape_team_metadata.py --dry-run
    python3 scrape_team_metadata.py --skip-done             # skip teams with all fields populated
"""
from __future__ import annotations

import argparse
import logging
import re
import sys
import time

import httpx
import psycopg
import psycopg.rows

from config import DB_CONFIG, SEASON

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("team_metadata")

# ── ESPN API constants ────────────────────────────────────────────────────────
ESPN_SITE_API  = "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball"
ESPN_CORE_API  = "https://sports.core.api.espn.com/v2/sports/basketball/leagues/mens-college-basketball"
ESPN_SEASON    = "2026"  # ESPN uses end-year (2025-26 → 2026)
ESPN_DELAY     = 0.4     # seconds between ESPN API calls

# ── NCAA stats constants ──────────────────────────────────────────────────────
NCAA_BASE_URL     = "https://stats.ncaa.org"
NCAA_ACADEMIC_YEAR = "2026.0"
NCAA_SPORT_CODE   = "MBB"
NCAA_DELAY        = 2.0  # NCAA blocks fast requests

# ── PrestoSports constants (NAIA / NJCAA / CCCAA) ─────────────────────────────
PRESTO_DELAY   = 0.35   # seconds between PrestoSports HTML page calls
NAIA_BASE      = "https://naiastats.prestosports.com"
NJCAA_BASE     = "https://njcaastats.prestosports.com"
CCCAA_BASE     = "https://www.cccaasports.org"
PRESTO_SEASON  = "2025-26"

# ── Level ordering (priority) ─────────────────────────────────────────────────
ESPN_LEVELS = [
    "ncaa_d1_high_major",
    "ncaa_d1_mid_major",
    "ncaa_d1_low_major",
]
NCAA_LEVELS = [
    "ncaa_d2",
    "ncaa_d3",
]
PRESTO_LEVELS = [
    "naia",
    "njcaa_d1",
    "njcaa_d2",
    "njcaa_d3",
    "cccaa",
]
NCAA_DIVISION_MAP = {
    "ncaa_d2": "2",
    "ncaa_d3": "3",
}
NJCAA_DIV_MAP = {
    "njcaa_d1": "div1",
    "njcaa_d2": "div2",
    "njcaa_d3": "div3",
}
# Ranking periods by division (final/end-of-season)
NCAA_RANKING_PERIODS = {
    "2": "59.0",
    "3": "117.0",   # end-of-season period for D3
}

# ── Conference abbreviations (hardcoded) ─────────────────────────────────────
CONF_ABBR: dict[str, str] = {
    # D1 Power / High Major
    "Atlantic Coast Conference":              "ACC",
    "Big 12 Conference":                      "Big 12",
    "Big Ten Conference":                     "Big Ten",
    "BIG EAST Conference":                    "Big East",
    "Pac-12 Conference":                      "Pac-12",
    "Southeastern Conference":                "SEC",
    # D1 Mid Major
    "American Athletic Conference":           "AAC",
    "Atlantic 10 Conference":                 "A-10",
    "Mountain West Conference":               "MWC",
    "Missouri Valley Conference":             "MVC",
    "West Coast Conference":                  "WCC",
    "Conference USA":                         "CUSA",
    "Atlantic Sun Conference":                "ASUN",
    "Western Athletic Conference":            "WAC",
    # D1 Low Major
    "America East Conference":                "AE",
    "Big Sky Conference":                     "Big Sky",
    "Big South Conference":                   "Big South",
    "Big West Conference":                    "Big West",
    "Coastal Athletic Association":           "CAA",
    "Colonial Athletic Association":          "CAA",
    "Horizon League":                         "Horizon",
    "Ivy League":                             "Ivy",
    "Metro Atlantic Athletic Conference":     "MAAC",
    "Mid-American Conference":                "MAC",
    "Mid-Eastern Athletic Conf.":             "MEAC",
    "Mid-Eastern Athletic Conference":        "MEAC",
    "Northeast Conference":                   "NEC",
    "Ohio Valley Conference":                 "OVC",
    "Patriot League":                         "Patriot",
    "Southern Conference":                    "SoCon",
    "Southland Conference":                   "Southland",
    "Summit League":                          "Summit",
    "Sun Belt Conference":                    "Sun Belt",
    "Southwestern Athletic Conference":       "SWAC",
    "SWAC":                                   "SWAC",
    # D1 alternate names
    "American Conference":                    "AAC",
    "The Ivy League":                         "Ivy",
    "The Summit League":                      "Summit",
    "The Sun Conference":                     "Sun",
    "Mountain West":                          "MWC",
    "Big West":                               "Big West",
    "Atlantic 10":                            "A-10",
    "Ivy":                                    "Ivy",
    "Sun":                                    "Sun",
    "CUSA":                                   "CUSA",
    "MVC":                                    "MVC",
    "MWC":                                    "MWC",
    "Southwestern Athletic Conf.":            "SWAC",
    # D2 conferences
    "Great Lakes Valley Conference":          "GLVC",
    "Gulf South Conference":                  "GSC",
    "Gulf South":                             "GSC",
    "Central Atlantic Collegiate Conference": "CACC",
    "Pennsylvania State Athletic Conference": "PSAC",
    "Lone Star Conference":                   "LSC",
    "Lone Star":                              "LSC",
    "Mid-America Intercollegiate Athletics Association": "MIAA",
    "Mid-America Intercollegiate":            "MIAA",
    "Great Midwest Athletic Conference":      "G-MAC",
    "Northern Sun Intercollegiate Conference": "NSIC",
    "Rocky Mountain Athletic Conference":     "RMAC",
    "South Atlantic Conference":              "SAC",
    "Sunshine State Conference":              "SSC",
    "Sunshine State":                         "SSC",
    "Southern Intercollegiate Athletic Conference": "SIAC",
    "Central Intercollegiate Athletic Association": "CIAA",
    "East Coast Conference":                  "ECC",
    "Peach Belt Conference":                  "Peach Belt",
    "Great American Conference":              "GAC",
    "Mountain East Conference":               "MEC",
    "Great Lakes Intercollegiate Athletic Conference": "GLIAC",
    "Great Northwest Athletic Conference":    "GNAC",
    "Great Northwest":                        "GNAC",
    "PacWest Conference":                     "PacWest",
    "Northeast-10 Conference":                "NE10",
    "California Collegiate Athletic Association": "CCAA",
    # Already-abbreviated names that ARE the abbreviation
    "AMCC":     "AMCC",
    "AMC":      "AMC",
    "ASC":      "ASC",
    "CACC":     "CACC",
    "CCAA":     "CCAA",
    "CCIW":     "CCIW",
    "CCS":      "CCS",
    "CIAA":     "CIAA",
    "CNE":      "CNE",
    "CUNYAC":   "CUNYAC",
    "ECC":      "ECC",
    "G-MAC":    "G-MAC",
    "GAC":      "GAC",
    "GCAC":     "GCAC",
    "GLIAC":    "GLIAC",
    "GLVC":     "GLVC",
    "GNAC":     "GNAC",
    "HCAC":     "HCAC",
    "KCAC":     "KCAC",
    "MASCAC":   "MASCAC",
    "MEC":      "MEC",
    "MIAC":     "MIAC",
    "NACC":     "NACC",
    "NCAC":     "NCAC",
    "NE10":     "NE10",
    "NESCAC":   "NESCAC",
    "NEWMAC":   "NEWMAC",
    "NJAC":     "NJAC",
    "NSIC":     "NSIC",
    "NWC":      "NWC",
    "OAC":      "OAC",
    "ODAC":     "ODAC",
    "PAC":      "PAC",
    "PSAC":     "PSAC",
    "PacWest":  "PacWest",
    "RMAC":     "RMAC",
    "SAA":      "SAA",
    "SAC":      "SAC",
    "SCAC":     "SCAC",
    "SCIAC":    "SCIAC",
    "SIAC":     "SIAC",
    "SLIAC":    "SLIAC",
    "SUNYAC":   "SUNYAC",
    "UAA":      "UAA",
    "UMAC":     "UMAC",
    "WIAC":     "WIAC",
    # D2/D3/NAIA common full names
    "American Midwest Conference":            "AMC",
    "American Rivers Conference":             "ARC",
    "American Rivers":                        "ARC",
    "Appalachian Athletic Conference":        "AAC",
    "Atlantic East Conference":               "AEC",
    "Atlantic East":                          "AEC",
    "California Pacific Conference":          "CalPac",
    "Cascade Collegiate Conference":          "CCC",
    "Centennial Conference":                  "Centennial",
    "Chicagoland Collegiate Athletic Conference": "CCAC",
    "Conference Carolinas":                   "CC",
    "Continental Athletic Conference":        "CAC",
    "Crossroads League":                      "Crossroads",
    "Empire 8":                               "E8",
    "Frontier Conference":                    "Frontier",
    "Frontier":                               "Frontier",
    "Great Northeast Conference":             "GNE",
    "Great Northeast":                        "GNE",
    "Great Plains Athletic Conference":       "GPAC",
    "Great Southwest Athletic Conference":    "GSAC",
    "HBCU Conference":                        "HBCU",
    "Heart of America Athletic Conference":   "HAAC",
    "Independent":                            "Ind.",
    "Kansas Collegiate Athletic Conference":  "KCAC",
    "Landmark Conference":                    "Landmark",
    "Liberty League":                         "Liberty",
    "Little East Conference":                 "LEC",
    "Little East":                            "LEC",
    "Michigan Intercol. Ath. Assn.":          "MIAA",
    "Mid-South Conference":                   "Mid-South",
    "Mid-South":                              "Mid-South",
    "Middle Atlantic Conference":             "MAC",
    "North Atlantic Conference":              "NAC",
    "North Atlantic":                         "NAC",
    "North Star Athletic Association":        "NSAA",
    "Northern Athletics Collegiate Conference": "NACC",
    "Red River Athletic Conference":          "RRAC",
    "River States Conference":                "RSC",
    "Skyline Conference":                     "Skyline",
    "Sooner Athletic Conference":             "SAC",
    "Southern States Athletic Conference":    "SSAC",
    "United East Conference":                 "UEC",
    "United East":                            "UEC",
    "USA South Athletic Conference":          "USA South",
    "USA South":                              "USA South",
    "Wolverine-Hoosier Athletic Conference":  "WHAC",
    # Bare names (no "Conference" suffix)
    "C2C":          "C2C",
    "Centennial":   "Centennial",
    "Landmark":     "Landmark",
    "Skyline":      "Skyline",
    "Peach Belt":   "Peach Belt",
    "Middle Atlantic": "MAC",
    # NJCAA conferences
    "Alabama Community College Conference":        "ACCC",
    "Arizona Community College Athletic Conference": "ACCAC",
    "Georgia Collegiate Athletic Association":     "GCAA",
    "Great Rivers Athletic Conference":            "GRAC",
    "Iowa Community College Athletic Conference":  "ICCAC",
    "Kansas Jayhawk Community College Conference": "KJCCC",
    "Maryland Junior College Athletic Conference": "MDJUCO",
    "Mid-Florida Conference":                      "MFC",
    "Mon-Dak Conference":                          "Mon-Dak",
    "Panhandle Conference":                        "Panhandle",
    "Suncoast Conference":                         "Suncoast",
    "Tennessee Community College Athletic Association": "TCCAA",
    "Western Junior College Athletic Conference":  "WJCAC",
    "Allegheny Mountain Collegiate Conference":    "AMCC",
    "New England Juco Athletic Conference":        "NEJAC",
    "Pennsylvania College Conference":             "PCC",
    "Western States Junior College Athletic Conference": "WSJCAC",
    "California Community College Athletic Association": "CCCAA",
    # CCCAA (California community college) conferences
    "Bay Valley Conference":                       "BVC",
    "Coast Conference":                            "Coast",
    "Foothill-De Anza Athletic Conference":        "FDA",
    "Gold Coast Conference":                       "GCC",
    "Golden Valley Conference":                    "GVC",
    "Mission Conference":                          "Mission",
    "Orange Empire Conference":                    "OEC",
    "Pacific Coast Athletic Conference":           "PCAC",
    "South Coast Conference":                      "SCC",
    "Southern California Football Association":    "SCFA",
    "Western State Conference":                    "WSC",
}

# ── Rate-limited HTTP ─────────────────────────────────────────────────────────
_last_espn_call = 0.0

def espn_get(url: str, params: dict | None = None) -> dict | None:
    """GET ESPN API URL with rate limiting. Returns parsed JSON or None."""
    global _last_espn_call
    elapsed = time.time() - _last_espn_call
    if elapsed < ESPN_DELAY:
        time.sleep(ESPN_DELAY - elapsed)
    try:
        r = httpx.get(url, params=params, follow_redirects=True, timeout=30)
        _last_espn_call = time.time()
        if r.status_code != 200:
            log.debug(f"ESPN {r.status_code}: {url}")
            return None
        return r.json()
    except Exception as e:
        _last_espn_call = time.time()
        log.debug(f"ESPN error {url}: {e}")
        return None


# ── DB helpers ────────────────────────────────────────────────────────────────
def db_connect():
    return psycopg.connect(
        host=DB_CONFIG["host"],
        port=DB_CONFIG["port"],
        dbname=DB_CONFIG["dbname"],
        row_factory=psycopg.rows.dict_row,
    )


def get_d1_teams(conn, level_key: str) -> list[dict]:
    """Return all ESPN-slug teams for a D1 level with their team_season_id."""
    rows = conn.execute("""
        SELECT
            t.id        AS team_id,
            t.name      AS team_name,
            t.slug,
            t.city,
            t.state,
            ts.id       AS team_season_id,
            ts.head_coach,
            ts.wins,
            ts.losses,
            ts.conf_wins,
            ts.conf_losses,
            c.name      AS conf_name
        FROM teams t
        JOIN competitive_levels cl ON cl.id = t.competitive_level_id
        JOIN team_seasons ts        ON ts.team_id = t.id
        LEFT JOIN conferences c    ON c.id = t.conference_id
        WHERE cl.level_key = %s
          AND t.slug LIKE 'espn-%%'
          AND t.slug NOT LIKE 'espn-opp-%%'
          AND ts.season = %s
        ORDER BY t.name
    """, (level_key, SEASON)).fetchall()
    return rows


def get_ncaa_teams(conn, level_key: str) -> list[dict]:
    """Return all NCAA-slug teams for D2/D3."""
    rows = conn.execute("""
        SELECT
            t.id        AS team_id,
            t.name      AS team_name,
            t.slug,
            ts.id       AS team_season_id,
            ts.head_coach,
            ts.wins,
            ts.losses,
            ts.conf_wins,
            ts.conf_losses,
            c.id        AS conference_id,
            c.name      AS conf_name
        FROM teams t
        JOIN competitive_levels cl ON cl.id = t.competitive_level_id
        JOIN team_seasons ts        ON ts.team_id = t.id
        LEFT JOIN conferences c    ON c.id = t.conference_id
        WHERE cl.level_key = %s
          AND t.slug LIKE 'ncaa-%%'
          AND ts.season = %s
        ORDER BY t.name
    """, (level_key, SEASON)).fetchall()
    return rows


def update_team_season(conn, team_season_id: str, dry_run: bool, **kwargs):
    """Update team_seasons row with provided kwargs (non-None values only)."""
    fields = {k: v for k, v in kwargs.items() if v is not None}
    if not fields:
        return
    set_clause = ", ".join(f"{k} = %s" for k in fields)
    values = list(fields.values()) + [team_season_id]
    if not dry_run:
        conn.execute(
            f"UPDATE team_seasons SET {set_clause} WHERE id = %s",
            values,
        )


def update_team_location(conn, team_id: str, dry_run: bool, city: str | None, state: str | None):
    """Update teams.city and teams.state."""
    fields = {}
    if city:
        fields["city"] = city
    if state:
        fields["state"] = state
    if not fields:
        return
    set_clause = ", ".join(f"{k} = %s" for k in fields)
    values = list(fields.values()) + [team_id]
    if not dry_run:
        conn.execute(
            f"UPDATE teams SET {set_clause} WHERE id = %s",
            values,
        )


# ── ESPN D1 scraping ──────────────────────────────────────────────────────────

def espn_id_from_slug(slug: str) -> str | None:
    """'espn-252' → '252'"""
    m = re.match(r"^espn-(\d+)$", slug)
    return m.group(1) if m else None


def fetch_espn_team_core(espn_id: str) -> dict | None:
    """
    Fetch ESPN core API for a team.
    Returns dict with: city, state, group_id, coaches_ref
    """
    url = f"{ESPN_CORE_API}/seasons/{ESPN_SEASON}/teams/{espn_id}"
    data = espn_get(url)
    if not data:
        return None

    result: dict = {}

    # City/State from venue (inline in core API response)
    venue = data.get("venue") or {}
    addr  = venue.get("address") or {}
    result["city"]  = addr.get("city")
    result["state"] = addr.get("state")

    # Group ID from groups.$ref URL
    groups_ref = (data.get("groups") or {}).get("$ref", "")
    gm = re.search(r"/groups/(\d+)", groups_ref)
    result["group_id"] = gm.group(1) if gm else None

    # Coaches list $ref URL
    coaches_ref = (data.get("coaches") or {}).get("$ref", "")
    result["coaches_ref"] = coaches_ref or None

    return result


def fetch_espn_overall_record(espn_id: str) -> tuple[int | None, int | None]:
    """Fetch overall W/L from site API."""
    url = f"{ESPN_SITE_API}/teams/{espn_id}"
    data = espn_get(url)
    if not data:
        return None, None
    team = data.get("team") or {}
    for item in (team.get("record") or {}).get("items", []):
        if item.get("type") == "total":
            summary = item.get("summary", "")
            m = re.match(r"(\d+)-(\d+)", summary)
            if m:
                return int(m.group(1)), int(m.group(2))
    return None, None


def fetch_espn_coach(coaches_ref: str) -> str | None:
    """Follow coaches $ref → get first coach's full name."""
    data = espn_get(coaches_ref)
    if not data:
        return None
    items = data.get("items", [])
    if not items:
        return None
    # Each item is a $ref to the coach
    coach_ref = items[0].get("$ref")
    if not coach_ref:
        return None
    coach_data = espn_get(coach_ref)
    if not coach_data:
        return None
    first = coach_data.get("firstName", "")
    last  = coach_data.get("lastName", "")
    name  = f"{first} {last}".strip()
    return name or None


def fetch_espn_conference_standings(group_id: str) -> dict[str, tuple[int, int, int, int]]:
    """
    Fetch standings for a conference group.
    Returns {espn_team_id: (overall_w, overall_l, conf_w, conf_l)}
    Uses regular-season type (types/2).
    """
    url = f"{ESPN_CORE_API}/seasons/{ESPN_SEASON}/types/2/groups/{group_id}/standings/0"
    data = espn_get(url)
    if not data:
        return {}

    result: dict[str, tuple[int, int, int, int]] = {}
    for entry in data.get("standings", []):
        team_ref = (entry.get("team") or {}).get("$ref", "")
        tm = re.search(r"/teams/(\d+)", team_ref)
        if not tm:
            continue
        espn_id = tm.group(1)

        overall_w = overall_l = conf_w = conf_l = None
        for rec in entry.get("records", []):
            rec_id = str(rec.get("id", ""))
            summary = rec.get("summary") or rec.get("displayValue") or ""
            m = re.match(r"(\d+)-(\d+)", summary)
            if not m:
                continue
            w, l = int(m.group(1)), int(m.group(2))
            if rec_id == "0":   # overall
                overall_w, overall_l = w, l
            elif rec_id == "9": # conference
                conf_w, conf_l = w, l

        if overall_w is not None:
            result[espn_id] = (overall_w, overall_l, conf_w, conf_l)

    return result


def process_d1_level(conn, level_key: str, dry_run: bool, skip_done: bool):
    """Scrape ESPN data for all teams in a D1 level."""
    teams = get_d1_teams(conn, level_key)
    log.info(f"\n{'='*60}")
    log.info(f"Level: {level_key}  —  {len(teams)} teams")
    log.info(f"{'='*60}")

    if not teams:
        log.info("  No teams found — skipping")
        return

    # Collect group_ids and build per-team info in one pass
    group_id_to_espn_ids: dict[str, list[str]] = {}
    team_core_data: dict[str, dict] = {}  # espn_id → core info

    done_count = skip_count = 0

    for team in teams:
        espn_id = espn_id_from_slug(team["slug"])
        if not espn_id:
            continue

        # Skip if all fields already populated
        if skip_done and all([
            team.get("head_coach"),
            team.get("wins") is not None,
            team.get("conf_wins") is not None,
            team.get("city"),
        ]):
            skip_count += 1
            continue

        core = fetch_espn_team_core(espn_id)
        if not core:
            log.warning(f"  No core data for {team['team_name']} (espn-{espn_id})")
            continue

        team_core_data[espn_id] = core

        gid = core.get("group_id")
        if gid:
            group_id_to_espn_ids.setdefault(gid, []).append(espn_id)

    if skip_count:
        log.info(f"  Skipped {skip_count} already-done teams")

    if not team_core_data:
        log.info("  Nothing to fetch")
        return

    # Fetch standings for each unique group
    log.info(f"  Fetching standings for {len(group_id_to_espn_ids)} conference groups ...")
    standings: dict[str, tuple] = {}  # espn_id → (w, l, cw, cl)
    for gid in sorted(group_id_to_espn_ids):
        gstands = fetch_espn_conference_standings(gid)
        standings.update(gstands)
        log.info(f"    Group {gid}: {len(gstands)} teams in standings")

    # Process each team
    updated = no_coach = no_record = 0
    for team in teams:
        espn_id = espn_id_from_slug(team["slug"])
        if not espn_id or espn_id not in team_core_data:
            continue

        core = team_core_data[espn_id]

        # Coach
        coach = None
        if core.get("coaches_ref"):
            coach = fetch_espn_coach(core["coaches_ref"])
        if not coach:
            no_coach += 1

        # Overall record (from site API if not in standings)
        if espn_id in standings:
            ow, ol, cw, cl = standings[espn_id]
        else:
            ow, ol = fetch_espn_overall_record(espn_id)
            cw = cl = None
            if ow is None:
                no_record += 1

        # City/state
        city  = core.get("city")
        state = core.get("state")

        # Log
        record_str = f"{ow}-{ol}" if ow is not None else "?"
        conf_str   = f"{cw}-{cl}" if cw is not None else "?"
        log.info(
            f"  {team['team_name']:<35} {record_str:>6} conf:{conf_str:>6}"
            f"  coach:{coach or '—':30}  {city or ''}{',' if city and state else ''}{state or ''}"
        )

        # Update DB
        update_team_season(
            conn, team["team_season_id"], dry_run,
            head_coach=coach,
            wins=ow,
            losses=ol,
            conf_wins=cw,
            conf_losses=cl,
        )
        update_team_location(conn, team["team_id"], dry_run, city=city, state=state)
        updated += 1

    if not dry_run:
        conn.commit()

    log.info(f"\n  ✓ {level_key}: {updated} updated, {no_coach} missing coach, {no_record} missing record")


# ── NCAA D2/D3 scraping ───────────────────────────────────────────────────────

def fetch_ncaa_win_pct_page(division: str, ranking_period: str) -> dict[str, tuple[int, int]]:
    """
    Fetch the win_pct national ranking page (seq 168) from NCAA stats.
    Returns {ncaa_team_id: (wins, losses)}.
    Requires curl_cffi.
    """
    try:
        from curl_cffi import requests as cffi_requests
    except ImportError:
        log.warning("curl_cffi not installed — skipping NCAA stats scraping")
        return {}

    from bs4 import BeautifulSoup

    url = f"{NCAA_BASE_URL}/rankings/national_ranking"
    params = {
        "academic_year": NCAA_ACADEMIC_YEAR,
        "division":      f"{division}.0",
        "ranking_period": ranking_period,
        "sport_code":    NCAA_SPORT_CODE,
        "stat_seq":      "168.0",  # Win Pct: W, L, Pct
    }

    time.sleep(NCAA_DELAY)
    try:
        session = cffi_requests.Session(impersonate="chrome120")
        r = session.get(url, params=params, timeout=60)
        if r.status_code != 200:
            log.warning(f"NCAA stats HTTP {r.status_code} for D{division}")
            return {}
    except Exception as e:
        log.warning(f"NCAA stats fetch error: {e}")
        return {}

    soup = BeautifulSoup(r.text, "lxml")
    table = soup.find("table")
    if not table:
        log.warning("No table found on NCAA win_pct page")
        return {}

    headers = [th.get_text(strip=True) for th in table.find_all("th")]
    result: dict[str, tuple[int, int]] = {}

    for row in table.find_all("tr")[1:]:
        cells = row.find_all(["td", "th"])
        if len(cells) < 3:
            continue
        texts = [c.get_text(strip=True) for c in cells]
        row_dict = {h: texts[i] for i, h in enumerate(headers) if i < len(texts)}

        # Extract team link for NCAA team ID
        team_link = row.find("a", href=re.compile(r"/teams/\d+"))
        if not team_link:
            continue
        tm = re.search(r"/teams/(\d+)", team_link["href"])
        if not tm:
            continue
        ncaa_id = tm.group(1)

        # Parse W and L columns
        try:
            w = int(row_dict.get("W", "0") or "0")
            l = int(row_dict.get("L", "0") or "0")
            result[ncaa_id] = (w, l)
        except ValueError:
            pass

    return result


def compute_conf_record_from_game_log(conn, team_id: str) -> tuple[int | None, int | None]:
    """
    Compute conference W/L by matching team's games against opponents
    in the same conference.
    """
    row = conn.execute("""
        SELECT
          SUM(CASE WHEN tgl.result='W' AND opp.conference_id = t.conference_id THEN 1 ELSE 0 END)::int AS cw,
          SUM(CASE WHEN tgl.result='L' AND opp.conference_id = t.conference_id THEN 1 ELSE 0 END)::int AS cl
        FROM teams t
        JOIN team_game_log tgl ON tgl.team_id = t.id
        LEFT JOIN teams opp ON opp.id = tgl.opponent_team_id
        WHERE t.id = %s
          AND t.conference_id IS NOT NULL
          AND opp.conference_id IS NOT NULL
    """, (team_id,)).fetchone()
    if not row or (row["cw"] is None and row["cl"] is None):
        return None, None
    cw = row["cw"] or 0
    cl = row["cl"] or 0
    return (cw, cl) if (cw + cl) > 0 else (None, None)


def process_ncaa_level(conn, level_key: str, dry_run: bool, skip_done: bool):
    """Scrape NCAA stats for D2/D3 teams."""
    teams = get_ncaa_teams(conn, level_key)
    division = NCAA_DIVISION_MAP[level_key]
    ranking_period = NCAA_RANKING_PERIODS[division]

    log.info(f"\n{'='*60}")
    log.info(f"Level: {level_key}  —  {len(teams)} teams  (div={division})")
    log.info(f"{'='*60}")

    if not teams:
        log.info("  No teams found — skipping")
        return

    # Fetch win/loss records from NCAA stats national ranking page
    log.info(f"  Fetching NCAA win_pct ranking page (div={division}, period={ranking_period}) ...")
    ncaa_records = fetch_ncaa_win_pct_page(division, ranking_period)
    log.info(f"  Got {len(ncaa_records)} team records from NCAA stats page")

    if not ncaa_records:
        log.warning(f"  No records fetched for {level_key} — check ranking_period")

    # Build ncaa_id → record lookup
    # Our slugs are "ncaa-{id}" (numeric) or "ncaa-ncaa_d3-{slug}" (text)
    # We match on numeric ID extracted from slug
    def extract_ncaa_id(slug: str) -> str | None:
        m = re.match(r"^ncaa-(\d+)$", slug)
        return m.group(1) if m else None

    updated = matched = 0
    for team in teams:
        if skip_done and all([
            team.get("wins") is not None,
            team.get("losses") is not None,
        ]):
            continue

        ncaa_id = extract_ncaa_id(team["slug"])
        wins = losses = None

        if ncaa_id and ncaa_id in ncaa_records:
            wins, losses = ncaa_records[ncaa_id]
            matched += 1

        # Conference record from game log
        conf_wins, conf_losses = compute_conf_record_from_game_log(conn, team["team_id"])

        if wins is not None or conf_wins is not None:
            log.info(
                f"  {team['team_name']:<40} {str(wins)+'-'+str(losses) if wins is not None else '?':>6}"
                f"  conf:{str(conf_wins)+'-'+str(conf_losses) if conf_wins is not None else '?':>6}"
            )
            update_team_season(
                conn, team["team_season_id"], dry_run,
                wins=wins,
                losses=losses,
                conf_wins=conf_wins,
                conf_losses=conf_losses,
            )
            updated += 1

    if not dry_run:
        conn.commit()

    log.info(f"\n  ✓ {level_key}: {updated} updated, {matched}/{len(teams)} matched in NCAA stats")


# ── Conference abbreviations ──────────────────────────────────────────────────

def run_conf_abbr(conn, dry_run: bool):
    """Update conferences.abbreviation from CONF_ABBR dict."""
    log.info("\nUpdating conference abbreviations ...")
    updated = skipped = unmatched = 0

    confs = conn.execute("SELECT id, name, abbreviation FROM conferences ORDER BY name").fetchall()
    for conf in confs:
        abbr = CONF_ABBR.get(conf["name"])
        if not abbr:
            unmatched += 1
            log.debug(f"  No abbr for: {conf['name']}")
            continue
        if conf["abbreviation"] == abbr:
            skipped += 1
            continue
        log.info(f"  {conf['name']:<50} → {abbr}")
        if not dry_run:
            conn.execute(
                "UPDATE conferences SET abbreviation = %s WHERE id = %s",
                (abbr, conf["id"]),
            )
        updated += 1

    if not dry_run:
        conn.commit()

    log.info(f"\n  ✓ Abbreviations: {updated} updated, {skipped} already correct, {unmatched} unmatched")
    if unmatched:
        unmatched_names = [c["name"] for c in confs if not CONF_ABBR.get(c["name"]) and not c["abbreviation"]]
        if unmatched_names:
            log.info("  Unmatched conferences (add to CONF_ABBR if needed):")
            for n in sorted(set(unmatched_names)):
                log.info(f"    {n!r}")


# ── PrestoSports / NAIA / NJCAA / CCCAA scraping ─────────────────────────────

_last_presto_call = 0.0


def presto_get(url: str, retries: int = 3) -> str | None:
    """GET a PrestoSports URL using curl_cffi TLS impersonation with rate limiting + retry."""
    global _last_presto_call
    try:
        from curl_cffi import requests as cffi_requests
    except ImportError:
        log.warning("curl_cffi not installed — PrestoSports scraping unavailable")
        return None

    for attempt in range(retries):
        elapsed = time.time() - _last_presto_call
        if elapsed < PRESTO_DELAY:
            time.sleep(PRESTO_DELAY - elapsed)
        try:
            r = cffi_requests.get(url, impersonate="chrome120", timeout=30)
            _last_presto_call = time.time()
            if r.status_code == 200:
                return r.text
            if r.status_code in (429, 503) and attempt < retries - 1:
                wait = 5 * (attempt + 1)
                log.debug(f"PrestoSports {r.status_code} — retrying in {wait}s: {url}")
                time.sleep(wait)
                continue
            log.debug(f"PrestoSports {r.status_code}: {url}")
            return None
        except Exception as e:
            _last_presto_call = time.time()
            if attempt < retries - 1:
                time.sleep(3)
                continue
            log.debug(f"PrestoSports error {url}: {e}")
            return None
    return None


def s3_get_json(url: str) -> dict | None:
    """Fetch a public S3 JSON (no rate limit needed)."""
    try:
        from curl_cffi import requests as cffi_requests
        r = cffi_requests.get(url, timeout=20)
        return r.json() if r.status_code == 200 else None
    except Exception:
        return None


def slug_normalize(name: str) -> str:
    """Lowercase + strip non-alphanumeric — produces DB slug format."""
    return re.sub(r"[^a-z0-9]", "", name.lower())


def get_presto_teams(conn, level_key: str) -> list[dict]:
    """Return all teams for a NAIA/NJCAA/CCCAA level."""
    return conn.execute("""
        SELECT t.id AS team_id, t.name AS team_name, t.slug,
               ts.id AS team_season_id, ts.wins, ts.losses,
               ts.conf_wins, ts.conf_losses
        FROM teams t
        JOIN competitive_levels cl ON cl.id = t.competitive_level_id
        JOIN team_seasons ts ON ts.team_id = t.id
        WHERE cl.level_key = %s AND ts.season = %s
        ORDER BY t.name
    """, (level_key, SEASON)).fetchall()


# ── NAIA ─────────────────────────────────────────────────────────────────────

def fetch_naia_records() -> dict[str, tuple[int, int, int | None, int | None]]:
    """
    Scrape NAIA conference standings pages.
    Returns {pageName: (wins, losses, conf_wins, conf_losses)}.
    ~22 HTTP calls total.
    """
    from bs4 import BeautifulSoup

    # Step 1: Load teamsData JSON → {teamId → pageName}
    teams_page_html = presto_get(f"{NAIA_BASE}/sports/mbkb/{PRESTO_SEASON}/teams")
    if not teams_page_html:
        log.warning("  NAIA teams page failed")
        return {}

    m = re.search(
        r"(https://prestosports-downloads\.s3[^\s\"'<>]+teamsData/[^\s\"'<>]+\.json)",
        teams_page_html,
    )
    if not m:
        log.warning("  NAIA teamsData S3 URL not found")
        return {}

    teams_data = s3_get_json(m.group(1))
    if not teams_data:
        log.warning("  NAIA teamsData S3 fetch failed")
        return {}

    team_id_to_page: dict[str, str] = {}
    for t in teams_data.get("teams", []):
        tid = t.get("teamId")
        pname = t.get("pageName")
        if tid and pname:
            team_id_to_page[tid] = pname

    log.info(f"  NAIA teamsData: {len(team_id_to_page)} team IDs mapped")

    # Step 2: Get conference URL list from standings page select dropdown
    standings_html = presto_get(f"{NAIA_BASE}/sports/mbkb/{PRESTO_SEASON}/standings")
    if not standings_html:
        log.warning("  NAIA standings page failed")
        return {}
    soup = BeautifulSoup(standings_html, "html.parser")
    conf_paths: list[str] = []
    for sel in soup.find_all("select"):
        for opt in sel.find_all("option"):
            v = opt.get("value", "")
            if "/conf/" in v and "/standings" in v:
                base_path = v.split("?")[0]
                conf_paths.append(base_path)
    conf_paths = list(dict.fromkeys(conf_paths))
    log.info(f"  NAIA: {len(conf_paths)} conference standings pages")

    # Step 3: Scrape each conference standings page (no jsRendering param → server-rendered)
    result: dict[str, tuple] = {}
    for path in conf_paths:
        html = presto_get(f"{NAIA_BASE}{path}")
        if not html:
            continue

        csoup = BeautifulSoup(html, "html.parser")
        tables = csoup.find_all("table")
        if not tables:
            continue

        for row in tables[0].find_all("tr")[2:]:   # skip 2 header rows
            cells = row.find_all(["td", "th"])
            if len(cells) < 6:
                continue
            a = cells[0].find("a")
            if not a:
                continue
            tid_m = re.search(r"teamId=([a-z0-9]+)", a.get("href", ""))
            if not tid_m:
                continue
            team_id = tid_m.group(1)

            texts = [c.get_text(strip=True) for c in cells]
            # Columns: Team | Overall GP | Overall W-L | Overall WP | Conf GP | Conf W-L | Conf WP
            ow_m = re.match(r"(\d+)-(\d+)", texts[2]) if len(texts) > 2 else None
            cw_m = re.match(r"(\d+)-(\d+)", texts[5]) if len(texts) > 5 else None
            if not ow_m:
                continue

            page_name = team_id_to_page.get(team_id)
            if page_name:
                result[page_name] = (
                    int(ow_m.group(1)), int(ow_m.group(2)),
                    int(cw_m.group(1)) if cw_m else None,
                    int(cw_m.group(2)) if cw_m else None,
                )

    return result


def process_naia_level(conn, dry_run: bool, skip_done: bool):
    teams = get_presto_teams(conn, "naia")
    log.info(f"\n{'='*60}")
    log.info(f"Level: naia  —  {len(teams)} teams")
    log.info(f"{'='*60}")
    if not teams:
        return

    log.info("  Fetching NAIA conference standings ...")
    records = fetch_naia_records()
    log.info(f"  Got records for {len(records)} teams")

    updated = matched = 0
    for team in teams:
        if skip_done and team.get("wins") is not None:
            continue

        rec = records.get(team["slug"])
        if rec:
            wins, losses, cw, cl = rec
            matched += 1
        else:
            wins = losses = cw = cl = None

        record_str = f"{wins}-{losses}" if wins is not None else "?"
        conf_str   = f"{cw}-{cl}"       if cw  is not None else "?"
        log.info(f"  {team['team_name']:<40} {record_str:>6}  conf:{conf_str:>6}")

        if wins is not None:
            update_team_season(conn, team["team_season_id"], dry_run,
                               wins=wins, losses=losses, conf_wins=cw, conf_losses=cl)
            updated += 1

    if not dry_run:
        conn.commit()
    log.info(f"\n  ✓ naia: {updated} updated, {matched}/{len(teams)} matched")


# ── NJCAA ─────────────────────────────────────────────────────────────────────

def fetch_njcaa_div_records(div_path: str) -> dict[str, tuple[int, int]]:
    """
    Fetch W/L for all NJCAA teams in a division via per-team teamData S3 JSON.
    Returns {pageName: (wins, losses)}.
    2 HTTP calls per team.
    """
    # Step 1: Get pageName list from division teamsData JSON
    html = presto_get(f"{NJCAA_BASE}/sports/mbkb/{PRESTO_SEASON}/{div_path}/teams")
    if not html:
        return {}

    m = re.search(
        r"(https://prestosports-downloads\.s3[^\s\"'<>]+teamsData/[^\s\"'<>]+\.json)",
        html,
    )
    if not m:
        log.warning(f"  NJCAA {div_path}: teamsData S3 URL not found")
        return {}

    teams_data = s3_get_json(m.group(1))
    if not teams_data:
        return {}

    page_names = [t.get("pageName") for t in teams_data.get("teams", []) if t.get("pageName")]
    log.info(f"  NJCAA {div_path}: {len(page_names)} teams in teamsData")

    # Step 2: For each team, load team page to get teamData S3 URL, then fetch it
    result: dict[str, tuple[int, int]] = {}
    s3_batch: list[tuple[str, str]] = []  # (pageName, s3_url)

    for pname in page_names:
        team_html = presto_get(
            f"{NJCAA_BASE}/sports/mbkb/{PRESTO_SEASON}/{div_path}/teams/{pname}"
        )
        if not team_html:
            continue
        # teamData (singular) S3 URL — per-team stats with splits
        tm = re.search(
            r"(https://prestosports-downloads\.s3[^\s\"'<>]+teamData/[^\s\"'<>]+\.json)",
            team_html,
        )
        if tm:
            s3_batch.append((pname, tm.group(1)))

    log.info(f"  NJCAA {div_path}: fetching {len(s3_batch)} teamData S3 JSONs ...")

    # Step 3: Fetch S3 JSONs (no rate limit — direct to AWS)
    for pname, s3_url in s3_batch:
        td = s3_get_json(s3_url)
        if not td:
            continue
        splits = td.get("splits", {})
        wins   = (splits.get("inWins")   or {}).get("gp")
        losses = (splits.get("inLosses") or {}).get("gp")
        if wins is not None and losses is not None:
            result[pname] = (int(wins), int(losses))

    return result


def process_njcaa_level(conn, level_key: str, dry_run: bool, skip_done: bool):
    div_path = NJCAA_DIV_MAP[level_key]
    teams = get_presto_teams(conn, level_key)
    log.info(f"\n{'='*60}")
    log.info(f"Level: {level_key}  —  {len(teams)} teams  (div={div_path})")
    log.info(f"{'='*60}")
    if not teams:
        return

    log.info(f"  Fetching NJCAA {div_path} records (~{len(teams)*2} HTTP calls) ...")
    records = fetch_njcaa_div_records(div_path)
    log.info(f"  Got records for {len(records)} teams")

    updated = matched = 0
    for team in teams:
        if skip_done and team.get("wins") is not None:
            continue

        rec = records.get(team["slug"])
        if rec:
            wins, losses = rec
            matched += 1
            log.info(f"  {team['team_name']:<40} {wins}-{losses}")
            update_team_season(conn, team["team_season_id"], dry_run,
                               wins=wins, losses=losses)
            updated += 1

    if not dry_run:
        conn.commit()
    log.info(f"\n  ✓ {level_key}: {updated} updated, {matched}/{len(teams)} matched")


# ── CCCAA ─────────────────────────────────────────────────────────────────────

def fetch_cccaa_records() -> dict[str, tuple[int, int, int | None, int | None]]:
    """
    Scrape CCCAA standings page (all conferences on one page).
    Returns {slug_normalized_name: (wins, losses, conf_wins, conf_losses)}.
    1 HTTP call.
    """
    from bs4 import BeautifulSoup

    html = presto_get(f"{CCCAA_BASE}/sports/mbkb/{PRESTO_SEASON}/standings")
    if not html:
        log.warning("  CCCAA standings page failed")
        return {}

    soup = BeautifulSoup(html, "html.parser")
    result: dict[str, tuple] = {}

    for table in soup.find_all("table"):
        for row in table.find_all("tr")[2:]:   # skip 2 header rows
            cells = [c.get_text(strip=True) for c in row.find_all(["td", "th"])]
            if len(cells) < 6 or not cells[0]:
                continue
            # Columns: Team | Conf GP | Conf W-L-T | Conf PCT | Overall GP | Overall W-L-T | ...
            ow_m = re.match(r"(\d+)-(\d+)", cells[5])
            cw_m = re.match(r"(\d+)-(\d+)", cells[2])
            if not ow_m:
                continue
            norm = slug_normalize(cells[0])
            result[norm] = (
                int(ow_m.group(1)), int(ow_m.group(2)),
                int(cw_m.group(1)) if cw_m else None,
                int(cw_m.group(2)) if cw_m else None,
            )

    return result


def process_cccaa_level(conn, dry_run: bool, skip_done: bool):
    teams = get_presto_teams(conn, "cccaa")
    log.info(f"\n{'='*60}")
    log.info(f"Level: cccaa  —  {len(teams)} teams")
    log.info(f"{'='*60}")
    if not teams:
        return

    log.info("  Fetching CCCAA standings ...")
    records = fetch_cccaa_records()
    log.info(f"  Got records for {len(records)} normalized names")

    updated = matched = 0
    for team in teams:
        if skip_done and team.get("wins") is not None:
            continue

        # Try slug directly, then normalized team name
        rec = records.get(team["slug"]) or records.get(slug_normalize(team["team_name"]))
        if rec:
            wins, losses, cw, cl = rec
            matched += 1
        else:
            wins = losses = cw = cl = None

        record_str = f"{wins}-{losses}" if wins is not None else "?"
        conf_str   = f"{cw}-{cl}"       if cw  is not None else "?"
        log.info(f"  {team['team_name']:<40} {record_str:>6}  conf:{conf_str:>6}")

        if wins is not None:
            update_team_season(conn, team["team_season_id"], dry_run,
                               wins=wins, losses=losses, conf_wins=cw, conf_losses=cl)
            updated += 1

    if not dry_run:
        conn.commit()
    log.info(f"\n  ✓ cccaa: {updated} updated, {matched}/{len(teams)} matched")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Scrape team metadata (coach, record, location)")
    parser.add_argument("--levels", default=",".join(ESPN_LEVELS + NCAA_LEVELS),
                        help="Comma-separated level_keys to process (includes naia, njcaa_d1/d2/d3, cccaa)")
    parser.add_argument("--conf-abbr", action="store_true",
                        help="Only update conference abbreviations and exit")
    parser.add_argument("--dry-run",   action="store_true",
                        help="Fetch data but don't write to DB")
    parser.add_argument("--skip-done", action="store_true",
                        help="Skip teams that already have all fields populated")
    args = parser.parse_args()

    conn = db_connect()

    if args.conf_abbr:
        run_conf_abbr(conn, dry_run=args.dry_run)
        conn.close()
        return

    target_levels = [l.strip() for l in args.levels.split(",") if l.strip()]

    for level_key in target_levels:
        if level_key in ESPN_LEVELS:
            process_d1_level(conn, level_key, dry_run=args.dry_run, skip_done=args.skip_done)
        elif level_key in NCAA_LEVELS:
            process_ncaa_level(conn, level_key, dry_run=args.dry_run, skip_done=args.skip_done)
        elif level_key == "naia":
            process_naia_level(conn, dry_run=args.dry_run, skip_done=args.skip_done)
        elif level_key in NJCAA_DIV_MAP:
            process_njcaa_level(conn, level_key, dry_run=args.dry_run, skip_done=args.skip_done)
        elif level_key == "cccaa":
            process_cccaa_level(conn, dry_run=args.dry_run, skip_done=args.skip_done)
        else:
            log.warning(f"Unknown level: {level_key} — skipping")

    log.info("\nDone.")
    conn.close()


if __name__ == "__main__":
    main()
