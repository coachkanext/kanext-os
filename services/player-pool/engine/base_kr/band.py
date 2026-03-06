"""
Universal band-lookup utility for trait calibration tables.

Every trait in the Trait Library maps a raw stat to a band score (90/80/70/60/50)
using a calibration table.  Two modes:
  - higher_is_better (default): value >= threshold → band
  - lower_is_better: value <= threshold → band
"""
from __future__ import annotations


def band_lookup(
    value: float | None,
    thresholds: list[tuple[int, float]],
    lower_is_better: bool = False,
) -> int | None:
    """
    Map a raw value to a band score using calibration thresholds.

    Parameters
    ----------
    value : float or None
        The raw stat value.  None → returns None (UNSCORED).
    thresholds : list of (band, cutoff)
        Ordered from highest band to lowest, e.g.
        [(90, 0.42), (80, 0.37), (70, 0.33), (60, 0.28)]
    lower_is_better : bool
        If True, value <= cutoff means the band is met.

    Returns
    -------
    int or None
        Band score (90/80/70/60) or 50 if below all thresholds.
        None if value is None.
    """
    if value is None:
        return None

    for band, cutoff in thresholds:
        if lower_is_better:
            if value <= cutoff:
                return band
        else:
            if value >= cutoff:
                return band
    return 50
