/**
 * Education Home — FMU 4-pill layout
 * Dashboard | Calendar | Faculty | Admissions
 *
 * Replaces old 10-tab PagerView with SportsHome-style pill navigation.
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
  getEducationRole,
  getEducationVisiblePills,
  type EducationHomePill,
} from '@/utils/education-rbac';

import { EduDashboardV2 } from '@/components/edu-home/edu-dashboard-v2';
import { EduCalendarV2 } from '@/components/edu-home/edu-calendar-v2';
import { EduFacultyV2 } from '@/components/edu-home/edu-faculty-v2';
import { EduAdmissionsV2 } from '@/components/edu-home/edu-admissions-v2';

const ALL_PILLS: { id: EducationHomePill; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'faculty', label: 'Faculty' },
  { id: 'admissions', label: 'Admissions' },
];

const ACCENT = '#10B981';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function EducationHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const membershipId = useMembershipId();
  const eduRole = useMemo(() => getEducationRole(membershipId), [membershipId]);
  const visiblePillIds = useMemo(() => new Set(getEducationVisiblePills(eduRole)), [eduRole]);
  const pills = useMemo(() => ALL_PILLS.filter((p) => visiblePillIds.has(p.id)), [visiblePillIds]);

  const [activePill, setActivePill] = useState<EducationHomePill>('dashboard');

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
      {activePill === 'dashboard' && <EduDashboardV2 colors={colors} accent={ACCENT} />}
      {activePill === 'calendar' && <EduCalendarV2 colors={colors} accent={ACCENT} />}
      {activePill === 'faculty' && <EduFacultyV2 colors={colors} accent={ACCENT} />}
      {activePill === 'admissions' && <EduAdmissionsV2 colors={colors} accent={ACCENT} />}
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
