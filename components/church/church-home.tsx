/**
 * Church Home — 2819 Church 4-tab PagerView layout
 * Dashboard | Schedule | Ministries | Connect
 *
 * Dashboard is live. Schedule, Ministries, Connect are Coming Soon.
 * Uses PagerView + PagedTabBar + EdgeHoldAdvance for swipeable tabs.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, InteractionManager } from 'react-native';
import { useFocusEffect } from '@react-navigation/core';
import PagerView from 'react-native-pager-view';
import { PagedTabBar } from '@/components/ui/paged-tab-bar';
import { EdgeHoldAdvance } from '@/components/ui/edge-hold-advance';
import { consumeHomeReset, registerHomeResetCallback } from '@/utils/global-home';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, MODE_ACCENT } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMembershipId } from '@/context/app-context';
import { getChurchRole } from '@/utils/church-rbac';

import { ChurchDashboardV2 } from '@/components/church-home/church-dashboard-v2';

const ALL_TABS: { id: string; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'calendar', label: 'Schedule' },
  { id: 'ministries', label: 'Ministries' },
  { id: 'connect', label: 'Connect' },
];

const ACCENT = MODE_ACCENT.church;

// =============================================================================
// COMING SOON PLACEHOLDER
// =============================================================================

function ComingSoonTab({ label, colors }: { label: string; colors: typeof Colors.light }) {
  return (
    <View style={styles.comingSoon}>
      <IconSymbol name="hammer.fill" size={32} color="#A1A1AA" />
      <ThemedText style={[styles.comingSoonTitle, { color: colors.text }]}>Coming Soon</ThemedText>
      <ThemedText style={[styles.comingSoonDesc, { color: colors.textSecondary }]}>
        {label} will be available in a future update.
      </ThemedText>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ChurchHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const membershipId = useMembershipId();
  const churchRole = getChurchRole(membershipId);
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
            <ChurchDashboardV2 colors={colors} accent={ACCENT} role={churchRole} />
          </View>
          <View key="calendar" style={{ flex: 1 }}>
            <ComingSoonTab label="Schedule" colors={colors} />
          </View>
          <View key="ministries" style={{ flex: 1 }}>
            <ComingSoonTab label="Ministries" colors={colors} />
          </View>
          <View key="connect" style={{ flex: 1 }}>
            <ComingSoonTab label="Connect" colors={colors} />
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
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  comingSoonDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
});
