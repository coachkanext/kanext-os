-- ============================================================================
-- KaNeXT Track & Field + Golf Player Pool
-- Version 1.0 — March 2026
-- Track & Field: tf_teams, mtf_athletes, wtf_athletes, mtf_results, wtf_results
-- Golf: golf_teams, golf_tournaments, mgolf_athletes, wgolf_athletes,
--       mgolf_results, wgolf_results
-- ============================================================================

BEGIN;

-- ============================================================================
-- TRACK & FIELD TEAMS
-- Source: tfrrs.org team URL e.g. /teams/tf/PA_college_m_Penn_State.html
-- ============================================================================

CREATE TABLE IF NOT EXISTS tf_teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR NOT NULL,
    tfrrs_url       VARCHAR UNIQUE,     -- /teams/tf/PA_college_m_Penn_State.html
    state_abbr      VARCHAR(2),
    assoc           VARCHAR,            -- 'ncaa', 'njcaa', 'unknown'
    division        VARCHAR,            -- 'd1', 'd2', 'd3', NULL for njcaa
    gender          VARCHAR NOT NULL,   -- 'm' | 'f'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tf_teams_name ON tf_teams(name);
CREATE INDEX IF NOT EXISTS idx_tf_teams_assoc_div ON tf_teams(assoc, division);

-- ============================================================================
-- MEN'S TRACK & FIELD ATHLETES
-- ============================================================================

CREATE TABLE IF NOT EXISTS mtf_athletes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tfrrs_id        VARCHAR NOT NULL UNIQUE,
    full_name       VARCHAR NOT NULL,
    team_id         UUID REFERENCES tf_teams(id) ON DELETE SET NULL,
    class_year      VARCHAR,            -- 'FR-1', 'SO-2', 'JR-3', 'SR-4', 'GR-5'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mtf_athletes_name ON mtf_athletes(full_name);
CREATE INDEX IF NOT EXISTS idx_mtf_athletes_team ON mtf_athletes(team_id);

-- ============================================================================
-- WOMEN'S TRACK & FIELD ATHLETES
-- ============================================================================

CREATE TABLE IF NOT EXISTS wtf_athletes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tfrrs_id        VARCHAR NOT NULL UNIQUE,
    full_name       VARCHAR NOT NULL,
    team_id         UUID REFERENCES tf_teams(id) ON DELETE SET NULL,
    class_year      VARCHAR,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wtf_athletes_name ON wtf_athletes(full_name);
CREATE INDEX IF NOT EXISTS idx_wtf_athletes_team ON wtf_athletes(team_id);

-- ============================================================================
-- MEN'S TRACK & FIELD RESULTS
-- One row per athlete per event per season_type per season.
-- mark: raw string — '9.96', '1:47.50', '6.84m', '8543 pts'
-- wind: '+2.2', '-0.1', 'NWI', NULL for non-wind or indoor events
-- ============================================================================

CREATE TABLE IF NOT EXISTS mtf_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id      UUID NOT NULL REFERENCES mtf_athletes(id) ON DELETE CASCADE,
    event           VARCHAR NOT NULL,
    season_type     VARCHAR NOT NULL DEFAULT 'outdoor',  -- 'indoor' | 'outdoor'
    season          VARCHAR NOT NULL DEFAULT '2025-26',
    rank            INTEGER,
    mark            VARCHAR NOT NULL,
    wind            VARCHAR,
    meet_name       VARCHAR,
    tfrrs_meet_id   VARCHAR,
    meet_date       DATE,
    list_id         INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (athlete_id, event, season_type, season)
);

CREATE INDEX IF NOT EXISTS idx_mtf_results_athlete ON mtf_results(athlete_id);
CREATE INDEX IF NOT EXISTS idx_mtf_results_event ON mtf_results(event, season_type);
CREATE INDEX IF NOT EXISTS idx_mtf_results_list ON mtf_results(list_id);

-- ============================================================================
-- WOMEN'S TRACK & FIELD RESULTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS wtf_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id      UUID NOT NULL REFERENCES wtf_athletes(id) ON DELETE CASCADE,
    event           VARCHAR NOT NULL,
    season_type     VARCHAR NOT NULL DEFAULT 'outdoor',
    season          VARCHAR NOT NULL DEFAULT '2025-26',
    rank            INTEGER,
    mark            VARCHAR NOT NULL,
    wind            VARCHAR,
    meet_name       VARCHAR,
    tfrrs_meet_id   VARCHAR,
    meet_date       DATE,
    list_id         INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (athlete_id, event, season_type, season)
);

CREATE INDEX IF NOT EXISTS idx_wtf_results_athlete ON wtf_results(athlete_id);
CREATE INDEX IF NOT EXISTS idx_wtf_results_event ON wtf_results(event, season_type);
CREATE INDEX IF NOT EXISTS idx_wtf_results_list ON wtf_results(list_id);

-- ============================================================================
-- GOLF TEAMS
-- Source: golfstat.com school abbreviations
-- ============================================================================

CREATE TABLE IF NOT EXISTS golf_teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR NOT NULL UNIQUE,
    abbreviation    VARCHAR,            -- golfstat short name, e.g. 'E Michigan'
    division        VARCHAR,            -- 'd1', 'd2', 'd3', NULL if unknown
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_golf_teams_name ON golf_teams(name);

-- ============================================================================
-- GOLF TOURNAMENTS
-- Source: golfstat.com tournament IDs
-- ============================================================================

CREATE TABLE IF NOT EXISTS golf_tournaments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    golfstat_tid    INTEGER NOT NULL UNIQUE,
    name            VARCHAR NOT NULL,
    host_school     VARCHAR,
    gender          VARCHAR NOT NULL,   -- 'm' | 'f'
    season          VARCHAR NOT NULL DEFAULT '2025-26',
    start_date      DATE,
    end_date        DATE,
    num_rounds      INTEGER,
    course_name     VARCHAR,
    location        VARCHAR,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_golf_tournaments_gender ON golf_tournaments(gender);
CREATE INDEX IF NOT EXISTS idx_golf_tournaments_season ON golf_tournaments(season);

-- ============================================================================
-- MEN'S GOLF ATHLETES
-- scoring_average and rounds_played computed from results at write time
-- ============================================================================

CREATE TABLE IF NOT EXISTS mgolf_athletes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    golfstat_pcid       INTEGER NOT NULL UNIQUE,
    full_name           VARCHAR NOT NULL,
    team_id             UUID REFERENCES golf_teams(id) ON DELETE SET NULL,
    class_year          VARCHAR,
    rounds_played       INTEGER NOT NULL DEFAULT 0,
    scoring_average     DECIMAL(5,2),
    tournaments_played  INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mgolf_athletes_name ON mgolf_athletes(full_name);
CREATE INDEX IF NOT EXISTS idx_mgolf_athletes_team ON mgolf_athletes(team_id);
CREATE INDEX IF NOT EXISTS idx_mgolf_athletes_avg ON mgolf_athletes(scoring_average);

-- ============================================================================
-- WOMEN'S GOLF ATHLETES
-- ============================================================================

CREATE TABLE IF NOT EXISTS wgolf_athletes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    golfstat_pcid       INTEGER NOT NULL UNIQUE,
    full_name           VARCHAR NOT NULL,
    team_id             UUID REFERENCES golf_teams(id) ON DELETE SET NULL,
    class_year          VARCHAR,
    rounds_played       INTEGER NOT NULL DEFAULT 0,
    scoring_average     DECIMAL(5,2),
    tournaments_played  INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wgolf_athletes_name ON wgolf_athletes(full_name);
CREATE INDEX IF NOT EXISTS idx_wgolf_athletes_team ON wgolf_athletes(team_id);
CREATE INDEX IF NOT EXISTS idx_wgolf_athletes_avg ON wgolf_athletes(scoring_average);

-- ============================================================================
-- MEN'S GOLF RESULTS (per tournament)
-- to_par: negative = under par (e.g. -6 means 6 under)
-- position: '1', 'T5', 'CUT', 'WD', 'DQ'
-- ============================================================================

CREATE TABLE IF NOT EXISTS mgolf_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id      UUID NOT NULL REFERENCES mgolf_athletes(id) ON DELETE CASCADE,
    tournament_id   UUID NOT NULL REFERENCES golf_tournaments(id) ON DELETE CASCADE,
    position        VARCHAR,
    r1              INTEGER,
    r2              INTEGER,
    r3              INTEGER,
    r4              INTEGER,
    total_score     INTEGER,
    to_par          INTEGER,
    rounds_played   INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (athlete_id, tournament_id)
);

CREATE INDEX IF NOT EXISTS idx_mgolf_results_athlete ON mgolf_results(athlete_id);
CREATE INDEX IF NOT EXISTS idx_mgolf_results_tournament ON mgolf_results(tournament_id);

-- ============================================================================
-- WOMEN'S GOLF RESULTS (per tournament)
-- ============================================================================

CREATE TABLE IF NOT EXISTS wgolf_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id      UUID NOT NULL REFERENCES wgolf_athletes(id) ON DELETE CASCADE,
    tournament_id   UUID NOT NULL REFERENCES golf_tournaments(id) ON DELETE CASCADE,
    position        VARCHAR,
    r1              INTEGER,
    r2              INTEGER,
    r3              INTEGER,
    r4              INTEGER,
    total_score     INTEGER,
    to_par          INTEGER,
    rounds_played   INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (athlete_id, tournament_id)
);

CREATE INDEX IF NOT EXISTS idx_wgolf_results_athlete ON wgolf_results(athlete_id);
CREATE INDEX IF NOT EXISTS idx_wgolf_results_tournament ON wgolf_results(tournament_id);

COMMIT;
