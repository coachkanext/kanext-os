/**
 * Mode Switcher Overlay
 * Floating popup that appears above the Ops tab on long-press.
 * Shows 4 mode icons (excluding current mode). Tap to switch.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Pressable, Modal, StyleSheet, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { Colors, Layout, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';
import { registerModeSwitcherHandlers } from '@/utils/global-mode-switcher';
import type { Mode } from '@/types';

const ALL_MODES: { mode: Mode; icon: IconSymbolName; label: string }[] = [
  { mode: 'education', icon: 'graduationcap.fill', label: 'Education' },
  { mode: 'competition', icon: 'trophy.fill', label: 'Competition' },
  { mode: 'sports', icon: 'basketball.fill', label: 'Sports' },
  { mode: 'church', icon: 'building.columns.fill', label: 'Church' },
  { mode: 'business', icon: 'briefcase.fill', label: 'Business' },
];

export function ModeSwitcherOverlay() {
  const [visible, setVisible] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { state, switchMode } = useAppContext();

  useEffect(() => {
    registerModeSwitcherHandlers(
      () => setVisible(true),
      () => setVisible(false),
    );
  }, []);

  const handleSelect = useCallback((mode: Mode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    switchMode(mode);
    setVisible(false);
  }, [switchMode]);

  const otherModes = ALL_MODES.filter((m) => m.mode !== state.mode);
  const tabBarH = Platform.OS === 'ios' ? Layout.tabBarHeight : 60;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
        <View
          style={[
            styles.popup,
            {
              backgroundColor: colors.card,
              bottom: tabBarH + 12,
              right: 12,
            },
          ]}
        >
          {otherModes.map((m) => {
            const modeColor = ModeColors[m.mode].primary;
            return (
              <Pressable
                key={m.mode}
                style={({ pressed }) => [
                  styles.modeButton,
                  pressed && { backgroundColor: colors.backgroundSecondary },
                ]}
                onPress={() => handleSelect(m.mode)}
              >
                <View style={[styles.iconCircle, { backgroundColor: modeColor + '20' }]}>
                  <IconSymbol name={m.icon} size={20} color={modeColor} />
                </View>
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  popup: {
    position: 'absolute',
    flexDirection: 'row',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 6,
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  modeButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
