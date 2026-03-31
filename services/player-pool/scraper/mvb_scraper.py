"""
Men's Volleyball Scraper — stats.ncaa.org
Source: https://stats.ncaa.org/rankings/national_ranking
Loads: mvb_teams, mvb_players, mvb_player_stats

Data availability:
  D1: ranking_period=59 (most recent as of 2025-26 season)
  D3: ranking_period=57 (most recent as of 2025-26 season)
  D2: NOT available on stats.ncaa.org for men's volleyball

Stat pages scraped per division:
  521 Kills Per Set, 522 Assists Per Set, 523 Blocks Per Set,
  524 Digs Per Set, 532 Aces Per Set, 520 Hitting Pct, 686 Points Per Set

Usage:
    python3 mvb_scraper.py              # all divisions + all stats
    python3 mvb_scraper.py d1           # D1 only
    python3 mvb_scraper.py d3           # D3 only
    python3 mvb_scraper.py probe        # auto-discover ranking periods
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
DELAY     = 0.7    # seconds between requests
HEADERS   = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}

BASE_URL  = "https://stats.ncaa.org/rankings/national_ranking"

# ── Division configs ──────────────────────────────────────────────────────────
DIVISIONS = [
    {"code": "d1", "num": 1, "ranking_period": 59},
    # D2 men's volleyball is not available on stats.ncaa.org
    {"code": "d3", "num": 3, "ranking_period": 57},
]

# ── Stat pages — id → col_map ─────────────────────────────────────────────────
# Keys are exact header text from stats.ncaa.org DataTable <thead>
STAT_PAGES = [
    {
        "id":      521,
        "title":   "Kills Per Set",
        "col_map": {"S": "sets_played", "Kills": "kills", "Per Set": "kills_per_set"},
    },
    {
        "id":      522,
        "title":   "Assists Per Set",
        "col_map": {"S": "sets_played", "Assists": "assists", "Per Set": "assists_per_set"},
    },
    {
        "id":      523,
        "title":   "Blocks Per Set",
        "col_map": {
            "S":             "sets_played",
            "Block Solos":   "solo_blocks",
            "Block Assists": "block_assists",
            "Total":         "total_blocks",
            "Per Set":       "blocks_per_set",
        },
    },
    {
        "id":      524,
        "title":   "Digs Per Set",
        "col_map": {"S": "sets_played", "Digs": "digs", "Per Set": "digs_per_set"},
    },
    {
        "id":      532,
        "title":   "Aces Per Set",
        "col_map": {"S": "sets_played", "Aces": "service_aces", "Per Set": "aces_per_set"},
    },
    {
        "id":      520,
        "title":   "Hitting Percentage",
        "col_map": {
            "S":             "sets_played",
            "Kills":         "kills",
            "Errors":        "attack_errors",
            "Total Attacks": "attacks",
            "Pct.":          "hitting_pct",
        },
    },
    {
        "id":      686,
        "title":   "Points Per Set",
        "col_map": {"S": "sets_played", "Points": "points", "Per Set": "points_per_set"},
    },
]


# ── Helpers ───────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)


def fetch_html(url: str) -> Optional[str]:
    try:
        r = httpx.get(url, headers=HEADERS, timeout=25, follow_redirects=True)
        time.sleep(DELAY)
        if r.status_code == 200:
            return r.text
        print(f"  [warn] HTTP {r.status_code}: {url}")
    except Exception as e:
        print(f"  [warn] fetch error: {e}")
    return None


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


# ── Parse one stat rankings page ──────────────────────────────────────────────

def parse_stat_page(html: str, col_map: dict) -> list[dict]:
    """
    Parse a stats.ncaa.org rankings page.
    Returns list of dicts: {ncaa_player_id, full_name, school, conference,
                             class_year, height_str, position, **stat_cols}
    """
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table", id="rankings_table")
    if not table:
        return []

    # Build header → index map
    headers = []
    thead = table.find("thead")
    if thead:
        for th in thead.find_all("th"):
            headers.append(th.get_text(strip=True))

    rows = []
    tbody = table.find("tbody")
    if not tbody:
        return []

    for tr in tbody.find_all("tr"):
        cells = tr.find_all("td")
        if len(cells) < 5:
            continue

        # Cell 0: Rank (skip)
        # Cell 1: Player link + school
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

        # Remaining text after the link: ", School (Conference)"
        raw_tail = player_cell.get_text(separator="|").split("|", 1)[-1].strip(" ,|")
        school = ""
        conference = ""
        conf_m = re.match(r"^(.*?)\s*\(([^)]+)\)\s*$", raw_tail)
        if conf_m:
            school = conf_m.group(1).strip().rstrip(",").strip()
            conference = conf_m.group(2).strip()
        else:
            school = raw_tail.strip().rstrip(",").strip()

        # Remaining cells: Cl, Ht, Pos, then stat columns
        # Positions of Cl/Ht/Pos depend on headers; find them by name
        class_year = ""
        height_str = ""
        position   = ""

        def cell_text(idx: int) -> str:
            if idx < len(cells):
                return cells[idx].get_text(strip=True)
            return ""

        # Typical order after player cell: Cl(2), Ht(3), Pos(4), S(5), ...
        if len(headers) >= 5:
            for i, hdr in enumerate(headers[2:], start=2):
                if hdr in ("Cl",):
                    class_year = cell_text(i)
                elif hdr in ("Ht",):
                    height_str = cell_text(i)
                elif hdr in ("Pos",):
                    position   = cell_text(i)

        # Map stat columns by header name
        stat_vals: dict = {}
        for i, hdr in enumerate(headers):
            db_col = col_map.get(hdr)
            if db_col and i < len(cells):
                raw = cell_text(i)
                if db_col in ("sets_played", "kills", "attack_errors", "attacks",
                              "assists", "solo_blocks", "block_assists", "digs",
                              "service_aces", "points"):
                    stat_vals[db_col] = safe_int(raw)
                else:
                    stat_vals[db_col] = safe_float(raw)

        rows.append({
            "ncaa_player_id": ncaa_player_id,
            "full_name":      full_name,
            "school":         school,
            "conference":     conference,
            "class_year":     class_year,
            "height_str":     height_str,
            "position":       position,
            **stat_vals,
        })

    return rows


# ── DB write ──────────────────────────────────────────────────────────────────

def upsert_team(conn, name: str, conference: str, division: str) -> str:
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO mvb_teams (name, conference, division)
            VALUES (%s, %s, %s)
            ON CONFLICT (name, division) DO UPDATE SET
                conference = COALESCE(EXCLUDED.conference, mvb_teams.conference)
            RETURNING id
        """, (name, conference or None, division))
        return str(cur.fetchone()["id"])


def upsert_player(conn, row: dict, team_id: str, division: str) -> str:
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO mvb_players
                (ncaa_player_id, full_name, team_id, division,
                 class_year, height_str, position)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (ncaa_player_id) DO UPDATE SET
                full_name  = EXCLUDED.full_name,
                team_id    = EXCLUDED.team_id,
                division   = EXCLUDED.division,
                class_year = COALESCE(EXCLUDED.class_year, mvb_players.class_year),
                height_str = COALESCE(EXCLUDED.height_str, mvb_players.height_str),
                position   = COALESCE(EXCLUDED.position,   mvb_players.position),
                updated_at = now()
            RETURNING id
        """, (
            row["ncaa_player_id"], row["full_name"], team_id, division,
            row.get("class_year") or None,
            row.get("height_str") or None,
            row.get("position")   or None,
        ))
        return str(cur.fetchone()["id"])


STAT_COLS = [
    "sets_played", "kills", "attack_errors", "attacks", "hitting_pct",
    "kills_per_set", "assists", "assists_per_set", "solo_blocks",
    "block_assists", "total_blocks", "blocks_per_set", "digs", "digs_per_set",
    "service_aces", "aces_per_set", "points", "points_per_set",
]


def upsert_stats(conn, player_id: str, division: str, row: dict):
    # Only proceed if at least one stat value is present
    vals = {c: row.get(c) for c in STAT_COLS}
    if all(v is None for v in vals.values()):
        return

    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO mvb_player_stats (
                player_id, division, season,
                sets_played, kills, attack_errors, attacks, hitting_pct,
                kills_per_set, assists, assists_per_set,
                solo_blocks, block_assists, total_blocks, blocks_per_set,
                digs, digs_per_set, service_aces, aces_per_set,
                points, points_per_set
            ) VALUES (
                %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
            )
            ON CONFLICT (player_id, division, season) DO UPDATE SET
                sets_played     = COALESCE(EXCLUDED.sets_played,     mvb_player_stats.sets_played),
                kills           = COALESCE(EXCLUDED.kills,           mvb_player_stats.kills),
                attack_errors   = COALESCE(EXCLUDED.attack_errors,   mvb_player_stats.attack_errors),
                attacks         = COALESCE(EXCLUDED.attacks,         mvb_player_stats.attacks),
                hitting_pct     = COALESCE(EXCLUDED.hitting_pct,     mvb_player_stats.hitting_pct),
                kills_per_set   = COALESCE(EXCLUDED.kills_per_set,   mvb_player_stats.kills_per_set),
                assists         = COALESCE(EXCLUDED.assists,         mvb_player_stats.assists),
                assists_per_set = COALESCE(EXCLUDED.assists_per_set, mvb_player_stats.assists_per_set),
                solo_blocks     = COALESCE(EXCLUDED.solo_blocks,     mvb_player_stats.solo_blocks),
                block_assists   = COALESCE(EXCLUDED.block_assists,   mvb_player_stats.block_assists),
                total_blocks    = COALESCE(EXCLUDED.total_blocks,    mvb_player_stats.total_blocks),
                blocks_per_set  = COALESCE(EXCLUDED.blocks_per_set,  mvb_player_stats.blocks_per_set),
                digs            = COALESCE(EXCLUDED.digs,            mvb_player_stats.digs),
                digs_per_set    = COALESCE(EXCLUDED.digs_per_set,    mvb_player_stats.digs_per_set),
                service_aces    = COALESCE(EXCLUDED.service_aces,    mvb_player_stats.service_aces),
                aces_per_set    = COALESCE(EXCLUDED.aces_per_set,    mvb_player_stats.aces_per_set),
                points          = COALESCE(EXCLUDED.points,          mvb_player_stats.points),
                points_per_set  = COALESCE(EXCLUDED.points_per_set,  mvb_player_stats.points_per_set),
                updated_at      = now()
        """, (
            player_id, division, SEASON,
            vals["sets_played"], vals["kills"], vals["attack_errors"],
            vals["attacks"], vals["hitting_pct"], vals["kills_per_set"],
            vals["assists"], vals["assists_per_set"],
            vals["solo_blocks"], vals["block_assists"], vals["total_blocks"],
            vals["blocks_per_set"], vals["digs"], vals["digs_per_set"],
            vals["service_aces"], vals["aces_per_set"],
            vals["points"], vals["points_per_set"],
        ))


# ── Ranking period probe ──────────────────────────────────────────────────────

def probe_ranking_period(div_num: int) -> Optional[int]:
    """
    Auto-discover the most recent ranking_period for MVB in a division by
    fetching the page and reading the dropdown.
    """
    # Try a broad range descending; stop at first working period
    for period in range(90, 0, -1):
        url = (
            f"{BASE_URL}?academic_year=2026&division={div_num}"
            f"&ranking_period={period}&sport_code=MVB&stat_seq=521"
        )
        html = fetch_html(url)
        if not html:
            continue
        soup = BeautifulSoup(html, "html.parser")
        tbody = soup.find("tbody")
        if tbody and tbody.find("tr"):
            print(f"  [probe] D{div_num} ranking_period={period}")
            return period
    return None


# ── Load one division ─────────────────────────────────────────────────────────

def load_division(conn, div_cfg: dict):
    div_code   = div_cfg["code"]
    div_num    = div_cfg["num"]
    rp         = div_cfg["ranking_period"]

    print(f"\n=== Men's Volleyball {div_code.upper()} (ranking_period={rp}) ===")

    # player_stats_map: ncaa_player_id → merged stat dict + meta
    player_map: dict[str, dict] = {}

    for sp in STAT_PAGES:
        url = (
            f"{BASE_URL}?academic_year=2026&division={div_num}"
            f"&ranking_period={rp}&sport_code=MVB&stat_seq={sp['id']}"
        )
        html = fetch_html(url)
        if not html:
            print(f"  [skip] {sp['title']} — no response")
            continue

        rows = parse_stat_page(html, sp["col_map"])
        if not rows:
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
                    "height_str":     row.get("height_str"),
                    "position":       row.get("position"),
                }
            # Merge stat values (don't overwrite with None)
            for col in STAT_COLS:
                if row.get(col) is not None:
                    player_map[pid][col] = row[col]

    if not player_map:
        print(f"  No data found for {div_code.upper()}")
        return

    # Upsert teams → players → stats
    team_id_cache: dict[str, str] = {}
    p_inserted = p_updated = 0

    for row in player_map.values():
        school = row["school"]
        if school not in team_id_cache:
            team_id_cache[school] = upsert_team(conn, school, row["conference"], div_code)
        tid = team_id_cache[school]

        pid = upsert_player(conn, row, tid, div_code)
        upsert_stats(conn, pid, div_code, row)
        p_inserted += 1

    print(f"  → {len(team_id_cache)} teams, {p_inserted} players written")


# ── Summary ───────────────────────────────────────────────────────────────────

def print_summary(conn):
    cur = conn.cursor()
    cur.execute("SELECT division, COUNT(*) AS n FROM mvb_teams GROUP BY division ORDER BY division")
    teams = cur.fetchall()
    cur.execute("SELECT division, COUNT(*) AS n FROM mvb_players GROUP BY division ORDER BY division")
    players = cur.fetchall()
    cur.execute("SELECT division, COUNT(*) AS n FROM mvb_player_stats GROUP BY division ORDER BY division")
    stats = cur.fetchall()
    print("\n============================================================")
    print("MVB DONE")
    for t in teams:
        d = t["division"]
        pc = next((r["n"] for r in players if r["division"] == d), 0)
        sc = next((r["n"] for r in stats   if r["division"] == d), 0)
        print(f"  {d.upper():4}: {t['n']:4} teams  {pc:4} players  {sc:4} stat rows")
    print("============================================================")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]

    if "probe" in args:
        for div in DIVISIONS:
            rp = probe_ranking_period(div["num"])
            print(f"D{div['num']} ranking_period = {rp}")
        return

    # Filter divisions
    if args:
        target = args[0].lower()
        divs = [d for d in DIVISIONS if d["code"] == target]
        if not divs:
            print(f"Unknown division '{target}'. Use: d1 d3 probe")
            sys.exit(1)
    else:
        divs = DIVISIONS

    conn = get_conn()
    try:
        for div_cfg in divs:
            load_division(conn, div_cfg)
        print_summary(conn)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
