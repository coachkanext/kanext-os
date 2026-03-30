-- ============================================================================
-- KaNeXT Pro Player Pool — NBA Tables
-- Version 1.0 — March 2026
-- Parallel structure to college pool tables for unified dashboard queries
-- ============================================================================

BEGIN;

-- ============================================================================
-- PRO TEAMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS pro_teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nba_team_id     INTEGER NOT NULL UNIQUE,
    name            VARCHAR NOT NULL,
    abbreviation    VARCHAR NOT NULL,
    conference      VARCHAR NOT NULL,   -- 'East' | 'West'
    division        VARCHAR NOT NULL,   -- e.g. 'Northwest', 'Atlantic'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pro_teams_nba_team_id ON pro_teams(nba_team_id);

-- ============================================================================
-- PRO PLAYERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS pro_players (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nba_player_id   INTEGER NOT NULL UNIQUE,
    full_name       VARCHAR NOT NULL,
    position        VARCHAR,            -- e.g. 'PG', 'SG-SF'
    height_inches   INTEGER,
    weight_lbs      INTEGER,
    age             INTEGER,
    jersey_number   VARCHAR,
    pro_team_id     UUID REFERENCES pro_teams(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pro_players_nba_player_id ON pro_players(nba_player_id);
CREATE INDEX IF NOT EXISTS idx_pro_players_pro_team_id ON pro_players(pro_team_id);
CREATE INDEX IF NOT EXISTS idx_pro_players_full_name ON pro_players(full_name);

-- ============================================================================
-- PRO PLAYER SEASON STATS (per-game averages)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pro_player_season_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL REFERENCES pro_players(id) ON DELETE CASCADE,
    pro_team_id     UUID REFERENCES pro_teams(id) ON DELETE SET NULL,
    season          VARCHAR NOT NULL DEFAULT '2025-26',
    gp              INTEGER,
    mpg             DECIMAL(5,2),
    ppg             DECIMAL(5,2),
    rpg             DECIMAL(5,2),
    apg             DECIMAL(5,2),
    spg             DECIMAL(5,2),
    bpg             DECIMAL(5,2),
    to_pg           DECIMAL(5,2),
    fg_pct          DECIMAL(5,4),
    three_pct       DECIMAL(5,4),
    ft_pct          DECIMAL(5,4),
    fga_pg          DECIMAL(5,2),
    three_pa_pg     DECIMAL(5,2),
    fta_pg          DECIMAL(5,2),
    oreb_pg         DECIMAL(5,2),
    dreb_pg         DECIMAL(5,2),
    pf_pg           DECIMAL(5,2),
    UNIQUE (player_id, season)
);

CREATE INDEX IF NOT EXISTS idx_pro_player_season_stats_player_id ON pro_player_season_stats(player_id);

-- ============================================================================
-- PRO PLAYER ADVANCED STATS
-- ============================================================================

CREATE TABLE IF NOT EXISTS pro_player_advanced_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL REFERENCES pro_players(id) ON DELETE CASCADE,
    pro_team_id     UUID REFERENCES pro_teams(id) ON DELETE SET NULL,
    season          VARCHAR NOT NULL DEFAULT '2025-26',
    -- nba_api sourced
    per             DECIMAL(6,2),       -- Player Efficiency Rating
    ts_pct          DECIMAL(5,4),       -- True Shooting %
    efg_pct         DECIMAL(5,4),       -- Effective FG %
    usg_pct         DECIMAL(5,4),       -- Usage Rate
    ast_pct         DECIMAL(5,4),       -- Assist %
    tov_pct         DECIMAL(5,4),       -- Turnover %
    ortg            DECIMAL(6,1),       -- Offensive Rating
    drtg            DECIMAL(6,1),       -- Defensive Rating
    net_rating      DECIMAL(6,1),
    -- basketball-reference sourced
    bpm             DECIMAL(5,2),       -- Box Plus/Minus
    obpm            DECIMAL(5,2),
    dbpm            DECIMAL(5,2),
    vorp            DECIMAL(5,2),       -- Value Over Replacement Player
    ws              DECIMAL(5,2),       -- Win Shares
    ws_48           DECIMAL(6,4),       -- Win Shares per 48 min
    UNIQUE (player_id, season)
);

CREATE INDEX IF NOT EXISTS idx_pro_player_advanced_stats_player_id ON pro_player_advanced_stats(player_id);

-- ============================================================================
-- PRO TEAM SEASON STATS
-- ============================================================================

CREATE TABLE IF NOT EXISTS pro_team_season_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pro_team_id     UUID NOT NULL REFERENCES pro_teams(id) ON DELETE CASCADE,
    season          VARCHAR NOT NULL DEFAULT '2025-26',
    wins            INTEGER,
    losses          INTEGER,
    conf_standing   INTEGER,
    ortg            DECIMAL(6,1),
    drtg            DECIMAL(6,1),
    pace            DECIMAL(6,2),
    net_rating      DECIMAL(6,1),
    UNIQUE (pro_team_id, season)
);

CREATE INDEX IF NOT EXISTS idx_pro_team_season_stats_pro_team_id ON pro_team_season_stats(pro_team_id);

COMMIT;
