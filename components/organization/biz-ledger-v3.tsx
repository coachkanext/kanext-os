/**
 * Business Organization Ledger Tab -- V3
 * 3-pill ViewBar: Transactions | Pending | Receipts
 * KaNeXT founder view. All data inline.
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

type ViewMode = 'transactions' | 'pending' | 'receipts';
type TxnFilter = 'All' | 'Income' | 'Expense' | 'Payroll' | 'Legal' | 'Infrastructure' | 'Investment';

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// INLINE DATA
// =============================================================================

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: 'transactions', label: 'Transactions' },
  { id: 'pending', label: 'Pending' },
  { id: 'receipts', label: 'Receipts' },
];

const TXN_FILTERS: TxnFilter[] = ['All', 'Income', 'Expense', 'Payroll', 'Legal', 'Infrastructure', 'Investment'];

const TRANSACTIONS = [
  { id: 'tx1', description: 'Velocity Ventures - SAFE Wire', amount: 350_000, type: 'income' as const, category: 'Investment' as TxnFilter, date: 'Jan 15, 2025', entity: 'OSK Group LLC' },
  { id: 'tx2', description: 'January Payroll', amount: 28_000, type: 'expense' as const, category: 'Payroll' as TxnFilter, date: 'Jan 31, 2025', entity: 'KaNeXT Operations LLC' },
  { id: 'tx3', description: 'AWS Infrastructure - January', amount: 1_200, type: 'expense' as const, category: 'Infrastructure' as TxnFilter, date: 'Feb 1, 2025', entity: 'KaNeXT Operations LLC' },
  { id: 'tx4', description: 'Mitchell & Associates - IP Filing', amount: 3_500, type: 'expense' as const, category: 'Legal' as TxnFilter, date: 'Feb 5, 2025', entity: 'KaNeXT IP Holdings LLC' },
  { id: 'tx5', description: 'Dr. Patricia Moore - SAFE Wire', amount: 250_000, type: 'income' as const, category: 'Investment' as TxnFilter, date: 'Jun 20, 2024', entity: 'OSK Group LLC' },
  { id: 'tx6', description: 'February Payroll', amount: 28_000, type: 'expense' as const, category: 'Payroll' as TxnFilter, date: 'Feb 28, 2025', entity: 'KaNeXT Operations LLC' },
  { id: 'tx7', description: 'WeWork Miami - February', amount: 800, type: 'expense' as const, category: 'Expense' as TxnFilter, date: 'Feb 1, 2025', entity: 'KaNeXT Operations LLC' },
  { id: 'tx8', description: 'OpenAI API - February', amount: 200, type: 'expense' as const, category: 'Infrastructure' as TxnFilter, date: 'Feb 3, 2025', entity: 'KaNeXT Operations LLC' },
];

const PENDING = [
  { id: 'pd1', description: 'Sofia Reyes - Contractor Invoice (Feb)', amount: 4_500, category: 'Expense', dueDate: 'Mar 5, 2025', from: 'Sofia Reyes', status: 'awaiting_approval' as const },
  { id: 'pd2', description: 'Legal Retainer Renewal - Q2', amount: 3_000, category: 'Legal', dueDate: 'Mar 15, 2025', from: 'Mitchell & Associates', status: 'awaiting_approval' as const },
  { id: 'pd3', description: 'MacBook Air M3 - New Engineer', amount: 1_299, category: 'Expense', dueDate: 'Mar 20, 2025', from: 'Marcus Chen (CTO)', status: 'awaiting_approval' as const },
];

const RECEIPTS = [
  // February
  { id: 'rc1', description: 'AWS Infrastructure', amount: 1_200, date: 'Feb 1, 2025', month: 'February 2025' },
  { id: 'rc2', description: 'WeWork Miami', amount: 800, date: 'Feb 1, 2025', month: 'February 2025' },
  { id: 'rc3', description: 'OpenAI API', amount: 200, date: 'Feb 3, 2025', month: 'February 2025' },
  // January
  { id: 'rc4', description: 'January Payroll', amount: 28_000, date: 'Jan 31, 2025', month: 'January 2025' },
  { id: 'rc5', description: 'Velocity Ventures SAFE Wire', amount: 350_000, date: 'Jan 15, 2025', month: 'January 2025' },
  { id: 'rc6', description: 'Mitchell & Associates - IP Filing', amount: 3_500, date: 'Jan 22, 2025', month: 'January 2025' },
];

const CATEGORY_COLORS: Record<string, string> = {
  Investment: '#8B5CF6',
  Payroll: '#3B82F6',
  Infrastructure: '#14B8A6',
  Legal: '#6366F1',
  Expense: '#F59E0B',
  Income: '#22C55E',
};

const PENDING_STATUS_COLORS: Record<string, string> = {
  awaiting_approval: '#F59E0B',
  approved: '#22C55E',
  rejected: '#EF4444',
};

const PENDING_STATUS_LABELS: Record<string, string> = {
  awaiting_approval: 'AWAITING APPROVAL',
  approved: 'APPROVED',
  rejected: 'REJECTED',
};

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US');
}

// =============================================================================
// COMPONENT
// =============================================================================

export function BizLedger({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewMode>('transactions');
  const [activeFilter, setActiveFilter] = useState<TxnFilter>('All');

  const handleViewPress = useCallback((id: ViewMode) => {
    Haptics.selectionAsync();
    setActiveView(id);
  }, []);

  const handleFilterPress = useCallback((filter: TxnFilter) => {
    Haptics.selectionAsync();
    setActiveFilter(filter);
  }, []);

  const filteredTransactions = activeFilter === 'All'
    ? TRANSACTIONS
    : TRANSACTIONS.filter((t) => t.category === activeFilter || (activeFilter === 'Income' && t.type === 'income') || (activeFilter === 'Expense' && t.type === 'expense' && t.category === 'Expense'));

  // Group receipts by month
  const receiptsByMonth: Record<string, typeof RECEIPTS> = {};
  RECEIPTS.forEach((r) => {
    if (!receiptsByMonth[r.month]) receiptsByMonth[r.month] = [];
    receiptsByMonth[r.month].push(r);
  });

  // ---------------------------------------------------------------------------
  // TRANSACTIONS
  // ---------------------------------------------------------------------------
  const renderTransactions = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Filter pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={s.filterRow}>
        {TXN_FILTERS.map((filter) => {
          const isActive = filter === activeFilter;
          return (
            <Pressable
              key={filter}
              style={[s.filterPill, { backgroundColor: isActive ? accentColor : 'rgba(255,255,255,0.08)' }]}
              onPress={() => handleFilterPress(filter)}
            >
              <ThemedText style={[s.filterPillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {filter}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Summary */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: Spacing.sm }]}>
        <View style={s.txnSummaryRow}>
          <View style={s.txnSummaryItem}>
            <ThemedText style={[s.txnSummaryValue, { color: '#22C55E' }]}>
              {formatCurrency(TRANSACTIONS.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0))}
            </ThemedText>
            <ThemedText style={[s.txnSummaryLabel, { color: colors.textSecondary }]}>Total Income</ThemedText>
          </View>
          <View style={s.txnSummaryItem}>
            <ThemedText style={[s.txnSummaryValue, { color: '#EF4444' }]}>
              {formatCurrency(TRANSACTIONS.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0))}
            </ThemedText>
            <ThemedText style={[s.txnSummaryLabel, { color: colors.textSecondary }]}>Total Expense</ThemedText>
          </View>
        </View>
      </View>

      {/* Transaction list */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: Spacing.md }]}>
        TRANSACTIONS ({filteredTransactions.length})
      </ThemedText>
      {filteredTransactions.map((txn) => {
        const isIncome = txn.type === 'income';
        const catColor = CATEGORY_COLORS[txn.category] ?? colors.textSecondary;
        return (
          <View key={txn.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}>
            <View style={s.txnRow}>
              <View style={[s.txnDot, { backgroundColor: isIncome ? '#22C55E' : '#EF4444' }]} />
              <View style={s.txnInfo}>
                <ThemedText style={[s.txnDescription, { color: colors.text }]} numberOfLines={2}>{txn.description}</ThemedText>
                <View style={s.txnBadges}>
                  <View style={[s.catBadge, { backgroundColor: catColor + '20' }]}>
                    <ThemedText style={[s.catBadgeText, { color: catColor }]}>{txn.category.toUpperCase()}</ThemedText>
                  </View>
                </View>
              </View>
              <View style={s.txnAmountCol}>
                <ThemedText style={[s.txnAmount, { color: isIncome ? '#22C55E' : '#EF4444' }]}>
                  {isIncome ? '+' : '-'}{formatCurrency(txn.amount)}
                </ThemedText>
                <ThemedText style={[s.txnTypeLabel, { color: isIncome ? '#22C55E' : '#EF4444' }]}>
                  {isIncome ? 'INCOME' : 'EXPENSE'}
                </ThemedText>
              </View>
            </View>
            <View style={[s.txnFooter, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
              <ThemedText style={[s.txnEntity, { color: colors.textSecondary }]} numberOfLines={1}>{txn.entity}</ThemedText>
              <ThemedText style={[s.txnDate, { color: colors.textTertiary }]}>{txn.date}</ThemedText>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  // ---------------------------------------------------------------------------
  // PENDING
  // ---------------------------------------------------------------------------
  const renderPending = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>PENDING ITEMS ({PENDING.length})</ThemedText>
      {PENDING.map((item) => {
        const stColor = PENDING_STATUS_COLORS[item.status];
        const stLabel = PENDING_STATUS_LABELS[item.status];
        const catColor = CATEGORY_COLORS[item.category] ?? colors.textSecondary;
        return (
          <View key={item.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}>
            <View style={s.pendingHeader}>
              <View style={s.pendingInfo}>
                <ThemedText style={[s.pendingDescription, { color: colors.text }]}>{item.description}</ThemedText>
                <ThemedText style={[s.pendingFrom, { color: colors.textSecondary }]}>From: {item.from}</ThemedText>
              </View>
              <ThemedText style={[s.pendingAmount, { color: '#F59E0B' }]}>{formatCurrency(item.amount)}</ThemedText>
            </View>

            <View style={s.pendingBadges}>
              <View style={[s.catBadge, { backgroundColor: catColor + '20' }]}>
                <ThemedText style={[s.catBadgeText, { color: catColor }]}>{item.category.toUpperCase()}</ThemedText>
              </View>
              <View style={[s.statusBadge, { backgroundColor: stColor + '20' }]}>
                <ThemedText style={[s.statusBadgeText, { color: stColor }]}>{stLabel}</ThemedText>
              </View>
            </View>

            <View style={[s.pendingFooter, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
              <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.pendingDue, { color: colors.textSecondary }]}>Due: {item.dueDate}</ThemedText>
            </View>

            {/* Action buttons */}
            <View style={s.pendingActions}>
              <Pressable
                style={[s.actionBtn, { backgroundColor: '#22C55E15' }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="checkmark" size={14} color="#22C55E" />
                <ThemedText style={[s.actionBtnText, { color: '#22C55E' }]}>Approve</ThemedText>
              </Pressable>
              <Pressable
                style={[s.actionBtn, { backgroundColor: '#EF444415' }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="xmark" size={14} color="#EF4444" />
                <ThemedText style={[s.actionBtnText, { color: '#EF4444' }]}>Decline</ThemedText>
              </Pressable>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  // ---------------------------------------------------------------------------
  // RECEIPTS
  // ---------------------------------------------------------------------------
  const renderReceipts = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {Object.entries(receiptsByMonth).map(([month, receipts]) => (
        <View key={month}>
          <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>{month.toUpperCase()}</ThemedText>
          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.md }]}>
            {receipts.map((receipt, idx) => (
              <View
                key={receipt.id}
                style={[
                  s.receiptRow,
                  idx < receipts.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <IconSymbol name="doc.fill" size={16} color={colors.textTertiary} />
                <View style={s.receiptInfo}>
                  <ThemedText style={[s.receiptDescription, { color: colors.text }]}>{receipt.description}</ThemedText>
                  <ThemedText style={[s.receiptDate, { color: colors.textSecondary }]}>{receipt.date}</ThemedText>
                </View>
                <ThemedText style={[s.receiptAmount, { color: colors.text }]}>{formatCurrency(receipt.amount)}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      ))}
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
                { backgroundColor: isActive ? accentColor : 'rgba(255,255,255,0.08)' },
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
      {activeView === 'transactions' && renderTransactions()}
      {activeView === 'pending' && renderPending()}
      {activeView === 'receipts' && renderReceipts()}
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

  // Category badge
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  catBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Filters
  filterRow: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Transaction summary
  txnSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  txnSummaryItem: {
    alignItems: 'center',
  },
  txnSummaryValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  txnSummaryLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // Transaction row
  txnRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  txnDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  txnInfo: {
    flex: 1,
  },
  txnDescription: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    marginBottom: 4,
  },
  txnBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  txnAmountCol: {
    alignItems: 'flex-end',
  },
  txnAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  txnTypeLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  txnFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  txnEntity: {
    fontSize: 12,
    flex: 1,
  },
  txnDate: {
    fontSize: 12,
  },

  // Pending
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  pendingInfo: {
    flex: 1,
  },
  pendingDescription: {
    fontSize: 14,
    fontWeight: '600',
  },
  pendingFrom: {
    fontSize: 12,
    marginTop: 2,
  },
  pendingAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  pendingBadges: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  pendingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: Spacing.sm,
  },
  pendingDue: {
    fontSize: 12,
  },
  pendingActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Receipts
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  receiptInfo: {
    flex: 1,
  },
  receiptDescription: {
    fontSize: 13,
    fontWeight: '500',
  },
  receiptDate: {
    fontSize: 11,
    marginTop: 2,
  },
  receiptAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
