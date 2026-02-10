/**
 * Saved Simulation Snapshot Component
 * Compact reference to a saved simulation that appears in the thread.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { SavedSimulation } from '@/types';
import { getWinProbabilityColor, formatMargin } from '@/data/mock-simulations';

interface SimulationSnapshotProps {
  simulation: SavedSimulation;
  onViewFull: (simulation: SavedSimulation) => void;
}

export function SimulationSnapshot({ simulation, onViewFull }: SimulationSnapshotProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const modeColors = ModeColors.sports;
  const winProbColor = getWinProbabilityColor(simulation.winProbability);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconSymbol name="bookmark.fill" size={14} color={modeColors.primary} />
          <ThemedText style={[styles.headerLabel, { color: modeColors.primary }]}>
            Saved Simulation
          </ThemedText>
        </View>
        <ThemedText style={[styles.timestamp, { color: colors.textTertiary }]}>
          {formatDate(simulation.savedAt)}
        </ThemedText>
      </View>

      {/* Title */}
      <ThemedText style={styles.title}>
        {simulation.title || simulation.matchupText}
      </ThemedText>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <ThemedText style={[styles.statValue, { color: winProbColor }]}>
            {simulation.winProbability}%
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
            Win
          </ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.stat}>
          <ThemedText style={styles.statValue}>
            {simulation.projectedScore.home}-{simulation.projectedScore.away}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
            Score
          </ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.stat}>
          <ThemedText
            style={[
              styles.statValue,
              { color: simulation.projectedMargin >= 0 ? '#f5f5f5' : '#6e6e6e' },
            ]}
          >
            {formatMargin(simulation.projectedMargin)}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
            Margin
          </ThemedText>
        </View>
      </View>

      {/* View Full Link */}
      <Pressable
        style={({ pressed }) => [
          styles.viewButton,
          { backgroundColor: colors.backgroundTertiary, opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={() => onViewFull(simulation)}
      >
        <ThemedText style={[styles.viewButtonText, { color: modeColors.primary }]}>
          View Full Simulation
        </ThemedText>
        <IconSymbol name="arrow.right" size={12} color={modeColors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    marginVertical: Spacing.xs,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  timestamp: {
    fontSize: 11,
  },

  // Title
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
  },

  // View Button
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
