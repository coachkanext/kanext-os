/**
 * Global Header Component
 * Persistent header visible on all tabs with Avatar Drawer trigger and Mode Selector.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { AvatarDrawer } from '@/components/avatar-drawer';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';
import type { Mode } from '@/types';

const HEADER_HEIGHT = 44;

const MODE_LABELS: Record<Mode, string> = {
  sports: 'Sports',
  enterprise: 'Enterprise',
  church: 'Church',
  education: 'Education',
};

export function GlobalHeader() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, switchMode } = useAppContext();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const modeColor = ModeColors[state.mode].primary;

  const handleModeSelect = (mode: Mode) => {
    // Rule C: Mode switch → navigate to HOME tab of that mode
    switchMode(mode);
    setDropdownVisible(false);
    // Navigate to Home tab after mode switch
    router.replace('/(tabs)' as any);
  };

  return (
    <>
      {/* Header Bar */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            height: HEADER_HEIGHT + insets.top,
            backgroundColor: colors.background,
            borderBottomColor: colors.divider,
          },
        ]}
      >
        <View style={styles.headerContent}>
          {/* Avatar Trigger (Left) */}
          <Pressable
            style={({ pressed }) => [
              styles.avatarButton,
              { backgroundColor: pressed ? colors.backgroundSecondary : colors.backgroundTertiary },
            ]}
            onPress={() => setDrawerVisible(true)}
            accessibilityLabel="Open profile drawer"
            accessibilityRole="button"
          >
            <IconSymbol name="person.fill" size={18} color={colors.icon} />
          </Pressable>

          {/* Mode Pill (Center) */}
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
            <View style={[styles.modeIndicator, { backgroundColor: modeColor }]} />
            <Text style={[styles.modeLabel, { color: colors.text }]}>
              {MODE_LABELS[state.mode]}
            </Text>
            <IconSymbol name="chevron.down" size={12} color={colors.textSecondary} />
          </Pressable>

          {/* Empty spacer (Right) - for balance */}
          <View style={styles.spacer} />
        </View>
      </View>

      {/* Avatar Drawer */}
      <AvatarDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />

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
                top: insets.top + HEADER_HEIGHT + 4,
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
                  <View style={[styles.dropdownIndicator, { backgroundColor: itemColor }]} />
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
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  avatarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  modeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  spacer: {
    width: 32,
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
  dropdownIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dropdownLabel: {
    fontSize: 15,
  },
});
