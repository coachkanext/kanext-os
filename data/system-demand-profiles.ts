/**
 * System Demand Profiles
 * Authoritative mapping from System Demand Profiles.pdf
 *
 * Defines archetype requirements (A/B/C tiers) and impact modifier needs
 * for each offensive and defensive system.
 */

import type { OffensiveStyle, DefensiveStyle } from '@/types';

// =============================================================================
// ARCHETYPES
// =============================================================================

export type OffensiveArchetype =
  | 'pick_and_roll_operator'
  | 'vertical_spacer'
  | 'stretch_big'
  | 'spot_up_specialist'
  | 'three_and_d_wing'
  | 'two_way_wing'
  | 'connector_guard_wing'
  | 'secondary_creator_wing'
  | 'short_roll_playmaker_big'
  | 'off_ball_shooter'
  | 'small_ball_big'
  | 'slasher_rim_pressure_wing'
  | 'dho_handoff_hub'
  | 'primary_ball_handler'
  | 'post_hub_facilitator_big'
  | 'post_scorer'
  | 'rebounding_interior_enforcer';

export type DefensiveArchetype =
  | 'poa_defender_guard'
  | 'rim_protector_anchor'
  | 'switchable_defender_wing'
  | 'two_way_wing'
  | 'rebounding_interior_enforcer'
  | 'small_ball_big'
  | 'three_and_d_wing'
  | 'energy_bench_spark';

export type Archetype = OffensiveArchetype | DefensiveArchetype;

export type ImpactModifier =
  | 'primary_engine'
  | 'secondary_engine'
  | 'force_multiplier'
  | 'specialist_anchor';

export type RequirementTier = 'A' | 'B' | 'C';

// =============================================================================
// LABELS
// =============================================================================

export const ARCHETYPE_LABELS: Record<Archetype, string> = {
  // Offensive
  pick_and_roll_operator: 'Pick-and-Roll Operator',
  vertical_spacer: 'Vertical Spacer (Rim Runner)',
  stretch_big: 'Stretch Big (Pick-and-Pop)',
  spot_up_specialist: 'Spot-Up Specialist',
  three_and_d_wing: '3-and-D Wing',
  two_way_wing: 'Two-Way Wing',
  connector_guard_wing: 'Connector Guard / Wing',
  secondary_creator_wing: 'Secondary Creator Wing',
  short_roll_playmaker_big: 'Short-Roll Playmaker Big',
  off_ball_shooter: 'Off-Ball Shooter (Movement)',
  small_ball_big: 'Small-Ball Big (Switch 5)',
  slasher_rim_pressure_wing: 'Slasher / Rim Pressure Wing',
  dho_handoff_hub: 'DHO / Handoff Hub',
  primary_ball_handler: 'Primary Ball-Handler (Offense-First)',
  post_hub_facilitator_big: 'Post Hub / Facilitator Big',
  post_scorer: 'Post Scorer (Back-to-Basket)',
  rebounding_interior_enforcer: 'Rebounding / Interior Enforcer',
  // Defensive
  poa_defender_guard: 'POA Defender Guard',
  rim_protector_anchor: 'Rim Protector Anchor',
  switchable_defender_wing: 'Switchable Defender Wing',
  energy_bench_spark: 'Energy Bench Spark',
};

export const MODIFIER_LABELS: Record<ImpactModifier, string> = {
  primary_engine: 'Primary Engine',
  secondary_engine: 'Secondary Engine',
  force_multiplier: 'Force Multiplier',
  specialist_anchor: 'Specialist Anchor',
};

// =============================================================================
// REQUIREMENT TYPES
// =============================================================================

export interface ArchetypeRequirement {
  archetype: Archetype;
  tier: RequirementTier;
  count?: number; // e.g., "2+" for Spot-Up Specialist
}

export interface ModifierRequirement {
  modifier: ImpactModifier;
  count?: number; // e.g., "2+ guys" for Force Multiplier
  optional?: boolean;
}

export interface SystemDemandProfile {
  archetypes: ArchetypeRequirement[];
  modifiers: ModifierRequirement[];
  criticalMissingRisk: string;
}

// =============================================================================
// OFFENSIVE SYSTEM PROFILES
// =============================================================================

export const OFFENSIVE_SYSTEM_PROFILES: Record<OffensiveStyle, SystemDemandProfile> = {
  spread_pick_and_roll: {
    archetypes: [
      { archetype: 'pick_and_roll_operator', tier: 'A' },
      { archetype: 'vertical_spacer', tier: 'A' },
      { archetype: 'stretch_big', tier: 'A' },
      { archetype: 'spot_up_specialist', tier: 'A' },
      { archetype: 'three_and_d_wing', tier: 'B' },
      { archetype: 'two_way_wing', tier: 'B' },
      { archetype: 'connector_guard_wing', tier: 'B' },
      { archetype: 'secondary_creator_wing', tier: 'C' },
      { archetype: 'short_roll_playmaker_big', tier: 'C' },
    ],
    modifiers: [
      { modifier: 'primary_engine', count: 1 },
      { modifier: 'force_multiplier', count: 1 },
      { modifier: 'specialist_anchor', count: 1, optional: true },
    ],
    criticalMissingRisk: 'No Primary Engine handler, or no roll/pop gravity big → offense collapses into low-quality pull-ups.',
  },

  five_out_motion: {
    archetypes: [
      { archetype: 'connector_guard_wing', tier: 'A' },
      { archetype: 'off_ball_shooter', tier: 'A' },
      { archetype: 'stretch_big', tier: 'A' },
      { archetype: 'slasher_rim_pressure_wing', tier: 'A' },
      { archetype: 'two_way_wing', tier: 'B' },
      { archetype: 'spot_up_specialist', tier: 'B' },
      { archetype: 'secondary_creator_wing', tier: 'C' },
      { archetype: 'dho_handoff_hub', tier: 'C' },
    ],
    modifiers: [
      { modifier: 'force_multiplier', count: 2 },
      { modifier: 'secondary_engine', count: 1 },
    ],
    criticalMissingRisk: 'No connector + no movement shooter → motion becomes empty passing with no bend.',
  },

  motion_read_react: {
    archetypes: [
      { archetype: 'connector_guard_wing', tier: 'A' },
      { archetype: 'off_ball_shooter', tier: 'A' },
      { archetype: 'slasher_rim_pressure_wing', tier: 'A' },
      { archetype: 'dho_handoff_hub', tier: 'A' },
      { archetype: 'two_way_wing', tier: 'B' },
      { archetype: 'secondary_creator_wing', tier: 'B' },
      { archetype: 'short_roll_playmaker_big', tier: 'B' },
      { archetype: 'spot_up_specialist', tier: 'C' },
      { archetype: 'stretch_big', tier: 'C' },
    ],
    modifiers: [
      { modifier: 'force_multiplier', count: 1 },
      { modifier: 'secondary_engine', count: 1 },
    ],
    criticalMissingRisk: 'Lack of decision-speed connector(s) → turnovers, stalled flow, no advantage chain.',
  },

  pace_and_space: {
    archetypes: [
      { archetype: 'primary_ball_handler', tier: 'A' },
      { archetype: 'vertical_spacer', tier: 'A' },
      { archetype: 'spot_up_specialist', tier: 'A' },
      { archetype: 'slasher_rim_pressure_wing', tier: 'B' },
      { archetype: 'three_and_d_wing', tier: 'B' },
      { archetype: 'connector_guard_wing', tier: 'B' },
      { archetype: 'stretch_big', tier: 'C' },
      { archetype: 'secondary_creator_wing', tier: 'C' },
    ],
    modifiers: [
      { modifier: 'primary_engine', count: 1 },
      { modifier: 'force_multiplier', count: 1 },
    ],
    criticalMissingRisk: 'No rim pressure (slasher or rim runner) → you get "air spacing" with no paint collapse.',
  },

  dribble_drive: {
    archetypes: [
      { archetype: 'slasher_rim_pressure_wing', tier: 'A' },
      { archetype: 'primary_ball_handler', tier: 'A' },
      { archetype: 'spot_up_specialist', tier: 'A', count: 2 },
      { archetype: 'secondary_creator_wing', tier: 'B' },
      { archetype: 'vertical_spacer', tier: 'B' },
      { archetype: 'two_way_wing', tier: 'B' },
      { archetype: 'stretch_big', tier: 'C' },
      { archetype: 'connector_guard_wing', tier: 'C' },
    ],
    modifiers: [
      { modifier: 'primary_engine', count: 1 },
      { modifier: 'force_multiplier', count: 1 },
    ],
    criticalMissingRisk: 'No high-end slasher + no spacing → drive lanes die, turnovers spike.',
  },

  princeton: {
    archetypes: [
      { archetype: 'post_hub_facilitator_big', tier: 'A' },
      { archetype: 'connector_guard_wing', tier: 'A' },
      { archetype: 'off_ball_shooter', tier: 'A' },
      { archetype: 'two_way_wing', tier: 'B' },
      { archetype: 'slasher_rim_pressure_wing', tier: 'B' },
      { archetype: 'spot_up_specialist', tier: 'C' },
      { archetype: 'secondary_creator_wing', tier: 'C' },
    ],
    modifiers: [
      { modifier: 'force_multiplier', count: 1 },
      { modifier: 'secondary_engine', count: 1, optional: true },
    ],
    criticalMissingRisk: 'No true post hub → you\'re just "passing around the perimeter" with no trigger.',
  },

  flex: {
    archetypes: [
      { archetype: 'post_scorer', tier: 'A' },
      { archetype: 'off_ball_shooter', tier: 'A' },
      { archetype: 'spot_up_specialist', tier: 'A' },
      { archetype: 'two_way_wing', tier: 'B' },
      { archetype: 'connector_guard_wing', tier: 'B' },
      { archetype: 'slasher_rim_pressure_wing', tier: 'C' },
    ],
    modifiers: [
      { modifier: 'specialist_anchor', count: 1 },
      { modifier: 'force_multiplier', count: 1, optional: true },
    ],
    criticalMissingRisk: 'If the post isn\'t a real threat or hub, flex actions don\'t punish and become predictable.',
  },

  swing: {
    archetypes: [
      { archetype: 'connector_guard_wing', tier: 'A' },
      { archetype: 'spot_up_specialist', tier: 'A', count: 2 },
      { archetype: 'secondary_creator_wing', tier: 'A' },
      { archetype: 'two_way_wing', tier: 'B' },
      { archetype: 'stretch_big', tier: 'B' },
      { archetype: 'slasher_rim_pressure_wing', tier: 'C' },
      { archetype: 'dho_handoff_hub', tier: 'C' },
    ],
    modifiers: [
      { modifier: 'force_multiplier', count: 1 },
      { modifier: 'secondary_engine', count: 1 },
    ],
    criticalMissingRisk: 'No secondary creator → you reverse forever but can\'t break set defenses.',
  },

  post_centric: {
    archetypes: [
      { archetype: 'post_scorer', tier: 'A' },
      { archetype: 'spot_up_specialist', tier: 'A', count: 2 },
      { archetype: 'three_and_d_wing', tier: 'A' },
      { archetype: 'slasher_rim_pressure_wing', tier: 'B' },
      { archetype: 'rebounding_interior_enforcer', tier: 'B' },
      { archetype: 'stretch_big', tier: 'C' },
      { archetype: 'secondary_creator_wing', tier: 'C' },
    ],
    modifiers: [
      { modifier: 'specialist_anchor', count: 1 },
      { modifier: 'force_multiplier', count: 1 },
    ],
    criticalMissingRisk: 'No shooting around post → doubles win, post touches become turnovers.',
  },

  moreyball: {
    archetypes: [
      { archetype: 'pick_and_roll_operator', tier: 'A' },
      { archetype: 'vertical_spacer', tier: 'A' },
      { archetype: 'spot_up_specialist', tier: 'A', count: 2 },
      { archetype: 'three_and_d_wing', tier: 'A' },
      { archetype: 'stretch_big', tier: 'B' },
      { archetype: 'slasher_rim_pressure_wing', tier: 'B' },
      { archetype: 'secondary_creator_wing', tier: 'C' },
    ],
    modifiers: [
      { modifier: 'primary_engine', count: 1 },
      { modifier: 'force_multiplier', count: 1 },
    ],
    criticalMissingRisk: 'If you can\'t generate rim/3 volume (via engine + spacing) the math advantage disappears.',
  },

  heliocentric: {
    archetypes: [
      { archetype: 'primary_ball_handler', tier: 'A' },
      { archetype: 'spot_up_specialist', tier: 'A', count: 2 },
      { archetype: 'three_and_d_wing', tier: 'A' },
      { archetype: 'vertical_spacer', tier: 'B' },
      { archetype: 'secondary_creator_wing', tier: 'B' },
      { archetype: 'connector_guard_wing', tier: 'C' },
    ],
    modifiers: [
      { modifier: 'primary_engine', count: 1 },
      { modifier: 'force_multiplier', count: 2 },
    ],
    criticalMissingRisk: 'No true Primary Engine = system can\'t exist; also if spacers aren\'t real, the star gets swarmed.',
  },
};

// =============================================================================
// DEFENSIVE SYSTEM PROFILES
// =============================================================================

export const DEFENSIVE_SYSTEM_PROFILES: Record<DefensiveStyle, SystemDemandProfile> = {
  containment_man: {
    archetypes: [
      { archetype: 'poa_defender_guard', tier: 'A' },
      { archetype: 'rim_protector_anchor', tier: 'A' },
      { archetype: 'switchable_defender_wing', tier: 'A' },
      { archetype: 'two_way_wing', tier: 'B' },
      { archetype: 'rebounding_interior_enforcer', tier: 'B' },
      { archetype: 'small_ball_big', tier: 'C' },
    ],
    modifiers: [
      { modifier: 'specialist_anchor', count: 1 },
      { modifier: 'force_multiplier', count: 1 },
    ],
    criticalMissingRisk: 'No rim protector anchor → blow-bys become layup lines.',
  },

  pack_line: {
    archetypes: [
      { archetype: 'rim_protector_anchor', tier: 'A' },
      { archetype: 'rebounding_interior_enforcer', tier: 'A' },
      { archetype: 'two_way_wing', tier: 'A' },
      { archetype: 'poa_defender_guard', tier: 'B' },
      { archetype: 'three_and_d_wing', tier: 'B' },
      { archetype: 'switchable_defender_wing', tier: 'C' },
    ],
    modifiers: [
      { modifier: 'specialist_anchor', count: 1 },
      { modifier: 'force_multiplier', count: 1 },
    ],
    criticalMissingRisk: 'If your anchor can\'t protect without fouling → pack line collapses.',
  },

  pressure_man: {
    archetypes: [
      { archetype: 'poa_defender_guard', tier: 'A' },
      { archetype: 'switchable_defender_wing', tier: 'A' },
      { archetype: 'energy_bench_spark', tier: 'A' },
      { archetype: 'two_way_wing', tier: 'B' },
      { archetype: 'rim_protector_anchor', tier: 'B' },
      { archetype: 'small_ball_big', tier: 'C' },
    ],
    modifiers: [
      { modifier: 'force_multiplier', count: 1 },
      { modifier: 'specialist_anchor', count: 1 },
    ],
    criticalMissingRisk: 'Pressure with no backline eraser = free rim.',
  },

  switch_everything: {
    archetypes: [
      { archetype: 'switchable_defender_wing', tier: 'A', count: 2 },
      { archetype: 'small_ball_big', tier: 'A' },
      { archetype: 'poa_defender_guard', tier: 'A' },
      { archetype: 'two_way_wing', tier: 'B' },
      { archetype: 'rim_protector_anchor', tier: 'C' },
    ],
    modifiers: [
      { modifier: 'force_multiplier', count: 1 },
      { modifier: 'specialist_anchor', count: 1 },
    ],
    criticalMissingRisk: 'If your 4/5 can\'t survive switches, the whole identity breaks.',
  },

  ice_no_middle: {
    archetypes: [
      { archetype: 'poa_defender_guard', tier: 'A' },
      { archetype: 'rim_protector_anchor', tier: 'A' },
      { archetype: 'two_way_wing', tier: 'A' },
      { archetype: 'three_and_d_wing', tier: 'B' },
      { archetype: 'rebounding_interior_enforcer', tier: 'B' },
      { archetype: 'switchable_defender_wing', tier: 'C' },
    ],
    modifiers: [
      { modifier: 'specialist_anchor', count: 1 },
      { modifier: 'force_multiplier', count: 1 },
    ],
    criticalMissingRisk: 'If POA can\'t angle + contain, the scheme gets split repeatedly.',
  },

  zone_structured: {
    archetypes: [
      { archetype: 'rim_protector_anchor', tier: 'A' },
      { archetype: 'rebounding_interior_enforcer', tier: 'A' },
      { archetype: 'two_way_wing', tier: 'A' },
      { archetype: 'three_and_d_wing', tier: 'B' },
      { archetype: 'poa_defender_guard', tier: 'B' },
      { archetype: 'energy_bench_spark', tier: 'C' },
    ],
    modifiers: [
      { modifier: 'specialist_anchor', count: 1 },
      { modifier: 'force_multiplier', count: 1 },
    ],
    criticalMissingRisk: 'Zone without rebounding dominance = you lose by extra possessions.',
  },

  matchup_zone: {
    archetypes: [
      { archetype: 'switchable_defender_wing', tier: 'A' },
      { archetype: 'two_way_wing', tier: 'A' },
      { archetype: 'rim_protector_anchor', tier: 'A' },
      { archetype: 'poa_defender_guard', tier: 'B' },
      { archetype: 'energy_bench_spark', tier: 'B' },
      { archetype: 'small_ball_big', tier: 'C' },
    ],
    modifiers: [
      { modifier: 'force_multiplier', count: 1 },
      { modifier: 'specialist_anchor', count: 1 },
    ],
    criticalMissingRisk: 'If wings can\'t guard in space, hybrid turns into scramble.',
  },

  press: {
    archetypes: [
      { archetype: 'energy_bench_spark', tier: 'A' },
      { archetype: 'poa_defender_guard', tier: 'A' },
      { archetype: 'switchable_defender_wing', tier: 'A' },
      { archetype: 'rim_protector_anchor', tier: 'B' },
      { archetype: 'two_way_wing', tier: 'B' },
      { archetype: 'rebounding_interior_enforcer', tier: 'C' },
    ],
    modifiers: [
      { modifier: 'force_multiplier', count: 1 },
      { modifier: 'specialist_anchor', count: 1 },
    ],
    criticalMissingRisk: 'No rim protection behind press → it\'s a layup drill.',
  },

  junk_special: {
    archetypes: [
      { archetype: 'poa_defender_guard', tier: 'A' },
      { archetype: 'switchable_defender_wing', tier: 'A' },
      { archetype: 'rim_protector_anchor', tier: 'A' },
      { archetype: 'two_way_wing', tier: 'B' },
      { archetype: 'three_and_d_wing', tier: 'B' },
      { archetype: 'energy_bench_spark', tier: 'C' },
    ],
    modifiers: [
      { modifier: 'specialist_anchor', count: 1 },
      { modifier: 'force_multiplier', count: 1 },
    ],
    criticalMissingRisk: 'If you don\'t have a true matchup stopper, junk doesn\'t "steal possessions."',
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getArchetypeLabel(archetype: Archetype): string {
  return ARCHETYPE_LABELS[archetype] ?? archetype;
}

export function getModifierLabel(modifier: ImpactModifier): string {
  return MODIFIER_LABELS[modifier] ?? modifier;
}

export function getTierPriority(tier: RequirementTier): number {
  switch (tier) {
    case 'A': return 0;
    case 'B': return 1;
    case 'C': return 2;
    default: return 3;
  }
}
