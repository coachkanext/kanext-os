/**
 * Mock Stats V2 — Full statistics data for Sports Statistics tab.
 * Sections: Team Identity, Team Dashboard (Four Factors + Shot Profile),
 * Splits Matrix, Lineups, Play Types, Game Log, Player Leaderboard.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface TeamIdentity {
  name: string;
  level: string;
  conference: string;
  record: string;
  confRecord: string;
  streak: string;
  confStanding: number;
  teamKR: number;
  offKR: number;
  defKR: number;
  coverageBadge: 'Synergy' | 'KaNeXT' | 'Manual';
  lastUpdated: string;
}

export interface FourFactors {
  eFG: number;
  toPct: number;
  orebPct: number;
  ftRate: number;
}

export interface ShotProfileEntry {
  zone: string;
  freq: number;
  efg: number;
  ppp: number;
}

export interface TeamDashboard {
  pace: number;
  possessions: number;
  tempoBand: string;
  shotProfile: ShotProfileEntry[];
  offRtg: number;
  defRtg: number;
  offFourFactors: FourFactors;
  defFourFactors: FourFactors;
}

export interface SplitRow {
  label: string;
  offRtg: number;
  defRtg: number;
  netRtg: number;
  pace: number;
  eFG: number;
  toPct: number;
  orebPct: number;
}

export interface SplitGroup {
  category: string;
  categoryLabel: string;
  rows: SplitRow[];
}

export interface LineupEntry {
  id: string;
  rank: number;
  players: string[];
  minutes: number;
  netRtg: number;
  offRtg: number;
  defRtg: number;
  possessions: number;
}

export interface PlayTypeEntry {
  type: string;
  category: 'offense' | 'defense';
  possPct: number;
  ppp: number;
  percentile: number;
  turnoverPct: number;
  scorePct: number;
}

export interface GameLogEntry {
  id: string;
  opponent: string;
  date: string;
  result: 'W' | 'L';
  score: string;
  pace: number;
  offRtg: number;
  defRtg: number;
  eFG: number;
  toPct: number;
  swingFactor: string;
}

export interface PlayerStatRow {
  id: string;
  name: string;
  number: string;
  position: string;
  gp: number;
  minutes: number;
  usage: number;
  pts: number;
  efg: number;
  threePct: number;
  ftRate: number;
  astRate: number;
  toPct: number;
  orebRate: number;
  drebRate: number;
  kr: number;
  offKR: number;
  defKR: number;
}

// =============================================================================
// DATA
// =============================================================================

export const TEAM_IDENTITY: TeamIdentity = {
  name: 'Florida Memorial',
  level: 'NAIA',
  conference: 'Sun Conference',
  record: '22-8',
  confRecord: '14-4',
  streak: 'W3',
  confStanding: 2,
  teamKR: 74,
  offKR: 72,
  defKR: 76,
  coverageBadge: 'Synergy',
  lastUpdated: 'Feb 15, 2026 · 11:42 AM',
};

export const TEAM_DASHBOARD: TeamDashboard = {
  pace: 71.4,
  possessions: 2140,
  tempoBand: 'Moderate',
  shotProfile: [
    { zone: 'Rim', freq: 34.2, efg: 59.8, ppp: 1.20 },
    { zone: 'Mid-Range', freq: 14.6, efg: 41.2, ppp: 0.82 },
    { zone: '3PT', freq: 38.1, efg: 52.7, ppp: 1.05 },
    { zone: 'FT', freq: 13.1, efg: 0, ppp: 0.74 },
  ],
  offRtg: 108.4,
  defRtg: 101.2,
  offFourFactors: { eFG: 51.6, toPct: 17.8, orebPct: 31.4, ftRate: 32.9 },
  defFourFactors: { eFG: 44.8, toPct: 22.1, orebPct: 28.4, ftRate: 30.2 },
};

export const SPLITS_MATRIX: SplitGroup[] = [
  { category: 'by_half', categoryLabel: 'By Half', rows: [
    { label: '1st Half', offRtg: 106.2, defRtg: 99.8, netRtg: 6.4, pace: 72.1, eFG: 50.4, toPct: 18.2, orebPct: 30.8 },
    { label: '2nd Half', offRtg: 110.6, defRtg: 102.6, netRtg: 8.0, pace: 70.7, eFG: 52.8, toPct: 17.4, orebPct: 32.0 },
  ]},
  { category: 'by_score_state', categoryLabel: 'By Score State', rows: [
    { label: 'Ahead', offRtg: 112.4, defRtg: 97.2, netRtg: 15.2, pace: 69.4, eFG: 53.1, toPct: 16.5, orebPct: 29.8 },
    { label: 'Tied (+/- 3)', offRtg: 107.8, defRtg: 103.4, netRtg: 4.4, pace: 71.8, eFG: 50.2, toPct: 18.8, orebPct: 31.2 },
    { label: 'Behind', offRtg: 104.1, defRtg: 106.8, netRtg: -2.7, pace: 74.2, eFG: 48.9, toPct: 19.4, orebPct: 33.6 },
  ]},
  { category: 'by_transition', categoryLabel: 'Transition vs Halfcourt', rows: [
    { label: 'Transition', offRtg: 118.6, defRtg: 96.4, netRtg: 22.2, pace: 0, eFG: 58.4, toPct: 12.8, orebPct: 0 },
    { label: 'Halfcourt', offRtg: 104.2, defRtg: 103.6, netRtg: 0.6, pace: 0, eFG: 49.2, toPct: 19.4, orebPct: 0 },
  ]},
];

export const TOP_LINEUPS: LineupEntry[] = [
  { id: 'lu-1', rank: 1, players: ['D. Cole', 'J. Brown', 'T. Singleton', 'M. Peeples', 'D. Williams'], minutes: 142, netRtg: 14.6, offRtg: 114.2, defRtg: 99.6, possessions: 184 },
  { id: 'lu-2', rank: 2, players: ['D. Cole', 'J. Brown', 'A. Garland', 'M. Peeples', 'D. Williams'], minutes: 118, netRtg: 11.2, offRtg: 111.8, defRtg: 100.6, possessions: 156 },
  { id: 'lu-3', rank: 3, players: ['D. Cole', 'T. Singleton', 'A. Garland', 'M. Peeples', 'K. Riley'], minutes: 96, netRtg: 8.8, offRtg: 109.4, defRtg: 100.6, possessions: 128 },
  { id: 'lu-4', rank: 4, players: ['J. Brown', 'T. Singleton', 'A. Garland', 'D. Williams', 'K. Riley'], minutes: 84, netRtg: 6.4, offRtg: 108.2, defRtg: 101.8, possessions: 112 },
  { id: 'lu-5', rank: 5, players: ['D. Cole', 'J. Brown', 'T. Singleton', 'C. Henderson', 'D. Williams'], minutes: 72, netRtg: 5.2, offRtg: 107.6, defRtg: 102.4, possessions: 96 },
];

export const PLAY_TYPE_SUMMARY: PlayTypeEntry[] = [
  { type: 'PNR Ball Handler', category: 'offense', possPct: 22.4, ppp: 0.94, percentile: 72, turnoverPct: 14.2, scorePct: 42.8 },
  { type: 'PNR Roll Man', category: 'offense', possPct: 8.6, ppp: 1.12, percentile: 81, turnoverPct: 8.4, scorePct: 52.1 },
  { type: 'Spot-Up', category: 'offense', possPct: 18.2, ppp: 1.06, percentile: 68, turnoverPct: 6.2, scorePct: 44.6 },
  { type: 'Transition', category: 'offense', possPct: 16.8, ppp: 1.14, percentile: 74, turnoverPct: 12.8, scorePct: 54.2 },
  { type: 'Cuts', category: 'offense', possPct: 9.2, ppp: 1.24, percentile: 86, turnoverPct: 4.8, scorePct: 58.4 },
  { type: 'Isolation', category: 'offense', possPct: 5.2, ppp: 0.86, percentile: 48, turnoverPct: 16.8, scorePct: 36.4 },
  { type: 'PNR Coverage', category: 'defense', possPct: 24.6, ppp: 0.88, percentile: 74, turnoverPct: 16.4, scorePct: 38.2 },
  { type: 'Spot-Up Allowed', category: 'defense', possPct: 19.4, ppp: 0.92, percentile: 66, turnoverPct: 8.8, scorePct: 40.6 },
  { type: 'Transition Allowed', category: 'defense', possPct: 14.2, ppp: 1.02, percentile: 54, turnoverPct: 10.2, scorePct: 48.4 },
];

export const GAME_LOG: GameLogEntry[] = [
  { id: 'gl-1', opponent: 'Webber International', date: 'Feb 15', result: 'W', score: '84-72', pace: 72.4, offRtg: 112.8, defRtg: 96.4, eFG: 54.2, toPct: 15.6, swingFactor: 'Transition dominance' },
  { id: 'gl-2', opponent: 'Warner', date: 'Feb 11', result: 'W', score: '78-68', pace: 68.2, offRtg: 108.4, defRtg: 94.8, eFG: 52.6, toPct: 16.8, swingFactor: 'Free throw edge +14' },
  { id: 'gl-3', opponent: 'Ave Maria', date: 'Feb 8', result: 'W', score: '92-84', pace: 76.8, offRtg: 116.4, defRtg: 106.2, eFG: 56.8, toPct: 18.4, swingFactor: '3PT barrage (14/28)' },
  { id: 'gl-4', opponent: 'Thomas', date: 'Feb 4', result: 'L', score: '66-74', pace: 64.8, offRtg: 96.2, defRtg: 108.4, eFG: 42.4, toPct: 22.6, swingFactor: 'Turnovers 19 (season high)' },
  { id: 'gl-5', opponent: 'Southeastern', date: 'Feb 1', result: 'W', score: '81-76', pace: 70.6, offRtg: 110.2, defRtg: 104.8, eFG: 50.8, toPct: 17.2, swingFactor: 'OREB dominance +8' },
  { id: 'gl-6', opponent: 'Keiser', date: 'Jan 28', result: 'L', score: '70-78', pace: 74.2, offRtg: 98.6, defRtg: 110.4, eFG: 44.2, toPct: 20.8, swingFactor: 'PNR coverage breakdowns' },
  { id: 'gl-7', opponent: 'St. Thomas', date: 'Jan 25', result: 'W', score: '88-80', pace: 72.8, offRtg: 114.6, defRtg: 104.2, eFG: 55.4, toPct: 14.8, swingFactor: 'Cole 28pts carry' },
  { id: 'gl-8', opponent: 'Johnson & Wales', date: 'Jan 21', result: 'W', score: '96-62', pace: 78.4, offRtg: 122.8, defRtg: 79.4, eFG: 58.6, toPct: 12.4, swingFactor: 'Blowout \u2014 bench minutes' },
  { id: 'gl-9', opponent: 'South Florida State', date: 'Jan 18', result: 'W', score: '76-72', pace: 66.4, offRtg: 106.2, defRtg: 100.8, eFG: 48.8, toPct: 19.2, swingFactor: 'Clutch FTs down stretch' },
  { id: 'gl-10', opponent: 'Florida National', date: 'Jan 14', result: 'W', score: '82-68', pace: 70.2, offRtg: 112.4, defRtg: 92.6, eFG: 54.4, toPct: 16.4, swingFactor: 'Defensive intensity' },
];

export const PLAYER_LEADERBOARD: PlayerStatRow[] = [
  { id: 'ps-1', name: 'D. Cole', number: '1', position: 'PG', gp: 30, minutes: 33.2, usage: 28.4, pts: 18.6, efg: 52.4, threePct: 37.8, ftRate: 38.6, toPct: 14.8, astRate: 32.4, orebRate: 2.4, drebRate: 12.6, kr: 78, offKR: 80, defKR: 74 },
  { id: 'ps-2', name: 'J. Brown', number: '4', position: 'CG', gp: 30, minutes: 31.8, usage: 24.2, pts: 16.4, efg: 54.8, threePct: 40.2, ftRate: 28.4, toPct: 12.2, astRate: 14.8, orebRate: 1.8, drebRate: 14.2, kr: 76, offKR: 78, defKR: 72 },
  { id: 'ps-3', name: 'T. Singleton', number: '12', position: 'W', gp: 28, minutes: 30.4, usage: 20.8, pts: 14.2, efg: 50.6, threePct: 35.4, ftRate: 34.2, toPct: 16.4, astRate: 18.6, orebRate: 3.2, drebRate: 16.8, kr: 74, offKR: 72, defKR: 76 },
  { id: 'ps-4', name: 'M. Peeples', number: '24', position: 'F', gp: 30, minutes: 28.6, usage: 18.4, pts: 12.8, efg: 56.2, threePct: 32.8, ftRate: 36.8, toPct: 10.8, astRate: 8.4, orebRate: 8.6, drebRate: 22.4, kr: 72, offKR: 68, defKR: 78 },
  { id: 'ps-5', name: 'D. Williams', number: '32', position: 'B', gp: 30, minutes: 26.4, usage: 14.6, pts: 10.4, efg: 58.4, threePct: 28.6, ftRate: 42.4, toPct: 12.6, astRate: 6.2, orebRate: 10.4, drebRate: 24.6, kr: 70, offKR: 64, defKR: 80 },
  { id: 'ps-6', name: 'A. Garland', number: '3', position: 'CG', gp: 28, minutes: 24.2, usage: 22.6, pts: 13.8, efg: 48.4, threePct: 34.6, ftRate: 30.2, toPct: 18.2, astRate: 12.4, orebRate: 1.6, drebRate: 10.8, kr: 68, offKR: 72, defKR: 62 },
  { id: 'ps-7', name: 'C. Henderson', number: '11', position: 'W', gp: 26, minutes: 22.8, usage: 16.8, pts: 9.6, efg: 46.2, threePct: 32.4, ftRate: 26.8, toPct: 14.6, astRate: 16.2, orebRate: 2.8, drebRate: 14.4, kr: 66, offKR: 64, defKR: 68 },
  { id: 'ps-8', name: 'K. Riley', number: '22', position: 'F', gp: 30, minutes: 20.4, usage: 12.4, pts: 8.2, efg: 52.8, threePct: 30.8, ftRate: 34.6, toPct: 10.2, astRate: 4.8, orebRate: 7.8, drebRate: 20.2, kr: 64, offKR: 58, defKR: 72 },
  { id: 'ps-9', name: 'J. Okafor', number: '34', position: 'B', gp: 24, minutes: 16.8, usage: 10.8, pts: 6.4, efg: 54.6, threePct: 22.4, ftRate: 38.2, toPct: 14.4, astRate: 3.6, orebRate: 9.2, drebRate: 18.6, kr: 62, offKR: 56, defKR: 70 },
  { id: 'ps-10', name: 'R. Jackson', number: '5', position: 'PG', gp: 28, minutes: 14.6, usage: 18.2, pts: 7.8, efg: 44.8, threePct: 36.2, ftRate: 24.6, toPct: 20.4, astRate: 28.6, orebRate: 1.2, drebRate: 8.4, kr: 60, offKR: 62, defKR: 56 },
];

// =============================================================================
// FILTER OPTIONS
// =============================================================================

export const SEASON_OPTIONS = [
  { id: '2025-26', label: '2025-26' },
  { id: '2024-25', label: '2024-25' },
];

export const GAME_RANGE_OPTIONS = [
  { id: 'all', label: 'All Games' },
  { id: 'last-10', label: 'Last 10' },
  { id: 'last-5', label: 'Last 5' },
  { id: 'conf', label: 'Conference' },
  { id: 'home', label: 'Home' },
  { id: 'away', label: 'Away' },
];
