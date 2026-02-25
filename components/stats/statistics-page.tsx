/**
 * Statistics Page — KaNeXT Intelligence (4 Tabs)
 *
 * Route: SportsHomeDashboard → StatisticsPage
 *
 * RBAC: Assistant Coach / Recruiting Coordinator (execution-level).
 * Can: View all rating surfaces — team, player, standings, rankings.
 * Cannot: Modify rating models, edit coverage tier, change normalization
 *         rules, access internal weight tables.
 *
 * This page shows descriptive intelligence, not predictive modeling.
 * No betting framing. No model internals. Read-only.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccentColor } from '@/hooks/use-accent-color';
import {
  TEAM_IDENTITY,
  TEAM_DASHBOARD,
  SYSTEM_IDENTITY,
  PLAYER_LEADERBOARD,
  type PlayerStatRow,
} from '@/data/mock-stats-v2';
import { KaNeXT_STANDINGS, KaNeXT_RECORD } from '@/data/fmu';
import { getKRColor } from '@/utils/kr-display';

// =============================================================================
// CONSTANTS
// =============================================================================

type TabId = 'team' | 'players' | 'standings' | 'rankings';
type PlayersToggle = 'roster' | 'clusters';
type StandingsSub = 'conference' | 'top25';
type RankScope = 'conference' | 'division' | 'universal';
type RankView = 'top25' | 'full';

const CLUSTER_LENSES = [
  'Shooting', 'Finishing', 'Playmaking', 'On-Ball D', 'Team D', 'Rebounding', 'Frame',
] as const;

// =============================================================================
// MOCK DATA — Rankings, Top 25
// =============================================================================

interface RankedTeam {
  rank: number;
  team: string;
  rating: number;
  record: string;
  isUs?: boolean;
}

const CONFERENCE_RANKINGS: RankedTeam[] = [
  { rank: 1, team: 'Providence', rating: 78, record: '24-6' },
  { rank: 2, team: 'Carroll College', rating: 74, record: '22-8', isUs: true },
  { rank: 3, team: 'Rocky Mountain', rating: 72, record: '20-10' },
  { rank: 4, team: 'MSU-Northern', rating: 70, record: '18-12' },
  { rank: 5, team: 'Montana Tech', rating: 68, record: '16-14' },
  { rank: 6, team: 'Multnomah', rating: 66, record: '14-16' },
  { rank: 7, team: 'Magnolia', rating: 64, record: '12-18' },
  { rank: 8, team: 'Dakota State University', rating: 62, record: '10-20' },
];

const DIVISION_RANKINGS: RankedTeam[] = [
  { rank: 1, team: 'Indiana Wesleyan', rating: 86, record: '28-2' },
  { rank: 2, team: 'Georgetown (KY)', rating: 84, record: '26-4' },
  { rank: 3, team: 'Wayland Baptist', rating: 83, record: '25-5' },
  { rank: 4, team: 'Carroll (MT)', rating: 82, record: '24-6' },
  { rank: 5, team: 'Loyola (LA)', rating: 81, record: '23-7' },
  { rank: 6, team: 'Southeastern', rating: 80, record: '22-8' },
  { rank: 7, team: 'Missouri Valley', rating: 79, record: '22-8' },
  { rank: 8, team: 'Providence', rating: 78, record: '24-6' },
  { rank: 9, team: 'MidAmerica Nazarene', rating: 77, record: '21-9' },
  { rank: 10, team: 'Campbellsville', rating: 76, record: '20-10' },
  { rank: 11, team: 'Life Pacific', rating: 76, record: '20-10' },
  { rank: 12, team: 'Oklahoma City', rating: 75, record: '20-10' },
  { rank: 13, team: 'Carroll College', rating: 74, record: '22-8', isUs: true },
  { rank: 14, team: 'Columbia (MO)', rating: 74, record: '19-11' },
  { rank: 15, team: 'Lewis-Clark State', rating: 73, record: '19-11' },
  { rank: 16, team: 'Rocky Mountain', rating: 72, record: '20-10' },
  { rank: 17, team: 'Olivet Nazarene', rating: 72, record: '19-11' },
  { rank: 18, team: 'Bethel (IN)', rating: 71, record: '18-12' },
  { rank: 19, team: 'Bryan', rating: 71, record: '18-12' },
  { rank: 20, team: 'Lindsey Wilson', rating: 70, record: '18-12' },
  { rank: 21, team: 'Marian (IN)', rating: 70, record: '17-13' },
  { rank: 22, team: 'MSU-Northern', rating: 70, record: '18-12' },
  { rank: 23, team: 'Central Christian', rating: 69, record: '17-13' },
  { rank: 24, team: 'Dakota State University', rating: 68, record: '16-14' },
  { rank: 25, team: 'Montana Tech', rating: 68, record: '16-14' },
];

const TOP_25_STANDINGS: { rank: number; team: string; record: string }[] = [
  { rank: 1, team: 'Indiana Wesleyan', record: '28-2' },
  { rank: 2, team: 'Georgetown (KY)', record: '26-4' },
  { rank: 3, team: 'Wayland Baptist', record: '25-5' },
  { rank: 4, team: 'Carroll (MT)', record: '24-6' },
  { rank: 5, team: 'Loyola (LA)', record: '23-7' },
  { rank: 6, team: 'Southeastern', record: '22-8' },
  { rank: 7, team: 'Missouri Valley', record: '22-8' },
  { rank: 8, team: 'Providence', record: '24-6' },
  { rank: 9, team: 'MidAmerica Nazarene', record: '21-9' },
  { rank: 10, team: 'Campbellsville', record: '20-10' },
  { rank: 11, team: 'Life Pacific', record: '20-10' },
  { rank: 12, team: 'Oklahoma City', record: '20-10' },
  { rank: 13, team: 'Carroll College', record: '22-8' },
  { rank: 14, team: 'Columbia (MO)', record: '19-11' },
  { rank: 15, team: 'Lewis-Clark State', record: '19-11' },
  { rank: 16, team: 'Rocky Mountain', record: '20-10' },
  { rank: 17, team: 'Olivet Nazarene', record: '19-11' },
  { rank: 18, team: 'Bethel (IN)', record: '18-12' },
  { rank: 19, team: 'Bryan', record: '18-12' },
  { rank: 20, team: 'Lindsey Wilson', record: '18-12' },
  { rank: 21, team: 'Marian (IN)', record: '17-13' },
  { rank: 22, team: 'MSU-Northern', record: '18-12' },
  { rank: 23, team: 'Central Christian', record: '17-13' },
  { rank: 24, team: 'Dakota State University', record: '16-14' },
  { rank: 25, team: 'Montana Tech', record: '16-14' },
];

// Mock cluster scores per player
const CLUSTER_SCORES: Record<string, Record<string, number>> = {
  'ps-1': { Shooting: 82, Finishing: 74, Playmaking: 86, 'On-Ball D': 72, 'Team D': 70, Rebounding: 58, Frame: 68 },
  'ps-2': { Shooting: 84, Finishing: 72, Playmaking: 68, 'On-Ball D': 74, 'Team D': 72, Rebounding: 62, Frame: 70 },
  'ps-3': { Shooting: 76, Finishing: 78, Playmaking: 74, 'On-Ball D': 76, 'Team D': 78, Rebounding: 72, Frame: 74 },
  'ps-4': { Shooting: 68, Finishing: 80, Playmaking: 60, 'On-Ball D': 70, 'Team D': 76, Rebounding: 82, Frame: 78 },
  'ps-5': { Shooting: 56, Finishing: 82, Playmaking: 54, 'On-Ball D': 68, 'Team D': 80, Rebounding: 84, Frame: 82 },
  'ps-6': { Shooting: 78, Finishing: 66, Playmaking: 76, 'On-Ball D': 62, 'Team D': 60, Rebounding: 56, Frame: 64 },
  'ps-7': { Shooting: 72, Finishing: 64, Playmaking: 70, 'On-Ball D': 66, 'Team D': 68, Rebounding: 60, Frame: 66 },
  'ps-8': { Shooting: 64, Finishing: 76, Playmaking: 52, 'On-Ball D': 68, 'Team D': 74, Rebounding: 78, Frame: 76 },
  'ps-9': { Shooting: 52, Finishing: 74, Playmaking: 48, 'On-Ball D': 64, 'Team D': 72, Rebounding: 76, Frame: 74 },
  'ps-10': { Shooting: 76, Finishing: 58, Playmaking: 80, 'On-Ball D': 56, 'Team D': 54, Rebounding: 48, Frame: 58 },
};

// =============================================================================
// HELPERS
// =============================================================================

function getSystemFitPct(): number {
  return Math.round((SYSTEM_IDENTITY.offConfidencePct + SYSTEM_IDENTITY.defConfidencePct) / 2);
}

function getConfidenceColor(pct: number): string {
  if (pct >= 80) return Brand.success;
  if (pct >= 65) return Brand.primary;
  if (pct >= 50) return Brand.warning;
  return Brand.error;
}

// =============================================================================
// PROPS
// =============================================================================

interface StatisticsPageProps {
  onBack: () => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function StatisticsPage({ onBack }: StatisticsPageProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();

  // ── Tab State ──
  const [activeTab, setActiveTab] = useState<TabId>('team');

  // ── Players Tab State ──
  const [playersToggle, setPlayersToggle] = useState<PlayersToggle>('roster');
  const [clusterLens, setClusterLens] = useState<typeof CLUSTER_LENSES[number]>('Shooting');

  // ── Standings Tab State ──
  const [standingsSub, setStandingsSub] = useState<StandingsSub>('conference');

  // ── Rankings Tab State ──
  const [rankScope, setRankScope] = useState<RankScope>('conference');
  const [rankViewType, setRankViewType] = useState<RankView>('top25');

  // Navigate to rankings with filter pre-applied
  const openRankings = useCallback((scope: RankScope) => {
    setRankScope(scope);
    setActiveTab('rankings');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Rankings data by scope
  const rankingsData = useMemo(() => {
    if (rankScope === 'conference') return CONFERENCE_RANKINGS;
    // division + universal both use DIVISION_RANKINGS for demo
    return DIVISION_RANKINGS;
  }, [rankScope]);

  const top25 = useMemo(() => rankingsData.slice(0, 25), [rankingsData]);
  const ourRank = useMemo(() => rankingsData.find(r => r.isUs), [rankingsData]);

  // Sorted players for cluster view
  const clusterSorted = useMemo(() => {
    return [...PLAYER_LEADERBOARD].sort((a, b) => {
      const aScore = CLUSTER_SCORES[a.id]?.[clusterLens] ?? 0;
      const bScore = CLUSTER_SCORES[b.id]?.[clusterLens] ?? 0;
      return bScore - aScore;
    });
  }, [clusterLens]);

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════════

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>

      {/* ═══════ STICKY HEADER ═══════ */}
      <View style={[styles.stickyHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={20} color={accent} />
        </Pressable>

        <Text style={[styles.headerTitle, { color: colors.text }]}>Statistics</Text>

        <View style={styles.headerRight}>
          <View style={[styles.chip, { backgroundColor: colors.card }]}>
            <Text style={[styles.chipText, { color: colors.textSecondary }]}>2025–26</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: Brand.primary + '20' }]}>
            <Text style={[styles.chipText, { color: Brand.primary }]}>{TEAM_IDENTITY.coverageBadge}</Text>
          </View>
        </View>
      </View>

      {/* ═══════ TAB BAR ═══════ */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabBar, { borderBottomColor: colors.border }]}
        contentContainerStyle={styles.tabBarContent}
      >
        {(['team', 'players', 'standings', 'rankings'] as TabId[]).map(tab => {
          const isActive = activeTab === tab;
          const label = tab === 'team' ? 'Team' : tab === 'players' ? 'Players' : tab === 'standings' ? 'Standings' : 'Rankings';
          return (
            <Pressable
              key={tab}
              style={[
                styles.tabPill,
                {
                  backgroundColor: isActive ? accent + '20' : 'transparent',
                  borderColor: isActive ? accent : colors.border,
                },
              ]}
              onPress={() => {
                setActiveTab(tab);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[styles.tabPillText, { color: isActive ? accent : colors.textSecondary }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ═══════ SCROLLABLE CONTENT ═══════ */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 1 — TEAM                                                   */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'team' && (
          <>
            {/* Block A — Team Rating (Header Card) */}
            <View style={[styles.ratingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.ratingRow}>
                <View style={styles.ratingPrimary}>
                  <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>Overall Rating</Text>
                  <Text style={[styles.ratingBig, { color: getKRColor(TEAM_IDENTITY.teamKR) }]}>
                    {TEAM_IDENTITY.teamKR}
                  </Text>
                </View>
                <View style={[styles.ratingDivider, { backgroundColor: colors.border }]} />
                <View style={styles.ratingSecondary}>
                  <View style={styles.ratingPair}>
                    <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>Off Rating</Text>
                    <Text style={[styles.ratingMed, { color: getKRColor(TEAM_IDENTITY.offKR) }]}>
                      {TEAM_IDENTITY.offKR}
                    </Text>
                  </View>
                  <View style={styles.ratingPair}>
                    <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>Def Rating</Text>
                    <Text style={[styles.ratingMed, { color: getKRColor(TEAM_IDENTITY.defKR) }]}>
                      {TEAM_IDENTITY.defKR}
                    </Text>
                  </View>
                </View>
              </View>

              {/* System Fit + Confidence */}
              <View style={[styles.fitRow, { borderTopColor: colors.border }]}>
                <View style={styles.fitItem}>
                  <Text style={[styles.fitLabel, { color: colors.textTertiary }]}>System Fit</Text>
                  <Text style={[styles.fitValue, { color: getConfidenceColor(getSystemFitPct()) }]}>
                    {getSystemFitPct()}%
                  </Text>
                </View>
                <View style={styles.fitItem}>
                  <Text style={[styles.fitLabel, { color: colors.textTertiary }]}>Off Fit</Text>
                  <Text style={[styles.fitValue, { color: getConfidenceColor(SYSTEM_IDENTITY.offConfidencePct) }]}>
                    {SYSTEM_IDENTITY.offConfidencePct}%
                  </Text>
                </View>
                <View style={styles.fitItem}>
                  <Text style={[styles.fitLabel, { color: colors.textTertiary }]}>Def Fit</Text>
                  <Text style={[styles.fitValue, { color: getConfidenceColor(SYSTEM_IDENTITY.defConfidencePct) }]}>
                    {SYSTEM_IDENTITY.defConfidencePct}%
                  </Text>
                </View>
                <View style={styles.fitItem}>
                  <Text style={[styles.fitLabel, { color: colors.textTertiary }]}>Confidence</Text>
                  <Text style={[styles.fitValue, { color: getConfidenceColor(84) }]}>84%</Text>
                </View>
              </View>
            </View>

            {/* Block B — Rating Breakdown */}
            <BlockHeader title="Rating Breakdown" colors={colors} />
            <View style={[styles.breakdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Split bar */}
              <View style={styles.splitBarContainer}>
                <View style={[styles.splitBarOff, { backgroundColor: Brand.success + '40' }]}>
                  <Text style={[styles.splitBarText, { color: Brand.success }]}>Offense 53%</Text>
                </View>
                <View style={[styles.splitBarDef, { backgroundColor: Brand.primary + '40' }]}>
                  <Text style={[styles.splitBarText, { color: Brand.primary }]}>Defense 47%</Text>
                </View>
              </View>
              {/* Top 3 Drivers */}
              <Text style={[styles.driversTitle, { color: colors.textSecondary }]}>Top Drivers</Text>
              {['Defensive rebounding', 'Turnover control', '3PA rate'].map((d, i) => (
                <View key={i} style={styles.driverBullet}>
                  <View style={[styles.bulletDot, { backgroundColor: accent }]} />
                  <Text style={[styles.driverText, { color: colors.text }]}>{d}</Text>
                </View>
              ))}
            </View>

            {/* Block C — Where We Rank */}
            <BlockHeader title="Where We Rank" colors={colors} />
            <View style={[styles.rankCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Pressable style={styles.rankRow} onPress={() => openRankings('conference')}>
                <Text style={[styles.rankLabel, { color: colors.textSecondary }]}>Conference Rating Rank</Text>
                <View style={styles.rankRight}>
                  <Text style={[styles.rankValue, { color: colors.text }]}>#{TEAM_IDENTITY.confStanding}</Text>
                  <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
                </View>
              </Pressable>
              <View style={[styles.rankDivider, { backgroundColor: colors.border }]} />
              <Pressable style={styles.rankRow} onPress={() => openRankings('division')}>
                <Text style={[styles.rankLabel, { color: colors.textSecondary }]}>Division Rating Rank (NAIA)</Text>
                <View style={styles.rankRight}>
                  <Text style={[styles.rankValue, { color: colors.text }]}>#13</Text>
                  <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
                </View>
              </Pressable>
              <View style={[styles.rankDivider, { backgroundColor: colors.border }]} />
              <Pressable style={styles.rankRow} onPress={() => openRankings('universal')}>
                <Text style={[styles.rankLabel, { color: colors.textSecondary }]}>Universal Rating Rank</Text>
                <View style={styles.rankRight}>
                  <Text style={[styles.rankValue, { color: colors.text }]}>#52</Text>
                  <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
                </View>
              </Pressable>
            </View>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 2 — PLAYERS                                                */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'players' && (
          <>
            {/* Toggle: Roster / Clusters */}
            <View style={[styles.segmentRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Pressable
                style={[styles.segmentBtn, playersToggle === 'roster' && { backgroundColor: accent + '20' }]}
                onPress={() => setPlayersToggle('roster')}
              >
                <Text style={[styles.segmentText, { color: playersToggle === 'roster' ? accent : colors.textSecondary }]}>
                  Roster
                </Text>
              </Pressable>
              <Pressable
                style={[styles.segmentBtn, playersToggle === 'clusters' && { backgroundColor: accent + '20' }]}
                onPress={() => setPlayersToggle('clusters')}
              >
                <Text style={[styles.segmentText, { color: playersToggle === 'clusters' ? accent : colors.textSecondary }]}>
                  Clusters
                </Text>
              </Pressable>
            </View>

            {playersToggle === 'roster' ? (
              /* Roster View */
              <>
                {/* Table header */}
                <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.thCell, styles.thName, { color: colors.textTertiary }]}>Player</Text>
                  <Text style={[styles.thCell, styles.thSmall, { color: colors.textTertiary }]}>Pos</Text>
                  <Text style={[styles.thCell, styles.thNum, { color: colors.textTertiary }]}>KR</Text>
                  <Text style={[styles.thCell, styles.thNum, { color: colors.textTertiary }]}>Off</Text>
                  <Text style={[styles.thCell, styles.thNum, { color: colors.textTertiary }]}>Def</Text>
                  <Text style={[styles.thCell, styles.thStatus, { color: colors.textTertiary }]}>Status</Text>
                </View>
                {PLAYER_LEADERBOARD.map(p => (
                  <Pressable
                    key={p.id}
                    style={[styles.tableRow, { borderBottomColor: colors.border }]}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <View style={[styles.tdCell, styles.thName]}>
                      <Text style={[styles.tdName, { color: colors.text }]}>{p.name}</Text>
                      <Text style={[styles.tdNumber, { color: colors.textTertiary }]}>#{p.number}</Text>
                    </View>
                    <Text style={[styles.tdCell, styles.thSmall, styles.tdText, { color: colors.textSecondary }]}>{p.position}</Text>
                    <Text style={[styles.tdCell, styles.thNum, styles.tdBold, { color: getKRColor(p.kr) }]}>{p.kr}</Text>
                    <Text style={[styles.tdCell, styles.thNum, styles.tdText, { color: colors.textSecondary }]}>{p.offKR}</Text>
                    <Text style={[styles.tdCell, styles.thNum, styles.tdText, { color: colors.textSecondary }]}>{p.defKR}</Text>
                    <View style={[styles.tdCell, styles.thStatus]}>
                      <View style={[styles.availChip, { backgroundColor: Brand.success + '18' }]}>
                        <Text style={[styles.availText, { color: Brand.success }]}>Avail</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </>
            ) : (
              /* Clusters View */
              <>
                {/* Lens pills */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.lensStrip}
                  contentContainerStyle={styles.lensStripContent}
                >
                  {CLUSTER_LENSES.map(lens => {
                    const isActive = clusterLens === lens;
                    return (
                      <Pressable
                        key={lens}
                        style={[
                          styles.lensPill,
                          {
                            backgroundColor: isActive ? accent + '20' : colors.card,
                            borderColor: isActive ? accent : colors.border,
                          },
                        ]}
                        onPress={() => {
                          setClusterLens(lens);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                      >
                        <Text style={[styles.lensPillText, { color: isActive ? accent : colors.textSecondary }]}>
                          {lens}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {/* Cluster table header */}
                <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.thCell, styles.thName, { color: colors.textTertiary }]}>Player</Text>
                  <Text style={[styles.thCell, styles.thSmall, { color: colors.textTertiary }]}>Pos</Text>
                  <Text style={[styles.thCell, styles.thNum, { color: colors.textTertiary }]}>{clusterLens}</Text>
                  <Text style={[styles.thCell, styles.thNum, { color: colors.textTertiary }]}>KR</Text>
                </View>
                {clusterSorted.map(p => {
                  const score = CLUSTER_SCORES[p.id]?.[clusterLens] ?? 0;
                  return (
                    <Pressable
                      key={p.id}
                      style={[styles.tableRow, { borderBottomColor: colors.border }]}
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    >
                      <View style={[styles.tdCell, styles.thName]}>
                        <Text style={[styles.tdName, { color: colors.text }]}>{p.name}</Text>
                        <Text style={[styles.tdNumber, { color: colors.textTertiary }]}>#{p.number}</Text>
                      </View>
                      <Text style={[styles.tdCell, styles.thSmall, styles.tdText, { color: colors.textSecondary }]}>{p.position}</Text>
                      <Text style={[styles.tdCell, styles.thNum, styles.tdBold, { color: getKRColor(score) }]}>{score}</Text>
                      <Text style={[styles.tdCell, styles.thNum, styles.tdText, { color: colors.textSecondary }]}>{p.kr}</Text>
                    </Pressable>
                  );
                })}
              </>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 3 — STANDINGS                                              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'standings' && (
          <>
            {/* Sub-tabs */}
            <View style={[styles.segmentRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Pressable
                style={[styles.segmentBtn, standingsSub === 'conference' && { backgroundColor: accent + '20' }]}
                onPress={() => setStandingsSub('conference')}
              >
                <Text style={[styles.segmentText, { color: standingsSub === 'conference' ? accent : colors.textSecondary }]}>
                  Conference
                </Text>
              </Pressable>
              <Pressable
                style={[styles.segmentBtn, standingsSub === 'top25' && { backgroundColor: accent + '20' }]}
                onPress={() => setStandingsSub('top25')}
              >
                <Text style={[styles.segmentText, { color: standingsSub === 'top25' ? accent : colors.textSecondary }]}>
                  Top 25
                </Text>
              </Pressable>
            </View>

            {standingsSub === 'conference' ? (
              <>
                {/* Conference standings table header */}
                <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.thCell, styles.thName, { color: colors.textTertiary }]}>Team</Text>
                  <Text style={[styles.thCell, styles.thNum, { color: colors.textTertiary }]}>Conf</Text>
                  <Text style={[styles.thCell, styles.thNum, { color: colors.textTertiary }]}>Overall</Text>
                  <Text style={[styles.thCell, styles.thSmall, { color: colors.textTertiary }]}>GB</Text>
                </View>
                {KaNeXT_STANDINGS.map((t: any, i: number) => {
                  const isUs = t.team === 'Carroll College';
                  const leaderW = KaNeXT_STANDINGS[0]?.confW ?? 0;
                  const leaderL = KaNeXT_STANDINGS[0]?.confL ?? 0;
                  const gb = i === 0 ? '—' : (((leaderW - t.confW) + (t.confL - leaderL)) / 2).toFixed(1);
                  return (
                    <View
                      key={i}
                      style={[
                        styles.tableRow,
                        { borderBottomColor: colors.border },
                        isUs && { backgroundColor: accent + '08' },
                      ]}
                    >
                      <View style={[styles.tdCell, styles.thName]}>
                        <Text style={[styles.tdName, { color: isUs ? accent : colors.text }]}>{t.team}</Text>
                      </View>
                      <Text style={[styles.tdCell, styles.thNum, styles.tdText, { color: colors.textSecondary }]}>
                        {t.confW}–{t.confL}
                      </Text>
                      <Text style={[styles.tdCell, styles.thNum, styles.tdText, { color: colors.textSecondary }]}>
                        {t.overallW}–{t.overallL}
                      </Text>
                      <Text style={[styles.tdCell, styles.thSmall, styles.tdText, { color: colors.textTertiary }]}>
                        {gb}
                      </Text>
                    </View>
                  );
                })}
              </>
            ) : (
              <>
                {/* Top 25 standings table header */}
                <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.thCell, { width: 32, color: colors.textTertiary }]}>#</Text>
                  <Text style={[styles.thCell, styles.thName, { color: colors.textTertiary }]}>Team</Text>
                  <Text style={[styles.thCell, styles.thNum, { color: colors.textTertiary }]}>Record</Text>
                </View>
                {TOP_25_STANDINGS.map(t => {
                  const isUs = t.team === 'Carroll College' || t.team === 'Carroll (MT)';
                  return (
                    <View
                      key={t.rank}
                      style={[
                        styles.tableRow,
                        { borderBottomColor: colors.border },
                        isUs && { backgroundColor: accent + '08' },
                      ]}
                    >
                      <Text style={[styles.tdCell, { width: 32 }, styles.tdBold, { color: colors.textTertiary }]}>
                        {t.rank}
                      </Text>
                      <View style={[styles.tdCell, styles.thName]}>
                        <Text style={[styles.tdName, { color: isUs ? accent : colors.text }]}>{t.team}</Text>
                      </View>
                      <Text style={[styles.tdCell, styles.thNum, styles.tdText, { color: colors.textSecondary }]}>
                        {t.record}
                      </Text>
                    </View>
                  );
                })}
              </>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 4 — RANKINGS                                               */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'rankings' && (
          <>
            {/* Filters Row */}
            <View style={styles.filtersRow}>
              {/* Scope */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterGroup}>
                {(['conference', 'division', 'universal'] as RankScope[]).map(scope => {
                  const isActive = rankScope === scope;
                  const label = scope === 'conference' ? 'Conference' : scope === 'division' ? 'Division' : 'Universal';
                  return (
                    <Pressable
                      key={scope}
                      style={[
                        styles.filterPill,
                        {
                          backgroundColor: isActive ? accent + '20' : colors.card,
                          borderColor: isActive ? accent : colors.border,
                        },
                      ]}
                      onPress={() => {
                        setRankScope(scope);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <Text style={[styles.filterPillText, { color: isActive ? accent : colors.textSecondary }]}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              {/* View toggle */}
              <View style={[styles.segmentRowSmall, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Pressable
                  style={[styles.segmentBtnSmall, rankViewType === 'top25' && { backgroundColor: accent + '20' }]}
                  onPress={() => setRankViewType('top25')}
                >
                  <Text style={[styles.segmentTextSmall, { color: rankViewType === 'top25' ? accent : colors.textSecondary }]}>
                    Top 25
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.segmentBtnSmall, rankViewType === 'full' && { backgroundColor: accent + '20' }]}
                  onPress={() => setRankViewType('full')}
                >
                  <Text style={[styles.segmentTextSmall, { color: rankViewType === 'full' ? accent : colors.textSecondary }]}>
                    Full List
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Division badge */}
            {rankScope !== 'conference' && (
              <View style={[styles.chip, { backgroundColor: Brand.primary + '20', alignSelf: 'flex-start', marginBottom: Spacing.sm }]}>
                <Text style={[styles.chipText, { color: Brand.primary }]}>NAIA</Text>
              </View>
            )}

            {/* Rankings table header */}
            <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.thCell, { width: 32, color: colors.textTertiary }]}>#</Text>
              <Text style={[styles.thCell, styles.thName, { color: colors.textTertiary }]}>Team</Text>
              <Text style={[styles.thCell, styles.thNum, { color: colors.textTertiary }]}>Rating</Text>
              <Text style={[styles.thCell, styles.thNum, { color: colors.textTertiary }]}>Record</Text>
            </View>

            {rankViewType === 'top25' ? (
              /* Top 25 View */
              top25.map(t => {
                const isUs = t.isUs === true;
                return (
                  <Pressable
                    key={t.rank}
                    style={[
                      styles.tableRow,
                      { borderBottomColor: colors.border },
                      isUs && { backgroundColor: accent + '08' },
                    ]}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <Text style={[styles.tdCell, { width: 32 }, styles.tdBold, { color: colors.textTertiary }]}>
                      {t.rank}
                    </Text>
                    <View style={[styles.tdCell, styles.thName]}>
                      <Text style={[styles.tdName, { color: isUs ? accent : colors.text }]}>{t.team}</Text>
                    </View>
                    <Text style={[styles.tdCell, styles.thNum, styles.tdBold, { color: getKRColor(t.rating) }]}>
                      {t.rating}
                    </Text>
                    <Text style={[styles.tdCell, styles.thNum, styles.tdText, { color: colors.textSecondary }]}>
                      {t.record}
                    </Text>
                  </Pressable>
                );
              })
            ) : (
              /* Full List View */
              <>
                {/* Top 25 */}
                {top25.map(t => {
                  const isUs = t.isUs === true;
                  return (
                    <Pressable
                      key={t.rank}
                      style={[
                        styles.tableRow,
                        { borderBottomColor: colors.border },
                        isUs && { backgroundColor: accent + '08' },
                      ]}
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    >
                      <Text style={[styles.tdCell, { width: 32 }, styles.tdBold, { color: colors.textTertiary }]}>
                        {t.rank}
                      </Text>
                      <View style={[styles.tdCell, styles.thName]}>
                        <Text style={[styles.tdName, { color: isUs ? accent : colors.text }]}>{t.team}</Text>
                      </View>
                      <Text style={[styles.tdCell, styles.thNum, styles.tdBold, { color: getKRColor(t.rating) }]}>
                        {t.rating}
                      </Text>
                      <Text style={[styles.tdCell, styles.thNum, styles.tdText, { color: colors.textSecondary }]}>
                        {t.record}
                      </Text>
                    </Pressable>
                  );
                })}

                {/* "You Are Here" block — if our team is outside top 25 */}
                {ourRank && ourRank.rank > 25 && (
                  <>
                    <View style={styles.youAreHereDivider}>
                      <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                      <Text style={[styles.dividerText, { color: colors.textTertiary }]}>...</Text>
                      <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                    </View>

                    {/* 5 above */}
                    {rankingsData
                      .filter(r => r.rank >= ourRank.rank - 5 && r.rank < ourRank.rank)
                      .map(t => (
                        <View key={t.rank} style={[styles.tableRow, { borderBottomColor: colors.border }]}>
                          <Text style={[styles.tdCell, { width: 32 }, styles.tdBold, { color: colors.textTertiary }]}>{t.rank}</Text>
                          <View style={[styles.tdCell, styles.thName]}>
                            <Text style={[styles.tdName, { color: colors.text }]}>{t.team}</Text>
                          </View>
                          <Text style={[styles.tdCell, styles.thNum, styles.tdBold, { color: getKRColor(t.rating) }]}>{t.rating}</Text>
                          <Text style={[styles.tdCell, styles.thNum, styles.tdText, { color: colors.textSecondary }]}>{t.record}</Text>
                        </View>
                      ))}

                    {/* You are here */}
                    <View style={[styles.youAreHereRow, { backgroundColor: accent + '10', borderColor: accent }]}>
                      <Text style={[styles.tdCell, { width: 32 }, styles.tdBold, { color: accent }]}>{ourRank.rank}</Text>
                      <View style={[styles.tdCell, styles.thName]}>
                        <Text style={[styles.tdName, { color: accent }]}>{ourRank.team}</Text>
                        <Text style={[styles.youAreHereLabel, { color: accent }]}>You Are Here</Text>
                      </View>
                      <Text style={[styles.tdCell, styles.thNum, styles.tdBold, { color: accent }]}>{ourRank.rating}</Text>
                      <Text style={[styles.tdCell, styles.thNum, styles.tdText, { color: accent }]}>{ourRank.record}</Text>
                    </View>

                    {/* 5 below */}
                    {rankingsData
                      .filter(r => r.rank > ourRank.rank && r.rank <= ourRank.rank + 5)
                      .map(t => (
                        <View key={t.rank} style={[styles.tableRow, { borderBottomColor: colors.border }]}>
                          <Text style={[styles.tdCell, { width: 32 }, styles.tdBold, { color: colors.textTertiary }]}>{t.rank}</Text>
                          <View style={[styles.tdCell, styles.thName]}>
                            <Text style={[styles.tdName, { color: colors.text }]}>{t.team}</Text>
                          </View>
                          <Text style={[styles.tdCell, styles.thNum, styles.tdBold, { color: getKRColor(t.rating) }]}>{t.rating}</Text>
                          <Text style={[styles.tdCell, styles.thNum, styles.tdText, { color: colors.textSecondary }]}>{t.record}</Text>
                        </View>
                      ))}
                  </>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function BlockHeader({ title, colors }: { title: string; colors: typeof Colors.light }) {
  return (
    <View style={styles.blockHeader}>
      <Text style={[styles.blockTitle, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  root: { flex: 1 },

  // ── Sticky Header ──
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
  },
  backBtn: {
    width: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  headerRight: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  chipText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  // ── Tab Bar ──
  tabBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexGrow: 0,
  },
  tabBarContent: {
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabPillText: { fontSize: 13, fontWeight: '600' },

  // ── Scroll ──
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },

  // ── Block Header ──
  blockHeader: { marginTop: Spacing.lg, marginBottom: Spacing.sm },
  blockTitle: { fontSize: 16, fontWeight: '700' },

  // ── Segment Control ──
  segmentRow: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  segmentText: { fontSize: 13, fontWeight: '600' },

  // ── Team Tab — Block A ──
  ratingCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingPrimary: { flex: 1, alignItems: 'center' },
  ratingLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  ratingBig: { fontSize: 36, fontWeight: '800' },
  ratingDivider: { width: 1, height: 50, marginHorizontal: 12 },
  ratingSecondary: { flex: 1, gap: 12 },
  ratingPair: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingMed: { fontSize: 20, fontWeight: '700' },
  fitRow: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  fitItem: { flex: 1, alignItems: 'center' },
  fitLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  fitValue: { fontSize: 14, fontWeight: '700' },

  // ── Team Tab — Block B ──
  breakdownCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  splitBarContainer: {
    flexDirection: 'row',
    height: 32,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 14,
  },
  splitBarOff: { flex: 53, justifyContent: 'center', alignItems: 'center' },
  splitBarDef: { flex: 47, justifyContent: 'center', alignItems: 'center' },
  splitBarText: { fontSize: 11, fontWeight: '700' },
  driversTitle: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  driverBullet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  bulletDot: { width: 6, height: 6, borderRadius: 3 },
  driverText: { fontSize: 13, fontWeight: '600' },

  // ── Team Tab — Block C ──
  rankCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rankLabel: { fontSize: 13, flex: 1 },
  rankRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rankValue: { fontSize: 16, fontWeight: '700' },
  rankDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 14 },

  // ── Table Shared ──
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  thCell: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  thName: { flex: 1 },
  thSmall: { width: 36, textAlign: 'center' },
  thNum: { width: 48, textAlign: 'center' },
  thStatus: { width: 48, alignItems: 'center' },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tdCell: {},
  tdName: { fontSize: 13, fontWeight: '600' },
  tdNumber: { fontSize: 10, marginTop: 1 },
  tdText: { fontSize: 12, textAlign: 'center' },
  tdBold: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  availChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  availText: { fontSize: 9, fontWeight: '700' },

  // ── Lens Pills (Clusters) ──
  lensStrip: { marginBottom: Spacing.sm },
  lensStripContent: { gap: 8 },
  lensPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  lensPillText: { fontSize: 12, fontWeight: '600' },

  // ── Rankings Filters ──
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    gap: 8,
  },
  filterGroup: { gap: 8 },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: { fontSize: 12, fontWeight: '600' },
  segmentRowSmall: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  segmentBtnSmall: { paddingHorizontal: 10, paddingVertical: 7 },
  segmentTextSmall: { fontSize: 11, fontWeight: '600' },

  // ── You Are Here ──
  youAreHereDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerText: { fontSize: 14, fontWeight: '600' },
  youAreHereRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 4,
  },
  youAreHereLabel: { fontSize: 9, fontWeight: '700', marginTop: 2 },
});
