/**
 * Confirmation Bubble — renders an action confirmation prompt in Nexus chat.
 * Shows: action summary + context + Confirm/Cancel buttons.
 * When confirmed → collapses to receipt. When cancelled → shows strikethrough.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ConfirmationPayload } from '@/types/nexus-v2';

interface Props {
  confirmation: ConfirmationPayload;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function ConfirmationBubble({ confirmation, onConfirm, onCancel }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Already resolved
  if (confirmation.state === 'confirmed') {
    return (
      <View style={[styles.container, styles.resolved, { borderLeftColor: '#22C55E' }]}>
        <View style={styles.resolvedRow}>
          <IconSymbol name="checkmark.circle.fill" size={14} color="#22C55E" />
          <ThemedText style={[styles.resolvedText, { color: colors.textTertiary }]}>
            Confirmed: {confirmation.action_summary}
          </ThemedText>
        </View>
      </View>
    );
  }

  if (confirmation.state === 'cancelled') {
    return (
      <View style={[styles.container, styles.resolved, { borderLeftColor: colors.textTertiary }]}>
        <View style={styles.resolvedRow}>
          <IconSymbol name="xmark.circle.fill" size={14} color={colors.textTertiary} />
          <ThemedText style={[styles.resolvedText, styles.strikethrough, { color: colors.textTertiary }]}>
            Cancelled: {confirmation.action_summary}
          </ThemedText>
        </View>
      </View>
    );
  }

  // Pending state — show full confirmation
  return (
    <View style={[styles.container, { borderLeftColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.06)' }]}>
      <View style={styles.header}>
        <IconSymbol name="exclamationmark.shield.fill" size={16} color="#F59E0B" />
        <ThemedText style={[styles.confirmLabel, { color: colors.textTertiary }]}>
          Confirm
        </ThemedText>
      </View>

      <ThemedText style={[styles.actionSummary, { color: colors.text }]}>
        {confirmation.action_summary}
      </ThemedText>

      <ThemedText style={[styles.context, { color: colors.textTertiary }]}>
        Context: {confirmation.target_context}
      </ThemedText>

      <ThemedText style={[styles.impact, { color: colors.textSecondary }]}>
        {confirmation.impact_line}
      </ThemedText>

      {confirmation.requires_audit_note && (
        <ThemedText style={[styles.auditNote, { color: '#F59E0B' }]}>
          An audit note will be required.
        </ThemedText>
      )}

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.btn,
            styles.confirmBtn,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={onConfirm}
        >
          <ThemedText style={styles.confirmBtnText}>Confirm</ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.btn,
            styles.cancelBtn,
            { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={onCancel}
        >
          <ThemedText style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 3,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
  },
  resolved: {
    paddingVertical: Spacing.sm,
  },
  resolvedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resolvedText: {
    fontSize: 13,
    flex: 1,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  confirmLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionSummary: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 4,
  },
  context: {
    fontSize: 12,
    marginBottom: 2,
  },
  impact: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  auditNote: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtn: {
    backgroundColor: '#22C55E',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cancelBtn: {
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
