/**
 * Governing Bodies — Hierarchy for Teams drill-down
 * Maps governing bodies and divisions to PoolLevel values for filtering.
 */

import type { PoolLevel } from '@/data/playerPool';

export interface GoverningBodyDef {
  id: string;
  label: string;
  divisions: DivisionDef[] | null; // null = no subdivisions
}

export interface DivisionDef {
  id: string;
  label: string;
  poolLevel: PoolLevel;
}

export const GOVERNING_BODIES: GoverningBodyDef[] = [
  {
    id: 'ncaa',
    label: 'NCAA',
    divisions: [
      { id: 'ncaa_d1', label: 'Division I', poolLevel: 'NCAA D1' },
      { id: 'ncaa_d2', label: 'Division II', poolLevel: 'NCAA D2' },
      { id: 'ncaa_d3', label: 'Division III', poolLevel: 'NCAA D3' },
    ],
  },
  {
    id: 'naia',
    label: 'NAIA',
    divisions: null,
  },
  {
    id: 'juco',
    label: 'JUCO',
    divisions: [
      { id: 'juco_d1', label: 'Division I', poolLevel: 'JUCO' },
      { id: 'juco_d2', label: 'Division II', poolLevel: 'JUCO' },
      { id: 'juco_d3', label: 'Division III', poolLevel: 'JUCO' },
    ],
  },
  {
    id: 'ccaa',
    label: 'CCAA',
    divisions: [
      { id: 'ccaa_north', label: 'North', poolLevel: 'NCAA D2' },
      { id: 'ccaa_south', label: 'South', poolLevel: 'NCAA D2' },
    ],
  },
  {
    id: 'nccaa',
    label: 'NCCAA',
    divisions: null,
  },
  {
    id: 'uscaa',
    label: 'USCAA',
    divisions: null,
  },
];

/** Get the PoolLevel for a governing body without divisions */
export function getGoverningBodyPoolLevel(govId: string): PoolLevel | null {
  switch (govId) {
    case 'naia': return 'NAIA';
    case 'nccaa': return 'NCAA D3'; // map to closest existing level
    case 'uscaa': return 'NCAA D3'; // map to closest existing level
    default: return null;
  }
}
