/**
 * Sports Stats V2 — Full Team Statistics Hub (7 Tabs)
 * Pill tabs: Dashboard, Traditional, KR Intelligence, Clusters, Lineups, Play Types, Players
 * RBAC-driven via getStatsHubTabs(role)
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ModeColors } from '@/constants/theme'
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMembershipId } from '@/context/app-context';

import {
  TEAM_IDENTITY,
  TEAM_DASHBOARD,
  TEAM_AVERAGES,
  SYSTEM_IDENTITY,
  LAST_5,
  SPLITS_MATRIX,
  TOP_LINEUPS,
  LINEUP_KR_OVERLAYS,
  PLAY_TYPE_SUMMARY,
  GAME_LOG,
  PLAYER_LEADERBOARD,
} from '@/data/mock-stats-v2';

import {
  getSportsRole,
  getStatsHubTabs,
  getKRVisibility,
  formatKR,
  type StatsTab,
  type KRVisibility,
} from '@/utils/sports-rbac';

import { getKRColor, CLUSTER_LABELS, CLUSTER_ORDER } from '@/utils/kr-display';
import { PLAYER_CLUSTERS, CLUSTER_SUBCLUSTERS, getPlayerSubclusters, type ClusterRatings } from '@/data/roster-data';
import { computePlayerBadges } from '@/utils/player-badges';
import { openPlayerCard } from '@/utils/global-entity-sheets';
import { jerseyArchetypeMap } from '@/data/fmu';

export function SportsStatsV2() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const membershipId = useMembershipId();
  const role = getSportsRole(membershipId);
  const krVis = getKRVisibility(role);

  const tabs = useMemo(() => getStatsHubTabs(role), [role]);
  const [activeTab, setActiveTab] = useState<StatsTab>(tabs[0]?.key ?? 'dashboard');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Pill Bar */}
      <View style={styles.pillBar}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.pill, activeTab === tab.key && { backgroundColor: accent }]}
            onPress={() => setActiveTab(tab.key)}
          >
            <ThemedText style={[styles.pillText, { color: activeTab === tab.key ? '#000' : colors.textSecondary }]}>
              {tab.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {activeTab === 'dashboard' && <DashboardView colors={colors} accent={accent} krVis={krVis} />}
      {activeTab === 'traditional' && <TraditionalView colors={colors} accent={accent} />}
      {activeTab === 'kr_intelligence' && <KRIntelligenceView colors={colors} accent={accent} krVis={krVis} />}
      {activeTab === 'clusters' && <ClustersView colors={colors} accent={accent} />}
      {activeTab === 'lineups' && <LineupsView colors={colors} accent={accent} krVis={krVis} />}
      {activeTab === 'play_types' && <PlayTypesView colors={colors} accent={accent} />}
      {activeTab === 'players' && <PlayersView colors={colors} accent={accent} krVis={krVis} />}
    </View>
  );
}

// =============================================================================
// DASHBOARD VIEW
// =============================================================================

function DashboardView({ colors, accent, krVis }: { colors: typeof Colors.light; accent: string; krVis: KRVisibility }) {
  const ti = TEAM_IDENTITY;
  const td = TEAM_DASHBOARD;
  const si = SYSTEM_IDENTITY;
  const ta = TEAM_AVERAGES;
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Identity + Record */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <ThemedText style={[styles.cardTitle, { color: colors.text }]}>{ti.name}</ThemedText>
          {krVis !== 'hidden' && (
            <View style={[styles.badge, { backgroundColor: getKRColor(ti.teamKR) }]}>
              <ThemedText style={styles.badgeText}>KR {formatKR(ti.teamKR, krVis)}</ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={[styles.cardSub, { color: colors.textSecondary }]}>
          {ti.level} · {ti.conference} · {ti.record} ({ti.confRecord} conf) · {ti.streak}
        </ThemedText>

        {/* Last 5 inline */}
        <View style={[styles.row, { marginTop: 8, gap: 6 }]}>
          <ThemedText style={{ fontSize: 10, fontWeight: '700', color: colors.textTertiary, letterSpacing: 0.3 }}>L5</ThemedText>
          {LAST_5.map((g, i) => (
            <View key={i} style={[styles.last5Dot, { backgroundColor: g.result === 'W' ? '#22c55e' : '#ef4444' }]} />
          ))}
        </View>

        {/* KR + Ratings Row */}
        <View style={[styles.row, { marginTop: 10, gap: 16 }]}>
          {krVis !== 'hidden' && (
            <>
              <View>
                <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>OFF KR</ThemedText>
                <ThemedText style={[styles.metricValue, { color: getKRColor(ti.offKR) }]}>{formatKR(ti.offKR, krVis)}</ThemedText>
              </View>
              <View>
                <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>DEF KR</ThemedText>
                <ThemedText style={[styles.metricValue, { color: getKRColor(ti.defKR) }]}>{formatKR(ti.defKR, krVis)}</ThemedText>
              </View>
            </>
          )}
          <View>
            <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>Pace</ThemedText>
            <ThemedText style={[styles.metricValue, { color: colors.text }]}>{td.pace}</ThemedText>
          </View>
          <View>
            <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>Off Rtg</ThemedText>
            <ThemedText style={[styles.metricValue, { color: colors.text }]}>{td.offRtg}</ThemedText>
          </View>
          <View>
            <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>Def Rtg</ThemedText>
            <ThemedText style={[styles.metricValue, { color: colors.text }]}>{td.defRtg}</ThemedText>
          </View>
          <View>
            <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>Net Rtg</ThemedText>
            <ThemedText style={[styles.metricValue, { color: ta.netRtg >= 0 ? '#22c55e' : '#ef4444' }]}>
              {ta.netRtg > 0 ? '+' : ''}{ta.netRtg.toFixed(1)}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* System Identity with confidence % */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionLabel, { color: accent }]}>System Identity</ThemedText>
        <View style={[styles.row, { gap: 16 }]}>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>OFFENSE</ThemedText>
            <ThemedText style={[styles.metricValue, { color: colors.text, fontSize: 13 }]}>{si.offenseLabel}</ThemedText>
            <ThemedText style={{ fontSize: 10, color: '#22c55e', fontWeight: '600', marginTop: 2 }}>{si.offConfidencePct}% confidence</ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>DEFENSE</ThemedText>
            <ThemedText style={[styles.metricValue, { color: colors.text, fontSize: 13 }]}>{si.defenseLabel}</ThemedText>
            <ThemedText style={{ fontSize: 10, color: '#22c55e', fontWeight: '600', marginTop: 2 }}>{si.defConfidencePct}% confidence</ThemedText>
          </View>
          <View>
            <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>TEMPO</ThemedText>
            <ThemedText style={[styles.metricValue, { color: colors.text, fontSize: 13 }]}>{si.tempoLabel}</ThemedText>
            <ThemedText style={{ fontSize: 10, color: colors.textTertiary, fontWeight: '600', marginTop: 2 }}>#{si.paceRank} conf</ThemedText>
          </View>
        </View>
      </View>

      {/* Key Trends — last 5 sparkline */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionLabel, { color: accent }]}>Last 5 Trends</ThemedText>
        <View style={[styles.row, { gap: 20, flexWrap: 'wrap' }]}>
          {GAME_LOG.slice(0, 5).map((g, i) => (
            <View key={g.id} style={{ alignItems: 'center', gap: 4 }}>
              <View style={[styles.last5Dot, { backgroundColor: g.result === 'W' ? '#22c55e' : '#ef4444' }]} />
              <ThemedText style={{ fontSize: 10, fontWeight: '700', color: g.result === 'W' ? '#22c55e' : '#ef4444' }}>{g.result}</ThemedText>
              <ThemedText style={{ fontSize: 9, color: colors.textSecondary }} numberOfLines={1}>{g.opponent.split(' ').slice(-1)[0]}</ThemedText>
              <ThemedText style={{ fontSize: 9, color: colors.textTertiary }}>{g.offRtg} ORtg</ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Four Factors */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Four Factors</ThemedText>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.ffHeader}>
          <ThemedText style={[styles.ffLabel, { color: colors.textSecondary, flex: 0.4 }]}>Factor</ThemedText>
          <ThemedText style={[styles.ffLabel, { color: colors.textSecondary, flex: 0.3, textAlign: 'center' }]}>Offense</ThemedText>
          <ThemedText style={[styles.ffLabel, { color: colors.textSecondary, flex: 0.3, textAlign: 'center' }]}>Defense</ThemedText>
        </View>
        {(['eFG', 'toPct', 'orebPct', 'ftRate'] as const).map((key) => {
          const labels: Record<string, string> = { eFG: 'eFG%', toPct: 'TO%', orebPct: 'OREB%', ftRate: 'FT Rate' };
          return (
            <View key={key} style={styles.ffRow}>
              <ThemedText style={[styles.ffCell, { flex: 0.4, color: colors.text }]}>{labels[key]}</ThemedText>
              <ThemedText style={[styles.ffCell, { flex: 0.3, textAlign: 'center', color: colors.text }]}>{td.offFourFactors[key].toFixed(1)}</ThemedText>
              <ThemedText style={[styles.ffCell, { flex: 0.3, textAlign: 'center', color: colors.text }]}>{td.defFourFactors[key].toFixed(1)}</ThemedText>
            </View>
          );
        })}
      </View>

      {/* Shot Profile */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Shot Profile</ThemedText>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.ffHeader}>
          <ThemedText style={[styles.ffLabel, { flex: 0.25, color: colors.textSecondary }]}>Zone</ThemedText>
          <ThemedText style={[styles.ffLabel, { flex: 0.25, textAlign: 'center', color: colors.textSecondary }]}>Freq</ThemedText>
          <ThemedText style={[styles.ffLabel, { flex: 0.25, textAlign: 'center', color: colors.textSecondary }]}>eFG%</ThemedText>
          <ThemedText style={[styles.ffLabel, { flex: 0.25, textAlign: 'center', color: colors.textSecondary }]}>PPP</ThemedText>
        </View>
        {td.shotProfile.map((sp) => (
          <View key={sp.zone} style={styles.ffRow}>
            <ThemedText style={[styles.ffCell, { flex: 0.25, color: colors.text }]}>{sp.zone}</ThemedText>
            <ThemedText style={[styles.ffCell, { flex: 0.25, textAlign: 'center', color: colors.text }]}>{sp.freq}%</ThemedText>
            <ThemedText style={[styles.ffCell, { flex: 0.25, textAlign: 'center', color: colors.text }]}>{sp.efg > 0 ? sp.efg + '%' : '—'}</ThemedText>
            <ThemedText style={[styles.ffCell, { flex: 0.25, textAlign: 'center', color: colors.text }]}>{sp.ppp}</ThemedText>
          </View>
        ))}
      </View>
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// =============================================================================
// TRADITIONAL VIEW (Synergy-level: Team Averages, Splits, Game Log)
// =============================================================================

function TraditionalView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  const ta = TEAM_AVERAGES;
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);

  const avgGrid: { label: string; value: string }[] = [
    { label: 'PPG', value: ta.ppg.toFixed(1) },
    { label: 'OPP PPG', value: ta.oppPpg.toFixed(1) },
    { label: 'RPG', value: ta.rpg.toFixed(1) },
    { label: 'APG', value: ta.apg.toFixed(1) },
    { label: 'SPG', value: ta.spg.toFixed(1) },
    { label: 'BPG', value: ta.bpg.toFixed(1) },
    { label: 'TOV', value: ta.topg.toFixed(1) },
    { label: 'FG%', value: ta.fgPct.toFixed(1) },
    { label: '3P%', value: ta.threePct.toFixed(1) },
    { label: 'FT%', value: ta.ftPct.toFixed(1) },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Team Averages Grid */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Team Averages</ThemedText>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.avgGrid}>
          {avgGrid.map((item) => (
            <View key={item.label} style={styles.avgGridItem}>
              <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>{item.label}</ThemedText>
              <ThemedText style={[styles.metricValue, { color: colors.text }]}>{item.value}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Splits */}
      {SPLITS_MATRIX.map((group) => (
        <View key={group.category}>
          <ThemedText style={[styles.sectionTitle, { color: accent }]}>{group.categoryLabel}</ThemedText>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.ffHeader}>
              <ThemedText style={[styles.ffLabel, { flex: 0.3, color: colors.textSecondary }]}>Split</ThemedText>
              <ThemedText style={[styles.ffLabel, { flex: 0.175, textAlign: 'center', color: colors.textSecondary }]}>ORtg</ThemedText>
              <ThemedText style={[styles.ffLabel, { flex: 0.175, textAlign: 'center', color: colors.textSecondary }]}>DRtg</ThemedText>
              <ThemedText style={[styles.ffLabel, { flex: 0.175, textAlign: 'center', color: colors.textSecondary }]}>Net</ThemedText>
              <ThemedText style={[styles.ffLabel, { flex: 0.175, textAlign: 'center', color: colors.textSecondary }]}>eFG%</ThemedText>
            </View>
            {group.rows.map((row) => (
              <View key={row.label} style={styles.ffRow}>
                <ThemedText style={[styles.ffCell, { flex: 0.3, color: colors.text }]}>{row.label}</ThemedText>
                <ThemedText style={[styles.ffCell, { flex: 0.175, textAlign: 'center', color: colors.text }]}>{row.offRtg}</ThemedText>
                <ThemedText style={[styles.ffCell, { flex: 0.175, textAlign: 'center', color: colors.text }]}>{row.defRtg}</ThemedText>
                <ThemedText style={[styles.ffCell, { flex: 0.175, textAlign: 'center', color: row.netRtg >= 0 ? '#22c55e' : '#ef4444' }]}>
                  {row.netRtg > 0 ? '+' : ''}{row.netRtg}
                </ThemedText>
                <ThemedText style={[styles.ffCell, { flex: 0.175, textAlign: 'center', color: colors.text }]}>{row.eFG}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      ))}

      {/* Game Log with expandable rows */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Game Log</ThemedText>
      {GAME_LOG.map((game) => (
        <Pressable
          key={game.id}
          onPress={() => setExpandedGameId(expandedGameId === game.id ? null : game.id)}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 8 }]}
        >
          <View style={styles.row}>
            <View style={[styles.resultDot, { backgroundColor: game.result === 'W' ? '#22c55e' : '#ef4444' }]} />
            <ThemedText style={[styles.glOpponent, { color: colors.text }]}>{game.result} vs {game.opponent}</ThemedText>
            <ThemedText style={[styles.glScore, { color: colors.textSecondary }]}>{game.score}</ThemedText>
            <IconSymbol name={expandedGameId === game.id ? 'chevron.up' : 'chevron.down'} size={12} color={colors.textTertiary} />
          </View>
          <ThemedText style={[styles.glDate, { color: colors.textSecondary }]}>{game.date}</ThemedText>
          {expandedGameId === game.id && (
            <View style={styles.glExpanded}>
              <View style={[styles.row, { gap: 16, marginTop: 8 }]}>
                <View>
                  <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>PACE</ThemedText>
                  <ThemedText style={[styles.metricValue, { color: colors.text, fontSize: 13 }]}>{game.pace}</ThemedText>
                </View>
                <View>
                  <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>ORtg</ThemedText>
                  <ThemedText style={[styles.metricValue, { color: colors.text, fontSize: 13 }]}>{game.offRtg}</ThemedText>
                </View>
                <View>
                  <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>DRtg</ThemedText>
                  <ThemedText style={[styles.metricValue, { color: colors.text, fontSize: 13 }]}>{game.defRtg}</ThemedText>
                </View>
                <View>
                  <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>eFG%</ThemedText>
                  <ThemedText style={[styles.metricValue, { color: colors.text, fontSize: 13 }]}>{game.eFG}</ThemedText>
                </View>
              </View>
              <ThemedText style={[styles.glSwing, { color: accent }]}>Swing: {game.swingFactor}</ThemedText>
            </View>
          )}
        </Pressable>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// =============================================================================
// KR INTELLIGENCE VIEW — The KaNeXT layer
// Sort by: KR, OKR, DKR, any cluster, Fit %, Name
// Team averages row at top, archetype badges, system fit %
// =============================================================================

type KRSortKey = 'kr' | 'offKR' | 'defKR' | 'name' | 'fitPct' | 'shooting' | 'finishing' | 'playmaking' | 'on_ball_defense' | 'team_defense' | 'rebounding' | 'physical';

// Mock system fit % per player (based on KR + position alignment)
function getSystemFitPct(kr: number, position: string): number {
  const base = Math.min(95, Math.max(55, Math.round(50 + kr * 0.45)));
  // Guards get slight fit boost for Motion Read & React, bigs for Pack Line
  if (position === 'PG' || position === 'CG') return Math.min(99, base + 4);
  if (position === 'B' || position === 'F') return Math.min(99, base + 2);
  return base;
}

function KRIntelligenceView({ colors, accent, krVis }: { colors: typeof Colors.light; accent: string; krVis: KRVisibility }) {
  const [sortKey, setSortKey] = useState<KRSortKey>('kr');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Compute team cluster averages
  const teamClusterAvgs = useMemo(() => {
    const nums = Object.keys(PLAYER_CLUSTERS);
    const sums: Record<string, number> = {};
    for (const key of CLUSTER_ORDER) sums[key] = 0;
    for (const num of nums) {
      const c = PLAYER_CLUSTERS[num];
      for (const key of CLUSTER_ORDER) sums[key] += c[key];
    }
    const avgs: Record<string, number> = {};
    for (const key of CLUSTER_ORDER) avgs[key] = nums.length > 0 ? Math.round(sums[key] / nums.length) : 0;
    return avgs;
  }, []);

  const sorted = useMemo(() => {
    const list = PLAYER_LEADERBOARD.map((p) => ({
      ...p,
      fitPct: getSystemFitPct(p.kr, p.position),
      clusters: PLAYER_CLUSTERS[p.number],
    }));
    list.sort((a, b) => {
      if (sortKey === 'name') return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      if (sortKey === 'fitPct') return sortAsc ? a.fitPct - b.fitPct : b.fitPct - a.fitPct;
      // Cluster sort
      if (a.clusters && b.clusters && (sortKey as string) in (a.clusters ?? {})) {
        const av = a.clusters[sortKey as keyof ClusterRatings] ?? 0;
        const bv = b.clusters[sortKey as keyof ClusterRatings] ?? 0;
        return sortAsc ? av - bv : bv - av;
      }
      const av = (a as any)[sortKey] ?? 0;
      const bv = (b as any)[sortKey] ?? 0;
      return sortAsc ? av - bv : bv - av;
    });
    return list;
  }, [sortKey, sortAsc]);

  const handleSort = (key: KRSortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const sortOptions: { key: KRSortKey; label: string }[] = [
    { key: 'kr', label: 'KR' },
    { key: 'offKR', label: 'OKR' },
    { key: 'defKR', label: 'DKR' },
    { key: 'fitPct', label: 'Fit %' },
    { key: 'name', label: 'Name' },
    ...CLUSTER_ORDER.map((k) => ({ key: k as KRSortKey, label: CLUSTER_LABELS[k]?.label ?? k })),
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Team Cluster Averages Row */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionLabel, { color: accent }]}>Team Cluster Averages</ThemedText>
        <View style={[styles.row, { gap: 8, flexWrap: 'wrap' }]}>
          {CLUSTER_ORDER.map((key) => (
            <View key={key} style={{ alignItems: 'center', minWidth: 60 }}>
              <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>{CLUSTER_LABELS[key]?.label ?? key}</ThemedText>
              <ThemedText style={[styles.metricValue, { color: getKRColor(teamClusterAvgs[key]), fontSize: 14 }]}>{teamClusterAvgs[key]}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Sort Bar — scrollable */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        <View style={[styles.row, { gap: 6 }]}>
          {sortOptions.map(({ key, label }) => {
            const active = sortKey === key;
            return (
              <Pressable key={key} onPress={() => handleSort(key)} style={[styles.sortPill, active && { backgroundColor: accent }]}>
                <ThemedText style={[styles.sortPillText, { color: active ? '#000' : colors.textSecondary }]}>
                  {label}{active ? (sortAsc ? ' ↑' : ' ↓') : ''}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Player Rows */}
      {sorted.map((p) => {
        const expanded = expandedId === p.id;
        const krColor = getKRColor(p.kr);
        const archetype = jerseyArchetypeMap.get(p.number);

        return (
          <Pressable
            key={p.id}
            onPress={() => setExpandedId(expanded ? null : p.id)}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 8 }]}
          >
            <View style={styles.row}>
              <ThemedText style={[styles.playerName, { color: colors.text }]}>{p.name}</ThemedText>
              <ThemedText style={[styles.playerPos, { color: accent }]}>{p.position}</ThemedText>
              {krVis !== 'hidden' && (
                <View style={[styles.badge, { backgroundColor: krColor }]}>
                  <ThemedText style={styles.badgeText}>KR {formatKR(p.kr, krVis)}</ThemedText>
                </View>
              )}
            </View>
            {krVis !== 'hidden' && (
              <View style={[styles.row, { marginTop: 6, gap: 12 }]}>
                <ThemedText style={{ fontSize: 11, color: colors.textSecondary }}>
                  OKR <ThemedText style={{ fontWeight: '700', color: getKRColor(p.offKR) }}>{formatKR(p.offKR, krVis)}</ThemedText>
                </ThemedText>
                <ThemedText style={{ fontSize: 11, color: colors.textSecondary }}>
                  DKR <ThemedText style={{ fontWeight: '700', color: getKRColor(p.defKR) }}>{formatKR(p.defKR, krVis)}</ThemedText>
                </ThemedText>
                <ThemedText style={{ fontSize: 11, color: p.fitPct >= 80 ? '#22c55e' : '#f59e0b' }}>
                  Fit {p.fitPct}%
                </ThemedText>
              </View>
            )}

            {expanded && p.clusters && (
              <View style={{ marginTop: 12 }}>
                {/* Archetype Badge */}
                {archetype && (
                  <View style={[styles.archetypeBadge, { borderColor: accent }]}>
                    <ThemedText style={{ fontSize: 11, fontWeight: '700', color: accent }}>{archetype}</ThemedText>
                  </View>
                )}

                {/* System Fit */}
                <View style={[styles.row, { marginTop: 8, gap: 12 }]}>
                  <ThemedText style={{ fontSize: 11, color: colors.textSecondary }}>
                    System Fit: <ThemedText style={{ fontWeight: '700', color: p.fitPct >= 80 ? '#22c55e' : '#f59e0b' }}>{p.fitPct}%</ThemedText>
                  </ThemedText>
                  <ThemedText style={{ fontSize: 10, color: colors.textTertiary }}>
                    {SYSTEM_IDENTITY.offenseLabel} + {SYSTEM_IDENTITY.defenseLabel}
                  </ThemedText>
                </View>

                {/* 7 Cluster Bars */}
                <View style={{ marginTop: 10 }}>
                  {CLUSTER_ORDER.map((clusterKey) => {
                    const val = p.clusters[clusterKey];
                    const info = CLUSTER_LABELS[clusterKey];
                    return (
                      <View key={clusterKey} style={{ marginBottom: 6 }}>
                        <View style={[styles.row, { justifyContent: 'space-between' }]}>
                          <ThemedText style={{ fontSize: 11, color: colors.textSecondary }}>{info?.label ?? clusterKey}</ThemedText>
                          <ThemedText style={{ fontSize: 11, fontWeight: '700', color: getKRColor(val) }}>{val}</ThemedText>
                        </View>
                        <View style={styles.clusterBarBg}>
                          <View style={[styles.clusterBarFill, { width: `${val}%`, backgroundColor: getKRColor(val) }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Badges */}
                {(() => {
                  const badges = computePlayerBadges(
                    p.clusters,
                    (ck) => getPlayerSubclusters(p.number, ck),
                  );
                  if (badges.length === 0) return null;
                  return (
                    <View style={[styles.row, { flexWrap: 'wrap', gap: 6, marginTop: 8 }]}>
                      {badges.map((b, i) => {
                        const badgeColor = b.level === 'Gold' ? accent : b.level === 'Silver' ? '#9C9790' : accent;
                        return (
                          <View key={i} style={[styles.badgeChip, { borderColor: badgeColor }]}>
                            <ThemedText style={{ fontSize: 10, fontWeight: '700', color: badgeColor }}>{b.level[0]}</ThemedText>
                            <ThemedText style={{ fontSize: 10, color: colors.text }}>{b.name}</ThemedText>
                          </View>
                        );
                      })}
                    </View>
                  );
                })()}

                {/* View Full Card */}
                <Pressable
                  onPress={() => openPlayerCard({ name: p.name, number: p.number, position: p.position, kr: p.kr, offKR: p.offKR, defKR: p.defKR })}
                  style={{ marginTop: 10 }}
                >
                  <ThemedText style={{ fontSize: 12, fontWeight: '600', color: accent }}>View Full Player Card →</ThemedText>
                </Pressable>
              </View>
            )}
          </Pressable>
        );
      })}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// =============================================================================
// CLUSTERS VIEW — Deep dive into 7 clusters at subcluster level
// Per-subcluster tap to expand
// =============================================================================

function ClustersView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  const [selectedCluster, setSelectedCluster] = useState<keyof ClusterRatings>('shooting');
  const [expandedSub, setExpandedSub] = useState<string | null>(null);

  const subclusters = CLUSTER_SUBCLUSTERS[selectedCluster];
  const playerNumbers = Object.keys(PLAYER_CLUSTERS);

  // Compute averages, best, worst per subcluster
  const subclusterStats = useMemo(() => {
    return subclusters.map((subName) => {
      let total = 0;
      let best = { name: '', score: 0 };
      let worst = { name: '', score: 100 };
      const playerScores: { name: string; number: string; score: number }[] = [];

      for (const num of playerNumbers) {
        const subs = getPlayerSubclusters(num, selectedCluster);
        const sub = subs.find((s) => s.name === subName);
        const score = sub?.rating ?? 0;
        total += score;

        const player = PLAYER_LEADERBOARD.find((p) => p.number === num);
        const name = player?.name ?? `#${num}`;

        playerScores.push({ name, number: num, score });
        if (score > best.score) best = { name, score };
        if (score < worst.score) worst = { name, score };
      }

      const avg = playerNumbers.length > 0 ? Math.round(total / playerNumbers.length) : 0;
      playerScores.sort((a, b) => b.score - a.score);

      return { name: subName, avg, best, worst, playerScores };
    });
  }, [selectedCluster]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Cluster Pill Selector */}
      <View style={[styles.pillBar, { paddingHorizontal: 0 }]}>
        {CLUSTER_ORDER.map((key) => {
          const info = CLUSTER_LABELS[key];
          const active = selectedCluster === key;
          return (
            <Pressable
              key={key}
              style={[styles.pill, active && { backgroundColor: accent }]}
              onPress={() => { setSelectedCluster(key); setExpandedSub(null); }}
            >
              <ThemedText style={[styles.pillText, { color: active ? '#000' : colors.textSecondary }]}>
                {info?.label ?? key}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Subclusters — each tappable to expand */}
      {subclusterStats.map((sub) => {
        const isExpanded = expandedSub === sub.name;
        return (
          <Pressable
            key={sub.name}
            onPress={() => setExpandedSub(isExpanded ? null : sub.name)}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 8 }]}
          >
            <View style={[styles.row, { justifyContent: 'space-between' }]}>
              <ThemedText style={[styles.subclusterName, { color: colors.text }]}>{sub.name}</ThemedText>
              <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down'} size={12} color={colors.textTertiary} />
            </View>
            {/* Team Average Bar */}
            <View style={{ marginTop: 6 }}>
              <View style={[styles.row, { justifyContent: 'space-between' }]}>
                <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>Team Avg</ThemedText>
                <ThemedText style={{ fontSize: 11, fontWeight: '700', color: getKRColor(sub.avg) }}>{sub.avg}</ThemedText>
              </View>
              <View style={styles.clusterBarBg}>
                <View style={[styles.clusterBarFill, { width: `${sub.avg}%`, backgroundColor: getKRColor(sub.avg) }]} />
              </View>
            </View>
            {/* Best / Worst */}
            <View style={[styles.row, { justifyContent: 'space-between', marginTop: 8 }]}>
              <ThemedText style={{ fontSize: 11, color: '#22c55e' }}>Best: {sub.best.name} ({sub.best.score})</ThemedText>
              <ThemedText style={{ fontSize: 11, color: '#ef4444' }}>Low: {sub.worst.name} ({sub.worst.score})</ThemedText>
            </View>

            {/* Expanded: every player's score, sorted high→low */}
            {isExpanded && (
              <View style={{ marginTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#2F3336', paddingTop: 8 }}>
                {sub.playerScores.map((ps) => (
                  <View key={ps.number} style={[styles.row, { justifyContent: 'space-between', paddingVertical: 4 }]}>
                    <ThemedText style={{ fontSize: 12, color: colors.text }}>{ps.name}</ThemedText>
                    <View style={[styles.row, { gap: 6 }]}>
                      <View style={[styles.clusterBarBg, { width: 60 }]}>
                        <View style={[styles.clusterBarFill, { width: `${ps.score}%`, backgroundColor: getKRColor(ps.score) }]} />
                      </View>
                      <ThemedText style={{ fontSize: 12, fontWeight: '700', color: getKRColor(ps.score), width: 28, textAlign: 'right' }}>{ps.score}</ThemedText>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Pressable>
        );
      })}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// =============================================================================
// LINEUPS VIEW (with KR overlay + sort)
// =============================================================================

type LineupSortKey = 'minutes' | 'netRtg' | 'fitPct';

function LineupsView({ colors, accent, krVis }: { colors: typeof Colors.light; accent: string; krVis: KRVisibility }) {
  const [sortKey, setSortKey] = useState<LineupSortKey>('minutes');

  const krMap = useMemo(() => {
    const m: Record<string, typeof LINEUP_KR_OVERLAYS[0]> = {};
    for (const o of LINEUP_KR_OVERLAYS) m[o.lineupId] = o;
    return m;
  }, []);

  const sorted = useMemo(() => {
    const list = [...TOP_LINEUPS];
    list.sort((a, b) => {
      if (sortKey === 'minutes') return b.minutes - a.minutes;
      if (sortKey === 'netRtg') return b.netRtg - a.netRtg;
      const aFit = krMap[a.id]?.fitPct ?? 0;
      const bFit = krMap[b.id]?.fitPct ?? 0;
      return bFit - aFit;
    });
    return list;
  }, [sortKey, krMap]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Sort Toggle */}
      <View style={[styles.row, { gap: 8, marginBottom: 12 }]}>
        {(['minutes', 'netRtg', 'fitPct'] as LineupSortKey[]).map((key) => {
          const labels: Record<LineupSortKey, string> = { minutes: 'Minutes', netRtg: 'Net Rtg', fitPct: 'Fit %' };
          const active = sortKey === key;
          return (
            <Pressable key={key} onPress={() => setSortKey(key)} style={[styles.sortPill, active && { backgroundColor: accent }]}>
              <ThemedText style={[styles.sortPillText, { color: active ? '#000' : colors.textSecondary }]}>{labels[key]}</ThemedText>
            </Pressable>
          );
        })}
      </View>

      {sorted.map((lu, idx) => {
        const overlay = krMap[lu.id];
        return (
          <View key={lu.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 10 }]}>
            <View style={styles.row}>
              <View style={[styles.rankBadge, { backgroundColor: accent }]}>
                <ThemedText style={styles.badgeText}>#{idx + 1}</ThemedText>
              </View>
              <ThemedText style={[styles.cardSub, { color: colors.textSecondary }]}>{lu.minutes} min · {lu.possessions} poss</ThemedText>
            </View>
            <ThemedText style={[styles.lineupPlayers, { color: colors.text }]}>{lu.players.join(' • ')}</ThemedText>
            <View style={[styles.row, { marginTop: 8, gap: 16 }]}>
              <View>
                <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>Net</ThemedText>
                <ThemedText style={[styles.metricValue, { color: lu.netRtg >= 0 ? '#22c55e' : '#ef4444' }]}>
                  {lu.netRtg > 0 ? '+' : ''}{lu.netRtg}
                </ThemedText>
              </View>
              <View>
                <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>ORtg</ThemedText>
                <ThemedText style={[styles.metricValue, { color: colors.text }]}>{lu.offRtg}</ThemedText>
              </View>
              <View>
                <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>DRtg</ThemedText>
                <ThemedText style={[styles.metricValue, { color: colors.text }]}>{lu.defRtg}</ThemedText>
              </View>
              {overlay && krVis !== 'hidden' && (
                <>
                  <View>
                    <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>KR</ThemedText>
                    <ThemedText style={[styles.metricValue, { color: getKRColor(overlay.combinedKR) }]}>
                      {formatKR(overlay.combinedKR, krVis)}
                    </ThemedText>
                  </View>
                  <View>
                    <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>Fit</ThemedText>
                    <ThemedText style={[styles.metricValue, { color: overlay.fitPct >= 80 ? '#22c55e' : '#f59e0b' }]}>
                      {overlay.fitPct}%
                    </ThemedText>
                  </View>
                </>
              )}
            </View>
          </View>
        );
      })}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// =============================================================================
// PLAY TYPES VIEW (team/individual toggle, Synergy-style)
// =============================================================================

function PlayTypesView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  const [viewMode, setViewMode] = useState<'team' | 'individual'>('team');
  const offense = PLAY_TYPE_SUMMARY.filter((p) => p.category === 'offense');
  const defense = PLAY_TYPE_SUMMARY.filter((p) => p.category === 'defense');

  // Mock individual leaders per play type
  const individualLeaders: Record<string, { name: string; ppp: number }[]> = {
    'PNR Ball Handler': [{ name: 'D. Cole', ppp: 1.02 }, { name: 'A. Garland', ppp: 0.88 }],
    'PNR Roll Man': [{ name: 'D. Williams', ppp: 1.18 }, { name: 'M. Peeples', ppp: 1.06 }],
    'Spot-Up': [{ name: 'J. Brown', ppp: 1.14 }, { name: 'T. Singleton', ppp: 0.98 }],
    'Transition': [{ name: 'D. Cole', ppp: 1.22 }, { name: 'C. Henderson', ppp: 1.08 }],
    'Cuts': [{ name: 'M. Peeples', ppp: 1.32 }, { name: 'D. Williams', ppp: 1.18 }],
    'Isolation': [{ name: 'D. Cole', ppp: 0.94 }, { name: 'A. Garland', ppp: 0.78 }],
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Team / Individual Toggle */}
      <View style={[styles.row, { gap: 8, marginBottom: 12 }]}>
        {(['team', 'individual'] as const).map((mode) => {
          const active = viewMode === mode;
          return (
            <Pressable key={mode} onPress={() => setViewMode(mode)} style={[styles.sortPill, active && { backgroundColor: accent }]}>
              <ThemedText style={[styles.sortPillText, { color: active ? '#000' : colors.textSecondary }]}>
                {mode === 'team' ? 'Team' : 'Individual'}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <ThemedText style={[styles.sectionTitle, { color: accent }]}>Offense</ThemedText>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {offense.map((pt) => (
          <View key={pt.type}>
            <View style={styles.ptRow}>
              <ThemedText style={[styles.ptType, { color: colors.text }]}>{pt.type}</ThemedText>
              <ThemedText style={[styles.ptStat, { color: colors.textSecondary }]}>{pt.possPct}%</ThemedText>
              <ThemedText style={[styles.ptStat, { color: colors.text }]}>{pt.ppp} PPP</ThemedText>
              <View style={[styles.percentileBadge, { backgroundColor: pt.percentile >= 70 ? '#22c55e22' : pt.percentile >= 50 ? '#f59e0b22' : '#ef444422' }]}>
                <ThemedText style={[styles.percentileText, { color: pt.percentile >= 70 ? '#22c55e' : pt.percentile >= 50 ? '#f59e0b' : '#ef4444' }]}>
                  {pt.percentile}th
                </ThemedText>
              </View>
            </View>
            {viewMode === 'individual' && individualLeaders[pt.type] && (
              <View style={{ paddingLeft: 16, paddingBottom: 6 }}>
                {individualLeaders[pt.type].map((leader, i) => (
                  <ThemedText key={i} style={{ fontSize: 11, color: colors.textSecondary }}>
                    {leader.name}: {leader.ppp} PPP
                  </ThemedText>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>

      <ThemedText style={[styles.sectionTitle, { color: accent }]}>Defense</ThemedText>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {defense.map((pt) => (
          <View key={pt.type} style={styles.ptRow}>
            <ThemedText style={[styles.ptType, { color: colors.text }]}>{pt.type}</ThemedText>
            <ThemedText style={[styles.ptStat, { color: colors.textSecondary }]}>{pt.possPct}%</ThemedText>
            <ThemedText style={[styles.ptStat, { color: colors.text }]}>{pt.ppp} PPP</ThemedText>
            <View style={[styles.percentileBadge, { backgroundColor: pt.percentile >= 70 ? '#22c55e22' : pt.percentile >= 50 ? '#f59e0b22' : '#ef444422' }]}>
              <ThemedText style={[styles.percentileText, { color: pt.percentile >= 70 ? '#22c55e' : pt.percentile >= 50 ? '#f59e0b' : '#ef4444' }]}>
                {pt.percentile}th
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// =============================================================================
// PLAYERS VIEW — sortable table, tap → full player entity sheet
// =============================================================================

type PlayerSortKey = 'name' | 'pts' | 'rpg' | 'apg' | 'spg' | 'bpg' | 'mpg' | 'fgPct' | 'threePct' | 'ftPct' | 'kr';

function PlayersView({ colors, accent, krVis }: { colors: typeof Colors.light; accent: string; krVis: KRVisibility }) {
  const [sortKey, setSortKey] = useState<PlayerSortKey>('pts');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key: PlayerSortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const sorted = useMemo(() => {
    const list = [...PLAYER_LEADERBOARD];
    list.sort((a, b) => {
      if (sortKey === 'name') return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return sortAsc ? av - bv : bv - av;
    });
    return list;
  }, [sortKey, sortAsc]);

  const columns: { key: PlayerSortKey; label: string; width: number }[] = [
    { key: 'name', label: 'Name', width: 100 },
    { key: 'pts', label: 'PPG', width: 48 },
    { key: 'rpg', label: 'RPG', width: 48 },
    { key: 'apg', label: 'APG', width: 48 },
    { key: 'spg', label: 'SPG', width: 48 },
    { key: 'bpg', label: 'BPG', width: 48 },
    { key: 'mpg', label: 'MPG', width: 48 },
    { key: 'fgPct', label: 'FG%', width: 48 },
    { key: 'threePct', label: '3P%', width: 48 },
    { key: 'ftPct', label: 'FT%', width: 48 },
    ...(krVis !== 'hidden' ? [{ key: 'kr' as PlayerSortKey, label: 'KR', width: 48 }] : []),
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header */}
          <View style={[styles.tableRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            {columns.map((col) => {
              const active = sortKey === col.key;
              return (
                <Pressable key={col.key} onPress={() => handleSort(col.key)} style={{ width: col.width, paddingVertical: 8 }}>
                  <ThemedText style={[styles.tableHeader, { color: active ? accent : colors.textSecondary }]}>
                    {col.label}{active ? (sortAsc ? ' ↑' : ' ↓') : ''}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {/* Rows */}
          {sorted.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => openPlayerCard({ name: p.name, number: p.number, position: p.position, kr: p.kr, offKR: p.offKR, defKR: p.defKR })}
              style={[styles.tableRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
            >
              {columns.map((col) => {
                let value: string;
                if (col.key === 'name') {
                  value = `${p.name} (${p.position})`;
                } else if (col.key === 'kr') {
                  value = formatKR(p.kr, krVis);
                } else {
                  value = (p[col.key] as number).toFixed(1);
                }
                const isKR = col.key === 'kr';
                return (
                  <View key={col.key} style={{ width: col.width, paddingVertical: 10 }}>
                    <ThemedText
                      style={[
                        styles.tableCell,
                        { color: isKR ? getKRColor(p.kr) : colors.text },
                        col.key === 'name' && { fontWeight: '600', fontSize: 12 },
                      ]}
                      numberOfLines={1}
                    >
                      {value}
                    </ThemedText>
                  </View>
                );
              })}
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  pillBar: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#2F3336' },
  pillText: { fontSize: 12, fontWeight: '600' },

  card: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginTop: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionLabel: { fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },

  cardTitle: { fontSize: 17, fontWeight: '800', flex: 1 },
  cardSub: { fontSize: 12, marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  rankBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },

  metricLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase' },
  metricValue: { fontSize: 15, fontWeight: '700', marginTop: 1 },

  // Four Factors / Tables
  ffHeader: { flexDirection: 'row', paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#2F3336' },
  ffLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  ffRow: { flexDirection: 'row', paddingVertical: 6 },
  ffCell: { fontSize: 13 },

  // Team Averages Grid
  avgGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  avgGridItem: { width: '18%' as any, alignItems: 'center', paddingVertical: 8 },

  // Lineups
  lineupPlayers: { fontSize: 13, fontWeight: '600', marginTop: 6 },

  // Play Types
  ptRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  ptType: { fontSize: 13, fontWeight: '600', flex: 1 },
  ptStat: { fontSize: 12, width: 52, textAlign: 'right' },
  percentileBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginLeft: 4 },
  percentileText: { fontSize: 11, fontWeight: '700' },

  // Game Log
  resultDot: { width: 8, height: 8, borderRadius: 4 },
  glOpponent: { fontSize: 14, fontWeight: '600', flex: 1 },
  glScore: { fontSize: 14, fontWeight: '700' },
  glDate: { fontSize: 11, marginTop: 4 },
  glSwing: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  glExpanded: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#2F3336', marginTop: 8, paddingTop: 4 },

  // Players
  playerName: { fontSize: 15, fontWeight: '700', flex: 1 },
  playerPos: { fontSize: 13, fontWeight: '600' },

  // Sort Pills
  sortPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#2F3336' },
  sortPillText: { fontSize: 11, fontWeight: '600' },

  // Cluster Bars
  clusterBarBg: { height: 6, borderRadius: 3, backgroundColor: '#2F3336', marginTop: 3 },
  clusterBarFill: { height: 6, borderRadius: 3 },

  // Badge Chips
  badgeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },

  // Archetype Badge
  archetypeBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },

  // Subcluster
  subclusterName: { fontSize: 13, fontWeight: '600' },

  // Last 5
  last5Dot: { width: 12, height: 12, borderRadius: 6 },

  // Sortable Table
  tableRow: { flexDirection: 'row', alignItems: 'center' },
  tableHeader: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  tableCell: { fontSize: 12 },
});
