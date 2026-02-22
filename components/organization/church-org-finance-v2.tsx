/**
 * Church Organization Finance v2 — Financial stewardship hub.
 * Sub-tabs: Overview | Budgets | Funds | Commitments | Expenses | Approvals | Reports | Audit
 * RBAC: C1/C2 full access, C3 limited (Overview/Budgets/Expenses), C4/C5 locked.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { ChurchRoleLens } from '@/utils/church-rbac';
import { isElderLevel, isStaffLevel } from '@/utils/church-rbac';
import {
  getChurchFinanceData,
  getFundById,
  getRequestsByFund,
  getRequestsByStatus,
  FUND_TYPE_LABELS,
  FUND_TYPE_COLORS,
  FUND_TYPE_ICONS,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_COLORS,
  REQUEST_TYPE_LABELS,
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_ICONS,
  BUDGET_PERIOD_LABELS,
  AUDIT_STATUS_LABELS,
  AUDIT_STATUS_COLORS,
} from '@/data/mock-church-org-finance';
import type {
  ChurchFund,
  ChurchBudget,
  BudgetCategory,
  FinanceRequest,
  Commitment,
  ExpenseEntry,
  AuditEntry,
  FinanceReport,
  FundType,
  RequestStatus,
} from '@/data/mock-church-org-finance';

// =============================================================================
// CONSTANTS
// =============================================================================

const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'budgets', label: 'Budgets' },
  { id: 'funds', label: 'Funds' },
  { id: 'commitments', label: 'Commitments' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'reports', label: 'Reports' },
  { id: 'audit', label: 'Audit' },
];

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: ChurchRoleLens;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[parseInt(parts[1], 10) - 1] || parts[1];
  const day = parseInt(parts[2], 10);
  return `${month} ${day}`;
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
// SUB-TAB BAR
// =============================================================================

function SubTabBar({
  tabs,
  activeId,
  onSelect,
  accentColor,
  colors,
}: {
  tabs: typeof SUB_TABS;
  activeId: string;
  onSelect: (id: string) => void;
  accentColor: string;
  colors: typeof Colors.light;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.subTabRow}
      style={{ flexGrow: 0 }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <Pressable
            key={tab.id}
            style={[
              s.subTab,
              {
                borderBottomColor: isActive ? accentColor : 'transparent',
                borderBottomWidth: isActive ? 2 : 0,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(tab.id);
            }}
          >
            <ThemedText
              style={[
                s.subTabText,
                { color: isActive ? colors.text : colors.textSecondary },
              ]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// OVERVIEW SUB-TAB
// =============================================================================

function OverviewTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getChurchFinanceData>;
}) {
  const totalFunds = data.funds.reduce((sum, f) => sum + f.available + f.committed + f.spent, 0);
  const totalCommitted = data.funds.reduce((sum, f) => sum + f.committed, 0);
  const totalSpent = data.funds.reduce((sum, f) => sum + f.spent, 0);
  const benevolenceCases = data.commitments.filter((c) => c.title.toLowerCase().includes('benevolence')).length;
  const pendingApprovals = data.requests.filter((r) => r.status === 'pending_approval').length;
  const fundsAtRisk = data.funds.filter((f) => f.atRisk);
  const missingReceipts = data.expenses.filter((e) => !e.receiptAttached).length;
  const approvedNotReleased = data.requests.filter((r) => r.status === 'approved').length;
  const overBudgetWarnings = data.budgets.reduce((count, b) => {
    return count + b.categories.filter((c) => c.spent > c.cap).length;
  }, 0);

  // Health tiles
  const healthTiles = [
    { icon: 'banknote.fill', label: 'Total Funds', value: formatCurrency(totalFunds), color: accentColor },
    { icon: 'lock.fill', label: 'Committed', value: formatCurrency(totalCommitted), color: '#F59E0B' },
    { icon: 'arrow.up.right', label: 'Spend MTD', value: formatCurrency(totalSpent), color: '#1D9BF0' },
    { icon: 'heart.fill', label: 'Benevolence', value: String(benevolenceCases), color: '#1D9BF0' },
    { icon: 'exclamationmark.triangle.fill', label: 'Exceptions', value: String(overBudgetWarnings), color: overBudgetWarnings > 0 ? '#EF4444' : '#22C55E' },
    { icon: 'checkmark.shield.fill', label: 'Audit Score', value: `${data.auditTrail.filter((a) => a.evidenceAttached).length}/${data.auditTrail.length}`, color: '#22C55E' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Block A: Finance Health Strip */}
      <View style={s.healthGrid}>
        {healthTiles.map((tile, i) => (
          <View key={`ht-${i}`} style={[s.healthTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <IconSymbol name={tile.icon as any} size={16} color={tile.color} />
            <ThemedText style={[s.healthTileValue, { color: tile.color }]}>{tile.value}</ThemedText>
            <ThemedText style={[s.healthTileLabel, { color: colors.textSecondary }]}>{tile.label}</ThemedText>
          </View>
        ))}
      </View>

      {/* Block B: Today / This Week */}
      <View style={[s.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.sectionCardHeader}>
          <IconSymbol name="clock.fill" size={16} color={accentColor} />
          <ThemedText style={[s.sectionCardTitle, { color: colors.text }]}>This Week</ThemedText>
        </View>
        <View style={s.weekRow}>
          <View style={s.weekItem}>
            <ThemedText style={[s.weekItemValue, { color: '#F59E0B' }]}>{pendingApprovals}</ThemedText>
            <ThemedText style={[s.weekItemLabel, { color: colors.textSecondary }]}>Pending Approvals</ThemedText>
          </View>
          <View style={s.weekItem}>
            <ThemedText style={[s.weekItemValue, { color: '#1D9BF0' }]}>
              {data.commitments.filter((c) => c.status === 'scheduled').length}
            </ThemedText>
            <ThemedText style={[s.weekItemLabel, { color: colors.textSecondary }]}>Recurring Due</ThemedText>
          </View>
          <View style={s.weekItem}>
            <ThemedText style={[s.weekItemValue, { color: fundsAtRisk.length > 0 ? '#EF4444' : '#22C55E' }]}>
              {fundsAtRisk.length}
            </ThemedText>
            <ThemedText style={[s.weekItemLabel, { color: colors.textSecondary }]}>At-Risk Funds</ThemedText>
          </View>
        </View>
        {fundsAtRisk.length > 0 && (
          <View style={s.riskWarningRow}>
            <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#EF4444" />
            <ThemedText style={[s.riskWarningText, { color: '#EF4444' }]}>
              {fundsAtRisk.map((f) => f.name).join(', ')} at risk
            </ThemedText>
          </View>
        )}
      </View>

      {/* Block C: Top Funds Snapshot */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Top Funds
      </ThemedText>
      {data.funds.slice(0, 5).map((fund) => {
        const typeColor = FUND_TYPE_COLORS[fund.type];
        return (
          <View
            key={fund.id}
            style={[s.fundSnapshotCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.fundSnapshotTop}>
              <View style={[s.fundIconCircle, { backgroundColor: typeColor + '18' }]}>
                <IconSymbol name={FUND_TYPE_ICONS[fund.type] as any} size={16} color={typeColor} />
              </View>
              <ThemedText style={[s.fundSnapshotName, { color: colors.text }]} numberOfLines={1}>
                {fund.name}
              </ThemedText>
              {fund.atRisk && <StatusBadge label="AT RISK" color="#EF4444" />}
            </View>
            <View style={s.fundSnapshotValues}>
              <View style={s.fundSnapshotValueItem}>
                <ThemedText style={[s.fundSnapshotAmount, { color: '#22C55E' }]}>
                  {formatCurrency(fund.available)}
                </ThemedText>
                <ThemedText style={[s.fundSnapshotAmountLabel, { color: colors.textTertiary }]}>Available</ThemedText>
              </View>
              <View style={s.fundSnapshotValueItem}>
                <ThemedText style={[s.fundSnapshotAmount, { color: '#F59E0B' }]}>
                  {formatCurrency(fund.committed)}
                </ThemedText>
                <ThemedText style={[s.fundSnapshotAmountLabel, { color: colors.textTertiary }]}>Committed</ThemedText>
              </View>
              <View style={s.fundSnapshotValueItem}>
                <ThemedText style={[s.fundSnapshotAmount, { color: colors.textSecondary }]}>
                  {formatCurrency(fund.spent)}
                </ThemedText>
                <ThemedText style={[s.fundSnapshotAmountLabel, { color: colors.textTertiary }]}>Spent</ThemedText>
              </View>
            </View>
          </View>
        );
      })}

      {/* Block D: Action Queue */}
      <View style={[s.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: Spacing.lg }]}>
        <View style={s.sectionCardHeader}>
          <IconSymbol name="list.bullet.rectangle.fill" size={16} color="#F59E0B" />
          <ThemedText style={[s.sectionCardTitle, { color: colors.text }]}>Action Queue</ThemedText>
        </View>
        {missingReceipts > 0 && (
          <View style={s.actionQueueRow}>
            <View style={[s.actionDot, { backgroundColor: '#EF4444' }]} />
            <ThemedText style={[s.actionQueueText, { color: colors.text }]}>
              {missingReceipts} missing receipt{missingReceipts > 1 ? 's' : ''}
            </ThemedText>
          </View>
        )}
        {pendingApprovals > 0 && (
          <View style={s.actionQueueRow}>
            <View style={[s.actionDot, { backgroundColor: '#F59E0B' }]} />
            <ThemedText style={[s.actionQueueText, { color: colors.text }]}>
              {pendingApprovals} pending approval{pendingApprovals > 1 ? 's' : ''}
            </ThemedText>
          </View>
        )}
        {approvedNotReleased > 0 && (
          <View style={s.actionQueueRow}>
            <View style={[s.actionDot, { backgroundColor: '#1D9BF0' }]} />
            <ThemedText style={[s.actionQueueText, { color: colors.text }]}>
              {approvedNotReleased} approved awaiting release
            </ThemedText>
          </View>
        )}
        {overBudgetWarnings > 0 && (
          <View style={s.actionQueueRow}>
            <View style={[s.actionDot, { backgroundColor: '#EF4444' }]} />
            <ThemedText style={[s.actionQueueText, { color: colors.text }]}>
              {overBudgetWarnings} over-budget categor{overBudgetWarnings > 1 ? 'ies' : 'y'}
            </ThemedText>
          </View>
        )}
        {missingReceipts === 0 && pendingApprovals === 0 && approvedNotReleased === 0 && overBudgetWarnings === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No outstanding actions
          </ThemedText>
        )}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// BUDGETS SUB-TAB
// =============================================================================

function BudgetsTab({
  colors,
  accentColor,
  budgets,
  funds,
  role,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  budgets: ChurchBudget[];
  funds: ChurchFund[];
  role: ChurchRoleLens;
}) {
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const periodOptions = ['all', 'monthly', 'quarterly', 'annual'] as const;

  const filtered = useMemo(() => {
    let list = budgets;
    if (periodFilter !== 'all') {
      list = list.filter((b) => b.period === periodFilter);
    }
    // C3 sees only their ministry budgets (simulated: show first 2 budgets)
    if (role === 'C3') {
      list = list.slice(0, 2);
    }
    return list;
  }, [budgets, periodFilter, role]);

  const getFundName = (fundType: string): string => {
    return FUND_TYPE_LABELS[fundType as FundType] || fundType;
  };

  const getBudgetColor = (spent: number, cap: number): string => {
    const ratio = cap > 0 ? spent / cap : 0;
    if (ratio > 1) return '#EF4444';
    if (ratio >= 0.8) return '#F59E0B';
    return '#22C55E';
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Period Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterChipRow}
        style={{ flexGrow: 0 }}
      >
        {periodOptions.map((opt) => {
          const isActive = opt === periodFilter;
          const label = opt === 'all' ? 'All' : BUDGET_PERIOD_LABELS[opt as keyof typeof BUDGET_PERIOD_LABELS];
          return (
            <Pressable
              key={opt}
              style={[
                s.filterChip,
                {
                  backgroundColor: isActive ? accentColor + '20' : colors.card,
                  borderColor: isActive ? accentColor + '40' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPeriodFilter(opt);
              }}
            >
              <ThemedText
                style={[s.filterChipText, { color: isActive ? accentColor : colors.textSecondary }]}
              >
                {label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Budget Cards */}
      {filtered.map((budget) => {
        const totalCap = budget.categories.reduce((sum, c) => sum + c.cap, 0);
        const totalSpent = budget.categories.reduce((sum, c) => sum + c.spent, 0);
        const totalCommitted = budget.categories.reduce((sum, c) => sum + c.committed, 0);
        const totalRemaining = totalCap - totalSpent - totalCommitted;
        const overallColor = getBudgetColor(totalSpent, totalCap);

        return (
          <View
            key={budget.id}
            style={[s.budgetCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.budgetCardHeader}>
              <View style={s.budgetNameCol}>
                <ThemedText style={[s.budgetName, { color: colors.text }]} numberOfLines={1}>
                  {budget.name}
                </ThemedText>
                <View style={s.budgetBadgeRow}>
                  <StatusBadge label={BUDGET_PERIOD_LABELS[budget.period].toUpperCase()} color={accentColor} />
                  <StatusBadge label={budget.ministry.toUpperCase()} color="#1D9BF0" />
                </View>
              </View>
              <View style={s.budgetTotalCol}>
                <ThemedText style={[s.budgetTotalValue, { color: overallColor }]}>
                  {formatCurrency(totalSpent)}
                </ThemedText>
                <ThemedText style={[s.budgetTotalLabel, { color: colors.textTertiary }]}>
                  of {formatCurrency(totalCap)}
                </ThemedText>
              </View>
            </View>

            {/* Fund Badge */}
            <View style={s.budgetFundRow}>
              <IconSymbol name="banknote.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.budgetFundText, { color: colors.textTertiary }]}>
                Fund: {FUND_TYPE_LABELS[budget.fundType] || budget.fundType}
              </ThemedText>
            </View>

            {/* Category Rows */}
            {budget.categories.map((cat, catIdx) => {
              const pct = cat.cap > 0 ? (cat.spent / cat.cap) * 100 : 0;
              const catColor = getBudgetColor(cat.spent, cat.cap);
              const remaining = cat.cap - cat.spent - cat.committed;
              return (
                <View
                  key={`cat-${catIdx}`}
                  style={[
                    s.budgetCategoryRow,
                    catIdx < budget.categories.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={s.budgetCategoryNameRow}>
                    <ThemedText style={[s.budgetCategoryName, { color: colors.text }]}>
                      {EXPENSE_CATEGORY_LABELS[cat.category] || cat.category}
                    </ThemedText>
                    <ThemedText style={[s.budgetCategoryCap, { color: colors.textTertiary }]}>
                      Cap: {formatCurrency(cat.cap)}
                    </ThemedText>
                  </View>
                  <ProgressBar percent={pct} color={catColor} />
                  <View style={s.budgetCategoryValues}>
                    <ThemedText style={[s.budgetCategoryValueText, { color: catColor }]}>
                      Spent: {formatCurrency(cat.spent)}
                    </ThemedText>
                    <ThemedText style={[s.budgetCategoryValueText, { color: '#F59E0B' }]}>
                      Cmtd: {formatCurrency(cat.committed)}
                    </ThemedText>
                    <ThemedText style={[s.budgetCategoryValueText, { color: remaining >= 0 ? '#22C55E' : '#EF4444' }]}>
                      Rem: {formatCurrency(remaining)}
                    </ThemedText>
                  </View>
                </View>
              );
            })}

            {/* Variance Note */}
            {budget.varianceNote && (
              <View style={s.varianceNoteRow}>
                <IconSymbol name="info.circle.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.varianceNoteText, { color: colors.textSecondary }]}>
                  {budget.varianceNote}
                </ThemedText>
              </View>
            )}
          </View>
        );
      })}

      {filtered.length === 0 && (
        <EmptyState icon="chart.bar.fill" label="No budgets match filter" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// FUNDS SUB-TAB
// =============================================================================

function FundsTab({
  colors,
  accentColor,
  funds,
  onSelectFund,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  funds: ChurchFund[];
  onSelectFund: (fund: ChurchFund) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: ChurchFund }) => {
      const typeColor = FUND_TYPE_COLORS[item.type];
      return (
        <Pressable
          style={[s.fundCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectFund(item);
          }}
        >
          {/* Top Row */}
          <View style={s.fundCardTop}>
            <View style={[s.fundIconCircle, { backgroundColor: typeColor + '18' }]}>
              <IconSymbol name={FUND_TYPE_ICONS[item.type] as any} size={18} color={typeColor} />
            </View>
            <View style={s.fundNameCol}>
              <ThemedText style={[s.fundName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <View style={s.fundBadgeRow}>
                <StatusBadge label={FUND_TYPE_LABELS[item.type].toUpperCase()} color={typeColor} />
                {item.restricted && <StatusBadge label="RESTRICTED" color="#1D9BF0" />}
                {item.atRisk && <StatusBadge label="AT RISK" color="#EF4444" />}
              </View>
            </View>
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </View>

          {/* Values Row */}
          <View style={[s.fundValuesRow, { borderTopColor: colors.border }]}>
            <View style={s.fundValueItem}>
              <ThemedText style={[s.fundValueAmount, { color: '#22C55E' }]}>
                {formatCurrency(item.available)}
              </ThemedText>
              <ThemedText style={[s.fundValueLabel, { color: colors.textTertiary }]}>Available</ThemedText>
            </View>
            <View style={s.fundValueItem}>
              <ThemedText style={[s.fundValueAmount, { color: '#F59E0B' }]}>
                {formatCurrency(item.committed)}
              </ThemedText>
              <ThemedText style={[s.fundValueLabel, { color: colors.textTertiary }]}>Committed</ThemedText>
            </View>
            <View style={s.fundValueItem}>
              <ThemedText style={[s.fundValueAmount, { color: colors.textSecondary }]}>
                {formatCurrency(item.spent)}
              </ThemedText>
              <ThemedText style={[s.fundValueLabel, { color: colors.textTertiary }]}>Spent</ThemedText>
            </View>
          </View>

          {/* Owners & Ministries */}
          <View style={s.fundMetaRow}>
            <View style={s.fundMetaItem}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.fundMetaText, { color: colors.textTertiary }]} numberOfLines={1}>
                {item.owners.join(', ')}
              </ThemedText>
            </View>
            {item.linkedMinistries.length > 0 && (
              <View style={s.fundMetaItem}>
                <IconSymbol name="building.2.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.fundMetaText, { color: colors.textTertiary }]} numberOfLines={1}>
                  {item.linkedMinistries.join(', ')}
                </ThemedText>
              </View>
            )}
          </View>
        </Pressable>
      );
    },
    [colors, onSelectFund],
  );

  return (
    <FlatList
      data={funds}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="banknote.fill" label="No funds available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// COMMITMENTS SUB-TAB
// =============================================================================

function CommitmentsTab({
  colors,
  accentColor,
  commitments,
  funds,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  commitments: Commitment[];
  funds: ChurchFund[];
}) {
  const sorted = useMemo(() => {
    return [...commitments].sort((a, b) => {
      const dateCompare = a.dueDate.localeCompare(b.dueDate);
      if (dateCompare !== 0) return dateCompare;
      return b.amount - a.amount;
    });
  }, [commitments]);

  const getFundName = (fundType: string): string => {
    return FUND_TYPE_LABELS[fundType as FundType] || fundType;
  };

  const getFundColor = (fundType: string): string => {
    return FUND_TYPE_COLORS[fundType as FundType] || '#A1A1AA';
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Approved, Not Paid</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Sorted by due date, then highest amount
      </ThemedText>

      {sorted.map((commitment) => {
        const fundColor = getFundColor(commitment.fund);
        const isReady = commitment.readyForRails;
        return (
          <View
            key={commitment.id}
            style={[s.commitmentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.commitmentHeader}>
              <ThemedText style={[s.commitmentTitle, { color: colors.text }]} numberOfLines={1}>
                {commitment.title}
              </ThemedText>
              <StatusBadge
                label={isReady ? 'READY FOR RAILS' : commitment.status.toUpperCase().replace('_', ' ')}
                color={isReady ? '#22C55E' : '#F59E0B'}
              />
            </View>
            <ThemedText style={[s.commitmentAmount, { color: colors.text }]}>
              {formatCurrency(commitment.amount)}
            </ThemedText>
            <View style={s.commitmentMeta}>
              <StatusBadge label={getFundName(commitment.fund).toUpperCase()} color={fundColor} />
              <View style={s.commitmentMetaItem}>
                <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.commitmentMetaText, { color: colors.textTertiary }]}>
                  Due {formatDate(commitment.dueDate)}
                </ThemedText>
              </View>
            </View>
            <View style={s.commitmentPayee}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.commitmentPayeeText, { color: colors.textSecondary }]}>
                Payee: {commitment.payee}
              </ThemedText>
            </View>
            {isReady && (
              <View style={s.readyIndicator}>
                <IconSymbol name="checkmark.circle.fill" size={12} color="#22C55E" />
                <ThemedText style={[s.readyText, { color: '#22C55E' }]}>
                  Ready for Payment Rails
                </ThemedText>
              </View>
            )}
          </View>
        );
      })}

      {sorted.length === 0 && (
        <EmptyState icon="dollarsign.circle.fill" label="No outstanding commitments" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// EXPENSES SUB-TAB
// =============================================================================

function ExpensesTab({
  colors,
  accentColor,
  expenses,
  funds,
  role,
  onSelectExpense,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  expenses: ExpenseEntry[];
  funds: ChurchFund[];
  role: ChurchRoleLens;
  onSelectExpense: (expense: ExpenseEntry) => void;
}) {
  const filtered = useMemo(() => {
    let list = expenses;
    // C3 sees only their own/ministry expenses (simulated: first 4)
    if (role === 'C3') {
      list = list.slice(0, 4);
    }
    return list;
  }, [expenses, role]);

  const getFundName = (fundType: string): string => {
    return FUND_TYPE_LABELS[fundType as FundType] || fundType;
  };

  const getFundColor = (fundType: string): string => {
    return FUND_TYPE_COLORS[fundType as FundType] || '#A1A1AA';
  };

  const renderItem = useCallback(
    ({ item }: { item: ExpenseEntry }) => {
      const catIcon = EXPENSE_CATEGORY_ICONS[item.category] || 'dollarsign.circle.fill';
      const catLabel = EXPENSE_CATEGORY_LABELS[item.category] || item.category;
      const statusColor = REQUEST_STATUS_COLORS[item.status as RequestStatus] || '#A1A1AA';
      const statusLabel = REQUEST_STATUS_LABELS[item.status as RequestStatus] || item.status;
      const fundColor = getFundColor(item.fund);

      return (
        <Pressable
          style={[s.expenseRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectExpense(item);
          }}
        >
          <View style={[s.expenseIconCircle, { backgroundColor: fundColor + '18' }]}>
            <IconSymbol name={catIcon as any} size={16} color={fundColor} />
          </View>
          <View style={s.expenseTextCol}>
            <ThemedText style={[s.expenseTitle, { color: colors.text }]} numberOfLines={1}>
              {catLabel}
            </ThemedText>
            <View style={s.expenseBadgeRow}>
              <StatusBadge label={getFundName(item.fund).toUpperCase()} color={fundColor} />
              {item.ministry && (
                <ThemedText style={[s.expenseMinistry, { color: colors.textTertiary }]}>
                  {item.ministry}
                </ThemedText>
              )}
            </View>
            <ThemedText style={[s.expenseDate, { color: colors.textTertiary }]}>
              {formatDate(item.date)}
            </ThemedText>
          </View>
          <View style={s.expenseRight}>
            <ThemedText style={[s.expenseAmount, { color: colors.text }]}>
              {formatCurrency(item.amount)}
            </ThemedText>
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
          </View>
        </Pressable>
      );
    },
    [colors, onSelectExpense, funds],
  );

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="dollarsign.circle.fill" label="No expenses recorded" colors={colors} />
      }
    />
  );
}

// =============================================================================
// APPROVALS SUB-TAB (C1/C2 only)
// =============================================================================

function ApprovalsTab({
  colors,
  accentColor,
  requests,
  funds,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  requests: FinanceRequest[];
  funds: ChurchFund[];
}) {
  const approvalQueue = useMemo(() => requests.filter((r) => r.status === 'pending_approval'), [requests]);
  const releaseQueue = useMemo(() => requests.filter((r) => r.status === 'approved'), [requests]);

  const getFundName = (fundType: string): string => {
    return FUND_TYPE_LABELS[fundType as FundType] || fundType;
  };

  const getFundColor = (fundType: string): string => {
    return FUND_TYPE_COLORS[fundType as FundType] || '#A1A1AA';
  };

  const renderRequestItem = (req: FinanceRequest, queueType: 'approval' | 'release') => {
    const fundColor = getFundColor(req.fund);
    const catLabel = EXPENSE_CATEGORY_LABELS[req.category] || req.category;
    const typeLabel = REQUEST_TYPE_LABELS[req.type] || req.type;
    const indicatorColor = queueType === 'approval' ? '#F59E0B' : '#1D9BF0';
    const indicatorLabel = queueType === 'approval' ? 'Needs Approval' : 'Needs Release';

    return (
      <View
        key={req.id}
        style={[s.approvalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={s.approvalHeader}>
          <ThemedText style={[s.approvalAmount, { color: colors.text }]}>
            {formatCurrency(req.amount)}
          </ThemedText>
          <StatusBadge label={indicatorLabel.toUpperCase()} color={indicatorColor} />
        </View>
        <View style={s.approvalBadgeRow}>
          <StatusBadge label={getFundName(req.fund).toUpperCase()} color={fundColor} />
          <StatusBadge label={catLabel.toUpperCase()} color="#A1A1AA" />
          <StatusBadge label={typeLabel.toUpperCase()} color={accentColor} />
        </View>
        <View style={s.approvalMeta}>
          <View style={s.approvalMetaItem}>
            <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
            <ThemedText style={[s.approvalMetaText, { color: colors.textTertiary }]}>
              {req.requestedBy}
            </ThemedText>
          </View>
          <View style={s.approvalMetaItem}>
            <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
            <ThemedText style={[s.approvalMetaText, { color: colors.textTertiary }]}>
              {formatDate(req.requestedDate)}
            </ThemedText>
          </View>
        </View>
        {req.attachments.length === 0 && (
          <View style={s.missingRow}>
            <IconSymbol name="exclamationmark.triangle.fill" size={11} color="#EF4444" />
            <ThemedText style={[s.missingText, { color: '#EF4444' }]}>
              Missing: receipts/documentation
            </ThemedText>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Approval Queue */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Approval Queue</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Items needing decision
      </ThemedText>
      {approvalQueue.map((req) => renderRequestItem(req, 'approval'))}
      {approvalQueue.length === 0 && (
        <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary, marginBottom: Spacing.lg }]}>
          No items pending approval
        </ThemedText>
      )}

      {/* Release Queue */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.md }]}>Release Queue</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Items approved, needing execution release
      </ThemedText>
      {releaseQueue.map((req) => renderRequestItem(req, 'release'))}
      {releaseQueue.length === 0 && (
        <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
          No items awaiting release
        </ThemedText>
      )}
    </ScrollView>
  );
}

// =============================================================================
// REPORTS SUB-TAB (C1/C2 only)
// =============================================================================

function ReportsTab({
  colors,
  accentColor,
  reports,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  reports: FinanceReport[];
}) {
  const typeIconMap: Record<string, string> = {
    income_statement: 'chart.bar.fill',
    balance_sheet: 'chart.pie.fill',
    cash_flow: 'arrow.left.arrow.right',
    budget_variance: 'chart.line.uptrend.xyaxis',
    giving_summary: 'heart.fill',
    expense_detail: 'list.bullet.rectangle.fill',
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Finance Reports</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Generated reports for review and export
      </ThemedText>

      {reports.map((report) => {
        const icon = typeIconMap[report.type] || 'doc.text.fill';
        return (
          <View
            key={report.id}
            style={[s.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[s.reportIconCircle, { backgroundColor: accentColor + '18' }]}>
              <IconSymbol name={icon as any} size={18} color={accentColor} />
            </View>
            <View style={s.reportTextCol}>
              <ThemedText style={[s.reportName, { color: colors.text }]} numberOfLines={1}>
                {report.name}
              </ThemedText>
              <View style={s.reportBadgeRow}>
                <StatusBadge label={report.type.replace(/_/g, ' ').toUpperCase()} color={accentColor} />
                <StatusBadge label={report.period.toUpperCase()} color="#1D9BF0" />
              </View>
              <View style={s.reportMeta}>
                <ThemedText style={[s.reportMetaText, { color: colors.textTertiary }]}>
                  Generated {formatDate(report.generatedDate)} by {report.generatedBy}
                </ThemedText>
              </View>
            </View>
            <Pressable
              style={[s.exportButton, { borderColor: colors.border }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <ThemedText style={[s.exportButtonText, { color: accentColor }]}>Export</ThemedText>
            </Pressable>
          </View>
        );
      })}

      {reports.length === 0 && (
        <EmptyState icon="doc.text.fill" label="No reports available" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// AUDIT SUB-TAB (C1/C2 only)
// =============================================================================

function AuditTab({
  colors,
  accentColor,
  auditEntries,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  auditEntries: AuditEntry[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Audit Trail</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Chronological audit log with evidence tracking
      </ThemedText>

      {auditEntries.map((entry, idx) => {
        const isMissing = !entry.evidenceAttached;
        const statusColor = entry.evidenceAttached ? '#22C55E' : '#EF4444';
        return (
          <View
            key={entry.id}
            style={[
              s.auditCard,
              {
                backgroundColor: isMissing ? '#EF444408' : colors.card,
                borderColor: isMissing ? '#EF444430' : colors.border,
              },
            ]}
          >
            {/* Timeline dot and line */}
            <View style={s.auditTimeline}>
              <View style={[s.auditDot, { backgroundColor: statusColor }]} />
              {idx < auditEntries.length - 1 && (
                <View style={[s.auditLine, { backgroundColor: colors.border }]} />
              )}
            </View>

            <View style={s.auditContent}>
              <View style={s.auditHeader}>
                <ThemedText style={[s.auditAction, { color: colors.text }]} numberOfLines={2}>
                  {entry.action}
                </ThemedText>
                <StatusBadge label={entry.evidenceAttached ? 'COMPLETE' : 'MISSING DOCS'} color={statusColor} />
              </View>
              <View style={s.auditMeta}>
                <View style={s.auditMetaItem}>
                  <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.auditMetaText, { color: colors.textTertiary }]}>
                    {entry.performedBy}
                  </ThemedText>
                </View>
                <View style={s.auditMetaItem}>
                  <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.auditMetaText, { color: colors.textTertiary }]}>
                    {entry.timestamp}
                  </ThemedText>
                </View>
              </View>
              {entry.entityId && (
                <ThemedText style={[s.auditEntityRef, { color: colors.textSecondary }]}>
                  Ref: {entry.entityType}:{entry.entityId}
                </ThemedText>
              )}
              <View style={s.auditEvidenceRow}>
                <IconSymbol
                  name={entry.evidenceAttached ? 'checkmark.circle.fill' : 'xmark.circle.fill'}
                  size={14}
                  color={entry.evidenceAttached ? '#22C55E' : '#EF4444'}
                />
                <ThemedText
                  style={[
                    s.auditEvidenceText,
                    { color: entry.evidenceAttached ? '#22C55E' : '#EF4444' },
                  ]}
                >
                  {entry.evidenceAttached ? 'Evidence attached' : 'Missing evidence'}
                </ThemedText>
              </View>
            </View>
          </View>
        );
      })}

      {auditEntries.length === 0 && (
        <EmptyState icon="checkmark.shield.fill" label="No audit entries" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// FUND DETAIL BOTTOM SHEET
// =============================================================================

function FundDetailSheet({
  visible,
  onClose,
  fund,
  colors,
  accentColor,
  requests,
}: {
  visible: boolean;
  onClose: () => void;
  fund: ChurchFund | null;
  colors: typeof Colors.light;
  accentColor: string;
  requests: FinanceRequest[];
}) {
  if (!fund) return null;

  const typeColor = FUND_TYPE_COLORS[fund.type];
  const fundRequests = requests.filter((r) => r.fund === fund.type).slice(0, 5);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={fund.name} useModal>
      {/* Type & Status */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={FUND_TYPE_LABELS[fund.type].toUpperCase()} color={typeColor} />
        {fund.restricted && <StatusBadge label="RESTRICTED" color="#1D9BF0" />}
        {fund.atRisk && <StatusBadge label="AT RISK" color="#EF4444" />}
      </View>

      {/* Balance Section */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Balance Breakdown</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: '#22C55E' }]}>
              {formatCurrency(fund.available)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Available</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: '#F59E0B' }]}>
              {formatCurrency(fund.committed)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Committed</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.textSecondary }]}>
              {formatCurrency(fund.spent)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Spent</ThemedText>
          </View>
        </View>
      </View>

      {/* Approval Threshold */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Approval Threshold</ThemedText>
        <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
          {formatCurrency(fund.approvalThreshold)}
        </ThemedText>
        <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>
          Amounts above this require elder approval
        </ThemedText>
      </View>

      {/* Owners */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Owners</ThemedText>
        {fund.owners.map((owner, i) => (
          <View key={`owner-${i}`} style={s.sheetListRow}>
            <IconSymbol name="person.fill" size={14} color={accentColor} />
            <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>{owner}</ThemedText>
          </View>
        ))}
      </View>

      {/* Linked Ministries */}
      {fund.linkedMinistries.length > 0 && (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Linked Ministries</ThemedText>
          <View style={s.ministriesGrid}>
            {fund.linkedMinistries.map((ministry, i) => (
              <View key={`min-${i}`} style={[s.ministryChip, { backgroundColor: accentColor + '12' }]}>
                <ThemedText style={[s.ministryChipText, { color: accentColor }]}>{ministry}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recent Requests */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Recent Requests ({fundRequests.length})
        </ThemedText>
        {fundRequests.map((req) => (
          <View key={req.id} style={s.sheetListRow}>
            <View style={[s.actionDot, { backgroundColor: REQUEST_STATUS_COLORS[req.status] }]} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {formatCurrency(req.amount)} — {EXPENSE_CATEGORY_LABELS[req.category] || req.category}
              </ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                {REQUEST_STATUS_LABELS[req.status]} — {req.requestedBy}
              </ThemedText>
            </View>
          </View>
        ))}
        {fundRequests.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No recent requests
          </ThemedText>
        )}
      </View>

      {/* Fund Rules */}
      {fund.restricted && (
        <View style={s.sheetSection}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Rules & Restrictions</ThemedText>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>
            Restricted fund — approval threshold: {formatCurrency(fund.approvalThreshold)}
          </ThemedText>
        </View>
      )}

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>Close</ThemedText>
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
  expense,
  colors,
  accentColor,
  funds,
}: {
  visible: boolean;
  onClose: () => void;
  expense: ExpenseEntry | null;
  colors: typeof Colors.light;
  accentColor: string;
  funds: ChurchFund[];
}) {
  if (!expense) return null;

  const catLabel = EXPENSE_CATEGORY_LABELS[expense.category] || expense.category;
  const catIcon = EXPENSE_CATEGORY_ICONS[expense.category] || 'dollarsign.circle.fill';
  const fund = funds.find((f) => f.type === expense.fund);
  const fundName = fund ? fund.name : FUND_TYPE_LABELS[expense.fund] || expense.fund;
  const fundColor = fund ? FUND_TYPE_COLORS[fund.type] : '#A1A1AA';
  const statusColor = REQUEST_STATUS_COLORS[expense.status as RequestStatus] || '#A1A1AA';
  const statusLabel = REQUEST_STATUS_LABELS[expense.status as RequestStatus] || expense.status;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={catLabel} useModal>
      {/* Status Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
        <StatusBadge label={fundName.toUpperCase()} color={fundColor} />
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatCurrency(expense.amount)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Amount</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatDate(expense.date)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Date</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{catLabel}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Category</ThemedText>
          </View>
          {expense.ministry && (
            <View style={s.sheetDetailItem}>
              <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{expense.ministry}</ThemedText>
              <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Ministry</ThemedText>
            </View>
          )}
        </View>
      </View>

      {/* Approved By */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Approval</ThemedText>
        <View style={s.approvalChainRow}>
          <View style={[s.approvalChainDot, { backgroundColor: '#22C55E' }]} />
          <View style={s.approvalChainTextCol}>
            <ThemedText style={[s.approvalChainName, { color: colors.text }]}>
              {expense.approvedBy}
            </ThemedText>
            <ThemedText style={[s.approvalChainStatus, { color: '#22C55E' }]}>
              Approved
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Receipt */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Receipt</ThemedText>
        <View style={s.auditEvidenceRow}>
          <IconSymbol
            name={expense.receiptAttached ? 'checkmark.circle.fill' : 'xmark.circle.fill'}
            size={16}
            color={expense.receiptAttached ? '#22C55E' : '#EF4444'}
          />
          <ThemedText
            style={[
              s.auditEvidenceText,
              { color: expense.receiptAttached ? '#22C55E' : '#EF4444' },
            ]}
          >
            {expense.receiptAttached ? 'Receipt attached' : 'No receipt attached'}
          </ThemedText>
        </View>
      </View>

      {/* Description */}
      {expense.description && (
        <View style={s.sheetSection}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Description</ThemedText>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>{expense.description}</ThemedText>
        </View>
      )}

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>Close</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function ChurchOrgFinance({ colors, accentColor, role = 'C1' }: Props) {
  // === RBAC Gate: C5 (Visitor/Public) and C4 (Member) locked ===
  if (role === 'C5' || role === 'C4') {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Finance</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          Finance information is not available for public access
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [selectedFund, setSelectedFund] = useState<ChurchFund | null>(null);
  const [fundSheetVisible, setFundSheetVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseEntry | null>(null);
  const [expenseSheetVisible, setExpenseSheetVisible] = useState(false);

  // === Data ===
  const data = useMemo(() => getChurchFinanceData(), []);

  // === Callbacks ===
  const handleSelectFund = useCallback((fund: ChurchFund) => {
    setSelectedFund(fund);
    setFundSheetVisible(true);
  }, []);

  const handleCloseFundSheet = useCallback(() => {
    setFundSheetVisible(false);
  }, []);

  const handleSelectExpense = useCallback((expense: ExpenseEntry) => {
    setSelectedExpense(expense);
    setExpenseSheetVisible(true);
  }, []);

  const handleCloseExpenseSheet = useCallback(() => {
    setExpenseSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleTabs = useMemo(() => {
    if (isElderLevel(role)) return SUB_TABS;
    if (isStaffLevel(role)) return SUB_TABS.filter(t => ['overview', 'budgets', 'expenses'].includes(t.id));
    return [];
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return <OverviewTab colors={colors} accentColor={accentColor} data={data} />;
      case 'budgets':
        return (
          <BudgetsTab
            colors={colors}
            accentColor={accentColor}
            budgets={data.budgets}
            funds={data.funds}
            role={role}
          />
        );
      case 'funds':
        if (!isElderLevel(role)) return null;
        return (
          <FundsTab
            colors={colors}
            accentColor={accentColor}
            funds={data.funds}
            onSelectFund={handleSelectFund}
          />
        );
      case 'commitments':
        if (!isElderLevel(role)) return null;
        return (
          <CommitmentsTab
            colors={colors}
            accentColor={accentColor}
            commitments={data.commitments}
            funds={data.funds}
          />
        );
      case 'expenses':
        return (
          <ExpensesTab
            colors={colors}
            accentColor={accentColor}
            expenses={data.expenses}
            funds={data.funds}
            role={role}
            onSelectExpense={handleSelectExpense}
          />
        );
      case 'approvals':
        if (!isElderLevel(role)) return null;
        return (
          <ApprovalsTab
            colors={colors}
            accentColor={accentColor}
            requests={data.requests}
            funds={data.funds}
          />
        );
      case 'reports':
        if (!isElderLevel(role)) return null;
        return (
          <ReportsTab
            colors={colors}
            accentColor={accentColor}
            reports={data.reports}
          />
        );
      case 'audit':
        if (!isElderLevel(role)) return null;
        return (
          <AuditTab
            colors={colors}
            accentColor={accentColor}
            auditEntries={data.auditTrail}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      {/* Sub-tab bar */}
      <SubTabBar
        tabs={visibleTabs}
        activeId={activeSubTab}
        onSelect={setActiveSubTab}
        accentColor={accentColor}
        colors={colors}
      />

      {/* Content */}
      <View style={s.contentContainer}>
        {renderContent()}
      </View>

      {/* Fund Detail Bottom Sheet */}
      <FundDetailSheet
        visible={fundSheetVisible}
        onClose={handleCloseFundSheet}
        fund={selectedFund}
        colors={colors}
        accentColor={accentColor}
        requests={data.requests}
      />

      {/* Expense Detail Bottom Sheet */}
      <ExpenseDetailSheet
        visible={expenseSheetVisible}
        onClose={handleCloseExpenseSheet}
        expense={selectedExpense}
        colors={colors}
        accentColor={accentColor}
        funds={data.funds}
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
  flex1: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },

  // -- Locked state --
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  lockedMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // -- Sub-tab bar --
  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  subTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
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
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: Spacing.md,
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

  // -- Progress bar --
  progressTrack: {
    height: 4,
    backgroundColor: '#2F3336',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },

  // -- Section Card --
  sectionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },

  // -- Health Grid (Overview) --
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  healthTile: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  healthTileValue: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
  healthTileLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },

  // -- Week Row (Overview) --
  weekRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  weekItem: {
    flex: 1,
    alignItems: 'center',
  },
  weekItemValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  weekItemLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },

  // -- Risk Warning --
  riskWarningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  riskWarningText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },

  // -- Fund Snapshot (Overview) --
  fundSnapshotCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  fundSnapshotTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  fundSnapshotName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  fundSnapshotValues: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  fundSnapshotValueItem: {
    flex: 1,
    alignItems: 'center',
  },
  fundSnapshotAmount: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  fundSnapshotAmountLabel: {
    fontSize: 10,
    marginTop: 1,
  },

  // -- Action Queue (Overview) --
  actionQueueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  actionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionQueueText: {
    fontSize: 13,
    flex: 1,
  },

  // -- Filter Chips --
  filterChipRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Budget Card --
  budgetCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  budgetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  budgetNameCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  budgetName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  budgetBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  budgetTotalCol: {
    alignItems: 'flex-end',
  },
  budgetTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  budgetTotalLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  budgetFundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  budgetFundText: {
    fontSize: 11,
  },
  budgetCategoryRow: {
    paddingVertical: Spacing.sm,
  },
  budgetCategoryNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  budgetCategoryName: {
    fontSize: 13,
    fontWeight: '500',
  },
  budgetCategoryCap: {
    fontSize: 11,
  },
  budgetCategoryValues: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  budgetCategoryValueText: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  varianceNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2F3336',
  },
  varianceNoteText: {
    fontSize: 11,
    flex: 1,
    fontStyle: 'italic',
  },

  // -- Fund Card (Funds tab) --
  fundCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  fundCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  fundIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fundNameCol: {
    flex: 1,
  },
  fundName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  fundBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  fundValuesRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  fundValueItem: {
    flex: 1,
    alignItems: 'center',
  },
  fundValueAmount: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  fundValueLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  fundMetaRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: 4,
  },
  fundMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fundMetaText: {
    fontSize: 11,
    flex: 1,
  },

  // -- Commitment Card --
  commitmentCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  commitmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commitmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  commitmentAmount: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginBottom: Spacing.sm,
  },
  commitmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: 6,
  },
  commitmentMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commitmentMetaText: {
    fontSize: 11,
  },
  commitmentPayee: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  commitmentPayeeText: {
    fontSize: 12,
  },
  readyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  readyText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // -- Expense Row --
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  expenseIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseTextCol: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  expenseBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  expenseMinistry: {
    fontSize: 10,
  },
  expenseDate: {
    fontSize: 10,
    marginTop: 2,
  },
  expenseRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Approval Card --
  approvalCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  approvalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  approvalAmount: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  approvalBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  approvalMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  approvalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  approvalMetaText: {
    fontSize: 11,
  },
  missingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
  missingText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },

  // -- Report Card --
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  reportIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportTextCol: {
    flex: 1,
  },
  reportName: {
    fontSize: 14,
    fontWeight: '600',
  },
  reportBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  reportMeta: {
    marginTop: 4,
  },
  reportMetaText: {
    fontSize: 10,
  },
  exportButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  exportButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Audit Card --
  auditCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  auditTimeline: {
    alignItems: 'center',
    width: 20,
    marginRight: Spacing.sm,
  },
  auditDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  auditLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  auditContent: {
    flex: 1,
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  auditAction: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  auditMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: 4,
  },
  auditMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  auditMetaText: {
    fontSize: 11,
  },
  auditEntityRef: {
    fontSize: 11,
    marginBottom: 4,
  },
  auditEvidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  auditEvidenceText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // -- Bottom Sheet --
  sheetBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  sheetSection: {
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  sheetDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  sheetDetailItem: {
    width: '45%',
  },
  sheetDetailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  sheetDetailLabel: {
    fontSize: 11,
    marginTop: 1,
  },
  sheetListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  sheetListTextCol: {
    flex: 1,
  },
  sheetListTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  sheetListSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  sheetEmptyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  ministriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  ministryChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  ministryChipText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // -- Approval Chain (Expense Detail Sheet) --
  approvalChainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  approvalChainDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  approvalChainTextCol: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  approvalChainName: {
    fontSize: 13,
    fontWeight: '500',
  },
  approvalChainStatus: {
    fontSize: 11,
    fontWeight: '600',
  },

  // -- Sheet Actions --
  sheetActions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
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
