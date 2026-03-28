"""
Impact Modifiers — College v4.0 (Impact Modifiers v2)

Source: Basketball Player Intelligence v3 spec — Impact Modifiers v2

5 modifier types in strict precedence:
  1. Primary Engine
  2. Secondary Engine
  3. Force Multiplier
  4. Specialist Anchor
  5. Unclassified

Impact Modifiers are CLASSIFICATION LABELS ONLY — they do NOT alter KR.
They describe how a player generates impact within a lineup.

v4.0 Changes vs v3.0:
  - Primary Engine: ELS gate raised 20.0 → 24.0; TS% ≥ 52% and TOV% ≤ 20% added
  - Secondary Engine: ELS gate raised 13.0 → 18.0; TS% ≥ 54% added; upper bound <24.0
  - Force Multiplier: ELS upper bound tightened to < 18.0; TS% ≥ 54% gate added
  - Specialist Anchor: USG threshold raised < 14% → ≤ 20%

ELS (Engine Load Score) = 0.60 × USG% + 0.40 × AST%
  Higher ELS → player carries more offensive load.

TS% (True Shooting %) = PTS / (2 × (FGA + 0.44 × FTA))
  Computed directly from box-score stats.

Sample gate: GP × MPG < 200 → UNCLASSIFIED (LOW_SAMPLE)

Precedence: if multiple types qualify, highest in list (1→5) is assigned.
"""
from __future__ import annotations


# ═══════════════════════════════════════════════════════════════════════════
# Modifier Types
# ═══════════════════════════════════════════════════════════════════════════

MODIFIER_TYPES = [
    "Primary Engine",
    "Secondary Engine",
    "Force Multiplier",
    "Specialist Anchor",
    "Unclassified",
]

LOW_SAMPLE_THRESHOLD = 200  # GP × MPG < 200 → low sample


# ═══════════════════════════════════════════════════════════════════════════
# ELS & TS% Computation
# ═══════════════════════════════════════════════════════════════════════════

def compute_els(usage_rate: float | None, ast_pg: float | None, min_pg: float | None) -> float | None:
    """
    Engine Load Score = 0.60 × USG% + 0.40 × AST%

    AST% approximated from AST/G and MPG:
      AST% ≈ (AST/G / (((MPG/40) * 70) * 2)) * 100
    """
    if usage_rate is None:
        return None
    usg = float(usage_rate)

    ast_pct = 0.0
    if ast_pg is not None and min_pg is not None and min_pg > 5:
        est_half_poss = ((min_pg / 40.0) * 70.0)
        ast_pct = (float(ast_pg) / est_half_poss) * 100.0 if est_half_poss > 0 else 0.0

    return 0.60 * usg + 0.40 * ast_pct


def _compute_ts_pct(season_stats: dict) -> float | None:
    """True Shooting % from box-score stats."""
    def _f(v) -> float:
        return float(v) if v is not None else 0.0

    pts_pg = _f(season_stats.get("pts_per_game"))
    fga_pg = _f(season_stats.get("fga_per_game"))
    fta_pg = _f(season_stats.get("fta_per_game"))
    ts_denom = 2.0 * (fga_pg + 0.44 * fta_pg)
    return (pts_pg / ts_denom) if ts_denom > 3.0 else None


def _compute_tov_pct(season_stats: dict) -> float | None:
    """TOV% from box-score stats."""
    def _f(v) -> float:
        return float(v) if v is not None else 0.0

    to_pg  = _f(season_stats.get("to_per_game"))
    fga_pg = _f(season_stats.get("fga_per_game"))
    fta_pg = _f(season_stats.get("fta_per_game"))
    poss_used = fga_pg + 0.44 * fta_pg + to_pg
    return (to_pg / poss_used * 100.0) if poss_used > 0 else None


# ═══════════════════════════════════════════════════════════════════════════
# Impact Modifier Assignment
# ═══════════════════════════════════════════════════════════════════════════

def assign_impact_modifier(
    season_stats: dict,
    cluster_scores: dict[str, float | None] | None = None,
) -> dict:
    """
    Assign an impact modifier to a player based on their season stats.

    Parameters
    ----------
    season_stats  : dict — player's season stat row
    cluster_scores: dict — 8-cluster scores (optional, for defensive specialist detection)

    Returns
    -------
    dict with:
      modifier_type : str (one of the 5 modifier types)
      els           : float or None (Engine Load Score)
      reason        : str (explanation)
    """
    def _f(v) -> float:
        return float(v) if v is not None else 0.0

    gp     = int(season_stats.get("games_played") or 0)
    min_pg = _f(season_stats.get("minutes_per_game"))
    usg    = _f(season_stats.get("usage_rate"))
    ast_pg = _f(season_stats.get("ast_pg") or season_stats.get("ast_per_game"))

    # Sample gate
    sample_vol = gp * min_pg
    if sample_vol < LOW_SAMPLE_THRESHOLD:
        return {
            "modifier_type": "Unclassified",
            "els":           None,
            "reason":        f"LOW_SAMPLE (GP×MPG={sample_vol:.0f} < {LOW_SAMPLE_THRESHOLD})",
        }

    els     = compute_els(usg if usg > 0 else None, ast_pg, min_pg)
    ts_pct  = _compute_ts_pct(season_stats)
    tov_pct = _compute_tov_pct(season_stats)

    els_val = els if els is not None else 0.0

    # ── Primary Engine ─────────────────────────────────────────────────
    # ELS ≥ 24.0 AND USG ≥ 22% AND TS% ≥ 52% (if available) AND TOV% ≤ 20% (if available)
    if els_val >= 24.0 and usg >= 22:
        ts_ok  = ts_pct is None or ts_pct >= 0.52
        tov_ok = tov_pct is None or tov_pct <= 20.0
        if ts_ok and tov_ok:
            return {
                "modifier_type": "Primary Engine",
                "els":           round(els_val, 1),
                "reason":        f"ELS={els_val:.1f} (USG={usg:.1f}% TS={f'{ts_pct:.3f}' if ts_pct else 'N/A'})",
            }

    # ── Secondary Engine ───────────────────────────────────────────────
    # ELS 18.0–23.9 AND USG ≥ 15% AND TS% ≥ 54% (if available)
    if 18.0 <= els_val < 24.0 and usg >= 15:
        ts_ok = ts_pct is None or ts_pct >= 0.54
        if ts_ok:
            return {
                "modifier_type": "Secondary Engine",
                "els":           round(els_val, 1),
                "reason":        f"ELS={els_val:.1f} (USG={usg:.1f}%)",
            }

    # ── Force Multiplier ───────────────────────────────────────────────
    # High USG (≥ 20%) without playmaking (ELS < 18) AND TS% ≥ 54% (efficient scorer)
    if usg >= 20 and els_val < 18.0:
        ts_ok = ts_pct is None or ts_pct >= 0.54
        if ts_ok:
            return {
                "modifier_type": "Force Multiplier",
                "els":           round(els_val, 1) if els is not None else None,
                "reason":        f"High USG={usg:.1f}% without playmaking load (ELS={els_val:.1f})",
            }

    # ── Specialist Anchor ──────────────────────────────────────────────
    # USG ≤ 20% — role-player / specialist
    if usg <= 20.0:
        cs = cluster_scores or {}
        def_score = cs.get("team_defense") or cs.get("poa_defense")
        reb_score  = cs.get("rebounding")
        off_score  = max(cs.get("shooting") or 0, cs.get("finishing") or 0)

        if def_score is not None and def_score >= 65:
            specialty = "defensive specialist"
        elif reb_score is not None and reb_score >= 65:
            specialty = "rebounding specialist"
        elif off_score >= 65:
            specialty = "offensive specialist"
        else:
            specialty = "role player"

        return {
            "modifier_type": "Specialist Anchor",
            "els":           round(els_val, 1) if els is not None else None,
            "reason":        f"Low USG={usg:.1f}% — {specialty}",
        }

    # ── Unclassified (default) ─────────────────────────────────────────
    return {
        "modifier_type": "Unclassified",
        "els":           round(els_val, 1) if els is not None else None,
        "reason":        f"No clear classification (USG={usg:.1f}% ELS={els_val:.1f})",
    }
