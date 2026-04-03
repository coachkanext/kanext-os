#!/usr/bin/env python3.12
"""
NCAA D2 + D3 Football Roster Scraper — 2024-25 Season
=======================================================
Source: Individual school Sidearm Sports athletics sites
School list: web3.ncaa.org/directory/api/directory/memberList (division=2/3, sportCode=MFB)
Roster path: {school_url}/sports/football/roster

Parses Sidearm roster table:
  #, Full Name, Class, Ht., Wt., Pos., Hometown, High School

DB tables written:
  ncaa_fb_teams    — D2/D3 football teams
  ncaa_fb_players  — roster players

Usage:
    python3.12 ncaa_fb_roster_scraper.py d2           # D2 only  (~161 schools)
    python3.12 ncaa_fb_roster_scraper.py d3           # D3 only  (~239 schools)
    python3.12 ncaa_fb_roster_scraper.py all          # both divisions
    python3.12 ncaa_fb_roster_scraper.py d2 --test 5  # first 5 D2 schools
    python3.12 ncaa_fb_roster_scraper.py d2 --start 50 # resume from offset 50
"""
from __future__ import annotations

import argparse
import json
import math
import os
import re
import time
from pathlib import Path
from typing import Optional

import httpx
import psycopg
from bs4 import BeautifulSoup
from psycopg.rows import dict_row

# ── Config ──────────────────────────────────────────────────────────────────

DB_CONFIG = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}
SEASON    = "2024-25"
DELAY     = 1.2
TIMEOUT   = 18

NCAA_DIR_TMPL = (
    "https://web3.ncaa.org/directory/api/directory/memberList"
    "?type=12&division={div}&sportCode=MFB"
)
DIR_CACHE = {
    "d2": "/tmp/ncaa_d2_football_dir.json",
    "d3": "/tmp/ncaa_d3_football_dir.json",
}

ROSTER_PATHS = [
    "/sports/football/roster",
    "/sports/football/roster/2024-25",
    "/sports/football/roster/2024",
]

HTTP_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

# ── DB ───────────────────────────────────────────────────────────────────────

CREATE_SQL = """
CREATE TABLE IF NOT EXISTS ncaa_fb_teams (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ncaa_org_id INT,
    name        TEXT NOT NULL,
    level       TEXT NOT NULL,   -- 'd2' or 'd3'
    conference  TEXT,
    athletic_url TEXT,
    season      TEXT NOT NULL DEFAULT '2024-25',
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE (name, level, season)
);

CREATE TABLE IF NOT EXISTS ncaa_fb_players (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_key  TEXT NOT NULL UNIQUE,   -- '{level}:{org_id}:{name_slug}'
    full_name   TEXT NOT NULL,
    jersey      TEXT,
    position    TEXT,
    class_year  TEXT,
    height      TEXT,
    weight      TEXT,
    hometown    TEXT,
    high_school TEXT,
    team_id     UUID REFERENCES ncaa_fb_teams(id),
    season      TEXT NOT NULL DEFAULT '2024-25',
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);
"""


def get_conn():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)


def ensure_tables(conn):
    conn.execute(CREATE_SQL)
    conn.commit()


def upsert_team(conn, org_id: int, name: str, level: str,
                conference: str, url: str) -> str:
    row = conn.execute(
        """
        INSERT INTO ncaa_fb_teams (ncaa_org_id, name, level, conference, athletic_url, season)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (name, level, season) DO UPDATE SET
            ncaa_org_id  = COALESCE(EXCLUDED.ncaa_org_id, ncaa_fb_teams.ncaa_org_id),
            conference   = COALESCE(EXCLUDED.conference,  ncaa_fb_teams.conference),
            athletic_url = COALESCE(EXCLUDED.athletic_url, ncaa_fb_teams.athletic_url),
            updated_at   = now()
        RETURNING id
        """,
        (org_id, name, level, conference, url, SEASON),
    ).fetchone()
    return str(row["id"])


def upsert_player(conn, player_key: str, full_name: str, team_id: str,
                  jersey: str, position: str, class_year: str,
                  height: str, weight: str, hometown: str, high_school: str):
    conn.execute(
        """
        INSERT INTO ncaa_fb_players
            (player_key, full_name, team_id, season, jersey, position, class_year,
             height, weight, hometown, high_school)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (player_key) DO UPDATE SET
            full_name   = EXCLUDED.full_name,
            position    = COALESCE(NULLIF(EXCLUDED.position,''),   ncaa_fb_players.position),
            class_year  = COALESCE(NULLIF(EXCLUDED.class_year,''), ncaa_fb_players.class_year),
            height      = COALESCE(NULLIF(EXCLUDED.height,''),     ncaa_fb_players.height),
            weight      = COALESCE(NULLIF(EXCLUDED.weight,''),     ncaa_fb_players.weight),
            hometown    = COALESCE(NULLIF(EXCLUDED.hometown,''),   ncaa_fb_players.hometown),
            high_school = COALESCE(NULLIF(EXCLUDED.high_school,''),ncaa_fb_players.high_school),
            updated_at  = now()
        """,
        (player_key, full_name, team_id, SEASON, jersey or None,
         position or None, class_year or None, height or None,
         weight or None, hometown or None, high_school or None),
    )


# ── Directory ────────────────────────────────────────────────────────────────

def get_directory(div: str) -> list[dict]:
    cache = DIR_CACHE[div]
    if os.path.exists(cache):
        with open(cache) as f:
            return json.load(f)
    div_num = "2" if div == "d2" else "3"
    r = httpx.get(NCAA_DIR_TMPL.format(div=div_num), headers=HTTP_HEADERS, timeout=30)
    raw = r.json()
    entries = [x for x in raw if x.get("division") == int(div_num)
               and x.get("athleticWebUrl")]
    with open(cache, "w") as f:
        json.dump(entries, f, indent=2)
    return entries


def normalise_url(raw: str) -> str:
    if not raw:
        return ""
    raw = raw.strip().rstrip("/")
    if raw.startswith("http"):
        return raw
    return "https://" + raw


# ── Fetch + parse ────────────────────────────────────────────────────────────

def fetch_roster_page(base_url: str) -> Optional[BeautifulSoup]:
    for path in ROSTER_PATHS:
        url = base_url + path
        try:
            r = httpx.get(url, headers=HTTP_HEADERS, timeout=TIMEOUT, follow_redirects=True)
            time.sleep(DELAY)
            if r.status_code == 200 and len(r.text) > 2000 and "Just a moment" not in r.text:
                return BeautifulSoup(r.text, "html.parser")
        except Exception:
            time.sleep(DELAY)
    return None


def parse_roster_table(soup: BeautifulSoup) -> list[dict]:
    """
    Find the Sidearm roster table (headers: #/Full Name/Class/Ht./Wt./Pos.)
    and return a list of player dicts.
    """
    # Match name column case-insensitively
    NAME_VARIANTS = {"full name", "name"}

    for table in soup.find_all("table"):
        thead = table.find("thead")
        if not thead:
            continue
        raw_headers = [th.get_text(strip=True) for th in thead.find_all("th")]
        # Normalize: lowercase lookup → original header text
        lower_map = {h.lower(): h for h in raw_headers}
        # Find name column key (case-insensitive)
        name_col_raw = None
        for variant in NAME_VARIANTS:
            if variant in lower_map:
                name_col_raw = lower_map[variant]
                break
        if not name_col_raw:
            continue
        # Must have at least one football-specific column to distinguish from coaches table
        FOOTBALL_COLS = {"#", "pos.", "ht.", "wgt.", "class", "position", "hgt.", "wt."}
        lower_set = set(lower_map.keys())
        if not FOOTBALL_COLS.intersection(lower_set):
            continue
        # Build idx from normalized (title-case) headers
        def norm(h):
            # Normalize "NAME"→"Name", "POS."→"Pos.", "HGT."→"Ht.", etc.
            m = {"NAME": "Name", "FULL NAME": "Full Name",
                 "POS.": "Pos.", "POSITION": "Position",
                 "HGT.": "Ht.", "WGT.": "Wt.", "CLASS": "Class",
                 "HOMETOWN": "Hometown", "HIGH SCHOOL": "High School"}
            return m.get(h.upper(), h)
        headers = [norm(h) for h in raw_headers]
        idx = {h: i for i, h in enumerate(headers)}
        players = []
        tbody = table.find("tbody") or table
        for tr in tbody.find_all("tr"):
            cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
            if len(cells) < 2:
                continue
            # Get full name — prefer "Full Name" col, fall back to "Name"
            name_key = "Full Name" if "Full Name" in idx else "Name"
            if name_key not in idx or idx[name_key] >= len(cells):
                continue
            full_name = cells[idx[name_key]].strip()
            if not full_name or full_name.lower() in ("name", "full name"):
                continue
            # Skip totals/team rows
            if re.match(r"^(Team|Totals?)", full_name, re.I):
                continue

            def get(key):
                i = idx.get(key, -1)
                return cells[i].strip() if 0 <= i < len(cells) else ""

            players.append({
                "full_name":   full_name,
                "jersey":      get("#"),
                "class_year":  get("Class"),
                "height":      get("Ht."),
                "weight":      get("Wt."),
                "position":    get("Pos.") or get("Position"),
                "hometown":    get("Hometown"),
                "high_school": get("High School"),
            })
        if players:
            return players
    return []


def make_player_key(level: str, org_id: int, name: str) -> str:
    slug = re.sub(r"[^a-z0-9]", "", name.lower())
    return f"{level}:{org_id}:{slug}"


# ── Main ─────────────────────────────────────────────────────────────────────

def run_division(div: str, conn, start: int = 0, limit: int = 0, dry_run: bool = False):
    entries = get_directory(div)
    if limit:
        entries = entries[start:start + limit]
    else:
        entries = entries[start:]

    print(f"\n[NCAA {div.upper()} Football Rosters] {len(entries)} schools")

    ok = skip = total = 0
    for i, entry in enumerate(entries, start + 1):
        org_id  = entry.get("orgId", 0)
        name    = entry.get("nameOfficial", "").strip()
        conf    = entry.get("conferenceName", "").strip()
        raw_url = entry.get("athleticWebUrl", "")
        base_url = normalise_url(raw_url)
        if not base_url:
            skip += 1
            continue

        soup = fetch_roster_page(base_url)
        if soup is None:
            skip += 1
            continue

        players = parse_roster_table(soup)
        if not players:
            skip += 1
            continue

        if dry_run:
            print(f"  [{i:3d}] {name}: {len(players)} players [dry]")
            ok += 1
            total += len(players)
            continue

        team_id = upsert_team(conn, org_id, name, div, conf, base_url)
        for p in players:
            pk = make_player_key(div, org_id, p["full_name"])
            upsert_player(conn, pk, p["full_name"], team_id,
                          p["jersey"], p["position"], p["class_year"],
                          p["height"], p["weight"], p["hometown"], p["high_school"])
        conn.commit()
        ok += 1
        total += len(players)
        print(f"  [{i:3d}/{start+len(entries)}] {name:<45} {len(players):3d} players")

    print(f"\n  Done: {ok} schools, {skip} skipped, {total} players")
    return total


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("div", choices=["d2", "d3", "all"], default="d2", nargs="?")
    ap.add_argument("--test", type=int, default=0, metavar="N")
    ap.add_argument("--start", type=int, default=0, metavar="N")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    divs = ["d2", "d3"] if args.div == "all" else [args.div]

    conn = None if args.dry_run else get_conn()
    try:
        if conn:
            ensure_tables(conn)

        grand_total = 0
        for div in divs:
            n = run_division(div, conn, start=args.start, limit=args.test, dry_run=args.dry_run)
            grand_total += n

        if conn:
            for div in divs:
                r = conn.execute(
                    "SELECT COUNT(*) AS n FROM ncaa_fb_teams WHERE level=%s", (div,)
                ).fetchone()
                rp = conn.execute(
                    """SELECT COUNT(p.id) AS n FROM ncaa_fb_players p
                       JOIN ncaa_fb_teams t ON t.id=p.team_id WHERE t.level=%s""",
                    (div,)
                ).fetchone()
                print(f"  DB {div.upper()}: {r['n']} teams, {rp['n']} players")
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    main()
