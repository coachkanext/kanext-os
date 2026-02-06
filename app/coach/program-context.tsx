/**
 * Coach Program Context Screen
 * Canonical Program Context editor per KaNeXT spec.
 *
 * SYSTEM EMPHASIS (7 Clusters) - FINAL SPEC
 * - 7 sliders are NOT COUPLED while dragging (moving one does NOT auto-drop others)
 * - Total must equal 100.0
 * - "Normalize to 100" button proportionally scales all sliders
 * - Offensive preset changes ONLY: Shooting, Finishing, Playmaking
 * - Defensive preset changes ONLY: On-Ball Defense, Team Defense
 * - Rebounding/Physical never change from presets
 * - Save auto-normalizes if total != 100
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

const MIN_VALUE = 0.0; // Allow zero
const MAX_VALUE = 100.0; // Max for any single slider
const TARGET_TOTAL = 100.0;

// All 7 clusters (exact labels per spec)
const CLUSTERS = [
  { id: 'shooting', label: 'Shooting' },
  { id: 'finishing', label: 'Finishing' },
  { id: 'playmaking', label: 'Playmaking' },
  { id: 'onBallDefense', label: 'On-Ball Defense' },
  { id: 'teamDefense', label: 'Team Defense' },
  { id: 'rebounding', label: 'Rebounding' },
  { id: 'physical', label: 'Physical' },
] as const;

type ClusterId = typeof CLUSTERS[number]['id'];

// Offensive System presets (raw weights for S/F/P only)
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

// Defensive System presets (raw weights for OBD/TD only - NOT rebounding/physical)
const DEFENSIVE_SYSTEMS = [
  { id: 'containment', label: 'Containment Man', weights: { onBallDefense: 35, teamDefense: 30 } },
  { id: 'pack-line', label: 'Pack Line', weights: { onBallDefense: 25, teamDefense: 40 } },
  { id: 'pressure-man', label: 'Pressure Man / Denial', weights: { onBallDefense: 45, teamDefense: 20 } },
  { id: 'switch', label: 'Switch Everything', weights: { onBallDefense: 30, teamDefense: 30 } },
  { id: 'ice', label: 'ICE / No-Middle', weights: { onBallDefense: 35, teamDefense: 35 } },
  { id: 'zone', label: 'Zone (Structured)', weights: { onBallDefense: 15, teamDefense: 45 } },
  { id: 'matchup-zone', label: 'Matchup Zone / Hybrid', weights: { onBallDefense: 20, teamDefense: 40 } },
  { id: 'press', label: 'Press / Pressure Defense', weights: { onBallDefense: 40, teamDefense: 20 } },
];

const TEMPO_OPTIONS = ['Slow', 'Medium', 'Fast'];
const PRIMARY_ENGINE_POSITIONS = ['PG', 'CG', 'Wing', 'Forward', 'Big'];

// =============================================================================
// TYPES
// =============================================================================

interface EmphasisProfile {
  shooting: number;
  finishing: number;
  playmaking: number;
  onBallDefense: number;
  teamDefense: number;
  rebounding: number;
  physical: number;
}

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
// NORMALIZATION FUNCTIONS
// =============================================================================

/**
 * Normalize all 7 cluster weights to sum exactly to TARGET_TOTAL (100.0)
 * Remainder goes to Physical deterministically
 */
function normalizeEmphasis(emphasis: EmphasisProfile): EmphasisProfile {
  const keys: ClusterId[] = ['shooting', 'finishing', 'playmaking', 'onBallDefense', 'teamDefense', 'rebounding', 'physical'];
  const currentSum = keys.reduce((sum, k) => sum + emphasis[k], 0);

  if (currentSum === 0) {
    // Edge case: all zeros, distribute evenly
    const evenShare = Math.round((TARGET_TOTAL / 7) * 10) / 10;
    const result: EmphasisProfile = {
      shooting: evenShare,
      finishing: evenShare,
      playmaking: evenShare,
      onBallDefense: evenShare,
      teamDefense: evenShare,
      rebounding: evenShare,
      physical: evenShare,
    };
    // Apply remainder to physical
    const sum = Object.values(result).reduce((s, v) => s + v, 0);
    result.physical = Math.round((result.physical + (TARGET_TOTAL - sum)) * 10) / 10;
    return result;
  }

  const scale = TARGET_TOTAL / currentSum;
  const result: EmphasisProfile = {
    shooting: Math.round(emphasis.shooting * scale * 10) / 10,
    finishing: Math.round(emphasis.finishing * scale * 10) / 10,
    playmaking: Math.round(emphasis.playmaking * scale * 10) / 10,
    onBallDefense: Math.round(emphasis.onBallDefense * scale * 10) / 10,
    teamDefense: Math.round(emphasis.teamDefense * scale * 10) / 10,
    rebounding: Math.round(emphasis.rebounding * scale * 10) / 10,
    physical: Math.round(emphasis.physical * scale * 10) / 10,
  };

  // Apply rounding remainder to Physical (deterministic)
  const newSum = Object.values(result).reduce((s, v) => s + v, 0);
  const diff = Math.round((TARGET_TOTAL - newSum) * 10) / 10;
  result.physical = Math.round((result.physical + diff) * 10) / 10;

  return result;
}

/**
 * Apply offensive preset and finalize to exactly 100.
 * Only S/F/P are adjusted; OBD/TD/Reb/Physical remain unchanged.
 * The preset ratios are preserved, scaled so grand total = 100.
 */
function applyOffensePresetTo100(systemId: string, currentEmphasis: EmphasisProfile): EmphasisProfile {
  const system = OFFENSIVE_SYSTEMS.find((s) => s.id === systemId) ?? OFFENSIVE_SYSTEMS[0];
  const rawWeights = system.weights;
  const rawSum = rawWeights.shooting + rawWeights.finishing + rawWeights.playmaking;

  // Sum of fixed (untouched) clusters
  const fixedSum =
    currentEmphasis.onBallDefense +
    currentEmphasis.teamDefense +
    currentEmphasis.rebounding +
    currentEmphasis.physical;

  // Target sum for offense clusters to achieve grand total of 100
  const targetOffenseSum = TARGET_TOTAL - fixedSum;

  // Scale preset ratios to target offense sum
  const scale = targetOffenseSum / rawSum;

  const shooting = Math.round(rawWeights.shooting * scale * 10) / 10;
  const finishing = Math.round(rawWeights.finishing * scale * 10) / 10;
  let playmaking = Math.round(rawWeights.playmaking * scale * 10) / 10;

  // Apply rounding remainder to playmaking (deterministic)
  const newTotal = shooting + finishing + playmaking + fixedSum;
  const diff = Math.round((TARGET_TOTAL - newTotal) * 10) / 10;
  playmaking = Math.round((playmaking + diff) * 10) / 10;

  return {
    ...currentEmphasis,
    shooting,
    finishing,
    playmaking,
  };
}

/**
 * Apply defensive preset and finalize to exactly 100.
 * Only OBD/TD are adjusted; S/F/P/Reb/Physical remain unchanged.
 * The preset ratios are preserved, scaled so grand total = 100.
 */
function applyDefensePresetTo100(systemId: string, currentEmphasis: EmphasisProfile): EmphasisProfile {
  const system = DEFENSIVE_SYSTEMS.find((s) => s.id === systemId) ?? DEFENSIVE_SYSTEMS[0];
  const rawWeights = system.weights;
  const rawSum = rawWeights.onBallDefense + rawWeights.teamDefense;

  // Sum of fixed (untouched) clusters
  const fixedSum =
    currentEmphasis.shooting +
    currentEmphasis.finishing +
    currentEmphasis.playmaking +
    currentEmphasis.rebounding +
    currentEmphasis.physical;

  // Target sum for defense clusters to achieve grand total of 100
  const targetDefenseSum = TARGET_TOTAL - fixedSum;

  // Scale preset ratios to target defense sum
  const scale = targetDefenseSum / rawSum;

  const onBallDefense = Math.round(rawWeights.onBallDefense * scale * 10) / 10;
  let teamDefense = Math.round(rawWeights.teamDefense * scale * 10) / 10;

  // Apply rounding remainder to teamDefense (deterministic)
  const newTotal = fixedSum + onBallDefense + teamDefense;
  const diff = Math.round((TARGET_TOTAL - newTotal) * 10) / 10;
  teamDefense = Math.round((teamDefense + diff) * 10) / 10;

  return {
    ...currentEmphasis,
    onBallDefense,
    teamDefense,
  };
}

function getDefaultEmphasis(): EmphasisProfile {
  return {
    shooting: 14.3,
    finishing: 14.3,
    playmaking: 14.3,
    onBallDefense: 14.3,
    teamDefense: 14.3,
    rebounding: 14.3,
    physical: 14.2,
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
    emphasis: getDefaultEmphasis(),
  };
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
  // Inline accordion pickers for Offensive/Defensive systems (not modals)
  const [expandedSystemPicker, setExpandedSystemPicker] = useState<'offensive' | 'defensive' | null>(null);
  // Preview states for system pickers (null = list view, string = preview that system)
  const [previewOffenseSystem, setPreviewOffenseSystem] = useState<string | null>(null);
  const [previewDefenseSystem, setPreviewDefenseSystem] = useState<string | null>(null);
  const [showTempoPicker, setShowTempoPicker] = useState(false);
  const [showEnginePicker, setShowEnginePicker] = useState(false);
  const [emphasisExpanded, setEmphasisExpanded] = useState(false); // Start collapsed by default
  // Track whether user has manually edited sliders (only then show Normalize button)
  const [hasManualEdit, setHasManualEdit] = useState(false);
  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Migrate from old formats
          if (!parsed.emphasis || parsed.emphasis.shooting === undefined) {
            setState({ ...getDefaultState(), ...parsed, emphasis: getDefaultEmphasis() });
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

  // Calculate total
  const total = useMemo(() => {
    const { shooting, finishing, playmaking, onBallDefense, teamDefense, rebounding, physical } = state.emphasis;
    return Math.round((shooting + finishing + playmaking + onBallDefense + teamDefense + rebounding + physical) * 10) / 10;
  }, [state.emphasis]);

  const isNormalized = Math.abs(total - TARGET_TOTAL) < 0.05;

  // Format currency for display
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Show toast and auto-hide after 2 seconds
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2000);
  }, []);

  // Calculate preview values for offensive preset
  const calculateOffensePreview = useCallback((systemId: string) => {
    return applyOffensePresetTo100(systemId, state.emphasis);
  }, [state.emphasis]);

  // Calculate preview values for defensive preset
  const calculateDefensePreview = useCallback((systemId: string) => {
    return applyDefensePresetTo100(systemId, state.emphasis);
  }, [state.emphasis]);

  // Toggle inline accordion for system pickers (only one open at a time)
  // When opening, immediately show preview with current system (preview-first UX)
  const toggleSystemPicker = useCallback((picker: 'offensive' | 'defensive') => {
    setExpandedSystemPicker((prev) => {
      if (prev === picker) {
        // Closing - reset preview states
        setPreviewOffenseSystem(null);
        setPreviewDefenseSystem(null);
        return null;
      } else {
        // Opening - immediately show preview with current system
        if (picker === 'offensive') {
          setPreviewOffenseSystem(state.offensiveSystem);
          setPreviewDefenseSystem(null);
        } else {
          setPreviewDefenseSystem(state.defensiveSystem);
          setPreviewOffenseSystem(null);
        }
        return picker;
      }
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [state.offensiveSystem, state.defensiveSystem]);

  // Handle offensive system option tap - enters preview mode (does NOT apply yet)
  const handleOffensiveSystemTap = useCallback((systemId: string) => {
    setPreviewOffenseSystem(systemId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Apply offensive system preset (from preview)
  const handleOffensiveSystemApply = useCallback(() => {
    if (!previewOffenseSystem) return;

    const newEmphasis = applyOffensePresetTo100(previewOffenseSystem, state.emphasis);
    const oldEmphasis = state.emphasis;

    // Calculate deltas for toast
    const deltas: string[] = [];
    const shootingDelta = Math.round((newEmphasis.shooting - oldEmphasis.shooting) * 10) / 10;
    const finishingDelta = Math.round((newEmphasis.finishing - oldEmphasis.finishing) * 10) / 10;
    const playmakingDelta = Math.round((newEmphasis.playmaking - oldEmphasis.playmaking) * 10) / 10;

    if (Math.abs(shootingDelta) >= 0.1) {
      deltas.push(`Shooting ${shootingDelta >= 0 ? '+' : ''}${shootingDelta}`);
    }
    if (Math.abs(finishingDelta) >= 0.1) {
      deltas.push(`Finishing ${finishingDelta >= 0 ? '+' : ''}${finishingDelta}`);
    }
    if (Math.abs(playmakingDelta) >= 0.1) {
      deltas.push(`Playmaking ${playmakingDelta >= 0 ? '+' : ''}${playmakingDelta}`);
    }

    setState((prev) => ({
      ...prev,
      offensiveSystem: previewOffenseSystem,
      emphasis: newEmphasis,
    }));
    setHasManualEdit(false);
    setPreviewOffenseSystem(null);
    setExpandedSystemPicker(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Show toast with deltas
    if (deltas.length > 0) {
      showToast(`Offensive preset applied: ${deltas.join(', ')}`);
    } else {
      showToast('Offensive preset applied (no changes)');
    }
  }, [previewOffenseSystem, state.emphasis, showToast]);

  // Cancel offensive preview (close accordion)
  const handleOffensiveSystemCancel = useCallback(() => {
    setPreviewOffenseSystem(null);
    setExpandedSystemPicker(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Handle defensive system option tap - enters preview mode (does NOT apply yet)
  const handleDefensiveSystemTap = useCallback((systemId: string) => {
    setPreviewDefenseSystem(systemId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Apply defensive system preset (from preview)
  const handleDefensiveSystemApply = useCallback(() => {
    if (!previewDefenseSystem) return;

    const newEmphasis = applyDefensePresetTo100(previewDefenseSystem, state.emphasis);
    const oldEmphasis = state.emphasis;

    // Calculate deltas for toast
    const deltas: string[] = [];
    const obdDelta = Math.round((newEmphasis.onBallDefense - oldEmphasis.onBallDefense) * 10) / 10;
    const tdDelta = Math.round((newEmphasis.teamDefense - oldEmphasis.teamDefense) * 10) / 10;

    if (Math.abs(obdDelta) >= 0.1) {
      deltas.push(`OBD ${obdDelta >= 0 ? '+' : ''}${obdDelta}`);
    }
    if (Math.abs(tdDelta) >= 0.1) {
      deltas.push(`Team Defense ${tdDelta >= 0 ? '+' : ''}${tdDelta}`);
    }

    setState((prev) => ({
      ...prev,
      defensiveSystem: previewDefenseSystem,
      emphasis: newEmphasis,
    }));
    setHasManualEdit(false);
    setPreviewDefenseSystem(null);
    setExpandedSystemPicker(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Show toast with deltas
    if (deltas.length > 0) {
      showToast(`Defensive preset applied: ${deltas.join(', ')}`);
    } else {
      showToast('Defensive preset applied (no changes)');
    }
  }, [previewDefenseSystem, state.emphasis, showToast]);

  // Cancel defensive preview (close accordion)
  const handleDefensiveSystemCancel = useCallback(() => {
    setPreviewDefenseSystem(null);
    setExpandedSystemPicker(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Handle slider change - NO auto-rebalancing, marks as manual edit
  const handleSliderChange = useCallback((clusterId: ClusterId, newValue: number) => {
    const roundedValue = Math.round(newValue * 10) / 10;
    setState((prev) => ({
      ...prev,
      emphasis: {
        ...prev.emphasis,
        [clusterId]: roundedValue,
      },
    }));
    setHasManualEdit(true); // Manual slider edit
  }, []);

  // Handle normalize button
  const handleNormalize = useCallback(() => {
    setState((prev) => ({
      ...prev,
      emphasis: normalizeEmphasis(prev.emphasis),
    }));
    setHasManualEdit(false); // After normalize, clear manual edit flag
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  // Handle save - auto-normalize if needed (only when manual edits deviated from 100)
  const handleSave = async () => {
    try {
      let emphasisToSave = state.emphasis;

      // Auto-normalize only if there are manual edits and total != 100
      if (hasManualEdit && !isNormalized) {
        emphasisToSave = normalizeEmphasis(state.emphasis);
        setState((prev) => ({ ...prev, emphasis: emphasisToSave }));
        setHasManualEdit(false);
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, emphasis: emphasisToSave }));
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
            {/* Offensive System - Inline Accordion */}
            <Pressable
              style={styles.selectorRow}
              onPress={() => toggleSystemPicker('offensive')}
            >
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Offensive System</Text>
              <Text style={[styles.selectorText, { color: colors.text }]}>{offensiveSystemLabel}</Text>
            </Pressable>

            {/* Inline Offensive System Options OR Preview */}
            {expandedSystemPicker === 'offensive' && (
              <View style={[styles.inlineOptionsList, { borderTopColor: colors.divider }]}>
                {previewOffenseSystem === null ? (
                  // List view - show all options
                  OFFENSIVE_SYSTEMS.map((system) => (
                    <Pressable
                      key={system.id}
                      style={[
                        styles.inlineOption,
                        state.offensiveSystem === system.id && { backgroundColor: colors.background },
                      ]}
                      onPress={() => handleOffensiveSystemTap(system.id)}
                    >
                      <Text
                        style={[
                          styles.inlineOptionText,
                          { color: state.offensiveSystem === system.id ? colors.tint : colors.text },
                        ]}
                      >
                        {system.label}
                      </Text>
                      {state.offensiveSystem === system.id && (
                        <IconSymbol name="checkmark" size={16} color={colors.tint} />
                      )}
                    </Pressable>
                  ))
                ) : (
                  // Preview view - show what would change
                  <PresetPreview
                    type="offensive"
                    systemId={previewOffenseSystem}
                    systemLabel={OFFENSIVE_SYSTEMS.find((s) => s.id === previewOffenseSystem)?.label || ''}
                    currentEmphasis={state.emphasis}
                    newEmphasis={calculateOffensePreview(previewOffenseSystem)}
                    onCancel={handleOffensiveSystemCancel}
                    onApply={handleOffensiveSystemApply}
                    onSelectDifferent={handleOffensiveSystemTap}
                    colors={colors}
                  />
                )}
              </View>
            )}

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
                  <Text style={[styles.selectorText, { color: colors.text }]}>{state.primaryEnginePosition}</Text>
                </Pressable>
              </>
            )}

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            {/* Defensive System - Inline Accordion */}
            <Pressable
              style={styles.selectorRow}
              onPress={() => toggleSystemPicker('defensive')}
            >
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Defensive System</Text>
              <Text style={[styles.selectorText, { color: colors.text }]}>{defensiveSystemLabel}</Text>
            </Pressable>

            {/* Inline Defensive System Options OR Preview */}
            {expandedSystemPicker === 'defensive' && (
              <View style={[styles.inlineOptionsList, { borderTopColor: colors.divider }]}>
                {previewDefenseSystem === null ? (
                  // List view - show all options
                  DEFENSIVE_SYSTEMS.map((system) => (
                    <Pressable
                      key={system.id}
                      style={[
                        styles.inlineOption,
                        state.defensiveSystem === system.id && { backgroundColor: colors.background },
                      ]}
                      onPress={() => handleDefensiveSystemTap(system.id)}
                    >
                      <Text
                        style={[
                          styles.inlineOptionText,
                          { color: state.defensiveSystem === system.id ? colors.tint : colors.text },
                        ]}
                      >
                        {system.label}
                      </Text>
                      {state.defensiveSystem === system.id && (
                        <IconSymbol name="checkmark" size={16} color={colors.tint} />
                      )}
                    </Pressable>
                  ))
                ) : (
                  // Preview view - show what would change
                  <PresetPreview
                    type="defensive"
                    systemId={previewDefenseSystem}
                    systemLabel={DEFENSIVE_SYSTEMS.find((s) => s.id === previewDefenseSystem)?.label || ''}
                    currentEmphasis={state.emphasis}
                    newEmphasis={calculateDefensePreview(previewDefenseSystem)}
                    onCancel={handleDefensiveSystemCancel}
                    onApply={handleDefensiveSystemApply}
                    onSelectDifferent={handleDefensiveSystemTap}
                    colors={colors}
                  />
                )}
              </View>
            )}

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <Pressable
              style={styles.selectorRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowTempoPicker((prev) => !prev);
              }}
            >
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Tempo</Text>
              <Text style={[styles.selectorText, { color: colors.text }]}>{state.tempo}</Text>
            </Pressable>

            {/* Inline Tempo Options */}
            {showTempoPicker && (
              <View style={[styles.inlineOptionsList, { borderTopColor: colors.divider }]}>
                {TEMPO_OPTIONS.map((tempo) => (
                  <Pressable
                    key={tempo}
                    style={[
                      styles.inlineOption,
                      state.tempo === tempo && { backgroundColor: colors.background },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setState((prev) => ({ ...prev, tempo }));
                      setShowTempoPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.inlineOptionText,
                        { color: state.tempo === tempo ? colors.tint : colors.text },
                      ]}
                    >
                      {tempo}
                    </Text>
                    {state.tempo === tempo && (
                      <IconSymbol name="checkmark" size={16} color={colors.tint} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* ===== SYSTEM EMPHASIS (7 Clusters) - Collapsible ===== */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SYSTEM EMPHASIS</Text>

          {/* Collapsible Header Card */}
          <Pressable
            style={[styles.card, styles.emphasisHeaderCard, { backgroundColor: colors.backgroundSecondary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setEmphasisExpanded((prev) => !prev);
            }}
          >
            <View style={styles.emphasisHeaderRow}>
              <Text style={[styles.emphasisHeaderTitle, { color: colors.text }]}>System Emphasis (7 Clusters)</Text>
              <Text
                style={[
                  styles.emphasisTotalText,
                  { color: isNormalized ? colors.textSecondary : colors.warning },
                ]}
              >
                Total: {total.toFixed(1)}%
              </Text>
            </View>
          </Pressable>

          {/* Expanded Content */}
          {emphasisExpanded && (
            <>
              {/* Total indicator row with conditional Normalize button */}
              <View style={[styles.totalIndicator, { borderColor: isNormalized ? colors.border : colors.warning }]}>
                <Text style={[styles.totalIndicatorLabel, { color: colors.textSecondary }]}>Total:</Text>
                <Text
                  style={[
                    styles.totalIndicatorValue,
                    { color: isNormalized ? colors.text : colors.warning },
                  ]}
                >
                  {total.toFixed(1)}% / 100%
                </Text>
                {hasManualEdit && !isNormalized && (
                  <Pressable
                    style={styles.normalizeButton}
                    onPress={handleNormalize}
                  >
                    <Text style={styles.normalizeButtonText}>Normalize to 100</Text>
                  </Pressable>
                )}
              </View>

              {/* 7 CLUSTER SLIDERS */}
              <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                {CLUSTERS.map((cluster, index) => (
                  <View key={cluster.id}>
                    {index > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
                    <View style={styles.sliderRow}>
                      <View style={styles.sliderHeader}>
                        <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>{cluster.label}</Text>
                        <Text style={[styles.sliderValue, { color: colors.text }]}>
                          {Math.round(state.emphasis[cluster.id])}%
                        </Text>
                      </View>
                      <Slider
                        style={styles.slider}
                        minimumValue={MIN_VALUE}
                        maximumValue={MAX_VALUE}
                        step={1}
                        value={state.emphasis[cluster.id]}
                        onValueChange={(value) => handleSliderChange(cluster.id, value)}
                        minimumTrackTintColor={colorScheme === 'dark' ? '#D4AF37' : '#1A1A1A'}
                        maximumTrackTintColor={colors.border}
                        thumbTintColor="#D4AF37"
                      />
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

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
            {
              backgroundColor: colorScheme === 'dark'
                ? pressed ? '#C9A431' : '#D4AF37'
                : pressed ? '#2A2A2A' : '#1A1A1A',
            },
          ]}
          onPress={handleSave}
        >
          <Text style={[styles.saveButtonText, { color: colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF' }]}>
            Save
          </Text>
        </Pressable>
      </View>

      {/* Modal for Primary Engine Position only */}
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

      {/* Toast notification */}
      {toastMessage && <Toast message={toastMessage} colors={colors} />}
    </View>
  );
}

// =============================================================================
// PRESET PREVIEW COMPONENT
// =============================================================================

interface PresetPreviewProps {
  type: 'offensive' | 'defensive';
  systemId: string;
  systemLabel: string;
  currentEmphasis: EmphasisProfile;
  newEmphasis: EmphasisProfile;
  onCancel: () => void;
  onApply: () => void;
  onSelectDifferent: (systemId: string) => void;
  colors: typeof Colors.light;
}

function PresetPreview({
  type,
  systemId,
  systemLabel,
  currentEmphasis,
  newEmphasis,
  onCancel,
  onApply,
  onSelectDifferent,
  colors,
}: PresetPreviewProps) {
  const systems = type === 'offensive' ? OFFENSIVE_SYSTEMS : DEFENSIVE_SYSTEMS;
  // Determine which clusters to show based on type
  const clusters =
    type === 'offensive'
      ? [
          { id: 'shooting' as const, label: 'Shooting' },
          { id: 'finishing' as const, label: 'Finishing' },
          { id: 'playmaking' as const, label: 'Playmaking' },
        ]
      : [
          { id: 'onBallDefense' as const, label: 'On-Ball Defense' },
          { id: 'teamDefense' as const, label: 'Team Defense' },
        ];

  // Calculate totals (always 100 for both)
  const currentTotal = 100;
  const newTotal = 100;

  return (
    <View style={styles.previewContainer}>
      {/* Header */}
      <View style={styles.previewHeader}>
        <Text style={[styles.previewTitle, { color: colors.text }]}>Preview changes</Text>
        <Text style={[styles.previewSubtitle, { color: colors.textSecondary }]}>
          Current → New (Totals stay 100)
        </Text>
      </View>

      {/* System selector (tap different to update preview) */}
      <View style={styles.previewSystemSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewSystemList}>
          {systems.map((system) => (
            <Pressable
              key={system.id}
              style={[
                styles.previewSystemChip,
                {
                  backgroundColor: system.id === systemId ? colors.tint : colors.background,
                  borderColor: system.id === systemId ? colors.tint : colors.border,
                },
              ]}
              onPress={() => {
                if (system.id !== systemId) {
                  onSelectDifferent(system.id);
                }
              }}
            >
              <Text
                style={[
                  styles.previewSystemChipText,
                  { color: system.id === systemId ? '#1A1A1A' : colors.text },
                ]}
                numberOfLines={1}
              >
                {system.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Current → New rows */}
      <View style={styles.previewChanges}>
        <View style={styles.previewLabelsRow}>
          <Text style={[styles.previewClusterLabel, { color: colors.textTertiary }]}>Cluster</Text>
          <Text style={[styles.previewValueLabel, { color: colors.textTertiary }]}>Current → New</Text>
        </View>

        {clusters.map((cluster) => {
          const currentVal = Math.round(currentEmphasis[cluster.id] * 10) / 10;
          const newVal = Math.round(newEmphasis[cluster.id] * 10) / 10;
          const delta = newVal - currentVal;
          const deltaSign = delta >= 0 ? '+' : '';
          const hasChange = Math.abs(delta) >= 0.1;

          return (
            <View key={cluster.id} style={styles.previewChangeRow}>
              <Text style={[styles.previewClusterName, { color: colors.text }]}>{cluster.label}</Text>
              <View style={styles.previewValueContainer}>
                <Text style={[styles.previewCurrentValue, { color: colors.textSecondary }]}>
                  {currentVal.toFixed(1)}
                </Text>
                <Text style={[styles.previewArrow, { color: colors.textTertiary }]}> → </Text>
                <Text
                  style={[
                    styles.previewNewValue,
                    { color: hasChange ? colors.tint : colors.text },
                  ]}
                >
                  {newVal.toFixed(1)}
                </Text>
                {hasChange && (
                  <Text
                    style={[
                      styles.previewDelta,
                      { color: delta >= 0 ? '#4CAF50' : '#F44336' },
                    ]}
                  >
                    {' '}({deltaSign}{delta.toFixed(1)})
                  </Text>
                )}
              </View>
            </View>
          );
        })}

        {/* Total row */}
        <View style={[styles.previewTotalRow, { borderTopColor: colors.divider }]}>
          <Text style={[styles.previewTotalLabel, { color: colors.textSecondary }]}>Total:</Text>
          <Text style={[styles.previewTotalValue, { color: colors.text }]}>
            {currentTotal} → {newTotal}
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.previewButtons}>
        <Pressable
          style={[styles.previewButtonCancel, { borderColor: colors.border }]}
          onPress={onCancel}
        >
          <Text style={[styles.previewButtonCancelText, { color: colors.text }]}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.previewButtonApply, { backgroundColor: '#D4AF37' }]}
          onPress={onApply}
        >
          <Text style={styles.previewButtonApplyText}>Apply Preset</Text>
        </Pressable>
      </View>
    </View>
  );
}

// =============================================================================
// TOAST COMPONENT
// =============================================================================

interface ToastProps {
  message: string;
  colors: typeof Colors.light;
}

function Toast({ message, colors }: ToastProps) {
  return (
    <View style={[styles.toast, { backgroundColor: colors.backgroundSecondary }]}>
      <Text style={[styles.toastText, { color: colors.text }]}>{message}</Text>
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
  selectorValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  selectorText: { fontSize: 15, fontWeight: '500' },

  // Inline accordion options (for system pickers)
  inlineOptionsList: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 4 },
  inlineOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  inlineOptionText: { fontSize: 15 },

  // Emphasis section - Collapsible
  emphasisHeaderCard: { marginBottom: Spacing.sm },
  emphasisHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  emphasisHeaderTitle: { fontSize: 15, fontWeight: '500' },
  emphasisTotalText: { fontSize: 14, fontWeight: '500' },

  // Total indicator (expanded)
  totalIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  totalIndicatorLabel: { fontSize: 14, fontWeight: '500' },
  totalIndicatorValue: { fontSize: 15, fontWeight: '600' },
  normalizeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: '#D4AF37',
  },
  normalizeButtonText: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },

  sliderRow: { padding: Spacing.md },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sliderLabel: { fontSize: 15 },
  sliderValue: { fontSize: 15, fontWeight: '600', minWidth: 40, textAlign: 'right' },
  slider: { width: '100%', height: 40 },

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

  // Preset Preview styles
  previewContainer: {
    padding: Spacing.md,
  },
  previewHeader: {
    marginBottom: Spacing.md,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 14,
  },
  previewSystemSelector: {
    marginBottom: Spacing.md,
  },
  previewSystemList: {
    gap: Spacing.xs,
    paddingRight: Spacing.sm,
  },
  previewSystemChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  previewSystemChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  previewChanges: {
    marginBottom: Spacing.md,
  },
  previewLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  previewClusterLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewValueLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewChangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  previewClusterName: {
    fontSize: 15,
    fontWeight: '500',
  },
  previewValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewCurrentValue: {
    fontSize: 15,
  },
  previewArrow: {
    fontSize: 15,
  },
  previewNewValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  previewDelta: {
    fontSize: 13,
    fontWeight: '500',
  },
  previewTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  previewTotalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  previewTotalValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  previewButtonCancel: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButtonCancelText: {
    fontSize: 15,
    fontWeight: '500',
  },
  previewButtonApply: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButtonApplyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  // Toast styles
  toast: {
    position: 'absolute',
    bottom: 120,
    left: Spacing.md,
    right: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
