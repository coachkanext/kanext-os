/**
 * Engine Menu Sheet
 * Bottom sheet for selecting Nexus engine modes.
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const SHEET_HEIGHT = 480;

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
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleEnginePress = (type: EngineType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectEngine(type);
  };

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Scrim */}
      <Animated.View style={[styles.scrim, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.background,
            paddingBottom: insets.bottom + Spacing.md,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        {/* Title */}
        <ThemedText style={styles.title}>Nexus</ThemedText>

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
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
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
