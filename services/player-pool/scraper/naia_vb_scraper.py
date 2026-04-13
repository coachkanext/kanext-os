#!/usr/bin/env python3
"""
KaNeXT NAIA Volleyball Scraper (Women's + Men's)
Source: Individual NAIA school athletics sites (229 schools)

Platform detection (tried in order):
  1. PrestoSports: {url}/sports/{sport}/2025-26/teams/{slug}?tmpl=brief-category-template&pos=overall&r=0
  2. Sidearm:      {url}/sports/{sidearm_path}/stats/2025-26

PrestoSports stat columns (NJCAA-identical format):
  #, Name, Yr, Pos, m, s, k, k/s, e, ta, pct, a, a/s, sa, sa/s, r, re, digs, d/s, bs, ba, tot, b/s, pts, pts/s

Sidearm format (2 tables, merged by player name):
  Table 1 (attack/set/serve): #, Player, Yr, GP, S, K, K/S, E, TA, Pct, A, A/S, SA, SA/S, SE
  Table 2 (defense):          #, Player, Yr, GP, S, RE, Digs, D/S, BS, BA, TB, B/S, Pts, Pts/S

DB tables:
  naia_vb_teams   — sport, name, slug, school_url, season
  naia_vb_players — team_id, full_name, position, class_year, jersey
  naia_vb_stats   — full volleyball stat set

Usage:
    python3 naia_vb_scraper.py               # both sports
    python3 naia_vb_scraper.py --sport wvball
    python3 naia_vb_scraper.py --sport mvball
    python3 naia_vb_scraper.py --test 20     # first 20 schools only
"""
from __future__ import annotations

import json
import re
import time
import argparse
from pathlib import Path
from typing import Optional

import httpx
import psycopg
from psycopg.rows import dict_row
from bs4 import BeautifulSoup

# ── Config ─────────────────────────────────────────────────────────────────────

DB_CONFIG    = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}
SEASON       = "2025-26"
DELAY        = 1.2
TIMEOUT      = 20
SCHOOLS_FILE = Path(__file__).parent / "naia_schools.json"

# PrestoSports sport codes + Sidearm URL slug
SPORT_MAP = {
    "wvball": {"presto": "wvball",      "sidearm": "womens-volleyball"},
    "mvball": {"presto": "mvball",      "sidearm": "mens-volleyball"},
}

BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

# ── DB Schema ──────────────────────────────────────────────────────────────────

CREATE_TEAMS = """
CREATE TABLE IF NOT EXISTS naia_vb_teams (
    id          SERIAL PRIMARY KEY,
    sport       TEXT NOT NULL,
    name        TEXT NOT NULL,
    slug        TEXT,
    school_url  TEXT,
    platform    TEXT,       -- 'presto' or 'sidearm'
    season      TEXT NOT NULL,
    UNIQUE (sport, name, season)
);
"""

CREATE_PLAYERS = """
CREATE TABLE IF NOT EXISTS naia_vb_players (
    id          SERIAL PRIMARY KEY,
    team_id     INT  NOT NULL REFERENCES naia_vb_teams(id),
    full_name   TEXT NOT NULL,
    position    TEXT,
    class_year  TEXT,
    jersey      TEXT,
    UNIQUE (team_id, full_name)
);
"""

CREATE_STATS = """
CREATE TABLE IF NOT EXISTS naia_vb_stats (
    id              SERIAL PRIMARY KEY,
    player_id       INT  NOT NULL REFERENCES naia_vb_players(id),
    season          TEXT NOT NULL,
    gp              INT,
    sets            INT,
    kills           INT,
    kills_per_set   NUMERIC(6,3),
    errors          INT,
    total_att       INT,
    hit_pct         NUMERIC(6,4),
    assists         INT,
    assists_per_set NUMERIC(6,3),
    service_aces    INT,
    aces_per_set    NUMERIC(6,3),
    service_errors  INT,
    digs            INT,
    digs_per_set    NUMERIC(6,3),
    block_solos     INT,
    block_assists   INT,
    total_blocks    INT,
    blocks_per_set  NUMERIC(6,3),
    points          NUMERIC(8,1),
    pts_per_set     NUMERIC(6,3),
    UNIQUE (player_id, season)
);
"""


def ensure_schema(conn):
    conn.execute(CREATE_TEAMS)
    conn.execute(CREATE_PLAYERS)
    conn.execute(CREATE_STATS)
    conn.commit()


# ── Helpers ────────────────────────────────────────────────────────────────────

_SKIP = {"name", "player", "totals", "total", "", "opponent", "opponents",
         "home", "away", "exhibition", "#"}


def _int(v) -> Optional[int]:
    if v is None:
        return None
    s = str(v).strip()
    if s in ("-", "", "—"):
        return None
    try:
        return int(float(s))
    except (ValueError, TypeError):
        return None


def _float(v, ndigits: int = 4) -> Optional[float]:
    if v is None:
        return None
    s = str(v).strip()
    if s in ("-", "", "—", "∞", "inf", "INF"):
        return None
    try:
        f = float(s)
        if f != f or abs(f) == float("inf"):
            return None
        return round(f, ndigits)
    except (ValueError, TypeError):
        return None


def cell_text(cells, i: int) -> str:
    """Get clean text from cell i, using <a> tag if present to avoid duplication."""
    if not (0 <= i < len(cells)):
        return ""
    a = cells[i].find("a")
    if a:
        return " ".join(a.get_text(strip=True).split())
    return " ".join(cells[i].get_text(strip=True).split())


# ── PrestoSports Parser (same format as NJCAA VB) ──────────────────────────────

def parse_presto_vb_table(html: str) -> list[dict]:
    """
    Parse PrestoSports brief-category-template VB stats page.
    Columns: #, Name, Yr, Pos, m, s, k, k/s, e, ta, pct, a, a/s, sa, sa/s,
             r, re, digs, d/s, bs, ba, tot, b/s, pts, pts/s
    """
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table")
    if not table:
        return []

    rows = table.find_all("tr")
    if not rows:
        return []

    # Find header row
    header_idx = 0
    for i, tr in enumerate(rows[:4]):
        hdrs_test = [td.get_text(strip=True).lower() for td in tr.find_all(["th", "td"])]
        if "k" in hdrs_test or "kills" in hdrs_test or "k/s" in hdrs_test:
            header_idx = i
            break

    hdrs = [td.get_text(strip=True).lower() for td in rows[header_idx].find_all(["th", "td"])]

    def ci(names: list[str]) -> int:
        for n in names:
            for idx, h in enumerate(hdrs):
                if h == n:
                    return idx
        return -1

    C_NO   = ci(["#", "no"])
    C_NAME = ci(["name", "player"])
    C_YR   = ci(["yr", "year"])
    C_POS  = ci(["pos", "position"])
    C_M    = ci(["m", "matches", "gp"])
    C_S    = ci(["s", "sets"])
    C_K    = ci(["k", "kills"])
    C_KPS  = ci(["k/s"])
    C_E    = ci(["e", "errors"])
    C_TA   = ci(["ta"])
    C_PCT  = ci(["pct", "hit%", "hit pct"])
    C_A    = ci(["a", "assists"])
    C_APS  = ci(["a/s"])
    C_SA   = ci(["sa"])
    C_SAPS = ci(["sa/s"])
    C_SE   = ci(["se"])
    C_DIGS = ci(["digs", "d"])
    C_DPS  = ci(["d/s"])
    C_BS   = ci(["bs"])
    C_BA   = ci(["ba"])
    C_TOT  = ci(["tot", "tb", "total blocks"])
    C_BPS  = ci(["b/s"])
    C_PTS  = ci(["pts", "points"])
    C_PTPS = ci(["pts/s"])

    if C_NAME < 0:
        return []

    results = []
    for tr in rows[header_idx + 1:]:
        cells = tr.find_all(["td", "th"])
        if len(cells) < 5:
            continue
        name = cell_text(cells, C_NAME)
        if not name or name.lower() in _SKIP:
            continue
        if name.lower() in ("name", "player", "#"):
            continue

        # Split "Last, First" → full_name
        full_name = name
        if "," in name:
            parts = [p.strip() for p in name.split(",", 1)]
            full_name = f"{parts[1]} {parts[0]}" if len(parts) == 2 else name

        results.append({
            "full_name":  full_name,
            "jersey":     cell_text(cells, C_NO) or None,
            "class_year": cell_text(cells, C_YR) or None,
            "position":   cell_text(cells, C_POS) or None,
            "gp":         _int(cell_text(cells, C_M)),
            "sets":       _int(cell_text(cells, C_S)),
            "kills":      _int(cell_text(cells, C_K)),
            "kps":        _float(cell_text(cells, C_KPS), 3),
            "errors":     _int(cell_text(cells, C_E)),
            "total_att":  _int(cell_text(cells, C_TA)),
            "hit_pct":    _float(cell_text(cells, C_PCT), 4),
            "assists":    _int(cell_text(cells, C_A)),
            "aps":        _float(cell_text(cells, C_APS), 3),
            "aces":       _int(cell_text(cells, C_SA)),
            "aces_ps":    _float(cell_text(cells, C_SAPS), 3),
            "svc_errors": _int(cell_text(cells, C_SE)),
            "digs":       _int(cell_text(cells, C_DIGS)),
            "dps":        _float(cell_text(cells, C_DPS), 3),
            "bs":         _int(cell_text(cells, C_BS)),
            "ba":         _int(cell_text(cells, C_BA)),
            "total_blks": _int(cell_text(cells, C_TOT)),
            "bps":        _float(cell_text(cells, C_BPS), 3),
            "points":     _float(cell_text(cells, C_PTS), 1),
            "pts_ps":     _float(cell_text(cells, C_PTPS), 3),
        })
    return results


# ── Sidearm Parser (2-table merge) ─────────────────────────────────────────────

def _clean_sidearm_name(raw: str) -> str:
    """
    Sidearm VB player cells contain duplicate text with jersey number between:
      "Gigante, Luana01Gigante, Luana"  →  "Gigante, Luana"
    Uses backreference to detect and strip the duplication.
    """
    s = raw.strip()
    # Pattern: <name><1-2 digit jersey><name> (exact repeat)
    m = re.match(r'^(.+?)\d{1,2}\1$', s)
    if m:
        return m.group(1).strip()
    return s


def _parse_sidearm_table(table, stat_type: str) -> dict[str, dict]:
    """
    Parse one Sidearm VB stats table.
    stat_type: 'attack' or 'defense'
    Returns dict keyed by cleaned player name.

    Sidearm table structure:
      Row 0: group headers  ['#', '', 'ATTACK', 'SET', 'SERVE', 'Bio Link']
      Row 1: column headers ['Player', 'SP', 'MP', 'MS', 'PTS', 'PTS/S', 'K', ...]
      Row 2+: data rows     ['01', 'Last, First01Last, First', '6', ...]

    Data rows have an extra '#' (jersey) column prepended that is NOT in the
    header row, so all column indices from ci() need +1 offset.
    """
    rows = table.find_all("tr")
    if not rows:
        return {}

    # Find the column-level header row (has Player + stat columns)
    header_idx = -1
    for i, tr in enumerate(rows[:4]):
        hdrs_test = [td.get_text(strip=True).upper() for td in tr.find_all(["th", "td"])]
        if "PLAYER" in hdrs_test or "NAME" in hdrs_test:
            header_idx = i
            break
    if header_idx < 0:
        return {}

    hdrs = [td.get_text(strip=True).upper() for td in rows[header_idx].find_all(["th", "td"])]

    def ci(names: list[str]) -> int:
        for n in names:
            for idx, h in enumerate(hdrs):
                if h == n:
                    return idx
        return -1

    # Detect column offset: data rows have jersey (#) prepended before 'Player',
    # so data[ci_val + offset] maps to the correct column.
    # Check first data row: if data has more cells than headers, offset = +1.
    offset = 0
    for tr in rows[header_idx + 1:]:
        data_cells = tr.find_all(["td", "th"])
        if len(data_cells) > len(hdrs):
            offset = len(data_cells) - len(hdrs)
            # Typically offset=1 (jersey) or offset=2 (jersey + bio link, but bio is at end)
            # Since bio link is at the END, offset from front is just 1
            offset = 1
        break

    C_NAME = ci(["PLAYER", "NAME"])
    C_YR   = ci(["YR", "YEAR", "CL"])
    C_POS  = ci(["POS", "POSITION"])
    C_GP   = ci(["MP", "GP", "M", "MATCHES"])   # MP = matches played
    C_S    = ci(["SP", "S", "SETS"])             # SP = sets played

    if C_NAME < 0:
        return {}

    def get(cells, col_idx: int) -> str:
        """Get text from data cell, adjusting for jersey offset. Returns '' if col not found."""
        if col_idx < 0:
            return ""
        real_idx = col_idx + offset
        return cell_text(cells, real_idx)

    def get_name(cells) -> str:
        """Get player name from cell; clean Sidearm duplicate pattern."""
        raw = get(cells, C_NAME)
        # Try <a> tag first (already done by cell_text), then clean duplicates
        return _clean_sidearm_name(raw)

    result = {}

    if stat_type == "attack":
        C_K    = ci(["K", "KILLS"])
        C_KPS  = ci(["K/S", "KPS"])
        C_E    = ci(["E", "ERRORS"])
        C_TA   = ci(["TA", "ATT"])
        C_PCT  = ci(["PCT", ".PCT", "HIT%"])
        C_A    = ci(["A", "ASSISTS"])
        C_APS  = ci(["A/S", "APS"])
        C_SA   = ci(["SA", "ACES"])
        C_SAPS = ci(["SA/S", "SAPS"])
        C_SE   = ci(["SE"])
        C_PTS  = ci(["PTS", "POINTS"])
        C_PTPS = ci(["PTS/S", "PTPS"])

        for tr in rows[header_idx + 1:]:
            cells = tr.find_all(["td", "th"])
            if len(cells) < 5:
                continue
            name = get_name(cells)
            if not name or name.lower() in _SKIP:
                continue
            if name.upper() in ("PLAYER", "NAME", "#"):
                continue
            full_name = name
            if "," in name:
                parts = [p.strip() for p in name.split(",", 1)]
                full_name = f"{parts[1]} {parts[0]}" if len(parts) == 2 else name

            # jersey is always data[0]
            jersey = cell_text(cells, 0) or None

            result[full_name] = {
                "full_name":  full_name,
                "jersey":     jersey,
                "class_year": get(cells, C_YR) or None,
                "position":   get(cells, C_POS) or None,
                "gp":         _int(get(cells, C_GP)),
                "sets":       _int(get(cells, C_S)),
                "kills":      _int(get(cells, C_K)),
                "kps":        _float(get(cells, C_KPS), 3),
                "errors":     _int(get(cells, C_E)),
                "total_att":  _int(get(cells, C_TA)),
                "hit_pct":    _float(get(cells, C_PCT), 4),
                "assists":    _int(get(cells, C_A)),
                "aps":        _float(get(cells, C_APS), 3),
                "aces":       _int(get(cells, C_SA)),
                "aces_ps":    _float(get(cells, C_SAPS), 3),
                "svc_errors": _int(get(cells, C_SE)),
                "points":     _float(get(cells, C_PTS), 1),
                "pts_ps":     _float(get(cells, C_PTPS), 3),
            }

    else:  # defense
        C_DIGS = ci(["DIG", "DIGS"])
        C_DPS  = ci(["DIG/S", "D/S", "DPS"])
        C_BS   = ci(["BS"])
        C_BA   = ci(["BA"])
        C_TB   = ci(["BLK", "TB", "TOT", "TOTAL BLOCKS"])
        C_BPS  = ci(["BLK/S", "B/S", "BPS"])

        for tr in rows[header_idx + 1:]:
            cells = tr.find_all(["td", "th"])
            if len(cells) < 4:
                continue
            name = get_name(cells)
            if not name or name.lower() in _SKIP:
                continue
            if name.upper() in ("PLAYER", "NAME", "#"):
                continue
            full_name = name
            if "," in name:
                parts = [p.strip() for p in name.split(",", 1)]
                full_name = f"{parts[1]} {parts[0]}" if len(parts) == 2 else name

            result[full_name] = {
                "digs":       _int(get(cells, C_DIGS)),
                "dps":        _float(get(cells, C_DPS), 3),
                "bs":         _int(get(cells, C_BS)),
                "ba":         _int(get(cells, C_BA)),
                "total_blks": _int(get(cells, C_TB)),
                "bps":        _float(get(cells, C_BPS), 3),
            }

    return result


def parse_sidearm_vb_page(html: str) -> list[dict]:
    """
    Parse a Sidearm volleyball stats page with 2 tables.
    Returns merged player list (attack + defense stats combined).
    Table indices vary; we identify by column content.
    """
    soup = BeautifulSoup(html, "html.parser")
    tables = soup.find_all("table")
    if not tables:
        return []

    attack_data: dict[str, dict] = {}
    defense_data: dict[str, dict] = {}

    for tbl in tables:
        hdrs = [td.get_text(strip=True).upper() for td in tbl.find_all(["th", "td"])[:20]]
        has_kills = any(h in ("K", "KILLS", "K/S") for h in hdrs)
        has_digs  = any(h in ("DIG", "DIGS", "DIG/S", "D/S") for h in hdrs)
        has_gp    = any(h in ("GP", "MP", "SP", "M", "MATCHES") for h in hdrs)

        if has_kills and has_gp and not attack_data:
            attack_data = _parse_sidearm_table(tbl, "attack")
        elif has_digs and has_gp and not defense_data:
            defense_data = _parse_sidearm_table(tbl, "defense")

        if attack_data and defense_data:
            break

    # Also accept attack-only (some pages may not have defense table)
    if not attack_data:
        return []

    # Merge: attack is primary, defense supplements
    results = []
    for name, atk in attack_data.items():
        merged = {**atk}
        if name in defense_data:
            merged.update({k: v for k, v in defense_data[name].items() if v is not None})
        else:
            merged.setdefault("digs", None)
            merged.setdefault("dps",  None)
            merged.setdefault("bs",   None)
            merged.setdefault("ba",   None)
            merged.setdefault("total_blks", None)
            merged.setdefault("bps",  None)
            merged.setdefault("points", None)
            merged.setdefault("pts_ps", None)
        results.append(merged)

    return results


# ── HTTP ───────────────────────────────────────────────────────────────────────

def fetch(url: str, retries: int = 2) -> Optional[httpx.Response]:
    for attempt in range(retries):
        try:
            r = httpx.get(url, headers=BROWSER_HEADERS, timeout=TIMEOUT, follow_redirects=True)
            return r
        except Exception as e:
            print(f"  [err] {url}: {e}")
            if attempt < retries - 1:
                time.sleep(5)
    return None


# ── DB Writes ──────────────────────────────────────────────────────────────────

def upsert_team(conn, sport: str, slug: str, name: str, school_url: str, platform: str) -> int:
    row = conn.execute("""
        INSERT INTO naia_vb_teams (sport, name, slug, school_url, platform, season)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (sport, name, season) DO UPDATE SET
            slug       = COALESCE(EXCLUDED.slug,       naia_vb_teams.slug),
            school_url = EXCLUDED.school_url,
            platform   = EXCLUDED.platform
        RETURNING id
    """, (sport, name, slug or None, school_url or None, platform, SEASON)).fetchone()
    return row["id"]


def upsert_player(conn, team_id: int, p: dict) -> int:
    row = conn.execute("""
        INSERT INTO naia_vb_players (team_id, full_name, position, class_year, jersey)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (team_id, full_name) DO UPDATE SET
            position   = COALESCE(EXCLUDED.position,   naia_vb_players.position),
            class_year = COALESCE(EXCLUDED.class_year, naia_vb_players.class_year),
            jersey     = COALESCE(EXCLUDED.jersey,     naia_vb_players.jersey)
        RETURNING id
    """, (
        team_id,
        p["full_name"],
        p.get("position") or None,
        p.get("class_year") or None,
        p.get("jersey") or None,
    )).fetchone()
    return row["id"]


def upsert_stats(conn, player_id: int, p: dict):
    gp = p.get("gp")
    if not gp:
        return
    conn.execute("""
        INSERT INTO naia_vb_stats (
            player_id, season, gp, sets, kills, kills_per_set, errors, total_att, hit_pct,
            assists, assists_per_set, service_aces, aces_per_set, service_errors,
            digs, digs_per_set, block_solos, block_assists, total_blocks, blocks_per_set,
            points, pts_per_set
        ) VALUES (
            %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
        )
        ON CONFLICT (player_id, season) DO UPDATE SET
            gp=EXCLUDED.gp, sets=EXCLUDED.sets, kills=EXCLUDED.kills,
            kills_per_set=EXCLUDED.kills_per_set, errors=EXCLUDED.errors,
            total_att=EXCLUDED.total_att, hit_pct=EXCLUDED.hit_pct,
            assists=EXCLUDED.assists, assists_per_set=EXCLUDED.assists_per_set,
            service_aces=EXCLUDED.service_aces, aces_per_set=EXCLUDED.aces_per_set,
            service_errors=EXCLUDED.service_errors,
            digs=EXCLUDED.digs, digs_per_set=EXCLUDED.digs_per_set,
            block_solos=EXCLUDED.block_solos, block_assists=EXCLUDED.block_assists,
            total_blocks=EXCLUDED.total_blocks, blocks_per_set=EXCLUDED.blocks_per_set,
            points=EXCLUDED.points, pts_per_set=EXCLUDED.pts_per_set
    """, (
        player_id, SEASON,
        gp,
        p.get("sets"),
        p.get("kills"),
        p.get("kps"),
        p.get("errors"),
        p.get("total_att"),
        p.get("hit_pct"),
        p.get("assists"),
        p.get("aps"),
        p.get("aces"),
        p.get("aces_ps"),
        p.get("svc_errors"),
        p.get("digs"),
        p.get("dps"),
        p.get("bs"),
        p.get("ba"),
        p.get("total_blks"),
        p.get("bps"),
        p.get("points"),
        p.get("pts_ps"),
    ))


# ── School Scraper ─────────────────────────────────────────────────────────────

def scrape_school(conn, school: dict, sport: str) -> int:
    """
    Try PrestoSports first, then Sidearm. Returns player count saved.
    """
    base = school["url"].rstrip("/")
    name = school["name"]
    slug = school.get("slug") or re.sub(r"[^a-z0-9]", "", name.lower())
    conf = SPORT_MAP[sport]

    # ── 1. Try PrestoSports ────────────────────────────────────────────────────
    presto_url = (
        f"{base}/sports/{conf['presto']}/{SEASON}/teams/{slug}"
        f"?tmpl=brief-category-template&pos=overall&r=0"
    )
    r = fetch(presto_url)
    if r and r.status_code == 200 and len(r.content) > 3000:
        players = parse_presto_vb_table(r.text)
        if players:
            return _save_players(conn, sport, slug, name, base, "presto", players)

    # ── 2. Try Sidearm ────────────────────────────────────────────────────────
    sidearm_url = f"{base}/sports/{conf['sidearm']}/stats/{SEASON}"
    r = fetch(sidearm_url)
    if r and r.status_code == 200 and len(r.content) > 3000:
        players = parse_sidearm_vb_page(r.text)
        if players:
            return _save_players(conn, sport, slug, name, base, "sidearm", players)

    return 0


def _save_players(conn, sport: str, slug: str, name: str, base: str,
                  platform: str, players: list[dict]) -> int:
    team_id = upsert_team(conn, sport, slug, name, base, platform)
    saved = 0
    for p in players:
        if not p.get("full_name"):
            continue
        try:
            player_id = upsert_player(conn, team_id, p)
            upsert_stats(conn, player_id, p)
            saved += 1
        except Exception as exc:
            print(f"  [stat err] {p.get('full_name')}: {exc}")
            conn.rollback()
    conn.commit()
    return saved


# ── Summary ────────────────────────────────────────────────────────────────────

def print_summary(conn):
    for sport, label in [("wvball", "Women's VB"), ("mvball", "Men's VB")]:
        r = conn.execute("""
            SELECT COUNT(DISTINCT t.id) teams, COUNT(DISTINCT p.id) players, COUNT(s.id) stats
            FROM naia_vb_teams t
            JOIN naia_vb_players p ON p.team_id = t.id
            JOIN naia_vb_stats s ON s.player_id = p.id
            WHERE t.sport = %s AND t.season = %s
        """, (sport, SEASON)).fetchone()
        platform_r = conn.execute("""
            SELECT platform, COUNT(*) n FROM naia_vb_teams
            WHERE sport = %s AND season = %s
            GROUP BY platform ORDER BY platform
        """, (sport, SEASON)).fetchall()
        by_plat = {row["platform"]: row["n"] for row in platform_r}
        presto_n = by_plat.get("presto", 0)
        sidearm_n = by_plat.get("sidearm", 0)
        print(f"  NAIA {label}: {r['teams']} teams ({presto_n} presto/{sidearm_n} sidearm), "
              f"{r['players']} players, {r['stats']} stat rows")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="NAIA Volleyball Stats Scraper")
    parser.add_argument("--sport", choices=["wvball", "mvball"], default=None)
    parser.add_argument("--test",  type=int, default=None, help="Only first N schools")
    args = parser.parse_args()

    schools = json.load(open(SCHOOLS_FILE))
    if args.test:
        schools = schools[:args.test]

    sports = [args.sport] if args.sport else ["wvball", "mvball"]

    print(f"=== NAIA Volleyball Scraper ===")
    print(f"  Season : {SEASON}")
    print(f"  Schools: {len(schools)}")
    print(f"  Sports : {', '.join(sports)}")

    with psycopg.connect(
        host=DB_CONFIG["host"], port=DB_CONFIG["port"], dbname=DB_CONFIG["dbname"],
        row_factory=dict_row, autocommit=False,
    ) as conn:
        ensure_schema(conn)

        for sport in sports:
            label = "Women's VB" if sport == "wvball" else "Men's VB"
            print(f"\n{'='*60}")
            print(f"  {label} ({sport})")
            total_schools = 0
            total_players = 0

            for i, school in enumerate(schools):
                n = scrape_school(conn, school, sport)
                if n > 0:
                    total_schools += 1
                    total_players += n
                    print(f"  {total_schools:>3} {school['name']:<40} {n:>3} players")
                if i < len(schools) - 1:
                    time.sleep(DELAY)

            print(f"\n  → {sport}: {total_players} players from {total_schools} schools")

        print(f"\n{'='*60}")
        print("NAIA VOLLEYBALL FINAL:")
        print_summary(conn)


if __name__ == "__main__":
    main()
