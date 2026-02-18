/**
 * Competition Home — K-1 main dashboard.
 * 7 swipeable hub tabs with paged tab bar + edge-hold advance
 * Dashboard | Calendar | Standings | Teams | Raceweek Ops | Rules | Tech & Compliance
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  InteractionManager,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/core';
import { consumeHomeReset, registerHomeResetCallback } from '@/utils/global-home';

import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PagedTabBar } from '@/components/ui/paged-tab-bar';
import { EdgeHoldAdvance } from '@/components/ui/edge-hold-advance';
import CompetitionDashboardV2 from '@/components/community/competition-dashboard-v2';
import { StandingsV2 } from '@/components/community/standings-v2';
import { TeamsV2 } from '@/components/community/teams-v2';
import { RaceweekOpsV2 } from '@/components/community/raceweek-ops-v2';
import { RulesV2 } from '@/components/community/rules-v2';
import { TechComplianceV2 } from '@/components/community/tech-compliance-v2';
import { CEOCalendarV2 } from '@/components/community/ceo-calendar-v2';

const K1_HUB_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'race-calendar', label: 'Calendar' },
  { id: 'standings', label: 'Standings' },
  { id: 'teams', label: 'Teams' },
  { id: 'raceweek', label: 'Race Week' },
  { id: 'rules', label: 'Rules' },
  { id: 'tech-compliance', label: 'Tech & Compliance' },
];

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function HomeTab({ colors }: { colors: typeof Colors.light }) {
  return <CompetitionDashboardV2 colors={colors} />;
}



// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CommunityHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeIndex, setActiveIndex] = useState(0);

  const pagerRef = useRef<PagerView>(null);

  const handleTabPress = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pagerRef.current?.setPage(index);
  }, []);

  // Reset to Dashboard (page 0) when Home tab is pressed
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
    }, [resetToHome])
  );

  return (
    <ThemedView style={styles.container}>
      {/* Hub Tab Bar */}
      <PagedTabBar tabs={K1_HUB_TABS} activeIndex={activeIndex} onTabPress={handleTabPress} />

      {/* Tab Content (PagerView — swipeable) */}
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={K1_HUB_TABS.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          <View key="dashboard" style={{ flex: 1 }}>
            <HomeTab colors={colors} />
          </View>
          <View key="race-calendar" style={{ flex: 1 }}>
            <CEOCalendarV2 colors={colors} />
          </View>
          <View key="standings" style={{ flex: 1 }}>
            <StandingsV2 colors={colors} />
          </View>
          <View key="teams" style={{ flex: 1 }}>
            <TeamsV2 colors={colors} />
          </View>
          <View key="raceweek" style={{ flex: 1 }}>
            <RaceweekOpsV2 colors={colors} />
          </View>
          <View key="rules" style={{ flex: 1 }}>
            <RulesV2 colors={colors} />
          </View>
          <View key="tech-compliance" style={{ flex: 1 }}>
            <TechComplianceV2 colors={colors} />
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
