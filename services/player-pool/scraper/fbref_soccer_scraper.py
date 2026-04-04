#!/usr/bin/env python3
"""
FBref Advanced Stats Scraper (via soccerdata)
==============================================
Source: fbref.com via soccerdata package (StatsBomb data)
Covers: Big 5 European Leagues Combined (EPL, La Liga, Bundesliga, Serie A, Ligue 1)
        Season 2024 (2024-25)

Advanced metrics per player:
  Standard:   games, minutes, goals, assists
  Shooting:   shots, shots_on_target, xG, npxG, xA
  Passing:    progressive_passes, key_passes, passes_into_final_third
  Possession: progressive_carries, carries_into_final_third, take_ons_attempted
  Defense:    pressures, tackles, interceptions, clearances, blocks
  GCA:        shot_creating_actions, goal_creating_actions
  Misc:       yellow_cards, red_cards, fouls, fouled

Rate limit: ~3 req/min. soccerdata caches to ~/soccerdata/data/FBref automatically.
First run will take ~15–30 min. Subsequent runs use cache.

Writes to:
  prosc_fbref_stats — keyed by (fbref_player_id, league, season)
  Soft-links prosc_players via exact/fuzzy name match

Usage:
    python3 fbref_soccer_scraper.py
    python3 fbref_soccer_scraper.py --season 2024    # default
    python3 fbref_soccer_scraper.py --no-cache       # force fresh fetch
    python3 fbref_soccer_scraper.py --dry-run
"""
from __future__ import annotations

import argparse
import math
import os
import sys
import time
from typing import Optional

import psycopg
from psycopg.rows import dict_row

sys.path.insert(0, os.path.dirname(__file__))
from config import DB_CONFIG

# ── Config ─────────────────────────────────────────────────────────────────────

FBREF_LEAGUE = "Big 5 European Leagues Combined"
DEFAULT_SEASON = 2024   # soccerdata uses int year (2024 = 2024-25)

# Stat types to pull: (stat_type, list of (fbref_col, db_col))
STAT_TYPES = [
    ("standard", [
        ("games",            "games"),
        ("games_starts",     "games_started"),
        ("minutes",          "minutes"),
        ("goals",            "goals"),
        ("assists",          "assists"),
        ("yellow_cards",     "yellow_cards"),
        ("red_cards",        "red_cards"),
    ]),
    ("shooting", [
        ("shots",            "shots"),
        ("shots_on_target",  "shots_on_target"),
        ("goals",            "goals"),         # overwrite with shooting data if more accurate
        ("xg",               "xg"),
        ("npxg",             "npxg"),
        ("xa",               "xa"),
    ]),
    ("passing", [
        ("progressive_passes",           "progressive_passes"),
        ("passes_into_final_third",      "passes_into_final_third"),
        ("key_passes",                   "key_passes"),
    ]),
    ("possession", [
        ("progressive_carries",          "progressive_carries"),
        ("carries_into_final_third",     "carries_into_final_third"),
        ("take_ons",                     "take_ons_attempted"),
        ("take_ons_won",                 "take_ons_won"),
    ]),
    ("defense", [
        ("pressures",                    "pressures"),
        ("tackles",                      "tackles"),
        ("interceptions",                "interceptions"),
        ("clearances",                   "clearances"),
        ("blocks",                       "blocks"),
    ]),
    ("goal_shot_creation", [
        ("sca",                          "shot_creating_actions"),
        ("gca",                          "goal_creating_actions"),
    ]),
    ("misc", [
        ("fouls",                        "fouls"),
        ("fouled",                       "fouled"),
    ]),
]

# ── DDL ────────────────────────────────────────────────────────────────────────

DDL = """
CREATE TABLE IF NOT EXISTS prosc_fbref_stats (
    id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    fbref_player_id         VARCHAR NOT NULL,
    player_name             VARCHAR NOT NULL,
    team_name               VARCHAR,
    league                  VARCHAR,        -- e.g. 'ENG-Premier League'
    season                  VARCHAR NOT NULL,  -- e.g. '2024'
    position                VARCHAR,
    nationality             VARCHAR,

    -- Standard
    games                   INTEGER,
    games_started           INTEGER,
    minutes                 INTEGER,
    goals                   INTEGER,
    assists                 INTEGER,
    yellow_cards            INTEGER,
    red_cards               INTEGER,

    -- Shooting / expected
    shots                   INTEGER,
    shots_on_target         INTEGER,
    xg                      NUMERIC(7,2),
    npxg                    NUMERIC(7,2),
    xa                      NUMERIC(7,2),

    -- Passing
    progressive_passes      INTEGER,
    passes_into_final_third INTEGER,
    key_passes              INTEGER,

    -- Possession
    progressive_carries     INTEGER,
    carries_into_final_third INTEGER,
    take_ons_attempted      INTEGER,
    take_ons_won            INTEGER,

    -- Defense
    pressures               INTEGER,
    tackles                 INTEGER,
    interceptions           INTEGER,
    clearances              INTEGER,
    blocks                  INTEGER,

    -- Goal/Shot Creation
    shot_creating_actions   INTEGER,
    goal_creating_actions   INTEGER,

    -- Misc
    fouls                   INTEGER,
    fouled                  INTEGER,

    -- Soft link to ESPN prosc_players
    prosc_player_id         UUID REFERENCES prosc_players(id),

    created_at              TIMESTAMPTZ DEFAULT now(),
    updated_at              TIMESTAMPTZ DEFAULT now(),
    UNIQUE (fbref_player_id, season)
);
CREATE INDEX IF NOT EXISTS prosc_fbref_stats_league_season
    ON prosc_fbref_stats(league, season);
"""


# ── DB helpers ─────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg.connect(
        host=DB_CONFIG["host"], port=DB_CONFIG["port"],
        dbname=DB_CONFIG["dbname"], row_factory=dict_row, autocommit=False,
    )


def ensure_table(conn):
    conn.execute(DDL)
    conn.commit()


def _safe(v, cast=float) -> Optional:
    try:
        if v is None:
            return None
        f = float(str(v).replace(",", ""))
        if math.isnan(f) or math.isinf(f):
            return None
        return cast(round(f, 2) if cast is float else int(f))
    except (TypeError, ValueError):
        return None


def build_prosc_lookup(conn) -> dict[str, str]:
    rows = conn.execute("SELECT id, full_name FROM prosc_players").fetchall()
    lookup = {}
    for r in rows:
        lookup[r["full_name"].lower().strip()] = str(r["id"])
    return lookup


def link_player(name: str, lookup: dict[str, str]) -> Optional[str]:
    key = name.lower().strip()
    if key in lookup:
        return lookup[key]
    # Try removing accents / special chars
    try:
        from unidecode import unidecode
        alt = unidecode(key)
        if alt in lookup:
            return lookup[alt]
        # Also try unidecoded versions in lookup
        for k, v in lookup.items():
            if unidecode(k) == alt:
                return v
    except ImportError:
        pass
    return None


# ── FBref pull ─────────────────────────────────────────────────────────────────

def pull_stats(season: int, no_cache: bool) -> dict[str, dict]:
    """
    Pull all stat types from FBref for the given season.
    Returns {fbref_player_id: merged_row_dict}.
    """
    import soccerdata as sd

    print(f"  Initializing FBref reader (league='{FBREF_LEAGUE}', season={season})...")
    fb = sd.FBref(leagues=[FBREF_LEAGUE], seasons=[season], no_cache=no_cache)

    merged: dict[str, dict] = {}

    for stat_type, col_map in STAT_TYPES:
        print(f"  Fetching {stat_type}...", end=" ", flush=True)
        try:
            df = fb.read_player_season_stats(stat_type=stat_type)
        except Exception as e:
            print(f"FAILED ({e})")
            continue

        if df is None or df.empty:
            print("0 rows")
            continue

        df = df.reset_index()
        print(f"{len(df)} rows")

        for _, row in df.iterrows():
            # FBref uses multi-index; after reset_index we get flat columns
            # Player ID is typically in index or 'player_id' col
            pid = None
            for pid_col in ["player_id", "player", "Player"]:
                if pid_col in row.index:
                    pid = str(row[pid_col])
                    break
            if not pid:
                continue

            entry = merged.setdefault(pid, {
                "fbref_player_id": pid,
                "player_name": "",
                "team_name": "",
                "league": "",
                "position": "",
                "nationality": "",
            })

            # Player name, team, league, position, nationality
            for name_col in ["player", "Player"]:
                if name_col in row.index and row[name_col]:
                    entry["player_name"] = str(row[name_col])
                    break
            for team_col in ["team", "squad", "Squad", "Team"]:
                if team_col in row.index and row[team_col]:
                    entry["team_name"] = str(row[team_col])
                    break
            for comp_col in ["comp", "league", "Comp"]:
                if comp_col in row.index and row[comp_col]:
                    entry["league"] = str(row[comp_col])
                    break
            for pos_col in ["pos", "position", "Pos"]:
                if pos_col in row.index and row[pos_col]:
                    entry["position"] = str(row[pos_col])
                    break
            for nat_col in ["nation", "nationality", "Nation"]:
                if nat_col in row.index and row[nat_col]:
                    entry["nationality"] = str(row[nat_col])
                    break

            # Map stat columns
            for fbref_col, db_col in col_map:
                # Column may have prefix (e.g., "performance_goals") — try both
                candidates = [fbref_col, f"performance_{fbref_col}",
                              f"expected_{fbref_col}", f"sca_types_{fbref_col}"]
                for c in candidates:
                    if c in row.index:
                        cast = float if db_col in ("xg", "npxg", "xa") else int
                        val = _safe(row[c], cast)
                        if val is not None:
                            entry[db_col] = val
                        break

        # Rate-limit courtesy pause between stat type fetches
        time.sleep(0.5)

    print(f"\n  Total merged players: {len(merged)}")
    return merged


# ── Upsert ─────────────────────────────────────────────────────────────────────

ALL_DB_COLS = [
    "games", "games_started", "minutes", "goals", "assists",
    "yellow_cards", "red_cards", "shots", "shots_on_target",
    "xg", "npxg", "xa",
    "progressive_passes", "passes_into_final_third", "key_passes",
    "progressive_carries", "carries_into_final_third",
    "take_ons_attempted", "take_ons_won",
    "pressures", "tackles", "interceptions", "clearances", "blocks",
    "shot_creating_actions", "goal_creating_actions",
    "fouls", "fouled",
]


def upsert_rows(conn, merged: dict[str, dict], season_str: str,
                prosc_lookup: dict[str, str]) -> tuple[int, int, int]:
    inserted = updated = linked = 0
    for pid, row in merged.items():
        name = row.get("player_name", "").strip()
        if not name:
            continue
        prosc_id = link_player(name, prosc_lookup)
        if prosc_id:
            linked += 1

        vals: dict = {
            "fbref_player_id": pid,
            "player_name": name,
            "team_name": row.get("team_name") or None,
            "league": row.get("league") or None,
            "season": season_str,
            "position": row.get("position") or None,
            "nationality": row.get("nationality") or None,
            "prosc_player_id": prosc_id,
        }
        for col in ALL_DB_COLS:
            vals[col] = row.get(col)

        set_clause = ",\n            ".join(
            f"{c}=COALESCE(EXCLUDED.{c}, prosc_fbref_stats.{c})"
            for c in ALL_DB_COLS
        )

        col_list = ", ".join(vals.keys())
        ph_list  = ", ".join(f"%({k})s" for k in vals.keys())

        r = conn.execute(f"""
            INSERT INTO prosc_fbref_stats ({col_list})
            VALUES ({ph_list})
            ON CONFLICT (fbref_player_id, season) DO UPDATE SET
                player_name     = EXCLUDED.player_name,
                team_name       = EXCLUDED.team_name,
                league          = EXCLUDED.league,
                position        = EXCLUDED.position,
                nationality     = EXCLUDED.nationality,
                prosc_player_id = COALESCE(EXCLUDED.prosc_player_id, prosc_fbref_stats.prosc_player_id),
                updated_at      = now(),
                {set_clause}
            RETURNING id, (xmax = 0) AS is_insert
        """, vals).fetchone()
        if r["is_insert"]:
            inserted += 1
        else:
            updated += 1

    conn.commit()
    return inserted, updated, linked


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--season", type=int, default=DEFAULT_SEASON,
                        help="Season year (e.g. 2024 for 2024-25)")
    parser.add_argument("--no-cache", action="store_true",
                        help="Force fresh fetch from FBref (ignores disk cache)")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    print(f"\n=== FBref Soccer Scraper — {FBREF_LEAGUE}, season {args.season} ===")
    print(f"  Cache: {'disabled' if args.no_cache else 'enabled (~/.soccerdata/data/FBref)'}")
    print(f"  Note: First run fetches live (rate-limited ~3 req/min, may take 15-30 min)")
    print(f"        Subsequent runs use disk cache and complete in seconds.\n")

    try:
        import soccerdata as sd
    except ImportError:
        print("ERROR: pip install soccerdata")
        sys.exit(1)

    merged = pull_stats(args.season, args.no_cache)

    if not merged:
        print("No data fetched — aborting.")
        sys.exit(1)

    if args.dry_run:
        print(f"\n[dry-run] Would upsert {len(merged)} player records")
        sample = list(merged.values())[:5]
        for r in sample:
            print(f"  {r.get('player_name','?'):<28} {r.get('team_name','?'):<22} "
                  f"xG={r.get('xg','?')} xA={r.get('xa','?')} "
                  f"pprog={r.get('progressive_passes','?')} press={r.get('pressures','?')}")
        return

    conn = get_conn()
    ensure_table(conn)
    prosc_lookup = build_prosc_lookup(conn)
    print(f"  prosc_players lookup: {len(prosc_lookup)} names")

    season_str = str(args.season)
    ins, upd, lnk = upsert_rows(conn, merged, season_str, prosc_lookup)

    # Summary
    total = conn.execute("SELECT COUNT(*) AS n FROM prosc_fbref_stats").fetchone()["n"]
    by_league = conn.execute("""
        SELECT league, COUNT(*) AS n,
               SUM(CASE WHEN prosc_player_id IS NOT NULL THEN 1 ELSE 0 END) AS linked
        FROM prosc_fbref_stats WHERE season=%s
        GROUP BY league ORDER BY n DESC
    """, (season_str,)).fetchall()

    print(f"\n=== FBref DB Summary (season {args.season}) ===")
    for r in by_league:
        print(f"  {str(r['league']):<30} {r['n']:>5} players  {r['linked']:>5} linked")
    print(f"  TOTAL: {total} rows  ({ins} inserted, {upd} updated)")
    print(f"  Linked to prosc_players: {lnk}")

    conn.close()
    print("\nDone.")


if __name__ == "__main__":
    main()
