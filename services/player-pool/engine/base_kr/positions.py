"""
Position Framework — College v2

Source: Base KR.pdf (updated spec)
5 positions: PG, CG (Combo Guard), Wing, Forward, Big
Each has flat 7-cluster weights (no OKR/DKR/TKR intermediates).
"""
from __future__ import annotations

from .traits import (
    SHOOTING, FINISHING, PLAYMAKING,
    ON_BALL_DEFENSE, TEAM_DEFENSE,
    REBOUNDING, FRAME,
)

# ═══════════════════════════════════════════════════════════════════════════
# Position Definitions — Flat 7-Cluster Weights
# ═══════════════════════════════════════════════════════════════════════════
#
# Each position has a single dict of 7 cluster weights summing to ~100.
# No OKR/DKR/TKR intermediates — direct cluster-to-KR mapping.

POSITIONS: dict[str, dict] = {
    "PG": {
        "name": "Point Guard",
        "weights": {
            SHOOTING: 17.6,
            FINISHING: 8.8,
            PLAYMAKING: 27.0,
            ON_BALL_DEFENSE: 26.0,
            TEAM_DEFENSE: 2.0,
            REBOUNDING: 15.2,
            FRAME: 3.5,
        },
    },
    "CG": {
        "name": "Combo Guard",
        "weights": {
            SHOOTING: 24.0,
            FINISHING: 13.2,
            PLAYMAKING: 21.0,
            ON_BALL_DEFENSE: 21.0,
            TEAM_DEFENSE: 2.8,
            REBOUNDING: 14.8,
            FRAME: 3.2,
        },
    },
    "Wing": {
        "name": "Wing",
        "weights": {
            SHOOTING: 21.0,
            FINISHING: 15.0,
            PLAYMAKING: 9.0,
            ON_BALL_DEFENSE: 20.0,
            TEAM_DEFENSE: 6.0,
            REBOUNDING: 23.5,
            FRAME: 5.5,
        },
    },
    "Forward": {
        "name": "Forward",
        "weights": {
            SHOOTING: 15.8,
            FINISHING: 18.0,
            PLAYMAKING: 6.8,
            ON_BALL_DEFENSE: 12.0,
            TEAM_DEFENSE: 12.0,
            REBOUNDING: 28.0,
            FRAME: 7.5,
        },
    },
    "Big": {
        "name": "Big",
        "weights": {
            SHOOTING: 5.2,
            FINISHING: 21.0,
            PLAYMAKING: 3.5,
            ON_BALL_DEFENSE: 4.5,
            TEAM_DEFENSE: 22.5,
            REBOUNDING: 34.2,
            FRAME: 9.0,
        },
    },
}


def map_position(declared_positions: list[str] | None) -> str:
    """
    Map declared position strings to our 5-position framework.

    Common inputs: "G", "PG", "SG", "SF", "PF", "C", "F", "Guard", "Forward", "Center"
    """
    if not declared_positions:
        return "Wing"  # default fallback

    pos_set = {p.upper().strip() for p in declared_positions}

    # Direct mappings
    if "PG" in pos_set and len(pos_set) == 1:
        return "PG"

    # Combo guard: PG+SG or G
    if pos_set == {"PG", "SG"} or pos_set == {"G"} or pos_set == {"PG", "G"}:
        return "CG"

    # Pure SG or SG+SF → Wing
    if "SG" in pos_set:
        if "SF" in pos_set or "F" in pos_set:
            return "Wing"
        if "PG" in pos_set:
            return "CG"
        return "Wing"

    # SF alone → Wing
    if pos_set == {"SF"}:
        return "Wing"

    # SF+PF → Forward
    if "SF" in pos_set and "PF" in pos_set:
        return "Forward"

    # PF alone → Forward
    if pos_set == {"PF"}:
        return "Forward"

    # C alone or PF+C → Big
    if "C" in pos_set:
        return "Big"

    # Generic fallbacks
    if "GUARD" in pos_set or "G" in pos_set:
        return "CG"
    if "FORWARD" in pos_set or "F" in pos_set:
        return "Forward"
    if "CENTER" in pos_set:
        return "Big"

    return "Wing"  # ultimate fallback


def compute_raw_kr(
    cluster_scores: dict[str, float | None],
    position: str,
) -> dict[str, float | None]:
    """
    Compute raw player KR from cluster scores using flat position weights.

    Returns dict with key: raw_player_kr
    None if no clusters are scored.
    """
    pos_def = POSITIONS.get(position, POSITIONS["Wing"])
    weights = pos_def["weights"]

    total_w = 0.0
    weighted_sum = 0.0
    for cluster, w in weights.items():
        score = cluster_scores.get(cluster)
        if score is not None:
            weighted_sum += w * score
            total_w += w

    return {
        "raw_player_kr": weighted_sum / total_w if total_w > 0 else None,
    }
