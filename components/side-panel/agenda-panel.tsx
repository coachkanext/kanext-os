/**
 * Agenda Side Panel — universal left-drawer panel for all Agenda views.
 *
 * Sections:
 *   Mini Calendar  — month grid, nav arrows, event dots, day tap → closeSidePanel,
 *                    Today button
 *   Quick Add      — Event (closes panel) · Reminder (inline form) · Task (inline form)
 *   Today Snapshot — next 3 upcoming events with time + colour stripe
 *   My Categories  — event-type colour reference; admin Edit button
 *   Admin          — Create Brand Event, Manage Categories, Team Availability,
 *                    Attendance Reports   (isAdmin only)
 *   Settings       — collapsible: Start of Week, Default View, Time Zone, Notifications
 */

import React, { useState } from 'react';
import {
  View, Text, Pressable, TextInput, StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useOperatingRole } from '@/context/app-context';
import { closeSidePanel } from '@/utils/global-side-panel';

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_HEADERS = ['S','M','T','W','T','F','S'];

// Fixed reference point — today: March 25, 2026
const TODAY = { year: 2026, month: 2, day: 25 };

// Days with ≥1 event, keyed by "year-monthIndex"
const EVENT_DAYS: Record<string, number[]> = {
  '2026-2': [3, 5, 7, 10, 12, 14, 17, 18, 19, 21, 23, 25, 27, 28, 29, 30, 31],
  '2026-3': [1, 3, 4, 5, 8, 10, 14, 16, 18, 21, 25],
};

// Event-type colours — aligned with agenda/index.tsx eventColor()
const CATEGORIES: { id: string; label: string; color: string; count: number }[] = [
  { id: 'game',        label: 'Games',       color: '#990000', count: 2 },
  { id: 'practice',    label: 'Practices',   color: '#D97757', count: 5 },
  { id: 'meeting',     label: 'Meetings',    color: '#D97757', count: 4 },
  { id: 'deadline',    label: 'Deadlines',   color: '#B85C5C', count: 1 },
  { id: 'service',     label: 'Service',     color: '#5A8A6E', count: 2 },
  { id: 'class',       label: 'Classes',     color: '#003A63', count: 3 },
  { id: 'event',       label: 'Events',      color: '#D97757', count: 3 },
];

// Today's upcoming events (snapshot — chronological, all-day first)
const TODAY_EVENTS = [
  { id: 'e1', time: 'All Day',  title: 'Conference Day',   color: '#D97757' },
  { id: 'e2', time: '7:00 AM',  title: 'Morning Practice', color: '#D97757' },
  { id: 'e3', time: '9:00 AM',  title: 'Weekly Standup',   color: '#D97757' },
  { id: 'e4', time: '2:00 PM',  title: 'Film Session',     color: '#D97757' },
];

const ADMIN_ROLES = new Set(['founder', 'head_coach', 'athletic_director', 'principal', 'admin', 'owner']);

// ── Types ─────────────────────────────────────────────────────────────────────

type CalCell = {
  day: number;
  kind: 'prev' | 'current' | 'next';
  isToday: boolean;
  hasEvent: boolean;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function AgendaPanel() {
  const C       = useColors();
  const role    = useOperatingRole();
  const isAdmin = ADMIN_ROLES.has(role);

  // Calendar
  const [calYear,  setCalYear]  = useState(TODAY.year);
  const [calMonth, setCalMonth] = useState(TODAY.month);
  const [selDay,   setSelDay]   = useState<number | null>(null);

  // Inline quick-add forms
  const [showReminder, setShowReminder] = useState(false);
  const [reminderText, setReminderText] = useState('');
  const [showTask,     setShowTask]     = useState(false);
  const [taskText,     setTaskText]     = useState('');

  // Settings collapsible
  const [settingsOpen, setSettingsOpen] = useState(false);

  // ── Calendar cell builder ────────────────────────────────────────────────

  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const daysInPrev  = new Date(calYear, calMonth, 0).getDate();
  const evDays      = EVENT_DAYS[`${calYear}-${calMonth}`] ?? [];

  const cells: CalCell[] = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, kind: 'prev',    isToday: false, hasEvent: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d,             kind: 'current', isToday: d === TODAY.day && calMonth === TODAY.month && calYear === TODAY.year, hasEvent: evDays.includes(d) });
  const trailing = (7 - ((firstDay + daysInMonth) % 7)) % 7;
  for (let i = 1; i <= trailing; i++)
    cells.push({ day: i,             kind: 'next',    isToday: false, hasEvent: false });

  const prevMonth = () => calMonth === 0
    ? (setCalMonth(11), setCalYear(y => y - 1))
    : setCalMonth(m => m - 1);
  const nextMonth = () => calMonth === 11
    ? (setCalMonth(0), setCalYear(y => y + 1))
    : setCalMonth(m => m + 1);

  const goToday = () => {
    setCalYear(TODAY.year); setCalMonth(TODAY.month); setSelDay(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
  };

  const onDayPress = (cell: CalCell) => {
    if (cell.kind !== 'current') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelDay(cell.isToday ? null : cell.day);
    closeSidePanel();
  };

  // ── Nav row helper ───────────────────────────────────────────────────────

  const navRow = (icon: string, label: string, detail?: string, onPress?: () => void) => (
    <Pressable
      key={label}
      style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress?.(); }}
    >
      <IconSymbol name={icon as any} size={17} color={C.secondary} />
      <Text style={[s.navLabel, { color: C.label }]}>{label}</Text>
      {detail && <Text style={[s.navDetail, { color: C.muted }]}>{detail}</Text>}
      <IconSymbol name="chevron.right" size={11} color={C.muted} />
    </Pressable>
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={{ gap: 8 }}>

      {/* ── Mini Calendar ──────────────────────────────────────────────────── */}
      <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 12 }}>

        {/* Month header + nav */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>
            {MONTH_NAMES[calMonth]} {calYear}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Pressable
              style={[s.calNavBtn, { borderColor: C.separator }]}
              onPress={() => { Haptics.selectionAsync(); prevMonth(); }}
              hitSlop={6}
            >
              <Text style={[s.calNavGlyph, { color: C.secondary }]}>‹</Text>
            </Pressable>
            <Pressable
              style={[s.calTodayBtn, { borderColor: C.separator }]}
              onPress={goToday}
            >
              <Text style={{ fontSize: 10, fontWeight: '600', color: C.label }}>Today</Text>
            </Pressable>
            <Pressable
              style={[s.calNavBtn, { borderColor: C.separator }]}
              onPress={() => { Haptics.selectionAsync(); nextMonth(); }}
              hitSlop={6}
            >
              <Text style={[s.calNavGlyph, { color: C.secondary }]}>›</Text>
            </Pressable>
          </View>
        </View>

        {/* Day-of-week labels */}
        <View style={s.calGrid}>
          {DAY_HEADERS.map((h, i) => (
            <View key={`h${i}`} style={s.calCell}>
              <Text style={{ fontSize: 9, fontWeight: '600', color: C.muted, letterSpacing: 0.3 }}>{h}</Text>
            </View>
          ))}

          {/* Day cells */}
          {cells.map((cell, i) => {
            const isSel  = !cell.isToday && selDay === cell.day && cell.kind === 'current';
            const dimmed = cell.kind !== 'current';
            return (
              <Pressable
                key={i}
                style={[
                  s.calCell,
                  cell.isToday && { backgroundColor: C.label, borderRadius: 7 },
                  isSel        && { backgroundColor: C.surfacePressed, borderRadius: 7 },
                ]}
                onPress={() => onDayPress(cell)}
                disabled={dimmed}
              >
                <Text style={{
                  fontSize: 10.5,
                  fontWeight: cell.isToday || isSel ? '700' : '400',
                  color: cell.isToday ? C.bg : dimmed ? C.muted : C.label,
                  opacity: dimmed ? 0.28 : 1,
                }}>
                  {cell.day}
                </Text>
                {cell.hasEvent && !dimmed && (
                  <View style={{
                    width: 3, height: 3, borderRadius: 1.5, marginTop: 1,
                    backgroundColor: cell.isToday ? 'rgba(255,255,255,0.55)' : C.accent,
                  }} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── Quick Add ──────────────────────────────────────────────────────── */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Quick Add</Text>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {([
          { key: 'event',    label: 'Event',    icon: 'calendar.badge.plus' },
          { key: 'reminder', label: 'Reminder', icon: 'clock' },
          { key: 'task',     label: 'Task',     icon: 'checkmark.circle' },
        ] as const).map(item => (
          <Pressable
            key={item.key}
            style={({ pressed }) => [s.quickBtn, {
              backgroundColor: pressed ? C.surfacePressed : C.surface,
            }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (item.key === 'event') {
                closeSidePanel();
              } else if (item.key === 'reminder') {
                setShowTask(false); setTaskText('');
                setShowReminder(v => !v);
              } else {
                setShowReminder(false); setReminderText('');
                setShowTask(v => !v);
              }
            }}
          >
            <IconSymbol name={item.icon as any} size={20} color={C.accent} />
            <Text style={{ fontSize: 11, fontWeight: '600', color: C.label, marginTop: 3 }}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Inline Reminder form */}
      {showReminder && (
        <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 12, gap: 8 }}>
          <Text style={[s.sectionHeader, { color: C.secondary }]}>New Reminder</Text>
          <TextInput
            style={[s.inlineInput, { backgroundColor: C.surfacePressed, color: C.label, borderColor: C.inputBorder }]}
            placeholder="Reminder title…"
            placeholderTextColor={C.muted}
            value={reminderText}
            onChangeText={setReminderText}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => {
              if (reminderText.trim()) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setReminderText(''); setShowReminder(false); closeSidePanel();
              }
            }}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              style={[s.inlineActionBtn, { backgroundColor: C.accent }]}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setReminderText(''); setShowReminder(false); closeSidePanel();
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Add</Text>
            </Pressable>
            <Pressable
              style={[s.inlineActionBtn, { backgroundColor: C.surfacePressed }]}
              onPress={() => { setShowReminder(false); setReminderText(''); }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Inline Task form */}
      {showTask && (
        <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 12, gap: 8 }}>
          <Text style={[s.sectionHeader, { color: C.secondary }]}>New Task</Text>
          <TextInput
            style={[s.inlineInput, { backgroundColor: C.surfacePressed, color: C.label, borderColor: C.inputBorder }]}
            placeholder="Task title…"
            placeholderTextColor={C.muted}
            value={taskText}
            onChangeText={setTaskText}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => {
              if (taskText.trim()) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setTaskText(''); setShowTask(false); closeSidePanel();
              }
            }}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              style={[s.inlineActionBtn, { backgroundColor: C.accent }]}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setTaskText(''); setShowTask(false); closeSidePanel();
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Add</Text>
            </Pressable>
            <Pressable
              style={[s.inlineActionBtn, { backgroundColor: C.surfacePressed }]}
              onPress={() => { setShowTask(false); setTaskText(''); }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ── Today Snapshot ─────────────────────────────────────────────────── */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Today</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
        {TODAY_EVENTS.slice(0, 3).map((ev, i) => (
          <Pressable
            key={ev.id}
            style={({ pressed }) => [
              s.snapshotRow,
              i < 2 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              pressed && { backgroundColor: C.surfacePressed },
            ]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}
          >
            <View style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, backgroundColor: ev.color, marginRight: 10, marginVertical: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }} numberOfLines={1}>{ev.title}</Text>
              <Text style={{ fontSize: 11, color: C.secondary, marginTop: 1 }}>{ev.time}</Text>
            </View>
            <IconSymbol name="chevron.right" size={11} color={C.muted} />
          </Pressable>
        ))}
      </View>

      {/* ── My Categories ──────────────────────────────────────────────────── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
        <Text style={[s.sectionHeader, { color: C.secondary }]}>My Categories</Text>
        {isAdmin && (
          <Pressable
            hitSlop={8}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: C.accent }}>Edit</Text>
          </Pressable>
        )}
      </View>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
        {CATEGORIES.map((cat, i) => (
          <View
            key={cat.id}
            style={[
              s.catRow,
              i < CATEGORIES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
            ]}
          >
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: cat.color, flexShrink: 0 }} />
            <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: C.label }}>{cat.label}</Text>
            <Text style={{ fontSize: 11, color: C.muted }}>{cat.count} this week</Text>
          </View>
        ))}
      </View>

      {/* ── Admin ──────────────────────────────────────────────────────────── */}
      {isAdmin && (
        <>
          <Text style={[s.sectionHeader, { color: C.secondary }]}>Admin</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            {navRow('calendar.badge.plus',  'Create Brand Event',  undefined,  closeSidePanel)}
            {navRow('paintpalette.fill',    'Manage Categories',   undefined,  closeSidePanel)}
            {navRow('person.3.sequence',    'Team Availability',   undefined,  closeSidePanel)}
            {navRow('chart.bar.fill',       'Attendance Reports',  undefined,  closeSidePanel)}
          </View>
        </>
      )}

      {/* ── Settings ───────────────────────────────────────────────────────── */}
      <Pressable
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 2 }}
        onPress={() => { Haptics.selectionAsync(); setSettingsOpen(v => !v); }}
      >
        <Text style={[s.sectionHeader, { color: C.secondary }]}>Settings</Text>
        <IconSymbol
          name={settingsOpen ? 'chevron.up' : 'chevron.down'}
          size={11}
          color={C.muted}
        />
      </Pressable>
      {settingsOpen && (
        <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
          {navRow('calendar',               'Start of Week',  'Sunday')}
          {navRow('rectangle.grid.1x2',     'Default View',   'Day')}
          {navRow('globe',                  'Time Zone',      'PT')}
          {navRow('bell',                   'Notifications',  undefined, closeSidePanel)}
        </View>
      )}

      <View style={{ height: 8 }} />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  sectionHeader: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.5,
    textTransform: 'uppercase', paddingVertical: 4,
  },

  // Calendar
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: '14.285714%', alignItems: 'center', paddingVertical: 3.5 },
  calNavBtn: {
    width: 26, height: 26, borderWidth: 1, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
  calNavGlyph: { fontSize: 16, lineHeight: 20 },
  calTodayBtn: {
    paddingHorizontal: 8, height: 26, borderWidth: 1, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },

  // Quick add
  quickBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, gap: 2,
  },

  // Inline forms
  inlineInput: {
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, fontSize: 13,
  },
  inlineActionBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 8,
  },

  // Today snapshot
  snapshotRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 11,
  },

  // Categories
  catRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10, gap: 10,
  },

  // Nav rows
  navRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 13, gap: 10,
  },
  navLabel:  { flex: 1, fontSize: 14, fontWeight: '500' },
  navDetail: { fontSize: 12 },
});
