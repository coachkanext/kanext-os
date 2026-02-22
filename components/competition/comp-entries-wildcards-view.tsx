/**
 * Competition Entries -- Wildcards View
 * CRM pipeline visualization for wildcard entry progression.
 * 5 stages: Applied -> Scrutineering -> Friday Heats -> Saturday Final -> Confirmed for GP
 */

import React, { useMemo, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import {
  WILDCARD_PIPELINE,
  WILDCARD_STAGE_COLORS,
  WILDCARD_STAGE_LABELS,
  type WildcardPipelineStage,
} from '@/data/mock-competition-home';
import { openDriverCard } from '@/utils/global-entity-sheets';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

const STAGES: WildcardPipelineStage[] = ['applied', 'scrutineering', 'heats', 'final', 'confirmed'];

type FilterKey = 'all' | WildcardPipelineStage;

const FILTER_PILLS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'applied', label: 'Applied' },
  { key: 'scrutineering', label: 'Scrutineering' },
  { key: 'heats', label: 'Heats' },
  { key: 'final', label: 'Final' },
  { key: 'confirmed', label: 'Confirmed' },
];

export function CompEntriesWildcardsView({ colors, accent }: Props) {
  const [filter, setFilter] = useState<FilterKey>('all');

  const stageCounts = useMemo(() => {
    const counts: Record<WildcardPipelineStage, number> = {
      applied: 0,
      scrutineering: 0,
      heats: 0,
      final: 0,
      confirmed: 0,
    };
    for (const entry of WILDCARD_PIPELINE) {
      counts[entry.stage]++;
    }
    return counts;
  }, []);

  const filteredEntries = useMemo(() => {
    if (filter === 'all') return WILDCARD_PIPELINE;
    return WILDCARD_PIPELINE.filter((e) => e.stage === filter);
  }, [filter]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Stage summary bar */}
      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.summaryTitle, { color: colors.text }]}>
          Wildcard Pipeline
        </ThemedText>
        <View style={styles.stageRow}>
          {STAGES.map((stage, idx) => {
            const stageColor = WILDCARD_STAGE_COLORS[stage];
            return (
              <View key={stage} style={styles.stageItem}>
                <View style={[styles.stageCountCircle, { backgroundColor: stageColor + '20' }]}>
                  <ThemedText style={[styles.stageCount, { color: stageColor }]}>
                    {stageCounts[stage]}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.stageLabel, { color: colors.textSecondary }]}>
                  {WILDCARD_STAGE_LABELS[stage]}
                </ThemedText>
                {idx < STAGES.length - 1 && (
                  <ThemedText style={[styles.stageArrow, { color: colors.textSecondary }]}>
                    ->
                  </ThemedText>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {FILTER_PILLS.map((pill) => {
          const active = filter === pill.key;
          return (
            <Pressable
              key={pill.key}
              style={[
                styles.filterPill,
                { borderColor: active ? accent : colors.border },
                active && { backgroundColor: accent + '18' },
              ]}
              onPress={() => setFilter(pill.key)}
            >
              <ThemedText
                style={[
                  styles.filterPillText,
                  { color: active ? accent : colors.textSecondary },
                ]}
              >
                {pill.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Pipeline list */}
      <ThemedText style={[styles.sectionHeader, { color: accent }]}>
        {filteredEntries.length} WILDCARD ENTR{filteredEntries.length === 1 ? 'Y' : 'IES'}
      </ThemedText>

      {filteredEntries.map((entry) => {
        const stageColor = WILDCARD_STAGE_COLORS[entry.stage];
        return (
          <Pressable
            key={entry.id}
            style={[styles.entryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => openDriverCard({ name: entry.name, number: '', team: entry.team })}
          >
            {/* Stage badge */}
            <View style={[styles.stageBadge, { backgroundColor: stageColor + '20' }]}>
              <ThemedText style={[styles.stageBadgeText, { color: stageColor }]}>
                {WILDCARD_STAGE_LABELS[entry.stage]}
              </ThemedText>
            </View>

            {/* Info */}
            <View style={styles.entryInfo}>
              <ThemedText style={[styles.entryName, { color: colors.text }]}>{entry.name}</ThemedText>
              <ThemedText style={[styles.entryTeam, { color: colors.textSecondary }]}>
                {entry.team} · {entry.nationality}
              </ThemedText>
              <ThemedText style={[styles.entryCar, { color: colors.textSecondary }]}>
                {entry.car}
              </ThemedText>
            </View>

            {/* Dates */}
            <View style={styles.dateCol}>
              <ThemedText style={[styles.dateText, { color: colors.textSecondary }]}>
                {entry.appliedDate}
              </ThemedText>
              <ThemedText style={[styles.updatedText, { color: colors.textSecondary }]}>
                Updated: {entry.lastUpdated}
              </ThemedText>
            </View>
          </Pressable>
        );
      })}

      {/* People's Car section */}
      <View style={[styles.peoplesCarCard, { backgroundColor: '#1D9BF015', borderColor: '#1D9BF040' }]}>
        <View style={styles.peoplesCarHeader}>
          <ThemedText style={[styles.peoplesCarTitle, { color: '#1D9BF0' }]}>
            People's Car · Fan Vote
          </ThemedText>
        </View>
        <ThemedText style={[styles.peoplesCarBody, { color: colors.textSecondary }]}>
          The People's Car slot is open for Rock Hill. Fan voting opens Aug 1.
        </ThemedText>
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  summaryTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  stageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stageItem: { alignItems: 'center', position: 'relative' },
  stageCountCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageCount: { fontSize: 14, fontWeight: '700' },
  stageLabel: { fontSize: 9, fontWeight: '600', marginTop: 4, textAlign: 'center', maxWidth: 64 },
  stageArrow: {
    position: 'absolute',
    right: -14,
    top: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  filterScroll: { marginBottom: 14 },
  filterRow: { gap: 8 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterPillText: { fontSize: 12, fontWeight: '600' },
  sectionHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  stageBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, minWidth: 80, alignItems: 'center' },
  stageBadgeText: { fontSize: 10, fontWeight: '700' },
  entryInfo: { flex: 1 },
  entryName: { fontSize: 14, fontWeight: '600' },
  entryTeam: { fontSize: 11, marginTop: 2 },
  entryCar: { fontSize: 10, marginTop: 2, fontStyle: 'italic' },
  dateCol: { alignItems: 'flex-end' },
  dateText: { fontSize: 11 },
  updatedText: { fontSize: 9, marginTop: 2 },
  peoplesCarCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 20,
  },
  peoplesCarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  peoplesCarTitle: { fontSize: 15, fontWeight: '700' },
  peoplesCarBody: { fontSize: 13, lineHeight: 18 },
});
