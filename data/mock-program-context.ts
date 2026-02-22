/**
 * Mock data for Program Context configuration.
 * Defines the AI reasoning parameters for sports mode.
 */

import type {
  ProgramContext,
  SystemPreset,
  OffensiveStyle,
  DefensiveStyle,
  HeliocentricPosition,
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
  { value: 'spread_pick_and_roll', label: 'Spread Pick-and-Roll' },
  { value: 'five_out_motion', label: '5-Out Motion' },
  { value: 'motion_read_react', label: 'Motion / Read & React' },
  { value: 'pace_and_space', label: 'Pace & Space' },
  { value: 'dribble_drive', label: 'Dribble Drive' },
  { value: 'princeton', label: 'Princeton' },
  { value: 'flex', label: 'Flex' },
  { value: 'swing', label: 'Swing' },
  { value: 'post_centric', label: 'Post-Centric / Inside-Out' },
  { value: 'moreyball', label: 'Moreyball' },
  { value: 'heliocentric', label: 'Heliocentric' },
];

export const DEFENSIVE_STYLES: { value: DefensiveStyle; label: string }[] = [
  { value: 'containment_man', label: 'Containment Man' },
  { value: 'pack_line', label: 'Pack Line' },
  { value: 'pressure_man', label: 'Pressure Man (Denial)' },
  { value: 'switch_everything', label: 'Switch Everything' },
  { value: 'ice_no_middle', label: 'ICE / No-Middle' },
  { value: 'zone_structured', label: 'Zone (Structured)' },
  { value: 'matchup_zone', label: 'Matchup Zone / Hybrid' },
  { value: 'press', label: 'Press' },
  { value: 'junk_special', label: 'Junk / Special' },
];

// Cluster weight mappings for offensive styles
// Offense (53) + Defense (47) = 100 total
// Offensive clusters (sum = 53 for each system)
export const OFFENSIVE_STYLE_CLUSTERS: Record<OffensiveStyle, { shooting: number; finishing: number; playmaking: number }> = {
  spread_pick_and_roll: { shooting: 18, finishing: 16, playmaking: 19 },
  five_out_motion: { shooting: 18, finishing: 17, playmaking: 18 },
  motion_read_react: { shooting: 17, finishing: 16, playmaking: 20 },
  pace_and_space: { shooting: 20, finishing: 17, playmaking: 16 },
  dribble_drive: { shooting: 15, finishing: 21, playmaking: 17 },
  princeton: { shooting: 15, finishing: 18, playmaking: 20 },
  flex: { shooting: 16, finishing: 20, playmaking: 17 },
  swing: { shooting: 17, finishing: 18, playmaking: 18 },
  post_centric: { shooting: 13, finishing: 25, playmaking: 15 },
  moreyball: { shooting: 22, finishing: 21, playmaking: 10 },
  heliocentric: { shooting: 16, finishing: 16, playmaking: 21 },
};

// Cluster weight mappings for defensive styles
// Defensive clusters (sum = 47 for each system)
export const DEFENSIVE_STYLE_CLUSTERS: Record<DefensiveStyle, { on_ball_defense: number; team_defense: number; rebounding: number; physical: number }> = {
  containment_man: { on_ball_defense: 18, team_defense: 15, rebounding: 8, physical: 6 },
  pack_line: { on_ball_defense: 12, team_defense: 18, rebounding: 10, physical: 7 },
  pressure_man: { on_ball_defense: 20, team_defense: 15, rebounding: 5, physical: 7 },
  switch_everything: { on_ball_defense: 16, team_defense: 15, rebounding: 7, physical: 9 },
  ice_no_middle: { on_ball_defense: 17, team_defense: 16, rebounding: 7, physical: 7 },
  zone_structured: { on_ball_defense: 10, team_defense: 20, rebounding: 10, physical: 7 },
  matchup_zone: { on_ball_defense: 13, team_defense: 19, rebounding: 8, physical: 7 },
  press: { on_ball_defense: 19, team_defense: 16, rebounding: 5, physical: 7 },
  junk_special: { on_ball_defense: 14, team_defense: 18, rebounding: 8, physical: 7 },
};

export const CLUSTER_LABELS: Record<ClusterType, { label: string; description: string }> = {
  shooting: { label: 'Shooting', description: '3PT, mid-range, catch & shoot' },
  finishing: { label: 'Finishing', description: 'At-rim scoring, floaters, layups' },
  playmaking: { label: 'Playmaking', description: 'Passing, vision, ball handling' },
  on_ball_defense: { label: 'OB Defense', description: 'Perimeter containment, steals' },
  team_defense: { label: 'Team Defense', description: 'Help defense, rim protection, rotations' },
  rebounding: { label: 'Rebounding', description: 'Offensive & defensive boards' },
  physical: { label: 'Physical', description: 'Size, length, strength, versatility' },
};

export const POSITION_LABELS: Record<Position, string> = {
  PG: 'Point Guard',
  CG: 'Combo Guard',
  W: 'Wing',
  F: 'Forward',
  B: 'Big',
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

// Default uses Motion / Read & React (offense) + Containment Man (defense) = 100
export const DEFAULT_CLUSTER_WEIGHTS: ClusterWeight[] = [
  // Offense (53)
  { cluster: 'shooting', weight: 17 },
  { cluster: 'finishing', weight: 16 },
  { cluster: 'playmaking', weight: 20 },
  // Defense (47)
  { cluster: 'on_ball_defense', weight: 18 },
  { cluster: 'team_defense', weight: 15 },
  { cluster: 'rebounding', weight: 8 },
  { cluster: 'physical', weight: 6 },
];

export const DEFAULT_POSITION_IMPORTANCE: PositionImportance[] = [
  { position: 'PG', weight: 20 },
  { position: 'CG', weight: 20 },
  { position: 'W', weight: 20 },
  { position: 'F', weight: 20 },
  { position: 'B', weight: 20 },
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
  scholarships: 3,
  scholarshipsUsed: 0,
  nilBudget: 0,
  nilUsed: 0,
  systemPreset: 'motion_offense',
  offensiveStyle: 'motion_read_react',
  heliocentricPosition: 'PG',
  defensiveStyle: 'containment_man',
  tempo: 65, // Moderate-fast
  clusterWeights: DEFAULT_CLUSTER_WEIGHTS,
  positionImportance: DEFAULT_POSITION_IMPORTANCE,
  biases: DEFAULT_BIASES,
};

// Heliocentric position options
export const HELIOCENTRIC_POSITIONS: { value: HeliocentricPosition; label: string }[] = [
  { value: 'PG', label: 'PG' },
  { value: 'CG', label: 'CG' },
  { value: 'W', label: 'W' },
  { value: 'F', label: 'F' },
  { value: 'B', label: 'B' },
];

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
      return '#FFFFFF';
    case 'high':
      return '#A1A1AA';
    case 'medium':
      return '#A1A1AA';
    case 'low':
      return '#52525B';
    default:
      return '#52525B';
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
