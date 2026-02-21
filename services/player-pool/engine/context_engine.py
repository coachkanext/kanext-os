from __future__ import annotations
"""
Context Multiplier Layer — Gated adjustment layer between badges and KLVN.

Applies contextual adjustments to league_final_overall based on rules
that capture information beyond raw box-score stats.

Hard rules:
  - Feature flag: ENABLE_CONTEXT_ENGINE (default False)
  - Max total adjustment: +-3.0 KR points
  - All rules logged with name, fired status, and adjustment amount

Usage:
    from context_engine import apply_context_adjustments
    result = apply_context_adjustments(league_final_off, league_final_def, league_final_overall, stats, clusters, level_key, position)
    # result["adjusted_overall"] = league_final_overall + bounded adjustments
"""

# ═══════════════════════════════════════════════════════════════════════════
# FEATURE FLAG — Must be explicitly enabled
# ═══════════════════════════════════════════════════════════════════════════

ENABLE_CONTEXT_ENGINE = False

# Maximum total adjustment (absolute value) in KR points
MAX_TOTAL_ADJUSTMENT = 3.0


def apply_context_adjustments(
    league_final_off: float,
    league_final_def: float,
    league_final_overall: float,
    stats: dict,
    clusters: dict,
    level_key: str,
    position: str,
) -> dict:
    """
    Apply context-based adjustments to league_final values.

    Runs BEFORE KLVN translation. When disabled (default), returns
    values unchanged.

    Returns:
        {
            "adjusted_off": float,
            "adjusted_def": float,
            "adjusted_overall": float,
            "enabled": bool,
            "total_adjustment": float,
            "rules_log": [{"rule": str, "fired": bool, "adjustment": float}, ...],
        }
    """
    rules_log: list[dict] = []
    total_adj = 0.0

    if not ENABLE_CONTEXT_ENGINE:
        return {
            "adjusted_off": league_final_off,
            "adjusted_def": league_final_def,
            "adjusted_overall": league_final_overall,
            "enabled": False,
            "total_adjustment": 0.0,
            "rules_log": rules_log,
        }

    # ── Context rules go here (defined later with hard bounds) ──
    # Each rule appends to rules_log and accumulates into total_adj.
    # Example skeleton:
    #
    # adj, fired = _rule_example(stats, clusters, level_key, position)
    # rules_log.append({"rule": "example_rule", "fired": fired, "adjustment": adj})
    # total_adj += adj

    # Clamp total adjustment to bounds
    total_adj = max(-MAX_TOTAL_ADJUSTMENT, min(MAX_TOTAL_ADJUSTMENT, total_adj))

    # Apply only to overall (OKR/DKR pass through unchanged)
    adjusted_overall = max(0.0, min(100.0, league_final_overall + total_adj))

    return {
        "adjusted_off": league_final_off,
        "adjusted_def": league_final_def,
        "adjusted_overall": adjusted_overall,
        "enabled": True,
        "total_adjustment": round(total_adj, 2),
        "rules_log": rules_log,
    }
