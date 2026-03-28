"""
Position Framework — College v4.0

Source: Basketball Player Intelligence v3 spec
5 standard positions: PG, SG, SF, PF, C

v4.0 Architecture: Per-Trait Weights
  OKR, DKR, TKR, IQKR are computed directly from trait scores
  using position-specific per-trait weights (TRAIT_WEIGHTS_COLLEGE/PRO).

  OKR  = Σ(trait_score_i × w_i) / Σ(w_scored_traits_in_OKR)
  DKR  = Σ(trait_score_i × w_i) / Σ(w_scored_traits_in_DKR)
  TKR  = Σ(trait_score_i × w_i) / Σ(w_scored_traits_in_TKR)
  IQKR = Σ(trait_score_i × w_i) / Σ(w_scored_traits_in_IQKR)

  Base Player KR = (OKR × OPF_off) + (DKR × OPF_def)
                 + (TKR × OPF_tools) + (IQKR × OPF_iq)

  UNSCORED traits contribute 0 weight; remaining weights renormalize.
  Components with ALL traits UNSCORED → None (excluded from base_player_kr).

Population Baselines (pass 2):
  When baselines dict is provided, UNSCORED traits use population-average estimates
  at reduced confidence weight (0.0–1.0) instead of being excluded entirely.
  confidence_pct reflects the fraction of total OPF-weighted score that came from
  directly-scored traits (not baselines).
"""
from __future__ import annotations

from .constants import (
    OPF_COLLEGE,
    OPF_PRO,
    TRAIT_WEIGHTS_COLLEGE,
    TRAIT_WEIGHTS_PRO,
)

POSITIONS = list(OPF_COLLEGE.keys())  # ["PG", "SG", "SF", "PF", "C"]


def map_position(declared_positions: list[str] | None) -> str:
    """
    Map declared position strings to one of the 5 standard positions.

    Common inputs: "G", "PG", "SG", "SF", "PF", "C", "F", "Guard", "Forward", "Center"
    """
    if not declared_positions:
        return "SF"  # default fallback (mid-range)

    pos_set = {p.upper().strip() for p in declared_positions}

    # Centers
    if "C" in pos_set:
        return "C"
    if "CENTER" in pos_set:
        return "C"

    # Power Forwards
    if pos_set == {"PF"}:
        return "PF"
    if "PF" in pos_set and "SF" not in pos_set:
        return "PF"
    if pos_set == {"F"}:
        return "PF"
    if "FORWARD" in pos_set and "SF" not in pos_set:
        return "PF"

    # Small Forwards / Wings
    if pos_set == {"SF"}:
        return "SF"
    if "SF" in pos_set and "PF" in pos_set:
        return "SF"  # SF/PF → lean SF
    if "SF" in pos_set and "SG" in pos_set:
        return "SF"

    # Point Guards
    if pos_set == {"PG"}:
        return "PG"

    # Shooting Guards / Combo Guards
    if "SG" in pos_set:
        return "SG"
    if pos_set == {"G"}:
        return "SG"
    if "PG" in pos_set and "SG" in pos_set:
        return "SG"
    if "GUARD" in pos_set:
        return "SG"
    if "G" in pos_set:
        return "SG"

    return "SF"  # ultimate fallback


def _weighted_component(
    trait_scores: dict[str, int | None],
    weight_map: dict[str, int],
    baselines: "dict[str, tuple[float, float]] | None" = None,
) -> "tuple[float | None, float]":
    """
    Compute a weighted component score from trait scores.

    Parameters
    ----------
    trait_scores : scored trait dict
    weight_map   : {trait_key: weight_int} summing to 100
    baselines    : optional {trait_key: (avg_score, conf_weight)}
                   conf_weight is 0.0–1.0 (0.5 = level+pos specific, 0.3 = level-only)

    Returns
    -------
    (component_score, scored_fraction)
      component_score  : weighted average (None only if total_w = 0)
      scored_fraction  : 0.0–1.0, fraction of theoretical max weight from directly-scored traits
    """
    total_w  = 0.0
    total_v  = 0.0
    scored_w = 0.0
    max_w    = sum(w for w in weight_map.values() if w > 0)

    for trait_key, w in weight_map.items():
        if w <= 0:
            continue
        score = trait_scores.get(trait_key)
        if score is not None:
            total_v  += score * w
            total_w  += w
            scored_w += w
        elif baselines and trait_key in baselines:
            bl_score, bl_conf = baselines[trait_key]
            eff_w     = w * bl_conf
            total_v  += bl_score * eff_w
            total_w  += eff_w

    component       = total_v / total_w if total_w > 0 else None
    scored_fraction = scored_w / max_w if max_w > 0 else 0.0
    return component, scored_fraction


def compute_position_kr(
    trait_scores: dict[str, int | None],
    position: str,
    level: str = "college",
    baselines: "dict[str, tuple[float, float]] | None" = None,
) -> dict[str, float | None]:
    """
    Compute OKR, DKR, TKR, IQKR, and Base Player KR for a player.

    Parameters
    ----------
    trait_scores : dict
        54-trait scores: {trait_key → int or None}
    position : str
        One of PG, SG, SF, PF, C
    level : str
        "college" (default) or "pro"
    baselines : optional dict
        {trait_key: (avg_score, conf_weight)} — population baseline estimates
        for UNSCORED traits. When provided, UNSCORED traits use these estimates
        at reduced weight instead of being excluded from the formula.

    Returns
    -------
    dict with keys: okr, dkr, tkr, iqkr, base_player_kr, confidence_pct
      confidence_pct: 0–100, OPF-weighted fraction of score from directly-scored traits
    """
    if level == "pro":
        weights = TRAIT_WEIGHTS_PRO.get(position, TRAIT_WEIGHTS_PRO["SF"])
        opf     = OPF_PRO.get(position, OPF_PRO["SF"])
    else:
        weights = TRAIT_WEIGHTS_COLLEGE.get(position, TRAIT_WEIGHTS_COLLEGE["SF"])
        opf     = OPF_COLLEGE.get(position, OPF_COLLEGE["SF"])

    opf_off, opf_def, opf_tools, opf_iq = opf

    okr,  okr_sf  = _weighted_component(trait_scores, weights["okr"],  baselines)
    dkr,  dkr_sf  = _weighted_component(trait_scores, weights["dkr"],  baselines)
    tkr,  tkr_sf  = _weighted_component(trait_scores, weights["tkr"],  baselines)
    iqkr, iqkr_sf = _weighted_component(trait_scores, weights["iqkr"], baselines)

    # Base Player KR — weighted sum of 4 components, renormalized for None
    components_and_weights = [
        (okr,  opf_off),
        (dkr,  opf_def),
        (tkr,  opf_tools),
        (iqkr, opf_iq),
    ]

    total_w   = 0.0
    total_val = 0.0
    for val, w in components_and_weights:
        if val is not None:
            total_val += val * w
            total_w   += w

    base_player_kr = total_val / total_w if total_w > 0 else None

    # confidence_pct: OPF-weighted average of per-component scored fractions
    opf_total      = opf_off + opf_def + opf_tools + opf_iq  # = 100
    confidence_pct = (
        opf_off   * okr_sf  +
        opf_def   * dkr_sf  +
        opf_tools * tkr_sf  +
        opf_iq    * iqkr_sf
    ) / opf_total * 100.0

    return {
        "okr":            okr,
        "dkr":            dkr,
        "tkr":            tkr,
        "iqkr":           iqkr,
        "base_player_kr": base_player_kr,
        "confidence_pct": confidence_pct,
    }
