/**
 * Depth Chart Units View (V1)
 * System-aware depth chart with Fit KR, swap interaction, and lineup rating strip.
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Spacing, BorderRadius } from '@/constants/theme';
import { TEAM_COLORS, PLAYER_CLUSTERS, PLAYER_PHYSICALS, computeOffKR, computeDefKR, getPlayerSubclusters } from '@/data/roster-data';
import type { ClusterRatings } from '@/data/roster-data';
import { ARCHETYPE_LABELS } from '@/data/system-demand-profiles';
import type { Archetype } from '@/data/system-demand-profiles';
import {
  OFFENSIVE_STYLES,
  DEFENSIVE_STYLES,
  OFFENSIVE_STYLE_CLUSTERS,
  DEFENSIVE_STYLE_CLUSTERS,
} from '@/data/mock-program-context';
import type { OffensiveStyle, DefensiveStyle } from '@/types';
import { HELIO_TO_TRADITIONAL } from '@/data/position-mapping';
import { computeFitKR, computePositionKR, computeLineupRating, getClusterDrivers, deriveArchetype, canPlayPosition } from '@/utils/fit-kr';
import { PlayerSheet } from '@/components/player-sheet';
import type { PoolPlayer, PoolPosition } from '@/data/playerPool';
import type { TeamGameImpact } from '@/data/fmu';
import { getPGISColor, getPlayerSeasonPGIS } from '@/data/fmu';
import { IconSymbol } from '@/components/ui/icon-symbol';


// Same storage key as program-context-section — keeps systems in sync
const PROGRAM_CONTEXT_KEY = 'kx:programContextSection:v3';

// Full position name → helio abbreviation
const POS_ABBREV: Record<string, string> = {
  'Point Guard': 'PG',
  'Combo Guard': 'CG',
  'Wing': 'W',
  'Forward': 'F',
  'Big': 'B',
};

// Cluster abbreviations for driver pills
const CLUSTER_ABBREVS: Record<string, string> = {
  shooting: 'SHT',
  finishing: 'FIN',
  playmaking: 'PLY',
  perimeter_defense: 'OBD',
  interior_defense: 'TMD',
  rebounding: 'REB',
  frame: 'PHY',
};

// Season-average PGIS per jersey (computed once at module level)
const SEASON_PGIS = getPlayerSeasonPGIS();

// ── Lineup Lens Types & Constants ──

type LensKey = 'overall' | 'offense' | 'defense' | 'shooting' | 'finishing' | 'playmaking'
             | 'perimeter_defense' | 'interior_defense' | 'rebounding' | 'frame' | 'pgis';

const LENS_ITEMS: { key: LensKey; label: string; section: string }[] = [
  { key: 'overall',           label: 'Overall (KR)',     section: 'Core' },
  { key: 'offense',           label: 'Offense (O-KR)',   section: 'Core' },
  { key: 'defense',           label: 'Defense (D-KR)',   section: 'Core' },
  { key: 'shooting',          label: 'Shooting',         section: 'Clusters' },
  { key: 'finishing',         label: 'Finishing',         section: 'Clusters' },
  { key: 'playmaking',        label: 'Playmaking',       section: 'Clusters' },
  { key: 'perimeter_defense', label: 'On-Ball Defense',  section: 'Clusters' },
  { key: 'interior_defense',  label: 'Team Defense',     section: 'Clusters' },
  { key: 'rebounding',        label: 'Rebounding',       section: 'Clusters' },
  { key: 'frame',             label: 'Physical (Frame)', section: 'Clusters' },
  { key: 'pgis',              label: 'PGIS (Impact)',    section: 'Impact' },
];

const WHY_TAG_CONFIG: Record<LensKey, { positive: string[]; negative: { tag: string; cluster: keyof ClusterRatings }[] }> = {
  overall:            { positive: ['+Best 5 KR', '+Balance'],   negative: [{ tag: '-Size', cluster: 'frame' }, { tag: '-Shooting', cluster: 'shooting' }] },
  offense:            { positive: ['+Creation', '+Spacing'],    negative: [{ tag: '-Stops', cluster: 'perimeter_defense' }] },
  defense:            { positive: ['+Stops', '+Rim'],           negative: [{ tag: '-Shooting', cluster: 'shooting' }] },
  shooting:           { positive: ['+Spacing', '+3PT'],         negative: [{ tag: '-Rim', cluster: 'interior_defense' }] },
  finishing:          { positive: ['+RimPress', '+Paint'],      negative: [{ tag: '-Spacing', cluster: 'shooting' }] },
  playmaking:         { positive: ['+Creation', '+AST/TO'],     negative: [{ tag: '-Size', cluster: 'frame' }] },
  perimeter_defense:  { positive: ['+POA', '+Contain'],         negative: [{ tag: '-Spacing', cluster: 'shooting' }] },
  interior_defense:   { positive: ['+Rotations', '+IQ'],        negative: [{ tag: '-Creation', cluster: 'playmaking' }] },
  rebounding:         { positive: ['+Boards', '+2ndCh'],        negative: [{ tag: '-Speed', cluster: 'perimeter_defense' }] },
  frame:              { positive: ['+Strength', '+Size'],       negative: [{ tag: '-Spacing', cluster: 'shooting' }] },
  pgis:               { positive: ['+Impact', '+Production'],   negative: [{ tag: '-Consistency', cluster: 'shooting' }] },
};

// ── Types ──

type DepthChartPosition = {
  position: string;
  players: {
    name: string;
    number: string;
    kr: number;
    minutes: number;
    archetypes: Archetype[];
    roleDefinition: string;
    coachNote: string;
    systemAmplifier?: string;
  }[];
};

interface DepthSlot {
  positionGroup: string;
  playerNumber: string;
  playerName: string;
  baseKR: number;
  minutes: number;
  archetypes: Archetype[];
  roleDefinition: string;
  coachNote: string;
  systemAmplifier?: string;
}

// ── Helpers ──

function initSlots(depthChart: DepthChartPosition[]): { starters: DepthSlot[]; bench: DepthSlot[] } {
  const starters: DepthSlot[] = [];
  const bench: DepthSlot[] = [];

  for (const pos of depthChart) {
    pos.players.forEach((p, idx) => {
      const slot: DepthSlot = {
        positionGroup: pos.position,
        playerNumber: p.number,
        playerName: p.name,
        baseKR: p.kr,
        minutes: p.minutes,
        archetypes: p.archetypes,
        roleDefinition: p.roleDefinition,
        coachNote: p.coachNote,
        systemAmplifier: p.systemAmplifier,
      };
      if (idx === 0) starters.push(slot);
      else bench.push(slot);
    });
  }

  return { starters, bench };
}

// ── Lineup Lens Engine ──

function scoreLens(
  cl: ClusterRatings,
  lens: LensKey,
  offStyle: OffensiveStyle,
  defStyle: DefensiveStyle,
  playerNumber?: string,
): number {
  switch (lens) {
    case 'overall': return computeFitKR(cl, offStyle, defStyle);
    case 'offense': return computeOffKR(cl);
    case 'defense': return computeDefKR(cl);
    case 'pgis': return playerNumber ? (SEASON_PGIS[playerNumber] ?? 0) : 0;
    default: return cl[lens as keyof ClusterRatings] ?? 0;
  }
}

function getWhyTags(
  lens: LensKey,
  lineupSlots: DepthSlot[],
  clusterMap: Record<string, ClusterRatings>,
): string[] {
  const config = WHY_TAG_CONFIG[lens];
  const tags = [...config.positive];
  const allNumbers = Object.keys(clusterMap);

  for (const neg of config.negative) {
    const lineupVals = lineupSlots
      .map(s => clusterMap[s.playerNumber]?.[neg.cluster])
      .filter((v): v is number => v != null);
    const lineupAvg = lineupVals.length > 0
      ? lineupVals.reduce((a, b) => a + b, 0) / lineupVals.length : 0;
    const teamVals = allNumbers
      .map(n => clusterMap[n]?.[neg.cluster])
      .filter((v): v is number => v != null)
      .sort((a, b) => a - b);
    const teamMedian = teamVals.length > 0
      ? teamVals[Math.floor(teamVals.length / 2)] : 0;

    if (lineupAvg < teamMedian) {
      tags.push(neg.tag);
      break; // only one negative tag
    }
  }
  return tags;
}

// 5 starter slots always rendered in this order
const POSITION_ORDER = ['Point Guard', 'Combo Guard', 'Wing', 'Forward', 'Big'];

// Canonical slot eligibility: a player can fill a slot if their cluster profile
// qualifies for at least one archetype at that position (per POSITION_ARCHETYPES
// in fit-kr.ts). Native position is always eligible.
function isEligibleForSlot(
  clusters: ClusterRatings | undefined,
  nativePosition: string,
  targetSlot: string,
): boolean {
  if (nativePosition === targetSlot) return true;
  if (!clusters) return false;
  const targetAbbrev = POS_ABBREV[targetSlot];
  return targetAbbrev ? canPlayPosition(clusters, targetAbbrev) : false;
}

function computeBestLineup(
  depthChart: DepthChartPosition[],
  clusterMap: Record<string, ClusterRatings>,
  lens: LensKey,
  offStyle: OffensiveStyle,
  defStyle: DefensiveStyle,
  customScores?: Record<string, number>,
): { starters: DepthSlot[]; rotationBench: DepthSlot[]; bench: DepthSlot[]; whyTags: string[] } {
  type ScoredSlot = DepthSlot & { score: number };
  const allPlayers: ScoredSlot[] = [];

  for (const pos of depthChart) {
    for (const p of pos.players) {
      const cl = clusterMap[p.number];
      const score = customScores?.[p.number] ?? (cl ? scoreLens(cl, lens, offStyle, defStyle, p.number) : (lens === 'pgis' ? (SEASON_PGIS[p.number] ?? 0) : p.kr));
      allPlayers.push({
        positionGroup: pos.position,
        playerNumber: p.number,
        playerName: p.name,
        baseKR: p.kr,
        minutes: p.minutes,
        archetypes: p.archetypes,
        roleDefinition: p.roleDefinition,
        coachNote: p.coachNote,
        systemAmplifier: p.systemAmplifier,
        score,
      });
    }
  }

  // Optimal assignment: find the 5-player lineup (one per slot) that maximizes
  // total lens score, allowing players to slide to feasible adjacent positions.
  // Recursive search with top-5-per-slot pruning — at most ~3k branches, instant.
  const assigned = new Set<string>();

  function solve(slotIdx: number): { picks: { player: ScoredSlot; slot: string }[]; total: number } {
    if (slotIdx >= POSITION_ORDER.length) return { picks: [], total: 0 };

    const slotPos = POSITION_ORDER[slotIdx];
    const eligible = allPlayers
      .filter(p =>
        !assigned.has(p.playerNumber) &&
        isEligibleForSlot(clusterMap[p.playerNumber], p.positionGroup, slotPos),
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // top 5 per slot keeps search fast

    let best: { picks: { player: ScoredSlot; slot: string }[]; total: number } = { picks: [], total: -Infinity };

    for (const player of eligible) {
      assigned.add(player.playerNumber);
      const rest = solve(slotIdx + 1);
      const total = player.score + rest.total;
      if (total > best.total) {
        best = { picks: [{ player, slot: slotPos }, ...rest.picks], total };
      }
      assigned.delete(player.playerNumber);
    }

    // Fallback if no eligible player for this slot
    if (best.total === -Infinity) {
      const rest = solve(slotIdx + 1);
      best = { picks: rest.picks, total: rest.total };
    }

    return best;
  }

  const solution = solve(0);

  // Build starters — positionGroup = assigned slot (not native), so the jersey
  // circle shows the slot the player is filling in this lineup.
  const starters: DepthSlot[] = solution.picks.map(({ player, slot }) => ({
    positionGroup: slot,
    playerNumber: player.playerNumber,
    playerName: player.playerName,
    baseKR: player.baseKR,
    minutes: player.minutes,
    archetypes: player.archetypes,
    roleDefinition: player.roleDefinition,
    coachNote: player.coachNote,
    systemAmplifier: player.systemAmplifier,
  }));

  const pickedStarters = new Set(solution.picks.map(p => p.player.playerNumber));

  // Rotation 9: next 4 best from remaining (no positional constraint)
  const remaining = allPlayers
    .filter(p => !pickedStarters.has(p.playerNumber))
    .sort((a, b) => b.score - a.score);

  const rotSlots = remaining.slice(0, 4);
  const pickedAll = new Set([
    ...pickedStarters,
    ...rotSlots.map(p => p.playerNumber),
  ]);

  const toSlot = (p: ScoredSlot): DepthSlot => ({
    positionGroup: p.positionGroup,
    playerNumber: p.playerNumber,
    playerName: p.playerName,
    baseKR: p.baseKR,
    minutes: p.minutes,
    archetypes: p.archetypes,
    roleDefinition: p.roleDefinition,
    coachNote: p.coachNote,
    systemAmplifier: p.systemAmplifier,
  });

  const rotBench = rotSlots.map(toSlot);
  const benchPlayers = allPlayers.filter(p => !pickedAll.has(p.playerNumber)).map(toSlot);
  const whyTags = getWhyTags(lens, starters, clusterMap);

  return { starters, rotationBench: rotBench, bench: benchPlayers, whyTags };
}

// ── Fit KR Badge ──

function FitBadge({ baseKR, fitKR, hideDelta }: { baseKR: number; fitKR: number; hideDelta?: boolean }) {
  const delta = fitKR - baseKR;
  const deltaColor = delta > 0 ? '#4CAF50' : delta < 0 ? '#EF4444' : TEAM_COLORS.gray;
  const deltaText = delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '—';

  return (
    <View style={badgeStyles.container}>
      <Text style={badgeStyles.fitValue}>{fitKR}</Text>
      {!hideDelta && <Text style={[badgeStyles.delta, { color: deltaColor }]}>{deltaText}</Text>}
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    minWidth: 44,
  },
  fitValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#f0f0f0',
  },
  delta: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
});

// ── Player Row ──

function PlayerRow({
  slot,
  fitKR,
  circleLabel,
  isSelected,
  isSwapTarget,
  isStarter,
  derivedArchetype,
  physicals,
  pgis,
  hideDelta,
  dnp,
  onPress,
  onLongPress,
  onNamePress,
}: {
  slot: DepthSlot;
  fitKR: number;
  circleLabel: string;
  isSelected: boolean;
  isSwapTarget: boolean;
  isStarter: boolean;
  derivedArchetype?: Archetype;
  physicals?: { height: string; weight: number };
  pgis?: number;
  hideDelta?: boolean;
  dnp?: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onNamePress: () => void;
}) {
  const archetypeKey = derivedArchetype ?? (slot.archetypes.length > 0 ? slot.archetypes[0] : null);
  const primaryArchetype = archetypeKey
    ? ARCHETYPE_LABELS[archetypeKey] ?? archetypeKey
    : null;

  return (
    <View
      style={[
        styles.playerRow,
        isSelected && styles.playerRowSelected,
        isSwapTarget && styles.playerRowSwapTarget,
        !isStarter && !isSelected && !isSwapTarget && styles.playerRowBench,
      ]}
    >
      {/* Jersey + KR side — tap to select/swap, hold for sheet */}
      <Pressable
        style={styles.jerseyTap}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          onLongPress();
        }}
        delayLongPress={300}
      >
        <View style={[
          styles.jerseyCircle,
          isSelected && styles.jerseyCircleSelected,
          isSwapTarget && styles.jerseyCircleSwapTarget,
        ]}>
          <Text style={[styles.jerseyNumber, isSelected && { color: '#111' }]}>{circleLabel}</Text>
        </View>
      </Pressable>

      {/* Name — tap for bio (or swap if in swap mode) */}
      <Pressable
        style={styles.playerInfo}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          if (isSwapTarget) {
            onPress(); // swap mode: complete the swap
          } else {
            onNamePress(); // normal: go to bio
          }
        }}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          onLongPress();
        }}
        delayLongPress={300}
      >
        <Text style={[styles.playerName, isSelected && { color: TEAM_COLORS.secondary }]} numberOfLines={1}>
          {slot.playerName}
        </Text>
        <Text style={styles.playerMeta} numberOfLines={1}>
          {physicals ? `${physicals.height} · ${physicals.weight} lbs` : (POS_ABBREV[slot.positionGroup] ?? slot.positionGroup)}
          {primaryArchetype ? ` · ${primaryArchetype}` : ''}
        </Text>
      </Pressable>

      {/* KR badge / swap arrow — tap to select/swap */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          onLongPress();
        }}
        delayLongPress={300}
      >
        {isSwapTarget ? (
          <View style={styles.swapArrow}>
            <Text style={styles.swapArrowText}>⇄</Text>
          </View>
        ) : pgis != null ? (
          <View style={[badgeStyles.container, { backgroundColor: getPGISColor(pgis) + '20', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }]}>
            <Text style={[badgeStyles.fitValue, { color: getPGISColor(pgis), fontSize: 14 }]}>
              {pgis > 0 ? '+' : ''}{pgis}
            </Text>
          </View>
        ) : dnp ? (
          <View style={badgeStyles.container}>
            <Text style={[badgeStyles.fitValue, { color: '#555' }]}>—</Text>
          </View>
        ) : (
          <FitBadge baseKR={slot.baseKR} fitKR={fitKR} hideDelta={hideDelta} />
        )}
      </Pressable>
    </View>
  );
}

// ── Main Component ──

export function UnitsView({
  depthChart,
  playerClusters: externalClusters,
  playerPhysicals: externalPhysicals,
  initialOffStyle,
  initialDefStyle,
  initialTempo,
  keysToGame,
  gameImpact,
  hideSystems,
  statLeaders,
  lensOverride,
  subclusterOverride,
}: {
  depthChart: DepthChartPosition[];
  playerClusters?: Record<string, ClusterRatings>;
  playerPhysicals?: Record<string, { height: string; weight: number }>;
  initialOffStyle?: OffensiveStyle;
  initialDefStyle?: DefensiveStyle;
  initialTempo?: string;
  keysToGame?: string[];
  gameImpact?: TeamGameImpact;
  hideSystems?: boolean;
  statLeaders?: { label: string; name: string; value: string }[];
  lensOverride?: LensKey;
  subclusterOverride?: { cluster: keyof ClusterRatings; index: number };
}) {
  const clusterMap = externalClusters ?? PLAYER_CLUSTERS;
  const physMap = externalPhysicals ?? PLAYER_PHYSICALS;

  // System state — saved (locked, from program context) + temp (exploratory override)
  const [savedOff, setSavedOff] = useState<OffensiveStyle>(initialOffStyle ?? 'motion_read_react');
  const [savedDef, setSavedDef] = useState<DefensiveStyle>(initialDefStyle ?? 'containment_man');
  const [tempOff, setTempOff] = useState<OffensiveStyle | null>(null);
  const [tempDef, setTempDef] = useState<DefensiveStyle | null>(null);

  // Active system = temp if set, otherwise saved
  const offStyle = tempOff ?? savedOff;
  const defStyle = tempDef ?? savedDef;

  // Load saved systems from program context (skip if initial styles provided externally)
  useEffect(() => {
    if (initialOffStyle || initialDefStyle) return;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PROGRAM_CONTEXT_KEY);
        if (raw) {
          const ctx = JSON.parse(raw);
          if (ctx.offensiveStyle) setSavedOff(ctx.offensiveStyle);
          if (ctx.defensiveStyle) setSavedDef(ctx.defensiveStyle);
        }
      } catch {}
    })();
  }, []);

  // Save system back to program context (same format as program-context-section)
  const saveSystemToContext = useCallback(async (off: OffensiveStyle, def: DefensiveStyle) => {
    try {
      const raw = await AsyncStorage.getItem(PROGRAM_CONTEXT_KEY);
      const ctx = raw ? JSON.parse(raw) : {};

      // Update offensive style + cluster weights
      const oClusters = OFFENSIVE_STYLE_CLUSTERS[off];
      const dClusters = DEFENSIVE_STYLE_CLUSTERS[def];
      const weights = (ctx.clusterWeights ?? []).map((cw: any) => {
        if (cw.cluster === 'shooting') return { ...cw, weight: oClusters.shooting };
        if (cw.cluster === 'finishing') return { ...cw, weight: oClusters.finishing };
        if (cw.cluster === 'playmaking') return { ...cw, weight: oClusters.playmaking };
        if (cw.cluster === 'perimeter_defense') return { ...cw, weight: dClusters.perimeter_defense };
        if (cw.cluster === 'interior_defense') return { ...cw, weight: dClusters.interior_defense };
        if (cw.cluster === 'rebounding') return { ...cw, weight: dClusters.rebounding };
        if (cw.cluster === 'frame') return { ...cw, weight: dClusters.frame };
        return cw;
      });

      const updated = { ...ctx, offensiveStyle: off, defensiveStyle: def, clusterWeights: weights };
      await AsyncStorage.setItem(PROGRAM_CONTEXT_KEY, JSON.stringify(updated));
    } catch {}
  }, []);

  // Double-tap tracking for system pickers
  const lastOffTapRef = useRef<{ time: number; value: string }>({ time: 0, value: '' });
  const lastDefTapRef = useRef<{ time: number; value: string }>({ time: 0, value: '' });

  // Depth chart slots
  const initialSlots = useMemo(() => initSlots(depthChart), [depthChart]);
  const [starters, setStarters] = useState<DepthSlot[]>(initialSlots.starters);
  const [bench, setBench] = useState<DepthSlot[]>(initialSlots.bench);

  // Swap state
  const [selectedForSwap, setSelectedForSwap] = useState<string | null>(null);

  // Spotlight: which top-3 player's individual clusters are shown
  const [spotlightPlayer, setSpotlightPlayer] = useState<string | null>(null);

  // System picker expanded state
  const [offExpanded, setOffExpanded] = useState(false);
  const [defExpanded, setDefExpanded] = useState(false);

  // Player sheet state
  const [sheetPlayer, setSheetPlayer] = useState<string | null>(null);
  const [sheetFitNote, setSheetFitNote] = useState('');
  const [sheetCoachNote, setSheetCoachNote] = useState('');

  // Lineup Lens state
  const [lens, setLens] = useState<LensKey>('overall');
  const [manualOverride, setManualOverride] = useState(false);
  const [lensMenuOpen, setLensMenuOpen] = useState(false);
  const [lensPillY, setLensPillY] = useState(0);
  const [lensPillH, setLensPillH] = useState(0);
  const [lensPillX, setLensPillX] = useState(0);
  const lensPillRef = useRef<View>(null);
  const [rotationBench, setRotationBench] = useState<DepthSlot[]>([]);
  const [whyTags, setWhyTags] = useState<string[]>(['+Best 5 KR', '+Balance']);

  // Sync lens from external cluster picker (reset to overall when cleared)
  const prevLensOverride = useRef(lensOverride);
  useEffect(() => {
    if (lensOverride) {
      setLens(lensOverride);
    } else if (prevLensOverride.current && !lensOverride) {
      // Override was active and now cleared — reset to overall
      setLens('overall');
    }
    prevLensOverride.current = lensOverride;
  }, [lensOverride]);

  // Build custom scores when a subcluster is selected
  const subclusterScores = useMemo<Record<string, number> | undefined>(() => {
    if (!subclusterOverride) return undefined;
    const scores: Record<string, number> = {};
    for (const pos of depthChart) {
      for (const p of pos.players) {
        const subs = getPlayerSubclusters(p.number, subclusterOverride.cluster);
        scores[p.number] = subs[subclusterOverride.index]?.rating ?? 0;
      }
    }
    return scores;
  }, [subclusterOverride, depthChart]);

  // Recompute lineup when lens, mode, system, or subcluster changes
  useEffect(() => {
    if (gameImpact || hideSystems) return;
    const computed = computeBestLineup(depthChart, clusterMap, lens, offStyle, defStyle, subclusterScores);
    setStarters(computed.starters);
    setRotationBench(computed.rotationBench);
    setBench(computed.bench);
    setWhyTags(computed.whyTags);
    setManualOverride(false);
  }, [lens, offStyle, defStyle, depthChart, clusterMap, subclusterScores]);

  // Compute Fit KRs for all players (40% position lens + 60% system fit)
  const fitKRs = useMemo(() => {
    const map: Record<string, number> = {};
    const allSlots = [...starters, ...rotationBench, ...bench];
    for (const slot of allSlots) {
      const cl = clusterMap[slot.playerNumber];
      if (cl) {
        const posAbbrev = POS_ABBREV[slot.positionGroup] ?? slot.positionGroup;
        const posKR = computePositionKR(cl, posAbbrev);
        const sysKR = computeFitKR(cl, offStyle, defStyle);
        map[slot.playerNumber] = Math.round(posKR * 0.4 + sysKR * 0.6);
      } else {
        map[slot.playerNumber] = slot.baseKR;
      }
    }
    return map;
  }, [starters, rotationBench, bench, offStyle, defStyle, clusterMap]);

  // Derive archetypes from position + cluster ratings
  const derivedArchetypes = useMemo(() => {
    const map: Record<string, Archetype> = {};
    const allSlots = [...starters, ...rotationBench, ...bench];
    for (const slot of allSlots) {
      const cl = clusterMap[slot.playerNumber];
      if (cl) {
        const posAbbrev = POS_ABBREV[slot.positionGroup] ?? slot.positionGroup;
        map[slot.playerNumber] = deriveArchetype(cl, posAbbrev);
      }
    }
    return map;
  }, [starters, rotationBench, bench, clusterMap]);

  // Lineup rating (overall, off, def)
  const lineupRating = useMemo(() => {
    const starterClusters = starters
      .map((s) => clusterMap[s.playerNumber])
      .filter(Boolean) as ClusterRatings[];
    const mins = starters.map((s) => s.minutes);
    return computeLineupRating(starterClusters, offStyle, defStyle, mins);
  }, [starters, offStyle, defStyle, clusterMap]);

  // Top 3 starters by fitKR (starters only so swaps cause visible changes)
  const top3 = useMemo(() => {
    return starters
      .map((slot) => ({
        name: slot.playerName,
        number: slot.playerNumber,
        pos: POS_ABBREV[slot.positionGroup] ?? slot.positionGroup,
        kr: fitKRs[slot.playerNumber] ?? slot.baseKR,
      }))
      .sort((a, b) => b.kr - a.kr)
      .slice(0, 3);
  }, [starters, fitKRs]);

  // Team cluster drivers (aggregate)
  const teamDrivers = useMemo(() => {
    const starterClusters = starters
      .map((s) => clusterMap[s.playerNumber])
      .filter(Boolean) as ClusterRatings[];
    return getClusterDrivers(starterClusters);
  }, [starters, clusterMap]);

  // Individual player cluster ratings (when a top-3 avatar is tapped)
  const displayDrivers = useMemo(() => {
    if (!spotlightPlayer) return teamDrivers;
    const cl = clusterMap[spotlightPlayer];
    if (!cl) return teamDrivers;
    const ALL_CLUSTERS: (keyof ClusterRatings)[] = [
      'shooting', 'finishing', 'playmaking',
      'perimeter_defense', 'interior_defense', 'rebounding', 'frame',
    ];
    return ALL_CLUSTERS
      .map((key) => ({ cluster: key, label: CLUSTER_ABBREVS[key] ?? key, value: cl[key] }))
      .sort((a, b) => b.value - a.value);
  }, [spotlightPlayer, clusterMap, teamDrivers]);

  // PGIS lookup: map player name → pgis score (for completed games)
  const pgisMap = useMemo(() => {
    if (!gameImpact) return {};
    const map: Record<string, number> = {};
    for (const p of [...gameImpact.starters, ...gameImpact.bench]) {
      map[p.name] = p.pgis;
    }
    return map;
  }, [gameImpact]);

  // Swap logic (supports starters, rotationBench, and bench)
  const handleSwap = (targetNumber: string) => {
    if (!selectedForSwap || selectedForSwap === targetNumber) {
      setSelectedForSwap(null);
      return;
    }

    const newStarters = [...starters];
    const newRotation = [...rotationBench];
    const newBench = [...bench];

    const findSlot = (num: string) => {
      let idx = newStarters.findIndex(s => s.playerNumber === num);
      if (idx >= 0) return { arr: newStarters, idx };
      idx = newRotation.findIndex(s => s.playerNumber === num);
      if (idx >= 0) return { arr: newRotation, idx };
      idx = newBench.findIndex(s => s.playerNumber === num);
      if (idx >= 0) return { arr: newBench, idx };
      return null;
    };

    const src = findSlot(selectedForSwap);
    const tgt = findSlot(targetNumber);
    if (!src || !tgt) { setSelectedForSwap(null); return; }

    const srcSlot = src.arr[src.idx];
    const tgtSlot = tgt.arr[tgt.idx];

    src.arr[src.idx] = { ...tgtSlot, positionGroup: srcSlot.positionGroup };
    tgt.arr[tgt.idx] = { ...srcSlot, positionGroup: tgtSlot.positionGroup };

    setStarters(newStarters);
    setRotationBench(newRotation);
    setBench(newBench);
    setSelectedForSwap(null);
    setManualOverride(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleRowPress = (playerNumber: string) => {
    if (selectedForSwap) {
      handleSwap(playerNumber);
    } else {
      setSelectedForSwap(playerNumber);
    }
  };

  const handleRowLongPress = (playerNumber: string) => {
    if (gameImpact) return; // PGIS shown inline, no overlay needed
    setSelectedForSwap(null);
    setSheetPlayer(playerNumber);
  };

  // Convert depth slot → PoolPlayer for the universal player sheet
  const sheetSlot = sheetPlayer
    ? [...starters, ...rotationBench, ...bench].find((s) => s.playerNumber === sheetPlayer) ?? null
    : null;

  const sheetPoolPlayer: PoolPlayer | null = useMemo(() => {
    if (!sheetSlot) return null;
    const nameParts = sheetSlot.playerName.split(' ');
    const firstName = nameParts[0] ?? '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const posAbbrev = POS_ABBREV[sheetSlot.positionGroup] ?? sheetSlot.positionGroup;
    const tradPos = (HELIO_TO_TRADITIONAL as Record<string, PoolPosition>)[posAbbrev] ?? 'SF';
    return {
      id: `roster-${sheetSlot.playerNumber}`,
      firstName,
      lastName,
      position: tradPos,
      height: '',
      classYear: '',
      currentSchool: 'Florida Memorial',
      level: 'NAIA' as const,
      conference: '',
      state: 'FL',
      keyStatLine: '',
      hasFilm: false,
      lastUpdated: '',
      archetype: sheetSlot.archetypes[0] ?? 'two_way_wing',
    };
  }, [sheetSlot]);

  const sheetClusters = sheetPlayer ? clusterMap[sheetPlayer] ?? undefined : undefined;

  return (
    <View style={styles.container}>
      {/* Divider below Controls Row */}
      <View style={styles.controlsDivider} />

      {/* Lineup Lens Pill — above systems (hidden when external picker is driving) */}
      {!hideSystems && !gameImpact && !lensOverride && (
        <View style={styles.lensRow}>
          <Text style={styles.kanextLabel}>KaNeXT</Text>
          <Pressable
            ref={lensPillRef as any}
            style={styles.lensPill}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              (lensPillRef.current as any)?.measureInWindow((x: number, y: number, _w: number, h: number) => {
                setLensPillX(x);
                setLensPillY(y);
                setLensPillH(h);
                setLensMenuOpen(true);
              });
            }}
          >
            <IconSymbol name="line.3.horizontal.decrease" size={12} color="#aaa" />
            <Text style={styles.lensPillText}>
              {LENS_ITEMS.find(l => l.key === lens)?.label ?? 'Overall (KR)'}
            </Text>
            <IconSymbol name="chevron.down" size={10} color="#888" />
          </Pressable>
          {manualOverride && (
            <>
              <View style={styles.manualBadge}>
                <Text style={styles.manualBadgeText}>Manual</Text>
              </View>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const computed = computeBestLineup(depthChart, clusterMap, lens, offStyle, defStyle);
                  setStarters(computed.starters);
                  setRotationBench(computed.rotationBench);
                  setBench(computed.bench);
                  setWhyTags(computed.whyTags);
                  setManualOverride(false);
                }}
              >
                <Text style={styles.resetLensText}>Reset to Lens</Text>
              </Pressable>
            </>
          )}
        </View>
      )}

      {/* System Controls */}
      {hideSystems ? null : gameImpact ? (
        /* Completed game: locked systems on one line */
        <View style={[styles.systemScrollRow, { gap: 12 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.systemFixedLabel}>OFF</Text>
            <View style={[styles.scrollPill, styles.scrollPillActive]}>
              <Text style={[styles.scrollPillText, styles.scrollPillTextActive]}>
                {OFFENSIVE_STYLES.find((s) => s.value === offStyle)?.label ?? offStyle}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.systemFixedLabel}>DEF</Text>
            <View style={[styles.scrollPill, styles.scrollPillActive]}>
              <Text style={[styles.scrollPillText, styles.scrollPillTextActive]}>
                {DEFENSIVE_STYLES.find((s) => s.value === defStyle)?.label ?? defStyle}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        /* Normal: compact Systems row + inline accordion */
        <View>
          {/* Side-by-side label row */}
          <View style={styles.systemsRow}>
            <Pressable
              style={[styles.systemsHalf, offExpanded && styles.systemsHalfActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setOffExpanded((prev) => !prev);
                setDefExpanded(false);
              }}
            >
              <Text style={styles.systemsLabel}>Offense</Text>
              <Text style={[styles.systemsValue, offExpanded && styles.systemsValueActive]} numberOfLines={1}>
                {OFFENSIVE_STYLES.find((s) => s.value === offStyle)?.label ?? offStyle}
              </Text>
              <IconSymbol name={offExpanded ? 'chevron.up' : 'chevron.down'} size={10} color={offExpanded ? '#f5f5f5' : '#666'} />
            </Pressable>
            <View style={styles.systemsDivider} />
            <Pressable
              style={[styles.systemsHalf, defExpanded && styles.systemsHalfActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDefExpanded((prev) => !prev);
                setOffExpanded(false);
              }}
            >
              <Text style={styles.systemsLabel}>Defense</Text>
              <Text style={[styles.systemsValue, defExpanded && styles.systemsValueActive]} numberOfLines={1}>
                {DEFENSIVE_STYLES.find((s) => s.value === defStyle)?.label ?? defStyle}
              </Text>
              <IconSymbol name={defExpanded ? 'chevron.up' : 'chevron.down'} size={10} color={defExpanded ? '#f5f5f5' : '#666'} />
            </Pressable>
          </View>

          {/* Offense accordion panel */}
          {offExpanded && (
            <View style={styles.accordionPanel}>
              {OFFENSIVE_STYLES.map((s) => {
                const active = s.value === offStyle;
                const isSaved = s.value === savedOff;
                return (
                  <Pressable
                    key={s.value}
                    style={[styles.accordionItem, active && styles.accordionItemActive]}
                    onPress={() => {
                      const now = Date.now();
                      const last = lastOffTapRef.current;
                      const isDoubleTap = now - last.time < 400 && last.value === s.value;

                      if (isDoubleTap) {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        setSavedOff(s.value as OffensiveStyle);
                        setTempOff(null);
                        saveSystemToContext(s.value as OffensiveStyle, savedDef);
                        lastOffTapRef.current = { time: 0, value: '' };
                        setOffExpanded(false);
                      } else {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setTempOff(s.value === savedOff ? null : s.value as OffensiveStyle);
                        lastOffTapRef.current = { time: now, value: s.value };
                        if (!active) setOffExpanded(false);
                      }
                    }}
                  >
                    <View style={[styles.accordionRadio, active && styles.accordionRadioActive]} />
                    <Text style={[styles.accordionText, active && styles.accordionTextActive]}>{s.label}</Text>
                    {isSaved && <View style={styles.savedDot} />}
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Defense accordion panel */}
          {defExpanded && (
            <View style={styles.accordionPanel}>
              {DEFENSIVE_STYLES.map((s) => {
                const active = s.value === defStyle;
                const isSaved = s.value === savedDef;
                return (
                  <Pressable
                    key={s.value}
                    style={[styles.accordionItem, active && styles.accordionItemActive]}
                    onPress={() => {
                      const now = Date.now();
                      const last = lastDefTapRef.current;
                      const isDoubleTap = now - last.time < 400 && last.value === s.value;

                      if (isDoubleTap) {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        setSavedDef(s.value as DefensiveStyle);
                        setTempDef(null);
                        saveSystemToContext(savedOff, s.value as DefensiveStyle);
                        lastDefTapRef.current = { time: 0, value: '' };
                        setDefExpanded(false);
                      } else {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setTempDef(s.value === savedDef ? null : s.value as DefensiveStyle);
                        lastDefTapRef.current = { time: now, value: s.value };
                        if (!active) setDefExpanded(false);
                      }
                    }}
                  >
                    <View style={[styles.accordionRadio, active && styles.accordionRadioActive]} />
                    <Text style={[styles.accordionText, active && styles.accordionTextActive]}>{s.label}</Text>
                    {isSaved && <View style={styles.savedDot} />}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* Overall KR Block */}
      {!hideSystems && (
      <View style={styles.krBlock}>
        <View style={styles.krMain}>
          <Text style={styles.krMainLabel}>KR</Text>
          <Text style={styles.krMainValue}>
            {Math.round(lineupRating.offKR * 0.53 + lineupRating.defKR * 0.47)}
          </Text>
        </View>
        <View style={styles.krBlockDivider} />
        <View style={styles.krSub}>
          <Text style={styles.krSubLabel}>OFF</Text>
          <Text style={styles.krSubValue}>{lineupRating.offKR}</Text>
        </View>
        <View style={styles.krBlockDivider} />
        <View style={styles.krSub}>
          <Text style={styles.krSubLabel}>DEF</Text>
          <Text style={styles.krSubValue}>{lineupRating.defKR}</Text>
        </View>
      </View>
      )}

      {/* Section Divider */}
      <View style={styles.sectionDivider}>
        <View style={styles.sectionDividerLine} />
        <Text style={styles.sectionDividerLabel}>
          {!hideSystems && !gameImpact
            ? `DEPTH CHART \u2014 ${LENS_ITEMS.find(l => l.key === lens)?.label ?? 'Overall (KR)'}`
            : 'DEPTH CHART'}
        </Text>
        <View style={styles.sectionDividerLine} />
      </View>

      {/* Why Tags */}
      {!hideSystems && !gameImpact && whyTags.length > 0 && (
        <View style={styles.whyTagsRow}>
          {whyTags.map((tag, i) => (
            <View key={i} style={[styles.whyTagChip, tag.startsWith('-') && styles.whyTagChipNeg]}>
              <Text style={[styles.whyTagText, tag.startsWith('-') && styles.whyTagTextNeg]}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Starters Card */}
      <View style={styles.sectionCard}>
        {starters.map((slot) => (
          <PlayerRow
            key={slot.playerNumber}
            slot={slot}
            fitKR={fitKRs[slot.playerNumber] ?? slot.baseKR}
            circleLabel={POS_ABBREV[slot.positionGroup] ?? slot.positionGroup}
            isSelected={selectedForSwap === slot.playerNumber}
            isSwapTarget={!!selectedForSwap && selectedForSwap !== slot.playerNumber}
            isStarter
            derivedArchetype={derivedArchetypes[slot.playerNumber]}
            physicals={physMap[slot.playerNumber]}
            pgis={pgisMap[slot.playerName]}
            hideDelta={!!hideSystems}
            dnp={!!gameImpact && pgisMap[slot.playerName] == null}
            onPress={() => handleRowPress(slot.playerNumber)}
            onLongPress={() => handleRowLongPress(slot.playerNumber)}
            onNamePress={() => handleRowLongPress(slot.playerNumber)}
          />
        ))}
      </View>

      {/* Rotation Bench (positions 6-9, only in rotation mode) */}
      {rotationBench.length > 0 && !gameImpact && (
        <>
          <View style={styles.sectionDivider}>
            <View style={styles.sectionDividerLine} />
            <Text style={styles.sectionDividerLabel}>ROTATION (9)</Text>
            <View style={styles.sectionDividerLine} />
          </View>
          <View style={styles.sectionCard}>
            {rotationBench.map((slot, idx) => (
              <PlayerRow
                key={slot.playerNumber}
                slot={slot}
                fitKR={fitKRs[slot.playerNumber] ?? slot.baseKR}
                circleLabel={`${6 + idx}`}
                isSelected={selectedForSwap === slot.playerNumber}
                isSwapTarget={!!selectedForSwap && selectedForSwap !== slot.playerNumber}
                isStarter={false}
                derivedArchetype={derivedArchetypes[slot.playerNumber]}
                physicals={physMap[slot.playerNumber]}
                pgis={pgisMap[slot.playerName]}
                hideDelta={!!hideSystems}
                dnp={!!gameImpact && pgisMap[slot.playerName] == null}
                onPress={() => handleRowPress(slot.playerNumber)}
                onLongPress={() => handleRowLongPress(slot.playerNumber)}
                onNamePress={() => handleRowLongPress(slot.playerNumber)}
              />
            ))}
          </View>
        </>
      )}

      {/* Bench Card */}
      <View style={styles.sectionCard}>
        {bench.map((slot, idx) => (
          <PlayerRow
            key={slot.playerNumber}
            slot={slot}
            fitKR={fitKRs[slot.playerNumber] ?? slot.baseKR}
            circleLabel={`${6 + rotationBench.length + idx}`}
            isSelected={selectedForSwap === slot.playerNumber}
            isSwapTarget={!!selectedForSwap && selectedForSwap !== slot.playerNumber}
            isStarter={false}
            derivedArchetype={derivedArchetypes[slot.playerNumber]}
            physicals={physMap[slot.playerNumber]}
            pgis={pgisMap[slot.playerName]}
            hideDelta={!!hideSystems}
            dnp={!!gameImpact && pgisMap[slot.playerName] == null}
            onPress={() => handleRowPress(slot.playerNumber)}
            onLongPress={() => handleRowLongPress(slot.playerNumber)}
            onNamePress={() => handleRowLongPress(slot.playerNumber)}
          />
        ))}
      </View>

      {/* Keys to the Game */}
      {keysToGame && keysToGame.length > 0 && (
        <View style={styles.keysCard}>
          <Text style={styles.keysTitle}>KEYS TO THE GAME</Text>
          {keysToGame.map((key, i) => (
            <View key={i} style={styles.keysRow}>
              <View style={styles.keysNumber}>
                <Text style={styles.keysNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.keysText}>{key}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Lineup Lens Dropdown */}
      {lensMenuOpen && (
        <Modal visible transparent animationType="none" onRequestClose={() => setLensMenuOpen(false)}>
          <Pressable style={styles.lensOverlay} onPress={() => setLensMenuOpen(false)}>
            <View style={[styles.lensDropdown, { top: lensPillY + lensPillH + 4, left: lensPillX }]}>
              {/* Lens items by section */}
              {['Core', 'Clusters', 'Impact'].map((section) => (
                <View key={section}>
                  <Text style={styles.lensSectionLabel}>{section.toUpperCase()}</Text>
                  {LENS_ITEMS.filter(l => l.section === section).map((item) => {
                    const isActive = item.key === lens;
                    return (
                      <Pressable
                        key={item.key}
                        style={[styles.lensItem, isActive && styles.lensItemActive]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setLens(item.key);
                          setLensMenuOpen(false);
                        }}
                      >
                        <Text style={[styles.lensItemText, isActive && styles.lensItemTextActive]}>{item.label}</Text>
                        {isActive && <Text style={styles.lensCheckmark}>✓</Text>}
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Player Detail Sheet (hidden for completed games since PGIS is inline) */}
      {!gameImpact && (
        <PlayerSheet
          visible={!!sheetPlayer}
          onClose={() => { setSheetPlayer(null); setSheetFitNote(''); setSheetCoachNote(''); }}
          player={sheetPoolPlayer}
          jerseyNumber={sheetPlayer ?? undefined}
          offStyle={offStyle}
          defStyle={defStyle}
          onOffStyleChange={(s) => setTempOff(s === savedOff ? null : s)}
          onDefStyleChange={(s) => setTempDef(s === savedDef ? null : s)}
          fitNote={sheetFitNote}
          onFitNoteChange={setSheetFitNote}
          coachNote={sheetCoachNote}
          onCoachNoteChange={setSheetCoachNote}
          clusterOverride={sheetClusters}
          baseKROverride={sheetSlot?.baseKR}
          physicals={sheetPlayer ? physMap[sheetPlayer] : undefined}
        />
      )}
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
  },
  controlsDivider: {
    height: 1,
    backgroundColor: '#ffffff0C',
    marginHorizontal: Spacing.lg,
    marginBottom: 2,
  },

  // System scroll pickers
  systemScrollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.lg,
    marginTop: 6,
    marginBottom: 6,
  },
  systemFixedLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#888',
    letterSpacing: 1,
    marginRight: 10,
    width: 30,
  },
  systemScrollContent: {
    gap: 8,
    paddingRight: Spacing.lg,
  },
  scrollPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#ffffff08',
  },
  scrollPillActive: {
    backgroundColor: '#f5f5f5',
    borderColor: '#f5f5f5',
  },
  scrollPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  scrollPillTextActive: {
    color: '#111',
    fontWeight: '700',
  },
  savedDot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: TEAM_COLORS.secondary,
  },

  // Systems row + inline accordion
  systemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: 6,
    marginBottom: 2,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ffffff08',
  },
  systemsHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  systemsHalfActive: {
    backgroundColor: '#ffffff12',
  },
  systemsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#666',
    letterSpacing: 0.8,
  },
  systemsValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    flex: 1,
  },
  systemsValueActive: {
    color: '#f5f5f5',
    fontWeight: '700',
  },
  systemsDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#ffffff0C',
  },
  accordionPanel: {
    marginHorizontal: Spacing.lg,
    marginTop: 4,
    marginBottom: 4,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#ffffff08',
  },
  accordionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  accordionItemActive: {
    backgroundColor: '#ffffff08',
  },
  accordionRadio: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#444',
    backgroundColor: 'transparent',
  },
  accordionRadioActive: {
    borderColor: '#f5f5f5',
    backgroundColor: '#f5f5f5',
  },
  accordionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#888',
    flex: 1,
  },
  accordionTextActive: {
    color: '#f5f5f5',
    fontWeight: '700',
  },

  // Section card
  sectionCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: '#151515',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ffffff06',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: TEAM_COLORS.gray,
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 4,
  },

  // Player row
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ffffff08',
  },
  playerRowSelected: {
    backgroundColor: TEAM_COLORS.secondary + '18',
    borderColor: TEAM_COLORS.secondary + '60',
    borderWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  playerRowSwapTarget: {
    backgroundColor: '#ffffff06',
  },
  playerRowBench: {
    opacity: 0.8,
  },

  // Jersey tap zone
  jerseyTap: {
    justifyContent: 'center',
  },

  // Jersey circle
  jerseyCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ffffff0A',
  },
  jerseyCircleSelected: {
    backgroundColor: TEAM_COLORS.secondary,
    borderColor: TEAM_COLORS.secondary,
  },
  jerseyCircleSwapTarget: {
    borderWidth: 1.5,
    borderColor: '#ffffff25',
    backgroundColor: '#1a1a1a',
  },
  jerseyNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e0e0e0',
  },

  // Player info
  playerInfo: {
    flex: 1,
    marginRight: 10,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f0f0f0',
    letterSpacing: -0.2,
  },
  playerMeta: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },

  // Swap arrow (shown on target rows)
  swapArrow: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapArrowText: {
    fontSize: 20,
    color: TEAM_COLORS.secondary,
  },

  // KR block
  krBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: 24,
    marginBottom: 12,
    backgroundColor: '#151515',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: Spacing.xl,
    gap: 0,
    borderWidth: 1,
    borderColor: '#ffffff08',
  },
  krMain: {
    alignItems: 'center',
    flex: 1,
  },
  krMainLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666',
    letterSpacing: 1.5,
  },
  krMainValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#f5f5f5',
    marginTop: 4,
  },
  krBlockDivider: {
    width: 1,
    height: 44,
    backgroundColor: '#ffffff0C',
  },
  krSub: {
    alignItems: 'center',
    flex: 1,
  },
  krSubLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666',
    letterSpacing: 1.5,
  },
  krSubValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#d0d0d0',
    marginTop: 4,
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: 22,
    marginBottom: 14,
    gap: 14,
  },
  sectionDividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#ffffff10',
  },
  sectionDividerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#555',
    letterSpacing: 2,
  },

  // Lineup strip
  lineupStrip: {
    marginHorizontal: Spacing.lg,
    marginTop: 10,
    marginBottom: 24,
    backgroundColor: '#1a1a1a',
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },
  top3Row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 12,
  },
  top3Item: {
    alignItems: 'center',
    width: 64,
  },
  top3Avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  top3AvatarFirst: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TEAM_COLORS.secondary,
  },
  top3Name: {
    fontSize: 10,
    fontWeight: '600',
    color: TEAM_COLORS.gray,
    textAlign: 'center',
  },
  top3NameFirst: {
    color: '#f5f5f5',
    fontWeight: '700',
  },
  top3KR: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f5f5f5',
    marginTop: 1,
  },
  top3KRFirst: {
    fontSize: 20,
  },
  spotlightLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: TEAM_COLORS.secondary,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginTop: 4,
    marginBottom: -4,
  },
  driverRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  driverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: BorderRadius.sm,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  driverPillSpotlight: {
    backgroundColor: TEAM_COLORS.secondary + '18',
    borderWidth: 1,
    borderColor: TEAM_COLORS.secondary + '30',
  },
  driverLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: TEAM_COLORS.gray,
  },
  driverValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f5f5f5',
  },

  // Keys to the Game
  keysCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: '#151515',
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#ffffff06',
  },
  keysTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#666',
    marginBottom: 12,
  },
  keysRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  keysNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 0,
    borderWidth: 1,
    borderColor: '#ffffff0A',
  },
  keysNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#e0e0e0',
  },
  keysText: {
    fontSize: 13,
    color: '#aaa',
    flex: 1,
    lineHeight: 19,
  },

  // Lineup Lens
  lensRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: 10,
    marginBottom: 4,
    gap: 8,
  },
  kanextLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#555',
    letterSpacing: 1.2,
  },
  lensPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1e1e1e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffffff08',
  },
  lensPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ccc',
  },
  manualBadge: {
    backgroundColor: TEAM_COLORS.secondary + '25',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  manualBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: TEAM_COLORS.secondary,
    letterSpacing: 0.3,
  },
  resetLensText: {
    fontSize: 11,
    fontWeight: '600',
    color: TEAM_COLORS.secondary,
  },

  // Why Tags
  whyTagsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: 10,
    gap: 6,
    flexWrap: 'wrap',
  },
  whyTagChip: {
    backgroundColor: '#1e1e1e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  whyTagChipNeg: {
    backgroundColor: '#2a1515',
  },
  whyTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
  },
  whyTagTextNeg: {
    color: '#EF4444',
  },

  // Lens Dropdown
  lensOverlay: {
    flex: 1,
  },
  lensDropdown: {
    position: 'absolute',
    backgroundColor: '#2a2a2a',
    borderRadius: 14,
    paddingVertical: 8,
    minWidth: 200,
    maxWidth: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  lensSectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#555',
    letterSpacing: 1.5,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
  },
  lensItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  lensItemActive: {
    backgroundColor: '#ffffff08',
  },
  lensItemText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#aaa',
  },
  lensItemTextActive: {
    color: '#f5f5f5',
    fontWeight: '700',
  },
  lensCheckmark: {
    fontSize: 14,
    fontWeight: '700',
    color: TEAM_COLORS.secondary,
  },
});
