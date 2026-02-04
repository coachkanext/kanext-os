/**
 * Compact Simulation Result Card
 * Displays inline in the Nexus chat thread with key simulation outputs.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { SimulationResult } from '@/types';
import {
  getConfidenceColor,
  getVolatilityColor,
  getWinProbabilityColor,
  formatMargin,
} from '@/data/mock-simulations';

// =============================================================================
// TYPES
// =============================================================================

interface SimulationCardProps {
  simulation: SimulationResult;
  onViewFull: (simulation: SimulationResult) => void;
  onRerun?: (simulation: SimulationResult) => void;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface StatBoxProps {
  label: string;
  value: string;
  valueColor?: string;
  colors: typeof Colors.light;
}

function StatBox({ label, value, valueColor, colors }: StatBoxProps) {
  return (
    <View style={[styles.statBox, { backgroundColor: colors.backgroundSecondary }]}>
      <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
        {label}
      </ThemedText>
      <ThemedText style={[styles.statValue, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </ThemedText>
    </View>
  );
}

interface RiskIndicatorProps {
  label: string;
  level: string;
  color: string;
  colors: typeof Colors.light;
}

function RiskIndicator({ label, level, color, colors }: RiskIndicatorProps) {
  return (
    <View style={styles.riskIndicator}>
      <View style={[styles.riskDot, { backgroundColor: color }]} />
      <ThemedText style={[styles.riskLabel, { color: colors.textSecondary }]}>
        {label}:
      </ThemedText>
      <ThemedText style={[styles.riskValue, { color }]}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </ThemedText>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SimulationCard({ simulation, onViewFull, onRerun }: SimulationCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const modeColors = ModeColors.sports;

  const winProbColor = getWinProbabilityColor(simulation.winProbability);
  const confidenceColor = getConfidenceColor(simulation.confidence);
  const volatilityColor = getVolatilityColor(simulation.volatility);

  const isWinning = simulation.winProbability >= 50;
  const scoreDisplay = `${simulation.projectedScore.home}-${simulation.projectedScore.away}`;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconSymbol name="chart.bar.fill" size={16} color={modeColors.primary} />
          <ThemedText style={styles.headerTitle}>Simulation Result</ThemedText>
        </View>
        <View
          style={[
            styles.rosterBadge,
            {
              backgroundColor:
                simulation.rosterUsed === 'official'
                  ? modeColors.primary + '20'
                  : '#E07C24' + '20',
            },
          ]}
        >
          <ThemedText
            style={[
              styles.rosterBadgeText,
              {
                color:
                  simulation.rosterUsed === 'official' ? modeColors.primary : '#E07C24',
              },
            ]}
          >
            {simulation.rosterUsed === 'official' ? 'Official' : 'Sandbox'}
          </ThemedText>
        </View>
      </View>

      {/* Matchup */}
      <ThemedText style={styles.matchup}>{simulation.matchupText}</ThemedText>

      {/* Primary Stats Grid */}
      <View style={styles.statsGrid}>
        <StatBox
          label="Win %"
          value={`${simulation.winProbability}%`}
          valueColor={winProbColor}
          colors={colors}
        />
        <StatBox
          label="Score"
          value={scoreDisplay}
          colors={colors}
        />
        <StatBox
          label="Margin"
          value={formatMargin(simulation.projectedMargin)}
          valueColor={isWinning ? '#198754' : '#DC3545'}
          colors={colors}
        />
        <StatBox
          label="Total"
          value={simulation.projectedTotal.toString()}
          colors={colors}
        />
      </View>

      {/* Risk Layer */}
      <View style={[styles.riskRow, { borderTopColor: colors.divider }]}>
        <RiskIndicator
          label="Confidence"
          level={simulation.confidence}
          color={confidenceColor}
          colors={colors}
        />
        <RiskIndicator
          label="Volatility"
          level={simulation.volatility}
          color={volatilityColor}
          colors={colors}
        />
      </View>

      {/* Top Driver Preview */}
      {simulation.drivers.length > 0 && (
        <View style={[styles.driverPreview, { backgroundColor: colors.backgroundSecondary }]}>
          <IconSymbol name="lightbulb.fill" size={12} color={colors.textTertiary} />
          <ThemedText
            style={[styles.driverText, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {simulation.drivers[0]}
          </ThemedText>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.primaryAction,
            { backgroundColor: modeColors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={() => onViewFull(simulation)}
        >
          <IconSymbol name="arrow.up.right.square" size={14} color="#FFFFFF" />
          <ThemedText style={styles.primaryActionText}>View Full</ThemedText>
        </Pressable>
        {onRerun && (
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.backgroundSecondary, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => onRerun(simulation)}
          >
            <IconSymbol name="arrow.clockwise" size={14} color={colors.text} />
            <ThemedText style={[styles.actionText, { color: colors.text }]}>Re-run</ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
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
    gap: 6,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  rosterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  rosterBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Matchup
  matchup: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  statLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Risk Layer
  riskRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.sm,
    marginBottom: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  riskIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  riskLabel: {
    fontSize: 11,
  },
  riskValue: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Driver Preview
  driverPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  driverText: {
    flex: 1,
    fontSize: 12,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  primaryAction: {},
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
