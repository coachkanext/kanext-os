from __future__ import annotations
"""
BPR v2 — Basketball Performance Rating (Box-Score)
Six-stage pipeline per KaNeXT BPR v2 Spec (March 2026).
Reference: spec/canonical/_text/01_Player Evaluation Engine/KaNeXT — BPR.txt

BPR is zero-centered: 0 = average, positive = above average, negative = below.
Normalized across levels so +5 means the same percentile impact at any level.
Clamped to [-10, +10] after normalization.
"""

# ── Stage 1: Base Coefficients (per 100 possessions) ──────────────────────
BASE_COEFF: dict[str, float] = {
    "pts":   0.027,
    "ast":   0.135,
    "oreb":  0.100,
    "dreb":  0.035,
    "stl":   0.170,
    "blk":   0.100,
    "to":   -0.135,
    "pf":   -0.040,
    "fta":   0.015,
}

# ── Stage 1: Position Adjustment Multipliers ───────────────────────────────
# Canonical pool positions (PG/CG/W/F/B) → BPR positions (PG/SG/SF/PF/C)
CANON_TO_BPR_POS: dict[str, str] = {
    "PG": "PG",
    "CG": "SG",
    "W":  "SF",
    "F":  "PF",
    "B":  "C",
}

# POS_MULT[stat][bpr_pos] → multiplier
POS_MULT: dict[str, dict[str, float]] = {
    "ast":  {"PG": 0.85, "SG": 1.00, "SF": 1.15, "PF": 1.25, "C": 1.30},
    "oreb": {"PG": 1.30, "SG": 1.25, "SF": 1.10, "PF": 0.95, "C": 0.85},
    "dreb": {"PG": 1.25, "SG": 1.15, "SF": 1.00, "PF": 0.90, "C": 0.80},
    "stl":  {"PG": 0.90, "SG": 0.95, "SF": 1.00, "PF": 1.10, "C": 1.20},
    "blk":  {"PG": 1.40, "SG": 1.30, "SF": 1.15, "PF": 1.00, "C": 0.85},
    "pts":  {"PG": 1.00, "SG": 1.00, "SF": 1.00, "PF": 1.00, "C": 1.00},
    "to":   {"PG": 1.00, "SG": 1.00, "SF": 1.00, "PF": 1.00, "C": 1.00},
    "pf":   {"PG": 1.00, "SG": 1.00, "SF": 1.00, "PF": 1.00, "C": 1.00},
    "fta":  {"PG": 1.00, "SG": 1.00, "SF": 1.00, "PF": 1.00, "C": 1.00},
}

# ── Stage 6: Level Normalization Divisors ─────────────────────────────────
LEVEL_NORM: dict[str, float] = {
    "ncaa_d1_high_major": 1.00,
    "ncaa_d1_mid_major":  0.98,
    "ncaa_d1_low_major":  0.95,
    "ncaa_d2":            0.90,
    "njcaa_d1":           0.85,
    "naia":               0.83,
    "cccaa":              0.78,
    "njcaa_d2":           0.77,
    "ncaa_d3":            0.70,
    "njcaa_d3":           0.66,
    "uscaa":              0.62,
    "nccaa_d1":           0.58,
    "nccaa_d2":           0.55,
}


def _expected_ts(usg: float) -> float:
    """Stage 2: expected TS% by usage band."""
    if usg >= 35.0: return 0.540
    if usg >= 28.0: return 0.530
    if usg >= 22.0: return 0.520
    if usg >= 16.0: return 0.510
    return 0.500


def _detect_role(
    usg: float, ast_g: float, ts_pct: float,
    blk_g: float, stl_g: float, rpg: float,
    oreb_g: float, three_pct: float, three_pa_g: float,
) -> float:
    """Stage 3: detect role from stat profile, return multiplier."""
    # Use highest multiplier when multiple roles qualify.
    mult = 1.00

    if blk_g >= 2.0 or (stl_g >= 2.0 and rpg >= 7.0):
        mult = max(mult, 1.15)  # Defensive Anchor
    if usg < 22.0 and ts_pct >= 0.550:
        mult = max(mult, 1.10)  # Efficient Role Player
    if oreb_g >= 2.5 or (rpg >= 10.0 and usg < 25.0):
        mult = max(mult, 1.10)  # Rebounder/Motor
    if three_pct >= 0.380 and three_pa_g >= 3.0 and usg < 25.0:
        mult = max(mult, 1.10)  # Specialist Shooter
    if 20.0 <= usg < 28.0 and ast_g >= 2.5:
        mult = max(mult, 1.05)  # Secondary Creator
    if usg >= 28.0 and ast_g >= 3.0:
        mult = max(mult, 1.00)  # Primary Creator (no boost)
    if usg >= 28.0 and ast_g < 3.0:
        # Volume Scorer — discount only if no higher role already set
        if mult == 1.00:
            mult = 0.95
    if usg < 15.0 and mult == 1.00:
        mult = 0.90  # Low-Impact Role

    return mult


def _credibility(mpg: float) -> float:
    """Stage 5: minutes credibility factor."""
    if mpg >= 30.0: return 1.00
    if mpg >= 25.0: return 0.97
    if mpg >= 20.0: return 0.93
    if mpg >= 15.0: return 0.88
    if mpg >= 10.0: return 0.82
    if mpg >= 5.0:  return 0.72
    return 0.55


def compute_bpr(
    minutes: float,
    pts: int, fgm: int, fga: int, ftm: int, fta: int,
    three_pm: int, three_pa: int,
    oreb: int, dreb: int,
    ast: int, stl: int, blk: int,
    turnovers: int, pf: int,
    team_poss: float | None = None,
    # v2 context params
    position: str = "W",
    level_key: str = "ncaa_d3",
    team_depth_score: float | None = None,
    usage_rate: float | None = None,
) -> float | None:
    """
    Compute per-game BPR (PGIS) using the v2 six-stage pipeline.
    Returns None if player had 0 minutes.

    position: canonical pool position (PG/CG/W/F/B). Defaults to W (SF multipliers).
    level_key: level key for Stage 6 normalization.
    team_depth_score: precomputed (top5_avg_ppg / 10). None → skip Stage 4.
    usage_rate: season USG% if available; otherwise estimated from game box score.
    """
    if not minutes or minutes <= 0:
        return None

    bpr_pos = CANON_TO_BPR_POS.get(position, "SF")

    # ── Stage 1: Position-Adjusted Base Production ────────────────────────
    if team_poss and team_poss > 0:
        player_poss = team_poss * (minutes / 40.0)
    else:
        player_poss = max(1.0, fga - oreb + turnovers + 0.44 * fta)

    scale = 100.0 / max(player_poss, 1.0)

    stat_100 = {
        "pts":  pts * scale,
        "ast":  ast * scale,
        "oreb": oreb * scale,
        "dreb": dreb * scale,
        "stl":  stl * scale,
        "blk":  blk * scale,
        "to":   turnovers * scale,
        "pf":   pf * scale,
        "fta":  fta * scale,
    }

    base_production = sum(
        stat_100[s] * BASE_COEFF[s] * POS_MULT[s][bpr_pos]
        for s in stat_100
    )

    # ── Stage 2: Efficiency-Volume Interaction ────────────────────────────
    total_sa = fga + 0.44 * fta
    ts_pct = (pts / (2.0 * total_sa)) if total_sa > 0 else 0.0

    if usage_rate is not None and usage_rate > 0:
        usg = float(usage_rate)
    else:
        usg = min(50.0, (fga + 0.44 * fta + turnovers) / max(player_poss, 1.0) * 100.0)

    expected_ts = _expected_ts(usg)
    ts_delta = ts_pct - expected_ts
    usage_weight = (usg / 25.0) ** 1.5
    ev_adjustment = max(-3.0, min(3.0, ts_delta * usage_weight * 12.0))

    # ── Stage 3: Role Context Multiplier ─────────────────────────────────
    rpg = oreb + dreb
    three_pct_g = (three_pm / three_pa) if three_pa > 0 else 0.0
    role_mult = _detect_role(
        usg=usg, ast_g=ast, ts_pct=ts_pct,
        blk_g=blk, stl_g=stl, rpg=rpg,
        oreb_g=oreb, three_pct=three_pct_g, three_pa_g=three_pa,
    )
    stage3_output = (base_production + ev_adjustment) * role_mult

    # ── Stage 4: Supporting Cast Adjustment ───────────────────────────────
    suppression_credit = 0.0
    if team_depth_score is not None and team_depth_score < 0.8:
        suppression_credit = min(1.0, (0.8 - team_depth_score) * 2.0)
    stage4_output = stage3_output + suppression_credit

    # ── Stage 5: Per-Minute Scaling ───────────────────────────────────────
    cred = _credibility(minutes)

    per_minute_rate = (base_production + ev_adjustment) / (minutes / 40.0)
    if per_minute_rate > 3.0 and minutes < 20:
        premium = min(0.5, (per_minute_rate - 3.0) * 0.15)
    else:
        premium = 0.0

    stage5_output = (stage4_output * cred) + premium

    # ── Stage 6: Level Normalization ──────────────────────────────────────
    norm_divisor = LEVEL_NORM.get(level_key, 0.70)
    normalized = stage5_output / norm_divisor

    return max(-10.0, min(10.0, round(normalized, 4)))


def season_bpr(game_bprs: list[tuple[float, float]]) -> float:
    """
    Compute season BPR as a minutes-weighted average of per-game BPRs.
    Input: list of (bpr_value, minutes) tuples.
    """
    total_min = sum(m for _, m in game_bprs)
    if total_min <= 0:
        return 0.0
    weighted = sum(b * m for b, m in game_bprs)
    return round(weighted / total_min, 4)


def compute_bpr_trend(game_bprs_ordered: list[float]) -> float:
    """
    BPR Trend: linear regression slope of last 10 games * 10.
    Input: bpr_values in chronological order (oldest → newest).
    """
    values = game_bprs_ordered[-10:]
    n = len(values)
    if n < 2:
        return 0.0

    x_mean = (n - 1) / 2.0
    y_mean = sum(values) / n

    num = sum((i - x_mean) * (v - y_mean) for i, v in enumerate(values))
    den = sum((i - x_mean) ** 2 for i in range(n))

    slope = (num / den) if den > 0 else 0.0
    return round(slope * 10.0, 4)
