/**
 * Nexus Top Bar Component
 * Custom top bar for the Nexus screen with conversations, mode, and overlay controls.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Layout, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Mode } from '@/types';

interface NexusTopBarProps {
  currentMode: Mode;
  onConversationsPress: () => void;
  onModePress: () => void;
  onContextPress: () => void;
  onBoardPress: () => void;
  onAddPersonPress: () => void;
}

export function NexusTopBar({
  currentMode,
  onConversationsPress,
  onModePress,
  onContextPress,
  onBoardPress,
  onAddPersonPress,
}: NexusTopBarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const formatModeName = (mode: Mode): string => {
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.content}>
        {/* Left: Conversations Menu */}
        <Pressable
          style={({ pressed }) => [
            styles.iconButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={onConversationsPress}
          accessibilityLabel="Open conversations"
          accessibilityRole="button"
        >
          <IconSymbol name="line.horizontal.3" size={24} color={colors.text} />
        </Pressable>

        {/* Center: Mode Selector */}
        <Pressable
          style={({ pressed }) => [
            styles.modeButton,
            {
              backgroundColor: colors.backgroundSecondary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={onModePress}
          accessibilityLabel={`Current mode: ${formatModeName(currentMode)}`}
          accessibilityRole="button"
        >
          <ThemedText style={styles.modeText}>
            {formatModeName(currentMode)}
          </ThemedText>
        </Pressable>

        {/* Right: Action Icons */}
        <View style={styles.rightActions}>
          {/* Context Drawer (Clipboard) */}
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={onContextPress}
            accessibilityLabel="Open program context"
            accessibilityRole="button"
          >
            <IconSymbol name="doc.on.clipboard" size={22} color={colors.text} />
          </Pressable>

          {/* Board/Roster */}
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={onBoardPress}
            accessibilityLabel="Open roster"
            accessibilityRole="button"
          >
            <IconSymbol name="rectangle.stack" size={22} color={colors.text} />
          </Pressable>

          {/* Add Person */}
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={onAddPersonPress}
            accessibilityLabel="Add person to chat"
            accessibilityRole="button"
          >
            <IconSymbol name="person.badge.plus" size={22} color={colors.text} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    height: Layout.topBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButton: {
    flex: 1,
    height: 36,
    marginHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
