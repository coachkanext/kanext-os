/**
 * Program Teams — Multi-team grid.
 */

import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PROGRAM_TEAMS } from '@/data/mock-program-v2';
import type { TeamLevel } from '@/data/mock-program-v2';

const LEVEL_COLORS: Record<TeamLevel, string> = {
  varsity: '#FFFFFF',
  jv: '#1D9BF0',
  prep: '#F59E0B',
  dev: '#1D9BF0',
};

const LEVEL_LABELS: Record<TeamLevel, string> = {
  varsity: 'VARSITY',
  jv: 'JV',
  prep: 'PREP',
  dev: 'DEV',
};

export function ProgramTeams() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {PROGRAM_TEAMS.map((team) => {
        const levelColor = LEVEL_COLORS[team.level];
        const isActive = team.status === 'active';

        return (
          <Pressable
            key={team.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            {/* Header row */}
            <View style={styles.headerRow}>
              <View style={styles.titleRow}>
                <ThemedText style={styles.teamName}>{team.name}</ThemedText>
                <View style={[styles.levelBadge, { backgroundColor: levelColor + '20' }]}>
                  <ThemedText style={[styles.levelText, { color: levelColor }]}>
                    {LEVEL_LABELS[team.level]}
                  </ThemedText>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: isActive ? '#22C55E' + '20' : colors.backgroundTertiary },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isActive ? '#22C55E' : colors.textTertiary },
                  ]}
                />
                <ThemedText
                  style={[
                    styles.statusText,
                    { color: isActive ? '#22C55E' : colors.textTertiary },
                  ]}
                >
                  {isActive ? 'Active' : 'Offseason'}
                </ThemedText>
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
                  Record
                </ThemedText>
                <ThemedText style={[styles.statValue, { color: colors.text }]}>
                  {team.record}
                </ThemedText>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
              <View style={styles.statItem}>
                <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
                  Head Coach
                </ThemedText>
                <ThemedText style={[styles.statValue, { color: colors.text }]}>
                  {team.headCoach}
                </ThemedText>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
              <View style={styles.statItem}>
                <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
                  Roster
                </ThemedText>
                <ThemedText style={[styles.statValue, { color: colors.text }]}>
                  {team.rosterCount}
                </ThemedText>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footerRow}>
              <ThemedText style={[styles.footerText, { color: colors.textTertiary }]}>
                Season: {team.season}
              </ThemedText>
              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
            </View>
          </Pressable>
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
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '700',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
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
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2F3336',
  },
  footerText: {
    fontSize: 12,
  },
});
