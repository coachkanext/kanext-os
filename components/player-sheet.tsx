/**
 * Universal Player Sheet — shared bottom sheet for roster and recruiting players.
 * 4-tab layout for roster players (Bio, FIT, KaNeXT, Timeline)
 * 2-tab layout for recruiting players (FIT, KaNeXT)
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Spacing, BorderRadius } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { type ClusterRatings, getPlayerSubclusters } from '@/data/roster-data';
import { ARCHETYPE_LABELS } from '@/data/system-demand-profiles';
import type { Archetype } from '@/data/system-demand-profiles';
import { CLUSTER_LABELS } from '@/data/mock-program-context';
import type { OffensiveStyle, DefensiveStyle, ClusterType } from '@/types';
import { TRADITIONAL_TO_HELIO, HELIO_POSITION_LABELS } from '@/data/position-mapping';
import { getPlayerRatings, getPoolPlayerSubclusters } from '@/data/playerRatings';
import { getPlayerSeasons } from '@/data/playerSeasons';
import { computeFitKR, computeOffDefKR, getFitReasons } from '@/utils/fit-kr';
import { OFFENSIVE_STYLES, DEFENSIVE_STYLES } from '@/data/mock-program-context';
import { type PoolPlayer, PLAYER_POOL, POOL_PLAYER_AWARDS } from '@/data/playerPool';
import {
  FMU_PLAYER_BIOS,
  FMU_PLAYER_ABOUT,
  FMU_LEADERS,
  getFmuCareer,
  getFmuAwards,
  getFmuHighlights,
  getFmuTS,
} from '@/data/fmu';
import {
  getPlayerComms,
  getRecruitComms,
  COMMS_TYPE_META,
  type CommsEntry,
  type TouchMethod,
} from '@/data/mock-comms';
import type { BoardEntry, BoardStatus } from '@/data/recruitingBoard';
import { computePlayerBadges, BADGE_LEVEL_COLORS, type PlayerBadge } from '@/utils/player-badges';
import { BOARD_COLUMNS, BOARD_COLUMN_COLORS } from '@/data/recruitingBoard';
import type { PositionNeed } from '@/data/team-needs';

// ─── Constants ───
const GRAY = '#8A8F98';

type SheetTab = 'fit' | 'kanext' | 'recruiting' | 'timeline' | 'bio' | 'comms';

const TAB_LABELS: Record<SheetTab, string> = {
  fit: 'FIT',
  kanext: 'KaNeXT',
  recruiting: 'Recruiting',
  timeline: 'Timeline',
  bio: 'Bio',
  comms: 'Comms',
};

const ALL_CLUSTER_KEYS: (keyof ClusterRatings)[] = [
  'shooting', 'finishing', 'playmaking',
  'perimeter_defense', 'interior_defense', 'rebounding', 'frame',
];

// ─── Archetype → usage/touches mapping ───
const HIGH_USAGE_ARCHETYPES = new Set<Archetype>([
  'pick_and_roll_operator', 'primary_ball_handler', 'dho_handoff_hub',
  'secondary_creator_wing', 'connector_guard_wing',
]);
const MED_USAGE_ARCHETYPES = new Set<Archetype>([
  'two_way_wing', 'three_and_d_wing', 'slasher_rim_pressure_wing',
  'switchable_defender_wing', 'off_ball_shooter',
]);

function getUsageTouches(archetype: Archetype): { usage: string; touches: string } {
  if (HIGH_USAGE_ARCHETYPES.has(archetype)) return { usage: 'High', touches: 'High' };
  if (MED_USAGE_ARCHETYPES.has(archetype)) return { usage: 'Med', touches: 'Med' };
  return { usage: 'Low', touches: 'Low' };
}

function getLineupSlot(fitKR: number): string {
  if (fitKR >= 80) return 'Starter';
  if (fitKR >= 65) return 'Rotation Anchor';
  if (fitKR >= 50) return 'Specialist';
  return 'Depth';
}

// Complementary archetype pairings by position category
const PAIRING_MAP: Record<string, Archetype[]> = {
  PG: ['spot_up_specialist', 'vertical_spacer'],
  SG: ['pick_and_roll_operator', 'two_way_wing'],
  SF: ['primary_ball_handler', 'stretch_big'],
  PF: ['connector_guard_wing', 'three_and_d_wing'],
  C: ['pick_and_roll_operator', 'three_and_d_wing'],
};

// Short class year labels
const CLASS_SHORT: Record<string, string> = {
  Freshman: 'Fr', Sophomore: 'So', Junior: 'Jr', Senior: 'Sr',
  'Grad Student': 'Gr', 'R-Freshman': 'R-Fr', 'R-Sophomore': 'R-So',
  'R-Junior': 'R-Jr', 'R-Senior': 'R-Sr',
};

// ── Cluster Bar ──

function ClusterBar({
  clusterKey,
  value,
  playerId,
  jerseyNumber,
  expanded,
  onToggle,
}: {
  clusterKey: keyof ClusterRatings;
  value: number;
  playerId: string;
  jerseyNumber?: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const label = CLUSTER_LABELS[clusterKey as ClusterType]?.label ?? clusterKey;
  const barColor = value >= 70 ? '#4CAF50' : value >= 55 ? '#FF9800' : '#EF4444';
  const pct = Math.min(value, 100);
  const subclusters = expanded
    ? jerseyNumber
      ? getPlayerSubclusters(jerseyNumber, clusterKey)
      : getPoolPlayerSubclusters(playerId, clusterKey, value)
    : [];

  return (
    <View>
      <Pressable style={barStyles.row} onPress={onToggle}>
        <View style={barStyles.labelCol}>
          <Text style={barStyles.label}>{label}</Text>
        </View>
        <View style={barStyles.barTrack}>
          <View style={[barStyles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
        </View>
        <Text style={[barStyles.value, { color: barColor }]}>{value}</Text>
        <Text style={barStyles.chevron}>{expanded ? '\u25BE' : '\u203A'}</Text>
      </Pressable>

      {expanded && subclusters.map((sc) => {
        const scColor = sc.rating >= 70 ? '#4CAF50' : sc.rating >= 55 ? '#FF9800' : '#EF4444';
        const scPct = Math.min(sc.rating, 100);
        return (
          <View key={sc.name} style={barStyles.subRow}>
            <Text style={barStyles.subLabel}>{sc.name}</Text>
            <View style={barStyles.subBarTrack}>
              <View style={[barStyles.barFill, { width: `${scPct}%`, backgroundColor: scColor }]} />
            </View>
            <Text style={[barStyles.subValue, { color: scColor }]}>{sc.rating}</Text>
          </View>
        );
      })}
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingVertical: 2 },
  labelCol: { width: 72 },
  label: { fontSize: 11, fontWeight: '600', color: '#f5f5f5' },
  barTrack: { flex: 1, height: 8, backgroundColor: '#2a2a2a', borderRadius: 4, overflow: 'hidden', marginHorizontal: 8 },
  barFill: { height: '100%', borderRadius: 4 },
  value: { fontSize: 13, fontWeight: '700', width: 28, textAlign: 'right' },
  chevron: { fontSize: 11, color: '#6e6e6e', width: 16, textAlign: 'center', marginLeft: 2 },
  subRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 20, marginBottom: 6 },
  subLabel: { fontSize: 10, color: '#999', width: 100 },
  subBarTrack: { flex: 1, height: 5, backgroundColor: '#222', borderRadius: 3, overflow: 'hidden', marginHorizontal: 6 },
  subValue: { fontSize: 11, fontWeight: '600', width: 24, textAlign: 'right' },
});

// ── Main Sheet ──

export interface PlayerSheetProps {
  visible: boolean;
  onClose: () => void;
  player: PoolPlayer | null;
  offStyle: OffensiveStyle;
  defStyle: DefensiveStyle;
  onOffStyleChange: (style: OffensiveStyle) => void;
  onDefStyleChange: (style: DefensiveStyle) => void;
  fitNote: string;
  onFitNoteChange: (text: string) => void;
  coachNote: string;
  onCoachNoteChange: (text: string) => void;
  /** Override cluster ratings (e.g. from roster data instead of pool ratings) */
  clusterOverride?: ClusterRatings;
  /** Override base KR (e.g. from roster data) */
  baseKROverride?: number;
  /** Player height + weight */
  physicals?: { height: string; weight: number };
  /** FMU jersey number — enables Timeline, Bio tabs (4-tab roster mode) */
  jerseyNumber?: string;
  /** Board entry for this player (enables Recruiting tab) */
  boardEntry?: BoardEntry | null;
  /** Team needs (for recruiting snapshot) */
  teamNeeds?: PositionNeed[];
  /** Board action callbacks */
  onMoveOnBoard?: (entryId: string, status: BoardStatus) => void;
  onRemoveFromBoard?: (entryId: string) => void;
  /** Default tab override (e.g. 'recruiting' when opened from board) */
  defaultTabOverride?: SheetTab;
}

export function PlayerSheet({
  visible,
  onClose,
  player,
  offStyle,
  defStyle,
  onOffStyleChange,
  onDefStyleChange,
  fitNote,
  onFitNoteChange,
  coachNote,
  onCoachNoteChange,
  clusterOverride,
  baseKROverride,
  physicals,
  jerseyNumber,
  boardEntry,
  teamNeeds,
  onMoveOnBoard,
  onRemoveFromBoard,
  defaultTabOverride,
}: PlayerSheetProps) {
  const router = useRouter();
  const isRoster = !!jerseyNumber;
  const tabs: SheetTab[] = [
    'bio',
    'fit',
    'kanext',
    'timeline',
    'comms',
  ];
  const defaultTab: SheetTab = defaultTabOverride ?? 'bio';

  const [activeTab, setActiveTab] = useState<SheetTab>(defaultTab);
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());
  const [expandedCareer, setExpandedCareer] = useState<Set<string>>(new Set());
  const [bioExpanded, setBioExpanded] = useState(false);
  const [showAllAwards, setShowAllAwards] = useState(false);
  const [showFitSelector, setShowFitSelector] = useState(false);
  const [showFullBreakdown, setShowFullBreakdown] = useState(false);

  const toggleCluster = (key: string) => {
    setExpandedClusters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleCareer = (year: string) => {
    setExpandedCareer((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  };

  useEffect(() => {
    if (visible && player) {
      setActiveTab(defaultTab);
      setExpandedClusters(new Set());
      setExpandedCareer(new Set());
      setBioExpanded(false);
      setShowAllAwards(false);
      setShowFitSelector(false);
      setShowFullBreakdown(false);
    }
  }, [visible, player]);

  const ratings = useMemo(() => player ? getPlayerRatings(player.id) : null, [player?.id]);
  const clusters = clusterOverride ?? ratings?.clusters ?? null;

  const fitKR = useMemo(() => {
    if (!clusters) return 0;
    return computeFitKR(clusters, offStyle, defStyle);
  }, [clusters, offStyle, defStyle]);

  const fitReasons = useMemo(() => {
    if (!clusters) return [];
    return getFitReasons(clusters, player ? [player.archetype] : [], offStyle, defStyle);
  }, [clusters, player?.archetype, offStyle, defStyle]);

  const offDef = useMemo(() => {
    if (!clusters) return { baseOff: 0, baseDef: 0, fitOff: 0, fitDef: 0 };
    return computeOffDefKR(clusters, offStyle, defStyle);
  }, [clusters, offStyle, defStyle]);

  const seasons = useMemo(() => player ? getPlayerSeasons(player.id) : [], [player?.id]);

  // FMU data (roster players only)
  const bio = jerseyNumber ? FMU_PLAYER_BIOS[jerseyNumber] ?? null : null;
  const about = jerseyNumber ? FMU_PLAYER_ABOUT[jerseyNumber] ?? null : null;
  const awards = useMemo(() => {
    if (jerseyNumber) {
      const raw = getFmuAwards(jerseyNumber);
      return [...raw].sort((a, b) => b.year.localeCompare(a.year));
    }
    // Pool player awards
    const poolAwards = player ? (POOL_PLAYER_AWARDS[player.id] ?? []) : [];
    return poolAwards.map((title) => ({ title, year: '' }));
  }, [jerseyNumber, player?.id]);
  const career = useMemo(() => jerseyNumber ? getFmuCareer(jerseyNumber) : [], [jerseyNumber]);
  const highlights = useMemo(() => jerseyNumber ? getFmuHighlights(jerseyNumber).slice(0, 3) : [], [jerseyNumber]);
  const tsPct = useMemo(() => jerseyNumber ? getFmuTS(jerseyNumber) : 0, [jerseyNumber]);

  // Current season leader stats
  const leaderStats = useMemo(() => {
    if (!jerseyNumber) return null;
    const j = parseInt(jerseyNumber, 10);
    const jStr = isNaN(j) ? jerseyNumber : String(j);
    return FMU_LEADERS.find((l) => {
      const n = parseInt(l.number, 10);
      return (isNaN(n) ? l.number : String(n)) === jStr;
    }) ?? null;
  }, [jerseyNumber]);

  // Current season career entry (for GP/MPG/GS)
  const currentSeason = useMemo(() => career.find((s) => s.current) ?? null, [career]);

  // Player badges
  const playerBadges = useMemo(() => {
    if (!clusters) return [];
    const getSubs = (key: keyof typeof clusters) =>
      jerseyNumber
        ? getPlayerSubclusters(jerseyNumber, key)
        : player ? getPoolPlayerSubclusters(player.id, key, clusters[key]) : [];
    return computePlayerBadges(clusters, getSubs);
  }, [clusters, jerseyNumber, player?.id]);

  // Comms timeline
  const commsEntries = useMemo(() => {
    if (!player) return [];
    return jerseyNumber ? getPlayerComms(jerseyNumber) : getRecruitComms(player.id);
  }, [player?.id, jerseyNumber]);

  // Similar players — same position or archetype, sorted by KR proximity
  const similarPlayers = useMemo(() => {
    if (!player) return [];
    const myKR = baseKROverride ?? ratings?.overall ?? 0;
    return PLAYER_POOL
      .filter((p) => p.id !== player.id)
      .map((p) => {
        const r = getPlayerRatings(p.id);
        const kr = r?.overall ?? 0;
        const posMatch = p.position === player.position;
        const archMatch = p.archetype === player.archetype;
        if (!posMatch && !archMatch) return null;
        return { player: p, kr, posMatch, archMatch, dist: Math.abs(kr - myKR) };
      })
      .filter(Boolean)
      .sort((a, b) => a!.dist - b!.dist)
      .slice(0, 5) as { player: PoolPlayer; kr: number; posMatch: boolean; archMatch: boolean; dist: number }[];
  }, [player?.id, player?.position, player?.archetype, baseKROverride, ratings?.overall]);

  // Team targets — teammates from recruit's school ranked by system fit
  const teamTargets = useMemo(() => {
    if (!player) return [];
    return PLAYER_POOL
      .filter((p) => p.id !== player.id && p.currentSchool === player.currentSchool)
      .map((p) => {
        const r = getPlayerRatings(p.id);
        const clusters = r?.clusters ?? null;
        const baseKr = r?.overall ?? 0;
        const fitKr = clusters ? computeFitKR(clusters, offStyle, defStyle) : baseKr;
        const delta = fitKr - baseKr;
        return { player: p, baseKr, fitKr, delta };
      })
      .sort((a, b) => b.fitKr - a.fitKr)
      .slice(0, 5);
  }, [player?.id, player?.currentSchool, offStyle, defStyle]);

  if (!player) return null;

  const baseKR = baseKROverride ?? ratings?.overall ?? 0;
  const delta = fitKR - baseKR;
  const deltaColor = delta > 0 ? '#4CAF50' : delta < 0 ? '#EF4444' : '#6e6e6e';
  const deltaText = delta > 0 ? `+${delta}` : `${delta}`;

  // Identity line
  const helioPos = TRADITIONAL_TO_HELIO[player.position];
  const posLabel = HELIO_POSITION_LABELS[helioPos] ?? player.position;
  const levelLabel = player.level === 'HS' ? 'Prep' : player.level;
  const archetypeLabel = ARCHETYPE_LABELS[player.archetype] ?? player.archetype;

  // Role block
  const { usage, touches } = getUsageTouches(player.archetype);
  const lineupSlot = getLineupSlot(fitKR);
  const pairings = PAIRING_MAP[player.position] ?? ['two_way_wing', 'spot_up_specialist'];
  const pairingLabels = pairings.map((a) => ARCHETYPE_LABELS[a] ?? a);

  // Header vitals
  const displayHeight = bio?.height ?? physicals?.height;
  const displayWeight = bio ? bio.weight : physicals?.weight ? `${physicals.weight}` : null;
  const classYearShort = bio ? (CLASS_SHORT[bio.classYear] ?? bio.classYear) : null;

  // Drivers / risks for FIT tab
  const drivers = fitReasons.filter((r) => r.delta > 0).slice(0, 3);
  const risks = fitReasons.filter((r) => r.delta < 0).slice(0, 2);
  const allDeltas = [...fitReasons].sort((a, b) => b.delta - a.delta);

  // System labels
  const offStyleLabel = OFFENSIVE_STYLES.find(s => s.value === offStyle)?.label ?? offStyle;
  const defStyleLabel = DEFENSIVE_STYLES.find(s => s.value === defStyle)?.label ?? defStyle;

  return (
    <>
    <BottomSheet useModal visible={visible} onClose={onClose} mode="full">
      {/* §1 Header — Identity */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerName}>
            {bio ? `${bio.firstName} ${bio.lastName}` : `${player.firstName} ${player.lastName}`}
            {jerseyNumber ? ` #${jerseyNumber}` : ''}
          </Text>
          {(displayHeight || displayWeight) && (
            <Text style={styles.headerPhysicals}>
              {displayHeight}{displayWeight ? ` \u00B7 ${displayWeight} lbs` : ''}
            </Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <View style={styles.headerBadges}>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{levelLabel}</Text>
            </View>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{helioPos}</Text>
            </View>
          </View>
          <View style={styles.headerGlyphs}>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} hitSlop={6}>
              <FontAwesome6 name="x-twitter" size={14} color="#888" iconStyle="brand" />
            </Pressable>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} hitSlop={6}>
              <FontAwesome6 name="instagram" size={15} color="#888" iconStyle="brand" />
            </Pressable>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} hitSlop={6}>
              <IconSymbol name="play.circle.fill" size={16} color="#888" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* §2 Rating block */}
      <View style={styles.ratingRow}>
        <View style={styles.krBlock}>
          <Text style={styles.krLabel}>BASE</Text>
          <Text style={styles.krNum}>{baseKR}</Text>
        </View>
        <View style={styles.krBlock}>
          <Text style={styles.krLabel}>FIT</Text>
          <Text style={[styles.krNum, { color: deltaColor }]}>{fitKR}</Text>
        </View>
        <View style={[styles.deltaBadge, { backgroundColor: `${deltaColor}20` }]}>
          <Text style={[styles.deltaText, { color: deltaColor }]}>{deltaText}</Text>
        </View>
      </View>

      {/* §3 Tab pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabRow}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              style={[styles.tabPill, isActive && styles.tabPillActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab);
              }}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {TAB_LABELS[tab]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ═══════════ BIO TAB ═══════════ */}
      {activeTab === 'bio' && (
        <View style={[styles.tabContent, styles.tabContentSpaced]}>
          {/* 1) Quick Facts row */}
          {bio ? (
            <View style={styles.quickFactsRow}>
              <View style={styles.quickFact}>
                <Text style={styles.quickFactLabel}>HS</Text>
                <Text style={styles.quickFactValue} numberOfLines={1}>{bio.highSchool || '\u2014'}</Text>
              </View>
              <View style={styles.quickFact}>
                <Text style={styles.quickFactLabel}>Home</Text>
                <Text style={styles.quickFactValue} numberOfLines={1}>{bio.hometown || '\u2014'}</Text>
              </View>
              <View style={styles.quickFact}>
                <Text style={styles.quickFactLabel}>Class</Text>
                <Text style={styles.quickFactValue}>{classYearShort ?? bio.classYear}</Text>
              </View>
            </View>
          ) : player && (
            <View style={styles.quickFactsRow}>
              <View style={styles.quickFact}>
                <Text style={styles.quickFactLabel}>School</Text>
                <Text style={styles.quickFactValue} numberOfLines={1}>{player.currentSchool}</Text>
              </View>
              <View style={styles.quickFact}>
                <Text style={styles.quickFactLabel}>Level</Text>
                <Text style={styles.quickFactValue} numberOfLines={1}>{player.level}</Text>
              </View>
              <View style={styles.quickFact}>
                <Text style={styles.quickFactLabel}>Class</Text>
                <Text style={styles.quickFactValue}>{player.classYear}</Text>
              </View>
            </View>
          )}

          {/* 2) Current Season card */}
          {leaderStats && leaderStats.gamesPlayed > 0 ? (
            <View style={styles.statCard}>
              <Text style={styles.statCardTitle}>CURRENT SEASON</Text>
              <View style={styles.statRow}>
                {[
                  { v: leaderStats.ppg.toFixed(1), l: 'PPG' },
                  { v: leaderStats.rpg.toFixed(1), l: 'RPG' },
                  { v: leaderStats.apg.toFixed(1), l: 'APG' },
                  { v: `${leaderStats.fgPct.toFixed(1)}%`, l: 'FG%' },
                  { v: `${leaderStats.threePct.toFixed(1)}%`, l: '3P%' },
                  { v: tsPct > 0 ? `${tsPct}%` : '\u2014', l: 'TS%' },
                ].map((s) => (
                  <View key={s.l} style={styles.statItem}>
                    <Text style={styles.statValue}>{s.v}</Text>
                    <Text style={styles.statLabel}>{s.l}</Text>
                  </View>
                ))}
              </View>
              {currentSeason && (
                <Text style={styles.statMeta}>
                  GP {currentSeason.gp}
                  {currentSeason.mpg > 0 ? ` \u00B7 MPG ${currentSeason.mpg}` : ''}
                  {currentSeason.gs > 0 ? ` \u00B7 GS ${currentSeason.gs}` : ''}
                </Text>
              )}
            </View>
          ) : seasons.length > 0 ? (
            <View style={styles.statCard}>
              <Text style={styles.statCardTitle}>CURRENT SEASON</Text>
              <View style={styles.statRow}>
                {[
                  { v: seasons[0].ppg.toFixed(1), l: 'PPG' },
                  { v: seasons[0].rpg.toFixed(1), l: 'RPG' },
                  { v: seasons[0].apg.toFixed(1), l: 'APG' },
                  { v: `${seasons[0].fgPct}%`, l: 'FG%' },
                  { v: `${seasons[0].threePct}%`, l: '3P%' },
                  { v: '\u2014', l: 'TS%' },
                ].map((s) => (
                  <View key={s.l} style={styles.statItem}>
                    <Text style={styles.statValue}>{s.v}</Text>
                    <Text style={styles.statLabel}>{s.l}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.statMeta}>
                {seasons[0].gp} GP {'\u00B7'} {seasons[0].mpg} MPG {'\u00B7'} {seasons[0].school}
              </Text>
            </View>
          ) : player.keyStatLine ? (
            <View style={styles.statCard}>
              <Text style={styles.statCardTitle}>KEY STATS</Text>
              <Text style={styles.keyStatLine}>{player.keyStatLine}</Text>
            </View>
          ) : null}

          {/* 3) Season Highlights */}
          {highlights.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>SEASON HIGHLIGHTS</Text>
              {highlights.map((h, i) => (
                <Text key={i} style={styles.highlightBullet} numberOfLines={1}>
                  {'\u2022'} {h}
                </Text>
              ))}
            </View>
          )}

          {/* 4) Awards */}
          {awards.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>AWARDS</Text>
              {(showAllAwards ? awards : awards.slice(0, 3)).map((a, i) => (
                <View key={i} style={styles.awardRow}>
                  <Text style={styles.awardTitle} numberOfLines={1}>{a.title}</Text>
                  <Text style={styles.awardYear}>{a.year}</Text>
                </View>
              ))}
              {awards.length > 3 && !showAllAwards && (
                <Pressable onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowAllAwards(true);
                }}>
                  <Text style={styles.viewAllLink}>View all awards</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* 5) Recruiting / Identity mini row */}
          <View style={styles.identityRow}>
            <Text style={styles.identityLabel}>Archetype: </Text>
            <Text style={styles.identityValue}>{archetypeLabel}</Text>
            <Text style={styles.identityDivider}> {'\u00B7'} </Text>
            <Text style={styles.identityLabel}>Role: </Text>
            <Text style={styles.identityValue}>{lineupSlot}</Text>
          </View>

          {/* 6) Badges */}
          {playerBadges.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>BADGES</Text>
              <View style={styles.badgeRow}>
                {playerBadges.map((b, i) => (
                  <View key={i} style={[styles.badgePill, { borderColor: BADGE_LEVEL_COLORS[b.level] + '60' }]}>
                    <View style={[styles.badgeDot, { backgroundColor: BADGE_LEVEL_COLORS[b.level] }]} />
                    <Text style={[styles.badgeName, { color: BADGE_LEVEL_COLORS[b.level] }]}>{b.name}</Text>
                    <Text style={[styles.badgeLevel, { color: BADGE_LEVEL_COLORS[b.level] + 'AA' }]}>{b.level}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 7) About → Bio */}
          {about && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>BIO</Text>
              <Text
                style={styles.aboutText}
                numberOfLines={bioExpanded ? undefined : 4}
              >
                {about}
              </Text>
              {!bioExpanded && about.length > 200 && (
                <Pressable onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setBioExpanded(true);
                }}>
                  <Text style={styles.viewAllLink}>Read more</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* 7) Similar Players */}
          {similarPlayers.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>SIMILAR PLAYERS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.simRow}>
                {similarPlayers.map((sp) => {
                  const krColor = sp.kr >= 75 ? '#4CAF50' : sp.kr >= 60 ? '#FF9800' : '#8A8F98';
                  const tag = sp.posMatch && sp.archMatch ? 'Pos + Archetype' : sp.posMatch ? 'Position' : 'Archetype';
                  const spAwards = POOL_PLAYER_AWARDS[sp.player.id] ?? [];
                  return (
                    <View key={sp.player.id} style={styles.simCard}>
                      <View style={styles.simCardTop}>
                        <Text style={styles.simName} numberOfLines={1}>
                          {sp.player.firstName.charAt(0)}. {sp.player.lastName}
                        </Text>
                        <Text style={[styles.simKR, { color: krColor }]}>{sp.kr}</Text>
                      </View>
                      <Text style={styles.simMeta} numberOfLines={1}>
                        {sp.player.position} {'\u00B7'} {sp.player.height} {'\u00B7'} {sp.player.classYear}
                      </Text>
                      <Text style={styles.simSchool} numberOfLines={1}>{sp.player.currentSchool}</Text>
                      {spAwards.length > 0 && (
                        <Text style={styles.simAward} numberOfLines={1}>
                          {'\u2605'} {spAwards[0]}
                        </Text>
                      )}
                      <View style={styles.simTagRow}>
                        <Text style={styles.simTag}>{tag}</Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* 8) Team Targets — teammates ranked by system fit */}
          {teamTargets.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>TEAM TARGETS — {player.currentSchool.toUpperCase()}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.simRow}>
                {teamTargets.map((tt) => {
                  const fitColor = tt.fitKr >= 75 ? '#4CAF50' : tt.fitKr >= 60 ? '#FF9800' : '#8A8F98';
                  const deltaColor2 = tt.delta > 0 ? '#4CAF50' : tt.delta < 0 ? '#EF4444' : '#6e6e6e';
                  const deltaText2 = tt.delta > 0 ? `+${tt.delta}` : `${tt.delta}`;
                  const ttAwards = POOL_PLAYER_AWARDS[tt.player.id] ?? [];
                  return (
                    <View key={tt.player.id} style={styles.simCard}>
                      <View style={styles.simCardTop}>
                        <Text style={styles.simName} numberOfLines={1}>
                          {tt.player.firstName.charAt(0)}. {tt.player.lastName}
                        </Text>
                        <Text style={[styles.simKR, { color: fitColor }]}>{tt.fitKr}</Text>
                      </View>
                      <View style={styles.simCardTop}>
                        <Text style={styles.simMeta}>
                          {tt.player.position} {'\u00B7'} {tt.player.height}
                        </Text>
                        <Text style={[styles.ttDelta, { color: deltaColor2 }]}>{deltaText2} fit</Text>
                      </View>
                      <Text style={styles.simSchool} numberOfLines={1}>{tt.player.keyStatLine}</Text>
                      {ttAwards.length > 0 && (
                        <Text style={styles.simAward} numberOfLines={1}>
                          {'\u2605'} {ttAwards[0]}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {!about && !bio && awards.length === 0 && (
            <Text style={styles.emptyText}>No bio data available.</Text>
          )}
        </View>
      )}

      {/* ═══════════ FIT TAB ═══════════ */}
      {activeTab === 'fit' && (
        <View style={[styles.tabContent, styles.tabContentSpaced]}>
          {/* §1 Delta Card */}
          <View style={styles.deltaCard}>
            {/* Main row: Base → Fit (Δ) */}
            <View style={styles.deltaMainRow}>
              <Text style={styles.deltaBaseNum}>{baseKR}</Text>
              <Text style={styles.deltaArrowText}>{'\u2192'}</Text>
              <Text style={styles.deltaFitNum}>{fitKR}</Text>
              <View style={[styles.deltaBadgeInline, { backgroundColor: `${deltaColor}20` }]}>
                <Text style={[styles.deltaBadgeInlineText, { color: deltaColor }]}>{deltaText}</Text>
              </View>
            </View>

            {/* System context + Change button */}
            <View style={styles.deltaSystemRow}>
              <Text style={styles.deltaSystemText} numberOfLines={1}>
                {offStyleLabel} {'\u00B7'} {defStyleLabel}
              </Text>
              <Pressable
                style={styles.changeFitBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowFitSelector(true);
                }}
              >
                <Text style={styles.changeFitText}>Change</Text>
              </Pressable>
            </View>

            {/* Off / Def split */}
            <View style={styles.deltaOffDefRow}>
              <View style={styles.deltaOffDefItem}>
                <Text style={styles.deltaOffDefLabel}>OFF</Text>
                <Text style={styles.deltaOffDefNums}>
                  {offDef.baseOff} {'\u2192'} {offDef.fitOff}{' '}
                  <Text style={{ color: offDef.fitOff - offDef.baseOff >= 0 ? '#4CAF50' : '#EF4444' }}>
                    ({offDef.fitOff - offDef.baseOff >= 0 ? '+' : ''}{offDef.fitOff - offDef.baseOff})
                  </Text>
                </Text>
              </View>
              <View style={styles.deltaOffDefItem}>
                <Text style={styles.deltaOffDefLabel}>DEF</Text>
                <Text style={styles.deltaOffDefNums}>
                  {offDef.baseDef} {'\u2192'} {offDef.fitDef}{' '}
                  <Text style={{ color: offDef.fitDef - offDef.baseDef >= 0 ? '#4CAF50' : '#EF4444' }}>
                    ({offDef.fitDef - offDef.baseDef >= 0 ? '+' : ''}{offDef.fitDef - offDef.baseDef})
                  </Text>
                </Text>
              </View>
            </View>
          </View>

          {/* §2 Role Card */}
          <View style={styles.roleBox}>
            <Text style={styles.roleValue}>Primary Role: {archetypeLabel}</Text>
            <Text style={styles.roleDetail}>
              Usage: {usage} {'\u00B7'} Touches: {touches}
            </Text>
            <Text style={styles.roleDetail}>Lineup Slot: {lineupSlot}</Text>
            <Text style={styles.roleDetail}>
              <Text style={styles.roleDetailLabel}>Best Pairings: </Text>
              {pairingLabels.join(', ')}
            </Text>
          </View>

          {/* §3 Full Breakdown (waterfall) */}
          {allDeltas.length > 0 ? (
            <View style={styles.breakdownList}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Base KR</Text>
                <Text style={styles.breakdownValue}>{baseKR}</Text>
              </View>
              {allDeltas.map((r, i) => {
                const sign = r.delta >= 0 ? '+' : '';
                const color = r.delta > 0 ? '#4CAF50' : r.delta < 0 ? '#EF4444' : '#6e6e6e';
                return (
                  <View key={i} style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>
                      {r.delta >= 0 ? '+' : '\u2212'} {r.cluster}
                    </Text>
                    <Text style={[styles.breakdownValue, { color }]}>
                      {sign}{r.delta}
                    </Text>
                  </View>
                );
              })}
              <View style={styles.breakdownDivider} />
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownTotal}>= System Fit KR</Text>
                <Text style={styles.breakdownTotal}>{fitKR}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.emptyText}>No cluster data available.</Text>
          )}

          {/* §6 Notes */}
          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>FIT NOTE</Text>
            <TextInput
              style={styles.noteInput}
              value={fitNote}
              onChangeText={onFitNoteChange}
              placeholder="Add fit-specific note for this system\u2026"
              placeholderTextColor="#4A4D55"
              multiline
            />
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>COACH NOTE</Text>
            <TextInput
              style={styles.noteInput}
              value={coachNote}
              onChangeText={onCoachNoteChange}
              placeholder="Add universal coach note\u2026"
              placeholderTextColor="#4A4D55"
              multiline
            />
          </View>

        </View>
      )}

      {/* ═══════════ KaNeXT TAB ═══════════ */}
      {activeTab === 'kanext' && clusters && (
        <View style={styles.tabContent}>
          <Text style={styles.kanextSectionTitle}>KaNeXT</Text>
          {ALL_CLUSTER_KEYS.map((key) => (
            <ClusterBar
              key={key}
              clusterKey={key}
              value={clusters[key]}
              playerId={player.id}
              jerseyNumber={jerseyNumber}
              expanded={expandedClusters.has(key)}
              onToggle={() => toggleCluster(key)}
            />
          ))}

          {/* Coach note */}
          <View style={[styles.noteBox, { marginTop: 16 }]}>
            <Text style={styles.noteLabel}>COACH NOTE</Text>
            <TextInput
              style={styles.noteInput}
              value={coachNote}
              onChangeText={onCoachNoteChange}
              placeholder="Add universal coach note\u2026"
              placeholderTextColor="#4A4D55"
              multiline
            />
          </View>
        </View>
      )}

      {activeTab === 'kanext' && !clusters && (
        <Text style={styles.emptyText}>No cluster data available.</Text>
      )}

      {/* ═══════════ TIMELINE TAB ═══════════ */}
      {/* ═══════════ COMMS TAB ═══════════ */}
      {activeTab === 'comms' && (
        <View style={[styles.tabContent, styles.tabContentSpaced]}>
          {/* Open Messages button */}
          <Pressable
            style={({ pressed }) => [
              styles.openThreadRow,
              { backgroundColor: pressed ? '#222' : '#1a1a1a' },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClose();
              if (isRoster) {
                router.push('/(tabs)/activity' as any);
              } else {
                router.push('/(tabs)/activity' as any);
              }
            }}
          >
            <IconSymbol name="bubble.left.and.bubble.right.fill" size={16} color="#3B82F6" />
            <Text style={styles.openThreadText}>Open Messages</Text>
            <IconSymbol name="chevron.right" size={14} color="#6e6e6e" />
          </Pressable>

          {commsEntries.length > 0 ? (
            commsEntries.map((entry) => {
              const meta = COMMS_TYPE_META[entry.type];
              const relTime = getRelativeTime(entry.timestamp);
              return (
                <Pressable
                  key={entry.id}
                  style={({ pressed }) => [
                    styles.commsRow,
                    pressed && styles.commsRowPressed,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onClose();
                    const route = entry.deepLinkRoute;
                    if (route) {
                      router.push(route as any);
                    }
                  }}
                >
                  <View style={[styles.commsIcon, { backgroundColor: meta.color + '33' }]}>
                    <Text style={[styles.commsIconText, { color: meta.color }]}>{meta.icon}</Text>
                  </View>
                  <View style={styles.commsContent}>
                    <View style={styles.commsTopRow}>
                      <Text style={styles.commsAuthor}>{entry.author}</Text>
                      <Text style={styles.commsTime}> {'\u00B7'} {relTime}</Text>
                    </View>
                    <Text style={styles.commsBody} numberOfLines={3}>{entry.body}</Text>
                    {/* Type-specific badges */}
                    {entry.type === 'touch' && entry.touchMethod && (
                      <View style={styles.commsBadge}>
                        <Text style={styles.commsBadgeText}>{entry.touchMethod}</Text>
                      </View>
                    )}
                    {entry.type === 'status_change' && entry.fromStatus && entry.toStatus && (
                      <View style={[styles.commsBadge, { backgroundColor: '#F9731620' }]}>
                        <Text style={[styles.commsBadgeText, { color: '#F97316' }]}>
                          {entry.fromStatus} {'\u2192'} {entry.toStatus}
                        </Text>
                      </View>
                    )}
                    {entry.type === 'key_date' && entry.dateLabel && (
                      <View style={[styles.commsBadge, { backgroundColor: '#EF444420' }]}>
                        <Text style={[styles.commsBadgeText, { color: '#EF4444' }]}>
                          {entry.dateLabel}{entry.dateValue ? ` \u00B7 ${entry.dateValue.toLocaleDateString()}` : ''}
                        </Text>
                      </View>
                    )}
                    {entry.type === 'film_share' && entry.clipTitle && (
                      <View style={[styles.commsBadge, { backgroundColor: '#22C55E20' }]}>
                        <Text style={[styles.commsBadgeText, { color: '#22C55E' }]}>
                          {entry.clipTitle}
                        </Text>
                      </View>
                    )}
                  </View>
                  {/* Source chip with chevron */}
                  {entry.sourceChip && (
                    <View style={[styles.sourceChip, { backgroundColor: meta.color + '20' }]}>
                      <Text style={[styles.sourceChipText, { color: meta.color }]}>
                        {entry.sourceChip}
                      </Text>
                      <Text style={[styles.sourceChipChevron, { color: meta.color }]}>{'\u2197'}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No communication history yet.</Text>
          )}
        </View>
      )}

      {/* ═══════════ RECRUITING TAB ═══════════ */}
      {activeTab === 'recruiting' && !isRoster && (
        <View style={[styles.tabContent, styles.tabContentSpaced]}>
          {/* §1 Recruiting Snapshot card */}
          <View style={rcStyles.snapshotCard}>
            <View style={rcStyles.snapshotRow}>
              <Text style={rcStyles.snapshotLabel}>RECRUITING SNAPSHOT</Text>
            </View>
            {boardEntry ? (
              <View style={[rcStyles.boardPill, { backgroundColor: (BOARD_COLUMN_COLORS[boardEntry.status] ?? '#2A2D35') + '30' }]}>
                <View style={[rcStyles.boardPillDot, { backgroundColor: BOARD_COLUMN_COLORS[boardEntry.status] ?? '#8A8F98' }]} />
                <Text style={[rcStyles.boardPillText, { color: BOARD_COLUMN_COLORS[boardEntry.status] ?? '#f5f5f5' }]}>
                  {boardEntry.status}
                </Text>
              </View>
            ) : (
              <View style={[rcStyles.boardPill, { backgroundColor: '#2A2D3540' }]}>
                <Text style={[rcStyles.boardPillText, { color: '#6e6e6e' }]}>Not on Board</Text>
              </View>
            )}
            {teamNeeds && (() => {
              const posNeeds = teamNeeds.filter((n) => n.need > 0);
              if (posNeeds.length === 0) return <Text style={rcStyles.needsText}>All positions filled</Text>;
              return (
                <Text style={rcStyles.needsText}>
                  Need: {posNeeds.map((n) => `${n.pos} (${n.need})`).join(' / ')}
                </Text>
              );
            })()}
            {(() => {
              const lastTouch = commsEntries.find((e) => e.type === 'touch');
              if (!lastTouch) return <Text style={rcStyles.lastTouchText}>No contact yet</Text>;
              return (
                <Text style={rcStyles.lastTouchText}>
                  Last Touch: {lastTouch.touchMethod ?? 'Contact'} {'\u00B7'} {getRelativeTime(lastTouch.timestamp)}
                </Text>
              );
            })()}
          </View>

          {/* §2 Actions row */}
          <View style={rcStyles.actionsRow}>
            {[
              { icon: 'doc.text.fill' as const, label: 'Offer', color: '#4CAF50' },
              { icon: 'dollarsign.circle.fill' as const, label: 'NIL', color: '#FF9800' },
              { icon: 'mappin.and.ellipse' as const, label: 'Visit', color: '#3B82F6' },
              { icon: 'note.text' as const, label: 'Log', color: '#A855F7' },
            ].map((action) => (
              <Pressable
                key={action.label}
                style={rcStyles.actionBtn}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <View style={[rcStyles.actionIconWrap, { backgroundColor: action.color + '20' }]}>
                  <IconSymbol name={action.icon} size={18} color={action.color} />
                </View>
                <Text style={rcStyles.actionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* §3 Recruiting Log */}
          <View style={rcStyles.logSection}>
            <Text style={rcStyles.logTitle}>RECRUITING LOG</Text>
            {(() => {
              const recruitingEntries = commsEntries.filter((e) =>
                e.type === 'touch' || e.type === 'status_change' || e.type === 'key_date' || e.type === 'note'
              );
              if (recruitingEntries.length === 0) {
                return <Text style={styles.emptyText}>No recruiting activity yet.</Text>;
              }
              return recruitingEntries.map((entry) => {
                const meta = COMMS_TYPE_META[entry.type];
                const tag = entry.type === 'touch' ? (entry.touchMethod ?? 'Contact')
                  : entry.type === 'status_change' ? 'Status'
                  : entry.type === 'key_date' ? (entry.dateLabel ?? 'Date')
                  : 'Note';
                const tagColor = meta.color;
                return (
                  <View key={entry.id} style={rcStyles.logRow}>
                    <View style={[rcStyles.logIcon, { backgroundColor: meta.color + '25' }]}>
                      <Text style={[rcStyles.logIconText, { color: meta.color }]}>{meta.icon}</Text>
                    </View>
                    <View style={rcStyles.logContent}>
                      <Text style={rcStyles.logBody} numberOfLines={2}>{entry.body}</Text>
                      <Text style={rcStyles.logTime}>{getRelativeTime(entry.timestamp)}</Text>
                    </View>
                    <View style={[rcStyles.logTag, { backgroundColor: tagColor + '20' }]}>
                      <Text style={[rcStyles.logTagText, { color: tagColor }]}>{tag}</Text>
                    </View>
                  </View>
                );
              });
            })()}
          </View>

          {/* §4 Board Controls */}
          {boardEntry && (
            <View style={rcStyles.boardControls}>
              <Text style={rcStyles.boardControlsTitle}>BOARD CONTROLS</Text>
              <View style={rcStyles.boardMoveRow}>
                {BOARD_COLUMNS.filter((col) => col !== boardEntry.status).map((col) => (
                  <Pressable
                    key={col}
                    style={[rcStyles.movePill, { borderColor: BOARD_COLUMN_COLORS[col] + '60' }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      onMoveOnBoard?.(boardEntry.id, col);
                    }}
                  >
                    <View style={[rcStyles.movePillDot, { backgroundColor: BOARD_COLUMN_COLORS[col] }]} />
                    <Text style={rcStyles.movePillText}>{col}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable
                style={rcStyles.removeBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onRemoveFromBoard?.(boardEntry.id);
                  onClose();
                }}
              >
                <Text style={rcStyles.removeBtnText}>Remove from Board</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {activeTab === 'timeline' && (
        <View style={styles.tabContent}>
          {career.length > 0 ? (
            career.map((s) => {
              const isExpanded = expandedCareer.has(s.year);
              const krColor = (s.kr ?? 0) >= 75 ? '#4CAF50' : (s.kr ?? 0) >= 60 ? '#FF9800' : '#8A8F98';
              return (
                <View key={s.year}>
                  <Pressable
                    style={styles.careerRow}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      toggleCareer(s.year);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.careerYear}>
                        {s.year} {'\u00B7'} {s.school} {'\u00B7'} {s.division}
                      </Text>
                      <Text style={styles.careerMeta}>
                        {s.gp} GP {'\u00B7'} {s.mpg} MPG
                        {s.current ? '  (Current)' : ''}
                      </Text>
                    </View>
                    {s.kr != null && (
                      <View style={[styles.careerKRBadge, { backgroundColor: krColor + '20' }]}>
                        <Text style={[styles.careerKRText, { color: krColor }]}>{s.kr}</Text>
                      </View>
                    )}
                    <Text style={styles.careerChevron}>{isExpanded ? '\u25BE' : '\u203A'}</Text>
                  </Pressable>

                  {isExpanded && (
                    <View style={styles.careerExpanded}>
                      <View style={styles.careerStatsGrid}>
                        {[
                          { v: s.ppg.toFixed(1), l: 'PPG' },
                          { v: s.rpg.toFixed(1), l: 'RPG' },
                          { v: s.apg.toFixed(1), l: 'APG' },
                          { v: `${s.fgPct}%`, l: 'FG%' },
                          ...(s.threePct > 0 ? [{ v: `${s.threePct}%`, l: '3P%' }] : []),
                          { v: `${s.ftPct}%`, l: 'FT%' },
                        ].map((stat) => (
                          <View key={stat.l} style={styles.careerStatItem}>
                            <Text style={styles.careerStatValue}>{stat.v}</Text>
                            <Text style={styles.careerStatLabel}>{stat.l}</Text>
                          </View>
                        ))}
                      </View>
                      {clusters && (
                        <View style={styles.careerClusters}>
                          <Text style={styles.careerClusterTitle}>KaNeXT</Text>
                          {ALL_CLUSTER_KEYS.map((key) => {
                            const val = clusters[key];
                            const color = val >= 70 ? '#4CAF50' : val >= 55 ? '#FF9800' : '#EF4444';
                            return (
                              <View key={key} style={styles.careerClusterRow}>
                                <Text style={styles.careerClusterLabel}>
                                  {CLUSTER_LABELS[key as ClusterType]?.label ?? key}
                                </Text>
                                <View style={styles.careerClusterBarTrack}>
                                  <View style={[barStyles.barFill, { width: `${Math.min(val, 100)}%`, backgroundColor: color }]} />
                                </View>
                                <Text style={[styles.careerClusterValue, { color }]}>{val}</Text>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          ) : seasons.length > 0 ? (
            seasons.map((s) => {
              const isExpanded = expandedCareer.has(s.season);
              const sKrColor = (s.kr ?? 0) >= 75 ? '#4CAF50' : (s.kr ?? 0) >= 60 ? '#FF9800' : '#8A8F98';
              return (
                <View key={s.season}>
                  <Pressable
                    style={styles.careerRow}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      toggleCareer(s.season);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.careerYear}>
                        {s.season} {'\u00B7'} {s.school} {'\u00B7'} {s.level}
                      </Text>
                      <Text style={styles.careerMeta}>
                        {s.gp} GP {'\u00B7'} {s.mpg} MPG
                      </Text>
                    </View>
                    {s.kr != null && (
                      <View style={[styles.careerKRBadge, { backgroundColor: sKrColor + '20' }]}>
                        <Text style={[styles.careerKRText, { color: sKrColor }]}>{s.kr}</Text>
                      </View>
                    )}
                    <Text style={styles.careerChevron}>{isExpanded ? '\u25BE' : '\u203A'}</Text>
                  </Pressable>

                  {isExpanded && (
                    <View style={styles.careerExpanded}>
                      <View style={styles.careerStatsGrid}>
                        {[
                          { v: s.ppg.toFixed(1), l: 'PPG' },
                          { v: s.rpg.toFixed(1), l: 'RPG' },
                          { v: s.apg.toFixed(1), l: 'APG' },
                          { v: s.spg.toFixed(1), l: 'SPG' },
                          { v: s.bpg.toFixed(1), l: 'BPG' },
                          { v: `${s.fgPct}%`, l: 'FG%' },
                          ...(s.threePct > 0 ? [{ v: `${s.threePct}%`, l: '3P%' }] : []),
                          { v: `${s.ftPct}%`, l: 'FT%' },
                        ].map((stat) => (
                          <View key={stat.l} style={styles.careerStatItem}>
                            <Text style={styles.careerStatValue}>{stat.v}</Text>
                            <Text style={styles.careerStatLabel}>{stat.l}</Text>
                          </View>
                        ))}
                      </View>
                      {clusters && (
                        <View style={styles.careerClusters}>
                          <Text style={styles.careerClusterTitle}>KaNeXT</Text>
                          {ALL_CLUSTER_KEYS.map((key) => {
                            const val = clusters[key];
                            const color = val >= 70 ? '#4CAF50' : val >= 55 ? '#FF9800' : '#EF4444';
                            return (
                              <View key={key} style={styles.careerClusterRow}>
                                <Text style={styles.careerClusterLabel}>
                                  {CLUSTER_LABELS[key as ClusterType]?.label ?? key}
                                </Text>
                                <View style={styles.careerClusterBarTrack}>
                                  <View style={[barStyles.barFill, { width: `${Math.min(val, 100)}%`, backgroundColor: color }]} />
                                </View>
                                <Text style={[styles.careerClusterValue, { color }]}>{val}</Text>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No career data available.</Text>
          )}
        </View>
      )}
    </BottomSheet>

      {/* Fit Selector Bottom Sheet */}
      <BottomSheet
        useModal
        visible={showFitSelector}
        onClose={() => setShowFitSelector(false)}
        title="Change System Fit"
      >
        <View style={styles.fitSelectorSection}>
          <Text style={styles.fitSelectorTitle}>OFFENSIVE SYSTEM</Text>
          <View style={styles.fitSelectorGrid}>
            {OFFENSIVE_STYLES.map((s) => {
              const active = s.value === offStyle;
              return (
                <Pressable
                  key={s.value}
                  style={[styles.systemPill, active && styles.systemPillActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onOffStyleChange(s.value);
                    setShowFitSelector(false);
                  }}
                >
                  <Text style={[styles.systemPillText, active && styles.systemPillTextActive]}>
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={styles.fitSelectorSection}>
          <Text style={styles.fitSelectorTitle}>DEFENSIVE SYSTEM</Text>
          <View style={styles.fitSelectorGrid}>
            {DEFENSIVE_STYLES.map((s) => {
              const active = s.value === defStyle;
              return (
                <Pressable
                  key={s.value}
                  style={[styles.systemPill, active && styles.systemPillActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onDefStyleChange(s.value);
                    setShowFitSelector(false);
                  }}
                >
                  <Text style={[styles.systemPillText, active && styles.systemPillTextActive]}>
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </BottomSheet>
    </>
  );
}

// ── Relative time helper ──

function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  headerName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f5f5f5',
  },
  headerPhysicals: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ccc',
    marginTop: 2,
  },
  headerLine2: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f5f5f5',
    marginTop: 3,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginTop: 2,
  },
  headerGlyphs: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  headerBadge: {
    backgroundColor: '#2A2D35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f5f5f5',
    letterSpacing: 0.3,
  },

  // Rating row
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 6,
  },
  krBlock: {
    alignItems: 'center',
  },
  krLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6e6e6e',
    letterSpacing: 0.5,
  },
  krNum: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f5f5f5',
  },
  deltaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  deltaText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Tabs
  tabScroll: {
    marginTop: 12,
    paddingBottom: Spacing.sm,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: Spacing.lg,
  },
  tabPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#2a2a2a',
  },
  tabPillActive: {
    backgroundColor: '#f5f5f5',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6e6e6e',
  },
  tabTextActive: {
    color: '#111',
  },

  // Shared tab content wrapper
  tabContent: {
    paddingBottom: 40,
  },
  tabContentSpaced: {
    marginTop: 12,
  },

  // ── Bio tab ──

  // Quick Facts row
  quickFactsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  quickFact: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: BorderRadius.md,
    padding: 8,
  },
  quickFactLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6e6e6e',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  quickFactValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f5f5f5',
  },

  // Current Season stat card
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: BorderRadius.lg,
    padding: 12,
    marginBottom: 14,
  },
  statCardTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6e6e6e',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f5f5f5',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: GRAY,
    marginTop: 2,
  },
  statMeta: {
    fontSize: 12,
    color: GRAY,
    textAlign: 'center',
  },
  keyStatLine: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f5f5f5',
    textAlign: 'center',
    paddingVertical: 4,
  },

  // Section blocks
  sectionBlock: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6e6e6e',
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  // Highlights
  highlightBullet: {
    fontSize: 13,
    color: '#ccc',
    lineHeight: 20,
  },

  // Awards
  awardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2A2D35',
  },
  awardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f5f5f5',
    flex: 1,
    marginRight: 8,
  },
  awardYear: {
    fontSize: 12,
    color: GRAY,
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6e6e6e',
    marginTop: 6,
  },

  // Identity mini row
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  identityLabel: {
    fontSize: 12,
    color: GRAY,
  },
  identityValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  identityDivider: {
    fontSize: 12,
    color: GRAY,
  },

  // Badges
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E2028',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeLevel: {
    fontSize: 9,
    fontWeight: '600',
  },

  // About
  aboutText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },

  // Similar Players
  simRow: {
    marginBottom: 4,
  },
  simCard: {
    backgroundColor: '#1E2028',
    borderRadius: 10,
    padding: 10,
    marginRight: 8,
    width: 130,
  },
  simCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  simName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f5f5f5',
    flex: 1,
    marginRight: 6,
  },
  simKR: {
    fontSize: 14,
    fontWeight: '800',
  },
  simMeta: {
    fontSize: 10,
    color: GRAY,
    marginBottom: 2,
  },
  simSchool: {
    fontSize: 10,
    color: '#999',
    marginBottom: 3,
  },
  simAward: {
    fontSize: 9,
    color: '#FFFFFF',
    marginBottom: 3,
  },
  ttDelta: {
    fontSize: 10,
    fontWeight: '700',
  },
  simTagRow: {
    flexDirection: 'row',
  },
  simTag: {
    fontSize: 9,
    fontWeight: '600',
    color: '#888',
    backgroundColor: '#2A2D35',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },

  // Socials / Links
  socialsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  socialPill: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  socialText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ccc',
  },

  emptyText: {
    fontSize: 13,
    color: '#6e6e6e',
    paddingTop: 8,
  },

  // ── FIT tab ──

  // Delta card
  deltaCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: BorderRadius.lg,
    padding: 14,
    marginBottom: 14,
  },
  deltaMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  deltaBaseNum: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f5f5f5',
  },
  deltaArrowText: {
    fontSize: 20,
    color: '#6e6e6e',
  },
  deltaFitNum: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f5f5f5',
  },
  deltaBadgeInline: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 4,
  },
  deltaBadgeInlineText: {
    fontSize: 16,
    fontWeight: '700',
  },
  deltaSystemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  deltaSystemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    flex: 1,
    marginRight: 8,
  },
  deltaOffDefRow: {
    flexDirection: 'row',
    gap: 16,
  },
  deltaOffDefItem: {
    flex: 1,
  },
  deltaOffDefLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6e6e6e',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  deltaOffDefNums: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ccc',
  },

  // Breakdown waterfall
  breakdownToggle: {
    paddingVertical: 8,
  },
  breakdownToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6e6e6e',
  },
  breakdownList: {
    backgroundColor: '#1a1a1a',
    borderRadius: BorderRadius.md,
    padding: 12,
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#ccc',
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f5f5f5',
  },
  breakdownDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#3a3a3a',
    marginVertical: 6,
  },
  breakdownTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f5f5f5',
  },
  changeFitBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
  },
  changeFitText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f5f5f5',
  },

  // Fit selector bottom sheet
  fitSelectorSection: {
    marginBottom: 16,
  },
  fitSelectorTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6e6e6e',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  fitSelectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  systemPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
  },
  systemPillActive: {
    backgroundColor: '#f5f5f5',
  },
  systemPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6e6e6e',
  },
  systemPillTextActive: {
    color: '#111',
  },

  // Fit boost/gap blocks
  fitBlock: {
    marginBottom: 20,
  },
  fitBlockLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6e6e6e',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fitReasonLine: {
    fontSize: 13,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 2,
  },

  // Role block (compressed)
  roleBox: {
    marginTop: 10,
    padding: Spacing.sm,
    backgroundColor: '#1a1a1a',
    borderRadius: BorderRadius.md,
    gap: 2,
  },
  roleValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f5f5f5',
  },
  roleDetail: {
    fontSize: 12,
    color: '#ccc',
    lineHeight: 16,
  },
  roleDetailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },

  // Notes
  noteBox: {
    marginTop: 12,
    padding: Spacing.sm,
    backgroundColor: '#1a1a1a',
    borderRadius: BorderRadius.md,
  },
  noteLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6e6e6e',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  noteInput: {
    fontSize: 13,
    color: '#f5f5f5',
    minHeight: 36,
    lineHeight: 18,
    padding: 0,
  },

  // Season stats (recruiting)
  seasonCard: {
    backgroundColor: '#0F1115',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  seasonLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: GRAY,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  seasonStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  seasonValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  seasonSublabel: {
    fontSize: 10,
    fontWeight: '600',
    color: GRAY,
    marginTop: 2,
  },
  seasonMeta: {
    fontSize: 12,
    color: GRAY,
    textAlign: 'center',
  },

  // ── KaNeXT tab ──
  kanextSectionTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6e6e6e',
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  // ── Timeline tab ──
  careerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2A2D35',
  },
  careerYear: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  careerMeta: {
    fontSize: 11,
    color: GRAY,
    marginTop: 2,
  },
  careerKRBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  careerKRText: {
    fontSize: 14,
    fontWeight: '700',
  },
  careerChevron: {
    fontSize: 14,
    color: '#6e6e6e',
    width: 20,
    textAlign: 'center',
    marginLeft: 4,
  },
  careerExpanded: {
    backgroundColor: '#1a1a1a',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: 8,
  },
  careerStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  careerStatItem: {
    alignItems: 'center',
    minWidth: 44,
  },
  careerStatValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f5f5f5',
  },
  careerStatLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: GRAY,
    marginTop: 1,
  },
  careerClusters: {
    marginTop: 4,
  },
  careerClusterTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6e6e6e',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  careerClusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  careerClusterLabel: {
    fontSize: 10,
    color: '#999',
    width: 68,
  },
  careerClusterBarTrack: {
    flex: 1,
    height: 5,
    backgroundColor: '#222',
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 6,
  },
  careerClusterValue: {
    fontSize: 11,
    fontWeight: '600',
    width: 24,
    textAlign: 'right',
  },

  // ── Comms tab ──
  openThreadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    marginBottom: 8,
  },
  openThreadText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  commsRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2A2D35',
    gap: 10,
  },
  commsRowPressed: {
    backgroundColor: '#1a1a1a',
  },
  commsIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  commsIconText: {
    fontSize: 13,
    fontWeight: '700',
  },
  commsContent: {
    flex: 1,
  },
  commsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  commsAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  commsTime: {
    fontSize: 12,
    color: '#6e6e6e',
  },
  commsBody: {
    fontSize: 13,
    color: '#ccc',
    lineHeight: 18,
  },
  commsBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  commsBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ccc',
  },
  sourceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 2,
  },
  sourceChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  sourceChipChevron: {
    fontSize: 10,
    fontWeight: '700',
  },
});

// ── Recruiting tab styles ──
const rcStyles = StyleSheet.create({
  snapshotCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: BorderRadius.lg,
    padding: 14,
    marginBottom: 14,
    gap: 8,
  },
  snapshotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  snapshotLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6e6e6e',
    letterSpacing: 0.5,
  },
  boardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  boardPillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  boardPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  needsText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
  lastTouchText: {
    fontSize: 12,
    color: GRAY,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 18,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 6,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  logSection: {
    marginBottom: 18,
  },
  logTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6e6e6e',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2A2D35',
    gap: 10,
  },
  logIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logIconText: {
    fontSize: 13,
    fontWeight: '700',
  },
  logContent: {
    flex: 1,
  },
  logBody: {
    fontSize: 13,
    fontWeight: '500',
    color: '#f5f5f5',
    lineHeight: 18,
  },
  logTime: {
    fontSize: 11,
    color: '#6e6e6e',
    marginTop: 1,
  },
  logTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  logTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  boardControls: {
    marginBottom: 20,
  },
  boardControlsTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6e6e6e',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  boardMoveRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  movePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#1a1a1a',
  },
  movePillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  movePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  removeBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#EF444415',
  },
  removeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
});
