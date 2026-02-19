/**
 * Organization Screen - Institution Overview
 * Universal operational surface - mode-specific truth view.
 * Per spec: Organization reflects "what is" - it never reasons, simulates, or decides.
 * All 5 modes get 4 swipeable PagerView tabs + More overflow.
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, InteractionManager } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useFocusEffect } from '@react-navigation/core';
import * as Haptics from 'expo-haptics';
import { consumeOrgReset, registerOrgResetCallback } from '@/utils/global-org';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext, useMode, useMembershipId } from '@/context/app-context';
import { getSportsRole, type SportsRoleLens } from '@/utils/sports-rbac';
import { getChurchRole, getChurchOrgTabVisibility, type ChurchOrgTab } from '@/utils/church-rbac';
import { getBusinessRole, getBizOrgTabVisibility, type BusinessRoleLens } from '@/utils/business-rbac';
import { getEducationRole, getEduOrgTabVisibility, type EducationRoleLens } from '@/utils/education-rbac';
import { getCompetitionRole, getCompOrgTabVisibility, type CompetitionRoleLens } from '@/utils/competition-rbac';
import { BusinessProvider, useBusiness } from '@/context/business-context';
import { ChurchProvider, useChurch } from '@/context/church-context';
import { EducationProvider, useEducation } from '@/context/education-context';
import { PagedTabBar } from '@/components/ui/paged-tab-bar';
import { EdgeHoldAdvance } from '@/components/ui/edge-hold-advance';
import { TabPlaceholderPage } from '@/components/ui/tab-placeholder-page';
import { OrgSwitcherSheet } from '@/components/organization/org-switcher-sheet';

// Sports v2 org tab components
import { SportsOrgProgramV2 } from '@/components/organization/sports-org-program-v2';
import { SportsOrgPeopleV2 } from '@/components/organization/sports-org-people-v2';
import { SportsOrgRoomsV2 } from '@/components/organization/sports-org-rooms-v2';
import { SportsOrgOperationsV2 } from '@/components/organization/sports-org-operations-v2';
import { SportsOrgFinanceV2 } from '@/components/organization/sports-org-finance-v2';
import { SportsOrgPaymentRailsV2 } from '@/components/organization/sports-org-payment-rails-v2';
import { SportsOrgComplianceV2 } from '@/components/organization/sports-org-compliance-v2';
import { SportsOrgFacilitiesV2 } from '@/components/organization/sports-org-facilities-v2';
import { SportsOrgResourcesV2 } from '@/components/organization/sports-org-resources-v2';
import { SportsOrgSponsorsV2 } from '@/components/organization/sports-org-sponsors-v2';
import type { Mode } from '@/types';

// Competition v2 tab components
import { CompSeriesV2 } from '@/components/organization/comp-series-v2';
import { CompPeopleV2 } from '@/components/organization/comp-people-v2';
import { CompRoomsV2 } from '@/components/organization/comp-rooms-v2';
import { CompOperationsV2 } from '@/components/organization/comp-operations-v2';
import { CompFinanceV2 } from '@/components/organization/comp-finance-v2';
import { CompPaymentRailsV2 } from '@/components/organization/comp-payment-rails-v2';
import { CompComplianceV2 } from '@/components/organization/comp-compliance-v2';
import { CompAssetsV2 } from '@/components/organization/comp-assets-v2';
import { CompReportsV2 } from '@/components/organization/comp-reports-v2';
import { CompSponsorsV2 } from '@/components/organization/comp-sponsors-v2';

// Business v2 tab components + scope bar + switcher
import { EntityScopeBar } from '@/components/business/entity-scope-bar';
import { EntitySwitcherSheet } from '@/components/business/entity-switcher-sheet';
import { BizOrgEntitiesV2 } from '@/components/organization/biz-org-entities-v2';
import { BizOrgPeopleV2 } from '@/components/organization/biz-org-people-v2';
import { BizOrgRoomsV2 } from '@/components/organization/biz-org-rooms-v2';
import { BizOrgOperationsV2 } from '@/components/organization/biz-org-operations-v2';
import { BizOrgFinanceV2 } from '@/components/organization/biz-org-finance-v2';
import { BizOrgPaymentRailsV2 } from '@/components/organization/biz-org-payment-rails-v2';
import { BizOrgLegalV2 } from '@/components/organization/biz-org-legal-v2';
import { BizOrgComplianceV2 } from '@/components/organization/biz-org-compliance-v2';
import { BizOrgAssetsTab } from '@/components/organization/biz-org-assets-v2';
import { BizOrgReportsV2 } from '@/components/organization/biz-org-reports-v2';

// Church v2 org tab components
import { ChurchOrgMinistries } from '@/components/organization/church-org-ministries-v2';
import { ChurchOrgPeople } from '@/components/organization/church-org-people-v2';
import { ChurchOrgRooms } from '@/components/organization/church-org-rooms-v2';
import { ChurchOrgOperations } from '@/components/organization/church-org-operations-v2';
import { ChurchOrgFinance } from '@/components/organization/church-org-finance-v2';
import { ChurchOrgPaymentRails } from '@/components/organization/church-org-payment-rails-v2';
import { ChurchOrgCompliance } from '@/components/organization/church-org-compliance-v2';
import { ChurchOrgFacilitiesV2 } from '@/components/organization/church-org-facilities-v2';
import { ChurchOrgResourcesV2 } from '@/components/organization/church-org-resources-v2';
import { ChurchOrgDonationsV2 } from '@/components/organization/church-org-donations-v2';

// Education v2 org tab components
import { EduOrgInstitutionsV2 } from '@/components/organization/edu-org-institutions-v2';
import { EduOrgPeopleV2 } from '@/components/organization/edu-org-people-v2';
import { EduOrgRoomsV2 } from '@/components/organization/edu-org-rooms-v2';
import { EduOrgOperationsV2 } from '@/components/organization/edu-org-operations-v2';
import { EduOrgFinanceV2 } from '@/components/organization/edu-org-finance-v2';
import { EduOrgPaymentRailsV2 } from '@/components/organization/edu-org-payment-rails-v2';
import { EduOrgComplianceV2 } from '@/components/organization/edu-org-compliance-v2';
import { EduOrgFacilitiesV2 } from '@/components/organization/edu-org-facilities-v2';
import { EduOrgResourcesV2 } from '@/components/organization/edu-org-resources-v2';
import { EduOrgSponsorsV2 } from '@/components/organization/edu-org-sponsors-v2';

// =============================================================================
// ORG TAB & MORE DEFINITIONS (per mode)
// =============================================================================

/** Filter org tabs by RBAC — hides tabs where visibility is 'hidden' for the current role */
function getFilteredOrgTabs(mode: Mode, membershipId: string): { id: string; label: string }[] {
  const allTabs = ORG_TABS[mode];
  switch (mode) {
    case 'church': {
      const role = getChurchRole(membershipId);
      return allTabs.filter((t) => getChurchOrgTabVisibility(t.id as ChurchOrgTab, role) !== 'hidden');
    }
    case 'business': {
      const role = getBusinessRole(membershipId);
      return allTabs.filter((t) => getBizOrgTabVisibility(t.id as any, role) !== 'hidden');
    }
    case 'education': {
      const role = getEducationRole(membershipId);
      return allTabs.filter((t) => getEduOrgTabVisibility(t.id as any, role) !== 'hidden');
    }
    case 'competition': {
      const role = getCompetitionRole(membershipId);
      return allTabs.filter((t) => getCompOrgTabVisibility(t.id as any, role) !== 'hidden');
    }
    default:
      return allTabs; // Sports: no org-tab RBAC matrix yet — show all
  }
}

const ORG_TABS: Record<Mode, { id: string; label: string }[]> = {
  sports: [
    { id: 'program', label: 'Program' },
    { id: 'people', label: 'People' },
    { id: 'rooms', label: 'Rooms' },
    { id: 'operations', label: 'Operations' },
    { id: 'finance', label: 'Finance' },
    { id: 'payment-rails', label: 'Payment Rails' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'resources', label: 'Resources' },
    { id: 'sponsors', label: 'Sponsors' },
  ],
  education: [
    { id: 'institutions', label: 'Institutions' },
    { id: 'people', label: 'People' },
    { id: 'rooms', label: 'Rooms' },
    { id: 'operations', label: 'Operations' },
    { id: 'finance', label: 'Finance' },
    { id: 'payment-rails', label: 'Payment Rails' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'resources', label: 'Resources' },
    { id: 'sponsors', label: 'Sponsors' },
  ],
  competition: [
    { id: 'series', label: 'Series' },
    { id: 'people', label: 'People' },
    { id: 'rooms', label: 'Rooms' },
    { id: 'operations', label: 'Operations' },
    { id: 'finance', label: 'Finance' },
    { id: 'payment-rails', label: 'Payment Rails' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'assets', label: 'Assets' },
    { id: 'reports', label: 'Reports' },
    { id: 'sponsors', label: 'Sponsors' },
  ],
  business: [
    { id: 'entities', label: 'Entities' },
    { id: 'people', label: 'People' },
    { id: 'rooms', label: 'Rooms' },
    { id: 'operations', label: 'Operations' },
    { id: 'finance', label: 'Finance' },
    { id: 'payment-rails', label: 'Payment Rails' },
    { id: 'legal', label: 'Legal' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'assets', label: 'Assets' },
    { id: 'reports', label: 'Reports' },
  ],
  church: [
    { id: 'ministries', label: 'Ministries' },
    { id: 'people', label: 'People' },
    { id: 'rooms', label: 'Rooms' },
    { id: 'operations', label: 'Operations' },
    { id: 'finance', label: 'Finance' },
    { id: 'payment-rails', label: 'Payment Rails' },
    { id: 'compliance', label: 'Compliance/Legal' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'resources', label: 'Resources' },
    { id: 'donations', label: 'Donations/Giving' },
  ],
};


// =============================================================================
// SPORTS MODE CONTENT (with PagerView)
// =============================================================================

function SportsOrganization() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const modeColors = ModeColors.sports;
  const membershipId = useMembershipId();
  const role = useMemo(() => getSportsRole(membershipId), [membershipId]);
  const tabs = useMemo(() => getFilteredOrgTabs('sports', membershipId), [membershipId]);
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  const resetToFirst = useCallback(() => {
    setActiveIndex(0);
    pagerRef.current?.setPage(0);
  }, []);

  useEffect(() => {
    registerOrgResetCallback(resetToFirst);
    return () => registerOrgResetCallback(null);
  }, [resetToFirst]);

  useFocusEffect(
    useCallback(() => {
      if (consumeOrgReset()) {
        InteractionManager.runAfterInteractions(() => { resetToFirst(); });
      }
    }, [resetToFirst])
  );

  return (
    <>
      <PagedTabBar tabs={tabs} activeIndex={activeIndex} onTabPress={handleTabPress} />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={tabs.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1, backgroundColor: colors.background }}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {tabs.map((tab) => {
            const p = { colors, accentColor: modeColors.primary, role };
            switch (tab.id) {
              case 'program': return <View key="program" style={{ flex: 1, backgroundColor: colors.background }}><SportsOrgProgramV2 {...p} /></View>;
              case 'people': return <View key="people" style={{ flex: 1, backgroundColor: colors.background }}><SportsOrgPeopleV2 {...p} /></View>;
              case 'rooms': return <View key="rooms" style={{ flex: 1, backgroundColor: colors.background }}><SportsOrgRoomsV2 {...p} /></View>;
              case 'operations': return <View key="operations" style={{ flex: 1, backgroundColor: colors.background }}><SportsOrgOperationsV2 {...p} /></View>;
              case 'finance': return <View key="finance" style={{ flex: 1, backgroundColor: colors.background }}><SportsOrgFinanceV2 {...p} /></View>;
              case 'payment-rails': return <View key="payment-rails" style={{ flex: 1, backgroundColor: colors.background }}><SportsOrgPaymentRailsV2 {...p} /></View>;
              case 'compliance': return <View key="compliance" style={{ flex: 1, backgroundColor: colors.background }}><SportsOrgComplianceV2 {...p} /></View>;
              case 'facilities': return <View key="facilities" style={{ flex: 1, backgroundColor: colors.background }}><SportsOrgFacilitiesV2 {...p} /></View>;
              case 'resources': return <View key="resources" style={{ flex: 1, backgroundColor: colors.background }}><SportsOrgResourcesV2 {...p} /></View>;
              case 'sponsors': return <View key="sponsors" style={{ flex: 1, backgroundColor: colors.background }}><SportsOrgSponsorsV2 {...p} /></View>;
              default: return <View key={tab.id} style={{ flex: 1, backgroundColor: colors.background }} />;
            }
          })}
        </PagerView>
      </EdgeHoldAdvance>
    </>
  );
}

// =============================================================================
// CHURCH MODE CONTENT (with PagerView)
// =============================================================================

function ChurchOrganization() {
  return (
    <ChurchProvider>
      <ChurchOrganizationInner />
    </ChurchProvider>
  );
}

function ChurchOrganizationInner() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = ModeColors.church.primary;
  const { viewAsRole } = useChurch();
  const membershipId = useMembershipId();
  const derivedRole = useMemo(() => getChurchRole(membershipId), [membershipId]);
  const effectiveRole = viewAsRole ?? derivedRole;
  const tabs = useMemo(() => getFilteredOrgTabs('church', membershipId), [membershipId]);
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  const resetToFirst = useCallback(() => {
    setActiveIndex(0);
    pagerRef.current?.setPage(0);
  }, []);

  useEffect(() => {
    registerOrgResetCallback(resetToFirst);
    return () => registerOrgResetCallback(null);
  }, [resetToFirst]);

  useFocusEffect(
    useCallback(() => {
      if (consumeOrgReset()) {
        InteractionManager.runAfterInteractions(() => { resetToFirst(); });
      }
    }, [resetToFirst])
  );

  return (
    <>
      <PagedTabBar tabs={tabs} activeIndex={activeIndex} onTabPress={handleTabPress} />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={tabs.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1, backgroundColor: colors.background }}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {tabs.map((tab) => {
            const p = { colors, accentColor: accent, role: effectiveRole };
            switch (tab.id) {
              case 'ministries': return <View key="ministries" style={{ flex: 1, backgroundColor: colors.background }}><ChurchOrgMinistries {...p} /></View>;
              case 'people': return <View key="people" style={{ flex: 1, backgroundColor: colors.background }}><ChurchOrgPeople {...p} /></View>;
              case 'rooms': return <View key="rooms" style={{ flex: 1, backgroundColor: colors.background }}><ChurchOrgRooms {...p} /></View>;
              case 'operations': return <View key="operations" style={{ flex: 1, backgroundColor: colors.background }}><ChurchOrgOperations {...p} /></View>;
              case 'finance': return <View key="finance" style={{ flex: 1, backgroundColor: colors.background }}><ChurchOrgFinance {...p} /></View>;
              case 'payment-rails': return <View key="payment-rails" style={{ flex: 1, backgroundColor: colors.background }}><ChurchOrgPaymentRails {...p} /></View>;
              case 'compliance': return <View key="compliance" style={{ flex: 1, backgroundColor: colors.background }}><ChurchOrgCompliance {...p} /></View>;
              case 'facilities': return <View key="facilities" style={{ flex: 1, backgroundColor: colors.background }}><ChurchOrgFacilitiesV2 {...p} /></View>;
              case 'resources': return <View key="resources" style={{ flex: 1, backgroundColor: colors.background }}><ChurchOrgResourcesV2 {...p} /></View>;
              case 'donations': return <View key="donations" style={{ flex: 1, backgroundColor: colors.background }}><ChurchOrgDonationsV2 {...p} /></View>;
              default: return <View key={tab.id} style={{ flex: 1, backgroundColor: colors.background }} />;
            }
          })}
        </PagerView>
      </EdgeHoldAdvance>
    </>
  );
}

// =============================================================================
// EDUCATION MODE CONTENT (with PagerView)
// =============================================================================

function EducationOrganization() {
  return (
    <EducationProvider>
      <EducationOrganizationInner />
    </EducationProvider>
  );
}

function EducationOrganizationInner() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = ModeColors.education.primary;
  const { viewAsRole } = useEducation();
  const membershipId = useMembershipId();
  const derivedRole = useMemo(() => getEducationRole(membershipId), [membershipId]);
  const effectiveRole = viewAsRole ?? derivedRole;
  const tabs = useMemo(() => getFilteredOrgTabs('education', membershipId), [membershipId]);
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  const resetToFirst = useCallback(() => {
    setActiveIndex(0);
    pagerRef.current?.setPage(0);
  }, []);

  useEffect(() => {
    registerOrgResetCallback(resetToFirst);
    return () => registerOrgResetCallback(null);
  }, [resetToFirst]);

  useFocusEffect(
    useCallback(() => {
      if (consumeOrgReset()) {
        InteractionManager.runAfterInteractions(() => { resetToFirst(); });
      }
    }, [resetToFirst])
  );

  return (
    <>
      <PagedTabBar tabs={tabs} activeIndex={activeIndex} onTabPress={handleTabPress} />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={tabs.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1, backgroundColor: colors.background }}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {tabs.map((tab) => {
            const p = { colors, accentColor: accent, role: effectiveRole };
            switch (tab.id) {
              case 'institutions': return <View key="institutions" style={{ flex: 1, backgroundColor: colors.background }}><EduOrgInstitutionsV2 {...p} /></View>;
              case 'people': return <View key="people" style={{ flex: 1, backgroundColor: colors.background }}><EduOrgPeopleV2 {...p} /></View>;
              case 'rooms': return <View key="rooms" style={{ flex: 1, backgroundColor: colors.background }}><EduOrgRoomsV2 {...p} /></View>;
              case 'operations': return <View key="operations" style={{ flex: 1, backgroundColor: colors.background }}><EduOrgOperationsV2 {...p} /></View>;
              case 'finance': return <View key="finance" style={{ flex: 1, backgroundColor: colors.background }}><EduOrgFinanceV2 {...p} /></View>;
              case 'payment-rails': return <View key="payment-rails" style={{ flex: 1, backgroundColor: colors.background }}><EduOrgPaymentRailsV2 {...p} /></View>;
              case 'compliance': return <View key="compliance" style={{ flex: 1, backgroundColor: colors.background }}><EduOrgComplianceV2 {...p} /></View>;
              case 'facilities': return <View key="facilities" style={{ flex: 1, backgroundColor: colors.background }}><EduOrgFacilitiesV2 {...p} /></View>;
              case 'resources': return <View key="resources" style={{ flex: 1, backgroundColor: colors.background }}><EduOrgResourcesV2 {...p} /></View>;
              case 'sponsors': return <View key="sponsors" style={{ flex: 1, backgroundColor: colors.background }}><EduOrgSponsorsV2 {...p} /></View>;
              default: return <View key={tab.id} style={{ flex: 1, backgroundColor: colors.background }} />;
            }
          })}
        </PagerView>
      </EdgeHoldAdvance>
    </>
  );
}

// =============================================================================
// COMMUNITY MODE CONTENT (with PagerView)
// =============================================================================

function CommunityOrganization() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = ModeColors.competition.primary;
  const membershipId = useMembershipId();
  const tabs = useMemo(() => getFilteredOrgTabs('competition', membershipId), [membershipId]);
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  const resetToFirst = useCallback(() => {
    setActiveIndex(0);
    pagerRef.current?.setPage(0);
  }, []);

  useEffect(() => {
    registerOrgResetCallback(resetToFirst);
    return () => registerOrgResetCallback(null);
  }, [resetToFirst]);

  useFocusEffect(
    useCallback(() => {
      if (consumeOrgReset()) {
        InteractionManager.runAfterInteractions(() => { resetToFirst(); });
      }
    }, [resetToFirst])
  );

  return (
    <>
      <PagedTabBar tabs={tabs} activeIndex={activeIndex} onTabPress={handleTabPress} />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={tabs.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1, backgroundColor: colors.background }}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {tabs.map((tab) => {
            const p = { colors, accentColor: accent };
            switch (tab.id) {
              case 'series': return <View key="series" style={{ flex: 1, backgroundColor: colors.background }}><CompSeriesV2 {...p} /></View>;
              case 'people': return <View key="people" style={{ flex: 1, backgroundColor: colors.background }}><CompPeopleV2 {...p} /></View>;
              case 'rooms': return <View key="rooms" style={{ flex: 1, backgroundColor: colors.background }}><CompRoomsV2 {...p} /></View>;
              case 'operations': return <View key="operations" style={{ flex: 1, backgroundColor: colors.background }}><CompOperationsV2 {...p} /></View>;
              case 'finance': return <View key="finance" style={{ flex: 1, backgroundColor: colors.background }}><CompFinanceV2 {...p} /></View>;
              case 'payment-rails': return <View key="payment-rails" style={{ flex: 1, backgroundColor: colors.background }}><CompPaymentRailsV2 {...p} /></View>;
              case 'compliance': return <View key="compliance" style={{ flex: 1, backgroundColor: colors.background }}><CompComplianceV2 {...p} /></View>;
              case 'assets': return <View key="assets" style={{ flex: 1, backgroundColor: colors.background }}><CompAssetsV2 {...p} /></View>;
              case 'reports': return <View key="reports" style={{ flex: 1, backgroundColor: colors.background }}><CompReportsV2 {...p} /></View>;
              case 'sponsors': return <View key="sponsors" style={{ flex: 1, backgroundColor: colors.background }}><CompSponsorsV2 {...p} /></View>;
              default: return <View key={tab.id} style={{ flex: 1, backgroundColor: colors.background }} />;
            }
          })}
        </PagerView>
      </EdgeHoldAdvance>
    </>
  );
}

// =============================================================================
// BUSINESS MODE CONTENT (v2 — dedicated components)
// =============================================================================

function BusinessOrganization() {
  return (
    <BusinessProvider>
      <BusinessOrganizationInner />
    </BusinessProvider>
  );
}

function BusinessOrganizationInner() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = ModeColors.business.primary;
  const { viewAsRole, selectedEntity, selectedEntityId } = useBusiness();
  const membershipId = useMembershipId();
  const derivedRole = useMemo(() => getBusinessRole(membershipId), [membershipId]);
  const effectiveRole = viewAsRole ?? derivedRole;
  const tabs = useMemo(() => getFilteredOrgTabs('business', membershipId), [membershipId]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [entitySwitcherVisible, setEntitySwitcherVisible] = useState(false);
  const pagerRef = useRef<PagerView>(null);

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  const resetToFirst = useCallback(() => {
    setActiveIndex(0);
    pagerRef.current?.setPage(0);
  }, []);

  useEffect(() => {
    registerOrgResetCallback(resetToFirst);
    return () => registerOrgResetCallback(null);
  }, [resetToFirst]);

  useFocusEffect(
    useCallback(() => {
      if (consumeOrgReset()) {
        InteractionManager.runAfterInteractions(() => { resetToFirst(); });
      }
    }, [resetToFirst])
  );

  return (
    <>
      <PagedTabBar tabs={tabs} activeIndex={activeIndex} onTabPress={handleTabPress} />
      <EntityScopeBar
        entityId={selectedEntityId}
        entityName={selectedEntity.name}
        entityType={selectedEntity.type}
        status="active"
        onSwitch={() => setEntitySwitcherVisible(true)}
        colors={colors}
      />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={tabs.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1, backgroundColor: colors.background }}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {tabs.map((tab) => {
            const p = { colors, accentColor: accent, role: effectiveRole };
            switch (tab.id) {
              case 'entities': return <View key="entities" style={{ flex: 1, backgroundColor: colors.background }}><BizOrgEntitiesV2 {...p} /></View>;
              case 'people': return <View key="people" style={{ flex: 1, backgroundColor: colors.background }}><BizOrgPeopleV2 {...p} /></View>;
              case 'rooms': return <View key="rooms" style={{ flex: 1, backgroundColor: colors.background }}><BizOrgRoomsV2 {...p} /></View>;
              case 'operations': return <View key="operations" style={{ flex: 1, backgroundColor: colors.background }}><BizOrgOperationsV2 {...p} /></View>;
              case 'finance': return <View key="finance" style={{ flex: 1, backgroundColor: colors.background }}><BizOrgFinanceV2 {...p} /></View>;
              case 'payment-rails': return <View key="payment-rails" style={{ flex: 1, backgroundColor: colors.background }}><BizOrgPaymentRailsV2 {...p} /></View>;
              case 'legal': return <View key="legal" style={{ flex: 1, backgroundColor: colors.background }}><BizOrgLegalV2 {...p} /></View>;
              case 'compliance': return <View key="compliance" style={{ flex: 1, backgroundColor: colors.background }}><BizOrgComplianceV2 {...p} /></View>;
              case 'assets': return <View key="assets" style={{ flex: 1, backgroundColor: colors.background }}><BizOrgAssetsTab {...p} /></View>;
              case 'reports': return <View key="reports" style={{ flex: 1, backgroundColor: colors.background }}><BizOrgReportsV2 {...p} /></View>;
              default: return <View key={tab.id} style={{ flex: 1, backgroundColor: colors.background }} />;
            }
          })}
        </PagerView>
      </EdgeHoldAdvance>
      <EntitySwitcherSheet
        visible={entitySwitcherVisible}
        onClose={() => setEntitySwitcherVisible(false)}
      />
    </>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function OrganizationScreen() {
  const { state, setOrganization } = useAppContext();
  const mode = useMode();
  const [switcherVisible, setSwitcherVisible] = useState(false);

  const renderModeContent = () => {
    switch (mode) {
      case 'sports':
        return <SportsOrganization />;
      case 'church':
        return <ChurchOrganization />;
      case 'education':
        return <EducationOrganization />;
      case 'competition':
        return <CommunityOrganization />;
      case 'business':
        return <BusinessOrganization />;
      default:
        return null;
    }
  };

  // All modes now use PagerView — no ScrollView wrapper needed
  return (
    <ThemedView style={styles.container}>
      {/* Mode Content (each mode owns its PagerView + PagedTabBar) */}
      {renderModeContent()}

      {/* Org Switcher Sheet */}
      <OrgSwitcherSheet
        visible={switcherVisible}
        onClose={() => setSwitcherVisible(false)}
        mode={mode}
        currentOrgId={state.organization?.id ?? ''}
        onSelectOrg={(org) => {
          setOrganization({
            id: org.id,
            name: org.name,
            mode,
            type: '',
            location: org.subtitle,
          });
        }}
      />
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
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Institution Header
  institutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  institutionBadge: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  institutionBadgeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  institutionInfo: {
    flex: 1,
  },
  institutionName: {
    fontSize: 18,
    fontWeight: '600',
  },
  institutionDetails: {
    fontSize: 14,
    marginTop: 2,
  },
  institutionLocation: {
    fontSize: 13,
    marginTop: 2,
  },

  // Snapshot Card
  snapshotCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  snapshotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  snapshotItem: {
    flex: 1,
    alignItems: 'center',
  },
  snapshotValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  snapshotLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  snapshotDivider: {
    width: 1,
    height: 32,
  },

  // Section Header
  sectionHeader: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Programs
  programsGrid: {
    gap: Spacing.sm,
  },
  programCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  programCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  programName: {
    fontSize: 17,
    fontWeight: '600',
  },
  programSport: {
    fontSize: 14,
    marginTop: 2,
  },
  programStats: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: Spacing.lg,
  },
  programStat: {
    alignItems: 'flex-start',
  },
  programStatValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  programStatLabel: {
    fontSize: 11,
    marginTop: 1,
  },

  // Recruiting
  recruitingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  recruitingIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  recruitingInfo: {
    flex: 1,
  },
  recruitingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  recruitingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  // Support Grid
  supportGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  supportCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  supportIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  supportSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // Leadership
  leadershipCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  leadershipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  leadershipAvatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  leadershipInfo: {
    flex: 1,
  },
  leadershipName: {
    fontSize: 15,
    fontWeight: '500',
  },
  leadershipTitle: {
    fontSize: 13,
    marginTop: 1,
  },
  leadershipDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md + 40 + Spacing.sm,
  },

  // About
  aboutCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
  },
  aboutDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.md,
  },
  aboutMeta: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  aboutMetaItem: {},
  aboutMetaLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  aboutMetaValue: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },

  // Business Metrics
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  metricSubValue: {
    fontSize: 12,
    marginTop: 2,
  },
  metricLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: Spacing.xs,
  },
  quickLinksGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickLinkCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  quickLinkTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  quickLinkSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },

  // Church - Campuses
  campusesList: {
    gap: Spacing.sm,
  },
  campusCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  campusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  campusBadge: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  campusBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  campusInfo: {
    flex: 1,
  },
  campusName: {
    fontSize: 16,
    fontWeight: '600',
  },
  campusLocation: {
    fontSize: 13,
    marginTop: 2,
  },
  campusServices: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  campusServiceText: {
    fontSize: 12,
    marginBottom: 2,
  },

  // Church - Ministries
  ministriesCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  ministryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  ministryIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  ministryInfo: {
    flex: 1,
  },
  ministryName: {
    fontSize: 15,
    fontWeight: '500',
  },
  ministryDesc: {
    fontSize: 12,
    marginTop: 1,
  },
  ministryDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md + 32 + Spacing.sm,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Education - Terms
  termCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  termHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  termName: {
    fontSize: 17,
    fontWeight: '600',
  },
  termDates: {
    fontSize: 14,
  },
  termFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  currentBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },

  // Education - Calendar
  calendarCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  calendarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  calendarDate: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  calendarMonth: {
    fontSize: 10,
    fontWeight: '600',
  },
  calendarDay: {
    fontSize: 18,
    fontWeight: '700',
  },
  calendarInfo: {
    flex: 1,
  },
  calendarTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  calendarType: {
    fontSize: 12,
    marginTop: 2,
  },
  calendarDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md + 48 + Spacing.sm,
  },

  // Education - Departments
  departmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  departmentCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  departmentName: {
    fontSize: 14,
    fontWeight: '600',
  },
  departmentPrograms: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
