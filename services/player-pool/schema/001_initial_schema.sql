-- ============================================================================
-- KaNeXT National Player Pool — Initial Schema
-- Version 1.0 — February 2026
-- Spec Reference: KaNeXT_National_Player_Pool_Spec.md.pdf §3
-- ============================================================================
-- 19 tables across 6 sections:
--   3.1 Core Entity Tables (5): associations, divisions, competitive_levels, conferences, teams
--   3.2 Player Tables (2): players, player_team_seasons
--   3.3 Game & Box Score Tables (4): team_seasons, games, team_game_stats, player_game_stats
--   3.4 Computed Metric Tables (4): player_season_stats, player_kr, player_kr_traits, player_kr_clusters
--   3.5 System Identity Tables (1): team_system_identity
--   3.6 Snapshot & Audit Tables (3): season_snapshots, scrape_log, computation_log
-- ============================================================================

BEGIN;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 3.1 CORE ENTITY TABLES
-- ============================================================================

-- associations: NCAA, NAIA, NJCAA, CCCAA, USCAA, NCCAA
CREATE TABLE associations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR NOT NULL,
    code        VARCHAR NOT NULL UNIQUE
);

-- divisions: FK → associations (Division I/II/III)
CREATE TABLE divisions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    association_id  UUID NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
    name            VARCHAR NOT NULL,
    code            VARCHAR NOT NULL
);

CREATE INDEX idx_divisions_association_id ON divisions(association_id);

-- competitive_levels: KLVN level keys with tier ordering
CREATE TABLE competitive_levels (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    division_id     UUID REFERENCES divisions(id) ON DELETE SET NULL,
    level_key       VARCHAR NOT NULL UNIQUE,
    display_name    VARCHAR NOT NULL,
    level_tier      INTEGER NOT NULL,
    klvn_params_ref VARCHAR
);

CREATE INDEX idx_competitive_levels_division_id ON competitive_levels(division_id);

-- conferences: FK → divisions
CREATE TABLE conferences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    division_id     UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
    name            VARCHAR NOT NULL,
    abbreviation    VARCHAR,
    region          VARCHAR
);

CREATE INDEX idx_conferences_division_id ON conferences(division_id);

-- teams: FK → conferences, competitive_levels
CREATE TABLE teams (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    VARCHAR NOT NULL,
    slug                    VARCHAR,
    conference_id           UUID REFERENCES conferences(id) ON DELETE SET NULL,
    competitive_level_id    UUID REFERENCES competitive_levels(id) ON DELETE SET NULL,
    city                    VARCHAR,
    state                   VARCHAR,
    prestosports_base_url   VARCHAR
);

CREATE INDEX idx_teams_conference_id ON teams(conference_id);
CREATE INDEX idx_teams_competitive_level_id ON teams(competitive_level_id);

-- ============================================================================
-- 3.2 PLAYER TABLES
-- ============================================================================

-- players: Deduplicated player identity
CREATE TABLE players (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name               VARCHAR NOT NULL,
    aliases                 TEXT[],
    date_of_birth           DATE,
    height_inches           INTEGER,
    weight_lbs              INTEGER,
    declared_positions      VARCHAR[],
    city_origin             VARCHAR,
    state_origin            VARCHAR,
    country_origin          VARCHAR DEFAULT 'USA',
    high_school             VARCHAR,
    prestosports_player_id  VARCHAR,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_players_full_name ON players(full_name);

-- ============================================================================
-- 3.3 GAME & BOX SCORE TABLES
-- ============================================================================

-- team_seasons: One row per team per season
CREATE TABLE team_seasons (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id             UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    season              VARCHAR NOT NULL,
    head_coach          VARCHAR,
    coach_continuity    BOOLEAN,
    roster_turnover_pct DECIMAL,
    wins                INTEGER,
    losses              INTEGER,
    conf_wins           INTEGER,
    conf_losses         INTEGER,
    osie_system         VARCHAR,
    osie_confidence_pct INTEGER,
    osie_status         VARCHAR,
    dsie_system         VARCHAR,
    dsie_confidence_pct INTEGER,
    dsie_status         VARCHAR,
    pace100             DECIMAL,
    pace_band           VARCHAR,
    team_off_kr         DECIMAL,
    team_def_kr         DECIMAL,
    team_overall_kr     DECIMAL,
    kr_version          VARCHAR,
    last_updated        TIMESTAMPTZ,
    UNIQUE (team_id, season)
);

CREATE INDEX idx_team_seasons_team_id ON team_seasons(team_id);

-- player_team_seasons: One row per player per team per season (handles transfers)
CREATE TABLE player_team_seasons (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id                   UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    team_season_id              UUID NOT NULL REFERENCES team_seasons(id) ON DELETE CASCADE,
    jersey_number               VARCHAR,
    class_year                  VARCHAR,
    eligibility_year            INTEGER,
    is_redshirt                 BOOLEAN,
    roster_status               VARCHAR,
    portal_entry_date           DATE,
    portal_destination_team_id  UUID REFERENCES teams(id) ON DELETE SET NULL,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (player_id, team_season_id)
);

CREATE INDEX idx_player_team_seasons_player_id ON player_team_seasons(player_id);
CREATE INDEX idx_player_team_seasons_team_season_id ON player_team_seasons(team_season_id);

-- games: Individual game records
CREATE TABLE games (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prestosports_game_id    VARCHAR UNIQUE,
    season                  VARCHAR,
    game_date               DATE,
    game_time               TIME,
    home_team_season_id     UUID REFERENCES team_seasons(id) ON DELETE SET NULL,
    away_team_season_id     UUID REFERENCES team_seasons(id) ON DELETE SET NULL,
    neutral_site            BOOLEAN,
    venue                   VARCHAR,
    game_type               VARCHAR,
    home_score              INTEGER,
    away_score              INTEGER,
    overtime_periods        INTEGER DEFAULT 0,
    home_possessions        DECIMAL,
    away_possessions        DECIMAL,
    possession_source       VARCHAR,
    tpq_home               DECIMAL,
    tpq_away               DECIMAL,
    tpq_version            VARCHAR,
    tpq_mode               VARCHAR,
    data_completeness       VARCHAR,
    scraped_at              TIMESTAMPTZ
);

CREATE INDEX idx_games_home_team_season_id ON games(home_team_season_id);
CREATE INDEX idx_games_away_team_season_id ON games(away_team_season_id);
CREATE INDEX idx_games_game_date ON games(game_date);

-- team_game_stats: Team-level totals per game (2 rows per game)
CREATE TABLE team_game_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id         UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    team_season_id  UUID NOT NULL REFERENCES team_seasons(id) ON DELETE CASCADE,
    is_home         BOOLEAN,
    fgm             INTEGER,
    fga             INTEGER,
    fg_pct          DECIMAL,
    three_pm        INTEGER,
    three_pa        INTEGER,
    three_pct       DECIMAL,
    ftm             INTEGER,
    fta             INTEGER,
    ft_pct          DECIMAL,
    oreb            INTEGER,
    dreb            INTEGER,
    reb             INTEGER,
    ast             INTEGER,
    stl             INTEGER,
    blk             INTEGER,
    turnovers       INTEGER,
    pf              INTEGER,
    pts             INTEGER,
    possessions     DECIMAL,
    off_ppp         DECIMAL,
    def_ppp         DECIMAL,
    UNIQUE (game_id, team_season_id)
);

CREATE INDEX idx_team_game_stats_game_id ON team_game_stats(game_id);
CREATE INDEX idx_team_game_stats_team_season_id ON team_game_stats(team_season_id);

-- player_game_stats: Player-level box score per game
CREATE TABLE player_game_stats (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id                 UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_team_season_id   UUID NOT NULL REFERENCES player_team_seasons(id) ON DELETE CASCADE,
    started                 BOOLEAN,
    minutes                 DECIMAL,
    fgm                     INTEGER,
    fga                     INTEGER,
    three_pm                INTEGER,
    three_pa                INTEGER,
    ftm                     INTEGER,
    fta                     INTEGER,
    oreb                    INTEGER,
    dreb                    INTEGER,
    reb                     INTEGER,
    ast                     INTEGER,
    stl                     INTEGER,
    blk                     INTEGER,
    turnovers               INTEGER,
    pf                      INTEGER,
    pts                     INTEGER,
    plus_minus              INTEGER,
    bpr_value               DECIMAL,
    bpr_version             VARCHAR,
    bpr_value              DECIMAL,
    UNIQUE (game_id, player_team_season_id)
);

CREATE INDEX idx_player_game_stats_game_id ON player_game_stats(game_id);
CREATE INDEX idx_player_game_stats_player_team_season_id ON player_game_stats(player_team_season_id);

-- ============================================================================
-- 3.4 COMPUTED METRIC TABLES
-- ============================================================================

-- player_season_stats: Aggregated season averages (recomputed after each game ingestion)
CREATE TABLE player_season_stats (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_team_season_id   UUID NOT NULL REFERENCES player_team_seasons(id) ON DELETE CASCADE,
    games_played            INTEGER,
    games_started           INTEGER,
    minutes_per_game        DECIMAL,
    pts_per_game            DECIMAL,
    reb_per_game            DECIMAL,
    ast_per_game            DECIMAL,
    stl_per_game            DECIMAL,
    blk_per_game            DECIMAL,
    to_per_game             DECIMAL,
    fg_pct                  DECIMAL,
    three_pct               DECIMAL,
    ft_pct                  DECIMAL,
    oreb_per_game           DECIMAL,
    dreb_per_game           DECIMAL,
    fga_per_game            DECIMAL,
    three_pa_per_game       DECIMAL,
    fta_per_game            DECIMAL,
    pf_per_game             DECIMAL,
    usage_rate              DECIMAL,
    bpr_season_avg          DECIMAL,
    bpr_trend               DECIMAL
);

CREATE INDEX idx_player_season_stats_pts_id ON player_season_stats(player_team_season_id);

-- player_kr: Player KR computation outputs
CREATE TABLE player_kr (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_team_season_id   UUID NOT NULL REFERENCES player_team_seasons(id) ON DELETE CASCADE,
    base_off_kr             DECIMAL,
    base_def_kr             DECIMAL,
    overall_kr              DECIMAL,
    kr_version              VARCHAR,
    eval_mode               VARCHAR,
    confidence_pct          INTEGER,
    primary_archetype       VARCHAR,
    secondary_archetypes    VARCHAR[],
    participation_pct       DECIMAL,
    klvn_level              VARCHAR,
    computed_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    inputs_snapshot_hash    VARCHAR
);

CREATE INDEX idx_player_kr_player_team_season_id ON player_kr(player_team_season_id);
CREATE INDEX idx_player_kr_overall_kr ON player_kr(overall_kr);

-- player_kr_traits: Per-trait scores for each player evaluation (54 traits across 7 clusters)
CREATE TABLE player_kr_traits (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_kr_id    UUID NOT NULL REFERENCES player_kr(id) ON DELETE CASCADE,
    cluster         VARCHAR NOT NULL,
    trait_key       VARCHAR NOT NULL,
    raw_score       DECIMAL,
    klvn_score      DECIMAL,
    confidence      DECIMAL,
    volume_rate     DECIMAL,
    efficiency      DECIMAL,
    sample_size     INTEGER
);

CREATE INDEX idx_player_kr_traits_player_kr_id ON player_kr_traits(player_kr_id);

-- player_kr_clusters: Aggregated cluster scores (7 canonical clusters)
CREATE TABLE player_kr_clusters (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_kr_id    UUID NOT NULL REFERENCES player_kr(id) ON DELETE CASCADE,
    cluster         VARCHAR NOT NULL,
    score           DECIMAL,
    weight_in_off_kr DECIMAL,
    weight_in_def_kr DECIMAL
);

CREATE INDEX idx_player_kr_clusters_player_kr_id ON player_kr_clusters(player_kr_id);

-- ============================================================================
-- 3.5 SYSTEM IDENTITY TABLES
-- ============================================================================

-- team_system_identity: OSIE/DSIE outputs per team-season (can have multiple snapshots)
CREATE TABLE team_system_identity (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_season_id          UUID NOT NULL REFERENCES team_seasons(id) ON DELETE CASCADE,
    snapshot_date           DATE NOT NULL,
    games_sample            INTEGER,
    off_primary_system      VARCHAR,
    off_system_score        DECIMAL,
    off_confidence_pct      INTEGER,
    off_system_mix          JSONB,
    off_status              VARCHAR,
    def_primary_system      VARCHAR,
    def_system_score        DECIMAL,
    def_confidence_pct      INTEGER,
    def_system_mix          JSONB,
    def_status              VARCHAR,
    pace100                 DECIMAL,
    pace_band               VARCHAR,
    heliocentric_anchor     VARCHAR
);

CREATE INDEX idx_team_system_identity_team_season_id ON team_system_identity(team_season_id);

-- ============================================================================
-- 3.6 SNAPSHOT & AUDIT TABLES
-- ============================================================================

-- season_snapshots: Weekly checkpoints of team + player state
CREATE TABLE season_snapshots (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_season_id          UUID NOT NULL REFERENCES team_seasons(id) ON DELETE CASCADE,
    snapshot_date           DATE NOT NULL,
    roster_state            JSONB,
    team_kr_state           JSONB,
    system_identity_state   JSONB
);

CREATE INDEX idx_season_snapshots_team_season_id ON season_snapshots(team_season_id);

-- scrape_log: URL, status, response tracking
CREATE TABLE scrape_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url             TEXT,
    status          VARCHAR,
    response_code   INTEGER,
    error_message   TEXT,
    records_created INTEGER,
    scraped_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- computation_log: Computation audit trail
CREATE TABLE computation_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    computation_type    VARCHAR NOT NULL,
    entity_id           VARCHAR,
    version             VARCHAR,
    inputs_hash         VARCHAR,
    computed_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    duration_ms         INTEGER
);

-- ============================================================================
-- SEED DATA — Locked Reference Data from Spec §5
-- ============================================================================

-- Associations
INSERT INTO associations (name, code) VALUES
    ('NCAA',  'ncaa'),
    ('NAIA',  'naia'),
    ('NJCAA', 'njcaa'),
    ('CCCAA', 'cccaa'),
    ('USCAA', 'uscaa'),
    ('NCCAA', 'nccaa');

-- Divisions per association
-- NCAA: Division I, II, III
INSERT INTO divisions (association_id, name, code)
SELECT id, 'Division I',   'd1' FROM associations WHERE code = 'ncaa'
UNION ALL
SELECT id, 'Division II',  'd2' FROM associations WHERE code = 'ncaa'
UNION ALL
SELECT id, 'Division III', 'd3' FROM associations WHERE code = 'ncaa';

-- NAIA: single division
INSERT INTO divisions (association_id, name, code)
SELECT id, 'NAIA', 'naia' FROM associations WHERE code = 'naia';

-- NJCAA: Division I, II, III
INSERT INTO divisions (association_id, name, code)
SELECT id, 'Division I',   'd1' FROM associations WHERE code = 'njcaa'
UNION ALL
SELECT id, 'Division II',  'd2' FROM associations WHERE code = 'njcaa'
UNION ALL
SELECT id, 'Division III', 'd3' FROM associations WHERE code = 'njcaa';

-- CCCAA: single division
INSERT INTO divisions (association_id, name, code)
SELECT id, 'CCCAA', 'cccaa' FROM associations WHERE code = 'cccaa';

-- USCAA: single division
INSERT INTO divisions (association_id, name, code)
SELECT id, 'USCAA', 'uscaa' FROM associations WHERE code = 'uscaa';

-- NCCAA: Division I, II
INSERT INTO divisions (association_id, name, code)
SELECT id, 'Division I',  'd1' FROM associations WHERE code = 'nccaa'
UNION ALL
SELECT id, 'Division II', 'd2' FROM associations WHERE code = 'nccaa';

-- Competitive levels (15 keys from KLVN spec, ordered by level_tier)
-- level_tier 1 = lowest, 15 = highest
INSERT INTO competitive_levels (division_id, level_key, display_name, level_tier) VALUES
    (
        (SELECT d.id FROM divisions d JOIN associations a ON d.association_id = a.id WHERE a.code = 'njcaa' AND d.code = 'd3'),
        'hs_prep_postgrad', 'HS / Prep / Postgrad', 1
    ),
    (
        (SELECT d.id FROM divisions d JOIN associations a ON d.association_id = a.id WHERE a.code = 'njcaa' AND d.code = 'd3'),
        'njcaa_d3', 'NJCAA D3', 2
    ),
    (
        (SELECT d.id FROM divisions d JOIN associations a ON d.association_id = a.id WHERE a.code = 'njcaa' AND d.code = 'd2'),
        'njcaa_d2', 'NJCAA D2', 3
    ),
    (
        (SELECT d.id FROM divisions d JOIN associations a ON d.association_id = a.id WHERE a.code = 'njcaa' AND d.code = 'd1'),
        'njcaa_d1', 'NJCAA D1', 4
    ),
    (
        (SELECT d.id FROM divisions d JOIN associations a ON d.association_id = a.id WHERE a.code = 'cccaa' AND d.code = 'cccaa'),
        'cccaa', 'CCCAA', 5
    ),
    (
        (SELECT d.id FROM divisions d JOIN associations a ON d.association_id = a.id WHERE a.code = 'naia' AND d.code = 'naia'),
        'naia', 'NAIA', 6
    ),
    (
        (SELECT d.id FROM divisions d JOIN associations a ON d.association_id = a.id WHERE a.code = 'uscaa' AND d.code = 'uscaa'),
        'uscaa', 'USCAA', 7
    ),
    (
        (SELECT d.id FROM divisions d JOIN associations a ON d.association_id = a.id WHERE a.code = 'nccaa' AND d.code = 'd2'),
        'nccaa_d2', 'NCCAA D2', 8
    ),
    (
        (SELECT d.id FROM divisions d JOIN associations a ON d.association_id = a.id WHERE a.code = 'nccaa' AND d.code = 'd1'),
        'nccaa_d1', 'NCCAA D1', 9
    ),
    (
        (SELECT d.id FROM divisions d JOIN associations a ON d.association_id = a.id WHERE a.code = 'ncaa' AND d.code = 'd3'),
        'ncaa_d3', 'NCAA D3', 10
    ),
    (
        (SELECT d.id FROM divisions d JOIN associations a ON d.association_id = a.id WHERE a.code = 'ncaa' AND d.code = 'd2'),
        'ncaa_d2', 'NCAA D2', 11
    ),
    (
        (SELECT d.id FROM divisions d JOIN associations a ON d.association_id = a.id WHERE a.code = 'ncaa' AND d.code = 'd1'),
        'ncaa_d1_low_major', 'NCAA D1 -- Low Major', 12
    ),
    (
        (SELECT d.id FROM divisions d JOIN associations a ON d.association_id = a.id WHERE a.code = 'ncaa' AND d.code = 'd1'),
        'ncaa_d1_mid_major', 'NCAA D1 -- Mid Major', 13
    ),
    (
        (SELECT d.id FROM divisions d JOIN associations a ON d.association_id = a.id WHERE a.code = 'ncaa' AND d.code = 'd1'),
        'ncaa_d1_high_major', 'NCAA D1 -- High Major', 14
    ),
    (
        NULL,
        'professional', 'Professional', 15
    );

COMMIT;
