from __future__ import annotations
"""
Base Coverage Compensators — Post-badge, pre-KLVN adjustments.

Three compensators fix known blind spots in box-score-only evaluation:
  1. Creator Leverage Boost   — lifts underrated high-usage creators (PG/CG/W)
  2. Clean-Stat Big Deflation — penalizes passive bigs with inflated efficiency (F/B)
  3. Role + Minutes Gate      — penalizes unreliable small-sample / low-minute players

Pipeline order: league_kr → +badges → +compensators → KLVN → final KR

Active ONLY at Coverage Tier = Base (box-score). Shuts off when
Synergy/Tracking data is available (future coverage tiers).
"""

# Expected season games by level (used for GP penalty)
GP_TARGETS: dict[str, int] = {
    "ncaa_d1": 30,
    "ncaa_d2": 28,
    "ncaa_d3": 25,
    "naia": 28,
    "njcaa_d1": 28,
    "njcaa_d2": 25,
    "njcaa_d3": 22,
    "cccaa": 28,
    "uscaa": 22,
    "nccaa_d1": 25,
    "nccaa_d2": 22,
}
DEFAULT_GP_TARGET = 25


def _clamp(val: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, val))


# ═══════════════════════════════════════════════════════════════════════════
# 1. Creator Leverage Boost — PG / CG / W only
# ═══════════════════════════════════════════════════════════════════════════

CREATOR_ELIGIBLE = frozenset(["PG", "CG", "W"])
CREATOR_MAX_BOOST = 4.5


def creator_leverage_boost(stats: dict, position: str) -> dict:
    """
    Boost high-usage creator guards/wings whose shot creation, gravity,
    and advantage generation aren't captured by box-score stats alone.
    """
    result = {
        "boost_off": 0.0,
        "applied": False,
        "usage": 0.0,
        "signal": 0.0,
        "vol_index": 0.0,
        "ast_index": 0.0,
        "ftr_index": 0.0,
        "three_idx": 0.0,
    }

    if position not in CREATOR_ELIGIBLE:
        return result

    min_pg = stats.get("minutes_pg", 0.0)
    fga_pg = stats.get("fga_pg", 0.0)
    fta_pg = stats.get("fta_pg", 0.0)
    to_pg = stats.get("to_pg", 0.0)
    ast_pg = stats.get("ast_pg", 0.0)
    three_pa_pg = stats.get("three_pa_pg", 0.0)

    # Usage formula (same as compute_season_stats line 163)
    usage = ((fga_pg + 0.44 * fta_pg + to_pg) / (min_pg / 40.0 * 70.0) * 100) if min_pg > 5 else 0.0
    result["usage"] = round(usage, 1)

    # Trigger: minutes ≥ 10, usage ≥ 18%, ast ≥ 2.0
    if min_pg < 10 or usage < 18 or ast_pg < 2.0:
        return result

    # Free throw rate (driving/aggression proxy)
    ftr = fta_pg / max(fga_pg, 1.0)

    # Creation signal (composite 0–1)
    vol_index = _clamp((usage - 18) / 12, 0, 1)
    ast_index = _clamp((ast_pg - 2) / 4, 0, 1)
    ftr_index = _clamp((ftr - 0.25) / 0.25, 0, 1)
    three_idx = _clamp((three_pa_pg - 3) / 5, 0, 1)

    signal = 0.35 * vol_index + 0.30 * ast_index + 0.20 * ftr_index + 0.15 * three_idx

    boost = round(signal * CREATOR_MAX_BOOST, 2)

    result.update({
        "boost_off": boost,
        "applied": True,
        "signal": round(signal, 3),
        "vol_index": round(vol_index, 3),
        "ast_index": round(ast_index, 3),
        "ftr_index": round(ftr_index, 3),
        "three_idx": round(three_idx, 3),
    })
    return result


# ═══════════════════════════════════════════════════════════════════════════
# 2. Clean-Stat Big Deflation — F / B only
# ═══════════════════════════════════════════════════════════════════════════

BIG_ELIGIBLE = frozenset(["F", "B"])
BIG_MAX_PENALTY = 4.0
BIG_TOTAL_CAP = 5.0


def clean_stat_big_deflation(stats: dict, position: str,
                             badge_off_boost: float) -> dict:
    """
    Penalize low-usage bigs with inflated efficiency from easy looks.
    Their clean stats (high FG%, rebounds, blocks on low volume) look
    elite when the player is just finishing plays others create.
    """
    result = {
        "penalty_off": 0.0,
        "applied": False,
        "usage": 0.0,
        "passivity": 0.0,
        "usage_factor": 0.0,
        "stat_penalty": 0.0,
        "badge_clawback": 0.0,
    }

    if position not in BIG_ELIGIBLE:
        return result

    min_pg = stats.get("minutes_pg", 0.0)
    fga_pg = stats.get("fga_pg", 0.0)
    fta_pg = stats.get("fta_pg", 0.0)
    to_pg = stats.get("to_pg", 0.0)
    ast_pg = stats.get("ast_pg", 0.0)
    fg_pct = stats.get("fg_pct", 0.0)

    # Usage formula
    usage = ((fga_pg + 0.44 * fta_pg + to_pg) / (min_pg / 40.0 * 70.0) * 100) if min_pg > 5 else 0.0
    result["usage"] = round(usage, 1)

    # Trigger: minutes ≥ 8, usage < 16%, fg_pct ≥ 0.50
    if min_pg < 8 or usage >= 16 or fg_pct < 0.50:
        return result

    # Free throw rate
    ftr = fta_pg / max(fga_pg, 1.0)

    # Exemption: legitimate star big who attacks/creates
    if ftr >= 0.40 or ast_pg >= 2.5:
        return result

    # Passivity score (composite 0–1)
    ftr_pass = _clamp((0.30 - ftr) / 0.15, 0, 1)
    ast_pass = _clamp((1.5 - ast_pg) / 1.5, 0, 1)
    vol_pass = _clamp((8 - fga_pg) / 5, 0, 1)

    passivity = (ftr_pass + ast_pass + vol_pass) / 3.0

    # Usage factor: lower usage → bigger deflation
    usage_factor = _clamp((16 - usage) / 8, 0, 1)

    # Penalty
    stat_penalty = passivity * usage_factor * BIG_MAX_PENALTY

    # Badge clawback: if passive big got offensive badges, claw back 40%
    badge_clawback = min(badge_off_boost * 0.40, 2.0)

    total = min(stat_penalty + badge_clawback, BIG_TOTAL_CAP)

    result.update({
        "penalty_off": round(-total, 2),
        "applied": True,
        "passivity": round(passivity, 3),
        "usage_factor": round(usage_factor, 3),
        "stat_penalty": round(stat_penalty, 2),
        "badge_clawback": round(badge_clawback, 2),
    })
    return result


# ═══════════════════════════════════════════════════════════════════════════
# 3. Role + Minutes Reliability Gate — All positions
# ═══════════════════════════════════════════════════════════════════════════

GATE_TOTAL_CAP = 6.0


def role_minutes_gate(stats: dict, games_played: int,
                      level_key: str, min_cov: float) -> dict:
    """
    Penalize players with unreliable data: low minutes, low coverage,
    or low games played. Applied equally to off + def.
    """
    min_pg = stats.get("minutes_pg", 0.0)
    gp_target = GP_TARGETS.get(level_key, DEFAULT_GP_TARGET)

    # Minutes penalty (linear fade 16→8 mpg)
    if min_pg >= 16:
        min_penalty = 0.0
    elif min_pg >= 8:
        fade = (16 - min_pg) / 8
        min_penalty = fade * 4.0
    else:
        min_penalty = 4.0

    # Coverage penalty (minutes coverage < 80%)
    if min_cov < 0.80:
        cov_fade = _clamp((0.80 - min_cov) / 0.40, 0, 1)
        cov_penalty = cov_fade * 2.0
    else:
        cov_penalty = 0.0

    # Games played penalty (< half expected season)
    gp_half = gp_target * 0.5
    if games_played < gp_half:
        gp_fade = 1.0 - (games_played / gp_half) if gp_half > 0 else 1.0
        gp_penalty = gp_fade * 2.0
    else:
        gp_penalty = 0.0

    total = min(min_penalty + cov_penalty + gp_penalty, GATE_TOTAL_CAP)

    return {
        "penalty_overall": round(-total, 2) if total > 0 else 0.0,
        "applied": total > 0,
        "min_penalty": round(min_penalty, 2),
        "cov_penalty": round(cov_penalty, 2),
        "gp_penalty": round(gp_penalty, 2),
        "gp_target": gp_target,
        "minutes_pg": round(min_pg, 1),
        "min_cov": round(min_cov, 3),
        "games_played": games_played,
    }


# ═══════════════════════════════════════════════════════════════════════════
# Orchestrator
# ═══════════════════════════════════════════════════════════════════════════

def apply_base_compensators(
    stats: dict,
    position: str,
    clusters_league: dict[str, float],
    badge_off_boost: float,
    games_played: int,
    level_key: str,
    min_cov: float,
) -> dict:
    """
    Run all three Base Coverage compensators and aggregate adjustments.

    Returns off_adj, def_adj, overall_adj plus full diagnostics for each.
    """
    creator = creator_leverage_boost(stats, position)
    bigdeflate = clean_stat_big_deflation(stats, position, badge_off_boost)
    gate = role_minutes_gate(stats, games_played, level_key, min_cov)

    # Aggregate adjustments
    # Creator boost: offensive only, gate: applied to both off + def equally
    off_adj = creator["boost_off"] + bigdeflate["penalty_off"] + gate["penalty_overall"]
    def_adj = gate["penalty_overall"]
    overall_adj = (creator["boost_off"] * 0.53
                   + bigdeflate["penalty_off"] * 0.53
                   + gate["penalty_overall"])

    return {
        "off_adj": round(off_adj, 2),
        "def_adj": round(def_adj, 2),
        "overall_adj": round(overall_adj, 2),
        "creator": creator,
        "bigdeflate": bigdeflate,
        "gate": gate,
    }
