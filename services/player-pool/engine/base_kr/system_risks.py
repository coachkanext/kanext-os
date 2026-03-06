"""
System Risks — College v1

Source: System Risks.docx
24 college risks. ~8 evaluable from box-score data; remainder require
tracking/Synergy/manual scouting data and return status="not_evaluable".

Risk Types:
  - major: -2.0 penalty
  - minor: -1.0 penalty

Applied at Step 10 in the 13-step pipeline.
Penalties stack across triggered risks.
"""
from __future__ import annotations


# ═══════════════════════════════════════════════════════════════════════════
# Position average heights (inches) for undersize checks
# ═══════════════════════════════════════════════════════════════════════════

POSITION_AVG_HEIGHT: dict[str, int] = {
    "PG": 74,    # 6'2"
    "CG": 76,    # 6'4"
    "Wing": 78,  # 6'6"
    "Forward": 80,  # 6'8"
    "Big": 82,   # 6'10"
}

# ═══════════════════════════════════════════════════════════════════════════
# Risk Definitions — All 24
# ═══════════════════════════════════════════════════════════════════════════

RISK_DEFS: list[dict] = [
    # ── MAJOR RISKS (-2.0) ────────────────────────────────────────────
    {"key": "one_dimensional_scorer", "name": "One-Dimensional Scorer", "type": "major", "penalty": -2.0, "evaluable": False},
    {"key": "defensive_sieve", "name": "Defensive Sieve", "type": "major", "penalty": -2.0, "evaluable": False},
    {"key": "ball_stopper", "name": "Ball Stopper", "type": "major", "penalty": -2.0, "evaluable": False},
    {"key": "turnover_risk_major", "name": "Turnover Risk (Major)", "type": "major", "penalty": -2.0, "evaluable": True},
    {"key": "no_gravity", "name": "No Gravity", "type": "major", "penalty": -2.0, "evaluable": False},
    {"key": "switch_liability", "name": "Switch Liability", "type": "major", "penalty": -2.0, "evaluable": False},
    {"key": "role_collapse", "name": "Role Collapse", "type": "major", "penalty": -2.0, "evaluable": False},
    {"key": "foul_machine", "name": "Foul Machine", "type": "major", "penalty": -2.0, "evaluable": True},
    {"key": "fragility", "name": "Fragility", "type": "major", "penalty": -2.0, "evaluable": True},
    {"key": "severe_undersize", "name": "Severe Undersize", "type": "major", "penalty": -2.0, "evaluable": True},
    {"key": "motor_collapse", "name": "Motor Collapse", "type": "major", "penalty": -2.0, "evaluable": False},
    {"key": "decision_making_collapse", "name": "Decision-Making Collapse", "type": "major", "penalty": -2.0, "evaluable": False},

    # ── MINOR RISKS (-1.0) ────────────────────────────────────────────
    {"key": "limited_range", "name": "Limited Range", "type": "minor", "penalty": -1.0, "evaluable": True},
    {"key": "low_shooting_volume", "name": "Low Shooting Volume", "type": "minor", "penalty": -1.0, "evaluable": True},
    {"key": "elevated_turnover_risk", "name": "Elevated Turnover Risk", "type": "minor", "penalty": -1.0, "evaluable": True},
    {"key": "foul_prone", "name": "Foul-Prone", "type": "minor", "penalty": -1.0, "evaluable": False},
    {"key": "poor_free_throw", "name": "Poor Free Throw", "type": "minor", "penalty": -1.0, "evaluable": False},
    {"key": "finishing_void", "name": "Finishing Void", "type": "minor", "penalty": -1.0, "evaluable": False},
    {"key": "isolation_dependent", "name": "Isolation-Dependent", "type": "minor", "penalty": -1.0, "evaluable": False},
    {"key": "moderate_undersize", "name": "Moderate Undersize", "type": "minor", "penalty": -1.0, "evaluable": True},
    {"key": "transition_liability", "name": "Transition Liability", "type": "minor", "penalty": -1.0, "evaluable": False},
    {"key": "slow_decision_making", "name": "Slow Decision-Making", "type": "minor", "penalty": -1.0, "evaluable": False},
    {"key": "low_motor", "name": "Low Motor", "type": "minor", "penalty": -1.0, "evaluable": False},
    {"key": "conditioning_concern", "name": "Conditioning Concern", "type": "minor", "penalty": -1.0, "evaluable": False},
]

RISK_BY_KEY: dict[str, dict] = {r["key"]: r for r in RISK_DEFS}


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
    Evaluate all 24 system risks for a player.

    Parameters
    ----------
    season_stats : dict
        Player's season stat row (from DB query).
    trait_inputs : dict
        Derived trait inputs from build_trait_inputs().
    height_inches : int or None
        Player's height.
    position : str
        Mapped position (PG/CG/Wing/Forward/Big).
    games_played : int
        Games played this season.
    team_max_gp : int
        Maximum games played by any player on the team.

    Returns
    -------
    dict with:
      - risks: list of triggered risk dicts {key, name, type, penalty, trigger_values}
      - total_penalty: float (sum of penalties, always <= 0)
    """
    triggered: list[dict] = []

    # Helper to safely get float values
    def _f(v):
        if v is None:
            return 0.0
        return float(v)

    min_pg = _f(season_stats.get("minutes_per_game"))
    to_pg = _f(season_stats.get("to_per_game"))
    pf_pg = _f(season_stats.get("pf_per_game"))
    three_pct = _f(season_stats.get("three_pct"))
    three_pa_pg = _f(season_stats.get("three_pa_per_game"))

    # Estimate possessions for rate stats
    est_poss = (min_pg / 40.0) * 70.0 if min_pg > 5 else 0.0

    # ── Risk #4: Turnover Risk (Major) ─────────────────────────────
    # TOV% >= 20%  (TOV% ≈ TOV / possessions_used * 100)
    # Approximate possessions used = FGA + 0.44*FTA + TOV
    fga_pg = _f(season_stats.get("fga_per_game"))
    fta_pg = _f(season_stats.get("fta_per_game"))
    poss_used = fga_pg + 0.44 * fta_pg + to_pg
    if poss_used > 0:
        tov_pct = (to_pg / poss_used) * 100.0
        if tov_pct >= 20.0:
            triggered.append({
                "key": "turnover_risk_major",
                "name": "Turnover Risk (Major)",
                "type": "major",
                "penalty": -2.0,
                "trigger_values": {"tov_pct": round(tov_pct, 1)},
            })

    # ── Risk #8: Foul Machine ─────────────────────────────────────
    # PF per 100 possessions >= 6.0
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

    # ── Risk #9: Fragility ────────────────────────────────────────
    # GP < 60% of team max GP
    if team_max_gp > 0:
        gp_pct = games_played / team_max_gp
        if gp_pct < 0.60:
            triggered.append({
                "key": "fragility",
                "name": "Fragility",
                "type": "major",
                "penalty": -2.0,
                "trigger_values": {
                    "games_played": games_played,
                    "team_max_gp": team_max_gp,
                    "gp_pct": round(gp_pct, 2),
                },
            })

    # ── Risk #10: Severe Undersize ─────────────────────────────────
    # Height >= 4" below position average
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
                    "position_avg": pos_avg,
                    "deficit": deficit,
                },
            })

    # ── Risk #13: Limited Range ────────────────────────────────────
    # 3P% between 28-33% AND 3PA/G > 2.0
    if 0.28 <= three_pct <= 0.33 and three_pa_pg > 2.0:
        triggered.append({
            "key": "limited_range",
            "name": "Limited Range",
            "type": "minor",
            "penalty": -1.0,
            "trigger_values": {
                "three_pct": round(three_pct, 3),
                "three_pa_pg": round(three_pa_pg, 1),
            },
        })

    # ── Risk #14: Low Shooting Volume ──────────────────────────────
    # 3PA/G < 1.0 (guards and wings only)
    if position in ("PG", "CG", "Wing") and three_pa_pg < 1.0:
        triggered.append({
            "key": "low_shooting_volume",
            "name": "Low Shooting Volume",
            "type": "minor",
            "penalty": -1.0,
            "trigger_values": {
                "three_pa_pg": round(three_pa_pg, 1),
                "position": position,
            },
        })

    # ── Risk #15: Elevated Turnover Risk ───────────────────────────
    # TOV% 17-19% (but not >= 20%, which is major)
    if poss_used > 0:
        tov_pct_minor = (to_pg / poss_used) * 100.0
        if 17.0 <= tov_pct_minor < 20.0:
            triggered.append({
                "key": "elevated_turnover_risk",
                "name": "Elevated Turnover Risk",
                "type": "minor",
                "penalty": -1.0,
                "trigger_values": {"tov_pct": round(tov_pct_minor, 1)},
            })

    # ── Risk #20: Moderate Undersize ───────────────────────────────
    # Height 2-3" below position average (but not >= 4, which is severe)
    if height_inches is not None and pos_avg is not None:
        deficit_mod = pos_avg - height_inches
        if 2 <= deficit_mod <= 3:
            triggered.append({
                "key": "moderate_undersize",
                "name": "Moderate Undersize",
                "type": "minor",
                "penalty": -1.0,
                "trigger_values": {
                    "height_inches": height_inches,
                    "position_avg": pos_avg,
                    "deficit": deficit_mod,
                },
            })

    total_penalty = sum(r["penalty"] for r in triggered)

    return {
        "risks": triggered,
        "total_penalty": total_penalty,
    }
