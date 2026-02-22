/**
 * Stats Page — Full Team Stats Hub
 * Multi-tab workspace: Team (Overview/Offense/Defense/Lineups/Shot) + Players
 * Synergy = truth layer (what happened). KaNeXT = interpretation layer (what it means).
 */

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Data imports
import { teamStats } from '@/data/sun-conference/florida-memorial/team-stats';
import { KaNeXT_LEADERS } from '@/data/fmu';
import {
  PLAYER_CLUSTERS,
  CLUSTER_SUBCLUSTERS,
  getPlayerSubclusters,
  computeOffKR,
  computeDefKR,
} from '@/data/roster-data';
import type { ClusterRatings } from '@/data/roster-data';
import {
  OFFENSIVE_STYLE_CLUSTERS,
  DEFENSIVE_STYLE_CLUSTERS,
  CLUSTER_LABELS,
  DEFAULT_PROGRAM_CONTEXT,
} from '@/data/mock-program-context';
import { CLUSTER_ORDER, SORT_CLUSTER_LABELS } from '@/data/trait-library';
import type { ClusterType, OffensiveStyle, DefensiveStyle } from '@/types';

// Stats data
import {
  SYNERGY_SUMMARY,
  OFFENSE_PLAY_TYPES,
  DEFENSE_PLAY_TYPES,
  OFFENSE_SHOT_PROFILE,
  DEFENSE_SHOT_PROFILE,
  TEMPO_BREAKDOWN,
  DEFENSE_TEMPO_BREAKDOWN,
  BALL_SCREEN_COVERAGE,
  POST_COVERAGE,
  RIM_PROTECTION,
  THREE_PT_DEFENSE,
  THREE_PT_BREAKDOWN,
  ASSISTED_PCT,
  PLAYER_SYNERGY,
  PLAYER_SHOT_PROFILES,
} from '@/data/stats/synergy-data';
import type { PlayTypeRow, ShotZone } from '@/data/stats/synergy-data';
import { SEASON_PROJECTION } from '@/data/stats/projections';
import { TOP_LINEUPS, LINEUP_DETAILS } from '@/data/stats/lineup-data';
import type { LineupRow } from '@/data/stats/lineup-data';

// ── Constants ──

const KaNeXT_LOGO = require('@/assets/images/kx-logo.png');

type TopTab = 'team' | 'players';
type TeamSubTab = 'overview' | 'offense' | 'defense' | 'lineups' | 'shot';
type PlayerSubTab = 'overview' | 'offense' | 'defense' | 'types' | 'shot';
type Split = 'all' | 'conf' | 'non-conf' | 'last5' | 'home' | 'away';

const TEAM_SUB_TABS: { id: TeamSubTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'offense', label: 'Offense' },
  { id: 'defense', label: 'Defense' },
  { id: 'lineups', label: 'Lineups' },
  { id: 'shot', label: 'Shot' },
];

const PLAYER_SUB_TABS: { id: PlayerSubTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'offense', label: 'Offense' },
  { id: 'defense', label: 'Defense' },
  { id: 'types', label: 'Player Types' },
  { id: 'shot', label: 'Shot' },
];

const SPLITS: { id: Split; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'conf', label: 'Conf' },
  { id: 'non-conf', label: 'Non-Conf' },
  { id: 'last5', label: 'Last 5' },
  { id: 'home', label: 'Home' },
  { id: 'away', label: 'Away' },
];

const CLUSTER_KEYS: (keyof ClusterRatings)[] = [
  'shooting', 'finishing', 'playmaking',
  'perimeter_defense', 'interior_defense', 'rebounding', 'frame',
];

const CLUSTER_LABEL_MAP: Record<keyof ClusterRatings, string> = {
  shooting: 'Shooting',
  finishing: 'Finishing',
  playmaking: 'Playmaking',
  perimeter_defense: 'On-Ball Defense',
  interior_defense: 'Team Defense',
  rebounding: 'Rebounding',
  frame: 'Physical',
};

// ── Computed stats from team-stats.ts ──

const stats2526 = teamStats.find((s) => s.season === '2025-26');
const G = stats2526?.games ?? 1;
const FG = stats2526?.fg ?? 0;
const FGA = stats2526?.fga ?? 1;
const TPT = stats2526?.three_pt ?? 0;
const TPA = stats2526?.three_pa ?? 1;
const FT = stats2526?.ft ?? 0;
const FTA = stats2526?.fta ?? 1;
const OREB = stats2526?.offensive_rebounds ?? 0;
const DREB = stats2526?.defensive_rebounds ?? 0;
const TO = stats2526?.turnovers ?? 0;

// Four Factors
const eFG = ((FG + 0.5 * TPT) / FGA * 100);
const possessions = FGA - OREB + TO + 0.475 * FTA;
const TOPct = (TO / possessions * 100);
const ORBPct = (OREB / (OREB + 450) * 100); // opponent DRB estimated at 450
const FTRate = (FTA / FGA * 100);

// Mock opponent Four Factors
const OPP_eFG = 44.8;
const OPP_TOPct = 22.1;
const OPP_ORBPct = 28.4;
const OPP_FTRate = 30.2;

// ── Team cluster averages ──

const playerEntries = Object.values(PLAYER_CLUSTERS);
const playerNumbers = Object.keys(PLAYER_CLUSTERS);

const teamClusterAvg: Record<keyof ClusterRatings, number> = {} as any;
for (const key of CLUSTER_KEYS) {
  const sum = playerEntries.reduce((acc, p) => acc + p[key], 0);
  teamClusterAvg[key] = Math.round(sum / playerEntries.length);
}

const teamOffKR = computeOffKR(teamClusterAvg);
const teamDefKR = computeDefKR(teamClusterAvg);
const teamKR = Math.round(teamOffKR * 0.53 + teamDefKR * 0.47);

// Team subcluster averages
const teamSubclusterAvg: Record<keyof ClusterRatings, { name: string; rating: number }[]> = {} as any;
for (const clusterKey of CLUSTER_KEYS) {
  const subNames = CLUSTER_SUBCLUSTERS[clusterKey];
  teamSubclusterAvg[clusterKey] = subNames.map((subName, subIdx) => {
    const sum = playerNumbers.reduce((acc, pn) => {
      const subs = getPlayerSubclusters(pn, clusterKey);
      return acc + (subs[subIdx]?.rating ?? 0);
    }, 0);
    return { name: subName, rating: Math.round(sum / playerNumbers.length) };
  });
}

// ── Helpers ──

function barColor(v: number): string {
  if (v >= 75) return '#22C55E';
  if (v >= 60) return '#F59E0B';
  return '#EF4444';
}

function percentileColor(p: number): string {
  if (p >= 75) return '#22C55E';
  if (p >= 50) return '#F59E0B';
  return '#EF4444';
}

function netColor(v: number): string {
  if (v > 0) return '#22C55E';
  if (v < 0) return '#EF4444';
  return '#888';
}

// ── Split adjustment system ──
// `hi` = multiplier for "higher is better" stats (our PPP, eFG%, forced TO%, etc.)
// `lo` = multiplier for "lower is better" stats (our TO%, opponent PPP, opponent eFG%)

const SPLIT_ADJ: Record<Split, { hi: number; lo: number }> = {
  all:         { hi: 1.00,  lo: 1.00 },
  conf:        { hi: 0.96,  lo: 1.05 },
  'non-conf':  { hi: 1.06,  lo: 0.93 },
  last5:       { hi: 1.04,  lo: 0.95 },
  home:        { hi: 1.07,  lo: 0.92 },
  away:        { hi: 0.93,  lo: 1.08 },
};

const SplitCtx = React.createContext<Split>('all');
function useSplit() { return React.useContext(SplitCtx); }

/** Adjust a "higher is better" stat by current split */
function shi(base: number, split: Split, dec = 2): number {
  return +(base * SPLIT_ADJ[split].hi).toFixed(dec);
}
/** Adjust a "lower is better" stat by current split */
function slo(base: number, split: Split, dec = 2): number {
  return +(base * SPLIT_ADJ[split].lo).toFixed(dec);
}
/** Adjust a percentile (clamped 0–99) */
function sptile(base: number, split: Split): number {
  return Math.min(99, Math.max(1, Math.round(base * SPLIT_ADJ[split].hi)));
}
/** Adjust play type rows for a split */
function adjPT(rows: PlayTypeRow[], split: Split, isDef: boolean): PlayTypeRow[] {
  return rows.map((r) => ({
    ...r,
    ppp: isDef ? slo(r.ppp, split) : shi(r.ppp, split),
    percentile: isDef ? sptile(r.percentile, split) : sptile(r.percentile, split),
    toPct: isDef ? shi(r.toPct, split, 1) : slo(r.toPct, split, 1),
  }));
}
/** Adjust shot zones for a split */
function adjShot(zones: ShotZone[], split: Split, isDef: boolean): ShotZone[] {
  return zones.map((z) => ({
    ...z,
    ppp: isDef ? slo(z.ppp, split) : shi(z.ppp, split),
    efg: isDef ? slo(z.efg, split, 1) : shi(z.efg, split, 1),
  }));
}
/** Adjust lineup rows for a split */
function adjLineups(rows: LineupRow[], split: Split): LineupRow[] {
  return rows.map((r) => ({
    ...r,
    netRating: shi(r.netRating, split, 1),
    offPPP: shi(r.offPPP, split),
    defPPP: slo(r.defPPP, split),
    rebPct: shi(r.rebPct, split, 1),
    toPct: slo(r.toPct, split, 1),
  }));
}

// ══════════════════════════════════════════════════════════════
// INLINE CONTENT (used directly in Home PagerView)
// ══════════════════════════════════════════════════════════════

export function StatsContent() {
  const ctx = DEFAULT_PROGRAM_CONTEXT;

  // State
  const [topTab, setTopTab] = useState<TopTab>('team');
  const [teamSubTab, setTeamSubTab] = useState<TeamSubTab>('overview');
  const [playerSubTab, setPlayerSubTab] = useState<PlayerSubTab>('overview');
  const [split, setSplit] = useState<Split>('all');
  const [expandedCluster, setExpandedCluster] = useState<keyof ClusterRatings | null>(null);
  const [lineupSheet, setLineupSheet] = useState<LineupRow | null>(null);
  const [playerSheet, setPlayerSheet] = useState<string | null>(null); // playerId
  const [playerSheetTab, setPlayerSheetTab] = useState<'summary' | 'synergy' | 'kanext' | 'shot'>('summary');
  const [shotToggle, setShotToggle] = useState<'offense' | 'defense'>('offense');

  const subTabs = topTab === 'team' ? TEAM_SUB_TABS : PLAYER_SUB_TABS;
  const activeSubTab = topTab === 'team' ? teamSubTab : playerSubTab;

  // System emphasis weights
  const offWeights = OFFENSIVE_STYLE_CLUSTERS[ctx.offensiveStyle];
  const defWeights = DEFENSIVE_STYLE_CLUSTERS[ctx.defensiveStyle];

  return (
    <SplitCtx.Provider value={split}>
    <View style={st.container}>
      {/* ===== STICKY HEADER ===== */}
      <View style={st.stickyHeader}>
        {/* Top segment: Team | Players */}
        <View style={st.segmentRow}>
          {(['team', 'players'] as TopTab[]).map((tab) => (
            <Pressable
              key={tab}
              style={[st.segmentBtn, topTab === tab && st.segmentBtnActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTopTab(tab);
              }}
            >
              <Text style={[st.segmentText, topTab === tab && st.segmentTextActive]}>
                {tab === 'team' ? 'Team' : 'Players'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Sub-tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={st.subTabRow}
        >
          {subTabs.map((tab) => (
            <Pressable
              key={tab.id}
              style={[st.subTab, activeSubTab === tab.id && st.subTabActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (topTab === 'team') setTeamSubTab(tab.id as TeamSubTab);
                else setPlayerSubTab(tab.id as PlayerSubTab);
              }}
            >
              <Text style={[st.subTabText, activeSubTab === tab.id && st.subTabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* ===== GLOBAL CONTROLS (chip row) ===== */}
      <GlobalControls split={split} onSplitChange={setSplit} />

      {/* ===== CONTENT ===== */}
      <ScrollView
        style={st.scroll}
        contentContainerStyle={st.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {topTab === 'team' ? (
          <>
            {teamSubTab === 'overview' && (
              <TeamOverview
                offWeights={offWeights}
                defWeights={defWeights}
                expandedCluster={expandedCluster}
                onToggleCluster={(k) => setExpandedCluster(expandedCluster === k ? null : k)}
                offensiveStyle={ctx.offensiveStyle}
                defensiveStyle={ctx.defensiveStyle}
              />
            )}
            {teamSubTab === 'offense' && (
              <TeamOffense
                expandedCluster={expandedCluster}
                onToggleCluster={(k) => setExpandedCluster(expandedCluster === k ? null : k)}
              />
            )}
            {teamSubTab === 'defense' && (
              <TeamDefense
                expandedCluster={expandedCluster}
                onToggleCluster={(k) => setExpandedCluster(expandedCluster === k ? null : k)}
              />
            )}
            {teamSubTab === 'lineups' && (
              <TeamLineups onOpenLineup={(l) => setLineupSheet(l)} />
            )}
            {teamSubTab === 'shot' && (
              <TeamShot shotToggle={shotToggle} onToggle={setShotToggle} />
            )}
          </>
        ) : (
          <>
            {playerSubTab === 'overview' && (
              <PlayersOverview onOpenPlayer={(id) => { setPlayerSheet(id); setPlayerSheetTab('summary'); }} />
            )}
            {playerSubTab === 'offense' && (
              <PlayersOffense onOpenPlayer={(id) => { setPlayerSheet(id); setPlayerSheetTab('synergy'); }} />
            )}
            {playerSubTab === 'defense' && (
              <PlayersDefense />
            )}
            {playerSubTab === 'types' && (
              <PlayerTypes />
            )}
            {playerSubTab === 'shot' && (
              <PlayersShot onOpenPlayer={(id) => { setPlayerSheet(id); setPlayerSheetTab('shot'); }} />
            )}
          </>
        )}
      </ScrollView>

      {/* ===== LINEUP DETAIL SHEET ===== */}
      <BottomSheet visible={!!lineupSheet} onClose={() => setLineupSheet(null)}>
        {lineupSheet && <LineupDetailContent lineup={lineupSheet} />}
      </BottomSheet>

      {/* ===== PLAYER DETAIL SHEET ===== */}
      <BottomSheet visible={!!playerSheet} onClose={() => setPlayerSheet(null)}>
        {playerSheet && (
          <PlayerDetailContent
            playerId={playerSheet}
            activeTab={playerSheetTab}
            onTabChange={setPlayerSheetTab}
          />
        )}
      </BottomSheet>
    </View>
    </SplitCtx.Provider>
  );
}

// ══════════════════════════════════════════════════════════════
// STANDALONE PAGE (route: /coach/stats)
// ══════════════════════════════════════════════════════════════

export default function StatsPage() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[st.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Pressable style={st.backBtn} onPress={() => router.back()}>
        <IconSymbol name="chevron.left" size={20} color={colors.text} />
        <Text style={[st.backText, { color: colors.text }]}>Statistics</Text>
      </Pressable>
      <StatsContent />
    </View>
  );
}

// ══════════════════════════════════════════════════════════════
// GLOBAL CONTROLS
// ══════════════════════════════════════════════════════════════

function GlobalControls({ split, onSplitChange }: { split: Split; onSplitChange: (s: Split) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={st.chipRow}
      style={st.chipScrollView}
    >
      <View style={st.chipGroup}>
        <Text style={st.chipGroupLabel}>2025–26</Text>
      </View>
      {SPLITS.map((s) => (
        <Pressable
          key={s.id}
          style={[st.chip, split === s.id && st.chipActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSplitChange(s.id);
          }}
        >
          <Text style={[st.chipText, split === s.id && st.chipTextActive]}>{s.label}</Text>
        </Pressable>
      ))}
      <View style={[st.chip, st.badgeChip]}>
        <Text style={st.badgeText}>Synergy</Text>
      </View>
      <View style={[st.chip, st.badgeChip]}>
        <Text style={st.badgeText}>KaNeXT</Text>
      </View>
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════
// TEAM OVERVIEW
// ══════════════════════════════════════════════════════════════

function TeamOverview({
  offWeights,
  defWeights,
  expandedCluster,
  onToggleCluster,
  offensiveStyle,
  defensiveStyle,
}: {
  offWeights: { shooting: number; finishing: number; playmaking: number };
  defWeights: { perimeter_defense: number; interior_defense: number; rebounding: number; frame: number };
  expandedCluster: keyof ClusterRatings | null;
  onToggleCluster: (k: keyof ClusterRatings) => void;
  offensiveStyle: string;
  defensiveStyle: string;
}) {
  const sp = useSplit();
  return (
    <>
      {/* A) Team Identity Strip */}
      <View style={st.identityRow}>
        <Image source={KaNeXT_LOGO} style={st.logo} resizeMode="contain" />
        <View style={st.identityText}>
          <Text style={st.teamName}>KaNeXT Sports</Text>
          <Text style={st.teamSubline}>NAA {'\u00B7'} KaNeXT Conference</Text>
        </View>
        <View style={st.krBadge}>
          <Text style={st.krValue}>{teamKR}</Text>
          <View style={st.krSubRow}>
            <Text style={st.krSubLabel}>O {teamOffKR}</Text>
            <Text style={st.krSubSep}>{'\u00B7'}</Text>
            <Text style={st.krSubLabel}>D {teamDefKR}</Text>
          </View>
        </View>
      </View>

      {/* Synergy efficiency row */}
      <View style={st.card}>
        <Text style={st.sectionLabel}>SYNERGY EFFICIENCY</Text>
        <View style={st.statThreeCol}>
          <StatCell label="OFF PPP" value={shi(SYNERGY_SUMMARY.offPPP, sp).toFixed(2)} />
          <StatCell label="DEF PPP" value={slo(SYNERGY_SUMMARY.defPPP, sp).toFixed(2)} />
          <StatCell label="TEMPO" value={`${shi(SYNERGY_SUMMARY.tempo, sp, 1)}`} sub="Poss/G" />
        </View>
      </View>

      {/* B) Projection Row */}
      <View style={st.card}>
        <Text style={st.sectionLabel}>KaNeXT PROJECTIONS</Text>
        <View style={st.statFourCol}>
          <StatCell label="Proj W" value={`${SEASON_PROJECTION.line}`} />
          <StatCell label="Win%" value={`${shi(SEASON_PROJECTION.winPct, sp, 1)}%`} />
          <StatCell label="Record" value={SEASON_PROJECTION.projectedTotal} />
          <StatCell label="Confidence" value={`${shi(SEASON_PROJECTION.simConfidence, sp, 0)}%`} />
        </View>
        <View style={st.projSubRow}>
          <Text style={st.projSub}>{SEASON_PROJECTION.projectedSeed}</Text>
          <Text style={st.projSub}>NAA Conference Tournament: {shi(SEASON_PROJECTION.playoffProbability, sp, 0)}%</Text>
        </View>
      </View>

      {/* C) Four Factors */}
      <FourFactorsCard />

      {/* D) Synergy Team Summary */}
      <View style={st.card}>
        <Text style={st.sectionLabel}>SYNERGY OFFENSE</Text>
        <SynergyPlayTypeTable rows={adjPT(OFFENSE_PLAY_TYPES.slice(0, 6), sp, false)} isDefense={false} />

        <View style={st.divider} />
        <Text style={st.sectionLabel}>SHOT PROFILE</Text>
        <ShotProfileBars zones={adjShot(OFFENSE_SHOT_PROFILE.filter((z) => z.zone !== 'FT'), sp, false)} />

        <View style={st.divider} />
        <Text style={st.sectionLabel}>TEMPO BREAKDOWN</Text>
        <View style={st.statThreeCol}>
          <StatCell label="Transition" value={shi(TEMPO_BREAKDOWN.transition.ppp, sp).toFixed(2)} sub={`${TEMPO_BREAKDOWN.transition.freq}%`} />
          <StatCell label="Early" value={shi(TEMPO_BREAKDOWN.earlyOffense.ppp, sp).toFixed(2)} sub={`${TEMPO_BREAKDOWN.earlyOffense.freq}%`} />
          <StatCell label="Halfcourt" value={shi(TEMPO_BREAKDOWN.halfcourt.ppp, sp).toFixed(2)} sub={`${TEMPO_BREAKDOWN.halfcourt.freq}%`} />
        </View>
      </View>

      <View style={st.card}>
        <Text style={st.sectionLabel}>SYNERGY DEFENSE</Text>
        <SynergyPlayTypeTable rows={adjPT(DEFENSE_PLAY_TYPES.slice(0, 6), sp, true)} isDefense />

        <View style={st.divider} />
        <Text style={st.sectionLabel}>SHOT PROFILE ALLOWED</Text>
        <ShotProfileBars zones={adjShot(DEFENSE_SHOT_PROFILE.filter((z) => z.zone !== 'FT'), sp, true)} />

        <View style={st.divider} />
        <Text style={st.sectionLabel}>TEMPO BREAKDOWN</Text>
        <View style={st.statThreeCol}>
          <StatCell label="Transition" value={slo(DEFENSE_TEMPO_BREAKDOWN.transition.ppp, sp).toFixed(2)} sub={`${DEFENSE_TEMPO_BREAKDOWN.transition.freq}%`} />
          <StatCell label="Early" value={slo(DEFENSE_TEMPO_BREAKDOWN.earlyOffense.ppp, sp).toFixed(2)} sub={`${DEFENSE_TEMPO_BREAKDOWN.earlyOffense.freq}%`} />
          <StatCell label="Halfcourt" value={slo(DEFENSE_TEMPO_BREAKDOWN.halfcourt.ppp, sp).toFixed(2)} sub={`${DEFENSE_TEMPO_BREAKDOWN.halfcourt.freq}%`} />
        </View>

        <View style={st.divider} />
        <View style={st.statThreeCol}>
          <StatCell label="Rim FG%" value={`${slo(RIM_PROTECTION.fgPct, sp, 1)}%`} sub={`${RIM_PROTECTION.freq}% freq`} />
          <StatCell label="3PT Allowed" value={`${slo(THREE_PT_DEFENSE.fgPct, sp, 1)}%`} sub={`${THREE_PT_DEFENSE.freq}% freq`} />
          <StatCell label="Contested" value={`${shi(THREE_PT_DEFENSE.contestedPct, sp, 1)}%`} sub="3PT contests" />
        </View>
      </View>

      {/* E) KaNeXT Overlay */}
      <View style={st.card}>
        <Text style={st.sectionLabel}>KaNeXT CLUSTER RATINGS</Text>
        <ClusterBars
          expandedCluster={expandedCluster}
          onToggleCluster={onToggleCluster}
          clusterAvgs={teamClusterAvg}
          subclusterAvgs={teamSubclusterAvg}
        />
      </View>

      {/* System Emphasis vs Reality */}
      <View style={st.card}>
        <Text style={st.sectionLabel}>SYSTEM EMPHASIS vs REALITY</Text>
        <Text style={st.subLabel}>
          {offensiveStyle.replace(/_/g, ' ')} / {defensiveStyle.replace(/_/g, ' ')}
        </Text>
        {CLUSTER_KEYS.map((key) => {
          const isOff = key === 'shooting' || key === 'finishing' || key === 'playmaking';
          const emphasis = isOff
            ? (offWeights as any)[key] ?? 0
            : (defWeights as any)[key] ?? 0;
          const maxWeight = isOff ? 53 : 47;
          const emphasisPct = (emphasis / maxWeight) * 100;
          const actual = teamClusterAvg[key];
          return (
            <View key={key} style={st.emphRow}>
              <Text style={st.emphLabel}>{CLUSTER_LABEL_MAP[key]}</Text>
              <View style={st.emphBarContainer}>
                <View style={st.emphBarBg}>
                  <View style={[st.emphBarEmphasis, { width: `${emphasisPct}%` }]} />
                  <View style={[st.emphBarActual, { width: `${actual}%` }]} />
                </View>
              </View>
              <View style={st.emphValues}>
                <Text style={st.emphEmphasisVal}>{emphasis}</Text>
                <Text style={st.emphActualVal}>{actual}</Text>
              </View>
            </View>
          );
        })}
        <View style={st.emphLegend}>
          <View style={st.emphLegendItem}>
            <View style={[st.emphLegendDot, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <Text style={st.emphLegendText}>Emphasis</Text>
          </View>
          <View style={st.emphLegendItem}>
            <View style={[st.emphLegendDot, { backgroundColor: '#22C55E' }]} />
            <Text style={st.emphLegendText}>Actual</Text>
          </View>
        </View>
      </View>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// TEAM OFFENSE
// ══════════════════════════════════════════════════════════════

function TeamOffense({
  expandedCluster,
  onToggleCluster,
}: {
  expandedCluster: keyof ClusterRatings | null;
  onToggleCluster: (k: keyof ClusterRatings) => void;
}) {
  const sp = useSplit();
  const offKeys: (keyof ClusterRatings)[] = ['shooting', 'finishing', 'playmaking'];
  const offAvgs: Record<keyof ClusterRatings, number> = {} as any;
  const offSubAvgs: Record<keyof ClusterRatings, { name: string; rating: number }[]> = {} as any;
  for (const k of offKeys) {
    offAvgs[k] = teamClusterAvg[k];
    offSubAvgs[k] = teamSubclusterAvg[k];
  }

  return (
    <>
      <View style={st.card}>
        <Text style={st.sectionLabel}>SYNERGY PLAY TYPES</Text>
        <SynergyPlayTypeTable rows={adjPT(OFFENSE_PLAY_TYPES, sp, false)} isDefense={false} />
      </View>

      <View style={st.card}>
        <Text style={st.sectionLabel}>KaNeXT OFFENSE</Text>
        <View style={st.krInlineRow}>
          <Text style={st.krInlineLabel}>OFF KR</Text>
          <Text style={[st.krInlineValue, { color: barColor(teamOffKR) }]}>{teamOffKR}</Text>
        </View>
        <ClusterBars
          expandedCluster={expandedCluster}
          onToggleCluster={onToggleCluster}
          clusterAvgs={offAvgs}
          subclusterAvgs={offSubAvgs}
          filterKeys={offKeys}
        />
      </View>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// TEAM DEFENSE
// ══════════════════════════════════════════════════════════════

function TeamDefense({
  expandedCluster,
  onToggleCluster,
}: {
  expandedCluster: keyof ClusterRatings | null;
  onToggleCluster: (k: keyof ClusterRatings) => void;
}) {
  const sp = useSplit();
  const defKeys: (keyof ClusterRatings)[] = ['perimeter_defense', 'interior_defense', 'rebounding', 'frame'];
  const defAvgs: Record<keyof ClusterRatings, number> = {} as any;
  const defSubAvgs: Record<keyof ClusterRatings, { name: string; rating: number }[]> = {} as any;
  for (const k of defKeys) {
    defAvgs[k] = teamClusterAvg[k];
    defSubAvgs[k] = teamSubclusterAvg[k];
  }

  return (
    <>
      <View style={st.card}>
        <Text style={st.sectionLabel}>SYNERGY DEFENSE PLAY TYPES</Text>
        <SynergyPlayTypeTable rows={adjPT(DEFENSE_PLAY_TYPES, sp, true)} isDefense />
      </View>

      <View style={st.card}>
        <Text style={st.sectionLabel}>OPPONENT SHOT PROFILE</Text>
        <ShotProfileBars zones={adjShot(DEFENSE_SHOT_PROFILE.filter((z) => z.zone !== 'FT'), sp, true)} />
      </View>

      <View style={st.card}>
        <Text style={st.sectionLabel}>COVERAGE BREAKDOWN</Text>
        <Text style={st.subLabel}>Ball Screen</Text>
        {BALL_SCREEN_COVERAGE.map((c) => (
          <View key={c.scheme} style={st.coverageRow}>
            <Text style={st.coverageScheme}>{c.scheme}</Text>
            <View style={st.coverageBarBg}>
              <View style={[st.coverageBarFill, { width: `${c.freq}%` }]} />
            </View>
            <Text style={st.coverageFreq}>{c.freq}%</Text>
            <Text style={st.coveragePPP}>{slo(c.pppAllowed, sp).toFixed(2)}</Text>
          </View>
        ))}
        <View style={st.divider} />
        <Text style={st.subLabel}>Post Defense</Text>
        {POST_COVERAGE.map((c) => (
          <View key={c.scheme} style={st.coverageRow}>
            <Text style={st.coverageScheme}>{c.scheme}</Text>
            <View style={st.coverageBarBg}>
              <View style={[st.coverageBarFill, { width: `${c.freq}%` }]} />
            </View>
            <Text style={st.coverageFreq}>{c.freq}%</Text>
            <Text style={st.coveragePPP}>{slo(c.pppAllowed, sp).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={st.card}>
        <Text style={st.sectionLabel}>KaNeXT DEFENSE</Text>
        <View style={st.krInlineRow}>
          <Text style={st.krInlineLabel}>DEF KR</Text>
          <Text style={[st.krInlineValue, { color: barColor(teamDefKR) }]}>{teamDefKR}</Text>
        </View>
        <ClusterBars
          expandedCluster={expandedCluster}
          onToggleCluster={onToggleCluster}
          clusterAvgs={defAvgs}
          subclusterAvgs={defSubAvgs}
          filterKeys={defKeys}
        />
      </View>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// TEAM LINEUPS
// ══════════════════════════════════════════════════════════════

function TeamLineups({ onOpenLineup }: { onOpenLineup: (l: LineupRow) => void }) {
  const sp = useSplit();
  const lineups = useMemo(() => adjLineups(TOP_LINEUPS, sp), [sp]);
  return (
    <>
      <Text style={st.sectionLabel}>TOP 10 LINEUPS</Text>
      {lineups.map((lineup, idx) => (
        <Pressable
          key={lineup.id}
          style={st.lineupCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onOpenLineup(lineup);
          }}
        >
          <View style={st.lineupHeader}>
            <Text style={st.lineupRank}>#{idx + 1}</Text>
            <Text style={st.lineupPlayers}>
              {lineup.players.map((p) => p.name).join(' · ')}
            </Text>
          </View>
          <View style={st.lineupStatsRow}>
            <MiniStat label="MIN" value={`${lineup.minutes}`} />
            <MiniStat label="NET" value={lineup.netRating > 0 ? `+${lineup.netRating.toFixed(1)}` : lineup.netRating.toFixed(1)} color={netColor(lineup.netRating)} />
            <MiniStat label="OFF" value={lineup.offPPP.toFixed(2)} />
            <MiniStat label="DEF" value={lineup.defPPP.toFixed(2)} />
            <MiniStat label="REB%" value={`${lineup.rebPct}`} />
            <MiniStat label="TO%" value={`${lineup.toPct}`} />
          </View>
        </Pressable>
      ))}
    </>
  );
}

function LineupDetailContent({ lineup }: { lineup: LineupRow }) {
  const detail = LINEUP_DETAILS[lineup.id];
  return (
    <>
      <Text style={st.sheetTitle}>Lineup Detail</Text>
      <View style={st.lineupDetailPlayers}>
        {lineup.players.map((p) => (
          <View key={p.number} style={st.lineupDetailPlayer}>
            <Text style={st.lineupDetailNum}>#{p.number}</Text>
            <Text style={st.lineupDetailName}>{p.name}</Text>
            <Text style={st.lineupDetailPos}>{p.position}</Text>
          </View>
        ))}
      </View>

      <View style={st.divider} />
      <View style={st.statFourCol}>
        <StatCell label="Minutes" value={`${lineup.minutes}`} />
        <StatCell label="Poss" value={`${lineup.possessions}`} />
        <StatCell label="Net Rtg" value={lineup.netRating > 0 ? `+${lineup.netRating.toFixed(1)}` : lineup.netRating.toFixed(1)} valueColor={netColor(lineup.netRating)} />
        <StatCell label="FT Rate" value={lineup.ftRate.toFixed(2)} />
      </View>

      {detail && (
        <>
          <View style={st.divider} />
          <Text style={st.sectionLabel}>SHOT PROFILE</Text>
          {detail.shotProfile.map((z) => (
            <View key={z.zone} style={st.coverageRow}>
              <Text style={st.coverageScheme}>{z.zone}</Text>
              <View style={st.coverageBarBg}>
                <View style={[st.coverageBarFill, { width: `${z.freq}%` }]} />
              </View>
              <Text style={st.coverageFreq}>{z.freq}%</Text>
              <Text style={st.coveragePPP}>{z.ppp.toFixed(2)}</Text>
            </View>
          ))}

          <View style={st.divider} />
          <Text style={st.sectionLabel}>TOP PLAY TYPES</Text>
          {detail.topPlayTypes.map((pt) => (
            <View key={pt.type} style={st.playTypeCompact}>
              <Text style={st.playTypeCompactName}>{pt.type}</Text>
              <Text style={st.playTypeCompactFreq}>{pt.possPct}%</Text>
              <Text style={st.playTypeCompactPPP}>{pt.ppp.toFixed(2)}</Text>
            </View>
          ))}
        </>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// TEAM SHOT
// ══════════════════════════════════════════════════════════════

function TeamShot({ shotToggle, onToggle }: { shotToggle: 'offense' | 'defense'; onToggle: (v: 'offense' | 'defense') => void }) {
  const sp = useSplit();
  const isDef = shotToggle === 'defense';
  const zones = isDef
    ? adjShot(DEFENSE_SHOT_PROFILE.filter((z) => z.zone !== 'FT'), sp, true)
    : adjShot(OFFENSE_SHOT_PROFILE.filter((z) => z.zone !== 'FT'), sp, false);

  return (
    <>
      {/* Toggle */}
      <View style={st.shotToggleRow}>
        <Pressable
          style={[st.pill, shotToggle === 'offense' && st.pillActive]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggle('offense'); }}
        >
          <Text style={[st.pillText, shotToggle === 'offense' && st.pillTextActive]}>Offense</Text>
        </Pressable>
        <Pressable
          style={[st.pill, shotToggle === 'defense' && st.pillActive]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggle('defense'); }}
        >
          <Text style={[st.pillText, shotToggle === 'defense' && st.pillTextActive]}>Defense</Text>
        </Pressable>
      </View>

      <View style={st.card}>
        <Text style={st.sectionLabel}>{shotToggle === 'offense' ? 'SHOT PROFILE' : 'SHOT PROFILE ALLOWED'}</Text>
        <ShotProfileBars zones={zones} />
      </View>

      <View style={st.card}>
        <Text style={st.sectionLabel}>3-POINT BREAKDOWN</Text>
        <View style={st.statThreeCol}>
          <StatCell label="C&S" value={`${shi(THREE_PT_BREAKDOWN.catchAndShoot.efg, sp, 1)}%`} sub={`${THREE_PT_BREAKDOWN.catchAndShoot.freq}% freq`} />
          <StatCell label="Off Dribble" value={`${shi(THREE_PT_BREAKDOWN.offDribble.efg, sp, 1)}%`} sub={`${THREE_PT_BREAKDOWN.offDribble.freq}% freq`} />
        </View>
      </View>

      <View style={st.card}>
        <Text style={st.sectionLabel}>ASSISTED %</Text>
        <View style={st.statThreeCol}>
          <StatCell label="Rim" value={`${shi(ASSISTED_PCT.rim, sp, 1)}%`} />
          <StatCell label="Mid" value={`${shi(ASSISTED_PCT.mid, sp, 1)}%`} />
          <StatCell label="3PT" value={`${shi(ASSISTED_PCT.three, sp, 1)}%`} />
        </View>
      </View>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// PLAYERS TAB
// ══════════════════════════════════════════════════════════════

function PlayersOverview({ onOpenPlayer }: { onOpenPlayer: (id: string) => void }) {
  const sp = useSplit();
  const players = useMemo(() =>
    PLAYER_SYNERGY.map((ps) => {
      const clusters = PLAYER_CLUSTERS[ps.number];
      const kr = clusters
        ? Math.round(computeOffKR(clusters) * 0.53 + computeDefKR(clusters) * 0.47)
        : 0;
      const offKR = clusters ? computeOffKR(clusters) : 0;
      const defKR = clusters ? computeDefKR(clusters) : 0;
      return { ...ps, kr, offKR, defKR };
    }).sort((a, b) => b.usagePct - a.usagePct),
    [],
  );

  return (
    <>
      <Text style={st.sectionLabel}>PLAYERS BY USAGE</Text>
      {players.map((p) => (
        <Pressable
          key={p.playerId}
          style={st.playerRow}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onOpenPlayer(p.playerId);
          }}
        >
          <View style={st.playerLeft}>
            <Text style={st.playerName}>{p.name}</Text>
            <Text style={st.playerSub}>#{p.number} · {p.position}</Text>
          </View>
          <View style={st.playerKRGroup}>
            <Text style={st.playerKR}>{p.kr}</Text>
            <Text style={st.playerKRSub}>O{p.offKR} D{p.defKR}</Text>
          </View>
          <View style={st.playerStatCol}>
            <Text style={st.playerStatVal}>{p.usagePct}%</Text>
            <Text style={st.playerStatLabel}>USG</Text>
          </View>
          <View style={st.playerStatCol}>
            <Text style={st.playerStatVal}>{shi(p.ppp, sp).toFixed(2)}</Text>
            <Text style={st.playerStatLabel}>PPP</Text>
          </View>
          <View style={st.playerStatCol}>
            <Text style={[st.playerStatVal, { color: percentileColor(sptile(p.percentile, sp)) }]}>{sptile(p.percentile, sp)}</Text>
            <Text style={st.playerStatLabel}>%ile</Text>
          </View>
        </Pressable>
      ))}
    </>
  );
}

function PlayersOffense({ onOpenPlayer }: { onOpenPlayer: (id: string) => void }) {
  const sp = useSplit();
  return (
    <>
      <Text style={st.sectionLabel}>PLAYER OFFENSE (SYNERGY)</Text>
      {PLAYER_SYNERGY.map((p) => (
        <Pressable
          key={p.playerId}
          style={st.playerRow}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onOpenPlayer(p.playerId);
          }}
        >
          <View style={st.playerLeft}>
            <Text style={st.playerName}>{p.name}</Text>
            <Text style={st.playerSub}>#{p.number}</Text>
          </View>
          <View style={st.playerStatCol}>
            <Text style={st.playerStatVal}>{shi(p.ppp, sp).toFixed(2)}</Text>
            <Text style={st.playerStatLabel}>PPP</Text>
          </View>
          <View style={st.playerStatCol}>
            <Text style={st.playerStatVal}>{p.topPlayType}</Text>
            <Text style={st.playerStatLabel}>Top Type</Text>
          </View>
          <View style={st.playerStatCol}>
            <Text style={st.playerStatVal}>{shi(p.topPlayTypePPP, sp).toFixed(2)}</Text>
            <Text style={st.playerStatLabel}>Type PPP</Text>
          </View>
        </Pressable>
      ))}
    </>
  );
}

function PlayersDefense() {
  const players = useMemo(() =>
    PLAYER_SYNERGY.map((ps) => {
      const clusters = PLAYER_CLUSTERS[ps.number];
      const defKR = clusters ? computeDefKR(clusters) : 0;
      return { ...ps, defKR };
    }).sort((a, b) => b.defKR - a.defKR),
    [],
  );

  return (
    <>
      <Text style={st.sectionLabel}>PLAYER DEFENSE (KaNeXT)</Text>
      {players.map((p) => {
        const clusters = PLAYER_CLUSTERS[p.number];
        return (
          <View key={p.playerId} style={st.playerRow}>
            <View style={st.playerLeft}>
              <Text style={st.playerName}>{p.name}</Text>
              <Text style={st.playerSub}>#{p.number}</Text>
            </View>
            <View style={st.playerStatCol}>
              <Text style={[st.playerStatVal, { color: barColor(p.defKR) }]}>{p.defKR}</Text>
              <Text style={st.playerStatLabel}>DEF KR</Text>
            </View>
            {clusters && (
              <>
                <View style={st.playerStatCol}>
                  <Text style={st.playerStatVal}>{clusters.perimeter_defense}</Text>
                  <Text style={st.playerStatLabel}>OB</Text>
                </View>
                <View style={st.playerStatCol}>
                  <Text style={st.playerStatVal}>{clusters.interior_defense}</Text>
                  <Text style={st.playerStatLabel}>Team</Text>
                </View>
                <View style={st.playerStatCol}>
                  <Text style={st.playerStatVal}>{clusters.rebounding}</Text>
                  <Text style={st.playerStatLabel}>Reb</Text>
                </View>
              </>
            )}
          </View>
        );
      })}
    </>
  );
}

function PlayerTypes() {
  const players = useMemo(() =>
    PLAYER_SYNERGY.map((ps) => {
      const clusters = PLAYER_CLUSTERS[ps.number];
      if (!clusters) return { ...ps, archetype: 'Unknown', offKR: 0, defKR: 0 };
      const offKR = computeOffKR(clusters);
      const defKR = computeDefKR(clusters);
      const offDiff = offKR - defKR;
      let archetype = 'Two-Way';
      if (offDiff > 10) archetype = 'Offense-First';
      else if (offDiff < -10) archetype = 'Defense-First';
      else if (clusters.shooting >= 70) archetype = 'Shooter';
      else if (clusters.finishing >= 70) archetype = 'Finisher';
      else if (clusters.playmaking >= 70) archetype = 'Playmaker';
      return { ...ps, archetype, offKR, defKR };
    }),
    [],
  );

  const grouped = useMemo(() => {
    const map: Record<string, typeof players> = {};
    for (const p of players) {
      if (!map[p.archetype]) map[p.archetype] = [];
      map[p.archetype].push(p);
    }
    return Object.entries(map);
  }, [players]);

  return (
    <>
      <Text style={st.sectionLabel}>PLAYER ARCHETYPES</Text>
      {grouped.map(([archetype, group]) => (
        <View key={archetype} style={st.card}>
          <Text style={st.subLabel}>{archetype.toUpperCase()}</Text>
          {group.map((p) => (
            <View key={p.playerId} style={st.playerTypeRow}>
              <Text style={st.playerName}>{p.name}</Text>
              <Text style={st.playerSub}>#{p.number} · {p.position}</Text>
              <Text style={st.playerTypeKR}>KR {p.offKR > 0 ? Math.round(p.offKR * 0.53 + p.defKR * 0.47) : '—'}</Text>
            </View>
          ))}
        </View>
      ))}
    </>
  );
}

function PlayersShot({ onOpenPlayer }: { onOpenPlayer: (id: string) => void }) {
  const sp = useSplit();
  return (
    <>
      <Text style={st.sectionLabel}>PLAYER SHOT PROFILES</Text>
      {PLAYER_SYNERGY.map((p) => {
        const profile = PLAYER_SHOT_PROFILES[p.playerId];
        if (!profile) return null;
        return (
          <Pressable
            key={p.playerId}
            style={st.playerShotCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onOpenPlayer(p.playerId);
            }}
          >
            <View style={st.playerLeft}>
              <Text style={st.playerName}>{p.name}</Text>
              <Text style={st.playerSub}>#{p.number}</Text>
            </View>
            <View style={st.playerShotBars}>
              <MiniBar label="Rim" freq={profile.rim.freq} efg={shi(profile.rim.efg, sp, 0)} />
              <MiniBar label="Mid" freq={profile.mid.freq} efg={shi(profile.mid.efg, sp, 0)} />
              <MiniBar label="3PT" freq={profile.three.freq} efg={shi(profile.three.efg, sp, 0)} />
            </View>
          </Pressable>
        );
      })}
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// PLAYER DETAIL SHEET
// ══════════════════════════════════════════════════════════════

function PlayerDetailContent({
  playerId,
  activeTab,
  onTabChange,
}: {
  playerId: string;
  activeTab: 'summary' | 'synergy' | 'kanext' | 'shot';
  onTabChange: (t: 'summary' | 'synergy' | 'kanext' | 'shot') => void;
}) {
  const player = PLAYER_SYNERGY.find((p) => p.playerId === playerId);
  const leader = KaNeXT_LEADERS.find((l) => l.number === player?.number);
  const clusters = player ? PLAYER_CLUSTERS[player.number] : null;
  const profile = PLAYER_SHOT_PROFILES[playerId];
  const [expandedCluster, setExpandedCluster] = useState<keyof ClusterRatings | null>(null);

  if (!player) return <Text style={st.sheetTitle}>Player not found</Text>;

  const kr = clusters ? Math.round(computeOffKR(clusters) * 0.53 + computeDefKR(clusters) * 0.47) : 0;
  const offKR = clusters ? computeOffKR(clusters) : 0;
  const defKR = clusters ? computeDefKR(clusters) : 0;

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'synergy', label: 'Synergy' },
    { id: 'kanext', label: 'KaNeXT' },
    { id: 'shot', label: 'Shot' },
  ];

  return (
    <>
      {/* Header */}
      <View style={st.playerSheetHeader}>
        <View>
          <Text style={st.sheetTitle}>{player.name}</Text>
          <Text style={st.sheetSub}>#{player.number} · {player.position}</Text>
        </View>
        <View style={st.krBadge}>
          <Text style={st.krValue}>{kr}</Text>
          <View style={st.krSubRow}>
            <Text style={st.krSubLabel}>O {offKR}</Text>
            <Text style={st.krSubSep}>{'\u00B7'}</Text>
            <Text style={st.krSubLabel}>D {defKR}</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.sheetTabs}>
        {tabs.map((t) => (
          <Pressable
            key={t.id}
            style={[st.subTab, activeTab === t.id && st.subTabActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onTabChange(t.id);
            }}
          >
            <Text style={[st.subTabText, activeTab === t.id && st.subTabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Tab content */}
      {activeTab === 'summary' && leader && (
        <View style={st.sheetContent}>
          <View style={st.statFourCol}>
            <StatCell label="PPG" value={leader.ppg.toFixed(1)} />
            <StatCell label="RPG" value={leader.rpg.toFixed(1)} />
            <StatCell label="APG" value={leader.apg.toFixed(1)} />
            <StatCell label="GP" value={`${leader.gamesPlayed}`} />
          </View>
          <View style={st.divider} />
          <View style={st.statFourCol}>
            <StatCell label="FG%" value={`${(leader.fgPct * 100).toFixed(1)}%`} />
            <StatCell label="3PT%" value={`${(leader.threePct * 100).toFixed(1)}%`} />
            <StatCell label="FT%" value={`${(leader.ftPct * 100).toFixed(1)}%`} />
            <StatCell label="USG" value={`${player.usagePct}%`} />
          </View>
          <View style={st.divider} />
          <View style={st.statThreeCol}>
            <StatCell label="PPP" value={player.ppp.toFixed(2)} />
            <StatCell label="Percentile" value={`${player.percentile}`} valueColor={percentileColor(player.percentile)} />
            <StatCell label="Top Type" value={player.topPlayType} />
          </View>
        </View>
      )}

      {activeTab === 'synergy' && (
        <View style={st.sheetContent}>
          <View style={st.statThreeCol}>
            <StatCell label="PPP" value={player.ppp.toFixed(2)} />
            <StatCell label="%ile" value={`${player.percentile}`} valueColor={percentileColor(player.percentile)} />
            <StatCell label="USG" value={`${player.usagePct}%`} />
          </View>
          <View style={st.divider} />
          <Text style={st.sectionLabel}>TOP PLAY TYPE</Text>
          <View style={st.playTypeCompact}>
            <Text style={st.playTypeCompactName}>{player.topPlayType}</Text>
            <Text style={st.playTypeCompactPPP}>{player.topPlayTypePPP.toFixed(2)} PPP</Text>
          </View>
          {profile && (
            <>
              <View style={st.divider} />
              <Text style={st.sectionLabel}>SHOT PROFILE</Text>
              <ShotProfileBars zones={[
                { zone: 'Rim', freq: profile.rim.freq, ppp: 0, efg: profile.rim.efg },
                { zone: 'Mid', freq: profile.mid.freq, ppp: 0, efg: profile.mid.efg },
                { zone: '3PT', freq: profile.three.freq, ppp: 0, efg: profile.three.efg },
              ]} />
            </>
          )}
        </View>
      )}

      {activeTab === 'kanext' && clusters && (
        <View style={st.sheetContent}>
          <ClusterBars
            expandedCluster={expandedCluster}
            onToggleCluster={(k) => setExpandedCluster(expandedCluster === k ? null : k)}
            clusterAvgs={clusters}
            subclusterAvgs={(() => {
              const subs: Record<keyof ClusterRatings, { name: string; rating: number }[]> = {} as any;
              for (const key of CLUSTER_KEYS) {
                subs[key] = getPlayerSubclusters(player.number, key);
              }
              return subs;
            })()}
          />
        </View>
      )}

      {activeTab === 'shot' && profile && (
        <View style={st.sheetContent}>
          <ShotProfileBars zones={[
            { zone: 'Rim', freq: profile.rim.freq, ppp: 0, efg: profile.rim.efg },
            { zone: 'Mid', freq: profile.mid.freq, ppp: 0, efg: profile.mid.efg },
            { zone: '3PT', freq: profile.three.freq, ppp: 0, efg: profile.three.efg },
          ]} />
          <View style={st.divider} />
          <Text style={st.sectionLabel}>3PT BREAKDOWN</Text>
          <View style={st.statThreeCol}>
            <StatCell label="C&S" value={`${profile.catchAndShoot.efg}%`} sub={`${profile.catchAndShoot.freq}% freq`} />
            <StatCell label="Off Dribble" value={`${profile.offDribble.efg}%`} sub={`${profile.offDribble.freq}% freq`} />
            <StatCell label="Assisted" value={`${profile.assistedPct}%`} />
          </View>
        </View>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ══════════════════════════════════════════════════════════════

function FourFactorsCard() {
  const sp = useSplit();
  return (
    <View style={st.card}>
      <Text style={st.sectionLabel}>FOUR FACTORS</Text>
      <View style={st.ffColumns}>
        <View style={st.ffCol}>
          <Text style={st.ffColHeader}>OFFENSE</Text>
          <FFRow label="eFG%" value={shi(eFG, sp, 1).toFixed(1)} />
          <FFRow label="TO%" value={slo(TOPct, sp, 1).toFixed(1)} invert />
          <FFRow label="ORB%" value={shi(ORBPct, sp, 1).toFixed(1)} />
          <FFRow label="FT Rate" value={shi(FTRate, sp, 1).toFixed(1)} />
        </View>
        <View style={st.ffDivider} />
        <View style={st.ffCol}>
          <Text style={st.ffColHeader}>DEFENSE</Text>
          <FFRow label="eFG%" value={slo(OPP_eFG, sp, 1).toFixed(1)} invert />
          <FFRow label="TO%" value={shi(OPP_TOPct, sp, 1).toFixed(1)} />
          <FFRow label="ORB%" value={slo(OPP_ORBPct, sp, 1).toFixed(1)} invert />
          <FFRow label="FT Rate" value={slo(OPP_FTRate, sp, 1).toFixed(1)} invert />
        </View>
      </View>
    </View>
  );
}

function FFRow({ label, value, invert }: { label: string; value: string; invert?: boolean }) {
  return (
    <View style={st.ffRow}>
      <Text style={st.ffLabel}>{label}</Text>
      <Text style={st.ffValue}>{value}%</Text>
    </View>
  );
}

function ClusterBars({
  expandedCluster,
  onToggleCluster,
  clusterAvgs,
  subclusterAvgs,
  filterKeys,
}: {
  expandedCluster: keyof ClusterRatings | null;
  onToggleCluster: (k: keyof ClusterRatings) => void;
  clusterAvgs: Record<string, number>;
  subclusterAvgs: Record<string, { name: string; rating: number }[]>;
  filterKeys?: (keyof ClusterRatings)[];
}) {
  const keys = filterKeys ?? CLUSTER_KEYS;
  return (
    <>
      {keys.map((key) => {
        const avg = clusterAvgs[key] ?? 0;
        const isExpanded = expandedCluster === key;
        const subs = subclusterAvgs[key] ?? [];
        return (
          <View key={key}>
            <Pressable
              style={st.clusterRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onToggleCluster(key);
              }}
            >
              <View style={st.clusterLabelRow}>
                <IconSymbol name={isExpanded ? 'chevron.down' : 'chevron.right'} size={10} color="#555" />
                <Text style={st.clusterLabel}>{CLUSTER_LABEL_MAP[key]}</Text>
              </View>
              <View style={st.clusterBarBg}>
                <View style={[st.clusterBarFill, { width: `${avg}%`, backgroundColor: barColor(avg) }]} />
              </View>
              <Text style={[st.clusterValue, { color: barColor(avg) }]}>{avg}</Text>
            </Pressable>
            {isExpanded && (
              <View style={st.subclusterContainer}>
                {subs.map((sub) => (
                  <View key={sub.name} style={st.subclusterRow}>
                    <Text style={st.subclusterLabel}>{sub.name}</Text>
                    <View style={st.subclusterBarBg}>
                      <View style={[st.subclusterBarFill, { width: `${sub.rating}%`, backgroundColor: barColor(sub.rating) }]} />
                    </View>
                    <Text style={[st.subclusterValue, { color: barColor(sub.rating) }]}>{sub.rating}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </>
  );
}

function SynergyPlayTypeTable({ rows, isDefense }: { rows: PlayTypeRow[]; isDefense: boolean }) {
  return (
    <>
      <View style={st.ptHeaderRow}>
        <Text style={[st.ptHeaderText, { flex: 1, textAlign: 'left' }]}>Play Type</Text>
        <Text style={st.ptHeaderText}>Poss%</Text>
        <Text style={st.ptHeaderText}>{isDefense ? 'PPP Alw' : 'PPP'}</Text>
        <Text style={st.ptHeaderText}>%</Text>
        <Text style={st.ptHeaderText}>TO%</Text>
      </View>
      {rows.map((row) => (
        <View key={row.type} style={st.ptRow}>
          <Text style={[st.ptName, { flex: 1 }]}>{row.type}</Text>
          <Text style={st.ptVal}>{row.possPct}</Text>
          <Text style={st.ptVal}>{row.ppp.toFixed(2)}</Text>
          <Text style={[st.ptVal, { color: percentileColor(row.percentile) }]}>{row.percentile}</Text>
          <Text style={st.ptVal}>{row.toPct}</Text>
        </View>
      ))}
    </>
  );
}

function ShotProfileBars({ zones }: { zones: ShotZone[] }) {
  return (
    <>
      {zones.map((z) => (
        <View key={z.zone} style={st.shotBarRow}>
          <Text style={st.shotBarLabel}>{z.zone}</Text>
          <View style={st.shotBarBg}>
            <View style={[st.shotBarFill, { width: `${z.freq}%` }]} />
          </View>
          <Text style={st.shotBarFreq}>{z.freq}%</Text>
          <Text style={st.shotBarEfg}>{z.efg}%</Text>
        </View>
      ))}
    </>
  );
}

function StatCell({ label, value, sub, valueColor }: { label: string; value: string; sub?: string; valueColor?: string }) {
  return (
    <View style={st.statCell}>
      <Text style={[st.statCellValue, valueColor ? { color: valueColor } : undefined]}>{value}</Text>
      <Text style={st.statCellLabel}>{label}</Text>
      {sub && <Text style={st.statCellSub}>{sub}</Text>}
    </View>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={st.miniStat}>
      <Text style={[st.miniStatVal, color ? { color } : undefined]}>{value}</Text>
      <Text style={st.miniStatLabel}>{label}</Text>
    </View>
  );
}

function MiniBar({ label, freq, efg }: { label: string; freq: number; efg: number }) {
  return (
    <View style={st.miniBarCol}>
      <Text style={st.miniBarLabel}>{label}</Text>
      <View style={st.miniBarBg}>
        <View style={[st.miniBarFill, { height: `${freq}%` }]} />
      </View>
      <Text style={st.miniBarVal}>{efg.toFixed(0)}%</Text>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════

const st = StyleSheet.create({
  container: {
    flex: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 4,
  },
  backText: {
    fontSize: 17,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 60,
  },

  // Sticky header
  stickyHeader: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2F3336',
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: '#0B0F14',
    borderRadius: 12,
    padding: 3,
    marginBottom: 10,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: '#0B0F14',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  segmentTextActive: {
    color: '#fff',
  },
  subTabRow: {
    gap: 4,
    paddingBottom: 6,
  },
  subTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  subTabActive: {
    backgroundColor: '#0B0F14',
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  subTabTextActive: {
    color: '#fff',
  },

  // Chip row
  chipScrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
  chipRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    alignItems: 'center',
  },
  chipGroup: {
    backgroundColor: '#0B0F14',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipGroupLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  chipActive: {
    backgroundColor: '#333',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  chipTextActive: {
    color: '#fff',
  },
  badgeChip: {
    backgroundColor: 'rgba(74,222,128,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(74,222,128,0.2)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#22C55E',
    letterSpacing: 0.5,
  },

  // Identity
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 44,
    height: 44,
    marginRight: 12,
  },
  identityText: {
    flex: 1,
  },
  teamName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  teamSubline: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  krBadge: {
    alignItems: 'center',
    backgroundColor: '#0B0F14',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2F3336',
  },
  krValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 28,
  },
  krSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  krSubLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },
  krSubSep: {
    fontSize: 12,
    color: '#555',
  },

  // Cards
  card: {
    backgroundColor: '#0B0F14',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2F3336',
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#A1A1AA',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#2F3336',
    marginVertical: 12,
  },

  // Stat cells
  statThreeCol: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statFourCol: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCell: {
    alignItems: 'center',
    minWidth: 60,
  },
  statCellValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  statCellLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A1A1AA',
    marginTop: 2,
  },
  statCellSub: {
    fontSize: 10,
    color: '#666',
    marginTop: 1,
  },

  // Four Factors
  ffColumns: {
    flexDirection: 'row',
  },
  ffCol: {
    flex: 1,
  },
  ffColHeader: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.0,
    color: '#A1A1AA',
    marginBottom: 8,
  },
  ffDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#2F3336',
    marginHorizontal: 12,
  },
  ffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  ffLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#888',
  },
  ffValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },

  // Cluster bars
  clusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  clusterLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 108,
    gap: 4,
  },
  clusterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ccc',
  },
  clusterBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: '#222',
    borderRadius: 5,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  clusterBarFill: {
    height: 10,
    borderRadius: 5,
  },
  clusterValue: {
    fontSize: 14,
    fontWeight: '700',
    width: 28,
    textAlign: 'right',
  },
  subclusterContainer: {
    marginLeft: 18,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#2F3336',
    marginBottom: 6,
  },
  subclusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  subclusterLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#888',
    width: 110,
  },
  subclusterBarBg: {
    flex: 1,
    height: 5,
    backgroundColor: '#222',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  subclusterBarFill: {
    height: 5,
    borderRadius: 3,
  },
  subclusterValue: {
    fontSize: 11,
    fontWeight: '600',
    width: 24,
    textAlign: 'right',
  },

  // Synergy play type table
  ptHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2F3336',
    marginBottom: 4,
  },
  ptHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A1A1AA',
    letterSpacing: 0.5,
    width: 54,
    textAlign: 'right',
  },
  ptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  ptName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ccc',
  },
  ptVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    width: 54,
    textAlign: 'right',
  },

  // Shot profile bars
  shotBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  shotBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ccc',
    width: 64,
  },
  shotBarBg: {
    flex: 1,
    height: 12,
    backgroundColor: '#222',
    borderRadius: 6,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  shotBarFill: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
  },
  shotBarFreq: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    width: 40,
    textAlign: 'right',
  },
  shotBarEfg: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    width: 40,
    textAlign: 'right',
  },

  // Coverage
  coverageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  coverageScheme: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ccc',
    width: 64,
  },
  coverageBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#0B0F14',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  coverageBarFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  coverageFreq: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    width: 40,
    textAlign: 'right',
  },
  coveragePPP: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    width: 40,
    textAlign: 'right',
  },

  // Emphasis vs Reality
  emphRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  emphLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
    width: 84,
  },
  emphBarContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  emphBarBg: {
    height: 12,
    backgroundColor: '#0B0F14',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  emphBarEmphasis: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 6,
  },
  emphBarActual: {
    position: 'absolute',
    top: 2,
    left: 0,
    height: 8,
    backgroundColor: '#22C55E',
    borderRadius: 4,
  },
  emphValues: {
    flexDirection: 'row',
    gap: 6,
    width: 56,
    justifyContent: 'flex-end',
  },
  emphEmphasisVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
  },
  emphActualVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#22C55E',
  },
  emphLegend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    justifyContent: 'center',
  },
  emphLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emphLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emphLegendText: {
    fontSize: 10,
    color: '#888',
  },

  // KR inline
  krInlineRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
  },
  krInlineLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 0.5,
  },
  krInlineValue: {
    fontSize: 20,
    fontWeight: '800',
  },

  // Lineups
  lineupCard: {
    backgroundColor: '#0B0F14',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2F3336',
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 7,
    elevation: 5,
  },
  lineupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lineupRank: {
    fontSize: 14,
    fontWeight: '800',
    color: '#22C55E',
    width: 28,
  },
  lineupPlayers: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  lineupStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniStat: {
    alignItems: 'center',
  },
  miniStatVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  miniStatLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#888',
    marginTop: 1,
  },

  // Lineup detail sheet
  lineupDetailPlayers: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  lineupDetailPlayer: {
    alignItems: 'center',
  },
  lineupDetailNum: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  lineupDetailName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ccc',
    marginTop: 2,
  },
  lineupDetailPos: {
    fontSize: 10,
    fontWeight: '600',
    color: '#888',
    marginTop: 1,
  },

  // Play type compact
  playTypeCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  playTypeCompactName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ccc',
    flex: 1,
  },
  playTypeCompactFreq: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    width: 44,
    textAlign: 'right',
  },
  playTypeCompactPPP: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    width: 56,
    textAlign: 'right',
  },

  // Shot toggle
  shotToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#0B0F14',
    borderRadius: 8,
    padding: 2,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  pillActive: {
    backgroundColor: '#333',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  pillTextActive: {
    color: '#fff',
  },

  // Projections
  projSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2F3336',
  },
  projSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
  },

  // Player rows
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B0F14',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2F3336',
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  playerLeft: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  playerSub: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  playerKRGroup: {
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#2F3336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2F3336',
  },
  playerKR: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  playerKRSub: {
    fontSize: 9,
    fontWeight: '600',
    color: '#888',
    marginTop: 1,
  },
  playerStatCol: {
    alignItems: 'center',
    minWidth: 40,
    marginLeft: 8,
  },
  playerStatVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  playerStatLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#888',
    marginTop: 1,
  },

  // Player types
  playerTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  playerTypeKR: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
  },

  // Player shot card
  playerShotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B0F14',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2F3336',
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  playerShotBars: {
    flexDirection: 'row',
    gap: 12,
  },
  miniBarCol: {
    alignItems: 'center',
    width: 36,
  },
  miniBarLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
  },
  miniBarBg: {
    width: 16,
    height: 40,
    backgroundColor: '#0B0F14',
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  miniBarFill: {
    width: 16,
    backgroundColor: '#22C55E',
    borderRadius: 4,
  },
  miniBarVal: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },

  // Sheet
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  sheetSub: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  sheetTabs: {
    gap: 4,
    paddingVertical: 10,
  },
  sheetContent: {
    marginTop: 4,
  },
  playerSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
