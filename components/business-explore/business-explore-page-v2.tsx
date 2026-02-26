/**
 * BusinessExplorePageV2 — 2-column grid discovery for business mode.
 *
 * Rendering context: Founder / CEO (A5, V4, D5).
 * Cross-entity media discovery within allowed visibility.
 * Scope / Type / Visibility filters, search, pinned section, long-press quick actions.
 * 16:9 thumbnails. No engagement metrics. Recency-sorted. Manual pinning.
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
  BIZ_EXPLORE_TILES,
  BIZ_EXPLORE_TYPES,
  VISIBILITY_LABELS,
  VISIBILITY_COLORS,
  TYPE_COLORS,
  getEntities,
  type BizExploreTile,
  type BizExploreType,
  type BizVisibilityClass,
} from '@/data/mock-business-explore-grid';

// =============================================================================
// MOCK USER CONTEXT (Founder / CEO — A5, V4, D5)
// =============================================================================

const MOCK_USER_VISIBILITY = 4; // can see 0, 1, 2, 3
const MOCK_USER_ENTITY = 'ent-apex';
const IS_FOUNDER = true; // controls visibility filter access + long-press actions

// =============================================================================
// FILTER TYPES
// =============================================================================

type ScopeFilter = 'My Entity' | 'All Accessible';
type TypeFilter = 'All' | BizExploreType;
type VisFilter = 'All' | 'Public' | 'Internal' | 'Board' | 'Executive';

const VIS_FILTER_MAP: Record<Exclude<VisFilter, 'All'>, BizVisibilityClass> = {
  Public: 0,
  Internal: 1,
  Board: 2,
  Executive: 3,
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
// TILE CARD (Business variant — 16:9 thumbnail)
// =============================================================================

function TileCard({
  tile,
  colors,
  onPress,
  onLongPress,
}: {
  tile: BizExploreTile;
  colors: typeof Colors.light;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const typeColor = TYPE_COLORS[tile.type];
  const visColor = VISIBILITY_COLORS[tile.visibilityClass];
  const visLabel = VISIBILITY_LABELS[tile.visibilityClass];

  return (
    <Pressable
      style={styles.tile}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
    >
      {/* 16:9 Thumbnail */}
      <View style={[styles.tileThumbnail, { backgroundColor: tile.thumbnailColor }]}>
        <IconSymbol name="play.fill" size={20} color="rgba(255,255,255,0.7)" />
        {/* Type badge (top-left) */}
        <View style={[styles.tileTypeBadge, { backgroundColor: typeColor }]}>
          <ThemedText style={styles.tileBadgeText}>{tile.type.toUpperCase()}</ThemedText>
        </View>
        {/* Visibility badge (top-right) */}
        <View style={[styles.tileVisBadge, { backgroundColor: visColor + '20', borderColor: visColor + '40' }]}>
          <ThemedText style={[styles.tileBadgeText, { color: visColor }]}>{visLabel.toUpperCase()}</ThemedText>
        </View>
        {/* Duration badge (bottom-right) */}
        <View style={styles.tileDuration}>
          <ThemedText style={styles.tileDurationText}>{tile.duration}</ThemedText>
        </View>
        {/* Pin indicator */}
        {tile.isPinned && (
          <View style={styles.tilePinBadge}>
            <IconSymbol name="pin.fill" size={10} color="#fff" />
          </View>
        )}
      </View>
      {/* Info */}
      <View style={styles.tileInfo}>
        <ThemedText style={[styles.tileTitle, { color: colors.text }]} numberOfLines={1}>
          {tile.title}
        </ThemedText>
        <ThemedText style={[styles.tileSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {tile.entityName}
        </ThemedText>
        <ThemedText style={[styles.tileDate, { color: colors.textTertiary }]}>
          {formatDate(tile.publishedAt)}
        </ThemedText>
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
// PINNED SECTION HEADER
// =============================================================================

function PinnedHeader({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={styles.pinnedHeader}>
      <IconSymbol name="pin.fill" size={12} color={colors.textTertiary} />
      <ThemedText style={[styles.pinnedHeaderText, { color: colors.textTertiary }]}>Pinned</ThemedText>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BusinessExplorePageV2() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Filter state
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<ScopeFilter>('All Accessible');
  const [activeType, setActiveType] = useState<TypeFilter>('All');
  const [visFilter, setVisFilter] = useState<VisFilter>('All');
  const [entityExpanded, setEntityExpanded] = useState(false);
  const [activeEntity, setActiveEntity] = useState<string | null>(null);

  // Quick Actions sheet
  const [sheetTile, setSheetTile] = useState<BizExploreTile | null>(null);

  // Visibility-filtered base set (user can see 0..3 since MOCK_USER_VISIBILITY = 4)
  const baseTiles = useMemo(
    () => BIZ_EXPLORE_TILES.filter((t) => t.visibilityClass < MOCK_USER_VISIBILITY),
    [],
  );

  // Available entities
  const availableEntities = useMemo(() => getEntities(baseTiles), [baseTiles]);

  // Cascading filter pipeline
  const filteredTiles = useMemo(() => {
    let tiles = baseTiles;

    // Scope
    if (scope === 'My Entity') {
      tiles = tiles.filter((t) => t.entityId === MOCK_USER_ENTITY);
    }

    // Entity sub-filter (only when All Accessible)
    if (scope === 'All Accessible' && activeEntity) {
      tiles = tiles.filter((t) => t.entityName === activeEntity);
    }

    // Type
    if (activeType !== 'All') {
      tiles = tiles.filter((t) => t.type === activeType);
    }

    // Visibility (Founder only)
    if (IS_FOUNDER && visFilter !== 'All') {
      const vc = VIS_FILTER_MAP[visFilter];
      tiles = tiles.filter((t) => t.visibilityClass === vc);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      tiles = tiles.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.entityName.toLowerCase().includes(q) ||
          (t.dealName && t.dealName.toLowerCase().includes(q)) ||
          (t.tag && t.tag.toLowerCase().includes(q)) ||
          (t.speaker && t.speaker.toLowerCase().includes(q)),
      );
    }

    // Split pinned vs unpinned
    const pinned = tiles
      .filter((t) => t.isPinned)
      .sort((a, b) => (a.pinnedOrder ?? 999) - (b.pinnedOrder ?? 999));
    const unpinned = tiles
      .filter((t) => !t.isPinned)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    return [...pinned, ...unpinned];
  }, [baseTiles, scope, activeEntity, activeType, visFilter, search]);

  // Index of first non-pinned tile (for section header)
  const pinnedCount = useMemo(
    () => filteredTiles.filter((t) => t.isPinned).length,
    [filteredTiles],
  );

  // Scope change resets entity sub-filter
  const handleScopeChange = useCallback((newScope: ScopeFilter) => {
    setScope(newScope);
    setActiveEntity(null);
    setEntityExpanded(false);
  }, []);

  const handleEntitySelect = useCallback((entity: string) => {
    setActiveEntity((prev) => (prev === entity ? null : entity));
    setEntityExpanded(false);
  }, []);

  const handleTilePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleTileLongPress = useCallback((tile: BizExploreTile) => {
    if (!IS_FOUNDER) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSheetTile(tile);
  }, []);

  // Quick Action handlers
  const handlePinToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSheetTile(null);
  }, []);

  const handleEditMetadata = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSheetTile(null);
  }, []);

  const handleChangeVisibility = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSheetTile(null);
  }, []);

  const handleLinkToDeal = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSheetTile(null);
  }, []);

  const handleLinkToVault = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSheetTile(null);
  }, []);

  const handleArchive = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSheetTile(null);
  }, []);

  // Render tile with pinned section header injection
  const renderTile = useCallback(
    ({ item, index }: { item: BizExploreTile; index: number }) => (
      <TileCard
        tile={item}
        colors={colors}
        onPress={handleTilePress}
        onLongPress={() => handleTileLongPress(item)}
      />
    ),
    [colors, handleTilePress, handleTileLongPress],
  );

  const keyExtractor = useCallback((item: BizExploreTile) => item.id, []);

  // List header: search + filters + pinned label
  const ListHeader = useMemo(
    () => (
      <View>
        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search title / entity / deal / tag / speaker"
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
            label="My Entity"
            active={scope === 'My Entity'}
            colors={colors}
            onPress={() => handleScopeChange('My Entity')}
          />
          <Pill
            label="All Accessible"
            active={scope === 'All Accessible'}
            colors={colors}
            onPress={() => handleScopeChange('All Accessible')}
          />

          <View style={[styles.pillDivider, { backgroundColor: colors.border }]} />

          {/* Entity pill (only when All Accessible) */}
          {scope === 'All Accessible' && (
            <>
              <Pill
                label={activeEntity ?? 'Entity'}
                active={!!activeEntity || entityExpanded}
                colors={colors}
                onPress={() => setEntityExpanded(!entityExpanded)}
                hasChevron
              />
              <View style={[styles.pillDivider, { backgroundColor: colors.border }]} />
            </>
          )}

          {/* Type pills */}
          {(['All', ...BIZ_EXPLORE_TYPES] as TypeFilter[]).map((type) => (
            <Pill
              key={type}
              label={type}
              active={activeType === type}
              colors={colors}
              onPress={() => setActiveType(type)}
            />
          ))}

          {/* Visibility filter (Founder only) */}
          {IS_FOUNDER && (
            <>
              <View style={[styles.pillDivider, { backgroundColor: colors.border }]} />
              {(['All', 'Public', 'Internal', 'Board', 'Executive'] as VisFilter[]).map((vf) => (
                <Pill
                  key={`vis-${vf}`}
                  label={vf === 'All' ? 'All Vis' : vf}
                  active={visFilter === vf}
                  colors={colors}
                  onPress={() => setVisFilter(vf)}
                />
              ))}
            </>
          )}
        </ScrollView>

        {/* Entity sub-row */}
        {scope === 'All Accessible' && entityExpanded && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subFilterScroll}
          >
            {availableEntities.map((entity) => (
              <Pill
                key={entity}
                label={entity}
                active={activeEntity === entity}
                colors={colors}
                onPress={() => handleEntitySelect(entity)}
              />
            ))}
          </ScrollView>
        )}

        {/* Pinned section header */}
        {pinnedCount > 0 && <PinnedHeader colors={colors} />}
      </View>
    ),
    [
      colors, search, scope, activeType, visFilter, activeEntity,
      entityExpanded, availableEntities, pinnedCount,
      handleScopeChange, handleEntitySelect,
    ],
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

      {/* Quick Actions Sheet (Founder Only) */}
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
                  {sheetTile.entityName} · {sheetTile.duration}
                </ThemedText>
              </View>
            </View>

            {/* Actions */}
            <Pressable style={[styles.sheetAction, { borderBottomColor: colors.border }]} onPress={handlePinToggle}>
              <IconSymbol name={sheetTile.isPinned ? 'pin.slash' : 'pin'} size={20} color={colors.text} />
              <ThemedText style={[styles.sheetActionText, { color: colors.text }]}>
                {sheetTile.isPinned ? 'Unpin' : 'Pin'}
              </ThemedText>
            </Pressable>
            <Pressable style={[styles.sheetAction, { borderBottomColor: colors.border }]} onPress={handleEditMetadata}>
              <IconSymbol name="pencil" size={20} color={colors.text} />
              <ThemedText style={[styles.sheetActionText, { color: colors.text }]}>Edit Metadata</ThemedText>
            </Pressable>
            <Pressable style={[styles.sheetAction, { borderBottomColor: colors.border }]} onPress={handleChangeVisibility}>
              <IconSymbol name="eye" size={20} color={colors.text} />
              <ThemedText style={[styles.sheetActionText, { color: colors.text }]}>Change Visibility</ThemedText>
            </Pressable>
            <Pressable style={[styles.sheetAction, { borderBottomColor: colors.border }]} onPress={handleLinkToDeal}>
              <IconSymbol name="link" size={20} color={colors.text} />
              <ThemedText style={[styles.sheetActionText, { color: colors.text }]}>Link to Deal</ThemedText>
            </Pressable>
            <Pressable style={[styles.sheetAction, { borderBottomColor: colors.border }]} onPress={handleLinkToVault}>
              <IconSymbol name="doc" size={20} color={colors.text} />
              <ThemedText style={[styles.sheetActionText, { color: colors.text }]}>Link to Vault</ThemedText>
            </Pressable>
            <Pressable style={styles.sheetAction} onPress={handleArchive}>
              <IconSymbol name="archivebox" size={20} color="#EF4444" />
              <ThemedText style={[styles.sheetActionText, { color: '#EF4444' }]}>Archive</ThemedText>
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

  // Pinned header
  pinnedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingTop: 8,
    paddingBottom: 6,
  },
  pinnedHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Tile (16:9 thumbnail)
  tile: {
    flex: 1,
    marginBottom: 14,
  },
  tileThumbnail: {
    aspectRatio: 16 / 9,
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
  tileVisBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  tileBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  tilePinBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 72,
    height: 40,
    borderRadius: 6,
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
