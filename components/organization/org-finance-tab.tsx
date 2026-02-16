/**
 * Organization Finance Tab — universal across all modes.
 * KPI grid (2×2), Payment Rails, Recent Transactions.
 */
import React, { useMemo } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { getOrgFinance } from '@/data/mock-org-finance';
import type { Mode } from '@/types';

interface Props {
  mode: Mode;
  colors: typeof Colors.light;
  accentColor: string;
}

function SectionLabel({ title, colors }: { title: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[s.sectionLabel, { color: colors.textSecondary }]}>{title}</ThemedText>
  );
}

export function OrgFinanceTab({ mode, colors, accentColor }: Props) {
  const data = useMemo(() => getOrgFinance(mode), [mode]);

  const formatAmount = (amount: number) => {
    const abs = Math.abs(amount);
    if (abs >= 1000) {
      return `$${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}K`;
    }
    return `$${abs.toLocaleString()}`;
  };

  return (
    <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* KPI Grid */}
      <View style={s.kpiGrid}>
        {data.kpis.map((kpi) => (
          <View key={kpi.id} style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.kpiValue, { color: accentColor }]}>{kpi.value}</ThemedText>
            {kpi.delta && (
              <ThemedText
                style={[
                  s.kpiDelta,
                  {
                    color:
                      kpi.deltaType === 'up' ? '#22C55E' :
                      kpi.deltaType === 'down' ? '#EF4444' :
                      colors.textSecondary,
                  },
                ]}
              >
                {kpi.delta}
              </ThemedText>
            )}
            <ThemedText style={[s.kpiLabel, { color: colors.textTertiary }]}>{kpi.label}</ThemedText>
          </View>
        ))}
      </View>

      {/* Payment Rails */}
      <SectionLabel title="Payment Rails" colors={colors} />
      <View style={s.railsRow}>
        {data.rails.map((rail) => (
          <Pressable
            key={rail.id}
            style={({ pressed }) => [
              s.railCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.8 },
            ]}
          >
            <View style={[s.railIcon, { backgroundColor: accentColor + '15' }]}>
              <IconSymbol name={rail.icon as any} size={20} color={accentColor} />
            </View>
            <ThemedText style={s.railName}>{rail.name}</ThemedText>
            <ThemedText style={[s.railSub, { color: colors.textSecondary }]} numberOfLines={1}>
              {rail.subtitle}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* Recent Transactions */}
      <SectionLabel title="Recent Transactions" colors={colors} />
      <View style={[s.ledgerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {data.ledger.slice(0, 8).map((entry, i) => (
          <React.Fragment key={entry.id}>
            <View style={s.ledgerRow}>
              <View style={s.ledgerInfo}>
                <ThemedText style={s.ledgerDesc} numberOfLines={1}>{entry.description}</ThemedText>
                <ThemedText style={[s.ledgerDate, { color: colors.textTertiary }]}>{entry.date}</ThemedText>
              </View>
              <ThemedText
                style={[
                  s.ledgerAmount,
                  { color: entry.type === 'revenue' ? '#22C55E' : '#EF4444' },
                ]}
              >
                {entry.type === 'expense' ? '-' : '+'}{formatAmount(entry.amount)}
              </ThemedText>
            </View>
            {i < Math.min(data.ledger.length, 8) - 1 && (
              <View style={[s.divider, { backgroundColor: colors.divider }]} />
            )}
          </React.Fragment>
        ))}
        <Pressable style={({ pressed }) => [s.viewAll, pressed && { opacity: 0.7 }]}>
          <ThemedText style={[s.viewAllText, { color: accentColor }]}>View All</ThemedText>
          <IconSymbol name="chevron.right" size={14} color={accentColor} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  // KPI Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  kpiDelta: {
    fontSize: 12,
    marginTop: 2,
  },
  kpiLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: Spacing.xs,
  },
  // Rails
  railsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  railCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  railIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  railName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  railSub: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  // Ledger
  ledgerCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  ledgerInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  ledgerDesc: {
    fontSize: 14,
    fontWeight: '500',
  },
  ledgerDate: {
    fontSize: 12,
    marginTop: 2,
  },
  ledgerAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
