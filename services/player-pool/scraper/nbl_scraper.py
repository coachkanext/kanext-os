#!/usr/bin/env python3
"""
NBL (Australian National Basketball League) Scraper
=====================================================
Source: prod.rosetta.nbl.com.au — NBL's first-party stats backend.
No Playwright required — direct JSON API with simple browser headers.

Endpoint:
  GET https://prod.rosetta.nbl.com.au/get/nbl/stats/leaders/for/season/id/{season_uuid}?limit=200
  Required headers: Referer: https://nbl.com.au/, Origin: https://nbl.com.au

Response structure:
  { type, fetched, ttlRemaining, count, source, data: [...154 records] }
  Each record: { player{id,first_name,last_name,playing_position,...},
                 team{id,name,team_code,...},
                 points_average, rebounds_average, assists_average,
                 steals_average, blocks_average, turnovers_average,
                 minutes_average, games, plus_minus_average,
                 field_goals_percentage, two_points_percentage,
                 three_points_percentage, free_throws_percentage, ... }

Writes to:
  proball_leagues     — ensures 'Australian NBL' exists (already seeded)
  proball_teams       — upserts all 10 NBL teams
  proball_players     — upserts all ~154 players
  proball_player_stats — upserts per-player season averages

Usage:
    python3 nbl_scraper.py
    python3 nbl_scraper.py --season 2025   # default
    python3 nbl_scraper.py --dry-run
"""
from __future__ import annotations

import argparse
import sys
import time
import os

import httpx
import psycopg
from psycopg.rows import dict_row

sys.path.insert(0, os.path.dirname(__file__))
from config import DB_CONFIG

# ── Config ────────────────────────────────────────────────────────────────────

LEAGUE_NAME   = "Australian NBL"
SEASON_LABEL  = "2024-25"      # internal season label (proball_player_stats.season)
SEASON_YEAR   = 2025           # NBL season year

# Season UUID baked into nbl.com.au HTML (data-season-id for 2025 season)
SEASON_UUID   = "450b0269-04d3-472b-8153-35ff02ac4278"

API_URL = (
    f"https://prod.rosetta.nbl.com.au/get/nbl/stats/leaders/for/season/id"
    f"/{SEASON_UUID}?limit=500"   # 500 > 154 players so we always get all
)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept":          "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer":         "https://nbl.com.au/stats/statistics",
    "Origin":          "https://nbl.com.au",
}

# ── DB helpers (mirrors proball_scraper.py pattern) ───────────────────────────

def get_or_create_league(conn) -> str:
    """Return the UUID for 'Australian NBL', creating if absent."""
    row = conn.execute(
        "SELECT id FROM proball_leagues WHERE name = %s", (LEAGUE_NAME,)
    ).fetchone()
    if row:
        return str(row["id"])
    row = conn.execute("""
        INSERT INTO proball_leagues (name, short_name, country, source)
        VALUES (%s, 'NBL', 'Australia', 'rosetta')
        ON CONFLICT (name) DO UPDATE SET source = EXCLUDED.source
        RETURNING id
    """, (LEAGUE_NAME,)).fetchone()
    conn.commit()
    return str(row["id"])


def upsert_team(conn, name: str, league_id: str, code: str) -> str:
    row = conn.execute("""
        INSERT INTO proball_teams (name, league_id, country, conference)
        VALUES (%s, %s, 'Australia', %s)
        ON CONFLICT (name, league_id) DO UPDATE SET
            country    = 'Australia',
            conference = COALESCE(EXCLUDED.conference, proball_teams.conference)
        RETURNING id
    """, (name, league_id, code)).fetchone()
    conn.commit()
    return str(row["id"])


def upsert_player(conn, source_id: str, full_name: str, team_id: str,
                  league_id: str, position: str | None) -> str:
    row = conn.execute("""
        INSERT INTO proball_players
            (source_player_id, full_name, team_id, league_id, position, nationality)
        VALUES (%s, %s, %s, %s, %s, 'Unknown')
        ON CONFLICT (source_player_id) DO UPDATE SET
            full_name  = EXCLUDED.full_name,
            team_id    = EXCLUDED.team_id,
            league_id  = EXCLUDED.league_id,
            position   = COALESCE(EXCLUDED.position, proball_players.position),
            updated_at = now()
        RETURNING id
    """, (source_id, full_name, team_id, league_id, position)).fetchone()
    conn.commit()
    return str(row["id"])


def upsert_stats(conn, player_id: str, league_id: str, rec: dict):
    def _f(k):
        v = rec.get(k)
        if v is None:
            return None
        try:
            return round(float(v), 4)
        except (ValueError, TypeError):
            return None

    conn.execute("""
        INSERT INTO proball_player_stats (
            player_id, league_id, season,
            gp, mpg, ppg, rpg, apg, spg, bpg, topg,
            fg_pct, two_pt_pct, three_pt_pct, ft_pct, plus_minus
        ) VALUES (%s,%s,%s, %s,%s,%s,%s,%s,%s,%s,%s, %s,%s,%s,%s,%s)
        ON CONFLICT (player_id, league_id, season) DO UPDATE SET
            gp           = EXCLUDED.gp,
            mpg          = EXCLUDED.mpg,
            ppg          = EXCLUDED.ppg,
            rpg          = EXCLUDED.rpg,
            apg          = EXCLUDED.apg,
            spg          = EXCLUDED.spg,
            bpg          = EXCLUDED.bpg,
            topg         = EXCLUDED.topg,
            fg_pct       = EXCLUDED.fg_pct,
            two_pt_pct   = EXCLUDED.two_pt_pct,
            three_pt_pct = EXCLUDED.three_pt_pct,
            ft_pct       = EXCLUDED.ft_pct,
            plus_minus   = EXCLUDED.plus_minus,
            updated_at   = now()
    """, (
        player_id, league_id, SEASON_LABEL,
        rec.get("games"),
        _f("minutes_average"),
        _f("points_average"),
        _f("rebounds_average"),
        _f("assists_average"),
        _f("steals_average"),
        _f("blocks_average"),
        _f("turnovers_average"),
        _f("field_goals_percentage"),
        _f("two_points_percentage"),
        _f("three_points_percentage"),
        _f("free_throws_percentage"),
        _f("plus_minus_average"),
    ))
    conn.commit()


# ── Fetch ─────────────────────────────────────────────────────────────────────

def fetch_stats() -> list[dict]:
    print(f"  Fetching: {API_URL}")
    r = httpx.get(API_URL, headers=HEADERS, timeout=30, follow_redirects=True)
    r.raise_for_status()
    body = r.json()
    records = body.get("data", body) if isinstance(body, dict) else body
    print(f"  {len(records)} player records received")
    return records


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    print(f"\n=== NBL Scraper — {SEASON_LABEL} ===")

    records = fetch_stats()
    if not records:
        print("No data returned — aborting.")
        sys.exit(1)

    if args.dry_run:
        print(f"\n[dry-run] Would insert {len(records)} players")
        for i, rec in enumerate(records[:5], 1):
            p = rec.get("player", {})
            t = rec.get("team", {})
            name = f"{p.get('first_name','')} {p.get('last_name','')}".strip()
            print(f"  {i:>3}. {name:<28} {t.get('name',''):<30} "
                  f"PPG={rec.get('points_average','-'):.1f} "
                  f"RPG={rec.get('rebounds_average','-'):.1f} "
                  f"APG={rec.get('assists_average','-'):.1f}")
        return

    with psycopg.connect(
        host=DB_CONFIG["host"], port=DB_CONFIG["port"], dbname=DB_CONFIG["dbname"],
        row_factory=dict_row, autocommit=False,
    ) as conn:

        league_id = get_or_create_league(conn)
        print(f"  League ID: {league_id}")

        # Collect unique teams first
        teams_seen: dict[str, str] = {}  # team_name → team_id
        for rec in records:
            t = rec.get("team", {})
            tname = t.get("name", "").strip()
            if tname and tname not in teams_seen:
                tid = upsert_team(conn, tname, league_id, t.get("team_code", ""))
                teams_seen[tname] = tid

        print(f"  Teams: {len(teams_seen)}")

        # Insert players + stats
        inserted = skipped = 0
        for rec in records:
            p = rec.get("player", {})
            t = rec.get("team", {})

            first = (p.get("first_name") or "").strip()
            last  = (p.get("last_name")  or "").strip()
            full_name = f"{first} {last}".strip()
            if not full_name:
                skipped += 1
                continue

            tname     = (t.get("name") or "").strip()
            team_id   = teams_seen.get(tname)
            pos       = p.get("playing_position") or None
            player_uuid = str(p.get("id") or "")
            source_id   = f"nbl-rosetta-{player_uuid}" if player_uuid else f"nbl-{full_name.lower().replace(' ','-')}"

            player_id = upsert_player(conn, source_id, full_name, team_id, league_id, pos)
            upsert_stats(conn, player_id, league_id, rec)
            inserted += 1

        print(f"  Players inserted/updated: {inserted} (skipped: {skipped})")

        # Summary
        r = conn.execute("""
            SELECT COUNT(DISTINCT p.id) AS players, COUNT(DISTINCT t.id) AS teams
            FROM proball_players p
            JOIN proball_teams t ON t.id = p.team_id
            WHERE p.league_id = %s
        """, (league_id,)).fetchone()
        print(f"\n  NBL DB total: {r['teams']} teams, {r['players']} players")

        # Top scorers
        top = conn.execute("""
            SELECT p.full_name, t.name AS team, s.ppg, s.rpg, s.apg, s.gp
            FROM proball_player_stats s
            JOIN proball_players p ON s.player_id = p.id
            JOIN proball_teams t   ON p.team_id   = t.id
            WHERE s.league_id = %s AND s.season = %s AND s.gp >= 5
            ORDER BY s.ppg DESC NULLS LAST LIMIT 5
        """, (league_id, SEASON_LABEL)).fetchall()
        if top:
            print(f"\n  Top scorers (min 5 GP):")
            for r in top:
                print(f"    {r['full_name']:<28} {r['team']:<28} "
                      f"PPG={r['ppg']:.1f} RPG={r['rpg']:.1f} APG={r['apg']:.1f} GP={r['gp']}")

    print("\nDone.")


if __name__ == "__main__":
    main()
