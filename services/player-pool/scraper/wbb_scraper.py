"""
Women's Basketball Advanced Stats Scraper — stats.ncaa.org
Source: https://stats.ncaa.org/rankings/national_ranking (sport_code=WBB)
Loads: wbb_adv_teams, wbb_adv_players, wbb_adv_stats

Divisions: D1 (division=1), D2 (division=2), D3 (division=3)
ranking_period: auto-discovered per division (scans 250→1)

Stat pages scraped per division:
  102  Scoring         G, FGM, 3FG, FT, PTS, PPG
  103  Rebounds        G, ORebs, DRebs, REB, RPG
  104  Blocks Per Game G, BLKS, BKPG
  105  Steals Per Game G, ST, STPG
  106  Assists Per Game G, AST, APG
  107  Field Goal Pct  G, FGM, FGA, FG%
  108  Free Throw Pct  G, FT, FTA, FT%
  109  3FG Pct         G, 3FG, 3FGA, 3FG%
  471  AST/TO Ratio    G, AST, TO, Ratio
  554  Double-Doubles  G, Dbl Dbl
  555  Triple-Doubles  G, Trpl Dbl
  852  Off Rebounds    G, ORebs, RPG
  854  Def Rebounds    G, DRebs, RPG
  997  3FG Totals      G, 3FG, 3FGA
  1001 FT Totals       G, FT, FTA
  1005 Minutes         G, MP, Avg
  1018 FGM/FGA Totals  G, FGM, FGA

Computed:
  efg_pct  = (FGM + 0.5*3FGM) / FGA
  ts_pct   = PTS / (2*(FGA + 0.44*FTA))

Usage:
    python3 wbb_scraper.py              # all divisions
    python3 wbb_scraper.py d1           # D1 only
    python3 wbb_scraper.py d2           # D2 only
    python3 wbb_scraper.py d3           # D3 only
    python3 wbb_scraper.py probe        # discover ranking periods only
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
DELAY     = 0.6
HEADERS   = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}

BASE_URL  = "https://stats.ncaa.org/rankings/national_ranking"
SPORT     = "WBB"

# ── Stat pages ────────────────────────────────────────────────────────────────
# col_map keys = exact header text from stats.ncaa.org DataTable <thead>
STAT_PAGES = [
    # Scoring: G, FGM, 3FG, FT, PTS, PPG
    {
        "id":      102,
        "title":   "Scoring",
        "col_map": {
            "G":   "games",
            "FGM": "fgm_scoring",   # temporary key — may clash with stat 107
            "3FG": "fg3m",
            "FT":  "ftm",
            "PTS": "points",
            "PPG": "ppg",
        },
    },
    # Rebounds: G, ORebs, DRebs, REB, RPG
    {
        "id":      103,
        "title":   "Rebounds",
        "col_map": {
            "G":     "games",
            "ORebs": "offensive_reb",
            "DRebs": "defensive_reb",
            "REB":   "rebounds",
            "RPG":   "rpg",
        },
    },
    # Blocks Per Game: G, BLKS, BKPG
    {
        "id":      104,
        "title":   "Blocks Per Game",
        "col_map": {"G": "games", "BLKS": "blocks", "BKPG": "bpg"},
    },
    # Steals Per Game: G, ST, STPG
    {
        "id":      105,
        "title":   "Steals Per Game",
        "col_map": {"G": "games", "ST": "steals", "STPG": "spg"},
    },
    # Assists Per Game: G, AST, APG
    {
        "id":      106,
        "title":   "Assists Per Game",
        "col_map": {"G": "games", "AST": "assists", "APG": "apg"},
    },
    # Field Goal Pct: G, FGM, FGA, FG%
    {
        "id":      107,
        "title":   "Field Goal Pct",
        "col_map": {"G": "games", "FGM": "fgm", "FGA": "fga", "FG%": "fg_pct"},
    },
    # Free Throw Pct: G, FT, FTA, FT%
    {
        "id":      108,
        "title":   "Free Throw Pct",
        "col_map": {"G": "games", "FT": "ftm_ft", "FTA": "fta", "FT%": "ft_pct"},
    },
    # 3FG Pct: G, 3FG, 3FGA, 3FG%
    {
        "id":      109,
        "title":   "3FG Pct",
        "col_map": {"G": "games", "3FG": "fg3m_3fgpct", "3FGA": "fg3a", "3FG%": "fg3_pct"},
    },
    # AST/TO Ratio: G, AST, TO, Ratio  — gives us TURNOVERS
    {
        "id":      471,
        "title":   "AST/TO Ratio",
        "col_map": {"G": "games", "AST": "assists_ratio", "TO": "turnovers", "Ratio": "ast_to_ratio"},
    },
    # Double-Doubles
    {
        "id":      554,
        "title":   "Double-Doubles",
        "col_map": {"G": "games", "Dbl Dbl": "double_doubles"},
    },
    # Triple-Doubles
    {
        "id":      555,
        "title":   "Triple-Doubles",
        "col_map": {"G": "games", "Trpl Dbl": "triple_doubles"},
    },
    # Minutes: G, MP, Avg
    {
        "id":      1005,
        "title":   "Minutes",
        "col_map": {"G": "games", "MP": "minutes_played", "Avg": "mpg"},
    },
]

INT_COLS = {
    "games", "fgm", "fga", "fg3m", "fg3a", "ftm", "fta",
    "fgm_scoring", "ftm_ft", "fg3m_3fgpct", "assists_ratio",
    "points", "rebounds", "assists", "turnovers", "steals", "blocks",
    "offensive_reb", "defensive_reb", "minutes_played",
    "double_doubles", "triple_doubles",
}

# ── DB ────────────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)


# ── Fetch helpers ─────────────────────────────────────────────────────────────

def fetch_html(url: str) -> Optional[str]:
    try:
        r = httpx.get(url, headers=HEADERS, timeout=20, follow_redirects=True)
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
    tbl  = soup.find("table", id="rankings_table")
    if not tbl:
        return False
    tbody = tbl.find("tbody")
    return bool(tbody and tbody.find("tr"))


def safe_float(v: str) -> Optional[float]:
    v = str(v).strip().replace("%", "")
    if not v or v in ("-", "N/A", ""):
        return None
    try:
        return float(v)
    except ValueError:
        return None


def safe_int(v: str) -> Optional[int]:
    f = safe_float(v)
    return int(f) if f is not None else None


# ── Discover ranking period ───────────────────────────────────────────────────

def discover_ranking_period(div_num: int, stat_id: int = 102) -> Optional[int]:
    print(f"  [probe] Scanning ranking_period for D{div_num} WBB ...")
    for period in list(range(250, 0, -1)):
        url = (
            f"{BASE_URL}?academic_year=2026&division={div_num}"
            f"&ranking_period={period}&sport_code={SPORT}&stat_seq={stat_id}"
        )
        html = fetch_html(url)
        if html and has_data_rows(html):
            print(f"  [probe] D{div_num}: ranking_period={period}")
            return period
    return None


# ── Parse one stat page ───────────────────────────────────────────────────────

def parse_stat_page(html: str, col_map: dict) -> list[dict]:
    soup   = BeautifulSoup(html, "html.parser")
    table  = soup.find("table", id="rankings_table")
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

        # Cell index 1: player link
        player_cell = cells[1]
        link = player_cell.find("a", href=re.compile(r"/players/\d+"))
        if not link:
            continue

        href = link.get("href", "")
        m    = re.search(r"/players/(\d+)", href)
        if not m:
            continue
        ncaa_player_id = m.group(1)

        # WBB cell format: entire content in <a> as "First Last, School (Conf)"
        # data-order attribute: "LastName,FirstName,School,Conference" (reliable)
        school     = ""
        conference = ""
        data_order = player_cell.get("data-order", "")
        if data_order:
            parts = data_order.split(",")
            if len(parts) >= 4:
                full_name  = f"{parts[1].strip()} {parts[0].strip()}"
                school     = parts[2].strip()
                conference = parts[3].strip()
            elif len(parts) == 3:
                full_name  = f"{parts[1].strip()} {parts[0].strip()}"
                school     = parts[2].strip()
            else:
                full_name = link.get_text(strip=True)
        else:
            # Fallback: parse from link text "Name, School (Conf)"
            link_text = link.get_text(strip=True)
            conf_m2   = re.match(r"^(.*?),\s*(.*?)\s*\(([^)]+)\)\s*$", link_text)
            if conf_m2:
                full_name  = conf_m2.group(1).strip()
                school     = conf_m2.group(2).strip()
                conference = conf_m2.group(3).strip()
            else:
                full_name = link_text

        # Class year, height, position from named columns
        class_year = height_str = position = ""
        for i, hdr in enumerate(headers):
            if i >= len(cells):
                break
            txt = cells[i].get_text(strip=True)
            if hdr == "Cl":
                class_year = txt
            elif hdr == "Ht":
                height_str = txt
            elif hdr == "Pos":
                position   = txt

        def cell_text(idx):
            return cells[idx].get_text(strip=True) if idx < len(cells) else ""

        stat_vals: dict = {}
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
            INSERT INTO wbb_adv_teams (name, conference, division)
            VALUES (%s, %s, %s)
            ON CONFLICT (name, division) DO UPDATE SET
                conference = COALESCE(EXCLUDED.conference, wbb_adv_teams.conference)
            RETURNING id
        """, (name, conference or None, division))
        return str(cur.fetchone()["id"])


def upsert_player(conn, row: dict, team_id: str, division: str) -> str:
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO wbb_adv_players
                (ncaa_player_id, full_name, team_id, division, class_year, height_str, position)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (ncaa_player_id) DO UPDATE SET
                full_name  = EXCLUDED.full_name,
                team_id    = EXCLUDED.team_id,
                division   = EXCLUDED.division,
                class_year = COALESCE(EXCLUDED.class_year, wbb_adv_players.class_year),
                height_str = COALESCE(EXCLUDED.height_str, wbb_adv_players.height_str),
                position   = COALESCE(EXCLUDED.position,   wbb_adv_players.position),
                updated_at = now()
            RETURNING id
        """, (
            row["ncaa_player_id"], row["full_name"], team_id, division,
            row.get("class_year") or None,
            row.get("height_str") or None,
            row.get("position")   or None,
        ))
        return str(cur.fetchone()["id"])


STAT_COLS_RAW = [
    "games", "minutes_played", "mpg",
    "points", "ppg",
    "fgm", "fga", "fg_pct",
    "fg3m", "fg3a", "fg3_pct", "fg3pg",
    "ftm", "fta", "ft_pct",
    "offensive_reb", "defensive_reb", "rebounds", "rpg",
    "assists", "apg",
    "turnovers", "ast_to_ratio",
    "steals", "spg",
    "blocks", "bpg",
    "double_doubles", "triple_doubles",
]


def compute_advanced(row: dict):
    """Compute eFG% and TS% from raw totals."""
    fgm  = row.get("fgm")
    fga  = row.get("fga")
    fg3m = row.get("fg3m")
    ftm  = row.get("ftm")
    fta  = row.get("fta")
    pts  = row.get("points")

    efg_pct = None
    if fgm is not None and fga and fga > 0 and fg3m is not None:
        efg_pct = round((fgm + 0.5 * fg3m) / fga, 4)

    ts_pct = None
    if pts is not None and fga is not None and fta is not None:
        denom = 2 * (fga + 0.44 * fta)
        if denom > 0:
            ts_pct = round(pts / denom, 4)

    row["efg_pct"] = efg_pct
    row["ts_pct"]  = ts_pct


def upsert_stats(conn, player_id: str, division: str, row: dict):
    compute_advanced(row)

    # Resolve aliased columns
    if row.get("fgm") is None and row.get("fgm_scoring") is not None:
        row["fgm"] = row["fgm_scoring"]
    if row.get("fg3m") is None and row.get("fg3m_3fgpct") is not None:
        row["fg3m"] = row["fg3m_3fgpct"]
    if row.get("ftm") is None and row.get("ftm_ft") is not None:
        row["ftm"] = row["ftm_ft"]
    if row.get("assists") is None and row.get("assists_ratio") is not None:
        row["assists"] = row["assists_ratio"]

    vals = {c: row.get(c) for c in STAT_COLS_RAW}
    vals["efg_pct"] = row.get("efg_pct")
    vals["ts_pct"]  = row.get("ts_pct")

    if all(v is None for k, v in vals.items() if k not in ("games",)):
        return

    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO wbb_adv_stats (
                player_id, division, season,
                games, minutes_played, mpg,
                points, ppg,
                fgm, fga, fg_pct, efg_pct,
                fg3m, fg3a, fg3_pct, fg3pg,
                ftm, fta, ft_pct, ts_pct,
                offensive_reb, defensive_reb, rebounds, rpg,
                assists, apg,
                turnovers, ast_to_ratio,
                steals, spg,
                blocks, bpg,
                double_doubles, triple_doubles
            ) VALUES (
                %s,%s,%s,
                %s,%s,%s,
                %s,%s,
                %s,%s,%s,%s,
                %s,%s,%s,%s,
                %s,%s,%s,%s,
                %s,%s,%s,%s,
                %s,%s,
                %s,%s,
                %s,%s,
                %s,%s,
                %s,%s
            )
            ON CONFLICT (player_id, division, season) DO UPDATE SET
                games          = COALESCE(EXCLUDED.games,          wbb_adv_stats.games),
                minutes_played = COALESCE(EXCLUDED.minutes_played, wbb_adv_stats.minutes_played),
                mpg            = COALESCE(EXCLUDED.mpg,            wbb_adv_stats.mpg),
                points         = COALESCE(EXCLUDED.points,         wbb_adv_stats.points),
                ppg            = COALESCE(EXCLUDED.ppg,            wbb_adv_stats.ppg),
                fgm            = COALESCE(EXCLUDED.fgm,            wbb_adv_stats.fgm),
                fga            = COALESCE(EXCLUDED.fga,            wbb_adv_stats.fga),
                fg_pct         = COALESCE(EXCLUDED.fg_pct,         wbb_adv_stats.fg_pct),
                efg_pct        = COALESCE(EXCLUDED.efg_pct,        wbb_adv_stats.efg_pct),
                fg3m           = COALESCE(EXCLUDED.fg3m,           wbb_adv_stats.fg3m),
                fg3a           = COALESCE(EXCLUDED.fg3a,           wbb_adv_stats.fg3a),
                fg3_pct        = COALESCE(EXCLUDED.fg3_pct,        wbb_adv_stats.fg3_pct),
                fg3pg          = COALESCE(EXCLUDED.fg3pg,          wbb_adv_stats.fg3pg),
                ftm            = COALESCE(EXCLUDED.ftm,            wbb_adv_stats.ftm),
                fta            = COALESCE(EXCLUDED.fta,            wbb_adv_stats.fta),
                ft_pct         = COALESCE(EXCLUDED.ft_pct,         wbb_adv_stats.ft_pct),
                ts_pct         = COALESCE(EXCLUDED.ts_pct,         wbb_adv_stats.ts_pct),
                offensive_reb  = COALESCE(EXCLUDED.offensive_reb,  wbb_adv_stats.offensive_reb),
                defensive_reb  = COALESCE(EXCLUDED.defensive_reb,  wbb_adv_stats.defensive_reb),
                rebounds       = COALESCE(EXCLUDED.rebounds,       wbb_adv_stats.rebounds),
                rpg            = COALESCE(EXCLUDED.rpg,            wbb_adv_stats.rpg),
                assists        = COALESCE(EXCLUDED.assists,        wbb_adv_stats.assists),
                apg            = COALESCE(EXCLUDED.apg,            wbb_adv_stats.apg),
                turnovers      = COALESCE(EXCLUDED.turnovers,      wbb_adv_stats.turnovers),
                ast_to_ratio   = COALESCE(EXCLUDED.ast_to_ratio,   wbb_adv_stats.ast_to_ratio),
                steals         = COALESCE(EXCLUDED.steals,         wbb_adv_stats.steals),
                spg            = COALESCE(EXCLUDED.spg,            wbb_adv_stats.spg),
                blocks         = COALESCE(EXCLUDED.blocks,         wbb_adv_stats.blocks),
                bpg            = COALESCE(EXCLUDED.bpg,            wbb_adv_stats.bpg),
                double_doubles = COALESCE(EXCLUDED.double_doubles, wbb_adv_stats.double_doubles),
                triple_doubles = COALESCE(EXCLUDED.triple_doubles, wbb_adv_stats.triple_doubles),
                updated_at     = now()
        """, (
            player_id, division, SEASON,
            vals["games"], vals["minutes_played"], vals["mpg"],
            vals["points"], vals["ppg"],
            vals["fgm"], vals["fga"], vals["fg_pct"], vals["efg_pct"],
            vals["fg3m"], vals["fg3a"], vals["fg3_pct"], vals["fg3pg"],
            vals["ftm"], vals["fta"], vals["ft_pct"], vals["ts_pct"],
            vals["offensive_reb"], vals["defensive_reb"], vals["rebounds"], vals["rpg"],
            vals["assists"], vals["apg"],
            vals["turnovers"], vals["ast_to_ratio"],
            vals["steals"], vals["spg"],
            vals["blocks"], vals["bpg"],
            vals["double_doubles"], vals["triple_doubles"],
        ))


# ── Main load per division ────────────────────────────────────────────────────

def load_division(conn, div_code: str, div_num: int, ranking_period: int):
    print(f"\n=== WBB {div_code.upper()} (ranking_period={ranking_period}) ===")

    player_map: dict[str, dict] = {}

    for sp in STAT_PAGES:
        url = (
            f"{BASE_URL}?academic_year=2026&division={div_num}"
            f"&ranking_period={ranking_period}&sport_code={SPORT}&stat_seq={sp['id']}"
        )
        html = fetch_html(url)
        if not html:
            print(f"  [skip] {sp['title']:25} — no response")
            continue

        rows = parse_stat_page(html, sp["col_map"])
        if not rows:
            soup = BeautifulSoup(html, "html.parser")
            tbl = soup.find("table", id="rankings_table")
            if tbl and tbl.find("thead"):
                hdrs = [th.get_text(strip=True) for th in tbl.find("thead").find_all("th")]
                print(f"  [skip] {sp['title']:25} — headers={hdrs}")
            else:
                print(f"  [skip] {sp['title']:25} — no rows parsed")
            continue

        print(f"  {sp['title']:25} {len(rows):4} rows")
        for row in rows:
            pid = row["ncaa_player_id"]
            if pid not in player_map:
                player_map[pid] = {
                    "ncaa_player_id": pid,
                    "full_name":      row["full_name"],
                    "school":         row["school"],
                    "conference":     row.get("conference", ""),
                    "class_year":     row.get("class_year"),
                    "height_str":     row.get("height_str"),
                    "position":       row.get("position"),
                }
            # Merge stat columns (non-None wins)
            for col in list(sp["col_map"].values()) + ["efg_pct", "ts_pct"]:
                if row.get(col) is not None:
                    player_map[pid][col] = row[col]

    if not player_map:
        print("  No player data parsed.")
        return

    team_cache: dict[str, str] = {}
    for row in player_map.values():
        school = row["school"]
        if school not in team_cache:
            team_cache[school] = upsert_team(conn, school, row.get("conference", ""), div_code)
        tid = team_cache[school]
        pid = upsert_player(conn, row, tid, div_code)
        upsert_stats(conn, pid, div_code, row)

    conn.commit()   # ensure all upserts are committed before querying
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) AS n FROM wbb_adv_players WHERE division=%s", (div_code,))
    np_ = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) AS n FROM wbb_adv_stats WHERE division=%s AND season=%s", (div_code, SEASON))
    ns = cur.fetchone()["n"]
    conn.commit()   # close implicit transaction from SELECTs before next division
    print(f"  → {len(player_map)} players parsed, {np_} in DB, {ns} stat rows")


# ── Division configs ──────────────────────────────────────────────────────────

DIVISIONS = [
    {"code": "d1", "num": 1},
    {"code": "d2", "num": 2},
    {"code": "d3", "num": 3},
]


def main():
    args = sys.argv[1:]

    if "probe" in args:
        for div in DIVISIONS:
            rp = discover_ranking_period(div["num"])
            print(f"D{div['num']}: ranking_period={rp}")
        return

    # Filter divisions by CLI arg
    divs = DIVISIONS
    if "d1" in args:
        divs = [d for d in DIVISIONS if d["code"] == "d1"]
    elif "d2" in args:
        divs = [d for d in DIVISIONS if d["code"] == "d2"]
    elif "d3" in args:
        divs = [d for d in DIVISIONS if d["code"] == "d3"]

    conn = get_conn()
    try:
        for div in divs:
            rp = discover_ranking_period(div["num"])
            if rp is None:
                print(f"[error] No valid ranking_period found for D{div['num']} WBB")
                continue
            load_division(conn, div["code"], div["num"], rp)
    finally:
        conn.close()

    # Summary
    conn2 = get_conn()
    try:
        cur = conn2.cursor()
        cur.execute("SELECT division, COUNT(*) AS n FROM wbb_adv_stats WHERE season=%s GROUP BY division ORDER BY division", (SEASON,))
        rows = cur.fetchall()
        print("\n============================================================")
        print("WBB ADVANCED STATS DONE")
        print(f"  {'Division':<8} {'Stat rows':>10}")
        total = 0
        for r in rows:
            print(f"  {r['division']:<8} {r['n']:>10}")
            total += r["n"]
        cur.execute("SELECT COUNT(*) AS n FROM wbb_adv_players")
        np_ = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) AS n FROM wbb_adv_teams")
        nt = cur.fetchone()["n"]
        print(f"  -------    ----------")
        print(f"  TOTAL    {total:>10}")
        print(f"  Teams: {nt}  Players: {np_}")
        print("============================================================")
    finally:
        conn2.close()


if __name__ == "__main__":
    main()
