/**
 * Receipt Bubble — renders an immutable action receipt in the Nexus chat.
 * Shows: status icon + colored border + summary + link chips.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { LinkChipRow } from './link-chip';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ReceiptPayload, LinkChip } from '@/types/nexus-v2';

const STATUS_CONFIG: Record<string, { icon: IconSymbolName; color: string; label: string }> = {
  done: { icon: 'checkmark.circle.fill', color: '#22C55E', label: 'Done' },
  created: { icon: 'plus.circle.fill', color: '#1D9BF0', label: 'Created' },
  posted: { icon: 'paperplane.fill', color: '#1D9BF0', label: 'Posted' },
  updated: { icon: 'arrow.triangle.2.circlepath', color: '#F59E0B', label: 'Updated' },
  blocked: { icon: 'xmark.circle.fill', color: '#EF4444', label: 'Blocked' },
  escalated: { icon: 'arrow.up.right.circle.fill', color: '#F59E0B', label: 'Escalated' },
  failed: { icon: 'exclamationmark.triangle.fill', color: '#EF4444', label: 'Failed' },
};

interface Props {
  receipt: ReceiptPayload;
  onChipPress?: (chip: LinkChip) => void;
}

export function RececeptBubble({ receipt, onChipPress }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const config = STATUS_CONFIG[receipt.status] || STATUS_CONFIG.done;

  return (
    <View style={[styles.container, { borderLeftColor: config.color }]}>
      <View style={styles.header}>
        <IconSymbol name={config.icon} size={16} color={config.color} />
        <ThemedText style={[styles.summary, { color: colors.text }]}>
          {receipt.summary}
        </ThemedText>
      </View>

      {receipt.target_room && (
        <ThemedText style={[styles.targetRoom, { color: colors.textTertiary }]}>
          → {receipt.target_room}
        </ThemedText>
      )}

      {receipt.objects && receipt.objects.length > 0 && (
        <LinkChipRow chips={receipt.objects} onPress={onChipPress} compact />
      )}
    </View>
  );
}

// Re-export with correct name
export { RececeptBubble as ReceiptBubble };

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 3,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm + 2,
    marginVertical: Spacing.xs,
    paddingLeft: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  summary: {
    fontSize: 13.5,
    fontWeight: '500',
    lineHeight: 19,
    flex: 1,
  },
  targetRoom: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 24,
  },
});
