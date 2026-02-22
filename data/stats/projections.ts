/**
 * Season projection data
 * Line, win probability, totals, simulation confidence
 */

export interface SeasonProjection {
  line: number;        // projected wins
  winPct: number;      // % (0–100)
  projectedTotal: string; // e.g. "18-8"
  simConfidence: number;  // % confidence from sim engine (0–100)
  currentRecord: string;
  gamesRemaining: number;
  projectedSeed: string;
  playoffProbability: number; // %
}

export const SEASON_PROJECTION: SeasonProjection = {
  line: 20,
  winPct: 71.4,
  projectedTotal: '20-8',
  simConfidence: 82,
  currentRecord: '16-8',
  gamesRemaining: 4,
  projectedSeed: '#3 KaNeXT Conference',
  playoffProbability: 88,
};
