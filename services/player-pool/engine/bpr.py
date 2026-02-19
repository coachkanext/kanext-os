from __future__ import annotations
"""
BPR — Basketball Performance Rating (Box-Score Approximation)
Computes per-game impact using a simplified Box Plus-Minus model.
Reference: spec/canonical/_text/01_Player Evaluation Engine/KaNeXT — BPR.txt

BPR is zero-centered: 0 = average, positive = above average, negative = below.
This V1 implementation uses box-score regression coefficients inspired by
Basketball-Reference BPM, adapted for the college level.
"""

import math


# ── BPR Coefficients (per-100-possession rates) ──
# These approximate the marginal value of each counting stat per 100 possessions.
# Calibrated against college BPM research.

COEFF = {
    "pts":   0.027,   # points (efficiency-adjusted below)
    "ast":   0.135,   # assists → creation value
    "oreb":  0.100,   # offensive rebounds → extra possessions
    "dreb":  0.035,   # defensive rebounds (lower value, expected)
    "stl":   0.170,   # steals → high-value turnovers forced
    "blk":   0.100,   # blocks → rim protection
    "to":   -0.135,   # turnovers → lost possessions
    "pf":   -0.040,   # fouls → free throw opportunities given
    "fta":   0.015,   # free throw attempts → paint aggression signal
}

# Scoring efficiency adjustment
# raw PTS contribution is adjusted by True Shooting above/below expected
TS_COEFF = 0.45  # multiplier on (TS% - expected_TS) * usage_proxy


def compute_bpr(
    minutes: float,
    pts: int, fgm: int, fga: int, ftm: int, fta: int,
    three_pm: int, three_pa: int,
    oreb: int, dreb: int,
    ast: int, stl: int, blk: int,
    turnovers: int, pf: int,
    team_poss: float | None = None,
) -> float | None:
    """
    Compute per-game BPR for a single game.
    Returns None if player had 0 minutes.
    """
    if not minutes or minutes <= 0:
        return None

    # Estimate possessions the player was on court for
    # Use team possessions prorated by minutes, or estimate from box score
    if team_poss and team_poss > 0:
        # Assume 40-minute game (college)
        player_poss = team_poss * (minutes / 40.0)
    else:
        # Estimate: FGA - OREB + TO + 0.44*FTA
        player_poss = max(1, fga - oreb + turnovers + 0.44 * fta)

    # Convert to per-100 rates
    scale = 100.0 / max(player_poss, 1)

    pts_100 = pts * scale
    ast_100 = ast * scale
    oreb_100 = oreb * scale
    dreb_100 = dreb * scale
    stl_100 = stl * scale
    blk_100 = blk * scale
    to_100 = turnovers * scale
    pf_100 = pf * scale
    fta_100 = fta * scale

    # True Shooting %
    total_sa = fga + 0.44 * fta  # shooting attempts
    ts_pct = (pts / (2 * total_sa)) if total_sa > 0 else 0.0
    expected_ts = 0.52  # college average TS%

    # Usage proxy (share of team shots used)
    usage_proxy = (fga + 0.44 * fta) * scale / 100.0

    # Raw BPR components
    raw = (
        COEFF["pts"] * pts_100
        + COEFF["ast"] * ast_100
        + COEFF["oreb"] * oreb_100
        + COEFF["dreb"] * dreb_100
        + COEFF["stl"] * stl_100
        + COEFF["blk"] * blk_100
        + COEFF["to"] * to_100
        + COEFF["pf"] * pf_100
        + COEFF["fta"] * fta_100
    )

    # Efficiency adjustment: reward/penalize relative to expected TS%
    ts_adj = TS_COEFF * (ts_pct - expected_ts) * usage_proxy * 100

    bpr = raw + ts_adj

    # Scale to reasonable range: roughly -10 to +15
    # Clamp to prevent extreme outliers from tiny samples
    return max(-15.0, min(20.0, round(bpr, 2)))


def season_bpr(game_bprs: list[tuple[float, float]]) -> float:
    """
    Compute season BPR as a minutes-weighted average of game BPRs.
    Input: list of (bpr_value, minutes) tuples.
    """
    total_min = sum(m for _, m in game_bprs)
    if total_min <= 0:
        return 0.0
    weighted = sum(b * m for b, m in game_bprs)
    return round(weighted / total_min, 2)
