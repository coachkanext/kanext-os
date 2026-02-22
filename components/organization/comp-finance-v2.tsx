/**
 * Competition Organization Finance Tab — 10-tab Finance Hub.
 * Dashboard, Revenue, Expenses, Prize Pool, Sponsorship, Ticketing, Budgets, Payouts, Reports, Settings.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, TextInput, Pressable, Switch, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import {
  COMP_FINANCE_TABS,
  COMP_FINANCE_SCOPE_CHIPS,
  REVENUE_STATUS_COLOR,
  EXPENSE_STATUS_COLOR,
  BUDGET_STATUS_COLOR,
  PAYOUT_STATUS_COLOR,
  PRIZE_STATUS_COLOR,
  SPONSORSHIP_STATUS_COLOR,
  PAYOUT_TYPE_COLOR,
  REVENUE_CATEGORY_COLOR,
  EXPENSE_CATEGORY_COLOR,
  getCompFinanceData,
  formatCurrency,
  formatCurrencyFull,
  getBudgetPercentage,
  getCapacityPercentage,
} from '@/data/mock-comp-org-finance';
import type {
  CompFinanceTabId,
  FinanceDashboardBlock,
  RevenueItem,
  ExpenseItem,
  PrizeAllocation,
  SponsorshipRevenue,
  TicketingRecord,
  Budget,
  PayoutRecord,
  FinanceReport,
  FinanceSettingToggle,
} from '@/data/mock-comp-org-finance';

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function revenueCategoryLabel(cat: RevenueItem['category']): string {
  switch (cat) {
    case 'ticketing': return 'TICKETING';
    case 'sponsorship': return 'SPONSORSHIP';
    case 'broadcast': return 'BROADCAST';
    case 'merchandise': return 'MERCHANDISE';
    case 'licensing': return 'LICENSING';
    case 'entry-fees': return 'ENTRY FEES';
  }
}

function expenseCategoryLabel(cat: ExpenseItem['category']): string {
  switch (cat) {
    case 'venue': return 'VENUE';
    case 'staff': return 'STAFF';
    case 'equipment': return 'EQUIPMENT';
    case 'travel': return 'TRAVEL';
    case 'marketing': return 'MARKETING';
    case 'insurance': return 'INSURANCE';
    case 'officials': return 'OFFICIALS';
    case 'prizes': return 'PRIZES';
  }
}

function payoutTypeLabel(type: PayoutRecord['type']): string {
  switch (type) {
    case 'prize': return 'PRIZE';
    case 'official': return 'OFFICIAL';
    case 'vendor': return 'VENDOR';
    case 'refund': return 'REFUND';
  }
}

function reportFormatColor(format: FinanceReport['format']): string {
  switch (format) {
    case 'PDF': return '#EF4444';
    case 'CSV': return '#22C55E';
    case 'XLSX': return '#1D9BF0';
  }
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({ icon, label, colors }: { icon: string; label: string; colors: typeof Colors.light }) {
  return (
    <View style={s.emptyContainer}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// STATUS BADGE
// =============================================================================

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// DASHBOARD TAB
// =============================================================================

function DashboardTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getCompFinanceData>;
}) {
  // Revenue vs Expense summary
  const totalRevenue = useMemo(
    () => data.revenue.reduce((sum, r) => sum + r.amount, 0),
    [data.revenue],
  );
  const totalExpenses = useMemo(
    () => data.expenses.reduce((sum, e) => sum + e.amount, 0),
    [data.expenses],
  );
  const netProfit = totalRevenue - totalExpenses;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* KPI Cards */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Overview</ThemedText>
      <View style={s.kpiGrid}>
        {data.dashboard.map((block: FinanceDashboardBlock) => (
          <View
            key={block.id}
            style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.kpiHeader}>
              <IconSymbol name={block.icon as any} size={18} color={block.color} />
              <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>
                {block.label}
              </ThemedText>
            </View>
            <ThemedText style={[s.kpiValue, { color: colors.text }]}>{block.value}</ThemedText>
            <ThemedText style={[s.kpiDelta, { color: colors.textTertiary }]}>{block.delta}</ThemedText>
          </View>
        ))}
      </View>

      {/* Revenue vs Expense Summary */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Revenue vs Expenses
      </ThemedText>
      <View style={[s.revExpCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.revExpRow}>
          <View style={s.revExpItem}>
            <View style={[s.revExpDot, { backgroundColor: '#22C55E' }]} />
            <View style={s.revExpInfo}>
              <ThemedText style={[s.revExpLabel, { color: colors.textSecondary }]}>Total Revenue</ThemedText>
              <ThemedText style={[s.revExpValue, { color: '#22C55E' }]}>
                {formatCurrency(totalRevenue)}
              </ThemedText>
            </View>
          </View>
          <View style={s.revExpItem}>
            <View style={[s.revExpDot, { backgroundColor: '#EF4444' }]} />
            <View style={s.revExpInfo}>
              <ThemedText style={[s.revExpLabel, { color: colors.textSecondary }]}>Total Expenses</ThemedText>
              <ThemedText style={[s.revExpValue, { color: '#EF4444' }]}>
                {formatCurrency(totalExpenses)}
              </ThemedText>
            </View>
          </View>
        </View>
        <View style={[s.revExpNetRow, { borderTopColor: colors.border }]}>
          <ThemedText style={[s.revExpNetLabel, { color: colors.textSecondary }]}>Net Profit</ThemedText>
          <ThemedText
            style={[s.revExpNetValue, { color: netProfit >= 0 ? '#22C55E' : '#EF4444' }]}
          >
            {netProfit >= 0 ? '+' : ''}{formatCurrency(netProfit)}
          </ThemedText>
        </View>
      </View>

      {/* Budget Overview */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Budget Overview
      </ThemedText>
      <View style={[s.budgetOverviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {data.budgets.slice(0, 6).map((budget, index) => {
          const pct = getBudgetPercentage(budget.spent, budget.allocated);
          const statusColor = BUDGET_STATUS_COLOR[budget.status];
          return (
            <View
              key={budget.id}
              style={[
                s.budgetOverviewRow,
                index < 5 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={s.budgetOverviewInfo}>
                <ThemedText style={[s.budgetOverviewName, { color: colors.text }]} numberOfLines={1}>
                  {budget.name}
                </ThemedText>
                <View style={s.budgetOverviewBarTrack}>
                  <View
                    style={[
                      s.budgetOverviewBarFill,
                      {
                        backgroundColor: statusColor,
                        width: `${Math.min(pct, 100)}%`,
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={s.budgetOverviewRight}>
                <ThemedText style={[s.budgetOverviewPct, { color: statusColor }]}>{pct}%</ThemedText>
              </View>
            </View>
          );
        })}
      </View>

      {/* Quick Actions */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Quick Actions
      </ThemedText>
      <View style={s.quickActionsGrid}>
        {[
          { id: 'qa-1', label: 'Add Revenue', icon: 'plus.circle.fill', color: '#22C55E' },
          { id: 'qa-2', label: 'Log Expense', icon: 'minus.circle.fill', color: '#EF4444' },
          { id: 'qa-3', label: 'New Budget', icon: 'chart.pie.fill', color: '#1D9BF0' },
          { id: 'qa-4', label: 'Process Payout', icon: 'creditcard.fill', color: '#1D9BF0' },
          { id: 'qa-5', label: 'Generate Report', icon: 'doc.text.fill', color: '#F59E0B' },
          { id: 'qa-6', label: 'Add Sponsor', icon: 'star.fill', color: '#1D9BF0' },
        ].map((action) => (
          <Pressable
            key={action.id}
            style={[s.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[s.quickActionIconCircle, { backgroundColor: action.color + '18' }]}>
              <IconSymbol name={action.icon as any} size={20} color={action.color} />
            </View>
            <ThemedText style={[s.quickActionLabel, { color: colors.text }]} numberOfLines={1}>
              {action.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* Finance Summary */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Finance Summary
      </ThemedText>
      <View style={[s.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.summaryRow}>
          <View style={s.summaryItem}>
            <ThemedText style={[s.summaryValue, { color: colors.text }]}>
              {data.revenue.length}
            </ThemedText>
            <ThemedText style={[s.summaryLabel, { color: colors.textTertiary }]}>
              Revenue Items
            </ThemedText>
          </View>
          <View style={s.summaryItem}>
            <ThemedText style={[s.summaryValue, { color: colors.text }]}>
              {data.expenses.length}
            </ThemedText>
            <ThemedText style={[s.summaryLabel, { color: colors.textTertiary }]}>
              Expense Items
            </ThemedText>
          </View>
          <View style={s.summaryItem}>
            <ThemedText style={[s.summaryValue, { color: colors.text }]}>
              {data.budgets.length}
            </ThemedText>
            <ThemedText style={[s.summaryLabel, { color: colors.textTertiary }]}>
              Budgets
            </ThemedText>
          </View>
          <View style={s.summaryItem}>
            <ThemedText style={[s.summaryValue, { color: colors.text }]}>
              {data.payouts.filter((p) => p.status === 'pending').length}
            </ThemedText>
            <ThemedText style={[s.summaryLabel, { color: colors.textTertiary }]}>
              Pending Payouts
            </ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// REVENUE TAB
// =============================================================================

function RevenueTab({
  colors,
  accentColor,
  data,
  onSelectRevenue,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: RevenueItem[];
  onSelectRevenue: (item: RevenueItem) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = REVENUE_STATUS_COLOR[item.status];
        const catColor = REVENUE_CATEGORY_COLOR[item.category];
        return (
          <Pressable
            style={[s.revenueCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectRevenue(item);
            }}
          >
            <View style={s.revenueCardTop}>
              <View style={[s.revenueStripe, { backgroundColor: catColor }]} />
              <View style={s.revenueCardMid}>
                <ThemedText style={[s.revenueSource, { color: colors.text }]} numberOfLines={2}>
                  {item.source}
                </ThemedText>
                <View style={s.revenueCardBadgeRow}>
                  <StatusBadge label={revenueCategoryLabel(item.category)} color={catColor} />
                  <StatusBadge label={item.status.toUpperCase()} color={stColor} />
                </View>
              </View>
            </View>

            <View style={[s.revenueCardDetails, { borderTopColor: colors.border }]}>
              <View style={s.revenueDetailItem}>
                <ThemedText style={[s.revenueAmount, { color: colors.text }]}>
                  {formatCurrencyFull(item.amount)}
                </ThemedText>
                <ThemedText style={[s.revenueDetailLabel, { color: colors.textTertiary }]}>
                  Amount
                </ThemedText>
              </View>
              <View style={s.revenueDetailItem}>
                <ThemedText style={[s.revenueDetailValue, { color: colors.textSecondary }]}>
                  {item.date}
                </ThemedText>
                <ThemedText style={[s.revenueDetailLabel, { color: colors.textTertiary }]}>
                  Date
                </ThemedText>
              </View>
              <View style={s.revenueDetailItem}>
                <ThemedText style={[s.revenueDetailValue, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.series}
                </ThemedText>
                <ThemedText style={[s.revenueDetailLabel, { color: colors.textTertiary }]}>
                  Series
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="arrow.up.circle.fill" label="No revenue items found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// EXPENSES TAB
// =============================================================================

function ExpensesTab({
  colors,
  accentColor,
  data,
  onSelectExpense,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ExpenseItem[];
  onSelectExpense: (item: ExpenseItem) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = EXPENSE_STATUS_COLOR[item.status];
        const catColor = EXPENSE_CATEGORY_COLOR[item.category];
        return (
          <Pressable
            style={[s.expenseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectExpense(item);
            }}
          >
            <View style={s.expenseCardTop}>
              <View style={[s.expenseStripe, { backgroundColor: catColor }]} />
              <View style={s.expenseCardMid}>
                <ThemedText style={[s.expenseDescription, { color: colors.text }]} numberOfLines={2}>
                  {item.description}
                </ThemedText>
                <View style={s.expenseCardBadgeRow}>
                  <StatusBadge label={expenseCategoryLabel(item.category)} color={catColor} />
                  <StatusBadge label={item.status.toUpperCase()} color={stColor} />
                </View>
              </View>
            </View>

            <View style={[s.expenseCardMeta, { borderTopColor: colors.border }]}>
              <View style={s.expenseMetaItem}>
                <IconSymbol name="building.2.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.expenseMetaText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.vendor}
                </ThemedText>
              </View>
              <View style={s.expenseMetaItem}>
                <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.expenseMetaText, { color: colors.textSecondary }]}>
                  {item.date}
                </ThemedText>
              </View>
            </View>

            <View style={s.expenseCardBottom}>
              <ThemedText style={[s.expenseSeries, { color: colors.textTertiary }]} numberOfLines={1}>
                {item.series}
              </ThemedText>
              <ThemedText style={[s.expenseAmount, { color: colors.text }]}>
                {formatCurrencyFull(item.amount)}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="arrow.down.circle.fill" label="No expense items found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// PRIZE POOL TAB
// =============================================================================

function PrizePoolTab({
  colors,
  accentColor,
  data,
  onSelectPrize,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: PrizeAllocation[];
  onSelectPrize: (item: PrizeAllocation) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = PRIZE_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.prizeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectPrize(item);
            }}
          >
            <View style={s.prizeCardTop}>
              <View style={[s.prizeIconCircle, { backgroundColor: stColor + '18' }]}>
                <IconSymbol name="trophy.fill" size={20} color={stColor} />
              </View>
              <View style={s.prizeCardMid}>
                <ThemedText style={[s.prizePosition, { color: colors.text }]}>
                  {item.position}
                </ThemedText>
                <View style={s.prizeCardBadgeRow}>
                  <StatusBadge label={item.status.toUpperCase()} color={stColor} />
                </View>
              </View>
              <ThemedText style={[s.prizeAmount, { color: accentColor }]}>
                {formatCurrencyFull(item.amount)}
              </ThemedText>
            </View>

            <View style={[s.prizeCardDetails, { borderTopColor: colors.border }]}>
              <View style={s.prizeDetailItem}>
                <ThemedText style={[s.prizeDetailValue, { color: colors.text }]}>
                  {item.entrant}
                </ThemedText>
                <ThemedText style={[s.prizeDetailLabel, { color: colors.textTertiary }]}>
                  Entrant
                </ThemedText>
              </View>
              <View style={s.prizeDetailItem}>
                <ThemedText style={[s.prizeDetailValue, { color: colors.textSecondary }]}>
                  {item.series}
                </ThemedText>
                <ThemedText style={[s.prizeDetailLabel, { color: colors.textTertiary }]}>
                  Series
                </ThemedText>
              </View>
              <View style={s.prizeDetailItem}>
                <ThemedText style={[s.prizeDetailValue, { color: colors.textSecondary }]}>
                  {item.date}
                </ThemedText>
                <ThemedText style={[s.prizeDetailLabel, { color: colors.textTertiary }]}>
                  Date
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="trophy.fill" label="No prize allocations found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// SPONSORSHIP TAB
// =============================================================================

function SponsorshipTab({
  colors,
  accentColor,
  data,
  onSelectSponsorship,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: SponsorshipRevenue[];
  onSelectSponsorship: (item: SponsorshipRevenue) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = SPONSORSHIP_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.sponsorCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectSponsorship(item);
            }}
          >
            <View style={s.sponsorCardTop}>
              <View style={[s.sponsorIconCircle, { backgroundColor: accentColor + '18' }]}>
                <IconSymbol name="star.fill" size={20} color={accentColor} />
              </View>
              <View style={s.sponsorCardMid}>
                <ThemedText style={[s.sponsorName, { color: colors.text }]} numberOfLines={1}>
                  {item.sponsor}
                </ThemedText>
                <View style={s.sponsorCardBadgeRow}>
                  <StatusBadge label={item.package.toUpperCase()} color={accentColor} />
                  <StatusBadge label={item.status.toUpperCase()} color={stColor} />
                </View>
              </View>
            </View>

            <View style={[s.sponsorCardMeta, { borderTopColor: colors.border }]}>
              <View style={s.sponsorMetaItem}>
                <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.sponsorMetaText, { color: colors.textSecondary }]}>
                  {item.period}
                </ThemedText>
              </View>
              <View style={s.sponsorMetaItem}>
                <IconSymbol name="creditcard.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.sponsorMetaText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.paymentSchedule}
                </ThemedText>
              </View>
            </View>

            <View style={s.sponsorCardBottom}>
              <ThemedText style={[s.sponsorPeriod, { color: colors.textTertiary }]} numberOfLines={1}>
                {item.period}
              </ThemedText>
              <ThemedText style={[s.sponsorAmount, { color: colors.text }]}>
                {formatCurrencyFull(item.amount)}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="star.fill" label="No sponsorships found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// TICKETING TAB
// =============================================================================

function TicketingTab({
  colors,
  accentColor,
  data,
  onSelectTicketing,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: TicketingRecord[];
  onSelectTicketing: (item: TicketingRecord) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const capPct = getCapacityPercentage(item.ticketsSold, item.capacity);
        const capColor = capPct >= 90 ? '#22C55E' : capPct >= 60 ? '#F59E0B' : '#1D9BF0';
        return (
          <Pressable
            style={[s.ticketCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectTicketing(item);
            }}
          >
            <View style={s.ticketCardTop}>
              <View style={s.ticketCardInfo}>
                <ThemedText style={[s.ticketEventName, { color: colors.text }]} numberOfLines={2}>
                  {item.event}
                </ThemedText>
                <View style={s.ticketMetaRow}>
                  <IconSymbol name="mappin.and.ellipse" size={12} color={colors.textTertiary} />
                  <ThemedText style={[s.ticketVenueText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.venue}
                  </ThemedText>
                </View>
                <View style={s.ticketMetaRow}>
                  <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                  <ThemedText style={[s.ticketDateText, { color: colors.textSecondary }]}>
                    {item.date}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Capacity bar */}
            <View style={[s.ticketCapacitySection, { borderTopColor: colors.border }]}>
              <View style={s.ticketCapacityHeader}>
                <ThemedText style={[s.ticketCapacityLabel, { color: colors.textSecondary }]}>
                  {item.ticketsSold.toLocaleString()} / {item.capacity.toLocaleString()} sold
                </ThemedText>
                <ThemedText style={[s.ticketCapacityPct, { color: capColor }]}>
                  {capPct}%
                </ThemedText>
              </View>
              <View style={[s.ticketCapacityTrack, { backgroundColor: colors.backgroundTertiary }]}>
                <View
                  style={[
                    s.ticketCapacityFill,
                    { backgroundColor: capColor, width: `${Math.min(capPct, 100)}%` },
                  ]}
                />
              </View>
            </View>

            {/* Revenue footer */}
            <View style={s.ticketCardFooter}>
              <View style={s.ticketFooterItem}>
                <ThemedText style={[s.ticketRevenueValue, { color: colors.text }]}>
                  {formatCurrencyFull(item.revenue)}
                </ThemedText>
                <ThemedText style={[s.ticketFooterLabel, { color: colors.textTertiary }]}>
                  Revenue
                </ThemedText>
              </View>
              <View style={s.ticketFooterItem}>
                <ThemedText style={[s.ticketAvgPrice, { color: colors.text }]}>
                  ${item.avgPrice.toFixed(2)}
                </ThemedText>
                <ThemedText style={[s.ticketFooterLabel, { color: colors.textTertiary }]}>
                  Avg Price
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="ticket.fill" label="No ticketing records found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// BUDGETS TAB
// =============================================================================

function BudgetsTab({
  colors,
  accentColor,
  data,
  onSelectBudget,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: Budget[];
  onSelectBudget: (item: Budget) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const pct = getBudgetPercentage(item.spent, item.allocated);
        const statusColor = BUDGET_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.budgetCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectBudget(item);
            }}
          >
            <View style={s.budgetCardTop}>
              <View style={s.budgetCardInfo}>
                <ThemedText style={[s.budgetName, { color: colors.text }]} numberOfLines={2}>
                  {item.name}
                </ThemedText>
                <View style={s.budgetCardBadgeRow}>
                  <StatusBadge label={item.category.toUpperCase()} color={accentColor} />
                  <StatusBadge label={item.status.replace('-', ' ').toUpperCase()} color={statusColor} />
                </View>
              </View>
            </View>

            {/* Progress bar */}
            <View style={[s.budgetProgressSection, { borderTopColor: colors.border }]}>
              <View style={s.budgetProgressHeader}>
                <ThemedText style={[s.budgetProgressLabel, { color: colors.textSecondary }]}>
                  {formatCurrency(item.spent)} of {formatCurrency(item.allocated)}
                </ThemedText>
                <ThemedText style={[s.budgetProgressPct, { color: statusColor }]}>
                  {pct}%
                </ThemedText>
              </View>
              <View style={[s.budgetProgressTrack, { backgroundColor: colors.backgroundTertiary }]}>
                <View
                  style={[
                    s.budgetProgressFill,
                    { backgroundColor: statusColor, width: `${Math.min(pct, 100)}%` },
                  ]}
                />
              </View>
            </View>

            {/* Footer stats */}
            <View style={s.budgetCardFooter}>
              <View style={s.budgetFooterItem}>
                <ThemedText style={[s.budgetFooterValue, { color: colors.text }]}>
                  {formatCurrency(item.allocated)}
                </ThemedText>
                <ThemedText style={[s.budgetFooterLabel, { color: colors.textTertiary }]}>
                  Allocated
                </ThemedText>
              </View>
              <View style={s.budgetFooterItem}>
                <ThemedText style={[s.budgetFooterValue, { color: colors.text }]}>
                  {formatCurrency(item.spent)}
                </ThemedText>
                <ThemedText style={[s.budgetFooterLabel, { color: colors.textTertiary }]}>
                  Spent
                </ThemedText>
              </View>
              <View style={s.budgetFooterItem}>
                <ThemedText
                  style={[
                    s.budgetFooterValue,
                    { color: item.remaining >= 0 ? '#22C55E' : '#EF4444' },
                  ]}
                >
                  {formatCurrency(Math.abs(item.remaining))}
                </ThemedText>
                <ThemedText style={[s.budgetFooterLabel, { color: colors.textTertiary }]}>
                  {item.remaining >= 0 ? 'Remaining' : 'Over'}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="chart.pie.fill" label="No budgets found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// PAYOUTS TAB
// =============================================================================

function PayoutsTab({
  colors,
  accentColor,
  data,
  onSelectPayout,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: PayoutRecord[];
  onSelectPayout: (item: PayoutRecord) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = PAYOUT_STATUS_COLOR[item.status];
        const typeColor = PAYOUT_TYPE_COLOR[item.type];
        return (
          <Pressable
            style={[s.payoutCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectPayout(item);
            }}
          >
            <View style={s.payoutCardTop}>
              <View style={[s.payoutTypeStripe, { backgroundColor: typeColor }]} />
              <View style={s.payoutCardMid}>
                <ThemedText style={[s.payoutRecipient, { color: colors.text }]} numberOfLines={2}>
                  {item.recipient}
                </ThemedText>
                <View style={s.payoutCardBadgeRow}>
                  <StatusBadge label={payoutTypeLabel(item.type)} color={typeColor} />
                  <StatusBadge label={item.status.toUpperCase()} color={stColor} />
                </View>
              </View>
              <ThemedText style={[s.payoutAmount, { color: colors.text }]}>
                {formatCurrencyFull(item.amount)}
              </ThemedText>
            </View>

            <View style={[s.payoutCardMeta, { borderTopColor: colors.border }]}>
              <View style={s.payoutMetaItem}>
                <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.payoutMetaText, { color: colors.textSecondary }]}>
                  {item.date}
                </ThemedText>
              </View>
              <View style={s.payoutMetaItem}>
                <IconSymbol name="number" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.payoutMetaText, { color: colors.textSecondary }]}>
                  {item.reference}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="creditcard.fill" label="No payout records found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// REPORTS TAB
// =============================================================================

function ReportsTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: FinanceReport[];
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const fmtColor = reportFormatColor(item.format);
        return (
          <Pressable
            style={[s.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.reportCardTop}>
              <View style={[s.reportFormatBadge, { backgroundColor: fmtColor + '18' }]}>
                <ThemedText style={[s.reportFormatText, { color: fmtColor }]}>
                  {item.format}
                </ThemedText>
              </View>
              <View style={s.reportCardInfo}>
                <ThemedText style={[s.reportName, { color: colors.text }]} numberOfLines={2}>
                  {item.name}
                </ThemedText>
                <ThemedText style={[s.reportType, { color: colors.textSecondary }]}>
                  {item.type} \u2022 {item.period}
                </ThemedText>
              </View>
            </View>

            <View style={[s.reportCardBottom, { borderTopColor: colors.border }]}>
              <View style={s.reportDateRow}>
                <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.reportDateText, { color: colors.textTertiary }]}>
                  {item.generatedDate}
                </ThemedText>
              </View>
              <Pressable
                style={[s.reportDownloadButton, { backgroundColor: accentColor + '18' }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                <IconSymbol name="arrow.down.circle.fill" size={14} color={accentColor} />
                <ThemedText style={[s.reportDownloadText, { color: accentColor }]}>
                  Download
                </ThemedText>
              </Pressable>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="doc.text.fill" label="No reports available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// SETTINGS TAB
// =============================================================================

function SettingsTab({
  colors,
  accentColor,
  data,
  onToggle,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: FinanceSettingToggle[];
  onToggle: (id: string) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={[s.settingRow, { borderBottomColor: colors.border }]}>
          <View style={s.settingInfo}>
            <ThemedText style={[s.settingLabel, { color: colors.text }]}>{item.label}</ThemedText>
            <ThemedText style={[s.settingDescription, { color: colors.textTertiary }]}>
              {item.description}
            </ThemedText>
          </View>
          <Switch
            value={item.enabled}
            onValueChange={() => onToggle(item.id)}
            trackColor={{ false: colors.backgroundTertiary, true: accentColor + '60' }}
            thumbColor={item.enabled ? accentColor : colors.textTertiary}
          />
        </View>
      )}
      ListEmptyComponent={
        <EmptyState icon="gearshape.fill" label="No settings available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// REVENUE DETAIL BOTTOM SHEET
// =============================================================================

function RevenueDetailSheet({
  visible,
  onClose,
  item,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  item: RevenueItem | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!item) return null;

  const stColor = REVENUE_STATUS_COLOR[item.status];
  const catColor = REVENUE_CATEGORY_COLOR[item.category];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={item.source} useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={revenueCategoryLabel(item.category)} color={catColor} />
        <StatusBadge label={item.status.toUpperCase()} color={stColor} />
      </View>

      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatCurrencyFull(item.amount)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Amount</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{item.date}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Date</ThemedText>
        </View>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Series</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {item.series}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Source</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {item.source}
        </ThemedText>
      </View>

      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>View Transaction</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// EXPENSE DETAIL BOTTOM SHEET
// =============================================================================

function ExpenseDetailSheet({
  visible,
  onClose,
  item,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  item: ExpenseItem | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!item) return null;

  const stColor = EXPENSE_STATUS_COLOR[item.status];
  const catColor = EXPENSE_CATEGORY_COLOR[item.category];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={item.description} useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={expenseCategoryLabel(item.category)} color={catColor} />
        <StatusBadge label={item.status.toUpperCase()} color={stColor} />
      </View>

      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatCurrencyFull(item.amount)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Amount</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{item.date}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Date</ThemedText>
        </View>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Vendor</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {item.vendor}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Series</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {item.series}
        </ThemedText>
      </View>

      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>View Receipt</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// PRIZE DETAIL BOTTOM SHEET
// =============================================================================

function PrizeDetailSheet({
  visible,
  onClose,
  item,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  item: PrizeAllocation | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!item) return null;

  const stColor = PRIZE_STATUS_COLOR[item.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={`${item.position} — ${item.series}`} useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={item.status.toUpperCase()} color={stColor} />
      </View>

      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatCurrencyFull(item.amount)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Prize Amount</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{item.date}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Date</ThemedText>
        </View>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Entrant</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {item.entrant}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Series</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {item.series}
        </ThemedText>
      </View>

      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>Process Payout</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// SPONSORSHIP DETAIL BOTTOM SHEET
// =============================================================================

function SponsorshipDetailSheet({
  visible,
  onClose,
  item,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  item: SponsorshipRevenue | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!item) return null;

  const stColor = SPONSORSHIP_STATUS_COLOR[item.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={item.sponsor} useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={item.package.toUpperCase()} color={accentColor} />
        <StatusBadge label={item.status.toUpperCase()} color={stColor} />
      </View>

      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatCurrencyFull(item.amount)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Total Value</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{item.period}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Period</ThemedText>
        </View>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Payment Schedule</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {item.paymentSchedule}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Package</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {item.package}
        </ThemedText>
      </View>

      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>Manage Sponsorship</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// TICKETING DETAIL BOTTOM SHEET
// =============================================================================

function TicketingDetailSheet({
  visible,
  onClose,
  item,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  item: TicketingRecord | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!item) return null;

  const capPct = getCapacityPercentage(item.ticketsSold, item.capacity);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={item.event} useModal>
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {item.ticketsSold.toLocaleString()}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Sold</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {item.capacity.toLocaleString()}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Capacity</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{capPct}%</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Fill Rate</ThemedText>
        </View>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Venue</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {item.venue}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Date</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {item.date}
        </ThemedText>
      </View>

      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatCurrencyFull(item.revenue)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Revenue</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            ${item.avgPrice.toFixed(2)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Avg Price</ThemedText>
        </View>
      </View>

      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>Manage Ticketing</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// BUDGET DETAIL BOTTOM SHEET
// =============================================================================

function BudgetDetailSheet({
  visible,
  onClose,
  item,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  item: Budget | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!item) return null;

  const pct = getBudgetPercentage(item.spent, item.allocated);
  const statusColor = BUDGET_STATUS_COLOR[item.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={item.name} useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={item.category.toUpperCase()} color={accentColor} />
        <StatusBadge label={item.status.replace('-', ' ').toUpperCase()} color={statusColor} />
      </View>

      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatCurrencyFull(item.allocated)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Allocated</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatCurrencyFull(item.spent)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Spent</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: statusColor }]}>{pct}%</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Used</ThemedText>
        </View>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Series</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {item.series}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Remaining</ThemedText>
        <ThemedText
          style={[
            s.sheetSectionBody,
            { color: item.remaining >= 0 ? '#22C55E' : '#EF4444' },
          ]}
        >
          {item.remaining >= 0 ? formatCurrencyFull(item.remaining) : `-${formatCurrencyFull(Math.abs(item.remaining))}`}
        </ThemedText>
      </View>

      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>Adjust Budget</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// PAYOUT DETAIL BOTTOM SHEET
// =============================================================================

function PayoutDetailSheet({
  visible,
  onClose,
  item,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  item: PayoutRecord | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!item) return null;

  const stColor = PAYOUT_STATUS_COLOR[item.status];
  const typeColor = PAYOUT_TYPE_COLOR[item.type];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={item.recipient} useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={payoutTypeLabel(item.type)} color={typeColor} />
        <StatusBadge label={item.status.toUpperCase()} color={stColor} />
      </View>

      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatCurrencyFull(item.amount)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Amount</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{item.date}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Date</ThemedText>
        </View>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Reference</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {item.reference}
        </ThemedText>
      </View>

      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>
            {item.status === 'pending' ? 'Process Payout' : 'View Details'}
          </ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function CompFinanceV2({ colors, accentColor }: Props) {
  // === State ===
  const [activeTab, setActiveTab] = useState<CompFinanceTabId>('dashboard');
  const [activeScope, setActiveScope] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Bottom sheet states
  const [selectedRevenue, setSelectedRevenue] = useState<RevenueItem | null>(null);
  const [showRevenueDetail, setShowRevenueDetail] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | null>(null);
  const [showExpenseDetail, setShowExpenseDetail] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<PrizeAllocation | null>(null);
  const [showPrizeDetail, setShowPrizeDetail] = useState(false);
  const [selectedSponsorship, setSelectedSponsorship] = useState<SponsorshipRevenue | null>(null);
  const [showSponsorshipDetail, setShowSponsorshipDetail] = useState(false);
  const [selectedTicketing, setSelectedTicketing] = useState<TicketingRecord | null>(null);
  const [showTicketingDetail, setShowTicketingDetail] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [showBudgetDetail, setShowBudgetDetail] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRecord | null>(null);
  const [showPayoutDetail, setShowPayoutDetail] = useState(false);

  // Settings state (local toggle tracking)
  const [settingOverrides, setSettingOverrides] = useState<Record<string, boolean>>({});

  // === Data ===
  const scopeLabel = COMP_FINANCE_SCOPE_CHIPS[activeScope] ?? 'All Finance';
  const data = useMemo(() => getCompFinanceData(scopeLabel), [scopeLabel]);

  // Settings with overrides applied
  const settingsWithOverrides = useMemo(() => {
    return data.settings.map((setting) => ({
      ...setting,
      enabled: settingOverrides[setting.id] !== undefined
        ? settingOverrides[setting.id]
        : setting.enabled,
    }));
  }, [data.settings, settingOverrides]);

  // === Filtered data based on search ===
  const filteredRevenue = useMemo(() => {
    if (!searchQuery.trim()) return data.revenue;
    const q = searchQuery.toLowerCase();
    return data.revenue.filter(
      (r) =>
        r.source.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.series.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q),
    );
  }, [data.revenue, searchQuery]);

  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return data.expenses;
    const q = searchQuery.toLowerCase();
    return data.expenses.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.vendor.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.series.toLowerCase().includes(q) ||
        e.status.toLowerCase().includes(q),
    );
  }, [data.expenses, searchQuery]);

  const filteredPrizePool = useMemo(() => {
    if (!searchQuery.trim()) return data.prizePool;
    const q = searchQuery.toLowerCase();
    return data.prizePool.filter(
      (p) =>
        p.series.toLowerCase().includes(q) ||
        p.position.toLowerCase().includes(q) ||
        p.entrant.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q),
    );
  }, [data.prizePool, searchQuery]);

  const filteredSponsorship = useMemo(() => {
    if (!searchQuery.trim()) return data.sponsorship;
    const q = searchQuery.toLowerCase();
    return data.sponsorship.filter(
      (sp) =>
        sp.sponsor.toLowerCase().includes(q) ||
        sp.package.toLowerCase().includes(q) ||
        sp.period.toLowerCase().includes(q) ||
        sp.status.toLowerCase().includes(q),
    );
  }, [data.sponsorship, searchQuery]);

  const filteredTicketing = useMemo(() => {
    if (!searchQuery.trim()) return data.ticketing;
    const q = searchQuery.toLowerCase();
    return data.ticketing.filter(
      (t) =>
        t.event.toLowerCase().includes(q) ||
        t.venue.toLowerCase().includes(q),
    );
  }, [data.ticketing, searchQuery]);

  const filteredBudgets = useMemo(() => {
    if (!searchQuery.trim()) return data.budgets;
    const q = searchQuery.toLowerCase();
    return data.budgets.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.series.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q),
    );
  }, [data.budgets, searchQuery]);

  const filteredPayouts = useMemo(() => {
    if (!searchQuery.trim()) return data.payouts;
    const q = searchQuery.toLowerCase();
    return data.payouts.filter(
      (p) =>
        p.recipient.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q),
    );
  }, [data.payouts, searchQuery]);

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return data.reports;
    const q = searchQuery.toLowerCase();
    return data.reports.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.format.toLowerCase().includes(q) ||
        r.period.toLowerCase().includes(q),
    );
  }, [data.reports, searchQuery]);

  // === Callbacks ===
  const handleTabPress = useCallback((tabId: CompFinanceTabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  }, []);

  const handleScopePress = useCallback((index: number) => {
    Haptics.selectionAsync();
    setActiveScope(index);
  }, []);

  const handleSelectRevenue = useCallback((item: RevenueItem) => {
    setSelectedRevenue(item);
    setShowRevenueDetail(true);
  }, []);

  const handleSelectExpense = useCallback((item: ExpenseItem) => {
    setSelectedExpense(item);
    setShowExpenseDetail(true);
  }, []);

  const handleSelectPrize = useCallback((item: PrizeAllocation) => {
    setSelectedPrize(item);
    setShowPrizeDetail(true);
  }, []);

  const handleSelectSponsorship = useCallback((item: SponsorshipRevenue) => {
    setSelectedSponsorship(item);
    setShowSponsorshipDetail(true);
  }, []);

  const handleSelectTicketing = useCallback((item: TicketingRecord) => {
    setSelectedTicketing(item);
    setShowTicketingDetail(true);
  }, []);

  const handleSelectBudget = useCallback((item: Budget) => {
    setSelectedBudget(item);
    setShowBudgetDetail(true);
  }, []);

  const handleSelectPayout = useCallback((item: PayoutRecord) => {
    setSelectedPayout(item);
    setShowPayoutDetail(true);
  }, []);

  const handleToggleSetting = useCallback((id: string) => {
    setSettingOverrides((prev) => {
      const currentVal = prev[id] !== undefined
        ? prev[id]
        : data.settings.find((st) => st.id === id)?.enabled ?? false;
      return { ...prev, [id]: !currentVal };
    });
  }, [data.settings]);

  // === Tab content renderer ===
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab colors={colors} accentColor={accentColor} data={data} />;
      case 'revenue':
        return (
          <RevenueTab
            colors={colors}
            accentColor={accentColor}
            data={filteredRevenue}
            onSelectRevenue={handleSelectRevenue}
          />
        );
      case 'expenses':
        return (
          <ExpensesTab
            colors={colors}
            accentColor={accentColor}
            data={filteredExpenses}
            onSelectExpense={handleSelectExpense}
          />
        );
      case 'prize-pool':
        return (
          <PrizePoolTab
            colors={colors}
            accentColor={accentColor}
            data={filteredPrizePool}
            onSelectPrize={handleSelectPrize}
          />
        );
      case 'sponsorship-revenue':
        return (
          <SponsorshipTab
            colors={colors}
            accentColor={accentColor}
            data={filteredSponsorship}
            onSelectSponsorship={handleSelectSponsorship}
          />
        );
      case 'ticketing':
        return (
          <TicketingTab
            colors={colors}
            accentColor={accentColor}
            data={filteredTicketing}
            onSelectTicketing={handleSelectTicketing}
          />
        );
      case 'budgets':
        return (
          <BudgetsTab
            colors={colors}
            accentColor={accentColor}
            data={filteredBudgets}
            onSelectBudget={handleSelectBudget}
          />
        );
      case 'payouts':
        return (
          <PayoutsTab
            colors={colors}
            accentColor={accentColor}
            data={filteredPayouts}
            onSelectPayout={handleSelectPayout}
          />
        );
      case 'reports':
        return (
          <ReportsTab
            colors={colors}
            accentColor={accentColor}
            data={filteredReports}
          />
        );
      case 'settings':
        return (
          <SettingsTab
            colors={colors}
            accentColor={accentColor}
            data={settingsWithOverrides}
            onToggle={handleToggleSetting}
          />
        );
      default:
        return null;
    }
  };

  // === Render ===
  return (
    <View style={s.container}>
      {/* Sub-tab pill bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={s.tabPillRow}
      >
        {COMP_FINANCE_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              style={[
                s.tabPill,
                { backgroundColor: isActive ? accentColor : colors.backgroundTertiary },
              ]}
              onPress={() => handleTabPress(tab.id)}
            >
              <ThemedText
                style={[
                  s.tabPillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Scope chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={s.scopeChipRow}
      >
        {COMP_FINANCE_SCOPE_CHIPS.map((chip, index) => {
          const isActive = index === activeScope;
          return (
            <Pressable
              key={chip}
              style={[
                s.scopeChip,
                { backgroundColor: isActive ? accentColor + '20' : colors.backgroundTertiary },
                isActive && { borderColor: accentColor, borderWidth: 1 },
              ]}
              onPress={() => handleScopePress(index)}
            >
              <ThemedText
                style={[
                  s.scopeChipText,
                  { color: isActive ? accentColor : colors.textSecondary },
                ]}
              >
                {chip}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Search bar */}
      <View style={s.searchContainer}>
        <View
          style={[
            s.searchBar,
            { backgroundColor: colors.backgroundTertiary, borderColor: colors.border },
          ]}
        >
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search\u2026"
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery('')}
              hitSlop={8}
            >
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Tab content */}
      <View style={s.contentContainer}>
        {renderTabContent()}
      </View>

      {/* Bottom Sheets */}
      <RevenueDetailSheet
        visible={showRevenueDetail}
        onClose={() => setShowRevenueDetail(false)}
        item={selectedRevenue}
        colors={colors}
        accentColor={accentColor}
      />
      <ExpenseDetailSheet
        visible={showExpenseDetail}
        onClose={() => setShowExpenseDetail(false)}
        item={selectedExpense}
        colors={colors}
        accentColor={accentColor}
      />
      <PrizeDetailSheet
        visible={showPrizeDetail}
        onClose={() => setShowPrizeDetail(false)}
        item={selectedPrize}
        colors={colors}
        accentColor={accentColor}
      />
      <SponsorshipDetailSheet
        visible={showSponsorshipDetail}
        onClose={() => setShowSponsorshipDetail(false)}
        item={selectedSponsorship}
        colors={colors}
        accentColor={accentColor}
      />
      <TicketingDetailSheet
        visible={showTicketingDetail}
        onClose={() => setShowTicketingDetail(false)}
        item={selectedTicketing}
        colors={colors}
        accentColor={accentColor}
      />
      <BudgetDetailSheet
        visible={showBudgetDetail}
        onClose={() => setShowBudgetDetail(false)}
        item={selectedBudget}
        colors={colors}
        accentColor={accentColor}
      />
      <PayoutDetailSheet
        visible={showPayoutDetail}
        onClose={() => setShowPayoutDetail(false)}
        item={selectedPayout}
        colors={colors}
        accentColor={accentColor}
      />
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
  contentContainer: {
    flex: 1,
  },

  // -- Tab pills --
  tabPillRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Scope chips --
  scopeChipRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  scopeChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  scopeChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Search --
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    height: 40,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },

  // -- Tab scroll containers --
  tabScroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  tabListContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // -- Section titles --
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },

  // -- Badges --
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

  // -- Empty state --
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },

  // -- Dashboard: KPI --
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  kpiCard: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    flexGrow: 1,
    flexBasis: '46%',
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiDelta: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Dashboard: Revenue vs Expense --
  revExpCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  revExpRow: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  revExpItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  revExpDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  revExpInfo: {
    flex: 1,
  },
  revExpLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  revExpValue: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  revExpNetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  revExpNetLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  revExpNetValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Dashboard: Budget Overview --
  budgetOverviewCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  budgetOverviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  budgetOverviewInfo: {
    flex: 1,
    gap: 4,
  },
  budgetOverviewName: {
    fontSize: 13,
    fontWeight: '500',
  },
  budgetOverviewBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(150,150,150,0.15)',
    overflow: 'hidden',
  },
  budgetOverviewBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  budgetOverviewRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  budgetOverviewPct: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Dashboard: Quick Actions --
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickActionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    flexBasis: '30%',
    minHeight: 80,
  },
  quickActionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // -- Dashboard: Summary --
  summaryCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Revenue --
  revenueCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  revenueCardTop: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  revenueStripe: {
    width: 4,
    borderRadius: 2,
    alignSelf: 'stretch',
  },
  revenueCardMid: {
    flex: 1,
  },
  revenueSource: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  revenueCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  revenueCardDetails: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  revenueDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  revenueAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  revenueDetailValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  revenueDetailLabel: {
    fontSize: 10,
    marginTop: 2,
  },

  // -- Expenses --
  expenseCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  expenseCardTop: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  expenseStripe: {
    width: 4,
    borderRadius: 2,
    alignSelf: 'stretch',
  },
  expenseCardMid: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  expenseCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  expenseCardMeta: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  expenseMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expenseMetaText: {
    fontSize: 12,
    flex: 1,
  },
  expenseCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  expenseSeries: {
    fontSize: 12,
    flex: 1,
    marginRight: Spacing.sm,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Prize Pool --
  prizeCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  prizeCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  prizeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prizeCardMid: {
    flex: 1,
  },
  prizePosition: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  prizeCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  prizeAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  prizeCardDetails: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  prizeDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  prizeDetailValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  prizeDetailLabel: {
    fontSize: 10,
    marginTop: 2,
  },

  // -- Sponsorship --
  sponsorCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  sponsorCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  sponsorIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsorCardMid: {
    flex: 1,
  },
  sponsorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sponsorCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  sponsorCardMeta: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  sponsorMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sponsorMetaText: {
    fontSize: 12,
    flex: 1,
  },
  sponsorCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  sponsorPeriod: {
    fontSize: 12,
    flex: 1,
    marginRight: Spacing.sm,
  },
  sponsorAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Ticketing --
  ticketCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  ticketCardTop: {
    padding: Spacing.md,
  },
  ticketCardInfo: {
    flex: 1,
  },
  ticketEventName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  ticketMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  ticketVenueText: {
    fontSize: 12,
    flex: 1,
  },
  ticketDateText: {
    fontSize: 12,
  },
  ticketCapacitySection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  ticketCapacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ticketCapacityLabel: {
    fontSize: 12,
  },
  ticketCapacityPct: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  ticketCapacityTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  ticketCapacityFill: {
    height: '100%',
    borderRadius: 3,
  },
  ticketCardFooter: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  ticketFooterItem: {
    flex: 1,
    alignItems: 'center',
  },
  ticketRevenueValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  ticketAvgPrice: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  ticketFooterLabel: {
    fontSize: 10,
    marginTop: 2,
  },

  // -- Budgets --
  budgetCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  budgetCardTop: {
    padding: Spacing.md,
  },
  budgetCardInfo: {
    flex: 1,
  },
  budgetName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  budgetCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  budgetProgressSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  budgetProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  budgetProgressLabel: {
    fontSize: 12,
  },
  budgetProgressPct: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  budgetProgressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  budgetProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  budgetCardFooter: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  budgetFooterItem: {
    flex: 1,
    alignItems: 'center',
  },
  budgetFooterValue: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  budgetFooterLabel: {
    fontSize: 10,
    marginTop: 2,
  },

  // -- Payouts --
  payoutCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  payoutCardTop: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  payoutTypeStripe: {
    width: 4,
    borderRadius: 2,
    alignSelf: 'stretch',
  },
  payoutCardMid: {
    flex: 1,
  },
  payoutRecipient: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  payoutCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  payoutAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  payoutCardMeta: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.lg,
  },
  payoutMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  payoutMetaText: {
    fontSize: 12,
  },

  // -- Reports --
  reportCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  reportCardTop: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  reportFormatBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportFormatText: {
    fontSize: 12,
    fontWeight: '800',
  },
  reportCardInfo: {
    flex: 1,
  },
  reportName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  reportType: {
    fontSize: 12,
  },
  reportCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  reportDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportDateText: {
    fontSize: 12,
  },
  reportDownloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  reportDownloadText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Settings --
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },

  // -- Bottom Sheet shared --
  sheetBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  sheetKpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
  },
  sheetKpiItem: {
    alignItems: 'center',
  },
  sheetKpiValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sheetKpiLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  sheetSection: {
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  sheetSectionBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  sheetActions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  sheetActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  sheetActionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  sheetGhostButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sheetGhostButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
