from __future__ import annotations
"""
Context Layer v1 — Post-KLVN bounded overlay.

Applies AFTER canonical KR (final_kr post-KLVN). Does NOT modify final_kr.
Produces context_kr = clamp(0, 100, final_kr + context_delta).

Hard bounds:
  - Total context_delta cap: ±3.0
  - If cap hit: context_cap_hit = True, unclamped value logged

Rules v1 (stats-only, minimal):
  A) Primary Engine Credit      (+0.5 to +1.5)
  B) Sample Volatility Penalty  (-0.5 to -1.5)
  C) Defensive Anchor Signal    (+0.5 to +1.5)  [F/B only]

Usage:
    from context_layer import compute_context
    result = compute_context(final_kr, stats, clusters, level_key, position)
    # result["context_kr"]    = final_kr + bounded delta
    # result["context_delta"] = bounded adjustment
"""

import json
import math
import os

# ── Hard cap ─────────────────────────────────────────────────────────────
MAX_CONTEXT_DELTA = 3.0

# ── Calibration params (loaded lazily) ───────────────────────────────────
_PARAMS = None


def _load_params() -> dict:
    global _PARAMS
    if _PARAMS is None:
        path = os.path.join(os.path.dirname(__file__), "klvn_params.json")
        with open(path) as f:
            _PARAMS = json.load(f)
    return _PARAMS


def _get_trait_percentile(trait_key: str, level_key: str, value: float) -> float:
    """Approximate percentile using calibration μ/σ0 (normal CDF approximation)."""
    params = _load_params()["params"]
    tp = params.get(trait_key, {})
    level_p = tp.get(level_key, tp.get("_global", {}))
    mu = level_p.get("mu", 0.5)
    sigma = level_p.get("sigma0", 0.1)
    if sigma <= 0:
        return 50.0
    z = (value - mu) / sigma
    # Fast normal CDF approximation
    cdf = 1.0 / (1.0 + math.exp(-1.7 * z))
    return cdf * 100.0


def _get_trait_mean(trait_key: str, level_key: str) -> float:
    """Get calibration mean for a trait at a given level."""
    params = _load_params()["params"]
    tp = params.get(trait_key, {})
    level_p = tp.get(level_key, tp.get("_global", {}))
    return level_p.get("mu", 0.0)


# ═══════════════════════════════════════════════════════════════════════════
# RULE A — Primary Engine Credit (+0.5 to +1.5)
# ═══════════════════════════════════════════════════════════════════════════

def _rule_primary_engine(stats: dict, level_key: str) -> tuple[float, bool, str]:
    """
    Trigger: usage_rate >= 30% AND ast_pg >= 4.5 AND tov_per_usage <= league avg.
    Scale: +0.5 (barely qualifies) to +1.5 (clearly elite).
    """
    usage = stats.get("usage_rate", 0.0)
    ast_pg = stats.get("ast_pg", 0.0)

    # Compute tov_per_usage from stats
    fga_pg = stats.get("fga_pg", 0.0)
    fta_pg = stats.get("fta_pg", 0.0)
    to_pg = stats.get("to_pg", 0.0)
    usage_events = fga_pg + 0.44 * fta_pg + to_pg
    tov_per_usage = to_pg / usage_events if usage_events > 0.5 else 1.0

    # League average for tov_per_usage
    league_avg_tov = _get_trait_mean("tov_per_usage", level_key)
    if league_avg_tov <= 0:
        league_avg_tov = 0.15  # fallback

    if usage < 30.0 or ast_pg < 4.5 or tov_per_usage > league_avg_tov:
        return 0.0, False, ""

    # Scale: how far above thresholds
    # usage: 30-40 maps to 0-1, ast: 4.5-7.0 maps to 0-1, tov: ratio below avg maps to 0-1
    usage_score = min(1.0, (usage - 30.0) / 10.0)
    ast_score = min(1.0, (ast_pg - 4.5) / 2.5)
    tov_ratio = max(0.0, (league_avg_tov - tov_per_usage) / league_avg_tov)
    tov_score = min(1.0, tov_ratio * 2.0)

    composite = (usage_score + ast_score + tov_score) / 3.0
    delta = 0.5 + composite * 1.0  # 0.5 to 1.5

    explain = (f"Primary engine: usage={usage:.1f}%, ast={ast_pg:.1f}/g, "
               f"tov_rate={tov_per_usage:.3f} (league avg={league_avg_tov:.3f})")
    return round(delta, 2), True, explain


# ═══════════════════════════════════════════════════════════════════════════
# RULE B — Sample Volatility Penalty (-0.5 to -1.5)
# ═══════════════════════════════════════════════════════════════════════════

def _rule_sample_volatility(stats: dict) -> tuple[float, bool, str]:
    """
    Trigger: GP < 15 OR MPG < 18 OR min_coverage < 70%.
    Scale by how weak the sample is.
    """
    gp = stats.get("games_played", 0)
    mpg = stats.get("minutes_pg", 0.0)
    min_cov = stats.get("minutes_coverage_pct", 1.0)

    penalties = []
    if gp < 15:
        # Scale: GP 3-15 → penalty 1.0-0.0
        p = 1.0 - max(0.0, (gp - 3) / 12.0)
        penalties.append(("gp", p))
    if mpg < 18.0:
        # Scale: MPG 5-18 → penalty 1.0-0.0
        p = 1.0 - max(0.0, (mpg - 5.0) / 13.0)
        penalties.append(("mpg", p))
    if min_cov < 0.70:
        # Scale: coverage 0-70% → penalty 1.0-0.0
        p = 1.0 - min_cov / 0.70
        penalties.append(("min_cov", p))

    if not penalties:
        return 0.0, False, ""

    # Take the worst penalty signal
    worst = max(p for _, p in penalties)
    delta = -(0.5 + worst * 1.0)  # -0.5 to -1.5

    parts = ", ".join(f"{name}={v:.2f}" for name, v in penalties)
    explain = f"Sample volatility: {parts} → penalty={delta:.2f}"
    return round(delta, 2), True, explain


# ═══════════════════════════════════════════════════════════════════════════
# RULE C — Defensive Anchor Signal (+0.5 to +1.5) [F/B only]
# ═══════════════════════════════════════════════════════════════════════════

def _rule_defensive_anchor(stats: dict, level_key: str, position: str) -> tuple[float, bool, str]:
    """
    Only for F or B: blk_per_100 >= level 75th percentile AND pf_per_100 not extreme.
    """
    if position not in ("F", "B"):
        return 0.0, False, ""

    blk_pg = stats.get("blk_pg", 0.0)
    pf_pg = stats.get("pf_pg", 0.0)
    blk_per_100 = blk_pg * (100 / 70)
    pf_per_100 = pf_pg * (100 / 70)

    # 75th percentile ≈ z=0.675 → value = μ + 0.675σ
    blk_p75 = _get_trait_percentile("blk_per_100", level_key, blk_per_100)
    pf_p = _get_trait_percentile("pf_per_100", level_key, pf_per_100)

    # Trigger: blk at or above 75th percentile, fouls not extreme (below 90th)
    if blk_p75 < 75.0 or pf_p > 90.0:
        return 0.0, False, ""

    # Scale: 75th-99th → 0.5-1.5
    anchor_scale = min(1.0, (blk_p75 - 75.0) / 24.0)
    delta = 0.5 + anchor_scale * 1.0

    explain = (f"Rim anchor: blk/100={blk_per_100:.2f} (p{blk_p75:.0f}), "
               f"pf/100={pf_per_100:.2f} (p{pf_p:.0f})")
    return round(delta, 2), True, explain


# ═══════════════════════════════════════════════════════════════════════════
# MAIN ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════════

def compute_context(
    final_kr: float,
    stats: dict,
    clusters: dict,
    level_key: str,
    position: str,
) -> dict:
    """
    Compute context layer adjustments AFTER canonical KR.

    Returns:
        {
            "context_delta": float,       # bounded ±3.0
            "context_kr": float,          # clamp(0, 100, final_kr + delta)
            "context_flags": [str],       # rule names that fired
            "context_explain": [str],     # human-readable explanations
            "context_cap_hit": bool,      # True if delta was clamped
            "unclamped_delta": float,     # pre-clamp value
            "rules": [dict],             # per-rule detail
        }
    """
    rules = []
    total_delta = 0.0

    # Rule A: Primary Engine Credit
    delta_a, fired_a, explain_a = _rule_primary_engine(stats, level_key)
    rules.append({"rule": "primary_engine", "fired": fired_a, "delta": delta_a, "explain": explain_a})
    total_delta += delta_a

    # Rule B: Sample Volatility Penalty
    delta_b, fired_b, explain_b = _rule_sample_volatility(stats)
    rules.append({"rule": "sample_volatility", "fired": fired_b, "delta": delta_b, "explain": explain_b})
    total_delta += delta_b

    # Rule C: Defensive Anchor Signal (F/B only)
    delta_c, fired_c, explain_c = _rule_defensive_anchor(stats, level_key, position)
    rules.append({"rule": "defensive_anchor", "fired": fired_c, "delta": delta_c, "explain": explain_c})
    total_delta += delta_c

    # Clamp
    unclamped = total_delta
    clamped = max(-MAX_CONTEXT_DELTA, min(MAX_CONTEXT_DELTA, total_delta))
    cap_hit = abs(unclamped - clamped) > 0.001

    context_kr = max(0.0, min(100.0, final_kr + clamped))

    flags = [r["rule"] for r in rules if r["fired"]]
    explains = [r["explain"] for r in rules if r["fired"]]

    return {
        "context_delta": round(clamped, 2),
        "context_kr": round(context_kr, 1),
        "context_flags": flags,
        "context_explain": explains,
        "context_cap_hit": cap_hit,
        "unclamped_delta": round(unclamped, 2),
        "rules": rules,
    }
