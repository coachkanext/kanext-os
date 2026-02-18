/**
 * Church Home — ICCLA Control Room
 * 10 swipeable hub tabs with PagedTabBar + EdgeHoldAdvance
 * Dashboard | Calendar | Worship | Community | Serve | Give |
 * Events | Prayer | Messages | Discipleship
 *
 * Thin orchestrator — each tab lives in its own file.
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { PagedTabBar } from '@/components/ui/paged-tab-bar';
import { EdgeHoldAdvance } from '@/components/ui/edge-hold-advance';

import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useChurch } from '@/context/church-context';
import type { ChurchRoleLens } from '@/utils/church-rbac';

// Tab components
import { ChurchDashboard } from '@/components/church/church-dashboard';
import { ChurchCalendar } from '@/components/church/church-calendar';
import { ChurchWorship } from '@/components/church/church-worship';
import { ChurchCommunity } from '@/components/church/church-community';
import { ChurchServe } from '@/components/church/church-serve';
import { ChurchGive } from '@/components/church/church-give';
import { ChurchEvents } from '@/components/church/church-events';
import { ChurchPrayer } from '@/components/church/church-prayer';
import { ChurchMessages } from '@/components/church/church-messages';
import { ChurchDiscipleship } from '@/components/church/church-discipleship';

// =============================================================================
// TAB DEFINITIONS
// =============================================================================

const CHURCH_HUB_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'worship', label: 'Worship' },
  { id: 'community', label: 'Community' },
  { id: 'serve', label: 'Serve' },
  { id: 'give', label: 'Give' },
  { id: 'events', label: 'Events' },
  { id: 'prayer', label: 'Prayer' },
  { id: 'messages', label: 'Messages' },
  { id: 'discipleship', label: 'Discipleship' },
];

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
  const [activeTab, setActiveTab] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { viewAsRole } = useChurch();

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  const handleSwitchTab = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  return (
    <ThemedView style={s.container}>
      <ViewAsBar />
      <PagedTabBar tabs={CHURCH_HUB_TABS} activeIndex={activeTab} onTabPress={handleTabPress} />
      <EdgeHoldAdvance
        activeIndex={activeTab}
        tabCount={CHURCH_HUB_TABS.length}
        onAdvance={handleTabPress}
      >
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
        >
          <View key="dashboard" style={{ flex: 1 }}>
            <ChurchDashboard colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="calendar" style={{ flex: 1 }}>
            <ChurchCalendar colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="worship" style={{ flex: 1 }}>
            <ChurchWorship colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="community" style={{ flex: 1 }}>
            <ChurchCommunity colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="serve" style={{ flex: 1 }}>
            <ChurchServe colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="give" style={{ flex: 1 }}>
            <ChurchGive colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="events" style={{ flex: 1 }}>
            <ChurchEvents colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="prayer" style={{ flex: 1 }}>
            <ChurchPrayer colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="messages" style={{ flex: 1 }}>
            <ChurchMessages colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="discipleship" style={{ flex: 1 }}>
            <ChurchDiscipleship colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
        </PagerView>
      </EdgeHoldAdvance>
    </ThemedView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
});
