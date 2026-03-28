"""
College Overrides — Positive Only (8 total)

Source: Basketball Player Intelligence v3 spec — College Overrides v2 (LOCKED)

Applied AFTER badges.
Max one positive override per player — non-stacking.
If multiple qualify, the highest-value override is selected.

Override list:
  1. True 7-Footer:              +2.0–5.0 (scaled by height)
  2. Jumbo Initiator:            +1.0
  3. Stretch 5:                  +1.0
  4. Vertical Rim Threat:        +1.0
  5. Connector Wing:             +1.0
  6. Micro-5 (College-Only):     +1.0
  7. Small Bucket Getter (College-Only):        +0.75
  8. Undersized Defensive Guard (College-Only): +0.75

Gates use new v3 position system (PG/SG/SF/PF/C).
"""
from __future__ import annotations


# ═══════════════════════════════════════════════════════════════════════════
# Override Computation
# ═══════════════════════════════════════════════════════════════════════════

def _compute_7footer_boost(height_inches: int | None) -> float:
    """
    Scaling boost for True 7-Footer:
      7'0" (84") → +2.0
      7'1" (85") → +3.0
      7'2" (86") → +4.0
      7'3" (87") → +4.5
      7'4"+ (88"+) → +5.0
    """
    if height_inches is None or height_inches < 84:
        return 0.0
    if height_inches >= 88:
        return 5.0
    boost_table = {84: 2.0, 85: 3.0, 86: 4.0, 87: 4.5}
    return boost_table.get(height_inches, 2.0)


def evaluate_overrides(
    trait_scores: dict[str, int | None],
    cluster_scores: dict[str, float | None],
    height_inches: int | None,
    position: str,
) -> dict | None:
    """
    Evaluate all 8 college overrides and return the best qualifying one.

    Parameters
    ----------
    trait_scores   : dict[trait_key → score or None] — v3 trait keys
    cluster_scores : dict[cluster → score or None]
    height_inches  : int or None
    position       : one of PG, SG, SF, PF, C

    Returns
    -------
    dict {key, name, kr_boost} or None if no override qualifies.
    """
    candidates: list[tuple[str, str, float]] = []

    ts = trait_scores  # shorthand

    # ─────────────────────────────────────────────────────────────────
    # 1. True 7-Footer
    #    Gate: height ≥ 84" (7'0")
    #    Boost: scaled per inch
    # ─────────────────────────────────────────────────────────────────
    if height_inches is not None and height_inches >= 84:
        boost = _compute_7footer_boost(height_inches)
        if boost > 0:
            candidates.append(("true_7_footer", "True 7-Footer", boost))

    # ─────────────────────────────────────────────────────────────────
    # 2. Jumbo Initiator
    #    Gate: height ≥ 78" (6'6") + passing_vision ≥ 70 + ball_security ≥ 65
    #    Blocked: turnover_risk_major, decision_making_collapse (skip for now)
    # ─────────────────────────────────────────────────────────────────
    if height_inches is not None and height_inches >= 78:
        pv = ts.get("passing_vision")
        bs = ts.get("ball_security")
        if pv is not None and pv >= 70 and bs is not None and bs >= 65:
            candidates.append(("jumbo_initiator", "Jumbo Initiator", 1.0))

    # ─────────────────────────────────────────────────────────────────
    # 3. Stretch 5
    #    Gate: position == C + spot_up_3pt ≥ 70 + free_throw ≥ 70
    #    Blocked: no_gravity_major (skip for now)
    # ─────────────────────────────────────────────────────────────────
    if position == "C":
        su3 = ts.get("spot_up_3pt")
        ft  = ts.get("free_throw")
        if su3 is not None and su3 >= 70 and ft is not None and ft >= 70:
            candidates.append(("stretch_5", "Stretch 5", 1.0))

    # ─────────────────────────────────────────────────────────────────
    # 4. Vertical Rim Threat
    #    Gate: vertical_pop ≥ 80 + vertical_finishing ≥ 75
    # ─────────────────────────────────────────────────────────────────
    vp = ts.get("vertical_pop")
    vf = ts.get("vertical_finishing")
    if vp is not None and vp >= 80 and vf is not None and vf >= 75:
        candidates.append(("vertical_rim_threat", "Vertical Rim Threat", 1.0))

    # ─────────────────────────────────────────────────────────────────
    # 5. Connector Wing
    #    Gate: height 6'4"–6'8" (76"–80") + connector_creation ≥ 70 + spot_up_3pt ≥ 65
    # ─────────────────────────────────────────────────────────────────
    if height_inches is not None and 76 <= height_inches <= 80:
        cc  = ts.get("connector_creation")
        su3 = ts.get("spot_up_3pt")
        if cc is not None and cc >= 70 and su3 is not None and su3 >= 65:
            candidates.append(("connector_wing", "Connector Wing", 1.0))

    # ─────────────────────────────────────────────────────────────────
    # 6. Micro-5 (College Only)
    #    Gate: position == C + height ≤ 79" (6'7") + rim_protection ≥ 70
    #          + defensive_rebounding ≥ 70
    # ─────────────────────────────────────────────────────────────────
    if position == "C" and height_inches is not None and height_inches <= 79:
        rp = ts.get("rim_protection")
        dr = ts.get("defensive_rebounding")
        if rp is not None and rp >= 70 and dr is not None and dr >= 70:
            candidates.append(("micro_5", "Micro-5", 1.0))

    # ─────────────────────────────────────────────────────────────────
    # 7. Small Bucket Getter (College Only)
    #    Gate: height ≤ 73" (6'1") + pull_up_3pt ≥ 75 + free_throw ≥ 75
    #    Blocked: turnover_risk_major (skip for now)
    # ─────────────────────────────────────────────────────────────────
    if height_inches is not None and height_inches <= 73:
        pu3 = ts.get("pull_up_3pt")
        ft  = ts.get("free_throw")
        if pu3 is not None and pu3 >= 75 and ft is not None and ft >= 75:
            candidates.append(("small_bucket_getter", "Small Bucket Getter", 0.75))

    # ─────────────────────────────────────────────────────────────────
    # 8. Undersized Defensive Guard (College Only)
    #    Gate: height ≤ 73" (6'1") + containment ≥ 75 + steal_timing ≥ 70
    # ─────────────────────────────────────────────────────────────────
    if height_inches is not None and height_inches <= 73:
        cn  = ts.get("containment")
        stl = ts.get("steal_timing")
        if cn is not None and cn >= 75 and stl is not None and stl >= 70:
            candidates.append(("undersized_defensive_guard", "Undersized Defensive Guard", 0.75))

    if not candidates:
        return None

    # Select highest-boost override (max one per player)
    best = max(candidates, key=lambda x: x[2])
    return {"key": best[0], "name": best[1], "kr_boost": best[2]}
