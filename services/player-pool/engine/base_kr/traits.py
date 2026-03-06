"""
Trait Library — College v1

Source: 01 Trait Library College.pdf
All 51 traits across 7 clusters with calibration tables and scoring formulas.

Each trait is defined as a dict with:
  - key: unique identifier
  - cluster: which of the 7 clusters it belongs to
  - name: human-readable name
  - inputs: list of (input_key, description) tuples
  - calibration: list of per-input calibration specs
  - formula: how to combine band scores into final trait score
  - coverage_min: minimum coverage_tier needed ("box_score", "synergy", "tracking")
"""
from __future__ import annotations

from .band import band_lookup

# ═══════════════════════════════════════════════════════════════════════════
# Cluster Keys
# ═══════════════════════════════════════════════════════════════════════════

SHOOTING = "shooting"
FINISHING = "finishing"
PLAYMAKING = "playmaking"
ON_BALL_DEFENSE = "on_ball_defense"
TEAM_DEFENSE = "team_defense"
REBOUNDING = "rebounding"
FRAME = "frame"

CLUSTER_ORDER = [
    SHOOTING, FINISHING, PLAYMAKING,
    ON_BALL_DEFENSE, TEAM_DEFENSE,
    REBOUNDING, FRAME,
]

# ═══════════════════════════════════════════════════════════════════════════
# Trait Definitions — Data Catalog
# ═══════════════════════════════════════════════════════════════════════════
#
# Each trait entry:
#   key, cluster, name,
#   inputs: [(input_key, higher_is_better?, thresholds)]
#   weights: [weight_per_input]  — must sum to 1.0
#   combine: "weighted" (default) or "min"
#   coverage_min: "box_score" | "synergy" | "tracking"
#
# Thresholds are always ordered [(90, v), (80, v), (70, v), (60, v)]
# For lower-is-better inputs, pass lower_is_better=True in the tuple.

TRAIT_DEFS: list[dict] = [
    # ───────────────────────────────────────────────────────────────────
    # SHOOTING CLUSTER (7 traits)
    # ───────────────────────────────────────────────────────────────────
    {
        "key": "spot_up_3pt",
        "cluster": SHOOTING,
        "name": "Spot-Up 3PT",
        "inputs": [
            {"key": "cs_3p_pct", "thresholds": [(90, 0.42), (80, 0.37), (70, 0.33), (60, 0.28)], "lower_is_better": False},
            {"key": "cs_3pa_pg", "thresholds": [(90, 4.0), (80, 2.5), (70, 1.5), (60, 0.8)], "lower_is_better": False},
        ],
        "weights": [0.70, 0.30],
        "coverage_min": "synergy",
    },
    {
        "key": "movement_3pt",
        "cluster": SHOOTING,
        "name": "Movement 3PT",
        "inputs": [
            {"key": "mov_3p_pct", "thresholds": [(90, 0.40), (80, 0.35), (70, 0.30), (60, 0.25)], "lower_is_better": False},
            {"key": "mov_3pa_pg", "thresholds": [(90, 2.5), (80, 1.5), (70, 0.8), (60, 0.4)], "lower_is_better": False},
        ],
        "weights": [0.70, 0.30],
        "coverage_min": "synergy",
    },
    {
        "key": "otd_3pt",
        "cluster": SHOOTING,
        "name": "Off-the-Dribble 3PT",
        "inputs": [
            {"key": "otd_3p_pct", "thresholds": [(90, 0.38), (80, 0.33), (70, 0.28), (60, 0.23)], "lower_is_better": False},
            {"key": "otd_3pa_pg", "thresholds": [(90, 3.0), (80, 2.0), (70, 1.2), (60, 0.5)], "lower_is_better": False},
        ],
        "weights": [0.65, 0.35],
        "coverage_min": "synergy",
    },
    {
        "key": "deep_range_3pt",
        "cluster": SHOOTING,
        "name": "Deep Range 3PT",
        "inputs": [
            {"key": "deep_3p_pct", "thresholds": [(90, 0.38), (80, 0.33), (70, 0.28), (60, 0.22)], "lower_is_better": False},
            {"key": "deep_3pa_pg", "thresholds": [(90, 2.0), (80, 1.2), (70, 0.6), (60, 0.3)], "lower_is_better": False},
        ],
        "weights": [0.65, 0.35],
        "coverage_min": "synergy",
    },
    {
        "key": "2pt_jumper_cs",
        "cluster": SHOOTING,
        "name": "2PT Jumper C&S",
        "inputs": [
            {"key": "cs_mid_pct", "thresholds": [(90, 0.50), (80, 0.44), (70, 0.38), (60, 0.32)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "synergy",
    },
    {
        "key": "2pt_jumper_otd",
        "cluster": SHOOTING,
        "name": "2PT Jumper OTD",
        "inputs": [
            {"key": "otd_mid_pct", "thresholds": [(90, 0.46), (80, 0.40), (70, 0.34), (60, 0.28)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "synergy",
    },
    {
        "key": "free_throw",
        "cluster": SHOOTING,
        "name": "Free Throw",
        "inputs": [
            {"key": "ft_pct", "thresholds": [(90, 0.82), (80, 0.75), (70, 0.68), (60, 0.60)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "box_score",
    },

    # ───────────────────────────────────────────────────────────────────
    # FINISHING CLUSTER (5 traits)
    # ───────────────────────────────────────────────────────────────────
    {
        "key": "layup_finishing",
        "cluster": FINISHING,
        "name": "Layup Finishing",
        "inputs": [
            {"key": "layup_pct", "thresholds": [(90, 0.65), (80, 0.58), (70, 0.52), (60, 0.45)], "lower_is_better": False},
            {"key": "layup_att_pg", "thresholds": [(90, 5.0), (80, 3.5), (70, 2.0), (60, 1.0)], "lower_is_better": False},
        ],
        "weights": [0.65, 0.35],
        "coverage_min": "synergy",
    },
    {
        "key": "floater_runner",
        "cluster": FINISHING,
        "name": "Floater/Runner",
        "inputs": [
            {"key": "floater_pct", "thresholds": [(90, 0.50), (80, 0.42), (70, 0.35), (60, 0.28)], "lower_is_better": False},
            {"key": "floater_att_pg", "thresholds": [(90, 2.5), (80, 1.5), (70, 0.8), (60, 0.4)], "lower_is_better": False},
        ],
        "weights": [0.65, 0.35],
        "coverage_min": "synergy",
    },
    {
        "key": "dunk_finishing",
        "cluster": FINISHING,
        "name": "Dunk Finishing",
        "inputs": [
            {"key": "dunk_pct", "thresholds": [(90, 0.80), (80, 0.72), (70, 0.62), (60, 0.52)], "lower_is_better": False},
            {"key": "dunk_att_pg", "thresholds": [(90, 3.0), (80, 2.0), (70, 1.0), (60, 0.5)], "lower_is_better": False},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "synergy",
    },
    {
        "key": "close_finishing",
        "cluster": FINISHING,
        "name": "Close Finishing",
        "inputs": [
            {"key": "close_pct", "thresholds": [(90, 0.60), (80, 0.53), (70, 0.46), (60, 0.38)], "lower_is_better": False},
            {"key": "close_att_pg", "thresholds": [(90, 4.0), (80, 2.5), (70, 1.5), (60, 0.8)], "lower_is_better": False},
        ],
        "weights": [0.65, 0.35],
        "coverage_min": "synergy",
    },
    {
        "key": "foul_draw_rate",
        "cluster": FINISHING,
        "name": "Foul Draw Rate",
        "inputs": [
            {"key": "and1_rate", "thresholds": [(90, 0.12), (80, 0.08), (70, 0.05), (60, 0.03)], "lower_is_better": False},
            {"key": "fta_per_drive", "thresholds": [(90, 0.55), (80, 0.42), (70, 0.30), (60, 0.20)], "lower_is_better": False},
        ],
        "weights": None,  # uses min()
        "combine": "min",
        "coverage_min": "synergy",
    },

    # ───────────────────────────────────────────────────────────────────
    # PLAYMAKING CLUSTER (7 traits)
    # ───────────────────────────────────────────────────────────────────
    {
        "key": "passing_accuracy",
        "cluster": PLAYMAKING,
        "name": "Passing Accuracy",
        "inputs": [
            {"key": "on_target_pass_pct", "thresholds": [(90, 0.92), (80, 0.87), (70, 0.82), (60, 0.76)], "lower_is_better": False},
            {"key": "pass_att_pg", "thresholds": [(90, 45.0), (80, 35.0), (70, 25.0), (60, 18.0)], "lower_is_better": False},
        ],
        "weights": [0.65, 0.35],
        "coverage_min": "tracking",
    },
    {
        "key": "passing_vision",
        "cluster": PLAYMAKING,
        "name": "Passing Vision",
        "inputs": [
            {"key": "potential_ast_pg", "thresholds": [(90, 12.0), (80, 8.5), (70, 5.5), (60, 3.5)], "lower_is_better": False},
            {"key": "ast_adj_pg", "thresholds": [(90, 7.0), (80, 5.0), (70, 3.5), (60, 2.0)], "lower_is_better": False},
        ],
        "weights": [0.55, 0.45],
        "coverage_min": "synergy",
    },
    {
        "key": "drive_and_kick",
        "cluster": PLAYMAKING,
        "name": "Drive-and-Kick Passing",
        "inputs": [
            {"key": "dk_pass_rate", "thresholds": [(90, 0.30), (80, 0.22), (70, 0.15), (60, 0.09)], "lower_is_better": False},
            {"key": "dk_pass_pg", "thresholds": [(90, 4.5), (80, 3.0), (70, 1.8), (60, 0.8)], "lower_is_better": False},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "synergy",
    },
    {
        "key": "transition_playmaking",
        "cluster": PLAYMAKING,
        "name": "Transition Playmaking",
        "inputs": [
            {"key": "trans_ast_rate", "thresholds": [(90, 0.35), (80, 0.25), (70, 0.16), (60, 0.08)], "lower_is_better": False},
            {"key": "trans_ast_pg", "thresholds": [(90, 3.0), (80, 2.0), (70, 1.2), (60, 0.5)], "lower_is_better": False},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "synergy",
    },
    {
        "key": "ball_security",
        "cluster": PLAYMAKING,
        "name": "Ball Security",
        "inputs": [
            {"key": "tov_per_100_touches", "thresholds": [(90, 2.5), (80, 3.6), (70, 5.0), (60, 6.8)], "lower_is_better": True},
            {"key": "pass_tov_rate", "thresholds": [(90, 0.025), (80, 0.036), (70, 0.050), (60, 0.068)], "lower_is_better": True},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "tracking",
    },
    {
        "key": "screen_assist_creation",
        "cluster": PLAYMAKING,
        "name": "Screen Assist Creation",
        "inputs": [
            {"key": "screen_ast_pg", "thresholds": [(90, 2.0), (80, 1.3), (70, 0.8), (60, 0.4)], "lower_is_better": False},
            {"key": "screen_ast_per100", "thresholds": [(90, 7.0), (80, 4.5), (70, 3.0), (60, 1.5)], "lower_is_better": False},
        ],
        "weights": None,
        "combine": "min",
        "coverage_min": "synergy",
    },
    {
        "key": "hockey_assist_creation",
        "cluster": PLAYMAKING,
        "name": "Hockey Assist Creation",
        "inputs": [
            {"key": "hockey_ast_pg", "thresholds": [(90, 2.2), (80, 1.4), (70, 0.8), (60, 0.4)], "lower_is_better": False},
            {"key": "hockey_ast_per100", "thresholds": [(90, 8.0), (80, 5.0), (70, 3.0), (60, 1.5)], "lower_is_better": False},
        ],
        "weights": None,
        "combine": "min",
        "coverage_min": "synergy",
    },

    # ───────────────────────────────────────────────────────────────────
    # ON-BALL DEFENSE CLUSTER (8 traits)
    # ───────────────────────────────────────────────────────────────────
    {
        "key": "on_ball_containment",
        "cluster": ON_BALL_DEFENSE,
        "name": "On-Ball Containment",
        "inputs": [
            {"key": "blow_by_rate", "thresholds": [(90, 0.10), (80, 0.15), (70, 0.20), (60, 0.26)], "lower_is_better": True},
            {"key": "paint_touch_rate_allowed", "thresholds": [(90, 0.28), (80, 0.34), (70, 0.40), (60, 0.47)], "lower_is_better": True},
        ],
        "weights": [0.55, 0.45],
        "coverage_min": "tracking",
    },
    {
        "key": "ball_pressure",
        "cluster": ON_BALL_DEFENSE,
        "name": "Ball Pressure",
        "inputs": [
            {"key": "forced_pickup_rate", "thresholds": [(90, 0.14), (80, 0.10), (70, 0.07), (60, 0.04)], "lower_is_better": False},
            {"key": "on_ball_deflection_rate", "thresholds": [(90, 0.22), (80, 0.17), (70, 0.12), (60, 0.08)], "lower_is_better": False},
        ],
        "weights": [0.50, 0.50],
        "coverage_min": "tracking",
    },
    {
        "key": "screen_navigation",
        "cluster": ON_BALL_DEFENSE,
        "name": "Screen Navigation",
        "inputs": [
            {"key": "screen_adv_rate_allowed", "thresholds": [(90, 0.20), (80, 0.27), (70, 0.34), (60, 0.42)], "lower_is_better": True},
            {"key": "sep_at_0_8s", "thresholds": [(90, 2.2), (80, 2.7), (70, 3.2), (60, 3.8)], "lower_is_better": True},
        ],
        "weights": [0.55, 0.45],
        "coverage_min": "tracking",
    },
    {
        "key": "perimeter_shot_contest",
        "cluster": ON_BALL_DEFENSE,
        "name": "Perimeter Shot Contest",
        "inputs": [
            {"key": "perim_efg_allowed", "thresholds": [(90, 0.44), (80, 0.48), (70, 0.52), (60, 0.56)], "lower_is_better": True},
            {"key": "contested_jump_shot_rate", "thresholds": [(90, 0.55), (80, 0.47), (70, 0.39), (60, 0.31)], "lower_is_better": False},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "tracking",
    },
    {
        "key": "steal",
        "cluster": ON_BALL_DEFENSE,
        "name": "Steal",
        "inputs": [
            {"key": "stl_per_100_def_poss", "thresholds": [(90, 3.5), (80, 2.7), (70, 2.0), (60, 1.3)], "lower_is_better": False},
            {"key": "defl_per_def_poss", "thresholds": [(90, 0.25), (80, 0.19), (70, 0.14), (60, 0.09)], "lower_is_better": False},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "tracking",
    },
    {
        "key": "off_ball_denial",
        "cluster": ON_BALL_DEFENSE,
        "name": "Off-Ball Denial",
        "inputs": [
            {"key": "denied_catch_rate", "thresholds": [(90, 0.28), (80, 0.21), (70, 0.15), (60, 0.09)], "lower_is_better": False},
            {"key": "sep_at_catch", "thresholds": [(90, 2.0), (80, 2.4), (70, 2.8), (60, 3.3)], "lower_is_better": True},
        ],
        "weights": [0.55, 0.45],
        "coverage_min": "tracking",
    },
    {
        "key": "perimeter_disruption",
        "cluster": ON_BALL_DEFENSE,
        "name": "Perimeter Disruption",
        "inputs": [
            {"key": "forced_reset_rate", "thresholds": [(90, 0.18), (80, 0.13), (70, 0.09), (60, 0.05)], "lower_is_better": False},
            {"key": "defl_per_def_poss_perim", "thresholds": [(90, 0.25), (80, 0.19), (70, 0.14), (60, 0.09)], "lower_is_better": False},
        ],
        "weights": [0.50, 0.50],
        "coverage_min": "tracking",
    },
    {
        "key": "perimeter_foul_discipline",
        "cluster": ON_BALL_DEFENSE,
        "name": "Perimeter Foul Discipline",
        "inputs": [
            {"key": "perim_fouls_per_100", "thresholds": [(90, 2.6), (80, 3.4), (70, 4.3), (60, 5.3)], "lower_is_better": True},
            {"key": "shooting_foul_rate_perim", "thresholds": [(90, 0.04), (80, 0.06), (70, 0.08), (60, 0.10)], "lower_is_better": True},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "tracking",
    },

    # ───────────────────────────────────────────────────────────────────
    # TEAM DEFENSE CLUSTER (9 traits)
    # ───────────────────────────────────────────────────────────────────
    {
        "key": "block",
        "cluster": TEAM_DEFENSE,
        "name": "Block",
        "inputs": [
            {"key": "blk_per_100_paint_fga", "thresholds": [(90, 12.0), (80, 8.5), (70, 5.5), (60, 3.0)], "lower_is_better": False},
            {"key": "blk_att_pg", "thresholds": [(90, 3.0), (80, 2.0), (70, 1.2), (60, 0.6)], "lower_is_better": False},
        ],
        "weights": [0.70, 0.30],
        "coverage_min": "tracking",
    },
    {
        "key": "rim_deterrence",
        "cluster": TEAM_DEFENSE,
        "name": "Rim Deterrence",
        "inputs": [
            {"key": "rim_att_prevented_per100", "thresholds": [(90, 10.0), (80, 7.0), (70, 4.0), (60, 1.5)], "lower_is_better": False},
            {"key": "rim_freq_delta", "thresholds": [(90, -0.18), (80, -0.12), (70, -0.07), (60, -0.03)], "lower_is_better": True},
        ],
        "weights": [0.55, 0.45],
        "coverage_min": "tracking",
    },
    {
        "key": "vertical_contest",
        "cluster": TEAM_DEFENSE,
        "name": "Vertical Contest Effectiveness",
        "inputs": [
            {"key": "opp_fg_pct_contested", "thresholds": [(90, 0.45), (80, 0.50), (70, 0.55), (60, 0.60)], "lower_is_better": True},
            {"key": "contests_pg", "thresholds": [(90, 6.0), (80, 4.5), (70, 3.0), (60, 1.8)], "lower_is_better": False},
        ],
        "weights": [0.65, 0.35],
        "coverage_min": "tracking",
    },
    {
        "key": "post_defense",
        "cluster": TEAM_DEFENSE,
        "name": "Post Defense",
        "inputs": [
            {"key": "opp_ppp_post", "thresholds": [(90, 0.70), (80, 0.80), (70, 0.90), (60, 1.00)], "lower_is_better": True},
            {"key": "post_stops_pg", "thresholds": [(90, 3.0), (80, 2.0), (70, 1.2), (60, 0.6)], "lower_is_better": False},
        ],
        "weights": [0.70, 0.30],
        "coverage_min": "synergy",
    },
    {
        "key": "help_defense_interior",
        "cluster": TEAM_DEFENSE,
        "name": "Help Defense (Interior)",
        "inputs": [
            {"key": "help_rotations_pg", "thresholds": [(90, 6.0), (80, 4.5), (70, 3.0), (60, 1.8)], "lower_is_better": False},
            {"key": "help_stops_pg", "thresholds": [(90, 3.5), (80, 2.5), (70, 1.6), (60, 0.8)], "lower_is_better": False},
        ],
        "weights": [0.50, 0.50],
        "coverage_min": "tracking",
    },
    {
        "key": "roll_man_defense",
        "cluster": TEAM_DEFENSE,
        "name": "Roll Man Defense",
        "inputs": [
            {"key": "opp_ppp_as_roll_def", "thresholds": [(90, 0.75), (80, 0.85), (70, 0.95), (60, 1.05)], "lower_is_better": True},
            {"key": "roll_stops_pg", "thresholds": [(90, 3.0), (80, 2.0), (70, 1.2), (60, 0.6)], "lower_is_better": False},
        ],
        "weights": [0.70, 0.30],
        "coverage_min": "synergy",
    },
    {
        "key": "interior_disruption",
        "cluster": TEAM_DEFENSE,
        "name": "Interior Disruption",
        "inputs": [
            {"key": "paint_deflections_pg", "thresholds": [(90, 4.0), (80, 3.0), (70, 2.0), (60, 1.0)], "lower_is_better": False},
            {"key": "forced_disruptions_pg", "thresholds": [(90, 3.0), (80, 2.0), (70, 1.2), (60, 0.6)], "lower_is_better": False},
        ],
        "weights": [0.50, 0.50],
        "coverage_min": "tracking",
    },
    {
        "key": "interior_foul_discipline",
        "cluster": TEAM_DEFENSE,
        "name": "Interior Foul Discipline",
        "inputs": [
            {"key": "int_fouls_per_100", "thresholds": [(90, 2.0), (80, 3.0), (70, 4.2), (60, 5.5)], "lower_is_better": True},
            {"key": "and1_rate_allowed", "thresholds": [(90, 0.06), (80, 0.09), (70, 0.13), (60, 0.18)], "lower_is_better": True},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "tracking",
    },
    {
        "key": "interior_positioning",
        "cluster": TEAM_DEFENSE,
        "name": "Interior Positioning",
        "inputs": [
            {"key": "deep_seals_allowed", "thresholds": [(90, 0.8), (80, 1.4), (70, 2.1), (60, 2.9)], "lower_is_better": True},
            {"key": "charges_pg", "thresholds": [(90, 1.2), (80, 0.8), (70, 0.4), (60, 0.1)], "lower_is_better": False},
        ],
        "weights": [0.65, 0.35],
        "coverage_min": "tracking",
    },

    # ───────────────────────────────────────────────────────────────────
    # REBOUNDING CLUSTER (6 traits)
    # ───────────────────────────────────────────────────────────────────
    {
        "key": "defensive_rebounding",
        "cluster": REBOUNDING,
        "name": "Defensive Rebounding",
        "inputs": [
            {"key": "dreb_pct", "thresholds": [(90, 0.28), (80, 0.23), (70, 0.18), (60, 0.13)], "lower_is_better": False},
            {"key": "dreb_pg", "thresholds": [(90, 7.5), (80, 5.5), (70, 3.8), (60, 2.5)], "lower_is_better": False},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "box_score",
    },
    {
        "key": "offensive_rebounding",
        "cluster": REBOUNDING,
        "name": "Offensive Rebounding",
        "inputs": [
            {"key": "oreb_pct", "thresholds": [(90, 0.14), (80, 0.10), (70, 0.07), (60, 0.04)], "lower_is_better": False},
            {"key": "oreb_pg", "thresholds": [(90, 3.2), (80, 2.2), (70, 1.4), (60, 0.7)], "lower_is_better": False},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "box_score",
    },
    {
        "key": "box_out_effectiveness",
        "cluster": REBOUNDING,
        "name": "Box-Out Effectiveness",
        "inputs": [
            {"key": "opp_oreb_pct_on_floor", "thresholds": [(90, 0.18), (80, 0.22), (70, 0.26), (60, 0.30)], "lower_is_better": True},
            {"key": "box_outs_pg", "thresholds": [(90, 6.0), (80, 4.0), (70, 2.5), (60, 1.2)], "lower_is_better": False},
        ],
        "weights": [0.65, 0.35],
        "coverage_min": "tracking",
    },
    {
        "key": "rebound_conversion",
        "cluster": REBOUNDING,
        "name": "Rebound Conversion (Secure vs Tip)",
        "inputs": [
            {"key": "secure_reb_pct", "thresholds": [(90, 0.85), (80, 0.78), (70, 0.70), (60, 0.62)], "lower_is_better": False},
            {"key": "reb_lost_pg", "thresholds": [(90, 0.2), (80, 0.5), (70, 0.9), (60, 1.4)], "lower_is_better": True},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "tracking",
    },
    {
        "key": "rebound_range_tracking",
        "cluster": REBOUNDING,
        "name": "Rebound Range & Tracking",
        "inputs": [
            {"key": "ooa_reb_pg", "thresholds": [(90, 2.5), (80, 1.6), (70, 1.0), (60, 0.5)], "lower_is_better": False},
            {"key": "avg_reb_dist_ft", "thresholds": [(90, 10.0), (80, 7.0), (70, 5.0), (60, 3.0)], "lower_is_better": False},
        ],
        "weights": [0.50, 0.50],
        "coverage_min": "tracking",
    },
    {
        "key": "rebound_to_playmaking",
        "cluster": REBOUNDING,
        "name": "Rebound-to-Playmaking (Outlet Impact)",
        "inputs": [
            {"key": "outlet_ast_pg", "thresholds": [(90, 1.4), (80, 0.9), (70, 0.5), (60, 0.2)], "lower_is_better": False},
            {"key": "adv_outlets_pg", "thresholds": [(90, 3.5), (80, 2.3), (70, 1.4), (60, 0.6)], "lower_is_better": False},
        ],
        "weights": [0.45, 0.55],
        "coverage_min": "tracking",
    },

    # ───────────────────────────────────────────────────────────────────
    # FRAME CLUSTER (9 traits)
    # ───────────────────────────────────────────────────────────────────
    {
        "key": "speed_with_ball",
        "cluster": FRAME,
        "name": "Speed - With Ball",
        "inputs": [
            {"key": "peak_dribble_mph", "thresholds": [(90, 17.5), (80, 16.5), (70, 15.5), (60, 14.5)], "lower_is_better": False},
            {"key": "sustained_dribble_mph", "thresholds": [(90, 15.5), (80, 14.5), (70, 13.5), (60, 12.5)], "lower_is_better": False},
        ],
        "weights": [0.55, 0.45],
        "coverage_min": "tracking",
    },
    {
        "key": "speed_without_ball",
        "cluster": FRAME,
        "name": "Speed - Without Ball",
        "inputs": [
            {"key": "peak_offball_mph", "thresholds": [(90, 19.0), (80, 18.0), (70, 17.0), (60, 16.0)], "lower_is_better": False},
            {"key": "sustained_offball_mph", "thresholds": [(90, 16.5), (80, 15.5), (70, 14.5), (60, 13.5)], "lower_is_better": False},
        ],
        "weights": [0.55, 0.45],
        "coverage_min": "tracking",
    },
    {
        "key": "acceleration_burst",
        "cluster": FRAME,
        "name": "Acceleration (Burst)",
        "inputs": [
            {"key": "time_to_80pct", "thresholds": [(90, 1.25), (80, 1.40), (70, 1.55), (60, 1.70)], "lower_is_better": True},
            {"key": "burst_distance_ft", "thresholds": [(90, 18.0), (80, 16.0), (70, 14.0), (60, 12.0)], "lower_is_better": False},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "tracking",
    },
    {
        "key": "deceleration_stop",
        "cluster": FRAME,
        "name": "Deceleration (Stop Control)",
        "inputs": [
            {"key": "stop_time_s", "thresholds": [(90, 0.45), (80, 0.55), (70, 0.65), (60, 0.75)], "lower_is_better": True},
            {"key": "balance_loss_pct", "thresholds": [(90, 0.06), (80, 0.09), (70, 0.13), (60, 0.18)], "lower_is_better": True},
        ],
        "weights": [0.55, 0.45],
        "coverage_min": "tracking",
    },
    {
        "key": "change_of_direction",
        "cluster": FRAME,
        "name": "Change of Direction (Agility)",
        "inputs": [
            # Efficiency uses labels Top-tier/High/Avg+/Avg/Low → map to 90/80/70/60/50
            {"key": "cod_efficiency", "thresholds": [(90, 0.88), (80, 0.80), (70, 0.72), (60, 0.64)], "lower_is_better": False},
            {"key": "speed_retention_pct", "thresholds": [(90, 0.88), (80, 0.80), (70, 0.72), (60, 0.64)], "lower_is_better": False},
        ],
        "weights": [0.50, 0.50],
        "coverage_min": "tracking",
    },
    {
        "key": "lateral_quickness",
        "cluster": FRAME,
        "name": "Lateral Quickness",
        "inputs": [
            {"key": "containment_pct", "thresholds": [(90, 0.70), (80, 0.60), (70, 0.50), (60, 0.40)], "lower_is_better": False},
            {"key": "lateral_ft_per_s", "thresholds": [(90, 12.5), (80, 11.5), (70, 10.5), (60, 9.5)], "lower_is_better": False},
        ],
        "weights": [0.55, 0.45],
        "coverage_min": "tracking",
    },
    {
        "key": "vertical_pop",
        "cluster": FRAME,
        "name": "Vertical Pop (Live-Play)",
        "inputs": [
            {"key": "max_live_vert_in", "thresholds": [(90, 36.0), (80, 32.0), (70, 28.0), (60, 24.0)], "lower_is_better": False},
            {"key": "second_jump_time_s", "thresholds": [(90, 0.45), (80, 0.55), (70, 0.65), (60, 0.75)], "lower_is_better": True},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "tracking",
    },
    {
        "key": "strength_functional",
        "cluster": FRAME,
        "name": "Strength (Functional)",
        "inputs": [
            {"key": "displacement_resistance_pct", "thresholds": [(90, 0.72), (80, 0.62), (70, 0.52), (60, 0.42)], "lower_is_better": False},
            {"key": "post_contact_success_pct", "thresholds": [(90, 0.70), (80, 0.60), (70, 0.50), (60, 0.40)], "lower_is_better": False},
        ],
        "weights": [0.50, 0.50],
        "coverage_min": "tracking",
    },
    {
        "key": "power_through_contact",
        "cluster": FRAME,
        "name": "Power Through Contact",
        "inputs": [
            {"key": "fg_pct_through_contact", "thresholds": [(90, 0.62), (80, 0.55), (70, 0.48), (60, 0.41)], "lower_is_better": False},
            {"key": "contact_survival_pct", "thresholds": [(90, 0.75), (80, 0.65), (70, 0.55), (60, 0.45)], "lower_is_better": False},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "tracking",
    },
]

# ═══════════════════════════════════════════════════════════════════════════
# Build lookup indexes
# ═══════════════════════════════════════════════════════════════════════════

TRAIT_BY_KEY: dict[str, dict] = {t["key"]: t for t in TRAIT_DEFS}
TRAITS_BY_CLUSTER: dict[str, list[dict]] = {}
for _t in TRAIT_DEFS:
    TRAITS_BY_CLUSTER.setdefault(_t["cluster"], []).append(_t)

# Coverage tier hierarchy
_COVERAGE_RANK = {"box_score": 0, "synergy": 1, "tracking": 2}


def coverage_meets(player_coverage: str, trait_min: str) -> bool:
    """Check if player's coverage tier meets the trait's minimum requirement."""
    return _COVERAGE_RANK.get(player_coverage, 0) >= _COVERAGE_RANK.get(trait_min, 0)


# ═══════════════════════════════════════════════════════════════════════════
# Trait Scoring
# ═══════════════════════════════════════════════════════════════════════════

def score_trait(trait_def: dict, player_inputs: dict[str, float | None]) -> int | None:
    """
    Score a single trait given a player's input values.

    Handles partial inputs: if some inputs are available and others are not,
    scores using only the available inputs with re-normalized weights.
    Returns None only if ALL inputs are missing.

    Returns
    -------
    int or None
        Trait score (0-100 band scale) or None if UNSCORED.
    """
    combine = trait_def.get("combine", "weighted")
    inputs = trait_def["inputs"]
    weights = trait_def.get("weights")

    bands = []
    available_weights = []
    for i, inp_def in enumerate(inputs):
        raw_val = player_inputs.get(inp_def["key"])
        if raw_val is None:
            continue  # Skip missing inputs
        b = band_lookup(raw_val, inp_def["thresholds"], inp_def.get("lower_is_better", False))
        if b is None:
            continue
        bands.append(b)
        if weights:
            available_weights.append(weights[i])

    if not bands:
        return None  # ALL inputs missing → UNSCORED

    if combine == "min":
        return min(bands)
    else:
        # Re-normalize weights for available inputs
        if available_weights:
            total_w = sum(available_weights)
            if total_w > 0:
                return round(sum((w / total_w) * b for w, b in zip(available_weights, bands)))
        # Fallback: equal weight
        return round(sum(bands) / len(bands))


def score_all_traits(
    player_inputs: dict[str, float | None],
    coverage_tier: str = "box_score",
) -> dict[str, int | None]:
    """
    Score all 51 traits for a player.

    With box_score coverage, uses production proxies mapped into trait input keys.
    Traits score with whatever inputs are available; only UNSCORED if ALL inputs
    for that trait are missing.

    Returns dict mapping trait_key → score (int) or None (UNSCORED).
    """
    results: dict[str, int | None] = {}
    for tdef in TRAIT_DEFS:
        results[tdef["key"]] = score_trait(tdef, player_inputs)
    return results
