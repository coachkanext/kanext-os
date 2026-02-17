/**
 * S03 — Opp Defense → Our O
 * DSIE card, offensive counters, trigger list
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { OppDefenseData } from '../game-plan-types';

interface Props {
  data: OppDefenseData;
  onLayout?: (y: number) => void;
}

export function S03OppDefense({ data, onLayout }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View onLayout={(e) => onLayout?.(e.nativeEvent.layout.y)}>
      {/* DSIE Card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardTitle, { color: colors.textSecondary }]}>DEFENSIVE IDENTITY</ThemedText>
        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <ThemedText style={[styles.gridLabel, { color: colors.textTertiary }]}>System</ThemedText>
            <ThemedText style={[styles.gridValue, { color: Brand.precision }]}>{data.dsie.system}</ThemedText>
          </View>
          <View style={styles.gridItem}>
            <ThemedText style={[styles.gridLabel, { color: colors.textTertiary }]}>Pressure</ThemedText>
            <ThemedText style={styles.gridValue}>{data.dsie.pressure}</ThemedText>
          </View>
        </View>
        <View style={[styles.gridRow, { marginTop: Spacing.sm }]}>
          <View style={styles.gridItem}>
            <ThemedText style={[styles.gridLabel, { color: colors.textTertiary }]}>PNR Coverage</ThemedText>
            <ThemedText style={styles.gridValue}>{data.dsie.pnrCoverage}</ThemedText>
          </View>
          <View style={styles.gridItem}>
            <ThemedText style={[styles.gridLabel, { color: colors.textTertiary }]}>Closeout</ThemedText>
            <ThemedText style={styles.gridValue}>{data.dsie.closeout}</ThemedText>
          </View>
        </View>
      </View>

      {/* Offensive Counters */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardTitle, { color: colors.textSecondary }]}>OUR OFFENSIVE COUNTERS</ThemedText>
        {data.offensiveCounters.map((c, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={styles.numberBadge}>
              <ThemedText style={styles.numberText}>{i + 1}</ThemedText>
            </View>
            <ThemedText style={[styles.bulletText, { color: colors.text }]}>{c}</ThemedText>
          </View>
        ))}
      </View>

      {/* Triggers */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardTitle, { color: colors.textSecondary }]}>OFFENSIVE TRIGGERS</ThemedText>
        {data.triggers.map((t, i) => (
          <View key={i} style={styles.triggerRow}>
            <View style={[styles.triggerDot, { backgroundColor: Brand.warning }]} />
            <ThemedText style={[styles.bulletText, { color: colors.text }]}>{t}</ThemedText>
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
  gridRow: { flexDirection: 'row', gap: Spacing.lg },
  gridItem: { flex: 1 },
  gridLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  gridValue: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 5, gap: 10 },
  numberBadge: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Brand.precision + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  numberText: { fontSize: 11, fontWeight: '800', color: Brand.precision },
  bulletText: { flex: 1, fontSize: 14, lineHeight: 20 },
  triggerRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 4 },
  triggerDot: { width: 5, height: 5, borderRadius: 3, marginTop: 6, marginRight: 10 },
});
