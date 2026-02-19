/**
 * Competition Home — K-1 4-pill layout
 * Dashboard | Calendar | Grid | Entries
 *
 * Replaces old 7-tab PagerView with SportsHome-style pill navigation.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, Pressable, InteractionManager } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/core';
import { consumeHomeReset, registerHomeResetCallback } from '@/utils/global-home';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMembershipId } from '@/context/app-context';
import {
  getCompetitionRole,
  getCompetitionVisiblePills,
  type CompetitionHomePill,
} from '@/utils/competition-rbac';

import { CompDashboardV2 } from '@/components/competition/comp-dashboard-v2';
import { CompCalendarV2 } from '@/components/competition/comp-calendar-v2';
import { CompGridV2 } from '@/components/competition/comp-grid-v2';
import { CompEntriesV2 } from '@/components/competition/comp-entries-v2';

const ALL_PILLS: { id: CompetitionHomePill; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'grid', label: 'Grid' },
  { id: 'entries', label: 'Entries' },
];

const ACCENT = '#EF4444';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CommunityHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const membershipId = useMembershipId();
  const compRole = useMemo(() => getCompetitionRole(membershipId), [membershipId]);
  const visiblePillIds = useMemo(() => new Set(getCompetitionVisiblePills(compRole)), [compRole]);
  const pills = useMemo(() => ALL_PILLS.filter((p) => visiblePillIds.has(p.id)), [visiblePillIds]);

  const [activePill, setActivePill] = useState<CompetitionHomePill>('dashboard');

  // Reset to Dashboard when Home tab is pressed
  const resetToHome = useCallback(() => {
    setActivePill('dashboard');
  }, []);

  useEffect(() => {
    registerHomeResetCallback(resetToHome);
    return () => registerHomeResetCallback(null);
  }, [resetToHome]);

  useFocusEffect(
    useCallback(() => {
      if (consumeHomeReset()) {
        InteractionManager.runAfterInteractions(() => {
          resetToHome();
        });
      }
    }, [resetToHome]),
  );

  return (
    <ThemedView style={styles.container}>
      {/* Pill Bar */}
      <View style={styles.pillBar}>
        {pills.map((pill) => {
          const isActive = activePill === pill.id;
          return (
            <Pressable
              key={pill.id}
              style={[styles.pill, isActive && { backgroundColor: ACCENT }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActivePill(pill.id);
              }}
            >
              <ThemedText
                style={[styles.pillText, { color: isActive ? '#000' : colors.textSecondary }]}
              >
                {pill.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      {activePill === 'dashboard' && <CompDashboardV2 colors={colors} accent={ACCENT} />}
      {activePill === 'calendar' && <CompCalendarV2 colors={colors} accent={ACCENT} />}
      {activePill === 'grid' && <CompGridV2 colors={colors} accent={ACCENT} />}
      {activePill === 'entries' && <CompEntriesV2 colors={colors} accent={ACCENT} />}
    </ThemedView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
