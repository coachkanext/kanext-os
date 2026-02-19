/**
 * RoomsListV3 — Universal rooms FlatList.
 * Pinned announcements sort to top. Lock icon on RBAC rooms, megaphone + read tracker on announcements.
 */

import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getRooms } from '@/data/mock-messages-v3';
import { RoomRowV3 } from '@/components/messages/room-row-v3';
import type { Mode, RoomV3 } from '@/types';

interface RoomsListV3Props {
  mode: Mode;
  search: string;
}

function sortRooms(rooms: RoomV3[]): RoomV3[] {
  return [...rooms].sort((a, b) => {
    // Pinned first
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    // Unread next
    if (a.unread !== b.unread) return a.unread ? -1 : 1;
    // Then by timestamp
    return b.timestamp.getTime() - a.timestamp.getTime();
  });
}

export function RoomsListV3({ mode, search }: RoomsListV3Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const rooms = useMemo(() => {
    let items = getRooms(mode);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (r) => r.name.toLowerCase().includes(q) || r.lastMessage.toLowerCase().includes(q),
      );
    }
    return sortRooms(items);
  }, [mode, search]);

  const renderItem = useCallback(
    ({ item }: { item: RoomV3 }) => (
      <RoomRowV3 room={item} onPress={() => {/* TODO: open room */}} />
    ),
    [],
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
            No rooms available
          </ThemedText>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xl * 2,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
  },
});
