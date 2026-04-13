#!/usr/bin/env python3
"""
NJCAA Regional Women's Volleyball Scraper
Per-team stats from all accessible NJCAA regional sites.

NJCAA does NOT sponsor men's volleyball — women's only.

Confirmed regions (14 total):
  wvball: r1, r2, r3, r4, r5, r7, r8, r11, r12, r13, r15, r19, r20, r6(div split)

Stat format (all accessible regions, identical columns):
  # | Name | Yr | Pos | m | s | k | k/s | e | ta | pct | a | a/s | sa | sa/s
       | r | re | digs | d/s | bs | ba | tot | b/s | pts | pts/s
  m=matches, s=sets, k=kills, e=errors, ta=total attacks, pct=hit%, a=assists,
  sa=service aces, digs=digs, bs=block solos, ba=block assists, tot=total blocks

Usage:
  python3 njcaa_regional_vb_scraper.py             # all regions
  python3 njcaa_regional_vb_scraper.py --region r5 # one region
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from typing import Optional

import httpx
import psycopg
from bs4 import BeautifulSoup

sys.path.insert(0, os.path.dirname(__file__))
from config import DB_CONFIG

# ── Config ────────────────────────────────────────────────────────────────────

SEASON = "2024-25"
CRAWL_DELAY  = 3
REGION_DELAY = 6
SPORT = "wvball"

REGIONS = {
    "r1":  "https://www.accac.org",
    "r2":  "https://region2athletics.com",
    "r3":  "https://www.njcaaregion3.org",
    "r4":  "https://www.region4sports.com",
    "r5":  "https://njcaaregion5.com",
    "r7":  "http://tjccaa.com",
    "r8":  "https://thefcsaasports.com",
    "r11": "https://iccac.org",
    "r12": "https://njcaaregion12.org",
    "r13": "https://njcaaregion13.org",
    "r15": "https://region15athletics.com",
    "r19": "https://njcaaregion19.com",
    "r20": "https://njcaaregion20.org",
    # r6 uses /div1/ and /div2/ paths — handled specially
    "r6":  "https://kjccc.org",
}

# r6 needs division-split URL paths
R6_DIVS = ["div1", "div2"]

BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
}

# ── DB Schema ──────────────────────────────────────────────────────────────────

CREATE_TEAMS = """
CREATE TABLE IF NOT EXISTS njcaa_reg_vb_teams (
    id       SERIAL PRIMARY KEY,
    region   TEXT NOT NULL,
    slug     TEXT NOT NULL,
    name     TEXT,
    base_url TEXT NOT NULL,
    season   TEXT NOT NULL,
    UNIQUE (region, slug, season)
);
"""

CREATE_PLAYERS = """
CREATE TABLE IF NOT EXISTS njcaa_reg_vb_players (
    id         SERIAL PRIMARY KEY,
    team_id    INT  NOT NULL REFERENCES njcaa_reg_vb_teams(id),
    jersey     TEXT,
    full_name  TEXT NOT NULL,
    position   TEXT,
    class_year TEXT,
    UNIQUE (team_id, full_name)
);
"""

CREATE_STATS = """
CREATE TABLE IF NOT EXISTS njcaa_reg_vb_stats (
    id          SERIAL PRIMARY KEY,
    player_id   INT  NOT NULL REFERENCES njcaa_reg_vb_players(id),
    season      TEXT NOT NULL,
    matches     INT,
    sets        INT,
    kills       INT,
    kills_per_set  NUMERIC(6,3),
    errors      INT,
    total_att   INT,
    hit_pct     NUMERIC(6,4),
    assists     INT,
    assists_per_set NUMERIC(6,3),
    service_aces INT,
    aces_per_set NUMERIC(6,3),
    digs        INT,
    digs_per_set NUMERIC(6,3),
    block_solos INT,
    block_assists INT,
    total_blocks INT,
    blocks_per_set NUMERIC(6,3),
    points      NUMERIC(8,1),
    pts_per_set NUMERIC(6,3),
    UNIQUE (player_id, season)
);
"""


def ensure_schema(conn):
    conn.execute(CREATE_TEAMS)
    conn.execute(CREATE_PLAYERS)
    conn.execute(CREATE_STATS)
    conn.commit()


# ── HTTP ───────────────────────────────────────────────────────────────────────

def fetch(url: str, base: str, retries: int = 3) -> Optional[httpx.Response]:
    hdrs = {**BROWSER_HEADERS, "Referer": base, "Origin": base}
    for attempt in range(retries):
        try:
            r = httpx.get(url, headers=hdrs, timeout=20, follow_redirects=True)
            if r.status_code == 202 and len(r.content) < 5000:
                wait = 90 if attempt == 0 else 120
                print(f"    [WAF] waiting {wait}s...")
                time.sleep(wait)
                continue
            return r
        except Exception as e:
            print(f"    [err] {e}")
            time.sleep(10)
    return None


def discover_slugs(base: str, path_prefix: str) -> list[str]:
    """Discover team slugs from the teams listing page."""
    url = f"{base}/sports/{SPORT}/{SEASON}/{path_prefix}teams"
    nav_hdrs = {**BROWSER_HEADERS}
    try:
        r = httpx.get(url, headers=nav_hdrs, timeout=20, follow_redirects=True)
        if r.status_code not in (200,):
            return []
        soup = BeautifulSoup(r.text, "html.parser")
        team_path = f"/sports/{SPORT}/{SEASON}/{path_prefix}teams/"
        links = [a["href"] for a in soup.find_all("a", href=True) if team_path in a["href"]]
        return list(dict.fromkeys(
            h.split(team_path)[1].split("?")[0].split("/")[0]
            for h in links
            if h.split(team_path)[1].split("?")[0].split("/")[0]
        ))
    except Exception as e:
        print(f"    [slug-err] {e}")
        return []


# ── Parsing ────────────────────────────────────────────────────────────────────

def _di(v: str | None) -> Optional[int]:
    if not v or v.strip() in ("-", "", "—"):
        return None
    try:
        return int(str(v).replace(",", "").strip())
    except ValueError:
        return None


def _pct(v: str | None) -> Optional[float]:
    if not v or v.strip() in ("-", "", "—"):
        return None
    try:
        f = float(str(v).replace("%", "").strip())
        return round(f / 100 if f > 1.5 else f, 4)
    except ValueError:
        return None


def _fl(v: str | None, nd: int = 3) -> Optional[float]:
    if not v or v.strip() in ("-", "", "—"):
        return None
    try:
        return round(float(v.strip()), nd)
    except ValueError:
        return None


SKIP_NAMES = {"name", "player", "totals", "total", "", "opponent", "opponents",
              "home", "away", "exhibition", "conference", "non-conference", "#"}


def parse_vb_table(html: str) -> list[dict]:
    """
    Parse volleyball stats table.
    Expected columns: # Name Yr Pos m s k k/s e ta pct a a/s sa sa/s r re digs d/s bs ba tot b/s pts pts/s
    """
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table")
    if not table:
        return []

    # Find header row
    thead = table.find("thead")
    if not thead:
        # Try first row
        rows_all = table.find_all("tr")
        if not rows_all:
            return []
        header_tr = rows_all[0]
        data_rows = rows_all[1:]
    else:
        rows_all = thead.find_all("tr")
        header_tr = rows_all[-1] if rows_all else None
        tbody = table.find("tbody") or table
        data_rows = tbody.find_all("tr")

    if not header_tr:
        return []

    raw_hdrs = [th.get_text(strip=True).lower() for th in header_tr.find_all(["th", "td"])]

    def ci(names: list[str], default: int = -1) -> int:
        for n in names:
            for i, h in enumerate(raw_hdrs):
                if h == n:
                    return i
        return default

    C_NO   = ci(["#", "no", "no."], 0)
    C_NAME = ci(["name", "player"], 1)
    C_YR   = ci(["yr", "cl", "class"], 2)
    C_POS  = ci(["pos", "position"], 3)
    C_M    = ci(["m", "mp"], 4)          # matches
    C_S    = ci(["s", "sp", "sets"], 5)  # sets
    C_K    = ci(["k"], -1)
    C_KPS  = ci(["k/s"], -1)
    C_E    = ci(["e"], -1)
    C_TA   = ci(["ta"], -1)
    C_PCT  = ci(["pct", "hit%", "att%"], -1)
    C_A    = ci(["a"], -1)
    C_APS  = ci(["a/s"], -1)
    C_SA   = ci(["sa"], -1)
    C_SAPS = ci(["sa/s"], -1)
    C_DIG  = ci(["digs", "dig"], -1)
    C_DPS  = ci(["d/s", "dig/s"], -1)
    C_BS   = ci(["bs"], -1)
    C_BA   = ci(["ba"], -1)
    C_TOT  = ci(["tot", "total blocks", "blk"], -1)
    C_BPS  = ci(["b/s", "blk/s"], -1)
    C_PTS  = ci(["pts", "points"], -1)
    C_PTPS = ci(["pts/s"], -1)

    if C_NAME < 0:
        return []

    results = []
    for tr in data_rows:
        cells = tr.find_all(["td", "th"])
        if len(cells) < 5:
            continue

        def cell(i: int) -> str:
            if i < 0 or i >= len(cells):
                return ""
            return " ".join(cells[i].get_text(strip=True).split())

        name_raw = cell(C_NAME)
        if not name_raw or name_raw.lower() in SKIP_NAMES:
            continue
        if name_raw.lower() in raw_hdrs:
            continue

        results.append({
            "name":    name_raw,
            "jersey":  cell(C_NO) or None,
            "pos":     cell(C_POS) or None,
            "cl":      cell(C_YR) or None,
            "matches": _di(cell(C_M)),
            "sets":    _di(cell(C_S)),
            "kills":   _di(cell(C_K)),
            "kps":     _fl(cell(C_KPS)),
            "errors":  _di(cell(C_E)),
            "ta":      _di(cell(C_TA)),
            "hit_pct": _pct(cell(C_PCT)),
            "assists": _di(cell(C_A)),
            "aps":     _fl(cell(C_APS)),
            "aces":    _di(cell(C_SA)),
            "saps":    _fl(cell(C_SAPS)),
            "digs":    _di(cell(C_DIG)),
            "dps":     _fl(cell(C_DPS)),
            "bs":      _di(cell(C_BS)),
            "ba":      _di(cell(C_BA)),
            "tot":     _di(cell(C_TOT)),
            "bps":     _fl(cell(C_BPS)),
            "pts":     _fl(cell(C_PTS), 1),
            "ptps":    _fl(cell(C_PTPS)),
        })
    return results


# ── DB Writes ──────────────────────────────────────────────────────────────────

def upsert_team(conn, region: str, slug: str, base: str) -> int:
    r = conn.execute("""
        INSERT INTO njcaa_reg_vb_teams (region, slug, base_url, season)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (region, slug, season) DO UPDATE SET base_url = EXCLUDED.base_url
        RETURNING id
    """, (region, slug, base, SEASON)).fetchone()
    return r["id"]


def upsert_player(conn, team_id: int, row: dict) -> int:
    r = conn.execute("""
        INSERT INTO njcaa_reg_vb_players (team_id, jersey, full_name, position, class_year)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (team_id, full_name) DO UPDATE SET
            jersey     = COALESCE(EXCLUDED.jersey,     njcaa_reg_vb_players.jersey),
            position   = COALESCE(EXCLUDED.position,   njcaa_reg_vb_players.position),
            class_year = COALESCE(EXCLUDED.class_year, njcaa_reg_vb_players.class_year)
        RETURNING id
    """, (team_id, row.get("jersey"), row["name"], row.get("pos"), row.get("cl"))).fetchone()
    return r["id"]


def upsert_stats(conn, player_id: int, row: dict):
    conn.execute("""
        INSERT INTO njcaa_reg_vb_stats (
            player_id, season, matches, sets, kills, kills_per_set, errors, total_att, hit_pct,
            assists, assists_per_set, service_aces, aces_per_set,
            digs, digs_per_set, block_solos, block_assists, total_blocks, blocks_per_set,
            points, pts_per_set
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT (player_id, season) DO UPDATE SET
            matches=EXCLUDED.matches, sets=EXCLUDED.sets, kills=EXCLUDED.kills,
            kills_per_set=EXCLUDED.kills_per_set, assists=EXCLUDED.assists,
            digs=EXCLUDED.digs, service_aces=EXCLUDED.service_aces,
            block_solos=EXCLUDED.block_solos, block_assists=EXCLUDED.block_assists,
            total_blocks=EXCLUDED.total_blocks, hit_pct=EXCLUDED.hit_pct, points=EXCLUDED.points
    """, (
        player_id, SEASON,
        row.get("matches"), row.get("sets"),
        row.get("kills"), row.get("kps"),
        row.get("errors"), row.get("ta"), row.get("hit_pct"),
        row.get("assists"), row.get("aps"),
        row.get("aces"), row.get("saps"),
        row.get("digs"), row.get("dps"),
        row.get("bs"), row.get("ba"), row.get("tot"), row.get("bps"),
        row.get("pts"), row.get("ptps"),
    ))


# ── Team Scraper ───────────────────────────────────────────────────────────────

def scrape_team(conn, region: str, slug: str, base: str, path_prefix: str = "") -> int:
    team_page = f"{base}/sports/{SPORT}/{SEASON}/{path_prefix}teams/{slug}"
    url = f"{team_page}?tmpl=brief-category-template&pos=overall&r=0"
    r = fetch(url, base)
    if not r or r.status_code != 200:
        print(f"      SKIP {slug} [{r.status_code if r else 'err'}]")
        return 0
    rows = parse_vb_table(r.text)
    if not rows:
        print(f"      SKIP {slug} [no rows]")
        return 0

    team_id = upsert_team(conn, region, slug, base)
    saved = 0
    for row in rows:
        if not row["name"]:
            continue
        pid = upsert_player(conn, team_id, row)
        upsert_stats(conn, pid, row)
        saved += 1
    conn.commit()
    return saved


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--region", choices=list(REGIONS.keys()), default=None)
    args = parser.parse_args()

    with psycopg.connect(
        host=DB_CONFIG["host"], port=DB_CONFIG["port"], dbname=DB_CONFIG["dbname"],
        row_factory=psycopg.rows.dict_row, autocommit=False,
    ) as conn:
        ensure_schema(conn)

        region_ids = [args.region] if args.region else list(REGIONS.keys())
        total_teams = total_players = 0

        print(f"=== NJCAA Women's Volleyball Scraper ===  season={SEASON}")

        for i, region in enumerate(region_ids):
            base = REGIONS[region]
            if i > 0:
                time.sleep(REGION_DELAY)

            print(f"\n  {region.upper()} — {base}")

            # r6 (kjccc.org) requires /div1/ and /div2/ prefixes
            prefixes = [f"{div}/" for div in R6_DIVS] if region == "r6" else [""]

            region_players = 0
            region_teams   = 0

            for prefix in prefixes:
                slugs = discover_slugs(base, prefix)
                if not slugs:
                    print(f"    [{prefix or 'root'}] no slugs found")
                    continue
                print(f"    [{prefix or 'root'}] {len(slugs)} teams: {slugs[:5]}{'...' if len(slugs)>5 else ''}")

                for j, slug in enumerate(slugs):
                    if j > 0:
                        time.sleep(CRAWL_DELAY)
                    n = scrape_team(conn, region, slug, base, prefix)
                    if n > 0:
                        region_teams += 1
                        region_players += n
                        print(f"      {slug}: {n} players")

            total_teams   += region_teams
            total_players += region_players
            print(f"    → {region_teams} teams, {region_players} players")

        # Summary
        row = conn.execute("""
            SELECT COUNT(DISTINCT t.id) AS teams, COUNT(DISTINCT p.id) AS players
            FROM njcaa_reg_vb_teams t
            JOIN njcaa_reg_vb_players p ON p.team_id = t.id
        """).fetchone()
        top = conn.execute("""
            SELECT p.full_name, t.slug, t.region, s.kills, s.digs, s.service_aces, s.matches
            FROM njcaa_reg_vb_stats s
            JOIN njcaa_reg_vb_players p ON s.player_id = p.id
            JOIN njcaa_reg_vb_teams t ON p.team_id = t.id
            WHERE s.kills IS NOT NULL AND s.kills > 0
            ORDER BY s.kills DESC NULLS LAST LIMIT 5
        """).fetchall()

        print(f"\n{'='*60}")
        print(f"NJCAA WVBALL DONE: {row['teams']} teams, {row['players']} players")
        if top:
            print("Top by kills:")
            for r in top:
                print(f"  {r['full_name']:<28} [{r['region']}] {r['slug']:<30} K={r['kills']} D={r['digs']} SA={r['service_aces']}")


if __name__ == "__main__":
    main()
