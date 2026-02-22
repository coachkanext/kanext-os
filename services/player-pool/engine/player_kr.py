from __future__ import annotations
"""
Player KR Computation — Position-weighted cluster aggregation + archetype derivation.
Reference: spec Position Trait Weighting (College) + Archetype Library

v2.0: 7 canonical clusters (removed interior_defense, renamed perimeter_defense/frame).
  - on_ball_defense replaces perimeter_defense
  - physical replaces frame
  - interior_defense weight redistributed into on_ball_defense + team_defense
  - team_defense now a first-class cluster in position weights
  - ON_BALL_BLEND removed — on_ball_defense IS the on-ball score directly
"""

# ═══════════════════════════════════════════════════════════════════════════
# POSITION WEIGHTS (College) — from spec
# 7 canonical clusters per position (sum to 100)
# ═══════════════════════════════════════════════════════════════════════════

POSITION_CLUSTER_WEIGHTS: dict[str, dict[str, float]] = {
    # PG: OKR 55%, DKR 40%, TKR 5%
    # interior_defense was 6.0 → +3.0 to on_ball_defense, +3.0 to team_defense
    "PG": {
        "shooting":           17.6,
        "finishing":           8.8,
        "playmaking":         27.0,
        "on_ball_defense":    29.0,  # was 26.0 + 3.0
        "team_defense":        3.0,  # new (from interior_defense)
        "rebounding":         10.3,
        "physical":            4.3,  # was frame
    },
    # CG: OKR 60%, DKR 35%, TKR 5%
    # interior_defense was 5.3 → +2.5 to on_ball_defense, +2.8 to team_defense
    "CG": {
        "shooting":           24.0,
        "finishing":          13.2,
        "playmaking":         21.0,
        "on_ball_defense":    23.5,  # was 21.0 + 2.5
        "team_defense":        2.8,  # new (from interior_defense)
        "rebounding":         11.5,
        "physical":            4.0,  # was frame
    },
    # W (Wing): OKR 50%, DKR 40%, TKR 10%
    # interior_defense was 10.0 → +5.0 to on_ball_defense, +5.0 to team_defense
    "W": {
        "shooting":           21.0,
        "finishing":          15.0,
        "playmaking":          9.0,
        "on_ball_defense":    25.0,  # was 20.0 + 5.0
        "team_defense":        5.0,  # new (from interior_defense)
        "rebounding":         14.5,
        "physical":           10.5,  # was frame
    },
    # F (Forward): OKR 45%, DKR 40%, TKR 15%
    # interior_defense was 14.0 → +7.0 to on_ball_defense, +7.0 to team_defense
    "F": {
        "shooting":           15.8,
        "finishing":          18.0,
        "playmaking":          6.8,
        "on_ball_defense":    21.0,  # was 14.0 + 7.0
        "team_defense":        7.0,  # new (from interior_defense)
        "rebounding":         17.5,
        "physical":           14.0,  # was frame
    },
    # B (Big): OKR 35%, DKR 45%, TKR 20%
    # interior_defense was 24.8 → +10.0 to on_ball_defense, +14.8 to team_defense
    "B": {
        "shooting":            5.3,
        "finishing":          21.0,
        "playmaking":          3.5,
        "on_ball_defense":    16.8,  # was 6.8 + 10.0
        "team_defense":       14.8,  # new (from interior_defense)
        "rebounding":         19.8,
        "physical":           19.0,  # was frame
    },
}

# ═══════════════════════════════════════════════════════════════════════════
# POSITION WEIGHTS (Pro) — from spec "Position Trait Weighting (Pro)"
# ═══════════════════════════════════════════════════════════════════════════

PRO_POSITION_CLUSTER_WEIGHTS: dict[str, dict[str, float]] = {
    # PG: OKR 60%, DKR 35%, TKR 5%
    # interior_defense was 5.3 → +2.5 to on_ball_defense, +2.8 to team_defense
    "PG": {
        "shooting":           19.2,
        "finishing":           9.6,
        "playmaking":         29.4,
        "on_ball_defense":    25.3,  # was 22.8 + 2.5
        "team_defense":        2.8,  # new
        "rebounding":          9.5,
        "physical":            4.3,  # was frame
    },
    # CG: OKR 65%, DKR 30%, TKR 5%
    # interior_defense was 4.5 → +2.0 to on_ball_defense, +2.5 to team_defense
    "CG": {
        "shooting":           26.0,
        "finishing":          14.3,
        "playmaking":         22.8,
        "on_ball_defense":    20.0,  # was 18.0 + 2.0
        "team_defense":        2.5,  # new
        "rebounding":         10.5,
        "physical":            4.0,  # was frame
    },
    # W: OKR 55%, DKR 35%, TKR 10%
    # interior_defense was 8.8 → +4.4 to on_ball_defense, +4.4 to team_defense
    "W": {
        "shooting":           23.1,
        "finishing":          16.5,
        "playmaking":          9.9,
        "on_ball_defense":    21.9,  # was 17.5 + 4.4
        "team_defense":        4.4,  # new
        "rebounding":         14.0,
        "physical":           10.3,  # was frame
    },
    # F: OKR 45%, DKR 40%, TKR 15% (same as college)
    # interior_defense was 14.0 → +7.0 to on_ball_defense, +7.0 to team_defense
    "F": {
        "shooting":           15.8,
        "finishing":          18.0,
        "playmaking":          6.8,
        "on_ball_defense":    21.0,  # was 14.0 + 7.0
        "team_defense":        7.0,  # new
        "rebounding":         17.5,
        "physical":           14.0,  # was frame
    },
    # B: OKR 35%, DKR 40%, TKR 25%
    # interior_defense was 22.0 → +9.0 to on_ball_defense, +13.0 to team_defense
    "B": {
        "shooting":            5.3,
        "finishing":          21.0,
        "playmaking":          3.5,
        "on_ball_defense":    15.0,  # was 6.0 + 9.0
        "team_defense":       13.0,  # new
        "rebounding":         21.0,
        "physical":           21.3,  # was frame
    },
}

# Fallback generic weights
DEFAULT_WEIGHTS = {
    "shooting":           16.0,
    "finishing":          15.0,
    "playmaking":         13.0,
    "on_ball_defense":    16.0,  # was perimeter_defense
    "team_defense":        8.0,  # new (absorbed interior_defense share)
    "rebounding":         15.0,
    "physical":           17.0,  # was frame (absorbed interior_defense remainder)
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
        ("3-and-D Guard",            {"shooting": 68, "on_ball_defense": 65}),
    ],
    "W": [
        ("Two-Way Wing",             {"shooting": 65, "on_ball_defense": 65}),
        ("Slasher Wing",             {"finishing": 70}),
        ("3-and-D Wing",             {"shooting": 70, "on_ball_defense": 60}),
        ("Switchable Defender",      {"on_ball_defense": 70, "physical": 60}),
    ],
    "F": [
        ("Stretch Big",              {"shooting": 65, "physical": 60}),
        ("Small-Ball Big",           {"on_ball_defense": 60, "physical": 65}),
        ("Connector Forward",        {"playmaking": 60, "shooting": 55}),
        ("Rebounding Enforcer",      {"rebounding": 70, "physical": 65}),
    ],
    "B": [
        ("Rim Protector Anchor",     {"team_defense": 70, "physical": 65}),
        ("Post Hub Facilitator",     {"finishing": 65, "playmaking": 55}),
        ("Vertical Spacer",          {"finishing": 70, "physical": 60}),
        ("Rebounding Enforcer",      {"rebounding": 70, "team_defense": 60}),
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
        ("3-and-D Guard",            {"shooting": 75, "on_ball_defense": 72}),
    ],
    "W": [
        ("Two-Way Wing",             {"shooting": 72, "on_ball_defense": 72}),
        ("Slasher Wing",             {"finishing": 78}),
        ("3-and-D Wing",             {"shooting": 78, "on_ball_defense": 68}),
        ("Switchable Defender",      {"on_ball_defense": 78, "physical": 68}),
    ],
    "F": [
        ("Stretch Big",              {"shooting": 72, "physical": 68}),
        ("Small-Ball Big",           {"on_ball_defense": 68, "physical": 72}),
        ("Connector Forward",        {"playmaking": 68, "shooting": 62}),
        ("Rebounding Enforcer",      {"rebounding": 78, "physical": 72}),
    ],
    "B": [
        ("Rim Protector Anchor",     {"team_defense": 78, "physical": 72}),
        ("Post Hub Facilitator",     {"finishing": 72, "playmaking": 62}),
        ("Vertical Spacer",          {"finishing": 78, "physical": 68}),
        ("Rebounding Enforcer",      {"rebounding": 78, "team_defense": 68}),
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
DEF_KEYS = frozenset(["on_ball_defense", "team_defense", "rebounding"])
TKR_KEYS = frozenset(["physical"])

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

# Position-specific DKR composition weights (3 components: on_ball_defense + team_defense + rebounding)
# Guards get 40% team_defense — discipline + trust is the main DKR signal for guards
DKR_COMPOSITION: dict[str, dict[str, float]] = {
    "PG": {"on_ball_defense": 0.40, "team_defense": 0.40, "rebounding": 0.20},
    "CG": {"on_ball_defense": 0.40, "team_defense": 0.40, "rebounding": 0.20},
    "W":  {"on_ball_defense": 0.35, "team_defense": 0.30, "rebounding": 0.35},
    "F":  {"on_ball_defense": 0.30, "team_defense": 0.25, "rebounding": 0.45},
    "B":  {"on_ball_defense": 0.30, "team_defense": 0.20, "rebounding": 0.50},
}
DEFAULT_DKR_COMPOSITION = {"on_ball_defense": 0.35, "team_defense": 0.30, "rebounding": 0.35}


def compute_player_kr(
    clusters: dict[str, float],
    position: str,
    mode: str = "college",
) -> dict:
    """
    Compute player KR from 7 cluster scores.
    mode: "college" or "pro" — selects position weights and archetype thresholds.

    v2.0 changes:
      - 7 canonical clusters (removed interior_defense, renamed perimeter_defense/frame).
      - DKR = on_ball_defense + team_defense + rebounding (position-weighted).
      - No ON_BALL_BLEND — on_ball_defense IS the on-ball score directly.
      - OKR = weighted(Shooting, Finishing, Playmaking) via alpha weights
      - TKR = Physical
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

    # DKR: on_ball_defense + team_defense + rebounding (position-weighted)
    dkr_w = DKR_COMPOSITION.get(position, DEFAULT_DKR_COMPOSITION)
    on_ball_score = present.get("on_ball_defense", 50.0)
    base_def = (dkr_w["on_ball_defense"] * on_ball_score
              + dkr_w["team_defense"] * present.get("team_defense", 50.0)
              + dkr_w["rebounding"] * present.get("rebounding", 50.0))

    # TKR: Physical
    base_tkr = present.get("physical", 50.0)

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
        "dkr_weights": dkr_w,
        "primary_archetype": primary,
        "secondary_archetypes": secondaries,
    }
