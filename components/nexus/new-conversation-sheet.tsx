/**
 * New Conversation Sheet Component
 * Bottom sheet for creating new conversation types.
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
import { Colors, Spacing, BorderRadius, Brand, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const SHEET_HEIGHT = 280;

interface ConversationOption {
  type: 'chat' | 'eval' | 'sim' | 'game-ops';
  label: string;
  description: string;
  icon: IconSymbolName;
  color: string;
}

const OPTIONS: ConversationOption[] = [
  {
    type: 'chat',
    label: 'New Chat',
    description: 'Start a general conversation with Nexus',
    icon: 'text.bubble',
    color: Brand.nexus,
  },
  {
    type: 'eval',
    label: 'Player Eval',
    description: 'Generate a detailed player evaluation report',
    icon: 'person.text.rectangle',
    color: '#ffffff',
  },
  {
    type: 'sim',
    label: 'Simulation',
    description: 'Run game simulations and projections',
    icon: 'chart.bar.fill',
    color: ModeColors.sports.primary,
  },
];

interface NewConversationSheetProps {
  visible: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onNewEval: () => void;
  onNewSim: () => void;
}

export function NewConversationSheet({
  visible,
  onClose,
  onNewChat,
  onNewEval,
  onNewSim,
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

  const handleOptionPress = (type: 'chat' | 'eval' | 'sim' | 'game-ops') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (type) {
      case 'chat':
        onNewChat();
        break;
      case 'eval':
        onNewEval();
        break;
      case 'sim':
        onNewSim();
        break;
    }
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
        <ThemedText style={styles.title}>New Conversation</ThemedText>

        {/* Options */}
        <View style={styles.options}>
          {OPTIONS.map((option) => (
            <Pressable
              key={option.type}
              style={({ pressed }) => [
                styles.option,
                { backgroundColor: colors.backgroundSecondary },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => handleOptionPress(option.type)}
            >
              <View style={[styles.iconContainer, { backgroundColor: option.color + '20' }]}>
                <IconSymbol name={option.icon} size={22} color={option.color} />
              </View>
              <View style={styles.optionText}>
                <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
                <ThemedText style={[styles.optionDescription, { color: colors.textSecondary }]}>
                  {option.description}
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
