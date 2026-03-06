"""
ESPN NCAA D1 Team Stats Scraper
Scrapes team-level season totals and per-game box score stats for every NCAA D1 team.

Endpoints:
  - Season stats: site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/{id}/statistics
  - Schedule:     site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/{id}/schedule?season=2026
  - Game summary: site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/summary?event={gameId}

Tables:
  - team_season_stats: Season totals per team (team stats + opponent stats)
  - team_game_log:     Per-game team box scores with opponent stats

Usage:
  python3 team_stats_scraper.py [one|five|all|season-only|games-only]
"""
from __future__ import annotations

import re
import sys
import time
import logging

import httpx

import db
from config import CRAWL_DELAY

ESPN_API = "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball"
ESPN_SEASON = "2026"  # ESPN uses end-year for season (2025-26 -> 2026)
DB_SEASON = 2025      # Our DB season integer
LEVEL_KEY = "ncaa_d1"

# ── Logging ──

log_formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s", datefmt="%H:%M:%S")

# Console handler
console_handler = logging.StreamHandler()
console_handler.setFormatter(log_formatter)

# File handler
file_handler = logging.FileHandler("logs/team_stats.log", mode="a")
file_handler.setFormatter(log_formatter)

logging.basicConfig(level=logging.INFO, handlers=[console_handler, file_handler])
log = logging.getLogger("team_stats_scraper")

# ── Rate limiting ──

_last_request_time = 0.0


def fetch_json(url: str, conn, params: dict | None = None) -> dict | None:
    """Fetch JSON from ESPN API with rate limiting."""
    global _last_request_time
    elapsed = time.time() - _last_request_time
    if elapsed < CRAWL_DELAY:
        time.sleep(CRAWL_DELAY - elapsed)

    try:
        r = httpx.get(url, params=params, follow_redirects=True, timeout=60)
        _last_request_time = time.time()
        status = "success" if r.status_code == 200 else "failed"
        db.log_scrape(conn, str(r.url), status, r.status_code, None, 0)
        conn.commit()
        if r.status_code != 200:
            log.warning("HTTP %d: %s", r.status_code, url)
            return None
        return r.json()
    except Exception as e:
        _last_request_time = time.time()
        db.log_scrape(conn, url, "failed", 0, str(e), 0)
        conn.commit()
        log.error("Request failed: %s -- %s", url, e)
        return None


# ── Helpers ──

def _safe_int(val) -> int:
    """Safely convert a value to int."""
    if val is None:
        return 0
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return 0


def _parse_made_att(s: str) -> tuple[int, int]:
    """Parse 'M-A' format, e.g. '19-59' -> (19, 59)."""
    m = re.match(r"(\d+)-(\d+)", s.strip())
    if m:
        return int(m.group(1)), int(m.group(2))
    return 0, 0


def _stat_value(stats_list: list[dict], name: str) -> str:
    """Get displayValue for a stat by name from a list of stat dicts."""
    for s in stats_list:
        if s.get("name") == name:
            return s.get("displayValue", "0")
    return "0"


def _stat_numeric(stats_list: list[dict], name: str) -> float:
    """Get numeric value for a stat by name from the season stats categories."""
    for s in stats_list:
        if s.get("name") == name:
            return s.get("value", 0.0)
    return 0.0


# ── Load D1 Teams from DB ──

def load_teams_from_db(conn, limit: int | None = None) -> list[dict]:
    """Load NCAA D1 teams from the database. Returns list of {id, name, espn_id}."""
    rows = conn.execute(
        """SELECT t.id, t.name, t.slug
           FROM teams t
           JOIN competitive_levels cl ON t.competitive_level_id = cl.id
           WHERE cl.level_key = %s
           ORDER BY t.name""",
        (LEVEL_KEY,),
    ).fetchall()

    teams = []
    for row in rows:
        slug = row["slug"] or ""
        # Extract ESPN ID from slug format "espn-{id}"
        if slug.startswith("espn-"):
            espn_id = slug[5:]
        else:
            log.warning("Team %s has non-ESPN slug: %s -- skipping", row["name"], slug)
            continue
        teams.append({
            "id": str(row["id"]),
            "name": row["name"],
            "espn_id": espn_id,
        })

    log.info("Loaded %d NCAA D1 teams from DB", len(teams))
    if limit:
        teams = teams[:limit]
    return teams


# ── Phase 1: Season Stats ──

def scrape_season_stats(conn, team: dict) -> bool:
    """Fetch and upsert season totals for one team. Returns True on success."""
    espn_id = team["espn_id"]
    team_id = team["id"]
    name = team["name"]

    data = fetch_json(f"{ESPN_API}/teams/{espn_id}/statistics", conn)
    if not data:
        log.warning("  No season stats for %s", name)
        return False

    # Navigate to stats categories
    results = data.get("results", {})
    stats_obj = results.get("stats", {})
    categories = stats_obj.get("categories", [])

    # Build a flat list of all stats across categories
    all_stats: list[dict] = []
    for cat in categories:
        all_stats.extend(cat.get("stats", []))

    # Extract totals (ESPN gives both averages and totals)
    gp = _safe_int(_stat_numeric(all_stats, "gamesPlayed"))
    if gp == 0:
        log.warning("  Team %s has 0 games played -- skipping season stats", name)
        return False

    minutes = _safe_int(_stat_numeric(all_stats, "minutes"))
    pts = _safe_int(_stat_numeric(all_stats, "points"))
    fgm = _safe_int(_stat_numeric(all_stats, "fieldGoalsMade"))
    fga = _safe_int(_stat_numeric(all_stats, "fieldGoalsAttempted"))
    three_pm = _safe_int(_stat_numeric(all_stats, "threePointFieldGoalsMade"))
    three_pa = _safe_int(_stat_numeric(all_stats, "threePointFieldGoalsAttempted"))
    ftm = _safe_int(_stat_numeric(all_stats, "freeThrowsMade"))
    fta = _safe_int(_stat_numeric(all_stats, "freeThrowsAttempted"))
    orb = _safe_int(_stat_numeric(all_stats, "offensiveRebounds"))
    drb = _safe_int(_stat_numeric(all_stats, "defensiveRebounds"))
    trb = _safe_int(_stat_numeric(all_stats, "totalRebounds"))
    # Fallback: if totalRebounds missing, use rebounds
    if trb == 0:
        trb = _safe_int(_stat_numeric(all_stats, "rebounds"))
    ast = _safe_int(_stat_numeric(all_stats, "assists"))
    tov = _safe_int(_stat_numeric(all_stats, "turnovers"))
    stl = _safe_int(_stat_numeric(all_stats, "steals"))
    blk = _safe_int(_stat_numeric(all_stats, "blocks"))

    # Fouls: ESPN only provides avgFouls (per-game), so derive total from gp
    pf = _safe_int(_stat_numeric(all_stats, "fouls"))
    if pf == 0:
        pf = _safe_int(_stat_numeric(all_stats, "totalFouls"))
    if pf == 0:
        avg_fouls = _stat_numeric(all_stats, "avgFouls")
        pf = round(avg_fouls * gp)

    # Upsert into team_season_stats
    # Note: Opponent stats are NOT available from the team statistics endpoint.
    # We will aggregate them from game logs in a separate pass after Phase 2.
    conn.execute(
        """INSERT INTO team_season_stats (
            team_id, season, gp, min, pts,
            fgm, fga, three_pm, three_pa, ftm, fta,
            orb, drb, trb, ast, tov, stl, blk, pf,
            scraped_at
        ) VALUES (
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s,
            now()
        )
        ON CONFLICT (team_id, season) DO UPDATE SET
            gp = EXCLUDED.gp, min = EXCLUDED.min, pts = EXCLUDED.pts,
            fgm = EXCLUDED.fgm, fga = EXCLUDED.fga,
            three_pm = EXCLUDED.three_pm, three_pa = EXCLUDED.three_pa,
            ftm = EXCLUDED.ftm, fta = EXCLUDED.fta,
            orb = EXCLUDED.orb, drb = EXCLUDED.drb, trb = EXCLUDED.trb,
            ast = EXCLUDED.ast, tov = EXCLUDED.tov,
            stl = EXCLUDED.stl, blk = EXCLUDED.blk, pf = EXCLUDED.pf,
            scraped_at = now()""",
        (
            team_id, DB_SEASON, gp, minutes, pts,
            fgm, fga, three_pm, three_pa, ftm, fta,
            orb, drb, trb, ast, tov, stl, blk, pf,
        ),
    )
    conn.commit()
    return True


# ── Phase 2: Game Logs ──

def _parse_team_game_stats(stats_list: list[dict]) -> dict:
    """Parse the boxscore team statistics list into a dict of ints."""
    fg_str = _stat_value(stats_list, "fieldGoalsMade-fieldGoalsAttempted")
    fgm, fga = _parse_made_att(fg_str)

    three_str = _stat_value(stats_list, "threePointFieldGoalsMade-threePointFieldGoalsAttempted")
    three_pm, three_pa = _parse_made_att(three_str)

    ft_str = _stat_value(stats_list, "freeThrowsMade-freeThrowsAttempted")
    ftm, fta = _parse_made_att(ft_str)

    orb = _safe_int(_stat_value(stats_list, "offensiveRebounds"))
    drb = _safe_int(_stat_value(stats_list, "defensiveRebounds"))
    trb = _safe_int(_stat_value(stats_list, "totalRebounds"))
    ast = _safe_int(_stat_value(stats_list, "assists"))
    stl = _safe_int(_stat_value(stats_list, "steals"))
    blk = _safe_int(_stat_value(stats_list, "blocks"))
    tov = _safe_int(_stat_value(stats_list, "turnovers"))
    pf = _safe_int(_stat_value(stats_list, "fouls"))
    # ESPN FGM includes 3PM, so: pts = 2*(fgm - three_pm) + 3*three_pm + ftm
    pts = 2 * (fgm - three_pm) + 3 * three_pm + ftm

    return {
        "fgm": fgm, "fga": fga,
        "three_pm": three_pm, "three_pa": three_pa,
        "ftm": ftm, "fta": fta,
        "orb": orb, "drb": drb, "trb": trb,
        "ast": ast, "stl": stl, "blk": blk,
        "tov": tov, "pf": pf, "pts": pts,
    }


def _find_opponent_team_id(conn, opponent_espn_id: str) -> str | None:
    """Try to find opponent team_id in DB by ESPN ID slug."""
    slug = f"espn-{opponent_espn_id}"
    row = conn.execute(
        "SELECT id FROM teams WHERE slug = %s", (slug,)
    ).fetchone()
    if row:
        return str(row["id"])
    return None


def scrape_game_logs(conn, team: dict) -> int:
    """Fetch schedule + game summaries for one team. Returns number of games loaded."""
    espn_id = team["espn_id"]
    team_id = team["id"]
    name = team["name"]

    # Get schedule
    data = fetch_json(
        f"{ESPN_API}/teams/{espn_id}/schedule",
        conn,
        params={"season": ESPN_SEASON},
    )
    if not data:
        log.warning("  No schedule for %s", name)
        return 0

    events = data.get("events", [])
    completed = []
    for ev in events:
        comp = ev.get("competitions", [{}])[0]
        status = comp.get("status", {}).get("type", {}).get("name", "")
        if status != "STATUS_FINAL":
            continue
        completed.append(ev)

    log.info("  Schedule: %d completed games", len(completed))
    games_loaded = 0

    for ev in completed:
        game_id = str(ev.get("id", ""))
        date_str = ev.get("date", "")[:10]  # "2025-11-05T01:45Z" -> "2025-11-05"
        comp = ev.get("competitions", [{}])[0]
        neutral_site = comp.get("neutralSite", False)

        # Parse competitors from schedule to get home/away + scores
        competitors = comp.get("competitors", [])
        our_ha = None
        opp_name_sched = ""
        opp_espn_id = ""
        team_score = 0
        opp_score = 0

        for c in competitors:
            c_team = c.get("team", {})
            c_id = str(c_team.get("id", ""))
            c_ha = c.get("homeAway", "")
            c_score_raw = c.get("score", {})
            if isinstance(c_score_raw, dict):
                c_score = _safe_int(c_score_raw.get("value", 0))
            else:
                c_score = _safe_int(c_score_raw)

            if c_id == espn_id:
                our_ha = c_ha
                team_score = c_score
            else:
                opp_name_sched = c_team.get("displayName", "Unknown")
                opp_espn_id = c_id
                opp_score = c_score

        # Determine home_away for our team
        if neutral_site:
            home_away = "neutral"
        elif our_ha == "home":
            home_away = "home"
        else:
            home_away = "away"

        result = "W" if team_score > opp_score else "L"

        # Check if we already have this game log
        existing = conn.execute(
            "SELECT id FROM team_game_log WHERE team_id = %s AND espn_game_id = %s",
            (team_id, game_id),
        ).fetchone()
        if existing:
            games_loaded += 1
            continue

        # Fetch game summary for team box score stats
        summary = fetch_json(f"{ESPN_API}/summary", conn, params={"event": game_id})
        if not summary:
            log.warning("  Could not fetch summary for game %s", game_id)
            continue

        bs = summary.get("boxscore", {})
        teams_in_bs = bs.get("teams", [])

        # Match our team and opponent in boxscore by ESPN ID from header
        header = summary.get("header", {})
        header_comps = header.get("competitions", [{}])
        espn_id_to_idx: dict[str, int] = {}
        if header_comps:
            for hc in header_comps[0].get("competitors", []):
                hc_id = str(hc.get("id", ""))
                # The boxscore teams are ordered the same as header competitors
                # But we map by team ID for safety
                espn_id_to_idx[hc_id] = -1  # placeholder

        # Map boxscore teams by their ESPN ID
        bs_team_stats: dict[str, list[dict]] = {}
        for bt in teams_in_bs:
            bt_team = bt.get("team", {})
            bt_id = str(bt_team.get("id", ""))
            bs_team_stats[bt_id] = bt.get("statistics", [])

        our_stats_list = bs_team_stats.get(espn_id, [])
        opp_stats_list = bs_team_stats.get(opp_espn_id, [])

        if not our_stats_list:
            log.warning("  No team stats in boxscore for %s game %s", name, game_id)
            # Still insert with schedule-level data only
            conn.execute(
                """INSERT INTO team_game_log (
                    team_id, season, game_date, opponent_name, opponent_team_id,
                    home_away, result, team_score, opp_score, espn_game_id, scraped_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, now())
                ON CONFLICT (team_id, espn_game_id) DO NOTHING""",
                (
                    team_id, DB_SEASON, date_str, opp_name_sched,
                    _find_opponent_team_id(conn, opp_espn_id),
                    home_away, result, team_score, opp_score, game_id,
                ),
            )
            conn.commit()
            games_loaded += 1
            continue

        our_parsed = _parse_team_game_stats(our_stats_list)
        opp_parsed = _parse_team_game_stats(opp_stats_list) if opp_stats_list else {}

        opponent_team_id = _find_opponent_team_id(conn, opp_espn_id)

        conn.execute(
            """INSERT INTO team_game_log (
                team_id, season, game_date, opponent_name, opponent_team_id,
                home_away, result, team_score, opp_score,
                fgm, fga, three_pm, three_pa, ftm, fta,
                orb, drb, trb, ast, tov, stl, blk, pf, pts,
                opp_fgm, opp_fga, opp_three_pm, opp_three_pa,
                opp_ftm, opp_fta, opp_orb, opp_drb, opp_trb,
                opp_ast, opp_tov, opp_stl, opp_blk, opp_pf, opp_pts,
                espn_game_id, scraped_at
            ) VALUES (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s,
                %s, now()
            )
            ON CONFLICT (team_id, espn_game_id) DO UPDATE SET
                game_date = EXCLUDED.game_date,
                opponent_name = EXCLUDED.opponent_name,
                opponent_team_id = EXCLUDED.opponent_team_id,
                home_away = EXCLUDED.home_away,
                result = EXCLUDED.result,
                team_score = EXCLUDED.team_score,
                opp_score = EXCLUDED.opp_score,
                fgm = EXCLUDED.fgm, fga = EXCLUDED.fga,
                three_pm = EXCLUDED.three_pm, three_pa = EXCLUDED.three_pa,
                ftm = EXCLUDED.ftm, fta = EXCLUDED.fta,
                orb = EXCLUDED.orb, drb = EXCLUDED.drb, trb = EXCLUDED.trb,
                ast = EXCLUDED.ast, tov = EXCLUDED.tov,
                stl = EXCLUDED.stl, blk = EXCLUDED.blk,
                pf = EXCLUDED.pf, pts = EXCLUDED.pts,
                opp_fgm = EXCLUDED.opp_fgm, opp_fga = EXCLUDED.opp_fga,
                opp_three_pm = EXCLUDED.opp_three_pm, opp_three_pa = EXCLUDED.opp_three_pa,
                opp_ftm = EXCLUDED.opp_ftm, opp_fta = EXCLUDED.opp_fta,
                opp_orb = EXCLUDED.opp_orb, opp_drb = EXCLUDED.opp_drb, opp_trb = EXCLUDED.opp_trb,
                opp_ast = EXCLUDED.opp_ast, opp_tov = EXCLUDED.opp_tov,
                opp_stl = EXCLUDED.opp_stl, opp_blk = EXCLUDED.opp_blk,
                opp_pf = EXCLUDED.opp_pf, opp_pts = EXCLUDED.opp_pts,
                scraped_at = now()""",
            (
                team_id, DB_SEASON, date_str, opp_name_sched,
                opponent_team_id,
                home_away, result, team_score, opp_score,
                our_parsed.get("fgm"), our_parsed.get("fga"),
                our_parsed.get("three_pm"), our_parsed.get("three_pa"),
                our_parsed.get("ftm"), our_parsed.get("fta"),
                our_parsed.get("orb"), our_parsed.get("drb"), our_parsed.get("trb"),
                our_parsed.get("ast"), our_parsed.get("tov"),
                our_parsed.get("stl"), our_parsed.get("blk"),
                our_parsed.get("pf"), our_parsed.get("pts"),
                opp_parsed.get("fgm", 0), opp_parsed.get("fga", 0),
                opp_parsed.get("three_pm", 0), opp_parsed.get("three_pa", 0),
                opp_parsed.get("ftm", 0), opp_parsed.get("fta", 0),
                opp_parsed.get("orb", 0), opp_parsed.get("drb", 0), opp_parsed.get("trb", 0),
                opp_parsed.get("ast", 0), opp_parsed.get("tov", 0),
                opp_parsed.get("stl", 0), opp_parsed.get("blk", 0),
                opp_parsed.get("pf", 0), opp_parsed.get("pts", 0),
                game_id,
            ),
        )
        conn.commit()
        games_loaded += 1

    return games_loaded


def backfill_opponent_season_stats(conn):
    """After game logs are scraped, aggregate opponent totals into team_season_stats."""
    log.info("Backfilling opponent season stats from game logs...")
    conn.execute(
        """UPDATE team_season_stats tss SET
            opp_pts     = agg.opp_pts,
            opp_fgm     = agg.opp_fgm,
            opp_fga     = agg.opp_fga,
            opp_three_pm = agg.opp_three_pm,
            opp_three_pa = agg.opp_three_pa,
            opp_ftm     = agg.opp_ftm,
            opp_fta     = agg.opp_fta,
            opp_orb     = agg.opp_orb,
            opp_drb     = agg.opp_drb,
            opp_trb     = agg.opp_trb,
            opp_ast     = agg.opp_ast,
            opp_tov     = agg.opp_tov,
            opp_stl     = agg.opp_stl,
            opp_blk     = agg.opp_blk,
            opp_pf      = agg.opp_pf,
            scraped_at  = now()
        FROM (
            SELECT
                team_id,
                SUM(opp_pts)      AS opp_pts,
                SUM(opp_fgm)      AS opp_fgm,
                SUM(opp_fga)      AS opp_fga,
                SUM(opp_three_pm) AS opp_three_pm,
                SUM(opp_three_pa) AS opp_three_pa,
                SUM(opp_ftm)      AS opp_ftm,
                SUM(opp_fta)      AS opp_fta,
                SUM(opp_orb)      AS opp_orb,
                SUM(opp_drb)      AS opp_drb,
                SUM(opp_trb)      AS opp_trb,
                SUM(opp_ast)      AS opp_ast,
                SUM(opp_tov)      AS opp_tov,
                SUM(opp_stl)      AS opp_stl,
                SUM(opp_blk)      AS opp_blk,
                SUM(opp_pf)       AS opp_pf
            FROM team_game_log
            WHERE season = %s
            GROUP BY team_id
        ) agg
        WHERE tss.team_id = agg.team_id AND tss.season = %s""",
        (DB_SEASON, DB_SEASON),
    )
    conn.commit()
    log.info("Opponent season stats backfilled")


# ── Full Pipeline ──

def scrape_all(conn, limit: int | None = None, skip_season: bool = False, skip_games: bool = False):
    """Main scrape pipeline."""
    teams = load_teams_from_db(conn, limit)
    if not teams:
        log.error("No NCAA D1 teams found in DB")
        return

    total = len(teams)
    season_ok = 0
    season_fail = 0
    total_games = 0

    for i, team in enumerate(teams):
        log.info("\n[%d/%d] %s (ESPN #%s)", i + 1, total, team["name"], team["espn_id"])

        # Phase 1: Season stats
        if not skip_season:
            try:
                ok = scrape_season_stats(conn, team)
                if ok:
                    season_ok += 1
                    log.info("  Season stats: OK")
                else:
                    season_fail += 1
            except Exception as e:
                log.error("  Season stats error: %s", e)
                conn.rollback()
                season_fail += 1

        # Phase 2: Game logs
        if not skip_games:
            try:
                n = scrape_game_logs(conn, team)
                total_games += n
                log.info("  Game logs: %d games loaded", n)
            except Exception as e:
                log.error("  Game logs error: %s", e)
                conn.rollback()

    # Backfill opponent season stats from game logs
    if not skip_games:
        try:
            backfill_opponent_season_stats(conn)
        except Exception as e:
            log.error("Backfill error: %s", e)
            conn.rollback()

    print_summary(conn, season_ok, season_fail, total_games)


def print_summary(conn, season_ok: int, season_fail: int, total_games: int):
    """Print final summary."""
    with conn.cursor() as cur:
        cur.execute("SELECT count(*) AS n FROM team_season_stats WHERE season = %s", (DB_SEASON,))
        tss_count = cur.fetchone()["n"]
        cur.execute("SELECT count(*) AS n FROM team_game_log WHERE season = %s", (DB_SEASON,))
        tgl_count = cur.fetchone()["n"]

    print("\n" + "=" * 60)
    print("  ESPN NCAA D1 Team Stats -- FINAL SUMMARY")
    print("=" * 60)
    print(f"  Season stats scraped:       {season_ok} ok, {season_fail} failed")
    print(f"  Game logs scraped:          {total_games} games this run")
    print(f"  team_season_stats rows:     {tss_count}")
    print(f"  team_game_log rows:         {tgl_count}")
    print("=" * 60)


# ── Entry Point ──

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "one"

    conn = db.get_conn()
    try:
        if mode == "all":
            log.info("\n%s", "=" * 60)
            log.info("  ESPN NCAA D1 Team Stats -- FULL SCRAPE")
            log.info("%s", "=" * 60)
            scrape_all(conn)

        elif mode == "one":
            log.info("Test mode: scraping 1 team")
            scrape_all(conn, limit=1)

        elif mode == "five":
            log.info("Test mode: scraping 5 teams")
            scrape_all(conn, limit=5)

        elif mode == "season-only":
            log.info("Season-only mode: scraping season stats for all teams")
            scrape_all(conn, skip_games=True)

        elif mode == "games-only":
            log.info("Games-only mode: scraping game logs for all teams")
            scrape_all(conn, skip_season=True)

        else:
            print("Usage: python3 team_stats_scraper.py [one|five|all|season-only|games-only]")
            sys.exit(1)

    finally:
        conn.close()


if __name__ == "__main__":
    main()
