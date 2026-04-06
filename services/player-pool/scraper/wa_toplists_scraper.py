#!/usr/bin/env python3
"""
KaNeXT World Athletics All-Time Top Lists Scraper
Source: worldathletics.org/records/toplists/ (static HTML, no API key needed)

Scrapes the all-time top 100 performers for each individual T&F event
(outdoor + indoor, men + women, senior age category).

This is the pro/Olympic tier data — every elite athlete who has ever ranked
in the world top 100 for their event.

URL pattern:
  https://worldathletics.org/records/toplists/{group}/{event}/{environment}/{gender}/senior
  → redirects to: /records/all-time-toplists/{group}/{event}/{environment}/{gender}/senior

Table columns: Rank, Mark, Wind, Competitor (LAST FIRST), DOB, Country, Pos,
               (blank), Venue, Date, Results Score

DB tables:
  wa_athletes      — full_name, dob, country, gender
  wa_performances  — athlete_id, event, group, environment (outdoor/indoor),
                     mark, wind, rank, venue, meet_date, results_score, age_category

Usage:
    python3 wa_toplists_scraper.py              # all events, outdoor + indoor
    python3 wa_toplists_scraper.py --outdoor    # outdoor only
    python3 wa_toplists_scraper.py --indoor     # indoor only
    python3 wa_toplists_scraper.py --gender men # men only
    python3 wa_toplists_scraper.py --group sprints  # one group only
"""
from __future__ import annotations

import argparse
import re
import sys
import time
from datetime import date, datetime
from typing import Optional

import httpx
import psycopg
from bs4 import BeautifulSoup
from psycopg.rows import dict_row

# ── Config ────────────────────────────────────────────────────────────────────
DB_CONFIG  = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}
BASE_URL   = "https://worldathletics.org"
SLEEP_REQ  = 3.0   # seconds between requests (WA is rate-sensitive)
AGE_CAT    = "senior"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://worldathletics.org/records/all-time",
}

# ── Group slug map (from __NEXT_DATA__ on the records page) ──────────────────
# Group name (from appdata/records/disciplinesall) → URL slug
GROUP_SLUG = {
    "Sprints":          "sprints",
    "Middle/Long":      "middlelong",
    "Hurdles":          "hurdles",
    "Road Running":     "road-running",
    "Jumps":            "jumps",
    "Throws":           "throws",
    "Combined Events":  "combined-events",
    "Race Walks":       "race-walks",
    "Walks":            "race-walks",
}

# ── Skip relay and non-individual events ─────────────────────────────────────
SKIP_RE = re.compile(
    r"\b(relay|4\s*x\s*\d|\d\s*x\s*\d|medley|road\s*relay)\b",
    re.IGNORECASE,
)

# ── DDL ───────────────────────────────────────────────────────────────────────
DDL = """
CREATE TABLE IF NOT EXISTS wa_athletes (
    id          SERIAL PRIMARY KEY,
    full_name   TEXT NOT NULL,
    dob         DATE,
    country     TEXT,
    gender      TEXT,
    UNIQUE (full_name, dob, country)
);

CREATE TABLE IF NOT EXISTS wa_performances (
    id             SERIAL PRIMARY KEY,
    athlete_id     INT  NOT NULL REFERENCES wa_athletes(id),
    event          TEXT NOT NULL,
    event_group    TEXT,
    environment    TEXT NOT NULL,
    age_category   TEXT NOT NULL DEFAULT 'senior',
    rank           INT,
    mark           TEXT,
    wind           TEXT,
    venue          TEXT,
    meet_date      DATE,
    results_score  INT,
    UNIQUE (athlete_id, event, environment, age_category)
);
"""

# ── Helpers ───────────────────────────────────────────────────────────────────
def parse_dob(s: str) -> Optional[date]:
    """'21 AUG 1986' → date"""
    s = s.strip()
    if not s:
        return None
    for fmt in ("%d %b %Y", "%d %B %Y"):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            pass
    return None

def parse_meet_date(s: str) -> Optional[date]:
    """'16 AUG 2009' → date"""
    return parse_dob(s)  # same format

def _int(v) -> Optional[int]:
    if not v or str(v).strip() in ("", "-", "—"):
        return None
    try:
        return int(str(v).strip())
    except (ValueError, TypeError):
        return None

def clean_wind(v: str) -> Optional[str]:
    v = v.strip()
    return v if v else None


def fetch(url: str, retries: int = 3) -> Optional[BeautifulSoup]:
    backoff = 60
    for attempt in range(retries):
        try:
            r = httpx.get(url, headers=HEADERS, follow_redirects=True, timeout=30)
            if r.status_code == 429:
                if attempt < retries - 1:
                    print(f"  [429] Rate limited — waiting {backoff}s (attempt {attempt+1}/{retries-1})")
                    time.sleep(backoff)
                    backoff = min(backoff * 2, 300)
                    continue
                print(f"  [429] Rate limited after {retries} attempts")
                return None
            if r.status_code == 200:
                soup = BeautifulSoup(r.text, "html.parser")
                return soup
            print(f"  [HTTP {r.status_code}] {url}")
            return None
        except Exception as e:
            print(f"  [ERROR] {url}: {e}")
            if attempt < retries - 1:
                time.sleep(10)
    return None


def get_discipline_list() -> list[dict]:
    """
    Fetch complete discipline list from WA appdata API.
    Returns dicts with keys: group, group_slug, event, event_slug, gender, environment
    Filters: age=SENIOR, no relays.
    """
    url = f"{BASE_URL}/appdata/records/disciplinesall"
    r = httpx.get(url, headers=HEADERS, timeout=20)
    raw = r.json()

    items = []
    seen = set()
    for d in raw:
        if d.get("Age") != "SENIOR":
            continue
        name = d.get("Name", "")
        if SKIP_RE.search(name):
            continue
        group = d.get("Group", "")
        group_slug = GROUP_SLUG.get(group)
        if not group_slug:
            continue
        event_slug = d.get("DisciplineUrlSlug", "")
        env = d.get("IndoorOutdoor", "").lower()
        if env not in ("outdoor", "indoor"):
            continue
        gender = "men" if d.get("SexCode") == "Men" else "women"

        key = (group_slug, event_slug, env, gender)
        if key not in seen:
            seen.add(key)
            items.append({
                "group":      group,
                "group_slug": group_slug,
                "event_name": name,
                "event_slug": event_slug,
                "environment": env,
                "gender":     gender,
            })

    return items


# ── Parsing ───────────────────────────────────────────────────────────────────
def parse_toplist_table(soup: BeautifulSoup) -> list[dict]:
    """Parse the all-time top list HTML table. Returns list of performance dicts."""
    tables = soup.find_all("table")
    if not tables:
        return []

    # Find the table with ranking data (has Rank, Mark, Competitor columns)
    for tbl in tables:
        ths = [th.get_text(strip=True) for th in tbl.find_all("th")]
        if "Rank" in ths and "Mark" in ths and "Competitor" in ths:
            break
    else:
        # Try first table
        tbl = tables[0]
        ths = [th.get_text(strip=True) for th in tbl.find_all("th")]

    # Build column index map
    col_map = {name: i for i, name in enumerate(ths)}
    # Expected: Rank, Mark, WIND, Competitor, DOB, (country), Pos, (blank), Venue, Date, Results Score
    # Fallback positional: 0=Rank, 1=Mark, 2=Wind, 3=Competitor, 4=DOB, 5=Country, 6=Pos, 7=blank, 8=Venue, 9=Date, 10=Score

    rows = []
    for tr in tbl.find_all("tr")[1:]:  # skip header
        cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
        if len(cells) < 6:
            continue
        # Skip separator/total rows
        if not cells[0].isdigit():
            continue

        def _cell(key, fallback_idx):
            if key in col_map:
                idx = col_map[key]
                return cells[idx] if idx < len(cells) else ""
            return cells[fallback_idx] if fallback_idx < len(cells) else ""

        rank       = _int(cells[0])
        mark       = cells[1] if len(cells) > 1 else ""
        wind       = clean_wind(cells[2]) if len(cells) > 2 else None
        competitor = cells[3] if len(cells) > 3 else ""
        dob_str    = cells[4] if len(cells) > 4 else ""
        country    = cells[5] if len(cells) > 5 else ""
        # pos = cells[6]
        # blank = cells[7]
        venue      = cells[8] if len(cells) > 8 else ""
        date_str   = cells[9] if len(cells) > 9 else ""
        score_str  = cells[10] if len(cells) > 10 else ""

        if not competitor or not mark:
            continue

        rows.append({
            "rank":        rank,
            "mark":        mark,
            "wind":        wind,
            "name":        competitor,
            "dob":         parse_dob(dob_str),
            "country":     country,
            "venue":       venue if venue else None,
            "meet_date":   parse_meet_date(date_str),
            "results_score": _int(score_str),
        })

    return rows


# ── DB ────────────────────────────────────────────────────────────────────────
def upsert_athlete(conn, name: str, dob: Optional[date],
                   country: str, gender: str) -> int:
    row = conn.execute(
        """INSERT INTO wa_athletes (full_name, dob, country, gender)
           VALUES (%s, %s, %s, %s)
           ON CONFLICT (full_name, dob, country) DO UPDATE
             SET gender = EXCLUDED.gender
           RETURNING id""",
        (name, dob, country, gender),
    ).fetchone()
    return row["id"]

def upsert_performance(conn, athlete_id: int, event: str, group: str,
                       environment: str, age_cat: str, row: dict) -> bool:
    r = conn.execute(
        """INSERT INTO wa_performances
               (athlete_id, event, event_group, environment, age_category,
                rank, mark, wind, venue, meet_date, results_score)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
           ON CONFLICT (athlete_id, event, environment, age_category) DO UPDATE
             SET rank=EXCLUDED.rank, mark=EXCLUDED.mark, wind=EXCLUDED.wind,
                 venue=EXCLUDED.venue, meet_date=EXCLUDED.meet_date,
                 results_score=EXCLUDED.results_score, event_group=EXCLUDED.event_group
           RETURNING id, (xmax=0) AS is_insert""",
        (
            athlete_id, event, group, environment, age_cat,
            row["rank"], row["mark"], row["wind"],
            row["venue"], row["meet_date"], row["results_score"],
        ),
    ).fetchone()
    return bool(r["is_insert"])


# ── Core ──────────────────────────────────────────────────────────────────────
def scrape_event(conn, disc: dict) -> tuple[int, int]:
    """
    Scrape one event/gender/environment combination.
    Returns (athletes_upserted, performances_new).
    """
    url = (f"{BASE_URL}/records/toplists/{disc['group_slug']}/"
           f"{disc['event_slug']}/{disc['environment']}/{disc['gender']}/{AGE_CAT}")

    soup = fetch(url)
    if not soup:
        return 0, 0

    rows = parse_toplist_table(soup)
    if not rows:
        return 0, 0

    athletes = 0
    new_perfs = 0
    with conn.transaction():
        for row in rows:
            aid = upsert_athlete(conn, row["name"], row["dob"],
                                 row["country"], disc["gender"])
            athletes += 1
            is_new = upsert_performance(
                conn, aid,
                event=disc["event_name"],
                group=disc["group"],
                environment=disc["environment"],
                age_cat=AGE_CAT,
                row=row,
            )
            if is_new:
                new_perfs += 1

    return athletes, new_perfs


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Scrape WA all-time top lists")
    parser.add_argument("--outdoor", action="store_true")
    parser.add_argument("--indoor",  action="store_true")
    parser.add_argument("--gender",  choices=["men", "women"])
    parser.add_argument("--group",   help="Filter to one group slug (e.g. sprints)")
    args = parser.parse_args()

    # Determine environments to scrape
    if args.outdoor and not args.indoor:
        envs = {"outdoor"}
    elif args.indoor and not args.outdoor:
        envs = {"indoor"}
    else:
        envs = {"outdoor", "indoor"}

    conn = psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)
    conn.execute(DDL)
    conn.commit()

    disciplines = get_discipline_list()

    # Apply filters
    if args.gender:
        disciplines = [d for d in disciplines if d["gender"] == args.gender]
    if args.group:
        disciplines = [d for d in disciplines if d["group_slug"] == args.group.lower()]
    disciplines = [d for d in disciplines if d["environment"] in envs]

    print(f"Scraping {len(disciplines)} event/gender/environment combinations")
    print(f"Environments: {envs} | Gender filter: {args.gender or 'both'}\n")

    total_athletes = 0
    total_new = 0
    skip_count = 0

    for i, disc in enumerate(disciplines, 1):
        label = f"{disc['event_name']} ({disc['gender']}, {disc['environment']})"
        print(f"  {i:3}/{len(disciplines)} {label:<55}", end="", flush=True)
        a, n = scrape_event(conn, disc)
        if a == 0:
            print(f"  SKIP (no data)")
            skip_count += 1
        else:
            print(f"  {a:3} athletes  {n:3} new")
            total_athletes += a
            total_new += n
        if i < len(disciplines):
            time.sleep(SLEEP_REQ)

    # Final DB counts
    db_athletes = conn.execute("SELECT COUNT(*) AS n FROM wa_athletes").fetchone()["n"]
    db_perfs    = conn.execute("SELECT COUNT(*) AS n FROM wa_performances").fetchone()["n"]
    # Gender breakdown
    gd = conn.execute(
        "SELECT gender, COUNT(*) n FROM wa_athletes GROUP BY gender ORDER BY gender"
    ).fetchall()
    conn.close()

    print(f"\n{'='*60}")
    print(f"WORLD ATHLETICS DONE")
    gd_str = ", ".join(f"{r['gender']}={r['n']}" for r in gd)
    print(f"  DB athletes: {db_athletes} ({gd_str})")
    print(f"  DB performances: {db_perfs}")
    print(f"  Skipped (no data): {skip_count}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
