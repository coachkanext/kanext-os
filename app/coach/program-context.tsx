/**
 * Coach Program Context Screen
 * Canonical Program Context editor per KaNeXT spec.
 *
 * EVALUATION EMPHASIS: Side-locked 7-cluster system.
 * - OFFENSE (Shooting, Finishing, Playmaking): must total 58.0
 * - DEFENSE (On-Ball Defense, Team Defense, Rebounding, Physical): must total 42.0
 * Grand total always = 100.0
 *
 * Presets are side-isolated: changing offensive preset updates only offense clusters.
 * Slider edits rebalance only within their own side.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// =============================================================================
// CONSTANTS
// =============================================================================

const STORAGE_KEY = 'kx:programContext';

// Side totals (locked)
const OFF_TOTAL = 58;
const DEF_TOTAL = 42;
const MIN_VALUE = 1.0; // Floor to prevent zeros

// Offense clusters (3 sliders, must sum to 58)
const OFFENSE_CLUSTERS = [
  { id: 'shooting', label: 'Shooting' },
  { id: 'finishing', label: 'Finishing' },
  { id: 'playmaking', label: 'Playmaking' },
] as const;

// Defense clusters (4 sliders, must sum to 42)
const DEFENSE_CLUSTERS = [
  { id: 'onBallDefense', label: 'On-Ball Defense' },
  { id: 'teamDefense', label: 'Team Defense' },
  { id: 'rebounding', label: 'Rebounding' },
  { id: 'physical', label: 'Physical' },
] as const;

type OffenseClusterId = typeof OFFENSE_CLUSTERS[number]['id'];
type DefenseClusterId = typeof DEFENSE_CLUSTERS[number]['id'];

// Offensive System presets (raw weights, will be rescaled to sum to 58)
const OFFENSIVE_SYSTEMS = [
  { id: 'spread-pnr', label: 'Spread Pick-and-Roll', weights: { shooting: 30, finishing: 25, playmaking: 30 } },
  { id: '5-out', label: '5-Out Motion', weights: { shooting: 35, finishing: 20, playmaking: 30 } },
  { id: 'pace-space', label: 'Pace & Space', weights: { shooting: 40, finishing: 20, playmaking: 25 } },
  { id: 'motion', label: 'Motion / Read & React', weights: { shooting: 25, finishing: 20, playmaking: 35 } },
  { id: 'dribble-drive', label: 'Dribble Drive', weights: { shooting: 20, finishing: 35, playmaking: 25 } },
  { id: 'princeton', label: 'Princeton', weights: { shooting: 20, finishing: 20, playmaking: 40 } },
  { id: 'post-centric', label: 'Post-Centric / Inside-Out', weights: { shooting: 20, finishing: 35, playmaking: 20 } },
  { id: 'moreyball', label: 'Moreyball', weights: { shooting: 45, finishing: 25, playmaking: 20 } },
  { id: 'heliocentric', label: 'Heliocentric', weights: { shooting: 30, finishing: 25, playmaking: 35 } },
];

// Defensive System presets (raw weights, will be rescaled to sum to 42)
const DEFENSIVE_SYSTEMS = [
  { id: 'containment', label: 'Containment Man', weights: { onBallDefense: 35, teamDefense: 30, rebounding: 20, physical: 15 } },
  { id: 'pack-line', label: 'Pack Line', weights: { onBallDefense: 25, teamDefense: 40, rebounding: 20, physical: 15 } },
  { id: 'pressure-man', label: 'Pressure Man / Denial', weights: { onBallDefense: 45, teamDefense: 20, rebounding: 15, physical: 20 } },
  { id: 'switch', label: 'Switch Everything', weights: { onBallDefense: 30, teamDefense: 30, rebounding: 20, physical: 20 } },
  { id: 'ice', label: 'ICE / No-Middle', weights: { onBallDefense: 35, teamDefense: 35, rebounding: 20, physical: 10 } },
  { id: 'zone', label: 'Zone (Structured)', weights: { onBallDefense: 15, teamDefense: 45, rebounding: 25, physical: 15 } },
  { id: 'matchup-zone', label: 'Matchup Zone / Hybrid', weights: { onBallDefense: 20, teamDefense: 40, rebounding: 25, physical: 15 } },
  { id: 'press', label: 'Press / Pressure Defense', weights: { onBallDefense: 40, teamDefense: 20, rebounding: 15, physical: 25 } },
];

const TEMPO_OPTIONS = ['Slow', 'Medium', 'Fast'];
const PRIMARY_ENGINE_POSITIONS = ['PG', 'CG', 'Wing', 'Forward', 'Big'];

// =============================================================================
// TYPES
// =============================================================================

interface OffenseEmphasis {
  shooting: number;
  finishing: number;
  playmaking: number;
}

interface DefenseEmphasis {
  onBallDefense: number;
  teamDefense: number;
  rebounding: number;
  physical: number;
}

interface EmphasisProfile extends OffenseEmphasis, DefenseEmphasis {}

interface ProgramContextState {
  scholarships: number;
  nilBudget: number;
  offensiveSystem: string;
  defensiveSystem: string;
  tempo: string;
  primaryEnginePosition: string;
  emphasis: EmphasisProfile;
}

// =============================================================================
// PRESET SCALING FUNCTIONS
// =============================================================================

/**
 * Rescale offense preset weights to sum to OFF_TOTAL (58)
 */
function getScaledOffenseWeights(systemId: string): OffenseEmphasis {
  const system = OFFENSIVE_SYSTEMS.find((s) => s.id === systemId) ?? OFFENSIVE_SYSTEMS[0];
  const raw = system.weights;
  const rawSum = raw.shooting + raw.finishing + raw.playmaking;
  const scale = OFF_TOTAL / rawSum;

  const scaled = {
    shooting: Math.round(raw.shooting * scale * 10) / 10,
    finishing: Math.round(raw.finishing * scale * 10) / 10,
    playmaking: Math.round(raw.playmaking * scale * 10) / 10,
  };

  // Adjust to ensure exact sum
  const sum = scaled.shooting + scaled.finishing + scaled.playmaking;
  const diff = Math.round((OFF_TOTAL - sum) * 10) / 10;
  scaled.playmaking = Math.round((scaled.playmaking + diff) * 10) / 10;

  return scaled;
}

/**
 * Rescale defense preset weights to sum to DEF_TOTAL (42)
 */
function getScaledDefenseWeights(systemId: string): DefenseEmphasis {
  const system = DEFENSIVE_SYSTEMS.find((s) => s.id === systemId) ?? DEFENSIVE_SYSTEMS[0];
  const raw = system.weights;
  const rawSum = raw.onBallDefense + raw.teamDefense + raw.rebounding + raw.physical;
  const scale = DEF_TOTAL / rawSum;

  const scaled = {
    onBallDefense: Math.round(raw.onBallDefense * scale * 10) / 10,
    teamDefense: Math.round(raw.teamDefense * scale * 10) / 10,
    rebounding: Math.round(raw.rebounding * scale * 10) / 10,
    physical: Math.round(raw.physical * scale * 10) / 10,
  };

  // Adjust to ensure exact sum
  const sum = scaled.onBallDefense + scaled.teamDefense + scaled.rebounding + scaled.physical;
  const diff = Math.round((DEF_TOTAL - sum) * 10) / 10;
  scaled.physical = Math.round((scaled.physical + diff) * 10) / 10;

  return scaled;
}

function getDefaultEmphasis(offSystemId: string, defSystemId: string): EmphasisProfile {
  return {
    ...getScaledOffenseWeights(offSystemId),
    ...getScaledDefenseWeights(defSystemId),
  };
}

function getDefaultState(): ProgramContextState {
  return {
    scholarships: 13,
    nilBudget: 150000,
    offensiveSystem: 'spread-pnr',
    defensiveSystem: 'pressure-man',
    tempo: 'Fast',
    primaryEnginePosition: 'PG',
    emphasis: getDefaultEmphasis('spread-pnr', 'pressure-man'),
  };
}

// =============================================================================
// SIDE-LOCKED REBALANCING
// =============================================================================

/**
 * Rebalance offense sliders when one changes, keeping total = OFF_TOTAL
 */
function rebalanceOffense(
  current: OffenseEmphasis,
  changedKey: OffenseClusterId,
  newValue: number
): OffenseEmphasis {
  const target = OFF_TOTAL;
  const keys: OffenseClusterId[] = ['shooting', 'finishing', 'playmaking'];
  const others = keys.filter((k) => k !== changedKey);

  // Clamp the changed value
  const maxAllowed = target - MIN_VALUE * others.length;
  const clampedValue = Math.max(MIN_VALUE, Math.min(maxAllowed, newValue));

  const desiredOtherSum = target - clampedValue;
  const currentOtherSum = others.reduce((sum, k) => sum + current[k], 0);

  const result = { ...current, [changedKey]: clampedValue };

  if (currentOtherSum > 0) {
    // Distribute proportionally
    let runningSum = clampedValue;
    others.forEach((k, i) => {
      if (i === others.length - 1) {
        // Last one gets the remainder
        result[k] = Math.round((target - runningSum) * 10) / 10;
      } else {
        const proportion = current[k] / currentOtherSum;
        const rawVal = desiredOtherSum * proportion;
        result[k] = Math.max(MIN_VALUE, Math.round(rawVal * 10) / 10);
        runningSum += result[k];
      }
    });
  } else {
    // Distribute evenly
    const evenShare = Math.round((desiredOtherSum / others.length) * 10) / 10;
    others.forEach((k) => {
      result[k] = Math.max(MIN_VALUE, evenShare);
    });
  }

  // Final normalization pass to ensure exact sum
  return normalizeOffense(result);
}

/**
 * Normalize offense values to sum exactly to OFF_TOTAL
 */
function normalizeOffense(emphasis: OffenseEmphasis): OffenseEmphasis {
  const keys: OffenseClusterId[] = ['shooting', 'finishing', 'playmaking'];
  const sum = keys.reduce((s, k) => s + emphasis[k], 0);
  const diff = Math.round((OFF_TOTAL - sum) * 10) / 10;

  if (Math.abs(diff) < 0.01) return emphasis;

  // Add/subtract from the largest value
  const result = { ...emphasis };
  const sorted = [...keys].sort((a, b) => result[b] - result[a]);
  result[sorted[0]] = Math.round((result[sorted[0]] + diff) * 10) / 10;

  return result;
}

/**
 * Rebalance defense sliders when one changes, keeping total = DEF_TOTAL
 */
function rebalanceDefense(
  current: DefenseEmphasis,
  changedKey: DefenseClusterId,
  newValue: number
): DefenseEmphasis {
  const target = DEF_TOTAL;
  const keys: DefenseClusterId[] = ['onBallDefense', 'teamDefense', 'rebounding', 'physical'];
  const others = keys.filter((k) => k !== changedKey);

  // Clamp the changed value
  const maxAllowed = target - MIN_VALUE * others.length;
  const clampedValue = Math.max(MIN_VALUE, Math.min(maxAllowed, newValue));

  const desiredOtherSum = target - clampedValue;
  const currentOtherSum = others.reduce((sum, k) => sum + current[k], 0);

  const result = { ...current, [changedKey]: clampedValue };

  if (currentOtherSum > 0) {
    // Distribute proportionally
    let runningSum = clampedValue;
    others.forEach((k, i) => {
      if (i === others.length - 1) {
        // Last one gets the remainder
        result[k] = Math.round((target - runningSum) * 10) / 10;
      } else {
        const proportion = current[k] / currentOtherSum;
        const rawVal = desiredOtherSum * proportion;
        result[k] = Math.max(MIN_VALUE, Math.round(rawVal * 10) / 10);
        runningSum += result[k];
      }
    });
  } else {
    // Distribute evenly
    const evenShare = Math.round((desiredOtherSum / others.length) * 10) / 10;
    others.forEach((k) => {
      result[k] = Math.max(MIN_VALUE, evenShare);
    });
  }

  // Final normalization pass to ensure exact sum
  return normalizeDefense(result);
}

/**
 * Normalize defense values to sum exactly to DEF_TOTAL
 */
function normalizeDefense(emphasis: DefenseEmphasis): DefenseEmphasis {
  const keys: DefenseClusterId[] = ['onBallDefense', 'teamDefense', 'rebounding', 'physical'];
  const sum = keys.reduce((s, k) => s + emphasis[k], 0);
  const diff = Math.round((DEF_TOTAL - sum) * 10) / 10;

  if (Math.abs(diff) < 0.01) return emphasis;

  // Add/subtract from the largest value
  const result = { ...emphasis };
  const sorted = [...keys].sort((a, b) => result[b] - result[a]);
  result[sorted[0]] = Math.round((result[sorted[0]] + diff) * 10) / 10;

  return result;
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function CoachProgramContextScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [state, setState] = useState<ProgramContextState>(getDefaultState);
  const [showOffensivePicker, setShowOffensivePicker] = useState(false);
  const [showDefensivePicker, setShowDefensivePicker] = useState(false);
  const [showTempoPicker, setShowTempoPicker] = useState(false);
  const [showEnginePicker, setShowEnginePicker] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Migrate from old formats
          if (!parsed.emphasis || parsed.emphasis.shooting === undefined) {
            const emphasis = getDefaultEmphasis(
              parsed.offensiveSystem || 'spread-pnr',
              parsed.defensiveSystem || 'pressure-man'
            );
            setState({ ...getDefaultState(), ...parsed, emphasis });
          } else {
            setState({ ...getDefaultState(), ...parsed });
          }
        }
      } catch (e) {
        console.error('Failed to load program context:', e);
      }
    };
    loadState();
  }, []);

  // Calculate totals
  const offTotal = useMemo(() => {
    const { shooting, finishing, playmaking } = state.emphasis;
    return Math.round((shooting + finishing + playmaking) * 10) / 10;
  }, [state.emphasis]);

  const defTotal = useMemo(() => {
    const { onBallDefense, teamDefense, rebounding, physical } = state.emphasis;
    return Math.round((onBallDefense + teamDefense + rebounding + physical) * 10) / 10;
  }, [state.emphasis]);

  const grandTotal = Math.round((offTotal + defTotal) * 10) / 10;

  // Format currency for display
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Handle offensive system selection - updates ONLY offense clusters
  const handleOffensiveSystemSelect = useCallback((systemId: string) => {
    setState((prev) => {
      const newOffense = getScaledOffenseWeights(systemId);
      return {
        ...prev,
        offensiveSystem: systemId,
        emphasis: {
          ...prev.emphasis,
          ...newOffense,
        },
      };
    });
    setShowOffensivePicker(false);
  }, []);

  // Handle defensive system selection - updates ONLY defense clusters
  const handleDefensiveSystemSelect = useCallback((systemId: string) => {
    setState((prev) => {
      const newDefense = getScaledDefenseWeights(systemId);
      return {
        ...prev,
        defensiveSystem: systemId,
        emphasis: {
          ...prev.emphasis,
          ...newDefense,
        },
      };
    });
    setShowDefensivePicker(false);
  }, []);

  // Handle offense slider change
  const handleOffenseSliderChange = useCallback((clusterId: OffenseClusterId, newValue: number) => {
    setState((prev) => {
      const currentOffense: OffenseEmphasis = {
        shooting: prev.emphasis.shooting,
        finishing: prev.emphasis.finishing,
        playmaking: prev.emphasis.playmaking,
      };
      const rebalanced = rebalanceOffense(currentOffense, clusterId, newValue);
      return {
        ...prev,
        emphasis: {
          ...prev.emphasis,
          ...rebalanced,
        },
      };
    });
  }, []);

  // Handle defense slider change
  const handleDefenseSliderChange = useCallback((clusterId: DefenseClusterId, newValue: number) => {
    setState((prev) => {
      const currentDefense: DefenseEmphasis = {
        onBallDefense: prev.emphasis.onBallDefense,
        teamDefense: prev.emphasis.teamDefense,
        rebounding: prev.emphasis.rebounding,
        physical: prev.emphasis.physical,
      };
      const rebalanced = rebalanceDefense(currentDefense, clusterId, newValue);
      return {
        ...prev,
        emphasis: {
          ...prev.emphasis,
          ...rebalanced,
        },
      };
    });
  }, []);

  // Handle save
  const handleSave = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e) {
      console.error('Failed to save program context:', e);
    }
  };

  const offensiveSystemLabel =
    OFFENSIVE_SYSTEMS.find((s) => s.id === state.offensiveSystem)?.label || 'Select';
  const defensiveSystemLabel =
    DEFENSIVE_SYSTEMS.find((s) => s.id === state.defensiveSystem)?.label || 'Select';
  const isHeliocentric = state.offensiveSystem === 'heliocentric';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, backgroundColor: colors.background, borderBottomColor: colors.divider },
        ]}
      >
        <View style={styles.headerContent}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: pressed ? colors.backgroundSecondary : 'transparent' },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <IconSymbol name="chevron.left" size={20} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Program Context</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ===== PROGRAM RESOURCES ===== */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PROGRAM RESOURCES</Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.inputRow}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Scholarships</Text>
              <TextInput
                style={[styles.numericInput, { color: colors.text, borderColor: colors.border }]}
                value={state.scholarships.toString()}
                onChangeText={(text) => {
                  const num = parseFloat(text) || 0;
                  setState((prev) => ({ ...prev, scholarships: num }));
                }}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <View style={styles.inputRow}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>NIL Budget</Text>
              <TextInput
                style={[styles.numericInput, { color: colors.text, borderColor: colors.border }]}
                value={state.nilBudget.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
                  setState((prev) => ({ ...prev, nilBudget: num }));
                }}
                keyboardType="number-pad"
                placeholder="$0"
                placeholderTextColor={colors.textTertiary}
              />
              <Text style={[styles.currencyPreview, { color: colors.textTertiary }]}>
                {formatCurrency(state.nilBudget)}
              </Text>
            </View>
          </View>

          {/* ===== SYSTEMS ===== */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SYSTEMS</Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            <Pressable
              style={styles.selectorRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowOffensivePicker(true);
              }}
            >
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Offensive System</Text>
              <View style={styles.selectorValue}>
                <Text style={[styles.selectorText, { color: colors.text }]}>{offensiveSystemLabel}</Text>
                <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
              </View>
            </Pressable>

            {isHeliocentric && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                <Pressable
                  style={styles.selectorRow}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowEnginePicker(true);
                  }}
                >
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Primary Engine Position</Text>
                  <View style={styles.selectorValue}>
                    <Text style={[styles.selectorText, { color: colors.text }]}>{state.primaryEnginePosition}</Text>
                    <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
                  </View>
                </Pressable>
              </>
            )}

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <Pressable
              style={styles.selectorRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowDefensivePicker(true);
              }}
            >
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Defensive System</Text>
              <View style={styles.selectorValue}>
                <Text style={[styles.selectorText, { color: colors.text }]}>{defensiveSystemLabel}</Text>
                <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
              </View>
            </Pressable>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <Pressable
              style={styles.selectorRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowTempoPicker(true);
              }}
            >
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Tempo</Text>
              <View style={styles.selectorValue}>
                <Text style={[styles.selectorText, { color: colors.text }]}>{state.tempo}</Text>
                <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
              </View>
            </Pressable>
          </View>

          {/* ===== EVALUATION EMPHASIS ===== */}
          <View style={styles.emphasisHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 0 }]}>
              EVALUATION EMPHASIS
            </Text>
          </View>
          <Text style={[styles.emphasisSubtitle, { color: colors.textTertiary }]}>
            OFF {OFF_TOTAL}% · DEF {DEF_TOTAL}%
          </Text>

          {/* OFFENSE SLIDERS */}
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={[styles.sideHeader, { borderBottomColor: colors.divider }]}>
              <Text style={[styles.sideHeaderLabel, { color: colors.text }]}>Offense</Text>
              <Text style={[styles.sideHeaderTotal, { color: offTotal === OFF_TOTAL ? colors.success : colors.error }]}>
                {offTotal.toFixed(1)} / {OFF_TOTAL}
              </Text>
            </View>
            {OFFENSE_CLUSTERS.map((cluster, index) => (
              <View key={cluster.id}>
                {index > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
                <View style={styles.sliderRow}>
                  <View style={styles.sliderHeader}>
                    <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>{cluster.label}</Text>
                    <Text style={[styles.sliderValue, { color: colors.text }]}>
                      {state.emphasis[cluster.id].toFixed(1)}
                    </Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={MIN_VALUE}
                    maximumValue={OFF_TOTAL - MIN_VALUE * (OFFENSE_CLUSTERS.length - 1)}
                    step={0.1}
                    value={state.emphasis[cluster.id]}
                    onValueChange={(value) => handleOffenseSliderChange(cluster.id, value)}
                    minimumTrackTintColor={colors.tint}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.tint}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* DEFENSE SLIDERS */}
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary, marginTop: Spacing.md }]}>
            <View style={[styles.sideHeader, { borderBottomColor: colors.divider }]}>
              <Text style={[styles.sideHeaderLabel, { color: colors.text }]}>Defense</Text>
              <Text style={[styles.sideHeaderTotal, { color: defTotal === DEF_TOTAL ? colors.success : colors.error }]}>
                {defTotal.toFixed(1)} / {DEF_TOTAL}
              </Text>
            </View>
            {DEFENSE_CLUSTERS.map((cluster, index) => (
              <View key={cluster.id}>
                {index > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
                <View style={styles.sliderRow}>
                  <View style={styles.sliderHeader}>
                    <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>{cluster.label}</Text>
                    <Text style={[styles.sliderValue, { color: colors.text }]}>
                      {state.emphasis[cluster.id].toFixed(1)}
                    </Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={MIN_VALUE}
                    maximumValue={DEF_TOTAL - MIN_VALUE * (DEFENSE_CLUSTERS.length - 1)}
                    step={0.1}
                    value={state.emphasis[cluster.id]}
                    onValueChange={(value) => handleDefenseSliderChange(cluster.id, value)}
                    minimumTrackTintColor={colors.tint}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.tint}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* GRAND TOTAL */}
          <View style={[styles.grandTotalRow, { borderColor: colors.border }]}>
            <Text style={[styles.grandTotalLabel, { color: colors.textSecondary }]}>Total</Text>
            <Text style={[styles.grandTotalValue, { color: grandTotal === 100 ? colors.success : colors.error }]}>
              {grandTotal.toFixed(1)} / 100
            </Text>
          </View>

          {/* Spacer for save button */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button (sticky) */}
      <View
        style={[
          styles.saveContainer,
          { backgroundColor: colors.background, paddingBottom: insets.bottom + Spacing.md, borderTopColor: colors.divider },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: pressed ? '#4F46E5' : colors.tint },
          ]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>

      {/* Modals */}
      <PickerModal
        visible={showOffensivePicker}
        title="Offensive System"
        options={OFFENSIVE_SYSTEMS.map((s) => ({ id: s.id, label: s.label }))}
        selected={state.offensiveSystem}
        onSelect={handleOffensiveSystemSelect}
        onClose={() => setShowOffensivePicker(false)}
        colors={colors}
      />
      <PickerModal
        visible={showDefensivePicker}
        title="Defensive System"
        options={DEFENSIVE_SYSTEMS.map((s) => ({ id: s.id, label: s.label }))}
        selected={state.defensiveSystem}
        onSelect={handleDefensiveSystemSelect}
        onClose={() => setShowDefensivePicker(false)}
        colors={colors}
      />
      <PickerModal
        visible={showTempoPicker}
        title="Tempo"
        options={TEMPO_OPTIONS.map((t) => ({ id: t, label: t }))}
        selected={state.tempo}
        onSelect={(id) => {
          setState((prev) => ({ ...prev, tempo: id }));
          setShowTempoPicker(false);
        }}
        onClose={() => setShowTempoPicker(false)}
        colors={colors}
      />
      <PickerModal
        visible={showEnginePicker}
        title="Primary Engine Position"
        options={PRIMARY_ENGINE_POSITIONS.map((p) => ({ id: p, label: p }))}
        selected={state.primaryEnginePosition}
        onSelect={(id) => {
          setState((prev) => ({ ...prev, primaryEnginePosition: id }));
          setShowEnginePicker(false);
        }}
        onClose={() => setShowEnginePicker(false)}
        colors={colors}
      />
    </View>
  );
}

// =============================================================================
// PICKER MODAL
// =============================================================================

interface PickerModalProps {
  visible: boolean;
  title: string;
  options: { id: string; label: string }[];
  selected: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  colors: typeof Colors.light;
}

function PickerModal({ visible, title, options, selected, onSelect, onClose, colors }: PickerModalProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View
          style={[styles.modalContent, { backgroundColor: colors.background, paddingBottom: insets.bottom + Spacing.md }]}
        >
          <View style={[styles.modalHeader, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
            <Pressable onPress={onClose}>
              <IconSymbol name="xmark" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
          <ScrollView style={styles.modalScroll}>
            {options.map((option) => (
              <Pressable
                key={option.id}
                style={[styles.modalOption, selected === option.id && { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelect(option.id);
                }}
              >
                <Text style={[styles.modalOptionText, { color: colors.text }]}>{option.label}</Text>
                {selected === option.id && <IconSymbol name="checkmark" size={18} color={colors.tint} />}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: { borderBottomWidth: StyleSheet.hairlineWidth },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  backButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: BorderRadius.md },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  headerSpacer: { width: 32 },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  sectionLabel: { fontSize: 13, fontWeight: '600', letterSpacing: 0.5, marginBottom: 10, marginLeft: 4, marginTop: Spacing.md },
  card: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: Spacing.md },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  inputLabel: { fontSize: 15, flex: 1 },
  numericInput: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'right',
    minWidth: 80,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  currencyPreview: { fontSize: 13, marginLeft: Spacing.xs },
  selectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md },
  selectorValue: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  selectorText: { fontSize: 15, fontWeight: '500' },

  // Emphasis section
  emphasisHeader: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, marginBottom: 4, gap: Spacing.sm },
  emphasisSubtitle: { fontSize: 12, marginLeft: 4, marginBottom: 10 },

  // Side header within card
  sideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  sideHeaderLabel: { fontSize: 15, fontWeight: '600' },
  sideHeaderTotal: { fontSize: 14, fontWeight: '600' },

  sliderRow: { padding: Spacing.md },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sliderLabel: { fontSize: 15 },
  sliderValue: { fontSize: 15, fontWeight: '600', minWidth: 40, textAlign: 'right' },
  slider: { width: '100%', height: 40 },

  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  grandTotalLabel: { fontSize: 15, fontWeight: '600' },
  grandTotalValue: { fontSize: 17, fontWeight: '700' },

  saveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  saveButton: { height: 50, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, maxHeight: '70%' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: { fontSize: 17, fontWeight: '600' },
  modalScroll: { maxHeight: 400 },
  modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md },
  modalOptionText: { fontSize: 16 },
});
