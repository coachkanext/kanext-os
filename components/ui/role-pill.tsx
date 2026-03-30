/**
 * RolePill — RBAC demo role switcher.
 * Tap to cycle between Role A (admin) and Role B (lower-tier).
 * Role A renders with mode accent on fill; Role B with surface bg + accent text.
 */

import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';

interface RolePillProps {
  role: string;
  onPress: () => void;
  /** Mode accent hex — defaults to C.accent */
  accentColor?: string;
  /** If true the pill renders as "primary" (filled accent); defaults based on whether role index is 0 */
  isPrimary?: boolean;
}

export function RolePill({ role, onPress, accentColor: _accentColor, isPrimary = true }: RolePillProps) {
  const C = useColors();
  // Active pills are ALWAYS black fill + white text per design spec.
  // accentColor prop accepted for backwards-compat but no longer drives color.
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[
        s.pill,
        isPrimary
          ? { backgroundColor: C.activePill, borderColor: C.activePill }
          : { backgroundColor: C.surface, borderColor: C.separator },
      ]}
    >
      <Text style={[s.text, { color: isPrimary ? C.activePillText : C.secondary }]}>{role}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
