/**
 * Church Home — ICCLA 4-tab PagerView layout
 * Dashboard | Calendar | Ministries | Connect
 *
 * Uses PagerView + PagedTabBar + EdgeHoldAdvance for swipeable tabs.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, InteractionManager } from 'react-native';
import { useFocusEffect } from '@react-navigation/core';
import PagerView from 'react-native-pager-view';
import { PagedTabBar } from '@/components/ui/paged-tab-bar';
import { EdgeHoldAdvance } from '@/components/ui/edge-hold-advance';
import { consumeHomeReset, registerHomeResetCallback } from '@/utils/global-home';

import { ThemedView } from '@/components/themed-view';
import { Colors, MODE_ACCENT } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMembershipId } from '@/context/app-context';

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
// MAIN COMPONENT
// =============================================================================

export function ChurchHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
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
