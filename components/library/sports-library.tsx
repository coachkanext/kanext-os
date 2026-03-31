/**
 * SportsLibrary — Structured archive with 5 folder drill-in.
 * Folders: Games (by season), Practice (by date), Clips (by tag),
 * Playlists, Saved.
 * Rendering context: Assistant Coach / Recruiting Coordinator (A2, V3).
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  SectionList,
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
  LIBRARY_FOLDERS,
  GAME_ENTRIES,
  PRACTICE_ENTRIES,
  CLIP_ENTRIES,
  PLAYLIST_ENTRIES,
  SAVED_ENTRIES,
  getGameSeasons,
  getGamesBySeason,
  getFilteredPractice,
  getClipTagGroups,
  getClipsByTag,
  getFilteredSaved,
  type LibraryFolderId,
  type LibraryFolder,
  type GameEntry,
  type PracticeEntry,
  type ClipEntry,
  type PlaylistEntry,
  type SavedEntry,
} from '@/data/mock-library-sports';

// Mock RBAC
const MOCK_USER_VISIBILITY = 3;

// =============================================================================
// FOLDER CARD (List View)
// =============================================================================

function FolderCard({
  folder,
  colors,
  onPress,
}: {
  folder: LibraryFolder;
  colors: typeof Colors.light;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        folderStyles.card,
        { backgroundColor: pressed ? colors.cardElevated : colors.card },
      ]}
      onPress={onPress}
    >
      <View style={[folderStyles.strip, { backgroundColor: folder.colorStrip }]} />
      <View style={[folderStyles.iconCircle, { backgroundColor: folder.colorStrip + '1A' }]}>
        <IconSymbol name={folder.icon as any} size={20} color={folder.colorStrip} />
      </View>
      <View style={folderStyles.info}>
        <ThemedText style={[folderStyles.name, { color: colors.text }]}>
          {folder.name}
        </ThemedText>
        <ThemedText style={[folderStyles.desc, { color: colors.textSecondary }]} numberOfLines={1}>
          {folder.description}
        </ThemedText>
        <ThemedText style={[folderStyles.count, { color: colors.textTertiary }]}>
          {folder.itemCount} items
        </ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
    </Pressable>
  );
}

const folderStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    paddingRight: Spacing.md,
  },
  strip: { width: 4, alignSelf: 'stretch' },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm + 4,
  },
  info: {
    flex: 1,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.sm + 4,
    gap: 3,
  },
  name: { fontSize: 15, fontWeight: '600' },
  desc: { fontSize: 12 },
  count: { fontSize: 11, marginTop: 1 },
});

// =============================================================================
// ENTRY ROW — shared row component for most item types
// =============================================================================

function EntryRow({
  colors,
  thumbnailColor,
  title,
  meta,
  badge,
  badgeColor,
  onPress,
  onLongPress,
}: {
  colors: typeof Colors.light;
  thumbnailColor: string;
  title: string;
  meta: string;
  badge?: string;
  badgeColor?: string;
  onPress: () => void;
  onLongPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        rowStyles.card,
        { backgroundColor: pressed ? colors.cardElevated : colors.card },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
    >
      <View style={[rowStyles.thumb, { backgroundColor: thumbnailColor }]}>
        <IconSymbol name="play.fill" size={12} color="#fff" />
      </View>
      <View style={rowStyles.info}>
        <ThemedText style={[rowStyles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </ThemedText>
        <ThemedText style={[rowStyles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
          {meta}
        </ThemedText>
      </View>
      {badge && badgeColor && (
        <View style={[rowStyles.badge, { backgroundColor: badgeColor + '1A' }]}>
          <ThemedText style={[rowStyles.badgeText, { color: badgeColor }]}>{badge}</ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const rowStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  thumb: {
    width: 56,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.lg,
  },
  info: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm + 2,
    gap: 2,
  },
  title: { fontSize: 13, fontWeight: '600' },
  meta: { fontSize: 11 },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm + 2,
  },
  badgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
});

// =============================================================================
// SECTION HEADER
// =============================================================================

function SectionHeader({ title, colors }: { title: string; colors: typeof Colors.light }) {
  return (
    <View style={sectionStyles.header}>
      <ThemedText style={[sectionStyles.text, { color: colors.textTertiary }]}>
        {title}
      </ThemedText>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  header: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  text: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
});

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyFolder({ colors, label }: { colors: typeof Colors.light; label: string }) {
  return (
    <View style={styles.emptyState}>
      <IconSymbol name="tray" size={28} color={colors.textTertiary} />
      <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// RESULT HELPERS
// =============================================================================

function getResultColor(result?: 'W' | 'L'): string {
  if (result === 'W') return '#5A8A6E';
  if (result === 'L') return '#B85C5C';
  return '#9C9790';
}

const TAG_COLORS: Record<string, string> = {
  Shooting: '#B8943E',
  Install: '#A855F7',
  Scrimmage: '#5A8A6E',
  'Pre-game': '#1A1714',
};

const SAVED_TYPE_COLORS: Record<string, string> = {
  game: '#5A8A6E',
  clip: '#1A1714',
  practice: '#B8943E',
  reel: '#A855F7',
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SportsLibrary() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Drill-in state
  const [selectedFolder, setSelectedFolder] = useState<LibraryFolderId | null>(null);
  const [search, setSearch] = useState('');

  // Quick Actions sheet
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetTitle, setSheetTitle] = useState('');

  const selectedFolderData = useMemo(
    () => LIBRARY_FOLDERS.find((f) => f.id === selectedFolder),
    [selectedFolder],
  );

  const handleFolderPress = useCallback((id: LibraryFolderId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFolder(id);
  }, []);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFolder(null);
    setSearch('');
  }, []);

  const handleLongPress = useCallback((title: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSheetTitle(title);
    setSheetVisible(true);
  }, []);

  const handleSheetAction = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSheetVisible(false);
  }, []);

  const handleShareAction = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({ message: sheetTitle });
    } catch {}
    setSheetVisible(false);
  }, [sheetTitle]);

  const tapHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // ─── Folder List View ───
  if (selectedFolder === null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <IconSymbol name="magnifyingglass" size={14} color={colors.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search videos"
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

        <FlatList
          data={LIBRARY_FOLDERS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FolderCard folder={item} colors={colors} onPress={() => handleFolderPress(item.id)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  // ─── Folder Content View ───
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Back Header */}
      <Pressable style={styles.backHeader} onPress={handleBack}>
        <IconSymbol name="chevron.left" size={18} color={colors.text} />
        <ThemedText style={[styles.backTitle, { color: colors.text }]}>
          {selectedFolderData?.name ?? 'Folder'}
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

      {/* Folder-specific content */}
      {selectedFolder === 'games' && (
        <GamesContent colors={colors} search={search} onLongPress={handleLongPress} onTap={tapHaptic} />
      )}
      {selectedFolder === 'practice' && (
        <PracticeContent colors={colors} search={search} onLongPress={handleLongPress} onTap={tapHaptic} />
      )}
      {selectedFolder === 'clips' && (
        <ClipsContent colors={colors} search={search} onLongPress={handleLongPress} onTap={tapHaptic} />
      )}
      {selectedFolder === 'playlists' && (
        <PlaylistsContent colors={colors} search={search} onTap={tapHaptic} />
      )}
      {selectedFolder === 'saved' && (
        <SavedContent colors={colors} search={search} onLongPress={handleLongPress} onTap={tapHaptic} />
      )}

      {/* Quick Actions BottomSheet */}
      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title={sheetTitle}
        useModal
      >
        <View style={styles.sheetActions}>
          <Pressable style={styles.sheetAction} onPress={handleSheetAction}>
            <IconSymbol name="text.badge.plus" size={20} color={colors.text} />
            <ThemedText style={[styles.sheetActionText, { color: colors.text }]}>Add to Playlist</ThemedText>
          </Pressable>
          <Pressable style={styles.sheetAction} onPress={handleSheetAction}>
            <IconSymbol name="bookmark" size={20} color={colors.text} />
            <ThemedText style={[styles.sheetActionText, { color: colors.text }]}>Save</ThemedText>
          </Pressable>
          <Pressable style={styles.sheetAction} onPress={handleShareAction}>
            <IconSymbol name="paperplane" size={20} color={colors.text} />
            <ThemedText style={[styles.sheetActionText, { color: colors.text }]}>Share</ThemedText>
          </Pressable>
        </View>
      </BottomSheet>
    </View>
  );
}

// =============================================================================
// GAMES CONTENT — SectionList grouped by season
// =============================================================================

function GamesContent({
  colors,
  search,
  onLongPress,
  onTap,
}: {
  colors: typeof Colors.light;
  search: string;
  onLongPress: (title: string) => void;
  onTap: () => void;
}) {
  const q = search.toLowerCase().trim();
  const sections = useMemo(() => {
    const seasons = getGameSeasons();
    return seasons
      .map((season) => {
        let games = getGamesBySeason(season, MOCK_USER_VISIBILITY);
        if (q) {
          games = games.filter((g) =>
            `${g.opponent} ${g.date}`.toLowerCase().includes(q),
          );
        }
        return { title: season, data: games };
      })
      .filter((s) => s.data.length > 0);
  }, [q]);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderSectionHeader={({ section }) => (
        <SectionHeader title={section.title} colors={colors} />
      )}
      renderItem={({ item }) => (
        <EntryRow
          colors={colors}
          thumbnailColor={item.thumbnailColor}
          title={`vs ${item.opponent}`}
          meta={`${item.date} · ${item.duration}`}
          badge={item.result ? `${item.result} ${item.score ?? ''}`.trim() : undefined}
          badgeColor={item.result ? getResultColor(item.result) : undefined}
          onPress={onTap}
          onLongPress={() => onLongPress(`vs ${item.opponent}`)}
        />
      )}
      contentContainerStyle={styles.sectionListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyFolder colors={colors} label="No games found" />}
      stickySectionHeadersEnabled={false}
    />
  );
}

// =============================================================================
// PRACTICE CONTENT — flat list
// =============================================================================

function PracticeContent({
  colors,
  search,
  onLongPress,
  onTap,
}: {
  colors: typeof Colors.light;
  search: string;
  onLongPress: (title: string) => void;
  onTap: () => void;
}) {
  const q = search.toLowerCase().trim();
  const items = useMemo(() => {
    let entries = getFilteredPractice(MOCK_USER_VISIBILITY);
    if (q) {
      entries = entries.filter((p) =>
        `${p.title} ${p.date} ${p.tag ?? ''}`.toLowerCase().includes(q),
      );
    }
    return entries;
  }, [q]);

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <EntryRow
          colors={colors}
          thumbnailColor={item.thumbnailColor}
          title={item.title}
          meta={`${item.date} · ${item.duration}`}
          badge={item.tag}
          badgeColor={item.tag ? (TAG_COLORS[item.tag] ?? '#9C9790') : undefined}
          onPress={onTap}
          onLongPress={() => onLongPress(item.title)}
        />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyFolder colors={colors} label="No practice sessions found" />}
    />
  );
}

// =============================================================================
// CLIPS CONTENT — SectionList grouped by tag
// =============================================================================

function ClipsContent({
  colors,
  search,
  onLongPress,
  onTap,
}: {
  colors: typeof Colors.light;
  search: string;
  onLongPress: (title: string) => void;
  onTap: () => void;
}) {
  const q = search.toLowerCase().trim();
  const sections = useMemo(() => {
    const tags = getClipTagGroups();
    return tags
      .map((tag) => {
        let clips = getClipsByTag(tag, MOCK_USER_VISIBILITY);
        if (q) {
          clips = clips.filter((c) =>
            `${c.title} ${c.tagGroup}`.toLowerCase().includes(q),
          );
        }
        return { title: tag, data: clips };
      })
      .filter((s) => s.data.length > 0);
  }, [q]);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderSectionHeader={({ section }) => (
        <SectionHeader title={section.title} colors={colors} />
      )}
      renderItem={({ item }) => (
        <EntryRow
          colors={colors}
          thumbnailColor={item.thumbnailColor}
          title={item.title}
          meta={`${item.date} · ${item.duration}`}
          onPress={onTap}
          onLongPress={() => onLongPress(item.title)}
        />
      )}
      contentContainerStyle={styles.sectionListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyFolder colors={colors} label="No clips found" />}
      stickySectionHeadersEnabled={false}
    />
  );
}

// =============================================================================
// PLAYLISTS CONTENT — flat list of playlists
// =============================================================================

function PlaylistsContent({
  colors,
  search,
  onTap,
}: {
  colors: typeof Colors.light;
  search: string;
  onTap: () => void;
}) {
  const q = search.toLowerCase().trim();
  const items = useMemo(() => {
    if (!q) return PLAYLIST_ENTRIES;
    return PLAYLIST_ENTRIES.filter((p) => p.name.toLowerCase().includes(q));
  }, [q]);

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [
            rowStyles.card,
            { backgroundColor: pressed ? colors.cardElevated : colors.card },
          ]}
          onPress={onTap}
        >
          <View style={[rowStyles.thumb, { backgroundColor: item.thumbnailColor }]}>
            <IconSymbol name="list.bullet" size={14} color="#fff" />
          </View>
          <View style={rowStyles.info}>
            <ThemedText style={[rowStyles.title, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </ThemedText>
            <ThemedText style={[rowStyles.meta, { color: colors.textSecondary }]}>
              {item.clipCount} clips · {item.lastUpdated}
            </ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} style={{ marginRight: Spacing.sm + 2 }} />
        </Pressable>
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyFolder colors={colors} label="No playlists found" />}
    />
  );
}

// =============================================================================
// SAVED CONTENT — flat list
// =============================================================================

function SavedContent({
  colors,
  search,
  onLongPress,
  onTap,
}: {
  colors: typeof Colors.light;
  search: string;
  onLongPress: (title: string) => void;
  onTap: () => void;
}) {
  const q = search.toLowerCase().trim();
  const items = useMemo(() => {
    let entries = getFilteredSaved(MOCK_USER_VISIBILITY);
    if (q) {
      entries = entries.filter((s) =>
        `${s.title} ${s.source}`.toLowerCase().includes(q),
      );
    }
    return entries;
  }, [q]);

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <EntryRow
          colors={colors}
          thumbnailColor={item.thumbnailColor}
          title={item.title}
          meta={`${item.source} · ${item.date} · ${item.duration}`}
          badge={item.type.toUpperCase()}
          badgeColor={SAVED_TYPE_COLORS[item.type] ?? '#9C9790'}
          onPress={onTap}
          onLongPress={() => onLongPress(item.title)}
        />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyFolder colors={colors} label="No saved items" />}
    />
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
  sectionListContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
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
