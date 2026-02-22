/**
 * Schedule & Events Page
 * Season schedule with game rows grouped by status.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccentColor } from '@/hooks/use-accent-color';
import {
  getProgramById,
  formatGameDate,
  formatRecord,
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
      <IconSymbol name="chevron.left" size={20} color={accent} />
      <ThemedText style={[styles.backButtonText, { color: accent }]}>
        Back
      </ThemedText>
    </Pressable>
  );
}

interface GameRowProps {
  game: Game;
  onPress: () => void;
  colors: typeof Colors.light;
  accentColor: string;
}

function GameRow({ game, onPress, colors, accentColor }: GameRowProps) {
  const isCompleted = game.status === 'final';
  const isWin = game.result?.isWin;

  const getResultColor = () => {
    if (!isCompleted) return colors.textSecondary;
    return isWin ? Colors.light.success : Colors.light.error;
  };

  const getResultText = () => {
    if (!game.result) return '';
    const { homeScore, awayScore } = game.result;
    if (game.venue === 'home') {
      return `${homeScore}-${awayScore}`;
    }
    return `${awayScore}-${homeScore}`;
  };

  const getVenuePrefix = () => {
    switch (game.venue) {
      case 'home':
        return 'vs';
      case 'away':
        return '@';
      case 'neutral':
        return 'vs';
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.gameRow,
        { backgroundColor: pressed ? colors.backgroundTertiary : 'transparent' },
      ]}
      onPress={onPress}
    >
      {/* Date Column */}
      <View style={styles.dateColumn}>
        <ThemedText style={[styles.dateDay, { color: colors.text }]}>
          {game.date.toLocaleDateString('en-US', { day: 'numeric' })}
        </ThemedText>
        <ThemedText style={[styles.dateMonth, { color: colors.textTertiary }]}>
          {game.date.toLocaleDateString('en-US', { month: 'short' })}
        </ThemedText>
      </View>

      {/* Game Info */}
      <View style={styles.gameInfo}>
        <View style={styles.opponentRow}>
          <ThemedText style={[styles.venuePrefix, { color: colors.textTertiary }]}>
            {getVenuePrefix()}
          </ThemedText>
          <ThemedText style={styles.opponentName}>{game.opponent}</ThemedText>
          {game.isConference && (
            <View style={[styles.confBadge, { backgroundColor: accentColor + '20' }]}>
              <ThemedText style={[styles.confBadgeText, { color: accentColor }]}>
                CONF
              </ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={[styles.gameDetails, { color: colors.textSecondary }]}>
          {game.time} • {game.location}
        </ThemedText>
      </View>

      {/* Result/Status */}
      <View style={styles.resultColumn}>
        {isCompleted ? (
          <View style={styles.resultContainer}>
            <ThemedText style={[styles.resultIndicator, { color: getResultColor() }]}>
              {isWin ? 'W' : 'L'}
            </ThemedText>
            <ThemedText style={[styles.resultScore, { color: colors.text }]}>
              {getResultText()}
            </ThemedText>
          </View>
        ) : (
          <View style={[styles.statusBadge, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[styles.statusText, { color: colors.textSecondary }]}>
              {game.venue === 'home' ? 'Home' : game.venue === 'away' ? 'Away' : 'Neutral'}
            </ThemedText>
          </View>
        )}
      </View>

      <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
    </Pressable>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ScheduleScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();
  const router = useRouter();
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

  const handleGamePress = (gameId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/organization/programs/${programId}/events/${gameId}`);
  };

  // Separate completed and upcoming games
  const completedGames = program.schedule
    .filter((g) => g.status === 'final')
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  const upcomingGames = program.schedule
    .filter((g) => g.status === 'upcoming')
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} colors={colors} />
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <ThemedText type="title" style={styles.title}>
          Schedule
        </ThemedText>
        <View style={styles.recordRow}>
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            {INSTITUTION.nickname} {program.name} • 2025-26
          </ThemedText>
          <View style={[styles.recordBadge, { backgroundColor: modeColors.primary }]}>
            <ThemedText style={styles.recordText}>
              {formatRecord(program.record.overall)}
            </ThemedText>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {program.schedule.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              name="calendar"
              size={48}
              color={colors.textTertiary}
              style={styles.emptyIcon}
            />
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              No games scheduled
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Upcoming Games */}
            {upcomingGames.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    Upcoming ({upcomingGames.length})
                  </ThemedText>
                </View>
                <View style={[styles.gamesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {upcomingGames.map((game, index) => (
                    <React.Fragment key={game.id}>
                      <GameRow
                        game={game}
                        onPress={() => handleGamePress(game.id)}
                        colors={colors}
                        accentColor={modeColors.primary}
                      />
                      {index < upcomingGames.length - 1 && (
                        <View style={[styles.separator, { backgroundColor: colors.divider }]} />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </>
            )}

            {/* Completed Games */}
            {completedGames.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    Results ({completedGames.length})
                  </ThemedText>
                </View>
                <View style={[styles.gamesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {completedGames.map((game, index) => (
                    <React.Fragment key={game.id}>
                      <GameRow
                        game={game}
                        onPress={() => handleGamePress(game.id)}
                        colors={colors}
                        accentColor={modeColors.primary}
                      />
                      {index < completedGames.length - 1 && (
                        <View style={[styles.separator, { backgroundColor: colors.divider }]} />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </>
            )}
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
  titleContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
  },
  recordBadge: {
    marginLeft: Spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  recordText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  sectionHeader: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gamesCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  dateColumn: {
    width: 40,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '700',
  },
  dateMonth: {
    fontSize: 11,
    textTransform: 'uppercase',
  },
  gameInfo: {
    flex: 1,
  },
  opponentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venuePrefix: {
    fontSize: 13,
    marginRight: 4,
  },
  opponentName: {
    fontSize: 15,
    fontWeight: '600',
  },
  confBadge: {
    marginLeft: Spacing.xs,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
  },
  confBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  gameDetails: {
    fontSize: 12,
    marginTop: 2,
  },
  resultColumn: {
    marginRight: Spacing.sm,
    alignItems: 'flex-end',
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultIndicator: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
  },
  resultScore: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md + 40 + Spacing.sm,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  emptyState: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: Spacing.md,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 15,
  },
});
