from __future__ import annotations
"""
Cluster Scoring — Box-Score Approximation of 7 Canonical Clusters
Maps available box-score stats to the 7 KR clusters on a 0-100 scale.

Reference: spec/canonical/_text/01_Player Evaluation Engine/Trait Library.txt

Since we only have aggregate box-score data (no Synergy/tracking), each cluster
is approximated using the best available statistical proxies. Scores are banded
using the calibration tables from the Trait Library spec.
"""

import math
from klvn import shrink, get_lambda


def _band(value: float, thresholds: list[tuple[float, int]], lower_is_better: bool = False) -> int:
    """
    Map a value to a score band (0-100) using threshold breakpoints.
    thresholds: list of (cutoff, score) sorted by cutoff ascending for normal,
                or descending for lower-is-better.
    """
    if lower_is_better:
        # Reverse: lower values = higher scores
        for cutoff, score in thresholds:
            if value <= cutoff:
                return score
        return thresholds[-1][1] if thresholds else 50
    else:
        for cutoff, score in reversed(thresholds):
            if value >= cutoff:
                return score
        return thresholds[0][1] if thresholds else 50


def _lerp_band(value: float, bands: list[tuple[float, float, int]], lower_is_better: bool = False) -> float:
    """
    Linear interpolation between band boundaries for smoother scoring.
    bands: list of (low, high, score) where value in [low, high) maps to score.
    Returns a float score with interpolation.
    """
    if lower_is_better:
        bands = [(lo, hi, sc) for lo, hi, sc in reversed(bands)]

    for i, (lo, hi, sc) in enumerate(bands):
        if lower_is_better:
            if value <= hi:
                if i + 1 < len(bands):
                    next_lo, next_hi, next_sc = bands[i + 1]
                    # Interpolate within band
                    if hi != lo:
                        frac = (value - lo) / (hi - lo)
                        return sc + frac * (next_sc - sc)
                return float(sc)
        else:
            if lo <= value <= hi:
                return float(sc)
            elif value > hi and i == len(bands) - 1:
                return float(sc)
    return 50.0


# ═══════════════════════════════════════════════════════════════════════════
# SHOOTING CLUSTER (traits 1-7)
# ═══════════════════════════════════════════════════════════════════════════

def score_shooting(
    three_pct: float, three_pa_pg: float,
    fg_pct: float, ft_pct: float,
    fga_pg: float, three_pm_pg: float,
    level_key: str, n_games: int,
) -> float:
    """
    Approximate Shooting cluster from aggregate 3P%, volume, FG%, FT%.
    Spec traits: Spot-Up 3, Movement 3, Off-Dribble 3, Deep 3, 2PT C&S, 2PT OD, FT.
    Without shot-type breakdowns, we approximate from aggregate shooting.
    """
    # 3PT efficiency band (Tables 1-4 averaged — catch-and-shoot proxy)
    # 90: 42%+, 80: 38-41%, 70: 35-37%, 60: 31-34%, <60: <31%
    three_pct_band = _band(three_pct, [
        (0.00, 35), (0.31, 55), (0.35, 65), (0.38, 75), (0.42, 90),
    ])

    # 3PT volume band (Tables 1-4 averaged)
    # 90: 3.5+, 80: 2.5-3.4, 70: 1.8-2.4, 60: 1.0-1.7
    three_vol_band = _band(three_pa_pg, [
        (0.0, 35), (1.0, 55), (1.8, 65), (2.5, 75), (3.5, 90),
    ])

    # Combined 3PT score: 70% efficiency, 30% volume (spec formula)
    three_score = 0.70 * three_pct_band + 0.30 * three_vol_band

    # 2PT/midrange proxy from overall FG% minus 3P contribution
    two_pt_fga = max(0, fga_pg - three_pa_pg) if fga_pg > 0 else 0
    two_pt_fgm = max(0, (fg_pct * fga_pg) - (three_pct * three_pa_pg)) if fga_pg > 0 else 0
    two_pt_pct = (two_pt_fgm / two_pt_fga) if two_pt_fga > 0.5 else 0.45
    # Table 5/6: 90: 50%+, 80: 46-49%, 70: 42-45%, 60: 38-41%
    two_pt_band = _band(two_pt_pct, [
        (0.00, 35), (0.38, 55), (0.42, 65), (0.46, 75), (0.50, 90),
    ])

    # Free throw (Table 7)
    # 90: 88%+, 80: 80-87%, 70: 72-79%, 60: 65-71%
    ft_band = _band(ft_pct, [
        (0.00, 35), (0.65, 55), (0.72, 65), (0.80, 75), (0.88, 90),
    ])

    # Weighted composite:
    # 3PT dominates shooting cluster (~60%), 2PT midrange (~25%), FT (~15%)
    # This approximates the 7 trait weights when we can't break down shot types
    raw = 0.60 * three_score + 0.25 * two_pt_band + 0.15 * ft_band

    return max(0, min(100, round(raw)))


# ═══════════════════════════════════════════════════════════════════════════
# FINISHING CLUSTER (traits 1-5)
# ═══════════════════════════════════════════════════════════════════════════

def score_finishing(
    fg_pct: float, fga_pg: float,
    three_pct: float, three_pa_pg: float,
    fta_pg: float, ftm_pg: float,
    pts_pg: float, level_key: str,
) -> float:
    """
    Approximate Finishing cluster.
    Spec traits: Layup, Floater, Dunk, Close Finishing, Foul Draw Rate.
    Approximated from 2P efficiency at the rim (FG% - 3P contribution) and FT rate.
    """
    # Estimate paint/rim FGA: non-3P attempts
    two_fga_pg = max(0, fga_pg - three_pa_pg)
    two_fgm_pg = max(0, (fg_pct * fga_pg) - (three_pct * three_pa_pg)) if fga_pg > 0 else 0
    two_pt_pct = (two_fgm_pg / two_fga_pg) if two_fga_pg > 0.5 else 0.45

    # Rim finishing efficiency (Table 8 layups + Table 11 close finishing)
    # 90: 65%+, 80: 58-64%, 70: 52-57%, 60: 46-51%
    finish_eff_band = _band(two_pt_pct, [
        (0.00, 35), (0.46, 55), (0.52, 65), (0.58, 75), (0.65, 90),
    ])

    # Finishing volume: 2P attempts per game
    # 90: 4.0+, 80: 2.8-3.9, 70: 1.8-2.7, 60: 1.0-1.7
    finish_vol_band = _band(two_fga_pg, [
        (0.0, 35), (1.0, 55), (1.8, 65), (2.8, 75), (4.0, 90),
    ])

    # Foul draw rate: FTA / (2P FGA) — proxy for paint finishing aggression
    # Table 12: 90: 0.40+, 80: 0.32-0.39, 70: 0.25-0.31, 60: 0.18-0.24
    foul_draw = (fta_pg / two_fga_pg) if two_fga_pg > 0.5 else 0.15
    foul_band = _band(foul_draw, [
        (0.00, 35), (0.18, 55), (0.25, 65), (0.32, 75), (0.40, 90),
    ])

    # Weighted: 65% efficiency, 20% volume, 15% foul draw (spec weights)
    raw = 0.55 * finish_eff_band + 0.25 * finish_vol_band + 0.20 * foul_band

    return max(0, min(100, round(raw)))


# ═══════════════════════════════════════════════════════════════════════════
# PLAYMAKING CLUSTER (traits 1-7)
# ═══════════════════════════════════════════════════════════════════════════

def score_playmaking(
    ast_pg: float, to_pg: float,
    fga_pg: float, pts_pg: float,
    minutes_pg: float, level_key: str,
) -> float:
    """
    Approximate Playmaking cluster.
    Spec traits: Passing Accuracy, Passing Vision, Drive-Kick, Transition,
                 Ball Security, Screen Assists, Hockey Assists.
    Approximated from assists, turnovers, AST/TO ratio.
    """
    # Passing Vision proxy: AST/G → Potential Assists ≈ AST * 2
    # Table 14: 90: 8.0+, 80: 6.0-7.9, 70: 4.0-5.9, 60: 2.5-3.9
    pot_ast = ast_pg * 2.0  # rough approximation
    vision_band = _band(pot_ast, [
        (0.0, 35), (2.5, 55), (4.0, 65), (6.0, 75), (8.0, 90),
    ])

    # Ball Security (Table 17): TOV per 100 touches — lower is better
    # Approximate touches from FGA + AST + TO
    touches_pg = fga_pg + ast_pg + to_pg
    tov_rate = (to_pg / touches_pg * 100) if touches_pg > 0 else 5.0
    security_band = _band(tov_rate, [
        (2.5, 90), (3.6, 80), (5.0, 70), (6.8, 60), (100.0, 35),
    ], lower_is_better=True)

    # AST/TO ratio as playmaking efficiency signal
    ast_to = (ast_pg / to_pg) if to_pg > 0.1 else ast_pg * 5
    ast_to_band = _band(ast_to, [
        (0.0, 35), (1.0, 50), (1.5, 60), (2.0, 70), (2.5, 80), (3.5, 90),
    ])

    # Raw assist volume (per game)
    ast_vol_band = _band(ast_pg, [
        (0.0, 35), (1.5, 50), (3.0, 60), (4.5, 70), (6.0, 80), (8.0, 90),
    ])

    # Weighted composite: vision 35%, security 25%, AST ratio 20%, volume 20%
    raw = 0.35 * vision_band + 0.25 * security_band + 0.20 * ast_to_band + 0.20 * ast_vol_band

    return max(0, min(100, round(raw)))


# ═══════════════════════════════════════════════════════════════════════════
# PERIMETER DEFENSE CLUSTER (traits 1-8)
# ═══════════════════════════════════════════════════════════════════════════

def score_perimeter_defense(
    stl_pg: float, pf_pg: float,
    minutes_pg: float, level_key: str,
    dreb_pg: float = 0,
) -> float:
    """
    Approximate Perimeter Defense cluster.
    Spec traits: On-Ball Containment, Ball Pressure, Screen Navigation,
                 Shot Contest, Steal, Off-Ball Denial, Disruption, Foul Discipline.
    Very limited from box score — primarily steals and fouls.
    """
    # Steal rate proxy (Table 24): STL/100 poss ≈ STL/G * (100/70)
    stl_per100 = stl_pg * (100 / 70)  # approximate
    stl_band = _band(stl_per100, [
        (0.0, 35), (1.3, 55), (2.0, 65), (2.7, 75), (3.5, 90),
    ])

    # Foul discipline proxy (Table 27): lower PF/100 = better
    # 90: ≤2.6, 80: 2.7-3.4, 70: 3.5-4.3, 60: 4.4-5.3
    pf_per100 = pf_pg * (100 / 70)
    foul_band = _band(pf_per100, [
        (2.6, 90), (3.4, 80), (4.3, 70), (5.3, 60), (100.0, 35),
    ], lower_is_better=True)

    # Per-minute activity as proxy for defensive engagement
    stl_per_min = (stl_pg / minutes_pg) if minutes_pg > 0 else 0
    activity_band = _band(stl_per_min, [
        (0.0, 40), (0.02, 50), (0.04, 60), (0.06, 70), (0.08, 80), (0.10, 90),
    ])

    # With only box score, we weight steals heavily but temper with uncertainty
    # Default floor of 50 for traits we can't measure (containment, contests, etc.)
    unmeasured_floor = 50.0

    # Weighted: steals 40%, foul discipline 20%, activity 15%, unmeasured 25%
    raw = 0.40 * stl_band + 0.20 * foul_band + 0.15 * activity_band + 0.25 * unmeasured_floor

    return max(0, min(100, round(raw)))


# ═══════════════════════════════════════════════════════════════════════════
# INTERIOR DEFENSE CLUSTER (traits 1-9)
# ═══════════════════════════════════════════════════════════════════════════

def score_interior_defense(
    blk_pg: float, pf_pg: float,
    dreb_pg: float, minutes_pg: float,
    level_key: str,
) -> float:
    """
    Approximate Interior Defense cluster.
    Spec traits: Block, Rim Deterrence, Vertical Contest, Post Defense,
                 Help Defense, Roll Man Defense, Disruption, Foul Discipline, Positioning.
    Primarily from blocks, with fouls as foul discipline proxy.
    """
    # Block rate (Table 28): BLK/100 opponent paint FGA
    # Approximate: BLK/G * (100/70) as proxy for BLK/100 poss
    blk_per100 = blk_pg * (100 / 70)
    # Table 28 uses BLK/100 PaintFGA — our proxy is rougher
    # 90: 12.0+, 80: 8.5-11.9, 70: 5.5-8.4, 60: 3.0-5.4
    # Scale down since we're using total possessions not paint FGA
    blk_band = _band(blk_per100, [
        (0.0, 35), (1.0, 50), (2.0, 60), (3.5, 70), (5.0, 80), (7.0, 90),
    ])

    # Interior foul discipline (Table 35): lower fouls = better
    pf_per100 = pf_pg * (100 / 70)
    foul_band = _band(pf_per100, [
        (2.0, 90), (3.0, 80), (4.2, 70), (5.5, 60), (100.0, 35),
    ], lower_is_better=True)

    # Rim deterrence proxy: blocks per minute
    blk_per_min = (blk_pg / minutes_pg) if minutes_pg > 0 else 0
    deter_band = _band(blk_per_min, [
        (0.0, 40), (0.02, 50), (0.04, 60), (0.07, 70), (0.10, 80), (0.14, 90),
    ])

    # DREB as help defense proxy — interior defenders rebound
    dreb_band = _band(dreb_pg, [
        (0.0, 35), (2.0, 50), (3.5, 60), (5.0, 70), (7.0, 80), (9.0, 90),
    ])

    unmeasured_floor = 50.0

    # Weighted: blocks 35%, deterrence 15%, fouls 15%, dreb 15%, unmeasured 20%
    raw = 0.35 * blk_band + 0.15 * deter_band + 0.15 * foul_band + 0.15 * dreb_band + 0.20 * unmeasured_floor

    return max(0, min(100, round(raw)))


# ═══════════════════════════════════════════════════════════════════════════
# REBOUNDING CLUSTER (traits 1-6)
# ═══════════════════════════════════════════════════════════════════════════

def score_rebounding(
    oreb_pg: float, dreb_pg: float, reb_pg: float,
    minutes_pg: float, level_key: str,
) -> float:
    """
    Approximate Rebounding cluster.
    Spec traits: Defensive Rebounding, Offensive Rebounding, Box-Out,
                 Rebound Conversion, Range & Tracking, Outlet Impact.
    """
    # Defensive rebounding (Table 37): DREB/G
    # 90: 7.5+, 80: 5.5-7.4, 70: 3.8-5.4, 60: 2.5-3.7
    dreb_band = _band(dreb_pg, [
        (0.0, 35), (2.5, 55), (3.8, 65), (5.5, 75), (7.5, 90),
    ])

    # Offensive rebounding (Table 38): OREB/G
    # 90: 3.2+, 80: 2.2-3.1, 70: 1.4-2.1, 60: 0.7-1.3
    oreb_band = _band(oreb_pg, [
        (0.0, 35), (0.7, 55), (1.4, 65), (2.2, 75), (3.2, 90),
    ])

    # Reb per minute as intensity proxy
    reb_per_min = (reb_pg / minutes_pg) if minutes_pg > 0 else 0
    intensity_band = _band(reb_per_min, [
        (0.0, 35), (0.10, 45), (0.15, 55), (0.20, 65), (0.25, 75), (0.30, 90),
    ])

    # Weighted: DREB 45%, OREB 35%, intensity 20%
    # (Spec: DREB is 60% rate + 40% volume, OREB same — we use per-game as combined proxy)
    raw = 0.45 * dreb_band + 0.35 * oreb_band + 0.20 * intensity_band

    return max(0, min(100, round(raw)))


# ═══════════════════════════════════════════════════════════════════════════
# FRAME / PHYSICAL CLUSTER (traits 1-12)
# ═══════════════════════════════════════════════════════════════════════════

def score_frame(
    height_inches: int | None,
    weight_lbs: int | None,
    position: str | None,
    minutes_pg: float,
    stl_pg: float, blk_pg: float,
    level_key: str,
) -> float:
    """
    Approximate Frame/Physical cluster.
    Spec traits: Speed (w/ and w/o ball), Acceleration, Deceleration,
                 Agility, Lateral Quickness, Vertical, Strength, Power,
                 Endurance, Motor, Body Control.
    Very limited from box score — use height/weight + activity proxies.
    """
    # Height band by position expectation
    # Guards: 72-78 avg, Wings: 76-80, Forwards: 78-82, Bigs: 80-84
    pos = (position or "W").upper()
    height = height_inches or 0

    if pos in ("PG", "G"):
        ht_band = _band(height, [(0, 40), (70, 50), (73, 60), (75, 70), (77, 80), (79, 90)])
    elif pos in ("CG", "SG"):
        ht_band = _band(height, [(0, 40), (72, 50), (75, 60), (77, 70), (79, 80), (81, 90)])
    elif pos in ("W", "SF", "GF"):
        ht_band = _band(height, [(0, 40), (75, 50), (77, 60), (79, 70), (80, 80), (82, 90)])
    elif pos in ("F", "PF"):
        ht_band = _band(height, [(0, 40), (77, 50), (79, 60), (80, 70), (82, 80), (84, 90)])
    else:  # B, C
        ht_band = _band(height, [(0, 40), (79, 50), (81, 60), (82, 70), (84, 80), (86, 90)])

    # Weight / strength proxy
    wt = weight_lbs or 0
    if pos in ("PG", "G", "CG", "SG"):
        wt_band = _band(wt, [(0, 40), (165, 50), (175, 60), (185, 70), (195, 80), (210, 90)])
    elif pos in ("W", "SF", "GF"):
        wt_band = _band(wt, [(0, 40), (185, 50), (195, 60), (205, 70), (215, 80), (230, 90)])
    else:
        wt_band = _band(wt, [(0, 40), (205, 50), (215, 60), (225, 70), (240, 80), (260, 90)])

    # Endurance proxy: minutes played per game
    endurance_band = _band(minutes_pg, [
        (0, 30), (10, 40), (18, 50), (24, 60), (30, 70), (34, 80), (38, 90),
    ])

    # Motor/activity proxy: (STL + BLK) per minute — hustle stats
    hustle_per_min = ((stl_pg + blk_pg) / minutes_pg) if minutes_pg > 0 else 0
    motor_band = _band(hustle_per_min, [
        (0.0, 40), (0.03, 50), (0.06, 60), (0.09, 70), (0.12, 80), (0.16, 90),
    ])

    # If no height/weight data, rely more on activity proxies
    if height <= 0 and wt <= 0:
        raw = 0.40 * endurance_band + 0.35 * motor_band + 0.25 * 50.0
    else:
        raw = 0.25 * ht_band + 0.20 * wt_band + 0.25 * endurance_band + 0.20 * motor_band + 0.10 * 50.0

    return max(0, min(100, round(raw)))


# ═══════════════════════════════════════════════════════════════════════════
# COMPUTE ALL 7 CLUSTERS
# ═══════════════════════════════════════════════════════════════════════════

def compute_all_clusters(
    stats: dict,
    level_key: str,
    height_inches: int | None = None,
    weight_lbs: int | None = None,
    position: str | None = None,
) -> dict[str, float]:
    """
    Compute all 7 cluster scores from season averages.
    stats dict keys: pts_pg, reb_pg, ast_pg, stl_pg, blk_pg, to_pg, pf_pg,
                     fg_pct, three_pct, ft_pct, fga_pg, three_pa_pg, fta_pg,
                     oreb_pg, dreb_pg, minutes_pg, games_played
    """
    lam = get_lambda(level_key)

    shooting = score_shooting(
        three_pct=stats.get("three_pct", 0),
        three_pa_pg=stats.get("three_pa_pg", 0),
        fg_pct=stats.get("fg_pct", 0),
        ft_pct=stats.get("ft_pct", 0),
        fga_pg=stats.get("fga_pg", 0),
        three_pm_pg=stats.get("three_pa_pg", 0) * stats.get("three_pct", 0),
        level_key=level_key,
        n_games=stats.get("games_played", 0),
    )

    finishing = score_finishing(
        fg_pct=stats.get("fg_pct", 0),
        fga_pg=stats.get("fga_pg", 0),
        three_pct=stats.get("three_pct", 0),
        three_pa_pg=stats.get("three_pa_pg", 0),
        fta_pg=stats.get("fta_pg", 0),
        ftm_pg=stats.get("fta_pg", 0) * stats.get("ft_pct", 0),
        pts_pg=stats.get("pts_pg", 0),
        level_key=level_key,
    )

    playmaking = score_playmaking(
        ast_pg=stats.get("ast_pg", 0),
        to_pg=stats.get("to_pg", 0),
        fga_pg=stats.get("fga_pg", 0),
        pts_pg=stats.get("pts_pg", 0),
        minutes_pg=stats.get("minutes_pg", 0),
        level_key=level_key,
    )

    perimeter_defense = score_perimeter_defense(
        stl_pg=stats.get("stl_pg", 0),
        pf_pg=stats.get("pf_pg", 0),
        minutes_pg=stats.get("minutes_pg", 0),
        level_key=level_key,
        dreb_pg=stats.get("dreb_pg", 0),
    )

    interior_defense = score_interior_defense(
        blk_pg=stats.get("blk_pg", 0),
        pf_pg=stats.get("pf_pg", 0),
        dreb_pg=stats.get("dreb_pg", 0),
        minutes_pg=stats.get("minutes_pg", 0),
        level_key=level_key,
    )

    rebounding = score_rebounding(
        oreb_pg=stats.get("oreb_pg", 0),
        dreb_pg=stats.get("dreb_pg", 0),
        reb_pg=stats.get("reb_pg", 0),
        minutes_pg=stats.get("minutes_pg", 0),
        level_key=level_key,
    )

    frame = score_frame(
        height_inches=height_inches,
        weight_lbs=weight_lbs,
        position=position,
        minutes_pg=stats.get("minutes_pg", 0),
        stl_pg=stats.get("stl_pg", 0),
        blk_pg=stats.get("blk_pg", 0),
        level_key=level_key,
    )

    # Apply KLVN level adjustment — boost lower-level scores slightly less,
    # penalize overperformance at weak levels.
    # The raw cluster scores are already banded against college-level tables,
    # so we apply a soft level correction (not full lambda) to avoid double-penalizing.
    level_adj = 0.5 + 0.5 * lam  # ranges from 0.80 at D3 to 1.0 at D1 HM

    return {
        "shooting": max(0, min(100, round(shooting * level_adj))),
        "finishing": max(0, min(100, round(finishing * level_adj))),
        "playmaking": max(0, min(100, round(playmaking * level_adj))),
        "perimeter_defense": max(0, min(100, round(perimeter_defense * level_adj))),
        "interior_defense": max(0, min(100, round(interior_defense * level_adj))),
        "rebounding": max(0, min(100, round(rebounding * level_adj))),
        "frame": max(0, min(100, round(frame * level_adj))),
    }
