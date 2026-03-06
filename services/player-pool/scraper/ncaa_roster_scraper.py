"""
Scrape NCAA roster pages for jersey numbers, weight, height, class year, etc.

Uses the NCAA directory API to get athletics website URLs for all schools
in a given division, then scrapes their Sidearm/PrestoSports roster pages.

Usage:
    python3 ncaa_roster_scraper.py d3              # all D3 teams
    python3 ncaa_roster_scraper.py d2              # all D2 teams
    python3 ncaa_roster_scraper.py d3 --test 5     # first 5 teams
    python3 ncaa_roster_scraper.py d3 --start 100  # start at offset 100
    python3 ncaa_roster_scraper.py d3 --dry-run    # preview only
"""
from __future__ import annotations

import json
import os
import re
import sys
import time
import logging

import httpx
from curl_cffi import requests as cffi_requests

import db
from config import SEASON
from bio_scraper import parse_roster_page, parse_sidearm_cards, parse_sidearm_v3, update_team_bios

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("ncaa_roster")
logging.getLogger("httpx").setLevel(logging.WARNING)

DELAY = 1.5  # seconds between requests

# NCAA directory API template — division=2 or division=3
NCAA_DIR_API = "https://web3.ncaa.org/directory/api/directory/memberList?type=12&division={div}&sportCode=MBB"

# ── Abbreviation expansion for matching DB names to directory names ──

ABBREV_MAP = {
    "st.": "state", "mt.": "mount", "ft.": "fort",
    "n.": "north", "s.": "south", "e.": "east", "w.": "west",
    "cent.": "central", "alas.": "alaska", "ark.": "arkansas",
    "int'l": "international", "colo.": "colorado", "conn.": "connecticut",
    "fla.": "florida", "ga.": "georgia", "ill.": "illinois",
    "ind.": "indiana", "minn.": "minnesota", "mo.": "missouri",
    "neb.": "nebraska", "okla.": "oklahoma", "pa.": "pennsylvania",
    "tex.": "texas", "va.": "virginia", "wis.": "wisconsin",
    "mich.": "michigan", "calif.": "california", "mass.": "massachusetts",
    "vt.": "vermont", "ore.": "oregon", "wash.": "washington",
    "(ga)": "(georgia)", "(sc)": "(south carolina)",
    "(sd)": "(south dakota)", "(mn)": "(minnesota)",
    "(ne)": "(nebraska)", "(pa)": "(pennsylvania)",
    "(mo)": "(missouri)", "(in)": "(indiana)",
    "(co)": "(colorado)", "(nc)": "(north carolina)",
    "(ny)": "(new york)", "(oh)": "(ohio)", "(tx)": "(texas)",
    "(va)": "(virginia)", "(il)": "(illinois)", "(wi)": "(wisconsin)",
    "(ia)": "(iowa)", "(md)": "(maryland)", "(me)": "(maine)",
    "(vt)": "(vermont)", "(ma)": "(massachusetts)",
    "(tn)": "(tennessee)", "(al)": "(alabama)",
}

# Manual overrides — DB name -> directory nameOfficial substring
# Covers both D2 and D3 tricky names
MANUAL_MATCHES = {
    # D2
    "Alas. Anchorage": "Alaska Anchorage",
    "Alas. Fairbanks": "Alaska Fairbanks",
    "Ark.-Fort Smith": "Arkansas at Fort Smith",
    "Ark.-Monticello": "Arkansas at Monticello",
    "AUM": "Auburn University at Montgomery",
    "Cal Poly Pomona": "California State Polytechnic University, Pomona",
    "Cal Poly Humboldt": "Polytechnic University, Humboldt",
    "Cal St. Chico": "California State University, Chico",
    "Cal St. Dom. Hills": "California State University, Dominguez Hills",
    "Cal St. East Bay": "California State University, East Bay",
    "Cal St. L.A.": "California State University, Los Angeles",
    "Cal St. San B'dino": "California State University, San Bernardino",
    "Cal St. Stanislaus": "California State University, Stanislaus",
    "CSUSB": "California State University, San Bernardino",
    "CUI": "Concordia University Irvine",
    "DBU": "Dallas Baptist",
    "Metro St.": "Metropolitan State University of Denver",
    "MSU Billings": "Montana State University Billings",
    "NW Mo. St.": "Northwest Missouri State",
    "Ore. Tech": "Oregon Institute of Technology",
    "P.R.-Bayamon": "Puerto Rico, Bayamon",
    "P.R.-Mayaguez": "Puerto Rico, Mayaguez",
    "UAH": "Alabama in Huntsville",
    "UCCS": "University of Colorado Colorado Springs",
    "UIndy": "University of Indianapolis",
    "UVA Wise": "Virginia's College at Wise",
    # D3 common
    "CCNY": "City College of New York",
    "CMU": "Carnegie Mellon",
    "CMS": "Claremont-Mudd-Scripps",
    "CoA": "College of the Atlantic",
    "CUNY": "City University of New York",
    "MIT": "Massachusetts Institute of Technology",
    "NYU": "New York University",
    "RIT": "Rochester Institute of Technology",
    "RPI": "Rensselaer Polytechnic",
    "SUNY": "State University of New York",
    "UC Santa Cruz": "California, Santa Cruz",
    "UMass Boston": "Massachusetts Boston",
    "UMass Dartmouth": "Massachusetts Dartmouth",
    "UW-Eau Claire": "Wisconsin-Eau Claire",
    "UW-La Crosse": "Wisconsin-La Crosse",
    "UW-Oshkosh": "Wisconsin-Oshkosh",
    "UW-Platteville": "Wisconsin-Platteville",
    "UW-River Falls": "Wisconsin-River Falls",
    "UW-Stevens Point": "Wisconsin-Stevens Point",
    "UW-Stout": "Wisconsin-Stout",
    "UW-Superior": "Wisconsin-Superior",
    "UW-Whitewater": "Wisconsin-Whitewater",
    "WPI": "Worcester Polytechnic",
    "TCNJ": "College of New Jersey",
    "JWU Charlotte": "Johnson & Wales University (Charlotte)",
    "Biblical Stud. (TX)": "College of Biblical Studies",
    # D3 specific
    "Claremont-M-S": "Claremont McKenna-Harvey Mudd-Scripps",
    "CWRU": "Case Western Reserve",
    "MCLA": "Massachusetts College of Liberal Arts",
    "MSOE": "Milwaukee School of Engineering",
    "MUW": "Mississippi University for Women",
    "SUNY Brockport": "New York at Brockport",
    "SUNY Canton": "New York at Canton",
    "SUNY Cobleskill": "New York at Cobleskill",
    "SUNY Delhi": "New York at Delhi",
    "SUNY Geneseo": "New York at Geneseo",
    "SUNY Maritime": "Maritime College",
    "Thomas (ME)": "Thomas College",
    "UChicago": "University of Chicago",
    "UMSV": "Mount Saint Vincent",
    "VTSU Castleton": "Vermont State University Castleton",
    "WashU": "Washington University in St. Louis",
    "Wis.-La Crosse": "Wisconsin-La Crosse",
    "Sewanee": "University of the South",
    "Me.-Fort Kent": "Maine at Fort Kent",
    "SUNY Poly": "New York Polytechnic Institute",
    "Concordia-M'head": "Concordia College, Moorhead",
    "La Verne": "University of La Verne",
    "SUNY Morrisville": "New York at Morrisville",
    "SUNY Oneonta": "New York at Oneonta",
    "SUNY Potsdam": "New York at Potsdam",
    "SUNY Cobleskill": "New York at Cobleskill",
    "Trinity (TX)": "Trinity University (Texas)",
    "VTSU Lyndon": "Vermont State University Lyndon",
    "Western New Eng.": "Western New England",
}


def get_directory(division: int) -> list[dict]:
    """Get NCAA school directory from API (or cached file)."""
    cache = f"/tmp/ncaa_d{division}_directory.json"
    if os.path.exists(cache):
        with open(cache) as f:
            return json.load(f)

    s = cffi_requests.Session(impersonate="chrome120")
    r = s.get(NCAA_DIR_API.format(div=division), timeout=30)
    data = r.json()
    filtered = [x for x in data if x.get("division") == division]
    with open(cache, "w") as f:
        json.dump(filtered, f, indent=2)
    return filtered


def expand_abbrevs(name: str) -> str:
    """Expand abbreviations in a DB team name."""
    lower = name.lower()
    for abbr, full in ABBREV_MAP.items():
        lower = lower.replace(abbr, full)
    return lower


def name_words(name: str) -> set[str]:
    """Extract significant words from a name (lowercase, no punctuation)."""
    clean = re.sub(r"[(),'.\-]", " ", name.lower())
    stop = {"university", "college", "of", "the", "at", "and", "a"}
    return {w for w in clean.split() if w and w not in stop}


def match_directory_to_db(directory: list[dict], db_teams: list) -> dict[str, dict]:
    """Match NCAA directory entries to DB teams by name similarity.
    Returns dict of team_id -> directory entry."""
    matches = {}
    used_dir_ids = set()

    # Strategy 1: Manual overrides
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
            score = overlap / min(len(tw), len(ew)) if overlap > 0 else 0
            if score > best_score:
                best_score = score
                best_entry = entry

        if best_entry and best_score >= 0.5:
            matches[team_id] = best_entry
            used_dir_ids.add(best_entry["orgId"])

    return matches


ROSTER_PATHS = [
    "/sports/mens-basketball/roster",
    "/sports/mens-basketball/roster/2025-26",
    "/sports/mens-basketball/roster/2024-25",
    "/sports/mbkb/2025-26/roster",
    "/sports/mbkb/2024-25/roster",
    "/sports/mbkb/roster",
    "/roster.aspx?path=mbball",
    "/sports/m-baskbl/2025-26/roster",
    "/sports/m-baskbl/roster",
    "/sports/m-basketball/roster",
    "/sports/m-basketball/roster/2025-26",
    "/sports/m-basketball/roster/2024-25",
]


def _is_roster_page(text: str) -> bool:
    """Check if HTML looks like a basketball roster page."""
    if len(text) < 3000:
        return False
    lower = text.lower()
    return "roster" in lower and (
        "height" in lower or "ht" in lower or "pos" in lower
        or "jersey" in lower or "no." in lower or "class" in lower
    )


def _resolve_athletics_domain(client: httpx.Client, raw_url: str) -> list[str]:
    """Given a directory URL, resolve the actual athletics base domain(s) to try.

    Many schools list www.school.edu/athletics but the real Sidearm site
    is at athletics.school.edu. This follows redirects from the landing
    page and also generates the athletics.X.edu alternative.
    """
    from urllib.parse import urlparse

    bases = set()
    bases.add(raw_url.rstrip("/"))

    # Strip trailing path components like /landing/index, /directory/athletics
    for suffix in ["/landing/index", "/landing", "/directory/athletics"]:
        if raw_url.lower().endswith(suffix):
            raw_url = raw_url[: -len(suffix)]
    bases.add(raw_url.rstrip("/"))

    # If URL is www.X.edu/athletics, also try athletics.X.edu
    parsed = urlparse(raw_url if raw_url.startswith("http") else "https://" + raw_url)
    host = parsed.hostname or ""
    path = parsed.path.rstrip("/")

    if "/athletics" in path:
        # www.middlebury.edu/athletics -> athletics.middlebury.edu
        base_host = host.replace("www.", "")
        alt = f"https://athletics.{base_host}"
        bases.add(alt)
        # Also try the base without /athletics path
        stripped = f"https://{host}"
        bases.add(stripped)

    # Try to follow redirect from the landing page to discover actual domain
    full_url = raw_url if raw_url.startswith("http") else "https://" + raw_url
    for fetcher in ["httpx", "cffi"]:
        try:
            if fetcher == "httpx":
                r = client.get(full_url, follow_redirects=True, timeout=8)
                final = str(r.url)
            else:
                s = cffi_requests.Session(impersonate="chrome120")
                r = s.get(full_url, timeout=8, allow_redirects=True)
                final = str(r.url)
            final_parsed = urlparse(final)
            if final_parsed.hostname:
                final_base = f"{final_parsed.scheme}://{final_parsed.hostname}"
                bases.add(final_base)
        except Exception:
            continue

    return list(bases)


PRIMARY_PATH = "/sports/mens-basketball/roster"


def fetch_roster_page(client: httpx.Client, athletic_url: str) -> str | None:
    """Try to fetch roster page from athletics website.

    Strategy: try the primary path on all resolved bases first (fast),
    then try alternative paths only on bases that seem alive.
    Falls back to curl_cffi if httpx gets 403.
    """
    if not athletic_url:
        return None

    if not athletic_url.startswith("http"):
        athletic_url = "https://" + athletic_url

    bases = _resolve_athletics_domain(client, athletic_url)

    any_403 = False
    alive_bases = []  # bases that returned 200 on primary path (even if not roster)

    # Phase 1: try PRIMARY path on all bases (fast screening)
    for base in bases:
        url = base + PRIMARY_PATH
        try:
            r = client.get(url, follow_redirects=True, timeout=8)
            if r.status_code == 200:
                if _is_roster_page(r.text):
                    return r.text
                alive_bases.append(base)
            elif r.status_code == 403:
                any_403 = True
        except Exception:
            continue

    # Phase 2: try alternative paths only on alive bases
    for base in alive_bases:
        for path in ROSTER_PATHS[1:]:  # skip primary (already tried)
            url = base + path
            try:
                r = client.get(url, follow_redirects=True, timeout=8)
                if r.status_code == 200 and _is_roster_page(r.text):
                    return r.text
            except Exception:
                continue

    # Phase 3: curl_cffi fallback for 403 sites
    if any_403:
        s = cffi_requests.Session(impersonate="chrome120")
        for base in bases:
            for path in ROSTER_PATHS[:3]:
                url = base + path
                try:
                    r = s.get(url, timeout=8, allow_redirects=True)
                    if r.status_code == 200 and _is_roster_page(r.text):
                        return r.text
                except Exception:
                    continue

    return None


def main():
    args = sys.argv[1:]

    # First positional arg is division
    division = None
    for a in args:
        if a in ("d2", "d3", "d1"):
            division = int(a[1])
            break
    if not division:
        print("Usage: python3 ncaa_roster_scraper.py [d2|d3] [--test N] [--start N] [--dry-run]")
        sys.exit(1)

    level_key = f"ncaa_d{division}"
    dry_run = "--dry-run" in args
    test_n = None
    start_at = 0
    for i, a in enumerate(args):
        if a == "--test" and i + 1 < len(args):
            test_n = int(args[i + 1])
        if a == "--start" and i + 1 < len(args):
            start_at = int(args[i + 1])

    log.info(f"Loading NCAA D{division} directory...")
    directory = get_directory(division)
    log.info(f"  {len(directory)} D{division} schools")

    conn = db.get_conn()

    db_teams = conn.execute("""
        SELECT t.id AS team_id, t.name, t.slug, ts.id AS team_season_id
        FROM teams t
        JOIN competitive_levels cl ON cl.id = t.competitive_level_id
        JOIN team_seasons ts ON ts.team_id = t.id AND ts.season = %s
        WHERE cl.level_key = %s
        AND t.slug LIKE 'ncaa-%%'
        ORDER BY t.name
    """, (SEASON, level_key)).fetchall()

    log.info(f"  {len(db_teams)} D{division} teams in DB")

    matches = match_directory_to_db(directory, db_teams)
    log.info(f"  {len(matches)} matched to NCAA directory")

    # Log unmatched
    unmatched = [t for t in db_teams if str(t["team_id"]) not in matches]
    if unmatched:
        log.info(f"  {len(unmatched)} unmatched:")
        for t in unmatched[:10]:
            log.info(f"    {t['name']} ({t['slug']})")
        if len(unmatched) > 10:
            log.info(f"    ... and {len(unmatched) - 10} more")

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

        # Try all parsers and use the one with the most results
        candidates = []
        r1 = parse_roster_page(html)
        if r1:
            candidates.append(r1)
        r2 = parse_sidearm_cards(html)
        if r2:
            candidates.append(r2)
        r3 = parse_sidearm_v3(html)
        if r3:
            candidates.append(r3)
        if not candidates:
            continue
        roster = max(candidates, key=len)

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
    log.info(f"DONE — D{division} Roster Scrape")
    log.info(f"  Teams: {totals['teams']}, Found roster: {totals['found']}, Parsed: {totals['parsed']}")
    log.info(f"  Players matched: {totals['matched']}, Unmatched: {totals['unmatched']}")
    log.info(f"  Jersey: +{totals['jersey_set']}, Weight: +{totals['weight_set']}, Height: +{totals['height_set']}")
    log.info(f"{'='*60}")


if __name__ == "__main__":
    main()
