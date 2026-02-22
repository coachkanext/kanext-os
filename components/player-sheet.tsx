/**
 * Universal Player Sheet V2 — 9 canonical tabs + RBAC gating
 *
 * "One sheet, many lenses" — tabs hide/show based on the active sports role lens.
 * Same export name (PlayerSheet) and backwards-compatible props.
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
import * as Haptics from 'expo-haptics';

import { Spacing, BorderRadius, Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';

import { type ClusterRatings, getPlayerSubclusters, ROSTER_META, PLAYER_CLUSTERS, computeOffKR, computeDefKR } from '@/data/roster-data';
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
  KaNeXT_PLAYER_BIOS, KaNeXT_PLAYER_ABOUT, KaNeXT_LEADERS,
  getFmuCareer, getFmuAwards, getFmuHighlights, getFmuTS, getFmuSeasonGames,
} from '@/data/fmu';
import { getPlayerComms, getRecruitComms, COMMS_TYPE_META, type CommsEntry } from '@/data/mock-comms';
import type { BoardEntry, BoardStatus } from '@/data/recruitingBoard';
import { computePlayerBadges, BADGE_LEVEL_COLORS } from '@/utils/player-badges';
import {
  BOARD_COLUMNS, BOARD_COLUMN_COLORS, TEMPERATURE_COLORS,
  RISK_LEVEL_COLORS, LOG_TYPE_META, type Temperature, type RiskLevel,
} from '@/data/recruitingBoard';
import type { PositionNeed } from '@/data/team-needs';
import { getPlayerDevelopment } from '@/data/mock-player-development';
import { getPlayerHealth } from '@/data/mock-player-health';
import { getPlayerAdmin } from '@/data/mock-player-admin';
import {
  getSportsRole, getPlayerSheetTabs, getKRVisibility, formatKR,
  canSeeSensitive, canSeeCoachActions, canSeeAdminActions, type PlayerTab,
} from '@/utils/sports-rbac';

// =============================================================================
// CONSTANTS
// =============================================================================

const ALL_CLUSTER_KEYS: (keyof ClusterRatings)[] = [
  'shooting', 'finishing', 'playmaking',
  'perimeter_defense', 'interior_defense', 'rebounding', 'frame',
];

const HIGH_USAGE_ARCHETYPES = new Set<Archetype>([
  'pick_and_roll_operator', 'primary_ball_handler', 'dho_handoff_hub',
  'secondary_creator_wing', 'connector_guard_wing',
]);
const MED_USAGE_ARCHETYPES = new Set<Archetype>([
  'two_way_wing', 'three_and_d_wing', 'slasher_rim_pressure_wing',
  'switchable_defender_wing', 'off_ball_shooter',
]);

function getUsageTouches(archetype: Archetype) {
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

const PAIRING_MAP: Record<string, Archetype[]> = {
  PG: ['spot_up_specialist', 'vertical_spacer'],
  SG: ['pick_and_roll_operator', 'two_way_wing'],
  SF: ['primary_ball_handler', 'stretch_big'],
  PF: ['connector_guard_wing', 'three_and_d_wing'],
  C: ['pick_and_roll_operator', 'three_and_d_wing'],
};

const CLASS_SHORT: Record<string, string> = {
  Freshman: 'Fr', Sophomore: 'So', Junior: 'Jr', Senior: 'Sr',
  'Grad Student': 'Gr', 'R-Freshman': 'R-Fr', 'R-Sophomore': 'R-So',
  'R-Junior': 'R-Jr', 'R-Senior': 'R-Sr',
};

const BADGE_DESCRIPTIONS: Record<string, string> = {
  'Catch-and-Shoot': 'Elite perimeter shooting in catch-and-shoot situations',
  'Movement Shooter': 'Deadly off screens and in motion',
  'Deep Range': 'Extends the floor beyond the arc with deep range',
  'Pull-Up Shot Maker': 'Creates own shot off the dribble',
  'Rim Finisher': 'Dominant finishing at the rim',
  'Contact Finisher': 'Finishes through contact with power',
  'Rim Pressure': 'Constant pressure at the basket',
  'FT Generator': 'Gets to the line at an elite rate',
  'Cutter': 'Elite off-ball movement and cutting ability',
  'Primary Playmaker': 'Orchestrates the offense with elite vision',
  'Drive-and-Kick': 'Attacks and creates open looks for teammates',
  'Ball Security': 'Protects the ball with elite handles',
  'Transition Playmaker': 'Pushes the pace and creates in transition',
  'Point-of-Attack': 'Locks down the primary ball-handler',
  'Ball Pressure': 'Relentless on-ball pressure forces turnovers',
  'Lockdown Perimeter': 'Elite perimeter defender',
  'Rim Protector': 'Anchors the defense with elite shot-blocking',
  'Paint Anchor': 'Commands the paint with physical post defense',
  'Help Defender': 'Elite help-side instincts and positioning',
  'Passing Lane Disruptor': 'Active hands create deflections and steals',
  'Defensive Rebounder': 'Controls the glass on the defensive end',
  'Physical Rebounder': 'Crashes the boards with relentless effort',
};

const PIPELINE_STAGES: string[] = [
  'Watchlist', 'Evaluating', 'Contacted', 'Priority',
  'Visit Planned', 'Visited', 'Offer Out', 'Committed', 'Signed',
];

function getStatusColor(status: string): string {
  switch (status) {
    case 'available': return '#22C55E';
    case 'questionable': case 'day_to_day': return '#F59E0B';
    case 'injured': case 'out': case 'doubtful': return '#EF4444';
    case 'redshirt': return '#6AA9FF';
    default: return '#8F8F8F';
  }
}

function getEligibilityColor(s: string): string {
  switch (s) { case 'clear': return '#22C55E'; case 'pending': return '#F59E0B'; case 'hold': case 'expired': return '#EF4444'; default: return '#8F8F8F'; }
}

function getGoalIcon(s: string): string {
  switch (s) { case 'complete': return '✓'; case 'in_progress': return '◉'; default: return '○'; }
}
function getGoalColor(s: string): string {
  switch (s) { case 'complete': return '#22C55E'; case 'in_progress': return '#F59E0B'; default: return '#8F8F8F'; }
}

// =============================================================================
// CLUSTER BAR
// =============================================================================

function ClusterBar({ clusterKey, value, playerId, jerseyNumber, expanded, onToggle }: {
  clusterKey: keyof ClusterRatings; value: number; playerId: string;
  jerseyNumber?: string; expanded: boolean; onToggle: () => void;
}) {
  const label = CLUSTER_LABELS[clusterKey as ClusterType]?.label ?? clusterKey;
  const barColor = value >= 70 ? '#4CAF50' : value >= 55 ? '#FF9800' : '#EF4444';
  const pct = Math.min(value, 100);
  const subclusters = expanded
    ? jerseyNumber ? getPlayerSubclusters(jerseyNumber, clusterKey) : getPoolPlayerSubclusters(playerId, clusterKey, value)
    : [];
  return (
    <View>
      <Pressable style={barStyles.row} onPress={onToggle}>
        <View style={barStyles.labelCol}><Text style={barStyles.label}>{label}</Text></View>
        <View style={barStyles.barTrack}><View style={[barStyles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} /></View>
        <Text style={[barStyles.value, { color: barColor }]}>{value}</Text>
        <Text style={barStyles.chevron}>{expanded ? '\u25BE' : '\u203A'}</Text>
      </Pressable>
      {expanded && subclusters.map((sc) => {
        const scColor = sc.rating >= 70 ? '#4CAF50' : sc.rating >= 55 ? '#FF9800' : '#EF4444';
        return (
          <View key={sc.name} style={barStyles.subRow}>
            <Text style={barStyles.subLabel}>{sc.name}</Text>
            <View style={barStyles.subBarTrack}><View style={[barStyles.barFill, { width: `${Math.min(sc.rating, 100)}%`, backgroundColor: scColor }]} /></View>
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

// =============================================================================
// PROPS
// =============================================================================

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
  clusterOverride?: ClusterRatings;
  baseKROverride?: number;
  physicals?: { height: string; weight: number };
  jerseyNumber?: string;
  boardEntry?: BoardEntry | null;
  teamNeeds?: PositionNeed[];
  onMoveOnBoard?: (entryId: string, status: BoardStatus) => void;
  onRemoveFromBoard?: (entryId: string) => void;
  defaultTabOverride?: PlayerTab;
  membershipId?: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PlayerSheet({
  visible, onClose, player, offStyle, defStyle,
  onOffStyleChange, onDefStyleChange, fitNote, onFitNoteChange,
  coachNote, onCoachNoteChange, clusterOverride, baseKROverride,
  physicals, jerseyNumber, boardEntry, teamNeeds,
  onMoveOnBoard, onRemoveFromBoard, defaultTabOverride, membershipId,
}: PlayerSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { state } = useAppContext();
  const isRoster = !!jerseyNumber;

  // RBAC
  const effectiveMembership = membershipId ?? state.activeContext.membership_id;
  const role = useMemo(() => getSportsRole(effectiveMembership), [effectiveMembership]);
  const krVisibility = useMemo(() => getKRVisibility(role), [role]);
  const sensitive = useMemo(() => canSeeSensitive(role), [role]);
  const coachActions = useMemo(() => canSeeCoachActions(role), [role]);
  const adminActions = useMemo(() => canSeeAdminActions(role), [role]);
  const tabs = useMemo(() => getPlayerSheetTabs(role), [role]);
  const defaultTab: PlayerTab = defaultTabOverride ?? (tabs[0]?.key ?? 'overview');

  const [activeTab, setActiveTab] = useState<PlayerTab>(defaultTab);
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());
  const [showAllAwards, setShowAllAwards] = useState(false);

  const toggleCluster = (key: string) => {
    setExpandedClusters((prev) => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n; });
  };

  useEffect(() => {
    if (visible && player) {
      setActiveTab(defaultTab);
      setExpandedClusters(new Set());
      setShowAllAwards(false);
    }
  }, [visible, player]);

  // Player data
  const ratings = useMemo(() => player ? getPlayerRatings(player.id) : null, [player?.id]);
  const clusters = clusterOverride ?? ratings?.clusters ?? null;
  const fitKR = useMemo(() => clusters ? computeFitKR(clusters, offStyle, defStyle) : 0, [clusters, offStyle, defStyle]);
  const fitReasons = useMemo(() => clusters ? getFitReasons(clusters, player ? [player.archetype] : [], offStyle, defStyle) : [], [clusters, player?.archetype, offStyle, defStyle]);
  const offDef = useMemo(() => clusters ? computeOffDefKR(clusters, offStyle, defStyle) : { baseOff: 0, baseDef: 0, fitOff: 0, fitDef: 0 }, [clusters, offStyle, defStyle]);
  const seasons = useMemo(() => player ? getPlayerSeasons(player.id) : [], [player?.id]);

  // KaNeXT data
  const bio = jerseyNumber ? KaNeXT_PLAYER_BIOS[jerseyNumber] ?? null : null;
  const about = jerseyNumber ? KaNeXT_PLAYER_ABOUT[jerseyNumber] ?? null : null;
  const awards = useMemo(() => {
    if (jerseyNumber) return [...getFmuAwards(jerseyNumber)].sort((a, b) => b.year.localeCompare(a.year));
    return (player ? (POOL_PLAYER_AWARDS[player.id] ?? []) : []).map((title) => ({ title, year: '' }));
  }, [jerseyNumber, player?.id]);
  const career = useMemo(() => jerseyNumber ? getFmuCareer(jerseyNumber) : [], [jerseyNumber]);
  const highlights = useMemo(() => jerseyNumber ? getFmuHighlights(jerseyNumber).slice(0, 5) : [], [jerseyNumber]);
  const tsPct = useMemo(() => jerseyNumber ? getFmuTS(jerseyNumber) : 0, [jerseyNumber]);
  const seasonGames = useMemo(() => jerseyNumber ? getFmuSeasonGames(jerseyNumber) : [], [jerseyNumber]);

  const leaderStats = useMemo(() => {
    if (!jerseyNumber) return null;
    const jStr = String(parseInt(jerseyNumber, 10));
    return KaNeXT_LEADERS.find((l) => String(parseInt(l.number, 10)) === jStr) ?? null;
  }, [jerseyNumber]);

  // Badges
  const playerBadges = useMemo(() => {
    if (!clusters) return [];
    const getSubs = (key: keyof typeof clusters) =>
      jerseyNumber ? getPlayerSubclusters(jerseyNumber, key) : player ? getPoolPlayerSubclusters(player.id, key, clusters[key]) : [];
    return computePlayerBadges(clusters, getSubs);
  }, [clusters, jerseyNumber, player?.id]);

  // Comms
  const commsEntries = useMemo(() => {
    if (!player) return [];
    return jerseyNumber ? getPlayerComms(jerseyNumber) : getRecruitComms(player.id);
  }, [player?.id, jerseyNumber]);

  // Development, Health, Admin
  const devPlan = useMemo(() => jerseyNumber ? getPlayerDevelopment(jerseyNumber) : null, [jerseyNumber]);
  const health = useMemo(() => jerseyNumber ? getPlayerHealth(jerseyNumber) : null, [jerseyNumber]);
  const admin = useMemo(() => jerseyNumber ? getPlayerAdmin(jerseyNumber) : null, [jerseyNumber]);
  const rosterMeta = jerseyNumber ? ROSTER_META[jerseyNumber] ?? null : null;

  if (!player) return null;

  const baseKR = baseKROverride ?? ratings?.overall ?? 0;
  const delta = fitKR - baseKR;
  const deltaColor = delta > 0 ? '#4CAF50' : delta < 0 ? '#EF4444' : '#6e6e6e';
  const deltaText = delta > 0 ? `+${delta}` : `${delta}`;
  const helioPos = TRADITIONAL_TO_HELIO[player.position];
  const posLabel = HELIO_POSITION_LABELS[helioPos] ?? player.position;
  const levelLabel = player.level === 'HS' ? 'Prep' : player.level;
  const archetypeLabel = ARCHETYPE_LABELS[player.archetype] ?? player.archetype;
  const { usage } = getUsageTouches(player.archetype);
  const lineupSlot = getLineupSlot(fitKR);
  const pairings = PAIRING_MAP[player.position] ?? ['two_way_wing', 'spot_up_specialist'];
  const pairingLabels = pairings.map((a) => ARCHETYPE_LABELS[a] ?? a);
  const displayHeight = bio?.height ?? physicals?.height ?? player.height;
  const displayWeight = bio ? bio.weight : physicals?.weight ? `${physicals.weight}` : player.weight ? `${player.weight}` : null;
  const classYearShort = bio ? (CLASS_SHORT[bio.classYear] ?? bio.classYear) : null;
  const drivers = fitReasons.filter((r) => r.delta > 0).slice(0, 3);
  const risks = fitReasons.filter((r) => r.delta < 0).slice(0, 2);
  const headerBadges = playerBadges.slice(0, 3);
  const overflowBadgeCount = Math.max(0, playerBadges.length - 3);
  const offStyleLabel = OFFENSIVE_STYLES.find(s => s.value === offStyle)?.label ?? offStyle;
  const defStyleLabel = DEFENSIVE_STYLES.find(s => s.value === defStyle)?.label ?? defStyle;
  const playerStatus = rosterMeta?.status ?? 'available';

  return (
    <BottomSheet useModal visible={visible} onClose={onClose}>
      {/* ═══════════ HEADER ═══════════ */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={[s.headerName, { color: colors.text }]}>
              {bio ? `${bio.firstName} ${bio.lastName}` : `${player.firstName} ${player.lastName}`}
              {jerseyNumber ? ` #${jerseyNumber}` : ''}
            </Text>
            {(displayHeight || displayWeight) && (
              <Text style={[s.headerPhysicals, { color: colors.textSecondary }]}>
                {displayHeight}{displayWeight ? ` · ${displayWeight} lbs` : ''}
              </Text>
            )}
          </View>
          <View style={s.headerBadges}>
            <View style={[s.headerBadge, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[s.headerBadgeText, { color: colors.textSecondary }]}>{levelLabel}</Text>
            </View>
            <View style={[s.headerBadge, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[s.headerBadgeText, { color: colors.textSecondary }]}>{helioPos}</Text>
            </View>
          </View>
        </View>

        {isRoster && playerStatus !== 'available' && (
          <View style={[s.statusPill, { backgroundColor: `${getStatusColor(playerStatus)}20` }]}>
            <Text style={[s.statusText, { color: getStatusColor(playerStatus) }]}>{playerStatus.replace(/_/g, ' ').toUpperCase()}</Text>
          </View>
        )}

        {krVisibility !== 'hidden' && (
          <View style={s.krStrip}>
            <View style={s.krBlock}><Text style={[s.krLabel, { color: colors.textTertiary }]}>BASE</Text><Text style={[s.krNum, { color: colors.text }]}>{formatKR(baseKR, krVisibility)}</Text></View>
            <View style={s.krBlock}><Text style={[s.krLabel, { color: colors.textTertiary }]}>FIT</Text><Text style={[s.krNum, { color: deltaColor }]}>{formatKR(fitKR, krVisibility)}</Text></View>
            {krVisibility === 'full' && <View style={[s.deltaBadge, { backgroundColor: `${deltaColor}20` }]}><Text style={[s.deltaText, { color: deltaColor }]}>{deltaText}</Text></View>}
            <View style={s.krBlock}><Text style={[s.krLabel, { color: colors.textTertiary }]}>OFF</Text><Text style={[s.krNum, { color: colors.text }]}>{formatKR(offDef.fitOff, krVisibility)}</Text></View>
            <View style={s.krBlock}><Text style={[s.krLabel, { color: colors.textTertiary }]}>DEF</Text><Text style={[s.krNum, { color: colors.text }]}>{formatKR(offDef.fitDef, krVisibility)}</Text></View>
          </View>
        )}

        {headerBadges.length > 0 && (
          <View style={s.badgeStrip}>
            {headerBadges.map((b, i) => (
              <View key={i} style={[s.badgeStripPill, { borderLeftColor: BADGE_LEVEL_COLORS[b.level] }]}>
                <Text style={s.badgeStripName}>{b.name}</Text>
              </View>
            ))}
            {overflowBadgeCount > 0 && (
              <Pressable style={s.badgeStripOverflow} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab('kanext_eval'); }}>
                <Text style={s.badgeStripOverflowText}>+{overflowBadgeCount}</Text>
              </Pressable>
            )}
          </View>
        )}

        <View style={s.quickActions}>
          {[{ icon: 'message.fill' }, { icon: 'note.text' }, { icon: 'link' }, { icon: 'square.and.arrow.up' }].map((a, i) => (
            <Pressable key={i} style={[s.actionBtn, { backgroundColor: colors.backgroundSecondary }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <IconSymbol name={a.icon as any} size={14} color={colors.textSecondary} />
            </Pressable>
          ))}
          {coachActions && <Pressable style={[s.actionBtn, { backgroundColor: colors.backgroundSecondary }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}><IconSymbol name="person.2.fill" size={14} color={colors.textSecondary} /></Pressable>}
          {adminActions && <Pressable style={[s.actionBtn, { backgroundColor: colors.backgroundSecondary }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}><IconSymbol name="doc.text.fill" size={14} color={colors.textSecondary} /></Pressable>}
        </View>
      </View>

      {/* TAB PILLS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabScroll} contentContainerStyle={s.tabRow}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable key={tab.key} style={[s.tabPill, { borderColor: colors.border }, isActive && { backgroundColor: colors.text, borderColor: colors.text }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tab.key); }}>
              <Text style={[s.tabText, { color: colors.textSecondary }, isActive && { color: colors.background }]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ═══════════ 1. OVERVIEW ═══════════ */}
      {activeTab === 'overview' && (
        <View style={s.tabContent}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
            {[helioPos, classYearShort ?? player.classYear, displayHeight, displayWeight ? `${displayWeight} lbs` : null, bio?.hometown ?? player.state].filter(Boolean).map((t, i) => (
              <View key={i} style={[s.chip, { backgroundColor: colors.backgroundSecondary }]}><Text style={[s.chipText, { color: colors.textSecondary }]}>{t}</Text></View>
            ))}
          </ScrollView>
          <Text style={[s.sectionLabel, { color: colors.textTertiary }]}>ROLE SNAPSHOT</Text>
          <View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Archetype</Text><Text style={[s.statValue, { color: colors.text }]}>{archetypeLabel}</Text></View>
            <View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Lineup Slot</Text><Text style={[s.statValue, { color: colors.text }]}>{lineupSlot}</Text></View>
            <View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Usage</Text><Text style={[s.statValue, { color: colors.text }]}>{usage}</Text></View>
            {isRoster && leaderStats && (<>
              <View style={[s.divider, { backgroundColor: colors.divider }]} />
              <View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>PPG</Text><Text style={[s.statValue, { color: colors.text }]}>{leaderStats.ppg.toFixed(1)}</Text></View>
              <View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>RPG</Text><Text style={[s.statValue, { color: colors.text }]}>{leaderStats.rpg.toFixed(1)}</Text></View>
              <View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>APG</Text><Text style={[s.statValue, { color: colors.text }]}>{leaderStats.apg.toFixed(1)}</Text></View>
            </>)}
          </View>
          {about && (<><Text style={[s.sectionLabel, { color: colors.textTertiary }]}>ABOUT</Text><View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}><Text style={[s.aboutText, { color: colors.textSecondary }]}>{about}</Text></View></>)}
          {awards.length > 0 && (<><Text style={[s.sectionLabel, { color: colors.textTertiary }]}>AWARDS</Text><View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>{(showAllAwards ? awards : awards.slice(0, 3)).map((a, i) => (<Text key={i} style={[s.awardItem, { color: colors.text }]}>{a.year ? `${a.year} — ` : ''}{a.title}</Text>))}{awards.length > 3 && !showAllAwards && (<Pressable onPress={() => setShowAllAwards(true)}><Text style={[s.showMore, { color: colors.textTertiary }]}>Show all ({awards.length})</Text></Pressable>)}</View></>)}
          <View style={s.socialRow}>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} hitSlop={6}><FontAwesome6 name="x-twitter" size={14} color="#888" iconStyle="brand" /></Pressable>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} hitSlop={6}><FontAwesome6 name="instagram" size={15} color="#888" iconStyle="brand" /></Pressable>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} hitSlop={6}><IconSymbol name="play.circle.fill" size={16} color="#888" /></Pressable>
          </View>
        </View>
      )}

      {/* ═══════════ 2. PERFORMANCE ═══════════ */}
      {activeTab === 'performance' && (
        <View style={s.tabContent}>
          {leaderStats && (<><Text style={[s.sectionLabel, { color: colors.textTertiary }]}>SEASON SUMMARY</Text><View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}><View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>PPG</Text><Text style={[s.statValue, { color: colors.text }]}>{leaderStats.ppg.toFixed(1)}</Text></View><View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>RPG</Text><Text style={[s.statValue, { color: colors.text }]}>{leaderStats.rpg.toFixed(1)}</Text></View><View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>APG</Text><Text style={[s.statValue, { color: colors.text }]}>{leaderStats.apg.toFixed(1)}</Text></View><View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>GP</Text><Text style={[s.statValue, { color: colors.text }]}>{leaderStats.gamesPlayed}</Text></View></View></>)}
          {tsPct > 0 && (<><Text style={[s.sectionLabel, { color: colors.textTertiary }]}>EFFICIENCY</Text><View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}><View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>TS%</Text><Text style={[s.statValue, { color: colors.text }]}>{tsPct.toFixed(1)}%</Text></View></View></>)}
          {seasonGames.length > 0 && (<><Text style={[s.sectionLabel, { color: colors.textTertiary }]}>GAME LOG (LAST 5)</Text><View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}><View style={s.gameLogHeader}><Text style={[s.gameLogCol, { color: colors.textTertiary, flex: 1 }]}>OPP</Text><Text style={[s.gameLogCol, { color: colors.textTertiary }]}>PTS</Text><Text style={[s.gameLogCol, { color: colors.textTertiary }]}>REB</Text><Text style={[s.gameLogCol, { color: colors.textTertiary }]}>AST</Text></View>{seasonGames.slice(0, 5).map((g, i) => (<View key={i} style={[s.gameLogRow, { borderTopColor: colors.divider }]}><Text style={[s.gameLogCol, { color: colors.text, flex: 1 }]} numberOfLines={1}>{g.opponent}</Text><Text style={[s.gameLogCol, { color: colors.text, fontWeight: '600' }]}>{g.pts}</Text><Text style={[s.gameLogCol, { color: colors.textSecondary }]}>{g.reb}</Text><Text style={[s.gameLogCol, { color: colors.textSecondary }]}>{g.ast}</Text></View>))}</View></>)}
          {career.length > 0 && (<><Text style={[s.sectionLabel, { color: colors.textTertiary }]}>CAREER</Text><View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>{career.map((c, i) => (<View key={i} style={[s.careerRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}><Text style={[s.careerYear, { color: colors.text }]}>{c.year} — {c.school}</Text><View style={s.careerStats}><Text style={[s.careerStat, { color: colors.textSecondary }]}>{c.ppg.toFixed(1)} PPG</Text><Text style={[s.careerStat, { color: colors.textSecondary }]}>{c.rpg.toFixed(1)} RPG</Text><Text style={[s.careerStat, { color: colors.textSecondary }]}>{c.apg.toFixed(1)} APG</Text></View></View>))}</View></>)}
        </View>
      )}

      {/* ═══════════ 3. FILM ═══════════ */}
      {activeTab === 'film' && (
        <View style={s.tabContent}>
          <Text style={[s.sectionLabel, { color: colors.textTertiary }]}>FILM SOURCES</Text>
          <View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>
            {highlights.length > 0 ? highlights.map((h, i) => (
              <Pressable key={i} style={[s.filmRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}>
                <IconSymbol name="play.circle.fill" size={18} color={colors.textSecondary} />
                <Text style={[s.filmText, { color: colors.text }]}>{h}</Text>
              </Pressable>
            )) : <Text style={[s.emptyText, { color: colors.textSecondary }]}>No film available.</Text>}
          </View>
        </View>
      )}

      {/* ═══════════ 4. KANEXT EVAL ═══════════ */}
      {activeTab === 'kanext_eval' && clusters && (
        <View style={s.tabContent}>
          {krVisibility !== 'hidden' && (<><Text style={[s.sectionLabel, { color: colors.textTertiary }]}>KR PANEL</Text><View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}><View style={s.krPanelRow}><View style={s.krPanelBlock}><Text style={[s.krPanelLabel, { color: colors.textTertiary }]}>Overall</Text><Text style={[s.krPanelValue, { color: colors.text }]}>{formatKR(baseKR, krVisibility)}</Text></View><View style={s.krPanelBlock}><Text style={[s.krPanelLabel, { color: colors.textTertiary }]}>Off KR</Text><Text style={[s.krPanelValue, { color: colors.text }]}>{formatKR(offDef.baseOff, krVisibility)}</Text></View><View style={s.krPanelBlock}><Text style={[s.krPanelLabel, { color: colors.textTertiary }]}>Def KR</Text><Text style={[s.krPanelValue, { color: colors.text }]}>{formatKR(offDef.baseDef, krVisibility)}</Text></View></View></View></>)}
          <Text style={[s.sectionLabel, { color: colors.textTertiary }]}>CLUSTER RATINGS</Text>
          <View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>{ALL_CLUSTER_KEYS.map((key) => (<ClusterBar key={key} clusterKey={key} value={clusters[key]} playerId={player.id} jerseyNumber={jerseyNumber} expanded={expandedClusters.has(key)} onToggle={() => toggleCluster(key)} />))}</View>
          {playerBadges.length > 0 && (<><Text style={[s.sectionLabel, { color: colors.textTertiary }]}>CALLING CARDS</Text><View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>{playerBadges.map((b, i) => (<View key={i} style={[s.badgeRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}><View style={[s.badgeDot, { backgroundColor: BADGE_LEVEL_COLORS[b.level] }]} /><View style={{ flex: 1 }}><Text style={[s.badgeName, { color: colors.text }]}>{b.name}</Text><Text style={[s.badgeDesc, { color: colors.textTertiary }]}>{BADGE_DESCRIPTIONS[b.name] ?? b.component}</Text></View><Text style={[s.badgeLevel, { color: BADGE_LEVEL_COLORS[b.level] }]}>{b.level}</Text></View>))}</View></>)}
        </View>
      )}

      {/* ═══════════ 5. FIT + ROLE ═══════════ */}
      {activeTab === 'fit_role' && (
        <View style={s.tabContent}>
          <Text style={[s.sectionLabel, { color: colors.textTertiary }]}>SYSTEM FIT</Text>
          <View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Offense</Text><Text style={[s.statValue, { color: colors.text }]}>{offStyleLabel}</Text></View>
            <View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Defense</Text><Text style={[s.statValue, { color: colors.text }]}>{defStyleLabel}</Text></View>
            {krVisibility !== 'hidden' && (<><View style={[s.divider, { backgroundColor: colors.divider }]} /><View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Base KR</Text><Text style={[s.statValue, { color: colors.text }]}>{formatKR(baseKR, krVisibility)}</Text></View><View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Fit KR</Text><Text style={[s.statValue, { color: deltaColor }]}>{formatKR(fitKR, krVisibility)}</Text></View><View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Delta</Text><Text style={[s.statValue, { color: deltaColor }]}>{deltaText}</Text></View></>)}
          </View>
          {drivers.length > 0 && (<><Text style={[s.sectionLabel, { color: colors.textTertiary }]}>FIT DRIVERS</Text><View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>{drivers.map((d, i) => (<View key={i} style={s.driverRow}><Text style={{ color: '#4CAF50', fontSize: 12 }}>▲</Text><Text style={[s.driverText, { color: colors.text }]}>{d.reason}</Text><Text style={{ color: '#4CAF50', fontSize: 13, fontWeight: '700' }}>+{d.delta}</Text></View>))}</View></>)}
          {risks.length > 0 && (<><Text style={[s.sectionLabel, { color: colors.textTertiary }]}>FIT RISKS</Text><View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>{risks.map((r, i) => (<View key={i} style={s.driverRow}><Text style={{ color: '#EF4444', fontSize: 12 }}>▼</Text><Text style={[s.driverText, { color: colors.text }]}>{r.reason}</Text><Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '700' }}>{r.delta}</Text></View>))}</View></>)}
          <Text style={[s.sectionLabel, { color: colors.textTertiary }]}>USAGE + ROLE</Text>
          <View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Archetype</Text><Text style={[s.statValue, { color: colors.text }]}>{archetypeLabel}</Text></View>
            <View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Usage Type</Text><Text style={[s.statValue, { color: colors.text }]}>{usage}</Text></View>
            <View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Lineup Slot</Text><Text style={[s.statValue, { color: colors.text }]}>{lineupSlot}</Text></View>
            <View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Best Pairs</Text><Text style={[s.statValue, { color: colors.text }]} numberOfLines={1}>{pairingLabels.join(', ')}</Text></View>
          </View>
          {coachActions && (<><Text style={[s.sectionLabel, { color: colors.textTertiary }]}>FIT NOTE</Text><TextInput style={[s.noteInput, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]} value={fitNote} onChangeText={onFitNoteChange} placeholder="Add fit notes..." placeholderTextColor={colors.textTertiary} multiline /></>)}
        </View>
      )}

      {/* ═══════════ 6. DEVELOPMENT ═══════════ */}
      {activeTab === 'development' && devPlan && (
        <View style={s.tabContent}>
          {[{ label: '2-WEEK GOALS', goals: devPlan.twoWeekGoals }, { label: '6-WEEK GOALS', goals: devPlan.sixWeekGoals }, { label: '12-WEEK GOALS', goals: devPlan.twelveWeekGoals }].map(({ label, goals }) => (
            <React.Fragment key={label}>
              <Text style={[s.sectionLabel, { color: colors.textTertiary }]}>{label}</Text>
              <View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>
                {goals.map((g, i) => (<View key={i} style={[s.goalRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}><Text style={[s.goalIcon, { color: getGoalColor(g.status) }]}>{getGoalIcon(g.status)}</Text><Text style={[s.goalText, { color: colors.text }]}>{g.label}</Text></View>))}
              </View>
            </React.Fragment>
          ))}
          <Text style={[s.sectionLabel, { color: colors.textTertiary }]}>PRIORITIES</Text>
          <View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>{devPlan.priorities.map((p, i) => (<View key={i} style={[s.priorityRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}><Text style={[s.priorityCluster, { color: colors.text }]}>{p.cluster}</Text><Text style={[s.priorityDesc, { color: colors.textSecondary }]}>{p.description}</Text><Text style={s.priorityDelta}>+{p.targetDelta} target</Text></View>))}</View>
          {devPlan.checkIns.length > 0 && (<><Text style={[s.sectionLabel, { color: colors.textTertiary }]}>CHECK-INS</Text><View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>{devPlan.checkIns.map((c, i) => (<View key={i} style={[s.checkinRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}><Text style={[s.checkinDate, { color: colors.textTertiary }]}>{c.date}</Text><Text style={[s.checkinNote, { color: colors.text }]}>{c.note}</Text><Text style={[s.checkinAuthor, { color: colors.textTertiary }]}>— {c.author}</Text></View>))}</View></>)}
        </View>
      )}

      {/* ═══════════ 7. HEALTH ═══════════ */}
      {activeTab === 'health' && health && sensitive && (
        <View style={s.tabContent}>
          <Text style={[s.sectionLabel, { color: colors.textTertiary }]}>STATUS</Text>
          <View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={[s.healthPill, { backgroundColor: `${getStatusColor(health.status)}20` }]}><Text style={[s.healthPillText, { color: getStatusColor(health.status) }]}>{health.status.replace(/_/g, ' ').toUpperCase()}</Text></View>
            <Text style={[s.healthNote, { color: colors.textSecondary }]}>{health.statusNote}</Text>
          </View>
          {health.timeline.length > 0 && (<><Text style={[s.sectionLabel, { color: colors.textTertiary }]}>TIMELINE</Text><View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>{health.timeline.map((t, i) => (<View key={i} style={[s.timelineRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}><Text style={[s.timelineDate, { color: colors.textTertiary }]}>{t.date}</Text><Text style={[s.timelineEvent, { color: colors.text }]}>{t.event}</Text></View>))}</View></>)}
          {health.restrictions.length > 0 && (<><Text style={[s.sectionLabel, { color: colors.textTertiary }]}>RESTRICTIONS</Text><View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>{health.restrictions.map((r, i) => (<Text key={i} style={{ fontSize: 13, color: '#EF4444', marginBottom: 4 }}>• {r}</Text>))}</View></>)}
          {health.returnCheckpoints.length > 0 && (<><Text style={[s.sectionLabel, { color: colors.textTertiary }]}>RETURN-TO-PLAY</Text><View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>{health.returnCheckpoints.map((cp, i) => (<View key={i} style={[s.checkpointRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}><Text style={{ fontSize: 14, width: 18, textAlign: 'center', color: cp.completed ? '#22C55E' : colors.textTertiary }}>{cp.completed ? '✓' : '○'}</Text><Text style={[{ fontSize: 13, flex: 1 }, { color: colors.text }]}>{cp.label}</Text>{cp.date && <Text style={{ fontSize: 11, color: colors.textTertiary }}>{cp.date}</Text>}</View>))}</View></>)}
          <Text style={[s.sectionLabel, { color: colors.textTertiary }]}>7-DAY PRACTICE</Text>
          <View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={s.practiceRow}>
              {health.practiceAvailability.map((d, i) => {
                const pColor = d.status === 'full' ? '#22C55E' : d.status === 'limited' ? '#F59E0B' : d.status === 'rest' ? '#6AA9FF' : '#EF4444';
                return (<View key={i} style={s.practiceDay}><Text style={[s.practiceDayLabel, { color: colors.textTertiary }]}>{d.day}</Text><View style={[s.practiceDot, { backgroundColor: pColor }]} /><Text style={[s.practiceDayStatus, { color: pColor }]}>{d.status}</Text></View>);
              })}
            </View>
          </View>
        </View>
      )}

      {/* ═══════════ 8. ADMIN ═══════════ */}
      {activeTab === 'admin' && admin && sensitive && (
        <View style={s.tabContent}>
          <Text style={[s.sectionLabel, { color: colors.textTertiary }]}>ELIGIBILITY</Text>
          <View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>{admin.eligibility.map((e, i) => (<View key={i} style={[s.eligRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}><View style={[s.eligDot, { backgroundColor: getEligibilityColor(e.status) }]} /><View style={{ flex: 1 }}><Text style={[{ fontSize: 13, fontWeight: '500' }, { color: colors.text }]}>{e.label}</Text>{e.note && <Text style={{ fontSize: 12, marginTop: 1, color: colors.textTertiary }}>{e.note}</Text>}</View><Text style={[{ fontSize: 11, fontWeight: '600', textTransform: 'capitalize' }, { color: getEligibilityColor(e.status) }]}>{e.status}</Text></View>))}</View>
          <Text style={[s.sectionLabel, { color: colors.textTertiary }]}>SCHOLARSHIP / AID</Text>
          <View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}><View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Type</Text><Text style={[s.statValue, { color: colors.text }]}>{admin.aid.type}</Text></View><View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Percentage</Text><Text style={[s.statValue, { color: colors.text }]}>{admin.aid.percent}%</Text></View>{admin.aid.renewalDate && <View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Renewal</Text><Text style={[s.statValue, { color: colors.text }]}>{admin.aid.renewalDate}</Text></View>}</View>
          <Text style={[s.sectionLabel, { color: colors.textTertiary }]}>NIL</Text>
          <View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}><View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Status</Text><Text style={[s.statValue, { color: colors.text }]}>{admin.nil.status}</Text></View><View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Deals</Text><Text style={[s.statValue, { color: colors.text }]}>{admin.nil.dealCount}</Text></View><View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Value Band</Text><Text style={[s.statValue, { color: colors.text }]}>{admin.nil.valueBand}</Text></View>{admin.nil.topDeal && <View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Top Deal</Text><Text style={[s.statValue, { color: colors.text }]}>{admin.nil.topDeal}</Text></View>}</View>
          <Text style={[s.sectionLabel, { color: colors.textTertiary }]}>ACADEMICS</Text>
          <View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}><View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>GPA</Text><Text style={[s.statValue, { color: colors.text }]}>{admin.gpa.toFixed(1)}</Text></View></View>
          {admin.complianceHolds.length > 0 && (<><Text style={[s.sectionLabel, { color: colors.textTertiary }]}>COMPLIANCE HOLDS</Text><View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>{admin.complianceHolds.map((h, i) => (<View key={h.id} style={[s.holdRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}><View style={[s.holdDot, { backgroundColor: h.severity === 'high' ? '#EF4444' : h.severity === 'medium' ? '#F59E0B' : '#22C55E' }]} /><View style={{ flex: 1 }}><Text style={[{ fontSize: 13 }, { color: colors.text }]}>{h.label}</Text><Text style={{ fontSize: 11, marginTop: 1, color: colors.textTertiary }}>{h.date}</Text></View><Text style={{ fontSize: 11, fontWeight: '600', color: h.resolved ? '#22C55E' : '#EF4444' }}>{h.resolved ? 'Resolved' : 'Active'}</Text></View>))}</View></>)}
        </View>
      )}

      {/* ═══════════ 9. RECRUITING ═══════════ */}
      {activeTab === 'recruiting' && (
        <View style={s.tabContent}>
          {boardEntry ? (<>
            <Text style={[s.sectionLabel, { color: colors.textTertiary }]}>PIPELINE</Text>
            <View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pipelineRow}>
                {PIPELINE_STAGES.map((stage, i) => {
                  const isActive = boardEntry.status === stage;
                  const isPast = PIPELINE_STAGES.indexOf(boardEntry.status) > i;
                  const color = isActive ? (BOARD_COLUMN_COLORS as any)[stage] ?? '#FFF' : isPast ? '#4CAF50' : '#333';
                  return (<View key={stage} style={s.pipelineStage}><View style={[s.pipelineDot, { backgroundColor: color }]} /><Text style={[s.pipelineLabel, { color: isActive ? '#FFF' : '#666' }]}>{stage}</Text></View>);
                })}
              </ScrollView>
            </View>
            <Text style={[s.sectionLabel, { color: colors.textTertiary }]}>BOARD INFO</Text>
            <View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Status</Text><Text style={[s.statValue, { color: colors.text }]}>{boardEntry.status}</Text></View>
              <View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Priority</Text><Text style={[s.statValue, { color: colors.text }]}>{boardEntry.priority}</Text></View>
              <View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Recruiter</Text><Text style={[s.statValue, { color: colors.text }]}>{boardEntry.recruiter}</Text></View>
              {boardEntry.temperature && <View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Temperature</Text><Text style={[s.statValue, { color: TEMPERATURE_COLORS[boardEntry.temperature as Temperature] ?? colors.text }]}>{boardEntry.temperature}</Text></View>}
              {boardEntry.nextStep && <View style={s.statRow}><Text style={[s.statLabel, { color: colors.textSecondary }]}>Next Step</Text><Text style={[s.statValue, { color: colors.text }]}>{boardEntry.nextStep}</Text></View>}
            </View>
            {boardEntry.shortNotes ? <><Text style={[s.sectionLabel, { color: colors.textTertiary }]}>NOTES</Text><View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}><Text style={[s.aboutText, { color: colors.textSecondary }]}>{boardEntry.shortNotes}</Text></View></> : null}
            {commsEntries.length > 0 && (<><Text style={[s.sectionLabel, { color: colors.textTertiary }]}>COMMS TIMELINE</Text><View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>{commsEntries.slice(0, 5).map((c, i) => { const meta = COMMS_TYPE_META[c.type]; return (<View key={i} style={[s.commsRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}><View style={[s.commsDot, { backgroundColor: meta?.color ?? '#8F8F8F' }]} /><View style={{ flex: 1 }}><Text style={[s.commsMethod, { color: colors.text }]}>{c.type.replace(/_/g, ' ')}</Text><Text style={[s.commsNote, { color: colors.textSecondary }]} numberOfLines={2}>{c.body}</Text></View><Text style={[s.commsDate, { color: colors.textTertiary }]}>{c.timestamp.toLocaleDateString()}</Text></View>); })}</View></>)}
            {adminActions && onMoveOnBoard && (<><Text style={[s.sectionLabel, { color: colors.textTertiary }]}>BOARD ACTIONS</Text><View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.boardActionRow}>{BOARD_COLUMNS.filter((st) => st !== boardEntry.status).slice(0, 4).map((st) => (<Pressable key={st} style={[s.boardActionPill, { borderColor: (BOARD_COLUMN_COLORS as any)[st] ?? colors.border }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onMoveOnBoard(boardEntry.id, st); }}><Text style={[s.boardActionText, { color: (BOARD_COLUMN_COLORS as any)[st] ?? colors.text }]}>{st}</Text></Pressable>))}</ScrollView>{onRemoveFromBoard && (<Pressable style={s.removeBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); onRemoveFromBoard(boardEntry.id); }}><Text style={s.removeBtnText}>Remove from Board</Text></Pressable>)}</View></>)}
          </>) : (<View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}><Text style={[s.emptyText, { color: colors.textSecondary }]}>Not on recruiting board.</Text></View>)}
          {coachActions && (<><Text style={[s.sectionLabel, { color: colors.textTertiary }]}>COACH NOTE</Text><TextInput style={[s.noteInput, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]} value={coachNote} onChangeText={onCoachNoteChange} placeholder="Add recruiting notes..." placeholderTextColor={colors.textTertiary} multiline /></>)}
        </View>
      )}
    </BottomSheet>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  header: { paddingBottom: 4 },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerName: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  headerPhysicals: { fontSize: 13, marginTop: 2 },
  headerBadges: { flexDirection: 'row', gap: 6 },
  headerBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  headerBadgeText: { fontSize: 11, fontWeight: '600' },
  statusPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full, marginTop: 6 },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  krStrip: { flexDirection: 'row', gap: 14, marginTop: 10, alignItems: 'center' },
  krBlock: { alignItems: 'center' },
  krLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginBottom: 2 },
  krNum: { fontSize: 18, fontWeight: '700' },
  deltaBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  deltaText: { fontSize: 13, fontWeight: '700' },
  badgeStrip: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  badgeStripPill: { borderLeftWidth: 3, paddingLeft: 8, paddingVertical: 3, backgroundColor: '#1a1a1a', borderRadius: 6, paddingRight: 10 },
  badgeStripName: { fontSize: 11, fontWeight: '600', color: '#e0e0e0' },
  badgeStripOverflow: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#222', borderRadius: 6 },
  badgeStripOverflowText: { fontSize: 11, fontWeight: '600', color: '#888' },
  quickActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  tabScroll: { marginTop: 10, marginBottom: 10 },
  tabRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  tabPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: 1 },
  tabText: { fontSize: 12, fontWeight: '600' },
  tabContent: { gap: 4 },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginTop: 12, marginBottom: 4 },
  card: { borderRadius: BorderRadius.lg, padding: 14 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  statLabel: { fontSize: 13 },
  statValue: { fontSize: 13, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 8 },
  chipRow: { flexDirection: 'row', gap: 6, paddingVertical: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  chipText: { fontSize: 11, fontWeight: '600' },
  aboutText: { fontSize: 13, lineHeight: 19 },
  awardItem: { fontSize: 13, marginBottom: 4 },
  showMore: { fontSize: 12, marginTop: 4 },
  socialRow: { flexDirection: 'row', gap: 16, marginTop: 12, paddingVertical: 4 },
  emptyText: { fontSize: 13, textAlign: 'center', paddingVertical: 16 },
  gameLogHeader: { flexDirection: 'row', paddingBottom: 4 },
  gameLogCol: { width: 36, fontSize: 10, fontWeight: '600', letterSpacing: 0.3, textAlign: 'center' },
  gameLogRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, borderTopWidth: StyleSheet.hairlineWidth },
  careerRow: { paddingVertical: 8 },
  careerYear: { fontSize: 13, fontWeight: '600' },
  careerStats: { flexDirection: 'row', gap: 12, marginTop: 4 },
  careerStat: { fontSize: 12 },
  filmRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  filmText: { fontSize: 13, flex: 1 },
  krPanelRow: { flexDirection: 'row', justifyContent: 'space-around' },
  krPanelBlock: { alignItems: 'center' },
  krPanelLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginBottom: 2 },
  krPanelValue: { fontSize: 22, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  badgeDot: { width: 8, height: 8, borderRadius: 4 },
  badgeName: { fontSize: 13, fontWeight: '600' },
  badgeDesc: { fontSize: 12, marginTop: 1 },
  badgeLevel: { fontSize: 11, fontWeight: '700' },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  driverText: { fontSize: 13, flex: 1 },
  noteInput: { borderWidth: 1, borderRadius: BorderRadius.lg, padding: 12, fontSize: 13, minHeight: 60, textAlignVertical: 'top' },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7 },
  goalIcon: { fontSize: 14, width: 18, textAlign: 'center' },
  goalText: { fontSize: 13, flex: 1 },
  priorityRow: { paddingVertical: 8 },
  priorityCluster: { fontSize: 13, fontWeight: '600' },
  priorityDesc: { fontSize: 12, marginTop: 2 },
  priorityDelta: { fontSize: 12, fontWeight: '600', marginTop: 2, color: '#4CAF50' },
  checkinRow: { paddingVertical: 8 },
  checkinDate: { fontSize: 11, marginBottom: 2 },
  checkinNote: { fontSize: 13, lineHeight: 19 },
  checkinAuthor: { fontSize: 11, marginTop: 2 },
  healthPill: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: BorderRadius.full, marginBottom: 8 },
  healthPillText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  healthNote: { fontSize: 13 },
  timelineRow: { paddingVertical: 7 },
  timelineDate: { fontSize: 11, marginBottom: 1 },
  timelineEvent: { fontSize: 13 },
  checkpointRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  practiceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  practiceDay: { alignItems: 'center', gap: 4 },
  practiceDayLabel: { fontSize: 10, fontWeight: '600' },
  practiceDot: { width: 10, height: 10, borderRadius: 5 },
  practiceDayStatus: { fontSize: 9, fontWeight: '600' },
  eligRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7 },
  eligDot: { width: 8, height: 8, borderRadius: 4 },
  holdRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7 },
  holdDot: { width: 8, height: 8, borderRadius: 4 },
  pipelineRow: { flexDirection: 'row', gap: 12, paddingVertical: 8 },
  pipelineStage: { alignItems: 'center', gap: 4 },
  pipelineDot: { width: 12, height: 12, borderRadius: 6 },
  pipelineLabel: { fontSize: 9, fontWeight: '600' },
  commsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 8 },
  commsDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  commsMethod: { fontSize: 13, fontWeight: '600' },
  commsNote: { fontSize: 12, marginTop: 1 },
  commsDate: { fontSize: 11 },
  boardActionRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  boardActionPill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, borderWidth: 1, backgroundColor: '#1a1a1a' },
  boardActionText: { fontSize: 12, fontWeight: '600' },
  removeBtn: { alignItems: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: '#EF444415' },
  removeBtnText: { fontSize: 13, fontWeight: '600', color: '#EF4444' },
});
