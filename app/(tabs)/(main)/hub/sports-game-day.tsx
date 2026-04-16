/**
 * Sports Hub — Game Day. Head Coach only.
 * Pills: Game Plan | Scouting | Team | Player Reports
 * Game Plan auto-transitions: Pregame → Live → Halftime → Postgame
 */
import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { openDipsonSheet } from '@/utils/global-dipson-sheet';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';
const DARK    = '#1A1714';
const TOP_BAR_H = 52;

type Pill      = 'gameplan' | 'scouting' | 'team' | 'playerreports';
type GamePhase = 'pregame' | 'live' | 'halftime' | 'postgame';

const PILLS: { key: Pill; label: string }[] = [
  { key: 'gameplan',      label: 'Game Plan'      },
  { key: 'scouting',      label: 'Scouting'       },
  { key: 'team',          label: 'Team'            },
  { key: 'playerreports', label: 'Player Reports'  },
];

const PHASE_LABELS: Record<GamePhase, string> = {
  pregame:  'Pre-Game',
  live:     'Live',
  halftime: 'Halftime',
  postgame: 'Postgame',
};

// ── Mock Data ──────────────────────────────────────────────────────────────────

const STARTERS = [
  { id: 'LK', name: 'Kalejaiye',  kr: 86, pos: 'PG' },
  { id: 'BW', name: 'Williams',   kr: 79, pos: 'SG' },
  { id: 'CM', name: 'McKesey',    kr: 73, pos: 'SF' },
  { id: 'NC', name: 'Chatelain',  kr: 73, pos: 'PF' },
  { id: 'AH', name: 'Hernandez',  kr: 66, pos: 'C'  },
];

const MATCHUPS = [
  { us: 'LK', them: 'M. Reed',    krUs: 86, krThem: 81, edge: +5 },
  { us: 'BW', them: 'K. Johnson', krUs: 79, krThem: 74, edge: +5 },
  { us: 'CM', them: 'T. Davis',   krUs: 73, krThem: 76, edge: -3 },
  { us: 'NC', them: 'R. White',   krUs: 73, krThem: 71, edge: +2 },
  { us: 'AH', them: 'D. Hill',    krUs: 66, krThem: 69, edge: -3 },
];

const PLAY_BY_PLAY = [
  { time: '14:32', text: 'Kalejaiye 3PT make (assist Williams)' },
  { time: '14:10', text: 'Dominican — Reed 2PT make' },
  { time: '13:44', text: 'Williams defensive rebound' },
  { time: '13:29', text: 'McKesey turnover (bad pass)' },
  { time: '13:08', text: 'Dominican — Johnson FT make (1 of 2)' },
];

const BOX_SCORE = [
  { id: 'LK', name: 'Kalejaiye',  pts: 9,  reb: 2, ast: 4, to: 0, fouls: 1 },
  { id: 'BW', name: 'Williams',   pts: 6,  reb: 3, ast: 2, to: 1, fouls: 0 },
  { id: 'CM', name: 'McKesey',    pts: 4,  reb: 4, ast: 1, to: 1, fouls: 2 },
  { id: 'NC', name: 'Chatelain',  pts: 2,  reb: 3, ast: 0, to: 0, fouls: 1 },
  { id: 'AH', name: 'Hernandez',  pts: 0,  reb: 2, ast: 0, to: 0, fouls: 2 },
];

const HALFTIME_ADJUSTMENTS_DEF = [
  { title: 'Switch all PnR actions', impact: '+4 pts/100 projected' },
  { title: 'Sag on Reed off-ball',   impact: 'Reduce 3PT attempts' },
  { title: 'Box out Hill every possession', impact: '-2 OREB/game' },
];

const HALFTIME_ADJUSTMENTS_OFF = [
  { title: 'Attack high post with Chatelain', impact: '+6 pts/100 projected' },
  { title: 'Corner kicks to Kalejaiye',        impact: 'Exploit zone gaps' },
  { title: 'Push pace in transition',          impact: 'Force fatigue on bigs' },
];

const POSTGAME_BOX = [
  { id: 'LK', name: 'Kalejaiye',  pts: 22, reb: 4, ast: 8,  to: 2, fg: '8/17', grade: 'A-'  },
  { id: 'BW', name: 'Williams',   pts: 14, reb: 6, ast: 3,  to: 1, fg: '5/11', grade: 'B+'  },
  { id: 'CM', name: 'McKesey',    pts: 11, reb: 7, ast: 2,  to: 2, fg: '4/9',  grade: 'B'   },
  { id: 'NC', name: 'Chatelain',  pts: 8,  reb: 5, ast: 1,  to: 0, fg: '3/6',  grade: 'B+'  },
  { id: 'AH', name: 'Hernandez',  pts: 5,  reb: 8, ast: 0,  to: 1, fg: '2/4',  grade: 'B-'  },
];

const KEY_PLAYERS_OPP = [
  { initials: 'MR', name: 'Marcus Reed',   pos: 'PG', kr: 81, stats: '18.4 PPG · 6.2 APG', archetype: 'PnR Lead', plan: 'Force left, deny ball screen, contest all shots' },
  { initials: 'KJ', name: 'Kyle Johnson',  pos: 'SG', kr: 74, stats: '14.1 PPG · 44% 3PT',  archetype: 'Corner 3 Specialist', plan: 'Sag 2 steps, no open looks from corner' },
  { initials: 'DH', name: 'Derek Hill',    pos: 'C',  kr: 69, stats: '9.8 PPG · 8.4 RPG',   archetype: 'PnR Roller', plan: 'Blitz ball screen, Hernandez fronts on lob' },
];

const ROSTER_HEALTH = [
  { id: 'LK', name: 'Kalejaiye',  pos: 'PG', status: 'available' as const,     minutes: 32 },
  { id: 'BW', name: 'Williams',   pos: 'SG', status: 'available' as const,     minutes: 28 },
  { id: 'CM', name: 'McKesey',    pos: 'SF', status: 'available' as const,     minutes: 26 },
  { id: 'NC', name: 'Chatelain',  pos: 'PF', status: 'available' as const,     minutes: 24 },
  { id: 'AH', name: 'Hernandez',  pos: 'C',  status: 'available' as const,     minutes: 22 },
  { id: 'SW', name: 'Wall',       pos: 'SG', status: 'questionable' as const,  minutes: 12, reason: 'Ankle — day-to-day' },
  { id: 'PD', name: 'Diomande',   pos: 'PF', status: 'out' as const,           minutes: 0,  reason: 'Academic hold' },
];

const DEPTH_CHART = [
  { pos: 'PG', starter: { id: 'LK', kr: 86 }, backup: { id: 'CP', kr: 61 } },
  { pos: 'SG', starter: { id: 'BW', kr: 79 }, backup: { id: 'SW', kr: 67 } },
  { pos: 'SF', starter: { id: 'CM', kr: 73 }, backup: { id: 'JT', kr: 58 } },
  { pos: 'PF', starter: { id: 'NC', kr: 73 }, backup: { id: 'PD', kr: 64 } },
  { pos: 'C',  starter: { id: 'AH', kr: 66 }, backup: { id: 'MV', kr: 55 } },
];

const PLAYER_REPORTS = [
  {
    id: 'LK', name: 'Laolu Kalejaiye', number: 0, pos: 'PG', kr: 86, archetype: 'PnR Operator',
    okr: 91, dkr: 78, tkr: 88, iqkr: 85,
    recent: [
      { opp: 'vs Fisk',   pts: 27, ast: 6 },
      { opp: 'vs Clark',  pts: 22, ast: 4 },
      { opp: 'vs Moreh.', pts: 18, ast: 7 },
    ],
    matchupNote: 'Guards Marcus Reed (KR 81) · +5 advantage',
    goalStatus: 'On Track',
    starter: true,
  },
  {
    id: 'BW', name: 'Brandon Williams', number: 3, pos: 'SG', kr: 79, archetype: 'Wing Scorer',
    okr: 82, dkr: 74, tkr: 77, iqkr: 79,
    recent: [
      { opp: 'vs Fisk',   pts: 14, ast: 3 },
      { opp: 'vs Clark',  pts: 19, ast: 2 },
      { opp: 'vs Moreh.', pts: 11, ast: 4 },
    ],
    matchupNote: 'Guards Kyle Johnson (KR 74) · +5 advantage',
    goalStatus: 'On Track',
    starter: true,
  },
  {
    id: 'CM', name: 'Claude McKesey', number: 5, pos: 'SF', kr: 73, archetype: 'Two-Way Wing',
    okr: 71, dkr: 80, tkr: 72, iqkr: 68,
    recent: [
      { opp: 'vs Fisk',   pts: 8,  ast: 2 },
      { opp: 'vs Clark',  pts: 11, ast: 1 },
      { opp: 'vs Moreh.', pts: 9,  ast: 3 },
    ],
    matchupNote: 'Guards T. Davis (KR 76) · -3 disadvantage',
    goalStatus: 'Behind',
    starter: true,
  },
  {
    id: 'NC', name: 'Nathan Chatelain', number: 11, pos: 'PF', kr: 73, archetype: 'Stretch 4',
    okr: 76, dkr: 68, tkr: 74, iqkr: 72,
    recent: [
      { opp: 'vs Fisk',   pts: 12, ast: 1 },
      { opp: 'vs Clark',  pts: 7,  ast: 0 },
      { opp: 'vs Moreh.', pts: 14, ast: 2 },
    ],
    matchupNote: 'Guards R. White (KR 71) · +2 advantage',
    goalStatus: 'On Track',
    starter: true,
  },
  {
    id: 'AH', name: 'Adrian Hernandez', number: 21, pos: 'C', kr: 66, archetype: 'Rim Anchor',
    okr: 62, dkr: 74, tkr: 65, iqkr: 60,
    recent: [
      { opp: 'vs Fisk',   pts: 6,  ast: 0 },
      { opp: 'vs Clark',  pts: 4,  ast: 1 },
      { opp: 'vs Moreh.', pts: 8,  ast: 0 },
    ],
    matchupNote: 'Guards D. Hill (KR 69) · -3 disadvantage',
    goalStatus: 'Behind',
    starter: true,
  },
  {
    id: 'SW', name: 'Samuel Wall', number: 14, pos: 'SG', kr: 67, archetype: 'Off-Ball Shooter',
    okr: 72, dkr: 60, tkr: 66, iqkr: 68,
    recent: [
      { opp: 'vs Fisk',   pts: 8,  ast: 1 },
      { opp: 'vs Clark',  pts: 5,  ast: 0 },
      { opp: 'vs Moreh.', pts: 11, ast: 2 },
    ],
    matchupNote: 'Backup SG — spot minutes if healthy',
    goalStatus: 'On Track',
    starter: false,
  },
];

function krColor(kr: number): string {
  if (kr >= 85) return GAIN;
  if (kr >= 75) return '#1A1714';
  if (kr >= 65) return CAUTION;
  return HEAT;
}
function statusColor(s: 'available' | 'questionable' | 'out'): string {
  return s === 'available' ? GAIN : s === 'questionable' ? CAUTION : HEAT;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function SportsGameDayScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('sports:hub');
  const isCoach = role === roleCycles[0];
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [activePill,     setActivePill]     = useState<Pill>('gameplan');
  const [gamePhase,      setGamePhase]      = useState<GamePhase>('pregame');
  const [playerFilter,   setPlayerFilter]   = useState<'all' | 'starters' | 'bench'>('all');
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (!isCoach) router.replace('/(tabs)/(main)/hub/sports-program-overview' as any);
  }, [isCoach]);

  const SH = ({ title }: { title: string }) => (
    <Text style={[s.sectionHeader, { color: C.secondary }]}>{title}</Text>
  );

  // ── GAME PLAN ─────────────────────────────────────────────────────────────────

  const renderGamePlan = () => (
    <View style={{ gap: 20 }}>
      {/* Phase stepper */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.phaseRow}>
        {(['pregame', 'live', 'halftime', 'postgame'] as GamePhase[]).map(phase => (
          <Pressable
            key={phase}
            style={[s.phasePill, { backgroundColor: gamePhase === phase ? C.label : C.surface, borderColor: C.separator }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setGamePhase(phase); }}
          >
            <Text style={[s.phasePillText, { color: gamePhase === phase ? C.bg : C.secondary }]}>{PHASE_LABELS[phase]}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {gamePhase === 'pregame' && renderPregame()}
      {gamePhase === 'live'    && renderLive()}
      {gamePhase === 'halftime' && renderHalftime()}
      {gamePhase === 'postgame' && renderPostgame()}
    </View>
  );

  const renderPregame = () => (
    <View style={{ gap: 20 }}>
      <SH title="STARTING LINEUP" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {STARTERS.map(p => (
          <View key={p.id} style={[s.lineupCard, { backgroundColor: C.surface }]}>
            <Text style={[s.lineupKR, { color: krColor(p.kr) }]}>{p.kr}</Text>
            <Text style={s.lineupInit}>{p.id}</Text>
            <Text style={s.lineupPos}>{p.pos}</Text>
          </View>
        ))}
      </ScrollView>

      <SH title="GAME PLAN LOADED" />
      <View style={[s.darkCard, { backgroundColor: C.surface }]}>
        <View style={s.rowBetween}>
          <Text style={[s.darkCardTitle, { color: C.label }]}>vs Dominican University</Text>
          <View style={[s.badge, { backgroundColor: GAIN }]}>
            <Text style={s.badgeText}>READY</Text>
          </View>
        </View>
        <Text style={[s.darkCardSub, { color: '#8A837C', marginTop: 6 }]}>System: Spread PnR  ·  Key Threat: Marcus Reed #3</Text>
        <View style={[s.dipsonNote, { borderColor: CAUTION + '44' }]}>
          <IconSymbol name="sparkles" size={13} color={CAUTION} />
          <Text style={[s.dipsonNoteText, { color: CAUTION }]}>"Deny ball screen, force left hand, switch all actions"</Text>
        </View>
      </View>

      <SH title="MATCHUP ASSIGNMENTS" />
      <View style={[s.card, { backgroundColor: C.surface }]}>
        {MATCHUPS.map((m, i) => (
          <View key={m.us} style={[s.matchupRow, i < MATCHUPS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
            <View style={[s.matchupPlayer, { backgroundColor: C.bg }]}>
              <Text style={[s.matchupInit, { color: C.label }]}>{m.us}</Text>
              <Text style={[s.matchupKR, { color: C.secondary }]}>{m.krUs}</Text>
            </View>
            <Text style={[s.matchupVs, { color: C.secondary }]}>vs</Text>
            <View style={[s.matchupPlayer, { backgroundColor: C.bg, flex: 1 }]}>
              <Text style={[s.matchupInit, { color: C.label }]}>{m.them}</Text>
              <Text style={[s.matchupKR, { color: C.secondary }]}>{m.krThem}</Text>
            </View>
            <View style={[s.edgeBadge, { backgroundColor: m.edge > 0 ? GAIN + '22' : HEAT + '22' }]}>
              <Text style={[s.edgeText, { color: m.edge > 0 ? GAIN : HEAT }]}>{m.edge > 0 ? `+${m.edge}` : m.edge}</Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable
        style={[s.startBtn, { backgroundColor: C.label }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); setGamePhase('live'); }}
      >
        <Text style={[s.startBtnText, { color: C.bg }]}>Start Game →</Text>
      </Pressable>
    </View>
  );

  const renderLive = () => (
    <View style={{ gap: 16 }}>
      {/* Situation strip */}
      <View style={[s.situationStrip, { backgroundColor: C.surface }]}>
        <View style={s.scoreBlock}>
          <Text style={s.scoreTeam}>LMB</Text>
          <Text style={s.scoreNum}>21</Text>
        </View>
        <View style={s.clockBlock}>
          <Text style={s.clockPeriod}>1ST</Text>
          <Text style={s.clockTime}>14:32</Text>
        </View>
        <View style={s.scoreBlock}>
          <Text style={s.scoreTeam}>DOM</Text>
          <Text style={s.scoreNum}>18</Text>
        </View>
      </View>

      {/* Live box score */}
      <SH title="LIVE BOX SCORE" />
      <View style={[s.card, { backgroundColor: C.surface }]}>
        <View style={s.boxHeader}>
          {['', 'PTS', 'REB', 'AST', 'TO', 'F'].map(h => (
            <Text key={h} style={[s.boxHeaderCell, { color: C.secondary }]}>{h}</Text>
          ))}
        </View>
        {BOX_SCORE.map((p, i) => (
          <View key={p.id} style={[s.boxRow, i < BOX_SCORE.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
            <Text style={[s.boxName, { color: C.label }]}>{p.id}</Text>
            <Text style={[s.boxCell, { color: C.label, fontWeight: '700' }]}>{p.pts}</Text>
            <Text style={[s.boxCell, { color: C.secondary }]}>{p.reb}</Text>
            <Text style={[s.boxCell, { color: C.secondary }]}>{p.ast}</Text>
            <Text style={[s.boxCell, { color: p.to > 0 ? HEAT : C.secondary }]}>{p.to}</Text>
            <Text style={[s.boxCell, { color: p.fouls >= 3 ? HEAT : C.secondary }]}>{p.fouls}</Text>
          </View>
        ))}
      </View>

      {/* Play-by-play */}
      <SH title="PLAY-BY-PLAY" />
      <View style={[s.card, { backgroundColor: C.surface }]}>
        {PLAY_BY_PLAY.map((play, i) => (
          <View key={i} style={[s.pbpRow, i < PLAY_BY_PLAY.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
            <Text style={[s.pbpTime, { color: C.secondary }]}>{play.time}</Text>
            <Text style={[s.pbpText, { color: C.label }]}>{play.text}</Text>
          </View>
        ))}
      </View>

      <Pressable
        style={[s.startBtn, { backgroundColor: C.label }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setGamePhase('halftime'); }}
      >
        <Text style={[s.startBtnText, { color: C.bg }]}>Halftime →</Text>
      </Pressable>
    </View>
  );

  const renderHalftime = () => (
    <View style={{ gap: 20 }}>
      {/* Dipson packet header */}
      <View style={[s.darkCard, { backgroundColor: C.surface }]}>
        <View style={s.rowBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <IconSymbol name="sparkles" size={16} color={CAUTION} />
            <Text style={[s.darkCardTitle, { color: C.label }]}>Dipson Halftime Packet</Text>
          </View>
          <View style={[s.badge, { backgroundColor: GAIN }]}>
            <Text style={s.badgeText}>READY</Text>
          </View>
        </View>
        <Text style={[s.darkCardSub, { color: '#8A837C', marginTop: 4 }]}>Auto-generated from 1st half KStat data</Text>
      </View>

      {/* Game state */}
      <SH title="GAME STATE" />
      <View style={[s.card, { backgroundColor: C.surface }]}>
        <View style={s.fiveFactorsGrid}>
          {[
            { label: 'Score',    value: '38–34', positive: true  },
            { label: 'Fouls',    value: '6–4',   positive: false },
            { label: 'Bonus',    value: 'No',    positive: true  },
            { label: 'TOs',      value: '5–3',   positive: false },
          ].map((item, i) => (
            <View key={item.label} style={[s.factorCell, i % 2 === 0 && { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: C.separator }]}>
              <Text style={[s.factorValue, { color: item.positive ? C.label : HEAT }]}>{item.value}</Text>
              <Text style={[s.factorLabel, { color: C.secondary }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Five factors */}
      <SH title="FIVE FACTORS (1ST HALF)" />
      <View style={[s.card, { backgroundColor: C.surface }]}>
        {[
          { label: 'eFG%',     us: '52.1', them: '48.3', better: true  },
          { label: 'TO%',      us: '14.2', them: '11.8', better: false },
          { label: 'OREB%',    us: '28.4', them: '32.1', better: false },
          { label: 'FT Rate',  us: '0.24', them: '0.31', better: false },
          { label: 'Transition', us: '+4', them: '+2',   better: true  },
        ].map((f, i) => (
          <View key={f.label} style={[s.factorRow, i < 4 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
            <Text style={[s.factorRowLabel, { color: C.secondary }]}>{f.label}</Text>
            <Text style={[s.factorRowUs, { color: f.better ? GAIN : HEAT }]}>{f.us}</Text>
            <Text style={[s.factorRowVs, { color: C.secondary }]}>vs</Text>
            <Text style={[s.factorRowThem, { color: C.label }]}>{f.them}</Text>
          </View>
        ))}
      </View>

      {/* Adjustments */}
      <SH title="DEFENSIVE ADJUSTMENTS" />
      <View style={[s.card, { backgroundColor: C.surface }]}>
        {HALFTIME_ADJUSTMENTS_DEF.map((adj, i) => (
          <View key={i} style={[s.adjRow, i < HALFTIME_ADJUSTMENTS_DEF.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.adjTitle, { color: C.label }]}>{adj.title}</Text>
              <Text style={[s.adjImpact, { color: GAIN }]}>{adj.impact}</Text>
            </View>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <IconSymbol name="plus.circle" size={20} color={C.label} />
            </Pressable>
          </View>
        ))}
      </View>

      <SH title="OFFENSIVE ADJUSTMENTS" />
      <View style={[s.card, { backgroundColor: C.surface }]}>
        {HALFTIME_ADJUSTMENTS_OFF.map((adj, i) => (
          <View key={i} style={[s.adjRow, i < HALFTIME_ADJUSTMENTS_OFF.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.adjTitle, { color: C.label }]}>{adj.title}</Text>
              <Text style={[s.adjImpact, { color: GAIN }]}>{adj.impact}</Text>
            </View>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <IconSymbol name="plus.circle" size={20} color={C.label} />
            </Pressable>
          </View>
        ))}
      </View>

      <Pressable
        style={[s.startBtn, { backgroundColor: C.label }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setGamePhase('postgame'); }}
      >
        <Text style={[s.startBtnText, { color: C.bg }]}>Final Buzzer →</Text>
      </Pressable>
    </View>
  );

  const renderPostgame = () => (
    <View style={{ gap: 20 }}>
      {/* Result */}
      <View style={[s.darkCard, { backgroundColor: C.surface }]}>
        <View style={s.rowBetween}>
          <Text style={[s.darkCardTitle, { color: C.label }]}>Final — Lincoln MBB</Text>
          <View style={[s.badge, { backgroundColor: GAIN }]}>
            <Text style={s.badgeText}>W</Text>
          </View>
        </View>
        <Text style={[{ fontSize: 32, fontWeight: '900', color: C.label, marginTop: 8 }]}>68 – 59</Text>
        <Text style={[s.darkCardSub, { color: '#8A837C', marginTop: 4 }]}>vs Dominican University  ·  Away</Text>
      </View>

      {/* Box score */}
      <SH title="FINAL BOX SCORE" />
      <View style={[s.card, { backgroundColor: C.surface }]}>
        <View style={s.boxHeader}>
          {['', 'PTS', 'REB', 'AST', 'FG', 'GRD'].map(h => (
            <Text key={h} style={[s.boxHeaderCell, { color: C.secondary }]}>{h}</Text>
          ))}
        </View>
        {POSTGAME_BOX.map((p, i) => (
          <View key={p.id} style={[s.boxRow, i < POSTGAME_BOX.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
            <Text style={[s.boxName, { color: C.label }]}>{p.id}</Text>
            <Text style={[s.boxCell, { color: C.label, fontWeight: '700' }]}>{p.pts}</Text>
            <Text style={[s.boxCell, { color: C.secondary }]}>{p.reb}</Text>
            <Text style={[s.boxCell, { color: C.secondary }]}>{p.ast}</Text>
            <Text style={[s.boxCell, { color: C.secondary }]}>{p.fg}</Text>
            <View style={[s.gradePill, { backgroundColor: p.grade.startsWith('A') ? GAIN + '22' : C.separator }]}>
              <Text style={[s.gradeText, { color: p.grade.startsWith('A') ? GAIN : C.label }]}>{p.grade}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Five factors final */}
      <SH title="FIVE FACTORS — FINAL" />
      <View style={[s.card, { backgroundColor: C.surface }]}>
        {[
          { label: 'eFG%',     us: '54.1', them: '46.8', better: true  },
          { label: 'TO%',      us: '13.8', them: '16.2', better: true  },
          { label: 'OREB%',    us: '30.2', them: '28.6', better: true  },
          { label: 'FT Rate',  us: '0.28', them: '0.22', better: true  },
          { label: 'Transition', us: '+8', them: '+3',   better: true  },
        ].map((f, i) => (
          <View key={f.label} style={[s.factorRow, i < 4 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
            <Text style={[s.factorRowLabel, { color: C.secondary }]}>{f.label}</Text>
            <Text style={[s.factorRowUs, { color: f.better ? GAIN : HEAT }]}>{f.us}</Text>
            <Text style={[s.factorRowVs, { color: C.secondary }]}>vs</Text>
            <Text style={[s.factorRowThem, { color: C.label }]}>{f.them}</Text>
          </View>
        ))}
      </View>

      {/* Media report */}
      <View style={[s.card, { backgroundColor: C.surface, padding: 16 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <IconSymbol name="sparkles" size={16} color={CAUTION} />
          <Text style={[s.adjTitle, { color: C.label }]}>Dipson Game Report Ready</Text>
        </View>
        <Text style={[s.darkCardSub, { color: C.secondary }]}>ESPN-style recap generated. Publishable to Social and KTV.</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <Pressable
            style={[s.mediaBtn, { backgroundColor: C.label }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); openDipsonSheet('Athletics'); }}
          >
            <Text style={[s.mediaBtnText, { color: C.bg }]}>View Report</Text>
          </Pressable>
          <Pressable style={[s.mediaBtn, { backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator }]}>
            <Text style={[s.mediaBtnText, { color: C.label }]}>Share</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  // ── SCOUTING ──────────────────────────────────────────────────────────────────

  const renderScouting = () => (
    <View style={{ gap: 20 }}>
      {/* Opponent overview */}
      <View style={[s.darkCard, { backgroundColor: C.surface }]}>
        <Text style={[s.darkCardTitle, { color: C.label }]}>Dominican University</Text>
        <Text style={[s.darkCardSub, { color: '#8A837C', marginTop: 4 }]}>Record: 12-11  ·  Team KR: 71  ·  Pace: 68.4</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          {['Man Defense', 'PnR Heavy', 'Transition'].map(tag => (
            <View key={tag} style={[s.scoutTag, { borderColor: '#3D352E' }]}>
              <Text style={[s.scoutTagText, { color: '#8A837C' }]}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <SH title="KEY PLAYERS" />
      {KEY_PLAYERS_OPP.map((player, i) => (
        <View key={i} style={[s.card, { backgroundColor: C.surface, padding: 14 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <View style={[s.initCircle, { backgroundColor: C.separator }]}>
              <Text style={[s.initText, { color: C.label }]}>{player.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[s.adjTitle, { color: C.label }]}>{player.name}</Text>
                <View style={[s.krBadge, { backgroundColor: C.bg }]}>
                  <Text style={[s.krBadgeText, { color: krColor(player.kr) }]}>KR {player.kr}</Text>
                </View>
              </View>
              <Text style={[s.darkCardSub, { color: C.secondary }]}>{player.pos}  ·  {player.archetype}</Text>
              <Text style={[s.darkCardSub, { color: C.secondary }]}>{player.stats}</Text>
            </View>
          </View>
          <View style={[s.dipsonNote, { borderColor: C.separator }]}>
            <IconSymbol name="shield.fill" size={12} color={C.secondary} />
            <Text style={[s.dipsonNoteText, { color: C.secondary }]}>{player.plan}</Text>
          </View>
        </View>
      ))}

      <SH title="OFFENSIVE TENDENCIES" />
      <View style={[s.card, { backgroundColor: C.surface }]}>
        {[
          { type: 'Pick & Roll',      freq: '34%', eff: 'High' },
          { type: 'Isolation',        freq: '22%', eff: 'Medium' },
          { type: 'Spot-Up 3PT',      freq: '18%', eff: 'High' },
          { type: 'Post-Up',          freq: '14%', eff: 'Low' },
          { type: 'Transition',       freq: '12%', eff: 'Medium' },
        ].map((t, i) => (
          <View key={t.type} style={[s.tendencyRow, i < 4 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
            <Text style={[s.tendencyType, { color: C.label }]}>{t.type}</Text>
            <Text style={[s.tendencyFreq, { color: C.secondary }]}>{t.freq}</Text>
            <View style={[s.effBadge, { backgroundColor: t.eff === 'High' ? HEAT + '22' : t.eff === 'Medium' ? CAUTION + '22' : GAIN + '22' }]}>
              <Text style={[s.effText, { color: t.eff === 'High' ? HEAT : t.eff === 'Medium' ? CAUTION : GAIN }]}>{t.eff}</Text>
            </View>
          </View>
        ))}
      </View>

      <SH title="DEFENSIVE TENDENCIES" />
      <View style={[s.card, { backgroundColor: C.surface, padding: 14, gap: 8 }]}>
        {[
          { label: 'Scheme',          value: 'Man-to-man, switch on 3-4' },
          { label: 'PnR Coverage',    value: 'Drop — invite mid-range' },
          { label: 'Weakness',        value: 'Slow to close on corner 3s' },
          { label: 'Exploit',         value: 'Attack high post early' },
        ].map(item => (
          <View key={item.label} style={{ flexDirection: 'row', gap: 8 }}>
            <Text style={[s.darkCardSub, { color: C.secondary, width: 110 }]}>{item.label}</Text>
            <Text style={[s.darkCardSub, { color: C.label, flex: 1 }]}>{item.value}</Text>
          </View>
        ))}
      </View>

      <View style={[s.card, { backgroundColor: C.surface, padding: 14 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <IconSymbol name="sparkles" size={14} color={CAUTION} />
          <Text style={[s.adjTitle, { color: C.label }]}>Dipson Game Plan</Text>
        </View>
        <Text style={[s.dipsonBody, { color: C.secondary }]}>
          "Based on Dominican's zone tendencies, recommend attacking the high post with Chatelain and kicking to Kalejaiye in the corner. Their drop coverage on PnR invites our mid-range pull-up — Kalejaiye should attack at 14 feet consistently."
        </Text>
      </View>
    </View>
  );

  // ── TEAM ──────────────────────────────────────────────────────────────────────

  const renderTeam = () => (
    <View style={{ gap: 20 }}>
      {/* Team KR */}
      <View style={[s.card, { backgroundColor: C.surface }]}>
        <View style={s.fiveFactorsGrid}>
          {[
            { label: 'Team KR',    value: '78' },
            { label: 'System Fit', value: '94%' },
            { label: 'Off KR',     value: '81' },
            { label: 'Def KR',     value: '74' },
          ].map((item, i) => (
            <View key={item.label} style={[s.factorCell, i % 2 === 0 && { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: C.separator }]}>
              <Text style={[s.factorValue, { color: C.label }]}>{item.value}</Text>
              <Text style={[s.factorLabel, { color: C.secondary }]}>{item.label}</Text>
            </View>
          ))}
        </View>
        <View style={[{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, paddingHorizontal: 14, paddingVertical: 10 }]}>
          <Text style={[s.darkCardSub, { color: C.secondary }]}>vs Dominican: Team KR 71  ·  <Text style={{ color: GAIN }}>+7 advantage</Text></Text>
        </View>
      </View>

      {/* Depth chart */}
      <SH title="DEPTH CHART" />
      <View style={[s.card, { backgroundColor: C.surface }]}>
        {DEPTH_CHART.map((pos, i) => (
          <View key={pos.pos} style={[s.depthRow, i < DEPTH_CHART.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
            <Text style={[s.depthPos, { color: C.secondary }]}>{pos.pos}</Text>
            <View style={[s.depthCard, { backgroundColor: C.bg }]}>
              <Text style={[s.depthInit, { color: C.label }]}>{pos.starter.id}</Text>
              <Text style={[s.depthKR, { color: krColor(pos.starter.kr) }]}>{pos.starter.kr}</Text>
            </View>
            <Text style={[s.darkCardSub, { color: C.separator }]}>›</Text>
            <View style={[s.depthCard, { backgroundColor: C.bg, opacity: 0.6 }]}>
              <Text style={[s.depthInit, { color: C.label }]}>{pos.backup.id}</Text>
              <Text style={[s.depthKR, { color: krColor(pos.backup.kr) }]}>{pos.backup.kr}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Availability */}
      <SH title="AVAILABILITY" />
      <View style={[s.card, { backgroundColor: C.surface }]}>
        {ROSTER_HEALTH.map((p, i) => (
          <View key={p.id} style={[s.availRow, i < ROSTER_HEALTH.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
            <View style={[s.statusDot, { backgroundColor: statusColor(p.status) }]} />
            <Text style={[s.availName, { color: C.label }]}>{p.name}</Text>
            <Text style={[s.availPos, { color: C.secondary }]}>{p.pos}</Text>
            <View style={{ flex: 1 }}>
              {p.reason && <Text style={[s.availReason, { color: C.secondary }]}>{p.reason}</Text>}
            </View>
            <Text style={[s.availMins, { color: p.status === 'out' ? C.secondary : C.label }]}>{p.minutes > 0 ? `${p.minutes}m` : '—'}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // ── PLAYER REPORTS ────────────────────────────────────────────────────────────

  const renderPlayerReports = () => {
    const filtered = PLAYER_REPORTS.filter(p =>
      playerFilter === 'all' ? true :
      playerFilter === 'starters' ? p.starter :
      !p.starter
    );

    return (
      <View style={{ gap: 16 }}>
        {/* Filter pills */}
        <View style={s.filterRow}>
          {(['all', 'starters', 'bench'] as const).map(f => (
            <Pressable
              key={f}
              style={[s.filterPill, { backgroundColor: playerFilter === f ? C.label : C.surface, borderColor: C.separator }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPlayerFilter(f); }}
            >
              <Text style={[s.filterPillText, { color: playerFilter === f ? C.bg : C.label }]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {filtered.map(player => {
          const isExpanded = expandedPlayer === player.id;
          return (
            <Pressable
              key={player.id}
              style={[s.card, { backgroundColor: C.surface }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setExpandedPlayer(isExpanded ? null : player.id); }}
            >
              {/* Card header */}
              <View style={s.playerCardTop}>
                <View style={[s.initCircle, { backgroundColor: C.separator, width: 48, height: 48, borderRadius: 24 }]}>
                  <Text style={[s.initText, { color: C.label, fontSize: 14 }]}>{player.id}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[s.adjTitle, { color: C.label }]}>{player.name}</Text>
                    <Text style={[s.darkCardSub, { color: C.secondary }]}>#{player.number}</Text>
                  </View>
                  <Text style={[s.darkCardSub, { color: C.secondary }]}>{player.pos}  ·  {player.archetype}</Text>
                  <View style={[s.dipsonNote, { borderColor: C.separator, marginTop: 4 }]}>
                    <Text style={[s.dipsonNoteText, { color: C.secondary, fontSize: 11 }]}>{player.matchupNote}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[s.bigKR, { color: krColor(player.kr) }]}>{player.kr}</Text>
                  <Text style={[s.darkCardSub, { color: C.secondary, fontSize: 9 }]}>KR</Text>
                </View>
              </View>

              {/* Expanded */}
              {isExpanded && (
                <View style={{ marginTop: 12, gap: 12 }}>
                  <View style={[{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]} />
                  {/* Component KR bars */}
                  <Text style={[s.sectionHeader, { color: C.secondary, marginBottom: 4 }]}>COMPONENT KR</Text>
                  {[
                    { label: 'OKR',  value: player.okr  },
                    { label: 'DKR',  value: player.dkr  },
                    { label: 'TKR',  value: player.tkr  },
                    { label: 'IQKR', value: player.iqkr },
                  ].map(comp => (
                    <View key={comp.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={[s.compLabelText, { color: C.label }]}>{comp.label}</Text>
                      <View style={[s.compBarTrack, { backgroundColor: C.separator }]}>
                        <View style={[s.compBarFill, { width: `${comp.value}%` as any, backgroundColor: comp.value >= 88 ? GAIN : comp.value >= 75 ? C.label : CAUTION }]} />
                      </View>
                      <Text style={[s.compValueText, { color: C.label }]}>{comp.value}</Text>
                    </View>
                  ))}

                  {/* Recent games */}
                  <Text style={[s.sectionHeader, { color: C.secondary, marginTop: 4, marginBottom: 4 }]}>RECENT (LAST 3)</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {player.recent.map((g, i) => (
                      <View key={i} style={[s.recentGame, { backgroundColor: C.bg }]}>
                        <Text style={[s.darkCardSub, { color: C.secondary, fontSize: 10 }]}>{g.opp}</Text>
                        <Text style={[s.adjTitle, { color: C.label }]}>{g.pts} pts</Text>
                        <Text style={[s.darkCardSub, { color: C.secondary, fontSize: 10 }]}>{g.ast} ast</Text>
                      </View>
                    ))}
                  </View>

                  {/* Goal status */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[s.darkCardSub, { color: C.secondary }]}>Dev Goal:</Text>
                    <View style={[s.effBadge, { backgroundColor: player.goalStatus === 'On Track' ? GAIN + '22' : HEAT + '22' }]}>
                      <Text style={[s.effText, { color: player.goalStatus === 'On Track' ? GAIN : HEAT }]}>{player.goalStatus}</Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
                <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down'} size={13} color={C.secondary} />
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  };

  // ── RENDER ────────────────────────────────────────────────────────────────────

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.kBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Game Day</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isCoach} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* Top-level pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillRow}>
          {PILLS.map(pill => (
            <Pressable
              key={pill.key}
              style={[s.pill, { backgroundColor: activePill === pill.key ? C.label : C.surface, borderColor: C.separator }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActivePill(pill.key); }}
            >
              <Text style={[s.pillText, { color: activePill === pill.key ? C.bg : C.label }]}>{pill.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          {activePill === 'gameplan'      && renderGamePlan()}
          {activePill === 'scouting'      && renderScouting()}
          {activePill === 'team'          && renderTeam()}
          {activePill === 'playerreports' && renderPlayerReports()}
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root:          { flex: 1 },
  topBarOuter:   { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  kBtn:          { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

  pillRow:       { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  pill:          { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  pillText:      { fontSize: 13, fontWeight: '600' },

  phaseRow:      { gap: 8, paddingBottom: 4 },
  phasePill:     { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  phasePillText: { fontSize: 12, fontWeight: '600' },

  sectionHeader: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },

  card:          { borderRadius: 14, overflow: 'hidden' },
  darkCard:      { borderRadius: 14, padding: 16 },
  darkCardTitle: { fontSize: 16, fontWeight: '700' },
  darkCardSub:   { fontSize: 12, lineHeight: 17 },
  dipsonNote:    { flexDirection: 'row', alignItems: 'flex-start', gap: 6, borderWidth: 1, borderRadius: 8, padding: 8, marginTop: 8 },
  dipsonNoteText:{ fontSize: 12, flex: 1, lineHeight: 16 },
  dipsonBody:    { fontSize: 13, lineHeight: 18, fontStyle: 'italic' },

  rowBetween:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge:         { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:     { fontSize: 10, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },

  lineupCard:    { width: 68, borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },
  lineupKR:      { fontSize: 22, fontWeight: '900' },
  lineupInit:    { fontSize: 13, fontWeight: '700', color: C.label },
  lineupPos:     { fontSize: 10, color: C.secondary },

  matchupRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  matchupPlayer: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', minWidth: 48 },
  matchupInit:   { fontSize: 13, fontWeight: '700' },
  matchupKR:     { fontSize: 10 },
  matchupVs:     { fontSize: 11 },
  edgeBadge:     { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, minWidth: 36, alignItems: 'center' },
  edgeText:      { fontSize: 12, fontWeight: '800' },
  startBtn:      { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  startBtnText:  { fontSize: 15, fontWeight: '700' },

  situationStrip: { borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scoreBlock:    { alignItems: 'center', gap: 2 },
  scoreTeam:     { fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.5 },
  scoreNum:      { fontSize: 36, fontWeight: '900', color: C.label },
  clockBlock:    { alignItems: 'center' },
  clockPeriod:   { fontSize: 11, fontWeight: '700', color: C.secondary },
  clockTime:     { fontSize: 28, fontWeight: '800', color: C.label },

  boxHeader:     { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  boxHeaderCell: { fontSize: 10, fontWeight: '700', flex: 1, textAlign: 'center' },
  boxRow:        { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center' },
  boxName:       { fontSize: 13, fontWeight: '700', width: 36 },
  boxCell:       { flex: 1, fontSize: 13, textAlign: 'center' },

  pbpRow:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 12 },
  pbpTime:       { fontSize: 11, fontWeight: '600', width: 40 },
  pbpText:       { fontSize: 13, flex: 1 },

  fiveFactorsGrid:{ flexDirection: 'row', flexWrap: 'wrap' },
  factorCell:    { width: '50%', alignItems: 'center', paddingVertical: 14 },
  factorValue:   { fontSize: 22, fontWeight: '800' },
  factorLabel:   { fontSize: 10, fontWeight: '600', letterSpacing: 0.3, marginTop: 2 },

  factorRow:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  factorRowLabel:{ flex: 1, fontSize: 13 },
  factorRowUs:   { fontSize: 14, fontWeight: '800', width: 44, textAlign: 'right' },
  factorRowVs:   { fontSize: 11, width: 20, textAlign: 'center' },
  factorRowThem: { fontSize: 13, width: 44 },

  adjRow:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  adjTitle:      { fontSize: 14, fontWeight: '600' },
  adjImpact:     { fontSize: 12, marginTop: 2 },

  gradePill:     { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, minWidth: 32, alignItems: 'center' },
  gradeText:     { fontSize: 11, fontWeight: '800' },

  mediaBtn:      { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  mediaBtnText:  { fontSize: 14, fontWeight: '600' },

  scoutTag:      { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  scoutTagText:  { fontSize: 11, fontWeight: '600' },

  initCircle:    { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  initText:      { fontSize: 13, fontWeight: '800' },
  krBadge:       { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  krBadgeText:   { fontSize: 11, fontWeight: '700' },

  tendencyRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  tendencyType:  { flex: 1, fontSize: 14 },
  tendencyFreq:  { fontSize: 13, width: 40, textAlign: 'right' },
  effBadge:      { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  effText:       { fontSize: 11, fontWeight: '700' },

  depthRow:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  depthPos:      { fontSize: 11, fontWeight: '700', width: 28, letterSpacing: 0.3 },
  depthCard:     { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 6 },
  depthInit:     { fontSize: 13, fontWeight: '700' },
  depthKR:       { fontSize: 11, fontWeight: '600' },

  availRow:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, gap: 10 },
  statusDot:     { width: 8, height: 8, borderRadius: 4 },
  availName:     { fontSize: 14, fontWeight: '600', width: 100 },
  availPos:      { fontSize: 12, width: 28 },
  availReason:   { fontSize: 12 },
  availMins:     { fontSize: 13, fontWeight: '700', width: 32, textAlign: 'right' },

  filterRow:     { flexDirection: 'row', gap: 8 },
  filterPill:    { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1 },
  filterPillText:{ fontSize: 13, fontWeight: '600' },

  playerCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14 },
  bigKR:         { fontSize: 28, fontWeight: '900' },

  compLabelText: { fontSize: 13, fontWeight: '600', width: 44 },
  compBarTrack:  { flex: 1, height: 7, borderRadius: 4, overflow: 'hidden' },
  compBarFill:   { height: 7, borderRadius: 4 },
  compValueText: { fontSize: 13, fontWeight: '700', width: 28, textAlign: 'right' },

  recentGame:    { flex: 1, borderRadius: 10, padding: 10, alignItems: 'center', gap: 2 },
});
