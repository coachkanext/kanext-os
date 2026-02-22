/**
 * Recruiting Helpers — computed field utilities for the CRM pipeline.
 * Region mapping, availability derivation, risk scoring, momentum tracking, height parsing.
 */

import type { PoolPlayer } from '@/data/playerPool';
import type { BoardEntry } from '@/data/recruitingBoard';
import type { CommsEntry } from '@/data/mock-comms';
import { getPlayerRatings } from '@/data/playerRatings';

// ── Region Mapping ──

const STATE_REGIONS: Record<string, string> = {
  // Southeast
  AL: 'Southeast', FL: 'Southeast', GA: 'Southeast', KY: 'Southeast', MS: 'Southeast',
  NC: 'Southeast', SC: 'Southeast', TN: 'Southeast', VA: 'Southeast', WV: 'Southeast',
  // Northeast
  CT: 'Northeast', DE: 'Northeast', MA: 'Northeast', MD: 'Northeast', ME: 'Northeast',
  NH: 'Northeast', NJ: 'Northeast', NY: 'Northeast', PA: 'Northeast', RI: 'Northeast', VT: 'Northeast',
  // Midwest
  IA: 'Midwest', IL: 'Midwest', IN: 'Midwest', KS: 'Midwest', MI: 'Midwest',
  MN: 'Midwest', MO: 'Midwest', ND: 'Midwest', NE: 'Midwest', OH: 'Midwest',
  SD: 'Midwest', WI: 'Midwest',
  // Southwest
  AZ: 'Southwest', NM: 'Southwest', OK: 'Southwest', TX: 'Southwest',
  // West
  CA: 'West', CO: 'West', HI: 'West', ID: 'West', MT: 'West',
  NV: 'West', OR: 'West', UT: 'West', WA: 'West', WY: 'West',
  // Other US
  AK: 'West', AR: 'Southeast', DC: 'Northeast', LA: 'Southeast',
};

export function getPlayerRegion(state: string): string {
  return STATE_REGIONS[state] ?? 'International';
}

// ── Availability ──

export function getPlayerAvailability(player: PoolPlayer): string {
  const level = player.level;
  if (level === 'HS') return 'HS';
  if (level.startsWith('JUCO')) return 'JUCO';
  if (level === 'International') return 'International';
  // NCAA / NAIA / USCAA / NCCAA / 3C2A = Portal
  return 'Portal';
}

export const AVAILABILITY_OPTIONS = ['Portal', 'HS', 'JUCO', 'International'] as const;
export type AvailabilityOption = typeof AVAILABILITY_OPTIONS[number];

// ── Risk Score ──

/**
 * Player Confidence Gate — canonical spec implementation.
 * Confidence% ∈ [0,100] measures evidence completeness + stability.
 * Does NOT change KR math — transparency signal only.
 *
 * Maps data availability tiers to Full Player KR confidence ranges:
 *   Official college stats only (multi-year)           → 35–55%
 *   Official college stats + HS stats                  → 40–60%
 *   Multi-year across levels (JUCO→NCAA, etc.)         → 45–65%
 *   1 year tracking (Synergy/PlayVision) + stats       → 65–80%
 *   Multi-year tracking + stats                        → 75–88%
 */
export function computeConfidence(player: PoolPlayer): number {
  const hasFilm = player.hasFilm;
  const level = player.level;
  const isPortal = !level.startsWith('HS') && level !== 'International' && level !== 'HS';
  const isMultiLevel = isPortal && level.startsWith('JUCO'); // JUCO→4yr = multi-level path
  const isMultiYear = player.classYear <= '2025'; // seniors/grads have multi-year data

  // Tier 1: Multi-year tracking data + official stats → 75–88%
  if (hasFilm && isMultiYear) {
    return randomInRange(player.id, 75, 88);
  }

  // Tier 2: 1 year tracking data + official stats → 65–80%
  if (hasFilm && !isMultiYear) {
    return randomInRange(player.id, 65, 80);
  }

  // Tier 3: Multi-year across levels, no tracking → 45–65%
  if (!hasFilm && isMultiLevel) {
    return randomInRange(player.id, 45, 65);
  }

  // Tier 4: College stats + HS stats (portal/NCAA players) → 40–60%
  if (!hasFilm && isPortal) {
    return randomInRange(player.id, 40, 60);
  }

  // Tier 5: HS only or International with no film → 35–55%
  if (!hasFilm) {
    return randomInRange(player.id, 35, 55);
  }

  // HS/International with film but single year → 65–80%
  if (hasFilm) {
    return randomInRange(player.id, 65, 80);
  }

  return 50;
}

/** Deterministic pseudo-random value in range seeded by player ID. */
function randomInRange(playerId: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < playerId.length; i++) {
    hash = (hash * 31 + playerId.charCodeAt(i)) & 0xffff;
  }
  return min + (hash % (max - min + 1));
}

// ── Momentum ──

export type Momentum = 'up' | 'neutral' | 'down';

export function computeMomentum(boardEntry: BoardEntry, comms: CommsEntry[]): Momentum {
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  // Count recent touches (last 7 days)
  const recentTouches = comms.filter(
    (c) => (c.type === 'touch' || c.type === 'message') && now - c.timestamp.getTime() < sevenDays
  ).length;

  // Recent status change?
  const recentStatusChange = comms.some(
    (c) => c.type === 'status_change' && now - c.timestamp.getTime() < sevenDays
  );

  // Board entry recently updated?
  const updatedRecently = now - new Date(boardEntry.updated).getTime() < sevenDays;

  if (recentStatusChange || recentTouches >= 3) return 'up';
  if (recentTouches === 0 && !updatedRecently) return 'down';
  return 'neutral';
}

export function getMomentumLabel(m: Momentum): string {
  switch (m) {
    case 'up': return '\u2191 Trending';
    case 'down': return '\u2193 Cooling';
    default: return '\u2014 Steady';
  }
}

export function getMomentumColor(m: Momentum): string {
  switch (m) {
    case 'up': return '#22C55E';
    case 'down': return '#EF4444';
    default: return '#A1A1AA';
  }
}

// ── Height Parsing ──

export function parseHeightToInches(heightStr: string): number {
  // "6'4\"" → 76
  const match = heightStr.match(/(\d+)'(\d+)/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 12 + parseInt(match[2], 10);
}

// ── Height/Weight Range Filters ──

export const HEIGHT_RANGES = [
  { label: '<5\'10"', min: 0, max: 69 },
  { label: '5\'10"-6\'0"', min: 70, max: 72 },
  { label: '6\'1"-6\'3"', min: 73, max: 75 },
  { label: '6\'4"-6\'6"', min: 76, max: 78 },
  { label: '6\'7"-6\'9"', min: 79, max: 81 },
  { label: '6\'10"+', min: 82, max: 999 },
] as const;

export const WEIGHT_RANGES = [
  { label: '<170', min: 0, max: 169 },
  { label: '170-189', min: 170, max: 189 },
  { label: '190-209', min: 190, max: 209 },
  { label: '210-229', min: 210, max: 229 },
  { label: '230-249', min: 230, max: 249 },
  { label: '250+', min: 250, max: 999 },
] as const;

export const WINGSPAN_RANGES = [
  { label: '<6\'4"', min: 0, max: 75 },
  { label: '6\'4"-6\'7"', min: 76, max: 79 },
  { label: '6\'8"-6\'11"', min: 80, max: 83 },
  { label: '7\'0"-7\'3"', min: 84, max: 87 },
  { label: '7\'4"+', min: 88, max: 999 },
] as const;

export const VERTICAL_RANGES = [
  { label: '<30"', min: 0, max: 29 },
  { label: '30"-33"', min: 30, max: 33 },
  { label: '34"-37"', min: 34, max: 37 },
  { label: '38"-41"', min: 38, max: 41 },
  { label: '42"+', min: 42, max: 999 },
] as const;

export const REGION_OPTIONS = ['Southeast', 'Northeast', 'Midwest', 'Southwest', 'West', 'International'] as const;

// ── Computed Measurables ──

/** Deterministic wingspan (inches) from player height, position, and ID. */
export function computeWingspan(playerId: string, heightInches: number, position: string): number {
  const h = hashStr(playerId + 'ws');
  // Bigs tend to have longer wingspans relative to height
  const bonus = position === 'B' || position === 'F' ? 5 : position === 'W' ? 4 : 3;
  const variation = (h % 7) - 2; // -2 to +4
  return heightInches + bonus + variation;
}

/** Deterministic standing vertical leap (inches) from player ID and position. */
export function computeVertical(playerId: string, position: string): number {
  const h = hashStr(playerId + 'vert');
  // Guards tend to jump higher
  const base = position === 'PG' || position === 'CG' ? 34 : position === 'W' ? 33 : 31;
  const variation = (h % 11) - 3; // -3 to +7
  return base + variation;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  }
  return h;
}

// ── Last Touch Helper ──

export function getLastTouch(comms: CommsEntry[]): string {
  const touch = comms.find((c) => c.type === 'touch' || c.type === 'message');
  if (!touch) return 'No contact';
  const days = Math.floor((Date.now() - touch.timestamp.getTime()) / (24 * 60 * 60 * 1000));
  if (days === 0) return `${touch.touchMethod ?? 'Msg'} today`;
  if (days === 1) return `${touch.touchMethod ?? 'Msg'} yesterday`;
  return `${touch.touchMethod ?? 'Msg'} ${days}d ago`;
}
