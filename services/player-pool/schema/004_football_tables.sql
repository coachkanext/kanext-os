-- ============================================================================
-- KaNeXT College Football Player Pool — fb_ Tables
-- Version 1.0 — March 2026
-- Parallel structure to basketball pool; same kanext_player_pool instance
-- ============================================================================

BEGIN;

-- ============================================================================
-- ASSOCIATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS fb_associations (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name    VARCHAR NOT NULL UNIQUE  -- 'NCAA', 'NAIA', 'NJCAA', 'CCCAA'
);

-- ============================================================================
-- DIVISIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS fb_divisions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    association_id  UUID NOT NULL REFERENCES fb_associations(id),
    name            VARCHAR NOT NULL,
    UNIQUE (association_id, name)
);

-- ============================================================================
-- COMPETITIVE LEVELS
-- ============================================================================

CREATE TABLE IF NOT EXISTS fb_competitive_levels (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    division_id     UUID NOT NULL REFERENCES fb_divisions(id),
    level_key       VARCHAR NOT NULL UNIQUE,  -- 'fbs_p4', 'fbs_g5', 'fcs_top', ...
    lambda          DECIMAL(6,4) NOT NULL DEFAULT 1.0000,
    display_name    VARCHAR NOT NULL,
    level_tier      INTEGER NOT NULL DEFAULT 5  -- higher = stronger
);

CREATE INDEX IF NOT EXISTS idx_fb_competitive_levels_level_key ON fb_competitive_levels(level_key);

-- ============================================================================
-- CONFERENCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS fb_conferences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_id        UUID NOT NULL REFERENCES fb_competitive_levels(id),
    name            VARCHAR NOT NULL,
    abbreviation    VARCHAR,
    espn_group_id   INTEGER UNIQUE,
    UNIQUE (level_id, name)
);

CREATE INDEX IF NOT EXISTS idx_fb_conferences_level_id ON fb_conferences(level_id);

-- ============================================================================
-- TEAMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS fb_teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conference_id   UUID REFERENCES fb_conferences(id) ON DELETE SET NULL,
    name            VARCHAR NOT NULL,
    mascot          VARCHAR,
    city            VARCHAR,
    state           VARCHAR,
    espn_team_id    INTEGER UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fb_teams_conference_id ON fb_teams(conference_id);
CREATE INDEX IF NOT EXISTS idx_fb_teams_espn_team_id ON fb_teams(espn_team_id);
CREATE INDEX IF NOT EXISTS idx_fb_teams_name ON fb_teams(name);

-- ============================================================================
-- TEAM SEASONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS fb_team_seasons (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id             UUID NOT NULL REFERENCES fb_teams(id) ON DELETE CASCADE,
    season              VARCHAR NOT NULL,
    head_coach          VARCHAR,
    wins                INTEGER,
    losses              INTEGER,
    conf_wins           INTEGER,
    conf_losses         INTEGER,
    postseason_result   VARCHAR,  -- 'CFP Championship', 'CFP Semifinal', bowl name, NULL
    UNIQUE (team_id, season)
);

CREATE INDEX IF NOT EXISTS idx_fb_team_seasons_team_id ON fb_team_seasons(team_id);

-- ============================================================================
-- PLAYERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS fb_players (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR NOT NULL,
    position        VARCHAR,       -- 'QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P', 'LS'
    height          INTEGER,       -- inches
    weight          INTEGER,       -- lbs
    hometown        VARCHAR,
    high_school     VARCHAR,
    stars_247       INTEGER,       -- 0-5
    espn_athlete_id INTEGER UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fb_players_espn_athlete_id ON fb_players(espn_athlete_id);
CREATE INDEX IF NOT EXISTS idx_fb_players_full_name ON fb_players(full_name);

-- ============================================================================
-- PLAYER TEAM SEASONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS fb_player_team_seasons (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id   UUID NOT NULL REFERENCES fb_players(id) ON DELETE CASCADE,
    team_id     UUID NOT NULL REFERENCES fb_teams(id) ON DELETE CASCADE,
    season      VARCHAR NOT NULL,
    jersey      VARCHAR,
    class_year  VARCHAR,    -- 'FR', 'SO', 'JR', 'SR', 'GR'
    games       INTEGER,
    starts      INTEGER,
    UNIQUE (player_id, team_id, season)
);

CREATE INDEX IF NOT EXISTS idx_fb_pts_player_id ON fb_player_team_seasons(player_id);
CREATE INDEX IF NOT EXISTS idx_fb_pts_team_id ON fb_player_team_seasons(team_id);
CREATE INDEX IF NOT EXISTS idx_fb_pts_season ON fb_player_team_seasons(season);

-- ============================================================================
-- QB SEASON STATS
-- ============================================================================

CREATE TABLE IF NOT EXISTS fb_qb_season_stats (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_team_season_id   UUID NOT NULL UNIQUE
                            REFERENCES fb_player_team_seasons(id) ON DELETE CASCADE,
    comp                    INTEGER,
    att                     INTEGER,
    comp_pct                DECIMAL(5,2),   -- e.g. 65.40
    pass_yards              INTEGER,
    ypa                     DECIMAL(5,2),
    pass_td                 INTEGER,
    int                     INTEGER,
    rating                  DECIMAL(6,2),   -- passer rating (NCAA scale 0-158.3)
    rush_att                INTEGER,
    rush_yards              INTEGER,
    rush_td                 INTEGER
);

-- ============================================================================
-- SKILL POSITION SEASON STATS  (RB / WR / TE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fb_skill_season_stats (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_team_season_id   UUID NOT NULL UNIQUE
                            REFERENCES fb_player_team_seasons(id) ON DELETE CASCADE,
    rush_att                INTEGER,
    rush_yards              INTEGER,
    ypc                     DECIMAL(5,2),
    rush_td                 INTEGER,
    rec                     INTEGER,
    rec_yards               INTEGER,
    ypr                     DECIMAL(5,2),
    rec_td                  INTEGER,
    targets                 INTEGER,
    all_purpose_yards       INTEGER
);

-- ============================================================================
-- DEFENSIVE SEASON STATS
-- ============================================================================

CREATE TABLE IF NOT EXISTS fb_defense_season_stats (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_team_season_id   UUID NOT NULL UNIQUE
                            REFERENCES fb_player_team_seasons(id) ON DELETE CASCADE,
    tackles                 INTEGER,
    solo                    INTEGER,
    assists                 INTEGER,
    tfl                     DECIMAL(5,1),   -- tackles for loss
    sacks                   DECIMAL(5,1),
    int                     INTEGER,
    pbu                     INTEGER,
    ff                      INTEGER,        -- forced fumbles
    fr                      INTEGER,        -- fumble recoveries
    def_td                  INTEGER
);

-- ============================================================================
-- KICKER / PUNTER SEASON STATS
-- ============================================================================

CREATE TABLE IF NOT EXISTS fb_kicker_season_stats (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_team_season_id   UUID NOT NULL UNIQUE
                            REFERENCES fb_player_team_seasons(id) ON DELETE CASCADE,
    fgm                     INTEGER,
    fga                     INTEGER,
    fg_pct                  DECIMAL(5,2),
    fg_long                 INTEGER,
    xpm                     INTEGER,
    xpa                     INTEGER,
    points                  INTEGER
);

COMMIT;
