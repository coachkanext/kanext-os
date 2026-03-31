#!/usr/bin/env python3
"""
KaNeXT NCAA Universal Data Loader
Source: https://github.com/henrygd/ncaa-api (ncaa.com wrapper)

Loads standings + statistical leaders for all NCAA sports × all divisions
into the kanext_player_pool database (ncaa_* tables + sport-specific stat tables).

Usage:
    python3 ncaa_loader.py seed                 # seed competitive levels
    python3 ncaa_loader.py standings <sport>    # load standings (teams/conferences)
    python3 ncaa_loader.py stats <sport>        # load stat leaders
    python3 ncaa_loader.py all <sport>          # standings + stats
    python3 ncaa_loader.py discover <sport>     # scan valid stat IDs
    python3 ncaa_loader.py all_sports           # all sports, all divisions

Sports: basketball-men, basketball-women, football, baseball, softball,
        soccer-men, soccer-women, volleyball-women

Self-hosted API (no rate limit):
    docker run --rm -p 3000:3000 henrygd/ncaa-api
    Set NCAA_API_BASE=http://localhost:3000 and NCAA_API_KEY=''
"""

import sys
import time
import json
import os
from typing import Optional
from collections import defaultdict

import httpx
import psycopg
from psycopg.rows import dict_row

# ── Config ────────────────────────────────────────────────────────────────────

NCAA_API_BASE = os.environ.get("NCAA_API_BASE", "https://ncaa-api.henrygd.me")
NCAA_API_KEY  = os.environ.get("NCAA_API_KEY", "")  # set if NCAA_HEADER_KEY used on server
API_DELAY     = float(os.environ.get("NCAA_API_DELAY", "0.22"))  # 4.5 req/sec on public

SEASON = "2024-25"

DB_CONFIG = {
    "host":   "localhost",
    "port":   5432,
    "dbname": "kanext_player_pool",
}

# ── Known stat category IDs (from API scan) ───────────────────────────────────

# Format: sport_code → {stat_id: {title, cols, table, col_map}}
# col_map: API column name → DB column name (None = skip)
STATS = {
    "basketball-men": {
        # Divisions: d1, d2, d3
        # All division stat IDs are the same
        136: {
            "title": "Points Per Game",
            "table": None,  # merged into wbb/mbb player stats via upsert
            "cols":  ["G", "FGM", "3FG", "FT", "PTS", "PPG"],
            "map":   {"G": "games", "PTS": "points", "PPG": "ppg",
                      "FGM": None, "3FG": None, "FT": None},
        },
        137: {
            "title": "Rebounds Per Game",
            "cols":  ["G", "REB", "RPG"],
            "map":   {"REB": "rebounds", "RPG": "rpg"},
        },
        138: {
            "title": "Blocks Per Game",
            "cols":  ["G", "BLKS", "BKPG"],
            "map":   {"BLKS": "blocks", "BKPG": "bpg"},
        },
        139: {
            "title": "Steals Per Game",
            "cols":  ["G", "ST", "STPG"],
            "map":   {"ST": "steals", "STPG": "spg"},
        },
        140: {
            "title": "Assists Per Game",
            "cols":  ["G", "AST", "APG"],
            "map":   {"AST": "assists", "APG": "apg"},
        },
        141: {
            "title": "Field Goal Percentage",
            "cols":  ["FGM", "FGA", "FG%"],
            "map":   {"FG%": "fg_pct"},
        },
        142: {
            "title": "Free Throw Percentage",
            "cols":  ["FT", "FTA", "FT%"],
            "map":   {"FT%": "ft_pct"},
        },
        143: {
            "title": "Three Point Percentage",
            "cols":  ["3FG", "3FGA", "3FG%"],
            "map":   {"3FG%": "three_pt_pct"},
        },
        144: {
            "title": "Three Pointers Per Game",
            "cols":  ["3FG", "3PG"],
            "map":   {"3PG": "three_pt_pg"},
        },
    },
    "basketball-women": {
        # IDs differ from basketball-men (102-110)
        102: {"title": "Points Per Game",        "map": {"G":"games","PTS":"points","PPG":"ppg"}},
        103: {"title": "Rebounds Per Game",       "map": {"REB":"rebounds","RPG":"rpg"}},
        104: {"title": "Blocks Per Game",         "map": {"BLKS":"blocks","BKPG":"bpg"}},
        105: {"title": "Steals Per Game",         "map": {"ST":"steals","STPG":"spg"}},
        106: {"title": "Assists Per Game",        "map": {"AST":"assists","APG":"apg"}},
        107: {"title": "Field Goal Percentage",   "map": {"FG%":"fg_pct"}},
        108: {"title": "Free Throw Percentage",   "map": {"FT%":"ft_pct"}},
        109: {"title": "Three Point Percentage",  "map": {"3FG%":"three_pt_pct"}},
        110: {"title": "Three Pointers Per Game", "map": {"3PG":"three_pt_pg"}},
    },
    "football": {
        # Divisions: fbs, fcs (d2/d3 may return 500 on public API)
        7:  {"title": "Rushing Yards Per Game",   "map": {"Rush":"rush_att","Rush Yds":"rush_yards","Rush TD":"rush_td","YPG":"rush_ypg"}},
        8:  {"title": "Passing Efficiency",       "map": {"Pass Att":"pass_att","Pass Com":"pass_comp","Pass Yds":"pass_yards","Pass TD":"pass_td","Int":"pass_int","Pass Eff":"pass_eff"}},
        11: {"title": "Total Offense",            "map": {"Plays":"plays","YDS":"total_yards","YPG":"total_ypg"}},
        12: {"title": "Receptions Per Game",      "map": {"Rec":"receptions","Rec Yds":"rec_yards","Rec TD":"rec_td","Rec PG":"rec_pg"}},
        13: {"title": "Receiving Yards Per Game", "map": {"Rec":"receptions","Rec Yds":"rec_yards","YdsPg":"rec_ypg"}},
        14: {"title": "Interceptions Per Game",   "map": {"Int":"int_count","Int Ret Yds":"int_yards","Int Ret TDs":"int_td"}},
        15: {"title": "Punt Returns",             "map": {}},   # no mapped cols
        16: {"title": "Kickoff Returns",          "map": {}},   # no mapped cols
        17: {"title": "Punting",                  "map": {}},   # no mapped cols
        18: {"title": "Field Goals Per Game",     "map": {"FG":"fg_made","FGA":"fg_att","Pct":"fg_pct"}},
        19: {"title": "Scoring",                  "map": {"TDs":"tds","Pts":"points","PPG":"ppg"}},
        20: {"title": "All Purpose",              "map": {}},   # no mapped cols
        34: {"title": "Total Tackles",            "map": {"TOT":"tackles","SOLO":"solo_tackles","AST":"ast_tackles"}},
        35: {"title": "Solo Tackles",             "map": {"SOLO":"solo_tackles"}},
        36: {"title": "Sacks",                    "map": {"SACKS":"sacks","SACKYDS":"sack_yards"}},
        37: {"title": "Forced Fumbles",           "map": {"FF":"forced_fumbles"}},
        38: {"title": "Passes Defended",          "map": {"PD":"passes_defended"}},
        39: {"title": "Tackles For Loss",         "map": {"TFL":"tfl","TFLYDS":"tfl_yards"}},
    },
    "baseball": {
        200: {"title": "Batting Average",     "table": "bb_player_batting_stats",  "map": {"AB":"at_bats","H":"hits","BA":"batting_avg"}},
        201: {"title": "HR Per Game",         "table": "bb_player_batting_stats",  "map": {"HR":"home_runs"}},
        202: {"title": "RBI Per Game",        "table": "bb_player_batting_stats",  "map": {"RBI":"rbi"}},
        203: {"title": "Doubles Per Game",    "table": "bb_player_batting_stats",  "map": {"2B":"doubles"}},
        204: {"title": "Triples Per Game",    "table": "bb_player_batting_stats",  "map": {"3B":"triples"}},
        205: {"title": "ERA",                 "table": "bb_player_pitching_stats", "map": {"ERA":"era","IP":"innings_pitched","W":"wins","L":"losses","H":"hits_allowed","BB":"walks","SO":"strikeouts"}},
        206: {"title": "SB Per Game",         "table": "bb_player_batting_stats",  "map": {"SB":"stolen_bases"}},
        207: {"title": "Strikeouts Per 9",    "table": "bb_player_pitching_stats", "map": {"SO":"strikeouts","K/9":"k_per_9"}},
        208: {"title": "Victories",           "table": "bb_player_pitching_stats", "map": {"W":"wins"}},
        209: {"title": "Saves",               "table": "bb_player_pitching_stats", "map": {"SV":"saves"}},
    },
    "softball": {
        271: {"title": "Batting Average",     "table": "sb_player_batting_stats",  "map": {"AB":"at_bats","H":"hits","BA":"batting_avg"}},
        272: {"title": "HR Per Game",         "table": "sb_player_batting_stats",  "map": {"HR":"home_runs"}},
        273: {"title": "RBI Per Game",        "table": "sb_player_batting_stats",  "map": {"RBI":"rbi"}},
        274: {"title": "Doubles Per Game",    "table": "sb_player_batting_stats",  "map": {"2B":"doubles"}},
        275: {"title": "Triples Per Game",    "table": "sb_player_batting_stats",  "map": {"3B":"triples"}},
        276: {"title": "ERA",                 "table": "sb_player_pitching_stats", "map": {"ERA":"era","IP":"innings_pitched","W":"wins","L":"losses","BB":"walks","SO":"strikeouts"}},
        277: {"title": "SB Per Game",         "table": "sb_player_batting_stats",  "map": {"SB":"stolen_bases"}},
        278: {"title": "Strikeouts Per 7",    "table": "sb_player_pitching_stats", "map": {"SO":"strikeouts","K/7":"k_per_7"}},
        279: {"title": "Victories",           "table": "sb_player_pitching_stats", "map": {"W":"wins"}},
        280: {"title": "Saves",               "table": "sb_player_pitching_stats", "map": {"SV":"saves"}},
    },
    "soccer-men": {
        4:  {"title": "Points Per Game",      "map": {"G":"goals","A":"assists","Pts":"points","Pts/G":"goals_per_game"}},
        5:  {"title": "Goals Per Game",       "map": {"G":"goals","G/Gm":"goals_per_game","SOG":"shots_on_goal"}},
        6:  {"title": "Assists Per Game",     "map": {"A":"assists"}},
        9:  {"title": "Goals Against Avg",    "map": {"GA":"goals_allowed","GAA":"gaa","SV%":"save_pct","Shutouts":"shutouts"}},
        10: {"title": "Saves Per Game",       "map": {"SV":"saves","SV/Gm":"saves_pg"}},
    },
    "soccer-women": {
        52: {"title": "Points Per Game",      "map": {"G":"goals","A":"assists","Pts":"points"}},
        53: {"title": "Goals Per Game",       "map": {"G":"goals","G/Gm":"goals_per_game"}},
        54: {"title": "Saves Per Game",       "map": {"SV":"saves","SV%":"save_pct"}},
        55: {"title": "Goals Against Avg",    "map": {"GA":"goals_allowed","GAA":"gaa","Shutouts":"shutouts"}},
        57: {"title": "Assists Per Game",     "map": {"A":"assists"}},
    },
    "volleyball-women": {
        1:  {"title": "Hitting Percentage",   "map": {"K":"kills","E":"errors","TA":"attacks","Pct":"attack_pct"}},
        2:  {"title": "Kills Per Set",        "map": {"K":"kills","S":"sets_played","K/S":"kills_per_set"}},
        3:  {"title": "Assists Per Set",      "map": {"A":"assists","A/S":"assists_per_set"}},
        42: {"title": "Aces Per Set",         "map": {"SA":"service_aces","SE":"service_errors","SA/S":"aces_per_set"}},
        43: {"title": "Blocks Per Set",       "map": {"BS":"solo_blocks","BA":"block_assists","TB":"total_blocks","B/S":"blocks_per_set"}},
        44: {"title": "Digs Per Set",         "map": {"D":"digs","D/S":"digs_per_set"}},
    },
}

# Division codes per sport
SPORT_DIVISIONS = {
    "basketball-men":    ["d1", "d2", "d3"],
    "basketball-women":  ["d1", "d2", "d3"],
    "football":          ["fbs", "fcs", "d2", "d3"],
    "baseball":          ["d1", "d2", "d3"],
    "softball":          ["d1", "d2", "d3"],
    "soccer-men":        ["d1", "d2", "d3"],
    "soccer-women":      ["d1", "d2", "d3"],
    "volleyball-women":  ["d1", "d2", "d3"],
}

# sport_code enum value mapping
SPORT_CODE_MAP = {
    "basketball-men":   "mbb",
    "basketball-women": "wbb",
    "football":         "football",
    "baseball":         "baseball",
    "softball":         "softball",
    "soccer-men":       "soccer_m",
    "soccer-women":     "soccer_w",
    "volleyball-women": "volleyball_w",
}

# stat table per sport_code
STAT_TABLE_MAP = {
    "mbb":          "mbb_player_stats",
    "wbb":          "wbb_player_stats",
    "football":     "football_player_stats",  # ncaa_ football (all divs; fb_ has FBS/FCS from ESPN)
    "baseball":     None,   # per-stat: bb_player_batting_stats / bb_player_pitching_stats
    "softball":     None,   # per-stat: sb_player_batting_stats / sb_player_pitching_stats
    "soccer_m":     "sc_player_stats",
    "soccer_w":     "wsc_player_stats",
    "volleyball_w": "wvb_player_stats",
}

# Lambda (competitive weight) per level_key
LAMBDA_MAP = {
    "mbb_d1": 1.6, "mbb_d2": 1.0, "mbb_d3": 0.7,
    "wbb_d1": 1.6, "wbb_d2": 1.0, "wbb_d3": 0.7,
    "football_fbs": 1.65, "football_fcs": 1.1, "football_d2": 0.85, "football_d3": 0.65,
    "baseball_d1": 1.5, "baseball_d2": 1.0, "baseball_d3": 0.7,
    "softball_d1": 1.5, "softball_d2": 1.0, "softball_d3": 0.7,
    "soccer_m_d1": 1.5, "soccer_m_d2": 1.0, "soccer_m_d3": 0.7,
    "soccer_w_d1": 1.5, "soccer_w_d2": 1.0, "soccer_w_d3": 0.7,
    "volleyball_w_d1": 1.5, "volleyball_w_d2": 1.0, "volleyball_w_d3": 0.7,
}

TIER_MAP = {
    "d1": 10, "d2": 6, "d3": 4, "fbs": 15, "fcs": 11,
}


# ── API helpers ───────────────────────────────────────────────────────────────

def _api_headers():
    h = {"User-Agent": "KaNeXT/1.0"}
    if NCAA_API_KEY:
        h["x-ncaa-key"] = NCAA_API_KEY
    return h


def api_get(path: str) -> Optional[dict]:
    """GET {NCAA_API_BASE}/{path}, return JSON or None."""
    url = f"{NCAA_API_BASE}/{path.lstrip('/')}"
    try:
        r = httpx.get(url, headers=_api_headers(), timeout=30, follow_redirects=True)
        time.sleep(API_DELAY)
        if r.status_code == 200:
            return r.json()
        # 500 often means division not supported for this sport
        if r.status_code not in (404, 500):
            print(f"    API {r.status_code}: {url}")
        return None
    except Exception as e:
        print(f"    API error ({e}): {url}")
        return None


# ── DB helpers ────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg.connect(
        host=DB_CONFIG["host"],
        port=DB_CONFIG["port"],
        dbname=DB_CONFIG["dbname"],
        row_factory=dict_row,
        autocommit=False,
    )


def safe_int(v) -> Optional[int]:
    try:
        return int(float(v)) if v not in (None, "", "–", "-") else None
    except (ValueError, TypeError):
        return None


def safe_float(v) -> Optional[float]:
    try:
        return float(v) if v not in (None, "", "–", "-") else None
    except (ValueError, TypeError):
        return None


# ── Step 0: Seed competitive levels ──────────────────────────────────────────

def seed_levels(conn):
    """Insert all sport × division combinations into ncaa_competitive_levels."""
    inserted = 0
    for sport_key, divs in SPORT_DIVISIONS.items():
        sport_code = SPORT_CODE_MAP[sport_key]
        for div in divs:
            level_key = f"{sport_code}_{div}"
            display = f"{sport_key.replace('-', ' ').title()} {div.upper()}"
            lam = LAMBDA_MAP.get(level_key, 1.0)
            tier = TIER_MAP.get(div, 5)
            conn.execute(
                """
                INSERT INTO ncaa_competitive_levels
                    (sport, level_key, division, display_name, lambda, level_tier)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (level_key) DO UPDATE SET
                    display_name=EXCLUDED.display_name,
                    lambda=EXCLUDED.lambda,
                    level_tier=EXCLUDED.level_tier
                """,
                (sport_code, level_key, div, display, lam, tier),
            )
            inserted += 1
    conn.commit()
    print(f"  ✓ {inserted} competitive levels seeded")


# ── Step 1: Load standings → teams + conferences ──────────────────────────────

def load_standings(conn, sport_key: str):
    """
    Fetch /standings/{sport}/{division} for each division and upsert
    ncaa_conferences + ncaa_teams.
    Returns total team count.
    """
    sport_code = SPORT_CODE_MAP[sport_key]
    divs = SPORT_DIVISIONS[sport_key]
    total_teams = 0

    for div in divs:
        level_key = f"{sport_code}_{div}"
        level_id = conn.execute(
            "SELECT id FROM ncaa_competitive_levels WHERE level_key=%s", (level_key,)
        ).fetchone()
        if not level_id:
            print(f"    Level {level_key} not seeded — run 'seed' first")
            continue
        level_id = str(level_id["id"])

        data = api_get(f"standings/{sport_key}/{div}")
        if not data:
            print(f"    No standings for {sport_key}/{div}")
            continue

        confs = data.get("data", [])
        div_teams = 0
        for conf_entry in confs:
            conf_name = conf_entry.get("conference", "").strip()
            if not conf_name or conf_name == "ALL CONFERENCES":
                continue

            # Upsert conference
            existing_conf = conn.execute(
                "SELECT id FROM ncaa_conferences WHERE level_id=%s AND name=%s",
                (level_id, conf_name),
            ).fetchone()
            if existing_conf:
                conf_id = str(existing_conf["id"])
            else:
                row = conn.execute(
                    "INSERT INTO ncaa_conferences (level_id, name) VALUES (%s, %s) RETURNING id",
                    (level_id, conf_name),
                ).fetchone()
                conf_id = str(row["id"])

            # Upsert teams
            for team_entry in conf_entry.get("standings", []):
                school = team_entry.get("School", "").strip()
                if not school:
                    continue
                conf_w = safe_int(team_entry.get("Conference W"))
                conf_l = safe_int(team_entry.get("Conference L"))
                ovr_w  = safe_int(team_entry.get("Overall W"))
                ovr_l  = safe_int(team_entry.get("Overall L"))

                conn.execute(
                    """
                    INSERT INTO ncaa_teams
                        (conference_id, name, wins, losses, conf_wins, conf_losses, season)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (conference_id, name, season) DO UPDATE SET
                        wins=EXCLUDED.wins, losses=EXCLUDED.losses,
                        conf_wins=EXCLUDED.conf_wins, conf_losses=EXCLUDED.conf_losses
                    """,
                    (conf_id, school, ovr_w, ovr_l, conf_w, conf_l, SEASON),
                )
                div_teams += 1

        conn.commit()
        print(f"  {sport_key}/{div}: {div_teams} teams loaded")
        total_teams += div_teams

    return total_teams


# ── Step 2: Load stat leaders ─────────────────────────────────────────────────

def _upsert_player(conn, name: str, sport_code: str, team_name: str,
                   div: str, position: str, class_year: str, height: str) -> Optional[str]:
    """
    Find or create ncaa_players row. Matches by (full_name, sport, season).
    Tries to link to ncaa_teams by name + sport level.
    Returns player UUID.
    """
    season = SEASON
    level_key = f"{sport_code}_{div}"

    # Find team_id
    team_id = None
    if team_name:
        row = conn.execute(
            """
            SELECT t.id FROM ncaa_teams t
            JOIN ncaa_conferences c ON c.id = t.conference_id
            JOIN ncaa_competitive_levels cl ON cl.id = c.level_id
            WHERE t.name=%s AND cl.level_key=%s AND t.season=%s
            LIMIT 1
            """,
            (team_name, level_key, season),
        ).fetchone()
        if row:
            team_id = str(row["id"])

    # Try nickname/partial match if exact fails
    if not team_id and team_name:
        # NCAA abbreviates team names (e.g. 'UNC' for North Carolina)
        row = conn.execute(
            """
            SELECT t.id FROM ncaa_teams t
            JOIN ncaa_conferences c ON c.id = t.conference_id
            JOIN ncaa_competitive_levels cl ON cl.id = c.level_id
            WHERE t.name ILIKE %s AND cl.sport=%s::sport_code AND t.season=%s
            LIMIT 1
            """,
            (f"%{team_name}%", sport_code, season),
        ).fetchone()
        if row:
            team_id = str(row["id"])

    existing = conn.execute(
        "SELECT id FROM ncaa_players WHERE full_name=%s AND sport=%s::sport_code AND season=%s",
        (name, sport_code, season),
    ).fetchone()
    if existing:
        pid = str(existing["id"])
        # Update team_id if we now have it
        if team_id:
            conn.execute("UPDATE ncaa_players SET team_id=%s, updated_at=now() WHERE id=%s",
                         (team_id, pid))
        return pid

    row = conn.execute(
        """
        INSERT INTO ncaa_players
            (full_name, sport, team_id, season, position, class_year, height)
        VALUES (%s, %s::sport_code, %s, %s, %s, %s, %s)
        RETURNING id
        """,
        (name, sport_code, team_id, season, position or None,
         class_year or None, height or None),
    ).fetchone()
    return str(row["id"])


def _upsert_stat_row(conn, table: str, player_id: str, col_vals: dict):
    """INSERT ... ON CONFLICT DO UPDATE for a flat stat row."""
    if not col_vals:
        return
    cols = list(col_vals.keys())
    vals = [col_vals[c] for c in cols]
    placeholders = ", ".join(["%s"] * len(cols))
    update_clause = ", ".join(f"{c}=EXCLUDED.{c}" for c in cols)
    conn.execute(
        f"""
        INSERT INTO {table} (player_id, {', '.join(cols)})
        VALUES (%s, {placeholders})
        ON CONFLICT (player_id) DO UPDATE SET {update_clause}
        """,
        [player_id] + vals,
    )


def load_stats(conn, sport_key: str):
    """
    Fetch ALL pages of every stat category for the sport.
    Paginates through all pages (response includes 'page' and 'pages' fields).
    Returns (players_upserted, stat_rows_upserted).
    """
    sport_code = SPORT_CODE_MAP[sport_key]
    stat_defs = STATS.get(sport_key, {})
    divs = SPORT_DIVISIONS[sport_key]

    if not stat_defs:
        print(f"  No stat IDs configured for {sport_key} — run 'discover {sport_key}' first")
        return 0, 0

    default_stat_table = STAT_TABLE_MAP.get(sport_code)
    total_players = 0
    total_stats = 0

    # Aggregate stats per (name, team, div, table) — two-way players get both tables
    player_stats: dict[tuple, dict] = defaultdict(dict)
    player_meta: dict[tuple, dict] = {}  # keyed by (name, team, div)

    for div in divs:
        div_api_rows = 0
        for stat_id, stat_def in stat_defs.items():
            col_map     = stat_def.get("map", {})
            entry_table = stat_def.get("table") or default_stat_table
            page        = 1
            total_pages = 1  # updated after first response

            while page <= total_pages:
                path = f"stats/{sport_key}/{div}/current/individual/{stat_id}?page={page}"
                data = api_get(path)
                if not data or not data.get("data"):
                    break

                rows        = data["data"]
                total_pages = data.get("pages", 1)
                title       = data.get("title", str(stat_id))

                if page == 1:
                    print(f"    {sport_key}/{div}/{stat_id} ({title}): {total_pages} pages", flush=True)

                div_api_rows += len(rows)

                for row in rows:
                    name = row.get("Name", "").strip()
                    team = row.get("Team", "").strip()
                    pos  = row.get("Position", "")
                    cl   = row.get("Cl", "")
                    ht   = row.get("Height", "")
                    if not name:
                        continue

                    meta_key = (name, team, div)
                    player_meta[meta_key] = {"position": pos, "class_year": cl, "height": ht}

                    if not entry_table:
                        continue

                    stat_key = (name, team, div, entry_table)
                    for api_col, db_col in col_map.items():
                        if db_col is None:
                            continue
                        val = row.get(api_col)
                        if val is not None and val not in ("", "–", "-"):
                            if "pct" in db_col or "pg" in db_col or "avg" in db_col or "era" in db_col:
                                player_stats[stat_key][db_col] = safe_float(val)
                            else:
                                player_stats[stat_key][db_col] = safe_int(val) or safe_float(val)

                page += 1

        print(f"  {sport_key}/{div}: {div_api_rows} API rows fetched, writing to DB...", flush=True)

        # Write this division's data to DB immediately to cap memory usage
        div_players = 0
        div_stat_rows = 0
        pid_cache: dict[tuple, str] = {}

        # 1. Write players that have stat data
        div_keys = [k for k in player_stats if k[2] == div]
        for key in div_keys:
            stat_vals = player_stats.pop(key)
            name, team, div_, tbl = key
            meta_key = (name, team, div_)
            try:
                if meta_key not in pid_cache:
                    meta = player_meta.get(meta_key, {})
                    pid = _upsert_player(conn, name, sport_code, team, div_,
                                         meta.get("position"), meta.get("class_year"),
                                         meta.get("height"))
                    pid_cache[meta_key] = pid
                    div_players += 1
                else:
                    pid = pid_cache[meta_key]

                if tbl and stat_vals:
                    _upsert_stat_row(conn, tbl, pid, stat_vals)
                    div_stat_rows += 1
            except Exception as e:
                print(f"    Error inserting {name}: {e}")
                conn.rollback()
                continue

        # 2. Upsert any remaining players from meta (stat_defs with empty map like returns/punting)
        for meta_key, meta in list(player_meta.items()):
            if meta_key[2] != div or meta_key in pid_cache:
                continue
            name, team, div_ = meta_key
            try:
                pid = _upsert_player(conn, name, sport_code, team, div_,
                                     meta.get("position"), meta.get("class_year"),
                                     meta.get("height"))
                pid_cache[meta_key] = pid
                div_players += 1
            except Exception as e:
                print(f"    Error inserting {name}: {e}")
                conn.rollback()

        # Clear processed meta entries
        for mk in list(player_meta.keys()):
            if mk[2] == div:
                del player_meta[mk]

        conn.commit()
        total_players += div_players
        total_stats   += div_stat_rows
        print(f"  ✓ {sport_key}/{div}: {div_players} players, {div_stat_rows} stat rows", flush=True)

    return total_players, total_stats


# ── Step 3: Discover stat IDs for a sport ─────────────────────────────────────

def discover_stats(sport_key: str, div_override: str = None, scan_max: int = 300):
    """
    Scan stat endpoint IDs 1..scan_max to find valid ones for a sport.
    Prints a Python dict of found IDs.
    """
    div = div_override or SPORT_DIVISIONS[sport_key][0]
    print(f"\nDiscovering stats for {sport_key}/{div} (scanning 1-{scan_max})...")
    found = {}
    for sid in range(1, scan_max + 1):
        data = api_get(f"stats/{sport_key}/{div}/current/individual/{sid}")
        if data and data.get("data"):
            title = data.get("title", "?")
            cols  = list(data["data"][0].keys()) if data["data"] else []
            found[sid] = {"title": title, "cols": cols}
            print(f"  {sid}: {title}  cols={cols}")
    print(f"\n=== {sport_key}: {len(found)} stat IDs found ===")
    print("\nPython dict:")
    print("{")
    for sid, info in found.items():
        print(f"    {sid}: {{\"title\": \"{info['title']}\", \"map\": {{}}}},")
    print("}")
    return found


# ── Validate against existing basketball pool ─────────────────────────────────

def validate_basketball(conn):
    """
    Cross-reference ncaa_players (mbb) against existing players table (basketball).
    Reports match rate.
    """
    ncaa = conn.execute(
        "SELECT full_name, season FROM ncaa_players WHERE sport='mbb'::sport_code"
    ).fetchall()
    print(f"\nValidating {len(ncaa)} ncaa mbb players against existing pool...")

    matched = 0
    for p in ncaa:
        row = conn.execute(
            "SELECT id FROM players WHERE full_name ILIKE %s LIMIT 1",
            (p["full_name"],),
        ).fetchone()
        if row:
            matched += 1

    pct = matched / len(ncaa) * 100 if ncaa else 0
    print(f"  Match rate: {matched}/{len(ncaa)} ({pct:.1f}%)")


# ── Summary ───────────────────────────────────────────────────────────────────

def print_summary(conn):
    teams   = conn.execute("SELECT COUNT(*) AS n FROM ncaa_teams").fetchone()["n"]
    players = conn.execute("SELECT COUNT(*) AS n FROM ncaa_players").fetchone()["n"]
    confs   = conn.execute("SELECT COUNT(*) AS n FROM ncaa_conferences").fetchone()["n"]
    print(f"\n{'═'*55}")
    print(f"  NCAA Multi-Sport Pool")
    print(f"{'═'*55}")
    print(f"  Conferences: {confs}")
    print(f"  Teams:       {teams}")
    print(f"  Players:     {players}")
    print(f"{'═'*55}")

    # Per-sport breakdown
    rows = conn.execute("""
        SELECT sport, COUNT(*) AS n
        FROM ncaa_players
        GROUP BY sport ORDER BY n DESC
    """).fetchall()
    for r in rows:
        print(f"    {r['sport']:20s}: {r['n']} players")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    mode    = sys.argv[1] if len(sys.argv) > 1 else "help"
    sport   = sys.argv[2] if len(sys.argv) > 2 else None
    div_arg = sys.argv[3] if len(sys.argv) > 3 else None

    print(f"\nKaNeXT NCAA Loader  [mode={mode}  sport={sport or 'all'}]")
    print("=" * 55)

    if mode == "discover":
        if not sport:
            print("Usage: ncaa_loader.py discover <sport> [division]")
            sys.exit(1)
        discover_stats(sport, div_override=div_arg)
        return

    conn = get_conn()

    if mode == "seed":
        print("[0] Seeding competitive levels...")
        seed_levels(conn)
        conn.close()
        return

    # Ensure levels are seeded
    seed_levels(conn)

    target_sports = ([sport] if sport else list(SPORT_DIVISIONS.keys()))

    for sp in target_sports:
        if sp not in SPORT_DIVISIONS:
            print(f"Unknown sport: {sp}")
            continue

        print(f"\n[{sp.upper()}]")

        if mode in ("standings", "all", "all_sports"):
            print(f"  Loading standings...")
            n = load_standings(conn, sp)
            print(f"  ✓ {n} teams")

        if mode in ("stats", "all", "all_sports"):
            print(f"  Loading stat leaders...")
            np_, ns = load_stats(conn, sp)
            print(f"  ✓ {np_} players, {ns} stat rows")

    if mode in ("all", "all_sports", "validate"):
        validate_basketball(conn)

    print_summary(conn)
    conn.close()


if __name__ == "__main__":
    main()
