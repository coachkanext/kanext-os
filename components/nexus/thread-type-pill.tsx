/**
 * Thread Type Pill Component
 * Small colored pill showing the conversation type (Chat/Eval/Sim).
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, ModeColors, BorderRadius, Spacing } from '@/constants/theme';
import type { ConversationType } from '@/types';

interface ThreadTypePillProps {
  type: ConversationType;
  size?: 'small' | 'default';
}

const TYPE_CONFIG: Record<ConversationType, { label: string; color: string }> = {
  chat: { label: 'Chat', color: '#FFFFFF' },
  eval: { label: 'Eval', color: '#FFFFFF' },
  sim: { label: 'Sim', color: '#FFFFFF' },
  'game-ops': { label: 'Game Ops', color: '#9C9790' },
};

export function ThreadTypePill({ type, size = 'default' }: ThreadTypePillProps) {
  const config = TYPE_CONFIG[type];
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.pill,
        isSmall && styles.pillSmall,
        { backgroundColor: config.color + '20' },
      ]}
    >
      <ThemedText
        style={[
          styles.text,
          isSmall && styles.textSmall,
          { color: config.color },
        ]}
      >
        {config.label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  pillSmall: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  textSmall: {
    fontSize: 9,
  },
});
