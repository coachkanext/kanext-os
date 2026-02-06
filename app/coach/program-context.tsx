/**
 * Coach Program Context Screen
 * Canonical Program Context editor per KaNeXT spec.
 * No invented fields. Configuration only — no evaluation logic.
 *
 * LOCKED SPEC: System presets deterministically set their own emphasis block to 100;
 * offense and defense are separate, overlapping only in shared clusters (Rebounding, Physical),
 * and never interfere with each other.
 */

import React, { useState, useCallback, useEffect } from 'react';
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
// TYPES & CONSTANTS
// =============================================================================

const STORAGE_KEY = 'kx:programContext';

// Offense Emphasis clusters (5 sliders, must sum to 100)
const OFFENSE_CLUSTERS = [
  { id: 'shooting', label: 'Shooting' },
  { id: 'finishing', label: 'Finishing' },
  { id: 'playmaking', label: 'Playmaking' },
  { id: 'rebounding', label: 'Rebounding' },
  { id: 'physical', label: 'Physical' },
];

// Defense Emphasis clusters (4 sliders, must sum to 100)
const DEFENSE_CLUSTERS = [
  { id: 'onBallDefense', label: 'On-Ball Defense' },
  { id: 'teamDefense', label: 'Team Defense' },
  { id: 'rebounding', label: 'Rebounding' },
  { id: 'physical', label: 'Physical' },
];

// Offensive System presets (each sums to 100 for offense emphasis)
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

// Defensive System presets (each sums to 100 for defense emphasis)
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

// Types for emphasis weights
interface OffenseEmphasis {
  shooting: number;
  finishing: number;
  playmaking: number;
  rebounding: number;
  physical: number;
}

interface DefenseEmphasis {
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
  offenseEmphasis: OffenseEmphasis;
  defenseEmphasis: DefenseEmphasis;
}

// Get offense weights from a preset
function getOffensePresetWeights(systemId: string): OffenseEmphasis {
  const system = OFFENSIVE_SYSTEMS.find((s) => s.id === systemId);
  if (system) {
    return { ...system.weights };
  }
  return OFFENSIVE_SYSTEMS[0].weights; // Default to spread-pnr
}

// Get defense weights from a preset
function getDefensePresetWeights(systemId: string): DefenseEmphasis {
  const system = DEFENSIVE_SYSTEMS.find((s) => s.id === systemId);
  if (system) {
    return { ...system.weights };
  }
  return DEFENSIVE_SYSTEMS[2].weights; // Default to pressure-man
}

const DEFAULT_STATE: ProgramContextState = {
  scholarships: 13,
  nilBudget: 150000,
  offensiveSystem: 'spread-pnr',
  defensiveSystem: 'pressure-man',
  tempo: 'Fast',
  primaryEnginePosition: 'PG',
  offenseEmphasis: getOffensePresetWeights('spread-pnr'),
  defenseEmphasis: getDefensePresetWeights('pressure-man'),
};

// =============================================================================
// COMPONENT
// =============================================================================

export default function CoachProgramContextScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [state, setState] = useState<ProgramContextState>(DEFAULT_STATE);
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
          // Migrate from old format if needed
          if (parsed.clusterWeights && !parsed.offenseEmphasis) {
            // Old format - initialize from presets
            setState({
              ...DEFAULT_STATE,
              ...parsed,
              offenseEmphasis: getOffensePresetWeights(parsed.offensiveSystem || 'spread-pnr'),
              defenseEmphasis: getDefensePresetWeights(parsed.defensiveSystem || 'pressure-man'),
            });
          } else {
            setState({ ...DEFAULT_STATE, ...parsed });
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

  // Calculate totals
  const offenseTotal = Object.values(state.offenseEmphasis).reduce((a, b) => a + b, 0);
  const defenseTotal = Object.values(state.defenseEmphasis).reduce((a, b) => a + b, 0);
  const isOffenseValid = offenseTotal === 100;
  const isDefenseValid = defenseTotal === 100;
  const canSave = isOffenseValid && isDefenseValid;

  // Handle offensive system selection - IMMEDIATELY sets offense emphasis to preset
  const handleOffensiveSystemSelect = (systemId: string) => {
    const weights = getOffensePresetWeights(systemId);
    setState((prev) => ({
      ...prev,
      offensiveSystem: systemId,
      offenseEmphasis: weights,
    }));
    setShowOffensivePicker(false);
  };

  // Handle defensive system selection - IMMEDIATELY sets defense emphasis to preset
  const handleDefensiveSystemSelect = (systemId: string) => {
    const weights = getDefensePresetWeights(systemId);
    setState((prev) => ({
      ...prev,
      defensiveSystem: systemId,
      defenseEmphasis: weights,
    }));
    setShowDefensivePicker(false);
  };

  // Handle offense emphasis slider change (no auto-rebalancing)
  const handleOffenseWeightChange = useCallback((clusterId: string, newValue: number) => {
    setState((prev) => ({
      ...prev,
      offenseEmphasis: {
        ...prev.offenseEmphasis,
        [clusterId]: Math.round(newValue),
      },
    }));
  }, []);

  // Handle defense emphasis slider change (no auto-rebalancing)
  const handleDefenseWeightChange = useCallback((clusterId: string, newValue: number) => {
    setState((prev) => ({
      ...prev,
      defenseEmphasis: {
        ...prev.defenseEmphasis,
        [clusterId]: Math.round(newValue),
      },
    }));
  }, []);

  // Normalize offense weights to sum to 100
  const handleNormalizeOffense = useCallback(() => {
    setState((prev) => {
      const currentTotal = Object.values(prev.offenseEmphasis).reduce((a, b) => a + b, 0);
      if (currentTotal === 0) {
        return { ...prev, offenseEmphasis: getOffensePresetWeights(prev.offensiveSystem) };
      }
      const scale = 100 / currentTotal;
      const newWeights: Record<string, number> = {};
      let runningTotal = 0;
      const keys = Object.keys(prev.offenseEmphasis);
      keys.forEach((key, i) => {
        if (i === keys.length - 1) {
          newWeights[key] = 100 - runningTotal;
        } else {
          newWeights[key] = Math.round((prev.offenseEmphasis as Record<string, number>)[key] * scale);
          runningTotal += newWeights[key];
        }
      });
      return { ...prev, offenseEmphasis: newWeights as unknown as OffenseEmphasis };
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Normalize defense weights to sum to 100
  const handleNormalizeDefense = useCallback(() => {
    setState((prev) => {
      const currentTotal = Object.values(prev.defenseEmphasis).reduce((a, b) => a + b, 0);
      if (currentTotal === 0) {
        return { ...prev, defenseEmphasis: getDefensePresetWeights(prev.defensiveSystem) };
      }
      const scale = 100 / currentTotal;
      const newWeights: Record<string, number> = {};
      let runningTotal = 0;
      const keys = Object.keys(prev.defenseEmphasis);
      keys.forEach((key, i) => {
        if (i === keys.length - 1) {
          newWeights[key] = 100 - runningTotal;
        } else {
          newWeights[key] = Math.round((prev.defenseEmphasis as Record<string, number>)[key] * scale);
          runningTotal += newWeights[key];
        }
      });
      return { ...prev, defenseEmphasis: newWeights as unknown as DefenseEmphasis };
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Handle save
  const handleSave = async () => {
    if (!canSave) return;
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
          {
            paddingTop: insets.top,
            backgroundColor: colors.background,
            borderBottomColor: colors.divider,
          },
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

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ===== SECTION A: PROGRAM RESOURCES ===== */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            PROGRAM RESOURCES
          </Text>
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

          {/* ===== SECTION B: SYSTEMS ===== */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SYSTEMS</Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            <Pressable
              style={styles.selectorRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowOffensivePicker(true);
              }}
            >
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Offensive System
              </Text>
              <View style={styles.selectorValue}>
                <Text style={[styles.selectorText, { color: colors.text }]}>
                  {offensiveSystemLabel}
                </Text>
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
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Primary Engine Position
                  </Text>
                  <View style={styles.selectorValue}>
                    <Text style={[styles.selectorText, { color: colors.text }]}>
                      {state.primaryEnginePosition}
                    </Text>
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
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Defensive System
              </Text>
              <View style={styles.selectorValue}>
                <Text style={[styles.selectorText, { color: colors.text }]}>
                  {defensiveSystemLabel}
                </Text>
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

          {/* ===== SECTION C: OFFENSE EMPHASIS (5 sliders, sum to 100) ===== */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            OFFENSE EMPHASIS
          </Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {OFFENSE_CLUSTERS.map((cluster, index) => (
              <View key={cluster.id}>
                {index > 0 && (
                  <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                )}
                <View style={styles.sliderRow}>
                  <View style={styles.sliderHeader}>
                    <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>
                      {cluster.label}
                    </Text>
                    <Text style={[styles.sliderValue, { color: colors.text }]}>
                      {(state.offenseEmphasis as Record<string, number>)[cluster.id]}
                    </Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    value={(state.offenseEmphasis as Record<string, number>)[cluster.id]}
                    onValueChange={(value) => handleOffenseWeightChange(cluster.id, value)}
                    minimumTrackTintColor={colors.tint}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.tint}
                  />
                </View>
              </View>
            ))}
            <View style={[styles.totalRow, { borderTopColor: colors.divider }]}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Offense Total</Text>
              <Text
                style={[styles.totalValue, { color: isOffenseValid ? colors.success : colors.error }]}
              >
                {offenseTotal} / 100
              </Text>
            </View>
          </View>
          {!isOffenseValid && (
            <Text style={[styles.helperText, { color: colors.error }]}>
              Offense total must equal 100 to save.
            </Text>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.normalizeButton,
              {
                backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundSecondary,
                borderColor: colors.border,
              },
            ]}
            onPress={handleNormalizeOffense}
          >
            <Text style={[styles.normalizeButtonText, { color: colors.text }]}>
              Normalize to 100
            </Text>
          </Pressable>

          {/* ===== SECTION D: DEFENSE EMPHASIS (4 sliders, sum to 100) ===== */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            DEFENSE EMPHASIS
          </Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {DEFENSE_CLUSTERS.map((cluster, index) => (
              <View key={cluster.id}>
                {index > 0 && (
                  <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                )}
                <View style={styles.sliderRow}>
                  <View style={styles.sliderHeader}>
                    <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>
                      {cluster.label}
                    </Text>
                    <Text style={[styles.sliderValue, { color: colors.text }]}>
                      {(state.defenseEmphasis as Record<string, number>)[cluster.id]}
                    </Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    value={(state.defenseEmphasis as Record<string, number>)[cluster.id]}
                    onValueChange={(value) => handleDefenseWeightChange(cluster.id, value)}
                    minimumTrackTintColor={colors.tint}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.tint}
                  />
                </View>
              </View>
            ))}
            <View style={[styles.totalRow, { borderTopColor: colors.divider }]}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Defense Total</Text>
              <Text
                style={[styles.totalValue, { color: isDefenseValid ? colors.success : colors.error }]}
              >
                {defenseTotal} / 100
              </Text>
            </View>
          </View>
          {!isDefenseValid && (
            <Text style={[styles.helperText, { color: colors.error }]}>
              Defense total must equal 100 to save.
            </Text>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.normalizeButton,
              {
                backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundSecondary,
                borderColor: colors.border,
              },
            ]}
            onPress={handleNormalizeDefense}
          >
            <Text style={[styles.normalizeButtonText, { color: colors.text }]}>
              Normalize to 100
            </Text>
          </Pressable>

          {/* Spacer for save button */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button (sticky) */}
      <View
        style={[
          styles.saveContainer,
          {
            backgroundColor: colors.background,
            paddingBottom: insets.bottom + Spacing.md,
            borderTopColor: colors.divider,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor: canSave
                ? pressed
                  ? '#4F46E5'
                  : colors.tint
                : colors.border,
            },
          ]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Text
            style={[styles.saveButtonText, { color: canSave ? '#FFFFFF' : colors.textTertiary }]}
          >
            Save
          </Text>
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

function PickerModal({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
  colors,
}: PickerModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + Spacing.md,
            },
          ]}
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
                style={[
                  styles.modalOption,
                  selected === option.id && { backgroundColor: colors.backgroundSecondary },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelect(option.id);
                }}
              >
                <Text style={[styles.modalOptionText, { color: colors.text }]}>{option.label}</Text>
                {selected === option.id && (
                  <IconSymbol name="checkmark" size={18} color={colors.tint} />
                )}
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
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  headerSpacer: { width: 32 },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
    marginTop: Spacing.md,
  },
  card: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: Spacing.md },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
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
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  selectorValue: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  selectorText: { fontSize: 15, fontWeight: '500' },
  sliderRow: { padding: Spacing.md },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: { fontSize: 15 },
  sliderValue: { fontSize: 15, fontWeight: '600', minWidth: 30, textAlign: 'right' },
  slider: { width: '100%', height: 40 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  totalLabel: { fontSize: 15, fontWeight: '600' },
  totalValue: { fontSize: 17, fontWeight: '700' },
  helperText: { fontSize: 13, textAlign: 'center', marginTop: Spacing.sm, marginBottom: Spacing.xs },
  normalizeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  normalizeButtonText: { fontSize: 15, fontWeight: '500' },
  saveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  saveButton: {
    height: 50,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  modalOptionText: { fontSize: 16 },
});
