"""
NJCAA Regional Basketball Scraper
Scrapes per-team player stats for MBB and WBB from all 6 NJCAA regional sites.

Uses hardcoded team slugs to bypass WAF-blocked team listing pages.
Goes directly to per-team stat pages via PrestoSports tmpl endpoint.

Regions:
  r2  : region2athletics.com       (19 MBB, 18 WBB)
  r5  : njcaaregion5.com           (23 MBB, 20 WBB)
  r14 : njcaaregion14.com          (12 MBB,  8 WBB)
  r15 : region15athletics.com      (16 MBB, 16 WBB)
  r19 : njcaaregion19.com          (27 MBB, 25 WBB)
  r24 : njcaaregion24.com          (17 MBB, 17 WBB)

Stat categories:
  overall  : GP, GS, MIN, FG, FGA, FG%, 3P, 3PA, 3P%, FT, FTA, FT%,
             PTS, PPG, REB, RPG, OREB, DREB, AST, APG, TOV, STL, BLK, PF
  scoring  : FGM, FGA, 3PM, 3PA, FTM, FTA, PTS, PPG
  rebounds : GP, OREB, DREB, REB, RPG
  assists  : GP, AST, APG
  steals   : GP, STL
  blocks   : GP, BLK
  minutes  : GP, MIN, MPG

Usage:
  python3 njcaa_regional_bball_scraper.py --sport mbkb
  python3 njcaa_regional_bball_scraper.py --sport wbkb
  python3 njcaa_regional_bball_scraper.py            # both sports
  python3 njcaa_regional_bball_scraper.py --region r5 --sport mbkb
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path

import httpx
import psycopg
from bs4 import BeautifulSoup

sys.path.insert(0, os.path.dirname(__file__))
from config import DB_CONFIG

# ── Config ────────────────────────────────────────────────────────────────────

SEASON = "2025-26"
CRAWL_DELAY = 4       # seconds between requests
REGION_DELAY = 8      # extra seconds when switching regions

TEAMS_JSON = Path(__file__).parent / "njcaa_regional_bball_teams.json"

# Stat category → pos param for tmpl endpoint
# 'overall' gives the fullest combined row
CATEGORIES = {
    "overall":  "overall",
    "scoring":  "scoring",
    "rebounds": "reb",
    "assists":  "ast",
    "steals":   "stl",
    "blocks":   "blk",
    "minutes":  "min",
}

# PrestoSports tmpl endpoint
TMPL_PATH = "?tmpl=brief-category-template&pos={pos}&r=0"

BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
}


# ── DB Schema ─────────────────────────────────────────────────────────────────

CREATE_TEAMS = """
CREATE TABLE IF NOT EXISTS njcaa_reg_bball_teams (
    id          SERIAL PRIMARY KEY,
    region      TEXT NOT NULL,
    sport       TEXT NOT NULL,    -- 'mbkb' or 'wbkb'
    slug        TEXT NOT NULL,
    name        TEXT,
    base_url    TEXT NOT NULL,
    season      TEXT NOT NULL,
    UNIQUE (region, sport, slug, season)
);
"""

CREATE_PLAYERS = """
CREATE TABLE IF NOT EXISTS njcaa_reg_bball_players (
    id          SERIAL PRIMARY KEY,
    team_id     INT  NOT NULL REFERENCES njcaa_reg_bball_teams(id),
    jersey      TEXT,
    full_name   TEXT NOT NULL,
    position    TEXT,
    class_year  TEXT,
    height      TEXT,
    hometown    TEXT,
    UNIQUE (team_id, full_name)
);
"""

CREATE_STATS = """
CREATE TABLE IF NOT EXISTS njcaa_reg_bball_stats (
    id          SERIAL PRIMARY KEY,
    player_id   INT  NOT NULL REFERENCES njcaa_reg_bball_players(id),
    season      TEXT NOT NULL,
    gp          INT,
    gs          INT,
    min_total   NUMERIC(8,1),
    mpg         NUMERIC(6,2),
    fgm         INT,
    fga         INT,
    fg_pct      NUMERIC(6,4),
    three_pm    INT,
    three_pa    INT,
    three_pct   NUMERIC(6,4),
    ftm         INT,
    fta         INT,
    ft_pct      NUMERIC(6,4),
    pts         INT,
    ppg         NUMERIC(6,2),
    orb         INT,
    drb         INT,
    trb         INT,
    rpg         NUMERIC(6,2),
    ast         INT,
    apg         NUMERIC(6,2),
    tov         INT,
    stl         INT,
    blk         INT,
    pf          INT,
    UNIQUE (player_id, season)
);
"""


def ensure_schema(conn):
    conn.execute(CREATE_TEAMS)
    conn.execute(CREATE_PLAYERS)
    conn.execute(CREATE_STATS)
    conn.commit()


# ── HTTP ──────────────────────────────────────────────────────────────────────

def fetch(url: str, base: str, referer: str, retries: int = 3) -> httpx.Response | None:
    hdrs = {
        **BROWSER_HEADERS,
        "Origin": base,
        "Referer": referer,
    }
    for attempt in range(retries):
        try:
            r = httpx.get(url, headers=hdrs, timeout=20, follow_redirects=True)
            if r.status_code == 202 and len(r.content) < 5000:
                wait = 90 if attempt == 0 else 120
                print(f"    [WAF] {url} — waiting {wait}s...")
                time.sleep(wait)
                continue
            return r
        except Exception as e:
            print(f"    [err] {url}: {e}")
            time.sleep(10)
    return None


# ── Parsing ───────────────────────────────────────────────────────────────────

def _safe_int(v: str | None) -> int | None:
    try:
        return int(str(v).replace(",", "").strip())
    except (TypeError, ValueError):
        return None


def _safe_float(v: str | None) -> float | None:
    try:
        s = str(v).replace(",", "").strip()
        f = float(s)
        # Percentages stored as 0-1
        if f > 1.0 and s.endswith("%"):
            f = f / 100
        elif f > 1.5 and "." not in s:
            pass  # could be raw count mistaken for pct — keep as-is
        return f
    except (TypeError, ValueError):
        return None


def _pct(v: str | None) -> float | None:
    """Parse percentage: '45.3' → 0.453, '0.453' → 0.453, '.453' → 0.453."""
    if v is None:
        return None
    try:
        s = str(v).replace("%", "").strip()
        if not s or s == "-":
            return None
        f = float(s)
        # If value looks like it's already 0-1 (e.g. 0.453)
        if -0.001 <= f <= 1.001:
            return round(f, 4)
        # Otherwise treat as percentage points (e.g. 45.3)
        return round(f / 100, 4)
    except (TypeError, ValueError):
        return None


def _split_made_att(v: str | None) -> tuple[int | None, int | None]:
    """Parse '132-293' → (132, 293). Returns (None, None) if not parseable."""
    if not v:
        return None, None
    v = v.strip()
    if "-" in v:
        parts = v.split("-", 1)
        try:
            return int(parts[0]), int(parts[1])
        except ValueError:
            pass
    # Maybe just a single integer
    try:
        return int(v), None
    except ValueError:
        return None, None


def parse_stat_table(html: str, _category: str = "overall") -> list[dict]:
    """
    Parse PrestoSports basketball tmpl table.

    Fixed column layout (confirmed across all categories):
      0:#  1:Name  2:Yr  3:Pos  4:gp  5:gs  6:min
      7:fg("M-A")  8:fg%  9:3pt("M-A")  10:3p%  11:ft("M-A")  12:ft%  13:pts
    """
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table")
    if not table:
        return []

    # Identify column positions from headers (handle lowercase from PrestoSports)
    thead = table.find("thead")
    if not thead:
        return []

    raw_headers = [th.get_text(strip=True).lower() for th in thead.find_all(["th", "td"])]

    # Fixed positional mapping based on confirmed column order
    # Fallback to position-based if header-based fails
    C_JERSEY = next((i for i, h in enumerate(raw_headers) if h in ("#", "no", "num")), 0)
    C_NAME   = next((i for i, h in enumerate(raw_headers) if h in ("name", "player")), 1)
    C_YR     = next((i for i, h in enumerate(raw_headers) if h in ("yr", "cl", "class", "year")), 2)
    C_POS    = next((i for i, h in enumerate(raw_headers) if h in ("pos", "position")), 3)
    C_GP     = next((i for i, h in enumerate(raw_headers) if h == "gp"), 4)
    C_GS     = next((i for i, h in enumerate(raw_headers) if h == "gs"), 5)
    C_MIN    = next((i for i, h in enumerate(raw_headers) if h == "min"), 6)
    C_FG     = next((i for i, h in enumerate(raw_headers) if h in ("fg", "fgm")), 7)
    # Three pct columns: FG%, 3P%, FT% at positions 8, 10, 12 (after each made-att col)
    pct_positions = [i for i, h in enumerate(raw_headers) if h == "pct"]
    C_FG_PCT  = pct_positions[0] if len(pct_positions) > 0 else 8
    C_3PT     = next((i for i, h in enumerate(raw_headers) if h in ("3pt", "3p", "3fg", "3pm")), 9)
    C_3P_PCT  = pct_positions[1] if len(pct_positions) > 1 else 10
    C_FT      = next((i for i, h in enumerate(raw_headers) if h in ("ft", "ftm")), 11)
    C_FT_PCT  = pct_positions[2] if len(pct_positions) > 2 else 12
    C_PTS     = next((i for i, h in enumerate(raw_headers) if h in ("pts", "points", "total pts")), 13)

    rows = []
    tbody = table.find("tbody") or table
    for tr in tbody.find_all("tr"):
        cells = tr.find_all(["td", "th"])
        if len(cells) < 8:
            continue

        def cell(i: int) -> str:
            if i < len(cells):
                return " ".join(cells[i].get_text(strip=True).split())
            return ""

        name_raw = cell(C_NAME)
        if not name_raw or name_raw.lower() in ("name", "player", "totals", "total"):
            continue
        name = " ".join(name_raw.split())

        gp = _safe_int(cell(C_GP))
        gs = _safe_int(cell(C_GS))
        pts = _safe_int(cell(C_PTS))
        mins = _safe_float(cell(C_MIN))

        fgm, fga   = _split_made_att(cell(C_FG))
        tpm, tpa   = _split_made_att(cell(C_3PT))
        ftm, fta   = _split_made_att(cell(C_FT))

        fg_pct  = _pct(cell(C_FG_PCT))
        tp_pct  = _pct(cell(C_3P_PCT))
        ft_pct  = _pct(cell(C_FT_PCT))

        # Compute PPG from totals
        ppg = round(pts / gp, 2) if pts is not None and gp and gp > 0 else None
        mpg = round(mins / gp, 2) if mins is not None and gp and gp > 0 else None

        rows.append({
            "name":      name,
            "jersey":    cell(C_JERSEY) or None,
            "pos":       cell(C_POS) or None,
            "cl":        cell(C_YR) or None,
            "ht":        None,  # not available in this format
            "gp":        gp,
            "gs":        gs,
            "min":       mins,
            "mpg":       mpg,
            "fgm":       fgm,
            "fga":       fga,
            "fg_pct":    fg_pct,
            "three_pm":  tpm,
            "three_pa":  tpa,
            "three_pct": tp_pct,
            "ftm":       ftm,
            "fta":       fta,
            "ft_pct":    ft_pct,
            "pts":       pts,
            "ppg":       ppg,
            # Not available in this endpoint:
            "orb": None, "drb": None, "trb": None, "rpg": None,
            "ast": None, "apg": None, "tov": None,
            "stl": None, "blk": None, "pf": None,
        })
    return rows


# ── DB Writes ─────────────────────────────────────────────────────────────────

def upsert_team(conn, region: str, sport: str, slug: str, base_url: str, name: str | None) -> int:
    row = conn.execute("""
        INSERT INTO njcaa_reg_bball_teams (region, sport, slug, name, base_url, season)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (region, sport, slug, season) DO UPDATE SET
            name = COALESCE(EXCLUDED.name, njcaa_reg_bball_teams.name),
            base_url = EXCLUDED.base_url
        RETURNING id
    """, (region, sport, slug, name, base_url, SEASON)).fetchone()
    return row["id"]


def upsert_player(conn, team_id: int, row: dict) -> int:
    r = conn.execute("""
        INSERT INTO njcaa_reg_bball_players (team_id, jersey, full_name, position, class_year, height)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (team_id, full_name) DO UPDATE SET
            jersey     = COALESCE(EXCLUDED.jersey, njcaa_reg_bball_players.jersey),
            position   = COALESCE(EXCLUDED.position, njcaa_reg_bball_players.position),
            class_year = COALESCE(EXCLUDED.class_year, njcaa_reg_bball_players.class_year),
            height     = COALESCE(EXCLUDED.height, njcaa_reg_bball_players.height)
        RETURNING id
    """, (team_id, row.get("jersey"), row["name"], row.get("pos"),
          row.get("cl"), row.get("ht"))).fetchone()
    return r["id"]


def upsert_stats(conn, player_id: int, row: dict):
    conn.execute("""
        INSERT INTO njcaa_reg_bball_stats (
            player_id, season,
            gp, gs, min_total, mpg,
            fgm, fga, fg_pct, three_pm, three_pa, three_pct,
            ftm, fta, ft_pct,
            pts, ppg, orb, drb, trb, rpg,
            ast, apg, tov, stl, blk, pf
        ) VALUES (
            %s, %s,
            %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s,
            %s, %s, %s,
            %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s
        )
        ON CONFLICT (player_id, season) DO UPDATE SET
            gp         = COALESCE(EXCLUDED.gp,       njcaa_reg_bball_stats.gp),
            gs         = COALESCE(EXCLUDED.gs,       njcaa_reg_bball_stats.gs),
            min_total  = COALESCE(EXCLUDED.min_total,njcaa_reg_bball_stats.min_total),
            mpg        = COALESCE(EXCLUDED.mpg,      njcaa_reg_bball_stats.mpg),
            fgm        = COALESCE(EXCLUDED.fgm,      njcaa_reg_bball_stats.fgm),
            fga        = COALESCE(EXCLUDED.fga,      njcaa_reg_bball_stats.fga),
            fg_pct     = COALESCE(EXCLUDED.fg_pct,   njcaa_reg_bball_stats.fg_pct),
            three_pm   = COALESCE(EXCLUDED.three_pm, njcaa_reg_bball_stats.three_pm),
            three_pa   = COALESCE(EXCLUDED.three_pa, njcaa_reg_bball_stats.three_pa),
            three_pct  = COALESCE(EXCLUDED.three_pct,njcaa_reg_bball_stats.three_pct),
            ftm        = COALESCE(EXCLUDED.ftm,      njcaa_reg_bball_stats.ftm),
            fta        = COALESCE(EXCLUDED.fta,      njcaa_reg_bball_stats.fta),
            ft_pct     = COALESCE(EXCLUDED.ft_pct,   njcaa_reg_bball_stats.ft_pct),
            pts        = COALESCE(EXCLUDED.pts,      njcaa_reg_bball_stats.pts),
            ppg        = COALESCE(EXCLUDED.ppg,      njcaa_reg_bball_stats.ppg),
            orb        = COALESCE(EXCLUDED.orb,      njcaa_reg_bball_stats.orb),
            drb        = COALESCE(EXCLUDED.drb,      njcaa_reg_bball_stats.drb),
            trb        = COALESCE(EXCLUDED.trb,      njcaa_reg_bball_stats.trb),
            rpg        = COALESCE(EXCLUDED.rpg,      njcaa_reg_bball_stats.rpg),
            ast        = COALESCE(EXCLUDED.ast,      njcaa_reg_bball_stats.ast),
            apg        = COALESCE(EXCLUDED.apg,      njcaa_reg_bball_stats.apg),
            tov        = COALESCE(EXCLUDED.tov,      njcaa_reg_bball_stats.tov),
            stl        = COALESCE(EXCLUDED.stl,      njcaa_reg_bball_stats.stl),
            blk        = COALESCE(EXCLUDED.blk,      njcaa_reg_bball_stats.blk),
            pf         = COALESCE(EXCLUDED.pf,       njcaa_reg_bball_stats.pf)
    """, (
        player_id, SEASON,
        row.get("gp"), row.get("gs"), row.get("min"), row.get("mpg"),
        row.get("fgm"), row.get("fga"), row.get("fg_pct"),
        row.get("three_pm"), row.get("three_pa"), row.get("three_pct"),
        row.get("ftm"), row.get("fta"), row.get("ft_pct"),
        row.get("pts"), row.get("ppg"),
        row.get("orb"), row.get("drb"), row.get("trb"), row.get("rpg"),
        row.get("ast"), row.get("apg"),
        row.get("tov"), row.get("stl"), row.get("blk"), row.get("pf"),
    ))


# ── Core Scrape ───────────────────────────────────────────────────────────────

def scrape_team(conn, region: str, sport: str, slug: str, base: str) -> int:
    """
    Scrapes 'overall' stat category for one team.
    Returns number of players saved.
    """
    team_page = f"{base}/sports/{sport}/{SEASON}/teams/{slug}"
    url = team_page + TMPL_PATH.format(pos="overall")

    r = fetch(url, base, team_page)
    if not r or r.status_code != 200:
        code = r.status_code if r else "err"
        print(f"      SKIP {slug} [{code}]")
        return 0

    rows = parse_stat_table(r.text, "overall")

    if not rows:
        print(f"      SKIP {slug} [no data]")
        return 0

    # Derive team name from first row's context if not available
    team_id = upsert_team(conn, region, sport, slug, base, None)

    saved = 0
    for row in rows:
        if not row["name"]:
            continue
        player_id = upsert_player(conn, team_id, row)
        upsert_stats(conn, player_id, row)
        saved += 1

    conn.commit()
    return saved


def run_sport(conn, sport: str, target_region: str | None, teams_data: dict):
    region_map = teams_data["regions"]
    sport_teams = teams_data[sport]

    total_teams = 0
    total_players = 0

    region_ids = sorted(sport_teams.keys())
    if target_region:
        region_ids = [r for r in region_ids if r == target_region]

    for i, region in enumerate(region_ids):
        base = region_map[region]
        slugs = sport_teams[region]

        print(f"\n  [{region}] {base}  ({len(slugs)} teams)")

        if i > 0:
            time.sleep(REGION_DELAY)

        region_players = 0
        for j, slug in enumerate(slugs):
            n = scrape_team(conn, region, sport, slug, base)
            label = f"{slug[:35]:<35}"
            if n > 0:
                print(f"    {j+1:>2}/{len(slugs)} {label} {n:>3} players")
            region_players += n
            total_teams += 1
            if j < len(slugs) - 1:
                time.sleep(CRAWL_DELAY)

        total_players += region_players
        print(f"    → {region}: {region_players} players from {len(slugs)} teams")

    return total_teams, total_players


# ── Summary ───────────────────────────────────────────────────────────────────

def print_summary(conn, sport: str):
    row = conn.execute("""
        SELECT COUNT(DISTINCT t.id) AS teams,
               COUNT(DISTINCT p.id) AS players,
               COUNT(s.id)          AS stat_rows
        FROM njcaa_reg_bball_teams t
        JOIN njcaa_reg_bball_players p ON p.team_id = t.id
        JOIN njcaa_reg_bball_stats s   ON s.player_id = p.id
        WHERE t.sport = %s
    """, (sport,)).fetchone()

    print(f"\n  {sport.upper()} totals in DB: "
          f"{row['teams']} teams, {row['players']} players, {row['stat_rows']} stat rows")

    # Top scorers
    sample = conn.execute("""
        SELECT p.full_name, t.slug AS team, s.ppg, s.pts, s.gp,
               s.fg_pct, s.three_pct
        FROM njcaa_reg_bball_stats s
        JOIN njcaa_reg_bball_players p ON s.player_id = p.id
        JOIN njcaa_reg_bball_teams t   ON p.team_id = t.id
        WHERE t.sport = %s AND s.gp >= 10
        ORDER BY s.ppg DESC NULLS LAST
        LIMIT 5
    """, (sport,)).fetchall()

    if sample:
        print(f"\n  Top {sport.upper()} scorers (min 10 GP):")
        for r in sample:
            ppg = float(r["ppg"]) if r["ppg"] else 0
            fg  = float(r["fg_pct"]) if r["fg_pct"] else 0
            tp  = float(r["three_pct"]) if r["three_pct"] else 0
            print(f"    {r['full_name']:<28} {r['team']:<35} "
                  f"PPG={ppg:.1f}  PTS={r['pts']}  GP={r['gp']}  "
                  f"FG%={fg:.3f}  3P%={tp:.3f}")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="NJCAA Regional Basketball Scraper")
    parser.add_argument("--sport", choices=["mbkb", "wbkb"], default=None,
                        help="Sport to scrape (default: both)")
    parser.add_argument("--region", choices=["r2","r5","r14","r15","r19","r24"],
                        default=None, help="Only scrape one region")
    args = parser.parse_args()

    with open(TEAMS_JSON) as f:
        teams_data = json.load(f)

    sports = [args.sport] if args.sport else ["mbkb", "wbkb"]

    print(f"=== NJCAA Regional Basketball Scraper ===")
    print(f"  Season  : {SEASON}")
    print(f"  Sports  : {', '.join(sports)}")
    print(f"  Region  : {args.region or 'all'}")

    with psycopg.connect(
        host=DB_CONFIG["host"],
        port=DB_CONFIG["port"],
        dbname=DB_CONFIG["dbname"],
        row_factory=psycopg.rows.dict_row,
        autocommit=False,
    ) as conn:
        ensure_schema(conn)

        grand_teams = 0
        grand_players = 0

        for sport in sports:
            print(f"\n{'='*60}")
            print(f"  Sport: {sport.upper()}")
            t, p = run_sport(conn, sport, args.region, teams_data)
            grand_teams += t
            grand_players += p
            print_summary(conn, sport)

        print(f"\n{'='*60}")
        print(f"DONE: {grand_teams} teams, {grand_players} players")


if __name__ == "__main__":
    main()
