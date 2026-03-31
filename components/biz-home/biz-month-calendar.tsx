/**
 * Biz Month Calendar — Visual Strategic Time Control
 *
 * Month view (default) with Week toggle.
 * Enterprise commitments only — no personal, no staff noise.
 * Event types: BOARD, INVESTOR, CAPITAL, COMPLIANCE, CONTRACT, PAYROLL, OPERATIONS.
 *
 * Rendering Context: Founder / CEO (B1)
 * Deep tones for strategic, amber for regulatory, neutral for operational.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { BizEventDetailSheet, type EventDetailData } from '@/components/biz-home/biz-event-detail-sheet';

const ACCENT = MODE_ACCENT.business;

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

// =============================================================================
// TYPES
// =============================================================================

type EventType = 'BOARD' | 'INVESTOR' | 'CAPITAL' | 'COMPLIANCE' | 'CONTRACT' | 'PAYROLL' | 'OPERATIONS';
type EventStatus = 'Scheduled' | 'Pending' | 'Overdue';
type ViewMode = 'month' | 'week';

interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  date: number; // day of month
  time?: string;
  status: EventStatus;
  allDay?: boolean;
  meta: { label: string; value: string }[];
}

// =============================================================================
// COLOR DISCIPLINE
// =============================================================================

// Strategic → Deep tone, Regulatory → Amber/Neutral, Operational → Neutral
const TYPE_COLORS: Record<EventType, string> = {
  BOARD: '#6366F1',     // deep indigo — strategic
  INVESTOR: '#059669',  // deep green — strategic
  CAPITAL: '#1A1714',   // deep blue — strategic
  COMPLIANCE: '#D97706', // amber — regulatory
  CONTRACT: '#78716C',  // neutral stone — regulatory
  PAYROLL: '#9CA3AF',   // neutral gray — operational
  OPERATIONS: '#6B7280', // neutral — operational
};

const STATUS_COLORS: Record<EventStatus, string> = {
  Scheduled: '#5A8A6E',
  Pending: '#B8943E',
  Overdue: '#B85C5C',
};

// =============================================================================
// MOCK DATA — February 2026
// =============================================================================

const CURRENT_MONTH = 'February';
const CURRENT_YEAR = 2026;
const DAYS_IN_MONTH = 28;
const FIRST_DAY_OFFSET = 0; // Feb 1, 2026 = Sunday = 0

const EVENTS: CalendarEvent[] = [
  { id: 'c1', title: 'Board Review — Q1', type: 'BOARD', date: 4, time: '2:00 PM', status: 'Scheduled', meta: [{ label: 'Participants', value: '5 members' }, { label: 'Location', value: 'Virtual' }] },
  { id: 'c2', title: 'Payroll Run', type: 'PAYROLL', date: 6, allDay: true, status: 'Scheduled', meta: [{ label: 'Cycle', value: 'Bi-Monthly' }] },
  { id: 'c3', title: 'Investor — Apex Capital', type: 'INVESTOR', date: 10, time: '10:00 AM', status: 'Scheduled', meta: [{ label: 'Participants', value: '3' }, { label: 'Location', value: 'Office' }] },
  { id: 'c4', title: 'Annual Filing Deadline', type: 'COMPLIANCE', date: 15, allDay: true, status: 'Pending', meta: [{ label: 'Filing', value: 'Annual Report' }, { label: 'Jurisdiction', value: 'Delaware' }] },
  { id: 'c5', title: 'Seed Close — Tranche 1', type: 'CAPITAL', date: 18, time: '12:00 PM', status: 'Scheduled', meta: [{ label: 'Round', value: 'Seed — SAFE' }, { label: 'Deal', value: 'Apex Capital' }] },
  { id: 'c6', title: 'Contract Renewal — AWS', type: 'CONTRACT', date: 20, allDay: true, status: 'Pending', meta: [{ label: 'Counterparty', value: 'AWS' }, { label: 'Expiration', value: 'Mar 15' }] },
  { id: 'c7', title: 'Investor Update', type: 'INVESTOR', date: 22, time: '9:00 AM', status: 'Scheduled', meta: [{ label: 'Participants', value: '12' }, { label: 'Location', value: 'Virtual' }] },
  { id: 'c8', title: 'Payroll Run', type: 'PAYROLL', date: 20, allDay: true, status: 'Scheduled', meta: [{ label: 'Cycle', value: 'Bi-Monthly' }] },
  { id: 'c9', title: 'Board Prep — Q2', type: 'BOARD', date: 26, time: '3:00 PM', status: 'Scheduled', meta: [{ label: 'Participants', value: '2' }, { label: 'Location', value: 'Office' }] },
  { id: 'c10', title: 'Insurance Review', type: 'COMPLIANCE', date: 26, allDay: true, status: 'Pending', meta: [{ label: 'Filing', value: 'D&O Review' }, { label: 'Jurisdiction', value: 'CA' }] },
  { id: 'c11', title: 'Product v2 Milestone', type: 'OPERATIONS', date: 28, allDay: true, status: 'Scheduled', meta: [{ label: 'Milestone', value: 'Beta Release' }] },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// =============================================================================
// EVENT DETAIL ENRICHMENT
// =============================================================================

const CAL_EVENT_DETAIL: Record<string, Omit<EventDetailData, 'id' | 'title' | 'type' | 'status'>> = {
  c1: {
    date: 'Feb 4, 2026', time: '2:00 PM', location: 'Virtual', domain: 'Finance',
    linkedObjects: [{ type: 'Program', id: 'PRG-001', label: 'Q1 Financial Review' }],
    participants: [
      { role: 'Founder' }, { role: 'CFO' }, { role: 'COO' },
      { role: 'Board Member', external: true, counterparty: 'Apex Capital' },
      { role: 'Board Member', external: true, counterparty: 'Meridian Advisory' },
    ],
  },
  c2: {
    date: 'Feb 6, 2026', time: 'All Day', domain: 'Operations',
    linkedObjects: [],
    participants: [{ role: 'CFO' }, { role: 'HR Director' }],
  },
  c3: {
    date: 'Feb 10, 2026', time: '10:00 AM', location: 'Office', domain: 'Finance',
    linkedEntity: 'Apex Capital',
    linkedObjects: [{ type: 'Deal', id: 'DEAL-001', label: 'Apex Capital — Seed Round' }],
    participants: [
      { role: 'Founder' }, { role: 'CFO' },
      { role: 'Managing Partner', external: true, counterparty: 'Apex Capital' },
    ],
  },
  c4: {
    date: 'Feb 15, 2026', time: 'All Day', domain: 'Compliance',
    linkedObjects: [{ type: 'Compliance Filing', id: 'CMP-2026-001', label: 'Annual Report — Delaware' }],
    participants: [{ role: 'Compliance Officer' }, { role: 'Legal Counsel' }],
  },
  c5: {
    date: 'Feb 18, 2026', time: '12:00 PM', domain: 'Finance',
    linkedEntity: 'Apex Capital',
    linkedObjects: [{ type: 'Deal', id: 'DEAL-001', label: 'Apex Capital — Seed Round' }],
    participants: [
      { role: 'Founder' }, { role: 'CFO' }, { role: 'Legal Counsel' },
      { role: 'Managing Partner', external: true, counterparty: 'Apex Capital' },
    ],
  },
  c6: {
    date: 'Feb 20, 2026', time: 'All Day', domain: 'Operations',
    linkedObjects: [{ type: 'Contract', id: 'CTR-002', label: 'AWS Service Agreement' }],
    participants: [{ role: 'CTO' }, { role: 'CFO' }],
  },
  c7: {
    date: 'Feb 22, 2026', time: '9:00 AM', location: 'Virtual', domain: 'Finance',
    linkedObjects: [],
    participants: [{ role: 'Founder' }, { role: 'CFO' }],
  },
  c8: {
    date: 'Feb 20, 2026', time: 'All Day', domain: 'Operations',
    linkedObjects: [],
    participants: [{ role: 'CFO' }, { role: 'HR Director' }],
  },
  c9: {
    date: 'Feb 26, 2026', time: '3:00 PM', location: 'Office', domain: 'Multi-domain',
    linkedObjects: [{ type: 'Program', id: 'PRG-002', label: 'Q2 Strategic Plan' }],
    participants: [{ role: 'Founder' }, { role: 'CFO' }],
  },
  c10: {
    date: 'Feb 26, 2026', time: 'All Day', domain: 'Compliance',
    linkedObjects: [{ type: 'Obligation', id: 'OBL-002', label: 'D&O Insurance Renewal' }],
    participants: [{ role: 'CFO' }, { role: 'Compliance Officer' }],
  },
  c11: {
    date: 'Feb 28, 2026', time: 'All Day', domain: 'Operations',
    linkedObjects: [{ type: 'Program', id: 'PRG-003', label: 'Product v2 Launch' }],
    participants: [{ role: 'Founder' }, { role: 'CTO' }, { role: 'VP Engineering' }],
  },
};

function buildCalEventDetail(event: CalendarEvent): EventDetailData {
  const enrichment = CAL_EVENT_DETAIL[event.id];
  return {
    id: event.id,
    title: event.title,
    type: event.type,
    status: event.status,
    date: enrichment?.date ?? `${CURRENT_MONTH} ${event.date}, ${CURRENT_YEAR}`,
    time: enrichment?.time ?? event.time ?? 'All Day',
    location: enrichment?.location,
    domain: enrichment?.domain ?? 'Operations',
    linkedEntity: enrichment?.linkedEntity,
    linkedObjects: enrichment?.linkedObjects ?? [],
    participants: enrichment?.participants ?? [],
  };
}

// =============================================================================
// DAY OVERLAY SHEET
// =============================================================================

function DayOverlaySheet({
  day,
  events,
  visible,
  onClose,
  colors,
  onEventTap,
}: {
  day: number;
  events: CalendarEvent[];
  visible: boolean;
  onClose: () => void;
  colors: typeof Colors.light;
  onEventTap: (e: CalendarEvent) => void;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={s.sheetContent}>
        <ThemedText style={[s.sheetTitle, { color: colors.text }]}>
          {CURRENT_MONTH} {day}
        </ThemedText>
        <ThemedText style={[s.sheetSubtitle, { color: colors.textSecondary }]}>
          {events.length} event{events.length !== 1 ? 's' : ''}
        </ThemedText>
        {events.map((ev) => {
          const typeColor = TYPE_COLORS[ev.type];
          return (
            <Pressable
              key={ev.id}
              style={[s.dayEventRow, { borderColor: colors.border }]}
              onPress={() => { onClose(); setTimeout(() => onEventTap(ev), 300); }}
            >
              <View style={[s.dayEventDot, { backgroundColor: typeColor }]} />
              <View style={{ flex: 1 }}>
                <ThemedText style={[s.dayEventTitle, { color: colors.text }]}>{ev.title}</ThemedText>
                <ThemedText style={[s.dayEventTime, { color: colors.textTertiary }]}>
                  {ev.time ?? 'All Day'}
                </ThemedText>
              </View>
              <View style={[s.typePill, { backgroundColor: typeColor + '15' }]}>
                <ThemedText style={[s.typePillText, { color: typeColor }]}>{ev.type}</ThemedText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

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

        <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>Title</ThemedText>
        <TextInput
          style={[s.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Event title"
          placeholderTextColor={colors.textTertiary}
          value={title}
          onChangeText={setTitle}
        />

        <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>Type</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pillScroll}>
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

export function BizMonthCalendar({ colors, accent }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'All' | EventType>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | EventStatus>('All');
  const [addVisible, setAddVisible] = useState(false);
  const [detailData, setDetailData] = useState<EventDetailData | null>(null);
  const [dayOverlay, setDayOverlay] = useState<{ day: number; events: CalendarEvent[] } | null>(null);
  const [dayOverlayVisible, setDayOverlayVisible] = useState(false);

  // Current week for week view (0-indexed from first day of month)
  const [weekStart, setWeekStart] = useState(0); // day offset

  const filtered = useMemo(() => {
    let evts = EVENTS;
    if (typeFilter !== 'All') evts = evts.filter((e) => e.type === typeFilter);
    if (statusFilter !== 'All') evts = evts.filter((e) => e.status === statusFilter);
    return evts;
  }, [typeFilter, statusFilter]);

  const eventsForDay = useCallback((day: number) => {
    return filtered.filter((e) => e.date === day);
  }, [filtered]);

  const openEvent = useCallback((ev: CalendarEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDetailData(buildCalEventDetail(ev));
  }, []);

  const openDayOverlay = useCallback((day: number, events: CalendarEvent[]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDayOverlay({ day, events });
    setDayOverlayVisible(true);
  }, []);

  // Build month grid cells
  const cells = useMemo(() => {
    const result: (number | null)[] = [];
    // Leading blanks
    for (let i = 0; i < FIRST_DAY_OFFSET; i++) result.push(null);
    for (let d = 1; d <= DAYS_IN_MONTH; d++) result.push(d);
    // Trailing blanks
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, []);

  // Week view days
  const weekDays = useMemo(() => {
    const days: number[] = [];
    for (let i = 0; i < 7; i++) {
      const d = weekStart + i + 1;
      if (d >= 1 && d <= DAYS_IN_MONTH) days.push(d);
    }
    return days;
  }, [weekStart]);

  const isToday = (day: number) => day === 26; // mock: today = Feb 26

  const typeOptions: ('All' | EventType)[] = ['All', 'BOARD', 'INVESTOR', 'CAPITAL', 'COMPLIANCE', 'CONTRACT', 'PAYROLL', 'OPERATIONS'];
  const statusOptions: ('All' | EventStatus)[] = ['All', 'Scheduled', 'Pending', 'Overdue'];

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* ── Top Bar ────────────────────────────────────────────────── */}
        <View style={s.topBar}>
          <ThemedText style={[s.monthTitle, { color: colors.text }]}>
            {CURRENT_MONTH} {CURRENT_YEAR}
          </ThemedText>
          <View style={s.topBarActions}>
            {/* View Toggle */}
            <View style={[s.viewToggle, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Pressable
                style={[s.viewToggleBtn, viewMode === 'month' && { backgroundColor: ACCENT }]}
                onPress={() => { Haptics.selectionAsync(); setViewMode('month'); }}
              >
                <ThemedText style={[s.viewToggleText, { color: viewMode === 'month' ? '#fff' : colors.textSecondary }]}>Month</ThemedText>
              </Pressable>
              <Pressable
                style={[s.viewToggleBtn, viewMode === 'week' && { backgroundColor: ACCENT }]}
                onPress={() => { Haptics.selectionAsync(); setViewMode('week'); }}
              >
                <ThemedText style={[s.viewToggleText, { color: viewMode === 'week' ? '#fff' : colors.textSecondary }]}>Week</ThemedText>
              </Pressable>
            </View>
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

        {/* ── Filters ────────────────────────────────────────────────── */}
        {showFilters && (
          <View style={s.filtersBlock}>
            <ThemedText style={[s.filterGroupLabel, { color: colors.textTertiary }]}>TYPE</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
              {typeOptions.map((t) => {
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
            <ThemedText style={[s.filterGroupLabel, { color: colors.textTertiary, marginTop: 6 }]}>STATUS</ThemedText>
            <View style={s.statusRow}>
              {statusOptions.map((st) => {
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

        {/* ── Month View ─────────────────────────────────────────────── */}
        {viewMode === 'month' && (
          <View style={s.monthGrid}>
            {/* Weekday Headers */}
            <View style={s.weekdayRow}>
              {WEEKDAYS.map((wd) => (
                <View key={wd} style={s.weekdayCell}>
                  <ThemedText style={[s.weekdayText, { color: colors.textTertiary }]}>{wd}</ThemedText>
                </View>
              ))}
            </View>

            {/* Day Cells */}
            <View style={s.daysGrid}>
              {cells.map((day, idx) => {
                if (day === null) {
                  return <View key={`blank-${idx}`} style={s.dayCell} />;
                }
                const dayEvents = eventsForDay(day);
                const today = isToday(day);
                return (
                  <Pressable
                    key={day}
                    style={[s.dayCell, today && { backgroundColor: ACCENT + '10' }]}
                    onPress={dayEvents.length > 0 ? () => {
                      if (dayEvents.length === 1) openEvent(dayEvents[0]);
                      else openDayOverlay(day, dayEvents);
                    } : undefined}
                  >
                    <ThemedText style={[s.dayNumber, { color: today ? ACCENT : colors.text }]}>{day}</ThemedText>
                    {/* Event markers — max 3 */}
                    {dayEvents.slice(0, 3).map((ev) => (
                      <View key={ev.id} style={[s.eventMarker, { backgroundColor: TYPE_COLORS[ev.type] }]}>
                        <ThemedText style={s.eventMarkerText} numberOfLines={1}>{ev.title}</ThemedText>
                      </View>
                    ))}
                    {dayEvents.length > 3 && (
                      <ThemedText style={[s.overflowText, { color: colors.textTertiary }]}>
                        +{dayEvents.length - 3} more
                      </ThemedText>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Week View ──────────────────────────────────────────────── */}
        {viewMode === 'week' && (
          <View>
            {/* Week Strip */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.weekStrip}>
              {Array.from({ length: Math.ceil(DAYS_IN_MONTH / 7) }, (_, i) => {
                const start = i * 7;
                const end = Math.min(start + 6, DAYS_IN_MONTH - 1);
                const active = weekStart === start;
                return (
                  <Pressable
                    key={i}
                    style={[s.weekPill, { backgroundColor: active ? ACCENT + '18' : colors.card, borderColor: active ? ACCENT : colors.border }]}
                    onPress={() => { Haptics.selectionAsync(); setWeekStart(start); }}
                  >
                    <ThemedText style={[s.weekPillText, { color: active ? ACCENT : colors.textSecondary }]}>
                      {start + 1}–{end + 1}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* All-Day Row */}
            {(() => {
              const allDayEvents = weekDays.flatMap((d) => eventsForDay(d).filter((e) => e.allDay));
              if (allDayEvents.length === 0) return null;
              return (
                <View style={[s.allDayRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <ThemedText style={[s.allDayLabel, { color: colors.textTertiary }]}>ALL DAY</ThemedText>
                  {allDayEvents.map((ev) => (
                    <Pressable
                      key={ev.id}
                      style={[s.allDayPill, { backgroundColor: TYPE_COLORS[ev.type] + '18' }]}
                      onPress={() => openEvent(ev)}
                    >
                      <View style={[s.allDayDot, { backgroundColor: TYPE_COLORS[ev.type] }]} />
                      <ThemedText style={[s.allDayText, { color: TYPE_COLORS[ev.type] }]} numberOfLines={1}>{ev.title}</ThemedText>
                    </Pressable>
                  ))}
                </View>
              );
            })()}

            {/* Timed Events */}
            {weekDays.map((day) => {
              const timedEvents = eventsForDay(day).filter((e) => !e.allDay);
              if (timedEvents.length === 0) return null;
              const today = isToday(day);
              return (
                <View key={day} style={s.weekDaySection}>
                  <View style={s.weekDayHeader}>
                    <ThemedText style={[s.weekDayLabel, { color: today ? ACCENT : colors.textSecondary }]}>
                      {WEEKDAYS[(FIRST_DAY_OFFSET + day - 1) % 7]} {day}
                    </ThemedText>
                  </View>
                  {timedEvents.map((ev) => {
                    const typeColor = TYPE_COLORS[ev.type];
                    return (
                      <Pressable
                        key={ev.id}
                        style={[s.weekEventBlock, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: typeColor, borderLeftWidth: 3 }]}
                        onPress={() => openEvent(ev)}
                      >
                        <View style={s.weekEventTop}>
                          <ThemedText style={[s.weekEventTitle, { color: colors.text }]} numberOfLines={1}>{ev.title}</ThemedText>
                          <View style={[s.typePill, { backgroundColor: typeColor + '15' }]}>
                            <ThemedText style={[s.typePillText, { color: typeColor }]}>{ev.type}</ThemedText>
                          </View>
                        </View>
                        <ThemedText style={[s.weekEventTime, { color: colors.textTertiary }]}>{ev.time}</ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Sheets */}
      <BizEventDetailSheet event={detailData} visible={!!detailData} onClose={() => setDetailData(null)} colors={colors} />
      {dayOverlay && (
        <DayOverlaySheet
          day={dayOverlay.day}
          events={dayOverlay.events}
          visible={dayOverlayVisible}
          onClose={() => setDayOverlayVisible(false)}
          colors={colors}
          onEventTap={openEvent}
        />
      )}
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

  // -- Top Bar --
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  monthTitle: { fontSize: 20, fontWeight: '800' },
  topBarActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  viewToggle: { flexDirection: 'row', borderRadius: 8, borderWidth: 1, overflow: 'hidden' },
  viewToggleBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  viewToggleText: { fontSize: 11, fontWeight: '600' },
  iconBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },

  // -- Filters --
  filtersBlock: { marginBottom: 12 },
  filterGroupLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6, marginBottom: 6 },
  filterScroll: { flexGrow: 0, marginBottom: 4 },
  filterPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full, borderWidth: 1, marginRight: 6 },
  filterPillText: { fontSize: 10, fontWeight: '600' },
  statusRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },

  // -- Month Grid --
  monthGrid: { marginBottom: 16 },
  weekdayRow: { flexDirection: 'row' },
  weekdayCell: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  weekdayText: { fontSize: 10, fontWeight: '600' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, minHeight: 68, paddingVertical: 4, paddingHorizontal: 2, borderRadius: 4 },
  dayNumber: { fontSize: 11, fontWeight: '600', textAlign: 'center', marginBottom: 2 },
  eventMarker: { height: 14, borderRadius: 3, paddingHorizontal: 3, marginBottom: 1, justifyContent: 'center' },
  eventMarkerText: { color: '#fff', fontSize: 7, fontWeight: '700' },
  overflowText: { fontSize: 8, textAlign: 'center', marginTop: 1 },

  // -- Week View --
  weekStrip: { flexGrow: 0, marginBottom: 12 },
  weekPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: 1, marginRight: 8 },
  weekPillText: { fontSize: 11, fontWeight: '600' },
  allDayRow: { borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 10, gap: 6 },
  allDayLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  allDayPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  allDayDot: { width: 5, height: 5, borderRadius: 2.5 },
  allDayText: { fontSize: 11, fontWeight: '600', flex: 1 },
  weekDaySection: { marginBottom: 12 },
  weekDayHeader: { marginBottom: 6 },
  weekDayLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  weekEventBlock: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 6 },
  weekEventTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  weekEventTitle: { fontSize: 13, fontWeight: '600', flex: 1 },
  weekEventTime: { fontSize: 11, marginTop: 3 },

  // -- Shared Chips --
  typePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  typePillText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  // -- Sheet --
  sheetContent: { padding: Spacing.md, paddingBottom: 40 },
  sheetHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
  sheetTitle: { fontSize: 20, fontWeight: '800' },
  sheetSubtitle: { fontSize: 12, marginBottom: 12 },

  // -- Day Overlay --
  dayEventRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  dayEventDot: { width: 8, height: 8, borderRadius: 4 },
  dayEventTitle: { fontSize: 13, fontWeight: '600' },
  dayEventTime: { fontSize: 11, marginTop: 1 },

  // -- Add Event --
  fieldLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, marginBottom: 6, marginTop: 12 },
  textInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  pillScroll: { flexGrow: 0, marginBottom: 4 },
  selectPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full, borderWidth: 1, marginRight: 6 },
  selectPillText: { fontSize: 10, fontWeight: '600' },
  domainRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  submitBtn: { alignItems: 'center', paddingVertical: 14, borderRadius: 12, marginTop: 20 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
