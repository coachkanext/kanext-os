/**
 * SportsRooms — Room directory with 7 categories, grouped SectionList.
 * RBAC-gated via getMessagesSectionVisibility.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, SectionList, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getMessagesSectionVisibility, type SportsRoleLens } from '@/utils/sports-rbac';
import {
  SPORTS_ROOMS,
  sortRoomsByUrgency,
  ROOM_CATEGORY_LABELS,
  ROOM_CATEGORY_ORDER,
  type SportsRoom,
  type RoomCategory,
} from '@/data/mock-sports-messages';

const DEFAULT_ROLE: SportsRoleLens = 'R3';

interface SportsRoomsProps {
  search?: string;
}

export function SportsRooms({ search = '' }: SportsRoomsProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const role = DEFAULT_ROLE;

  const sections = useMemo(() => {
    let rooms = SPORTS_ROOMS.filter(
      (r) => getMessagesSectionVisibility(r.rbacSection, role) !== 'hidden',
    );
    if (search.trim()) {
      const q = search.toLowerCase();
      rooms = rooms.filter(
        (r) => r.title.toLowerCase().includes(q) || r.lastMessage.toLowerCase().includes(q),
      );
    }
    const sorted = sortRoomsByUrgency(rooms);

    return ROOM_CATEGORY_ORDER
      .map((cat) => ({
        title: ROOM_CATEGORY_LABELS[cat],
        data: sorted.filter((r) => r.category === cat),
      }))
      .filter((s) => s.data.length > 0);
  }, [role, search]);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <RoomRow room={item} colors={colors} />}
      renderSectionHeader={({ section }) => (
        <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            {section.title}
          </ThemedText>
        </View>
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <IconSymbol name="bubble.left.and.bubble.right" size={28} color={colors.textTertiary} />
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No rooms available
          </ThemedText>
        </View>
      }
    />
  );
}

function RoomRow({ room, colors }: { room: SportsRoom; colors: typeof Colors.light }) {
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
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: room.avatarColor }]}>
        <ThemedText style={styles.avatarText}>{room.avatarInitials}</ThemedText>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <ThemedText style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {room.title}
          </ThemedText>
          {room.hasBlocker && (
            <View style={[styles.indicator, { backgroundColor: '#B85C5C' + '1A' }]}>
              <ThemedText style={[styles.indicatorText, { color: '#B85C5C' }]}>BLOCKER</ThemedText>
            </View>
          )}
          {room.hasDeadline && !room.hasBlocker && (
            <View style={[styles.indicator, { backgroundColor: '#B8943E' + '1A' }]}>
              <ThemedText style={[styles.indicatorText, { color: '#B8943E' }]}>DEADLINE</ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={[styles.lastMessage, { color: colors.textSecondary }]} numberOfLines={1}>
          {room.lastMessage}
        </ThemedText>
      </View>

      {/* Right */}
      <View style={styles.right}>
        <ThemedText style={[styles.time, { color: colors.textTertiary }]}>{room.lastMessageTime}</ThemedText>
        {room.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <ThemedText style={styles.unreadText}>{room.unreadCount}</ThemedText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  indicator: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
  },
  indicatorText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  lastMessage: {
    fontSize: 13,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  time: {
    fontSize: 11,
  },
  unreadBadge: {
    backgroundColor: '#fff',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
  },
});
