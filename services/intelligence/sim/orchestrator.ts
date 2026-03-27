/**
 * Simulation Orchestrator
 * Wires team KR + interaction library → projected game outcome.
 * Source: kanext-basketball-intelligence/04_Simulation_Engine.md
 *
 * Architecture:
 *   1. Load home/away TeamKRResult + rotation archetypes + systems
 *   2. Compute system × system interaction deltas (pace, TO, foul)
 *   3. Compute archetype × system deltas per player slot
 *   4. Adjust KRs by interaction deltas → effectiveKR
 *   5. Apply home advantage (+1.5 KR equivalent)
 *   6. Map KR diff → win probability via logistic curve (k=0.10)
 *   7. Project score from base PPP × pace environment
 *
 * Deterministic: same inputs → same output. No Math.random().
 * Engine version: 'v1_simulation'
 */

import { TeamKRResult } from '../team-kr';
import {
  getSystemSystemEntry,
  getArchetypeDefSystemEntry,
  getArchetypeOffSystemEntry,
} from './interaction-library';

// ── Constants ──

const HOME_ADVANTAGE_KR = 1.5;
const BASE_PPP           = 1.03;   // NCAA D1 HM neutral-site baseline
const POSSESSIONS_40MIN  = 68;     // per-40 baseline; scaled by pace environment
const LOGISTIC_K         = 0.10;   // KR diff sensitivity

// ── Sim Types ──

export type SimType =
  | 'head_to_head'
  | 'transfer_impact'
  | 'lineup_change'
  | 'injury_scenario'
  | 'opponent_scouting'
  | 'recruit_impact'
  | 'system_change'
  | 'what_if'
  | 'tournament_run';

// ── Input Types ──

export interface RotationPlayer {
  id: string;
  archetype: string;           // Must match locked Archetype Library
  minutesPct: number;          // 0–1 (fraction of team minutes)
  kr: number;                  // Overall player KR
  off_kr: number;
  def_kr: number;
}

export interface TeamSimInput {
  teamKR: TeamKRResult;
  rotation: RotationPlayer[];
  offensiveSystem: string;     // Must match OFFENSIVE_SYSTEMS
  defensiveSystem: string;     // Must match DEFENSIVE_SYSTEMS
}

export interface SimInput {
  simType: SimType;
  homeTeam: TeamSimInput;
  awayTeam: TeamSimInput;
  location?: 'home' | 'away' | 'neutral';
  /** Optional KR overrides (e.g. injury_scenario removes a player) */
  overrides?: {
    home?: Partial<TeamSimInput>;
    away?: Partial<TeamSimInput>;
  };
}

// ── Output Types ──

export interface PlayerImpact {
  playerId: string;
  archetype: string;
  krContribution: number;    // How much this player moved the team KR delta
}

export interface SimResult {
  simType: SimType;
  homeWinProbability: number;   // 0–1
  awayWinProbability: number;   // 0–1
  projectedHomeScore: number;   // rounded integer
  projectedAwayScore: number;
  projectedMargin: number;      // home − away
  confidence_pct: number;
  confidenceFlags: string[];
  paceEnvironment: number;      // possessions per 40 min (adjusted)
  /** Top 3 factors driving the outcome */
  drivers: string[];
  playerImpacts: PlayerImpact[];
  engineVersion: 'v1_simulation';
}

// ── Internal Helpers ──

/** Logistic win probability from KR differential (home perspective) */
function krDiffToWinProb(krDiff: number): number {
  return 1 / (1 + Math.exp(-LOGISTIC_K * krDiff));
}

/**
 * Compute the average archetype interaction delta for a team's rotation.
 * Averages across all rotation players weighted by minutesPct.
 *
 * For offense archetypes we look up their vs-defSystem entry (how they fare
 * against the opponent's defense).
 * For defense archetypes we look up their vs-offSystem entry (how they
 * suppress the opponent's offense).
 *
 * Returns net effective KR adjustment for the team's overall KR.
 */
function computeRotationInteractionDelta(
  rotation: RotationPlayer[],
  vsDefSystem: string,
  vsOffSystem: string
): number {
  if (!rotation.length) return 0;

  let totalWeight = 0;
  let weightedDelta = 0;

  for (const player of rotation) {
    const w = player.minutesPct;
    totalWeight += w;

    // Offensive archetype vs opposing defense
    const offEntry = getArchetypeDefSystemEntry(player.archetype, vsDefSystem);
    // Defensive archetype vs opposing offense
    const defEntry = getArchetypeOffSystemEntry(player.archetype, vsOffSystem);

    // effDelta from offense entry: positive = player scores more efficiently
    // effDelta from defense entry: negative = player suppresses opponent better
    const offDelta = offEntry ? offEntry.effDelta * 0.10 : 0;  // scale to KR impact
    const defDelta = defEntry ? defEntry.effDelta * -0.10 : 0; // invert (suppression)

    weightedDelta += w * (offDelta + defDelta);
  }

  return totalWeight > 0 ? weightedDelta / totalWeight : 0;
}

/**
 * Project final score for both teams given effective KRs and pace.
 * Score ≈ BASE_PPP × (1 + krAdjustment/100) × possessions
 */
function projectScore(effectiveKr: number, possessions: number): number {
  const krAdjustment = (effectiveKr - 70) / 100; // 70 = neutral baseline
  const ppp = BASE_PPP * (1 + krAdjustment);
  return Math.round(ppp * possessions);
}

/** Build driver strings from the largest KR contributors */
function buildDrivers(
  sysEntry: ReturnType<typeof getSystemSystemEntry> | null,
  homeKrDiff: number,
  homeRotDelta: number,
  awayRotDelta: number
): string[] {
  const drivers: string[] = [];

  if (sysEntry) {
    if (Math.abs(sysEntry.paceImpact) >= 3) {
      drivers.push(`Pace environment: ${sysEntry.paceImpact > 0 ? 'up-tempo' : 'slow'} matchup (${sysEntry.paceImpact > 0 ? '+' : ''}${sysEntry.paceImpact}% pace)`);
    }
    if (Math.abs(sysEntry.towardsPressure) >= 2) {
      drivers.push(`Turnover pressure: ${sysEntry.towardsPressure > 0 ? 'high' : 'low'} contest (${sysEntry.towardsPressure > 0 ? '+' : ''}${sysEntry.towardsPressure}pp TO rate)`);
    }
  }

  if (Math.abs(homeRotDelta) >= 0.5 || Math.abs(awayRotDelta) >= 0.5) {
    const betterSide = homeRotDelta > awayRotDelta ? 'Home' : 'Away';
    drivers.push(`${betterSide} rotation archetypes better suited to this system matchup`);
  }

  if (Math.abs(homeKrDiff) >= 5) {
    const favored = homeKrDiff > 0 ? 'Home' : 'Away';
    drivers.push(`${favored} team KR advantage (${Math.abs(homeKrDiff).toFixed(1)} KR gap)`);
  }

  if (drivers.length === 0) {
    drivers.push('Even matchup — outcome highly sensitive to execution');
  }

  return drivers.slice(0, 3);
}

// ── Main Simulation Function ──

export function runSimulation(input: SimInput): SimResult {
  const flags: string[] = [];

  // Apply overrides
  const home: TeamSimInput = {
    ...input.homeTeam,
    ...(input.overrides?.home ?? {}),
  };
  const away: TeamSimInput = {
    ...input.awayTeam,
    ...(input.overrides?.away ?? {}),
  };

  // 1. System × System interaction
  const sysEntry = getSystemSystemEntry(home.offensiveSystem, away.defensiveSystem);
  const sysEntryRev = getSystemSystemEntry(away.offensiveSystem, home.defensiveSystem);

  const paceDeltaPct = sysEntry ? sysEntry.paceImpact : 0;
  const paceDeltaRev = sysEntryRev ? sysEntryRev.paceImpact : 0;
  const avgPaceDelta = (paceDeltaPct + paceDeltaRev) / 2;
  const paceEnvironment = POSSESSIONS_40MIN * (1 + avgPaceDelta / 100);

  if (!sysEntry) flags.push('sys_sys_entry_missing');

  // 2. Rotation archetype interaction deltas
  const homeRotDelta = computeRotationInteractionDelta(
    home.rotation,
    away.defensiveSystem,
    away.offensiveSystem
  );
  const awayRotDelta = computeRotationInteractionDelta(
    away.rotation,
    home.defensiveSystem,
    home.offensiveSystem
  );

  if (home.rotation.length === 0) flags.push('home_rotation_empty');
  if (away.rotation.length === 0) flags.push('away_rotation_empty');

  // 3. Effective KRs
  const homeBaseKR = home.teamKR.team_overall_kr;
  const awayBaseKR = away.teamKR.team_overall_kr;

  const homeEffKR = homeBaseKR + homeRotDelta;
  const awayEffKR = awayBaseKR + awayRotDelta;

  // 4. Home advantage
  const isHome   = !input.location || input.location === 'home';
  const isNeutral = input.location === 'neutral';

  const homeAdj = isNeutral ? 0 : (isHome ? HOME_ADVANTAGE_KR : -HOME_ADVANTAGE_KR);

  const homeAdjKR = homeEffKR + homeAdj;
  const awayAdjKR = awayEffKR;

  // 5. Win probability
  const krDiff = homeAdjKR - awayAdjKR;
  const homeWinProb = krDiffToWinProb(krDiff);

  // 6. Project scores
  const projectedHomeScore = projectScore(homeAdjKR, paceEnvironment);
  const projectedAwayScore = projectScore(awayAdjKR, paceEnvironment);
  const projectedMargin = projectedHomeScore - projectedAwayScore;

  // 7. Confidence
  const hasRotations = home.rotation.length > 0 && away.rotation.length > 0;
  const hasSysEntry  = sysEntry !== null && sysEntryRev !== null;
  let confidence = 75;
  if (!hasRotations) { confidence -= 20; flags.push('low_archetype_coverage'); }
  if (!hasSysEntry)  { confidence -= 10; }
  if (home.teamKR.rotation_size < 5) { confidence -= 10; flags.push('small_home_rotation'); }
  if (away.teamKR.rotation_size < 5) { confidence -= 10; flags.push('small_away_rotation'); }

  // 8. Player impacts (top 3 by rotation contribution)
  const allPlayers: PlayerImpact[] = [
    ...home.rotation.map(p => ({
      playerId: p.id,
      archetype: p.archetype,
      krContribution: p.minutesPct * homeRotDelta,
    })),
    ...away.rotation.map(p => ({
      playerId: p.id,
      archetype: p.archetype,
      krContribution: p.minutesPct * awayRotDelta,
    })),
  ].sort((a, b) => Math.abs(b.krContribution) - Math.abs(a.krContribution)).slice(0, 3);

  // 9. Drivers
  const drivers = buildDrivers(sysEntry, krDiff, homeRotDelta, awayRotDelta);

  return {
    simType: input.simType,
    homeWinProbability: Math.round(homeWinProb * 1000) / 1000,
    awayWinProbability: Math.round((1 - homeWinProb) * 1000) / 1000,
    projectedHomeScore,
    projectedAwayScore,
    projectedMargin,
    confidence_pct: Math.max(0, Math.min(100, confidence)),
    confidenceFlags: flags,
    paceEnvironment: Math.round(paceEnvironment * 10) / 10,
    drivers,
    playerImpacts: allPlayers,
    engineVersion: 'v1_simulation',
  };
}
