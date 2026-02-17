/**
 * TransferTracker — Practice-to-game transfer metrics.
 * Shows a sorted list of transfer metric cards with practice/game score bars,
 * transfer label badges, and delta values. Sorted by worst transfer first.
 */

import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TRANSFER_METRICS, type TransferLabel } from '@/data/mock-development-v2';

// =============================================================================
// CONSTANTS
// =============================================================================

const TRANSFER_LABEL_COLORS: Record<TransferLabel, string> = {
  positive: Brand.success,
  neutral: '#FFFFFF',
  negative: Brand.error,
  emerging: Brand.precision,
};

const PRACTICE_BAR_COLOR = Brand.precision; // #6AA9FF
const GAME_BAR_COLOR = Brand.warning;       // #F59E0B

// =============================================================================
// COMPONENT
// =============================================================================

export function TransferTracker() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Sort by worst transfer (largest negative delta) first
  const sortedMetrics = useMemo(() => {
    return [...TRANSFER_METRICS].sort((a, b) => a.delta - b.delta);
  }, []);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <ThemedText style={[styles.headerTitle, { color: colors.text }]}>
          Practice-to-Game Transfer
        </ThemedText>
        <ThemedText style={[styles.headerSub, { color: colors.textTertiary }]}>
          Sorted by worst transfer gap
        </ThemedText>
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: PRACTICE_BAR_COLOR }]} />
          <ThemedText style={[styles.legendText, { color: colors.textSecondary }]}>Practice</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: GAME_BAR_COLOR }]} />
          <ThemedText style={[styles.legendText, { color: colors.textSecondary }]}>Game</ThemedText>
        </View>
      </View>

      {/* Metric Cards */}
      {sortedMetrics.map((metric) => {
        const labelColor = TRANSFER_LABEL_COLORS[metric.transferLabel];
        const deltaPrefix = metric.delta > 0 ? '+' : '';

        return (
          <View
            key={metric.id}
            style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {/* Header Row */}
            <View style={styles.metricHeader}>
              <View style={styles.metricIdentity}>
                <ThemedText style={[styles.metricPlayer, { color: colors.text }]}>
                  {metric.playerName}
                </ThemedText>
                <ThemedText style={[styles.metricSkill, { color: colors.textSecondary }]}>
                  {metric.skillArea}
                </ThemedText>
              </View>
              <View style={styles.metricRight}>
                {/* Transfer Label Badge */}
                <View style={[styles.labelBadge, { backgroundColor: labelColor + '20' }]}>
                  <ThemedText style={[styles.labelBadgeText, { color: labelColor }]}>
                    {metric.transferLabel}
                  </ThemedText>
                </View>
                {/* Delta */}
                <ThemedText
                  style={[
                    styles.deltaText,
                    { color: metric.delta >= 0 ? Brand.success : Brand.error },
                  ]}
                >
                  {deltaPrefix}{metric.delta}
                </ThemedText>
              </View>
            </View>

            {/* Practice Score Bar */}
            <View style={styles.barSection}>
              <View style={styles.barLabelRow}>
                <ThemedText style={[styles.barLabel, { color: colors.textTertiary }]}>
                  Practice
                </ThemedText>
                <ThemedText style={[styles.barValue, { color: PRACTICE_BAR_COLOR }]}>
                  {metric.practiceScore}
                </ThemedText>
              </View>
              <View style={[styles.barBg, { backgroundColor: colors.backgroundTertiary }]}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${metric.practiceScore}%`, backgroundColor: PRACTICE_BAR_COLOR },
                  ]}
                />
              </View>
            </View>

            {/* Game Score Bar */}
            <View style={styles.barSection}>
              <View style={styles.barLabelRow}>
                <ThemedText style={[styles.barLabel, { color: colors.textTertiary }]}>
                  Game
                </ThemedText>
                <ThemedText style={[styles.barValue, { color: GAME_BAR_COLOR }]}>
                  {metric.gameScore}
                </ThemedText>
              </View>
              <View style={[styles.barBg, { backgroundColor: colors.backgroundTertiary }]}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${metric.gameScore}%`, backgroundColor: GAME_BAR_COLOR },
                  ]}
                />
              </View>
            </View>
          </View>
        );
      })}

      {sortedMetrics.length === 0 && (
        <View style={styles.emptyState}>
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No transfer metrics available
          </ThemedText>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },

  // Header
  headerRow: {
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },

  // Legend
  legendRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Metric card
  metricCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  metricIdentity: {
    flex: 1,
    minWidth: 0,
  },
  metricPlayer: {
    fontSize: 14,
    fontWeight: '600',
  },
  metricSkill: {
    fontSize: 12,
    marginTop: 2,
  },
  metricRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  labelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  labelBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  deltaText: {
    fontSize: 16,
    fontWeight: '800',
  },

  // Bars
  barSection: {
    marginBottom: 6,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  barBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Empty
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
