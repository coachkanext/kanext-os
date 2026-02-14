/**
 * Team Detail Page — Full team profile from National Pool.
 * Shows team KR, OFF/DEF KR, 7 cluster accordion with top contributors,
 * and full roster sorted by overall KR.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius } from '@/constants/theme';
import { PLAYER_POOL } from '@/data/playerPool';
import { getPlayerRatings, getTeamClusterAverages } from '@/data/playerRatings';
import { TRADITIONAL_TO_HELIO } from '@/data/position-mapping';
import { SORT_CLUSTER_LABELS, CLUSTER_ORDER } from '@/data/trait-library';
import type { ClusterType } from '@/types';

const BG = '#0F1115';
const CARD_BG = '#1A1D23';
const WHITE = '#FFFFFF';
const GRAY = '#8A8F98';
const DIVIDER = '#2A2D35';

export default function TeamDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { team } = useLocalSearchParams<{ team: string }>();

  const teamPlayers = useMemo(
    () => PLAYER_POOL.filter((p) => p.currentSchool === team),
    [team],
  );

  const teamStats = useMemo(
    () => getTeamClusterAverages(teamPlayers.map((p) => p.id)),
    [teamPlayers],
  );

  // Roster sorted by KR
  const roster = useMemo(
    () =>
      teamPlayers
        .map((p) => {
          const r = getPlayerRatings(p.id);
          return { player: p, kr: r?.overall ?? 0, clusters: r?.clusters ?? null };
        })
        .sort((a, b) => b.kr - a.kr),
    [teamPlayers],
  );

  // Cluster accordion
  const [expandedCluster, setExpandedCluster] = useState<ClusterType | null>(null);

  // Identity from first player
  const conference = teamPlayers[0]?.conference ?? '\u2014';
  const level = teamPlayers[0]?.level ?? '\u2014';

  if (teamPlayers.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.notFound}>
          <ThemedText style={styles.notFoundText}>Team not found.</ThemedText>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ThemedText style={styles.backBtnText}>Go Back</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Nav bar */}
      <View style={styles.navBar}>
        <Pressable
          style={styles.navBack}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <IconSymbol name="chevron.left" size={20} color={WHITE} />
          <ThemedText style={styles.navBackText}>Pool</ThemedText>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroCard}>
          <ThemedText style={styles.heroName}>{team}</ThemedText>
          <View style={styles.heroRow}>
            <View style={styles.krBadge}>
              <ThemedText style={styles.krLabel}>TEAM KR</ThemedText>
              <ThemedText style={styles.krValue}>{teamStats.overall}</ThemedText>
            </View>
            <View style={styles.krBadgeSmall}>
              <ThemedText style={styles.krLabelSmall}>OFF</ThemedText>
              <ThemedText style={styles.krValueSmall}>{teamStats.offKR}</ThemedText>
            </View>
            <View style={styles.krBadgeSmall}>
              <ThemedText style={styles.krLabelSmall}>DEF</ThemedText>
              <ThemedText style={styles.krValueSmall}>{teamStats.defKR}</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.heroMeta}>
            {conference} {'\u00B7'} {level} {'\u00B7'} {teamPlayers.length} players
          </ThemedText>
        </View>

        {/* Cluster Ratings */}
        <View style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>CLUSTER RATINGS</ThemedText>
          {CLUSTER_ORDER.map((cluster) => {
            const isExpanded = expandedCluster === cluster;
            const val = teamStats.clusters[cluster];
            const valColor = val >= 70 ? '#4CAF50' : val >= 55 ? '#FF9800' : '#EF4444';
            // Top 3 contributors for this cluster
            const contributors = isExpanded
              ? roster
                  .filter((r) => r.clusters != null)
                  .map((r) => ({
                    name: `${r.player.firstName} ${r.player.lastName}`,
                    position: r.player.position,
                    val: r.clusters![cluster],
                  }))
                  .sort((a, b) => b.val - a.val)
                  .slice(0, 3)
              : [];
            return (
              <View key={cluster}>
                <Pressable
                  style={styles.clusterRow}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setExpandedCluster(isExpanded ? null : cluster);
                  }}
                >
                  <ThemedText style={styles.clusterLabel}>
                    {SORT_CLUSTER_LABELS[cluster]}
                  </ThemedText>
                  <View style={styles.clusterRight}>
                    <ThemedText style={[styles.clusterValue, { color: valColor }]}>{val}</ThemedText>
                    <IconSymbol
                      name={isExpanded ? 'chevron.up' : 'chevron.down'}
                      size={12}
                      color={GRAY}
                    />
                  </View>
                </Pressable>
                {isExpanded && (
                  <View style={styles.contributorList}>
                    {contributors.map((c) => {
                      const cColor = c.val >= 70 ? '#4CAF50' : c.val >= 55 ? '#FF9800' : '#EF4444';
                      return (
                        <View key={c.name} style={styles.contributorRow}>
                          <ThemedText style={styles.contributorName}>
                            {c.name} ({c.position})
                          </ThemedText>
                          <ThemedText style={[styles.contributorVal, { color: cColor }]}>
                            {c.val}
                          </ThemedText>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Top Players */}
        <View style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>PLAYERS</ThemedText>
          {roster.map(({ player: p, kr }) => {
            const helioPos = TRADITIONAL_TO_HELIO[p.position] ?? p.position;
            return (
              <Pressable
                key={p.id}
                style={styles.playerRow}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({ pathname: '/coach/player-detail', params: { id: p.id } } as any);
                }}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.playerName}>
                    {p.firstName} {p.lastName}
                  </ThemedText>
                  <ThemedText style={styles.playerMeta}>
                    {helioPos} {'\u00B7'} {p.classYear} {'\u00B7'} {p.level}
                  </ThemedText>
                </View>
                <View style={styles.playerKR}>
                  <ThemedText style={styles.playerKRLabel}>KR</ThemedText>
                  <ThemedText style={styles.playerKRValue}>{kr}</ThemedText>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Back link */}
        <Pressable
          style={styles.bottomAction}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <IconSymbol name="chevron.left" size={14} color={WHITE} />
          <ThemedText style={styles.bottomActionText}>Back to National Pool</ThemedText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIVIDER,
  },
  navBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navBackText: {
    fontSize: 15,
    color: WHITE,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },

  // Hero
  heroCard: {
    backgroundColor: CARD_BG,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  heroName: {
    fontSize: 24,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 8,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  krBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: DIVIDER,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  krLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: GRAY,
  },
  krValue: {
    fontSize: 16,
    fontWeight: '700',
    color: WHITE,
  },
  krBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: DIVIDER,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  krLabelSmall: {
    fontSize: 9,
    fontWeight: '700',
    color: GRAY,
    letterSpacing: 0.3,
  },
  krValueSmall: {
    fontSize: 13,
    fontWeight: '700',
    color: WHITE,
  },
  heroMeta: {
    fontSize: 13,
    color: GRAY,
  },

  // Section
  sectionCard: {
    backgroundColor: CARD_BG,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: GRAY,
    marginBottom: Spacing.sm,
  },

  // Cluster rows
  clusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIVIDER,
  },
  clusterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: WHITE,
  },
  clusterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clusterValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  contributorList: {
    paddingLeft: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  contributorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  contributorName: {
    fontSize: 13,
    color: GRAY,
  },
  contributorVal: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Player rows
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIVIDER,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: WHITE,
  },
  playerMeta: {
    fontSize: 12,
    color: GRAY,
    marginTop: 2,
  },
  playerKR: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: DIVIDER,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  playerKRLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: GRAY,
  },
  playerKRValue: {
    fontSize: 14,
    fontWeight: '700',
    color: WHITE,
  },

  // Bottom action
  bottomAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    backgroundColor: CARD_BG,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  bottomActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: WHITE,
  },

  // Not found
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  notFoundText: {
    fontSize: 16,
    color: GRAY,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: CARD_BG,
    borderRadius: BorderRadius.md,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: WHITE,
  },
});
