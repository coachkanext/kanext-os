/**
 * Nexus Top Bar Component
 * Single header for Nexus screen with conversations, mode selector dropdown, and overlay controls.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Layout, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext, useMode } from '@/context/app-context';
import type { Mode } from '@/types';

const MODE_OPTIONS: { mode: Mode; label: string }[] = [
  { mode: 'sports', label: 'Athletics' },
  { mode: 'competition', label: 'Competition' },
  { mode: 'church', label: 'Faith' },
  { mode: 'education', label: 'Education' },
  { mode: 'business', label: 'Business' },
];

function getModeLabel(mode: Mode): string {
  return MODE_OPTIONS.find((o) => o.mode === mode)?.label ?? mode;
}

interface NexusTopBarProps {
  onConversationsPress: () => void;
  onContextPress: () => void;
  onBoardPress: () => void;
  isGameOps?: boolean;
  onBackPress?: () => void;
}

export function NexusTopBar({
  onConversationsPress,
  onContextPress,
  onBoardPress,
  isGameOps = false,
  onBackPress,
}: NexusTopBarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const mode = useMode();
  const { switchMode } = useAppContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleModeSelect = useCallback((selected: Mode) => {
    if (selected !== mode) {
      switchMode(selected);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setDropdownOpen(false);
  }, [mode, switchMode]);

  return (
    <>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top,
          },
        ]}
      >
        <View style={styles.content}>
          {/* Left: Back (Game Ops) or Conversations Menu */}
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={isGameOps && onBackPress ? onBackPress : onConversationsPress}
            accessibilityLabel={isGameOps ? 'Go back' : 'Open conversations'}
            accessibilityRole="button"
          >
            <IconSymbol
              name={isGameOps ? 'chevron.left' : 'line.horizontal.3'}
              size={isGameOps ? 22 : 24}
              color={colors.text}
            />
          </Pressable>

          {/* Center: Mode Selector */}
          <View style={styles.modeSelectorWrapper}>
            <Pressable
              style={styles.modeSelectorRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDropdownOpen((v) => !v);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Current mode: ${getModeLabel(mode)}. Tap to change.`}
            >
              <Text style={[styles.modeSelectorText, { color: colors.text }]}>
                {getModeLabel(mode)}
              </Text>
              <View style={styles.modeSelectorDot} />
            </Pressable>

            {dropdownOpen && (
              <>
                <Pressable style={styles.dropdownBackdrop} onPress={() => setDropdownOpen(false)} />
                <View style={[styles.dropdownCard, { backgroundColor: colors.card }]}>
                  {MODE_OPTIONS.map((option) => {
                    const isActive = option.mode === mode;
                    return (
                      <Pressable
                        key={option.mode}
                        style={({ pressed }) => [
                          styles.dropdownOption,
                          pressed && { opacity: 0.6 },
                        ]}
                        onPress={() => handleModeSelect(option.mode)}
                      >
                        <Text
                          style={[
                            styles.dropdownOptionText,
                            { color: colors.text },
                            isActive && styles.dropdownOptionTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                        {isActive && <View style={styles.dropdownActiveDot} />}
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </View>

          {/* Right: spacer to keep mode selector centered */}
          <View style={styles.iconButton} />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    // Single header - no border
  },
  content: {
    height: Layout.topBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Mode Selector
  modeSelectorWrapper: {
    zIndex: 100,
    alignItems: 'center',
  },
  modeSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  modeSelectorText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modeSelectorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },

  // Mode Dropdown
  dropdownBackdrop: {
    ...StyleSheet.absoluteFillObject,
    top: -500,
    bottom: -5000,
    left: -500,
    right: -500,
    zIndex: 99,
  },
  dropdownCard: {
    position: 'absolute',
    top: 36,
    zIndex: 100,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.xs,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  dropdownOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownOptionTextActive: {
    fontWeight: '700',
  },
  dropdownActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});
