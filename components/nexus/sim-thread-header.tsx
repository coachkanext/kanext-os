/**
 * Sim Thread Header Component
 * Compact header at top of simulation threads with scenario selector and actions.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { SimulationThreadConfig, SimulationScenario } from '@/types';

const SCENARIOS: { value: SimulationScenario; label: string; description: string }[] = [
  { value: 'pregame', label: 'Pregame', description: 'Full game projection' },
  { value: 'halftime', label: 'Halftime', description: 'Second half analysis' },
  { value: 'endgame', label: 'Endgame', description: 'Final minutes strategy' },
  { value: 'what-if', label: 'What-if', description: 'Custom scenario' },
];

interface SimThreadHeaderProps {
  config: SimulationThreadConfig;
  onConfigChange: (config: SimulationThreadConfig) => void;
  onRunSimulation: () => void;
  isLoading?: boolean;
}

export function SimThreadHeader({
  config,
  onConfigChange,
  onRunSimulation,
  isLoading = false,
}: SimThreadHeaderProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const modeColors = ModeColors.sports;

  const [showScenarioPicker, setShowScenarioPicker] = useState(false);

  const selectedScenario = SCENARIOS.find((s) => s.value === config.scenario);

  const handleScenarioSelect = (scenario: SimulationScenario) => {
    Haptics.selectionAsync();
    onConfigChange({
      ...config,
      scenario,
    });
    setShowScenarioPicker(false);
  };

  const handleOpponentChange = (text: string) => {
    onConfigChange({
      ...config,
      opponentName: text,
    });
  };

  const handleRunSimulation = () => {
    if (!config.scenario) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRunSimulation();
  };

  const canRun = config.scenario && !isLoading;

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.border }]}>
      {/* Header Label */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <IconSymbol name="chart.bar.fill" size={16} color={modeColors.primary} />
          <ThemedText style={styles.headerTitle}>Game Simulation</ThemedText>
        </View>
      </View>

      {/* Selectors Row */}
      <View style={styles.selectorsRow}>
        {/* Scenario Selector */}
        <Pressable
          style={({ pressed }) => [
            styles.selector,
            { backgroundColor: colors.background, borderColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => setShowScenarioPicker(!showScenarioPicker)}
        >
          <ThemedText
            style={[
              styles.selectorText,
              !selectedScenario && { color: colors.textTertiary },
            ]}
          >
            {selectedScenario?.label ?? 'Scenario'}
          </ThemedText>
          <IconSymbol name="chevron.down" size={12} color={colors.textSecondary} />
        </Pressable>

        {/* Opponent Input */}
        <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Opponent..."
            placeholderTextColor={colors.textTertiary}
            value={config.opponentName ?? ''}
            onChangeText={handleOpponentChange}
            autoCapitalize="words"
          />
        </View>

        {/* Run Button */}
        <Pressable
          style={({ pressed }) => [
            styles.runButton,
            { backgroundColor: canRun ? modeColors.primary : colors.backgroundTertiary },
            pressed && canRun && { opacity: 0.8 },
          ]}
          onPress={handleRunSimulation}
          disabled={!canRun}
        >
          <IconSymbol name="play.fill" size={12} color={canRun ? '#FFFFFF' : colors.textTertiary} />
          <ThemedText
            style={[
              styles.runText,
              { color: canRun ? '#FFFFFF' : colors.textTertiary },
            ]}
          >
            Run
          </ThemedText>
        </Pressable>
      </View>

      {/* Scenario Dropdown */}
      {showScenarioPicker && (
        <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {SCENARIOS.map((scenario) => (
            <Pressable
              key={scenario.value}
              style={({ pressed }) => [
                styles.dropdownItem,
                { borderBottomColor: colors.border },
                pressed && { backgroundColor: colors.backgroundSecondary },
              ]}
              onPress={() => handleScenarioSelect(scenario.value)}
            >
              <View style={styles.dropdownItemContent}>
                <ThemedText style={styles.dropdownText}>{scenario.label}</ThemedText>
                <ThemedText style={[styles.dropdownDescription, { color: colors.textSecondary }]}>
                  {scenario.description}
                </ThemedText>
              </View>
              {scenario.value === config.scenario && (
                <IconSymbol name="checkmark" size={14} color={modeColors.primary} />
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  selectorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 100,
  },
  selectorText: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  inputContainer: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
  },
  input: {
    fontSize: 14,
    paddingVertical: Spacing.xs + 2,
  },
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  runText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dropdown: {
    position: 'absolute',
    top: 80,
    left: Spacing.md,
    width: 180,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 100,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownItemContent: {
    flex: 1,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownDescription: {
    fontSize: 11,
    marginTop: 1,
  },
});
