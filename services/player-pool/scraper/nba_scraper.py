"""
NBA Pro Player Pool Scraper — 2025-26 Season
Pulls teams, rosters, per-game stats, advanced stats from nba_api.
Advanced stats (BPM/VORP/WS) scraped from Basketball Reference.
Stores in pro_ tables in kanext_player_pool.
"""
from __future__ import annotations

import sys
import time
import math
import re
from typing import Optional

import psycopg
from psycopg.rows import dict_row

# ── nba_api imports ──────────────────────────────────────────────────────────
from nba_api.stats.endpoints import (
    leaguedashplayerstats,
    leaguedashplayerbiostats,
    leaguedashteamstats,
    commonteamroster,
)
from nba_api.stats.static import teams as nba_teams_static

# ── DB config (matches existing config.py pattern) ──────────────────────────
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "kanext_player_pool",
}
SEASON = "2025-26"
DELAY = 0.6  # seconds between nba_api calls


# ── Helpers ──────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg.connect(
        host=DB_CONFIG["host"],
        port=DB_CONFIG["port"],
        dbname=DB_CONFIG["dbname"],
        row_factory=dict_row,
        autocommit=False,
    )


def height_to_inches(height_str: Optional[str]) -> Optional[int]:
    """Convert '6-5' or '6\\'5\"' style strings to total inches."""
    if not height_str:
        return None
    m = re.search(r"(\d+)['\-](\d+)", str(height_str))
    if m:
        return int(m.group(1)) * 12 + int(m.group(2))
    return None


def safe_float(val) -> Optional[float]:
    try:
        if val is None or val == "":
            return None
        return float(val)
    except (ValueError, TypeError):
        return None


def safe_int(val) -> Optional[int]:
    try:
        if val is None or val == "":
            return None
        return int(float(val))
    except (ValueError, TypeError):
        return None


# ── Step 1: Teams ─────────────────────────────────────────────────────────────

# Static division/conference map from nba_api
TEAM_DIVISION_MAP = {
    # Atlantic
    "BOS": ("East", "Atlantic"), "BKN": ("East", "Atlantic"),
    "NYK": ("East", "Atlantic"), "PHI": ("East", "Atlantic"),
    "TOR": ("East", "Atlantic"),
    # Central
    "CHI": ("East", "Central"), "CLE": ("East", "Central"),
    "DET": ("East", "Central"), "IND": ("East", "Central"),
    "MIL": ("East", "Central"),
    # Southeast
    "ATL": ("East", "Southeast"), "CHA": ("East", "Southeast"),
    "MIA": ("East", "Southeast"), "ORL": ("East", "Southeast"),
    "WAS": ("East", "Southeast"),
    # Northwest
    "DEN": ("West", "Northwest"), "MIN": ("West", "Northwest"),
    "OKC": ("West", "Northwest"), "POR": ("West", "Northwest"),
    "UTA": ("West", "Northwest"),
    # Pacific
    "GSW": ("West", "Pacific"), "LAC": ("West", "Pacific"),
    "LAL": ("West", "Pacific"), "PHX": ("West", "Pacific"),
    "SAC": ("West", "Pacific"),
    # Southwest
    "DAL": ("West", "Southwest"), "HOU": ("West", "Southwest"),
    "MEM": ("West", "Southwest"), "NOP": ("West", "Southwest"),
    "SAS": ("West", "Southwest"),
}


def load_teams(conn) -> dict[int, str]:
    """Insert all 30 NBA teams. Returns {nba_team_id: pro_teams.id}."""
    all_teams = nba_teams_static.get_teams()
    team_id_map: dict[int, str] = {}

    for t in all_teams:
        abbr = t["abbreviation"]
        conf, div = TEAM_DIVISION_MAP.get(abbr, ("Unknown", "Unknown"))
        row = conn.execute(
            """
            INSERT INTO pro_teams (nba_team_id, name, abbreviation, conference, division)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (nba_team_id) DO UPDATE SET
                name         = EXCLUDED.name,
                abbreviation = EXCLUDED.abbreviation,
                conference   = EXCLUDED.conference,
                division     = EXCLUDED.division
            RETURNING id
            """,
            (t["id"], t["full_name"], abbr, conf, div),
        ).fetchone()
        team_id_map[t["id"]] = str(row["id"])

    conn.commit()
    print(f"  ✓ {len(team_id_map)} teams loaded")
    return team_id_map


# ── Step 2: Rosters + bios ────────────────────────────────────────────────────

def load_players(conn, team_id_map: dict[int, str]) -> dict[int, str]:
    """
    Pull all active rosters via commonteamroster (one call per team).
    Supplement height/weight/age from leaguedashplayerbiostats.
    Returns {nba_player_id: pro_players.id}.
    """
    # Bio stats gives height/weight/age for all players in one call
    print("  Fetching player bio stats...")
    bio_ep = leaguedashplayerbiostats.LeagueDashPlayerBioStats(
        season=SEASON,
        per_mode_simple="PerGame",
        timeout=60,
    )
    time.sleep(DELAY)
    bio_rows = bio_ep.get_data_frames()[0]

    # Build bio lookup by PLAYER_ID
    bio_map: dict[int, dict] = {}
    for _, row in bio_rows.iterrows():
        pid = int(row["PLAYER_ID"])
        bio_map[pid] = {
            "height": safe_int(row.get("PLAYER_HEIGHT_INCHES")),
            "weight": safe_int(row.get("PLAYER_WEIGHT")),
            "age":    safe_int(row.get("AGE")),
        }

    player_id_map: dict[int, str] = {}
    all_teams = nba_teams_static.get_teams()

    for t in all_teams:
        nba_tid = t["id"]
        pro_team_uuid = team_id_map.get(nba_tid)
        print(f"  Fetching roster: {t['abbreviation']}...")
        try:
            roster_ep = commonteamroster.CommonTeamRoster(
                team_id=nba_tid,
                season=SEASON,
                timeout=60,
            )
            time.sleep(DELAY)
            roster_df = roster_ep.get_data_frames()[0]
        except Exception as e:
            print(f"    WARNING: roster fetch failed for {t['abbreviation']}: {e}")
            continue

        for _, p in roster_df.iterrows():
            nba_pid = safe_int(p.get("PLAYER_ID"))
            if nba_pid is None:
                continue
            bio = bio_map.get(nba_pid, {})

            row = conn.execute(
                """
                INSERT INTO pro_players
                    (nba_player_id, full_name, position, height_inches,
                     weight_lbs, age, jersey_number, pro_team_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (nba_player_id) DO UPDATE SET
                    full_name     = EXCLUDED.full_name,
                    position      = EXCLUDED.position,
                    height_inches = EXCLUDED.height_inches,
                    weight_lbs    = EXCLUDED.weight_lbs,
                    age           = EXCLUDED.age,
                    jersey_number = EXCLUDED.jersey_number,
                    pro_team_id   = EXCLUDED.pro_team_id,
                    updated_at    = now()
                RETURNING id
                """,
                (
                    nba_pid,
                    str(p.get("PLAYER", "")),
                    str(p.get("POSITION", "")) or None,
                    bio.get("height"),
                    bio.get("weight"),
                    bio.get("age"),
                    str(p.get("NUM", "")) or None,
                    pro_team_uuid,
                ),
            ).fetchone()
            player_id_map[nba_pid] = str(row["id"])

    conn.commit()
    print(f"  ✓ {len(player_id_map)} players loaded")
    return player_id_map


# ── Step 3: Per-game stats ────────────────────────────────────────────────────

def load_pergame_stats(conn, player_id_map: dict[int, str], team_id_map: dict[int, str]):
    """Pull per-game averages from leaguedashplayerstats."""
    print("  Fetching per-game stats...")
    ep = leaguedashplayerstats.LeagueDashPlayerStats(
        season=SEASON,
        per_mode_detailed="PerGame",
        measure_type_detailed_defense="Base",
        timeout=90,
    )
    time.sleep(DELAY)
    df = ep.get_data_frames()[0]

    inserted = 0
    for _, r in df.iterrows():
        nba_pid = safe_int(r.get("PLAYER_ID"))
        player_uuid = player_id_map.get(nba_pid)
        if not player_uuid:
            continue

        nba_tid = safe_int(r.get("TEAM_ID"))
        team_uuid = team_id_map.get(nba_tid)

        conn.execute(
            """
            INSERT INTO pro_player_season_stats
                (player_id, pro_team_id, season,
                 gp, mpg, ppg, rpg, apg, spg, bpg, to_pg,
                 fg_pct, three_pct, ft_pct,
                 fga_pg, three_pa_pg, fta_pg,
                 oreb_pg, dreb_pg, pf_pg)
            VALUES (%s,%s,%s, %s,%s,%s,%s,%s,%s,%s,%s,
                    %s,%s,%s, %s,%s,%s, %s,%s,%s)
            ON CONFLICT (player_id, season) DO UPDATE SET
                pro_team_id  = EXCLUDED.pro_team_id,
                gp           = EXCLUDED.gp,
                mpg          = EXCLUDED.mpg,
                ppg          = EXCLUDED.ppg,
                rpg          = EXCLUDED.rpg,
                apg          = EXCLUDED.apg,
                spg          = EXCLUDED.spg,
                bpg          = EXCLUDED.bpg,
                to_pg        = EXCLUDED.to_pg,
                fg_pct       = EXCLUDED.fg_pct,
                three_pct    = EXCLUDED.three_pct,
                ft_pct       = EXCLUDED.ft_pct,
                fga_pg       = EXCLUDED.fga_pg,
                three_pa_pg  = EXCLUDED.three_pa_pg,
                fta_pg       = EXCLUDED.fta_pg,
                oreb_pg      = EXCLUDED.oreb_pg,
                dreb_pg      = EXCLUDED.dreb_pg,
                pf_pg        = EXCLUDED.pf_pg
            """,
            (
                player_uuid, team_uuid, SEASON,
                safe_int(r.get("GP")),
                safe_float(r.get("MIN")),
                safe_float(r.get("PTS")),
                safe_float(r.get("REB")),
                safe_float(r.get("AST")),
                safe_float(r.get("STL")),
                safe_float(r.get("BLK")),
                safe_float(r.get("TOV")),
                safe_float(r.get("FG_PCT")),
                safe_float(r.get("FG3_PCT")),
                safe_float(r.get("FT_PCT")),
                safe_float(r.get("FGA")),
                safe_float(r.get("FG3A")),
                safe_float(r.get("FTA")),
                safe_float(r.get("OREB")),
                safe_float(r.get("DREB")),
                safe_float(r.get("PF")),
            ),
        )
        inserted += 1

    conn.commit()
    print(f"  ✓ {inserted} per-game stat rows loaded")


# ── Step 4a: Advanced stats from nba_api (PER, TS%, eFG%, USG%, ratings) ──────

def load_advanced_stats_nba(conn, player_id_map: dict[int, str], team_id_map: dict[int, str]):
    """Pull advanced/misc stats from nba_api leaguedashplayerstats (Advanced measure)."""
    print("  Fetching advanced stats (nba_api)...")
    ep = leaguedashplayerstats.LeagueDashPlayerStats(
        season=SEASON,
        per_mode_detailed="PerGame",
        measure_type_detailed_defense="Advanced",
        timeout=90,
    )
    time.sleep(DELAY)
    df = ep.get_data_frames()[0]

    upserted = 0
    for _, r in df.iterrows():
        nba_pid = safe_int(r.get("PLAYER_ID"))
        player_uuid = player_id_map.get(nba_pid)
        if not player_uuid:
            continue

        nba_tid = safe_int(r.get("TEAM_ID"))
        team_uuid = team_id_map.get(nba_tid)

        conn.execute(
            """
            INSERT INTO pro_player_advanced_stats
                (player_id, pro_team_id, season,
                 ts_pct, efg_pct, usg_pct, ast_pct, tov_pct,
                 ortg, drtg, net_rating)
            VALUES (%s,%s,%s, %s,%s,%s,%s,%s, %s,%s,%s)
            ON CONFLICT (player_id, season) DO UPDATE SET
                pro_team_id = EXCLUDED.pro_team_id,
                ts_pct      = EXCLUDED.ts_pct,
                efg_pct     = EXCLUDED.efg_pct,
                usg_pct     = EXCLUDED.usg_pct,
                ast_pct     = EXCLUDED.ast_pct,
                tov_pct     = EXCLUDED.tov_pct,
                ortg        = EXCLUDED.ortg,
                drtg        = EXCLUDED.drtg,
                net_rating  = EXCLUDED.net_rating
            """,
            (
                player_uuid, team_uuid, SEASON,
                safe_float(r.get("TS_PCT")),
                safe_float(r.get("EFG_PCT")),
                safe_float(r.get("USG_PCT")),
                safe_float(r.get("AST_PCT")),
                (safe_float(r.get("TM_TOV_PCT")) or 0) / 100.0,  # nba_api returns as %, normalize
                safe_float(r.get("OFF_RATING")),
                safe_float(r.get("DEF_RATING")),
                safe_float(r.get("NET_RATING")),
            ),
        )
        upserted += 1

    conn.commit()
    print(f"  ✓ {upserted} advanced stat rows (nba_api) upserted")


# ── Step 4b: BPM / VORP / WS from Basketball Reference ───────────────────────

BREF_URL = "https://www.basketball-reference.com/leagues/NBA_2026_advanced.html"

def scrape_bref_advanced(conn, player_id_map: dict[int, str]):
    """
    Scrape BPM, OBPM, DBPM, VORP, WS, WS/48 from Basketball Reference.
    Uses curl_cffi to bypass Cloudflare. Falls back to httpx if unavailable.
    """
    print("  Scraping Basketball Reference advanced stats...")
    html = _fetch_bref(BREF_URL)
    if not html:
        print("  WARNING: Could not fetch bball-ref — BPM/VORP/WS will be NULL")
        return

    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, "lxml")
    table = soup.find("table", {"id": "advanced"})
    if not table:
        print("  WARNING: #advanced table not found on bball-ref page")
        return

    # Parse column headers (data-stat attributes)
    col_headers = [th.get("data-stat", "") for th in table.find("thead").find_all("th")]

    updated = 0
    seen_players: set[str] = set()  # dedup: keep TOT row for traded players

    for tr in table.find("tbody").find_all("tr"):
        if "thead" in tr.get("class", []):
            continue
        cells = tr.find_all(["td", "th"])
        if not cells:
            continue

        row_data: dict[str, str] = {}
        for h, cell in zip(col_headers, cells):
            row_data[h] = cell.get_text(strip=True)

        player_name = row_data.get("name_display", "").replace("*", "").strip()
        team_abbr   = row_data.get("team_name_abbr", "")

        if not player_name:
            continue

        # For traded players bball-ref has a "TOT" totals row then per-team rows.
        # Keep the TOT row; skip subsequent per-team rows for the same name.
        key = player_name.lower()
        if key in seen_players:
            continue
        if team_abbr != "TOT":
            seen_players.add(key)

        per   = safe_float(row_data.get("per"))
        bpm   = safe_float(row_data.get("bpm"))
        obpm  = safe_float(row_data.get("obpm"))
        dbpm  = safe_float(row_data.get("dbpm"))
        vorp  = safe_float(row_data.get("vorp"))
        ws    = safe_float(row_data.get("ws"))
        ws_48 = safe_float(row_data.get("ws_per_48"))

        # Match to our DB by name (best-effort)
        db_rows = conn.execute(
            "SELECT id FROM pro_players WHERE lower(full_name) = lower(%s) LIMIT 1",
            (player_name,),
        ).fetchall()

        if not db_rows:
            continue

        player_uuid = str(db_rows[0]["id"])

        conn.execute(
            """
            INSERT INTO pro_player_advanced_stats (player_id, season, per, bpm, obpm, dbpm, vorp, ws, ws_48)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (player_id, season) DO UPDATE SET
                per   = EXCLUDED.per,
                bpm   = EXCLUDED.bpm,
                obpm  = EXCLUDED.obpm,
                dbpm  = EXCLUDED.dbpm,
                vorp  = EXCLUDED.vorp,
                ws    = EXCLUDED.ws,
                ws_48 = EXCLUDED.ws_48
            """,
            (player_uuid, SEASON, per, bpm, obpm, dbpm, vorp, ws, ws_48),
        )
        updated += 1

    conn.commit()
    print(f"  ✓ BPM/VORP/WS updated for {updated} players")


def _fetch_bref(url: str) -> Optional[str]:
    """Try curl_cffi first (Cloudflare-safe), fall back to httpx."""
    # curl_cffi
    try:
        from curl_cffi import requests as cffi_requests
        resp = cffi_requests.get(url, impersonate="chrome110", timeout=30)
        if resp.status_code == 200:
            return resp.text
        print(f"  curl_cffi status {resp.status_code}")
    except ImportError:
        pass
    except Exception as e:
        print(f"  curl_cffi error: {e}")

    # httpx fallback
    try:
        import httpx
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            )
        }
        resp = httpx.get(url, headers=headers, timeout=30, follow_redirects=True)
        if resp.status_code == 200:
            return resp.text
        print(f"  httpx status {resp.status_code}")
    except Exception as e:
        print(f"  httpx error: {e}")

    return None


# ── Step 5: Team season stats ─────────────────────────────────────────────────

def load_team_stats(conn, team_id_map: dict[int, str]):
    """Pull W-L, ORTG, DRTG, pace, net rating from leaguedashteamstats."""
    print("  Fetching team season stats...")
    ep = leaguedashteamstats.LeagueDashTeamStats(
        season=SEASON,
        per_mode_detailed="PerGame",
        measure_type_detailed_defense="Advanced",
        timeout=60,
    )
    time.sleep(DELAY)
    df = ep.get_data_frames()[0]

    # Sort by conference for standing number (rough standing by W%)
    df = df.copy()
    df["W_PCT"] = df["W"] / (df["W"] + df["L"]).replace(0, 1)

    inserted = 0
    for _, r in df.iterrows():
        nba_tid = safe_int(r.get("TEAM_ID"))
        team_uuid = team_id_map.get(nba_tid)
        if not team_uuid:
            continue

        conn.execute(
            """
            INSERT INTO pro_team_season_stats
                (pro_team_id, season, wins, losses,
                 ortg, drtg, pace, net_rating)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (pro_team_id, season) DO UPDATE SET
                wins       = EXCLUDED.wins,
                losses     = EXCLUDED.losses,
                ortg       = EXCLUDED.ortg,
                drtg       = EXCLUDED.drtg,
                pace       = EXCLUDED.pace,
                net_rating = EXCLUDED.net_rating
            """,
            (
                team_uuid, SEASON,
                safe_int(r.get("W")), safe_int(r.get("L")),
                safe_float(r.get("OFF_RATING")),
                safe_float(r.get("DEF_RATING")),
                safe_float(r.get("PACE")),
                safe_float(r.get("NET_RATING")),
            ),
        )
        inserted += 1

    conn.commit()
    print(f"  ✓ {inserted} team stat rows loaded")


# ── Step 6: Compute conference standings ──────────────────────────────────────

def compute_standings(conn):
    """Rank teams within each conference by W/(W+L) and write conf_standing."""
    rows = conn.execute(
        """
        SELECT ts.id, ts.wins, ts.losses, pt.conference
        FROM pro_team_season_stats ts
        JOIN pro_teams pt ON ts.pro_team_id = pt.id
        WHERE ts.season = %s
        ORDER BY pt.conference, (ts.wins::float / NULLIF(ts.wins + ts.losses, 0)) DESC
        """,
        (SEASON,),
    ).fetchall()

    conf_rank: dict[str, int] = {}
    for row in rows:
        conf = row["conference"]
        rank = conf_rank.get(conf, 0) + 1
        conf_rank[conf] = rank
        conn.execute(
            "UPDATE pro_team_season_stats SET conf_standing = %s WHERE id = %s",
            (rank, row["id"]),
        )

    conn.commit()
    print("  ✓ Conference standings computed")


# ── Summary ───────────────────────────────────────────────────────────────────

def print_summary(conn):
    total_teams = conn.execute("SELECT COUNT(*) AS n FROM pro_teams").fetchone()["n"]
    total_players = conn.execute("SELECT COUNT(*) AS n FROM pro_players").fetchone()["n"]
    total_stats = conn.execute(
        "SELECT COUNT(*) AS n FROM pro_player_season_stats WHERE season = %s", (SEASON,)
    ).fetchone()["n"]
    total_adv = conn.execute(
        "SELECT COUNT(*) AS n FROM pro_player_advanced_stats WHERE season = %s", (SEASON,)
    ).fetchone()["n"]

    print("\n" + "═" * 60)
    print("  NBA PRO POOL — LOAD SUMMARY")
    print("═" * 60)
    print(f"  Teams loaded:              {total_teams}")
    print(f"  Players loaded:            {total_players}")
    print(f"  Per-game stat rows:        {total_stats}")
    print(f"  Advanced stat rows:        {total_adv}")
    print()

    # Sample: Shai Gilgeous-Alexander
    sga = conn.execute(
        """
        SELECT
            pp.full_name,
            pp.position,
            pp.height_inches,
            pp.weight_lbs,
            pp.age,
            pp.jersey_number,
            pt.name AS team,
            pt.abbreviation,
            -- per-game
            ps.gp, ps.mpg, ps.ppg, ps.rpg, ps.apg, ps.spg, ps.bpg, ps.to_pg,
            ps.fg_pct, ps.three_pct, ps.ft_pct,
            ps.fga_pg, ps.three_pa_pg, ps.fta_pg,
            ps.oreb_pg, ps.dreb_pg, ps.pf_pg,
            -- advanced
            pa.per, pa.ts_pct, pa.efg_pct, pa.usg_pct, pa.ast_pct, pa.tov_pct,
            pa.ortg, pa.drtg, pa.net_rating,
            pa.bpm, pa.obpm, pa.dbpm, pa.vorp, pa.ws, pa.ws_48
        FROM pro_players pp
        LEFT JOIN pro_teams pt ON pp.pro_team_id = pt.id
        LEFT JOIN pro_player_season_stats ps ON ps.player_id = pp.id AND ps.season = %s
        LEFT JOIN pro_player_advanced_stats pa ON pa.player_id = pp.id AND pa.season = %s
        WHERE lower(pp.full_name) LIKE '%%shai%%gilgeous%%'
        LIMIT 1
        """,
        (SEASON, SEASON),
    ).fetchone()

    if sga:
        print(f"  SAMPLE PLAYER: {sga['full_name']} ({sga['abbreviation']} | #{sga['jersey_number']})")
        h = sga["height_inches"]
        ht_str = f"{h // 12}'{h % 12}\"" if h else "N/A"
        print(f"  {sga['position']} | {ht_str} | {sga['weight_lbs']} lbs | Age {sga['age']}")
        print()
        print("  Per-Game Stats:")
        print(f"    GP:{sga['gp']}  MPG:{sga['mpg']}  PPG:{sga['ppg']}  "
              f"RPG:{sga['rpg']}  APG:{sga['apg']}  SPG:{sga['spg']}  "
              f"BPG:{sga['bpg']}  TO:{sga['to_pg']}")
        print(f"    FG%:{sga['fg_pct']}  3P%:{sga['three_pct']}  FT%:{sga['ft_pct']}")
        print(f"    FGA:{sga['fga_pg']}  3PA:{sga['three_pa_pg']}  FTA:{sga['fta_pg']}")
        print(f"    OREB:{sga['oreb_pg']}  DREB:{sga['dreb_pg']}  PF:{sga['pf_pg']}")
        print()
        print("  Advanced Stats:")
        print(f"    PER:{sga['per']}  TS%:{sga['ts_pct']}  eFG%:{sga['efg_pct']}  "
              f"USG%:{sga['usg_pct']}  AST%:{sga['ast_pct']}  TOV%:{sga['tov_pct']}")
        print(f"    ORTG:{sga['ortg']}  DRTG:{sga['drtg']}  NetRTG:{sga['net_rating']}")
        print(f"    BPM:{sga['bpm']}  OBPM:{sga['obpm']}  DBPM:{sga['dbpm']}  "
              f"VORP:{sga['vorp']}  WS:{sga['ws']}  WS/48:{sga['ws_48']}")
    else:
        print("  SAMPLE: Shai Gilgeous-Alexander not found (check name match)")

    print("═" * 60)


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("\nKaNeXT NBA Pro Pool Scraper — 2025-26 Season")
    print("=" * 60)

    conn = get_conn()

    print("\n[1/6] Loading teams...")
    team_id_map = load_teams(conn)

    print("\n[2/6] Loading players (rosters + bios)...")
    player_id_map = load_players(conn, team_id_map)

    print("\n[3/6] Loading per-game stats...")
    load_pergame_stats(conn, player_id_map, team_id_map)

    print("\n[4/6] Loading advanced stats (nba_api)...")
    load_advanced_stats_nba(conn, player_id_map, team_id_map)

    print("\n[5/6] Loading team season stats...")
    load_team_stats(conn, team_id_map)

    print("\n  Computing conference standings...")
    compute_standings(conn)

    print("\n[6/6] Scraping Basketball Reference (BPM/VORP/WS)...")
    scrape_bref_advanced(conn, player_id_map)

    print_summary(conn)
    conn.close()


if __name__ == "__main__":
    main()
