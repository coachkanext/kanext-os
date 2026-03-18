/**
 * GlassView — KaNeXT Liquid Glass material system.
 *
 * Tier 1 — Heavy Glass: tiles, cards, sheets
 * Tier 2 — Medium Glass: nav bars, inputs, buttons, pills
 * Tier 3 — Light Glass: overlays, subtle surfaces
 *
 * Uses expo-blur (BlurView) for true backdrop blur on iOS.
 * On Android API < 31, BlurView falls back to a solid tint automatically.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export type GlassTier = 1 | 2 | 3;

interface GlassViewProps {
  tier?: GlassTier;
  /** Override default border radius for the tier */
  radius?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

const TIERS = {
  1: {
    intensity: 40,
    colors: ['rgba(255,255,255,0.72)', 'rgba(255,255,255,0.42)', 'rgba(255,255,255,0.62)'] as const,
    border: 'rgba(255,255,255,0.80)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
    defaultRadius: 20,
  },
  2: {
    intensity: 20,
    colors: ['rgba(255,255,255,0.52)', 'rgba(255,255,255,0.26)'] as const,
    border: 'rgba(255,255,255,0.60)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    defaultRadius: 12,
  },
  3: {
    intensity: 10,
    colors: ['rgba(255,255,255,0.30)', 'rgba(255,255,255,0.30)'] as const,
    border: 'rgba(255,255,255,0.40)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    defaultRadius: 12,
  },
} as const;

export function GlassView({ tier = 1, radius, style, children }: GlassViewProps) {
  const t = TIERS[tier];
  const r = radius ?? t.defaultRadius;

  return (
    <View
      style={[
        {
          borderRadius: r,
          borderWidth: 1,
          borderColor: t.border,
          shadowColor: t.shadowColor,
          shadowOffset: t.shadowOffset,
          shadowOpacity: t.shadowOpacity,
          shadowRadius: t.shadowRadius,
          elevation: t.elevation,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {/* Backdrop blur */}
      <BlurView
        intensity={t.intensity}
        tint="light"
        style={StyleSheet.absoluteFill}
      />

      {/* Glass gradient overlay */}
      <LinearGradient
        colors={t.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Top-half light refraction highlight */}
      <LinearGradient
        colors={['rgba(255,255,255,0.50)', 'rgba(255,255,255,0.00)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={s.highlight}
        pointerEvents="none"
      />

      {children}
    </View>
  );
}

const s = StyleSheet.create({
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
});
