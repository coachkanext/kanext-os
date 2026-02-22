/**
 * Mock data for simulation results — v2.
 * Expanded to cover 9 sim types with KaNeXT data.
 * All original exports preserved for backward compatibility.
 */

import type {
  SimulationResult,
  SavedSimulation,
  PlayerImpact,
  Position,
} from '@/types';
import type { SimType, SimTypeCard, SimRun, ConfidenceGate } from '@/components/simulation/simulation-types';

// =============================================================================
// PLAYER IMPACT DATA (KaNeXT roster)
// =============================================================================

const VARSITY_PLAYERS: PlayerImpact[] = [
  {
    playerId: 'player-williams',
    playerName: 'Marcus Reed',
    position: 'PG',
    projectedPoints: 18.5,
    projectedRebounds: 3.2,
    projectedAssists: 7.1,
    impactRating: 85,
    keyContribution: 'Floor general, controls tempo',
  },
  {
    playerId: 'player-kalejaiye',
    playerName: 'Devon Carter',
    position: 'B',
    projectedPoints: 14.0,
    projectedRebounds: 10.2,
    projectedAssists: 1.1,
    impactRating: 72,
    keyContribution: 'Rim protection, rebounding',
  },
  {
    playerId: 'player-diomande',
    playerName: 'Paul Diomande',
    position: 'F',
    projectedPoints: 15.5,
    projectedRebounds: 8.0,
    projectedAssists: 2.0,
    impactRating: 68,
    keyContribution: 'Stretch scoring, double-double threat',
  },
  {
    playerId: 'player-hernandez',
    playerName: 'Jordan Blake',
    position: 'CG',
    projectedPoints: 13.2,
    projectedRebounds: 3.5,
    projectedAssists: 2.3,
    impactRating: 55,
    keyContribution: 'Perimeter shooting, floor spacing',
  },
  {
    playerId: 'player-chtelan',
    playerName: 'Tyler Quinn',
    position: 'W',
    projectedPoints: 8.0,
    projectedRebounds: 4.5,
    projectedAssists: 1.5,
    impactRating: 42,
    keyContribution: 'Defensive energy, transition',
  },
];

// =============================================================================
// SAMPLE SIMULATIONS (KaNeXT data)
// =============================================================================

export const SAMPLE_SIMULATIONS: SimulationResult[] = [
  {
    id: 'sim-1',
    type: 'single_game',
    matchupText: 'KaNeXT vs Pinecrest University',
    homeTeam: 'KaNeXT Sports',
    awayTeam: 'Pinecrest University',
    rosterUsed: 'official',
    timestamp: new Date('2026-02-19T14:30:00'),
    winProbability: 64,
    projectedScore: { home: 78, away: 72 },
    projectedMargin: 6,
    projectedTotal: 150,
    confidence: 'high',
    volatility: 'medium',
    drivers: [
      'Home court advantage (+3.2 pts expected)',
      'KaNeXT superior in perimeter shooting (41% vs 35%)',
      'Pinecrest strength in paint scoring could narrow gap',
      'KaNeXT 8-2 in last 10 home games',
    ],
    playerImpact: VARSITY_PLAYERS,
    boxScoreProjection: {
      teamStats: {
        points: 78,
        rebounds: 38,
        assists: 17,
        steals: 7,
        blocks: 4,
        turnovers: 11,
        fgPct: 46.5,
        threePct: 37.2,
        ftPct: 78.5,
      },
      playerStats: VARSITY_PLAYERS,
    },
  },
  {
    id: 'sim-2',
    type: 'single_game',
    matchupText: 'KaNeXT @ Southeastern',
    homeTeam: 'Summit University',
    awayTeam: 'KaNeXT Sports',
    rosterUsed: 'official',
    timestamp: new Date('2026-02-19T15:00:00'),
    winProbability: 48,
    projectedScore: { home: 74, away: 71 },
    projectedMargin: -3,
    projectedTotal: 145,
    confidence: 'medium',
    volatility: 'high',
    drivers: [
      'Road game disadvantage (-3.8 pts expected)',
      'Southeastern on 5-game home win streak',
      'KaNeXT depth advantage could be factor in 2nd half',
      'Matchup concerns at the 4 position',
    ],
    playerImpact: VARSITY_PLAYERS.map((p) => ({
      ...p,
      projectedPoints: p.projectedPoints * 0.92,
      impactRating: p.impactRating - 8,
    })),
  },
  {
    id: 'sim-3',
    type: 'single_game',
    matchupText: 'KaNeXT vs Clearwater',
    homeTeam: 'KaNeXT Sports',
    awayTeam: 'Clearwater University',
    rosterUsed: 'sandbox',
    timestamp: new Date('2026-02-19T15:30:00'),
    winProbability: 71,
    projectedScore: { home: 82, away: 74 },
    projectedMargin: 8,
    projectedTotal: 156,
    confidence: 'medium',
    volatility: 'medium',
    drivers: [
      'Sandbox roster includes Jaylen Brooks (projected +5.2 pts)',
      'Enhanced perimeter defense with lineup change',
      'Clearwater struggles on the road (4-6 away)',
      'KaNeXT motion offense matches well against zone',
    ],
    playerImpact: [
      {
        playerId: 'np-jaylen-brooks',
        playerName: 'Jaylen Brooks',
        position: 'PG',
        projectedPoints: 16.5,
        projectedRebounds: 3.0,
        projectedAssists: 6.5,
        impactRating: 78,
        keyContribution: 'Playmaking upgrade, improved ball security',
      },
      ...VARSITY_PLAYERS.slice(1),
    ],
  },
];

// =============================================================================
// SAVED SIMULATIONS
// =============================================================================

export const SAVED_SIMULATIONS: SavedSimulation[] = [
  {
    ...SAMPLE_SIMULATIONS[0],
    threadId: 'thread-sim-1',
    savedAt: new Date('2026-02-18T18:45:00'),
    title: 'Pinecrest Preview — Base',
  },
  {
    ...SAMPLE_SIMULATIONS[2],
    threadId: 'thread-sim-3',
    savedAt: new Date('2026-02-18T19:00:00'),
    title: 'Clearwater Preview — Sandbox',
  },
];

// =============================================================================
// 9 SIM TYPE CARDS
// =============================================================================

export const SIM_TYPE_CARDS: SimTypeCard[] = [
  { id: 'game', name: 'Game Sim', icon: 'sportscourt.fill', description: 'Full game simulation vs opponent', color: '#1D9BF0' },
  { id: 'segment', name: 'Segment Sim', icon: 'clock.fill', description: 'Simulate specific game windows', color: '#1D9BF0' },
  { id: 'end-game', name: 'End-Game', icon: 'timer', description: 'Late-game decision tree', color: '#EF4444' },
  { id: 'system-sweep', name: 'System Sweep', icon: 'gearshape.2.fill', description: 'Test OSIE/DSIE combos', color: '#F59E0B' },
  { id: 'lineup-sandbox', name: 'Lineup Sandbox', icon: 'person.3.fill', description: 'Compare lineup combinations', color: '#22C55E' },
  { id: 'season', name: 'Season Sim', icon: 'calendar', description: 'Project remaining schedule', color: '#FFFFFF' },
  { id: 'conference-postseason', name: 'Conf / Postseason', icon: 'trophy.fill', description: 'Bracket paths & championship odds', color: '#1D9BF0' },
  { id: 'counterfactual-roster', name: 'Counterfactual', icon: 'person.badge.plus', description: 'What-if roster changes', color: '#1D9BF0' },
  { id: 'practice-transfer', name: 'Practice Transfer', icon: 'arrow.triangle.swap', description: 'Execution constraints impact', color: '#1D9BF0' },
];

// =============================================================================
// SAMPLE SIM RUNS (for home dashboard + comparison)
// =============================================================================

export const RECENT_SIM_RUNS: SimRun[] = [
  {
    id: 'run-1',
    simType: 'game',
    title: 'KaNeXT vs Pinecrest — Base',
    timestamp: new Date('2026-02-18T18:45:00'),
    winProbability: 64,
    projectedScore: { home: 78, away: 72 },
    projectedMargin: 6,
    confidence: 82,
    confidenceGate: {
      percentage: 82,
      label: 'High',
      factors: [
        { name: 'Sample size', impact: 'positive', weight: 0.3 },
        { name: 'Home court data', impact: 'positive', weight: 0.25 },
        { name: 'Injury uncertainty', impact: 'neutral', weight: 0.15 },
        { name: 'Opponent form', impact: 'positive', weight: 0.3 },
      ],
    },
    drivers: ['Home court +3.2 pts', 'Perimeter shooting edge', 'Rebounding advantage'],
    isSaved: true,
  },
  {
    id: 'run-2',
    simType: 'game',
    title: 'KaNeXT @ Southeastern',
    timestamp: new Date('2026-02-18T19:10:00'),
    winProbability: 48,
    projectedScore: { home: 74, away: 71 },
    projectedMargin: -3,
    confidence: 68,
    confidenceGate: {
      percentage: 68,
      label: 'Medium',
      factors: [
        { name: 'Sample size', impact: 'positive', weight: 0.3 },
        { name: 'Road game variance', impact: 'negative', weight: 0.25 },
        { name: 'SEU hot streak', impact: 'negative', weight: 0.2 },
        { name: 'Depth factor', impact: 'positive', weight: 0.25 },
      ],
    },
    drivers: ['Road disadvantage -3.8', 'SEU home streak', 'KaNeXT depth 2nd half'],
    isSaved: true,
  },
  {
    id: 'run-3',
    simType: 'season',
    title: 'Season Projection — Current Roster',
    timestamp: new Date('2026-02-17T10:00:00'),
    winProbability: 72,
    projectedScore: { home: 0, away: 0 },
    projectedMargin: 0,
    confidence: 75,
    confidenceGate: {
      percentage: 75,
      label: 'High',
      factors: [
        { name: 'Games remaining sample', impact: 'neutral', weight: 0.3 },
        { name: 'Strength of schedule', impact: 'positive', weight: 0.3 },
        { name: 'Roster stability', impact: 'positive', weight: 0.2 },
        { name: 'Injury risk', impact: 'neutral', weight: 0.2 },
      ],
    },
    drivers: ['Projected 20-8 finish', '72% conf tournament probability', '3rd seed likely'],
    isSaved: false,
  },
  {
    id: 'run-4',
    simType: 'lineup-sandbox',
    title: 'Small Ball vs Traditional',
    timestamp: new Date('2026-02-16T14:30:00'),
    winProbability: 58,
    projectedScore: { home: 80, away: 75 },
    projectedMargin: 5,
    confidence: 62,
    confidenceGate: {
      percentage: 62,
      label: 'Medium',
      factors: [
        { name: 'Lineup sample size', impact: 'negative', weight: 0.35 },
        { name: 'Matchup data', impact: 'neutral', weight: 0.25 },
        { name: 'Small ball history', impact: 'positive', weight: 0.2 },
        { name: 'Opponent adaptability', impact: 'neutral', weight: 0.2 },
      ],
    },
    drivers: ['Small ball +2.3 pace advantage', 'Spacing benefits outweigh rebounding loss', '4Q leverage'],
    isSaved: true,
  },
];

// =============================================================================
// SUN CONFERENCE OPPONENTS (for scenario builder)
// =============================================================================

export const SUN_CONFERENCE_OPPONENTS = [
  'Pinecrest University', 'Summit', 'Lakewood', 'Clearwater',
  'Westfield', 'Ridgemont', 'Magnolia University', 'Johnson University',
  'Bayshore', 'Point University',
];

// =============================================================================
// SEASON SIM DATA
// =============================================================================

export const SEASON_SIM = {
  expectedWins: 20,
  expectedLosses: 8,
  currentRecord: '18-8',
  gamesRemaining: 2,
  playoffProbability: 88,
  confTournamentSeed: 3,
  mustWinGames: ['vs Pinecrest University'],
  finishDistribution: [
    { wins: 18, probability: 8 },
    { wins: 19, probability: 22 },
    { wins: 20, probability: 42 },
    { wins: 21, probability: 20 },
    { wins: 22, probability: 8 },
  ],
};

// =============================================================================
// CONFERENCE / POSTSEASON
// =============================================================================

export const CONFERENCE_POSTSEASON = {
  championshipOdds: 18,
  semiFinalOdds: 42,
  quarterFinalOdds: 88,
  bracketPaths: [
    { round: 'Quarterfinal', opponent: 'Magnolia University', winProb: 78, seed: '3 vs 6' },
    { round: 'Semifinal', opponent: 'Lakewood / Clearwater', winProb: 55, seed: '3 vs 2/7' },
    { round: 'Championship', opponent: 'Summit', winProb: 42, seed: '3 vs 1' },
  ],
};

// =============================================================================
// SIMULATION HELPERS (all original exports preserved)
// =============================================================================

export function getSimulationById(id: string): SimulationResult | undefined {
  return SAMPLE_SIMULATIONS.find((s) => s.id === id);
}

export function getSavedSimulations(): SavedSimulation[] {
  return SAVED_SIMULATIONS;
}

export function getConfidenceLabel(confidence: string): string {
  const labels: Record<string, string> = {
    high: 'High Confidence',
    medium: 'Medium Confidence',
    low: 'Low Confidence',
  };
  return labels[confidence] || confidence;
}

export function getVolatilityLabel(volatility: string): string {
  const labels: Record<string, string> = {
    low: 'Low Volatility',
    medium: 'Medium Volatility',
    high: 'High Volatility',
  };
  return labels[volatility] || volatility;
}

export function getConfidenceColor(confidence: string): string {
  const colors: Record<string, string> = {
    high: '#FFFFFF',
    medium: '#A1A1AA',
    low: '#52525B',
  };
  return colors[confidence] || '#A1A1AA';
}

export function getVolatilityColor(volatility: string): string {
  const colors: Record<string, string> = {
    low: '#FFFFFF',
    medium: '#A1A1AA',
    high: '#52525B',
  };
  return colors[volatility] || '#A1A1AA';
}

export function getWinProbabilityColor(winProb: number): string {
  if (winProb >= 65) return '#FFFFFF';
  if (winProb >= 50) return '#A1A1AA';
  if (winProb >= 40) return '#A1A1AA';
  return '#52525B';
}

export function formatMargin(margin: number): string {
  if (margin > 0) return `+${margin}`;
  return margin.toString();
}

export function generateMockSimulation(
  homeTeam: string,
  awayTeam: string,
  rosterType: 'official' | 'sandbox' = 'official'
): SimulationResult {
  const winProb = Math.floor(Math.random() * 40) + 35;
  const homeScore = Math.floor(Math.random() * 20) + 68;
  const margin = Math.floor((winProb - 50) / 3);
  const awayScore = homeScore - margin;

  return {
    id: `sim-${Date.now()}`,
    type: 'single_game',
    matchupText: `${homeTeam} vs ${awayTeam}`,
    homeTeam,
    awayTeam,
    rosterUsed: rosterType,
    timestamp: new Date(),
    winProbability: winProb,
    projectedScore: { home: homeScore, away: awayScore },
    projectedMargin: margin,
    projectedTotal: homeScore + awayScore,
    confidence: winProb > 60 ? 'high' : winProb > 45 ? 'medium' : 'low',
    volatility: Math.abs(margin) < 4 ? 'high' : Math.abs(margin) < 8 ? 'medium' : 'low',
    drivers: [
      'Home court advantage affects projected outcome',
      'Recent form and momentum considered',
      'Head-to-head history factored in',
      'Roster composition and depth analyzed',
    ],
    playerImpact: VARSITY_PLAYERS.map((p) => ({
      ...p,
      projectedPoints: p.projectedPoints * (0.85 + Math.random() * 0.3),
      impactRating: Math.floor(p.impactRating * (0.85 + Math.random() * 0.3)),
    })),
  };
}

export function detectSimulationIntent(message: string): { opponent: string; isSimulation: boolean } {
  const lowerMessage = message.toLowerCase();

  const triggers = [
    'simulate', 'simulation', 'predict', 'project',
    'what if we play', 'how would we do against',
    'chances against', 'odds against', 'matchup against',
    'run a sim', 'game against',
  ];

  const hasSimTrigger = triggers.some((t) => lowerMessage.includes(t));

  if (!hasSimTrigger) {
    return { opponent: '', isSimulation: false };
  }

  const opponentPatterns = [
    /against\s+([A-Za-z\s]+?)(?:\?|$|\.)/i,
    /vs\.?\s+([A-Za-z\s]+?)(?:\?|$|\.)/i,
    /play\s+([A-Za-z\s]+?)(?:\?|$|\.)/i,
    /simulate\s+([A-Za-z\s]+?)(?:\?|$|\.)/i,
  ];

  for (const pattern of opponentPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return { opponent: match[1].trim(), isSimulation: true };
    }
  }

  for (const opp of SUN_CONFERENCE_OPPONENTS) {
    if (lowerMessage.includes(opp.toLowerCase())) {
      return { opponent: opp, isSimulation: true };
    }
  }

  return { opponent: 'Opponent', isSimulation: true };
}
