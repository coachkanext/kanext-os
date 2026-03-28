"""
System Risks — College v4.0

Source: Basketball Player Intelligence v3 spec
14 college risks: 9 Major (-2.0) + 5 Minor (-1.0)

v4.0 Changes vs v3.0:
  - Turnover Risk major: threshold lowered 20% → 17% TOV%
  - Elevated Turnover Risk minor: range shifted from 17–19.9% to 14–16.9%

Note: System Risks formally belong to Block 2 (System Context) in the spec.
For the standalone national pool evaluation (Block 1 only), we apply the
player-intrinsic subset that is evaluable from box-score data.
System-context-dependent risks (e.g. System Locked, Defensive Target) are
not applied here — they require team/scheme context.

College Major Risks (-2.0):  Range Gap, No Gravity, Turnover Risk,
  Defensive Target, Switch Liability, Foul Machine, Severe Undersize,
  System Locked (Severe), Role Collapse
College Minor Risks (-1.0): Limited Range, Low Shooting Volume,
  Elevated Turnover Risk, Partial System Lock, Role Fragility

Evaluable from box score (applied in this pipeline):
  Major: Range Gap, Turnover Risk, Foul Machine, Severe Undersize
  Minor: Limited Range, Low Shooting Volume, Elevated Turnover Risk, Role Fragility

All other risks require tracking/Synergy/manual data → not applied here.
"""
from __future__ import annotations


# ═══════════════════════════════════════════════════════════════════════════
# Position average heights (inches) for undersize checks
# v3 positions: PG/SG/SF/PF/C
# ═══════════════════════════════════════════════════════════════════════════

POSITION_AVG_HEIGHT: dict[str, int] = {
    "PG": 74,   # 6'2"
    "SG": 76,   # 6'4"
    "SF": 78,   # 6'6"
    "PF": 80,   # 6'8"
    "C":  82,   # 6'10"
}

# Positions considered "perimeter" for shooting-volume risk
PERIMETER_POSITIONS = {"PG", "SG", "SF"}


# ═══════════════════════════════════════════════════════════════════════════
# Risk Evaluation
# ═══════════════════════════════════════════════════════════════════════════

def evaluate_system_risks(
    season_stats: dict,
    trait_inputs: dict,
    height_inches: int | None,
    position: str,
    games_played: int,
    team_max_gp: int,
) -> dict:
    """
    Evaluate system risks for a player.

    Only applies risks evaluable from box-score data.

    Returns
    -------
    dict with:
      risks         : list of triggered risk dicts
      total_penalty : float (sum of penalties, ≤ 0)
    """
    triggered: list[dict] = []

    def _f(v) -> float:
        return float(v) if v is not None else 0.0

    min_pg      = _f(season_stats.get("minutes_per_game"))
    to_pg       = _f(season_stats.get("to_per_game"))
    pf_pg       = _f(season_stats.get("pf_per_game"))
    three_pct   = _f(season_stats.get("three_pct"))
    three_pa_pg = _f(season_stats.get("three_pa_per_game"))
    fga_pg      = _f(season_stats.get("fga_per_game"))
    fta_pg      = _f(season_stats.get("fta_per_game"))

    # Estimated possessions used per game
    est_poss     = (min_pg / 40.0) * 70.0 if min_pg > 5 else 0.0
    poss_used    = fga_pg + 0.44 * fta_pg + to_pg

    # ─────────────────────────────────────────────────────────────────
    # MAJOR: Range Gap
    # Guards/wings with no 3PT threat (3PA/G = 0 or very low + low 3P%)
    # Rationale: creates systematic defensive advantage against player.
    # ─────────────────────────────────────────────────────────────────
    if position in PERIMETER_POSITIONS:
        if three_pa_pg < 0.5 or (three_pa_pg < 1.5 and three_pct < 0.28):
            triggered.append({
                "key": "range_gap",
                "name": "Range Gap",
                "type": "major",
                "penalty": -2.0,
                "trigger_values": {
                    "three_pa_pg": round(three_pa_pg, 1),
                    "three_pct": round(three_pct, 3),
                    "position": position,
                },
            })

    # ─────────────────────────────────────────────────────────────────
    # MAJOR: Turnover Risk
    # TOV% ≥ 17% (v4.0: lowered from ≥ 20%)
    # ─────────────────────────────────────────────────────────────────
    if poss_used > 0:
        tov_pct = (to_pg / poss_used) * 100.0
        if tov_pct >= 17.0:
            triggered.append({
                "key": "turnover_risk",
                "name": "Turnover Risk",
                "type": "major",
                "penalty": -2.0,
                "trigger_values": {"tov_pct": round(tov_pct, 1)},
            })

    # ─────────────────────────────────────────────────────────────────
    # MAJOR: Foul Machine
    # PF per 100 possessions ≥ 6.0
    # ─────────────────────────────────────────────────────────────────
    if est_poss > 0:
        pf_per_100 = (pf_pg / est_poss) * 100.0
        if pf_per_100 >= 6.0:
            triggered.append({
                "key": "foul_machine",
                "name": "Foul Machine",
                "type": "major",
                "penalty": -2.0,
                "trigger_values": {"pf_per_100": round(pf_per_100, 1)},
            })

    # ─────────────────────────────────────────────────────────────────
    # MAJOR: Severe Undersize
    # Height ≥ 4" below position average
    # ─────────────────────────────────────────────────────────────────
    pos_avg = POSITION_AVG_HEIGHT.get(position)
    if height_inches is not None and pos_avg is not None:
        deficit = pos_avg - height_inches
        if deficit >= 4:
            triggered.append({
                "key": "severe_undersize",
                "name": "Severe Undersize",
                "type": "major",
                "penalty": -2.0,
                "trigger_values": {
                    "height_inches": height_inches,
                    "position_avg":  pos_avg,
                    "deficit":       deficit,
                },
            })

    # ─────────────────────────────────────────────────────────────────
    # MINOR: Limited Range
    # 3P% 28-33% AND 3PA/G > 2.0 (attempts but poor accuracy)
    # ─────────────────────────────────────────────────────────────────
    if 0.28 <= three_pct <= 0.33 and three_pa_pg > 2.0:
        triggered.append({
            "key": "limited_range",
            "name": "Limited Range",
            "type": "minor",
            "penalty": -1.0,
            "trigger_values": {
                "three_pct":   round(three_pct, 3),
                "three_pa_pg": round(three_pa_pg, 1),
            },
        })

    # ─────────────────────────────────────────────────────────────────
    # MINOR: Low Shooting Volume
    # Perimeter positions with 3PA/G < 1.0 (not enough range to threaten)
    # Note: doesn't overlap with Range Gap (which fires at < 0.5 or very low%)
    # ─────────────────────────────────────────────────────────────────
    if position in PERIMETER_POSITIONS:
        # Only apply if Range Gap major was NOT already triggered
        rg_triggered = any(r["key"] == "range_gap" for r in triggered)
        if not rg_triggered and 0.5 <= three_pa_pg < 1.0:
            triggered.append({
                "key": "low_shooting_volume",
                "name": "Low Shooting Volume",
                "type": "minor",
                "penalty": -1.0,
                "trigger_values": {
                    "three_pa_pg": round(three_pa_pg, 1),
                    "position":    position,
                },
            })

    # ─────────────────────────────────────────────────────────────────
    # MINOR: Elevated Turnover Risk
    # TOV% 14-16.9% (v4.0: shifted down from 17-19.9%)
    # ─────────────────────────────────────────────────────────────────
    if poss_used > 0:
        tov_pct_minor = (to_pg / poss_used) * 100.0
        # Only apply if major Turnover Risk was NOT triggered
        tr_triggered = any(r["key"] == "turnover_risk" for r in triggered)
        if not tr_triggered and 14.0 <= tov_pct_minor < 17.0:
            triggered.append({
                "key": "elevated_turnover_risk",
                "name": "Elevated Turnover Risk",
                "type": "minor",
                "penalty": -1.0,
                "trigger_values": {"tov_pct": round(tov_pct_minor, 1)},
            })

    # ─────────────────────────────────────────────────────────────────
    # MINOR: Role Fragility
    # GP < 60% of team max GP (durability/availability concern)
    # ─────────────────────────────────────────────────────────────────
    if team_max_gp > 0:
        gp_pct = games_played / team_max_gp
        if gp_pct < 0.60:
            triggered.append({
                "key": "role_fragility",
                "name": "Role Fragility",
                "type": "minor",
                "penalty": -1.0,
                "trigger_values": {
                    "games_played": games_played,
                    "team_max_gp":  team_max_gp,
                    "gp_pct":       round(gp_pct, 2),
                },
            })

    return {
        "risks":         triggered,
        "total_penalty": sum(r["penalty"] for r in triggered),
    }
