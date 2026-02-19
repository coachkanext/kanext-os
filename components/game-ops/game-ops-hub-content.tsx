/**
 * Game Ops Hub Content — Pre-game ops workspace hub tab.
 * Shows next game bar, depth chart, and Launch CTA that changes by game proximity.
 */

import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DepthChartView, DEPTH_CHART_BY_SEASON, CURRENT_SEASON } from '@/components/roster-content';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FMU_NEXT_GAME, FMU_NEXT_GAME_ID, FMU_SEASON_COMPLETE } from '@/data/fmu';

const ACCENT_GOLD = '#FFFFFF';

type GameProximity = 'pre-far' | 'pre-near' | 'live' | 'post';

function getGameProximity(): GameProximity {
  // In a real app this would check actual game time
  // Demo: always show "pre-near" when a next game exists, "post" when season is done
  if (FMU_SEASON_COMPLETE) return 'post';
  return 'pre-near';
}

export function GameOpsHubContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const proximity = getGameProximity();
  const depthChart = DEPTH_CHART_BY_SEASON[CURRENT_SEASON];

  const ctaConfig = useMemo(() => {
    switch (proximity) {
      case 'pre-far':
        return { label: 'Review Depth Chart', color: colors.textTertiary, icon: 'list.clipboard' as const, pulsing: false };
      case 'pre-near':
        return { label: 'Launch Live Ops', color: ACCENT_GOLD, icon: 'play.fill' as const, pulsing: false };
      case 'live':
        return { label: 'Return to Live Ops', color: Brand.success, icon: 'circle.fill' as const, pulsing: true };
      case 'post':
        return { label: 'View Postgame Report', color: colors.textSecondary, icon: 'doc.text.fill' as const, pulsing: false };
    }
  }, [proximity, colors]);

  const handleLaunch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (proximity === 'post' && FMU_NEXT_GAME_ID) {
      router.push(`/coach/game-detail?gameId=${FMU_NEXT_GAME_ID}&tab=report` as any);
    } else {
      router.push(`/coach/game-ops?gameId=${FMU_NEXT_GAME_ID}` as any);
    }
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {/* Next Game Bar */}
      {FMU_NEXT_GAME && (
        <View style={[styles.nextGameBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.nextGameDot, { backgroundColor: proximity === 'live' ? Brand.success : ACCENT_GOLD }]} />
          <View style={styles.nextGameInfo}>
            <ThemedText style={styles.nextGameOpp}>vs {FMU_NEXT_GAME.opponent}</ThemedText>
            <ThemedText style={[styles.nextGameDate, { color: colors.textSecondary }]}>
              {FMU_NEXT_GAME.date} • {FMU_NEXT_GAME.location}
            </ThemedText>
          </View>
          {proximity === 'live' && (
            <View style={[styles.liveBadge, { backgroundColor: Brand.success + '20' }]}>
              <ThemedText style={[styles.liveText, { color: Brand.success }]}>LIVE</ThemedText>
            </View>
          )}
        </View>
      )}

      {/* Depth Chart */}
      <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>
        DEPTH CHART
      </ThemedText>
      {depthChart ? (
        <DepthChartView depthChart={depthChart} />
      ) : (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No depth chart available
          </ThemedText>
        </View>
      )}

      {/* Launch CTA */}
      <Pressable
        style={({ pressed }) => [
          styles.launchCTA,
          { backgroundColor: ctaConfig.color + '15', borderColor: ctaConfig.color + '40' },
          pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
        ]}
        onPress={handleLaunch}
      >
        <IconSymbol name={ctaConfig.icon as any} size={20} color={ctaConfig.color} />
        <ThemedText style={[styles.launchLabel, { color: ctaConfig.color }]}>{ctaConfig.label}</ThemedText>
        <IconSymbol name="chevron.right" size={14} color={ctaConfig.color} />
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: 40 },

  // Next Game Bar
  nextGameBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  nextGameDot: { width: 8, height: 8, borderRadius: 4, marginRight: Spacing.sm },
  nextGameInfo: { flex: 1 },
  nextGameOpp: { fontSize: 16, fontWeight: '700' },
  nextGameDate: { fontSize: 13, marginTop: 2 },
  liveBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  liveText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },

  // Empty card
  emptyCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: { fontSize: 14 },

  // Launch CTA
  launchCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  launchLabel: { fontSize: 16, fontWeight: '700' },
});
