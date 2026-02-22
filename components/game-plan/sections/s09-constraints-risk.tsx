/**
 * S09 — Constraints & Risk
 * Hard constraints (source badges), top 5 risks (severity), volatility drivers, prohibitions
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme'
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ConstraintsRiskData, ConstraintSource, Severity } from '../game-plan-types';

interface Props {
  data: ConstraintsRiskData;
  onLayout?: (y: number) => void;
}

const SOURCE_COLORS: Record<ConstraintSource, string> = {
  medical: Brand.error,
  foul: Brand.warning,
  matchup: Brand.precision,
  scheme: accent,
};

const SOURCE_LABELS: Record<ConstraintSource, string> = {
  medical: 'MED',
  foul: 'FOUL',
  matchup: 'MATCH',
  scheme: 'SCHEME',
};

function severityColor(s: Severity): string {
  if (s >= 4) return Brand.error;
  if (s >= 3) return Brand.warning;
  return Brand.precision;
}

export function S09ConstraintsRisk({ data, onLayout }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();

  return (
    <View onLayout={(e) => onLayout?.(e.nativeEvent.layout.y)}>
      {/* Hard Constraints */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardTitle, { color: colors.textSecondary }]}>HARD CONSTRAINTS</ThemedText>
        {data.hardConstraints.map((c, i) => (
          <View key={i} style={styles.constraintRow}>
            <View style={[styles.sourceBadge, { backgroundColor: SOURCE_COLORS[c.source] + '20' }]}>
              <ThemedText style={[styles.sourceText, { color: SOURCE_COLORS[c.source] }]}>
                {SOURCE_LABELS[c.source]}
              </ThemedText>
            </View>
            <ThemedText style={[styles.constraintText, { color: colors.text }]}>{c.text}</ThemedText>
          </View>
        ))}
      </View>

      {/* Risks */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardTitle, { color: colors.textSecondary }]}>TOP RISKS</ThemedText>
        {data.risks
          .sort((a, b) => b.severity - a.severity)
          .map((r, i) => (
            <View key={i} style={styles.riskRow}>
              <View style={[styles.sevBar, { backgroundColor: severityColor(r.severity) }]}>
                <ThemedText style={styles.sevText}>{r.severity}</ThemedText>
              </View>
              <ThemedText style={[styles.riskText, { color: colors.text }]}>{r.text}</ThemedText>
            </View>
          ))}
      </View>

      {/* Volatility Drivers */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardTitle, { color: colors.textSecondary }]}>VOLATILITY DRIVERS</ThemedText>
        {data.volatilityDrivers.map((d, i) => (
          <View key={i} style={styles.bulletRow}>
            <IconSymbol name="exclamationmark.triangle.fill" size={12} color={Brand.warning} />
            <ThemedText style={[styles.bulletText, { color: colors.text }]}>{d}</ThemedText>
          </View>
        ))}
      </View>

      {/* What Not To Do */}
      <View style={[styles.card, { backgroundColor: Brand.error + '08', borderColor: Brand.error + '25' }]}>
        <ThemedText style={[styles.cardTitle, { color: Brand.error }]}>WHAT NOT TO DO</ThemedText>
        {data.whatNotToDo.map((p, i) => (
          <View key={i} style={styles.bulletRow}>
            <IconSymbol name="xmark.circle.fill" size={14} color={Brand.error} />
            <ThemedText style={[styles.bulletText, { color: colors.text }]}>{p}</ThemedText>
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
  constraintRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 5 },
  sourceBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, marginTop: 1 },
  sourceText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  constraintText: { flex: 1, fontSize: 13, lineHeight: 18 },
  riskRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 5 },
  sevBar: { width: 22, height: 22, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  sevText: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  riskText: { flex: 1, fontSize: 13, lineHeight: 18 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 4 },
  bulletText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
