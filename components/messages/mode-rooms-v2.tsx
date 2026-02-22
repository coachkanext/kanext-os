/**
 * ModeRoomsV2 — Enhanced rooms directory for non-sports modes.
 * Room type badges, unread counts, member counts, mode accent colors.
 * Uses mode-keyed data from mock-messages.ts.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Mode } from '@/types';
import {
  getModeRooms,
  formatMessageTime,
  type ChatThread,
} from '@/data/mock-messages';

const ROOM_ICON: Record<string, string> = {
  staff: 'briefcase.fill',
  recruiting: 'person.badge.plus',
  travel: 'airplane',
  film: 'play.rectangle.fill',
  leadership: 'star.fill',
  product: 'hammer.fill',
  investors: 'chart.line.uptrend.xyaxis',
  legal: 'doc.text.fill',
  pastoral: 'heart.fill',
  prayer: 'hands.sparkles.fill',
  worship: 'music.note',
  admissions: 'person.crop.rectangle.fill',
  housing: 'building.2.fill',
  campus_life: 'graduationcap.fill',
  raceweek_ops: 'flag.checkered',
  rules: 'book.fill',
  compliance: 'checkmark.shield.fill',
  safety: 'exclamationmark.triangle.fill',
};

interface Props {
  mode: Mode;
  search?: string;
}

export function ModeRoomsV2({ mode, search = '' }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();

  const rooms = useMemo(() => {
    let list = getModeRooms(mode);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) => r.title.toLowerCase().includes(q) || r.lastMessage.toLowerCase().includes(q),
      );
    }
    // Sort: unread first, then by timestamp
    return [...list].sort((a, b) => {
      if (a.unread > 0 && b.unread === 0) return -1;
      if (a.unread === 0 && b.unread > 0) return 1;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [mode, search]);

  const renderItem = ({ item }: { item: ChatThread }) => (
    <RoomRow room={item} colors={colors} accent={accent} />
  );

  return (
    <FlatList
      data={rooms}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <IconSymbol name="bubble.left.and.bubble.right" size={28} color={colors.textTertiary} />
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No rooms
          </ThemedText>
        </View>
      }
    />
  );
}

function RoomRow({
  room,
  colors,
  accent,
}: {
  room: ChatThread;
  colors: typeof Colors.light;
  accent: string;
}) {
  const timeStr = formatMessageTime(room.timestamp);
  const memberLabel = room.context?.subtitle ?? `${room.participants.length} members`;
  const iconName = (room.roomType && ROOM_ICON[room.roomType]) || 'bubble.left.fill';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? colors.backgroundSecondary : 'transparent',
          borderBottomColor: colors.border,
        },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      {/* Icon */}
      <View style={[styles.avatar, { backgroundColor: accent + '1A' }]}>
        <IconSymbol name={iconName as any} size={18} color={accent} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <ThemedText style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {room.title}
          </ThemedText>
          {room.roomType && (
            <View style={[styles.typeBadge, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[styles.typeText, { color: colors.textTertiary }]}>
                {room.roomType.replace(/_/g, ' ')}
              </ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={[styles.memberLabel, { color: colors.textTertiary }]} numberOfLines={1}>
          {memberLabel}
        </ThemedText>
        <ThemedText style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={1}>
          {room.lastMessage}
        </ThemedText>
      </View>

      {/* Right */}
      <View style={styles.right}>
        <ThemedText style={[styles.time, { color: colors.textTertiary }]}>{timeStr}</ThemedText>
        {room.unread > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: accent }]}>
            <ThemedText style={styles.unreadText}>{room.unread}</ThemedText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 100 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  typeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  memberLabel: { fontSize: 11 },
  preview: { fontSize: 13, marginTop: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
  time: { fontSize: 11 },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadText: { fontSize: 10, fontWeight: '800', color: '#000' },
  emptyState: { alignItems: 'center', paddingTop: Spacing.xxl * 2, gap: 8 },
  emptyText: { fontSize: 14 },
});
