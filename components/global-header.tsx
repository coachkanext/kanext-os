/**
 * Global Header Component
 * Persistent header visible on all tabs with Avatar Drawer trigger and Mode Selector.
 */

import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { AvatarDrawer } from '@/components/avatar-drawer';
import { ModeSelector } from '@/components/nexus/mode-selector';
import { Colors, Spacing, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';

const HEADER_HEIGHT = 44;

export function GlobalHeader() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { state, switchMode } = useAppContext();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modeSelectorVisible, setModeSelectorVisible] = useState(false);

  const modeColor = ModeColors[state.mode].primary;

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

          {/* Mode Selector Trigger (Right) */}
          <Pressable
            style={({ pressed }) => [
              styles.modeButton,
              {
                backgroundColor: pressed ? colors.backgroundSecondary : 'transparent',
                borderColor: modeColor,
              },
            ]}
            onPress={() => setModeSelectorVisible(true)}
            accessibilityLabel="Switch mode"
            accessibilityRole="button"
          >
            <View style={[styles.modeIndicator, { backgroundColor: modeColor }]} />
            <IconSymbol name="chevron.down" size={12} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Avatar Drawer */}
      <AvatarDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />

      {/* Mode Selector Modal */}
      <ModeSelector
        visible={modeSelectorVisible}
        currentMode={state.mode}
        onSelect={switchMode}
        onClose={() => setModeSelectorVisible(false)}
      />
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
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  modeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
