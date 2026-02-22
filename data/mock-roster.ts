/**
 * Mock Roster Data
 * Players with archetype tags and impact modifiers for Team Needs computation.
 */

import type { Position } from '@/types';
import type { Archetype, ImpactModifier } from './system-demand-profiles';

export interface RosterPlayer {
  id: string;
  name: string;
  number: string;
  position: Position;
  primaryArchetype: Archetype | null;
  secondaryArchetype: Archetype | null;
  impactModifier: ImpactModifier | null;
}

// Roster - 10 players matching Firebase canonical data
export const MOCK_ROSTER: RosterPlayer[] = [
  {
    id: '1',
    name: 'Marcus Reed',
    number: '1',
    position: 'PG',
    primaryArchetype: 'pick_and_roll_operator',
    secondaryArchetype: 'connector_guard_wing',
    impactModifier: 'primary_engine',
  },
  {
    id: '2',
    name: 'Chris Plantey',
    number: '2',
    position: 'CG',
    primaryArchetype: 'three_and_d_wing',
    secondaryArchetype: 'spot_up_specialist',
    impactModifier: 'force_multiplier',
  },
  {
    id: '3',
    name: 'Claude McKesey',
    number: '3',
    position: 'W',
    primaryArchetype: 'two_way_wing',
    secondaryArchetype: 'slasher_rim_pressure_wing',
    impactModifier: null,
  },
  {
    id: '10',
    name: 'Samuel Manzo',
    number: '5',
    position: 'CG',
    primaryArchetype: null,
    secondaryArchetype: null,
    impactModifier: null,
  },
  {
    id: '4',
    name: 'Samuel Wall',
    number: '6',
    position: 'F',
    primaryArchetype: 'stretch_big',
    secondaryArchetype: null,
    impactModifier: null,
  },
  {
    id: '5',
    name: 'Jordan Blake',
    number: '10',
    position: 'B',
    primaryArchetype: 'rim_protector_anchor',
    secondaryArchetype: 'rebounding_interior_enforcer',
    impactModifier: 'specialist_anchor',
  },
  {
    id: '6',
    name: 'Devon Carter',
    number: '11',
    position: 'PG',
    primaryArchetype: 'poa_defender_guard',
    secondaryArchetype: null,
    impactModifier: null,
  },
  {
    id: '7',
    name: 'Tyler Quinn',
    number: '15',
    position: 'CG',
    primaryArchetype: 'spot_up_specialist',
    secondaryArchetype: 'off_ball_shooter',
    impactModifier: null,
  },
  {
    id: '8',
    name: 'Nicholas Bansraj',
    number: '20',
    position: 'W',
    primaryArchetype: 'switchable_defender_wing',
    secondaryArchetype: 'three_and_d_wing',
    impactModifier: 'force_multiplier',
  },
  {
    id: '9',
    name: 'Paul Diomande',
    number: '21',
    position: 'B',
    primaryArchetype: 'rim_protector_anchor',
    secondaryArchetype: 'rebounding_interior_enforcer',
    impactModifier: 'specialist_anchor',
  },
];

/**
 * Get roster archetype coverage
 * Returns count of players matching each archetype (primary OR secondary counts)
 */
export function getRosterArchetypeCoverage(roster: RosterPlayer[]): Record<string, string[]> {
  const coverage: Record<string, string[]> = {};

  roster.forEach((player) => {
    if (player.primaryArchetype) {
      if (!coverage[player.primaryArchetype]) {
        coverage[player.primaryArchetype] = [];
      }
      coverage[player.primaryArchetype].push(player.name);
    }
    if (player.secondaryArchetype && player.secondaryArchetype !== player.primaryArchetype) {
      if (!coverage[player.secondaryArchetype]) {
        coverage[player.secondaryArchetype] = [];
      }
      coverage[player.secondaryArchetype].push(player.name);
    }
  });

  return coverage;
}

/**
 * Get roster modifier coverage
 * Returns count of players with each impact modifier
 */
export function getRosterModifierCoverage(roster: RosterPlayer[]): Record<string, string[]> {
  const coverage: Record<string, string[]> = {};

  roster.forEach((player) => {
    if (player.impactModifier) {
      if (!coverage[player.impactModifier]) {
        coverage[player.impactModifier] = [];
      }
      coverage[player.impactModifier].push(player.name);
    }
  });

  return coverage;
}
