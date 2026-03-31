/**
 * ChurchExplorePageV2 — 2-column grid discovery for church mode.
 * Scope/type filters, visibility-based content gating, search, long-press quick actions.
 * Mirrors SportsExplorePageV2 structure adapted with church-specific filters.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  StyleSheet,
  Pressable,
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
  CHURCH_EXPLORE_TILES,
  CHURCH_EXPLORE_TYPES,
  getCampuses,
  type ChurchExploreTile,
  type ChurchExploreType,
} from '@/data/mock-church-explore-grid';

// =============================================================================
// MOCK USER CONTEXT
// =============================================================================

const MOCK_USER_VISIBILITY = 3;
const MOCK_USER_CAMPUS = 'campus-main';

// =============================================================================
// FILTER TYPES
// =============================================================================

type ScopeFilter = 'My Campus' | 'All Public';
type TypeFilter = 'All' | ChurchExploreType;

// =============================================================================
// TYPE BADGE COLORS
// =============================================================================

const TYPE_BADGE_COLOR: Record<ChurchExploreType, string> = {
  Sermon: '#1A1714',
  Worship: '#1A1714',
  Event: '#5A8A6E',
  Training: '#B8943E',
  Clip: '#1A1714',
};

// =============================================================================
// DATE FORMAT HELPER
// =============================================================================

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// =============================================================================
// TILE CARD (Church variant)
// =============================================================================

function TileCard({
  tile,
  colors,
  onPress,
  onLongPress,
}: {
  tile: ChurchExploreTile;
  colors: typeof Colors.light;
  onPress: () => void;
  onLongPress: () => void;
}) {
  return (
    <Pressable
      style={styles.tile}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
    >
      {/* Thumbnail */}
      <View style={[styles.tileThumbnail, { backgroundColor: tile.thumbnailColor }]}>
        <IconSymbol name="play.fill" size={20} color="rgba(255,255,255,0.7)" />
        {/* Type badge (top-left) */}
        <View style={[styles.tileTypeBadge, { backgroundColor: TYPE_BADGE_COLOR[tile.type] }]}>
          <ThemedText style={styles.tileTypeText}>{tile.type.toUpperCase()}</ThemedText>
        </View>
        {/* Duration badge (bottom-right) */}
        <View style={styles.tileDuration}>
          <ThemedText style={styles.tileDurationText}>{tile.duration}</ThemedText>
        </View>
      </View>
      {/* Info */}
      <View style={styles.tileInfo}>
        <ThemedText style={[styles.tileTitle, { color: colors.text }]} numberOfLines={1}>
          {tile.title}
        </ThemedText>
        <ThemedText style={[styles.tileSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {tile.campusName}
        </ThemedText>
        <ThemedText style={[styles.tileDate, { color: colors.textTertiary }]}>
          {formatDate(tile.publishedAt)}
        </ThemedText>
        {tile.ministryName && (
          <View style={[styles.ministryBadge, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[styles.ministryBadgeText, { color: colors.textSecondary }]}>
              {tile.ministryName}
            </ThemedText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// =============================================================================
// FILTER PILL
// =============================================================================

function Pill({
  label,
  active,
  colors,
  onPress,
  hasChevron,
}: {
  label: string;
  active: boolean;
  colors: typeof Colors.light;
  onPress: () => void;
  hasChevron?: boolean;
}) {
  return (
    <Pressable
      style={[
        styles.pill,
        { backgroundColor: active ? '#fff' : colors.backgroundTertiary, borderColor: colors.border },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <ThemedText style={[styles.pillText, { color: active ? '#000' : colors.textSecondary }]}>
        {label}
      </ThemedText>
      {hasChevron && (
        <IconSymbol name="chevron.down" size={10} color={active ? '#000' : colors.textTertiary} />
      )}
    </Pressable>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ChurchExplorePageV2() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Filter state
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<ScopeFilter>('My Campus');
  const [activeType, setActiveType] = useState<TypeFilter>('All');
  const [activeCampus, setActiveCampus] = useState<string | null>(null);
  const [campusExpanded, setCampusExpanded] = useState(false);

  // Quick Actions sheet
  const [sheetTile, setSheetTile] = useState<ChurchExploreTile | null>(null);

  // Visibility-filtered base set
  const baseTiles = useMemo(
    () => CHURCH_EXPLORE_TILES.filter((t) => t.visibilityClass <= MOCK_USER_VISIBILITY),
    [],
  );

  // Campuses available (from V0 tiles only, for All Public scope)
  const availableCampuses = useMemo(
    () => getCampuses(baseTiles.filter((t) => t.visibilityClass === 0)),
    [baseTiles],
  );

  // Cascading filter pipeline
  const filteredTiles = useMemo(() => {
    let tiles = baseTiles;

    // Scope
    if (scope === 'My Campus') {
      // Show all visible tiles from user's campus (V0 + V2 + V3)
      tiles = tiles.filter((t) => t.campusId === MOCK_USER_CAMPUS);
    } else {
      // All Public: only V0 tiles from all campuses
      tiles = tiles.filter((t) => t.visibilityClass === 0);

      // Optional campus sub-filter
      if (activeCampus) {
        tiles = tiles.filter((t) => t.campusName === activeCampus);
      }
    }

    // Type
    if (activeType !== 'All') {
      tiles = tiles.filter((t) => t.type === activeType);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      tiles = tiles.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.speaker && t.speaker.toLowerCase().includes(q)) ||
          t.campusName.toLowerCase().includes(q),
      );
    }

    // Sort newest first
    return tiles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }, [baseTiles, scope, activeCampus, activeType, search]);

  // Scope change resets campus sub-filter
  const handleScopeChange = useCallback((newScope: ScopeFilter) => {
    setScope(newScope);
    setActiveCampus(null);
    setCampusExpanded(false);
  }, []);

  const handleCampusSelect = useCallback((campus: string) => {
    setActiveCampus((prev) => (prev === campus ? null : campus));
    setCampusExpanded(false);
  }, []);

  const handleTilePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleTileLongPress = useCallback((tile: ChurchExploreTile) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSheetTile(tile);
  }, []);

  const handleShare = useCallback(async () => {
    if (!sheetTile) return;
    setSheetTile(null);
    try {
      await Share.share({ message: `${sheetTile.title} — ${sheetTile.campusName}` });
    } catch {}
  }, [sheetTile]);

  const handleSave = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSheetTile(null);
  }, []);

  const handleAddToPlaylist = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSheetTile(null);
  }, []);

  // Render tile
  const renderTile = useCallback(
    ({ item }: { item: ChurchExploreTile }) => (
      <TileCard
        tile={item}
        colors={colors}
        onPress={handleTilePress}
        onLongPress={() => handleTileLongPress(item)}
      />
    ),
    [colors, handleTilePress, handleTileLongPress],
  );

  const keyExtractor = useCallback((item: ChurchExploreTile) => item.id, []);

  // List header: search + filters
  const ListHeader = useMemo(
    () => (
      <View>
        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search sermon / speaker / campus / event"
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>

        {/* Filter Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          style={styles.filterRow}
        >
          {/* Scope pills */}
          <Pill
            label="My Campus"
            active={scope === 'My Campus'}
            colors={colors}
            onPress={() => handleScopeChange('My Campus')}
          />
          <Pill
            label="All Public"
            active={scope === 'All Public'}
            colors={colors}
            onPress={() => handleScopeChange('All Public')}
          />

          <View style={[styles.pillDivider, { backgroundColor: colors.border }]} />

          {/* Campus pill (only when scope = All Public) */}
          {scope === 'All Public' && (
            <>
              <Pill
                label={activeCampus ?? 'Campus'}
                active={!!activeCampus || campusExpanded}
                colors={colors}
                onPress={() => setCampusExpanded(!campusExpanded)}
                hasChevron
              />
              <View style={[styles.pillDivider, { backgroundColor: colors.border }]} />
            </>
          )}

          {/* Type pills */}
          {(['All', ...CHURCH_EXPLORE_TYPES] as TypeFilter[]).map((type) => (
            <Pill
              key={type}
              label={type === 'All' ? 'All' : `${type}s`}
              active={activeType === type}
              colors={colors}
              onPress={() => setActiveType(type)}
            />
          ))}
        </ScrollView>

        {/* Campus sub-row */}
        {scope === 'All Public' && campusExpanded && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subFilterScroll}
          >
            {availableCampuses.map((campus) => (
              <Pill
                key={campus}
                label={campus}
                active={activeCampus === campus}
                colors={colors}
                onPress={() => handleCampusSelect(campus)}
              />
            ))}
          </ScrollView>
        )}
      </View>
    ),
    [colors, search, scope, activeType, activeCampus, campusExpanded, availableCampuses, handleScopeChange, handleCampusSelect],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredTiles}
        numColumns={2}
        keyExtractor={keyExtractor}
        renderItem={renderTile}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconSymbol name="magnifyingglass" size={28} color={colors.textTertiary} />
            <ThemedText style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              No matching content
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
              Try adjusting your filters or search terms.
            </ThemedText>
          </View>
        }
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />

      {/* Quick Actions Sheet */}
      <BottomSheet
        visible={!!sheetTile}
        onClose={() => setSheetTile(null)}
        title="Quick Actions"
        useModal
      >
        {sheetTile && (
          <View style={styles.sheetContent}>
            {/* Tile preview */}
            <View style={[styles.sheetPreview, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={[styles.sheetThumb, { backgroundColor: sheetTile.thumbnailColor }]}>
                <IconSymbol name="play.fill" size={16} color="rgba(255,255,255,0.7)" />
              </View>
              <View style={styles.sheetPreviewInfo}>
                <ThemedText style={[styles.sheetPreviewTitle, { color: colors.text }]} numberOfLines={1}>
                  {sheetTile.title}
                </ThemedText>
                <ThemedText style={[styles.sheetPreviewSub, { color: colors.textSecondary }]} numberOfLines={1}>
                  {sheetTile.campusName} · {sheetTile.duration}
                </ThemedText>
              </View>
            </View>

            {/* Actions */}
            <Pressable style={[styles.sheetAction, { borderBottomColor: colors.border }]} onPress={handleSave}>
              <IconSymbol name="bookmark" size={20} color={colors.text} />
              <ThemedText style={[styles.sheetActionText, { color: colors.text }]}>Save</ThemedText>
            </Pressable>
            <Pressable style={[styles.sheetAction, { borderBottomColor: colors.border }]} onPress={handleShare}>
              <IconSymbol name="paperplane" size={20} color={colors.text} />
              <ThemedText style={[styles.sheetActionText, { color: colors.text }]}>Share</ThemedText>
            </Pressable>
            <Pressable style={styles.sheetAction} onPress={handleAddToPlaylist}>
              <IconSymbol name="text.badge.plus" size={20} color={colors.text} />
              <ThemedText style={[styles.sheetActionText, { color: colors.text }]}>Add to Playlist</ThemedText>
            </Pressable>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 100 },
  columnWrapper: {
    paddingHorizontal: Spacing.md,
    gap: 10,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },

  // Filters
  filterRow: {
    flexGrow: 0,
    marginBottom: 4,
  },
  filterScroll: {
    paddingHorizontal: Spacing.md,
    gap: 8,
    alignItems: 'center',
  },
  subFilterScroll: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    gap: 8,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pillDivider: {
    width: 1,
    height: 20,
    marginHorizontal: 2,
  },

  // Tile
  tile: {
    flex: 1,
    marginBottom: 14,
  },
  tileThumbnail: {
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  tileDuration: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tileDurationText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  tileTypeBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tileTypeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  tileInfo: {
    paddingTop: 6,
    gap: 2,
  },
  tileTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  tileSubtitle: {
    fontSize: 11,
  },
  tileDate: {
    fontSize: 10,
    marginTop: 1,
  },
  ministryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 3,
  },
  ministryBadgeText: {
    fontSize: 9,
    fontWeight: '600',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 13,
  },

  // Quick Actions Sheet
  sheetContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 4,
    paddingBottom: 20,
  },
  sheetPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: BorderRadius.md,
    marginBottom: 16,
    gap: 12,
  },
  sheetThumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetPreviewInfo: {
    flex: 1,
    gap: 3,
  },
  sheetPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  sheetPreviewSub: {
    fontSize: 12,
  },
  sheetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  sheetActionText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
