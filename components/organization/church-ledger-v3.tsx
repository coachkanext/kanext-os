/**
 * Church Ledger V3 — ICCLA · Senior Pastor
 * ViewBar: Transactions | Pending | Receipts
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

type ViewId = 'transactions' | 'pending' | 'receipts';

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// VIEWS
// =============================================================================

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'transactions', label: 'Transactions' },
  { id: 'pending', label: 'Pending' },
  { id: 'receipts', label: 'Receipts' },
];

// =============================================================================
// MOCK DATA
// =============================================================================

type TransactionCategory = 'Tithes' | 'Offerings' | 'Designated' | 'Expense' | 'Payroll' | 'Missions' | 'Vendor';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: TransactionCategory;
  date: string;
  reference: string;
}

const TRANSACTIONS: Transaction[] = [
  { id: 'tx1', description: 'Sunday Tithes & Offerings Deposit', amount: 4250, type: 'credit', category: 'Tithes', date: 'Feb 16, 2025', reference: 'DEP-2025-0216' },
  { id: 'tx2', description: 'Staff Payroll — February', amount: 10000, type: 'debit', category: 'Payroll', date: 'Feb 14, 2025', reference: 'PAY-2025-0214' },
  { id: 'tx3', description: 'Missions Wire — Kenya Partner Church', amount: 2500, type: 'debit', category: 'Missions', date: 'Feb 12, 2025', reference: 'WIR-2025-0212' },
  { id: 'tx4', description: 'Building Fund Designated Gift', amount: 5000, type: 'credit', category: 'Designated', date: 'Feb 10, 2025', reference: 'DEP-2025-0210' },
  { id: 'tx5', description: 'Vendor Payment — Cleaning Services', amount: 850, type: 'debit', category: 'Vendor', date: 'Feb 8, 2025', reference: 'VND-2025-0208' },
  { id: 'tx6', description: 'Sunday Offerings Deposit', amount: 3800, type: 'credit', category: 'Offerings', date: 'Feb 9, 2025', reference: 'DEP-2025-0209' },
  { id: 'tx7', description: 'Utility Payment — Electricity & Gas', amount: 1200, type: 'debit', category: 'Expense', date: 'Feb 5, 2025', reference: 'EXP-2025-0205' },
  { id: 'tx8', description: 'Youth Camp Registration Fees', amount: 1500, type: 'credit', category: 'Designated', date: 'Feb 3, 2025', reference: 'DEP-2025-0203' },
];

type TxFilterKey = 'All' | TransactionCategory;

const TX_FILTERS: TxFilterKey[] = ['All', 'Tithes', 'Offerings', 'Designated', 'Expense', 'Payroll', 'Missions', 'Vendor'];

interface PendingItem {
  id: string;
  title: string;
  amount: number;
  type: 'debit' | 'credit';
  requestedBy: string;
  status: 'Awaiting Approval' | 'Processing' | 'Awaiting Documentation';
  submittedDate: string;
}

const PENDING_ITEMS: PendingItem[] = [
  { id: 'pd1', title: 'Sound Equipment — Vendor Payment', amount: 4500, type: 'debit', requestedBy: 'Min. Sarah Okonkwo', status: 'Awaiting Approval', submittedDate: 'Feb 15, 2025' },
  { id: 'pd2', title: 'Outreach Supplies Reimbursement', amount: 320, type: 'debit', requestedBy: 'Bro. Michael Osei', status: 'Processing', submittedDate: 'Feb 13, 2025' },
  { id: 'pd3', title: 'Designated Gift Processing', amount: 2000, type: 'credit', requestedBy: 'Admin', status: 'Awaiting Documentation', submittedDate: 'Feb 14, 2025' },
];

interface Receipt {
  id: string;
  description: string;
  amount: number;
  date: string;
  month: string;
  reference: string;
  type: 'Income' | 'Expense';
}

const RECEIPTS: Receipt[] = [
  { id: 'rc1', description: 'Sunday Tithes Deposit Receipt', amount: 4250, date: 'Feb 16, 2025', month: 'February 2025', reference: 'RCT-2025-0216', type: 'Income' },
  { id: 'rc2', description: 'Payroll Processing Receipt', amount: 10000, date: 'Feb 14, 2025', month: 'February 2025', reference: 'RCT-2025-0214', type: 'Expense' },
  { id: 'rc3', description: 'Missions Wire Confirmation', amount: 2500, date: 'Feb 12, 2025', month: 'February 2025', reference: 'RCT-2025-0212', type: 'Expense' },
  { id: 'rc4', description: 'Cleaning Services Invoice', amount: 850, date: 'Feb 8, 2025', month: 'February 2025', reference: 'RCT-2025-0208', type: 'Expense' },
  { id: 'rc5', description: 'Utility Payment Confirmation', amount: 1200, date: 'Feb 5, 2025', month: 'February 2025', reference: 'RCT-2025-0205', type: 'Expense' },
  { id: 'rc6', description: 'January Tithes Summary', amount: 16500, date: 'Jan 31, 2025', month: 'January 2025', reference: 'RCT-2025-0131', type: 'Income' },
];

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US');
}

const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  Tithes: '#22C55E',
  Offerings: '#6AA9FF',
  Designated: '#A78BFA',
  Expense: '#F59E0B',
  Payroll: '#EC4899',
  Missions: '#14B8A6',
  Vendor: '#8F8F8F',
};

const PENDING_STATUS_COLORS: Record<string, string> = {
  'Awaiting Approval': '#F59E0B',
  Processing: '#6AA9FF',
  'Awaiting Documentation': '#EF4444',
};

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
// TRANSACTIONS VIEW
// =============================================================================

function TransactionsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const [filter, setFilter] = useState<TxFilterKey>('All');

  const filtered = TRANSACTIONS.filter((tx) => {
    if (filter === 'All') return true;
    return tx.category === filter;
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
        style={{ flexGrow: 0 }}
      >
        {TX_FILTERS.map((f) => {
          const isActive = f === filter;
          const catColor = f === 'All' ? accentColor : CATEGORY_COLORS[f as TransactionCategory];
          return (
            <Pressable
              key={f}
              style={[
                s.filterPill,
                {
                  backgroundColor: isActive ? catColor + '20' : 'rgba(255,255,255,0.06)',
                  borderColor: isActive ? catColor + '40' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setFilter(f);
              }}
            >
              <ThemedText
                style={[s.filterPillText, { color: isActive ? catColor : colors.textSecondary }]}
              >
                {f}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
        {filtered.length} TRANSACTION{filtered.length !== 1 ? 'S' : ''}
      </ThemedText>

      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {filtered.map((tx, idx) => {
          const catColor = CATEGORY_COLORS[tx.category];
          const isCredit = tx.type === 'credit';
          return (
            <View
              key={tx.id}
              style={[
                s.txRow,
                idx < filtered.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.txDot, { backgroundColor: catColor }]} />
              <View style={{ flex: 1 }}>
                <ThemedText style={[s.txDesc, { color: colors.text }]} numberOfLines={1}>{tx.description}</ThemedText>
                <View style={s.txMetaRow}>
                  <View style={[s.statusBadge, { backgroundColor: catColor + '20' }]}>
                    <ThemedText style={[s.statusBadgeText, { color: catColor }]}>{tx.category}</ThemedText>
                  </View>
                  <ThemedText style={[s.txDate, { color: colors.textTertiary }]}>{tx.date}</ThemedText>
                </View>
                <ThemedText style={[s.txRef, { color: colors.textTertiary }]}>{tx.reference}</ThemedText>
              </View>
              <ThemedText style={[s.txAmount, { color: isCredit ? '#22C55E' : '#EF4444' }]}>
                {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// PENDING VIEW
// =============================================================================

function PendingView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>PENDING ITEMS</ThemedText>
      {PENDING_ITEMS.map((item) => {
        const statusColor = PENDING_STATUS_COLORS[item.status];
        return (
          <View
            key={item.id}
            style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.pendingHeader}>
              <ThemedText style={[s.pendingTitle, { color: colors.text }]}>{item.title}</ThemedText>
              <View style={[s.statusBadge, { backgroundColor: statusColor + '20' }]}>
                <ThemedText style={[s.statusBadgeText, { color: statusColor }]}>{item.status}</ThemedText>
              </View>
            </View>
            <ThemedText style={[s.pendingAmount, { color: item.type === 'credit' ? '#22C55E' : colors.text }]}>
              {item.type === 'credit' ? '+' : ''}{formatCurrency(item.amount)}
            </ThemedText>
            <View style={s.pendingMeta}>
              <View style={s.metaItem}>
                <IconSymbol name="person.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.metaText, { color: colors.textSecondary }]}>{item.requestedBy}</ThemedText>
              </View>
              <View style={s.metaItem}>
                <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.metaText, { color: colors.textSecondary }]}>Submitted: {item.submittedDate}</ThemedText>
              </View>
            </View>
          </View>
        );
      })}

      {PENDING_ITEMS.length === 0 && (
        <View style={s.emptyContainer}>
          <IconSymbol name="checkmark.circle.fill" size={40} color={colors.textTertiary} />
          <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>No pending items</ThemedText>
        </View>
      )}
    </ScrollView>
  );
}

// =============================================================================
// RECEIPTS VIEW
// =============================================================================

function ReceiptsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  // Group by month
  const months = Array.from(new Set(RECEIPTS.map((r) => r.month)));

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Year-end concept */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.yearEndRow}>
          <IconSymbol name="doc.text.fill" size={16} color={accentColor} />
          <View style={{ flex: 1 }}>
            <ThemedText style={[s.yearEndTitle, { color: colors.text }]}>Year-End Giving Statements</ThemedText>
            <ThemedText style={[s.yearEndSub, { color: colors.textSecondary }]}>
              2024 statements available for all registered donors. Tax-deductible contributions summary.
            </ThemedText>
          </View>
          <View style={[s.statusBadge, { backgroundColor: '#22C55E20' }]}>
            <ThemedText style={[s.statusBadgeText, { color: '#22C55E' }]}>Ready</ThemedText>
          </View>
        </View>
      </View>

      {months.map((month) => {
        const monthReceipts = RECEIPTS.filter((r) => r.month === month);
        return (
          <View key={month}>
            <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>{month.toUpperCase()}</ThemedText>
            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {monthReceipts.map((receipt, idx) => (
                <View
                  key={receipt.id}
                  style={[
                    s.receiptRow,
                    idx < monthReceipts.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                  ]}
                >
                  <IconSymbol
                    name="doc.fill"
                    size={16}
                    color={receipt.type === 'Income' ? '#22C55E' : '#F59E0B'}
                  />
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[s.receiptDesc, { color: colors.text }]} numberOfLines={1}>{receipt.description}</ThemedText>
                    <View style={s.receiptMetaRow}>
                      <ThemedText style={[s.receiptDate, { color: colors.textTertiary }]}>{receipt.date}</ThemedText>
                      <ThemedText style={[s.receiptRef, { color: colors.textTertiary }]}>{receipt.reference}</ThemedText>
                    </View>
                  </View>
                  <View style={s.receiptRight}>
                    <ThemedText style={[s.receiptAmount, { color: receipt.type === 'Income' ? '#22C55E' : colors.text }]}>
                      {formatCurrency(receipt.amount)}
                    </ThemedText>
                    <View style={[s.statusBadge, { backgroundColor: (receipt.type === 'Income' ? '#22C55E' : '#F59E0B') + '20' }]}>
                      <ThemedText style={[s.statusBadgeText, { color: receipt.type === 'Income' ? '#22C55E' : '#F59E0B' }]}>
                        {receipt.type}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function ChurchLedger({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewId>('transactions');

  const handleViewChange = useCallback((id: ViewId) => {
    setActiveView(id);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'transactions':
        return <TransactionsView colors={colors} accentColor={accentColor} />;
      case 'pending':
        return <PendingView colors={colors} accentColor={accentColor} />;
      case 'receipts':
        return <ReceiptsView colors={colors} accentColor={accentColor} />;
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

  // -- Filter --
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Meta --
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },

  // -- Transaction --
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
  },
  txDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  txDesc: {
    fontSize: 13,
    fontWeight: '500',
  },
  txMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  txDate: {
    fontSize: 10,
  },
  txRef: {
    fontSize: 10,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Pending --
  pendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pendingTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  pendingAmount: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginBottom: Spacing.sm,
  },
  pendingMeta: {
    gap: 4,
  },

  // -- Empty --
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

  // -- Year End --
  yearEndRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  yearEndTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  yearEndSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },

  // -- Receipt --
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
  },
  receiptDesc: {
    fontSize: 13,
    fontWeight: '500',
  },
  receiptMetaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: 3,
  },
  receiptDate: {
    fontSize: 10,
  },
  receiptRef: {
    fontSize: 10,
  },
  receiptRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  receiptAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
