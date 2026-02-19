/**
 * Church Home — ICCLA 4-tab PagerView layout
 * Dashboard | Calendar | Ministries | Connect
 *
 * Uses PagerView + PagedTabBar + EdgeHoldAdvance for swipeable tabs.
 * Keeps ViewAsBar for RBAC role switching.
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Pressable, StyleSheet, InteractionManager } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/core';
import PagerView from 'react-native-pager-view';
import { PagedTabBar } from '@/components/ui/paged-tab-bar';
import { EdgeHoldAdvance } from '@/components/ui/edge-hold-advance';
import { consumeHomeReset, registerHomeResetCallback } from '@/utils/global-home';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';
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

const ALL_TABS: { id: string; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'ministries', label: 'Ministries' },
  { id: 'connect', label: 'Connect' },
];

const ACCENT = MODE_ACCENT.church;

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
  const pagerRef = useRef<PagerView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  // Reset to Dashboard when Home tab is pressed
  const resetToHome = useCallback(() => {
    setActiveIndex(0);
    pagerRef.current?.setPage(0);
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

      <PagedTabBar
        tabs={ALL_TABS}
        activeIndex={activeIndex}
        onTabPress={handleTabPress}
        accentColor={ACCENT}
      />

      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={ALL_TABS.length} onAdvance={handleTabPress} wrap>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          <View key="dashboard" style={{ flex: 1 }}>
            <ChurchDashboardV2 colors={colors} accent={ACCENT} />
          </View>
          <View key="calendar" style={{ flex: 1 }}>
            <ChurchCalendarV2 colors={colors} accent={ACCENT} />
          </View>
          <View key="ministries" style={{ flex: 1 }}>
            <ChurchMinistriesV2 colors={colors} accent={ACCENT} />
          </View>
          <View key="connect" style={{ flex: 1 }}>
            <ChurchConnectV2 colors={colors} accent={ACCENT} />
          </View>
        </PagerView>
      </EdgeHoldAdvance>
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
});
