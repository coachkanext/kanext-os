/**
 * Church Ministries — Schedule View
 * Weekly grid: 7 columns (Mon-Sun), compact slots with ministry abbreviations.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { MINISTRY_SCHEDULE, type ScheduleSlot } from '@/data/mock-church-home';
import { openMinistryCard } from '@/utils/global-entity-sheets';

const DAYS: ScheduleSlot['day'][] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

function abbreviate(name: string): string {
  // Take first letters of significant words, max 3 chars
  const words = name.replace(/[()]/g, '').split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

export function ChurchMinistriesScheduleView({ colors, accent }: Props) {
  // Group schedule slots by day
  const slotsByDay = new Map<string, typeof MINISTRY_SCHEDULE>();
  for (const day of DAYS) {
    slotsByDay.set(day, MINISTRY_SCHEDULE.filter((s) => s.day === day));
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <ThemedText style={[styles.header, { color: accent }]}>WEEKLY SCHEDULE</ThemedText>

      {/* Day Headers */}
      <View style={styles.grid}>
        {DAYS.map((day) => (
          <View key={day} style={styles.dayColumn}>
            <View style={[styles.dayHeader, { borderBottomColor: colors.border }]}>
              <ThemedText style={[styles.dayLabel, { color: colors.textSecondary }]}>
                {day}
              </ThemedText>
            </View>
            {(slotsByDay.get(day) ?? []).map((slot) => (
              <Pressable
                key={slot.id}
                style={styles.slotWrapper}
                onPress={() => openMinistryCard({ name: slot.ministry })}
              >
                <View style={[styles.slotPill, { backgroundColor: slot.color + '22' }]}>
                  <ThemedText style={[styles.slotAbbrev, { color: slot.color }]}>
                    {abbreviate(slot.ministry)}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.slotTime, { color: colors.textTertiary }]}>
                  {slot.time}
                </ThemedText>
                <ThemedText
                  style={[styles.slotLocation, { color: colors.textTertiary }]}
                  numberOfLines={1}
                >
                  {slot.location}
                </ThemedText>
              </Pressable>
            ))}
            {(slotsByDay.get(day) ?? []).length === 0 && (
              <ThemedText style={[styles.emptyDay, { color: colors.textTertiary }]}>--</ThemedText>
            )}
          </View>
        ))}
      </View>

      {/* Legend */}
      <ThemedText style={[styles.legendHeader, { color: accent }]}>LEGEND</ThemedText>
      <View style={styles.legendGrid}>
        {MINISTRY_SCHEDULE.map((slot) => (
          <View key={slot.id} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: slot.color }]} />
            <ThemedText style={[styles.legendAbbrev, { color: colors.text }]}>
              {abbreviate(slot.ministry)}
            </ThemedText>
            <ThemedText style={[styles.legendName, { color: colors.textSecondary }]} numberOfLines={1}>
              {slot.ministry}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 4 },
  header: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  grid: { flexDirection: 'row', gap: 2 },
  dayColumn: { flex: 1, minWidth: 0 },
  dayHeader: {
    paddingBottom: 6,
    marginBottom: 6,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  dayLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  slotWrapper: { alignItems: 'center', marginBottom: 8 },
  slotPill: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
  },
  slotAbbrev: { fontSize: 10, fontWeight: '800' },
  slotTime: { fontSize: 8, marginTop: 2 },
  slotLocation: { fontSize: 7, textAlign: 'center' },
  emptyDay: { fontSize: 10, textAlign: 'center', marginTop: 8 },
  legendHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginTop: 24, marginBottom: 8 },
  legendGrid: { gap: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendAbbrev: { fontSize: 11, fontWeight: '700', width: 32 },
  legendName: { fontSize: 11, flex: 1 },
});
