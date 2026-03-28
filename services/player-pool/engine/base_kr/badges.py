"""
Badge System — College v3.0 (34 badges)

Source: Basketball Player Intelligence v3 spec — Badge Cap & Effect Spec (34 badges)

34 badges across 7 skill clusters (Tools has no badges):
  Shooting (5), Finishing (5), Playmaking (5),
  POA Defense (5), Team Defense (5), Rebounding (4), IQ (5)

Badge Eligibility (College v1):
  Bronze: trait(s) ≥ 90  AND Skill KR (base_player_kr) ≥ 90
  Silver: trait(s) ≥ 94  AND Skill KR ≥ 94
  Gold:   trait(s) ≥ 97  AND Skill KR ≥ 97

Badge Effects (directly to Final KR):
  Bronze: +0.5   Silver: +1.0   Gold: +1.5

Total badge lift cap: +3.5 KR
No per-component cap (effects go directly to final KR).
Count caps: max 1 Gold, max 3 Silver per player (excess downgraded).

Data-layer rule: if all required traits for a badge are UNSCORED (None),
the badge is ineligible regardless of Skill KR.
"""
from __future__ import annotations

# ═══════════════════════════════════════════════════════════════════════════
# Badge Tier Configuration
# ═══════════════════════════════════════════════════════════════════════════

BADGE_TIERS: dict[str, dict] = {
    "gold":   {"trait_min": 97, "skill_kr_min": 97, "effect": 1.5},
    "silver": {"trait_min": 94, "skill_kr_min": 94, "effect": 1.0},
    "bronze": {"trait_min": 90, "skill_kr_min": 90, "effect": 0.5},
}

MAX_GOLD          = 1
MAX_SILVER        = 3
OVERALL_KR_CAP    = 3.5  # total badge lift cap

# ═══════════════════════════════════════════════════════════════════════════
# Badge Definitions — 34 total
#
# Each badge:
#   key      — unique identifier
#   name     — display name
#   cluster  — the skill cluster this badge belongs to
#   traits   — list of trait_keys; ALL must meet tier threshold
# ═══════════════════════════════════════════════════════════════════════════

BADGE_DEFS: list[dict] = [

    # ── Shooting (5) ─────────────────────────────────────────────────────
    {"key": "spot_up_sniper",     "name": "Spot-Up Sniper",     "cluster": "shooting",   "traits": ["spot_up_3pt"]},
    {"key": "movement_shooter",   "name": "Movement Shooter",   "cluster": "shooting",   "traits": ["movement_3pt"]},
    {"key": "pull_up_shotmaker",  "name": "Pull-Up Shotmaker",  "cluster": "shooting",   "traits": ["pull_up_3pt"]},
    {"key": "limitless_range",    "name": "Limitless Range",    "cluster": "shooting",   "traits": ["deep_range_3pt"]},
    {"key": "free_throw_bank",    "name": "Free Throw Bank",    "cluster": "shooting",   "traits": ["free_throw"]},

    # ── Finishing (5) ─────────────────────────────────────────────────────
    {"key": "rim_pressure_badge", "name": "Rim Pressure",       "cluster": "finishing",  "traits": ["rim_pressure"]},
    {"key": "whistle",            "name": "Whistle",            "cluster": "finishing",  "traits": ["foul_draw"]},
    {"key": "fearless_finisher",  "name": "Fearless Finisher",  "cluster": "finishing",  "traits": ["contact_finishing"]},
    {"key": "vertical_finisher",  "name": "Vertical Finisher",  "cluster": "finishing",  "traits": ["vertical_finishing"]},
    {"key": "touch_artist",       "name": "Touch Artist",       "cluster": "finishing",  "traits": ["touch_craft"]},

    # ── Playmaking (5) ────────────────────────────────────────────────────
    {"key": "advantage_creator",  "name": "Advantage Creator",  "cluster": "playmaking", "traits": ["advantage_creation"]},
    {"key": "dimer",              "name": "Dimer",              "cluster": "playmaking", "traits": ["passing_vision"]},
    {"key": "needle_threader",    "name": "Needle Threader",    "cluster": "playmaking", "traits": ["passing_execution"]},
    {"key": "floor_general",      "name": "Floor General",      "cluster": "playmaking", "traits": ["connector_creation"]},
    {"key": "ball_security_badge","name": "Ball Security",      "cluster": "playmaking", "traits": ["ball_security"]},

    # ── POA Defense (5) ───────────────────────────────────────────────────
    {"key": "clamps",             "name": "Clamps",             "cluster": "poa_defense","traits": ["containment"]},
    {"key": "screen_navigator",   "name": "Screen Navigator",   "cluster": "poa_defense","traits": ["screen_navigation"]},
    {"key": "interceptor",        "name": "Interceptor",        "cluster": "poa_defense","traits": ["steal_timing", "deflections"]},
    {"key": "ball_hawk",          "name": "Ball Hawk",          "cluster": "poa_defense","traits": ["ball_pressure"]},
    {"key": "discipline_badge",   "name": "Discipline",         "cluster": "poa_defense","traits": ["poa_foul_discipline"]},

    # ── Team Defense (5) ──────────────────────────────────────────────────
    {"key": "anchor",             "name": "Anchor",             "cluster": "team_defense","traits": ["rim_protection", "help_rotation"]},
    {"key": "low_man_rotator",    "name": "Low-Man Rotator",    "cluster": "team_defense","traits": ["help_rotation"]},
    {"key": "closeout_pro",       "name": "Closeout Pro",       "cluster": "team_defense","traits": ["closeout_execution"]},
    {"key": "defensive_qb",       "name": "Defensive QB",       "cluster": "team_defense","traits": ["communication_qb"]},
    {"key": "switchable",         "name": "Switchable",         "cluster": "team_defense","traits": ["versatility"]},

    # ── Rebounding (4) ────────────────────────────────────────────────────
    {"key": "rebound_chaser",     "name": "Rebound Chaser",     "cluster": "rebounding", "traits": ["defensive_rebounding", "rebound_range"]},
    {"key": "boxout_beast",       "name": "Boxout Beast",       "cluster": "rebounding", "traits": ["box_out"]},
    {"key": "offensive_glass",    "name": "Offensive Glass",    "cluster": "rebounding", "traits": ["offensive_rebounding"]},
    {"key": "strong_hands",       "name": "Strong Hands",       "cluster": "rebounding", "traits": ["hands"]},

    # ── IQ (5) ────────────────────────────────────────────────────────────
    {"key": "fast_processor",     "name": "Fast Processor",     "cluster": "iq",         "traits": ["decision_speed"]},
    {"key": "elite_shot_selector","name": "Elite Shot Selector","cluster": "iq",         "traits": ["shot_selection"]},
    {"key": "low_mistake_rate",   "name": "Low Mistake Rate",   "cluster": "iq",         "traits": ["role_discipline"]},
    {"key": "advantage_converter","name": "Advantage Converter","cluster": "iq",         "traits": ["processing_under_pressure"]},
    {"key": "role_discipline_badge","name": "Role Discipline",  "cluster": "iq",         "traits": ["role_discipline", "shot_selection"]},
]


# ═══════════════════════════════════════════════════════════════════════════
# Badge Computation
# ═══════════════════════════════════════════════════════════════════════════

def _determine_tier(
    badge_def: dict,
    trait_scores: dict[str, int | None],
    skill_kr: float | None,
) -> str | None:
    """
    Determine the highest badge tier a player qualifies for.

    skill_kr = base_player_kr (raw, before KLVN normalization)
    """
    if skill_kr is None:
        return None

    # Data-layer rule: ALL required traits must be scored
    if any(trait_scores.get(tk) is None for tk in badge_def["traits"]):
        return None

    for tier_name in ("gold", "silver", "bronze"):
        tier = BADGE_TIERS[tier_name]
        if skill_kr < tier["skill_kr_min"]:
            continue
        if all(
            (trait_scores.get(tk) or 0) >= tier["trait_min"]
            for tk in badge_def["traits"]
        ):
            return tier_name

    return None


def compute_badges(
    trait_scores: dict[str, int | None],
    base_player_kr: float | None,
) -> dict:
    """
    Compute all badges for a player.

    Parameters
    ----------
    trait_scores    : dict[trait_key → score or None]
    base_player_kr  : float or None — raw KR before KLVN (Skill KR gate)

    Returns
    -------
    dict with:
      badges        : list of earned badge dicts
      badge_boost   : total KR boost (capped at OVERALL_KR_CAP)
    """
    raw_badges: list[dict] = []

    for bdef in BADGE_DEFS:
        tier = _determine_tier(bdef, trait_scores, base_player_kr)
        if tier:
            raw_badges.append({
                "key":     bdef["key"],
                "name":    bdef["name"],
                "cluster": bdef["cluster"],
                "tier":    tier,
                "effect":  BADGE_TIERS[tier]["effect"],
            })

    # Count caps: max 1 Gold, max 3 Silver
    gold_count   = sum(1 for b in raw_badges if b["tier"] == "gold")
    silver_count = sum(1 for b in raw_badges if b["tier"] == "silver")

    # Downgrade excess Golds → Silver
    if gold_count > MAX_GOLD:
        excess = gold_count - MAX_GOLD
        for b in raw_badges:
            if excess <= 0:
                break
            if b["tier"] == "gold":
                b["tier"]   = "silver"
                b["effect"] = BADGE_TIERS["silver"]["effect"]
                excess      -= 1
                silver_count += 1

    # Downgrade excess Silvers → Bronze
    if silver_count > MAX_SILVER:
        excess = silver_count - MAX_SILVER
        for b in raw_badges:
            if excess <= 0:
                break
            if b["tier"] == "silver":
                b["tier"]   = "bronze"
                b["effect"] = BADGE_TIERS["bronze"]["effect"]
                excess -= 1

    # Sum effects and apply overall cap
    raw_boost     = sum(b["effect"] for b in raw_badges)
    badge_boost   = min(raw_boost, OVERALL_KR_CAP)

    # Scale down individual effects proportionally if capped
    final_badges = raw_badges

    return {
        "badges":       final_badges,
        "badge_boost":  round(badge_boost, 2),
    }
