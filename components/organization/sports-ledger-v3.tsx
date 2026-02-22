/**
 * Sports Ledger V3 — 3-pill ViewBar (Transactions | Pending | Receipts)
 * Carroll Men's Basketball · NAIA Frontier Conference
 * Head Coach / GM perspective. Inline mock data, no DrillMode.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

// =============================================================================
// TYPES & MOCK DATA
// =============================================================================

type ViewId = 'transactions' | 'pending' | 'receipts';

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'transactions', label: 'Transactions' },
  { id: 'pending', label: 'Pending' },
  { id: 'receipts', label: 'Receipts' },
];

// -- Transaction filters --

type TxnFilterId = 'all' | 'income' | 'expense' | 'scholarship' | 'nil' | 'tickets' | 'merch' | 'donations';

const TXN_FILTERS: { id: TxnFilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'income', label: 'Income' },
  { id: 'expense', label: 'Expense' },
  { id: 'scholarship', label: 'Scholarship' },
  { id: 'nil', label: 'NIL' },
  { id: 'tickets', label: 'Tickets' },
  { id: 'merch', label: 'Merch' },
  { id: 'donations', label: 'Donations' },
];

type TxnType = 'Income' | 'Expense';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TxnType;
  category: TxnFilterId;
  from: string;
  to: string;
  status: 'Settled';
}

const TRANSACTIONS: Transaction[] = [
  { id: 'tx1', date: 'Jan 15, 2025', description: 'Season ticket sales — January block', amount: 8500, type: 'Income', category: 'tickets', from: 'Box Office', to: 'Carroll Athletics', status: 'Settled' },
  { id: 'tx2', date: 'Jan 14, 2025', description: 'Road trip fuel — Savannah', amount: 420, type: 'Expense', category: 'expense', from: 'Carroll Athletics', to: 'Shell Gas', status: 'Settled' },
  { id: 'tx3', date: 'Jan 12, 2025', description: 'Jaylen Thompson scholarship — Spring', amount: 9000, type: 'Expense', category: 'scholarship', from: 'Scholarship Fund', to: 'Jaylen Thompson', status: 'Settled' },
  { id: 'tx4', date: 'Jan 10, 2025', description: 'Sun Coast Auto NIL payment — Q1', amount: 3750, type: 'Income', category: 'nil', from: 'Sun Coast Auto', to: 'Jaylen Thompson', status: 'Settled' },
  { id: 'tx5', date: 'Jan 8, 2025', description: 'Jersey merchandise — online store', amount: 2800, type: 'Income', category: 'merch', from: 'Carroll Store', to: 'Carroll Athletics', status: 'Settled' },
  { id: 'tx6', date: 'Jan 5, 2025', description: 'Alumni donation — Williams family', amount: 5000, type: 'Income', category: 'donations', from: 'Williams Family Trust', to: 'Carroll Athletics', status: 'Settled' },
  { id: 'tx7', date: 'Jan 3, 2025', description: 'Equipment purchase — practice balls', amount: 640, type: 'Expense', category: 'expense', from: 'Carroll Athletics', to: 'Wilson Sporting Goods', status: 'Settled' },
  { id: 'tx8', date: 'Jan 2, 2025', description: 'Holiday Inn booking — Tampa trip', amount: 1200, type: 'Expense', category: 'expense', from: 'Carroll Athletics', to: 'Holiday Inn Express', status: 'Settled' },
];

// -- Pending items --

type PendingStatus = 'Pending Approval' | 'Processing' | 'Awaiting Settlement';

const PENDING_STATUS_COLOR: Record<PendingStatus, string> = {
  'Pending Approval': '#F59E0B',
  Processing: '#1D9BF0',
  'Awaiting Settlement': '#1D9BF0',
};

interface PendingItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TxnType;
  status: PendingStatus;
  actionNeeded: boolean;
}

const PENDING_ITEMS: PendingItem[] = [
  { id: 'pd1', date: 'Jan 17, 2025', description: 'Equipment purchase — replacement jerseys (home set)', amount: 1200, type: 'Expense', status: 'Pending Approval', actionNeeded: true },
  { id: 'pd2', date: 'Jan 16, 2025', description: 'Road trip meal budget — Savannah', amount: 800, type: 'Expense', status: 'Pending Approval', actionNeeded: true },
  { id: 'pd3', date: 'Jan 15, 2025', description: 'Blue Wave Sports NIL disbursement — Feb', amount: 2000, type: 'Expense', status: 'Processing', actionNeeded: false },
  { id: 'pd4', date: 'Jan 14, 2025', description: 'Ticket revenue transfer — January block', amount: 8500, type: 'Income', status: 'Awaiting Settlement', actionNeeded: false },
];

// -- Receipts --

interface Receipt {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  month: string;
}

const RECEIPTS: Receipt[] = [
  { id: 'rc1', date: 'Jan 14, 2025', description: 'Shell Gas — Road trip fuel', amount: 420, category: 'Travel', month: 'January 2025' },
  { id: 'rc2', date: 'Jan 10, 2025', description: 'Publix — Team pregame meals', amount: 285, category: 'Meals', month: 'January 2025' },
  { id: 'rc3', date: 'Jan 3, 2025', description: 'Wilson — Practice basketballs', amount: 640, category: 'Equipment', month: 'January 2025' },
  { id: 'rc4', date: 'Jan 2, 2025', description: 'Holiday Inn — Tampa booking', amount: 1200, category: 'Travel', month: 'January 2025' },
  { id: 'rc5', date: 'Dec 28, 2024', description: 'Nike — Training gear order', amount: 3400, category: 'Gear', month: 'December 2024' },
  { id: 'rc6', date: 'Dec 15, 2024', description: 'FedEx Office — Recruiting packets', amount: 180, category: 'Recruiting', month: 'December 2024' },
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

function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US');
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// VIEW: TRANSACTIONS
// =============================================================================

function TransactionsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const [filter, setFilter] = useState<TxnFilterId>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = TRANSACTIONS;
    if (filter !== 'all') {
      if (filter === 'income') list = list.filter((t) => t.type === 'Income');
      else if (filter === 'expense') list = list.filter((t) => t.type === 'Expense');
      else list = list.filter((t) => t.category === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.from.toLowerCase().includes(q) ||
          t.to.toLowerCase().includes(q),
      );
    }
    return list;
  }, [filter, search]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Search */}
      <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
        <TextInput
          style={[s.searchInput, { color: colors.text }]}
          placeholder="Search transactions..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
        style={{ flexGrow: 0, marginBottom: 12 }}
      >
        {TXN_FILTERS.map((f) => {
          const isActive = f.id === filter;
          return (
            <Pressable
              key={f.id}
              style={[
                s.filterPill,
                { backgroundColor: isActive ? accentColor : '#2F3336' },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setFilter(f.id);
              }}
            >
              <ThemedText
                style={[
                  s.filterPillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {f.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Transactions */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
        {filtered.length} TRANSACTION{filtered.length !== 1 ? 'S' : ''}
      </ThemedText>
      {filtered.map((txn) => (
        <Pressable
          key={txn.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.selectionAsync()}
        >
          <View style={s.txnHeader}>
            <View style={s.txnInfo}>
              <ThemedText style={[s.txnDesc, { color: colors.text }]} numberOfLines={2}>
                {txn.description}
              </ThemedText>
              <ThemedText style={[s.txnDate, { color: colors.textSecondary }]}>{txn.date}</ThemedText>
            </View>
            <ThemedText
              style={[
                s.txnAmount,
                { color: txn.type === 'Income' ? '#22C55E' : '#EF4444' },
              ]}
            >
              {txn.type === 'Income' ? '+' : '-'}{formatCurrency(txn.amount)}
            </ThemedText>
          </View>
          <View style={[s.txnMeta, { borderTopColor: colors.border }]}>
            <StatusBadge
              label={txn.type.toUpperCase()}
              color={txn.type === 'Income' ? '#22C55E' : '#EF4444'}
            />
            <StatusBadge
              label={txn.category.toUpperCase()}
              color={accentColor}
            />
            <StatusBadge label="SETTLED" color="#22C55E" />
          </View>
          <View style={s.txnParties}>
            <ThemedText style={[s.txnParty, { color: colors.textTertiary }]}>
              {txn.from} &rarr; {txn.to}
            </ThemedText>
          </View>
        </Pressable>
      ))}

      {filtered.length === 0 && (
        <View style={s.emptyState}>
          <IconSymbol name="doc.text.magnifyingglass" size={40} color={colors.textTertiary} />
          <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>No transactions found</ThemedText>
        </View>
      )}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: PENDING
// =============================================================================

function PendingView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>PENDING ITEMS</ThemedText>
      {PENDING_ITEMS.map((item) => (
        <View
          key={item.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.pendHeader}>
            <View style={s.pendInfo}>
              <ThemedText style={[s.pendDesc, { color: colors.text }]} numberOfLines={2}>
                {item.description}
              </ThemedText>
              <ThemedText style={[s.pendDate, { color: colors.textSecondary }]}>{item.date}</ThemedText>
            </View>
            <ThemedText
              style={[
                s.pendAmount,
                { color: item.type === 'Income' ? '#22C55E' : colors.text },
              ]}
            >
              {formatCurrency(item.amount)}
            </ThemedText>
          </View>
          <View style={[s.pendMeta, { borderTopColor: colors.border }]}>
            <StatusBadge
              label={item.type.toUpperCase()}
              color={item.type === 'Income' ? '#22C55E' : '#EF4444'}
            />
            <StatusBadge
              label={item.status.toUpperCase()}
              color={PENDING_STATUS_COLOR[item.status]}
            />
          </View>
          {item.actionNeeded && (
            <View style={[s.actionBanner, { backgroundColor: '#F59E0B15' }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#F59E0B" />
              <ThemedText style={[s.actionText, { color: '#F59E0B' }]}>Action needed — approval required</ThemedText>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: RECEIPTS
// =============================================================================

function ReceiptsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const grouped = useMemo(() => {
    const map: Record<string, Receipt[]> = {};
    RECEIPTS.forEach((r) => {
      if (!map[r.month]) map[r.month] = [];
      map[r.month].push(r);
    });
    return Object.entries(map);
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {grouped.map(([month, receipts]) => (
        <View key={month}>
          <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
            {month.toUpperCase()}
          </ThemedText>
          {receipts.map((receipt) => (
            <View
              key={receipt.id}
              style={[s.listRow, { borderBottomColor: colors.border }]}
            >
              <View style={s.receiptInfo}>
                <ThemedText style={[s.receiptDesc, { color: colors.text }]} numberOfLines={1}>
                  {receipt.description}
                </ThemedText>
                <View style={s.receiptSubRow}>
                  <ThemedText style={[s.receiptDate, { color: colors.textTertiary }]}>{receipt.date}</ThemedText>
                  <StatusBadge label={receipt.category.toUpperCase()} color={accentColor} />
                </View>
              </View>
              <ThemedText style={[s.receiptAmount, { color: colors.text }]}>
                {formatCurrency(receipt.amount)}
              </ThemedText>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function SportsLedger({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewId>('transactions');

  const handlePillPress = useCallback((id: ViewId) => {
    Haptics.selectionAsync();
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

  // -- Search --
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },

  // -- Filter pills --
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Transactions --
  txnHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  txnInfo: {
    flex: 1,
  },
  txnDesc: {
    fontSize: 13,
    fontWeight: '600',
  },
  txnDate: {
    fontSize: 11,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  txnMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  txnParties: {
    marginTop: 6,
  },
  txnParty: {
    fontSize: 11,
  },

  // -- Empty state --
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },

  // -- Pending --
  pendHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  pendInfo: {
    flex: 1,
  },
  pendDesc: {
    fontSize: 13,
    fontWeight: '600',
  },
  pendDate: {
    fontSize: 11,
    marginTop: 2,
  },
  pendAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  pendMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },

  // -- Receipts --
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  receiptInfo: {
    flex: 1,
  },
  receiptDesc: {
    fontSize: 13,
    fontWeight: '600',
  },
  receiptSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  receiptDate: {
    fontSize: 11,
  },
  receiptAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
