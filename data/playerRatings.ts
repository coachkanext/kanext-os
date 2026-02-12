/**
 * Player KR Ratings — Placeholder data for National Pool display.
 * Overall KR (0–99) and 7 cluster KRs per player.
 * These are placeholder values until real KLVN pipeline is active.
 */

import type { ClusterType } from '@/types';

export interface PlayerRatings {
  playerId: string;
  overall: number;
  clusters: Record<ClusterType, number>;
}

export const PLAYER_RATINGS: PlayerRatings[] = [
  // ── High School ──
  { playerId: 'pp-01', overall: 88, clusters: { shooting: 82, finishing: 79, playmaking: 92, perimeter_defense: 85, interior_defense: 72, rebounding: 68, frame: 80 } },
  { playerId: 'pp-03', overall: 91, clusters: { shooting: 84, finishing: 90, playmaking: 78, perimeter_defense: 82, interior_defense: 76, rebounding: 80, frame: 89 } },
  { playerId: 'pp-05', overall: 83, clusters: { shooting: 78, finishing: 72, playmaking: 90, perimeter_defense: 80, interior_defense: 65, rebounding: 60, frame: 76 } },
  { playerId: 'pp-07', overall: 90, clusters: { shooting: 65, finishing: 88, playmaking: 70, perimeter_defense: 78, interior_defense: 92, rebounding: 91, frame: 93 } },
  { playerId: 'pp-09', overall: 87, clusters: { shooting: 85, finishing: 86, playmaking: 76, perimeter_defense: 84, interior_defense: 74, rebounding: 78, frame: 85 } },
  { playerId: 'pp-11', overall: 86, clusters: { shooting: 91, finishing: 78, playmaking: 80, perimeter_defense: 76, interior_defense: 68, rebounding: 65, frame: 82 } },
  { playerId: 'pp-15', overall: 80, clusters: { shooting: 84, finishing: 74, playmaking: 72, perimeter_defense: 78, interior_defense: 66, rebounding: 62, frame: 77 } },
  { playerId: 'pp-17', overall: 85, clusters: { shooting: 72, finishing: 84, playmaking: 68, perimeter_defense: 80, interior_defense: 82, rebounding: 86, frame: 88 } },
  { playerId: 'pp-19', overall: 82, clusters: { shooting: 74, finishing: 70, playmaking: 91, perimeter_defense: 82, interior_defense: 64, rebounding: 58, frame: 75 } },
  { playerId: 'pp-22', overall: 89, clusters: { shooting: 76, finishing: 87, playmaking: 74, perimeter_defense: 82, interior_defense: 86, rebounding: 88, frame: 91 } },

  // ── JUCO ──
  { playerId: 'pp-02', overall: 84, clusters: { shooting: 88, finishing: 82, playmaking: 74, perimeter_defense: 72, interior_defense: 65, rebounding: 70, frame: 78 } },
  { playerId: 'pp-06', overall: 86, clusters: { shooting: 68, finishing: 85, playmaking: 66, perimeter_defense: 74, interior_defense: 80, rebounding: 88, frame: 87 } },
  { playerId: 'pp-08', overall: 83, clusters: { shooting: 87, finishing: 80, playmaking: 78, perimeter_defense: 76, interior_defense: 68, rebounding: 65, frame: 79 } },
  { playerId: 'pp-12', overall: 81, clusters: { shooting: 70, finishing: 82, playmaking: 64, perimeter_defense: 76, interior_defense: 78, rebounding: 84, frame: 83 } },
  { playerId: 'pp-14', overall: 85, clusters: { shooting: 82, finishing: 76, playmaking: 86, perimeter_defense: 84, interior_defense: 70, rebounding: 66, frame: 80 } },
  { playerId: 'pp-16', overall: 82, clusters: { shooting: 52, finishing: 80, playmaking: 56, perimeter_defense: 68, interior_defense: 90, rebounding: 92, frame: 88 } },
  { playerId: 'pp-18', overall: 83, clusters: { shooting: 78, finishing: 84, playmaking: 72, perimeter_defense: 78, interior_defense: 74, rebounding: 80, frame: 82 } },
  { playerId: 'pp-21', overall: 87, clusters: { shooting: 90, finishing: 86, playmaking: 76, perimeter_defense: 74, interior_defense: 66, rebounding: 68, frame: 84 } },
  { playerId: 'pp-23', overall: 80, clusters: { shooting: 76, finishing: 82, playmaking: 70, perimeter_defense: 78, interior_defense: 72, rebounding: 76, frame: 80 } },

  // ── NCAA D2 ──
  { playerId: 'pp-10', overall: 79, clusters: { shooting: 76, finishing: 70, playmaking: 86, perimeter_defense: 82, interior_defense: 64, rebounding: 60, frame: 74 } },
  { playerId: 'pp-24', overall: 76, clusters: { shooting: 80, finishing: 68, playmaking: 82, perimeter_defense: 74, interior_defense: 62, rebounding: 58, frame: 72 } },

  // ── International ──
  { playerId: 'pp-04', overall: 84, clusters: { shooting: 62, finishing: 82, playmaking: 68, perimeter_defense: 72, interior_defense: 88, rebounding: 90, frame: 92 } },
  { playerId: 'pp-13', overall: 82, clusters: { shooting: 80, finishing: 78, playmaking: 82, perimeter_defense: 76, interior_defense: 74, rebounding: 72, frame: 80 } },
  { playerId: 'pp-20', overall: 81, clusters: { shooting: 58, finishing: 78, playmaking: 72, perimeter_defense: 70, interior_defense: 86, rebounding: 84, frame: 88 } },

  // ── HS (additional) ──
  { playerId: 'pp-25', overall: 78, clusters: { shooting: 74, finishing: 76, playmaking: 70, perimeter_defense: 78, interior_defense: 72, rebounding: 74, frame: 80 } },
];

/** Get ratings for a specific player, or null if not found */
export function getPlayerRatings(playerId: string): PlayerRatings | null {
  return PLAYER_RATINGS.find((r) => r.playerId === playerId) ?? null;
}
