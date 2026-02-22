/**
 * Sports Calendar V2 — 4 pill tabs: Agenda, Games, Standings, News
 * - Agenda: CalendarHub (Day/Week/Month) with existing ~140 mock events
 * - Games: Upcoming/Completed from KaNeXT_GAMES
 * - Standings: 3-tier (Conference, NAIA Top 25, KaNeXT National)
 * - News: Video-first vertical scroll with category tags
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CalendarHub } from '@/components/schedule/calendar-hub';
import { CalendarGamesView } from '@/components/calendar/calendar-games-view';
import { CalendarStandingsView } from '@/components/calendar/calendar-standings-view';
import { CalendarNewsView } from '@/components/calendar/calendar-news-view';

const PILLS = ['Agenda', 'Games', 'Standings', 'News'] as const;
type PillTab = (typeof PILLS)[number];

interface Props {
  colors: typeof Colors.light;
}

export function SportsCalendarV2({ colors: propColors }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = propColors ?? Colors[colorScheme];
  const accent = useAccentColor();
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
      {activeTab === 'Agenda' && <CalendarHub colors={colors} router={router} />}
      {activeTab === 'Games' && <CalendarGamesView colors={colors} accent={accent} />}
      {activeTab === 'Standings' && <CalendarStandingsView colors={colors} accent={accent} />}
      {activeTab === 'News' && <CalendarNewsView colors={colors} accent={accent} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pillBar: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 2, paddingBottom: 10, gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2F3336' },
  pillText: { fontSize: 13, fontWeight: '600' },
});
