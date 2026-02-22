/**
 * Education Admissions Pipeline View
 * Summary card + stage pills + student rows with stage badges.
 * Tap row -> openPersonCard().
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Pressable, FlatList, Text } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import {
  ADMISSIONS_PIPELINE,
  ADMISSIONS_STAGES,
  ADMISSIONS_SUMMARY,
  getStageCount,
  getStageColor,
  type AdmissionsPipelineEntry,
  type AdmissionsStage,
} from '@/data/mock-education-home';
import { openPersonCard } from '@/utils/global-entity-sheets';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

type FilterKey = 'all' | AdmissionsStage;

const AID_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  approved: { bg: '#22C55E22', text: '#22C55E' },
  pending: { bg: '#F59E0B22', text: '#F59E0B' },
  not_applied: { bg: '#A1A1AA22', text: '#A1A1AA' },
  denied: { bg: '#EF444422', text: '#EF4444' },
};

const AID_STATUS_LABELS: Record<string, string> = {
  approved: 'Aid Approved',
  pending: 'Aid Pending',
  not_applied: 'No Aid App',
  denied: 'Aid Denied',
};

function daysUntilDeadline(deadline: string): number {
  const now = new Date();
  const target = new Date(deadline + 'T00:00:00');
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export function EduAdmissionsPipelineView({ colors, accent }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return ADMISSIONS_PIPELINE;
    return ADMISSIONS_PIPELINE.filter((e) => e.stage === activeFilter);
  }, [activeFilter]);

  const daysLeft = daysUntilDeadline(ADMISSIONS_SUMMARY.deadline);

  const renderRow = useCallback(
    ({ item }: { item: AdmissionsPipelineEntry }) => {
      const stageColor = getStageColor(item.stage);
      const aidColors = AID_STATUS_COLORS[item.financialAidStatus] ?? AID_STATUS_COLORS.not_applied;
      const aidLabel = AID_STATUS_LABELS[item.financialAidStatus] ?? item.financialAidStatus;

      return (
        <Pressable
          style={[styles.row, { borderBottomColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openPersonCard({
              name: item.name,
              role: item.programOfInterest,
              status: item.stage,
            });
          }}
        >
          <View style={styles.rowInfo}>
            <View style={styles.rowTopLine}>
              <ThemedText style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <View style={[styles.stageBadge, { backgroundColor: stageColor + '22' }]}>
                <ThemedText style={[styles.stageText, { color: stageColor }]}>{item.stage}</ThemedText>
              </View>
            </View>
            <ThemedText style={[styles.program, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.programOfInterest} · {item.previousInstitution}
            </ThemedText>
            <View style={styles.rowBottomLine}>
              <ThemedText style={[styles.gpa, { color: colors.textSecondary }]}>
                GPA {item.gpa.toFixed(2)}
              </ThemedText>
              <ThemedText style={[styles.date, { color: colors.textSecondary }]}>
                {item.applicationDate}
              </ThemedText>
              <View style={[styles.aidBadge, { backgroundColor: aidColors.bg }]}>
                <ThemedText style={[styles.aidText, { color: aidColors.text }]}>{aidLabel}</ThemedText>
              </View>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors],
  );

  return (
    <View style={styles.container}>
      {/* Summary Card */}
      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.summaryHeader}>
          <ThemedText style={[styles.summaryTitle, { color: accent }]}>
            Fall 2026 Target: {ADMISSIONS_SUMMARY.fallTarget} new students
          </ThemedText>
        </View>
        <View style={styles.summaryStats}>
          <View style={styles.summaryStatItem}>
            <ThemedText style={[styles.summaryStatValue, { color: colors.text }]}>
              {ADMISSIONS_SUMMARY.totalPipeline}
            </ThemedText>
            <ThemedText style={[styles.summaryStatLabel, { color: colors.textSecondary }]}>Pipeline</ThemedText>
          </View>
          <View style={styles.summaryStatItem}>
            <ThemedText style={[styles.summaryStatValue, { color: colors.text }]}>
              {ADMISSIONS_SUMMARY.acceptanceRate}%
            </ThemedText>
            <ThemedText style={[styles.summaryStatLabel, { color: colors.textSecondary }]}>Accept Rate</ThemedText>
          </View>
          <View style={styles.summaryStatItem}>
            <ThemedText style={[styles.summaryStatValue, { color: colors.text }]}>
              {ADMISSIONS_SUMMARY.yieldRate}%
            </ThemedText>
            <ThemedText style={[styles.summaryStatLabel, { color: colors.textSecondary }]}>Yield</ThemedText>
          </View>
          <View style={styles.summaryStatItem}>
            <ThemedText style={[styles.summaryStatValue, { color: colors.text }]}>
              {daysLeft}d
            </ThemedText>
            <ThemedText style={[styles.summaryStatLabel, { color: colors.textSecondary }]}>Deadline</ThemedText>
          </View>
        </View>
      </View>

      {/* Stage pills */}
      <View style={styles.stageRow}>
        <Pressable
          style={[
            styles.stagePill,
            { borderColor: colors.border },
            activeFilter === 'all' && { backgroundColor: accent, borderColor: accent },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveFilter('all');
          }}
        >
          <ThemedText style={[styles.stagePillText, { color: activeFilter === 'all' ? '#000' : colors.textSecondary }]}>
            All
          </ThemedText>
        </Pressable>
        {ADMISSIONS_STAGES.map((stage) => {
          const count = getStageCount(stage.key);
          const isActive = activeFilter === stage.key;
          return (
            <Pressable
              key={stage.key}
              style={[
                styles.stagePill,
                { borderColor: colors.border },
                isActive && { backgroundColor: accent, borderColor: accent },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveFilter(stage.key);
              }}
            >
              <ThemedText style={[styles.stagePillText, { color: isActive ? '#000' : stage.color }]}>
                {stage.label} ({count})
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Student rows */}
      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        renderItem={renderRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  summaryHeader: { marginBottom: 8 },
  summaryTitle: { fontSize: 14, fontWeight: '700' },
  summaryStats: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryStatItem: { alignItems: 'center' },
  summaryStatValue: { fontSize: 18, fontWeight: '800' },
  summaryStatLabel: { fontSize: 10, marginTop: 2 },
  stageRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 6, gap: 6, flexWrap: 'wrap' },
  stagePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
  },
  stagePillText: { fontSize: 11, fontWeight: '600' },
  listContent: { paddingBottom: 120, paddingHorizontal: 16 },
  row: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowInfo: { gap: 3 },
  rowTopLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 14, fontWeight: '600', flex: 1 },
  stageBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  stageText: { fontSize: 10, fontWeight: '700' },
  program: { fontSize: 11 },
  rowBottomLine: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  gpa: { fontSize: 11, fontWeight: '600' },
  date: { fontSize: 10 },
  aidBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  aidText: { fontSize: 9, fontWeight: '700' },
});
