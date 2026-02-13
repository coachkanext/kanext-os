/**
 * Fit KR Computation Module
 * System-adjusted player ratings using cluster weights × player cluster scores.
 *
 * FitKR = Σ(playerCluster × systemWeight) / 100
 * Offense weights sum to 53, Defense weights sum to 47 → total 100.
 */

import {
  OFFENSIVE_STYLE_CLUSTERS,
  DEFENSIVE_STYLE_CLUSTERS,
  CLUSTER_LABELS,
} from '@/data/mock-program-context';
import { ARCHETYPE_LABELS } from '@/data/system-demand-profiles';
import type { OffensiveStyle, DefensiveStyle, ClusterType } from '@/types';
import type { Archetype } from '@/data/system-demand-profiles';

export type ClusterRatings = {
  shooting: number;
  finishing: number;
  playmaking: number;
  perimeter_defense: number;
  interior_defense: number;
  rebounding: number;
  frame: number;
};

const ALL_CLUSTERS: (keyof ClusterRatings)[] = [
  'shooting', 'finishing', 'playmaking',
  'perimeter_defense', 'interior_defense', 'rebounding', 'frame',
];

const OFF_CLUSTERS: (keyof ClusterRatings)[] = ['shooting', 'finishing', 'playmaking'];
const DEF_CLUSTERS: (keyof ClusterRatings)[] = ['perimeter_defense', 'interior_defense', 'rebounding', 'frame'];

/**
 * Compute a player's Fit KR for a given offensive + defensive system.
 * Result is 0–100 scale.
 */
export function computeFitKR(
  clusters: ClusterRatings,
  offStyle: OffensiveStyle,
  defStyle: DefensiveStyle,
): number {
  const ow = OFFENSIVE_STYLE_CLUSTERS[offStyle];
  const dw = DEFENSIVE_STYLE_CLUSTERS[defStyle];

  const offScore =
    clusters.shooting * ow.shooting +
    clusters.finishing * ow.finishing +
    clusters.playmaking * ow.playmaking;

  const defScore =
    clusters.perimeter_defense * dw.perimeter_defense +
    clusters.interior_defense * dw.interior_defense +
    clusters.rebounding * dw.rebounding +
    clusters.frame * dw.frame;

  return Math.round((offScore + defScore) / 100);
}

/**
 * Compute lineup-level OFF / DEF / Net ratings for a set of starters.
 * Minutes-weighted if provided, otherwise equal weight.
 */
export function computeLineupRating(
  starterClusters: ClusterRatings[],
  offStyle: OffensiveStyle,
  defStyle: DefensiveStyle,
  minutes?: number[],
): { offKR: number; defKR: number; netKR: number } {
  const ow = OFFENSIVE_STYLE_CLUSTERS[offStyle];
  const dw = DEFENSIVE_STYLE_CLUSTERS[defStyle];
  const n = starterClusters.length;
  if (n === 0) return { offKR: 0, defKR: 0, netKR: 0 };

  const totalMin = minutes ? minutes.reduce((a, b) => a + b, 0) : n;

  let offSum = 0;
  let defSum = 0;

  starterClusters.forEach((c, i) => {
    const w = minutes ? (minutes[i] / totalMin) : (1 / n);

    const playerOff =
      (c.shooting * ow.shooting + c.finishing * ow.finishing + c.playmaking * ow.playmaking) / 53;
    const playerDef =
      (c.perimeter_defense * dw.perimeter_defense +
        c.interior_defense * dw.interior_defense +
        c.rebounding * dw.rebounding +
        c.frame * dw.frame) / 47;

    offSum += w * playerOff;
    defSum += w * playerDef;
  });

  const offKR = Math.round(offSum);
  const defKR = Math.round(defSum);
  const netKR = offKR - defKR; // positive = offense-leaning
  return { offKR, defKR, netKR };
}

/**
 * Get top 3 cluster strengths for a starting lineup.
 */
export function getClusterDrivers(
  starterClusters: ClusterRatings[],
): { cluster: keyof ClusterRatings; label: string; value: number }[] {
  if (starterClusters.length === 0) return [];

  const avgClusters: Record<string, number> = {};
  for (const key of ALL_CLUSTERS) {
    avgClusters[key] = Math.round(
      starterClusters.reduce((sum, c) => sum + c[key], 0) / starterClusters.length,
    );
  }

  return ALL_CLUSTERS
    .map((key) => ({
      cluster: key,
      label: CLUSTER_LABELS[key as ClusterType]?.label ?? key,
      value: avgClusters[key],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
}

/**
 * Generate 2-3 bullet reasons explaining why a player fits (or doesn't) in the current system.
 */
export function getFitReasons(
  clusters: ClusterRatings,
  archetypes: Archetype[],
  offStyle: OffensiveStyle,
  defStyle: DefensiveStyle,
): string[] {
  const ow = OFFENSIVE_STYLE_CLUSTERS[offStyle];
  const dw = DEFENSIVE_STYLE_CLUSTERS[defStyle];
  const reasons: string[] = [];

  // Find the highest-weighted offensive cluster for this system
  const topOffCluster = OFF_CLUSTERS.reduce((best, key) =>
    (ow as any)[key] > (ow as any)[best] ? key : best, OFF_CLUSTERS[0]);
  const topDefCluster = DEF_CLUSTERS.reduce((best, key) =>
    (dw as any)[key] > (dw as any)[best] ? key : best, DEF_CLUSTERS[0]);

  const topOffLabel = CLUSTER_LABELS[topOffCluster as ClusterType]?.label ?? topOffCluster;
  const topDefLabel = CLUSTER_LABELS[topDefCluster as ClusterType]?.label ?? topDefCluster;

  // Offense fit reason
  const offVal = clusters[topOffCluster];
  if (offVal >= 75) {
    reasons.push(`Strong ${topOffLabel} (${offVal}) — aligns with system emphasis`);
  } else if (offVal < 55) {
    reasons.push(`${topOffLabel} (${offVal}) below system demand — limits offensive fit`);
  }

  // Defense fit reason
  const defVal = clusters[topDefCluster];
  if (defVal >= 75) {
    reasons.push(`Elite ${topDefLabel} (${defVal}) — anchors defensive scheme`);
  } else if (defVal < 55) {
    reasons.push(`${topDefLabel} (${defVal}) is a gap in this defensive scheme`);
  }

  // Archetype reason
  if (archetypes.length > 0) {
    const primaryLabel = ARCHETYPE_LABELS[archetypes[0]] ?? archetypes[0];
    reasons.push(`Primary archetype: ${primaryLabel}`);
  }

  return reasons.slice(0, 3);
}
