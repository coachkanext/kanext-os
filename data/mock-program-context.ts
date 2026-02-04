/**
 * Mock data for Program Context configuration.
 * Defines the AI reasoning parameters for sports mode.
 */

import type {
  ProgramContext,
  SystemPreset,
  OffensiveStyle,
  DefensiveStyle,
  ClusterWeight,
  PositionImportance,
  ProgramBias,
  ClusterType,
  Position,
  BiasType,
} from '@/types';

// =============================================================================
// PRESETS & OPTIONS
// =============================================================================

export const SYSTEM_PRESETS: { value: SystemPreset; label: string; description: string }[] = [
  {
    value: 'motion_offense',
    label: 'Motion Offense',
    description: 'Emphasizes ball movement, spacing, and player versatility.',
  },
  {
    value: 'pick_and_roll',
    label: 'Pick & Roll Heavy',
    description: 'Built around guard-big two-man game actions.',
  },
  {
    value: 'princeton',
    label: 'Princeton',
    description: 'Backdoor cuts, high-post playmaking, patient offense.',
  },
  {
    value: 'dribble_drive',
    label: 'Dribble Drive',
    description: 'Aggressive penetration with kick-outs to shooters.',
  },
  {
    value: 'positionless',
    label: 'Positionless',
    description: 'Versatile players who can play multiple positions.',
  },
  {
    value: 'traditional',
    label: 'Traditional',
    description: 'Classic position-based roles with defined responsibilities.',
  },
];

export const OFFENSIVE_STYLES: { value: OffensiveStyle; label: string }[] = [
  { value: 'motion', label: 'Motion' },
  { value: 'set_plays', label: 'Set Plays' },
  { value: 'transition', label: 'Transition' },
  { value: 'iso_heavy', label: 'ISO Heavy' },
  { value: 'post_oriented', label: 'Post Oriented' },
  { value: 'perimeter_oriented', label: 'Perimeter Oriented' },
];

export const DEFENSIVE_STYLES: { value: DefensiveStyle; label: string }[] = [
  { value: 'man_to_man', label: 'Man-to-Man' },
  { value: 'zone_2_3', label: '2-3 Zone' },
  { value: 'zone_3_2', label: '3-2 Zone' },
  { value: 'matchup_zone', label: 'Matchup Zone' },
  { value: 'press', label: 'Press' },
  { value: 'pack_line', label: 'Pack Line' },
];

export const CLUSTER_LABELS: Record<ClusterType, { label: string; description: string }> = {
  shooting: { label: 'Shooting', description: '3PT, mid-range, catch & shoot' },
  finishing: { label: 'Finishing', description: 'At-rim scoring, floaters, layups' },
  playmaking: { label: 'Playmaking', description: 'Passing, vision, ball handling' },
  on_ball_defense: { label: 'On-Ball Defense', description: 'Perimeter containment, steals' },
  team_defense: { label: 'Team Defense', description: 'Help defense, rotations, IQ' },
  rebounding: { label: 'Rebounding', description: 'Offensive & defensive boards' },
  physical: { label: 'Physical', description: 'Athleticism, strength, endurance' },
};

export const POSITION_LABELS: Record<Position, string> = {
  PG: 'Point Guard',
  SG: 'Shooting Guard',
  SF: 'Small Forward',
  PF: 'Power Forward',
  C: 'Center',
};

export const BIAS_LABELS: Record<BiasType, { label: string; description: string }> = {
  prefer_experience: { label: 'Experience', description: 'Prefer upperclassmen' },
  prefer_youth: { label: 'Youth', description: 'Prefer younger players with upside' },
  prefer_size: { label: 'Size', description: 'Prioritize height and length' },
  prefer_speed: { label: 'Speed', description: 'Prioritize quickness and athleticism' },
  prefer_shooting: { label: 'Shooting', description: 'Prioritize floor spacing' },
  prefer_defense: { label: 'Defense', description: 'Prioritize defensive ability' },
  prefer_local: { label: 'Local', description: 'Prefer regional players' },
  prefer_transfers: { label: 'Transfers', description: 'Prefer experienced transfers' },
};

// =============================================================================
// DEFAULT PROGRAM CONTEXT
// =============================================================================

export const DEFAULT_CLUSTER_WEIGHTS: ClusterWeight[] = [
  { cluster: 'shooting', weight: 18 },
  { cluster: 'finishing', weight: 14 },
  { cluster: 'playmaking', weight: 16 },
  { cluster: 'on_ball_defense', weight: 14 },
  { cluster: 'team_defense', weight: 12 },
  { cluster: 'rebounding', weight: 14 },
  { cluster: 'physical', weight: 12 },
];

export const DEFAULT_POSITION_IMPORTANCE: PositionImportance[] = [
  { position: 'PG', importance: 'critical' },
  { position: 'SG', importance: 'high' },
  { position: 'SF', importance: 'medium' },
  { position: 'PF', importance: 'high' },
  { position: 'C', importance: 'medium' },
];

export const DEFAULT_BIASES: ProgramBias[] = [
  { type: 'prefer_experience', strength: 60, enabled: true },
  { type: 'prefer_youth', strength: 40, enabled: false },
  { type: 'prefer_size', strength: 50, enabled: false },
  { type: 'prefer_speed', strength: 70, enabled: true },
  { type: 'prefer_shooting', strength: 80, enabled: true },
  { type: 'prefer_defense', strength: 65, enabled: true },
  { type: 'prefer_local', strength: 40, enabled: false },
  { type: 'prefer_transfers', strength: 55, enabled: true },
];

export const DEFAULT_PROGRAM_CONTEXT: ProgramContext = {
  programId: 'mbb-varsity',
  scholarships: 10,
  scholarshipsUsed: 8,
  nilBudget: 250000,
  nilUsed: 180000,
  systemPreset: 'motion_offense',
  offensiveStyle: 'motion',
  defensiveStyle: 'man_to_man',
  tempo: 65, // Moderate-fast
  clusterWeights: DEFAULT_CLUSTER_WEIGHTS,
  positionImportance: DEFAULT_POSITION_IMPORTANCE,
  biases: DEFAULT_BIASES,
};

// =============================================================================
// HELPERS
// =============================================================================

export function getSystemPresetLabel(preset: SystemPreset): string {
  return SYSTEM_PRESETS.find((p) => p.value === preset)?.label ?? preset;
}

export function getSystemPresetDescription(preset: SystemPreset): string {
  return SYSTEM_PRESETS.find((p) => p.value === preset)?.description ?? '';
}

export function getOffensiveStyleLabel(style: OffensiveStyle): string {
  return OFFENSIVE_STYLES.find((s) => s.value === style)?.label ?? style;
}

export function getDefensiveStyleLabel(style: DefensiveStyle): string {
  return DEFENSIVE_STYLES.find((s) => s.value === style)?.label ?? style;
}

export function getClusterLabel(cluster: ClusterType): string {
  return CLUSTER_LABELS[cluster]?.label ?? cluster;
}

export function getImportanceColor(importance: string): string {
  switch (importance) {
    case 'critical':
      return '#DC3545';
    case 'high':
      return '#E07C24';
    case 'medium':
      return '#0D6EFD';
    case 'low':
      return '#6C757D';
    default:
      return '#6C757D';
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
