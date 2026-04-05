#!/usr/bin/env python3
"""
KaNeXT NAIA Baseball / Softball Stats Scraper
Source: Individual school Sidearm Sports athletics sites (229 schools)

Stats page patterns:
  Baseball: {base_url}/sports/baseball/stats/2025-26
  Softball: {base_url}/sports/softball/stats/2025-26

Tables parsed (0-indexed on Sidearm stats page):
  Table 0 — season batting:   #, Player, AVG, OPS, GP-GS, AB, R, H, 2B, 3B, HR, RBI, TB, SLG%, BB, HBP, SO, GDP, OB%, SF, SH, SB-ATT, Bio Link
  Table 1 — season pitching:  #, Player, ERA, WHIP, W-L, APP-GS, CG, SHO, SV, IP, H, R, ER, BB, SO, 2B, 3B, HR, AB, B/AVG, WP, HBP, BK, SFA, SHA, Bio Link

DB tables written:
  njcaa_reg_baseball_teams          — region='naia', sport='bsb' or 'sball'
  njcaa_reg_baseball_players        — standard player rows
  njcaa_reg_baseball_stats          — batting (extended with gs, hbp, tb, gdp, sf, sh, sb_att)
  njcaa_reg_baseball_pitching_stats — ERA, W, L, APP, IP, etc.

Access: No Accept-Encoding header — Sidearm Sports returns a 0-table lightweight page
with br/gzip encoding (same issue as naia_soccer_scraper.py).

Usage:
    python3 naia_baseball_scraper.py               # both sports
    python3 naia_baseball_scraper.py --sport bsb   # baseball only
    python3 naia_baseball_scraper.py --sport sball # softball only
    python3 naia_baseball_scraper.py --test 10     # first 10 schools
"""
from __future__ import annotations

import re
import json
import time
import argparse
from pathlib import Path
from typing import Optional

import httpx
import psycopg
from psycopg.rows import dict_row
from bs4 import BeautifulSoup

# ── Config ─────────────────────────────────────────────────────────────────────

DB_CONFIG = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}
SEASON    = "2025-26"
DELAY     = 1.2
TIMEOUT   = 20

SCHOOLS_FILE = Path(__file__).parent / "naia_schools.json"

SPORT_PATHS = {
    "bsb":   "/sports/baseball/stats/" + SEASON,
    "sball": "/sports/softball/stats/" + SEASON,
}

BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    # No Accept-Encoding — Sidearm Sports returns 0-table lightweight page with br/gzip
}

# ── Parsing helpers ─────────────────────────────────────────────────────────────

def _int(v: str | None) -> Optional[int]:
    if not v or str(v).strip() in ("-", "", "—", "N/A"):
        return None
    try:
        return int(str(v).replace(",", "").strip())
    except ValueError:
        return None

def _float(v: str | None) -> Optional[float]:
    if not v or str(v).strip() in ("-", "", "—", "N/A"):
        return None
    try:
        return round(float(str(v).strip()), 4)
    except ValueError:
        return None

def _ip(v: str | None) -> Optional[float]:
    """Parse innings pitched (e.g. '63.1' → 63.1, '9' → 9.0)."""
    if not v or str(v).strip() in ("-", "", "—"):
        return None
    try:
        return float(str(v).strip())
    except ValueError:
        return None

def _split_dash(v: str | None, idx: int) -> Optional[int]:
    """Parse compound 'X-Y' field and return int at idx (0=first, 1=second)."""
    if not v or str(v).strip() in ("-", "", "—"):
        return None
    parts = str(v).split("-")
    if len(parts) > idx:
        return _int(parts[idx])
    return None

_SKIP = {"name", "player", "totals", "total", "", "opponent", "opponents",
         "home", "away", "exhibition", "#", "bio link", "view bio"}

def _clean_name(cell) -> str:
    """Extract player name from td — prefer <a> tag to avoid mobile button duplication."""
    a = cell.find("a")
    if a:
        return " ".join(a.get_text(strip=True).split())
    return " ".join(cell.get_text(strip=True).split())

# ── Table parsers ───────────────────────────────────────────────────────────────

def _parse_batting_table(table) -> list[dict]:
    """Parse Sidearm batting table: #, Player, AVG, OPS, GP-GS, AB, R, H, 2B, 3B, HR, RBI..."""
    rows = table.find_all("tr")
    if not rows:
        return []

    # Find header row containing AB or AVG
    header_idx = 0
    for i, tr in enumerate(rows[:3]):
        cells = [td.get_text(strip=True).upper() for td in tr.find_all(["th", "td"])]
        if "AB" in cells or "AVG" in cells:
            header_idx = i
            break

    hdrs = [td.get_text(strip=True).upper() for td in rows[header_idx].find_all(["th", "td"])]

    def ci(names: list[str]) -> int:
        for n in names:
            for i, h in enumerate(hdrs):
                if h == n:
                    return i
        return -1

    C_NO    = ci(["#", "NO"])
    C_NAME  = ci(["PLAYER", "NAME"])
    C_AVG   = ci(["AVG"])
    C_OPS   = ci(["OPS"])
    C_GPGS  = ci(["GP-GS", "GP", "G"])
    C_AB    = ci(["AB"])
    C_R     = ci(["R"])
    C_H     = ci(["H"])
    C_2B    = ci(["2B"])
    C_3B    = ci(["3B"])
    C_HR    = ci(["HR"])
    C_RBI   = ci(["RBI"])
    C_TB    = ci(["TB"])
    C_SLG   = ci(["SLG%", "SLG"])
    C_BB    = ci(["BB"])
    C_HBP   = ci(["HBP"])
    C_SO    = ci(["SO", "K"])
    C_GDP   = ci(["GDP"])
    C_OBP   = ci(["OB%", "OBP"])
    C_SF    = ci(["SF"])
    C_SH    = ci(["SH"])
    C_SBATT = ci(["SB-ATT", "SB"])

    if C_NAME < 0 or C_AB < 0:
        return []

    results = []
    for tr in rows[header_idx + 1:]:
        cells_td = tr.find_all(["td", "th"])
        if len(cells_td) < 5:
            continue

        def cell(i: int) -> str:
            return " ".join(cells_td[i].get_text(strip=True).split()) if 0 <= i < len(cells_td) else ""

        name = _clean_name(cells_td[C_NAME]) if C_NAME >= 0 else ""
        if not name or name.lower() in _SKIP:
            continue
        if name.upper() in ("PLAYER", "NAME", "#", "BIO LINK"):
            continue

        # Parse compound GP-GS field
        gpgs_raw = cell(C_GPGS)
        if "-" in gpgs_raw:
            gp = _split_dash(gpgs_raw, 0)
            gs = _split_dash(gpgs_raw, 1)
        else:
            gp = _int(gpgs_raw)
            gs = None

        # Parse SB-ATT
        sbatt_raw = cell(C_SBATT) if C_SBATT >= 0 else ""
        if "-" in sbatt_raw:
            sb  = _split_dash(sbatt_raw, 0)
            sb_att = _split_dash(sbatt_raw, 1)
        else:
            sb     = _int(sbatt_raw)
            sb_att = None

        results.append({
            "jersey": cell(C_NO) or None,
            "name":   name,
            "gp":     gp,
            "gs":     gs,
            "ab":     _int(cell(C_AB)),
            "r":      _int(cell(C_R)),
            "h":      _int(cell(C_H)),
            "doubles":_int(cell(C_2B)),
            "triples":_int(cell(C_3B)),
            "hr":     _int(cell(C_HR)),
            "rbi":    _int(cell(C_RBI)),
            "tb":     _int(cell(C_TB)),
            "bb":     _int(cell(C_BB)),
            "hbp":    _int(cell(C_HBP)),
            "k":      _int(cell(C_SO)),
            "gdp":    _int(cell(C_GDP)),
            "sf":     _int(cell(C_SF)),
            "sh":     _int(cell(C_SH)),
            "sb":     sb,
            "sb_att": sb_att,
            "avg":    _float(cell(C_AVG)),
            "obp":    _float(cell(C_OBP)),
            "slg":    _float(cell(C_SLG)),
            "ops":    _float(cell(C_OPS)),
            "is_pitcher": False,
        })
    return results


def _parse_pitching_table(table) -> list[dict]:
    """Parse Sidearm pitching table: #, Player, ERA, WHIP, W-L, APP-GS, CG, SHO, SV, IP..."""
    rows = table.find_all("tr")
    if not rows:
        return []

    header_idx = 0
    for i, tr in enumerate(rows[:3]):
        cells = [td.get_text(strip=True).upper() for td in tr.find_all(["th", "td"])]
        if "ERA" in cells or "IP" in cells:
            header_idx = i
            break

    hdrs = [td.get_text(strip=True).upper() for td in rows[header_idx].find_all(["th", "td"])]

    def ci(names: list[str]) -> int:
        for n in names:
            for i, h in enumerate(hdrs):
                if h == n:
                    return i
        return -1

    C_NO    = ci(["#", "NO"])
    C_NAME  = ci(["PLAYER", "NAME"])
    C_ERA   = ci(["ERA"])
    C_WHIP  = ci(["WHIP"])
    C_WL    = ci(["W-L", "W"])
    C_APPGS = ci(["APP-GS", "APP", "G-GS"])
    C_CG    = ci(["CG"])
    C_SHO   = ci(["SHO"])
    C_SV    = ci(["SV"])
    C_IP    = ci(["IP"])
    C_H     = ci(["H"])
    C_R     = ci(["R"])
    C_ER    = ci(["ER"])
    C_BB    = ci(["BB"])
    C_SO    = ci(["SO", "K"])
    C_HR    = ci(["HR"])
    C_BAVG  = ci(["B/AVG", "AVG", "OPP AVG"])
    C_WP    = ci(["WP"])
    C_HBP   = ci(["HBP"])
    C_BK    = ci(["BK"])

    if C_NAME < 0 or C_IP < 0:
        return []

    results = []
    for tr in rows[header_idx + 1:]:
        cells_td = tr.find_all(["td", "th"])
        if len(cells_td) < 5:
            continue

        def cell(i: int) -> str:
            return " ".join(cells_td[i].get_text(strip=True).split()) if 0 <= i < len(cells_td) else ""

        name = _clean_name(cells_td[C_NAME]) if C_NAME >= 0 else ""
        if not name or name.lower() in _SKIP:
            continue
        if name.upper() in ("PLAYER", "NAME", "#", "BIO LINK"):
            continue

        # W-L → w, l
        wl_raw = cell(C_WL) if C_WL >= 0 else ""
        if "-" in wl_raw:
            w = _split_dash(wl_raw, 0)
            l = _split_dash(wl_raw, 1)
        else:
            w = _int(wl_raw)
            l = None

        # APP-GS → app, gs
        appgs_raw = cell(C_APPGS) if C_APPGS >= 0 else ""
        if "-" in appgs_raw:
            app = _split_dash(appgs_raw, 0)
            gs  = _split_dash(appgs_raw, 1)
        else:
            app = _int(appgs_raw)
            gs  = None

        # SHO might be "0-0" — take first part
        sho_raw = cell(C_SHO) if C_SHO >= 0 else ""
        sho = _split_dash(sho_raw, 0) if "-" in sho_raw else _int(sho_raw)

        results.append({
            "jersey":     cell(C_NO) or None,
            "name":       name,
            "era":        _float(cell(C_ERA)),
            "whip":       _float(cell(C_WHIP)),
            "w":          w,
            "l":          l,
            "app":        app,
            "gs":         gs,
            "cg":         _int(cell(C_CG)),
            "sho":        sho,
            "sv":         _int(cell(C_SV)),
            "ip":         _ip(cell(C_IP)),
            "h":          _int(cell(C_H)),
            "r":          _int(cell(C_R)),
            "er":         _int(cell(C_ER)),
            "bb":         _int(cell(C_BB)),
            "so":         _int(cell(C_SO)),
            "hr_allowed": _int(cell(C_HR)),
            "b_avg":      _float(cell(C_BAVG)),
            "wp":         _int(cell(C_WP)),
            "hbp":        _int(cell(C_HBP)),
            "bk":         _int(cell(C_BK)),
            "is_pitcher": True,
        })
    return results


def parse_baseball_page(html: str) -> tuple[list[dict], list[dict]]:
    """
    Parse a Sidearm baseball/softball stats page.
    Returns (batters, pitchers).
    """
    soup = BeautifulSoup(html, "html.parser")
    tables = soup.find_all("table")
    if len(tables) < 2:
        return [], []

    batters  = _parse_batting_table(tables[0])  if tables else []
    pitchers = _parse_pitching_table(tables[1]) if len(tables) > 1 else []
    return batters, pitchers


# ── HTTP ─────────────────────────────────────────────────────────────────────

def fetch(url: str, retries: int = 2) -> Optional[httpx.Response]:
    for attempt in range(retries):
        try:
            r = httpx.get(url, headers=BROWSER_HEADERS, timeout=TIMEOUT, follow_redirects=True)
            return r
        except Exception:
            if attempt < retries - 1:
                time.sleep(5)
    return None


# ── DB helpers ────────────────────────────────────────────────────────────────

def upsert_team(conn, sport: str, slug: str, name: str, base_url: str) -> int:
    row = conn.execute("""
        INSERT INTO njcaa_reg_baseball_teams (region, sport, slug, name, base_url, season)
        VALUES ('naia', %s, %s, %s, %s, %s)
        ON CONFLICT (region, sport, slug, season) DO UPDATE SET
            name     = COALESCE(EXCLUDED.name,     njcaa_reg_baseball_teams.name),
            base_url = EXCLUDED.base_url
        RETURNING id
    """, (sport, slug, name, base_url, SEASON)).fetchone()
    return row["id"]


def upsert_player(conn, team_id: int, name: str, jersey: str | None) -> int:
    row = conn.execute("""
        INSERT INTO njcaa_reg_baseball_players (team_id, jersey, full_name)
        VALUES (%s, %s, %s)
        ON CONFLICT (team_id, full_name) DO UPDATE SET
            jersey = COALESCE(EXCLUDED.jersey, njcaa_reg_baseball_players.jersey)
        RETURNING id
    """, (team_id, jersey, name)).fetchone()
    return row["id"]


def upsert_batting(conn, player_id: int, p: dict):
    conn.execute("""
        INSERT INTO njcaa_reg_baseball_stats (
            player_id, season, g, gs, ab, r, h, doubles, triples, hr, rbi, tb,
            bb, hbp, k, gdp, sf, sh, sb, sb_att, avg, obp, slg, ops
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (player_id, season) DO UPDATE SET
            g      = COALESCE(EXCLUDED.g,      njcaa_reg_baseball_stats.g),
            gs     = COALESCE(EXCLUDED.gs,     njcaa_reg_baseball_stats.gs),
            ab     = COALESCE(EXCLUDED.ab,     njcaa_reg_baseball_stats.ab),
            r      = COALESCE(EXCLUDED.r,      njcaa_reg_baseball_stats.r),
            h      = COALESCE(EXCLUDED.h,      njcaa_reg_baseball_stats.h),
            doubles= COALESCE(EXCLUDED.doubles,njcaa_reg_baseball_stats.doubles),
            triples= COALESCE(EXCLUDED.triples,njcaa_reg_baseball_stats.triples),
            hr     = COALESCE(EXCLUDED.hr,     njcaa_reg_baseball_stats.hr),
            rbi    = COALESCE(EXCLUDED.rbi,    njcaa_reg_baseball_stats.rbi),
            tb     = COALESCE(EXCLUDED.tb,     njcaa_reg_baseball_stats.tb),
            bb     = COALESCE(EXCLUDED.bb,     njcaa_reg_baseball_stats.bb),
            hbp    = COALESCE(EXCLUDED.hbp,    njcaa_reg_baseball_stats.hbp),
            k      = COALESCE(EXCLUDED.k,      njcaa_reg_baseball_stats.k),
            gdp    = COALESCE(EXCLUDED.gdp,    njcaa_reg_baseball_stats.gdp),
            sf     = COALESCE(EXCLUDED.sf,     njcaa_reg_baseball_stats.sf),
            sh     = COALESCE(EXCLUDED.sh,     njcaa_reg_baseball_stats.sh),
            sb     = COALESCE(EXCLUDED.sb,     njcaa_reg_baseball_stats.sb),
            sb_att = COALESCE(EXCLUDED.sb_att, njcaa_reg_baseball_stats.sb_att),
            avg    = COALESCE(EXCLUDED.avg,    njcaa_reg_baseball_stats.avg),
            obp    = COALESCE(EXCLUDED.obp,    njcaa_reg_baseball_stats.obp),
            slg    = COALESCE(EXCLUDED.slg,    njcaa_reg_baseball_stats.slg),
            ops    = COALESCE(EXCLUDED.ops,    njcaa_reg_baseball_stats.ops)
    """, (
        player_id, SEASON,
        p.get("gp"), p.get("gs"), p.get("ab"), p.get("r"), p.get("h"),
        p.get("doubles"), p.get("triples"), p.get("hr"), p.get("rbi"), p.get("tb"),
        p.get("bb"), p.get("hbp"), p.get("k"), p.get("gdp"), p.get("sf"), p.get("sh"),
        p.get("sb"), p.get("sb_att"),
        p.get("avg"), p.get("obp"), p.get("slg"), p.get("ops"),
    ))


def upsert_pitching(conn, player_id: int, p: dict):
    conn.execute("""
        INSERT INTO njcaa_reg_baseball_pitching_stats (
            player_id, season, app, gs, cg, sho, sv, ip, h, r, er, bb, so,
            hr_allowed, w, l, era, whip, wp, hbp, bk, b_avg
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (player_id, season) DO UPDATE SET
            app        = COALESCE(EXCLUDED.app,        njcaa_reg_baseball_pitching_stats.app),
            gs         = COALESCE(EXCLUDED.gs,         njcaa_reg_baseball_pitching_stats.gs),
            cg         = COALESCE(EXCLUDED.cg,         njcaa_reg_baseball_pitching_stats.cg),
            sho        = COALESCE(EXCLUDED.sho,        njcaa_reg_baseball_pitching_stats.sho),
            sv         = COALESCE(EXCLUDED.sv,         njcaa_reg_baseball_pitching_stats.sv),
            ip         = COALESCE(EXCLUDED.ip,         njcaa_reg_baseball_pitching_stats.ip),
            h          = COALESCE(EXCLUDED.h,          njcaa_reg_baseball_pitching_stats.h),
            r          = COALESCE(EXCLUDED.r,          njcaa_reg_baseball_pitching_stats.r),
            er         = COALESCE(EXCLUDED.er,         njcaa_reg_baseball_pitching_stats.er),
            bb         = COALESCE(EXCLUDED.bb,         njcaa_reg_baseball_pitching_stats.bb),
            so         = COALESCE(EXCLUDED.so,         njcaa_reg_baseball_pitching_stats.so),
            hr_allowed = COALESCE(EXCLUDED.hr_allowed, njcaa_reg_baseball_pitching_stats.hr_allowed),
            w          = COALESCE(EXCLUDED.w,          njcaa_reg_baseball_pitching_stats.w),
            l          = COALESCE(EXCLUDED.l,          njcaa_reg_baseball_pitching_stats.l),
            era        = COALESCE(EXCLUDED.era,        njcaa_reg_baseball_pitching_stats.era),
            whip       = COALESCE(EXCLUDED.whip,       njcaa_reg_baseball_pitching_stats.whip),
            wp         = COALESCE(EXCLUDED.wp,         njcaa_reg_baseball_pitching_stats.wp),
            hbp        = COALESCE(EXCLUDED.hbp,        njcaa_reg_baseball_pitching_stats.hbp),
            bk         = COALESCE(EXCLUDED.bk,         njcaa_reg_baseball_pitching_stats.bk),
            b_avg      = COALESCE(EXCLUDED.b_avg,      njcaa_reg_baseball_pitching_stats.b_avg)
    """, (
        player_id, SEASON,
        p.get("app"), p.get("gs"), p.get("cg"), p.get("sho"), p.get("sv"),
        p.get("ip"), p.get("h"), p.get("r"), p.get("er"), p.get("bb"), p.get("so"),
        p.get("hr_allowed"), p.get("w"), p.get("l"),
        p.get("era"), p.get("whip"), p.get("wp"), p.get("hbp"), p.get("bk"), p.get("b_avg"),
    ))


# ── Core scrape ───────────────────────────────────────────────────────────────

def scrape_school(conn, school: dict, sport: str) -> int:
    base = school["url"].rstrip("/")
    slug = school.get("slug") or re.sub(r"[^a-z0-9]", "", school["name"].lower())
    url  = base + SPORT_PATHS[sport]

    r = fetch(url)
    if not r or r.status_code != 200 or len(r.content) < 5000:
        return 0

    batters, pitchers = parse_baseball_page(r.text)
    if not batters and not pitchers:
        return 0

    team_id = upsert_team(conn, sport, slug, school["name"], base)
    saved = 0

    for p in batters:
        if not p.get("name"):
            continue
        pid = upsert_player(conn, team_id, p["name"], p.get("jersey"))
        upsert_batting(conn, pid, p)
        saved += 1

    for p in pitchers:
        if not p.get("name"):
            continue
        pid = upsert_player(conn, team_id, p["name"], p.get("jersey"))
        upsert_pitching(conn, pid, p)
        saved += 1

    conn.commit()
    return saved


# ── Summary ───────────────────────────────────────────────────────────────────

def print_summary(conn):
    for sport, label in [("bsb", "Baseball"), ("sball", "Softball")]:
        r = conn.execute("""
            SELECT COUNT(DISTINCT t.id) teams,
                   COUNT(DISTINCT p.id) players,
                   COUNT(DISTINCT bs.id) batters,
                   COUNT(DISTINCT ps.id) pitchers
            FROM njcaa_reg_baseball_teams t
            JOIN njcaa_reg_baseball_players p ON p.team_id = t.id
            LEFT JOIN njcaa_reg_baseball_stats bs ON bs.player_id = p.id
            LEFT JOIN njcaa_reg_baseball_pitching_stats ps ON ps.player_id = p.id
            WHERE t.region = 'naia' AND t.sport = %s
        """, (sport,)).fetchone()
        print(f"  NAIA {label}: {r['teams']} teams, {r['players']} players "
              f"({r['batters']} batting rows, {r['pitchers']} pitching rows)")


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="NAIA Baseball/Softball Stats Scraper")
    parser.add_argument("--sport", choices=["bsb", "sball"], default=None)
    parser.add_argument("--test",  type=int, default=None, help="Only first N schools")
    args = parser.parse_args()

    schools = json.load(open(SCHOOLS_FILE))
    if args.test:
        schools = schools[:args.test]

    sports = [args.sport] if args.sport else ["bsb", "sball"]

    print(f"=== NAIA Baseball/Softball Scraper ===")
    print(f"  Season : {SEASON}")
    print(f"  Schools: {len(schools)}")
    print(f"  Sports : {', '.join(sports)}")

    with psycopg.connect(
        host=DB_CONFIG["host"], port=DB_CONFIG["port"], dbname=DB_CONFIG["dbname"],
        row_factory=dict_row, autocommit=False,
    ) as conn:
        for sport in sports:
            label = "Baseball" if sport == "bsb" else "Softball"
            print(f"\n{'='*60}")
            print(f"  {label} ({sport})")
            total_schools = 0
            total_players = 0

            for i, school in enumerate(schools):
                n = scrape_school(conn, school, sport)
                if n > 0:
                    total_schools += 1
                    total_players += n
                    print(f"  {total_schools:>3} {school['name']:<40} {n:>3} players")
                if i < len(schools) - 1:
                    time.sleep(DELAY)

            print(f"\n  → {sport}: {total_players} players from {total_schools} schools")

        print()
        print_summary(conn)


if __name__ == "__main__":
    main()
