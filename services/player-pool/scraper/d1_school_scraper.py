"""
D1 School Website Roster Scraper
Scrapes official athletics websites of NCAA D1 schools to fill in
hometown, high school, and previous school data missing from ESPN API.

Uses the NCAA Directory API to discover official athletic website URLs,
then parses Sidearm Sports roster pages using bio_scraper's parser.

Usage:
    python3 d1_school_scraper.py              # Full run — all 365 teams
    python3 d1_school_scraper.py --test 5     # Test first 5 teams
    python3 d1_school_scraper.py --skip 50    # Skip first 50 teams
    python3 d1_school_scraper.py --dry-run    # Parse but don't update DB
"""
from __future__ import annotations

import json
import logging
import re
import sys
import time
from pathlib import Path

import httpx
from bs4 import BeautifulSoup

import db
from config import SEASON
from bio_scraper import parse_roster_page, parse_sidearm_v3, update_team_bios

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("d1_school_scraper")

NCAA_DIRECTORY_API = "https://web3.ncaa.org/directory/api/directory/memberList?type=12&division=I"
ROSTER_CACHE_FILE = Path(__file__).parent / "d1_roster_cache.json"
REQUEST_DELAY = 2  # seconds between requests (different domains)

BROWSER_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)
HEADERS = {"User-Agent": BROWSER_UA}

_last_request_time = 0.0


# ── HTTP helpers ──

def _rate_limit():
    global _last_request_time
    elapsed = time.time() - _last_request_time
    if elapsed < REQUEST_DELAY:
        time.sleep(REQUEST_DELAY - elapsed)
    _last_request_time = time.time()


def _get(url: str, timeout: int = 20) -> httpx.Response | None:
    _rate_limit()
    try:
        r = httpx.get(url, timeout=timeout, follow_redirects=True, headers=HEADERS)
        if r.status_code == 200:
            return r
    except Exception as e:
        log.debug(f"  GET failed: {url} — {e}")
    return None


# ── Cache helpers ──

def _load_cache() -> dict[str, str]:
    if ROSTER_CACHE_FILE.exists():
        return json.loads(ROSTER_CACHE_FILE.read_text())
    return {}


def _save_cache(cache: dict[str, str]):
    ROSTER_CACHE_FILE.write_text(json.dumps(cache, indent=2, sort_keys=True))


# ── NCAA Directory ──

def fetch_ncaa_directory() -> list[dict]:
    """Fetch all D1 schools from the NCAA member directory API.
    Returns list of dicts with keys: name, athletics_url."""
    log.info("Fetching NCAA D1 directory...")
    try:
        r = httpx.get(NCAA_DIRECTORY_API, timeout=30, headers=HEADERS)
        r.raise_for_status()
    except Exception as e:
        log.error(f"Failed to fetch NCAA directory: {e}")
        return []

    schools = []
    for entry in r.json():
        name = entry.get("nameOfficial") or ""
        website = entry.get("athleticWebUrl") or entry.get("webSiteUrl") or ""
        if name and website:
            # Normalize URL — strip trailing slash, ensure https
            website = website.rstrip("/")
            if website.startswith("http://"):
                website = "https://" + website[7:]
            elif not website.startswith("https://"):
                website = "https://" + website
            schools.append({"name": name, "athletics_url": website})

    log.info(f"  Got {len(schools)} schools from NCAA directory")
    return schools


# ── School name matching ──

def _normalize_ncaa_name(name: str) -> str:
    """Extract the core school identifier from an NCAA directory name.
    'University of Alabama' → 'alabama'
    'Duke University' → 'duke'
    'University of North Carolina, Chapel Hill' → 'north carolina'
    'University of Alabama at Birmingham' → 'alabama at birmingham'"""
    name = name.lower().strip()
    name = re.sub(r",.*$", "", name)  # strip after comma
    for pattern in [
        r"^the\s+",
        r"\s+university$", r"\s+college$",
        r"\s+institute.*$", r"\s+and state university$",
        r"^university\s+of\s+", r"^college\s+of\s+",
        r"^university\s+at\s+",
    ]:
        name = re.sub(pattern, "", name)
    return name.strip()


# Manual overrides for names that defy algorithmic matching
# NCAA official name → DB name prefix (lowercase)
_MANUAL_MATCHES = {
    "University at Albany": "UAlbany",
    "Brigham Young University": "BYU",
    "University of California, Berkeley": "California Golden Bears",
    "University of California, Davis": "UC Davis",
    "University of California, Irvine": "UC Irvine",
    "University of California, Los Angeles": "UCLA",
    "University of California, Riverside": "UC Riverside",
    "University of California, San Diego": "UC San Diego",
    "University of California, Santa Barbara": "UC Santa Barbara",
    "University of Connecticut": "UConn",
    "University of Hawaii, Manoa": "Hawai'i",
    "University of Maryland, College Park": "Maryland Terrapins",
    "University of Nevada, Reno": "Nevada Wolf Pack",
    "University of South Dakota": "South Dakota Coyotes",
    "University of South Florida": "South Florida Bulls",
    "Southeastern Louisiana University": "SE Louisiana",
    "Southern University, Baton Rouge": "Southern Jaguars",
    "University of Tennessee, Knoxville": "Tennessee Volunteers",
    "Texas Christian University": "TCU",
    "Texas Southern University": "Texas Southern",
    "University of Texas at Austin": "Texas Longhorns",
    "University of Texas at El Paso": "UTEP",
    "University of Texas at San Antonio": "UTSA",
    "U.S. Military Academy": "Army",
    "U.S. Naval Academy": "Navy",
    "Utah Valley University": "Utah Valley",
    "Virginia Military Institute": "VMI",
    "Virginia Polytechnic Institute and State University": "Virginia Tech",
    "University of Washington": "Washington Huskies",
    "West Virginia University": "West Virginia Mountaineers",
    "Western Kentucky University": "Western Kentucky",
    "Western Michigan University": "Western Michigan",
    "Wright State University": "Wright State",
    "Youngstown State University": "Youngstown State",
    "University of Louisiana at Lafayette": "Louisiana Ragin'",
    "University of Maryland Eastern Shore": "Maryland Eastern Shore",
    "University of Maryland, Baltimore County": "UMBC",
    "University of Nevada, Las Vegas": "UNLV",
    "University of North Florida": "North Florida",
    "Northern Kentucky University": "Northern Kentucky",
    "Northwestern University": "Northwestern Wildcats",
    "Southern Methodist University": "SMU",
    "The University of Southern Mississippi": "Southern Miss",
    "Tennessee Technological University": "Tennessee Tech",
    "Utah State University": "Utah State",
    "Utah Tech University": "Utah Tech",
    "Virginia Commonwealth University": "VCU",
    "Washington State University": "Washington State",
    "Weber State University": "Weber State",
    "Western Illinois University": "Western Illinois",
    "Wichita State University": "Wichita State",
    "George Washington University": "George Washington",
    "University of Northern Iowa": "Northern Iowa",
    "Ohio University": "Ohio Bobcats",
    "Queens University of Charlotte": "Queens University Royals",
    "University of South Carolina Upstate": "South Carolina Upstate",
    "University of Southern Indiana": "Southern Indiana",
    "Tarleton State University": "Tarleton State",
    "Tennessee State University": "Tennessee State Tigers",
    "Texas A&M University-Corpus Christi": "Texas A&M-Corpus Christi",
    "Texas State University": "Texas State",
    "Texas Tech University": "Texas Tech",
    "University of Utah": "Utah Utes",
    "Western Carolina University": "Western Carolina",
    "Eastern Washington University": "Eastern Washington",
    "Indiana University, Bloomington": "Indiana Hoosiers",
    "Louisiana Tech University": "Louisiana Tech",
    "Loyola University Maryland": "Loyola Maryland",
    "University of North Texas": "North Texas",
    "University of South Carolina, Columbia": "South Carolina Gamecocks",
    "South Carolina State University": "South Carolina State",
    "South Dakota State University": "South Dakota State",
    "Southeast Missouri State University": "Southeast Missouri State",
    "Southern Illinois University at Carbondale": "Southern Illinois",
    "Southern Utah University": "Southern Utah",
    "Texas A&M University, College Station": "Texas A&M Aggies",
    "Florida International University": "Florida International",
    "Jacksonville University": "Jacksonville Dolphins",
    "Loyola University Chicago": "Loyola Chicago",
    "University of Mississippi": "Ole Miss",
    "University of Missouri, Columbia": "Missouri Tigers",
    "University of New Orleans": "New Orleans",
    "University of North Carolina, Chapel Hill": "North Carolina Tar Heels",
    "University of North Dakota": "North Dakota Fighting",
    "Northern Illinois University": "Northern Illinois",
    "University of Southern California": "USC Trojans",
    "Florida Gulf Coast University": "Florida Gulf Coast",
    "University of Illinois Chicago": "UIC",
    "University of Illinois Urbana-Champaign": "Illinois Fighting Illini",
    "University of Missouri-Kansas City": "Kansas City Roos",
    "University of New Mexico": "New Mexico Lobos",
    "North Carolina Central University": "North Carolina Central",
    "University of San Francisco": "San Francisco Dons",
    "San Jose State University": "San Jos\u00e9 State",
    "Florida Atlantic University": "Florida Atlantic",
    "New Jersey Institute of Technology": "NJIT",
    "Portland State University": "Portland State",
    "University of Rhode Island": "Rhode Island",
    "San Diego State University": "San Diego State",
    "Long Island University": "Long Island University",
    "Oregon State University": "Oregon State",
    "Pennsylvania State University": "Penn State",
    "Prairie View A&M University": "Prairie View A&M",
    "Florida A&M University": "Florida A&M",
    "Northwestern State University": "Northwestern State",
    "The Ohio State University": "Ohio State",
    "Oklahoma State University": "Oklahoma State",
    "East Texas A&M University": "East Texas A&M",
    "North Carolina A&T State University": "North Carolina A&T",
    "North Carolina State University": "NC State",
    "North Dakota State University": "North Dakota State",
    "Murray State University": "Murray State",
    "New Mexico State University": "New Mexico State",
    "Norfolk State University": "Norfolk State",
    "University of South Alabama": "South Alabama",
    "Montana State University-Bozeman": "Montana State",
    "Morehead State University": "Morehead State",
    "Morgan State University": "Morgan State",
    "University of North Alabama": "North Alabama",
    "University of Alabama at Birmingham": "UAB",
    "Mississippi State University": "Mississippi State",
    "Missouri State University": "Missouri State Bears",
    "The University of Texas Rio Grande Valley": "UT Rio Grande Valley",
    "Louisiana State University": "LSU",
    "Michigan State University": "Michigan State",
    "Mississippi Valley State University": "Mississippi Valley State",
    "Long Beach State University": "Long Beach State",
    "University of Michigan": "Michigan Wolverines",
    "Eastern Michigan University": "Eastern Michigan",
    "Kent State University": "Kent State",
    "Central Michigan University": "Central Michigan",
    "Kennesaw State University": "Kennesaw State",
    "University of Florida": "Florida Gators",
    "Kansas State University": "Kansas State",
    "Jackson State University": "Jackson State",
    "Jacksonville State University": "Jacksonville State",
    "Indiana State University": "Indiana State",
    "Iowa State University": "Iowa State",
    # Batch: all remaining algorithmically-unmatchable schools
    "Appalachian State University": "App State",
    "Austin Peay State University": "Austin Peay",
    "Bowling Green State University": "Bowling Green",
    "California Polytechnic State University": "Cal Poly",
    "California State University, Bakersfield": "Cal State Bakersfield",
    "California State University, Fresno": "Fresno State",
    "California State University, Fullerton": "Cal State Fullerton",
    "California State University, Northridge": "Cal State Northridge",
    "California State University, Sacramento": "Sacramento State",
    "Central Connecticut State University": "Central Connecticut",
    "College of Charleston (South Carolina)": "Charleston Cougars",
    "College of the Holy Cross": "Holy Cross",
    "Columbia University-Barnard College": "Columbia Lions",
    "EC University": "East Carolina",
    "Grambling State University": "Grambling Tigers",
    "Indiana University Indianapolis": "IU Indianapolis",
    "McNeese State University": "McNeese",
    "Miami University (Ohio)": "Miami (OH)",
    "Middle Tennessee State University": "Middle Tennessee",
    "Nicholls State University": "Nicholls",
    "Purdue University Fort Wayne": "Purdue Fort Wayne",
    "Saint Mary's College of California": "Saint Mary's Gaels",
    "Sam Houston State University": "Sam Houston",
    "Southern Illinois University Edwardsville": "SIU Edwardsville",
    "St. John's University (New York)": "St. John's Red Storm",
    "Stephen F. Austin State University": "Stephen F. Austin",
    "The Citadel": "The Citadel",
    "The University of North Carolina at Charlotte": "Charlotte 49ers",
    "The University of North Carolina at Greensboro": "UNC Greensboro",
    "U.S. Air Force Academy": "Air Force",
    "University of Arkansas at Little Rock": "Little Rock",
    "University of Central Florida": "UCF",
    "University of Colorado Boulder": "Colorado Buffaloes",
    "University of Louisiana Monroe": "UL Monroe",
    "University of Massachusetts Lowell": "UMass Lowell",
    "University of Miami (Florida)": "Miami Hurricanes",
    "University of Nebraska at Omaha": "Omaha Mavericks",
    "University of Nebraska-Lincoln": "Nebraska Cornhuskers",
    "University of North Carolina Asheville": "UNC Asheville",
    "University of North Carolina Wilmington": "UNC Wilmington",
    "University of St. Thomas (Minnesota)": "St. Thomas-Minnesota",
    "University of Tennessee at Chattanooga": "Chattanooga",
    "University of Tennessee at Martin": "UT Martin",
    "University of Texas at Arlington": "UT Arlington",
    "University of Wisconsin-Green Bay": "Green Bay Phoenix",
    "University of Wisconsin-Madison": "Wisconsin Badgers",
    "University of Wisconsin-Milwaukee": "Milwaukee Panthers",
    "University of the Incarnate Word": "Incarnate Word",
    "University of the Pacific": "Pacific Tigers",
}


def match_ncaa_to_db(conn, ncaa_schools: list[dict]) -> list[dict]:
    """Match NCAA directory entries to our DB teams.
    Strategy: NCAA names are formal ('University of Alabama'), DB names are
    ESPN-style with mascots ('Alabama Crimson Tide'). We normalize the NCAA
    name to a location ('alabama') and check if any DB name starts with it.
    Fallback: word overlap scoring."""
    rows = conn.execute(
        """SELECT t.id as team_id, t.name, t.slug, ts.id as team_season_id
           FROM teams t
           JOIN competitive_levels cl ON cl.id = t.competitive_level_id
           JOIN team_seasons ts ON ts.team_id = t.id AND ts.season = %s
           WHERE cl.level_key = 'ncaa_d1'
           AND t.slug LIKE 'espn-%%'
           AND NOT t.slug LIKE 'espn-opp-%%'
           ORDER BY t.name""",
        (SEASON,),
    ).fetchall()

    log.info(f"  DB has {len(rows)} D1 teams")

    # Track which DB rows have been claimed (prevent double-matching)
    claimed = set()
    matched = []
    remaining = []

    # Pass 1: Manual overrides (highest priority — process first)
    for school in ncaa_schools:
        ncaa_name = school["name"]
        manual_prefix = _MANUAL_MATCHES.get(ncaa_name)
        if not manual_prefix:
            remaining.append(school)
            continue
        prefix_lower = manual_prefix.lower()
        match = None
        for row in rows:
            if row["name"].lower().startswith(prefix_lower):
                match = row
                break
        if match:
            claimed.add(match["team_id"])
            matched.append({
                "ncaa_name": ncaa_name,
                "athletics_url": school["athletics_url"],
                "team_id": match["team_id"],
                "team_name": match["name"],
                "slug": match["slug"],
                "team_season_id": str(match["team_season_id"]),
            })
        else:
            log.warning(f"  Manual match failed: {ncaa_name} → {manual_prefix}")
            remaining.append(school)

    # Pass 2: Algorithmic matching for the rest
    unmatched_ncaa = []
    for school in remaining:
        ncaa_name = school["name"]
        ncaa_loc = _normalize_ncaa_name(ncaa_name)
        match = None

        # Strategy 1: DB name starts with the NCAA location
        # "alabama" → "Alabama Crimson Tide" ✓
        if ncaa_loc:
            for row in rows:
                if row["team_id"] in claimed:
                    continue
                db_lower = row["name"].lower()
                if db_lower.startswith(ncaa_loc + " ") or db_lower == ncaa_loc:
                    match = row
                    break

        # Strategy 2: Handle "X at Y" patterns
        # NCAA "University of Alabama at Birmingham" → "alabama at birmingham"
        # DB "UAB Blazers" — need special handling
        if not match and " at " in ncaa_loc:
            loc_after_at = ncaa_loc.split(" at ", 1)[1].strip()
            for row in rows:
                if row["team_id"] in claimed:
                    continue
                db_lower = row["name"].lower()
                if db_lower.startswith(loc_after_at + " "):
                    match = row
                    break

        # Strategy 3: Word overlap (at least 1 meaningful word)
        if not match:
            ncaa_words = set(re.findall(r"[a-z]+", ncaa_loc))
            ncaa_words -= {"the", "of", "at", "and", "in", "a"}
            best_score = 0
            best_row = None
            for row in rows:
                if row["team_id"] in claimed:
                    continue
                db_words = set(re.findall(r"[a-z]+", row["name"].lower()))
                db_words -= {"the", "of", "at", "and", "in", "a"}
                score = len(ncaa_words & db_words)
                if score > best_score:
                    best_score = score
                    best_row = row
            if best_score >= 1 and best_row:
                match = best_row

        if match:
            claimed.add(match["team_id"])
            matched.append({
                "ncaa_name": ncaa_name,
                "athletics_url": school["athletics_url"],
                "team_id": match["team_id"],
                "team_name": match["name"],
                "slug": match["slug"],
                "team_season_id": str(match["team_season_id"]),
            })
        else:
            unmatched_ncaa.append(ncaa_name)

    log.info(f"  Matched {len(matched)} of {len(ncaa_schools)} NCAA schools to DB")
    if unmatched_ncaa:
        log.info(f"  Unmatched NCAA schools: {unmatched_ncaa}")

    return matched


# ── Roster URL discovery ──

ROSTER_PATHS = [
    "/sports/mens-basketball/roster",
    "/sports/mens-basketball/roster?view=list",
    "/sports/mbball/roster",
    "/sports/mbball/roster?view=list",
    "/sports/mens-basketball/roster/2025-26",
    "/sports/mens-basketball/roster/2025-26?view=list",
    "/sports/mbball/roster/2025-26",
    "/sports/mbball/roster/2025-26?view=list",
]


def _has_roster_data(html: str, min_players: int = 5) -> bool:
    """Check if HTML has parseable roster data (table or v3 devalue)."""
    table_players = parse_roster_page(html)
    if len(table_players) >= min_players:
        avg_name = sum(len(p["name"]) for p in table_players) / len(table_players)
        digit_pct = sum(1 for p in table_players if any(c.isdigit() for c in p["name"])) / len(table_players)
        if avg_name >= 4 and digit_pct <= 0.5:
            return True
    return len(parse_sidearm_v3(html)) >= min_players


def discover_roster_url(athletics_url: str, slug: str, cache: dict) -> str | None:
    """Discover the roster page URL for a D1 school.
    Tries common Sidearm Sports paths on the school's athletics domain."""
    if slug in cache:
        return cache[slug]

    for path in ROSTER_PATHS:
        url = athletics_url + path
        r = _get(url)
        if r and _has_roster_data(r.text):
            cache[slug] = url
            return url

    return None


# ── Main pipeline ──

def _team_hs_coverage(conn, team_season_id: str) -> float:
    """Return fraction of players with high_school set for a team."""
    row = conn.execute(
        """SELECT COUNT(*) as total,
                  COUNT(*) FILTER (WHERE p.high_school IS NOT NULL AND p.high_school != '') as with_hs
           FROM player_team_seasons pts
           JOIN players p ON p.id = pts.player_id
           WHERE pts.team_season_id = %s""",
        (team_season_id,),
    ).fetchone()
    if not row or row["total"] == 0:
        return 1.0
    return row["with_hs"] / row["total"]


def scrape_d1_bios(conn, test: int | None = None, skip: int = 0,
                   dry_run: bool = False, v3_only: bool = False):
    """Main pipeline: fetch directory → match → discover → parse → update DB."""
    # Step 1: Fetch NCAA directory
    ncaa_schools = fetch_ncaa_directory()
    if not ncaa_schools:
        log.error("No schools from NCAA directory — aborting")
        return

    # Step 2: Match to DB
    matched = match_ncaa_to_db(conn, ncaa_schools)
    if not matched:
        log.error("No matches found — aborting")
        return

    # Apply skip/test limits
    if skip:
        matched = matched[skip:]
        log.info(f"Skipped first {skip} teams, {len(matched)} remaining")
    if test:
        matched = matched[:test]
        log.info(f"Test mode: processing {len(matched)} teams")

    cache = _load_cache()
    totals = {
        "teams": 0, "discovered": 0, "parsed": 0,
        "matched": 0, "hometown_set": 0, "hs_set": 0,
        "prev_school_set": 0, "height_set": 0, "weight_set": 0,
        "class_year_set": 0,
    }

    for i, entry in enumerate(matched):
        team_name = entry["team_name"]
        slug = entry["slug"]
        team_season_id = entry["team_season_id"]
        athletics_url = entry["athletics_url"]
        totals["teams"] += 1

        log.info(f"\n[{i+1}/{len(matched)}] {team_name}")

        # --v3-only: skip teams that already have >50% HS coverage
        if v3_only:
            coverage = _team_hs_coverage(conn, team_season_id)
            if coverage > 0.5:
                log.info(f"  Skipping (HS coverage {coverage:.0%})")
                continue

        log.info(f"  Athletics: {athletics_url}")

        # Step 3: Discover roster URL
        url = discover_roster_url(athletics_url, slug, cache)
        if not url:
            log.info(f"  No roster page found")
            continue

        totals["discovered"] += 1
        log.info(f"  Roster: {url}")

        # Step 4: Parse roster
        # Re-fetch if it's a cached URL (we already fetched during discovery for non-cached)
        r = _get(url)
        if not r:
            log.info(f"  Failed to fetch roster page")
            continue

        roster = parse_roster_page(r.text)
        # Quality check: detect garbage names from broken table parsing
        if roster:
            avg_name_len = sum(len(p["name"]) for p in roster) / len(roster)
            names_with_digits = sum(1 for p in roster if any(c.isdigit() for c in p["name"]))
            digit_pct = names_with_digits / len(roster) if roster else 0
            if avg_name_len < 4 or digit_pct > 0.5:
                log.info(f"  Table parser returned garbage (avg len {avg_name_len:.1f}, digit% {digit_pct:.0%}), trying v3")
                roster = []

        if roster:
            log.info(f"  Parsed (table): {len(roster)} players")
        else:
            roster = parse_sidearm_v3(r.text)
            if roster:
                log.info(f"  Parsed (v3): {len(roster)} players")

        if not roster:
            log.info(f"  No players parsed from page")
            continue

        totals["parsed"] += 1

        # Step 5: Update DB
        counts = update_team_bios(conn, team_season_id, roster, dry_run=dry_run)
        totals["matched"] += counts["matched"]
        totals["hometown_set"] += counts["hometown_set"]
        totals["hs_set"] += counts["hs_set"]
        totals["prev_school_set"] += counts["prev_school_set"]
        totals["height_set"] += counts["height_set"]
        totals["weight_set"] += counts["weight_set"]
        totals["class_year_set"] += counts["class_year_set"]

        log.info(f"  Matched: {counts['matched']}, Town: +{counts['hometown_set']}, "
                 f"HS: +{counts['hs_set']}, Prev: +{counts['prev_school_set']}, "
                 f"Unmatched: {counts['unmatched']}")

        if not dry_run:
            conn.commit()

        # Save cache periodically
        if i % 10 == 0:
            _save_cache(cache)

    _save_cache(cache)

    log.info(f"\n{'='*60}")
    log.info(f"DONE: D1 School Roster Scrape")
    log.info(f"  Teams: {totals['teams']}, Discovered: {totals['discovered']}, "
             f"Parsed: {totals['parsed']}")
    log.info(f"  Players matched: {totals['matched']}")
    log.info(f"  Hometown: +{totals['hometown_set']}, HS: +{totals['hs_set']}, "
             f"Prev School: +{totals['prev_school_set']}")
    log.info(f"  Height: +{totals['height_set']}, Weight: +{totals['weight_set']}, "
             f"Year: +{totals['class_year_set']}")


# ── CLI ──

if __name__ == "__main__":
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    v3_only = "--v3-only" in args
    clean_args = [a for a in args if a not in ("--dry-run", "--v3-only")]

    test = None
    skip = 0
    i = 0
    while i < len(clean_args):
        if clean_args[i] == "--test" and i + 1 < len(clean_args):
            test = int(clean_args[i + 1])
            i += 2
        elif clean_args[i] == "--skip" and i + 1 < len(clean_args):
            skip = int(clean_args[i + 1])
            i += 2
        else:
            i += 1

    conn = db.get_conn()
    scrape_d1_bios(conn, test=test, skip=skip, dry_run=dry_run, v3_only=v3_only)
    conn.close()
