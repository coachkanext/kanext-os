-- ============================================================================
-- KaNeXT Pro Basketball (International + G League) Player Pool
-- Version 1.0 — March 2026
-- Tables: proball_leagues, proball_teams, proball_players,
--         proball_player_stats, proball_standings
-- Sources: euroleague_api (EuroLeague/EuroCup), SofaScore REST API
--          (12 international leagues), nba_api (G League)
-- ============================================================================

BEGIN;

-- ============================================================================
-- LEAGUES — catalog of all loaded competitions
-- ============================================================================

CREATE TABLE IF NOT EXISTS proball_leagues (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR NOT NULL UNIQUE,    -- "EuroLeague", "Spanish ACB", etc.
    short_name          VARCHAR,                    -- "EuroLeague", "ACB", "G League"
    country             VARCHAR,                    -- "Multi", "Spain", "USA", etc.
    source              VARCHAR NOT NULL,           -- 'euroleague_api' | 'sofascore' | 'nba_api'
    sofascore_tid       INTEGER,                    -- SofaScore unique tournament ID
    sofascore_season_id INTEGER,                    -- SofaScore season ID (current)
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proball_leagues_short ON proball_leagues(short_name);

-- ============================================================================
-- TEAMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS proball_teams (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR NOT NULL,
    league_id           UUID NOT NULL REFERENCES proball_leagues(id) ON DELETE CASCADE,
    country             VARCHAR,
    conference          VARCHAR,
    sofascore_team_id   INTEGER,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (name, league_id)
);

CREATE INDEX IF NOT EXISTS idx_proball_teams_league ON proball_teams(league_id);
CREATE INDEX IF NOT EXISTS idx_proball_teams_name   ON proball_teams(name);

-- ============================================================================
-- PLAYERS
-- source_player_id: namespaced unique ID across all sources
--   'el:{code}'    — EuroLeague  (e.g. 'el:010035')
--   'ec:{code}'    — EuroCup
--   'ss:{id}'      — SofaScore  (e.g. 'ss:861903')
--   'nba:{id}'     — nba_api G League player ID
-- ============================================================================

CREATE TABLE IF NOT EXISTS proball_players (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name           VARCHAR NOT NULL,
    team_id             UUID REFERENCES proball_teams(id) ON DELETE SET NULL,
    league_id           UUID REFERENCES proball_leagues(id) ON DELETE SET NULL,
    position            VARCHAR,
    height_cm           INTEGER,
    nationality         VARCHAR,
    source_player_id    VARCHAR NOT NULL UNIQUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proball_players_name   ON proball_players(full_name);
CREATE INDEX IF NOT EXISTS idx_proball_players_team   ON proball_players(team_id);
CREATE INDEX IF NOT EXISTS idx_proball_players_league ON proball_players(league_id);

-- ============================================================================
-- PLAYER STATS (season aggregates, per-game)
-- fg_pct: overall field goal % (2pt + 3pt combined)
-- two_pt_pct / three_pt_pct stored separately (EuroLeague API provides both)
-- ============================================================================

CREATE TABLE IF NOT EXISTS proball_player_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL REFERENCES proball_players(id) ON DELETE CASCADE,
    league_id       UUID NOT NULL REFERENCES proball_leagues(id) ON DELETE CASCADE,
    season          VARCHAR NOT NULL DEFAULT '2025-26',
    gp              INTEGER,
    mpg             DECIMAL(6,2),
    ppg             DECIMAL(6,2),
    rpg             DECIMAL(6,2),
    apg             DECIMAL(6,2),
    spg             DECIMAL(6,2),
    bpg             DECIMAL(6,2),
    topg            DECIMAL(6,2),
    fg_pct          DECIMAL(6,4),   -- 0.0–1.0
    two_pt_pct      DECIMAL(6,4),
    three_pt_pct    DECIMAL(6,4),
    ft_pct          DECIMAL(6,4),
    plus_minus      DECIMAL(6,2),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (player_id, league_id, season)
);

CREATE INDEX IF NOT EXISTS idx_proball_stats_player ON proball_player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_proball_stats_league ON proball_player_stats(league_id, season);

-- ============================================================================
-- STANDINGS (team season record)
-- ============================================================================

CREATE TABLE IF NOT EXISTS proball_standings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id     UUID NOT NULL REFERENCES proball_teams(id) ON DELETE CASCADE,
    league_id   UUID NOT NULL REFERENCES proball_leagues(id) ON DELETE CASCADE,
    season      VARCHAR NOT NULL DEFAULT '2025-26',
    position    INTEGER,
    wins        INTEGER,
    losses      INTEGER,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (team_id, league_id, season)
);

CREATE INDEX IF NOT EXISTS idx_proball_standings_league ON proball_standings(league_id, season);

COMMIT;
