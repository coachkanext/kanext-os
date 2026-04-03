#!/usr/bin/env python3.12
"""
NAIA Football Stats Scraper — 2024-25 Season
Source: Individual school Sidearm Sports athletics sites (same CMS as NAIA WBB)

229 NAIA schools from naia_schools.json.
Stats page: {school_url}/sports/football/stats/2024-25

Tables parsed per school:
  Rushing:   #, Player, GP, ATT, Gain, Loss, Net, AVG, TD, Long, AVG/G
  Passing:   #, Player, GP, Rating, COMP, ATT, INT, %, YDS, TD, Long, AVG/G
  Receiving: #, Player, GP, NO, YDS, AVG, TD, Long, AVG/G
  Defense:   #, Player, GP, Solo, ASST, TOT, TFL-YDS, Sacks-YDS, INT, BU, QBH, FR, FF

DB tables written:
  naia_football_teams    — NAIA football teams
  naia_football_players  — players
  naia_football_stats    — season stats (one row per player)

Usage:
    python3.12 naia_football_scraper.py            # full run (229 schools)
    python3.12 naia_football_scraper.py --test 10  # first 10 schools only
    python3.12 naia_football_scraper.py --dry-run  # probe URLs, no DB writes
"""
from __future__ import annotations

import re
import json
import time
import math
import argparse
from pathlib import Path
from typing import Optional

import httpx
import psycopg
from psycopg.rows import dict_row
from bs4 import BeautifulSoup

# ── Config ─────────────────────────────────────────────────────────────────────

DB_CONFIG  = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}
SEASON     = "2024-25"
DELAY      = 1.5
TIMEOUT    = 20

STATS_PATH = f"/sports/football/stats/{SEASON}"

_SCHOOLS_FILE         = Path(__file__).parent / "naia_schools.json"
_FOOTBALL_SCHOOLS_FILE = Path(__file__).parent / "naia_football_schools.json"

HTTP_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept": "text/html,*/*",
}

# ── DB setup ───────────────────────────────────────────────────────────────────

CREATE_SQL = """
CREATE TABLE IF NOT EXISTS naia_football_teams (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT NOT NULL,
    conference   TEXT,
    slug         TEXT,
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now(),
    UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS naia_football_players (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    naia_id      TEXT NOT NULL UNIQUE,
    full_name    TEXT NOT NULL,
    position     TEXT,
    team_id      UUID REFERENCES naia_football_teams(id),
    season       TEXT NOT NULL DEFAULT '2024-25',
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS naia_football_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL REFERENCES naia_football_players(id),
    season          TEXT NOT NULL DEFAULT '2024-25',
    games           INT,
    -- Rushing
    rush_att        INT,
    rush_yards      INT,
    rush_td         INT,
    rush_avg        NUMERIC(5,2),
    rush_long       INT,
    rush_ypg        NUMERIC(5,2),
    -- Passing
    pass_comp       INT,
    pass_att        INT,
    pass_yards      INT,
    pass_td         INT,
    pass_int        INT,
    pass_pct        NUMERIC(5,2),
    pass_rating     NUMERIC(7,3),
    pass_long       INT,
    pass_ypg        NUMERIC(6,2),
    -- Receiving
    receptions      INT,
    rec_yards       INT,
    rec_td          INT,
    rec_avg         NUMERIC(5,2),
    rec_long        INT,
    rec_ypg         NUMERIC(5,2),
    -- Defense
    solo_tackles    INT,
    ast_tackles     INT,
    tot_tackles     INT,
    tfl             NUMERIC(5,1),
    sacks           NUMERIC(5,1),
    def_int         INT,
    passes_defended INT,
    qb_hurries      INT,
    fumble_rec      INT,
    forced_fumbles  INT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE (player_id, season)
);
"""


def ensure_tables(conn):
    with conn.transaction():
        conn.cursor().execute(CREATE_SQL)


# ── DB helpers ─────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)


def safe_float(v) -> Optional[float]:
    if v is None:
        return None
    if isinstance(v, float) and math.isnan(v):
        return None
    try:
        s = str(v).replace(",", "").replace("%", "").strip()
        return float(s) if s and s not in ("-", "—", ".", "") else None
    except (ValueError, TypeError):
        return None


def safe_int(v) -> Optional[int]:
    f = safe_float(v)
    return int(round(f)) if f is not None else None


def upsert_team(conn, name: str, conference: str, slug: str) -> str:
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO naia_football_teams (name, conference, slug)
            VALUES (%s, %s, %s)
            ON CONFLICT (name) DO UPDATE SET
                conference = COALESCE(EXCLUDED.conference, naia_football_teams.conference),
                slug       = COALESCE(EXCLUDED.slug,       naia_football_teams.slug),
                updated_at = now()
            RETURNING id
        """, (name, conference or None, slug or None))
        return str(cur.fetchone()["id"])


def upsert_player(conn, naia_id: str, full_name: str, position: str, team_id: str) -> str:
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO naia_football_players (naia_id, full_name, position, team_id, season)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (naia_id) DO UPDATE SET
                full_name  = EXCLUDED.full_name,
                position   = COALESCE(NULLIF(EXCLUDED.position, ''), naia_football_players.position),
                team_id    = COALESCE(EXCLUDED.team_id,  naia_football_players.team_id),
                updated_at = now()
            RETURNING id
        """, (naia_id, full_name, position or None, team_id, SEASON))
        return str(cur.fetchone()["id"])


def upsert_stats(conn, player_id: str, stats: dict):
    cols   = [k for k, v in stats.items() if v is not None]
    if not cols:
        return
    vals   = [stats[c] for c in cols]
    set_cl = ", ".join(
        f"{c} = COALESCE(EXCLUDED.{c}, naia_football_stats.{c})"
        for c in cols
    )
    with conn.transaction():
        cur = conn.cursor()
        cur.execute(f"""
            INSERT INTO naia_football_stats (player_id, season, {", ".join(cols)})
            VALUES (%s, %s, {", ".join(["%s"]*len(cols))})
            ON CONFLICT (player_id, season) DO UPDATE SET {set_cl}
        """, [player_id, SEASON] + vals)


# ── Fetch ──────────────────────────────────────────────────────────────────────

def fetch_page(url: str) -> Optional[BeautifulSoup]:
    try:
        r = httpx.get(url, headers=HTTP_HEADERS, timeout=TIMEOUT, follow_redirects=True)
        time.sleep(DELAY)
        if r.status_code == 200 and "Just a moment" not in r.text and len(r.text) > 2000:
            return BeautifulSoup(r.text, "html.parser")
        return None
    except Exception:
        time.sleep(DELAY)
        return None


# ── Parse ──────────────────────────────────────────────────────────────────────

def extract_school_name(soup: BeautifulSoup, fallback: str) -> str:
    """Extract real school name from page title."""
    if soup.title:
        title = soup.title.get_text(strip=True)
        m = re.search(r" - (.+?) Athletics$", title)
        if m:
            return m.group(1).strip()
        m2 = re.search(r"Statistics\s*[-–]\s*(.+)$", title)
        if m2:
            return m2.group(1).strip()
    return fallback


def parse_row_cells(tr) -> list[str]:
    """Get text from all td and th cells in a row, in document order."""
    cells = []
    for tag in tr.find_all(["td", "th"]):
        cells.append(tag.get_text(strip=True))
    return cells


def get_header_text(table) -> list[str]:
    """Get column header texts from a table's thead."""
    thead = table.find("thead")
    if not thead:
        return []
    return [th.get_text(strip=True) for th in thead.find_all("th")]


def table_has_headers(table, required: set) -> bool:
    headers = set(get_header_text(table))
    return required.issubset(headers)


def parse_rushing(table) -> dict[str, dict]:
    """Parse rushing table. Returns {name: stats}."""
    headers = get_header_text(table)
    # Expected: #, Player, GP, ATT, Gain, Loss, Net, AVG, TD, Long, AVG/G
    idx = {h: i for i, h in enumerate(headers)}
    players = {}
    for tr in (table.find("tbody") or table).find_all("tr"):
        cells = parse_row_cells(tr)
        if len(cells) < 5:
            continue
        name = _extract_name(cells)
        if not name:
            continue
        players[name] = {
            "games":     safe_int(cells[idx["GP"]]) if "GP" in idx and idx["GP"] < len(cells) else None,
            "rush_att":  safe_int(cells[idx["ATT"]]) if "ATT" in idx and idx["ATT"] < len(cells) else None,
            "rush_yards": safe_int(cells[idx.get("Net", idx.get("YDS", -1))]) if idx.get("Net", -1) < len(cells) else None,
            "rush_td":   safe_int(cells[idx["TD"]]) if "TD" in idx and idx["TD"] < len(cells) else None,
            "rush_avg":  safe_float(cells[idx["AVG"]]) if "AVG" in idx and idx["AVG"] < len(cells) else None,
            "rush_long": safe_int(cells[idx["Long"]]) if "Long" in idx and idx["Long"] < len(cells) else None,
            "rush_ypg":  safe_float(cells[idx["AVG/G"]]) if "AVG/G" in idx and idx["AVG/G"] < len(cells) else None,
        }
    return players


def parse_passing(table) -> dict[str, dict]:
    """Parse passing table."""
    headers = get_header_text(table)
    idx = {h: i for i, h in enumerate(headers)}
    players = {}
    for tr in (table.find("tbody") or table).find_all("tr"):
        cells = parse_row_cells(tr)
        if len(cells) < 5:
            continue
        name = _extract_name(cells)
        if not name:
            continue
        # Handle % vs PCT column
        pct_key = "%" if "%" in idx else "PCT"
        players[name] = {
            "games":      safe_int(cells[idx["GP"]]) if "GP" in idx and idx["GP"] < len(cells) else None,
            "pass_comp":  safe_int(cells[idx["COMP"]]) if "COMP" in idx and idx["COMP"] < len(cells) else None,
            "pass_att":   safe_int(cells[idx["ATT"]]) if "ATT" in idx and idx["ATT"] < len(cells) else None,
            "pass_yards": safe_int(cells[idx["YDS"]]) if "YDS" in idx and idx["YDS"] < len(cells) else None,
            "pass_td":    safe_int(cells[idx["TD"]]) if "TD" in idx and idx["TD"] < len(cells) else None,
            "pass_int":   safe_int(cells[idx["INT"]]) if "INT" in idx and idx["INT"] < len(cells) else None,
            "pass_pct":   safe_float(cells[idx[pct_key]]) if pct_key in idx and idx[pct_key] < len(cells) else None,
            "pass_rating": safe_float(cells[idx["Rating"]]) if "Rating" in idx and idx["Rating"] < len(cells) else None,
            "pass_long":  safe_int(cells[idx["Long"]]) if "Long" in idx and idx["Long"] < len(cells) else None,
            "pass_ypg":   safe_float(cells[idx["AVG/G"]]) if "AVG/G" in idx and idx["AVG/G"] < len(cells) else None,
        }
    return players


def parse_receiving(table) -> dict[str, dict]:
    """Parse receiving table."""
    headers = get_header_text(table)
    idx = {h: i for i, h in enumerate(headers)}
    players = {}
    for tr in (table.find("tbody") or table).find_all("tr"):
        cells = parse_row_cells(tr)
        if len(cells) < 4:
            continue
        name = _extract_name(cells)
        if not name:
            continue
        # NO = receptions
        rec_key = "NO" if "NO" in idx else "REC"
        players[name] = {
            "games":      safe_int(cells[idx["GP"]]) if "GP" in idx and idx["GP"] < len(cells) else None,
            "receptions": safe_int(cells[idx[rec_key]]) if rec_key in idx and idx[rec_key] < len(cells) else None,
            "rec_yards":  safe_int(cells[idx["YDS"]]) if "YDS" in idx and idx["YDS"] < len(cells) else None,
            "rec_td":     safe_int(cells[idx["TD"]]) if "TD" in idx and idx["TD"] < len(cells) else None,
            "rec_avg":    safe_float(cells[idx["AVG"]]) if "AVG" in idx and idx["AVG"] < len(cells) else None,
            "rec_long":   safe_int(cells[idx["Long"]]) if "Long" in idx and idx["Long"] < len(cells) else None,
            "rec_ypg":    safe_float(cells[idx["AVG/G"]]) if "AVG/G" in idx and idx["AVG/G"] < len(cells) else None,
        }
    return players


def parse_defense(table) -> dict[str, dict]:
    """Parse defense/tackle table."""
    headers = get_header_text(table)
    idx = {h: i for i, h in enumerate(headers)}
    players = {}
    for tr in (table.find("tbody") or table).find_all("tr"):
        cells = parse_row_cells(tr)
        if len(cells) < 5:
            continue
        name = _extract_name(cells)
        if not name:
            continue

        # TFL-YDS and Sacks-YDS may be combined cells like "5.0-20"
        # We parse solo number from the combined string
        def parse_hyphen_left(key) -> Optional[float]:
            if key not in idx:
                return None
            i = idx[key]
            if i >= len(cells):
                return None
            v = cells[i].split("-")[0].strip()
            return safe_float(v)

        players[name] = {
            "games":         safe_int(cells[idx["GP"]]) if "GP" in idx and idx["GP"] < len(cells) else None,
            "solo_tackles":  safe_int(cells[idx["Solo"]]) if "Solo" in idx and idx["Solo"] < len(cells) else None,
            "ast_tackles":   safe_int(cells[idx["ASST"]]) if "ASST" in idx and idx["ASST"] < len(cells) else None,
            "tot_tackles":   safe_int(cells[idx["TOT"]]) if "TOT" in idx and idx["TOT"] < len(cells) else None,
            "tfl":           parse_hyphen_left("TFL-YDS"),
            "sacks":         parse_hyphen_left("Sacks-YDS"),
            "def_int":       safe_int(cells[idx["INT"]]) if "INT" in idx and idx["INT"] < len(cells) else None,
            "passes_defended": safe_int(cells[idx["BU"]]) if "BU" in idx and idx["BU"] < len(cells) else None,
            "qb_hurries":    safe_int(cells[idx["QBH"]]) if "QBH" in idx and idx["QBH"] < len(cells) else None,
            "fumble_rec":    safe_int(cells[idx["FR"]]) if "FR" in idx and idx["FR"] < len(cells) else None,
            "forced_fumbles": safe_int(cells[idx["FF"]]) if "FF" in idx and idx["FF"] < len(cells) else None,
        }
    return players


def _extract_name(cells: list[str]) -> Optional[str]:
    """
    Extract clean player name from row cells.
    Sidearm football: cells[1] is the player name cell.
    Format: "Last, First" or "First Last" or "Last, First##Last, First" (dupe with jersey).
    Skip rows with Team/Totals/Opponents.
    """
    if len(cells) < 2:
        return None
    raw = cells[1].strip()
    if not raw:
        return None
    # Skip totals/team rows (e.g. "Team", "Totals", "TeamTMTeam", "OpponentsOPP...")
    clean_check = re.sub(r"[A-Z]{2,4}", "", raw).strip()  # strip abbreviation suffixes
    if re.match(r"^(Team|Totals?|Opponents?)$", clean_check, re.I):
        return None
    if re.match(r"^(Team|Totals?|Opponents?)", raw, re.I) and len(raw) < 30:
        return None
    # Strip jersey# duplication (e.g., "Smith, John9Smith, John")
    m = re.search(r"(\d+)", raw)
    if m:
        idx_num = m.start()
        if idx_num > 0 and not raw[idx_num - 1].isdigit():
            before = raw[:idx_num].strip()
            after  = raw[idx_num + len(m.group()):].strip()
            # If before and after are similar, it's a duplicate
            if before and after and (before.lower() in after.lower() or after.lower() in before.lower()):
                raw = before
    # Convert "Last, First" → "First Last"
    if "," in raw:
        parts = raw.split(",", 1)
        return f"{parts[1].strip()} {parts[0].strip()}"
    return raw.strip() if raw.strip() else None


def make_naia_id(school_slug: str, name: str) -> str:
    slug = re.sub(r"[^a-z0-9]", "", name.lower())
    return f"naia-fb:{school_slug}-{slug}"


def parse_football_page(soup: BeautifulSoup, school_name: str,
                        conference: str, school_slug: str) -> list[dict]:
    """
    Parse a Sidearm football stats page.
    Returns list of player dicts with merged stats across all 4 tables.
    """
    tables = soup.find_all("table")
    if not tables:
        return []

    # Identify tables by header keywords
    tbl_rush = tbl_pass = tbl_recv = tbl_def = None
    for tbl in tables:
        headers = set(get_header_text(tbl))
        if {"ATT", "Net", "TD", "Long"}.issubset(headers) or {"ATT", "Gain", "Loss"}.issubset(headers):
            if tbl_rush is None:
                tbl_rush = tbl
        elif {"COMP", "ATT", "YDS", "TD"}.issubset(headers) and "INT" in headers:
            if tbl_pass is None:
                tbl_pass = tbl
        elif {"NO", "YDS", "AVG", "TD"}.issubset(headers) or {"REC", "YDS", "TD"}.issubset(headers):
            if tbl_recv is None:
                tbl_recv = tbl
        elif {"Solo", "ASST", "TOT"}.issubset(headers):
            if tbl_def is None:
                tbl_def = tbl

    if not any([tbl_rush, tbl_pass, tbl_recv, tbl_def]):
        return []

    # Extract real school name from page
    real_name = extract_school_name(soup, school_name)

    # Parse all tables
    rush_data = parse_rushing(tbl_rush) if tbl_rush else {}
    pass_data = parse_passing(tbl_pass) if tbl_pass else {}
    recv_data = parse_receiving(tbl_recv) if tbl_recv else {}
    def_data  = parse_defense(tbl_def) if tbl_def else {}

    # Merge by player name
    all_names = set(rush_data) | set(pass_data) | set(recv_data) | set(def_data)
    results = []

    for name in all_names:
        merged: dict = {
            "name":       name,
            "school":     real_name,
            "conference": conference,
            "slug":       school_slug,
        }
        # Determine games from any table (take max)
        games = None
        for src in [rush_data, pass_data, recv_data, def_data]:
            g = src.get(name, {}).get("games")
            if g and (games is None or g > games):
                games = g
        merged["games"] = games

        # Merge all stat dicts
        for src in [rush_data, pass_data, recv_data, def_data]:
            for k, v in src.get(name, {}).items():
                if k != "games" and v is not None and k not in merged:
                    merged[k] = v

        results.append(merged)

    return results


# ── Main load ──────────────────────────────────────────────────────────────────

def load_school(conn, school: dict, dry_run: bool) -> int:
    name       = school["name"]
    slug       = school.get("slug", "")
    conf       = school.get("conference", "")
    base_url   = school.get("url", "").rstrip("/")
    if not base_url:
        return 0

    url  = base_url + STATS_PATH
    soup = fetch_page(url)
    if soup is None:
        return 0

    players = parse_football_page(soup, name, conf, slug)
    if not players:
        return 0

    if dry_run:
        print(f"  [dry] {name}: {len(players)} players")
        return len(players)

    team_id = upsert_team(conn, players[0]["school"], conf, slug)
    written = 0
    for rec in players:
        naia_id   = make_naia_id(slug, rec["name"])
        player_id = upsert_player(conn, naia_id, rec["name"], None, team_id)
        stat_keys = [
            "games",
            "rush_att", "rush_yards", "rush_td", "rush_avg", "rush_long", "rush_ypg",
            "pass_comp", "pass_att", "pass_yards", "pass_td", "pass_int", "pass_pct",
            "pass_rating", "pass_long", "pass_ypg",
            "receptions", "rec_yards", "rec_td", "rec_avg", "rec_long", "rec_ypg",
            "solo_tackles", "ast_tackles", "tot_tackles", "tfl", "sacks",
            "def_int", "passes_defended", "qb_hurries", "fumble_rec", "forced_fumbles",
        ]
        stats = {k: rec.get(k) for k in stat_keys if rec.get(k) is not None}
        upsert_stats(conn, player_id, stats)
        written += 1

    conn.commit()
    return written


# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--test", type=int, default=0, metavar="N",
                    help="only scrape first N schools")
    ap.add_argument("--schools-file", type=Path, default=None,
                    help="override school list JSON (default: naia_schools.json)")
    ap.add_argument("--football-schools", action="store_true",
                    help="use naia_football_schools.json instead of naia_schools.json")
    args = ap.parse_args()

    if args.schools_file:
        schools_path = args.schools_file
    elif args.football_schools:
        schools_path = _FOOTBALL_SCHOOLS_FILE
    else:
        schools_path = _SCHOOLS_FILE

    schools = json.loads(schools_path.read_text())
    if args.test:
        schools = schools[:args.test]

    print(f"\n=== NAIA Football Scraper (season={SEASON}) ===")
    print(f"  Schools: {len(schools)}  |  dry_run={args.dry_run}")
    print()

    conn = get_conn() if not args.dry_run else None
    try:
        if conn:
            ensure_tables(conn)
            conn.commit()

        ok = skip = total = 0
        for i, school in enumerate(schools, 1):
            n = load_school(conn, school, args.dry_run)
            total += n
            if n > 0:
                ok += 1
                print(f"  [{i:3d}/{len(schools)}] {school['name']:<40} {n:3d} players")
            else:
                skip += 1

        print(f"\n  Done: {ok} schools with data, {skip} skipped, {total} players total")

        if conn and not args.dry_run:
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) AS n FROM naia_football_teams")
            nt = cur.fetchone()["n"]
            cur.execute("SELECT COUNT(*) AS n FROM naia_football_players")
            np_ = cur.fetchone()["n"]
            cur.execute("SELECT COUNT(*) AS n FROM naia_football_stats WHERE season=%s", (SEASON,))
            ns = cur.fetchone()["n"]
            conn.commit()
            print(f"\n=== DB: {nt} teams, {np_} players, {ns} stat rows ===")

    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    main()
