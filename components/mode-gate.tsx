/**
 * Mode Gate Component
 * Ultra-minimal first-open screen for mode selection.
 * Tap = immediate commit and navigate.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';
import type { Mode, Role } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TILE_SIZE = (SCREEN_WIDTH - 80) / 2; // 2 columns with padding

// Gold accent for tap feedback only
const GOLD_ACCENT = '#FFFFFF';

interface ModeOption {
  mode: Mode;
  label: string;
  icon: IconSymbolName | null; // null = use text glyph
  glyph?: string; // fallback text glyph
  defaultRole: Role;
}

const MODE_OPTIONS: ModeOption[] = [
  {
    mode: 'sports',
    label: 'Sports',
    icon: 'sportscourt.fill', // basketball court icon
    defaultRole: 'head_coach',
  },
  {
    mode: 'business',
    label: 'Business',
    icon: 'briefcase.fill',
    defaultRole: 'founder',
  },
  {
    mode: 'church',
    label: 'Church',
    // TODO: Replace with custom Orthodox cross SVG asset
    icon: null,
    glyph: '☦',
    defaultRole: 'member',
  },
  {
    mode: 'education',
    label: 'Education',
    icon: 'graduationcap.fill', // diploma/grad cap
    defaultRole: 'faculty',
  },
  {
    mode: 'competition',
    label: 'Competition',
    icon: 'flag.checkered',
    defaultRole: 'league_admin',
  },
];

export function ModeGate() {
  const colorScheme = useColorScheme() ?? 'light';
  const insets = useSafeAreaInsets();
  const { completeFirstModePick } = useAppContext();

  // Black/white only
  const backgroundColor = colorScheme === 'dark' ? '#000000' : '#FFFFFF';
  const textColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  const iconColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';

  const handleModeSelect = (option: ModeOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Rule A: First-time mode selection → land on HOME
    completeFirstModePick(option.mode);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.content, { paddingTop: insets.top + 80, paddingBottom: insets.bottom + 40 }]}>
        {/* KaNeXT Wordmark */}
        <View style={styles.logoSection}>
          <Text style={[styles.logoText, { color: textColor }]}>KaNeXT</Text>
        </View>

        {/* 2x2 Grid of Mode Tiles */}
        <View style={styles.grid}>
          {MODE_OPTIONS.map((option) => (
            <Pressable
              key={option.mode}
              style={({ pressed }) => [
                styles.tile,
                pressed && { backgroundColor: GOLD_ACCENT + '10' },
              ]}
              onPress={() => handleModeSelect(option)}
            >
              {option.icon ? (
                <IconSymbol name={option.icon} size={36} color={iconColor} />
              ) : (
                <Text style={[styles.glyphIcon, { color: iconColor }]}>
                  {option.glyph}
                </Text>
              )}
              <Text style={[styles.tileLabel, { color: textColor }]}>
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
    paddingHorizontal: 24,
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 6,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 32,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  tileLabel: {
    fontSize: 15,
    fontWeight: '400',
    marginTop: 16,
    letterSpacing: 0.5,
  },
  glyphIcon: {
    fontSize: 36,
    fontWeight: '300',
  },
});
