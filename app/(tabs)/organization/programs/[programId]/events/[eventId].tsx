/**
 * Event Detail Page
 * Game details including score, venue, and status.
 * Day 7 will add box scores and detailed stats.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getProgramById,
  formatGameDate,
  INSTITUTION,
  type Game,
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
      style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <IconSymbol name="chevron.left" size={20} color={colors.tint} />
      <ThemedText style={[styles.backButtonText, { color: colors.tint }]}>
        Schedule
      </ThemedText>
    </Pressable>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function EventDetailScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { programId, eventId } = useLocalSearchParams<{
    programId: string;
    eventId: string;
  }>();

  const modeColors = ModeColors.sports;
  const program = getProgramById(programId);
  const game = program?.schedule.find((g) => g.id === eventId);

  if (!game) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} colors={colors} />
        </View>
        <View style={styles.errorState}>
          <ThemedText style={[styles.errorText, { color: colors.textSecondary }]}>
            Game not found
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const isCompleted = game.status === 'final';
  const isWin = game.result?.isWin;
  const isHome = game.venue === 'home';

  const getStatusColor = () => {
    if (!isCompleted) return modeColors.primary;
    return isWin ? Colors.light.success : Colors.light.error;
  };

  const getStatusText = () => {
    if (game.status === 'live') return 'LIVE';
    if (isCompleted) return 'FINAL';
    return 'UPCOMING';
  };

  const getScoreDisplay = () => {
    if (!game.result) return null;
    const { homeScore, awayScore } = game.result;

    if (isHome) {
      return {
        teamScore: homeScore,
        opponentScore: awayScore,
      };
    }
    return {
      teamScore: awayScore,
      opponentScore: homeScore,
    };
  };

  const score = getScoreDisplay();

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
        {/* Game Header */}
        <View style={[styles.gameHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <ThemedText style={styles.statusText}>{getStatusText()}</ThemedText>
          </View>

          {/* Matchup */}
          <View style={styles.matchup}>
            {/* Team */}
            <View style={styles.teamContainer}>
              <View style={[styles.teamLogo, { backgroundColor: modeColors.primary }]}>
                <ThemedText style={styles.teamLogoText}>
                  {INSTITUTION.nickname.charAt(0)}
                </ThemedText>
              </View>
              <ThemedText style={styles.teamName} numberOfLines={1}>
                {INSTITUTION.nickname}
              </ThemedText>
              {isCompleted && score && (
                <ThemedText
                  style={[
                    styles.teamScore,
                    { color: isWin ? Colors.light.success : colors.text },
                  ]}
                >
                  {score.teamScore}
                </ThemedText>
              )}
            </View>

            {/* VS / @ */}
            <View style={styles.vsContainer}>
              <ThemedText style={[styles.vsText, { color: colors.textTertiary }]}>
                {isHome ? 'vs' : '@'}
              </ThemedText>
            </View>

            {/* Opponent */}
            <View style={styles.teamContainer}>
              <View style={[styles.teamLogo, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[styles.teamLogoText, { color: colors.textSecondary }]}>
                  {game.opponent.charAt(0)}
                </ThemedText>
              </View>
              <ThemedText style={styles.teamName} numberOfLines={1}>
                {game.opponent}
              </ThemedText>
              {isCompleted && score && (
                <ThemedText
                  style={[
                    styles.teamScore,
                    { color: !isWin ? Colors.light.error : colors.text },
                  ]}
                >
                  {score.opponentScore}
                </ThemedText>
              )}
            </View>
          </View>

          {/* Date & Time */}
          <View style={styles.dateTimeContainer}>
            <ThemedText style={[styles.dateText, { color: colors.text }]}>
              {formatGameDate(game.date)}
            </ThemedText>
            <ThemedText style={[styles.timeText, { color: colors.textSecondary }]}>
              {game.time}
            </ThemedText>
          </View>
        </View>

        {/* Game Info */}
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Game Info
          </ThemedText>
        </View>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: colors.backgroundTertiary }]}>
              <IconSymbol name="mappin" size={16} color={modeColors.primary} />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={[styles.infoLabel, { color: colors.textTertiary }]}>
                Location
              </ThemedText>
              <ThemedText style={styles.infoValue}>{game.location}</ThemedText>
            </View>
          </View>

          <View style={[styles.infoDivider, { backgroundColor: colors.divider }]} />

          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: colors.backgroundTertiary }]}>
              <IconSymbol name="building.2" size={16} color={modeColors.primary} />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={[styles.infoLabel, { color: colors.textTertiary }]}>
                Venue Type
              </ThemedText>
              <ThemedText style={styles.infoValue}>
                {game.venue === 'home' ? 'Home Game' : game.venue === 'away' ? 'Away Game' : 'Neutral Site'}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.infoDivider, { backgroundColor: colors.divider }]} />

          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: colors.backgroundTertiary }]}>
              <IconSymbol name="flag" size={16} color={modeColors.primary} />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={[styles.infoLabel, { color: colors.textTertiary }]}>
                Game Type
              </ThemedText>
              <ThemedText style={styles.infoValue}>
                {game.isConference ? 'Conference Game' : 'Non-Conference'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Box Score Placeholder (for Day 7) */}
        {isCompleted && (
          <>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                Box Score
              </ThemedText>
            </View>
            <View style={[styles.placeholderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <IconSymbol
                name="chart.bar"
                size={32}
                color={colors.textTertiary}
                style={styles.placeholderIcon}
              />
              <ThemedText style={[styles.placeholderText, { color: colors.textTertiary }]}>
                Detailed box score coming soon
              </ThemedText>
            </View>
          </>
        )}

        {/* Pre-Game Info (for upcoming games) */}
        {!isCompleted && (
          <>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                Pre-Game
              </ThemedText>
            </View>
            <View style={[styles.pregameCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.pregameRow}>
                <ThemedText style={[styles.pregameLabel, { color: colors.textTertiary }]}>
                  Team Record
                </ThemedText>
                <ThemedText style={[styles.pregameValue, { color: modeColors.primary }]}>
                  {program?.record.overall.wins}-{program?.record.overall.losses}
                </ThemedText>
              </View>
              {program && (
                <View style={styles.pregameRow}>
                  <ThemedText style={[styles.pregameLabel, { color: colors.textTertiary }]}>
                    Conference Record
                  </ThemedText>
                  <ThemedText style={[styles.pregameValue, { color: modeColors.primary }]}>
                    {program.record.conference.wins}-{program.record.conference.losses}
                  </ThemedText>
                </View>
              )}
              {program && (
                <View style={styles.pregameRow}>
                  <ThemedText style={[styles.pregameLabel, { color: colors.textTertiary }]}>
                    Current Streak
                  </ThemedText>
                  <ThemedText style={[styles.pregameValue, { color: modeColors.primary }]}>
                    {program.record.streak}
                  </ThemedText>
                </View>
              )}
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

  // Game Header
  gameHeader: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  matchup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Spacing.md,
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
  },
  teamLogo: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  teamLogoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  teamScore: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  vsContainer: {
    paddingHorizontal: Spacing.md,
  },
  vsText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dateTimeContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 14,
    marginTop: 2,
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

  // Info Card
  infoCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 1,
  },
  infoDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md + 36 + Spacing.sm,
  },

  // Placeholder Card
  placeholderCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  placeholderIcon: {
    marginBottom: Spacing.sm,
    opacity: 0.5,
  },
  placeholderText: {
    fontSize: 14,
  },

  // Pre-Game Card
  pregameCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  pregameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  pregameLabel: {
    fontSize: 14,
  },
  pregameValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
