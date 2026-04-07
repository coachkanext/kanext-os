#!/usr/bin/env python3
"""
KaNeXT Elite Prospects Junior Hockey Scraper
Source: eliteprospects.com (server-side rendered HTML — no JS rendering needed)

Pulls current-season skater + goalie stats for the 5 major NHL development leagues:
  OHL   — Ontario Hockey League        (~558 skaters / ~67 goalies)
  WHL   — Western Hockey League        (~634 skaters)
  QMJHL — Quebec Major Junior HL       (~531 skaters)
  USHL  — United States Hockey League  (~545 skaters)
  NAHL  — North American Hockey League (~1,186 skaters)

URL patterns:
  Skaters: /league/{league}/stats/{season}?page={n}
  Goalies: /league/{league}/stats/{season}?tab=goalies

Pagination: ?page=N (100 players/page). Max page found from nav links on page 1.
Robots.txt: league stats pages are NOT blocked (only /ajax/ is blocked — we avoid that).

DB tables:
  ep_players       — player bio (name, pos)
  ep_skater_stats  — GP, G, A, TP, PIM, +/-
  ep_goalie_stats  — GP, W, L, T, GAA, SV%, SO, SVS, GA

Usage:
    python3 ep_scraper.py
"""
from __future__ import annotations

import html as html_mod
import re
import time
from typing import Optional

import httpx
import psycopg
from psycopg.rows import dict_row

DB_CONFIG = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}

BASE_URL  = "https://www.eliteprospects.com"
SEASON    = "2024-2025"

LEAGUES = ["ohl", "whl", "qmjhl", "ushl", "nahl"]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,*/*",
    "Accept-Language": "en-US,en;q=0.9",
}

REQUEST_DELAY = 0.6   # seconds between requests

DDL = """
CREATE TABLE IF NOT EXISTS ep_players (
    player_id   INT  PRIMARY KEY,
    full_name   TEXT NOT NULL,
    slug        TEXT,
    pos         TEXT,
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ep_skater_stats (
    id          SERIAL PRIMARY KEY,
    player_id   INT  NOT NULL REFERENCES ep_players(player_id),
    season      TEXT NOT NULL,
    league      TEXT NOT NULL,
    team        TEXT,
    gp          INT,
    g           INT,
    a           INT,
    tp          INT,
    ppg         FLOAT,
    pim         INT,
    plus_minus  INT,
    UNIQUE (player_id, season, league)
);

CREATE TABLE IF NOT EXISTS ep_goalie_stats (
    id          SERIAL PRIMARY KEY,
    player_id   INT  NOT NULL REFERENCES ep_players(player_id),
    season      TEXT NOT NULL,
    league      TEXT NOT NULL,
    team        TEXT,
    gp          INT,
    w           INT,
    l           INT,
    t           INT,
    gaa         FLOAT,
    save_pct    FLOAT,
    shutouts    INT,
    svs         INT,
    ga          INT,
    toi         TEXT,
    UNIQUE (player_id, season, league)
);
"""


# ── Helpers ───────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)


def strip_tags(s: str) -> str:
    return re.sub(r"<[^>]+>", "", s).strip()


def clean(s: str) -> str:
    return html_mod.unescape(strip_tags(s)).strip()


def safe_int(val: str) -> Optional[int]:
    v = val.strip().replace(",", "")
    try:
        return int(v)
    except (ValueError, AttributeError):
        return None


def safe_float(val: str) -> Optional[float]:
    v = val.strip().replace(",", "")
    try:
        return float(v)
    except (ValueError, AttributeError):
        return None


def extract_player_id(cell_html: str) -> Optional[int]:
    m = re.search(r"/player/(\d+)/", cell_html)
    return int(m.group(1)) if m else None


def extract_player_slug(cell_html: str) -> Optional[str]:
    m = re.search(r"/player/\d+/([^\"']+)", cell_html)
    return m.group(1).rstrip("/") if m else None


def extract_team(cell_html: str) -> Optional[str]:
    m = re.search(r'<a[^>]+href=["\'][^"\']*(?:/team/|/league/)[^"\']*["\'][^>]*>([^<]+)</a>', cell_html)
    return html_mod.unescape(m.group(1).strip()) if m else clean(cell_html) or None


def parse_player_cell(cell_html: str) -> tuple[Optional[int], str, Optional[str], Optional[str]]:
    """Returns (player_id, full_name, slug, pos).

    The player <a> tag contains HTML comments: 'Michael Misa<!-- --> <!-- -->(C/LW)'
    so we strip comments before extracting name/pos.
    """
    pid  = extract_player_id(cell_html)
    slug = extract_player_slug(cell_html)

    # Extract the <a> tag that has the player link
    a_m = re.search(r'href=["\'][^"\']*?/player/\d+/[^"\']*?["\'][^>]*>(.*?)</a>',
                    cell_html, re.DOTALL)
    if a_m:
        a_inner = a_m.group(1)
        # Strip HTML comments (<!-- ... -->) then tags
        a_inner = re.sub(r'<!--.*?-->', '', a_inner, flags=re.DOTALL)
        a_inner = re.sub(r'<[^>]+>', '', a_inner)
        a_inner = html_mod.unescape(a_inner).strip()
        # a_inner is now like "Michael Misa (C/LW)"
        pos_m = re.search(r'\(([A-Z/]+)\)', a_inner)
        pos   = pos_m.group(1) if pos_m else None
        name  = a_inner.split(" (")[0].strip()
    else:
        name = ""
        pos  = None

    return pid, name, slug, pos


def find_max_page(html: str) -> int:
    """Parse all ?page=N from pagination nav and return the highest."""
    pages = [int(x) for x in re.findall(r"[?&]page=(\d+)", html)]
    return max(pages) if pages else 1


def parse_table(html: str) -> list[dict]:
    """Extract data rows from the stats table.

    Returns a list of dicts with raw cell HTML per column index,
    filtered to only player rows (rows with /player/ links).
    """
    table_m = re.search(r"<table[^>]*>(.*?)</table>", html, re.DOTALL)
    if not table_m:
        return []
    table_html = table_m.group(1)

    rows = re.findall(r"<tr[^>]*>(.*?)</tr>", table_html, re.DOTALL)
    result = []
    for row in rows:
        if "/player/" not in row:
            continue
        cells = re.findall(r"<td[^>]*>(.*?)</td>", row, re.DOTALL)
        result.append(cells)
    return result


# ── Fetchers ──────────────────────────────────────────────────────────────────

def fetch_skaters(league: str, client: httpx.Client, conn) -> int:
    """Fetch all skater pages for a league and upsert into DB. Returns player count."""
    cur = conn.cursor()
    season_clean = SEASON.replace("-", "")  # "20242025" for DB
    count = 0

    # Page 1 — also discover max page
    url_p1 = f"{BASE_URL}/league/{league}/stats/{SEASON}"
    resp = client.get(url_p1, headers=HEADERS, follow_redirects=True)
    resp.raise_for_status()
    html_p1 = resp.text
    max_page = find_max_page(html_p1)
    print(f"    pages: {max_page}", flush=True)

    pages_html = [html_p1]
    for p in range(2, max_page + 1):
        time.sleep(REQUEST_DELAY)
        url = f"{BASE_URL}/league/{league}/stats/{SEASON}?page={p}"
        r = client.get(url, headers=HEADERS, follow_redirects=True)
        r.raise_for_status()
        pages_html.append(r.text)

    for page_html in pages_html:
        rows = parse_table(page_html)
        for cells in rows:
            if len(cells) < 9:
                continue
            pid, name, slug, pos = parse_player_cell(cells[1])
            if not pid or not name:
                continue
            team = extract_team(cells[2])

            # cells: [rank, player, team, GP, G, A, TP, PPG, PIM, +/-]
            gp        = safe_int(clean(cells[3]))
            g         = safe_int(clean(cells[4]))
            a         = safe_int(clean(cells[5]))
            tp        = safe_int(clean(cells[6]))
            ppg       = safe_float(clean(cells[7]))
            pim       = safe_int(clean(cells[8]))
            plus_minus = safe_int(clean(cells[9])) if len(cells) > 9 else None

            # Upsert player
            cur.execute("""
                INSERT INTO ep_players (player_id, full_name, slug, pos)
                VALUES (%s,%s,%s,%s)
                ON CONFLICT (player_id) DO UPDATE SET
                  full_name=EXCLUDED.full_name, pos=EXCLUDED.pos, updated_at=now()
            """, (pid, name, slug, pos))

            # Upsert skater stats
            cur.execute("""
                INSERT INTO ep_skater_stats
                  (player_id, season, league, team, gp, g, a, tp, ppg, pim, plus_minus)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (player_id, season, league) DO UPDATE SET
                  team=EXCLUDED.team, gp=EXCLUDED.gp, g=EXCLUDED.g,
                  a=EXCLUDED.a, tp=EXCLUDED.tp, ppg=EXCLUDED.ppg,
                  pim=EXCLUDED.pim, plus_minus=EXCLUDED.plus_minus
            """, (pid, SEASON, league.upper(), team, gp, g, a, tp, ppg, pim, plus_minus))

            count += 1

    conn.commit()
    return count


def fetch_goalies(league: str, client: httpx.Client, conn) -> int:
    """Fetch goalie stats for a league. Returns goalie count."""
    cur = conn.cursor()
    count = 0

    url = f"{BASE_URL}/league/{league}/stats/{SEASON}?tab=goalies"
    time.sleep(REQUEST_DELAY)
    resp = client.get(url, headers=HEADERS, follow_redirects=True)
    resp.raise_for_status()
    html = resp.text

    # Goalies typically fit on 1 page but check anyway
    max_page = find_max_page(html)
    pages_html = [html]
    for p in range(2, max_page + 1):
        time.sleep(REQUEST_DELAY)
        r = client.get(f"{url}&page={p}", headers=HEADERS, follow_redirects=True)
        r.raise_for_status()
        pages_html.append(r.text)

    for page_html in pages_html:
        rows = parse_table(page_html)
        for cells in rows:
            if len(cells) < 12:
                continue
            pid, name, slug, pos = parse_player_cell(cells[1])
            if not pid or not name:
                continue
            team = extract_team(cells[2])

            # cols: [rank, player, team, GP, GAA, SV%, W, L, T, SO, TOI, SVS, GA]
            gp       = safe_int(clean(cells[3]))
            gaa      = safe_float(clean(cells[4]))
            svp      = safe_float(clean(cells[5]))
            w        = safe_int(clean(cells[6]))
            l        = safe_int(clean(cells[7]))
            t        = safe_int(clean(cells[8]))
            so       = safe_int(clean(cells[9]))
            toi      = clean(cells[10]) or None
            svs      = safe_int(clean(cells[11]))
            ga       = safe_int(clean(cells[12])) if len(cells) > 12 else None

            cur.execute("""
                INSERT INTO ep_players (player_id, full_name, slug, pos)
                VALUES (%s,%s,%s,'G')
                ON CONFLICT (player_id) DO UPDATE SET
                  full_name=EXCLUDED.full_name, updated_at=now()
            """, (pid, name, slug))

            cur.execute("""
                INSERT INTO ep_goalie_stats
                  (player_id, season, league, team, gp, w, l, t, gaa, save_pct,
                   shutouts, svs, ga, toi)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (player_id, season, league) DO UPDATE SET
                  team=EXCLUDED.team, gp=EXCLUDED.gp, w=EXCLUDED.w,
                  gaa=EXCLUDED.gaa, save_pct=EXCLUDED.save_pct, shutouts=EXCLUDED.shutouts
            """, (pid, SEASON, league.upper(), team, gp, w, l, t, gaa, svp, so, svs, ga, toi))

            count += 1

    conn.commit()
    return count


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(DDL)
    conn.commit()
    print("Tables ready.")

    totals = {"skaters": 0, "goalies": 0}

    with httpx.Client(timeout=30) as client:
        for league in LEAGUES:
            print(f"\n{'─'*50}")
            print(f"{league.upper()}  ({SEASON})", flush=True)

            print("  Skaters...", flush=True)
            sk = fetch_skaters(league, client, conn)
            print(f"    → {sk} skaters", flush=True)

            print("  Goalies...", flush=True)
            go = fetch_goalies(league, client, conn)
            print(f"    → {go} goalies", flush=True)

            totals["skaters"] += sk
            totals["goalies"] += go

            time.sleep(REQUEST_DELAY)

    # ── Summary ───────────────────────────────────────────────────────────────
    cur.execute("SELECT COUNT(*) n FROM ep_players");       p_n  = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) n FROM ep_skater_stats");  sk_n = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) n FROM ep_goalie_stats");  go_n = cur.fetchone()["n"]
    cur.execute("""
        SELECT league, COUNT(DISTINCT player_id) n
        FROM ep_skater_stats GROUP BY league ORDER BY league
    """)
    by_league = cur.fetchall()

    print(f"\n{'='*50}")
    print(f"ELITE PROSPECTS DONE — {SEASON}")
    print(f"  Players:       {p_n}")
    print(f"  Skater stats:  {sk_n}")
    print(f"  Goalie stats:  {go_n}")
    print(f"\nBy league:")
    for row in by_league:
        print(f"  {row['league']}: {row['n']} skaters")
    print(f"{'='*50}")

    conn.close()


if __name__ == "__main__":
    main()
