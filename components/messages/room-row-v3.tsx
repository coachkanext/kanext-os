/**
 * RoomRowV3 — Single room row.
 * Colored initials icon · Name · Member count · Last message · Timestamp · Unread badge.
 * Lock icon for RBAC rooms, megaphone + read tracker for announcements.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatMessageTime } from '@/data/mock-messages-v3';
import type { RoomV3 } from '@/types';

interface RoomRowV3Props {
  room: RoomV3;
  onPress: () => void;
}

export function RoomRowV3({ room, onPress }: RoomRowV3Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

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
      {/* Colored icon */}
      <View style={[styles.icon, { backgroundColor: room.color + '20' }]}>
        {room.isAnnouncement ? (
          <IconSymbol name="megaphone.fill" size={18} color={room.color} />
        ) : (
          <ThemedText style={[styles.iconText, { color: room.color }]}>
            {room.initials}
          </ThemedText>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topLine}>
          <View style={styles.nameRow}>
            <ThemedText
              style={[styles.name, { color: colors.text }, room.unread && styles.nameUnread]}
              numberOfLines={1}
            >
              {room.name}
            </ThemedText>
            {room.locked && (
              <IconSymbol name="lock.fill" size={11} color={colors.textTertiary} />
            )}
            {room.pinned && (
              <IconSymbol name="pin.fill" size={11} color={colors.textTertiary} />
            )}
          </View>
          <ThemedText style={[styles.time, { color: colors.textTertiary }]}>
            {formatMessageTime(room.timestamp)}
          </ThemedText>
        </View>

        <View style={styles.metaRow}>
          <ThemedText style={[styles.members, { color: colors.textTertiary }]}>
            {room.memberCount} members
          </ThemedText>
          {room.isAnnouncement && room.readCount != null && room.totalCount != null && (
            <ThemedText style={[styles.readTracker, { color: colors.textTertiary }]}>
              · {room.readCount}/{room.totalCount} read
            </ThemedText>
          )}
        </View>

        <ThemedText
          style={[styles.preview, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {room.lastMessage}
        </ThemedText>
      </View>

      {/* Unread dot */}
      {room.unread && <View style={styles.unreadDot} />}
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
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 15,
    fontWeight: '700',
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
    gap: 5,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  members: {
    fontSize: 12,
  },
  readTracker: {
    fontSize: 12,
    marginLeft: 4,
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
    backgroundColor: '#1D9BF0',
    marginTop: 4,
  },
});
