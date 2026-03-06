"""
Archetype Library — College v1

Source: Archetype Library (2).pdf
21 archetypes with Must-Haves (ALL), Supports (N of M), Auto-Disqualifiers (ANY).

Archetypes are descriptive (how a player tends to contribute), not evaluative.
They do NOT change KR scores. A player may qualify for 0, 1, or many archetypes.

Trait references use our trait_key system where possible.
Some archetype criteria reference composite/derived concepts (prefixed with '$')
that require additional evaluation logic beyond individual traits.
"""
from __future__ import annotations


# ═══════════════════════════════════════════════════════════════════════════
# Archetype Definitions
# ═══════════════════════════════════════════════════════════════════════════
#
# Each archetype:
#   key: unique identifier
#   name: display name
#   identity: short description
#   must_haves: [(trait_key, min_score)] — ALL must be met
#   supports: [(trait_key, min_score)] — N of M must be met
#   supports_required: int — how many supports must be met
#   disqualifiers: [str] — descriptive labels for disqualification conditions

ARCHETYPE_DEFS: list[dict] = [
    {
        "key": "two_way_wing",
        "name": "Two-Way Wing",
        "identity": "Scales on both ends. Can stay on the floor in most lineups.",
        "must_haves": [
            ("spot_up_3pt", 70),
            ("on_ball_containment", 70),
            ("lateral_quickness", 70),
        ],
        "supports": [
            ("screen_navigation", 65),
            ("$team_defense", 65),
            ("movement_3pt", 65),
            ("defensive_rebounding", 60),
        ],
        "supports_required": 2,
        "disqualifiers": ["range_gap_major", "defensive_target_major", "severe_undersize"],
    },
    {
        "key": "3_and_d_wing",
        "name": "3-and-D Wing",
        "identity": "Spacing + reliable defense. Low-creation, high trust.",
        "must_haves": [
            ("spot_up_3pt", 75),
            ("perimeter_shot_contest", 70),
            ("$team_defense", 70),
        ],
        "supports": [
            ("on_ball_containment", 65),
            ("screen_navigation", 65),
            ("$closeout_discipline", 65),
            ("$motor", 65),
        ],
        "supports_required": 2,
        "disqualifiers": ["no_gravity_major", "foul_machine_major", "switch_liability_major"],
    },
    {
        "key": "poa_defender_guard",
        "name": "POA Defender Guard",
        "identity": "Defense-first guard who can take the toughest assignment.",
        "must_haves": [
            ("on_ball_containment", 75),
            ("screen_navigation", 70),
            ("lateral_quickness", 75),
        ],
        "supports": [
            ("ball_pressure", 65),
            ("perimeter_disruption", 65),
            ("$motor", 65),
            ("$transition_defense", 60),
        ],
        "supports_required": 2,
        "disqualifiers": ["foul_machine_major", "decision_making_collapse", "severe_undersize"],
    },
    {
        "key": "primary_ball_handler",
        "name": "Primary Ball-Handler (Offense-First)",
        "identity": "Usage engine. Creates advantages; defense is secondary.",
        "must_haves": [
            ("passing_vision", 75),
            ("ball_security", 70),
            ("$otd_shooting", 70),  # Off-Dribble Shooting (2PT or 3PT) — max of otd_3pt, 2pt_jumper_otd
        ],
        "supports": [
            ("otd_3pt", 65),
            ("drive_and_kick", 65),
            ("free_throw", 75),
            ("$pace_control", 65),
        ],
        "supports_required": 2,
        "disqualifiers": ["turnover_risk_major", "severe_pullup_void", "defensive_target_AND_no_gravity"],
    },
    {
        "key": "switchable_defender_wing",
        "name": "Switchable Defender Wing",
        "identity": "Defense-first wing who can credibly switch across positions.",
        "must_haves": [
            ("lateral_quickness", 75),
            ("screen_navigation", 70),
            ("on_ball_containment", 70),
        ],
        "supports": [
            ("$length_wingspan", 65),
            ("strength_functional", 65),
            ("$team_defense", 65),
            ("$motor", 65),
        ],
        "supports_required": 2,
        "disqualifiers": ["switch_liability_major", "foul_machine_major", "severe_undersize"],
    },
    {
        "key": "anchor_big",
        "name": "Anchor Big",
        "identity": "Paint controller; drop coverage backbone.",
        "must_haves": [
            ("$rim_protection", 75),  # block or rim_deterrence
            ("$paint_deterrence", 70),
            ("defensive_rebounding", 70),
        ],
        "supports": [
            ("post_defense", 65),
            ("help_defense_interior", 65),
            ("vertical_contest", 65),
            ("$foul_discipline", 60),
        ],
        "supports_required": 2,
        "disqualifiers": ["mobility_floor_violation", "switch_liability_major", "fragility_major"],
    },
    {
        "key": "stretch_big",
        "name": "Stretch Big",
        "identity": "Spacing big; offense via gravity, defense via positioning.",
        "must_haves": [
            ("spot_up_3pt", 70),
            ("free_throw", 75),
            ("$team_defense", 65),
        ],
        "supports": [
            ("$pick_and_pop", 65),
            ("screen_assist_creation", 60),
            ("defensive_rebounding", 60),
            ("$closeout_discipline", 60),
        ],
        "supports_required": 2,
        "disqualifiers": ["no_gravity_major", "range_gap_major", "defensive_target_major"],
    },
    {
        "key": "connector_guard",
        "name": "Connector Guard",
        "identity": "Low-usage organizer; keeps offense and defense coherent.",
        "must_haves": [
            ("passing_accuracy", 75),
            ("$decision_speed", 70),
            ("ball_security", 70),
        ],
        "supports": [
            ("$team_defense", 65),
            ("hockey_assist_creation", 60),
            ("screen_assist_creation", 60),
            ("$motor", 65),
        ],
        "supports_required": 2,
        "disqualifiers": ["decision_making_collapse", "turnover_risk_major", "defensive_target_major"],
    },
    {
        "key": "offensive_wing_scorer",
        "name": "Offensive Wing Scorer",
        "identity": "Shot-creation wing; offense drives value, defense is managed.",
        "must_haves": [
            ("$otd_shooting", 75),
            ("$shot_creation_volume", 70),
            ("free_throw", 75),
        ],
        "supports": [
            ("otd_3pt", 65),
            ("power_through_contact", 65),
            ("$advantage_creation", 65),
            ("movement_3pt", 60),
        ],
        "supports_required": 2,
        "disqualifiers": ["severe_pullup_void", "decision_making_collapse", "defensive_target_AND_no_gravity"],
    },
    {
        "key": "gap_team_defender_wing",
        "name": "Gap / Team Defender Wing",
        "identity": "IQ-driven defender; wins with positioning and communication.",
        "must_haves": [
            ("$team_defense", 75),
            ("$closeout_discipline", 70),
            ("$help_defense_perimeter", 70),
        ],
        "supports": [
            ("$anticipation_disruption", 65),
            ("defensive_rebounding", 60),
            ("$motor", 65),
            ("$communication", 65),
        ],
        "supports_required": 2,
        "disqualifiers": ["low_motor_major", "containment_slippage_major", "$decision_speed_below_60"],
    },
    {
        "key": "mobile_defensive_big",
        "name": "Mobile Defensive Big",
        "identity": "Big who survives space; P&R defender more than paint anchor.",
        "must_haves": [
            ("roll_man_defense", 70),
            ("lateral_quickness", 65),
            ("help_defense_interior", 70),
        ],
        "supports": [
            ("$rim_protection", 65),
            ("vertical_contest", 65),
            ("screen_navigation", 60),
            ("defensive_rebounding", 60),
        ],
        "supports_required": 2,
        "disqualifiers": ["switch_liability_major", "mobility_floor_violation", "foul_machine_major"],
    },
    {
        "key": "chaos_disruptor_wing",
        "name": "Chaos Disruptor Wing",
        "identity": "High-activity, high-variance defender; creates disorder.",
        "must_haves": [
            ("steal", 75),
            ("$motor", 75),
            ("$anticipation", 70),
        ],
        "supports": [
            ("ball_pressure", 65),
            ("$passing_lane_defense", 65),
            ("$transition_defense", 60),
            ("$recovery_speed", 60),
        ],
        "supports_required": 2,
        "disqualifiers": ["poor_discipline_major", "decision_making_collapse", "foul_machine_major"],
    },
    {
        "key": "point_forward",
        "name": "Point Forward",
        "identity": "Size-based secondary creator; offense flows through them.",
        "must_haves": [
            ("passing_vision", 70),
            ("ball_security", 70),
            ("$advantage_creation_nonguard", 65),
        ],
        "supports": [
            ("$handle_security_pressure", 65),
            ("passing_accuracy", 65),
            ("$team_defense", 65),
            ("spot_up_3pt", 60),
        ],
        "supports_required": 2,
        "disqualifiers": ["turnover_risk_major", "decision_making_collapse", "severe_pullup_void"],
    },
    {
        "key": "utility_forward",
        "name": "Utility Forward",
        "identity": "Lineup glue; fills gaps without being a focal point.",
        "must_haves": [
            ("$team_defense", 70),
            ("$motor", 70),
            ("ball_security", 65),
        ],
        "supports": [
            ("screen_assist_creation", 60),
            ("defensive_rebounding", 60),
            ("spot_up_3pt", 60),
            ("passing_accuracy", 60),
        ],
        "supports_required": 2,
        "disqualifiers": ["low_motor_major", "role_collapse_major", "defensive_target_major"],
    },
    {
        "key": "roll_man_vertical_threat",
        "name": "Roll Man / Vertical Threat",
        "identity": "Creates offensive gravity via rim pressure; finishes plays.",
        "must_haves": [
            ("dunk_finishing", 75),
            ("$roll_man_efficiency", 70),
            ("$screen_quality", 65),
        ],
        "supports": [
            ("offensive_rebounding", 60),
            ("foul_draw_rate", 60),
            ("vertical_pop", 65),
            ("$short_roll_passing", 60),
        ],
        "supports_required": 2,
        "disqualifiers": ["poor_hands_major", "foul_machine_major", "fragility_major"],
    },
    {
        "key": "offensive_big",
        "name": "Offensive Big (Defense Liability)",
        "identity": "Offense-first interior scorer; requires protection.",
        "must_haves": [
            ("$post_scoring", 75),
            ("close_finishing", 70),
            ("free_throw", 70),
        ],
        "supports": [
            ("offensive_rebounding", 60),
            ("$passing_out_of_post", 60),
            ("screen_assist_creation", 60),
            ("foul_draw_rate", 65),
        ],
        "supports_required": 2,
        "disqualifiers": ["defensive_target_major", "switch_liability_major", "mobility_floor_violation"],
    },
    {
        "key": "situational_shooter",
        "name": "Situational Shooter (Specialist)",
        "identity": "One-job player: spacing. Limited elsewhere.",
        "must_haves": [
            ("spot_up_3pt", 80),
            ("$cs_volume", 70),
            ("$shot_prep_speed", 65),
        ],
        "supports": [
            ("movement_3pt", 65),
            ("free_throw", 80),
            ("$offball_relocation", 60),
        ],
        "supports_required": 2,
        "disqualifiers": ["no_gravity_major", "defensive_target_major", "low_motor_major"],
    },
    {
        "key": "defensive_specialist",
        "name": "Defensive Specialist (Non-Scoring)",
        "identity": "Defense-only contributor; offense minimized.",
        "must_haves": [
            ("on_ball_containment", 75),
            ("screen_navigation", 70),
            ("$team_defense", 70),
        ],
        "supports": [
            ("lateral_quickness", 70),
            ("$motor", 70),
            ("$disruption_deflections", 65),
        ],
        "supports_required": 2,
        "disqualifiers": ["foul_machine_major", "decision_making_collapse", "severe_undersize"],
    },
    {
        "key": "energy_big",
        "name": "Energy Big",
        "identity": "Bench impact via effort, rebounding, rim pressure.",
        "must_haves": [
            ("$motor", 75),
            ("offensive_rebounding", 70),
            ("defensive_rebounding", 65),
        ],
        "supports": [
            ("vertical_pop", 65),
            ("$screen_quality", 60),
            ("$rim_protection", 60),
        ],
        "supports_required": 2,
        "disqualifiers": ["fragility_major", "poor_hands_major", "foul_machine_major"],
    },
    {
        "key": "situational_ball_handler",
        "name": "Situational Ball-Handler (Bench Guard)",
        "identity": "Secondary handler; stabilizes units without full creation load.",
        "must_haves": [
            ("ball_security", 75),
            ("passing_accuracy", 70),
            ("$decision_speed", 70),
        ],
        "supports": [
            ("spot_up_3pt", 60),
            ("drive_and_kick", 60),
            ("$team_defense", 60),
        ],
        "supports_required": 2,
        "disqualifiers": ["turnover_risk_major", "decision_making_collapse", "defensive_target_major"],
    },
    {
        "key": "developmental_prospect",
        "name": "Developmental Prospect",
        "identity": "Tools > production; projection archetype.",
        "must_haves": [
            ("$physical_tools_composite", 70),
            ("$one_offensive_trait", 70),
            ("$one_defensive_trait", 70),
        ],
        "supports": [
            ("$motor", 65),
            ("$coachability", 60),
            ("$improvement_trend", 0),
            ("$role_adaptability", 60),
        ],
        "supports_required": 2,
        "disqualifiers": ["fragility_major", "severe_iq_collapse", "multi_category_system_risks"],
    },
]

ARCHETYPE_BY_KEY: dict[str, dict] = {a["key"]: a for a in ARCHETYPE_DEFS}


# ═══════════════════════════════════════════════════════════════════════════
# Archetype Evaluation
# ═══════════════════════════════════════════════════════════════════════════

def _get_trait_score(
    trait_ref: str,
    trait_scores: dict[str, int | None],
    cluster_scores: dict[str, float | None] = None,
) -> int | None:
    """
    Resolve a trait reference to a score.

    Direct trait keys (e.g. "spot_up_3pt") → lookup in trait_scores.
    Composite keys (prefixed with '$') → derived logic or None if not computable.
    """
    if not trait_ref.startswith("$"):
        return trait_scores.get(trait_ref)

    # Composite / derived trait references
    cs = cluster_scores or {}

    if trait_ref == "$otd_shooting":
        # max of off-the-dribble 3PT or 2PT OTD
        a = trait_scores.get("otd_3pt")
        b = trait_scores.get("2pt_jumper_otd")
        if a is not None and b is not None:
            return max(a, b)
        return a or b  # return whichever is scored

    if trait_ref == "$rim_protection":
        return trait_scores.get("block") or trait_scores.get("rim_deterrence")

    if trait_ref == "$team_defense":
        # Approximate from perimeter defense cluster or help defense
        return trait_scores.get("off_ball_denial") or trait_scores.get("help_defense_interior")

    if trait_ref == "$motor":
        # Motor is a frame-cluster concept — approximate from frame cluster
        frame = cs.get("frame")
        return round(frame) if frame is not None else None

    if trait_ref == "$paint_deterrence":
        return trait_scores.get("rim_deterrence")

    if trait_ref == "$foul_discipline":
        a = trait_scores.get("perimeter_foul_discipline")
        b = trait_scores.get("interior_foul_discipline")
        if a is not None and b is not None:
            return min(a, b)
        return a or b

    if trait_ref == "$closeout_discipline":
        return trait_scores.get("perimeter_shot_contest")

    if trait_ref == "$help_defense_perimeter":
        return trait_scores.get("off_ball_denial")

    if trait_ref == "$physical_tools_composite":
        frame = cs.get("frame")
        return round(frame) if frame is not None else None

    if trait_ref == "$one_offensive_trait":
        off_clusters = ["shooting", "finishing", "playmaking"]
        for c in off_clusters:
            for key, score in trait_scores.items():
                if score is not None and score >= 70:
                    from .traits import TRAIT_BY_KEY
                    tdef = TRAIT_BY_KEY.get(key)
                    if tdef and tdef["cluster"] in off_clusters:
                        return score
        return None

    if trait_ref == "$one_defensive_trait":
        def_clusters = ["on_ball_defense", "team_defense"]
        for key, score in trait_scores.items():
            if score is not None and score >= 70:
                from .traits import TRAIT_BY_KEY
                tdef = TRAIT_BY_KEY.get(key)
                if tdef and tdef["cluster"] in def_clusters:
                    return score
        return None

    # All other composite refs → not computable from current data
    return None


def evaluate_archetype(
    archetype_def: dict,
    trait_scores: dict[str, int | None],
    cluster_scores: dict[str, float | None] = None,
) -> bool:
    """
    Evaluate whether a player qualifies for a given archetype.

    Returns True if:
      1. ALL must-haves are met (scored and >= threshold)
      2. Required number of supports are met
      3. No auto-disqualifiers are triggered

    UNSCORED traits cannot meet thresholds, so most archetypes will not
    qualify with box_score coverage (conservative by design).
    """
    # Check must-haves: ALL must be met
    for trait_ref, min_score in archetype_def["must_haves"]:
        score = _get_trait_score(trait_ref, trait_scores, cluster_scores)
        if score is None or score < min_score:
            return False

    # Check supports: N of M must be met
    supports_met = 0
    for trait_ref, min_score in archetype_def["supports"]:
        score = _get_trait_score(trait_ref, trait_scores, cluster_scores)
        if score is not None and score >= min_score:
            supports_met += 1
    if supports_met < archetype_def["supports_required"]:
        return False

    # Auto-disqualifiers: skipped for now (require meta-flag evaluation)
    # With box_score coverage, disqualifiers that reference tracking data
    # cannot be evaluated, so we don't trigger them (conservative).

    return True


def assign_archetypes(
    trait_scores: dict[str, int | None],
    cluster_scores: dict[str, float | None] = None,
) -> list[str]:
    """
    Evaluate all 21 archetypes and return list of qualifying archetype keys.
    A player may qualify for 0, 1, or many archetypes.
    """
    qualifying = []
    for adef in ARCHETYPE_DEFS:
        if evaluate_archetype(adef, trait_scores, cluster_scores):
            qualifying.append(adef["key"])
    return qualifying
