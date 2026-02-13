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
 * Compute a player's offensive and defensive KR (base and fit-adjusted).
 * Base = simple average of cluster groups.
 * Fit = system-weighted contribution normalized to the group total.
 */
export function computeOffDefKR(
  clusters: ClusterRatings,
  offStyle: OffensiveStyle,
  defStyle: DefensiveStyle,
): { baseOff: number; baseDef: number; fitOff: number; fitDef: number } {
  const ow = OFFENSIVE_STYLE_CLUSTERS[offStyle];
  const dw = DEFENSIVE_STYLE_CLUSTERS[defStyle];

  const baseOff = Math.round((clusters.shooting + clusters.finishing + clusters.playmaking) / 3);
  const baseDef = Math.round((clusters.perimeter_defense + clusters.interior_defense + clusters.rebounding + clusters.frame) / 4);

  const fitOff = Math.round(
    (clusters.shooting * ow.shooting + clusters.finishing * ow.finishing + clusters.playmaking * ow.playmaking) / 53,
  );
  const fitDef = Math.round(
    (clusters.perimeter_defense * dw.perimeter_defense +
      clusters.interior_defense * dw.interior_defense +
      clusters.rebounding * dw.rebounding +
      clusters.frame * dw.frame) / 47,
  );

  return { baseOff, baseDef, fitOff, fitDef };
}

// Cluster key → readable label for fit reason driver text
const CLUSTER_DRIVER_LABELS: Record<keyof ClusterRatings, string> = {
  shooting: 'Shooting',
  finishing: 'Finishing',
  playmaking: 'Playmaking',
  perimeter_defense: 'Perimeter D',
  interior_defense: 'Interior D',
  rebounding: 'Rebounding',
  frame: 'Frame',
};

// System-specific reason templates keyed by cluster + positive/negative
const REASON_TEMPLATES: Record<string, { pos: string; neg: string }> = {
  shooting: { pos: 'spacing fuels system shot creation', neg: 'limited spacing pressures offensive flow' },
  finishing: { pos: 'rim pressure complements system design', neg: 'lack of rim finishing limits paint scoring' },
  playmaking: { pos: 'vision and passing accelerate ball movement', neg: 'playmaking gap slows offensive reads' },
  perimeter_defense: { pos: 'perimeter containment anchors scheme', neg: 'perimeter liability exposes defensive gaps' },
  interior_defense: { pos: 'rim protection supports defensive structure', neg: 'interior softness weakens paint defense' },
  rebounding: { pos: 'boards fuel transition and second chances', neg: 'rebounding deficit costs extra possessions' },
  frame: { pos: 'size and strength fit positional demands', neg: 'physical profile limits defensive versatility' },
};

export interface FitReason {
  driver: string;
  cluster: string;
  delta: number;
  reason: string;
}

/**
 * Generate 3-4 structured fit reasons with driver/cluster/delta/reason.
 * Each: "{Driver} ({Cluster}, +Δ) — {system-tied reason}"
 */
export function getFitReasons(
  clusters: ClusterRatings,
  archetypes: Archetype[],
  offStyle: OffensiveStyle,
  defStyle: DefensiveStyle,
): FitReason[] {
  const ow = OFFENSIVE_STYLE_CLUSTERS[offStyle];
  const dw = DEFENSIVE_STYLE_CLUSTERS[defStyle];

  // Compute per-cluster delta: fit contribution vs base contribution
  const deltas: { key: keyof ClusterRatings; label: string; delta: number }[] = [];

  // Offense clusters: base contribution = clusterVal * (53/3) / 53 = clusterVal / 3
  // Fit contribution = clusterVal * systemWeight / 53
  for (const key of OFF_CLUSTERS) {
    const baseContrib = clusters[key] / 3;
    const fitContrib = (clusters[key] * (ow as any)[key]) / 53;
    deltas.push({
      key,
      label: CLUSTER_LABELS[key as ClusterType]?.label ?? key,
      delta: Math.round(fitContrib - baseContrib),
    });
  }

  // Defense clusters: base contribution = clusterVal * (47/4) / 47 = clusterVal / 4
  // Fit contribution = clusterVal * systemWeight / 47
  for (const key of DEF_CLUSTERS) {
    const baseContrib = clusters[key] / 4;
    const fitContrib = (clusters[key] * (dw as any)[key]) / 47;
    deltas.push({
      key,
      label: CLUSTER_LABELS[key as ClusterType]?.label ?? key,
      delta: Math.round(fitContrib - baseContrib),
    });
  }

  // Sort by |delta| descending, take top 3-4
  deltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const top = deltas.slice(0, 4);

  return top.map((d) => {
    const isPositive = d.delta >= 0;
    const template = REASON_TEMPLATES[d.key] ?? { pos: 'aligns with system', neg: 'misaligns with system' };
    const driverLabel = CLUSTER_DRIVER_LABELS[d.key] ?? d.key;
    return {
      driver: isPositive ? 'Boost' : 'Gap',
      cluster: d.label,
      delta: d.delta,
      reason: isPositive ? template.pos : template.neg,
    };
  });
}
