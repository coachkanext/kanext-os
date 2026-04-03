#!/usr/bin/env python3.12
"""
NCAA Football Stats Scraper — stats.ncaa.org
Loads D2 and D3 football individual player stats.

Source:  https://stats.ncaa.org/rankings/national_ranking (sport_code=MFB)
Season:  2024-25 (academic_year=2025, fall 2024)
Periods: D2 = 34 (Final), D3 = 30 (Final)

Stat pages scraped per division:
   7  Rushing           G, Rush, Rush Yds, Rush TD, YPG
   8  Passing           G, Pass Att, Pass Com, Int, Pass Yds, Pass TD, Pass Eff
  12  Receiving         G, Rec, Rec Yds, Rec TD, Rec PG
  14  Interceptions     G, Int, Int Ret Yds, Int Ret TDs, Int PG
  19  Scoring           G, TDs, PAT, PAT Att, 2PT, FG, FGA, Def Pts, Pts, PPG
  34  Tackles           G, Solo Tack, Asst Tack, TT, TPG
  36  Sacks             G, Solo Sack, Asst Sack, Sack Yds, Tot Sack, Sacks PG
  37  Forced Fumbles    G, FF, FFPG
  38  Passes Defended   G, PBU, Int, TPD, PDPG
  39  Tackles For Loss  G, STFL, ATFL, Tackle Yds, TTFL, TFLPG

Tables written:
  ncaa_conferences     — D2/D3 football conferences
  ncaa_teams           — D2/D3 football teams
  ncaa_players         — players (sport='football', season='2024-25')
  football_player_stats — stats (one row per player)

Usage:
    python3.12 ncaa_football_scraper.py          # both D2 and D3
    python3.12 ncaa_football_scraper.py d2        # D2 only
    python3.12 ncaa_football_scraper.py d3        # D3 only
    python3.12 ncaa_football_scraper.py probe     # test 1 page per div
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

# ── Config ────────────────────────────────────────────────────────────────────

DB_CONFIG    = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}
SEASON       = "2024-25"
SPORT_CODE   = "MFB"
ACAD_YEAR    = "2025"
DELAY        = 0.6
BASE_URL     = "https://stats.ncaa.org/rankings/national_ranking"
HEADERS_HTTP = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}

DIVISIONS = [
    {"code": "d2", "num": "2", "rp": "34", "level_key": "football_d2", "display": "Football D2"},
    {"code": "d3", "num": "3", "rp": "30", "level_key": "football_d3", "display": "Football D3"},
]

# ── Stat page definitions ─────────────────────────────────────────────────────
# col_map: stats.ncaa.org column header → football_player_stats column

INT_COLS = {
    "games", "rush_att", "rush_yards", "rush_td",
    "pass_att", "pass_comp", "pass_int", "pass_yards", "pass_td",
    "receptions", "rec_yards", "rec_td",
    "int_count", "int_yards", "int_td",
    "tds", "points", "fg_made", "fg_att",
    "tackles", "solo_tackles", "ast_tackles",
    "sacks_solo", "sacks_ast", "sack_yards",
    "forced_fumbles", "passes_defended",
    "tfl_solo", "tfl_ast", "tfl_yards", "tfl",
}

STAT_PAGES = [
    {
        "id": 7, "title": "Rushing",
        "col_map": {
            "G":        "games",
            "Rush":     "rush_att",
            "Rush Yds": "rush_yards",
            "Rush TD":  "rush_td",
            "YPG":      "rush_ypg",
        },
    },
    {
        "id": 8, "title": "Passing",
        "col_map": {
            "G":        "games",
            "Pass Att": "pass_att",
            "Pass Com": "pass_comp",
            "Int":      "pass_int",
            "Pass Yds": "pass_yards",
            "Pass TD":  "pass_td",
            "Pass Eff": "pass_eff",
        },
    },
    {
        "id": 12, "title": "Receiving",
        "col_map": {
            "G":       "games",
            "Rec":     "receptions",
            "Rec Yds": "rec_yards",
            "Rec TD":  "rec_td",
            "Rec PG":  "rec_pg",
        },
    },
    {
        "id": 14, "title": "Interceptions",
        "col_map": {
            "G":           "games",
            "Int":         "int_count",
            "Int Ret Yds": "int_yards",
            "Int Ret TDs": "int_td",
        },
    },
    {
        "id": 19, "title": "Scoring",
        "col_map": {
            "G":   "games",
            "TDs": "tds",
            "FG":  "fg_made",
            "FGA": "fg_att",
            "Pts": "points",
            "PPG": "ppg",
        },
    },
    {
        "id": 34, "title": "Tackles",
        "col_map": {
            "G":          "games",
            "Solo Tack":  "solo_tackles",
            "Asst Tack":  "ast_tackles",
            "TT":         "tackles",
        },
    },
    {
        "id": 36, "title": "Sacks",
        "col_map": {
            "G":         "games",
            "Sack Yds":  "sack_yards",
            "Tot Sack":  "sacks",
        },
    },
    {
        "id": 37, "title": "Forced Fumbles",
        "col_map": {
            "G":  "games",
            "FF": "forced_fumbles",
        },
    },
    {
        "id": 38, "title": "Passes Defended",
        "col_map": {
            "G":   "games",
            "TPD": "passes_defended",
        },
    },
    {
        "id": 39, "title": "Tackles For Loss",
        "col_map": {
            "G":           "games",
            "Tackle Yds":  "tfl_yards",
            "TTFL":        "tfl",
        },
    },
]

# ── HTTP ──────────────────────────────────────────────────────────────────────

_last = 0.0

def fetch_html(url: str, params: dict) -> Optional[str]:
    global _last
    wait = DELAY - (time.time() - _last)
    if wait > 0:
        time.sleep(wait)
    try:
        r = httpx.get(url, params=params, headers=HEADERS_HTTP, timeout=30, follow_redirects=True)
        _last = time.time()
        if r.status_code == 200 and "rankings_table" in r.text:
            return r.text
        return None
    except Exception as e:
        print(f"  [err] {e}")
        return None


# ── Parse ─────────────────────────────────────────────────────────────────────

def safe_num(v: str, as_int=False):
    if not v:
        return None
    try:
        v = v.replace(",", "").strip()
        f = float(v)
        return int(round(f)) if as_int else f
    except ValueError:
        return None


def parse_stat_page(html: str, col_map: dict) -> list[dict]:
    soup  = BeautifulSoup(html, "html.parser")
    table = soup.find("table", id="rankings_table")
    if not table:
        return []

    thead = table.find("thead")
    col_headers = [th.get_text(strip=True) for th in thead.find_all("th")] if thead else []

    rows = []
    for tr in (table.find("tbody") or table).find_all("tr"):
        cells = tr.find_all("td")
        if len(cells) < 4:
            continue

        # Player cell — identical format to WBB scraper
        pcell = cells[1]
        link  = pcell.find("a", href=re.compile(r"/players/\d+"))
        if not link:
            continue
        m = re.search(r"/players/(\d+)", link.get("href", ""))
        if not m:
            continue
        ncaa_player_id = m.group(1)

        # Parse name, school, conference
        school = conference = full_name = ""
        data_order = pcell.get("data-order", "")
        if data_order:
            parts = data_order.split(",")
            if len(parts) >= 4:
                full_name  = f"{parts[1].strip()} {parts[0].strip()}"
                school     = parts[2].strip()
                conference = parts[3].strip()
            elif len(parts) == 3:
                full_name = f"{parts[1].strip()} {parts[0].strip()}"
                school    = parts[2].strip()
            else:
                full_name = link.get_text(strip=True)
        else:
            txt = link.get_text(strip=True)
            # "First Last, School (Conf)" or "First Last, School (State) (Conf)"
            # Conference = last (...) group
            conf_m = re.search(r"\(([^)]+)\)\s*$", txt)
            if conf_m:
                conference = conf_m.group(1)
                remainder  = txt[: conf_m.start()].strip()
            else:
                remainder = txt
            comma = remainder.find(",")
            if comma >= 0:
                full_name = remainder[:comma].strip()
                school    = remainder[comma + 1:].strip()
                # Strip trailing conference parens from school
                school = re.sub(r"\s*\([^)]+\)\s*$", "", school).strip()
            else:
                full_name = remainder

        # Meta fields
        class_year = position = height_str = ""
        for i, hdr in enumerate(col_headers):
            if i >= len(cells):
                break
            val = cells[i].get_text(strip=True)
            if hdr == "Cl":
                class_year = val
            elif hdr == "Pos":
                position = val
            elif hdr == "Ht":
                height_str = val

        # Numeric stats
        stat_vals: dict = {}
        for i, hdr in enumerate(col_headers):
            db_col = col_map.get(hdr)
            if db_col and i < len(cells):
                raw = cells[i].get_text(strip=True)
                stat_vals[db_col] = safe_num(raw, as_int=(db_col in INT_COLS))

        rows.append({
            "ncaa_player_id": ncaa_player_id,
            "full_name":      full_name,
            "school":         school,
            "conference":     conference,
            "class_year":     class_year,
            "position":       position,
            "height_str":     height_str,
            **stat_vals,
        })

    return rows


# ── DB helpers ────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)


def get_or_create_conf(conn, name: str, level_id: str) -> str:
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO ncaa_conferences (level_id, name, abbreviation)
            VALUES (%s, %s, %s)
            ON CONFLICT (level_id, name) DO UPDATE SET abbreviation = EXCLUDED.abbreviation
            RETURNING id
        """, (level_id, name, name))
        return str(cur.fetchone()["id"])


def get_or_create_team(conn, name: str, conf_id: Optional[str], season: str) -> str:
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO ncaa_teams (conference_id, name, season)
            VALUES (%s, %s, %s)
            ON CONFLICT (conference_id, name, season) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
        """, (conf_id, name, season))
        return str(cur.fetchone()["id"])


def upsert_player(conn, full_name: str, team_id: Optional[str],
                  class_year: str, height_str: str, position: str) -> str:
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO ncaa_players
                (full_name, sport, team_id, season, position, class_year, height)
            VALUES (%s, 'football', %s, %s, %s, %s, %s)
            ON CONFLICT (full_name, sport, season) DO UPDATE SET
                team_id    = COALESCE(EXCLUDED.team_id, ncaa_players.team_id),
                position   = COALESCE(NULLIF(EXCLUDED.position,''), ncaa_players.position),
                class_year = COALESCE(NULLIF(EXCLUDED.class_year,''), ncaa_players.class_year),
                height     = COALESCE(NULLIF(EXCLUDED.height,''), ncaa_players.height),
                updated_at = now()
            RETURNING id
        """, (full_name, team_id, SEASON, position, class_year, height_str))
        return str(cur.fetchone()["id"])


def upsert_stats(conn, player_id: str, stats: dict):
    # Build dynamic SET clause only for non-None values
    # Use COALESCE so first non-null value wins (multi-page merge)
    cols = [k for k, v in stats.items() if v is not None]
    if not cols:
        return
    with conn.transaction():
        cur = conn.cursor()
        vals = [stats[c] for c in cols] + [player_id]
        set_clause = ", ".join(
            f"{c} = COALESCE(EXCLUDED.{c}, football_player_stats.{c})"
            for c in cols
        )
        cur.execute(f"""
            INSERT INTO football_player_stats (player_id, {", ".join(cols)})
            VALUES (%s, {", ".join(["%s"] * len(cols))})
            ON CONFLICT (player_id) DO UPDATE SET {set_clause}
        """, [player_id] + [stats[c] for c in cols])


# ── Division loader ───────────────────────────────────────────────────────────

def load_division(conn, div: dict, probe_only=False):
    level_key = div["level_key"]
    div_num   = div["num"]
    rp        = div["rp"]

    # Get level_id for this football division
    cur = conn.cursor()
    cur.execute("SELECT id FROM ncaa_competitive_levels WHERE level_key = %s", (level_key,))
    row = cur.fetchone()
    conn.commit()
    if not row:
        print(f"  [error] No ncaa_competitive_levels entry for {level_key}")
        return 0, 0

    level_id = str(row["id"])

    # Cache: conf_name → conf_id, team_key → team_id
    conf_cache: dict[str, str] = {}
    team_cache: dict[str, str] = {}

    # Master player dict: ncaa_player_id → merged row
    all_players: dict[str, dict] = {}

    for sp in STAT_PAGES:
        stat_seq = sp["id"]
        params = {
            "academic_year":   ACAD_YEAR,
            "division":        div_num,
            "ranking_period":  rp,
            "sport_code":      SPORT_CODE,
            "stat_seq":        str(stat_seq),
        }
        html = fetch_html(BASE_URL, params)
        if not html:
            print(f"  [{div['code'].upper()}] stat {stat_seq} ({sp['title']}): no data")
            continue

        rows = parse_stat_page(html, sp["col_map"])
        print(f"  [{div['code'].upper()}] stat {stat_seq:3d} {sp['title']:<20}: {len(rows)} players")

        for row in rows:
            pid = row["ncaa_player_id"]
            if pid not in all_players:
                all_players[pid] = {k: v for k, v in row.items()}
            else:
                # Merge: keep best games count, fill in missing stats
                existing = all_players[pid]
                for k, v in row.items():
                    if v is not None and k not in ("ncaa_player_id", "full_name", "school", "conference",
                                                   "class_year", "position", "height_str"):
                        if k == "games":
                            if not existing.get("games") or (v and v > existing["games"]):
                                existing["games"] = v
                        else:
                            existing.setdefault(k, v)

        if probe_only:
            break  # one page is enough for probe mode

    total_new_teams = 0
    written = 0

    for pid, row in all_players.items():
        school    = row.get("school", "").strip()
        conf_name = row.get("conference", "").strip()
        full_name = row.get("full_name", "").strip()
        if not full_name or not school:
            continue

        # Conference
        if conf_name and conf_name not in conf_cache:
            conf_id = get_or_create_conf(conn, conf_name, level_id)
            conf_cache[conf_name] = conf_id
        conf_id = conf_cache.get(conf_name)

        # Team
        team_key = f"{school}|{conf_name}"
        if team_key not in team_cache:
            tid = get_or_create_team(conn, school, conf_id, SEASON)
            team_cache[team_key] = tid
            total_new_teams += 1
        team_id = team_cache[team_key]

        # Player
        player_id = upsert_player(
            conn, full_name, team_id,
            row.get("class_year", ""),
            row.get("height_str", ""),
            row.get("position", ""),
        )

        # Stats
        stat_keys = [
            "games",
            "rush_att", "rush_yards", "rush_td", "rush_ypg",
            "pass_att", "pass_comp", "pass_int", "pass_yards", "pass_td", "pass_eff",
            "receptions", "rec_yards", "rec_td", "rec_pg",
            "int_count", "int_yards", "int_td",
            "tds", "fg_made", "fg_att", "points", "ppg",
            "tackles", "solo_tackles", "ast_tackles",
            "sacks", "sack_yards",
            "forced_fumbles", "passes_defended",
            "tfl", "tfl_yards",
        ]
        stats = {k: row.get(k) for k in stat_keys if row.get(k) is not None}
        upsert_stats(conn, player_id, stats)
        written += 1

    conn.commit()
    print(f"  [{div['code'].upper()}] Done: {written} players, {len(conf_cache)} confs, {len(team_cache)} teams")
    return written, len(team_cache)


# ── Summary ───────────────────────────────────────────────────────────────────

def print_summary(conn):
    cur = conn.cursor()
    for div in DIVISIONS:
        level_key = div["level_key"]
        cur.execute("""
            SELECT COUNT(DISTINCT t.id) AS teams, COUNT(DISTINCT p.id) AS players,
                   COUNT(DISTINCT s.id) AS stat_rows
            FROM ncaa_players p
            JOIN ncaa_teams t ON t.id = p.team_id
            JOIN ncaa_conferences c ON c.id = t.conference_id
            JOIN ncaa_competitive_levels cl ON cl.id = c.level_id
            LEFT JOIN football_player_stats s ON s.player_id = p.id
            WHERE cl.level_key = %s AND p.sport = 'football' AND p.season = %s
        """, (level_key, SEASON))
        r = cur.fetchone()
        print(f"  {div['display']:<18}: {r['teams']:>4} teams, {r['players']:>5} players, {r['stat_rows']:>5} stat rows")

    print()
    cur.execute("""
        SELECT p.full_name, t.name AS team, s.rush_yards, s.rush_td, s.rush_ypg
        FROM football_player_stats s
        JOIN ncaa_players p ON p.id = s.player_id
        JOIN ncaa_teams   t ON t.id = p.team_id
        WHERE p.sport = 'football' AND p.season = %s AND s.rush_yards IS NOT NULL
        ORDER BY s.rush_yards DESC LIMIT 6
    """, (SEASON,))
    print("  Top rushers:")
    for r in cur.fetchall():
        print(f"    {r['full_name']:<22} {r['team']:<28} {r['rush_yards']} yds ({r['rush_ypg']} ypg) {r['rush_td']} TD")

    cur.execute("""
        SELECT p.full_name, t.name AS team, s.pass_yards, s.pass_td, s.pass_eff
        FROM football_player_stats s
        JOIN ncaa_players p ON p.id = s.player_id
        JOIN ncaa_teams   t ON t.id = p.team_id
        WHERE p.sport = 'football' AND p.season = %s AND s.pass_yards IS NOT NULL
        ORDER BY s.pass_yards DESC LIMIT 4
    """, (SEASON,))
    print("  Top passers:")
    for r in cur.fetchall():
        print(f"    {r['full_name']:<22} {r['team']:<28} {r['pass_yards']} yds  {r['pass_td']} TD  eff={r['pass_eff']}")
    conn.commit()


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    arg = sys.argv[1].lower() if len(sys.argv) > 1 else "all"

    if arg == "probe":
        print("\n=== NCAA Football Scraper PROBE ===")
        conn = get_conn()
        try:
            for div in DIVISIONS:
                print(f"\n-- {div['display']} --")
                load_division(conn, div, probe_only=True)
        finally:
            conn.close()
        return

    divs = DIVISIONS if arg == "all" else [d for d in DIVISIONS if d["code"] == arg]
    if not divs:
        print(f"Unknown argument: {arg}. Use: all / d2 / d3 / probe")
        sys.exit(1)

    print(f"\n=== NCAA Football Scraper (season={SEASON}) ===")
    print(f"  Divisions: {[d['code'] for d in divs]}")
    print(f"  Stat pages: {len(STAT_PAGES)} per division")
    print()

    conn = get_conn()
    try:
        total_players = 0
        for div in divs:
            print(f"\n--- {div['display']} (rp={div['rp']}) ---")
            n, _ = load_division(conn, div)
            total_players += n

        print(f"\n  Total players written: {total_players}")
        print()
        print("=== Summary ===")
        print_summary(conn)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
