/**
 * StatKeeper — Live Basketball Stat Tracker
 * Three phases: setup → live → end (box score)
 *
 * Game setup: roster configuration + starters selection
 * Live:       clock, scoreboard, player selection, event logging, play-by-play
 * Box score:  per-player stats table, team totals, export
 */

import React, {
  useState, useCallback, useMemo, useRef, useEffect,
} from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput,
  StyleSheet, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { hideFooter, resetFooter } from '@/utils/global-footer-hide';
import {
  MOCK_HOME_ROSTER, MOCK_AWAY_ROSTER, MOCK_GAME_META,
  type GamePlayer,
} from '@/data/mock-statkeeper';

// ── Types ─────────────────────────────────────────────────────────────────────

type GamePhase = 'setup' | 'live' | 'end';
type Period = 1 | 2 | 'OT1' | 'OT2';
type GameType = 'Regular' | 'Conference' | 'Tournament' | 'Scrimmage';

interface GameEvent {
  id: string;
  timestamp: number;
  gameClock: string;
  period: Period;
  teamId: 'home' | 'away';
  playerId: string | null;
  eventType: 'shot' | 'rebound' | 'turnover' | 'steal' | 'assist' | 'block' | 'foul' | 'sub' | 'timeout';
  eventSubtype: string | null;
  result: 'make' | 'miss' | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const NAVY       = '#003A63';
const HOME_COLOR = 'hsl(185, 55%, 32%)';
const AWAY_COLOR = 'hsl(215, 45%, 35%)';
const GREEN      = '#5A8A6E';
const RED        = '#B85C5C';
const CORAL      = '#3B82F6';

const GAME_TYPES: GameType[] = ['Regular', 'Conference', 'Tournament', 'Scrimmage'];
const HALF_PRESETS = [20, 16] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatClock(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function periodLabel(p: Period): string {
  if (p === 1) return '1st Half';
  if (p === 2) return '2nd Half';
  return p;
}

function eventColor(e: GameEvent): string {
  if (e.eventType === 'shot') return e.result === 'make' ? GREEN : RED;
  if (e.eventType === 'rebound')  return '#1D9BF0';
  if (e.eventType === 'turnover') return '#F5A623';
  if (e.eventType === 'steal')    return GREEN;
  if (e.eventType === 'assist')   return '#8B63C8';
  if (e.eventType === 'block')    return NAVY;
  if (e.eventType === 'foul')     return '#E07B9A';
  if (e.eventType === 'sub')      return '#8B9AA8';
  return '#888';
}

function eventLabel(e: GameEvent, players: GamePlayer[]): string {
  const p = players.find(pl => pl.id === e.playerId);
  const name = p ? `#${p.number} ${p.lastName}` : 'Team';
  if (e.eventType === 'shot') {
    const action = e.result === 'make' ? 'made' : 'missed';
    const type = e.eventSubtype === '3pt' ? '3-pointer'
      : e.eventSubtype === 'ft' ? 'free throw' : '2-pointer';
    return `${name} ${action} ${type}`;
  }
  if (e.eventType === 'rebound')  return `${name} ${e.eventSubtype === 'off' ? 'off' : 'def'} rebound`;
  if (e.eventType === 'turnover') return `${name} turnover`;
  if (e.eventType === 'steal')    return `${name} steal`;
  if (e.eventType === 'assist')   return `${name} assist`;
  if (e.eventType === 'block')    return `${name} block`;
  if (e.eventType === 'foul')     return `${name} ${e.eventSubtype ?? 'personal'} foul`;
  if (e.eventType === 'sub')      return `${name} enters`;
  if (e.eventType === 'timeout')  return 'Timeout';
  return e.eventType;
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function StatKeeperScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const S      = useMemo(() => makeStyles(C), [C]);

  // ── Game state ──────────────────────────────────────────────────────────────
  const [gamePhase,      setGamePhase]      = useState<GamePhase>('setup');
  const [homeName,       setHomeName]       = useState(MOCK_GAME_META.homeName);
  const [awayName,       setAwayName]       = useState(MOCK_GAME_META.awayName);
  const [gameType,       setGameType]       = useState<GameType>(MOCK_GAME_META.gameType);
  const [halfMinutes,    setHalfMinutes]    = useState(MOCK_GAME_META.halfMinutes);
  const [customMinutes,  setCustomMinutes]  = useState('');
  const [homePlayers,    setHomePlayers]    = useState<GamePlayer[]>([...MOCK_HOME_ROSTER]);
  const [awayPlayers,    setAwayPlayers]    = useState<GamePlayer[]>([...MOCK_AWAY_ROSTER]);
  const [homeExpanded,   setHomeExpanded]   = useState(true);
  const [awayExpanded,   setAwayExpanded]   = useState(true);

  // ── Live state ──────────────────────────────────────────────────────────────
  const [events,         setEvents]         = useState<GameEvent[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<GamePlayer | null>(null);
  const [clockSeconds,   setClockSeconds]   = useState(MOCK_GAME_META.halfMinutes * 60);
  const [clockRunning,   setClockRunning]   = useState(false);
  const [period,         setPeriod]         = useState<Period>(1);

  // ── Overlay state ───────────────────────────────────────────────────────────
  const [showSubOverlay,  setShowSubOverlay]  = useState(false);
  const [showFoulOverlay, setShowFoulOverlay] = useState(false);
  const [showFullPbp,     setShowFullPbp]     = useState(false);
  const [subTeamId,       setSubTeamId]       = useState<'home' | 'away' | null>(null);
  const [subIncomingId,   setSubIncomingId]   = useState<string | null>(null);
  const [boxScoreTeam,    setBoxScoreTeam]    = useState<'home' | 'away'>('home');
  const [toastMsg,        setToastMsg]        = useState<string | null>(null);

  const clockRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const toastTimer  = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const allPlayers  = useMemo(() => [...homePlayers, ...awayPlayers], [homePlayers, awayPlayers]);

  // ── Clock ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!clockRunning) {
      if (clockRef.current) clearInterval(clockRef.current);
      return;
    }
    clockRef.current = setInterval(() => {
      setClockSeconds(s => {
        if (s <= 1) {
          setClockRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (clockRef.current) clearInterval(clockRef.current); };
  }, [clockRunning]);

  // ── Focus / blur ─────────────────────────────────────────────────────────────
  useFocusEffect(useCallback(() => {
    hideFooter();
    return () => {
      setClockRunning(false);
      resetFooter();
    };
  }, []));

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2000);
  }, []);

  // ── Computed scores ──────────────────────────────────────────────────────────
  const homeScore = useMemo(() =>
    events
      .filter(e => e.teamId === 'home' && e.eventType === 'shot' && e.result === 'make')
      .reduce((sum, e) => {
        if (e.eventSubtype === '3pt') return sum + 3;
        if (e.eventSubtype === 'ft')  return sum + 1;
        return sum + 2;
      }, 0),
  [events]);

  const awayScore = useMemo(() =>
    events
      .filter(e => e.teamId === 'away' && e.eventType === 'shot' && e.result === 'make')
      .reduce((sum, e) => {
        if (e.eventSubtype === '3pt') return sum + 3;
        if (e.eventSubtype === 'ft')  return sum + 1;
        return sum + 2;
      }, 0),
  [events]);

  // ── Box score calculator ─────────────────────────────────────────────────────
  const computeBoxScore = useCallback((teamId: 'home' | 'away') => {
    const players = teamId === 'home' ? homePlayers : awayPlayers;
    return players.map(player => {
      const pe    = events.filter(e => e.playerId === player.id);
      const shots = pe.filter(e => e.eventType === 'shot');
      const makes = shots.filter(e => e.result === 'make');
      const fgm   = makes.filter(e => e.eventSubtype !== 'ft').length;
      const fga   = shots.filter(e => e.eventSubtype !== 'ft').length;
      const fg3m  = makes.filter(e => e.eventSubtype === '3pt').length;
      const fg3a  = shots.filter(e => e.eventSubtype === '3pt').length;
      const ftm   = makes.filter(e => e.eventSubtype === 'ft').length;
      const fta   = shots.filter(e => e.eventSubtype === 'ft').length;
      const pts   = fg3m * 3 + (fgm - fg3m) * 2 + ftm;
      const reb   = pe.filter(e => e.eventType === 'rebound').length;
      const ast   = pe.filter(e => e.eventType === 'assist').length;
      const stl   = pe.filter(e => e.eventType === 'steal').length;
      const blk   = pe.filter(e => e.eventType === 'block').length;
      const tov   = pe.filter(e => e.eventType === 'turnover').length;
      const pf    = pe.filter(e => e.eventType === 'foul').length;
      return { player, pts, fgm, fga, fg3m, fg3a, ftm, fta, reb, ast, stl, blk, tov, pf };
    });
  }, [events, homePlayers, awayPlayers]);

  // ── Event logging ─────────────────────────────────────────────────────────────
  const logEvent = useCallback((
    type: GameEvent['eventType'],
    subtype: string | null,
    result: GameEvent['result'],
    overridePlayer?: GamePlayer | null,
  ) => {
    const player = overridePlayer !== undefined ? overridePlayer : selectedPlayer;
    if (!player && type !== 'timeout') {
      showToast('Select a player first');
      return;
    }
    const event: GameEvent = {
      id: Math.random().toString(36).slice(2),
      timestamp: Date.now(),
      gameClock: formatClock(clockSeconds),
      period,
      teamId: player?.teamId ?? 'home',
      playerId: player?.id ?? null,
      eventType: type,
      eventSubtype: subtype,
      result,
    };
    setEvents(prev => [event, ...prev]);
    if (overridePlayer === undefined) setSelectedPlayer(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [selectedPlayer, clockSeconds, period, showToast]);

  // ── Undo ─────────────────────────────────────────────────────────────────────
  const undoLast = useCallback(() => {
    if (events.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEvents(prev => prev.slice(1));
  }, [events.length]);

  // ── Period management ─────────────────────────────────────────────────────────
  const endPeriod = useCallback(() => {
    setClockRunning(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (period === 1) {
      setPeriod(2);
      setClockSeconds(halfMinutes * 60);
    } else if (period === 2) {
      setGamePhase('end');
    } else if (period === 'OT1') {
      setPeriod('OT2');
      setClockSeconds(5 * 60);
    } else {
      setGamePhase('end');
    }
  }, [period, halfMinutes]);

  // ── Sub management ───────────────────────────────────────────────────────────
  const performSub = useCallback((outgoingId: string) => {
    if (!subTeamId || !subIncomingId) return;
    const setter = subTeamId === 'home' ? setHomePlayers : setAwayPlayers;
    const incomingPlayer = (subTeamId === 'home' ? homePlayers : awayPlayers)
      .find(p => p.id === subIncomingId);
    if (!incomingPlayer) return;

    setter(prev => prev.map(p => {
      if (p.id === subIncomingId) return { ...p, isOnCourt: true };
      if (p.id === outgoingId)   return { ...p, isOnCourt: false };
      return p;
    }));

    logEvent('sub', outgoingId, null, incomingPlayer);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowSubOverlay(false);
    setSubTeamId(null);
    setSubIncomingId(null);
    setSelectedPlayer(null);
  }, [subTeamId, subIncomingId, homePlayers, awayPlayers, logEvent]);

  // ── Game reset ───────────────────────────────────────────────────────────────
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
    setSelectedPlayer(null);
    setBoxScoreTeam('home');
  }, []);

  // ── Setup: toggle starter ────────────────────────────────────────────────────
  const toggleStarter = useCallback((playerId: string, teamId: 'home' | 'away') => {
    const setter  = teamId === 'home' ? setHomePlayers : setAwayPlayers;
    const current = teamId === 'home' ? homePlayers : awayPlayers;
    const player  = current.find(p => p.id === playerId);
    if (!player) return;
    const starters = current.filter(p => p.isOnCourt).length;
    if (!player.isOnCourt && starters >= 5) {
      showToast('Max 5 starters per team');
      return;
    }
    setter(prev => prev.map(p => p.id === playerId ? { ...p, isOnCourt: !p.isOnCourt } : p));
    Haptics.selectionAsync();
  }, [homePlayers, awayPlayers, showToast]);

  // ── Start game ───────────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    const hStarters = homePlayers.filter(p => p.isOnCourt).length;
    const aStarters = awayPlayers.filter(p => p.isOnCourt).length;
    if (hStarters !== 5 || aStarters !== 5) return;
    setClockSeconds(halfMinutes * 60);
    setGamePhase('live');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [homePlayers, awayPlayers, halfMinutes]);

  // ── Back from live ────────────────────────────────────────────────────────────
  const handleLiveBack = useCallback(() => {
    setClockRunning(false);
    Alert.alert(
      'Leave Game?',
      'The game will be paused. Your data will be lost if you navigate away.',
      [
        { text: 'Stay',  style: 'cancel', onPress: () => {} },
        { text: 'Leave', style: 'destructive', onPress: () => router.back() },
      ],
    );
  }, [router]);

  // ── Derived: can start game ──────────────────────────────────────────────────
  const canStart = homePlayers.filter(p => p.isOnCourt).length === 5
    && awayPlayers.filter(p => p.isOnCourt).length === 5;

  // ── Derived: on-court players ────────────────────────────────────────────────
  const homeOnCourt = homePlayers.filter(p => p.isOnCourt);
  const awayOnCourt = awayPlayers.filter(p => p.isOnCourt);

  // ============================================================================
  // RENDER: Setup
  // ============================================================================

  const renderSetup = () => (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={[S.setupTopBar, { paddingTop: insets.top, borderBottomColor: C.separator }]}>
        <Pressable hitSlop={8} onPress={() => router.back()} style={S.iconBtn}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={[S.setupTitle, { color: C.label }]}>Game Setup</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >

        {/* Team Names */}
        <Text style={[S.sectionLabel, { color: C.secondary }]}>TEAMS</Text>
        <View style={[S.card, { backgroundColor: C.surface }]}>
          <View style={S.inputRow}>
            <View style={[S.teamDot, { backgroundColor: HOME_COLOR }]} />
            <TextInput
              style={[S.teamInput, { color: C.label, borderBottomColor: C.separator }]}
              value={homeName}
              onChangeText={setHomeName}
              placeholder="Home team name"
              placeholderTextColor={C.muted}
            />
          </View>
          <View style={S.inputRow}>
            <View style={[S.teamDot, { backgroundColor: AWAY_COLOR }]} />
            <TextInput
              style={[S.teamInput, { color: C.label, borderBottomColor: C.separator, borderBottomWidth: 0 }]}
              value={awayName}
              onChangeText={setAwayName}
              placeholder="Away team name"
              placeholderTextColor={C.muted}
            />
          </View>
        </View>

        {/* Game Type */}
        <Text style={[S.sectionLabel, { color: C.secondary }]}>GAME TYPE</Text>
        <View style={S.pillRow}>
          {GAME_TYPES.map(gt => {
            const active = gameType === gt;
            return (
              <Pressable
                key={gt}
                onPress={() => { Haptics.selectionAsync(); setGameType(gt); }}
                style={[S.pill, {
                  backgroundColor: active ? NAVY : C.surface,
                  borderColor: active ? NAVY : C.inputBorder,
                }]}
              >
                <Text style={[S.pillText, { color: active ? '#fff' : C.secondary }]}>{gt}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Half Length */}
        <Text style={[S.sectionLabel, { color: C.secondary }]}>HALF LENGTH</Text>
        <View style={S.pillRow}>
          {HALF_PRESETS.map(m => {
            const active = halfMinutes === m;
            return (
              <Pressable
                key={m}
                onPress={() => { Haptics.selectionAsync(); setHalfMinutes(m); setCustomMinutes(''); }}
                style={[S.pill, {
                  backgroundColor: active ? NAVY : C.surface,
                  borderColor: active ? NAVY : C.inputBorder,
                }]}
              >
                <Text style={[S.pillText, { color: active ? '#fff' : C.secondary }]}>{m} min</Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => { Haptics.selectionAsync(); setHalfMinutes(0); }}
            style={[S.pill, {
              backgroundColor: halfMinutes === 0 ? NAVY : C.surface,
              borderColor: halfMinutes === 0 ? NAVY : C.inputBorder,
            }]}
          >
            <Text style={[S.pillText, { color: halfMinutes === 0 ? '#fff' : C.secondary }]}>Custom</Text>
          </Pressable>
        </View>
        {halfMinutes === 0 && (
          <TextInput
            style={[S.customInput, { backgroundColor: C.surface, color: C.label, borderColor: C.inputBorder }]}
            value={customMinutes}
            onChangeText={t => {
              setCustomMinutes(t);
              const n = parseInt(t, 10);
              if (!isNaN(n) && n > 0) setHalfMinutes(n);
            }}
            placeholder="Enter minutes"
            placeholderTextColor={C.muted}
            keyboardType="number-pad"
          />
        )}

        {/* Home Roster */}
        {renderRosterSection('home')}

        {/* Away Roster */}
        {renderRosterSection('away')}

        {/* Start Game */}
        <Pressable
          onPress={startGame}
          disabled={!canStart}
          style={[S.startBtn, { backgroundColor: canStart ? NAVY : C.surfacePressed }]}
        >
          <Text style={[S.startBtnText, { color: canStart ? '#fff' : C.muted }]}>
            Start Game
          </Text>
        </Pressable>

      </ScrollView>

      {/* Toast */}
      {toastMsg && (
        <View style={[S.toast, { bottom: insets.bottom + 24 }]}>
          <Text style={S.toastText}>{toastMsg}</Text>
        </View>
      )}
    </View>
  );

  // ── Setup: roster section ─────────────────────────────────────────────────────
  const renderRosterSection = (teamId: 'home' | 'away') => {
    const players  = teamId === 'home' ? homePlayers : awayPlayers;
    const expanded = teamId === 'home' ? homeExpanded : awayExpanded;
    const toggle   = teamId === 'home'
      ? () => setHomeExpanded(v => !v)
      : () => setAwayExpanded(v => !v);
    const starters = players.filter(p => p.isOnCourt).length;
    const name     = teamId === 'home' ? homeName : awayName;
    const dotColor = teamId === 'home' ? HOME_COLOR : AWAY_COLOR;

    return (
      <View key={teamId}>
        <Text style={[S.sectionLabel, { color: C.secondary }]}>
          {name.toUpperCase()} ROSTER
        </Text>
        <View style={[S.card, { backgroundColor: C.surface }]}>
          <Pressable
            onPress={toggle}
            style={[S.rosterHeader, { borderBottomColor: expanded ? C.separator : 'transparent' }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[S.teamDot, { backgroundColor: dotColor }]} />
              <Text style={[S.rosterHeaderText, { color: C.label }]}>{name}</Text>
              <View style={[S.starterBadge, { backgroundColor: starters === 5 ? GREEN + '20' : C.surfacePressed }]}>
                <Text style={[S.starterBadgeText, { color: starters === 5 ? GREEN : C.secondary }]}>
                  {starters}/5
                </Text>
              </View>
            </View>
            <IconSymbol
              name={expanded ? 'chevron.up' : 'chevron.down'}
              size={14}
              color={C.muted}
            />
          </Pressable>
          {expanded && players.map((p, i) => (
            <Pressable
              key={p.id}
              onPress={() => toggleStarter(p.id, teamId)}
              style={[
                S.playerRow,
                { borderBottomColor: C.separator },
                i === players.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={[S.jerseyCircle, { backgroundColor: p.isOnCourt ? dotColor : C.surfacePressed }]}>
                <Text style={[S.jerseyNum, { color: p.isOnCourt ? '#fff' : C.muted }]}>
                  {p.number}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[S.playerName, { color: C.label }]}>
                  {p.firstName} {p.lastName}
                </Text>
              </View>
              <View style={[
                S.starterToggle,
                p.isOnCourt
                  ? { backgroundColor: dotColor }
                  : { borderWidth: 1.5, borderColor: C.inputBorder },
              ]}>
                {p.isOnCourt && <IconSymbol name="checkmark" size={12} color="#fff" />}
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  // ============================================================================
  // RENDER: Live
  // ============================================================================

  const renderLive = () => (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* Top bar */}
      <View style={[S.liveTopBar, { paddingTop: insets.top, backgroundColor: NAVY }]}>
        <Pressable hitSlop={8} onPress={handleLiveBack} style={S.iconBtn}>
          <IconSymbol name="chevron.left" size={20} color="rgba(255,255,255,0.8)" />
        </Pressable>
        <Text style={S.liveTopTitle}>StatKeeper</Text>
        <Pressable hitSlop={8} onPress={undoLast} style={S.iconBtn} disabled={events.length === 0}>
          <IconSymbol
            name="arrow.uturn.backward"
            size={18}
            color={events.length > 0 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)'}
          />
        </Pressable>
      </View>

      {/* Scoreboard */}
      <View style={[S.scoreboard, { backgroundColor: NAVY }]}>
        <View style={S.scoreTeam}>
          <Text style={S.scoreTeamName} numberOfLines={1}>{homeName}</Text>
          <Text style={S.scoreDigits}>{homeScore}</Text>
        </View>
        <View style={S.scoreMid}>
          <Text style={S.periodText}>{periodLabel(period)}</Text>
          <View style={S.clockRow}>
            <Text style={S.clockText}>{formatClock(clockSeconds)}</Text>
            <Pressable
              hitSlop={8}
              onPress={() => { setClockRunning(r => !r); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={S.clockBtn}
            >
              <IconSymbol
                name={clockRunning ? 'pause.fill' : 'play.fill'}
                size={16}
                color={CORAL}
              />
            </Pressable>
          </View>
          <Pressable
            onPress={endPeriod}
            style={[S.endPeriodBtn, { borderColor: 'rgba(255,255,255,0.3)' }]}
          >
            <Text style={S.endPeriodText}>
              {period === 2 || period === 'OT2' ? 'End Game' : 'End Period'}
            </Text>
          </Pressable>
        </View>
        <View style={[S.scoreTeam, { alignItems: 'flex-end' }]}>
          <Text style={S.scoreTeamName} numberOfLines={1}>{awayName}</Text>
          <Text style={S.scoreDigits}>{awayScore}</Text>
        </View>
      </View>

      {/* Player selection */}
      <View style={[S.playerSelect, { borderBottomColor: C.separator }]}>
        {renderPlayerRow('home', homeOnCourt)}
        {renderPlayerRow('away', awayOnCourt)}
      </View>

      {/* Action area */}
      <View style={S.actionArea}>

        {/* Left: Make / Miss */}
        <View style={S.makeMissPanel}>
          {[
            { sub: '3pt',  label: '3PT' },
            { sub: '2pt',  label: '2PT' },
            { sub: 'ft',   label: 'FT'  },
          ].map(({ sub, label }) => (
            <View key={sub} style={S.shotRow}>
              <Pressable
                onPress={() => logEvent('shot', sub, 'make')}
                style={[S.shotBtn, { borderColor: GREEN }]}
              >
                <Text style={[S.shotBtnMark, { color: GREEN }]}>✓</Text>
                <Text style={[S.shotBtnLabel, { color: GREEN }]}>{label}</Text>
              </Pressable>
              <Pressable
                onPress={() => logEvent('shot', sub, 'miss')}
                style={[S.shotBtn, { borderColor: RED }]}
              >
                <Text style={[S.shotBtnMark, { color: RED }]}>✗</Text>
                <Text style={[S.shotBtnLabel, { color: RED }]}>{label}</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View style={[S.panelDivider, { backgroundColor: C.separator }]} />

        {/* Right: Stat buttons */}
        <View style={S.statPanel}>
          {[
            [
              { label: 'D-Reb', onPress: () => logEvent('rebound', 'def', null) },
              { label: 'O-Reb', onPress: () => logEvent('rebound', 'off', null) },
            ],
            [
              { label: 'TO',    onPress: () => logEvent('turnover', null, null) },
              { label: 'STL',   onPress: () => logEvent('steal', null, null) },
            ],
            [
              { label: 'AST',   onPress: () => logEvent('assist', null, null) },
              { label: 'BLK',   onPress: () => logEvent('block', null, null) },
            ],
            [
              { label: 'Sub',   onPress: () => {
                if (!selectedPlayer) { showToast('Select a player first'); return; }
                setSubTeamId(selectedPlayer.teamId);
                setSubIncomingId(null);
                setShowSubOverlay(true);
              }},
              { label: 'Foul',  onPress: () => {
                if (!selectedPlayer) { showToast('Select a player first'); return; }
                setShowFoulOverlay(true);
              }},
            ],
          ].map((row, ri) => (
            <View key={ri} style={S.statRow}>
              {row.map(({ label, onPress }) => (
                <Pressable
                  key={label}
                  onPress={onPress}
                  style={[S.statBtn, { borderColor: NAVY }]}
                >
                  <Text style={[S.statBtnLabel, { color: NAVY }]}>{label}</Text>
                </Pressable>
              ))}
            </View>
          ))}
        </View>

      </View>

      {/* Play-by-play bar */}
      <Pressable
        onPress={() => setShowFullPbp(true)}
        style={[S.pbpBar, { borderTopColor: C.separator, backgroundColor: C.surface }]}
      >
        <View style={S.pbpBarHeader}>
          <Text style={[S.pbpBarTitle, { color: C.secondary }]}>PLAY BY PLAY</Text>
          <IconSymbol name="chevron.up" size={12} color={C.muted} />
        </View>
        {events.slice(0, 3).map(e => (
          <View key={e.id} style={S.pbpRow}>
            <Text style={[S.pbpClock, { color: C.muted }]}>{e.gameClock}</Text>
            <Text style={[S.pbpText, { color: eventColor(e) }]} numberOfLines={1}>
              {eventLabel(e, allPlayers)}
            </Text>
          </View>
        ))}
        {events.length === 0 && (
          <Text style={[S.pbpEmpty, { color: C.muted }]}>No events yet</Text>
        )}
      </Pressable>

      {/* Bottom safe area */}
      <View style={{ height: insets.bottom, backgroundColor: C.surface }} />

      {/* Sub overlay */}
      {showSubOverlay && subTeamId && renderSubOverlay()}

      {/* Foul overlay */}
      {showFoulOverlay && renderFoulOverlay()}

      {/* Full PBP bottom sheet */}
      <BottomSheet
        visible={showFullPbp}
        onClose={() => setShowFullPbp(false)}
        useModal
        title="Play by Play"
      >
        {events.length === 0 ? (
          <Text style={[S.pbpEmpty, { color: C.muted, textAlign: 'center', marginTop: 24 }]}>
            No events yet
          </Text>
        ) : (
          events.map(e => (
            <Pressable
              key={e.id}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Alert.alert(
                  'Delete Event?',
                  eventLabel(e, allPlayers),
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => setEvents(prev => prev.filter(ev => ev.id !== e.id)),
                    },
                  ],
                );
              }}
              style={[S.pbpFullRow, { borderBottomColor: C.separator }]}
            >
              <View style={S.pbpFullLeft}>
                <Text style={[S.pbpClock, { color: C.muted }]}>{e.gameClock}</Text>
                <Text style={[S.pbpPeriod, { color: C.muted }]}>{periodLabel(e.period)}</Text>
              </View>
              <View style={[S.pbpDot, { backgroundColor: eventColor(e) }]} />
              <Text style={[S.pbpFullText, { color: C.label }]} numberOfLines={2}>
                {eventLabel(e, allPlayers)}
              </Text>
            </Pressable>
          ))
        )}
      </BottomSheet>

      {/* Toast */}
      {toastMsg && (
        <View style={[S.toast, { bottom: insets.bottom + 12 }]}>
          <Text style={S.toastText}>{toastMsg}</Text>
        </View>
      )}

    </View>
  );

  // ── Player row (on-court circles) ──────────────────────────────────────────
  const renderPlayerRow = (teamId: 'home' | 'away', players: GamePlayer[]) => {
    const color = teamId === 'home' ? HOME_COLOR : AWAY_COLOR;
    const label = teamId === 'home' ? homeName.slice(0, 4).toUpperCase() : awayName.slice(0, 4).toUpperCase();
    return (
      <View style={S.playerSelectRow}>
        <Text style={[S.teamTag, { color: teamId === 'home' ? HOME_COLOR : AWAY_COLOR }]}>
          {label}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={S.playerCircles}>
            {players.map(p => {
              const isSelected = selectedPlayer?.id === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedPlayer(prev => prev?.id === p.id ? null : p);
                  }}
                  style={[
                    S.playerCircle,
                    { backgroundColor: color },
                    isSelected && { borderWidth: 3, borderColor: CORAL },
                  ]}
                >
                  <Text style={S.playerCircleNum}>{p.number}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  // ── Sub overlay ────────────────────────────────────────────────────────────
  const renderSubOverlay = () => {
    const teamPlayers = subTeamId === 'home' ? homePlayers : awayPlayers;
    const onCourt     = teamPlayers.filter(p => p.isOnCourt);
    const bench       = teamPlayers.filter(p => !p.isOnCourt);
    return (
      <>
        <Pressable
          style={[StyleSheet.absoluteFill, { zIndex: 200, backgroundColor: 'rgba(0,0,0,0.6)' }]}
          onPress={() => { setShowSubOverlay(false); setSubIncomingId(null); }}
        />
        <View style={[S.overlayPanel, { zIndex: 201, backgroundColor: C.bg }]}>
          <Text style={[S.overlayTitle, { color: C.label }]}>Substitution</Text>
          <Text style={[S.overlayInstr, { color: C.secondary }]}>
            {subIncomingId ? 'Tap the player leaving the court' : 'Tap the player entering the game'}
          </Text>
          <View style={S.subCols}>
            <View style={{ flex: 1 }}>
              <Text style={[S.subColLabel, { color: C.secondary }]}>BENCH</Text>
              {bench.length === 0 && (
                <Text style={[S.subEmptyNote, { color: C.muted }]}>No bench players</Text>
              )}
              {bench.map(p => (
                <Pressable
                  key={p.id}
                  onPress={() => { Haptics.selectionAsync(); setSubIncomingId(p.id); }}
                  style={[
                    S.subPlayerRow,
                    { backgroundColor: C.surface, borderColor: C.separator },
                    subIncomingId === p.id && { backgroundColor: GREEN + '20', borderColor: GREEN },
                  ]}
                >
                  <Text style={[S.subNum, { color: C.label }]}>#{p.number}</Text>
                  <Text style={[S.subName, { color: C.label }]} numberOfLines={1}>{p.lastName}</Text>
                </Pressable>
              ))}
            </View>
            <View style={[S.subColDivider, { backgroundColor: C.separator }]} />
            <View style={{ flex: 1 }}>
              <Text style={[S.subColLabel, { color: C.secondary }]}>ON COURT</Text>
              {onCourt.map(p => (
                <Pressable
                  key={p.id}
                  onPress={() => subIncomingId ? performSub(p.id) : showToast('Select bench player first')}
                  style={[
                    S.subPlayerRow,
                    {
                      backgroundColor: C.surface,
                      borderColor: subIncomingId ? RED + '60' : C.separator,
                    },
                  ]}
                >
                  <Text style={[S.subNum, { color: C.label }]}>#{p.number}</Text>
                  <Text style={[S.subName, { color: C.label }]} numberOfLines={1}>{p.lastName}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </>
    );
  };

  // ── Foul overlay ───────────────────────────────────────────────────────────
  const renderFoulOverlay = () => (
    <>
      <Pressable
        style={[StyleSheet.absoluteFill, { zIndex: 200, backgroundColor: 'rgba(0,0,0,0.6)' }]}
        onPress={() => setShowFoulOverlay(false)}
      />
      <View style={[S.overlayPanel, { zIndex: 201, backgroundColor: C.bg }]}>
        <Text style={[S.overlayTitle, { color: C.label }]}>Foul Type</Text>
        {['Personal', 'Shooting', 'Offensive', 'Technical', 'Flagrant'].map(ft => (
          <Pressable
            key={ft}
            onPress={() => {
              logEvent('foul', ft.toLowerCase(), null);
              setShowFoulOverlay(false);
            }}
            style={[S.foulBtn, { borderColor: C.inputBorder, backgroundColor: C.surface }]}
          >
            <Text style={[S.foulBtnText, { color: C.label }]}>{ft}</Text>
          </Pressable>
        ))}
      </View>
    </>
  );

  // ============================================================================
  // RENDER: Box Score (End)
  // ============================================================================

  const renderBoxScore = () => {
    const boxData = computeBoxScore(boxScoreTeam);
    const totals  = boxData.reduce(
      (acc, r) => ({
        pts: acc.pts + r.pts, fgm: acc.fgm + r.fgm, fga: acc.fga + r.fga,
        fg3m: acc.fg3m + r.fg3m, fg3a: acc.fg3a + r.fg3a,
        ftm: acc.ftm + r.ftm, fta: acc.fta + r.fta,
        reb: acc.reb + r.reb, ast: acc.ast + r.ast,
        stl: acc.stl + r.stl, blk: acc.blk + r.blk,
        tov: acc.tov + r.tov, pf: acc.pf + r.pf,
      }),
      { pts:0, fgm:0, fga:0, fg3m:0, fg3a:0, ftm:0, fta:0, reb:0, ast:0, stl:0, blk:0, tov:0, pf:0 },
    );

    const COLS = [
      { key: 'num',    label: '#',       width: 30  },
      { key: 'name',   label: 'Name',    width: 100 },
      { key: 'pts',    label: 'PTS',     width: 44  },
      { key: 'fgfga',  label: 'FG',      width: 60  },
      { key: 'fg3',    label: '3P',      width: 60  },
      { key: 'ft',     label: 'FT',      width: 60  },
      { key: 'reb',    label: 'REB',     width: 40  },
      { key: 'ast',    label: 'AST',     width: 40  },
      { key: 'stl',    label: 'STL',     width: 40  },
      { key: 'blk',    label: 'BLK',     width: 40  },
      { key: 'tov',    label: 'TO',      width: 40  },
      { key: 'pf',     label: 'PF',      width: 40  },
    ];

    const cellVal = (key: string, row: typeof boxData[0] | null, t = totals): string => {
      const r = row ?? { player: { number: '', lastName: 'TOTAL' }, ...t };
      if (key === 'num')    return r.player.number;
      if (key === 'name')   return r.player.lastName;
      if (key === 'pts')    return String(r.pts);
      if (key === 'fgfga')  return `${r.fgm}-${r.fga}`;
      if (key === 'fg3')    return `${r.fg3m}-${r.fg3a}`;
      if (key === 'ft')     return `${r.ftm}-${r.fta}`;
      if (key === 'reb')    return String(r.reb);
      if (key === 'ast')    return String(r.ast);
      if (key === 'stl')    return String(r.stl);
      if (key === 'blk')    return String(r.blk);
      if (key === 'tov')    return String(r.tov);
      if (key === 'pf')     return String(r.pf);
      return '';
    };

    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>

        {/* Navy hero */}
        <View style={[S.bsHero, { paddingTop: insets.top + 12 }]}>
          <Text style={S.bsFinal}>FINAL</Text>
          <View style={S.bsScoreRow}>
            <View style={S.bsTeamBlock}>
              <Text style={S.bsTeamName}>{homeName}</Text>
              <Text style={S.bsBigScore}>{homeScore}</Text>
            </View>
            <Text style={S.bsDash}>—</Text>
            <View style={[S.bsTeamBlock, { alignItems: 'flex-end' }]}>
              <Text style={S.bsTeamName}>{awayName}</Text>
              <Text style={S.bsBigScore}>{awayScore}</Text>
            </View>
          </View>
          <Text style={S.bsMeta}>{gameType} · {periodLabel(period)}</Text>
        </View>

        {/* Team tab */}
        <View style={[S.bsTabRow, { borderBottomColor: C.separator, backgroundColor: C.surface }]}>
          {(['home', 'away'] as const).map(t => {
            const active = boxScoreTeam === t;
            const name   = t === 'home' ? homeName : awayName;
            return (
              <Pressable
                key={t}
                onPress={() => { Haptics.selectionAsync(); setBoxScoreTeam(t); }}
                style={[S.bsTab, active && { borderBottomColor: CORAL, borderBottomWidth: 2 }]}
              >
                <Text style={[S.bsTabText, { color: active ? CORAL : C.secondary }]}>{name}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Stat table */}
        <ScrollView style={{ flex: 1 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* Header */}
              <View style={[S.bsTableRow, { backgroundColor: C.surface, borderBottomColor: C.separator }]}>
                {COLS.map(col => (
                  <Text
                    key={col.key}
                    style={[S.bsHeaderCell, { width: col.width, color: C.secondary }]}
                    numberOfLines={1}
                  >
                    {col.label}
                  </Text>
                ))}
              </View>

              {/* Data rows */}
              {boxData.map((row, i) => (
                <View
                  key={row.player.id}
                  style={[
                    S.bsTableRow,
                    { borderBottomColor: C.separator },
                    i % 2 === 1 && { backgroundColor: C.surfacePressed },
                  ]}
                >
                  {COLS.map(col => (
                    <Text
                      key={col.key}
                      style={[S.bsCell, { width: col.width, color: C.label }]}
                      numberOfLines={1}
                    >
                      {cellVal(col.key, row)}
                    </Text>
                  ))}
                </View>
              ))}

              {/* Totals */}
              <View style={[S.bsTableRow, { backgroundColor: NAVY + '15', borderTopColor: NAVY + '30', borderTopWidth: 1 }]}>
                {COLS.map(col => (
                  <Text
                    key={col.key}
                    style={[S.bsCell, S.bsTotalCell, { width: col.width, color: NAVY }]}
                    numberOfLines={1}
                  >
                    {col.key === 'num'  ? '' :
                     col.key === 'name' ? 'TOTAL' :
                     cellVal(col.key, null)}
                  </Text>
                ))}
              </View>

            </View>
          </ScrollView>

          {/* Export row */}
          <View style={[S.exportRow, { borderTopColor: C.separator }]}>
            <Text style={[S.exportLabel, { color: C.secondary }]}>Export</Text>
            {['JSON', 'CSV', 'PDF'].map(fmt => (
              <Pressable
                key={fmt}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  showToast('Coming soon');
                }}
                style={[S.exportBtn, { borderColor: C.inputBorder, backgroundColor: C.surface }]}
              >
                <Text style={[S.exportBtnText, { color: C.label }]}>{fmt}</Text>
              </Pressable>
            ))}
          </View>

          {/* New Game */}
          <Pressable
            onPress={resetGame}
            style={[S.newGameBtn, { backgroundColor: NAVY, marginBottom: insets.bottom + 24 }]}
          >
            <Text style={S.newGameText}>New Game</Text>
          </Pressable>

        </ScrollView>

        {/* Toast */}
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

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({

  // Setup
  setupTopBar:    { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  setupTitle:     { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700' },
  sectionLabel:   { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 20, marginBottom: 6 },
  card:           { borderRadius: 14, overflow: 'hidden' },
  inputRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  teamDot:        { width: 10, height: 10, borderRadius: 5 },
  teamInput:      { flex: 1, fontSize: 15, fontWeight: '500', paddingBottom: 4, borderBottomWidth: StyleSheet.hairlineWidth },
  pillRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  pill:           { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  pillText:       { fontSize: 13, fontWeight: '600' },
  customInput:    { marginTop: 8, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  rosterHeader:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  rosterHeaderText: { fontSize: 14, fontWeight: '700' },
  starterBadge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  starterBadgeText: { fontSize: 12, fontWeight: '700' },
  playerRow:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  jerseyCircle:   { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  jerseyNum:      { fontSize: 12, fontWeight: '800' },
  playerName:     { fontSize: 14, fontWeight: '500' },
  starterToggle:  { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  startBtn:       { marginTop: 28, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  startBtnText:   { fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },

  // Live top bar
  liveTopBar:     { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 10, height: undefined },
  liveTopTitle:   { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 2 },
  iconBtn:        { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  // Scoreboard
  scoreboard:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  scoreTeam:      { flex: 1, alignItems: 'flex-start' },
  scoreTeamName:  { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 },
  scoreDigits:    { fontSize: 40, fontWeight: '900', color: '#fff', fontVariant: ['tabular-nums'], lineHeight: 46 },
  scoreMid:       { alignItems: 'center', gap: 2, paddingHorizontal: 8 },
  periodText:     { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 },
  clockRow:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clockText:      { fontSize: 28, fontWeight: '700', color: '#fff', fontVariant: ['tabular-nums'] },
  clockBtn:       { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  endPeriodBtn:   { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginTop: 2 },
  endPeriodText:  { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.3 },

  // Player selection
  playerSelect:   { borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 6 },
  playerSelectRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, gap: 6, paddingVertical: 2 },
  teamTag:        { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, width: 30 },
  playerCircles:  { flexDirection: 'row', gap: 6, paddingHorizontal: 2, paddingVertical: 2 },
  playerCircle:   { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  playerCircleNum: { fontSize: 12, fontWeight: '800', color: '#fff' },

  // Action area
  actionArea:     { flex: 1, flexDirection: 'row' },
  makeMissPanel:  { flex: 1, padding: 8, gap: 4 },
  shotRow:        { flex: 1, flexDirection: 'row', gap: 6 },
  shotBtn:        { flex: 1, borderWidth: 2, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 2 },
  shotBtnMark:    { fontSize: 18, fontWeight: '800', lineHeight: 22 },
  shotBtnLabel:   { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  panelDivider:   { width: 1 },
  statPanel:      { flex: 1, padding: 8, gap: 4 },
  statRow:        { flex: 1, flexDirection: 'row', gap: 6 },
  statBtn:        { flex: 1, borderWidth: 2, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statBtnLabel:   { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  // PBP bar
  pbpBar:         { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, paddingTop: 6, paddingBottom: 4, minHeight: 80 },
  pbpBarHeader:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  pbpBarTitle:    { fontSize: 9, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  pbpRow:         { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  pbpClock:       { fontSize: 10, fontVariant: ['tabular-nums'], width: 32 },
  pbpText:        { flex: 1, fontSize: 12, fontWeight: '500' },
  pbpEmpty:       { fontSize: 12 },

  // Full PBP sheet rows
  pbpFullRow:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, gap: 10 },
  pbpFullLeft:    { width: 52, gap: 2 },
  pbpPeriod:      { fontSize: 9, letterSpacing: 0.3 },
  pbpDot:         { width: 8, height: 8, borderRadius: 4 },
  pbpFullText:    { flex: 1, fontSize: 13 },

  // Overlays
  overlayPanel:   { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: -4 }, elevation: 10 },
  overlayTitle:   { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  overlayInstr:   { fontSize: 13, marginBottom: 16 },
  subCols:        { flexDirection: 'row', gap: 12 },
  subColLabel:    { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 },
  subColDivider:  { width: 1 },
  subPlayerRow:   { borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 8 },
  subNum:         { fontSize: 13, fontWeight: '800', width: 28 },
  subName:        { flex: 1, fontSize: 13, fontWeight: '500' },
  subEmptyNote:   { fontSize: 12, fontStyle: 'italic', marginTop: 4 },
  foulBtn:        { borderRadius: 12, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 8, alignItems: 'center' },
  foulBtnText:    { fontSize: 15, fontWeight: '600' },

  // Box score
  bsHero:         { backgroundColor: NAVY, paddingHorizontal: 24, paddingBottom: 20, alignItems: 'center' },
  bsFinal:        { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  bsScoreRow:     { flexDirection: 'row', alignItems: 'center', gap: 16, width: '100%', justifyContent: 'space-between' },
  bsTeamBlock:    { flex: 1 },
  bsTeamName:     { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: 2 },
  bsBigScore:     { fontSize: 52, fontWeight: '900', color: '#fff', fontVariant: ['tabular-nums'] },
  bsDash:         { fontSize: 24, color: 'rgba(255,255,255,0.3)', fontWeight: '300' },
  bsMeta:         { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 6 },
  bsTabRow:       { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
  bsTab:          { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  bsTabText:      { fontSize: 14, fontWeight: '700' },
  bsTableRow:     { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 10 },
  bsHeaderCell:   { fontSize: 10, fontWeight: '700', letterSpacing: 0.4, paddingHorizontal: 4, textAlign: 'center' },
  bsCell:         { fontSize: 13, fontWeight: '500', paddingHorizontal: 4, textAlign: 'center' },
  bsTotalCell:    { fontWeight: '800' },
  exportRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
  exportLabel:    { fontSize: 12, fontWeight: '600', marginRight: 4 },
  exportBtn:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  exportBtnText:  { fontSize: 13, fontWeight: '600' },
  newGameBtn:     { marginHorizontal: 16, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  newGameText:    { fontSize: 16, fontWeight: '800', color: '#fff' },

  // Toast
  toast:          { position: 'absolute', alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
  toastText:      { color: '#fff', fontSize: 13, fontWeight: '600' },
});
