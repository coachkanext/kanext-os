#!/usr/bin/env python3.12
"""
KaNeXT NJCAA Regional Football Stats Scraper
============================================
Source: 4 accessible NJCAA regional sites
  njcaaregion5.com      (r5)  — 2 teams
  njcaaregion14.com     (r14) — 8 teams
  region15athletics.com (r15) — 2 teams
  njcaaregion19.com     (r19) — 2 teams

Per-team stats via PrestoSports tmpl endpoint:
  {base}/sports/fball/2024-25/teams/{slug}?tmpl=brief-category-template&pos={cat}&r=0

Headers required (AWS WAF bypass):
  Origin: {base}
  Referer: {base}/sports/fball/2024-25/teams/{slug}
  Sec-Fetch-Site: same-origin

Categories: qb (passing), rb (rushing), wr (receiving), k (kicking),
            p (punting), kr (returns), allp (all-purpose), pts (scoring), d (defense)

DB tables written:
  njcaa_reg_fb_teams   — teams from regional sites
  njcaa_reg_fb_players — players
  njcaa_reg_fb_stats   — full stat rows (all categories merged)

Usage:
    python3.12 njcaa_regional_fb_scraper.py
    python3.12 njcaa_regional_fb_scraper.py --dry-run
    python3.12 njcaa_regional_fb_scraper.py --region r14
    python3.12 njcaa_regional_fb_scraper.py --team ciscocollege
"""
from __future__ import annotations

import argparse
import re
import time
from typing import Optional

import httpx
import psycopg
from bs4 import BeautifulSoup
from psycopg.rows import dict_row

# ── Config ────────────────────────────────────────────────────────────────────

DB_CONFIG = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}
SEASON    = "2024-25"
DELAY     = 1.0    # seconds between requests
TIMEOUT   = 20

REGIONS = [
    ("r5",  "https://njcaaregion5.com"),
    ("r14", "https://njcaaregion14.com"),
    ("r15", "https://region15athletics.com"),
    ("r19", "https://njcaaregion19.com"),
]

# Hardcoded slugs — bypasses WAF-blocked listing pages
HARDCODED_TEAMS: dict[str, list[dict]] = {
    "r5": [
        {"slug": "ciscocollege",              "name": "Cisco College"},
        {"slug": "newmexicomilitaryinstitute", "name": "New Mexico Military Institute"},
    ],
    "r14": [
        {"slug": "blinncollege",                   "name": "Blinn College"},
        {"slug": "ciscocollege",                   "name": "Cisco College"},
        {"slug": "kilgorecollege",                 "name": "Kilgore College"},
        {"slug": "navarrocollege",                 "name": "Navarro College"},
        {"slug": "newmexicomilitaryinstitute",      "name": "New Mexico Military Institute"},
        {"slug": "northeasternoklahomaamcollege",   "name": "Northeastern Oklahoma A&M College"},
        {"slug": "trinityvalleycommunitycollege",   "name": "Trinity Valley Community College"},
        {"slug": "tylerjuniorcollege",             "name": "Tyler Junior College"},
    ],
    "r15": [
        {"slug": "monroeuniversity",          "name": "Monroe University"},
        {"slug": "nassaucommunitycollege",    "name": "Nassau Community College"},
    ],
    "r19": [
        {"slug": "lackawannacollege",            "name": "Lackawanna College"},
        {"slug": "sussexcountycommunitycollege", "name": "Sussex County Community College"},
    ],
}

# Stat categories: (pos param, col_map)
# col_map: list of (col_index, db_field, type)  — 0-indexed, first 4 cols are #/Name/Yr/Pos
CATEGORIES = {
    "qb": [   # Passing
        (4,  "pass_gp",    "int"),
        (5,  "completions","int"),
        (6,  "pass_att",   "int"),
        (7,  "comp_pct",   "float"),
        (8,  "pass_yds",   "int"),
        (9,  "pass_ypg",   "float"),
        (10, "pass_ya",    "float"),
        (11, "pass_tds",   "int"),
        (12, "pass_int",   "int"),
        (13, "pass_lg",    "int"),
        (14, "pass_effic", "float"),
    ],
    "rb": [   # Rushing
        (4,  "rush_gp",   "int"),
        (5,  "rush_att",  "int"),
        (6,  "rush_yds",  "int"),
        (7,  "rush_ypg",  "float"),
        (8,  "rush_avg",  "float"),
        (9,  "rush_tds",  "int"),
        (10, "rush_lg",   "int"),
        (11, "fumbles",   "int"),
        (12, "fum_lost",  "int"),
    ],
    "wr": [   # Receiving
        (4,  "rec_gp",    "int"),
        (5,  "receptions","int"),
        (6,  "rec_pg",    "float"),
        (7,  "rec_yds",   "int"),
        (8,  "rec_ypg",   "float"),
        (9,  "rec_avg",   "float"),
        (10, "rec_tds",   "int"),
        (11, "rec_lg",    "int"),
    ],
    "k": [    # Kicking
        (4,  "k_gp",       "int"),
        (5,  "fgm",        "int"),
        (6,  "fga",        "int"),
        (7,  "fg_pct",     "float"),
        (8,  "fg_lg",      "int"),
        (9,  "xpm",        "int"),
        (10, "xpa",        "int"),
        (11, "xp_pct",     "float"),
        (12, "kicking_pts","int"),
    ],
    "p": [    # Punting
        (4,  "p_gp",       "int"),
        (5,  "punts",      "int"),
        (6,  "punt_yds",   "int"),
        (7,  "punt_avg",   "float"),
        (8,  "punt_lg",    "int"),
        (9,  "in20",       "int"),
        (10, "fair_catches","int"),
        (11, "touchbacks", "int"),
        (12, "punt_blk",   "int"),
    ],
    "kr": [   # Returns (kick + punt)
        (4,  "kr",         "int"),
        (5,  "kr_yds",     "int"),
        (6,  "kr_avg",     "float"),
        (7,  "kr_tds",     "int"),
        (8,  "kr_lg",      "int"),
        (9,  "pr",         "int"),
        (10, "pr_yds",     "int"),
        (11, "pr_avg",     "float"),
        (12, "pr_tds",     "int"),
        (13, "pr_lg",      "int"),
    ],
    "allp": [ # All-purpose
        (4,  "allp_gp",   "int"),
        (5,  "allp_rush", "int"),
        (6,  "allp_rec",  "int"),
        (7,  "allp_pr",   "int"),
        (8,  "allp_kr",   "int"),
        (9,  "allp_yds",  "int"),
        (10, "allp_ypg",  "float"),
    ],
    "pts": [  # Scoring
        (4,  "pts",       "int"),
        (5,  "pts_pg",    "float"),
        (6,  "pts_rush",  "int"),
        (7,  "pts_rec",   "int"),
        (8,  "pts_kr",    "int"),
        (9,  "pts_pr",    "int"),
        (10, "pts_int",   "int"),
        (11, "pts_fum",   "int"),
        (12, "pts_xpm",   "int"),
        (13, "pts_fgm",   "int"),
        (14, "pts_2pt",   "int"),
        (15, "pts_misc",  "int"),
    ],
    "d": [    # Defense
        (4,  "d_gp",        "int"),
        (5,  "solo_tkl",    "int"),
        (6,  "asst_tkl",    "int"),
        (7,  "total_tkl",   "int"),
        (8,  "tkl_pg",      "float"),
        (9,  "sacks",       "float"),
        (10, "sack_yds",    "float"),
        (11, "tfl",         "float"),
        (12, "tfl_yds",     "float"),
        (13, "ff",          "int"),
        (14, "fr",          "int"),
        (15, "fr_yds",      "int"),
        (16, "def_int",     "int"),
        (17, "def_int_yds", "int"),
        (18, "brup",        "int"),
        (19, "blk",         "int"),
    ],
}

# All stat DB fields (for CREATE TABLE and INSERT)
ALL_STAT_FIELDS = sorted({field for cols in CATEGORIES.values() for _, field, _ in cols})

# ── DB ────────────────────────────────────────────────────────────────────────

_STAT_COLS_DDL = "\n".join(
    f"    {f}  {'INT' if any(t == 'int' for cols in CATEGORIES.values() for _, fn, t in cols if fn == f) else 'FLOAT'},"
    for f in ALL_STAT_FIELDS
)

CREATE_SQL = f"""
CREATE TABLE IF NOT EXISTS njcaa_reg_fb_teams (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT,
    region      TEXT,
    conference  TEXT,
    season      TEXT NOT NULL DEFAULT '2024-25',
    created_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE (slug, region, season)
);

CREATE TABLE IF NOT EXISTS njcaa_reg_fb_players (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_key TEXT NOT NULL UNIQUE,
    full_name  TEXT NOT NULL,
    jersey     TEXT,
    position   TEXT,
    class_year TEXT,
    team_id    UUID REFERENCES njcaa_reg_fb_teams(id),
    season     TEXT NOT NULL DEFAULT '2024-25',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS njcaa_reg_fb_stats (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES njcaa_reg_fb_players(id),
    season    TEXT NOT NULL DEFAULT '2024-25',
{_STAT_COLS_DDL}
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (player_id, season)
);
"""

_UPSERT_STAT_FIELDS = ", ".join(ALL_STAT_FIELDS)
_UPSERT_STAT_PLACEHOLDERS = ", ".join(["%s"] * len(ALL_STAT_FIELDS))
_UPSERT_STAT_UPDATES = "\n        ".join(
    f"{f} = COALESCE(EXCLUDED.{f}, njcaa_reg_fb_stats.{f}),"
    for f in ALL_STAT_FIELDS
)


def get_conn():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)


def ensure_tables(conn):
    conn.execute(CREATE_SQL)
    conn.commit()


def upsert_team(conn, slug: str, name: str, region: str) -> str:
    row = conn.execute("""
        INSERT INTO njcaa_reg_fb_teams (slug, name, region, season)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (slug, region, season) DO UPDATE SET
            name = COALESCE(EXCLUDED.name, njcaa_reg_fb_teams.name)
        RETURNING id
    """, (slug, name, region, SEASON)).fetchone()
    return str(row["id"])


def upsert_player(conn, player_key: str, full_name: str, team_id: str,
                  jersey: str, position: str, class_year: str) -> str:
    row = conn.execute("""
        INSERT INTO njcaa_reg_fb_players
            (player_key, full_name, team_id, jersey, position, class_year, season)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (player_key) DO UPDATE SET
            full_name  = EXCLUDED.full_name,
            position   = COALESCE(NULLIF(EXCLUDED.position,''),   njcaa_reg_fb_players.position),
            class_year = COALESCE(NULLIF(EXCLUDED.class_year,''), njcaa_reg_fb_players.class_year),
            updated_at = now()
        RETURNING id
    """, (player_key, full_name, team_id,
          jersey or None, position or None, class_year or None, SEASON)).fetchone()
    return str(row["id"])


def upsert_stats(conn, player_id: str, stats: dict):
    vals = [stats.get(f) for f in ALL_STAT_FIELDS]
    conn.execute(f"""
        INSERT INTO njcaa_reg_fb_stats (player_id, season, {_UPSERT_STAT_FIELDS})
        VALUES (%s, %s, {_UPSERT_STAT_PLACEHOLDERS})
        ON CONFLICT (player_id, season) DO UPDATE SET
        {_UPSERT_STAT_UPDATES}
            updated_at = now()
    """, [player_id, SEASON] + vals)


# ── HTTP ──────────────────────────────────────────────────────────────────────

BASE_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
}


def get_page(url: str, extra_headers: dict = None) -> Optional[BeautifulSoup]:
    hdrs = {**BASE_HEADERS, **(extra_headers or {})}
    try:
        r = httpx.get(url, headers=hdrs, timeout=TIMEOUT, follow_redirects=True)
        time.sleep(DELAY)
        if r.status_code == 200 and len(r.text) > 500 and "Just a moment" not in r.text:
            return BeautifulSoup(r.text, "html.parser")
        return None
    except Exception:
        time.sleep(DELAY)
        return None


def get_teams(base: str) -> list[dict]:
    """Return list of {slug, name} for all teams on this region's football page."""
    url  = f"{base}/sports/fball/{SEASON}/teams"
    soup = get_page(url)
    if not soup:
        return []
    links = soup.find_all("a", href=lambda h: h and f"/sports/fball/{SEASON}/teams/" in h)
    seen  = set()
    teams = []
    for a in links:
        m = re.search(r"/teams/([^/?#]+)", a["href"])
        if not m:
            continue
        slug = m.group(1)
        if slug in seen:
            continue
        seen.add(slug)
        name = " ".join(a.get_text(strip=True).split()) or slug.replace("-", " ").title()
        teams.append({"slug": slug, "name": name})
    return teams


def get_team_stats(base: str, team_slug: str, pos: str) -> Optional[BeautifulSoup]:
    """Fetch per-team stats fragment for a given category (pos param)."""
    tmpl_url = (
        f"{base}/sports/fball/{SEASON}/teams/{team_slug}"
        f"?tmpl=brief-category-template&pos={pos}&r=0"
    )
    extra = {
        "Origin":          base,
        "Referer":         f"{base}/sports/fball/{SEASON}/teams/{team_slug}",
        "Sec-Fetch-Site":  "same-origin",
        "Sec-Fetch-Mode":  "cors",
    }
    return get_page(tmpl_url, extra_headers=extra)


# ── Parse ─────────────────────────────────────────────────────────────────────

def safe_val(raw: str, typ: str):
    raw = raw.strip().replace(",", "").replace("%", "")
    if not raw or raw in ("-", "—", "N/A"):
        return None
    try:
        return int(round(float(raw))) if typ == "int" else float(raw)
    except ValueError:
        return None


def parse_stat_table(soup: BeautifulSoup, pos: str) -> list[dict]:
    """
    Parse a PrestoSports brief-category-template response.
    Columns: #(0), Name(1), Yr(2), Pos(3), stat_cols(4+)
    Last 1-2 rows are team/opponent totals (empty Name cell) — skipped.
    """
    col_map = CATEGORIES.get(pos, [])
    if not col_map:
        return []

    players = []
    for table in soup.find_all("table"):
        rows = table.find_all("tr")
        for row in rows:
            cells = row.find_all(["td", "th"])
            if len(cells) < 4:
                continue

            # Skip header rows
            if row.find("th") and not row.find("td"):
                continue

            # Name is in column 1 — get text from link or cell
            name_cell = cells[1]
            name_a    = name_cell.find("a")
            raw_name  = name_a.get_text(" ", strip=True) if name_a else name_cell.get_text(" ", strip=True)
            full_name = " ".join(raw_name.split())  # collapse whitespace/newlines

            # Skip team total rows (name blank or "Team"/"Opponent")
            if not full_name or re.match(r"^(Team|Opponent|Totals?)", full_name, re.I):
                continue

            jersey     = cells[0].get_text(strip=True)
            class_year = cells[2].get_text(strip=True)
            position   = cells[3].get_text(strip=True)

            stats = {}
            for col_idx, field, typ in col_map:
                if col_idx < len(cells):
                    stats[field] = safe_val(cells[col_idx].get_text(strip=True), typ)

            players.append({
                "full_name":   full_name,
                "jersey":      jersey,
                "class_year":  class_year,
                "position":    position,
                "stats":       stats,
            })

        if players:
            break   # found the right table

    return players


# ── Main ──────────────────────────────────────────────────────────────────────

def make_player_key(region: str, team_slug: str, full_name: str) -> str:
    name_slug = re.sub(r"[^a-z0-9]", "", full_name.lower())
    return f"njcaa:{region}:{team_slug}:{name_slug}"


def run_region(region_code: str, base: str, conn,
               dry_run: bool = False,
               only_team: str = "") -> tuple[int, int]:
    """Scrape all teams in one region. Returns (teams_ok, total_players)."""
    teams = HARDCODED_TEAMS.get(region_code) or get_teams(base)
    if not teams:
        print(f"  [{region_code}] no teams found")
        return 0, 0

    if only_team:
        teams = [t for t in teams if only_team.lower() in t["slug"].lower()]

    ok = total = 0
    for team in teams:
        slug = team["slug"]
        name = team["name"]

        if not dry_run:
            team_id = upsert_team(conn, slug, name, region_code)
            conn.commit()

        # Fetch all stat categories
        all_players: dict[str, dict] = {}   # full_name → merged record

        for pos in CATEGORIES:
            soup = get_team_stats(base, slug, pos)
            if not soup:
                continue
            rows = parse_stat_table(soup, pos)
            for p in rows:
                key = p["full_name"]
                if key not in all_players:
                    all_players[key] = {
                        "full_name":   p["full_name"],
                        "jersey":      p["jersey"],
                        "class_year":  p["class_year"],
                        "position":    p["position"],
                        "stats":       {},
                    }
                # Merge stats (don't overwrite existing non-None values)
                for k, v in p["stats"].items():
                    if v is not None:
                        all_players[key]["stats"].setdefault(k, v)
                # Update identity fields if blank
                for fld in ("jersey", "class_year", "position"):
                    if not all_players[key][fld] and p[fld]:
                        all_players[key][fld] = p[fld]

        if not all_players:
            print(f"  [{region_code}] {name:<42} 0 players (no stat data)")
            continue

        if dry_run:
            print(f"  [{region_code}] {name:<42} {len(all_players):3d} players [dry]")
            ok += 1
            total += len(all_players)
            continue

        for player_data in all_players.values():
            player_key = make_player_key(region_code, slug, player_data["full_name"])
            player_id  = upsert_player(
                conn, player_key, player_data["full_name"], team_id,
                player_data["jersey"], player_data["position"], player_data["class_year"],
            )
            upsert_stats(conn, player_id, player_data["stats"])

        conn.commit()
        ok += 1
        total += len(all_players)
        print(f"  [{region_code}] {name:<42} {len(all_players):3d} players")

    return ok, total


def main():
    ap = argparse.ArgumentParser(description="NJCAA regional football stats scraper")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--region",  type=str, default="", help="Only run specific region (r5/r14/r15/r19)")
    ap.add_argument("--team",    type=str, default="", help="Only run teams matching this slug substring")
    args = ap.parse_args()

    regions = REGIONS
    if args.region:
        regions = [(c, b) for c, b in REGIONS if c == args.region]
        if not regions:
            print(f"Unknown region '{args.region}'. Valid: {[c for c,_ in REGIONS]}")
            return

    print(f"\n=== NJCAA Regional Football Stats Scraper ===")
    print(f"  Season   : {SEASON}")
    print(f"  Regions  : {[c for c,_ in regions]}")
    print(f"  Categories: {list(CATEGORIES.keys())}")
    print()

    conn = get_conn()
    try:
        ensure_tables(conn)
        grand_teams = grand_players = 0

        for region_code, base in regions:
            print(f"\n[{region_code}] {base}")
            t, p = run_region(region_code, base, conn,
                              dry_run=args.dry_run, only_team=args.team)
            grand_teams   += t
            grand_players += p

        print(f"\n{'='*50}")
        print(f"  Total: {grand_teams} teams, {grand_players} players")
        if not args.dry_run:
            r = conn.execute("SELECT COUNT(*) AS n FROM njcaa_reg_fb_teams  WHERE season=%s", (SEASON,)).fetchone()
            p = conn.execute("SELECT COUNT(*) AS n FROM njcaa_reg_fb_players WHERE season=%s", (SEASON,)).fetchone()
            s = conn.execute("SELECT COUNT(*) AS n FROM njcaa_reg_fb_stats   WHERE season=%s", (SEASON,)).fetchone()
            print(f"  DB: {r['n']} teams, {p['n']} players, {s['n']} stat rows")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
