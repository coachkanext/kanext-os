#!/usr/bin/env python3
"""
Calibration Script — Compute empirical μ and σ0 for every (trait, level) pair.

Queries player_season_stats to derive 20 trait values, then computes mean (μ)
and standard deviation (σ0) per competitive level. Outputs klvn_params.json
for use by the KLVN SkillKR pipeline.

Usage:
    cd services/player-pool/engine
    python3 calibrate.py
"""

from __future__ import annotations
import json
import math
import os
import sys
from collections import defaultdict
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scraper"))

import psycopg
from psycopg.rows import dict_row
from config import DB_CONFIG
from conference_map import resolve_d1_conference, assign_d1_tier

MIN_SAMPLE = 10  # Minimum players per (trait, level) before falling back to global

# The 20 traits we derive from player_season_stats
TRAIT_KEYS = [
    "three_pct", "three_pa_pg", "two_pt_pct", "ft_pct",
    "two_fga_pg", "foul_draw_rate",
    "ast_pg", "tov_pg", "tov_per_usage", "ast_to_ratio", "ast_per_min",
    "stl_per_100", "pf_per_100", "stl_per_min",
    "blk_per_100", "blk_per_min", "dreb_pg",
    "oreb_pg", "reb_per_min",
    "minutes_pg", "motor",
    "start_rate",
]


def _f(v) -> float:
    if v is None:
        return 0.0
    return float(v)


def derive_traits(row: dict) -> dict[str, float | None]:
    """Derive 20 trait values from a player_season_stats row. Returns None for undefined traits."""
    gp = _f(row["games_played"])
    mpg = _f(row["minutes_per_game"])
    fga_pg = _f(row["fga_per_game"])
    three_pa_pg = _f(row["three_pa_per_game"])
    fta_pg = _f(row["fta_per_game"])
    fg_pct = _f(row["fg_pct"])
    three_pct = _f(row["three_pct"])
    ft_pct = _f(row["ft_pct"])
    ast_pg = _f(row["ast_per_game"])
    to_pg = _f(row["to_per_game"])
    stl_pg = _f(row["stl_per_game"])
    blk_pg = _f(row["blk_per_game"])
    pf_pg = _f(row["pf_per_game"])
    oreb_pg = _f(row["oreb_per_game"])
    dreb_pg = _f(row["dreb_per_game"])
    reb_pg = oreb_pg + dreb_pg

    traits: dict[str, float | None] = {}

    # Shooting
    traits["three_pct"] = three_pct if three_pa_pg > 0 else None
    traits["three_pa_pg"] = three_pa_pg
    traits["ft_pct"] = ft_pct if fta_pg > 0 else None

    # 2PT% derived: (FG% * FGA - 3P% * 3PA) / (FGA - 3PA)
    two_fga = fga_pg - three_pa_pg
    if two_fga > 0.5:
        two_fgm = fg_pct * fga_pg - three_pct * three_pa_pg
        traits["two_pt_pct"] = max(0, two_fgm / two_fga)
    else:
        traits["two_pt_pct"] = None

    # Finishing
    traits["two_fga_pg"] = max(0, fga_pg - three_pa_pg)
    traits["foul_draw_rate"] = fta_pg / fga_pg if fga_pg > 0 else None

    # Playmaking
    traits["ast_pg"] = ast_pg
    traits["tov_pg"] = to_pg
    usage_events = fga_pg + 0.44 * fta_pg + to_pg
    traits["tov_per_usage"] = to_pg / usage_events if usage_events > 0.5 else None
    traits["ast_to_ratio"] = ast_pg / to_pg if to_pg > 0.1 else None
    traits["ast_per_min"] = ast_pg / mpg if mpg > 0 else None

    # Perimeter defense
    traits["stl_per_100"] = stl_pg * (100 / 70)
    traits["pf_per_100"] = pf_pg * (100 / 70)
    traits["stl_per_min"] = stl_pg / mpg if mpg > 0 else None

    # Interior defense
    traits["blk_per_100"] = blk_pg * (100 / 70)
    traits["blk_per_min"] = blk_pg / mpg if mpg > 0 else None
    traits["dreb_pg"] = dreb_pg

    # Rebounding
    traits["oreb_pg"] = oreb_pg
    traits["reb_per_min"] = reb_pg / mpg if mpg > 0 else None

    # Frame
    traits["minutes_pg"] = mpg
    traits["motor"] = (stl_pg + blk_pg) / mpg if mpg > 0 else None

    # Team defense trust
    gs = _f(row.get("games_started", 0))
    traits["start_rate"] = gs / gp if gp > 0 else None

    return traits


def compute_mu_sigma(values: list[float]) -> tuple[float, float]:
    """Compute mean and population std dev for a list of values."""
    n = len(values)
    if n == 0:
        return 0.0, 1.0
    mu = sum(values) / n
    if n < 2:
        return mu, 1.0
    variance = sum((v - mu) ** 2 for v in values) / n
    sigma = math.sqrt(variance) if variance > 0 else 0.01
    return mu, sigma


def main():
    print("=" * 60)
    print("KLVN Calibration — Computing empirical μ and σ0")
    print("=" * 60)

    conn = psycopg.connect(
        host=DB_CONFIG["host"], port=DB_CONFIG["port"],
        dbname=DB_CONFIG["dbname"], row_factory=dict_row,
    )

    # Query all qualifying player season stats with level key + team name + conference
    rows = conn.execute("""
        SELECT pss.*, cl.level_key, t.name AS team_name, c.name AS db_conference
        FROM player_season_stats pss
        JOIN player_team_seasons pts ON pss.player_team_season_id = pts.id
        JOIN team_seasons ts ON pts.team_season_id = ts.id
        JOIN teams t ON ts.team_id = t.id
        JOIN competitive_levels cl ON t.competitive_level_id = cl.id
        LEFT JOIN conferences c ON c.id = t.conference_id
        WHERE pss.games_played >= 3 AND pss.minutes_per_game >= 5
    """).fetchall()

    print(f"  Qualifying players: {len(rows)}")

    # Collect trait values per level
    # Structure: { trait_key: { level_key: [values] } }
    level_traits: dict[str, dict[str, list[float]]] = defaultdict(lambda: defaultdict(list))
    global_traits: dict[str, list[float]] = defaultdict(list)
    sample_counts: dict[str, int] = defaultdict(int)

    for row in rows:
        level_key = row["level_key"]
        # Remap ncaa_d1 → ncaa_d1_high_major / mid_major / low_major
        if level_key == "ncaa_d1":
            conf = resolve_d1_conference(row["team_name"], row.get("db_conference"))
            level_key = assign_d1_tier(conf)
        sample_counts[level_key] += 1
        traits = derive_traits(row)
        for tk in TRAIT_KEYS:
            v = traits.get(tk)
            if v is not None and math.isfinite(v):
                level_traits[tk][level_key].append(v)
                global_traits[tk].append(v)

    # Compute μ and σ0 per (trait, level), with global fallback
    params: dict[str, dict] = {}

    for tk in TRAIT_KEYS:
        params[tk] = {}

        # Global fallback
        g_mu, g_sigma = compute_mu_sigma(global_traits.get(tk, []))
        params[tk]["_global"] = {
            "mu": round(g_mu, 6),
            "sigma0": round(g_sigma, 6),
            "n": len(global_traits.get(tk, [])),
        }

        # Per-level
        for level_key, values in level_traits.get(tk, {}).items():
            if len(values) >= MIN_SAMPLE:
                mu, sigma = compute_mu_sigma(values)
                params[tk][level_key] = {
                    "mu": round(mu, 6),
                    "sigma0": round(sigma, 6),
                    "n": len(values),
                }
            # else: will fall back to _global at runtime

    output = {
        "version": "v1.0",
        "computed_at": datetime.now(timezone.utc).isoformat(),
        "sample_counts": dict(sample_counts),
        "params": params,
    }

    out_path = os.path.join(os.path.dirname(__file__), "klvn_params.json")
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\n  Output: {out_path}")
    print(f"  Levels: {sorted(sample_counts.keys())}")
    print(f"\n{'─' * 60}")
    print(f"  {'Level':<22} {'Players':>8}")
    print(f"{'─' * 60}")
    for lk in sorted(sample_counts.keys()):
        print(f"  {lk:<22} {sample_counts[lk]:>8}")
    print(f"{'─' * 60}")
    print(f"  {'TOTAL':<22} {sum(sample_counts.values()):>8}")

    # Print summary of a few key traits
    print(f"\n{'─' * 60}")
    print(f"  Sample μ/σ0 for key traits (global):")
    print(f"{'─' * 60}")
    for tk in ["three_pct", "ast_pg", "stl_per_100", "blk_per_100", "dreb_pg", "minutes_pg"]:
        p = params.get(tk, {}).get("_global", {})
        print(f"  {tk:<18} μ={p.get('mu', 0):<10.4f} σ0={p.get('sigma0', 0):<10.4f} n={p.get('n', 0)}")

    conn.close()
    print(f"\n{'=' * 60}")
    print("Calibration complete.")


if __name__ == "__main__":
    main()
