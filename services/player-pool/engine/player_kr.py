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


def derive_archetype(clusters: dict[str, float], position: str) -> str:
    """Derive primary archetype from cluster scores and position."""
    candidates = ARCHETYPES.get(position, ARCHETYPES.get("W", []))
    for name, reqs in candidates:
        if all(clusters.get(k, 0) >= v for k, v in reqs.items()):
            return name
    # Fallback: last archetype for position
    return candidates[-1][0] if candidates else "Two-Way Wing"


def derive_secondary_archetypes(clusters: dict[str, float], position: str, primary: str) -> list[str]:
    """Find all qualifying archetypes beyond the primary."""
    candidates = ARCHETYPES.get(position, [])
    secondaries = []
    for name, reqs in candidates:
        if name == primary:
            continue
        if all(clusters.get(k, 0) >= v for k, v in reqs.items()):
            secondaries.append(name)
    return secondaries[:2]  # max 2 secondary


def compute_player_kr(
    clusters: dict[str, float],
    position: str,
) -> dict:
    """
    Compute player KR from 7 cluster scores.
    Returns: base_off_kr, base_def_kr, overall_kr, archetype info.
    """
    weights = POSITION_CLUSTER_WEIGHTS.get(position, DEFAULT_WEIGHTS)

    # Normalize weights to sum to 100
    total_w = sum(weights.values())
    norm = {k: v / total_w * 100 for k, v in weights.items()}

    # Weighted overall KR
    overall = sum(clusters.get(k, 50) * norm.get(k, 0) for k in clusters) / 100.0

    # Base offense KR: simple average of offensive clusters
    off_clusters = ["shooting", "finishing", "playmaking"]
    base_off = sum(clusters.get(k, 50) for k in off_clusters) / len(off_clusters)

    # Base defense KR: simple average of defensive clusters
    def_clusters = ["perimeter_defense", "interior_defense", "rebounding", "frame"]
    base_def = sum(clusters.get(k, 50) for k in def_clusters) / len(def_clusters)

    # Derive archetype
    primary = derive_archetype(clusters, position)
    secondaries = derive_secondary_archetypes(clusters, position, primary)

    return {
        "base_off_kr": round(base_off, 1),
        "base_def_kr": round(base_def, 1),
        "overall_kr": round(overall, 1),
        "primary_archetype": primary,
        "secondary_archetypes": secondaries,
    }
