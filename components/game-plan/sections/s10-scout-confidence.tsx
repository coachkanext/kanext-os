/**
 * S10 — Scout Confidence
 * Big confidence %, why-not-higher bullets, trace notes, data tier
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ScoutConfidenceGate } from '../game-plan-types';

interface Props {
  data: ScoutConfidenceGate;
  onLayout?: (y: number) => void;
}

function getConfidenceColor(pct: number): string {
  if (pct >= 85) return Brand.success;
  if (pct >= 70) return Brand.precision;
  if (pct >= 55) return Brand.warning;
  return Brand.error;
}

export function S10ScoutConfidence({ data, onLayout }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const confColor = getConfidenceColor(data.pct);

  return (
    <View onLayout={(e) => onLayout?.(e.nativeEvent.layout.y)}>
      {/* Big Confidence Display */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.confCenter}>
          <ThemedText style={[styles.confPct, { color: confColor }]}>{data.pct}%</ThemedText>
          <ThemedText style={[styles.confLabel, { color: colors.textSecondary }]}>Scout Confidence</ThemedText>
          <View style={[styles.tierChip, { backgroundColor: confColor + '20' }]}>
            <ThemedText style={[styles.tierText, { color: confColor }]}>{data.dataTier}</ThemedText>
          </View>
        </View>

        {/* Confidence bar */}
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${data.pct}%`, backgroundColor: confColor }]} />
        </View>
      </View>

      {/* Why Not Higher */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardTitle, { color: colors.textSecondary }]}>WHY NOT HIGHER</ThemedText>
        {data.whyNotHigher.map((reason, i) => (
          <View key={i} style={styles.bulletRow}>
            <IconSymbol name="info.circle.fill" size={14} color={Brand.warning} />
            <ThemedText style={[styles.bulletText, { color: colors.text }]}>{reason}</ThemedText>
          </View>
        ))}
      </View>

      {/* Trace Notes */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardTitle, { color: colors.textSecondary }]}>TRACE NOTES</ThemedText>
        {data.traceNotes.map((note, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={[styles.dot, { backgroundColor: colors.textTertiary }]} />
            <ThemedText style={[styles.bulletText, { color: colors.textSecondary }]}>{note}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  confCenter: { alignItems: 'center', paddingVertical: Spacing.sm },
  confPct: { fontSize: 48, fontWeight: '800' },
  confLabel: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  tierChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full, marginTop: 6 },
  tierText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  barTrack: { height: 6, backgroundColor: '#222', borderRadius: 3, overflow: 'hidden', marginTop: Spacing.sm },
  barFill: { height: '100%', borderRadius: 3 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 4 },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 6 },
  bulletText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
