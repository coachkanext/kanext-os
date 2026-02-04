/**
 * Organization Screen - Institution Overview
 * Universal operational surface - mode-specific truth view.
 * Per spec: Organization reflects "what is" - it never reasons, simulates, or decides.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext, useMode } from '@/context/app-context';
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
  KANEXT_ORGANIZATION,
  BOARD_MEMBERS,
  LEADERSHIP_TEAM,
  DOMAINS,
  COMPANY_METRICS,
  formatCurrency,
  getDomainStatusColor,
} from '@/data/mock-enterprise';
import {
  ICC_ORGANIZATION,
  CAMPUSES,
  MINISTRIES,
  CHURCH_LEADERSHIP,
  formatServiceTime,
} from '@/data/mock-church';
import type { BoardMember, Domain, Campus, Ministry, ServiceTime } from '@/types';

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
// SPORTS MODE CONTENT
// =============================================================================

function SportsOrganization() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const modeColors = ModeColors.sports;

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
    </>
  );
}

// =============================================================================
// ENTERPRISE MODE COMPONENTS
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

interface DomainCardProps {
  domain: Domain;
  colors: typeof Colors.light;
  accentColor: string;
}

function DomainCard({ domain, colors, accentColor }: DomainCardProps) {
  const statusColor = getDomainStatusColor(domain.status);

  return (
    <View style={[styles.domainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.domainHeader}>
        <View style={[styles.domainIcon, { backgroundColor: accentColor + '15' }]}>
          <IconSymbol name={domain.icon as any} size={20} color={accentColor} />
        </View>
        <View style={styles.domainInfo}>
          <ThemedText style={styles.domainName}>{domain.name}</ThemedText>
          <View style={styles.domainStatusRow}>
            <View style={[styles.domainStatusDot, { backgroundColor: statusColor }]} />
            <ThemedText style={[styles.domainStatus, { color: colors.textSecondary }]}>
              {domain.status.charAt(0).toUpperCase() + domain.status.slice(1)}
            </ThemedText>
          </View>
        </View>
      </View>
      <ThemedText style={[styles.domainDesc, { color: colors.textSecondary }]} numberOfLines={2}>
        {domain.description}
      </ThemedText>
    </View>
  );
}

interface EnterpriseMemberRowProps {
  member: BoardMember;
  colors: typeof Colors.light;
}

function EnterpriseMemberRow({ member, colors }: EnterpriseMemberRowProps) {
  return (
    <View style={styles.leadershipRow}>
      <View style={[styles.leadershipAvatar, { backgroundColor: colors.backgroundTertiary }]}>
        <IconSymbol name="person.fill" size={20} color={colors.textTertiary} />
      </View>
      <View style={styles.leadershipInfo}>
        <ThemedText style={styles.leadershipName}>{member.name}</ThemedText>
        <ThemedText style={[styles.leadershipTitle, { color: colors.textSecondary }]}>
          {member.role}
          {member.company && member.company !== 'KaNeXT' ? ` • ${member.company}` : ''}
        </ThemedText>
      </View>
    </View>
  );
}

// =============================================================================
// ENTERPRISE MODE CONTENT
// =============================================================================

function EnterpriseOrganization() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const modeColors = ModeColors.enterprise;

  const handleDocumentsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/organization/documents');
  };

  const handleGovernancePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/organization/governance');
  };

  const handleDomainsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/organization/domains');
  };

  return (
    <>
      {/* Company Header */}
      <View style={styles.institutionHeader}>
        <View style={[styles.institutionBadge, { backgroundColor: modeColors.primary }]}>
          <ThemedText style={styles.institutionBadgeText}>K</ThemedText>
        </View>
        <View style={styles.institutionInfo}>
          <ThemedText style={styles.institutionName}>{KANEXT_ORGANIZATION.name}</ThemedText>
          <ThemedText style={[styles.institutionDetails, { color: colors.textSecondary }]}>
            {KANEXT_ORGANIZATION.type}
          </ThemedText>
          <ThemedText style={[styles.institutionLocation, { color: colors.textTertiary }]}>
            {KANEXT_ORGANIZATION.location} • {KANEXT_ORGANIZATION.legalStructure}
          </ThemedText>
        </View>
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <MetricCard
          label="MRR"
          value={formatCurrency(COMPANY_METRICS.mrr)}
          subValue={`+${COMPANY_METRICS.mrrGrowth}% MoM`}
          colors={colors}
          accentColor={modeColors.primary}
        />
        <MetricCard
          label="Customers"
          value={COMPANY_METRICS.customers.toString()}
          subValue={`${COMPANY_METRICS.pilots} pilots`}
          colors={colors}
          accentColor={modeColors.primary}
        />
        <MetricCard
          label="Runway"
          value={`${COMPANY_METRICS.runway}mo`}
          colors={colors}
          accentColor={modeColors.primary}
        />
        <MetricCard
          label="Team"
          value={COMPANY_METRICS.teamSize.toString()}
          colors={colors}
          accentColor={modeColors.primary}
        />
      </View>

      {/* Quick Links */}
      <SectionHeader title="Data Room" colors={colors} />
      <View style={styles.quickLinksGrid}>
        <Pressable
          style={({ pressed }) => [
            styles.quickLinkCard,
            { backgroundColor: colors.card, borderColor: colors.border },
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleDocumentsPress}
        >
          <IconSymbol name="doc.fill" size={24} color={modeColors.primary} />
          <ThemedText style={styles.quickLinkTitle}>Documents</ThemedText>
          <ThemedText style={[styles.quickLinkSubtitle, { color: colors.textSecondary }]}>
            Investor materials
          </ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.quickLinkCard,
            { backgroundColor: colors.card, borderColor: colors.border },
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleGovernancePress}
        >
          <IconSymbol name="person.3.fill" size={24} color={modeColors.primary} />
          <ThemedText style={styles.quickLinkTitle}>Governance</ThemedText>
          <ThemedText style={[styles.quickLinkSubtitle, { color: colors.textSecondary }]}>
            Board & advisors
          </ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.quickLinkCard,
            { backgroundColor: colors.card, borderColor: colors.border },
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleDomainsPress}
        >
          <IconSymbol name="square.grid.2x2.fill" size={24} color={modeColors.primary} />
          <ThemedText style={styles.quickLinkTitle}>Domains</ThemedText>
          <ThemedText style={[styles.quickLinkSubtitle, { color: colors.textSecondary }]}>
            Product verticals
          </ThemedText>
        </Pressable>
      </View>

      {/* Domains Preview */}
      <SectionHeader title="Product Domains" colors={colors} />
      <View style={styles.domainsGrid}>
        {DOMAINS.slice(0, 2).map((domain) => (
          <DomainCard
            key={domain.id}
            domain={domain}
            colors={colors}
            accentColor={modeColors.primary}
          />
        ))}
      </View>

      {/* Leadership */}
      <SectionHeader title="Leadership" colors={colors} />
      <View style={[styles.leadershipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {LEADERSHIP_TEAM.map((member, index) => (
          <React.Fragment key={member.id}>
            <EnterpriseMemberRow member={member} colors={colors} />
            {index < LEADERSHIP_TEAM.length - 1 && (
              <View style={[styles.leadershipDivider, { backgroundColor: colors.divider }]} />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* About */}
      <SectionHeader title="About" colors={colors} />
      <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.aboutText, { color: colors.textSecondary }]}>
          {KANEXT_ORGANIZATION.description}
        </ThemedText>
        <View style={[styles.aboutDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.aboutMeta}>
          <View style={styles.aboutMetaItem}>
            <ThemedText style={[styles.aboutMetaLabel, { color: colors.textTertiary }]}>
              Status
            </ThemedText>
            <ThemedText style={styles.aboutMetaValue}>{KANEXT_ORGANIZATION.status}</ThemedText>
          </View>
          <View style={styles.aboutMetaItem}>
            <ThemedText style={[styles.aboutMetaLabel, { color: colors.textTertiary }]}>
              Raised
            </ThemedText>
            <ThemedText style={styles.aboutMetaValue}>
              {formatCurrency(COMPANY_METRICS.raised)}
            </ThemedText>
          </View>
        </View>
      </View>
    </>
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
// CHURCH MODE CONTENT
// =============================================================================

function ChurchOrganization() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const modeColors = ModeColors.church;

  const handleCampusPress = (campusId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/organization/campuses/${campusId}`);
  };

  const handleCampusesPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/organization/campuses');
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
    </>
  );
}

// =============================================================================
// PLACEHOLDER CONTENT FOR OTHER MODES
// =============================================================================

function PlaceholderContent({ modeName }: { modeName: string }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.placeholder}>
      <IconSymbol
        name="building.2"
        size={48}
        color={colors.textTertiary}
        style={styles.placeholderIcon}
      />
      <ThemedText style={[styles.placeholderText, { color: colors.textTertiary }]}>
        {modeName} organization content coming soon.
      </ThemedText>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function OrganizationScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { state } = useAppContext();
  const mode = useMode();

  const getOrganizationTitle = () => {
    if (state.organization) {
      return state.organization.name;
    }
    switch (state.mode) {
      case 'sports':
        return 'Lincoln University';
      case 'enterprise':
        return 'KaNeXT';
      case 'church':
        return 'International Christian Center';
      case 'education':
        return 'San Diego Christian College';
      default:
        return 'Organization';
    }
  };

  const renderModeContent = () => {
    switch (mode) {
      case 'sports':
        return <SportsOrganization />;
      case 'enterprise':
        return <EnterpriseOrganization />;
      case 'church':
        return <ChurchOrganization />;
      case 'education':
        return <PlaceholderContent modeName="Education" />;
      default:
        return <PlaceholderContent modeName="Organization" />;
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          {getOrganizationTitle()}
        </ThemedText>
        {state.cycle && (
          <ThemedText style={[styles.cycleLabel, { color: colors.textSecondary }]}>
            {state.cycle.name}
          </ThemedText>
        )}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderModeContent()}
      </ScrollView>
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
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  cycleLabel: {
    fontSize: 15,
    marginTop: Spacing.xs,
  },
  scrollView: {
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

  // Quick Links
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

  // Domains
  domainsGrid: {
    gap: Spacing.sm,
  },
  domainCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  domainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  domainIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  domainInfo: {
    flex: 1,
  },
  domainName: {
    fontSize: 15,
    fontWeight: '600',
  },
  domainStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  domainStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  domainStatus: {
    fontSize: 12,
  },
  domainDesc: {
    fontSize: 13,
    lineHeight: 18,
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

  // Placeholder
  placeholder: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  placeholderIcon: {
    marginBottom: Spacing.md,
    opacity: 0.5,
  },
  placeholderText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
