/**
 * SportsExplorePageV2 — 2-column grid with cascading filters.
 * Cross-team discovery within visibility boundaries.
 * Rendering context: Assistant Coach / Recruiting Coordinator (A2, V3, program-level).
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
  EXPLORE_TILES,
  EXPLORE_LEVELS,
  EXPLORE_TYPES,
  getTeamsForLevel,
  type ExploreTile,
  type ExploreLevel,
  type ExploreMediaType,
} from '@/data/mock-explore-grid';

// =============================================================================
// MOCK USER CONTEXT (A2, V3, Carroll)
// =============================================================================

const MOCK_USER_VISIBILITY = 3;
const MOCK_ORG = 'org-carroll';

type ScopeFilter = 'My Org' | 'All Accessible';
type TypeFilter = 'All' | ExploreMediaType;

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
// TILE CARD
// =============================================================================

function TileCard({
  tile,
  colors,
  onPress,
  onLongPress,
}: {
  tile: ExploreTile;
  colors: typeof Colors.light;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const subtitle = tile.opponent ? `${tile.team} vs ${tile.opponent}` : tile.team;

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
        {/* Duration badge */}
        <View style={styles.tileDuration}>
          <ThemedText style={styles.tileDurationText}>{tile.duration}</ThemedText>
        </View>
        {/* Type badge */}
        <View style={[styles.tileTypeBadge, {
          backgroundColor: tile.type === 'Game' ? 'rgba(0,0,0,0.6)' : tile.type === 'Clip' ? '#1D9BF0' : '#22C55E',
        }]}>
          <ThemedText style={styles.tileTypeText}>{tile.type.toUpperCase()}</ThemedText>
        </View>
      </View>
      {/* Info */}
      <View style={styles.tileInfo}>
        <ThemedText style={[styles.tileTitle, { color: colors.text }]} numberOfLines={1}>
          {tile.title}
        </ThemedText>
        <ThemedText style={[styles.tileSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {subtitle}
        </ThemedText>
        <ThemedText style={[styles.tileDate, { color: colors.textTertiary }]}>
          {formatDate(tile.date)}
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
// MAIN COMPONENT
// =============================================================================

export function SportsExplorePageV2() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Filter state
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<ScopeFilter>('All Accessible');
  const [activeLevel, setActiveLevel] = useState<ExploreLevel | null>(null);
  const [activeTeam, setActiveTeam] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<TypeFilter>('All');
  const [levelExpanded, setLevelExpanded] = useState(false);
  const [teamExpanded, setTeamExpanded] = useState(false);

  // Quick Actions sheet
  const [sheetTile, setSheetTile] = useState<ExploreTile | null>(null);

  // Visibility-filtered base set
  const baseTiles = useMemo(
    () => EXPLORE_TILES.filter((t) => t.visibilityClass <= MOCK_USER_VISIBILITY),
    [],
  );

  // Cascading filter pipeline
  const filteredTiles = useMemo(() => {
    let tiles = baseTiles;

    // Scope
    if (scope === 'My Org') {
      tiles = tiles.filter((t) => t.orgId === MOCK_ORG);
    }

    // Level
    if (activeLevel) {
      tiles = tiles.filter((t) => t.level === activeLevel);
    }

    // Team
    if (activeTeam) {
      tiles = tiles.filter((t) => t.team === activeTeam);
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
          t.team.toLowerCase().includes(q) ||
          (t.opponent && t.opponent.toLowerCase().includes(q)),
      );
    }

    return tiles;
  }, [baseTiles, scope, activeLevel, activeTeam, activeType, search]);

  // Teams available for current level filter
  const availableTeams = useMemo(
    () => getTeamsForLevel(activeLevel, baseTiles),
    [activeLevel, baseTiles],
  );

  // Cascading: level change resets team
  const handleLevelSelect = useCallback((level: ExploreLevel) => {
    setActiveLevel((prev) => {
      if (prev === level) {
        setLevelExpanded(false);
        return null;
      }
      return level;
    });
    setActiveTeam(null);
    setTeamExpanded(false);
    setLevelExpanded(false);
  }, []);

  const handleTeamSelect = useCallback((team: string) => {
    setActiveTeam((prev) => (prev === team ? null : team));
    setTeamExpanded(false);
  }, []);

  const handleTilePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleTileLongPress = useCallback((tile: ExploreTile) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSheetTile(tile);
  }, []);

  const handleShare = useCallback(async () => {
    if (!sheetTile) return;
    setSheetTile(null);
    try {
      await Share.share({ message: `${sheetTile.title} — ${sheetTile.team}` });
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
    ({ item }: { item: ExploreTile }) => (
      <TileCard
        tile={item}
        colors={colors}
        onPress={handleTilePress}
        onLongPress={() => handleTileLongPress(item)}
      />
    ),
    [colors, handleTilePress, handleTileLongPress],
  );

  const keyExtractor = useCallback((item: ExploreTile) => item.id, []);

  // List header: search + filters
  const ListHeader = useMemo(
    () => (
      <View>
        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search games, clips, teams..."
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
          <Pill label="My Org" active={scope === 'My Org'} colors={colors} onPress={() => setScope(scope === 'My Org' ? 'All Accessible' : 'My Org')} />
          <Pill label="All Accessible" active={scope === 'All Accessible'} colors={colors} onPress={() => setScope('All Accessible')} />

          <View style={[styles.pillDivider, { backgroundColor: colors.border }]} />

          {/* Level pill */}
          <Pill
            label={activeLevel ?? 'Level'}
            active={!!activeLevel || levelExpanded}
            colors={colors}
            onPress={() => { setLevelExpanded(!levelExpanded); setTeamExpanded(false); }}
            hasChevron
          />

          {/* Team pill */}
          <Pill
            label={activeTeam ?? 'Team'}
            active={!!activeTeam || teamExpanded}
            colors={colors}
            onPress={() => { setTeamExpanded(!teamExpanded); setLevelExpanded(false); }}
            hasChevron
          />

          <View style={[styles.pillDivider, { backgroundColor: colors.border }]} />

          {/* Type pills */}
          {(['All', ...EXPLORE_TYPES] as TypeFilter[]).map((type) => (
            <Pill
              key={type}
              label={type === 'All' ? 'All' : `${type}s`}
              active={activeType === type}
              colors={colors}
              onPress={() => setActiveType(type)}
            />
          ))}
        </ScrollView>

        {/* Level sub-row */}
        {levelExpanded && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subFilterScroll}
          >
            {EXPLORE_LEVELS.map((level) => (
              <Pill
                key={level}
                label={level}
                active={activeLevel === level}
                colors={colors}
                onPress={() => handleLevelSelect(level)}
              />
            ))}
          </ScrollView>
        )}

        {/* Team sub-row */}
        {teamExpanded && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subFilterScroll}
          >
            {availableTeams.map((team) => (
              <Pill
                key={team}
                label={team}
                active={activeTeam === team}
                colors={colors}
                onPress={() => handleTeamSelect(team)}
              />
            ))}
          </ScrollView>
        )}
      </View>
    ),
    [colors, search, scope, activeLevel, activeTeam, activeType, levelExpanded, teamExpanded, availableTeams, handleLevelSelect, handleTeamSelect],
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
                  {sheetTile.team} · {sheetTile.duration}
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
