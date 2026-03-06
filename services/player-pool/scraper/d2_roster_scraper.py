"""
Scrape D2 roster pages for jersey numbers and weight.

Uses the NCAA directory API to get athletics website URLs for all D2 schools,
then scrapes their Sidearm/PrestoSports roster pages.

Usage:
    python3 d2_roster_scraper.py              # all D2 teams
    python3 d2_roster_scraper.py --test 5     # first 5 teams
    python3 d2_roster_scraper.py --dry-run    # preview only
"""
from __future__ import annotations

import json
import re
import sys
import time
import logging

import httpx
from curl_cffi import requests as cffi_requests

import db
from config import SEASON
from bio_scraper import parse_roster_page, parse_sidearm_v3, update_team_bios

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("d2_roster")
logging.getLogger("httpx").setLevel(logging.WARNING)

DELAY = 1.5  # seconds between requests
NCAA_DIR_API = "https://web3.ncaa.org/directory/api/directory/memberList?type=12&division=2&sportCode=MBB"
DIR_CACHE = "/tmp/ncaa_d2_directory.json"


def get_d2_directory() -> list[dict]:
    """Get D2 school directory from NCAA API (or cached file)."""
    import os
    if os.path.exists(DIR_CACHE):
        with open(DIR_CACHE) as f:
            return json.load(f)

    s = cffi_requests.Session(impersonate="chrome120")
    r = s.get(NCAA_DIR_API, timeout=30)
    data = r.json()
    d2 = [x for x in data if x.get("division") == 2]
    with open(DIR_CACHE, "w") as f:
        json.dump(d2, f, indent=2)
    return d2


ABBREV_MAP = {
    "st.": "state", "mt.": "mount", "ft.": "fort",
    "n.": "north", "s.": "south", "e.": "east", "w.": "west",
    "cent.": "central", "alas.": "alaska", "ark.": "arkansas",
    "int'l": "international", "colo.": "colorado", "conn.": "connecticut",
    "fla.": "florida", "ga.": "georgia", "ill.": "illinois",
    "ind.": "indiana", "minn.": "minnesota", "mo.": "missouri",
    "neb.": "nebraska", "okla.": "oklahoma", "pa.": "pennsylvania",
    "tex.": "texas", "va.": "virginia", "wis.": "wisconsin",
    "mich.": "michigan", "calif.": "california",
    "(ga)": "(georgia)", "(sc)": "(south carolina)",
    "(sd)": "(south dakota)", "(mn)": "(minnesota)",
    "(ne)": "(nebraska)", "(pa)": "(pennsylvania)",
    "(mo)": "(missouri)", "(in)": "(indiana)",
    "(co)": "(colorado)", "(nc)": "(north carolina)",
    "aum": "auburn montgomery",
    "uccs": "colorado colorado springs",
    "usc": "south carolina",
    "lmu": "lincoln memorial",
}

# Hard-coded manual overrides for tricky names
MANUAL_MATCHES = {
    # DB name -> directory nameOfficial substring
    "Alas. Anchorage": "Alaska Anchorage",
    "Alas. Fairbanks": "Alaska Fairbanks",
    "Ark.-Fort Smith": "Arkansas at Fort Smith",
    "Ark.-Monticello": "Arkansas at Monticello",
    "AUM": "Auburn University at Montgomery",
    "Cal Poly Pomona": "California State Polytechnic University, Pomona",
    "Cal St. Chico": "California State University, Chico",
    "Cal St. Dom. Hills": "California State University, Dominguez Hills",
    "Cal St. East Bay": "California State University, East Bay",
    "Cal St. L.A.": "California State University, Los Angeles",
    "Cal St. San B'dino": "California State University, San Bernardino",
    "Cal St. Stanislaus": "California State University, Stanislaus",
    "Central Wash.": "Central Washington",
    "Colo. Christian": "Colorado Christian",
    "Colo. Mesa": "Colorado Mesa",
    "Colo. Mines": "Colorado School of Mines",
    "D.H. Converse": "Converse University",
    "DBU": "Dallas Baptist",
    "Dominican (CA)": "Dominican University of California",
    "Embry-Riddle (FL)": "Embry-Riddle",
    "Emmanuel (GA)": "Emmanuel College (Georgia)",
    "Fort Lewis": "Fort Lewis College",
    "Ga. College": "Georgia College",
    "Ga. Southwestern": "Georgia Southwestern",
    "Grand Valley St.": "Grand Valley State",
    "Ill. Springfield": "Illinois Springfield",
    "IU South Bend": "Indiana University South Bend",
    "Ky. Wesleyan": "Kentucky Wesleyan",
    "Le Moyne": "Le Moyne College",
    "Lincoln Memorial": "Lincoln Memorial University",
    "LIU Post": "Long Island University Post",
    "Metro St.": "Metropolitan State University of Denver",
    "Minn. Duluth": "Minnesota Duluth",
    "Minn. St. Mankato": "Minnesota State University, Mankato",
    "Minn. St. Moorhead": "Minnesota State University Moorhead",
    "Mo. St. Louis": "Missouri-St. Louis",
    "Mo. Southern": "Missouri Southern",
    "Mo. Western": "Missouri Western",
    "MSU Billings": "Montana State University Billings",
    "N.M. Highlands": "New Mexico Highlands",
    "Northeastern St.": "Northeastern State",
    "Northern St.": "Northern State",
    "NW Mo. St.": "Northwest Missouri State",
    "NW Nazarene": "Northwest Nazarene",
    "Ore. Tech": "Oregon Institute of Technology",
    "Pitt.-Johnstown": "Pittsburgh-Johnstown",
    "S.C. Aiken": "South Carolina Aiken",
    "S.C. Upstate": "South Carolina Upstate",
    "SE Mo. St.": "Southeast Missouri",
    "SE Okla. St.": "Southeastern Oklahoma",
    "Simon Fraser": "Simon Fraser University",
    "Slippery Rock": "Slippery Rock University",
    "Southern Ind.": "Southern Indiana",
    "Southern Wesleyan": "Southern Wesleyan University",
    "Southwest Minn. St.": "Southwest Minnesota State",
    "Southwestern Okla.": "Southwestern Oklahoma",
    "St. Anselm": "Saint Anselm",
    "St. Cloud St.": "St. Cloud State",
    "St. Edward's": "St. Edward's",
    "St. Leo": "Saint Leo",
    "St. Martin's": "Saint Martin's",
    "St. Mary's (TX)": "St. Mary's University (Texas)",
    "St. Michael's": "Saint Michael's",
    "St. Thomas Aquinas": "St. Thomas Aquinas",
    "Tarleton St.": "Tarleton State",
    "Tex. A&M-Commerce": "Texas A&M University-Commerce",
    "Tex. A&M-Kingsville": "Texas A&M-Kingsville",
    "Tex. Permian Basin": "Texas-Permian Basin",
    "Tex. Tyler": "Texas-Tyler",
    "UCCS": "University of Colorado Colorado Springs",
    "USC Aiken": "South Carolina Aiken",
    "UVA Wise": "Virginia's College at Wise",
    "W. Tex. A&M": "West Texas A&M",
    "W. Va. St.": "West Virginia State",
    "W. Va. Wesleyan": "West Virginia Wesleyan",
    "W.L. Post": "Post University",
    "Cal Poly Humboldt": "Polytechnic University, Humboldt",
    "CSUSB": "California State University, San Bernardino",
    "CUI": "Concordia University Irvine",
    "P.R.-Bayamon": "Puerto Rico, Bayamon",
    "P.R.-Mayaguez": "Puerto Rico, Mayaguez",
    "Tusculum": "Tusculum University",
    "UAH": "Alabama in Huntsville",
    "UIndy": "University of Indianapolis",
    "Walsh": "Walsh University",
    "Washburn": "Washburn University",
    "Wayne St. (MI)": "Wayne State University (Michigan)",
    "Wayne St. (NE)": "Wayne State College (Nebraska)",
    "West Chester": "West Chester University",
    "West Ga.": "West Georgia",
    "Western Colo.": "Western Colorado",
    "Western Ore.": "Western Oregon",
    "Western Wash.": "Western Washington",
    "Wingate": "Wingate University",
}


def expand_abbrevs(name: str) -> str:
    """Expand abbreviations in a DB team name."""
    lower = name.lower()
    for abbr, full in ABBREV_MAP.items():
        lower = lower.replace(abbr, full)
    return lower


def name_words(name: str) -> set[str]:
    """Extract significant words from a name (lowercase, no punctuation)."""
    # Remove parenthetical content for word extraction
    clean = re.sub(r"[(),'.\-]", " ", name.lower())
    stop = {"university", "college", "of", "the", "at", "and", "a"}
    return {w for w in clean.split() if w and w not in stop}


def match_directory_to_db(directory: list[dict], db_teams: list) -> dict[str, dict]:
    """Match NCAA directory entries to DB teams by name similarity.
    Returns dict of team_id -> directory entry."""
    matches = {}
    used_dir_ids = set()  # prevent double-matching

    # Strategy 1: Manual overrides
    dir_by_name_lower = {}
    for entry in directory:
        dir_by_name_lower[entry.get("nameOfficial", "").lower()] = entry

    for team in db_teams:
        team_id = str(team["team_id"])
        team_name = team["name"]
        if team_name in MANUAL_MATCHES:
            target = MANUAL_MATCHES[team_name].lower()
            for entry in directory:
                if target in entry.get("nameOfficial", "").lower():
                    matches[team_id] = entry
                    used_dir_ids.add(entry["orgId"])
                    break

    # Strategy 2: Word overlap with abbreviation expansion
    for team in db_teams:
        team_id = str(team["team_id"])
        if team_id in matches:
            continue
        team_name = team["name"]
        expanded = expand_abbrevs(team_name)
        tw = name_words(expanded)
        if not tw:
            continue

        best_score = 0
        best_entry = None
        for entry in directory:
            if entry["orgId"] in used_dir_ids:
                continue
            ew = name_words(entry.get("nameOfficial", ""))
            if not ew:
                continue
            overlap = len(tw & ew)
            # Jaccard-ish: overlap / min(len) — rewards small precise matches
            score = overlap / min(len(tw), len(ew)) if overlap > 0 else 0
            if score > best_score:
                best_score = score
                best_entry = entry

        if best_entry and best_score >= 0.5:
            matches[team_id] = best_entry
            used_dir_ids.add(best_entry["orgId"])

    return matches


def fetch_roster_page(client: httpx.Client, athletic_url: str) -> str | None:
    """Try to fetch roster page from athletics website."""
    if not athletic_url:
        return None

    # Normalize URL
    if not athletic_url.startswith("http"):
        athletic_url = "https://" + athletic_url
    athletic_url = athletic_url.rstrip("/")

    # Try common roster page paths
    paths = [
        "/sports/mens-basketball/roster",
        "/sports/mens-basketball/roster/2025-26",
        "/sports/mens-basketball/roster/2024-25",
        "/sports/mbkb/2025-26/roster",
        "/sports/mbkb/2024-25/roster",
        "/sports/mbkb/roster",
        "/roster.aspx?path=mbball",
        "/sports/m-baskbl/2025-26/roster",
        "/sports/m-baskbl/roster",
    ]

    for path in paths:
        url = athletic_url + path
        try:
            r = client.get(url, follow_redirects=True, timeout=15)
            if r.status_code == 200 and len(r.text) > 5000:
                # Quick check: does it look like a roster page?
                lower = r.text.lower()
                if "roster" in lower and ("height" in lower or "ht" in lower or "pos" in lower or "jersey" in lower):
                    return r.text
        except Exception:
            continue

    return None


def main():
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    test_n = None
    start_at = 0
    for i, a in enumerate(args):
        if a == "--test" and i + 1 < len(args):
            test_n = int(args[i + 1])
        if a == "--start" and i + 1 < len(args):
            start_at = int(args[i + 1])

    log.info("Loading NCAA D2 directory...")
    directory = get_d2_directory()
    log.info(f"  {len(directory)} D2 schools")

    conn = db.get_conn()

    # Get all D2 teams from DB
    db_teams = conn.execute("""
        SELECT t.id AS team_id, t.name, t.slug, ts.id AS team_season_id
        FROM teams t
        JOIN competitive_levels cl ON cl.id = t.competitive_level_id
        JOIN team_seasons ts ON ts.team_id = t.id AND ts.season = %s
        WHERE cl.level_key = 'ncaa_d2'
        AND t.slug LIKE 'ncaa-%%'
        ORDER BY t.name
    """, (SEASON,)).fetchall()

    log.info(f"  {len(db_teams)} D2 teams in DB")

    # Match directory to DB
    matches = match_directory_to_db(directory, db_teams)
    log.info(f"  {len(matches)} matched to NCAA directory")

    if start_at:
        db_teams = db_teams[start_at:]
        log.info(f"  Starting at offset {start_at}")
    if test_n:
        db_teams = db_teams[:test_n]

    client = httpx.Client(timeout=15, follow_redirects=True)

    totals = {"teams": 0, "found": 0, "parsed": 0,
              "jersey_set": 0, "weight_set": 0, "height_set": 0,
              "matched": 0, "unmatched": 0}

    for i, team in enumerate(db_teams):
        team_id = str(team["team_id"])
        team_name = team["name"]
        team_season_id = str(team["team_season_id"])
        totals["teams"] += 1

        dir_entry = matches.get(team_id)
        if not dir_entry:
            log.debug(f"  [{i+1}/{len(db_teams)}] {team_name} — no directory match")
            continue

        athletic_url = dir_entry.get("athleticWebUrl", "")
        if not athletic_url:
            continue

        time.sleep(DELAY)
        html = fetch_roster_page(client, athletic_url)
        if not html:
            log.info(f"  [{i+1}/{len(db_teams)}] {team_name} — no roster page found")
            continue

        totals["found"] += 1

        # Parse roster — try both parsers
        roster = parse_roster_page(html)
        if not roster:
            roster = parse_sidearm_v3(html)
        if not roster:
            continue

        totals["parsed"] += 1

        if dry_run:
            log.info(f"  [{i+1}/{len(db_teams)}] {team_name} — {len(roster)} players (dry run)")
            continue

        counts = update_team_bios(conn, team_season_id, roster)
        totals["jersey_set"] += counts.get("jersey_set", 0)
        totals["weight_set"] += counts.get("weight_set", 0)
        totals["height_set"] += counts.get("height_set", 0)
        totals["matched"] += counts.get("matched", 0)
        totals["unmatched"] += counts.get("unmatched", 0)
        conn.commit()

        log.info(f"  [{i+1}/{len(db_teams)}] {team_name} — {counts.get('matched',0)} matched, "
                 f"jersey +{counts.get('jersey_set',0)}, wt +{counts.get('weight_set',0)}, "
                 f"ht +{counts.get('height_set',0)}")

    client.close()
    conn.close()

    log.info(f"\n{'='*60}")
    log.info(f"DONE — D2 Roster Scrape")
    log.info(f"  Teams: {totals['teams']}, Found roster: {totals['found']}, Parsed: {totals['parsed']}")
    log.info(f"  Players matched: {totals['matched']}, Unmatched: {totals['unmatched']}")
    log.info(f"  Jersey: +{totals['jersey_set']}, Weight: +{totals['weight_set']}, Height: +{totals['height_set']}")
    log.info(f"{'='*60}")


if __name__ == "__main__":
    main()
