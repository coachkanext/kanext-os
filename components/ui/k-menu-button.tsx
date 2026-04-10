/**
 * KMenuButton — K brand logo used as the sidebar trigger on every screen.
 * Drop-in replacement for the three-line hamburger icon.
 * Accepts optional onPress to act as its own pressable (no outer wrapper needed).
 */

import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/use-colors';

interface KMenuButtonProps {
  onPress?: () => void;
}

export function KMenuButton({ onPress }: KMenuButtonProps) {
  const C = useColors();
  const label = <Text style={[styles.k, { color: C.label }]}>K</Text>;
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.hit}>
        {label}
      </Pressable>
    );
  }
  return label;
}

const styles = StyleSheet.create({
  k: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  hit: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
