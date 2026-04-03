#!/usr/bin/env python3.12
"""
KaNeXT NJCAA Football Roster Scraper — 2024-25 Season
=======================================================
Source: Individual NJCAA school athletics sites
School list: njcaa_football_schools.json

Supports two platforms:
  Sidearm Sports  — URL: {school_url}/sports/football/roster
                    Parser: standard HTML table (Full Name / # / Pos / Ht. / Year / Hometown)
  PrestoSports    — URL: {school_url}/sports/fball/2025-26/roster
                    Parser: bio links with aria-label names, data-field or class cells

DB tables written:
  njcaa_fb_teams   — NJCAA football teams
  njcaa_fb_players — roster players

Usage:
    python3.12 njcaa_football_scraper.py
    python3.12 njcaa_football_scraper.py --test 3
    python3.12 njcaa_football_scraper.py --dry-run
    python3.12 njcaa_football_scraper.py --school "Blinn College"
"""
from __future__ import annotations

import argparse
import json
import re
import time
from pathlib import Path
from typing import Optional

import httpx
import psycopg
from bs4 import BeautifulSoup
from psycopg.rows import dict_row

# ── Config ────────────────────────────────────────────────────────────────────

DB_CONFIG    = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}
SEASON       = "2024-25"
DELAY        = 1.5
TIMEOUT      = 20
SCHOOLS_FILE = Path(__file__).parent / "njcaa_football_schools.json"

HTTP_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
}

# ── DB ────────────────────────────────────────────────────────────────────────

CREATE_SQL = """
CREATE TABLE IF NOT EXISTS njcaa_fb_teams (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    conference  TEXT,
    athletic_url TEXT,
    platform    TEXT,
    season      TEXT NOT NULL DEFAULT '2024-25',
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE (name, season)
);

CREATE TABLE IF NOT EXISTS njcaa_fb_players (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_key  TEXT NOT NULL UNIQUE,
    full_name   TEXT NOT NULL,
    jersey      TEXT,
    position    TEXT,
    class_year  TEXT,
    height      TEXT,
    weight      TEXT,
    hometown    TEXT,
    high_school TEXT,
    team_id     UUID REFERENCES njcaa_fb_teams(id),
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


def upsert_team(conn, name: str, conference: str, url: str, platform: str) -> str:
    row = conn.execute("""
        INSERT INTO njcaa_fb_teams (name, conference, athletic_url, platform, season)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (name, season) DO UPDATE SET
            conference   = COALESCE(EXCLUDED.conference,   njcaa_fb_teams.conference),
            athletic_url = COALESCE(EXCLUDED.athletic_url, njcaa_fb_teams.athletic_url),
            platform     = COALESCE(EXCLUDED.platform,     njcaa_fb_teams.platform),
            updated_at   = now()
        RETURNING id
    """, (name, conference or None, url or None, platform or None, SEASON)).fetchone()
    return str(row["id"])


def upsert_player(conn, player_key: str, full_name: str, team_id: str,
                  jersey: str, position: str, class_year: str,
                  height: str, weight: str, hometown: str, high_school: str):
    conn.execute("""
        INSERT INTO njcaa_fb_players
            (player_key, full_name, team_id, season, jersey, position, class_year,
             height, weight, hometown, high_school)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (player_key) DO UPDATE SET
            full_name   = EXCLUDED.full_name,
            position    = COALESCE(NULLIF(EXCLUDED.position,''),    njcaa_fb_players.position),
            class_year  = COALESCE(NULLIF(EXCLUDED.class_year,''),  njcaa_fb_players.class_year),
            height      = COALESCE(NULLIF(EXCLUDED.height,''),      njcaa_fb_players.height),
            weight      = COALESCE(NULLIF(EXCLUDED.weight,''),      njcaa_fb_players.weight),
            hometown    = COALESCE(NULLIF(EXCLUDED.hometown,''),    njcaa_fb_players.hometown),
            high_school = COALESCE(NULLIF(EXCLUDED.high_school,''), njcaa_fb_players.high_school),
            updated_at  = now()
    """, (
        player_key, full_name, team_id, SEASON,
        jersey or None, position or None, class_year or None,
        height or None, weight or None, hometown or None, high_school or None,
    ))


# ── Fetch ─────────────────────────────────────────────────────────────────────

def fetch_page(url: str) -> Optional[BeautifulSoup]:
    try:
        r = httpx.get(url, headers=HTTP_HEADERS, timeout=TIMEOUT, follow_redirects=True)
        time.sleep(DELAY)
        if r.status_code == 200 and len(r.text) > 2000 and "Just a moment" not in r.text:
            return BeautifulSoup(r.text, "html.parser")
        return None
    except Exception:
        time.sleep(DELAY)
        return None


# ── Sidearm Parser ────────────────────────────────────────────────────────────

_SIDEARM_NAME_VARIANTS = {"full name", "name"}
_FOOTBALL_COLS = {"#", "no.", "pos.", "pos", "ht.", "hgt.", "wt.", "wgt.", "class", "year", "academic year"}


def _norm_header(h: str) -> str:
    """Normalize column header text to canonical form."""
    m = {
        "NAME": "Name", "FULL NAME": "Full Name",
        "POS.": "Pos.", "POS": "Pos.", "POSITION": "Position",
        "HGT.": "Ht.", "WT.": "Wt.", "WGT.": "Wt.",
        "CLASS": "Class", "ACADEMIC YEAR": "Class", "YR.": "Class", "YEAR": "Class",
        "HOMETOWN": "Hometown", "HIGH SCHOOL": "High School",
        "HOMETOWN / HIGH SCHOOL": "Hometown",
        "HOMETOWN/HIGH SCHOOL": "Hometown",
    }
    return m.get(h.upper(), h)


def parse_sidearm_roster(soup: BeautifulSoup) -> list[dict]:
    """
    Parse a Sidearm Sports football roster page.
    Handles column headers: # | Full Name | Pos. | Ht. | Class/Year | Hometown
    Some NJCAA sites omit Wt. column.
    """
    for table in soup.find_all("table"):
        thead = table.find("thead")
        if not thead:
            continue
        raw_headers = [th.get_text(strip=True) for th in thead.find_all("th")]
        lower_map   = {h.lower(): h for h in raw_headers}

        # Must have a name column
        name_col_raw = None
        for variant in _SIDEARM_NAME_VARIANTS:
            if variant in lower_map:
                name_col_raw = lower_map[variant]
                break
        if not name_col_raw:
            continue

        # Must have at least one football-specific column
        lower_set = set(lower_map.keys())
        if not _FOOTBALL_COLS.intersection(lower_set):
            continue

        headers = [_norm_header(h) for h in raw_headers]
        idx     = {h: i for i, h in enumerate(headers)}

        name_key = "Full Name" if "Full Name" in idx else "Name"

        def get(key):
            i = idx.get(key, -1)
            return cells[i].strip() if 0 <= i < len(cells) else ""

        players = []
        tbody = table.find("tbody") or table
        for tr in tbody.find_all("tr"):
            cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
            if len(cells) < 2:
                continue
            if name_key not in idx or idx[name_key] >= len(cells):
                continue
            full_name = cells[idx[name_key]].strip()
            if not full_name or full_name.lower() in ("name", "full name"):
                continue
            if re.match(r"^(Team|Totals?)", full_name, re.I):
                continue

            # Hometown might include high school separated by " / " or newline
            hometown_raw = get("Hometown")
            if " / " in hometown_raw:
                hometown, high_school = hometown_raw.split(" / ", 1)
            else:
                hometown, high_school = hometown_raw, get("High School")

            players.append({
                "full_name":   full_name,
                "jersey":      get("#") or get("No."),
                "class_year":  get("Class"),
                "height":      get("Ht."),
                "weight":      get("Wt."),
                "position":    get("Pos.") or get("Position"),
                "hometown":    hometown.strip(),
                "high_school": high_school.strip(),
            })
        if players:
            return players
    return []


# ── PrestoSports Parser ───────────────────────────────────────────────────────

def _normalize_height(h: str) -> str:
    """Convert 6'2 or 6'2" to 6-2 (match Sidearm format)."""
    h = h.strip().replace('"', '').replace("'", "-").replace("′", "-")
    return h


def parse_prestosports_roster(soup: BeautifulSoup) -> list[dict]:
    """
    Parse a PrestoSports football roster page.
    Two variants exist — both use aria-label on bio links for player names.
    Headers: No. | Name | Pos. | Cl. | Ht. | Wt. | Hometown/High School
    """
    for table in soup.find_all("table"):
        bio_links = table.find_all("a", href=lambda h: h and "/bios/" in h)
        if not bio_links:
            continue

        # Detect column order from thead
        thead = table.find("thead")
        header_row = thead.find("tr") if thead else None
        if not header_row:
            continue
        raw_headers = [th.get_text(strip=True).lower() for th in header_row.find_all(["th", "td"])]

        def col_idx(*candidates) -> int:
            for cand in candidates:
                for i, h in enumerate(raw_headers):
                    if cand in h:
                        return i
            return -1

        idx_jersey = col_idx("no.", "no ", "#")
        idx_pos    = col_idx("pos")
        idx_year   = col_idx("cl.", "yr.", "year")
        idx_ht     = col_idx("ht.", "height")
        idx_wt     = col_idx("wt.", "weight")
        idx_home   = col_idx("hometown", "home town", "city")

        players = []
        tbody = table.find("tbody") or table
        for row in tbody.find_all("tr"):
            bio_a = row.find("a", href=lambda h: h and "/bios/" in h)
            if not bio_a:
                continue

            # Extract full name from aria-label (most reliable across variants)
            aria      = bio_a.get("aria-label", "")
            full_name = aria.split(":")[0].strip() if ":" in aria else bio_a.get_text(strip=True)
            if not full_name:
                continue

            cells = row.find_all(["td", "th"])

            def cell_text(idx: int) -> str:
                if idx < 0 or idx >= len(cells):
                    return ""
                cell = cells[idx]
                # Remove mobile label spans (PrestoSports Variant B)
                for span in cell.find_all("span", class_=lambda c: c and "label" in c):
                    span.decompose()
                return cell.get_text(strip=True)

            hometown_raw = cell_text(idx_home)
            if "/" in hometown_raw:
                hometown, high_school = hometown_raw.split("/", 1)
            else:
                hometown, high_school = hometown_raw, ""

            players.append({
                "full_name":   full_name,
                "jersey":      cell_text(idx_jersey),
                "position":    cell_text(idx_pos),
                "class_year":  cell_text(idx_year),
                "height":      _normalize_height(cell_text(idx_ht)),
                "weight":      cell_text(idx_wt),
                "hometown":    hometown.strip(),
                "high_school": high_school.strip(),
            })

        if players:
            return players
    return []


# ── Main ──────────────────────────────────────────────────────────────────────

def make_player_key(school_name: str, full_name: str) -> str:
    school_slug = re.sub(r"[^a-z0-9]", "", school_name.lower())
    name_slug   = re.sub(r"[^a-z0-9]", "", full_name.lower())
    return f"njcaa:{school_slug}:{name_slug}"


def run(schools: list[dict], conn, dry_run: bool = False):
    ok = skip = total = 0

    for i, school in enumerate(schools, 1):
        name      = school["name"]
        base_url  = school["url"].rstrip("/")
        conf      = school.get("conference", "")
        platform  = school.get("platform", "sidearm")
        sp        = school.get("season_path")

        if platform == "prestosports" and sp:
            roster_url = f"{base_url}/sports/{sp}/roster"
        else:
            roster_url = f"{base_url}/sports/football/roster"

        soup = fetch_page(roster_url)
        if soup is None:
            # For Sidearm, also try with season path
            if platform == "sidearm":
                for fallback in ["/sports/football/roster/2024-25", "/sports/football/roster/2024"]:
                    soup = fetch_page(base_url + fallback)
                    if soup:
                        break
        if soup is None:
            print(f"  [{i:2d}/{len(schools)}] SKIP {name} (no page)")
            skip += 1
            continue

        if platform == "prestosports":
            players = parse_prestosports_roster(soup)
        else:
            players = parse_sidearm_roster(soup)

        if not players:
            print(f"  [{i:2d}/{len(schools)}] SKIP {name} (0 players parsed)")
            skip += 1
            continue

        if dry_run:
            print(f"  [{i:2d}/{len(schools)}] {name:<45} {len(players):3d} players [dry]")
            ok += 1
            total += len(players)
            continue

        team_id = upsert_team(conn, name, conf, base_url, platform)
        for p in players:
            pk = make_player_key(name, p["full_name"])
            upsert_player(conn, pk, p["full_name"], team_id,
                          p["jersey"], p["position"], p["class_year"],
                          p["height"], p["weight"], p["hometown"], p["high_school"])
        conn.commit()
        ok += 1
        total += len(players)
        print(f"  [{i:2d}/{len(schools)}] {name:<45} {len(players):3d} players  [{platform}]")

    print(f"\n  Done: {ok} schools, {skip} skipped, {total} players")

    if conn and not dry_run:
        r  = conn.execute("SELECT COUNT(*) AS n FROM njcaa_fb_teams  WHERE season=%s", (SEASON,)).fetchone()
        rp = conn.execute("SELECT COUNT(*) AS n FROM njcaa_fb_players WHERE season=%s", (SEASON,)).fetchone()
        print(f"  DB: {r['n']} teams, {rp['n']} players")


def main():
    ap = argparse.ArgumentParser(description="NJCAA football roster scraper")
    ap.add_argument("--test",    type=int, default=0, metavar="N", help="Only run first N schools")
    ap.add_argument("--dry-run", action="store_true", help="Parse only, no DB writes")
    ap.add_argument("--school",  type=str, default="", help="Only run a specific school by name")
    args = ap.parse_args()

    schools = json.loads(SCHOOLS_FILE.read_text())

    if args.school:
        schools = [s for s in schools if args.school.lower() in s["name"].lower()]
        if not schools:
            print(f"No school matching '{args.school}'")
            return

    if args.test:
        schools = schools[:args.test]

    print(f"\n=== NJCAA Football Roster Scraper ===")
    print(f"  Season  : {SEASON}")
    print(f"  Schools : {len(schools)}")
    print()

    conn = get_conn()
    try:
        ensure_tables(conn)
        run(schools, conn, dry_run=args.dry_run)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
