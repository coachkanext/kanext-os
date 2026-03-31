-- ============================================================================
-- KaNeXT Men's Volleyball + Beach Volleyball Player Pool
-- Version 1.0 — March 2026
-- MVB: mvb_teams, mvb_players, mvb_player_stats
-- BVB: bvb_teams, bvb_players, bvb_player_stats
-- ============================================================================

BEGIN;

-- ============================================================================
-- MEN'S VOLLEYBALL — TEAMS
-- Source: stats.ncaa.org (school name embedded in player ranking rows)
-- ============================================================================

CREATE TABLE IF NOT EXISTS mvb_teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR NOT NULL,
    conference      VARCHAR,
    division        VARCHAR,            -- 'd1', 'd2', 'd3'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (name, division)
);

CREATE INDEX IF NOT EXISTS idx_mvb_teams_name ON mvb_teams(name);

-- ============================================================================
-- MEN'S VOLLEYBALL — PLAYERS
-- ncaa_player_id: numeric portion of /players/{id} URL on stats.ncaa.org
-- ============================================================================

CREATE TABLE IF NOT EXISTS mvb_players (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ncaa_player_id  VARCHAR NOT NULL UNIQUE,
    full_name       VARCHAR NOT NULL,
    team_id         UUID REFERENCES mvb_teams(id) ON DELETE SET NULL,
    division        VARCHAR,
    class_year      VARCHAR,            -- 'Fr', 'So', 'Jr', 'Sr', 'Gr'
    height_str      VARCHAR,            -- raw string e.g. '6-3'
    position        VARCHAR,            -- 'OH', 'S', 'MB', 'OPP', 'L', etc.
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mvb_players_name ON mvb_players(full_name);
CREATE INDEX IF NOT EXISTS idx_mvb_players_team ON mvb_players(team_id);

-- ============================================================================
-- MEN'S VOLLEYBALL — PLAYER STATS (season aggregate)
-- One row per player per division per season.
-- sets_played is the primary denominator for per-set rates.
-- ============================================================================

CREATE TABLE IF NOT EXISTS mvb_player_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL REFERENCES mvb_players(id) ON DELETE CASCADE,
    division        VARCHAR NOT NULL,
    season          VARCHAR NOT NULL DEFAULT '2025-26',
    sets_played     INTEGER,
    -- Kills
    kills           INTEGER,
    attack_errors   INTEGER,
    attacks         INTEGER,
    hitting_pct     DECIMAL(6,4),       -- e.g. 0.3210
    kills_per_set   DECIMAL(6,3),
    -- Assists
    assists         INTEGER,
    assists_per_set DECIMAL(6,3),
    -- Blocks
    solo_blocks     INTEGER,
    block_assists   INTEGER,
    total_blocks    DECIMAL(6,1),       -- can be fractional (0.5 per solo/assist)
    blocks_per_set  DECIMAL(6,3),
    -- Digs
    digs            INTEGER,
    digs_per_set    DECIMAL(6,3),
    -- Service aces
    service_aces    INTEGER,
    aces_per_set    DECIMAL(6,3),
    -- Points
    points          DECIMAL(6,1),
    points_per_set  DECIMAL(6,3),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (player_id, division, season)
);

CREATE INDEX IF NOT EXISTS idx_mvb_stats_player ON mvb_player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_mvb_stats_div ON mvb_player_stats(division, season);

-- ============================================================================
-- BEACH VOLLEYBALL — TEAMS
-- Source: stats.ncaa.org (sport_code=WSV) individual stat rankings
-- ============================================================================

CREATE TABLE IF NOT EXISTS bvb_teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR NOT NULL UNIQUE,
    conference      VARCHAR,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bvb_teams_name ON bvb_teams(name);

-- ============================================================================
-- BEACH VOLLEYBALL — PLAYERS
-- Beach volleyball is women's only; pairs-based competition.
-- partner_name: most common partner (populated when pair data available).
-- ============================================================================

CREATE TABLE IF NOT EXISTS bvb_players (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ncaa_player_id  VARCHAR NOT NULL UNIQUE,
    full_name       VARCHAR NOT NULL,
    team_id         UUID REFERENCES bvb_teams(id) ON DELETE SET NULL,
    class_year      VARCHAR,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bvb_players_name ON bvb_players(full_name);
CREATE INDEX IF NOT EXISTS idx_bvb_players_team ON bvb_players(team_id);

-- ============================================================================
-- BEACH VOLLEYBALL — PLAYER STATS (season aggregate)
-- Primary stats: pair win/loss records; individual stats when available.
-- ============================================================================

CREATE TABLE IF NOT EXISTS bvb_player_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL REFERENCES bvb_players(id) ON DELETE CASCADE,
    season          VARCHAR NOT NULL DEFAULT '2025-26',
    -- Win/loss
    wins            INTEGER,
    losses          INTEGER,
    win_pct         DECIMAL(5,3),
    sets_won        INTEGER,
    sets_lost       INTEGER,
    -- Individual stats (if available)
    sets_played     INTEGER,
    kills           INTEGER,
    kills_per_set   DECIMAL(6,3),
    service_aces    INTEGER,
    aces_per_set    DECIMAL(6,3),
    digs            INTEGER,
    digs_per_set    DECIMAL(6,3),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (player_id, season)
);

CREATE INDEX IF NOT EXISTS idx_bvb_stats_player ON bvb_player_stats(player_id);

COMMIT;
