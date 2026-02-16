/**
 * Organization Screen - Institution Overview
 * Universal operational surface - mode-specific truth view.
 * Per spec: Organization reflects "what is" - it never reasons, simulates, or decides.
 * All 5 modes get 4 swipeable PagerView tabs + More overflow.
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext, useMode } from '@/context/app-context';
import { PagedTabBar } from '@/components/ui/paged-tab-bar';
import { EdgeHoldAdvance } from '@/components/ui/edge-hold-advance';
import { TabPlaceholderPage } from '@/components/ui/tab-placeholder-page';
import { OrgPeopleTab } from '@/components/organization/org-people-tab';
import { OrgOperationsTab } from '@/components/organization/org-operations-tab';
import { OrgFinanceTab } from '@/components/organization/org-finance-tab';
import { OrgSwitcherSheet } from '@/components/organization/org-switcher-sheet';
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
import { EnterpriseProvider } from '@/context/enterprise-context';
import { CompanySwitcher } from '@/components/enterprise/company-switcher';
import { EnterpriseHomeContent } from '@/components/enterprise/enterprise-home';
import { ProofEventsContent } from '@/components/enterprise/proof-events-content';
import { DataRoomContent } from '@/components/enterprise/data-room-content';
import { GovernanceContent } from '@/components/enterprise/governance-content';
import { RailsSection } from '@/components/rails/rails-section';
import type { Mode } from '@/types';

// =============================================================================
// ORG TAB & MORE DEFINITIONS (per mode)
// =============================================================================

const ORG_TABS: Record<Mode, { id: string; label: string }[]> = {
  sports: [
    { id: 'programs', label: 'Programs' },
    { id: 'people', label: 'People' },
    { id: 'operations', label: 'Operations' },
    { id: 'finance', label: 'Finance' },
    { id: 'payment-rails', label: 'Payment Rails' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'resources', label: 'Resources' },
    { id: 'brand', label: 'Brand' },
  ],
  enterprise: [
    { id: 'entities', label: 'Entities' },
    { id: 'people', label: 'People' },
    { id: 'operations', label: 'Operations' },
    { id: 'finance', label: 'Finance' },
    { id: 'payment-rails', label: 'Payment Rails' },
    { id: 'legal', label: 'Legal' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'assets', label: 'Assets' },
    { id: 'reports', label: 'Reports' },
  ],
  education: [
    { id: 'schools', label: 'Schools' },
    { id: 'people', label: 'People' },
    { id: 'operations', label: 'Operations' },
    { id: 'finance', label: 'Finance' },
    { id: 'payment-rails', label: 'Payment Rails' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'resources', label: 'Resources' },
    { id: 'policies', label: 'Policies' },
  ],
  community: [
    { id: 'series', label: 'Series' },
    { id: 'people', label: 'People' },
    { id: 'operations', label: 'Operations' },
    { id: 'finance', label: 'Finance' },
    { id: 'payment-rails', label: 'Payment Rails' },
    { id: 'rules', label: 'Rules' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'venues', label: 'Venues' },
    { id: 'sponsors', label: 'Sponsors' },
  ],
  church: [
    { id: 'ministries', label: 'Ministries' },
    { id: 'people', label: 'People' },
    { id: 'operations', label: 'Operations' },
    { id: 'finance', label: 'Finance' },
    { id: 'payment-rails', label: 'Payment Rails' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'resources', label: 'Resources' },
    { id: 'policies', label: 'Policies' },
  ],
};


// =============================================================================
// SPORTS MODE COMPONENTS
// =============================================================================

interface ProgramCardProps {
  program: ProgramData;
  onPress: () => void;
  colors: typeof Colors.light;
  accentColor: string;
}

function ProgramCard({ program, onPress, colors, accentColor }: ProgramCardProps) {
  const isVarsity = program.level === 'varsity';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.programCard,
        {
          backgroundColor: colors.card,
          borderColor: isVarsity ? accentColor : colors.border,
          borderWidth: isVarsity ? 2 : 1,
        },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      <View style={styles.programCardHeader}>
        <ThemedText style={styles.programName}>{program.name}</ThemedText>
        <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
      </View>
      <ThemedText style={[styles.programSport, { color: colors.textSecondary }]}>
        {program.sport}
      </ThemedText>
      <View style={styles.programStats}>
        <View style={styles.programStat}>
          <ThemedText style={[styles.programStatValue, { color: accentColor }]}>
            {formatRecord(program.record.overall)}
          </ThemedText>
          <ThemedText style={[styles.programStatLabel, { color: colors.textTertiary }]}>
            Record
          </ThemedText>
        </View>
        {program.roster.length > 0 && (
          <View style={styles.programStat}>
            <ThemedText style={[styles.programStatValue, { color: accentColor }]}>
              {program.roster.length}
            </ThemedText>
            <ThemedText style={[styles.programStatLabel, { color: colors.textTertiary }]}>
              Players
            </ThemedText>
          </View>
        )}
        {program.staff.length > 0 && (
          <View style={styles.programStat}>
            <ThemedText style={[styles.programStatValue, { color: accentColor }]}>
              {program.staff.length}
            </ThemedText>
            <ThemedText style={[styles.programStatLabel, { color: colors.textTertiary }]}>
              Staff
            </ThemedText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

interface LeadershipRowProps {
  staff: Staff;
  colors: typeof Colors.light;
}

function LeadershipRow({ staff, colors }: LeadershipRowProps) {
  return (
    <View style={styles.leadershipRow}>
      <View style={[styles.leadershipAvatar, { backgroundColor: colors.backgroundTertiary }]}>
        <IconSymbol name="person.fill" size={20} color={colors.textTertiary} />
      </View>
      <View style={styles.leadershipInfo}>
        <ThemedText style={styles.leadershipName}>{staff.name}</ThemedText>
        <ThemedText style={[styles.leadershipTitle, { color: colors.textSecondary }]}>
          {staff.title}
        </ThemedText>
      </View>
    </View>
  );
}

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

  const handleProgramPress = (programId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/organization/programs/${programId}`);
  };

  const handleRecruitingPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/organization/recruiting');
  };

  const handleDonationsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/organization/donations');
  };

  const handleTicketsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/organization/tickets');
  };

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
          {/* Page 0: Programs (existing content) */}
          <ScrollView key="programs" nestedScrollEnabled showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Institution Header */}
          <View style={styles.institutionHeader}>
            <View style={[styles.institutionBadge, { backgroundColor: modeColors.primary }]}>
              <ThemedText style={styles.institutionBadgeText}>
                {INSTITUTION.nickname.charAt(0)}
              </ThemedText>
            </View>
            <View style={styles.institutionInfo}>
              <ThemedText style={styles.institutionName}>{INSTITUTION.name}</ThemedText>
              <ThemedText style={[styles.institutionDetails, { color: colors.textSecondary }]}>
                {INSTITUTION.nickname} • {INSTITUTION.division}
              </ThemedText>
              <ThemedText style={[styles.institutionLocation, { color: colors.textTertiary }]}>
                {INSTITUTION.location}
              </ThemedText>
            </View>
          </View>

          {/* Institutional Snapshot */}
          <View style={[styles.snapshotCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.snapshotRow}>
              <View style={styles.snapshotItem}>
                <ThemedText style={[styles.snapshotValue, { color: modeColors.primary }]}>
                  {INSTITUTION.conference}
                </ThemedText>
                <ThemedText style={[styles.snapshotLabel, { color: colors.textTertiary }]}>
                  Conference
                </ThemedText>
              </View>
              <View style={[styles.snapshotDivider, { backgroundColor: colors.divider }]} />
              <View style={styles.snapshotItem}>
                <ThemedText style={[styles.snapshotValue, { color: modeColors.primary }]}>
                  {PROGRAMS.length}
                </ThemedText>
                <ThemedText style={[styles.snapshotLabel, { color: colors.textTertiary }]}>
                  Programs
                </ThemedText>
              </View>
              <View style={[styles.snapshotDivider, { backgroundColor: colors.divider }]} />
              <View style={styles.snapshotItem}>
                <ThemedText style={[styles.snapshotValue, { color: modeColors.primary }]}>
                  {INSTITUTION.founded}
                </ThemedText>
                <ThemedText style={[styles.snapshotLabel, { color: colors.textTertiary }]}>
                  Founded
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Programs Section */}
          <SectionHeader title="Programs" colors={colors} />
          <View style={styles.programsGrid}>
            {PROGRAMS.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                onPress={() => handleProgramPress(program.id)}
                colors={colors}
                accentColor={modeColors.primary}
              />
            ))}
          </View>

          {/* Recruiting Section */}
          <SectionHeader title="Recruiting" colors={colors} />
          <Pressable
            style={({ pressed }) => [
              styles.recruitingCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleRecruitingPress}
          >
            <View style={[styles.recruitingIcon, { backgroundColor: modeColors.primary + '15' }]}>
              <IconSymbol name="person.badge.plus" size={24} color={modeColors.primary} />
            </View>
            <View style={styles.recruitingInfo}>
              <ThemedText style={styles.recruitingTitle}>Recruiting Board</ThemedText>
              <ThemedText style={[styles.recruitingSubtitle, { color: colors.textSecondary }]}>
                Track prospects and manage pipeline
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
          </Pressable>

          {/* Support & Tickets */}
          <SectionHeader title="Support & Tickets" colors={colors} />
          <View style={styles.supportGrid}>
            <Pressable
              style={({ pressed }) => [
                styles.supportCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleDonationsPress}
            >
              <View style={[styles.supportIcon, { backgroundColor: modeColors.primary + '15' }]}>
                <IconSymbol name="heart.fill" size={22} color={modeColors.primary} />
              </View>
              <ThemedText style={styles.supportTitle}>Donate</ThemedText>
              <ThemedText style={[styles.supportSubtitle, { color: colors.textSecondary }]}>
                Support athletics
              </ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.supportCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleTicketsPress}
            >
              <View style={[styles.supportIcon, { backgroundColor: modeColors.primary + '15' }]}>
                <IconSymbol name="ticket.fill" size={22} color={modeColors.primary} />
              </View>
              <ThemedText style={styles.supportTitle}>Tickets</ThemedText>
              <ThemedText style={[styles.supportSubtitle, { color: colors.textSecondary }]}>
                Get game tickets
              </ThemedText>
            </Pressable>
          </View>

          {/* Leadership Section */}
          <SectionHeader title="Athletic Leadership" colors={colors} />
          <View style={[styles.leadershipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {INSTITUTION_LEADERSHIP.map((staff, index) => (
              <React.Fragment key={staff.id}>
                <LeadershipRow staff={staff} colors={colors} />
                {index < INSTITUTION_LEADERSHIP.length - 1 && (
                  <View style={[styles.leadershipDivider, { backgroundColor: colors.divider }]} />
                )}
              </React.Fragment>
            ))}
          </View>

          {/* About Section */}
          <SectionHeader title="About" colors={colors} />
          <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[styles.aboutText, { color: colors.textSecondary }]}>
              {INSTITUTION.description}
            </ThemedText>
          </View>
        </ScrollView>

        {/* Page 1: People */}
        <View key="people" style={{ flex: 1 }}>
          <OrgPeopleTab mode="sports" colors={colors} accentColor={modeColors.primary} />
        </View>

        {/* Page 2: Operations */}
        <View key="operations" style={{ flex: 1 }}>
          <OrgOperationsTab mode="sports" colors={colors} accentColor={modeColors.primary} />
        </View>

        {/* Page 3: Finance */}
        <View key="finance" style={{ flex: 1 }}>
          <OrgFinanceTab mode="sports" colors={colors} accentColor={modeColors.primary} />
        </View>

        {/* Page 4: Payment Rails */}
        <View key="payment-rails" style={{ flex: 1 }}>
          <TabPlaceholderPage title="Payment Rails" />
        </View>

        {/* Page 5: Compliance */}
        <View key="compliance" style={{ flex: 1 }}>
          <TabPlaceholderPage title="Compliance" />
        </View>

        {/* Page 6: Facilities */}
        <View key="facilities" style={{ flex: 1 }}>
          <TabPlaceholderPage title="Facilities" />
        </View>

        {/* Page 7: Resources */}
        <View key="resources" style={{ flex: 1 }}>
          <TabPlaceholderPage title="Resources" />
        </View>

        {/* Page 8: Brand */}
        <View key="brand" style={{ flex: 1 }}>
          <TabPlaceholderPage title="Brand" />
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
// ENTERPRISE MODE CONTENT (with PagerView — uses new ORG_TABS labels)
// =============================================================================

function EnterpriseOrganization() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  return (
    <EnterpriseProvider>
      <PagedTabBar tabs={ORG_TABS.enterprise} activeIndex={activeIndex} onTabPress={handleTabPress} />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={ORG_TABS.enterprise.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {/* Page 0: Entities (existing enterprise home) */}
          <ScrollView key="entities" nestedScrollEnabled showsVerticalScrollIndicator={false}>
            <EnterpriseHomeContent onSwitchTab={handleTabPress} />
          </ScrollView>

          {/* Page 1: People */}
          <View key="people" style={{ flex: 1 }}>
            <OrgPeopleTab mode="enterprise" colors={colors} accentColor={ModeColors.enterprise.primary} />
          </View>

          {/* Page 2: Operations */}
          <View key="operations" style={{ flex: 1 }}>
            <OrgOperationsTab mode="enterprise" colors={colors} accentColor={ModeColors.enterprise.primary} />
          </View>

          {/* Page 3: Finance */}
          <View key="finance" style={{ flex: 1 }}>
            <OrgFinanceTab mode="enterprise" colors={colors} accentColor={ModeColors.enterprise.primary} />
          </View>

          {/* Page 4: Payment Rails */}
          <View key="payment-rails" style={{ flex: 1 }}>
            <TabPlaceholderPage title="Payment Rails" />
          </View>

          {/* Page 5: Legal */}
          <View key="legal" style={{ flex: 1 }}>
            <TabPlaceholderPage title="Legal" />
          </View>

          {/* Page 6: Compliance */}
          <View key="compliance" style={{ flex: 1 }}>
            <TabPlaceholderPage title="Compliance" />
          </View>

          {/* Page 7: Assets */}
          <View key="assets" style={{ flex: 1 }}>
            <TabPlaceholderPage title="Assets" />
          </View>

          {/* Page 8: Reports */}
          <View key="reports" style={{ flex: 1 }}>
            <TabPlaceholderPage title="Reports" />
          </View>
        </PagerView>
      </EdgeHoldAdvance>
    </EnterpriseProvider>
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
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const modeColors = ModeColors.church;
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  const handleCampusPress = (campusId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/organization/campuses/${campusId}`);
  };

  const handleMinistriesPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/organization/ministries');
  };

  const handleMinistryPress = (ministryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/organization/ministries/${ministryId}`);
  };

  const handleMessagesPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/organization/messages');
  };

  const handleGivingPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/organization/giving');
  };

  const handleConnectPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/organization/connect');
  };

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
          {/* Page 0: Ministries (existing content) */}
          <ScrollView key="ministries" nestedScrollEnabled showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Church Header */}
          <View style={styles.institutionHeader}>
            <View style={[styles.institutionBadge, { backgroundColor: modeColors.primary }]}>
              <IconSymbol name="heart.fill" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.institutionInfo}>
              <ThemedText style={styles.institutionName}>{ICC_ORGANIZATION.name}</ThemedText>
              <ThemedText style={[styles.institutionDetails, { color: colors.textSecondary }]}>
                {ICC_ORGANIZATION.denomination}
              </ThemedText>
              <ThemedText style={[styles.institutionLocation, { color: colors.textTertiary }]}>
                {CAMPUSES.length} Campuses • {ICC_ORGANIZATION.location}
              </ThemedText>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickLinksGrid}>
            <Pressable
              style={({ pressed }) => [
                styles.quickLinkCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleMessagesPress}
            >
              <IconSymbol name="play.circle.fill" size={24} color={modeColors.primary} />
              <ThemedText style={styles.quickLinkTitle}>Messages</ThemedText>
              <ThemedText style={[styles.quickLinkSubtitle, { color: colors.textSecondary }]}>
                Watch sermons
              </ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.quickLinkCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleGivingPress}
            >
              <IconSymbol name="heart.fill" size={24} color={modeColors.primary} />
              <ThemedText style={styles.quickLinkTitle}>Give</ThemedText>
              <ThemedText style={[styles.quickLinkSubtitle, { color: colors.textSecondary }]}>
                Tithes & offerings
              </ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.quickLinkCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleConnectPress}
            >
              <IconSymbol name="person.badge.plus" size={24} color={modeColors.primary} />
              <ThemedText style={styles.quickLinkTitle}>Connect</ThemedText>
              <ThemedText style={[styles.quickLinkSubtitle, { color: colors.textSecondary }]}>
                Get involved
              </ThemedText>
            </Pressable>
          </View>

          {/* Campuses */}
          <SectionHeader title="Our Campuses" colors={colors} />
          <View style={styles.campusesList}>
            {CAMPUSES.map((campus) => (
              <CampusCard
                key={campus.id}
                campus={campus}
                colors={colors}
                accentColor={modeColors.primary}
                onPress={() => handleCampusPress(campus.id)}
              />
            ))}
          </View>

          {/* Ministries */}
          <SectionHeader title="Ministries" colors={colors} />
          <View style={[styles.ministriesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {MINISTRIES.slice(0, 5).map((ministry, index) => (
              <React.Fragment key={ministry.id}>
                <MinistryRow
                  ministry={ministry}
                  colors={colors}
                  accentColor={modeColors.primary}
                  onPress={() => handleMinistryPress(ministry.id)}
                />
                {index < Math.min(MINISTRIES.length, 5) - 1 && (
                  <View style={[styles.ministryDivider, { backgroundColor: colors.divider }]} />
                )}
              </React.Fragment>
            ))}
            {MINISTRIES.length > 5 && (
              <Pressable
                style={({ pressed }) => [
                  styles.viewAllRow,
                  pressed && { backgroundColor: colors.backgroundSecondary },
                ]}
                onPress={handleMinistriesPress}
              >
                <ThemedText style={[styles.viewAllText, { color: modeColors.primary }]}>
                  View All Ministries
                </ThemedText>
                <IconSymbol name="chevron.right" size={14} color={modeColors.primary} />
              </Pressable>
            )}
          </View>

          {/* Leadership */}
          <SectionHeader title="Leadership" colors={colors} />
          <View style={[styles.leadershipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {CHURCH_LEADERSHIP.slice(0, 3).map((leader, index) => (
              <React.Fragment key={leader.id}>
                <View style={styles.leadershipRow}>
                  <View style={[styles.leadershipAvatar, { backgroundColor: colors.backgroundTertiary }]}>
                    <IconSymbol name="person.fill" size={20} color={colors.textTertiary} />
                  </View>
                  <View style={styles.leadershipInfo}>
                    <ThemedText style={styles.leadershipName}>{leader.name}</ThemedText>
                    <ThemedText style={[styles.leadershipTitle, { color: colors.textSecondary }]}>
                      {leader.title}
                    </ThemedText>
                  </View>
                </View>
                {index < Math.min(CHURCH_LEADERSHIP.length, 3) - 1 && (
                  <View style={[styles.leadershipDivider, { backgroundColor: colors.divider }]} />
                )}
              </React.Fragment>
            ))}
          </View>

          {/* About */}
          <SectionHeader title="About" colors={colors} />
          <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[styles.aboutText, { color: colors.textSecondary }]}>
              {ICC_ORGANIZATION.description}
            </ThemedText>
          </View>
        </ScrollView>

        {/* Page 1: People */}
        <View key="people" style={{ flex: 1 }}>
          <OrgPeopleTab mode="church" colors={colors} accentColor={modeColors.primary} />
        </View>

        {/* Page 2: Operations */}
        <View key="operations" style={{ flex: 1 }}>
          <OrgOperationsTab mode="church" colors={colors} accentColor={modeColors.primary} />
        </View>

        {/* Page 3: Finance */}
        <View key="finance" style={{ flex: 1 }}>
          <OrgFinanceTab mode="church" colors={colors} accentColor={modeColors.primary} />
        </View>

        {/* Page 4: Payment Rails */}
        <View key="payment-rails" style={{ flex: 1 }}>
          <TabPlaceholderPage title="Payment Rails" />
        </View>

        {/* Page 5: Compliance */}
        <View key="compliance" style={{ flex: 1 }}>
          <TabPlaceholderPage title="Compliance" />
        </View>

        {/* Page 6: Facilities */}
        <View key="facilities" style={{ flex: 1 }}>
          <TabPlaceholderPage title="Facilities" />
        </View>

        {/* Page 7: Resources */}
        <View key="resources" style={{ flex: 1 }}>
          <TabPlaceholderPage title="Resources" />
        </View>

        {/* Page 8: Policies */}
        <View key="policies" style={{ flex: 1 }}>
          <TabPlaceholderPage title="Policies" />
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
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const modeColors = ModeColors.education;
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const currentTerm = getCurrentTerm();
  const upcomingEvents = getUpcomingEvents(4);

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  const handleSchedulePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/organization/schedule');
  };

  const handleResultsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/organization/results');
  };

  const handleMetricsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/organization/metrics');
  };

  const handleLeadershipPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/organization/leadership');
  };

  const handleArchivePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/organization/archive');
  };

  const handleFacultyPress = (facultyId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/organization/members/${facultyId}`);
  };

  const handleTermPress = (termId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/organization/events/${termId}`);
  };

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
          {/* Page 0: Schools (existing content) */}
          <ScrollView key="schools" nestedScrollEnabled showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Institution Header */}
          <View style={styles.institutionHeader}>
            <View style={[styles.institutionBadge, { backgroundColor: modeColors.primary }]}>
              <IconSymbol name="graduationcap.fill" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.institutionInfo}>
              <ThemedText style={styles.institutionName}>{SDCC_ORGANIZATION.name}</ThemedText>
              <ThemedText style={[styles.institutionDetails, { color: colors.textSecondary }]}>
                {SDCC_ORGANIZATION.institutionType}
              </ThemedText>
              <ThemedText style={[styles.institutionLocation, { color: colors.textTertiary }]}>
                {SDCC_ORGANIZATION.location} • Est. {SDCC_ORGANIZATION.founded}
              </ThemedText>
            </View>
          </View>

          {/* Key Metrics */}
          <View style={styles.metricsGrid}>
            <MetricCard
              label="Enrollment"
              value={INSTITUTIONAL_METRICS.enrollment.total.toString()}
              subValue={`+${INSTITUTIONAL_METRICS.enrollment.yearOverYearChange}% YoY`}
              colors={colors}
              accentColor={modeColors.primary}
            />
            <MetricCard
              label="Programs"
              value={INSTITUTIONAL_METRICS.academics.programs.toString()}
              colors={colors}
              accentColor={modeColors.primary}
            />
            <MetricCard
              label="Faculty"
              value={INSTITUTIONAL_METRICS.academics.facultyCount.toString()}
              subValue={INSTITUTIONAL_METRICS.academics.studentFacultyRatio}
              colors={colors}
              accentColor={modeColors.primary}
            />
            <MetricCard
              label="Grad Rate"
              value={`${INSTITUTIONAL_METRICS.outcomes.graduationRate}%`}
              colors={colors}
              accentColor={modeColors.primary}
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickLinksGrid}>
            <Pressable
              style={({ pressed }) => [
                styles.quickLinkCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleSchedulePress}
            >
              <IconSymbol name="calendar" size={24} color={modeColors.primary} />
              <ThemedText style={styles.quickLinkTitle}>Schedule</ThemedText>
              <ThemedText style={[styles.quickLinkSubtitle, { color: colors.textSecondary }]}>
                Academic calendar
              </ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.quickLinkCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleResultsPress}
            >
              <IconSymbol name="checkmark.circle.fill" size={24} color={modeColors.primary} />
              <ThemedText style={styles.quickLinkTitle}>Results</ThemedText>
              <ThemedText style={[styles.quickLinkSubtitle, { color: colors.textSecondary }]}>
                Completed terms
              </ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.quickLinkCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleMetricsPress}
            >
              <IconSymbol name="chart.bar.fill" size={24} color={modeColors.primary} />
              <ThemedText style={styles.quickLinkTitle}>Metrics</ThemedText>
              <ThemedText style={[styles.quickLinkSubtitle, { color: colors.textSecondary }]}>
                Institutional data
              </ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.quickLinkCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleArchivePress}
            >
              <IconSymbol name="archivebox.fill" size={24} color={modeColors.primary} />
              <ThemedText style={styles.quickLinkTitle}>Archive</ThemedText>
              <ThemedText style={[styles.quickLinkSubtitle, { color: colors.textSecondary }]}>
                Past years
              </ThemedText>
            </Pressable>
          </View>

          {/* Current Term */}
          {currentTerm && (
            <>
              <SectionHeader title="Current Term" colors={colors} />
              <TermCard
                term={currentTerm}
                colors={colors}
                accentColor={modeColors.primary}
                isCurrent={true}
                onPress={() => handleTermPress(currentTerm.id)}
              />
            </>
          )}

          {/* Upcoming Events */}
          <SectionHeader title="Upcoming" colors={colors} />
          <View style={[styles.calendarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {upcomingEvents.map((event, index) => (
              <React.Fragment key={event.id}>
                <CalendarEventRow event={event} colors={colors} accentColor={modeColors.primary} />
                {index < upcomingEvents.length - 1 && (
                  <View style={[styles.calendarDivider, { backgroundColor: colors.divider }]} />
                )}
              </React.Fragment>
            ))}
            <Pressable
              style={({ pressed }) => [
                styles.viewAllRow,
                pressed && { backgroundColor: colors.backgroundSecondary },
              ]}
              onPress={handleSchedulePress}
            >
              <ThemedText style={[styles.viewAllText, { color: modeColors.primary }]}>
                View Full Calendar
              </ThemedText>
              <IconSymbol name="chevron.right" size={14} color={modeColors.primary} />
            </Pressable>
          </View>

          {/* Departments */}
          <SectionHeader title="Academic Departments" colors={colors} />
          <View style={styles.departmentsGrid}>
            {DEPARTMENTS.slice(0, 4).map((dept) => (
              <DepartmentCard
                key={dept.id}
                department={dept}
                colors={colors}
                accentColor={modeColors.primary}
              />
            ))}
          </View>

          {/* Leadership */}
          <SectionHeader title="Leadership" colors={colors} />
          <View style={[styles.leadershipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {FACULTY_LEADERSHIP.slice(0, 4).map((faculty, index) => (
              <React.Fragment key={faculty.id}>
                <FacultyRow
                  faculty={faculty}
                  colors={colors}
                  onPress={() => handleFacultyPress(faculty.id)}
                />
                {index < Math.min(FACULTY_LEADERSHIP.length, 4) - 1 && (
                  <View style={[styles.leadershipDivider, { backgroundColor: colors.divider }]} />
                )}
              </React.Fragment>
            ))}
            <Pressable
              style={({ pressed }) => [
                styles.viewAllRow,
                pressed && { backgroundColor: colors.backgroundSecondary },
              ]}
              onPress={handleLeadershipPress}
            >
              <ThemedText style={[styles.viewAllText, { color: modeColors.primary }]}>
                View All Leadership
              </ThemedText>
              <IconSymbol name="chevron.right" size={14} color={modeColors.primary} />
            </Pressable>
          </View>

          {/* About */}
          <SectionHeader title="About" colors={colors} />
          <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[styles.aboutText, { color: colors.textSecondary }]}>
              {SDCC_ORGANIZATION.description}
            </ThemedText>
            <View style={[styles.aboutDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.aboutMeta}>
              <View style={styles.aboutMetaItem}>
                <ThemedText style={[styles.aboutMetaLabel, { color: colors.textTertiary }]}>
                  Accreditation
                </ThemedText>
                <ThemedText style={styles.aboutMetaValue}>{SDCC_ORGANIZATION.accreditation}</ThemedText>
              </View>
              <View style={styles.aboutMetaItem}>
                <ThemedText style={[styles.aboutMetaLabel, { color: colors.textTertiary }]}>
                  Formats
                </ThemedText>
                <ThemedText style={styles.aboutMetaValue}>
                  {SDCC_ORGANIZATION.programFormats?.join(', ')}
                </ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Page 1: People */}
        <View key="people" style={{ flex: 1 }}>
          <OrgPeopleTab mode="education" colors={colors} accentColor={modeColors.primary} />
        </View>

        {/* Page 2: Operations */}
        <View key="operations" style={{ flex: 1 }}>
          <OrgOperationsTab mode="education" colors={colors} accentColor={modeColors.primary} />
        </View>

        {/* Page 3: Finance */}
        <View key="finance" style={{ flex: 1 }}>
          <OrgFinanceTab mode="education" colors={colors} accentColor={modeColors.primary} />
        </View>

        {/* Page 4: Payment Rails */}
        <View key="payment-rails" style={{ flex: 1 }}>
          <TabPlaceholderPage title="Payment Rails" />
        </View>

        {/* Page 5: Compliance */}
        <View key="compliance" style={{ flex: 1 }}>
          <TabPlaceholderPage title="Compliance" />
        </View>

        {/* Page 6: Facilities */}
        <View key="facilities" style={{ flex: 1 }}>
          <TabPlaceholderPage title="Facilities" />
        </View>

        {/* Page 7: Resources */}
        <View key="resources" style={{ flex: 1 }}>
          <TabPlaceholderPage title="Resources" />
        </View>

        {/* Page 8: Policies */}
        <View key="policies" style={{ flex: 1 }}>
          <TabPlaceholderPage title="Policies" />
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
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  return (
    <>
      <PagedTabBar tabs={ORG_TABS.community} activeIndex={activeIndex} onTabPress={handleTabPress} />
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={ORG_TABS.community.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {/* Page 0: Series (existing content) */}
          <ScrollView key="series" nestedScrollEnabled showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.institutionHeader}>
              <View style={[styles.institutionBadge, { backgroundColor: '#EF4444' }]}>
                <IconSymbol name="flag.checkered" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.institutionInfo}>
                <ThemedText style={styles.institutionName}>K-1 Competition</ThemedText>
                <ThemedText style={[styles.institutionDetails, { color: colors.textSecondary }]}>
                  Racing League
                </ThemedText>
                <ThemedText style={[styles.institutionLocation, { color: colors.textTertiary }]}>
                  Season 1 · 2026
                </ThemedText>
              </View>
            </View>

            {/* Payment Rails */}
            <RailsSection />
          </ScrollView>

          {/* Page 1: People */}
          <View key="people" style={{ flex: 1 }}>
            <OrgPeopleTab mode="community" colors={colors} accentColor={ModeColors.community.primary} />
          </View>

          {/* Page 2: Operations */}
          <View key="operations" style={{ flex: 1 }}>
            <OrgOperationsTab mode="community" colors={colors} accentColor={ModeColors.community.primary} />
          </View>

          {/* Page 3: Finance */}
          <View key="finance" style={{ flex: 1 }}>
            <OrgFinanceTab mode="community" colors={colors} accentColor={ModeColors.community.primary} />
          </View>

          {/* Page 4: Payment Rails */}
          <View key="payment-rails" style={{ flex: 1 }}>
            <TabPlaceholderPage title="Payment Rails" />
          </View>

          {/* Page 5: Rules */}
          <View key="rules" style={{ flex: 1 }}>
            <TabPlaceholderPage title="Rules" />
          </View>

          {/* Page 6: Compliance */}
          <View key="compliance" style={{ flex: 1 }}>
            <TabPlaceholderPage title="Compliance" />
          </View>

          {/* Page 7: Venues */}
          <View key="venues" style={{ flex: 1 }}>
            <TabPlaceholderPage title="Venues" />
          </View>

          {/* Page 8: Sponsors */}
          <View key="sponsors" style={{ flex: 1 }}>
            <TabPlaceholderPage title="Sponsors" />
          </View>
        </PagerView>
      </EdgeHoldAdvance>
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
      case 'enterprise':
        return <EnterpriseOrganization />;
      case 'church':
        return <ChurchOrganization />;
      case 'education':
        return <EducationOrganization />;
      case 'community':
        return <CommunityOrganization />;
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

  // Enterprise Metrics
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
