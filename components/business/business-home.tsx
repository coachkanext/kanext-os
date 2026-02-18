/**
 * Business Home — KaNeXT Founder OS Control Room
 * 9 swipeable hub tabs with PagedTabBar + EdgeHoldAdvance
 * Dashboard | Calendar | Operations | Finance | Payment Rails |
 * Board/Investors | Compliance/Legal | Media/Proof | Data Room
 *
 * Thin orchestrator — each tab lives in its own file.
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';
import * as Haptics from 'expo-haptics';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { PagedTabBar } from '@/components/ui/paged-tab-bar';
import { EdgeHoldAdvance } from '@/components/ui/edge-hold-advance';

import { Colors, Spacing, BorderRadius, BusinessPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBusiness } from '@/context/business-context';
import type { BusinessRoleLens } from '@/utils/business-rbac';

// Tab components
import { BusinessDashboardV2 } from '@/components/business/business-dashboard-v2';
import { BusinessCalendarV2 } from '@/components/business/business-calendar-v2';
import { BusinessOperations } from '@/components/business/business-operations';
import { BusinessFinance } from '@/components/business/business-finance';
import { BusinessPaymentRails } from '@/components/business/business-payment-rails';
import { BusinessBoardInvestors } from '@/components/business/business-board-investors';
import { BusinessComplianceLegal } from '@/components/business/business-compliance-legal';
import { BusinessMediaProof } from '@/components/business/business-media-proof';
import { BusinessDataRoom } from '@/components/business/business-data-room';

const BP = BusinessPalette;

// =============================================================================
// TAB DEFINITIONS
// =============================================================================

const BIZ_HUB_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'operations', label: 'Operations' },
  { id: 'finance', label: 'Finance' },
  { id: 'payment_rails', label: 'Payment Rails' },
  { id: 'board_investors', label: 'Board & Investors' },
  { id: 'compliance_legal', label: 'Compliance & Legal' },
  { id: 'media_proof', label: 'Media & Proof' },
  { id: 'data_room', label: 'Data Room' },
];

// =============================================================================
// VIEW AS BAR — 4-pill RBAC toggle
// =============================================================================

const VIEW_AS_ROLES: { id: BusinessRoleLens; label: string }[] = [
  { id: 'B1', label: 'Founder' },
  { id: 'B2b', label: 'Board' },
  { id: 'B2a', label: 'Retail' },
  { id: 'B3', label: 'Public' },
];

function ViewAsBar() {
  const { viewAsRole, setViewAsRole } = useBusiness();

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
                { backgroundColor: isActive ? BP.champagneGold + '20' : 'transparent' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setViewAsRole(r.id);
              }}
            >
              <ThemedText
                style={[viewStyles.pillText, { color: isActive ? BP.champagneGold : BP.ash }]}
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
    borderColor: BP.graphite,
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

export function BusinessHome() {
  const [activeTab, setActiveTab] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { viewAsRole } = useBusiness();

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  const handleSwitchTab = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  return (
    <ThemedView style={s.container}>
      <ViewAsBar />
      <PagedTabBar tabs={BIZ_HUB_TABS} activeIndex={activeTab} onTabPress={handleTabPress} />
      <EdgeHoldAdvance
        activeIndex={activeTab}
        tabCount={BIZ_HUB_TABS.length}
        onAdvance={handleTabPress}
      >
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
        >
          <View key="dashboard" style={{ flex: 1 }}>
            <BusinessDashboardV2 colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="calendar" style={{ flex: 1 }}>
            <BusinessCalendarV2 colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="operations" style={{ flex: 1 }}>
            <BusinessOperations colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="finance" style={{ flex: 1 }}>
            <BusinessFinance colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="payment_rails" style={{ flex: 1 }}>
            <BusinessPaymentRails colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="board_investors" style={{ flex: 1 }}>
            <BusinessBoardInvestors colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="compliance_legal" style={{ flex: 1 }}>
            <BusinessComplianceLegal colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="media_proof" style={{ flex: 1 }}>
            <BusinessMediaProof colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="data_room" style={{ flex: 1 }}>
            <BusinessDataRoom colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
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
    backgroundColor: BP.obsidian,
  },
});
