/**
 * Church Finance V3 — KaNeXT Church · Senior Pastor
 * ViewBar: Budget | Giving | Campaigns
 * Self-contained with inline mock data.
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

type ViewId = 'budget' | 'giving' | 'campaigns';

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// VIEWS
// =============================================================================

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'budget', label: 'Budget' },
  { id: 'giving', label: 'Giving' },
  { id: 'campaigns', label: 'Campaigns' },
];

// =============================================================================
// MOCK DATA
// =============================================================================

const BUDGET_SUMMARY = {
  annual: 320000,
  income: 280000,
  expenses: 245000,
};

interface BudgetAllocation {
  id: string;
  category: string;
  amount: number;
  icon: string;
}

const MINISTRY_ALLOCATIONS: BudgetAllocation[] = [
  { id: 'ba1', category: 'Worship', amount: 35000, icon: 'music.note' },
  { id: 'ba2', category: 'Youth', amount: 25000, icon: 'person.3.fill' },
  { id: 'ba3', category: 'Children', amount: 20000, icon: 'figure.and.child.holdinghands' },
  { id: 'ba4', category: 'Outreach', amount: 30000, icon: 'globe' },
  { id: 'ba5', category: 'Missions', amount: 15000, icon: 'airplane' },
];

const EXPENSE_CATEGORIES: BudgetAllocation[] = [
  { id: 'ec1', category: 'Staff Salaries', amount: 120000, icon: 'person.fill' },
  { id: 'ec2', category: 'Facilities', amount: 45000, icon: 'building.2.fill' },
  { id: 'ec3', category: 'Missions', amount: 30000, icon: 'airplane' },
  { id: 'ec4', category: 'Media', amount: 15000, icon: 'play.rectangle.fill' },
  { id: 'ec5', category: 'Admin', amount: 20000, icon: 'doc.fill' },
  { id: 'ec6', category: 'Outreach', amount: 15000, icon: 'globe' },
];

const GIVING_SUMMARY = {
  totalYTD: 210000,
  weeklyAverage: 4038,
  activeGivers: 185,
  yoyGrowth: 8,
  categories: [
    { label: 'Tithes', percent: 72, amount: 151200 },
    { label: 'Offerings', percent: 18, amount: 37800 },
    { label: 'Designated', percent: 10, amount: 21000 },
  ],
};

interface Campaign {
  id: string;
  name: string;
  target: number;
  raised: number;
  status: 'Active' | 'Completed';
  description: string;
  endDate: string;
}

const CAMPAIGNS: Campaign[] = [
  { id: 'c1', name: 'Building Fund', target: 500000, raised: 185000, status: 'Active', description: 'New sanctuary expansion and renovation project', endDate: 'Dec 2025' },
  { id: 'c2', name: 'Missions Trip — Kenya', target: 25000, raised: 18000, status: 'Active', description: 'Summer missions trip to Nairobi partnering with local churches', endDate: 'Jun 2025' },
  { id: 'c3', name: 'Christmas Outreach 2024', target: 10000, raised: 10000, status: 'Completed', description: 'Toys, meals, and clothing for 200 families', endDate: 'Dec 2024' },
];

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(amount: number): string {
  if (amount >= 1000) {
    return '$' + amount.toLocaleString('en-US');
  }
  return '$' + amount.toString();
}

function formatCurrencyShort(amount: number): string {
  if (amount >= 1000000) return '$' + (amount / 1000000).toFixed(1) + 'M';
  if (amount >= 1000) return '$' + (amount / 1000).toFixed(0) + 'K';
  return '$' + amount.toString();
}

// =============================================================================
// VIEW BAR
// =============================================================================

function ViewBar({
  views,
  activeId,
  onSelect,
  accentColor,
  colors,
}: {
  views: typeof VIEWS;
  activeId: ViewId;
  onSelect: (id: ViewId) => void;
  accentColor: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={s.viewBar}>
      {views.map((v) => {
        const isActive = v.id === activeId;
        return (
          <Pressable
            key={v.id}
            style={[
              s.viewPill,
              {
                backgroundColor: isActive ? accentColor : 'rgba(255,255,255,0.08)',
              },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(v.id);
            }}
          >
            <ThemedText
              style={[
                s.viewPillText,
                { color: isActive ? '#000' : colors.textSecondary },
              ]}
            >
              {v.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

// =============================================================================
// PROGRESS BAR
// =============================================================================

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <View style={s.progressTrack}>
      <View style={[s.progressFill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

// =============================================================================
// BUDGET VIEW
// =============================================================================

function BudgetView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const surplus = BUDGET_SUMMARY.income - BUDGET_SUMMARY.expenses;
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Overview Tiles */}
      <View style={s.tilesRow}>
        <View style={[s.tile, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.tileValue, { color: accentColor }]}>{formatCurrencyShort(BUDGET_SUMMARY.annual)}</ThemedText>
          <ThemedText style={[s.tileLabel, { color: colors.textSecondary }]}>Annual Budget</ThemedText>
        </View>
        <View style={[s.tile, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.tileValue, { color: '#22C55E' }]}>{formatCurrencyShort(BUDGET_SUMMARY.income)}</ThemedText>
          <ThemedText style={[s.tileLabel, { color: colors.textSecondary }]}>Income</ThemedText>
        </View>
        <View style={[s.tile, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.tileValue, { color: '#F59E0B' }]}>{formatCurrencyShort(BUDGET_SUMMARY.expenses)}</ThemedText>
          <ThemedText style={[s.tileLabel, { color: colors.textSecondary }]}>Expenses</ThemedText>
        </View>
      </View>

      {/* Surplus */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.surplusRow}>
          <ThemedText style={[s.surplusLabel, { color: colors.textSecondary }]}>Net Surplus</ThemedText>
          <ThemedText style={[s.surplusValue, { color: surplus >= 0 ? '#22C55E' : '#EF4444' }]}>
            {formatCurrency(surplus)}
          </ThemedText>
        </View>
      </View>

      {/* Ministry Allocations */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>MINISTRY ALLOCATIONS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {MINISTRY_ALLOCATIONS.map((alloc, idx) => {
          const pct = (alloc.amount / BUDGET_SUMMARY.annual) * 100;
          return (
            <View
              key={alloc.id}
              style={[
                s.allocRow,
                idx < MINISTRY_ALLOCATIONS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <IconSymbol name={alloc.icon as any} size={16} color={accentColor} />
              <View style={{ flex: 1 }}>
                <View style={s.allocNameRow}>
                  <ThemedText style={[s.allocName, { color: colors.text }]}>{alloc.category}</ThemedText>
                  <ThemedText style={[s.allocAmount, { color: colors.text }]}>{formatCurrency(alloc.amount)}</ThemedText>
                </View>
                <ProgressBar percent={pct} color={accentColor} />
              </View>
            </View>
          );
        })}
      </View>

      {/* Expense Categories */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>EXPENSE CATEGORIES</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {EXPENSE_CATEGORIES.map((exp, idx) => {
          const pct = (exp.amount / BUDGET_SUMMARY.expenses) * 100;
          return (
            <View
              key={exp.id}
              style={[
                s.allocRow,
                idx < EXPENSE_CATEGORIES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <IconSymbol name={exp.icon as any} size={16} color={colors.textTertiary} />
              <View style={{ flex: 1 }}>
                <View style={s.allocNameRow}>
                  <ThemedText style={[s.allocName, { color: colors.text }]}>{exp.category}</ThemedText>
                  <ThemedText style={[s.allocAmount, { color: colors.text }]}>{formatCurrency(exp.amount)}</ThemedText>
                </View>
                <ProgressBar percent={pct} color='#F59E0B' />
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// GIVING VIEW
// =============================================================================

function GivingView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* KPI Tiles */}
      <View style={s.tilesRow}>
        <View style={[s.tile, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.tileValue, { color: accentColor }]}>{formatCurrencyShort(GIVING_SUMMARY.totalYTD)}</ThemedText>
          <ThemedText style={[s.tileLabel, { color: colors.textSecondary }]}>YTD Total</ThemedText>
        </View>
        <View style={[s.tile, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.tileValue, { color: '#22C55E' }]}>{formatCurrency(GIVING_SUMMARY.weeklyAverage)}</ThemedText>
          <ThemedText style={[s.tileLabel, { color: colors.textSecondary }]}>Weekly Avg</ThemedText>
        </View>
        <View style={[s.tile, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.tileValue, { color: '#6AA9FF' }]}>{GIVING_SUMMARY.activeGivers}</ThemedText>
          <ThemedText style={[s.tileLabel, { color: colors.textSecondary }]}>Active Givers</ThemedText>
        </View>
      </View>

      {/* Growth */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.surplusRow}>
          <ThemedText style={[s.surplusLabel, { color: colors.textSecondary }]}>Year-over-Year Growth</ThemedText>
          <View style={s.growthRow}>
            <IconSymbol name="arrow.up" size={14} color="#22C55E" />
            <ThemedText style={[s.surplusValue, { color: '#22C55E' }]}>{GIVING_SUMMARY.yoyGrowth}%</ThemedText>
          </View>
        </View>
      </View>

      {/* Categories */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>GIVING BREAKDOWN</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {GIVING_SUMMARY.categories.map((cat, idx) => (
          <View
            key={cat.label}
            style={[
              s.givingCatRow,
              idx < GIVING_SUMMARY.categories.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <View style={s.givingCatHeader}>
                <ThemedText style={[s.givingCatName, { color: colors.text }]}>{cat.label}</ThemedText>
                <ThemedText style={[s.givingCatPct, { color: accentColor }]}>{cat.percent}%</ThemedText>
              </View>
              <ProgressBar percent={cat.percent} color={accentColor} />
              <ThemedText style={[s.givingCatAmount, { color: colors.textSecondary }]}>{formatCurrency(cat.amount)}</ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Trend Note */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.trendRow}>
          <IconSymbol name="chart.bar.fill" size={16} color={accentColor} />
          <ThemedText style={[s.trendText, { color: colors.textSecondary }]}>
            Giving is trending up 8% compared to the same period last year. Tithes account for the majority at 72%.
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// CAMPAIGNS VIEW
// =============================================================================

function CampaignsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const activeCampaigns = CAMPAIGNS.filter((c) => c.status === 'Active');
  const pastCampaigns = CAMPAIGNS.filter((c) => c.status === 'Completed');

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>ACTIVE CAMPAIGNS</ThemedText>
      {activeCampaigns.map((campaign) => {
        const pct = Math.round((campaign.raised / campaign.target) * 100);
        return (
          <View
            key={campaign.id}
            style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.campaignHeader}>
              <ThemedText style={[s.campaignName, { color: colors.text }]}>{campaign.name}</ThemedText>
              <View style={[s.statusBadge, { backgroundColor: '#22C55E20' }]}>
                <ThemedText style={[s.statusBadgeText, { color: '#22C55E' }]}>Active</ThemedText>
              </View>
            </View>
            <ThemedText style={[s.campaignDesc, { color: colors.textSecondary }]}>{campaign.description}</ThemedText>

            {/* Progress */}
            <View style={s.campaignProgress}>
              <View style={s.campaignAmounts}>
                <ThemedText style={[s.campaignRaised, { color: accentColor }]}>{formatCurrency(campaign.raised)}</ThemedText>
                <ThemedText style={[s.campaignTarget, { color: colors.textTertiary }]}>of {formatCurrency(campaign.target)}</ThemedText>
              </View>
              <ThemedText style={[s.campaignPct, { color: accentColor }]}>{pct}%</ThemedText>
            </View>
            <ProgressBar percent={pct} color={accentColor} />

            <View style={s.campaignMeta}>
              <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.campaignDate, { color: colors.textSecondary }]}>Ends {campaign.endDate}</ThemedText>
            </View>
          </View>
        );
      })}

      {pastCampaigns.length > 0 && (
        <>
          <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>COMPLETED</ThemedText>
          {pastCampaigns.map((campaign) => (
            <View
              key={campaign.id}
              style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={s.campaignHeader}>
                <ThemedText style={[s.campaignName, { color: colors.text }]}>{campaign.name}</ThemedText>
                <View style={[s.statusBadge, { backgroundColor: '#8F8F8F20' }]}>
                  <ThemedText style={[s.statusBadgeText, { color: '#8F8F8F' }]}>Completed</ThemedText>
                </View>
              </View>
              <ThemedText style={[s.campaignDesc, { color: colors.textSecondary }]}>{campaign.description}</ThemedText>
              <View style={s.campaignAmounts}>
                <ThemedText style={[s.campaignRaised, { color: '#22C55E' }]}>{formatCurrency(campaign.raised)}</ThemedText>
                <ThemedText style={[s.campaignTarget, { color: colors.textTertiary }]}>of {formatCurrency(campaign.target)} · 100%</ThemedText>
              </View>
              <ProgressBar percent={100} color="#22C55E" />
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function ChurchFinance({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewId>('budget');

  const handleViewChange = useCallback((id: ViewId) => {
    setActiveView(id);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'budget':
        return <BudgetView colors={colors} accentColor={accentColor} />;
      case 'giving':
        return <GivingView colors={colors} accentColor={accentColor} />;
      case 'campaigns':
        return <CampaignsView colors={colors} accentColor={accentColor} />;
      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      <ViewBar
        views={VIEWS}
        activeId={activeView}
        onSelect={handleViewChange}
        accentColor={accentColor}
        colors={colors}
      />
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

  // -- View Bar --
  viewBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
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
    marginTop: Spacing.lg,
    textTransform: 'uppercase',
  },

  // -- Card --
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: Spacing.sm,
  },

  // -- Status Badge --
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // -- Progress Bar --
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },

  // -- Tiles --
  tilesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  tileValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  tileLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },

  // -- Surplus / Growth --
  surplusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  surplusLabel: {
    fontSize: 13,
  },
  surplusValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  growthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // -- Allocation Row --
  allocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
  },
  allocNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  allocName: {
    fontSize: 13,
    fontWeight: '500',
  },
  allocAmount: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // -- Giving Category --
  givingCatRow: {
    paddingVertical: 10,
  },
  givingCatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  givingCatName: {
    fontSize: 14,
    fontWeight: '600',
  },
  givingCatPct: {
    fontSize: 14,
    fontWeight: '700',
  },
  givingCatAmount: {
    fontSize: 12,
    marginTop: 2,
  },

  // -- Trend --
  trendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  trendText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },

  // -- Campaign --
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: Spacing.sm,
  },
  campaignDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  campaignProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  campaignAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  campaignRaised: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  campaignTarget: {
    fontSize: 12,
  },
  campaignPct: {
    fontSize: 16,
    fontWeight: '700',
  },
  campaignMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  campaignDate: {
    fontSize: 12,
  },
});
