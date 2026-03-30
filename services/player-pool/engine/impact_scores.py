from __future__ import annotations
"""
Impact Scores — Game BPR and TPQ (Team Performance Quality)
Plus Impact Modifiers for system-adjusted context.

Reference:
  spec/canonical/_text/01_Player Evaluation Engine/BPR_v2_Spec.md
  spec/canonical/_text/01_Player Evaluation Engine/TPQ_v1_Spec.md

Game BPR: Single-game player impact (same six-stage formula as season BPR).
  Previously named PGIS — retired per BPR v2 spec (March 2026).
TPQ: Single-game team performance quality (0-10 scale).
  Previously named TGIS — retired per TPQ v1 spec (March 2026).
Impact Modifiers: Contextual adjustments based on system, opponent, role.
"""

import math


# ═══════════════════════════════════════════════════════════════════════════
# Game BPR — Player Game Impact (0-100 display scale)
# Wraps the core BPR v2 result into a 0-100 display number.
# Used for postgame player cards and game log views.
# Previously called PGIS — term retired March 2026.
# ═══════════════════════════════════════════════════════════════════════════

def compute_game_bpr(
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
    Compute game BPR display score (0-100, 50 = average).
    Combines box-score production, efficiency, and BPR into one number.
    BPR v2 is zero-centered [-10, +10]; this maps it to a 0-100 display scale.
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

    gs_per_min = game_score / minutes if minutes > 0 else 0

    # BPR v2 is [-10, +10]; map to 0-100: 0 → 50, +10 → 80, -10 → 20
    bpr_component = 50 + (bpr * 3.0)

    # Efficiency component: TS% mapped to 0-100
    ts_component = 50 + (ts_pct - 0.52) * 200

    # Volume component
    min_share = minutes / 40.0
    vol_component = 50 + (min_share - 0.5) * 40 + (gs_per_min - 0.4) * 30

    game_bpr_score = (
        0.40 * bpr_component
        + 0.25 * ts_component
        + 0.20 * vol_component
        + 0.15 * (50 + game_score * 1.5)
    )

    return max(0, min(100, round(game_bpr_score, 1)))


# Keep alias for any callers not yet updated
compute_pgis = compute_game_bpr


def compute_season_game_bpr(game_scores: list[tuple[float, float]]) -> float:
    """Season game BPR display score: minutes-weighted average.
    Input: list of (game_bpr_score, minutes) tuples."""
    total_min = sum(m for _, m in game_scores)
    if total_min <= 0:
        return 50.0
    weighted = sum(p * m for p, m in game_scores)
    return round(weighted / total_min, 1)


# Keep alias for any callers not yet updated
compute_season_pgis = compute_season_game_bpr


# ═══════════════════════════════════════════════════════════════════════════
# TPQ — Team Performance Quality
# Single-game team performance score (0-10 scale, 5.0 = expected).
# Previously called TGIS — term retired per TPQ v1 spec (March 2026).
# Full TPQ formula (four-component) requires Team KR — not yet implemented.
# This function is a placeholder that approximates TPQ from box score only.
# ═══════════════════════════════════════════════════════════════════════════

def compute_tpq(
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
    Compute Team Performance Quality score (0-10, 5.0 = expected).
    Box-score approximation; full TPQ requires Team KR (not yet available).
    See TPQ_v1_Spec.md for the four-component full formula.
    """
    if team_poss <= 0:
        return 5.0

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

    # Offensive component (0-10)
    off_comp = 5.0 + (off_ppp - 1.00) * 8.0

    # Defensive component
    opp_poss = team_poss
    def_ppp = opp_pts / opp_poss if opp_poss > 0 else 1.0
    def_comp = 5.0 - (def_ppp - 1.00) * 8.0

    # Margin component
    margin_comp = 5.0 + margin * 0.15

    # Efficiency component
    eff_comp = 5.0 + (ts_pct - 0.52) * 10.0 - tov_rate * 10.0 + ast_rate * 1.0

    tpq = (
        0.30 * off_comp
        + 0.30 * def_comp
        + 0.25 * margin_comp
        + 0.15 * eff_comp
    )

    return max(0.0, min(10.0, round(tpq, 2)))


# Keep alias for any callers not yet updated
compute_tgis = compute_tpq


# ═══════════════════════════════════════════════════════════════════════════
# IMPACT MODIFIERS — System-Aware Adjustments
# Reference: spec Impact Modifiers doc
# These modify the baseline evaluation based on system context.
# ═══════════════════════════════════════════════════════════════════════════

# Offensive system impact on cluster importance (adjustment multipliers)
OFF_SYSTEM_MODIFIERS: dict[str, dict[str, float]] = {
    "spread_pick_and_roll":   {"shooting": 1.10, "finishing": 1.05, "playmaking": 1.15, "on_ball_defense": 1.0, "team_defense": 0.95, "rebounding": 0.90, "physical": 0.95},
    "five_out_motion":        {"shooting": 1.15, "finishing": 0.95, "playmaking": 1.10, "on_ball_defense": 1.0, "team_defense": 0.90, "rebounding": 0.90, "physical": 0.95},
    "motion_read_react":      {"shooting": 1.05, "finishing": 1.00, "playmaking": 1.10, "on_ball_defense": 1.0, "team_defense": 1.00, "rebounding": 0.95, "physical": 1.00},
    "pace_and_space":         {"shooting": 1.10, "finishing": 1.05, "playmaking": 1.05, "on_ball_defense": 0.95, "team_defense": 0.90, "rebounding": 0.95, "physical": 1.05},
    "dribble_drive":          {"shooting": 0.95, "finishing": 1.15, "playmaking": 1.10, "on_ball_defense": 1.0, "team_defense": 0.95, "rebounding": 0.95, "physical": 1.05},
    "princeton":              {"shooting": 1.05, "finishing": 1.00, "playmaking": 1.15, "on_ball_defense": 1.0, "team_defense": 1.00, "rebounding": 0.95, "physical": 0.95},
    "flex":                   {"shooting": 1.00, "finishing": 1.05, "playmaking": 1.05, "on_ball_defense": 1.0, "team_defense": 1.00, "rebounding": 1.00, "physical": 1.00},
    "swing":                  {"shooting": 1.05, "finishing": 1.00, "playmaking": 1.05, "on_ball_defense": 1.0, "team_defense": 1.00, "rebounding": 0.95, "physical": 1.00},
    "post_centric_inside_out":{"shooting": 0.90, "finishing": 1.15, "playmaking": 0.95, "on_ball_defense": 1.0, "team_defense": 1.10, "rebounding": 1.10, "physical": 1.10},
    "moreyball":              {"shooting": 1.15, "finishing": 1.10, "playmaking": 1.05, "on_ball_defense": 0.95, "team_defense": 0.85, "rebounding": 0.85, "physical": 0.95},
    "heliocentric":           {"shooting": 1.00, "finishing": 1.05, "playmaking": 1.15, "on_ball_defense": 1.0, "team_defense": 0.95, "rebounding": 0.90, "physical": 1.00},
}

# Defensive system impact on cluster importance
DEF_SYSTEM_MODIFIERS: dict[str, dict[str, float]] = {
    "containment_man":        {"shooting": 1.0, "finishing": 1.0, "playmaking": 1.0, "on_ball_defense": 1.05, "team_defense": 1.00, "rebounding": 1.00, "physical": 1.05},
    "pack_line":              {"shooting": 1.0, "finishing": 1.0, "playmaking": 1.0, "on_ball_defense": 0.95, "team_defense": 1.15, "rebounding": 1.05, "physical": 1.05},
    "pressure_man_denial":    {"shooting": 1.0, "finishing": 1.0, "playmaking": 1.0, "on_ball_defense": 1.15, "team_defense": 0.95, "rebounding": 0.95, "physical": 1.10},
    "switch_everything":      {"shooting": 1.0, "finishing": 1.0, "playmaking": 1.0, "on_ball_defense": 1.10, "team_defense": 1.05, "rebounding": 0.95, "physical": 1.15},
    "ice_no_middle":          {"shooting": 1.0, "finishing": 1.0, "playmaking": 1.0, "on_ball_defense": 1.05, "team_defense": 1.10, "rebounding": 1.00, "physical": 1.05},
    "zone_structured":        {"shooting": 1.0, "finishing": 1.0, "playmaking": 1.0, "on_ball_defense": 0.90, "team_defense": 1.10, "rebounding": 1.10, "physical": 0.95},
    "matchup_zone_hybrid":    {"shooting": 1.0, "finishing": 1.0, "playmaking": 1.0, "on_ball_defense": 1.00, "team_defense": 1.05, "rebounding": 1.05, "physical": 1.05},
    "press_pressure_defense": {"shooting": 1.0, "finishing": 1.0, "playmaking": 1.0, "on_ball_defense": 1.10, "team_defense": 0.90, "rebounding": 0.90, "physical": 1.15},
    "junk_special":           {"shooting": 1.0, "finishing": 1.0, "playmaking": 1.0, "on_ball_defense": 1.00, "team_defense": 1.00, "rebounding": 1.00, "physical": 1.00},
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
