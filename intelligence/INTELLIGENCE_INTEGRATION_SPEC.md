# KaNeXT Basketball Intelligence — Integration Spec

**Date:** 2026-03-27
**Scope:** Map every intelligence component from the 6 knowledge files + 14 legends to the KaNeXT OS codebase. Identify what's built, what's missing, and where each piece lives.

---

## 1. Architecture Overview

The intelligence system has three runtime layers:

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3 — NEXUS (AI Orchestration)                         │
│  Nexus context → intent detection → engine routing →        │
│  GPT enrichment → result rendering                          │
│  Files: context/nexus-context.tsx, utils/nexus-*.ts          │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2 — ENGINES (Deterministic Computation)              │
│  V1 Eval Protocol, KLVN, Team KR, Simulation,               │
│  OSIE/DSIE, Scouting, Development, Pro Transition,           │
│  Scholarship/NIL, Confidence Gates                           │
│  Files: services/intelligence/*.ts (NEW)                     │
├─────────────────────────────────────────────────────────────┤
│  LAYER 1 — DATA (Storage + Access)                          │
│  Supabase tables, national pool JSON, program context,       │
│  system demand profiles, legends                             │
│  Files: supabase/migrations/*.sql, data/*.ts, utils/kr-*.ts  │
└─────────────────────────────────────────────────────────────┘
```

**Principle:** Layer 2 engines are pure functions. Same inputs → same outputs. No randomness, no GPT calls. Nexus (Layer 3) orchestrates which engines to call and formats results for the user. Layer 1 provides the data.

---

## 2. Component Map — What Exists vs What's Missing

### 2.1 Player Evaluation (Files 01 + 02)

#### BUILT — Layer 1 (Data + Display)

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| 7 canonical clusters | `types/index.ts` (ClusterType) | ✅ Complete | shooting, finishing, playmaking, on_ball_defense, team_defense, rebounding, physical |
| Cluster weights per offensive system | `data/mock-program-context.ts` (OFFENSIVE_STYLE_CLUSTERS) | ✅ Complete | 11 systems, weights sum to 53 |
| Cluster weights per defensive system | `data/mock-program-context.ts` (DEFENSIVE_STYLE_CLUSTERS) | ✅ Complete | 9 systems, weights sum to 47 |
| Position trait weights (college) | `utils/fit-kr.ts` (POSITION_WEIGHTS) | ✅ Complete | PG/CG/W/F/B, sum to 100 |
| Archetype derivation (threshold-based) | `utils/fit-kr.ts` (POSITION_ARCHETYPES, deriveArchetype) | ✅ Complete | Position-specific candidate lists |
| Archetype display names | `utils/kr-display.ts` (ARCHETYPE_DISPLAY) | ✅ Complete | 30+ archetypes |
| FitKR computation | `utils/fit-kr.ts` (computeFitKR) | ✅ Complete | System-weighted cluster aggregation |
| PositionKR computation | `utils/fit-kr.ts` (computePositionKR) | ✅ Complete | Position-weighted cluster aggregation |
| Off/Def KR split | `utils/fit-kr.ts` (computeOffDefKR) | ✅ Complete | Base and fit-adjusted |
| Lineup rating | `utils/fit-kr.ts` (computeLineupRating) | ✅ Complete | Minutes-weighted 5-man rating |
| Fit reasons | `utils/fit-kr.ts` (getFitReasons) | ✅ Complete | 7-cluster driver analysis |
| Badge computation | `utils/player-badges.ts` (computePlayerBadges) | ✅ Complete | Cluster threshold badges |
| KR color bands (universal) | `utils/kr-display.ts` (KR_COLOR_BANDS) | ✅ Complete | 10 bands, 0–100 |
| KR legends (13 levels) | `utils/kr-display.ts` (KR_LEGEND) | ✅ Complete | HM through NCCAA D2 |
| System demand profiles | `data/system-demand-profiles.ts` | ✅ Complete | A/B/C tiers per system × archetype |
| National player pool | `data/national-pool.ts` + `.json` | ✅ Complete | 29MB, search/filter/KR/clusters/stats |
| Player ratings DB schema | `supabase/migrations/001_roster_schema.sql` (player_ratings) | ✅ Complete | 7 clusters + KR + off/def KR + archetype + stats |
| Player query detection | `utils/nexus-player-query.ts` | ✅ Complete | Keyword/pattern matching → pool search → GPT context |

#### BUILT — Layer 1 (Python Pipeline, runs offline)

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Position-weighted KR (Python) | `services/player-pool/engine/player_kr.py` | ✅ Complete | Mirrors TS POSITION_WEIGHTS |
| Team KR (Python) | `services/player-pool/engine/team_kr.py` | ✅ Complete | Participation-weighted, 5% threshold, 53/47 |
| KLVN normalization (Python) | `services/player-pool/engine/klvn.py` | ✅ Complete | λ multipliers for 14 levels |
| Badge engine (Python) | `services/player-pool/engine/badges.py` | ✅ Complete | |
| BPR computation (Python) | `services/player-pool/engine/bpr.py` | ✅ Complete | |
| Cluster computation (Python) | `services/player-pool/engine/clusters.py` | ✅ Complete | |
| KR legend (Python) | `services/player-pool/engine/kr_legend.py` | ✅ Complete | |
| OSIE/DSIE (Python) | `services/player-pool/engine/osie_dsie.py` | ✅ Complete | System inference |
| Scholarship/NIL (Python) | `services/player-pool/engine/scholarship_nil.py` | ✅ Complete | |
| Impact scores (Python) | `services/player-pool/engine/impact_scores.py` | ✅ Complete | |
| Compensators (Python) | `services/player-pool/engine/compensators.py` | ✅ Complete | |
| KLVN params | `services/player-pool/engine/klvn_params.json` | ✅ Complete | |

#### MISSING — Layer 2 (TypeScript Engines)

| Component | Spec Source | Target Location | Priority | Description |
|-----------|-------------|-----------------|----------|-------------|
| **V1 Evaluation Protocol** | File 01 §V1 EVALUATION PROTOCOL | `services/intelligence/v1-eval-engine.ts` | **P0** | 5-step pipeline: Coach Context → Phase 3 Production Anchor → Phase 6 OPF math with composite bounding + proxy confidence → Phase 3±10 window → Final KR. This is the primary evaluation path for real players using public box-score data. |
| **KLVN (TypeScript)** | File 02 §KLVN | `services/intelligence/klvn.ts` | **P0** | Port λ multipliers, possession priors, game targets, stat normalization from Python. Required by V1 eval for cross-level reads. |
| **OPF Math (47 traits)** | File 01 §Phase 6, File 02 §Position Trait Weighting | `services/intelligence/opf.ts` | **P0** | Full 47-trait OPF computation. Current `fit-kr.ts` uses 7 clusters (post-aggregation). V1 needs trait-level math with NULL handling, composite bounding, and proxy confidence. |
| **Player Confidence Gate** | File 01 §Player Confidence Gate, File 02 §CONFIDENCE | `services/intelligence/confidence-gates.ts` | **P1** | Compute confidence % from games played, minutes, trait coverage, data tier. Affects all downstream outputs. |
| **Impact Modifiers (TS)** | File 02 §IMPACT MODIFIERS | `services/intelligence/impact-modifiers.ts` | **P1** | Primary Engine, Secondary Engine, Force Multiplier, Specialist Anchor classification. Currently only in Python. |
| **Override Engine** | File 02 §OVERRIDES | `services/intelligence/overrides.ts` | **P2** | Context overrides (injury, role change, system change) that adjust KR post-computation. |
| **System Risk Engine** | File 02 §SYSTEM RISKS | `services/intelligence/system-risks.ts` | **P2** | Identify risk factors when player archetype mismatches system demands. |
| **BPR (TypeScript)** | File 02 §BPR | `services/intelligence/bpr.ts` | **P1** | Box-score Plus Rating — composite metric for V1 production anchoring. Python has it; TS doesn't. |

### 2.2 Team Evaluation (File 03)

#### BUILT

| Component | File | Status |
|-----------|------|--------|
| Lineup-level OFF/DEF/Net rating | `utils/fit-kr.ts` (computeLineupRating) | ✅ Partial — 5-man only, not full rotation |
| Cluster drivers | `utils/fit-kr.ts` (getClusterDrivers) | ✅ Complete |
| Team needs data | `data/team-needs.ts` | ✅ Stub data |
| Team KR Python engine | `services/player-pool/engine/team_kr.py` | ✅ Complete |

#### MISSING

| Component | Spec Source | Target Location | Priority | Description |
|-----------|-------------|-----------------|----------|-------------|
| **Team KR (TypeScript)** | File 03 §Team KR Math | `services/intelligence/team-kr.ts` | **P0** | Port from Python: participation-weighted aggregation, 5% min threshold, rotation filtering, 53/47 split. Input = player KRs + minutes. Output = Team_Off_KR, Team_Def_KR, Team_Overall_KR. |
| **Team KR Legend** | File 03 §Team KR Legend | `utils/kr-display.ts` (extend) | **P1** | Level-aware team tier labels (separate from player legends). Not yet in kr-display. |
| **OSIE/DSIE (TypeScript)** | File 03 §OSIE/DSIE | `services/intelligence/osie-dsie.ts` | **P1** | Offensive/Defensive System Inference Engine. Infer opponent's system from tendencies/stats. Python has it; TS doesn't. Used by scouting and simulation. |
| **Team Confidence Gate** | File 03 §Team Confidence Gate | `services/intelligence/confidence-gates.ts` (extend) | **P1** | Confidence for team-level outputs: roster completeness, minutes coverage, player confidence distribution. |
| **Scholarship/NIL Allocation (TS)** | File 03 §Scholarship/NIL | `services/intelligence/scholarship-nil.ts` | **P1** | PTV (Player Total Value), PMV (Player Marginal Value), allocation optimization. Python has it; TS needs it for Nexus-driven "What's he worth?" queries. |
| **Roster Decision Intelligence** | File 03 §Roster Decision Intelligence | `services/intelligence/roster-intelligence.ts` | **P2** | Gap analysis, need prioritization, transfer portal targeting. Consumes Team KR + system demands + roster composition. |

### 2.3 Simulation Engine (File 04)

#### BUILT

| Component | File | Status |
|-----------|------|--------|
| 9 sim types | `components/simulation/simulation-types.ts` | ✅ Complete (types only) |
| Scenario builder UI | `components/simulation/scenario-builder.tsx` | ✅ Complete |
| Confidence gate UI | `components/simulation/confidence-gate.tsx` | ✅ Complete |
| Comparison view UI | `components/simulation/comparison-view.tsx` | ✅ Complete |
| Result view UI | `components/simulation/sim-result-view.tsx` | ✅ Complete |
| Simulation result types | `types/index.ts` (SimulationResult, PlayerImpact, ProjectedBoxScore) | ✅ Complete |
| Mock simulation generator | `data/mock-simulations.ts` | ✅ Mock only |
| Nexus sim intent detection | `context/nexus-context.tsx` (detectSimulationIntent) | ✅ Basic keyword match |

#### MISSING

| Component | Spec Source | Target Location | Priority | Description |
|-----------|-------------|-----------------|----------|-------------|
| **Interaction Library** | File 04 §Interaction Tables | `services/intelligence/sim/interaction-library.ts` | **P0** | 582 entries: Offensive Archetype × Defensive System AND Defensive Archetype × Offensive System scoring interactions. The core of simulation accuracy. |
| **System × System Interaction** | File 04 §SYSTEM × SYSTEM INTERACTION | `services/intelligence/sim/system-interaction.ts` | **P0** | How offensive system matchups vs defensive system matchups modify game flow. |
| **Possession Engine** | File 04 §Possession Engine | `services/intelligence/sim/possession-engine.ts` | **P1** | Per-possession resolution using rotation, interaction scores, and variance. |
| **Physical Mismatch Engine** | File 04 §Physical Mismatch | `services/intelligence/sim/physical-mismatch.ts` | **P1** | Height/weight/athletic differential scoring per matchup. |
| **Modifier Framework** | File 04 §Modifier Framework | `services/intelligence/sim/modifiers.ts` | **P1** | Home court, fatigue, pace, foul trouble, momentum. |
| **Matchup Interaction Governance** | File 04 §Matchup Interaction Governance | `services/intelligence/sim/governance.ts` | **P2** | Rules constraining which interactions can stack or override. |
| **Simulation Confidence Gate** | File 04 §Simulation Confidence Gate | `services/intelligence/confidence-gates.ts` (extend) | **P1** | Data quality → confidence for sim outputs. |
| **Simulation Orchestrator** | File 04 (full pipeline) | `services/intelligence/sim/orchestrator.ts` | **P0** | Wire together: Team KR inputs → interaction library → possession engine → modifiers → projected box score → confidence. Replace `generateMockSimulation()`. |

### 2.4 Scouting & Game Ops (File 05)

#### BUILT

| Component | File | Status |
|-----------|------|--------|
| Game Ops hub UI | `components/game-ops/game-ops-hub-content.tsx` | ✅ Stub |
| Game Plan sections (11) | `components/game-plan/sections/s01–s11` | ✅ UI shells |
| Game Plan page | `components/game-plan/game-plan-page.tsx` | ✅ Complete |
| GameOpsConfig type | `types/index.ts` | ✅ Complete |
| Nexus game-ops conversation type | `types/index.ts` (ConversationType = 'game-ops') | ✅ Complete |

#### MISSING

| Component | Spec Source | Target Location | Priority | Description |
|-----------|-------------|-----------------|----------|-------------|
| **Pregame Intelligence Engine** | File 05 §Pregame | `services/intelligence/scouting/pregame.ts` | **P1** | Opponent profiling: infer system (OSIE/DSIE), rate rotation players, identify tendencies, generate game plan data for the 11 UI sections. |
| **Halftime Adjustment Engine** | File 05 §Halftime | `services/intelligence/scouting/halftime.ts` | **P2** | Mid-game recalibration: adjust rotation, flag what's working/not working, suggest adjustments. |
| **Postgame Analysis Engine** | File 05 §Postgame | `services/intelligence/scouting/postgame.ts` | **P2** | Performance vs projection comparison, KR adjustment signals, development flags. |
| **Scout Confidence Gate** | File 05 §Scout Confidence Gate | `services/intelligence/confidence-gates.ts` (extend) | **P2** | Data quality assessment for opponent scouting. |
| **Postgame Confidence Gate** | File 05 §Postgame Confidence Gate | `services/intelligence/confidence-gates.ts` (extend) | **P2** | How much to trust postgame results for KR updating. |

### 2.5 Downstream Engines (File 06)

#### BUILT

| Component | File | Status |
|-----------|------|--------|
| Development page UI | `components/development/development-page.tsx` | ✅ Complete |
| Transfer tracker UI | `components/development/transfer-tracker.tsx` | ✅ Complete |
| Position group board UI | `components/development/position-group-board.tsx` | ✅ Complete |
| Drill library UI | `components/development/drill-library.tsx` | ✅ Complete |
| Weekly plan builder UI | `components/development/weekly-plan-builder.tsx` | ✅ Complete |

#### MISSING

| Component | Spec Source | Target Location | Priority | Description |
|-----------|-------------|-----------------|----------|-------------|
| **Development Intelligence Engine** | File 06 §Development Intelligence | `services/intelligence/development.ts` | **P2** | KR trajectory projection, trait gap analysis, development plan generation, position reclassification signals. |
| **Transfer Portal Fit Engine** | File 06 §Transfer Portal | `services/intelligence/transfer-portal.ts` | **P2** | Given a player's KR + system + target program context: compute fit delta, level-appropriate tier, scholarship recommendation. |
| **Pro Transition Engine** | File 06 §Pro Transition | `services/intelligence/pro-transition.ts` | **P2** | Draft projection, college-to-pro KR conversion, pro system fit, readiness assessment. |
| **Coaching Impact Modifier** | File 06 §Coaching Impact | `services/intelligence/coaching-impact.ts` | **P3** | Historical player development rate under a coaching staff → modifier for development projections. |

### 2.6 Legends (14 Level Files)

#### BUILT

| Component | File | Status |
|-----------|------|--------|
| KR_LEGEND object (13 levels) | `utils/kr-display.ts` | ✅ Complete | Tiers + labels for HM, MM, LM, D2, D3, NAIA, NJCAA D1/D2/D3, CCCAA, USCAA, NCCAA D1/D2 |
| getKRTierLabel() | `utils/kr-display.ts` | ✅ Complete | Level-aware lookup |
| Level display names | `utils/kr-display.ts` (LEVEL_DISPLAY_SHORT) | ✅ Complete | |

#### MISSING

| Component | Spec Source | Target Location | Priority | Description |
|-----------|-------------|-----------------|----------|-------------|
| **Expanded legend metadata** | 14 Legend_*.md files | `services/intelligence/legends.ts` | **P1** | Each legend file contains per-tier context beyond label: archetype expectations, stat benchmarks, draft/transfer implications, typical role descriptions. The current KR_LEGEND only stores `{ min, max, label }`. Needs `{ min, max, label, description, archetypeExpectations, statBenchmarks, transferImplications }` for Nexus to explain ratings. |
| **Level Tier Map** | File 01 §Level Tier Map | `services/intelligence/level-tier-map.ts` | **P1** | Cross-level interpretation: "A KR of 82 means Projected Starter at NAIA, Key Rotation at NCAA D2, Below Level at D1 HM." One function, multiple legend reads. Currently possible but not packaged as a callable service. |
| **Pro Player KR Legend** | File 02 §PRO PLAYER KR LEGEND | `utils/kr-display.ts` (extend KR_LEGEND) | **P2** | Professional level legend not yet in the TS KR_LEGEND object. |

### 2.7 Nexus Intelligence Routing (File 07 / Skill)

#### BUILT

| Component | File | Status |
|-----------|------|--------|
| Player query detection | `utils/nexus-player-query.ts` (isPlayerRelatedQuery) | ✅ Complete |
| Player pool context enrichment | `utils/nexus-player-query.ts` (processPlayerQuery) | ✅ Complete |
| Simulation intent detection | `context/nexus-context.tsx` (detectSimulationIntent) | ✅ Basic |
| Action engine (RBAC + lifecycle) | `utils/nexus-action-engine.ts` | ✅ Complete |
| Eval conversation type | `types/index.ts` (ConversationType = 'eval') | ✅ Complete |
| Sim conversation type | `types/index.ts` (ConversationType = 'sim') | ✅ Complete |
| Game-ops conversation type | `types/index.ts` (ConversationType = 'game-ops') | ✅ Complete |

#### MISSING

| Component | Spec Source | Target Location | Priority | Description |
|-----------|-------------|-----------------|----------|-------------|
| **Intelligence Router** | Skill §ROUTING TABLE | `services/intelligence/router.ts` | **P0** | Master intent classifier: detect query type (player eval, team eval, simulation, scouting, development, pro transition, scholarship/NIL, system inference, legend lookup) → route to correct engine(s) → package results for Nexus. This is the TypeScript equivalent of the skill's routing table. |
| **Team eval query detection** | Skill §Team KR | `services/intelligence/router.ts` | **P1** | Keywords: "team KR", "roster analysis", "team rating", "how good is our team" |
| **Scouting query detection** | Skill §Scouting | `services/intelligence/router.ts` | **P1** | Keywords: "scout [opponent]", "pregame report", "game plan for", "what do they run" |
| **Development query detection** | Skill §Development | `services/intelligence/router.ts` | **P2** | Keywords: "development plan", "where should he transfer", "portal fit" |
| **Pro transition query detection** | Skill §Pro Transition | `services/intelligence/router.ts` | **P2** | Keywords: "go pro", "draft projection", "pro ready" |
| **Nexus GPT system prompt builder** | — | `services/intelligence/nexus-prompt-builder.ts` | **P0** | Build the system prompt for GPT based on: active engine results, coach context, program context, confidence levels. Currently GPT gets raw national pool data. Needs structured intelligence context. |

---

## 3. Supabase Schema Gaps

The current schema (`001_roster_schema.sql`) covers roster management. The intelligence system needs additional tables:

### 3.1 Needed Migrations

```
004_intelligence_schema.sql
```

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `program_context` | Coach Context (binds evaluation) | program_id, governing_body, division, major_class, offensive_system, defensive_system, tempo, cluster_weights (jsonb), position_importance (jsonb), biases (jsonb) |
| `player_evaluations` | Stored V1 eval results | player_id, program_id, season_id, data_tier, phase3_anchor_low, phase3_anchor_high, phase6_raw, final_kr, confidence_pct, trait_vector (jsonb), eval_metadata (jsonb), evaluated_at |
| `team_evaluations` | Stored Team KR results | program_id, season_id, team_off_kr, team_def_kr, team_overall_kr, rotation_size, confidence_pct, evaluated_at |
| `simulation_runs` | Persisted simulation results | id, program_id, sim_type, opponent_program_id, config (jsonb), result (jsonb), confidence_pct, created_by, created_at |
| `scouting_reports` | Pregame/postgame intelligence | game_id, program_id, opponent_id, phase, report_data (jsonb), confidence_pct, created_at |
| `development_plans` | Player development tracking | player_id, program_id, season_id, plan_data (jsonb), kr_trajectory (jsonb), created_at, updated_at |

### 3.2 Schema Relationship to Existing Tables

```
organizations
  └── programs
       ├── seasons
       │    └── roster_entries
       │         └── player_ratings ← (existing: pre-computed KR)
       ├── program_context ← NEW (coach context binding)
       ├── player_evaluations ← NEW (V1 eval audit trail)
       ├── team_evaluations ← NEW (team KR snapshots)
       ├── simulation_runs ← NEW (saved sims)
       └── coaches (existing: offensive/defensive system)
            └── scouting_reports ← NEW (per-game intel)
```

---

## 4. File System — Target Directory Structure

```
services/
  intelligence/
    index.ts                      ← Public API barrel export
    router.ts                     ← Intent classification + engine dispatch
    nexus-prompt-builder.ts       ← GPT system prompt assembly
    
    # Player Evaluation
    v1-eval-engine.ts             ← V1 Protocol (box-score → KR)
    klvn.ts                       ← Level normalization (port from Python)
    opf.ts                        ← 47-trait OPF math + NULL handling
    bpr.ts                        ← Box-score Plus Rating
    impact-modifiers.ts           ← Primary/Secondary/Force/Specialist
    overrides.ts                  ← Context overrides
    system-risks.ts               ← Archetype × system risk flags
    confidence-gates.ts           ← All 5 confidence gates
    legends.ts                    ← Expanded legend metadata + Level Tier Map
    
    # Team Evaluation
    team-kr.ts                    ← Full Team KR (port from Python)
    osie-dsie.ts                  ← System inference (port from Python)
    scholarship-nil.ts            ← PTV/PMV/allocation (port from Python)
    roster-intelligence.ts        ← Gap analysis + need prioritization
    
    # Simulation
    sim/
      orchestrator.ts             ← Main simulation pipeline
      interaction-library.ts      ← 582 archetype × system entries
      system-interaction.ts       ← System × system modifiers
      possession-engine.ts        ← Per-possession resolution
      physical-mismatch.ts        ← Size/athletic differential
      modifiers.ts                ← Home court, fatigue, pace, etc.
      governance.ts               ← Interaction stacking rules
    
    # Scouting
    scouting/
      pregame.ts                  ← Opponent profiling + game plan data
      halftime.ts                 ← Mid-game adjustments
      postgame.ts                 ← Performance vs projection
    
    # Downstream
    development.ts                ← KR trajectory + trait gap analysis
    transfer-portal.ts            ← Cross-program fit scoring
    pro-transition.ts             ← Draft projection + pro KR
    coaching-impact.ts            ← Staff development modifier
```

---

## 5. Integration Points — How Engines Connect to Existing Code

### 5.1 Nexus Context (`context/nexus-context.tsx`)

**Current state:** Calls `processPlayerQuery()` for player queries, `generateMockSimulation()` for sim queries. Eval snapshots are mock-generated.

**Integration:** Replace the message handler's intelligence path:

```typescript
// BEFORE (current)
if (isPlayerRelatedQuery(userMessage)) {
  const context = processPlayerQuery(userMessage, filters);
  // send raw pool data to GPT
}
if (detectSimulationIntent(userMessage)) {
  const sim = generateMockSimulation(opponent, roster);
  // display mock result
}

// AFTER (with intelligence router)
import { routeQuery, IntelligenceResult } from '@/services/intelligence';

const result: IntelligenceResult = await routeQuery({
  message: userMessage,
  coachContext: programContext,          // from program-context drawer
  roster: currentRoster,                 // from Supabase
  conversationType: conversation.type,
  mode: appContext.mode,
});

if (result.engineUsed) {
  // Build enriched GPT prompt with engine results
  const systemPrompt = buildNexusPrompt(result);
  // Send to GPT with structured intelligence context
  // Render result cards inline (eval snapshot, sim card, etc.)
}
```

### 5.2 Program Context Drawer (`components/program-resources/`)

**Current state:** UI exists for editing offensive/defensive system, cluster weights, position importance, biases. Data stored in React state via `data/mock-program-context.ts`.

**Integration:** Program Context becomes the **Coach Context** binding for all engines. On save → write to `program_context` Supabase table → all subsequent engine calls read from this binding.

```typescript
// When coach saves program context:
const coachContext: CoachContext = {
  programId: currentProgram.id,
  governingBody: 'NAIA',
  division: null,
  majorClass: null,
  offensiveSystem: programContext.offensiveStyle,
  defensiveSystem: programContext.defensiveStyle,
  tempo: programContext.tempo,
  clusterWeights: programContext.clusterWeights,
  levelKey: 'naia', // derived from governing body + division
};
// This binds KLVN, legend selection, position trait weighting, system demands
```

### 5.3 Player Sheet (`components/player-sheet.tsx`)

**Current state:** 57K component displaying player details, KR, clusters, fit reasons. Reads from pre-computed data.

**Integration:** Add "Evaluate" action that triggers V1 eval engine when viewing a national pool player:

```typescript
// On "Evaluate for My Program" tap:
const evalResult = await v1Evaluate({
  playerStats: player.seasonStats,
  coachContext: activeCoachContext,
  position: player.position,
});
// Write to player_evaluations table
// Update eval snapshot in Nexus context
```

### 5.4 Roster Content (`components/roster-content.tsx`)

**Current state:** 69K component showing roster with KR, depth chart, stats. Pre-computed ratings.

**Integration:** Add Team KR computation that recalculates when roster changes:

```typescript
// On roster change (add/remove/scholarship update):
const teamKR = computeTeamKR(
  rosterPlayers.map(p => ({
    base_off_kr: p.ratings.off_kr,
    base_def_kr: p.ratings.def_kr,
    overall_kr: p.ratings.kr,
    minutes_total: p.seasonStats.totalMinutes,
  }))
);
// Display in roster header: Team KR 78.4 (Off: 80.1 | Def: 76.2)
```

### 5.5 Simulation Page (`components/simulation/`)

**Current state:** Full UI for 9 sim types, scenario builder, confidence gate, comparison. All backed by mock data.

**Integration:** Replace mock simulation with real engine:

```typescript
// In simulation-page.tsx, replace generateMockSimulation():
import { runSimulation } from '@/services/intelligence/sim/orchestrator';

const simResult = await runSimulation({
  simType: scenario.simType,
  homeTeam: {
    teamKR: homeTeamKR,
    rotation: homeRotation,    // player KRs + archetypes + minutes
    system: homeCoachContext,
  },
  awayTeam: {
    teamKR: awayTeamKR,
    rotation: awayRotation,
    system: awayCoachContext,  // from OSIE/DSIE if opponent
  },
  location: scenario.location,
  overrides: scenario.overrides,
});
// simResult contains: winProbability, projectedScore, margin, confidence,
// drivers, playerImpact, boxScoreProjection
```

### 5.6 Game Plan Sections (`components/game-plan/sections/`)

**Current state:** 11 UI sections (decision summary, opponent offense/defense, shot profile, actions/triggers, situations, rotation board, player cards, constraints/risk, scout confidence, practice translation). Currently display static mock data.

**Integration:** Pregame engine populates all 11 sections:

```typescript
const pregameReport = await generatePregameReport({
  opponent: opponentProgram,
  opponentRoster: opponentRoster,       // from national pool
  opponentSystem: inferredSystem,        // from OSIE/DSIE
  myTeam: myRoster,
  mySystem: myCoachContext,
});
// pregameReport.decisionSummary → s01
// pregameReport.opponentOffense → s02
// pregameReport.opponentDefense → s03
// ... etc through s11
```

### 5.7 Development Page (`components/development/`)

**Current state:** UI shells for dev home, position groups, drill library, weekly plans, transfer tracker.

**Integration:** Development engine provides computed data:

```typescript
const devPlan = await generateDevelopmentPlan({
  player: playerRatings,
  coachContext: activeCoachContext,
  targetRole: 'starter',
  timeframe: 'season',
});
// devPlan.traitGaps → position-group-board priorities
// devPlan.drillRecommendations → drill-library pre-filter
// devPlan.krTrajectory → weekly-plan-builder targets
```

---

## 6. Implementation Priority

### Phase 1 — Core Engine Port (P0)

The minimum viable intelligence layer. Replaces all mock computation with real math.

| # | Component | Est. Lines | Depends On |
|---|-----------|-----------|------------|
| 1 | `services/intelligence/klvn.ts` | ~200 | Port from Python klvn.py |
| 2 | `services/intelligence/team-kr.ts` | ~150 | Port from Python team_kr.py |
| 3 | `services/intelligence/v1-eval-engine.ts` | ~400 | klvn.ts, existing fit-kr.ts, kr-display.ts |
| 4 | `services/intelligence/confidence-gates.ts` | ~200 | — |
| 5 | `services/intelligence/sim/interaction-library.ts` | ~800 | Data entry from File 04 tables |
| 6 | `services/intelligence/sim/orchestrator.ts` | ~300 | team-kr.ts, interaction-library.ts |
| 7 | `services/intelligence/router.ts` | ~250 | All engines |
| 8 | `services/intelligence/nexus-prompt-builder.ts` | ~200 | router.ts |
| 9 | `supabase/migrations/004_intelligence_schema.sql` | ~150 | — |

**Estimated total:** ~2,650 lines of TypeScript + ~150 lines SQL.

### Phase 2 — Full Pipeline (P1)

| # | Component | Est. Lines |
|---|-----------|-----------|
| 10 | `services/intelligence/bpr.ts` | ~150 |
| 11 | `services/intelligence/impact-modifiers.ts` | ~100 |
| 12 | `services/intelligence/osie-dsie.ts` | ~200 |
| 13 | `services/intelligence/scholarship-nil.ts` | ~200 |
| 14 | `services/intelligence/legends.ts` + level-tier-map | ~300 |
| 15 | `services/intelligence/sim/possession-engine.ts` | ~250 |
| 16 | `services/intelligence/sim/physical-mismatch.ts` | ~100 |
| 17 | `services/intelligence/sim/modifiers.ts` | ~150 |
| 18 | `services/intelligence/scouting/pregame.ts` | ~300 |

### Phase 3 — Full Coverage (P2/P3)

| # | Component | Est. Lines |
|---|-----------|-----------|
| 19 | `services/intelligence/overrides.ts` | ~100 |
| 20 | `services/intelligence/system-risks.ts` | ~100 |
| 21 | `services/intelligence/roster-intelligence.ts` | ~200 |
| 22 | `services/intelligence/sim/governance.ts` | ~100 |
| 23 | `services/intelligence/scouting/halftime.ts` | ~200 |
| 24 | `services/intelligence/scouting/postgame.ts` | ~200 |
| 25 | `services/intelligence/development.ts` | ~250 |
| 26 | `services/intelligence/transfer-portal.ts` | ~150 |
| 27 | `services/intelligence/pro-transition.ts` | ~200 |
| 28 | `services/intelligence/coaching-impact.ts` | ~100 |

---

## 7. Data Flow — End-to-End Example

### "Evaluate Jaylen Brown for our program"

```
User message → Nexus Context
  → Intelligence Router
    → detects: player eval query
    → checks: Coach Context locked? YES (NAIA, Motion Read & React, Pack Line)
    → calls: V1 Eval Engine
      1. Web search → current season stats for Jaylen Brown
      2. Phase 3: Map stats against NAIA legend → anchor range [82, 86]
      3. KLVN: λ = 0.810 (NAIA) → normalize stats for trait scoring
      4. Phase 6: Score available traits → OPF math → composite KR = 84.2
      5. Window check: 84.2 is within [72, 96] (82-10 to 86+10) → VALID
      6. Confidence: 72% (18 games played, 28 min/g, V1 data tier)
    → returns: EvalResult {
        kr: 84, krRange: [82, 86],
        confidence: 72,
        phase3Anchor: { low: 82, high: 86 },
        phase6Raw: 84.2,
        tierLabel: 'Projected Starter' (NAIA),
        levelTierMap: {
          naia: 'Projected Starter',
          ncaa_d2: 'Key Rotation',
          njcaa_d1: 'Franchise Anchor',
        },
        archetype: 'two_way_wing',
        fitKR: 81 (for current system),
        fitReasons: [...],
        strengths: ['on_ball_defense', 'physical'],
        gaps: ['shooting', 'playmaking'],
      }
  → Nexus Prompt Builder
    → builds GPT system prompt with eval result context
    → GPT generates natural language evaluation
  → UI renders: eval snapshot card + conversation response
  → Writes to: player_evaluations table (audit trail)
```

---

## 8. Universal Rules (Enforced Across All Engines)

These rules from the Skill file apply to every engine implementation:

1. **Deterministic:** Same inputs → same outputs. No `Math.random()`. No GPT in computation.
2. **No fabrication:** Missing data = `null` / UNSCORED. Never fill gaps with guesses.
3. **Confidence always shown:** Every engine output includes confidence_pct.
4. **Downstream never modifies upstream:** Development, pro transition, scouting — they consume KR but never change it.
5. **KLVN normalizes INPUTS, not OUTPUTS:** λ adjusts production stats during trait scoring. It does NOT convert KR between levels. One player = one KR = multiple legend reads.
6. **Legends are display-only:** They interpret KR. They don't produce KR.
7. **Player KR weighting through OPF only:** 53/47 applies at Team KR level, not player level. Player KR uses position-specific OPF weights.

---

## 9. Existing Code That Must NOT Be Modified

These files are stable and correct. New engines build on top of them:

| File | Reason |
|------|--------|
| `utils/fit-kr.ts` | Core math is correct. New engines call these functions. |
| `utils/kr-display.ts` | Legends and display are correct. Extend (add Team legend, Pro legend) but don't modify existing entries. |
| `utils/player-badges.ts` | Badge logic is correct. |
| `data/system-demand-profiles.ts` | Archetype/system data is canonical. |
| `data/mock-program-context.ts` | System cluster weights are canonical. |
| `supabase/migrations/001_roster_schema.sql` | Existing schema is in production. New migrations only. |
| `services/player-pool/engine/*.py` | Python pipeline is the source of truth for offline computation. TS ports must match. |
