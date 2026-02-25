/**
 * RoomsListV3 — Sectioned rooms list for Messages → Rooms tab.
 * Sections: Pinned · Program Rooms · Direct Rooms.
 * RBAC: Lock icon on restricted rooms. Megaphone + read tracker on announcements.
 */

import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, SectionList } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, MODE_ACCENT } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getRooms } from '@/data/mock-messages-v3';
import { RoomRowV3 } from '@/components/messages/room-row-v3';
import type { Mode, RoomV3 } from '@/types';

interface RoomsListV3Props {
  mode: Mode;
  search: string;
  onRoomPress: (room: RoomV3) => void;
}

interface RoomSection {
  title: string;
  data: RoomV3[];
}

export function RoomsListV3({ mode, search, onRoomPress }: RoomsListV3Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = MODE_ACCENT[mode];

  const sections = useMemo(() => {
    let items = getRooms(mode);

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (r) => r.name.toLowerCase().includes(q) || r.lastMessage.toLowerCase().includes(q),
      );
    }

    // Sort within each group: unread first, then by timestamp
    const sortGroup = (rooms: RoomV3[]) =>
      [...rooms].sort((a, b) => {
        if (a.unread !== b.unread) return a.unread ? -1 : 1;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });

    // Partition
    const pinned = sortGroup(items.filter((r) => r.pinned));
    const program = sortGroup(items.filter((r) => !r.pinned && r.category === 'program'));
    const direct = sortGroup(items.filter((r) => !r.pinned && r.category === 'direct'));
    // Fallback: rooms without category go to program
    const uncategorized = sortGroup(items.filter((r) => !r.pinned && !r.category));

    const result: RoomSection[] = [];
    if (pinned.length > 0) result.push({ title: 'PINNED', data: pinned });
    if (program.length + uncategorized.length > 0) result.push({ title: 'PROGRAM ROOMS', data: [...program, ...uncategorized] });
    if (direct.length > 0) result.push({ title: 'DIRECT ROOMS', data: direct });

    return result;
  }, [mode, search]);

  const renderItem = useCallback(
    ({ item }: { item: RoomV3 }) => (
      <RoomRowV3 room={item} onPress={() => onRoomPress(item)} />
    ),
    [onRoomPress],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: RoomSection }) => {
      const count = section.data.filter((r) => r.unread).length;
      return (
        <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {section.title}
          </Text>
          {count > 0 && (
            <View style={[styles.countBadge, { backgroundColor: accent }]}>
              <Text style={styles.countText}>{count}</Text>
            </View>
          )}
        </View>
      );
    },
    [colors, accent],
  );

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
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
