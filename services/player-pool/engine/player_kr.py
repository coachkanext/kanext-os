from __future__ import annotations
"""
Player KR Computation — Position-weighted cluster aggregation + archetype derivation.
Reference: spec Position Trait Weighting (College) + Archetype Library
"""

# ═══════════════════════════════════════════════════════════════════════════
# POSITION WEIGHTS (College) — from spec
# OPF: OKR%, DKR%, TKR% per position
# Within each: cluster sub-weights
# ═══════════════════════════════════════════════════════════════════════════

# Simplified 7-cluster weights per position (sum to 100)
# Derived from spec OPF + sub-cluster weights:
#   shooting_w = OKR% * Shooting% of OKR
#   finishing_w = OKR% * Finishing% of OKR
#   playmaking_w = OKR% * Playmaking% of OKR
#   perimeter_defense_w = DKR% * PerimDef% of DKR
#   interior_defense_w = DKR% * InteriorDef% of DKR
#   rebounding_w = DKR% * (DefReb% + TKR% * RebTools%) of DKR
#   frame_w = TKR% * Physical%

POSITION_CLUSTER_WEIGHTS: dict[str, dict[str, float]] = {
    # PG: OKR 55%, DKR 40%, TKR 5%
    "PG": {
        "shooting":           17.6,  # 55% * 32%
        "finishing":           8.8,  # 55% * 16%
        "playmaking":         27.0,  # 55% * 49%
        "perimeter_defense":  26.0,  # 40% * 65%
        "interior_defense":    6.0,  # 40% * 15%
        "rebounding":         10.3,  # 40% * 20% + 55%*3% + 5%*15%
        "frame":               4.3,  # 5% * 85%
    },
    # CG: OKR 60%, DKR 35%, TKR 5%
    "CG": {
        "shooting":           24.0,  # 60% * 40%
        "finishing":          13.2,  # 60% * 22%
        "playmaking":         21.0,  # 60% * 35%
        "perimeter_defense":  21.0,  # 35% * 60%
        "interior_defense":    5.3,  # 35% * 15%
        "rebounding":         11.5,  # 35% * 25% + 60%*3% + 5%*20%
        "frame":               4.0,  # 5% * 80%
    },
    # W (Wing): OKR 50%, DKR 40%, TKR 10%
    "W": {
        "shooting":           21.0,  # 50% * 42%
        "finishing":          15.0,  # 50% * 30%
        "playmaking":          9.0,  # 50% * 18%
        "perimeter_defense":  20.0,  # 40% * 50%
        "interior_defense":   10.0,  # 40% * 25%
        "rebounding":         14.5,  # 40% * 25% + 50%*10% + 10%*25%
        "frame":              10.5,  # 10% * 75% + remainder
    },
    # F (Forward): OKR 45%, DKR 40%, TKR 15%
    "F": {
        "shooting":           15.8,  # 45% * 35%
        "finishing":          18.0,  # 45% * 40%
        "playmaking":          6.8,  # 45% * 15%
        "perimeter_defense":  14.0,  # 40% * 35%
        "interior_defense":   14.0,  # 40% * 35%
        "rebounding":         17.5,  # 40% * 30% + 45%*10% + 15%*20%
        "frame":              14.0,  # 15% * 80% + remainder
    },
    # B (Big): OKR 35%, DKR 45%, TKR 20%
    "B": {
        "shooting":            5.3,  # 35% * 15%
        "finishing":          21.0,  # 35% * 60%
        "playmaking":          3.5,  # 35% * 10%
        "perimeter_defense":   6.8,  # 45% * 15%
        "interior_defense":   24.8,  # 45% * 55%
        "rebounding":         19.8,  # 45% * 30% + 35%*15% + 20%*15%
        "frame":              19.0,  # 20% * 85% + remainder
    },
}

# ═══════════════════════════════════════════════════════════════════════════
# POSITION WEIGHTS (Pro) — from spec "Position Trait Weighting (Pro)"
# ═══════════════════════════════════════════════════════════════════════════

PRO_POSITION_CLUSTER_WEIGHTS: dict[str, dict[str, float]] = {
    # PG: OKR 60%, DKR 35%, TKR 5%
    "PG": {
        "shooting":           19.2,  # 60% * 32%
        "finishing":           9.6,  # 60% * 16%
        "playmaking":         29.4,  # 60% * 49%
        "perimeter_defense":  22.8,  # 35% * 65%
        "interior_defense":    5.3,  # 35% * 15%
        "rebounding":          9.5,  # 35% * 20% + 60%*3% + 5%*15%
        "frame":               4.3,  # 5% * 85%
    },
    # CG: OKR 65%, DKR 30%, TKR 5%
    "CG": {
        "shooting":           26.0,  # 65% * 40%
        "finishing":          14.3,  # 65% * 22%
        "playmaking":         22.8,  # 65% * 35%
        "perimeter_defense":  18.0,  # 30% * 60%
        "interior_defense":    4.5,  # 30% * 15%
        "rebounding":         10.5,  # 30% * 25% + 65%*3% + 5%*20%
        "frame":               4.0,  # 5% * 80%
    },
    # W: OKR 55%, DKR 35%, TKR 10%
    "W": {
        "shooting":           23.1,  # 55% * 42%
        "finishing":          16.5,  # 55% * 30%
        "playmaking":          9.9,  # 55% * 18%
        "perimeter_defense":  17.5,  # 35% * 50%
        "interior_defense":    8.8,  # 35% * 25%
        "rebounding":         14.0,  # 35% * 25% + 55%*10% + 10%*25%
        "frame":              10.3,  # 10% * 75% + remainder
    },
    # F: OKR 45%, DKR 40%, TKR 15% (same as college)
    "F": {
        "shooting":           15.8,
        "finishing":          18.0,
        "playmaking":          6.8,
        "perimeter_defense":  14.0,
        "interior_defense":   14.0,
        "rebounding":         17.5,
        "frame":              14.0,
    },
    # B: OKR 35%, DKR 40%, TKR 25%
    "B": {
        "shooting":            5.3,  # 35% * 15%
        "finishing":          21.0,  # 35% * 60%
        "playmaking":          3.5,  # 35% * 10%
        "perimeter_defense":   6.0,  # 40% * 15%
        "interior_defense":   22.0,  # 40% * 55%
        "rebounding":         21.0,  # 40% * 30% + 35%*15% + 25%*15%
        "frame":              21.3,  # 25% * 85%
    },
}

# Fallback generic weights
DEFAULT_WEIGHTS = {
    "shooting":           16.0,
    "finishing":          15.0,
    "playmaking":         13.0,
    "perimeter_defense":  16.0,
    "interior_defense":   12.0,
    "rebounding":         15.0,
    "frame":              13.0,
}


# ═══════════════════════════════════════════════════════════════════════════
# ARCHETYPE DERIVATION
# ═══════════════════════════════════════════════════════════════════════════

# Position-specific archetype candidates (ordered by priority — first match wins)
# College thresholds
ARCHETYPES: dict[str, list[tuple[str, dict[str, float]]]] = {
    "PG": [
        ("Pick-and-Roll Operator",   {"playmaking": 72, "shooting": 65}),
        ("Primary Ball Handler",     {"playmaking": 75}),
        ("DHO Handoff Hub",          {"playmaking": 68, "shooting": 60}),
        ("Connector Guard",          {"playmaking": 60}),
    ],
    "CG": [
        ("Spot-Up Specialist",       {"shooting": 75}),
        ("Secondary Creator",        {"playmaking": 65, "shooting": 60}),
        ("Off-Ball Shooter",         {"shooting": 70}),
        ("3-and-D Guard",            {"shooting": 68, "perimeter_defense": 65}),
    ],
    "W": [
        ("Two-Way Wing",             {"shooting": 65, "perimeter_defense": 65}),
        ("Slasher Wing",             {"finishing": 70}),
        ("3-and-D Wing",             {"shooting": 70, "perimeter_defense": 60}),
        ("Switchable Defender",      {"perimeter_defense": 70, "frame": 60}),
    ],
    "F": [
        ("Stretch Big",              {"shooting": 65, "frame": 60}),
        ("Small-Ball Big",           {"perimeter_defense": 60, "frame": 65}),
        ("Connector Forward",        {"playmaking": 60, "shooting": 55}),
        ("Rebounding Enforcer",      {"rebounding": 70, "frame": 65}),
    ],
    "B": [
        ("Rim Protector Anchor",     {"interior_defense": 70, "frame": 65}),
        ("Post Hub Facilitator",     {"finishing": 65, "playmaking": 55}),
        ("Vertical Spacer",          {"finishing": 70, "frame": 60}),
        ("Rebounding Enforcer",      {"rebounding": 70, "interior_defense": 60}),
    ],
}

# Pro archetype candidates — higher thresholds (harder bar)
PRO_ARCHETYPES: dict[str, list[tuple[str, dict[str, float]]]] = {
    "PG": [
        ("Pick-and-Roll Operator",   {"playmaking": 80, "shooting": 72}),
        ("Primary Ball Handler",     {"playmaking": 82}),
        ("DHO Handoff Hub",          {"playmaking": 75, "shooting": 68}),
        ("Connector Guard",          {"playmaking": 68}),
    ],
    "CG": [
        ("Spot-Up Specialist",       {"shooting": 82}),
        ("Secondary Creator",        {"playmaking": 72, "shooting": 68}),
        ("Off-Ball Shooter",         {"shooting": 78}),
        ("3-and-D Guard",            {"shooting": 75, "perimeter_defense": 72}),
    ],
    "W": [
        ("Two-Way Wing",             {"shooting": 72, "perimeter_defense": 72}),
        ("Slasher Wing",             {"finishing": 78}),
        ("3-and-D Wing",             {"shooting": 78, "perimeter_defense": 68}),
        ("Switchable Defender",      {"perimeter_defense": 78, "frame": 68}),
    ],
    "F": [
        ("Stretch Big",              {"shooting": 72, "frame": 68}),
        ("Small-Ball Big",           {"perimeter_defense": 68, "frame": 72}),
        ("Connector Forward",        {"playmaking": 68, "shooting": 62}),
        ("Rebounding Enforcer",      {"rebounding": 78, "frame": 72}),
    ],
    "B": [
        ("Rim Protector Anchor",     {"interior_defense": 78, "frame": 72}),
        ("Post Hub Facilitator",     {"finishing": 72, "playmaking": 62}),
        ("Vertical Spacer",          {"finishing": 78, "frame": 68}),
        ("Rebounding Enforcer",      {"rebounding": 78, "interior_defense": 68}),
    ],
}

# Map declared positions to canonical 5
POSITION_MAP: dict[str, str] = {
    "PG": "PG", "G": "PG", "Point Guard": "PG",
    "SG": "CG", "CG": "CG", "Combo Guard": "CG", "Guard": "CG",
    "SF": "W", "W": "W", "Wing": "W", "GF": "W", "G/F": "W",
    "PF": "F", "F": "F", "Forward": "F", "F/C": "F",
    "C": "B", "B": "B", "Center": "B", "Big": "B",
}


def map_position(declared: str | None) -> str:
    """Map a declared position to canonical 5 (PG/CG/W/F/B)."""
    if not declared:
        return "W"  # default to wing
    for part in declared.replace("/", " ").split():
        canonical = POSITION_MAP.get(part.strip().upper())
        if canonical:
            return canonical
    return "W"


def derive_archetype(clusters: dict[str, float], position: str,
                     mode: str = "college") -> str:
    """Derive primary archetype from cluster scores and position."""
    table = PRO_ARCHETYPES if mode == "pro" else ARCHETYPES
    candidates = table.get(position, table.get("W", []))
    for name, reqs in candidates:
        if all(clusters.get(k, 0) >= v for k, v in reqs.items()):
            return name
    # Fallback: last archetype for position
    return candidates[-1][0] if candidates else "Two-Way Wing"


def derive_secondary_archetypes(clusters: dict[str, float], position: str,
                                primary: str, mode: str = "college") -> list[str]:
    """Find all qualifying archetypes beyond the primary."""
    table = PRO_ARCHETYPES if mode == "pro" else ARCHETYPES
    candidates = table.get(position, [])
    secondaries = []
    for name, reqs in candidates:
        if name == primary:
            continue
        if all(clusters.get(k, 0) >= v for k, v in reqs.items()):
            secondaries.append(name)
    return secondaries[:2]  # max 2 secondary


OFF_KEYS = frozenset(["shooting", "finishing", "playmaking"])
DEF_KEYS = frozenset(["perimeter_defense", "interior_defense", "rebounding", "team_defense"])
TKR_KEYS = frozenset(["frame"])

# 53/47 split is for TEAM KR only (team_kr.py). Player KR uses position splits below.
TEAM_OFF_DEF_SPLIT = (0.53, 0.47)

# Position-specific 3-way splits from KaNeXT OS Product Spec (locked)
POSITION_COMPONENT_SPLITS: dict[str, tuple[float, float, float]] = {
    # (OKR%, DKR%, TKR%)
    "PG": (0.65, 0.30, 0.05),
    "CG": (0.65, 0.30, 0.05),
    "W":  (0.60, 0.30, 0.10),
    "F":  (0.55, 0.30, 0.15),
    "B":  (0.45, 0.35, 0.20),
}
DEFAULT_COMPONENT_SPLIT = (0.50, 0.40, 0.10)

# Position-specific on-ball defense blend (perimeter + interior → single score)
ON_BALL_BLEND: dict[str, dict[str, float]] = {
    "PG": {"perimeter_defense": 1.00, "interior_defense": 0.00},
    "CG": {"perimeter_defense": 1.00, "interior_defense": 0.00},
    "W":  {"perimeter_defense": 0.70, "interior_defense": 0.30},
    "F":  {"perimeter_defense": 0.35, "interior_defense": 0.65},
    "B":  {"perimeter_defense": 0.10, "interior_defense": 0.90},
}
DEFAULT_ON_BALL_BLEND = {"perimeter_defense": 0.50, "interior_defense": 0.50}

# Position-specific DKR composition weights (3 components: on_ball + team_defense + rebounding)
# Guards get 40% team_defense — discipline + trust is the main DKR signal for guards
DKR_COMPOSITION: dict[str, dict[str, float]] = {
    "PG": {"on_ball": 0.40, "team_defense": 0.40, "rebounding": 0.20},
    "CG": {"on_ball": 0.40, "team_defense": 0.40, "rebounding": 0.20},
    "W":  {"on_ball": 0.35, "team_defense": 0.30, "rebounding": 0.35},
    "F":  {"on_ball": 0.30, "team_defense": 0.25, "rebounding": 0.45},
    "B":  {"on_ball": 0.30, "team_defense": 0.20, "rebounding": 0.50},
}
DEFAULT_DKR_COMPOSITION = {"on_ball": 0.35, "team_defense": 0.30, "rebounding": 0.35}


def compute_player_kr(
    clusters: dict[str, float],
    position: str,
    mode: str = "college",
) -> dict:
    """
    Compute player KR from 8 cluster scores.
    mode: "college" or "pro" — selects position weights and archetype thresholds.

    v1.5 changes:
      - DKR recomposed into 3 components: on-ball defense, team_defense, rebounding.
      - On-ball defense = position-weighted blend of perimeter_defense + interior_defense.
      - Guards get 40% team_defense in DKR (discipline + trust signals).
      - OKR = weighted(Shooting, Finishing, Playmaking) via alpha weights
      - DKR = on_ball + team_defense + rebounding (position-weighted)
      - TKR = Frame
      - Overall = w_ok * OKR + w_dk * DKR + w_tk * TKR
    Returns: base_off_kr, base_def_kr, base_tkr, overall_kr, dkr_weights, archetype info.
    """
    if mode == "pro":
        weights = PRO_POSITION_CLUSTER_WEIGHTS.get(position, DEFAULT_WEIGHTS)
    else:
        weights = POSITION_CLUSTER_WEIGHTS.get(position, DEFAULT_WEIGHTS)

    # Only use clusters that are actually present — no default-50 substitution
    present = {k: v for k, v in clusters.items() if k in weights}
    if not present:
        present = {k: 50.0 for k in weights}

    # OKR: weighted from Shooting + Finishing + Playmaking (alpha weights)
    off_present = {k: present[k] for k in OFF_KEYS if k in present}
    off_w = {k: weights[k] for k in off_present}
    off_total = sum(off_w.values())
    base_off = (
        sum(off_present[k] * off_w[k] for k in off_present) / off_total
        if off_total > 0 else 50.0
    )

    # DKR: on-ball defense (blend of perim + interior) + team_defense + rebounding
    ob_blend = ON_BALL_BLEND.get(position, DEFAULT_ON_BALL_BLEND)
    on_ball_score = sum(present.get(k, 50.0) * w for k, w in ob_blend.items())

    dkr_w = DKR_COMPOSITION.get(position, DEFAULT_DKR_COMPOSITION)
    base_def = (dkr_w["on_ball"] * on_ball_score
              + dkr_w["team_defense"] * present.get("team_defense", 50.0)
              + dkr_w["rebounding"] * present.get("rebounding", 50.0))

    # TKR: Frame
    base_tkr = present.get("frame", 50.0)

    # Overall KR = position-specific 3-way split
    w_ok, w_dk, w_tk = POSITION_COMPONENT_SPLITS.get(position, DEFAULT_COMPONENT_SPLIT)
    overall = w_ok * base_off + w_dk * base_def + w_tk * base_tkr

    # Derive archetype
    primary = derive_archetype(clusters, position, mode)
    secondaries = derive_secondary_archetypes(clusters, position, primary, mode)

    return {
        "base_off_kr": round(base_off, 1),
        "base_def_kr": round(base_def, 1),
        "base_tkr": round(base_tkr, 1),
        "overall_kr": round(overall, 1),
        "position_split": (w_ok, w_dk, w_tk),
        "on_ball_score": round(on_ball_score, 1),
        "on_ball_blend": ob_blend,
        "dkr_weights": dkr_w,
        "primary_archetype": primary,
        "secondary_archetypes": secondaries,
    }
