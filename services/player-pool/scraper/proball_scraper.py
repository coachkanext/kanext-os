#!/usr/bin/env python3.12
"""
KaNeXT Pro Basketball (International) Scraper
Loads proball_leagues, proball_teams, proball_players, proball_player_stats,
proball_standings.

Sources:
  Part 1 — euroleague_api  : EuroLeague (E2025) + EuroCup (U2025)
  Part 2 — SofaScore REST  : 12 international leagues (ACB, BSL, LNB, Lega,
                              Greek, CBA, Israeli, BBL, ABA, CEBL, KBL, NBL)
  Part 3 — nba_api         : NBA G League

Requirements: python3.12+  (euroleague_api uses str|None union syntax)
    pip3.12 install euroleague-api nba_api httpx beautifulsoup4 psycopg

Usage:
    python3.12 proball_scraper.py              # all three sources
    python3.12 proball_scraper.py euroleague   # Part 1 only
    python3.12 proball_scraper.py sofascore    # Part 2 only
    python3.12 proball_scraper.py gleague      # Part 3 only
"""
from __future__ import annotations

import sys
import time
import math
import re
from typing import Optional

import httpx
import psycopg
from psycopg.rows import dict_row

# ── DB ────────────────────────────────────────────────────────────────────────

DB_CONFIG = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}


def get_conn():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)


# ── Safe helpers ──────────────────────────────────────────────────────────────

def safe_float(v) -> Optional[float]:
    if v is None:
        return None
    if isinstance(v, float) and math.isnan(v):
        return None
    try:
        return round(float(v), 4)
    except (ValueError, TypeError):
        return None


def safe_int(v) -> Optional[int]:
    f = safe_float(v)
    return int(f) if f is not None else None


def pct_str_to_float(v) -> Optional[float]:
    """Convert '66.7%' or '0%' or 66.7 → 0.667"""
    if v is None:
        return None
    s = str(v).replace("%", "").strip()
    if not s or s in ("-", "N/A"):
        return None
    try:
        return round(float(s) / 100.0, 4)
    except ValueError:
        return None


# ── DB upsert helpers ─────────────────────────────────────────────────────────

def upsert_league(conn, name: str, short_name: str, country: str, source: str,
                  sofascore_tid: Optional[int] = None,
                  sofascore_season_id: Optional[int] = None) -> str:
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO proball_leagues
                (name, short_name, country, source, sofascore_tid, sofascore_season_id)
            VALUES (%s,%s,%s,%s,%s,%s)
            ON CONFLICT (name) DO UPDATE SET
                short_name          = EXCLUDED.short_name,
                country             = EXCLUDED.country,
                source              = EXCLUDED.source,
                sofascore_tid       = COALESCE(EXCLUDED.sofascore_tid, proball_leagues.sofascore_tid),
                sofascore_season_id = COALESCE(EXCLUDED.sofascore_season_id, proball_leagues.sofascore_season_id)
            RETURNING id
        """, (name, short_name, country, source, sofascore_tid, sofascore_season_id))
        return str(cur.fetchone()["id"])


def upsert_team(conn, name: str, league_id: str, country: Optional[str] = None,
                conference: Optional[str] = None,
                sofascore_team_id: Optional[int] = None) -> str:
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO proball_teams (name, league_id, country, conference, sofascore_team_id)
            VALUES (%s,%s,%s,%s,%s)
            ON CONFLICT (name, league_id) DO UPDATE SET
                country             = COALESCE(EXCLUDED.country, proball_teams.country),
                conference          = COALESCE(EXCLUDED.conference, proball_teams.conference),
                sofascore_team_id   = COALESCE(EXCLUDED.sofascore_team_id, proball_teams.sofascore_team_id)
            RETURNING id
        """, (name, league_id, country, conference, sofascore_team_id))
        return str(cur.fetchone()["id"])


def upsert_player(conn, source_player_id: str, full_name: str, team_id: Optional[str],
                  league_id: Optional[str], position: Optional[str] = None,
                  height_cm: Optional[int] = None,
                  nationality: Optional[str] = None) -> str:
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO proball_players
                (source_player_id, full_name, team_id, league_id,
                 position, height_cm, nationality)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (source_player_id) DO UPDATE SET
                full_name   = EXCLUDED.full_name,
                team_id     = EXCLUDED.team_id,
                league_id   = EXCLUDED.league_id,
                position    = COALESCE(EXCLUDED.position,    proball_players.position),
                height_cm   = COALESCE(EXCLUDED.height_cm,   proball_players.height_cm),
                nationality = COALESCE(EXCLUDED.nationality, proball_players.nationality),
                updated_at  = now()
            RETURNING id
        """, (source_player_id, full_name, team_id, league_id,
              position, height_cm, nationality))
        return str(cur.fetchone()["id"])


def upsert_stats(conn, player_id: str, league_id: str, season: str,
                 gp, mpg, ppg, rpg, apg, spg, bpg, topg,
                 fg_pct, two_pt_pct, three_pt_pct, ft_pct, plus_minus):
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO proball_player_stats (
                player_id, league_id, season,
                gp, mpg, ppg, rpg, apg, spg, bpg, topg,
                fg_pct, two_pt_pct, three_pt_pct, ft_pct, plus_minus
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (player_id, league_id, season) DO UPDATE SET
                gp           = COALESCE(EXCLUDED.gp,           proball_player_stats.gp),
                mpg          = COALESCE(EXCLUDED.mpg,          proball_player_stats.mpg),
                ppg          = COALESCE(EXCLUDED.ppg,          proball_player_stats.ppg),
                rpg          = COALESCE(EXCLUDED.rpg,          proball_player_stats.rpg),
                apg          = COALESCE(EXCLUDED.apg,          proball_player_stats.apg),
                spg          = COALESCE(EXCLUDED.spg,          proball_player_stats.spg),
                bpg          = COALESCE(EXCLUDED.bpg,          proball_player_stats.bpg),
                topg         = COALESCE(EXCLUDED.topg,         proball_player_stats.topg),
                fg_pct       = COALESCE(EXCLUDED.fg_pct,       proball_player_stats.fg_pct),
                two_pt_pct   = COALESCE(EXCLUDED.two_pt_pct,   proball_player_stats.two_pt_pct),
                three_pt_pct = COALESCE(EXCLUDED.three_pt_pct, proball_player_stats.three_pt_pct),
                ft_pct       = COALESCE(EXCLUDED.ft_pct,       proball_player_stats.ft_pct),
                plus_minus   = COALESCE(EXCLUDED.plus_minus,   proball_player_stats.plus_minus),
                updated_at   = now()
        """, (player_id, league_id, season,
              gp, mpg, ppg, rpg, apg, spg, bpg, topg,
              fg_pct, two_pt_pct, three_pt_pct, ft_pct, plus_minus))


def upsert_standing(conn, team_id: str, league_id: str, season: str,
                    position: Optional[int], wins: Optional[int], losses: Optional[int]):
    with conn.transaction():
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO proball_standings (team_id, league_id, season, position, wins, losses)
            VALUES (%s,%s,%s,%s,%s,%s)
            ON CONFLICT (team_id, league_id, season) DO UPDATE SET
                position = COALESCE(EXCLUDED.position, proball_standings.position),
                wins     = COALESCE(EXCLUDED.wins,     proball_standings.wins),
                losses   = COALESCE(EXCLUDED.losses,   proball_standings.losses)
        """, (team_id, league_id, season, position, wins, losses))


# ═══════════════════════════════════════════════════════════════════════════════
# PART 1 — EuroLeague + EuroCup via euroleague_api
# ═══════════════════════════════════════════════════════════════════════════════

def load_euroleague(conn):
    from euroleague_api.player_stats import PlayerStats
    from euroleague_api.team_stats import TeamStats
    from euroleague_api.standings import Standings

    COMPS = [
        {"comp": "E", "name": "EuroLeague", "short": "EuroLeague", "country": "Multi"},
        {"comp": "U", "name": "EuroCup",    "short": "EuroCup",    "country": "Multi"},
    ]

    for cfg in COMPS:
        print(f"\n=== {cfg['name']} (euroleague_api) ===")

        league_id = upsert_league(
            conn, cfg["name"], cfg["short"], cfg["country"], "euroleague_api"
        )

        # ── Standings → teams ────────────────────────────────────────────────
        st_df = None
        for round_num in range(34, 0, -1):
            try:
                st = Standings(competition=cfg["comp"])
                st_df = st.get_standings(2025, round_num)
                if st_df is not None and len(st_df) > 0:
                    print(f"  Standings: {len(st_df)} teams (round {round_num})")
                    break
            except Exception:
                continue
            time.sleep(0.3)

        team_id_cache: dict[str, str] = {}  # team.name → uuid

        if st_df is not None and len(st_df) > 0:
            for _, row in st_df.iterrows():
                team_name = row.get("club.name") or row.get("club.editorialName") or ""
                if not team_name:
                    continue
                tid = upsert_team(conn, team_name, league_id, country=None, conference=None)
                team_id_cache[team_name] = tid
                upsert_standing(
                    conn, tid, league_id, "2025-26",
                    position=safe_int(row.get("position")),
                    wins=safe_int(row.get("gamesWon")),
                    losses=safe_int(row.get("gamesLost")),
                )

        # ── Player stats ─────────────────────────────────────────────────────
        try:
            ps = PlayerStats(competition=cfg["comp"])
            df = ps.get_player_stats_single_season(
                "traditional", 2025,
                phase_type_code="RS",
                statistic_mode="PerGame"
            )
            time.sleep(0.5)
        except Exception as e:
            print(f"  [error] player stats: {e}")
            continue

        print(f"  Players: {len(df)} rows")
        prefix = "el" if cfg["comp"] == "E" else "ec"
        inserted = 0

        for _, row in df.iterrows():
            team_name = row.get("player.team.name", "")
            if team_name and team_name not in team_id_cache:
                tid = upsert_team(conn, team_name, league_id)
                team_id_cache[team_name] = tid
            team_id = team_id_cache.get(team_name)

            player_code = str(row.get("player.code", "")).strip()
            if not player_code:
                continue
            source_id = f"{prefix}:{player_code}"
            full_name = str(row.get("player.name", "")).strip()

            player_id = upsert_player(
                conn, source_id, full_name, team_id, league_id,
                position=None, height_cm=None, nationality=None
            )

            # Compute fg_pct from raw made/attempted
            twoPM  = safe_float(row.get("twoPointersMade",   0)) or 0
            twoPA  = safe_float(row.get("twoPointersAttempted", 0)) or 0
            thrPM  = safe_float(row.get("threePointersMade",  0)) or 0
            thrPA  = safe_float(row.get("threePointersAttempted", 0)) or 0
            total_made = twoPM + thrPM
            total_att  = twoPA + thrPA
            fg_pct = round(total_made / total_att, 4) if total_att > 0 else None

            gp = safe_int(row.get("gamesPlayed"))

            upsert_stats(
                conn, player_id, league_id, "2025-26",
                gp=gp,
                mpg=safe_float(row.get("minutesPlayed")),
                ppg=safe_float(row.get("pointsScored")),
                rpg=safe_float(row.get("totalRebounds")),
                apg=safe_float(row.get("assists")),
                spg=safe_float(row.get("steals")),
                bpg=safe_float(row.get("blocks")),
                topg=safe_float(row.get("turnovers")),
                fg_pct=fg_pct,
                two_pt_pct=pct_str_to_float(row.get("twoPointersPercentage")),
                three_pt_pct=pct_str_to_float(row.get("threePointersPercentage")),
                ft_pct=pct_str_to_float(row.get("freeThrowsPercentage")),
                plus_minus=None,
            )
            inserted += 1

        print(f"  → {len(team_id_cache)} teams, {inserted} player-stat rows written")


# ═══════════════════════════════════════════════════════════════════════════════
# PART 2 — International Leagues via SofaScore
# ═══════════════════════════════════════════════════════════════════════════════

SS_HEADERS = {
    "User-Agent":      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept":          "application/json",
    "Referer":         "https://www.sofascore.com/",
    "Accept-Language": "en-US,en;q=0.9",
}
SS_DELAY = 0.45   # seconds between SofaScore requests

SS_LEAGUES = [
    # (name, short_name, country, sofascore_tid, sofascore_season_id, season_str)
    ("Spanish ACB",          "ACB",        "Spain",     264,   80922, "2025-26"),
    ("Turkish BSL",          "BSL",        "Turkey",    519,   81036, "2025-26"),
    ("French LNB Pro A",     "LNB Pro A",  "France",    156,   79100, "2025-26"),
    ("Italian Lega Basket",  "Lega A",     "Italy",     262,   79529, "2025-26"),
    ("Greek Basket League",  "GBL",        "Greece",    304,   83421, "2025-26"),
    ("Chinese CBA",          "CBA",        "China",    1566,   85375, "2025-26"),
    ("Israeli BSL",          "Israeli BSL","Israel",   1197,   81980, "2025-26"),
    ("German BBL",           "BBL",        "Germany",   227,   79994, "2025-26"),
    ("Adriatic ABA League",  "ABA",        "Multi",     235,   80150, "2025-26"),
    ("Canadian CEBL",        "CEBL",       "Canada",  21995,   88780, "2025-26"),
    ("Korean KBL",           "KBL",        "Korea",    1540,   78467, "2025-26"),
    ("Australian NBL",       "NBL",        "Australia",1524,   77205, "2025-26"),
]


def ss_get(path: str) -> Optional[dict]:
    url = f"https://api.sofascore.com/api/v1/{path.lstrip('/')}"
    try:
        r = httpx.get(url, headers=SS_HEADERS, timeout=20)
        time.sleep(SS_DELAY)
        if r.status_code == 200:
            return r.json()
        if r.status_code != 404:
            print(f"    [warn] HTTP {r.status_code}: {path[:80]}")
        return None
    except Exception as e:
        print(f"    [warn] {e}: {path[:60]}")
        return None


def load_sofascore(conn):
    for (name, short_name, country, tid, sid, season) in SS_LEAGUES:
        print(f"\n=== {name} (SofaScore tid={tid}) ===")

        league_id = upsert_league(
            conn, name, short_name, country, "sofascore",
            sofascore_tid=tid, sofascore_season_id=sid
        )

        # ── Standings → teams + W/L records ──────────────────────────────────
        st_data = ss_get(f"unique-tournament/{tid}/season/{sid}/standings/total")
        team_id_cache: dict[int, str] = {}  # sofascore_team_id → uuid

        if st_data:
            rows = st_data.get("standings", [{}])[0].get("rows", [])
            print(f"  Standings: {len(rows)} teams")
            for row in rows:
                team = row.get("team", {})
                ss_tid = team.get("id")
                team_name = team.get("name", "")
                if not team_name or not ss_tid:
                    continue
                db_tid = upsert_team(
                    conn, team_name, league_id,
                    sofascore_team_id=ss_tid
                )
                team_id_cache[ss_tid] = db_tid
                upsert_standing(
                    conn, db_tid, league_id, season,
                    position=safe_int(row.get("position")),
                    wins=safe_int(row.get("wins")),
                    losses=safe_int(row.get("losses")),
                )
        else:
            print("  [warn] No standings data")
            continue

        # ── For each team: get players, then stats ────────────────────────────
        total_players = 0
        total_stats   = 0

        for ss_tid_team, db_team_id in team_id_cache.items():
            players_data = ss_get(f"team/{ss_tid_team}/players")
            if not players_data:
                continue

            raw_players = players_data.get("players", [])
            if not raw_players:
                continue

            for entry in raw_players:
                # SofaScore /team/{id}/players returns list of player objects directly
                if isinstance(entry, dict) and "player" in entry:
                    p = entry["player"]
                else:
                    p = entry

                player_id_ss = p.get("id")
                full_name = p.get("name", "").strip()
                if not player_id_ss or not full_name:
                    continue

                source_id = f"ss:{player_id_ss}"
                position  = p.get("position") or None
                # position may be string or dict
                if isinstance(position, dict):
                    position = position.get("name") or position.get("abbreviation")

                height_cm = safe_int(p.get("height"))
                country_p = None
                country_raw = p.get("country", {})
                if isinstance(country_raw, dict):
                    country_p = country_raw.get("name")
                elif isinstance(country_raw, str):
                    country_p = country_raw

                player_db_id = upsert_player(
                    conn, source_id, full_name, db_team_id, league_id,
                    position=position, height_cm=height_cm, nationality=country_p
                )
                total_players += 1

                # Fetch per-season stats for this player
                stats_data = ss_get(
                    f"player/{player_id_ss}/unique-tournament/{tid}/season/{sid}/statistics/overall"
                )
                if not stats_data:
                    continue

                stats = stats_data.get("statistics", {})
                appearances = safe_int(stats.get("appearances")) or 0
                if appearances == 0:
                    continue

                def per_game(key):
                    v = stats.get(key)
                    if v is None:
                        return None
                    return round(v / appearances, 3)

                seconds = stats.get("secondsPlayed", 0) or 0
                mpg = round((seconds / 60) / appearances, 2) if appearances > 0 else None

                upsert_stats(
                    conn, player_db_id, league_id, season,
                    gp=appearances,
                    mpg=mpg,
                    ppg=per_game("points"),
                    rpg=per_game("rebounds"),
                    apg=per_game("assists"),
                    spg=per_game("steals"),
                    bpg=per_game("blocks"),
                    topg=per_game("turnovers"),
                    fg_pct=safe_float(
                        (stats.get("fieldGoalsPercentage") or 0) / 100
                        if stats.get("fieldGoalsPercentage") is not None else None
                    ),
                    two_pt_pct=safe_float(
                        (stats.get("twoPointsPercentage") or 0) / 100
                        if stats.get("twoPointsPercentage") is not None else None
                    ),
                    three_pt_pct=safe_float(
                        (stats.get("threePointsPercentage") or 0) / 100
                        if stats.get("threePointsPercentage") is not None else None
                    ),
                    ft_pct=safe_float(
                        (stats.get("freeThrowsPercentage") or 0) / 100
                        if stats.get("freeThrowsPercentage") is not None else None
                    ),
                    plus_minus=per_game("plusMinus"),
                )
                total_stats += 1

        print(f"  → {total_players} players, {total_stats} stat rows")


# ═══════════════════════════════════════════════════════════════════════════════
# PART 3 — NBA G League via nba_api
# ═══════════════════════════════════════════════════════════════════════════════

def load_gleague(conn):
    from nba_api.stats.endpoints import leaguedashplayerstats, leaguedashteamstats

    print("\n=== NBA G League (nba_api) ===")

    league_id = upsert_league(
        conn, "NBA G League", "G League", "USA", "nba_api"
    )

    # ── Teams ─────────────────────────────────────────────────────────────────
    team_data = leaguedashteamstats.LeagueDashTeamStats(
        league_id_nullable="20", season="2024-25"
    )
    time.sleep(0.6)
    teams_df = team_data.get_data_frames()[0]
    team_id_cache: dict[int, str] = {}  # nba TEAM_ID → uuid

    for _, row in teams_df.iterrows():
        team_name = str(row["TEAM_NAME"])
        db_tid = upsert_team(conn, team_name, league_id)
        team_id_cache[int(row["TEAM_ID"])] = db_tid
        upsert_standing(
            conn, db_tid, league_id, "2024-25",
            position=None,
            wins=safe_int(row.get("W")),
            losses=safe_int(row.get("L")),
        )

    print(f"  Teams: {len(team_id_cache)}")

    # ── Player stats (per-game) ───────────────────────────────────────────────
    player_data = leaguedashplayerstats.LeagueDashPlayerStats(
        league_id_nullable="20", season="2024-25", per_mode_detailed="PerGame"
    )
    time.sleep(0.6)
    players_df = player_data.get_data_frames()[0]
    print(f"  Players: {len(players_df)}")

    inserted = 0
    for _, row in players_df.iterrows():
        nba_pid    = int(row["PLAYER_ID"])
        source_id  = f"nba:{nba_pid}"
        full_name  = str(row["PLAYER_NAME"]).strip()
        team_nba   = int(row["TEAM_ID"]) if row.get("TEAM_ID") else None
        db_team_id = team_id_cache.get(team_nba)

        player_db_id = upsert_player(
            conn, source_id, full_name, db_team_id, league_id,
            position=None, height_cm=None, nationality=None
        )

        fg_pct = safe_float(row.get("FG_PCT"))
        upsert_stats(
            conn, player_db_id, league_id, "2024-25",
            gp=safe_int(row.get("GP")),
            mpg=safe_float(row.get("MIN")),
            ppg=safe_float(row.get("PTS")),
            rpg=safe_float(row.get("REB")),
            apg=safe_float(row.get("AST")),
            spg=safe_float(row.get("STL")),
            bpg=safe_float(row.get("BLK")),
            topg=safe_float(row.get("TOV")),
            fg_pct=fg_pct,
            two_pt_pct=None,
            three_pt_pct=safe_float(row.get("FG3_PCT")),
            ft_pct=safe_float(row.get("FT_PCT")),
            plus_minus=safe_float(row.get("PLUS_MINUS")),
        )
        inserted += 1

    print(f"  → {inserted} player-stat rows written")


# ═══════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════

def print_summary(conn):
    cur = conn.cursor()
    cur.execute("""
        SELECT l.short_name, l.source,
               COUNT(DISTINCT t.id)  AS teams,
               COUNT(DISTINCT p.id)  AS players,
               COUNT(DISTINCT ps.id) AS stat_rows
        FROM   proball_leagues l
        LEFT JOIN proball_teams t        ON t.league_id  = l.id
        LEFT JOIN proball_players p      ON p.league_id  = l.id
        LEFT JOIN proball_player_stats ps ON ps.league_id = l.id
        GROUP BY l.short_name, l.source
        ORDER BY l.source, l.short_name
    """)
    rows = cur.fetchall()
    print("\n============================================================")
    print("PROBALL DONE")
    print(f"  {'League':<22} {'Teams':>6} {'Players':>8} {'Stats':>8}")
    print(f"  {'-'*22} {'-'*6} {'-'*8} {'-'*8}")
    totals = [0, 0, 0]
    for r in rows:
        print(f"  {r['short_name']:<22} {r['teams']:>6} {r['players']:>8} {r['stat_rows']:>8}")
        totals[0] += r["teams"]
        totals[1] += r["players"]
        totals[2] += r["stat_rows"]
    print(f"  {'TOTAL':<22} {totals[0]:>6} {totals[1]:>8} {totals[2]:>8}")
    print("============================================================")


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    args = set(sys.argv[1:])

    if not args:
        run_euroleague = run_sofascore = run_gleague = True
    else:
        run_euroleague = "euroleague" in args or "all" in args
        run_sofascore  = "sofascore"  in args or "all" in args
        run_gleague    = "gleague"    in args or "all" in args

    # Apply schema
    conn = get_conn()
    try:
        if run_euroleague:
            load_euroleague(conn)
        if run_sofascore:
            load_sofascore(conn)
        if run_gleague:
            load_gleague(conn)
        print_summary(conn)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
