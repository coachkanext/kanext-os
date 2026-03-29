#!/usr/bin/env python3
"""
classify_d1_levels.py — Sub-classify NCAA D1 players into High / Mid / Low Major.

Current state: every D1 player has levelKey "ncaa_d1".
Target state:  levelKey is one of:
    ncaa_d1_high_major  — Power 4 (ACC, Big Ten, SEC, Big 12), Big East, legacy Pac-12
    ncaa_d1_mid_major   — AAC, A-10, Mountain West, WCC, MVC (per legends.ts anchor text)
    ncaa_d1_low_major   — all other D1 conferences

Classification is conference-based (pulled from existing player data / teams table).

Steps:
  1. Ensure the three sub-level rows exist in competitive_levels (DB).
  2. Update teams.competitive_level_id for all D1 teams based on conference.
  3. Patch data/national-pool.json in-place (fast, no re-export needed).

Usage:
    cd services/player-pool && python3 classify_d1_levels.py
"""

from __future__ import annotations

import json
import os
import sys

import psycopg

DB_DSN = "dbname=kanext_player_pool host=localhost port=5432"
JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "national-pool.json")

# ── Conference → Sub-Level Mapping ───────────────────────────────────────────
# Source: legends.ts anchor texts + standard D1 conference tier knowledge.

HIGH_MAJOR_CONFERENCES = {
    "Atlantic Coast Conference",    # ACC
    "Big Ten Conference",
    "Southeastern Conference",      # SEC
    "Big 12 Conference",
    "BIG EAST Conference",
    "Pac-12 Conference",            # legacy — schools now in ACC/Big Ten/Big 12
}

MID_MAJOR_CONFERENCES = {
    "American Conference",          # AAC
    "Atlantic 10 Conference",       # A-10
    "Mountain West Conference",
    "West Coast Conference",        # WCC
    "Missouri Valley Conference",   # MVC
}

# All other D1 conferences → ncaa_d1_low_major


def ensure_sublevels(conn: psycopg.Connection) -> dict[str, str]:
    """Insert the three sub-level rows if absent. Returns {level_key: uuid}."""
    cur = conn.cursor()

    # Pull reference data from the generic ncaa_d1 row
    cur.execute(
        "SELECT id, division_id FROM competitive_levels WHERE level_key = 'ncaa_d1'"
    )
    row = cur.fetchone()
    if not row:
        print("ERROR: 'ncaa_d1' not found in competitive_levels — run scrapers first.")
        sys.exit(1)
    _, division_id = row

    sublevels = [
        ("ncaa_d1_high_major", "NCAA D1 High-Major", 15),
        ("ncaa_d1_mid_major",  "NCAA D1 Mid-Major",  14),
        ("ncaa_d1_low_major",  "NCAA D1 Low-Major",  13),
    ]

    for level_key, display_name, tier in sublevels:
        cur.execute(
            """
            INSERT INTO competitive_levels (division_id, level_key, display_name, level_tier)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (level_key) DO NOTHING
            """,
            (division_id, level_key, display_name, tier),
        )

    conn.commit()

    # Return all four D1 level UUIDs
    cur.execute(
        "SELECT level_key, id FROM competitive_levels "
        "WHERE level_key IN ('ncaa_d1', 'ncaa_d1_high_major', 'ncaa_d1_mid_major', 'ncaa_d1_low_major')"
    )
    return {row[0]: str(row[1]) for row in cur.fetchall()}


def update_teams(conn: psycopg.Connection, level_ids: dict[str, str]) -> dict[str, int]:
    """Reclassify every team currently tagged ncaa_d1 to the correct sub-level."""
    cur = conn.cursor()
    d1_id = level_ids["ncaa_d1"]

    cur.execute(
        """
        SELECT t.id, t.name, c.name AS conf_name
        FROM teams t
        LEFT JOIN conferences c ON t.conference_id = c.id
        WHERE t.competitive_level_id = %s
        """,
        (d1_id,),
    )
    teams = cur.fetchall()

    counts: dict[str, int] = {
        "ncaa_d1_high_major": 0,
        "ncaa_d1_mid_major": 0,
        "ncaa_d1_low_major": 0,
    }

    for team_id, _team_name, conf_name in teams:
        if conf_name in HIGH_MAJOR_CONFERENCES:
            new_id = level_ids["ncaa_d1_high_major"]
            counts["ncaa_d1_high_major"] += 1
        elif conf_name in MID_MAJOR_CONFERENCES:
            new_id = level_ids["ncaa_d1_mid_major"]
            counts["ncaa_d1_mid_major"] += 1
        else:
            new_id = level_ids["ncaa_d1_low_major"]
            counts["ncaa_d1_low_major"] += 1

        cur.execute(
            "UPDATE teams SET competitive_level_id = %s WHERE id = %s",
            (new_id, team_id),
        )

    conn.commit()
    return counts


def update_json(json_path: str) -> dict[str, int]:
    """Patch levelKey / levelDisplay in national-pool.json in-place."""
    with open(json_path) as f:
        data = json.load(f)

    players = data["players"]
    counts: dict[str, int] = {
        "ncaa_d1_high_major": 0,
        "ncaa_d1_mid_major": 0,
        "ncaa_d1_low_major": 0,
    }

    for p in players:
        if p.get("levelKey") != "ncaa_d1":
            continue
        conf = p.get("conference", "")
        if conf in HIGH_MAJOR_CONFERENCES:
            p["levelKey"] = "ncaa_d1_high_major"
            p["levelDisplay"] = "NCAA D1 HM"
            counts["ncaa_d1_high_major"] += 1
        elif conf in MID_MAJOR_CONFERENCES:
            p["levelKey"] = "ncaa_d1_mid_major"
            p["levelDisplay"] = "NCAA D1 MM"
            counts["ncaa_d1_mid_major"] += 1
        else:
            p["levelKey"] = "ncaa_d1_low_major"
            p["levelDisplay"] = "NCAA D1 LM"
            counts["ncaa_d1_low_major"] += 1

    with open(json_path, "w") as f:
        json.dump(data, f, indent=None, default=str)

    return counts


def main() -> None:
    print("=== NCAA D1 Sub-Classification ===\n")

    # ── 1. Patch JSON (no DB needed, fast) ──────────────────────────────────
    print(f"Patching {JSON_PATH} ...")
    json_counts = update_json(JSON_PATH)
    total = sum(json_counts.values())
    print(f"  ncaa_d1_high_major : {json_counts['ncaa_d1_high_major']:>5} players")
    print(f"  ncaa_d1_mid_major  : {json_counts['ncaa_d1_mid_major']:>5} players")
    print(f"  ncaa_d1_low_major  : {json_counts['ncaa_d1_low_major']:>5} players")
    print(f"  Total reclassified : {total:>5} players")

    # ── 2. Update PostgreSQL ────────────────────────────────────────────────
    print(f"\nConnecting to {DB_DSN} ...")
    conn = psycopg.connect(DB_DSN)

    print("Ensuring sub-level rows in competitive_levels ...")
    level_ids = ensure_sublevels(conn)

    print("Updating teams.competitive_level_id ...")
    db_counts = update_teams(conn, level_ids)
    print(f"  ncaa_d1_high_major : {db_counts['ncaa_d1_high_major']:>5} teams")
    print(f"  ncaa_d1_mid_major  : {db_counts['ncaa_d1_mid_major']:>5} teams")
    print(f"  ncaa_d1_low_major  : {db_counts['ncaa_d1_low_major']:>5} teams")

    conn.close()
    print("\nDone. Re-run export_to_json.py to regenerate a fully clean export.")


if __name__ == "__main__":
    main()
