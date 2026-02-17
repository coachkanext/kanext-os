/**
 * Nexus Top Bar Component
 * Single header for Nexus screen with conversations, mode selector, and overlay controls.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Layout, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';
import type { Mode } from '@/types';

const MODE_LABELS: Record<Mode, string> = {
  sports: 'Sports',
  enterprise: 'Business',
  business: 'Business',
  church: 'Church',
  education: 'Education',
  competition: 'Competition',
};

const MODE_ICONS: Record<Mode, import('@/components/ui/icon-symbol').IconSymbolName> = {
  sports: 'basketball.fill',
  enterprise: 'briefcase.fill',
  business: 'briefcase.fill',
  church: 'building.columns.fill',
  education: 'graduationcap.fill',
  competition: 'flag.checkered',
};

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
  const { state, switchMode } = useAppContext();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const modeColor = ModeColors[state.mode].primary;

  const handleModeSelect = (mode: Mode) => {
    switchMode(mode);
    setDropdownVisible(false);
  };

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
          <Pressable
            style={({ pressed }) => [
              styles.modePill,
              {
                backgroundColor: pressed ? colors.backgroundSecondary : colors.backgroundTertiary,
              },
            ]}
            onPress={() => setDropdownVisible(true)}
            accessibilityLabel="Switch mode"
            accessibilityRole="button"
          >
            <IconSymbol name={MODE_ICONS[state.mode]} size={14} color={modeColor} />
            <Text style={[styles.modeLabel, { color: colors.text }]}>
              {MODE_LABELS[state.mode]}
            </Text>
            <IconSymbol name="chevron.down" size={12} color={colors.textSecondary} />
          </Pressable>

          {/* Right: spacer to keep mode pill centered */}
          <View style={styles.iconButton} />
        </View>
      </View>

      {/* Mode Dropdown */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <Pressable
          style={styles.dropdownOverlay}
          onPress={() => setDropdownVisible(false)}
        >
          <View
            style={[
              styles.dropdown,
              {
                backgroundColor: colors.card,
                top: insets.top + Layout.topBarHeight + 4,
              },
            ]}
          >
            {(Object.keys(MODE_LABELS) as Mode[]).map((mode) => {
              const isSelected = mode === state.mode;
              const itemColor = ModeColors[mode].primary;

              return (
                <Pressable
                  key={mode}
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    {
                      backgroundColor: pressed
                        ? colors.backgroundSecondary
                        : isSelected
                        ? colors.backgroundSecondary
                        : 'transparent',
                    },
                  ]}
                  onPress={() => handleModeSelect(mode)}
                >
                  <IconSymbol name={MODE_ICONS[mode]} size={14} color={itemColor} />
                  <Text
                    style={[
                      styles.dropdownLabel,
                      { color: colors.text },
                      isSelected && { fontWeight: '600' },
                    ]}
                  >
                    {MODE_LABELS[mode]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
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
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownOverlay: {
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    alignSelf: 'center',
    minWidth: 140,
    borderRadius: BorderRadius.md,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  dropdownLabel: {
    fontSize: 15,
  },
});
