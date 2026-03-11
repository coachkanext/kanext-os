/**
 * Stats Page — Full Team Stats Hub
 * Multi-tab workspace: Team (Overview/Offense/Defense/Lineups/Shot) + Players
 * Synergy = truth layer (what happened). Carroll = interpretation layer (what it means).
 */

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

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
  'on_ball_defense', 'team_defense', 'rebounding', 'physical',
];

const CLUSTER_LABEL_MAP: Record<keyof ClusterRatings, string> = {
  shooting: 'Shooting',
  finishing: 'Finishing',
  playmaking: 'Playmaking',
  on_ball_defense: 'On-Ball Defense',
  team_defense: 'Team Defense',
  rebounding: 'Rebounding',
  physical: 'Physical',
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
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

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
    <View style={styles.container}>
      {/* ===== STICKY HEADER ===== */}
      <View style={styles.stickyHeader}>
        {/* Top segment: Team | Players */}
        <View style={styles.segmentRow}>
          {(['team', 'players'] as TopTab[]).map((tab) => (
            <Pressable
              key={tab}
              style={[styles.segmentBtn, topTab === tab && styles.segmentBtnActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTopTab(tab);
              }}
            >
              <Text style={[styles.segmentText, topTab === tab && styles.segmentTextActive]}>
                {tab === 'team' ? 'Team' : 'Players'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Sub-tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subTabRow}
        >
          {subTabs.map((tab) => (
            <Pressable
              key={tab.id}
              style={[styles.subTab, activeSubTab === tab.id && styles.subTabActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (topTab === 'team') setTeamSubTab(tab.id as TeamSubTab);
                else setPlayerSubTab(tab.id as PlayerSubTab);
              }}
            >
              <Text style={[styles.subTabText, activeSubTab === tab.id && styles.subTabTextActive]}>
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
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
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
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: C.bg, paddingTop: insets.top }]}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <IconSymbol name="chevron.left" size={20} color={C.label} />
        <Text style={[styles.backText, { color: C.label }]}>Statistics</Text>
      </Pressable>
      <StatsContent />
    </View>
  );
}

// ══════════════════════════════════════════════════════════════
// GLOBAL CONTROLS
// ══════════════════════════════════════════════════════════════

function GlobalControls({ split, onSplitChange }: { split: Split; onSplitChange: (s: Split) => void }) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
      style={styles.chipScrollView}
    >
      <View style={styles.chipGroup}>
        <Text style={styles.chipGroupLabel}>2025–26</Text>
      </View>
      {SPLITS.map((s) => (
        <Pressable
          key={s.id}
          style={[styles.chip, split === s.id && styles.chipActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSplitChange(s.id);
          }}
        >
          <Text style={[styles.chipText, split === s.id && styles.chipTextActive]}>{s.label}</Text>
        </Pressable>
      ))}
      <View style={[styles.chip, styles.badgeChip]}>
        <Text style={styles.badgeText}>Synergy</Text>
      </View>
      <View style={[styles.chip, styles.badgeChip]}>
        <Text style={styles.badgeText}>Carroll</Text>
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
  defWeights: { on_ball_defense: number; team_defense: number; rebounding: number; physical: number };
  expandedCluster: keyof ClusterRatings | null;
  onToggleCluster: (k: keyof ClusterRatings) => void;
  offensiveStyle: string;
  defensiveStyle: string;
}) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const sp = useSplit();
  return (
    <>
      {/* A) Team Identity Strip */}
      <View style={styles.identityRow}>
        <Image source={KaNeXT_LOGO} style={styles.logo} resizeMode="contain" />
        <View style={styles.identityText}>
          <Text style={styles.teamName}>Carroll College</Text>
          <Text style={styles.teamSubline}>NAA {'\u00B7'} Frontier Conference</Text>
        </View>
        <View style={styles.krBadge}>
          <Text style={styles.krValue}>{teamKR}</Text>
          <View style={styles.krSubRow}>
            <Text style={styles.krSubLabel}>O {teamOffKR}</Text>
            <Text style={styles.krSubSep}>{'\u00B7'}</Text>
            <Text style={styles.krSubLabel}>D {teamDefKR}</Text>
          </View>
        </View>
      </View>

      {/* Synergy efficiency row */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>SYNERGY EFFICIENCY</Text>
        <View style={styles.statThreeCol}>
          <StatCell label="OFF PPP" value={shi(SYNERGY_SUMMARY.offPPP, sp).toFixed(2)} />
          <StatCell label="DEF PPP" value={slo(SYNERGY_SUMMARY.defPPP, sp).toFixed(2)} />
          <StatCell label="TEMPO" value={`${shi(SYNERGY_SUMMARY.tempo, sp, 1)}`} sub="Poss/G" />
        </View>
      </View>

      {/* B) Projection Row */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>CARROLL PROJECTIONS</Text>
        <View style={styles.statFourCol}>
          <StatCell label="Proj W" value={`${SEASON_PROJECTION.line}`} />
          <StatCell label="Win%" value={`${shi(SEASON_PROJECTION.winPct, sp, 1)}%`} />
          <StatCell label="Record" value={SEASON_PROJECTION.projectedTotal} />
          <StatCell label="Confidence" value={`${shi(SEASON_PROJECTION.simConfidence, sp, 0)}%`} />
        </View>
        <View style={styles.projSubRow}>
          <Text style={styles.projSub}>{SEASON_PROJECTION.projectedSeed}</Text>
          <Text style={styles.projSub}>NAA Conference Tournament: {shi(SEASON_PROJECTION.playoffProbability, sp, 0)}%</Text>
        </View>
      </View>

      {/* C) Four Factors */}
      <FourFactorsCard />

      {/* D) Synergy Team Summary */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>SYNERGY OFFENSE</Text>
        <SynergyPlayTypeTable rows={adjPT(OFFENSE_PLAY_TYPES.slice(0, 6), sp, false)} isDefense={false} />

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>SHOT PROFILE</Text>
        <ShotProfileBars zones={adjShot(OFFENSE_SHOT_PROFILE.filter((z) => z.zone !== 'FT'), sp, false)} />

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>TEMPO BREAKDOWN</Text>
        <View style={styles.statThreeCol}>
          <StatCell label="Transition" value={shi(TEMPO_BREAKDOWN.transition.ppp, sp).toFixed(2)} sub={`${TEMPO_BREAKDOWN.transition.freq}%`} />
          <StatCell label="Early" value={shi(TEMPO_BREAKDOWN.earlyOffense.ppp, sp).toFixed(2)} sub={`${TEMPO_BREAKDOWN.earlyOffense.freq}%`} />
          <StatCell label="Halfcourt" value={shi(TEMPO_BREAKDOWN.halfcourt.ppp, sp).toFixed(2)} sub={`${TEMPO_BREAKDOWN.halfcourt.freq}%`} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>SYNERGY DEFENSE</Text>
        <SynergyPlayTypeTable rows={adjPT(DEFENSE_PLAY_TYPES.slice(0, 6), sp, true)} isDefense />

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>SHOT PROFILE ALLOWED</Text>
        <ShotProfileBars zones={adjShot(DEFENSE_SHOT_PROFILE.filter((z) => z.zone !== 'FT'), sp, true)} />

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>TEMPO BREAKDOWN</Text>
        <View style={styles.statThreeCol}>
          <StatCell label="Transition" value={slo(DEFENSE_TEMPO_BREAKDOWN.transition.ppp, sp).toFixed(2)} sub={`${DEFENSE_TEMPO_BREAKDOWN.transition.freq}%`} />
          <StatCell label="Early" value={slo(DEFENSE_TEMPO_BREAKDOWN.earlyOffense.ppp, sp).toFixed(2)} sub={`${DEFENSE_TEMPO_BREAKDOWN.earlyOffense.freq}%`} />
          <StatCell label="Halfcourt" value={slo(DEFENSE_TEMPO_BREAKDOWN.halfcourt.ppp, sp).toFixed(2)} sub={`${DEFENSE_TEMPO_BREAKDOWN.halfcourt.freq}%`} />
        </View>

        <View style={styles.divider} />
        <View style={styles.statThreeCol}>
          <StatCell label="Rim FG%" value={`${slo(RIM_PROTECTION.fgPct, sp, 1)}%`} sub={`${RIM_PROTECTION.freq}% freq`} />
          <StatCell label="3PT Allowed" value={`${slo(THREE_PT_DEFENSE.fgPct, sp, 1)}%`} sub={`${THREE_PT_DEFENSE.freq}% freq`} />
          <StatCell label="Contested" value={`${shi(THREE_PT_DEFENSE.contestedPct, sp, 1)}%`} sub="3PT contests" />
        </View>
      </View>

      {/* E) Carroll Overlay */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>CARROLL CLUSTER RATINGS</Text>
        <ClusterBars
          expandedCluster={expandedCluster}
          onToggleCluster={onToggleCluster}
          clusterAvgs={teamClusterAvg}
          subclusterAvgs={teamSubclusterAvg}
        />
      </View>

      {/* System Emphasis vs Reality */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>SYSTEM EMPHASIS vs REALITY</Text>
        <Text style={styles.subLabel}>
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
            <View key={key} style={styles.emphRow}>
              <Text style={styles.emphLabel}>{CLUSTER_LABEL_MAP[key]}</Text>
              <View style={styles.emphBarContainer}>
                <View style={styles.emphBarBg}>
                  <View style={[styles.emphBarEmphasis, { width: `${emphasisPct}%` }]} />
                  <View style={[styles.emphBarActual, { width: `${actual}%` }]} />
                </View>
              </View>
              <View style={styles.emphValues}>
                <Text style={styles.emphEmphasisVal}>{emphasis}</Text>
                <Text style={styles.emphActualVal}>{actual}</Text>
              </View>
            </View>
          );
        })}
        <View style={styles.emphLegend}>
          <View style={styles.emphLegendItem}>
            <View style={[styles.emphLegendDot, { backgroundColor: C.separator }]} />
            <Text style={styles.emphLegendText}>Emphasis</Text>
          </View>
          <View style={styles.emphLegendItem}>
            <View style={[styles.emphLegendDot, { backgroundColor: C.green }]} />
            <Text style={styles.emphLegendText}>Actual</Text>
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
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
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
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>SYNERGY PLAY TYPES</Text>
        <SynergyPlayTypeTable rows={adjPT(OFFENSE_PLAY_TYPES, sp, false)} isDefense={false} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>CARROLL OFFENSE</Text>
        <View style={styles.krInlineRow}>
          <Text style={styles.krInlineLabel}>OFF KR</Text>
          <Text style={[styles.krInlineValue, { color: barColor(teamOffKR) }]}>{teamOffKR}</Text>
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
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const sp = useSplit();
  const defKeys: (keyof ClusterRatings)[] = ['on_ball_defense', 'team_defense', 'rebounding', 'physical'];
  const defAvgs: Record<keyof ClusterRatings, number> = {} as any;
  const defSubAvgs: Record<keyof ClusterRatings, { name: string; rating: number }[]> = {} as any;
  for (const k of defKeys) {
    defAvgs[k] = teamClusterAvg[k];
    defSubAvgs[k] = teamSubclusterAvg[k];
  }

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>SYNERGY DEFENSE PLAY TYPES</Text>
        <SynergyPlayTypeTable rows={adjPT(DEFENSE_PLAY_TYPES, sp, true)} isDefense />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>OPPONENT SHOT PROFILE</Text>
        <ShotProfileBars zones={adjShot(DEFENSE_SHOT_PROFILE.filter((z) => z.zone !== 'FT'), sp, true)} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>COVERAGE BREAKDOWN</Text>
        <Text style={styles.subLabel}>Ball Screen</Text>
        {BALL_SCREEN_COVERAGE.map((c) => (
          <View key={c.scheme} style={styles.coverageRow}>
            <Text style={styles.coverageScheme}>{c.scheme}</Text>
            <View style={styles.coverageBarBg}>
              <View style={[styles.coverageBarFill, { width: `${c.freq}%` }]} />
            </View>
            <Text style={styles.coverageFreq}>{c.freq}%</Text>
            <Text style={styles.coveragePPP}>{slo(c.pppAllowed, sp).toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <Text style={styles.subLabel}>Post Defense</Text>
        {POST_COVERAGE.map((c) => (
          <View key={c.scheme} style={styles.coverageRow}>
            <Text style={styles.coverageScheme}>{c.scheme}</Text>
            <View style={styles.coverageBarBg}>
              <View style={[styles.coverageBarFill, { width: `${c.freq}%` }]} />
            </View>
            <Text style={styles.coverageFreq}>{c.freq}%</Text>
            <Text style={styles.coveragePPP}>{slo(c.pppAllowed, sp).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>CARROLL DEFENSE</Text>
        <View style={styles.krInlineRow}>
          <Text style={styles.krInlineLabel}>DEF KR</Text>
          <Text style={[styles.krInlineValue, { color: barColor(teamDefKR) }]}>{teamDefKR}</Text>
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
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const sp = useSplit();
  const lineups = useMemo(() => adjLineups(TOP_LINEUPS, sp), [sp]);
  return (
    <>
      <Text style={styles.sectionLabel}>TOP 10 LINEUPS</Text>
      {lineups.map((lineup, idx) => (
        <Pressable
          key={lineup.id}
          style={styles.lineupCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onOpenLineup(lineup);
          }}
        >
          <View style={styles.lineupHeader}>
            <Text style={styles.lineupRank}>#{idx + 1}</Text>
            <Text style={styles.lineupPlayers}>
              {lineup.players.map((p) => p.name).join(' · ')}
            </Text>
          </View>
          <View style={styles.lineupStatsRow}>
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
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const detail = LINEUP_DETAILS[lineup.id];
  return (
    <>
      <Text style={styles.sheetTitle}>Lineup Detail</Text>
      <View style={styles.lineupDetailPlayers}>
        {lineup.players.map((p) => (
          <View key={p.number} style={styles.lineupDetailPlayer}>
            <Text style={styles.lineupDetailNum}>#{p.number}</Text>
            <Text style={styles.lineupDetailName}>{p.name}</Text>
            <Text style={styles.lineupDetailPos}>{p.position}</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />
      <View style={styles.statFourCol}>
        <StatCell label="Minutes" value={`${lineup.minutes}`} />
        <StatCell label="Poss" value={`${lineup.possessions}`} />
        <StatCell label="Net Rtg" value={lineup.netRating > 0 ? `+${lineup.netRating.toFixed(1)}` : lineup.netRating.toFixed(1)} valueColor={netColor(lineup.netRating)} />
        <StatCell label="FT Rate" value={lineup.ftRate.toFixed(2)} />
      </View>

      {detail && (
        <>
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>SHOT PROFILE</Text>
          {detail.shotProfile.map((z) => (
            <View key={z.zone} style={styles.coverageRow}>
              <Text style={styles.coverageScheme}>{z.zone}</Text>
              <View style={styles.coverageBarBg}>
                <View style={[styles.coverageBarFill, { width: `${z.freq}%` }]} />
              </View>
              <Text style={styles.coverageFreq}>{z.freq}%</Text>
              <Text style={styles.coveragePPP}>{z.ppp.toFixed(2)}</Text>
            </View>
          ))}

          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>TOP PLAY TYPES</Text>
          {detail.topPlayTypes.map((pt) => (
            <View key={pt.type} style={styles.playTypeCompact}>
              <Text style={styles.playTypeCompactName}>{pt.type}</Text>
              <Text style={styles.playTypeCompactFreq}>{pt.possPct}%</Text>
              <Text style={styles.playTypeCompactPPP}>{pt.ppp.toFixed(2)}</Text>
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
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const sp = useSplit();
  const isDef = shotToggle === 'defense';
  const zones = isDef
    ? adjShot(DEFENSE_SHOT_PROFILE.filter((z) => z.zone !== 'FT'), sp, true)
    : adjShot(OFFENSE_SHOT_PROFILE.filter((z) => z.zone !== 'FT'), sp, false);

  return (
    <>
      {/* Toggle */}
      <View style={styles.shotToggleRow}>
        <Pressable
          style={[styles.pill, shotToggle === 'offense' && styles.pillActive]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggle('offense'); }}
        >
          <Text style={[styles.pillText, shotToggle === 'offense' && styles.pillTextActive]}>Offense</Text>
        </Pressable>
        <Pressable
          style={[styles.pill, shotToggle === 'defense' && styles.pillActive]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggle('defense'); }}
        >
          <Text style={[styles.pillText, shotToggle === 'defense' && styles.pillTextActive]}>Defense</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>{shotToggle === 'offense' ? 'SHOT PROFILE' : 'SHOT PROFILE ALLOWED'}</Text>
        <ShotProfileBars zones={zones} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>3-POINT BREAKDOWN</Text>
        <View style={styles.statThreeCol}>
          <StatCell label="C&S" value={`${shi(THREE_PT_BREAKDOWN.catchAndShoot.efg, sp, 1)}%`} sub={`${THREE_PT_BREAKDOWN.catchAndShoot.freq}% freq`} />
          <StatCell label="Off Dribble" value={`${shi(THREE_PT_BREAKDOWN.offDribble.efg, sp, 1)}%`} sub={`${THREE_PT_BREAKDOWN.offDribble.freq}% freq`} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>ASSISTED %</Text>
        <View style={styles.statThreeCol}>
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
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
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
      <Text style={styles.sectionLabel}>PLAYERS BY USAGE</Text>
      {players.map((p) => (
        <Pressable
          key={p.playerId}
          style={styles.playerRow}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onOpenPlayer(p.playerId);
          }}
        >
          <View style={styles.playerLeft}>
            <Text style={styles.playerName}>{p.name}</Text>
            <Text style={styles.playerSub}>#{p.number} · {p.position}</Text>
          </View>
          <View style={styles.playerKRGroup}>
            <Text style={styles.playerKR}>{p.kr}</Text>
            <Text style={styles.playerKRSub}>O{p.offKR} D{p.defKR}</Text>
          </View>
          <View style={styles.playerStatCol}>
            <Text style={styles.playerStatVal}>{p.usagePct}%</Text>
            <Text style={styles.playerStatLabel}>USG</Text>
          </View>
          <View style={styles.playerStatCol}>
            <Text style={styles.playerStatVal}>{shi(p.ppp, sp).toFixed(2)}</Text>
            <Text style={styles.playerStatLabel}>PPP</Text>
          </View>
          <View style={styles.playerStatCol}>
            <Text style={[styles.playerStatVal, { color: percentileColor(sptile(p.percentile, sp)) }]}>{sptile(p.percentile, sp)}</Text>
            <Text style={styles.playerStatLabel}>%ile</Text>
          </View>
        </Pressable>
      ))}
    </>
  );
}

function PlayersOffense({ onOpenPlayer }: { onOpenPlayer: (id: string) => void }) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const sp = useSplit();
  return (
    <>
      <Text style={styles.sectionLabel}>PLAYER OFFENSE (SYNERGY)</Text>
      {PLAYER_SYNERGY.map((p) => (
        <Pressable
          key={p.playerId}
          style={styles.playerRow}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onOpenPlayer(p.playerId);
          }}
        >
          <View style={styles.playerLeft}>
            <Text style={styles.playerName}>{p.name}</Text>
            <Text style={styles.playerSub}>#{p.number}</Text>
          </View>
          <View style={styles.playerStatCol}>
            <Text style={styles.playerStatVal}>{shi(p.ppp, sp).toFixed(2)}</Text>
            <Text style={styles.playerStatLabel}>PPP</Text>
          </View>
          <View style={styles.playerStatCol}>
            <Text style={styles.playerStatVal}>{p.topPlayType}</Text>
            <Text style={styles.playerStatLabel}>Top Type</Text>
          </View>
          <View style={styles.playerStatCol}>
            <Text style={styles.playerStatVal}>{shi(p.topPlayTypePPP, sp).toFixed(2)}</Text>
            <Text style={styles.playerStatLabel}>Type PPP</Text>
          </View>
        </Pressable>
      ))}
    </>
  );
}

function PlayersDefense() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
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
      <Text style={styles.sectionLabel}>PLAYER DEFENSE (CARROLL)</Text>
      {players.map((p) => {
        const clusters = PLAYER_CLUSTERS[p.number];
        return (
          <View key={p.playerId} style={styles.playerRow}>
            <View style={styles.playerLeft}>
              <Text style={styles.playerName}>{p.name}</Text>
              <Text style={styles.playerSub}>#{p.number}</Text>
            </View>
            <View style={styles.playerStatCol}>
              <Text style={[styles.playerStatVal, { color: barColor(p.defKR) }]}>{p.defKR}</Text>
              <Text style={styles.playerStatLabel}>DEF KR</Text>
            </View>
            {clusters && (
              <>
                <View style={styles.playerStatCol}>
                  <Text style={styles.playerStatVal}>{clusters.on_ball_defense}</Text>
                  <Text style={styles.playerStatLabel}>OB</Text>
                </View>
                <View style={styles.playerStatCol}>
                  <Text style={styles.playerStatVal}>{clusters.team_defense}</Text>
                  <Text style={styles.playerStatLabel}>Team</Text>
                </View>
                <View style={styles.playerStatCol}>
                  <Text style={styles.playerStatVal}>{clusters.rebounding}</Text>
                  <Text style={styles.playerStatLabel}>Reb</Text>
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
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
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
      <Text style={styles.sectionLabel}>PLAYER ARCHETYPES</Text>
      {grouped.map(([archetype, group]) => (
        <View key={archetype} style={styles.card}>
          <Text style={styles.subLabel}>{archetype.toUpperCase()}</Text>
          {group.map((p) => (
            <View key={p.playerId} style={styles.playerTypeRow}>
              <Text style={styles.playerName}>{p.name}</Text>
              <Text style={styles.playerSub}>#{p.number} · {p.position}</Text>
              <Text style={styles.playerTypeKR}>KR {p.offKR > 0 ? Math.round(p.offKR * 0.53 + p.defKR * 0.47) : '—'}</Text>
            </View>
          ))}
        </View>
      ))}
    </>
  );
}

function PlayersShot({ onOpenPlayer }: { onOpenPlayer: (id: string) => void }) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const sp = useSplit();
  return (
    <>
      <Text style={styles.sectionLabel}>PLAYER SHOT PROFILES</Text>
      {PLAYER_SYNERGY.map((p) => {
        const profile = PLAYER_SHOT_PROFILES[p.playerId];
        if (!profile) return null;
        return (
          <Pressable
            key={p.playerId}
            style={styles.playerShotCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onOpenPlayer(p.playerId);
            }}
          >
            <View style={styles.playerLeft}>
              <Text style={styles.playerName}>{p.name}</Text>
              <Text style={styles.playerSub}>#{p.number}</Text>
            </View>
            <View style={styles.playerShotBars}>
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
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const player = PLAYER_SYNERGY.find((p) => p.playerId === playerId);
  const leader = KaNeXT_LEADERS.find((l) => l.number === player?.number);
  const clusters = player ? PLAYER_CLUSTERS[player.number] : null;
  const profile = PLAYER_SHOT_PROFILES[playerId];
  const [expandedCluster, setExpandedCluster] = useState<keyof ClusterRatings | null>(null);

  if (!player) return <Text style={styles.sheetTitle}>Player not found</Text>;

  const kr = clusters ? Math.round(computeOffKR(clusters) * 0.53 + computeDefKR(clusters) * 0.47) : 0;
  const offKR = clusters ? computeOffKR(clusters) : 0;
  const defKR = clusters ? computeDefKR(clusters) : 0;

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'synergy', label: 'Synergy' },
    { id: 'kanext', label: 'Carroll' },
    { id: 'shot', label: 'Shot' },
  ];

  return (
    <>
      {/* Header */}
      <View style={styles.playerSheetHeader}>
        <View>
          <Text style={styles.sheetTitle}>{player.name}</Text>
          <Text style={styles.sheetSub}>#{player.number} · {player.position}</Text>
        </View>
        <View style={styles.krBadge}>
          <Text style={styles.krValue}>{kr}</Text>
          <View style={styles.krSubRow}>
            <Text style={styles.krSubLabel}>O {offKR}</Text>
            <Text style={styles.krSubSep}>{'\u00B7'}</Text>
            <Text style={styles.krSubLabel}>D {defKR}</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sheetTabs}>
        {tabs.map((t) => (
          <Pressable
            key={t.id}
            style={[styles.subTab, activeTab === t.id && styles.subTabActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onTabChange(t.id);
            }}
          >
            <Text style={[styles.subTabText, activeTab === t.id && styles.subTabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Tab content */}
      {activeTab === 'summary' && leader && (
        <View style={styles.sheetContent}>
          <View style={styles.statFourCol}>
            <StatCell label="PPG" value={leader.ppg.toFixed(1)} />
            <StatCell label="RPG" value={leader.rpg.toFixed(1)} />
            <StatCell label="APG" value={leader.apg.toFixed(1)} />
            <StatCell label="GP" value={`${leader.gamesPlayed}`} />
          </View>
          <View style={styles.divider} />
          <View style={styles.statFourCol}>
            <StatCell label="FG%" value={`${(leader.fgPct * 100).toFixed(1)}%`} />
            <StatCell label="3PT%" value={`${(leader.threePct * 100).toFixed(1)}%`} />
            <StatCell label="FT%" value={`${(leader.ftPct * 100).toFixed(1)}%`} />
            <StatCell label="USG" value={`${player.usagePct}%`} />
          </View>
          <View style={styles.divider} />
          <View style={styles.statThreeCol}>
            <StatCell label="PPP" value={player.ppp.toFixed(2)} />
            <StatCell label="Percentile" value={`${player.percentile}`} valueColor={percentileColor(player.percentile)} />
            <StatCell label="Top Type" value={player.topPlayType} />
          </View>
        </View>
      )}

      {activeTab === 'synergy' && (
        <View style={styles.sheetContent}>
          <View style={styles.statThreeCol}>
            <StatCell label="PPP" value={player.ppp.toFixed(2)} />
            <StatCell label="%ile" value={`${player.percentile}`} valueColor={percentileColor(player.percentile)} />
            <StatCell label="USG" value={`${player.usagePct}%`} />
          </View>
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>TOP PLAY TYPE</Text>
          <View style={styles.playTypeCompact}>
            <Text style={styles.playTypeCompactName}>{player.topPlayType}</Text>
            <Text style={styles.playTypeCompactPPP}>{player.topPlayTypePPP.toFixed(2)} PPP</Text>
          </View>
          {profile && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>SHOT PROFILE</Text>
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
        <View style={styles.sheetContent}>
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
        <View style={styles.sheetContent}>
          <ShotProfileBars zones={[
            { zone: 'Rim', freq: profile.rim.freq, ppp: 0, efg: profile.rim.efg },
            { zone: 'Mid', freq: profile.mid.freq, ppp: 0, efg: profile.mid.efg },
            { zone: '3PT', freq: profile.three.freq, ppp: 0, efg: profile.three.efg },
          ]} />
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>3PT BREAKDOWN</Text>
          <View style={styles.statThreeCol}>
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
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const sp = useSplit();
  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>FOUR FACTORS</Text>
      <View style={styles.ffColumns}>
        <View style={styles.ffCol}>
          <Text style={styles.ffColHeader}>OFFENSE</Text>
          <FFRow label="eFG%" value={shi(eFG, sp, 1).toFixed(1)} />
          <FFRow label="TO%" value={slo(TOPct, sp, 1).toFixed(1)} invert />
          <FFRow label="ORB%" value={shi(ORBPct, sp, 1).toFixed(1)} />
          <FFRow label="FT Rate" value={shi(FTRate, sp, 1).toFixed(1)} />
        </View>
        <View style={styles.ffDivider} />
        <View style={styles.ffCol}>
          <Text style={styles.ffColHeader}>DEFENSE</Text>
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
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={styles.ffRow}>
      <Text style={styles.ffLabel}>{label}</Text>
      <Text style={styles.ffValue}>{value}%</Text>
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
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
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
              style={styles.clusterRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onToggleCluster(key);
              }}
            >
              <View style={styles.clusterLabelRow}>
                <IconSymbol name={isExpanded ? 'chevron.down' : 'chevron.right'} size={10} color={C.muted} />
                <Text style={styles.clusterLabel}>{CLUSTER_LABEL_MAP[key]}</Text>
              </View>
              <View style={styles.clusterBarBg}>
                <View style={[styles.clusterBarFill, { width: `${avg}%`, backgroundColor: barColor(avg) }]} />
              </View>
              <Text style={[styles.clusterValue, { color: barColor(avg) }]}>{avg}</Text>
            </Pressable>
            {isExpanded && (
              <View style={styles.subclusterContainer}>
                {subs.map((sub) => (
                  <View key={sub.name} style={styles.subclusterRow}>
                    <Text style={styles.subclusterLabel}>{sub.name}</Text>
                    <View style={styles.subclusterBarBg}>
                      <View style={[styles.subclusterBarFill, { width: `${sub.rating}%`, backgroundColor: barColor(sub.rating) }]} />
                    </View>
                    <Text style={[styles.subclusterValue, { color: barColor(sub.rating) }]}>{sub.rating}</Text>
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
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  return (
    <>
      <View style={styles.ptHeaderRow}>
        <Text style={[styles.ptHeaderText, { flex: 1, textAlign: 'left' }]}>Play Type</Text>
        <Text style={styles.ptHeaderText}>Poss%</Text>
        <Text style={styles.ptHeaderText}>{isDefense ? 'PPP Alw' : 'PPP'}</Text>
        <Text style={styles.ptHeaderText}>%</Text>
        <Text style={styles.ptHeaderText}>TO%</Text>
      </View>
      {rows.map((row) => (
        <View key={row.type} style={styles.ptRow}>
          <Text style={[styles.ptName, { flex: 1 }]}>{row.type}</Text>
          <Text style={styles.ptVal}>{row.possPct}</Text>
          <Text style={styles.ptVal}>{row.ppp.toFixed(2)}</Text>
          <Text style={[styles.ptVal, { color: percentileColor(row.percentile) }]}>{row.percentile}</Text>
          <Text style={styles.ptVal}>{row.toPct}</Text>
        </View>
      ))}
    </>
  );
}

function ShotProfileBars({ zones }: { zones: ShotZone[] }) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  return (
    <>
      {zones.map((z) => (
        <View key={z.zone} style={styles.shotBarRow}>
          <Text style={styles.shotBarLabel}>{z.zone}</Text>
          <View style={styles.shotBarBg}>
            <View style={[styles.shotBarFill, { width: `${z.freq}%` }]} />
          </View>
          <Text style={styles.shotBarFreq}>{z.freq}%</Text>
          <Text style={styles.shotBarEfg}>{z.efg}%</Text>
        </View>
      ))}
    </>
  );
}

function StatCell({ label, value, sub, valueColor }: { label: string; value: string; sub?: string; valueColor?: string }) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statCellValue, valueColor ? { color: valueColor } : undefined]}>{value}</Text>
      <Text style={styles.statCellLabel}>{label}</Text>
      {sub && <Text style={styles.statCellSub}>{sub}</Text>}
    </View>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={styles.miniStat}>
      <Text style={[styles.miniStatVal, color ? { color } : undefined]}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

function MiniBar({ label, freq, efg }: { label: string; freq: number; efg: number }) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={styles.miniBarCol}>
      <Text style={styles.miniBarLabel}>{label}</Text>
      <View style={styles.miniBarBg}>
        <View style={[styles.miniBarFill, { height: `${freq}%` }]} />
      </View>
      <Text style={styles.miniBarVal}>{efg.toFixed(0)}%</Text>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════

const makeStyles = (C: ComponentColors) => StyleSheet.create({
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
    borderBottomColor: C.divider,
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: C.surface,
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
    backgroundColor: C.surface,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.muted,
  },
  segmentTextActive: {
    color: C.label,
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
    backgroundColor: C.surface,
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.muted,
  },
  subTabTextActive: {
    color: C.label,
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
    backgroundColor: C.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipGroupLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.label,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: C.separator,
  },
  chipActive: {
    backgroundColor: C.surface,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
  },
  chipTextActive: {
    color: C.label,
  },
  badgeChip: {
    backgroundColor: 'rgba(74,222,128,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(74,222,128,0.2)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.green,
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
    color: C.label,
    letterSpacing: -0.5,
  },
  teamSubline: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  krBadge: {
    alignItems: 'center',
    backgroundColor: C.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.divider,
  },
  krValue: {
    fontSize: 24,
    fontWeight: '800',
    color: C.label,
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
    color: C.muted,
  },
  krSubSep: {
    fontSize: 12,
    color: C.muted,
  },

  // Cards
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.divider,
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
    color: C.muted,
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.divider,
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
    color: C.label,
    letterSpacing: -0.5,
  },
  statCellLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: C.muted,
    marginTop: 2,
  },
  statCellSub: {
    fontSize: 10,
    color: C.muted,
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
    color: C.muted,
    marginBottom: 8,
  },
  ffDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: C.divider,
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
    color: C.muted,
  },
  ffValue: {
    fontSize: 13,
    fontWeight: '700',
    color: C.label,
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
    color: C.secondary,
  },
  clusterBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: C.surface,
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
    borderLeftColor: C.divider,
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
    color: C.muted,
    width: 110,
  },
  subclusterBarBg: {
    flex: 1,
    height: 5,
    backgroundColor: C.surface,
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
    borderBottomColor: C.divider,
    marginBottom: 4,
  },
  ptHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.5,
    width: 54,
    textAlign: 'right',
  },
  ptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.separator,
  },
  ptName: {
    fontSize: 12,
    fontWeight: '600',
    color: C.secondary,
  },
  ptVal: {
    fontSize: 12,
    fontWeight: '600',
    color: C.label,
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
    color: C.secondary,
    width: 64,
  },
  shotBarBg: {
    flex: 1,
    height: 12,
    backgroundColor: C.surface,
    borderRadius: 6,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  shotBarFill: {
    height: 12,
    borderRadius: 6,
    backgroundColor: C.green,
  },
  shotBarFreq: {
    fontSize: 12,
    fontWeight: '600',
    color: C.label,
    width: 40,
    textAlign: 'right',
  },
  shotBarEfg: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
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
    color: C.secondary,
    width: 64,
  },
  coverageBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: C.surface,
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
    color: C.label,
    width: 40,
    textAlign: 'right',
  },
  coveragePPP: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
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
    color: C.muted,
    width: 84,
  },
  emphBarContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  emphBarBg: {
    height: 12,
    backgroundColor: C.surface,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  emphBarEmphasis: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 12,
    backgroundColor: C.separator,
    borderRadius: 6,
  },
  emphBarActual: {
    position: 'absolute',
    top: 2,
    left: 0,
    height: 8,
    backgroundColor: C.green,
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
    color: C.muted,
  },
  emphActualVal: {
    fontSize: 11,
    fontWeight: '700',
    color: C.green,
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
    color: C.muted,
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
    color: C.muted,
    letterSpacing: 0.5,
  },
  krInlineValue: {
    fontSize: 20,
    fontWeight: '800',
  },

  // Lineups
  lineupCard: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.divider,
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
    color: C.green,
    width: 28,
  },
  lineupPlayers: {
    fontSize: 13,
    fontWeight: '600',
    color: C.label,
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
    color: C.label,
  },
  miniStatLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: C.muted,
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
    color: C.label,
  },
  lineupDetailName: {
    fontSize: 12,
    fontWeight: '600',
    color: C.secondary,
    marginTop: 2,
  },
  lineupDetailPos: {
    fontSize: 10,
    fontWeight: '600',
    color: C.muted,
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
    color: C.secondary,
    flex: 1,
  },
  playTypeCompactFreq: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
    width: 44,
    textAlign: 'right',
  },
  playTypeCompactPPP: {
    fontSize: 13,
    fontWeight: '700',
    color: C.label,
    width: 56,
    textAlign: 'right',
  },

  // Shot toggle
  shotToggleRow: {
    flexDirection: 'row',
    backgroundColor: C.surface,
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
    backgroundColor: C.surface,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.muted,
  },
  pillTextActive: {
    color: C.label,
  },

  // Projections
  projSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.divider,
  },
  projSub: {
    fontSize: 11,
    fontWeight: '600',
    color: C.muted,
  },

  // Player rows
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.divider,
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
    color: C.label,
  },
  playerSub: {
    fontSize: 11,
    color: C.muted,
    marginTop: 2,
  },
  playerKRGroup: {
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: C.divider,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.divider,
  },
  playerKR: {
    fontSize: 16,
    fontWeight: '800',
    color: C.label,
  },
  playerKRSub: {
    fontSize: 9,
    fontWeight: '600',
    color: C.muted,
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
    color: C.label,
  },
  playerStatLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: C.muted,
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
    color: C.muted,
  },

  // Player shot card
  playerShotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.divider,
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
    color: C.muted,
    marginBottom: 4,
  },
  miniBarBg: {
    width: 16,
    height: 40,
    backgroundColor: C.surface,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  miniBarFill: {
    width: 16,
    backgroundColor: C.green,
    borderRadius: 4,
  },
  miniBarVal: {
    fontSize: 10,
    fontWeight: '700',
    color: C.label,
    marginTop: 2,
  },

  // Sheet
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.label,
  },
  sheetSub: {
    fontSize: 13,
    color: C.muted,
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
