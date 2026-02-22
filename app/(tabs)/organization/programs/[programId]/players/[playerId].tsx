/**
 * Player Profile Page
 * Career view showing player info, career timeline, and season stats.
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
  getPlayerProfile,
  getPositionName,
  getClassYearName,
  formatStatValue,
  formatPercentage,
  INSTITUTION,
  type PlayerProfile,
  type CareerSeason,
  type SeasonStats,
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
        Roster
      </ThemedText>
    </Pressable>
  );
}

interface StatItemProps {
  label: string;
  value: string;
  colors: typeof Colors.light;
  accentColor: string;
  isHighlight?: boolean;
}

function StatItem({ label, value, colors, accentColor, isHighlight }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <ThemedText
        style={[
          styles.statValue,
          { color: isHighlight ? accentColor : colors.text },
        ]}
      >
        {value}
      </ThemedText>
      <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
        {label}
      </ThemedText>
    </View>
  );
}

interface SeasonRowProps {
  season: CareerSeason;
  isExpanded: boolean;
  onToggle: () => void;
  colors: typeof Colors.light;
  accentColor: string;
  isCurrentTeam: boolean;
}

function SeasonRow({
  season,
  isExpanded,
  onToggle,
  colors,
  accentColor,
  isCurrentTeam,
}: SeasonRowProps) {
  const { stats } = season;

  return (
    <View style={styles.seasonContainer}>
      <Pressable
        style={({ pressed }) => [
          styles.seasonHeader,
          pressed && { opacity: 0.8 },
        ]}
        onPress={onToggle}
      >
        <View style={styles.seasonInfo}>
          <View style={styles.seasonTitleRow}>
            <ThemedText style={[styles.seasonYear, isCurrentTeam && { color: accentColor }]}>
              {season.year}
            </ThemedText>
            {isCurrentTeam && (
              <View style={[styles.currentBadge, { backgroundColor: accentColor }]}>
                <ThemedText style={styles.currentBadgeText}>Current</ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={[styles.seasonTeam, { color: colors.textSecondary }]}>
            {season.team} • {season.level}
          </ThemedText>
        </View>
        <View style={styles.seasonQuickStats}>
          <ThemedText style={[styles.quickStatValue, { color: accentColor }]}>
            {formatStatValue(stats.ppg)}
          </ThemedText>
          <ThemedText style={[styles.quickStatLabel, { color: colors.textTertiary }]}>
            PPG
          </ThemedText>
        </View>
        <IconSymbol
          name={isExpanded ? 'chevron.up' : 'chevron.down'}
          size={16}
          color={colors.textTertiary}
        />
      </Pressable>

      {isExpanded && (
        <View style={[styles.seasonDetails, { borderTopColor: colors.divider }]}>
          <View style={styles.statsGrid}>
            <StatItem
              label="GP"
              value={String(stats.gp)}
              colors={colors}
              accentColor={accentColor}
            />
            <StatItem
              label="GS"
              value={String(stats.gs)}
              colors={colors}
              accentColor={accentColor}
            />
            <StatItem
              label="MPG"
              value={formatStatValue(stats.mpg)}
              colors={colors}
              accentColor={accentColor}
            />
            <StatItem
              label="PPG"
              value={formatStatValue(stats.ppg)}
              colors={colors}
              accentColor={accentColor}
              isHighlight
            />
            <StatItem
              label="RPG"
              value={formatStatValue(stats.rpg)}
              colors={colors}
              accentColor={accentColor}
              isHighlight
            />
            <StatItem
              label="APG"
              value={formatStatValue(stats.apg)}
              colors={colors}
              accentColor={accentColor}
              isHighlight
            />
            <StatItem
              label="SPG"
              value={formatStatValue(stats.spg)}
              colors={colors}
              accentColor={accentColor}
            />
            <StatItem
              label="BPG"
              value={formatStatValue(stats.bpg)}
              colors={colors}
              accentColor={accentColor}
            />
          </View>
          <View style={[styles.shootingStats, { borderTopColor: colors.divider }]}>
            <View style={styles.shootingStat}>
              <ThemedText style={[styles.shootingValue, { color: colors.text }]}>
                {formatPercentage(stats.fgPct)}
              </ThemedText>
              <ThemedText style={[styles.shootingLabel, { color: colors.textTertiary }]}>
                FG%
              </ThemedText>
            </View>
            <View style={styles.shootingStat}>
              <ThemedText style={[styles.shootingValue, { color: colors.text }]}>
                {formatPercentage(stats.threePct)}
              </ThemedText>
              <ThemedText style={[styles.shootingLabel, { color: colors.textTertiary }]}>
                3P%
              </ThemedText>
            </View>
            <View style={styles.shootingStat}>
              <ThemedText style={[styles.shootingValue, { color: colors.text }]}>
                {formatPercentage(stats.ftPct)}
              </ThemedText>
              <ThemedText style={[styles.shootingLabel, { color: colors.textTertiary }]}>
                FT%
              </ThemedText>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function PlayerProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { programId, playerId } = useLocalSearchParams<{
    programId: string;
    playerId: string;
  }>();

  const modeColors = ModeColors.sports;
  const player = getPlayerProfile(playerId);

  const [expandedSeason, setExpandedSeason] = useState<string | null>(
    player?.careerTimeline[0]?.year ?? null
  );

  if (!player) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} colors={colors} />
        </View>
        <View style={styles.errorState}>
          <ThemedText style={[styles.errorText, { color: colors.textSecondary }]}>
            Player not found
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const currentSeasonStats = player.careerTimeline[0]?.stats;

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
        {/* Player Header */}
        <View style={styles.playerHeader}>
          <View style={[styles.playerAvatar, { backgroundColor: modeColors.primary }]}>
            <ThemedText style={styles.playerNumber}>#{player.number}</ThemedText>
          </View>
          <View style={styles.playerInfo}>
            <ThemedText style={styles.playerName}>{player.name}</ThemedText>
            <ThemedText style={[styles.playerPosition, { color: colors.textSecondary }]}>
              {getPositionName(player.position)} • {getClassYearName(player.classYear)}
            </ThemedText>
            <ThemedText style={[styles.playerTeam, { color: modeColors.primary }]}>
              {INSTITUTION.nickname}
            </ThemedText>
          </View>
        </View>

        {/* Physical Stats */}
        <View style={[styles.physicalsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.physicalItem}>
            <ThemedText style={styles.physicalValue}>{player.height}</ThemedText>
            <ThemedText style={[styles.physicalLabel, { color: colors.textTertiary }]}>
              Height
            </ThemedText>
          </View>
          <View style={[styles.physicalDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.physicalItem}>
            <ThemedText style={styles.physicalValue}>{player.weight}</ThemedText>
            <ThemedText style={[styles.physicalLabel, { color: colors.textTertiary }]}>
              Weight
            </ThemedText>
          </View>
          <View style={[styles.physicalDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.physicalItem}>
            <ThemedText style={styles.physicalValue}>{player.hometown}</ThemedText>
            <ThemedText style={[styles.physicalLabel, { color: colors.textTertiary }]}>
              Hometown
            </ThemedText>
          </View>
        </View>

        {/* Current Season Highlights */}
        {currentSeasonStats && (
          <>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                Current Season
              </ThemedText>
            </View>
            <View style={[styles.highlightsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.highlightsRow}>
                <StatItem
                  label="PPG"
                  value={formatStatValue(currentSeasonStats.ppg)}
                  colors={colors}
                  accentColor={modeColors.primary}
                  isHighlight
                />
                <StatItem
                  label="RPG"
                  value={formatStatValue(currentSeasonStats.rpg)}
                  colors={colors}
                  accentColor={modeColors.primary}
                  isHighlight
                />
                <StatItem
                  label="APG"
                  value={formatStatValue(currentSeasonStats.apg)}
                  colors={colors}
                  accentColor={modeColors.primary}
                  isHighlight
                />
                <StatItem
                  label="FG%"
                  value={formatPercentage(currentSeasonStats.fgPct)}
                  colors={colors}
                  accentColor={modeColors.primary}
                />
              </View>
            </View>
          </>
        )}

        {/* Career Timeline */}
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Career Timeline
          </ThemedText>
        </View>
        <View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {player.careerTimeline.map((season, index) => (
            <React.Fragment key={season.year}>
              <SeasonRow
                season={season}
                isExpanded={expandedSeason === season.year}
                onToggle={() =>
                  setExpandedSeason(expandedSeason === season.year ? null : season.year)
                }
                colors={colors}
                accentColor={modeColors.primary}
                isCurrentTeam={index === 0 && season.team === INSTITUTION.name}
              />
              {index < player.careerTimeline.length - 1 && (
                <View style={[styles.seasonDivider, { backgroundColor: colors.divider }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Bio */}
        {player.bio && (
          <>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                About
              </ThemedText>
            </View>
            <View style={[styles.bioCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[styles.bioText, { color: colors.textSecondary }]}>
                {player.bio}
              </ThemedText>
            </View>
          </>
        )}

        {/* Background */}
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Background
          </ThemedText>
        </View>
        <View style={[styles.backgroundCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {player.highSchool && (
            <View style={styles.backgroundRow}>
              <ThemedText style={[styles.backgroundLabel, { color: colors.textTertiary }]}>
                High School
              </ThemedText>
              <ThemedText style={styles.backgroundValue}>{player.highSchool}</ThemedText>
            </View>
          )}
          {player.previousSchool && (
            <View style={styles.backgroundRow}>
              <ThemedText style={[styles.backgroundLabel, { color: colors.textTertiary }]}>
                Previous School
              </ThemedText>
              <ThemedText style={styles.backgroundValue}>{player.previousSchool}</ThemedText>
            </View>
          )}
          <View style={styles.backgroundRow}>
            <ThemedText style={[styles.backgroundLabel, { color: colors.textTertiary }]}>
              Hometown
            </ThemedText>
            <ThemedText style={styles.backgroundValue}>{player.hometown}</ThemedText>
          </View>
        </View>
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

  // Player Header
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  playerAvatar: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  playerNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 24,
    fontWeight: '700',
  },
  playerPosition: {
    fontSize: 15,
    marginTop: 2,
  },
  playerTeam: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },

  // Physical Stats
  physicalsCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  physicalItem: {
    flex: 1,
    alignItems: 'center',
  },
  physicalValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  physicalLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  physicalDivider: {
    width: 1,
    marginHorizontal: Spacing.sm,
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

  // Highlights Card
  highlightsCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  highlightsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  // Stat Item
  statItem: {
    alignItems: 'center',
    minWidth: 50,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // Timeline Card
  timelineCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  seasonContainer: {},
  seasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  seasonInfo: {
    flex: 1,
  },
  seasonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seasonYear: {
    fontSize: 16,
    fontWeight: '600',
  },
  currentBadge: {
    marginLeft: Spacing.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  seasonTeam: {
    fontSize: 13,
    marginTop: 2,
  },
  seasonQuickStats: {
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  quickStatLabel: {
    fontSize: 10,
  },
  seasonDetails: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
  },
  shootingStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    marginTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  shootingStat: {
    alignItems: 'center',
  },
  shootingValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  shootingLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  seasonDivider: {
    height: StyleSheet.hairlineWidth,
  },

  // Bio Card
  bioCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
  },

  // Background Card
  backgroundCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  backgroundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  backgroundLabel: {
    fontSize: 14,
  },
  backgroundValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});
