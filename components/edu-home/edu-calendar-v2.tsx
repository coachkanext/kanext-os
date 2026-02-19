/**
 * Education Calendar V2 — 4 sub-pills: Agenda | Events | Metrics | News
 * Orchestrator that delegates to CalendarHub and edu-specific sub-views.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { CalendarHub } from '@/components/schedule/calendar-hub';
import { EduCalendarEventsView } from '@/components/edu-home/edu-calendar-events-view';
import { EduCalendarMetricsView } from '@/components/edu-home/edu-calendar-metrics-view';
import { EduCalendarNewsView } from '@/components/edu-home/edu-calendar-news-view';
import { EDU_CALENDAR_EVENTS } from '@/data/mock-education-home';

const PILLS = ['Agenda', 'Events', 'Metrics', 'News'] as const;
type PillTab = (typeof PILLS)[number];

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function EduCalendarV2({ colors, accent }: Props) {
  const [activeTab, setActiveTab] = useState<PillTab>('Agenda');

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
            <ThemedText
              style={[
                styles.pillText,
                { color: activeTab === pill ? '#000' : colors.textSecondary },
              ]}
            >
              {pill}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'Agenda' && <CalendarHub colors={colors} router={null} events={EDU_CALENDAR_EVENTS} />}
      {activeTab === 'Events' && <EduCalendarEventsView colors={colors} accent={accent} />}
      {activeTab === 'Metrics' && <EduCalendarMetricsView colors={colors} accent={accent} />}
      {activeTab === 'News' && <EduCalendarNewsView colors={colors} accent={accent} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pillBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 10,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  pillText: { fontSize: 13, fontWeight: '600' },
});
