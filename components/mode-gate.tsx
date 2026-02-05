/**
 * Mode Gate Component
 * Ultra-minimal first-open screen for mode selection.
 * Tap = immediate commit and navigate.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';
import type { Mode, Role } from '@/types';

// Gold accent for tap feedback only
const GOLD_ACCENT = '#C9A227';

interface ModeOption {
  mode: Mode;
  label: string;
  icon: IconSymbolName;
  defaultRole: Role;
}

const MODE_OPTIONS: ModeOption[] = [
  {
    mode: 'sports',
    label: 'Sports',
    icon: 'sportscourt.fill',
    defaultRole: 'head_coach',
  },
  {
    mode: 'enterprise',
    label: 'Enterprise',
    icon: 'building.2.fill',
    defaultRole: 'founder',
  },
  {
    mode: 'church',
    label: 'Church',
    icon: 'building.columns.fill', // Orthodox cross style - using columns as closest
    defaultRole: 'member',
  },
  {
    mode: 'education',
    label: 'Education',
    icon: 'graduationcap.fill',
    defaultRole: 'faculty',
  },
];

export function ModeGate() {
  const colorScheme = useColorScheme() ?? 'light';
  const insets = useSafeAreaInsets();
  const { switchMode, setFirstRun } = useAppContext();

  // Black/white only
  const backgroundColor = colorScheme === 'dark' ? '#000000' : '#FFFFFF';
  const textColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  const iconColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  const borderColor = colorScheme === 'dark' ? '#333333' : '#E5E5E5';

  const handleModeSelect = (option: ModeOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    switchMode(option.mode);
    setFirstRun(false);
    // Navigation happens automatically as isFirstRun becomes false
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}>
        {/* KaNeXT Logo */}
        <View style={styles.logoSection}>
          <Text style={[styles.logoText, { color: textColor }]}>KaNeXT</Text>
        </View>

        {/* Mode Options */}
        <View style={styles.optionsContainer}>
          {MODE_OPTIONS.map((option) => (
            <Pressable
              key={option.mode}
              style={({ pressed }) => [
                styles.optionRow,
                { borderBottomColor: borderColor },
                pressed && { backgroundColor: GOLD_ACCENT + '15' },
              ]}
              onPress={() => handleModeSelect(option)}
            >
              <IconSymbol name={option.icon} size={24} color={iconColor} />
              <Text style={[styles.optionLabel, { color: textColor }]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: 4,
  },

  // Options
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '400',
    marginLeft: 16,
    letterSpacing: 0.5,
  },
});
