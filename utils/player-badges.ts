/**
 * Player Badge System — KaNeXT Badge computation per canonical spec.
 *
 * Badge eligibility: Component KR ≥ threshold AND relevant trait(s) ≥ threshold.
 * Bronze ≥ 90, Silver ≥ 94, Gold ≥ 97.
 */

import type { ClusterType } from '@/types';
import type { ClusterRatings } from '@/data/roster-data';

export type BadgeLevel = 'Bronze' | 'Silver' | 'Gold';

export interface PlayerBadge {
  name: string;
  level: BadgeLevel;
  component: string;
}

export const BADGE_LEVEL_COLORS: Record<BadgeLevel, string> = {
  Bronze: '#CD7F32',
  Silver: '#A8A9AD',
  Gold: '#FFFFFF',
};

const BADGE_THRESHOLDS: { level: BadgeLevel; min: number }[] = [
  { level: 'Gold', min: 97 },
  { level: 'Silver', min: 94 },
  { level: 'Bronze', min: 90 },
];

interface BadgeDef {
  name: string;
  component: ClusterType;
  traits: string[]; // subcluster names to check
}

const OFFENSIVE_BADGES: BadgeDef[] = [
  { name: 'Catch-and-Shoot', component: 'shooting', traits: ['3PT Spot-Up'] },
  { name: 'Movement Shooter', component: 'shooting', traits: ['3PT Movement'] },
  { name: 'Deep Range', component: 'shooting', traits: ['3PT Deep Range'] },
  { name: 'Pull-Up Shot Maker', component: 'shooting', traits: ['2PT Off-Dribble'] },
  { name: 'Rim Finisher', component: 'finishing', traits: ['Layup'] },
  { name: 'Contact Finisher', component: 'finishing', traits: ['Dunk'] },
  { name: 'Rim Pressure', component: 'finishing', traits: ['Close'] },
  { name: 'FT Generator', component: 'finishing', traits: ['Foul Draw Rate'] },
  { name: 'Cutter', component: 'finishing', traits: ['Floater/Runner'] },
  { name: 'Primary Playmaker', component: 'playmaking', traits: ['Passing Vision', 'Passing Accuracy'] },
  { name: 'Drive-and-Kick', component: 'playmaking', traits: ['Drive-and-Kick'] },
  { name: 'Ball Security', component: 'playmaking', traits: ['Ball Security'] },
  { name: 'Transition Playmaker', component: 'playmaking', traits: ['Transition'] },
];

const DEFENSIVE_BADGES: BadgeDef[] = [
  { name: 'Point-of-Attack', component: 'perimeter_defense', traits: ['Containment'] },
  { name: 'Ball Pressure', component: 'perimeter_defense', traits: ['Ball Pressure'] },
  { name: 'Lockdown Perimeter', component: 'perimeter_defense', traits: ['Containment', 'Off-Ball Denial'] },
  { name: 'Rim Protector', component: 'interior_defense', traits: ['Block', 'Rim Deterrence'] },
  { name: 'Paint Anchor', component: 'interior_defense', traits: ['Post Defense', 'Vertical Contest'] },
  { name: 'Help Defender', component: 'interior_defense', traits: ['Help Defense'] },
  { name: 'Passing Lane Disruptor', component: 'perimeter_defense', traits: ['Steal', 'Disruption'] },
  { name: 'Defensive Rebounder', component: 'rebounding', traits: ['Defensive', 'Box-Out'] },
  { name: 'Physical Rebounder', component: 'rebounding', traits: ['Offensive'] },
];

const ALL_BADGES = [...OFFENSIVE_BADGES, ...DEFENSIVE_BADGES];

// Exported for filter UI
export const OFFENSIVE_BADGE_NAMES = OFFENSIVE_BADGES.map((b) => b.name);
export const DEFENSIVE_BADGE_NAMES = DEFENSIVE_BADGES.map((b) => b.name);
export const ALL_BADGE_NAMES = ALL_BADGES.map((b) => b.name);
export const BADGE_LEVELS: BadgeLevel[] = ['Gold', 'Silver', 'Bronze'];

/**
 * Compute badges for a player given their cluster ratings and subcluster getter.
 * Max 1 Gold, 3 Silver, unlimited Bronze per spec.
 */
export function computePlayerBadges(
  clusters: ClusterRatings,
  getSubclusters: (clusterKey: keyof ClusterRatings) => { name: string; rating: number }[],
): PlayerBadge[] {
  const raw: (PlayerBadge & { score: number })[] = [];

  for (const def of ALL_BADGES) {
    const componentKR = clusters[def.component];
    const subs = getSubclusters(def.component);

    // Find minimum trait score across required traits
    let minTrait = 100;
    for (const traitName of def.traits) {
      const sub = subs.find((s) => s.name === traitName);
      if (!sub) { minTrait = 0; break; }
      minTrait = Math.min(minTrait, sub.rating);
    }

    // Check thresholds (highest first)
    for (const { level, min } of BADGE_THRESHOLDS) {
      if (componentKR >= min && minTrait >= min) {
        raw.push({ name: def.name, level, component: def.component, score: componentKR + minTrait });
        break;
      }
    }
  }

  // Enforce caps: max 1 Gold, 3 Silver
  const golds = raw.filter((b) => b.level === 'Gold').sort((a, b) => b.score - a.score);
  const silvers = raw.filter((b) => b.level === 'Silver').sort((a, b) => b.score - a.score);
  const bronzes = raw.filter((b) => b.level === 'Bronze').sort((a, b) => b.score - a.score);

  const result: PlayerBadge[] = [];
  result.push(...golds.slice(0, 1).map(({ score: _, ...b }) => b));
  result.push(...silvers.slice(0, 3).map(({ score: _, ...b }) => b));
  result.push(...bronzes.map(({ score: _, ...b }) => b));

  return result;
}
