/**
 * Confidence Gates
 * Computes confidence_pct for all intelligence engine outputs.
 * Spec: kanext-basketball-intelligence/INTELLIGENCE_INTEGRATION_SPEC.md §6 Phase 1 #4
 *
 * Three gates: Player, Team, Simulation.
 * Confidence % is transparency metadata — it never changes KR math.
 */

// ── Player Confidence Gate ──

export type DataTier =
  | 'box_score'          // official college stats only
  | 'box_score_multi'    // official stats, multi-year or multi-level
  | 'synergy_1yr'        // 1-year Synergy + official stats
  | 'synergy_multi'      // multi-year Synergy + official stats
  | 'playvision_1yr'     // 1-year PlayVision + official stats
  | 'playvision_multi'   // multi-year PlayVision + official stats
  | 'full';              // KaNeXT-tag granular data

export interface PlayerConfidenceInput {
  /** Data tier available for this evaluation */
  dataTier: DataTier;
  /** Games played in primary season */
  gamesPlayed: number;
  /** Average minutes per game */
  minPerGame: number;
  /** Number of scored (non-null) traits out of total scoreable traits */
  scoredTraits: number;
  totalScoreableTraits: number;
  /** Multi-year data available? */
  hasMultiYear?: boolean;
  /** HS data available in addition to college? */
  hasHsData?: boolean;
}

export interface PlayerConfidenceResult {
  confidence_pct: number;
  mode: 'production_based' | 'full_player_kr';
  flags: string[];
}

/** Base confidence ranges by data tier (from Player Confidence Gate v2) */
const PRODUCTION_BASE_RANGES: Record<DataTier, [number, number]> = {
  box_score:         [75, 82],
  box_score_multi:   [80, 87],
  synergy_1yr:       [85, 92],
  synergy_multi:     [90, 95],
  playvision_1yr:    [85, 92],
  playvision_multi:  [90, 95],
  full:              [90, 95],
};

const FULL_KR_RANGES: Record<DataTier, [number, number]> = {
  box_score:         [30, 45],
  box_score_multi:   [35, 55],
  synergy_1yr:       [65, 80],
  synergy_multi:     [75, 88],
  playvision_1yr:    [65, 80],
  playvision_multi:  [75, 88],
  full:              [80, 95],
};

const PRODUCTION_DATA_TIERS: Set<DataTier> = new Set(['box_score', 'box_score_multi']);

export function computePlayerConfidence(input: PlayerConfidenceInput): PlayerConfidenceResult {
  const mode: 'production_based' | 'full_player_kr' = PRODUCTION_DATA_TIERS.has(input.dataTier)
    ? 'production_based'
    : 'full_player_kr';

  const ranges = mode === 'production_based' ? PRODUCTION_BASE_RANGES : FULL_KR_RANGES;
  const [lo, hi] = ranges[input.dataTier];
  const flags: string[] = [];

  // Base: midpoint of tier range
  let base = (lo + hi) / 2;

  // Adjust for sample size: games played
  // < 5 games: heavy penalty, 5–12: partial, 13–25: full, > 25: slight bonus
  if (input.gamesPlayed < 5) {
    base -= 15;
    flags.push('low_sample_games');
  } else if (input.gamesPlayed < 13) {
    base -= 8;
    flags.push('partial_sample_games');
  } else if (input.gamesPlayed > 25) {
    base += 3;
  }

  // Adjust for minutes: low-minute players have less meaningful data
  if (input.minPerGame < 10) {
    base -= 10;
    flags.push('low_minutes');
  } else if (input.minPerGame < 18) {
    base -= 4;
    flags.push('partial_minutes');
  }

  // Adjust for trait coverage
  const traitCoverage = input.totalScoreableTraits > 0
    ? input.scoredTraits / input.totalScoreableTraits
    : 0;
  if (traitCoverage < 0.4) {
    base -= 12;
    flags.push('low_trait_coverage');
  } else if (traitCoverage < 0.65) {
    base -= 5;
    flags.push('partial_trait_coverage');
  } else if (traitCoverage > 0.85) {
    base += 3;
  }

  // Multi-year bonus
  if (input.hasMultiYear) {
    base += 4;
  }

  // HS data bonus (box_score tier only)
  if (input.hasHsData && PRODUCTION_DATA_TIERS.has(input.dataTier)) {
    base += 3;
  }

  // Clamp to tier range ± 10
  const confidence_pct = Math.round(Math.min(Math.max(base, Math.max(0, lo - 10)), Math.min(100, hi + 10)));

  return { confidence_pct, mode, flags };
}

// ── Team Confidence Gate ──

export interface TeamConfidenceInput {
  /** Number of players with known KRs */
  playersWithKr: number;
  /** Total roster size */
  rosterSize: number;
  /** Minutes coverage: sum of minutes / expected total minutes */
  minutesCoverage: number; // 0–1
  /** Average player confidence across rotation */
  avgPlayerConfidence: number; // 0–100
  /** Players below minimum participation threshold (5%) */
  playersExcluded: number;
}

export interface TeamConfidenceResult {
  confidence_pct: number;
  flags: string[];
}

export function computeTeamConfidence(input: TeamConfidenceInput): TeamConfidenceResult {
  const flags: string[] = [];

  // Roster completeness factor
  const rosterCompleteness = input.rosterSize > 0
    ? input.playersWithKr / input.rosterSize
    : 0;

  let base = input.avgPlayerConfidence * 0.6; // weighted by player confidence

  // Roster coverage
  if (rosterCompleteness < 0.5) {
    base -= 15;
    flags.push('low_roster_coverage');
  } else if (rosterCompleteness < 0.75) {
    base -= 7;
    flags.push('partial_roster_coverage');
  }

  // Minutes coverage
  if (input.minutesCoverage < 0.5) {
    base -= 12;
    flags.push('low_minutes_coverage');
  } else if (input.minutesCoverage < 0.75) {
    base -= 5;
    flags.push('partial_minutes_coverage');
  } else if (input.minutesCoverage > 0.9) {
    base += 5;
  }

  // Players excluded from rotation (below 5% threshold)
  if (input.playersExcluded > 3) {
    base -= 5;
    flags.push('many_excluded_players');
  }

  const confidence_pct = Math.round(Math.min(Math.max(base, 0), 100));
  return { confidence_pct, flags };
}

// ── Simulation Confidence Gate ──

export interface SimConfidenceInput {
  homeTeamConfidence: number;  // 0–100
  awayTeamConfidence: number;  // 0–100
  /** Is away team using inferred system (OSIE/DSIE) vs known system? */
  awaySystemInferred: boolean;
  /** Interaction library coverage: fraction of matchups with entries */
  interactionCoverage: number; // 0–1
  /** Number of rotation players with valid archetypes */
  archetypedPlayers: number;
  totalRotationPlayers: number;
}

export interface SimConfidenceResult {
  confidence_pct: number;
  flags: string[];
}

export function computeSimConfidence(input: SimConfidenceInput): SimConfidenceResult {
  const flags: string[] = [];

  // Base: harmonic mean of team confidences (weaker team constrains output)
  const avgTeamConf = (input.homeTeamConfidence + input.awayTeamConfidence) / 2;
  let base = avgTeamConf * 0.7; // sim confidence is capped below team confidence

  // Away system inference penalty
  if (input.awaySystemInferred) {
    base -= 8;
    flags.push('away_system_inferred');
  }

  // Interaction library coverage
  if (input.interactionCoverage < 0.5) {
    base -= 15;
    flags.push('low_interaction_coverage');
  } else if (input.interactionCoverage < 0.8) {
    base -= 7;
    flags.push('partial_interaction_coverage');
  }

  // Archetype coverage
  const archetypeCoverage = input.totalRotationPlayers > 0
    ? input.archetypedPlayers / input.totalRotationPlayers
    : 0;
  if (archetypeCoverage < 0.5) {
    base -= 10;
    flags.push('low_archetype_coverage');
  } else if (archetypeCoverage < 0.8) {
    base -= 4;
    flags.push('partial_archetype_coverage');
  }

  const confidence_pct = Math.round(Math.min(Math.max(base, 0), 100));
  return { confidence_pct, flags };
}
