/**
 * Event Detail Page (Game Center)
 * Game details including score, venue, box score, and player stats.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccentColor } from '@/hooks/use-accent-color';
import {
  getProgramById,
  formatGameDate,
  INSTITUTION,
  type Game,
  type PlayerGameStats,
  type BoxScore,
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
        Schedule
      </ThemedText>
    </Pressable>
  );
}

interface TeamStatsRowProps {
  label: string;
  value: string | number;
  colors: typeof Colors.light;
}

function TeamStatsRow({ label, value, colors }: TeamStatsRowProps) {
  return (
    <View style={styles.teamStatsRow}>
      <ThemedText style={[styles.teamStatsLabel, { color: colors.textSecondary }]}>
        {label}
      </ThemedText>
      <ThemedText style={styles.teamStatsValue}>{value}</ThemedText>
    </View>
  );
}

interface PlayerStatsTableProps {
  playerStats: PlayerGameStats[];
  colors: typeof Colors.light;
  accentColor: string;
}

function PlayerStatsTable({ playerStats, colors, accentColor }: PlayerStatsTableProps) {
  // Sort by points scored (descending)
  const sortedStats = [...playerStats].sort((a, b) => b.points - a.points);

  return (
    <View style={styles.statsTable}>
      {/* Header */}
      <View style={[styles.statsTableHeader, { backgroundColor: colors.backgroundSecondary }]}>
        <ThemedText style={[styles.statsHeaderCell, styles.playerCell, { color: colors.textSecondary }]}>
          Player
        </ThemedText>
        <ThemedText style={[styles.statsHeaderCell, styles.statCell, { color: colors.textSecondary }]}>
          MIN
        </ThemedText>
        <ThemedText style={[styles.statsHeaderCell, styles.statCell, { color: colors.textSecondary }]}>
          PTS
        </ThemedText>
        <ThemedText style={[styles.statsHeaderCell, styles.statCell, { color: colors.textSecondary }]}>
          REB
        </ThemedText>
        <ThemedText style={[styles.statsHeaderCell, styles.statCell, { color: colors.textSecondary }]}>
          AST
        </ThemedText>
        <ThemedText style={[styles.statsHeaderCell, styles.statCell, { color: colors.textSecondary }]}>
          FG
        </ThemedText>
      </View>

      {/* Player Rows */}
      {sortedStats.map((player, index) => (
        <View
          key={player.playerId}
          style={[
            styles.statsTableRow,
            index % 2 === 1 && { backgroundColor: colors.backgroundSecondary + '50' },
          ]}
        >
          <View style={[styles.playerCell, styles.playerInfoCell]}>
            <ThemedText style={[styles.playerNumber, { color: accentColor }]}>
              #{player.playerNumber}
            </ThemedText>
            <ThemedText style={styles.playerName} numberOfLines={1}>
              {player.playerName.split(' ')[1] || player.playerName}
            </ThemedText>
          </View>
          <ThemedText style={[styles.statCell, styles.statValue, { color: colors.textSecondary }]}>
            {player.minutes}
          </ThemedText>
          <ThemedText style={[styles.statCell, styles.statValue, styles.highlightStat]}>
            {player.points}
          </ThemedText>
          <ThemedText style={[styles.statCell, styles.statValue]}>
            {player.rebounds}
          </ThemedText>
          <ThemedText style={[styles.statCell, styles.statValue]}>
            {player.assists}
          </ThemedText>
          <ThemedText style={[styles.statCell, styles.statValue, { color: colors.textSecondary }]}>
            {player.fgMade}-{player.fgAttempted}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function EventDetailScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { programId, eventId } = useLocalSearchParams<{
    programId: string;
    eventId: string;
  }>();

  const modeColors = ModeColors.sports;
  const program = getProgramById(programId);
  const game = program?.schedule.find((g) => g.id === eventId);

  const [showDetailedStats, setShowDetailedStats] = useState(false);

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

        {/* Box Score (for completed games with data) */}
        {isCompleted && game.boxScore && (
          <>
            {/* Team Stats Summary */}
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                Team Stats
              </ThemedText>
            </View>
            <View style={[styles.teamStatsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.teamStatsGrid}>
                <TeamStatsRow label="FG%" value={`${game.boxScore.teamStats.fgPct}%`} colors={colors} />
                <TeamStatsRow label="3P%" value={`${game.boxScore.teamStats.threePct}%`} colors={colors} />
                <TeamStatsRow label="FT%" value={`${game.boxScore.teamStats.ftPct}%`} colors={colors} />
                <TeamStatsRow label="Rebounds" value={game.boxScore.teamStats.rebounds} colors={colors} />
                <TeamStatsRow label="Assists" value={game.boxScore.teamStats.assists} colors={colors} />
                <TeamStatsRow label="Steals" value={game.boxScore.teamStats.steals} colors={colors} />
                <TeamStatsRow label="Blocks" value={game.boxScore.teamStats.blocks} colors={colors} />
                <TeamStatsRow label="Turnovers" value={game.boxScore.teamStats.turnovers} colors={colors} />
              </View>
            </View>

            {/* Player Stats */}
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                Player Stats
              </ThemedText>
            </View>
            <View style={[styles.playerStatsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <PlayerStatsTable
                playerStats={game.boxScore.playerStats}
                colors={colors}
                accentColor={modeColors.primary}
              />
            </View>
          </>
        )}

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

  // Team Stats Card
  teamStatsCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  teamStatsGrid: {
    gap: Spacing.xs,
  },
  teamStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  teamStatsLabel: {
    fontSize: 14,
  },
  teamStatsValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Player Stats Card
  playerStatsCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  statsTable: {},
  statsTableHeader: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  statsTableRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  statsHeaderCell: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  playerCell: {
    flex: 2,
  },
  playerInfoCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerNumber: {
    fontSize: 11,
    fontWeight: '600',
    marginRight: 4,
  },
  playerName: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  statCell: {
    flex: 1,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 13,
  },
  highlightStat: {
    fontWeight: '700',
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
