/**
 * Church Ledger V3 — Transaction History (Single-Scroll)
 * 4 blocks: Header + Search, Balance Snapshot, Filters Row, Ledger Feed
 *
 * Campus-scoped, RBAC-aware. Append-only transaction log.
 * A1/A2: See aggregate inflows/outflows, category totals, masked counterparties.
 * Cannot see: individual donors, payroll details, vendor banking, restricted fund IDs.
 * Sensitive counterparties masked: "Donor (Anonymous)", "Staff Payroll", "Vendor – Redacted".
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { isStaffLevel, type ChurchRoleLens } from '@/utils/rbac/church-registry';

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

const ACCENT = MODE_ACCENT.church;

// =============================================================================
// CATEGORIES (stable v1 enum)
// =============================================================================

type LedgerCategory =
  | 'TITHES' | 'OFFERINGS' | 'MISSIONS' | 'DESIGNATED'
  | 'FACILITIES' | 'STAFF' | 'OUTREACH' | 'MINISTRY_EXPENSE'
  | 'OPERATIONS' | 'OTHER';

const CATEGORY_LABELS: Record<LedgerCategory, string> = {
  TITHES: 'Tithes',
  OFFERINGS: 'Offerings',
  MISSIONS: 'Missions',
  DESIGNATED: 'Designated',
  FACILITIES: 'Facilities',
  STAFF: 'Staff',
  OUTREACH: 'Outreach',
  MINISTRY_EXPENSE: 'Ministry Expense',
  OPERATIONS: 'Operations',
  OTHER: 'Other',
};

const CATEGORY_ICONS: Record<LedgerCategory, string> = {
  TITHES: 'heart.fill',
  OFFERINGS: 'gift.fill',
  MISSIONS: 'globe.americas.fill',
  DESIGNATED: 'tag.fill',
  FACILITIES: 'building.2.fill',
  STAFF: 'person.fill',
  OUTREACH: 'hand.raised.fill',
  MINISTRY_EXPENSE: 'folder.fill',
  OPERATIONS: 'gearshape.fill',
  OTHER: 'ellipsis.circle.fill',
};

const CATEGORY_COLORS: Record<LedgerCategory, string> = {
  TITHES: '#22C55E',
  OFFERINGS: '#22C55E',
  MISSIONS: '#3B82F6',
  DESIGNATED: '#8B5CF6',
  FACILITIES: '#F59E0B',
  STAFF: '#EF4444',
  OUTREACH: '#06B6D4',
  MINISTRY_EXPENSE: '#F97316',
  OPERATIONS: '#A1A1AA',
  OTHER: '#6B7280',
};

// =============================================================================
// MOCK DATA
// =============================================================================

type TxDirection = 'inflow' | 'outflow';
type TxStatus = 'Settled' | 'Pending';

interface LedgerEntry {
  id: string;
  title: string;
  memo: string;
  amount: number;
  direction: TxDirection;
  category: LedgerCategory;
  ministry?: string;
  status: TxStatus;
  counterparty: string;
  counterpartySensitive: boolean;
  rail?: 'ACH' | 'Card' | 'Wire' | 'Internal';
  referenceId: string;
  createdAt: string;
  effectiveDate: string;
  dateGroup: string; // for grouping display
}

const LEDGER_ENTRIES: LedgerEntry[] = [
  // Feb 23
  { id: 'le1', title: 'Sunday Tithes', memo: 'Weekly tithe collection — AM service', amount: 4250, direction: 'inflow', category: 'TITHES', status: 'Settled', counterparty: 'Donor (Anonymous)', counterpartySensitive: true, rail: 'ACH', referenceId: 'TXN-2026-0223-001', createdAt: 'Feb 23, 2026 11:45 AM', effectiveDate: 'Feb 23, 2026', dateGroup: 'Feb 23, 2026' },
  { id: 'le2', title: 'Sunday Offerings', memo: 'General offering — AM + PM services', amount: 1820, direction: 'inflow', category: 'OFFERINGS', status: 'Settled', counterparty: 'Donor (Anonymous)', counterpartySensitive: true, rail: 'Card', referenceId: 'TXN-2026-0223-002', createdAt: 'Feb 23, 2026 12:00 PM', effectiveDate: 'Feb 23, 2026', dateGroup: 'Feb 23, 2026' },
  // Feb 21
  { id: 'le3', title: "Children's Ministry Supplies", memo: 'Curriculum kits + craft materials', amount: 340, direction: 'outflow', category: 'MINISTRY_EXPENSE', ministry: "Children's Ministry", status: 'Settled', counterparty: 'Vendor – Redacted', counterpartySensitive: true, rail: 'Card', referenceId: 'TXN-2026-0221-001', createdAt: 'Feb 21, 2026 2:30 PM', effectiveDate: 'Feb 21, 2026', dateGroup: 'Feb 21, 2026' },
  { id: 'le4', title: 'Facility Maintenance', memo: 'HVAC quarterly service — Main Building', amount: 1200, direction: 'outflow', category: 'FACILITIES', status: 'Settled', counterparty: 'Vendor – Redacted', counterpartySensitive: true, rail: 'ACH', referenceId: 'TXN-2026-0221-002', createdAt: 'Feb 21, 2026 10:00 AM', effectiveDate: 'Feb 21, 2026', dateGroup: 'Feb 21, 2026' },
  // Feb 19
  { id: 'le5', title: 'Missions Wire — Kenya Partner', memo: 'Monthly support — Nairobi church plant', amount: 2500, direction: 'outflow', category: 'MISSIONS', status: 'Settled', counterparty: 'Kenya Partner Church', counterpartySensitive: false, rail: 'Wire', referenceId: 'TXN-2026-0219-001', createdAt: 'Feb 19, 2026 9:00 AM', effectiveDate: 'Feb 19, 2026', dateGroup: 'Feb 19, 2026' },
  // Feb 17
  { id: 'le6', title: 'Staff Payroll — February', memo: 'Bi-monthly payroll run', amount: 10000, direction: 'outflow', category: 'STAFF', status: 'Settled', counterparty: 'Staff Payroll', counterpartySensitive: true, rail: 'ACH', referenceId: 'TXN-2026-0217-001', createdAt: 'Feb 17, 2026 8:00 AM', effectiveDate: 'Feb 17, 2026', dateGroup: 'Feb 17, 2026' },
  { id: 'le7', title: 'Designated Gift — Building Fund', memo: 'Restricted building fund contribution', amount: 5000, direction: 'inflow', category: 'DESIGNATED', status: 'Settled', counterparty: 'Donor (Anonymous)', counterpartySensitive: true, rail: 'ACH', referenceId: 'TXN-2026-0217-002', createdAt: 'Feb 17, 2026 3:00 PM', effectiveDate: 'Feb 17, 2026', dateGroup: 'Feb 17, 2026' },
  // Feb 15
  { id: 'le8', title: 'Outreach Event Catering', memo: 'Community dinner — 120 meals', amount: 480, direction: 'outflow', category: 'OUTREACH', status: 'Settled', counterparty: 'Vendor – Redacted', counterpartySensitive: true, rail: 'Card', referenceId: 'TXN-2026-0215-001', createdAt: 'Feb 15, 2026 1:00 PM', effectiveDate: 'Feb 15, 2026', dateGroup: 'Feb 15, 2026' },
  { id: 'le9', title: 'Office Supplies', memo: 'Printer paper, toner, misc admin', amount: 185, direction: 'outflow', category: 'OPERATIONS', status: 'Settled', counterparty: 'Vendor – Redacted', counterpartySensitive: true, rail: 'Card', referenceId: 'TXN-2026-0215-002', createdAt: 'Feb 15, 2026 11:30 AM', effectiveDate: 'Feb 15, 2026', dateGroup: 'Feb 15, 2026' },
  // Feb 14
  { id: 'le10', title: 'Youth Camp Registration', memo: 'Early bird registration deposits', amount: 1500, direction: 'inflow', category: 'DESIGNATED', ministry: 'Catalyst Youth', status: 'Pending', counterparty: 'Donor (Anonymous)', counterpartySensitive: true, rail: 'Card', referenceId: 'TXN-2026-0214-001', createdAt: 'Feb 14, 2026 4:00 PM', effectiveDate: 'Feb 14, 2026', dateGroup: 'Feb 14, 2026' },
  // Feb 12
  { id: 'le11', title: 'Worship Team Equipment', memo: 'Replacement guitar strings + cables', amount: 220, direction: 'outflow', category: 'MINISTRY_EXPENSE', ministry: 'Worship Team', status: 'Settled', counterparty: 'Vendor – Redacted', counterpartySensitive: true, rail: 'Card', referenceId: 'TXN-2026-0212-001', createdAt: 'Feb 12, 2026 3:15 PM', effectiveDate: 'Feb 12, 2026', dateGroup: 'Feb 12, 2026' },
  { id: 'le12', title: 'Utility Payment — Electric', memo: 'Monthly electricity — Main Building', amount: 890, direction: 'outflow', category: 'FACILITIES', status: 'Settled', counterparty: 'LADWP', counterpartySensitive: false, rail: 'ACH', referenceId: 'TXN-2026-0212-002', createdAt: 'Feb 12, 2026 9:00 AM', effectiveDate: 'Feb 12, 2026', dateGroup: 'Feb 12, 2026' },
  // Feb 10
  { id: 'le13', title: 'Missions Offering — Special', memo: 'Missions Sunday special collection', amount: 3200, direction: 'inflow', category: 'MISSIONS', status: 'Settled', counterparty: 'Donor (Anonymous)', counterpartySensitive: true, rail: 'ACH', referenceId: 'TXN-2026-0210-001', createdAt: 'Feb 10, 2026 12:30 PM', effectiveDate: 'Feb 10, 2026', dateGroup: 'Feb 10, 2026' },
  { id: 'le14', title: 'Insurance Premium', memo: 'Quarterly liability + property insurance', amount: 2100, direction: 'outflow', category: 'OPERATIONS', status: 'Pending', counterparty: 'Vendor – Redacted', counterpartySensitive: true, rail: 'ACH', referenceId: 'TXN-2026-0210-002', createdAt: 'Feb 10, 2026 8:00 AM', effectiveDate: 'Feb 10, 2026', dateGroup: 'Feb 10, 2026' },
];

const FISCAL_YEARS = ['FY 2025-26', 'FY 2024-25'];

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US');
}

function SectionLabel({ label, colors }: { label: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[s.sectionLabel, { color: colors.textSecondary }]}>
      {label}
    </ThemedText>
  );
}

function Card({ colors, children }: { colors: typeof Colors.light; children: React.ReactNode }) {
  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

function StatusChip({ status, color }: { status: string; color: string }) {
  return (
    <View style={[s.chip, { backgroundColor: color + '18' }]}>
      <ThemedText style={[s.chipText, { color }]}>{status}</ThemedText>
    </View>
  );
}

// =============================================================================
// FILTER STATE
// =============================================================================

type CategoryFilter = 'All' | LedgerCategory;
type StatusFilter = 'All' | TxStatus;

const CATEGORY_FILTER_OPTIONS: CategoryFilter[] = [
  'All', 'TITHES', 'OFFERINGS', 'MISSIONS', 'DESIGNATED',
  'FACILITIES', 'STAFF', 'OUTREACH', 'MINISTRY_EXPENSE', 'OPERATIONS', 'OTHER',
];

const STATUS_FILTER_OPTIONS: StatusFilter[] = ['All', 'Settled', 'Pending'];

// =============================================================================
// ENTRY DETAIL SHEET
// =============================================================================

function EntryDetailSheet({
  entry,
  visible,
  onClose,
  colors,
}: {
  entry: LedgerEntry | null;
  visible: boolean;
  onClose: () => void;
  colors: typeof Colors.light;
}) {
  if (!entry) return null;
  const catColor = CATEGORY_COLORS[entry.category];
  const isInflow = entry.direction === 'inflow';

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={s.sheetContent}>
        <ThemedText style={[s.sheetTitle, { color: colors.text }]}>{entry.title}</ThemedText>

        {/* Amount */}
        <ThemedText style={[s.detailAmount, { color: isInflow ? '#22C55E' : '#EF4444' }]}>
          {isInflow ? '+' : '-'}{formatCurrency(entry.amount)}
        </ThemedText>

        {/* Direction */}
        <View style={s.detailRow}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Direction</ThemedText>
          <ThemedText style={[s.detailValue, { color: colors.text }]}>
            {isInflow ? 'Inflow' : 'Outflow'}
          </ThemedText>
        </View>

        {/* Category */}
        <View style={s.detailRow}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Category</ThemedText>
          <View style={[s.chip, { backgroundColor: catColor + '18' }]}>
            <ThemedText style={[s.chipText, { color: catColor }]}>{CATEGORY_LABELS[entry.category]}</ThemedText>
          </View>
        </View>

        {/* Ministry */}
        {entry.ministry && (
          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Ministry</ThemedText>
            <ThemedText style={[s.detailValue, { color: colors.text }]}>{entry.ministry}</ThemedText>
          </View>
        )}

        {/* Status */}
        <View style={s.detailRow}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Status</ThemedText>
          <StatusChip
            status={entry.status}
            color={entry.status === 'Settled' ? '#22C55E' : '#F59E0B'}
          />
        </View>

        {/* Counterparty */}
        <View style={s.detailRow}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Counterparty</ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {entry.counterpartySensitive && (
              <IconSymbol name="lock.fill" size={10} color={colors.textTertiary} />
            )}
            <ThemedText style={[s.detailValue, { color: entry.counterpartySensitive ? colors.textTertiary : colors.text }]}>
              {entry.counterparty}
            </ThemedText>
          </View>
        </View>

        {/* Rail */}
        {entry.rail && (
          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Rail</ThemedText>
            <ThemedText style={[s.detailValue, { color: colors.text }]}>{entry.rail}</ThemedText>
          </View>
        )}

        {/* Dates */}
        <View style={s.detailRow}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Created</ThemedText>
          <ThemedText style={[s.detailValue, { color: colors.text }]}>{entry.createdAt}</ThemedText>
        </View>
        <View style={s.detailRow}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Effective Date</ThemedText>
          <ThemedText style={[s.detailValue, { color: colors.text }]}>{entry.effectiveDate}</ThemedText>
        </View>

        {/* Memo */}
        {entry.memo && (
          <View style={[s.memoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.memoLabel, { color: colors.textSecondary }]}>Memo</ThemedText>
            <ThemedText style={[s.memoText, { color: colors.text }]}>{entry.memo}</ThemedText>
          </View>
        )}

        {/* Reference ID */}
        <ThemedText style={[s.refId, { color: colors.textTertiary }]}>
          Ref: {entry.referenceId}
        </ThemedText>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function ChurchLedger({ colors, accentColor, role }: Props) {
  const churchRole = (role ?? 'C8') as ChurchRoleLens;

  const [search, setSearch] = useState('');
  const [fiscalYear, setFiscalYear] = useState(FISCAL_YEARS[0]);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  // Compute aggregates
  const totalInflows = LEDGER_ENTRIES.filter((e) => e.direction === 'inflow').reduce((s, e) => s + e.amount, 0);
  const totalOutflows = LEDGER_ENTRIES.filter((e) => e.direction === 'outflow').reduce((s, e) => s + e.amount, 0);
  const net = totalInflows - totalOutflows;

  // Filter pipeline
  const filtered = useMemo(() => {
    let entries = LEDGER_ENTRIES;
    if (categoryFilter !== 'All') entries = entries.filter((e) => e.category === categoryFilter);
    if (statusFilter !== 'All') entries = entries.filter((e) => e.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      entries = entries.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.memo.toLowerCase().includes(q) ||
          CATEGORY_LABELS[e.category].toLowerCase().includes(q) ||
          (e.ministry && e.ministry.toLowerCase().includes(q)) ||
          e.amount.toString().includes(q)
      );
    }
    return entries;
  }, [categoryFilter, statusFilter, search]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: { date: string; entries: LedgerEntry[] }[] = [];
    const map = new Map<string, LedgerEntry[]>();
    for (const e of filtered) {
      const arr = map.get(e.dateGroup) ?? [];
      arr.push(e);
      map.set(e.dateGroup, arr);
    }
    for (const [date, entries] of map) {
      groups.push({ date, entries });
    }
    return groups;
  }, [filtered]);

  const openEntry = useCallback((entry: LedgerEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedEntry(entry);
    setDetailVisible(true);
  }, []);

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* ── Block 0 — Header ──────────────────────────────────────── */}
        <View style={s.headerRow}>
          <ThemedText style={[s.title, { color: colors.text }]}>Ledger</ThemedText>
          <Pressable
            style={[s.fyPill, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.selectionAsync();
              setFiscalYear((prev) => prev === FISCAL_YEARS[0] ? FISCAL_YEARS[1] : FISCAL_YEARS[0]);
            }}
          >
            <ThemedText style={[s.fyText, { color: colors.text }]}>{fiscalYear}</ThemedText>
            <IconSymbol name="chevron.down" size={10} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={15} color={colors.textSecondary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search category / memo / amount"
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <IconSymbol name="xmark.circle.fill" size={15} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* ── Block 1 — Balance Snapshot ─────────────────────────────── */}
        <SectionLabel label="BALANCE SNAPSHOT" colors={colors} />
        <Card colors={colors}>
          <View style={s.balanceGrid}>
            <View style={s.balanceCell}>
              <ThemedText style={[s.balanceValue, { color: '#22C55E' }]}>{formatCurrency(totalInflows)}</ThemedText>
              <ThemedText style={[s.balanceLabel, { color: colors.textSecondary }]}>Total Inflows</ThemedText>
            </View>
            <View style={s.balanceCell}>
              <ThemedText style={[s.balanceValue, { color: '#EF4444' }]}>{formatCurrency(totalOutflows)}</ThemedText>
              <ThemedText style={[s.balanceLabel, { color: colors.textSecondary }]}>Total Outflows</ThemedText>
            </View>
            <View style={s.balanceCell}>
              <ThemedText style={[s.balanceValue, { color: net >= 0 ? '#22C55E' : '#EF4444' }]}>
                {net >= 0 ? '+' : ''}{formatCurrency(net)}
              </ThemedText>
              <ThemedText style={[s.balanceLabel, { color: colors.textSecondary }]}>Net</ThemedText>
            </View>
          </View>
          <View style={[s.statusBar, { borderColor: colors.border }]}>
            <ThemedText style={[s.statusBarLabel, { color: colors.textSecondary }]}>Financial Status</ThemedText>
            <StatusChip status="Healthy" color="#22C55E" />
          </View>
        </Card>

        {/* ── Block 2 — Filters Row ──────────────────────────────────── */}
        <SectionLabel label="FILTERS" colors={colors} />

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
          {CATEGORY_FILTER_OPTIONS.map((cat) => {
            const active = categoryFilter === cat;
            const color = cat === 'All' ? ACCENT : CATEGORY_COLORS[cat as LedgerCategory];
            return (
              <Pressable
                key={cat}
                style={[s.filterPill, { backgroundColor: active ? color + '20' : colors.card, borderColor: active ? color : colors.border }]}
                onPress={() => { Haptics.selectionAsync(); setCategoryFilter(cat); }}
              >
                <ThemedText style={[s.filterPillText, { color: active ? color : colors.textSecondary }]}>
                  {cat === 'All' ? 'All' : CATEGORY_LABELS[cat as LedgerCategory]}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Status chips */}
        <View style={s.statusFilterRow}>
          {STATUS_FILTER_OPTIONS.map((st) => {
            const active = statusFilter === st;
            const color = st === 'Settled' ? '#22C55E' : st === 'Pending' ? '#F59E0B' : ACCENT;
            return (
              <Pressable
                key={st}
                style={[s.filterPill, { backgroundColor: active ? color + '20' : colors.card, borderColor: active ? color : colors.border }]}
                onPress={() => { Haptics.selectionAsync(); setStatusFilter(st); }}
              >
                <ThemedText style={[s.filterPillText, { color: active ? color : colors.textSecondary }]}>{st}</ThemedText>
              </Pressable>
            );
          })}
        </View>

        {/* ── Block 3 — Ledger Feed ──────────────────────────────────── */}
        <SectionLabel label={`${filtered.length} TRANSACTION${filtered.length !== 1 ? 'S' : ''}`} colors={colors} />

        {grouped.length === 0 ? (
          <Card colors={colors}>
            <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>
              No transactions match your filters.
            </ThemedText>
          </Card>
        ) : (
          grouped.map((group) => (
            <View key={group.date}>
              <ThemedText style={[s.dateHeader, { color: colors.textTertiary }]}>{group.date}</ThemedText>
              <Card colors={colors}>
                {group.entries.map((entry, idx) => {
                  const catColor = CATEGORY_COLORS[entry.category];
                  const isInflow = entry.direction === 'inflow';
                  return (
                    <Pressable
                      key={entry.id}
                      style={[
                        s.entryRow,
                        idx < group.entries.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                      ]}
                      onPress={() => openEntry(entry)}
                    >
                      {/* Category Icon */}
                      <View style={[s.catIcon, { backgroundColor: catColor + '18' }]}>
                        <IconSymbol name={CATEGORY_ICONS[entry.category] as any} size={14} color={catColor} />
                      </View>

                      {/* Center: Title + Meta */}
                      <View style={s.entryCenter}>
                        <ThemedText style={[s.entryTitle, { color: colors.text }]} numberOfLines={1}>
                          {entry.title}
                        </ThemedText>
                        <View style={s.entryMeta}>
                          <ThemedText style={[s.entryMemo, { color: colors.textTertiary }]} numberOfLines={1}>
                            {entry.memo}
                          </ThemedText>
                          {entry.ministry && (
                            <View style={[s.ministryTag, { backgroundColor: ACCENT + '15' }]}>
                              <ThemedText style={[s.ministryTagText, { color: ACCENT }]}>{entry.ministry}</ThemedText>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Right: Amount + Status */}
                      <View style={s.entryRight}>
                        <ThemedText style={[s.entryAmount, { color: isInflow ? '#22C55E' : '#EF4444' }]}>
                          {isInflow ? '+' : '-'}{formatCurrency(entry.amount)}
                        </ThemedText>
                        <StatusChip
                          status={entry.status}
                          color={entry.status === 'Settled' ? '#22C55E' : '#F59E0B'}
                        />
                      </View>
                    </Pressable>
                  );
                })}
              </Card>
            </View>
          ))
        )}

        {/* Append-only notice */}
        <View style={s.appendNotice}>
          <IconSymbol name="lock.fill" size={11} color={colors.textTertiary} />
          <ThemedText style={[s.appendText, { color: colors.textTertiary }]}>
            Ledger is append-only. Corrections via reversal entries only.
          </ThemedText>
        </View>
      </ScrollView>

      {/* ── Entry Detail Sheet ──────────────────────────────────────── */}
      <EntryDetailSheet
        entry={selectedEntry}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        colors={colors}
      />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.md, paddingBottom: 120 },

  // -- Header --
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800' },
  fyPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: 1 },
  fyText: { fontSize: 12, fontWeight: '600' },

  // -- Search --
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 4 },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },

  // -- Section --
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 8, marginTop: 20 },

  // -- Card --
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },

  // -- Chip --
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  chipText: { fontSize: 10, fontWeight: '700' },

  // -- Balance --
  balanceGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  balanceCell: { flex: 1, alignItems: 'center' },
  balanceValue: { fontSize: 16, fontWeight: '800', fontVariant: ['tabular-nums'] },
  balanceLabel: { fontSize: 10, marginTop: 2 },
  statusBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  statusBarLabel: { fontSize: 12, fontWeight: '500' },

  // -- Filters --
  filterScroll: { flexGrow: 0, marginBottom: 8 },
  filterPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: 1, marginRight: 8 },
  filterPillText: { fontSize: 11, fontWeight: '600' },
  statusFilterRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },

  // -- Date Group --
  dateHeader: { fontSize: 11, fontWeight: '600', marginTop: 8, marginBottom: 6 },

  // -- Entry Row --
  entryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  catIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  entryCenter: { flex: 1 },
  entryTitle: { fontSize: 13, fontWeight: '600' },
  entryMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  entryMemo: { fontSize: 11, flex: 1 },
  ministryTag: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.full },
  ministryTagText: { fontSize: 9, fontWeight: '600' },
  entryRight: { alignItems: 'flex-end', gap: 4 },
  entryAmount: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },

  // -- Empty --
  emptyText: { fontSize: 13, textAlign: 'center', paddingVertical: 20 },

  // -- Append notice --
  appendNotice: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  appendText: { fontSize: 11 },

  // -- Detail Sheet --
  sheetContent: { padding: Spacing.md, paddingBottom: 40 },
  sheetTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  detailAmount: { fontSize: 28, fontWeight: '800', fontVariant: ['tabular-nums'], marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ffffff10' },
  detailLabel: { fontSize: 12, fontWeight: '500' },
  detailValue: { fontSize: 13, fontWeight: '600' },
  memoBox: { marginTop: 16, padding: 12, borderRadius: 10, borderWidth: 1 },
  memoLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3, marginBottom: 4 },
  memoText: { fontSize: 13, lineHeight: 18 },
  refId: { fontSize: 10, textAlign: 'center', marginTop: 16 },
});
