/**
 * Roster Page
 * Season-scoped list of players with navigation to player profiles.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getProgramById,
  INSTITUTION,
  type RosterEntry,
  type Player,
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
        Back
      </ThemedText>
    </Pressable>
  );
}

interface PlayerRowProps {
  entry: RosterEntry;
  onPress: () => void;
  colors: typeof Colors.light;
  accentColor: string;
}

function PlayerRow({ entry, onPress, colors, accentColor }: PlayerRowProps) {
  const { player, role } = entry;

  const getRoleBadgeColor = () => {
    switch (role) {
      case 'starter':
        return accentColor;
      case 'rotation':
        return colors.textSecondary;
      case 'development':
        return colors.textTertiary;
      default:
        return colors.textTertiary;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.playerRow,
        { backgroundColor: pressed ? colors.backgroundTertiary : colors.card },
      ]}
      onPress={onPress}
    >
      {/* Number */}
      <View style={[styles.numberContainer, { backgroundColor: accentColor }]}>
        <ThemedText style={styles.numberText}>{player.number}</ThemedText>
      </View>

      {/* Player Info */}
      <View style={styles.playerInfo}>
        <ThemedText style={styles.playerName}>{player.name}</ThemedText>
        <View style={styles.playerDetails}>
          <ThemedText style={[styles.playerPosition, { color: colors.textSecondary }]}>
            {player.position}
          </ThemedText>
          <ThemedText style={[styles.playerDot, { color: colors.textTertiary }]}>
            •
          </ThemedText>
          <ThemedText style={[styles.playerPhysicals, { color: colors.textSecondary }]}>
            {player.height} / {player.weight}
          </ThemedText>
        </View>
      </View>

      {/* Class Year & Role */}
      <View style={styles.playerMeta}>
        <ThemedText style={[styles.classYear, { color: colors.textSecondary }]}>
          {player.classYear}
        </ThemedText>
        <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor() + '20' }]}>
          <ThemedText style={[styles.roleText, { color: getRoleBadgeColor() }]}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </ThemedText>
        </View>
      </View>

      <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
    </Pressable>
  );
}

interface SeasonSelectorProps {
  currentSeason: string;
  colors: typeof Colors.light;
}

function SeasonSelector({ currentSeason, colors }: SeasonSelectorProps) {
  return (
    <Pressable
      style={[styles.seasonSelector, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
    >
      <ThemedText style={styles.seasonText}>{currentSeason}</ThemedText>
      <IconSymbol name="chevron.down" size={14} color={colors.textSecondary} />
    </Pressable>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function RosterScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
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

  const handlePlayerPress = (playerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/organization/programs/${programId}/players/${playerId}`);
  };

  // Group players by role
  const starters = program.roster.filter((e) => e.role === 'starter');
  const rotation = program.roster.filter((e) => e.role === 'rotation');
  const development = program.roster.filter((e) => e.role === 'development');

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} colors={colors} />
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <View style={styles.titleRow}>
          <ThemedText type="title" style={styles.title}>
            Roster
          </ThemedText>
          <SeasonSelector currentSeason="2025-26" colors={colors} />
        </View>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          {INSTITUTION.nickname} {program.name} • {program.roster.length} players
        </ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {program.roster.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              name="person.3.fill"
              size={48}
              color={colors.textTertiary}
              style={styles.emptyIcon}
            />
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              No players on roster yet
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Starters */}
            {starters.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    Starters ({starters.length})
                  </ThemedText>
                </View>
                <View style={[styles.rosterCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {starters.map((entry, index) => (
                    <React.Fragment key={entry.player.id}>
                      <PlayerRow
                        entry={entry}
                        onPress={() => handlePlayerPress(entry.player.id)}
                        colors={colors}
                        accentColor={modeColors.primary}
                      />
                      {index < starters.length - 1 && (
                        <View style={[styles.separator, { backgroundColor: colors.divider }]} />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </>
            )}

            {/* Rotation */}
            {rotation.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    Rotation ({rotation.length})
                  </ThemedText>
                </View>
                <View style={[styles.rosterCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {rotation.map((entry, index) => (
                    <React.Fragment key={entry.player.id}>
                      <PlayerRow
                        entry={entry}
                        onPress={() => handlePlayerPress(entry.player.id)}
                        colors={colors}
                        accentColor={modeColors.primary}
                      />
                      {index < rotation.length - 1 && (
                        <View style={[styles.separator, { backgroundColor: colors.divider }]} />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </>
            )}

            {/* Development */}
            {development.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    Development ({development.length})
                  </ThemedText>
                </View>
                <View style={[styles.rosterCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {development.map((entry, index) => (
                    <React.Fragment key={entry.player.id}>
                      <PlayerRow
                        entry={entry}
                        onPress={() => handlePlayerPress(entry.player.id)}
                        colors={colors}
                        accentColor={modeColors.primary}
                      />
                      {index < development.length - 1 && (
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  seasonSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 4,
  },
  seasonText: {
    fontSize: 14,
    fontWeight: '500',
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
  rosterCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  numberContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  playerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  playerPosition: {
    fontSize: 13,
  },
  playerDot: {
    fontSize: 13,
    marginHorizontal: 4,
  },
  playerPhysicals: {
    fontSize: 13,
  },
  playerMeta: {
    alignItems: 'flex-end',
    marginRight: Spacing.sm,
  },
  classYear: {
    fontSize: 13,
    fontWeight: '500',
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginTop: 2,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md + 36 + Spacing.sm,
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
