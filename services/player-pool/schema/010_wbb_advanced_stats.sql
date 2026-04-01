-- ============================================================================
-- KaNeXT Women's Basketball Advanced Stats — stats.ncaa.org
-- Version 1.0 — March 2026
-- Tables: wbb_adv_teams, wbb_adv_players, wbb_adv_stats
-- Source: stats.ncaa.org (sport_code=WBB, D1/D2/D3)
-- ============================================================================

BEGIN;

-- ============================================================================
-- TEAMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS wbb_adv_teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR NOT NULL,
    conference      VARCHAR,
    division        VARCHAR NOT NULL,   -- 'd1', 'd2', 'd3'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (name, division)
);

CREATE INDEX IF NOT EXISTS idx_wbb_adv_teams_name ON wbb_adv_teams(name);

-- ============================================================================
-- PLAYERS
-- ncaa_player_id: numeric portion of /players/{id} URL on stats.ncaa.org
-- ============================================================================

CREATE TABLE IF NOT EXISTS wbb_adv_players (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ncaa_player_id  VARCHAR NOT NULL UNIQUE,
    full_name       VARCHAR NOT NULL,
    team_id         UUID REFERENCES wbb_adv_teams(id) ON DELETE SET NULL,
    division        VARCHAR,
    class_year      VARCHAR,
    height_str      VARCHAR,
    position        VARCHAR,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wbb_adv_players_name ON wbb_adv_players(full_name);
CREATE INDEX IF NOT EXISTS idx_wbb_adv_players_team ON wbb_adv_players(team_id);

-- ============================================================================
-- STATS (season aggregate, per-game and totals)
-- UNIQUE per player per division per season — allows D1+D2+D3 without collision.
-- eFG% and TS% are computed from raw totals.
-- ============================================================================

CREATE TABLE IF NOT EXISTS wbb_adv_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL REFERENCES wbb_adv_players(id) ON DELETE CASCADE,
    division        VARCHAR NOT NULL,
    season          VARCHAR NOT NULL DEFAULT '2025-26',

    -- Games
    games           INTEGER,
    minutes_played  INTEGER,            -- total MP
    mpg             DECIMAL(5,2),       -- minutes per game

    -- Scoring
    points          INTEGER,            -- total PTS
    ppg             DECIMAL(5,2),
    fgm             INTEGER,
    fga             INTEGER,
    fg_pct          DECIMAL(6,4),       -- 0.0–1.0
    fg3m            INTEGER,
    fg3a            INTEGER,
    fg3_pct         DECIMAL(6,4),
    fg3pg           DECIMAL(5,2),
    ftm             INTEGER,
    fta             INTEGER,
    ft_pct          DECIMAL(6,4),

    -- Computed advanced shooting
    efg_pct         DECIMAL(6,4),       -- (FGM + 0.5*3FGM) / FGA
    ts_pct          DECIMAL(6,4),       -- PTS / (2*(FGA + 0.44*FTA))

    -- Rebounds
    offensive_reb   INTEGER,
    defensive_reb   INTEGER,
    rebounds        INTEGER,
    rpg             DECIMAL(5,2),

    -- Playmaking
    assists         INTEGER,
    apg             DECIMAL(5,2),
    turnovers       INTEGER,
    ast_to_ratio    DECIMAL(5,3),

    -- Defense
    steals          INTEGER,
    spg             DECIMAL(5,2),
    blocks          INTEGER,
    bpg             DECIMAL(5,2),

    -- Extras
    double_doubles  INTEGER,
    triple_doubles  INTEGER,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (player_id, division, season)
);

CREATE INDEX IF NOT EXISTS idx_wbb_adv_stats_player ON wbb_adv_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_wbb_adv_stats_div    ON wbb_adv_stats(division, season);

COMMIT;
