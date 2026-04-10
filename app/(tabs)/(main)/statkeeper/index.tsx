/**
 * StatKeeper — Live Basketball Stat Tracker
 *
 * Phases: setup → live (3-panel landscape) → end (box score)
 *
 * Live layout:
 *   LEFT  — shot entry (Make/Miss × 3pt/2pt/1pt) + Exit/Undo at bottom
 *   CENTER — current-five strip → compact scoreboard → PBP feed OR player-select grid
 *   RIGHT  — non-shooting stats (def/off reb, to, stl, ast, blk) + Sub/Foul at bottom
 *
 * UX: tap stat → center shows player grid → tap player → logged. Two taps.
 */

import React, {
  useState, useCallback, useMemo, useRef, useEffect,
} from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput,
  StyleSheet, Alert, useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { forceHideFooter, releaseForceHide, resetFooter } from '@/utils/global-footer-hide';
import {
  MOCK_HOME_ROSTER, MOCK_AWAY_ROSTER, MOCK_GAME_META,
  type GamePlayer,
} from '@/data/mock-statkeeper';

// ── Types ─────────────────────────────────────────────────────────────────────

type GamePhase = 'setup' | 'live' | 'end';
type Period    = 1 | 2 | 'OT1' | 'OT2';
type GameType  = 'Regular' | 'Conference' | 'Tournament' | 'Scrimmage';

interface GameEvent {
  id:           string;
  timestamp:    number;
  gameClock:    string;
  period:       Period;
  teamId:       'home' | 'away';
  playerId:     string | null;
  eventType:    'shot' | 'rebound' | 'turnover' | 'steal' | 'assist' | 'block' | 'foul' | 'sub' | 'timeout';
  eventSubtype: string | null;
  result:       'make' | 'miss' | null;
}

interface PendingAction {
  type:    GameEvent['eventType'];
  subtype: string | null;
  result:  GameEvent['result'];
}

type FoulType = 'Personal' | 'Shooting' | 'Offensive' | 'Technical' | 'Flagrant';
type ContinuationMode = 'assist' | 'rebound-type' | 'ft-count' | 'ft-shot';

// ── Module-level semantic colors (no C needed) ─────────────────────────────

const EV_GAIN    = '#5A8A6E';
const EV_HEAT    = '#B85C5C';
const EV_CAUTION = '#B8943E';
const EV_CARBON  = '#1A1714';

const GAME_TYPES: GameType[] = ['Regular', 'Conference', 'Tournament', 'Scrimmage'];
const HALF_PRESETS = [20, 16] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatClock(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, '0')}`;
}

function periodLabel(p: Period): string {
  if (p === 1) return '1st Half';
  if (p === 2) return '2nd Half';
  return p;
}

function eventColor(e: GameEvent): string {
  if (e.eventType === 'shot')     return e.result === 'make' ? EV_GAIN : EV_HEAT;
  if (e.eventType === 'turnover') return EV_HEAT;
  if (e.eventType === 'steal')    return EV_GAIN;
  if (e.eventType === 'foul')     return EV_CAUTION;
  return EV_CARBON;
}

function eventTitle(e: GameEvent): string {
  if (e.eventType === 'shot') {
    const pts = e.eventSubtype === '3pt' ? '3pt' : e.eventSubtype === 'ft' ? '1pt' : '2pt';
    return e.result === 'make' ? `${pts} Make` : `${pts} Miss`;
  }
  if (e.eventType === 'rebound')  return `${e.eventSubtype === 'off' ? 'Off' : 'Def'} Rebound`;
  if (e.eventType === 'turnover') return 'Turnover';
  if (e.eventType === 'steal')    return 'Steal';
  if (e.eventType === 'assist')   return 'Assist';
  if (e.eventType === 'block')    return 'Block';
  if (e.eventType === 'foul')     return `${e.eventSubtype ?? 'Personal'} Foul`;
  if (e.eventType === 'sub')      return 'Substitution';
  if (e.eventType === 'timeout')  return 'Timeout';
  return e.eventType;
}

function eventDetail(e: GameEvent, players: GamePlayer[]): string {
  const p = players.find(pl => pl.id === e.playerId);
  const name = p ? `#${p.number} ${p.firstName} ${p.lastName}` : 'Team';
  return name;
}

function pendingActionLabel(action: PendingAction): string {
  if (action.type === 'shot') {
    const pts = action.subtype === '3pt' ? '3pt' : action.subtype === 'ft' ? 'FT' : '2pt';
    return action.result === 'make' ? `Made ${pts}` : `Missed ${pts}`;
  }
  if (action.type === 'rebound')  return `${action.subtype === 'off' ? 'Off' : 'Def'} Rebound`;
  if (action.type === 'turnover') return 'Turnover';
  if (action.type === 'steal')    return 'Steal';
  if (action.type === 'assist')   return 'Assist';
  if (action.type === 'block')    return 'Block';
  if (action.type === 'foul')     return 'Foul';
  return action.type;
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function StatKeeperScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width: winW, height: winH } = useWindowDimensions();
  const isLandscape = winW > winH;
  const S      = useMemo(() => makeStyles(C), [C]);

  // ── Game state ─────────────────────────────────────────────────────────────
  const [gamePhase,     setGamePhase]     = useState<GamePhase>('setup');
  const [homeName,      setHomeName]      = useState(MOCK_GAME_META.homeName);
  const [awayName,      setAwayName]      = useState(MOCK_GAME_META.awayName);
  const [gameType,      setGameType]      = useState<GameType>(MOCK_GAME_META.gameType);
  const [halfMinutes,   setHalfMinutes]   = useState(MOCK_GAME_META.halfMinutes);
  const [customMinutes, setCustomMinutes] = useState('');
  const [homePlayers,   setHomePlayers]   = useState<GamePlayer[]>([...MOCK_HOME_ROSTER]);
  const [awayPlayers,   setAwayPlayers]   = useState<GamePlayer[]>([...MOCK_AWAY_ROSTER]);
  const [homeExpanded,  setHomeExpanded]  = useState(true);
  const [awayExpanded,  setAwayExpanded]  = useState(true);

  // ── Live state ─────────────────────────────────────────────────────────────
  const [events,         setEvents]         = useState<GameEvent[]>([]);
  const [pendingAction,  setPendingAction]  = useState<PendingAction | null>(null);
  const [clockSeconds,   setClockSeconds]   = useState(MOCK_GAME_META.halfMinutes * 60);
  const [clockRunning,   setClockRunning]   = useState(false);
  const [period,         setPeriod]         = useState<Period>(1);

  // ── Overlay state ──────────────────────────────────────────────────────────
  const [showSubOverlay,   setShowSubOverlay]   = useState(false);
  const [showFullPbp,      setShowFullPbp]      = useState(false);
  const [showScoreBlast,   setShowScoreBlast]   = useState(false);
  const [showTimeoutSheet, setShowTimeoutSheet] = useState(false);
  const [subTeamId,        setSubTeamId]        = useState<'home' | 'away'>('home');
  const [subIncomingId,    setSubIncomingId]    = useState<string | null>(null);
  const [toastMsg,         setToastMsg]         = useState<string | null>(null);

  // ── Foul type + continuation ──────────────────────────────────────────────
  const [showFoulType,      setShowFoulType]      = useState(false);
  const [foulPendingPlayer, setFoulPendingPlayer] = useState<GamePlayer | null>(null);
  const [contMode,          setContMode]          = useState<ContinuationMode | null>(null);
  const [ftTotal,           setFtTotal]           = useState(0);
  const [ftDone,            setFtDone]            = useState(0);
  // ── Overlay state ──────────────────────────────────────────────────────────
  const [showQD,            setShowQD]            = useState(false);
  const [showPeriodScore,   setShowPeriodScore]    = useState(false);
  const [showPeriodPicker,  setShowPeriodPicker]   = useState(false);

  const clockRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const allPlayers = useMemo(() => [...homePlayers, ...awayPlayers], [homePlayers, awayPlayers]);

  // ── Clock ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!clockRunning) {
      if (clockRef.current) clearInterval(clockRef.current);
      return;
    }
    clockRef.current = setInterval(() => {
      setClockSeconds(s => {
        if (s <= 1) { setClockRunning(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => { if (clockRef.current) clearInterval(clockRef.current); };
  }, [clockRunning]);

  // ── Focus / blur ───────────────────────────────────────────────────────────
  useFocusEffect(useCallback(() => {
    forceHideFooter();
    return () => {
      setClockRunning(false);
      releaseForceHide();
      resetFooter();
    };
  }, []));

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2000);
  }, []);

  // ── Scores ─────────────────────────────────────────────────────────────────
  const homeScore = useMemo(() =>
    events.filter(e => e.teamId === 'home' && e.eventType === 'shot' && e.result === 'make')
      .reduce((s, e) => s + (e.eventSubtype === '3pt' ? 3 : e.eventSubtype === 'ft' ? 1 : 2), 0),
  [events]);

  const awayScore = useMemo(() =>
    events.filter(e => e.teamId === 'away' && e.eventType === 'shot' && e.result === 'make')
      .reduce((s, e) => s + (e.eventSubtype === '3pt' ? 3 : e.eventSubtype === 'ft' ? 1 : 2), 0),
  [events]);

  const BONUS_THRESHOLD = 7;
  const homeFoulsH = useMemo(() =>
    events.filter(e => e.teamId === 'home' && e.eventType === 'foul' && e.period === period).length,
  [events, period]);
  const awayFoulsH = useMemo(() =>
    events.filter(e => e.teamId === 'away' && e.eventType === 'foul' && e.period === period).length,
  [events, period]);
  const homeTimeouts = useMemo(() =>
    events.filter(e => e.eventType === 'timeout' && e.eventSubtype === 'home').length,
  [events]);
  const awayTimeouts = useMemo(() =>
    events.filter(e => e.eventType === 'timeout' && e.eventSubtype === 'away').length,
  [events]);
  const scoreByPeriod = useMemo(() => {
    const score = (teamId: 'home' | 'away', p: Period) =>
      events.filter(e => e.teamId === teamId && e.eventType === 'shot' && e.result === 'make' && e.period === p)
        .reduce((s, e) => s + (e.eventSubtype === '3pt' ? 3 : e.eventSubtype === 'ft' ? 1 : 2), 0);
    return {
      home1: score('home', 1), home2: score('home', 2),
      homeOT1: score('home', 'OT1'), homeOT2: score('home', 'OT2'),
      away1: score('away', 1), away2: score('away', 2),
      awayOT1: score('away', 'OT1'), awayOT2: score('away', 'OT2'),
    };
  }, [events]);

  // ── Box score ──────────────────────────────────────────────────────────────
  const computeBoxScore = useCallback((teamId: 'home' | 'away') => {
    const players = teamId === 'home' ? homePlayers : awayPlayers;
    return players.map(player => {
      const pe   = events.filter(e => e.playerId === player.id);
      const shots = pe.filter(e => e.eventType === 'shot');
      const makes = shots.filter(e => e.result === 'make');
      const fgm  = makes.filter(e => e.eventSubtype !== 'ft').length;
      const fga  = shots.filter(e => e.eventSubtype !== 'ft').length;
      const fg3m = makes.filter(e => e.eventSubtype === '3pt').length;
      const fg3a = shots.filter(e => e.eventSubtype === '3pt').length;
      const ftm  = makes.filter(e => e.eventSubtype === 'ft').length;
      const fta  = shots.filter(e => e.eventSubtype === 'ft').length;
      const pts  = fg3m * 3 + (fgm - fg3m) * 2 + ftm;
      const reb  = pe.filter(e => e.eventType === 'rebound').length;
      const ast  = pe.filter(e => e.eventType === 'assist').length;
      const stl  = pe.filter(e => e.eventType === 'steal').length;
      const blk  = pe.filter(e => e.eventType === 'block').length;
      const tov  = pe.filter(e => e.eventType === 'turnover').length;
      const pf   = pe.filter(e => e.eventType === 'foul').length;
      return { player, pts, fgm, fga, fg3m, fg3a, ftm, fta, reb, ast, stl, blk, tov, pf };
    });
  }, [events, homePlayers, awayPlayers]);

  // ── Log event ─────────────────────────────────────────────────────────────
  const logEvent = useCallback((
    type:    GameEvent['eventType'],
    subtype: string | null,
    result:  GameEvent['result'],
    player:  GamePlayer | null,
  ): GameEvent => {
    const event: GameEvent = {
      id:           Math.random().toString(36).slice(2),
      timestamp:    Date.now(),
      gameClock:    formatClock(clockSeconds),
      period,
      teamId:       player?.teamId ?? 'home',
      playerId:     player?.id ?? null,
      eventType:    type,
      eventSubtype: subtype,
      result,
    };
    setEvents(prev => [event, ...prev]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    return event;
  }, [clockSeconds, period]);

  // ── Pend → player select → commit ─────────────────────────────────────────
  const logOrPend = useCallback((
    type:    GameEvent['eventType'],
    subtype: string | null,
    result:  GameEvent['result'],
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPendingAction({ type, subtype, result });
  }, []);

  // ── Shot button handler (respects FT mini-flow) ────────────────────────────
  const onShotButtonPress = useCallback((
    subtype: '3pt' | '2pt' | 'ft',
    result:  'make' | 'miss',
  ) => {
    if (contMode === 'ft-shot' && subtype !== 'ft') return; // only 1pt during FT flow
    logOrPend('shot', subtype, result);
  }, [contMode, logOrPend]);

  const commitAction = useCallback((player: GamePlayer | null) => {
    if (!pendingAction) return;

    // Foul: intercept to show foul type selector
    if (pendingAction.type === 'foul') {
      setFoulPendingPlayer(player);
      setPendingAction(null);
      setShowFoulType(true);
      return;
    }

    logEvent(pendingAction.type, pendingAction.subtype, pendingAction.result, player);
    const { type, result } = pendingAction;
    setPendingAction(null);

    // FT mini-flow tracking
    if (contMode === 'ft-shot') {
      const newDone = ftDone + 1;
      setFtDone(newDone);
      if (newDone >= ftTotal) {
        setContMode(result === 'miss' ? 'rebound-type' : null);
        setFtTotal(0); setFtDone(0);
      }
      return;
    }

    // Continuation dialogs
    if (type === 'shot' && result === 'make') {
      setContMode('assist');
    } else if (type === 'shot' && result === 'miss') {
      setContMode('rebound-type');
    }
  }, [pendingAction, logEvent, contMode, ftDone, ftTotal]);

  const cancelPending = useCallback(() => setPendingAction(null), []);

  // ── Commit foul with selected type ─────────────────────────────────────────
  const commitFoul = useCallback((foulType: FoulType) => {
    setShowFoulType(false);
    const player = foulPendingPlayer;
    logEvent('foul', foulType, null, player);
    setFoulPendingPlayer(null);

    if (player) {
      const playerFouls = events.filter(e => e.playerId === player.id && e.eventType === 'foul').length + 1;
      if (playerFouls >= 5) {
        showToast(`FOULED OUT — #${player.number} ${player.firstName}`);
      } else if (playerFouls === 4) {
        showToast(`FOUL TROUBLE — #${player.number} has 4 fouls`);
      }
      const teamFouls = (player.teamId === 'home' ? homeFoulsH : awayFoulsH) + 1;
      if (teamFouls === BONUS_THRESHOLD) {
        showToast(`BONUS — ${player.teamId === 'home' ? homeName : awayName} in the bonus`);
      }
    }

    setContMode('ft-count');
    setFtDone(0);
    setFtTotal(0);
  }, [foulPendingPlayer, logEvent, events, homeFoulsH, awayFoulsH, homeName, awayName, showToast]);

  const dismissContinuation = useCallback(() => {
    setContMode(null);
    setFtTotal(0);
    setFtDone(0);
  }, []);

  // ── Undo ──────────────────────────────────────────────────────────────────
  const undoLast = useCallback(() => {
    if (events.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEvents(prev => prev.slice(1));
  }, [events.length]);

  // ── Period management ─────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const endPeriod = useCallback(() => {
    setClockRunning(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (period === 1) { setPeriod(2); setClockSeconds(halfMinutes * 60); }
    else if (period === 2) { setGamePhase('end'); }
    else if (period === 'OT1') { setPeriod('OT2'); setClockSeconds(5 * 60); }
    else { setGamePhase('end'); }
  }, [period, halfMinutes]);

  // ── Sub management ────────────────────────────────────────────────────────
  const performSub = useCallback((outgoingId: string) => {
    if (!subIncomingId) return;
    const setter        = subTeamId === 'home' ? setHomePlayers : setAwayPlayers;
    const teamPlayers   = subTeamId === 'home' ? homePlayers : awayPlayers;
    const incomingPlayer = teamPlayers.find(p => p.id === subIncomingId);
    if (!incomingPlayer) return;
    setter(prev => prev.map(p => {
      if (p.id === subIncomingId) return { ...p, isOnCourt: true };
      if (p.id === outgoingId)   return { ...p, isOnCourt: false };
      return p;
    }));
    logEvent('sub', outgoingId, null, incomingPlayer);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowSubOverlay(false);
    setSubIncomingId(null);
  }, [subTeamId, subIncomingId, homePlayers, awayPlayers, logEvent]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    setGamePhase('setup');
    setHomeName(MOCK_GAME_META.homeName);
    setAwayName(MOCK_GAME_META.awayName);
    setGameType(MOCK_GAME_META.gameType);
    setHalfMinutes(MOCK_GAME_META.halfMinutes);
    setHomePlayers([...MOCK_HOME_ROSTER]);
    setAwayPlayers([...MOCK_AWAY_ROSTER]);
    setEvents([]);
    setClockSeconds(MOCK_GAME_META.halfMinutes * 60);
    setClockRunning(false);
    setPeriod(1);
    setPendingAction(null);
  }, []);

  // ── Setup helpers ─────────────────────────────────────────────────────────
  const toggleStarter = useCallback((playerId: string, teamId: 'home' | 'away') => {
    const setter  = teamId === 'home' ? setHomePlayers : setAwayPlayers;
    const current = teamId === 'home' ? homePlayers : awayPlayers;
    const player  = current.find(p => p.id === playerId);
    if (!player) return;
    const starters = current.filter(p => p.isOnCourt).length;
    if (!player.isOnCourt && starters >= 5) { showToast('Max 5 starters per team'); return; }
    setter(prev => prev.map(p => p.id === playerId ? { ...p, isOnCourt: !p.isOnCourt } : p));
    Haptics.selectionAsync();
  }, [homePlayers, awayPlayers, showToast]);

  const startGame = useCallback(() => {
    if (homePlayers.filter(p => p.isOnCourt).length !== 5) return;
    if (awayPlayers.filter(p => p.isOnCourt).length !== 5) return;
    setClockSeconds(halfMinutes * 60);
    setGamePhase('live');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [homePlayers, awayPlayers, halfMinutes]);

  const handleLiveBack = useCallback(() => {
    setClockRunning(false);
    Alert.alert('Leave Game?', 'Your data will be lost if you navigate away.', [
      { text: 'Stay',  style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => router.back() },
    ]);
  }, [router]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const canStart     = homePlayers.filter(p => p.isOnCourt).length === 5 && awayPlayers.filter(p => p.isOnCourt).length === 5;
  const homeOnCourt  = homePlayers.filter(p => p.isOnCourt);
  const awayOnCourt  = awayPlayers.filter(p => p.isOnCourt);

  // ============================================================================
  // RENDER: Setup
  // ============================================================================

  const renderSetup = () => (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <View style={[S.setupTopBar, { paddingTop: insets.top, borderBottomColor: C.mist }]}>
        <Pressable hitSlop={8} onPress={() => router.back()} style={S.iconBtn}>
          <IconSymbol name="chevron.left" size={20} color={C.carbon} />
        </Pressable>
        <Text style={[S.setupTitle, { color: C.carbon }]}>Game Setup</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 49 + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[S.sectionLabel, { color: C.drift }]}>TEAMS</Text>
        <View style={[S.card, { backgroundColor: C.linen }]}>
          <View style={S.inputRow}>
            <View style={[S.teamDot, { backgroundColor: C.gain }]} />
            <TextInput
              style={[S.teamInput, { color: C.carbon, borderBottomColor: C.mist }]}
              value={homeName} onChangeText={setHomeName}
              placeholder="Home team name" placeholderTextColor={C.drift}
            />
          </View>
          <View style={S.inputRow}>
            <View style={[S.teamDot, { backgroundColor: C.drift }]} />
            <TextInput
              style={[S.teamInput, { color: C.carbon, borderBottomColor: 'transparent' }]}
              value={awayName} onChangeText={setAwayName}
              placeholder="Away team name" placeholderTextColor={C.drift}
            />
          </View>
        </View>

        <Text style={[S.sectionLabel, { color: C.drift }]}>GAME TYPE</Text>
        <View style={S.pillRow}>
          {GAME_TYPES.map(gt => {
            const active = gameType === gt;
            return (
              <Pressable key={gt} onPress={() => { Haptics.selectionAsync(); setGameType(gt); }}
                style={[S.pill, { backgroundColor: active ? C.carbon : C.linen, borderColor: active ? C.carbon : C.mist }]}>
                <Text style={[S.pillText, { color: active ? C.paper : C.drift }]}>{gt}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[S.sectionLabel, { color: C.drift }]}>HALF LENGTH</Text>
        <View style={S.pillRow}>
          {HALF_PRESETS.map(m => {
            const active = halfMinutes === m;
            return (
              <Pressable key={m} onPress={() => { Haptics.selectionAsync(); setHalfMinutes(m); setCustomMinutes(''); }}
                style={[S.pill, { backgroundColor: active ? C.carbon : C.linen, borderColor: active ? C.carbon : C.mist }]}>
                <Text style={[S.pillText, { color: active ? C.paper : C.drift }]}>{m} min</Text>
              </Pressable>
            );
          })}
          <Pressable onPress={() => { Haptics.selectionAsync(); setHalfMinutes(0); }}
            style={[S.pill, { backgroundColor: halfMinutes === 0 ? C.carbon : C.linen, borderColor: halfMinutes === 0 ? C.carbon : C.mist }]}>
            <Text style={[S.pillText, { color: halfMinutes === 0 ? C.paper : C.drift }]}>Custom</Text>
          </Pressable>
        </View>
        {halfMinutes === 0 && (
          <TextInput
            style={[S.customInput, { backgroundColor: C.linen, color: C.carbon, borderColor: C.mist }]}
            value={customMinutes}
            onChangeText={t => { setCustomMinutes(t); const n = parseInt(t, 10); if (!isNaN(n) && n > 0) setHalfMinutes(n); }}
            placeholder="Enter minutes" placeholderTextColor={C.drift} keyboardType="number-pad"
          />
        )}

        {renderRosterSection('home')}
        {renderRosterSection('away')}

        <Pressable onPress={startGame} disabled={!canStart}
          style={[S.startBtn, { backgroundColor: canStart ? C.carbon : C.mist }]}>
          <Text style={[S.startBtnText, { color: canStart ? C.paper : C.drift }]}>Start Game</Text>
        </Pressable>
      </ScrollView>

      {toastMsg && (
        <View style={[S.toast, { bottom: insets.bottom + 24 }]}>
          <Text style={S.toastText}>{toastMsg}</Text>
        </View>
      )}
    </View>
  );

  const renderRosterSection = (teamId: 'home' | 'away') => {
    const players  = teamId === 'home' ? homePlayers : awayPlayers;
    const expanded = teamId === 'home' ? homeExpanded : awayExpanded;
    const toggle   = teamId === 'home' ? () => setHomeExpanded(v => !v) : () => setAwayExpanded(v => !v);
    const starters = players.filter(p => p.isOnCourt).length;
    const name     = teamId === 'home' ? homeName : awayName;
    const dotColor = teamId === 'home' ? C.gain : C.drift;
    return (
      <View key={teamId}>
        <Text style={[S.sectionLabel, { color: C.drift }]}>{name.toUpperCase()} ROSTER</Text>
        <View style={[S.card, { backgroundColor: C.linen }]}>
          <Pressable onPress={toggle}
            style={[S.rosterHeader, { borderBottomColor: expanded ? C.mist : 'transparent' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[S.teamDot, { backgroundColor: dotColor }]} />
              <Text style={[S.rosterHeaderText, { color: C.carbon }]}>{name}</Text>
              <View style={[S.starterBadge, { backgroundColor: starters === 5 ? C.gain + '20' : C.mist }]}>
                <Text style={[S.starterBadgeText, { color: starters === 5 ? C.gain : C.drift }]}>{starters}/5</Text>
              </View>
            </View>
            <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={14} color={C.drift} />
          </Pressable>
          {expanded && players.map((p, i) => (
            <Pressable key={p.id} onPress={() => toggleStarter(p.id, teamId)}
              style={[S.playerRow, { borderBottomColor: C.mist }, i === players.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={[S.jerseyCircle, { backgroundColor: p.isOnCourt ? dotColor : C.mist }]}>
                <Text style={[S.jerseyNum, { color: p.isOnCourt ? C.paper : C.drift }]}>{p.number}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[S.playerName, { color: C.carbon }]}>{p.firstName} {p.lastName}</Text>
              </View>
              <View style={[S.starterToggle, p.isOnCourt
                ? { backgroundColor: dotColor }
                : { borderWidth: 1.5, borderColor: C.mist }]}>
                {p.isOnCourt && <IconSymbol name="checkmark" size={12} color={C.paper} />}
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  // ============================================================================
  // RENDER: Live — 3-panel horizontal
  // ============================================================================

  // ── Portrait quick-view (read-only, shown when phone is vertical) ─────────
  const renderPortraitQuickView = () => (
    <View style={{ flex: 1, backgroundColor: C.paper, paddingTop: insets.top }}>
      {/* Score */}
      <View style={{ alignItems: 'center', paddingVertical: 24, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: C.carbon }}>{homeName}</Text>
          <Text style={{ fontSize: 32, fontWeight: '700', color: C.carbon, fontVariant: ['tabular-nums' as any] }}>
            {homeScore}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: C.carbon }}>{awayName}</Text>
          <Text style={{ fontSize: 32, fontWeight: '700', color: C.carbon, fontVariant: ['tabular-nums' as any] }}>
            {awayScore}
          </Text>
        </View>
        <View style={[S.periodPill, { backgroundColor: C.linen, borderColor: C.mist, marginTop: 4 }]}>
          <Text style={[S.periodText, { color: C.carbon }]}>{periodLabel(period)}</Text>
        </View>
      </View>

      {/* Current Five pills */}
      <View style={[S.fiveStrip, { borderBottomColor: C.mist, borderTopColor: C.mist, borderTopWidth: StyleSheet.hairlineWidth }]}>
        {homeOnCourt.slice(0, 5).map(p => (
          <View key={p.id} style={[S.fivePill, { backgroundColor: C.linen, borderColor: C.mist }]}>
            <Text style={[S.fiveNum, { color: C.carbon }]}>{p.number}</Text>
          </View>
        ))}
      </View>

      {/* Last 5 plays */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
        {events.length === 0
          ? <Text style={{ color: C.drift, fontSize: 14, textAlign: 'center', marginTop: 24 }}>No events yet</Text>
          : events.slice(0, 5).map((e, i) => (
            <View key={e.id} style={[S.pbpEventCard, { borderBottomColor: C.mist }, i === 4 && { borderBottomWidth: 0 }]}>
              <Text style={[S.pbpEventTitle, { color: eventColor(e) }]}>{eventTitle(e)}</Text>
              <Text style={[S.pbpEventDetail, { color: C.carbon }]}>{eventDetail(e, allPlayers)}</Text>
              <Text style={[S.pbpEventMeta, { color: C.drift }]}>{e.gameClock} · {periodLabel(e.period)}</Text>
            </View>
          ))
        }
      </ScrollView>

      {/* Rotate banner */}
      <View style={[S.rotateBanner, { backgroundColor: C.carbon, paddingBottom: insets.bottom + 16 }]}>
        <IconSymbol name="rotate.right" size={20} color={C.paper} />
        <Text style={{ color: C.paper, fontSize: 15, fontWeight: '700', marginLeft: 10 }}>Rotate to track</Text>
      </View>
    </View>
  );

  const renderLive = () => {
    if (!isLandscape) return renderPortraitQuickView();
    return renderLandscapeLive();
  };

  const renderLandscapeLive = () => (
    <View style={[S.liveRoot, {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    }]}>

      {/* ── LEFT PANEL: Shots ─────────────────────────────────────────────── */}
      <View style={[S.shotPanel, { borderRightColor: C.mist }]}>

        {/* Make / Miss column headers */}
        <View style={S.shotHeaderRow}>
          <Text style={[S.makeHeader, { color: C.gain }]}>Make</Text>
          <Text style={[S.missHeader, { color: C.heat }]}>Miss</Text>
        </View>

        {/* 3pt row */}
        <View style={S.shotPairRow}>
          <Pressable onPress={() => onShotButtonPress('3pt', 'make')}
            style={[S.shotCircle, { borderColor: C.gain, backgroundColor: C.paper }]}>
            <Text style={[S.shotLabel, { color: C.carbon }]}>3pt</Text>
          </Pressable>
          <Pressable onPress={() => onShotButtonPress('3pt', 'miss')}
            style={[S.shotCircle, { borderColor: C.heat, backgroundColor: C.paper }]}>
            <Text style={[S.shotLabel, { color: C.carbon }]}>3pt</Text>
          </Pressable>
        </View>

        {/* 2pt row */}
        <View style={S.shotPairRow}>
          <Pressable onPress={() => onShotButtonPress('2pt', 'make')}
            style={[S.shotCircle, { borderColor: C.gain, backgroundColor: C.paper }]}>
            <Text style={[S.shotLabel, { color: C.carbon }]}>2pt</Text>
          </Pressable>
          <Pressable onPress={() => onShotButtonPress('2pt', 'miss')}
            style={[S.shotCircle, { borderColor: C.heat, backgroundColor: C.paper }]}>
            <Text style={[S.shotLabel, { color: C.carbon }]}>2pt</Text>
          </Pressable>
        </View>

        {/* 1pt row */}
        <View style={S.shotPairRow}>
          <Pressable onPress={() => onShotButtonPress('ft', 'make')}
            style={[S.shotCircle, { borderColor: C.gain, backgroundColor: C.paper }]}>
            <Text style={[S.shotLabel, { color: C.carbon }]}>1pt</Text>
          </Pressable>
          <Pressable onPress={() => onShotButtonPress('ft', 'miss')}
            style={[S.shotCircle, { borderColor: C.heat, backgroundColor: C.paper }]}>
            <Text style={[S.shotLabel, { color: C.carbon }]}>1pt</Text>
          </Pressable>
        </View>

        {/* Bottom: Exit + Undo */}
        <View style={S.shotBottomRow}>
          <Pressable onPress={handleLiveBack} style={S.shotBotBtn}>
            <View style={[S.shotBotCircle, { backgroundColor: C.linen }]}>
              <IconSymbol name="house.fill" size={17} color={C.carbon} />
            </View>
            <Text style={[S.shotBotLabel, { color: C.drift }]}>Exit</Text>
          </Pressable>
          <Pressable onPress={undoLast} disabled={events.length === 0} style={S.shotBotBtn}>
            <View style={[S.shotBotCircle, { backgroundColor: C.linen }]}>
              <IconSymbol name="arrow.uturn.backward" size={15}
                color={events.length > 0 ? C.carbon : C.drift} />
            </View>
            <Text style={[S.shotBotLabel, { color: C.drift }]}>Undo</Text>
          </Pressable>
        </View>

      </View>

      {/* ── CENTER PANEL ─────────────────────────────────────────────────── */}
      <View style={[S.centerPanel, { borderRightColor: C.mist }]}>

        {/* Current Five strip */}
        <View style={[S.fiveStrip, { borderBottomColor: C.mist }]}>
          {homeOnCourt.slice(0, 5).map(p => (
            <View key={p.id} style={[S.fivePill, { backgroundColor: C.linen, borderColor: C.mist }]}>
              <Text style={[S.fiveNum, { color: C.carbon }]}>{p.number}</Text>
            </View>
          ))}
        </View>

        {/* Scoreboard */}
        <View style={[S.scoreArea, { borderBottomColor: C.mist }]}>
          <View style={S.scoreRow}>
            <Text style={[S.scoreName, { color: C.carbon }]} numberOfLines={1}>{homeName}</Text>
            <Text style={[S.scoreNum, { color: C.carbon }]}>{homeScore}</Text>
          </View>
          <View style={S.scoreRow}>
            <Text style={[S.scoreName, { color: C.carbon }]} numberOfLines={1}>{awayName}</Text>
            <Text style={[S.scoreNum, { color: C.carbon }]}>{awayScore}</Text>
          </View>

          {/* Controls row */}
          <View style={S.controlsRow}>
            <Pressable onPress={() => setShowScoreBlast(true)} style={S.ctrlIconBtn}>
              <IconSymbol name="bell" size={15} color={C.carbon} />
            </Pressable>
            <Pressable onPress={() => setShowTimeoutSheet(true)} style={S.ctrlIconBtn}>
              <IconSymbol name="clock" size={14} color={C.carbon} />
            </Pressable>
            <Pressable onPress={() => setShowPeriodPicker(true)}
              style={[S.periodPill, { backgroundColor: C.linen, borderColor: C.mist }]}>
              <Text style={[S.periodText, { color: C.carbon }]}>{periodLabel(period)}</Text>
            </Pressable>
            <Pressable onPress={() => setShowQD(true)} style={S.ctrlIconBtn}>
              <IconSymbol name="person.2" size={15} color={C.carbon} />
            </Pressable>
            <Pressable onPress={() => setShowPeriodScore(true)} style={S.ctrlIconBtn}>
              <IconSymbol name="info.circle" size={15} color={C.carbon} />
            </Pressable>
          </View>
        </View>

        {/* Content: continuation, player-select, or PBP feed */}
        {contMode ? renderContinuationContent() : pendingAction ? renderPlayerGrid() : renderPbpFeed()}

      </View>

      {/* ── RIGHT PANEL: Stats ────────────────────────────────────────────── */}
      <View style={S.statPanel}>

        {/* Stat circles: 3 rows × 2 */}
        <View style={S.statPairRow}>
          <Pressable onPress={() => logOrPend('rebound', 'def', null)}
            style={[S.statCircle, { backgroundColor: C.linen, borderColor: C.mist }]}>
            <Text style={[S.statTop, { color: C.carbon }]}>def</Text>
            <Text style={[S.statBot, { color: C.drift }]}>reb</Text>
          </Pressable>
          <Pressable onPress={() => logOrPend('rebound', 'off', null)}
            style={[S.statCircle, { backgroundColor: C.linen, borderColor: C.mist }]}>
            <Text style={[S.statTop, { color: C.carbon }]}>off</Text>
            <Text style={[S.statBot, { color: C.drift }]}>reb</Text>
          </Pressable>
        </View>
        <View style={S.statPairRow}>
          <Pressable onPress={() => logOrPend('turnover', null, null)}
            style={[S.statCircle, { backgroundColor: C.linen, borderColor: C.mist }]}>
            <Text style={[S.statTop, { color: C.carbon }]}>to</Text>
          </Pressable>
          <Pressable onPress={() => logOrPend('steal', null, null)}
            style={[S.statCircle, { backgroundColor: C.linen, borderColor: C.mist }]}>
            <Text style={[S.statTop, { color: C.carbon }]}>stl</Text>
          </Pressable>
        </View>
        <View style={S.statPairRow}>
          <Pressable onPress={() => logOrPend('assist', null, null)}
            style={[S.statCircle, { backgroundColor: C.linen, borderColor: C.mist }]}>
            <Text style={[S.statTop, { color: C.carbon }]}>ast</Text>
          </Pressable>
          <Pressable onPress={() => logOrPend('block', null, null)}
            style={[S.statCircle, { backgroundColor: C.linen, borderColor: C.mist }]}>
            <Text style={[S.statTop, { color: C.carbon }]}>blk</Text>
          </Pressable>
        </View>

        {/* Sub / Foul pills */}
        <View style={S.statBottomRow}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSubTeamId('home');
              setSubIncomingId(null);
              setShowSubOverlay(true);
            }}
            style={[S.statPill, { backgroundColor: C.linen, borderColor: C.mist }]}>
            <Text style={[S.statPillLabel, { color: C.carbon }]}>Sub</Text>
          </Pressable>
          <Pressable
            onPress={() => logOrPend('foul', 'personal', null)}
            style={[S.statPill, { backgroundColor: C.linen, borderColor: C.heat }]}>
            <Text style={[S.statPillLabel, { color: C.carbon }]}>Foul</Text>
          </Pressable>
        </View>

      </View>

      {/* Overlays */}
      {showSubOverlay && renderSubOverlay()}
      {renderScoreBlastModal()}
      {renderTimeoutSheet()}
      {showFoulType   && renderFoulTypeOverlay()}
      {showQD         && renderQuickDashboard()}
      {showPeriodScore && renderPeriodScoreboard()}
      {showPeriodPicker && renderPeriodPicker()}

      <BottomSheet visible={showFullPbp} onClose={() => setShowFullPbp(false)} useModal title="Play by Play">
        {events.length === 0
          ? <Text style={[S.pbpEmpty, { color: C.drift, textAlign: 'center', marginTop: 24 }]}>No events yet</Text>
          : events.map(e => (
            <Pressable key={e.id}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Alert.alert('Delete Event?', eventTitle(e), [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => setEvents(prev => prev.filter(ev => ev.id !== e.id)) },
                ]);
              }}
              style={[S.pbpFullRow, { borderBottomColor: C.mist }]}>
              <View style={[S.pbpDot, { backgroundColor: eventColor(e) }]} />
              <View style={{ flex: 1 }}>
                <Text style={[S.pbpFullTitle, { color: eventColor(e) }]}>{eventTitle(e)}</Text>
                <Text style={[S.pbpFullDetail, { color: C.carbon }]}>
                  {eventDetail(e, allPlayers)}
                </Text>
              </View>
              <Text style={[S.pbpClock, { color: C.drift }]}>{e.gameClock}</Text>
            </Pressable>
          ))
        }
      </BottomSheet>

      {toastMsg && (
        <View style={[S.toast, { bottom: insets.bottom + 12 }]}>
          <Text style={S.toastText}>{toastMsg}</Text>
        </View>
      )}
    </View>
  );

  // ── PBP feed (center content when no pendingAction) ────────────────────────
  const renderPbpFeed = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 8 }}>
      {events.length === 0 ? (
        <Text style={[S.pbpEmpty, { color: C.drift, padding: 16 }]}>No events yet</Text>
      ) : (
        events.map((e, i) => (
          <View key={e.id} style={[S.pbpEventCard, { borderBottomColor: C.mist }, i === events.length - 1 && { borderBottomWidth: 0 }]}>
            <Text style={[S.pbpEventTitle, { color: eventColor(e) }]}>{eventTitle(e)}</Text>
            <Text style={[S.pbpEventDetail, { color: C.carbon }]}>{eventDetail(e, allPlayers)}</Text>
            <Text style={[S.pbpEventMeta, { color: C.drift }]}>{e.gameClock} · {periodLabel(e.period)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );

  // ── Continuation content (center panel when contMode is active) ────────────
  const renderContinuationContent = () => {
    if (!contMode) return null;

    if (contMode === 'assist') {
      const renderCircles = (players: GamePlayer[], isHome: boolean) => {
        const bg = isHome ? C.linen : C.mist;
        return (
          <View style={S.pgCircleGrid}>
            <Pressable style={S.pgCircleWrap} onPress={dismissContinuation}>
              <View style={[S.pgCircle, { backgroundColor: bg }]}>
                <Text style={[S.pgCircleNum, { color: C.drift, fontSize: 12 }]}>✕</Text>
              </View>
              <Text style={[S.pgCircleName, { color: C.drift }]}>No Ast</Text>
            </Pressable>
            {players.map(p => (
              <Pressable key={p.id} style={S.pgCircleWrap} onPress={() => {
                logEvent('assist', null, null, p); dismissContinuation();
              }}>
                <View style={[S.pgCircle, { backgroundColor: bg }]}>
                  <Text style={[S.pgCircleNum, { color: C.carbon }]}>{p.number}</Text>
                </View>
                <Text style={[S.pgCircleName, { color: C.carbon }]} numberOfLines={1}>{p.firstName}</Text>
              </Pressable>
            ))}
          </View>
        );
      };
      return (
        <Pressable style={[S.pgRoot, { backgroundColor: C.paper }]} onPress={dismissContinuation}>
          <View style={S.pgInner}>
            <View style={S.pgTeamCol}>
              <Text style={[S.pgTeamName, { color: C.carbon }]}>{homeName}</Text>
              {renderCircles(homeOnCourt, true)}
            </View>
            <View style={S.pgLabelWrap}>
              <View style={[S.pgLabelPill, { borderColor: C.mist, backgroundColor: C.linen }]}>
                <Text style={[S.pgLabelText, { color: C.carbon }]}>Assist?</Text>
              </View>
            </View>
            <View style={S.pgTeamCol}>
              <Text style={[S.pgTeamName, { color: C.carbon }]}>{awayName}</Text>
              {renderCircles(awayOnCourt, false)}
            </View>
          </View>
        </Pressable>
      );
    }

    if (contMode === 'rebound-type') {
      return (
        <View style={[S.contRoot]}>
          <Text style={[S.contLabel, { color: C.drift }]}>REBOUND?</Text>
          <Pressable style={[S.contOptionBtn, { backgroundColor: C.linen, borderColor: C.mist }]}
            onPress={() => { setContMode(null); logOrPend('rebound', 'def', null); }}>
            <Text style={[S.contOptionText, { color: C.carbon }]}>Def Rebound</Text>
          </Pressable>
          <Pressable style={[S.contOptionBtn, { backgroundColor: C.linen, borderColor: C.mist }]}
            onPress={() => { setContMode(null); logOrPend('rebound', 'off', null); }}>
            <Text style={[S.contOptionText, { color: C.carbon }]}>Off Rebound</Text>
          </Pressable>
          <Pressable style={S.contDismiss} onPress={dismissContinuation}>
            <Text style={[S.contDismissText, { color: C.drift }]}>No Rebound</Text>
          </Pressable>
        </View>
      );
    }

    if (contMode === 'ft-count') {
      return (
        <View style={[S.contRoot]}>
          <Text style={[S.contLabel, { color: C.drift }]}>FREE THROWS?</Text>
          {(['1 Shot', '2 Shots', '3 Shots', '1-and-1'] as const).map((label, i) => {
            const count = i === 3 ? 2 : i + 1;
            return (
              <Pressable key={label}
                style={[S.contOptionBtn, { backgroundColor: C.linen, borderColor: C.mist }]}
                onPress={() => { setFtTotal(count); setFtDone(0); setContMode('ft-shot'); }}>
                <Text style={[S.contOptionText, { color: C.carbon }]}>{label}</Text>
              </Pressable>
            );
          })}
          <Pressable style={S.contDismiss} onPress={dismissContinuation}>
            <Text style={[S.contDismissText, { color: C.drift }]}>No FTs</Text>
          </Pressable>
        </View>
      );
    }

    if (contMode === 'ft-shot') {
      return (
        <View style={[S.contRoot]}>
          <Text style={[S.contLabel, { color: C.carbon, fontSize: 16, marginBottom: 4 }]}>
            FT {ftDone + 1} of {ftTotal}
          </Text>
          <Text style={[{ color: C.drift, fontSize: 12, marginBottom: 16, textAlign: 'center' }]}>
            Tap 1pt Make or Miss on left, then select shooter
          </Text>
          <Pressable style={S.contDismiss} onPress={dismissContinuation}>
            <Text style={[S.contDismissText, { color: C.drift }]}>Skip FTs</Text>
          </Pressable>
        </View>
      );
    }

    return null;
  };

  // ── Player grid (center content when pendingAction is set) ─────────────────
  const renderPlayerGrid = () => {
    if (!pendingAction) return null;
    const label = pendingActionLabel(pendingAction);

    // Only on-court players + Team option — max 6 per team, fits on screen without scrolling
    const renderTeamCircles = (onCourtPlayers: GamePlayer[], isHome: boolean) => {
      const circleBg = isHome ? C.linen : C.mist;
      const allOptions: (GamePlayer | null)[] = [null, ...onCourtPlayers];
      return (
        <View style={S.pgCircleGrid}>
          {allOptions.map((p, idx) => (
            <Pressable
              key={p ? p.id : 'team'}
              onPress={() => commitAction(p)}
              style={S.pgCircleWrap}
            >
              <View style={[S.pgCircle, { backgroundColor: circleBg }]}>
                {p && <View style={[S.pgOnCourtDot, { backgroundColor: C.carbon }]} />}
                <Text style={[S.pgCircleNum, { color: C.carbon }]}>
                  {p ? p.number : '--'}
                </Text>
              </View>
              <Text style={[S.pgCircleName, { color: C.carbon }]} numberOfLines={1}>
                {p ? p.firstName : 'Team'}
              </Text>
            </Pressable>
          ))}
        </View>
      );
    };

    return (
      <Pressable style={[S.pgRoot, { backgroundColor: C.paper }]} onPress={cancelPending}>
        <View style={S.pgInner}>
          {/* Home team — circles on LEFT side */}
          <View style={S.pgTeamCol}>
            <Text style={[S.pgTeamName, { color: C.carbon }]}>{homeName}</Text>
            {renderTeamCircles(homeOnCourt, true)}
          </View>

          {/* Center: action label */}
          <View style={S.pgLabelWrap}>
            <View style={[S.pgLabelPill, { borderColor: C.mist, backgroundColor: C.linen }]}>
              <Text style={[S.pgLabelText, { color: C.carbon }]}>{label}</Text>
            </View>
          </View>

          {/* Away team — circles on RIGHT side */}
          <View style={S.pgTeamCol}>
            <Text style={[S.pgTeamName, { color: C.carbon }]}>{awayName}</Text>
            {renderTeamCircles(awayOnCourt, false)}
          </View>
        </View>
      </Pressable>
    );
  };

  // ── Sub overlay ────────────────────────────────────────────────────────────
  const renderSubOverlay = () => {
    const teamPlayers = subTeamId === 'home' ? homePlayers : awayPlayers;
    const onCourt     = teamPlayers.filter(p => p.isOnCourt);
    const bench       = teamPlayers.filter(p => !p.isOnCourt);
    const teamName    = subTeamId === 'home' ? homeName : awayName;
    return (
      <>
        <Pressable style={[StyleSheet.absoluteFill, { zIndex: 200, backgroundColor: 'rgba(0,0,0,0.5)' }]}
          onPress={() => { setShowSubOverlay(false); setSubIncomingId(null); }} />
        <View style={[S.overlayPanel, { zIndex: 201, backgroundColor: C.paper }]}>
          <View style={S.overlayHeader}>
            <Pressable onPress={() => { setShowSubOverlay(false); setSubIncomingId(null); }}>
              <Text style={[{ color: C.carbon, fontSize: 15 }]}>Cancel</Text>
            </Pressable>
            <Text style={[S.overlayTitle, { color: C.carbon }]}>{teamName}</Text>
            <Pressable onPress={() => { setShowSubOverlay(false); setSubIncomingId(null); }}>
              <Text style={[{ color: C.carbon, fontSize: 15, fontWeight: '700' }]}>Done</Text>
            </Pressable>
          </View>
          <View style={S.subCols}>
            {/* Court */}
            <View style={{ flex: 1 }}>
              <Text style={[S.subColLabel, { color: C.carbon }]}>Court</Text>
              {onCourt.map(p => (
                <Pressable key={p.id}
                  onPress={() => subIncomingId ? performSub(p.id) : showToast('Select bench player first')}
                  style={[S.subPlayerRow, { backgroundColor: C.linen, borderColor: subIncomingId ? C.heat + '60' : C.mist }]}>
                  <View style={[S.subAvatar, { backgroundColor: C.mist }]}>
                    <Text style={[S.subAvatarText, { color: C.carbon }]}>
                      {p.firstName.charAt(0)}{p.lastName.charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.subName, { color: C.carbon }]}>#{p.number} · {p.firstName} {p.lastName}</Text>
                    <Text style={[S.subStats, { color: C.drift }]}>
                      {events.filter(e => e.playerId === p.id && e.eventType === 'shot' && e.result === 'make').length * 2} PTS
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Divider with Sub button */}
            <View style={S.subMidCol}>
              {subIncomingId && (
                <View style={[S.subMidBtn, { backgroundColor: C.carbon }]}>
                  <Text style={[{ color: C.paper, fontSize: 13, fontWeight: '700' }]}>Sub</Text>
                </View>
              )}
              <Pressable onPress={() => { setShowSubOverlay(false); setSubIncomingId(null); }}>
                <Text style={[{ color: C.heat, fontSize: 13, fontWeight: '600', marginTop: 8 }]}>Reset</Text>
              </Pressable>
            </View>

            {/* Bench */}
            <View style={{ flex: 1 }}>
              <Text style={[S.subColLabel, { color: C.drift }]}>Bench</Text>
              {bench.map(p => (
                <Pressable key={p.id}
                  onPress={() => { Haptics.selectionAsync(); setSubIncomingId(p.id); }}
                  style={[S.subPlayerRow, { backgroundColor: subIncomingId === p.id ? C.gain + '20' : C.linen, borderColor: subIncomingId === p.id ? C.gain : C.mist }]}>
                  <View style={[S.subAvatar, { backgroundColor: C.mist }]}>
                    <Text style={[S.subAvatarText, { color: C.carbon }]}>
                      {p.firstName.charAt(0)}{p.lastName.charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.subName, { color: C.carbon }]}>#{p.number} · {p.firstName} {p.lastName}</Text>
                    <Text style={[S.subStats, { color: C.drift }]}>0 PTS · 0 REB</Text>
                  </View>
                </Pressable>
              ))}
              {bench.length === 0 && (
                <Text style={[{ color: C.drift, fontSize: 13, fontStyle: 'italic', marginTop: 8 }]}>No bench players</Text>
              )}
            </View>
          </View>
        </View>
      </>
    );
  };

  // ── Score blast modal ──────────────────────────────────────────────────────
  const renderScoreBlastModal = () => showScoreBlast ? (
    <>
      <Pressable style={[StyleSheet.absoluteFill, { zIndex: 300, backgroundColor: 'rgba(0,0,0,0.4)' }]}
        onPress={() => setShowScoreBlast(false)} />
      <View style={[S.scoreBlastCard, { zIndex: 301, backgroundColor: C.linen }]}>
        <Text style={[S.scoreBlastTitle, { color: C.carbon }]}>Send Score Blast?</Text>
        <Text style={[S.scoreBlastSub, { color: C.drift }]}>Push a live score update to all followers</Text>
        <View style={S.scoreBlastBtns}>
          <Pressable onPress={() => setShowScoreBlast(false)}
            style={[S.scoreBlastCancel, { backgroundColor: C.linen, borderColor: C.mist }]}>
            <Text style={{ color: C.carbon, fontSize: 15, fontWeight: '600' }}>Cancel</Text>
          </Pressable>
          <Pressable onPress={() => { setShowScoreBlast(false); showToast('Score blast sent!'); }}
            style={[S.scoreBlastSend, { backgroundColor: C.carbon }]}>
            <Text style={{ color: C.paper, fontSize: 15, fontWeight: '700' }}>Send</Text>
          </Pressable>
        </View>
      </View>
    </>
  ) : null;

  // ── Timeout sheet ──────────────────────────────────────────────────────────
  const renderTimeoutSheet = () => (
    <BottomSheet visible={showTimeoutSheet} onClose={() => setShowTimeoutSheet(false)} useModal title="Timeout">
      <Text style={[{ color: C.drift, fontSize: 13, paddingHorizontal: 16, marginBottom: 8 }]}>Select team</Text>
      {[{ id: 'home', name: homeName }, { id: 'away', name: awayName }].map(t => (
        <Pressable key={t.id}
          onPress={() => { logEvent('timeout', t.id, null, null); setShowTimeoutSheet(false); }}
          style={[S.timeoutRow, { backgroundColor: C.linen, borderColor: C.mist }]}>
          <Text style={[{ color: C.carbon, fontSize: 15 }]}>{t.name} Timeout</Text>
        </Pressable>
      ))}
    </BottomSheet>
  );

  // ── Foul type overlay ─────────────────────────────────────────────────────
  const renderFoulTypeOverlay = () => (
    <>
      <Pressable style={[StyleSheet.absoluteFill, { zIndex: 300, backgroundColor: 'rgba(0,0,0,0.45)' }]}
        onPress={() => { setShowFoulType(false); setFoulPendingPlayer(null); }} />
      <View style={[S.foulTypeCard, { zIndex: 301, backgroundColor: C.linen }]}>
        <Text style={[S.foulTypeTitle, { color: C.carbon }]}>Foul Type</Text>
        {foulPendingPlayer && (
          <Text style={[{ color: C.drift, fontSize: 12, textAlign: 'center', marginBottom: 12 }]}>
            #{foulPendingPlayer.number} {foulPendingPlayer.firstName} {foulPendingPlayer.lastName}
          </Text>
        )}
        {(['Personal', 'Shooting', 'Offensive', 'Technical', 'Flagrant'] as FoulType[]).map(ft => (
          <Pressable key={ft} onPress={() => commitFoul(ft)}
            style={[S.foulTypeRow, { backgroundColor: C.paper, borderColor: C.mist }]}>
            <Text style={[{ color: C.carbon, fontSize: 15, fontWeight: '600' }]}>{ft}</Text>
          </Pressable>
        ))}
        <Pressable style={{ paddingVertical: 12 }}
          onPress={() => { setShowFoulType(false); setFoulPendingPlayer(null); }}>
          <Text style={[{ color: C.drift, fontSize: 14, fontWeight: '600', textAlign: 'center' }]}>Cancel</Text>
        </Pressable>
      </View>
    </>
  );

  // ── Quick Dashboard overlay ───────────────────────────────────────────────
  const renderQuickDashboard = () => {
    const renderPlayerStats = (players: GamePlayer[], fouls: number, timeouts: number, teamName: string) => (
      <View style={{ flex: 1 }}>
        <View style={{ paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.mist, marginBottom: 4 }}>
          <Text style={[{ color: C.carbon, fontSize: 11, fontWeight: '700' }]}>{teamName}</Text>
          <Text style={[{ color: C.drift, fontSize: 10, marginTop: 1 }]}>
            Team Fouls: {fouls}  ·  Timeouts: {timeouts}
          </Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {players.map(p => {
            const pe = events.filter(e => e.playerId === p.id);
            const makes = pe.filter(e => e.eventType === 'shot' && e.result === 'make');
            const pts = makes.reduce((s, e) => s + (e.eventSubtype === '3pt' ? 3 : e.eventSubtype === 'ft' ? 1 : 2), 0);
            const reb = pe.filter(e => e.eventType === 'rebound').length;
            const fls = pe.filter(e => e.eventType === 'foul').length;
            const tov = pe.filter(e => e.eventType === 'turnover').length;
            return (
              <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 5, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.mist, gap: 6 }}>
                <View style={[{ width: 28, height: 28, borderRadius: 14, backgroundColor: p.isOnCourt ? C.carbon : C.linen, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }]}>
                  <Text style={[{ fontSize: 10, fontWeight: '800', color: p.isOnCourt ? C.paper : C.drift }]}>{p.number}</Text>
                </View>
                <Text style={[{ flex: 1, fontSize: 11, fontWeight: '600', color: C.carbon }]} numberOfLines={1}>
                  {p.firstName} {p.lastName.charAt(0)}.
                </Text>
                <Text style={[{ fontSize: 11, fontWeight: '700', color: EV_GAIN, minWidth: 22, textAlign: 'right' }]}>{pts}</Text>
                <Text style={[{ fontSize: 9, color: C.drift }]}>PTS</Text>
                <Text style={[{ fontSize: 11, fontWeight: '700', color: C.carbon, minWidth: 18, textAlign: 'right', marginLeft: 4 }]}>{reb}</Text>
                <Text style={[{ fontSize: 9, color: C.drift }]}>REB</Text>
                <Text style={[{ fontSize: 11, fontWeight: '700', color: fls >= 4 ? EV_HEAT : C.carbon, minWidth: 18, textAlign: 'right', marginLeft: 4 }]}>{fls}</Text>
                <Text style={[{ fontSize: 9, color: C.drift }]}>FLS</Text>
                <Text style={[{ fontSize: 11, fontWeight: '700', color: tov >= 3 ? EV_HEAT : C.carbon, minWidth: 18, textAlign: 'right', marginLeft: 4 }]}>{tov}</Text>
                <Text style={[{ fontSize: 9, color: C.drift }]}>TO</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );

    return (
      <>
        <Pressable style={[StyleSheet.absoluteFill, { zIndex: 400, backgroundColor: 'rgba(0,0,0,0.5)' }]}
          onPress={() => setShowQD(false)} />
        <View style={[StyleSheet.absoluteFill, { zIndex: 401, backgroundColor: C.paper,
          paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8,
          paddingLeft: insets.left + 16, paddingRight: insets.right + 16 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={[{ color: C.carbon, fontSize: 15, fontWeight: '700' }]}>{homeName} vs {awayName}</Text>
            <Pressable onPress={() => setShowQD(false)} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={24} color={C.drift} />
            </Pressable>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', gap: 12 }}>
            {renderPlayerStats(homePlayers, homeFoulsH, homeTimeouts, homeName)}
            <View style={{ width: StyleSheet.hairlineWidth, backgroundColor: C.mist }} />
            {renderPlayerStats(awayPlayers, awayFoulsH, awayTimeouts, awayName)}
          </View>
        </View>
      </>
    );
  };

  // ── Period Scoreboard overlay ─────────────────────────────────────────────
  const renderPeriodScoreboard = () => {
    const hasOT = [period, ...events.map(e => e.period)].some(p => p === 'OT1' || p === 'OT2');
    return (
      <>
        <Pressable style={[StyleSheet.absoluteFill, { zIndex: 400, backgroundColor: 'rgba(0,0,0,0.45)' }]}
          onPress={() => setShowPeriodScore(false)} />
        <View style={[S.scoreBlastCard, { zIndex: 401, backgroundColor: C.linen, maxWidth: 440, alignSelf: 'center' }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={[{ color: C.carbon, fontSize: 16, fontWeight: '700' }]}>Period Scoreboard</Text>
            <Pressable onPress={() => setShowPeriodScore(false)} hitSlop={8}>
              <IconSymbol name="xmark" size={16} color={C.drift} />
            </Pressable>
          </View>
          {/* Header row */}
          <View style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.mist }}>
            <Text style={[{ flex: 2, color: C.drift, fontSize: 11, fontWeight: '600' }]}>TEAM</Text>
            <Text style={[{ width: 44, textAlign: 'center', color: C.drift, fontSize: 11, fontWeight: '600' }]}>H1</Text>
            <Text style={[{ width: 44, textAlign: 'center', color: C.drift, fontSize: 11, fontWeight: '600' }]}>H2</Text>
            {hasOT && <Text style={[{ width: 44, textAlign: 'center', color: C.drift, fontSize: 11, fontWeight: '600' }]}>OT</Text>}
            <Text style={[{ width: 44, textAlign: 'center', color: C.carbon, fontSize: 11, fontWeight: '700' }]}>TOT</Text>
          </View>
          {/* Home row */}
          <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.mist }}>
            <Text style={[{ flex: 2, color: C.carbon, fontSize: 13, fontWeight: '600' }]} numberOfLines={1}>{homeName}</Text>
            <Text style={[{ width: 44, textAlign: 'center', color: C.carbon, fontSize: 13 }]}>{scoreByPeriod.home1}</Text>
            <Text style={[{ width: 44, textAlign: 'center', color: C.carbon, fontSize: 13 }]}>{scoreByPeriod.home2}</Text>
            {hasOT && <Text style={[{ width: 44, textAlign: 'center', color: C.carbon, fontSize: 13 }]}>{scoreByPeriod.homeOT1 + scoreByPeriod.homeOT2}</Text>}
            <Text style={[{ width: 44, textAlign: 'center', color: C.carbon, fontSize: 14, fontWeight: '700' }]}>{homeScore}</Text>
          </View>
          {/* Away row */}
          <View style={{ flexDirection: 'row', paddingVertical: 8 }}>
            <Text style={[{ flex: 2, color: C.carbon, fontSize: 13, fontWeight: '600' }]} numberOfLines={1}>{awayName}</Text>
            <Text style={[{ width: 44, textAlign: 'center', color: C.carbon, fontSize: 13 }]}>{scoreByPeriod.away1}</Text>
            <Text style={[{ width: 44, textAlign: 'center', color: C.carbon, fontSize: 13 }]}>{scoreByPeriod.away2}</Text>
            {hasOT && <Text style={[{ width: 44, textAlign: 'center', color: C.carbon, fontSize: 13 }]}>{scoreByPeriod.awayOT1 + scoreByPeriod.awayOT2}</Text>}
            <Text style={[{ width: 44, textAlign: 'center', color: C.carbon, fontSize: 14, fontWeight: '700' }]}>{awayScore}</Text>
          </View>
        </View>
      </>
    );
  };

  // ── Period picker modal ───────────────────────────────────────────────────
  const PERIOD_OPTIONS: Period[] = [1, 2, 'OT1', 'OT2'];
  const renderPeriodPicker = () => (
    <>
      <Pressable style={[StyleSheet.absoluteFill, { zIndex: 400, backgroundColor: 'rgba(0,0,0,0.4)' }]}
        onPress={() => setShowPeriodPicker(false)} />
      <View style={[S.scoreBlastCard, { zIndex: 401, backgroundColor: C.linen, maxWidth: 280, alignSelf: 'center' }]}>
        <Text style={[S.scoreBlastTitle, { color: C.carbon, marginBottom: 12 }]}>Select Period</Text>
        {PERIOD_OPTIONS.map(p => (
          <Pressable key={String(p)} onPress={() => {
            const wasHalftime = period === 1 && p === 2;
            setPeriod(p);
            setClockSeconds(halfMinutes * 60);
            setClockRunning(false);
            setShowPeriodPicker(false);
            if (wasHalftime) showToast('Halftime — 2nd Half starting');
            if (p === 2 && period !== 1) {} // OT transitions handled above
          }}
            style={[S.foulTypeRow, {
              backgroundColor: period === p ? C.carbon : C.paper,
              borderColor: period === p ? C.carbon : C.mist,
            }]}>
            <Text style={[{ fontSize: 15, fontWeight: '600', color: period === p ? C.paper : C.carbon }]}>
              {periodLabel(p)}
            </Text>
          </Pressable>
        ))}
        <Pressable style={{ paddingVertical: 12 }} onPress={() => setShowPeriodPicker(false)}>
          <Text style={[{ color: C.drift, fontSize: 14, fontWeight: '600', textAlign: 'center' }]}>Cancel</Text>
        </Pressable>
      </View>
    </>
  );

  // ============================================================================
  // RENDER: Box Score
  // ============================================================================

  const renderBoxScore = () => {
    const homeData = computeBoxScore('home');
    const awayData = computeBoxScore('away');

    const homeFouls = homeData.reduce((sum, r) => sum + r.pf, 0);
    const awayFouls = awayData.reduce((sum, r) => sum + r.pf, 0);

    const statColor = (key: string, val: number): string => {
      if (key === 'pts' && val >= 20) return EV_GAIN;
      if (key === 'reb' && val >= 10) return EV_GAIN;
      if (key === 'ast' && val >= 10) return EV_GAIN;
      if (key === 'pf'  && val >= 5)  return EV_HEAT;
      if (key === 'tov' && val >= 5)  return EV_HEAT;
      return EV_CARBON;
    };

    const renderPlayerRow = (row: ReturnType<typeof computeBoxScore>[0], showDivider: boolean) => {
      const { player, pts, reb, pf, tov } = row;
      const statItems = [
        { key: 'pts', label: 'PTS', val: pts },
        { key: 'reb', label: 'REB', val: reb },
        { key: 'pf',  label: 'FLS', val: pf  },
        { key: 'tov', label: 'TO',  val: tov  },
      ];
      return (
        <View key={player.id} style={[S.bsPlayerRow, { borderBottomColor: C.mist }, !showDivider && { borderBottomWidth: 0 }]}>
          {/* Avatar */}
          <View style={[S.bsAvatar, { backgroundColor: C.linen }]}>
            <Text style={[S.bsAvatarText, { color: C.carbon }]}>
              {player.firstName.charAt(0)}{player.lastName.charAt(0)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[S.bsPlayerName, { color: C.carbon }]}>#{player.number} · {player.firstName} {player.lastName}</Text>
            <View style={S.bsStatLine}>
              {statItems.map((item, i) => (
                <View key={item.key} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {i > 0 && <Text style={[S.bsPipe, { color: C.drift }]}> | </Text>}
                  <Text style={[S.bsStatVal, { color: statColor(item.key, item.val) }]}>{item.val}</Text>
                  <Text style={[S.bsStatLabel, { color: C.drift }]}> {item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      );
    };

    const renderTeamSection = (data: ReturnType<typeof computeBoxScore>, teamName: string, fouls: number) => (
      <View>
        <View style={[S.bsTeamHeader, { backgroundColor: C.linen, borderBottomColor: C.mist }]}>
          <Text style={[S.bsTeamHeaderName, { color: C.carbon }]}>{teamName}</Text>
          <Text style={[S.bsTeamHeaderSub, { color: C.drift }]}>Team Fouls: {fouls}</Text>
        </View>
        {data.map((row, i) => renderPlayerRow(row, i < data.length - 1))}
      </View>
    );

    return (
      <View style={{ flex: 1, backgroundColor: C.paper }}>
        {/* Header */}
        <View style={[S.bsHeader, { paddingTop: insets.top + 8, borderBottomColor: C.mist }]}>
          <View style={{ flex: 1 }} />
          <View style={{ flex: 4, alignItems: 'center' }}>
            <Text style={[S.bsTitle, { color: C.carbon }]}>{homeName} vs {awayName}</Text>
            <Text style={[S.bsFinalScore, { color: C.carbon }]}>{homeScore} – {awayScore} FINAL</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: 16 }}>
            <Pressable onPress={resetGame} hitSlop={8}>
              <View style={[S.bsCloseBtn, { backgroundColor: C.carbon }]}>
                <IconSymbol name="xmark" size={14} color={C.paper} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Two-column player list */}
        <View style={[S.bsBody, { flex: 1 }]}>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
            <View style={S.bsTwoCol}>
              {/* Home */}
              <View style={[S.bsTeamCol, { borderRightColor: C.mist }]}>
                {renderTeamSection(homeData, homeName, homeFouls)}
              </View>
              {/* Away */}
              <View style={S.bsTeamCol}>
                {renderTeamSection(awayData, awayName, awayFouls)}
              </View>
            </View>

            {/* New Game */}
            <Pressable onPress={resetGame}
              style={[S.newGameBtn, { backgroundColor: C.carbon, marginHorizontal: 16, marginTop: 16 }]}>
              <Text style={[S.newGameText, { color: C.paper }]}>New Game</Text>
            </Pressable>
          </ScrollView>
        </View>

        {toastMsg && (
          <View style={[S.toast, { bottom: insets.bottom + 24 }]}>
            <Text style={S.toastText}>{toastMsg}</Text>
          </View>
        )}
      </View>
    );
  };

  // ============================================================================
  // Root render
  // ============================================================================

  if (gamePhase === 'setup') return renderSetup();
  if (gamePhase === 'end')   return renderBoxScore();
  return renderLive();
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({

  // ── Setup ──────────────────────────────────────────────────────────────────
  setupTopBar:      { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  setupTitle:       { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700' },
  sectionLabel:     { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 20, marginBottom: 6 },
  card:             { borderRadius: 14, overflow: 'hidden' },
  inputRow:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  teamDot:          { width: 10, height: 10, borderRadius: 5 },
  teamInput:        { flex: 1, fontSize: 15, fontWeight: '500', paddingBottom: 4, borderBottomWidth: StyleSheet.hairlineWidth },
  pillRow:          { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  pill:             { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  pillText:         { fontSize: 13, fontWeight: '600' },
  customInput:      { marginTop: 8, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  rosterHeader:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  rosterHeaderText: { fontSize: 14, fontWeight: '700' },
  starterBadge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  starterBadgeText: { fontSize: 12, fontWeight: '700' },
  playerRow:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  jerseyCircle:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  jerseyNum:        { fontSize: 12, fontWeight: '800' },
  playerName:       { fontSize: 14, fontWeight: '500' },
  starterToggle:    { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  startBtn:         { marginTop: 28, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  startBtnText:     { fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },
  iconBtn:          { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  // ── Live root (3-panel horizontal) ────────────────────────────────────────
  liveRoot: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: C.paper,
  },

  // ── Left panel: shots — 20% of landscape width ───────────────────────────
  shotPanel: {
    width: '20%',
    flexDirection: 'column',
    paddingHorizontal: 6,
    paddingTop: 4,
    paddingBottom: 4,
    borderRightWidth: StyleSheet.hairlineWidth,
    backgroundColor: C.paper,
  },
  shotHeaderRow: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingHorizontal: 2,
  },
  makeHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  missHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Each shot row stretches to fill available height; circles maintain square shape
  shotPairRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'stretch',
  },
  shotCircle: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 1.5,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  shotLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  shotBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 4,
    paddingBottom: 2,
  },
  shotBotBtn: {
    alignItems: 'center',
    gap: 2,
  },
  shotBotCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shotBotLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Rotate-to-track banner (portrait quick-view)
  rotateBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
  },

  // ── Center panel ──────────────────────────────────────────────────────────
  centerPanel: {
    flex: 1,
    flexDirection: 'column',
    borderRightWidth: StyleSheet.hairlineWidth,
    backgroundColor: C.paper,
  },

  // Current Five strip
  fiveStrip: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  fivePill: {
    width: 28,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fiveNum: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Scoreboard
  scoreArea: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  scoreName: {
    fontSize: 17,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  scoreNum: {
    fontSize: 26,
    fontWeight: '600',
    fontVariant: ['tabular-nums' as any],
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  ctrlIconBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  periodText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // PBP feed
  pbpEventCard: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 1,
  },
  pbpEventTitle:  { fontSize: 13, fontWeight: '700' },
  pbpEventDetail: { fontSize: 12, fontWeight: '500' },
  pbpEventMeta:   { fontSize: 10 },
  pbpEmpty:       { fontSize: 13 },

  // Full PBP sheet
  pbpFullRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, gap: 10 },
  pbpDot:        { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  pbpFullTitle:  { fontSize: 13, fontWeight: '700' },
  pbpFullDetail: { fontSize: 13 },
  pbpClock:      { fontSize: 10, fontVariant: ['tabular-nums' as any] },

  // Player selection grid — no ScrollView; on-court only (6 per team max)
  pgRoot: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  pgInner: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  pgTeamCol: {
    flex: 1,
    alignItems: 'center',
  },
  pgTeamName: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  // flexWrap grid — 3 circles per row at ~58px each fills ~174px in a ~190px column
  pgCircleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    alignContent: 'flex-start',
  },
  pgCircleWrap: {
    alignItems: 'center',
    width: 64,
    marginBottom: 4,
  },
  pgCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  pgCircleNum: {
    fontSize: 20,
    fontWeight: '700',
  },
  pgCircleName: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
    maxWidth: 62,
  },
  pgOnCourtDot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  pgLabelWrap: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 28,
  },
  pgLabelPill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  pgLabelText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },

  // ── Right panel: stats — 30% of landscape width ──────────────────────────
  statPanel: {
    width: '30%',
    flexDirection: 'column',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 4,
    backgroundColor: C.paper,
  },
  statPairRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'stretch',
  },
  statCircle: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  statTop: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statBot: {
    fontSize: 10,
    fontWeight: '500',
  },
  statBottomRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 4,
    paddingBottom: 2,
  },
  statPill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
  },
  statPillLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Overlays ──────────────────────────────────────────────────────────────
  overlayPanel:  { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: -4 }, elevation: 10 },
  overlayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  overlayTitle:  { fontSize: 17, fontWeight: '700' },
  subCols:       { flexDirection: 'row', gap: 8 },
  subColLabel:   { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 },
  subPlayerRow:  { borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 8 },
  subAvatar:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  subAvatarText: { fontSize: 12, fontWeight: '700' },
  subName:       { fontSize: 13, fontWeight: '600' },
  subStats:      { fontSize: 11, marginTop: 1 },
  subMidCol:     { width: 56, alignItems: 'center', justifyContent: 'center' },
  subMidBtn:     { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 },
  // Score blast
  scoreBlastCard:   { position: 'absolute', top: '35%', left: 24, right: 24, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 2 } },
  scoreBlastTitle:  { fontSize: 18, fontWeight: '600', marginBottom: 4, textAlign: 'center' },
  scoreBlastSub:    { fontSize: 14, marginBottom: 20, textAlign: 'center' },
  scoreBlastBtns:   { flexDirection: 'row', gap: 10 },
  scoreBlastCancel: { flex: 1, borderRadius: 10, borderWidth: 1, paddingVertical: 12, alignItems: 'center' },
  scoreBlastSend:   { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },

  // Timeout
  timeoutRow: { borderRadius: 10, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 4, marginHorizontal: 16 },

  // ── Box score ──────────────────────────────────────────────────────────────
  bsHeader:      { flexDirection: 'row', alignItems: 'center', paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  bsTitle:       { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  bsFinalScore:  { fontSize: 13, fontWeight: '500', marginTop: 2, textAlign: 'center' },
  bsBody:        { flex: 1 },
  bsTwoCol:      { flexDirection: 'row' },
  bsTeamCol:     { flex: 1, borderRightWidth: StyleSheet.hairlineWidth },
  bsTeamHeader:  { paddingHorizontal: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  bsTeamHeaderName: { fontSize: 13, fontWeight: '700' },
  bsTeamHeaderSub:  { fontSize: 11, marginTop: 1 },
  bsPlayerRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, gap: 8 },
  bsAvatar:      { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bsAvatarText:  { fontSize: 11, fontWeight: '700' },
  bsPlayerName:  { fontSize: 12, fontWeight: '600', marginBottom: 3 },
  bsStatLine:    { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  bsStatVal:     { fontSize: 11, fontWeight: '700' },
  bsStatLabel:   { fontSize: 10 },
  bsPipe:        { fontSize: 10 },
  bsCloseBtn:    { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  newGameBtn:    { borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  newGameText:   { fontSize: 15, fontWeight: '800' },

  // Toast
  toast:     { position: 'absolute', alignSelf: 'center', backgroundColor: 'rgba(26,23,20,0.88)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  toastText: { color: '#FFF8F0', fontSize: 13, fontWeight: '600' },

  // ── Continuation dialogs ──────────────────────────────────────────────────
  contRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  contLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
    textAlign: 'center',
  },
  contOptionBtn: {
    width: '85%',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  contOptionText: { fontSize: 14, fontWeight: '600' },
  contDismiss:    { paddingVertical: 10, marginTop: 4 },
  contDismissText: { fontSize: 12, fontWeight: '600' },

  // ── Foul type overlay ─────────────────────────────────────────────────────
  foulTypeCard: {
    position: 'absolute',
    top: '20%',
    left: 32,
    right: 32,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  foulTypeTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  foulTypeRow: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 6,
    alignItems: 'center',
  },
});
