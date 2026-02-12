/**
 * Player Detail Page — Full player profile from National Pool.
 * Displays hero card, identity, ratings accordion, season stats, and team context.
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
import { getLatestSeason } from '@/data/playerSeasons';
import { TRADITIONAL_TO_HELIO, HELIO_POSITION_LABELS } from '@/data/position-mapping';
import { TRAIT_LIBRARY, SORT_CLUSTER_LABELS, CLUSTER_ORDER } from '@/data/trait-library';
import type { ClusterType } from '@/types';

const BG = '#0F1115';
const CARD_BG = '#1A1D23';
const WHITE = '#FFFFFF';
const GRAY = '#8A8F98';
const DIVIDER = '#2A2D35';

export default function PlayerDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const player = useMemo(() => PLAYER_POOL.find((p) => p.id === id), [id]);
  const season = useMemo(() => (player ? getLatestSeason(player.id) : null), [player]);

  // Weekly update tabs
  const [weeklyTab, setWeeklyTab] = useState('this_week');
  const weeklyTabs = [
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: '2_weeks_ago', label: '2 Weeks Ago' },
    { value: 'season_start', label: 'Season Start' },
  ];

  // Ratings accordion
  const [expandedCluster, setExpandedCluster] = useState<ClusterType | null>(null);

  if (!player) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.notFound}>
          <ThemedText style={styles.notFoundText}>Player not found.</ThemedText>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ThemedText style={styles.backBtnText}>Go Back</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  const helioPos = TRADITIONAL_TO_HELIO[player.position];
  const helioLabel = helioPos ? HELIO_POSITION_LABELS[helioPos] : player.position;

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
        {/* 1. Hero Card */}
        <View style={styles.heroCard}>
          <ThemedText style={styles.heroName}>
            {player.firstName} {player.lastName}
          </ThemedText>
          <View style={styles.heroRow}>
            <View style={styles.krBadge}>
              <ThemedText style={styles.krLabel}>KR</ThemedText>
              <ThemedText style={styles.krValue}>&mdash;</ThemedText>
            </View>
            <View style={styles.heroPill}>
              <ThemedText style={styles.heroPillText}>{helioPos ?? player.position}</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.heroSchool}>
            {player.currentSchool} · {player.conference} · {player.level}
          </ThemedText>
        </View>

        {/* 2. Weekly Update Tabs */}
        <View style={styles.weeklyRow}>
          {weeklyTabs.map((tab) => (
            <Pressable
              key={tab.value}
              style={[styles.weeklyPill, weeklyTab === tab.value && styles.weeklyPillActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setWeeklyTab(tab.value);
              }}
            >
              <ThemedText
                style={[styles.weeklyPillText, weeklyTab === tab.value && styles.weeklyPillTextActive]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        {weeklyTab !== 'this_week' && (
          <View style={styles.snapshotCard}>
            <ThemedText style={styles.snapshotText}>
              Snapshot data not available yet.
            </ThemedText>
          </View>
        )}

        {/* 3. Identity Block */}
        <View style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>IDENTITY</ThemedText>
          <View style={styles.identityGrid}>
            <IdentityRow label="Position" value={`${player.position} (${helioLabel})`} />
            <IdentityRow label="Team" value={player.currentSchool} />
            <IdentityRow label="Conference" value={player.conference} />
            <IdentityRow label="Level" value={player.level} />
            <IdentityRow label="Height" value={player.height} />
            <IdentityRow label="Weight" value={player.weight ? `${player.weight} lbs` : '\u2014'} />
            <IdentityRow label="Class Year" value={player.classYear} />
            <IdentityRow label="State" value={player.state} />
          </View>
        </View>

        {/* 4. Ratings Block (Accordion) */}
        <View style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>RATINGS</ThemedText>
          {CLUSTER_ORDER.map((cluster) => {
            const isExpanded = expandedCluster === cluster;
            const subTraits = TRAIT_LIBRARY[cluster];
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
                    <ThemedText style={styles.clusterValue}>&mdash;</ThemedText>
                    <IconSymbol
                      name={isExpanded ? 'chevron.up' : 'chevron.down'}
                      size={12}
                      color={GRAY}
                    />
                  </View>
                </Pressable>
                {isExpanded && (
                  <View style={styles.subTraitList}>
                    {subTraits.map((st) => (
                      <View key={st.id} style={styles.subTraitRow}>
                        <ThemedText style={styles.subTraitLabel}>{st.label}</ThemedText>
                        <ThemedText style={styles.subTraitValue}>&mdash;</ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* 5. Performance Block */}
        <View style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>SEASON STATS</ThemedText>
          {season ? (
            <>
              <ThemedText style={styles.seasonLabel}>{season.season} · {season.school}</ThemedText>
              <View style={styles.statsGrid}>
                <StatBox label="GP" value={String(season.gp)} />
                <StatBox label="MPG" value={season.mpg.toFixed(1)} />
                <StatBox label="PPG" value={season.ppg.toFixed(1)} />
                <StatBox label="RPG" value={season.rpg.toFixed(1)} />
                <StatBox label="APG" value={season.apg.toFixed(1)} />
                <StatBox label="FG%" value={`${season.fgPct}%`} />
                <StatBox label="3P%" value={season.threePct > 0 ? `${season.threePct}%` : '\u2014'} />
                <StatBox label="FT%" value={`${season.ftPct}%`} />
              </View>
            </>
          ) : (
            <ThemedText style={styles.emptyText}>No season data available</ThemedText>
          )}
        </View>

        {/* 6. Similar Players */}
        <View style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>SIMILAR PLAYERS</ThemedText>
          <ThemedText style={styles.emptyText}>
            Similar players available when rating data exists.
          </ThemedText>
        </View>

        {/* 7. Team Context */}
        <View style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>TEAM CONTEXT</ThemedText>
          <ThemedText style={styles.teamContextText}>
            {player.currentSchool} · {player.conference} · {player.level}
          </ThemedText>
          <Pressable
            style={styles.viewTeamBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
              // Navigate back and set team filter — handled by parent via params
              router.setParams({ filterTeam: player.currentSchool });
            }}
          >
            <ThemedText style={styles.viewTeamBtnText}>View Team</ThemedText>
          </Pressable>
        </View>

        {/* 8. Bottom Action */}
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

// ─── Sub-Components ───

function IdentityRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.identityRow}>
      <ThemedText style={styles.identityLabel}>{label}</ThemedText>
      <ThemedText style={styles.identityValue}>{value}</ThemedText>
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

// ─── Styles ───

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  // Nav bar
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

  // Hero Card
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
  heroPill: {
    backgroundColor: DIVIDER,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: WHITE,
  },
  heroSchool: {
    fontSize: 13,
    color: GRAY,
  },

  // Weekly tabs
  weeklyRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.md,
  },
  weeklyPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: CARD_BG,
  },
  weeklyPillActive: {
    backgroundColor: WHITE,
  },
  weeklyPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: GRAY,
  },
  weeklyPillTextActive: {
    color: BG,
  },
  snapshotCard: {
    backgroundColor: CARD_BG,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  snapshotText: {
    fontSize: 13,
    color: GRAY,
    fontStyle: 'italic',
  },

  // Section card
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

  // Identity grid
  identityGrid: {
    gap: 2,
  },
  identityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIVIDER,
  },
  identityLabel: {
    fontSize: 13,
    color: GRAY,
  },
  identityValue: {
    fontSize: 13,
    fontWeight: '500',
    color: WHITE,
  },

  // Ratings accordion
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
    color: WHITE,
  },
  subTraitList: {
    paddingLeft: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  subTraitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  subTraitLabel: {
    fontSize: 13,
    color: GRAY,
  },
  subTraitValue: {
    fontSize: 13,
    fontWeight: '500',
    color: WHITE,
  },

  // Season stats
  seasonLabel: {
    fontSize: 12,
    color: GRAY,
    marginBottom: Spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statBox: {
    width: '23%',
    backgroundColor: BG,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: WHITE,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: GRAY,
    marginTop: 2,
  },

  // Empty text
  emptyText: {
    fontSize: 13,
    color: GRAY,
    fontStyle: 'italic',
  },

  // Team context
  teamContextText: {
    fontSize: 14,
    color: WHITE,
    marginBottom: Spacing.sm,
  },
  viewTeamBtn: {
    backgroundColor: DIVIDER,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  viewTeamBtnText: {
    fontSize: 14,
    fontWeight: '600',
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
