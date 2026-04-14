import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { RolePill } from '@/components/ui/role-pill';
import { useColors } from '@/hooks/use-colors';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { openSidePanel } from '@/utils/global-side-panel';
import { useDemoRole } from '@/utils/demo-role-store';
import { useMode } from '@/context/app-context';
import { resetFooter } from '@/utils/global-footer-hide';
import { useScrollFooter } from '@/hooks/use-scroll-footer';
import { useOwnerGuard } from '@/hooks/use-owner-guard';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TimeBlock {
  id: string;
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
}

interface DaySchedule {
  day: string;
  enabled: boolean;
  blocks: TimeBlock[];
}

interface BlackoutDate {
  id: string;
  start: string;
  end: string | null;
  reason: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INITIAL_SCHEDULE: DaySchedule[] = [
  {
    day: 'Monday', enabled: true,
    blocks: [
      { id: 'mb1', startHour: 9, startMin: 0, endHour: 12, endMin: 0 },
      { id: 'mb2', startHour: 14, startMin: 0, endHour: 17, endMin: 0 },
    ],
  },
  {
    day: 'Tuesday', enabled: true,
    blocks: [{ id: 'tb1', startHour: 9, startMin: 0, endHour: 17, endMin: 0 }],
  },
  {
    day: 'Wednesday', enabled: true,
    blocks: [{ id: 'wb1', startHour: 9, startMin: 0, endHour: 12, endMin: 0 }],
  },
  {
    day: 'Thursday', enabled: true,
    blocks: [{ id: 'thb1', startHour: 9, startMin: 0, endHour: 17, endMin: 0 }],
  },
  {
    day: 'Friday', enabled: true,
    blocks: [{ id: 'fb1', startHour: 10, startMin: 0, endHour: 15, endMin: 0 }],
  },
  { day: 'Saturday', enabled: false, blocks: [] },
  { day: 'Sunday',   enabled: false, blocks: [] },
];

const INITIAL_BLACKOUTS: BlackoutDate[] = [
  { id: 'bd1', start: 'Apr 15', end: 'Apr 18', reason: 'Travel' },
  { id: 'bd2', start: 'Apr 22', end: null,     reason: 'Personal' },
];

const BUFFER_OPTIONS  = ['None', '15 min', '30 min', '1 hour'];
const NOTICE_OPTIONS  = ['1 hour', '24 hours', '48 hours', '1 week'];
const ADVANCE_OPTIONS = ['1 week', '2 weeks', '1 month', '3 months'];
const DURATION_OPTIONS = ['30 min', '1 hr', '2 hrs'];

// Generate time options 6:00 AM – 10:00 PM in 30-min increments
const TIME_OPTIONS: { hour: number; min: number; label: string }[] = [];
for (let h = 6; h <= 22; h++) {
  for (const m of [0, 30]) {
    if (h === 22 && m === 30) break;
    const period   = h < 12 ? 'AM' : 'PM';
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const label    = m === 0
      ? `${displayH} ${period}`
      : `${displayH}:${String(m).padStart(2, '0')} ${period}`;
    TIME_OPTIONS.push({ hour: h, min: m, label });
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(hour: number, min: number): string {
  const period   = hour < 12 ? 'AM' : 'PM';
  const displayH = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  if (min === 0) return `${displayH} ${period}`;
  return `${displayH}:${String(min).padStart(2, '0')} ${period}`;
}

function cycleOption<T>(options: T[], current: T): T {
  const idx = options.indexOf(current);
  return options[(idx + 1) % options.length];
}

function makeBlockId(): string {
  return `blk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ---------------------------------------------------------------------------
// Sub-component — Inline time picker
// ---------------------------------------------------------------------------

function TimePicker({
  selected,
  onSelect,
  C,
}: {
  selected: { hour: number; min: number };
  onSelect: (hour: number, min: number) => void;
  C: ReturnType<typeof useColors>;
}) {
  return (
    <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
      {TIME_OPTIONS.map((opt) => {
        const isActive = opt.hour === selected.hour && opt.min === selected.min;
        return (
          <Pressable
            key={`${opt.hour}-${opt.min}`}
            onPress={() => onSelect(opt.hour, opt.min)}
            style={[
              styles.timePickerRow,
              { backgroundColor: isActive ? C.label : 'transparent', borderRadius: 8 },
            ]}
          >
            <Text style={[styles.timePickerLabel, { color: isActive ? C.bg : C.label }]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function AvailabilityScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const mode = useMode();
  const _rk = mode === 'sports' ? 'sports:agenda' : mode === 'community' ? 'community:agenda' : mode === 'education' ? 'education' : mode === 'business' ? 'business' : 'personal:agenda';
  const [role, cycleRole, roleCycles] = useDemoRole(_rk);
  const isOwner = role === roleCycles[0];
  const guardedCycle = useOwnerGuard(role, roleCycles, cycleRole, '/(tabs)/(main)/agenda');

  const [schedule,  setSchedule]  = useState<DaySchedule[]>(INITIAL_SCHEDULE);
  const [editDay,   setEditDay]   = useState<DaySchedule | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{
    blockId: string;
    field: 'start' | 'end';
  } | null>(null);

  const [bufferTime,  setBufferTime]  = useState('15 min');
  const [durations,   setDurations]   = useState<string[]>(['1 hr']);
  const [minNotice,   setMinNotice]   = useState('24 hours');
  const [maxAdvance,  setMaxAdvance]  = useState('1 month');
  const [blackouts,   setBlackouts]   = useState<BlackoutDate[]>(INITIAL_BLACKOUTS);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const scrollFooter = useScrollFooter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  // ── Schedule helpers ──────────────────────────────────────────────────────

  function toggleDay(dayName: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSchedule(prev => prev.map(d => d.day === dayName ? { ...d, enabled: !d.enabled } : d));
  }

  function openDaySheet(day: DaySchedule) {
    if (!day.enabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditDay({ ...day, blocks: day.blocks.map(b => ({ ...b })) });
    setPickerTarget(null);
    setSheetVisible(true);
  }

  function saveDay() {
    if (!editDay) return;
    setSchedule(prev => prev.map(d => d.day === editDay.day ? { ...editDay } : d));
    setSheetVisible(false);
    setEditDay(null);
    setPickerTarget(null);
  }

  function addBlock() {
    if (!editDay) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditDay(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        blocks: [...prev.blocks, { id: makeBlockId(), startHour: 9, startMin: 0, endHour: 10, endMin: 0 }],
      };
    });
  }

  function deleteBlock(blockId: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditDay(prev => {
      if (!prev) return prev;
      return { ...prev, blocks: prev.blocks.filter(b => b.id !== blockId) };
    });
    if (pickerTarget?.blockId === blockId) setPickerTarget(null);
  }

  function updateBlockTime(blockId: string, field: 'start' | 'end', hour: number, min: number) {
    setEditDay(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        blocks: prev.blocks.map(b => {
          if (b.id !== blockId) return b;
          return field === 'start'
            ? { ...b, startHour: hour, startMin: min }
            : { ...b, endHour: hour, endMin: min };
        }),
      };
    });
  }

  function applyToAllWeekdays() {
    if (!editDay) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSchedule(prev => prev.map(d => {
      if (['Saturday', 'Sunday'].includes(d.day)) return d;
      return { ...d, enabled: true, blocks: editDay.blocks.map(b => ({ ...b, id: makeBlockId() })) };
    }));
  }

  function togglePicker(blockId: string, field: 'start' | 'end') {
    setPickerTarget(prev => {
      if (prev?.blockId === blockId && prev.field === field) return null;
      return { blockId, field };
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[styles.topBarOuter, { paddingTop: insets.top + 8, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => openSidePanel()} hitSlop={8} style={styles.topBarSide}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[styles.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[styles.titleText, { color: C.label }]}>Availability</Text>
            </View>
          </View>
          <View style={{ minWidth: 44, alignItems: 'flex-end', justifyContent: 'center' }}>
            <RolePill role={role} onPress={guardedCycle} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>
      {/* Body */}
      <ScrollView
        {...scrollFooter}
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: insets.top + 8 + 52 + 8, paddingBottom: 49 + insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* Weekly Schedule */}
        <Text style={[styles.sectionLabel, { color: C.secondary, marginTop: 8 }]}>WEEKLY SCHEDULE</Text>

        {schedule.map(day => (
          <Pressable
            key={day.day}
            onPress={() => openDaySheet(day)}
            style={[styles.dayCard, { backgroundColor: C.surface }]}
          >
            <Text style={[styles.dayName, { color: day.enabled ? C.label : C.muted }]}>
              {day.day}
            </Text>

            <View style={styles.dayMiddle}>
              {day.enabled ? (
                day.blocks.length > 0 ? (
                  <View style={styles.pillWrap}>
                    {day.blocks.map(b => (
                      <View key={b.id} style={[styles.timePill, { backgroundColor: 'rgba(90,138,110,0.15)', borderColor: '#5A8A6E' }]}>
                        <Text style={[styles.timePillText, { color: '#5A8A6E' }]}>
                          {formatTime(b.startHour, b.startMin)} – {formatTime(b.endHour, b.endMin)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={[styles.statusText, { color: C.muted }]}>No times set</Text>
                )
              ) : (
                <Text style={[styles.statusText, { color: C.muted }]}>Unavailable</Text>
              )}
            </View>

            <Switch
              value={day.enabled}
              onValueChange={() => toggleDay(day.day)}
              trackColor={{ false: C.separator, true: C.label }}
              thumbColor={C.bg}
            />
          </Pressable>
        ))}

        {/* Booking Settings */}
        <Text style={[styles.sectionLabel, { color: C.secondary }]}>BOOKING SETTINGS</Text>

        <View style={[styles.settingsCard, { backgroundColor: C.surface }]}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setBufferTime(cycleOption(BUFFER_OPTIONS, bufferTime)); }}
            style={[styles.settingsRow, { borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth }]}
          >
            <Text style={[styles.settingsLabel, { color: C.label }]}>Buffer between bookings</Text>
            <View style={styles.settingsRight}>
              <Text style={[styles.settingsValue, { color: C.secondary }]}>{bufferTime}</Text>
              <IconSymbol name="chevron.right" size={14} color={C.muted} />
            </View>
          </Pressable>

          <View style={[styles.settingsRow, { borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, flexWrap: 'wrap', gap: 8 }]}>
            <Text style={[styles.settingsLabel, { color: C.label }]}>Available durations</Text>
            <View style={styles.durationPills}>
              {DURATION_OPTIONS.map(opt => {
                const active = durations.includes(opt);
                return (
                  <Pressable
                    key={opt}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setDurations(prev => active ? prev.filter(d => d !== opt) : [...prev, opt]);
                    }}
                    style={[
                      styles.durationPill,
                      { backgroundColor: active ? C.label : 'transparent', borderColor: active ? C.label : C.separator },
                    ]}
                  >
                    <Text style={[styles.durationPillText, { color: active ? C.bg : C.secondary }]}>{opt}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMinNotice(cycleOption(NOTICE_OPTIONS, minNotice)); }}
            style={[styles.settingsRow, { borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth }]}
          >
            <Text style={[styles.settingsLabel, { color: C.label }]}>Minimum advance notice</Text>
            <View style={styles.settingsRight}>
              <Text style={[styles.settingsValue, { color: C.secondary }]}>{minNotice}</Text>
              <IconSymbol name="chevron.right" size={14} color={C.muted} />
            </View>
          </Pressable>

          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMaxAdvance(cycleOption(ADVANCE_OPTIONS, maxAdvance)); }}
            style={styles.settingsRow}
          >
            <Text style={[styles.settingsLabel, { color: C.label }]}>Book up to</Text>
            <View style={styles.settingsRight}>
              <Text style={[styles.settingsValue, { color: C.secondary }]}>{maxAdvance}</Text>
              <IconSymbol name="chevron.right" size={14} color={C.muted} />
            </View>
          </Pressable>
        </View>

        {/* Blackout Dates */}
        <Text style={[styles.sectionLabel, { color: C.secondary }]}>BLACKOUT DATES</Text>

        <View style={[styles.settingsCard, { backgroundColor: C.surface }]}>
          {blackouts.map((b, idx) => (
            <View
              key={b.id}
              style={[
                styles.blackoutRow,
                { borderBottomColor: C.separator, borderBottomWidth: idx < blackouts.length - 1 ? StyleSheet.hairlineWidth : 0 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.blackoutDate, { color: C.label }]}>
                  {b.end ? `${b.start} – ${b.end}` : b.start}
                </Text>
                <Text style={[styles.blackoutReason, { color: C.secondary }]}>{b.reason}</Text>
              </View>
              <Pressable
                onPress={() => setBlackouts(prev => prev.filter(x => x.id !== b.id))}
                hitSlop={8}
              >
                <IconSymbol name="xmark.circle.fill" size={20} color="#B85C5C" />
              </Pressable>
            </View>
          ))}

          <Pressable
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            style={[styles.addRow, { borderTopColor: blackouts.length > 0 ? C.separator : 'transparent', borderTopWidth: blackouts.length > 0 ? StyleSheet.hairlineWidth : 0 }]}
          >
            <IconSymbol name="plus" size={14} color={C.secondary} />
            <Text style={[styles.addText, { color: C.secondary }]}>Add Blackout</Text>
          </Pressable>
        </View>

        <Text style={[styles.footerNote, { color: C.secondary }]}>
          These settings control the 'Book a Session' link on your Profile.
          Followers see only your available slots.
        </Text>
      </ScrollView>

      {/* Day Detail Sheet */}
      <BottomSheet
        visible={sheetVisible}
        onClose={() => { setSheetVisible(false); setEditDay(null); setPickerTarget(null); }}
        snapPoints={['60%', '90%']}
        useModal
      >
        {editDay && (
          <View style={styles.sheetInner}>
            <Text style={[styles.sheetTitle, { color: C.label }]}>{editDay.day}</Text>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {editDay.blocks.map(block => {
                const startOpen = pickerTarget?.blockId === block.id && pickerTarget.field === 'start';
                const endOpen   = pickerTarget?.blockId === block.id && pickerTarget.field === 'end';

                return (
                  <View key={block.id} style={{ marginBottom: 8 }}>
                    <View style={[styles.blockRow, { backgroundColor: C.bg, borderColor: C.separator }]}>
                      <Pressable
                        onPress={() => togglePicker(block.id, 'start')}
                        style={[styles.timeButton, { backgroundColor: startOpen ? C.label : C.surface }]}
                      >
                        <Text style={[styles.timeButtonText, { color: startOpen ? C.bg : C.label }]}>
                          {formatTime(block.startHour, block.startMin)}
                        </Text>
                      </Pressable>

                      <Text style={[{ fontSize: 16, color: C.secondary }]}>–</Text>

                      <Pressable
                        onPress={() => togglePicker(block.id, 'end')}
                        style={[styles.timeButton, { backgroundColor: endOpen ? C.label : C.surface }]}
                      >
                        <Text style={[styles.timeButtonText, { color: endOpen ? C.bg : C.label }]}>
                          {formatTime(block.endHour, block.endMin)}
                        </Text>
                      </Pressable>

                      <Pressable onPress={() => deleteBlock(block.id)} hitSlop={8}>
                        <IconSymbol name="xmark" size={14} color="#B85C5C" />
                      </Pressable>
                    </View>

                    {(startOpen || endOpen) && (
                      <View style={[styles.inlinePicker, { backgroundColor: C.surface, borderColor: C.separator }]}>
                        <Text style={[styles.pickerLabel, { color: C.secondary }]}>
                          {startOpen ? 'Start time' : 'End time'}
                        </Text>
                        <TimePicker
                          selected={startOpen
                            ? { hour: block.startHour, min: block.startMin }
                            : { hour: block.endHour,   min: block.endMin   }}
                          onSelect={(h, m) => updateBlockTime(block.id, startOpen ? 'start' : 'end', h, m)}
                          C={C}
                        />
                      </View>
                    )}
                  </View>
                );
              })}

              <Pressable
                onPress={addBlock}
                style={[styles.addRow, { borderTopColor: 'transparent', borderTopWidth: 0 }]}
              >
                <IconSymbol name="plus" size={14} color={C.secondary} />
                <Text style={[styles.addText, { color: C.secondary }]}>Add Time Block</Text>
              </Pressable>

              <Pressable
                onPress={applyToAllWeekdays}
                style={[styles.applyButton, { backgroundColor: C.surface, borderColor: C.separator }]}
              >
                <Text style={[styles.applyButtonText, { color: C.label }]}>Apply to all weekdays</Text>
              </Pressable>

              <Pressable
                onPress={saveDay}
                style={[styles.saveButton, { backgroundColor: C.label }]}
              >
                <Text style={[styles.saveButtonText, { color: C.bg }]}>Save</Text>
              </Pressable>
            </ScrollView>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: { flex: 1 },

  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  topBarSide: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titlePill: {
    paddingHorizontal: 12,
    paddingVertical:    5,
    borderRadius:      14,
    borderWidth:        1,
  },
  titleText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

  scroll: { flex: 1 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 20,
  },

  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 6,
    padding: 14,
  },
  dayName: { fontSize: 14, fontWeight: '600', width: 90 },
  dayMiddle: { flex: 1, marginHorizontal: 10 },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  timePill: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  timePillText: { fontSize: 11, fontWeight: '500' },
  statusText: { fontSize: 13 },

  settingsCard: {
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    minHeight: 50,
  },
  settingsLabel: { fontSize: 14, flex: 1 },
  settingsRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  settingsValue: { fontSize: 14 },
  durationPills: { flexDirection: 'row', gap: 8 },
  durationPill: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  durationPillText: { fontSize: 13, fontWeight: '500' },

  blackoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  blackoutDate: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  blackoutReason: { fontSize: 12 },

  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
  },
  addText: { fontSize: 14 },

  footerNote: {
    fontSize: 12,
    textAlign: 'center',
    marginHorizontal: 24,
    marginTop: 24,
    lineHeight: 18,
  },

  sheetInner: { flex: 1, paddingHorizontal: 16, paddingTop: 4 },
  sheetTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },

  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
    gap: 8,
  },
  timeButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  timeButtonText: { fontSize: 14, fontWeight: '600' },

  inlinePicker: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
    padding: 12,
  },
  pickerLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  timePickerRow: { paddingVertical: 10, paddingHorizontal: 12, marginBottom: 2 },
  timePickerLabel: { fontSize: 15, fontWeight: '500' },

  applyButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  applyButtonText: { fontSize: 15, fontWeight: '600' },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonText: { fontSize: 15, fontWeight: '700' },
});
