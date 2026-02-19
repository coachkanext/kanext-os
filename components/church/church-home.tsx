/**
 * Church Home — ICCLA 4-pill layout
 * Dashboard | Calendar | Ministries | Connect
 *
 * Replaces old 10-tab PagerView with SportsHome-style pill navigation.
 * Keeps ViewAsBar for RBAC role switching.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Pressable, StyleSheet, InteractionManager } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/core';
import { consumeHomeReset, registerHomeResetCallback } from '@/utils/global-home';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useChurch } from '@/context/church-context';
import { useMembershipId } from '@/context/app-context';
import {
  getChurchRole,
  getChurchVisiblePills,
  type ChurchRoleLens,
  type ChurchHomePill,
} from '@/utils/church-rbac';

import { ChurchDashboardV2 } from '@/components/church-home/church-dashboard-v2';
import { ChurchCalendarV2 } from '@/components/church-home/church-calendar-v2';
import { ChurchMinistriesV2 } from '@/components/church-home/church-ministries-v2';
import { ChurchConnectV2 } from '@/components/church-home/church-connect-v2';

const ALL_PILLS: { id: ChurchHomePill; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'ministries', label: 'Ministries' },
  { id: 'connect', label: 'Connect' },
];

const ACCENT = '#8B5CF6';

// =============================================================================
// VIEW AS BAR — 4-pill RBAC toggle
// =============================================================================

const VIEW_AS_ROLES: { id: ChurchRoleLens; label: string }[] = [
  { id: 'C1', label: 'Pastor' },
  { id: 'C2', label: 'Elder' },
  { id: 'C3', label: 'Staff' },
  { id: 'C4', label: 'Member' },
];

function ViewAsBar() {
  const { viewAsRole, setViewAsRole } = useChurch();

  return (
    <View style={viewStyles.container}>
      <View style={viewStyles.pillRow}>
        {VIEW_AS_ROLES.map((r) => {
          const isActive = r.id === viewAsRole;
          return (
            <Pressable
              key={r.id}
              style={[
                viewStyles.pill,
                { backgroundColor: isActive ? '#FFFFFF20' : 'transparent' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setViewAsRole(r.id);
              }}
            >
              <ThemedText
                style={[viewStyles.pillText, { color: isActive ? '#FFFFFF' : '#999' }]}
              >
                {r.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const viewStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ChurchHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { viewAsRole } = useChurch();
  const membershipId = useMembershipId();

  // Derive role from ActiveView membership; ViewAsBar can override for debugging
  const derivedRole = useMemo(() => getChurchRole(membershipId), [membershipId]);
  const effectiveRole = viewAsRole ?? derivedRole;

  const visiblePillIds = useMemo(
    () => new Set(getChurchVisiblePills(effectiveRole)),
    [effectiveRole],
  );
  const pills = useMemo(
    () => ALL_PILLS.filter((p) => visiblePillIds.has(p.id)),
    [visiblePillIds],
  );

  const [activePill, setActivePill] = useState<ChurchHomePill>('dashboard');

  // If active pill becomes hidden due to role change, reset to dashboard
  useEffect(() => {
    if (!visiblePillIds.has(activePill)) {
      setActivePill('dashboard');
    }
  }, [visiblePillIds, activePill]);

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
      <ViewAsBar />

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
      {activePill === 'dashboard' && <ChurchDashboardV2 colors={colors} accent={ACCENT} />}
      {activePill === 'calendar' && <ChurchCalendarV2 colors={colors} accent={ACCENT} />}
      {activePill === 'ministries' && <ChurchMinistriesV2 colors={colors} accent={ACCENT} />}
      {activePill === 'connect' && <ChurchConnectV2 colors={colors} accent={ACCENT} />}
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
