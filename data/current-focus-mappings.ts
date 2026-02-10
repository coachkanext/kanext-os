/**
 * Current Focus Mappings
 * Maps archetype gaps to coaching-friendly issue titles and descriptions.
 * Used to generate actionable coaching notes from System Demand Profile gaps.
 */

import type { Archetype, ImpactModifier } from './system-demand-profiles';

export interface FocusItem {
  title: string;
  description: string; // "Gap — consequence. Adjustment."
  triggeredBy: string; // What archetype/modifier triggered this
}

// Archetype gap → focus item (cause → consequence format)
export const ARCHETYPE_FOCUS_MAP: Record<Archetype, { title: string; description: string }> = {
  // Offensive Archetypes
  pick_and_roll_operator: {
    title: 'Primary Creator Gap',
    description: 'No lead handler → half-court offense stalls.',
  },
  vertical_spacer: {
    title: 'Rim Pressure Gap',
    description: 'No lob/roll threat → defense sags off screens.',
  },
  stretch_big: {
    title: 'Big Spacing Gap',
    description: 'No stretch-5 → paint stays packed on drives.',
  },
  spot_up_specialist: {
    title: 'Spacing Gap',
    description: 'Not enough shooters → help sits in the paint.',
  },
  three_and_d_wing: {
    title: '3-and-D Wing Gap',
    description: 'Missing two-way wings → rotations get thin.',
  },
  two_way_wing: {
    title: 'Wing Versatility Gap',
    description: 'Light on versatile wings → matchup flexibility suffers.',
  },
  connector_guard_wing: {
    title: 'Ball Movement Gap',
    description: 'No true connector → offense becomes predictable.',
  },
  secondary_creator_wing: {
    title: 'Shotmaking Gap',
    description: 'Only one shotmaker → set defenses can load up late clock.',
  },
  short_roll_playmaker_big: {
    title: 'Playmaking Big Gap',
    description: 'No short-roll passer → PNR becomes one-dimensional.',
  },
  off_ball_shooter: {
    title: 'Movement Shooting Gap',
    description: 'No shooters off curls → motion offense dies.',
  },
  small_ball_big: {
    title: 'Switch-5 Gap',
    description: 'No switchable big → guards hunt mismatches.',
  },
  slasher_rim_pressure_wing: {
    title: 'Rim Attack Gap',
    description: 'No slasher → defense packs the paint.',
  },
  dho_handoff_hub: {
    title: 'Handoff Hub Gap',
    description: 'No DHO threat → actions stagnate, entries get late.',
  },
  primary_ball_handler: {
    title: 'Ball Handler Gap',
    description: 'Light on handlers → pressure forces live-ball TOs.',
  },
  post_hub_facilitator_big: {
    title: 'Post Playmaker Gap',
    description: 'No high-post hub → offense has no trigger.',
  },
  post_scorer: {
    title: 'Post Scoring Gap',
    description: 'No back-to-basket threat → inside game is empty.',
  },
  rebounding_interior_enforcer: {
    title: 'Interior Presence Gap',
    description: 'No glass cleaner → second chances go to opponent.',
  },

  // Defensive Archetypes
  poa_defender_guard: {
    title: 'Perimeter Pressure Gap',
    description: 'No lockdown guard → ball gets wherever it wants.',
  },
  rim_protector_anchor: {
    title: 'Rim Protection Gap',
    description: 'No rim anchor → paint touches + fouls climb.',
  },
  switchable_defender_wing: {
    title: 'Switching Gap',
    description: 'Can\'t switch actions → PNR creates mismatches.',
  },
  energy_bench_spark: {
    title: 'Bench Energy Gap',
    description: 'No spark off bench → second unit bleeds leads.',
  },
};

// Impact modifier gap → focus item (cause → consequence format)
export const MODIFIER_FOCUS_MAP: Record<ImpactModifier, { title: string; description: string }> = {
  primary_engine: {
    title: 'Engine Gap',
    description: 'No alpha creator → hunting shots instead of creating them.',
  },
  secondary_engine: {
    title: 'Secondary Engine Gap',
    description: 'One-dimensional attack → sets stall without bailout.',
  },
  force_multiplier: {
    title: 'Efficiency Gap',
    description: 'Missing high-efficiency roles → stars get loaded up.',
  },
  specialist_anchor: {
    title: 'Anchor Gap',
    description: 'No elite specialist → nothing to build around.',
  },
};

/**
 * Generate a FocusItem from an archetype gap
 */
export function getArchetypeFocusItem(
  archetype: Archetype,
  tier: 'A' | 'B' | 'C',
  status: 'Critical' | 'Need'
): FocusItem {
  const mapping = ARCHETYPE_FOCUS_MAP[archetype];
  return {
    title: mapping?.title ?? archetype,
    description: mapping?.description ?? 'Gap identified in current system requirements.',
    triggeredBy: `Missing ${tier}-tier ${archetype.replace(/_/g, ' ')} coverage for selected system.`,
  };
}

/**
 * Generate a FocusItem from a modifier gap
 */
export function getModifierFocusItem(
  modifier: ImpactModifier,
  status: 'Critical' | 'Need'
): FocusItem {
  const mapping = MODIFIER_FOCUS_MAP[modifier];
  return {
    title: mapping?.title ?? modifier,
    description: mapping?.description ?? 'Gap identified in current system requirements.',
    triggeredBy: `Missing ${modifier.replace(/_/g, ' ')} for selected system.`,
  };
}
