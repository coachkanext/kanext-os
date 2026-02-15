/**
 * Team Needs — positional roster projection data.
 * Committed ≠ Signed. Need ≠ Open Slots.
 */

import type { HeliocentricPosition } from '@/types';

export interface PositionNeed {
  pos: HeliocentricPosition;
  ret: number;      // returning players
  lv: number;       // leaving (graduation/portal/attrition)
  cmt: number;      // verbally committed (NOT signed)
  sgn: number;      // signed / officially locked
  tgt: number;      // board entries targeting this position
  need: number;     // max(0, targetDepth - projectedCount)
  cov: number;      // closeable targets (Priority+ AND Hot/Close temp)
  projected: number; // RET - LV + CMT + SGN
}

/** Coach-editable target depth per helio position for 2026-27 */
export const TARGET_DEPTH: Record<HeliocentricPosition, number> = {
  PG: 3,
  CG: 4,
  W: 4,
  F: 4,
  B: 3,
};

/** Maximum roster size */
export const ROSTER_MAX = 15;

/** Total scholarship/aid equivalents available */
export const TOTAL_SCHOLARSHIPS = 13;

/** Annual NIL budget (program-level) */
export const NIL_BUDGET = 45_000;

/** Need tie-break priority (higher = breaks ties first) */
export const NEED_PRIORITY_ORDER: HeliocentricPosition[] = ['B', 'PG', 'W', 'CG', 'F'];

/** Pipeline stages that count toward "targets" */
export const TARGET_STAGES = ['Evaluating', 'Contacted', 'Priority', 'Visit Planned', 'Visited', 'Offer Out'] as const;

/** Stages + temperatures that count for coverage quality */
export const COV_STAGES = ['Priority', 'Visit Planned', 'Visited', 'Offer Out'] as const;
export const COV_TEMPS = ['Hot', 'Close'] as const;
