/**
 * V1 Evaluation Engine (TypeScript) — Rewrite
 * V1 EVALUATION PROTOCOL (5 steps):
 *   1. Coach Context → level_key, position, system
 *   2. Phase 3 — Legend Anchor: pattern-match production vs level legend tiers
 *   3. Phase 6 — OPF math: Composite Bounding v0.3 + Proxy Confidence v0.2
 *   4. Window check: Phase 6 clipped to Phase 3 midpoint ± 10
 *   5. Confidence gate
 *
 * Fix #1: Composite Bounding v0.3 — NULL traits bounded by Off/Def BPM, USG%, TS%
 * Fix #2: Proxy Confidence v0.2 — Effective = CW×PROXY + (1-CW)×Composite_Bound_Midpoint
 * Fix #3: Phase 3 = legend tier pattern-match, NOT Bayesian formula
 * Fix #4: Lambda NOT applied to final KR (Z_cross = Z_g×λ inside computeSkillKR handles it)
 */

import {
  getLambda,
  computeKlvnConfidence,
  computeSkillKR,
  POSSESSION_PRIOR,
  SHRINKAGE_ALPHA,
} from './klvn';

// ── OPF Weights (from base_kr/constants.py OPF_COLLEGE) ──
// [off, def, tools, iq] must sum to 1.0
const OPF_COLLEGE: Record<string, [number, number, number, number]> = {
  PG: [0.56, 0.28, 0.10, 0.06],
  SG: [0.58, 0.26, 0.12, 0.04],
  SF: [0.52, 0.30, 0.14, 0.04],
  PF: [0.44, 0.36, 0.18, 0.02],
  C:  [0.34, 0.44, 0.20, 0.02],
};

// ── Cluster weights per position (7 clusters, sum 100) ──
type ClusterKey = 'shooting'|'finishing'|'playmaking'|'on_ball_defense'|'team_defense'|'rebounding'|'physical';

const POSITION_CLUSTER_WEIGHTS: Record<string, Record<ClusterKey, number>> = {
  PG: { shooting:18, finishing:9,  playmaking:27, on_ball_defense:29, team_defense:3,  rebounding:8,  physical:6  },
  SG: { shooting:21, finishing:12, playmaking:21, on_ball_defense:24, team_defense:3,  rebounding:9,  physical:10 },
  SF: { shooting:16, finishing:13, playmaking:11, on_ball_defense:23, team_defense:5,  rebounding:12, physical:20 },
  PF: { shooting:11, finishing:16, playmaking:9,  on_ball_defense:19, team_defense:7,  rebounding:14, physical:24 },
  C:  { shooting:5,  finishing:21, playmaking:4,  on_ball_defense:12, team_defense:15, rebounding:14, physical:29 },
};

const CLUSTER_TO_COMPONENT: Record<ClusterKey, 'off'|'def'|'tools'> = {
  shooting: 'off', finishing: 'off', playmaking: 'off',
  on_ball_defense: 'def', team_defense: 'def',
  rebounding: 'tools', physical: 'tools',
};

// ── Proxy Confidence Weights v0.2 ──
// Effective_Score = (CW × PROXY_Score) + ((1 − CW) × Composite_Bound_Midpoint)
// TRUE traits = 1.0, NULL (UNSCORED) traits = 0.0
const PROXY_CW: Record<string, number> = {
  ft_pct:           1.00,  // TRUE
  three_pct:        0.90,  // 3PT Spot-Up
  foul_draw_rate:   0.75,  // Foul Draw
  ast_adj_pg:       0.50,  // Advantage Creation proxy
  tov_pg:           0.55,  // Ball Security
  stl_per_100:      0.40,  // Steal Timing
  perim_fouls_per_100: 0.80, // Foul Discipline
  // blk_per_100 is position-dependent (see getBlkCW)
  dreb_pg:          0.85,  // Defensive Rebounding
  oreb_pg:          0.80,  // Offensive Rebounding
  motor_proxy:      0.50,  // Motor
  endurance_proxy:  0.35,  // Endurance
};

function getBlkCW(position: string): number {
  // Rim Protection: 0.75 for bigs, 0.40 for guards
  return (position === 'C' || position === 'PF') ? 0.75 : 0.40;
}

// ── Level Production Norms (for Phase 3 Legend Anchor Mapping) ──
// tiers: [low, high, minScore] in descending minScore order
// minScore = minimum production composite to reach that tier
interface LevelNorms {
  spp: number;  // starter pts/game (level average)
  srp: number;  // starter reb/game
  sap: number;  // starter ast/game
  sdp: number;  // starter defensive stocks/game (stl+blk)
  tsb: number;  // TS% baseline at this level
  tiers: Array<[number, number, number]>; // [low, high, minScore]
}

const LEVEL_NORMS: Record<string, LevelNorms> = {
  ncaa_d1_high_major: {
    spp:12.5, srp:5.0, sap:2.0, sdp:1.5, tsb:0.530,
    tiers:[[95,97,1.50],[92,94,1.20],[89,91,1.02],[86,88,0.80],[83,85,0.58],[80,82,0.42],[77,79,0.28],[74,76,0.16],[71,73,0.08],[68,70,0]],
  },
  ncaa_d1_mid_major: {
    spp:12.0, srp:5.0, sap:2.0, sdp:1.5, tsb:0.525,
    tiers:[[92,94,1.32],[88,91,1.08],[85,87,0.88],[82,84,0.68],[79,81,0.50],[76,78,0.35],[73,75,0.20],[70,72,0.10],[67,69,0]],
  },
  ncaa_d1_low_major: {
    spp:11.5, srp:5.0, sap:2.0, sdp:1.5, tsb:0.520,
    tiers:[[88,91,1.10],[84,87,0.90],[80,83,0.72],[77,79,0.55],[74,76,0.40],[71,73,0.26],[68,70,0.15],[65,67,0.06],[62,64,0]],
  },
  ncaa_d2: {
    spp:12.5, srp:5.2, sap:2.0, sdp:1.5, tsb:0.520,
    tiers:[[86,89,1.50],[82,85,1.10],[78,81,0.88],[75,77,0.68],[72,74,0.50],[69,71,0.35],[66,68,0.20],[63,65,0.08],[60,62,0]],
  },
  njcaa_d1: {
    spp:14.0, srp:5.5, sap:2.2, sdp:1.6, tsb:0.520,
    tiers:[[84,87,1.50],[80,83,1.20],[76,79,0.98],[73,75,0.76],[70,72,0.55],[67,69,0.38],[64,66,0.22],[61,63,0.08],[58,60,0]],
  },
  naia: {
    spp:12.0, srp:5.2, sap:2.0, sdp:1.5, tsb:0.510,
    tiers:[[82,85,1.15],[78,81,0.90],[74,77,0.70],[71,73,0.52],[68,70,0.37],[65,67,0.24],[62,64,0.14],[59,61,0.06],[56,58,0]],
  },
  cccaa: {
    spp:14.0, srp:5.5, sap:2.2, sdp:1.6, tsb:0.510,
    tiers:[[80,83,1.50],[76,79,1.20],[72,75,0.98],[69,71,0.76],[66,68,0.55],[63,65,0.38],[60,62,0.22],[57,59,0.08],[54,56,0]],
  },
  njcaa_d2: {
    spp:13.0, srp:5.2, sap:2.0, sdp:1.5, tsb:0.510,
    tiers:[[78,81,1.50],[74,77,1.20],[70,73,0.98],[67,69,0.76],[64,66,0.55],[61,63,0.38],[58,60,0.22],[55,57,0.08],[52,54,0]],
  },
  ncaa_d3: {
    spp:12.0, srp:5.0, sap:2.0, sdp:1.4, tsb:0.500,
    tiers:[[76,79,1.50],[72,75,1.20],[68,71,0.98],[65,67,0.76],[62,64,0.55],[59,61,0.38],[56,58,0.22],[53,55,0.08],[50,52,0]],
  },
  njcaa_d3: {
    spp:12.0, srp:5.0, sap:2.0, sdp:1.4, tsb:0.500,
    tiers:[[74,77,1.50],[70,73,1.20],[66,69,0.98],[63,65,0.76],[60,62,0.55],[57,59,0.38],[54,56,0.22],[51,53,0.08],[48,50,0]],
  },
  uscaa: {
    spp:13.0, srp:5.5, sap:2.0, sdp:1.5, tsb:0.490,
    tiers:[[76,100,1.40],[72,75,0.90],[68,71,0.68],[64,67,0.50],[61,63,0.34],[58,60,0.22],[55,57,0.12],[52,54,0.05],[49,51,0]],
  },
  nccaa_d1: {
    spp:12.0, srp:5.0, sap:2.0, sdp:1.4, tsb:0.480,
    tiers:[[70,73,1.50],[66,69,1.20],[62,65,0.98],[59,61,0.76],[56,58,0.55],[53,55,0.38],[50,52,0.22],[47,49,0.08],[44,46,0]],
  },
  nccaa_d2: {
    spp:11.0, srp:4.8, sap:1.8, sdp:1.3, tsb:0.470,
    tiers:[[68,71,1.50],[64,67,1.20],[60,63,0.98],[56,59,0.76],[53,55,0.55],[50,52,0.38],[47,49,0.22],[44,46,0.08],[41,43,0]],
  },
  hs_prep_postgrad: {
    spp:18.0, srp:6.0, sap:2.5, sdp:1.8, tsb:0.500,
    tiers:[[60,65,1.50],[56,59,1.20],[52,55,0.98],[49,51,0.76],[46,48,0.55],[43,45,0.38],[40,42,0.22],[37,39,0.08],[34,36,0]],
  },
};

// ── Types ──

export interface PlayerSeasonStats {
  // Box score
  pts_pg:       number;
  reb_pg:       number;
  ast_pg:       number;
  stl_pg:       number;
  blk_pg:       number;
  to_pg:        number;
  pf_pg:        number;
  min_pg:       number;
  games_played: number;
  oreb_pg?:     number;
  dreb_pg?:     number;
  fga_pg?:      number;
  three_pa_pg?: number;
  fta_pg?:      number;
  fg_pct?:      number;
  three_pct?:   number;
  ft_pct?:      number;
  team_poss_pg?: number;
  // Advanced metrics (Tier 2 — for Composite Bounding v0.3)
  off_bpm?:  number;   // Offensive Box Plus/Minus
  def_bpm?:  number;   // Defensive Box Plus/Minus
  bpm?:      number;   // Overall Box Plus/Minus
  usg_pct?:  number;   // Usage % (0–35 typical range)
  ts_pct?:   number;   // True Shooting % (0–1)
  tov_pct?:  number;   // Turnover % (0–100)
  drb_pct?:  number;   // Defensive Rebound % (0–100)
  orb_pct?:  number;   // Offensive Rebound % (0–100)
  stl_pct?:  number;   // Steal % (0–100)
  blk_pct?:  number;   // Block % (0–100)
  ast_pct?:  number;   // Assist % (0–100)
}

export interface CoachContext {
  levelKey:         string;
  offensiveSystem?: string;
  defensiveSystem?: string;
  tempo?:           string;
  governingBody?:   string;
  division?:        string;
  majorClass?:      string;
}

export interface V1EvalResult {
  finalKr:       number | null;
  krRange:       [number, number];
  confidence_pct: number;
  phase3Anchor:  { low: number; high: number; mid: number };
  phase6Raw:     number | null;
  windowValid:   boolean;
  okr:           number | null;
  dkr:           number | null;
  tkr:           number | null;
  iqkr:          number | null;
  basePlayerKr:  number | null;
  clusters:      Record<ClusterKey, number | null>;
  clusterConfidence: Record<ClusterKey, number>;
  strengths:     string[];
  gaps:          string[];
  confidenceFlags: string[];
  levelKey:      string;
  position:      string;
  lambda:        number;
  dataTier:      'box_score';
  scoredTraits:  number;
  totalTraits:   number;
}

// ── Band Functions for Composite Bounding ──
// Each returns 0–100. null/undefined input → 50 (neutral).

function bandPiecewise(val: number | null | undefined, pts: Array<[number, number]>, defVal = 50): number {
  if (val == null) return defVal;
  for (const [threshold, score] of pts) {
    if (val >= threshold) return score;
  }
  return pts[pts.length - 1][1];
}

// Offensive BPM: range ~-8 to +15 at college level
function bandOffBpm(v: number | null | undefined): number {
  return bandPiecewise(v, [[8,90],[5,80],[2,70],[0,60],[-2,50],[-4,40],[-6,30]]);
}

// Defensive BPM: range ~-5 to +8
function bandDefBpm(v: number | null | undefined): number {
  return bandPiecewise(v, [[4,90],[2.5,80],[1,70],[0,60],[-1,50],[-2.5,40],[-4,30]]);
}

// Overall BPM
function bandBpm(v: number | null | undefined): number {
  return bandPiecewise(v, [[7,90],[4,80],[1.5,70],[0,60],[-1.5,50],[-3.5,40],[-6,30]]);
}

// Usage %: typical range 10–32
function bandUsg(v: number | null | undefined): number {
  return bandPiecewise(v, [[28,90],[24,80],[20,70],[17,60],[14,50],[11,40],[8,30]]);
}

// True Shooting %: range 0.40–0.72
function bandTs(v: number | null | undefined): number {
  if (v == null) return 50;
  const pct = v > 1 ? v / 100 : v;
  return bandPiecewise(pct, [[0.62,90],[0.58,80],[0.55,70],[0.52,60],[0.48,50],[0.44,40],[0.40,30]]);
}

// STL%: range 0–6%
function bandStlPct(v: number | null | undefined): number {
  return bandPiecewise(v, [[3.5,90],[2.5,80],[1.8,70],[1.2,60],[0.7,50],[0.3,30]]);
}

// BLK%: range 0–12%
function bandBlkPct(v: number | null | undefined): number {
  return bandPiecewise(v, [[5.0,90],[3.5,80],[2.0,70],[1.0,60],[0.4,50],[0.1,30]]);
}

// AST/TO ratio
function bandAstTo(v: number | null | undefined): number {
  return bandPiecewise(v, [[4.0,90],[3.0,80],[2.2,70],[1.5,60],[1.0,50],[0.6,35]]);
}

// TOV% (inverse — lower is better): range 5–30%
function bandInvTovPct(v: number | null | undefined): number {
  if (v == null) return 50;
  return bandPiecewise(v, [[30,20],[25,30],[20,40],[15,55],[12,70],[9,80],[0,90]]);
}

// DRB%: range 5–35%
function bandDrbPct(v: number | null | undefined): number {
  return bandPiecewise(v, [[25,90],[20,80],[15,70],[11,60],[8,50],[5,35]]);
}

// ORB%: range 0–25%
function bandOrbPct(v: number | null | undefined): number {
  return bandPiecewise(v, [[15,90],[10,80],[7,70],[4,60],[2,50],[0.5,35]]);
}

// ── Composite Bounding v0.3 ──

function computeCompositeBound(
  clusterType: 'offensive' | 'defensive' | 'iq' | 'rebounding',
  stats: PlayerSeasonStats,
): number {
  switch (clusterType) {
    case 'offensive': {
      const usg = stats.usg_pct ?? 18;
      const ts  = stats.ts_pct   ?? (stats.bpm != null ? undefined : undefined); // prefer explicit ts_pct
      if (usg < 20) {
        // Low-usage fix: TS% gets more weight
        return 0.30 * bandOffBpm(stats.off_bpm)
             + 0.15 * bandUsg(usg)
             + 0.55 * bandTs(stats.ts_pct);
      }
      return 0.50 * bandOffBpm(stats.off_bpm)
           + 0.30 * bandUsg(usg)
           + 0.20 * bandTs(stats.ts_pct);
    }
    case 'defensive':
      return 0.50 * bandDefBpm(stats.def_bpm)
           + 0.30 * bandStlPct(stats.stl_pct)
           + 0.20 * bandBlkPct(stats.blk_pct);

    case 'iq': {
      const astTo = stats.ast_pg > 0 && stats.to_pg > 0
        ? stats.ast_pg / stats.to_pg
        : null;
      return 0.40 * bandBpm(stats.bpm)
           + 0.35 * bandAstTo(astTo)
           + 0.25 * bandInvTovPct(stats.tov_pct);
    }
    case 'rebounding':
      return 0.50 * bandDrbPct(stats.drb_pct)
           + 0.50 * bandOrbPct(stats.orb_pct);
  }
}

/** Position caps for unscored Tools traits (Speed, Lateral Quickness) */
const TOOLS_SPEED_CAP: Record<string, number> = { C:78, PF:80, SF:88, SG:90, PG:92 };
const TOOLS_LAT_CAP:   Record<string, number> = { C:76, PF:78, SF:86, SG:88, PG:90 };

function computeToolsBound(
  traitKey: 'speed' | 'lateral',
  scoredToolsAvg: number,
  position: string,
): number {
  const cap = traitKey === 'speed'
    ? (TOOLS_SPEED_CAP[position] ?? 88)
    : (TOOLS_LAT_CAP[position]   ?? 86);
  return Math.min(scoredToolsAvg, cap);
}

// ── TS% Estimator ──

function estimateTs(stats: PlayerSeasonStats): number {
  if (stats.ts_pct != null) return stats.ts_pct > 1 ? stats.ts_pct / 100 : stats.ts_pct;
  const fga = stats.fga_pg ?? 0;
  const fta = stats.fta_pg ?? 0;
  const pts = stats.pts_pg;
  const denom = 2 * (fga + 0.44 * fta);
  if (denom > 0) return pts / denom;
  if (stats.fg_pct != null) return stats.fg_pct * 1.08; // rough
  return 0.50; // neutral fallback
}

// ── Trait Inputs ──

interface TraitInputs {
  ft_pct?:              number | null;
  three_pct?:           number | null;
  foul_draw_rate?:      number | null;
  ast_adj_pg?:          number | null;
  tov_pg?:              number | null;
  stl_per_100?:         number | null;
  perim_fouls_per_100?: number | null;
  blk_per_100?:         number | null;
  dreb_pg?:             number | null;
  oreb_pg?:             number | null;
  motor_raw?:           number | null;  // (stl + orb + blk) / 3 × MPG factor
  endurance_raw?:       number | null;  // min_pg
}

function buildTraitInputs(stats: PlayerSeasonStats): TraitInputs {
  const { fga_pg=0, fta_pg=0, three_pct, ft_pct, ast_pg, stl_pg, blk_pg, pf_pg, to_pg,
          oreb_pg=0, dreb_pg=0, min_pg, three_pa_pg=0 } = stats;
  const inputs: TraitInputs = {};

  if (ft_pct && ft_pct > 0 && fta_pg >= 1.0)     inputs.ft_pct = ft_pct;
  if (three_pct && three_pct > 0 && three_pa_pg >= 1.0) inputs.three_pct = three_pct;
  if (fga_pg > 0 && fta_pg > 0)                  inputs.foul_draw_rate = fta_pg / fga_pg;
  if (ast_pg > 0)                                 inputs.ast_adj_pg = ast_pg;
  if (to_pg > 0)                                  inputs.tov_pg = to_pg;

  if (min_pg > 5) {
    const estPoss = (min_pg / 40.0) * 70.0;
    if (stl_pg > 0) inputs.stl_per_100   = (stl_pg / estPoss) * 100.0;
    inputs.perim_fouls_per_100 = (pf_pg / estPoss) * 100.0;
    if (blk_pg > 0) inputs.blk_per_100   = (blk_pg / estPoss) * 100.0;
  }

  if (dreb_pg > 0) inputs.dreb_pg = dreb_pg;
  if (oreb_pg > 0) inputs.oreb_pg = oreb_pg;

  // Motor: activity proxy (stocks + oreb per minute)
  if (min_pg > 5) {
    inputs.motor_raw = (stl_pg + oreb_pg + blk_pg) / Math.max(1, min_pg / 10);
  }
  // Endurance: minutes per game
  inputs.endurance_raw = min_pg;

  return inputs;
}

// ── Cluster Scoring with Composite Bounding v0.3 + Proxy Confidence v0.2 ──

interface ScoredCluster {
  score:      number;       // effective score (ALWAYS a number — never null)
  rawScore:   number | null; // raw PROXY score before blending (null if unscored)
  confidence: number;       // 0–100 (how much of this came from actual data vs bound)
}

function scoreClusters(
  inputs: TraitInputs,
  levelKey: string,
  games: number,
  stats: PlayerSeasonStats,
  position: string,
): Record<ClusterKey, ScoredCluster> {

  // Pre-compute composite bounds per cluster type
  const offBound = computeCompositeBound('offensive', stats);
  const defBound = computeCompositeBound('defensive', stats);
  const rebBound = computeCompositeBound('rebounding', stats);

  // Helper: compute effective score for a single trait
  const effectiveScore = (
    rawVal: number | null | undefined,
    traitKey: string,
    cw: number,
    bound: number,
    lowerIsBetter = false,
  ): { eff: number; raw: number | null } => {
    if (rawVal == null) {
      // UNSCORED: use composite bound (CW=0)
      return { eff: bound, raw: null };
    }
    let proxy = 50;
    try {
      proxy = computeSkillKR(rawVal, games, levelKey, traitKey, lowerIsBetter).skill_kr;
    } catch {
      return { eff: bound, raw: null };
    }
    const eff = cw * proxy + (1 - cw) * bound;
    return { eff, raw: proxy };
  };

  // ── Shooting cluster ──
  const ftRes  = effectiveScore(inputs.ft_pct,    'ft_pct',   PROXY_CW.ft_pct,   offBound);
  const tpRes  = effectiveScore(inputs.three_pct, 'three_pct', PROXY_CW.three_pct, offBound);
  const shootingScore = (ftRes.eff + tpRes.eff) / 2;
  const shootingConf  = ((ftRes.raw !== null ? 1 : 0) + (tpRes.raw !== null ? 1 : 0)) / 2 * 100;
  const shooting: ScoredCluster = { score: shootingScore, rawScore: shootingScore, confidence: shootingConf };

  // ── Finishing cluster ──
  const fdRes  = effectiveScore(inputs.foul_draw_rate, 'foul_draw_rate', PROXY_CW.foul_draw_rate, offBound);
  const finishing: ScoredCluster = { score: fdRes.eff, rawScore: fdRes.raw, confidence: fdRes.raw !== null ? 75 : 0 };

  // ── Playmaking cluster ──
  const astRes = effectiveScore(inputs.ast_adj_pg, 'ast_pg',  PROXY_CW.ast_adj_pg, offBound);
  const tovRes = effectiveScore(inputs.tov_pg,     'tov_pg',  PROXY_CW.tov_pg,     offBound, true);
  const playmakingScore = (astRes.eff + tovRes.eff) / 2;
  const playmakingConf  = ((astRes.raw !== null ? 1 : 0) + (tovRes.raw !== null ? 1 : 0)) / 2 * 100;
  const playmaking: ScoredCluster = { score: playmakingScore, rawScore: playmakingScore, confidence: playmakingConf };

  // ── On-ball defense cluster ──
  const stlRes = effectiveScore(inputs.stl_per_100,          'stl_per_100',         PROXY_CW.stl_per_100,         defBound);
  const pfRes  = effectiveScore(inputs.perim_fouls_per_100,  'pf_per_100',          PROXY_CW.perim_fouls_per_100, defBound, true);
  const obdScore = (stlRes.eff + pfRes.eff) / 2;
  const obdConf  = ((stlRes.raw !== null ? 1 : 0) + (pfRes.raw !== null ? 1 : 0)) / 2 * 100;
  const on_ball_defense: ScoredCluster = { score: obdScore, rawScore: obdScore, confidence: obdConf };

  // ── Team defense cluster ──
  const blkCW  = getBlkCW(position);
  const blkRes = effectiveScore(inputs.blk_per_100, 'blk_per_100', blkCW, defBound);
  const team_defense: ScoredCluster = { score: blkRes.eff, rawScore: blkRes.raw, confidence: blkRes.raw !== null ? blkCW * 100 : 0 };

  // ── Rebounding cluster ──
  const drbRes = effectiveScore(inputs.dreb_pg, 'dreb_pg', PROXY_CW.dreb_pg, rebBound);
  const orbRes = effectiveScore(inputs.oreb_pg, 'oreb_pg', PROXY_CW.oreb_pg, rebBound);
  const rebScore = (drbRes.eff + orbRes.eff) / 2;
  const rebConf  = ((drbRes.raw !== null ? 1 : 0) + (orbRes.raw !== null ? 1 : 0)) / 2 * 100;
  const rebounding: ScoredCluster = { score: rebScore, rawScore: rebScore, confidence: rebConf };

  // ── Physical/Tools cluster ──
  // Score what we can (motor, endurance, vertical_pop), then bound Speed/Lateral
  const motorScore = inputs.motor_raw != null
    ? Math.min(90, Math.max(10, inputs.motor_raw * 25 + 40))  // rough 0-100 from activity rate
    : 50;
  const motorEff = PROXY_CW.motor_proxy * motorScore + (1 - PROXY_CW.motor_proxy) * 50;

  const enduranceScore = inputs.endurance_raw != null
    ? Math.min(90, Math.max(20, (inputs.endurance_raw / 40) * 80))  // 40 MPG → 80, scaled
    : 50;
  const enduranceEff = PROXY_CW.endurance_proxy * enduranceScore + (1 - PROXY_CW.endurance_proxy) * 50;

  // Vertical pop proxy using blk_per_100
  const vpCW  = (position === 'C' || position === 'PF') ? 0.55 : 0.35;
  const vpRes = effectiveScore(inputs.blk_per_100, 'blk_per_100', vpCW, 50);

  // Tools scored average (for Speed/Lateral bounds)
  const scoredToolsScores = [motorEff, enduranceEff, vpRes.eff];
  const scoredToolsAvg = scoredToolsScores.reduce((a, b) => a + b, 0) / scoredToolsScores.length;

  // Speed and Lateral: UNSCORED → bounded by scored tools avg + position cap
  const speedBound = computeToolsBound('speed',   scoredToolsAvg, position);
  const latBound   = computeToolsBound('lateral', scoredToolsAvg, position);

  const physicalScore = (motorEff + enduranceEff + vpRes.eff + speedBound + latBound) / 5;
  const physicalConf  = (inputs.motor_raw !== null ? 1 : 0) * 33 +
                        (inputs.endurance_raw !== null ? 1 : 0) * 33 +
                        (inputs.blk_per_100 !== null ? 1 : 0) * 34;
  const physical: ScoredCluster = { score: physicalScore, rawScore: physicalScore, confidence: physicalConf };

  return { shooting, finishing, playmaking, on_ball_defense, team_defense, rebounding, physical };
}

// ── OPF Aggregation: Clusters → Component KRs ──

function computeOPFKr(
  clusters: Record<ClusterKey, ScoredCluster>,
  position: string,
): { okr:number|null; dkr:number|null; tkr:number|null; iqkr:number|null; basePlayerKr:number|null } {
  const opf = OPF_COLLEGE[position] ?? OPF_COLLEGE['SF'];
  const [opf_off, opf_def, opf_tools, opf_iq] = opf;
  const posWeights = POSITION_CLUSTER_WEIGHTS[position] ?? POSITION_CLUSTER_WEIGHTS['SF'];

  function aggregateComponent(keys: ClusterKey[]): number | null {
    const scored: Array<[number, number]> = [];
    for (const ck of keys) {
      scored.push([clusters[ck].score, posWeights[ck]]);
    }
    const totalW = scored.reduce((s, [, w]) => s + w, 0);
    if (totalW === 0) return null;
    return scored.reduce((s, [v, w]) => s + v * (w / totalW), 0);
  }

  const okr = aggregateComponent(['shooting', 'finishing', 'playmaking']);
  const dkr = aggregateComponent(['on_ball_defense', 'team_defense']);
  const tkr = aggregateComponent(['rebounding', 'physical']);

  // IQKR: cross-component estimate (IQ is always UNSCORED at box_score tier)
  const scoredComponents: Array<[number, number]> = [];
  if (okr !== null) scoredComponents.push([okr, opf_off]);
  if (dkr !== null) scoredComponents.push([dkr, opf_def]);
  if (tkr !== null) scoredComponents.push([tkr, opf_tools]);
  const crossTotal = scoredComponents.reduce((s, [, w]) => s + w, 0);
  const iqkr = crossTotal > 0
    ? scoredComponents.reduce((s, [v, w]) => s + v * (w / crossTotal), 0)
    : null;

  const components: Array<[number | null, number]> = [
    [okr, opf_off], [dkr, opf_def], [tkr, opf_tools], [iqkr, opf_iq],
  ];
  const available = components.filter(([v]) => v !== null) as Array<[number, number]>;
  if (!available.length) return { okr, dkr, tkr, iqkr, basePlayerKr: null };

  const totalOpfW = available.reduce((s, [, w]) => s + w, 0);
  const basePlayerKr = available.reduce((s, [v, w]) => s + v * (w / totalOpfW), 0);

  return { okr, dkr, tkr, iqkr, basePlayerKr };
}

// ── Phase 3: Legend Anchor Mapping ──
// Pattern-match production profile vs level legend tier descriptions.
// NOT a Bayesian formula — maps to the tier band whose production pattern this player fits.

function computePhase3LegendAnchor(
  stats: PlayerSeasonStats,
  levelKey: string,
): { low: number; high: number; mid: number } {
  const norms = LEVEL_NORMS[levelKey] ?? LEVEL_NORMS['ncaa_d1_high_major'];

  // Estimate TS%
  const ts = estimateTs(stats);

  // Component normals — each relative to level starter average
  const scoringNorm    = stats.pts_pg / norms.spp;
  const effNorm        = Math.pow(ts / norms.tsb, 2);   // squared: steeper penalty for poor efficiency
  const rebNorm        = stats.reb_pg / norms.srp;
  const astNorm        = Math.min(2.5, stats.ast_pg / norms.sap);
  const defNorm        = Math.min(2.5, (stats.stl_pg + stats.blk_pg) / norms.sdp);
  const minsNorm       = Math.min(1.2, (stats.min_pg ?? 28) / 28);

  // Weighted production score
  const productionScore =
    scoringNorm * 0.40 +
    effNorm     * 0.15 +
    rebNorm     * 0.15 +
    astNorm     * 0.15 +
    defNorm     * 0.10 +
    minsNorm    * 0.05;

  // Map to tier (descending minScore order — first match wins)
  for (const [low, high, minScore] of norms.tiers) {
    if (productionScore >= minScore) {
      const mid = Math.round((low + high) / 2);
      return { low, high, mid };
    }
  }

  // Below all tiers — return bottom tier
  const [low, high] = norms.tiers[norms.tiers.length - 1];
  return { low: low - 5, high: low - 1, mid: low - 3 };
}

// ── Confidence Gate ──

function computeConfidence(
  stats: PlayerSeasonStats,
  levelKey: string,
  scoredTraits: number,
  totalTraits: number,
): { confidence_pct: number; flags: string[] } {
  const flags: string[] = [];

  const gamesConf   = computeKlvnConfidence(stats.games_played, levelKey);
  const minutesConf = Math.min(1.0, (stats.min_pg ?? 0) / 30.0);
  const traitConf   = totalTraits > 0 ? scoredTraits / totalTraits : 0.5;

  if (stats.games_played < 5)   flags.push('low_sample_games');
  if ((stats.min_pg ?? 0) < 10) flags.push('low_minutes');
  if (traitConf < 0.4)          flags.push('low_trait_coverage');
  if (stats.bpm == null && stats.off_bpm == null) flags.push('missing_advanced_metrics');

  const rawConf = gamesConf * 0.50 + minutesConf * 0.25 + traitConf * 0.25;
  return {
    confidence_pct: Math.round(Math.min(100, Math.max(0, rawConf * 100))),
    flags,
  };
}

// ── Public API ──

/**
 * Evaluate a player from box-score stats using the V1 Protocol.
 * Steps:
 *   1. Trait inputs from stats
 *   2. Score traits → clusters (Composite Bounding v0.3 + Proxy Confidence v0.2)
 *   3. Aggregate clusters → OKR/DKR/TKR/IQKR via OPF → Phase 6 raw
 *   4. Phase 3 production anchor (legend tier pattern-match)
 *   5. Clip Phase 6 to Phase 3 midpoint ± 10 → final KR
 *   6. Confidence gate
 *
 * NOTE: Lambda is NOT applied here. It is already embedded in skill_kr via
 *       Z_cross = Z_g × λ inside computeSkillKR(). Applying it again is wrong.
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

  // Step 2: Score clusters (v0.3 bounding + v0.2 proxy confidence)
  const clusterResults = scoreClusters(inputs, levelKey, stats.games_played, stats, pos);

  // Build cluster maps for return value
  const clusters:    Record<ClusterKey, number | null> = {} as any;
  const clusterConf: Record<ClusterKey, number>        = {} as any;
  let scoredTraits = 0;
  const totalTraits = 10; // proxy traits attempted at box_score tier

  for (const ck of Object.keys(clusterResults) as ClusterKey[]) {
    clusters[ck]    = clusterResults[ck].score;
    clusterConf[ck] = clusterResults[ck].confidence;
    if (clusterResults[ck].rawScore !== null) scoredTraits++;
  }

  // Step 3: OPF aggregation → Phase 6 raw
  // FIX #4: Do NOT multiply by lambda. Lambda is already applied in computeSkillKR.
  const { okr, dkr, tkr, iqkr, basePlayerKr } = computeOPFKr(clusterResults, pos);
  const phase6Raw = basePlayerKr !== null
    ? Math.round(Math.max(0, Math.min(100, basePlayerKr)) * 10) / 10
    : null;

  // Step 4: Phase 3 legend anchor (FIX #3: pattern-match, not Bayesian formula)
  const phase3 = computePhase3LegendAnchor(stats, levelKey);

  // Step 5: Window check and clip (Phase 6 within Phase 3 midpoint ± 10)
  const windowLow  = phase3.mid - 10;
  const windowHigh = phase3.mid + 10;

  let finalKR: number;
  let windowValid = true;

  if (phase6Raw === null) {
    finalKR     = phase3.mid;
    windowValid = false;
  } else if (phase6Raw < windowLow) {
    finalKR     = windowLow;
    windowValid = false;
  } else if (phase6Raw > windowHigh) {
    finalKR     = windowHigh;
    windowValid = false;
  } else {
    finalKR     = phase6Raw;
    windowValid = true;
  }

  finalKR = Math.round(finalKR);

  // Step 6: Confidence gate
  const { confidence_pct, flags } = computeConfidence(stats, levelKey, scoredTraits, totalTraits);

  // Derive strengths / gaps from cluster scores
  const strengths = (Object.keys(clusters) as ClusterKey[])
    .filter(ck => (clusters[ck] ?? 0) >= 70)
    .map(ck => ck.replace(/_/g, ' '));

  const gaps = (Object.keys(clusters) as ClusterKey[])
    .filter(ck => (clusters[ck] ?? 0) < 40)
    .map(ck => ck.replace(/_/g, ' '));

  return {
    finalKr:        finalKR,
    krRange:        [phase3.low, phase3.high],
    confidence_pct,
    phase3Anchor:   phase3,
    phase6Raw:      phase6Raw ?? null,
    windowValid,
    okr:            okr  !== null ? Math.round(okr  * 10) / 10 : null,
    dkr:            dkr  !== null ? Math.round(dkr  * 10) / 10 : null,
    tkr:            tkr  !== null ? Math.round(tkr  * 10) / 10 : null,
    iqkr:           iqkr !== null ? Math.round(iqkr * 10) / 10 : null,
    basePlayerKr:   basePlayerKr !== null ? Math.round(basePlayerKr * 10) / 10 : null,
    clusters,
    clusterConfidence: clusterConf,
    strengths,
    gaps,
    confidenceFlags: flags,
    levelKey,
    position: pos,
    lambda:   lam,
    dataTier: 'box_score',
    scoredTraits,
    totalTraits,
  };
}
