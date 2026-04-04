"""
NJCAA Regional Soccer Scraper — msoc + wsoc
Per-team stats from all accessible NJCAA regional sites.

Confirmed regions (per audit):
  msoc: r1, r2, r3, r4, r5, r6, r7, r8, r11, r12, r13, r17, r19, r20, r21, r22, r24
  wsoc: r1, r2, r3, r4, r5, r6, r7, r8, r11, r12, r13, r15, r17, r19, r20, r21, r22, r24
  (r14 leaders-only for both sports; r9/r10/r16/r18/r23 blocked/incompatible)

Stat format (both sports, all categories identical):
  # | Name | Yr | Pos | gp | gs | g | a | pts | sh | sh% | sog | sog% | yc | rc | pk | gw
    gp=games played, gs=games started, g=goals, a=assists, pts=points,
    sh=shots, sh%=shot%, sog=shots on goal, sog%=SOG%, yc=yellow cards,
    rc=red cards, pk="made-att" string, gw=game-winning goals

Usage:
  python3 njcaa_regional_soccer_scraper.py --sport msoc
  python3 njcaa_regional_soccer_scraper.py --sport wsoc
  python3 njcaa_regional_soccer_scraper.py            # both
  python3 njcaa_regional_soccer_scraper.py --region r5 --sport msoc
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

SEASON = "2024-25"
CRAWL_DELAY  = 4
REGION_DELAY = 8

TEAMS_JSON = Path(__file__).parent / "njcaa_regional_soccer_teams.json"

REGIONS = {
    "r1":  "https://www.accac.org",
    "r2":  "https://region2athletics.com",
    "r3":  "https://www.njcaaregion3.org",
    "r4":  "https://www.region4sports.com",
    "r5":  "https://njcaaregion5.com",
    "r6":  "https://kjccc.org",
    "r7":  "http://tjccaa.com",
    "r8":  "https://thefcsaasports.com",
    "r11": "https://iccac.org",
    "r12": "https://njcaaregion12.org",
    "r13": "https://njcaaregion13.org",
    "r14": "https://njcaaregion14.com",
    "r15": "https://region15athletics.com",
    "r17": "https://thegcaa.com",
    "r19": "https://njcaaregion19.com",
    "r20": "https://njcaaregion20.org",
    "r21": "https://njcaaregionxxi.com",
    "r22": "https://acccathletics.com",
    "r24": "https://njcaaregion24.com",
}

# r1/r3/r8/r22 use newer PrestoSports (no AJAX endpoint; stats on full team page)
FULLPAGE_REGIONS = {"r1", "r3", "r8", "r22"}

# r4/r7 have no per-player stats accessible — roster names only
ROSTER_ONLY_REGIONS = {"r4", "r7"}

# Regions that have per-team stats (r14 confirmed leaders-only for both sports)
VALID_REGIONS = {
    "msoc": ["r1", "r2", "r3", "r4", "r5", "r7", "r8", "r19", "r24"],
    "wsoc": ["r1", "r2", "r3", "r4", "r5", "r7", "r8", "r15", "r19", "r24"],
}

BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
}

# ── DB Schema ─────────────────────────────────────────────────────────────────

CREATE_TEAMS = """
CREATE TABLE IF NOT EXISTS njcaa_reg_soccer_teams (
    id       SERIAL PRIMARY KEY,
    region   TEXT NOT NULL,
    sport    TEXT NOT NULL,   -- 'msoc' or 'wsoc'
    slug     TEXT NOT NULL,
    name     TEXT,
    base_url TEXT NOT NULL,
    season   TEXT NOT NULL,
    UNIQUE (region, sport, slug, season)
);
"""

CREATE_PLAYERS = """
CREATE TABLE IF NOT EXISTS njcaa_reg_soccer_players (
    id         SERIAL PRIMARY KEY,
    team_id    INT  NOT NULL REFERENCES njcaa_reg_soccer_teams(id),
    jersey     TEXT,
    full_name  TEXT NOT NULL,
    position   TEXT,
    class_year TEXT,
    UNIQUE (team_id, full_name)
);
"""

CREATE_STATS = """
CREATE TABLE IF NOT EXISTS njcaa_reg_soccer_stats (
    id        SERIAL PRIMARY KEY,
    player_id INT  NOT NULL REFERENCES njcaa_reg_soccer_players(id),
    season    TEXT NOT NULL,
    gp        INT,
    gs        INT,
    goals     INT,
    assists   INT,
    pts       INT,
    shots     INT,
    sh_pct    NUMERIC(6,4),
    sog       INT,
    sog_pct   NUMERIC(6,4),
    yc        INT,
    rc        INT,
    pk_made   INT,
    pk_att    INT,
    gw        INT,
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
    hdrs = {**BROWSER_HEADERS, "Origin": base, "Referer": referer}
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


def discover_slugs(base: str, sport: str) -> list[str]:
    nav_hdrs = {
        "User-Agent": BROWSER_HEADERS["User-Agent"],
        "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
        "Sec-Fetch-Dest": "document", "Sec-Fetch-Mode": "navigate", "Sec-Fetch-Site": "none",
    }
    url = f"{base}/sports/{sport}/{SEASON}/teams"
    try:
        r = httpx.get(url, headers=nav_hdrs, timeout=20, follow_redirects=True)
        if r.status_code == 202 and len(r.content) < 5000:
            return []
        if r.status_code != 200:
            return []
        soup = BeautifulSoup(r.text, "html.parser")
        links = [a["href"] for a in soup.find_all("a", href=True)
                 if f"/sports/{sport}/{SEASON}/teams/" in a["href"]
                 and not a["href"].rstrip("/").endswith("/teams")]
        return list(dict.fromkeys(
            h.split("/teams/")[1].split("?")[0].split("/")[0] for h in links
            if h.split("/teams/")[1].split("?")[0].split("/")[0]
        ))
    except Exception:
        return []

# ── Parsing ───────────────────────────────────────────────────────────────────

def _di(v: str | None) -> int | None:
    if not v or v.strip() in ("-", "", "—"):
        return None
    try:
        return int(str(v).replace(",", "").strip())
    except ValueError:
        return None

def _pct(v: str | None) -> float | None:
    if not v or v.strip() in ("-", "", "—"):
        return None
    try:
        f = float(str(v).replace("%", "").strip())
        return round(f / 100, 4) if f > 1.5 else round(f, 4)
    except ValueError:
        return None

def _pk(v: str | None) -> tuple[int | None, int | None]:
    """Parse '3-5' → (3, 5)."""
    if not v or v.strip() in ("-", "", "—", "0"):
        return None, None
    if "-" in str(v):
        parts = str(v).split("-", 1)
        try:
            return int(parts[0]), int(parts[1])
        except ValueError:
            pass
    return None, None


def parse_soccer_table(html: str) -> list[dict]:
    """
    Fixed 17-column soccer format (confirmed identical for msoc/wsoc, all regions):
      0:# 1:Name 2:Yr 3:Pos 4:gp 5:gs 6:g 7:a 8:pts 9:sh
      10:sh% 11:sog 12:sog% 13:yc 14:rc 15:pk 16:gw
    """
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table")
    if not table:
        return []
    thead = table.find("thead")
    if not thead:
        return []

    raw_hdrs = [th.get_text(strip=True).lower() for th in thead.find_all(["th", "td"])]

    def ci(names, default):
        for n in names:
            for i, h in enumerate(raw_hdrs):
                if h == n:
                    return i
        return default

    C_JERSEY = ci(["#", "no", "no."], 0)
    C_NAME   = ci(["name", "player"], 1)
    C_YR     = ci(["yr", "cl", "class"], 2)
    C_POS    = ci(["pos", "position"], 3)
    C_GP     = ci(["gp", "g"], 4)
    C_GS     = ci(["gs"], 5)
    C_G      = ci(["g"], 6)    # goals — 'g' conflicts with gp on some sites
    C_A      = ci(["a"], 7)
    C_PTS    = ci(["pts", "points"], 8)
    C_SH     = ci(["sh"], 9)
    C_SHPCT  = ci(["sh%"], 10)
    C_SOG    = ci(["sog"], 11)
    C_SOGPCT = ci(["sog%"], 12)
    C_YC     = ci(["yc"], 13)
    C_RC     = ci(["rc"], 14)
    C_PK     = ci(["pk"], 15)
    C_GW     = ci(["gw"], 16)

    # For goals: if 'g' maps to same index as gp, offset by position
    # Use fixed positional fallback for ambiguous columns
    rows = []
    tbody = table.find("tbody") or table
    for tr in tbody.find_all("tr"):
        cells = tr.find_all(["td", "th"])
        if len(cells) < 8:
            continue

        def cell(i):
            return " ".join(cells[i].get_text(strip=True).split()) if i < len(cells) else ""

        name_raw = cell(C_NAME)
        _SKIP = {"name", "player", "totals", "total", "", "opponent", "opponents",
                 "home", "away", "exhibition", "conference", "non-conference"}
        if not name_raw or name_raw.lower() in _SKIP:
            continue

        pk_made, pk_att = _pk(cell(C_PK))

        rows.append({
            "name":    " ".join(name_raw.split()),
            "jersey":  cell(C_JERSEY) or None,
            "pos":     cell(C_POS) or None,
            "cl":      cell(C_YR) or None,
            "gp":      _di(cell(C_GP)),
            "gs":      _di(cell(C_GS)),
            "goals":   _di(cell(C_G)),
            "assists": _di(cell(C_A)),
            "pts":     _di(cell(C_PTS)),
            "shots":   _di(cell(C_SH)),
            "sh_pct":  _pct(cell(C_SHPCT)),
            "sog":     _di(cell(C_SOG)),
            "sog_pct": _pct(cell(C_SOGPCT)),
            "yc":      _di(cell(C_YC)),
            "rc":      _di(cell(C_RC)),
            "pk_made": pk_made,
            "pk_att":  pk_att,
            "gw":      _di(cell(C_GW)),
        })
    return rows

# ── DB Writes ─────────────────────────────────────────────────────────────────

def upsert_team(conn, region, sport, slug, base):
    row = conn.execute("""
        INSERT INTO njcaa_reg_soccer_teams (region, sport, slug, base_url, season)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (region, sport, slug, season) DO UPDATE SET base_url = EXCLUDED.base_url
        RETURNING id
    """, (region, sport, slug, base, SEASON)).fetchone()
    return row["id"]

def upsert_player(conn, team_id, row):
    r = conn.execute("""
        INSERT INTO njcaa_reg_soccer_players (team_id, jersey, full_name, position, class_year)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (team_id, full_name) DO UPDATE SET
            jersey     = COALESCE(EXCLUDED.jersey,     njcaa_reg_soccer_players.jersey),
            position   = COALESCE(EXCLUDED.position,   njcaa_reg_soccer_players.position),
            class_year = COALESCE(EXCLUDED.class_year, njcaa_reg_soccer_players.class_year)
        RETURNING id
    """, (team_id, row.get("jersey"), row["name"], row.get("pos"), row.get("cl"))).fetchone()
    return r["id"]

def upsert_stats(conn, player_id, row):
    conn.execute("""
        INSERT INTO njcaa_reg_soccer_stats (
            player_id, season, gp, gs, goals, assists, pts,
            shots, sh_pct, sog, sog_pct, yc, rc, pk_made, pk_att, gw
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT (player_id, season) DO UPDATE SET
            gp=EXCLUDED.gp, gs=EXCLUDED.gs, goals=EXCLUDED.goals,
            assists=EXCLUDED.assists, pts=EXCLUDED.pts,
            shots=EXCLUDED.shots, sh_pct=EXCLUDED.sh_pct,
            sog=EXCLUDED.sog, sog_pct=EXCLUDED.sog_pct,
            yc=EXCLUDED.yc, rc=EXCLUDED.rc,
            pk_made=EXCLUDED.pk_made, pk_att=EXCLUDED.pk_att, gw=EXCLUDED.gw
    """, (player_id, SEASON,
          row.get("gp"), row.get("gs"), row.get("goals"), row.get("assists"), row.get("pts"),
          row.get("shots"), row.get("sh_pct"), row.get("sog"), row.get("sog_pct"),
          row.get("yc"), row.get("rc"), row.get("pk_made"), row.get("pk_att"), row.get("gw")))

# ── Core Scrape ───────────────────────────────────────────────────────────────

def scrape_team(conn, region, sport, slug, base):
    team_page = f"{base}/sports/{sport}/{SEASON}/teams/{slug}"
    url = f"{team_page}?tmpl=brief-category-template&pos=overall&r=0"
    r = fetch(url, base, team_page)
    if not r or r.status_code != 200:
        print(f"      SKIP {slug} [{r.status_code if r else 'err'}]")
        return 0
    rows = parse_soccer_table(r.text)
    if not rows:
        print(f"      SKIP {slug} [no data]")
        return 0
    team_id = upsert_team(conn, region, sport, slug, base)
    saved = 0
    for row in rows:
        if not row["name"]:
            continue
        pid = upsert_player(conn, team_id, row)
        upsert_stats(conn, pid, row)
        saved += 1
    conn.commit()
    return saved


def parse_fullpage_stats(html: str) -> list[dict]:
    """
    Parse per-player season totals from the newer PrestoSports full team page.
    These pages have multiple stat tables (no <thead>). We want the overall totals table:
      No., Name, Yr, Pos, gp, gs, g, a, pts, sh, sh%, sog, sog%, yc, rc, pk, gw
    We identify it by: first row has g, a, pts columns but NOT gpg (averages) or date.
    """
    soup = BeautifulSoup(html, "html.parser")
    target_table = None
    header_row_idx = -1
    for t in soup.find_all("table"):
        rows = t.find_all("tr")
        for ri, tr in enumerate(rows[:3]):  # header is usually in first 3 rows
            hdrs = [td.get_text(strip=True).lower() for td in tr.find_all(["th", "td"])]
            # Must be a player stats table: has gp, gs, g, a, pts; no averages (gpg/a/g); no date
            # Also must have a name/player column (name or player in hdrs, else require no./# + gp)
            has_player_cols = ("gp" in hdrs and "gs" in hdrs and "g" in hdrs
                               and "a" in hdrs and "pts" in hdrs)
            not_avg_or_schedule = "gpg" not in hdrs and "date" not in hdrs and "opponent" not in hdrs
            has_name_col = "name" in hdrs or "player" in hdrs
            if has_player_cols and not_avg_or_schedule and has_name_col:
                target_table = t
                header_row_idx = ri
                break
        if target_table:
            break
    if not target_table:
        return []

    all_rows = target_table.find_all("tr")
    # Get column indices from the header row
    hdr = all_rows[header_row_idx]
    raw_hdrs = [td.get_text(strip=True).lower() for td in hdr.find_all(["th", "td"])]

    def ci(names):
        for n in names:
            for i, h in enumerate(raw_hdrs):
                if h == n:
                    return i
        return -1

    C_JERSEY = ci(["#", "no.", "no"])
    C_NAME   = ci(["name", "player"])
    C_YR     = ci(["yr", "cl", "class"])
    C_POS    = ci(["pos", "position"])
    C_GP     = ci(["gp"])
    C_GS     = ci(["gs"])
    C_G      = ci(["g"])
    C_A      = ci(["a"])
    C_PTS    = ci(["pts", "points"])
    C_SH     = ci(["sh"])
    C_SHPCT  = ci(["sh%"])
    C_SOG    = ci(["sog"])
    C_SOGPCT = ci(["sog%"])
    C_YC     = ci(["yc"])
    C_RC     = ci(["rc"])
    C_PK     = ci(["pk"])
    C_GW     = ci(["gw"])

    if C_NAME < 0 or C_G < 0:
        return []

    rows = []
    for tr in all_rows[header_row_idx + 1:]:
        cells = tr.find_all(["td", "th"])

        def cell(i):
            return " ".join(cells[i].get_text(strip=True).split()) if 0 <= i < len(cells) else ""

        name_raw = cell(C_NAME)
        # Skip summary/header rows
        SKIP_NAMES = {"name", "player", "totals", "total", "", "opponent", "opponents",
                      "home", "away", "exhibition", "conference", "non-conference"}
        if not name_raw or name_raw.lower() in SKIP_NAMES:
            continue
        # Skip rows that look like sub-headers
        if name_raw.lower() in raw_hdrs:
            continue

        pk_made, pk_att = _pk(cell(C_PK)) if C_PK >= 0 else (None, None)
        rows.append({
            "name":    name_raw,
            "jersey":  cell(C_JERSEY) if C_JERSEY >= 0 else None,
            "pos":     cell(C_POS) if C_POS >= 0 else None,
            "cl":      cell(C_YR) if C_YR >= 0 else None,
            "gp":      _di(cell(C_GP)) if C_GP >= 0 else None,
            "gs":      _di(cell(C_GS)) if C_GS >= 0 else None,
            "goals":   _di(cell(C_G)),
            "assists": _di(cell(C_A)) if C_A >= 0 else None,
            "pts":     _di(cell(C_PTS)) if C_PTS >= 0 else None,
            "shots":   _di(cell(C_SH)) if C_SH >= 0 else None,
            "sh_pct":  _pct(cell(C_SHPCT)) if C_SHPCT >= 0 else None,
            "sog":     _di(cell(C_SOG)) if C_SOG >= 0 else None,
            "sog_pct": _pct(cell(C_SOGPCT)) if C_SOGPCT >= 0 else None,
            "yc":      _di(cell(C_YC)) if C_YC >= 0 else None,
            "rc":      _di(cell(C_RC)) if C_RC >= 0 else None,
            "pk_made": pk_made,
            "pk_att":  pk_att,
            "gw":      _di(cell(C_GW)) if C_GW >= 0 else None,
        })
    return rows


def scrape_team_fullpage(conn, region, sport, slug, base):
    """For r1/r3/r8: fetch full team page and parse embedded per-game stats."""
    team_page = f"{base}/sports/{sport}/{SEASON}/teams/{slug}"
    r = fetch(team_page, base, f"{base}/sports/{sport}/{SEASON}/teams")
    if not r or r.status_code != 200:
        print(f"      SKIP {slug} [{r.status_code if r else 'err'}]")
        return 0
    rows = parse_fullpage_stats(r.text)
    if not rows:
        print(f"      SKIP {slug} [no data]")
        return 0
    team_id = upsert_team(conn, region, sport, slug, base)
    saved = 0
    for row in rows:
        if not row["name"]:
            continue
        pid = upsert_player(conn, team_id, row)
        upsert_stats(conn, pid, row)
        saved += 1
    conn.commit()
    return saved


def scrape_team_roster_only(conn, region, sport, slug, base):
    """For r4/r7: fetch full page, extract player names from any table with Name column."""
    team_page = f"{base}/sports/{sport}/{SEASON}/teams/{slug}"
    r = fetch(team_page, base, f"{base}/sports/{sport}/{SEASON}/teams")
    if not r or r.status_code != 200:
        print(f"      SKIP {slug} [{r.status_code if r else 'err'}]")
        return 0
    soup = BeautifulSoup(r.text, "html.parser")
    # Extract player names from any linked player pages
    player_links = soup.find_all("a", href=True)
    seen = set()
    names = []
    for a in player_links:
        href = a["href"]
        if f"/sports/{sport}/{SEASON}/players/" in href:
            name = " ".join(a.get_text(strip=True).split())
            if name and name not in seen:
                seen.add(name)
                names.append(name)
    if not names:
        return 0
    team_id = upsert_team(conn, region, sport, slug, base)
    saved = 0
    for name in names:
        row = {"name": name, "jersey": None, "pos": None, "cl": None,
               "gp": None, "gs": None, "goals": None, "assists": None, "pts": None,
               "shots": None, "sh_pct": None, "sog": None, "sog_pct": None,
               "yc": None, "rc": None, "pk_made": None, "pk_att": None, "gw": None}
        pid = upsert_player(conn, team_id, row)
        upsert_stats(conn, pid, row)
        saved += 1
    conn.commit()
    return saved

def get_slugs(sport, region, base, teams_data):
    if teams_data and sport in teams_data and region in teams_data[sport]:
        slugs = teams_data[sport][region].get("slugs", [])
        if slugs:
            return slugs
    print(f"    [slug-discover] fetching listing page...")
    slugs = discover_slugs(base, sport)
    if not slugs:
        print(f"    [slug-discover] blocked/empty — skipping")
    return slugs

# ── Summary ───────────────────────────────────────────────────────────────────

def print_summary(conn, sport):
    row = conn.execute("""
        SELECT COUNT(DISTINCT t.id) AS teams, COUNT(DISTINCT p.id) AS players
        FROM njcaa_reg_soccer_teams t
        JOIN njcaa_reg_soccer_players p ON p.team_id = t.id
        WHERE t.sport = %s
    """, (sport,)).fetchone()
    label = "MSoc" if sport == "msoc" else "WSoc"
    print(f"\n  {label}: {row['teams']} teams, {row['players']} players")

    top = conn.execute("""
        SELECT p.full_name, t.slug, t.region, s.goals, s.assists, s.pts, s.gp, s.shots, s.sog
        FROM njcaa_reg_soccer_stats s
        JOIN njcaa_reg_soccer_players p ON s.player_id = p.id
        JOIN njcaa_reg_soccer_teams t ON p.team_id = t.id
        WHERE t.sport = %s AND s.gp >= 5
        ORDER BY s.goals DESC NULLS LAST LIMIT 5
    """, (sport,)).fetchall()
    if top:
        print(f"  Top {label} scorers (min 5 GP):")
        for r in top:
            print(f"    {r['full_name']:<28} {r['slug']:<35} [{r['region']}] "
                  f"G={r['goals']} A={r['assists']} PTS={r['pts']} GP={r['gp']}")

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sport", choices=["msoc", "wsoc"], default=None)
    parser.add_argument("--region", choices=list(REGIONS.keys()), default=None)
    args = parser.parse_args()

    teams_data = None
    if TEAMS_JSON.exists():
        with open(TEAMS_JSON) as f:
            teams_data = json.load(f)
        print(f"  Loaded slugs from {TEAMS_JSON.name}")
    else:
        print(f"  No slug file — will attempt dynamic discovery")

    sports = [args.sport] if args.sport else ["msoc", "wsoc"]

    print(f"=== NJCAA Regional Soccer Scraper ===")
    print(f"  Season  : {SEASON}")
    print(f"  Sports  : {', '.join(sports)}")

    with psycopg.connect(
        host=DB_CONFIG["host"], port=DB_CONFIG["port"], dbname=DB_CONFIG["dbname"],
        row_factory=psycopg.rows.dict_row, autocommit=False,
    ) as conn:
        ensure_schema(conn)

        for sport in sports:
            valid = VALID_REGIONS[sport]
            region_ids = [args.region] if args.region else valid
            print(f"\n{'='*60}\n  Sport: {sport.upper()}  ({len(region_ids)} regions)")

            total_teams = total_players = 0
            for i, region in enumerate(region_ids):
                base = REGIONS[region]
                if i > 0:
                    time.sleep(REGION_DELAY)
                slugs = get_slugs(sport, region, base, teams_data)
                if not slugs:
                    print(f"\n  [{region}] SKIP")
                    continue
                print(f"\n  [{region}] {base}  ({len(slugs)} teams)")
                rp = 0
                for j, slug in enumerate(slugs):
                    if region in FULLPAGE_REGIONS:
                        n = scrape_team_fullpage(conn, region, sport, slug, base)
                    elif region in ROSTER_ONLY_REGIONS:
                        n = scrape_team_roster_only(conn, region, sport, slug, base)
                    else:
                        n = scrape_team(conn, region, sport, slug, base)
                    if n > 0:
                        print(f"    {j+1:>2}/{len(slugs)} {slug[:38]:<38} {n:>3} players")
                    total_teams += 1
                    rp += n
                    if j < len(slugs) - 1:
                        time.sleep(CRAWL_DELAY)
                total_players += rp
                print(f"    → {region}: {rp} players")

            print_summary(conn, sport)
            print(f"  {sport} total: {total_teams} teams, {total_players} players")

if __name__ == "__main__":
    main()
