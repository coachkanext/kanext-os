/**
 * Game Ops (Statkeeping) Screen
 * In-game statkeeping for basketball — log events with 1-2 taps.
 *
 * Phases: active → locked
 * Entry: Nexus Game Ops conversation → "Start Game" navigates here with params
 */

import React, { useReducer, useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MOCK_ROSTER, type RosterPlayer } from '@/data/mock-roster';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type EventType =
  | 'fg2_make' | 'fg2_miss' | 'fg3_make' | 'fg3_miss'
  | 'ft_make' | 'ft_miss'
  | 'reb_off' | 'reb_def'
  | 'ast' | 'stl' | 'blk' | 'to'
  | 'foul_personal' | 'foul_team'
  | 'sub_in' | 'sub_out'
  | 'timeout_us' | 'timeout_opp'
  | 'period_start' | 'period_end' | 'game_end';

interface GameEvent {
  id: string;
  ts: number;
  playerId?: string;
  playerName?: string;
  team: 'LU' | 'OPP';
  type: EventType;
  points?: number;
  clockAt: number;
  period: number;
}

type PeriodFormat = 'halves' | 'quarters';

interface NexusSnapshot {
  id: string;
  ts: number;
  clockAt: number;
  period: number;
  luScore: number;
  oppScore: number;
  onCourt: string[];
  lastEvents: GameEvent[];
}

interface LiveOpsDefaults {
  league: string;
  periodFormat: PeriodFormat;
  periodLength: number;
  timeouts30s: number;
  timeoutsFull: number;
}

interface LiveOpsState {
  gameId: string;
  phase: 'setup' | 'active' | 'locked';
  league: string;
  periodFormat: PeriodFormat;
  periodLength: number;         // seconds per period
  period: number;
  clockSeconds: number;
  clockRunning: boolean;
  luScore: number;
  oppScore: number;
  luStarters: string[];         // 5 LU player IDs
  oppStarters: string[];        // 5 OPP player IDs
  onCourt: string[];            // LU on court
  selectedPlayerId: string | null;
  events: GameEvent[];
  nexusSnapshots: NexusSnapshot[];
  timeouts30s: number;
  timeoutsFull: number;
}

type LiveOpsAction =
  | { type: 'LOAD_STATE'; payload: LiveOpsState }
  | { type: 'TOGGLE_LU_STARTER'; payload: string }
  | { type: 'TOGGLE_OPP_STARTER'; payload: string }
  | { type: 'SET_PERIOD_FORMAT'; payload: PeriodFormat }
  | { type: 'SET_PERIOD_LENGTH'; payload: number }
  | { type: 'SET_TIMEOUTS_30S'; payload: number }
  | { type: 'SET_TIMEOUTS_FULL'; payload: number }
  | { type: 'START_GAME' }
  | { type: 'TICK' }
  | { type: 'TOGGLE_CLOCK' }
  | { type: 'SELECT_PLAYER'; payload: string }
  | { type: 'LOG_EVENT'; payload: GameEvent }
  | { type: 'UNDO' }
  | { type: 'SUB'; payload: { outId: string; inId: string } }
  | { type: 'LOG_TIMEOUT'; payload: { team: 'LU' | 'OPP' } }
  | { type: 'END_PERIOD' }
  | { type: 'START_NEXT_PERIOD' }
  | { type: 'END_GAME' }
  | { type: 'RESTART' }
  | { type: 'SET_LEAGUE'; payload: string }
  | { type: 'APPLY_DEFAULTS'; payload: LiveOpsDefaults };

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const SCORING_POINTS: Partial<Record<EventType, number>> = {
  fg2_make: 2,
  fg3_make: 3,
  ft_make: 1,
};

const PERIOD_LENGTH_OPTIONS = [
  { label: '10:00', seconds: 600 },
  { label: '12:00', seconds: 720 },
  { label: '15:00', seconds: 900 },
  { label: '20:00', seconds: 1200 },
];

const LU_ACTION_BUTTONS: { label: string; type: EventType }[] = [
  { label: '2PT Made', type: 'fg2_make' },
  { label: '2PT Miss', type: 'fg2_miss' },
  { label: '3PT Made', type: 'fg3_make' },
  { label: '3PT Miss', type: 'fg3_miss' },
  { label: 'FT Made', type: 'ft_make' },
  { label: 'FT Miss', type: 'ft_miss' },
  { label: 'Off Reb', type: 'reb_off' },
  { label: 'Def Reb', type: 'reb_def' },
  { label: 'Assist', type: 'ast' },
  { label: 'Steal', type: 'stl' },
  { label: 'Block', type: 'blk' },
  { label: 'Turnover', type: 'to' },
  { label: 'Pers Foul', type: 'foul_personal' },
  { label: 'Team Foul', type: 'foul_team' },
];

const OPP_BUTTONS: { label: string; points: number; type: EventType }[] = [
  { label: 'OPP +2', points: 2, type: 'fg2_make' },
  { label: 'OPP +3', points: 3, type: 'fg3_make' },
  { label: 'OPP +1', points: 1, type: 'ft_make' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK OPPONENT ROSTER (per-game)
// ═══════════════════════════════════════════════════════════════════════════════

interface OppPlayer { id: string; name: string; number: string }

const OPP_ROSTERS: Record<string, OppPlayer[]> = {
  'live-1': [
    { id: 'opp-1', name: 'M. Thomas', number: '11' },
    { id: 'opp-2', name: 'J. Claro', number: '3' },
    { id: 'opp-3', name: 'D. Reed', number: '22' },
    { id: 'opp-4', name: 'K. Blake', number: '34' },
    { id: 'opp-5', name: 'A. Porter', number: '50' },
    { id: 'opp-6', name: 'T. Wright', number: '5' },
    { id: 'opp-7', name: 'R. Hayes', number: '12' },
    { id: 'opp-8', name: 'C. Foster', number: '24' },
    { id: 'opp-9', name: 'L. Grant', number: '15' },
    { id: 'opp-10', name: 'B. Murray', number: '2' },
    { id: 'opp-11', name: 'J. Odom', number: '44' },
    { id: 'opp-12', name: 'N. Patel', number: '10' },
  ],
};

// Default opponent roster for games without specific data
const DEFAULT_OPP_ROSTER: OppPlayer[] = [
  { id: 'opp-1', name: 'Player 1', number: '1' },
  { id: 'opp-2', name: 'Player 2', number: '2' },
  { id: 'opp-3', name: 'Player 3', number: '3' },
  { id: 'opp-4', name: 'Player 4', number: '4' },
  { id: 'opp-5', name: 'Player 5', number: '5' },
  { id: 'opp-6', name: 'Player 11', number: '11' },
  { id: 'opp-7', name: 'Player 12', number: '12' },
  { id: 'opp-8', name: 'Player 15', number: '15' },
  { id: 'opp-9', name: 'Player 20', number: '20' },
  { id: 'opp-10', name: 'Player 21', number: '21' },
  { id: 'opp-11', name: 'Player 23', number: '23' },
  { id: 'opp-12', name: 'Player 30', number: '30' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// REDUCER
// ═══════════════════════════════════════════════════════════════════════════════

function createInitialState(gameId: string): LiveOpsState {
  return {
    gameId,
    phase: 'setup',
    league: '',
    periodFormat: 'halves',
    periodLength: 1200,
    period: 1,
    clockSeconds: 1200,
    clockRunning: false,
    luScore: 0,
    oppScore: 0,
    luStarters: [],
    oppStarters: [],
    onCourt: [],
    selectedPlayerId: null,
    events: [],
    nexusSnapshots: [],
    timeouts30s: 4,
    timeoutsFull: 4,
  };
}

function liveOpsReducer(state: LiveOpsState, action: LiveOpsAction): LiveOpsState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'TOGGLE_LU_STARTER': {
      const id = action.payload;
      const isSelected = state.luStarters.includes(id);
      if (isSelected) {
        return { ...state, luStarters: state.luStarters.filter((s) => s !== id) };
      }
      if (state.luStarters.length >= 5) return state;
      return { ...state, luStarters: [...state.luStarters, id] };
    }

    case 'TOGGLE_OPP_STARTER': {
      const id = action.payload;
      const isSelected = state.oppStarters.includes(id);
      if (isSelected) {
        return { ...state, oppStarters: state.oppStarters.filter((s) => s !== id) };
      }
      if (state.oppStarters.length >= 5) return state;
      return { ...state, oppStarters: [...state.oppStarters, id] };
    }

    case 'SET_PERIOD_FORMAT':
      return {
        ...state,
        periodFormat: action.payload,
        periodLength: action.payload === 'halves' ? 1200 : 600,
        clockSeconds: action.payload === 'halves' ? 1200 : 600,
      };

    case 'SET_PERIOD_LENGTH':
      return { ...state, periodLength: action.payload, clockSeconds: action.payload };

    case 'SET_TIMEOUTS_30S':
      return { ...state, timeouts30s: action.payload };

    case 'SET_TIMEOUTS_FULL':
      return { ...state, timeoutsFull: action.payload };

    case 'START_GAME':
      return {
        ...state,
        phase: 'active',
        onCourt: [...state.luStarters],
        clockSeconds: state.periodLength,
        clockRunning: true,
        events: [
          ...state.events,
          {
            id: `evt-${Date.now()}`,
            ts: Date.now(),
            team: 'LU',
            type: 'period_start',
            clockAt: state.periodLength,
            period: state.period,
          },
        ],
      };

    case 'TICK': {
      if (!state.clockRunning || state.clockSeconds <= 0) return state;
      const next = state.clockSeconds - 1;
      if (next <= 0) {
        return { ...state, clockSeconds: 0, clockRunning: false };
      }
      return { ...state, clockSeconds: next };
    }

    case 'TOGGLE_CLOCK':
      return { ...state, clockRunning: !state.clockRunning };

    case 'SELECT_PLAYER':
      return {
        ...state,
        selectedPlayerId: state.selectedPlayerId === action.payload ? null : action.payload,
      };

    case 'LOG_EVENT': {
      const evt = action.payload;
      const pts = SCORING_POINTS[evt.type] ?? 0;
      return {
        ...state,
        events: [...state.events, evt],
        luScore: evt.team === 'LU' ? state.luScore + pts : state.luScore,
        oppScore: evt.team === 'OPP' ? state.oppScore + pts : state.oppScore,
      };
    }

    case 'UNDO': {
      if (state.events.length === 0) return state;
      const last = state.events[state.events.length - 1];
      // Don't undo system events
      if (['period_start', 'period_end', 'game_end'].includes(last.type)) return state;
      const newEvents = state.events.slice(0, -1);
      let { luScore, oppScore, onCourt, nexusSnapshots } = state;

      // Reverse scoring
      const pts = SCORING_POINTS[last.type] ?? 0;
      if (last.team === 'LU') luScore -= pts;
      if (last.team === 'OPP') oppScore -= pts;

      // Reverse substitution
      if (last.type === 'sub_in' && last.playerId) {
        const subOutIdx = newEvents.findLastIndex(
          (e) => e.type === 'sub_out' && e.ts === last.ts
        );
        if (subOutIdx >= 0) {
          const subOut = newEvents[subOutIdx];
          onCourt = onCourt.filter((id) => id !== last.playerId);
          if (subOut.playerId) onCourt = [...onCourt, subOut.playerId];
          newEvents.splice(subOutIdx, 1);
        }
      }

      // Reverse timeout → remove nexus snapshot
      if (last.type === 'timeout_us' || last.type === 'timeout_opp') {
        nexusSnapshots = nexusSnapshots.filter((s) => s.ts !== last.ts);
      }

      return { ...state, events: newEvents, luScore, oppScore, onCourt, nexusSnapshots };
    }

    case 'SUB': {
      const { outId, inId } = action.payload;
      const now = Date.now();
      const outPlayer = MOCK_ROSTER.find((p) => p.id === outId);
      const inPlayer = MOCK_ROSTER.find((p) => p.id === inId);
      return {
        ...state,
        onCourt: state.onCourt.map((id) => (id === outId ? inId : id)),
        selectedPlayerId: null,
        events: [
          ...state.events,
          {
            id: `evt-${now}-out`,
            ts: now,
            playerId: outId,
            playerName: outPlayer?.name,
            team: 'LU',
            type: 'sub_out',
            clockAt: state.clockSeconds,
            period: state.period,
          },
          {
            id: `evt-${now}-in`,
            ts: now,
            playerId: inId,
            playerName: inPlayer?.name,
            team: 'LU',
            type: 'sub_in',
            clockAt: state.clockSeconds,
            period: state.period,
          },
        ],
      };
    }

    case 'LOG_TIMEOUT': {
      const now = Date.now();
      const team = action.payload.team;
      const evtType: EventType = team === 'LU' ? 'timeout_us' : 'timeout_opp';

      // Build Nexus Snapshot Anchor
      const recentEvents = state.events
        .filter((e) => !['period_start', 'period_end', 'game_end'].includes(e.type))
        .slice(-5);

      const snapshot: NexusSnapshot = {
        id: `snap-${now}`,
        ts: now,
        clockAt: state.clockSeconds,
        period: state.period,
        luScore: state.luScore,
        oppScore: state.oppScore,
        onCourt: [...state.onCourt],
        lastEvents: recentEvents,
      };

      return {
        ...state,
        clockRunning: false,
        events: [
          ...state.events,
          {
            id: `evt-${now}`,
            ts: now,
            team: team === 'LU' ? 'LU' : 'OPP',
            type: evtType,
            clockAt: state.clockSeconds,
            period: state.period,
          },
        ],
        nexusSnapshots: [...state.nexusSnapshots, snapshot],
      };
    }

    case 'END_PERIOD':
      return {
        ...state,
        clockRunning: false,
        events: [
          ...state.events,
          {
            id: `evt-${Date.now()}`,
            ts: Date.now(),
            team: 'LU',
            type: 'period_end',
            clockAt: 0,
            period: state.period,
          },
        ],
      };

    case 'START_NEXT_PERIOD':
      return {
        ...state,
        period: state.period + 1,
        clockSeconds: state.periodLength,
        clockRunning: true,
        events: [
          ...state.events,
          {
            id: `evt-${Date.now()}`,
            ts: Date.now(),
            team: 'LU',
            type: 'period_start',
            clockAt: state.periodLength,
            period: state.period + 1,
          },
        ],
      };

    case 'END_GAME':
      return {
        ...state,
        phase: 'locked',
        clockRunning: false,
        events: [
          ...state.events,
          {
            id: `evt-${Date.now()}`,
            ts: Date.now(),
            team: 'LU',
            type: 'game_end',
            clockAt: state.clockSeconds,
            period: state.period,
          },
        ],
      };

    case 'SET_LEAGUE':
      return { ...state, league: action.payload };

    case 'APPLY_DEFAULTS':
      return {
        ...state,
        league: action.payload.league,
        periodFormat: action.payload.periodFormat,
        periodLength: action.payload.periodLength,
        clockSeconds: action.payload.periodLength,
        timeouts30s: action.payload.timeouts30s,
        timeoutsFull: action.payload.timeoutsFull,
      };

    case 'RESTART':
      return createInitialState(state.gameId);

    default:
      return state;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getPeriodLabel(period: number, format: PeriodFormat): string {
  if (format === 'halves') return period === 1 ? '1H' : period === 2 ? '2H' : `OT${period - 2}`;
  return period <= 4 ? `Q${period}` : `OT${period - 4}`;
}

function getMaxPeriods(format: PeriodFormat): number {
  return format === 'halves' ? 2 : 4;
}

function formatEventLabel(type: EventType): string {
  const labels: Record<EventType, string> = {
    fg2_make: '2PT Made', fg2_miss: '2PT Miss',
    fg3_make: '3PT Made', fg3_miss: '3PT Miss',
    ft_make: 'FT Made', ft_miss: 'FT Miss',
    reb_off: 'Off Reb', reb_def: 'Def Reb',
    ast: 'Assist', stl: 'Steal', blk: 'Block', to: 'Turnover',
    foul_personal: 'Personal Foul', foul_team: 'Team Foul',
    sub_in: 'Sub In', sub_out: 'Sub Out',
    timeout_us: 'Timeout (Us)', timeout_opp: 'Timeout (Opp)',
    period_start: 'Period Start', period_end: 'Period End', game_end: 'Game End',
  };
  return labels[type] ?? type;
}

function computePlayerStats(events: GameEvent[]) {
  const stats: Record<string, { pts: number; reb: number; oreb: number; dreb: number; ast: number; stl: number; blk: number; to: number; foul: number; fgm: number; fga: number; tpm: number; tpa: number; ftm: number; fta: number }> = {};

  for (const evt of events) {
    if (evt.team !== 'LU' || !evt.playerId) continue;
    if (!stats[evt.playerId]) {
      stats[evt.playerId] = { pts: 0, reb: 0, oreb: 0, dreb: 0, ast: 0, stl: 0, blk: 0, to: 0, foul: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0, ftm: 0, fta: 0 };
    }
    const s = stats[evt.playerId];
    switch (evt.type) {
      case 'fg2_make': s.pts += 2; s.fgm++; s.fga++; break;
      case 'fg2_miss': s.fga++; break;
      case 'fg3_make': s.pts += 3; s.fgm++; s.fga++; s.tpm++; s.tpa++; break;
      case 'fg3_miss': s.fga++; s.tpa++; break;
      case 'ft_make': s.pts += 1; s.ftm++; s.fta++; break;
      case 'ft_miss': s.fta++; break;
      case 'reb_off': s.reb++; s.oreb++; break;
      case 'reb_def': s.reb++; s.dreb++; break;
      case 'ast': s.ast++; break;
      case 'stl': s.stl++; break;
      case 'blk': s.blk++; break;
      case 'to': s.to++; break;
      case 'foul_personal': s.foul++; break;
      case 'foul_team': s.foul++; break;
    }
  }
  return stats;
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPPONENT MAP
// ═══════════════════════════════════════════════════════════════════════════════

const GAME_OPPONENTS: Record<string, string> = {
  '-Odr30YnjKA38ZfBZ6qB': 'UNLV',
  '-OgbmTnXpz994rOErPEo': 'Loyola Marymount',
  '-OgbzyEnODgmhH7yyXSJ': 'Pepperdine',
  '-OgcD9jAtLd0IFGX7lwI': 'UC Irvine',
  '-Ogd2OxdplE_N1hzwR_W': 'Cal Maritime',
  '-OgdZ7wZowES0FYO8FYE': 'Ohlone',
  '-OgjOc5JGIhECeCvETY6': 'Simpson University',
  '-Oi5tiQ8LDRW9FEUs_gf': 'Cal Maritime',
  '-OjE19psxjUfBfqrHZnB': 'Cal Miramar',
  '-OjOHCO32yY5URlwq6su': 'Cal Miramar',
  '-Ojn37CBTNgN9KpQQ22V': 'Cal Prestige Tigers',
  '-OkM7ZQIrwSjI9U37UGd': 'Bethesda',
  '-OitEKyFF5d9L8N0TgJR': 'Cal State East Bay',
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function GameOpsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { gameId, format, length, starters } = useLocalSearchParams<{
    gameId: string;
    format?: string;
    length?: string;
    starters?: string;
  }>();
  const resolvedGameId = gameId ?? '';

  const [state, dispatch] = useReducer(liveOpsReducer, resolvedGameId, createInitialState);
  const [loaded, setLoaded] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [subOutId, setSubOutId] = useState<string | null>(null);
  const [showTimeoutPicker, setShowTimeoutPicker] = useState(false);
  const [showTimeoutCard, setShowTimeoutCard] = useState(false);
  const [showPeriodEnd, setShowPeriodEnd] = useState(false);
  const [showEndGamePrompt, setShowEndGamePrompt] = useState(false);
  const [showEndGameMenu, setShowEndGameMenu] = useState(false);

  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const opponent = GAME_OPPONENTS[resolvedGameId] ?? 'Opponent';
  const oppRoster = OPP_ROSTERS[resolvedGameId] ?? DEFAULT_OPP_ROSTER;
  const maxPeriods = getMaxPeriods(state.periodFormat);

  // ── Load persisted state or build from URL params ──
  useEffect(() => {
    const load = async () => {
      // Try to resume a saved game
      try {
        const json = await AsyncStorage.getItem(`kx:gameOps:${resolvedGameId}`);
        if (json) {
          const saved = JSON.parse(json);
          const migrated: LiveOpsState = {
            ...createInitialState(resolvedGameId),
            ...saved,
            league: saved.league ?? '',
            luStarters: saved.luStarters ?? saved.starters ?? [],
            oppStarters: saved.oppStarters ?? [],
            periodFormat: saved.periodFormat ?? 'halves',
            periodLength: saved.periodLength ?? 1200,
            nexusSnapshots: saved.nexusSnapshots ?? [],
            clockRunning: false,
          };
          dispatch({ type: 'LOAD_STATE', payload: migrated });
          setLoaded(true);
          return;
        }
      } catch (e) {
        console.error('Failed to load game ops state:', e);
      }

      // No saved game — build from URL params (from Nexus setup)
      if (format && length && starters) {
        const pf: PeriodFormat = format === 'quarters' ? 'quarters' : 'halves';
        const pl = parseInt(length, 10) || 1200;
        const starterIds = starters.split(',').filter(Boolean);
        const initial: LiveOpsState = {
          ...createInitialState(resolvedGameId),
          periodFormat: pf,
          periodLength: pl,
          clockSeconds: pl,
          luStarters: starterIds,
        };
        dispatch({ type: 'LOAD_STATE', payload: initial });
        dispatch({ type: 'START_GAME' });
      } else {
        // No saved game and no params — go back
        router.navigate({ pathname: '/(tabs)/index', params: { hubTab: '2' } } as any);
      }

      setLoaded(true);
    };
    load();
  }, [resolvedGameId, format, length, starters, router]);

  // ── Persist state ──
  useEffect(() => {
    if (!loaded) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      AsyncStorage.setItem(
        `kx:gameOps:${resolvedGameId}`,
        JSON.stringify({ ...state, clockRunning: false })
      ).catch(console.error);
    }, 200);
  }, [state, loaded, resolvedGameId]);

  // ── Clock interval ──
  useEffect(() => {
    if (state.clockRunning) {
      clockRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    } else if (clockRef.current) {
      clearInterval(clockRef.current);
      clockRef.current = null;
    }
    return () => { if (clockRef.current) clearInterval(clockRef.current); };
  }, [state.clockRunning]);

  // ── Detect clock hitting 0:00 ──
  useEffect(() => {
    if (state.phase === 'active' && state.clockSeconds === 0 && !state.clockRunning) {
      const alreadyEnded = state.events.some(
        (e) => e.type === 'period_end' && e.period === state.period
      );
      if (!alreadyEnded) {
        dispatch({ type: 'END_PERIOD' });
        if (state.period >= maxPeriods) {
          setShowEndGamePrompt(true);
        } else {
          setShowPeriodEnd(true);
        }
      }
    }
  }, [state.clockSeconds, state.clockRunning, state.phase, state.period, state.events, maxPeriods]);

  // ── Log LU event ──
  const logLuEvent = useCallback((eventType: EventType) => {
    if (!state.selectedPlayerId) return;
    const player = MOCK_ROSTER.find((p) => p.id === state.selectedPlayerId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch({
      type: 'LOG_EVENT',
      payload: {
        id: `evt-${Date.now()}`,
        ts: Date.now(),
        playerId: state.selectedPlayerId,
        playerName: player?.name,
        team: 'LU',
        type: eventType,
        points: SCORING_POINTS[eventType],
        clockAt: state.clockSeconds,
        period: state.period,
      },
    });
  }, [state.selectedPlayerId, state.clockSeconds, state.period]);

  // ── Log OPP event ──
  const logOppEvent = useCallback((eventType: EventType, points: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch({
      type: 'LOG_EVENT',
      payload: {
        id: `evt-${Date.now()}`,
        ts: Date.now(),
        team: 'OPP',
        type: eventType,
        points,
        clockAt: state.clockSeconds,
        period: state.period,
      },
    });
  }, [state.clockSeconds, state.period]);

  const benchPlayers = MOCK_ROSTER.filter((p) => !state.onCourt.includes(p.id));
  const startersReady = state.luStarters.length === 5;

  if (!loaded) return <View style={[styles.container, { backgroundColor: colors.background }]} />;

  // ═════════════════════════════════════════════════════════════════════════════
  // LOCKED PHASE
  // ═════════════════════════════════════════════════════════════════════════════

  if (state.phase === 'locked') {
    const playerStats = computePlayerStats(state.events);
    const statRows = MOCK_ROSTER
      .filter((p) => playerStats[p.id])
      .sort((a, b) => (playerStats[b.id]?.pts ?? 0) - (playerStats[a.id]?.pts ?? 0));

    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: colors.divider }]}>
          <Pressable
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: pressed ? colors.backgroundSecondary : 'transparent' },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.navigate({ pathname: '/(tabs)/index', params: { hubTab: '2' } } as any);
            }}
          >
            <IconSymbol name="chevron.left" size={20} color={colors.text} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Final</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>vs {opponent}</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Final Score */}
          <View style={[styles.finalScoreCard, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.finalLabel, { color: colors.textTertiary }]}>FINAL</Text>
            <View style={styles.finalScoreRow}>
              <View style={styles.finalTeam}>
                <Text style={[styles.finalTeamName, { color: colors.text }]}>LU</Text>
                <Text style={[styles.finalScoreNum, { color: colors.text }]}>{state.luScore}</Text>
              </View>
              <Text style={[styles.finalDash, { color: colors.textTertiary }]}>–</Text>
              <View style={styles.finalTeam}>
                <Text style={[styles.finalTeamName, { color: colors.text }]}>OPP</Text>
                <Text style={[styles.finalScoreNum, { color: colors.text }]}>{state.oppScore}</Text>
              </View>
            </View>
          </View>

          {/* Team Totals */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
            TEAM TOTALS
          </Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {(() => {
              const all = computePlayerStats(state.events);
              let fgm = 0, fga = 0, tpm = 0, tpa = 0, ftm = 0, fta = 0, reb = 0, ast = 0, stl = 0, blk = 0, to = 0;
              Object.values(all).forEach((s) => {
                fgm += s.fgm; fga += s.fga; tpm += s.tpm; tpa += s.tpa;
                ftm += s.ftm; fta += s.fta; reb += s.reb; ast += s.ast;
                stl += s.stl; blk += s.blk; to += s.to;
              });
              const fgPct = fga > 0 ? ((fgm / fga) * 100).toFixed(1) : '0.0';
              const tpPct = tpa > 0 ? ((tpm / tpa) * 100).toFixed(1) : '0.0';
              const ftPct = fta > 0 ? ((ftm / fta) * 100).toFixed(1) : '0.0';
              return (
                <>
                  <StatRow label="FG" value={`${fgm}-${fga} (${fgPct}%)`} colors={colors} />
                  <StatRow label="3PT" value={`${tpm}-${tpa} (${tpPct}%)`} colors={colors} />
                  <StatRow label="FT" value={`${ftm}-${fta} (${ftPct}%)`} colors={colors} />
                  <StatRow label="REB" value={`${reb}`} colors={colors} />
                  <StatRow label="AST" value={`${ast}`} colors={colors} />
                  <StatRow label="STL" value={`${stl}`} colors={colors} />
                  <StatRow label="BLK" value={`${blk}`} colors={colors} />
                  <StatRow label="TO" value={`${to}`} colors={colors} />
                </>
              );
            })()}
          </View>

          {/* Player Stats */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
            PLAYER STATS
          </Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary, padding: 0 }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <View style={[styles.boxHeaderRow, { borderBottomColor: colors.divider }]}>
                  <Text style={[styles.boxHeaderCell, styles.boxColName, { color: colors.textTertiary }]}>PLAYER</Text>
                  <Text style={[styles.boxHeaderCell, styles.boxColStat, { color: colors.textTertiary }]}>PTS</Text>
                  <Text style={[styles.boxHeaderCell, styles.boxColStat, { color: colors.textTertiary }]}>REB</Text>
                  <Text style={[styles.boxHeaderCell, styles.boxColStat, { color: colors.textTertiary }]}>AST</Text>
                  <Text style={[styles.boxHeaderCell, styles.boxColStat, { color: colors.textTertiary }]}>STL</Text>
                  <Text style={[styles.boxHeaderCell, styles.boxColStat, { color: colors.textTertiary }]}>BLK</Text>
                  <Text style={[styles.boxHeaderCell, styles.boxColFg, { color: colors.textTertiary }]}>FG</Text>
                </View>
                {statRows.map((player, idx) => {
                  const s = playerStats[player.id];
                  return (
                    <View
                      key={player.id}
                      style={[styles.boxRow, idx % 2 === 1 && { backgroundColor: colors.backgroundTertiary + '40' }]}
                    >
                      <Text style={[styles.boxCell, styles.boxColName, { color: colors.text, fontWeight: '500' }]}>#{player.number} {player.name}</Text>
                      <Text style={[styles.boxCell, styles.boxColStat, { color: colors.text, fontWeight: '600' }]}>{s.pts}</Text>
                      <Text style={[styles.boxCell, styles.boxColStat, { color: colors.textSecondary }]}>{s.reb}</Text>
                      <Text style={[styles.boxCell, styles.boxColStat, { color: colors.textSecondary }]}>{s.ast}</Text>
                      <Text style={[styles.boxCell, styles.boxColStat, { color: colors.textSecondary }]}>{s.stl}</Text>
                      <Text style={[styles.boxCell, styles.boxColStat, { color: colors.textSecondary }]}>{s.blk}</Text>
                      <Text style={[styles.boxCell, styles.boxColFg, { color: colors.textSecondary }]}>{s.fgm}-{s.fga}</Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.md, backgroundColor: colors.background, borderTopColor: colors.divider }]}>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, { backgroundColor: colors.text, opacity: pressed ? 0.8 : 1 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.navigate({ pathname: '/(tabs)/index', params: { hubTab: '2' } } as any);
            }}
          >
            <Text style={[styles.primaryBtnText, { color: colors.background }]}>Return to Game Detail</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // ACTIVE PHASE
  // ═════════════════════════════════════════════════════════════════════════════

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* ── Persistent Top Bar ── */}
      <View style={[styles.topBar, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.divider }]}>
        <View style={styles.topBarScoreRow}>
          <Pressable
            style={({ pressed }) => [
              styles.topBarBack,
              { backgroundColor: pressed ? colors.backgroundTertiary : 'transparent' },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.navigate({ pathname: '/(tabs)/index', params: { hubTab: '2' } } as any);
            }}
          >
            <IconSymbol name="chevron.left" size={20} color={colors.text} />
          </Pressable>
          <View style={styles.topBarTeam}>
            <Text style={[styles.topBarTeamLabel, { color: colors.textSecondary }]}>LU</Text>
            <Text style={[styles.topBarScore, { color: colors.text }]}>{state.luScore}</Text>
          </View>

          <Pressable
            style={styles.topBarClockArea}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              dispatch({ type: 'TOGGLE_CLOCK' });
            }}
          >
            <Text style={[styles.topBarPeriod, { color: colors.textTertiary }]}>
              {getPeriodLabel(state.period, state.periodFormat)}
            </Text>
            <Text style={[styles.topBarClock, { color: colors.text }]}>
              {formatClock(state.clockSeconds)}
            </Text>
            <Text style={[styles.topBarClockHint, { color: colors.textTertiary }]}>
              {state.clockRunning ? 'tap to pause' : 'tap to start'}
            </Text>
          </Pressable>

          <View style={styles.topBarTeam}>
            <Text style={[styles.topBarTeamLabel, { color: colors.textSecondary }]}>OPP</Text>
            <Text style={[styles.topBarScore, { color: colors.text }]}>{state.oppScore}</Text>
          </View>
        </View>
      </View>

      {/* ── Scrollable Content ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.activeContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* LU Action Grid */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          LU ACTIONS {!state.selectedPlayerId && '(select a player)'}
        </Text>
        <View style={styles.actionGrid}>
          {LU_ACTION_BUTTONS.map((btn) => (
              <Pressable
                key={btn.type}
                style={({ pressed }) => [
                  styles.actionBtn,
                  {
                    backgroundColor: !state.selectedPlayerId ? colors.backgroundTertiary : colors.text,
                    opacity: !state.selectedPlayerId ? 0.5 : pressed ? 0.7 : 1,
                  },
                ]}
                disabled={!state.selectedPlayerId}
                onPress={() => logLuEvent(btn.type)}
              >
                <Text
                  style={[
                    styles.actionBtnText,
                    {
                      color: !state.selectedPlayerId ? colors.textTertiary : colors.background,
                    },
                  ]}
                >
                  {btn.label}
                </Text>
              </Pressable>
          ))}
        </View>

        {/* Recent Events */}
        {state.events.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              RECENT
            </Text>
            <View style={[styles.recentCard, { backgroundColor: colors.backgroundSecondary }]}>
              {state.events
                .filter((e) => !['period_start', 'period_end', 'game_end'].includes(e.type))
                .slice(-5)
                .reverse()
                .map((evt) => (
                  <View key={evt.id} style={styles.recentRow}>
                    <View style={[styles.recentBadge, { backgroundColor: evt.team === 'LU' ? colors.text + '15' : colors.backgroundTertiary }]}>
                      <Text style={[styles.recentBadgeText, { color: evt.team === 'LU' ? colors.text : colors.textSecondary }]}>
                        {evt.team}
                      </Text>
                    </View>
                    <Text style={[styles.recentText, { color: colors.text }]} numberOfLines={1}>
                      {evt.playerName ? `${evt.playerName} — ` : ''}{formatEventLabel(evt.type)}
                    </Text>
                    <Text style={[styles.recentClock, { color: colors.textTertiary }]}>
                      {formatClock(evt.clockAt)}
                    </Text>
                  </View>
                ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* ── Bottom Actions Bar ── */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + Spacing.sm, backgroundColor: colors.background, borderTopColor: colors.divider }]}>
        <Pressable
          style={({ pressed }) => [
            styles.bottomActionBtn,
            { backgroundColor: colors.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            dispatch({ type: 'UNDO' });
          }}
        >
          <IconSymbol name="arrow.uturn.backward" size={18} color={colors.text} />
          <Text style={[styles.bottomActionText, { color: colors.text }]}>Undo</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.bottomActionBtn,
            { backgroundColor: colors.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSubOutId(null);
            setShowSubModal(true);
          }}
        >
          <IconSymbol name="arrow.up.arrow.down" size={18} color={colors.text} />
          <Text style={[styles.bottomActionText, { color: colors.text }]}>Sub</Text>
        </Pressable>

        <View>
          {showEndGameMenu && (
            <View style={[styles.dropUp, { backgroundColor: colors.background, borderColor: colors.divider }]}>
              <View style={styles.dropUpHeader}>
                <Pressable
                  onPress={() => setShowEndGameMenu(false)}
                  hitSlop={8}
                >
                  <IconSymbol name="xmark" size={14} color={colors.textTertiary} />
                </Pressable>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.dropUpItem,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  setShowEndGameMenu(false);
                  setShowEndGamePrompt(true);
                }}
              >
                <Text style={[styles.dropUpItemText, { color: '#EF4444' }]}>End Game</Text>
              </Pressable>
            </View>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.bottomActionBtn,
              { backgroundColor: colors.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              setShowTimeoutPicker(true);
            }}
            onLongPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              setShowEndGameMenu(true);
            }}
          >
            <IconSymbol name="hand.raised.fill" size={18} color={colors.text} />
            <Text style={[styles.bottomActionText, { color: colors.text }]}>Timeout</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Substitution Modal ── */}
      <BottomSheet
        useModal
        visible={showSubModal}
        onClose={() => setShowSubModal(false)}
        title={!subOutId ? 'Who goes out?' : 'Who comes in?'}
      >
        {!subOutId ? (
          state.onCourt.map((playerId) => {
            const player = MOCK_ROSTER.find((p) => p.id === playerId);
            if (!player) return null;
            return (
              <Pressable
                key={playerId}
                style={[styles.modalRow, { borderBottomColor: colors.divider }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSubOutId(playerId);
                }}
              >
                <Text style={[styles.modalRowName, { color: colors.text }]}>#{player.number} {player.name}</Text>
              </Pressable>
            );
          })
        ) : (
          benchPlayers.map((player) => (
            <Pressable
              key={player.id}
              style={[styles.modalRow, { borderBottomColor: colors.divider }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                dispatch({ type: 'SUB', payload: { outId: subOutId, inId: player.id } });
                setShowSubModal(false);
              }}
            >
              <Text style={[styles.modalRowName, { color: colors.text }]}>#{player.number} {player.name}</Text>
            </Pressable>
          ))
        )}
      </BottomSheet>

      {/* ── Timeout Picker (Us / Opp) ── */}
      <Modal visible={showTimeoutPicker} transparent animationType="fade" onRequestClose={() => setShowTimeoutPicker(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowTimeoutPicker(false)} />
          <View style={[styles.timeoutPickerCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.timeoutPickerTitle, { color: colors.text }]}>Timeout</Text>
            <View style={styles.timeoutPickerRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.timeoutPickerBtn,
                  { backgroundColor: colors.text, opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  setShowTimeoutPicker(false);
                  dispatch({ type: 'LOG_TIMEOUT', payload: { team: 'LU' } });
                  setShowTimeoutCard(true);
                }}
              >
                <Text style={[styles.timeoutPickerBtnText, { color: colors.background }]}>Us</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.timeoutPickerBtn,
                  { backgroundColor: colors.backgroundSecondary, opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  setShowTimeoutPicker(false);
                  dispatch({ type: 'LOG_TIMEOUT', payload: { team: 'OPP' } });
                  setShowTimeoutCard(true);
                }}
              >
                <Text style={[styles.timeoutPickerBtnText, { color: colors.text }]}>Opponent</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Timeout Nexus Card ── */}
      <Modal visible={showTimeoutCard} transparent animationType="fade" onRequestClose={() => setShowTimeoutCard(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowTimeoutCard(false)} />
          <View style={[styles.timeoutCard, { backgroundColor: colors.background }]}>
            <IconSymbol name="sparkles" size={32} color={colors.text} />
            <Text style={[styles.timeoutTitle, { color: colors.text }]}>Timeout</Text>
            <Text style={[styles.timeoutSubtitle, { color: colors.textSecondary }]}>
              Clock paused at {formatClock(state.clockSeconds)}
            </Text>
            <Text style={[styles.timeoutSnapshot, { color: colors.textTertiary }]}>
              Nexus snapshot captured
            </Text>
            <Pressable style={styles.timeoutDismiss} onPress={() => setShowTimeoutCard(false)}>
              <Text style={[styles.timeoutDismissText, { color: colors.textTertiary }]}>Dismiss</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ── Period End Overlay ── */}
      <Modal visible={showPeriodEnd} transparent animationType="fade" onRequestClose={() => setShowPeriodEnd(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.periodEndCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.periodEndTitle, { color: colors.text }]}>
              End of {getPeriodLabel(state.period, state.periodFormat)}
            </Text>
            <Text style={[styles.periodEndScore, { color: colors.textSecondary }]}>
              LU {state.luScore} – OPP {state.oppScore}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.text, opacity: pressed ? 0.8 : 1, marginTop: Spacing.lg },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                setShowPeriodEnd(false);
                dispatch({ type: 'START_NEXT_PERIOD' });
              }}
            >
              <Text style={[styles.primaryBtnText, { color: colors.background }]}>
                Start {getPeriodLabel(state.period + 1, state.periodFormat)}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ── End Game Prompt ── */}
      <Modal visible={showEndGamePrompt} transparent animationType="fade" onRequestClose={() => setShowEndGamePrompt(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.periodEndCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.periodEndTitle, { color: colors.text }]}>Game Over</Text>
            <Text style={[styles.periodEndScore, { color: colors.textSecondary }]}>
              LU {state.luScore} – OPP {state.oppScore}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.text, opacity: pressed ? 0.8 : 1, marginTop: Spacing.lg },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                setShowEndGamePrompt(false);
                dispatch({ type: 'END_GAME' });
              }}
            >
              <Text style={[styles.primaryBtnText, { color: colors.background }]}>End Game</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STAT ROW
// ═══════════════════════════════════════════════════════════════════════════════

function StatRow({ label, value, colors }: { label: string; value: string; colors: typeof Colors.light }) {
  return (
    <View style={styles.statRow}>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  headerSubtitle: { fontSize: 13 },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.md },

  // Section labels
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },

  // Timeout setup
  timeoutSetupCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  timeoutSetupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeoutSetupLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  timeoutSetupDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
  timeoutStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 22,
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  primaryBtn: {
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 16, fontWeight: '600' },

  // Top bar (active)
  topBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBarBack: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  topBarScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarTeam: { alignItems: 'center', width: 70 },
  topBarTeamLabel: { fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  topBarScore: { fontSize: 36, fontWeight: '700' },
  topBarClockArea: { alignItems: 'center', flex: 1 },
  topBarPeriod: { fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  topBarClock: { fontSize: 28, fontWeight: '700', fontVariant: ['tabular-nums'] },
  topBarClockHint: { fontSize: 11, marginTop: 2 },

  // Active content
  activeContent: { padding: Spacing.md },

  // On-court chips
  courtScroll: { marginBottom: Spacing.sm },
  courtRow: { flexDirection: 'row', gap: 8 },
  courtChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 64,
  },
  courtChipName: { fontSize: 14, fontWeight: '600' },
  courtChipPos: { fontSize: 11, marginTop: 2 },

  // Action grid
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBtn: {
    width: '48%',
    flexGrow: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  actionBtnText: { fontSize: 14, fontWeight: '600' },

  // Opponent buttons
  oppRow: { flexDirection: 'row', gap: 8 },
  oppBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  oppBtnText: { fontSize: 14, fontWeight: '600' },

  // Recent events
  recentCard: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  recentBadge: {
    width: 32,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  recentBadgeText: { fontSize: 10, fontWeight: '700' },
  recentText: { fontSize: 13, flex: 1 },
  recentClock: { fontSize: 12, fontWeight: '600' },

  // Bottom actions
  bottomActions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bottomActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  bottomActionText: { fontSize: 14, fontWeight: '600' },

  // Drop-up menu
  dropUp: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    marginBottom: 6,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  dropUpHeader: {
    alignItems: 'flex-end',
    paddingTop: 8,
    paddingHorizontal: 10,
  },
  dropUpItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  dropUpItemText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Swipe handle
  swipeHandle: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  swipeHandleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#444',
  },

  // Modal shared
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, maxHeight: '90%' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: { fontSize: 17, fontWeight: '600' },
  modalScroll: { padding: Spacing.md },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalRowName: { fontSize: 16, fontWeight: '500' },
  modalRowPos: { fontSize: 14 },

  // Timeout picker
  timeoutPickerCard: {
    position: 'absolute',
    top: '35%',
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  timeoutPickerTitle: { fontSize: 20, fontWeight: '700', marginBottom: Spacing.md },
  timeoutPickerRow: { flexDirection: 'row', gap: 12, width: '100%' },
  timeoutPickerBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  timeoutPickerBtnText: { fontSize: 16, fontWeight: '600' },

  // Timeout Nexus card
  timeoutCard: {
    position: 'absolute',
    top: '30%',
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  timeoutTitle: { fontSize: 22, fontWeight: '700' },
  timeoutSubtitle: { fontSize: 14 },
  timeoutSnapshot: { fontSize: 12, marginTop: 4 },
  timeoutDismiss: { marginTop: Spacing.sm, paddingVertical: 8 },
  timeoutDismissText: { fontSize: 14, fontWeight: '500' },

  // Period end
  periodEndCard: {
    position: 'absolute',
    top: '30%',
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  periodEndTitle: { fontSize: 22, fontWeight: '700' },
  periodEndScore: { fontSize: 16, marginTop: 4 },

  // Final score (locked)
  finalScoreCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  finalLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  finalScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.sm,
  },
  finalTeam: { alignItems: 'center' },
  finalTeamName: { fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },
  finalScoreNum: { fontSize: 48, fontWeight: '700' },
  finalDash: { fontSize: 32 },

  // Stat row (locked)
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: { fontSize: 14 },
  statValue: { fontSize: 15, fontWeight: '600' },

  // Card
  card: { borderRadius: BorderRadius.lg, overflow: 'hidden', padding: Spacing.md },

  // Box score (locked)
  boxHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
  },
  boxHeaderCell: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  boxColName: { width: 100 },
  boxColStat: { width: 44, textAlign: 'center' },
  boxColFg: { width: 56, textAlign: 'center' },
  boxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  boxCell: { fontSize: 13 },

});
