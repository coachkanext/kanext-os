/**
 * Game Plan V2 — Collapsible staff assignment strip.
 * Shows 5 role pills with status dots. Tap a role to scroll to its section.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { StaffAssignment, AssignmentStatus } from './game-plan-types';

interface Props {
  assignments: StaffAssignment[];
  onRoleTap?: (sectionNumber: number) => void;
}

const STATUS_COLORS: Record<AssignmentStatus, string> = {
  not_started: '#888',
  in_progress: Brand.warning,
  ready: Brand.precision,
  approved: Brand.success,
};

export function GamePlanStaffStrip({ assignments, onRoleTap }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [expanded, setExpanded] = useState(false);

  const readyCount = assignments.filter((a) => a.status === 'ready' || a.status === 'approved').length;
  const total = assignments.length;

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(!expanded);
  };

  const handleRoleTap = (a: StaffAssignment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onRoleTap && a.sections.length > 0) {
      onRoleTap(a.sections[0]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      {/* Collapsed row */}
      <Pressable style={styles.collapsedRow} onPress={handleToggle}>
        <ThemedText style={[styles.summaryText, { color: colors.textSecondary }]}>
          {readyCount}/{total} Ready
        </ThemedText>
        <View style={styles.miniDots}>
          {assignments.map((a) => (
            <View key={a.role} style={[styles.miniDot, { backgroundColor: STATUS_COLORS[a.status] }]} />
          ))}
        </View>
        <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={12} color={colors.textTertiary} />
      </Pressable>

      {/* Expanded pill row */}
      {expanded && (
        <View style={styles.pillRow}>
          {assignments.map((a) => (
            <Pressable
              key={a.role}
              style={[styles.pill, { backgroundColor: colors.backgroundTertiary }]}
              onPress={() => handleRoleTap(a)}
            >
              <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[a.status] }]} />
              <ThemedText style={[styles.pillLabel, { color: colors.text }]}>{a.role}</ThemedText>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
  },
  collapsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.sm,
  },
  summaryText: { fontSize: 12, fontWeight: '600' },
  miniDots: { flexDirection: 'row', gap: 4, flex: 1 },
  miniDot: { width: 6, height: 6, borderRadius: 3 },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.sm + 2,
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    gap: 5,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  pillLabel: { fontSize: 12, fontWeight: '600' },
});
