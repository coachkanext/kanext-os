/**
 * Business Home — KaNeXT 4-pill layout
 * Dashboard | Calendar | Vault | Deals
 *
 * Replaces old 9-tab PagerView with SportsHome-style pill navigation.
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
  getBusinessRole,
  getBusinessVisiblePills,
  type BusinessHomePill,
} from '@/utils/business-rbac';

import { BizDashboardV2 } from '@/components/biz-home/biz-dashboard-v2';
import { BizCalendarV2 } from '@/components/biz-home/biz-calendar-v2';
import { BizVaultV2 } from '@/components/biz-home/biz-vault-v2';
import { BizDealsV2 } from '@/components/biz-home/biz-deals-v2';

const ALL_PILLS: { id: BusinessHomePill; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'vault', label: 'Vault' },
  { id: 'deals', label: 'Deals' },
];

const ACCENT = '#F59E0B';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BusinessHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const membershipId = useMembershipId();
  const bizRole = useMemo(() => getBusinessRole(membershipId), [membershipId]);
  const visiblePillIds = useMemo(() => new Set(getBusinessVisiblePills(bizRole)), [bizRole]);
  const pills = useMemo(() => ALL_PILLS.filter((p) => visiblePillIds.has(p.id)), [visiblePillIds]);

  const [activePill, setActivePill] = useState<BusinessHomePill>('dashboard');

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
      {activePill === 'dashboard' && <BizDashboardV2 colors={colors} accent={ACCENT} />}
      {activePill === 'calendar' && <BizCalendarV2 colors={colors} accent={ACCENT} />}
      {activePill === 'vault' && <BizVaultV2 colors={colors} accent={ACCENT} />}
      {activePill === 'deals' && <BizDealsV2 colors={colors} accent={ACCENT} />}
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
