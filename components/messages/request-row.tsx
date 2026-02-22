/**
 * Request Row — Request item with context + approve/ignore actions.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Spacing, BorderRadius } from '@/constants/theme';
import { getRequestTypeLabel, getRequestTypeColor } from '@/data/mock-requests';
import type { RequestItem } from '@/data/mock-requests';

interface RequestRowProps {
  request: RequestItem;
  onPress: () => void;
  onApprove: () => void;
  onIgnore: () => void;
}

export function RequestRow({ request, onPress, onApprove, onIgnore }: RequestRowProps) {
  const typeLabel = getRequestTypeLabel(request.type);
  const typeColor = getRequestTypeColor(request.type);
  const isPending = request.status === 'pending';

  const handleApprove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onApprove();
  };

  const handleIgnore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onIgnore();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? '#0B0F14' : 'transparent' },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      {/* Avatar */}
      <View style={styles.avatar}>
        <ThemedText style={styles.avatarText}>{request.initials}</ThemedText>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <ThemedText style={styles.name} numberOfLines={1}>{request.name}</ThemedText>
          <View style={[styles.typeBadge, { backgroundColor: `${typeColor}20` }]}>
            <ThemedText style={[styles.typeText, { color: typeColor }]}>{typeLabel}</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.context} numberOfLines={1}>{request.context}</ThemedText>
        {request.message && (
          <ThemedText style={styles.message} numberOfLines={2}>{request.message}</ThemedText>
        )}
      </View>

      {/* Actions (pending only) */}
      {isPending ? (
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.approveBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={handleApprove}
          >
            <ThemedText style={styles.approveBtnText}>Approve</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.ignoreBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={handleIgnore}
          >
            <ThemedText style={styles.ignoreBtnText}>Ignore</ThemedText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.approvedBadge}>
          <ThemedText style={styles.approvedText}>Approved</ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#0B0F14',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 4,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A1A1AA',
  },
  content: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  context: {
    fontSize: 13,
    color: '#A1A1AA',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 19,
  },
  actions: {
    gap: 6,
    alignItems: 'flex-end',
  },
  approveBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  approveBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  ignoreBtn: {
    backgroundColor: '#0B0F14',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  ignoreBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  approvedBadge: {
    backgroundColor: '#22C55E20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  approvedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22C55E',
  },
});
