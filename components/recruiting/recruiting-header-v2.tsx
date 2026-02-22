/**
 * Recruiting Header V2 — 3-segment toggle: Board | Database | Portal
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import type { RecruitingViewModeV2 } from '@/types';

const SEGMENTS: { key: RecruitingViewModeV2; label: string }[] = [
  { key: 'board', label: 'Board' },
  { key: 'database', label: 'Database' },
  { key: 'portal', label: 'Portal' },
];

interface Props {
  activeMode: RecruitingViewModeV2;
  onModeChange: (mode: RecruitingViewModeV2) => void;
  colors: typeof Colors.light;
}

export function RecruitingHeaderV2({ activeMode, onModeChange, colors }: Props) {
  const accent = useAccentColor();

  return (
    <View style={styles.container}>
      {/* Segment toggle */}
      <View style={[styles.segmentBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {SEGMENTS.map((seg) => {
          const isActive = activeMode === seg.key;
          return (
            <Pressable
              key={seg.key}
              style={[styles.segment, isActive && { backgroundColor: accent }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onModeChange(seg.key);
              }}
            >
              <ThemedText style={[styles.segmentText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {seg.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
  },
  segmentBar: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    gap: 2,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
