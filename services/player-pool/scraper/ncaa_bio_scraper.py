"""
NCAA Bio Scraper — Height, Weight, Hometown, High School for NCAA D2/D3 players.

Bypasses Akamai challenge on stats.ncaa.org to fetch team roster pages.
Each roster page has: GP, GS, #, Name, Class, Position, Height, Hometown, High School.

Handles Akamai rate-limiting by detecting blocks, backing off, and re-establishing
the session with a fresh challenge solve.

Usage:
    python3 ncaa_bio_scraper.py d2
    python3 ncaa_bio_scraper.py d3
    python3 ncaa_bio_scraper.py d2 --dry-run
"""
from __future__ import annotations

import logging
import re
import sys
import time

from bs4 import BeautifulSoup
from curl_cffi import requests as cffi_requests

import db
from config import SEASON, NCAA_BASE_URL, NCAA_DIV_TO_LEVEL_KEY

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("ncaa_bio")

DELAY = 3  # seconds between requests (separate from config CRAWL_DELAY)
BLOCK_BACKOFF = 60  # seconds to wait after detecting a block
MAX_CONSECUTIVE_FAILS = 3  # re-establish session after this many failures

_session: cffi_requests.Session | None = None
_last_request_time: float = 0.0
_consecutive_fails: int = 0


# ── HTTP / Akamai ──

def _new_session() -> cffi_requests.Session:
    """Create a fresh curl_cffi session with Chrome TLS impersonation."""
    global _session
    _session = cffi_requests.Session(impersonate="chrome120")
    log.info("Creating new curl_cffi session...")
    try:
        _session.get(f"{NCAA_BASE_URL}/", timeout=30)
        time.sleep(1)
    except Exception as e:
        log.warning(f"Session warmup failed: {e}")
    return _session


def _get_session() -> cffi_requests.Session:
    global _session
    if _session is None:
        return _new_session()
    return _session


def _solve_akamai(session: cffi_requests.Session, initial_response) -> bool:
    """Solve the Akamai interstitial JS challenge."""
    text = initial_response.text
    m = re.search(r'var i = (\d+);.*?Number\("(\d+)"\s*\+\s*"(\d+)"\)', text)
    if not m:
        log.error("Could not parse Akamai challenge JS")
        return False

    i_val = int(m.group(1))
    j_val = i_val + int(m.group(2) + m.group(3))

    bm_match = re.search(r'"bm-verify":\s*"([^"]+)"', text)
    if not bm_match:
        log.error("Could not find bm-verify token")
        return False

    verify_url = f"{NCAA_BASE_URL}/_sec/verify?provider=interstitial"
    vr = session.post(verify_url,
                      json={"bm-verify": bm_match.group(1), "pow": j_val},
                      timeout=30)
    if vr.status_code == 200:
        data = vr.json()
        if data.get("reload"):
            log.info("Akamai challenge solved")
            time.sleep(1)
            return True
    log.error(f"Akamai verify failed: {vr.status_code}")
    return False


def _reset_session():
    """Reset the session after being blocked. Wait, then create fresh session."""
    global _session, _consecutive_fails
    log.warning(f"Blocked by Akamai — backing off {BLOCK_BACKOFF}s then resetting session...")
    _session = None
    _consecutive_fails = 0
    time.sleep(BLOCK_BACKOFF)
    _new_session()
    # Trigger a fresh Akamai challenge solve
    try:
        test_url = f"{NCAA_BASE_URL}/teams/610539"  # any team page
        r = _session.get(test_url, timeout=30, allow_redirects=True)
        if "bm-verify" in r.text:
            _solve_akamai(_session, r)
    except Exception:
        pass


def fetch(url: str) -> cffi_requests.Response | None:
    """Fetch with rate limiting, automatic Akamai solving, and block recovery."""
    global _last_request_time, _consecutive_fails

    elapsed = time.time() - _last_request_time
    if elapsed < DELAY:
        time.sleep(DELAY - elapsed)

    session = _get_session()
    try:
        r = session.get(url, timeout=30, allow_redirects=True)
        _last_request_time = time.time()

        if r.status_code == 200 and "bm-verify" in r.text:
            log.info("Got Akamai challenge, solving...")
            if _solve_akamai(session, r):
                r = session.get(url, timeout=30, allow_redirects=True)
                _last_request_time = time.time()
                if r.status_code == 200 and "bm-verify" not in r.text:
                    _consecutive_fails = 0
                    return r
            _consecutive_fails += 1
            if _consecutive_fails >= MAX_CONSECUTIVE_FAILS:
                _reset_session()
            return None

        if r.status_code != 200:
            log.warning(f"HTTP {r.status_code}: {url}")
            _consecutive_fails += 1
            if _consecutive_fails >= MAX_CONSECUTIVE_FAILS:
                _reset_session()
            return None

        _consecutive_fails = 0
        return r

    except Exception as e:
        _last_request_time = time.time()
        log.error(f"Request failed: {url} — {e}")
        _consecutive_fails += 1
        if _consecutive_fails >= MAX_CONSECUTIVE_FAILS:
            _reset_session()
        return None


# ── Height parsing ──

def _parse_height(s: str) -> int | None:
    if not s:
        return None
    m = re.match(r"(\d+)['\-](\d+)", s.strip())
    if m:
        return int(m.group(1)) * 12 + int(m.group(2))
    return None


# ── Roster parsing ──

def parse_ncaa_roster(html: str) -> list[dict]:
    """Parse an NCAA stats.ncaa.org team roster page.
    Returns list of dicts with: name, height_inches, class_year, position,
    hometown_city, hometown_state, high_school."""
    soup = BeautifulSoup(html, "lxml")
    table = soup.find("table")
    if not table:
        return []

    headers = [th.get_text(strip=True).lower() for th in table.find_all("th")]
    rows = table.find_all("tr")[1:]

    # Map header names to indices
    col_map = {}
    for i, h in enumerate(headers):
        if h == "name":
            col_map["name"] = i
        elif h in ("class", "cl"):
            col_map["class"] = i
        elif h in ("position", "pos"):
            col_map["position"] = i
        elif h in ("height", "ht", "ht."):
            col_map["height"] = i
        elif h == "hometown":
            col_map["hometown"] = i
        elif h in ("high school", "highschool", "hs"):
            col_map["high_school"] = i
        elif h in ("previous school", "prev school", "prev. school", "former school"):
            col_map["prev_school"] = i
        elif h in ("weight", "wt", "wt."):
            col_map["weight"] = i

    results = []
    for row in rows:
        cells = row.find_all(["td", "th"])
        texts = [c.get_text(strip=True) for c in cells]

        name = texts[col_map["name"]] if "name" in col_map and col_map["name"] < len(texts) else ""
        if not name:
            continue

        height_str = texts[col_map["height"]] if "height" in col_map and col_map["height"] < len(texts) else ""
        class_year = texts[col_map["class"]] if "class" in col_map and col_map["class"] < len(texts) else ""
        position = texts[col_map["position"]] if "position" in col_map and col_map["position"] < len(texts) else ""
        hometown = texts[col_map["hometown"]] if "hometown" in col_map and col_map["hometown"] < len(texts) else ""
        high_school = texts[col_map["high_school"]] if "high_school" in col_map and col_map["high_school"] < len(texts) else ""
        prev_school = texts[col_map.get("prev_school", -1)] if "prev_school" in col_map and col_map["prev_school"] < len(texts) else ""
        weight_str = texts[col_map.get("weight", -1)] if "weight" in col_map and col_map["weight"] < len(texts) else ""

        # Parse hometown: "City, ST" → (city, state)
        city, state = "", ""
        if hometown:
            parts = [p.strip() for p in hometown.split(",")]
            city = parts[0] if parts else ""
            state = parts[1] if len(parts) >= 2 else ""

        # Parse weight
        weight_lbs = None
        if weight_str:
            wm = re.match(r"(\d+)", weight_str.strip())
            if wm:
                w = int(wm.group(1))
                if 100 <= w <= 400:
                    weight_lbs = w

        results.append({
            "name": name,
            "height_inches": _parse_height(height_str),
            "weight_lbs": weight_lbs,
            "class_year": class_year,
            "position": position,
            "city": city,
            "state": state,
            "high_school": high_school,
            "prev_school": prev_school,
        })

    return results


# ── DB matching & update ──

def update_team_bios(conn, team_season_id: str, roster: list[dict],
                     dry_run: bool = False) -> dict:
    """Match roster entries to DB players and update bio fields."""
    counts = {"matched": 0, "unmatched": 0,
              "height_set": 0, "weight_set": 0, "class_year_set": 0,
              "hometown_set": 0, "hs_set": 0, "prev_school_set": 0}

    # Get DB players for this team season
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
        # Also index by last name + first initial for fuzzy matching
        parts = key.split(",")
        if len(parts) == 2:
            # "Last, First" format
            last = parts[0].strip()
            first_init = parts[1].strip()[:1]
            name_map[f"{last}_{first_init}"] = dbp
        else:
            parts = key.split()
            if len(parts) >= 2:
                # "First Last" format
                last = parts[-1]
                first_init = parts[0][:1]
                name_map[f"{last}_{first_init}"] = dbp

    for entry in roster:
        roster_name = entry["name"].lower().strip()

        # Try exact match
        dbp = name_map.get(roster_name)

        # Try reversed name: "Day, Nathan" → "nathan day"
        if not dbp and "," in roster_name:
            parts = [p.strip() for p in roster_name.split(",", 1)]
            reversed_name = f"{parts[1]} {parts[0]}"
            dbp = name_map.get(reversed_name)

        # Try "First Last" → "Last, First" (DB might store as "Last, First")
        if not dbp:
            parts = roster_name.split()
            if len(parts) >= 2:
                comma_name = f"{parts[-1]}, {' '.join(parts[:-1])}"
                dbp = name_map.get(comma_name)

        # Fuzzy: last name + first initial
        if not dbp:
            parts = roster_name.replace(",", " ").split()
            if len(parts) >= 2:
                # Try "First Last" → last_f
                last = parts[-1]
                first_init = parts[0][:1]
                dbp = name_map.get(f"{last}_{first_init}")

        if not dbp:
            counts["unmatched"] += 1
            continue

        counts["matched"] += 1
        player_id = str(dbp["player_id"])
        pts_id = str(dbp["pts_id"])

        # Update height if not set
        if entry["height_inches"] and not dbp["height_inches"]:
            counts["height_set"] += 1
            if not dry_run:
                conn.execute(
                    "UPDATE players SET height_inches = %s, updated_at = now() WHERE id = %s",
                    (entry["height_inches"], player_id),
                )

        # Update weight if not set
        if entry["weight_lbs"] and not dbp["weight_lbs"]:
            counts["weight_set"] += 1
            if not dry_run:
                conn.execute(
                    "UPDATE players SET weight_lbs = %s, updated_at = now() WHERE id = %s",
                    (entry["weight_lbs"], player_id),
                )

        # Update city/state if not set
        if entry["city"] and not dbp["city_origin"]:
            counts["hometown_set"] += 1
            if not dry_run:
                conn.execute(
                    """UPDATE players SET city_origin = %s, state_origin = %s, updated_at = now()
                       WHERE id = %s""",
                    (entry["city"], entry["state"], player_id),
                )

        # Update high school if not set
        if entry["high_school"] and not dbp["high_school"]:
            counts["hs_set"] += 1
            if not dry_run:
                conn.execute(
                    "UPDATE players SET high_school = %s, updated_at = now() WHERE id = %s",
                    (entry["high_school"], player_id),
                )

        # Update class year if not set
        if entry["class_year"] and not dbp["class_year"]:
            counts["class_year_set"] += 1
            if not dry_run:
                conn.execute(
                    "UPDATE player_team_seasons SET class_year = %s WHERE id = %s",
                    (entry["class_year"], pts_id),
                )

        # Update previous school if not set
        if entry["prev_school"] and not dbp["previous_school"]:
            counts["prev_school_set"] += 1
            if not dry_run:
                conn.execute(
                    "UPDATE player_team_seasons SET previous_school = %s WHERE id = %s",
                    (entry["prev_school"], pts_id),
                )

    return counts


# ── Main pipeline ──

def scrape_division_bios(division: str, dry_run: bool = False):
    """Scrape bio data for all teams in an NCAA division."""
    level_key = NCAA_DIV_TO_LEVEL_KEY.get(division)
    if not level_key:
        log.error(f"Unknown division: {division}")
        return

    conn = db.get_conn()

    # Get all teams for this level — skip teams that already have good bio coverage
    rows = conn.execute(
        """SELECT t.id AS team_id, t.name, t.slug, ts.id AS team_season_id
           FROM teams t
           JOIN competitive_levels cl ON cl.id = t.competitive_level_id
           JOIN team_seasons ts ON ts.team_id = t.id AND ts.season = %s
           WHERE cl.level_key = %s
           ORDER BY t.name""",
        (SEASON, level_key),
    ).fetchall()

    # Check which teams still need bio data — skip teams with >50% height coverage
    teams_needing_bios = []
    for row in rows:
        ts_id = str(row["team_season_id"])
        cov = conn.execute(
            """SELECT COUNT(*) AS total,
                      COUNT(p.height_inches) AS has_height
               FROM player_team_seasons pts
               JOIN players p ON p.id = pts.player_id
               WHERE pts.team_season_id = %s""",
            (ts_id,),
        ).fetchone()
        total = cov["total"]
        has_ht = cov["has_height"]
        if total == 0 or (has_ht / total) < 0.5:
            teams_needing_bios.append(row)

    log.info(f"NCAA bio scrape: {len(teams_needing_bios)}/{len(rows)} teams need bio data for {level_key}")

    totals = {"teams": 0, "discovered": 0, "matched": 0,
              "height_set": 0, "weight_set": 0, "class_year_set": 0,
              "hometown_set": 0, "hs_set": 0, "prev_school_set": 0}

    for i, row in enumerate(teams_needing_bios):
        name = row["name"]
        slug = row["slug"]
        team_season_id = str(row["team_season_id"])
        totals["teams"] += 1

        # Extract ncaa_team_id from slug (e.g., "ncaa-610539" → "610539")
        m = re.match(r"ncaa-(\d+)", slug)
        if not m:
            log.info(f"[{i+1}/{len(teams_needing_bios)}] {name} — no NCAA team ID in slug")
            continue

        ncaa_team_id = m.group(1)
        log.info(f"[{i+1}/{len(teams_needing_bios)}] {name} (#{ncaa_team_id})")

        url = f"{NCAA_BASE_URL}/teams/{ncaa_team_id}/roster"
        r = fetch(url)
        if not r:
            log.info(f"  Failed to fetch roster")
            continue

        totals["discovered"] += 1
        roster = parse_ncaa_roster(r.text)
        log.info(f"  Parsed: {len(roster)} players")

        if not roster:
            continue

        counts = update_team_bios(conn, team_season_id, roster, dry_run=dry_run)
        for k in totals:
            if k in counts:
                totals[k] += counts[k]

        log.info(f"  Matched: {counts['matched']}, Ht: +{counts['height_set']}, "
                 f"Wt: +{counts['weight_set']}, Yr: +{counts['class_year_set']}, "
                 f"Town: +{counts['hometown_set']}, HS: +{counts['hs_set']}, "
                 f"Prev: +{counts['prev_school_set']}, Unmatched: {counts['unmatched']}")

        if not dry_run:
            conn.commit()

    log.info(f"\n{'='*60}")
    log.info(f"DONE: {level_key}")
    log.info(f"  Teams: {totals['teams']}, Fetched: {totals['discovered']}")
    log.info(f"  Players matched: {totals['matched']}")
    log.info(f"  Height: {totals['height_set']}, Weight: {totals['weight_set']}, "
             f"Year: {totals['class_year_set']}")
    log.info(f"  Hometown: {totals['hometown_set']}, HS: {totals['hs_set']}, "
             f"Prev School: {totals['prev_school_set']}")

    conn.close()


if __name__ == "__main__":
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    args = [a for a in args if not a.startswith("--")]

    division = args[0] if args else None
    if not division or division not in ("d1", "d2", "d3"):
        print("Usage: python3 ncaa_bio_scraper.py [d1|d2|d3] [--dry-run]")
        sys.exit(1)

    div_num = division[1]  # "d2" → "2"
    scrape_division_bios(div_num, dry_run=dry_run)
