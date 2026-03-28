"""
KR Engine v4.0 — Constants & Level Configuration

Source: Basketball Player Intelligence v3 spec (354 pages)
  - KLVN Lambda Ladder: 14 levels unchanged
  - OPF (Offensive Position Framework): OKR/DKR/TKR/IQKR splits
  - TRAIT_WEIGHTS_COLLEGE/PRO: per-trait absolute weights within each component
  - OKR/DKR sub-weights kept for reference (derived from TRAIT_WEIGHTS totals)
"""
from __future__ import annotations

# ═══════════════════════════════════════════════════════════════════════════
# Version & Coverage Tiers
# ═══════════════════════════════════════════════════════════════════════════

KR_VERSION = "v4.0-base-kr"

COVERAGE_BOX_SCORE  = "box_score"
COVERAGE_BARTTORVIK = "barttorvik"   # D1 advanced stats via cbbdata/T-Rank
COVERAGE_SYNERGY    = "synergy"
COVERAGE_TRACKING   = "tracking"

# ═══════════════════════════════════════════════════════════════════════════
# KLVN Lambda Ladder — 14 levels (unchanged from v3.0)
# ═══════════════════════════════════════════════════════════════════════════

LAMBDA_LEVEL: dict[str, float] = {
    "ncaa_d1_high_major": 1.000,
    "ncaa_d1_mid_major":  0.958,
    "ncaa_d1_low_major":  0.917,
    "ncaa_d2":            0.875,
    "njcaa_d1":           0.833,
    "naia":               0.810,
    "cccaa":              0.765,
    "njcaa_d2":           0.750,
    "ncaa_d3":            0.667,
    "njcaa_d3":           0.625,
    "uscaa":              0.583,
    "nccaa_d1":           0.542,
    "nccaa_d2":           0.500,
    "hs_prep_postgrad":   0.450,
}

# ═══════════════════════════════════════════════════════════════════════════
# D1 Conference Class Mapping (HM / MM / LM)
# ═══════════════════════════════════════════════════════════════════════════

HIGH_MAJOR_CONFERENCES = frozenset({
    "ACC", "Atlantic Coast Conference",
    "Big Ten", "Big Ten Conference",
    "Big 12", "Big 12 Conference",
    "SEC", "Southeastern Conference",
    "Big East", "BIG EAST Conference",
})

MID_MAJOR_CONFERENCES = frozenset({
    "American Athletic Conference", "AAC", "American", "American Conference",
    "Atlantic 10", "A-10", "Atlantic 10 Conference",
    "Mountain West", "MWC", "Mountain West Conference",
    "West Coast Conference", "WCC",
    "Missouri Valley Conference", "MVC", "Missouri Valley",
})

_D1_TIER_MAP: dict[str, str] = {}
for _c in HIGH_MAJOR_CONFERENCES:
    _D1_TIER_MAP[_c.lower()] = "ncaa_d1_high_major"
for _c in MID_MAJOR_CONFERENCES:
    _D1_TIER_MAP[_c.lower()] = "ncaa_d1_mid_major"


def get_d1_level_key(conference_name: str | None) -> str:
    if not conference_name:
        return "ncaa_d1_low_major"
    return _D1_TIER_MAP.get(conference_name.lower().strip(), "ncaa_d1_low_major")


def get_lambda(level_key: str) -> float:
    return LAMBDA_LEVEL.get(level_key, 0.450)


# DB level_key → KLVN key
LEVEL_KEY_MAP: dict[str, str | None] = {
    "ncaa_d1":  None,  # D1 needs conference-based resolution
    "ncaa_d2":  "ncaa_d2",
    "ncaa_d3":  "ncaa_d3",
    "njcaa_d1": "njcaa_d1",
    "njcaa_d2": "njcaa_d2",
    "njcaa_d3": "njcaa_d3",
    "naia":     "naia",
    "cccaa":    "cccaa",
    "uscaa":    "uscaa",
    "nccaa_d1": "nccaa_d1",
    "nccaa_d2": "nccaa_d2",
}

# ═══════════════════════════════════════════════════════════════════════════
# OPF — Offensive Position Framework
#
# Base Player KR = (OKR × OPF_off) + (DKR × OPF_def)
#                + (TKR × OPF_tools) + (IQKR × OPF_iq)
#
# College — 5 standard positions
# Format: {"PG": (OPF_off, OPF_def, OPF_tools, OPF_iq), ...}
# All four weights must sum to 1.0.
# ═══════════════════════════════════════════════════════════════════════════

OPF_COLLEGE: dict[str, tuple[float, float, float, float]] = {
    "PG": (0.56, 0.28, 0.10, 0.06),
    "SG": (0.58, 0.26, 0.12, 0.04),
    "SF": (0.52, 0.30, 0.14, 0.04),
    "PF": (0.44, 0.36, 0.18, 0.02),
    "C":  (0.34, 0.44, 0.20, 0.02),
}

OPF_PRO: dict[str, tuple[float, float, float, float]] = {
    "PG": (0.58, 0.28, 0.05, 0.09),
    "SG": (0.60, 0.28, 0.06, 0.06),
    "SF": (0.54, 0.32, 0.07, 0.07),
    "PF": (0.46, 0.40, 0.10, 0.04),
    "C":  (0.36, 0.48, 0.12, 0.04),
}

# ═══════════════════════════════════════════════════════════════════════════
# OKR/DKR Sub-weights (reference only — derived from TRAIT_WEIGHTS totals)
# Used for legacy compatibility; TRAIT_WEIGHTS is the primary source.
# ═══════════════════════════════════════════════════════════════════════════

OKR_SUBWEIGHTS_COLLEGE: dict[str, tuple[float, float, float]] = {
    "PG": (0.34, 0.22, 0.44),
    "SG": (0.44, 0.26, 0.30),
    "SF": (0.40, 0.32, 0.28),
    "PF": (0.26, 0.44, 0.30),
    "C":  (0.14, 0.60, 0.26),
}

OKR_SUBWEIGHTS_PRO: dict[str, tuple[float, float, float]] = {
    "PG": (0.36, 0.20, 0.44),
    "SG": (0.46, 0.24, 0.30),
    "SF": (0.42, 0.30, 0.28),
    "PF": (0.28, 0.42, 0.30),
    "C":  (0.16, 0.58, 0.26),
}

DKR_SUBWEIGHTS_COLLEGE: dict[str, tuple[float, float, float]] = {
    "PG": (0.60, 0.25, 0.15),
    "SG": (0.55, 0.25, 0.20),
    "SF": (0.40, 0.35, 0.25),
    "PF": (0.20, 0.45, 0.35),
    "C":  (0.10, 0.55, 0.35),
}

DKR_SUBWEIGHTS_PRO: dict[str, tuple[float, float, float]] = {
    "PG": (0.62, 0.23, 0.15),
    "SG": (0.57, 0.23, 0.20),
    "SF": (0.42, 0.33, 0.25),
    "PF": (0.22, 0.43, 0.35),
    "C":  (0.08, 0.57, 0.35),  # updated from C Pro PDF data
}

# ═══════════════════════════════════════════════════════════════════════════
# TRAIT WEIGHTS — Per-trait absolute weights within each KR component
#
# Source: Basketball Player Intelligence v3 spec — Neutral Position Weights
#   PG/SG/SF/PF College: pages 61–80
#   C College + C Pro:   pages 81–100
#
# Structure:
#   TRAIT_WEIGHTS_COLLEGE[position]["okr"][trait_key] = weight (int, sum=100)
#   TRAIT_WEIGHTS_COLLEGE[position]["dkr"][trait_key] = weight (int, sum=100)
#   TRAIT_WEIGHTS_COLLEGE[position]["tkr"][trait_key] = weight (int, sum=100)
#   TRAIT_WEIGHTS_COLLEGE[position]["iqkr"][trait_key] = weight (int, sum=100)
#
# UNSCORED traits are excluded at runtime; remaining weights renormalize.
#
# NOTE: PG IQKR has 6 traits (no correct_read_rate). All others have 7.
# ═══════════════════════════════════════════════════════════════════════════

TRAIT_WEIGHTS_COLLEGE: dict[str, dict[str, dict[str, int]]] = {

    # ── PG ──────────────────────────────────────────────────────────────────
    "PG": {
        "okr": {
            # Shooting (34%)
            "spot_up_3pt":          8,
            "movement_3pt":         6,
            "pull_up_3pt":         12,
            "deep_range_3pt":       4,
            "midrange_shotmaking":  2,
            "free_throw":           2,
            # Finishing (22%)
            "rim_pressure":         6,
            "contact_finishing":    4,
            "touch_craft":          4,
            "foul_draw":            4,
            "vertical_finishing":   1,
            "transition_finishing": 3,
            # Playmaking (44%)
            "advantage_creation":  12,
            "passing_vision":       7,
            "passing_execution":    7,
            "advantage_passing":    8,
            "transition_playmaking":4,
            "ball_security":        4,
            "connector_creation":   2,
        },
        "dkr": {
            # POA Defense (60%)
            "containment":         14,
            "screen_navigation":   12,
            "ball_pressure":       10,
            "closeout_recovery":    8,
            "deflections":          6,
            "steal_timing":         6,
            "poa_foul_discipline":  4,
            # Team Defense (25%)
            "help_rotation":        6,
            "rim_protection":       2,
            "closeout_execution":   4,
            "off_ball_positioning": 5,
            "communication_qb":     4,
            "versatility":          2,
            "team_foul_discipline": 2,
            # Rebounding (15%)
            "defensive_rebounding": 5,
            "offensive_rebounding": 2,
            "box_out":              3,
            "rebound_range":        2,
            "hands":                2,
            "second_jump_tip":      1,
        },
        "tkr": {
            "height":              6,
            "length":              8,
            "strength":           10,
            "speed":              18,
            "lateral_quickness":  22,
            "vertical_pop":        8,
            "motor":              18,
            "endurance":          10,
        },
        "iqkr": {
            # PG has 6 IQ traits (no correct_read_rate)
            "decision_speed":            15,
            "shot_selection":            15,
            "turnover_decision_quality": 15,
            "advantage_conversion":      15,
            "role_discipline":           20,
            "processing_under_pressure": 20,
        },
    },

    # ── SG ──────────────────────────────────────────────────────────────────
    "SG": {
        "okr": {
            # Shooting (44%)
            "spot_up_3pt":         14,
            "movement_3pt":        10,
            "pull_up_3pt":         13,
            "deep_range_3pt":       4,
            "midrange_shotmaking":  2,
            "free_throw":           1,
            # Finishing (26%)
            "rim_pressure":         7,
            "contact_finishing":    5,
            "touch_craft":          4,
            "foul_draw":            6,
            "vertical_finishing":   2,
            "transition_finishing": 2,
            # Playmaking (30%)
            "advantage_creation":   7,
            "passing_vision":       5,
            "passing_execution":    5,
            "advantage_passing":    6,
            "transition_playmaking":3,
            "ball_security":        3,
            "connector_creation":   1,
        },
        "dkr": {
            # POA Defense (55%)
            "containment":         12,
            "screen_navigation":   11,
            "ball_pressure":        8,
            "closeout_recovery":    7,
            "deflections":          6,
            "steal_timing":         7,
            "poa_foul_discipline":  4,
            # Team Defense (25%)
            "help_rotation":        6,
            "rim_protection":       2,
            "closeout_execution":   4,
            "off_ball_positioning": 5,
            "communication_qb":     4,
            "versatility":          2,
            "team_foul_discipline": 2,
            # Rebounding (20%)
            "defensive_rebounding": 7,
            "offensive_rebounding": 3,
            "box_out":              4,
            "rebound_range":        2,
            "hands":                3,
            "second_jump_tip":      1,
        },
        "tkr": {
            "height":              8,
            "length":             10,
            "strength":           10,
            "speed":              16,
            "lateral_quickness":  18,
            "vertical_pop":       10,
            "motor":              18,
            "endurance":          10,
        },
        "iqkr": {
            "decision_speed":            15,
            "correct_read_rate":         15,
            "shot_selection":            15,
            "turnover_decision_quality": 15,
            "advantage_conversion":      10,
            "role_discipline":           15,
            "processing_under_pressure": 15,
        },
    },

    # ── SF ──────────────────────────────────────────────────────────────────
    "SF": {
        "okr": {
            # Shooting (40%)
            "spot_up_3pt":         14,
            "movement_3pt":        10,
            "pull_up_3pt":          8,
            "deep_range_3pt":       3,
            "midrange_shotmaking":  3,
            "free_throw":           2,
            # Finishing (32%)
            "rim_pressure":        10,
            "contact_finishing":    7,
            "touch_craft":          5,
            "foul_draw":            6,
            "vertical_finishing":   2,
            "transition_finishing": 2,
            # Playmaking (28%)
            "advantage_creation":   6,
            "passing_vision":       5,
            "passing_execution":    5,
            "advantage_passing":    5,
            "transition_playmaking":3,
            "ball_security":        2,
            "connector_creation":   2,
        },
        "dkr": {
            # POA Defense (40%)
            "containment":          8,
            "screen_navigation":    7,
            "ball_pressure":        5,
            "closeout_recovery":    6,
            "deflections":          5,
            "steal_timing":         6,
            "poa_foul_discipline":  3,
            # Team Defense (35%)
            "help_rotation":        8,
            "rim_protection":       6,
            "closeout_execution":   5,
            "off_ball_positioning": 6,
            "communication_qb":     5,
            "versatility":          4,
            "team_foul_discipline": 1,
            # Rebounding (25%)
            "defensive_rebounding": 9,
            "offensive_rebounding": 4,
            "box_out":              5,
            "rebound_range":        3,
            "hands":                3,
            "second_jump_tip":      1,
        },
        "tkr": {
            "height":              14,
            "length":              16,
            "strength":            14,
            "speed":               10,
            "lateral_quickness":   10,
            "vertical_pop":        10,
            "motor":               16,
            "endurance":           10,
        },
        "iqkr": {
            "decision_speed":            15,
            "correct_read_rate":         15,
            "shot_selection":            15,
            "turnover_decision_quality": 15,
            "advantage_conversion":      10,
            "role_discipline":           15,
            "processing_under_pressure": 15,
        },
    },

    # ── PF ──────────────────────────────────────────────────────────────────
    "PF": {
        "okr": {
            # Shooting (26%)
            "spot_up_3pt":         12,
            "movement_3pt":         5,
            "pull_up_3pt":          3,
            "deep_range_3pt":       2,
            "midrange_shotmaking":  2,
            "free_throw":           2,
            # Finishing (44%)
            "rim_pressure":        14,
            "contact_finishing":   10,
            "touch_craft":          6,
            "foul_draw":            8,
            "vertical_finishing":   4,
            "transition_finishing": 2,
            # Playmaking (30%)
            "advantage_creation":   5,
            "passing_vision":       5,
            "passing_execution":    6,
            "advantage_passing":    5,
            "transition_playmaking":2,
            "ball_security":        2,
            "connector_creation":   5,
        },
        "dkr": {
            # POA Defense (20%)
            "containment":          3,
            "screen_navigation":    3,
            "ball_pressure":        2,
            "closeout_recovery":    4,
            "deflections":          3,
            "steal_timing":         3,
            "poa_foul_discipline":  2,
            # Team Defense (45%)
            "help_rotation":       10,
            "rim_protection":      10,
            "closeout_execution":   6,
            "off_ball_positioning": 6,
            "communication_qb":     6,
            "versatility":          5,
            "team_foul_discipline": 2,
            # Rebounding (35%)
            "defensive_rebounding":14,
            "offensive_rebounding": 6,
            "box_out":              7,
            "rebound_range":        3,
            "hands":                3,
            "second_jump_tip":      2,
        },
        "tkr": {
            "height":              20,
            "length":              18,
            "strength":            18,
            "speed":                6,
            "lateral_quickness":    6,
            "vertical_pop":        10,
            "motor":               14,
            "endurance":            8,
        },
        "iqkr": {
            "decision_speed":            15,
            "correct_read_rate":         15,
            "shot_selection":            15,
            "turnover_decision_quality": 15,
            "advantage_conversion":      10,
            "role_discipline":           15,
            "processing_under_pressure": 15,
        },
    },

    # ── C ───────────────────────────────────────────────────────────────────
    "C": {
        "okr": {
            # Shooting (14%)
            "spot_up_3pt":          8,
            "movement_3pt":         2,
            "pull_up_3pt":          0,
            "deep_range_3pt":       1,
            "midrange_shotmaking":  1,
            "free_throw":           2,
            # Finishing (60%)
            "rim_pressure":        16,
            "contact_finishing":   16,
            "touch_craft":          8,
            "foul_draw":           10,
            "vertical_finishing":   8,
            "transition_finishing": 2,
            # Playmaking (26%)
            "advantage_creation":   3,
            "passing_vision":       4,
            "passing_execution":    6,
            "advantage_passing":    4,
            "transition_playmaking":1,
            "ball_security":        2,
            "connector_creation":   6,
        },
        "dkr": {
            # POA Defense (10%)
            "containment":          1,
            "screen_navigation":    2,
            "ball_pressure":        0,
            "closeout_recovery":    3,
            "deflections":          2,
            "steal_timing":         1,
            "poa_foul_discipline":  1,
            # Team Defense (55%)
            "help_rotation":       12,
            "rim_protection":      18,
            "closeout_execution":   6,
            "off_ball_positioning": 6,
            "communication_qb":     6,
            "versatility":          5,
            "team_foul_discipline": 2,
            # Rebounding (35%)
            "defensive_rebounding":16,
            "offensive_rebounding": 6,
            "box_out":              6,
            "rebound_range":        2,
            "hands":                3,
            "second_jump_tip":      2,
        },
        "tkr": {
            "height":              26,
            "length":              22,
            "strength":            20,
            "speed":                4,
            "lateral_quickness":    4,
            "vertical_pop":        10,
            "motor":                8,
            "endurance":            6,
        },
        "iqkr": {
            "decision_speed":            15,
            "correct_read_rate":         15,
            "shot_selection":            15,
            "turnover_decision_quality": 15,
            "advantage_conversion":      10,
            "role_discipline":           15,
            "processing_under_pressure": 15,
        },
    },
}

# ── Pro weights ──────────────────────────────────────────────────────────────
# C Pro: extracted from spec (pages 81–100)
# PG/SG/SF/PF Pro: same within-component distribution as College
#   (OPF_PRO handles component-level shifts; exact per-trait Pro tables
#    for PG/SG/SF/PF require reading spec pages not yet extracted — TODO)
# ─────────────────────────────────────────────────────────────────────────────

TRAIT_WEIGHTS_PRO: dict[str, dict[str, dict[str, int]]] = {
    "PG": TRAIT_WEIGHTS_COLLEGE["PG"],
    "SG": TRAIT_WEIGHTS_COLLEGE["SG"],
    "SF": TRAIT_WEIGHTS_COLLEGE["SF"],
    "PF": TRAIT_WEIGHTS_COLLEGE["PF"],
    "C": {
        "okr": {
            # Shooting (16%)
            "spot_up_3pt":          9,
            "movement_3pt":         2,
            "pull_up_3pt":          0,
            "deep_range_3pt":       2,
            "midrange_shotmaking":  1,
            "free_throw":           2,
            # Finishing (58%)
            "rim_pressure":        15,
            "contact_finishing":   16,
            "touch_craft":          8,
            "foul_draw":           10,
            "vertical_finishing":   7,
            "transition_finishing": 2,
            # Playmaking (26%)
            "advantage_creation":   3,
            "passing_vision":       4,
            "passing_execution":    6,
            "advantage_passing":    4,
            "transition_playmaking":1,
            "ball_security":        2,
            "connector_creation":   6,
        },
        "dkr": {
            # POA Defense (8%)
            "containment":          1,
            "screen_navigation":    2,
            "ball_pressure":        0,
            "closeout_recovery":    2,
            "deflections":          1,
            "steal_timing":         1,
            "poa_foul_discipline":  1,
            # Team Defense (57%)
            "help_rotation":       12,
            "rim_protection":      19,
            "closeout_execution":   6,
            "off_ball_positioning": 6,
            "communication_qb":     6,
            "versatility":          6,
            "team_foul_discipline": 2,
            # Rebounding (35%)
            "defensive_rebounding":16,
            "offensive_rebounding": 6,
            "box_out":              6,
            "rebound_range":        2,
            "hands":                3,
            "second_jump_tip":      2,
        },
        "tkr": {
            "height":              22,
            "length":              20,
            "strength":            20,
            "speed":                4,
            "lateral_quickness":    4,
            "vertical_pop":        14,
            "motor":                8,
            "endurance":            8,
        },
        "iqkr": {
            "decision_speed":            16,
            "correct_read_rate":         14,
            "shot_selection":            14,
            "turnover_decision_quality": 14,
            "advantage_conversion":      10,
            "role_discipline":           16,
            "processing_under_pressure": 16,
        },
    },
}

# ═══════════════════════════════════════════════════════════════════════════
# Coach Context v2 — System Catalogs
# Used by coach_context.py; defined here as canonical constants.
# ═══════════════════════════════════════════════════════════════════════════

OFFENSIVE_SYSTEMS: list[str] = [
    "Spread Pick-and-Roll",
    "5-Out Motion",
    "Read & React",
    "Heliocentric",
    "Princeton",
    "Half-Court Isolation",
    "Triangle",
    "Blocker-Mover",
    "Free-Flow Motion",
    "Horns",
    "Pace-and-Space",
    "Coach K",
]

DEFENSIVE_SYSTEMS: list[str] = [
    "Containment",
    "Man Press",
    "Zone",
    "Box-1",
    "Switch Everything",
    "Pack Line",
    "Scramble Switch",
    "Help Principles",
    "Matchup Zone",
    "Coach K Defense",
]
