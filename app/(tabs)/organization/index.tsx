/**
 * Organization Screen — 6 tabs × 3 views per mode (V3)
 * Universal tabs: Program | People | Finance | Compliance | Facilities | Ledger
 * View labels change per mode. Content adapts. RBAC controls visibility.
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, InteractionManager } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useFocusEffect } from '@react-navigation/core';
import { consumeOrgReset, registerOrgResetCallback } from '@/utils/global-org';

import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext, useMode, useMembershipId } from '@/context/app-context';
import { getSportsRole } from '@/utils/sports-rbac';
import { getChurchRole } from '@/utils/church-rbac';
import { getBusinessRole } from '@/utils/business-rbac';
import { getEducationRole } from '@/utils/education-rbac';
import { getCompetitionRole } from '@/utils/competition-rbac';
import { BusinessProvider, useBusiness } from '@/context/business-context';
import { ChurchProvider, useChurch } from '@/context/church-context';
import { EducationProvider, useEducation } from '@/context/education-context';
import { PagedTabBar } from '@/components/ui/paged-tab-bar';
import { EdgeHoldAdvance } from '@/components/ui/edge-hold-advance';
import { OrgSwitcherSheet } from '@/components/organization/org-switcher-sheet';
import { EntityScopeBar } from '@/components/business/entity-scope-bar';
import { EntitySwitcherSheet } from '@/components/business/entity-switcher-sheet';
import type { Mode } from '@/types';
import { ThemedText } from '@/components/themed-text';
import { EmptyModeShell, type ShellTab } from '@/components/ui/empty-mode-shell';

// =============================================================================
// EMPTY MODE SHELL TAB CONFIG (Organization)
// =============================================================================

const ORG_TABS_EMPTY: ShellTab[] = [
  { id: 'program', label: 'Program', icon: 'building.2', emptyTitle: 'No Program Data', emptyDescription: 'Program details will appear here.' },
  { id: 'people', label: 'People', icon: 'person.2.fill', emptyTitle: 'No People', emptyDescription: 'Add team members and staff.' },
  { id: 'finance', label: 'Finance', icon: 'dollarsign.circle.fill', emptyTitle: 'No Financial Data', emptyDescription: 'Financial records will appear here.' },
  { id: 'compliance', label: 'Compliance', icon: 'shield.checkmark.fill', emptyTitle: 'No Compliance Data', emptyDescription: 'Compliance records will appear here.' },
  { id: 'facilities', label: 'Facilities', icon: 'mappin.and.ellipse', emptyTitle: 'No Facilities', emptyDescription: 'Add facilities and venues.' },
  { id: 'ledger', label: 'Ledger', icon: 'doc.text', emptyTitle: 'No Ledger Entries', emptyDescription: 'Transaction history will appear here.' },
];

// ── Sports V3 ────────────────────────────────────────────────────────────────
import { SportsProgram } from '@/components/organization/sports-program-v3';
import { SportsPeople } from '@/components/organization/sports-people-v3';
import { SportsFinance } from '@/components/organization/sports-finance-v3';
import { SportsCompliance } from '@/components/organization/sports-compliance-v3';
import { SportsFacilities } from '@/components/organization/sports-facilities-v3';
import { SportsLedger } from '@/components/organization/sports-ledger-v3';

// ── Business V3 ──────────────────────────────────────────────────────────────
import { BizProgram } from '@/components/organization/biz-program-v3';
import { BizPeople } from '@/components/organization/biz-people-v3';
import { BizFinance } from '@/components/organization/biz-finance-v3';
import { BizCompliance } from '@/components/organization/biz-compliance-v3';
import { BizFacilities } from '@/components/organization/biz-facilities-v3';
import { BizLedger } from '@/components/organization/biz-ledger-v3';

// ── Church V3 ────────────────────────────────────────────────────────────────
import { ChurchProgram } from '@/components/organization/church-program-v3';
import { ChurchPeople } from '@/components/organization/church-people-v3';
import { ChurchFinance } from '@/components/organization/church-finance-v3';
import { ChurchCompliance } from '@/components/organization/church-compliance-v3';
import { ChurchFacilities } from '@/components/organization/church-facilities-v3';
import { ChurchLedger } from '@/components/organization/church-ledger-v3';

// ── Education V3 ─────────────────────────────────────────────────────────────
import { EduProgram } from '@/components/organization/edu-program-v3';
import { EduPeople } from '@/components/organization/edu-people-v3';
import { EduFinance } from '@/components/organization/edu-finance-v3';
import { EduCompliance } from '@/components/organization/edu-compliance-v3';
import { EduFacilities } from '@/components/organization/edu-facilities-v3';
import { EduLedger } from '@/components/organization/edu-ledger-v3';

// ── Competition V3 ───────────────────────────────────────────────────────────
import { CompProgram } from '@/components/organization/comp-program-v3';
import { CompPeople } from '@/components/organization/comp-people-v3';
import { CompFinance } from '@/components/organization/comp-finance-v3';
import { CompCompliance } from '@/components/organization/comp-compliance-v3';
import { CompFacilities } from '@/components/organization/comp-facilities-v3';
import { CompLedger } from '@/components/organization/comp-ledger-v3';

// =============================================================================
// UNIVERSAL 6-TAB DEFINITION
// =============================================================================

const ORG_TABS = [
  { id: 'program', label: 'Program' },
  { id: 'people', label: 'People' },
  { id: 'finance', label: 'Finance' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'ledger', label: 'Ledger' },
];

const PAGE_STYLE = { flex: 1 } as const;

// =============================================================================
// SHARED PAGER HOOK — reset + focus logic
// =============================================================================

function useOrgPager() {
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

  return { activeIndex, setActiveIndex, pagerRef, handleTabPress };
}

// =============================================================================
// SPORTS MODE
// =============================================================================

function SportsOrganization() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const membershipId = useMembershipId();
  const role = useMemo(() => getSportsRole(membershipId), [membershipId]);
  const { activeIndex, setActiveIndex, pagerRef, handleTabPress } = useOrgPager();

  return (
    <>
      <PagedTabBar tabs={ORG_TABS} activeIndex={activeIndex} onTabPress={handleTabPress} />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={ORG_TABS.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {ORG_TABS.map((tab) => {
            const p = { colors, accentColor: accent, role };
            switch (tab.id) {
              case 'program':
                return <View key="program" style={PAGE_STYLE}><SportsProgram {...p} /></View>;
              case 'people':
                return <View key="people" style={PAGE_STYLE}><SportsPeople {...p} /></View>;
              case 'finance':
                return <View key="finance" style={PAGE_STYLE}><SportsFinance {...p} /></View>;
              case 'compliance':
                return <View key="compliance" style={PAGE_STYLE}><SportsCompliance {...p} /></View>;
              case 'facilities':
                return <View key="facilities" style={PAGE_STYLE}><SportsFacilities {...p} /></View>;
              case 'ledger':
                return <View key="ledger" style={PAGE_STYLE}><SportsLedger {...p} /></View>;
              default:
                return <View key={tab.id} style={PAGE_STYLE} />;
            }
          })}
        </PagerView>
      </EdgeHoldAdvance>
    </>
  );
}

// =============================================================================
// CHURCH MODE
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
  const accent = useAccentColor();
  const { viewAsRole } = useChurch();
  const membershipId = useMembershipId();
  const derivedRole = useMemo(() => getChurchRole(membershipId), [membershipId]);
  const effectiveRole = viewAsRole ?? derivedRole;
  const { activeIndex, setActiveIndex, pagerRef, handleTabPress } = useOrgPager();

  return (
    <>
      <PagedTabBar tabs={ORG_TABS} activeIndex={activeIndex} onTabPress={handleTabPress} />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={ORG_TABS.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {ORG_TABS.map((tab) => {
            const p = { colors, accentColor: accent, role: effectiveRole };
            switch (tab.id) {
              case 'program': return <View key="program" style={PAGE_STYLE}><ChurchProgram {...p} /></View>;
              case 'people': return <View key="people" style={PAGE_STYLE}><ChurchPeople {...p} /></View>;
              case 'finance': return <View key="finance" style={PAGE_STYLE}><ChurchFinance {...p} /></View>;
              case 'compliance': return <View key="compliance" style={PAGE_STYLE}><ChurchCompliance {...p} /></View>;
              case 'facilities': return <View key="facilities" style={PAGE_STYLE}><ChurchFacilities {...p} /></View>;
              case 'ledger': return <View key="ledger" style={PAGE_STYLE}><ChurchLedger {...p} /></View>;
              default:
                return (
                  <View key={tab.id} style={[PAGE_STYLE, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ThemedText style={{ fontSize: 28, fontWeight: '800' }}>Coming Soon</ThemedText>
                    <ThemedText style={{ fontSize: 14, opacity: 0.5, marginTop: 6 }}>{tab.label} is under development.</ThemedText>
                  </View>
                );
            }
          })}
        </PagerView>
      </EdgeHoldAdvance>
    </>
  );
}

// =============================================================================
// EDUCATION MODE
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
  const accent = useAccentColor();
  const { viewAsRole } = useEducation();
  const membershipId = useMembershipId();
  const derivedRole = useMemo(() => getEducationRole(membershipId), [membershipId]);
  const effectiveRole = viewAsRole ?? derivedRole;
  const { activeIndex, setActiveIndex, pagerRef, handleTabPress } = useOrgPager();

  return (
    <>
      <PagedTabBar tabs={ORG_TABS} activeIndex={activeIndex} onTabPress={handleTabPress} />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={ORG_TABS.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {ORG_TABS.map((tab) => {
            const p = { colors, accentColor: accent, role: effectiveRole };
            switch (tab.id) {
              case 'program': return <View key="program" style={PAGE_STYLE}><EduProgram {...p} /></View>;
              case 'people': return <View key="people" style={PAGE_STYLE}><EduPeople {...p} /></View>;
              case 'finance': return <View key="finance" style={PAGE_STYLE}><EduFinance {...p} /></View>;
              case 'compliance': return <View key="compliance" style={PAGE_STYLE}><EduCompliance {...p} /></View>;
              case 'facilities': return <View key="facilities" style={PAGE_STYLE}><EduFacilities {...p} /></View>;
              case 'ledger': return <View key="ledger" style={PAGE_STYLE}><EduLedger {...p} /></View>;
              default: return <View key={tab.id} style={PAGE_STYLE} />;
            }
          })}
        </PagerView>
      </EdgeHoldAdvance>
    </>
  );
}

// =============================================================================
// COMPETITION MODE
// =============================================================================

function CommunityOrganization() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const membershipId = useMembershipId();
  const role = useMemo(() => getCompetitionRole(membershipId), [membershipId]);
  const { activeIndex, setActiveIndex, pagerRef, handleTabPress } = useOrgPager();

  return (
    <>
      <PagedTabBar tabs={ORG_TABS} activeIndex={activeIndex} onTabPress={handleTabPress} />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={ORG_TABS.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {ORG_TABS.map((tab) => {
            const p = { colors, accentColor: accent, role };
            switch (tab.id) {
              case 'program': return <View key="program" style={PAGE_STYLE}><CompProgram {...p} /></View>;
              case 'people': return <View key="people" style={PAGE_STYLE}><CompPeople {...p} /></View>;
              case 'finance': return <View key="finance" style={PAGE_STYLE}><CompFinance {...p} /></View>;
              case 'compliance': return <View key="compliance" style={PAGE_STYLE}><CompCompliance {...p} /></View>;
              case 'facilities': return <View key="facilities" style={PAGE_STYLE}><CompFacilities {...p} /></View>;
              case 'ledger': return <View key="ledger" style={PAGE_STYLE}><CompLedger {...p} /></View>;
              default: return <View key={tab.id} style={PAGE_STYLE} />;
            }
          })}
        </PagerView>
      </EdgeHoldAdvance>
    </>
  );
}

// =============================================================================
// BUSINESS MODE
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
  const accent = useAccentColor();
  const { viewAsRole, selectedEntity, selectedEntityId } = useBusiness();
  const membershipId = useMembershipId();
  const derivedRole = useMemo(() => getBusinessRole(membershipId), [membershipId]);
  const effectiveRole = viewAsRole ?? derivedRole;
  const [entitySwitcherVisible, setEntitySwitcherVisible] = useState(false);
  const { activeIndex, setActiveIndex, pagerRef, handleTabPress } = useOrgPager();

  return (
    <>
      <PagedTabBar tabs={ORG_TABS} activeIndex={activeIndex} onTabPress={handleTabPress} />
      <EntityScopeBar
        entityId={selectedEntityId}
        entityName={selectedEntity.name}
        entityType={selectedEntity.type}
        status="active"
        onSwitch={() => setEntitySwitcherVisible(true)}
        colors={colors}
      />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={ORG_TABS.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {ORG_TABS.map((tab) => {
            const p = { colors, accentColor: accent, role: effectiveRole };
            switch (tab.id) {
              case 'program': return <View key="program" style={PAGE_STYLE}><BizProgram {...p} /></View>;
              case 'people': return <View key="people" style={PAGE_STYLE}><BizPeople {...p} /></View>;
              case 'finance': return <View key="finance" style={PAGE_STYLE}><BizFinance {...p} /></View>;
              case 'compliance': return <View key="compliance" style={PAGE_STYLE}><BizCompliance {...p} /></View>;
              case 'facilities': return <View key="facilities" style={PAGE_STYLE}><BizFacilities {...p} /></View>;
              case 'ledger': return <View key="ledger" style={PAGE_STYLE}><BizLedger {...p} /></View>;
              default: return <View key={tab.id} style={PAGE_STYLE} />;
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
      case 'business':
        return <EmptyModeShell tabs={ORG_TABS_EMPTY} />;
      case 'education':
      case 'competition':
        return (
          <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ThemedText style={{ fontSize: 32, fontWeight: '800', lineHeight: 40 }}>Coming Soon</ThemedText>
            <ThemedText style={{ fontSize: 15, opacity: 0.5, textAlign: 'center', marginTop: 8 }}>
              This mode is under development.{'\n'}Stay tuned for updates.
            </ThemedText>
          </ThemedView>
        );
      default: return null;
    }
  };

  return (
    <ThemedView style={styles.container}>
      {renderModeContent()}
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
  container: { flex: 1 },
  pager: { flex: 1 },
});
