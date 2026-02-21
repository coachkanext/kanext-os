from __future__ import annotations
"""
KLVN — KaNeXT Level Normalization
Level-specific parameters for normalizing stats across competitive levels.
Reference: spec/canonical/_text/01_Player Evaluation Engine/KLVN (Level Normalization).txt
"""

# ── Level Translation Multipliers (λ[S,L]) ──
# These adjust raw production to account for the quality of competition.
# NCAA D1 High Major = 1.00 (reference). Lower levels get discounted.
# Applied to per-100-possession production stats.
LEVEL_LAMBDA: dict[str, float] = {
    "hs_prep_postgrad":   0.60,
    "njcaa_d3":           0.68,
    "njcaa_d2":           0.75,
    "njcaa_d1":           0.82,
    "cccaa":              0.78,
    "naia":               0.85,
    "uscaa":              0.70,
    "nccaa_d2":           0.72,
    "nccaa_d1":           0.76,
    "ncaa_d3":            0.80,
    "ncaa_d2":            0.88,
    "ncaa_d1":            0.95,
    "ncaa_d1_low_major":  0.93,
    "ncaa_d1_mid_major":  0.97,
    "ncaa_d1_high_major": 1.00,
    "professional":       1.05,
}

# ── Possession Priors (Poss_prior[L]) ──
# Fallback when team possessions aren't available.
POSSESSION_PRIOR: dict[str, float] = {
    "hs_prep_postgrad":   60.0,
    "njcaa_d3":           67.0,
    "njcaa_d2":           69.0,
    "njcaa_d1":           71.0,
    "cccaa":              69.0,
    "naia":               70.0,
    "uscaa":              65.0,
    "nccaa_d2":           66.0,
    "nccaa_d1":           68.0,
    "ncaa_d3":            67.0,
    "ncaa_d2":            69.0,
    "ncaa_d1":            71.0,
    "ncaa_d1_low_major":  70.0,
    "ncaa_d1_mid_major":  71.0,
    "ncaa_d1_high_major": 72.0,
    "professional":       100.0,
}

# ── Confidence Game Targets (G_target[L]) ──
GAMES_TARGET: dict[str, int] = {
    "hs_prep_postgrad":   10,
    "njcaa_d3":           18,
    "njcaa_d2":           18,
    "njcaa_d1":           20,
    "cccaa":              18,
    "naia":               20,
    "uscaa":              15,
    "nccaa_d2":           15,
    "nccaa_d1":           18,
    "ncaa_d3":            20,
    "ncaa_d2":            20,
    "ncaa_d1":            20,
    "ncaa_d1_low_major":  20,
    "ncaa_d1_mid_major":  20,
    "ncaa_d1_high_major": 20,
    "professional":       15,
}

# ── Level Noise Factor (η[L]) ──
# Higher = noisier environment, more uncertainty
LEVEL_NOISE: dict[str, float] = {
    "hs_prep_postgrad":   1.40,
    "njcaa_d3":           1.30,
    "njcaa_d2":           1.20,
    "njcaa_d1":           1.10,
    "cccaa":              1.20,
    "naia":               1.05,
    "uscaa":              1.30,
    "nccaa_d2":           1.25,
    "nccaa_d1":           1.20,
    "ncaa_d3":            1.10,
    "ncaa_d2":            1.05,
    "ncaa_d1":            0.97,
    "ncaa_d1_low_major":  1.00,
    "ncaa_d1_mid_major":  0.95,
    "ncaa_d1_high_major": 0.90,
    "professional":       0.85,
}

# ── Shrinkage Strength (α) ──
# Higher = more pull toward baseline for small samples
SHRINKAGE_ALPHA: dict[str, float] = {
    "hs_prep_postgrad":   25.0,
    "njcaa_d3":           20.0,
    "njcaa_d2":           18.0,
    "njcaa_d1":           15.0,
    "cccaa":              18.0,
    "naia":               12.0,
    "uscaa":              22.0,
    "nccaa_d2":           20.0,
    "nccaa_d1":           18.0,
    "ncaa_d3":            15.0,
    "ncaa_d2":            12.0,
    "ncaa_d1":            9.0,
    "ncaa_d1_low_major":  10.0,
    "ncaa_d1_mid_major":  8.0,
    "ncaa_d1_high_major": 6.0,
    "professional":       5.0,
}

# ── Baseline Efficiencies (μ) ──
# League-average shooting percentages by level for shrinkage targets
BASELINE_3P_PCT: dict[str, float] = {
    "njcaa_d3": 0.310, "njcaa_d2": 0.320, "njcaa_d1": 0.330,
    "cccaa": 0.315, "naia": 0.340, "uscaa": 0.300,
    "nccaa_d2": 0.305, "nccaa_d1": 0.320,
    "ncaa_d3": 0.335, "ncaa_d2": 0.345, "ncaa_d1": 0.345,
    "ncaa_d1_low_major": 0.340, "ncaa_d1_mid_major": 0.345, "ncaa_d1_high_major": 0.350,
}

BASELINE_FG_PCT: dict[str, float] = {
    "njcaa_d3": 0.420, "njcaa_d2": 0.430, "njcaa_d1": 0.440,
    "cccaa": 0.425, "naia": 0.445, "uscaa": 0.410,
    "nccaa_d2": 0.415, "nccaa_d1": 0.425,
    "ncaa_d3": 0.440, "ncaa_d2": 0.450, "ncaa_d1": 0.450,
    "ncaa_d1_low_major": 0.445, "ncaa_d1_mid_major": 0.450, "ncaa_d1_high_major": 0.455,
}

BASELINE_FT_PCT: dict[str, float] = {
    "njcaa_d3": 0.650, "njcaa_d2": 0.660, "njcaa_d1": 0.680,
    "cccaa": 0.660, "naia": 0.690, "uscaa": 0.640,
    "nccaa_d2": 0.650, "nccaa_d1": 0.660,
    "ncaa_d3": 0.690, "ncaa_d2": 0.700, "ncaa_d1": 0.705,
    "ncaa_d1_low_major": 0.700, "ncaa_d1_mid_major": 0.710, "ncaa_d1_high_major": 0.720,
}


def get_lambda(level_key: str) -> float:
    """Get level translation multiplier. Defaults to 0.80 for unknown levels."""
    return LEVEL_LAMBDA.get(level_key, 0.80)


def get_poss_prior(level_key: str) -> float:
    return POSSESSION_PRIOR.get(level_key, 70.0)


def shrink(observed: float, n_events: int, level_key: str, baseline: float | None = None) -> float:
    """Apply Bayesian shrinkage: p_adj = (N*p + α*μ) / (N + α)"""
    alpha = SHRINKAGE_ALPHA.get(level_key, 15.0)
    mu = baseline if baseline is not None else 0.50
    if n_events <= 0:
        return mu
    return (n_events * observed + alpha * mu) / (n_events + alpha)


def compute_confidence(games: int, level_key: str) -> float:
    """klvn confidence: min(1, G / G_target)"""
    g_target = GAMES_TARGET.get(level_key, 20)
    return min(1.0, games / g_target) if g_target > 0 else 1.0


def normalize_production(per_game: float, team_poss_pg: float | None, level_key: str) -> float:
    """Normalize per-game production to per-100-possessions, then apply level λ."""
    poss = team_poss_pg if team_poss_pg and team_poss_pg > 0 else get_poss_prior(level_key)
    per_100 = per_game * (100.0 / poss)
    return per_100 * get_lambda(level_key)


# ═══════════════════════════════════════════════════════════════════════════
# KLVN SkillKR — Exact 4-step normalization pipeline
# ═══════════════════════════════════════════════════════════════════════════

import json
import math
import os

SKILLKR_K = 1.2    # sigmoid steepness
SKILLKR_Z0 = 0.0   # sigmoid center

_PARAMS = None


def _load_params() -> dict:
    """Load calibration params from klvn_params.json (lazy, cached)."""
    global _PARAMS
    if _PARAMS is None:
        path = os.path.join(os.path.dirname(__file__), "klvn_params.json")
        with open(path) as f:
            _PARAMS = json.load(f)
    return _PARAMS


def compute_skillkr(
    p: float,
    N: int,
    level_key: str,
    trait_key: str,
    lower_is_better: bool = False,
) -> dict:
    """Exact KLVN SkillKR for one trait — dual-output pipeline.

    Computes BOTH:
      - skill_kr (cross-level): global μ/σ0 + λ scaling. THE KR for all
        rankings, comparisons, and display.
      - skill_kr_league (league-internal): per-level μ/σ0, NO λ. Hidden
        intermediate for audit/diagnostics only.

    4-step pipeline (run twice with different params):
      1. Bayesian shrinkage: p_adj = (N*p + α*μ) / (N + α)
      2. Expected efficiency: E(v) = μ  (MVP constant)
      3. Variance normalization: Z = (p_adj - μ) * √N / σ0
      4. Sigmoid mapping → 0-100

    Returns diagnostic dict with all intermediate values for both paths.
    """
    params = _load_params()["params"]
    trait_params = params.get(trait_key, {})
    alpha = SHRINKAGE_ALPHA.get(level_key, 15.0)

    # ── Cross-level path (THE KR) — global μ/σ0 + λ ──
    global_params = trait_params.get("_global", {})
    mu_g = global_params.get("mu", 0.50)
    sigma0_g = global_params.get("sigma0", 0.10)

    if N > 0:
        p_adj_g = (N * p + alpha * mu_g) / (N + alpha)
    else:
        p_adj_g = mu_g

    delta_g = p_adj_g - mu_g
    if lower_is_better:
        delta_g = -delta_g
    sigma_g = sigma0_g / math.sqrt(N) if N > 0 else sigma0_g
    Z_g = delta_g / sigma_g if sigma_g > 0 else 0.0

    lam = get_lambda(level_key)
    Z_cross = Z_g * lam

    kr_raw_cross = 100.0 / (1.0 + math.exp(-SKILLKR_K * (Z_cross - SKILLKR_Z0)))
    skill_kr = max(0.0, min(100.0, round(kr_raw_cross, 1)))

    # ── League-internal path (hidden) — per-level μ/σ0, NO λ ──
    level_params = trait_params.get(level_key, global_params)
    mu_l = level_params.get("mu", mu_g)
    sigma0_l = level_params.get("sigma0", sigma0_g)

    if N > 0:
        p_adj_l = (N * p + alpha * mu_l) / (N + alpha)
    else:
        p_adj_l = mu_l

    delta_l = p_adj_l - mu_l
    if lower_is_better:
        delta_l = -delta_l
    sigma_l = sigma0_l / math.sqrt(N) if N > 0 else sigma0_l
    Z_league = delta_l / sigma_l if sigma_l > 0 else 0.0

    kr_raw_league = 100.0 / (1.0 + math.exp(-SKILLKR_K * (Z_league - SKILLKR_Z0)))
    skill_kr_league = max(0.0, min(100.0, round(kr_raw_league, 1)))

    return {
        "skill_kr": skill_kr,
        "skill_kr_league": skill_kr_league,
        "p": round(p, 4),
        "N": N,
        "mu": mu_g,
        "sigma0": sigma0_g,
        "alpha": alpha,
        "E_v": mu_g,
        "sigma_v": round(sigma_g, 6),
        "p_adj": round(p_adj_g, 4),
        "p_hat": mu_g,
        "delta": round(delta_g, 4),
        "z_raw": round(Z_g, 4),
        "Z": round(Z_cross, 3),
        "Z_league": round(Z_league, 3),
        "Z_cross": round(Z_cross, 3),
        "league_mu": round(mu_l, 6),
        "league_sigma0": round(sigma0_l, 6),
        "sigma_floor": None,
        "pre_floor_sigma": None,
    }


# ═══════════════════════════════════════════════════════════════════════════
# KLVN — KaNeXT Level Normalization (MUST be the LAST transformation)
# ═══════════════════════════════════════════════════════════════════════════

def klvn_translate(
    league_score: float,
    level_key: str,
    confidence_pct: float = 100.0,
    coverage_pct: float = 1.0,
    schedule_strength: float | None = None,
) -> float:
    """KLVN translation — translate league-internal KR to cross-level.

    This is the LAST transformation before storing/displaying KR.
    Badges must NEVER be added after this function.

    Translation: kr = 50 + (league_score - 50) * λ[level]
    Center-preserving: a league-average player (50) stays at 50 cross-level.
    Above-average performance is discounted by λ for weaker levels.

    Placeholder hooks for future:
      - confidence_pct: penalize low-game-count players
      - coverage_pct: penalize sparse minutes data
      - schedule_strength: adjust for opponent quality
    """
    lam = get_lambda(level_key)
    kr = 50.0 + (league_score - 50.0) * lam
    # Future: confidence penalty
    # Future: coverage penalty
    # Future: schedule strength adjustment
    return round(max(0.0, min(100.0, kr)), 1)
