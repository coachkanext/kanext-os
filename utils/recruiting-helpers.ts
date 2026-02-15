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

export function computeRisk(player: PoolPlayer): number {
  let risk = 50; // baseline

  // Level risk adjustments
  if (player.level === 'International') risk += 15;
  else if (player.level === 'HS') risk += 10;
  else if (player.level.startsWith('JUCO')) risk -= 5;
  else risk -= 10; // NCAA portal = lower risk

  // Projection uncertainty: younger players are harder to project
  if (player.classYear === '2027') risk += 12;
  else if (player.classYear === '2026') risk += 5;
  else if (player.classYear === '2025') risk -= 5;

  // Rating variance — large spread between cluster scores = less predictable
  const ratings = getPlayerRatings(player.id);
  if (ratings) {
    const clusters = Object.values(ratings.clusters);
    const mean = clusters.reduce((a, b) => a + b, 0) / clusters.length;
    const variance = clusters.reduce((s, v) => s + (v - mean) ** 2, 0) / clusters.length;
    const stddev = Math.sqrt(variance);
    // Higher stddev = higher risk (uneven profile)
    risk += Math.round(stddev * 0.3);
  }

  // No film = more uncertainty
  if (!player.hasFilm) risk += 8;

  return Math.max(0, Math.min(100, Math.round(risk)));
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
    case 'up': return '#4CAF50';
    case 'down': return '#EF4444';
    default: return '#8A8F98';
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
  { label: '<6\'0"', min: 0, max: 71 },
  { label: '6\'0"-6\'3"', min: 72, max: 75 },
  { label: '6\'4"-6\'7"', min: 76, max: 79 },
  { label: '6\'8"+', min: 80, max: 999 },
] as const;

export const WEIGHT_RANGES = [
  { label: '<180', min: 0, max: 179 },
  { label: '180-210', min: 180, max: 210 },
  { label: '211-240', min: 211, max: 240 },
  { label: '240+', min: 240, max: 999 },
] as const;

export const REGION_OPTIONS = ['Southeast', 'Northeast', 'Midwest', 'Southwest', 'West', 'International'] as const;

// ── Last Touch Helper ──

export function getLastTouch(comms: CommsEntry[]): string {
  const touch = comms.find((c) => c.type === 'touch' || c.type === 'message');
  if (!touch) return 'No contact';
  const days = Math.floor((Date.now() - touch.timestamp.getTime()) / (24 * 60 * 60 * 1000));
  if (days === 0) return `${touch.touchMethod ?? 'Msg'} today`;
  if (days === 1) return `${touch.touchMethod ?? 'Msg'} yesterday`;
  return `${touch.touchMethod ?? 'Msg'} ${days}d ago`;
}
