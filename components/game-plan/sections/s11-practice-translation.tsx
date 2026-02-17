/**
 * S11 — Practice Translation
 * 3-6 drill cards: name/duration/tied-to-section/lead coach/success cue
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { DrillSegment } from '../game-plan-types';
import { SECTION_NAMES } from '../game-plan-types';

interface Props {
  drills: DrillSegment[];
  onLayout?: (y: number) => void;
}

export function S11PracticeTranslation({ drills, onLayout }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const totalMinutes = drills.reduce((s, d) => s + d.durationMin, 0);

  return (
    <View onLayout={(e) => onLayout?.(e.nativeEvent.layout.y)}>
      {/* Summary */}
      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.summaryText, { color: colors.textSecondary }]}>
          {drills.length} drills — {totalMinutes} min total
        </ThemedText>
      </View>

      {/* Drill Cards */}
      {drills.map((drill, i) => (
        <View key={i} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.headerRow}>
            <ThemedText style={[styles.drillName, { color: colors.text }]}>{drill.name}</ThemedText>
            <View style={[styles.durationBadge, { backgroundColor: Brand.precision + '20' }]}>
              <ThemedText style={[styles.durationText, { color: Brand.precision }]}>{drill.durationMin} min</ThemedText>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <IconSymbol name="link" size={12} color={colors.textTertiary} />
              <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
                S{drill.tiedToSection}: {SECTION_NAMES[drill.tiedToSection] ?? '—'}
              </ThemedText>
            </View>
            <View style={styles.metaItem}>
              <IconSymbol name="person.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>{drill.leadCoach}</ThemedText>
            </View>
          </View>

          <View style={styles.cueRow}>
            <IconSymbol name="checkmark.circle.fill" size={14} color={Brand.success} />
            <ThemedText style={[styles.cueText, { color: colors.text }]}>{drill.successCue}</ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  summaryText: { fontSize: 13, fontWeight: '600' },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  drillName: { fontSize: 15, fontWeight: '600', flex: 1 },
  durationBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  durationText: { fontSize: 12, fontWeight: '700' },
  metaRow: { flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12 },
  cueRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: Spacing.sm },
  cueText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
