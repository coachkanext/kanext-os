/**
 * Agenda Side Panel — left-edge drawer.
 * 3 sections in order: Context Scope → Date Navigation → Quick Add
 * Matches KaNeXT_Agenda_Spec_Final + kanext-agenda-v2.html prototype.
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

const PANEL_WIDTH = Dimensions.get('window').width * 0.78;

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_HEADERS = ['S','M','T','W','T','F','S'];

// Demo event days per month key "year-monthIndex"
const EVENT_DAYS: Record<string, number[]> = {
  '2026-2': [10, 11, 12, 13, 14, 15, 17, 19, 20, 23, 25, 27],
};

const TODAY = { year: 2026, month: 2, day: 14 };

const SCOPES = [
  { key: 'this-org',   label: 'This Org',         count: 'Lincoln U' },
  { key: 'all-mode',   label: 'All Orgs in Mode', count: '3 orgs'    },
  { key: 'all-modes',  label: 'All Modes',         count: '5 orgs'    },
];

const QUICK_ADD_ITEMS = [
  { key: 'event',   label: 'Event',       icon: 'calendar.badge.plus'  as const },
  { key: 'task',    label: 'Task',        icon: 'plus.circle'          as const },
  { key: 'remind',  label: 'Reminder',   icon: 'clock'                as const },
  { key: 'note',    label: 'Note',        icon: 'note.text'            as const },
  { key: 'prep',    label: 'Prep Block',  icon: 'book.fill'            as const },
  { key: 'followup',label: 'Follow-up',   icon: 'arrow.turn.up.right'  as const },
];

interface Props {
  translateX: Animated.Value;
  onOpen: () => void;
  onClose: () => void;
  onDateSelect?: (date: Date | null) => void;
  selectedDate?: Date | null;
}

type CalCell = {
  day: number;
  kind: 'prev' | 'current' | 'next';
  isToday: boolean;
  isSelected: boolean;
  hasEvent: boolean;
};

export function AgendaSidePanel({ translateX, onOpen, onClose, onDateSelect, selectedDate }: Props) {
  const C = useColors();
  const insets = useSafeAreaInsets();

  const [activeScope, setActiveScope] = useState('this-org');
  const [calYear, setCalYear]   = useState(TODAY.year);
  const [calMonth, setCalMonth] = useState(TODAY.month);

  const handleTabPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onOpen();
  }, [onOpen]);

  const panelTranslate = translateX.interpolate({
    inputRange: [0, PANEL_WIDTH],
    outputRange: [-PANEL_WIDTH, 0],
    extrapolate: 'clamp',
  });

  // ── Calendar cells ────────────────────────────────────────────────────────
  const firstDay      = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth   = new Date(calYear, calMonth + 1, 0).getDate();
  const daysInPrev    = new Date(calYear, calMonth, 0).getDate();
  const eventDaysArr  = EVENT_DAYS[`${calYear}-${calMonth}`] ?? [];

  const cells: CalCell[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, kind: 'prev', isToday: false, isSelected: false, hasEvent: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday    = d === TODAY.day && calMonth === TODAY.month && calYear === TODAY.year;
    const isSelected = !isToday
      && selectedDate != null
      && selectedDate.getDate() === d
      && selectedDate.getMonth() === calMonth
      && selectedDate.getFullYear() === calYear;
    cells.push({ day: d, kind: 'current', isToday, isSelected, hasEvent: eventDaysArr.includes(d) });
  }
  const remaining = (7 - ((firstDay + daysInMonth) % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, kind: 'next', isToday: false, isSelected: false, hasEvent: false });
  }

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };
  const goToday = () => {
    setCalMonth(TODAY.month);
    setCalYear(TODAY.year);
    onDateSelect?.(null);
    setTimeout(() => onClose(), 300);
  };

  const handleDayPress = (cell: CalCell) => {
    if (cell.kind !== 'current') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (cell.isToday) {
      onDateSelect?.(null);
    } else {
      onDateSelect?.(new Date(calYear, calMonth, cell.day));
    }
    setTimeout(() => onClose(), 320);
  };

  return (
    <>
      {/* Left-edge visible tab */}
      <Pressable
        style={[styles.tab, { top: insets.top + 80, backgroundColor: C.surface, borderColor: C.separator }]}
        onPress={handleTabPress}
      >
        <IconSymbol name="chevron.right" size={10} color={C.muted} />
      </Pressable>

      {/* Slide-in panel */}
      <Animated.View
        style={[
          styles.panel,
          {
            width: PANEL_WIDTH,
            backgroundColor: C.bg,
            borderRightColor: C.separator,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            transform: [{ translateX: panelTranslate }],
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.panelHeader, { borderBottomColor: C.separator }]}>
          <Text style={[styles.panelTitle, { color: C.label }]}>Agenda</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <IconSymbol name="xmark" size={16} color={C.secondary} />
          </Pressable>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 36 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── 1. Context Scope ───────────────────────────────────────── */}
          <Text style={[styles.sectionTitle, { color: C.muted }]}>CONTEXT SCOPE</Text>
          {SCOPES.map((scope) => {
            const isActive = activeScope === scope.key;
            return (
              <Pressable
                key={scope.key}
                style={[
                  styles.scopeBtn,
                  { borderColor: isActive ? C.label : C.separator },
                  isActive && { backgroundColor: 'rgba(0,0,0,0.03)' },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveScope(scope.key);
                }}
              >
                <Text style={[styles.scopeLabel, { color: isActive ? C.label : C.secondary, fontWeight: isActive ? '600' : '500' }]}>
                  {scope.label}
                </Text>
                <View style={[styles.scopeCount, { backgroundColor: C.surfacePressed }]}>
                  <Text style={[styles.scopeCountText, { color: C.muted }]}>{scope.count}</Text>
                </View>
              </Pressable>
            );
          })}

          <View style={[styles.divider, { backgroundColor: C.separator }]} />

          {/* ── 2. Date Navigation ─────────────────────────────────────── */}
          <View style={styles.calHeaderRow}>
            <Text style={[styles.calMonthLabel, { color: C.label }]}>
              {MONTH_NAMES[calMonth]} {calYear}
            </Text>
            <View style={styles.calNavRow}>
              <Pressable style={[styles.calNavBtn, { borderColor: C.separator }]} onPress={prevMonth}>
                <Text style={[styles.calNavText, { color: C.secondary }]}>‹</Text>
              </Pressable>
              <Pressable style={[styles.calTodayBtn, { borderColor: C.separator }]} onPress={goToday}>
                <Text style={[styles.calTodayText, { color: C.label }]}>Today</Text>
              </Pressable>
              <Pressable style={[styles.calNavBtn, { borderColor: C.separator }]} onPress={nextMonth}>
                <Text style={[styles.calNavText, { color: C.secondary }]}>›</Text>
              </Pressable>
            </View>
          </View>

          {/* Day-of-week headers */}
          <View style={styles.calGrid}>
            {DAY_HEADERS.map((h, i) => (
              <View key={`h-${i}`} style={styles.calCell}>
                <Text style={[styles.calDayHeader, { color: C.muted }]}>{h}</Text>
              </View>
            ))}

            {/* Day cells */}
            {cells.map((cell, i) => {
              const dimmed = cell.kind !== 'current';
              return (
                <Pressable
                  key={i}
                  style={[
                    styles.calCell,
                    cell.isToday && [styles.calCellToday, { backgroundColor: C.label }],
                    cell.isSelected && [styles.calCellSelected, { backgroundColor: C.surfacePressed }],
                  ]}
                  onPress={() => handleDayPress(cell)}
                  disabled={dimmed}
                >
                  <Text
                    style={[
                      styles.calDayNum,
                      {
                        color: cell.isToday
                          ? C.bg
                          : dimmed
                          ? C.muted
                          : cell.isSelected
                          ? C.label
                          : C.secondary,
                        fontWeight: cell.isToday || cell.isSelected ? '600' : '500',
                        opacity: dimmed ? 0.35 : 1,
                      },
                    ]}
                  >
                    {cell.day}
                  </Text>
                  {cell.hasEvent && (
                    <View
                      style={[
                        styles.eventDot,
                        { backgroundColor: cell.isToday ? 'rgba(255,255,255,0.55)' : C.muted },
                      ]}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.divider, { backgroundColor: C.separator }]} />

          {/* ── 3. Quick Add ───────────────────────────────────────────── */}
          <Text style={[styles.sectionTitle, { color: C.muted }]}>QUICK ADD</Text>
          {QUICK_ADD_ITEMS.map((item) => (
            <Pressable
              key={item.key}
              style={[styles.quickAddBtn, { backgroundColor: C.surfacePressed }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name={item.icon} size={17} color={C.secondary} />
              <Text style={[styles.quickAddText, { color: C.label }]}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  tab: {
    position: 'absolute',
    left: 0,
    width: 18,
    height: 48,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRightWidth: StyleSheet.hairlineWidth,
    zIndex: 200,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  panelTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },

  sectionTitle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 10 },

  // Scope
  scopeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  scopeLabel: { flex: 1, fontSize: 12.5 },
  scopeCount: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  scopeCountText: { fontSize: 11, fontWeight: '600' },

  divider: { height: 1, marginVertical: 20 },

  // Calendar
  calHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calMonthLabel: { fontSize: 13, fontWeight: '600' },
  calNavRow: { flexDirection: 'row', gap: 4 },
  calNavBtn: { width: 30, height: 30, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  calNavText: { fontSize: 18, lineHeight: 22 },
  calTodayBtn: { paddingHorizontal: 10, height: 30, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  calTodayText: { fontSize: 11, fontWeight: '600' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  calCell: { width: '14.285714%', alignItems: 'center', paddingVertical: 5, borderRadius: 8 },
  calCellToday: { borderRadius: 8 },
  calCellSelected: { borderRadius: 8 },
  calDayHeader: { fontSize: 9.5, fontWeight: '600', letterSpacing: 0.4 },
  calDayNum: { fontSize: 11 },
  eventDot: { width: 4, height: 4, borderRadius: 2, marginTop: 1.5 },

  // Quick Add
  quickAddBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 11, borderRadius: 10, marginBottom: 6 },
  quickAddText: { fontSize: 13, fontWeight: '500' },
});
