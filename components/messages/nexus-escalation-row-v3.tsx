/**
 * NexusEscalationRowV3 — Single escalation row.
 * Avatar · Asker name/role · Question text · Viewing context · Timestamp · Status chip.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatMessageTime } from '@/data/mock-messages-v3';
import type { NexusEscalationV3 } from '@/types';

interface NexusEscalationRowV3Props {
  escalation: NexusEscalationV3;
  onPress: () => void;
}

export function NexusEscalationRowV3({ escalation, onPress }: NexusEscalationRowV3Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isUnanswered = escalation.status === 'unanswered';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? colors.backgroundSecondary : 'transparent', borderBottomColor: colors.border },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: isUnanswered ? '#1E40AF20' : colors.backgroundTertiary }]}>
        <ThemedText style={[styles.avatarText, { color: isUnanswered ? '#1E40AF' : colors.textSecondary }]}>
          {escalation.askerInitials}
        </ThemedText>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topLine}>
          <ThemedText style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {escalation.askerName}
          </ThemedText>
          <ThemedText style={[styles.time, { color: colors.textTertiary }]}>
            {formatMessageTime(escalation.timestamp)}
          </ThemedText>
        </View>

        <ThemedText style={[styles.role, { color: colors.textTertiary }]} numberOfLines={1}>
          {escalation.askerRole}
        </ThemedText>

        <ThemedText
          style={[styles.question, { color: colors.text }, isUnanswered && styles.questionBold]}
          numberOfLines={2}
        >
          {escalation.question}
        </ThemedText>

        <View style={styles.bottomRow}>
          <ThemedText style={[styles.context, { color: colors.textTertiary }]} numberOfLines={1}>
            {escalation.viewingContext}
          </ThemedText>
          <View style={[styles.statusChip, { backgroundColor: isUnanswered ? '#D9770620' : '#22C55E20' }]}>
            <ThemedText style={[styles.statusText, { color: isUnanswered ? '#D97706' : '#22C55E' }]}>
              {isUnanswered ? 'Unanswered' : 'Answered'}
            </ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  time: {
    fontSize: 12,
    marginLeft: 8,
  },
  role: {
    fontSize: 12,
    marginTop: 1,
  },
  question: {
    fontSize: 14,
    lineHeight: 19,
    marginTop: 4,
  },
  questionBold: {
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  context: {
    fontSize: 12,
    flex: 1,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
