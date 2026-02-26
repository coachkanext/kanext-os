/**
 * Church Schedule — 3-pill wrapper
 *
 * Sub-pills: Agenda (default) | Services | Ministry
 * Each pill renders a full-height child view.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ImpactFeedbackStyle } from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { ChurchScheduleAgenda } from '@/components/church/church-schedule-agenda';
import { ChurchScheduleServices } from '@/components/church/church-schedule-services';
import { ChurchScheduleMinistry } from '@/components/church/church-schedule-ministry';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

type SchedulePill = 'agenda' | 'services' | 'ministry';

const PILLS: { id: SchedulePill; label: string }[] = [
  { id: 'agenda', label: 'Agenda' },
  { id: 'services', label: 'Services' },
  { id: 'ministry', label: 'Ministry' },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function ChurchSchedule({ colors, accent }: Props) {
  const [activePill, setActivePill] = useState<SchedulePill>('agenda');

  const handlePillPress = useCallback((pill: SchedulePill) => {
    Haptics.impactAsync(ImpactFeedbackStyle.Light);
    setActivePill(pill);
  }, []);

  return (
    <ThemedView style={s.container}>
      {/* ── Sub-pill bar ── */}
      <View style={s.pillBar}>
        {PILLS.map((pill) => {
          const isActive = activePill === pill.id;
          return (
            <Pressable
              key={pill.id}
              style={[s.pill, isActive && { backgroundColor: accent }]}
              onPress={() => handlePillPress(pill.id)}
            >
              <ThemedText
                style={[s.pillText, { color: isActive ? '#000' : colors.textSecondary }]}
              >
                {pill.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* ── Active view ── */}
      {activePill === 'agenda' && <ChurchScheduleAgenda colors={colors} accent={accent} />}
      {activePill === 'services' && <ChurchScheduleServices colors={colors} accent={accent} />}
      {activePill === 'ministry' && <ChurchScheduleMinistry colors={colors} accent={accent} />}
    </ThemedView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },

  // Pill bar — matches SportsCalendarV2 pill style
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
    backgroundColor: '#2F3336',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
