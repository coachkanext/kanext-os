"""
Women's Beach Volleyball Scraper — stats.ncaa.org
Source: https://stats.ncaa.org/rankings/national_ranking (sport_code=WSV)
Loads: bvb_teams, bvb_players, bvb_player_stats

Beach volleyball is a National Collegiate (NC) sport — no D1/D2/D3 split.
Pairs-based competition; individual stats tracked per player per season.

Known stat IDs for WSV (Women's Beach Volleyball / sport_code=WSV):
  1048 Pair wins, 1049 Pair losses, 1050 Win Pct
  1051 Kills Per Set, 1052 Digs Per Set, 1053 Aces Per Set

Usage:
    python3 bvb_scraper.py              # load all
    python3 bvb_scraper.py probe        # discover valid ranking periods + stat IDs
"""
from __future__ import annotations

import re
import sys
import time
from typing import Optional

import httpx
from bs4 import BeautifulSoup
import psycopg
from psycopg.rows import dict_row

DB_CONFIG = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}
SEASON    = "2025-26"
DELAY     = 0.7
HEADERS   = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}

BASE_URL  = "https://stats.ncaa.org/rankings/national_ranking"
SPORT     = "WSV"

# Beach volleyball is division=1 (no D2/D3 split at NCAA level)
DIVISION  = 1

# ── Stat pages — id → col_map ─────────────────────────────────────────────────
# Column names as they appear in stats.ncaa.org DataTable headers for WSV.
# These are probed at runtime if no rows found — see discover_stat_ids().
STAT_PAGES = [
    {
        "id":      1048,
        "title":   "Pair Wins",
        "col_map": {"S": "sets_played", "W": "wins", "L": "losses", "Pct.": "win_pct"},
    },
    {
        "id":      1051,
        "title":   "Kills Per Set",
        "col_map": {"S": "sets_played", "Kills": "kills", "Per Set": "kills_per_set"},
    },
    {
        "id":      1052,
        "title":   "Digs Per Set",
        "col_map": {"S": "sets_played", "Digs": "digs", "Per Set": "digs_per_set"},
    },
    {
        "id":      1053,
        "title":   "Aces Per Set",
        "col_map": {"S": "sets_played", "Aces": "service_aces", "Per Set": "aces_per_set"},
    },
]

# Fallback stat IDs to try when probing — broad search range
PROBE_STAT_IDS = list(range(1040, 1080)) + list(range(1, 20))


# ── Helpers ───────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)


def fetch_html(url: str) -> Optional[str]:
    try:
        r = httpx.get(url, headers=HEADERS, timeout=25, follow_redirects=True)
        time.sleep(DELAY)
        if r.status_code == 200:
            return r.text
        if r.status_code != 404:
            print(f"  [warn] HTTP {r.status_code}: {url}")
    except Exception as e:
        print(f"  [warn] fetch error: {e}")
    return None


def has_data_rows(html: str) -> bool:
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table", id="rankings_table")
    if not table:
        return False
    tbody = table.find("tbody")
    return bool(tbody and tbody.find("tr"))


def safe_float(v: str) -> Optional[float]:
    v = v.strip()
    if not v or v in ("-", "N/A", ""):
        return None
    try:
        return float(v)
    except ValueError:
        return None


def safe_int(v: str) -> Optional[int]:
    f = safe_float(v)
    return int(f) if f is not None else None


# ── Discover valid ranking period ─────────────────────────────────────────────

def discover_ranking_period(stat_id: int = 1048) -> Optional[int]:
    """
    Try ranking_period values 1–120 for WSV until we find one with data.
    Beach volleyball season is spring (Feb–May), so periods start low.
    """
    print(f"  [probe] Scanning ranking_period for WSV stat_seq={stat_id} ...")
    for period in range(1, 121):
        url = (
            f"{BASE_URL}?academic_year=2026&division={DIVISION}"
            f"&ranking_period={period}&sport_code={SPORT}&stat_seq={stat_id}"
        )
        html = fetch_html(url)
        if html and has_data_rows(html):
            print(f"  [probe] Found data at ranking_period={period}")
            return period
    return None


def discover_stat_ids(ranking_period: int) -> list[int]:
    """
    Try a range of stat_seq values to find which ones return data.
    Returns list of working stat IDs.
    """
    working = []
    print(f"  [probe] Scanning stat IDs for WSV (ranking_period={ranking_period}) ...")
    for sid in PROBE_STAT_IDS:
        url = (
            f"{BASE_URL}?academic_year=2026&division={DIVISION}"
            f"&ranking_period={ranking_period}&sport_code={SPORT}&stat_seq={sid}"
        )
        html = fetch_html(url)
        if html and has_data_rows(html):
            soup = BeautifulSoup(html, "html.parser")
            # Try to get the page title for this stat
            title_el = soup.find("h3") or soup.find("h2")
            title = title_el.get_text(strip=True) if title_el else str(sid)
            print(f"    stat_seq={sid}: {title}")
            working.append(sid)
    return working


def get_stat_headers(html: str) -> list[str]:
    """Extract DataTable column headers from the rankings page."""
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table", id="rankings_table")
    if not table:
        return []
    thead = table.find("thead")
    if not thead:
        return []
    return [th.get_text(strip=True) for th in thead.find_all("th")]


# ── Parse one stat rankings page ──────────────────────────────────────────────

def parse_stat_page(html: str, col_map: dict) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table", id="rankings_table")
    if not table:
        return []

    headers = []
    thead = table.find("thead")
    if thead:
        headers = [th.get_text(strip=True) for th in thead.find_all("th")]

    rows = []
    tbody = table.find("tbody")
    if not tbody:
        return []

    for tr in tbody.find_all("tr"):
        cells = tr.find_all("td")
        if len(cells) < 4:
            continue

        # Cell 1: player link
        player_cell = cells[1]
        link = player_cell.find("a", href=re.compile(r"/players/\d+"))
        if not link:
            continue

        href = link.get("href", "")
        m = re.search(r"/players/(\d+)", href)
        if not m:
            continue
        ncaa_player_id = m.group(1)
        full_name = link.get_text(strip=True)

        # School/conference from tail text after link
        raw_tail = player_cell.get_text(separator="|").split("|", 1)[-1].strip(" ,|")
        school = ""
        conference = ""
        conf_m = re.match(r"^(.*?)\s*\(([^)]+)\)\s*$", raw_tail)
        if conf_m:
            school     = conf_m.group(1).strip().rstrip(",").strip()
            conference = conf_m.group(2).strip()
        else:
            school = raw_tail.strip().rstrip(",").strip()

        # Class year from Cl column
        class_year = ""
        for i, hdr in enumerate(headers[2:], start=2):
            if hdr == "Cl" and i < len(cells):
                class_year = cells[i].get_text(strip=True)
                break

        def cell_text(idx):
            return cells[idx].get_text(strip=True) if idx < len(cells) else ""

        stat_vals: dict = {}
        INT_COLS = {"sets_played", "kills", "digs", "service_aces", "wins", "losses",
                    "sets_won", "sets_lost"}
        for i, hdr in enumerate(headers):
            db_col = col_map.get(hdr)
            if db_col and i < len(cells):
                raw = cell_text(i)
                if db_col in INT_COLS:
                    stat_vals[db_col] = safe_int(raw)
                else:
                    stat_vals[db_col] = safe_float(raw)

        rows.append({
            "ncaa_player_id": ncaa_player_id,
            "full_name":      full_name,
            "school":         school,
            "conference":     conference,
            "class_year":     class_year,
            **stat_vals,
        })

    return rows


# ── DB write ──────────────────────────────────────────────────────────────────

def upsert_team(conn, name: str, conference: str) -> str:
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO bvb_teams (name, conference)
            VALUES (%s, %s)
            ON CONFLICT (name) DO UPDATE SET
                conference = COALESCE(EXCLUDED.conference, bvb_teams.conference)
            RETURNING id
        """, (name, conference or None))
        return str(cur.fetchone()["id"])


def upsert_player(conn, row: dict, team_id: str) -> str:
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO bvb_players (ncaa_player_id, full_name, team_id, class_year)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (ncaa_player_id) DO UPDATE SET
                full_name  = EXCLUDED.full_name,
                team_id    = EXCLUDED.team_id,
                class_year = COALESCE(EXCLUDED.class_year, bvb_players.class_year),
                updated_at = now()
            RETURNING id
        """, (
            row["ncaa_player_id"], row["full_name"], team_id,
            row.get("class_year") or None,
        ))
        return str(cur.fetchone()["id"])


STAT_COLS = [
    "wins", "losses", "win_pct", "sets_won", "sets_lost", "sets_played",
    "kills", "kills_per_set", "service_aces", "aces_per_set",
    "digs", "digs_per_set",
]


def upsert_stats(conn, player_id: str, row: dict):
    vals = {c: row.get(c) for c in STAT_COLS}
    if all(v is None for v in vals.values()):
        return
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO bvb_player_stats (
                player_id, season,
                wins, losses, win_pct, sets_won, sets_lost, sets_played,
                kills, kills_per_set, service_aces, aces_per_set,
                digs, digs_per_set
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (player_id, season) DO UPDATE SET
                wins          = COALESCE(EXCLUDED.wins,          bvb_player_stats.wins),
                losses        = COALESCE(EXCLUDED.losses,        bvb_player_stats.losses),
                win_pct       = COALESCE(EXCLUDED.win_pct,       bvb_player_stats.win_pct),
                sets_won      = COALESCE(EXCLUDED.sets_won,      bvb_player_stats.sets_won),
                sets_lost     = COALESCE(EXCLUDED.sets_lost,     bvb_player_stats.sets_lost),
                sets_played   = COALESCE(EXCLUDED.sets_played,   bvb_player_stats.sets_played),
                kills         = COALESCE(EXCLUDED.kills,         bvb_player_stats.kills),
                kills_per_set = COALESCE(EXCLUDED.kills_per_set, bvb_player_stats.kills_per_set),
                service_aces  = COALESCE(EXCLUDED.service_aces,  bvb_player_stats.service_aces),
                aces_per_set  = COALESCE(EXCLUDED.aces_per_set,  bvb_player_stats.aces_per_set),
                digs          = COALESCE(EXCLUDED.digs,          bvb_player_stats.digs),
                digs_per_set  = COALESCE(EXCLUDED.digs_per_set,  bvb_player_stats.digs_per_set),
                updated_at    = now()
        """, (
            player_id, SEASON,
            vals["wins"], vals["losses"], vals["win_pct"],
            vals["sets_won"], vals["sets_lost"], vals["sets_played"],
            vals["kills"], vals["kills_per_set"],
            vals["service_aces"], vals["aces_per_set"],
            vals["digs"], vals["digs_per_set"],
        ))


# ── Main load ─────────────────────────────────────────────────────────────────

def load_all(conn):
    # Step 1: Find a valid ranking_period
    ranking_period = None
    for sp in STAT_PAGES:
        rp = discover_ranking_period(sp["id"])
        if rp is not None:
            ranking_period = rp
            break

    if ranking_period is None:
        print("\n  [error] No valid ranking_period found for WSV.")
        print("  Beach volleyball stats may not yet be available for 2025-26.")
        print("  Try re-running later in the season (April–May).")
        return

    print(f"\n=== Women's Beach Volleyball (ranking_period={ranking_period}) ===")

    # player_stats_map: ncaa_player_id → merged data dict
    player_map: dict[str, dict] = {}

    for sp in STAT_PAGES:
        url = (
            f"{BASE_URL}?academic_year=2026&division={DIVISION}"
            f"&ranking_period={ranking_period}&sport_code={SPORT}&stat_seq={sp['id']}"
        )
        html = fetch_html(url)
        if not html:
            print(f"  [skip] {sp['title']} — no response")
            continue

        rows = parse_stat_page(html, sp["col_map"])
        if not rows:
            # Try to show actual headers so we can fix the col_map
            headers = get_stat_headers(html)
            if headers:
                print(f"  [skip] {sp['title']} — headers: {headers}")
            else:
                print(f"  [skip] {sp['title']} — no rows parsed")
            continue

        print(f"  {sp['title']:25} {len(rows):4} rows")
        for row in rows:
            pid = row["ncaa_player_id"]
            if pid not in player_map:
                player_map[pid] = {
                    "ncaa_player_id": pid,
                    "full_name":      row["full_name"],
                    "school":         row["school"],
                    "conference":     row["conference"],
                    "class_year":     row.get("class_year"),
                }
            for col in STAT_COLS:
                if row.get(col) is not None:
                    player_map[pid][col] = row[col]

    if not player_map:
        print("  No player data could be parsed.")
        return

    team_id_cache: dict[str, str] = {}
    for row in player_map.values():
        school = row["school"]
        if school not in team_id_cache:
            team_id_cache[school] = upsert_team(conn, school, row.get("conference", ""))
        tid = team_id_cache[school]
        pid = upsert_player(conn, row, tid)
        upsert_stats(conn, pid, row)

    # Summary
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) AS n FROM bvb_teams")
    nt = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) AS n FROM bvb_players")
    np_ = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) AS n FROM bvb_player_stats")
    ns = cur.fetchone()["n"]
    print(f"\n============================================================")
    print(f"BVB DONE")
    print(f"  Teams: {nt}  Players: {np_}  Stat rows: {ns}")
    print(f"============================================================")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]

    if "probe" in args:
        rp = discover_ranking_period()
        if rp:
            print(f"\nValid ranking_period: {rp}")
            working = discover_stat_ids(rp)
            print(f"\nWorking stat IDs: {working}")
        else:
            print("No valid ranking_period found for WSV 2025-26.")
        return

    conn = get_conn()
    try:
        load_all(conn)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
