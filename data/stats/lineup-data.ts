/**
 * Lineup combination data
 * Top 10 lineups by minutes with efficiency metrics
 */

export interface LineupRow {
  id: string;
  players: { name: string; number: string; position: string }[];
  minutes: number;
  possessions: number;
  netRating: number;  // per 100 possessions
  offPPP: number;
  defPPP: number;
  rebPct: number;
  toPct: number;
  ftRate: number;
}

export interface LineupDetail {
  lineupId: string;
  shotProfile: { zone: string; freq: number; ppp: number }[];
  topPlayTypes: { type: string; possPct: number; ppp: number }[];
}

export const TOP_LINEUPS: LineupRow[] = [
  {
    id: 'L1',
    players: [
      { name: 'Smith', number: '5', position: 'PG' },
      { name: 'Thomas', number: '0', position: 'CG' },
      { name: 'Hicks', number: '3', position: 'W' },
      { name: 'Guerrier', number: '12', position: 'F' },
      { name: 'Rolle', number: '9', position: 'B' },
    ],
    minutes: 312,
    possessions: 438,
    netRating: 8.4,
    offPPP: 1.04,
    defPPP: 0.88,
    rebPct: 52.1,
    toPct: 13.2,
    ftRate: 0.28,
  },
  {
    id: 'L2',
    players: [
      { name: 'Smith', number: '5', position: 'PG' },
      { name: 'Pierre', number: '10', position: 'CG' },
      { name: 'Hicks', number: '3', position: 'W' },
      { name: 'Guerrier', number: '12', position: 'F' },
      { name: 'Rolle', number: '9', position: 'B' },
    ],
    minutes: 224,
    possessions: 316,
    netRating: 5.2,
    offPPP: 0.98,
    defPPP: 0.86,
    rebPct: 54.8,
    toPct: 14.6,
    ftRate: 0.24,
  },
  {
    id: 'L3',
    players: [
      { name: 'Smith', number: '5', position: 'PG' },
      { name: 'Thomas', number: '0', position: 'CG' },
      { name: 'Williams', number: '22', position: 'W' },
      { name: 'Guerrier', number: '12', position: 'F' },
      { name: 'Rolle', number: '9', position: 'B' },
    ],
    minutes: 186,
    possessions: 262,
    netRating: 6.8,
    offPPP: 1.02,
    defPPP: 0.90,
    rebPct: 51.4,
    toPct: 12.8,
    ftRate: 0.30,
  },
  {
    id: 'L4',
    players: [
      { name: 'Smith', number: '5', position: 'PG' },
      { name: 'Thomas', number: '0', position: 'CG' },
      { name: 'Hicks', number: '3', position: 'W' },
      { name: 'Asceric', number: '1', position: 'F' },
      { name: 'Rolle', number: '9', position: 'B' },
    ],
    minutes: 168,
    possessions: 236,
    netRating: 3.1,
    offPPP: 0.96,
    defPPP: 0.90,
    rebPct: 53.2,
    toPct: 15.1,
    ftRate: 0.32,
  },
  {
    id: 'L5',
    players: [
      { name: 'Pierre', number: '10', position: 'PG' },
      { name: 'Thomas', number: '0', position: 'CG' },
      { name: 'Hicks', number: '3', position: 'W' },
      { name: 'Guerrier', number: '12', position: 'F' },
      { name: 'Asceric', number: '1', position: 'B' },
    ],
    minutes: 142,
    possessions: 198,
    netRating: -1.4,
    offPPP: 0.92,
    defPPP: 0.94,
    rebPct: 48.6,
    toPct: 16.2,
    ftRate: 0.26,
  },
  {
    id: 'L6',
    players: [
      { name: 'Smith', number: '5', position: 'PG' },
      { name: 'Thomas', number: '0', position: 'CG' },
      { name: 'Hicks', number: '3', position: 'W' },
      { name: 'Guerrier', number: '12', position: 'F' },
      { name: 'Asceric', number: '1', position: 'B' },
    ],
    minutes: 128,
    possessions: 180,
    netRating: 4.6,
    offPPP: 0.99,
    defPPP: 0.89,
    rebPct: 52.8,
    toPct: 13.8,
    ftRate: 0.27,
  },
  {
    id: 'L7',
    players: [
      { name: 'Smith', number: '5', position: 'PG' },
      { name: 'Pierre', number: '10', position: 'CG' },
      { name: 'Williams', number: '22', position: 'W' },
      { name: 'Guerrier', number: '12', position: 'F' },
      { name: 'Rolle', number: '9', position: 'B' },
    ],
    minutes: 108,
    possessions: 152,
    netRating: 2.8,
    offPPP: 0.95,
    defPPP: 0.88,
    rebPct: 50.4,
    toPct: 14.8,
    ftRate: 0.22,
  },
  {
    id: 'L8',
    players: [
      { name: 'Smith', number: '5', position: 'PG' },
      { name: 'Thomas', number: '0', position: 'CG' },
      { name: 'Williams', number: '22', position: 'W' },
      { name: 'Asceric', number: '1', position: 'F' },
      { name: 'Rolle', number: '9', position: 'B' },
    ],
    minutes: 94,
    possessions: 132,
    netRating: 1.2,
    offPPP: 0.94,
    defPPP: 0.92,
    rebPct: 49.8,
    toPct: 15.4,
    ftRate: 0.25,
  },
  {
    id: 'L9',
    players: [
      { name: 'Pierre', number: '10', position: 'PG' },
      { name: 'Thomas', number: '0', position: 'CG' },
      { name: 'Williams', number: '22', position: 'W' },
      { name: 'Guerrier', number: '12', position: 'F' },
      { name: 'Rolle', number: '9', position: 'B' },
    ],
    minutes: 82,
    possessions: 116,
    netRating: -2.6,
    offPPP: 0.88,
    defPPP: 0.92,
    rebPct: 47.2,
    toPct: 17.1,
    ftRate: 0.20,
  },
  {
    id: 'L10',
    players: [
      { name: 'Smith', number: '5', position: 'PG' },
      { name: 'Pierre', number: '10', position: 'CG' },
      { name: 'Hicks', number: '3', position: 'W' },
      { name: 'Asceric', number: '1', position: 'F' },
      { name: 'Rolle', number: '9', position: 'B' },
    ],
    minutes: 72,
    possessions: 102,
    netRating: 0.8,
    offPPP: 0.93,
    defPPP: 0.91,
    rebPct: 51.6,
    toPct: 14.2,
    ftRate: 0.29,
  },
];

export const LINEUP_DETAILS: Record<string, LineupDetail> = {
  L1: {
    lineupId: 'L1',
    shotProfile: [
      { zone: 'Rim', freq: 36.2, ppp: 1.24 },
      { zone: 'Mid', freq: 16.8, ppp: 0.84 },
      { zone: '3PT', freq: 47.0, ppp: 1.06 },
    ],
    topPlayTypes: [
      { type: 'P&R Ball Handler', possPct: 24.2, ppp: 0.98 },
      { type: 'Spot Up', possPct: 20.1, ppp: 1.08 },
      { type: 'Cut', possPct: 10.4, ppp: 1.28 },
    ],
  },
  L2: {
    lineupId: 'L2',
    shotProfile: [
      { zone: 'Rim', freq: 38.4, ppp: 1.18 },
      { zone: 'Mid', freq: 18.2, ppp: 0.80 },
      { zone: '3PT', freq: 43.4, ppp: 0.98 },
    ],
    topPlayTypes: [
      { type: 'P&R Ball Handler', possPct: 22.8, ppp: 0.92 },
      { type: 'Isolation', possPct: 14.6, ppp: 0.88 },
      { type: 'Spot Up', possPct: 18.4, ppp: 1.02 },
    ],
  },
  L3: {
    lineupId: 'L3',
    shotProfile: [
      { zone: 'Rim', freq: 34.8, ppp: 1.20 },
      { zone: 'Mid', freq: 15.4, ppp: 0.82 },
      { zone: '3PT', freq: 49.8, ppp: 1.04 },
    ],
    topPlayTypes: [
      { type: 'Spot Up', possPct: 22.4, ppp: 1.10 },
      { type: 'P&R Ball Handler', possPct: 20.6, ppp: 0.96 },
      { type: 'Transition', possPct: 16.2, ppp: 1.16 },
    ],
  },
};
