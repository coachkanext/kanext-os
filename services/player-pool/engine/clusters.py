from __future__ import annotations
"""
Cluster Scoring — KLVN SkillKR Pipeline (v1.4)
Maps box-score stats to 7 KR clusters via the exact KLVN 4-step normalization
pipeline (shrinkage → expectation → Z-score → sigmoid) per sub-trait.

Each cluster = weighted composite of sub-trait SkillKR scores.

v1.4 changes:
  - Removed all per-minute traits (ast_per_min, stl_per_min, blk_per_min,
    reb_per_min, motor) — these inflate low-MPG players
  - Only per-game and efficiency traits remain
  - Redistributed weights across remaining traits
  - Z clamped to [-4, 4] in klvn.compute_skillkr
"""

import math
from klvn import compute_skillkr


def _sigmoid_stretch(z: float) -> float:
    """Sigmoid stretch for physical traits (height/weight) without shrinkage."""
    return 1.0 / (1.0 + math.exp(-1.2 * z)) - 0.5


# ═══════════════════════════════════════════════════════════════════════════
# SHOOTING CLUSTER (4 sub-traits)
# ═══════════════════════════════════════════════════════════════════════════

def score_shooting(
    three_pct: float, three_pa_pg: float,
    fg_pct: float, ft_pct: float,
    fga_pg: float, fta_pg: float,
    level_key: str, n_games: int,
) -> tuple[float, float, list[dict]]:
    """
    Shooting cluster via KLVN sub-traits.
    Composite: 0.60 * (0.70 * three_eff + 0.30 * three_vol) + 0.25 * two_pt + 0.15 * ft
    Returns: (cross_score, league_score, traits)
    """
    total_3pa = int(three_pa_pg * n_games)
    total_fta = int(fta_pg * n_games)

    # 3PT efficiency
    three_eff = compute_skillkr(three_pct, total_3pa, level_key, "three_pct")

    # 3PT volume
    three_vol = compute_skillkr(three_pa_pg, n_games, level_key, "three_pa_pg")

    # 2PT% derived
    two_fga = max(0, fga_pg - three_pa_pg)
    total_2pt_fga = int(two_fga * n_games)
    if two_fga > 0.5:
        two_fgm = fg_pct * fga_pg - three_pct * three_pa_pg
        two_pt_pct = max(0, two_fgm / two_fga)
    else:
        two_pt_pct = 0.45
    two_pt = compute_skillkr(two_pt_pct, total_2pt_fga, level_key, "two_pt_pct")

    # FT efficiency — N = total FTA
    ft = compute_skillkr(ft_pct, total_fta, level_key, "ft_pct")

    # Cross-level composite
    three_combined = 0.70 * three_eff["skill_kr"] + 0.30 * three_vol["skill_kr"]
    raw = 0.60 * three_combined + 0.25 * two_pt["skill_kr"] + 0.15 * ft["skill_kr"]
    score = max(0, min(100, round(raw, 1)))

    # League-internal composite
    three_combined_l = 0.70 * three_eff["skill_kr_league"] + 0.30 * three_vol["skill_kr_league"]
    raw_l = 0.60 * three_combined_l + 0.25 * two_pt["skill_kr_league"] + 0.15 * ft["skill_kr_league"]
    score_league = max(0, min(100, round(raw_l, 1)))

    traits = [
        {"cluster": "shooting", "trait_key": "three_pct",
         "v": total_3pa, "n_desc": "int(3PA/g * GP) = total 3PA", **three_eff},
        {"cluster": "shooting", "trait_key": "three_pa_pg",
         "v": int(three_pa_pg * n_games), "n_desc": "GP", **three_vol},
        {"cluster": "shooting", "trait_key": "two_pt_pct",
         "v": total_2pt_fga, "n_desc": "int((FGA/g - 3PA/g) * GP) = total 2PT FGA", **two_pt},
        {"cluster": "shooting", "trait_key": "ft_pct",
         "v": total_fta, "n_desc": "int(FTA/g * GP) = total FTA", **ft},
    ]

    return score, score_league, traits


# ═══════════════════════════════════════════════════════════════════════════
# FINISHING CLUSTER (3 sub-traits)
# ═══════════════════════════════════════════════════════════════════════════

def score_finishing(
    fg_pct: float, fga_pg: float,
    three_pct: float, three_pa_pg: float,
    fta_pg: float, level_key: str, n_games: int,
) -> tuple[float, float, list[dict]]:
    """
    Finishing cluster: 0.55 * eff + 0.25 * vol + 0.20 * foul_draw
    Returns: (cross_score, league_score, traits)
    """
    two_fga_pg = max(0, fga_pg - three_pa_pg)
    total_2pt_fga = int(two_fga_pg * n_games)
    total_fga = int(fga_pg * n_games)

    if two_fga_pg > 0.5:
        two_fgm = fg_pct * fga_pg - three_pct * three_pa_pg
        two_pt_pct = max(0, two_fgm / two_fga_pg)
    else:
        two_pt_pct = 0.45

    # Interior efficiency
    eff = compute_skillkr(two_pt_pct, total_2pt_fga, level_key, "two_pt_pct")

    # Finishing volume
    vol = compute_skillkr(two_fga_pg, n_games, level_key, "two_fga_pg")

    # Foul draw rate
    foul_draw_rate = fta_pg / fga_pg if fga_pg > 0 else 0.15
    foul = compute_skillkr(foul_draw_rate, total_fga, level_key, "foul_draw_rate")

    raw = 0.55 * eff["skill_kr"] + 0.25 * vol["skill_kr"] + 0.20 * foul["skill_kr"]
    score = max(0, min(100, round(raw, 1)))

    raw_l = 0.55 * eff["skill_kr_league"] + 0.25 * vol["skill_kr_league"] + 0.20 * foul["skill_kr_league"]
    score_league = max(0, min(100, round(raw_l, 1)))

    traits = [
        {"cluster": "finishing", "trait_key": "two_pt_pct",
         "v": total_2pt_fga, "n_desc": "int((FGA/g - 3PA/g) * GP) = total 2PT FGA", **eff},
        {"cluster": "finishing", "trait_key": "two_fga_pg",
         "v": int(two_fga_pg * n_games), "n_desc": "GP", **vol},
        {"cluster": "finishing", "trait_key": "foul_draw_rate",
         "v": total_fga, "n_desc": "int(FGA/g * GP) = total FGA", **foul},
    ]

    return score, score_league, traits


# ═══════════════════════════════════════════════════════════════════════════
# PLAYMAKING CLUSTER (3 sub-traits — per-game only)
# Removed: ast_per_min (per-minute, inflates low-MPG)
# ═══════════════════════════════════════════════════════════════════════════

def score_playmaking(
    ast_pg: float, to_pg: float,
    fga_pg: float, fta_pg: float,
    level_key: str, n_games: int,
) -> tuple[float, float, list[dict]]:
    """
    Playmaking cluster: 0.50 * ast_kr + 0.20 * tov_rate_kr + 0.30 * ast_to_kr

    v1.5: replaced raw tov_pg with usage-adjusted turnover rate
    (tov_per_usage = TO / usage_events) to stop penalizing high-usage creators.
    Returns: (cross_score, league_score, traits)
    """
    # Assist rate (per game)
    ast_kr = compute_skillkr(ast_pg, n_games, level_key, "ast_pg")

    # Turnover rate per usage event (lower is better)
    # usage_events = FGA + 0.44*FTA + TO (same formula as Usage%)
    usage_events = fga_pg + 0.44 * fta_pg + to_pg
    tov_per_usage = to_pg / usage_events if usage_events > 0.5 else 0.15
    tov_rate_kr = compute_skillkr(tov_per_usage, n_games, level_key, "tov_per_usage",
                                  lower_is_better=True)

    # AST/TO ratio
    ast_to = ast_pg / to_pg if to_pg > 0.1 else ast_pg * 5
    ast_to_kr = compute_skillkr(ast_to, n_games, level_key, "ast_to_ratio")

    raw = 0.50 * ast_kr["skill_kr"] + 0.20 * tov_rate_kr["skill_kr"] + \
          0.30 * ast_to_kr["skill_kr"]
    score = max(0, min(100, round(raw, 1)))

    raw_l = 0.50 * ast_kr["skill_kr_league"] + 0.20 * tov_rate_kr["skill_kr_league"] + \
            0.30 * ast_to_kr["skill_kr_league"]
    score_league = max(0, min(100, round(raw_l, 1)))

    traits = [
        {"cluster": "playmaking", "trait_key": "ast_pg",
         "v": int(ast_pg * n_games), "n_desc": "GP", **ast_kr},
        {"cluster": "playmaking", "trait_key": "tov_per_usage",
         "v": n_games, "n_desc": "GP (usage_events = FGA + 0.44*FTA + TO)",
         **tov_rate_kr},
        {"cluster": "playmaking", "trait_key": "ast_to_ratio",
         "v": n_games, "n_desc": "GP", **ast_to_kr},
    ]

    return score, score_league, traits


# ═══════════════════════════════════════════════════════════════════════════
# PERIMETER DEFENSE CLUSTER (2 sub-traits — per-game only)
# Removed: stl_per_min (per-minute, inflates low-MPG)
# ═══════════════════════════════════════════════════════════════════════════

def score_perimeter_defense(
    stl_pg: float, pf_pg: float,
    level_key: str, n_games: int,
) -> tuple[float, float, list[dict]]:
    """
    Perimeter defense: 0.65 * stl_kr + 0.35 * foul_kr
    Returns: (cross_score, league_score, traits)
    """
    # Steal rate (per 100 poss — linear scale of per-game, not per-minute)
    stl_per_100 = stl_pg * (100 / 70)
    stl_kr = compute_skillkr(stl_per_100, n_games, level_key, "stl_per_100")

    # Foul discipline (lower is better)
    pf_per_100 = pf_pg * (100 / 70)
    foul_kr = compute_skillkr(pf_per_100, n_games, level_key, "pf_per_100", lower_is_better=True)

    raw = 0.65 * stl_kr["skill_kr"] + 0.35 * foul_kr["skill_kr"]
    score = max(0, min(100, round(raw, 1)))

    raw_l = 0.65 * stl_kr["skill_kr_league"] + 0.35 * foul_kr["skill_kr_league"]
    score_league = max(0, min(100, round(raw_l, 1)))

    traits = [
        {"cluster": "perimeter_defense", "trait_key": "stl_per_100",
         "v": int(stl_pg * n_games), "n_desc": "GP", **stl_kr},
        {"cluster": "perimeter_defense", "trait_key": "pf_per_100",
         "v": int(pf_pg * n_games), "n_desc": "GP", **foul_kr},
    ]

    return score, score_league, traits


# ═══════════════════════════════════════════════════════════════════════════
# INTERIOR DEFENSE CLUSTER (3 sub-traits — per-game only)
# Removed: blk_per_min (per-minute, inflates low-MPG)
# ═══════════════════════════════════════════════════════════════════════════

def score_interior_defense(
    blk_pg: float, pf_pg: float,
    dreb_pg: float,
    level_key: str, n_games: int,
) -> tuple[float, float, list[dict]]:
    """
    Interior defense: 0.50 * blk_kr + 0.20 * foul_kr + 0.30 * dreb_kr
    Returns: (cross_score, league_score, traits)
    """
    # Block rate (per 100 poss — linear scale of per-game)
    blk_per_100 = blk_pg * (100 / 70)
    blk_kr = compute_skillkr(blk_per_100, n_games, level_key, "blk_per_100")

    # Foul discipline (lower is better)
    pf_per_100 = pf_pg * (100 / 70)
    foul_kr = compute_skillkr(pf_per_100, n_games, level_key, "pf_per_100", lower_is_better=True)

    # DREB
    dreb_kr = compute_skillkr(dreb_pg, n_games, level_key, "dreb_pg")

    raw = 0.50 * blk_kr["skill_kr"] + 0.20 * foul_kr["skill_kr"] + 0.30 * dreb_kr["skill_kr"]
    score = max(0, min(100, round(raw, 1)))

    raw_l = 0.50 * blk_kr["skill_kr_league"] + 0.20 * foul_kr["skill_kr_league"] + 0.30 * dreb_kr["skill_kr_league"]
    score_league = max(0, min(100, round(raw_l, 1)))

    traits = [
        {"cluster": "interior_defense", "trait_key": "blk_per_100",
         "v": int(blk_pg * n_games), "n_desc": "GP", **blk_kr},
        {"cluster": "interior_defense", "trait_key": "pf_per_100",
         "v": int(pf_pg * n_games), "n_desc": "GP", **foul_kr},
        {"cluster": "interior_defense", "trait_key": "dreb_pg",
         "v": int(dreb_pg * n_games), "n_desc": "GP", **dreb_kr},
    ]

    return score, score_league, traits


# ═══════════════════════════════════════════════════════════════════════════
# REBOUNDING CLUSTER (2 sub-traits — per-game only)
# Removed: reb_per_min (per-minute, inflates low-MPG)
# ═══════════════════════════════════════════════════════════════════════════

def score_rebounding(
    oreb_pg: float, dreb_pg: float,
    level_key: str, n_games: int,
) -> tuple[float, float, list[dict]]:
    """
    Rebounding: 0.55 * dreb_kr + 0.45 * oreb_kr
    Returns: (cross_score, league_score, traits)
    """
    dreb_kr = compute_skillkr(dreb_pg, n_games, level_key, "dreb_pg")
    oreb_kr = compute_skillkr(oreb_pg, n_games, level_key, "oreb_pg")

    raw = 0.55 * dreb_kr["skill_kr"] + 0.45 * oreb_kr["skill_kr"]
    score = max(0, min(100, round(raw, 1)))

    raw_l = 0.55 * dreb_kr["skill_kr_league"] + 0.45 * oreb_kr["skill_kr_league"]
    score_league = max(0, min(100, round(raw_l, 1)))

    traits = [
        {"cluster": "rebounding", "trait_key": "dreb_pg",
         "v": int(dreb_pg * n_games), "n_desc": "GP", **dreb_kr},
        {"cluster": "rebounding", "trait_key": "oreb_pg",
         "v": int(oreb_pg * n_games), "n_desc": "GP", **oreb_kr},
    ]

    return score, score_league, traits


# ═══════════════════════════════════════════════════════════════════════════
# FRAME / PHYSICAL CLUSTER (1-3 sub-traits)
# Removed: motor ((stl+blk)/min — per-minute, inflates low-MPG)
# ═══════════════════════════════════════════════════════════════════════════

# Position-specific height/weight μ and σ for Z-score normalization
_POS_PHYS = {
    # (height_mu, height_sigma, weight_mu, weight_sigma)
    "PG": (74.0, 2.5, 180, 15),
    "CG": (76.0, 2.5, 190, 15),
    "W":  (78.0, 2.5, 205, 18),
    "F":  (80.0, 2.5, 220, 20),
    "B":  (82.0, 2.5, 240, 22),
}


def score_frame(
    height_inches: int | None,
    weight_lbs: int | None,
    position: str | None,
    minutes_pg: float,
    level_key: str, n_games: int,
    minutes_coverage_pct: float = 1.0,
) -> tuple[float, float, list[dict]]:
    """
    Frame cluster. Uses KLVN for endurance; Z-score for height/weight.
    If minutes_coverage_pct < 0.70, endurance is disabled (neutral 50).

    With ht/wt: 0.30*ht + 0.25*wt + 0.35*endurance + 0.10*50
    Without:    1.0*endurance (minutes_pg only)

    Returns: (cross_score, league_score, traits)
    """
    pos = (position or "W").upper()
    pos_map = {"PG": "PG", "G": "PG", "SG": "CG", "CG": "CG",
               "SF": "W", "W": "W", "GF": "W",
               "PF": "F", "F": "F", "C": "B", "B": "B"}
    canonical_pos = pos_map.get(pos, "W")

    # Endurance (minutes per game)
    # Disabled if minutes coverage < 70% — too many sentinel gaps
    if minutes_coverage_pct >= 0.70:
        endurance = compute_skillkr(minutes_pg, n_games, level_key, "minutes_pg")
        endurance_kr = endurance["skill_kr"]
        endurance_kr_league = endurance["skill_kr_league"]
        traits = [
            {"cluster": "frame", "trait_key": "minutes_pg",
             "v": int(minutes_pg * n_games), "n_desc": "GP (where minutes available)",
             **endurance},
        ]
    else:
        endurance_kr = 50.0  # neutral
        endurance_kr_league = 50.0
        traits = [
            {"cluster": "frame", "trait_key": "minutes_pg",
             "skill_kr": 50.0, "skill_kr_league": 50.0,
             "p": minutes_pg, "N": n_games,
             "v": int(minutes_pg * n_games), "mu": 0, "sigma0": 0,
             "alpha": 0, "E_v": 0, "sigma_v": 0,
             "p_adj": minutes_pg, "p_hat": 0, "delta": 0, "Z": 0,
             "Z_league": 0, "Z_cross": 0,
             "league_mu": 0, "league_sigma0": 0,
             "n_desc": f"DISABLED (coverage={minutes_coverage_pct:.0%} < 70%)"},
        ]

    height = height_inches or 0
    wt = weight_lbs or 0

    if height > 0 and wt > 0:
        ht_mu, ht_sigma, wt_mu, wt_sigma = _POS_PHYS.get(canonical_pos, (78, 2.5, 205, 18))

        # Height Z-score → 0-100 via sigmoid stretch
        ht_z = (height - ht_mu) / ht_sigma if ht_sigma > 0 else 0
        ht_z = max(-4.0, min(4.0, ht_z))
        ht_kr = 50 + 50 * _sigmoid_stretch(ht_z)
        ht_kr = max(0, min(100, round(ht_kr, 1)))

        wt_z = (wt - wt_mu) / wt_sigma if wt_sigma > 0 else 0
        wt_z = max(-4.0, min(4.0, wt_z))
        wt_kr = 50 + 50 * _sigmoid_stretch(wt_z)
        wt_kr = max(0, min(100, round(wt_kr, 1)))

        traits.append({"cluster": "frame", "trait_key": "height",
                        "skill_kr": ht_kr, "skill_kr_league": ht_kr,
                        "p": height, "N": 1, "v": 1,
                        "mu": ht_mu, "sigma0": ht_sigma, "alpha": 0,
                        "E_v": ht_mu, "sigma_v": ht_sigma,
                        "p_adj": height, "p_hat": ht_mu,
                        "delta": round(height - ht_mu, 2), "Z": round(ht_z, 3),
                        "Z_league": round(ht_z, 3), "Z_cross": round(ht_z, 3),
                        "league_mu": ht_mu, "league_sigma0": ht_sigma,
                        "n_desc": "1 (anthropometric, Z-score, no shrinkage)"})
        traits.append({"cluster": "frame", "trait_key": "weight",
                        "skill_kr": wt_kr, "skill_kr_league": wt_kr,
                        "p": wt, "N": 1, "v": 1,
                        "mu": wt_mu, "sigma0": wt_sigma, "alpha": 0,
                        "E_v": wt_mu, "sigma_v": wt_sigma,
                        "p_adj": wt, "p_hat": wt_mu,
                        "delta": round(wt - wt_mu, 2), "Z": round(wt_z, 3),
                        "Z_league": round(wt_z, 3), "Z_cross": round(wt_z, 3),
                        "league_mu": wt_mu, "league_sigma0": wt_sigma,
                        "n_desc": "1 (anthropometric, Z-score, no shrinkage)"})

        raw = 0.30 * ht_kr + 0.25 * wt_kr + 0.35 * endurance_kr + 0.10 * 50.0
        raw_l = 0.30 * ht_kr + 0.25 * wt_kr + 0.35 * endurance_kr_league + 0.10 * 50.0
    else:
        raw = endurance_kr
        raw_l = endurance_kr_league

    score = max(0, min(100, round(raw, 1)))
    score_league = max(0, min(100, round(raw_l, 1)))
    return score, score_league, traits


# ═══════════════════════════════════════════════════════════════════════════
# COMPUTE ALL 7 CLUSTERS
# ═══════════════════════════════════════════════════════════════════════════

def compute_all_clusters(
    stats: dict,
    level_key: str,
    height_inches: int | None = None,
    weight_lbs: int | None = None,
    position: str | None = None,
) -> tuple[dict[str, float], dict[str, float], list[dict]]:
    """
    Compute all 7 cluster scores via KLVN SkillKR pipeline.
    v1.4: per-game traits only (no per-minute).

    Returns:
        (clusters_cross, clusters_league, all_traits)
        - clusters_cross: 7 cross-level cluster scores (THE KR)
        - clusters_league: 7 league-internal cluster scores (hidden)
        - all_traits: per-trait diagnostics
    """
    n_games = stats.get("games_played", 0)
    all_traits: list[dict] = []

    shooting, shooting_l, s_traits = score_shooting(
        three_pct=stats.get("three_pct", 0),
        three_pa_pg=stats.get("three_pa_pg", 0),
        fg_pct=stats.get("fg_pct", 0),
        ft_pct=stats.get("ft_pct", 0),
        fga_pg=stats.get("fga_pg", 0),
        fta_pg=stats.get("fta_pg", 0),
        level_key=level_key,
        n_games=n_games,
    )
    all_traits.extend(s_traits)

    finishing, finishing_l, f_traits = score_finishing(
        fg_pct=stats.get("fg_pct", 0),
        fga_pg=stats.get("fga_pg", 0),
        three_pct=stats.get("three_pct", 0),
        three_pa_pg=stats.get("three_pa_pg", 0),
        fta_pg=stats.get("fta_pg", 0),
        level_key=level_key,
        n_games=n_games,
    )
    all_traits.extend(f_traits)

    playmaking, playmaking_l, p_traits = score_playmaking(
        ast_pg=stats.get("ast_pg", 0),
        to_pg=stats.get("to_pg", 0),
        fga_pg=stats.get("fga_pg", 0),
        fta_pg=stats.get("fta_pg", 0),
        level_key=level_key,
        n_games=n_games,
    )
    all_traits.extend(p_traits)

    perimeter_defense, perimeter_defense_l, pd_traits = score_perimeter_defense(
        stl_pg=stats.get("stl_pg", 0),
        pf_pg=stats.get("pf_pg", 0),
        level_key=level_key,
        n_games=n_games,
    )
    all_traits.extend(pd_traits)

    interior_defense, interior_defense_l, id_traits = score_interior_defense(
        blk_pg=stats.get("blk_pg", 0),
        pf_pg=stats.get("pf_pg", 0),
        dreb_pg=stats.get("dreb_pg", 0),
        level_key=level_key,
        n_games=n_games,
    )
    all_traits.extend(id_traits)

    rebounding, rebounding_l, r_traits = score_rebounding(
        oreb_pg=stats.get("oreb_pg", 0),
        dreb_pg=stats.get("dreb_pg", 0),
        level_key=level_key,
        n_games=n_games,
    )
    all_traits.extend(r_traits)

    frame, frame_l, fr_traits = score_frame(
        height_inches=height_inches,
        weight_lbs=weight_lbs,
        position=position,
        minutes_pg=stats.get("minutes_pg", 0),
        level_key=level_key,
        n_games=n_games,
        minutes_coverage_pct=stats.get("minutes_coverage_pct", 1.0),
    )
    all_traits.extend(fr_traits)

    clusters = {
        "shooting": shooting,
        "finishing": finishing,
        "playmaking": playmaking,
        "perimeter_defense": perimeter_defense,
        "interior_defense": interior_defense,
        "rebounding": rebounding,
        "frame": frame,
    }

    clusters_league = {
        "shooting": shooting_l,
        "finishing": finishing_l,
        "playmaking": playmaking_l,
        "perimeter_defense": perimeter_defense_l,
        "interior_defense": interior_defense_l,
        "rebounding": rebounding_l,
        "frame": frame_l,
    }

    return clusters, clusters_league, all_traits
