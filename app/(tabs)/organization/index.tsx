/**
 * Organization Screen - Institution Overview
 * Universal operational surface - mode-specific truth view.
 * Per spec: Organization reflects "what is" - it never reasons, simulates, or decides.
 * All 5 modes get 4 swipeable PagerView tabs + More overflow.
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, InteractionManager } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/core';
import * as Haptics from 'expo-haptics';
import { consumeOrgReset, registerOrgResetCallback } from '@/utils/global-org';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext, useMode } from '@/context/app-context';
import { BusinessProvider, useBusiness } from '@/context/business-context';
import { ChurchProvider, useChurch } from '@/context/church-context';
import { EducationProvider, useEducation } from '@/context/education-context';
import type { ChurchRoleLens } from '@/utils/church-rbac';
import type { EducationRoleLens } from '@/utils/education-rbac';
import { PagedTabBar } from '@/components/ui/paged-tab-bar';
import { EdgeHoldAdvance } from '@/components/ui/edge-hold-advance';
import { TabPlaceholderPage } from '@/components/ui/tab-placeholder-page';
import { OrgPeopleTab } from '@/components/organization/org-people-tab';
import { OrgOperationsTab } from '@/components/organization/org-operations-tab-v2';
import { OrgFinanceTab } from '@/components/organization/org-finance-tab-v2';
import { OrgSwitcherSheet } from '@/components/organization/org-switcher-sheet';
import { OrgProgramTab } from '@/components/organization/org-program-tab';
import { SportsOrgProgramsV2 } from '@/components/organization/sports-org-programs-v2';
import { OrgMinistriesTab } from '@/components/organization/org-ministries-tab';
import { OrgInstitutionsTab } from '@/components/organization/org-institutions-tab';
import { OrgSeriesTab } from '@/components/organization/org-series-tab';
import { OrgPaymentRailsTab } from '@/components/organization/org-payment-rails-tab';
import { OrgComplianceTab } from '@/components/organization/org-compliance-tab';
import { OrgResourcesTab } from '@/components/organization/org-resources-tab';
import { OrgSponsorsTab } from '@/components/organization/org-sponsors-tab';
import { RoomsHub } from '@/components/rooms/rooms-hub';
import { OrgFacilitiesTab } from '@/components/organization/org-facilities-tab';
import {
  INSTITUTION,
  INSTITUTION_LEADERSHIP,
  PROGRAMS,
  formatRecord,
  getProgramLevelLabel,
  type ProgramData,
  type Staff,
} from '@/data/mock-sports';

import {
  ICC_ORGANIZATION,
  CAMPUSES,
  MINISTRIES,
  CHURCH_LEADERSHIP,
  formatServiceTime,
} from '@/data/mock-church';
import {
  SDCC_ORGANIZATION,
  ACADEMIC_TERMS,
  ACADEMIC_CALENDAR,
  DEPARTMENTS,
  FACULTY_LEADERSHIP,
  INSTITUTIONAL_METRICS,
  getCurrentTerm,
  getUpcomingEvents,
  formatTermDates,
  formatCalendarEventDate,
  getCalendarEventTypeLabel,
} from '@/data/mock-education';
import type { Campus, Ministry, AcademicTerm, AcademicCalendarEvent, Department, FacultyMember } from '@/types';
import { RailsSection } from '@/components/rails/rails-section';
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
import { ChurchOrgFacilities } from '@/components/organization/church-org-facilities';
import { ChurchOrgResources } from '@/components/organization/church-org-resources';
import { ChurchOrgDonations } from '@/components/organization/church-org-donations';

// Education v2 org tab components
import { EduOrgFacilities } from '@/components/organization/edu-org-facilities';
import { EduOrgResources } from '@/components/organization/edu-org-resources';
import { EduOrgSponsors } from '@/components/organization/edu-org-sponsors';

// =============================================================================
// ORG TAB & MORE DEFINITIONS (per mode)
// =============================================================================

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
// SPORTS MODE COMPONENTS
// =============================================================================

interface SectionHeaderProps {
  title: string;
  colors: typeof Colors.light;
}

function SectionHeader({ title, colors }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {title}
      </ThemedText>
    </View>
  );
}

// =============================================================================
// SPORTS MODE CONTENT (with PagerView)
// =============================================================================

function SportsOrganization() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const modeColors = ModeColors.sports;
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
      <PagedTabBar tabs={ORG_TABS.sports} activeIndex={activeIndex} onTabPress={handleTabPress} />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={ORG_TABS.sports.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {/* Page 0: Program */}
        <View key="program" style={{ flex: 1 }}>
          <SportsOrgProgramsV2 colors={colors} accentColor={modeColors.primary} />
        </View>

        {/* Page 1: People */}
        <View key="people" style={{ flex: 1 }}>
          <OrgPeopleTab mode="sports" colors={colors} accentColor={modeColors.primary} />
        </View>

        {/* Page 2: Rooms */}
        <View key="rooms" style={{ flex: 1 }}>
          <RoomsHub mode="sports" colors={colors} accentColor={modeColors.primary} />
        </View>

        {/* Page 3: Operations */}
        <View key="operations" style={{ flex: 1 }}>
          <OrgOperationsTab mode="sports" colors={colors} accentColor={modeColors.primary} />
        </View>

        {/* Page 4: Finance */}
        <View key="finance" style={{ flex: 1 }}>
          <OrgFinanceTab mode="sports" colors={colors} accentColor={modeColors.primary} />
        </View>

        {/* Page 4: Payment Rails */}
        <View key="payment-rails" style={{ flex: 1 }}>
          <OrgPaymentRailsTab mode="sports" colors={colors} accentColor={modeColors.primary} />
        </View>

        {/* Page 5: Compliance */}
        <View key="compliance" style={{ flex: 1 }}>
          <OrgComplianceTab mode="sports" colors={colors} accentColor={modeColors.primary} />
        </View>

        {/* Page 6: Facilities */}
        <View key="facilities" style={{ flex: 1 }}>
          <OrgFacilitiesTab colors={colors} accentColor={modeColors.primary} />
        </View>

        {/* Page 7: Resources */}
        <View key="resources" style={{ flex: 1 }}>
          <OrgResourcesTab colors={colors} accentColor={modeColors.primary} />
        </View>

        {/* Page 8: Sponsors */}
        <View key="sponsors" style={{ flex: 1 }}>
          <OrgSponsorsTab colors={colors} accentColor={modeColors.primary} />
        </View>
        </PagerView>
      </EdgeHoldAdvance>
    </>
  );
}

// =============================================================================
// SHARED COMPONENTS
// =============================================================================

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  colors: typeof Colors.light;
  accentColor: string;
}

function MetricCard({ label, value, subValue, colors, accentColor }: MetricCardProps) {
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.metricValue, { color: accentColor }]}>{value}</ThemedText>
      {subValue && (
        <ThemedText style={[styles.metricSubValue, { color: colors.textSecondary }]}>
          {subValue}
        </ThemedText>
      )}
      <ThemedText style={[styles.metricLabel, { color: colors.textTertiary }]}>{label}</ThemedText>
    </View>
  );
}


// =============================================================================
// CHURCH MODE COMPONENTS
// =============================================================================

interface CampusCardProps {
  campus: Campus;
  colors: typeof Colors.light;
  accentColor: string;
  onPress: () => void;
}

function CampusCard({ campus, colors, accentColor, onPress }: CampusCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.campusCard,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      <View style={styles.campusHeader}>
        <View style={[styles.campusBadge, { backgroundColor: accentColor }]}>
          <ThemedText style={styles.campusBadgeText}>{campus.shortName}</ThemedText>
        </View>
        <View style={styles.campusInfo}>
          <ThemedText style={styles.campusName}>{campus.name}</ThemedText>
          <ThemedText style={[styles.campusLocation, { color: colors.textSecondary }]}>
            {campus.location}
          </ThemedText>
        </View>
        <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
      </View>
      {campus.serviceTimes.length > 0 && (
        <View style={styles.campusServices}>
          {campus.serviceTimes.slice(0, 2).map((service, index) => (
            <ThemedText
              key={index}
              style={[styles.campusServiceText, { color: colors.textTertiary }]}
            >
              {formatServiceTime(service)}
            </ThemedText>
          ))}
        </View>
      )}
    </Pressable>
  );
}

interface MinistryRowProps {
  ministry: Ministry;
  colors: typeof Colors.light;
  accentColor: string;
  onPress: () => void;
}

function MinistryRow({ ministry, colors, accentColor, onPress }: MinistryRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.ministryRow,
        pressed && { backgroundColor: colors.backgroundSecondary },
      ]}
      onPress={onPress}
    >
      <View style={[styles.ministryIcon, { backgroundColor: accentColor + '15' }]}>
        <IconSymbol name={ministry.icon as any || 'heart.fill'} size={18} color={accentColor} />
      </View>
      <View style={styles.ministryInfo}>
        <ThemedText style={styles.ministryName}>{ministry.name}</ThemedText>
        {ministry.description && (
          <ThemedText style={[styles.ministryDesc, { color: colors.textSecondary }]} numberOfLines={1}>
            {ministry.description}
          </ThemedText>
        )}
      </View>
      <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
    </Pressable>
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
      <PagedTabBar tabs={ORG_TABS.church} activeIndex={activeIndex} onTabPress={handleTabPress} />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={ORG_TABS.church.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          <View key="ministries" style={{ flex: 1 }}>
            <ChurchOrgMinistries colors={colors} accentColor={accent} role={viewAsRole} />
          </View>
          <View key="people" style={{ flex: 1 }}>
            <ChurchOrgPeople colors={colors} accentColor={accent} role={viewAsRole} />
          </View>
          <View key="rooms" style={{ flex: 1 }}>
            <ChurchOrgRooms colors={colors} accentColor={accent} role={viewAsRole} />
          </View>
          <View key="operations" style={{ flex: 1 }}>
            <ChurchOrgOperations colors={colors} accentColor={accent} role={viewAsRole} />
          </View>
          <View key="finance" style={{ flex: 1 }}>
            <ChurchOrgFinance colors={colors} accentColor={accent} role={viewAsRole} />
          </View>
          <View key="payment-rails" style={{ flex: 1 }}>
            <ChurchOrgPaymentRails colors={colors} accentColor={accent} role={viewAsRole} />
          </View>
          <View key="compliance" style={{ flex: 1 }}>
            <OrgComplianceTab mode="church" colors={colors} accentColor={accent} />
          </View>
          <View key="facilities" style={{ flex: 1 }}>
            <ChurchOrgFacilities colors={colors} accentColor={accent} role={viewAsRole} />
          </View>
          <View key="resources" style={{ flex: 1 }}>
            <ChurchOrgResources colors={colors} accentColor={accent} role={viewAsRole} />
          </View>
          <View key="donations" style={{ flex: 1 }}>
            <ChurchOrgDonations colors={colors} accentColor={accent} role={viewAsRole} />
          </View>
        </PagerView>
      </EdgeHoldAdvance>
    </>
  );
}

// =============================================================================
// EDUCATION MODE COMPONENTS
// =============================================================================

interface TermCardProps {
  term: AcademicTerm;
  colors: typeof Colors.light;
  accentColor: string;
  isCurrent: boolean;
  onPress?: () => void;
}

function TermCard({ term, colors, accentColor, isCurrent, onPress }: TermCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.termCard,
        {
          backgroundColor: colors.card,
          borderColor: isCurrent ? accentColor : colors.border,
          borderWidth: isCurrent ? 2 : 1,
        },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      <View style={styles.termHeader}>
        <ThemedText style={styles.termName}>{term.name}</ThemedText>
        {isCurrent && (
          <View style={[styles.currentBadge, { backgroundColor: accentColor }]}>
            <ThemedText style={styles.currentBadgeText}>Current</ThemedText>
          </View>
        )}
      </View>
      <View style={styles.termFooter}>
        <ThemedText style={[styles.termDates, { color: colors.textSecondary }]}>
          {formatTermDates(term)}
        </ThemedText>
        {onPress && <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />}
      </View>
    </Pressable>
  );
}

interface CalendarEventRowProps {
  event: AcademicCalendarEvent;
  colors: typeof Colors.light;
  accentColor: string;
}

function CalendarEventRow({ event, colors, accentColor }: CalendarEventRowProps) {
  return (
    <View style={styles.calendarRow}>
      <View style={[styles.calendarDate, { backgroundColor: accentColor + '15' }]}>
        <ThemedText style={[styles.calendarMonth, { color: accentColor }]}>
          {event.date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
        </ThemedText>
        <ThemedText style={[styles.calendarDay, { color: accentColor }]}>
          {event.date.getDate()}
        </ThemedText>
      </View>
      <View style={styles.calendarInfo}>
        <ThemedText style={styles.calendarTitle}>{event.title}</ThemedText>
        <ThemedText style={[styles.calendarType, { color: colors.textSecondary }]}>
          {getCalendarEventTypeLabel(event.type)}
        </ThemedText>
      </View>
    </View>
  );
}

interface DepartmentCardProps {
  department: Department;
  colors: typeof Colors.light;
  accentColor: string;
}

function DepartmentCard({ department, colors, accentColor }: DepartmentCardProps) {
  return (
    <View style={[styles.departmentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={styles.departmentName}>{department.name}</ThemedText>
      <ThemedText style={[styles.departmentPrograms, { color: accentColor }]}>
        {department.programCount} programs
      </ThemedText>
    </View>
  );
}

interface FacultyRowProps {
  faculty: FacultyMember;
  colors: typeof Colors.light;
  onPress?: () => void;
}

function FacultyRow({ faculty, colors, onPress }: FacultyRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.leadershipRow,
        pressed && { backgroundColor: colors.backgroundSecondary },
      ]}
      onPress={onPress}
    >
      <View style={[styles.leadershipAvatar, { backgroundColor: colors.backgroundTertiary }]}>
        <IconSymbol name="person.fill" size={20} color={colors.textTertiary} />
      </View>
      <View style={styles.leadershipInfo}>
        <ThemedText style={styles.leadershipName}>{faculty.name}</ThemedText>
        <ThemedText style={[styles.leadershipTitle, { color: colors.textSecondary }]}>
          {faculty.title}
        </ThemedText>
      </View>
      {onPress && <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />}
    </Pressable>
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
      <PagedTabBar tabs={ORG_TABS.education} activeIndex={activeIndex} onTabPress={handleTabPress} />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={ORG_TABS.education.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          <View key="institutions" style={{ flex: 1 }}>
            <OrgInstitutionsTab colors={colors} accentColor={accent} />
          </View>
          <View key="people" style={{ flex: 1 }}>
            <OrgPeopleTab mode="education" colors={colors} accentColor={accent} />
          </View>
          <View key="rooms" style={{ flex: 1 }}>
            <RoomsHub mode="education" colors={colors} accentColor={accent} />
          </View>
          <View key="operations" style={{ flex: 1 }}>
            <OrgOperationsTab mode="education" colors={colors} accentColor={accent} />
          </View>
          <View key="finance" style={{ flex: 1 }}>
            <OrgFinanceTab mode="education" colors={colors} accentColor={accent} />
          </View>
          <View key="payment-rails" style={{ flex: 1 }}>
            <OrgPaymentRailsTab mode="education" colors={colors} accentColor={accent} />
          </View>
          <View key="compliance" style={{ flex: 1 }}>
            <OrgComplianceTab mode="education" colors={colors} accentColor={accent} />
          </View>
          <View key="facilities" style={{ flex: 1 }}>
            <EduOrgFacilities colors={colors} accentColor={accent} role={viewAsRole} />
          </View>
          <View key="resources" style={{ flex: 1 }}>
            <EduOrgResources colors={colors} accentColor={accent} role={viewAsRole} />
          </View>
          <View key="sponsors" style={{ flex: 1 }}>
            <EduOrgSponsors colors={colors} accentColor={accent} role={viewAsRole} />
          </View>
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
      <PagedTabBar tabs={ORG_TABS.competition} activeIndex={activeIndex} onTabPress={handleTabPress} />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={ORG_TABS.competition.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          <View key="series" style={{ flex: 1 }}>
            <CompSeriesV2 colors={colors} accentColor={accent} />
          </View>
          <View key="people" style={{ flex: 1 }}>
            <CompPeopleV2 colors={colors} accentColor={accent} />
          </View>
          <View key="rooms" style={{ flex: 1 }}>
            <CompRoomsV2 colors={colors} accentColor={accent} />
          </View>
          <View key="operations" style={{ flex: 1 }}>
            <CompOperationsV2 colors={colors} accentColor={accent} />
          </View>
          <View key="finance" style={{ flex: 1 }}>
            <CompFinanceV2 colors={colors} accentColor={accent} />
          </View>
          <View key="payment-rails" style={{ flex: 1 }}>
            <CompPaymentRailsV2 colors={colors} accentColor={accent} />
          </View>
          <View key="compliance" style={{ flex: 1 }}>
            <CompComplianceV2 colors={colors} accentColor={accent} />
          </View>
          <View key="assets" style={{ flex: 1 }}>
            <CompAssetsV2 colors={colors} accentColor={accent} />
          </View>
          <View key="reports" style={{ flex: 1 }}>
            <CompReportsV2 colors={colors} accentColor={accent} />
          </View>
          <View key="sponsors" style={{ flex: 1 }}>
            <CompSponsorsV2 colors={colors} accentColor={accent} />
          </View>
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
      <PagedTabBar tabs={ORG_TABS.business} activeIndex={activeIndex} onTabPress={handleTabPress} />
      <EntityScopeBar
        entityId={selectedEntityId}
        entityName={selectedEntity.name}
        entityType={selectedEntity.type}
        status="active"
        onSwitch={() => setEntitySwitcherVisible(true)}
        colors={colors}
      />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={ORG_TABS.business.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          <View key="entities" style={{ flex: 1 }}>
            <BizOrgEntitiesV2 colors={colors} accentColor={accent} role={viewAsRole} />
          </View>
          <View key="people" style={{ flex: 1 }}>
            <BizOrgPeopleV2 colors={colors} accentColor={accent} role={viewAsRole} />
          </View>
          <View key="rooms" style={{ flex: 1 }}>
            <BizOrgRoomsV2 colors={colors} accentColor={accent} role={viewAsRole} />
          </View>
          <View key="operations" style={{ flex: 1 }}>
            <BizOrgOperationsV2 colors={colors} accentColor={accent} role={viewAsRole} />
          </View>
          <View key="finance" style={{ flex: 1 }}>
            <BizOrgFinanceV2 colors={colors} accentColor={accent} role={viewAsRole} />
          </View>
          <View key="payment-rails" style={{ flex: 1 }}>
            <BizOrgPaymentRailsV2 colors={colors} accentColor={accent} role={viewAsRole} />
          </View>
          <View key="legal" style={{ flex: 1 }}>
            <BizOrgLegalV2 colors={colors} accentColor={accent} role={viewAsRole} />
          </View>
          <View key="compliance" style={{ flex: 1 }}>
            <BizOrgComplianceV2 colors={colors} accentColor={accent} role={viewAsRole} />
          </View>
          <View key="assets" style={{ flex: 1 }}>
            <BizOrgAssetsTab colors={colors} accentColor={accent} role={viewAsRole} />
          </View>
          <View key="reports" style={{ flex: 1 }}>
            <BizOrgReportsV2 colors={colors} accentColor={accent} role={viewAsRole} />
          </View>
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
