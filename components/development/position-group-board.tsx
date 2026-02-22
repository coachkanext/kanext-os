/**
 * PositionGroupBoard — G/W/F/C boards with player rollups.
 * Horizontal pill selector for Guards/Wings/Forwards/Centers.
 * Selected group shows player cards with progress, gaps, and mini progress bar.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { POSITION_GROUPS, PLAYER_PLANS, type ProgressLevel } from '@/data/mock-development-v2';

// =============================================================================
// PROGRESS CONFIG
// =============================================================================

const PROGRESS_CONFIG: Record<ProgressLevel, { label: string; color: string; icon: string }> = {
  'needs-work': { label: 'Needs Work', color: Brand.error, icon: 'exclamationmark.triangle' },
  'progressing': { label: 'Progressing', color: '#FFFFFF', icon: 'arrow.up.right' },
  'achieved': { label: 'Achieved', color: Brand.success, icon: 'checkmark.circle.fill' },
};

// =============================================================================
// POSITION MATCHING
// =============================================================================

function playerMatchesGroup(playerPosition: string, groupPositions: string[]): boolean {
  for (const gp of groupPositions) {
    if (playerPosition === gp) return true;
    // Handle compound positions like "SG/SF"
    if (gp.includes('/')) {
      const parts = gp.split('/');
      if (parts.includes(playerPosition)) return true;
    }
  }
  return false;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function PositionGroupBoard() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [selectedGroupId, setSelectedGroupId] = useState(POSITION_GROUPS[0].id);

  const selectedGroup = POSITION_GROUPS.find((g) => g.id === selectedGroupId) ?? POSITION_GROUPS[0];

  const groupPlayers = useMemo(() => {
    return PLAYER_PLANS.filter((p) => playerMatchesGroup(p.position, selectedGroup.positions));
  }, [selectedGroup]);

  const handlePillPress = (groupId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGroupId(groupId);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {/* Pill Selector */}
      <View style={styles.pillRow}>
        {POSITION_GROUPS.map((group) => {
          const isActive = group.id === selectedGroupId;
          return (
            <Pressable
              key={group.id}
              style={[
                styles.pill,
                { backgroundColor: colors.card, borderColor: colors.border },
                isActive && styles.pillActive,
              ]}
              onPress={() => handlePillPress(group.id)}
            >
              <ThemedText
                style={[styles.pillText, isActive && styles.pillTextActive]}
              >
                {group.name}
              </ThemedText>
              <ThemedText
                style={[styles.pillCount, isActive && styles.pillCountActive]}
              >
                {group.playerCount}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Group Info Bar */}
      <View style={[styles.groupInfoBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.groupFocusLabel, { color: colors.textTertiary }]}>
          TOP FOCUS
        </ThemedText>
        <ThemedText style={[styles.groupFocusText, { color: colors.text }]}>
          {selectedGroup.topFocus}
        </ThemedText>
        <View style={styles.healthRow}>
          <View style={[styles.healthBarBg, { backgroundColor: colors.backgroundTertiary }]}>
            <View
              style={[
                styles.healthBarFill,
                {
                  width: `${selectedGroup.healthScore}%`,
                  backgroundColor:
                    selectedGroup.healthScore >= 75
                      ? Brand.success
                      : selectedGroup.healthScore >= 55
                        ? Brand.warning
                        : Brand.error,
                },
              ]}
            />
          </View>
          <ThemedText style={[styles.healthPct, { color: colors.textTertiary }]}>
            {selectedGroup.healthScore}
          </ThemedText>
        </View>
      </View>

      {/* Player Cards */}
      {groupPlayers.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No players in this group
          </ThemedText>
        </View>
      ) : (
        groupPlayers.map((player) => {
          const config = PROGRESS_CONFIG[player.progress];
          const latestScore = player.progressTimeline[player.progressTimeline.length - 1]?.score ?? 0;

          return (
            <Pressable
              key={player.playerId}
              style={[styles.playerCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              {/* Header Row */}
              <View style={styles.playerHeader}>
                <View style={styles.playerIdentity}>
                  <ThemedText style={[styles.playerName, { color: colors.text }]}>
                    {player.playerName}
                  </ThemedText>
                  <ThemedText style={[styles.playerMeta, { color: colors.textTertiary }]}>
                    #{player.number} {'\u00B7'} {player.position}
                  </ThemedText>
                </View>
                <View style={[styles.progressBadge, { backgroundColor: config.color + '20' }]}>
                  <IconSymbol name={config.icon as any} size={12} color={config.color} />
                  <ThemedText style={[styles.progressText, { color: config.color }]}>
                    {config.label}
                  </ThemedText>
                </View>
              </View>

              {/* Top Gaps */}
              <View style={styles.gapsRow}>
                {player.topGaps.slice(0, 3).map((gap, i) => (
                  <View key={i} style={[styles.gapChip, { backgroundColor: colors.backgroundTertiary }]}>
                    <ThemedText style={[styles.gapText, { color: colors.textSecondary }]}>
                      {gap}
                    </ThemedText>
                  </View>
                ))}
              </View>

              {/* Mini Progress Bar */}
              <View style={styles.miniProgressRow}>
                <ThemedText style={[styles.miniProgressLabel, { color: colors.textTertiary }]}>
                  Progress
                </ThemedText>
                <View style={[styles.miniProgressBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                  <View
                    style={[
                      styles.miniProgressBarFill,
                      { width: `${latestScore}%`, backgroundColor: config.color },
                    ]}
                  />
                </View>
                <ThemedText style={[styles.miniProgressValue, { color: config.color }]}>
                  {latestScore}
                </ThemedText>
              </View>
            </Pressable>
          );
        })
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

  // Pill selector
  pillRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.md,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pillTextActive: {
    color: '#000000',
  },
  pillCount: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A1A1AA',
    marginTop: 1,
  },
  pillCountActive: {
    color: '#52525B',
  },

  // Group info bar
  groupInfoBar: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  groupFocusLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  groupFocusText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  healthBarBg: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  healthPct: {
    fontSize: 11,
    fontWeight: '600',
    width: 22,
  },

  // Player card
  playerCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  playerIdentity: {},
  playerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  playerMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Gaps
  gapsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: Spacing.sm,
  },
  gapChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  gapText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Mini progress bar
  miniProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.sm,
  },
  miniProgressLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    width: 54,
  },
  miniProgressBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  miniProgressValue: {
    fontSize: 12,
    fontWeight: '800',
    width: 26,
    textAlign: 'right',
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
