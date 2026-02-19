/**
 * Competition Calendar V2 — 4 pill tabs: Agenda, Races, Standings, News
 * - Agenda: CalendarHub (Day/Week/Month) with COMP_CALENDAR_EVENTS
 * - Races: Upcoming/Completed from RACE_ROUNDS
 * - Standings: 4-toggle (Driver, Constructor, Crew, Wildcard Cup)
 * - News: Video-first vertical scroll with category pills
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CalendarHub } from '@/components/schedule/calendar-hub';
import { COMP_CALENDAR_EVENTS } from '@/data/mock-competition-home';
import { CompCalendarRacesView } from './comp-calendar-races-view';
import { CompCalendarStandingsView } from './comp-calendar-standings-view';
import { CompCalendarNewsView } from './comp-calendar-news-view';

const PILLS = ['Agenda', 'Races', 'Standings', 'News'] as const;
type PillTab = (typeof PILLS)[number];

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function CompCalendarV2({ colors: propColors, accent }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = propColors ?? Colors[colorScheme];
  const [activeTab, setActiveTab] = useState<PillTab>('Agenda');
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Pill Bar */}
      <View style={styles.pillBar}>
        {PILLS.map((pill) => (
          <Pressable
            key={pill}
            style={[styles.pill, activeTab === pill && { backgroundColor: accent }]}
            onPress={() => setActiveTab(pill)}
          >
            <ThemedText style={[styles.pillText, { color: activeTab === pill ? '#000' : colors.textSecondary }]}>
              {pill}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'Agenda' && <CalendarHub colors={colors} router={router} events={COMP_CALENDAR_EVENTS} />}
      {activeTab === 'Races' && <CompCalendarRacesView colors={colors} accent={accent} />}
      {activeTab === 'Standings' && <CompCalendarStandingsView colors={colors} accent={accent} />}
      {activeTab === 'News' && <CompCalendarNewsView colors={colors} accent={accent} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pillBar: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 2, paddingBottom: 10, gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
  pillText: { fontSize: 13, fontWeight: '600' },
});
