"""
KaNeXT College Football Player Pool Scraper — 2024 Season
=========================================================
Data sources:
  - ESPN API         : FBS/FCS teams, rosters, records
  - Sports Reference : Player stats (passing/rushing/receiving/defense/kicking)
  - NJCAA stats site : NJCAA D1/D3 football
  - CCCAA site       : California CC football

Run modes:
  python cfb_scraper.py seed        # Seed static data only (associations/levels)
  python cfb_scraper.py fbs_p4      # FBS Power 4 only
  python cfb_scraper.py fbs_g5      # FBS Group of 5
  python cfb_scraper.py fcs         # FCS
  python cfb_scraper.py stats       # Scrape Sports Reference player stats
  python cfb_scraper.py all         # Everything
  (default = fbs_p4)
"""
from __future__ import annotations

import sys
import time
import re
from typing import Optional

import psycopg
from psycopg.rows import dict_row

# ── Config ───────────────────────────────────────────────────────────────────

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "kanext_player_pool",
}
SEASON = "2024"           # College football season year
ESPN_DELAY = 0.8          # seconds between ESPN API calls
SREF_DELAY = 4.0          # seconds between Sports Reference calls

# ── ESPN group IDs (verified via API scan) ───────────────────────────────────

# FBS Power 4
P4_GROUPS = {
    "ACC":      1,
    "Big Ten":  5,
    "SEC":      8,
    "Big 12":   4,
}

# FBS Group of 5
# Sun Belt is split East(167)/West(168); CUSA = 12; UAC = 177 (FCS)
G5_GROUPS = {
    "American Athletic":   151,
    "Mountain West":        17,
    "Sun Belt East":       167,
    "Sun Belt West":       168,
    "Mid-American":         15,
    "Conference USA":       12,
    "FBS Independents":     18,
}

# G5 conference grouping for DB (map display name → real conference name + abbr)
G5_CONF_CANONICAL = {
    "Sun Belt East":  ("Sun Belt",           "SBC"),
    "Sun Belt West":  ("Sun Belt",           "SBC"),
    "American Athletic": ("American Athletic", "AAC"),
    "Mountain West":  ("Mountain West",       "MWC"),
    "Mid-American":   ("Mid-American",        "MAC"),
    "Conference USA": ("Conference USA",      "CUSA"),
    "FBS Independents": ("FBS Independents",  "IND"),
}

# FCS conferences (verified group IDs)
FCS_GROUPS = {
    "Big Sky":                  20,
    "Coastal Athletic":         48,   # CAA
    "Mid-Eastern Athletic":     24,   # MEAC
    "Missouri Valley":          21,
    "Northeast":                25,
    "Patriot":                  27,
    "Pioneer":                  28,
    "Southern":                 29,
    "Southland":                30,
    "SWAC East":                33,
    "SWAC West":                34,
    "Big South-OVC":           179,
    "United Athletic":         177,   # UAC — formed 2023, FCS
    "FCS Independents":         32,
}

# FCS conference canonical names + level keys
FCS_CONF_META = {
    "Big Sky":              ("Big Sky Conference",    "BSC",  "fcs_top"),
    "Coastal Athletic":     ("CAA Football",          "CAA",  "fcs_top"),
    "Missouri Valley":      ("Missouri Valley",       "MVFC", "fcs_top"),
    "Southern":             ("Southern Conference",   "SoCon","fcs_top"),
    "Big South-OVC":        ("Big South-OVC",         "BSOVC","fcs_mid"),
    "Southland":            ("Southland Conference",  "SLC",  "fcs_mid"),
    "Patriot":              ("Patriot League",        "PL",   "fcs_mid"),
    "Northeast":            ("Northeast Conference",  "NEC",  "fcs_mid"),
    "Pioneer":              ("Pioneer Football",      "PFL",  "fcs_mid"),
    "United Athletic":      ("United Athletic",       "UAC",  "fcs_mid"),
    "Mid-Eastern Athletic": ("MEAC",                  "MEAC", "fcs_low"),
    "SWAC East":            ("SWAC",                  "SWAC", "fcs_low"),
    "SWAC West":            ("SWAC",                  "SWAC", "fcs_low"),
    "FCS Independents":     ("FCS Independents",      "FCSI", "fcs_low"),
}


def fcs_level_key(conf_key: str) -> str:
    meta = FCS_CONF_META.get(conf_key)
    return meta[2] if meta else "fcs_low"


# NCAA Division II conferences (ESPN group IDs — verified via API scan)
# PSAC has ESPN sub-groups East=156/West=157; canonical name "PSAC"
D2_GROUPS = {
    "CIAA":                 104,
    "GLIAC":                107,
    "Great Lakes":          108,   # GLIAC-adjacent D2 group
    "Gulf South":           110,
    "D2 Independents":      112,
    "Lone Star":            116,
    "MIAA":                 118,
    "NE10":                 127,
    "NSIC":                 129,
    "PSAC East":            156,   # Penn State Athletic Conf — East div
    "PSAC West":            157,   # Penn State Athletic Conf — West div
    "RMAC":                 135,
    "SIAC":                 136,
    "South Atlantic":       139,   # SAC
    "Great American":       146,   # GAC
    "Great Midwest":        165,   # GMAC
    "Mountain East":        144,
}

D2_CONF_ABBR = {
    "CIAA": "CIAA", "GLIAC": "GLIAC", "Great Lakes": "GL",
    "Gulf South": "GSC", "D2 Independents": "IND", "Lone Star": "LSC",
    "MIAA": "MIAA", "NE10": "NE10", "NSIC": "NSIC",
    "PSAC East": "PSAC", "PSAC West": "PSAC",
    "RMAC": "RMAC", "SIAC": "SIAC", "South Atlantic": "SAC",
    "Great American": "GAC", "Great Midwest": "GMAC", "Mountain East": "MEC",
}

# Canonical name mapping for split D2 conferences (like Sun Belt in FBS)
D2_CONF_CANONICAL = {
    "PSAC East": ("PSAC", "PSAC"),
    "PSAC West": ("PSAC", "PSAC"),
}

# NCAA Division III conferences (ESPN group IDs — verified via API scan)
D3_GROUPS = {
    "American Southwest": 100,  # ASC
    "AMCC":             102,
    "Centennial":       103,
    "ECFC":             105,    # Eastern Collegiate Football Conf (D3)
    "CCIW":             106,
    "ECAC":             113,    # generic
    "Empire 8":         114,
    "Heartland Collegiate": 115,
    "Liberty League":   117,
    "MAC Freedom":      119,
    "MIAC":             120,
    "MAC Commonwealth": 121,
    "NCC":              122,
    "NESCAC":           123,
    "New Jersey AC":    124,
    "NJAC":             126,
    "North Coast AC":   128,
    "MSCAC":            160,    # Massachusetts State Collegiate AC (D3)
    "OAC":              130,
    "PAC":              131,
    "Presidents' AC":   132,
    "Skyline":          134,
    "Southern Collegiate": 143,
    "UAA":              145,
    "USA South":        147,
    "Wisconsin IAC":    148,
    "Northwoods":       182,    # D3 Northwoods (MIAC region)
    "D3 Independents":  133,
}

D3_CONF_ABBR = {k: k[:8] for k in D3_GROUPS}

# NAIA conferences — ESPN only has a small subset of NAIA schools
# Group 111 = HAAC verified; group 186 = NAIA (1 independent)
# Most NAIA football programs are NOT on ESPN; bulk load via NAIA site scraper (future)
NAIA_GROUPS = {
    "Heart of America AC":  111,   # HAAC — 7 teams verified
    "NAIA Independents":    186,   # 1 team (Defiance)
}

NAIA_CONF_ABBR = {
    "Heart of America AC": "HAAC",
    "NAIA Independents": "IND",
}


# ── Static data ───────────────────────────────────────────────────────────────

ASSOCIATIONS = ["NCAA", "NAIA", "NJCAA", "CCCAA"]

DIVISIONS = {
    "NCAA":  ["FBS", "FCS", "Division II", "Division III"],
    "NAIA":  ["NAIA"],
    "NJCAA": ["NJCAA D1", "NJCAA D3"],   # NOTE: no NJCAA D2 in football
    "CCCAA": ["CCCAA"],
}

# (division_name, level_key, lambda, display_name, tier)
COMPETITIVE_LEVELS = [
    ("FBS",          "fbs_p4",   1.6500, "FBS Power 4",       15),
    ("FBS",          "fbs_g5",   1.3000, "FBS Group of 5",    13),
    ("FCS",          "fcs_top",  1.1000, "FCS Top",           11),
    ("FCS",          "fcs_mid",  0.9500, "FCS Mid",            9),
    ("FCS",          "fcs_low",  0.8000, "FCS Low",            7),
    ("Division II",  "ncaa_d2",  0.7000, "NCAA D2",            6),
    ("Division III", "ncaa_d3",  0.5500, "NCAA D3",            5),
    ("NAIA",         "naia",     0.6500, "NAIA",               5),
    ("NJCAA D1",     "njcaa_d1", 0.5000, "NJCAA D1",           4),
    ("NJCAA D3",     "njcaa_d3", 0.4000, "NJCAA D3",           3),
    ("CCCAA",        "cccaa",    0.4000, "CCCAA",              3),
]


# ── DB helpers ────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg.connect(
        host=DB_CONFIG["host"],
        port=DB_CONFIG["port"],
        dbname=DB_CONFIG["dbname"],
        row_factory=dict_row,
        autocommit=False,
    )


def safe_int(val) -> Optional[int]:
    try:
        return int(float(val)) if val not in (None, "", "–", "-") else None
    except (ValueError, TypeError):
        return None


def safe_float(val) -> Optional[float]:
    try:
        return float(val) if val not in (None, "", "–", "-") else None
    except (ValueError, TypeError):
        return None


def height_to_inches(h) -> Optional[int]:
    """Convert '6-2', '6\'2"', or 74 (already inches) → int inches."""
    if h is None:
        return None
    if isinstance(h, (int, float)):
        v = int(h)
        return v if v > 0 else None
    m = re.search(r"(\d+)['\-](\d+)", str(h))
    if m:
        return int(m.group(1)) * 12 + int(m.group(2))
    return None


# ── ESPN API ──────────────────────────────────────────────────────────────────

def espn_get(url: str) -> Optional[dict]:
    """Fetch ESPN API JSON with rate limiting."""
    try:
        import httpx
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            )
        }
        r = httpx.get(url, headers=headers, timeout=30, follow_redirects=True)
        time.sleep(ESPN_DELAY)
        if r.status_code == 200:
            return r.json()
        print(f"    ESPN {r.status_code}: {url}")
        return None
    except Exception as e:
        print(f"    ESPN error ({e}): {url}")
        return None


ESPN_SITE = "https://site.api.espn.com/apis/site/v2/sports/football/college-football"
ESPN_V2   = "https://site.api.espn.com/apis/v2/sports/football/college-football"


def espn_standings(group_id: int) -> dict:
    """
    Fetch standings for a conference group.
    Returns the full response dict including conf name and team entries.
    Uses /apis/v2 standings endpoint (verified working).
    """
    data = espn_get(f"{ESPN_V2}/standings?season={SEASON}&group={group_id}")
    return data or {}


def espn_team_roster(espn_tid: int) -> tuple[list[dict], Optional[str]]:
    """
    Return (flat list of athlete dicts, coach_name) from ESPN roster endpoint.
    Uses year=2024 parameter (season= param returns empty for past seasons).
    """
    data = espn_get(f"{ESPN_SITE}/teams/{espn_tid}/roster?year={SEASON}")
    if not data:
        return [], None

    # Extract coach
    coach = None
    coaches = data.get("coach", [])
    if coaches and isinstance(coaches, list) and len(coaches) > 0:
        c = coaches[0]
        fn = c.get("firstName", "")
        ln = c.get("lastName", "")
        coach = f"{fn} {ln}".strip() or None

    athletes = data.get("athletes", [])
    flat = []
    for group in athletes:
        if isinstance(group, dict) and "items" in group:
            flat.extend(group["items"])
        elif isinstance(group, dict) and "id" in group:
            flat.append(group)
    return flat, coach


# ── Sports Reference ──────────────────────────────────────────────────────────

def sref_fetch(url: str) -> Optional[str]:
    """Fetch Sports Reference page using curl_cffi (Cloudflare bypass)."""
    try:
        from curl_cffi import requests as cffi
        r = cffi.get(url, impersonate="chrome120", timeout=40)
        time.sleep(SREF_DELAY)
        if r.status_code == 200:
            return r.text
        print(f"    cfb-ref {r.status_code}: {url}")
    except ImportError:
        pass
    except Exception as e:
        print(f"    cfb-ref error: {e}")
    # httpx fallback
    try:
        import httpx
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            )
        }
        r = httpx.get(url, headers=headers, timeout=40, follow_redirects=True)
        time.sleep(SREF_DELAY)
        if r.status_code == 200:
            return r.text
        print(f"    httpx {r.status_code}: {url}")
    except Exception as e:
        print(f"    httpx error: {e}")
    return None


def sref_parse_table(html: str, table_id: str) -> list[dict]:
    """Parse a Sports Reference stat table into list of row dicts."""
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, "lxml")
    # SR wraps some tables in comments
    table = soup.find("table", {"id": table_id})
    if not table:
        import re as _re
        m = _re.search(r'<!--(.*?<table[^>]*id="' + table_id + r'".*?)-->', html, _re.DOTALL)
        if m:
            soup2 = BeautifulSoup(m.group(1), "lxml")
            table = soup2.find("table", {"id": table_id})
    if not table:
        return []
    headers = [th.get("data-stat", "") for th in table.find("thead").find_all("th")]
    rows = []
    for tr in table.find("tbody").find_all("tr"):
        if "thead" in tr.get("class", []):
            continue
        cells = tr.find_all(["td", "th"])
        if not cells:
            continue
        row = {h: c.get_text(strip=True) for h, c in zip(headers, cells)}
        if row.get("player") or row.get("name_display"):
            rows.append(row)
    return rows


# ── Step 0: Seed static data ──────────────────────────────────────────────────

def seed_static_data(conn):
    print("\n[0] Seeding static data...")

    # Associations
    assoc_ids: dict[str, str] = {}
    for name in ASSOCIATIONS:
        row = conn.execute(
            "INSERT INTO fb_associations (name) VALUES (%s) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id",
            (name,),
        ).fetchone()
        assoc_ids[name] = str(row["id"])

    # Divisions
    div_ids: dict[str, str] = {}
    for assoc_name, div_names in DIVISIONS.items():
        for div_name in div_names:
            row = conn.execute(
                """
                INSERT INTO fb_divisions (association_id, name)
                VALUES (%s, %s)
                ON CONFLICT (association_id, name) DO UPDATE SET name=EXCLUDED.name
                RETURNING id
                """,
                (assoc_ids[assoc_name], div_name),
            ).fetchone()
            div_ids[div_name] = str(row["id"])

    # Competitive levels
    level_ids: dict[str, str] = {}
    for div_name, level_key, lam, display, tier in COMPETITIVE_LEVELS:
        row = conn.execute(
            """
            INSERT INTO fb_competitive_levels (division_id, level_key, lambda, display_name, level_tier)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (level_key) DO UPDATE SET
                lambda       = EXCLUDED.lambda,
                display_name = EXCLUDED.display_name,
                level_tier   = EXCLUDED.level_tier
            RETURNING id
            """,
            (div_ids[div_name], level_key, lam, display, tier),
        ).fetchone()
        level_ids[level_key] = str(row["id"])

    conn.commit()
    print(f"  ✓ {len(ASSOCIATIONS)} associations, {sum(len(v) for v in DIVISIONS.values())} divisions, {len(COMPETITIVE_LEVELS)} competitive levels")
    return level_ids


# ── Step 1: Load FBS conferences + teams ─────────────────────────────────────

def upsert_conference(conn, name: str, abbr: Optional[str], level_id: str, espn_group_id: int) -> str:
    """
    Upsert conference by (level_id, name).
    Handles split conferences (Sun Belt East/West, SWAC East/West) that share
    a canonical name but have different ESPN group IDs — only the first espn_group_id
    is stored; subsequent calls with the same name just return the existing row.
    """
    existing = conn.execute(
        "SELECT id FROM fb_conferences WHERE level_id=%s AND name=%s",
        (level_id, name),
    ).fetchone()
    if existing:
        return str(existing["id"])
    row = conn.execute(
        """
        INSERT INTO fb_conferences (level_id, name, abbreviation, espn_group_id)
        VALUES (%s, %s, %s, %s)
        RETURNING id
        """,
        (level_id, name, abbr, espn_group_id),
    ).fetchone()
    return str(row["id"])


def upsert_team(conn, espn_team_id: int, name: str, mascot: Optional[str],
                city: Optional[str], state: Optional[str], conf_id: str) -> str:
    row = conn.execute(
        """
        INSERT INTO fb_teams (espn_team_id, name, mascot, city, state, conference_id)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (espn_team_id) DO UPDATE SET
            name          = EXCLUDED.name,
            mascot        = EXCLUDED.mascot,
            city          = EXCLUDED.city,
            state         = EXCLUDED.state,
            conference_id = EXCLUDED.conference_id
        RETURNING id
        """,
        (espn_team_id, name, mascot, city, state, conf_id),
    ).fetchone()
    return str(row["id"])


def upsert_team_season(conn, team_id: str, coach: Optional[str],
                       wins: Optional[int], losses: Optional[int],
                       conf_wins: Optional[int], conf_losses: Optional[int]) -> str:
    row = conn.execute(
        """
        INSERT INTO fb_team_seasons (team_id, season, head_coach, wins, losses, conf_wins, conf_losses)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (team_id, season) DO UPDATE SET
            head_coach  = COALESCE(EXCLUDED.head_coach, fb_team_seasons.head_coach),
            wins        = COALESCE(EXCLUDED.wins, fb_team_seasons.wins),
            losses      = COALESCE(EXCLUDED.losses, fb_team_seasons.losses),
            conf_wins   = COALESCE(EXCLUDED.conf_wins, fb_team_seasons.conf_wins),
            conf_losses = COALESCE(EXCLUDED.conf_losses, fb_team_seasons.conf_losses)
        RETURNING id
        """,
        (team_id, SEASON, coach, wins, losses, conf_wins, conf_losses),
    ).fetchone()
    return str(row["id"])


def parse_record_str(s: str) -> tuple[Optional[int], Optional[int]]:
    """Parse '13-3' or '7-1' into (wins, losses)."""
    if not s:
        return None, None
    m = re.match(r"(\d+)-(\d+)", s)
    if m:
        return int(m.group(1)), int(m.group(2))
    return None, None


def load_conf_group(conn, conf_key: str, espn_group_id: int,
                    level_id: str, canonical_name: str, abbr: Optional[str]) -> tuple[str, int]:
    """
    Load one conference group via standings endpoint.
    Returns (conf_id, team_count).
    Handles Sun Belt East/West by re-using the same conference row.
    """
    conf_id = upsert_conference(conn, canonical_name, abbr, level_id, espn_group_id)

    data = espn_standings(espn_group_id)
    if not data:
        return conf_id, 0

    entries = data.get("standings", {}).get("entries", [])
    count = 0

    for entry in entries:
        t = entry.get("team", {})
        espn_tid = safe_int(t.get("id"))
        if not espn_tid:
            continue

        # ESPN `location` for college teams = school name (e.g. "Texas")
        name   = t.get("displayName", t.get("location", "Unknown"))
        mascot = t.get("name")          # e.g. "Longhorns"
        school = t.get("location")       # e.g. "Texas" (used as city proxy)

        team_id = upsert_team(conn, espn_tid, name, mascot, school, None, conf_id)

        # Parse overall and conf records from stats list
        wins = losses = conf_wins = conf_losses = None
        stats = entry.get("stats", [])
        # Stats repeat per record type; look for displayValue patterns
        overall_seen = False
        conf_seen = False
        for s in stats:
            sname = s.get("name", "")
            dv    = s.get("displayValue", "")
            if sname == "overall" and not overall_seen:
                wins, losses = parse_record_str(dv)
                overall_seen = True
            elif sname in ("vs. Conf.", "conference") and not conf_seen:
                conf_wins, conf_losses = parse_record_str(dv)
                conf_seen = True

        upsert_team_season(conn, team_id, None, wins, losses, conf_wins, conf_losses)
        count += 1

    conn.commit()
    return conf_id, count


# ── Step 2: Load rosters ──────────────────────────────────────────────────────

EXP_MAP = {"FR": "FR", "SO": "SO", "JR": "JR", "SR": "SR", "GR": "GR", "": None}


def upsert_player(conn, espn_aid: int, full_name: str, position: Optional[str],
                  height: Optional[int], weight: Optional[int],
                  hometown: Optional[str], high_school: Optional[str],
                  stars: Optional[int]) -> str:
    row = conn.execute(
        """
        INSERT INTO fb_players (espn_athlete_id, full_name, position, height, weight,
                                hometown, high_school, stars_247)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (espn_athlete_id) DO UPDATE SET
            full_name   = EXCLUDED.full_name,
            position    = COALESCE(EXCLUDED.position, fb_players.position),
            height      = COALESCE(EXCLUDED.height, fb_players.height),
            weight      = COALESCE(EXCLUDED.weight, fb_players.weight),
            hometown    = COALESCE(EXCLUDED.hometown, fb_players.hometown),
            high_school = COALESCE(EXCLUDED.high_school, fb_players.high_school),
            stars_247   = COALESCE(EXCLUDED.stars_247, fb_players.stars_247),
            updated_at  = now()
        RETURNING id
        """,
        (espn_aid, full_name, position, height, weight, hometown, high_school, stars),
    ).fetchone()
    return str(row["id"])


def upsert_player_team_season(conn, player_id: str, team_id: str,
                               jersey: Optional[str], class_year: Optional[str]) -> str:
    row = conn.execute(
        """
        INSERT INTO fb_player_team_seasons (player_id, team_id, season, jersey, class_year)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (player_id, team_id, season) DO UPDATE SET
            jersey     = COALESCE(EXCLUDED.jersey, fb_player_team_seasons.jersey),
            class_year = COALESCE(EXCLUDED.class_year, fb_player_team_seasons.class_year)
        RETURNING id
        """,
        (player_id, team_id, SEASON, jersey, class_year),
    ).fetchone()
    return str(row["id"])


def load_rosters_for_level(conn, level_key: str) -> int:
    """
    Load rosters for all teams at a given competitive level.
    Also updates head_coach in fb_team_seasons from ESPN roster endpoint.
    """
    teams = conn.execute(
        """
        SELECT t.id AS team_id, t.espn_team_id, t.name
        FROM fb_teams t
        JOIN fb_conferences c ON c.id = t.conference_id
        JOIN fb_competitive_levels cl ON cl.id = c.level_id
        WHERE cl.level_key = %s AND t.espn_team_id IS NOT NULL
        ORDER BY t.name
        """,
        (level_key,),
    ).fetchall()

    total_players = 0
    for team in teams:
        athletes, coach = espn_team_roster(team["espn_team_id"])

        # Persist coach into team_season if found
        if coach:
            conn.execute(
                """
                UPDATE fb_team_seasons SET head_coach=%s
                WHERE team_id=%s AND season=%s AND head_coach IS NULL
                """,
                (coach, str(team["team_id"]), SEASON),
            )

        team_count = 0
        for a in athletes:
            espn_aid = safe_int(a.get("id"))
            if not espn_aid:
                continue
            full_name = a.get("fullName", a.get("displayName", "")).strip()
            if not full_name:
                continue

            pos   = None
            p_obj = a.get("position", {})
            if isinstance(p_obj, dict):
                pos = p_obj.get("abbreviation") or p_obj.get("displayName")
            elif isinstance(p_obj, str):
                pos = p_obj

            height = height_to_inches(a.get("height"))
            weight = safe_int(a.get("weight"))
            jersey = str(a.get("jersey", "")).strip() or None
            exp    = a.get("experience", {})
            if isinstance(exp, dict):
                cls = EXP_MAP.get(exp.get("abbreviation", "").upper(), exp.get("abbreviation"))
            else:
                cls = None

            bp       = a.get("birthPlace", {})
            hometown = None
            if isinstance(bp, dict) and (bp.get("city") or bp.get("state")):
                hometown = ", ".join(filter(None, [bp.get("city"), bp.get("state")]))

            rr    = a.get("recruitingRank", {})
            stars = safe_int(rr.get("stars")) if isinstance(rr, dict) else None

            player_id = upsert_player(conn, espn_aid, full_name, pos, height, weight,
                                      hometown, None, stars)
            upsert_player_team_season(conn, player_id, str(team["team_id"]), jersey, cls)
            team_count += 1

        conn.commit()
        total_players += team_count

    return total_players


# ── Step 3: Sports Reference player stats ─────────────────────────────────────
# Build lookup: normalized school name → fb_teams.id

def build_school_map(conn) -> dict[str, str]:
    """Map lowercase school name variations → fb_teams.id."""
    teams = conn.execute("SELECT id, name FROM fb_teams").fetchall()
    m: dict[str, str] = {}
    for t in teams:
        key = t["name"].lower().strip()
        m[key] = str(t["id"])
        # Also map without common suffixes
        for suffix in (" crimson tide", " bulldogs", " wolverines", " buckeyes",
                       " longhorns", " fighting irish", " hurricanes", " trojans"):
            if key.endswith(suffix):
                m[key[: -len(suffix)]] = str(t["id"])
    return m


def find_player_team_season(conn, full_name: str, school_key: str,
                             school_map: dict[str, str]) -> Optional[str]:
    """Return fb_player_team_seasons.id by name + school match."""
    team_id = school_map.get(school_key.lower().strip())
    if not team_id:
        return None
    row = conn.execute(
        """
        SELECT pts.id
        FROM fb_player_team_seasons pts
        JOIN fb_players p ON p.id = pts.player_id
        WHERE lower(p.full_name) = lower(%s)
          AND pts.team_id = %s
          AND pts.season  = %s
        LIMIT 1
        """,
        (full_name, team_id, SEASON),
    ).fetchone()
    return str(row["id"]) if row else None


def scrape_passing_stats(conn, school_map: dict[str, str]):
    print("  Scraping passing stats from Sports Reference...")
    url = f"https://www.sports-reference.com/cfb/years/{SEASON}-passing.html"
    html = sref_fetch(url)
    if not html:
        print("  WARNING: Could not fetch passing page")
        return 0

    rows = sref_parse_table(html, "passing")
    inserted = 0
    for r in rows:
        name   = (r.get("player") or r.get("name_display", "")).replace("*", "").strip()
        school = r.get("school_name", r.get("school", "")).strip()
        if not name or not school:
            continue
        pts_id = find_player_team_season(conn, name, school, school_map)
        if not pts_id:
            continue
        # Update games played on pts
        games = safe_int(r.get("g"))
        if games:
            conn.execute(
                "UPDATE fb_player_team_seasons SET games=%s WHERE id=%s",
                (games, pts_id),
            )
        conn.execute(
            """
            INSERT INTO fb_qb_season_stats
                (player_team_season_id, comp, att, comp_pct, pass_yards, ypa,
                 pass_td, int, rating, rush_att, rush_yards, rush_td)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (player_team_season_id) DO UPDATE SET
                comp       = EXCLUDED.comp,
                att        = EXCLUDED.att,
                comp_pct   = EXCLUDED.comp_pct,
                pass_yards = EXCLUDED.pass_yards,
                ypa        = EXCLUDED.ypa,
                pass_td    = EXCLUDED.pass_td,
                int        = EXCLUDED.int,
                rating     = EXCLUDED.rating,
                rush_att   = EXCLUDED.rush_att,
                rush_yards = EXCLUDED.rush_yards,
                rush_td    = EXCLUDED.rush_td
            """,
            (
                pts_id,
                safe_int(r.get("cmp")),
                safe_int(r.get("att")),
                safe_float(r.get("pct")),
                safe_int(r.get("yds")),
                safe_float(r.get("ypa")),
                safe_int(r.get("td")),
                safe_int(r.get("int")),
                safe_float(r.get("rate")),
                safe_int(r.get("rush_att")),
                safe_int(r.get("rush_yds")),
                safe_int(r.get("rush_td")),
            ),
        )
        inserted += 1

    conn.commit()
    print(f"  ✓ {inserted} QB stat rows")
    return inserted


def scrape_rushing_stats(conn, school_map: dict[str, str]):
    print("  Scraping rushing stats...")
    url = f"https://www.sports-reference.com/cfb/years/{SEASON}-rushing.html"
    html = sref_fetch(url)
    if not html:
        print("  WARNING: Could not fetch rushing page")
        return 0

    rows = sref_parse_table(html, "rushing")
    inserted = 0
    for r in rows:
        name   = (r.get("player") or r.get("name_display", "")).replace("*", "").strip()
        school = r.get("school_name", r.get("school", "")).strip()
        pos    = r.get("pos", r.get("position", "QB"))
        if not name or not school:
            continue
        # Skip QBs (they're in qb_season_stats)
        if pos.upper() == "QB":
            continue
        pts_id = find_player_team_season(conn, name, school, school_map)
        if not pts_id:
            continue
        games = safe_int(r.get("g"))
        if games:
            conn.execute(
                "UPDATE fb_player_team_seasons SET games=%s WHERE id=%s",
                (games, pts_id),
            )
        rush_att = safe_int(r.get("att"))
        rush_yds = safe_int(r.get("yds"))
        rush_td  = safe_int(r.get("td"))
        ypc = None
        if rush_att and rush_yds is not None and rush_att > 0:
            ypc = round(rush_yds / rush_att, 2)

        conn.execute(
            """
            INSERT INTO fb_skill_season_stats
                (player_team_season_id, rush_att, rush_yards, ypc, rush_td)
            VALUES (%s,%s,%s,%s,%s)
            ON CONFLICT (player_team_season_id) DO UPDATE SET
                rush_att   = EXCLUDED.rush_att,
                rush_yards = EXCLUDED.rush_yards,
                ypc        = EXCLUDED.ypc,
                rush_td    = EXCLUDED.rush_td
            """,
            (pts_id, rush_att, rush_yds, ypc, rush_td),
        )
        inserted += 1

    conn.commit()
    print(f"  ✓ {inserted} rushing stat rows")
    return inserted


def scrape_receiving_stats(conn, school_map: dict[str, str]):
    print("  Scraping receiving stats...")
    url = f"https://www.sports-reference.com/cfb/years/{SEASON}-receiving.html"
    html = sref_fetch(url)
    if not html:
        print("  WARNING: Could not fetch receiving page")
        return 0

    rows = sref_parse_table(html, "receiving")
    inserted = 0
    for r in rows:
        name   = (r.get("player") or r.get("name_display", "")).replace("*", "").strip()
        school = r.get("school_name", r.get("school", "")).strip()
        if not name or not school:
            continue
        pts_id = find_player_team_season(conn, name, school, school_map)
        if not pts_id:
            continue
        rec      = safe_int(r.get("rec"))
        rec_yds  = safe_int(r.get("yds"))
        rec_td   = safe_int(r.get("td"))
        ypr = None
        if rec and rec_yds is not None and rec > 0:
            ypr = round(rec_yds / rec, 2)

        conn.execute(
            """
            INSERT INTO fb_skill_season_stats
                (player_team_season_id, rec, rec_yards, ypr, rec_td)
            VALUES (%s,%s,%s,%s,%s)
            ON CONFLICT (player_team_season_id) DO UPDATE SET
                rec       = EXCLUDED.rec,
                rec_yards = EXCLUDED.rec_yards,
                ypr       = EXCLUDED.ypr,
                rec_td    = EXCLUDED.rec_td
            """,
            (pts_id, rec, rec_yds, ypr, rec_td),
        )
        inserted += 1

    conn.commit()
    print(f"  ✓ {inserted} receiving stat rows")
    return inserted


def scrape_defense_stats(conn, school_map: dict[str, str]):
    print("  Scraping defense stats...")
    url = f"https://www.sports-reference.com/cfb/years/{SEASON}-defense.html"
    html = sref_fetch(url)
    if not html:
        print("  WARNING: Could not fetch defense page")
        return 0

    rows = sref_parse_table(html, "defense")
    inserted = 0
    for r in rows:
        name   = (r.get("player") or r.get("name_display", "")).replace("*", "").strip()
        school = r.get("school_name", r.get("school", "")).strip()
        if not name or not school:
            continue
        pts_id = find_player_team_season(conn, name, school, school_map)
        if not pts_id:
            continue

        # CFB-Ref defense columns: solo, ast, tot, loss, sack, int, yds, avg, td, pd, ff, fr
        conn.execute(
            """
            INSERT INTO fb_defense_season_stats
                (player_team_season_id, tackles, solo, assists, tfl, sacks,
                 int, pbu, ff, fr, def_td)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (player_team_season_id) DO UPDATE SET
                tackles = EXCLUDED.tackles,
                solo    = EXCLUDED.solo,
                assists = EXCLUDED.assists,
                tfl     = EXCLUDED.tfl,
                sacks   = EXCLUDED.sacks,
                int     = EXCLUDED.int,
                pbu     = EXCLUDED.pbu,
                ff      = EXCLUDED.ff,
                fr      = EXCLUDED.fr,
                def_td  = EXCLUDED.def_td
            """,
            (
                pts_id,
                safe_int(r.get("tot", r.get("tackles"))),
                safe_int(r.get("solo")),
                safe_int(r.get("ast", r.get("assists"))),
                safe_float(r.get("loss", r.get("tfl"))),
                safe_float(r.get("sack")),
                safe_int(r.get("int")),
                safe_int(r.get("pd", r.get("pbu"))),
                safe_int(r.get("ff")),
                safe_int(r.get("fr")),
                safe_int(r.get("td", r.get("def_td"))),
            ),
        )
        inserted += 1

    conn.commit()
    print(f"  ✓ {inserted} defense stat rows")
    return inserted


def scrape_kicking_stats(conn, school_map: dict[str, str]):
    print("  Scraping kicking stats...")
    url = f"https://www.sports-reference.com/cfb/years/{SEASON}-kicking.html"
    html = sref_fetch(url)
    if not html:
        print("  WARNING: Could not fetch kicking page")
        return 0

    rows = sref_parse_table(html, "kicking")
    inserted = 0
    for r in rows:
        name   = (r.get("player") or r.get("name_display", "")).replace("*", "").strip()
        school = r.get("school_name", r.get("school", "")).strip()
        if not name or not school:
            continue
        pts_id = find_player_team_season(conn, name, school, school_map)
        if not pts_id:
            continue
        fgm = safe_int(r.get("fgm", r.get("xpm")))  # column names vary
        fga = safe_int(r.get("fga"))
        conn.execute(
            """
            INSERT INTO fb_kicker_season_stats
                (player_team_season_id, fgm, fga, fg_pct, fg_long, xpm, xpa, points)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (player_team_season_id) DO UPDATE SET
                fgm    = EXCLUDED.fgm,
                fga    = EXCLUDED.fga,
                fg_pct = EXCLUDED.fg_pct,
                fg_long= EXCLUDED.fg_long,
                xpm    = EXCLUDED.xpm,
                xpa    = EXCLUDED.xpa,
                points = EXCLUDED.points
            """,
            (
                pts_id,
                safe_int(r.get("fgm")),
                safe_int(r.get("fga")),
                safe_float(r.get("fg_pct", r.get("pct"))),
                safe_int(r.get("fg_long", r.get("long"))),
                safe_int(r.get("xpm")),
                safe_int(r.get("xpa")),
                safe_int(r.get("pts", r.get("points"))),
            ),
        )
        inserted += 1

    conn.commit()
    print(f"  ✓ {inserted} kicking stat rows")
    return inserted


def scrape_cfbref_stats(conn):
    """
    Sports Reference CFB is Cloudflare-protected (403). Falls through to ESPN.
    This function is kept as a stub; use scrape_espn_stats() instead.
    """
    print("\n[STATS] Sports Reference CFB is blocked (403). Use 'espn_stats' mode instead.")


# ── Step 3b: ESPN game-summary stats pipeline ─────────────────────────────────
# Sports Reference CFB blocks scraping. Instead we:
#   1. Pull all 2024 season game IDs from ESPN scoreboard (FBS groups 80, FCS group 81)
#   2. Filter to games involving teams in our DB
#   3. Fetch each game's box score (summary endpoint)
#   4. Parse passing/rushing/receiving/defensive/kicking stats per athlete
#   5. Aggregate across all games → season totals
#   6. Match athletes by ESPN ID → insert into stat tables


def get_espn_game_ids(groups: list[int] = (80, 81)) -> dict[int, list[int]]:
    """
    Returns {espn_team_id: [game_id, ...]} mapping.
    Fetches from ESPN scoreboard for the full 2024 season.
    """
    team_games: dict[int, list[int]] = {}
    for grp in groups:
        url = (
            f"{ESPN_SITE}/scoreboard"
            f"?groups={grp}&dates={SEASON}0824-{int(SEASON)+1}0120&limit=1000"
        )
        data = espn_get(url)
        if not data:
            continue
        for evt in data.get("events", []):
            eid = safe_int(evt.get("id"))
            if not eid:
                continue
            for comp in evt.get("competitions", []):
                for competitor in comp.get("competitors", []):
                    tid = safe_int(competitor.get("team", {}).get("id"))
                    if tid:
                        team_games.setdefault(tid, [])
                        if eid not in team_games[tid]:
                            team_games[tid].append(eid)
    return team_games


def fetch_game_boxscore(event_id: int) -> dict:
    """Fetch ESPN game summary and return boxscore dict."""
    data = espn_get(f"{ESPN_SITE}/summary?event={event_id}")
    return (data or {}).get("boxscore", {})


def _parse_ca_att(s: str) -> tuple[Optional[int], Optional[int]]:
    """Parse 'C/ATT' format (e.g. '20/27') into (comp, att)."""
    m = re.match(r"(\d+)/(\d+)", str(s or ""))
    if m:
        return int(m.group(1)), int(m.group(2))
    return None, None


def _parse_fg_str(s: str) -> tuple[Optional[int], Optional[int]]:
    """Parse 'FGM/FGA' format (e.g. '1/1') → (made, att)."""
    return _parse_ca_att(s)


def aggregate_game_stats(game_stats: dict) -> dict:
    """
    Merge per-game stat dicts into season-aggregate dicts.
    game_stats: {espn_athlete_id: {category: {field: value, ...}}}
    Returns same structure with aggregated values.
    """
    return game_stats  # Already accumulating in place


def scrape_espn_season_stats(conn, level_keys: Optional[list] = None):
    """
    Scrape ESPN game-by-game stats for all teams at the given levels,
    aggregate to season totals, then insert into stat tables.
    """
    # Build ESPN-team-id → fb_teams.id + fb_player_team_seasons lookup
    level_filter = ""
    params: list = []
    if level_keys:
        placeholders = ",".join(["%s"] * len(level_keys))
        level_filter = f"AND cl.level_key IN ({placeholders})"
        params.extend(level_keys)

    teams = conn.execute(
        f"""
        SELECT t.id AS team_id, t.espn_team_id, t.name
        FROM fb_teams t
        JOIN fb_conferences c ON c.id = t.conference_id
        JOIN fb_competitive_levels cl ON cl.id = c.level_id
        WHERE t.espn_team_id IS NOT NULL {level_filter}
        ORDER BY t.name
        """,
        params,
    ).fetchall()

    if not teams:
        print("  No teams found for given level keys")
        return

    db_team_ids = {t["espn_team_id"] for t in teams}
    print(f"  Fetching game IDs for {len(teams)} teams...")
    team_games = get_espn_game_ids([80, 81])

    # Collect unique game IDs that involve at least one of our teams
    our_game_ids: set[int] = set()
    for t in teams:
        for gid in team_games.get(t["espn_team_id"], []):
            our_game_ids.add(gid)

    print(f"  Found {len(our_game_ids)} unique games to process")

    # season_stats: espn_athlete_id → {passing: {...}, rushing: {...}, ...}
    season_stats: dict[int, dict[str, dict]] = {}

    processed = 0
    for gid in sorted(our_game_ids):
        boxscore = fetch_game_boxscore(gid)
        players_sections = boxscore.get("players", [])

        for team_section in players_sections:
            for cat in team_section.get("statistics", []):
                cat_name = cat.get("name", "").lower()
                labels   = cat.get("labels", [])
                for a_entry in cat.get("athletes", []):
                    athlete_obj = a_entry.get("athlete", {})
                    aid = safe_int(athlete_obj.get("id"))
                    if not aid:
                        continue
                    stats_list = a_entry.get("stats", [])
                    row = {lab: stats_list[i] for i, lab in enumerate(labels) if i < len(stats_list)}

                    if aid not in season_stats:
                        season_stats[aid] = {}
                    if cat_name not in season_stats[aid]:
                        season_stats[aid][cat_name] = {}

                    # Accumulate numeric stats
                    for field, val in row.items():
                        # Handle C/ATT and FG/XP formatted fields
                        if "/" in str(val):
                            made, att = _parse_ca_att(val)
                            season_stats[aid][cat_name].setdefault(f"{field}_made", 0)
                            season_stats[aid][cat_name].setdefault(f"{field}_att", 0)
                            if made is not None:
                                season_stats[aid][cat_name][f"{field}_made"] += made
                            if att is not None:
                                season_stats[aid][cat_name][f"{field}_att"] += att
                        else:
                            fval = safe_float(val)
                            if fval is not None:
                                season_stats[aid][cat_name].setdefault(field, 0.0)
                                season_stats[aid][cat_name][field] += fval

        processed += 1
        if processed % 50 == 0:
            print(f"    {processed}/{len(our_game_ids)} games processed...")

    print(f"  ✓ Processed {processed} games | {len(season_stats)} athletes with stats")

    # Build athlete_id → player_team_season_id lookup
    pts_rows = conn.execute(
        """
        SELECT p.espn_athlete_id, pts.id AS pts_id, pts.team_id
        FROM fb_player_team_seasons pts
        JOIN fb_players p ON p.id = pts.player_id
        JOIN fb_teams t ON t.id = pts.team_id
        WHERE pts.season = %s AND p.espn_athlete_id IS NOT NULL
        """,
        (SEASON,),
    ).fetchall()
    athlete_pts_map: dict[int, str] = {r["espn_athlete_id"]: str(r["pts_id"]) for r in pts_rows}

    print(f"  Matching to {len(athlete_pts_map)} player-team-season entries...")

    # Insert stats
    qb_ins = sk_ins = def_ins = kick_ins = 0

    for aid, cats in season_stats.items():
        pts_id = athlete_pts_map.get(aid)
        if not pts_id:
            continue

        # ── Passing (QB) ─────────────────────────────────────────────────────
        if "passing" in cats:
            p = cats["passing"]
            comp = safe_int(p.get("C/ATT_made"))
            att  = safe_int(p.get("C/ATT_att"))
            yds  = safe_int(p.get("YDS"))
            td   = safe_int(p.get("TD"))
            ints = safe_int(p.get("INT"))
            comp_pct = round(comp / att * 100, 2) if comp and att else None
            ypa      = round(yds / att, 2) if yds and att else None
            # Rush stats may be in rushing category
            rush = cats.get("rushing", {})
            rush_att = safe_int(rush.get("CAR"))
            rush_yds = safe_int(rush.get("YDS"))
            rush_td  = safe_int(rush.get("TD"))
            conn.execute(
                """
                INSERT INTO fb_qb_season_stats
                    (player_team_season_id, comp, att, comp_pct, pass_yards, ypa,
                     pass_td, int, rush_att, rush_yards, rush_td)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (player_team_season_id) DO UPDATE SET
                    comp=EXCLUDED.comp, att=EXCLUDED.att, comp_pct=EXCLUDED.comp_pct,
                    pass_yards=EXCLUDED.pass_yards, ypa=EXCLUDED.ypa,
                    pass_td=EXCLUDED.pass_td, int=EXCLUDED.int,
                    rush_att=EXCLUDED.rush_att, rush_yards=EXCLUDED.rush_yards,
                    rush_td=EXCLUDED.rush_td
                """,
                (pts_id, comp, att, comp_pct, yds, ypa, td, ints,
                 rush_att, rush_yds, rush_td),
            )
            # Update games played on pts
            gp = safe_int(cats.get("general", {}).get("GP"))
            if gp:
                conn.execute("UPDATE fb_player_team_seasons SET games=%s WHERE id=%s AND games IS NULL",
                             (gp, pts_id))
            qb_ins += 1

        # ── Skill (rushing-dominant or receiving-dominant non-QB) ─────────────
        elif "rushing" in cats or "receiving" in cats:
            rush = cats.get("rushing", {})
            recv = cats.get("receiving", {})
            rush_att = safe_int(rush.get("CAR"))
            rush_yds = safe_int(rush.get("YDS"))
            rush_td  = safe_int(rush.get("TD"))
            rec     = safe_int(recv.get("REC"))
            rec_yds = safe_int(recv.get("YDS"))
            rec_td  = safe_int(recv.get("TD"))
            targets = safe_int(recv.get("TGTS"))
            ypc = round(rush_yds / rush_att, 2) if rush_yds and rush_att else None
            ypr = round(rec_yds / rec, 2) if rec_yds and rec else None
            conn.execute(
                """
                INSERT INTO fb_skill_season_stats
                    (player_team_season_id, rush_att, rush_yards, ypc, rush_td,
                     rec, rec_yards, ypr, rec_td, targets)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (player_team_season_id) DO UPDATE SET
                    rush_att=EXCLUDED.rush_att, rush_yards=EXCLUDED.rush_yards,
                    ypc=EXCLUDED.ypc, rush_td=EXCLUDED.rush_td,
                    rec=EXCLUDED.rec, rec_yards=EXCLUDED.rec_yards,
                    ypr=EXCLUDED.ypr, rec_td=EXCLUDED.rec_td,
                    targets=EXCLUDED.targets
                """,
                (pts_id, rush_att, rush_yds, ypc, rush_td, rec, rec_yds, ypr, rec_td, targets),
            )
            sk_ins += 1

        # ── Defense ───────────────────────────────────────────────────────────
        if "defensive" in cats:
            df = cats["defensive"]
            ints_cat = cats.get("interceptions", {})
            conn.execute(
                """
                INSERT INTO fb_defense_season_stats
                    (player_team_season_id, tackles, solo, assists, tfl, sacks,
                     int, pbu, def_td)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (player_team_season_id) DO UPDATE SET
                    tackles=EXCLUDED.tackles, solo=EXCLUDED.solo,
                    assists=EXCLUDED.assists, tfl=EXCLUDED.tfl,
                    sacks=EXCLUDED.sacks, int=EXCLUDED.int,
                    pbu=EXCLUDED.pbu, def_td=EXCLUDED.def_td
                """,
                (
                    pts_id,
                    safe_int(df.get("TOT")),
                    safe_int(df.get("SOLO")),
                    None,   # assists not in ESPN game summary
                    safe_float(df.get("TFL")),
                    safe_float(df.get("SACKS")),
                    safe_int(ints_cat.get("INT")),
                    safe_int(df.get("PD")),
                    safe_int(df.get("TD")),
                ),
            )
            def_ins += 1

        # ── Kicking ───────────────────────────────────────────────────────────
        if "kicking" in cats:
            k = cats["kicking"]
            # FG format "FG_made/FG_att" or "C/ATT_made"
            fgm = safe_int(k.get("FG_made", k.get("C/ATT_made")))
            fga = safe_int(k.get("FG_att",  k.get("C/ATT_att")))
            xpm = safe_int(k.get("XP_made"))
            xpa = safe_int(k.get("XP_att"))
            pts_scored = safe_int(k.get("PTS"))
            fg_pct = round(fgm / fga * 100, 2) if fgm and fga else None
            conn.execute(
                """
                INSERT INTO fb_kicker_season_stats
                    (player_team_season_id, fgm, fga, fg_pct, xpm, xpa, points)
                VALUES (%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (player_team_season_id) DO UPDATE SET
                    fgm=EXCLUDED.fgm, fga=EXCLUDED.fga, fg_pct=EXCLUDED.fg_pct,
                    xpm=EXCLUDED.xpm, xpa=EXCLUDED.xpa, points=EXCLUDED.points
                """,
                (pts_id, fgm, fga, fg_pct, xpm, xpa, pts_scored),
            )
            kick_ins += 1

    conn.commit()
    print(f"  ✓ QB stats: {qb_ins} | Skill: {sk_ins} | Defense: {def_ins} | Kicking: {kick_ins}")


# ── Summary ───────────────────────────────────────────────────────────────────

def print_summary(conn, label: str):
    teams   = conn.execute("SELECT COUNT(*) AS n FROM fb_teams").fetchone()["n"]
    players = conn.execute("SELECT COUNT(*) AS n FROM fb_players").fetchone()["n"]
    pts     = conn.execute(
        "SELECT COUNT(*) AS n FROM fb_player_team_seasons WHERE season=%s", (SEASON,)
    ).fetchone()["n"]
    qb_s  = conn.execute("SELECT COUNT(*) AS n FROM fb_qb_season_stats").fetchone()["n"]
    sk_s  = conn.execute("SELECT COUNT(*) AS n FROM fb_skill_season_stats").fetchone()["n"]
    def_s = conn.execute("SELECT COUNT(*) AS n FROM fb_defense_season_stats").fetchone()["n"]

    print(f"\n{'═'*60}")
    print(f"  CFB POOL — {label}")
    print(f"{'═'*60}")
    print(f"  Teams:        {teams}")
    print(f"  Players:      {players}")
    print(f"  Player-seasons ({SEASON}): {pts}")
    print(f"  QB stats:     {qb_s}")
    print(f"  Skill stats:  {sk_s}")
    print(f"  Defense stats:{def_s}")
    print(f"{'═'*60}\n")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "fbs_p4"
    print(f"\nKaNeXT CFB Pool Scraper — {SEASON} season  [mode={mode}]")
    print("=" * 60)

    conn = get_conn()

    # Always seed static data (idempotent)
    level_ids = seed_static_data(conn)

    if mode in ("seed",):
        conn.close()
        return

    P4_CONF_ABBR = {"ACC": "ACC", "Big Ten": "B1G", "SEC": "SEC", "Big 12": "B12"}

    # ── FBS Power 4 ──────────────────────────────────────────────────────────
    if mode in ("fbs_p4", "fbs", "all"):
        print(f"\n[FBS P4] Loading {len(P4_GROUPS)} conferences...")
        p4_level_id = level_ids["fbs_p4"]
        total_p4_teams = 0
        for conf_name, group_id in P4_GROUPS.items():
            _, n = load_conf_group(conn, conf_name, group_id, p4_level_id,
                                   conf_name, P4_CONF_ABBR.get(conf_name))
            print(f"  {conf_name}: {n} teams loaded")
            total_p4_teams += n

        print(f"\n[FBS P4 ROSTERS] Loading player rosters...")
        p4_players = load_rosters_for_level(conn, "fbs_p4")
        print(f"  ✓ {p4_players} players loaded")
        print(f"\n  FBS P4 total: {total_p4_teams} teams, {p4_players} players")

    # ── FBS Group of 5 ───────────────────────────────────────────────────────
    if mode in ("fbs_g5", "fbs", "all"):
        print(f"\n[FBS G5] Loading {len(G5_GROUPS)} conference groups...")
        g5_level_id = level_ids["fbs_g5"]
        total_g5_teams = 0
        for conf_key, group_id in G5_GROUPS.items():
            canonical, abbr = G5_CONF_CANONICAL.get(conf_key, (conf_key, None))
            _, n = load_conf_group(conn, conf_key, group_id, g5_level_id, canonical, abbr)
            print(f"  {conf_key} ({canonical}): {n} teams loaded")
            total_g5_teams += n

        print(f"\n[FBS G5 ROSTERS] Loading player rosters...")
        g5_players = load_rosters_for_level(conn, "fbs_g5")
        print(f"  ✓ {g5_players} players loaded")
        print(f"\n  FBS G5 total: {total_g5_teams} teams, {g5_players} players")

    # ── FCS ──────────────────────────────────────────────────────────────────
    if mode in ("fcs", "all"):
        print(f"\n[FCS] Loading {len(FCS_GROUPS)} conference groups...")
        total_fcs_teams = 0
        for conf_key, group_id in FCS_GROUPS.items():
            meta = FCS_CONF_META.get(conf_key, (conf_key, None, "fcs_low"))
            canonical_name, abbr, lkey = meta
            lv_id = level_ids[lkey]
            _, n = load_conf_group(conn, conf_key, group_id, lv_id, canonical_name, abbr)
            print(f"  {conf_key} [{lkey}]: {n} teams")
            total_fcs_teams += n

        print(f"\n[FCS ROSTERS] Loading player rosters...")
        fcs_players = 0
        for lkey in ("fcs_top", "fcs_mid", "fcs_low"):
            fcs_players += load_rosters_for_level(conn, lkey)
        print(f"  ✓ {fcs_players} FCS players loaded")
        print(f"\n  FCS total: {total_fcs_teams} teams, {fcs_players} players")

    # ── NCAA Division II ──────────────────────────────────────────────────────
    if mode in ("ncaa_d2", "lower", "all"):
        print(f"\n[NCAA D2] Loading {len(D2_GROUPS)} conference groups...")
        d2_level_id = level_ids["ncaa_d2"]
        total_d2 = 0
        for conf_key, group_id in D2_GROUPS.items():
            canonical, abbr = D2_CONF_CANONICAL.get(conf_key, (conf_key, D2_CONF_ABBR.get(conf_key)))
            _, n = load_conf_group(conn, conf_key, group_id, d2_level_id, canonical, abbr)
            print(f"  {conf_key} ({canonical}): {n} teams")
            total_d2 += n
        print(f"\n[NCAA D2 ROSTERS] Loading player rosters...")
        d2_players = load_rosters_for_level(conn, "ncaa_d2")
        print(f"  ✓ {d2_players} players loaded")
        print(f"\n  NCAA D2 total: {total_d2} teams, {d2_players} players")

    # ── NCAA Division III ─────────────────────────────────────────────────────
    if mode in ("ncaa_d3", "lower", "all"):
        print(f"\n[NCAA D3] Loading conference groups...")
        d3_level_id = level_ids["ncaa_d3"]
        total_d3 = 0
        for conf_key, group_id in D3_GROUPS.items():
            if group_id is None:
                continue
            abbr = D3_CONF_ABBR.get(conf_key)
            _, n = load_conf_group(conn, conf_key, group_id, d3_level_id, conf_key, abbr)
            print(f"  {conf_key}: {n} teams")
            total_d3 += n
        print(f"\n[NCAA D3 ROSTERS] Loading player rosters...")
        d3_players = load_rosters_for_level(conn, "ncaa_d3")
        print(f"  ✓ {d3_players} players loaded")
        print(f"\n  NCAA D3 total: {total_d3} teams, {d3_players} players")

    # ── NAIA ──────────────────────────────────────────────────────────────────
    if mode in ("naia", "lower", "all"):
        print(f"\n[NAIA] Loading {len(NAIA_GROUPS)} conference groups...")
        naia_level_id = level_ids["naia"]
        total_naia = 0
        for conf_key, group_id in NAIA_GROUPS.items():
            abbr = NAIA_CONF_ABBR.get(conf_key)
            _, n = load_conf_group(conn, conf_key, group_id, naia_level_id, conf_key, abbr)
            print(f"  {conf_key}: {n} teams")
            total_naia += n
        print(f"\n[NAIA ROSTERS] Loading player rosters...")
        naia_players = load_rosters_for_level(conn, "naia")
        print(f"  ✓ {naia_players} players loaded")
        print(f"\n  NAIA total: {total_naia} teams, {naia_players} players")

    # ── Sports Reference stats (blocked — stub) ──────────────────────────────
    if mode in ("stats",):
        scrape_cfbref_stats(conn)

    # ── ESPN game-summary stats ───────────────────────────────────────────────
    # Usage:
    #   python3 cfb_scraper.py espn_stats          → FBS P4 + G5
    #   python3 cfb_scraper.py espn_stats fcs      → FCS (top/mid/low)
    #   python3 cfb_scraper.py espn_stats d2       → NCAA D2
    #   python3 cfb_scraper.py espn_stats d3       → NCAA D3
    #   python3 cfb_scraper.py espn_stats naia     → NAIA
    #   python3 cfb_scraper.py espn_stats all      → all levels in DB
    if mode in ("espn_stats",):
        subtarget = sys.argv[2] if len(sys.argv) > 2 else "fbs"
        _stats_map = {
            "fbs":  ["fbs_p4", "fbs_g5"],
            "fcs":  ["fcs_top", "fcs_mid", "fcs_low"],
            "d2":   ["ncaa_d2"],
            "d3":   ["ncaa_d3"],
            "naia": ["naia"],
            "all":  None,
        }
        level_keys = _stats_map.get(subtarget, ["fbs_p4", "fbs_g5"])
        tag = subtarget.upper()
        print(f"\n[ESPN STATS — {tag}] Aggregating per-game stats from ESPN game summaries...")
        scrape_espn_season_stats(conn, level_keys=level_keys)

    if mode in ("all",):
        print("\n[ESPN STATS — ALL] Aggregating per-game stats for all levels...")
        scrape_espn_season_stats(conn, level_keys=None)

    print_summary(conn, mode.upper())
    conn.close()


if __name__ == "__main__":
    main()
