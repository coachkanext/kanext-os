/**
 * Edu Ledger V3 — 3-pill ViewBar (Transactions | Pending | Receipts)
 * Florida Memorial University · President perspective
 * HBCU · Founded 1879 · Miami Gardens, FL · SACSCOC Accredited
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

type TxCategory = 'All' | 'Tuition' | 'Aid' | 'Payroll' | 'Grants' | 'Vendors' | 'Donations' | 'Athletics';

const TX_CATEGORIES: TxCategory[] = ['All', 'Tuition', 'Aid', 'Payroll', 'Grants', 'Vendors', 'Donations', 'Athletics'];

type TxDirection = 'credit' | 'debit';

interface Transaction {
  id: string;
  description: string;
  category: Exclude<TxCategory, 'All'>;
  amount: number;
  direction: TxDirection;
  date: string;
  reference: string;
}

const TRANSACTIONS: Transaction[] = [
  { id: 'tx1', description: 'Spring 2025 tuition deposits — Batch 1', category: 'Tuition', amount: 2450000, direction: 'credit', date: 'Jan 15, 2025', reference: 'TUI-2025-0115' },
  { id: 'tx2', description: 'Federal Pell Grant disbursement', category: 'Aid', amount: 1200000, direction: 'credit', date: 'Jan 14, 2025', reference: 'AID-FED-0114' },
  { id: 'tx3', description: 'Monthly payroll — January 2025', category: 'Payroll', amount: 1850000, direction: 'debit', date: 'Jan 10, 2025', reference: 'PAY-2025-01' },
  { id: 'tx4', description: 'Title III grant receipt — Q1', category: 'Grants', amount: 375000, direction: 'credit', date: 'Jan 8, 2025', reference: 'GRT-TIII-Q1' },
  { id: 'tx5', description: 'Sodexo food services — December', category: 'Vendors', amount: 145000, direction: 'debit', date: 'Jan 5, 2025', reference: 'VND-SOD-1224' },
  { id: 'tx6', description: 'Alumni Association annual donation', category: 'Donations', amount: 250000, direction: 'credit', date: 'Jan 3, 2025', reference: 'DON-ALM-0103' },
  { id: 'tx7', description: 'Athletics conference tournament fees', category: 'Athletics', amount: 35000, direction: 'debit', date: 'Jan 2, 2025', reference: 'ATH-SUN-0102' },
  { id: 'tx8', description: 'Spring 2025 institutional aid disbursement', category: 'Aid', amount: 680000, direction: 'debit', date: 'Jan 16, 2025', reference: 'AID-INST-0116' },
];

interface PendingItem {
  id: string;
  description: string;
  amount: number;
  type: string;
  submittedDate: string;
  status: 'Awaiting Approval' | 'Processing' | 'Scheduled';
}

const PENDING_ITEMS: PendingItem[] = [
  { id: 'p1', description: 'Johnson Controls — HVAC maintenance contract', amount: 85000, type: 'Vendor Payment', submittedDate: 'Jan 18, 2025', status: 'Awaiting Approval' },
  { id: 'p2', description: 'Spring 2025 aid disbursement — Batch 2', amount: 920000, type: 'Aid Disbursement', submittedDate: 'Jan 17, 2025', status: 'Processing' },
  { id: 'p3', description: 'NSF STEM grant reimbursement', amount: 145000, type: 'Grant Reimbursement', submittedDate: 'Jan 16, 2025', status: 'Processing' },
  { id: 'p4', description: 'Lab equipment — Science Building', amount: 62000, type: 'Purchase Order', submittedDate: 'Jan 15, 2025', status: 'Awaiting Approval' },
];

interface Receipt {
  id: string;
  description: string;
  amount: number;
  date: string;
  reference: string;
  fiscalYear: string;
  month: string;
}

const RECEIPTS: Receipt[] = [
  { id: 'rc1', description: 'Spring tuition deposit confirmation', amount: 2450000, date: 'Jan 15, 2025', reference: 'REC-TUI-0115', fiscalYear: 'FY25', month: 'January' },
  { id: 'rc2', description: 'Federal Pell Grant receipt', amount: 1200000, date: 'Jan 14, 2025', reference: 'REC-FED-0114', fiscalYear: 'FY25', month: 'January' },
  { id: 'rc3', description: 'Title III grant receipt', amount: 375000, date: 'Jan 8, 2025', reference: 'REC-GRT-0108', fiscalYear: 'FY25', month: 'January' },
  { id: 'rc4', description: 'Alumni donation receipt', amount: 250000, date: 'Jan 3, 2025', reference: 'REC-DON-0103', fiscalYear: 'FY25', month: 'January' },
  { id: 'rc5', description: 'December auxiliary revenue', amount: 125000, date: 'Dec 31, 2024', reference: 'REC-AUX-1231', fiscalYear: 'FY25', month: 'December' },
  { id: 'rc6', description: 'Fall 2024 late tuition collection', amount: 95000, date: 'Dec 20, 2024', reference: 'REC-TUI-1220', fiscalYear: 'FY25', month: 'December' },
];

const CATEGORY_COLOR: Record<Exclude<TxCategory, 'All'>, string> = {
  Tuition: '#14B8A6',
  Aid: '#6AA9FF',
  Payroll: '#A78BFA',
  Grants: '#22C55E',
  Vendors: '#F59E0B',
  Donations: '#EC4899',
  Athletics: '#EF4444',
};

const PENDING_STATUS_COLOR: Record<string, string> = {
  'Awaiting Approval': '#F59E0B',
  Processing: '#6AA9FF',
  Scheduled: '#22C55E',
};

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
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
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
// VIEW: TRANSACTIONS
// =============================================================================

function TransactionsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const [filter, setFilter] = useState<TxCategory>('All');

  const filtered = filter === 'All' ? TRANSACTIONS : TRANSACTIONS.filter((tx) => tx.category === filter);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Filter pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterBar}>
        {TX_CATEGORIES.map((cat) => {
          const isActive = cat === filter;
          return (
            <Pressable
              key={cat}
              style={[s.filterPill, { backgroundColor: isActive ? accentColor : 'rgba(255,255,255,0.08)' }]}
              onPress={() => { Haptics.selectionAsync(); setFilter(cat); }}
            >
              <ThemedText style={[s.filterPillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {cat}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Transactions */}
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
            <View style={s.txCategoryDot}>
              <View style={[s.colorDot, { backgroundColor: CATEGORY_COLOR[tx.category] }]} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.txDesc, { color: colors.text }]} numberOfLines={2}>{tx.description}</ThemedText>
              <ThemedText style={[s.txRef, { color: colors.textTertiary }]}>{tx.reference}</ThemedText>
            </View>
            <View style={s.txAmountWrap}>
              <ThemedText
                style={[
                  s.txAmount,
                  { color: tx.direction === 'credit' ? '#22C55E' : colors.text },
                ]}
              >
                {tx.direction === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
              </ThemedText>
              <ThemedText style={[s.txDate, { color: colors.textSecondary }]}>{tx.date}</ThemedText>
            </View>
          </View>
          <View style={[s.txFooter, { borderTopColor: colors.border }]}>
            <StatusBadge label={tx.category.toUpperCase()} color={CATEGORY_COLOR[tx.category]} />
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
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.pendingDesc, { color: colors.text }]} numberOfLines={2}>
                {item.description}
              </ThemedText>
              <ThemedText style={[s.pendingType, { color: colors.textSecondary }]}>{item.type}</ThemedText>
            </View>
            <ThemedText style={[s.pendingAmount, { color: accentColor }]}>
              {formatCurrency(item.amount)}
            </ThemedText>
          </View>
          <View style={[s.pendingFooter, { borderTopColor: colors.border }]}>
            <ThemedText style={[s.pendingDate, { color: colors.textTertiary }]}>
              Submitted: {item.submittedDate}
            </ThemedText>
            <StatusBadge
              label={item.status.toUpperCase()}
              color={PENDING_STATUS_COLOR[item.status]}
            />
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
  // Group receipts by month
  const grouped = RECEIPTS.reduce<Record<string, Receipt[]>>((acc, rc) => {
    const key = `${rc.month} (${rc.fiscalYear})`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(rc);
    return acc;
  }, {});

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {Object.entries(grouped).map(([monthKey, receipts]) => {
        const monthTotal = receipts.reduce((sum, r) => sum + r.amount, 0);
        return (
          <View key={monthKey}>
            <View style={s.monthHeader}>
              <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginBottom: 0 }]}>
                {monthKey.toUpperCase()}
              </ThemedText>
              <ThemedText style={[s.monthTotal, { color: accentColor }]}>
                {formatCurrency(monthTotal)}
              </ThemedText>
            </View>

            {receipts.map((rc) => (
              <Pressable
                key={rc.id}
                style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => Haptics.selectionAsync()}
              >
                <View style={s.receiptHeader}>
                  <IconSymbol name="doc.text.fill" size={16} color={accentColor} />
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[s.receiptDesc, { color: colors.text }]}>{rc.description}</ThemedText>
                    <ThemedText style={[s.receiptRef, { color: colors.textTertiary }]}>{rc.reference}</ThemedText>
                  </View>
                  <View style={s.receiptAmountWrap}>
                    <ThemedText style={[s.receiptAmount, { color: '#22C55E' }]}>
                      {formatCurrency(rc.amount)}
                    </ThemedText>
                    <ThemedText style={[s.receiptDate, { color: colors.textSecondary }]}>{rc.date}</ThemedText>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        );
      })}

      {/* Federal Reporting */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: 8 }]}>
        FEDERAL REPORTING EXPORTS
      </ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.exportRow}>
          <IconSymbol name="doc.badge.arrow.up" size={16} color={accentColor} />
          <View style={{ flex: 1 }}>
            <ThemedText style={[s.exportTitle, { color: colors.text }]}>IPEDS Financial Report</ThemedText>
            <ThemedText style={[s.exportSub, { color: colors.textSecondary }]}>
              Annual institutional financial data export for federal reporting
            </ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
        </View>
      </View>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.exportRow}>
          <IconSymbol name="doc.badge.arrow.up" size={16} color={accentColor} />
          <View style={{ flex: 1 }}>
            <ThemedText style={[s.exportTitle, { color: colors.text }]}>Title IV Fiscal Operations Report</ThemedText>
            <ThemedText style={[s.exportSub, { color: colors.textSecondary }]}>
              Federal student aid disbursement and reconciliation report
            </ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function EduLedger({ colors, accentColor, role }: Props) {
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

  // -- Filter --
  filterScroll: {
    marginBottom: 14,
    marginHorizontal: -Spacing.md,
  },
  filterBar: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: Spacing.md,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // -- Transaction --
  txHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  txCategoryDot: {
    paddingTop: 4,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  txDesc: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  txRef: {
    fontSize: 10,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  txAmountWrap: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  txDate: {
    fontSize: 10,
    marginTop: 2,
  },
  txFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
  },

  // -- Pending --
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  pendingDesc: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  pendingType: {
    fontSize: 11,
    marginTop: 2,
  },
  pendingAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  pendingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  pendingDate: {
    fontSize: 11,
  },

  // -- Receipts --
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  monthTotal: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  receiptDesc: {
    fontSize: 13,
    fontWeight: '600',
  },
  receiptRef: {
    fontSize: 10,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  receiptAmountWrap: {
    alignItems: 'flex-end',
  },
  receiptAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  receiptDate: {
    fontSize: 10,
    marginTop: 2,
  },

  // -- Export --
  exportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  exportTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  exportSub: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
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
