-- ============================================================
-- Migration 004: Intelligence Schema
-- Adds tables for the intelligence engine audit trail,
-- team evaluations, simulation runs, scouting reports,
-- and development plans.
-- ============================================================

-- ── Program Context ──
-- Binds the Coach Context to a program. All engine calls read from here.
-- This is the "Coach Context Locked" binding described in File 01.

CREATE TABLE IF NOT EXISTS program_context (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id      uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  season_id       uuid REFERENCES seasons(id) ON DELETE SET NULL,

  -- Level binding
  governing_body  text NOT NULL,          -- 'NCAA', 'NAIA', 'NJCAA', etc.
  division        text,                   -- 'I', 'II', 'III' or null
  major_class     text,                   -- 'High-Major', 'Mid-Major', 'Low-Major' or null
  level_key       text NOT NULL,          -- KLVN level key: 'ncaa_d1_hm', 'naia', etc.

  -- System binding
  offensive_system text NOT NULL,         -- Must match locked System Set (12 offense)
  defensive_system text NOT NULL,         -- Must match locked System Set (10 defense)
  tempo            text,                  -- 'fast', 'medium', 'slow'

  -- Cluster weight overrides (optional; null = use system defaults)
  cluster_weights     jsonb,              -- { shooting: 18, finishing: 9, ... }
  position_importance jsonb,              -- { PG: 1.0, SG: 0.9, ... }
  biases              jsonb,              -- coach-specific overrides

  -- Metadata
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (program_id, season_id)
);

CREATE INDEX IF NOT EXISTS idx_program_context_program ON program_context(program_id);
CREATE INDEX IF NOT EXISTS idx_program_context_level ON program_context(level_key);

-- ── Player Evaluations ──
-- Audit trail for V1 evaluation results. One row per eval run.

CREATE TABLE IF NOT EXISTS player_evaluations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id       uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  program_id      uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  season_id       uuid REFERENCES seasons(id) ON DELETE SET NULL,

  -- Eval provenance
  data_tier       text NOT NULL,          -- 'box_score', 'synergy_1yr', etc.
  level_key       text NOT NULL,          -- KLVN level key used
  position        text NOT NULL,          -- 'PG', 'SG', 'SF', 'PF', 'C'

  -- Phase 3 anchor
  phase3_anchor_low  numeric(5,1),
  phase3_anchor_high numeric(5,1),

  -- Phase 6 OPF
  phase6_raw      numeric(5,1),
  okr             numeric(5,1),
  dkr             numeric(5,1),
  tkr             numeric(5,1),
  iqkr            numeric(5,1),

  -- Final result
  final_kr        numeric(5,1),
  window_valid    boolean,
  confidence_pct  integer,

  -- Trait vector snapshot (all scored trait values at eval time)
  trait_vector    jsonb,

  -- Metadata
  eval_metadata   jsonb,                  -- flags, warnings, data source
  evaluated_at    timestamptz NOT NULL DEFAULT now(),
  evaluated_by    uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_player_evals_player ON player_evaluations(player_id);
CREATE INDEX IF NOT EXISTS idx_player_evals_program ON player_evaluations(program_id);
CREATE INDEX IF NOT EXISTS idx_player_evals_season ON player_evaluations(season_id);
CREATE INDEX IF NOT EXISTS idx_player_evals_evaluated_at ON player_evaluations(evaluated_at DESC);

-- ── Team Evaluations ──
-- Stored Team KR snapshots. Recalculated on roster change.

CREATE TABLE IF NOT EXISTS team_evaluations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id      uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  season_id       uuid REFERENCES seasons(id) ON DELETE SET NULL,

  -- Results
  team_off_kr     numeric(5,1) NOT NULL,
  team_def_kr     numeric(5,1) NOT NULL,
  team_overall_kr numeric(5,1) NOT NULL,
  rotation_size   integer NOT NULL,
  confidence_pct  integer NOT NULL,

  -- Snapshot of player KRs used
  player_snapshot jsonb,                  -- [ { playerId, kr, minutes, weight } ]

  evaluated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_team_evals_program ON team_evaluations(program_id);
CREATE INDEX IF NOT EXISTS idx_team_evals_season ON team_evaluations(season_id);
CREATE INDEX IF NOT EXISTS idx_team_evals_evaluated_at ON team_evaluations(evaluated_at DESC);

-- ── Simulation Runs ──
-- Persisted simulation results. Used for history and comparison.

CREATE TABLE IF NOT EXISTS simulation_runs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id          uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  opponent_program_id uuid REFERENCES organizations(id) ON DELETE SET NULL,

  -- Simulation configuration
  sim_type    text NOT NULL,              -- '9 sim types' from simulation-types.ts
  location    text,                       -- 'home', 'away', 'neutral'
  config      jsonb NOT NULL,             -- full scenario config

  -- Results
  result      jsonb NOT NULL,             -- SimulationResult (win prob, score, drivers, etc.)
  confidence_pct integer NOT NULL,

  -- Metadata
  created_by  uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sim_runs_program ON simulation_runs(program_id);
CREATE INDEX IF NOT EXISTS idx_sim_runs_created_at ON simulation_runs(created_at DESC);

-- ── Scouting Reports ──
-- Pregame/halftime/postgame intelligence reports.

CREATE TABLE IF NOT EXISTS scouting_reports (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id      uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  opponent_id     uuid REFERENCES organizations(id) ON DELETE SET NULL,
  game_id         uuid,                   -- references game if tracked

  phase           text NOT NULL,          -- 'pregame', 'halftime', 'postgame'
  report_data     jsonb NOT NULL,         -- all 11 sections for pregame
  confidence_pct  integer NOT NULL,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scouting_program ON scouting_reports(program_id);
CREATE INDEX IF NOT EXISTS idx_scouting_opponent ON scouting_reports(opponent_id);
CREATE INDEX IF NOT EXISTS idx_scouting_created_at ON scouting_reports(created_at DESC);

-- ── Development Plans ──
-- Player development tracking with KR trajectory and drill recommendations.

CREATE TABLE IF NOT EXISTS development_plans (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  program_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  season_id   uuid REFERENCES seasons(id) ON DELETE SET NULL,

  -- Plan content
  plan_data     jsonb NOT NULL,           -- trait gaps, drill recommendations, target role
  kr_trajectory jsonb,                    -- projected KR at 30/60/90 days

  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dev_plans_player ON development_plans(player_id);
CREATE INDEX IF NOT EXISTS idx_dev_plans_program ON development_plans(program_id);

-- ── Updated timestamp triggers ──

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_program_context_updated
  BEFORE UPDATE ON program_context
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_scouting_reports_updated
  BEFORE UPDATE ON scouting_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_development_plans_updated
  BEFORE UPDATE ON development_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Comments ──

COMMENT ON TABLE program_context IS 'Coach Context binding for intelligence engines. All eval calls read level_key, system, and cluster weights from here.';
COMMENT ON TABLE player_evaluations IS 'V1 evaluation protocol results. Immutable audit trail — one row per eval run.';
COMMENT ON TABLE team_evaluations IS 'Team KR snapshots. Recalculated on roster change.';
COMMENT ON TABLE simulation_runs IS 'Persisted simulation results for history, comparison, and audit.';
COMMENT ON TABLE scouting_reports IS 'Pregame/halftime/postgame intelligence reports for each game.';
COMMENT ON TABLE development_plans IS 'Player development plans with KR trajectory and drill recommendations.';
