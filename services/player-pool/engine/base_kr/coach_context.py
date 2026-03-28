"""
Coach Context Setup v2 — Contextual Mode Binding

Source: Basketball Player Intelligence v3 spec — Coach Context Setup v2

A Coach Context binds a KR evaluation to a specific program environment:
  - Governing Body (NCAA, NJCAA, NAIA, etc.)
  - Division & Conference class
  - Offensive and Defensive systems run by the coaching staff

Once bound, the evaluation engine applies System Fit adjustments:
  each position × system combination has a modified per-trait weight table
  that rewards traits that thrive in that system over neutral weights.

At this pipeline stage (Block 1, Base Truth), system fit is not applied.
The CoachContext object is returned as metadata and can be used in:
  - Block 2 evaluation (System Context)
  - Frontend scouting interface (system-specific player grades)

Usage:
    from base_kr.coach_context import bind_context, CoachContext

    ctx = bind_context(
        program_name="Kentucky",
        governing_body="NCAA",
        division="D1",
        offensive_system="Spread Pick-and-Roll",
        defensive_system="Pack Line",
    )
"""
from __future__ import annotations
from dataclasses import dataclass, field

from .constants import OFFENSIVE_SYSTEMS, DEFENSIVE_SYSTEMS


# ═══════════════════════════════════════════════════════════════════════════
# Coach Context Dataclass
# ═══════════════════════════════════════════════════════════════════════════

@dataclass
class CoachContext:
    """
    Bound coach/program context for a KR evaluation run.

    Fields
    ------
    program_name      : Display name of the program (e.g., "Kentucky")
    governing_body    : Governing org (NCAA, NJCAA, NAIA, CCCAA, USCAA, etc.)
    division          : Division tier (D1, D2, D3)
    major_class       : Optional label for the primary scheme class (e.g., "Spread PnR")
    offensive_system  : One of OFFENSIVE_SYSTEMS (or None for neutral)
    defensive_system  : One of DEFENSIVE_SYSTEMS (or None for neutral)
    """
    program_name:      str
    governing_body:    str  = "NCAA"
    division:          str  = "D1"
    major_class:       str | None = None
    offensive_system:  str | None = None
    defensive_system:  str | None = None
    metadata:          dict = field(default_factory=dict)

    @property
    def is_neutral(self) -> bool:
        """True if no system is bound (uses neutral position weights)."""
        return self.offensive_system is None and self.defensive_system is None

    def summary(self) -> str:
        off = self.offensive_system or "Neutral"
        def_ = self.defensive_system or "Neutral"
        return (
            f"{self.program_name} ({self.governing_body} {self.division}) | "
            f"OFF: {off} | DEF: {def_}"
        )


# ═══════════════════════════════════════════════════════════════════════════
# Context Binding
# ═══════════════════════════════════════════════════════════════════════════

def bind_context(
    program_name: str,
    governing_body: str = "NCAA",
    division: str = "D1",
    major_class: str | None = None,
    offensive_system: str | None = None,
    defensive_system: str | None = None,
    **metadata,
) -> CoachContext:
    """
    Create a validated CoachContext.

    Raises ValueError if offensive_system or defensive_system is unrecognized.

    Parameters
    ----------
    program_name      : Team/program display name
    governing_body    : NCAA | NJCAA | NAIA | CCCAA | USCAA | NCCAA | Independent
    division          : D1 | D2 | D3
    major_class       : Optional label (free text)
    offensive_system  : One of OFFENSIVE_SYSTEMS, or None for neutral
    defensive_system  : One of DEFENSIVE_SYSTEMS, or None for neutral
    **metadata        : Any additional key-value pairs stored in ctx.metadata
    """
    if offensive_system is not None and offensive_system not in OFFENSIVE_SYSTEMS:
        raise ValueError(
            f"Unknown offensive system '{offensive_system}'. "
            f"Valid options: {OFFENSIVE_SYSTEMS}"
        )
    if defensive_system is not None and defensive_system not in DEFENSIVE_SYSTEMS:
        raise ValueError(
            f"Unknown defensive system '{defensive_system}'. "
            f"Valid options: {DEFENSIVE_SYSTEMS}"
        )

    return CoachContext(
        program_name=program_name,
        governing_body=governing_body,
        division=division,
        major_class=major_class,
        offensive_system=offensive_system,
        defensive_system=defensive_system,
        metadata=metadata,
    )


# ═══════════════════════════════════════════════════════════════════════════
# System Fit — Placeholder (Block 2)
# ═══════════════════════════════════════════════════════════════════════════

def apply_system_fit(
    trait_weights: dict[str, dict[str, int]],
    position: str,
    context: CoachContext,
) -> dict[str, dict[str, int]]:
    """
    Apply system-fit adjustments to per-trait weights for a given position.

    Currently returns the neutral weights unchanged (Block 1 only).
    Full system-fit weight tables (12 offensive × 5 positions +
    10 defensive × 5 positions) will be implemented in Block 2.

    Parameters
    ----------
    trait_weights : dict — position-specific neutral weights (4 components)
    position      : one of PG, SG, SF, PF, C
    context       : bound CoachContext

    Returns
    -------
    dict — same structure as trait_weights (neutral until Block 2 is implemented)
    """
    # TODO (Block 2): load system-fit weight adjustments from
    #   SYSTEM_FIT_WEIGHTS_COLLEGE[context.offensive_system][position]
    #   SYSTEM_FIT_WEIGHTS_COLLEGE[context.defensive_system][position]
    #   and blend with neutral weights
    return trait_weights
