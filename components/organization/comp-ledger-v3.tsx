/**
 * Competition Ledger V3 — 3-pill ViewBar (Transactions | Pending | Receipts)
 * K-1 Speed League · Commissioner perspective
 * Full financial ledger: transactions, pending items, and receipts.
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

type ViewId = 'transactions' | 'pending' | 'receipts';

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'transactions', label: 'Transactions' },
  { id: 'pending', label: 'Pending' },
  { id: 'receipts', label: 'Receipts' },
];

type TxCategory = 'Entry Fees' | 'Prize Money' | 'Sponsorship' | 'Broadcast' | 'Venue' | 'Logistics' | 'Penalties' | 'Merchandise' | 'Tickets';
type TxDirection = 'inflow' | 'outflow';

const FILTER_PILLS: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'entry', label: 'Entry Fees' },
  { id: 'prize', label: 'Prize Money' },
  { id: 'sponsor', label: 'Sponsorship' },
  { id: 'broadcast', label: 'Broadcast' },
  { id: 'venue', label: 'Venue' },
  { id: 'logistics', label: 'Logistics' },
  { id: 'penalties', label: 'Penalties' },
];

interface Transaction {
  id: string;
  title: string;
  category: TxCategory;
  amount: string;
  direction: TxDirection;
  date: string;
  counterparty: string;
}

const TRANSACTIONS: Transaction[] = [
  {
    id: 'tx1',
    title: 'Entry fee payment',
    category: 'Entry Fees',
    amount: '$3,000,000',
    direction: 'inflow',
    date: 'Jan 5',
    counterparty: 'Porsche Motorsport',
  },
  {
    id: 'tx2',
    title: 'Prize money disbursement R3',
    category: 'Prize Money',
    amount: '$1,605,000',
    direction: 'outflow',
    date: 'Mar 18',
    counterparty: 'All R3 finishers',
  },
  {
    id: 'tx3',
    title: 'Broadcast rights installment',
    category: 'Broadcast',
    amount: '$3,750,000',
    direction: 'inflow',
    date: 'Mar 1',
    counterparty: 'ESPN',
  },
  {
    id: 'tx4',
    title: 'Venue deposit Suzuka',
    category: 'Venue',
    amount: '$1,200,000',
    direction: 'outflow',
    date: 'Feb 15',
    counterparty: 'Suzuka Circuit Co.',
  },
  {
    id: 'tx5',
    title: 'Logistics freight payment',
    category: 'Logistics',
    amount: '$850,000',
    direction: 'outflow',
    date: 'Mar 10',
    counterparty: 'DHL Global Forwarding',
  },
  {
    id: 'tx6',
    title: 'Penalty fine collected',
    category: 'Penalties',
    amount: '$10,000',
    direction: 'inflow',
    date: 'Mar 16',
    counterparty: 'HKS Japan',
  },
  {
    id: 'tx7',
    title: 'Merchandise revenue Q1',
    category: 'Merchandise',
    amount: '$420,000',
    direction: 'inflow',
    date: 'Mar 31',
    counterparty: 'K-1 Merch Store',
  },
  {
    id: 'tx8',
    title: 'Ticket sales R1 Miami',
    category: 'Tickets',
    amount: '$580,000',
    direction: 'inflow',
    date: 'Jan 20',
    counterparty: 'Ticketmaster',
  },
];

interface PendingItem {
  id: string;
  title: string;
  amount: string;
  status: 'Processing' | 'Due' | 'Awaiting';
  dueDate: string;
  counterparty: string;
}

const PENDING_ITEMS: PendingItem[] = [
  {
    id: 'pi1',
    title: 'Prize money R3 — final processing',
    amount: '$1,605,000',
    status: 'Processing',
    dueDate: 'Mar 25',
    counterparty: 'All R3 finishers',
  },
  {
    id: 'pi2',
    title: 'Venue payment — Spa deposit',
    amount: '$900,000',
    status: 'Due',
    dueDate: 'Apr 1',
    counterparty: 'Spa-Francorchamps',
  },
  {
    id: 'pi3',
    title: 'Sponsor installment Q2',
    amount: '$2,500,000',
    status: 'Due',
    dueDate: 'Apr 15',
    counterparty: 'Title sponsor',
  },
  {
    id: 'pi4',
    title: 'Penalty fine collection',
    amount: '$10,000',
    status: 'Awaiting',
    dueDate: 'Apr 5',
    counterparty: 'RUF Performance',
  },
];

const PENDING_STATUS_COLORS: Record<string, string> = {
  Processing: '#1D9BF0',
  Due: '#F59E0B',
  Awaiting: '#EF4444',
};

interface Receipt {
  id: string;
  title: string;
  amount: string;
  date: string;
  ref: string;
  group: string;
}

const RECEIPTS: Receipt[] = [
  { id: 'rc1', title: 'R1 Miami — Venue settlement', amount: '$1,800,000', date: 'Jan 28', ref: 'RCP-2025-001', group: 'R1 Miami' },
  { id: 'rc2', title: 'R1 Miami — Prize disbursement', amount: '$1,605,000', date: 'Jan 30', ref: 'RCP-2025-002', group: 'R1 Miami' },
  { id: 'rc3', title: 'R2 Austin — Venue settlement', amount: '$1,500,000', date: 'Feb 20', ref: 'RCP-2025-003', group: 'R2 Austin' },
  { id: 'rc4', title: 'R2 Austin — Prize disbursement', amount: '$1,605,000', date: 'Feb 22', ref: 'RCP-2025-004', group: 'R2 Austin' },
  { id: 'rc5', title: 'R3 Monza — Venue settlement', amount: '$1,400,000', date: 'Mar 18', ref: 'RCP-2025-005', group: 'R3 Monza' },
  { id: 'rc6', title: 'Q1 broadcast rights receipt', amount: '$7,500,000', date: 'Mar 31', ref: 'RCP-2025-006', group: 'March' },
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

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

function DirectionIndicator({ direction }: { direction: TxDirection }) {
  const isIn = direction === 'inflow';
  return (
    <View style={[s.directionBadge, { backgroundColor: isIn ? '#22C55E20' : '#EF444420' }]}>
      <IconSymbol
        name={isIn ? 'chevron.down' : 'chevron.up'}
        size={10}
        color={isIn ? '#22C55E' : '#EF4444'}
      />
    </View>
  );
}

// =============================================================================
// VIEW: TRANSACTIONS
// =============================================================================

function TransactionsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = activeFilter === 'all'
    ? TRANSACTIONS
    : TRANSACTIONS.filter((tx) => tx.category.toLowerCase().includes(activeFilter));

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
        style={s.filterScroll}
      >
        {FILTER_PILLS.map((fp) => {
          const isActive = fp.id === activeFilter;
          return (
            <Pressable
              key={fp.id}
              style={[
                s.filterPill,
                { backgroundColor: isActive ? accentColor : '#2F3336' },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveFilter(fp.id);
              }}
            >
              <ThemedText style={[s.filterPillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {fp.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Transaction List */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
        TRANSACTIONS ({filtered.length})
      </ThemedText>
      {filtered.map((tx) => (
        <Pressable
          key={tx.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.selectionAsync()}
        >
          <View style={s.txHeader}>
            <DirectionIndicator direction={tx.direction} />
            <View style={s.txInfo}>
              <ThemedText style={[s.txTitle, { color: colors.text }]}>{tx.title}</ThemedText>
              <ThemedText style={[s.txCounterparty, { color: colors.textSecondary }]}>{tx.counterparty}</ThemedText>
            </View>
            <View style={s.txAmountCol}>
              <ThemedText
                style={[
                  s.txAmount,
                  { color: tx.direction === 'inflow' ? '#22C55E' : colors.text },
                ]}
              >
                {tx.direction === 'inflow' ? '+' : '-'}{tx.amount}
              </ThemedText>
              <ThemedText style={[s.txDate, { color: colors.textSecondary }]}>{tx.date}</ThemedText>
            </View>
          </View>
          <View style={s.txFooter}>
            <StatusBadge label={tx.category.toUpperCase()} color={accentColor} />
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: PENDING
// =============================================================================

function PendingView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
        PENDING ITEMS ({PENDING_ITEMS.length})
      </ThemedText>
      {PENDING_ITEMS.map((item) => (
        <Pressable
          key={item.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.selectionAsync()}
        >
          <View style={s.pendingHeader}>
            <View style={s.pendingInfo}>
              <ThemedText style={[s.pendingTitle, { color: colors.text }]}>{item.title}</ThemedText>
              <ThemedText style={[s.pendingCounterparty, { color: colors.textSecondary }]}>
                {item.counterparty}
              </ThemedText>
            </View>
            <ThemedText style={[s.pendingAmount, { color: '#F59E0B' }]}>{item.amount}</ThemedText>
          </View>
          <View style={[s.pendingFooter, { borderTopColor: colors.border }]}>
            <StatusBadge
              label={item.status.toUpperCase()}
              color={PENDING_STATUS_COLORS[item.status] || '#A1A1AA'}
            />
            <ThemedText style={[s.pendingDue, { color: colors.textSecondary }]}>Due: {item.dueDate}</ThemedText>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: RECEIPTS
// =============================================================================

function ReceiptsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  // Group by group field
  const groups: Record<string, Receipt[]> = {};
  RECEIPTS.forEach((r) => {
    if (!groups[r.group]) groups[r.group] = [];
    groups[r.group].push(r);
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {Object.entries(groups).map(([group, receipts]) => (
        <View key={group}>
          <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>{group.toUpperCase()}</ThemedText>
          {receipts.map((receipt) => (
            <Pressable
              key={receipt.id}
              style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => Haptics.selectionAsync()}
            >
              <View style={s.receiptHeader}>
                <IconSymbol name="doc.fill" size={16} color={accentColor} />
                <View style={s.receiptInfo}>
                  <ThemedText style={[s.receiptTitle, { color: colors.text }]}>{receipt.title}</ThemedText>
                  <ThemedText style={[s.receiptRef, { color: colors.textSecondary }]}>{receipt.ref}</ThemedText>
                </View>
              </View>
              <View style={[s.receiptFooter, { borderTopColor: colors.border }]}>
                <ThemedText style={[s.receiptAmount, { color: colors.text }]}>{receipt.amount}</ThemedText>
                <ThemedText style={[s.receiptDate, { color: colors.textSecondary }]}>{receipt.date}</ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      ))}

      {/* Season End Report */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: 8 }]}>
        SEASON-END REPORT
      </ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.reportPlaceholder}>
          <IconSymbol name="doc.text.fill" size={32} color={colors.textTertiary} />
          <ThemedText style={[s.reportText, { color: colors.textSecondary }]}>
            Comprehensive financial report will be generated at season conclusion, including all transactions, prize disbursements, and revenue reconciliation.
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function CompLedger({ colors, accentColor, role }: Props) {
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

  // -- Filter --
  filterScroll: {
    marginBottom: 12,
  },
  filterRow: {
    gap: 6,
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

  // -- Direction Badge --
  directionBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // -- Transaction --
  txHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  txCounterparty: {
    fontSize: 12,
    marginTop: 2,
  },
  txAmountCol: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  txDate: {
    fontSize: 11,
    marginTop: 2,
  },
  txFooter: {
    marginTop: 8,
  },

  // -- Pending --
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  pendingInfo: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  pendingCounterparty: {
    fontSize: 12,
    marginTop: 2,
  },
  pendingAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  pendingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  pendingDue: {
    fontSize: 12,
  },

  // -- Receipt --
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  receiptInfo: {
    flex: 1,
  },
  receiptTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  receiptRef: {
    fontSize: 11,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  receiptFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  receiptAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  receiptDate: {
    fontSize: 12,
  },

  // -- Report Placeholder --
  reportPlaceholder: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  reportText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});
