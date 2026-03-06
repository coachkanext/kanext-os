"""
NCAA D2/D3 Weight Scraper — Fetches weight data from school athletics websites.

Stats.ncaa.org roster pages don't have weight. This scraper:
1. Looks up each school's athletics website URL from NCAA.com school profiles
2. Scrapes the school's Sidearm/PrestoSports roster page for weight data
3. Matches players to the DB and updates weight_lbs

Usage:
    python3 ncaa_weight_scraper.py d2
    python3 ncaa_weight_scraper.py d3
    python3 ncaa_weight_scraper.py d2 --dry-run
"""
from __future__ import annotations

import json
import logging
import os
import re
import sys
import time
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup

import db
from config import SEASON, NCAA_DIV_TO_LEVEL_KEY

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("ncaa_weight")

DELAY = 2  # seconds between requests
CACHE_FILE = os.path.join(os.path.dirname(__file__), "ncaa_athletics_urls.json")

# Manual mappings for teams whose NCAA.com slug doesn't match our DB name
MANUAL_SLUG_MAP: dict[str, str] = {
    "Ark.-Fort Smith": "ark-fort-smith",
    "Augusta": "gru-augusta",
    "AUM": "aum",
    "Cal St. San Marcos": "cal-st-san-marcos",
    "Chico St.": "chico-st",
    "Christian Brothers": "christian-bros",
    "Colo. Sch. of Mines": "colorado-mines",
    "CSU Pueblo": "csu-pueblo",
    "CSUSB": "cal-st-san-bernardino",
    "CUI": "concordia-irvine",
    "DBU": "dallas-baptist",
    "Embry-Riddle (FL)": "embry-riddle-fl",
    "Ill. Springfield": "ill-springfield",
    "Jamestown": "jamestown",
    "Jefferson": "philadelphia-u",
    "Jessup": "jessup",
    "Middle Georgia": "middle-georgia-st",
    "Midwestern St.": "midwestern-st",
    "Minnesota St.": "minnesota-st",
    "Missouri Western": "missouri-western",
    "Mo. Southern": "mo-southern",
    "Mo.-St. Louis": "mo-st-louis",
    "Mont. St.-Billings": "mont-st-billings",
    "N.C. Central": "nc-central",
    "N.M. Highlands": "nm-highlands",
    "Northwest Nazarene": "northwest-nazarene",
    "Nova Southeastern": "nova-southeastern",
    "Okla. Christian": "okla-christian",
    "P.R.-Bayamon": "pr-bayamon",
    "P.R.-Mayaguez": "pr-mayaguez",
    "P.R.-Rio Piedras": "pr-rio-piedras",
    "Palm Beach Atl.": "palm-beach-atl",
    "S.C. Upstate": "sc-upstate",
    "Saginaw Valley": "saginaw-valley",
    "Southeastern Okla.": "se-oklahoma-st",
    "Southern Ark.": "southern-ark",
    "Southern N.H.": "southern-nh",
    "Southern Wesleyan": "southern-wesleyan",
    "St. Edward's": "st-edwards",
    "St. Leo": "saint-leo",
    "St. Martin's": "saint-martins",
    "St. Mary's (TX)": "st-marys-tx",
    "St. Thomas Aquinas": "st-thomas-aquinas",
    "SW Oklahoma St.": "sw-oklahoma-st",
    "Texas A&M-Commerce": "texas-am-commerce",
    "Texas A&M-Kingsville": "texas-am-kingsville",
    "UC San Diego": "uc-san-diego",
    "UIndy": "indianapolis",
    "UNC Pembroke": "unc-pembroke",
    "UT Tyler": "ut-tyler",
    "UVA Wise": "uva-wise",
    "W. Tex. A&M": "west-texas-am",
    "Walsh": "walsh",
    "West Chester": "west-chester",
    "West Georgia": "west-georgia",
    "Wingate": "wingate",
    "Winston-Salem": "winston-salem-st",
}

_client: httpx.Client | None = None
_last_request_time: float = 0.0


def _get_client() -> httpx.Client:
    global _client
    if _client is None:
        _client = httpx.Client(timeout=20, follow_redirects=True)
    return _client


def _rate_limit():
    global _last_request_time
    now = time.time()
    elapsed = now - _last_request_time
    if elapsed < DELAY:
        time.sleep(DELAY - elapsed)
    _last_request_time = time.time()


# ── Athletics URL discovery ──

def _load_url_cache() -> dict[str, str]:
    """Load cached team → athletics URL mappings."""
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE) as f:
            return json.load(f)
    return {}


def _save_url_cache(cache: dict[str, str]):
    with open(CACHE_FILE, "w") as f:
        json.dump(cache, f, indent=2)


def _name_to_slug(name: str) -> str | None:
    """Convert DB team name to NCAA.com slug. Returns None if unsure."""
    # Check manual map first
    if name in MANUAL_SLUG_MAP:
        return MANUAL_SLUG_MAP[name]

    # Build slug from name: lowercase, remove parens content, replace spaces/dots with hyphens
    slug = name.lower().strip()
    # Remove common suffixes
    slug = re.sub(r"\s*\([^)]+\)", "", slug)  # Remove (GA), (SC), etc — keep for slug
    # Actually re-add parens content as suffix
    m = re.search(r"\(([^)]+)\)", name)
    suffix = f"-{m.group(1).lower()}" if m else ""
    slug = re.sub(r"\s*\([^)]+\)", "", name.lower().strip())
    slug = slug.replace(".", "").replace("'", "").replace("&", "").strip()
    slug = re.sub(r"\s+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    slug += suffix
    return slug


def discover_athletics_url(team_name: str, cache: dict[str, str]) -> str | None:
    """Look up a school's athletics website URL from NCAA.com school profile."""
    # Check cache
    if team_name in cache:
        url = cache[team_name]
        return url if url else None

    slug = _name_to_slug(team_name)
    if not slug:
        cache[team_name] = ""
        return None

    _rate_limit()
    client = _get_client()
    try:
        r = client.get(f"https://www.ncaa.com/schools/{slug}")
        if r.status_code != 200:
            log.debug(f"  NCAA.com profile 404 for slug: {slug}")
            cache[team_name] = ""
            return None

        soup = BeautifulSoup(r.text, "lxml")

        # Athletics URL: link text contains .com or .edu (not social media or NCAA links)
        for a in soup.find_all("a", href=True):
            text = a.get_text(strip=True).lower()
            href = a["href"]
            if ((".com" in text or ".edu" in text)
                and "ncaa" not in text
                and "facebook" not in text
                and "twitter" not in text
                and "wbd" not in text
                and "shop" not in text):
                url = href if href.startswith("http") else f"https://{href}"
                cache[team_name] = url
                return url

        cache[team_name] = ""
        return None
    except Exception as e:
        log.debug(f"  Error fetching NCAA.com profile for {slug}: {e}")
        cache[team_name] = ""
        return None


# ── Roster parsing ──

def _parse_height(s: str) -> int | None:
    if not s:
        return None
    m = re.match(r"(\d+)['\-](\d+)", s.strip())
    if m:
        return int(m.group(1)) * 12 + int(m.group(2))
    return None


def _parse_weight(s: str) -> int | None:
    if not s:
        return None
    m = re.match(r"(\d+)", s.strip())
    if m:
        w = int(m.group(1))
        if 100 <= w <= 400:
            return w
    return None


def parse_roster_page(html: str) -> list[dict]:
    """Parse a Sidearm/generic roster page for player bio data."""
    soup = BeautifulSoup(html, "lxml")

    # Find the roster table — look for tables with Name column
    for table in soup.find_all("table"):
        headers = [th.get_text(strip=True).lower() for th in table.find_all("th")]
        if not any(h in ("name", "full name") for h in headers):
            continue

        # Map columns
        col_map = {}
        for i, h in enumerate(headers):
            if h in ("name", "full name"):
                col_map["name"] = i
            elif h in ("#", "no.", "no"):
                col_map["number"] = i
            elif h in ("pos.", "pos", "position"):
                col_map["position"] = i
            elif h in ("ht.", "ht", "height"):
                col_map["height"] = i
            elif h in ("wt.", "wt", "weight"):
                col_map["weight"] = i
            elif h in ("cl.", "cl", "class", "yr.", "yr", "year", "academic year"):
                col_map["class"] = i
            elif "hometown" in h or "high school" in h:
                col_map["hometown_hs"] = i
            elif h in ("hometown",):
                col_map["hometown"] = i
            elif h in ("high school", "highschool", "hs"):
                col_map["high_school"] = i
            elif h in ("previous school", "prev school", "prev. school", "former school"):
                col_map["prev_school"] = i

        if "name" not in col_map:
            continue

        results = []
        for row in table.find_all("tr")[1:]:
            cells = row.find_all(["td", "th"])
            texts = [c.get_text(strip=True) for c in cells]

            name = texts[col_map["name"]] if col_map["name"] < len(texts) else ""
            if not name:
                continue

            height_str = texts[col_map.get("height", -1)] if "height" in col_map and col_map["height"] < len(texts) else ""
            weight_str = texts[col_map.get("weight", -1)] if "weight" in col_map and col_map["weight"] < len(texts) else ""
            class_year = texts[col_map.get("class", -1)] if "class" in col_map and col_map["class"] < len(texts) else ""
            position = texts[col_map.get("position", -1)] if "position" in col_map and col_map["position"] < len(texts) else ""
            prev_school = texts[col_map.get("prev_school", -1)] if "prev_school" in col_map and col_map["prev_school"] < len(texts) else ""

            # Parse hometown / high school (might be combined)
            city, state, high_school = "", "", ""
            if "hometown" in col_map and col_map["hometown"] < len(texts):
                ht = texts[col_map["hometown"]]
                parts = [p.strip() for p in ht.split(",")]
                city = parts[0]
                state = parts[1] if len(parts) >= 2 else ""
            if "high_school" in col_map and col_map["high_school"] < len(texts):
                high_school = texts[col_map["high_school"]]
            if "hometown_hs" in col_map and col_map["hometown_hs"] < len(texts):
                combined = texts[col_map["hometown_hs"]]
                # Format: "City, State / High School" or "City, State"
                if "/" in combined:
                    parts = combined.split("/", 1)
                    loc = parts[0].strip()
                    high_school = parts[1].strip()
                else:
                    loc = combined
                loc_parts = [p.strip() for p in loc.split(",")]
                city = loc_parts[0]
                state = loc_parts[1] if len(loc_parts) >= 2 else ""

            results.append({
                "name": name,
                "height_inches": _parse_height(height_str),
                "weight_lbs": _parse_weight(weight_str),
                "class_year": class_year,
                "position": position,
                "city": city,
                "state": state,
                "high_school": high_school,
                "prev_school": prev_school,
            })

        return results

    return []


# ── DB matching & update (reuse ncaa_bio_scraper's update_team_bios) ──

def update_team_weight(conn, team_season_id: str, roster: list[dict],
                       dry_run: bool = False) -> dict:
    """Match roster entries to DB players and update weight (+ any other missing bio fields)."""
    counts = {"matched": 0, "unmatched": 0,
              "weight_set": 0, "height_set": 0, "hometown_set": 0,
              "hs_set": 0, "prev_school_set": 0}

    db_players = conn.execute(
        """SELECT pts.id AS pts_id, p.id AS player_id, p.full_name,
                  p.height_inches, p.weight_lbs, p.city_origin,
                  p.high_school, pts.class_year, pts.previous_school
           FROM player_team_seasons pts
           JOIN players p ON p.id = pts.player_id
           WHERE pts.team_season_id = %s""",
        (team_season_id,),
    ).fetchall()

    if not db_players:
        return counts

    # Build name lookup
    name_map: dict[str, dict] = {}
    for dbp in db_players:
        key = dbp["full_name"].lower().strip()
        name_map[key] = dbp
        parts = key.split(",")
        if len(parts) == 2:
            last = parts[0].strip()
            first_init = parts[1].strip()[:1]
            name_map[f"{last}_{first_init}"] = dbp
        else:
            parts = key.split()
            if len(parts) >= 2:
                last = parts[-1]
                first_init = parts[0][:1]
                name_map[f"{last}_{first_init}"] = dbp

    for entry in roster:
        roster_name = entry["name"].lower().strip()

        # Try exact match
        dbp = name_map.get(roster_name)

        # Try reversed: "Last, First" → "First Last"
        if not dbp and "," in roster_name:
            parts = [p.strip() for p in roster_name.split(",", 1)]
            dbp = name_map.get(f"{parts[1]} {parts[0]}")

        # Try "First Last" → "Last, First"
        if not dbp:
            parts = roster_name.split()
            if len(parts) >= 2:
                dbp = name_map.get(f"{parts[-1]}, {' '.join(parts[:-1])}")

        # Fuzzy: last name + first initial
        if not dbp:
            parts = roster_name.replace(",", " ").split()
            if len(parts) >= 2:
                dbp = name_map.get(f"{parts[-1]}_{parts[0][:1]}")

        if not dbp:
            counts["unmatched"] += 1
            continue

        counts["matched"] += 1
        player_id = str(dbp["player_id"])
        pts_id = str(dbp["pts_id"])

        # Update weight if not set
        if entry["weight_lbs"] and not dbp["weight_lbs"]:
            counts["weight_set"] += 1
            if not dry_run:
                conn.execute(
                    "UPDATE players SET weight_lbs = %s, updated_at = now() WHERE id = %s",
                    (entry["weight_lbs"], player_id),
                )

        # Also fill other missing fields opportunistically
        if entry["height_inches"] and not dbp["height_inches"]:
            counts["height_set"] += 1
            if not dry_run:
                conn.execute(
                    "UPDATE players SET height_inches = %s, updated_at = now() WHERE id = %s",
                    (entry["height_inches"], player_id),
                )

        if entry["city"] and not dbp["city_origin"]:
            counts["hometown_set"] += 1
            if not dry_run:
                conn.execute(
                    "UPDATE players SET city_origin = %s, state_origin = %s, updated_at = now() WHERE id = %s",
                    (entry["city"], entry["state"], player_id),
                )

        if entry["high_school"] and not dbp["high_school"]:
            counts["hs_set"] += 1
            if not dry_run:
                conn.execute(
                    "UPDATE players SET high_school = %s, updated_at = now() WHERE id = %s",
                    (entry["high_school"], player_id),
                )

        if entry["prev_school"] and not dbp["previous_school"]:
            counts["prev_school_set"] += 1
            if not dry_run:
                conn.execute(
                    "UPDATE player_team_seasons SET previous_school = %s WHERE id = %s",
                    (entry["prev_school"], pts_id),
                )

    return counts


# ── Main pipeline ──

def scrape_division_weight(division: str, dry_run: bool = False):
    """Scrape weight data for all teams in an NCAA division via school athletics sites."""
    div_num = division.replace("d", "")
    level_key = NCAA_DIV_TO_LEVEL_KEY.get(div_num)
    if not level_key:
        log.error(f"Unknown division: {division}")
        return

    conn = db.get_conn()
    url_cache = _load_url_cache()

    # Get all teams — skip teams that already have >50% weight coverage
    rows = conn.execute(
        """SELECT t.id AS team_id, t.name, t.slug, ts.id AS team_season_id
           FROM teams t
           JOIN competitive_levels cl ON cl.id = t.competitive_level_id
           JOIN team_seasons ts ON ts.team_id = t.id AND ts.season = %s
           WHERE cl.level_key = %s
           ORDER BY t.name""",
        (SEASON, level_key),
    ).fetchall()

    teams_needing_weight = []
    for row in rows:
        ts_id = str(row["team_season_id"])
        cov = conn.execute(
            """SELECT COUNT(*) AS total,
                      COUNT(p.weight_lbs) AS has_weight
               FROM player_team_seasons pts
               JOIN players p ON p.id = pts.player_id
               WHERE pts.team_season_id = %s""",
            (ts_id,),
        ).fetchone()
        total = cov["total"]
        has_wt = cov["has_weight"]
        if total > 0 and (has_wt / total) < 0.5:
            teams_needing_weight.append(row)

    log.info(f"Weight scrape: {len(teams_needing_weight)}/{len(rows)} teams need weight for {level_key}")

    totals = {"teams": 0, "urls_found": 0, "rosters_parsed": 0, "matched": 0,
              "weight_set": 0, "height_set": 0, "hometown_set": 0,
              "hs_set": 0, "prev_school_set": 0,
              "no_url": 0, "no_roster": 0, "no_weight_col": 0}

    for i, row in enumerate(teams_needing_weight):
        name = row["name"]
        team_season_id = str(row["team_season_id"])
        totals["teams"] += 1

        log.info(f"\n[{i+1}/{len(teams_needing_weight)}] {name}")

        # Step 1: Get athletics URL
        athletics_url = discover_athletics_url(name, url_cache)
        if not athletics_url:
            log.info(f"  No athletics URL found")
            totals["no_url"] += 1
            continue

        totals["urls_found"] += 1

        # Step 2: Fetch roster page — try multiple URL patterns
        parsed = urlparse(athletics_url)
        base = f"{parsed.scheme}://{parsed.netloc}"
        roster_urls = [
            f"{base}/sports/mens-basketball/roster",
            f"{base}/roster.aspx?path=mbball",
        ]

        roster = None
        client = _get_client()
        for roster_url in roster_urls:
            _rate_limit()
            try:
                r = client.get(roster_url)
                if r.status_code != 200:
                    continue
                roster = parse_roster_page(r.text)
                if roster:
                    break
            except Exception:
                continue

        if not roster:
            log.info(f"  No roster found (tried {len(roster_urls)} URLs)")
            totals["no_roster"] += 1
            continue

        # Check if any player has weight
        has_any_weight = any(p["weight_lbs"] for p in roster)
        if not has_any_weight:
            log.info(f"  Roster parsed ({len(roster)} players) but no weight column/data")
            totals["no_weight_col"] += 1
            continue

        totals["rosters_parsed"] += 1

        # Step 4: Match and update
        counts = update_team_weight(conn, team_season_id, roster, dry_run=dry_run)
        for k in ("matched", "weight_set", "height_set", "hometown_set", "hs_set", "prev_school_set"):
            totals[k] += counts.get(k, 0)

        log.info(f"  {athletics_url}")
        log.info(f"  Parsed: {len(roster)} players, Matched: {counts['matched']}, "
                 f"Wt: +{counts['weight_set']}, Unmatched: {counts['unmatched']}")

        if not dry_run:
            conn.commit()

        # Save cache periodically
        if (i + 1) % 10 == 0:
            _save_url_cache(url_cache)

    # Final save
    _save_url_cache(url_cache)

    log.info(f"\n{'='*60}")
    log.info(f"DONE: {level_key} weight scrape")
    log.info(f"  Teams processed: {totals['teams']}")
    log.info(f"  URLs found: {totals['urls_found']}, No URL: {totals['no_url']}")
    log.info(f"  Rosters with weight: {totals['rosters_parsed']}, "
             f"No roster: {totals['no_roster']}, No weight col: {totals['no_weight_col']}")
    log.info(f"  Players matched: {totals['matched']}")
    log.info(f"  Weight set: {totals['weight_set']}")
    log.info(f"  Also: Ht +{totals['height_set']}, Town +{totals['hometown_set']}, "
             f"HS +{totals['hs_set']}, Prev +{totals['prev_school_set']}")

    conn.close()


if __name__ == "__main__":
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    args = [a for a in args if not a.startswith("--")]

    division = args[0] if args else None
    if not division or division not in ("d1", "d2", "d3"):
        print("Usage: python3 ncaa_weight_scraper.py [d2|d3] [--dry-run]")
        sys.exit(1)

    scrape_division_weight(division, dry_run=dry_run)
