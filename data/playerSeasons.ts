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
  kr?: number;
}

export const PLAYER_SEASONS: PlayerSeason[] = [
  // Marcus Thompson (pp-02) — JUCO (overall: 84)
  { playerId: 'pp-02', season: '2025-26', school: 'Coffeyville CC', level: 'JUCO', gp: 18, mpg: 33.4, ppg: 24.2, rpg: 5.1, apg: 2.4, spg: 1.6, bpg: 0.3, fgPct: 47.8, threePct: 39.5, ftPct: 83.1, kr: 84 },
  { playerId: 'pp-02', season: '2024-25', school: 'Coffeyville CC', level: 'JUCO', gp: 28, mpg: 32.1, ppg: 22.1, rpg: 4.8, apg: 2.1, spg: 1.4, bpg: 0.2, fgPct: 46.3, threePct: 38.2, ftPct: 81.5, kr: 78 },
  { playerId: 'pp-02', season: '2023-24', school: 'Coffeyville CC', level: 'JUCO', gp: 30, mpg: 28.5, ppg: 16.4, rpg: 3.9, apg: 1.8, spg: 1.1, bpg: 0.1, fgPct: 43.8, threePct: 35.6, ftPct: 78.2, kr: 71 },

  // Rashad Williams (pp-06) — JUCO (overall: 86)
  { playerId: 'pp-06', season: '2025-26', school: 'NW Florida State', level: 'JUCO', gp: 17, mpg: 31.2, ppg: 18.1, rpg: 9.2, apg: 1.5, spg: 0.9, bpg: 1.3, fgPct: 53.8, threePct: 33.0, ftPct: 74.2, kr: 86 },
  { playerId: 'pp-06', season: '2024-25', school: 'NW Florida State', level: 'JUCO', gp: 26, mpg: 30.4, ppg: 16.3, rpg: 8.5, apg: 1.2, spg: 0.8, bpg: 1.1, fgPct: 52.1, threePct: 31.4, ftPct: 72.6, kr: 80 },
  { playerId: 'pp-06', season: '2023-24', school: 'NW Florida State', level: 'JUCO', gp: 29, mpg: 24.8, ppg: 11.7, rpg: 6.9, apg: 0.9, spg: 0.6, bpg: 0.8, fgPct: 49.3, threePct: 28.9, ftPct: 69.1, kr: 73 },

  // Jordan Davis (pp-08) — JUCO (overall: 83)
  { playerId: 'pp-08', season: '2025-26', school: 'Vincennes', level: 'JUCO', gp: 16, mpg: 32.0, ppg: 21.4, rpg: 3.5, apg: 3.6, spg: 1.7, bpg: 0.4, fgPct: 46.1, threePct: 38.2, ftPct: 85.6, kr: 83 },
  { playerId: 'pp-08', season: '2024-25', school: 'Vincennes', level: 'JUCO', gp: 27, mpg: 31.2, ppg: 19.6, rpg: 3.2, apg: 3.2, spg: 1.5, bpg: 0.3, fgPct: 44.7, threePct: 36.8, ftPct: 84.1, kr: 76 },

  // Darius Jackson (pp-10) — D2 (overall: 79)
  { playerId: 'pp-10', season: '2025-26', school: 'Lincoln Memorial', level: 'NCAA D2', gp: 15, mpg: 34.1, ppg: 17.2, rpg: 3.4, apg: 7.5, spg: 2.1, bpg: 0.2, fgPct: 44.0, threePct: 36.3, ftPct: 81.4, kr: 79 },
  { playerId: 'pp-10', season: '2024-25', school: 'Lincoln Memorial', level: 'NCAA D2', gp: 24, mpg: 33.0, ppg: 15.4, rpg: 3.1, apg: 6.8, spg: 1.9, bpg: 0.1, fgPct: 42.5, threePct: 34.1, ftPct: 79.8, kr: 73 },
  { playerId: 'pp-10', season: '2023-24', school: 'Lincoln Memorial', level: 'NCAA D2', gp: 28, mpg: 29.3, ppg: 12.1, rpg: 2.8, apg: 5.4, spg: 1.6, bpg: 0.1, fgPct: 40.9, threePct: 32.7, ftPct: 76.3, kr: 65 },

  // Terrell Washington (pp-14) — JUCO (overall: 85)
  { playerId: 'pp-14', season: '2025-26', school: 'Central Arizona', level: 'JUCO', gp: 16, mpg: 35.0, ppg: 19.5, rpg: 3.2, apg: 6.1, spg: 2.2, bpg: 0.3, fgPct: 46.8, threePct: 38.9, ftPct: 83.7, kr: 85 },
  { playerId: 'pp-14', season: '2024-25', school: 'Central Arizona', level: 'JUCO', gp: 25, mpg: 34.2, ppg: 17.8, rpg: 2.9, apg: 5.6, spg: 2.0, bpg: 0.2, fgPct: 45.1, threePct: 37.5, ftPct: 82.3, kr: 79 },

  // Devon Price (pp-21) — JUCO (overall: 87)
  { playerId: 'pp-21', season: '2025-26', school: 'Chipola College', level: 'JUCO', gp: 17, mpg: 34.2, ppg: 23.1, rpg: 4.2, apg: 2.8, spg: 1.4, bpg: 0.2, fgPct: 48.5, threePct: 40.3, ftPct: 87.1, kr: 87 },
  { playerId: 'pp-21', season: '2024-25', school: 'Chipola College', level: 'JUCO', gp: 26, mpg: 33.5, ppg: 21.3, rpg: 3.8, apg: 2.4, spg: 1.2, bpg: 0.1, fgPct: 47.2, threePct: 39.1, ftPct: 85.7, kr: 81 },

  // Cam Butler (pp-18) — JUCO (overall: 83)
  { playerId: 'pp-18', season: '2025-26', school: 'Barton CC', level: 'JUCO', gp: 16, mpg: 30.5, ppg: 19.8, rpg: 5.8, apg: 2.1, spg: 1.2, bpg: 0.5, fgPct: 50.1, threePct: 35.2, ftPct: 79.0, kr: 83 },
  { playerId: 'pp-18', season: '2024-25', school: 'Barton CC', level: 'JUCO', gp: 27, mpg: 29.8, ppg: 18.0, rpg: 5.2, apg: 1.8, spg: 1.0, bpg: 0.4, fgPct: 48.6, threePct: 33.9, ftPct: 77.4, kr: 77 },

  // Xavier Patel (pp-16) — JUCO (overall: 82)
  { playerId: 'pp-16', season: '2025-26', school: 'Hutchinson CC', level: 'JUCO', gp: 17, mpg: 27.3, ppg: 12.1, rpg: 9.4, apg: 1.0, spg: 0.6, bpg: 3.1, fgPct: 57.2, threePct: 0, ftPct: 66.8, kr: 82 },
  { playerId: 'pp-16', season: '2024-25', school: 'Hutchinson CC', level: 'JUCO', gp: 28, mpg: 26.1, ppg: 10.5, rpg: 8.7, apg: 0.8, spg: 0.5, bpg: 2.8, fgPct: 55.4, threePct: 0, ftPct: 64.2, kr: 76 },
];

/** Returns all seasons for a player, sorted most recent first. */
export function getPlayerSeasons(playerId: string): PlayerSeason[] {
  return PLAYER_SEASONS.filter((s) => s.playerId === playerId).sort((a, b) => b.season.localeCompare(a.season));
}

/** Returns the most recent season for a player, or null if none exist. */
export function getLatestSeason(playerId: string): PlayerSeason | null {
  const seasons = PLAYER_SEASONS.filter((s) => s.playerId === playerId);
  if (seasons.length === 0) return null;
  return seasons.reduce((latest, s) => (s.season > latest.season ? s : latest));
}

/** Returns aggregated career averages across all seasons for a player. */
export function getSeasonTotals(playerId: string): { gp: number; ppg: number; rpg: number; apg: number } | null {
  const seasons = PLAYER_SEASONS.filter((s) => s.playerId === playerId);
  if (seasons.length === 0) return null;
  const totalGp = seasons.reduce((sum, s) => sum + s.gp, 0);
  const weightedPpg = seasons.reduce((sum, s) => sum + s.ppg * s.gp, 0) / totalGp;
  const weightedRpg = seasons.reduce((sum, s) => sum + s.rpg * s.gp, 0) / totalGp;
  const weightedApg = seasons.reduce((sum, s) => sum + s.apg * s.gp, 0) / totalGp;
  return {
    gp: totalGp,
    ppg: Math.round(weightedPpg * 10) / 10,
    rpg: Math.round(weightedRpg * 10) / 10,
    apg: Math.round(weightedApg * 10) / 10,
  };
}
