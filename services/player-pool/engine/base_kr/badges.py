"""
Badge System — College v1

Source: BADGE CAP & EFFECT SPEC — COLLEGE v1.pdf
47 badges (31 offensive + 16 defensive) with dual gates and caps.

Badge Eligibility (College):
  - Bronze: Trait(s) >= 90 AND Component KR >= 90
  - Silver: Trait(s) >= 94 AND Component KR >= 94
  - Gold:   Trait(s) >= 97 AND Component KR >= 97

Badge Effects:
  - Bronze: +3 to component KR
  - Silver: +6 to component KR
  - Gold:   +10 to component KR

Caps:
  - Per-component cap: <= +12 total from badges
  - Overall impact cap: <= +3.5 to Final KR
  - Count caps: max 1 Gold, max 3 Silver per player (excess downgraded)
"""
from __future__ import annotations

# ═══════════════════════════════════════════════════════════════════════════
# Badge Tier Configuration (College)
# ═══════════════════════════════════════════════════════════════════════════

BADGE_TIERS = {
    "gold":   {"trait_min": 97, "component_min": 97, "effect": 10},
    "silver": {"trait_min": 94, "component_min": 94, "effect": 6},
    "bronze": {"trait_min": 90, "component_min": 90, "effect": 3},
}

MAX_GOLD = 1
MAX_SILVER = 3
PER_COMPONENT_CAP = 12
OVERALL_KR_CAP = 3.5

# ═══════════════════════════════════════════════════════════════════════════
# Badge Definitions
# ═══════════════════════════════════════════════════════════════════════════
#
# Each badge:
#   key: unique identifier
#   name: display name
#   category: "offensive" or "defensive"
#   component: which KR component gets the boost ("okr" or "dkr")
#   traits: list of trait_keys — ALL must meet tier threshold
#   group: badge group for display

OFFENSIVE_BADGES: list[dict] = [
    # I. Shooting (7)
    {"key": "ob_01_spot_up_sniper", "name": "Spot-Up Sniper", "group": "Shooting", "component": "okr", "traits": ["spot_up_3pt"]},
    {"key": "ob_02_movement_shooter", "name": "Movement Shooter", "group": "Shooting", "component": "okr", "traits": ["movement_3pt"]},
    {"key": "ob_03_pull_up_threat", "name": "Pull-Up Threat", "group": "Shooting", "component": "okr", "traits": ["otd_3pt"]},
    {"key": "ob_04_deep_range", "name": "Deep Range", "group": "Shooting", "component": "okr", "traits": ["deep_range_3pt"]},
    {"key": "ob_05_midrange_cs", "name": "Midrange Marksman (C&S)", "group": "Shooting", "component": "okr", "traits": ["2pt_jumper_cs"]},
    {"key": "ob_06_midrange_otd", "name": "Midrange Creator (OTD)", "group": "Shooting", "component": "okr", "traits": ["2pt_jumper_otd"]},
    {"key": "ob_07_free_throw", "name": "Automatic FT", "group": "Shooting", "component": "okr", "traits": ["free_throw"]},
    # II. Finishing/Rim Pressure (6)
    {"key": "ob_08_layup_artist", "name": "Layup Artist", "group": "Finishing", "component": "okr", "traits": ["layup_finishing"]},
    {"key": "ob_09_floater_touch", "name": "Floater Touch", "group": "Finishing", "component": "okr", "traits": ["floater_runner"]},
    {"key": "ob_10_above_rim", "name": "Above the Rim", "group": "Finishing", "component": "okr", "traits": ["dunk_finishing"]},
    {"key": "ob_11_close_range", "name": "Close-Range Surgeon", "group": "Finishing", "component": "okr", "traits": ["close_finishing"]},
    {"key": "ob_12_foul_drawer", "name": "Foul Drawer", "group": "Finishing", "component": "okr", "traits": ["foul_draw_rate"]},
    {"key": "ob_13_contact_finisher", "name": "Contact Finisher", "group": "Finishing", "component": "okr", "traits": ["power_through_contact"]},
    # III. Playmaking (5)
    {"key": "ob_14_precision_passer", "name": "Precision Passer", "group": "Playmaking", "component": "okr", "traits": ["passing_accuracy"]},
    {"key": "ob_15_vision", "name": "Court Vision", "group": "Playmaking", "component": "okr", "traits": ["passing_vision"]},
    {"key": "ob_16_drive_kick", "name": "Drive-and-Kick Master", "group": "Playmaking", "component": "okr", "traits": ["drive_and_kick"]},
    {"key": "ob_17_transition_creator", "name": "Transition Creator", "group": "Playmaking", "component": "okr", "traits": ["transition_playmaking"]},
    {"key": "ob_18_ball_security", "name": "Ball Security", "group": "Playmaking", "component": "okr", "traits": ["ball_security"]},
    # IV. Off-Ball/Connector (3)
    {"key": "ob_19_hockey_assist", "name": "Hockey Assist Creator", "group": "Off-Ball", "component": "okr", "traits": ["hockey_assist_creation"]},
    {"key": "ob_20_screen_assist", "name": "Screen Assist Creator", "group": "Off-Ball", "component": "okr", "traits": ["screen_assist_creation"]},
    {"key": "ob_21_outlet_igniter", "name": "Outlet Igniter", "group": "Off-Ball", "component": "okr", "traits": ["rebound_to_playmaking"]},
    # V. Screening/Big Skill (3)
    {"key": "ob_22_brick_wall", "name": "Brick Wall", "group": "Screening", "component": "okr", "traits": ["strength_functional"]},
    {"key": "ob_23_roll_gravity", "name": "Roll Gravity", "group": "Screening", "component": "okr", "traits": ["dunk_finishing", "vertical_pop"]},
    {"key": "ob_24_pop_threat", "name": "Pop Threat", "group": "Screening", "component": "okr", "traits": ["spot_up_3pt", "free_throw"]},
    # VI. Transition (3)
    {"key": "ob_25_fast_break_finisher", "name": "Fast-Break Finisher", "group": "Transition", "component": "okr", "traits": ["speed_with_ball", "dunk_finishing"]},
    {"key": "ob_26_transition_scorer", "name": "Transition Scorer", "group": "Transition", "component": "okr", "traits": ["speed_with_ball", "layup_finishing"]},
    {"key": "ob_27_transition_passer", "name": "Transition Passer", "group": "Transition", "component": "okr", "traits": ["transition_playmaking", "speed_with_ball"]},
    # VII. Gravity/Spacing (4)
    {"key": "ob_28_floor_spacer", "name": "Floor Spacer", "group": "Gravity", "component": "okr", "traits": ["spot_up_3pt", "movement_3pt"]},
    {"key": "ob_29_paint_magnet", "name": "Paint Magnet", "group": "Gravity", "component": "okr", "traits": ["layup_finishing", "foul_draw_rate"]},
    {"key": "ob_30_offensive_rebounder", "name": "Offensive Glass Crasher", "group": "Gravity", "component": "okr", "traits": ["offensive_rebounding"]},
    {"key": "ob_31_putback_threat", "name": "Putback Threat", "group": "Gravity", "component": "okr", "traits": ["offensive_rebounding", "close_finishing"]},
]

DEFENSIVE_BADGES: list[dict] = [
    # I. On-Ball Defense (3)
    {"key": "db_01_lockdown", "name": "Lockdown Defender", "group": "On-Ball", "component": "dkr", "traits": ["on_ball_containment"]},
    {"key": "db_02_ball_hawk", "name": "Ball Hawk", "group": "On-Ball", "component": "dkr", "traits": ["ball_pressure"]},
    {"key": "db_03_pick_pocket", "name": "Pick Pocket", "group": "On-Ball", "component": "dkr", "traits": ["steal"]},
    # II. Team/Off-Ball Defense (3)
    {"key": "db_04_off_ball_denial", "name": "Off-Ball Denial", "group": "Team Defense", "component": "dkr", "traits": ["off_ball_denial"]},
    {"key": "db_05_help_defender", "name": "Help Defender", "group": "Team Defense", "component": "dkr", "traits": ["help_defense_interior"]},
    {"key": "db_06_disruptor", "name": "Passing Lane Disruptor", "group": "Team Defense", "component": "dkr", "traits": ["perimeter_disruption"]},
    # III. Switching/Versatility (3)
    {"key": "db_07_screen_navigator", "name": "Screen Navigator", "group": "Switching", "component": "dkr", "traits": ["screen_navigation"]},
    {"key": "db_08_switch_specialist", "name": "Switch Specialist", "group": "Switching", "component": "dkr", "traits": ["lateral_quickness", "on_ball_containment"]},
    {"key": "db_09_contest_machine", "name": "Contest Machine", "group": "Switching", "component": "dkr", "traits": ["perimeter_shot_contest"]},
    # IV. Rim Protection/Interior (3)
    {"key": "db_10_shot_blocker", "name": "Shot Blocker", "group": "Rim Protection", "component": "dkr", "traits": ["block"]},
    {"key": "db_11_rim_deterrent", "name": "Rim Deterrent", "group": "Rim Protection", "component": "dkr", "traits": ["rim_deterrence"]},
    {"key": "db_12_post_stopper", "name": "Post Stopper", "group": "Rim Protection", "component": "dkr", "traits": ["post_defense"]},
    # V. Disruption/Turnover Creation (2)
    {"key": "db_13_interior_disruptor", "name": "Interior Disruptor", "group": "Disruption", "component": "dkr", "traits": ["interior_disruption"]},
    {"key": "db_14_foul_discipline", "name": "Disciplined Defender", "group": "Disruption", "component": "dkr", "traits": ["perimeter_foul_discipline", "interior_foul_discipline"]},
    # VI. Rebounding/Possession (2)
    {"key": "db_15_defensive_glass", "name": "Defensive Glass Cleaner", "group": "Rebounding", "component": "dkr", "traits": ["defensive_rebounding"]},
    {"key": "db_16_box_out_king", "name": "Box-Out King", "group": "Rebounding", "component": "dkr", "traits": ["box_out_effectiveness"]},
]

ALL_BADGES = OFFENSIVE_BADGES + DEFENSIVE_BADGES


# ═══════════════════════════════════════════════════════════════════════════
# Badge Computation
# ═══════════════════════════════════════════════════════════════════════════

def _determine_tier(
    badge_def: dict,
    trait_scores: dict[str, int | None],
    component_kr: float | None,
) -> str | None:
    """
    Determine the highest badge tier a player qualifies for.
    Returns "gold", "silver", "bronze", or None.
    """
    if component_kr is None:
        return None

    for tier_name in ("gold", "silver", "bronze"):
        tier = BADGE_TIERS[tier_name]
        # Component KR gate
        if component_kr < tier["component_min"]:
            continue
        # All required traits must meet trait threshold
        all_met = True
        for trait_key in badge_def["traits"]:
            score = trait_scores.get(trait_key)
            if score is None or score < tier["trait_min"]:
                all_met = False
                break
        if all_met:
            return tier_name
    return None


def compute_badges(
    trait_scores: dict[str, int | None],
    raw_player_kr: float | None,
) -> dict:
    """
    Compute all badges for a player.

    Parameters
    ----------
    trait_scores : dict mapping trait_key → score (or None)
    raw_player_kr : float or None — universal component gate (replaces OKR/DKR)

    Returns
    -------
    dict with:
      - badges: list of {key, name, tier, effect, component}
      - okr_boost: total offensive badge boost (capped at PER_COMPONENT_CAP)
      - dkr_boost: total defensive badge boost (capped at PER_COMPONENT_CAP)
      - overall_boost: total to final KR (capped at OVERALL_KR_CAP)
    """
    raw_badges = []

    for bdef in ALL_BADGES:
        tier = _determine_tier(bdef, trait_scores, raw_player_kr)
        if tier:
            raw_badges.append({
                "key": bdef["key"],
                "name": bdef["name"],
                "tier": tier,
                "effect": BADGE_TIERS[tier]["effect"],
                "component": bdef["component"],
                "group": bdef["group"],
            })

    # Apply count caps: max 1 Gold, max 3 Silver
    gold_count = sum(1 for b in raw_badges if b["tier"] == "gold")
    silver_count = sum(1 for b in raw_badges if b["tier"] == "silver")

    # Downgrade excess Golds to Silver
    if gold_count > MAX_GOLD:
        excess = gold_count - MAX_GOLD
        for b in raw_badges:
            if excess <= 0:
                break
            if b["tier"] == "gold":
                b["tier"] = "silver"
                b["effect"] = BADGE_TIERS["silver"]["effect"]
                excess -= 1
                silver_count += 1

    # Downgrade excess Silvers to Bronze
    if silver_count > MAX_SILVER:
        excess = silver_count - MAX_SILVER
        for b in raw_badges:
            if excess <= 0:
                break
            if b["tier"] == "silver":
                b["tier"] = "bronze"
                b["effect"] = BADGE_TIERS["bronze"]["effect"]
                excess -= 1

    # Apply per-component cap
    okr_boost = 0.0
    dkr_boost = 0.0
    final_badges = []

    for b in raw_badges:
        if b["component"] == "okr":
            if okr_boost + b["effect"] <= PER_COMPONENT_CAP:
                okr_boost += b["effect"]
                final_badges.append(b)
            else:
                remaining = PER_COMPONENT_CAP - okr_boost
                if remaining > 0:
                    b["effect"] = remaining
                    okr_boost += remaining
                    final_badges.append(b)
        else:
            if dkr_boost + b["effect"] <= PER_COMPONENT_CAP:
                dkr_boost += b["effect"]
                final_badges.append(b)
            else:
                remaining = PER_COMPONENT_CAP - dkr_boost
                if remaining > 0:
                    b["effect"] = remaining
                    dkr_boost += remaining
                    final_badges.append(b)

    # Overall impact cap
    overall_boost = min(okr_boost + dkr_boost, OVERALL_KR_CAP)

    return {
        "badges": final_badges,
        "okr_boost": okr_boost,
        "dkr_boost": dkr_boost,
        "overall_boost": overall_boost,
    }
