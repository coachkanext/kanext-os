/**
 * Competition Home — KaNeXT 4-tab PagerView layout
 * Dashboard | Calendar | Grid | Entries
 *
 * Uses PagerView + PagedTabBar + EdgeHoldAdvance for swipeable tabs.
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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
import {
  getCompetitionRole,
  getCompetitionVisiblePills,
  type CompetitionHomePill,
} from '@/utils/competition-rbac';

import { CompDashboardV2 } from '@/components/competition/comp-dashboard-v2';
import { CompCalendarV2 } from '@/components/competition/comp-calendar-v2';
import { CompGridV2 } from '@/components/competition/comp-grid-v2';
import { CompEntriesV2 } from '@/components/competition/comp-entries-v2';

const ALL_TABS: { id: string; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'grid', label: 'Grid' },
  { id: 'entries', label: 'Entries' },
];

const ACCENT = MODE_ACCENT.competition;

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CommunityHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const membershipId = useMembershipId();
  const compRole = getCompetitionRole(membershipId);
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
            <CompDashboardV2 colors={colors} accent={ACCENT} role={compRole} />
          </View>
          <View key="calendar" style={{ flex: 1 }}>
            <CompCalendarV2 colors={colors} accent={ACCENT} />
          </View>
          <View key="grid" style={{ flex: 1 }}>
            <CompGridV2 colors={colors} accent={ACCENT} />
          </View>
          <View key="entries" style={{ flex: 1 }}>
            <CompEntriesV2 colors={colors} accent={ACCENT} />
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
