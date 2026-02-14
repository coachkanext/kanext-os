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

// ── Position Trait Weighting (College Level) ──
// Each position values clusters differently. Weights sum to 100 per position.
// Derived from spec: OKR/DKR/TKR splits × sub-cluster percentages, normalized.

const POSITION_WEIGHTS: Record<string, Record<keyof ClusterRatings, number>> = {
  PG: { shooting: 18, finishing: 9,  playmaking: 27, perimeter_defense: 26, interior_defense: 6,  rebounding: 8,  frame: 6  },
  CG: { shooting: 21, finishing: 12, playmaking: 21, perimeter_defense: 20, interior_defense: 8,  rebounding: 9,  frame: 9  },
  W:  { shooting: 16, finishing: 13, playmaking: 11, perimeter_defense: 18, interior_defense: 10, rebounding: 12, frame: 20 },
  F:  { shooting: 11, finishing: 16, playmaking: 9,  perimeter_defense: 12, interior_defense: 16, rebounding: 14, frame: 22 },
  B:  { shooting: 5,  finishing: 21, playmaking: 4,  perimeter_defense: 7,  interior_defense: 25, rebounding: 14, frame: 24 },
};

// ── Position-Based Archetype Derivation ──
// Ranked candidates per position. First match (all thresholds met) wins.

const POSITION_ARCHETYPES: Record<string, { archetype: Archetype; requires: Partial<Record<keyof ClusterRatings, number>> }[]> = {
  PG: [
    { archetype: 'pick_and_roll_operator', requires: { playmaking: 72, shooting: 65 } },
    { archetype: 'primary_ball_handler', requires: { playmaking: 75 } },
    { archetype: 'dho_handoff_hub', requires: { playmaking: 68, shooting: 60 } },
    { archetype: 'connector_guard_wing', requires: { playmaking: 60 } },
  ],
  CG: [
    { archetype: 'spot_up_specialist', requires: { shooting: 75 } },
    { archetype: 'secondary_creator_wing', requires: { playmaking: 65, shooting: 60 } },
    { archetype: 'off_ball_shooter', requires: { shooting: 70 } },
    { archetype: 'three_and_d_wing', requires: { shooting: 68, perimeter_defense: 65 } },
  ],
  W: [
    { archetype: 'two_way_wing', requires: { shooting: 65, perimeter_defense: 65 } },
    { archetype: 'slasher_rim_pressure_wing', requires: { finishing: 70 } },
    { archetype: 'three_and_d_wing', requires: { shooting: 70, perimeter_defense: 60 } },
    { archetype: 'switchable_defender_wing', requires: { perimeter_defense: 70, frame: 60 } },
  ],
  F: [
    { archetype: 'stretch_big', requires: { shooting: 65, frame: 60 } },
    { archetype: 'small_ball_big', requires: { perimeter_defense: 60, frame: 65 } },
    { archetype: 'connector_guard_wing', requires: { playmaking: 60, shooting: 55 } },
    { archetype: 'rebounding_interior_enforcer', requires: { rebounding: 70, frame: 65 } },
  ],
  B: [
    { archetype: 'rim_protector_anchor', requires: { interior_defense: 70, frame: 65 } },
    { archetype: 'post_hub_facilitator_big', requires: { finishing: 65, playmaking: 55 } },
    { archetype: 'vertical_spacer', requires: { finishing: 70, frame: 60 } },
    { archetype: 'rebounding_interior_enforcer', requires: { rebounding: 70, interior_defense: 60 } },
  ],
};

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
 * Compute a player's KR through a position lens.
 * Uses position-specific cluster weights instead of system weights.
 * Falls back to system-based KR if position is unknown.
 */
export function computePositionKR(
  clusters: ClusterRatings,
  position: string,
): number {
  const weights = POSITION_WEIGHTS[position];
  if (!weights) return computeFitKR(clusters, 'motion_read_react', 'pack_line');
  let sum = 0;
  for (const key of ALL_CLUSTERS) {
    sum += clusters[key] * weights[key];
  }
  return Math.round(sum / 100);
}

/**
 * Check whether a player's cluster profile qualifies for at least one archetype
 * at the given position. Used by the Lineup Lens to determine which slots a
 * player can feasibly fill — derived from the canonical archetype thresholds.
 */
export function canPlayPosition(
  clusters: ClusterRatings,
  targetPosition: string, // abbreviation: PG, CG, W, F, B
): boolean {
  const candidates = POSITION_ARCHETYPES[targetPosition] ?? [];
  return candidates.some(({ requires }) =>
    Object.entries(requires).every(
      ([key, threshold]) => clusters[key as keyof ClusterRatings] >= (threshold as number),
    ),
  );
}

/**
 * Derive a player's archetype based on their cluster ratings and current position.
 * Iterates through position-specific archetype candidates in priority order;
 * first candidate where all cluster thresholds are met wins.
 */
export function deriveArchetype(
  clusters: ClusterRatings,
  position: string,
): Archetype {
  const candidates = POSITION_ARCHETYPES[position] ?? [];
  for (const { archetype, requires } of candidates) {
    const qualified = Object.entries(requires).every(
      ([key, threshold]) => clusters[key as keyof ClusterRatings] >= threshold,
    );
    if (qualified) return archetype;
  }
  return candidates.length > 0 ? candidates[candidates.length - 1].archetype : 'two_way_wing';
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
    }));
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
  perimeter_defense: 'OB Defense',
  interior_defense: 'Team Defense',
  rebounding: 'Rebounding',
  frame: 'Physical',
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

  // Sort by |delta| descending — return all 7 clusters
  deltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  return deltas.map((d) => {
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
