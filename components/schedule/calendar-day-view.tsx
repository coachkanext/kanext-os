/**
 * Calendar Day View
 * Single column time grid (6am–10pm, 60px/hour).
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, Text } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { getHourSlots, formatHourLabel, formatEventTime, isSameDay } from '@/data/calendar-utils';
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '@/data/calendar-utils';
import type { ProgramCalendarEvent } from '@/types';

interface CalendarDayViewProps {
  date: Date;
  events: ProgramCalendarEvent[];
  colors: typeof Colors.light;
  onEventPress: (event: ProgramCalendarEvent) => void;
}

const HOUR_HEIGHT = 60;
const START_HOUR = 6;

export function CalendarDayView({ date, events, colors, onEventPress }: CalendarDayViewProps) {
  const hours = getHourSlots();
  const dayEvents = events.filter((e) => isSameDay(e.startDatetime, date));
  const today = new Date();
  const isToday = isSameDay(date, today);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.grid}>
        {/* Time labels + grid lines */}
        {hours.map((hour) => (
          <View key={hour} style={[styles.hourRow, { borderBottomColor: colors.divider }]}>
            <View style={styles.timeCol}>
              <ThemedText style={[styles.timeLabel, { color: colors.textTertiary }]}>
                {formatHourLabel(hour)}
              </ThemedText>
            </View>
            <View style={styles.contentCol} />
          </View>
        ))}

        {/* Current time indicator */}
        {isToday && (() => {
          const now = new Date();
          const minutesSinceStart = (now.getHours() - START_HOUR) * 60 + now.getMinutes();
          if (minutesSinceStart < 0 || minutesSinceStart > (22 - START_HOUR) * 60) return null;
          const top = (minutesSinceStart / 60) * HOUR_HEIGHT;
          return (
            <View style={[styles.nowLine, { top }]} pointerEvents="none">
              <View style={styles.nowDot} />
              <View style={styles.nowLineBar} />
            </View>
          );
        })()}

        {/* Events */}
        {dayEvents.map((event) => {
          const startMinutes = (event.startDatetime.getHours() - START_HOUR) * 60 + event.startDatetime.getMinutes();
          const endMinutes = (event.endDatetime.getHours() - START_HOUR) * 60 + event.endDatetime.getMinutes();
          const top = Math.max(0, (startMinutes / 60) * HOUR_HEIGHT);
          const height = Math.max(30, ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT);
          const typeColor = EVENT_TYPE_COLORS[event.type];

          return (
            <Pressable
              key={event.id}
              style={[styles.eventCard, { top, height: Math.min(height, 200), left: 52, right: 8, borderLeftColor: typeColor, backgroundColor: typeColor + '18' }]}
              onPress={() => onEventPress(event)}
            >
              <View style={styles.eventBadge}>
                <View style={[styles.eventBadgeDot, { backgroundColor: typeColor }]} />
                <Text style={[styles.eventBadgeText, { color: typeColor }]}>{EVENT_TYPE_LABELS[event.type]}</Text>
              </View>
              <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>{event.title}</Text>
              <Text style={[styles.eventTime, { color: colors.textTertiary }]}>
                {formatEventTime(event.startDatetime)} – {formatEventTime(event.endDatetime)}
              </Text>
              {event.location && (
                <Text style={[styles.eventLocation, { color: colors.textTertiary }]} numberOfLines={1}>{event.location}</Text>
              )}
              {event.gameScore && (
                <Text style={[styles.gameScore, { color: event.gameScore.startsWith('W') ? '#22C55E' : '#EF4444' }]}>
                  {event.gameScore.replace('-', '–')}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: { position: 'relative', minHeight: 17 * HOUR_HEIGHT },
  hourRow: { height: HOUR_HEIGHT, flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
  timeCol: { width: 48, paddingRight: 8, alignItems: 'flex-end', justifyContent: 'flex-start', paddingTop: -6 },
  timeLabel: { fontSize: 10, fontWeight: '500' },
  contentCol: { flex: 1 },
  nowLine: { position: 'absolute', left: 44, right: 0, flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  nowDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  nowLineBar: { flex: 1, height: 1.5, backgroundColor: '#EF4444' },
  eventCard: { position: 'absolute', borderLeftWidth: 4, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, overflow: 'hidden' },
  eventBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  eventBadgeDot: { width: 6, height: 6, borderRadius: 3 },
  eventBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  eventTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  eventTime: { fontSize: 11 },
  eventLocation: { fontSize: 10, marginTop: 1 },
  gameScore: { fontSize: 12, fontWeight: '700', marginTop: 2 },
});
