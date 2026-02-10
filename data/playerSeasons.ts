/**
 * Player Season Stats — year-by-year history for Player Profile.
 */

export interface PlayerSeason {
  playerId: string;
  season: string;
  school: string;
  level: string;
  gp: number;
  mpg: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fgPct: number;
  threePct: number;
  ftPct: number;
}

export const PLAYER_SEASONS: PlayerSeason[] = [
  // Marcus Thompson (pp-02) — JUCO
  { playerId: 'pp-02', season: '2024-25', school: 'Coffeyville CC', level: 'JUCO', gp: 28, mpg: 32.1, ppg: 22.1, rpg: 4.8, apg: 2.1, spg: 1.4, bpg: 0.2, fgPct: 46.3, threePct: 38.2, ftPct: 81.5 },
  { playerId: 'pp-02', season: '2023-24', school: 'Coffeyville CC', level: 'JUCO', gp: 30, mpg: 28.5, ppg: 16.4, rpg: 3.9, apg: 1.8, spg: 1.1, bpg: 0.1, fgPct: 43.8, threePct: 35.6, ftPct: 78.2 },

  // Rashad Williams (pp-06) — JUCO
  { playerId: 'pp-06', season: '2024-25', school: 'NW Florida State', level: 'JUCO', gp: 26, mpg: 30.4, ppg: 16.3, rpg: 8.5, apg: 1.2, spg: 0.8, bpg: 1.1, fgPct: 52.1, threePct: 31.4, ftPct: 72.6 },
  { playerId: 'pp-06', season: '2023-24', school: 'NW Florida State', level: 'JUCO', gp: 29, mpg: 24.8, ppg: 11.7, rpg: 6.9, apg: 0.9, spg: 0.6, bpg: 0.8, fgPct: 49.3, threePct: 28.9, ftPct: 69.1 },

  // Jordan Davis (pp-08) — JUCO
  { playerId: 'pp-08', season: '2024-25', school: 'Vincennes', level: 'JUCO', gp: 27, mpg: 31.2, ppg: 19.6, rpg: 3.2, apg: 3.2, spg: 1.5, bpg: 0.3, fgPct: 44.7, threePct: 36.8, ftPct: 84.1 },

  // Darius Jackson (pp-10) — D2
  { playerId: 'pp-10', season: '2024-25', school: 'Lincoln Memorial', level: 'NCAA D2', gp: 24, mpg: 33.0, ppg: 15.4, rpg: 3.1, apg: 6.8, spg: 1.9, bpg: 0.1, fgPct: 42.5, threePct: 34.1, ftPct: 79.8 },
  { playerId: 'pp-10', season: '2023-24', school: 'Lincoln Memorial', level: 'NCAA D2', gp: 28, mpg: 29.3, ppg: 12.1, rpg: 2.8, apg: 5.4, spg: 1.6, bpg: 0.1, fgPct: 40.9, threePct: 32.7, ftPct: 76.3 },

  // Terrell Washington (pp-14) — JUCO
  { playerId: 'pp-14', season: '2024-25', school: 'Central Arizona', level: 'JUCO', gp: 25, mpg: 34.2, ppg: 17.8, rpg: 2.9, apg: 5.6, spg: 2.0, bpg: 0.2, fgPct: 45.1, threePct: 37.5, ftPct: 82.3 },

  // Devon Price (pp-21) — JUCO
  { playerId: 'pp-21', season: '2024-25', school: 'Chipola College', level: 'JUCO', gp: 26, mpg: 33.5, ppg: 21.3, rpg: 3.8, apg: 2.4, spg: 1.2, bpg: 0.1, fgPct: 47.2, threePct: 39.1, ftPct: 85.7 },

  // Cam Butler (pp-18) — JUCO
  { playerId: 'pp-18', season: '2024-25', school: 'Barton CC', level: 'JUCO', gp: 27, mpg: 29.8, ppg: 18.0, rpg: 5.2, apg: 1.8, spg: 1.0, bpg: 0.4, fgPct: 48.6, threePct: 33.9, ftPct: 77.4 },

  // Xavier Patel (pp-16) — JUCO
  { playerId: 'pp-16', season: '2024-25', school: 'Hutchinson CC', level: 'JUCO', gp: 28, mpg: 26.1, ppg: 10.5, rpg: 8.7, apg: 0.8, spg: 0.5, bpg: 2.8, fgPct: 55.4, threePct: 0, ftPct: 64.2 },
];
