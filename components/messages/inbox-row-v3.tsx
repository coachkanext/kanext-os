/**
 * InboxRowV3 — Single inbox thread row.
 * Avatar · Name · Role · Preview · Timestamp · Unread badge · Pin icon.
 * Request variant adds inline Accept / Decline bar.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatMessageTime } from '@/data/mock-messages-v3';
import type { InboxThreadV3 } from '@/types';

interface InboxRowV3Props {
  thread: InboxThreadV3;
  onPress: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
}

export function InboxRowV3({ thread, onPress, onAccept, onDecline }: InboxRowV3Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();

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
      <View style={[styles.avatar, { backgroundColor: colors.backgroundTertiary }]}>
        <ThemedText style={[styles.avatarText, { color: colors.textSecondary }]}>
          {thread.initials}
        </ThemedText>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topLine}>
          <View style={styles.nameRow}>
            <ThemedText
              style={[styles.name, { color: colors.text }, thread.unread && styles.nameUnread]}
              numberOfLines={1}
            >
              {thread.name}
            </ThemedText>
            {thread.pinned && (
              <IconSymbol name="pin.fill" size={12} color={colors.textTertiary} />
            )}
            {thread.isRequest && (
              <View style={[styles.requestBadge, { backgroundColor: '#B8943E' }]}>
                <ThemedText style={styles.requestBadgeText}>Request</ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={[styles.time, { color: colors.textTertiary }]}>
            {formatMessageTime(thread.timestamp)}
          </ThemedText>
        </View>

        <ThemedText style={[styles.role, { color: colors.textTertiary }]} numberOfLines={1}>
          {thread.role}
        </ThemedText>

        <ThemedText
          style={[styles.preview, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {thread.preview}
        </ThemedText>

        {/* Request Accept/Decline bar */}
        {thread.isRequest && (
          <View style={styles.requestActions}>
            <Pressable
              style={({ pressed }) => [styles.acceptBtn, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onAccept?.();
              }}
            >
              <ThemedText style={styles.acceptText}>Accept</ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.declineBtn,
                { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onDecline?.();
              }}
            >
              <ThemedText style={[styles.declineText, { color: colors.textSecondary }]}>Decline</ThemedText>
            </Pressable>
          </View>
        )}
      </View>

      {/* Unread dot */}
      {thread.unread && <View style={styles.unreadDot} />}
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    flexShrink: 1,
  },
  nameUnread: {
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    marginLeft: 8,
  },
  role: {
    fontSize: 12,
    marginTop: 1,
  },
  preview: {
    fontSize: 14,
    lineHeight: 19,
    marginTop: 3,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1A1714',
    marginTop: 4,
  },
  requestBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requestBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  acceptBtn: {
    backgroundColor: '#5A8A6E',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  acceptText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  declineBtn: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  declineText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
