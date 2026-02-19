"""
Team KR Computation — Participation-weighted aggregation.
Reference: spec/canonical/_text/02_Team Evaluation Engine/Team KR Math + Weights.txt

Team_Offense_KR = Σ(Final_System_Offense_KRᵢ × wᵢ)
Team_Defense_KR = Σ(Final_System_Defense_KRᵢ × wᵢ)
Team_KR = Team_Offense_KR × 0.53 + Team_Defense_KR × 0.47

Locked 53/47 split. Rotation-only model (no starter/bench labels).
"""

MIN_PARTICIPATION = 0.05  # 5% threshold
OFF_WEIGHT = 0.53
DEF_WEIGHT = 0.47


def compute_team_kr(
    players: list[dict],
) -> dict:
    """
    Compute team KR from player rotation data.

    players: list of dicts with keys:
        - base_off_kr: float
        - base_def_kr: float
        - overall_kr: float
        - minutes_total: float (total season minutes)

    Returns: team_off_kr, team_def_kr, team_overall_kr, rotation_size
    """
    if not players:
        return {
            "team_off_kr": 0, "team_def_kr": 0,
            "team_overall_kr": 0, "rotation_size": 0,
        }

    # Calculate total minutes across all players
    total_min = sum(p.get("minutes_total", 0) for p in players)
    if total_min <= 0:
        return {
            "team_off_kr": 0, "team_def_kr": 0,
            "team_overall_kr": 0, "rotation_size": 0,
        }

    # Compute participation weights
    weighted_players = []
    for p in players:
        mins = p.get("minutes_total", 0)
        w = mins / total_min if total_min > 0 else 0
        if w >= MIN_PARTICIPATION:
            weighted_players.append({**p, "weight": w})

    if not weighted_players:
        return {
            "team_off_kr": 0, "team_def_kr": 0,
            "team_overall_kr": 0, "rotation_size": 0,
        }

    # Re-normalize weights after threshold filtering
    included_total = sum(p["weight"] for p in weighted_players)
    for p in weighted_players:
        p["weight"] = p["weight"] / included_total if included_total > 0 else 0

    # Team Offense KR
    team_off = sum(p.get("base_off_kr", 50) * p["weight"] for p in weighted_players)

    # Team Defense KR
    team_def = sum(p.get("base_def_kr", 50) * p["weight"] for p in weighted_players)

    # Overall Team KR (locked 53/47)
    team_overall = team_off * OFF_WEIGHT + team_def * DEF_WEIGHT

    return {
        "team_off_kr": round(team_off, 1),
        "team_def_kr": round(team_def, 1),
        "team_overall_kr": round(team_overall, 1),
        "rotation_size": len(weighted_players),
    }
