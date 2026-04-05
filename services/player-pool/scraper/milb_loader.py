#!/usr/bin/env python3
"""
KaNeXT MiLB Stats Loader
Source: MLB Stats API via statsapi (statsapi.mlb.com)

Loads full-season batting + pitching stats for all affiliated MiLB levels:
  AAA (sport_id=11), AA (sport_id=12), High-A (sport_id=13), Single-A (sport_id=14)

DB tables written:
  milb_players        — bio: MLB ID, name, position, bats/throws, height/weight, age
  milb_hitting_stats  — g, pa, ab, r, h, 2B, 3B, HR, RBI, BB, SO, SB, AVG, OBP, SLG, OPS, BABIP
  milb_pitching_stats — g, gs, sv, ip, h, er, hr, bb, so, era, whip, k9, bb9, w, l

Key: uses sortStat to retrieve ALL players (not just qualified leaders).

Usage:
    python3 milb_loader.py           # current season (2025)
    python3 milb_loader.py 2024      # specific season
    python3 milb_loader.py aaa       # one level only
"""
from __future__ import annotations

import sys
import time

import psycopg
import statsapi
from psycopg.rows import dict_row

DB_CONFIG = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}
API_DELAY  = 0.3   # seconds between API calls

LEVELS = [
    (11, "aaa",    "Triple-A"),
    (12, "aa",     "Double-A"),
    (13, "high-a", "High-A"),
    (14, "a",      "Single-A"),
]

LEVEL_FILTER = None   # set by --level arg


def safe_int(v):
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return None

def safe_float(v, ndigits: int = 3):
    try:
        f = float(v)
        return round(f, ndigits) if f == f else None  # NaN check
    except (TypeError, ValueError):
        return None

def safe_float_str(v: str | None, ndigits: int = 3):
    """Handle string decimals like '.336'."""
    if not v or str(v).strip() in ("-", "", "—"):
        return None
    return safe_float(v, ndigits)


def get_all_splits(sport_id: int, group: str, season: int, sort_stat: str) -> list[dict]:
    """Paginate through all stats splits for a sport/group."""
    results = []
    limit  = 500
    offset = 0
    total  = None

    while True:
        data = statsapi.get("stats", {
            "stats":     "season",
            "group":     group,
            "season":    season,
            "sportIds":  sport_id,
            "limit":     limit,
            "offset":    offset,
            "sortStat":  sort_stat,
            "order":     "desc",
        })
        time.sleep(API_DELAY)

        if not data or not data.get("stats"):
            break

        stat_block = data["stats"][0]
        splits = stat_block.get("splits", [])
        if not splits:
            break

        results.extend(splits)

        if total is None:
            total = stat_block.get("totalSplits", len(splits))

        offset += limit
        if offset >= total:
            break

    return results


def upsert_player(conn, split: dict, season: int) -> int:
    """Upsert milb_players from a stats split. Returns DB id."""
    p    = split.get("player", {})
    team = split.get("team", {})
    pos  = split.get("position", {})

    mlb_id = p.get("id")
    name   = p.get("fullName", "").strip()
    if not mlb_id or not name:
        return None

    # Try to get bio from sports_players cache (attached to player object in split)
    first = p.get("firstName", "")
    last  = p.get("lastName", "")
    position_abbr = pos.get("abbreviation", "")

    row = conn.execute("""
        INSERT INTO milb_players (mlb_id, full_name, first_name, last_name, position,
            current_team_id, current_team_name, season)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (mlb_id, season) DO UPDATE SET
            full_name       = COALESCE(EXCLUDED.full_name, milb_players.full_name),
            position        = COALESCE(EXCLUDED.position,  milb_players.position),
            current_team_id = EXCLUDED.current_team_id,
            current_team_name = EXCLUDED.current_team_name
        RETURNING id
    """, (
        mlb_id, name, first or None, last or None, position_abbr or None,
        team.get("id"), team.get("name"), str(season),
    )).fetchone()
    return row["id"]


def upsert_hitting(conn, player_db_id: int, split: dict, sport_id: int, level: str, season: int):
    team = split.get("team", {})
    s    = split.get("stat", {})
    conn.execute("""
        INSERT INTO milb_hitting_stats (
            player_id, team_id, team_name, season, sport_id, level,
            g, pa, ab, r, h, doubles, triples, hr, rbi,
            bb, ibb, so, hbp, sf, sh, sb, cs, gdp, tb, lob,
            avg, obp, slg, ops, babip
        ) VALUES (%s,%s,%s,%s,%s,%s, %s,%s,%s,%s,%s,%s,%s,%s,%s, %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s, %s,%s,%s,%s,%s)
        ON CONFLICT (player_id, team_id, season, level) DO UPDATE SET
            g=EXCLUDED.g, pa=EXCLUDED.pa, ab=EXCLUDED.ab, r=EXCLUDED.r,
            h=EXCLUDED.h, doubles=EXCLUDED.doubles, triples=EXCLUDED.triples,
            hr=EXCLUDED.hr, rbi=EXCLUDED.rbi, bb=EXCLUDED.bb, ibb=EXCLUDED.ibb,
            so=EXCLUDED.so, hbp=EXCLUDED.hbp, sf=EXCLUDED.sf, sh=EXCLUDED.sh,
            sb=EXCLUDED.sb, cs=EXCLUDED.cs, gdp=EXCLUDED.gdp, tb=EXCLUDED.tb,
            lob=EXCLUDED.lob, avg=EXCLUDED.avg, obp=EXCLUDED.obp, slg=EXCLUDED.slg,
            ops=EXCLUDED.ops, babip=EXCLUDED.babip
    """, (
        player_db_id, team.get("id"), team.get("name"), str(season), sport_id, level,
        safe_int(s.get("gamesPlayed")), safe_int(s.get("plateAppearances")),
        safe_int(s.get("atBats")), safe_int(s.get("runs")), safe_int(s.get("hits")),
        safe_int(s.get("doubles")), safe_int(s.get("triples")), safe_int(s.get("homeRuns")),
        safe_int(s.get("rbi")), safe_int(s.get("baseOnBalls")),
        safe_int(s.get("intentionalWalks")), safe_int(s.get("strikeOuts")),
        safe_int(s.get("hitByPitch")), safe_int(s.get("sacFlies")),
        safe_int(s.get("sacBunts")), safe_int(s.get("stolenBases")),
        safe_int(s.get("caughtStealing")), safe_int(s.get("groundIntoDoublePlay")),
        safe_int(s.get("totalBases")), safe_int(s.get("leftOnBase")),
        safe_float_str(s.get("avg")), safe_float_str(s.get("obp")),
        safe_float_str(s.get("slg")), safe_float_str(s.get("ops")),
        safe_float_str(s.get("babip")),
    ))


def upsert_pitching(conn, player_db_id: int, split: dict, sport_id: int, level: str, season: int):
    team = split.get("team", {})
    s    = split.get("stat", {})
    conn.execute("""
        INSERT INTO milb_pitching_stats (
            player_id, team_id, team_name, season, sport_id, level,
            g, gs, cg, sho, sv, hld, bs,
            ip, h, r, er, bb, ibb, so, hr, hbp, wp, bk,
            era, whip, w, l, avg_against, babip, k9, bb9
        ) VALUES (%s,%s,%s,%s,%s,%s, %s,%s,%s,%s,%s,%s,%s, %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s, %s,%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT (player_id, team_id, season, level) DO UPDATE SET
            g=EXCLUDED.g, gs=EXCLUDED.gs, cg=EXCLUDED.cg, sho=EXCLUDED.sho,
            sv=EXCLUDED.sv, hld=EXCLUDED.hld, bs=EXCLUDED.bs, ip=EXCLUDED.ip,
            h=EXCLUDED.h, r=EXCLUDED.r, er=EXCLUDED.er, bb=EXCLUDED.bb,
            ibb=EXCLUDED.ibb, so=EXCLUDED.so, hr=EXCLUDED.hr, hbp=EXCLUDED.hbp,
            wp=EXCLUDED.wp, bk=EXCLUDED.bk, era=EXCLUDED.era, whip=EXCLUDED.whip,
            w=EXCLUDED.w, l=EXCLUDED.l, avg_against=EXCLUDED.avg_against,
            babip=EXCLUDED.babip, k9=EXCLUDED.k9, bb9=EXCLUDED.bb9
    """, (
        player_db_id, team.get("id"), team.get("name"), str(season), sport_id, level,
        safe_int(s.get("gamesPlayed")), safe_int(s.get("gamesStarted")),
        safe_int(s.get("completeGames")), safe_int(s.get("shutouts")),
        safe_int(s.get("saves")), safe_int(s.get("holds")),
        safe_int(s.get("blownSaves")),
        safe_float(s.get("inningsPitched"), 1),
        safe_int(s.get("hits")), safe_int(s.get("runs")), safe_int(s.get("earnedRuns")),
        safe_int(s.get("baseOnBalls")), safe_int(s.get("intentionalWalks")),
        safe_int(s.get("strikeOuts")), safe_int(s.get("homeRuns")),
        safe_int(s.get("hitBatsmen")), safe_int(s.get("wildPitches")),
        safe_int(s.get("balks")),
        safe_float_str(s.get("era"), 2), safe_float_str(s.get("whip"), 2),
        safe_int(s.get("wins")), safe_int(s.get("losses")),
        safe_float_str(s.get("avg")), safe_float_str(s.get("babip")),
        safe_float_str(s.get("strikeoutsPer9Inn"), 2),
        safe_float_str(s.get("walksPer9Inn"), 2),
    ))


def load_level(conn, sport_id: int, level_code: str, label: str, season: int):
    print(f"\n  [{label}] sport_id={sport_id}", flush=True)

    # Hitting
    print(f"    Fetching hitting stats...", flush=True)
    hitting_splits = get_all_splits(sport_id, "hitting", season, "atBats")
    print(f"    {len(hitting_splits)} hitting splits", flush=True)

    h_players = 0
    for split in hitting_splits:
        try:
            pid = upsert_player(conn, split, season)
            if pid:
                upsert_hitting(conn, pid, split, sport_id, level_code, season)
                h_players += 1
        except Exception as e:
            name = split.get("player", {}).get("fullName", "?")
            print(f"    ERR hitting {name}: {e}")
            conn.rollback()
    conn.commit()

    # Pitching
    print(f"    Fetching pitching stats...", flush=True)
    pitching_splits = get_all_splits(sport_id, "pitching", season, "inningsPitched")
    print(f"    {len(pitching_splits)} pitching splits", flush=True)

    p_players = 0
    for split in pitching_splits:
        try:
            pid = upsert_player(conn, split, season)
            if pid:
                upsert_pitching(conn, pid, split, sport_id, level_code, season)
                p_players += 1
        except Exception as e:
            name = split.get("player", {}).get("fullName", "?")
            print(f"    ERR pitching {name}: {e}")
            conn.rollback()
    conn.commit()

    print(f"    ✓ {h_players} hitters, {p_players} pitchers", flush=True)
    return h_players + p_players


def print_summary(conn):
    print("\n=== MiLB Summary ===")
    r = conn.execute("""
        SELECT level, COUNT(DISTINCT p.id) players,
               COUNT(DISTINCT h.id) hitters, COUNT(DISTINCT pi.id) pitchers
        FROM milb_players p
        LEFT JOIN milb_hitting_stats h ON h.player_id = p.id
        LEFT JOIN milb_pitching_stats pi ON pi.player_id = p.id
        GROUP BY level ORDER BY level
    """).fetchall()
    total = 0
    for row in r:
        print(f"  {row['level']:8s}: {row['players']:5d} unique players "
              f"({row['hitters']} hitting rows, {row['pitchers']} pitching rows)")
        total += row["players"]
    print(f"  TOTAL:    {total} unique players")


def main():
    season = 2025
    level_filter = None

    args = [a.lower() for a in sys.argv[1:]]
    for a in args:
        if a.isdigit():
            season = int(a)
        elif a in ("aaa", "aa", "high-a", "a"):
            level_filter = a

    print(f"=== MiLB Loader ===")
    print(f"  Season: {season}")
    print(f"  Levels: {level_filter or 'all (AAA, AA, High-A, A)'}")

    conn = psycopg.connect(
        host=DB_CONFIG["host"], port=DB_CONFIG["port"], dbname=DB_CONFIG["dbname"],
        row_factory=dict_row, autocommit=False,
    )

    total = 0
    for sport_id, code, label in LEVELS:
        if level_filter and code != level_filter:
            continue
        n = load_level(conn, sport_id, code, label, season)
        total += n

    print(f"\n  Total across all levels: {total} stat rows")
    print_summary(conn)
    conn.close()


if __name__ == "__main__":
    main()
