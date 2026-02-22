/**
 * Full Play-by-Play Page
 * Shot chart + chronological play-by-play log for a completed game.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  KaNeXT_GAMES_BY_ID,
  KaNeXT_BOX_SCORES,
  KaNeXT_RECORD,
  placeholderRecord,
  isConfGame,
  type BoxScoreLine,
} from '@/data/fmu';

// ── Mock data generators ──

interface PbpEntry {
  time: string;
  half: '1st' | '2nd';
  team: 'fmu' | 'opp';
  text: string;
  score: string;
}

function generateMockPbp(opponent: string, fmuScore: number, oppScore: number): PbpEntry[] {
  let h = 0;
  for (let i = 0; i < opponent.length; i++) h = ((h << 5) - h + opponent.charCodeAt(i)) | 0;
  const seed = () => { h = ((h << 5) - h + 0x5bd1e995) | 0; return Math.abs(h) % 1000; };

  const KaNeXT_NAMES = ['Selden', 'Morgan', 'Turner', 'Lewis', 'Carter', 'Noel', 'Thomas'];
  const OPP_NAMES = ['Johnson', 'Williams', 'Davis', 'Brown', 'Wilson', 'Anderson', 'Taylor'];

  const playTemplates = [
    (n: string) => `${n} makes a layup`,
    (n: string) => `${n} makes a 3-pointer`,
    (n: string) => `${n} misses a jumper`,
    (n: string) => `${n} makes a free throw`,
    (n: string) => `${n} misses a free throw`,
    (n: string) => `${n} with a dunk`,
    (n: string) => `Turnover by ${n}`,
    (n: string) => `${n} steal`,
    (n: string) => `${n} defensive rebound`,
    (n: string) => `${n} offensive rebound`,
    (n: string) => `Foul on ${n}`,
    (n: string) => `${n} makes a mid-range jumper`,
    (n: string) => `${n} blocked by opponent`,
    (n: string) => `${n} assist to teammate`,
  ];

  const entries: PbpEntry[] = [];
  let fmuRunning = 0;
  let oppRunning = 0;
  const totalPlays = 80 + (seed() % 30);
  const halfwayPoint = Math.floor(totalPlays / 2);

  for (let i = 0; i < totalPlays; i++) {
    const half: '1st' | '2nd' = i < halfwayPoint ? '1st' : '2nd';
    const minutesLeft = i < halfwayPoint
      ? 20 - Math.floor((i / halfwayPoint) * 20)
      : 20 - Math.floor(((i - halfwayPoint) / (totalPlays - halfwayPoint)) * 20);
    const seconds = seed() % 60;
    const time = `${minutesLeft}:${seconds.toString().padStart(2, '0')}`;

    const isFmu = seed() % 2 === 0;
    const team: 'fmu' | 'opp' = isFmu ? 'fmu' : 'opp';
    const names = isFmu ? KaNeXT_NAMES : OPP_NAMES;
    const name = names[seed() % names.length];
    const template = playTemplates[seed() % playTemplates.length];

    const playIdx = seed() % playTemplates.length;
    if (playIdx === 0 || playIdx === 5 || playIdx === 11) {
      if (isFmu) fmuRunning += 2; else oppRunning += 2;
    } else if (playIdx === 1) {
      if (isFmu) fmuRunning += 3; else oppRunning += 3;
    } else if (playIdx === 3) {
      if (isFmu) fmuRunning += 1; else oppRunning += 1;
    }

    entries.push({ time, half, team, text: template(name), score: `${fmuRunning}-${oppRunning}` });
  }

  if (entries.length > 0) {
    entries[entries.length - 1].score = `${fmuScore}-${oppScore}`;
  }
  return entries;
}

function mockBoxScore(teamName: string, teamScore: number, names?: string[]): BoxScoreLine[] {
  let h = 0;
  for (let i = 0; i < teamName.length; i++) h = ((h << 5) - h + teamName.charCodeAt(i)) | 0;
  const seed = (n: number) => { h = ((h << 5) - h + n) | 0; return Math.abs(h); };

  const DEFAULT_NAMES = ['Johnson', 'Williams', 'Davis', 'Brown', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson'];
  const MOCK_NAMES = names ?? DEFAULT_NAMES;
  const count = 8 + (seed(1) % 3);
  const players: BoxScoreLine[] = [];
  let ptsLeft = teamScore;

  for (let i = 0; i < count; i++) {
    const isStarter = i < 5;
    const min = isStarter ? 25 + (seed(i + 10) % 13) : 8 + (seed(i + 20) % 15);
    const sharePct = isStarter ? 0.15 + (seed(i + 30) % 10) / 100 : 0.04 + (seed(i + 40) % 6) / 100;
    const pts = i < count - 1 ? Math.round(teamScore * sharePct) : Math.max(0, ptsLeft);
    ptsLeft -= pts;
    const fgm = Math.round(pts * 0.38);
    const fga = fgm + 2 + (seed(i + 50) % 5);
    const tpm = Math.round(pts * 0.12);
    const tpa = tpm + (seed(i + 60) % 3);
    const ftm = Math.max(0, pts - fgm * 2 - tpm);
    const fta = ftm + (seed(i + 70) % 2);
    const reb = isStarter ? 3 + (seed(i + 80) % 6) : 1 + (seed(i + 90) % 4);
    const ast = isStarter ? 1 + (seed(i + 100) % 5) : seed(i + 110) % 3;
    const stl = seed(i + 120) % 3;
    const blk = seed(i + 130) % 2;
    const to = seed(i + 140) % 4;
    const pf = seed(i + 150) % 4;
    players.push({
      name: MOCK_NAMES[i % MOCK_NAMES.length],
      min: String(min), pts, reb, ast,
      fg: `${fgm}-${fga}`, threePt: `${tpm}-${tpa}`, ft: `${ftm}-${fta}`,
      stl, blk, to, pf,
    });
  }
  return players.sort((a, b) => b.pts - a.pts);
}

// ── Component ──

type GameStatus = 'upcoming' | 'live' | 'final';

export default function PlayByPlayScreen() {
  const router = useRouter();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const game = (KaNeXT_GAMES_BY_ID as Record<string, { opponent: string; date: string; location: string; status: GameStatus; score?: string }>)[gameId ?? '']
    ?? { opponent: 'Unknown', date: '—', location: '—', status: 'upcoming' as GameStatus };

  const opponentAbbr = game.opponent.substring(0, 3).toUpperCase();
  const oppRecord = placeholderRecord(game.opponent, isConfGame(game.opponent));

  const scoreStr = game.score ?? '';
  const scoreParts = scoreStr.replace(/[WL]\s?/, '').split('-');
  const fmuScore = parseInt(scoreParts[0]) || 0;
  const oppScore = parseInt(scoreParts[1]) || 0;
  const isWin = fmuScore > oppScore;

  // PBP data
  const entries = generateMockPbp(game.opponent, fmuScore, oppScore);

  // Box score data (for shot chart)
  const KaNeXT_MOCK_NAMES = ['Selden', 'Morgan', 'Turner', 'Lewis', 'Carter', 'Noel', 'Thomas', 'Brewer', 'Morris', 'Thompson'];
  const BOX_SCORE = KaNeXT_BOX_SCORES as Record<string, BoxScoreLine[]>;
  const realBoxScore = BOX_SCORE[gameId ?? ''] ?? [];
  const fmuBoxScore = realBoxScore.length > 0 ? realBoxScore : mockBoxScore('KaNeXT Sports', fmuScore, KaNeXT_MOCK_NAMES);
  const oppBoxScoreData = mockBoxScore(game.opponent, oppScore);

  // Shot chart filter state
  const [shotPeriods, setShotPeriods] = useState<Set<string>>(new Set());
  const [shotPlayTypes, setShotPlayTypes] = useState<Set<string>>(new Set());
  const [shotPlayers, setShotPlayers] = useState<Set<string>>(new Set());
  const [shotFilterSheet, setShotFilterSheet] = useState<'periods' | 'playTypes' | 'players' | null>(null);
  const [shotPlayerTeam, setShotPlayerTeam] = useState<'fmu' | 'opp'>('fmu');

  // Generate shots from box score
  type Shot = { x: number; y: number; made: boolean; isThree: boolean; player: string; half: '1st Half' | '2nd Half' };
  const generateShots = (lines: BoxScoreLine[], teamSeed: number): Shot[] => {
    let h = teamSeed;
    const rng = () => { h = ((h << 5) - h + 0x5bd1e995) | 0; return (Math.abs(h) % 1000) / 1000; };
    const shots: Shot[] = [];
    for (const p of lines) {
      const fgParts = p.fg.split('-');
      const fgm = parseInt(fgParts[0]) || 0;
      const fga = parseInt(fgParts[1]) || 0;
      const tpParts = p.threePt.split('-');
      const tpm = parseInt(tpParts[0]) || 0;
      const tpa = parseInt(tpParts[1]) || 0;
      for (let s = 0; s < fga; s++) {
        const isThree = s < tpa;
        const made = isThree ? s < tpm : (s - tpa) < (fgm - tpm);
        const half: Shot['half'] = rng() < 0.5 ? '1st Half' : '2nd Half';
        let x: number, y: number;
        if (isThree) {
          const angle = rng();
          if (angle < 0.2) { x = 0.02 + rng() * 0.08; y = 0.02 + rng() * 0.12; }
          else if (angle < 0.4) { x = 0.02 + rng() * 0.08; y = 0.86 + rng() * 0.12; }
          else { x = 0.30 + rng() * 0.15; y = 0.08 + rng() * 0.84; }
        } else {
          const zone = rng();
          if (zone < 0.55) { x = 0.08 + rng() * 0.22; y = 0.25 + rng() * 0.50; }
          else { x = 0.15 + rng() * 0.25; y = 0.10 + rng() * 0.80; }
        }
        shots.push({ x, y, made, isThree, player: p.name, half });
      }
    }
    return shots;
  };

  let fmuSeed = 0;
  for (let i = 0; i < 'KaNeXT'.length; i++) fmuSeed = ((fmuSeed << 5) - fmuSeed + 'KaNeXT'.charCodeAt(i)) | 0;
  let oppSeed = 0;
  for (let i = 0; i < game.opponent.length; i++) oppSeed = ((oppSeed << 5) - oppSeed + game.opponent.charCodeAt(i)) | 0;

  const allFmuShots = generateShots(fmuBoxScore, fmuSeed);
  const allOppShots = generateShots(oppBoxScoreData, oppSeed);

  const filterShots = (shots: Shot[]) => {
    let filtered = shots;
    if (shotPeriods.size > 0) filtered = filtered.filter(s => shotPeriods.has(s.half));
    if (shotPlayTypes.size > 0) {
      filtered = filtered.filter(s => {
        if (s.isThree && s.made && shotPlayTypes.has('3PT Made')) return true;
        if (s.isThree && !s.made && shotPlayTypes.has('3PT Missed')) return true;
        if (!s.isThree && s.made && shotPlayTypes.has('2PT FG Made')) return true;
        if (!s.isThree && !s.made && shotPlayTypes.has('2PT FG Missed')) return true;
        return false;
      });
    }
    if (shotPlayers.size > 0) filtered = filtered.filter(s => shotPlayers.has(s.player));
    return filtered;
  };
  const fmuShots = filterShots(allFmuShots);
  const oppShots = filterShots(allOppShots);

  const COURT_COLOR = '#A1A1AA';
  const LINE_COLOR = '#A1A1AA';
  const KaNeXT_COLOR = colors.text;
  const OPP_COLOR = '#A1A1AA';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* App Bar */}
      <View style={[styles.appBar, { borderBottomColor: colors.divider }]}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, { backgroundColor: pressed ? colors.backgroundSecondary : 'transparent' }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.navigate({ pathname: '/coach/game-detail' as any, params: { gameId: gameId ?? '' } }); }}
        >
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
        </Pressable>
        <Text style={[styles.appBarTitle, { color: colors.textSecondary }]}>Game</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Scoreboard + ESPN pills */}
      <View style={[styles.scoreboardCard, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={styles.scoreboardRow}>
          <View style={styles.scoreboardSide}>
            <View>
              <Text style={[styles.scoreboardAbbr, { color: colors.text }]}>{opponentAbbr}</Text>
              <Text style={[styles.scoreboardRecord, { color: colors.textTertiary }]}>{oppRecord}</Text>
            </View>
            <View style={[styles.scoreboardIcon, { backgroundColor: colors.backgroundTertiary }]}>
              <Text style={[styles.scoreboardIconText, { color: colors.textSecondary }]}>{opponentAbbr.charAt(0)}</Text>
            </View>
            <Text style={[styles.scoreboardBigScore, { color: !isWin ? colors.text : colors.textTertiary }]}>{oppScore}</Text>
          </View>
          <View style={styles.scoreboardCenter}>
            <Text style={[styles.scoreboardFinal, { color: colors.textTertiary }]}>Final</Text>
            <Text style={[styles.scoreboardArrow, { color: colors.text }]}>{isWin ? '▸' : '◂'}</Text>
          </View>
          <View style={[styles.scoreboardSide, { flexDirection: 'row-reverse' }]}>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.scoreboardAbbr, { color: colors.text }]}>KXT</Text>
              <Text style={[styles.scoreboardRecord, { color: colors.textTertiary }]}>{KaNeXT_RECORD.overall}</Text>
            </View>
            <View style={[styles.scoreboardIcon, { backgroundColor: colors.text + '15' }]}>
              <Text style={[styles.scoreboardIconText, { color: colors.text }]}>F</Text>
            </View>
            <Text style={[styles.scoreboardBigScore, { color: isWin ? colors.text : colors.textTertiary }]}>{fmuScore}</Text>
          </View>
        </View>

        <View style={[styles.espnTabRow, { borderTopColor: colors.divider }]}>
          {([
            { key: 'gamecast', label: 'KaNeXTCast' },
            { key: 'boxscore', label: 'Box Score' },
            { key: 'pbp', label: 'Play-by-Play' },
            { key: 'teamstats', label: 'Team Stats' },
          ] as const).map((tab) => {
            const isActive = tab.key === 'pbp';
            return (
              <Pressable
                key={tab.key}
                style={[styles.espnTab, isActive && styles.espnTabActive]}
                onPress={() => {
                  if (tab.key === 'pbp') return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (tab.key === 'gamecast') {
                    router.navigate({ pathname: '/coach/game-detail' as any, params: { gameId: gameId ?? '' } });
                  } else if (tab.key === 'boxscore') {
                    router.navigate({ pathname: '/coach/box-score' as any, params: { gameId: gameId ?? '' } });
                  } else if (tab.key === 'teamstats') {
                    router.navigate({ pathname: '/coach/team-stats' as any, params: { gameId: gameId ?? '' } });
                  }
                }}
              >
                <Text style={[
                  styles.espnTabText,
                  { color: isActive ? colors.text : colors.textTertiary },
                  isActive && styles.espnTabTextActive,
                ]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Play type pills */}
      <View style={styles.playTypePills}>
        <Pressable style={[styles.playTypePill, { backgroundColor: colors.text + 'E0' }]}>
          <Text style={[styles.playTypePillText, { color: colors.background }]}>All Plays</Text>
        </Pressable>
        <Pressable
          style={[styles.playTypePill, { backgroundColor: colors.backgroundTertiary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.navigate({ pathname: '/coach/key-plays' as any, params: { gameId: gameId ?? '' } });
          }}
        >
          <Text style={[styles.playTypePillText, { color: colors.textSecondary }]}>KaNeXT Key Plays</Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Shot Chart */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SHOT CHART</Text>
        <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
          {/* Filter pills */}
          <View style={styles.shotFilterRow}>
            {([
              { key: 'periods' as const, label: shotPeriods.size > 0 ? `${shotPeriods.size} Period${shotPeriods.size > 1 ? 's' : ''}` : 'All Periods' },
              { key: 'playTypes' as const, label: shotPlayTypes.size > 0 ? `${shotPlayTypes.size} Type${shotPlayTypes.size > 1 ? 's' : ''}` : 'All Play Types' },
              { key: 'players' as const, label: shotPlayers.size > 0 ? `${shotPlayers.size} Player${shotPlayers.size > 1 ? 's' : ''}` : 'All Players' },
            ]).map((pill) => {
              const active = pill.key === 'periods' ? shotPeriods.size > 0 : pill.key === 'playTypes' ? shotPlayTypes.size > 0 : shotPlayers.size > 0;
              return (
                <Pressable
                  key={pill.key}
                  style={[styles.shotChip, active && { backgroundColor: colors.text }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShotFilterSheet(pill.key);
                  }}
                >
                  <Text style={[styles.shotChipText, { color: active ? colors.background : colors.text }]}>{pill.label}</Text>
                  <IconSymbol name="chevron.down" size={10} color={active ? colors.background : colors.textTertiary} />
                </Pressable>
              );
            })}
          </View>

          {/* Court */}
          <View style={[styles.shotCourtWrap, { backgroundColor: COURT_COLOR }]}>
            <View style={[styles.shotHalfLine, { backgroundColor: LINE_COLOR }]} />
            <View style={[styles.shotPaint, { left: 0, borderColor: LINE_COLOR }]} />
            <View style={[styles.shotPaint, { right: 0, borderColor: LINE_COLOR }]} />
            <View style={[styles.shotFTCircle, { left: '10%', borderColor: LINE_COLOR }]} />
            <View style={[styles.shotFTCircle, { right: '10%', borderColor: LINE_COLOR }]} />
            <View style={[styles.shotCenterCircle, { borderColor: LINE_COLOR }]} />
            <View style={[styles.shotThreeArc, { left: -20, borderColor: LINE_COLOR }]} />
            <View style={[styles.shotThreeArc, { right: -20, borderColor: LINE_COLOR }]} />

            <View style={styles.shotTeamLabels}>
              <View style={[styles.shotTeamBadge, { backgroundColor: OPP_COLOR + '30' }]}>
                <Text style={[styles.shotTeamBadgeText, { color: OPP_COLOR }]}>{opponentAbbr.charAt(0)}</Text>
              </View>
              <View style={[styles.shotTeamBadge, { backgroundColor: KaNeXT_COLOR + '15' }]}>
                <Text style={[styles.shotTeamBadgeText, { color: KaNeXT_COLOR }]}>F</Text>
              </View>
            </View>

            {oppShots.map((s, i) => (
              <View key={`o${i}`} style={[styles.shotDot, { left: `${s.x * 50}%`, top: `${s.y * 100}%`, backgroundColor: s.made ? OPP_COLOR : 'transparent', borderColor: OPP_COLOR }]} />
            ))}
            {fmuShots.map((s, i) => (
              <View key={`f${i}`} style={[styles.shotDot, { right: `${s.x * 50}%`, top: `${s.y * 100}%`, backgroundColor: s.made ? KaNeXT_COLOR : 'transparent', borderColor: KaNeXT_COLOR }]} />
            ))}
          </View>

          {/* Legend */}
          <View style={styles.shotLegend}>
            <View style={styles.shotLegendSide}>
              <Text style={[styles.shotLegendLabel, { color: colors.textSecondary }]}>Shot Made</Text>
              <View style={[styles.shotLegendDot, { backgroundColor: OPP_COLOR, borderColor: OPP_COLOR }]} />
              <Text style={[styles.shotLegendLabel, { color: colors.textSecondary, marginLeft: 8 }]}>Shot Missed</Text>
              <View style={[styles.shotLegendDot, { backgroundColor: 'transparent', borderColor: OPP_COLOR }]} />
            </View>
            <View style={[styles.shotLegendDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.shotLegendSide}>
              <View style={[styles.shotLegendDot, { backgroundColor: KaNeXT_COLOR, borderColor: KaNeXT_COLOR }]} />
              <Text style={[styles.shotLegendLabel, { color: colors.textSecondary }]}>Shot Made</Text>
              <View style={[styles.shotLegendDot, { backgroundColor: 'transparent', borderColor: KaNeXT_COLOR, marginLeft: 8 }]} />
              <Text style={[styles.shotLegendLabel, { color: colors.textSecondary }]}>Shot Missed</Text>
            </View>
          </View>
        </View>

        {/* Play-by-Play */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>PLAY-BY-PLAY</Text>
        {entries.map((entry, idx) => {
          const prevHalf = idx > 0 ? entries[idx - 1].half : null;
          const showHalfHeader = entry.half !== prevHalf;
          return (
            <View key={idx}>
              {showHalfHeader && (
                <View style={[styles.halfHeader, { borderBottomColor: colors.divider }]}>
                  <Text style={[styles.halfHeaderText, { color: colors.textSecondary }]}>
                    {entry.half === '1st' ? '1ST HALF' : '2ND HALF'}
                  </Text>
                </View>
              )}
              <View style={[styles.pbpRow, { borderBottomColor: colors.divider + '60' }]}>
                <View style={styles.pbpTime}>
                  <Text style={[styles.pbpTimeText, { color: colors.textTertiary }]}>{entry.time}</Text>
                </View>
                <View style={[
                  styles.pbpTeamDot,
                  { backgroundColor: entry.team === 'fmu' ? colors.text : '#A1A1AA' },
                ]} />
                <View style={styles.pbpContent}>
                  <Text style={[styles.pbpText, { color: colors.text }]}>{entry.text}</Text>
                </View>
                <Text style={[styles.pbpScore, { color: colors.textSecondary }]}>{entry.score}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Shot Chart Filter Sheet */}
      <Modal visible={shotFilterSheet !== null} transparent animationType="slide">
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setShotFilterSheet(null)} />
          <View style={[styles.sheetContent, { backgroundColor: colors.background, paddingBottom: insets.bottom + Spacing.md }]}>
            <View style={[styles.sheetHeader, { borderBottomColor: colors.divider }]}>
              <Pressable onPress={() => {
                if (shotFilterSheet === 'periods') setShotPeriods(new Set());
                else if (shotFilterSheet === 'playTypes') setShotPlayTypes(new Set());
                else if (shotFilterSheet === 'players') setShotPlayers(new Set());
              }}>
                <Text style={[styles.filterResetText, { color: colors.textTertiary }]}>Reset</Text>
              </Pressable>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                {shotFilterSheet === 'periods' ? 'Periods' : shotFilterSheet === 'playTypes' ? 'Play Types' : 'Players'}
              </Text>
              <Pressable onPress={() => setShotFilterSheet(null)}>
                <Text style={[styles.filterDoneText, { color: colors.text }]}>Done</Text>
              </Pressable>
            </View>

            {/* Periods */}
            {shotFilterSheet === 'periods' && (
              <View style={styles.filterList}>
                {['1st Half', '2nd Half'].map((period) => {
                  const on = shotPeriods.has(period);
                  return (
                    <Pressable
                      key={period}
                      style={[styles.filterOption, { borderBottomColor: colors.divider }]}
                      onPress={() => { const n = new Set(shotPeriods); on ? n.delete(period) : n.add(period); setShotPeriods(n); }}
                    >
                      <Text style={[styles.filterOptionText, { color: colors.text }]}>{period}</Text>
                      <View style={[styles.filterCheckbox, { borderColor: on ? colors.text : colors.textTertiary, backgroundColor: on ? colors.text : 'transparent' }]}>
                        {on && <IconSymbol name="checkmark" size={12} color={colors.background} />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Play Types */}
            {shotFilterSheet === 'playTypes' && (
              <View style={styles.filterList}>
                {[
                  { key: '2PT FG Made', label: '2PT FG Made' },
                  { key: '2PT FG Missed', label: '2PT FG Missed' },
                  { key: '3PT Made', label: '3PT Made' },
                  { key: '3PT Missed', label: '3PT Missed' },
                ].map((item) => {
                  const on = shotPlayTypes.has(item.key);
                  return (
                    <Pressable
                      key={item.key}
                      style={[styles.filterOption, { borderBottomColor: colors.divider }]}
                      onPress={() => { const n = new Set(shotPlayTypes); on ? n.delete(item.key) : n.add(item.key); setShotPlayTypes(n); }}
                    >
                      <Text style={[styles.filterOptionText, { color: colors.text }]}>{item.label}</Text>
                      <View style={[styles.filterCheckbox, { borderColor: on ? colors.text : colors.textTertiary, backgroundColor: on ? colors.text : 'transparent' }]}>
                        {on && <IconSymbol name="checkmark" size={12} color={colors.background} />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Players */}
            {shotFilterSheet === 'players' && (() => {
              const playerNames = shotPlayerTeam === 'fmu'
                ? fmuBoxScore.map(p => p.name)
                : oppBoxScoreData.map(p => p.name);
              return (
                <View style={styles.filterList}>
                  <View style={styles.filterTeamToggle}>
                    {(['fmu', 'opp'] as const).map((t) => {
                      const active = shotPlayerTeam === t;
                      return (
                        <Pressable
                          key={t}
                          style={[styles.filterTeamPill, { backgroundColor: active ? colors.text + 'E0' : colors.backgroundTertiary }]}
                          onPress={() => setShotPlayerTeam(t)}
                        >
                          <Text style={[styles.filterTeamPillText, { color: active ? colors.background : colors.textSecondary }]}>
                            {t === 'fmu' ? 'KaNeXT' : opponentAbbr}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <Pressable
                    style={[styles.filterOption, { borderBottomColor: colors.divider }]}
                    onPress={() => {
                      const allSelected = playerNames.every(n => shotPlayers.has(n));
                      const n = new Set(shotPlayers);
                      if (allSelected) playerNames.forEach(name => n.delete(name));
                      else playerNames.forEach(name => n.add(name));
                      setShotPlayers(n);
                    }}
                  >
                    <Text style={[styles.filterOptionText, { color: colors.text, fontWeight: '600' }]}>Select All</Text>
                    <View style={[styles.filterCheckbox, {
                      borderColor: playerNames.every(n => shotPlayers.has(n)) ? colors.text : colors.textTertiary,
                      backgroundColor: playerNames.every(n => shotPlayers.has(n)) ? colors.text : 'transparent',
                    }]}>
                      {playerNames.every(n => shotPlayers.has(n)) && <IconSymbol name="checkmark" size={12} color={colors.background} />}
                    </View>
                  </Pressable>
                  {playerNames.map((name) => {
                    const on = shotPlayers.has(name);
                    return (
                      <Pressable
                        key={name}
                        style={[styles.filterOption, { borderBottomColor: colors.divider }]}
                        onPress={() => { const nn = new Set(shotPlayers); on ? nn.delete(name) : nn.add(name); setShotPlayers(nn); }}
                      >
                        <Text style={[styles.filterOptionText, { color: colors.text }]}>{name}</Text>
                        <View style={[styles.filterCheckbox, { borderColor: on ? colors.text : colors.textTertiary, backgroundColor: on ? colors.text : 'transparent' }]}>
                          {on && <IconSymbol name="checkmark" size={12} color={colors.background} />}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              );
            })()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  backBtn: {
    width: 32, height: 32,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  appBarTitle: { fontSize: 15, fontWeight: '500' },
  scoreboardCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
  },
  scoreboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreboardSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  scoreboardIcon: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  scoreboardIconText: { fontSize: 14, fontWeight: '700' },
  scoreboardAbbr: { fontSize: 14, fontWeight: '700' },
  scoreboardRecord: { fontSize: 11, marginTop: 1 },
  scoreboardBigScore: { fontSize: 32, fontWeight: '700' },
  scoreboardCenter: { alignItems: 'center', paddingHorizontal: 10 },
  scoreboardFinal: { fontSize: 13, fontWeight: '500' },
  scoreboardArrow: { fontSize: 14, marginTop: 2 },
  espnTabRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.md,
  },
  espnTab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  espnTabActive: { borderBottomWidth: 2, borderBottomColor: '#EF4444' },
  espnTabText: { fontSize: 13, fontWeight: '500' },
  espnTabTextActive: { fontWeight: '700' },
  playTypePills: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  playTypePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  playTypePillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollView: { flex: 1, paddingHorizontal: Spacing.md },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },

  // Shot Chart
  shotFilterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  shotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.3)',
  },
  shotChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  shotCourtWrap: {
    aspectRatio: 1.88,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  shotHalfLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
  },
  shotPaint: {
    position: 'absolute',
    top: '28%',
    width: '15%',
    height: '44%',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  shotFTCircle: {
    position: 'absolute',
    top: '35%',
    width: '12%',
    height: '30%',
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  shotCenterCircle: {
    position: 'absolute',
    left: '43%',
    top: '35%',
    width: '14%',
    height: '30%',
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  shotThreeArc: {
    position: 'absolute',
    top: '5%',
    width: '45%',
    height: '90%',
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  shotTeamLabels: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  shotTeamBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shotTeamBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  shotDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    marginLeft: -4,
    marginTop: -4,
  },
  shotLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  shotLegendSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shotLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  shotLegendDivider: {
    width: 1,
    height: 16,
    marginHorizontal: 4,
  },
  shotLegendLabel: {
    fontSize: 10,
    fontWeight: '500',
  },

  // PBP
  halfHeader: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
  },
  halfHeaderText: {
    fontSize: 12, fontWeight: '700', letterSpacing: 0.5,
  },
  pbpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  pbpTime: { width: 42 },
  pbpTimeText: { fontSize: 12, fontWeight: '500', fontVariant: ['tabular-nums'] },
  pbpTeamDot: { width: 8, height: 8, borderRadius: 4 },
  pbpContent: { flex: 1 },
  pbpText: { fontSize: 14 },
  pbpScore: { fontSize: 13, fontWeight: '600', fontVariant: ['tabular-nums'] },

  // Filter sheet
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  filterResetText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterDoneText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterList: {
    paddingHorizontal: Spacing.md,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterOptionText: {
    fontSize: 15,
  },
  filterCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTeamToggle: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: Spacing.sm,
  },
  filterTeamPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  filterTeamPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
