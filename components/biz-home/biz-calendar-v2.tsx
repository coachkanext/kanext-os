/**
 * Biz Calendar V2 — Executive Agenda (Single-Scroll)
 *
 * Chronological stream of entity-level events only.
 * Grouped by date sections: Today, This Week, This Month, Future.
 * No personal reminders, no staff noise, no department task lists.
 *
 * Rendering Context: Founder / CEO (B1)
 * Institutional, calm, minimal color.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';
import { BottomSheet } from '@/components/ui/bottom-sheet';

const ACCENT = MODE_ACCENT.business;

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

// =============================================================================
// TYPES
// =============================================================================

type EventType = 'BOARD' | 'INVESTOR' | 'CAPITAL' | 'COMPLIANCE' | 'CONTRACT' | 'PAYROLL' | 'OPERATIONS';
type EventStatus = 'Scheduled' | 'Pending' | 'Completed' | 'Overdue';

interface AgendaEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  status: EventStatus;
  dateGroup: 'today' | 'this_week' | 'this_month' | 'future';
  meta: { label: string; value: string }[];
}

// =============================================================================
// MOCK DATA
// =============================================================================

const EVENTS: AgendaEvent[] = [
  // Today
  {
    id: 'ev1', title: 'Board Review — Q1 Financials', type: 'BOARD',
    date: 'Feb 26, 2026', time: '2:00 PM', status: 'Scheduled', dateGroup: 'today',
    meta: [{ label: 'Participants', value: '5 members' }, { label: 'Location', value: 'Virtual — Zoom' }],
  },
  {
    id: 'ev2', title: 'Payroll Run — February', type: 'PAYROLL',
    date: 'Feb 26, 2026', time: '5:00 PM', status: 'Pending', dateGroup: 'today',
    meta: [{ label: 'Cycle', value: 'Bi-Monthly' }, { label: 'Headcount', value: '18' }],
  },
  // This Week
  {
    id: 'ev3', title: 'Investor Meeting — Apex Capital', type: 'INVESTOR',
    date: 'Feb 27, 2026', time: '10:00 AM', status: 'Scheduled', dateGroup: 'this_week',
    meta: [{ label: 'Participants', value: '3' }, { label: 'Location', value: 'Office — Conference Room A' }],
  },
  {
    id: 'ev4', title: 'Annual Report Filing', type: 'COMPLIANCE',
    date: 'Feb 28, 2026', time: '11:59 PM', status: 'Pending', dateGroup: 'this_week',
    meta: [{ label: 'Filing Type', value: 'Annual Report' }, { label: 'Jurisdiction', value: 'Delaware' }],
  },
  // This Month
  {
    id: 'ev5', title: 'Seed Round Close — Tranche 1', type: 'CAPITAL',
    date: 'Mar 5, 2026', time: '12:00 PM', status: 'Scheduled', dateGroup: 'this_month',
    meta: [{ label: 'Round', value: 'Seed — SAFE' }, { label: 'Linked Deal', value: 'Apex Capital' }],
  },
  {
    id: 'ev6', title: 'Vendor Contract Renewal — AWS', type: 'CONTRACT',
    date: 'Mar 10, 2026', time: '—', status: 'Pending', dateGroup: 'this_month',
    meta: [{ label: 'Counterparty', value: 'Amazon Web Services' }, { label: 'Expiration', value: 'Mar 15, 2026' }],
  },
  {
    id: 'ev7', title: 'Investor Update — Monthly', type: 'INVESTOR',
    date: 'Mar 12, 2026', time: '9:00 AM', status: 'Scheduled', dateGroup: 'this_month',
    meta: [{ label: 'Participants', value: '12 investors' }, { label: 'Location', value: 'Virtual — Email + Deck' }],
  },
  // Future
  {
    id: 'ev8', title: 'Board Meeting — Q2 Planning', type: 'BOARD',
    date: 'Apr 2, 2026', time: '2:00 PM', status: 'Scheduled', dateGroup: 'future',
    meta: [{ label: 'Participants', value: '5 members' }, { label: 'Location', value: 'Office — Boardroom' }],
  },
  {
    id: 'ev9', title: 'Insurance Policy Renewal', type: 'COMPLIANCE',
    date: 'Apr 15, 2026', time: '—', status: 'Pending', dateGroup: 'future',
    meta: [{ label: 'Filing Type', value: 'Liability + D&O' }, { label: 'Jurisdiction', value: 'California' }],
  },
  {
    id: 'ev10', title: 'Office Lease Expiration', type: 'CONTRACT',
    date: 'May 1, 2026', time: '—', status: 'Pending', dateGroup: 'future',
    meta: [{ label: 'Counterparty', value: 'WeWork — DTLA' }, { label: 'Expiration', value: 'May 1, 2026' }],
  },
  {
    id: 'ev11', title: 'Product v2 Launch', type: 'OPERATIONS',
    date: 'May 15, 2026', time: '—', status: 'Scheduled', dateGroup: 'future',
    meta: [{ label: 'Milestone', value: 'Major Release' }, { label: 'Teams', value: 'Engineering + Product' }],
  },
];

// =============================================================================
// CONSTANTS
// =============================================================================

const TYPE_COLORS: Record<EventType, string> = {
  BOARD: '#8B5CF6',
  INVESTOR: '#22C55E',
  CAPITAL: '#3B82F6',
  COMPLIANCE: '#F59E0B',
  CONTRACT: '#A1A1AA',
  PAYROLL: '#EF4444',
  OPERATIONS: ACCENT,
};

const STATUS_COLORS: Record<EventStatus, string> = {
  Scheduled: '#22C55E',
  Pending: '#F59E0B',
  Completed: '#A1A1AA',
  Overdue: '#EF4444',
};

const DATE_GROUP_LABELS: Record<string, string> = {
  today: 'Today',
  this_week: 'This Week',
  this_month: 'This Month',
  future: 'Future',
};

const DATE_GROUP_ORDER = ['today', 'this_week', 'this_month', 'future'];

type TypeFilter = 'All' | EventType;
type StatusFilter = 'All' | EventStatus;

const TYPE_OPTIONS: TypeFilter[] = ['All', 'BOARD', 'INVESTOR', 'CAPITAL', 'COMPLIANCE', 'CONTRACT', 'PAYROLL', 'OPERATIONS'];
const STATUS_OPTIONS: StatusFilter[] = ['All', 'Scheduled', 'Pending', 'Completed', 'Overdue'];

// =============================================================================
// ADD EVENT SHEET
// =============================================================================

function AddEventSheet({
  visible,
  onClose,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  colors: typeof Colors.light;
}) {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>('OPERATIONS');
  const [domain, setDomain] = useState('');

  const types: EventType[] = ['BOARD', 'INVESTOR', 'CAPITAL', 'COMPLIANCE', 'CONTRACT', 'PAYROLL', 'OPERATIONS'];
  const domains = ['Finance', 'Compliance', 'Deal', 'Operations', 'People'];

  const handleSubmit = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTitle('');
    setEventType('OPERATIONS');
    setDomain('');
    onClose();
  }, [onClose]);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={s.sheetContent}>
        <ThemedText style={[s.sheetTitle, { color: colors.text }]}>Add Event</ThemedText>
        <ThemedText style={[s.sheetSubtitle, { color: colors.textSecondary }]}>
          Propose → Validate → Confirm → Commit
        </ThemedText>

        {/* Title */}
        <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>Title</ThemedText>
        <TextInput
          style={[s.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Event title"
          placeholderTextColor={colors.textTertiary}
          value={title}
          onChangeText={setTitle}
        />

        {/* Type */}
        <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>Type</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pillRow}>
          {types.map((t) => {
            const sel = eventType === t;
            const color = TYPE_COLORS[t];
            return (
              <Pressable
                key={t}
                style={[s.selectPill, { backgroundColor: sel ? color + '20' : colors.card, borderColor: sel ? color : colors.border }]}
                onPress={() => { Haptics.selectionAsync(); setEventType(t); }}
              >
                <ThemedText style={[s.selectPillText, { color: sel ? color : colors.textSecondary }]}>{t}</ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Linked Domain */}
        <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>Linked Domain</ThemedText>
        <View style={s.domainRow}>
          {domains.map((d) => {
            const sel = domain === d;
            return (
              <Pressable
                key={d}
                style={[s.selectPill, { backgroundColor: sel ? ACCENT + '20' : colors.card, borderColor: sel ? ACCENT : colors.border }]}
                onPress={() => { Haptics.selectionAsync(); setDomain(d); }}
              >
                <ThemedText style={[s.selectPillText, { color: sel ? ACCENT : colors.textSecondary }]}>{d}</ThemedText>
              </Pressable>
            );
          })}
        </View>

        {/* Submit */}
        <Pressable
          style={[s.submitBtn, { backgroundColor: ACCENT, opacity: title.trim() ? 1 : 0.4 }]}
          onPress={title.trim() ? handleSubmit : undefined}
        >
          <ThemedText style={s.submitText}>Propose Event</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function BizCalendarV2({ colors, accent }: Props) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Filter pipeline
  const filtered = useMemo(() => {
    let events = EVENTS;
    if (typeFilter !== 'All') events = events.filter((e) => e.type === typeFilter);
    if (statusFilter !== 'All') events = events.filter((e) => e.status === statusFilter);
    return events;
  }, [typeFilter, statusFilter]);

  // Group by date section
  const grouped = useMemo(() => {
    const groups: { key: string; label: string; events: AgendaEvent[] }[] = [];
    for (const key of DATE_GROUP_ORDER) {
      const evts = filtered.filter((e) => e.dateGroup === key);
      if (evts.length > 0) {
        groups.push({ key, label: DATE_GROUP_LABELS[key], events: evts });
      }
    }
    return groups;
  }, [filtered]);

  const toggleCollapse = useCallback((key: string) => {
    Haptics.selectionAsync();
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* ── Sticky Header ──────────────────────────────────────────── */}
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <ThemedText style={[s.title, { color: colors.text }]}>Agenda</ThemedText>
            <View style={[s.entityChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.entityText, { color: colors.textSecondary }]}>Meridian Ventures LLC</ThemedText>
            </View>
          </View>
          <View style={s.headerActions}>
            <Pressable
              style={[s.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => { Haptics.selectionAsync(); setShowFilters(!showFilters); }}
            >
              <IconSymbol name="line.3.horizontal.decrease" size={14} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              style={[s.iconBtn, { backgroundColor: ACCENT }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAddVisible(true); }}
            >
              <IconSymbol name="plus" size={14} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* ── Filters (toggle) ───────────────────────────────────────── */}
        {showFilters && (
          <View style={s.filtersBlock}>
            <ThemedText style={[s.filterGroupLabel, { color: colors.textTertiary }]}>TYPE</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
              {TYPE_OPTIONS.map((t) => {
                const active = typeFilter === t;
                const color = t === 'All' ? ACCENT : TYPE_COLORS[t as EventType];
                return (
                  <Pressable
                    key={t}
                    style={[s.filterPill, { backgroundColor: active ? color + '18' : colors.card, borderColor: active ? color : colors.border }]}
                    onPress={() => { Haptics.selectionAsync(); setTypeFilter(t); }}
                  >
                    <ThemedText style={[s.filterPillText, { color: active ? color : colors.textSecondary }]}>{t}</ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
            <ThemedText style={[s.filterGroupLabel, { color: colors.textTertiary, marginTop: 8 }]}>STATUS</ThemedText>
            <View style={s.statusFilterRow}>
              {STATUS_OPTIONS.map((st) => {
                const active = statusFilter === st;
                const color = st === 'All' ? ACCENT : STATUS_COLORS[st as EventStatus];
                return (
                  <Pressable
                    key={st}
                    style={[s.filterPill, { backgroundColor: active ? color + '18' : colors.card, borderColor: active ? color : colors.border }]}
                    onPress={() => { Haptics.selectionAsync(); setStatusFilter(st); }}
                  >
                    <ThemedText style={[s.filterPillText, { color: active ? color : colors.textSecondary }]}>{st}</ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Date Sections ──────────────────────────────────────────── */}
        {grouped.length === 0 ? (
          <View style={[s.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>No events match your filters.</ThemedText>
          </View>
        ) : (
          grouped.map((group) => {
            const isCollapsed = collapsed[group.key] ?? false;
            return (
              <View key={group.key} style={s.dateSection}>
                <Pressable style={s.dateSectionHeader} onPress={() => toggleCollapse(group.key)}>
                  <ThemedText style={[s.dateSectionLabel, { color: colors.textSecondary }]}>
                    {group.label}
                  </ThemedText>
                  <View style={s.dateSectionRight}>
                    <ThemedText style={[s.dateSectionCount, { color: colors.textTertiary }]}>{group.events.length}</ThemedText>
                    <IconSymbol name={isCollapsed ? 'chevron.right' : 'chevron.down'} size={10} color={colors.textTertiary} />
                  </View>
                </Pressable>

                {!isCollapsed && group.events.map((event) => {
                  const typeColor = TYPE_COLORS[event.type];
                  const statusColor = STATUS_COLORS[event.status];
                  return (
                    <View key={event.id} style={[s.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      {/* Top Row */}
                      <View style={s.eventTopRow}>
                        <ThemedText style={[s.eventTitle, { color: colors.text }]} numberOfLines={1}>{event.title}</ThemedText>
                        <View style={[s.typePill, { backgroundColor: typeColor + '15' }]}>
                          <ThemedText style={[s.typePillText, { color: typeColor }]}>{event.type}</ThemedText>
                        </View>
                      </View>
                      <ThemedText style={[s.eventDateTime, { color: colors.textTertiary }]}>
                        {event.date} · {event.time}
                      </ThemedText>

                      {/* Meta Lines (max 3) */}
                      {event.meta.slice(0, 3).map((m, i) => (
                        <View key={i} style={s.metaRow}>
                          <ThemedText style={[s.metaLabel, { color: colors.textTertiary }]}>{m.label}</ThemedText>
                          <ThemedText style={[s.metaValue, { color: colors.textSecondary }]}>{m.value}</ThemedText>
                        </View>
                      ))}

                      {/* Bottom Row */}
                      <View style={[s.eventBottomRow, { borderColor: colors.border }]}>
                        <View style={[s.statusChip, { backgroundColor: statusColor + '15' }]}>
                          <View style={[s.statusDot, { backgroundColor: statusColor }]} />
                          <ThemedText style={[s.statusText, { color: statusColor }]}>{event.status}</ThemedText>
                        </View>
                        <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ── Add Event Sheet ─────────────────────────────────────────── */}
      <AddEventSheet visible={addVisible} onClose={() => setAddVisible(false)} colors={colors} />
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
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  entityChip: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full, borderWidth: 1 },
  entityText: { fontSize: 11, fontWeight: '600' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },

  // -- Filters --
  filtersBlock: { marginBottom: 16 },
  filterGroupLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6, marginBottom: 6 },
  filterScroll: { flexGrow: 0, marginBottom: 4 },
  filterPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full, borderWidth: 1, marginRight: 6 },
  filterPillText: { fontSize: 10, fontWeight: '600' },
  statusFilterRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },

  // -- Date Sections --
  dateSection: { marginBottom: 16 },
  dateSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingVertical: 4 },
  dateSectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  dateSectionRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateSectionCount: { fontSize: 11, fontWeight: '600' },

  // -- Event Card --
  eventCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  eventTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  eventTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  typePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  typePillText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  eventDateTime: { fontSize: 11, marginBottom: 8 },

  // -- Meta --
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 3 },
  metaLabel: { fontSize: 11 },
  metaValue: { fontSize: 11, fontWeight: '600' },

  // -- Bottom Row --
  eventBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, marginTop: 6, borderTopWidth: StyleSheet.hairlineWidth },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 10, fontWeight: '700' },

  // -- Empty --
  emptyCard: { borderRadius: 12, borderWidth: 1, padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 13 },

  // -- Add Event Sheet --
  sheetContent: { padding: Spacing.md, paddingBottom: 40 },
  sheetTitle: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  sheetSubtitle: { fontSize: 12, marginBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, marginBottom: 6, marginTop: 12 },
  textInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  pillRow: { flexGrow: 0, marginBottom: 4 },
  selectPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full, borderWidth: 1, marginRight: 6 },
  selectPillText: { fontSize: 10, fontWeight: '600' },
  domainRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  submitBtn: { alignItems: 'center', paddingVertical: 14, borderRadius: 12, marginTop: 20 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
