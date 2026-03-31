"""
WNBA Pro Player Pool Scraper — 2025 Season
Source: ESPN core API (sports.core.api.espn.com)
Loads: prownba_teams, prownba_players, prownba_player_stats

Usage:
    python3 wnba_scraper.py             # load all
    python3 wnba_scraper.py teams       # teams only
    python3 wnba_scraper.py players     # teams + players (no stats)
    python3 wnba_scraper.py stats       # stats only (players must exist)
"""
from __future__ import annotations

import sys
import time
import math
from typing import Optional

import httpx
import psycopg
from psycopg.rows import dict_row

DB_CONFIG = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}
SEASON = 2025
API_DELAY = 0.25  # seconds between ESPN calls

ESPN_SITE   = "https://site.api.espn.com/apis/site/v2/sports/basketball/wnba"
ESPN_CORE   = "https://sports.core.api.espn.com/v2/sports/basketball/leagues/wnba"


# ── Helpers ──────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)


def api_get(url: str) -> Optional[dict]:
    try:
        r = httpx.get(url, timeout=15)
        time.sleep(API_DELAY)
        if r.status_code == 200:
            return r.json()
    except Exception as e:
        print(f"    [warn] {url}: {e}")
    return None


def safe_int(val) -> Optional[int]:
    try:
        if val is None or (isinstance(val, float) and math.isnan(val)):
            return None
        return int(float(str(val).replace("%", "")))
    except (ValueError, TypeError):
        return None


def safe_float(val) -> Optional[float]:
    try:
        if val is None:
            return None
        return round(float(str(val).replace("%", "")), 2)
    except (ValueError, TypeError):
        return None


def height_to_inches(h: Optional[float]) -> Optional[int]:
    """ESPN height field is already in inches (float)."""
    if h is None:
        return None
    return int(h)


# ── Step 1: Teams ─────────────────────────────────────────────────────────────

def load_teams(conn) -> dict[str, str]:
    """Fetch WNBA teams from ESPN, upsert. Returns {espn_team_id: uuid}."""
    data = api_get(f"{ESPN_SITE}/teams")
    if not data:
        print("  [error] Could not fetch WNBA teams")
        return {}

    sports = data.get("sports", [{}])
    teams_raw = sports[0].get("leagues", [{}])[0].get("teams", [])
    team_uuid: dict[str, str] = {}

    with conn.transaction():
        cur = conn.cursor()
        for t in teams_raw:
            team = t["team"]
            espn_id = str(team["id"])
            name = team.get("displayName", "")
            abbr = team.get("abbreviation", "")
            location = team.get("location", "")

            cur.execute("""
                INSERT INTO prownba_teams (espn_team_id, name, abbreviation, location)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (espn_team_id) DO UPDATE SET
                    name=EXCLUDED.name, abbreviation=EXCLUDED.abbreviation,
                    location=EXCLUDED.location
                RETURNING id
            """, (espn_id, name, abbr, location))
            row = cur.fetchone()
            team_uuid[espn_id] = str(row["id"])

    print(f"  Teams: {len(team_uuid)} upserted")
    return team_uuid


# ── Step 2: Players ───────────────────────────────────────────────────────────

def load_players(conn, team_uuid: dict[str, str]) -> dict[str, str]:
    """Fetch rosters for all WNBA teams, upsert players. Returns {espn_player_id: uuid}."""
    player_uuid: dict[str, str] = {}
    inserted = updated = 0

    for espn_tid, tid_uuid in team_uuid.items():
        data = api_get(f"{ESPN_SITE}/teams/{espn_tid}/roster")
        if not data:
            continue
        athletes = data.get("athletes", [])
        print(f"  Team {espn_tid}: {len(athletes)} athletes")

        with conn.transaction():
            cur = conn.cursor()
            for a in athletes:
                espn_pid = str(a.get("id", ""))
                name = a.get("fullName", "").strip()
                if not espn_pid or not name:
                    continue

                pos_data = a.get("position", {})
                pos = pos_data.get("abbreviation") if isinstance(pos_data, dict) else None
                ht = height_to_inches(a.get("height"))
                wt = safe_int(a.get("weight"))
                age = safe_int(a.get("age"))
                jersey = a.get("jersey") or None

                cur.execute("""
                    INSERT INTO prownba_players
                        (espn_player_id, full_name, position, height_inches, weight_lbs,
                         age, jersey_number, team_id, season)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (espn_player_id) DO UPDATE SET
                        full_name=EXCLUDED.full_name,
                        position=EXCLUDED.position,
                        height_inches=EXCLUDED.height_inches,
                        weight_lbs=EXCLUDED.weight_lbs,
                        age=EXCLUDED.age,
                        jersey_number=EXCLUDED.jersey_number,
                        team_id=EXCLUDED.team_id,
                        season=EXCLUDED.season,
                        updated_at=now()
                    RETURNING id, (xmax = 0) AS is_insert
                """, (espn_pid, name, pos, ht, wt, age, jersey, tid_uuid, SEASON))
                r2 = cur.fetchone()
                player_uuid[espn_pid] = str(r2["id"])
                if r2["is_insert"]: inserted += 1
                else: updated += 1

    print(f"  Players: {inserted} inserted, {updated} updated ({len(player_uuid)} total)")
    return player_uuid


# ── Step 3: Stats ─────────────────────────────────────────────────────────────

def load_stats(conn, player_uuid: dict[str, str]):
    """
    Pull per-player stats via ESPN core leaders API.
    Strategy: collect stat values per athlete_id across all 15 categories,
    then upsert one row per player.
    """
    leaders_url = (
        f"{ESPN_CORE}/seasons/{SEASON}/types/2/leaders"
    )
    data = api_get(leaders_url)
    if not data:
        print("  [error] Could not fetch WNBA leaders")
        return

    cats = data.get("categories", [])
    print(f"  Leader categories: {len(cats)}")

    # Map ESPN category names → our DB columns
    CAT_MAP = {
        "pointsPerGame":        "ppg",
        "assistsPerGame":       "apg",
        "reboundsPerGame":      "rpg",
        "stealsPerGame":        "spg",
        "blocksPerGame":        "bpg",
        "minutesPerGame":       "mpg",
        "fieldGoalPercentage":  "fg_pct",
        "3PointPct":            "three_pct",
        "FreeThrowPct":         "ft_pct",
    }

    # Collect per-player data: {espn_pid: {col: val}}
    player_data: dict[str, dict] = {}

    for cat in cats:
        cat_name = cat.get("name", "")
        col = CAT_MAP.get(cat_name)
        if not col:
            continue
        leaders = cat.get("leaders", [])
        for leader in leaders:
            ath_ref = leader.get("athlete", {}).get("$ref", "")
            # Extract athlete ID from ref URL
            # e.g. .../seasons/2025/athletes/3149391?...
            espn_pid = None
            if "/athletes/" in ath_ref:
                espn_pid = ath_ref.split("/athletes/")[-1].split("?")[0]
            if not espn_pid:
                continue
            val = safe_float(leader.get("value"))
            if espn_pid not in player_data:
                player_data[espn_pid] = {}
            player_data[espn_pid][col] = val

    print(f"  Players with leader data: {len(player_data)}")

    # For players in leader data, also fetch full stats to get games, doubles, etc.
    # Limit to players we have in DB
    known_pids = set(player_uuid.keys())
    detailed_pids = [p for p in player_data if p in known_pids]
    print(f"  Fetching detailed stats for {len(detailed_pids)} players ...", flush=True)

    stats_url_tpl = f"{ESPN_CORE}/seasons/{SEASON}/types/2/athletes/{{pid}}/statistics/0"
    for espn_pid in detailed_pids:
        data2 = api_get(stats_url_tpl.format(pid=espn_pid))
        if not data2:
            continue
        pd_entry = player_data.setdefault(espn_pid, {})
        cats2 = data2.get("splits", {}).get("categories", [])
        for c in cats2:
            stats = {s["name"]: s.get("displayValue") for s in c.get("stats", [])}
            if c["name"] == "general":
                pd_entry["gp"] = safe_int(stats.get("gamesPlayed"))
                pd_entry["gs"] = safe_int(stats.get("gamesStarted"))
                pd_entry["mpg"] = safe_float(stats.get("avgMinutes"))
                pd_entry["rpg"] = safe_float(stats.get("avgRebounds"))
                pd_entry["orpg"] = safe_float(stats.get("avgOffensiveRebounds") or stats.get("avgDefensiveRebounds"))
                pd_entry["double_doubles"] = safe_int(stats.get("doubleDouble"))
                pd_entry["triple_doubles"] = safe_int(stats.get("tripleDouble"))
                pd_entry["plus_minus"] = safe_int(str(stats.get("plusMinus") or "0").replace("+", ""))
            elif c["name"] == "offensive":
                pd_entry["ppg"] = safe_float(stats.get("avgPoints"))
                pd_entry["apg"] = safe_float(stats.get("avgAssists"))
                pd_entry["fg_pct"] = safe_float(stats.get("fieldGoalPct"))
                pd_entry["three_pct"] = safe_float(stats.get("threePointPct"))
                pd_entry["ft_pct"] = safe_float(stats.get("freeThrowPct"))
                pd_entry["fg_made"] = safe_float(stats.get("avgFieldGoalsMade"))
                pd_entry["fg_att"] = safe_float(stats.get("avgFieldGoalsAttempted"))
                pd_entry["three_made"] = safe_float(stats.get("avgThreePointFieldGoalsMade"))
                pd_entry["three_att"] = safe_float(stats.get("avgThreePointFieldGoalsAttempted"))
                pd_entry["to_pg"] = safe_float(stats.get("avgTurnovers"))
                # For offensive rebounds from general
                pd_entry["orpg"] = safe_float(stats.get("avgOffensiveRebounds"))
            elif c["name"] == "defensive":
                pd_entry["spg"] = safe_float(stats.get("avgSteals"))
                pd_entry["bpg"] = safe_float(stats.get("avgBlocks"))
                pd_entry["drpg"] = safe_float(stats.get("avgDefensiveRebounds"))

    # Write to DB
    inserted = updated = skipped = 0
    with conn.transaction():
        cur = conn.cursor()
        for espn_pid, pd_entry in player_data.items():
            if espn_pid not in player_uuid:
                skipped += 1
                continue
            pid = player_uuid[espn_pid]
            cur.execute("""
                INSERT INTO prownba_player_stats (
                    player_id, season,
                    gp, gs, mpg, ppg, rpg, apg, spg, bpg, to_pg,
                    fg_pct, three_pct, ft_pct,
                    fg_made, fg_att, three_made, three_att,
                    orpg, drpg, plus_minus, double_doubles, triple_doubles
                ) VALUES (
                    %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
                )
                ON CONFLICT (player_id, season) DO UPDATE SET
                    gp=COALESCE(EXCLUDED.gp, prownba_player_stats.gp),
                    gs=COALESCE(EXCLUDED.gs, prownba_player_stats.gs),
                    mpg=COALESCE(EXCLUDED.mpg, prownba_player_stats.mpg),
                    ppg=COALESCE(EXCLUDED.ppg, prownba_player_stats.ppg),
                    rpg=COALESCE(EXCLUDED.rpg, prownba_player_stats.rpg),
                    apg=COALESCE(EXCLUDED.apg, prownba_player_stats.apg),
                    spg=COALESCE(EXCLUDED.spg, prownba_player_stats.spg),
                    bpg=COALESCE(EXCLUDED.bpg, prownba_player_stats.bpg),
                    to_pg=COALESCE(EXCLUDED.to_pg, prownba_player_stats.to_pg),
                    fg_pct=COALESCE(EXCLUDED.fg_pct, prownba_player_stats.fg_pct),
                    three_pct=COALESCE(EXCLUDED.three_pct, prownba_player_stats.three_pct),
                    ft_pct=COALESCE(EXCLUDED.ft_pct, prownba_player_stats.ft_pct),
                    fg_made=COALESCE(EXCLUDED.fg_made, prownba_player_stats.fg_made),
                    fg_att=COALESCE(EXCLUDED.fg_att, prownba_player_stats.fg_att),
                    three_made=COALESCE(EXCLUDED.three_made, prownba_player_stats.three_made),
                    three_att=COALESCE(EXCLUDED.three_att, prownba_player_stats.three_att),
                    orpg=COALESCE(EXCLUDED.orpg, prownba_player_stats.orpg),
                    drpg=COALESCE(EXCLUDED.drpg, prownba_player_stats.drpg),
                    plus_minus=COALESCE(EXCLUDED.plus_minus, prownba_player_stats.plus_minus),
                    double_doubles=COALESCE(EXCLUDED.double_doubles, prownba_player_stats.double_doubles),
                    triple_doubles=COALESCE(EXCLUDED.triple_doubles, prownba_player_stats.triple_doubles)
                RETURNING id, (xmax = 0) AS is_insert
            """, (
                pid, SEASON,
                pd_entry.get("gp"), pd_entry.get("gs"), pd_entry.get("mpg"),
                pd_entry.get("ppg"), pd_entry.get("rpg"), pd_entry.get("apg"),
                pd_entry.get("spg"), pd_entry.get("bpg"), pd_entry.get("to_pg"),
                pd_entry.get("fg_pct"), pd_entry.get("three_pct"), pd_entry.get("ft_pct"),
                pd_entry.get("fg_made"), pd_entry.get("fg_att"),
                pd_entry.get("three_made"), pd_entry.get("three_att"),
                pd_entry.get("orpg"), pd_entry.get("drpg"),
                pd_entry.get("plus_minus"),
                pd_entry.get("double_doubles"), pd_entry.get("triple_doubles"),
            ))
            r2 = cur.fetchone()
            if r2["is_insert"]: inserted += 1
            else: updated += 1

    print(f"  Stats: {inserted} inserted, {updated} updated, {skipped} skipped")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"
    conn = get_conn()
    try:
        if mode in ("all", "teams", "players"):
            print("\n[1/3] Loading WNBA teams ...")
            team_uuid = load_teams(conn)
        else:
            cur = conn.cursor()
            cur.execute("SELECT espn_team_id, id FROM prownba_teams")
            team_uuid = {r["espn_team_id"]: str(r["id"]) for r in cur.fetchall()}

        if mode in ("all", "players"):
            print("\n[2/3] Loading WNBA players ...")
            player_uuid = load_players(conn, team_uuid)
        else:
            cur = conn.cursor()
            cur.execute("SELECT espn_player_id, id FROM prownba_players WHERE season=%s", (SEASON,))
            player_uuid = {r["espn_player_id"]: str(r["id"]) for r in cur.fetchall()}

        if mode in ("all", "stats"):
            print("\n[3/3] Loading WNBA stats ...")
            load_stats(conn, player_uuid)

        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) AS n FROM prownba_teams")
        nt = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) AS n FROM prownba_players")
        np_ = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) AS n FROM prownba_player_stats")
        ns = cur.fetchone()["n"]
        print(f"\n=== WNBA done: {nt} teams, {np_} players, {ns} stat rows ===")

    finally:
        conn.close()


if __name__ == "__main__":
    main()
