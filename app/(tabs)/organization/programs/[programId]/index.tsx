/**
 * Program Home (Team Page)
 * Displays program details including roster, schedule, staff, and media navigation.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, SymbolViewProps } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useAppContext } from '@/context/app-context';
import {
  getProgramById,
  getLastGame,
  getNextGame,
  formatRecord,
  formatGameDate,
  formatGameResult,
  getProgramLevelLabel,
  INSTITUTION,
  type ProgramData,
  type Game,
  type Staff,
} from '@/data/mock-sports';

// =============================================================================
// COMPONENTS
// =============================================================================

interface BackButtonProps {
  onPress: () => void;
  colors: typeof Colors.light;
}

function BackButton({ onPress, colors }: BackButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.backButton,
        pressed && { opacity: 0.7 },
      ]}
      onPress={onPress}
    >
      <IconSymbol name="chevron.left" size={20} color={accent} />
      <ThemedText style={[styles.backButtonText, { color: accent }]}>
        Back
      </ThemedText>
    </Pressable>
  );
}

interface GameCardProps {
  game: Game;
  label: string;
  colors: typeof Colors.light;
  accentColor: string;
}

function GameCard({ game, label, colors, accentColor }: GameCardProps) {
  const isResult = game.status === 'final';
  const isWin = game.result?.isWin;

  return (
    <View style={[styles.gameCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.gameCardLabel, { color: colors.textTertiary }]}>
        {label}
      </ThemedText>
      <View style={styles.gameCardContent}>
        <View style={styles.gameCardMain}>
          <ThemedText style={styles.gameCardOpponent}>
            {game.venue === 'away' ? '@ ' : game.venue === 'home' ? 'vs ' : ''}
            {game.opponent}
          </ThemedText>
          <ThemedText style={[styles.gameCardDate, { color: colors.textSecondary }]}>
            {formatGameDate(game.date)} • {game.time}
          </ThemedText>
        </View>
        {isResult && game.result && (
          <View
            style={[
              styles.gameCardResult,
              { backgroundColor: isWin ? Colors.light.success : Colors.light.error },
            ]}
          >
            <ThemedText style={styles.gameCardResultText}>
              {formatGameResult(game)}
            </ThemedText>
          </View>
        )}
        {!isResult && (
          <View style={[styles.gameCardVenue, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[styles.gameCardVenueText, { color: colors.textSecondary }]}>
              {game.venue.charAt(0).toUpperCase() + game.venue.slice(1)}
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

interface NavSectionProps {
  icon: SymbolViewProps['name'];
  title: string;
  subtitle: string;
  onPress: () => void;
  colors: typeof Colors.light;
  accentColor: string;
}

function NavSection({ icon, title, subtitle, onPress, colors, accentColor }: NavSectionProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.navSection,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.navIconContainer, { backgroundColor: accentColor + '15' }]}>
        <IconSymbol name={icon} size={22} color={accentColor} />
      </View>
      <View style={styles.navContent}>
        <ThemedText style={styles.navTitle}>{title}</ThemedText>
        <ThemedText style={[styles.navSubtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

interface StaffRowProps {
  staff: Staff;
  colors: typeof Colors.light;
}

function StaffRow({ staff, colors }: StaffRowProps) {
  return (
    <View style={styles.staffRow}>
      <View style={[styles.staffAvatar, { backgroundColor: colors.backgroundTertiary }]}>
        <IconSymbol name="person.fill" size={16} color={colors.textTertiary} />
      </View>
      <View style={styles.staffInfo}>
        <ThemedText style={styles.staffName}>{staff.name}</ThemedText>
        <ThemedText style={[styles.staffTitle, { color: colors.textSecondary }]}>
          {staff.title}
        </ThemedText>
      </View>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ProgramHomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAppContext();
  const { programId } = useLocalSearchParams<{ programId: string }>();

  const modeColors = ModeColors.sports;
  const program = getProgramById(programId);

  if (!program) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} colors={colors} />
        </View>
        <View style={styles.errorState}>
          <ThemedText style={[styles.errorText, { color: colors.textSecondary }]}>
            Program not found
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const lastGame = getLastGame(programId);
  const nextGame = getNextGame(programId);

  const handleNavPress = (section: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (section) {
      case 'roster':
        router.push(`/organization/programs/${programId}/roster`);
        break;
      case 'staff':
        router.push(`/organization/programs/${programId}/staff`);
        break;
      case 'schedule':
        router.push(`/organization/programs/${programId}/schedule`);
        break;
      case 'media':
        router.push(`/organization/programs/${programId}/media`);
        break;
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} colors={colors} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Program Header */}
        <View style={styles.programHeader}>
          <View style={[styles.programBadge, { backgroundColor: modeColors.primary }]}>
            <ThemedText style={styles.programBadgeText}>
              {program.name.charAt(0)}
            </ThemedText>
          </View>
          <View style={styles.programInfo}>
            <ThemedText style={styles.programName}>{program.name}</ThemedText>
            <ThemedText style={[styles.programDetails, { color: colors.textSecondary }]}>
              {INSTITUTION.nickname} {program.sport}
            </ThemedText>
            <View style={[styles.levelBadge, { backgroundColor: modeColors.primary + '20' }]}>
              <ThemedText style={[styles.levelBadgeText, { color: modeColors.primary }]}>
                {getProgramLevelLabel(program.level)}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Program Snapshot */}
        <View style={[styles.snapshotCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.snapshotRow}>
            <View style={styles.snapshotItem}>
              <ThemedText style={[styles.snapshotValue, { color: modeColors.primary }]}>
                {formatRecord(program.record.overall)}
              </ThemedText>
              <ThemedText style={[styles.snapshotLabel, { color: colors.textTertiary }]}>
                Overall
              </ThemedText>
            </View>
            <View style={[styles.snapshotDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.snapshotItem}>
              <ThemedText style={[styles.snapshotValue, { color: modeColors.primary }]}>
                {formatRecord(program.record.conference)}
              </ThemedText>
              <ThemedText style={[styles.snapshotLabel, { color: colors.textTertiary }]}>
                Conference
              </ThemedText>
            </View>
            <View style={[styles.snapshotDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.snapshotItem}>
              <ThemedText style={[styles.snapshotValue, { color: modeColors.primary }]}>
                {program.record.streak}
              </ThemedText>
              <ThemedText style={[styles.snapshotLabel, { color: colors.textTertiary }]}>
                Streak
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Last/Next Games */}
        <View style={styles.gamesRow}>
          {lastGame && (
            <View style={styles.gameCardWrapper}>
              <GameCard
                game={lastGame}
                label="Last Game"
                colors={colors}
                accentColor={modeColors.primary}
              />
            </View>
          )}
          {nextGame && (
            <View style={styles.gameCardWrapper}>
              <GameCard
                game={nextGame}
                label="Next Game"
                colors={colors}
                accentColor={modeColors.primary}
              />
            </View>
          )}
        </View>

        {/* Navigation Sections */}
        <View style={styles.navSections}>
          <NavSection
            icon="person.3.fill"
            title="Roster"
            subtitle={`${program.roster.length} players`}
            onPress={() => handleNavPress('roster')}
            colors={colors}
            accentColor={modeColors.primary}
          />
          <NavSection
            icon="calendar"
            title="Schedule"
            subtitle={`${program.schedule.length} games`}
            onPress={() => handleNavPress('schedule')}
            colors={colors}
            accentColor={modeColors.primary}
          />
          <NavSection
            icon="person.badge.shield.checkmark.fill"
            title="Staff"
            subtitle={`${program.staff.length} coaches`}
            onPress={() => handleNavPress('staff')}
            colors={colors}
            accentColor={modeColors.primary}
          />
          <NavSection
            icon="play.rectangle.fill"
            title="Media"
            subtitle="Highlights & clips"
            onPress={() => handleNavPress('media')}
            colors={colors}
            accentColor={modeColors.primary}
          />
        </View>

        {/* Staff Preview */}
        {program.staff.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                Coaching Staff
              </ThemedText>
            </View>
            <View style={[styles.staffCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {program.staff.slice(0, 3).map((staff, index) => (
                <React.Fragment key={staff.id}>
                  <StaffRow staff={staff} colors={colors} />
                  {index < Math.min(program.staff.length, 3) - 1 && (
                    <View style={[styles.staffDivider, { backgroundColor: colors.divider }]} />
                  )}
                </React.Fragment>
              ))}
              {program.staff.length > 3 && (
                <Pressable
                  style={styles.viewAllButton}
                  onPress={() => handleNavPress('staff')}
                >
                  <ThemedText style={[styles.viewAllText, { color: modeColors.primary }]}>
                    View all {program.staff.length} staff
                  </ThemedText>
                </Pressable>
              )}
            </View>
          </>
        )}

        {/* Program Description */}
        {program.description && (
          <>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                About
              </ThemedText>
            </View>
            <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[styles.aboutText, { color: colors.textSecondary }]}>
                {program.description}
              </ThemedText>
            </View>
          </>
        )}
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
    paddingVertical: Spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
  },

  // Program Header
  programHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  programBadge: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  programBadgeText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  programInfo: {
    flex: 1,
  },
  programName: {
    fontSize: 24,
    fontWeight: '700',
  },
  programDetails: {
    fontSize: 15,
    marginTop: 2,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Snapshot Card
  snapshotCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
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
    fontSize: 20,
    fontWeight: '700',
  },
  snapshotLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  snapshotDivider: {
    width: 1,
    height: 36,
  },

  // Games
  gamesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  gameCardWrapper: {
    flex: 1,
  },
  gameCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  gameCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  gameCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gameCardMain: {
    flex: 1,
  },
  gameCardOpponent: {
    fontSize: 14,
    fontWeight: '600',
  },
  gameCardDate: {
    fontSize: 12,
    marginTop: 2,
  },
  gameCardResult: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  gameCardResultText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  gameCardVenue: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  gameCardVenueText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Nav Sections
  navSections: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  navSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  navIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  navContent: {
    flex: 1,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  navSubtitle: {
    fontSize: 13,
    marginTop: 1,
  },

  // Section Header
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Staff
  staffCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  staffAvatar: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 15,
    fontWeight: '500',
  },
  staffTitle: {
    fontSize: 13,
    marginTop: 1,
  },
  staffDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md + 36 + Spacing.sm,
  },
  viewAllButton: {
    padding: Spacing.md,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#9C9790',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // About
  aboutCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
