/**
 * Team Stats Page
 * ESPN-style full comparison table with all team stats.
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
  KaNeXT_FULL_GAME_STATS,
  KaNeXT_RECORD,
  placeholderRecord,
  isConfGame,
  type FullGameStats,
} from '@/data/fmu';

type GameStatus = 'upcoming' | 'live' | 'final';

// Generate deterministic opponent stats from Carroll stats + opponent name
function generateOppStats(fmu: FullGameStats, opponent: string): FullGameStats {
  let h = 0;
  for (let i = 0; i < opponent.length; i++) h = ((h << 5) - h + opponent.charCodeAt(i)) | 0;
  const seed = (n: number) => { h = ((h << 5) - h + n) | 0; return Math.abs(h); };

  const oppFGA = fmu.fga + (seed(1) % 8) - 4;
  const oppFGM = Math.round(oppFGA * (0.36 + (seed(2) % 14) / 100));
  const opp3PA = fmu.three_pa + (seed(3) % 6) - 3;
  const opp3PM = Math.round(opp3PA * (0.24 + (seed(4) % 14) / 100));
  const oppFTA = fmu.fta + (seed(5) % 8) - 4;
  const oppFTM = Math.round(oppFTA * (0.60 + (seed(6) % 20) / 100));
  const oppTotalReb = fmu.total_rebounds + (seed(7) % 12) - 6;
  const oppOReb = Math.round(oppTotalReb * (0.25 + (seed(8) % 10) / 100));
  const oppDReb = oppTotalReb - oppOReb;
  const oppAst = fmu.assists + (seed(9) % 8) - 4;
  const oppStl = fmu.steals + (seed(10) % 4) - 2;
  const oppBlk = fmu.blocks + (seed(11) % 4) - 2;
  const oppTO = fmu.turnovers + (seed(12) % 6) - 3;
  const oppFouls = fmu.fouls + (seed(13) % 8) - 4;

  return {
    fg: Math.max(0, oppFGM),
    fga: Math.max(1, oppFGA),
    three_pt: Math.max(0, opp3PM),
    three_pa: Math.max(1, opp3PA),
    ft: Math.max(0, oppFTM),
    fta: Math.max(1, oppFTA),
    total_rebounds: Math.max(0, oppTotalReb),
    offensive_rebounds: Math.max(0, oppOReb),
    defensive_rebounds: Math.max(0, oppDReb),
    assists: Math.max(0, oppAst),
    steals: Math.max(0, oppStl),
    blocks: Math.max(0, oppBlk),
    turnovers: Math.max(0, oppTO),
    fouls: Math.max(0, oppFouls),
    fmu_score: fmu.opp_score,
    opp_score: fmu.fmu_score,
  };
}

export default function TeamStatsScreen() {
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

  const fmuStats = KaNeXT_FULL_GAME_STATS[gameId ?? ''];
  const oppStats = fmuStats ? generateOppStats(fmuStats, game.opponent) : null;

  // Build stat rows
  type StatRow = { label: string; oppVal: string; fmuVal: string; indent?: boolean };

  const pct = (m: number, a: number) => a > 0 ? String(Math.round((m / a) * 100)) : '0';

  const rows: StatRow[] = fmuStats && oppStats ? [
    { label: 'FG', oppVal: `${oppStats.fg}-${oppStats.fga}`, fmuVal: `${fmuStats.fg}-${fmuStats.fga}` },
    { label: 'Field Goal %', oppVal: pct(oppStats.fg, oppStats.fga), fmuVal: pct(fmuStats.fg, fmuStats.fga) },
    { label: '3PT', oppVal: `${oppStats.three_pt}-${oppStats.three_pa}`, fmuVal: `${fmuStats.three_pt}-${fmuStats.three_pa}` },
    { label: 'Three Point %', oppVal: pct(oppStats.three_pt, oppStats.three_pa), fmuVal: pct(fmuStats.three_pt, fmuStats.three_pa) },
    { label: 'FT', oppVal: `${oppStats.ft}-${oppStats.fta}`, fmuVal: `${fmuStats.ft}-${fmuStats.fta}` },
    { label: 'Free Throw %', oppVal: pct(oppStats.ft, oppStats.fta), fmuVal: pct(fmuStats.ft, fmuStats.fta) },
    { label: 'Rebounds', oppVal: String(oppStats.total_rebounds), fmuVal: String(fmuStats.total_rebounds) },
    { label: 'Offensive Rebounds', oppVal: String(oppStats.offensive_rebounds), fmuVal: String(fmuStats.offensive_rebounds), indent: true },
    { label: 'Defensive Rebounds', oppVal: String(oppStats.defensive_rebounds), fmuVal: String(fmuStats.defensive_rebounds), indent: true },
    { label: 'Assists', oppVal: String(oppStats.assists), fmuVal: String(fmuStats.assists) },
    { label: 'Steals', oppVal: String(oppStats.steals), fmuVal: String(fmuStats.steals) },
    { label: 'Blocks', oppVal: String(oppStats.blocks), fmuVal: String(fmuStats.blocks) },
    { label: 'Total Turnovers', oppVal: String(oppStats.turnovers), fmuVal: String(fmuStats.turnovers) },
    { label: 'Points Off Turnovers', oppVal: String(Math.round(oppStats.turnovers * 0.7)), fmuVal: String(Math.round(fmuStats.turnovers * 0.8)), indent: true },
    { label: 'Fast Break Points', oppVal: String(2 + (Math.abs(oppScore) % 8)), fmuVal: String(2 + (Math.abs(fmuScore) % 10)) },
    { label: 'Points in Paint', oppVal: String(Math.round(oppScore * 0.38)), fmuVal: String(Math.round(fmuScore * 0.42)) },
    { label: 'Fouls', oppVal: String(oppStats.fouls), fmuVal: String(fmuStats.fouls) },
    { label: 'Technical Fouls', oppVal: '0', fmuVal: '0', indent: true },
    { label: 'Flagrant Fouls', oppVal: '0', fmuVal: '0', indent: true },
    { label: 'Largest Lead', oppVal: isWin ? String(Math.max(0, (oppScore - fmuScore) + 2)) : String(Math.max(3, Math.round((oppScore - fmuScore) * 1.3))), fmuVal: isWin ? String(Math.max(3, Math.round((fmuScore - oppScore) * 1.3))) : String(Math.max(0, (fmuScore - oppScore) + 2)) },
    { label: 'Percent Led', oppVal: isWin ? String(7 + (Math.abs(oppScore) % 15)) : String(93 - (Math.abs(oppScore) % 10)), fmuVal: isWin ? String(93 - (Math.abs(fmuScore) % 10)) : String(7 + (Math.abs(fmuScore) % 15)) },
  ] : [];

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
            const isActive = tab.key === 'teamstats';
            return (
              <Pressable
                key={tab.key}
                style={[styles.espnTab, isActive && styles.espnTabActive]}
                onPress={() => {
                  if (tab.key === 'teamstats') return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (tab.key === 'gamecast') {
                    router.navigate({ pathname: '/coach/game-detail' as any, params: { gameId: gameId ?? '' } });
                  } else if (tab.key === 'boxscore') {
                    router.navigate({ pathname: '/coach/box-score' as any, params: { gameId: gameId ?? '' } });
                  } else if (tab.key === 'pbp') {
                    router.navigate({ pathname: '/coach/play-by-play' as any, params: { gameId: gameId ?? '' } });
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {rows.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {/* Section header + team icons */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderLabel, { color: colors.text }]}>TEAM STATS</Text>
              <View style={styles.tableHeaderIcons}>
                <View style={[styles.teamIcon, { backgroundColor: colors.backgroundTertiary }]}>
                  <Text style={[styles.teamIconText, { color: colors.textSecondary }]}>{opponentAbbr.charAt(0)}</Text>
                </View>
                <View style={[styles.teamIcon, { backgroundColor: colors.text + '15' }]}>
                  <Text style={[styles.teamIconText, { color: colors.text }]}>F</Text>
                </View>
              </View>
            </View>

            {/* Stat rows */}
            {rows.map((row, i) => (
              <View key={i}>
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                <View style={[styles.statRow, row.indent && styles.statRowIndent]}>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: row.indent ? colors.textTertiary : colors.text },
                      row.indent && styles.statLabelIndent,
                    ]}
                    numberOfLines={1}
                  >
                    {row.label}
                  </Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>{row.oppVal}</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>{row.fmuVal}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, height: 44,
  },
  backBtn: {
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  appBarTitle: { fontSize: 15, fontWeight: '500' },
  scoreboardCard: {
    borderRadius: BorderRadius.lg, overflow: 'hidden',
    paddingTop: Spacing.md, paddingHorizontal: Spacing.sm, marginBottom: Spacing.md,
  },
  scoreboardRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  scoreboardSide: {
    flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1,
  },
  scoreboardIcon: {
    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  scoreboardIconText: { fontSize: 14, fontWeight: '700' },
  scoreboardAbbr: { fontSize: 14, fontWeight: '700' },
  scoreboardRecord: { fontSize: 11, marginTop: 1 },
  scoreboardBigScore: { fontSize: 32, fontWeight: '700' },
  scoreboardCenter: { alignItems: 'center', paddingHorizontal: 10 },
  scoreboardFinal: { fontSize: 13, fontWeight: '500' },
  scoreboardArrow: { fontSize: 14, marginTop: 2 },
  espnTabRow: {
    flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, marginTop: Spacing.md,
  },
  espnTab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  espnTabActive: { borderBottomWidth: 2, borderBottomColor: '#B85C5C' },
  espnTabText: { fontSize: 13, fontWeight: '500' },
  espnTabTextActive: { fontWeight: '700' },
  scrollView: { flex: 1, paddingHorizontal: Spacing.md },
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  tableHeaderLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  tableHeaderIcons: {
    flexDirection: 'row',
    gap: 20,
  },
  teamIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamIconText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statRowIndent: {
    paddingLeft: 16,
  },
  statLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  statLabelIndent: {
    fontSize: 13,
    fontWeight: '400',
  },
  statValue: {
    width: 52,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
});
