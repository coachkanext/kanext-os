/**
 * KLVN — KaNeXT Level Normalization (TypeScript)
 * Port of services/player-pool/engine/klvn.py
 *
 * Pure functions. Same inputs → same outputs. No Math.random(), no GPT.
 * Universal Rule: KLVN normalizes INPUTS, not OUTPUTS.
 *                 λ adjusts production stats during trait scoring.
 *                 It does NOT convert KR between levels.
 */

// ── Level Translation Multipliers (λ[S,L]) ──
// NCAA D1 High Major = 1.000 (reference). Lower levels get discounted.
// 'ncaa_d1' is NOT a valid key — must be remapped to HM/MM/LM first.
export const LEVEL_LAMBDA: Record<string, number> = {
  ncaa_d1_high_major: 1.000,
  ncaa_d1_mid_major:  0.958,
  ncaa_d1_low_major:  0.917,
  ncaa_d2:            0.875,
  njcaa_d1:           0.833,
  naia:               0.810,
  cccaa:              0.765,
  njcaa_d2:           0.750,
  ncaa_d3:            0.667,
  njcaa_d3:           0.625,
  uscaa:              0.583,
  nccaa_d1:           0.542,
  nccaa_d2:           0.500,
  hs_prep_postgrad:   0.450,
};

// ── Possession Priors (Poss_prior[L]) ──
// Fallback when team possessions aren't available.
export const POSSESSION_PRIOR: Record<string, number> = {
  ncaa_d1_high_major: 72.0,
  ncaa_d1_mid_major:  71.0,
  ncaa_d1_low_major:  70.0,
  ncaa_d2:            69.0,
  njcaa_d1:           71.0,
  naia:               70.0,
  njcaa_d2:           69.0,
  cccaa:              69.0,
  ncaa_d3:            67.0,
  njcaa_d3:           67.0,
  uscaa:              65.0,
  nccaa_d1:           68.0,
  nccaa_d2:           66.0,
  hs_prep_postgrad:   60.0,
  professional:      100.0,
};

// ── Confidence Game Targets (G_target[L]) ──
export const GAMES_TARGET: Record<string, number> = {
  ncaa_d1_high_major: 20,
  ncaa_d1_mid_major:  20,
  ncaa_d1_low_major:  20,
  ncaa_d2:            20,
  njcaa_d1:           20,
  naia:               20,
  njcaa_d2:           18,
  cccaa:              18,
  ncaa_d3:            20,
  njcaa_d3:           18,
  uscaa:              15,
  nccaa_d1:           18,
  nccaa_d2:           15,
  hs_prep_postgrad:   10,
  professional:       15,
};

// ── Level Noise Factor (η[L]) ──
// Higher = noisier environment, more uncertainty.
export const LEVEL_NOISE: Record<string, number> = {
  ncaa_d1_high_major: 0.90,
  ncaa_d1_mid_major:  0.95,
  ncaa_d1_low_major:  1.00,
  ncaa_d2:            1.05,
  njcaa_d1:           1.10,
  naia:               1.05,
  njcaa_d2:           1.20,
  cccaa:              1.20,
  ncaa_d3:            1.10,
  njcaa_d3:           1.30,
  uscaa:              1.30,
  nccaa_d1:           1.20,
  nccaa_d2:           1.25,
  hs_prep_postgrad:   1.40,
  professional:       0.85,
};

// ── Shrinkage Strength (α) ──
// Higher = more pull toward baseline for small samples.
export const SHRINKAGE_ALPHA: Record<string, number> = {
  ncaa_d1_high_major:  6.0,
  ncaa_d1_mid_major:   8.0,
  ncaa_d1_low_major:  10.0,
  ncaa_d2:            12.0,
  njcaa_d1:           15.0,
  naia:               12.0,
  njcaa_d2:           18.0,
  cccaa:              18.0,
  ncaa_d3:            15.0,
  njcaa_d3:           20.0,
  uscaa:              22.0,
  nccaa_d1:           18.0,
  nccaa_d2:           20.0,
  hs_prep_postgrad:   25.0,
  professional:        5.0,
};

// ── Baseline Efficiencies ──
export const BASELINE_3P_PCT: Record<string, number> = {
  ncaa_d1_high_major: 0.350, ncaa_d1_mid_major: 0.345, ncaa_d1_low_major: 0.340,
  ncaa_d2: 0.345, njcaa_d1: 0.330, naia: 0.340,
  njcaa_d2: 0.320, cccaa: 0.315, ncaa_d3: 0.335,
  njcaa_d3: 0.310, uscaa: 0.300, nccaa_d1: 0.320, nccaa_d2: 0.305,
};

export const BASELINE_FG_PCT: Record<string, number> = {
  ncaa_d1_high_major: 0.455, ncaa_d1_mid_major: 0.450, ncaa_d1_low_major: 0.445,
  ncaa_d2: 0.450, njcaa_d1: 0.440, naia: 0.445,
  njcaa_d2: 0.430, cccaa: 0.425, ncaa_d3: 0.440,
  njcaa_d3: 0.420, uscaa: 0.410, nccaa_d1: 0.425, nccaa_d2: 0.415,
};

export const BASELINE_FT_PCT: Record<string, number> = {
  ncaa_d1_high_major: 0.720, ncaa_d1_mid_major: 0.710, ncaa_d1_low_major: 0.700,
  ncaa_d2: 0.700, njcaa_d1: 0.680, naia: 0.690,
  njcaa_d2: 0.660, cccaa: 0.660, ncaa_d3: 0.690,
  njcaa_d3: 0.650, uscaa: 0.640, nccaa_d1: 0.660, nccaa_d2: 0.650,
};

// ── KLVN SkillKR Params (calibrated from klvn_params.json v1.0) ──
// Structure: { [trait_key]: { _global: { mu, sigma0 }, [level_key]: { mu, sigma0 } } }
export const KLVN_PARAMS: Record<string, Record<string, { mu: number; sigma0: number }>> = {
  three_pct: {
    _global:             { mu: 0.291057, sigma0: 0.156963 },
    ncaa_d1_high_major:  { mu: 0.31599,  sigma0: 0.146304 },
    ncaa_d1_mid_major:   { mu: 0.314139, sigma0: 0.15171  },
    ncaa_d1_low_major:   { mu: 0.295042, sigma0: 0.15446  },
    ncaa_d2:             { mu: 0.280000, sigma0: 0.152000 },
    njcaa_d1:            { mu: 0.292842, sigma0: 0.135618 },
    naia:                { mu: 0.30009,  sigma0: 0.154636 },
    njcaa_d2:            { mu: 0.288655, sigma0: 0.165154 },
    cccaa:               { mu: 0.28493,  sigma0: 0.134479 },
    ncaa_d3:             { mu: 0.270000, sigma0: 0.150000 },
    njcaa_d3:            { mu: 0.264387, sigma0: 0.148414 },
    uscaa:               { mu: 0.271018, sigma0: 0.175825 },
    nccaa_d1:            { mu: 0.235255, sigma0: 0.212974 },
    nccaa_d2:            { mu: 0.230583, sigma0: 0.220895 },
  },
  ft_pct: {
    _global:             { mu: 0.671651, sigma0: 0.194295 },
    ncaa_d1_high_major:  { mu: 0.703264, sigma0: 0.176767 },
    ncaa_d1_mid_major:   { mu: 0.692455, sigma0: 0.19142  },
    ncaa_d1_low_major:   { mu: 0.688588, sigma0: 0.195462 },
    ncaa_d2:             { mu: 0.680000, sigma0: 0.190000 },
    njcaa_d1:            { mu: 0.66151,  sigma0: 0.159225 },
    naia:                { mu: 0.669212, sigma0: 0.189692 },
    njcaa_d2:            { mu: 0.658446, sigma0: 0.181267 },
    cccaa:               { mu: 0.662411, sigma0: 0.152687 },
    ncaa_d3:             { mu: 0.670000, sigma0: 0.185000 },
    njcaa_d3:            { mu: 0.645135, sigma0: 0.165487 },
    uscaa:               { mu: 0.636948, sigma0: 0.211869 },
    nccaa_d1:            { mu: 0.644527, sigma0: 0.345501 },
    nccaa_d2:            { mu: 0.668969, sigma0: 0.328113 },
  },
  ast_pg: {
    _global:             { mu: 1.356299, sigma0: 1.196794 },
    ncaa_d1_high_major:  { mu: 1.562361, sigma0: 1.379807 },
    ncaa_d1_mid_major:   { mu: 1.408901, sigma0: 1.192687 },
    ncaa_d1_low_major:   { mu: 1.299283, sigma0: 1.209483 },
    ncaa_d2:             { mu: 1.320000, sigma0: 1.180000 },
    njcaa_d1:            { mu: 1.370891, sigma0: 1.173759 },
    naia:                { mu: 1.291064, sigma0: 1.117991 },
    njcaa_d2:            { mu: 1.422662, sigma0: 1.244687 },
    cccaa:               { mu: 1.410721, sigma0: 1.156183 },
    ncaa_d3:             { mu: 1.340000, sigma0: 1.160000 },
    njcaa_d3:            { mu: 1.41105,  sigma0: 1.145247 },
    uscaa:               { mu: 1.323609, sigma0: 1.200217 },
    nccaa_d1:            { mu: 1.208249, sigma0: 1.156689 },
    nccaa_d2:            { mu: 1.286364, sigma0: 1.15841  },
  },
  tov_pg: {
    _global:             { mu: 1.214925, sigma0: 0.787099 },
    ncaa_d1_high_major:  { mu: 1.034865, sigma0: 0.666118 },
    ncaa_d1_mid_major:   { mu: 1.099121, sigma0: 0.671753 },
    ncaa_d1_low_major:   { mu: 1.132475, sigma0: 0.759087 },
    ncaa_d2:             { mu: 1.150000, sigma0: 0.760000 },
    njcaa_d1:            { mu: 1.277502, sigma0: 0.750518 },
    naia:                { mu: 1.174552, sigma0: 0.76328  },
    njcaa_d2:            { mu: 1.301033, sigma0: 0.80257  },
    cccaa:               { mu: 1.319459, sigma0: 0.773654 },
    ncaa_d3:             { mu: 1.250000, sigma0: 0.800000 },
    njcaa_d3:            { mu: 1.442762, sigma0: 0.867023 },
    uscaa:               { mu: 1.389545, sigma0: 0.946918 },
    nccaa_d1:            { mu: 1.14899,  sigma0: 0.880297 },
    nccaa_d2:            { mu: 1.4329,   sigma0: 1.001341 },
  },
  stl_per_100: {
    _global:             { mu: 1.024254, sigma0: 0.793367 },
    ncaa_d1_high_major:  { mu: 0.97736,  sigma0: 0.708287 },
    ncaa_d1_mid_major:   { mu: 0.958399, sigma0: 0.709526 },
    ncaa_d1_low_major:   { mu: 0.939041, sigma0: 0.70977  },
    ncaa_d2:             { mu: 0.980000, sigma0: 0.730000 },
    njcaa_d1:            { mu: 1.103043, sigma0: 0.781045 },
    naia:                { mu: 0.990635, sigma0: 0.763554 },
    njcaa_d2:            { mu: 1.100647, sigma0: 0.87281  },
    cccaa:               { mu: 1.072716, sigma0: 0.771093 },
    ncaa_d3:             { mu: 1.000000, sigma0: 0.770000 },
    njcaa_d3:            { mu: 1.202052, sigma0: 0.878575 },
    uscaa:               { mu: 1.166707, sigma0: 0.915888 },
    nccaa_d1:            { mu: 0.897547, sigma0: 0.98212  },
    nccaa_d2:            { mu: 1.067718, sigma0: 1.011839 },
  },
  blk_per_100: {
    _global:             { mu: 0.424607, sigma0: 0.598102 },
    ncaa_d1_high_major:  { mu: 0.555241, sigma0: 0.689786 },
    ncaa_d1_mid_major:   { mu: 0.486342, sigma0: 0.628386 },
    ncaa_d1_low_major:   { mu: 0.441279, sigma0: 0.559057 },
    ncaa_d2:             { mu: 0.430000, sigma0: 0.570000 },
    njcaa_d1:            { mu: 0.456448, sigma0: 0.615207 },
    naia:                { mu: 0.382852, sigma0: 0.527701 },
    njcaa_d2:            { mu: 0.427014, sigma0: 0.600997 },
    cccaa:               { mu: 0.387516, sigma0: 0.514317 },
    ncaa_d3:             { mu: 0.400000, sigma0: 0.560000 },
    njcaa_d3:            { mu: 0.498185, sigma0: 0.781626 },
    uscaa:               { mu: 0.367381, sigma0: 0.566687 },
    nccaa_d1:            { mu: 0.221501, sigma0: 0.596981 },
    nccaa_d2:            { mu: 0.222944, sigma0: 0.604625 },
  },
  dreb_pg: {
    _global:             { mu: 2.275085, sigma0: 1.437357 },
    ncaa_d1_high_major:  { mu: 2.414818, sigma0: 1.425763 },
    ncaa_d1_mid_major:   { mu: 2.273846, sigma0: 1.272515 },
    ncaa_d1_low_major:   { mu: 2.181386, sigma0: 1.346691 },
    ncaa_d2:             { mu: 2.220000, sigma0: 1.380000 },
    njcaa_d1:            { mu: 2.287282, sigma0: 1.369056 },
    naia:                { mu: 2.201453, sigma0: 1.449748 },
    njcaa_d2:            { mu: 2.376535, sigma0: 1.495561 },
    cccaa:               { mu: 2.261982, sigma0: 1.476817 },
    ncaa_d3:             { mu: 2.280000, sigma0: 1.440000 },
    njcaa_d3:            { mu: 2.554033, sigma0: 1.667906 },
    uscaa:               { mu: 2.297639, sigma0: 1.579173 },
    nccaa_d1:            { mu: 2.103367, sigma0: 1.412542 },
    nccaa_d2:            { mu: 2.411688, sigma0: 1.59813  },
  },
  oreb_pg: {
    _global:             { mu: 0.927857, sigma0: 0.779091 },
    ncaa_d1_high_major:  { mu: 0.98748,  sigma0: 0.82588  },
    ncaa_d1_mid_major:   { mu: 0.884615, sigma0: 0.730034 },
    ncaa_d1_low_major:   { mu: 0.860542, sigma0: 0.69954  },
    ncaa_d2:             { mu: 0.880000, sigma0: 0.720000 },
    njcaa_d1:            { mu: 1.013866, sigma0: 0.779171 },
    naia:                { mu: 0.847743, sigma0: 0.69367  },
    njcaa_d2:            { mu: 1.007688, sigma0: 0.829455 },
    cccaa:               { mu: 0.961261, sigma0: 0.810335 },
    ncaa_d3:             { mu: 0.940000, sigma0: 0.780000 },
    njcaa_d3:            { mu: 1.125083, sigma0: 0.983758 },
    uscaa:               { mu: 1.018887, sigma0: 0.876668 },
    nccaa_d1:            { mu: 0.768687, sigma0: 0.776526 },
    nccaa_d2:            { mu: 0.874242, sigma0: 0.879472 },
  },
  foul_draw_rate: {
    _global:             { mu: 0.352225, sigma0: 0.262002 },
    ncaa_d1_high_major:  { mu: 0.372482, sigma0: 0.286514 },
    ncaa_d1_mid_major:   { mu: 0.394429, sigma0: 0.289213 },
    ncaa_d1_low_major:   { mu: 0.370784, sigma0: 0.287323 },
    ncaa_d2:             { mu: 0.355000, sigma0: 0.265000 },
    njcaa_d1:            { mu: 0.367984, sigma0: 0.224818 },
    naia:                { mu: 0.337669, sigma0: 0.267556 },
    njcaa_d2:            { mu: 0.331157, sigma0: 0.262809 },
    cccaa:               { mu: 0.343638, sigma0: 0.198045 },
    ncaa_d3:             { mu: 0.345000, sigma0: 0.255000 },
    njcaa_d3:            { mu: 0.328079, sigma0: 0.188318 },
    uscaa:               { mu: 0.325911, sigma0: 0.263706 },
    nccaa_d1:            { mu: 0.340983, sigma0: 0.282707 },
    nccaa_d2:            { mu: 0.285575, sigma0: 0.231978 },
  },
  pf_per_100: {
    _global:             { mu: 2.321529, sigma0: 1.099752 },
    ncaa_d1_high_major:  { mu: 2.515508, sigma0: 1.01238  },
    ncaa_d1_mid_major:   { mu: 2.504867, sigma0: 1.014875 },
    ncaa_d1_low_major:   { mu: 2.530119, sigma0: 1.076134 },
    ncaa_d2:             { mu: 2.400000, sigma0: 1.060000 },
    njcaa_d1:            { mu: 2.143382, sigma0: 1.098075 },
    naia:                { mu: 2.306697, sigma0: 1.0748   },
    njcaa_d2:            { mu: 2.154823, sigma0: 1.115292 },
    cccaa:               { mu: 2.058559, sigma0: 1.068275 },
    ncaa_d3:             { mu: 2.250000, sigma0: 1.090000 },
    njcaa_d3:            { mu: 2.199526, sigma0: 1.128387 },
    uscaa:               { mu: 2.296555, sigma0: 1.247189 },
    nccaa_d1:            { mu: 2.308321, sigma0: 1.143145 },
    nccaa_d2:            { mu: 2.222635, sigma0: 1.112299 },
  },
};

// ── Constants ──
const SKILLKR_K  = 1.2;
const SKILLKR_Z0 = 0.0;
export const PLAYER_KLVN_DELTA_CAP = 6.0;

// ── Core Functions ──

/** Get level translation multiplier. Hard error on unknown levels. */
export function getLambda(levelKey: string): number {
  const lam = LEVEL_LAMBDA[levelKey];
  if (lam === undefined) {
    throw new Error(
      `KLVN HARD ERROR: level_key '${levelKey}' not in LEVEL_LAMBDA. ` +
      `Valid keys: ${Object.keys(LEVEL_LAMBDA).sort().join(', ')}. ` +
      `If ncaa_d1, remap to ncaa_d1_high_major/mid_major/low_major first.`
    );
  }
  return lam;
}

export function getPossPrior(levelKey: string): number {
  const val = POSSESSION_PRIOR[levelKey];
  if (val === undefined) throw new Error(`KLVN HARD ERROR: '${levelKey}' not in POSSESSION_PRIOR.`);
  return val;
}

/**
 * Bayesian shrinkage: p_adj = (N*p + α*μ) / (N + α)
 * Pulls toward baseline for small samples.
 */
export function shrink(
  observed: number,
  nEvents: number,
  levelKey: string,
  baseline?: number,
): number {
  const alpha = SHRINKAGE_ALPHA[levelKey];
  if (alpha === undefined) throw new Error(`KLVN HARD ERROR: '${levelKey}' not in SHRINKAGE_ALPHA.`);
  const mu = baseline !== undefined ? baseline : 0.50;
  if (nEvents <= 0) return mu;
  return (nEvents * observed + alpha * mu) / (nEvents + alpha);
}

/** KLVN confidence: min(1, G / G_target) */
export function computeKlvnConfidence(games: number, levelKey: string): number {
  const gTarget = GAMES_TARGET[levelKey];
  if (gTarget === undefined) throw new Error(`KLVN HARD ERROR: '${levelKey}' not in GAMES_TARGET.`);
  return gTarget > 0 ? Math.min(1.0, games / gTarget) : 1.0;
}

/**
 * Normalize per-game production to per-100-possessions, then apply level λ.
 */
export function normalizeProduction(
  perGame: number,
  teamPossPg: number | null | undefined,
  levelKey: string,
): number {
  const poss = (teamPossPg && teamPossPg > 0) ? teamPossPg : getPossPrior(levelKey);
  const per100 = perGame * (100.0 / poss);
  return per100 * getLambda(levelKey);
}

export interface SkillKRResult {
  skill_kr:        number;   // cross-level KR (THE KR for display/ranking)
  skill_kr_league: number;   // league-internal KR (audit only)
  p:               number;
  N:               number;
  mu:              number;
  sigma0:          number;
  alpha:           number;
  p_adj:           number;
  delta:           number;
  z_raw:           number;
  Z_cross:         number;
  Z_league:        number;
}

/**
 * KLVN SkillKR — dual-output pipeline for one trait.
 *
 * Cross-level path (skill_kr): global μ/σ0 + λ. THE KR for rankings.
 * League-internal path (skill_kr_league): per-level μ/σ0, no λ. Audit only.
 *
 * 4-step pipeline (run twice):
 *   1. Bayesian shrinkage
 *   2. Expected efficiency = μ
 *   3. Variance normalization: Z = (p_adj - μ) * √N / σ0
 *   4. Sigmoid → 0–100
 */
export function computeSkillKR(
  p: number,
  N: number,
  levelKey: string,
  traitKey: string,
  lowerIsBetter = false,
): SkillKRResult {
  const traitParams = KLVN_PARAMS[traitKey] ?? {};
  const alpha = SHRINKAGE_ALPHA[levelKey];
  if (alpha === undefined) throw new Error(`KLVN HARD ERROR: '${levelKey}' not in SHRINKAGE_ALPHA.`);

  // ── Cross-level path (global μ/σ0 + λ) ──
  const gp     = traitParams['_global'] ?? { mu: 0.50, sigma0: 0.10 };
  const mu_g   = gp.mu;
  const sig0_g = gp.sigma0;

  const p_adj_g = N > 0 ? (N * p + alpha * mu_g) / (N + alpha) : mu_g;
  let delta_g = p_adj_g - mu_g;
  if (lowerIsBetter) delta_g = -delta_g;
  const sigma_g = N > 0 ? sig0_g / Math.sqrt(N) : sig0_g;
  const Z_g     = sigma_g > 0 ? delta_g / sigma_g : 0.0;

  const lam     = getLambda(levelKey);
  const Z_cross = Z_g * lam;
  const kr_raw  = 100.0 / (1.0 + Math.exp(-SKILLKR_K * (Z_cross - SKILLKR_Z0)));
  const skill_kr = Math.max(0, Math.min(100, Math.round(kr_raw * 10) / 10));

  // ── League-internal path (per-level μ/σ0, no λ) ──
  const lp     = traitParams[levelKey] ?? gp;
  const mu_l   = lp.mu;
  const sig0_l = lp.sigma0;

  const p_adj_l = N > 0 ? (N * p + alpha * mu_l) / (N + alpha) : mu_l;
  let delta_l = p_adj_l - mu_l;
  if (lowerIsBetter) delta_l = -delta_l;
  const sigma_l   = N > 0 ? sig0_l / Math.sqrt(N) : sig0_l;
  const Z_league  = sigma_l > 0 ? delta_l / sigma_l : 0.0;
  const kr_l_raw  = 100.0 / (1.0 + Math.exp(-SKILLKR_K * (Z_league - SKILLKR_Z0)));
  const skill_kr_league = Math.max(0, Math.min(100, Math.round(kr_l_raw * 10) / 10));

  return {
    skill_kr,
    skill_kr_league,
    p:       Math.round(p * 10000) / 10000,
    N,
    mu:      mu_g,
    sigma0:  sig0_g,
    alpha,
    p_adj:   Math.round(p_adj_g * 10000) / 10000,
    delta:   Math.round(delta_g * 10000) / 10000,
    z_raw:   Math.round(Z_g * 1000) / 1000,
    Z_cross: Math.round(Z_cross * 1000) / 1000,
    Z_league: Math.round(Z_league * 1000) / 1000,
  };
}

/**
 * KLVN Translation — translate league-internal KR to cross-level.
 * Center-preserving: league-average player (50) stays at 50 cross-level.
 * Delta cap: KLVN shift clamped to ±PLAYER_KLVN_DELTA_CAP (±6.0).
 *
 * Rule: This is the LAST transformation before storing/displaying KR.
 *       Badges must NEVER be added after this function.
 */
export function klvnTranslate(
  leagueScore: number,
  levelKey: string,
  _confidencePct = 100.0,   // reserved for future penalty
  _coveragePct   = 1.0,     // reserved for future penalty
  _scheduleStrength?: number, // reserved
): number {
  const lam = getLambda(levelKey);
  let kr = 50.0 + (leagueScore - 50.0) * lam;

  // Clamp delta to ±6.0
  const delta = kr - leagueScore;
  if (Math.abs(delta) > PLAYER_KLVN_DELTA_CAP) {
    const clampedDelta = delta > 0 ? PLAYER_KLVN_DELTA_CAP : -PLAYER_KLVN_DELTA_CAP;
    kr = leagueScore + clampedDelta;
  }

  return Math.round(Math.max(0, Math.min(100, kr)) * 10) / 10;
}
