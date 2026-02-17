/**
 * Sports Org Programs V2 — 14 FMU Athletic Programs Grid
 * Summary row, attention alerts, program cards, cross-program health.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ModeColors } from '@/constants/theme';

import {
  ORG_PROGRAMS,
  CROSS_PROGRAM_ALERTS,
  STATUS_COLORS,
  COMPLIANCE_COLORS,
  getProgramSummary,
  getAttentionPrograms,
  type OrgProgram,
} from '@/data/mock-org-programs-v2';

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
}

export function SportsOrgProgramsV2({ colors, accentColor }: Props) {
  const summary = getProgramSummary();
  const attentionPrograms = getAttentionPrograms();
  const [filter, setFilter] = useState<'all' | 'active' | 'attention'>('all');

  const filteredPrograms = filter === 'all'
    ? ORG_PROGRAMS
    : filter === 'active'
      ? ORG_PROGRAMS.filter((p) => p.status === 'active-season')
      : attentionPrograms;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Summary Row */}
      <View style={styles.summaryRow}>
        <SummaryChip label="Programs" value={String(summary.totalPrograms)} colors={colors} accent={accentColor} />
        <SummaryChip label="Active" value={String(summary.activeSeasonCount)} colors={colors} accent="#22c55e" />
        <SummaryChip label="Athletes" value={String(summary.totalAthletes)} colors={colors} accent={accentColor} />
        <SummaryChip label="Staff" value={String(summary.totalStaff)} colors={colors} accent={accentColor} />
        <SummaryChip label="Blockers" value={String(summary.totalBlockers)} colors={colors} accent={summary.totalBlockers > 0 ? '#ef4444' : '#22c55e'} />
      </View>

      {/* Filter Pills */}
      <View style={styles.filterRow}>
        {(['all', 'active', 'attention'] as const).map((f) => (
          <Pressable key={f} style={[styles.filterPill, filter === f && { backgroundColor: accentColor }]} onPress={() => setFilter(f)}>
            <ThemedText style={[styles.filterText, { color: filter === f ? '#fff' : colors.textSecondary }]}>
              {f === 'all' ? 'All' : f === 'active' ? 'Active Season' : `Attention (${attentionPrograms.length})`}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* Cross-Program Alerts */}
      {filter !== 'active' && CROSS_PROGRAM_ALERTS.length > 0 && (
        <View style={styles.alertsSection}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Attention Required</ThemedText>
          {CROSS_PROGRAM_ALERTS.map((alert) => (
            <View key={alert.id} style={[styles.alertCard, { backgroundColor: colors.card, borderColor: alert.color + '44' }]}>
              <View style={styles.alertHeader}>
                <IconSymbol name={alert.icon as any} size={16} color={alert.color} />
                <ThemedText style={[styles.alertTitle, { color: colors.text }]}>{alert.title}</ThemedText>
              </View>
              <ThemedText style={[styles.alertDesc, { color: colors.textSecondary }]}>{alert.description}</ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Program Cards */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
        {filter === 'all' ? 'All Programs' : filter === 'active' ? 'Active Season' : 'Needs Attention'}
      </ThemedText>
      {filteredPrograms.map((prog) => (
        <ProgramCard key={prog.id} prog={prog} colors={colors} accent={accentColor} />
      ))}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function SummaryChip({ label, value, colors, accent }: { label: string; value: string; colors: typeof Colors.light; accent: string }) {
  return (
    <View style={[styles.summaryChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.summaryValue, { color: accent }]}>{value}</ThemedText>
      <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

function ProgramCard({ prog, colors, accent }: { prog: OrgProgram; colors: typeof Colors.light; accent: string }) {
  return (
    <Pressable style={[styles.progCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.progHeader}>
        <View style={[styles.progAvatar, { backgroundColor: prog.avatarColor }]}>
          <ThemedText style={styles.progAvatarText}>{prog.headCoachInitials}</ThemedText>
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText style={[styles.progName, { color: colors.text }]}>{prog.name}</ThemedText>
          <ThemedText style={[styles.progCoach, { color: colors.textSecondary }]}>HC: {prog.headCoach}</ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[prog.status] + '22' }]}>
          <ThemedText style={[styles.statusText, { color: STATUS_COLORS[prog.status] }]}>
            {prog.status === 'active-season' ? 'Active' : prog.status === 'offseason' ? 'Off' : 'Pre'}
          </ThemedText>
        </View>
      </View>

      <View style={styles.progMetrics}>
        {prog.record && <MetricPill label="Record" value={prog.record} colors={colors} />}
        <MetricPill label="Roster" value={String(prog.rosterCount)} colors={colors} />
        <MetricPill label="Staff" value={String(prog.staffCount)} colors={colors} />
        {prog.recruitingHotCount > 0 && <MetricPill label="Recruits" value={String(prog.recruitingHotCount)} colors={colors} valueColor="#f59e0b" />}
        {prog.opsBlockers > 0 && <MetricPill label="Blockers" value={String(prog.opsBlockers)} colors={colors} valueColor="#ef4444" />}
        {prog.complianceFlags !== 'clear' && <MetricPill label="Compliance" value={prog.complianceFlags} colors={colors} valueColor={COMPLIANCE_COLORS[prog.complianceFlags]} />}
      </View>

      <ThemedText style={[styles.progNext, { color: colors.textSecondary }]}>
        Next: {prog.nextEvent} \u00b7 {prog.nextEventDate}
      </ThemedText>
    </Pressable>
  );
}

function MetricPill({ label, value, colors, valueColor }: { label: string; value: string; colors: typeof Colors.light; valueColor?: string }) {
  return (
    <View style={[styles.metricPill, { backgroundColor: colors.background }]}>
      <ThemedText style={[styles.metricPillLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
      <ThemedText style={[styles.metricPillValue, { color: valueColor ?? colors.text }]}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginTop: 16, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },

  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  summaryChip: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 1 },
  summaryValue: { fontSize: 18, fontWeight: '800' },
  summaryLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },

  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
  filterText: { fontSize: 12, fontWeight: '600' },

  alertsSection: { marginBottom: 8 },
  alertCard: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  alertTitle: { fontSize: 13, fontWeight: '700', flex: 1 },
  alertDesc: { fontSize: 12, lineHeight: 17 },

  progCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  progHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  progAvatarText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  progName: { fontSize: 15, fontWeight: '700' },
  progCoach: { fontSize: 11, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },

  progMetrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  metricPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', gap: 4, alignItems: 'center' },
  metricPillLabel: { fontSize: 10, fontWeight: '600' },
  metricPillValue: { fontSize: 12, fontWeight: '700' },

  progNext: { fontSize: 11, marginTop: 8 },
});
