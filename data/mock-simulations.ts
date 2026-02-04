/**
 * Mock data for simulation results.
 * Provides sample game simulations for the Nexus reasoning surface.
 */

import type {
  SimulationResult,
  SavedSimulation,
  PlayerImpact,
  Position,
} from '@/types';

// =============================================================================
// PLAYER IMPACT DATA
// =============================================================================

const VARSITY_PLAYERS: PlayerImpact[] = [
  {
    playerId: 'player-johnson',
    playerName: 'Marcus Johnson',
    position: 'PG',
    projectedPoints: 18.5,
    projectedRebounds: 3.2,
    projectedAssists: 7.1,
    impactRating: 85,
    keyContribution: 'Floor general, controls tempo',
  },
  {
    playerId: 'player-williams',
    playerName: 'DeShawn Williams',
    position: 'C',
    projectedPoints: 14.0,
    projectedRebounds: 10.2,
    projectedAssists: 1.1,
    impactRating: 72,
    keyContribution: 'Rim protection, rebounding',
  },
  {
    playerId: 'player-harris',
    playerName: 'Kevin Harris',
    position: 'PF',
    projectedPoints: 15.5,
    projectedRebounds: 8.0,
    projectedAssists: 2.0,
    impactRating: 68,
    keyContribution: 'Stretch scoring, double-double threat',
  },
  {
    playerId: 'player-garcia',
    playerName: 'Anthony Garcia',
    position: 'SG',
    projectedPoints: 13.2,
    projectedRebounds: 3.5,
    projectedAssists: 2.3,
    impactRating: 55,
    keyContribution: 'Perimeter shooting, floor spacing',
  },
  {
    playerId: 'player-thompson',
    playerName: 'Jaylen Thompson',
    position: 'SF',
    projectedPoints: 8.0,
    projectedRebounds: 4.5,
    projectedAssists: 1.5,
    impactRating: 42,
    keyContribution: 'Defensive energy, transition',
  },
];

// =============================================================================
// SAMPLE SIMULATIONS
// =============================================================================

export const SAMPLE_SIMULATIONS: SimulationResult[] = [
  {
    id: 'sim-1',
    type: 'single_game',
    matchupText: 'Lincoln vs Northwest Missouri',
    homeTeam: 'Lincoln University',
    awayTeam: 'Northwest Missouri',
    rosterUsed: 'official',
    timestamp: new Date('2026-02-04T14:30:00'),
    winProbability: 64,
    projectedScore: { home: 78, away: 72 },
    projectedMargin: 6,
    projectedTotal: 150,
    confidence: 'high',
    volatility: 'medium',
    drivers: [
      'Home court advantage (+3.2 pts expected)',
      'Lincoln superior in perimeter shooting (41% vs 35%)',
      'Northwest strength in paint scoring could narrow gap',
      'Lincoln 8-2 in last 10 home games',
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
    matchupText: 'Lincoln @ Missouri Western',
    homeTeam: 'Missouri Western',
    awayTeam: 'Lincoln University',
    rosterUsed: 'official',
    timestamp: new Date('2026-02-04T15:00:00'),
    winProbability: 48,
    projectedScore: { home: 74, away: 71 },
    projectedMargin: -3,
    projectedTotal: 145,
    confidence: 'medium',
    volatility: 'high',
    drivers: [
      'Road game disadvantage (-3.8 pts expected)',
      'Missouri Western on 5-game home win streak',
      'Lincoln depth advantage could be factor in 2nd half',
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
    matchupText: 'Lincoln vs Pittsburg State',
    homeTeam: 'Lincoln University',
    awayTeam: 'Pittsburg State',
    rosterUsed: 'sandbox',
    timestamp: new Date('2026-02-04T15:30:00'),
    winProbability: 71,
    projectedScore: { home: 82, away: 74 },
    projectedMargin: 8,
    projectedTotal: 156,
    confidence: 'medium',
    volatility: 'medium',
    drivers: [
      'Sandbox roster includes Jaylen Brooks (projected +5.2 pts)',
      'Enhanced perimeter defense with lineup change',
      'Pittsburg State struggles on the road (4-6 away)',
      'Lincoln motion offense matches well against zone',
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
    savedAt: new Date('2026-02-03T18:45:00'),
    title: 'Northwest Missouri Preview',
  },
];

// =============================================================================
// SIMULATION HELPERS
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
    high: '#198754',
    medium: '#E07C24',
    low: '#DC3545',
  };
  return colors[confidence] || '#6C757D';
}

export function getVolatilityColor(volatility: string): string {
  const colors: Record<string, string> = {
    low: '#198754',
    medium: '#E07C24',
    high: '#DC3545',
  };
  return colors[volatility] || '#6C757D';
}

export function getWinProbabilityColor(winProb: number): string {
  if (winProb >= 65) return '#198754';
  if (winProb >= 50) return '#0D6EFD';
  if (winProb >= 40) return '#E07C24';
  return '#DC3545';
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
  const winProb = Math.floor(Math.random() * 40) + 35; // 35-75%
  const homeScore = Math.floor(Math.random() * 20) + 68; // 68-88
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

/**
 * Detects if a user message is requesting a simulation.
 * Returns the parsed opponent if detected, null otherwise.
 */
export function detectSimulationIntent(message: string): { opponent: string; isSimulation: boolean } {
  const lowerMessage = message.toLowerCase();

  // Simulation trigger keywords
  const triggers = [
    'simulate',
    'simulation',
    'predict',
    'project',
    'what if we play',
    'how would we do against',
    'chances against',
    'odds against',
    'matchup against',
    'run a sim',
    'game against',
  ];

  const hasSimTrigger = triggers.some((t) => lowerMessage.includes(t));

  if (!hasSimTrigger) {
    return { opponent: '', isSimulation: false };
  }

  // Try to extract opponent name
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

  // Default opponents from schedule
  const knownOpponents = [
    'Northwest Missouri',
    'Missouri Western',
    'Pittsburg State',
    'Central Methodist',
    'Simpson College',
  ];

  for (const opp of knownOpponents) {
    if (lowerMessage.includes(opp.toLowerCase())) {
      return { opponent: opp, isSimulation: true };
    }
  }

  return { opponent: 'Opponent', isSimulation: true };
}
