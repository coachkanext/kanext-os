/**
 * Coach Program Context Screen
 * Canonical Program Context editor per KaNeXT spec.
 *
 * EVALUATION EMPHASIS: Unified 7-cluster profile computed from Offense + Defense presets.
 * Uses locked Team KR weighting: OFF = 58%, DEF = 42%.
 * Shared clusters (Rebounding, Physical) receive contributions from both.
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

// Team KR weighting split (locked)
const OFF_WEIGHT = 58;
const DEF_WEIGHT = 42;

// Final 7 clusters for unified emphasis (order matters for display)
const EMPHASIS_CLUSTERS = [
  { id: 'shooting', label: 'Shooting' },
  { id: 'finishing', label: 'Finishing' },
  { id: 'playmaking', label: 'Playmaking' },
  { id: 'onBallDefense', label: 'On-Ball Defense' },
  { id: 'teamDefense', label: 'Team Defense' },
  { id: 'rebounding', label: 'Rebounding' },
  { id: 'physical', label: 'Physical' },
];

// Offensive System presets (5 clusters, each sums to 100)
const OFFENSIVE_SYSTEMS = [
  { id: 'spread-pnr', label: 'Spread Pick-and-Roll', weights: { shooting: 30, finishing: 25, playmaking: 30, rebounding: 10, physical: 5 } },
  { id: '5-out', label: '5-Out Motion', weights: { shooting: 35, finishing: 20, playmaking: 30, rebounding: 10, physical: 5 } },
  { id: 'pace-space', label: 'Pace & Space', weights: { shooting: 40, finishing: 20, playmaking: 25, rebounding: 10, physical: 5 } },
  { id: 'motion', label: 'Motion / Read & React', weights: { shooting: 25, finishing: 20, playmaking: 35, rebounding: 10, physical: 10 } },
  { id: 'dribble-drive', label: 'Dribble Drive', weights: { shooting: 20, finishing: 35, playmaking: 25, rebounding: 10, physical: 10 } },
  { id: 'princeton', label: 'Princeton', weights: { shooting: 20, finishing: 20, playmaking: 40, rebounding: 10, physical: 10 } },
  { id: 'post-centric', label: 'Post-Centric / Inside-Out', weights: { shooting: 20, finishing: 35, playmaking: 20, rebounding: 15, physical: 10 } },
  { id: 'moreyball', label: 'Moreyball', weights: { shooting: 45, finishing: 25, playmaking: 20, rebounding: 5, physical: 5 } },
  { id: 'heliocentric', label: 'Heliocentric', weights: { shooting: 30, finishing: 25, playmaking: 35, rebounding: 5, physical: 5 } },
];

// Defensive System presets (4 clusters, each sums to 100)
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
  isCustomized: boolean; // true if user has manually edited emphasis
}

// =============================================================================
// MERGE RULE: Compute unified emphasis from presets
// =============================================================================

function computeEmphasisFromPresets(offensiveSystemId: string, defensiveSystemId: string): EmphasisProfile {
  const offPreset = OFFENSIVE_SYSTEMS.find((s) => s.id === offensiveSystemId)?.weights
    ?? OFFENSIVE_SYSTEMS[0].weights;
  const defPreset = DEFENSIVE_SYSTEMS.find((s) => s.id === defensiveSystemId)?.weights
    ?? DEFENSIVE_SYSTEMS[0].weights;

  // Apply merge rule: OFF_WEIGHT * (preset / 100) for offense-only clusters
  // DEF_WEIGHT * (preset / 100) for defense-only clusters
  // Sum of both for shared clusters (Rebounding, Physical)
  const rawEmphasis = {
    shooting: OFF_WEIGHT * (offPreset.shooting / 100),
    finishing: OFF_WEIGHT * (offPreset.finishing / 100),
    playmaking: OFF_WEIGHT * (offPreset.playmaking / 100),
    onBallDefense: DEF_WEIGHT * (defPreset.onBallDefense / 100),
    teamDefense: DEF_WEIGHT * (defPreset.teamDefense / 100),
    rebounding: OFF_WEIGHT * (offPreset.rebounding / 100) + DEF_WEIGHT * (defPreset.rebounding / 100),
    physical: OFF_WEIGHT * (offPreset.physical / 100) + DEF_WEIGHT * (defPreset.physical / 100),
  };

  // Round to 1 decimal place
  const rounded: EmphasisProfile = {
    shooting: Math.round(rawEmphasis.shooting * 10) / 10,
    finishing: Math.round(rawEmphasis.finishing * 10) / 10,
    playmaking: Math.round(rawEmphasis.playmaking * 10) / 10,
    onBallDefense: Math.round(rawEmphasis.onBallDefense * 10) / 10,
    teamDefense: Math.round(rawEmphasis.teamDefense * 10) / 10,
    rebounding: Math.round(rawEmphasis.rebounding * 10) / 10,
    physical: Math.round(rawEmphasis.physical * 10) / 10,
  };

  // Ensure sum is exactly 100 by adjusting Physical
  const total = Object.values(rounded).reduce((a, b) => a + b, 0);
  const diff = Math.round((100 - total) * 10) / 10;
  rounded.physical = Math.round((rounded.physical + diff) * 10) / 10;

  return rounded;
}

function getDefaultState(): ProgramContextState {
  return {
    scholarships: 13,
    nilBudget: 150000,
    offensiveSystem: 'spread-pnr',
    defensiveSystem: 'pressure-man',
    tempo: 'Fast',
    primaryEnginePosition: 'PG',
    emphasis: computeEmphasisFromPresets('spread-pnr', 'pressure-man'),
    isCustomized: false,
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
          if (!parsed.emphasis) {
            // Compute from presets if emphasis not saved
            const emphasis = computeEmphasisFromPresets(
              parsed.offensiveSystem || 'spread-pnr',
              parsed.defensiveSystem || 'pressure-man'
            );
            setState({ ...getDefaultState(), ...parsed, emphasis, isCustomized: false });
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

  // Format currency for display
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate emphasis total
  const emphasisTotal = useMemo(() => {
    return Math.round(Object.values(state.emphasis).reduce((a, b) => a + b, 0) * 10) / 10;
  }, [state.emphasis]);

  const isValidTotal = Math.abs(emphasisTotal - 100) < 0.1;

  // Handle offensive system selection - recompute emphasis if not customized
  const handleOffensiveSystemSelect = (systemId: string) => {
    setState((prev) => {
      const newEmphasis = prev.isCustomized
        ? prev.emphasis
        : computeEmphasisFromPresets(systemId, prev.defensiveSystem);
      return {
        ...prev,
        offensiveSystem: systemId,
        emphasis: newEmphasis,
      };
    });
    setShowOffensivePicker(false);
  };

  // Handle defensive system selection - recompute emphasis if not customized
  const handleDefensiveSystemSelect = (systemId: string) => {
    setState((prev) => {
      const newEmphasis = prev.isCustomized
        ? prev.emphasis
        : computeEmphasisFromPresets(prev.offensiveSystem, systemId);
      return {
        ...prev,
        defensiveSystem: systemId,
        emphasis: newEmphasis,
      };
    });
    setShowDefensivePicker(false);
  };

  // Handle emphasis slider change (manual override)
  const handleEmphasisChange = useCallback((clusterId: string, newValue: number) => {
    setState((prev) => ({
      ...prev,
      emphasis: {
        ...prev.emphasis,
        [clusterId]: Math.round(newValue * 10) / 10,
      },
      isCustomized: true,
    }));
  }, []);

  // Normalize emphasis to sum to 100
  const handleNormalize = useCallback(() => {
    setState((prev) => {
      const currentTotal = Object.values(prev.emphasis).reduce((a, b) => a + b, 0);
      if (currentTotal === 0) {
        return { ...prev, emphasis: computeEmphasisFromPresets(prev.offensiveSystem, prev.defensiveSystem) };
      }
      const scale = 100 / currentTotal;
      const newEmphasis: Record<string, number> = {};
      let runningTotal = 0;
      const keys = Object.keys(prev.emphasis);
      keys.forEach((key, i) => {
        if (i === keys.length - 1) {
          newEmphasis[key] = Math.round((100 - runningTotal) * 10) / 10;
        } else {
          newEmphasis[key] = Math.round((prev.emphasis as Record<string, number>)[key] * scale * 10) / 10;
          runningTotal += newEmphasis[key];
        }
      });
      return { ...prev, emphasis: newEmphasis as EmphasisProfile };
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Reset to computed presets
  const handleResetToPresets = useCallback(() => {
    setState((prev) => ({
      ...prev,
      emphasis: computeEmphasisFromPresets(prev.offensiveSystem, prev.defensiveSystem),
      isCustomized: false,
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Toggle customization mode
  const handleToggleCustomize = useCallback(() => {
    setState((prev) => ({ ...prev, isCustomized: !prev.isCustomized }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Handle save
  const handleSave = async () => {
    if (!isValidTotal) return;
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

          {/* ===== EVALUATION EMPHASIS (unified 7-cluster profile) ===== */}
          <View style={styles.emphasisHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 0 }]}>
              EVALUATION EMPHASIS
            </Text>
            {state.isCustomized && (
              <View style={[styles.customBadge, { backgroundColor: colors.tint + '20' }]}>
                <Text style={[styles.customBadgeText, { color: colors.tint }]}>Custom</Text>
              </View>
            )}
          </View>
          <Text style={[styles.emphasisSubtitle, { color: colors.textTertiary }]}>
            OFF {OFF_WEIGHT}% · DEF {DEF_WEIGHT}%
          </Text>

          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {EMPHASIS_CLUSTERS.map((cluster, index) => (
              <View key={cluster.id}>
                {index > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
                <View style={styles.sliderRow}>
                  <View style={styles.sliderHeader}>
                    <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>{cluster.label}</Text>
                    <Text style={[styles.sliderValue, { color: colors.text }]}>
                      {(state.emphasis as Record<string, number>)[cluster.id].toFixed(1)}
                    </Text>
                  </View>
                  {state.isCustomized ? (
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={100}
                      step={0.1}
                      value={(state.emphasis as Record<string, number>)[cluster.id]}
                      onValueChange={(value) => handleEmphasisChange(cluster.id, value)}
                      minimumTrackTintColor={colors.tint}
                      maximumTrackTintColor={colors.border}
                      thumbTintColor={colors.tint}
                    />
                  ) : (
                    <View style={[styles.emphasisBar, { backgroundColor: colors.border }]}>
                      <View
                        style={[
                          styles.emphasisBarFill,
                          {
                            backgroundColor: colors.tint,
                            width: `${Math.min((state.emphasis as Record<string, number>)[cluster.id], 100)}%`,
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>
              </View>
            ))}
            <View style={[styles.totalRow, { borderTopColor: colors.divider }]}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total</Text>
              <Text style={[styles.totalValue, { color: isValidTotal ? colors.success : colors.error }]}>
                {emphasisTotal.toFixed(1)} / 100
              </Text>
            </View>
          </View>

          {/* Emphasis action buttons */}
          <View style={styles.emphasisActions}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundSecondary, borderColor: colors.border },
              ]}
              onPress={handleToggleCustomize}
            >
              <Text style={[styles.actionButtonText, { color: colors.text }]}>
                {state.isCustomized ? 'Lock Emphasis' : 'Customize Emphasis'}
              </Text>
            </Pressable>

            {state.isCustomized && (
              <>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundSecondary, borderColor: colors.border },
                  ]}
                  onPress={handleNormalize}
                >
                  <Text style={[styles.actionButtonText, { color: colors.text }]}>Normalize to 100</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundSecondary, borderColor: colors.border },
                  ]}
                  onPress={handleResetToPresets}
                >
                  <Text style={[styles.actionButtonText, { color: colors.tint }]}>Reset to Presets</Text>
                </Pressable>
              </>
            )}
          </View>

          {!isValidTotal && state.isCustomized && (
            <Text style={[styles.helperText, { color: colors.error }]}>Total must equal 100 to save.</Text>
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
            { backgroundColor: isValidTotal ? (pressed ? '#4F46E5' : colors.tint) : colors.border },
          ]}
          onPress={handleSave}
          disabled={!isValidTotal}
        >
          <Text style={[styles.saveButtonText, { color: isValidTotal ? '#FFFFFF' : colors.textTertiary }]}>Save</Text>
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
  customBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.sm },
  customBadgeText: { fontSize: 11, fontWeight: '600' },

  sliderRow: { padding: Spacing.md },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sliderLabel: { fontSize: 15 },
  sliderValue: { fontSize: 15, fontWeight: '600', minWidth: 40, textAlign: 'right' },
  slider: { width: '100%', height: 40 },

  // Read-only emphasis bar
  emphasisBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  emphasisBarFill: { height: '100%', borderRadius: 4 },

  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderTopWidth: 1 },
  totalLabel: { fontSize: 15, fontWeight: '600' },
  totalValue: { fontSize: 17, fontWeight: '700' },

  emphasisActions: { flexDirection: 'column', gap: Spacing.sm, marginTop: Spacing.sm },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  actionButtonText: { fontSize: 15, fontWeight: '500' },

  helperText: { fontSize: 13, textAlign: 'center', marginTop: Spacing.sm },

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
  saveButtonText: { fontSize: 17, fontWeight: '600' },

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
