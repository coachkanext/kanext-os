#!/usr/bin/env python3
"""
KaNeXT NHL Player Stats Scraper
Source: nhl-api-py (wraps the official NHL Stats API — no key required)

Pulls 2024-25 regular season skater + goalie stats for all 32 teams.
Bio data (height, weight, DOB, nationality) sourced from team rosters.

DB tables:
  nhl_teams      — 32 franchises
  nhl_players    — bio + current team
  nhl_skater_stats  — per-season stats for skaters/defensemen
  nhl_goalie_stats  — per-season stats for goalies

Usage:
    python3 nhl_scraper.py
"""
from __future__ import annotations

import time
from typing import Optional

import psycopg
from psycopg.rows import dict_row
from nhlpy import NHLClient

DB_CONFIG = {"host": "localhost", "port": 5432, "dbname": "kanext_player_pool"}
SEASON    = "20242025"

DDL = """
CREATE TABLE IF NOT EXISTS nhl_teams (
    id            INT  PRIMARY KEY,
    full_name     TEXT NOT NULL,
    abbr          TEXT,
    conference    TEXT,
    division      TEXT
);

CREATE TABLE IF NOT EXISTS nhl_players (
    id              INT  PRIMARY KEY,
    full_name       TEXT NOT NULL,
    first_name      TEXT,
    last_name       TEXT,
    team_id         INT  REFERENCES nhl_teams(id),
    position        TEXT,
    shoots_catches  TEXT,
    sweater_number  INT,
    height_in       INT,
    weight_lbs      INT,
    birth_date      DATE,
    birth_city      TEXT,
    birth_country   TEXT,
    birth_state     TEXT,
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nhl_skater_stats (
    id                  SERIAL PRIMARY KEY,
    player_id           INT NOT NULL REFERENCES nhl_players(id),
    season              TEXT NOT NULL,
    games_played        INT,
    goals               INT,
    assists             INT,
    points              INT,
    plus_minus          INT,
    penalty_min         INT,
    shots               INT,
    shooting_pct        FLOAT,
    pp_goals            INT,
    pp_points           INT,
    sh_goals            INT,
    sh_points           INT,
    ev_goals            INT,
    ev_points           INT,
    gw_goals            INT,
    ot_goals            INT,
    toi_per_game        TEXT,
    points_per_game     FLOAT,
    faceoff_win_pct     FLOAT,
    team_abbrs          TEXT,
    UNIQUE (player_id, season)
);

CREATE TABLE IF NOT EXISTS nhl_goalie_stats (
    id                  SERIAL PRIMARY KEY,
    player_id           INT NOT NULL REFERENCES nhl_players(id),
    season              TEXT NOT NULL,
    games_played        INT,
    games_started       INT,
    wins                INT,
    losses              INT,
    ot_losses           INT,
    goals_against       INT,
    gaa                 FLOAT,
    saves               INT,
    shots_against       INT,
    save_pct            FLOAT,
    shutouts            INT,
    toi                 TEXT,
    penalty_min         INT,
    team_abbrs          TEXT,
    UNIQUE (player_id, season)
);
"""


def get_conn():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)


def safe_str(val) -> Optional[str]:
    """Extract default string from NHL API i18n dict or plain value."""
    if val is None:
        return None
    if isinstance(val, dict):
        return val.get("default") or val.get("en") or next(iter(val.values()), None)
    return str(val)


def main():
    client = NHLClient()
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(DDL)
    conn.commit()

    # ── 1. Teams ──────────────────────────────────────────────────────────────
    print("Loading teams...", flush=True)
    teams_raw = client.teams.teams()
    franchises = client.teams.franchises()
    # Build franchise_id → team mapping (teams() has abbr but not ID directly)
    # We'll use the roster call to get team IDs
    team_abbrs = [t["abbr"] for t in teams_raw]
    print(f"  {len(team_abbrs)} teams: {', '.join(team_abbrs)}")

    # ── 2. Rosters (bio data + team IDs) ──────────────────────────────────────
    print("\nFetching rosters for all 32 teams...", flush=True)
    all_bio: dict[int, dict] = {}   # player_id → bio dict
    team_id_map: dict[str, int] = {}  # abbr → first player's team id (we'll derive)

    # We need actual numeric team IDs — get from the NHL API standings or roster
    # players_by_team returns player IDs; we'll get team IDs from standings
    standings_raw = client.standings.league_standings(season=SEASON)
    team_info: dict[str, dict] = {}  # abbr → {id, full_name, conference, division}
    if isinstance(standings_raw, dict):
        standings_list = standings_raw.get("standings", standings_raw.get("data", []))
    else:
        standings_list = standings_raw or []

    for s in standings_list:
        abbr = s.get("teamAbbrev", {})
        abbr = safe_str(abbr) if isinstance(abbr, dict) else abbr
        name = s.get("teamName", {})
        name = safe_str(name) if isinstance(name, dict) else name
        tid  = s.get("teamId") or s.get("id")
        conf = s.get("conferenceName") or s.get("conference", {})
        div  = s.get("divisionName") or s.get("division", {})
        if abbr and tid:
            team_info[abbr] = {
                "id": tid, "full_name": name,
                "conference": safe_str(conf) if isinstance(conf, dict) else conf,
                "division":   safe_str(div)  if isinstance(div, dict) else div,
            }

    print(f"  Got {len(team_info)} teams from standings")

    # Insert teams
    for abbr, t in team_info.items():
        cur.execute("""
            INSERT INTO nhl_teams (id, full_name, abbr, conference, division)
            VALUES (%s,%s,%s,%s,%s)
            ON CONFLICT (id) DO UPDATE SET
              full_name=EXCLUDED.full_name, abbr=EXCLUDED.abbr,
              conference=EXCLUDED.conference, division=EXCLUDED.division
        """, (t["id"], t["full_name"] or abbr, abbr, t["conference"], t["division"]))
    conn.commit()

    # Fetch rosters for bio
    for abbr in team_abbrs:
        try:
            roster = client.players.players_by_team(team_abbr=abbr, season=SEASON)
            tid = team_info.get(abbr, {}).get("id")
            for group in ("forwards", "defensemen", "goalies"):
                for p in roster.get(group, []):
                    pid = p.get("id")
                    if not pid:
                        continue
                    all_bio[pid] = {
                        "id":            pid,
                        "first_name":    safe_str(p.get("firstName")),
                        "last_name":     safe_str(p.get("lastName")),
                        "full_name":     f"{safe_str(p.get('firstName', ''))} {safe_str(p.get('lastName', ''))}".strip(),
                        "team_id":       tid,
                        "position":      p.get("positionCode"),
                        "shoots_catches": p.get("shootsCatches"),
                        "sweater_number": p.get("sweaterNumber"),
                        "height_in":     p.get("heightInInches"),
                        "weight_lbs":    p.get("weightInPounds"),
                        "birth_date":    p.get("birthDate"),
                        "birth_city":    safe_str(p.get("birthCity")),
                        "birth_country": p.get("birthCountry"),
                        "birth_state":   safe_str(p.get("birthStateProvince")),
                    }
            print(f"  {abbr}: {sum(len(roster.get(g,[])) for g in ('forwards','defensemen','goalies'))} players", flush=True)
            time.sleep(0.15)
        except Exception as e:
            print(f"  [warn] {abbr} roster error: {e}")

    print(f"\nTotal bio records: {len(all_bio)}")

    # Insert players
    for bio in all_bio.values():
        cur.execute("""
            INSERT INTO nhl_players
              (id, full_name, first_name, last_name, team_id, position,
               shoots_catches, sweater_number, height_in, weight_lbs,
               birth_date, birth_city, birth_country, birth_state)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (id) DO UPDATE SET
              full_name=EXCLUDED.full_name, team_id=EXCLUDED.team_id,
              position=EXCLUDED.position, height_in=EXCLUDED.height_in,
              weight_lbs=EXCLUDED.weight_lbs, birth_date=EXCLUDED.birth_date,
              birth_country=EXCLUDED.birth_country, updated_at=now()
        """, (bio["id"], bio["full_name"], bio["first_name"], bio["last_name"],
              bio["team_id"], bio["position"], bio["shoots_catches"], bio["sweater_number"],
              bio["height_in"], bio["weight_lbs"], bio["birth_date"],
              bio["birth_city"], bio["birth_country"], bio["birth_state"]))
    conn.commit()
    print(f"Players inserted/updated: {len(all_bio)}")

    # ── 3. Skater stats ───────────────────────────────────────────────────────
    print("\nFetching skater stats...", flush=True)
    all_skaters = []
    start = 0
    while True:
        batch = client.stats.skater_stats_summary(
            start_season=SEASON, end_season=SEASON, start=start, limit=100
        )
        if not batch:
            break
        all_skaters.extend(batch)
        if len(batch) < 100:
            break
        start += 100
    print(f"  Total skaters: {len(all_skaters)}")

    skater_inserted = skater_new = 0
    for s in all_skaters:
        pid = s.get("playerId")
        if not pid:
            continue
        # Ensure player row exists (some players on traded/waived lists may not be in roster)
        if pid not in all_bio:
            cur.execute("""
                INSERT INTO nhl_players (id, full_name, last_name, position, shoots_catches)
                VALUES (%s,%s,%s,%s,%s)
                ON CONFLICT (id) DO NOTHING
            """, (pid, s.get("skaterFullName",""), s.get("lastName",""),
                  s.get("positionCode"), s.get("shootsCatches")))

        cur.execute("""
            INSERT INTO nhl_skater_stats
              (player_id, season, games_played, goals, assists, points, plus_minus,
               penalty_min, shots, shooting_pct, pp_goals, pp_points, sh_goals, sh_points,
               ev_goals, ev_points, gw_goals, ot_goals, toi_per_game, points_per_game,
               faceoff_win_pct, team_abbrs)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (player_id, season) DO UPDATE SET
              games_played=EXCLUDED.games_played, goals=EXCLUDED.goals,
              assists=EXCLUDED.assists, points=EXCLUDED.points,
              plus_minus=EXCLUDED.plus_minus, team_abbrs=EXCLUDED.team_abbrs
            RETURNING (xmax=0) AS is_insert
        """, (
            pid, str(s.get("seasonId",""))[:8],
            s.get("gamesPlayed"), s.get("goals"), s.get("assists"), s.get("points"),
            s.get("plusMinus"), s.get("penaltyMinutes"), s.get("shots"),
            s.get("shootingPct"), s.get("ppGoals"), s.get("ppPoints"),
            s.get("shGoals"), s.get("shPoints"), s.get("evGoals"), s.get("evPoints"),
            s.get("gameWinningGoals"), s.get("otGoals"), s.get("timeOnIcePerGame"),
            s.get("pointsPerGame"), s.get("faceoffWinPct"), s.get("teamAbbrevs"),
        ))
        row = cur.fetchone()
        if row and row["is_insert"]:
            skater_new += 1
        skater_inserted += 1
    conn.commit()
    print(f"  Skater stats: {skater_inserted} upserted ({skater_new} new)")

    # ── 4. Goalie stats ───────────────────────────────────────────────────────
    print("\nFetching goalie stats...", flush=True)
    all_goalies = []
    start = 0
    while True:
        batch = client.stats.goalie_stats_summary(
            start_season=SEASON, end_season=SEASON, start=start, limit=100
        )
        if not batch:
            break
        all_goalies.extend(batch)
        if len(batch) < 100:
            break
        start += 100
    print(f"  Total goalies: {len(all_goalies)}")

    goalie_new = 0
    for g in all_goalies:
        pid = g.get("playerId")
        if not pid:
            continue
        if pid not in all_bio:
            cur.execute("""
                INSERT INTO nhl_players (id, full_name, last_name, position, shoots_catches)
                VALUES (%s,%s,%s,'G',%s)
                ON CONFLICT (id) DO NOTHING
            """, (pid, g.get("goalieFullName",""), g.get("lastName",""), g.get("shootsCatches")))

        cur.execute("""
            INSERT INTO nhl_goalie_stats
              (player_id, season, games_played, games_started, wins, losses, ot_losses,
               goals_against, gaa, saves, shots_against, save_pct, shutouts,
               toi, penalty_min, team_abbrs)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (player_id, season) DO UPDATE SET
              games_played=EXCLUDED.games_played, wins=EXCLUDED.wins,
              gaa=EXCLUDED.gaa, save_pct=EXCLUDED.save_pct, shutouts=EXCLUDED.shutouts
            RETURNING (xmax=0) AS is_insert
        """, (
            pid, str(g.get("seasonId",""))[:8],
            g.get("gamesPlayed"), g.get("gamesStarted"), g.get("wins"),
            g.get("losses"), g.get("otLosses"), g.get("goalsAgainst"),
            g.get("goalsAgainstAverage"), g.get("saves"), g.get("shotsAgainst"),
            g.get("savePct"), g.get("shutouts"), g.get("timeOnIce"),
            g.get("penaltyMinutes"), g.get("teamAbbrevs"),
        ))
        row = cur.fetchone()
        if row and row["is_insert"]:
            goalie_new += 1
    conn.commit()
    print(f"  Goalie stats: {len(all_goalies)} upserted ({goalie_new} new)")

    # ── Summary ───────────────────────────────────────────────────────────────
    cur.execute("SELECT COUNT(*) n FROM nhl_teams");   teams_n = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) n FROM nhl_players"); players_n = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) n FROM nhl_skater_stats"); sk_n = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) n FROM nhl_goalie_stats");  go_n = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) n FROM nhl_players WHERE birth_date IS NOT NULL"); bio_n = cur.fetchone()["n"]

    print(f"\n{'='*50}")
    print(f"NHL DONE — Season {SEASON[:4]}-{SEASON[4:]}")
    print(f"  Teams:          {teams_n}")
    print(f"  Players:        {players_n} ({bio_n} with full bio)")
    print(f"  Skater stats:   {sk_n}")
    print(f"  Goalie stats:   {go_n}")
    print(f"{'='*50}")

    conn.close()


if __name__ == "__main__":
    main()
