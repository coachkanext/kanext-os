/**
 * Position Mapping — Heliocentric to Traditional position mapping
 * Maps between the 5-position helio system and traditional positions.
 */

import type { HeliocentricPosition, Position } from '@/types';
import type { PoolPosition } from '@/data/playerPool';

/** Heliocentric → Traditional position mapping */
export const HELIO_TO_TRADITIONAL: Record<HeliocentricPosition, PoolPosition> = {
  PG: 'PG',
  CG: 'SG',
  W: 'SF',
  F: 'PF',
  B: 'C',
};

/** Traditional → Heliocentric position mapping */
export const TRADITIONAL_TO_HELIO: Record<PoolPosition, HeliocentricPosition> = {
  PG: 'PG',
  SG: 'CG',
  SF: 'W',
  PF: 'F',
  C: 'B',
};

/** Heliocentric position display labels */
export const HELIO_POSITION_LABELS: Record<HeliocentricPosition, string> = {
  PG: 'Point Guard',
  CG: 'Combo Guard',
  W: 'Wing',
  F: 'Forward',
  B: 'Big',
};

/** All helio positions in order for filter UI */
export const HELIO_POSITIONS: HeliocentricPosition[] = ['PG', 'CG', 'W', 'F', 'B'];
