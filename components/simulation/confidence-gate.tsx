/**
 * ConfidenceGate — Confidence percentage display with gate factor table.
 * Used inline in sim results and comparison views.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ConfidenceGate as ConfidenceGateType } from '@/components/simulation/simulation-types';

const ACCENT = '#FFFFFF';

const IMPACT_CONFIG = {
  positive: { icon: 'arrow.up', color: Brand.success },
  neutral: { icon: 'minus', color: '#8F8F8F' },
  negative: { icon: 'arrow.down', color: Brand.error },
} as const;

interface ConfidenceGateProps {
  gate: ConfidenceGateType;
  compact?: boolean;
}

export function ConfidenceGate({ gate, compact }: ConfidenceGateProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const gateColor = gate.percentage >= 75 ? Brand.success : gate.percentage >= 50 ? ACCENT : Brand.error;

  if (compact) {
    return (
      <View style={styles.compactRow}>
        <View style={[styles.compactCircle, { borderColor: gateColor }]}>
          <ThemedText style={[styles.compactPct, { color: gateColor }]}>{gate.percentage}%</ThemedText>
        </View>
        <ThemedText style={[styles.compactLabel, { color: colors.textSecondary }]}>{gate.label}</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.circle, { borderColor: gateColor }]}>
          <ThemedText style={[styles.pctText, { color: gateColor }]}>{gate.percentage}%</ThemedText>
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText style={[styles.gateLabel, { color: colors.text }]}>Confidence: {gate.label}</ThemedText>
          <ThemedText style={[styles.gateSub, { color: colors.textTertiary }]}>{gate.factors.length} contributing factors</ThemedText>
        </View>
      </View>

      {/* Factor table */}
      {gate.factors.map((factor, i) => {
        const config = IMPACT_CONFIG[factor.impact];
        return (
          <View key={i} style={[styles.factorRow, i < gate.factors.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
            <IconSymbol name={config.icon as any} size={12} color={config.color} />
            <ThemedText style={[styles.factorName, { color: colors.text }]}>{factor.name}</ThemedText>
            <View style={[styles.weightBarBg, { backgroundColor: colors.backgroundTertiary }]}>
              <View style={[styles.weightBarFill, { width: `${factor.weight * 100}%`, backgroundColor: config.color }]} />
            </View>
            <ThemedText style={[styles.weightPct, { color: colors.textTertiary }]}>{Math.round(factor.weight * 100)}%</ThemedText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.md },

  circle: { width: 48, height: 48, borderRadius: 24, borderWidth: 2.5, justifyContent: 'center', alignItems: 'center' },
  pctText: { fontSize: 14, fontWeight: '800' },

  gateLabel: { fontSize: 15, fontWeight: '700' },
  gateSub: { fontSize: 12, marginTop: 2 },

  factorRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  factorName: { flex: 1, fontSize: 13, fontWeight: '500' },
  weightBarBg: { width: 50, height: 4, borderRadius: 2, overflow: 'hidden' },
  weightBarFill: { height: '100%', borderRadius: 2 },
  weightPct: { fontSize: 11, fontWeight: '600', width: 30, textAlign: 'right' },

  // Compact
  compactRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  compactCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  compactPct: { fontSize: 9, fontWeight: '800' },
  compactLabel: { fontSize: 11, fontWeight: '600' },
});
