/**
 * Sports Ledger V3 — A2 (Recruiting Coordinator) Audit Trail
 * Blocks: Balances Snapshot, Quick View Pills, Day-Grouped Ledger Feed
 * + Entry Detail Sheet on tap.
 *
 * Ledger = append-only record of financial reality (read-only).
 * Finance = constraints. Ledger = what actually happened.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { openPlayerCard } from '@/utils/global-entity-sheets';

// =============================================================================
// TYPES
// =============================================================================

type Direction = 'inflow' | 'outflow';
type LedgerCategory = 'NIL' | 'SCHOLARSHIPS' | 'TRAVEL' | 'EQUIPMENT' | 'FACILITIES' | 'GAME_OPS' | 'RECRUITING' | 'OTHER';
type LedgerStatus = 'PENDING' | 'SETTLED' | 'FAILED';
type CounterpartyType = 'PLAYER' | 'VENDOR' | 'SCHOOL' | 'OTHER';
type Rail = 'ACH' | 'CARD' | 'WIRE' | 'CHECK' | 'CASH' | 'INTERNAL';
type QuickView = 'All' | 'NIL' | 'Scholarships' | 'Travel' | 'Vendors';

interface LedgerEntry {
  id: string;
  createdAt: string;
  effectiveAt: string;
  direction: Direction;
  amountCents: number;
  category: LedgerCategory;
  tags?: string[];
  counterpartyType: CounterpartyType;
  counterpartyName: string;
  title: string;
  memo?: string;
  status: LedgerStatus;
  rail?: Rail;
  referenceId?: string;
  playerId?: string;
}

// =============================================================================
// MOCK DATA
// =============================================================================

const ENTRIES: LedgerEntry[] = [
  // Feb 25
  { id: 'le1', createdAt: '2026-02-25T14:30:00', effectiveAt: '2026-02-25', direction: 'outflow', amountCents: 850000, category: 'NIL', counterpartyType: 'PLAYER', counterpartyName: 'Marcus Johnson', title: 'NIL Allocation — Q1', memo: 'Monthly NIL disbursement', status: 'SETTLED', rail: 'ACH', referenceId: 'NIL-2026-0025', playerId: 'p1' },
  { id: 'le2', createdAt: '2026-02-25T10:15:00', effectiveAt: '2026-02-25', direction: 'outflow', amountCents: 42000, category: 'TRAVEL', counterpartyType: 'VENDOR', counterpartyName: 'Shell Gas', title: 'Road trip fuel — Bellevue', memo: 'Team van fuel', status: 'SETTLED', rail: 'CARD', referenceId: 'TRV-2026-0089' },
  // Feb 24
  { id: 'le3', createdAt: '2026-02-24T16:00:00', effectiveAt: '2026-02-24', direction: 'outflow', amountCents: 700000, category: 'NIL', counterpartyType: 'PLAYER', counterpartyName: 'Andre Mitchell Jr.', title: 'NIL Allocation — Q1', memo: 'Monthly NIL disbursement', status: 'SETTLED', rail: 'ACH', referenceId: 'NIL-2026-0024', playerId: 'p11' },
  { id: 'le4', createdAt: '2026-02-24T09:00:00', effectiveAt: '2026-02-24', direction: 'outflow', amountCents: 900000, category: 'SCHOLARSHIPS', counterpartyType: 'PLAYER', counterpartyName: 'DeShawn Carter', title: 'Spring scholarship disbursement', memo: 'Athletic aid — Spring 2026', status: 'SETTLED', rail: 'INTERNAL', referenceId: 'AID-2026-0011', playerId: 'p3' },
  // Feb 23
  { id: 'le5', createdAt: '2026-02-23T13:45:00', effectiveAt: '2026-02-23', direction: 'outflow', amountCents: 650000, category: 'NIL', counterpartyType: 'PLAYER', counterpartyName: 'DeShawn Carter', title: 'NIL Allocation — Q1', status: 'PENDING', rail: 'ACH', referenceId: 'NIL-2026-0023', playerId: 'p3' },
  { id: 'le6', createdAt: '2026-02-23T11:00:00', effectiveAt: '2026-02-23', direction: 'outflow', amountCents: 120000, category: 'EQUIPMENT', counterpartyType: 'VENDOR', counterpartyName: 'Wilson Sporting Goods', title: 'Practice basketballs — replacement', memo: '24x Evolution game balls', status: 'SETTLED', rail: 'CARD', referenceId: 'EQP-2026-0045' },
  // Feb 22
  { id: 'le7', createdAt: '2026-02-22T15:30:00', effectiveAt: '2026-02-22', direction: 'outflow', amountCents: 550000, category: 'NIL', counterpartyType: 'PLAYER', counterpartyName: 'Jamal Williams', title: 'NIL Allocation — Q1', status: 'SETTLED', rail: 'ACH', referenceId: 'NIL-2026-0022', playerId: 'p6' },
  { id: 'le8', createdAt: '2026-02-22T10:00:00', effectiveAt: '2026-02-22', direction: 'outflow', amountCents: 180000, category: 'TRAVEL', counterpartyType: 'VENDOR', counterpartyName: 'Holiday Inn Express', title: 'Hotel — Bellevue away game', memo: '6 rooms × 2 nights', status: 'SETTLED', rail: 'CARD', referenceId: 'TRV-2026-0088' },
  // Feb 21
  { id: 'le9', createdAt: '2026-02-21T09:30:00', effectiveAt: '2026-02-21', direction: 'outflow', amountCents: 500000, category: 'NIL', counterpartyType: 'PLAYER', counterpartyName: 'Tyler Brooks', title: 'NIL Allocation — Q1', status: 'SETTLED', rail: 'ACH', referenceId: 'NIL-2026-0021', playerId: 'p7' },
  { id: 'le10', createdAt: '2026-02-21T08:00:00', effectiveAt: '2026-02-21', direction: 'outflow', amountCents: 28500, category: 'GAME_OPS', counterpartyType: 'VENDOR', counterpartyName: 'Publix', title: 'Pregame meals — home game', status: 'SETTLED', rail: 'CARD', referenceId: 'OPS-2026-0034' },
  // Feb 20
  { id: 'le11', createdAt: '2026-02-20T14:00:00', effectiveAt: '2026-02-20', direction: 'inflow', amountCents: 850000, category: 'OTHER', counterpartyType: 'SCHOOL', counterpartyName: 'Carroll College', title: 'Season ticket revenue — February', memo: 'Monthly ticket settlement', status: 'SETTLED', rail: 'INTERNAL', referenceId: 'REV-2026-0020' },
  { id: 'le12', createdAt: '2026-02-20T11:00:00', effectiveAt: '2026-02-20', direction: 'outflow', amountCents: 75000, category: 'RECRUITING', counterpartyType: 'VENDOR', counterpartyName: 'FedEx Office', title: 'Recruiting packets — Spring batch', status: 'SETTLED', rail: 'CARD', referenceId: 'REC-2026-0012' },
  // Feb 19
  { id: 'le13', createdAt: '2026-02-19T16:00:00', effectiveAt: '2026-02-19', direction: 'inflow', amountCents: 500000, category: 'OTHER', counterpartyType: 'OTHER', counterpartyName: 'Williams Family Trust', title: 'Alumni donation', memo: 'Unrestricted gift', status: 'SETTLED', rail: 'ACH', referenceId: 'DON-2026-0008' },
  { id: 'le14', createdAt: '2026-02-19T10:00:00', effectiveAt: '2026-02-19', direction: 'outflow', amountCents: 45000, category: 'FACILITIES', counterpartyType: 'VENDOR', counterpartyName: 'Helena Floor Care', title: 'Court maintenance — PE Center', status: 'SETTLED', rail: 'CHECK', referenceId: 'FAC-2026-0006' },
  // Feb 18
  { id: 'le15', createdAt: '2026-02-18T09:00:00', effectiveAt: '2026-02-18', direction: 'outflow', amountCents: 340000, category: 'EQUIPMENT', counterpartyType: 'VENDOR', counterpartyName: 'Nike', title: 'Training gear order — Spring', memo: 'Practice shorts + compression', status: 'PENDING', rail: 'CARD', referenceId: 'EQP-2026-0044' },
];

const CATEGORY_ICONS: Record<LedgerCategory, string> = {
  NIL: 'dollarsign.circle.fill',
  SCHOLARSHIPS: 'graduationcap.fill',
  TRAVEL: 'airplane',
  EQUIPMENT: 'tshirt.fill',
  FACILITIES: 'building.2.fill',
  GAME_OPS: 'trophy.fill',
  RECRUITING: 'person.badge.plus',
  OTHER: 'square.grid.2x2.fill',
};

const STATUS_COLOR: Record<LedgerStatus, string> = {
  PENDING: '#B8943E',
  SETTLED: '#5A8A6E',
  FAILED: '#B85C5C',
};

const QUICK_VIEWS: QuickView[] = ['All', 'NIL', 'Scholarships', 'Travel', 'Vendors'];

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

function fmt(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000) return '$' + (dollars / 1000).toFixed(dollars % 1000 === 0 ? 0 : 1) + 'K';
  return '$' + dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtFull(cents: number): string {
  return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function groupByDay(entries: LedgerEntry[]): [string, LedgerEntry[]][] {
  const map: Record<string, LedgerEntry[]> = {};
  entries.forEach((e) => {
    const day = e.effectiveAt;
    if (!map[day]) map[day] = [];
    map[day].push(e);
  });
  return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
}

function StatusChip({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.chip, { backgroundColor: color + '18' }]}>
      <ThemedText style={[s.chipText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// BLOCK 1 — BALANCES SNAPSHOT
// =============================================================================

function BalancesSnapshot({ colors, accentColor, entries }: { colors: typeof Colors.light; accentColor: string; entries: LedgerEntry[] }) {
  const totalIn = entries.filter((e) => e.direction === 'inflow').reduce((sum, e) => sum + e.amountCents, 0);
  const totalOut = entries.filter((e) => e.direction === 'outflow').reduce((sum, e) => sum + e.amountCents, 0);
  const net = totalIn - totalOut;

  const cards = [
    { label: 'Inflows', value: totalIn, color: '#5A8A6E' },
    { label: 'Outflows', value: totalOut, color: '#B85C5C' },
    { label: 'Net', value: net, color: net >= 0 ? '#5A8A6E' : '#B85C5C' },
  ];

  return (
    <View style={s.snapshotRow}>
      {cards.map((c) => (
        <View key={c.label} style={[s.snapshotCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.snapshotValue, { color: c.color }]}>
            {c.label === 'Net' && c.value >= 0 ? '+' : c.label === 'Net' && c.value < 0 ? '-' : ''}{fmt(Math.abs(c.value))}
          </ThemedText>
          <ThemedText style={[s.snapshotLabel, { color: colors.textSecondary }]}>{c.label}</ThemedText>
        </View>
      ))}
    </View>
  );
}

// =============================================================================
// BLOCK 3 — LEDGER FEED
// =============================================================================

function LedgerFeed({ colors, accentColor, entries, onSelect }: {
  colors: typeof Colors.light;
  accentColor: string;
  entries: LedgerEntry[];
  onSelect: (e: LedgerEntry) => void;
}) {
  const grouped = useMemo(() => groupByDay(entries), [entries]);

  if (entries.length === 0) {
    return (
      <View style={s.emptyState}>
        <IconSymbol name="doc.text.magnifyingglass" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>No entries found</ThemedText>
      </View>
    );
  }

  return (
    <>
      {grouped.map(([day, dayEntries]) => (
        <View key={day}>
          <ThemedText style={[s.dayHeader, { color: colors.textSecondary }]}>
            {formatDate(day)}
          </ThemedText>
          {dayEntries.map((entry, idx) => (
            <Pressable
              key={entry.id}
              style={({ pressed }) => [
                s.entryRow,
                idx < dayEntries.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelect(entry);
              }}
            >
              {/* Left — icon + time */}
              <View style={s.entryLeft}>
                <View style={[s.entryIcon, { backgroundColor: accentColor + '18' }]}>
                  <IconSymbol name={CATEGORY_ICONS[entry.category] as any} size={14} color={accentColor} />
                </View>
                <ThemedText style={[s.entryTime, { color: colors.textTertiary }]}>{formatTime(entry.createdAt)}</ThemedText>
              </View>

              {/* Center — title + memo */}
              <View style={s.entryCenter}>
                <ThemedText style={[s.entryTitle, { color: colors.text }]} numberOfLines={1}>{entry.title}</ThemedText>
                <ThemedText style={[s.entryMemo, { color: colors.textSecondary }]} numberOfLines={1}>
                  {entry.counterpartyName}{entry.memo ? ` · ${entry.memo}` : ''}
                </ThemedText>
              </View>

              {/* Right — amount + status */}
              <View style={s.entryRight}>
                <ThemedText style={[s.entryAmount, { color: entry.direction === 'inflow' ? '#5A8A6E' : '#B85C5C' }]}>
                  {entry.direction === 'inflow' ? '+' : '-'}{fmt(entry.amountCents)}
                </ThemedText>
                <StatusChip label={entry.status} color={STATUS_COLOR[entry.status]} />
              </View>
            </Pressable>
          ))}
        </View>
      ))}
    </>
  );
}

// =============================================================================
// ENTRY DETAIL SHEET
// =============================================================================

function EntryDetailSheet({ visible, onClose, entry, colors, accentColor }: {
  visible: boolean;
  onClose: () => void;
  entry: LedgerEntry | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!entry) return null;

  const handlePlayerTap = () => {
    if (!entry.playerId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openPlayerCard({
      name: entry.counterpartyName,
      number: '',
      position: '',
      height: '',
      weight: 0,
      classYear: '',
      teamColor: accentColor,
    });
  };

  const rows: { label: string; value: string; color?: string }[] = [
    { label: 'Amount', value: `${entry.direction === 'inflow' ? '+' : '-'}${fmtFull(entry.amountCents)}`, color: entry.direction === 'inflow' ? '#5A8A6E' : '#B85C5C' },
    { label: 'Direction', value: entry.direction === 'inflow' ? 'Inflow' : 'Outflow' },
    { label: 'Category', value: entry.category },
    { label: 'Counterparty', value: entry.counterpartyName },
    { label: 'Type', value: entry.counterpartyType },
    { label: 'Status', value: entry.status },
    { label: 'Created', value: `${formatDate(entry.createdAt)} at ${formatTime(entry.createdAt)}` },
    { label: 'Effective Date', value: formatDate(entry.effectiveAt) },
  ];
  if (entry.rail) rows.push({ label: 'Rail', value: entry.rail });
  if (entry.referenceId) rows.push({ label: 'Reference ID', value: entry.referenceId });
  if (entry.memo) rows.push({ label: 'Memo', value: entry.memo });

  return (
    <BottomSheet visible={visible} onClose={onClose} title={entry.title} useModal>
      <BottomSheetScrollView contentContainerStyle={s.sheetScroll}>
        <View style={[s.sheetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {rows.map((row, idx) => (
            <View
              key={row.label}
              style={[
                s.sheetRow,
                idx < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <ThemedText style={[s.sheetRowLabel, { color: colors.textSecondary }]}>{row.label}</ThemedText>
              {row.label === 'Status' ? (
                <StatusChip label={row.value} color={STATUS_COLOR[row.value as LedgerStatus] ?? colors.textSecondary} />
              ) : (
                <ThemedText style={[s.sheetRowValue, { color: row.color ?? colors.text }]} numberOfLines={2}>
                  {row.value}
                </ThemedText>
              )}
            </View>
          ))}
        </View>

        {/* Linked player */}
        {entry.playerId && (
          <Pressable
            style={({ pressed }) => [s.linkedRow, { backgroundColor: colors.card, borderColor: colors.border }, pressed && { opacity: 0.7 }]}
            onPress={handlePlayerTap}
          >
            <IconSymbol name="person.fill" size={14} color={accentColor} />
            <ThemedText style={[s.linkedLabel, { color: colors.text }]}>View Player Sheet</ThemedText>
            <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
          </Pressable>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function SportsLedger({ colors, accentColor, role }: Props) {
  const [search, setSearch] = useState('');
  const [quickView, setQuickView] = useState<QuickView>('All');
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const filtered = useMemo(() => {
    let list = ENTRIES;

    // Quick view filter
    switch (quickView) {
      case 'NIL': list = list.filter((e) => e.category === 'NIL'); break;
      case 'Scholarships': list = list.filter((e) => e.category === 'SCHOLARSHIPS'); break;
      case 'Travel': list = list.filter((e) => e.category === 'TRAVEL'); break;
      case 'Vendors': list = list.filter((e) => e.counterpartyType === 'VENDOR'); break;
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) =>
        e.title.toLowerCase().includes(q) ||
        e.counterpartyName.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        (e.memo ?? '').toLowerCase().includes(q) ||
        fmtFull(e.amountCents).includes(q)
      );
    }

    return list;
  }, [search, quickView]);

  const handleSelect = useCallback((entry: LedgerEntry) => {
    setSelectedEntry(entry);
    setSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
  }, []);

  return (
    <>
      <ScrollView
        style={s.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Search */}
        <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search payee / category / memo / amount"
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Balances */}
        <BalancesSnapshot colors={colors} accentColor={accentColor} entries={ENTRIES} />

        {/* Quick View pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.pillRow}
          style={s.pillScroll}
        >
          {QUICK_VIEWS.map((qv) => {
            const isActive = qv === quickView;
            return (
              <Pressable
                key={qv}
                style={[s.pill, { backgroundColor: isActive ? accentColor : colors.border }]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setQuickView(qv);
                }}
              >
                <ThemedText style={[s.pillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                  {qv}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Feed */}
        <LedgerFeed colors={colors} accentColor={accentColor} entries={filtered} onSelect={handleSelect} />
      </ScrollView>

      <EntryDetailSheet
        visible={sheetVisible}
        onClose={handleCloseSheet}
        entry={selectedEntry}
        colors={colors}
        accentColor={accentColor}
      />
    </>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.md, paddingTop: 4, paddingBottom: 120 },

  // ── Search ──
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },

  // ── Snapshot ──
  snapshotRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  snapshotCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 12,
    alignItems: 'center',
  },
  snapshotValue: {
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  snapshotLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },

  // ── Quick View Pills ──
  pillScroll: {
    flexGrow: 0,
    marginBottom: 16,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Status Chip ──
  chip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  chipText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ── Day Header ──
  dayHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },

  // ── Entry Row ──
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  entryLeft: {
    alignItems: 'center',
    gap: 4,
    width: 44,
  },
  entryIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryTime: {
    fontSize: 9,
    fontVariant: ['tabular-nums'],
  },
  entryCenter: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  entryMemo: {
    fontSize: 11,
    marginTop: 2,
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

  // ── Empty ──
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },

  // ── Detail Sheet ──
  sheetScroll: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  sheetCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 12,
    marginBottom: 12,
  },
  sheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sheetRowLabel: {
    fontSize: 12,
    fontWeight: '500',
    flex: 0.4,
  },
  sheetRowValue: {
    fontSize: 13,
    fontWeight: '600',
    flex: 0.6,
    textAlign: 'right',
  },
  linkedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 14,
  },
  linkedLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
