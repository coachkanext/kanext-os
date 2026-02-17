/**
 * Program Seasons — Season history + locking.
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PROGRAM_SEASONS } from '@/data/mock-program-v2';
import type { SeasonStatus } from '@/data/mock-program-v2';

const STATUS_CONFIG: Record<SeasonStatus, { label: string; color: string; bg: string }> = {
  active: { label: 'ACTIVE', color: '#22C55E', bg: '#22C55E' + '20' },
  completed: { label: 'COMPLETED', color: '#FFFFFF', bg: '#FFFFFF' + '15' },
  archived: { label: 'ARCHIVED', color: '#8F8F8F', bg: '#8F8F8F' + '15' },
};

export function ProgramSeasons() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {PROGRAM_SEASONS.map((season) => {
        const config = STATUS_CONFIG[season.status];
        const isActive = season.status === 'active';

        return (
          <View
            key={season.id}
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: isActive ? '#22C55E' + '40' : colors.border,
              },
            ]}
          >
            {/* Header row */}
            <View style={styles.headerRow}>
              <ThemedText style={styles.seasonLabel}>{season.label}</ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                <ThemedText style={[styles.statusText, { color: config.color }]}>
                  {config.label}
                </ThemedText>
              </View>
            </View>

            {/* Active season indicator */}
            {isActive && (
              <View style={styles.currentIndicator}>
                <View style={styles.currentRow}>
                  <View style={[styles.currentDot, { backgroundColor: '#22C55E' }]} />
                  <ThemedText style={[styles.currentLabel, { color: '#22C55E' }]}>
                    Current Season
                  </ThemedText>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: '65%' }]} />
                </View>
              </View>
            )}

            {/* Stats grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statPair}>
                <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
                  Record
                </ThemedText>
                <ThemedText style={[styles.statValue, { color: colors.text }]}>
                  {season.record}
                </ThemedText>
              </View>
              <View style={styles.statPair}>
                <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
                  Conf. Finish
                </ThemedText>
                <ThemedText style={[styles.statValue, { color: colors.text }]}>
                  {season.conferenceFinish}
                </ThemedText>
              </View>
              <View style={styles.statPair}>
                <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
                  Teams
                </ThemedText>
                <ThemedText style={[styles.statValue, { color: colors.text }]}>
                  {season.teamCount}
                </ThemedText>
              </View>
              {season.lockedDate && (
                <View style={styles.statPair}>
                  <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
                    Locked
                  </ThemedText>
                  <View style={styles.lockedRow}>
                    <IconSymbol name="lock.fill" size={12} color={colors.textTertiary} />
                    <ThemedText style={[styles.statValue, { color: colors.text }]}>
                      {season.lockedDate}
                    </ThemedText>
                  </View>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  seasonLabel: {
    fontSize: 20,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Current season indicator
  currentIndicator: {
    marginBottom: Spacing.md,
  },
  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  currentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  currentLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#22C55E',
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statPair: {
    minWidth: '40%',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
