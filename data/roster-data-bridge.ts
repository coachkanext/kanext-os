/**
 * Roster Data Bridge — Mock-mode fallback
 *
 * Extracts the buildRosterPlayers() + toPlayerCardData() logic that was inline
 * in roster-page.tsx so hooks can reuse it for the mock fallback path.
 */

import {
  players,
  rosterEntries,
} from '@/data/sun-conference/florida-memorial';
import { ROSTER_KR, KaNeXT_LEADERS, jerseyArchetypeMap } from '@/data/fmu';
import {
  PLAYER_CLUSTERS,
  PLAYER_PHYSICALS,
  ROSTER_META,
  computeOffKR,
  computeDefKR,
} from '@/data/roster-data';
import type { PlayerStatus } from '@/data/roster-data';
import type { PlayerCardData } from '@/utils/global-entity-sheets';

// ── RosterPlayer type (shared between roster-page and hooks) ──

export interface RosterPlayer {
  playerId: string;
  jerseyNumber: string;
  displayJersey: string;
  firstName: string;
  lastName: string;
  position: string;
  height: string;
  weight: number;
  classYear: string;
  status: PlayerStatus;
  nil: number;
  aidPct: number;
  notes: string;
  flagged: boolean;
  scores: {
    overallKR: number;
    shooting: number;
    finishing: number;
    playmaking: number;
    onBallDefense: number;
    teamDefense: number;
    rebounding: number;
    frame: number;
  };
  // CRM fields (used by roster-crm-list)
  listPos: string;
  role: string;
  ppg: number;
  rpg: number;
  apg: number;
  kr: number;
  usage: number;
  minutes: number;
}

// ── Depth chart types ──

export type DepthSlot = 'PG' | 'CG' | 'Wing' | 'Forward' | 'Big';
export type RotationGroup = 'Guards' | 'Wings' | 'Frontcourt';
export type UnitName = 'Small' | 'Standard' | 'Big';

export interface DepthEntry {
  jersey: string;
  slot: DepthSlot;
}

export interface RotationEntry {
  jersey: string;
  group: RotationGroup;
}

export interface UnitEntry {
  name: UnitName;
  jerseys: string[];
}

export interface DepthChartData {
  starters: DepthEntry[];
  rotation: RotationEntry[];
  units: UnitEntry[];
  status: 'PROVISIONAL' | 'LOCKED';
}

// ── Normalizers ──

function normClass(c: string | null): string {
  if (!c) return '—';
  const low = c.toLowerCase().replace(/\./g, '').trim();
  if (low === 'freshman' || low === 'fr') return 'Fr.';
  if (low === 'sophomore' || low === 'so') return 'So.';
  if (low === 'junior' || low === 'jr') return 'Jr.';
  if (low === 'senior' || low === 'sr') return 'Sr.';
  if (low === 'graduate student' || low === 'gr' || low === 'graduate') return 'Gr.';
  if (low.startsWith('r-')) return 'R-' + normClass(low.slice(2));
  return c;
}

function normJersey(j: string | null): string {
  if (!j) return '0';
  const n = parseInt(j, 10);
  return isNaN(n) ? j : String(n);
}

// ── Position → list position mapping ──

function toListPos(pos: string): string {
  const p = pos.toUpperCase();
  if (p === 'PG') return 'PG';
  if (p === 'SG' || p === 'CG') return 'CG';
  if (p === 'SF' || p === 'G/F' || p === 'W') return 'W';
  if (p === 'PF' || p === 'F') return 'F';
  if (p === 'C' || p === 'F/C') return 'B';
  return 'W';
}

// ── Starter jerseys (for role assignment) ──

const STARTER_JERSEYS = new Set(['11', '4', '13', '41', '5']);

// ── Build roster from mock data ──

const playerNameMap = new Map(players.map(p => [p.player_id, p.full_name]));
const leadersByJersey = new Map(KaNeXT_LEADERS.map(l => [l.number, l]));

export function buildMockRosterPlayers(): RosterPlayer[] {
  return rosterEntries
    .filter(r => r.season === '2025-26' && r.jersey_number != null && r.class_year != null)
    .map(r => {
      const jersey = normJersey(r.jersey_number);
      const fullName = playerNameMap.get(r.player_id) ?? 'Unknown';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] ?? '';
      const lastName = nameParts.slice(1).join(' ') || firstName;

      const clusters = PLAYER_CLUSTERS[jersey];
      const physicals = PLAYER_PHYSICALS[jersey];
      const meta = ROSTER_META[jersey];
      const kr = ROSTER_KR[jersey];
      const stats = leadersByJersey.get(jersey);
      const pos = r.position ?? '—';

      return {
        playerId: r.player_id,
        jerseyNumber: jersey,
        displayJersey: r.jersey_number ?? '0',
        firstName,
        lastName,
        position: pos,
        height: physicals?.height ?? r.height ?? '—',
        weight: physicals?.weight ?? r.weight ?? 0,
        classYear: normClass(r.class_year),
        status: meta?.status ?? 'available',
        nil: meta?.nilAmount ?? 0,
        aidPct: meta?.aidPct ?? 0,
        notes: meta?.rosterNotes ?? '',
        flagged: meta?.flagged ?? false,
        scores: {
          overallKR: kr ?? 0,
          shooting: clusters?.shooting ?? 0,
          finishing: clusters?.finishing ?? 0,
          playmaking: clusters?.playmaking ?? 0,
          onBallDefense: clusters?.on_ball_defense ?? 0,
          teamDefense: clusters?.team_defense ?? 0,
          rebounding: clusters?.rebounding ?? 0,
          frame: clusters?.physical ?? 0,
        },
        // CRM fields
        listPos: toListPos(pos),
        role: STARTER_JERSEYS.has(jersey) ? 'starter' : 'rotation',
        ppg: stats?.ppg ?? 0,
        rpg: stats?.rpg ?? 0,
        apg: stats?.apg ?? 0,
        kr: kr ?? 0,
        usage: 0,
        minutes: stats?.minutes ?? 0,
      };
    });
}

// ── Convert RosterPlayer to PlayerCardData for entity sheet ──

export function toPlayerCardData(p: RosterPlayer): PlayerCardData {
  const clusters = PLAYER_CLUSTERS[p.jerseyNumber];
  const offKR = clusters ? computeOffKR(clusters) : undefined;
  const defKR = clusters ? computeDefKR(clusters) : undefined;
  const stats = leadersByJersey.get(p.jerseyNumber);
  return {
    name: `${p.firstName} ${p.lastName}`,
    number: p.displayJersey,
    position: p.position,
    height: p.height,
    weight: p.weight,
    classYear: p.classYear,
    playerId: p.playerId,
    kr: p.scores.overallKR || undefined,
    offKR,
    defKR,
    archetype: jerseyArchetypeMap.get(p.jerseyNumber),
    nilAmount: p.nil || undefined,
    clusters: clusters ? {
      shooting: clusters.shooting,
      finishing: clusters.finishing,
      playmaking: clusters.playmaking,
      onBallDefense: clusters.on_ball_defense,
      teamDefense: clusters.team_defense,
      rebounding: clusters.rebounding,
      frame: clusters.physical,
    } : undefined,
    ppg: stats?.ppg,
    rpg: stats?.rpg,
    apg: stats?.apg,
    spg: stats?.spg,
    bpg: stats?.bpg,
    fgPct: stats?.fgPct,
    threePct: stats?.threePct,
    ftPct: stats?.ftPct,
    gp: stats?.gamesPlayed,
  };
}

// ── Mock depth chart data ──

export function buildMockDepthChart(): DepthChartData {
  return {
    starters: [
      { jersey: '11', slot: 'PG' },
      { jersey: '4',  slot: 'CG' },
      { jersey: '13', slot: 'Wing' },
      { jersey: '41', slot: 'Forward' },
      { jersey: '5',  slot: 'Big' },
    ],
    rotation: [
      { jersey: '15', group: 'Guards' },
      { jersey: '9',  group: 'Guards' },
      { jersey: '0',  group: 'Wings' },
      { jersey: '55', group: 'Wings' },
      { jersey: '22', group: 'Wings' },
      { jersey: '7',  group: 'Frontcourt' },
      { jersey: '1',  group: 'Frontcourt' },
      { jersey: '3',  group: 'Frontcourt' },
    ],
    units: [
      { name: 'Small',    jerseys: ['11', '4', '13', '55', '41'] },
      { name: 'Standard', jerseys: ['11', '4', '13', '41', '5'] },
      { name: 'Big',      jerseys: ['11', '4', '41', '5', '7'] },
    ],
    status: 'PROVISIONAL',
  };
}
