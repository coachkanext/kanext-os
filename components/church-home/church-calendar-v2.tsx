/**
 * Church Calendar V2 — 4 sub-pills: Agenda | Services | Impact | News
 * Orchestrator component for the Calendar tab in Church Home.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { CalendarHub } from '@/components/schedule/calendar-hub';
import { CHURCH_CALENDAR_EVENTS } from '@/data/mock-church-home';
import { ChurchCalendarServicesView } from './church-calendar-services-view';
import { ChurchCalendarImpactView } from './church-calendar-impact-view';
import { ChurchCalendarNewsView } from './church-calendar-news-view';

const PILLS = ['Agenda', 'Services', 'Impact', 'News'] as const;
type PillTab = (typeof PILLS)[number];

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function ChurchCalendarV2({ colors, accent }: Props) {
  const [activeTab, setActiveTab] = useState<PillTab>('Agenda');
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Pill Bar */}
      <View style={styles.pillBar}>
        {PILLS.map((pill) => (
          <Pressable
            key={pill}
            style={[
              styles.pill,
              activeTab === pill && { backgroundColor: accent },
            ]}
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
      {activeTab === 'Agenda' && (
        <CalendarHub colors={colors} router={router} events={CHURCH_CALENDAR_EVENTS} />
      )}
      {activeTab === 'Services' && (
        <ChurchCalendarServicesView colors={colors} accent={accent} />
      )}
      {activeTab === 'Impact' && (
        <ChurchCalendarImpactView colors={colors} accent={accent} />
      )}
      {activeTab === 'News' && (
        <ChurchCalendarNewsView colors={colors} accent={accent} />
      )}
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
