/**
 * Sports Stats V2 — Full Team Statistics Hub
 * Pill tabs: Dashboard, Splits, Lineups, Play Types, Game Log, Players
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import {
  TEAM_IDENTITY,
  TEAM_DASHBOARD,
  SPLITS_MATRIX,
  TOP_LINEUPS,
  PLAY_TYPE_SUMMARY,
  GAME_LOG,
  PLAYER_LEADERBOARD,
} from '@/data/mock-stats-v2';

const PILLS = ['Dashboard', 'Splits', 'Lineups', 'Play Types', 'Game Log', 'Players'] as const;
type PillTab = (typeof PILLS)[number];

export function SportsStatsV2() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = ModeColors.sports.primary;
  const [activeTab, setActiveTab] = useState<PillTab>('Dashboard');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Pill Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillBar}>
        {PILLS.map((pill) => (
          <Pressable key={pill} style={[styles.pill, activeTab === pill && { backgroundColor: accent }]} onPress={() => setActiveTab(pill)}>
            <ThemedText style={[styles.pillText, { color: activeTab === pill ? '#fff' : colors.textSecondary }]}>{pill}</ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {activeTab === 'Dashboard' && <DashboardView colors={colors} accent={accent} />}
      {activeTab === 'Splits' && <SplitsView colors={colors} accent={accent} />}
      {activeTab === 'Lineups' && <LineupsView colors={colors} accent={accent} />}
      {activeTab === 'Play Types' && <PlayTypesView colors={colors} accent={accent} />}
      {activeTab === 'Game Log' && <GameLogView colors={colors} accent={accent} />}
      {activeTab === 'Players' && <PlayersView colors={colors} accent={accent} />}
    </View>
  );
}

// =============================================================================
// DASHBOARD VIEW
// =============================================================================

function DashboardView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  const ti = TEAM_IDENTITY;
  const td = TEAM_DASHBOARD;
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Identity */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <ThemedText style={[styles.cardTitle, { color: colors.text }]}>{ti.name}</ThemedText>
          <View style={[styles.badge, { backgroundColor: accent }]}><ThemedText style={styles.badgeText}>KR {ti.teamKR}</ThemedText></View>
        </View>
        <ThemedText style={[styles.cardSub, { color: colors.textSecondary }]}>{ti.level} \u00b7 {ti.conference} \u00b7 {ti.record} ({ti.confRecord} conf)</ThemedText>
        <View style={[styles.row, { marginTop: 10, gap: 16 }]}>
          <View><ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>OFF KR</ThemedText><ThemedText style={[styles.metricValue, { color: colors.text }]}>{ti.offKR}</ThemedText></View>
          <View><ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>DEF KR</ThemedText><ThemedText style={[styles.metricValue, { color: colors.text }]}>{ti.defKR}</ThemedText></View>
          <View><ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>Pace</ThemedText><ThemedText style={[styles.metricValue, { color: colors.text }]}>{td.pace}</ThemedText></View>
          <View><ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>Off Rtg</ThemedText><ThemedText style={[styles.metricValue, { color: colors.text }]}>{td.offRtg}</ThemedText></View>
          <View><ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>Def Rtg</ThemedText><ThemedText style={[styles.metricValue, { color: colors.text }]}>{td.defRtg}</ThemedText></View>
        </View>
      </View>

      {/* Four Factors */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Four Factors</ThemedText>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.ffHeader}>
          <ThemedText style={[styles.ffLabel, { color: colors.textSecondary, flex: 0.4 }]}>Factor</ThemedText>
          <ThemedText style={[styles.ffLabel, { color: colors.textSecondary, flex: 0.3, textAlign: 'center' }]}>Offense</ThemedText>
          <ThemedText style={[styles.ffLabel, { color: colors.textSecondary, flex: 0.3, textAlign: 'center' }]}>Defense</ThemedText>
        </View>
        {(['eFG', 'toPct', 'orebPct', 'ftRate'] as const).map((key) => {
          const labels: Record<string, string> = { eFG: 'eFG%', toPct: 'TO%', orebPct: 'OREB%', ftRate: 'FT Rate' };
          return (
            <View key={key} style={styles.ffRow}>
              <ThemedText style={[styles.ffCell, { flex: 0.4, color: colors.text }]}>{labels[key]}</ThemedText>
              <ThemedText style={[styles.ffCell, { flex: 0.3, textAlign: 'center', color: colors.text }]}>{td.offFourFactors[key].toFixed(1)}</ThemedText>
              <ThemedText style={[styles.ffCell, { flex: 0.3, textAlign: 'center', color: colors.text }]}>{td.defFourFactors[key].toFixed(1)}</ThemedText>
            </View>
          );
        })}
      </View>

      {/* Shot Profile */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Shot Profile</ThemedText>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {td.shotProfile.map((sp) => (
          <View key={sp.zone} style={styles.ffRow}>
            <ThemedText style={[styles.ffCell, { flex: 0.25, color: colors.text }]}>{sp.zone}</ThemedText>
            <ThemedText style={[styles.ffCell, { flex: 0.25, textAlign: 'center', color: colors.text }]}>{sp.freq}%</ThemedText>
            <ThemedText style={[styles.ffCell, { flex: 0.25, textAlign: 'center', color: colors.text }]}>{sp.efg > 0 ? sp.efg + '%' : '\u2014'}</ThemedText>
            <ThemedText style={[styles.ffCell, { flex: 0.25, textAlign: 'center', color: colors.text }]}>{sp.ppp}</ThemedText>
          </View>
        ))}
      </View>
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// =============================================================================
// SPLITS VIEW
// =============================================================================

function SplitsView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {SPLITS_MATRIX.map((group) => (
        <View key={group.category}>
          <ThemedText style={[styles.sectionTitle, { color: accent }]}>{group.categoryLabel}</ThemedText>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.ffHeader}>
              <ThemedText style={[styles.ffLabel, { flex: 0.3, color: colors.textSecondary }]}>Split</ThemedText>
              <ThemedText style={[styles.ffLabel, { flex: 0.175, textAlign: 'center', color: colors.textSecondary }]}>ORtg</ThemedText>
              <ThemedText style={[styles.ffLabel, { flex: 0.175, textAlign: 'center', color: colors.textSecondary }]}>DRtg</ThemedText>
              <ThemedText style={[styles.ffLabel, { flex: 0.175, textAlign: 'center', color: colors.textSecondary }]}>Net</ThemedText>
              <ThemedText style={[styles.ffLabel, { flex: 0.175, textAlign: 'center', color: colors.textSecondary }]}>eFG%</ThemedText>
            </View>
            {group.rows.map((row) => (
              <View key={row.label} style={styles.ffRow}>
                <ThemedText style={[styles.ffCell, { flex: 0.3, color: colors.text }]}>{row.label}</ThemedText>
                <ThemedText style={[styles.ffCell, { flex: 0.175, textAlign: 'center', color: colors.text }]}>{row.offRtg}</ThemedText>
                <ThemedText style={[styles.ffCell, { flex: 0.175, textAlign: 'center', color: colors.text }]}>{row.defRtg}</ThemedText>
                <ThemedText style={[styles.ffCell, { flex: 0.175, textAlign: 'center', color: row.netRtg >= 0 ? '#22c55e' : '#ef4444' }]}>{row.netRtg > 0 ? '+' : ''}{row.netRtg}</ThemedText>
                <ThemedText style={[styles.ffCell, { flex: 0.175, textAlign: 'center', color: colors.text }]}>{row.eFG}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// =============================================================================
// LINEUPS VIEW
// =============================================================================

function LineupsView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Top 5 Lineups (by minutes)</ThemedText>
      {TOP_LINEUPS.map((lu) => (
        <View key={lu.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 10 }]}>
          <View style={styles.row}>
            <View style={[styles.rankBadge, { backgroundColor: accent }]}><ThemedText style={styles.badgeText}>#{lu.rank}</ThemedText></View>
            <ThemedText style={[styles.cardSub, { color: colors.textSecondary }]}>{lu.minutes} min \u00b7 {lu.possessions} poss</ThemedText>
          </View>
          <ThemedText style={[styles.lineupPlayers, { color: colors.text }]}>{lu.players.join(' \u2022 ')}</ThemedText>
          <View style={[styles.row, { marginTop: 8, gap: 16 }]}>
            <View><ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>Net</ThemedText><ThemedText style={[styles.metricValue, { color: lu.netRtg >= 0 ? '#22c55e' : '#ef4444' }]}>{lu.netRtg > 0 ? '+' : ''}{lu.netRtg}</ThemedText></View>
            <View><ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>ORtg</ThemedText><ThemedText style={[styles.metricValue, { color: colors.text }]}>{lu.offRtg}</ThemedText></View>
            <View><ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>DRtg</ThemedText><ThemedText style={[styles.metricValue, { color: colors.text }]}>{lu.defRtg}</ThemedText></View>
          </View>
        </View>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// =============================================================================
// PLAY TYPES VIEW
// =============================================================================

function PlayTypesView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  const offense = PLAY_TYPE_SUMMARY.filter((p) => p.category === 'offense');
  const defense = PLAY_TYPE_SUMMARY.filter((p) => p.category === 'defense');
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ThemedText style={[styles.sectionTitle, { color: accent }]}>Offense</ThemedText>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {offense.map((pt) => (
          <View key={pt.type} style={styles.ptRow}>
            <ThemedText style={[styles.ptType, { color: colors.text }]}>{pt.type}</ThemedText>
            <ThemedText style={[styles.ptStat, { color: colors.textSecondary }]}>{pt.possPct}%</ThemedText>
            <ThemedText style={[styles.ptStat, { color: colors.text }]}>{pt.ppp} PPP</ThemedText>
            <View style={[styles.percentileBadge, { backgroundColor: pt.percentile >= 70 ? '#22c55e22' : pt.percentile >= 50 ? '#f59e0b22' : '#ef444422' }]}>
              <ThemedText style={[styles.percentileText, { color: pt.percentile >= 70 ? '#22c55e' : pt.percentile >= 50 ? '#f59e0b' : '#ef4444' }]}>{pt.percentile}th</ThemedText>
            </View>
          </View>
        ))}
      </View>

      <ThemedText style={[styles.sectionTitle, { color: accent }]}>Defense</ThemedText>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {defense.map((pt) => (
          <View key={pt.type} style={styles.ptRow}>
            <ThemedText style={[styles.ptType, { color: colors.text }]}>{pt.type}</ThemedText>
            <ThemedText style={[styles.ptStat, { color: colors.textSecondary }]}>{pt.possPct}%</ThemedText>
            <ThemedText style={[styles.ptStat, { color: colors.text }]}>{pt.ppp} PPP</ThemedText>
            <View style={[styles.percentileBadge, { backgroundColor: pt.percentile >= 70 ? '#22c55e22' : pt.percentile >= 50 ? '#f59e0b22' : '#ef444422' }]}>
              <ThemedText style={[styles.percentileText, { color: pt.percentile >= 70 ? '#22c55e' : pt.percentile >= 50 ? '#f59e0b' : '#ef4444' }]}>{pt.percentile}th</ThemedText>
            </View>
          </View>
        ))}
      </View>
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// =============================================================================
// GAME LOG VIEW
// =============================================================================

function GameLogView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {GAME_LOG.map((game) => (
        <View key={game.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 8 }]}>
          <View style={styles.row}>
            <View style={[styles.resultDot, { backgroundColor: game.result === 'W' ? '#22c55e' : '#ef4444' }]} />
            <ThemedText style={[styles.glOpponent, { color: colors.text }]}>{game.result} vs {game.opponent}</ThemedText>
            <ThemedText style={[styles.glScore, { color: colors.textSecondary }]}>{game.score}</ThemedText>
          </View>
          <ThemedText style={[styles.glDate, { color: colors.textSecondary }]}>{game.date} \u00b7 Pace {game.pace} \u00b7 ORtg {game.offRtg} \u00b7 DRtg {game.defRtg}</ThemedText>
          <ThemedText style={[styles.glSwing, { color: accent }]}>Swing: {game.swingFactor}</ThemedText>
        </View>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// =============================================================================
// PLAYERS VIEW
// =============================================================================

function PlayersView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {PLAYER_LEADERBOARD.map((p) => (
        <View key={p.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 8 }]}>
          <View style={styles.row}>
            <ThemedText style={[styles.playerName, { color: colors.text }]}>#{p.number} {p.name}</ThemedText>
            <ThemedText style={[styles.playerPos, { color: accent }]}>{p.position}</ThemedText>
            <View style={[styles.badge, { backgroundColor: accent }]}><ThemedText style={styles.badgeText}>KR {p.kr}</ThemedText></View>
          </View>
          <View style={[styles.row, { marginTop: 8, gap: 12, flexWrap: 'wrap' }]}>
            <MiniStat label="PTS" value={p.pts.toFixed(1)} colors={colors} />
            <MiniStat label="eFG%" value={p.efg.toFixed(1)} colors={colors} />
            <MiniStat label="3P%" value={p.threePct.toFixed(1)} colors={colors} />
            <MiniStat label="AST%" value={p.astRate.toFixed(1)} colors={colors} />
            <MiniStat label="TO%" value={p.toPct.toFixed(1)} colors={colors} />
            <MiniStat label="USG" value={p.usage.toFixed(1)} colors={colors} />
            <MiniStat label="MIN" value={p.minutes.toFixed(1)} colors={colors} />
          </View>
        </View>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function MiniStat({ label, value, colors }: { label: string; value: string; colors: typeof Colors.light }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <ThemedText style={[styles.miniLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
      <ThemedText style={[styles.miniValue, { color: colors.text }]}>{value}</ThemedText>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  pillBar: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
  pillText: { fontSize: 12, fontWeight: '600' },

  card: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginTop: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },

  cardTitle: { fontSize: 17, fontWeight: '800', flex: 1 },
  cardSub: { fontSize: 12, marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  rankBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },

  metricLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase' },
  metricValue: { fontSize: 15, fontWeight: '700', marginTop: 1 },

  // Four Factors / Tables
  ffHeader: { flexDirection: 'row', paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  ffLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  ffRow: { flexDirection: 'row', paddingVertical: 6 },
  ffCell: { fontSize: 13 },

  // Lineups
  lineupPlayers: { fontSize: 13, fontWeight: '600', marginTop: 6 },

  // Play Types
  ptRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  ptType: { fontSize: 13, fontWeight: '600', flex: 1 },
  ptStat: { fontSize: 12, width: 52, textAlign: 'right' },
  percentileBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginLeft: 4 },
  percentileText: { fontSize: 11, fontWeight: '700' },

  // Game Log
  resultDot: { width: 8, height: 8, borderRadius: 4 },
  glOpponent: { fontSize: 14, fontWeight: '600', flex: 1 },
  glScore: { fontSize: 14, fontWeight: '700' },
  glDate: { fontSize: 11, marginTop: 4 },
  glSwing: { fontSize: 12, fontWeight: '600', marginTop: 4 },

  // Players
  playerName: { fontSize: 15, fontWeight: '700', flex: 1 },
  playerPos: { fontSize: 13, fontWeight: '600' },
  miniLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase' },
  miniValue: { fontSize: 13, fontWeight: '700', marginTop: 1 },
});
