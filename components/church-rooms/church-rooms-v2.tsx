/**
 * ChurchRoomsV2 — Room List → Room Feed drill-in for church mode.
 * 5 rooms: Service, Sermon, Worship, Ministry (role-aware), Training
 * useState<ChurchRoomId | null> for drill-in (not navigation — lives inside PagerView).
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  Share,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  CHURCH_ROOMS,
  CHURCH_ROOM_FEED_ITEMS,
  CHURCH_FEED_TYPE_FILTERS,
  CHURCH_FEED_DATE_FILTERS,
  getVisibleChurchRooms,
  filterChurchFeedItems,
  type ChurchRoomId,
  type ChurchRoom,
  type ChurchRoomFeedItem,
  type ChurchFeedTypeFilter,
  type ChurchFeedDateFilter,
} from '@/data/mock-church-rooms';

// =============================================================================
// MOCK USER CONTEXT (A2, V3, Children's Ministry member)
// =============================================================================

const MOCK_USER_AUTHORITY = 2;
const MOCK_USER_VISIBILITY = 3;
const MOCK_USER_HAS_MINISTRY = true;

// =============================================================================
// TYPE BADGE COLORS
// =============================================================================

const TYPE_BADGE_COLORS: Record<ChurchRoomFeedItem['type'], string> = {
  service: '#1D9BF0',
  sermon: '#22C55E',
  worship: '#8B5CF6',
  training: '#F59E0B',
  clip: '#1D9BF0',
  event: '#22C55E',
};

const TYPE_BADGE_LABELS: Record<ChurchRoomFeedItem['type'], string> = {
  service: 'SERVICE',
  sermon: 'SERMON',
  worship: 'WORSHIP',
  training: 'TRAINING',
  clip: 'CLIP',
  event: 'EVENT',
};

// =============================================================================
// ROOM CARD (List View)
// =============================================================================

function RoomCard({
  room,
  colors,
  onPress,
}: {
  room: ChurchRoom;
  colors: typeof Colors.light;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        cardStyles.roomCard,
        { backgroundColor: pressed ? colors.cardElevated : colors.card },
      ]}
      onPress={onPress}
    >
      <View style={[cardStyles.roomStrip, { backgroundColor: room.colorStrip }]} />
      <View style={[cardStyles.roomIconCircle, { backgroundColor: room.colorStrip + '1A' }]}>
        <IconSymbol name={room.icon as any} size={20} color={room.colorStrip} />
      </View>
      <View style={cardStyles.roomInfo}>
        <ThemedText style={[cardStyles.roomName, { color: colors.text }]}>
          {room.name}
        </ThemedText>
        <ThemedText style={[cardStyles.roomDesc, { color: colors.textSecondary }]} numberOfLines={1}>
          {room.description}
        </ThemedText>
        <View style={cardStyles.roomMeta}>
          <ThemedText style={[cardStyles.roomMetaText, { color: colors.textTertiary }]}>
            {room.lastUpdated}
          </ThemedText>
          <View style={cardStyles.roomMetaDot} />
          <ThemedText style={[cardStyles.roomMetaText, { color: colors.textTertiary }]}>
            {room.itemCount} items
          </ThemedText>
        </View>
      </View>
      <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
    </Pressable>
  );
}

const cardStyles = StyleSheet.create({
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    paddingRight: Spacing.md,
  },
  roomStrip: { width: 4, alignSelf: 'stretch' },
  roomIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm + 4,
  },
  roomInfo: {
    flex: 1,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.sm + 4,
    gap: 3,
  },
  roomName: { fontSize: 15, fontWeight: '600' },
  roomDesc: { fontSize: 12 },
  roomMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  roomMetaText: { fontSize: 11 },
  roomMetaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#52525B' },
});

// =============================================================================
// ROOM FEED CARD
// =============================================================================

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function RoomFeedCard({
  item,
  colors,
  onLongPress,
}: {
  item: ChurchRoomFeedItem;
  colors: typeof Colors.light;
  onLongPress: () => void;
}) {
  const badgeColor = TYPE_BADGE_COLORS[item.type];

  return (
    <Pressable
      style={({ pressed }) => [
        feedStyles.card,
        { backgroundColor: pressed ? colors.cardElevated : colors.card },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      onLongPress={onLongPress}
      delayLongPress={400}
    >
      {/* 16:9 Thumbnail */}
      <View style={[feedStyles.thumbnail, { backgroundColor: item.thumbnailColor }]}>
        <View style={feedStyles.playBtn}>
          <IconSymbol name="play.fill" size={20} color="#fff" />
        </View>
        {/* Type badge — top left */}
        <View style={[feedStyles.typeBadge, { backgroundColor: badgeColor }]}>
          <ThemedText style={feedStyles.typeBadgeText}>
            {TYPE_BADGE_LABELS[item.type]}
          </ThemedText>
        </View>
        {/* Duration badge — top right */}
        <View style={feedStyles.durationBadge}>
          <ThemedText style={feedStyles.durationText}>{item.duration}</ThemedText>
        </View>
      </View>

      {/* Info area */}
      <View style={feedStyles.infoArea}>
        <ThemedText style={[feedStyles.title, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </ThemedText>
        <View style={feedStyles.subtitleRow}>
          <ThemedText style={[feedStyles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.subtitle}
          </ThemedText>
          <View style={feedStyles.metaDot} />
          <ThemedText style={[feedStyles.dateText, { color: colors.textTertiary }]}>
            {formatDate(item.date)}
          </ThemedText>
        </View>
        {item.ministryName && (
          <View style={[feedStyles.ministryBadge, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[feedStyles.ministryBadgeText, { color: colors.textSecondary }]}>
              {item.ministryName}
            </ThemedText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const feedStyles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  durationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  infoArea: {
    padding: Spacing.sm + 4,
    gap: 4,
  },
  title: { fontSize: 14, fontWeight: '600' },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  subtitle: { fontSize: 12, flex: 1 },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#52525B' },
  dateText: { fontSize: 11 },
  ministryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginTop: 2,
  },
  ministryBadgeText: { fontSize: 10, fontWeight: '500' },
});

// =============================================================================
// FILTER PILLS
// =============================================================================

function FilterPills<T extends string>({
  filters,
  active,
  onSelect,
  colors,
}: {
  filters: { key: T; label: string }[];
  active: T;
  onSelect: (key: T) => void;
  colors: typeof Colors.light;
}) {
  return (
    <>
      {filters.map((f) => {
        const isActive = active === f.key;
        return (
          <Pressable
            key={f.key}
            style={[
              styles.pill,
              { backgroundColor: isActive ? '#fff' : colors.backgroundTertiary },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(f.key);
            }}
          >
            <ThemedText
              style={[styles.pillText, { color: isActive ? '#000' : colors.textSecondary }]}
            >
              {f.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </>
  );
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyFeed({ colors, label }: { colors: typeof Colors.light; label: string }) {
  return (
    <View style={styles.emptyState}>
      <IconSymbol name="film.stack" size={28} color={colors.textTertiary} />
      <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ChurchRoomsV2() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Drill-in state
  const [selectedRoom, setSelectedRoom] = useState<ChurchRoomId | null>(null);

  // Feed state
  const [typeFilter, setTypeFilter] = useState<ChurchFeedTypeFilter>('all');
  const [dateFilter, setDateFilter] = useState<ChurchFeedDateFilter>('all');
  const [search, setSearch] = useState('');

  // Quick Actions sheet
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetItem, setSheetItem] = useState<ChurchRoomFeedItem | null>(null);

  const visibleRooms = useMemo(
    () => getVisibleChurchRooms(MOCK_USER_AUTHORITY, MOCK_USER_VISIBILITY, MOCK_USER_HAS_MINISTRY),
    [],
  );

  const feedItems = useMemo(() => {
    if (!selectedRoom) return [];
    const items = CHURCH_ROOM_FEED_ITEMS[selectedRoom] ?? [];
    return filterChurchFeedItems(items, MOCK_USER_VISIBILITY, typeFilter, dateFilter, search);
  }, [selectedRoom, typeFilter, dateFilter, search]);

  const selectedRoomData = useMemo(
    () => CHURCH_ROOMS.find((r) => r.id === selectedRoom),
    [selectedRoom],
  );

  const handleRoomPress = useCallback((id: ChurchRoomId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRoom(id);
  }, []);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRoom(null);
    setTypeFilter('all');
    setDateFilter('all');
    setSearch('');
  }, []);

  const handleLongPress = useCallback((item: ChurchRoomFeedItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSheetItem(item);
    setSheetVisible(true);
  }, []);

  const handleSave = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSheetVisible(false);
  }, []);

  const handleShareAction = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (sheetItem) {
      try {
        await Share.share({ message: `${sheetItem.title} — ${sheetItem.subtitle}` });
      } catch {}
    }
    setSheetVisible(false);
  }, [sheetItem]);

  const handleAddToPlaylist = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSheetVisible(false);
  }, []);

  const renderRoomCard = useCallback(
    ({ item }: { item: ChurchRoom }) => (
      <RoomCard room={item} colors={colors} onPress={() => handleRoomPress(item.id)} />
    ),
    [colors, handleRoomPress],
  );

  const renderFeedCard = useCallback(
    ({ item }: { item: ChurchRoomFeedItem }) => (
      <RoomFeedCard
        item={item}
        colors={colors}
        onLongPress={() => handleLongPress(item)}
      />
    ),
    [colors, handleLongPress],
  );

  // ─── Room List View ───
  if (selectedRoom === null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FlatList
          data={visibleRooms}
          keyExtractor={(item) => item.id}
          renderItem={renderRoomCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyFeed colors={colors} label="No rooms available" />}
        />
      </View>
    );
  }

  // ─── Room Feed View ───
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Back Header */}
      <Pressable style={styles.backHeader} onPress={handleBack}>
        <IconSymbol name="chevron.left" size={18} color={colors.text} />
        <ThemedText style={[styles.backTitle, { color: colors.text }]}>
          {selectedRoomData?.name ?? 'Room'}
        </ThemedText>
      </Pressable>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={14} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={14} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterRow}>
        <FilterPills
          filters={CHURCH_FEED_TYPE_FILTERS}
          active={typeFilter}
          onSelect={setTypeFilter}
          colors={colors}
        />
        <View style={[styles.filterDivider, { backgroundColor: colors.border }]} />
        <FilterPills
          filters={CHURCH_FEED_DATE_FILTERS}
          active={dateFilter}
          onSelect={setDateFilter}
          colors={colors}
        />
      </View>

      {/* Feed List */}
      <FlatList
        data={feedItems}
        keyExtractor={(item) => item.id}
        renderItem={renderFeedCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyFeed colors={colors} label="No items match filters" />}
      />

      {/* Quick Actions BottomSheet */}
      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title={sheetItem?.title ?? 'Actions'}
        useModal
      >
        <View style={styles.sheetActions}>
          <Pressable style={styles.sheetAction} onPress={handleSave}>
            <IconSymbol name="bookmark" size={20} color={colors.text} />
            <ThemedText style={[styles.sheetActionText, { color: colors.text }]}>Save</ThemedText>
          </Pressable>
          <Pressable style={styles.sheetAction} onPress={handleShareAction}>
            <IconSymbol name="paperplane" size={20} color={colors.text} />
            <ThemedText style={[styles.sheetActionText, { color: colors.text }]}>Share</ThemedText>
          </Pressable>
          <Pressable style={styles.sheetAction} onPress={handleAddToPlaylist}>
            <IconSymbol name="text.badge.plus" size={20} color={colors.text} />
            <ThemedText style={[styles.sheetActionText, { color: colors.text }]}>Add to Playlist</ThemedText>
          </Pressable>
        </View>
      </BottomSheet>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },

  // Back header
  backHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  backTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Search
  searchRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm + 2,
    height: 36,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },

  // Filters
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  filterDivider: {
    width: 1,
    height: 20,
    marginHorizontal: 2,
  },
  pill: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
  },

  // Quick Actions Sheet
  sheetActions: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: 4,
  },
  sheetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  sheetActionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
