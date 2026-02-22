/**
 * KR Display Utilities — Level-Aware Tier Labels, Color Bands, Badge Display
 *
 * KR is universal (0-100) but tier LABELS shift per competitive level.
 * Color bands are universal (same for all levels).
 * Badge rules from spec: Bronze ≥90, Silver ≥94, Gold ≥97.
 */

// =============================================================================
// KR COLOR BANDS (Universal — same for all levels)
// =============================================================================

export interface KRColorBand {
  min: number;
  max: number;
  color: string;
  label: string;
}

export const KR_COLOR_BANDS: KRColorBand[] = [
  { min: 97, max: 100, color: '#1D9BF0', label: 'Elite/Transcendent' },
  { min: 94, max: 96,  color: '#A1A1AA', label: 'Franchise Anchor' },
  { min: 90, max: 93,  color: '#1D9BF0', label: 'High-Impact' },
  { min: 86, max: 89,  color: '#1D9BF0', label: 'Solid Starter' },
  { min: 82, max: 85,  color: '#1D9BF0', label: 'Trusted Rotation' },
  { min: 78, max: 81,  color: '#22C55E', label: 'Reliable Bench' },
  { min: 74, max: 77,  color: '#F59E0B', label: 'Situational' },
  { min: 70, max: 73,  color: '#F59E0B', label: 'Limited' },
  { min: 66, max: 69,  color: '#EF4444', label: 'Fringe/Project' },
  { min: 0,  max: 65,  color: '#A1A1AA', label: 'Below Viability' },
];

/** Get KR color for a given score */
export function getKRColor(kr: number | null | undefined): string {
  if (kr == null) return '#A1A1AA';
  for (const band of KR_COLOR_BANDS) {
    if (kr >= band.min) return band.color;
  }
  return '#A1A1AA';
}

/** Get KR color band label (universal) */
export function getKRBandLabel(kr: number | null | undefined): string {
  if (kr == null) return 'Unrated';
  for (const band of KR_COLOR_BANDS) {
    if (kr >= band.min) return band.label;
  }
  return 'Below Viability';
}

// =============================================================================
// LEVEL-AWARE KR TIER LABELS (from College Player KR Legend)
// =============================================================================

/** Tier definition: KR range + label for a specific competitive level */
export interface KRTier {
  min: number;
  max: number;
  label: string;
}

/**
 * Full KR Legend per competitive level.
 * Tiers are ordered highest-first for matching.
 * From canonical spec: College Player KR Legend.
 */
export const KR_LEGEND: Record<string, KRTier[]> = {
  // NCAA D1 High Major
  ncaa_d1_high_major: [
    { min: 98, max: 100, label: 'NPOY / Transcendent' },
    { min: 95, max: 97,  label: 'First Team All-American' },
    { min: 92, max: 94,  label: 'All-Conference First Team' },
    { min: 88, max: 91,  label: 'Projected Starter' },
    { min: 84, max: 87,  label: 'Rotation Player' },
    { min: 80, max: 83,  label: 'Situational Specialist' },
    { min: 76, max: 79,  label: 'Practice Player / Redshirt' },
    { min: 70, max: 75,  label: 'Roster Depth' },
    { min: 0,  max: 69,  label: 'Below Level' },
  ],

  // NCAA D1 Mid Major
  ncaa_d1_mid_major: [
    { min: 95, max: 100, label: 'MM POY / Transcendent' },
    { min: 92, max: 94,  label: 'All-Conference First Team' },
    { min: 88, max: 91,  label: 'Franchise Anchor' },
    { min: 84, max: 87,  label: 'Projected Starter' },
    { min: 80, max: 83,  label: 'Key Rotation' },
    { min: 76, max: 79,  label: 'Situational Specialist' },
    { min: 72, max: 75,  label: 'Practice Player' },
    { min: 66, max: 71,  label: 'Roster Depth' },
    { min: 0,  max: 65,  label: 'Below Level' },
  ],

  // NCAA D1 Low Major
  ncaa_d1_low_major: [
    { min: 92, max: 100, label: 'LM POY / Dominant' },
    { min: 88, max: 91,  label: 'All-Conference' },
    { min: 84, max: 87,  label: 'Franchise Anchor' },
    { min: 80, max: 83,  label: 'Projected Starter' },
    { min: 76, max: 79,  label: 'Key Rotation' },
    { min: 72, max: 75,  label: 'Situational' },
    { min: 68, max: 71,  label: 'Practice Player' },
    { min: 0,  max: 67,  label: 'Below Level' },
  ],

  // NCAA D2
  ncaa_d2: [
    { min: 90, max: 100, label: 'D2 POY / Dominant National' },
    { min: 86, max: 89,  label: 'All-Region' },
    { min: 82, max: 85,  label: 'Franchise Anchor' },
    { min: 78, max: 81,  label: 'Projected Starter' },
    { min: 74, max: 77,  label: 'Key Rotation' },
    { min: 70, max: 73,  label: 'Situational' },
    { min: 66, max: 69,  label: 'Roster Depth' },
    { min: 0,  max: 65,  label: 'Below Level' },
  ],

  // NCAA D3
  ncaa_d3: [
    { min: 80, max: 100, label: 'D3 POY / Elite' },
    { min: 76, max: 79,  label: 'All-Region' },
    { min: 72, max: 75,  label: 'Franchise Anchor' },
    { min: 68, max: 71,  label: 'Projected Starter' },
    { min: 64, max: 67,  label: 'Key Rotation' },
    { min: 60, max: 63,  label: 'Situational' },
    { min: 0,  max: 59,  label: 'Below Level' },
  ],

  // NAIA
  naia: [
    { min: 86, max: 100, label: 'NAIA POY / Elite' },
    { min: 82, max: 85,  label: 'All-Conference First Team' },
    { min: 78, max: 81,  label: 'Franchise Anchor' },
    { min: 74, max: 77,  label: 'Projected Starter' },
    { min: 70, max: 73,  label: 'Key Rotation' },
    { min: 66, max: 69,  label: 'Situational' },
    { min: 62, max: 65,  label: 'Roster Depth' },
    { min: 0,  max: 61,  label: 'Below Level' },
  ],

  // NJCAA D1
  njcaa_d1: [
    { min: 88, max: 100, label: 'JUCO D1 POY / Elite' },
    { min: 84, max: 87,  label: 'All-Region' },
    { min: 80, max: 83,  label: 'Franchise Anchor' },
    { min: 76, max: 79,  label: 'Projected Starter' },
    { min: 72, max: 75,  label: 'Key Rotation' },
    { min: 68, max: 71,  label: 'Situational' },
    { min: 64, max: 67,  label: 'Roster Depth' },
    { min: 0,  max: 63,  label: 'Below Level' },
  ],

  // NJCAA D2
  njcaa_d2: [
    { min: 84, max: 100, label: 'JUCO D2 POY / Elite' },
    { min: 80, max: 83,  label: 'All-Region' },
    { min: 76, max: 79,  label: 'Franchise Anchor' },
    { min: 72, max: 75,  label: 'Projected Starter' },
    { min: 68, max: 71,  label: 'Key Rotation' },
    { min: 64, max: 67,  label: 'Situational' },
    { min: 0,  max: 63,  label: 'Below Level' },
  ],

  // NJCAA D3
  njcaa_d3: [
    { min: 80, max: 100, label: 'JUCO D3 POY / Elite' },
    { min: 76, max: 79,  label: 'All-Region' },
    { min: 72, max: 75,  label: 'Franchise Anchor' },
    { min: 68, max: 71,  label: 'Projected Starter' },
    { min: 64, max: 67,  label: 'Key Rotation' },
    { min: 60, max: 63,  label: 'Situational' },
    { min: 0,  max: 59,  label: 'Below Level' },
  ],

  // CCCAA
  cccaa: [
    { min: 82, max: 100, label: 'CCCAA POY / Elite' },
    { min: 78, max: 81,  label: 'All-Conference' },
    { min: 74, max: 77,  label: 'Franchise Anchor' },
    { min: 70, max: 73,  label: 'Projected Starter' },
    { min: 66, max: 69,  label: 'Key Rotation' },
    { min: 62, max: 65,  label: 'Situational' },
    { min: 0,  max: 61,  label: 'Below Level' },
  ],

  // USCAA
  uscaa: [
    { min: 78, max: 100, label: 'USCAA POY / Elite' },
    { min: 74, max: 77,  label: 'All-Conference' },
    { min: 70, max: 73,  label: 'Franchise Anchor' },
    { min: 66, max: 69,  label: 'Projected Starter' },
    { min: 62, max: 65,  label: 'Key Rotation' },
    { min: 0,  max: 61,  label: 'Below Level' },
  ],

  // NCCAA D1
  nccaa_d1: [
    { min: 76, max: 100, label: 'NCCAA POY / Elite' },
    { min: 72, max: 75,  label: 'All-Conference' },
    { min: 68, max: 71,  label: 'Franchise Anchor' },
    { min: 64, max: 67,  label: 'Projected Starter' },
    { min: 60, max: 63,  label: 'Key Rotation' },
    { min: 0,  max: 59,  label: 'Below Level' },
  ],

  // NCCAA D2
  nccaa_d2: [
    { min: 72, max: 100, label: 'NCCAA D2 POY / Elite' },
    { min: 68, max: 71,  label: 'All-Conference' },
    { min: 64, max: 67,  label: 'Franchise Anchor' },
    { min: 60, max: 63,  label: 'Projected Starter' },
    { min: 56, max: 59,  label: 'Key Rotation' },
    { min: 0,  max: 55,  label: 'Below Level' },
  ],
};

/** Get level-aware KR tier label */
export function getKRTierLabel(kr: number | null | undefined, levelKey: string): string {
  if (kr == null) return 'Unrated';
  const tiers = KR_LEGEND[levelKey];
  if (!tiers) {
    // Fallback to NAIA if level not found
    const fallback = KR_LEGEND.naia;
    if (fallback) {
      for (const tier of fallback) {
        if (kr >= tier.min) return tier.label;
      }
    }
    return getKRBandLabel(kr);
  }
  for (const tier of tiers) {
    if (kr >= tier.min) return tier.label;
  }
  return 'Below Level';
}

// =============================================================================
// ARCHETYPE DISPLAY
// =============================================================================

/** Map archetype DB keys to display names */
export const ARCHETYPE_DISPLAY: Record<string, string> = {
  // Guards
  floor_general: 'Floor General',
  primary_ball_handler: 'Primary Ball Handler',
  pick_and_roll_operator: 'PnR Operator',
  dho_handoff_hub: 'DHO Hub',
  combo_scorer: 'Combo Scorer',
  three_level_scorer: '3-Level Scorer',

  // Wings
  two_way_wing: 'Two-Way Wing',
  slasher_wing: 'Slasher Wing',
  three_and_d_wing: '3-and-D Wing',
  switchable_defender_wing: 'Switchable Defender',
  spot_up_specialist: 'Spot-Up Specialist',
  secondary_creator_wing: 'Secondary Creator',
  connector_guard_wing: 'Connector',
  off_ball_shooter: 'Off-Ball Shooter',
  slasher_rim_pressure_wing: 'Rim Pressure Wing',

  // Bigs
  rim_protector: 'Rim Protector',
  rim_protector_anchor: 'Rim Protector Anchor',
  stretch_big: 'Stretch Big',
  post_hub_facilitator_big: 'Post Facilitator',
  rebounding_interior_enforcer: 'Rebounding Enforcer',
  small_ball_big: 'Small-Ball Big',
  vertical_spacer: 'Vertical Spacer',

  // Legacy names from engine
  'Two-Way Wing': 'Two-Way Wing',
  'Slasher Wing': 'Slasher Wing',
  'Floor General': 'Floor General',
  'Rim Protector': 'Rim Protector',
  'Stretch Big': 'Stretch Big',
  '3-Level Scorer': '3-Level Scorer',
  'Combo Scorer': 'Combo Scorer',
  'Spot-Up Specialist': 'Spot-Up Specialist',
};

/** Get displayable archetype name */
export function getArchetypeDisplay(archetype: string | null | undefined): string {
  if (!archetype) return 'Unknown';
  return ARCHETYPE_DISPLAY[archetype] ?? archetype.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// =============================================================================
// BADGE DISPLAY HELPERS
// =============================================================================

export type BadgeLevel = 'Bronze' | 'Silver' | 'Gold';

export const BADGE_COLORS: Record<BadgeLevel, string> = {
  Bronze: '#1D9BF0',
  Silver: '#A1A1AA',
  Gold: '#1D9BF0',
};

export const BADGE_BG_COLORS: Record<BadgeLevel, string> = {
  Bronze: '#1D9BF020',
  Silver: '#A1A1AA20',
  Gold: '#1D9BF020',
};

/** Badge thresholds — College mode */
export const BADGE_THRESHOLDS_COLLEGE = {
  Bronze: { trait: 90, component: 90, effect: 3 },
  Silver: { trait: 94, component: 94, effect: 6 },
  Gold: { trait: 97, component: 97, effect: 10 },
};

/** Badge caps — College mode */
export const BADGE_CAPS_COLLEGE = {
  maxGold: 1,
  maxSilver: 3,
  perComponentCap: 12,
  overallKRCap: 3.5,
};

// =============================================================================
// CLUSTER DISPLAY
// =============================================================================

export const CLUSTER_LABELS: Record<string, { label: string; icon: string }> = {
  shooting: { label: 'Shooting', icon: 'scope' },
  finishing: { label: 'Finishing', icon: 'flame' },
  playmaking: { label: 'Playmaking', icon: 'arrow.triangle.branch' },
  perimeter_defense: { label: 'Perimeter D', icon: 'shield.lefthalf.filled' },
  interior_defense: { label: 'Interior D', icon: 'shield.righthalf.filled' },
  rebounding: { label: 'Rebounding', icon: 'arrow.up.arrow.down' },
  frame: { label: 'Physical', icon: 'figure.strengthtraining.traditional' },
};

export const CLUSTER_ORDER = [
  'shooting', 'finishing', 'playmaking',
  'perimeter_defense', 'interior_defense', 'rebounding', 'frame',
] as const;

// =============================================================================
// KR PERCENTILE HELPERS
// =============================================================================

/** Compute approximate percentile rank from KR and level */
export function getKRPercentileLabel(kr: number, levelKey: string, totalAtLevel?: number): string {
  // Rough percentile mapping based on bell curve centered ~50 for college levels
  // Higher KR = rarer (top %)
  if (kr >= 90) return 'Top 1%';
  if (kr >= 85) return 'Top 3%';
  if (kr >= 80) return 'Top 5%';
  if (kr >= 75) return 'Top 10%';
  if (kr >= 70) return 'Top 15%';
  if (kr >= 65) return 'Top 25%';
  if (kr >= 60) return 'Top 35%';
  if (kr >= 55) return 'Top 45%';
  if (kr >= 50) return 'Top 50%';
  return 'Below 50%';
}

// =============================================================================
// LEVEL DISPLAY HELPERS
// =============================================================================

export const LEVEL_DISPLAY_SHORT: Record<string, string> = {
  ncaa_d1_high_major: 'D1 HM',
  ncaa_d1_mid_major: 'D1 MM',
  ncaa_d1_low_major: 'D1 LM',
  ncaa_d2: 'NCAA D2',
  ncaa_d3: 'NCAA D3',
  naia: 'NAIA',
  njcaa_d1: 'JUCO D1',
  njcaa_d2: 'JUCO D2',
  njcaa_d3: 'JUCO D3',
  cccaa: 'CCCAA',
  uscaa: 'USCAA',
  nccaa_d1: 'NCCAA D1',
  nccaa_d2: 'NCCAA D2',
};

export const LEVEL_DISPLAY_FULL: Record<string, string> = {
  ncaa_d1_high_major: 'NCAA D1 High Major',
  ncaa_d1_mid_major: 'NCAA D1 Mid Major',
  ncaa_d1_low_major: 'NCAA D1 Low Major',
  ncaa_d2: 'NCAA Division II',
  ncaa_d3: 'NCAA Division III',
  naia: 'NAIA',
  njcaa_d1: 'NJCAA Division I',
  njcaa_d2: 'NJCAA Division II',
  njcaa_d3: 'NJCAA Division III',
  cccaa: 'CCCAA',
  uscaa: 'USCAA',
  nccaa_d1: 'NCCAA Division I',
  nccaa_d2: 'NCCAA Division II',
};

/** All level keys for filter dropdowns */
export const ALL_LEVEL_KEYS = [
  'ncaa_d1_high_major', 'ncaa_d1_mid_major', 'ncaa_d1_low_major',
  'ncaa_d2', 'ncaa_d3', 'naia',
  'njcaa_d1', 'njcaa_d2', 'njcaa_d3',
  'cccaa', 'uscaa', 'nccaa_d1', 'nccaa_d2',
];
