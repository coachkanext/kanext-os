/**
 * Carroll Key Plays Page
 * Curated highlight plays from the game with context and impact.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  KaNeXT_GAMES_BY_ID,
  KaNeXT_RECORD,
  placeholderRecord,
  isConfGame,
} from '@/data/fmu';

// ── Key play generator ──

interface KeyPlay {
  time: string;
  half: '1st' | '2nd';
  team: 'fmu' | 'opp';
  headline: string;
  detail: string;
  score: string;
  impact: 'high' | 'medium';
}

function generateKeyPlays(opponent: string, fmuScore: number, oppScore: number): KeyPlay[] {
  let h = 0;
  for (let i = 0; i < opponent.length; i++) h = ((h << 5) - h + opponent.charCodeAt(i)) | 0;
  const seed = () => { h = ((h << 5) - h + 0x5bd1e995) | 0; return Math.abs(h) % 1000; };

  const KaNeXT_NAMES = ['Selden', 'Morgan', 'Turner', 'Lewis', 'Carter', 'Noel', 'Thomas'];
  const OPP_NAMES = ['Johnson', 'Williams', 'Davis', 'Brown', 'Wilson', 'Anderson', 'Taylor'];
  const oppAbbr = opponent.substring(0, 3).toUpperCase();

  const plays: KeyPlay[] = [];
  let fmuRunning = 0;
  let oppRunning = 0;

  // 1st half key plays
  const firstHalfPlays = 4 + (seed() % 3);
  for (let i = 0; i < firstHalfPlays; i++) {
    const minutesLeft = 18 - Math.floor((i / firstHalfPlays) * 18);
    const seconds = seed() % 60;
    const time = `${minutesLeft}:${seconds.toString().padStart(2, '0')}`;
    const isFmu = seed() % 2 === 0;
    const names = isFmu ? KaNeXT_NAMES : OPP_NAMES;
    const name = names[seed() % names.length];
    const teamLabel = isFmu ? 'Carroll' : oppAbbr;

    const playType = seed() % 6;
    let headline: string;
    let detail: string;
    let pts: number;

    if (playType === 0) {
      headline = `${name} 3-pointer`;
      detail = `${teamLabel} ${name} drills a three from the wing to cap a ${5 + (seed() % 6)}-0 run`;
      pts = 3;
    } else if (playType === 1) {
      headline = `${name} and-one`;
      detail = `${name} finishes through contact at the rim and converts the free throw`;
      pts = 3;
    } else if (playType === 2) {
      headline = `${name} fast break dunk`;
      detail = `${name} gets the steal and goes coast-to-coast for the emphatic slam`;
      pts = 2;
    } else if (playType === 3) {
      headline = `${name} buzzer beater`;
      detail = `${name} pulls up from mid-range as the shot clock expires`;
      pts = 2;
    } else if (playType === 4) {
      headline = `${name} back-to-back 3s`;
      detail = `${name} buries consecutive threes to shift momentum for ${teamLabel}`;
      pts = 3;
    } else {
      headline = `${name} block and score`;
      detail = `${name} swats it on defense then finishes on the other end in transition`;
      pts = 2;
    }

    if (isFmu) fmuRunning += pts; else oppRunning += pts;
    const impact: KeyPlay['impact'] = playType <= 1 || playType === 4 ? 'high' : 'medium';

    plays.push({
      time,
      half: '1st',
      team: isFmu ? 'fmu' : 'opp',
      headline,
      detail,
      score: `${fmuRunning}-${oppRunning}`,
      impact,
    });
  }

  // Halftime
  const halfFmu = Math.round(fmuScore * 0.48);
  const halfOpp = Math.round(oppScore * 0.48);
  fmuRunning = halfFmu;
  oppRunning = halfOpp;

  // 2nd half key plays
  const secondHalfPlays = 5 + (seed() % 3);
  for (let i = 0; i < secondHalfPlays; i++) {
    const minutesLeft = 18 - Math.floor((i / secondHalfPlays) * 18);
    const seconds = seed() % 60;
    const time = `${minutesLeft}:${seconds.toString().padStart(2, '0')}`;
    const isFmu = seed() % 2 === 0;
    const names = isFmu ? KaNeXT_NAMES : OPP_NAMES;
    const name = names[seed() % names.length];
    const teamLabel = isFmu ? 'Carroll' : oppAbbr;

    const playType = seed() % 7;
    let headline: string;
    let detail: string;
    let pts: number;

    if (playType === 0) {
      headline = `${name} clutch triple`;
      detail = `${teamLabel} ${name} knocks down a huge three to extend the lead`;
      pts = 3;
    } else if (playType === 1) {
      headline = `${name} driving layup`;
      detail = `${name} attacks the basket and scores through traffic in the lane`;
      pts = 2;
    } else if (playType === 2) {
      headline = `${name} steal and score`;
      detail = `${name} picks the pocket and converts the fast break opportunity`;
      pts = 2;
    } else if (playType === 3) {
      headline = `${name} free throws`;
      detail = `${name} calmly sinks both free throws to ice the game`;
      pts = 2;
    } else if (playType === 4) {
      headline = `${name} putback slam`;
      detail = `${name} grabs the offensive rebound and throws it down with authority`;
      pts = 2;
    } else if (playType === 5) {
      headline = `${name} step-back jumper`;
      detail = `${name} creates separation and hits from the elbow in a key moment`;
      pts = 2;
    } else {
      headline = `${name} 3-pointer`;
      detail = `${name} catches and shoots from the corner to cut into the deficit`;
      pts = 3;
    }

    if (isFmu) fmuRunning += pts; else oppRunning += pts;
    const impact: KeyPlay['impact'] = (minutesLeft <= 5 || playType === 0) ? 'high' : 'medium';

    plays.push({
      time,
      half: '2nd',
      team: isFmu ? 'fmu' : 'opp',
      headline,
      detail,
      score: `${fmuRunning}-${oppRunning}`,
      impact,
    });
  }

  // Fix final score
  if (plays.length > 0) {
    plays[plays.length - 1].score = `${fmuScore}-${oppScore}`;
  }

  return plays;
}

// ── Component ──

type GameStatus = 'upcoming' | 'live' | 'final';

export default function KeyPlaysScreen() {
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

  const keyPlays = generateKeyPlays(game.opponent, fmuScore, oppScore);

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
            { key: 'gamecast', label: 'SaintsCast' },
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
        <Pressable
          style={[styles.playTypePill, { backgroundColor: colors.backgroundTertiary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.navigate({ pathname: '/coach/play-by-play' as any, params: { gameId: gameId ?? '' } });
          }}
        >
          <Text style={[styles.playTypePillText, { color: colors.textSecondary }]}>All Plays</Text>
        </Pressable>
        <Pressable style={[styles.playTypePill, { backgroundColor: colors.text + 'E0' }]}>
          <Text style={[styles.playTypePillText, { color: colors.background }]}>Carroll Key Plays</Text>
        </Pressable>
      </View>

      {/* Key plays list */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {keyPlays.map((play, idx) => {
          const prevHalf = idx > 0 ? keyPlays[idx - 1].half : null;
          const showHalfHeader = play.half !== prevHalf;
          const isFmu = play.team === 'fmu';
          const dotColor = isFmu ? colors.text : '#9C9790';

          return (
            <View key={idx}>
              {showHalfHeader && (
                <View style={[styles.halfHeader, { borderBottomColor: colors.divider }]}>
                  <Text style={[styles.halfHeaderText, { color: colors.textSecondary }]}>
                    {play.half === '1st' ? '1ST HALF' : '2ND HALF'}
                  </Text>
                </View>
              )}
              <View style={[styles.keyPlayCard, { backgroundColor: colors.backgroundSecondary }]}>
                {/* Top row: dot + headline + Carroll Video logo */}
                <View style={styles.keyPlayTopRow}>
                  <View style={[styles.keyPlayDot, { backgroundColor: dotColor }]} />
                  <Text style={[styles.keyPlayHeadline, { color: colors.text }]} numberOfLines={1}>
                    {play.headline}
                  </Text>
                  <View style={styles.kxTubeLogo}>
                    <IconSymbol name="play.fill" size={10} color="#fff" />
                  </View>
                </View>
                {/* Detail */}
                <Text style={[styles.keyPlayDetail, { color: colors.textSecondary }]}>{play.detail}</Text>
                {/* Footer: time + score + impact */}
                <View style={styles.keyPlayFooter}>
                  <Text style={[styles.keyPlayTime, { color: colors.textTertiary }]}>
                    {play.half === '1st' ? '1H' : '2H'} {play.time}
                  </Text>
                  <Text style={[styles.keyPlayScore, { color: colors.textTertiary }]}>{play.score}</Text>
                  {play.impact === 'high' && (
                    <View style={[styles.impactBadge, { backgroundColor: '#B85C5C' + '20' }]}>
                      <Text style={[styles.impactText, { color: '#B85C5C' }]}>Key Moment</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
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
  espnTabActive: { borderBottomWidth: 2, borderBottomColor: '#B85C5C' },
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
  halfHeader: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
  },
  halfHeaderText: {
    fontSize: 12, fontWeight: '700', letterSpacing: 0.5,
  },
  keyPlayCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  keyPlayTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  keyPlayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  keyPlayHeadline: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  kxTubeLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#B85C5C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPlayDetail: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    paddingLeft: 16,
  },
  keyPlayFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingLeft: 16,
  },
  keyPlayTime: {
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  keyPlayScore: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  impactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  impactText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
