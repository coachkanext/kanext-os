/**
 * Position Mapping — Canonical 5-position system.
 * PG (Point Guard), CG (Combo Guard), W (Wing), F (Forward), B (Big).
 * These are the ONLY positions used anywhere in the app.
 */

import type { HeliocentricPosition } from '@/types';
import type { PoolPosition } from '@/data/playerPool';

/** Heliocentric → Pool (identity — both use canonical positions now) */
export const HELIO_TO_POOL: Record<HeliocentricPosition, PoolPosition> = {
  PG: 'PG',
  CG: 'CG',
  W: 'W',
  F: 'F',
  B: 'B',
};

/** Traditional → Canonical mapping (for any legacy data) */
export const TRADITIONAL_TO_CANONICAL: Record<string, HeliocentricPosition> = {
  PG: 'PG',
  SG: 'CG',
  SF: 'W',
  PF: 'F',
  C: 'B',
  G: 'PG',
  'G/F': 'W',
  'F/C': 'F',
};

/** Heliocentric position display labels */
export const HELIO_POSITION_LABELS: Record<HeliocentricPosition, string> = {
  PG: 'Point Guard',
  CG: 'Combo Guard',
  W: 'Wing',
  F: 'Forward',
  B: 'Big',
};

/** All canonical positions in order for filter UI */
export const HELIO_POSITIONS: HeliocentricPosition[] = ['PG', 'CG', 'W', 'F', 'B'];

// Legacy aliases for backwards compatibility
export const HELIO_TO_TRADITIONAL = HELIO_TO_POOL;
export const TRADITIONAL_TO_HELIO = TRADITIONAL_TO_CANONICAL;
