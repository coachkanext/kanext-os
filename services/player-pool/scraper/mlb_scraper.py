"""
MLB Pro Player Pool Scraper — 2024 Season
Source: pybaseball (FanGraphs leaderboards)
Loads: promlb_teams, promlb_players, promlb_batting_stats, promlb_pitching_stats

Usage:
    python3 mlb_scraper.py              # load all
    python3 mlb_scraper.py batting      # batting only
    python3 mlb_scraper.py pitching     # pitching only
"""
from __future__ import annotations

import sys
import math
import warnings
from typing import Optional

import psycopg
from psycopg.rows import dict_row
import pybaseball as pb

# Suppress pybaseball's FutureWarning noise
warnings.filterwarnings("ignore", category=FutureWarning)

DB_CONFIG = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}
SEASON = 2024
# qual=1 → include anyone with at least 1 PA/IP appearance
BATTING_QUAL = 1
PITCHING_QUAL = 0.1


# ── Helpers ──────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)


def safe_int(val) -> Optional[int]:
    try:
        if val is None or (isinstance(val, float) and math.isnan(val)):
            return None
        return int(float(val))
    except (ValueError, TypeError):
        return None


def safe_float(val, decimals: int = 3) -> Optional[float]:
    try:
        if val is None or (isinstance(val, float) and math.isnan(val)):
            return None
        return round(float(val), decimals)
    except (ValueError, TypeError):
        return None


# ── MLB Team abbreviation normalisation ──────────────────────────────────────

# FanGraphs uses slightly different abbreviations than standard
FG_TEAM_ABBR_MAP = {
    "LAA": "LAA", "HOU": "HOU", "OAK": "OAK", "TOR": "TOR", "ATL": "ATL",
    "MIL": "MIL", "STL": "STL", "CHC": "CHC", "ARI": "ARI", "LAD": "LAD",
    "SF":  "SFG", "CLE": "CLE", "SEA": "SEA", "MIA": "MIA", "NYM": "NYM",
    "WSN": "WSH", "WSH": "WSH", "BAL": "BAL", "SD":  "SDP", "PHI": "PHI",
    "PIT": "PIT", "TEX": "TEX", "TB":  "TBR", "BOS": "BOS", "CIN": "CIN",
    "COL": "COL", "KC":  "KCR", "DET": "DET", "MIN": "MIN", "CWS": "CWS",
    "NYY": "NYY",
}

TEAM_FULLNAMES = {
    "LAA": "Los Angeles Angels",        "HOU": "Houston Astros",
    "OAK": "Oakland Athletics",         "TOR": "Toronto Blue Jays",
    "ATL": "Atlanta Braves",            "MIL": "Milwaukee Brewers",
    "STL": "St. Louis Cardinals",       "CHC": "Chicago Cubs",
    "ARI": "Arizona Diamondbacks",      "LAD": "Los Angeles Dodgers",
    "SFG": "San Francisco Giants",      "CLE": "Cleveland Guardians",
    "SEA": "Seattle Mariners",          "MIA": "Miami Marlins",
    "NYM": "New York Mets",             "WSH": "Washington Nationals",
    "BAL": "Baltimore Orioles",         "SDP": "San Diego Padres",
    "PHI": "Philadelphia Phillies",     "PIT": "Pittsburgh Pirates",
    "TEX": "Texas Rangers",             "TBR": "Tampa Bay Rays",
    "BOS": "Boston Red Sox",            "CIN": "Cincinnati Reds",
    "COL": "Colorado Rockies",          "KCR": "Kansas City Royals",
    "DET": "Detroit Tigers",            "MIN": "Minnesota Twins",
    "CWS": "Chicago White Sox",         "NYY": "New York Yankees",
}


def norm_team(fg_abbr: str) -> str:
    """Normalise FanGraphs team abbr to standard 3-letter abbr."""
    return FG_TEAM_ABBR_MAP.get(str(fg_abbr).strip(), str(fg_abbr).strip())


# ── Step 1: Teams ─────────────────────────────────────────────────────────────

def ensure_teams(conn) -> dict[str, str]:
    """Upsert all 30 MLB teams. Returns {abbr: uuid}."""
    team_uuid: dict[str, str] = {}
    with conn.transaction():
        cur = conn.cursor()
        for abbr, full in TEAM_FULLNAMES.items():
            cur.execute("""
                INSERT INTO promlb_teams (abbreviation, name)
                VALUES (%s, %s)
                ON CONFLICT (abbreviation) DO UPDATE SET name=EXCLUDED.name
                RETURNING id
            """, (abbr, full))
            row = cur.fetchone()
            team_uuid[abbr] = str(row["id"])
    print(f"  Teams: {len(team_uuid)} upserted")
    return team_uuid


# ── Step 2: Batting ───────────────────────────────────────────────────────────

def load_batting(conn, team_uuid: dict[str, str]):
    """Pull FanGraphs batting leaderboard for 2024, upsert players + batting stats."""
    print(f"  Fetching FanGraphs batting stats {SEASON} (qual={BATTING_QUAL}) ...", flush=True)
    pb.cache.enable()
    df = pb.batting_stats(SEASON, qual=BATTING_QUAL)
    print(f"  Batting rows: {len(df)}")

    inserted_p = updated_p = inserted_s = updated_s = 0
    with conn.transaction():
        cur = conn.cursor()
        for _, row in df.iterrows():
            fg_id = safe_int(row.get("IDfg"))
            name = str(row.get("Name") or "").strip()
            if not fg_id or not name:
                continue

            team_abbr = norm_team(row.get("Team") or "")
            tid = team_uuid.get(team_abbr)
            age = safe_int(row.get("Age"))

            # Upsert player
            cur.execute("""
                INSERT INTO promlb_players (fg_player_id, full_name, team_id, season, age, player_type)
                VALUES (%s, %s, %s, %s, %s, 'batter')
                ON CONFLICT (fg_player_id) DO UPDATE SET
                    full_name=EXCLUDED.full_name, team_id=EXCLUDED.team_id,
                    season=EXCLUDED.season, age=EXCLUDED.age, updated_at=now()
                RETURNING id, (xmax = 0) AS is_insert
            """, (fg_id, name, tid, SEASON, age))
            r2 = cur.fetchone()
            pid = str(r2["id"])
            if r2["is_insert"]: inserted_p += 1
            else: updated_p += 1

            # Upsert batting stats
            cur.execute("""
                INSERT INTO promlb_batting_stats (
                    player_id, season, games, pa, at_bats, hits, doubles, triples,
                    home_runs, rbi, runs, walks, strikeouts, stolen_bases,
                    batting_avg, obp, slg, ops, war, wrc_plus, babip, iso
                ) VALUES (
                    %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
                )
                ON CONFLICT (player_id, season) DO UPDATE SET
                    games=EXCLUDED.games, pa=EXCLUDED.pa, at_bats=EXCLUDED.at_bats,
                    hits=EXCLUDED.hits, doubles=EXCLUDED.doubles, triples=EXCLUDED.triples,
                    home_runs=EXCLUDED.home_runs, rbi=EXCLUDED.rbi, runs=EXCLUDED.runs,
                    walks=EXCLUDED.walks, strikeouts=EXCLUDED.strikeouts,
                    stolen_bases=EXCLUDED.stolen_bases, batting_avg=EXCLUDED.batting_avg,
                    obp=EXCLUDED.obp, slg=EXCLUDED.slg, ops=EXCLUDED.ops,
                    war=EXCLUDED.war, wrc_plus=EXCLUDED.wrc_plus, babip=EXCLUDED.babip,
                    iso=EXCLUDED.iso
                RETURNING id, (xmax = 0) AS is_insert
            """, (
                pid, SEASON,
                safe_int(row.get("G")),
                safe_int(row.get("PA")),
                safe_int(row.get("AB")),
                safe_int(row.get("H")),
                safe_int(row.get("2B")),
                safe_int(row.get("3B")),
                safe_int(row.get("HR")),
                safe_int(row.get("RBI")),
                safe_int(row.get("R")),
                safe_int(row.get("BB")),
                safe_int(row.get("SO")),
                safe_int(row.get("SB")),
                safe_float(row.get("AVG")),
                safe_float(row.get("OBP")),
                safe_float(row.get("SLG")),
                safe_float(row.get("OPS")),
                safe_float(row.get("WAR"), 2),
                safe_float(row.get("wRC+"), 1),
                safe_float(row.get("BABIP")),
                safe_float(row.get("ISO")),
            ))
            r3 = cur.fetchone()
            if r3["is_insert"]: inserted_s += 1
            else: updated_s += 1

    print(f"  Players: {inserted_p} inserted, {updated_p} updated")
    print(f"  Batting stats: {inserted_s} inserted, {updated_s} updated")


# ── Step 3: Pitching ──────────────────────────────────────────────────────────

def load_pitching(conn, team_uuid: dict[str, str]):
    """Pull FanGraphs pitching leaderboard for 2024, upsert players + pitching stats."""
    print(f"  Fetching FanGraphs pitching stats {SEASON} (qual={PITCHING_QUAL}) ...", flush=True)
    pb.cache.enable()
    df = pb.pitching_stats(SEASON, qual=PITCHING_QUAL)
    print(f"  Pitching rows: {len(df)}")

    inserted_p = updated_p = inserted_s = updated_s = 0
    with conn.transaction():
        cur = conn.cursor()
        for _, row in df.iterrows():
            fg_id = safe_int(row.get("IDfg"))
            name = str(row.get("Name") or "").strip()
            if not fg_id or not name:
                continue

            team_abbr = norm_team(row.get("Team") or "")
            tid = team_uuid.get(team_abbr)
            age = safe_int(row.get("Age"))

            # Upsert player (pitchers may already exist as batters — use fg_id conflict)
            cur.execute("""
                INSERT INTO promlb_players (fg_player_id, full_name, team_id, season, age, player_type)
                VALUES (%s, %s, %s, %s, %s, 'pitcher')
                ON CONFLICT (fg_player_id) DO UPDATE SET
                    full_name=EXCLUDED.full_name, team_id=EXCLUDED.team_id,
                    season=EXCLUDED.season, age=EXCLUDED.age,
                    player_type=CASE WHEN promlb_players.player_type='batter' THEN 'two-way' ELSE EXCLUDED.player_type END,
                    updated_at=now()
                RETURNING id, (xmax = 0) AS is_insert
            """, (fg_id, name, tid, SEASON, age))
            r2 = cur.fetchone()
            pid = str(r2["id"])
            if r2["is_insert"]: inserted_p += 1
            else: updated_p += 1

            # Parse IP (FanGraphs gives e.g. 177.2 where .2 means 2/3 innings)
            ip_raw = safe_float(row.get("IP"), 1)

            cur.execute("""
                INSERT INTO promlb_pitching_stats (
                    player_id, season, games, games_started, innings_pitched,
                    wins, losses, saves, holds, era, whip, strikeouts, walks,
                    k_per_9, bb_per_9, k_pct, bb_pct, hr_per_9, fip, xfip, war, babip, lob_pct
                ) VALUES (
                    %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
                )
                ON CONFLICT (player_id, season) DO UPDATE SET
                    games=EXCLUDED.games, games_started=EXCLUDED.games_started,
                    innings_pitched=EXCLUDED.innings_pitched, wins=EXCLUDED.wins,
                    losses=EXCLUDED.losses, saves=EXCLUDED.saves, holds=EXCLUDED.holds,
                    era=EXCLUDED.era, whip=EXCLUDED.whip, strikeouts=EXCLUDED.strikeouts,
                    walks=EXCLUDED.walks, k_per_9=EXCLUDED.k_per_9, bb_per_9=EXCLUDED.bb_per_9,
                    k_pct=EXCLUDED.k_pct, bb_pct=EXCLUDED.bb_pct, hr_per_9=EXCLUDED.hr_per_9,
                    fip=EXCLUDED.fip, xfip=EXCLUDED.xfip, war=EXCLUDED.war,
                    babip=EXCLUDED.babip, lob_pct=EXCLUDED.lob_pct
                RETURNING id, (xmax = 0) AS is_insert
            """, (
                pid, SEASON,
                safe_int(row.get("G")),
                safe_int(row.get("GS")),
                ip_raw,
                safe_int(row.get("W")),
                safe_int(row.get("L")),
                safe_int(row.get("SV")),
                safe_int(row.get("HLD")),
                safe_float(row.get("ERA"), 2),
                safe_float(row.get("WHIP"), 3),
                safe_int(row.get("SO")),
                safe_int(row.get("BB")),
                safe_float(row.get("K/9"), 2),
                safe_float(row.get("BB/9"), 2),
                safe_float(row.get("K%"), 3),
                safe_float(row.get("BB%"), 3),
                safe_float(row.get("HR/9"), 2),
                safe_float(row.get("FIP"), 2),
                safe_float(row.get("xFIP"), 2),
                safe_float(row.get("WAR"), 2),
                safe_float(row.get("BABIP"), 3),
                safe_float(row.get("LOB%"), 3),
            ))
            r3 = cur.fetchone()
            if r3["is_insert"]: inserted_s += 1
            else: updated_s += 1

    print(f"  Players: {inserted_p} inserted, {updated_p} updated")
    print(f"  Pitching stats: {inserted_s} inserted, {updated_s} updated")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"
    conn = get_conn()
    try:
        print("\n[1] Ensuring MLB teams ...")
        team_uuid = ensure_teams(conn)

        if mode in ("all", "batting"):
            print("\n[2] Loading MLB batting ...")
            load_batting(conn, team_uuid)

        if mode in ("all", "pitching"):
            print("\n[3] Loading MLB pitching ...")
            load_pitching(conn, team_uuid)

        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) AS n FROM promlb_teams")
        nt = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) AS n FROM promlb_players")
        np_ = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) AS n FROM promlb_batting_stats")
        nb = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) AS n FROM promlb_pitching_stats")
        npi = cur.fetchone()["n"]
        print(f"\n=== MLB done: {nt} teams, {np_} players, {nb} batting rows, {npi} pitching rows ===")

    finally:
        conn.close()


if __name__ == "__main__":
    main()
