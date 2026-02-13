/**
 * Depth Chart Units View (V1)
 * System-aware depth chart with Fit KR, swap interaction, and lineup rating strip.
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

import { Spacing, BorderRadius } from '@/constants/theme';
import { TEAM_COLORS, PLAYER_CLUSTERS } from '@/data/roster-data';
import type { ClusterRatings } from '@/data/roster-data';
import { ARCHETYPE_LABELS } from '@/data/system-demand-profiles';
import type { Archetype } from '@/data/system-demand-profiles';
import {
  OFFENSIVE_STYLES,
  DEFENSIVE_STYLES,
  OFFENSIVE_STYLE_CLUSTERS,
  DEFENSIVE_STYLE_CLUSTERS,
  CLUSTER_LABELS,
} from '@/data/mock-program-context';
import type { OffensiveStyle, DefensiveStyle, ClusterType } from '@/types';
import { computeFitKR, computeLineupRating, getClusterDrivers, getFitReasons } from '@/utils/fit-kr';
import { PlayerSheet } from './player-sheet';

const { height: WINDOW_H } = Dimensions.get('window');

// Same storage key as program-context-section — keeps systems in sync
const PROGRAM_CONTEXT_KEY = 'kx:programContextSection:v3';

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

// ── Fit KR Badge ──

function FitBadge({ baseKR, fitKR }: { baseKR: number; fitKR: number }) {
  const delta = fitKR - baseKR;
  const deltaColor = delta > 0 ? '#4CAF50' : delta < 0 ? '#EF4444' : TEAM_COLORS.gray;
  const deltaText = delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '—';

  return (
    <View style={badgeStyles.container}>
      <Text style={badgeStyles.fitValue}>{fitKR}</Text>
      <Text style={[badgeStyles.delta, { color: deltaColor }]}>{deltaText}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    minWidth: 40,
  },
  fitValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f5f5f5',
  },
  delta: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
});

// ── Player Row ──

function PlayerRow({
  slot,
  fitKR,
  isSelected,
  isSwapTarget,
  isStarter,
  onPress,
  onLongPress,
  onNamePress,
}: {
  slot: DepthSlot;
  fitKR: number;
  isSelected: boolean;
  isSwapTarget: boolean;
  isStarter: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onNamePress: () => void;
}) {
  const primaryArchetype = slot.archetypes.length > 0
    ? ARCHETYPE_LABELS[slot.archetypes[0]] ?? slot.archetypes[0]
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
          <Text style={[styles.jerseyNumber, isSelected && { color: '#111' }]}>{slot.playerNumber}</Text>
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
          {slot.positionGroup}
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
        ) : (
          <FitBadge baseKR={slot.baseKR} fitKR={fitKR} />
        )}
      </Pressable>
    </View>
  );
}

// ── System Picker Pill ──

function SystemPicker({
  label,
  savedValue,
  tempValue,
  options,
  onTempChange,
  onSave,
}: {
  label: string;
  savedValue: string;
  tempValue: string | null;
  options: { value: string; label: string }[];
  onTempChange: (value: string) => void;
  onSave: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pillY, setPillY] = useState(0);
  const [pillH, setPillH] = useState(0);
  const [pillX, setPillX] = useState(0);
  const pillRef = useRef<View>(null);
  const savedLabel = options.find((o) => o.value === savedValue)?.label ?? savedValue;
  const tempLabel = tempValue ? (options.find((o) => o.value === tempValue)?.label ?? tempValue) : null;
  const hasOverride = tempValue != null && tempValue !== savedValue;

  const handlePress = () => {
    // Tap → open dropdown
    (pillRef.current as any)?.measureInWindow((x: number, y: number, _w: number, h: number) => {
      setPillX(x);
      setPillY(y);
      setPillH(h);
      setOpen(true);
    });
  };

  const handleLongPress = () => {
    if (hasOverride) {
      // Hold → save temp as new locked system
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSave();
    }
  };

  return (
    <>
      <Pressable
        ref={pillRef as any}
        style={({ pressed }) => [
          styles.systemPill,
          hasOverride && styles.systemPillOverride,
          { opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={400}
      >
        {/* Saved (locked) label */}
        <Text style={styles.systemLabel}>{label}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.systemValue, hasOverride && styles.systemValueSaved]} numberOfLines={1}>
            {savedLabel}
          </Text>
          {hasOverride && (
            <Text style={styles.systemValueTemp} numberOfLines={1}>
              {tempLabel}
            </Text>
          )}
        </View>
        {hasOverride ? (
          <Text style={styles.systemSaveHint}>HOLD</Text>
        ) : (
          <Text style={styles.chevron}>{'\u25BE'}</Text>
        )}
      </Pressable>

      {open && (
        <Modal visible transparent animationType="none" onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.dropdownOverlay} onPress={() => setOpen(false)}>
            <View style={[styles.dropdown, { top: pillY + pillH + 4, left: Math.min(pillX, 200) }]}>
              {options.map((opt) => {
                const isSaved = opt.value === savedValue;
                const isTemp = opt.value === tempValue;
                return (
                  <Pressable
                    key={opt.value}
                    style={[styles.dropdownItem, (isTemp || (!tempValue && isSaved)) && { backgroundColor: TEAM_COLORS.accent }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onTempChange(opt.value);
                      setOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        (isTemp || (!tempValue && isSaved)) && { color: TEAM_COLORS.background, fontWeight: '700' },
                      ]}
                      numberOfLines={1}
                    >
                      {opt.label}
                      {isSaved && tempValue && tempValue !== savedValue ? ' (saved)' : ''}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

// ── Main Component ──

export function UnitsView({
  depthChart,
}: {
  depthChart: DepthChartPosition[];
}) {
  const router = useRouter();

  // System state — saved (locked, from program context) + temp (exploratory override)
  const [savedOff, setSavedOff] = useState<OffensiveStyle>('motion_read_react');
  const [savedDef, setSavedDef] = useState<DefensiveStyle>('containment_man');
  const [tempOff, setTempOff] = useState<OffensiveStyle | null>(null);
  const [tempDef, setTempDef] = useState<DefensiveStyle | null>(null);

  // Active system = temp if set, otherwise saved
  const offStyle = tempOff ?? savedOff;
  const defStyle = tempDef ?? savedDef;

  // Load saved systems from program context (AsyncStorage)
  useEffect(() => {
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

  // Depth chart slots
  const initialSlots = useMemo(() => initSlots(depthChart), [depthChart]);
  const [starters, setStarters] = useState<DepthSlot[]>(initialSlots.starters);
  const [bench, setBench] = useState<DepthSlot[]>(initialSlots.bench);

  // Swap state
  const [selectedForSwap, setSelectedForSwap] = useState<string | null>(null);

  // Player sheet state
  const [sheetPlayer, setSheetPlayer] = useState<string | null>(null);

  // Compute Fit KRs for all players
  const fitKRs = useMemo(() => {
    const map: Record<string, number> = {};
    const allSlots = [...starters, ...bench];
    for (const slot of allSlots) {
      const clusters = PLAYER_CLUSTERS[slot.playerNumber];
      if (clusters) {
        map[slot.playerNumber] = computeFitKR(clusters, offStyle, defStyle);
      } else {
        map[slot.playerNumber] = slot.baseKR;
      }
    }
    return map;
  }, [starters, bench, offStyle, defStyle]);

  // Lineup rating
  const lineupRating = useMemo(() => {
    const starterClusters = starters
      .map((s) => PLAYER_CLUSTERS[s.playerNumber])
      .filter(Boolean) as ClusterRatings[];
    const mins = starters.map((s) => s.minutes);
    return computeLineupRating(starterClusters, offStyle, defStyle, mins);
  }, [starters, offStyle, defStyle]);

  // Top 3 cluster drivers
  const drivers = useMemo(() => {
    const starterClusters = starters
      .map((s) => PLAYER_CLUSTERS[s.playerNumber])
      .filter(Boolean) as ClusterRatings[];
    return getClusterDrivers(starterClusters);
  }, [starters]);

  // Swap logic
  const handleSwap = (targetNumber: string) => {
    if (!selectedForSwap || selectedForSwap === targetNumber) {
      setSelectedForSwap(null);
      return;
    }

    const srcInStarters = starters.findIndex((s) => s.playerNumber === selectedForSwap);
    const srcInBench = bench.findIndex((s) => s.playerNumber === selectedForSwap);
    const tgtInStarters = starters.findIndex((s) => s.playerNumber === targetNumber);
    const tgtInBench = bench.findIndex((s) => s.playerNumber === targetNumber);

    const newStarters = [...starters];
    const newBench = [...bench];

    if (srcInStarters >= 0 && tgtInStarters >= 0) {
      // Starter <-> Starter
      const tmp = newStarters[srcInStarters];
      newStarters[srcInStarters] = { ...newStarters[tgtInStarters], positionGroup: tmp.positionGroup };
      newStarters[tgtInStarters] = { ...tmp, positionGroup: newStarters[tgtInStarters].positionGroup };
    } else if (srcInStarters >= 0 && tgtInBench >= 0) {
      // Starter <-> Bench
      const starterSlot = newStarters[srcInStarters];
      const benchSlot = newBench[tgtInBench];
      newStarters[srcInStarters] = { ...benchSlot, positionGroup: starterSlot.positionGroup };
      newBench[tgtInBench] = { ...starterSlot, positionGroup: benchSlot.positionGroup };
    } else if (srcInBench >= 0 && tgtInStarters >= 0) {
      // Bench <-> Starter
      const benchSlot = newBench[srcInBench];
      const starterSlot = newStarters[tgtInStarters];
      newStarters[tgtInStarters] = { ...benchSlot, positionGroup: starterSlot.positionGroup };
      newBench[srcInBench] = { ...starterSlot, positionGroup: benchSlot.positionGroup };
    } else if (srcInBench >= 0 && tgtInBench >= 0) {
      // Bench <-> Bench
      const tmp = newBench[srcInBench];
      newBench[srcInBench] = newBench[tgtInBench];
      newBench[tgtInBench] = tmp;
    }

    setStarters(newStarters);
    setBench(newBench);
    setSelectedForSwap(null);
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
    setSelectedForSwap(null);
    setSheetPlayer(playerNumber);
  };

  // Find slot data for player sheet
  const sheetSlot = sheetPlayer
    ? [...starters, ...bench].find((s) => s.playerNumber === sheetPlayer) ?? null
    : null;

  return (
    <View style={styles.container}>
      {/* System Picker Row */}
      <View style={styles.systemRow}>
        <SystemPicker
          label="OFF"
          savedValue={savedOff}
          tempValue={tempOff}
          options={OFFENSIVE_STYLES as { value: string; label: string }[]}
          onTempChange={(v) => setTempOff(v === savedOff ? null : v as OffensiveStyle)}
          onSave={() => {
            const newOff = offStyle;
            setSavedOff(newOff);
            setTempOff(null);
            saveSystemToContext(newOff, savedDef);
          }}
        />
        <SystemPicker
          label="DEF"
          savedValue={savedDef}
          tempValue={tempDef}
          options={DEFENSIVE_STYLES as { value: string; label: string }[]}
          onTempChange={(v) => setTempDef(v === savedDef ? null : v as DefensiveStyle)}
          onSave={() => {
            const newDef = defStyle;
            setSavedDef(newDef);
            setTempDef(null);
            saveSystemToContext(savedOff, newDef);
          }}
        />
      </View>

      {/* Starters Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>STARTERS</Text>
        {starters.map((slot) => (
          <PlayerRow
            key={slot.playerNumber}
            slot={slot}
            fitKR={fitKRs[slot.playerNumber] ?? slot.baseKR}
            isSelected={selectedForSwap === slot.playerNumber}
            isSwapTarget={!!selectedForSwap && selectedForSwap !== slot.playerNumber}
            isStarter
            onPress={() => handleRowPress(slot.playerNumber)}
            onLongPress={() => handleRowLongPress(slot.playerNumber)}
            onNamePress={() => router.push({ pathname: '/coach/player-bio', params: { number: slot.playerNumber } })}
          />
        ))}
      </View>

      {/* Lineup Rating Strip */}
      <View style={styles.lineupStrip}>
        <View style={styles.lineupRatings}>
          <View style={styles.lineupStat}>
            <Text style={styles.lineupStatLabel}>OFF</Text>
            <Text style={styles.lineupStatValue}>{lineupRating.offKR}</Text>
          </View>
          <View style={styles.lineupDot} />
          <View style={styles.lineupStat}>
            <Text style={styles.lineupStatLabel}>DEF</Text>
            <Text style={styles.lineupStatValue}>{lineupRating.defKR}</Text>
          </View>
          <View style={styles.lineupDot} />
          <View style={styles.lineupStat}>
            <Text style={styles.lineupStatLabel}>NET</Text>
            <Text style={[
              styles.lineupStatValue,
              { color: lineupRating.netKR > 0 ? '#4CAF50' : lineupRating.netKR < 0 ? '#EF4444' : '#f5f5f5' },
            ]}>
              {lineupRating.netKR > 0 ? '+' : ''}{lineupRating.netKR}
            </Text>
          </View>
        </View>

        {/* Cluster drivers */}
        <View style={styles.driverRow}>
          {drivers.map((d) => (
            <View key={d.cluster} style={styles.driverPill}>
              <Text style={styles.driverLabel}>{d.label}</Text>
              <Text style={styles.driverValue}>{d.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bench Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>BENCH</Text>
        {bench.map((slot) => (
          <PlayerRow
            key={slot.playerNumber}
            slot={slot}
            fitKR={fitKRs[slot.playerNumber] ?? slot.baseKR}
            isSelected={selectedForSwap === slot.playerNumber}
            isSwapTarget={!!selectedForSwap && selectedForSwap !== slot.playerNumber}
            isStarter={false}
            onPress={() => handleRowPress(slot.playerNumber)}
            onLongPress={() => handleRowLongPress(slot.playerNumber)}
            onNamePress={() => router.push({ pathname: '/coach/player-bio', params: { number: slot.playerNumber } })}
          />
        ))}
      </View>

      {/* Player Detail Sheet */}
      <PlayerSheet
        visible={!!sheetPlayer}
        onClose={() => setSheetPlayer(null)}
        slot={sheetSlot}
        fitKR={sheetPlayer ? (fitKRs[sheetPlayer] ?? 0) : 0}
        offStyle={offStyle}
        defStyle={defStyle}
      />
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.sm,
  },

  // System picker
  systemRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  systemPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 6,
  },
  systemPillOverride: {
    borderWidth: 1,
    borderColor: TEAM_COLORS.secondary + '40',
    paddingVertical: 6,
  },
  systemLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: TEAM_COLORS.gray,
    letterSpacing: 0.5,
  },
  systemValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  systemValueSaved: {
    fontSize: 10,
    color: TEAM_COLORS.gray,
  },
  systemValueTemp: {
    fontSize: 12,
    fontWeight: '600',
    color: TEAM_COLORS.secondary,
    marginTop: 2,
  },
  systemSaveHint: {
    fontSize: 9,
    fontWeight: '700',
    color: TEAM_COLORS.secondary,
    backgroundColor: TEAM_COLORS.secondary + '20',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    overflow: 'hidden',
  },
  chevron: {
    fontSize: 10,
    color: TEAM_COLORS.gray,
  },

  // Dropdown
  dropdownOverlay: {
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    paddingVertical: 2,
    minWidth: 180,
    maxHeight: WINDOW_H * 0.4,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  dropdownText: {
    fontSize: 13,
    fontWeight: '500',
    color: TEAM_COLORS.gray,
  },

  // Section card
  sectionCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: '#1a1a1a',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
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
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2a2a2a',
  },
  playerRowSelected: {
    backgroundColor: TEAM_COLORS.secondary + '20',
    borderColor: TEAM_COLORS.secondary,
    borderWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  playerRowSwapTarget: {
    backgroundColor: '#ffffff08',
  },
  playerRowBench: {
    opacity: 0.85,
  },

  // Jersey tap zone
  jerseyTap: {
    justifyContent: 'center',
  },

  // Jersey circle
  jerseyCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  jerseyCircleSelected: {
    backgroundColor: TEAM_COLORS.secondary,
  },
  jerseyCircleSwapTarget: {
    borderWidth: 1,
    borderColor: '#ffffff30',
  },
  jerseyNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f5f5f5',
  },

  // Player info
  playerInfo: {
    flex: 1,
    marginRight: 8,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  playerMeta: {
    fontSize: 11,
    color: TEAM_COLORS.gray,
    marginTop: 1,
  },

  // Swap arrow (shown on target rows)
  swapArrow: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapArrowText: {
    fontSize: 18,
    color: TEAM_COLORS.secondary,
  },

  // Lineup strip
  lineupStrip: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: '#1a1a1a',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  lineupRatings: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  lineupStat: {
    alignItems: 'center',
  },
  lineupStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: TEAM_COLORS.gray,
    letterSpacing: 0.5,
  },
  lineupStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f5f5f5',
    marginTop: 2,
  },
  lineupDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: TEAM_COLORS.gray,
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
});
