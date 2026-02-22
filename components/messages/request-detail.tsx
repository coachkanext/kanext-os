/**
 * Request Detail — Bottom sheet with Approve/Ignore/Block/Report actions.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Spacing, BorderRadius } from '@/constants/theme';
import { getRequestTypeLabel, getRequestTypeColor } from '@/data/mock-requests';
import type { RequestItem } from '@/data/mock-requests';
import { formatMessageTime } from '@/data/mock-messages';

interface RequestDetailProps {
  request: RequestItem;
  onApprove: () => void;
  onIgnore: () => void;
  onBlock: () => void;
  onReport: () => void;
}

export function RequestDetail({ request, onApprove, onIgnore, onBlock, onReport }: RequestDetailProps) {
  const typeLabel = getRequestTypeLabel(request.type);
  const typeColor = getRequestTypeColor(request.type);
  const isPending = request.status === 'pending';

  const handleAction = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    action();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarText}>{request.initials}</ThemedText>
        </View>
        <View style={styles.headerInfo}>
          <ThemedText style={styles.name}>{request.name}</ThemedText>
          <View style={[styles.typeBadge, { backgroundColor: `${typeColor}20` }]}>
            <ThemedText style={[styles.typeText, { color: typeColor }]}>{typeLabel}</ThemedText>
          </View>
        </View>
      </View>

      {/* Context */}
      <ThemedText style={styles.context}>{request.context}</ThemedText>

      {/* Message */}
      {request.message && (
        <View style={styles.messageBox}>
          <ThemedText style={styles.messageText}>{request.message}</ThemedText>
        </View>
      )}

      {/* Meta */}
      <ThemedText style={styles.timestamp}>
        Received {formatMessageTime(request.timestamp)}
      </ThemedText>

      {/* Actions */}
      {isPending ? (
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.approveBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => handleAction(onApprove)}
          >
            <ThemedText style={styles.approveBtnText}>Approve</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => handleAction(onIgnore)}
          >
            <ThemedText style={styles.actionBtnText}>Ignore</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.dangerBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => handleAction(onBlock)}
          >
            <ThemedText style={styles.dangerBtnText}>Block</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.dangerBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => handleAction(onReport)}
          >
            <ThemedText style={styles.dangerBtnText}>Report</ThemedText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.approvedRow}>
          <View style={styles.approvedBadge}>
            <ThemedText style={styles.approvedText}>Approved</ThemedText>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#A1A1AA',
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  context: {
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: Spacing.md,
  },
  messageBox: {
    backgroundColor: '#111',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  messageText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    color: '#555',
    marginBottom: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.sm,
  },
  actionBtn: {
    backgroundColor: '#0B0F14',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
  },
  approveBtn: {
    backgroundColor: '#FFFFFF',
  },
  approveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dangerBtn: {
    backgroundColor: '#EF444420',
  },
  dangerBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  approvedRow: {
    marginTop: Spacing.sm,
  },
  approvedBadge: {
    backgroundColor: '#22C55E20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  approvedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
  },
});
