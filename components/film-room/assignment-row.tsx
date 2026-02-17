/**
 * AssignmentRow — Film assignment row with progress bar and due date.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getAssignmentStatusColor,
  getAssignmentStatusLabel,
  type FilmAssignment,
} from '@/data/mock-sports-workspaces';

interface AssignmentRowProps {
  assignment: FilmAssignment;
}

export function AssignmentRow({ assignment }: AssignmentRowProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const statusColor = getAssignmentStatusColor(assignment.status);
  const progress = assignment.totalClips > 0 ? assignment.completedClips / assignment.totalClips : 0;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? colors.cardElevated : colors.card },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      {/* Title + Status */}
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {assignment.title}
        </ThemedText>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '1A' }]}>
          <ThemedText style={[styles.statusText, { color: statusColor }]}>
            {getAssignmentStatusLabel(assignment.status)}
          </ThemedText>
        </View>
      </View>

      {/* Assigned-to avatars */}
      <View style={styles.avatarRow}>
        {assignment.assignedTo.map((person, i) => (
          <View
            key={i}
            style={[
              styles.avatar,
              { backgroundColor: person.color, marginLeft: i === 0 ? 0 : -6 },
            ]}
          >
            <ThemedText style={styles.avatarText}>{person.initials}</ThemedText>
          </View>
        ))}
        <ThemedText style={[styles.names, { color: colors.textSecondary }]} numberOfLines={1}>
          {assignment.assignedTo.map((p) => p.name.split(' ')[0]).join(', ')}
        </ThemedText>
      </View>

      {/* Due date */}
      <View style={styles.dueRow}>
        <ThemedText
          style={[
            styles.dueText,
            { color: assignment.isOverdue ? '#EF4444' : colors.textTertiary },
          ]}
        >
          Due: {assignment.dueDate}
          {assignment.isOverdue ? ' (OVERDUE)' : ''}
        </ThemedText>
      </View>

      {/* Progress bar */}
      <View style={styles.progressRow}>
        <View style={[styles.progressBg, { backgroundColor: colors.backgroundTertiary }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%`, backgroundColor: statusColor },
            ]}
          />
        </View>
        <ThemedText style={[styles.progressText, { color: colors.textTertiary }]}>
          {assignment.completedClips}/{assignment.totalClips}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm + 4,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#000',
  },
  avatarText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#fff',
  },
  names: {
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  dueRow: {
    flexDirection: 'row',
  },
  dueText: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    minWidth: 30,
  },
});
