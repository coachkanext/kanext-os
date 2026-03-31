/**
 * Finance Hub v2
 * Full finance workspace with pill nav: Home | Budget | Transactions | Invoices | Reports
 * Mode-aware — renders mode-specific data from mock-finance.
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMode } from '@/context/app-context';
import {
  FINANCE_BUDGETS,
  FINANCE_TRANSACTIONS,
  FINANCE_INVOICES,
  FINANCE_SNAPSHOTS,
} from '@/data/mock-finance';
import type { BudgetCategory, Transaction, Invoice } from '@/data/mock-finance';

// =============================================================================
// CONSTANTS
// =============================================================================

const TABS = ['Home', 'Budget', 'Transactions', 'Invoices', 'Reports'] as const;
type TabName = (typeof TABS)[number];

const TX_FILTERS = ['All', 'Income', 'Expense'] as const;
type TxFilter = (typeof TX_FILTERS)[number];

const INVOICE_FILTERS = ['All', 'Pending', 'Paid', 'Overdue'] as const;
type InvoiceFilter = (typeof INVOICE_FILTERS)[number];

const BUDGET_STATUS_COLORS: Record<string, string> = {
  'on-track': '#5A8A6E',
  'warning': '#B8943E',
  'over-budget': '#B85C5C',
};

const INVOICE_STATUS_COLORS: Record<string, string> = {
  paid: '#5A8A6E',
  pending: '#B8943E',
  overdue: '#B85C5C',
  draft: '#9C9790',
};

const TX_STATUS_COLORS: Record<string, string> = {
  completed: '#5A8A6E',
  pending: '#B8943E',
  failed: '#B85C5C',
};

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

function formatCurrencyFull(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function FinanceHub() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const mode = useMode();

  const [activeTab, setActiveTab] = useState<TabName>('Home');
  const [txFilter, setTxFilter] = useState<TxFilter>('All');
  const [invoiceFilter, setInvoiceFilter] = useState<InvoiceFilter>('All');

  const budgets = FINANCE_BUDGETS[mode];
  const transactions = FINANCE_TRANSACTIONS[mode];
  const invoices = FINANCE_INVOICES[mode];
  const snapshot = FINANCE_SNAPSHOTS[mode];

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    if (txFilter === 'All') return transactions;
    return transactions.filter((t) => t.type === txFilter.toLowerCase());
  }, [transactions, txFilter]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    if (invoiceFilter === 'All') return invoices;
    return invoices.filter((inv) => inv.status === invoiceFilter.toLowerCase());
  }, [invoices, invoiceFilter]);

  // Recent transactions for home view (last 5)
  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

  // Pending invoices for home view
  const pendingInvoices = useMemo(
    () => invoices.filter((inv) => inv.status === 'pending' || inv.status === 'overdue'),
    [invoices],
  );

  // Budget totals
  const budgetTotals = useMemo(() => {
    const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    return { totalAllocated, totalSpent };
  }, [budgets]);

  return (
    <View style={styles.container}>
      {/* Pill Nav */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? '#fff' : colors.backgroundTertiary,
                  borderColor: isActive ? '#fff' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab);
              }}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {tab}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content */}
      {activeTab === 'Home' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Snapshot Row */}
          <View style={styles.snapshotRow}>
            <FinanceMetricCard label="Total Budget" value={formatCurrency(snapshot.totalBudget)} colors={colors} icon="chart.bar.fill" />
            <FinanceMetricCard label="Total Spent" value={formatCurrency(snapshot.totalSpent)} colors={colors} icon="arrow.down.circle.fill" />
            <FinanceMetricCard label="Total Income" value={formatCurrency(snapshot.totalIncome)} colors={colors} icon="arrow.up.circle.fill" />
            <FinanceMetricCard label="Outstanding" value={String(snapshot.outstandingInvoices)} colors={colors} icon="doc.text.fill" />
          </View>

          {/* Budget Health Bar */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              BUDGET HEALTH
            </ThemedText>
            <View style={[styles.healthBarContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.healthBarLabels}>
                <ThemedText style={[styles.healthBarLabel, { color: colors.textSecondary }]}>
                  Spent: {formatCurrencyFull(budgetTotals.totalSpent)}
                </ThemedText>
                <ThemedText style={[styles.healthBarLabel, { color: colors.textSecondary }]}>
                  Budget: {formatCurrencyFull(budgetTotals.totalAllocated)}
                </ThemedText>
              </View>
              <View style={[styles.healthBarTrack, { backgroundColor: colors.backgroundTertiary }]}>
                <View
                  style={[
                    styles.healthBarFill,
                    {
                      width: `${Math.min((budgetTotals.totalSpent / budgetTotals.totalAllocated) * 100, 100)}%`,
                      backgroundColor:
                        budgetTotals.totalSpent / budgetTotals.totalAllocated > 0.9
                          ? '#B85C5C'
                          : budgetTotals.totalSpent / budgetTotals.totalAllocated > 0.75
                            ? '#B8943E'
                            : '#5A8A6E',
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Recent Transactions */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              RECENT TRANSACTIONS
            </ThemedText>
            {recentTransactions.map((tx) => (
              <TransactionCard key={tx.id} transaction={tx} colors={colors} />
            ))}
          </View>

          {/* Pending Invoices */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              PENDING INVOICES
            </ThemedText>
            {pendingInvoices.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No pending invoices
                </ThemedText>
              </View>
            ) : (
              pendingInvoices.map((inv) => (
                <InvoiceCard key={inv.id} invoice={inv} colors={colors} />
              ))
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {activeTab === 'Budget' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={{ marginTop: Spacing.md }}>
            {budgets.map((category) => (
              <BudgetCategoryCard key={category.id} category={category} colors={colors} />
            ))}
          </View>

          {/* Total Row */}
          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <ThemedText style={[styles.totalLabel, { color: colors.text }]}>Total</ThemedText>
            <View style={styles.totalValues}>
              <ThemedText style={[styles.totalValue, { color: colors.textSecondary }]}>
                {formatCurrencyFull(budgetTotals.totalAllocated)}
              </ThemedText>
              <ThemedText style={[styles.totalSpent, { color: colors.text }]}>
                {formatCurrencyFull(budgetTotals.totalSpent)} spent
              </ThemedText>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {activeTab === 'Transactions' && (
        <View style={styles.content}>
          {/* Transaction Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {TX_FILTERS.map((filter) => {
              const isActive = txFilter === filter;
              return (
                <Pressable
                  key={filter}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: isActive ? '#fff' : colors.backgroundTertiary,
                      borderColor: isActive ? '#fff' : colors.border,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setTxFilter(filter);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.filterPillText,
                      { color: isActive ? '#000' : colors.textSecondary },
                    ]}
                  >
                    {filter}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>

          <FlatList
            data={filteredTransactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TransactionCard transaction={item} colors={colors} />}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {activeTab === 'Invoices' && (
        <View style={styles.content}>
          {/* Invoice Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {INVOICE_FILTERS.map((filter) => {
              const isActive = invoiceFilter === filter;
              return (
                <Pressable
                  key={filter}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: isActive ? '#fff' : colors.backgroundTertiary,
                      borderColor: isActive ? '#fff' : colors.border,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setInvoiceFilter(filter);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.filterPillText,
                      { color: isActive ? '#000' : colors.textSecondary },
                    ]}
                  >
                    {filter}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>

          <FlatList
            data={filteredInvoices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <InvoiceCard invoice={item} colors={colors} />}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {activeTab === 'Reports' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={{ marginTop: Spacing.md }}>
            <ReportSummaryCard
              title="Monthly Trend"
              subtitle="Revenue vs. expenses over the last 6 months"
              value={formatCurrency(snapshot.totalIncome)}
              valueLabel="Total Income"
              colors={colors}
              icon="chart.line.uptrend.xyaxis"
            />
            <ReportSummaryCard
              title="Category Breakdown"
              subtitle={`${budgets.length} categories tracked`}
              value={`${budgets.filter((b) => b.status === 'on-track').length}/${budgets.length}`}
              valueLabel="On Track"
              colors={colors}
              icon="chart.pie.fill"
            />
            <ReportSummaryCard
              title="Cash Flow Status"
              subtitle="Net cash position for the current period"
              value={formatCurrency(snapshot.totalIncome - snapshot.totalSpent)}
              valueLabel="Net Position"
              colors={colors}
              icon="arrow.left.arrow.right"
              positive={snapshot.totalIncome >= snapshot.totalSpent}
            />
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function FinanceMetricCard({
  label,
  value,
  colors,
  icon,
}: {
  label: string;
  value: string;
  colors: typeof Colors.light;
  icon: string;
}) {
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <IconSymbol name={icon as any} size={14} color={colors.textSecondary} />
      <ThemedText style={[styles.metricValue, { color: colors.text }]}>{value}</ThemedText>
      <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

function TransactionCard({
  transaction,
  colors,
}: {
  transaction: Transaction;
  colors: typeof Colors.light;
}) {
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? '#5A8A6E' : '#B85C5C';
  const statusColor = TX_STATUS_COLORS[transaction.status] || colors.textSecondary;

  return (
    <View style={[styles.txCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.txIndicator, { backgroundColor: amountColor }]} />
      <View style={styles.txContent}>
        <View style={styles.txHeader}>
          <ThemedText style={[styles.txDescription, { color: colors.text }]} numberOfLines={1}>
            {transaction.description}
          </ThemedText>
          <ThemedText style={[styles.txAmount, { color: amountColor }]}>
            {isIncome ? '+' : '-'}{formatCurrencyFull(transaction.amount)}
          </ThemedText>
        </View>
        <View style={styles.txFooter}>
          <ThemedText style={[styles.txDate, { color: colors.textTertiary }]}>
            {transaction.date}
          </ThemedText>
          {transaction.vendor && (
            <ThemedText style={[styles.txVendor, { color: colors.textSecondary }]}>
              {transaction.vendor}
            </ThemedText>
          )}
          <View style={[styles.txStatusBadge, { backgroundColor: statusColor + '20' }]}>
            <ThemedText style={[styles.txStatusText, { color: statusColor }]}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

function BudgetCategoryCard({
  category,
  colors,
}: {
  category: BudgetCategory;
  colors: typeof Colors.light;
}) {
  const statusColor = BUDGET_STATUS_COLORS[category.status];
  const progress = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0;

  return (
    <View style={[styles.budgetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.budgetHeader}>
        <ThemedText style={[styles.budgetName, { color: colors.text }]}>{category.name}</ThemedText>
        <View style={[styles.budgetStatusBadge, { backgroundColor: statusColor + '20' }]}>
          <ThemedText style={[styles.budgetStatusText, { color: statusColor }]}>
            {category.status === 'on-track' ? 'On Track' : category.status === 'over-budget' ? 'Over Budget' : 'Warning'}
          </ThemedText>
        </View>
      </View>
      <View style={[styles.budgetBar, { backgroundColor: colors.backgroundTertiary }]}>
        <View
          style={[
            styles.budgetBarFill,
            {
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: statusColor,
            },
          ]}
        />
      </View>
      <View style={styles.budgetFooter}>
        <ThemedText style={[styles.budgetSpent, { color: colors.textSecondary }]}>
          {formatCurrencyFull(category.spent)} / {formatCurrencyFull(category.allocated)}
        </ThemedText>
        <ThemedText style={[styles.budgetRemaining, { color: colors.text }]}>
          {formatCurrencyFull(category.remaining)} left
        </ThemedText>
      </View>
    </View>
  );
}

function InvoiceCard({
  invoice,
  colors,
}: {
  invoice: Invoice;
  colors: typeof Colors.light;
}) {
  const statusColor = INVOICE_STATUS_COLORS[invoice.status];

  return (
    <View style={[styles.invoiceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.invoiceHeader}>
        <ThemedText style={[styles.invoiceRecipient, { color: colors.text }]} numberOfLines={1}>
          {invoice.recipient}
        </ThemedText>
        <View style={[styles.invoiceStatusBadge, { backgroundColor: statusColor + '20' }]}>
          <ThemedText style={[styles.invoiceStatusText, { color: statusColor }]}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </ThemedText>
        </View>
      </View>
      <ThemedText style={[styles.invoiceDesc, { color: colors.textSecondary }]} numberOfLines={1}>
        {invoice.description}
      </ThemedText>
      <View style={styles.invoiceFooter}>
        <ThemedText style={[styles.invoiceDue, { color: colors.textTertiary }]}>
          Due: {invoice.dueDate}
        </ThemedText>
        <ThemedText style={[styles.invoiceAmount, { color: colors.text }]}>
          {formatCurrencyFull(invoice.amount)}
        </ThemedText>
      </View>
    </View>
  );
}

function ReportSummaryCard({
  title,
  subtitle,
  value,
  valueLabel,
  colors,
  icon,
  positive,
}: {
  title: string;
  subtitle: string;
  value: string;
  valueLabel: string;
  colors: typeof Colors.light;
  icon: string;
  positive?: boolean;
}) {
  return (
    <View style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.reportHeader}>
        <IconSymbol name={icon as any} size={18} color={colors.textSecondary} />
        <ThemedText style={[styles.reportTitle, { color: colors.text }]}>{title}</ThemedText>
      </View>
      <ThemedText style={[styles.reportSubtitle, { color: colors.textSecondary }]}>
        {subtitle}
      </ThemedText>
      <View style={styles.reportValueRow}>
        <ThemedText
          style={[
            styles.reportValue,
            { color: positive !== undefined ? (positive ? '#5A8A6E' : '#B85C5C') : colors.text },
          ]}
        >
          {value}
        </ThemedText>
        <ThemedText style={[styles.reportValueLabel, { color: colors.textTertiary }]}>
          {valueLabel}
        </ThemedText>
      </View>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pillRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 8,
  },
  pill: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },

  // Snapshot / Metric
  snapshotRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.md,
  },
  metricCard: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // Health Bar
  healthBarContainer: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  healthBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  healthBarLabel: {
    fontSize: 12,
  },
  healthBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: 8,
    borderRadius: 4,
  },

  // Transaction
  txCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  txIndicator: {
    width: 4,
  },
  txContent: {
    flex: 1,
    padding: Spacing.md,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  txDescription: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  txFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 10,
  },
  txDate: {
    fontSize: 11,
  },
  txVendor: {
    fontSize: 11,
  },
  txStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  txStatusText: {
    fontSize: 9,
    fontWeight: '700',
  },

  // Budget Category
  budgetCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: 8,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetName: {
    fontSize: 14,
    fontWeight: '600',
  },
  budgetStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  budgetStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  budgetBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  budgetBarFill: {
    height: 6,
    borderRadius: 3,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetSpent: {
    fontSize: 12,
  },
  budgetRemaining: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Total Row
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  totalValues: {
    alignItems: 'flex-end',
  },
  totalValue: {
    fontSize: 13,
  },
  totalSpent: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Invoice
  invoiceCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: 8,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  invoiceRecipient: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  invoiceStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  invoiceStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  invoiceDesc: {
    fontSize: 12,
    marginTop: 4,
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  invoiceDue: {
    fontSize: 11,
  },
  invoiceAmount: {
    fontSize: 15,
    fontWeight: '700',
  },

  // Reports
  reportCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: 8,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  reportSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  reportValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  reportValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  reportValueLabel: {
    fontSize: 12,
  },

  // Filter pills
  filterRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    gap: 8,
  },
  filterPill: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Empty state
  emptyState: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
