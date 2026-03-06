"""
KLVN v1 Constants & Level Configuration.

Source: KLVN v1 Constants.pdf
  - 14 level keys with lambda_level values
  - D1 conference class mapping (High-Major / Mid-Major / Low-Major)
"""
from __future__ import annotations

# ═══════════════════════════════════════════════════════════════════════════
# KLVN Lambda Ladder — 14 levels
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
# D1 Conference Class Mapping
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

# Normalized lookup — maps various conference name forms to tier
_D1_TIER_MAP: dict[str, str] = {}
for _c in HIGH_MAJOR_CONFERENCES:
    _D1_TIER_MAP[_c.lower()] = "ncaa_d1_high_major"
for _c in MID_MAJOR_CONFERENCES:
    _D1_TIER_MAP[_c.lower()] = "ncaa_d1_mid_major"


def get_d1_level_key(conference_name: str | None) -> str:
    """
    Given a D1 conference name, return the appropriate level_key.
    Falls back to ncaa_d1_low_major for any unrecognized conference.
    """
    if not conference_name:
        return "ncaa_d1_low_major"
    return _D1_TIER_MAP.get(conference_name.lower().strip(), "ncaa_d1_low_major")


def get_lambda(level_key: str) -> float:
    """Return KLVN lambda for a level key.  Defaults to lowest if unknown."""
    return LAMBDA_LEVEL.get(level_key, 0.450)


# ═══════════════════════════════════════════════════════════════════════════
# Base-level mapping for non-D1 levels (level_key from competitive_levels table)
# ═══════════════════════════════════════════════════════════════════════════

# Maps the competitive_levels.level_key in our DB to the spec's 14 level keys
LEVEL_KEY_MAP: dict[str, str] = {
    "ncaa_d1":   None,        # D1 needs conference-based resolution
    "ncaa_d2":   "ncaa_d2",
    "ncaa_d3":   "ncaa_d3",
    "njcaa_d1":  "njcaa_d1",
    "njcaa_d2":  "njcaa_d2",
    "njcaa_d3":  "njcaa_d3",
    "naia":      "naia",
    "cccaa":     "cccaa",
    "uscaa":     "uscaa",
    "nccaa_d1":  "nccaa_d1",
    "nccaa_d2":  "nccaa_d2",
}


# ═══════════════════════════════════════════════════════════════════════════
# KR Version Tag
# ═══════════════════════════════════════════════════════════════════════════

KR_VERSION = "v2.1-base-kr"


# ═══════════════════════════════════════════════════════════════════════════
# Coverage Tiers
# ═══════════════════════════════════════════════════════════════════════════

COVERAGE_BOX_SCORE = "box_score"
COVERAGE_SYNERGY = "synergy"
COVERAGE_TRACKING = "tracking"
