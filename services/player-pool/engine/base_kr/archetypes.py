"""
Archetype Library — College v3.0

Source: Basketball Player Intelligence v3 spec — Archetype Library (26 archetypes)

26 archetypes: descriptive, NOT evaluative.
Archetypes do NOT change KR scores.
A player may qualify for 0, 1, or many archetypes.

Archetype evaluation is conservative at box_score coverage —
most archetypes require synergy/tracking traits that will be UNSCORED,
so most players will have no archetypes assigned at this coverage tier.

Gates use v3 trait keys:
  Shooting cluster:   spot_up_3pt, movement_3pt, pull_up_3pt, deep_range_3pt,
                      midrange_shotmaking, free_throw
  Finishing cluster:  rim_pressure, contact_finishing, touch_craft, foul_draw,
                      vertical_finishing, transition_finishing
  Playmaking cluster: advantage_creation, passing_vision, passing_execution,
                      advantage_passing, transition_playmaking, ball_security,
                      connector_creation
  POA Defense:        containment, screen_navigation, ball_pressure,
                      closeout_recovery, deflections, steal_timing,
                      poa_foul_discipline
  Team Defense:       help_rotation, rim_protection, closeout_execution,
                      off_ball_positioning, communication_qb, versatility,
                      team_foul_discipline
  Rebounding:         defensive_rebounding, offensive_rebounding, box_out,
                      rebound_range, hands, second_jump_tip
  Tools:              height, length, strength, speed, lateral_quickness,
                      vertical_pop, motor, endurance
  IQ:                 decision_speed, correct_read_rate, shot_selection,
                      turnover_decision_quality, advantage_conversion,
                      role_discipline, processing_under_pressure
"""
from __future__ import annotations


# ═══════════════════════════════════════════════════════════════════════════
# Archetype Definitions
# ═══════════════════════════════════════════════════════════════════════════

ARCHETYPE_DEFS: list[dict] = [

    # ── Two-Way / Versatile ────────────────────────────────────────────
    {
        "key": "two_way_wing",
        "name": "Two-Way Wing",
        "identity": "Scales on both ends. Can stay on floor in most lineups.",
        "must_haves": [
            ("spot_up_3pt", 70),
            ("containment", 70),
            ("lateral_quickness", 70),
        ],
        "supports": [
            ("screen_navigation", 65),
            ("$team_defense", 65),
            ("movement_3pt", 65),
            ("defensive_rebounding", 60),
        ],
        "supports_required": 2,
    },
    {
        "key": "two_way_guard",
        "name": "Two-Way Guard",
        "identity": "Guard-sized two-way player; creates offensively and locks up defensively.",
        "must_haves": [
            ("pull_up_3pt", 68),
            ("containment", 72),
            ("steal_timing", 68),
        ],
        "supports": [
            ("ball_security", 65),
            ("screen_navigation", 65),
            ("passing_vision", 65),
            ("poa_foul_discipline", 65),
        ],
        "supports_required": 2,
    },
    {
        "key": "two_way_big",
        "name": "Two-Way Big",
        "identity": "Big who scores and protects the rim.",
        "must_haves": [
            ("rim_pressure", 70),
            ("rim_protection", 70),
            ("defensive_rebounding", 70),
        ],
        "supports": [
            ("help_rotation", 65),
            ("team_foul_discipline", 65),
            ("contact_finishing", 65),
            ("offensive_rebounding", 60),
        ],
        "supports_required": 2,
    },

    # ── Offensive Specialists ──────────────────────────────────────────
    {
        "key": "3_and_d_wing",
        "name": "3-and-D Wing",
        "identity": "Spacing + reliable defense. Low-creation, high trust.",
        "must_haves": [
            ("spot_up_3pt", 75),
            ("closeout_recovery", 68),
            ("$team_defense", 68),
        ],
        "supports": [
            ("containment", 65),
            ("screen_navigation", 65),
            ("free_throw", 72),
            ("off_ball_positioning", 65),
        ],
        "supports_required": 2,
    },
    {
        "key": "primary_ball_handler",
        "name": "Primary Ball-Handler",
        "identity": "Usage engine. Creates advantages; defense is secondary.",
        "must_haves": [
            ("passing_vision", 75),
            ("ball_security", 68),
            ("advantage_creation", 70),
        ],
        "supports": [
            ("pull_up_3pt", 65),
            ("advantage_passing", 65),
            ("free_throw", 75),
            ("transition_playmaking", 65),
        ],
        "supports_required": 2,
    },
    {
        "key": "situational_shooter",
        "name": "Situational Shooter",
        "identity": "One-job player: spacing. Limited elsewhere.",
        "must_haves": [
            ("spot_up_3pt", 80),
            ("movement_3pt", 70),
            ("free_throw", 78),
        ],
        "supports": [
            ("deep_range_3pt", 65),
            ("midrange_shotmaking", 65),
            ("$role_discipline_iq", 65),
        ],
        "supports_required": 2,
    },
    {
        "key": "stretch_big",
        "name": "Stretch Big",
        "identity": "Spacing big; offense via gravity, defense via positioning.",
        "must_haves": [
            ("spot_up_3pt", 70),
            ("free_throw", 75),
            ("$team_defense", 63),
        ],
        "supports": [
            ("midrange_shotmaking", 65),
            ("defensive_rebounding", 62),
            ("team_foul_discipline", 65),
            ("rim_protection", 55),
        ],
        "supports_required": 2,
    },
    {
        "key": "stretch_four",
        "name": "Stretch Four",
        "identity": "PF with perimeter shooting; floor spacing from the elbow.",
        "must_haves": [
            ("spot_up_3pt", 68),
            ("midrange_shotmaking", 68),
            ("defensive_rebounding", 65),
        ],
        "supports": [
            ("free_throw", 72),
            ("contact_finishing", 62),
            ("help_rotation", 60),
            ("$team_defense", 60),
        ],
        "supports_required": 2,
    },
    {
        "key": "offensive_wing_scorer",
        "name": "Offensive Wing Scorer",
        "identity": "Shot-creation wing; offense drives value, defense is managed.",
        "must_haves": [
            ("pull_up_3pt", 72),
            ("$shot_creation_volume", 70),
            ("free_throw", 74),
        ],
        "supports": [
            ("midrange_shotmaking", 65),
            ("contact_finishing", 65),
            ("advantage_creation", 65),
            ("movement_3pt", 62),
        ],
        "supports_required": 2,
    },
    {
        "key": "roll_man_vertical_threat",
        "name": "Roll Man / Vertical Threat",
        "identity": "Creates offensive gravity via rim pressure; finishes plays.",
        "must_haves": [
            ("vertical_finishing", 75),
            ("rim_pressure", 70),
            ("foul_draw", 65),
        ],
        "supports": [
            ("offensive_rebounding", 62),
            ("vertical_pop", 68),
            ("height", 75),
            ("contact_finishing", 62),
        ],
        "supports_required": 2,
    },
    {
        "key": "offensive_big",
        "name": "Offensive Big",
        "identity": "Offense-first interior scorer; requires protection.",
        "must_haves": [
            ("rim_pressure", 75),
            ("contact_finishing", 70),
            ("free_throw", 68),
        ],
        "supports": [
            ("offensive_rebounding", 60),
            ("foul_draw", 65),
            ("touch_craft", 60),
            ("height", 75),
        ],
        "supports_required": 2,
    },
    {
        "key": "pick_and_pop_threat",
        "name": "Pick-and-Pop Threat",
        "identity": "Big who pops to perimeter off screens; stretch without being a stretch-5.",
        "must_haves": [
            ("midrange_shotmaking", 70),
            ("free_throw", 72),
            ("$tools_height_ok", 68),
        ],
        "supports": [
            ("spot_up_3pt", 62),
            ("rim_pressure", 62),
            ("screen_navigation", 58),
        ],
        "supports_required": 2,
    },

    # ── Defensive Specialists ──────────────────────────────────────────
    {
        "key": "poa_defender_guard",
        "name": "POA Defender Guard",
        "identity": "Defense-first guard who takes the toughest assignment.",
        "must_haves": [
            ("containment", 75),
            ("screen_navigation", 70),
            ("lateral_quickness", 73),
        ],
        "supports": [
            ("ball_pressure", 65),
            ("deflections", 65),
            ("poa_foul_discipline", 68),
            ("steal_timing", 65),
        ],
        "supports_required": 2,
    },
    {
        "key": "switchable_defender",
        "name": "Switchable Defender",
        "identity": "Defense-first wing/forward who credibly switches positions.",
        "must_haves": [
            ("lateral_quickness", 73),
            ("screen_navigation", 68),
            ("versatility", 70),
        ],
        "supports": [
            ("containment", 65),
            ("$team_defense", 65),
            ("closeout_recovery", 65),
            ("team_foul_discipline", 65),
        ],
        "supports_required": 2,
    },
    {
        "key": "anchor_big",
        "name": "Anchor Big",
        "identity": "Paint controller; drop coverage backbone.",
        "must_haves": [
            ("rim_protection", 75),
            ("help_rotation", 70),
            ("defensive_rebounding", 70),
        ],
        "supports": [
            ("team_foul_discipline", 65),
            ("communication_qb", 60),
            ("box_out", 65),
            ("height", 80),
        ],
        "supports_required": 2,
    },
    {
        "key": "gap_team_defender",
        "name": "Gap / Team Defender",
        "identity": "IQ-driven defender; wins with positioning and communication.",
        "must_haves": [
            ("$team_defense", 72),
            ("off_ball_positioning", 68),
            ("closeout_execution", 68),
        ],
        "supports": [
            ("deflections", 62),
            ("defensive_rebounding", 60),
            ("team_foul_discipline", 65),
            ("communication_qb", 62),
        ],
        "supports_required": 2,
    },
    {
        "key": "mobile_defensive_big",
        "name": "Mobile Defensive Big",
        "identity": "Big who survives in space; PnR defender more than paint anchor.",
        "must_haves": [
            ("versatility", 68),
            ("lateral_quickness", 63),
            ("help_rotation", 68),
        ],
        "supports": [
            ("rim_protection", 62),
            ("screen_navigation", 58),
            ("defensive_rebounding", 60),
            ("closeout_execution", 60),
        ],
        "supports_required": 2,
    },
    {
        "key": "defensive_specialist",
        "name": "Defensive Specialist",
        "identity": "Defense-only contributor; offense minimized.",
        "must_haves": [
            ("containment", 75),
            ("screen_navigation", 68),
            ("$team_defense", 70),
        ],
        "supports": [
            ("lateral_quickness", 70),
            ("deflections", 65),
            ("poa_foul_discipline", 68),
            ("steal_timing", 62),
        ],
        "supports_required": 2,
    },
    {
        "key": "chaos_disruptor",
        "name": "Chaos Disruptor",
        "identity": "High-activity, high-variance defender; creates disorder.",
        "must_haves": [
            ("steal_timing", 75),
            ("deflections", 72),
            ("ball_pressure", 68),
        ],
        "supports": [
            ("containment", 65),
            ("off_ball_positioning", 63),
            ("poa_foul_discipline", 65),
            ("lateral_quickness", 65),
        ],
        "supports_required": 2,
    },

    # ── Playmaking ─────────────────────────────────────────────────────
    {
        "key": "connector_guard",
        "name": "Connector Guard",
        "identity": "Low-usage organizer; keeps offense and defense coherent.",
        "must_haves": [
            ("passing_execution", 73),
            ("decision_speed", 68),
            ("ball_security", 70),
        ],
        "supports": [
            ("$team_defense", 63),
            ("connector_creation", 62),
            ("advantage_passing", 60),
            ("role_discipline", 70),
        ],
        "supports_required": 2,
    },
    {
        "key": "point_forward",
        "name": "Point Forward",
        "identity": "Size-based secondary creator; offense flows through them.",
        "must_haves": [
            ("passing_vision", 70),
            ("ball_security", 68),
            ("advantage_creation", 63),
        ],
        "supports": [
            ("passing_execution", 65),
            ("advantage_passing", 63),
            ("$team_defense", 63),
            ("spot_up_3pt", 60),
        ],
        "supports_required": 2,
    },
    {
        "key": "high_iq_playmaker",
        "name": "High-IQ Playmaker",
        "identity": "Elite decision-maker; reads defense before it sets.",
        "must_haves": [
            ("decision_speed", 75),
            ("shot_selection", 75),
            ("processing_under_pressure", 70),
        ],
        "supports": [
            ("ball_security", 70),
            ("passing_vision", 68),
            ("role_discipline", 70),
            ("advantage_creation", 65),
        ],
        "supports_required": 2,
    },

    # ── Role Players & Other ───────────────────────────────────────────
    {
        "key": "utility_forward",
        "name": "Utility Forward",
        "identity": "Lineup glue; fills gaps without being a focal point.",
        "must_haves": [
            ("$team_defense", 68),
            ("role_discipline", 68),
            ("ball_security", 63),
        ],
        "supports": [
            ("connector_creation", 60),
            ("defensive_rebounding", 60),
            ("spot_up_3pt", 60),
            ("passing_vision", 60),
        ],
        "supports_required": 2,
    },
    {
        "key": "energy_big",
        "name": "Energy Big",
        "identity": "Bench impact via effort, rebounding, rim pressure.",
        "must_haves": [
            ("offensive_rebounding", 70),
            ("defensive_rebounding", 65),
            ("rim_pressure", 65),
        ],
        "supports": [
            ("vertical_pop", 65),
            ("vertical_finishing", 62),
            ("rim_protection", 60),
            ("height", 70),
        ],
        "supports_required": 2,
    },
    {
        "key": "rebounding_specialist",
        "name": "Rebounding Specialist",
        "identity": "Dominates glass on both ends; primary value is possession control.",
        "must_haves": [
            ("defensive_rebounding", 78),
            ("offensive_rebounding", 70),
            ("box_out", 70),
        ],
        "supports": [
            ("rebound_range", 65),
            ("hands", 65),
            ("height", 72),
            ("rim_pressure", 58),
        ],
        "supports_required": 2,
    },
    {
        "key": "developmental_prospect",
        "name": "Developmental Prospect",
        "identity": "Tools > production; projection archetype.",
        "must_haves": [
            ("$physical_tools", 70),
            ("$one_offensive", 68),
            ("$one_defensive", 68),
        ],
        "supports": [
            ("role_discipline", 62),
            ("shot_selection", 60),
            ("decision_speed", 58),
        ],
        "supports_required": 2,
    },
]

ARCHETYPE_BY_KEY: dict[str, dict] = {a["key"]: a for a in ARCHETYPE_DEFS}


# ═══════════════════════════════════════════════════════════════════════════
# Composite Trait References
# ═══════════════════════════════════════════════════════════════════════════

def _get_trait_score(
    trait_ref: str,
    trait_scores: dict[str, int | None],
    cluster_scores: dict[str, float | None] | None = None,
) -> int | None:
    """
    Resolve a trait reference to a score.

    Direct keys (no $ prefix) → lookup trait_scores.
    Composite keys ($ prefix)  → derived logic.
    """
    if not trait_ref.startswith("$"):
        return trait_scores.get(trait_ref)

    cs = cluster_scores or {}

    # ── Composite Refs ────────────────────────────────────────────────
    if trait_ref == "$team_defense":
        # Avg of available team defense cluster traits
        td_traits = ["help_rotation", "rim_protection", "closeout_execution",
                     "off_ball_positioning", "communication_qb", "versatility",
                     "team_foul_discipline"]
        scores = [s for t in td_traits if (s := trait_scores.get(t)) is not None]
        return round(sum(scores) / len(scores)) if scores else cs.get("team_defense") and round(cs["team_defense"])

    if trait_ref == "$shot_creation_volume":
        # Proxy: pull_up_3pt or midrange as "off-the-dribble" scoring
        a = trait_scores.get("pull_up_3pt")
        b = trait_scores.get("midrange_shotmaking")
        if a is not None and b is not None:
            return max(a, b)
        return a or b

    if trait_ref == "$role_discipline_iq":
        return trait_scores.get("role_discipline")

    if trait_ref == "$tools_height_ok":
        # Height ≥ 78" (6'6") as "big enough to be a pick-and-pop threat"
        h = trait_scores.get("height")
        return h if h is not None else None

    if trait_ref == "$physical_tools":
        # Max of available tools cluster scores (v4.0: includes strength, motor, endurance)
        tool_traits = ["height", "length", "strength", "speed", "lateral_quickness",
                       "vertical_pop", "motor", "endurance"]
        scores = [s for t in tool_traits if (s := trait_scores.get(t)) is not None]
        if scores:
            return max(scores)
        frame = cs.get("tools")
        return round(frame) if frame is not None else None

    if trait_ref == "$one_offensive":
        off_clusters = {"shooting", "finishing", "playmaking"}
        from .traits import TRAIT_BY_KEY
        for key, score in trait_scores.items():
            if score is not None and score >= 68:
                tdef = TRAIT_BY_KEY.get(key)
                if tdef and tdef["cluster"] in off_clusters:
                    return score
        return None

    if trait_ref == "$one_defensive":
        def_clusters = {"poa_defense", "team_defense"}
        from .traits import TRAIT_BY_KEY
        for key, score in trait_scores.items():
            if score is not None and score >= 68:
                tdef = TRAIT_BY_KEY.get(key)
                if tdef and tdef["cluster"] in def_clusters:
                    return score
        return None

    # Unknown composite → unresolvable
    return None


# ═══════════════════════════════════════════════════════════════════════════
# Archetype Evaluation
# ═══════════════════════════════════════════════════════════════════════════

def evaluate_archetype(
    archetype_def: dict,
    trait_scores: dict[str, int | None],
    cluster_scores: dict[str, float | None] | None = None,
) -> bool:
    """
    Returns True if player qualifies for this archetype:
      1. ALL must-haves scored and ≥ threshold
      2. Required number of supports scored and ≥ threshold
    """
    # Must-haves: ALL required
    for trait_ref, min_score in archetype_def["must_haves"]:
        score = _get_trait_score(trait_ref, trait_scores, cluster_scores)
        if score is None or score < min_score:
            return False

    # Supports: N of M required
    supports_met = sum(
        1 for trait_ref, min_score in archetype_def["supports"]
        if (_s := _get_trait_score(trait_ref, trait_scores, cluster_scores)) is not None
        and _s >= min_score
    )
    return supports_met >= archetype_def["supports_required"]


def assign_archetypes(
    trait_scores: dict[str, int | None],
    cluster_scores: dict[str, float | None] | None = None,
) -> list[str]:
    """
    Evaluate all 26 archetypes. Returns list of qualifying archetype keys.
    A player may qualify for 0, 1, or many archetypes.
    """
    return [
        adef["key"]
        for adef in ARCHETYPE_DEFS
        if evaluate_archetype(adef, trait_scores, cluster_scores)
    ]
