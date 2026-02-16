/**
 * Block 1 — Context Snapshot Row
 * Row of 3 equal-width KPI cards: large value, label, sublabel.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { DashboardKPI } from '@/types/dashboard';

export function ContextSnapshotRow({ items }: { items: [DashboardKPI, DashboardKPI, DashboardKPI] }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.row}>
      {items.map((kpi) => (
        <View key={kpi.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.value, { color: kpi.badgeColor ?? colors.text }]}>
            {kpi.value}
          </ThemedText>
          <ThemedText style={[styles.label, { color: colors.textTertiary }]}>
            {kpi.label}
          </ThemedText>
          {kpi.sublabel != null && (
            <ThemedText style={[styles.sublabel, { color: colors.textSecondary }]}>
              {kpi.sublabel}
            </ThemedText>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  card: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  sublabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
});
