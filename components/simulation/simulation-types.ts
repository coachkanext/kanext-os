/**
 * Type definitions for the Simulation v2 system.
 * 9 sim types, scenario builder, comparison, confidence gates.
 */

export type SimType =
  | 'game'
  | 'segment'
  | 'end-game'
  | 'system-sweep'
  | 'lineup-sandbox'
  | 'season'
  | 'conference-postseason'
  | 'counterfactual-roster'
  | 'practice-transfer';

export interface SimTypeCard {
  id: SimType;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export type SimLocation = 'home' | 'away' | 'neutral';

export interface ScenarioConfig {
  simType: SimType | null;
  opponent: string;
  location: SimLocation;
  rosterSelection: 'official' | 'sandbox';
  overrides: SimOverrides;
  seeds: number;
  replications: 'quick' | 'standard' | 'deep';
}

export interface SimOverrides {
  availability: string[];
  minutesCaps: { playerId: string; cap: number }[];
  systemEmphasis: string;
  tempo: 'push' | 'moderate' | 'controlled';
}

export interface SimRun {
  id: string;
  simType: SimType;
  title: string;
  timestamp: Date;
  winProbability: number;
  projectedScore: { home: number; away: number };
  projectedMargin: number;
  confidence: number;
  confidenceGate: ConfidenceGate;
  drivers: string[];
  isSaved: boolean;
}

export interface ConfidenceGate {
  percentage: number;
  label: string;
  factors: { name: string; impact: 'positive' | 'neutral' | 'negative'; weight: number }[];
}

export interface ComparisonSlot {
  run: SimRun;
  deltaWin?: number;
  deltaMargin?: number;
}
