"""
College Overrides — Positive Only (8 total)

Source: COLLEGE OVERRIDES (POSITIVE ONLY — 8 TOTAL).pdf

Applied AFTER badges (Step 10).
Max one positive override per player — non-stacking.
If multiple qualify, the highest-value override is selected.
"""
from __future__ import annotations


# ═══════════════════════════════════════════════════════════════════════════
# Override Definitions
# ═══════════════════════════════════════════════════════════════════════════
#
# Each override:
#   key: unique identifier
#   name: display name
#   kr_boost: fixed float or "scaling" (for True 7-Footer)
#   triggers: list of conditions that must ALL be met
#   blockers: list of conditions where ANY prevents the override

OVERRIDE_DEFS: list[dict] = [
    {
        "key": "true_7_footer",
        "name": "True 7-Footer",
        "kr_boost": "scaling",  # +2.0 to +5.0 based on height
        "description": "Extreme height advantage with functional mobility.",
        # Height >= 84 inches (7'0") with scaling up to 7'4"+
        # Boost: 7'0" = +2.0, 7'1" = +2.75, 7'2" = +3.5, 7'3" = +4.25, 7'4"+ = +5.0
    },
    {
        "key": "jumbo_initiator",
        "name": "Jumbo Initiator",
        "kr_boost": 1.0,
        "description": "Oversized playmaker who initiates offense from forward/big spot.",
        # Height >= 78 (6'6") + Passing Vision >= 70 + Ball Security >= 65
    },
    {
        "key": "stretch_5",
        "name": "Stretch 5",
        "kr_boost": 1.0,
        "description": "Center who spaces floor with legitimate 3PT threat.",
        # Position = Big + Spot-Up 3PT >= 70 + FT% >= 70
    },
    {
        "key": "vertical_rim_threat",
        "name": "Vertical Rim Threat",
        "kr_boost": 1.0,
        "description": "Elite vertical athlete who creates rim pressure through explosiveness.",
        # Vertical Pop >= 80 + Dunk Finishing >= 75
    },
    {
        "key": "connector_wing",
        "name": "Connector Wing",
        "kr_boost": 1.0,
        "description": "Wing who elevates teammates through off-ball actions.",
        # Hockey Assist >= 70 + Screen Assist >= 65 + Spot-Up 3PT >= 65
    },
    {
        "key": "micro_5",
        "name": "Micro-5 (College Only)",
        "kr_boost": 1.0,
        "description": "Undersized center (6'7\" or under) who anchors defense.",
        # Height <= 79 (6'7") + Position = Big + Rim Protection >= 70 + Defensive Rebounding >= 70
    },
    {
        "key": "small_bucket_getter",
        "name": "Small Bucket Getter (College Only)",
        "kr_boost": 0.75,
        "description": "Undersized guard who creates scoring despite size disadvantage.",
        # Height <= 72 (6'0") + OTD Shooting >= 75 + FT% >= 75
    },
    {
        "key": "undersized_defensive_guard",
        "name": "Undersized Defensive Guard (College Only)",
        "kr_boost": 0.75,
        "description": "Small guard who impacts defense despite height disadvantage.",
        # Height <= 73 (6'1") + On-Ball Containment >= 75 + Steal >= 70
    },
]


def _compute_7footer_boost(height_inches: int | None) -> float:
    """Scaling boost for True 7-Footer override."""
    if height_inches is None or height_inches < 84:
        return 0.0
    if height_inches >= 88:  # 7'4"+
        return 5.0
    # Linear scale: 7'0"(84)=2.0, 7'4"(88)=5.0 → +0.75 per inch
    return 2.0 + (height_inches - 84) * 0.75


def evaluate_overrides(
    trait_scores: dict[str, int | None],
    cluster_scores: dict[str, float | None],
    height_inches: int | None,
    position: str,
) -> dict | None:
    """
    Evaluate all 8 overrides and return the best qualifying one.

    Returns dict with {key, name, kr_boost} or None if no override qualifies.
    Max one override per player — highest boost wins.
    """
    candidates = []

    ts = trait_scores  # shorthand

    # 1. True 7-Footer
    if height_inches is not None and height_inches >= 84:
        # Need functional mobility (lateral_quickness >= 50 as sanity check)
        lq = ts.get("lateral_quickness")
        if lq is None or lq >= 50:
            boost = _compute_7footer_boost(height_inches)
            if boost > 0:
                candidates.append(("true_7_footer", "True 7-Footer", boost))

    # 2. Jumbo Initiator
    if height_inches is not None and height_inches >= 78:
        pv = ts.get("passing_vision")
        bs = ts.get("ball_security")
        if pv is not None and pv >= 70 and bs is not None and bs >= 65:
            candidates.append(("jumbo_initiator", "Jumbo Initiator", 1.0))

    # 3. Stretch 5
    if position == "Big":
        su = ts.get("spot_up_3pt")
        ft = ts.get("free_throw")
        if su is not None and su >= 70 and ft is not None and ft >= 70:
            candidates.append(("stretch_5", "Stretch 5", 1.0))

    # 4. Vertical Rim Threat
    vp = ts.get("vertical_pop")
    df = ts.get("dunk_finishing")
    if vp is not None and vp >= 80 and df is not None and df >= 75:
        candidates.append(("vertical_rim_threat", "Vertical Rim Threat", 1.0))

    # 5. Connector Wing
    ha = ts.get("hockey_assist_creation")
    sa = ts.get("screen_assist_creation")
    su3 = ts.get("spot_up_3pt")
    if (ha is not None and ha >= 70 and
        sa is not None and sa >= 65 and
        su3 is not None and su3 >= 65):
        candidates.append(("connector_wing", "Connector Wing", 1.0))

    # 6. Micro-5 (College Only)
    if position == "Big" and height_inches is not None and height_inches <= 79:
        rp = ts.get("block") or ts.get("rim_deterrence")
        dr = ts.get("defensive_rebounding")
        if rp is not None and rp >= 70 and dr is not None and dr >= 70:
            candidates.append(("micro_5", "Micro-5", 1.0))

    # 7. Small Bucket Getter (College Only)
    if height_inches is not None and height_inches <= 72:
        otd = ts.get("otd_3pt") or ts.get("2pt_jumper_otd")
        ft = ts.get("free_throw")
        if otd is not None and otd >= 75 and ft is not None and ft >= 75:
            candidates.append(("small_bucket_getter", "Small Bucket Getter", 0.75))

    # 8. Undersized Defensive Guard (College Only)
    if height_inches is not None and height_inches <= 73:
        obc = ts.get("on_ball_containment")
        stl = ts.get("steal")
        if obc is not None and obc >= 75 and stl is not None and stl >= 70:
            candidates.append(("undersized_defensive_guard", "Undersized Defensive Guard", 0.75))

    if not candidates:
        return None

    # Select highest boost
    best = max(candidates, key=lambda x: x[2])
    return {"key": best[0], "name": best[1], "kr_boost": best[2]}
