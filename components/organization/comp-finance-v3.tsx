/**
 * Competition Finance V3 — 3-pill ViewBar (Budget | Revenue | Prize)
 * Valuetainment Media League · Commissioner perspective
 * $45M operating budget, $52M revenue, $20M prize pool.
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

// =============================================================================
// TYPES & MOCK DATA
// =============================================================================

type ViewId = 'budget' | 'revenue' | 'prize';

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'budget', label: 'Budget' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'prize', label: 'Prize' },
];

const BUDGET_TOTAL = 45_000_000;
const BUDGET_SPENT = 28_000_000;

const BUDGET_LINES: { id: string; category: string; amount: number; icon: string }[] = [
  { id: 'bl1', category: 'Venues', amount: 12_000_000, icon: 'building.2.fill' },
  { id: 'bl2', category: 'Logistics', amount: 8_000_000, icon: 'airplane' },
  { id: 'bl3', category: 'Officials', amount: 3_000_000, icon: 'person.fill' },
  { id: 'bl4', category: 'Broadcast', amount: 6_000_000, icon: 'video.fill' },
  { id: 'bl5', category: 'Marketing', amount: 4_000_000, icon: 'star.fill' },
  { id: 'bl6', category: 'Safety', amount: 2_000_000, icon: 'shield.fill' },
  { id: 'bl7', category: 'Insurance', amount: 3_000_000, icon: 'lock.fill' },
  { id: 'bl8', category: 'Admin', amount: 2_000_000, icon: 'briefcase.fill' },
];

const REVENUE_TOTAL = 52_000_000;

const REVENUE_STREAMS: { id: string; source: string; amount: number; pct: number }[] = [
  { id: 'rs1', source: 'Entry Fees', amount: 18_000_000, pct: 34.6 },
  { id: 'rs2', source: 'Wildcard Fees', amount: 2_000_000, pct: 3.8 },
  { id: 'rs3', source: 'Broadcast Rights', amount: 15_000_000, pct: 28.8 },
  { id: 'rs4', source: 'Sponsorships', amount: 10_000_000, pct: 19.2 },
  { id: 'rs5', source: 'Tickets', amount: 4_000_000, pct: 7.7 },
  { id: 'rs6', source: 'Merchandise', amount: 2_000_000, pct: 3.8 },
  { id: 'rs7', source: 'Licensing', amount: 1_000_000, pct: 1.9 },
];

const PRIZE_TOTAL = 20_000_000;
const PRIZE_PAID = 6_150_000;

const PER_RACE_PRIZES: { position: string; amount: string }[] = [
  { position: 'Winner (P1)', amount: '$500K' },
  { position: 'P2', amount: '$300K' },
  { position: 'P3', amount: '$200K' },
  { position: 'P4', amount: '$150K' },
  { position: 'P5', amount: '$125K' },
  { position: 'P6', amount: '$100K' },
  { position: 'P7', amount: '$80K' },
  { position: 'P8', amount: '$60K' },
  { position: 'P9', amount: '$50K' },
  { position: 'P10', amount: '$40K' },
];

const CHAMPIONSHIP_PRIZES: { title: string; amount: string }[] = [
  { title: 'Driver Champion', amount: '$2M' },
  { title: 'Constructor Champion', amount: '$3M' },
  { title: 'Crew Champion', amount: '$500K' },
  { title: 'Wildcard Cup', amount: '$1M' },
];

const BONUS_POOLS: { title: string; amount: string }[] = [
  { title: 'Fastest Lap', amount: '$50K per race' },
  { title: 'Pole Position', amount: '$25K per race' },
  { title: "People's Car Award", amount: '$100K per race' },
];

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function ProgressBar({ pct, color, bgColor }: { pct: number; color: string; bgColor: string }) {
  return (
    <View style={[s.progressTrack, { backgroundColor: bgColor }]}>
      <View style={[s.progressFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

// =============================================================================
// VIEW: BUDGET
// =============================================================================

function BudgetView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const spentPct = Math.round((BUDGET_SPENT / BUDGET_TOTAL) * 100);
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Summary Card */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>TOTAL BUDGET</ThemedText>
        <ThemedText style={[s.summaryAmount, { color: colors.text }]}>{formatCurrency(BUDGET_TOTAL)}</ThemedText>
        <View style={s.summaryRow}>
          <ThemedText style={[s.summarySpent, { color: accentColor }]}>
            {formatCurrency(BUDGET_SPENT)} spent ({spentPct}%)
          </ThemedText>
          <ThemedText style={[s.summaryRemaining, { color: colors.textSecondary }]}>
            {formatCurrency(BUDGET_TOTAL - BUDGET_SPENT)} remaining
          </ThemedText>
        </View>
        <ProgressBar pct={spentPct} color={accentColor} bgColor={colors.border} />
        <ThemedText style={[s.perRaceAvg, { color: colors.textSecondary }]}>
          Per-race average: $5.6M
        </ThemedText>
      </View>

      {/* Expense Breakdown */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>EXPENSE BREAKDOWN</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {BUDGET_LINES.map((line, idx) => {
          const pct = Math.round((line.amount / BUDGET_TOTAL) * 100);
          return (
            <View
              key={line.id}
              style={[
                s.expenseRow,
                idx < BUDGET_LINES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <IconSymbol name={line.icon as any} size={14} color={colors.textSecondary} />
              <ThemedText style={[s.expenseCategory, { color: colors.text }]}>{line.category}</ThemedText>
              <ThemedText style={[s.expenseAmount, { color: colors.text }]}>{formatCurrency(line.amount)}</ThemedText>
              <ThemedText style={[s.expensePct, { color: colors.textSecondary }]}>{pct}%</ThemedText>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// VIEW: REVENUE
// =============================================================================

function RevenueView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Total Revenue */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>TOTAL REVENUE</ThemedText>
        <ThemedText style={[s.summaryAmount, { color: '#22C55E' }]}>{formatCurrency(REVENUE_TOTAL)}</ThemedText>
        <ThemedText style={[s.summarySubtext, { color: colors.textSecondary }]}>
          Net operating margin: {formatCurrency(REVENUE_TOTAL - BUDGET_TOTAL)} ({Math.round(((REVENUE_TOTAL - BUDGET_TOTAL) / REVENUE_TOTAL) * 100)}%)
        </ThemedText>
      </View>

      {/* Revenue Streams */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>REVENUE STREAMS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {REVENUE_STREAMS.map((stream, idx) => (
          <View
            key={stream.id}
            style={[
              s.revenueRow,
              idx < REVENUE_STREAMS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={s.revenueInfo}>
              <ThemedText style={[s.revenueSource, { color: colors.text }]}>{stream.source}</ThemedText>
              <ProgressBar pct={stream.pct} color={accentColor} bgColor={colors.border} />
            </View>
            <View style={s.revenueAmounts}>
              <ThemedText style={[s.revenueAmount, { color: colors.text }]}>{formatCurrency(stream.amount)}</ThemedText>
              <ThemedText style={[s.revenuePct, { color: colors.textSecondary }]}>{stream.pct}%</ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Trend Concept */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: 8 }]}>TREND</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.trendPlaceholder}>
          <IconSymbol name="chart.bar.fill" size={32} color={colors.textTertiary} />
          <ThemedText style={[s.trendText, { color: colors.textSecondary }]}>
            Revenue trend charts — per-race revenue vs. budget actuals
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// VIEW: PRIZE
// =============================================================================

function PrizeView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const paidPct = Math.round((PRIZE_PAID / PRIZE_TOTAL) * 100);
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Prize Pool Summary */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>TOTAL PRIZE POOL</ThemedText>
        <ThemedText style={[s.summaryAmount, { color: '#1D9BF0' }]}>{formatCurrency(PRIZE_TOTAL)}</ThemedText>
        <View style={s.summaryRow}>
          <ThemedText style={[s.summarySpent, { color: accentColor }]}>
            {formatCurrency(PRIZE_PAID)} paid ({paidPct}%)
          </ThemedText>
          <ThemedText style={[s.summaryRemaining, { color: colors.textSecondary }]}>
            {formatCurrency(PRIZE_TOTAL - PRIZE_PAID)} remaining
          </ThemedText>
        </View>
        <ProgressBar pct={paidPct} color="#1D9BF0" bgColor={colors.border} />
      </View>

      {/* Per Race Prizes */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>PER RACE</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {PER_RACE_PRIZES.map((prize, idx) => (
          <View
            key={prize.position}
            style={[
              s.prizeRow,
              idx < PER_RACE_PRIZES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <ThemedText style={[s.prizePosition, { color: idx < 3 ? colors.text : colors.textSecondary }]}>
              {prize.position}
            </ThemedText>
            <ThemedText style={[s.prizeAmount, { color: idx === 0 ? '#1D9BF0' : idx < 3 ? accentColor : colors.textSecondary }]}>
              {prize.amount}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Championship Prizes */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>CHAMPIONSHIP PRIZES</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {CHAMPIONSHIP_PRIZES.map((prize, idx) => (
          <View
            key={prize.title}
            style={[
              s.prizeRow,
              idx < CHAMPIONSHIP_PRIZES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={s.prizeRowLeft}>
              <IconSymbol name="crown.fill" size={14} color="#1D9BF0" />
              <ThemedText style={[s.prizeTitle, { color: colors.text }]}>{prize.title}</ThemedText>
            </View>
            <ThemedText style={[s.prizeAmount, { color: '#1D9BF0' }]}>{prize.amount}</ThemedText>
          </View>
        ))}
      </View>

      {/* Bonus Pools */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>BONUS POOLS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {BONUS_POOLS.map((bonus, idx) => (
          <View
            key={bonus.title}
            style={[
              s.prizeRow,
              idx < BONUS_POOLS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <ThemedText style={[s.bonusTitle, { color: colors.text }]}>{bonus.title}</ThemedText>
            <ThemedText style={[s.bonusAmount, { color: accentColor }]}>{bonus.amount}</ThemedText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function CompFinance({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewId>('budget');

  const handlePillPress = useCallback((id: ViewId) => {
    Haptics.selectionAsync();
    setActiveView(id);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'budget':
        return <BudgetView colors={colors} accentColor={accentColor} />;
      case 'revenue':
        return <RevenueView colors={colors} accentColor={accentColor} />;
      case 'prize':
        return <PrizeView colors={colors} accentColor={accentColor} />;
    }
  };

  return (
    <View style={s.container}>
      {/* ViewBar */}
      <View style={s.viewBar}>
        {VIEWS.map((v) => {
          const isActive = v.id === activeView;
          return (
            <Pressable
              key={v.id}
              style={[
                s.pill,
                { backgroundColor: isActive ? accentColor : '#2F3336' },
              ]}
              onPress={() => handlePillPress(v.id)}
            >
              <ThemedText
                style={[
                  s.pillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {v.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      {renderContent()}
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: {
    flex: 1,
  },

  // -- ViewBar --
  viewBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Scroll --
  scroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // -- Section Header --
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  // -- Card --
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },

  // -- Summary --
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  summarySpent: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryRemaining: {
    fontSize: 13,
  },
  summarySubtext: {
    fontSize: 13,
    marginTop: 8,
  },
  perRaceAvg: {
    fontSize: 12,
    marginTop: 10,
  },

  // -- Progress Bar --
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },

  // -- Expense Row --
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  expenseCategory: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  expenseAmount: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  expensePct: {
    fontSize: 11,
    width: 32,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },

  // -- Revenue Row --
  revenueRow: {
    paddingVertical: 10,
  },
  revenueInfo: {
    flex: 1,
    marginBottom: 6,
  },
  revenueSource: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  revenueAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  revenueAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  revenuePct: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },

  // -- Trend Placeholder --
  trendPlaceholder: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  trendText: {
    fontSize: 13,
    textAlign: 'center',
  },

  // -- Prize Row --
  prizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  prizePosition: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  prizeAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  prizeRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  prizeTitle: {
    fontSize: 14,
    fontWeight: '600',
  },

  // -- Bonus --
  bonusTitle: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  bonusAmount: {
    fontSize: 13,
    fontWeight: '600',
  },
});
