/**
 * BizLedger — Immutable Financial Record (Ledger Tab)
 * Single vertical scroll. Append-only audit trail.
 * No edits. No deletes. No approvals. No overrides.
 * Finance = Summary + Allocation. Ledger = What Actually Happened.
 * Decision Access: D0 — Read-Only Surface.
 */
import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing } from '@/constants/theme';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
  onNavigateTab?: (tabIndex: number) => void;
}

// =============================================================================
// TYPES
// =============================================================================

type Direction = 'inflow' | 'outflow' | 'internal_transfer';

type Category =
  | 'CAPITAL'
  | 'PAYROLL'
  | 'NIL'
  | 'TICKETING'
  | 'DONATIONS'
  | 'VENDOR'
  | 'FACILITIES'
  | 'OPERATIONS'
  | 'TAX'
  | 'DEBT'
  | 'OTHER';

type CounterpartyType = 'Employee' | 'Vendor' | 'Institution' | 'Investor' | 'Member' | 'Other';

type SettlementMethod = 'ACH' | 'Wire' | 'Card' | 'External Processor' | 'Internal Wallet';

type EntryStatus = 'DRAFT' | 'AUTHORIZED' | 'SCHEDULED' | 'SETTLED' | 'REVERSED' | 'FAILED';

type DateRange = 'Today' | 'This Week' | 'This Month' | 'Fiscal Year' | 'Custom';

interface LedgerEntry {
  id: string;
  createdAt: string;
  effectiveAt: string;
  direction: Direction;
  amountCents: number;
  category: Category;
  counterpartyType: CounterpartyType;
  counterpartyName: string;
  title: string;
  memo: string;
  status: EntryStatus;
  settlementMethod: SettlementMethod;
  referenceId: string;
  eventId?: string;
  paymentId?: string;
  budgetBucketId?: string;
}

// =============================================================================
// INLINE DATA — Post-settlement records only
// =============================================================================

const FISCAL_YEARS = ['FY 2025', 'FY 2024'];

const ENTRIES: LedgerEntry[] = [
  {
    id: 'le-001', createdAt: '2025-02-28T14:30:00Z', effectiveAt: '2025-02-28',
    direction: 'outflow', amountCents: 2800000, category: 'PAYROLL',
    counterpartyType: 'Employee', counterpartyName: 'Valuetainment Payroll',
    title: 'February Payroll', memo: 'Monthly payroll — all departments',
    status: 'SETTLED', settlementMethod: 'ACH', referenceId: 'PAY-2025-002',
    paymentId: 'pmt-0028', budgetBucketId: 'bkt-payroll',
  },
  {
    id: 'le-002', createdAt: '2025-02-15T10:00:00Z', effectiveAt: '2025-02-15',
    direction: 'outflow', amountCents: 120000, category: 'VENDOR',
    counterpartyType: 'Vendor', counterpartyName: 'Amazon Web Services',
    title: 'AWS Infrastructure — February', memo: 'Cloud compute, storage, CDN',
    status: 'SETTLED', settlementMethod: 'Card', referenceId: 'VND-2025-014',
    paymentId: 'pmt-0027',
  },
  {
    id: 'le-003', createdAt: '2025-02-10T09:15:00Z', effectiveAt: '2025-02-10',
    direction: 'outflow', amountCents: 80000, category: 'FACILITIES',
    counterpartyType: 'Vendor', counterpartyName: 'WeWork Miami',
    title: 'WeWork — February Membership', memo: 'Co-working space, 4 desks',
    status: 'SETTLED', settlementMethod: 'ACH', referenceId: 'FAC-2025-002',
    paymentId: 'pmt-0026', budgetBucketId: 'bkt-facilities',
  },
  {
    id: 'le-004', createdAt: '2025-02-05T11:00:00Z', effectiveAt: '2025-02-05',
    direction: 'outflow', amountCents: 350000, category: 'VENDOR',
    counterpartyType: 'Vendor', counterpartyName: 'Mitchell & Associates',
    title: 'IP Filing — Patent Application', memo: 'Utility patent filing, legal fees',
    status: 'SETTLED', settlementMethod: 'Wire', referenceId: 'VND-2025-013',
    paymentId: 'pmt-0025',
  },
  {
    id: 'le-005', createdAt: '2025-01-31T14:30:00Z', effectiveAt: '2025-01-31',
    direction: 'outflow', amountCents: 2800000, category: 'PAYROLL',
    counterpartyType: 'Employee', counterpartyName: 'Valuetainment Payroll',
    title: 'January Payroll', memo: 'Monthly payroll — all departments',
    status: 'SETTLED', settlementMethod: 'ACH', referenceId: 'PAY-2025-001',
    paymentId: 'pmt-0024', budgetBucketId: 'bkt-payroll',
  },
  {
    id: 'le-006', createdAt: '2025-01-15T16:00:00Z', effectiveAt: '2025-01-15',
    direction: 'inflow', amountCents: 35000000, category: 'CAPITAL',
    counterpartyType: 'Investor', counterpartyName: 'Velocity Ventures',
    title: 'SAFE Wire — Pre-Seed', memo: 'Pre-seed capital, SAFE note conversion',
    status: 'SETTLED', settlementMethod: 'Wire', referenceId: 'CAP-2025-001',
    eventId: 'evt-raise-001', paymentId: 'pmt-0023',
  },
  {
    id: 'le-007', createdAt: '2025-01-10T09:00:00Z', effectiveAt: '2025-01-10',
    direction: 'outflow', amountCents: 120000, category: 'VENDOR',
    counterpartyType: 'Vendor', counterpartyName: 'Amazon Web Services',
    title: 'AWS Infrastructure — January', memo: 'Cloud compute, storage, CDN',
    status: 'SETTLED', settlementMethod: 'Card', referenceId: 'VND-2025-001',
    paymentId: 'pmt-0022',
  },
  {
    id: 'le-008', createdAt: '2025-01-05T10:30:00Z', effectiveAt: '2025-01-05',
    direction: 'outflow', amountCents: 80000, category: 'FACILITIES',
    counterpartyType: 'Vendor', counterpartyName: 'WeWork Miami',
    title: 'WeWork — January Membership', memo: 'Co-working space, 4 desks',
    status: 'SETTLED', settlementMethod: 'ACH', referenceId: 'FAC-2025-001',
    paymentId: 'pmt-0021', budgetBucketId: 'bkt-facilities',
  },
  {
    id: 'le-009', createdAt: '2025-01-03T08:00:00Z', effectiveAt: '2025-01-03',
    direction: 'outflow', amountCents: 20000, category: 'OPERATIONS',
    counterpartyType: 'Vendor', counterpartyName: 'OpenAI',
    title: 'OpenAI API — January', memo: 'LLM API usage, GPT-4 tokens',
    status: 'SETTLED', settlementMethod: 'Card', referenceId: 'OPS-2025-001',
    paymentId: 'pmt-0020',
  },
  {
    id: 'le-010', createdAt: '2025-03-01T12:00:00Z', effectiveAt: '2025-03-01',
    direction: 'outflow', amountCents: 450000, category: 'VENDOR',
    counterpartyType: 'Vendor', counterpartyName: 'Sofia Reyes',
    title: 'Contractor Invoice — February', memo: 'Design contract, deliverables accepted',
    status: 'AUTHORIZED', settlementMethod: 'ACH', referenceId: 'VND-2025-015',
    paymentId: 'pmt-0029',
  },
  {
    id: 'le-011', createdAt: '2024-06-20T14:00:00Z', effectiveAt: '2024-06-20',
    direction: 'inflow', amountCents: 25000000, category: 'CAPITAL',
    counterpartyType: 'Investor', counterpartyName: 'Dr. Patricia Moore',
    title: 'SAFE Wire — Angel', memo: 'Angel round, SAFE note',
    status: 'SETTLED', settlementMethod: 'Wire', referenceId: 'CAP-2024-003',
    eventId: 'evt-raise-001', paymentId: 'pmt-0015',
  },
  {
    id: 'le-012', createdAt: '2025-02-20T09:00:00Z', effectiveAt: '2025-02-20',
    direction: 'outflow', amountCents: 15000, category: 'TAX',
    counterpartyType: 'Institution', counterpartyName: 'State of Delaware',
    title: 'Annual Franchise Tax', memo: 'Delaware franchise tax — FY 2024',
    status: 'SETTLED', settlementMethod: 'ACH', referenceId: 'TAX-2025-001',
    paymentId: 'pmt-0030',
  },
];

const INTERNAL_RAILS_ACTIVE = false;

const CATEGORIES: Category[] = [
  'CAPITAL', 'PAYROLL', 'NIL', 'TICKETING', 'DONATIONS',
  'VENDOR', 'FACILITIES', 'OPERATIONS', 'TAX', 'DEBT', 'OTHER',
];

const DATE_RANGES: DateRange[] = ['Today', 'This Week', 'This Month', 'Fiscal Year'];

const CATEGORY_ICON: Record<Category, string> = {
  CAPITAL: 'chart.bar.fill',
  PAYROLL: 'person.2.fill',
  NIL: 'star.fill',
  TICKETING: 'ticket.fill',
  DONATIONS: 'heart.fill',
  VENDOR: 'briefcase.fill',
  FACILITIES: 'building.2.fill',
  OPERATIONS: 'gearshape.fill',
  TAX: 'doc.text.fill',
  DEBT: 'creditcard.fill',
  OTHER: 'ellipsis.circle.fill',
};

const STATUS_COLOR: Record<EntryStatus, string> = {
  DRAFT: '#9CA3AF',
  AUTHORIZED: '#3B82F6',
  SCHEDULED: '#8B5CF6',
  SETTLED: '#22C55E',
  REVERSED: '#F59E0B',
  FAILED: '#EF4444',
};

// Tab indices: 0=Program, 1=People, 2=Finance, 3=Compliance, 4=Facilities, 5=Ledger
const TAB_FINANCE = 2;

// =============================================================================
// HELPERS
// =============================================================================

function formatCents(cents: number): string {
  return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function groupByDate(entries: LedgerEntry[]): Record<string, LedgerEntry[]> {
  const groups: Record<string, LedgerEntry[]> = {};
  entries.forEach((e) => {
    const key = formatDate(e.effectiveAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });
  return groups;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function BizLedger({ colors, accentColor, onNavigateTab }: Props) {
  const [fiscalYear, setFiscalYear] = useState(FISCAL_YEARS[0]);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('Fiscal Year');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  // Compute filtered entries
  const filtered = useMemo(() => {
    let list = [...ENTRIES];

    // FY filter
    if (fiscalYear === 'FY 2025') {
      list = list.filter((e) => e.effectiveAt >= '2025-01-01');
    } else {
      list = list.filter((e) => e.effectiveAt >= '2024-01-01' && e.effectiveAt < '2025-01-01');
    }

    // Category
    if (categoryFilter !== 'All') {
      list = list.filter((e) => e.category === categoryFilter);
    }

    // Search
    const term = search.toLowerCase().trim();
    if (term) {
      list = list.filter((e) =>
        e.counterpartyName.toLowerCase().includes(term) ||
        e.category.toLowerCase().includes(term) ||
        e.memo.toLowerCase().includes(term) ||
        e.referenceId.toLowerCase().includes(term) ||
        e.title.toLowerCase().includes(term) ||
        formatCents(e.amountCents).includes(term)
      );
    }

    // Sort newest first
    list.sort((a, b) => b.effectiveAt.localeCompare(a.effectiveAt));

    return list;
  }, [fiscalYear, categoryFilter, search]);

  // Balances
  const totalInflows = useMemo(
    () => filtered.filter((e) => e.direction === 'inflow').reduce((s, e) => s + e.amountCents, 0),
    [filtered],
  );
  const totalOutflows = useMemo(
    () => filtered.filter((e) => e.direction === 'outflow').reduce((s, e) => s + e.amountCents, 0),
    [filtered],
  );
  const net = totalInflows - totalOutflows;

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const openDetail = (entry: LedgerEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedEntry(entry);
    setDetailVisible(true);
  };

  const navigate = (tabIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNavigateTab?.(tabIndex);
  };

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Block 0 — Header */}
        <View style={[s.block, { borderColor: colors.border }]}>
          <ThemedText style={[s.pageTitle, { color: colors.text }]}>Ledger</ThemedText>
          <View style={s.fyRow}>
            {FISCAL_YEARS.map((fy) => (
              <Pressable
                key={fy}
                style={[
                  s.fyPill,
                  { backgroundColor: fy === fiscalYear ? colors.text : colors.backgroundTertiary },
                ]}
                onPress={() => { Haptics.selectionAsync(); setFiscalYear(fy); }}
              >
                <ThemedText
                  style={[s.fyText, { color: fy === fiscalYear ? colors.background : colors.textSecondary }]}
                >
                  {fy}
                </ThemedText>
              </Pressable>
            ))}
          </View>
          <View style={[s.searchBar, { backgroundColor: colors.backgroundTertiary, marginTop: 12 }]}>
            <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
            <TextInput
              style={[s.searchInput, { color: colors.text }]}
              placeholder="Search counterparty / category / memo / reference ID"
              placeholderTextColor={colors.textTertiary}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              autoCorrect={false}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Block 1 — Balances Snapshot */}
        <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>BALANCES SNAPSHOT</ThemedText>
        <View style={[s.block, { borderColor: colors.border }]}>
          <View style={s.balancesGrid}>
            <View style={s.balanceItem}>
              <ThemedText style={[s.balanceValue, { color: '#22C55E' }]}>
                {formatCents(totalInflows)}
              </ThemedText>
              <ThemedText style={[s.balanceLabel, { color: colors.textSecondary }]}>Total Inflows</ThemedText>
            </View>
            <View style={s.balanceItem}>
              <ThemedText style={[s.balanceValue, { color: '#EF4444' }]}>
                {formatCents(totalOutflows)}
              </ThemedText>
              <ThemedText style={[s.balanceLabel, { color: colors.textSecondary }]}>Total Outflows</ThemedText>
            </View>
            <View style={s.balanceItem}>
              <ThemedText style={[s.balanceValue, { color: net >= 0 ? '#22C55E' : '#EF4444' }]}>
                {net >= 0 ? '+' : ''}{formatCents(net)}
              </ThemedText>
              <ThemedText style={[s.balanceLabel, { color: colors.textSecondary }]}>Net</ThemedText>
            </View>
            <View style={s.balanceItem}>
              <ThemedText style={[s.balanceValue, { color: colors.textSecondary }]}>
                {INTERNAL_RAILS_ACTIVE ? '$0' : '—'}
              </ThemedText>
              <ThemedText style={[s.balanceLabel, { color: colors.textSecondary }]}>
                {INTERNAL_RAILS_ACTIVE ? 'Internal Wallet' : 'External Settlement'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Block 2 — Filters */}
        <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>FILTERS</ThemedText>
        <View style={[s.block, { borderColor: colors.border }]}>
          {/* Date Range */}
          <ThemedText style={[s.filterGroupLabel, { color: colors.textSecondary }]}>Date Range</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterPillRow}>
            {DATE_RANGES.map((dr) => (
              <Pressable
                key={dr}
                style={[
                  s.filterPill,
                  { backgroundColor: dr === dateRange ? colors.text : colors.backgroundTertiary },
                ]}
                onPress={() => { Haptics.selectionAsync(); setDateRange(dr); }}
              >
                <ThemedText style={[s.filterPillText, { color: dr === dateRange ? colors.background : colors.textSecondary }]}>
                  {dr}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>

          {/* Category */}
          <ThemedText style={[s.filterGroupLabel, { color: colors.textSecondary, marginTop: 12 }]}>Category</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterPillRow}>
            <Pressable
              style={[
                s.filterPill,
                { backgroundColor: categoryFilter === 'All' ? colors.text : colors.backgroundTertiary },
              ]}
              onPress={() => { Haptics.selectionAsync(); setCategoryFilter('All'); }}
            >
              <ThemedText style={[s.filterPillText, { color: categoryFilter === 'All' ? colors.background : colors.textSecondary }]}>
                All
              </ThemedText>
            </Pressable>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                style={[
                  s.filterPill,
                  { backgroundColor: categoryFilter === cat ? colors.text : colors.backgroundTertiary },
                ]}
                onPress={() => { Haptics.selectionAsync(); setCategoryFilter(cat); }}
              >
                <ThemedText style={[s.filterPillText, { color: categoryFilter === cat ? colors.background : colors.textSecondary }]}>
                  {cat}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Block 3 — Ledger Feed */}
        <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>
          LEDGER ({filtered.length} {filtered.length === 1 ? 'entry' : 'entries'})
        </ThemedText>

        {filtered.length === 0 ? (
          <View style={[s.block, { borderColor: colors.border }]}>
            <ThemedText style={[s.emptyNote, { color: colors.textTertiary }]}>
              No ledger entries match your filters.
            </ThemedText>
          </View>
        ) : (
          Object.entries(grouped).map(([date, entries]) => (
            <View key={date}>
              <ThemedText style={[s.dateGroupLabel, { color: colors.textSecondary }]}>{date}</ThemedText>
              {entries.map((entry) => {
                const isInflow = entry.direction === 'inflow';
                const isTransfer = entry.direction === 'internal_transfer';
                const amountColor = isTransfer ? '#8B5CF6' : isInflow ? '#22C55E' : '#EF4444';
                const statusColor = STATUS_COLOR[entry.status];

                return (
                  <Pressable
                    key={entry.id}
                    style={({ pressed }) => [
                      s.entryRow,
                      { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 },
                    ]}
                    onPress={() => openDetail(entry)}
                  >
                    {/* Left — Icon + Time */}
                    <View style={s.entryLeft}>
                      <View style={[s.categoryIcon, { backgroundColor: amountColor + '15' }]}>
                        <IconSymbol
                          name={CATEGORY_ICON[entry.category] as any}
                          size={16}
                          color={amountColor}
                        />
                      </View>
                      <ThemedText style={[s.entryTime, { color: colors.textTertiary }]}>
                        {formatTime(entry.createdAt)}
                      </ThemedText>
                    </View>

                    {/* Center — Title + Memo */}
                    <View style={s.entryCenter}>
                      <ThemedText style={[s.entryTitle, { color: colors.text }]} numberOfLines={1}>
                        {entry.title}
                      </ThemedText>
                      <ThemedText style={[s.entryMemo, { color: colors.textSecondary }]} numberOfLines={1}>
                        {entry.memo}
                      </ThemedText>
                      <View style={s.entryTags}>
                        <View style={[s.categoryChip, { backgroundColor: colors.backgroundTertiary }]}>
                          <ThemedText style={[s.categoryChipText, { color: colors.textSecondary }]}>
                            {entry.category}
                          </ThemedText>
                        </View>
                      </View>
                    </View>

                    {/* Right — Amount + Status */}
                    <View style={s.entryRight}>
                      <ThemedText style={[s.entryAmount, { color: amountColor }]}>
                        {isInflow ? '+' : isTransfer ? '' : '-'}{formatCents(entry.amountCents)}
                      </ThemedText>
                      <View style={[s.statusChip, { backgroundColor: statusColor + '20' }]}>
                        <ThemedText style={[s.statusChipText, { color: statusColor }]}>
                          {entry.status}
                        </ThemedText>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      {/* Entry Detail Sheet — Read-Only */}
      <BottomSheet
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        title="Ledger Entry"
      >
        {selectedEntry && (
          <BottomSheetScrollView contentContainerStyle={s.detailScroll}>
            {/* Amount + Direction */}
            <View style={s.detailAmountRow}>
              <ThemedText style={[
                s.detailAmount,
                { color: selectedEntry.direction === 'inflow' ? '#22C55E' : '#EF4444' },
              ]}>
                {selectedEntry.direction === 'inflow' ? '+' : '-'}{formatCents(selectedEntry.amountCents)}
              </ThemedText>
              <View style={[
                s.directionChip,
                { backgroundColor: (selectedEntry.direction === 'inflow' ? '#22C55E' : '#EF4444') + '20' },
              ]}>
                <ThemedText style={[
                  s.directionChipText,
                  { color: selectedEntry.direction === 'inflow' ? '#22C55E' : '#EF4444' },
                ]}>
                  {selectedEntry.direction === 'inflow' ? 'INFLOW' : selectedEntry.direction === 'outflow' ? 'OUTFLOW' : 'TRANSFER'}
                </ThemedText>
              </View>
            </View>

            {/* Status */}
            <View style={[s.detailStatusRow, { marginBottom: Spacing.md }]}>
              <View style={[s.statusChip, { backgroundColor: STATUS_COLOR[selectedEntry.status] + '20' }]}>
                <ThemedText style={[s.statusChipText, { color: STATUS_COLOR[selectedEntry.status] }]}>
                  {selectedEntry.status}
                </ThemedText>
              </View>
            </View>

            {/* Detail Fields */}
            <View style={[s.detailBlock, { borderColor: colors.border }]}>
              <DetailRow label="Title" value={selectedEntry.title} colors={colors} />
              <DetailRow label="Category" value={selectedEntry.category} colors={colors} />
              <DetailRow label="Counterparty" value={selectedEntry.counterpartyName} colors={colors} />
              <DetailRow label="Counterparty Type" value={selectedEntry.counterpartyType} colors={colors} />
              <DetailRow label="Memo" value={selectedEntry.memo} colors={colors} multiline />
              <DetailRow label="Created" value={`${formatDate(selectedEntry.createdAt)} at ${formatTime(selectedEntry.createdAt)}`} colors={colors} />
              <DetailRow label="Effective Date" value={formatDate(selectedEntry.effectiveAt)} colors={colors} />
              <DetailRow label="Settlement Method" value={selectedEntry.settlementMethod} colors={colors} />
              <DetailRow label="Reference ID" value={selectedEntry.referenceId} colors={colors} />
              {selectedEntry.eventId && (
                <DetailRow label="Linked Event ID" value={selectedEntry.eventId} colors={colors} />
              )}
              {selectedEntry.paymentId && (
                <DetailRow label="Linked Payment ID" value={selectedEntry.paymentId} colors={colors} />
              )}
              {selectedEntry.budgetBucketId && (
                <DetailRow label="Budget Bucket ID" value={selectedEntry.budgetBucketId} colors={colors} />
              )}
            </View>

            {/* Navigation — read-only links */}
            <ThemedText style={[s.detailNavLabel, { color: colors.textTertiary }]}>NAVIGATE</ThemedText>
            <View style={[s.detailBlock, { borderColor: colors.border }]}>
              {selectedEntry.eventId && (
                <Pressable
                  style={({ pressed }) => [s.navRow, { opacity: pressed ? 0.6 : 1 }]}
                  onPress={() => { setDetailVisible(false); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                >
                  <ThemedText style={[s.navRowText, { color: colors.text }]}>Open Event</ThemedText>
                  <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
                </Pressable>
              )}
              <Pressable
                style={({ pressed }) => [
                  s.navRow,
                  { opacity: pressed ? 0.6 : 1, borderTopWidth: selectedEntry.eventId ? StyleSheet.hairlineWidth : 0, borderTopColor: colors.border },
                ]}
                onPress={() => { setDetailVisible(false); navigate(TAB_FINANCE); }}
              >
                <ThemedText style={[s.navRowText, { color: colors.text }]}>Open Finance Summary</ThemedText>
                <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
              </Pressable>
            </View>

            {/* Immutability notice */}
            <View style={[s.immutableNotice, { backgroundColor: colors.backgroundTertiary }]}>
              <IconSymbol name="lock.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.immutableText, { color: colors.textTertiary }]}>
                Ledger entries are immutable. Corrections require a new reversal or adjustment entry.
              </ThemedText>
            </View>
          </BottomSheetScrollView>
        )}
      </BottomSheet>
    </>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function DetailRow({
  label,
  value,
  colors,
  multiline,
}: {
  label: string;
  value: string;
  colors: typeof Colors.light;
  multiline?: boolean;
}) {
  return (
    <View style={[s.fieldRow, multiline && s.fieldRowMultiline]}>
      <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
      <ThemedText style={[s.fieldValue, { color: colors.text }, multiline && s.fieldValueMultiline]}>
        {value}
      </ThemedText>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  scroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  block: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },

  // Header
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  fyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fyPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  fyText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
  },

  // Balances
  balancesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  balanceItem: {
    width: '50%',
    paddingVertical: 8,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  balanceLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // Filters
  filterGroupLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  filterPillRow: {
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Date group
  dateGroupLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: Spacing.sm,
    marginBottom: 4,
  },

  // Entry rows
  entryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  entryLeft: {
    alignItems: 'center',
    gap: 4,
    width: 48,
  },
  categoryIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryTime: {
    fontSize: 10,
    fontWeight: '500',
  },
  entryCenter: {
    flex: 1,
    minWidth: 0,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  entryMemo: {
    fontSize: 12,
    marginTop: 2,
  },
  entryTags: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  categoryChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  entryRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  entryAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statusChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusChipText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Empty
  emptyNote: {
    fontSize: 13,
    fontStyle: 'italic',
  },

  // Detail sheet
  detailScroll: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  detailAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  detailAmount: {
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  directionChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  directionChipText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  detailStatusRow: {
    flexDirection: 'row',
  },
  detailBlock: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  detailNavLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  navRowText: {
    fontSize: 14,
    fontWeight: '500',
  },
  immutableNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.lg,
    padding: 12,
    borderRadius: 10,
  },
  immutableText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },

  // Field rows
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  fieldRowMultiline: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    maxWidth: '55%',
  },
  fieldValueMultiline: {
    textAlign: 'left',
    maxWidth: '100%',
    lineHeight: 19,
  },
});
