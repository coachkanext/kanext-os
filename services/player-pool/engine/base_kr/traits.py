"""
Trait Library — College v4.0

Source: Basketball Player Intelligence v3 spec (354 pages)
54 traits across 8 clusters.

Clusters:
  1. Shooting       (6 traits)
  2. Finishing      (6 traits)
  3. Playmaking     (7 traits)
  4. POA Defense    (7 traits)
  5. Team Defense   (7 traits)
  6. Rebounding     (6 traits)  ← +1: second_jump_tip
  7. Tools          (8 traits)  ← +3: strength, motor, endurance
  8. IQ             (7 traits)  ← +3: correct_read_rate, turnover_decision_quality, advantage_conversion
  Total:            54 traits   (was 47 in v3.0)

v4.0 Changes vs v3.0:
  - Tools: added strength (weight proxy), motor (stl+blk proxy), endurance (MPG proxy)
  - Rebounding: added second_jump_tip (oreb+blk tip-activity proxy)
  - IQ: added correct_read_rate, turnover_decision_quality, advantage_conversion
  - IQ: shot_selection and role_discipline coverage_min raised box_score → synergy
    (IQ is now FULLY UNSCORED at box_score tier — all 7 traits require synergy+)

Coverage tiers: box_score < barttorvik < synergy < tracking
At box_score, scoreable traits:
  free_throw, defensive_rebounding, offensive_rebounding,
  height, strength (weight proxy), motor (stl+blk proxy), endurance (MPG proxy),
  second_jump_tip (oreb+blk proxy),
  passing_vision (AST proxy), steal_timing (STL proxy), foul_draw (FTA/FGA proxy),
  rim_protection (BLK proxy), poa_foul_discipline (PF proxy), team_foul_discipline (PF proxy).
3 IQ traits scoreable at barttorvik tier: shot_selection, turnover_decision_quality, role_discipline.
4 IQ traits remain UNSCORED until synergy+: decision_speed, correct_read_rate, advantage_conversion, processing_under_pressure.
"""
from __future__ import annotations

from .band import band_lookup

# ═══════════════════════════════════════════════════════════════════════════
# Cluster Keys
# ═══════════════════════════════════════════════════════════════════════════

SHOOTING      = "shooting"
FINISHING     = "finishing"
PLAYMAKING    = "playmaking"
POA_DEFENSE   = "poa_defense"
TEAM_DEFENSE  = "team_defense"
REBOUNDING    = "rebounding"
TOOLS         = "tools"
IQ            = "iq"

CLUSTER_ORDER = [
    SHOOTING, FINISHING, PLAYMAKING,
    POA_DEFENSE, TEAM_DEFENSE,
    REBOUNDING, TOOLS, IQ,
]

# ═══════════════════════════════════════════════════════════════════════════
# Trait Definitions
#
# Each trait:
#   key            — unique identifier
#   cluster        — one of the 8 cluster keys
#   name           — display name
#   inputs         — list of {key, thresholds[(band,cutoff)...], lower_is_better}
#   weights        — list of per-input weights (must sum to 1.0), or None for min()
#   combine        — "weighted" (default) or "min"
#   coverage_min   — "box_score" | "synergy" | "tracking"
#
# Thresholds ordered: [(90,v), (80,v), (70,v), (60,v)]
# ═══════════════════════════════════════════════════════════════════════════

TRAIT_DEFS: list[dict] = [

    # ─────────────────────────────────────────────────────────────────────
    # SHOOTING (6 traits)
    # ─────────────────────────────────────────────────────────────────────
    {
        "key": "spot_up_3pt",
        "cluster": SHOOTING,
        "name": "3PT Spot-Up",
        "inputs": [
            {"key": "cs_3p_pct",  "thresholds": [(90, 0.42), (80, 0.37), (70, 0.33), (60, 0.28)], "lower_is_better": False},
            {"key": "cs_3pa_pg",  "thresholds": [(90, 4.0),  (80, 2.5),  (70, 1.5),  (60, 0.8)],  "lower_is_better": False},
        ],
        "weights": [0.70, 0.30],
        "coverage_min": "synergy",
    },
    {
        "key": "movement_3pt",
        "cluster": SHOOTING,
        "name": "3PT Movement",
        "inputs": [
            {"key": "mov_3p_pct",  "thresholds": [(90, 0.40), (80, 0.35), (70, 0.30), (60, 0.25)], "lower_is_better": False},
            {"key": "mov_3pa_pg",  "thresholds": [(90, 2.5),  (80, 1.5),  (70, 0.8),  (60, 0.4)],  "lower_is_better": False},
        ],
        "weights": [0.70, 0.30],
        "coverage_min": "synergy",
    },
    {
        "key": "pull_up_3pt",
        "cluster": SHOOTING,
        "name": "3PT Pull-Up",
        "inputs": [
            {"key": "otd_3p_pct",  "thresholds": [(90, 0.38), (80, 0.33), (70, 0.28), (60, 0.23)], "lower_is_better": False},
            {"key": "otd_3pa_pg",  "thresholds": [(90, 3.0),  (80, 2.0),  (70, 1.2),  (60, 0.5)],  "lower_is_better": False},
        ],
        "weights": [0.65, 0.35],
        "coverage_min": "synergy",
    },
    {
        "key": "deep_range_3pt",
        "cluster": SHOOTING,
        "name": "3PT Deep Range",
        "inputs": [
            {"key": "deep_3p_pct",  "thresholds": [(90, 0.38), (80, 0.33), (70, 0.28), (60, 0.22)], "lower_is_better": False},
            {"key": "deep_3pa_pg",  "thresholds": [(90, 2.0),  (80, 1.2),  (70, 0.6),  (60, 0.3)],  "lower_is_better": False},
        ],
        "weights": [0.65, 0.35],
        "coverage_min": "synergy",
    },
    {
        "key": "midrange_shotmaking",
        "cluster": SHOOTING,
        "name": "Midrange Shotmaking",
        "inputs": [
            {"key": "cs_mid_pct",   "thresholds": [(90, 0.50), (80, 0.44), (70, 0.38), (60, 0.32)], "lower_is_better": False},
            {"key": "mid_att_pg",   "thresholds": [(90, 4.0),  (80, 2.5),  (70, 1.5),  (60, 0.8)],  "lower_is_better": False},
        ],
        "weights": [0.65, 0.35],
        "coverage_min": "synergy",
    },
    {
        "key": "free_throw",
        "cluster": SHOOTING,
        "name": "Free Throw",
        "inputs": [
            {"key": "ft_pct",  "thresholds": [(90, 0.82), (80, 0.75), (70, 0.68), (60, 0.60)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "box_score",
    },

    # ─────────────────────────────────────────────────────────────────────
    # FINISHING (6 traits)
    # ─────────────────────────────────────────────────────────────────────
    {
        "key": "rim_pressure",
        "cluster": FINISHING,
        "name": "Rim Pressure",
        "inputs": [
            {"key": "rim_fg_pct",   "thresholds": [(90, 0.68), (80, 0.62), (70, 0.56), (60, 0.50)], "lower_is_better": False},
            {"key": "rim_att_pg",   "thresholds": [(90, 5.0),  (80, 3.5),  (70, 2.0),  (60, 1.0)],  "lower_is_better": False},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "synergy",
    },
    {
        "key": "contact_finishing",
        "cluster": FINISHING,
        "name": "Contact Finishing",
        "inputs": [
            {"key": "contact_fg_pct",   "thresholds": [(90, 0.60), (80, 0.53), (70, 0.46), (60, 0.38)], "lower_is_better": False},
            {"key": "contact_att_pg",   "thresholds": [(90, 4.0),  (80, 2.5),  (70, 1.5),  (60, 0.8)],  "lower_is_better": False},
        ],
        "weights": [0.65, 0.35],
        "coverage_min": "synergy",
    },
    {
        "key": "touch_craft",
        "cluster": FINISHING,
        "name": "Touch / Craft",
        "inputs": [
            {"key": "floater_pct",   "thresholds": [(90, 0.50), (80, 0.42), (70, 0.35), (60, 0.28)], "lower_is_better": False},
            {"key": "floater_att_pg","thresholds": [(90, 2.5),  (80, 1.5),  (70, 0.8),  (60, 0.4)],  "lower_is_better": False},
        ],
        "weights": [0.65, 0.35],
        "coverage_min": "synergy",
    },
    {
        "key": "foul_draw",
        "cluster": FINISHING,
        "name": "Foul Draw",
        "inputs": [
            {"key": "fta_per_drive",  "thresholds": [(90, 0.55), (80, 0.42), (70, 0.30), (60, 0.20)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "box_score",  # FTA/FGA ratio is a valid box_score proxy
    },
    {
        "key": "vertical_finishing",
        "cluster": FINISHING,
        "name": "Vertical Finishing",
        "inputs": [
            {"key": "dunk_pct",   "thresholds": [(90, 0.82), (80, 0.74), (70, 0.64), (60, 0.54)], "lower_is_better": False},
            {"key": "dunk_att_pg","thresholds": [(90, 3.0),  (80, 2.0),  (70, 1.0),  (60, 0.5)],  "lower_is_better": False},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "synergy",
    },
    {
        "key": "transition_finishing",
        "cluster": FINISHING,
        "name": "Transition Finishing",
        "inputs": [
            {"key": "trans_fg_pct",   "thresholds": [(90, 0.65), (80, 0.58), (70, 0.52), (60, 0.45)], "lower_is_better": False},
            {"key": "trans_att_pg",   "thresholds": [(90, 3.0),  (80, 2.0),  (70, 1.2),  (60, 0.5)],  "lower_is_better": False},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "synergy",
    },

    # ─────────────────────────────────────────────────────────────────────
    # PLAYMAKING (7 traits)
    # ─────────────────────────────────────────────────────────────────────
    {
        "key": "advantage_creation",
        "cluster": PLAYMAKING,
        "name": "Advantage Creation",
        "inputs": [
            {"key": "pnr_ppp",        "thresholds": [(90, 0.98), (80, 0.90), (70, 0.82), (60, 0.74)], "lower_is_better": False},
            {"key": "iso_ppp",        "thresholds": [(90, 0.95), (80, 0.88), (70, 0.80), (60, 0.72)], "lower_is_better": False},
        ],
        "weights": [0.55, 0.45],
        "coverage_min": "synergy",
    },
    {
        "key": "passing_vision",
        "cluster": PLAYMAKING,
        "name": "Passing Vision",
        "inputs": [
            {"key": "potential_ast_pg",  "thresholds": [(90, 12.0), (80, 8.5), (70, 5.5), (60, 3.5)], "lower_is_better": False},
            {"key": "ast_adj_pg",        "thresholds": [(90, 7.0),  (80, 5.0), (70, 3.5), (60, 2.0)], "lower_is_better": False},
        ],
        "weights": [0.55, 0.45],
        "coverage_min": "box_score",  # AST/G proxy: valid at box_score
    },
    {
        "key": "passing_execution",
        "cluster": PLAYMAKING,
        "name": "Passing Execution",
        "inputs": [
            {"key": "on_target_pass_pct",  "thresholds": [(90, 0.92), (80, 0.87), (70, 0.82), (60, 0.76)], "lower_is_better": False},
            {"key": "pass_att_pg",         "thresholds": [(90, 45.0),(80, 35.0), (70, 25.0), (60, 18.0)],  "lower_is_better": False},
        ],
        "weights": [0.65, 0.35],
        "coverage_min": "tracking",
    },
    {
        "key": "advantage_passing",
        "cluster": PLAYMAKING,
        "name": "Advantage Passing",
        "inputs": [
            {"key": "dk_pass_rate",  "thresholds": [(90, 0.30), (80, 0.22), (70, 0.15), (60, 0.09)], "lower_is_better": False},
            {"key": "dk_pass_pg",    "thresholds": [(90, 4.5),  (80, 3.0),  (70, 1.8),  (60, 0.8)],  "lower_is_better": False},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "synergy",
    },
    {
        "key": "transition_playmaking",
        "cluster": PLAYMAKING,
        "name": "Transition Playmaking",
        "inputs": [
            {"key": "trans_ast_rate",  "thresholds": [(90, 0.35), (80, 0.25), (70, 0.16), (60, 0.08)], "lower_is_better": False},
            {"key": "trans_ast_pg",    "thresholds": [(90, 3.0),  (80, 2.0),  (70, 1.2),  (60, 0.5)],  "lower_is_better": False},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "synergy",
    },
    {
        "key": "ball_security",
        "cluster": PLAYMAKING,
        "name": "Ball Security",
        "inputs": [
            {"key": "tov_per_100_touches",  "thresholds": [(90, 2.5), (80, 3.6), (70, 5.0), (60, 6.8)], "lower_is_better": True},
            {"key": "pass_tov_rate",        "thresholds": [(90, 0.025),(80, 0.036),(70, 0.050),(60, 0.068)], "lower_is_better": True},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "tracking",
    },
    {
        "key": "connector_creation",
        "cluster": PLAYMAKING,
        "name": "Connector Creation",
        "inputs": [
            {"key": "screen_ast_pg",     "thresholds": [(90, 2.0), (80, 1.3), (70, 0.8), (60, 0.4)], "lower_is_better": False},
            {"key": "hockey_ast_pg",     "thresholds": [(90, 2.2), (80, 1.4), (70, 0.8), (60, 0.4)], "lower_is_better": False},
        ],
        "weights": None,
        "combine": "min",
        "coverage_min": "synergy",
    },

    # ─────────────────────────────────────────────────────────────────────
    # POA DEFENSE (7 traits)
    # ─────────────────────────────────────────────────────────────────────
    {
        "key": "containment",
        "cluster": POA_DEFENSE,
        "name": "Containment",
        "inputs": [
            {"key": "blow_by_rate",          "thresholds": [(90, 0.10), (80, 0.15), (70, 0.20), (60, 0.26)], "lower_is_better": True},
            {"key": "paint_touch_rate_allowed","thresholds": [(90, 0.28), (80, 0.34), (70, 0.40), (60, 0.47)], "lower_is_better": True},
        ],
        "weights": [0.55, 0.45],
        "coverage_min": "tracking",
    },
    {
        "key": "screen_navigation",
        "cluster": POA_DEFENSE,
        "name": "Screen Navigation",
        "inputs": [
            {"key": "screen_adv_rate_allowed",  "thresholds": [(90, 0.20), (80, 0.27), (70, 0.34), (60, 0.42)], "lower_is_better": True},
            {"key": "sep_at_0_8s",              "thresholds": [(90, 2.2),  (80, 2.7),  (70, 3.2),  (60, 3.8)],  "lower_is_better": True},
        ],
        "weights": [0.55, 0.45],
        "coverage_min": "tracking",
    },
    {
        "key": "ball_pressure",
        "cluster": POA_DEFENSE,
        "name": "Ball Pressure",
        "inputs": [
            {"key": "forced_pickup_rate",       "thresholds": [(90, 0.14), (80, 0.10), (70, 0.07), (60, 0.04)], "lower_is_better": False},
            {"key": "on_ball_deflection_rate",  "thresholds": [(90, 0.22), (80, 0.17), (70, 0.12), (60, 0.08)], "lower_is_better": False},
        ],
        "weights": [0.50, 0.50],
        "coverage_min": "tracking",
    },
    {
        "key": "closeout_recovery",
        "cluster": POA_DEFENSE,
        "name": "Closeout & Recovery",
        "inputs": [
            {"key": "perim_efg_allowed",         "thresholds": [(90, 0.44), (80, 0.48), (70, 0.52), (60, 0.56)], "lower_is_better": True},
            {"key": "contested_shot_rate",        "thresholds": [(90, 0.55), (80, 0.47), (70, 0.39), (60, 0.31)], "lower_is_better": False},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "tracking",
    },
    {
        "key": "deflections",
        "cluster": POA_DEFENSE,
        "name": "Deflections",
        "inputs": [
            {"key": "defl_per_def_poss",  "thresholds": [(90, 0.25), (80, 0.19), (70, 0.14), (60, 0.09)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "tracking",
    },
    {
        "key": "steal_timing",
        "cluster": POA_DEFENSE,
        "name": "Steal Timing",
        "inputs": [
            {"key": "stl_per_100_def_poss",  "thresholds": [(90, 3.5), (80, 2.7), (70, 2.0), (60, 1.3)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "box_score",  # STL/G → per-100 proxy valid at box_score
    },
    {
        "key": "poa_foul_discipline",
        "cluster": POA_DEFENSE,
        "name": "Foul Discipline (POA)",
        "inputs": [
            {"key": "perim_fouls_per_100",  "thresholds": [(90, 2.6), (80, 3.4), (70, 4.3), (60, 5.3)], "lower_is_better": True},
        ],
        "weights": [1.0],
        "coverage_min": "box_score",  # PF/G → per-100 proxy
    },

    # ─────────────────────────────────────────────────────────────────────
    # TEAM DEFENSE (7 traits)
    # ─────────────────────────────────────────────────────────────────────
    {
        "key": "help_rotation",
        "cluster": TEAM_DEFENSE,
        "name": "Help & Rotation",
        "inputs": [
            {"key": "help_rotations_pg",  "thresholds": [(90, 6.0), (80, 4.5), (70, 3.0), (60, 1.8)], "lower_is_better": False},
            {"key": "help_stops_pg",      "thresholds": [(90, 3.5), (80, 2.5), (70, 1.6), (60, 0.8)], "lower_is_better": False},
        ],
        "weights": [0.50, 0.50],
        "coverage_min": "tracking",
    },
    {
        "key": "rim_protection",
        "cluster": TEAM_DEFENSE,
        "name": "Rim Protection",
        "inputs": [
            {"key": "blk_att_pg",  "thresholds": [(90, 3.0), (80, 2.0), (70, 1.2), (60, 0.6)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "box_score",  # BLK/G proxy
    },
    {
        "key": "closeout_execution",
        "cluster": TEAM_DEFENSE,
        "name": "Closeout Execution",
        "inputs": [
            {"key": "closeout_quality",  "thresholds": [(90, 0.78), (80, 0.68), (70, 0.58), (60, 0.48)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "tracking",
    },
    {
        "key": "off_ball_positioning",
        "cluster": TEAM_DEFENSE,
        "name": "Off-Ball Positioning",
        "inputs": [
            {"key": "denied_catch_rate",  "thresholds": [(90, 0.28), (80, 0.21), (70, 0.15), (60, 0.09)], "lower_is_better": False},
            {"key": "sep_at_catch",       "thresholds": [(90, 2.0),  (80, 2.4),  (70, 2.8),  (60, 3.3)],  "lower_is_better": True},
        ],
        "weights": [0.55, 0.45],
        "coverage_min": "tracking",
    },
    {
        "key": "communication_qb",
        "cluster": TEAM_DEFENSE,
        "name": "Communication & QB",
        "inputs": [
            {"key": "defensive_qb_score",  "thresholds": [(90, 85.0), (80, 72.0), (70, 60.0), (60, 48.0)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "tracking",
    },
    {
        "key": "versatility",
        "cluster": TEAM_DEFENSE,
        "name": "Versatility (Switching)",
        "inputs": [
            {"key": "switch_success_rate",   "thresholds": [(90, 0.72), (80, 0.62), (70, 0.52), (60, 0.42)], "lower_is_better": False},
            {"key": "positions_guarded",     "thresholds": [(90, 4.0),  (80, 3.0),  (70, 2.0),  (60, 1.5)],  "lower_is_better": False},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "tracking",
    },
    {
        "key": "team_foul_discipline",
        "cluster": TEAM_DEFENSE,
        "name": "Team Foul Discipline",
        "inputs": [
            {"key": "int_fouls_per_100",  "thresholds": [(90, 2.0), (80, 3.0), (70, 4.2), (60, 5.5)], "lower_is_better": True},
        ],
        "weights": [1.0],
        "coverage_min": "box_score",  # PF/G proxy (interior + perimeter combined)
    },

    # ─────────────────────────────────────────────────────────────────────
    # REBOUNDING (5 traits)
    # ─────────────────────────────────────────────────────────────────────
    {
        "key": "defensive_rebounding",
        "cluster": REBOUNDING,
        "name": "Defensive Rebounding",
        "inputs": [
            {"key": "dreb_pct",  "thresholds": [(90, 0.28), (80, 0.23), (70, 0.18), (60, 0.13)], "lower_is_better": False},
            {"key": "dreb_pg",   "thresholds": [(90, 7.5),  (80, 5.5),  (70, 3.8),  (60, 2.5)],  "lower_is_better": False},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "box_score",
    },
    {
        "key": "offensive_rebounding",
        "cluster": REBOUNDING,
        "name": "Offensive Rebounding",
        "inputs": [
            {"key": "oreb_pct",  "thresholds": [(90, 0.14), (80, 0.10), (70, 0.07), (60, 0.04)], "lower_is_better": False},
            {"key": "oreb_pg",   "thresholds": [(90, 3.2),  (80, 2.2),  (70, 1.4),  (60, 0.7)],  "lower_is_better": False},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "box_score",
    },
    {
        "key": "box_out",
        "cluster": REBOUNDING,
        "name": "Box-Out",
        "inputs": [
            {"key": "opp_oreb_pct_on_floor",  "thresholds": [(90, 0.18), (80, 0.22), (70, 0.26), (60, 0.30)], "lower_is_better": True},
            {"key": "box_outs_pg",            "thresholds": [(90, 6.0),  (80, 4.0),  (70, 2.5),  (60, 1.2)],  "lower_is_better": False},
        ],
        "weights": [0.65, 0.35],
        "coverage_min": "tracking",
    },
    {
        "key": "rebound_range",
        "cluster": REBOUNDING,
        "name": "Rebound Range",
        "inputs": [
            {"key": "ooa_reb_pg",      "thresholds": [(90, 2.5), (80, 1.6), (70, 1.0), (60, 0.5)], "lower_is_better": False},
            {"key": "avg_reb_dist_ft", "thresholds": [(90, 10.0),(80, 7.0), (70, 5.0), (60, 3.0)], "lower_is_better": False},
        ],
        "weights": [0.50, 0.50],
        "coverage_min": "tracking",
    },
    {
        "key": "hands",
        "cluster": REBOUNDING,
        "name": "Hands / Secure",
        "inputs": [
            {"key": "secure_reb_pct",  "thresholds": [(90, 0.85), (80, 0.78), (70, 0.70), (60, 0.62)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "tracking",
    },
    {
        "key": "second_jump_tip",
        "cluster": REBOUNDING,
        "name": "Second-Jump / Tip Ability",
        # Box-score proxy: avg of OREB/G + BLK/G captures tip/vertical activity
        "inputs": [
            {"key": "tip_activity",  "thresholds": [(90, 2.2), (80, 1.5), (70, 0.9), (60, 0.5)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "box_score",
    },

    # ─────────────────────────────────────────────────────────────────────
    # TOOLS (8 traits — v4.0 adds strength, motor, endurance)
    # ─────────────────────────────────────────────────────────────────────
    {
        "key": "height",
        "cluster": TOOLS,
        "name": "Height",
        # Height in inches → band score (always available as bio stat)
        "inputs": [
            {"key": "height_inches",  "thresholds": [(90, 84), (80, 80), (70, 77), (60, 74)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "box_score",
    },
    {
        "key": "length",
        "cluster": TOOLS,
        "name": "Length / Wingspan",
        "inputs": [
            {"key": "wingspan_inches",  "thresholds": [(90, 88), (80, 84), (70, 80), (60, 76)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "tracking",  # wingspan not in box score DB
    },
    {
        "key": "speed",
        "cluster": TOOLS,
        "name": "Speed",
        "inputs": [
            {"key": "peak_offball_mph",  "thresholds": [(90, 19.0), (80, 18.0), (70, 17.0), (60, 16.0)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "tracking",
    },
    {
        "key": "lateral_quickness",
        "cluster": TOOLS,
        "name": "Lateral Quickness",
        "inputs": [
            {"key": "containment_pct",   "thresholds": [(90, 0.70), (80, 0.60), (70, 0.50), (60, 0.40)], "lower_is_better": False},
            {"key": "lateral_ft_per_s",  "thresholds": [(90, 12.5),(80, 11.5), (70, 10.5), (60, 9.5)],  "lower_is_better": False},
        ],
        "weights": [0.55, 0.45],
        "coverage_min": "tracking",
    },
    {
        "key": "vertical_pop",
        "cluster": TOOLS,
        "name": "Vertical Pop",
        "inputs": [
            {"key": "max_live_vert_in",     "thresholds": [(90, 36.0), (80, 32.0), (70, 28.0), (60, 24.0)], "lower_is_better": False},
            {"key": "second_jump_time_s",   "thresholds": [(90, 0.45), (80, 0.55), (70, 0.65), (60, 0.75)], "lower_is_better": True},
        ],
        "weights": [0.60, 0.40],
        "coverage_min": "tracking",
    },
    {
        "key": "strength",
        "cluster": TOOLS,
        "name": "Strength / Frame",
        # Box-score proxy: body weight as physical frame indicator
        "inputs": [
            {"key": "weight_lbs",  "thresholds": [(90, 240), (80, 220), (70, 200), (60, 180)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "box_score",
    },
    {
        "key": "motor",
        "cluster": TOOLS,
        "name": "Motor / Hustle",
        # Box-score proxy: (STL + BLK) per game captures on-floor effort activity
        "inputs": [
            {"key": "motor_proxy",  "thresholds": [(90, 3.5), (80, 2.5), (70, 1.8), (60, 1.2)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "box_score",
    },
    {
        "key": "endurance",
        "cluster": TOOLS,
        "name": "Endurance / Stamina",
        # Box-score proxy: average minutes per game over season
        "inputs": [
            {"key": "endurance_proxy",  "thresholds": [(90, 34.0), (80, 29.0), (70, 24.0), (60, 19.0)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "box_score",
    },

    # ─────────────────────────────────────────────────────────────────────
    # IQ (7 traits — v4.0 adds correct_read_rate, turnover_decision_quality,
    #     advantage_conversion; ALL IQ traits now require synergy+ coverage)
    # ─────────────────────────────────────────────────────────────────────
    {
        "key": "decision_speed",
        "cluster": IQ,
        "name": "Decision Speed",
        "inputs": [
            {"key": "avg_decision_time_s",  "thresholds": [(90, 0.80), (80, 1.00), (70, 1.20), (60, 1.40)], "lower_is_better": True},
        ],
        "weights": [1.0],
        "coverage_min": "tracking",
    },
    {
        "key": "correct_read_rate",
        "cluster": IQ,
        "name": "Correct Read Rate",
        "inputs": [
            {"key": "correct_read_pct",  "thresholds": [(90, 0.85), (80, 0.75), (70, 0.65), (60, 0.55)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "synergy",
    },
    {
        "key": "shot_selection",
        "cluster": IQ,
        "name": "Shot Selection Quality",
        "inputs": [
            {"key": "efg_pct",  "thresholds": [(90, 0.58), (80, 0.52), (70, 0.48), (60, 0.44)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "barttorvik",  # EFG% from Barttorvik (D1 only); synergy for non-D1
    },
    {
        "key": "turnover_decision_quality",
        "cluster": IQ,
        "name": "Turnover Decision Quality",
        "inputs": [
            {"key": "ast_to",  "thresholds": [(90, 4.0), (80, 2.8), (70, 2.0), (60, 1.4)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "barttorvik",  # AST/TO from Barttorvik (D1 only)
    },
    {
        "key": "advantage_conversion",
        "cluster": IQ,
        "name": "Advantage Conversion",
        "inputs": [
            {"key": "late_adv_conv_pct",  "thresholds": [(90, 0.75), (80, 0.65), (70, 0.55), (60, 0.45)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "synergy",
    },
    {
        "key": "role_discipline",
        "cluster": IQ,
        "name": "Role Discipline",
        "inputs": [
            {"key": "started_pct",  "thresholds": [(90, 0.85), (80, 0.70), (70, 0.50), (60, 0.30)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "synergy",  # No GS column in Barttorvik — requires synergy
    },
    {
        "key": "processing_under_pressure",
        "cluster": IQ,
        "name": "Processing Under Pressure",
        "inputs": [
            {"key": "late_game_ast_to",  "thresholds": [(90, 4.0), (80, 2.8), (70, 2.0), (60, 1.4)], "lower_is_better": False},
        ],
        "weights": [1.0],
        "coverage_min": "synergy",
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
_COVERAGE_RANK = {"box_score": 0, "barttorvik": 1, "synergy": 2, "tracking": 3}


def coverage_meets(player_coverage: str, trait_min: str) -> bool:
    return _COVERAGE_RANK.get(player_coverage, 0) >= _COVERAGE_RANK.get(trait_min, 0)


# ═══════════════════════════════════════════════════════════════════════════
# Trait Scoring
# ═══════════════════════════════════════════════════════════════════════════

def score_trait(trait_def: dict, player_inputs: dict[str, float | None]) -> int | None:
    """
    Score a single trait given player inputs.

    Handles partial inputs: re-normalizes weights for available inputs.
    Returns None only if ALL required inputs are missing.
    """
    combine = trait_def.get("combine", "weighted")
    inputs  = trait_def["inputs"]
    weights = trait_def.get("weights")

    bands: list[int] = []
    available_weights: list[float] = []

    for i, inp_def in enumerate(inputs):
        raw_val = player_inputs.get(inp_def["key"])
        if raw_val is None:
            continue
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

    if available_weights:
        total_w = sum(available_weights)
        if total_w > 0:
            return round(sum((w / total_w) * b for w, b in zip(available_weights, bands)))

    return round(sum(bands) / len(bands))


def score_all_traits(
    player_inputs: dict[str, float | None],
    coverage_tier: str = "box_score",
) -> dict[str, int | None]:
    """
    Score all 54 traits.  Returns dict: trait_key → score (int) or None (UNSCORED).
    """
    results: dict[str, int | None] = {}
    for tdef in TRAIT_DEFS:
        if not coverage_meets(coverage_tier, tdef["coverage_min"]):
            # Coverage too low to score this trait
            results[tdef["key"]] = None
        else:
            results[tdef["key"]] = score_trait(tdef, player_inputs)
    return results
