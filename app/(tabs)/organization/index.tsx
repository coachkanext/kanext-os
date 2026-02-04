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
        return <PlaceholderContent modeName="Enterprise" />;
      case 'church':
        return <PlaceholderContent modeName="Church" />;
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
