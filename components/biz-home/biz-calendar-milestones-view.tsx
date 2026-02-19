/**
 * Biz Calendar Milestones View — Product, Fundraise, Traction sections
 * Timeline checklist, progress bars, and metric pills.
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { PRODUCT_MILESTONES, FUNDRAISE_METRICS, TRACTION_METRICS } from '@/data/mock-business-home';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

const STATUS_ICON: Record<string, { symbol: string; color: string }> = {
  completed: { symbol: '\u2713', color: '#22C55E' },
  in_progress: { symbol: '\u25CB', color: '#F59E0B' },
  upcoming: { symbol: '\u25CB', color: '#6B7280' },
};

export function BizCalendarMilestonesView({ colors, accent }: Props) {
  const completedCount = PRODUCT_MILESTONES.filter((m) => m.status === 'completed').length;
  const totalCount = PRODUCT_MILESTONES.length;
  const progressPct = totalCount > 0 ? completedCount / totalCount : 0;

  const fm = FUNDRAISE_METRICS;
  const raisedPct = fm.target > 0 ? fm.raised / fm.target : 0;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* ── PRODUCT ── */}
      <ThemedText style={[styles.sectionHeader, { color: accent }]}>PRODUCT</ThemedText>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Progress bar */}
        <View style={styles.progressRow}>
          <ThemedText style={[styles.progressLabel, { color: colors.textSecondary }]}>
            {completedCount}/{totalCount} milestones
          </ThemedText>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { width: `${progressPct * 100}%`, backgroundColor: accent }]} />
          </View>
        </View>

        {/* Checklist */}
        {PRODUCT_MILESTONES.map((ms) => {
          const icon = STATUS_ICON[ms.status];
          return (
            <View key={ms.id} style={styles.milestoneRow}>
              <ThemedText style={[styles.statusIcon, { color: icon.color }]}>{icon.symbol}</ThemedText>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.milestoneName, { color: colors.text }]}>{ms.name}</ThemedText>
                <ThemedText style={[styles.milestoneDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                  {ms.description}
                </ThemedText>
              </View>
            </View>
          );
        })}

      </View>

      {/* ── FUNDRAISE ── */}
      <ThemedText style={[styles.sectionHeader, { color: accent, marginTop: 20 }]}>FUNDRAISE</ThemedText>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.roundLabel, { color: colors.text }]}>
          {fm.currentRound.toUpperCase()} ROUND
        </ThemedText>

        {/* Raised vs Target */}
        <View style={styles.progressRow}>
          <ThemedText style={[styles.progressLabel, { color: colors.textSecondary }]}>
            ${(fm.raised / 1000).toFixed(0)}K / ${(fm.target / 1_000_000).toFixed(0)}M raised
          </ThemedText>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { width: `${Math.min(raisedPct * 100, 100)}%`, backgroundColor: '#22C55E' }]} />
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <MetricPill label="Conversations" value={String(fm.activeConversations)} colors={colors} />
          <MetricPill label="Proposals" value={String(fm.proposalsSent)} colors={colors} />
          <MetricPill label="Burn Rate" value={`$${(fm.burnRate / 1000).toFixed(0)}K/mo`} colors={colors} />
          <MetricPill label="Runway" value={`${fm.runway} mo`} colors={colors} />
        </View>

      </View>

      {/* ── TRACTION ── */}
      <ThemedText style={[styles.sectionHeader, { color: accent, marginTop: 20 }]}>TRACTION</ThemedText>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.metricsGrid}>
          <MetricPill label="Institutions" value={String(TRACTION_METRICS.institutions)} colors={colors} />
          <MetricPill label="Active Views" value={String(TRACTION_METRICS.activeViews)} colors={colors} />
          <MetricPill label="IP Docs" value={String(TRACTION_METRICS.ipDocs)} colors={colors} />
          <MetricPill label="Engines Built" value={String(TRACTION_METRICS.enginesBuilt)} colors={colors} />
          <MetricPill label="Transactions" value={String(TRACTION_METRICS.transactionsProcessed)} colors={colors} />
        </View>

        {/* Institution list */}
        <View style={styles.institutionList}>
          {TRACTION_METRICS.institutionNames.map((name) => (
            <ThemedText key={name} style={[styles.institutionName, { color: colors.textSecondary }]}>
              {name}
            </ThemedText>
          ))}
        </View>

      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function MetricPill({ label, value, colors }: { label: string; value: string; colors: typeof Colors.light }) {
  return (
    <View style={[styles.metricPill, { backgroundColor: colors.background }]}>
      <ThemedText style={[styles.metricValue, { color: colors.text }]}>{value}</ThemedText>
      <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  sectionHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  section: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 4 },
  progressRow: { marginBottom: 12 },
  progressLabel: { fontSize: 11, marginBottom: 6 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  milestoneRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  statusIcon: { fontSize: 16, fontWeight: '700', width: 20, textAlign: 'center', marginTop: 1 },
  milestoneName: { fontSize: 13, fontWeight: '700' },
  milestoneDesc: { fontSize: 11, marginTop: 2 },
  roundLabel: { fontSize: 14, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  metricPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  metricValue: { fontSize: 15, fontWeight: '800' },
  metricLabel: { fontSize: 10, marginTop: 2 },
  institutionList: { marginTop: 4, gap: 4, marginBottom: 8 },
  institutionName: { fontSize: 12 },
});
