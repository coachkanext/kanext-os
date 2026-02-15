/**
 * Team Needs — positional roster projection data.
 * Computes returning/leaving/committed counts per helio position,
 * and coach-set target numbers for next season.
 */

import type { HeliocentricPosition } from '@/types';

export interface PositionNeed {
  pos: HeliocentricPosition;
  returning: number;
  leaving: number;
  committed: number;
  target: number;
  need: number; // max(target - (returning - leaving) - committed, 0)
}

/** Coach-set roster targets per helio position for 2026-27 */
export const POSITION_TARGETS: Record<HeliocentricPosition, number> = {
  PG: 2,
  CG: 4,
  W: 3,
  F: 2,
  B: 2,
};

/** Total scholarship slots available */
export const TOTAL_SCHOLARSHIPS = 13;

/** Annual NIL budget (program-level) */
export const NIL_BUDGET = 45_000;
