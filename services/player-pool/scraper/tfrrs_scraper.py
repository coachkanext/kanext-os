"""
TFRRS Track & Field Leaderboard Scraper — 2025-26 Season
Source: www.tfrrs.org static HTML leaderboards

Division-specific outdoor lists (2026 season):
  5602 = NCAA D1 Outdoor Qualifying
  5622 = NCAA D1 East Outdoor Qualifying
  5623 = NCAA D1 West Outdoor Qualifying
  5603 = NCAA D2 Outdoor Qualifying
  5604 = NCAA D3 Outdoor Qualifying
  5605 = NAIA Outdoor Qualifying
  5606 = NJCAA Outdoor Performance
  5607 = NWAC Outdoor Qualifying
  5608 = NCCAA Outdoor Qualifying
  5609 = USCAA Outdoor Track & Field
  5612 = CA Community Colleges (All Schools)
  5613-5621 = CCCAA conference sub-lists

Indoor (2025-26):
  5351 = NAIA, 5352 = NCAA D1, 5353 = NCAA D2, 5354 = NCAA D3
  5355 = NJCAA, 5356 = NCCAA
  Probe scans 5320-5481 for any newer IDs; falls back to known IDs.

Relay events are skipped (individual-only).

Usage:
    python3 tfrrs_scraper.py                 # all (outdoor + indoor)
    python3 tfrrs_scraper.py outdoor         # outdoor only
    python3 tfrrs_scraper.py indoor          # indoor only
    python3 tfrrs_scraper.py list 5602       # single list by ID
"""
from __future__ import annotations

import re
import sys
import time
from datetime import datetime, date
from typing import Optional

import httpx
from bs4 import BeautifulSoup
import psycopg
from psycopg.rows import dict_row

DB_CONFIG      = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}
SEASON_CURRENT = "2025-26"
SEASON_PRIOR   = "2024-25"
DELAY          = 0.6   # seconds between TFRRS requests (respectful)
HEADERS    = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}

# ── Skip relay/team events ────────────────────────────────────────────────────
RELAY_RE = re.compile(
    r"\b(relay|4\s*x\s*\d|sprint\s*med|distance\s*med|dmr|smr|\d\s*x\s*\d)\b",
    re.IGNORECASE,
)

# ── Known outdoor division-specific list IDs ─────────────────────────────────
OUTDOOR_LISTS = [
    {"id": 5602, "assoc": "ncaa",   "division": "d1", "label": "NCAA D1 Outdoor"},
    {"id": 5622, "assoc": "ncaa",   "division": "d1", "label": "NCAA D1 East Outdoor"},
    {"id": 5623, "assoc": "ncaa",   "division": "d1", "label": "NCAA D1 West Outdoor"},
    {"id": 5603, "assoc": "ncaa",   "division": "d2", "label": "NCAA D2 Outdoor"},
    {"id": 5604, "assoc": "ncaa",   "division": "d3", "label": "NCAA D3 Outdoor"},
    {"id": 5605, "assoc": "naia",   "division": None, "label": "NAIA Outdoor"},
    {"id": 5606, "assoc": "njcaa",  "division": None, "label": "NJCAA Outdoor"},
    {"id": 5774, "assoc": "njcaa",  "division": "d1", "label": "NJCAA DI Outdoor"},
    {"id": 5775, "assoc": "njcaa",  "division": "d3", "label": "NJCAA DIII Outdoor"},
    {"id": 5607, "assoc": "nwac",   "division": None, "label": "NWAC Outdoor"},
    {"id": 5608, "assoc": "nccaa",  "division": None, "label": "NCCAA Outdoor"},
    {"id": 5609, "assoc": "uscaa",  "division": None, "label": "USCAA Outdoor"},
    # CCCAA: All-schools list + 9 conference sub-lists
    # The all-schools list (5612) is a superset; conference lists are subsets.
    # We load all-schools first, then conference lists catch any athletes missed.
    {"id": 5612, "assoc": "cccaa",  "division": None, "label": "CCCAA All Schools Outdoor"},
    {"id": 5613, "assoc": "cccaa",  "division": None, "label": "CCCAA Coast Conference"},
    {"id": 5614, "assoc": "cccaa",  "division": None, "label": "CCCAA Foothill Conference"},
    {"id": 5615, "assoc": "cccaa",  "division": None, "label": "CCCAA Golden Valley Conference"},
    {"id": 5616, "assoc": "cccaa",  "division": None, "label": "CCCAA NorCal"},
    {"id": 5617, "assoc": "cccaa",  "division": None, "label": "CCCAA Orange Empire Conference"},
    {"id": 5618, "assoc": "cccaa",  "division": None, "label": "CCCAA Pacific Coast Conference"},
    {"id": 5619, "assoc": "cccaa",  "division": None, "label": "CCCAA SoCal"},
    {"id": 5620, "assoc": "cccaa",  "division": None, "label": "CCCAA South Coast Conference"},
    {"id": 5621, "assoc": "cccaa",  "division": None, "label": "CCCAA Western State Conference"},
    # ── Prior season (2025 outdoor = 2024-25 academic year) ──────────────────
    {"id": 5018, "assoc": "ncaa",  "division": "d1", "label": "NCAA D1 Outdoor 2025", "season": SEASON_PRIOR},
    {"id": 5052, "assoc": "ncaa",  "division": "d1", "label": "NCAA D1 East Outdoor 2025", "season": SEASON_PRIOR},
    {"id": 5053, "assoc": "ncaa",  "division": "d1", "label": "NCAA D1 West Outdoor 2025", "season": SEASON_PRIOR},
    {"id": 5019, "assoc": "ncaa",  "division": "d2", "label": "NCAA D2 Outdoor 2025", "season": SEASON_PRIOR},
    {"id": 5020, "assoc": "ncaa",  "division": "d3", "label": "NCAA D3 Outdoor 2025", "season": SEASON_PRIOR},
    {"id": 5021, "assoc": "naia",  "division": None, "label": "NAIA Outdoor 2025", "season": SEASON_PRIOR},
    {"id": 5029, "assoc": "njcaa", "division": "d1", "label": "NJCAA DI Outdoor 2025", "season": SEASON_PRIOR},
    {"id": 5030, "assoc": "njcaa", "division": "d3", "label": "NJCAA DIII Outdoor 2025", "season": SEASON_PRIOR},
    {"id": 5031, "assoc": "nccaa", "division": None, "label": "NCCAA Outdoor 2025", "season": SEASON_PRIOR},
    {"id": 5032, "assoc": "nwac",  "division": None, "label": "NWAC Outdoor 2025", "season": SEASON_PRIOR},
    {"id": 5033, "assoc": "uscaa", "division": None, "label": "USCAA Outdoor 2025", "season": SEASON_PRIOR},
]

# ── Prior-season indoor (2024-25) ─────────────────────────────────────────────
INDOOR_PRIOR_2025 = [
    {"id": 4867, "assoc": "ncaa",  "division": "d1", "label": "NCAA D1 Indoor 2024-25", "season": SEASON_PRIOR},
    {"id": 4868, "assoc": "ncaa",  "division": "d2", "label": "NCAA D2 Indoor 2024-25", "season": SEASON_PRIOR},
    {"id": 4869, "assoc": "ncaa",  "division": "d3", "label": "NCAA D3 Indoor 2024-25", "season": SEASON_PRIOR},
    {"id": 4870, "assoc": "naia",  "division": None, "label": "NAIA Indoor 2024-25", "season": SEASON_PRIOR},
    {"id": 4871, "assoc": "njcaa", "division": None, "label": "NJCAA Indoor 2024-25", "season": SEASON_PRIOR},
    {"id": 4872, "assoc": "nccaa", "division": None, "label": "NCCAA Indoor 2024-25", "season": SEASON_PRIOR},
]

# ── Indoor: known 2025-26 list IDs (probe fills in future seasons) ────────────
INDOOR_KNOWN_2026 = [
    {"id": 5351, "assoc": "naia",   "division": None, "label": "NAIA Indoor 2025-26"},
    {"id": 5352, "assoc": "ncaa",   "division": "d1", "label": "NCAA D1 Indoor 2025-26"},
    {"id": 5353, "assoc": "ncaa",   "division": "d2", "label": "NCAA D2 Indoor 2025-26"},
    {"id": 5354, "assoc": "ncaa",   "division": "d3", "label": "NCAA D3 Indoor 2025-26"},
    {"id": 5355, "assoc": "njcaa",  "division": None, "label": "NJCAA Indoor 2025-26"},
    {"id": 5356, "assoc": "nccaa",  "division": None, "label": "NCCAA Indoor 2025-26"},
]
INDOOR_FALLBACK = [
    {"id": 5481, "assoc": None, "division": None, "label": "All-College Indoor"},
]


# ── Helpers ──────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)


def fetch_html(url: str) -> Optional[str]:
    try:
        r = httpx.get(url, headers=HEADERS, timeout=20, follow_redirects=True)
        time.sleep(DELAY)
        if r.status_code == 200:
            return r.text
    except Exception as e:
        print(f"    [warn] {url}: {e}")
    return None


def parse_date(s: str) -> Optional[date]:
    """'Mar 27, 2026' → date"""
    if not s:
        return None
    for fmt in ("%b %d, %Y", "%B %d, %Y"):
        try:
            return datetime.strptime(s.strip(), fmt).date()
        except ValueError:
            pass
    return None


def probe_indoor_division_lists() -> list[dict]:
    """
    Scan ID range near 5481 to find D1/D2/D3 indoor qualifying lists.
    Returns list configs if found, else returns INDOOR_FALLBACK.
    """
    print("  Probing for indoor division-specific lists ...", flush=True)
    found: dict[str, dict] = {}   # 'd1'/'d2'/'d3'/'naia'/'njcaa' → list config

    # Check a range of IDs that might contain indoor qualifying lists
    for lid in range(5320, 5482):
        url = f"https://www.tfrrs.org/lists/{lid}"
        try:
            r = httpx.get(url, headers=HEADERS, timeout=8, follow_redirects=True)
            time.sleep(0.25)
            if r.status_code != 200:
                continue
            title_m = re.search(r'<title>(.*?)</title>', r.text, re.I | re.S)
            title = title_m.group(1).lower() if title_m else ""
            if "indoor" not in title:
                continue
            if "2026" not in title and "2025" not in title:
                continue
            # Identify division
            # Check longest suffix first to avoid "division ii" matching "division iii"
            if "division iii" in title or "div. iii" in title:
                if "d3" not in found:
                    found["d3"] = {"id": lid, "assoc": "ncaa", "division": "d3", "label": f"NCAA D3 Indoor ({lid})"}
                    print(f"    Found D3 indoor: {lid} — {title[:60]}")
            elif "division ii" in title or "div. ii" in title or " d2 " in title:
                if "d2" not in found:
                    found["d2"] = {"id": lid, "assoc": "ncaa", "division": "d2", "label": f"NCAA D2 Indoor ({lid})"}
                    print(f"    Found D2 indoor: {lid} — {title[:60]}")
            elif "division i " in title or "div. i " in title or " d1 " in title:
                if "d1" not in found:
                    found["d1"] = {"id": lid, "assoc": "ncaa", "division": "d1", "label": f"NCAA D1 Indoor ({lid})"}
                    print(f"    Found D1 indoor: {lid} — {title[:60]}")
            elif "naia" in title:
                if "naia" not in found:
                    found["naia"] = {"id": lid, "assoc": "naia", "division": None, "label": f"NAIA Indoor ({lid})"}
                    print(f"    Found NAIA indoor: {lid} — {title[:60]}")
            elif "njcaa" in title or "juco" in title:
                if "njcaa" not in found:
                    found["njcaa"] = {"id": lid, "assoc": "njcaa", "division": None, "label": f"NJCAA Indoor ({lid})"}
                    print(f"    Found NJCAA indoor: {lid} — {title[:60]}")
            if len(found) == 5:
                break  # found all divisions
        except Exception:
            continue

    if len(found) == 5:
        print(f"  Found all 5 indoor division lists via probe")
        return list(found.values())
    elif found:
        # Merge probe results with known 2025-26 IDs as fallback
        known_divs = {c["division"] or c["assoc"] for c in INDOOR_KNOWN_2026}
        probe_divs = {(c["division"] or c["assoc"]): c for c in found.values()}
        result = []
        for cfg in INDOOR_KNOWN_2026:
            key = cfg["division"] or cfg["assoc"]
            result.append(probe_divs.get(key, cfg))
        print(f"  Using {len(result)} indoor lists (probe + known fallback)")
        return result
    else:
        print(f"  Probe found nothing — using known 2025-26 indoor list IDs")
        return INDOOR_KNOWN_2026


# ── HTML Parser ───────────────────────────────────────────────────────────────

def parse_list_page(html: str, list_id: int, assoc: Optional[str],
                    division: Optional[str], season_type: str) -> list[dict]:
    """
    Parse one TFRRS leaderboard HTML page.
    Returns list of result dicts, one per athlete-event row.
    """
    soup = BeautifulSoup(html, "html.parser")
    results = []

    for col12 in soup.find_all("div", class_="col-lg-12"):
        h3 = col12.find("h3")
        if not h3:
            continue
        h3_text = h3.get_text(strip=True)

        # e.g. "100 Meters (Men)" or "Pole Vault (Women)"
        m = re.match(r"^(.+?)\s*\((Men|Women)\)\s*$", h3_text)
        if not m:
            continue
        event_name = m.group(1).strip()
        gender = "m" if m.group(2) == "Men" else "f"

        # Skip relay events
        if RELAY_RE.search(event_name):
            continue

        perf_body = col12.find("div", class_="performance-list-body")
        if not perf_body:
            continue

        rows = perf_body.find_all("div", class_="performance-list-row")
        for row in rows:
            # ── Rank ──
            place_div = row.find("div", class_="col-place")
            rank = None
            if place_div:
                try:
                    rank = int(place_div.get_text(strip=True))
                except ValueError:
                    pass

            # ── Athlete name + TFRRS ID ──
            athlete_div = row.find("div", class_="col-athlete")
            if not athlete_div:
                continue
            athlete_a = athlete_div.find("a")
            if not athlete_a:
                continue
            athlete_name = athlete_a.get_text(strip=True)
            athlete_href = athlete_a.get("href", "")
            tfrrs_id = None
            href_parts = athlete_href.split("/")
            try:
                ath_idx = href_parts.index("athletes")
                tfrrs_id = href_parts[ath_idx + 1]
            except (ValueError, IndexError):
                pass
            if not tfrrs_id:
                continue

            # ── col-narrow divs (by position): Year, Mark, Date, Wind ──
            narrow_divs = row.find_all("div", class_="col-narrow")
            class_year = narrow_divs[0].get_text(strip=True) if len(narrow_divs) > 0 else None
            mark       = narrow_divs[1].get_text(strip=True) if len(narrow_divs) > 1 else None
            date_text  = narrow_divs[2].get_text(strip=True) if len(narrow_divs) > 2 else None
            wind_text  = narrow_divs[3].get_text(strip=True) if len(narrow_divs) > 3 else None

            if not mark:
                continue

            # ── Team name + URL ──
            team_div = row.find("div", class_="col-team")
            team_name = None
            team_href = None
            if team_div:
                team_a = team_div.find("a")
                if team_a:
                    team_name = team_a.get_text(strip=True)
                    team_href = team_a.get("href", "")

            # ── Meet name + TFRRS meet ID ──
            meet_div = row.find("div", class_="col-meet")
            meet_name = None
            tfrrs_meet_id = None
            if meet_div:
                meet_a = meet_div.find("a")
                if meet_a:
                    meet_name = meet_a.get_text(strip=True)
                    meet_href = meet_a.get("href", "")
                    meet_parts = meet_href.split("/")
                    try:
                        r_idx = meet_parts.index("results")
                        tfrrs_meet_id = meet_parts[r_idx + 1]
                    except (ValueError, IndexError):
                        pass

            # Clean up wind: empty string → None
            wind = wind_text if wind_text else None

            results.append({
                "gender":         gender,
                "event":          event_name,
                "rank":           rank,
                "tfrrs_id":       tfrrs_id,
                "athlete_name":   athlete_name,
                "class_year":     class_year,
                "team_name":      team_name,
                "team_href":      team_href,
                "mark":           mark,
                "wind":           wind,
                "meet_name":      meet_name,
                "tfrrs_meet_id":  tfrrs_meet_id,
                "meet_date":      parse_date(date_text),
                "season_type":    season_type,
                "list_id":        list_id,
                "assoc":          assoc,
                "division":       division,
            })

    return results


# ── DB Writer ─────────────────────────────────────────────────────────────────

def parse_team_url_parts(team_href: str) -> tuple[Optional[str], str]:
    """
    Parse TFRRS team URL: /teams/tf/PA_college_m_Penn_State.html
    Returns (state_abbr, url_assoc) where url_assoc in ('college','jcollege',...)
    """
    if not team_href:
        return None, "unknown"
    filename = team_href.split("/")[-1].replace(".html", "")
    parts = filename.split("_")
    state = parts[0].upper() if parts and len(parts[0]) == 2 else None
    url_assoc = parts[1].lower() if len(parts) > 1 else "unknown"
    return state, url_assoc


def url_assoc_to_db_assoc(url_assoc: str, list_assoc: Optional[str]) -> str:
    """Determine DB assoc value. List-level assoc takes priority."""
    if list_assoc:
        return list_assoc
    if url_assoc == "jcollege":
        return "njcaa"
    if url_assoc == "college":
        return "ncaa"
    return url_assoc


def write_results(conn, results: list[dict], season: str = SEASON_CURRENT) -> dict:
    """Upsert teams, athletes, and results from one parsed list. Returns counts."""
    if not results:
        return {"teams": 0, "athletes_m": 0, "athletes_f": 0, "results_m": 0, "results_f": 0}

    # ── Teams ──
    teams_by_href: dict[str, dict] = {}
    for r in results:
        if r["team_href"] and r["team_href"] not in teams_by_href:
            state, url_assoc = parse_team_url_parts(r["team_href"])
            db_assoc = url_assoc_to_db_assoc(url_assoc, r["assoc"])
            teams_by_href[r["team_href"]] = {
                "name":      r["team_name"] or "",
                "href":      r["team_href"],
                "state":     state,
                "assoc":     db_assoc,
                "division":  r["division"],
                "gender":    r["gender"],
            }

    team_uuid: dict[str, str] = {}
    with conn.transaction():
        cur = conn.cursor()
        for href, t in teams_by_href.items():
            cur.execute("""
                INSERT INTO tf_teams (name, tfrrs_url, state_abbr, assoc, division, gender)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (tfrrs_url) DO UPDATE SET
                    name=EXCLUDED.name,
                    assoc=COALESCE(EXCLUDED.assoc, tf_teams.assoc),
                    division=COALESCE(EXCLUDED.division, tf_teams.division)
                RETURNING id
            """, (t["name"], href, t["state"], t["assoc"], t["division"], t["gender"]))
            row = cur.fetchone()
            team_uuid[href] = str(row["id"])

    # ── Athletes (split by gender) ──
    athletes_m: dict[str, dict] = {}
    athletes_f: dict[str, dict] = {}
    for r in results:
        aid = r["tfrrs_id"]
        if not aid:
            continue
        entry = {"tfrrs_id": aid, "full_name": r["athlete_name"],
                 "team_href": r["team_href"], "class_year": r["class_year"]}
        if r["gender"] == "m":
            athletes_m[aid] = entry
        else:
            athletes_f[aid] = entry

    athlete_uuid_m: dict[str, str] = {}
    athlete_uuid_f: dict[str, str] = {}

    for table, athletes_dict, out_map in [
        ("mtf_athletes", athletes_m, athlete_uuid_m),
        ("wtf_athletes", athletes_f, athlete_uuid_f),
    ]:
        with conn.transaction():
            cur = conn.cursor()
            for aid, info in athletes_dict.items():
                tid = team_uuid.get(info["team_href"]) if info["team_href"] else None
                cur.execute(f"""
                    INSERT INTO {table} (tfrrs_id, full_name, team_id, class_year)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (tfrrs_id) DO UPDATE SET
                        full_name=EXCLUDED.full_name,
                        team_id=COALESCE(EXCLUDED.team_id, {table}.team_id),
                        class_year=COALESCE(EXCLUDED.class_year, {table}.class_year),
                        updated_at=now()
                    RETURNING id
                """, (aid, info["full_name"], tid, info["class_year"]))
                row = cur.fetchone()
                out_map[aid] = str(row["id"])

    # ── Results ──
    ins_m = upd_m = ins_f = upd_f = skipped = 0
    with conn.transaction():
        cur = conn.cursor()
        for r in results:
            aid = r["tfrrs_id"]
            if not aid:
                skipped += 1
                continue
            if r["gender"] == "m":
                pid = athlete_uuid_m.get(aid)
                res_table = "mtf_results"
            else:
                pid = athlete_uuid_f.get(aid)
                res_table = "wtf_results"
            if not pid:
                skipped += 1
                continue

            cur.execute(f"""
                INSERT INTO {res_table}
                    (athlete_id, event, season_type, season,
                     rank, mark, wind, meet_name, tfrrs_meet_id, meet_date, list_id)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (athlete_id, event, season_type, season) DO UPDATE SET
                    rank=EXCLUDED.rank,
                    mark=EXCLUDED.mark,
                    wind=EXCLUDED.wind,
                    meet_name=EXCLUDED.meet_name,
                    meet_date=EXCLUDED.meet_date,
                    list_id=EXCLUDED.list_id
                RETURNING id, (xmax = 0) AS is_insert
            """, (
                pid, r["event"], r["season_type"], season,
                r["rank"], r["mark"], r["wind"],
                r["meet_name"], r["tfrrs_meet_id"], r["meet_date"],
                r["list_id"],
            ))
            row2 = cur.fetchone()
            if r["gender"] == "m":
                if row2["is_insert"]: ins_m += 1
                else: upd_m += 1
            else:
                if row2["is_insert"]: ins_f += 1
                else: upd_f += 1

    return {
        "teams":      len(team_uuid),
        "athletes_m": len(athlete_uuid_m),
        "athletes_f": len(athlete_uuid_f),
        "results_m":  ins_m + upd_m,
        "results_f":  ins_f + upd_f,
        "skipped":    skipped,
    }


# ── Main ──────────────────────────────────────────────────────────────────────

def run_list(conn, list_cfg: dict, season_type: str) -> dict:
    lid = list_cfg["id"]
    label = list_cfg.get("label", str(lid))
    season = list_cfg.get("season", SEASON_CURRENT)
    print(f"\n  [{label}] list_id={lid} ...", flush=True)
    html = fetch_html(f"https://www.tfrrs.org/lists/{lid}")
    if not html:
        print(f"  [error] Could not fetch list {lid}")
        return {}

    results = parse_list_page(
        html, lid,
        assoc=list_cfg.get("assoc"),
        division=list_cfg.get("division"),
        season_type=season_type,
    )
    events = len(set(r["event"] for r in results))
    men   = sum(1 for r in results if r["gender"] == "m")
    women = sum(1 for r in results if r["gender"] == "f")
    print(f"  Parsed {len(results)} rows across {events} events ({men}M / {women}F)", flush=True)

    counts = write_results(conn, results, season)
    print(f"  → {counts['athletes_m']}M athletes, {counts['athletes_f']}F athletes, "
          f"{counts['results_m']}M results, {counts['results_f']}F results", flush=True)
    return counts


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"

    if mode == "list" and len(sys.argv) > 2:
        # Single list by ID
        # Usage: python3 tfrrs_scraper.py list 5354 indoor [season]
        # e.g.:  python3 tfrrs_scraper.py list 5018 outdoor 2024-25
        lid = int(sys.argv[2])
        stype  = sys.argv[3] if len(sys.argv) > 3 else "outdoor"
        season = sys.argv[4] if len(sys.argv) > 4 else SEASON_CURRENT
        conn = get_conn()
        try:
            cfg = {"id": lid, "assoc": None, "division": None,
                   "label": f"list/{lid}", "season": season}
            run_list(conn, cfg, stype)
        finally:
            conn.close()
        return

    conn = get_conn()
    try:
        total_teams = total_am = total_af = total_rm = total_rf = 0

        if mode in ("all", "outdoor"):
            print("\n=== OUTDOOR LISTS ===")
            for cfg in OUTDOOR_LISTS:
                counts = run_list(conn, cfg, "outdoor")
                total_teams += counts.get("teams", 0)
                total_am    += counts.get("athletes_m", 0)
                total_af    += counts.get("athletes_f", 0)
                total_rm    += counts.get("results_m", 0)
                total_rf    += counts.get("results_f", 0)

        if mode in ("all", "indoor"):
            print("\n=== INDOOR LISTS (2025-26) ===")
            indoor_lists = probe_indoor_division_lists()
            for cfg in indoor_lists:
                counts = run_list(conn, cfg, "indoor")
                total_teams += counts.get("teams", 0)
                total_am    += counts.get("athletes_m", 0)
                total_af    += counts.get("athletes_f", 0)
                total_rm    += counts.get("results_m", 0)
                total_rf    += counts.get("results_f", 0)

            print("\n=== INDOOR LISTS (2024-25) ===")
            for cfg in INDOOR_PRIOR_2025:
                counts = run_list(conn, cfg, "indoor")
                total_teams += counts.get("teams", 0)
                total_am    += counts.get("athletes_m", 0)
                total_af    += counts.get("athletes_f", 0)
                total_rm    += counts.get("results_m", 0)
                total_rf    += counts.get("results_f", 0)

        # Final summary from DB
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) AS n FROM tf_teams")
        db_teams = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) AS n FROM mtf_athletes")
        db_am = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) AS n FROM wtf_athletes")
        db_af = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) AS n FROM mtf_results")
        db_rm = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) AS n FROM wtf_results")
        db_rf = cur.fetchone()["n"]

        # Division breakdown
        cur.execute("""
            SELECT t.assoc, t.division, COUNT(DISTINCT a.id) AS n
            FROM mtf_athletes a
            JOIN tf_teams t ON t.id = a.team_id
            GROUP BY t.assoc, t.division
            ORDER BY t.assoc, t.division
        """)
        div_rows_m = cur.fetchall()
        cur.execute("""
            SELECT t.assoc, t.division, COUNT(DISTINCT a.id) AS n
            FROM wtf_athletes a
            JOIN tf_teams t ON t.id = a.team_id
            GROUP BY t.assoc, t.division
            ORDER BY t.assoc, t.division
        """)
        div_rows_f = cur.fetchall()

        print(f"\n{'='*60}")
        print(f"TFRRS DONE")
        print(f"  Teams:          {db_teams}")
        print(f"  Men athletes:   {db_am}   | Results: {db_rm}")
        print(f"  Women athletes: {db_af}   | Results: {db_rf}")
        print(f"\n  Men by division:")
        for row in div_rows_m:
            print(f"    {row['assoc']} / {row['division'] or 'n/a'}: {row['n']}")
        print(f"\n  Women by division:")
        for row in div_rows_f:
            print(f"    {row['assoc']} / {row['division'] or 'n/a'}: {row['n']}")
        print(f"{'='*60}")

    finally:
        conn.close()


if __name__ == "__main__":
    main()
