"""
Soccer Pro Player Pool Scraper
Source: ESPN site API + core API
Leagues: MLS, NWSL, Premier League, La Liga, Bundesliga, Serie A, Ligue 1
Loads: prosc_leagues, prosc_teams, prosc_players, prosc_player_stats

Usage:
    python3 soccer_scraper.py                    # all leagues
    python3 soccer_scraper.py usa.1              # MLS only
    python3 soccer_scraper.py eng.1 esp.1        # multiple leagues
    python3 soccer_scraper.py --leagues-only     # create league rows only
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
SEASON = 2024
API_DELAY = 0.3

ESPN_SITE = "https://site.api.espn.com/apis/site/v2/sports/soccer"
ESPN_CORE = "https://sports.core.api.espn.com/v2/sports/soccer/leagues"


# ── League definitions ────────────────────────────────────────────────────────

LEAGUES = {
    # ── Original 7 ────────────────────────────────────────────────────────────
    "usa.1":      {"name": "Major League Soccer",                   "country": "USA"},
    "usa.nwsl":   {"name": "National Women's Soccer League",        "country": "USA"},
    "eng.1":      {"name": "English Premier League",                "country": "England"},
    "esp.1":      {"name": "La Liga",                               "country": "Spain"},
    "ger.1":      {"name": "Bundesliga",                            "country": "Germany"},
    "ita.1":      {"name": "Serie A",                               "country": "Italy"},
    "fra.1":      {"name": "Ligue 1",                               "country": "France"},

    # ── Men's Top Flights ──────────────────────────────────────────────────────
    "mex.1":      {"name": "Liga MX",                               "country": "Mexico"},
    "ned.1":      {"name": "Eredivisie",                            "country": "Netherlands"},
    "por.1":      {"name": "Primeira Liga",                         "country": "Portugal"},
    "tur.1":      {"name": "Süper Lig",                             "country": "Turkey"},
    "sco.1":      {"name": "Scottish Premiership",                  "country": "Scotland"},
    "bel.1":      {"name": "Belgian Pro League",                    "country": "Belgium"},
    "arg.1":      {"name": "Argentine Primera División",            "country": "Argentina"},
    "bra.1":      {"name": "Brasileirão Série A",                   "country": "Brazil"},
    "col.1":      {"name": "Liga BetPlay Colombia",                 "country": "Colombia"},

    # ── Men's Second Divisions ─────────────────────────────────────────────────
    "eng.2":      {"name": "EFL Championship",                      "country": "England"},
    "eng.3":      {"name": "EFL League One",                        "country": "England"},
    "eng.4":      {"name": "EFL League Two",                        "country": "England"},
    "esp.2":      {"name": "La Liga 2",                             "country": "Spain"},
    "ita.2":      {"name": "Serie B",                               "country": "Italy"},
    "ger.2":      {"name": "2. Bundesliga",                         "country": "Germany"},
    "fra.2":      {"name": "Ligue 2",                               "country": "France"},
    "mex.2":      {"name": "Liga de Expansión MX",                  "country": "Mexico"},
    "bra.2":      {"name": "Brasileirão Série B",                   "country": "Brazil"},

    # ── US Development ─────────────────────────────────────────────────────────
    "usa.usl.1":  {"name": "USL Championship",                      "country": "USA"},
    "usa.usl.l1": {"name": "USL League One",                        "country": "USA"},
    "usa.mlsnp":  {"name": "MLS NEXT Pro",                          "country": "USA"},

    # ── Women's Pro ────────────────────────────────────────────────────────────
    "eng.w.1":    {"name": "Women's Super League",                  "country": "England"},
    "fra.w.1":    {"name": "D1 Féminine",                           "country": "France"},
    "ger.w.1":    {"name": "Frauen-Bundesliga",                      "country": "Germany"},
    "ita.w.1":    {"name": "Serie A Femminile",                     "country": "Italy"},
    "mex.w.1":    {"name": "Liga MX Femenil",                       "country": "Mexico"},
    "eng.w.2":    {"name": "Women's Championship England",          "country": "England"},
}


# ── Helpers ──────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row, autocommit=False)


def api_get(url: str) -> Optional[dict]:
    try:
        r = httpx.get(url, timeout=20)
        time.sleep(API_DELAY)
        if r.status_code == 200 and r.text not in ("", "{}", "null"):
            return r.json()
    except Exception as e:
        print(f"    [warn] {url[:80]}: {e}")
    return None


def safe_int(val) -> Optional[int]:
    try:
        if val is None or (isinstance(val, float) and math.isnan(val)):
            return None
        return int(float(str(val)))
    except (ValueError, TypeError):
        return None


def safe_float(val) -> Optional[float]:
    try:
        if val is None:
            return None
        return round(float(str(val)), 3)
    except (ValueError, TypeError):
        return None


def height_to_inches(h: Optional[float]) -> Optional[int]:
    """ESPN height is already in inches (float)."""
    if h is None:
        return None
    return int(h)


# ── Step 1: Leagues ───────────────────────────────────────────────────────────

def ensure_leagues(conn) -> dict[str, str]:
    """Upsert all soccer leagues. Returns {league_key: uuid}."""
    league_uuid: dict[str, str] = {}
    with conn.transaction():
        cur = conn.cursor()
        for key, info in LEAGUES.items():
            cur.execute("""
                INSERT INTO prosc_leagues (league_key, name, country)
                VALUES (%s, %s, %s)
                ON CONFLICT (league_key) DO UPDATE SET name=EXCLUDED.name, country=EXCLUDED.country
                RETURNING id
            """, (key, info["name"], info["country"]))
            row = cur.fetchone()
            league_uuid[key] = str(row["id"])
    print(f"  Leagues: {len(league_uuid)} upserted")
    return league_uuid


# ── Step 2: Teams ─────────────────────────────────────────────────────────────

def load_teams_for_league(conn, league_key: str, league_uuid: str) -> dict[str, str]:
    """Fetch teams for one league, upsert. Returns {espn_team_id: uuid}."""
    data = api_get(f"{ESPN_SITE}/{league_key}/teams?limit=100")
    if not data:
        print(f"    [warn] No teams found for {league_key}")
        return {}

    sports = data.get("sports", [{}])
    teams_raw = sports[0].get("leagues", [{}])[0].get("teams", [])
    team_uuid: dict[str, str] = {}

    with conn.transaction():
        cur = conn.cursor()
        for t in teams_raw:
            team = t.get("team", t)  # handle both {team: {...}} and direct
            espn_id = str(team.get("id", ""))
            if not espn_id:
                continue
            name = team.get("displayName") or team.get("name") or ""
            abbr = team.get("abbreviation") or ""
            location = team.get("location") or ""

            cur.execute("""
                INSERT INTO prosc_teams (espn_team_id, league_id, name, abbreviation, location)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (espn_team_id, league_id) DO UPDATE SET
                    name=EXCLUDED.name, abbreviation=EXCLUDED.abbreviation,
                    location=EXCLUDED.location
                RETURNING id
            """, (espn_id, league_uuid, name, abbr, location))
            row = cur.fetchone()
            team_uuid[espn_id] = str(row["id"])

    return team_uuid


# ── Step 3: Players ───────────────────────────────────────────────────────────

def load_players_for_league(
    conn,
    league_key: str,
    team_uuid: dict[str, str],   # espn_team_id → uuid
) -> dict[str, str]:
    """
    Fetch roster for each team in this league, upsert players.
    Returns {espn_player_id: uuid}.
    """
    player_uuid: dict[str, str] = {}
    inserted = updated = 0

    for espn_tid, tid_uuid in team_uuid.items():
        roster_url = f"{ESPN_SITE}/{league_key}/teams/{espn_tid}/roster"
        data = api_get(roster_url)
        if not data:
            continue

        athletes = data.get("athletes", [])

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

                # Nationality from citizenship / country
                nat_data = a.get("citizenship") or a.get("birthPlace", {})
                nationality = None
                if isinstance(nat_data, dict):
                    nationality = nat_data.get("country") or nat_data.get("name")
                elif isinstance(nat_data, str):
                    nationality = nat_data

                cur.execute("""
                    INSERT INTO prosc_players
                        (espn_player_id, full_name, position, height_inches, weight_lbs,
                         age, jersey_number, nationality, team_id)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (espn_player_id) DO UPDATE SET
                        full_name=EXCLUDED.full_name,
                        position=EXCLUDED.position,
                        height_inches=EXCLUDED.height_inches,
                        weight_lbs=EXCLUDED.weight_lbs,
                        age=EXCLUDED.age,
                        jersey_number=EXCLUDED.jersey_number,
                        nationality=EXCLUDED.nationality,
                        team_id=EXCLUDED.team_id,
                        updated_at=now()
                    RETURNING id, (xmax = 0) AS is_insert
                """, (espn_pid, name, pos, ht, wt, age, jersey, nationality, tid_uuid))
                r2 = cur.fetchone()
                player_uuid[espn_pid] = str(r2["id"])
                if r2["is_insert"]: inserted += 1
                else: updated += 1

    print(f"    Players: {inserted} new, {updated} updated ({len(player_uuid)} total)")
    return player_uuid


# ── Step 4: Stats ─────────────────────────────────────────────────────────────

def load_stats_for_league(
    conn,
    league_key: str,
    league_uuid: str,
    player_uuid: dict[str, str],
    team_uuid: dict[str, str],
):
    """
    Fetch per-team roster stats for this league.
    ESPN includes basic stats (goals, assists, etc.) in the roster response
    via athlete statistics references. We parse what's available.
    """
    # Map from player_id → stats dict
    stats_map: dict[str, dict] = {}

    for espn_tid in team_uuid:
        roster_url = f"{ESPN_SITE}/{league_key}/teams/{espn_tid}/roster"
        data = api_get(roster_url)
        if not data:
            continue
        athletes = data.get("athletes", [])
        for a in athletes:
            espn_pid = str(a.get("id", ""))
            if not espn_pid:
                continue

            stats_ref_list = [
                lnk for lnk in a.get("links", [])
                if "stats" in lnk.get("rel", [])
            ]
            # Parse embedded statistics if present
            stat_entry: dict = {}

            # Some ESPN roster responses include a statistics dict inline
            embedded = a.get("statistics", {})
            if embedded and isinstance(embedded, dict):
                splits = embedded.get("splits", {}).get("categories", [])
                for cat in splits:
                    for s in cat.get("stats", []):
                        stat_entry[s["name"]] = s.get("displayValue")

            if stat_entry:
                stats_map[espn_pid] = stat_entry

    # Also fetch from the core athletes statistics endpoint for known players
    # (only for players with refs in the leader boards)
    for espn_pid in list(player_uuid.keys()):
        if espn_pid in stats_map:
            continue
        stats_url = (
            f"{ESPN_CORE}/{league_key}/seasons/{SEASON}/types/2"
            f"/athletes/{espn_pid}/statistics/0"
        )
        data = api_get(stats_url)
        if not data:
            continue
        entry: dict = {}
        cats = data.get("splits", {}).get("categories", [])
        for cat in cats:
            for s in cat.get("stats", []):
                entry[s["name"]] = s.get("displayValue")
        if entry:
            stats_map[espn_pid] = entry

    print(f"    Stats map: {len(stats_map)} players with data")

    # Map ESPN stat field names → our columns
    # Soccer stat naming varies; map common ones
    FIELD_MAP = {
        "goals":           "goals",
        "goalAssists":     "assists",
        "assists":         "assists",
        "gamesPlayed":     "games",
        "gamesStarted":    "games_started",
        "minutesPlayed":   "minutes",
        "totalShots":      "shots",
        "shotsOnTarget":   "shots_on_target",
        "yellowCards":     "yellow_cards",
        "redCards":        "red_cards",
        # GK
        "saves":           "saves",
        "goalsAllowed":    "goals_allowed",
        "cleanSheets":     "clean_sheets",
        "savePct":         "save_pct",
    }

    inserted = updated = skipped = 0
    with conn.transaction():
        cur = conn.cursor()
        for espn_pid, entry in stats_map.items():
            if espn_pid not in player_uuid:
                skipped += 1
                continue
            pid = player_uuid[espn_pid]

            row_vals: dict = {}
            for espn_field, col in FIELD_MAP.items():
                raw = entry.get(espn_field)
                if raw is not None:
                    if col in ("save_pct",):
                        row_vals[col] = safe_float(raw)
                    else:
                        row_vals[col] = safe_int(raw)

            if not row_vals:
                skipped += 1
                continue

            cur.execute("""
                INSERT INTO prosc_player_stats (
                    player_id, league_id, season,
                    games, games_started, minutes,
                    goals, assists, yellow_cards, red_cards,
                    shots, shots_on_target,
                    saves, goals_allowed, clean_sheets, save_pct
                ) VALUES (
                    %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
                )
                ON CONFLICT (player_id, league_id, season) DO UPDATE SET
                    games=COALESCE(EXCLUDED.games, prosc_player_stats.games),
                    games_started=COALESCE(EXCLUDED.games_started, prosc_player_stats.games_started),
                    minutes=COALESCE(EXCLUDED.minutes, prosc_player_stats.minutes),
                    goals=COALESCE(EXCLUDED.goals, prosc_player_stats.goals),
                    assists=COALESCE(EXCLUDED.assists, prosc_player_stats.assists),
                    yellow_cards=COALESCE(EXCLUDED.yellow_cards, prosc_player_stats.yellow_cards),
                    red_cards=COALESCE(EXCLUDED.red_cards, prosc_player_stats.red_cards),
                    shots=COALESCE(EXCLUDED.shots, prosc_player_stats.shots),
                    shots_on_target=COALESCE(EXCLUDED.shots_on_target, prosc_player_stats.shots_on_target),
                    saves=COALESCE(EXCLUDED.saves, prosc_player_stats.saves),
                    goals_allowed=COALESCE(EXCLUDED.goals_allowed, prosc_player_stats.goals_allowed),
                    clean_sheets=COALESCE(EXCLUDED.clean_sheets, prosc_player_stats.clean_sheets),
                    save_pct=COALESCE(EXCLUDED.save_pct, prosc_player_stats.save_pct)
                RETURNING id, (xmax = 0) AS is_insert
            """, (
                pid, league_uuid, SEASON,
                row_vals.get("games"), row_vals.get("games_started"), row_vals.get("minutes"),
                row_vals.get("goals"), row_vals.get("assists"),
                row_vals.get("yellow_cards"), row_vals.get("red_cards"),
                row_vals.get("shots"), row_vals.get("shots_on_target"),
                row_vals.get("saves"), row_vals.get("goals_allowed"),
                row_vals.get("clean_sheets"), row_vals.get("save_pct"),
            ))
            r2 = cur.fetchone()
            if r2["is_insert"]: inserted += 1
            else: updated += 1

    print(f"    Stats: {inserted} inserted, {updated} updated, {skipped} skipped")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]
    if "--leagues-only" in args:
        conn = get_conn()
        try:
            ensure_leagues(conn)
        finally:
            conn.close()
        return

    # Determine which leagues to process
    if args:
        target_keys = [a for a in args if not a.startswith("--")]
        invalid = [k for k in target_keys if k not in LEAGUES]
        if invalid:
            print(f"Unknown league keys: {invalid}")
            print(f"Valid: {list(LEAGUES.keys())}")
            sys.exit(1)
    else:
        target_keys = list(LEAGUES.keys())

    conn = get_conn()
    try:
        print("\n[1] Ensuring soccer leagues ...")
        league_uuid = ensure_leagues(conn)

        for league_key in target_keys:
            lname = LEAGUES[league_key]["name"]
            luid = league_uuid[league_key]
            print(f"\n=== {lname} ({league_key}) ===")

            print(f"  [teams] Loading ...")
            team_uuid = load_teams_for_league(conn, league_key, luid)
            print(f"  {len(team_uuid)} teams")

            print(f"  [players] Loading ...")
            player_uuid = load_players_for_league(conn, league_key, team_uuid)

            print(f"  [stats] Loading ...")
            load_stats_for_league(conn, league_key, luid, player_uuid, team_uuid)

        # Summary
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) AS n FROM prosc_leagues")
        nl = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) AS n FROM prosc_teams")
        nt = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) AS n FROM prosc_players")
        np_ = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) AS n FROM prosc_player_stats")
        ns = cur.fetchone()["n"]
        print(f"\n=== Soccer done: {nl} leagues, {nt} teams, {np_} players, {ns} stat rows ===")

    finally:
        conn.close()


if __name__ == "__main__":
    main()
