/**
 * Calendar Month View
 * 7×6 grid with day numbers and event dots.
 * Tap day → switches to Day view for that date.
 */

import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { getMonthGrid, isSameDay } from '@/data/calendar-utils';
import { EVENT_TYPE_COLORS } from '@/data/calendar-utils';
import type { ProgramCalendarEvent } from '@/types';

interface CalendarMonthViewProps {
  selectedDate: Date;
  events: ProgramCalendarEvent[];
  colors: typeof Colors.light;
  onDayPress: (date: Date) => void;
}

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarMonthView({ selectedDate, events, colors, onDayPress }: CalendarMonthViewProps) {
  const grid = getMonthGrid(selectedDate);
  const today = new Date();
  const currentMonth = selectedDate.getMonth();

  // Group events by day for dot display
  const eventsByDay = new Map<string, ProgramCalendarEvent[]>();
  for (const event of events) {
    const key = `${event.startDatetime.getFullYear()}-${event.startDatetime.getMonth()}-${event.startDatetime.getDate()}`;
    if (!eventsByDay.has(key)) eventsByDay.set(key, []);
    eventsByDay.get(key)!.push(event);
  }

  return (
    <View style={styles.container}>
      {/* Day headers */}
      <View style={styles.headerRow}>
        {DAY_HEADERS.map((label) => (
          <View key={label} style={styles.headerCell}>
            <ThemedText style={[styles.headerLabel, { color: colors.textTertiary }]}>{label}</ThemedText>
          </View>
        ))}
      </View>

      {/* Grid (6 rows × 7 cols) */}
      {Array.from({ length: 6 }).map((_, weekIdx) => (
        <View key={weekIdx} style={styles.weekRow}>
          {grid.slice(weekIdx * 7, weekIdx * 7 + 7).map((date, dayIdx) => {
            const isCurrentMonth = date.getMonth() === currentMonth;
            const isToday = isSameDay(date, today);
            const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            const dayEvents = eventsByDay.get(key) ?? [];

            // Get unique event type colors for dots (max 3)
            const uniqueTypes = [...new Set(dayEvents.map((e) => e.type))];
            const dotColors = uniqueTypes.slice(0, 3).map((t) => EVENT_TYPE_COLORS[t]);
            const overflow = dayEvents.length > 3 ? dayEvents.length - 3 : 0;

            return (
              <Pressable
                key={dayIdx}
                style={[
                  styles.dayCell,
                  { borderColor: colors.divider },
                  isToday && styles.todayCell,
                ]}
                onPress={() => onDayPress(date)}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    { color: isCurrentMonth ? colors.text : colors.textTertiary + '60' },
                    isToday && styles.todayNumber,
                  ]}
                >
                  {date.getDate()}
                </Text>
                {/* Event dots */}
                {dotColors.length > 0 && (
                  <View style={styles.dotsRow}>
                    {dotColors.map((color, i) => (
                      <View key={i} style={[styles.dot, { backgroundColor: color }]} />
                    ))}
                    {overflow > 0 && (
                      <Text style={[styles.overflowText, { color: colors.textTertiary }]}>+{overflow}</Text>
                    )}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 4 },
  headerRow: { flexDirection: 'row', marginBottom: 4 },
  headerCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  headerLabel: { fontSize: 11, fontWeight: '600' },
  weekRow: { flexDirection: 'row' },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    padding: 2,
  },
  todayCell: { backgroundColor: '#EF444415', borderRadius: 8 },
  dayNumber: { fontSize: 13, fontWeight: '500' },
  todayNumber: { fontWeight: '800', color: '#EF4444' },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  overflowText: { fontSize: 8, fontWeight: '600' },
});
