/**
 * Business Organization Finance Tab -- V3
 * 3-pill ViewBar: Budget | Cap Table | Fundraise
 * Valuetainment founder view. All data inline.
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

// =============================================================================
// TYPES
// =============================================================================

type ViewMode = 'budget' | 'captable' | 'fundraise';

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// INLINE DATA
// =============================================================================

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: 'budget', label: 'Budget' },
  { id: 'captable', label: 'Cap Table' },
  { id: 'fundraise', label: 'Fundraise' },
];

// Budget
const BUDGET_TOTAL = 500_000;
const BURN_RATE = 42_000;
const RUNWAY_MONTHS = 11.9;
const REVENUE = 0;

const EXPENSES = [
  { id: 'ex1', label: 'Payroll', amount: 28_000, color: '#EF4444' },
  { id: 'ex2', label: 'Contractors', amount: 6_000, color: '#F59E0B' },
  { id: 'ex3', label: 'Legal', amount: 3_000, color: '#1D9BF0' },
  { id: 'ex4', label: 'Infrastructure', amount: 2_500, color: '#1D9BF0' },
  { id: 'ex5', label: 'Marketing', amount: 1_500, color: '#1D9BF0' },
  { id: 'ex6', label: 'Travel', amount: 1_000, color: '#1D9BF0' },
];

// Cap Table
const CAP_TABLE = [
  { id: 'cap1', holder: 'Founder (Alex Morgan)', percent: 85, color: '#1D9BF0' },
  { id: 'cap2', holder: 'Angel Investors', percent: 8, color: '#1D9BF0' },
  { id: 'cap3', holder: 'ESOP Pool', percent: 5, color: '#22C55E' },
  { id: 'cap4', holder: 'Advisors', percent: 2, color: '#F59E0B' },
];

const CURRENT_VALUATION = 5_000_000;

// Fundraise
const CURRENT_ROUND = {
  stage: 'Pre-Seed',
  target: 1_500_000,
  raised: 750_000,
  percentRaised: 50,
};

const INVESTOR_PIPELINE = [
  { id: 'ip1', name: 'Velocity Ventures', stage: 'Closed', amount: '$350K', color: '#22C55E' },
  { id: 'ip2', name: 'Horizon Capital', stage: 'Term Sheet', amount: '$200K', color: '#1D9BF0' },
  { id: 'ip3', name: 'Meridian Partners', stage: 'Meeting', amount: '$150K', color: '#F59E0B' },
  { id: 'ip4', name: 'Atlas Fund', stage: 'Intro', amount: '$100K', color: '#A1A1AA' },
];

const PREVIOUS_SAFES = [
  { id: 'safe1', investor: 'Dr. Patricia Moore', amount: '$250K', cap: '$4M', date: 'Jun 2024' },
  { id: 'safe2', investor: 'Velocity Ventures', amount: '$100K', cap: '$4M', date: 'Aug 2024' },
];

const STAGE_ORDER = ['Intro', 'Meeting', 'Term Sheet', 'Closed'];

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function BizFinance({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewMode>('budget');

  const handleViewPress = useCallback((id: ViewMode) => {
    Haptics.selectionAsync();
    setActiveView(id);
  }, []);

  // ---------------------------------------------------------------------------
  // BUDGET
  // ---------------------------------------------------------------------------
  const renderBudget = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* KPIs */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.kpiRow}>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: colors.text }]}>{formatCurrency(BUDGET_TOTAL)}</ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Total Budget</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: '#EF4444' }]}>{formatCurrency(BURN_RATE)}/mo</ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Burn Rate</ThemedText>
          </View>
        </View>
        <View style={s.kpiRow}>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: '#F59E0B' }]}>{RUNWAY_MONTHS} mo</ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Runway</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: colors.textTertiary }]}>{formatCurrency(REVENUE)}</ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Revenue (pre-revenue)</ThemedText>
          </View>
        </View>
      </View>

      {/* Expense Breakdown */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>MONTHLY EXPENSES</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Visual bar */}
        <View style={s.expenseBarContainer}>
          {EXPENSES.map((exp) => {
            const pct = (exp.amount / BURN_RATE) * 100;
            return (
              <View key={exp.id} style={[s.expenseBarSegment, { width: `${pct}%`, backgroundColor: exp.color }]} />
            );
          })}
        </View>

        {/* Legend */}
        {EXPENSES.map((exp, idx) => {
          const pct = Math.round((exp.amount / BURN_RATE) * 100);
          return (
            <View
              key={exp.id}
              style={[
                s.expenseRow,
                idx < EXPENSES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.expenseDot, { backgroundColor: exp.color }]} />
              <ThemedText style={[s.expenseLabel, { color: colors.text }]}>{exp.label}</ThemedText>
              <ThemedText style={[s.expensePct, { color: colors.textSecondary }]}>{pct}%</ThemedText>
              <ThemedText style={[s.expenseAmount, { color: colors.text }]}>{formatCurrency(exp.amount)}</ThemedText>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );

  // ---------------------------------------------------------------------------
  // CAP TABLE
  // ---------------------------------------------------------------------------
  const renderCapTable = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Valuation */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.valuationLabel, { color: colors.textSecondary }]}>Current Valuation (Last Round)</ThemedText>
        <ThemedText style={[s.valuationValue, { color: colors.text }]}>{formatCurrency(CURRENT_VALUATION)}</ThemedText>
      </View>

      {/* Ownership */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>OWNERSHIP BREAKDOWN</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Stacked bar */}
        <View style={s.ownershipBarContainer}>
          {CAP_TABLE.map((entry) => (
            <View key={entry.id} style={[s.ownershipBarSegment, { width: `${entry.percent}%`, backgroundColor: entry.color }]} />
          ))}
        </View>

        {/* Details */}
        {CAP_TABLE.map((entry, idx) => (
          <View
            key={entry.id}
            style={[
              s.capRow,
              idx < CAP_TABLE.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={[s.capDot, { backgroundColor: entry.color }]} />
            <ThemedText style={[s.capHolder, { color: colors.text }]} numberOfLines={1}>{entry.holder}</ThemedText>
            <ThemedText style={[s.capPercent, { color: entry.color }]}>{entry.percent}%</ThemedText>
          </View>
        ))}
      </View>

      {/* Implied values */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: Spacing.md }]}>IMPLIED VALUES</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {CAP_TABLE.map((entry, idx) => {
          const impliedValue = (entry.percent / 100) * CURRENT_VALUATION;
          return (
            <View
              key={entry.id}
              style={[
                s.impliedRow,
                idx < CAP_TABLE.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <ThemedText style={[s.impliedHolder, { color: colors.textSecondary }]} numberOfLines={1}>{entry.holder}</ThemedText>
              <ThemedText style={[s.impliedValue, { color: colors.text }]}>{formatCurrency(impliedValue)}</ThemedText>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );

  // ---------------------------------------------------------------------------
  // FUNDRAISE
  // ---------------------------------------------------------------------------
  const renderFundraise = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Current Round */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>CURRENT ROUND</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.roundHeader}>
          <View style={[s.roundStageBadge, { backgroundColor: accentColor + '20' }]}>
            <ThemedText style={[s.roundStageText, { color: accentColor }]}>{CURRENT_ROUND.stage}</ThemedText>
          </View>
          <ThemedText style={[s.roundPercent, { color: accentColor }]}>{CURRENT_ROUND.percentRaised}%</ThemedText>
        </View>

        {/* Progress bar */}
        <View style={[s.progressTrack, { backgroundColor: colors.backgroundTertiary }]}>
          <View style={[s.progressFill, { width: `${CURRENT_ROUND.percentRaised}%`, backgroundColor: accentColor }]} />
        </View>

        <View style={s.roundKpiRow}>
          <View style={s.roundKpiItem}>
            <ThemedText style={[s.roundKpiValue, { color: '#22C55E' }]}>{formatCurrency(CURRENT_ROUND.raised)}</ThemedText>
            <ThemedText style={[s.roundKpiLabel, { color: colors.textSecondary }]}>Raised</ThemedText>
          </View>
          <View style={s.roundKpiItem}>
            <ThemedText style={[s.roundKpiValue, { color: colors.text }]}>{formatCurrency(CURRENT_ROUND.target)}</ThemedText>
            <ThemedText style={[s.roundKpiLabel, { color: colors.textSecondary }]}>Target</ThemedText>
          </View>
          <View style={s.roundKpiItem}>
            <ThemedText style={[s.roundKpiValue, { color: '#F59E0B' }]}>{formatCurrency(CURRENT_ROUND.target - CURRENT_ROUND.raised)}</ThemedText>
            <ThemedText style={[s.roundKpiLabel, { color: colors.textSecondary }]}>Remaining</ThemedText>
          </View>
        </View>
      </View>

      {/* Investor Pipeline */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: Spacing.md }]}>INVESTOR PIPELINE</ThemedText>
      {INVESTOR_PIPELINE.map((investor) => (
        <View key={investor.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}>
          <View style={s.investorRow}>
            <View style={s.investorInfo}>
              <ThemedText style={[s.investorName, { color: colors.text }]}>{investor.name}</ThemedText>
              <ThemedText style={[s.investorAmount, { color: colors.textSecondary }]}>{investor.amount}</ThemedText>
            </View>
            <View style={[s.statusBadge, { backgroundColor: investor.color + '20' }]}>
              <ThemedText style={[s.statusBadgeText, { color: investor.color }]}>{investor.stage.toUpperCase()}</ThemedText>
            </View>
          </View>
          {/* Stage indicator dots */}
          <View style={s.stageDots}>
            {STAGE_ORDER.map((stage) => {
              const idx = STAGE_ORDER.indexOf(stage);
              const currentIdx = STAGE_ORDER.indexOf(investor.stage);
              const isReached = idx <= currentIdx;
              return (
                <View key={stage} style={s.stageStep}>
                  <View style={[s.stageDot, { backgroundColor: isReached ? investor.color : colors.backgroundTertiary }]} />
                  <ThemedText style={[s.stageLabel, { color: isReached ? investor.color : colors.textTertiary }]}>{stage}</ThemedText>
                </View>
              );
            })}
          </View>
        </View>
      ))}

      {/* Previous SAFEs */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: Spacing.md }]}>PREVIOUS SAFES</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {PREVIOUS_SAFES.map((safe, idx) => (
          <View
            key={safe.id}
            style={[
              s.safeRow,
              idx < PREVIOUS_SAFES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={s.safeInfo}>
              <ThemedText style={[s.safeName, { color: colors.text }]}>{safe.investor}</ThemedText>
              <ThemedText style={[s.safeMeta, { color: colors.textSecondary }]}>Cap: {safe.cap} · {safe.date}</ThemedText>
            </View>
            <ThemedText style={[s.safeAmount, { color: '#22C55E' }]}>{safe.amount}</ThemedText>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
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
                s.viewPill,
                { backgroundColor: isActive ? accentColor : '#2F3336' },
              ]}
              onPress={() => handleViewPress(v.id)}
            >
              <ThemedText style={[s.viewPillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {v.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      {activeView === 'budget' && renderBudget()}
      {activeView === 'captable' && renderCapTable()}
      {activeView === 'fundraise' && renderFundraise()}
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

  // ViewBar
  viewBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  viewPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  viewPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Scroll
  scroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // Section Header
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  // Card
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: Spacing.sm,
  },

  // Status badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // KPIs
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },
  kpiItem: {
    alignItems: 'center',
    flex: 1,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },

  // Expense bar
  expenseBarContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  expenseBarSegment: {
    height: '100%',
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: Spacing.sm,
  },
  expenseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  expenseLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  expensePct: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    width: 35,
    textAlign: 'right',
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    width: 55,
    textAlign: 'right',
  },

  // Cap table
  valuationLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  valuationValue: {
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  ownershipBarContainer: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  ownershipBarSegment: {
    height: '100%',
  },
  capRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  capDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  capHolder: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  capPercent: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  impliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  impliedHolder: {
    flex: 1,
    fontSize: 12,
  },
  impliedValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // Fundraise
  roundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  roundStageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  roundStageText: {
    fontSize: 13,
    fontWeight: '700',
  },
  roundPercent: {
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  roundKpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  roundKpiItem: {
    alignItems: 'center',
  },
  roundKpiValue: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  roundKpiLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // Investor Pipeline
  investorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  investorInfo: {
    flex: 1,
  },
  investorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  investorAmount: {
    fontSize: 12,
    marginTop: 2,
  },
  stageDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stageStep: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  stageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stageLabel: {
    fontSize: 9,
    fontWeight: '600',
  },

  // SAFEs
  safeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  safeInfo: {
    flex: 1,
  },
  safeName: {
    fontSize: 13,
    fontWeight: '600',
  },
  safeMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  safeAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
