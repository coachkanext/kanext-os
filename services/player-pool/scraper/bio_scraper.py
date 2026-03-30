"""
Bio Scraper — Height, Weight, Class Year, Hometown, HS/Previous School
Discovers individual school PrestoSports/Sidearm roster pages and extracts
physical measurements, class year, hometown, and HS/previous school for
players already in our database.

Also supports ESPN roster API for NCAA D1 teams.

Usage:
    python3 bio_scraper.py [level] [--espn] [--dry-run]

    # Scrape bio data from school roster sites for a level
    python3 bio_scraper.py naia
    python3 bio_scraper.py njcaa_d1
    python3 bio_scraper.py cccaa

    # Scrape bio data from ESPN roster API for D1 teams
    python3 bio_scraper.py ncaa_d1 --espn

    # All PrestoSports levels at once
    python3 bio_scraper.py all

    # Dry run (discover domains, don't update DB)
    python3 bio_scraper.py cccaa --dry-run
"""
from __future__ import annotations

import json
import logging
import os
import re
import sys
import time
from pathlib import Path

import httpx
from bs4 import BeautifulSoup
from curl_cffi import requests as curl_requests

import db
from config import SEASON, CRAWL_DELAY

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("bio_scraper")

ESPN_API = "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball"
DOMAIN_CACHE_FILE = Path(__file__).parent / "bio_domain_cache.json"
_last_request_time = 0.0


# ── HTTP helpers ──

def _rate_limit():
    global _last_request_time
    elapsed = time.time() - _last_request_time
    if elapsed < CRAWL_DELAY:
        time.sleep(CRAWL_DELAY - elapsed)
    _last_request_time = time.time()


def _get(url: str, timeout: int = 15) -> httpx.Response | None:
    _rate_limit()
    try:
        r = httpx.get(url, timeout=timeout, follow_redirects=True)
        if r.status_code == 200:
            return r
    except Exception:
        pass
    return None


def _head(url: str, timeout: int = 5) -> bool:
    """Quick HEAD check — no rate limiting (lightweight)."""
    try:
        r = httpx.head(url, timeout=timeout, follow_redirects=True)
        return r.status_code == 200
    except Exception:
        return False


# ── Height / Weight parsing ──

def _parse_height_str(s: str) -> int | None:
    """Parse height like '6-4', '6'7\"', '6-07', '5-11' → inches."""
    if not s:
        return None
    m = re.match(r"(\d+)['\-](\d+)", s.strip().replace('"', ''))
    if m:
        return int(m.group(1)) * 12 + int(m.group(2))
    return None


def _parse_weight_str(s: str) -> int | None:
    """Parse weight like '200', '200 lbs', '185' → integer pounds."""
    if not s:
        return None
    m = re.match(r"(\d+)", s.strip())
    if m:
        w = int(m.group(1))
        if 100 <= w <= 400:  # sanity check
            return w
    return None


# ── Domain discovery ──

def _generate_candidates(name: str, slug: str) -> list[str]:
    """Generate candidate PrestoSports domains from a team name."""
    name_lower = name.lower()
    # Normalize special chars
    name_lower = name_lower.replace("ñ", "n").replace("'", "").replace("'", "")
    # Remove parenthetical state abbreviations like (Ind.), (Ill.)
    name_lower = re.sub(r"\s*\([^)]+\)\s*", " ", name_lower).strip()

    # Base name with common suffixes stripped
    base = name_lower
    for suffix in [" university", " college", " community college",
                   " technical college", " state", " cc", " jv"]:
        base = base.replace(suffix, "")
    base = base.strip()
    base_clean = re.sub(r"[^a-z0-9]", "", base)

    # Full name without spaces
    full_clean = re.sub(r"[^a-z0-9]", "", name_lower)

    # With "college" appended
    with_college = base_clean + "college"
    with_cc = base_clean + "cc"
    with_univ = base_clean + "university"
    with_state = base_clean + "state"

    # Athletics variants
    go_variant = "go" + base_clean
    ath_variant = base_clean + "athletics"

    candidates = list(dict.fromkeys([  # dedupe, preserve order
        f"{base_clean}.prestosports.com",
        f"{full_clean}.prestosports.com",
        f"{slug}.prestosports.com",
        f"{with_college}.prestosports.com",
        f"{with_cc}.prestosports.com",
        f"{with_univ}.prestosports.com",
        f"{with_state}.prestosports.com",
        f"{go_variant}.prestosports.com",
        f"{ath_variant}.prestosports.com",
    ]))
    return candidates


def _load_domain_cache() -> dict[str, str]:
    """Load cached team_slug → roster_url mapping."""
    if DOMAIN_CACHE_FILE.exists():
        return json.loads(DOMAIN_CACHE_FILE.read_text())
    return {}


def _save_domain_cache(cache: dict[str, str]):
    DOMAIN_CACHE_FILE.write_text(json.dumps(cache, indent=2, sort_keys=True))


def _search_roster_url(school_name: str, level_hint: str = "") -> str | None:
    """Search DuckDuckGo for a school's basketball roster URL.
    Used for NAIA and other levels where domain can't be guessed."""
    level_tag = f" {level_hint}" if level_hint else ""
    query = f'{school_name}{level_tag} men\'s basketball roster site'
    try:
        _rate_limit()
        r = curl_requests.get(
            f'https://html.duckduckgo.com/html/?q={query}',
            impersonate='chrome', timeout=10,
        )
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, 'lxml')
            results = soup.select('.result__url')
            for res in results[:5]:
                url = res.get_text(strip=True)
                if 'roster' in url.lower() or 'basketball' in url.lower():
                    if not url.startswith('http'):
                        url = 'https://' + url
                    # Normalise: strip query params, ensure /roster path
                    url = url.split('?')[0].rstrip('/')
                    return url
    except Exception:
        pass
    return None


def _fetch_with_fallback(url: str) -> str | None:
    """Fetch URL with httpx, falling back to curl_cffi for 202/403."""
    _rate_limit()
    try:
        r = httpx.get(url, timeout=10, follow_redirects=True,
                      headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'})
        if r.status_code == 200 and len(r.text) > 2000:
            return r.text
    except Exception:
        pass
    # Fallback: curl_cffi for WAF / anti-bot
    try:
        _rate_limit()
        r = curl_requests.get(url, impersonate='chrome', timeout=10)
        if r.status_code == 200 and len(r.text) > 2000:
            return r.text
    except Exception:
        pass
    return None


def _fetch_wayback(url: str) -> str | None:
    """Fetch a URL via the Wayback Machine (web.archive.org).
    Useful for bypassing WAF on PrestoSports branded domains."""
    wb_url = f"https://web.archive.org/web/2025/{url}"
    _rate_limit()
    try:
        r = curl_requests.get(wb_url, impersonate='chrome', timeout=20)
        if r.status_code == 200 and len(r.text) > 2000:
            return r.text
    except Exception:
        pass
    return None


def _swap_season(url: str, from_season: str, to_season: str) -> str:
    """Swap a season year in a URL: /2025-26/ → /2024-25/."""
    return url.replace(f"/{from_season}/", f"/{to_season}/").replace(
        f"/{from_season}?", f"/{to_season}?"
    )


def parse_presto_cards(html: str) -> list[dict]:
    """Parse PrestoSports card-based roster layout (div.player-cards).

    PrestoSports uses a card grid where each player is a
    .player-card-wrapper containing structured HTML:
      - span.firstname + span.lastname for the name
      - span.number for jersey (#0)
      - Bio fields as label/value pairs on separate lines
    """
    soup = BeautifulSoup(html, "lxml")
    container = soup.select_one(".player-cards")
    if not container:
        return []

    cards = container.select(".player-card-wrapper")
    if not cards:
        return []

    players = []
    for card in cards:
        # Extract name from structured HTML spans
        first_el = card.select_one("span.firstname")
        last_el = card.select_one("span.lastname")
        if not first_el or not last_el:
            continue
        first = first_el.get_text(strip=True)
        last = last_el.get_text(strip=True)
        # lastname span sometimes has " - So" appended (from footer)
        last = re.sub(r"\s*-\s*(Fr|So|Jr|Sr|Gr|RS).*$", "", last, flags=re.IGNORECASE)
        name = f"{first} {last}".strip()
        if not name:
            continue

        # Jersey number
        jersey_el = card.select_one("span.number")
        jersey = ""
        if jersey_el:
            jersey = re.sub(r"[^0-9]", "", jersey_el.get_text(strip=True))

        # Extract bio fields from .player-short-bio text
        bio = card.select_one(".player-short-bio")
        class_year = ""
        height = None
        weight = None
        position = ""
        hometown_city = ""
        hometown_state = ""
        high_school = ""

        if bio:
            lines = [l.strip() for l in bio.get_text(separator="\n", strip=True).split("\n") if l.strip()]
            # Merge label + value pairs: ["Class:", "So"] → "Class: So"
            merged = []
            i = 0
            while i < len(lines):
                if lines[i].endswith(":") and i + 1 < len(lines):
                    merged.append(f"{lines[i]} {lines[i+1]}")
                    i += 2
                else:
                    merged.append(lines[i])
                    i += 1

            for line in merged:
                m = re.match(r"Class:\s*(.+)", line, re.IGNORECASE)
                if m:
                    class_year = m.group(1).strip()
                    continue
                m = re.match(r"Height:\s*(.+)", line, re.IGNORECASE)
                if m:
                    height = _parse_height_str(m.group(1).strip())
                    continue
                m = re.match(r"Weight:\s*(.+)", line, re.IGNORECASE)
                if m:
                    weight = _parse_weight_str(m.group(1).strip())
                    continue
                m = re.match(r"Position:\s*(.+)", line, re.IGNORECASE)
                if m:
                    position = m.group(1).strip()
                    continue
                m = re.match(r"Hometown:\s*(.+)", line, re.IGNORECASE)
                if m:
                    hometown_city, hometown_state = _parse_hometown(m.group(1).strip())
                    continue
                m = re.match(r"(?:High School|HS|Prep):\s*(.+)", line, re.IGNORECASE)
                if m:
                    high_school = m.group(1).strip()
                    continue

        players.append({
            "name": re.sub(r"\s+", " ", name).strip(),
            "height_inches": height,
            "weight_lbs": weight,
            "class_year": class_year,
            "position": position,
            "hometown_city": hometown_city,
            "hometown_state": hometown_state,
            "high_school": high_school,
            "previous_school": "",
            "jersey": jersey,
        })

    return players


def _roster_looks_valid(roster: list[dict]) -> bool:
    """Sanity check: roster names should be real names, not jersey numbers."""
    if not roster:
        return False
    # If >50% of names are all-numeric or <=2 chars, it's a bad parse
    bad = sum(1 for p in roster if len(p.get("name", "")) <= 2 or p["name"].isdigit())
    return bad < len(roster) * 0.5


def _best_roster_parse(html: str) -> list[dict]:
    """Try all 4 parsers and return the best (most players) valid result."""
    candidates = []
    r1 = parse_roster_page(html)
    if r1 and _roster_looks_valid(r1):
        candidates.append(r1)
    r2 = parse_sidearm_cards(html)
    if r2 and _roster_looks_valid(r2):
        candidates.append(r2)
    r3 = parse_sidearm_v3(html)
    if r3 and _roster_looks_valid(r3):
        candidates.append(r3)
    r4 = parse_presto_cards(html)
    if r4 and _roster_looks_valid(r4):
        candidates.append(r4)
    if not candidates:
        return []
    return max(candidates, key=len)


def discover_roster_url(name: str, slug: str, cache: dict) -> str | None:
    """Find the roster URL for a school. Uses cache first, then tries candidates.
    Tries both default and ?view=list (table layout) for card-based sites."""
    if slug in cache:
        return cache[slug]

    candidates = _generate_candidates(name, slug)
    for domain in candidates:
        base_url = f"https://{domain}/sports/mbkb/{SEASON}/roster"
        if _head(base_url):
            # Try default roster page first
            r = _get(base_url)
            if r and _has_bio_columns(r.text):
                # Check if it has a table — if not, try list view
                soup = BeautifulSoup(r.text, "lxml")
                has_table = bool(soup.find("table"))
                if has_table:
                    cache[slug] = base_url
                    return base_url
                # Try ?view=list for card-based sites
                list_url = base_url + "?view=list"
                r2 = _get(list_url)
                if r2 and _has_bio_columns(r2.text):
                    cache[slug] = list_url
                    return list_url
                # Fallback to default even without table
                cache[slug] = base_url
                return base_url
    return None


def _has_bio_columns(html: str) -> bool:
    """Check if a roster page HTML has useful bio columns (height, hometown, etc.)."""
    lower = html.lower()
    has_name = "name" in lower
    has_bio = any(k in lower for k in ("ht.", "height", "hometown", "high school", "previous school"))
    return has_name and has_bio


# ── Roster parsing ──

def _parse_hometown(raw: str) -> tuple[str, str]:
    """Parse hometown string like 'Sacramento, CA' → (city, state).
    Also handles 'City, ST / High School' combined columns."""
    if not raw:
        return ("", "")
    # Strip trailing "/ School Name" if present
    raw = raw.split("/")[0].strip()
    parts = [p.strip() for p in raw.split(",")]
    if len(parts) >= 2:
        return (parts[0], parts[1])
    return (parts[0], "")


def parse_roster_page(html: str) -> list[dict]:
    """Parse a PrestoSports/Sidearm roster page for bio data.
    Returns list of dicts with keys: name, height_inches, weight_lbs, class_year,
    position, hometown, high_school, previous_school."""
    soup = BeautifulSoup(html, "lxml")
    players = []

    # Known roster column headers (lowercase)
    KNOWN_HEADERS = {
        "no.", "#", "jersey", "number", "name", "player", "full name", "pos.", "pos", "position",
        "ht.", "ht", "height", "wt.", "wt", "weight",
        "cl.", "cl", "class", "year", "yr.", "yr", "academic year", "elig.",
        "hometown", "hometown/high school", "hometown/previous school",
        "hometown (prev school)", "hometown (high school)",
        "hs city & state", "high school", "previous school", "previous",
        "former school", "last school", "prev. school", "prev school",
        "status", "b/t", "bat/throw", "rsc",
        "birthplace", "birthdate", "age", "headshot", "image", "photo", "",
    }

    for table in soup.find_all("table"):
        ths = table.find_all("th")
        headers_raw = [th.get_text(strip=True).lower() for th in ths]

        # Clean all headers; keep all of them for accurate column counting.
        # Unrecognized headers are kept as-is (not mapped) but still counted
        # so that the cell offset logic works correctly.
        real_headers = []
        for h in headers_raw:
            h_clean = re.sub(r"\s+", " ", h).strip()
            h_clean = re.sub(r"\s*/\s*", "/", h_clean)
            real_headers.append(h_clean)

        if not any(h in ("name", "player", "full name") for h in real_headers):
            continue
        # Accept any roster table that has a name column (no longer require height)

        # Map header positions
        col_map = {}
        for i, h in enumerate(real_headers):
            if h in ("no.", "#", "jersey", "number") and "jersey" not in col_map:
                col_map["jersey"] = i
            elif h in ("name", "player", "full name") and "name" not in col_map:
                col_map["name"] = i
            elif h in ("ht.", "ht", "height") and "height" not in col_map:
                col_map["height"] = i
            elif h in ("wt.", "wt", "weight") and "weight" not in col_map:
                col_map["weight"] = i
            elif h in ("cl.", "cl", "year", "yr.", "yr", "class", "academic year") and "class_year" not in col_map:
                col_map["class_year"] = i
            elif h in ("pos.", "pos", "position") and "position" not in col_map:
                col_map["position"] = i
            elif h in ("hometown",) and "hometown" not in col_map:
                col_map["hometown"] = i
            elif h in ("hs city & state",) and "hometown" not in col_map:
                col_map["hometown"] = i
            elif h in ("high school",) and "high_school" not in col_map:
                col_map["high_school"] = i
            elif h in ("previous school", "previous", "former school", "last school", "prev. school", "prev school") and "previous_school" not in col_map:
                col_map["previous_school"] = i
            elif h in ("hometown/high school",) and "hometown_hs" not in col_map:
                col_map["hometown_hs"] = i  # combined column
            elif h in ("hometown/previous school",) and "hometown_prev" not in col_map:
                col_map["hometown_prev"] = i  # combined column
            elif h in ("hometown (prev school)", "hometown (high school)") and "hometown_hs" not in col_map:
                col_map["hometown_hs"] = i  # combined column (prep school = HS)

        if "name" not in col_map:
            continue

        # Sidearm responsive tables may have an extra cell at position 0
        # (plain jersey number) that doesn't correspond to any header.
        # Detect offset by checking if cells outnumber real headers.
        num_real = len(real_headers)
        # If there's an offset cell (jersey not in headers), note it
        jersey_in_offset = "jersey" not in col_map

        for row in table.find_all("tr")[1:]:
            cells = row.find_all(["td", "th"])
            if len(cells) < 3:
                continue

            # Determine cell offset: if more cells than headers, skip first cell
            offset = 1 if len(cells) > num_real else 0

            def get_cell_text(idx: int, is_name: bool = False) -> str:
                actual_idx = idx + offset
                if actual_idx >= len(cells):
                    return ""
                cell = cells[actual_idx]
                if is_name:
                    # Prefer data-sort attribute (Sidearm provides clean "Last, First")
                    ds = cell.get("data-sort", "")
                    if ds and "," in ds:
                        parts = ds.split(",", 1)
                        return f"{parts[1].strip()} {parts[0].strip()}"
                    # Sidearm has varied name cell structures:
                    # 1) Two divs: d-flex (desktop, has name) + d-print-block (print)
                    # 2) <a> link + empty <div>
                    # Try: first non-empty div, then <a>, then raw text
                    for div in cell.find_all("div"):
                        t = div.get_text(strip=True)
                        if t:
                            return t
                    a_tag = cell.find("a")
                    if a_tag:
                        return a_tag.get_text(strip=True)
                text = cell.get_text(strip=True)
                # Strip "Label:" prefixes from Sidearm responsive cells
                if ":" in text:
                    text = text.split(":", 1)[1].strip()
                return text

            name_val = get_cell_text(col_map["name"], is_name=True)
            if not name_val or name_val.upper() in ("STARTERS", "BENCH", "TEAM", "TM", "RESERVES", ""):
                continue

            # Clean name — remove extra whitespace/newlines
            name_val = re.sub(r"\s+", " ", name_val).strip()

            def get_val(key: str) -> str:
                idx = col_map.get(key)
                if idx is None:
                    return ""
                return get_cell_text(idx)

            # Parse hometown / high school / previous school
            hometown_city = ""
            hometown_state = ""
            high_school = ""
            previous_school = ""

            # Combined "Hometown/High School" column
            if "hometown_hs" in col_map:
                combined = get_val("hometown_hs")
                if "/" in combined:
                    parts = combined.split("/", 1)
                    hometown_city, hometown_state = _parse_hometown(parts[0].strip())
                    high_school = parts[1].strip()
                else:
                    hometown_city, hometown_state = _parse_hometown(combined)

            # Combined "Hometown/Previous School" column
            elif "hometown_prev" in col_map:
                combined = get_val("hometown_prev")
                if "/" in combined:
                    parts = combined.split("/", 1)
                    hometown_city, hometown_state = _parse_hometown(parts[0].strip())
                    previous_school = parts[1].strip()
                else:
                    hometown_city, hometown_state = _parse_hometown(combined)

            # Separate columns
            else:
                if "hometown" in col_map:
                    hometown_city, hometown_state = _parse_hometown(get_val("hometown"))

            # Always check separate HS / prev school columns (may coexist with combined)
            if "high_school" in col_map and not high_school:
                high_school = get_val("high_school")
            if "previous_school" in col_map and not previous_school:
                previous_school = get_val("previous_school")

            # Jersey number: from explicit column or from offset cell 0
            jersey = ""
            if "jersey" in col_map:
                jersey = get_val("jersey")
            elif jersey_in_offset and offset == 1:
                jersey = cells[0].get_text(strip=True)
            # Clean jersey (strip '#', whitespace)
            jersey = re.sub(r"[^0-9]", "", jersey) if jersey else ""

            players.append({
                "name": name_val,
                "height_inches": _parse_height_str(get_val("height")),
                "weight_lbs": _parse_weight_str(get_val("weight")),
                "class_year": get_val("class_year"),
                "position": get_val("position"),
                "hometown_city": hometown_city,
                "hometown_state": hometown_state,
                "high_school": high_school,
                "previous_school": previous_school,
                "jersey": jersey,
            })

        break  # Use first matching table

    return players


def parse_sidearm_cards(html: str) -> list[dict]:
    """Parse Sidearm card-based roster layout (li.sidearm-roster-player).

    Many Sidearm sites display each player as a card element rather than a
    table row.  Each card uses structured CSS classes:
      .sidearm-roster-player-jersey-number, .sidearm-roster-player-height,
      .sidearm-roster-player-weight, .sidearm-roster-player-academic-year,
      .sidearm-roster-player-hometown, .sidearm-roster-player-highschool,
      .sidearm-roster-player-previous-school
    Player name is in .sidearm-roster-player-name h3 a (or just the h3).
    """
    soup = BeautifulSoup(html, "lxml")
    cards = soup.select("li.sidearm-roster-player")
    if not cards:
        return []

    players = []
    for card in cards:
        # Name — in <h3> inside .sidearm-roster-player-name
        name_el = card.select_one(".sidearm-roster-player-name h3 a")
        if not name_el:
            name_el = card.select_one(".sidearm-roster-player-name h3")
        if not name_el:
            name_el = card.select_one(".sidearm-roster-player-name a")
        if not name_el:
            continue
        name_val = name_el.get_text(strip=True)
        if not name_val:
            continue

        # Jersey number
        jersey_el = card.select_one(".sidearm-roster-player-jersey-number")
        jersey = ""
        if jersey_el:
            jersey = re.sub(r"[^0-9]", "", jersey_el.get_text(strip=True))

        # Height
        ht_el = card.select_one(".sidearm-roster-player-height")
        height = _parse_height_str(ht_el.get_text(strip=True) if ht_el else "")

        # Weight
        wt_el = card.select_one(".sidearm-roster-player-weight")
        weight = _parse_weight_str(wt_el.get_text(strip=True) if wt_el else "")

        # Position
        pos_el = card.select_one(".sidearm-roster-player-position-long-short.hide-on-medium")
        position = pos_el.get_text(strip=True) if pos_el else ""

        # Class year — use the short version (hide-on-large) first, else full
        cy_el = card.select_one(".sidearm-roster-player-academic-year.hide-on-large")
        if not cy_el:
            cy_el = card.select_one(".sidearm-roster-player-academic-year")
        class_year = cy_el.get_text(strip=True) if cy_el else ""

        # Hometown
        ht_city_el = card.select_one(".sidearm-roster-player-hometown")
        hometown_city, hometown_state = _parse_hometown(
            ht_city_el.get_text(strip=True) if ht_city_el else ""
        )

        # High school
        hs_el = card.select_one(".sidearm-roster-player-highschool")
        high_school = hs_el.get_text(strip=True) if hs_el else ""

        # Previous school
        prev_el = card.select_one(".sidearm-roster-player-previous-school")
        previous_school = prev_el.get_text(strip=True) if prev_el else ""

        players.append({
            "name": re.sub(r"\s+", " ", name_val).strip(),
            "height_inches": height,
            "weight_lbs": weight,
            "class_year": class_year,
            "position": position,
            "hometown_city": hometown_city,
            "hometown_state": hometown_state,
            "high_school": high_school,
            "previous_school": previous_school,
            "jersey": jersey,
        })

    return players


# ── Sidearm v3 (Nuxt devalue) parsing ──

def parse_sidearm_v3(html: str) -> list[dict]:
    """Parse Sidearm v3 roster pages that use Nuxt devalue serialization.
    The entire page payload is a flat JSON array in a <script> tag where
    objects reference other array indices for their values."""
    soup = BeautifulSoup(html, "lxml")

    # Find the Nuxt data script tag
    script = soup.find("script", {"data-nuxt-data": True})
    if not script:
        # Fallback: look for script containing devalue player data
        for s in soup.find_all("script"):
            text = s.string or ""
            if text.strip().startswith("[") and '"firstName"' in text and '"lastName"' in text:
                script = s
                break

    if not script or not script.string:
        return []

    try:
        data = json.loads(script.string)
    except (json.JSONDecodeError, TypeError):
        return []

    if not isinstance(data, list) or len(data) < 50:
        return []

    def resolve(idx):
        """Resolve a devalue index reference to its actual value."""
        if not isinstance(idx, int) or idx < 0 or idx >= len(data):
            return None
        val = data[idx]
        # Don't resolve containers — only primitives
        if isinstance(val, (dict, list)):
            return None
        return val

    players = []
    for item in data:
        if not isinstance(item, dict):
            continue
        # Player objects have firstName + lastName as integer index refs,
        # plus at least one of: heightFeet, positionShort, jerseyNumber
        if "firstName" not in item or "lastName" not in item:
            continue
        if not isinstance(item.get("firstName"), int):
            continue
        if not any(k in item for k in ("heightFeet", "positionShort", "jerseyNumber")):
            continue

        first = resolve(item["firstName"])
        last = resolve(item["lastName"])
        if not isinstance(first, str) or not isinstance(last, str):
            continue

        name = f"{first} {last}".strip()
        if not name:
            continue

        # Height
        height_inches = None
        h_feet = resolve(item.get("heightFeet", -1))
        h_in = resolve(item.get("heightInches", -1))
        if h_feet is not None and h_in is not None:
            try:
                height_inches = int(h_feet) * 12 + int(h_in)
            except (ValueError, TypeError):
                pass

        # Weight
        weight_raw = resolve(item.get("weight", -1))
        weight_lbs = _parse_weight_str(str(weight_raw)) if weight_raw else None

        # Position
        position = resolve(item.get("positionShort", -1)) or ""

        # Class year
        class_year = resolve(item.get("academicYearShort", -1)) or \
                     resolve(item.get("academicYearLong", -1)) or ""

        # Hometown
        hometown_raw = resolve(item.get("hometown", -1)) or ""
        hometown_city, hometown_state = _parse_hometown(str(hometown_raw))

        # High school
        high_school = resolve(item.get("highSchool", -1)) or ""

        # Previous school
        previous_school = resolve(item.get("previousSchool", -1)) or ""

        # Jersey number
        jersey_raw = resolve(item.get("jerseyNumber", -1))
        jersey = str(jersey_raw) if jersey_raw is not None else ""
        jersey = re.sub(r"[^0-9]", "", jersey) if jersey else ""

        players.append({
            "name": name,
            "height_inches": height_inches,
            "weight_lbs": weight_lbs,
            "class_year": str(class_year) if class_year else "",
            "position": str(position) if position else "",
            "hometown_city": hometown_city,
            "hometown_state": hometown_state,
            "high_school": str(high_school) if high_school else "",
            "previous_school": str(previous_school) if previous_school else "",
            "jersey": jersey,
        })

    return players


# ── ESPN roster fetch ──

def fetch_espn_roster(espn_id: str) -> list[dict]:
    """Fetch roster from ESPN API. Returns list of player bio dicts."""
    r = _get(f"{ESPN_API}/teams/{espn_id}/roster")
    if not r:
        return []
    data = r.json()
    players = []
    for athlete in data.get("athletes", []):
        name = athlete.get("displayName", "")
        if not name:
            continue
        h = athlete.get("height")
        w = athlete.get("weight")
        exp = athlete.get("experience", {})
        class_year = exp.get("displayValue", "") if isinstance(exp, dict) else ""
        pos = athlete.get("position", {})
        position = pos.get("abbreviation", "") if isinstance(pos, dict) else ""
        # Hometown from birthPlace
        bp = athlete.get("birthPlace", {})
        hometown_city = ""
        hometown_state = ""
        if isinstance(bp, dict):
            hometown_city = bp.get("city", "") or ""
            hometown_state = bp.get("state", "") or ""
        jersey = athlete.get("jersey", "")
        players.append({
            "name": name,
            "height_inches": int(h) if h else None,
            "weight_lbs": int(w) if w else None,
            "class_year": class_year,
            "position": position,
            "hometown_city": hometown_city,
            "hometown_state": hometown_state,
            "high_school": "",  # ESPN doesn't provide HS
            "previous_school": "",  # ESPN doesn't provide prev school
            "jersey": str(jersey) if jersey else "",
        })
    return players


# ── DB update ──

def update_team_bios(conn, team_season_id: str, roster: list[dict], dry_run: bool = False) -> dict:
    """Match roster bio data to existing players and update all bio fields.
    Returns counts of updates made."""
    counts = {"matched": 0, "height_set": 0, "weight_set": 0, "class_year_set": 0,
              "hometown_set": 0, "hs_set": 0, "prev_school_set": 0, "jersey_set": 0, "unmatched": 0}

    # Get existing players for this team_season
    rows = conn.execute(
        """SELECT p.id as player_id, p.full_name, p.height_inches, p.weight_lbs,
                  p.city_origin, p.state_origin, p.high_school,
                  pts.id as pts_id, pts.class_year, pts.previous_school,
                  pts.jersey_number
           FROM player_team_seasons pts
           JOIN players p ON p.id = pts.player_id
           WHERE pts.team_season_id = %s""",
        (team_season_id,),
    ).fetchall()

    if not rows:
        return counts

    # Build lookup by lowercase name (with aliases for "Last,First" format)
    db_players = {}
    for row in rows:
        key = row["full_name"].lower().strip()
        db_players[key] = row
        # Also add reversed alias for "Last,First" → "first last"
        if "," in key:
            parts = key.split(",", 1)
            reversed_key = f"{parts[1].strip()} {parts[0].strip()}"
            if reversed_key not in db_players:
                db_players[reversed_key] = row

    for rp in roster:
        r_name = rp["name"].lower().strip()

        # Try exact match first
        match = db_players.get(r_name)

        # Try last-name-first reversal: "Smith, John" → "john smith"
        if not match and "," in r_name:
            parts = r_name.split(",", 1)
            reversed_name = f"{parts[1].strip()} {parts[0].strip()}"
            match = db_players.get(reversed_name)

        # Try fuzzy: match by last name + first initial
        if not match:
            r_parts = r_name.split()
            if len(r_parts) >= 2:
                r_last = r_parts[-1]
                r_first_init = r_parts[0][0] if r_parts[0] else ""
                for db_name, db_row in db_players.items():
                    db_parts = db_name.split()
                    if len(db_parts) >= 2:
                        db_last = db_parts[-1]
                        db_first_init = db_parts[0][0] if db_parts[0] else ""
                        if r_last == db_last and r_first_init == db_first_init:
                            match = db_row
                            break

        if not match:
            counts["unmatched"] += 1
            continue

        counts["matched"] += 1

        if dry_run:
            continue

        pid = str(match["player_id"])
        pts_id = str(match["pts_id"])

        # Update height
        if rp.get("height_inches") and not match["height_inches"]:
            conn.execute(
                "UPDATE players SET height_inches = %s, updated_at = now() WHERE id = %s",
                (rp["height_inches"], pid),
            )
            counts["height_set"] += 1

        # Update weight
        if rp.get("weight_lbs") and not match["weight_lbs"]:
            conn.execute(
                "UPDATE players SET weight_lbs = %s, updated_at = now() WHERE id = %s",
                (rp["weight_lbs"], pid),
            )
            counts["weight_set"] += 1

        # Update class year
        if rp.get("class_year") and not match["class_year"]:
            conn.execute(
                "UPDATE player_team_seasons SET class_year = %s WHERE id = %s",
                (rp["class_year"], pts_id),
            )
            counts["class_year_set"] += 1

        # Update hometown (city + state)
        if rp.get("hometown_city") and not match["city_origin"]:
            conn.execute(
                "UPDATE players SET city_origin = %s, state_origin = %s, updated_at = now() WHERE id = %s",
                (rp["hometown_city"], rp.get("hometown_state", ""), pid),
            )
            counts["hometown_set"] += 1

        # Update high school
        if rp.get("high_school") and not match["high_school"]:
            conn.execute(
                "UPDATE players SET high_school = %s, updated_at = now() WHERE id = %s",
                (rp["high_school"], pid),
            )
            counts["hs_set"] += 1

        # Update previous school
        if rp.get("previous_school") and not match["previous_school"]:
            conn.execute(
                "UPDATE player_team_seasons SET previous_school = %s WHERE id = %s",
                (rp["previous_school"], pts_id),
            )
            counts["prev_school_set"] += 1

        # Update jersey number
        if rp.get("jersey") and not match["jersey_number"]:
            conn.execute(
                "UPDATE player_team_seasons SET jersey_number = %s WHERE id = %s",
                (rp["jersey"], pts_id),
            )
            counts["jersey_set"] += 1

    return counts


# ── Main pipeline ──

def scrape_level_bios(conn, level_key: str, dry_run: bool = False):
    """Scrape bio data for all teams in a competitive level."""
    # Get all teams for this level
    rows = conn.execute(
        """SELECT t.id as team_id, t.name, t.slug, ts.id as team_season_id
           FROM teams t
           JOIN competitive_levels cl ON cl.id = t.competitive_level_id
           JOIN team_seasons ts ON ts.team_id = t.id AND ts.season = %s
           WHERE cl.level_key = %s
           AND NOT t.slug LIKE 'espn-opp-%%'
           ORDER BY t.name""",
        (SEASON, level_key),
    ).fetchall()

    log.info(f"Bio scrape: {len(rows)} teams for {level_key}")

    cache = _load_domain_cache()
    totals = {"teams": 0, "discovered": 0, "matched": 0,
              "height_set": 0, "weight_set": 0, "class_year_set": 0,
              "hometown_set": 0, "hs_set": 0, "prev_school_set": 0, "jersey_set": 0}

    for i, row in enumerate(rows):
        name = row["name"]
        slug = row["slug"]
        team_season_id = str(row["team_season_id"])
        totals["teams"] += 1

        log.info(f"\n[{i+1}/{len(rows)}] {name}")

        url = discover_roster_url(name, slug, cache)

        # PrestoSports may be blocked (HTTP 403). Fall back to web search
        # for schools that use Sidearm Sports or their own athletics sites.
        if not url and level_key in ("njcaa_d1", "njcaa_d2", "njcaa_d3",
                                      "nccaa_d1", "nccaa_d2", "cccaa", "uscaa"):
            level_label = level_key.upper().replace("_", " ")
            url = _search_roster_url(name, level_hint=level_label)
            if url and "espn.com" not in url:
                cache[slug] = url
                log.info(f"  Found via web search: {url}")
            else:
                url = None

        if not url:
            log.info(f"  No roster page found")
            continue

        totals["discovered"] += 1
        log.info(f"  Roster: {url}")

        r = _get(url)
        if not r:
            log.info(f"  Failed to fetch")
            continue

        roster = parse_roster_page(r.text)
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
                 f"Jersey: +{counts['jersey_set']}, "
                 f"Prev: +{counts['prev_school_set']}, Unmatched: {counts['unmatched']}")

        if not dry_run:
            conn.commit()

        # Save cache periodically
        if i % 10 == 0:
            _save_domain_cache(cache)

    _save_domain_cache(cache)

    log.info(f"\n{'='*60}")
    log.info(f"DONE: {level_key}")
    log.info(f"  Teams: {totals['teams']}, Discovered: {totals['discovered']}")
    log.info(f"  Players matched: {totals['matched']}")
    log.info(f"  Height: {totals['height_set']}, Weight: {totals['weight_set']}, "
             f"Year: {totals['class_year_set']}, Jersey: {totals['jersey_set']}")
    log.info(f"  Hometown: {totals['hometown_set']}, HS: {totals['hs_set']}, "
             f"Prev School: {totals['prev_school_set']}")


def scrape_espn_bios(conn, dry_run: bool = False):
    """Scrape bio data for all D1 teams via ESPN roster API."""
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

    log.info(f"ESPN bio scrape: {len(rows)} D1 teams")

    totals = {"teams": 0, "matched": 0,
              "height_set": 0, "weight_set": 0, "class_year_set": 0,
              "hometown_set": 0, "hs_set": 0, "prev_school_set": 0}

    for i, row in enumerate(rows):
        name = row["name"]
        slug = row["slug"]
        team_season_id = str(row["team_season_id"])
        espn_id = slug.replace("espn-", "")
        totals["teams"] += 1

        log.info(f"\n[{i+1}/{len(rows)}] {name} (ESPN #{espn_id})")

        roster = fetch_espn_roster(espn_id)
        if not roster:
            log.info(f"  No roster data")
            continue

        log.info(f"  Roster: {len(roster)} players")

        counts = update_team_bios(conn, team_season_id, roster, dry_run=dry_run)
        for k in totals:
            if k in counts:
                totals[k] += counts[k]

        log.info(f"  Matched: {counts['matched']}, Ht: +{counts['height_set']}, "
                 f"Wt: +{counts['weight_set']}, Yr: +{counts['class_year_set']}, "
                 f"Town: +{counts['hometown_set']}, "
                 f"Unmatched: {counts['unmatched']}")

        if not dry_run:
            conn.commit()

    log.info(f"\n{'='*60}")
    log.info(f"DONE: ESPN D1 bios")
    log.info(f"  Teams: {totals['teams']}")
    log.info(f"  Players matched: {totals['matched']}")
    log.info(f"  Height: {totals['height_set']}, Weight: {totals['weight_set']}, "
             f"Year: {totals['class_year_set']}")
    log.info(f"  Hometown: {totals['hometown_set']}")


# ── CLI ──

def scrape_naia_bios(conn, dry_run: bool = False):
    """Scrape bio data for NAIA teams using DuckDuckGo URL discovery
    and all 3 roster parsers (table, Sidearm cards, Sidearm v3)."""
    level_key = "naia"
    rows = conn.execute(
        """SELECT t.id as team_id, t.name, t.slug, ts.id as team_season_id
           FROM teams t
           JOIN competitive_levels cl ON cl.id = t.competitive_level_id
           JOIN team_seasons ts ON ts.team_id = t.id AND ts.season = %s
           WHERE cl.level_key = %s
           ORDER BY t.name""",
        (SEASON, level_key),
    ).fetchall()

    log.info(f"NAIA bio scrape: {len(rows)} teams")

    cache = _load_domain_cache()
    log_path = Path(__file__).parent / "logs" / "bio_naia.log"
    fh = logging.FileHandler(str(log_path), mode="a")
    fh.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s", datefmt="%H:%M:%S"))
    log.addHandler(fh)

    totals = {"teams": 0, "discovered": 0, "matched": 0,
              "height_set": 0, "weight_set": 0, "class_year_set": 0,
              "hometown_set": 0, "hs_set": 0, "prev_school_set": 0, "jersey_set": 0}

    for i, row in enumerate(rows):
        name = row["name"]
        slug = row["slug"]
        team_season_id = str(row["team_season_id"])
        totals["teams"] += 1

        log.info(f"[{i+1}/{len(rows)}] {name}")

        # Check cache first, then DuckDuckGo search
        url = cache.get(slug)
        if not url:
            url = _search_roster_url(name, level_hint="NAIA")
            if url:
                # Skip ESPN URLs — they're usually wrong school matches
                if "espn.com" not in url:
                    cache[slug] = url
                else:
                    url = None

        if not url:
            log.info(f"  No roster page found")
            continue

        totals["discovered"] += 1
        log.info(f"  Roster: {url}")

        # Fetch with fallback
        html = _fetch_with_fallback(url)
        if not html:
            # Try alternate roster paths
            base = url.rsplit('/roster', 1)[0] if '/roster' in url else url.rsplit('/sports/', 1)[0] + '/sports/mens-basketball'
            alt_paths = [
                base + '/roster/2024-25',
                base + '/roster/2025-26',
                base + '/roster?view=list',
            ]
            for alt in alt_paths:
                html = _fetch_with_fallback(alt)
                if html:
                    cache[slug] = alt
                    log.info(f"  Alt URL: {alt}")
                    break

        if not html:
            log.info(f"  Failed to fetch")
            continue

        # Use all 4 parsers, pick best
        roster = _best_roster_parse(html)

        # If 0 parsed, try ?view=list for table format
        if not roster and "?" not in url:
            list_url = url.rstrip("/") + "?view=list"
            log.info(f"  Try list view: {list_url}")
            list_html = _fetch_with_fallback(list_url)
            if list_html:
                roster = _best_roster_parse(list_html)

        log.info(f"  Parsed: {len(roster)} players")

        if not roster:
            continue

        counts = update_team_bios(conn, team_season_id, roster, dry_run=dry_run)
        for k in totals:
            if k in counts:
                totals[k] += counts[k]

        log.info(f"  {counts['matched']} matched, jersey +{counts['jersey_set']}, "
                 f"wt +{counts['weight_set']}, ht +{counts['height_set']}, "
                 f"hs +{counts['hs_set']}, cy +{counts['class_year_set']}")

        if not dry_run:
            conn.commit()

        # Save cache periodically
        if i % 10 == 0:
            _save_domain_cache(cache)

    _save_domain_cache(cache)

    log.info(f"\n{'='*60}")
    log.info(f"DONE: NAIA bios")
    log.info(f"  Teams: {totals['teams']}, Discovered: {totals['discovered']}")
    log.info(f"  Players matched: {totals['matched']}")
    log.info(f"  Height: {totals['height_set']}, Weight: {totals['weight_set']}, "
             f"Year: {totals['class_year_set']}, Jersey: {totals['jersey_set']}")
    log.info(f"  Hometown: {totals['hometown_set']}, HS: {totals['hs_set']}, "
             f"Prev School: {totals['prev_school_set']}")


def scrape_naia_bios_retry(conn, dry_run: bool = False):
    """Round 2: retry NAIA teams that still have 0 height coverage.
    Strategies:
      1. Season swap: /2025-26/ → /2024-25/ (roster turnover fix)
      2. Sidearm season path: /roster → /roster/2024-25
      3. Wayback Machine for WAF-blocked PrestoSports branded domains
      4. Re-search DuckDuckGo for NOT CACHED teams with more specific queries
    """
    level_key = "naia"
    # Get teams with 0 height coverage
    rows = conn.execute(
        """SELECT t.id as team_id, t.name, t.slug, ts.id as team_season_id
           FROM teams t
           JOIN competitive_levels cl ON cl.id = t.competitive_level_id
           JOIN team_seasons ts ON ts.team_id = t.id AND ts.season = %s
           WHERE cl.level_key = %s
           AND NOT EXISTS (
             SELECT 1 FROM player_team_seasons pts
             JOIN team_seasons ts2 ON ts2.id = pts.team_season_id
             JOIN players p ON p.id = pts.player_id
             WHERE ts2.team_id = t.id AND p.height_inches IS NOT NULL
           )
           ORDER BY t.name""",
        (SEASON, level_key),
    ).fetchall()

    log.info(f"NAIA bio RETRY: {len(rows)} teams with 0 height")

    cache = _load_domain_cache()
    log_path = Path(__file__).parent / "logs" / "bio_naia.log"
    fh = logging.FileHandler(str(log_path), mode="a")
    fh.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s", datefmt="%H:%M:%S"))
    log.addHandler(fh)

    totals = {"teams": 0, "matched": 0,
              "height_set": 0, "weight_set": 0, "class_year_set": 0,
              "hometown_set": 0, "hs_set": 0, "prev_school_set": 0, "jersey_set": 0}

    for i, row in enumerate(rows):
        name = row["name"]
        slug = row["slug"]
        team_season_id = str(row["team_season_id"])
        totals["teams"] += 1

        log.info(f"[RETRY {i+1}/{len(rows)}] {name}")

        cached_url = cache.get(slug)
        html = None
        source = ""

        # Strategy 1: Season swap (2025-26 → 2024-25)
        if cached_url and "/2025-26/" in cached_url:
            url_2024 = _swap_season(cached_url, "2025-26", "2024-25")
            log.info(f"  Try season swap: {url_2024}")
            html = _fetch_with_fallback(url_2024)
            if html:
                source = "season-swap"

        # Strategy 2: Sidearm season path (/roster → /roster/2024-25)
        if not html and cached_url and "/sports/mens-basketball/roster" in cached_url:
            base = cached_url.split("?")[0].rstrip("/")
            if not re.search(r"/\d{4}-\d{2}$", base):
                url_season = base + "/2024-25"
                log.info(f"  Try Sidearm season: {url_season}")
                html = _fetch_with_fallback(url_season)
                if html:
                    source = "sidearm-season"

        # Strategy 3: Wayback Machine for WAF-blocked URLs
        if not html and cached_url:
            # Try Wayback for the cached URL with 2024-25 season
            wb_target = cached_url
            if "/2025-26/" in wb_target:
                wb_target = _swap_season(wb_target, "2025-26", "2024-25")
            elif "/2023-24/" in wb_target:
                wb_target = _swap_season(wb_target, "2023-24", "2024-25")
            log.info(f"  Try Wayback: {wb_target}")
            html = _fetch_wayback(wb_target)
            if html:
                source = "wayback"

        # Strategy 4: Re-search with more specific query
        if not html and not cached_url:
            for query_suffix in [
                f"{name} NAIA men's basketball roster 2024-25",
                f"{name} NAIA basketball roster",
            ]:
                log.info(f"  Re-search: {query_suffix}")
                url = _search_roster_url(query_suffix)
                if url and "espn.com" not in url:
                    cache[slug] = url
                    html = _fetch_with_fallback(url)
                    if html:
                        source = "re-search"
                        break
                    # Try Wayback on the newly found URL
                    html = _fetch_wayback(url)
                    if html:
                        source = "re-search+wayback"
                        break

        if not html:
            log.info(f"  Still no data")
            continue

        log.info(f"  Source: {source}")
        roster = _best_roster_parse(html)

        # If 0 parsed, try ?view=list for table format
        if not roster and cached_url and "?" not in cached_url:
            list_url = cached_url.rstrip("/") + "?view=list"
            if "/2025-26/" in list_url:
                list_url = _swap_season(list_url, "2025-26", "2024-25")
            log.info(f"  Try list view: {list_url}")
            list_html = _fetch_with_fallback(list_url)
            if not list_html:
                list_html = _fetch_wayback(list_url)
            if list_html:
                roster = _best_roster_parse(list_html)

        log.info(f"  Parsed: {len(roster)} players")

        if not roster:
            continue

        counts = update_team_bios(conn, team_season_id, roster, dry_run=dry_run)
        for k in totals:
            if k in counts:
                totals[k] += counts[k]

        log.info(f"  {counts['matched']} matched, jersey +{counts['jersey_set']}, "
                 f"wt +{counts['weight_set']}, ht +{counts['height_set']}, "
                 f"hs +{counts['hs_set']}, cy +{counts['class_year_set']}")

        if not dry_run:
            conn.commit()

        if i % 10 == 0:
            _save_domain_cache(cache)

    _save_domain_cache(cache)

    log.info(f"\n{'='*60}")
    log.info(f"DONE: NAIA bio RETRY")
    log.info(f"  Teams retried: {totals['teams']}")
    log.info(f"  Players matched: {totals['matched']}")
    log.info(f"  Height: +{totals['height_set']}, Weight: +{totals['weight_set']}, "
             f"Year: +{totals['class_year_set']}, Jersey: +{totals['jersey_set']}")
    log.info(f"  Hometown: +{totals['hometown_set']}, HS: +{totals['hs_set']}, "
             f"Prev School: +{totals['prev_school_set']}")


PRESTO_LEVELS = ["njcaa_d1", "njcaa_d2", "njcaa_d3", "cccaa", "ncaa_d2", "ncaa_d3"]
WEB_SEARCH_LEVELS = ["naia"]

if __name__ == "__main__":
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    use_espn = "--espn" in args
    retry = "--retry" in args
    args = [a for a in args if not a.startswith("--")]

    level = args[0] if args else None

    if not level:
        print(__doc__)
        sys.exit(1)

    conn = db.get_conn()

    if use_espn or level == "ncaa_d1":
        scrape_espn_bios(conn, dry_run=dry_run)
    elif level == "naia" and retry:
        scrape_naia_bios_retry(conn, dry_run=dry_run)
    elif level == "naia":
        scrape_naia_bios(conn, dry_run=dry_run)
    elif level == "all":
        for lv in PRESTO_LEVELS:
            scrape_level_bios(conn, lv, dry_run=dry_run)
        scrape_naia_bios(conn, dry_run=dry_run)
    elif level in PRESTO_LEVELS:
        scrape_level_bios(conn, level, dry_run=dry_run)
    else:
        print(f"Unknown level: {level}")
        print(f"Valid levels: {', '.join(PRESTO_LEVELS + WEB_SEARCH_LEVELS + ['ncaa_d1', 'all'])}")
        sys.exit(1)

    conn.close()
