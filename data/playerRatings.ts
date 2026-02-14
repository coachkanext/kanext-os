/**
 * Player KR Ratings — Placeholder data for National Pool display.
 * Overall KR (0–99) and 7 cluster KRs per player.
 * These are placeholder values until real KLVN pipeline is active.
 */

import type { ClusterType } from '@/types';
import { CLUSTER_SUBCLUSTERS, type ClusterRatings } from '@/data/roster-data';

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

// ─── Shared Helpers ───

// Deterministic hash for stable subcluster generation
function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Generate subclusters for a pool player's cluster */
export function getPoolPlayerSubclusters(
  playerId: string,
  clusterKey: keyof ClusterRatings,
  baseRating: number,
): { name: string; rating: number }[] {
  const subs = CLUSTER_SUBCLUSTERS[clusterKey];
  return subs.map((name, i) => {
    const seed = simpleHash(`${playerId}-${clusterKey}-${i}`);
    const variation = (seed % 17) - 8;
    const rating = Math.max(15, Math.min(98, baseRating + variation));
    return { name, rating };
  });
}

/** Compute team-level cluster averages from a set of player IDs */
export function getTeamClusterAverages(playerIds: string[]): {
  clusters: Record<ClusterType, number>;
  overall: number;
  offKR: number;
  defKR: number;
} {
  const allClusters: ClusterType[] = [
    'shooting', 'finishing', 'playmaking',
    'perimeter_defense', 'interior_defense', 'rebounding', 'frame',
  ];
  const sums: Record<string, number> = {};
  allClusters.forEach((c) => { sums[c] = 0; });
  let totalOverall = 0;
  let count = 0;

  playerIds.forEach((id) => {
    const r = getPlayerRatings(id);
    if (!r) return;
    count++;
    totalOverall += r.overall;
    allClusters.forEach((c) => { sums[c] += r.clusters[c]; });
  });

  if (count === 0) {
    const zeros = {} as Record<ClusterType, number>;
    allClusters.forEach((c) => { zeros[c] = 0; });
    return { clusters: zeros, overall: 0, offKR: 0, defKR: 0 };
  }

  const clusters = {} as Record<ClusterType, number>;
  allClusters.forEach((c) => { clusters[c] = Math.round(sums[c] / count); });
  const overall = Math.round(totalOverall / count);
  const offKR = Math.round((clusters.shooting + clusters.finishing + clusters.playmaking) / 3);
  const defKR = Math.round((clusters.perimeter_defense + clusters.interior_defense + clusters.rebounding + clusters.frame) / 4);

  return { clusters, overall, offKR, defKR };
}

/** Weekly update period options */
export const WEEKLY_UPDATE_OPTIONS = [
  { value: 'preseason', label: 'Preseason' },
  { value: 'week_1', label: 'Week 1' },
  { value: 'week_2', label: 'Week 2' },
  { value: 'week_3', label: 'Week 3' },
  { value: 'week_4', label: 'Week 4' },
  { value: 'week_5', label: 'Week 5' },
  { value: 'week_6', label: 'Week 6' },
  { value: 'week_7', label: 'Week 7' },
  { value: 'week_8', label: 'Week 8' },
  { value: 'week_9', label: 'Week 9' },
  { value: 'week_10', label: 'Week 10' },
  { value: 'week_11', label: 'Week 11' },
  { value: 'week_12', label: 'Week 12' },
  { value: 'week_13', label: 'Week 13' },
  { value: 'week_14', label: 'Week 14' },
  { value: 'conf_tourney', label: 'Conf Tourney' },
  { value: 'national_tourney', label: 'National Tournament' },
];
