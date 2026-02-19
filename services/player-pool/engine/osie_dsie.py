from __future__ import annotations
"""
OSIE/DSIE — Offensive & Defensive System Inference Engine (Box-Score V1)
Infers team offensive and defensive systems from aggregate team game stats.

Reference:
  spec/canonical/_text/03_Global Player & Team Evaluation Engine/System Inference Engine (SIE).txt
  spec/canonical/_text/03_Global Player & Team Evaluation Engine/OSIE_DSIE.txt

Since we only have box-score data (no Synergy/PlayVision), we use statistical
proxies to classify systems. Confidence is capped at 65% for box-score-only.
"""

import math

# ═══════════════════════════════════════════════════════════════════════════
# OFFENSIVE SYSTEMS (11 locked IDs)
# ═══════════════════════════════════════════════════════════════════════════

OFFENSIVE_SYSTEMS = [
    "spread_pick_and_roll",
    "five_out_motion",
    "motion_read_react",
    "pace_and_space",
    "dribble_drive",
    "princeton",
    "flex",
    "swing",
    "post_centric_inside_out",
    "moreyball",
    "heliocentric",
]

# ═══════════════════════════════════════════════════════════════════════════
# DEFENSIVE SYSTEMS (9 locked IDs)
# ═══════════════════════════════════════════════════════════════════════════

DEFENSIVE_SYSTEMS = [
    "containment_man",
    "pack_line",
    "pressure_man_denial",
    "switch_everything",
    "ice_no_middle",
    "zone_structured",
    "matchup_zone_hybrid",
    "press_pressure_defense",
    "junk_special",
]

# ═══════════════════════════════════════════════════════════════════════════
# PACE CLASSIFICATION (Locked)
# ═══════════════════════════════════════════════════════════════════════════

def classify_pace(pace100: float) -> tuple[str, float]:
    """Classify pace band from PACE100. Returns (band, pace100)."""
    if pace100 >= 74.0:
        return "Fast", pace100
    elif pace100 >= 68.0:
        return "Neutral", pace100
    else:
        return "Slow", pace100


# ═══════════════════════════════════════════════════════════════════════════
# OFFENSIVE SYSTEM INFERENCE (Box-Score Proxies)
# ═══════════════════════════════════════════════════════════════════════════

def infer_offensive_system(
    three_par: float,       # 3PA / FGA rate
    ft_rate: float,         # FTA / FGA rate
    ast_rate: float,        # AST / FGM rate
    pace100: float,         # team possessions per 40 min
    off_ppp: float,         # points per possession
    oreb_rate: float,       # OREB / total reb rate
) -> dict:
    """
    Infer offensive system from team-level box-score stats.
    Returns: primary_system, confidence, system_mix, pace_band.
    """
    scores: dict[str, float] = {}

    # ── Scoring each system based on statistical fingerprints ──

    # Moreyball: extreme 3PA rate + high FT rate (rim or three, nothing in between)
    morey_score = 0.0
    if three_par >= 0.42:
        morey_score += 1.0
    elif three_par >= 0.38:
        morey_score += 0.5
    if ft_rate >= 0.35:
        morey_score += 1.0
    elif ft_rate >= 0.28:
        morey_score += 0.5
    scores["moreyball"] = morey_score

    # Post-Centric: low 3PA rate, low ast rate, high FT rate
    post_score = 0.0
    if three_par <= 0.25:
        post_score += 1.0
    elif three_par <= 0.30:
        post_score += 0.5
    if ft_rate >= 0.30:
        post_score += 0.5
    if ast_rate <= 0.50:
        post_score += 0.5
    scores["post_centric_inside_out"] = post_score

    # Dribble Drive: moderate 3PA, high FT rate, lower ast rate
    dd_score = 0.0
    if 0.28 <= three_par <= 0.38:
        dd_score += 0.5
    if ft_rate >= 0.32:
        dd_score += 1.0
    elif ft_rate >= 0.25:
        dd_score += 0.5
    if ast_rate <= 0.55:
        dd_score += 0.5
    scores["dribble_drive"] = dd_score

    # Spread Pick-and-Roll: high 3PA + moderate-high ast rate
    spr_score = 0.0
    if three_par >= 0.35:
        spr_score += 1.0
    elif three_par >= 0.30:
        spr_score += 0.5
    if ast_rate >= 0.55:
        spr_score += 1.0
    elif ast_rate >= 0.50:
        spr_score += 0.5
    scores["spread_pick_and_roll"] = spr_score

    # 5-Out Motion: high 3PA + high ast rate + fast pace
    fiveout_score = 0.0
    if three_par >= 0.38:
        fiveout_score += 1.0
    elif three_par >= 0.33:
        fiveout_score += 0.5
    if ast_rate >= 0.60:
        fiveout_score += 1.0
    elif ast_rate >= 0.55:
        fiveout_score += 0.5
    if pace100 >= 72:
        fiveout_score += 0.5
    scores["five_out_motion"] = fiveout_score

    # Motion / Read & React: high ast rate, balanced shot profile
    mrr_score = 0.0
    if ast_rate >= 0.58:
        mrr_score += 1.0
    elif ast_rate >= 0.52:
        mrr_score += 0.5
    if 0.28 <= three_par <= 0.38:
        mrr_score += 0.5
    scores["motion_read_react"] = mrr_score

    # Pace & Space: fast pace + high 3PA
    ps_score = 0.0
    if pace100 >= 74:
        ps_score += 1.0
    elif pace100 >= 70:
        ps_score += 0.5
    if three_par >= 0.33:
        ps_score += 0.5
    scores["pace_and_space"] = ps_score

    # Princeton: slow pace, high ast rate, balanced
    prince_score = 0.0
    if pace100 <= 67:
        prince_score += 1.0
    elif pace100 <= 70:
        prince_score += 0.5
    if ast_rate >= 0.55:
        prince_score += 1.0
    elif ast_rate >= 0.50:
        prince_score += 0.5
    scores["princeton"] = prince_score

    # Flex: moderate pace, high ast rate, lower 3PA
    flex_score = 0.0
    if ast_rate >= 0.55:
        flex_score += 0.5
    if three_par <= 0.33:
        flex_score += 0.5
    if 65 <= pace100 <= 72:
        flex_score += 0.5
    scores["flex"] = flex_score

    # Swing: moderate everything, ball reversal heavy
    swing_score = 0.0
    if 0.30 <= three_par <= 0.38:
        swing_score += 0.5
    if ast_rate >= 0.52:
        swing_score += 0.5
    scores["swing"] = swing_score

    # Heliocentric: one dominant usage player (can't detect from team stats alone)
    # Default low score; would need player-level usage data
    scores["heliocentric"] = 0.0

    # ── Classification ──
    sorted_systems = sorted(scores.items(), key=lambda x: -x[1])
    top = sorted_systems[0]
    runner_up = sorted_systems[1] if len(sorted_systems) > 1 else (None, 0)

    primary = top[0]
    primary_score = top[1]

    # Dominance check
    margin = primary_score - runner_up[1] if runner_up[0] else primary_score
    dominant = margin >= 0.10 and primary_score >= 1.0

    # Confidence (box-score-only: capped at 65%)
    if dominant and primary_score >= 2.0:
        confidence = 65
    elif dominant:
        confidence = 55
    elif primary_score >= 1.0:
        confidence = 45
    else:
        confidence = 30

    # System mix
    system_mix = None
    if not dominant and runner_up[0]:
        total = primary_score + runner_up[1]
        if total > 0:
            system_mix = {
                primary: round(primary_score / total * 100),
                runner_up[0]: round(runner_up[1] / total * 100),
            }

    pace_band, _ = classify_pace(pace100)

    return {
        "off_primary_system": primary,
        "off_system_score": round(primary_score, 2),
        "off_confidence_pct": confidence,
        "off_system_mix": system_mix,
        "off_status": "OBSERVED" if primary_score >= 1.0 else "PROVISIONAL",
        "pace100": round(pace100, 1),
        "pace_band": pace_band,
    }


# ═══════════════════════════════════════════════════════════════════════════
# DEFENSIVE SYSTEM INFERENCE (Box-Score Proxies)
# ═══════════════════════════════════════════════════════════════════════════

def infer_defensive_system(
    opp_three_par: float,   # opponent 3PA / FGA allowed
    opp_ft_rate: float,     # opponent FTA / FGA allowed
    stl_rate: float,        # team STL per possession
    blk_rate: float,        # team BLK per possession
    tov_forced_rate: float, # team forced TO rate
    opp_off_ppp: float,     # opponent points per possession
    foul_rate: float,       # team fouls per possession
) -> dict:
    """
    Infer defensive system from team-level box-score stats.
    Returns: primary_system, confidence, system_mix.
    """
    scores: dict[str, float] = {}

    # Press / Pressure: high steal rate, high TO forced, high fouls
    press_score = 0.0
    if tov_forced_rate >= 0.22:
        press_score += 1.0
    elif tov_forced_rate >= 0.18:
        press_score += 0.5
    if stl_rate >= 0.10:
        press_score += 1.0
    elif stl_rate >= 0.07:
        press_score += 0.5
    if foul_rate >= 0.25:
        press_score += 0.5
    scores["press_pressure_defense"] = press_score

    # Zone: low steal rate, low foul rate, high opp 3PA allowed
    zone_score = 0.0
    if opp_three_par >= 0.38:
        zone_score += 1.0
    elif opp_three_par >= 0.34:
        zone_score += 0.5
    if stl_rate <= 0.06:
        zone_score += 0.5
    if foul_rate <= 0.18:
        zone_score += 0.5
    scores["zone_structured"] = zone_score

    # Matchup Zone: moderate stats, hybrid look
    mz_score = 0.0
    if 0.32 <= opp_three_par <= 0.38:
        mz_score += 0.5
    if stl_rate >= 0.06:
        mz_score += 0.5
    scores["matchup_zone_hybrid"] = mz_score

    # Switch Everything: moderate steal rate, low block rate (perimeter-heavy)
    switch_score = 0.0
    if stl_rate >= 0.07:
        switch_score += 0.5
    if blk_rate <= 0.04:
        switch_score += 0.5
    if opp_three_par <= 0.34:
        switch_score += 0.5
    scores["switch_everything"] = switch_score

    # ICE / No-Middle: moderate blocks, low opp 3PA, controlled
    ice_score = 0.0
    if opp_three_par <= 0.32:
        ice_score += 1.0
    elif opp_three_par <= 0.35:
        ice_score += 0.5
    if blk_rate >= 0.04:
        ice_score += 0.5
    scores["ice_no_middle"] = ice_score

    # Pack Line: high block rate, low opp 3PA, low steal rate
    pack_score = 0.0
    if blk_rate >= 0.05:
        pack_score += 1.0
    elif blk_rate >= 0.03:
        pack_score += 0.5
    if opp_three_par <= 0.33:
        pack_score += 0.5
    if stl_rate <= 0.07:
        pack_score += 0.5
    scores["pack_line"] = pack_score

    # Pressure Man (Denial): high steal rate, moderate blocks
    denial_score = 0.0
    if stl_rate >= 0.08:
        denial_score += 1.0
    elif stl_rate >= 0.06:
        denial_score += 0.5
    if tov_forced_rate >= 0.18:
        denial_score += 0.5
    if foul_rate >= 0.20:
        denial_score += 0.5
    scores["pressure_man_denial"] = denial_score

    # Containment Man (default): balanced stats, nothing extreme
    contain_score = 0.5  # slight default bias
    if 0.30 <= opp_three_par <= 0.36:
        contain_score += 0.5
    if 0.04 <= stl_rate <= 0.08:
        contain_score += 0.5
    scores["containment_man"] = contain_score

    # Junk: very unusual profiles
    scores["junk_special"] = 0.0

    # ── Classification ──
    sorted_systems = sorted(scores.items(), key=lambda x: -x[1])
    top = sorted_systems[0]
    runner_up = sorted_systems[1] if len(sorted_systems) > 1 else (None, 0)

    primary = top[0]
    primary_score = top[1]
    margin = primary_score - runner_up[1] if runner_up[0] else primary_score
    dominant = margin >= 0.10 and primary_score >= 1.0

    if dominant and primary_score >= 2.0:
        confidence = 65
    elif dominant:
        confidence = 55
    elif primary_score >= 1.0:
        confidence = 45
    else:
        confidence = 30

    system_mix = None
    if not dominant and runner_up[0]:
        total = primary_score + runner_up[1]
        if total > 0:
            system_mix = {
                primary: round(primary_score / total * 100),
                runner_up[0]: round(runner_up[1] / total * 100),
            }

    return {
        "def_primary_system": primary,
        "def_system_score": round(primary_score, 2),
        "def_confidence_pct": confidence,
        "def_system_mix": system_mix,
        "def_status": "OBSERVED" if primary_score >= 1.0 else "PROVISIONAL",
    }
