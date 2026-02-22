from __future__ import annotations
"""
Badge System — College + Pro
Computes performance badges from cluster scores and component KR values.
Spec: "BADGE CAP & EFFECT SPEC"

Badge tiers:
  College: Bronze >=90, Silver >=94, Gold >=97
  Pro:     Bronze >=93, Silver >=96, Gold >=98

Effects (overall-only — badges do NOT modify OKR/DKR/TKR separately):
  College: Bronze +3, Silver +6, Gold +10; overall cap +6.0
  Pro:     Bronze +2, Silver +4, Gold +7;  overall cap +4.0

Count caps: max 1 Gold, max 3 Silver (both modes)
Total: 31 offensive + 16 defensive = 47 badges
"""

# ═══════════════════════════════════════════════════════════════════════════
# BADGE DEFINITIONS — cluster_key → required score threshold
# ═══════════════════════════════════════════════════════════════════════════

OFFENSIVE_BADGES: list[tuple[str, str]] = [
    # Shooting (10)
    ("Deep Range Deadeye",        "shooting"),
    ("Catch & Shoot",             "shooting"),
    ("Pull-Up Precision",         "shooting"),
    ("Corner Specialist",         "shooting"),
    ("Free Throw Ace",            "shooting"),
    ("Volume Scorer",             "shooting"),
    ("Heat Check",                "shooting"),
    ("Contested Marksman",        "shooting"),
    ("Off-Screen Sniper",         "shooting"),
    ("Transition Shooter",        "shooting"),
    # Finishing (10)
    ("Rim Finisher",              "finishing"),
    ("Contact Finisher",          "finishing"),
    ("Floater Game",              "finishing"),
    ("Reverse Layup Artist",      "finishing"),
    ("Acrobatic Finisher",        "finishing"),
    ("Euro Step Specialist",      "finishing"),
    ("Post Moves Master",         "finishing"),
    ("And-One Machine",           "finishing"),
    ("Putback King",              "finishing"),
    ("Drop Step Dominator",       "finishing"),
    # Playmaking (11)
    ("Dime Dropper",              "playmaking"),
    ("Floor General",             "playmaking"),
    ("Pick-and-Roll Maestro",     "playmaking"),
    ("Transition Playmaker",      "playmaking"),
    ("Pocket Passer",             "playmaking"),
    ("Skip Pass Specialist",      "playmaking"),
    ("Lob Threat",                "playmaking"),
    ("Ball Handler Elite",        "playmaking"),
    ("DHO Specialist",            "playmaking"),
    ("Entry Pass Artist",         "playmaking"),
    ("Tempo Controller",          "playmaking"),
]

DEFENSIVE_BADGES: list[tuple[str, str]] = [
    # On-Ball Defense (6) — was perimeter_defense
    ("Lockdown Perimeter",        "on_ball_defense"),
    ("Pick Dodger",               "on_ball_defense"),
    ("Closeout King",             "on_ball_defense"),
    ("Passing Lane Predator",     "on_ball_defense"),
    ("Ball Hawk",                 "on_ball_defense"),
    ("Switch Specialist",         "on_ball_defense"),
    # Team Defense (5) — was interior_defense
    ("Rim Protector",             "team_defense"),
    ("Shot Blocker Elite",        "team_defense"),
    ("Post Lockdown",             "team_defense"),
    ("Help Side Anchor",          "team_defense"),
    ("Verticality Master",        "team_defense"),
    # Rebounding (5)
    ("Glass Cleaner",             "rebounding"),
    ("Box Out Boss",              "rebounding"),
    ("Offensive Glass Crasher",   "rebounding"),
    ("Outlet Trigger",            "rebounding"),
    ("Tip-In Specialist",         "rebounding"),
]

ALL_BADGES = OFFENSIVE_BADGES + DEFENSIVE_BADGES

# ═══════════════════════════════════════════════════════════════════════════
# TIER THRESHOLDS & EFFECTS
# ═══════════════════════════════════════════════════════════════════════════

COLLEGE_TIERS = {
    "gold":   {"threshold": 97, "effect": 10},
    "silver": {"threshold": 94, "effect": 6},
    "bronze": {"threshold": 90, "effect": 3},
}
COLLEGE_CAPS = {
    "max_gold": 1,
    "max_silver": 3,
    "per_component_cap": 12.0,  # kept for internal tracking; not applied to OKR/DKR
    "overall_cap": 6.0,
}

PRO_TIERS = {
    "gold":   {"threshold": 98, "effect": 7},
    "silver": {"threshold": 96, "effect": 4},
    "bronze": {"threshold": 93, "effect": 2},
}
PRO_CAPS = {
    "max_gold": 1,
    "max_silver": 3,
    "per_component_cap": 8.0,  # kept for internal tracking; not applied to OKR/DKR
    "overall_cap": 4.0,
}

# Map clusters to KR component (offensive vs defensive)
CLUSTER_TO_COMPONENT = {
    "shooting": "off",
    "finishing": "off",
    "playmaking": "off",
    "on_ball_defense": "def",
    "team_defense": "def",
    "rebounding": "def",
    "physical": "def",
}


def compute_badges(
    clusters: dict[str, float],
    mode: str = "college",
) -> dict:
    """
    Compute all earned badges from cluster scores.

    Returns:
        {
            "badges": [{"name": str, "cluster": str, "tier": str, "effect": float}, ...],
            "off_boost": float,   # capped total offensive badge boost
            "def_boost": float,   # capped total defensive badge boost
            "overall_boost": float,  # capped overall KR boost
        }
    """
    tiers = PRO_TIERS if mode == "pro" else COLLEGE_TIERS
    caps = PRO_CAPS if mode == "pro" else COLLEGE_CAPS

    # Assign tiers to all badges based on cluster score
    raw_badges: list[dict] = []
    for badge_name, cluster_key in ALL_BADGES:
        score = clusters.get(cluster_key, 0)
        tier = None
        effect = 0.0
        if score >= tiers["gold"]["threshold"]:
            tier = "gold"
            effect = tiers["gold"]["effect"]
        elif score >= tiers["silver"]["threshold"]:
            tier = "silver"
            effect = tiers["silver"]["effect"]
        elif score >= tiers["bronze"]["threshold"]:
            tier = "bronze"
            effect = tiers["bronze"]["effect"]

        if tier:
            raw_badges.append({
                "name": badge_name,
                "cluster": cluster_key,
                "tier": tier,
                "effect": effect,
                "component": CLUSTER_TO_COMPONENT.get(cluster_key, "off"),
            })

    # Apply count caps: max 1 Gold, max 3 Silver
    gold_count = 0
    silver_count = 0
    capped_badges: list[dict] = []

    # Sort: gold first, then silver, then bronze (to keep best badges)
    tier_order = {"gold": 0, "silver": 1, "bronze": 2}
    raw_badges.sort(key=lambda b: tier_order.get(b["tier"], 3))

    for b in raw_badges:
        if b["tier"] == "gold":
            if gold_count >= caps["max_gold"]:
                # Downgrade to silver
                if silver_count < caps["max_silver"]:
                    b = {**b, "tier": "silver", "effect": tiers["silver"]["effect"]}
                    silver_count += 1
                else:
                    b = {**b, "tier": "bronze", "effect": tiers["bronze"]["effect"]}
            else:
                gold_count += 1
        elif b["tier"] == "silver":
            if silver_count >= caps["max_silver"]:
                b = {**b, "tier": "bronze", "effect": tiers["bronze"]["effect"]}
            else:
                silver_count += 1

        capped_badges.append(b)

    # Compute component boosts with per-component caps
    off_total = 0.0
    def_total = 0.0
    for b in capped_badges:
        if b["component"] == "off":
            off_total += b["effect"]
        else:
            def_total += b["effect"]

    off_boost = min(off_total, caps["per_component_cap"])
    def_boost = min(def_total, caps["per_component_cap"])

    # Overall boost is capped separately
    overall_boost = min((off_boost + def_boost) / 2.0, caps["overall_cap"])

    return {
        "badges": [
            {"name": b["name"], "cluster": b["cluster"],
             "tier": b["tier"], "effect": b["effect"]}
            for b in capped_badges
        ],
        "off_boost": round(off_boost, 1),
        "def_boost": round(def_boost, 1),
        "overall_boost": round(overall_boost, 1),
    }
