/**
 * Engine Menu Sheet
 * Bottom sheet for selecting Nexus engine modes.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type EngineType = 'game-ops' | 'player' | 'team' | 'recruiting' | 'scouting' | 'simulation';

interface EngineOption {
  type: EngineType;
  label: string;
  description: string;
  icon: IconSymbolName;
  color: string;
}

const ENGINES: EngineOption[] = [
  {
    type: 'game-ops',
    label: 'Game Ops',
    description: 'Manage live games',
    icon: 'basketball.fill',
    color: '#FF6B35',
  },
  {
    type: 'player',
    label: 'Player Engine',
    description: 'Evaluate and develop players',
    icon: 'person.text.rectangle',
    color: '#4ECDC4',
  },
  {
    type: 'team',
    label: 'Team Engine',
    description: 'Analyze team performance',
    icon: 'person.3.fill',
    color: '#7B68EE',
  },
  {
    type: 'recruiting',
    label: 'Recruiting Engine',
    description: 'Find and track prospects',
    icon: 'magnifyingglass',
    color: '#FFD93D',
  },
  {
    type: 'scouting',
    label: 'Scouting Engine',
    description: 'Scout opponents',
    icon: 'binoculars.fill',
    color: '#6BCB77',
  },
  {
    type: 'simulation',
    label: 'Simulation Engine',
    description: 'Run game simulations',
    icon: 'chart.bar.fill',
    color: '#FF6B6B',
  },
];

interface NewConversationSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectEngine: (engine: EngineType) => void;
}

export function NewConversationSheet({
  visible,
  onClose,
  onSelectEngine,
}: NewConversationSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handleEnginePress = (type: EngineType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectEngine(type);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Nexus">
      {/* Engine Options */}
      <View style={styles.options}>
        {ENGINES.map((engine) => (
          <Pressable
            key={engine.type}
            style={({ pressed }) => [
              styles.option,
              { backgroundColor: colors.backgroundSecondary },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => handleEnginePress(engine.type)}
          >
            <View style={[styles.iconContainer, { backgroundColor: engine.color + '20' }]}>
              <IconSymbol name={engine.icon} size={22} color={engine.color} />
            </View>
            <View style={styles.optionText}>
              <ThemedText style={styles.optionLabel}>{engine.label}</ThemedText>
              <ThemedText style={[styles.optionDescription, { color: colors.textSecondary }]}>
                {engine.description}
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: Spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
  },
});
