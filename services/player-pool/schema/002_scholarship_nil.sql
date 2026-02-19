-- ============================================================================
-- KaNeXT National Player Pool — Scholarship & NIL Allocation Table
-- Version 1.1 — February 2026
-- Spec Reference: Scholarship & NIL Allocation Engine.pdf
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS scholarship_nil_allocations (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_team_season_id       UUID NOT NULL REFERENCES player_team_seasons(id) ON DELETE CASCADE,
    team_season_id              UUID NOT NULL REFERENCES team_seasons(id) ON DELETE CASCADE,
    level_key                   VARCHAR NOT NULL,

    -- Priority tier
    tier                        VARCHAR NOT NULL,  -- Core / Rotation / Depth / Development

    -- Scholarship
    recommended_scholarship_pct DECIMAL,
    scholarship_equivalent      DECIMAL,

    -- NIL
    recommended_nil_amount      DECIMAL,

    -- Fit scores
    off_fit_pct                 DECIMAL,
    def_fit_pct                 DECIMAL,
    overall_fit_pct             DECIMAL,
    need_scarcity               DECIMAL,

    -- Justification
    scholarship_justification   TEXT,
    nil_justification           TEXT,
    warnings                    TEXT[],

    -- Metadata
    kr_version                  VARCHAR,
    computed_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sna_player_team_season_id ON scholarship_nil_allocations(player_team_season_id);
CREATE INDEX idx_sna_team_season_id ON scholarship_nil_allocations(team_season_id);
CREATE INDEX idx_sna_tier ON scholarship_nil_allocations(tier);

-- Team-level allocation summary
CREATE TABLE IF NOT EXISTS team_allocation_summary (
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_season_id                  UUID NOT NULL REFERENCES team_seasons(id) ON DELETE CASCADE,
    level_key                       VARCHAR NOT NULL,
    scholarship_equivalents_used    DECIMAL,
    scholarship_equivalents_cap     DECIMAL,
    nil_pool                        DECIMAL,
    nil_used                        DECIMAL,
    warnings                        TEXT[],
    kr_version                      VARCHAR,
    computed_at                     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (team_season_id)
);

CREATE INDEX idx_tas_team_season_id ON team_allocation_summary(team_season_id);

COMMIT;
