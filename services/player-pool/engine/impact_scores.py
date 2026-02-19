from __future__ import annotations
"""
Impact Scores — PGIS (Player Game Impact Score) and TGIS (Team Game Impact Score)
Plus Impact Modifiers for system-adjusted context.

Reference:
  spec/canonical/_text/01_Player Evaluation Engine/Impact Modifiers — System Logic.txt

PGIS: Single-number per-game impact score (0-100 scale, 50 = average).
TGIS: Single-number per-game team impact score.
Impact Modifiers: Contextual adjustments based on system, opponent, role.
"""

import math


# ═══════════════════════════════════════════════════════════════════════════
# PGIS — Player Game Impact Score
# Combines BPR + efficiency + volume into a single game-level score.
# ═══════════════════════════════════════════════════════════════════════════

def compute_pgis(
    bpr: float,
    minutes: float,
    pts: int, fgm: int, fga: int,
    ftm: int, fta: int,
    three_pm: int,
    ast: int, stl: int, blk: int,
    oreb: int, dreb: int,
    turnovers: int, pf: int,
    team_poss: float | None = None,
) -> float:
    """
    Compute Player Game Impact Score (0-100, 50 = average).
    Combines box-score production, efficiency, and BPR into one number.
    """
    if not minutes or minutes <= 0:
        return 0.0

    # True Shooting %
    total_sa = fga + 0.44 * fta
    ts_pct = (pts / (2 * total_sa)) if total_sa > 0 else 0.0

    # Game Score (modified Hollinger)
    game_score = (
        pts * 1.0
        + fgm * 0.4
        + three_pm * 0.5
        + ftm * 0.3
        - fga * 0.7
        - fta * 0.4 * (1 - (ftm / fta if fta > 0 else 0.7))
        + oreb * 0.7
        + dreb * 0.3
        + stl * 1.0
        + ast * 0.7
        + blk * 0.7
        - turnovers * 1.0
        - pf * 0.4
    )

    # Per-minute game score
    gs_per_min = game_score / minutes if minutes > 0 else 0

    # BPR component (already -15 to +20 scale)
    # Map to 0-100: BPR 0 → 50, BPR +10 → 80, BPR -10 → 20
    bpr_component = 50 + (bpr * 3.0)

    # Efficiency component: TS% mapped to 0-100
    # TS% 0.52 → 50, 0.62 → 70, 0.42 → 30
    ts_component = 50 + (ts_pct - 0.52) * 200

    # Volume component: minutes share + usage
    min_share = minutes / 40.0  # fraction of full game
    vol_component = 50 + (min_share - 0.5) * 40 + (gs_per_min - 0.4) * 30

    # Weighted composite
    pgis = (
        0.40 * bpr_component
        + 0.25 * ts_component
        + 0.20 * vol_component
        + 0.15 * (50 + game_score * 1.5)  # raw production bonus
    )

    return max(0, min(100, round(pgis, 1)))


def compute_season_pgis(game_pgis_list: list[tuple[float, float]]) -> float:
    """Season PGIS: minutes-weighted average of game PGIS values.
    Input: list of (pgis, minutes) tuples."""
    total_min = sum(m for _, m in game_pgis_list)
    if total_min <= 0:
        return 50.0
    weighted = sum(p * m for p, m in game_pgis_list)
    return round(weighted / total_min, 1)


# ═══════════════════════════════════════════════════════════════════════════
# TGIS — Team Game Impact Score
# Composite per-game team performance score.
# ═══════════════════════════════════════════════════════════════════════════

def compute_tgis(
    team_pts: int,
    opp_pts: int,
    team_fgm: int, team_fga: int,
    team_three_pm: int, team_three_pa: int,
    team_ftm: int, team_fta: int,
    team_ast: int, team_stl: int, team_blk: int,
    team_oreb: int, team_dreb: int,
    team_to: int, team_pf: int,
    team_poss: float,
    is_home: bool,
) -> float:
    """
    Compute Team Game Impact Score (0-100, 50 = average).
    Combines offensive efficiency, defensive performance, and margin.
    """
    if team_poss <= 0:
        return 50.0

    # Offensive efficiency: PPP
    off_ppp = team_pts / team_poss if team_poss > 0 else 0.0

    # TS%
    total_sa = team_fga + 0.44 * team_fta
    ts_pct = (team_pts / (2 * total_sa)) if total_sa > 0 else 0.0

    # Turnover rate
    tov_rate = team_to / team_poss if team_poss > 0 else 0.0

    # Assist rate
    ast_rate = team_ast / team_fgm if team_fgm > 0 else 0.0

    # Margin
    margin = team_pts - opp_pts

    # Offensive component (0-100)
    off_comp = 50 + (off_ppp - 1.00) * 80  # 1.00 PPP = 50, 1.10 = 58

    # Defensive component (opponent PPP → lower is better)
    opp_poss = team_poss  # approximate (actual may differ slightly)
    def_ppp = opp_pts / opp_poss if opp_poss > 0 else 1.0
    def_comp = 50 - (def_ppp - 1.00) * 80  # 1.00 = 50, 0.90 = 58

    # Margin component
    margin_comp = 50 + margin * 1.5

    # Efficiency bonuses
    eff_comp = 50 + (ts_pct - 0.52) * 100 - tov_rate * 100 + ast_rate * 10

    tgis = (
        0.30 * off_comp
        + 0.30 * def_comp
        + 0.25 * margin_comp
        + 0.15 * eff_comp
    )

    return max(0, min(100, round(tgis, 1)))


# ═══════════════════════════════════════════════════════════════════════════
# IMPACT MODIFIERS — System-Aware Adjustments
# Reference: spec Impact Modifiers doc
# These modify the baseline evaluation based on system context.
# ═══════════════════════════════════════════════════════════════════════════

# Offensive system impact on cluster importance (adjustment multipliers)
# Applied after base cluster scoring to produce system-adjusted KR.
OFF_SYSTEM_MODIFIERS: dict[str, dict[str, float]] = {
    "spread_pick_and_roll":   {"shooting": 1.10, "finishing": 1.05, "playmaking": 1.15, "perimeter_defense": 1.0, "interior_defense": 0.95, "rebounding": 0.90, "frame": 0.95},
    "five_out_motion":        {"shooting": 1.15, "finishing": 0.95, "playmaking": 1.10, "perimeter_defense": 1.0, "interior_defense": 0.90, "rebounding": 0.90, "frame": 0.95},
    "motion_read_react":      {"shooting": 1.05, "finishing": 1.00, "playmaking": 1.10, "perimeter_defense": 1.0, "interior_defense": 1.00, "rebounding": 0.95, "frame": 1.00},
    "pace_and_space":         {"shooting": 1.10, "finishing": 1.05, "playmaking": 1.05, "perimeter_defense": 0.95, "interior_defense": 0.90, "rebounding": 0.95, "frame": 1.05},
    "dribble_drive":          {"shooting": 0.95, "finishing": 1.15, "playmaking": 1.10, "perimeter_defense": 1.0, "interior_defense": 0.95, "rebounding": 0.95, "frame": 1.05},
    "princeton":              {"shooting": 1.05, "finishing": 1.00, "playmaking": 1.15, "perimeter_defense": 1.0, "interior_defense": 1.00, "rebounding": 0.95, "frame": 0.95},
    "flex":                   {"shooting": 1.00, "finishing": 1.05, "playmaking": 1.05, "perimeter_defense": 1.0, "interior_defense": 1.00, "rebounding": 1.00, "frame": 1.00},
    "swing":                  {"shooting": 1.05, "finishing": 1.00, "playmaking": 1.05, "perimeter_defense": 1.0, "interior_defense": 1.00, "rebounding": 0.95, "frame": 1.00},
    "post_centric_inside_out":{"shooting": 0.90, "finishing": 1.15, "playmaking": 0.95, "perimeter_defense": 1.0, "interior_defense": 1.10, "rebounding": 1.10, "frame": 1.10},
    "moreyball":              {"shooting": 1.15, "finishing": 1.10, "playmaking": 1.05, "perimeter_defense": 0.95, "interior_defense": 0.85, "rebounding": 0.85, "frame": 0.95},
    "heliocentric":           {"shooting": 1.00, "finishing": 1.05, "playmaking": 1.15, "perimeter_defense": 1.0, "interior_defense": 0.95, "rebounding": 0.90, "frame": 1.00},
}

# Defensive system impact on cluster importance
DEF_SYSTEM_MODIFIERS: dict[str, dict[str, float]] = {
    "containment_man":        {"shooting": 1.0, "finishing": 1.0, "playmaking": 1.0, "perimeter_defense": 1.05, "interior_defense": 1.00, "rebounding": 1.00, "frame": 1.05},
    "pack_line":              {"shooting": 1.0, "finishing": 1.0, "playmaking": 1.0, "perimeter_defense": 0.95, "interior_defense": 1.15, "rebounding": 1.05, "frame": 1.05},
    "pressure_man_denial":    {"shooting": 1.0, "finishing": 1.0, "playmaking": 1.0, "perimeter_defense": 1.15, "interior_defense": 0.95, "rebounding": 0.95, "frame": 1.10},
    "switch_everything":      {"shooting": 1.0, "finishing": 1.0, "playmaking": 1.0, "perimeter_defense": 1.10, "interior_defense": 1.05, "rebounding": 0.95, "frame": 1.15},
    "ice_no_middle":          {"shooting": 1.0, "finishing": 1.0, "playmaking": 1.0, "perimeter_defense": 1.05, "interior_defense": 1.10, "rebounding": 1.00, "frame": 1.05},
    "zone_structured":        {"shooting": 1.0, "finishing": 1.0, "playmaking": 1.0, "perimeter_defense": 0.90, "interior_defense": 1.10, "rebounding": 1.10, "frame": 0.95},
    "matchup_zone_hybrid":    {"shooting": 1.0, "finishing": 1.0, "playmaking": 1.0, "perimeter_defense": 1.00, "interior_defense": 1.05, "rebounding": 1.05, "frame": 1.05},
    "press_pressure_defense": {"shooting": 1.0, "finishing": 1.0, "playmaking": 1.0, "perimeter_defense": 1.10, "interior_defense": 0.90, "rebounding": 0.90, "frame": 1.15},
    "junk_special":           {"shooting": 1.0, "finishing": 1.0, "playmaking": 1.0, "perimeter_defense": 1.00, "interior_defense": 1.00, "rebounding": 1.00, "frame": 1.00},
}


def apply_impact_modifiers(
    clusters: dict[str, float],
    off_system: str | None,
    def_system: str | None,
) -> dict[str, float]:
    """
    Apply system-aware impact modifiers to cluster scores.
    Returns modified cluster scores.
    """
    result = dict(clusters)

    if off_system and off_system in OFF_SYSTEM_MODIFIERS:
        mods = OFF_SYSTEM_MODIFIERS[off_system]
        for k, mult in mods.items():
            if k in result:
                result[k] = max(0, min(100, round(result[k] * mult)))

    if def_system and def_system in DEF_SYSTEM_MODIFIERS:
        mods = DEF_SYSTEM_MODIFIERS[def_system]
        for k, mult in mods.items():
            if k in result:
                result[k] = max(0, min(100, round(result[k] * mult)))

    return result
