/**
 * Calendar Hub
 * Container for Day/Week/Month calendar views with filtering.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { CalendarDayView } from '@/components/schedule/calendar-day-view';
import { CalendarWeekView } from '@/components/schedule/calendar-week-view';
import { CalendarMonthView } from '@/components/schedule/calendar-month-view';
import { CalendarFilterSheet } from '@/components/schedule/calendar-filter-sheet';
import { EventDetailSheet } from '@/components/schedule/event-detail-sheet';
import {
  getWeekDates, formatDateRange, formatDate, formatMonthYear,
  gamesToCalendarEvents, isSameDay,
} from '@/data/calendar-utils';
import { FMU_GAMES } from '@/data/fmu';
import { MOCK_CALENDAR_EVENTS } from '@/data/mock-calendar-events';
import type { ProgramCalendarEvent, ProgramCalendarEventType, CalendarVisibilityScope } from '@/types';

type ViewMode = 'day' | 'week' | 'month';

interface CalendarHubProps {
  colors: typeof Colors.light;
  router: any;
  events?: ProgramCalendarEvent[];
}

export function CalendarHub({ colors, router, events }: CalendarHubProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [scopeFilter, setScopeFilter] = useState<CalendarVisibilityScope>('all_program');
  const [typeFilters, setTypeFilters] = useState<Set<ProgramCalendarEventType>>(
    () => new Set(['game', 'practice', 'lift', 'travel', 'meeting', 'recruiting', 'academic', 'admin_deadline']),
  );
  const [selectedEvent, setSelectedEvent] = useState<ProgramCalendarEvent | null>(null);

  // Merge game events + mock events (Spec 3: auto-populate)
  // When external events prop is provided, use those instead of internal merge.
  const allEvents = useMemo(() => {
    if (events) return events;
    const gameEvents = gamesToCalendarEvents(FMU_GAMES);
    return [...gameEvents, ...MOCK_CALENDAR_EVENTS];
  }, [events]);

  // Apply filters
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      if (!typeFilters.has(event.type)) return false;
      if (scopeFilter === 'team_staff' && event.visibilityScope === 'player') return false;
      if (scopeFilter === 'player' && event.visibilityScope !== 'player' && event.visibilityScope !== 'all_program') return false;
      return true;
    });
  }, [allEvents, typeFilters, scopeFilter]);

  // Navigation
  const navigatePrev = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate((prev) => {
      const d = new Date(prev);
      if (viewMode === 'day') d.setDate(d.getDate() - 1);
      else if (viewMode === 'week') d.setDate(d.getDate() - 7);
      else d.setMonth(d.getMonth() - 1);
      return d;
    });
  }, [viewMode]);

  const navigateNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate((prev) => {
      const d = new Date(prev);
      if (viewMode === 'day') d.setDate(d.getDate() + 1);
      else if (viewMode === 'week') d.setDate(d.getDate() + 7);
      else d.setMonth(d.getMonth() + 1);
      return d;
    });
  }, [viewMode]);

  const goToToday = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(new Date());
  }, []);

  const handleDayPress = useCallback((date: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(date);
    setViewMode('day');
  }, []);

  const handleEventPress = useCallback((event: ProgramCalendarEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedEvent(event);
  }, []);

  const handleTypeToggle = useCallback((type: ProgramCalendarEventType) => {
    setTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  // Header label
  const headerLabel = viewMode === 'day'
    ? formatDate(selectedDate)
    : viewMode === 'week'
      ? formatDateRange(getWeekDates(selectedDate))
      : formatMonthYear(selectedDate);

  const isToday = isSameDay(selectedDate, new Date());

  return (
    <View style={{ flex: 1 }}>
      {/* Date header row */}
      <View style={[styles.headerRow, { backgroundColor: colors.background }]}>
        <Pressable onPress={navigatePrev} style={styles.navBtn}>
          <IconSymbol name="chevron.left" size={16} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <ThemedText style={[styles.headerText, { color: colors.text }]} numberOfLines={1}>
            {headerLabel}
          </ThemedText>
        </View>
        <Pressable onPress={navigateNext} style={styles.navBtn}>
          <IconSymbol name="chevron.right" size={16} color={colors.text} />
        </Pressable>
        {!isToday && (
          <Pressable onPress={goToToday} style={[styles.todayPill, { backgroundColor: colors.text + '15' }]}>
            <ThemedText style={[styles.todayText, { color: colors.text }]}>Today</ThemedText>
          </Pressable>
        )}
      </View>

      {/* View toggle + Filter */}
      <View style={[styles.controlRow, { backgroundColor: colors.background }]}>
        <View style={styles.viewToggle}>
          {(['day', 'week', 'month'] as const).map((mode) => {
            const isActive = viewMode === mode;
            return (
              <Pressable
                key={mode}
                style={[styles.viewPill, { backgroundColor: isActive ? colors.text + 'E0' : colors.backgroundSecondary }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setViewMode(mode);
                }}
              >
                <ThemedText style={[styles.viewPillText, { color: isActive ? colors.background : colors.textSecondary }]}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          style={[styles.filterBtn, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setFilterSheetOpen(true);
          }}
        >
          <IconSymbol name="line.3.horizontal.decrease" size={14} color={colors.text} />
        </Pressable>
      </View>

      {/* Active view */}
      <View style={{ flex: 1 }}>
        {viewMode === 'day' && (
          <CalendarDayView
            date={selectedDate}
            events={filteredEvents}
            colors={colors}
            onEventPress={handleEventPress}
          />
        )}
        {viewMode === 'week' && (
          <CalendarWeekView
            selectedDate={selectedDate}
            events={filteredEvents}
            colors={colors}
            onEventPress={handleEventPress}
            onDayPress={handleDayPress}
          />
        )}
        {viewMode === 'month' && (
          <CalendarMonthView
            selectedDate={selectedDate}
            events={filteredEvents}
            colors={colors}
            onDayPress={handleDayPress}
          />
        )}
      </View>

      {/* Filter Sheet */}
      <CalendarFilterSheet
        visible={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        colors={colors}
        scopeFilter={scopeFilter}
        onScopeChange={setScopeFilter}
        typeFilters={typeFilters}
        onTypeToggle={handleTypeToggle}
      />

      {/* Event Detail Sheet */}
      <EventDetailSheet
        visible={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
        colors={colors}
        router={router}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  navBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerText: { fontSize: 15, fontWeight: '700' },
  todayPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  todayText: { fontSize: 12, fontWeight: '600' },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: 10,
    gap: 8,
  },
  viewToggle: { flexDirection: 'row', flex: 1, gap: 6 },
  viewPill: { flex: 1, paddingVertical: 6, borderRadius: 14, alignItems: 'center' },
  viewPillText: { fontSize: 12, fontWeight: '600' },
  filterBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
