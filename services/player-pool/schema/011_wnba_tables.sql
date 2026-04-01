-- ============================================================================
-- KaNeXT WNBA + Pro Basketball Advanced Stats
-- Version 1.0 — March 2026
-- Adds: proball_advanced_stats (extends proball_players / proball_leagues)
-- Source: nba_api (league_id='10' for WNBA, '00' for NBA, '20' for G League)
-- ============================================================================
--
-- NOTE: PER, BPM, OBPM, DBPM, WS, VORP are Basketball-Reference proprietary.
-- They are NOT available via nba_api.  PIE is the NBA's official PER-equivalent.
--
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS proball_advanced_stats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL REFERENCES proball_players(id) ON DELETE CASCADE,
    league_id       UUID NOT NULL REFERENCES proball_leagues(id) ON DELETE CASCADE,
    season          VARCHAR NOT NULL,

    -- On/Off Ratings
    off_rating      DECIMAL(7,2),    -- Offensive Rating  (pts produced per 100 poss)
    def_rating      DECIMAL(7,2),    -- Defensive Rating
    net_rating      DECIMAL(7,2),    -- Net Rating

    -- Shooting efficiency
    efg_pct         DECIMAL(6,4),    -- Effective FG%  = (FGM + 0.5*3PM) / FGA
    ts_pct          DECIMAL(6,4),    -- True Shooting% = PTS / (2*(FGA + 0.44*FTA))

    -- Usage & playmaking
    usg_pct         DECIMAL(6,4),    -- Usage%
    ast_pct         DECIMAL(6,4),    -- Assist%
    ast_to_ratio    DECIMAL(5,3),    -- AST/TO
    to_pct          DECIMAL(6,4),    -- Turnover%

    -- Rebounding rates
    oreb_pct        DECIMAL(6,4),
    dreb_pct        DECIMAL(6,4),
    reb_pct         DECIMAL(6,4),

    -- Impact / pace
    pie             DECIMAL(6,4),    -- Player Impact Estimate (NBA's PER-equivalent)
    pace            DECIMAL(6,2),

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (player_id, league_id, season)
);

CREATE INDEX IF NOT EXISTS idx_proball_adv_player ON proball_advanced_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_proball_adv_league ON proball_advanced_stats(league_id, season);

COMMIT;
