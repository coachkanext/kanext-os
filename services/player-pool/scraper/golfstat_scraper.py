"""
Golfstat College Golf Scraper — 2025-26 Season
Source: golfstat.com + results.golfstat.com (public, no auth required)

Data pulled:
  - Tournament list from livescoring index page
  - Additional tournaments via ID scan (28,800-current max)
  - Per-tournament: player leaderboard (name, pcid, school, round scores, to-par)
  - Scoring average computed per player across all tournaments

Usage:
    python3 golfstat_scraper.py                    # full run
    python3 golfstat_scraper.py --max-scan 200     # limit ID scan range
    python3 golfstat_scraper.py --tid 29476        # single tournament
    python3 golfstat_scraper.py --index-only       # only show tournament list
"""
from __future__ import annotations

import re
import sys
import time
import math
from datetime import datetime, date
from typing import Optional

import httpx
from bs4 import BeautifulSoup
import psycopg
from psycopg.rows import dict_row

DB_CONFIG = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}
SEASON    = "2025-26"
DELAY     = 0.5    # seconds between golfstat requests
HEADERS   = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept": "text/html,application/xhtml+xml",
}

LIVESCORING_URL  = "https://www.golfstat.com/index.cfm?event=public.livescoring"
RESULTS_BASE     = "https://results.golfstat.com/public/leaderboards/gsnav.cfm"


# ── Helpers ──────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)


def safe_int(val) -> Optional[int]:
    try:
        if val is None or (isinstance(val, float) and math.isnan(val)):
            return None
        s = str(val).strip().replace("+", "").replace(",", "")
        if s in ("", "-", "E"):
            return 0 if s == "E" else None
        return int(float(s))
    except (ValueError, TypeError):
        return None


def fetch(url: str, timeout: int = 15) -> Optional[str]:
    try:
        r = httpx.get(url, headers=HEADERS, timeout=timeout, follow_redirects=True)
        time.sleep(DELAY)
        if r.status_code == 200 and len(r.text) > 200:
            return r.text
    except Exception as e:
        print(f"    [warn] {url[:80]}: {e}")
    return None


def parse_to_par(text: str) -> Optional[int]:
    """'E' → 0, '-6' → -6, '+3' → 3, '-' → None"""
    t = str(text).strip()
    if t == "E":
        return 0
    if t in ("-", "", "--"):
        return None
    try:
        return int(t.replace("+", ""))
    except ValueError:
        return None


def parse_date_range(text: str) -> tuple[Optional[date], Optional[date]]:
    """'Mar 30, 2026 - Mar 31, 2026' → (date, date)"""
    if not text:
        return None, None
    parts = re.split(r"\s*-\s*", text.strip())
    def _parse(s: str) -> Optional[date]:
        for fmt in ("%b %d, %Y", "%B %d, %Y"):
            try:
                return datetime.strptime(s.strip(), fmt).date()
            except ValueError:
                pass
        return None
    start = _parse(parts[0]) if parts else None
    end   = _parse(parts[-1]) if len(parts) > 1 else start
    return start, end


# ── Tournament Index Scraper ──────────────────────────────────────────────────

def get_known_tournaments() -> list[dict]:
    """
    Fetch livescoring index page, extract tournament IDs and metadata.
    Returns list of {tid, name, host_school, gender, start_date, end_date,
                     course_name, location}.
    """
    html = fetch(LIVESCORING_URL)
    if not html:
        return []
    soup = BeautifulSoup(html, "html.parser")

    tournaments: dict[int, dict] = {}

    # Each tournament is in a col-4 mb-3 border div
    for card in soup.find_all("div", class_=re.compile(r"col-4.*mb-3")):
        link = card.find("a", href=re.compile(r"tournament_id="))
        if not link:
            continue
        href = link.get("href", "")
        m = re.search(r"tournament_id=(\d+)", href)
        if not m:
            continue
        tid = int(m.group(1))
        name = link.get_text(strip=True)

        # Host school (first div after link)
        host = None
        divs = card.find_all("div")
        if len(divs) >= 1:
            host = divs[0].get_text(strip=True) if divs[0].get_text(strip=True) else None

        # Course + location from second text div
        course = None
        location = None
        for d in card.find_all("div"):
            t = d.get_text(strip=True)
            if "," in t and not re.search(r"\d{4}", t):
                parts = t.split(",", 1)
                course = parts[0].strip()
                location = parts[1].strip()

        # Date range
        start_date = end_date = None
        for d in card.find_all("div"):
            t = d.get_text(strip=True)
            if re.search(r"\w{3}\s+\d{1,2},\s*\d{4}", t):
                start_date, end_date = parse_date_range(t)
                break

        # Gender from liveWomen / liveMen class
        gender = "m"  # default
        live_m = card.find("div", class_="liveMen")
        live_w = card.find("div", class_="liveWomen")
        if live_w and not live_m:
            gender = "f"
        elif live_m and not live_w:
            gender = "m"
        else:
            # Fall back to name
            if re.search(r"\bwomen\b|\bwomens\b|\bwomen's\b|\bnwsl\b", name, re.I):
                gender = "f"

        if tid not in tournaments:
            tournaments[tid] = {
                "tid": tid, "name": name, "host_school": host,
                "gender": gender, "start_date": start_date, "end_date": end_date,
                "course_name": course, "location": location,
            }

    return list(tournaments.values())


# ── Tournament ID Scanner ─────────────────────────────────────────────────────

def scan_recent_tournament_ids(
    known_tids: set[int],
    scan_from: int = 28800,
    scan_to: int = 29600,
) -> list[dict]:
    """
    Probe tournament IDs in range to discover unlisted tournaments.
    Returns list of {tid, gender} dicts for valid unknown tournaments.
    """
    found: list[dict] = []
    check_ids = [i for i in range(scan_from, scan_to + 1) if i not in known_tids]
    print(f"  Scanning {len(check_ids)} IDs in range {scan_from}-{scan_to} ...", flush=True)

    for tid in check_ids:
        url = f"{RESULTS_BASE}?pg=participants&tid={tid}"
        try:
            r = httpx.get(url, headers=HEADERS, timeout=6, follow_redirects=True)
            time.sleep(0.35)
            if r.status_code != 200 or len(r.text) < 300:
                continue
            # Quick gender detection from page content
            text = r.text.lower()
            if "women" in text:
                gender = "f"
            else:
                gender = "m"
            found.append({"tid": tid, "gender": gender})
            if len(found) % 20 == 0:
                print(f"    ... found {len(found)} so far (at id {tid})", flush=True)
        except Exception:
            continue

    print(f"  Scan complete: {len(found)} valid tournaments found")
    return found


# ── Player Leaderboard Parser ─────────────────────────────────────────────────

def parse_player_leaderboard(html: str, tid: int) -> list[dict]:
    """
    Parse the pg=player leaderboard page.
    Returns list of player dicts.

    Layout (inline-block divs in each row):
      [0] w:40   = position
      [1] w:40   = movement indicator (skip)
      [2] w:195  = player name (has onclick with pcid)
      [3] w:195  = school name
      [4] w:50   = to-par
      [5] w:50   = tee time (skip)
      [6] w:50   = running total or '-' (skip)
      [7+] w:30  = round scores (one per completed round)
      last w:40  = total gross score
    """
    soup = BeautifulSoup(html, "html.parser")
    players: list[dict] = []

    # Each player row is a <div style="color:black;">
    for row_div in soup.find_all("div", style=re.compile(r"color:\s*black", re.I)):
        # Find the player name anchor with onclick getScorecard
        name_a = row_div.find("a", onclick=re.compile(r"getScorecard", re.I))
        if not name_a:
            continue

        # Extract pcid from onclick: getScorecard(tid, rid, pcid, ...)
        onclick = name_a.get("onclick", "")
        pcid_m = re.match(r"getScorecard\(\s*\d+\s*,\s*\d+\s*,\s*(\d+)", onclick)
        if not pcid_m:
            continue
        pcid = int(pcid_m.group(1))
        full_name = name_a.get("title") or name_a.get_text(strip=True)

        # Get all inline-block column divs
        col_divs = row_div.find_all("div", style=re.compile(r"inline-block", re.I))
        if len(col_divs) < 4:
            continue

        # Position (col 0, w:40)
        position = col_divs[0].get_text(strip=True) or None

        # School (col 3, w:195) — skip name (col 2) and movement (col 1)
        school = col_divs[3].get_text(strip=True) if len(col_divs) > 3 else None

        # To-par (col 4, w:50)
        to_par_text = col_divs[4].get_text(strip=True) if len(col_divs) > 4 else "-"
        to_par = parse_to_par(to_par_text)

        # Round scores: find all w:30 divs containing <round_score>
        round_scores: list[int] = []
        html_str = str(row_div)
        for rs_m in re.finditer(r'<round_score>(\d+)</round_score>', html_str):
            round_scores.append(int(rs_m.group(1)))

        # Total score: last w:40 div with a numeric value
        total_score = None
        for div in reversed(col_divs):
            style = div.get("style", "")
            if "width:40px" in style:
                t = div.get_text(strip=True)
                if t.isdigit():
                    total_score = int(t)
                    break

        rounds_played = len(round_scores)
        players.append({
            "pcid":          pcid,
            "full_name":     full_name,
            "school":        school,
            "position":      position,
            "to_par":        to_par,
            "r1":            round_scores[0] if rounds_played > 0 else None,
            "r2":            round_scores[1] if rounds_played > 1 else None,
            "r3":            round_scores[2] if rounds_played > 2 else None,
            "r4":            round_scores[3] if rounds_played > 3 else None,
            "total_score":   total_score,
            "rounds_played": rounds_played,
        })

    return players


# ── DB Writers ────────────────────────────────────────────────────────────────

def upsert_tournament(conn, t: dict) -> str:
    """Upsert one tournament. Returns uuid."""
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO golf_tournaments
                (golfstat_tid, name, host_school, gender, season,
                 start_date, end_date, course_name, location)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (golfstat_tid) DO UPDATE SET
                name=EXCLUDED.name,
                gender=EXCLUDED.gender,
                start_date=COALESCE(EXCLUDED.start_date, golf_tournaments.start_date),
                end_date=COALESCE(EXCLUDED.end_date, golf_tournaments.end_date),
                course_name=COALESCE(EXCLUDED.course_name, golf_tournaments.course_name),
                location=COALESCE(EXCLUDED.location, golf_tournaments.location)
            RETURNING id
        """, (
            t["tid"], t["name"], t.get("host_school"), t["gender"], SEASON,
            t.get("start_date"), t.get("end_date"),
            t.get("course_name"), t.get("location"),
        ))
        return str(cur.fetchone()["id"])


def upsert_team(conn, school_name: str) -> str:
    """Upsert a golf team by name. Returns uuid."""
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO golf_teams (name, abbreviation)
            VALUES (%s, %s)
            ON CONFLICT (name) DO NOTHING
            RETURNING id
        """, (school_name, school_name[:20]))
        row = cur.fetchone()
        if row:
            return str(row["id"])
        # Already exists — fetch it
        cur.execute("SELECT id FROM golf_teams WHERE name=%s", (school_name,))
        return str(cur.fetchone()["id"])


def write_tournament_players(
    conn,
    tournament_uuid: str,
    players: list[dict],
    gender: str,
    team_cache: dict[str, str],
) -> tuple[int, int]:
    """
    Upsert players and results for one tournament.
    Returns (new_players, new_results).
    """
    athlete_table = "mgolf_athletes" if gender == "m" else "wgolf_athletes"
    result_table  = "mgolf_results"  if gender == "m" else "wgolf_results"

    new_players = new_results = 0

    for p in players:
        school = p.get("school") or ""
        if school and school not in team_cache:
            team_cache[school] = upsert_team(conn, school)
        tid_uuid = team_cache.get(school)

        with conn.transaction():
            cur = conn.cursor()
            # Upsert athlete
            cur.execute(f"""
                INSERT INTO {athlete_table} (golfstat_pcid, full_name, team_id)
                VALUES (%s, %s, %s)
                ON CONFLICT (golfstat_pcid) DO UPDATE SET
                    full_name=EXCLUDED.full_name,
                    team_id=COALESCE(EXCLUDED.team_id, {athlete_table}.team_id),
                    updated_at=now()
                RETURNING id, (xmax = 0) AS is_insert
            """, (p["pcid"], p["full_name"], tid_uuid))
            row = cur.fetchone()
            athlete_uuid = str(row["id"])
            if row["is_insert"]:
                new_players += 1

            # Upsert result
            cur.execute(f"""
                INSERT INTO {result_table}
                    (athlete_id, tournament_id, position, r1, r2, r3, r4,
                     total_score, to_par, rounds_played)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (athlete_id, tournament_id) DO UPDATE SET
                    position=EXCLUDED.position,
                    r1=EXCLUDED.r1, r2=EXCLUDED.r2, r3=EXCLUDED.r3, r4=EXCLUDED.r4,
                    total_score=EXCLUDED.total_score,
                    to_par=EXCLUDED.to_par,
                    rounds_played=EXCLUDED.rounds_played
                RETURNING id, (xmax = 0) AS is_insert
            """, (
                athlete_uuid, tournament_uuid,
                p["position"],
                p["r1"], p["r2"], p["r3"], p["r4"],
                p["total_score"], p["to_par"], p["rounds_played"],
            ))
            row2 = cur.fetchone()
            if row2["is_insert"]:
                new_results += 1

    return new_players, new_results


def update_scoring_averages(conn):
    """
    Recompute scoring_average, rounds_played, tournaments_played for all athletes
    from their result rows. Only count rounds where score is > 0.
    """
    for table, res_table in [
        ("mgolf_athletes", "mgolf_results"),
        ("wgolf_athletes", "wgolf_results"),
    ]:
        with conn.transaction():
            cur = conn.cursor()
            cur.execute(f"""
                UPDATE {table} a
                SET
                    rounds_played = agg.total_rounds,
                    tournaments_played = agg.total_events,
                    scoring_average = agg.avg_score
                FROM (
                    SELECT
                        r.athlete_id,
                        SUM(r.rounds_played) AS total_rounds,
                        COUNT(r.id)          AS total_events,
                        ROUND(
                            (COALESCE(SUM(r.r1),0) + COALESCE(SUM(r.r2),0)
                             + COALESCE(SUM(r.r3),0) + COALESCE(SUM(r.r4),0))::DECIMAL
                            / NULLIF(SUM(r.rounds_played), 0), 2
                        ) AS avg_score
                    FROM {res_table} r
                    WHERE r.rounds_played > 0
                    GROUP BY r.athlete_id
                ) agg
                WHERE a.id = agg.athlete_id
            """)
            print(f"  Updated scoring averages for {table}")


# ── Process One Tournament ────────────────────────────────────────────────────

def process_tournament(
    conn,
    t: dict,
    team_cache: dict[str, str],
    verbose: bool = True,
) -> bool:
    """Fetch and store one tournament. Returns True if data was found."""
    tid = t["tid"]
    gender = t.get("gender", "m")

    # Fetch player leaderboard
    url = f"{RESULTS_BASE}?pg=player&tid={tid}"
    html = fetch(url)
    if not html:
        return False

    players = parse_player_leaderboard(html, tid)
    if not players:
        return False

    # Detect num_rounds from players
    if players:
        num_rounds = max(p["rounds_played"] for p in players)
        t["num_rounds"] = num_rounds

    # Upsert tournament
    t_uuid = upsert_tournament(conn, t)

    # Write players + results
    new_p, new_r = write_tournament_players(conn, t_uuid, players, gender, team_cache)

    if verbose:
        print(f"  tid={tid} [{gender.upper()}] '{t['name'][:40]}': "
              f"{len(players)} players, {new_p} new, {new_r} new results", flush=True)
    return True


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]

    # --tid N: single tournament
    if "--tid" in args:
        idx = args.index("--tid")
        single_tid = int(args[idx + 1])
        conn = get_conn()
        try:
            t = {"tid": single_tid, "name": f"Tournament {single_tid}", "gender": "m"}
            team_cache: dict[str, str] = {}
            process_tournament(conn, t, team_cache)
            update_scoring_averages(conn)
        finally:
            conn.close()
        return

    if "--index-only" in args:
        known = get_known_tournaments()
        for t in known:
            print(f"  tid={t['tid']} [{t['gender']}] {t['name']}")
        print(f"\nTotal: {len(known)} tournaments")
        return

    max_scan = 800  # default
    if "--max-scan" in args:
        idx = args.index("--max-scan")
        max_scan = int(args[idx + 1])

    conn = get_conn()
    try:
        # ── Step 1: Known tournaments from livescoring index ──
        print("\n[1] Fetching tournament list from livescoring index ...")
        known_tournaments = get_known_tournaments()
        print(f"  Found {len(known_tournaments)} tournaments in index")
        for t in known_tournaments[:5]:
            print(f"    tid={t['tid']} [{t['gender']}] {t['name'][:50]}")

        known_tids = {t["tid"] for t in known_tournaments}
        max_known_tid = max(known_tids) if known_tids else 29479

        # ── Step 2: Scan for additional recent tournament IDs ──
        print(f"\n[2] Scanning for additional tournaments (range: "
              f"{max_known_tid - max_scan} to {max_known_tid + 50}) ...")
        scan_from = max(28000, max_known_tid - max_scan)
        scan_to   = max_known_tid + 50
        extra = scan_recent_tournament_ids(known_tids, scan_from, scan_to)

        # Build full tournament list
        all_tournaments: list[dict] = list(known_tournaments)
        extra_tids = {e["tid"] for e in extra}
        for e in extra:
            all_tournaments.append({
                "tid": e["tid"], "name": f"Tournament {e['tid']}",
                "gender": e["gender"], "host_school": None,
                "start_date": None, "end_date": None,
                "course_name": None, "location": None,
            })

        print(f"\n  Total tournaments to process: {len(all_tournaments)}")

        # ── Step 3: Process each tournament ──
        print(f"\n[3] Processing {len(all_tournaments)} tournaments ...")
        team_cache: dict[str, str] = {}
        processed = skipped = 0

        for i, t in enumerate(all_tournaments):
            ok = process_tournament(conn, t, team_cache,
                                    verbose=(i % 10 == 0 or t["tid"] in known_tids))
            if ok:
                processed += 1
            else:
                skipped += 1

        # ── Step 4: Compute scoring averages ──
        print(f"\n[4] Computing scoring averages ...")
        update_scoring_averages(conn)

        # ── Summary ──
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) AS n FROM golf_tournaments")
        nt = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) AS n FROM golf_teams")
        nteams = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) AS n FROM mgolf_athletes")
        nma = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) AS n FROM wgolf_athletes")
        nwa = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) AS n FROM mgolf_results")
        nmr = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) AS n FROM wgolf_results")
        nwr = cur.fetchone()["n"]
        cur.execute("SELECT AVG(scoring_average) AS avg FROM mgolf_athletes WHERE scoring_average IS NOT NULL")
        mavg = cur.fetchone()["avg"]
        cur.execute("SELECT AVG(scoring_average) AS avg FROM wgolf_athletes WHERE scoring_average IS NOT NULL")
        wavg = cur.fetchone()["avg"]

        print(f"\n{'='*60}")
        print(f"GOLF DONE")
        print(f"  Tournaments:     {nt} ({processed} with data, {skipped} empty/invalid)")
        print(f"  Teams:           {nteams}")
        print(f"  Men athletes:    {nma}  | Results: {nmr}")
        print(f"  Women athletes:  {nwa}  | Results: {nwr}")
        if mavg:
            print(f"  Men avg score:   {mavg:.2f}")
        if wavg:
            print(f"  Women avg score: {wavg:.2f}")
        print(f"{'='*60}")

    finally:
        conn.close()


if __name__ == "__main__":
    main()
