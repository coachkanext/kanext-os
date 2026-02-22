/**
 * Edu Finance V3 — 3-pill ViewBar (Budget | Revenue | Aid)
 * KaNeXT Sports · President perspective
 * HBCU · Founded 1879 · Nashville, TN · SACSCOC Accredited
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

type ViewId = 'budget' | 'revenue' | 'aid';

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'budget', label: 'Budget' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'aid', label: 'Aid' },
];

interface BudgetDivision {
  id: string;
  name: string;
  allocated: number;
  icon: 'graduationcap.fill' | 'person.3.fill' | 'sportscourt.fill' | 'building.2.fill' | 'gear' | 'heart.fill';
}

const BUDGET = {
  institutional: 28000000,
  spent: 22000000,
  spentPct: 79,
  endowment: 15000000,
};

const BUDGET_DIVISIONS: BudgetDivision[] = [
  { id: 'bd1', name: 'Academic Affairs', allocated: 12000000, icon: 'graduationcap.fill' },
  { id: 'bd2', name: 'Student Affairs', allocated: 4000000, icon: 'person.3.fill' },
  { id: 'bd3', name: 'Athletics', allocated: 2500000, icon: 'sportscourt.fill' },
  { id: 'bd4', name: 'Administration', allocated: 5000000, icon: 'building.2.fill' },
  { id: 'bd5', name: 'Facilities', allocated: 3000000, icon: 'gear' },
  { id: 'bd6', name: 'Financial Aid', allocated: 1500000, icon: 'heart.fill' },
];

interface RevenueSource {
  id: string;
  name: string;
  amount: number;
  pct: number;
  color: string;
}

const REVENUE_TOTAL = 32000000;

const REVENUE_SOURCES: RevenueSource[] = [
  { id: 'rs1', name: 'Tuition & Fees', amount: 18000000, pct: 56, color: '#14B8A6' },
  { id: 'rs2', name: 'Federal/State Funding', amount: 6000000, pct: 19, color: '#6AA9FF' },
  { id: 'rs3', name: 'Grants', amount: 3000000, pct: 9, color: '#22C55E' },
  { id: 'rs4', name: 'Donations', amount: 2500000, pct: 8, color: '#F59E0B' },
  { id: 'rs5', name: 'Auxiliary Services', amount: 1500000, pct: 5, color: '#A78BFA' },
  { id: 'rs6', name: 'Athletics', amount: 1000000, pct: 3, color: '#EF4444' },
];

const ANNUAL_TREND = [
  { year: 'FY22', revenue: 28500000 },
  { year: 'FY23', revenue: 29800000 },
  { year: 'FY24', revenue: 31200000 },
  { year: 'FY25', revenue: 32000000 },
];

interface AidCategory {
  id: string;
  name: string;
  amount: number;
  types: string;
}

const AID = {
  totalDistributed: 14000000,
  averagePackage: 11667,
  aidToTuitionRatio: 78,
};

const AID_CATEGORIES: AidCategory[] = [
  { id: 'ac1', name: 'Federal Aid', amount: 8000000, types: 'Pell Grants, Direct Loans, Work-Study' },
  { id: 'ac2', name: 'Institutional Aid', amount: 4000000, types: 'Merit Scholarships, Need-Based Grants' },
  { id: 'ac3', name: 'State Aid', amount: 1500000, types: 'Bright Futures, Ridgemont Student Assistance' },
  { id: 'ac4', name: 'Private Aid', amount: 500000, types: 'External Scholarships, Donor-Funded' },
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
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// VIEW: BUDGET
// =============================================================================

function BudgetView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Overview */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>INSTITUTIONAL BUDGET</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.statRow}>
          <View style={s.statItem}>
            <ThemedText style={[s.statNumber, { color: accentColor }]}>{formatCurrency(BUDGET.institutional)}</ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Budget</ThemedText>
          </View>
          <View style={s.statItem}>
            <ThemedText style={[s.statNumber, { color: colors.text }]}>{formatCurrency(BUDGET.spent)}</ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Spent ({BUDGET.spentPct}%)</ThemedText>
          </View>
        </View>
        {/* Progress bar */}
        <View style={s.progressContainer}>
          <View style={[s.progressTrack, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
            <View style={[s.progressFill, { width: `${BUDGET.spentPct}%`, backgroundColor: accentColor + '60' }]} />
          </View>
        </View>
      </View>

      {/* Endowment */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.detailRow}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Endowment</ThemedText>
          <ThemedText style={[s.detailValue, { color: accentColor }]}>{formatCurrency(BUDGET.endowment)}</ThemedText>
        </View>
      </View>

      {/* By Division */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>BY DIVISION</ThemedText>
      {BUDGET_DIVISIONS.map((div) => {
        const pct = Math.round((div.allocated / BUDGET.institutional) * 100);
        return (
          <View key={div.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.divisionRow}>
              <IconSymbol name={div.icon} size={16} color={accentColor} />
              <ThemedText style={[s.divisionName, { color: colors.text }]}>{div.name}</ThemedText>
              <ThemedText style={[s.divisionAmount, { color: colors.textSecondary }]}>
                {formatCurrency(div.allocated)}
              </ThemedText>
            </View>
            <View style={[s.progressContainer, { marginTop: 8 }]}>
              <View style={[s.progressTrack, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
                <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: accentColor + '40' }]} />
              </View>
              <ThemedText style={[s.pctLabel, { color: colors.textTertiary }]}>{pct}%</ThemedText>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: REVENUE
// =============================================================================

function RevenueView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Total */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>TOTAL REVENUE</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.bigNumber, { color: accentColor }]}>{formatCurrency(REVENUE_TOTAL)}</ThemedText>
        <ThemedText style={[s.bigSub, { color: colors.textSecondary }]}>Fiscal Year 2025</ThemedText>
      </View>

      {/* Sources */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>BY SOURCE</ThemedText>
      {REVENUE_SOURCES.map((src) => (
        <View key={src.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.revenueHeader}>
            <View style={[s.colorDot, { backgroundColor: src.color }]} />
            <ThemedText style={[s.revenueName, { color: colors.text }]}>{src.name}</ThemedText>
            <ThemedText style={[s.revenueAmount, { color: colors.textSecondary }]}>
              {formatCurrency(src.amount)}
            </ThemedText>
          </View>
          <View style={[s.progressContainer, { marginTop: 6 }]}>
            <View style={[s.progressTrack, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
              <View style={[s.progressFill, { width: `${src.pct}%`, backgroundColor: src.color + '60' }]} />
            </View>
            <ThemedText style={[s.pctLabel, { color: colors.textTertiary }]}>{src.pct}%</ThemedText>
          </View>
        </View>
      ))}

      {/* Annual Trend */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>ANNUAL TREND</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {ANNUAL_TREND.map((yr, idx) => (
          <View
            key={yr.year}
            style={[
              s.trendRow,
              { borderBottomColor: colors.border },
              idx === ANNUAL_TREND.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <ThemedText style={[s.trendYear, { color: colors.textSecondary }]}>{yr.year}</ThemedText>
            <View style={s.trendBarWrap}>
              <View
                style={[
                  s.trendBar,
                  {
                    backgroundColor: accentColor + '40',
                    width: `${(yr.revenue / REVENUE_TOTAL) * 100}%`,
                  },
                ]}
              />
            </View>
            <ThemedText style={[s.trendAmount, { color: colors.text }]}>{formatCurrency(yr.revenue)}</ThemedText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// VIEW: AID
// =============================================================================

function AidView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Overview */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>FINANCIAL AID OVERVIEW</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.statRow}>
          <View style={s.statItem}>
            <ThemedText style={[s.statNumber, { color: accentColor }]}>{formatCurrency(AID.totalDistributed)}</ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Distributed</ThemedText>
          </View>
          <View style={s.statItem}>
            <ThemedText style={[s.statNumber, { color: colors.text }]}>${AID.averagePackage.toLocaleString()}</ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Avg. Package</ThemedText>
          </View>
          <View style={s.statItem}>
            <ThemedText style={[s.statNumber, { color: colors.text }]}>{AID.aidToTuitionRatio}%</ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Aid/Tuition</ThemedText>
          </View>
        </View>
      </View>

      {/* Categories */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>AID CATEGORIES</ThemedText>
      {AID_CATEGORIES.map((cat) => {
        const pct = Math.round((cat.amount / AID.totalDistributed) * 100);
        return (
          <View key={cat.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.aidHeader}>
              <ThemedText style={[s.aidName, { color: colors.text }]}>{cat.name}</ThemedText>
              <ThemedText style={[s.aidAmount, { color: accentColor }]}>{formatCurrency(cat.amount)}</ThemedText>
            </View>
            <ThemedText style={[s.aidTypes, { color: colors.textSecondary }]}>{cat.types}</ThemedText>
            <View style={[s.progressContainer, { marginTop: 8 }]}>
              <View style={[s.progressTrack, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
                <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: accentColor + '40' }]} />
              </View>
              <ThemedText style={[s.pctLabel, { color: colors.textTertiary }]}>{pct}%</ThemedText>
            </View>
          </View>
        );
      })}

      {/* Summary */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>AID DISTRIBUTION SUMMARY</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.detailRow}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Students Receiving Aid</ThemedText>
          <ThemedText style={[s.detailValue, { color: colors.text }]}>92%</ThemedText>
        </View>
        <View style={s.detailRow}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Pell Grant Recipients</ThemedText>
          <ThemedText style={[s.detailValue, { color: colors.text }]}>68%</ThemedText>
        </View>
        <View style={[s.detailRow, { borderBottomWidth: 0 }]}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Average Loan Debt</ThemedText>
          <ThemedText style={[s.detailValue, { color: colors.text }]}>$24,500</ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function EduFinance({ colors, accentColor, role }: Props) {
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
      case 'aid':
        return <AidView colors={colors} accentColor={accentColor} />;
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
                { backgroundColor: isActive ? accentColor : 'rgba(255,255,255,0.08)' },
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

  // -- Stats --
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // -- Big number --
  bigNumber: {
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  bigSub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },

  // -- Progress --
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  pctLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    width: 32,
    textAlign: 'right',
  },

  // -- Detail rows --
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // -- Division --
  divisionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  divisionName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  divisionAmount: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // -- Revenue --
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  revenueName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  revenueAmount: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // -- Trend --
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  trendYear: {
    fontSize: 12,
    fontWeight: '600',
    width: 36,
  },
  trendBarWrap: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
  },
  trendBar: {
    height: '100%',
    borderRadius: 4,
  },
  trendAmount: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    width: 52,
    textAlign: 'right',
  },

  // -- Aid --
  aidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aidName: {
    fontSize: 15,
    fontWeight: '700',
  },
  aidAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  aidTypes: {
    fontSize: 12,
    marginTop: 4,
  },

  // -- Badge --
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
