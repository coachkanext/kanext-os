/**
 * Global Header — Mode Selector Pill
 * Fixed at top of every page. Tap to open mode dropdown.
 * Same pill design on all screens including Nexus.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Layout, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';
import type { Mode } from '@/types';

// ── Global left-action handler (Nexus hamburger) ──
let _leftActionHandler: (() => void) | null = null;

export function registerHeaderLeftAction(cb: (() => void) | null) {
  _leftActionHandler = cb;
}

const MODE_LABELS: Record<Mode, string> = {
  sports: 'Sports',
  enterprise: 'Business',
  church: 'Church',
  education: 'Education',
  community: 'Competition',
};

const MODE_ICONS: Record<Mode, IconSymbolName> = {
  sports: 'basketball.fill',
  enterprise: 'briefcase.fill',
  church: 'building.columns.fill',
  education: 'graduationcap.fill',
  community: 'flag.checkered',
};

interface GlobalHeaderProps {
  /** Left icon slot — render a custom left button (e.g., hamburger, back) */
  leftIcon?: React.ReactNode;
  /** Right icon slot — render a custom right button */
  rightIcon?: React.ReactNode;
}

export function GlobalHeader({ leftIcon, rightIcon }: GlobalHeaderProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { state, switchMode } = useAppContext();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const modeColor = ModeColors[state.mode].primary;
  const isNexus = pathname === '/nexus';

  const handleModeSelect = (mode: Mode) => {
    if (mode !== state.mode) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      switchMode(mode);
    }
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
          {/* Left slot */}
          {leftIcon ?? (isNexus ? (
            <Pressable
              style={({ pressed }) => [
                styles.slotSpacer,
                { opacity: pressed ? 0.7 : 1, alignItems: 'center' as const, justifyContent: 'center' as const },
              ]}
              onPress={() => _leftActionHandler?.()}
              accessibilityLabel="Open conversations"
              accessibilityRole="button"
            >
              <IconSymbol name="line.horizontal.3" size={30} color={colors.text} />
            </Pressable>
          ) : <View style={styles.slotSpacer} />)}

          {/* Center: Mode Selector Pill */}
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
          </Pressable>

          {/* Right slot */}
          {rightIcon ?? <View style={styles.slotSpacer} />}
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
    // Fixed at top — no border
  },
  content: {
    height: Layout.topBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
  },
  slotSpacer: {
    width: 44,
    height: 44,
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
