/**
 * Coach Program Context Screen
 * Canonical Program Context editor per KaNeXT spec.
 * No invented fields. Configuration only — no evaluation logic.
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

// Offensive System presets with cluster weight distributions
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

// Defensive System presets with cluster weight distributions
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

// Cluster definitions for evaluation emphasis (exactly 7)
const CLUSTERS = [
  { id: 'shooting', label: 'Shooting' },
  { id: 'finishing', label: 'Finishing' },
  { id: 'playmaking', label: 'Playmaking' },
  { id: 'onBallDefense', label: 'On-Ball Defense' },
  { id: 'teamDefense', label: 'Team Defense' },
  { id: 'rebounding', label: 'Rebounding' },
  { id: 'physical', label: 'Physical' },
];

interface ProgramContextState {
  // Section A: Program Resources
  scholarships: number;
  nilBudget: number;
  // Section B: Systems
  offensiveSystem: string;
  defensiveSystem: string;
  tempo: string;
  primaryEnginePosition: string;
  // Section C: Evaluation Emphasis (cluster weights, sum to 100)
  clusterWeights: Record<string, number>;
}

const DEFAULT_STATE: ProgramContextState = {
  scholarships: 13,
  nilBudget: 150000,
  offensiveSystem: 'spread-pnr',
  defensiveSystem: 'pressure-man',
  tempo: 'Fast',
  primaryEnginePosition: 'PG',
  clusterWeights: {
    shooting: 20,
    finishing: 15,
    playmaking: 15,
    onBallDefense: 15,
    teamDefense: 15,
    rebounding: 10,
    physical: 10,
  },
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
          setState(JSON.parse(saved));
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

  // Handle offensive system selection (applies preset weights)
  const handleOffensiveSystemSelect = (systemId: string) => {
    const system = OFFENSIVE_SYSTEMS.find((s) => s.id === systemId);
    if (system) {
      // Apply the offensive preset to relevant clusters
      // Defense clusters stay as-is
      const newWeights = { ...state.clusterWeights };
      newWeights.shooting = system.weights.shooting;
      newWeights.finishing = system.weights.finishing;
      newWeights.playmaking = system.weights.playmaking;
      // Rebounding and Physical from offense preset
      newWeights.rebounding = system.weights.rebounding;
      newWeights.physical = system.weights.physical;

      setState((prev) => ({
        ...prev,
        offensiveSystem: systemId,
        clusterWeights: newWeights,
      }));
    }
    setShowOffensivePicker(false);
  };

  // Handle defensive system selection (for reference, weights shown but separate)
  const handleDefensiveSystemSelect = (systemId: string) => {
    setState((prev) => ({ ...prev, defensiveSystem: systemId }));
    setShowDefensivePicker(false);
  };

  // Handle cluster weight change with rebalancing
  const handleClusterWeightChange = useCallback(
    (clusterId: string, newValue: number) => {
      setState((prev) => {
        const currentValue = prev.clusterWeights[clusterId];
        const delta = newValue - currentValue;

        if (delta === 0) return prev;

        const newWeights = { ...prev.clusterWeights };
        newWeights[clusterId] = newValue;

        // Rebalance other clusters proportionally
        const otherClusters = CLUSTERS.filter((c) => c.id !== clusterId);
        const otherTotal = otherClusters.reduce((sum, c) => sum + newWeights[c.id], 0);

        if (otherTotal > 0) {
          const remaining = 100 - newValue;
          const scale = remaining / otherTotal;

          otherClusters.forEach((c) => {
            newWeights[c.id] = Math.round(prev.clusterWeights[c.id] * scale);
          });

          // Fix rounding errors
          const actualTotal = Object.values(newWeights).reduce((a, b) => a + b, 0);
          if (actualTotal !== 100) {
            const diff = 100 - actualTotal;
            // Apply diff to first non-changed cluster with room
            for (const c of otherClusters) {
              if (newWeights[c.id] + diff >= 0 && newWeights[c.id] + diff <= 100) {
                newWeights[c.id] += diff;
                break;
              }
            }
          }
        }

        return { ...prev, clusterWeights: newWeights };
      });
    },
    []
  );

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
        {/* Content */}
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
            {/* Scholarships */}
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

            {/* NIL Budget */}
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
            {/* Offensive System */}
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

            {/* Primary Engine Position (only if Heliocentric) */}
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

            {/* Defensive System */}
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

            {/* Tempo */}
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

          {/* ===== SECTION C: EVALUATION EMPHASIS ===== */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            EVALUATION EMPHASIS
          </Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {CLUSTERS.map((cluster, index) => (
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
                      {state.clusterWeights[cluster.id]}
                    </Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    value={state.clusterWeights[cluster.id]}
                    onValueChange={(value) => handleClusterWeightChange(cluster.id, value)}
                    minimumTrackTintColor={colors.tint}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.tint}
                  />
                </View>
              </View>
            ))}
            <View style={[styles.totalRow, { borderTopColor: colors.divider }]}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total</Text>
              <Text
                style={[
                  styles.totalValue,
                  {
                    color:
                      Object.values(state.clusterWeights).reduce((a, b) => a + b, 0) === 100
                        ? colors.success
                        : colors.error,
                  },
                ]}
              >
                {Object.values(state.clusterWeights).reduce((a, b) => a + b, 0)}
              </Text>
            </View>
          </View>

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
            { backgroundColor: pressed ? '#4F46E5' : colors.tint },
          ]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>

      {/* Offensive System Picker Modal */}
      <PickerModal
        visible={showOffensivePicker}
        title="Offensive System"
        options={OFFENSIVE_SYSTEMS.map((s) => ({ id: s.id, label: s.label }))}
        selected={state.offensiveSystem}
        onSelect={handleOffensiveSystemSelect}
        onClose={() => setShowOffensivePicker(false)}
        colors={colors}
      />

      {/* Defensive System Picker Modal */}
      <PickerModal
        visible={showDefensivePicker}
        title="Defensive System"
        options={DEFENSIVE_SYSTEMS.map((s) => ({ id: s.id, label: s.label }))}
        selected={state.defensiveSystem}
        onSelect={(id) => handleDefensiveSystemSelect(id)}
        onClose={() => setShowDefensivePicker(false)}
        colors={colors}
      />

      {/* Tempo Picker Modal */}
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

      {/* Primary Engine Position Picker Modal */}
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
// PICKER MODAL COMPONENT
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
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
    marginTop: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },

  // Input Row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  inputLabel: {
    fontSize: 15,
    flex: 1,
  },
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
  currencyPreview: {
    fontSize: 13,
    marginLeft: Spacing.xs,
  },

  // Selector Row
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  selectorValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectorText: {
    fontSize: 15,
    fontWeight: '500',
  },

  // Slider Row
  sliderRow: {
    padding: Spacing.md,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 15,
  },
  sliderValue: {
    fontSize: 15,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'right',
  },
  slider: {
    width: '100%',
    height: 40,
  },

  // Total Row
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '700',
  },

  // Save Button
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
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  modalOptionText: {
    fontSize: 16,
  },
});
