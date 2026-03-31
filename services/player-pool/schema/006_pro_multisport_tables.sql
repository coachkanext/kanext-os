-- ============================================================================
-- KaNeXT Pro Multi-Sport Player Pool — NFL, MLB, WNBA, Soccer
-- Version 1.0 — March 2026
-- Prefixes: profb_ (NFL), promlb_ (MLB), prownba_ (WNBA), prosc_ (Soccer)
-- ============================================================================

BEGIN;

-- ============================================================================
-- NFL (profb_)
-- Source: nfl_data_py (nflverse)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profb_teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_abbr       VARCHAR NOT NULL UNIQUE,    -- 'KC', 'PHI', etc.
    name            VARCHAR NOT NULL,
    full_name       VARCHAR,
    conference      VARCHAR,                    -- 'AFC' | 'NFC'
    division        VARCHAR,                    -- 'AFC West', 'NFC East', etc.
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profb_teams_abbr ON profb_teams(team_abbr);

CREATE TABLE IF NOT EXISTS profb_players (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gsis_id         VARCHAR NOT NULL UNIQUE,    -- NFL official player ID
    full_name       VARCHAR NOT NULL,
    position        VARCHAR,
    height_inches   INTEGER,
    weight_lbs      INTEGER,
    jersey_number   VARCHAR,
    years_exp       INTEGER,
    age             INTEGER,
    college         VARCHAR,
    team_id         UUID REFERENCES profb_teams(id) ON DELETE SET NULL,
    season          INTEGER NOT NULL DEFAULT 2024,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profb_players_gsis_id ON profb_players(gsis_id);
CREATE INDEX IF NOT EXISTS idx_profb_players_team_id ON profb_players(team_id);
CREATE INDEX IF NOT EXISTS idx_profb_players_full_name ON profb_players(full_name);
CREATE INDEX IF NOT EXISTS idx_profb_players_position ON profb_players(position);

CREATE TABLE IF NOT EXISTS profb_player_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL REFERENCES profb_players(id) ON DELETE CASCADE,
    season          INTEGER NOT NULL DEFAULT 2024,
    season_type     VARCHAR NOT NULL DEFAULT 'REG',   -- 'REG' | 'POST'
    -- Shared
    games           INTEGER,
    fantasy_points  DECIMAL(8,2),
    fantasy_ppr     DECIMAL(8,2),
    -- Passing
    completions     INTEGER,
    pass_att        INTEGER,
    pass_yards      INTEGER,
    pass_td         INTEGER,
    interceptions   INTEGER,
    pass_epa        DECIMAL(8,4),
    -- Rushing
    carries         INTEGER,
    rush_yards      INTEGER,
    rush_td         INTEGER,
    rush_epa        DECIMAL(8,4),
    -- Receiving
    receptions      INTEGER,
    targets         INTEGER,
    rec_yards       INTEGER,
    rec_td          INTEGER,
    target_share    DECIMAL(6,4),
    -- Special teams
    special_td      INTEGER,
    UNIQUE (player_id, season, season_type)
);

CREATE INDEX IF NOT EXISTS idx_profb_player_stats_player_id ON profb_player_stats(player_id);

-- ============================================================================
-- MLB (promlb_)
-- Source: pybaseball (FanGraphs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS promlb_teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    abbreviation    VARCHAR NOT NULL UNIQUE,    -- 'NYY', 'LAD', etc.
    name            VARCHAR NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promlb_teams_abbr ON promlb_teams(abbreviation);

CREATE TABLE IF NOT EXISTS promlb_players (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fg_player_id    INTEGER NOT NULL UNIQUE,    -- FanGraphs player ID
    full_name       VARCHAR NOT NULL,
    team_id         UUID REFERENCES promlb_teams(id) ON DELETE SET NULL,
    season          INTEGER NOT NULL DEFAULT 2024,
    age             INTEGER,
    player_type     VARCHAR NOT NULL DEFAULT 'batter',  -- 'batter' | 'pitcher'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promlb_players_fg_id ON promlb_players(fg_player_id);
CREATE INDEX IF NOT EXISTS idx_promlb_players_team_id ON promlb_players(team_id);
CREATE INDEX IF NOT EXISTS idx_promlb_players_name ON promlb_players(full_name);

CREATE TABLE IF NOT EXISTS promlb_batting_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL REFERENCES promlb_players(id) ON DELETE CASCADE,
    season          INTEGER NOT NULL DEFAULT 2024,
    games           INTEGER,
    pa              INTEGER,
    at_bats         INTEGER,
    hits            INTEGER,
    doubles         INTEGER,
    triples         INTEGER,
    home_runs       INTEGER,
    rbi             INTEGER,
    runs            INTEGER,
    walks           INTEGER,
    strikeouts      INTEGER,
    stolen_bases    INTEGER,
    batting_avg     DECIMAL(5,3),
    obp             DECIMAL(5,3),
    slg             DECIMAL(5,3),
    ops             DECIMAL(5,3),
    war             DECIMAL(5,2),
    wrc_plus        DECIMAL(6,1),
    babip           DECIMAL(5,3),
    iso             DECIMAL(5,3),
    UNIQUE (player_id, season)
);

CREATE INDEX IF NOT EXISTS idx_promlb_batting_player_id ON promlb_batting_stats(player_id);

CREATE TABLE IF NOT EXISTS promlb_pitching_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL REFERENCES promlb_players(id) ON DELETE CASCADE,
    season          INTEGER NOT NULL DEFAULT 2024,
    games           INTEGER,
    games_started   INTEGER,
    innings_pitched DECIMAL(6,1),
    wins            INTEGER,
    losses          INTEGER,
    saves           INTEGER,
    holds           INTEGER,
    era             DECIMAL(5,2),
    whip            DECIMAL(5,3),
    strikeouts      INTEGER,
    walks           INTEGER,
    k_per_9         DECIMAL(5,2),
    bb_per_9        DECIMAL(5,2),
    k_pct           DECIMAL(5,3),
    bb_pct          DECIMAL(5,3),
    hr_per_9        DECIMAL(5,2),
    fip             DECIMAL(5,2),
    xfip            DECIMAL(5,2),
    war             DECIMAL(5,2),
    babip           DECIMAL(5,3),
    lob_pct         DECIMAL(5,3),
    UNIQUE (player_id, season)
);

CREATE INDEX IF NOT EXISTS idx_promlb_pitching_player_id ON promlb_pitching_stats(player_id);

-- ============================================================================
-- WNBA (prownba_)
-- Source: ESPN core API
-- ============================================================================

CREATE TABLE IF NOT EXISTS prownba_teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    espn_team_id    VARCHAR NOT NULL UNIQUE,
    name            VARCHAR NOT NULL,
    abbreviation    VARCHAR,
    location        VARCHAR,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prownba_teams_espn_id ON prownba_teams(espn_team_id);

CREATE TABLE IF NOT EXISTS prownba_players (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    espn_player_id  VARCHAR NOT NULL UNIQUE,
    full_name       VARCHAR NOT NULL,
    position        VARCHAR,
    height_inches   INTEGER,
    weight_lbs      INTEGER,
    age             INTEGER,
    jersey_number   VARCHAR,
    team_id         UUID REFERENCES prownba_teams(id) ON DELETE SET NULL,
    season          INTEGER NOT NULL DEFAULT 2025,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prownba_players_espn_id ON prownba_players(espn_player_id);
CREATE INDEX IF NOT EXISTS idx_prownba_players_team_id ON prownba_players(team_id);
CREATE INDEX IF NOT EXISTS idx_prownba_players_name ON prownba_players(full_name);

CREATE TABLE IF NOT EXISTS prownba_player_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL REFERENCES prownba_players(id) ON DELETE CASCADE,
    season          INTEGER NOT NULL DEFAULT 2025,
    gp              INTEGER,
    gs              INTEGER,
    mpg             DECIMAL(5,2),
    ppg             DECIMAL(5,2),
    rpg             DECIMAL(5,2),
    apg             DECIMAL(5,2),
    spg             DECIMAL(5,2),
    bpg             DECIMAL(5,2),
    to_pg           DECIMAL(5,2),
    fg_pct          DECIMAL(5,2),
    three_pct       DECIMAL(5,2),
    ft_pct          DECIMAL(5,2),
    fg_made         DECIMAL(5,2),
    fg_att          DECIMAL(5,2),
    three_made      DECIMAL(5,2),
    three_att       DECIMAL(5,2),
    orpg            DECIMAL(5,2),
    drpg            DECIMAL(5,2),
    plus_minus      INTEGER,
    double_doubles  INTEGER,
    triple_doubles  INTEGER,
    UNIQUE (player_id, season)
);

CREATE INDEX IF NOT EXISTS idx_prownba_player_stats_player_id ON prownba_player_stats(player_id);

-- ============================================================================
-- Soccer (prosc_)
-- Source: ESPN site/core API
-- Leagues: MLS (usa.1), NWSL (usa.nwsl), EPL (eng.1), La Liga (esp.1),
--          Bundesliga (ger.1), Serie A (ita.1), Ligue 1 (fra.1)
-- ============================================================================

CREATE TABLE IF NOT EXISTS prosc_leagues (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_key      VARCHAR NOT NULL UNIQUE,    -- 'usa.1', 'eng.1', etc.
    name            VARCHAR NOT NULL,
    country         VARCHAR,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prosc_leagues_key ON prosc_leagues(league_key);

CREATE TABLE IF NOT EXISTS prosc_teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    espn_team_id    VARCHAR NOT NULL,
    league_id       UUID NOT NULL REFERENCES prosc_leagues(id) ON DELETE CASCADE,
    name            VARCHAR NOT NULL,
    abbreviation    VARCHAR,
    location        VARCHAR,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (espn_team_id, league_id)
);

CREATE INDEX IF NOT EXISTS idx_prosc_teams_espn_id ON prosc_teams(espn_team_id);
CREATE INDEX IF NOT EXISTS idx_prosc_teams_league_id ON prosc_teams(league_id);
CREATE INDEX IF NOT EXISTS idx_prosc_teams_name ON prosc_teams(name);

CREATE TABLE IF NOT EXISTS prosc_players (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    espn_player_id  VARCHAR NOT NULL UNIQUE,
    full_name       VARCHAR NOT NULL,
    position        VARCHAR,
    height_inches   INTEGER,
    weight_lbs      INTEGER,
    age             INTEGER,
    jersey_number   VARCHAR,
    nationality     VARCHAR,
    team_id         UUID REFERENCES prosc_teams(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prosc_players_espn_id ON prosc_players(espn_player_id);
CREATE INDEX IF NOT EXISTS idx_prosc_players_team_id ON prosc_players(team_id);
CREATE INDEX IF NOT EXISTS idx_prosc_players_name ON prosc_players(full_name);

CREATE TABLE IF NOT EXISTS prosc_player_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL REFERENCES prosc_players(id) ON DELETE CASCADE,
    league_id       UUID NOT NULL REFERENCES prosc_leagues(id) ON DELETE CASCADE,
    season          INTEGER NOT NULL DEFAULT 2024,
    games           INTEGER,
    games_started   INTEGER,
    minutes         INTEGER,
    goals           INTEGER,
    assists         INTEGER,
    yellow_cards    INTEGER,
    red_cards       INTEGER,
    shots           INTEGER,
    shots_on_target INTEGER,
    -- GK specific (NULL for field players)
    saves           INTEGER,
    goals_allowed   INTEGER,
    clean_sheets    INTEGER,
    save_pct        DECIMAL(5,3),
    UNIQUE (player_id, league_id, season)
);

CREATE INDEX IF NOT EXISTS idx_prosc_player_stats_player_id ON prosc_player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_prosc_player_stats_league_id ON prosc_player_stats(league_id);

COMMIT;
