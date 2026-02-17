/**
 * DevHome — Development home view: non-negotiables, priorities, position groups, alerts, evidence, progress.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AskNexusCTA } from '@/components/ui/ask-nexus-cta';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  WEEKLY_NON_NEGOTIABLES,
  TEAM_PRIORITIES,
  POSITION_GROUPS,
  PLAYER_ALERTS,
  EVIDENCE_QUEUE,
  PROGRESS_SNAPSHOT,
} from '@/data/mock-development-v2';

const ACCENT = '#FFFFFF';

const ALERT_COLORS: Record<string, string> = {
  regression: Brand.error,
  injury: Brand.warning,
  breakout: Brand.success,
  milestone: Brand.precision,
};

const ALERT_ICONS: Record<string, string> = {
  regression: 'arrow.down.right',
  injury: 'bandage',
  breakout: 'arrow.up.right',
  milestone: 'flag.fill',
};

const COVERAGE_COLORS: Record<string, string> = {
  strong: Brand.success,
  adequate: Brand.warning,
  weak: Brand.error,
};

function SectionLabel({ title }: { title: string }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>{title}</ThemedText>
  );
}

export function DevHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const snap = PROGRESS_SNAPSHOT;
  const pendingEvidence = EVIDENCE_QUEUE.filter(e => e.status === 'pending').length;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {/* Non-Negotiables */}
      <SectionLabel title="WEEKLY NON-NEGOTIABLES" />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {WEEKLY_NON_NEGOTIABLES.map((nn, i) => (
          <View key={nn.id} style={[styles.nnRow, i < WEEKLY_NON_NEGOTIABLES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
            <View style={[styles.nnCat, { backgroundColor: ACCENT + '15' }]}>
              <ThemedText style={[styles.nnCatText, { color: ACCENT }]}>{nn.category}</ThemedText>
            </View>
            <ThemedText style={[styles.nnRule, { color: colors.text }]}>{nn.rule}</ThemedText>
          </View>
        ))}
      </View>

      {/* Top 5 Team Priorities */}
      <SectionLabel title="TOP 5 TEAM PRIORITIES" />
      {TEAM_PRIORITIES.map((tp) => (
        <View key={tp.id} style={[styles.card, styles.priorityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.priorityHeader}>
            <View style={[styles.rankBadge, { backgroundColor: ACCENT + '15' }]}>
              <ThemedText style={[styles.rankText, { color: ACCENT }]}>#{tp.rank}</ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.priorityTitle, { color: colors.text }]}>{tp.title}</ThemedText>
              <ThemedText style={[styles.priorityDesc, { color: colors.textTertiary }]}>{tp.description}</ThemedText>
            </View>
            <View style={[styles.coverageBadge, { backgroundColor: COVERAGE_COLORS[tp.coverageTier] + '20' }]}>
              <ThemedText style={[styles.coverageText, { color: COVERAGE_COLORS[tp.coverageTier] }]}>{tp.coverageTier}</ThemedText>
            </View>
          </View>
          <View style={styles.progressRow}>
            <View style={[styles.progressBarBg, { backgroundColor: colors.backgroundTertiary }]}>
              <View style={[styles.progressBarFill, { width: `${tp.progress}%`, backgroundColor: COVERAGE_COLORS[tp.coverageTier] }]} />
            </View>
            <ThemedText style={[styles.progressPct, { color: colors.textTertiary }]}>{tp.progress}%</ThemedText>
          </View>
        </View>
      ))}

      {/* Position Group Focus */}
      <SectionLabel title="POSITION GROUP FOCUS" />
      <View style={styles.groupGrid}>
        {POSITION_GROUPS.map((pg) => (
          <Pressable
            key={pg.id}
            style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={styles.groupHeader}>
              <ThemedText style={[styles.groupName, { color: colors.text }]}>{pg.name}</ThemedText>
              <ThemedText style={[styles.groupCount, { color: colors.textTertiary }]}>{pg.playerCount}</ThemedText>
            </View>
            <ThemedText style={[styles.groupFocus, { color: colors.textSecondary }]} numberOfLines={1}>{pg.topFocus}</ThemedText>
            <View style={styles.healthRow}>
              <View style={[styles.healthBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                <View style={[styles.healthBarFill, { width: `${pg.healthScore}%`, backgroundColor: pg.healthScore >= 75 ? Brand.success : pg.healthScore >= 55 ? Brand.warning : Brand.error }]} />
              </View>
              <ThemedText style={[styles.healthPct, { color: colors.textTertiary }]}>{pg.healthScore}</ThemedText>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Players Needing Attention */}
      <SectionLabel title="PLAYERS NEEDING ATTENTION" />
      {PLAYER_ALERTS.map((alert) => (
        <View key={alert.id} style={[styles.alertCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.alertIcon, { backgroundColor: (ALERT_COLORS[alert.type] ?? Brand.precision) + '15' }]}>
            <IconSymbol name={(ALERT_ICONS[alert.type] ?? 'info.circle') as any} size={14} color={ALERT_COLORS[alert.type] ?? Brand.precision} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.alertNameRow}>
              <ThemedText style={[styles.alertName, { color: colors.text }]}>{alert.playerName}</ThemedText>
              <View style={[styles.alertTypeBadge, { backgroundColor: (ALERT_COLORS[alert.type] ?? Brand.precision) + '15' }]}>
                <ThemedText style={[styles.alertTypeText, { color: ALERT_COLORS[alert.type] ?? Brand.precision }]}>{alert.type}</ThemedText>
              </View>
            </View>
            <ThemedText style={[styles.alertMsg, { color: colors.textSecondary }]}>{alert.message}</ThemedText>
            <ThemedText style={[styles.alertDate, { color: colors.textTertiary }]}>{alert.date}</ThemedText>
          </View>
        </View>
      ))}

      {/* Evidence Queue */}
      <SectionLabel title="EVIDENCE QUEUE" />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.evRow}>
          <View style={[styles.evIcon, { backgroundColor: Brand.warning + '15' }]}>
            <IconSymbol name="tray.fill" size={18} color={Brand.warning} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.evTitle, { color: colors.text }]}>{pendingEvidence} pending review</ThemedText>
            <ThemedText style={[styles.evSub, { color: colors.textTertiary }]}>
              {EVIDENCE_QUEUE.filter(e => e.status === 'flagged').length} flagged • {EVIDENCE_QUEUE.filter(e => e.status === 'reviewed').length} reviewed
            </ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
        </View>
      </View>

      {/* Progress Snapshot */}
      <SectionLabel title="PROGRESS SNAPSHOT" />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.snapRow}>
          <View style={styles.snapItem}>
            <ThemedText style={[styles.snapValue, { color: ACCENT }]}>{snap.overallScore}</ThemedText>
            <ThemedText style={[styles.snapLabel, { color: colors.textTertiary }]}>Overall</ThemedText>
          </View>
          <View style={[styles.snapDivider, { backgroundColor: colors.border }]} />
          <View style={styles.snapItem}>
            <ThemedText style={[styles.snapValue, { color: snap.deltaFromLastWeek > 0 ? Brand.success : Brand.error }]}>
              {snap.deltaFromLastWeek > 0 ? '+' : ''}{snap.deltaFromLastWeek}
            </ThemedText>
            <ThemedText style={[styles.snapLabel, { color: colors.textTertiary }]}>vs Last Wk</ThemedText>
          </View>
          <View style={[styles.snapDivider, { backgroundColor: colors.border }]} />
          <View style={styles.snapItem}>
            <ThemedText style={[styles.snapValue, { color: Brand.success }]}>{snap.achievedCount}</ThemedText>
            <ThemedText style={[styles.snapLabel, { color: colors.textTertiary }]}>Achieved</ThemedText>
          </View>
          <View style={[styles.snapDivider, { backgroundColor: colors.border }]} />
          <View style={styles.snapItem}>
            <ThemedText style={[styles.snapValue, { color: Brand.error }]}>{snap.needsWorkCount}</ThemedText>
            <ThemedText style={[styles.snapLabel, { color: colors.textTertiary }]}>Needs Work</ThemedText>
          </View>
        </View>
        <View style={[styles.snapFooter, { borderTopColor: colors.border }]}>
          <ThemedText style={[styles.snapFooterText, { color: colors.textTertiary }]}>
            Top improver: {snap.topImprover} (+{snap.topImproverDelta} pts)
          </ThemedText>
        </View>
      </View>

      <AskNexusCTA label="Get Development Recommendations" engineContext="development" />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: 40 },

  sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: Spacing.lg, marginBottom: Spacing.sm },

  card: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },

  // Non-negotiables
  nnRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  nnCat: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  nnCatText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  nnRule: { flex: 1, fontSize: 13, lineHeight: 18 },

  // Priorities
  priorityCard: { marginBottom: Spacing.sm },
  priorityHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  rankBadge: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  rankText: { fontSize: 12, fontWeight: '800' },
  priorityTitle: { fontSize: 14, fontWeight: '600' },
  priorityDesc: { fontSize: 12, lineHeight: 16, marginTop: 2 },
  coverageBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  coverageText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
  progressBarBg: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  progressPct: { fontSize: 11, fontWeight: '600', width: 32, textAlign: 'right' },

  // Position groups
  groupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  groupCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.sm, width: '48%' as any, flexGrow: 1 },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  groupName: { fontSize: 14, fontWeight: '700' },
  groupCount: { fontSize: 12, fontWeight: '600' },
  groupFocus: { fontSize: 11, marginTop: 4 },
  healthRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  healthBarBg: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  healthBarFill: { height: '100%', borderRadius: 2 },
  healthPct: { fontSize: 10, fontWeight: '600', width: 22 },

  // Alerts
  alertCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm, flexDirection: 'row', gap: 10 },
  alertIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  alertNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertName: { fontSize: 14, fontWeight: '600' },
  alertTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  alertTypeText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  alertMsg: { fontSize: 12, lineHeight: 16, marginTop: 3 },
  alertDate: { fontSize: 10, marginTop: 3 },

  // Evidence queue
  evRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  evIcon: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  evTitle: { fontSize: 14, fontWeight: '600' },
  evSub: { fontSize: 12, marginTop: 2 },

  // Progress snapshot
  snapRow: { flexDirection: 'row', alignItems: 'center' },
  snapItem: { flex: 1, alignItems: 'center' },
  snapValue: { fontSize: 18, fontWeight: '800' },
  snapLabel: { fontSize: 10, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.3 },
  snapDivider: { width: 1, height: 28 },
  snapFooter: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: Spacing.sm, paddingTop: Spacing.sm },
  snapFooterText: { fontSize: 12, textAlign: 'center' },
});
