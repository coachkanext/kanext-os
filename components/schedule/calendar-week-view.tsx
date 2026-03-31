/**
 * Calendar Week View
 * 7-day time grid (Mon–Sun) with 6am–10pm hour slots.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, Text } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { getHourSlots, formatHourLabel, isSameDay, getWeekDates } from '@/data/calendar-utils';
import { EVENT_TYPE_COLORS } from '@/data/calendar-utils';
import type { ProgramCalendarEvent } from '@/types';

interface CalendarWeekViewProps {
  selectedDate: Date;
  events: ProgramCalendarEvent[];
  colors: typeof Colors.light;
  onEventPress: (event: ProgramCalendarEvent) => void;
  onDayPress: (date: Date) => void;
}

const HOUR_HEIGHT = 60;
const TIME_COL_WIDTH = 40;
const START_HOUR = 6;
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarWeekView({ selectedDate, events, colors, onEventPress, onDayPress }: CalendarWeekViewProps) {
  const hours = getHourSlots();
  const weekDates = getWeekDates(selectedDate);
  const today = new Date();

  return (
    <View style={{ flex: 1 }}>
      {/* Day headers */}
      <View style={[styles.dayHeaderRow, { borderBottomColor: colors.divider }]}>
        <View style={{ width: TIME_COL_WIDTH }} />
        {weekDates.map((date, i) => {
          const isToday = isSameDay(date, today);
          return (
            <Pressable
              key={i}
              style={[styles.dayHeaderCell, isToday && styles.dayHeaderToday]}
              onPress={() => onDayPress(date)}
            >
              <ThemedText style={[styles.dayLabel, { color: isToday ? '#fff' : colors.textTertiary }]}>
                {DAY_LABELS[i]}
              </ThemedText>
              <ThemedText style={[styles.dayNum, { color: isToday ? '#fff' : colors.text }]}>
                {date.getDate()}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Time grid */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {/* Hour rows */}
          {hours.map((hour) => (
            <View key={hour} style={[styles.hourRow, { borderBottomColor: colors.divider }]}>
              <View style={styles.timeCol}>
                <ThemedText style={[styles.timeLabel, { color: colors.textTertiary }]}>
                  {formatHourLabel(hour)}
                </ThemedText>
              </View>
              {weekDates.map((_, dayIdx) => (
                <View
                  key={dayIdx}
                  style={[
                    styles.dayCol,
                    { borderLeftColor: colors.divider },
                    isSameDay(weekDates[dayIdx], today) && { backgroundColor: colors.text + '04' },
                  ]}
                />
              ))}
            </View>
          ))}

          {/* Events overlay */}
          {weekDates.map((date, dayIdx) => {
            const dayEvents = events.filter((e) => isSameDay(e.startDatetime, date));
            const colWidth = `${100 / 7}%`;

            return dayEvents.map((event) => {
              const startMinutes = (event.startDatetime.getHours() - START_HOUR) * 60 + event.startDatetime.getMinutes();
              const endMinutes = (event.endDatetime.getHours() - START_HOUR) * 60 + event.endDatetime.getMinutes();
              const top = Math.max(0, (startMinutes / 60) * HOUR_HEIGHT);
              const height = Math.max(20, ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT);
              const typeColor = EVENT_TYPE_COLORS[event.type];
              const leftPx = TIME_COL_WIDTH + (dayIdx * ((100 - TIME_COL_WIDTH) / 7));

              return (
                <Pressable
                  key={event.id}
                  style={[
                    styles.eventPill,
                    {
                      top,
                      height: Math.min(height, 180),
                      left: `${((dayIdx / 7) * 100) + (TIME_COL_WIDTH / 3.5)}%` as any,
                      width: `${100 / 7 - 1}%` as any,
                      borderLeftColor: typeColor,
                      backgroundColor: typeColor + '20',
                    },
                  ]}
                  onPress={() => onEventPress(event)}
                >
                  <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={1}>
                    {event.title}
                  </Text>
                  {height > 30 && (
                    <Text style={[styles.eventTime, { color: colors.textTertiary }]} numberOfLines={1}>
                      {event.startDatetime.getHours() % 12 || 12}{event.startDatetime.getMinutes() > 0 ? `:${event.startDatetime.getMinutes().toString().padStart(2, '0')}` : ''}{event.startDatetime.getHours() >= 12 ? 'p' : 'a'}
                    </Text>
                  )}
                </Pressable>
              );
            });
          })}

          {/* Current time indicator */}
          {weekDates.some((d) => isSameDay(d, today)) && (() => {
            const now = new Date();
            const minutesSinceStart = (now.getHours() - START_HOUR) * 60 + now.getMinutes();
            if (minutesSinceStart < 0 || minutesSinceStart > (22 - START_HOUR) * 60) return null;
            const top = (minutesSinceStart / 60) * HOUR_HEIGHT;
            return (
              <View style={[styles.nowLine, { top }]} pointerEvents="none">
                <View style={styles.nowLineBar} />
              </View>
            );
          })()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dayHeaderRow: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 6 },
  dayHeaderCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  dayHeaderToday: { backgroundColor: '#B85C5C', borderRadius: 8, marginHorizontal: 2 },
  dayLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
  dayNum: { fontSize: 14, fontWeight: '700' },
  grid: { position: 'relative', minHeight: 17 * HOUR_HEIGHT },
  hourRow: { height: HOUR_HEIGHT, flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
  timeCol: { width: TIME_COL_WIDTH, paddingRight: 4, alignItems: 'flex-end', justifyContent: 'flex-start' },
  timeLabel: { fontSize: 9, fontWeight: '500' },
  dayCol: { flex: 1, borderLeftWidth: StyleSheet.hairlineWidth },
  eventPill: { position: 'absolute', borderLeftWidth: 3, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2, overflow: 'hidden' },
  eventTitle: { fontSize: 10, fontWeight: '600' },
  eventTime: { fontSize: 9 },
  nowLine: { position: 'absolute', left: TIME_COL_WIDTH, right: 0, flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  nowLineBar: { flex: 1, height: 1.5, backgroundColor: '#B85C5C' },
});
