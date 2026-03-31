-- ============================================================================
-- KaNeXT Multi-Sport Player Pool — NCAA non-basketball sports
-- Version 1.0 — March 2026
-- Sports: wbb (women's basketball), bb (baseball), sb (softball),
--         sc (men's soccer), wsc (women's soccer), wvb (women's volleyball)
-- Architecture mirrors fb_ tables — share NCAA association/division lookups
-- where possible; each sport gets its own competitive_levels + teams + players
-- ============================================================================

BEGIN;

-- ============================================================================
-- HELPER: ensure sport_code enum exists
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE sport_code AS ENUM (
        'mbb', 'wbb', 'football', 'baseball', 'softball',
        'soccer_m', 'soccer_w', 'volleyball_w', 'hockey_m', 'hockey_w',
        'lacrosse_m', 'lacrosse_w'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- SHARED LOOKUP: ncaa_competitive_levels
-- One row per sport × division tier.
-- level_key format: {sport_abbr}_{division}  e.g. wbb_d1, bb_d2
-- ============================================================================

CREATE TABLE IF NOT EXISTS ncaa_competitive_levels (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport           sport_code NOT NULL,
    level_key       VARCHAR NOT NULL UNIQUE,  -- 'wbb_d1', 'bb_d2', 'sc_d3' …
    division        VARCHAR NOT NULL,          -- 'd1', 'd2', 'd3', 'fbs', 'fcs'
    display_name    VARCHAR NOT NULL,
    lambda          DECIMAL(6,4) NOT NULL DEFAULT 1.0000,
    level_tier      INTEGER NOT NULL DEFAULT 5  -- higher = stronger
);

CREATE INDEX IF NOT EXISTS idx_ncaa_cl_sport ON ncaa_competitive_levels(sport);
CREATE INDEX IF NOT EXISTS idx_ncaa_cl_level_key ON ncaa_competitive_levels(level_key);

-- ============================================================================
-- SHARED LOOKUP: ncaa_conferences
-- Conferences per sport-level (NCAA conference names are sport-agnostic
-- but we track them per sport because the same school may be in a different
-- conference in different sports)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ncaa_conferences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_id        UUID NOT NULL REFERENCES ncaa_competitive_levels(id),
    name            VARCHAR NOT NULL,
    abbreviation    VARCHAR,
    UNIQUE (level_id, name)
);

CREATE INDEX IF NOT EXISTS idx_ncaa_conf_level_id ON ncaa_conferences(level_id);

-- ============================================================================
-- SHARED LOOKUP: ncaa_teams
-- One row per school × sport. A school may appear multiple times across
-- different sports but each row has a unique (conference_id, name) pairing.
-- ncaa_slug is the seo slug from ncaa.com (matches /schools-index response)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ncaa_teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conference_id   UUID REFERENCES ncaa_conferences(id) ON DELETE SET NULL,
    name            VARCHAR NOT NULL,
    ncaa_slug       VARCHAR,                  -- e.g. 'duke', 'west-virginia'
    mascot          VARCHAR,
    wins            INTEGER,
    losses          INTEGER,
    conf_wins       INTEGER,
    conf_losses     INTEGER,
    season          VARCHAR,                  -- '2024-25'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (conference_id, name, season)
);

CREATE INDEX IF NOT EXISTS idx_ncaa_teams_conf_id ON ncaa_teams(conference_id);
CREATE INDEX IF NOT EXISTS idx_ncaa_teams_slug ON ncaa_teams(ncaa_slug);
CREATE INDEX IF NOT EXISTS idx_ncaa_teams_name ON ncaa_teams(name);

-- ============================================================================
-- SHARED LOOKUP: ncaa_players
-- Individual athletes. Source is the stats leaderboards (top 50 per category).
-- Players appear here if they rank in at least one stat category.
-- ncaa_id is not available from leaderboards; used for deduplication if found.
-- ============================================================================

CREATE TABLE IF NOT EXISTS ncaa_players (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR NOT NULL,
    sport           sport_code NOT NULL,
    team_id         UUID REFERENCES ncaa_teams(id) ON DELETE SET NULL,
    season          VARCHAR NOT NULL DEFAULT '2024-25',
    position        VARCHAR,
    class_year      VARCHAR,    -- 'Fr.', 'So.', 'Jr.', 'Sr.', 'Gr.'
    height          VARCHAR,    -- raw string from API e.g. '6-2'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (full_name, sport, season)
);

CREATE INDEX IF NOT EXISTS idx_ncaa_players_sport ON ncaa_players(sport);
CREATE INDEX IF NOT EXISTS idx_ncaa_players_team_id ON ncaa_players(team_id);
CREATE INDEX IF NOT EXISTS idx_ncaa_players_name ON ncaa_players(full_name);

-- ============================================================================
-- SPORT-SPECIFIC STAT TABLES
-- Each table references ncaa_players(id).
-- Columns match NCAA API stat leaderboard columns.
-- ============================================================================

-- ── Men's Basketball ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS mbb_player_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL UNIQUE REFERENCES ncaa_players(id) ON DELETE CASCADE,
    games           INTEGER,
    points          INTEGER,
    ppg             DECIMAL(5,2),
    rebounds        INTEGER,
    rpg             DECIMAL(5,2),
    assists         INTEGER,
    apg             DECIMAL(5,2),
    blocks          INTEGER,
    bpg             DECIMAL(5,2),
    steals          INTEGER,
    spg             DECIMAL(5,2),
    fg_pct          DECIMAL(5,3),
    ft_pct          DECIMAL(5,3),
    three_pt_pct    DECIMAL(5,3),
    three_pt_pg     DECIMAL(5,2)
);

-- ── Women's Basketball ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wbb_player_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL UNIQUE REFERENCES ncaa_players(id) ON DELETE CASCADE,
    games           INTEGER,
    points          INTEGER,
    ppg             DECIMAL(5,2),
    rebounds        INTEGER,
    rpg             DECIMAL(5,2),
    assists         INTEGER,
    apg             DECIMAL(5,2),
    blocks          INTEGER,
    bpg             DECIMAL(5,2),
    steals          INTEGER,
    spg             DECIMAL(5,2),
    fg_pct          DECIMAL(5,3),
    ft_pct          DECIMAL(5,3),
    three_pt_pct    DECIMAL(5,3),
    three_pt_pg     DECIMAL(5,2)
);

-- ── Baseball ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bb_player_batting_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL UNIQUE REFERENCES ncaa_players(id) ON DELETE CASCADE,
    games           INTEGER,
    at_bats         INTEGER,
    runs            INTEGER,
    hits            INTEGER,
    doubles         INTEGER,
    triples         INTEGER,
    home_runs       INTEGER,
    rbi             INTEGER,
    walks           INTEGER,
    strikeouts      INTEGER,
    batting_avg     DECIMAL(5,3),
    slug_pct        DECIMAL(5,3),
    obp             DECIMAL(5,3),
    ops             DECIMAL(5,3),
    stolen_bases    INTEGER
);

CREATE TABLE IF NOT EXISTS bb_player_pitching_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL UNIQUE REFERENCES ncaa_players(id) ON DELETE CASCADE,
    games           INTEGER,
    games_started   INTEGER,
    innings_pitched DECIMAL(6,1),
    wins            INTEGER,
    losses          INTEGER,
    saves           INTEGER,
    era             DECIMAL(5,2),
    whip            DECIMAL(5,3),
    strikeouts      INTEGER,
    walks           INTEGER,
    hits_allowed    INTEGER,
    home_runs_allowed INTEGER,
    k_per_9         DECIMAL(5,2),
    bb_per_9        DECIMAL(5,2)
);

-- ── Softball ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sb_player_batting_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL UNIQUE REFERENCES ncaa_players(id) ON DELETE CASCADE,
    games           INTEGER,
    at_bats         INTEGER,
    runs            INTEGER,
    hits            INTEGER,
    doubles         INTEGER,
    triples         INTEGER,
    home_runs       INTEGER,
    rbi             INTEGER,
    walks           INTEGER,
    strikeouts      INTEGER,
    batting_avg     DECIMAL(5,3),
    slug_pct        DECIMAL(5,3),
    obp             DECIMAL(5,3),
    stolen_bases    INTEGER
);

CREATE TABLE IF NOT EXISTS sb_player_pitching_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL UNIQUE REFERENCES ncaa_players(id) ON DELETE CASCADE,
    games           INTEGER,
    innings_pitched DECIMAL(6,1),
    wins            INTEGER,
    losses          INTEGER,
    saves           INTEGER,
    era             DECIMAL(5,2),
    whip            DECIMAL(5,3),
    strikeouts      INTEGER,
    walks           INTEGER,
    k_per_7         DECIMAL(5,2)
);

-- ── Men's Soccer ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sc_player_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL UNIQUE REFERENCES ncaa_players(id) ON DELETE CASCADE,
    games           INTEGER,
    games_started   INTEGER,
    minutes         INTEGER,
    goals           INTEGER,
    assists         INTEGER,
    points          INTEGER,
    shots           INTEGER,
    shots_on_goal   INTEGER,
    shot_pct        DECIMAL(5,3),
    goals_per_game  DECIMAL(5,2),
    -- GK-specific (NULL for field players)
    goals_allowed   INTEGER,
    saves           INTEGER,
    save_pct        DECIMAL(5,3),
    gaa             DECIMAL(5,2),
    shutouts        INTEGER
);

-- ── Women's Soccer ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wsc_player_stats (
    LIKE sc_player_stats INCLUDING ALL
);
-- rename the primary key constraint so it's unique
ALTER TABLE wsc_player_stats DROP CONSTRAINT IF EXISTS wsc_player_stats_pkey;
ALTER TABLE wsc_player_stats ADD PRIMARY KEY (id);
ALTER TABLE wsc_player_stats DROP CONSTRAINT IF EXISTS wsc_player_stats_player_id_key;
ALTER TABLE wsc_player_stats ADD UNIQUE (player_id);

-- ── Women's Volleyball ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wvb_player_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL UNIQUE REFERENCES ncaa_players(id) ON DELETE CASCADE,
    games           INTEGER,
    sets_played     INTEGER,
    kills           INTEGER,
    kills_per_set   DECIMAL(5,2),
    attacks         INTEGER,
    attack_pct      DECIMAL(5,3),
    assists         INTEGER,
    assists_per_set DECIMAL(5,2),
    digs            INTEGER,
    digs_per_set    DECIMAL(5,2),
    solo_blocks     INTEGER,
    block_assists   INTEGER,
    total_blocks    DECIMAL(6,1),
    blocks_per_set  DECIMAL(5,2),
    service_aces    INTEGER,
    aces_per_set    DECIMAL(5,2),
    service_errors  INTEGER
);

-- ── Football (NCAA API — all divisions) ───────────────────────────────────
-- Broad table that merges rushing/passing/receiving/defense/kicking per player.
-- Columns are NULLable; upserted incrementally across multiple stat categories.

CREATE TABLE IF NOT EXISTS football_player_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL UNIQUE REFERENCES ncaa_players(id) ON DELETE CASCADE,
    games           INTEGER,
    -- Rushing
    rush_att        INTEGER,
    rush_yards      INTEGER,
    rush_td         INTEGER,
    rush_ypg        DECIMAL(6,2),
    -- Passing
    pass_att        INTEGER,
    pass_comp       INTEGER,
    pass_yards      INTEGER,
    pass_td         INTEGER,
    pass_int        INTEGER,
    pass_eff        DECIMAL(6,2),
    -- Receiving
    receptions      INTEGER,
    rec_yards       INTEGER,
    rec_td          INTEGER,
    rec_pg          DECIMAL(5,2),
    rec_ypg         DECIMAL(6,2),
    -- Defense
    tackles         INTEGER,
    solo_tackles    INTEGER,
    ast_tackles     INTEGER,
    sacks           DECIMAL(5,1),
    sack_yards      DECIMAL(6,1),
    forced_fumbles  INTEGER,
    passes_defended INTEGER,
    tfl             DECIMAL(5,1),
    tfl_yards       DECIMAL(6,1),
    int_count       INTEGER,
    int_yards       INTEGER,
    int_td          INTEGER,
    -- Kicking
    fg_made         INTEGER,
    fg_att          INTEGER,
    fg_pct          DECIMAL(5,3),
    -- Scoring
    tds             INTEGER,
    points          INTEGER,
    ppg             DECIMAL(5,2)
);

COMMIT;
