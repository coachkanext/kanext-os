/**
 * Biz Calendar V2 — 4 sub-pills: Agenda | Events | Milestones | News
 * Orchestrator that renders CalendarHub for Agenda and dedicated sub-views
 * for Events, Milestones, and News.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { CalendarHub } from '@/components/schedule/calendar-hub';
import { BizCalendarEventsView } from '@/components/biz-home/biz-calendar-events-view';
import { BizCalendarMilestonesView } from '@/components/biz-home/biz-calendar-milestones-view';
import { BizCalendarNewsView } from '@/components/biz-home/biz-calendar-news-view';
import { BIZ_CALENDAR_EVENTS } from '@/data/mock-business-home';
import { useRouter } from 'expo-router';

const PILLS = ['Agenda', 'Events', 'Milestones', 'News'] as const;
type PillTab = (typeof PILLS)[number];

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function BizCalendarV2({ colors, accent }: Props) {
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
      {activeTab === 'Agenda' && <CalendarHub colors={colors} router={router} events={BIZ_CALENDAR_EVENTS} />}
      {activeTab === 'Events' && <BizCalendarEventsView colors={colors} accent={accent} />}
      {activeTab === 'Milestones' && <BizCalendarMilestonesView colors={colors} accent={accent} />}
      {activeTab === 'News' && <BizCalendarNewsView colors={colors} accent={accent} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pillBar: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 2, paddingBottom: 10, gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2F3336' },
  pillText: { fontSize: 13, fontWeight: '600' },
});
