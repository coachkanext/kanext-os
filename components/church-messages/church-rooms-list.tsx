/**
 * ChurchRoomsList — Sectioned rooms list for Church Messages → Rooms tab.
 * Sections: Pinned · Campus Rooms · Ministry Rooms · Direct Rooms.
 * Campus-scoped, ministry-structured, RBAC-aware.
 */

import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, SectionList } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, MODE_ACCENT } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getRooms } from '@/data/mock-messages-v3';
import { RoomRowV3 } from '@/components/messages/room-row-v3';
import type { RoomV3 } from '@/types';

interface ChurchRoomsListProps {
  search: string;
  onRoomPress: (room: RoomV3) => void;
}

interface RoomSection {
  title: string;
  data: RoomV3[];
}

const ACCENT = MODE_ACCENT.church;

export function ChurchRoomsList({ search, onRoomPress }: ChurchRoomsListProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const sections = useMemo(() => {
    let items = getRooms('church');

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

    // Partition into 4 sections
    const pinned = sortGroup(items.filter((r) => r.pinned));
    const campus = sortGroup(items.filter((r) => !r.pinned && r.category === 'campus'));
    const ministry = sortGroup(items.filter((r) => !r.pinned && r.category === 'ministry'));
    const direct = sortGroup(items.filter((r) => !r.pinned && r.category === 'direct'));

    const result: RoomSection[] = [];
    if (pinned.length > 0) result.push({ title: 'PINNED', data: pinned });
    if (campus.length > 0) result.push({ title: 'CAMPUS ROOMS', data: campus });
    if (ministry.length > 0) result.push({ title: 'MINISTRY ROOMS', data: ministry });
    if (direct.length > 0) result.push({ title: 'DIRECT ROOMS', data: direct });

    return result;
  }, [search]);

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
            <View style={[styles.countBadge, { backgroundColor: ACCENT }]}>
              <Text style={styles.countText}>{count}</Text>
            </View>
          )}
        </View>
      );
    },
    [colors],
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
            No rooms match your search
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
