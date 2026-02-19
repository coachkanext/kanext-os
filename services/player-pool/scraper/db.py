"""
Database helper — connection pool and upsert operations.
"""
from __future__ import annotations

import psycopg
from psycopg.rows import dict_row
from config import DB_CONFIG


def get_conn():
    """Get a database connection."""
    return psycopg.connect(
        host=DB_CONFIG["host"],
        port=DB_CONFIG["port"],
        dbname=DB_CONFIG["dbname"],
        row_factory=dict_row,
        autocommit=False,
    )


# ── Lookups ──

def get_association_id(conn, code: str) -> str:
    row = conn.execute(
        "SELECT id FROM associations WHERE code = %s", (code,)
    ).fetchone()
    return str(row["id"])


def get_division_id(conn, assoc_code: str, div_code: str) -> str:
    row = conn.execute(
        """SELECT d.id FROM divisions d
           JOIN associations a ON d.association_id = a.id
           WHERE a.code = %s AND d.code = %s""",
        (assoc_code, div_code),
    ).fetchone()
    return str(row["id"])


def get_competitive_level_id(conn, level_key: str) -> str:
    row = conn.execute(
        "SELECT id FROM competitive_levels WHERE level_key = %s", (level_key,)
    ).fetchone()
    return str(row["id"])


# ── Upserts ──

def upsert_conference(conn, division_id: str, name: str, region: str | None = None) -> str:
    """Insert conference if not exists, return id."""
    row = conn.execute(
        "SELECT id FROM conferences WHERE division_id = %s AND name = %s",
        (division_id, name),
    ).fetchone()
    if row:
        return str(row["id"])
    row = conn.execute(
        """INSERT INTO conferences (division_id, name, region)
           VALUES (%s, %s, %s) RETURNING id""",
        (division_id, name, region),
    ).fetchone()
    return str(row["id"])


def upsert_team(
    conn, name: str, slug: str, conference_id: str | None,
    competitive_level_id: str, city: str | None = None,
    state: str | None = None, base_url: str | None = None,
) -> str:
    """Insert team if not exists (by slug), return id."""
    row = conn.execute(
        "SELECT id FROM teams WHERE slug = %s", (slug,)
    ).fetchone()
    if row:
        return str(row["id"])
    row = conn.execute(
        """INSERT INTO teams (name, slug, conference_id, competitive_level_id, city, state, prestosports_base_url)
           VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id""",
        (name, slug, conference_id, competitive_level_id, city, state, base_url),
    ).fetchone()
    return str(row["id"])


def upsert_team_season(conn, team_id: str, season: str) -> str:
    """Insert team_season if not exists, return id."""
    row = conn.execute(
        "SELECT id FROM team_seasons WHERE team_id = %s AND season = %s",
        (team_id, season),
    ).fetchone()
    if row:
        return str(row["id"])
    row = conn.execute(
        """INSERT INTO team_seasons (team_id, season)
           VALUES (%s, %s) RETURNING id""",
        (team_id, season),
    ).fetchone()
    return str(row["id"])


def upsert_player(conn, full_name: str, positions: list[str] | None = None) -> str:
    """Insert player if not exists (by full_name), return id.
    Simple dedup by exact name match for now."""
    row = conn.execute(
        "SELECT id FROM players WHERE full_name = %s", (full_name,)
    ).fetchone()
    if row:
        # Update positions if provided and not yet set
        if positions:
            conn.execute(
                """UPDATE players SET declared_positions = %s, updated_at = now()
                   WHERE id = %s AND (declared_positions IS NULL OR declared_positions = '{}')""",
                (positions, str(row["id"])),
            )
        return str(row["id"])
    row = conn.execute(
        """INSERT INTO players (full_name, declared_positions)
           VALUES (%s, %s) RETURNING id""",
        (full_name, positions or []),
    ).fetchone()
    return str(row["id"])


def upsert_player_team_season(
    conn, player_id: str, team_season_id: str,
    jersey_number: str | None = None, class_year: str | None = None,
    roster_status: str = "active", position: str | None = None,
) -> str:
    """Insert player_team_season if not exists, return id."""
    row = conn.execute(
        "SELECT id FROM player_team_seasons WHERE player_id = %s AND team_season_id = %s",
        (player_id, team_season_id),
    ).fetchone()
    if row:
        return str(row["id"])
    row = conn.execute(
        """INSERT INTO player_team_seasons (player_id, team_season_id, jersey_number, class_year, roster_status)
           VALUES (%s, %s, %s, %s, %s) RETURNING id""",
        (player_id, team_season_id, jersey_number, class_year, roster_status),
    ).fetchone()
    return str(row["id"])


def upsert_game(
    conn, prestosports_game_id: str, season: str, game_date: str | None,
    home_team_season_id: str | None, away_team_season_id: str | None,
    home_score: int | None, away_score: int | None,
    game_type: str = "NON_CONF", neutral_site: bool = False,
    venue: str | None = None,
) -> str:
    """Insert game if not exists (by prestosports_game_id), return id."""
    row = conn.execute(
        "SELECT id FROM games WHERE prestosports_game_id = %s",
        (prestosports_game_id,),
    ).fetchone()
    if row:
        return str(row["id"])
    row = conn.execute(
        """INSERT INTO games (
            prestosports_game_id, season, game_date,
            home_team_season_id, away_team_season_id,
            home_score, away_score, game_type, neutral_site, venue,
            data_completeness, scraped_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'full', now())
        RETURNING id""",
        (prestosports_game_id, season, game_date,
         home_team_season_id, away_team_season_id,
         home_score, away_score, game_type, neutral_site, venue),
    ).fetchone()
    return str(row["id"])


def upsert_player_game_stats(
    conn, game_id: str, player_team_season_id: str, stats: dict,
) -> str:
    """Insert player_game_stats if not exists, return id."""
    row = conn.execute(
        "SELECT id FROM player_game_stats WHERE game_id = %s AND player_team_season_id = %s",
        (game_id, player_team_season_id),
    ).fetchone()
    if row:
        return str(row["id"])
    row = conn.execute(
        """INSERT INTO player_game_stats (
            game_id, player_team_season_id, started, minutes,
            fgm, fga, three_pm, three_pa, ftm, fta,
            oreb, dreb, reb, ast, stl, blk, turnovers, pf, pts
        ) VALUES (
            %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s
        ) RETURNING id""",
        (
            game_id, player_team_season_id, stats.get("started", False), stats.get("minutes", 0),
            stats.get("fgm", 0), stats.get("fga", 0), stats.get("three_pm", 0), stats.get("three_pa", 0),
            stats.get("ftm", 0), stats.get("fta", 0),
            stats.get("oreb", 0), stats.get("dreb", 0), stats.get("reb", 0),
            stats.get("ast", 0), stats.get("stl", 0), stats.get("blk", 0),
            stats.get("turnovers", 0), stats.get("pf", 0), stats.get("pts", 0),
        ),
    ).fetchone()
    return str(row["id"])


def upsert_team_game_stats(
    conn, game_id: str, team_season_id: str, is_home: bool, stats: dict,
) -> str:
    """Insert team_game_stats if not exists, return id."""
    row = conn.execute(
        "SELECT id FROM team_game_stats WHERE game_id = %s AND team_season_id = %s",
        (game_id, team_season_id),
    ).fetchone()
    if row:
        return str(row["id"])

    # Calculate possessions: FGA - OREB + TO + (0.44 * FTA)
    fga = stats.get("fga", 0) or 0
    oreb = stats.get("oreb", 0) or 0
    to = stats.get("turnovers", 0) or 0
    fta = stats.get("fta", 0) or 0
    possessions = fga - oreb + to + (0.44 * fta)

    pts = stats.get("pts", 0) or 0
    off_ppp = round(pts / possessions, 3) if possessions > 0 else None

    row = conn.execute(
        """INSERT INTO team_game_stats (
            game_id, team_season_id, is_home,
            fgm, fga, fg_pct, three_pm, three_pa, three_pct,
            ftm, fta, ft_pct,
            oreb, dreb, reb, ast, stl, blk, turnovers, pf, pts,
            possessions, off_ppp
        ) VALUES (
            %s, %s, %s,
            %s, %s, %s, %s, %s, %s,
            %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s
        ) RETURNING id""",
        (
            game_id, team_season_id, is_home,
            stats.get("fgm", 0), fga, stats.get("fg_pct"),
            stats.get("three_pm", 0), stats.get("three_pa", 0), stats.get("three_pct"),
            stats.get("ftm", 0), fta, stats.get("ft_pct"),
            oreb, stats.get("dreb", 0), stats.get("reb", 0),
            stats.get("ast", 0), stats.get("stl", 0), stats.get("blk", 0),
            to, stats.get("pf", 0), pts,
            round(possessions, 1), off_ppp,
        ),
    ).fetchone()
    return str(row["id"])


def update_game_possessions(conn, game_id: str):
    """Update game-level possessions from team_game_stats averages."""
    rows = conn.execute(
        """SELECT is_home, possessions FROM team_game_stats
           WHERE game_id = %s ORDER BY is_home DESC""",
        (game_id,),
    ).fetchall()
    if len(rows) == 2:
        home_poss = rows[0]["possessions"] if rows[0]["is_home"] else rows[1]["possessions"]
        away_poss = rows[1]["possessions"] if not rows[1]["is_home"] else rows[0]["possessions"]
        conn.execute(
            """UPDATE games SET
                home_possessions = %s,
                away_possessions = %s,
                possession_source = 'estimated'
               WHERE id = %s""",
            (home_poss, away_poss, game_id),
        )


def log_scrape(conn, url: str, status: str, response_code: int, error_message: str | None, records_created: int):
    """Log a scrape attempt."""
    conn.execute(
        """INSERT INTO scrape_log (url, status, response_code, error_message, records_created)
           VALUES (%s, %s, %s, %s, %s)""",
        (url, status, response_code, error_message, records_created),
    )
