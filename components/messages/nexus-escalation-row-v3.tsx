/**
 * NexusEscalationRowV3 — Single escalation row with context chips + rich status.
 * Avatar · Asker name/role · Question text · Context chips · Timestamp · Status chip.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMode } from '@/context/app-context';
import { formatMessageTime } from '@/data/mock-messages-v3';
import type { Mode, NexusEscalationV3, NexusEscalationStatus } from '@/types';

interface NexusEscalationRowV3Props {
  escalation: NexusEscalationV3;
  onPress: () => void;
}

const HUMAN_ANSWER_LABEL: Record<Mode, string> = {
  sports: 'Answered by Coach',
  church: 'Answered by Leader',
  business: 'Answered by Authority',
  education: 'Answered',
  competition: 'Answered',
};

function getStatusConfig(status: NexusEscalationStatus, accent: string, mode: Mode) {
  switch (status) {
    case 'answered_by_nexus':
      return { label: 'Answered by Nexus', color: '#22C55E', bg: '#22C55E20' };
    case 'answered_by_coach':
      return { label: HUMAN_ANSWER_LABEL[mode], color: accent, bg: `${accent}20` };
    case 'escalated':
      return { label: 'Escalated', color: '#F59E0B', bg: '#F59E0B20' };
    case 'unanswered':
    default:
      return { label: 'Unanswered', color: '#F59E0B', bg: '#F59E0B20' };
  }
}

const CHIP_ICONS: Record<string, string> = {
  event: 'calendar',
  media: 'play.rectangle',
  person: 'person',
  deal: 'doc.text',
  finance: 'banknote',
  compliance: 'shield',
  facility: 'building.2',
  policy: 'doc.plaintext',
  capital: 'chart.bar',
};

export function NexusEscalationRowV3({ escalation, onPress }: NexusEscalationRowV3Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const mode = useMode();
  const isOpen = escalation.status === 'unanswered' || escalation.status === 'escalated';
  const statusConfig = getStatusConfig(escalation.status, accent, mode);

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
      <View style={[styles.avatar, { backgroundColor: isOpen ? `${accent}20` : colors.backgroundTertiary }]}>
        <ThemedText style={[styles.avatarText, { color: isOpen ? accent : colors.textSecondary }]}>
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
          style={[styles.question, { color: colors.text }, isOpen && styles.questionBold]}
          numberOfLines={2}
        >
          {escalation.question}
        </ThemedText>

        {/* Context chips */}
        {escalation.contextChips && escalation.contextChips.length > 0 && (
          <View style={styles.chipsRow}>
            {escalation.contextChips.map((chip, i) => (
              <View key={i} style={[styles.chip, { backgroundColor: colors.backgroundTertiary }]}>
                <IconSymbol
                  name={CHIP_ICONS[chip.type] as any}
                  size={11}
                  color={colors.textTertiary}
                />
                <ThemedText style={[styles.chipText, { color: colors.textSecondary }]}>
                  {chip.label}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomRow}>
          <ThemedText style={[styles.context, { color: colors.textTertiary }]} numberOfLines={1}>
            {escalation.viewingContext}
          </ThemedText>
          <View style={[styles.statusChip, { backgroundColor: statusConfig.bg }]}>
            <ThemedText style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
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
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '500',
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
