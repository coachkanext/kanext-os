/**
 * ChurchLibraryV2 — Folder-first structured archive for church mode.
 * 6 sections: Services, Sermons, Ministries, Training, Playlists, Saved
 * 3-level drill-in: Sections → Folders → Videos
 */

import React, { useState, useMemo, useCallback } from 'react';
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
  CHURCH_LIBRARY_FOLDERS,
  CHURCH_FOLDER_VIDEOS,
  CHURCH_SAVED_VIDEOS,
  getVisibleSections,
  filterVideos,
  type ChurchLibrarySectionId,
  type ChurchLibrarySection,
  type ChurchLibraryFolder,
  type ChurchLibraryVideo,
} from '@/data/mock-church-library';

// =============================================================================
// MOCK USER CONTEXT (A2, V3, Children's + Singles ministry member)
// =============================================================================

const MOCK_USER_VISIBILITY = 3;
const MOCK_USER_HAS_MINISTRY = true;

// =============================================================================
// NAVIGATION STATE
// =============================================================================

type NavState =
  | { level: 'sections' }
  | { level: 'folders'; sectionId: ChurchLibrarySectionId; sectionName: string }
  | { level: 'videos'; sectionId: ChurchLibrarySectionId; folderId: string; folderName: string };

// =============================================================================
// SECTION CARD
// =============================================================================

function SectionCard({
  section,
  colors,
  onPress,
}: {
  section: ChurchLibrarySection;
  colors: typeof Colors.light;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        cardStyles.sectionCard,
        { backgroundColor: pressed ? colors.cardElevated : colors.card },
      ]}
      onPress={onPress}
    >
      <View style={[cardStyles.sectionStrip, { backgroundColor: section.colorStrip }]} />
      <View style={[cardStyles.sectionIconCircle, { backgroundColor: section.colorStrip + '1A' }]}>
        <IconSymbol name={section.icon as any} size={20} color={section.colorStrip} />
      </View>
      <View style={cardStyles.sectionInfo}>
        <ThemedText style={[cardStyles.sectionName, { color: colors.text }]}>
          {section.name}
        </ThemedText>
        <ThemedText style={[cardStyles.sectionCount, { color: colors.textTertiary }]}>
          {section.itemCount} items
        </ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
    </Pressable>
  );
}

const cardStyles = StyleSheet.create({
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    paddingRight: Spacing.md,
  },
  sectionStrip: { width: 4, alignSelf: 'stretch' },
  sectionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm + 4,
  },
  sectionInfo: {
    flex: 1,
    paddingVertical: Spacing.sm + 6,
    paddingHorizontal: Spacing.sm + 4,
    gap: 2,
  },
  sectionName: { fontSize: 15, fontWeight: '600' },
  sectionCount: { fontSize: 11 },
});

// =============================================================================
// FOLDER CARD
// =============================================================================

function FolderCard({
  folder,
  colors,
  onPress,
}: {
  folder: ChurchLibraryFolder;
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
      <View style={[folderStyles.iconCircle, { backgroundColor: colors.backgroundTertiary }]}>
        <IconSymbol name="folder.fill" size={18} color={colors.textSecondary} />
      </View>
      <View style={folderStyles.info}>
        <ThemedText style={[folderStyles.name, { color: colors.text }]}>
          {folder.name}
        </ThemedText>
        <ThemedText style={[folderStyles.count, { color: colors.textTertiary }]}>
          {folder.itemCount} videos
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    paddingHorizontal: Spacing.sm + 4,
    gap: 2,
  },
  name: { fontSize: 14, fontWeight: '600' },
  count: { fontSize: 11 },
});

// =============================================================================
// VIDEO ROW
// =============================================================================

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function VideoRow({
  video,
  colors,
  onPress,
  onLongPress,
}: {
  video: ChurchLibraryVideo;
  colors: typeof Colors.light;
  onPress: () => void;
  onLongPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        videoStyles.row,
        {
          backgroundColor: pressed ? colors.backgroundSecondary : 'transparent',
          borderBottomColor: colors.border,
        },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
    >
      {/* Thumbnail */}
      <View style={[videoStyles.thumb, { backgroundColor: video.thumbnailColor }]}>
        <IconSymbol name="play.fill" size={14} color="rgba(255,255,255,0.7)" />
        <View style={videoStyles.durationBadge}>
          <ThemedText style={videoStyles.durationText}>{video.duration}</ThemedText>
        </View>
      </View>
      {/* Info */}
      <View style={videoStyles.info}>
        <ThemedText style={[videoStyles.title, { color: colors.text }]} numberOfLines={1}>
          {video.title}
        </ThemedText>
        <View style={videoStyles.metaRow}>
          {video.speaker && (
            <ThemedText style={[videoStyles.speaker, { color: colors.textSecondary }]} numberOfLines={1}>
              {video.speaker}
            </ThemedText>
          )}
          <ThemedText style={[videoStyles.date, { color: colors.textTertiary }]}>
            {formatDate(video.date)}
          </ThemedText>
        </View>
        {video.ministryName && (
          <View style={[videoStyles.ministryBadge, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[videoStyles.ministryText, { color: colors.textSecondary }]}>
              {video.ministryName}
            </ThemedText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const videoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm + 2,
  },
  thumb: {
    width: 64,
    height: 48,
    borderRadius: BorderRadius.sm + 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  durationText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#fff',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  speaker: {
    fontSize: 12,
    flex: 1,
  },
  date: {
    fontSize: 11,
  },
  ministryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 2,
  },
  ministryText: {
    fontSize: 9,
    fontWeight: '600',
  },
});

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({ colors, label }: { colors: typeof Colors.light; label: string }) {
  return (
    <View style={styles.emptyState}>
      <IconSymbol name="tray" size={28} color={colors.textTertiary} />
      <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ChurchLibraryV2() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Navigation
  const [nav, setNav] = useState<NavState>({ level: 'sections' });
  const [search, setSearch] = useState('');

  // Quick Actions sheet
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetItem, setSheetItem] = useState<ChurchLibraryVideo | null>(null);

  // Visible sections
  const visibleSections = useMemo(
    () => getVisibleSections(MOCK_USER_VISIBILITY, MOCK_USER_HAS_MINISTRY),
    [],
  );

  // Current folders (for folder-level view)
  const currentFolders = useMemo(() => {
    if (nav.level !== 'folders') return [];
    return CHURCH_LIBRARY_FOLDERS[nav.sectionId] ?? [];
  }, [nav]);

  // Current videos (for video-level view)
  const currentVideos = useMemo(() => {
    if (nav.level === 'videos') {
      const raw = CHURCH_FOLDER_VIDEOS[nav.folderId] ?? [];
      return filterVideos(raw, MOCK_USER_VISIBILITY, search);
    }
    // Saved section goes straight to videos from folders level
    if (nav.level === 'folders' && nav.sectionId === 'saved') {
      return filterVideos(CHURCH_SAVED_VIDEOS, MOCK_USER_VISIBILITY, search);
    }
    return [];
  }, [nav, search]);

  // Navigation handlers
  const handleSectionPress = useCallback((section: ChurchLibrarySection) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Saved has no subfolders — go straight to video display at folders level
    setNav({ level: 'folders', sectionId: section.id, sectionName: section.name });
    setSearch('');
  }, []);

  const handleFolderPress = useCallback((folder: ChurchLibraryFolder) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNav((prev) => {
      if (prev.level !== 'folders') return prev;
      return { level: 'videos', sectionId: prev.sectionId, folderId: folder.id, folderName: folder.name };
    });
    setSearch('');
  }, []);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearch('');
    setNav((prev) => {
      if (prev.level === 'videos') {
        return { level: 'folders', sectionId: prev.sectionId, sectionName: '' };
      }
      return { level: 'sections' };
    });
  }, []);

  const handleVideoPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleVideoLongPress = useCallback((video: ChurchLibraryVideo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSheetItem(video);
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
        await Share.share({ message: `${sheetItem.title}${sheetItem.speaker ? ` — ${sheetItem.speaker}` : ''}` });
      } catch {}
    }
    setSheetVisible(false);
  }, [sheetItem]);

  const handleAddToPlaylist = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSheetVisible(false);
  }, []);

  // Back title
  const backTitle = useMemo(() => {
    if (nav.level === 'folders') {
      return nav.sectionName;
    }
    if (nav.level === 'videos') {
      return nav.folderName;
    }
    return '';
  }, [nav]);

  // ─── SECTIONS VIEW ───
  if (nav.level === 'sections') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Search */}
        <View style={styles.searchRow}>
          <View style={[styles.searchBar, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
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
          data={visibleSections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SectionCard section={item} colors={colors} onPress={() => handleSectionPress(item)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState colors={colors} label="No library sections" />}
        />

        <QuickActionsSheet
          visible={sheetVisible}
          item={sheetItem}
          colors={colors}
          onClose={() => setSheetVisible(false)}
          onSave={handleSave}
          onShare={handleShareAction}
          onAddToPlaylist={handleAddToPlaylist}
        />
      </View>
    );
  }

  // ─── FOLDERS VIEW (or flat video list for Saved) ───
  const isSavedSection = nav.level === 'folders' && nav.sectionId === 'saved';

  if (nav.level === 'folders' && !isSavedSection) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Back Header */}
        <Pressable style={styles.backHeader} onPress={handleBack}>
          <IconSymbol name="chevron.left" size={18} color={colors.text} />
          <ThemedText style={[styles.backTitle, { color: colors.text }]}>
            {backTitle}
          </ThemedText>
        </Pressable>

        <FlatList
          data={currentFolders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FolderCard folder={item} colors={colors} onPress={() => handleFolderPress(item)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState colors={colors} label="No folders" />}
        />

        <QuickActionsSheet
          visible={sheetVisible}
          item={sheetItem}
          colors={colors}
          onClose={() => setSheetVisible(false)}
          onSave={handleSave}
          onShare={handleShareAction}
          onAddToPlaylist={handleAddToPlaylist}
        />
      </View>
    );
  }

  // ─── VIDEOS VIEW (or Saved flat list) ───
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Back Header */}
      <Pressable style={styles.backHeader} onPress={handleBack}>
        <IconSymbol name="chevron.left" size={18} color={colors.text} />
        <ThemedText style={[styles.backTitle, { color: colors.text }]}>
          {backTitle}
        </ThemedText>
      </Pressable>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
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
        data={currentVideos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VideoRow
            video={item}
            colors={colors}
            onPress={handleVideoPress}
            onLongPress={() => handleVideoLongPress(item)}
          />
        )}
        contentContainerStyle={styles.videoListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState colors={colors} label="No videos found" />}
      />

      <QuickActionsSheet
        visible={sheetVisible}
        item={sheetItem}
        colors={colors}
        onClose={() => setSheetVisible(false)}
        onSave={handleSave}
        onShare={handleShareAction}
        onAddToPlaylist={handleAddToPlaylist}
      />
    </View>
  );
}

// =============================================================================
// QUICK ACTIONS SHEET (extracted for reuse across views)
// =============================================================================

function QuickActionsSheet({
  visible,
  item,
  colors,
  onClose,
  onSave,
  onShare,
  onAddToPlaylist,
}: {
  visible: boolean;
  item: ChurchLibraryVideo | null;
  colors: typeof Colors.light;
  onClose: () => void;
  onSave: () => void;
  onShare: () => void;
  onAddToPlaylist: () => void;
}) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={item?.title ?? 'Actions'}
      useModal
    >
      <View style={styles.sheetActions}>
        <Pressable style={styles.sheetAction} onPress={onSave}>
          <IconSymbol name="bookmark" size={20} color={colors.text} />
          <ThemedText style={[styles.sheetActionText, { color: colors.text }]}>Save</ThemedText>
        </Pressable>
        <Pressable style={styles.sheetAction} onPress={onAddToPlaylist}>
          <IconSymbol name="text.badge.plus" size={20} color={colors.text} />
          <ThemedText style={[styles.sheetActionText, { color: colors.text }]}>Add to Playlist</ThemedText>
        </Pressable>
        <Pressable style={styles.sheetAction} onPress={onShare}>
          <IconSymbol name="paperplane" size={20} color={colors.text} />
          <ThemedText style={[styles.sheetActionText, { color: colors.text }]}>Share</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
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
  videoListContent: {
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
