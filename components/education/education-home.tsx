/**
 * Education Home — SDCC Control Room
 * 10 swipeable hub tabs with PagedTabBar + EdgeHoldAdvance
 * Dashboard | Calendar | Academics | Campus | People | Admissions |
 * Athletics | Financial | Housing | Policies
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

import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEducation } from '@/context/education-context';
import type { EducationRoleLens } from '@/utils/education-rbac';

// Tab components
import { EduDashboard } from '@/components/education/edu-dashboard';
import { EduCalendar } from '@/components/education/edu-calendar';
import { EduAcademics } from '@/components/education/edu-academics';
import { EduCampus } from '@/components/education/edu-campus';
import { EduPeople } from '@/components/education/edu-people';
import { EduAdmissions } from '@/components/education/edu-admissions';
import { EduAthletics } from '@/components/education/edu-athletics';
import { EduFinancial } from '@/components/education/edu-financial';
import { EduHousing } from '@/components/education/edu-housing';
import { EduPolicies } from '@/components/education/edu-policies';

// =============================================================================
// TAB DEFINITIONS
// =============================================================================

const EDU_HUB_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'academics', label: 'Academics' },
  { id: 'campus', label: 'Campus' },
  { id: 'people', label: 'People' },
  { id: 'admissions', label: 'Admissions' },
  { id: 'athletics', label: 'Athletics' },
  { id: 'financial', label: 'Financial' },
  { id: 'housing', label: 'Housing' },
  { id: 'policies', label: 'Policies' },
];

// =============================================================================
// VIEW AS BAR — 4-pill RBAC toggle
// =============================================================================

const VIEW_AS_ROLES: { id: EducationRoleLens; label: string }[] = [
  { id: 'E1', label: 'President' },
  { id: 'E2', label: 'Dean' },
  { id: 'E3', label: 'Faculty' },
  { id: 'E4', label: 'Student' },
];

function ViewAsBar() {
  const { viewAsRole, setViewAsRole } = useEducation();

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

export function EducationHome() {
  const [activeTab, setActiveTab] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { viewAsRole } = useEducation();

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  const handleSwitchTab = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  return (
    <ThemedView style={s.container}>
      <ViewAsBar />
      <PagedTabBar tabs={EDU_HUB_TABS} activeIndex={activeTab} onTabPress={handleTabPress} />
      <EdgeHoldAdvance
        activeIndex={activeTab}
        tabCount={EDU_HUB_TABS.length}
        onAdvance={handleTabPress}
      >
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
        >
          <View key="dashboard" style={{ flex: 1 }}>
            <EduDashboard colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="calendar" style={{ flex: 1 }}>
            <EduCalendar colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="academics" style={{ flex: 1 }}>
            <EduAcademics colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="campus" style={{ flex: 1 }}>
            <EduCampus colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="people" style={{ flex: 1 }}>
            <EduPeople colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="admissions" style={{ flex: 1 }}>
            <EduAdmissions colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="athletics" style={{ flex: 1 }}>
            <EduAthletics colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="financial" style={{ flex: 1 }}>
            <EduFinancial colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="housing" style={{ flex: 1 }}>
            <EduHousing colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
          </View>
          <View key="policies" style={{ flex: 1 }}>
            <EduPolicies colors={colors} role={viewAsRole} onSwitchTab={handleSwitchTab} />
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
