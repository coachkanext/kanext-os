#!/usr/bin/env python3
"""
KaNeXT USCHO College Hockey Scraper
Source: uscho.com (Inertia.js partial-reload — returns clean JSON with X-Inertia header)

Pulls current-season skater + goalie stats for:
  - NCAA D1 Men    (~62 teams, ~1,700 skaters, ~83 goalies)
  - NCAA D1 Women  (~42 teams)
  - NCAA D2/D3 Men (~200+ teams)
  - NCAA D3 Women

DB tables:
  uscho_teams        — schools
  uscho_players      — bio (name, pos, year)
  uscho_skater_stats — per-season skater stats
  uscho_goalie_stats — per-season goalie stats

Usage:
    python3 uscho_scraper.py
"""
from __future__ import annotations

import time
from typing import Optional

import httpx
import psycopg
from psycopg.rows import dict_row

DB_CONFIG = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}

BASE_URL = "https://www.uscho.com"
INERTIA_HEADERS = {
    "X-Inertia": "true",
    "X-Inertia-Version": "",
    "Accept": "application/json, text/plain, */*",
    "X-Requested-With": "XMLHttpRequest",
    "User-Agent": "Mozilla/5.0 (compatible; KaNeXT/1.0)",
}

# (path, label) — order matters for FK inserts (teams before players)
DIVISIONS = [
    ("/stats/overall/division-i-men",   "D1 Men"),
    ("/stats/overall/division-i-women", "D1 Women"),
    ("/stats/overall/division-iii-men", "D2/D3 Men"),
    ("/stats/overall/division-iii-women", "D3 Women"),
]

DDL = """
CREATE TABLE IF NOT EXISTS uscho_teams (
    school_id   INT  NOT NULL,
    gender      TEXT NOT NULL,
    code        TEXT,
    shortname   TEXT NOT NULL,
    conf_code   TEXT,
    division    TEXT,
    PRIMARY KEY (school_id, gender)
);

CREATE TABLE IF NOT EXISTS uscho_players (
    player_id   INT  PRIMARY KEY,
    first       TEXT,
    last        TEXT,
    full_name   TEXT,
    pos         TEXT,
    yr          TEXT,
    school_id   INT  REFERENCES uscho_teams(school_id),
    gender      TEXT,
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS uscho_skater_stats (
    id          SERIAL PRIMARY KEY,
    player_id   INT  NOT NULL REFERENCES uscho_players(player_id),
    season      TEXT NOT NULL,
    gp          INT,
    g           INT,
    a           INT,
    pts         INT,
    ppg         INT,
    shg         INT,
    gwg         INT,
    eng         INT,
    shots       INT,
    shots_net   INT,
    pim         INT,
    plus_minus  INT,
    division    TEXT,
    UNIQUE (player_id, season)
);

CREATE TABLE IF NOT EXISTS uscho_goalie_stats (
    id          SERIAL PRIMARY KEY,
    player_id   INT  NOT NULL REFERENCES uscho_players(player_id),
    season      TEXT NOT NULL,
    gp          INT,
    w           INT,
    l           INT,
    t           INT,
    gaa         FLOAT,
    save_pct    FLOAT,
    shutouts    INT,
    goals_against INT,
    saves       INT,
    min_played  TEXT,
    division    TEXT,
    UNIQUE (player_id, season)
);
"""


def get_conn():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)


def safe_int(val) -> Optional[int]:
    try:
        return int(val)
    except (TypeError, ValueError):
        return None


def safe_float(val) -> Optional[float]:
    try:
        return float(val)
    except (TypeError, ValueError):
        return None


def fetch_stats(path: str, client: httpx.Client) -> dict:
    url = f"{BASE_URL}{path}"
    resp = client.get(url, headers=INERTIA_HEADERS, follow_redirects=True)
    resp.raise_for_status()
    return resp.json()


def process_division(path: str, label: str, conn, client: httpx.Client) -> dict:
    print(f"\n{'─'*50}")
    print(f"Fetching {label} — {path}", flush=True)

    data = fetch_stats(path, client)
    content = data["props"]["content"]
    season = content["params"]["season"]        # e.g. "20252026"
    full_season = content["params"]["full_season"]  # e.g. "2025-2026"
    div_data = content["data"]
    print(f"  Season: {full_season}")

    skaters   = div_data.get("scoring", {}).get("data", [])
    goalies   = div_data.get("goaltending", {}).get("data", [])
    teams_raw = div_data.get("teams", {}).get("data", [])

    print(f"  Skaters: {len(skaters)}, Goalies: {len(goalies)}, Teams: {len(teams_raw)}")

    cur = conn.cursor()

    # ── Teams ────────────────────────────────────────────────────────────────
    teams_inserted = 0
    for t in teams_raw:
        sid = t.get("school_id")
        if not sid:
            continue
        gender = t.get("gender") or content["params"]["gender"]
        cur.execute("""
            INSERT INTO uscho_teams (school_id, gender, code, shortname, conf_code, division)
            VALUES (%s,%s,%s,%s,%s,%s)
            ON CONFLICT (school_id, gender) DO UPDATE SET
              shortname=EXCLUDED.shortname, conf_code=EXCLUDED.conf_code,
              division=EXCLUDED.division
        """, (
            sid,
            gender,
            t.get("code"),
            t.get("shortname", ""),
            t.get("conf_code"),
            t.get("division"),
        ))
        teams_inserted += 1

    # ── Players + Skater Stats ───────────────────────────────────────────────
    skaters_upserted = 0
    for p in skaters:
        pid = p.get("player_id")
        if not pid:
            continue
        full_name = f"{p.get('first','').strip()} {p.get('last','').strip()}".strip()

        # Ensure player row
        cur.execute("""
            INSERT INTO uscho_players (player_id, first, last, full_name, pos, yr, school_id, gender)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (player_id) DO UPDATE SET
              pos=EXCLUDED.pos, yr=EXCLUDED.yr,
              school_id=EXCLUDED.school_id, updated_at=now()
        """, (
            pid, p.get("first"), p.get("last"), full_name,
            p.get("pos"), p.get("yr"), p.get("school_id"), p.get("gender"),
        ))

        cur.execute("""
            INSERT INTO uscho_skater_stats
              (player_id, season, gp, g, a, pts, ppg, shg, gwg, eng,
               shots, shots_net, pim, plus_minus, division)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (player_id, season) DO UPDATE SET
              gp=EXCLUDED.gp, g=EXCLUDED.g, a=EXCLUDED.a, pts=EXCLUDED.pts,
              ppg=EXCLUDED.ppg, shg=EXCLUDED.shg, gwg=EXCLUDED.gwg
        """, (
            pid, season,
            safe_int(p.get("gp")), safe_int(p.get("g")), safe_int(p.get("a")),
            safe_int(p.get("pts")), safe_int(p.get("ppg")), safe_int(p.get("shg")),
            safe_int(p.get("gwg")), safe_int(p.get("eng")),
            safe_int(p.get("shots")), safe_int(p.get("shotsNet")),
            safe_int(p.get("pim")), safe_int(p.get("plsmns")),
            p.get("division"),
        ))
        skaters_upserted += 1

    # ── Players + Goalie Stats ───────────────────────────────────────────────
    goalies_upserted = 0
    for g in goalies:
        pid = g.get("player_id")
        if not pid:
            continue
        full_name = f"{g.get('first','').strip()} {g.get('last','').strip()}".strip()

        cur.execute("""
            INSERT INTO uscho_players (player_id, first, last, full_name, pos, yr, school_id, gender)
            VALUES (%s,%s,%s,%s,'G',%s,%s,%s)
            ON CONFLICT (player_id) DO UPDATE SET
              pos='G', yr=EXCLUDED.yr,
              school_id=EXCLUDED.school_id, updated_at=now()
        """, (
            pid, g.get("first"), g.get("last"), full_name,
            g.get("yr"), g.get("school_id"), g.get("gender"),
        ))

        cur.execute("""
            INSERT INTO uscho_goalie_stats
              (player_id, season, gp, w, l, t, gaa, save_pct, shutouts,
               goals_against, saves, min_played, division)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (player_id, season) DO UPDATE SET
              gp=EXCLUDED.gp, w=EXCLUDED.w, l=EXCLUDED.l,
              gaa=EXCLUDED.gaa, save_pct=EXCLUDED.save_pct, shutouts=EXCLUDED.shutouts
        """, (
            pid, season,
            safe_int(g.get("gp")), safe_int(g.get("w")), safe_int(g.get("l")),
            safe_int(g.get("t")),
            safe_float(g.get("gaa")), safe_float(g.get("svp")),
            safe_int(g.get("sho")), safe_int(g.get("ga")),
            safe_int(g.get("saves")), g.get("min"),
            g.get("division"),
        ))
        goalies_upserted += 1

    conn.commit()
    return {
        "label": label,
        "season": full_season,
        "teams": teams_inserted,
        "skaters": skaters_upserted,
        "goalies": goalies_upserted,
    }


def main():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(DDL)
    conn.commit()
    print("Tables ready.")

    totals = {"teams": 0, "skaters": 0, "goalies": 0}

    with httpx.Client(timeout=30) as client:
        for path, label in DIVISIONS:
            try:
                result = process_division(path, label, conn, client)
                totals["teams"]   += result["teams"]
                totals["skaters"] += result["skaters"]
                totals["goalies"] += result["goalies"]
                time.sleep(0.5)
            except Exception as e:
                print(f"  [error] {label}: {e}")
                import traceback; traceback.print_exc()

    # Summary
    cur.execute("SELECT COUNT(*) n FROM uscho_teams");  t_n = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) n FROM uscho_players"); p_n = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) n FROM uscho_skater_stats"); sk_n = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) n FROM uscho_goalie_stats"); go_n = cur.fetchone()["n"]
    cur.execute("""
        SELECT s.division, p.gender, COUNT(DISTINCT p.player_id) n
        FROM uscho_skater_stats s
        JOIN uscho_players p ON p.player_id = s.player_id
        GROUP BY s.division, p.gender ORDER BY s.division, p.gender
    """)
    breakdown = cur.fetchall()

    print(f"\n{'='*50}")
    print("USCHO DONE")
    print(f"  Teams:         {t_n}")
    print(f"  Players:       {p_n}")
    print(f"  Skater stats:  {sk_n}")
    print(f"  Goalie stats:  {go_n}")
    print(f"\nBreakdown by division/gender:")
    for row in breakdown:
        print(f"  D{row['division']} {row['gender']}: {row['n']}")
    print(f"{'='*50}")

    conn.close()


if __name__ == "__main__":
    main()
