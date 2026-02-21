from __future__ import annotations
"""
KR Legend Tier System — maps overall KR score to display tier labels.
Spec: "KR Legend Tiers" — per-level college legends (12 levels) + 1 pro legend.

Usage:
    from kr_legend import get_kr_tier

    tier = get_kr_tier(92.5, "naia")
    # {"label": "Elite", "band": "elite", "color": "#FFD700"}
"""

# ═══════════════════════════════════════════════════════════════════════════
# TIER DEFINITIONS — 10-band system (shared across all levels)
# ═══════════════════════════════════════════════════════════════════════════

TIERS: list[dict] = [
    {"min": 97, "label": "Generational",  "band": "generational",  "color": "#FFD700"},
    {"min": 94, "label": "Elite",         "band": "elite",         "color": "#FFC107"},
    {"min": 90, "label": "All-Conference","band": "all_conference", "color": "#4CAF50"},
    {"min": 85, "label": "Impact",        "band": "impact",        "color": "#2196F3"},
    {"min": 80, "label": "Starter",       "band": "starter",       "color": "#03A9F4"},
    {"min": 75, "label": "Rotation",      "band": "rotation",      "color": "#00BCD4"},
    {"min": 70, "label": "Reserve",       "band": "reserve",       "color": "#009688"},
    {"min": 66, "label": "Developmental", "band": "developmental", "color": "#8BC34A"},
    {"min": 60, "label": "Project",       "band": "project",       "color": "#FF9800"},
    {"min": 0,  "label": "Unranked",      "band": "unranked",      "color": "#757575"},
]

# Pro tiers — higher bar (KR 80 at pro is much harder than KR 80 at JUCO)
PRO_TIERS: list[dict] = [
    {"min": 97, "label": "MVP Candidate",   "band": "generational",  "color": "#FFD700"},
    {"min": 94, "label": "All-Star",        "band": "elite",         "color": "#FFC107"},
    {"min": 90, "label": "All-League",      "band": "all_conference", "color": "#4CAF50"},
    {"min": 85, "label": "Quality Starter", "band": "impact",        "color": "#2196F3"},
    {"min": 80, "label": "Starter",         "band": "starter",       "color": "#03A9F4"},
    {"min": 75, "label": "Rotation",        "band": "rotation",      "color": "#00BCD4"},
    {"min": 70, "label": "Bench",           "band": "reserve",       "color": "#009688"},
    {"min": 66, "label": "Two-Way",         "band": "developmental", "color": "#8BC34A"},
    {"min": 60, "label": "G-League",        "band": "project",       "color": "#FF9800"},
    {"min": 0,  "label": "Undrafted",       "band": "unranked",      "color": "#757575"},
]

# Level-specific label overrides for top tier
# (e.g., "Generational" at NAIA has different context than at NCAA D1)
LEVEL_TOP_LABELS: dict[str, str] = {
    "njcaa_d3":   "Division Leader",
    "njcaa_d2":   "Conference Star",
    "njcaa_d1":   "All-American Candidate",
    "cccaa":      "Conference Star",
    "uscaa":      "Division Leader",
    "nccaa_d2":   "Conference Star",
    "nccaa_d1":   "All-American Candidate",
    "naia":       "All-American Candidate",
    "ncaa_d3":    "All-American Candidate",
    "ncaa_d2":    "All-American Candidate",
    "ncaa_d1":    "All-American Candidate",
    "professional": "MVP Candidate",
}

# Pro-level keys
PRO_LEVELS = {"professional", "nba", "g_league", "overseas_pro"}


def get_kr_tier(overall_kr: float, level_key: str = "naia") -> dict:
    """
    Map an overall KR score to a display tier.

    Returns: {"label": str, "band": str, "color": str, "kr": float}
    """
    tiers = PRO_TIERS if level_key in PRO_LEVELS else TIERS

    for tier in tiers:
        if overall_kr >= tier["min"]:
            label = tier["label"]
            # Override top tier label for specific levels
            if tier == tiers[0] and level_key in LEVEL_TOP_LABELS:
                label = LEVEL_TOP_LABELS[level_key]
            return {
                "label": label,
                "band": tier["band"],
                "color": tier["color"],
                "kr": round(overall_kr, 1),
            }

    # Fallback
    return {"label": "Unranked", "band": "unranked", "color": "#757575", "kr": round(overall_kr, 1)}


def get_all_tiers(level_key: str = "naia") -> list[dict]:
    """Return all tier definitions for a given level (for UI legend display)."""
    tiers = PRO_TIERS if level_key in PRO_LEVELS else TIERS
    result = []
    for tier in tiers:
        label = tier["label"]
        if tier == tiers[0] and level_key in LEVEL_TOP_LABELS:
            label = LEVEL_TOP_LABELS[level_key]
        result.append({
            "min": tier["min"],
            "label": label,
            "band": tier["band"],
            "color": tier["color"],
        })
    return result
