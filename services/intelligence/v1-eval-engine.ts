/**
 * V1 Evaluation Engine (TypeScript)
 * Spec: services/intelligence/INTELLIGENCE_INTEGRATION_SPEC.md §6 Phase 1
 *
 * 5-step pipeline:
 *   1. Coach Context → level_key, position, system
 *   2. Phase 3: Production Anchor (rough KR range from raw stats)
 *   3. Phase 6: OPF-based KR from KLVN-normalized trait scores
 *   4. Window check: Phase 6 clipped to Phase 3 ± 10
 *   5. Confidence gate: games, minutes, trait coverage
 *
 * Universal Rules enforced:
 *   - No Math.random(). Deterministic.
 *   - Missing data = null / UNSCORED. Never fill with guesses.
 *   - confidence_pct always in output.
 *   - KLVN normalizes inputs, not outputs.
 *   - Legends are display-only (not computed here).
 */

import {
  getLambda,
  computeKlvnConfidence,
  normalizeProduction,
  computeSkillKR,
  POSSESSION_PRIOR,
  SHRINKAGE_ALPHA,
} from './klvn';

// ── OPF Weights (from base_kr/constants.py OPF_COLLEGE) ──
// Format: [off, def, tools, iq]  — must sum to 1.0
const OPF_COLLEGE: Record<string, [number, number, number, number]> = {
  PG: [0.56, 0.28, 0.10, 0.06],
  SG: [0.58, 0.26, 0.12, 0.04],
  SF: [0.52, 0.30, 0.14, 0.04],
  PF: [0.44, 0.36, 0.18, 0.02],
  C:  [0.34, 0.44, 0.20, 0.02],
};

// ── Cluster weights per position (mirrors fit-kr.ts POSITION_WEIGHTS) ──
// 7 clusters sum to 100 per position.
type ClusterKey = 'shooting' | 'finishing' | 'playmaking' | 'on_ball_defense' | 'team_defense' | 'rebounding' | 'physical';

const POSITION_CLUSTER_WEIGHTS: Record<string, Record<ClusterKey, number>> = {
  PG: { shooting: 18, finishing: 9,  playmaking: 27, on_ball_defense: 29, team_defense: 3,  rebounding: 8,  physical: 6  },
  SG: { shooting: 21, finishing: 12, playmaking: 21, on_ball_defense: 24, team_defense: 3,  rebounding: 9,  physical: 10 },
  SF: { shooting: 16, finishing: 13, playmaking: 11, on_ball_defense: 23, team_defense: 5,  rebounding: 12, physical: 20 },
  PF: { shooting: 11, finishing: 16, playmaking: 9,  on_ball_defense: 19, team_defense: 7,  rebounding: 14, physical: 24 },
  C:  { shooting: 5,  finishing: 21, playmaking: 4,  on_ball_defense: 12, team_defense: 15, rebounding: 14, physical: 29 },
};

// Map clusters to OPF components for aggregation
// off: shooting + finishing + playmaking
// def: on_ball_defense + team_defense
// tools: rebounding + physical
// iq: UNSCORED at box_score tier
const CLUSTER_TO_COMPONENT: Record<ClusterKey, 'off' | 'def' | 'tools'> = {
  shooting:        'off',
  finishing:       'off',
  playmaking:      'off',
  on_ball_defense: 'def',
  team_defense:    'def',
  rebounding:      'tools',
  physical:        'tools',
};

// ── Types ──

export interface PlayerSeasonStats {
  pts_pg:       number;
  reb_pg:       number;
  ast_pg:       number;
  stl_pg:       number;
  blk_pg:       number;
  to_pg:        number;
  pf_pg:        number;
  min_pg:       number;
  oreb_pg?:     number;
  dreb_pg?:     number;
  fga_pg?:      number;
  three_pa_pg?: number;
  fta_pg?:      number;
  fg_pct?:      number;
  three_pct?:   number;
  ft_pct?:      number;
  games_played: number;
  team_poss_pg?: number; // optional: team possessions/game
}

export interface CoachContext {
  levelKey:          string;   // e.g. 'naia', 'ncaa_d1_high_major'
  offensiveSystem?:  string;
  defensiveSystem?:  string;
}

export interface V1EvalResult {
  // Final outputs
  kr:            number;            // final KR (integer, 0-100)
  krRange:       [number, number];  // [low, high] — Phase 3 window ± 10
  confidence:    number;            // 0-100 integer
  // Phase results
  phase3Anchor:  { low: number; high: number; mid: number };
  phase6Raw:     number;
  windowValid:   boolean;           // was phase6 within phase3 ± 10?
  // Components
  okr:           number | null;
  dkr:           number | null;
  tkr:           number | null;
  iqkr:          number | null;     // UNSCORED at box_score tier (cross-component estimate)
  basePlayerKr:  number | null;
  // Clusters
  clusters: Record<ClusterKey, number | null>;
  clusterConfidence: Record<ClusterKey, number>; // 0-100
  // Metadata
  levelKey:      string;
  position:      string;
  lambda:        number;
  dataTier:      'box_score';
  scoredTraits:  number;            // how many traits were scored
  totalTraits:   number;            // how many were attempted
}

// ── Step 1: Build trait inputs from box score ──
// Mirrors base_kr/pipeline.py build_trait_inputs()

interface TraitInputs {
  ft_pct?:          number | null;
  fta_per_drive?:   number | null;
  ast_adj_pg?:      number | null;
  stl_per_100?:     number | null;
  perim_fouls_per_100?: number | null;
  blk_per_100?:     number | null;
  dreb_pg?:         number | null;
  oreb_pg?:         number | null;
  three_pct?:       number | null;
  foul_draw_rate?:  number | null;  // fta/fga
  tov_pg?:          number | null;
}

function buildTraitInputs(stats: PlayerSeasonStats): TraitInputs {
  const {
    fga_pg = 0, fta_pg = 0, three_pct, ft_pct,
    ast_pg, stl_pg, blk_pg, pf_pg, to_pg,
    oreb_pg = 0, dreb_pg = 0, min_pg, three_pa_pg = 0,
  } = stats;

  const inputs: TraitInputs = {};

  // FT% (shooting)
  if (ft_pct && ft_pct > 0 && fta_pg >= 1.0) inputs.ft_pct = ft_pct;

  // 3P% (shooting)
  if (three_pct && three_pct > 0 && three_pa_pg >= 1.0) inputs.three_pct = three_pct;

  // Foul draw rate = fta/fga (finishing proxy)
  if (fga_pg > 0 && fta_pg > 0) inputs.foul_draw_rate = fta_pg / fga_pg;

  // AST/G (playmaking)
  if (ast_pg > 0) inputs.ast_adj_pg = ast_pg;

  // STL per 100 estimated defensive possessions (POA defense)
  if (stl_pg > 0 && min_pg > 5) {
    const estDefPoss = (min_pg / 40.0) * 70.0;
    if (estDefPoss > 0) inputs.stl_per_100 = (stl_pg / estDefPoss) * 100.0;
  }

  // PF per 100 possessions (foul discipline)
  if (min_pg > 5) {
    const estPoss = (min_pg / 40.0) * 70.0;
    if (estPoss > 0) inputs.perim_fouls_per_100 = (pf_pg / estPoss) * 100.0;
  }

  // BLK per 100 (team defense / rim protection proxy)
  if (blk_pg > 0 && min_pg > 5) {
    const estPoss = (min_pg / 40.0) * 70.0;
    if (estPoss > 0) inputs.blk_per_100 = (blk_pg / estPoss) * 100.0;
  }

  // Rebounds
  if (dreb_pg > 0) inputs.dreb_pg = dreb_pg;
  if (oreb_pg > 0) inputs.oreb_pg = oreb_pg;

  // TO/G (lower is better)
  if (to_pg > 0) inputs.tov_pg = to_pg;

  return inputs;
}

// ── Step 2: Score traits → clusters ──

interface ScoredCluster {
  score: number | null;
  confidence: number; // 0-100 (fraction of cluster traits that were scored)
}

function scoreClusters(
  inputs: TraitInputs,
  levelKey: string,
  games: number,
): Record<ClusterKey, ScoredCluster> {
  const N = games;

  // Helper: wrap computeSkillKR safely
  const score = (
    val: number | null | undefined,
    traitKey: string,
    lowerIsBetter = false,
  ): number | null => {
    if (val == null) return null;
    try {
      return computeSkillKR(val, N, levelKey, traitKey, lowerIsBetter).skill_kr;
    } catch {
      return null;
    }
  };

  // ── Shooting cluster ──
  const ft  = score(inputs.ft_pct,    'ft_pct');
  const tp  = score(inputs.three_pct, 'three_pct');
  const shootingScores = [ft, tp].filter(v => v !== null) as number[];
  const shooting: ScoredCluster = {
    score: shootingScores.length ? shootingScores.reduce((a, b) => a + b, 0) / shootingScores.length : null,
    confidence: (shootingScores.length / 2) * 100,
  };

  // ── Finishing cluster ──
  const fd = score(inputs.foul_draw_rate, 'foul_draw_rate');
  const finishing: ScoredCluster = {
    score: fd,
    confidence: fd !== null ? 50 : 0, // only 1 proxy trait available
  };

  // ── Playmaking cluster ──
  const ast = score(inputs.ast_adj_pg, 'ast_pg');
  const tov = score(inputs.tov_pg, 'tov_pg', true); // lower is better
  const pmScores = [ast, tov].filter(v => v !== null) as number[];
  const playmaking: ScoredCluster = {
    score: pmScores.length ? pmScores.reduce((a, b) => a + b, 0) / pmScores.length : null,
    confidence: (pmScores.length / 2) * 100,
  };

  // ── On-ball defense cluster ──
  const stl = score(inputs.stl_per_100, 'stl_per_100');
  const pf  = score(inputs.perim_fouls_per_100, 'pf_per_100', true); // lower is better
  const obdScores = [stl, pf].filter(v => v !== null) as number[];
  const on_ball_defense: ScoredCluster = {
    score: obdScores.length ? obdScores.reduce((a, b) => a + b, 0) / obdScores.length : null,
    confidence: (obdScores.length / 2) * 100,
  };

  // ── Team defense cluster ──
  const blk = score(inputs.blk_per_100, 'blk_per_100');
  const team_defense: ScoredCluster = {
    score: blk,
    confidence: blk !== null ? 50 : 0,
  };

  // ── Rebounding cluster ──
  const drb = score(inputs.dreb_pg, 'dreb_pg');
  const orb = score(inputs.oreb_pg, 'oreb_pg');
  const rebScores = [drb, orb].filter(v => v !== null) as number[];
  const rebounding: ScoredCluster = {
    score: rebScores.length ? rebScores.reduce((a, b) => a + b, 0) / rebScores.length : null,
    confidence: (rebScores.length / 2) * 100,
  };

  // ── Physical cluster — UNSCORED at box_score tier ──
  // No box-score proxy available at this tier; will use cross-component estimate.
  const physical: ScoredCluster = { score: null, confidence: 0 };

  return { shooting, finishing, playmaking, on_ball_defense, team_defense, rebounding, physical };
}

// ── Step 3: Clusters → OPF → Base KR ──

function computeOPFKr(
  clusters: Record<ClusterKey, ScoredCluster>,
  position: string,
): {
  okr: number | null;
  dkr: number | null;
  tkr: number | null;
  iqkr: number | null;
  basePlayerKr: number | null;
} {
  const opf = OPF_COLLEGE[position] ?? OPF_COLLEGE['SF'];
  const [opf_off, opf_def, opf_tools, opf_iq] = opf;
  const posWeights = POSITION_CLUSTER_WEIGHTS[position] ?? POSITION_CLUSTER_WEIGHTS['SF'];

  // Aggregate clusters → components using renormalized position weights
  function aggregateComponent(clusterKeys: ClusterKey[]): number | null {
    const scored: Array<[number, number]> = []; // [score, weight]
    for (const ck of clusterKeys) {
      const s = clusters[ck].score;
      if (s !== null) scored.push([s, posWeights[ck]]);
    }
    if (!scored.length) return null;
    const totalW = scored.reduce((s, [, w]) => s + w, 0);
    if (totalW === 0) return null;
    return scored.reduce((s, [v, w]) => s + v * (w / totalW), 0);
  }

  const okr  = aggregateComponent(['shooting', 'finishing', 'playmaking']);
  const dkr  = aggregateComponent(['on_ball_defense', 'team_defense']);
  const tkr  = aggregateComponent(['rebounding', 'physical']);

  // IQ: UNSCORED at box_score → use player's weighted cross-component estimate
  const scoredComponents: Array<[number, number]> = [];
  if (okr  !== null) scoredComponents.push([okr,  opf_off]);
  if (dkr  !== null) scoredComponents.push([dkr,  opf_def]);
  if (tkr  !== null) scoredComponents.push([tkr,  opf_tools]);
  const crossTotal = scoredComponents.reduce((s, [, w]) => s + w, 0);
  const iqkr = crossTotal > 0
    ? scoredComponents.reduce((s, [v, w]) => s + v * (w / crossTotal), 0)
    : null;

  // Base Player KR: all 4 components weighted by OPF
  const components: Array<[number | null, number]> = [
    [okr, opf_off], [dkr, opf_def], [tkr, opf_tools], [iqkr, opf_iq],
  ];
  const available = components.filter(([v]) => v !== null) as Array<[number, number]>;
  if (!available.length) return { okr, dkr, tkr, iqkr, basePlayerKr: null };

  const totalOpfW = available.reduce((s, [, w]) => s + w, 0);
  const basePlayerKr = available.reduce((s, [v, w]) => s + v * (w / totalOpfW), 0);

  return { okr, dkr, tkr, iqkr, basePlayerKr };
}

// ── Phase 3: Production Anchor ──
// Rough KR range derived from normalized production stats.
// Uses key stats normalized to per-100-poss × lambda to estimate tier.

function computePhase3Anchor(
  stats: PlayerSeasonStats,
  levelKey: string,
): { low: number; high: number; mid: number } {
  const lam  = getLambda(levelKey);
  const poss = stats.team_poss_pg ?? (POSSESSION_PRIOR[levelKey] ?? 70);
  const N    = stats.games_played;
  const alpha = SHRINKAGE_ALPHA[levelKey] ?? 12;

  // Normalize key counting stats to per-100-poss equivalent
  const pts100  = (stats.pts_pg  / poss) * 100 * lam;
  const reb100  = (stats.reb_pg  / poss) * 100 * lam;
  const ast100  = (stats.ast_pg  / poss) * 100 * lam;
  const stl100  = (stats.stl_pg  / poss) * 100 * lam;
  const blk100  = (stats.blk_pg  / poss) * 100 * lam;

  // League-average per-100 baselines (derived from KLVN priors × avg poss)
  // These represent a roughly average rotation player at the reference level (D1 HM)
  const avgPts100  = 14.8;
  const avgReb100  = 8.2;
  const avgAst100  = 4.8;
  const avgStl100  = 1.1;
  const avgBlk100  = 0.6;

  // Production ratios vs average (1.0 = average)
  const pts_ratio  = pts100  / avgPts100;
  const reb_ratio  = reb100  / avgReb100;
  const ast_ratio  = ast100  / avgAst100;
  const stl_ratio  = stl100  / avgStl100;
  const blk_ratio  = blk100  / avgBlk100;

  // Bayesian shrinkage toward 1.0 for small samples
  const shrink = (r: number) => (N * r + alpha * 1.0) / (N + alpha);
  const pts_s = shrink(pts_ratio);
  const reb_s = shrink(reb_ratio);
  const ast_s = shrink(ast_ratio);
  const stl_s = shrink(stl_ratio);
  const blk_s = shrink(blk_ratio);

  // Efficiency bonus/penalty
  const efgBonus = (() => {
    if (!stats.fg_pct) return 0;
    const baseline = 0.455; // D1 HM avg
    return (stats.fg_pct - baseline) * lam * 2.0;
  })();

  // Weighted production index (1.0 = average ~KR 52-53)
  const prodIndex = (
    pts_s * 0.38 +
    reb_s * 0.18 +
    ast_s * 0.20 +
    stl_s * 0.12 +
    blk_s * 0.12
  ) + efgBonus;

  // Map to KR: average player (prodIndex=1.0) → ~52 KR
  // prodIndex=2.0 → ~77 KR, prodIndex=0.5 → ~40 KR
  const anchor_mid = Math.max(20, Math.min(92, 52 + (prodIndex - 1.0) * 28));
  const spread = 10; // ± 10 around the midpoint

  return {
    low:  Math.round(Math.max(10, anchor_mid - spread)),
    high: Math.round(Math.min(100, anchor_mid + spread)),
    mid:  Math.round(anchor_mid),
  };
}

// ── Confidence Gate ──

function computeConfidence(
  stats: PlayerSeasonStats,
  levelKey: string,
  scoredTraits: number,
  totalTraits: number,
): number {
  // Component 1: games played vs target
  const gamesConf = computeKlvnConfidence(stats.games_played, levelKey); // 0-1

  // Component 2: minutes coverage (normalized to 30 mpg = full)
  const minutesConf = Math.min(1.0, (stats.min_pg ?? 0) / 30.0);

  // Component 3: trait coverage (what fraction we could score)
  const traitConf = totalTraits > 0 ? scoredTraits / totalTraits : 0.5;

  // Weighted composite
  const rawConf = (gamesConf * 0.50 + minutesConf * 0.25 + traitConf * 0.25);

  return Math.round(Math.min(100, Math.max(0, rawConf * 100)));
}

// ── Public API ──

/**
 * Evaluate a player from box-score stats using the V1 Protocol.
 *
 * Steps:
 *   1. Build trait inputs from box-score stats
 *   2. Score traits → clusters (KLVN-normalized)
 *   3. Aggregate clusters → OKR/DKR/TKR/IQKR via OPF weights
 *   4. Apply KLVN lambda to get base KR (Phase 6)
 *   5. Compute Phase 3 production anchor
 *   6. Clip Phase 6 to Phase 3 ± 10 window → final KR
 *   7. Compute confidence gate
 */
export function v1Evaluate(
  stats: PlayerSeasonStats,
  coachContext: CoachContext,
  position: string,
): V1EvalResult {
  const levelKey = coachContext.levelKey;
  const pos      = position.toUpperCase();
  const lam      = getLambda(levelKey);

  // Step 1: Trait inputs
  const inputs = buildTraitInputs(stats);

  // Step 2: Score clusters
  const clusterResults = scoreClusters(inputs, levelKey, stats.games_played);

  // Build flat cluster maps for return
  const clusters: Record<ClusterKey, number | null>    = {} as any;
  const clusterConf: Record<ClusterKey, number>        = {} as any;
  let scoredTraits = 0;
  const totalTraits = 8; // box-score proxy traits attempted

  for (const ck of Object.keys(clusterResults) as ClusterKey[]) {
    clusters[ck]     = clusterResults[ck].score;
    clusterConf[ck]  = clusterResults[ck].confidence;
    if (clusterResults[ck].score !== null) scoredTraits++;
  }

  // Step 3: OPF aggregation
  const { okr, dkr, tkr, iqkr, basePlayerKr } = computeOPFKr(clusterResults, pos);

  // Step 4: Phase 6 raw KR — apply lambda
  const phase6Raw = basePlayerKr !== null
    ? Math.round(Math.max(0, Math.min(100, basePlayerKr * lam)) * 10) / 10
    : null;

  // Step 5: Phase 3 production anchor
  const phase3 = computePhase3Anchor(stats, levelKey);

  // Step 6: Window check and clipping
  const windowLow  = phase3.low  - 10;
  const windowHigh = phase3.high + 10;

  let finalKR: number;
  let windowValid = true;

  if (phase6Raw === null) {
    finalKR = phase3.mid;
    windowValid = false;
  } else if (phase6Raw < windowLow) {
    finalKR = windowLow;
    windowValid = false;
  } else if (phase6Raw > windowHigh) {
    finalKR = windowHigh;
    windowValid = false;
  } else {
    finalKR = phase6Raw;
    windowValid = true;
  }

  finalKR = Math.round(finalKR);

  // Step 7: Confidence
  const confidence = computeConfidence(stats, levelKey, scoredTraits, totalTraits);

  return {
    kr:            finalKR,
    krRange:       [phase3.low, phase3.high],
    confidence,
    phase3Anchor:  phase3,
    phase6Raw:     phase6Raw ?? phase3.mid,
    windowValid,
    okr:           okr   !== null ? Math.round(okr   * 10) / 10 : null,
    dkr:           dkr   !== null ? Math.round(dkr   * 10) / 10 : null,
    tkr:           tkr   !== null ? Math.round(tkr   * 10) / 10 : null,
    iqkr:          iqkr  !== null ? Math.round(iqkr  * 10) / 10 : null,
    basePlayerKr:  basePlayerKr !== null ? Math.round(basePlayerKr * 10) / 10 : null,
    clusters,
    clusterConfidence: clusterConf,
    levelKey,
    position: pos,
    lambda: lam,
    dataTier: 'box_score',
    scoredTraits,
    totalTraits,
  };
}
