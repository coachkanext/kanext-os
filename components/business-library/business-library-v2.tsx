/**
 * BusinessLibraryV2 — Structured institutional media archive for business mode.
 * 8 sections: Executive, Capital, Governance, Operations, Product, Promotional, Playlists, Saved
 * 3-level drill-in: Sections → Folders → Videos
 * Founder-level quick actions: Add to Playlist, Pin within Folder, Link to Deal, Link to Vault, Archive
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
  BIZ_LIBRARY_SECTIONS,
  BIZ_LIBRARY_FOLDERS,
  BIZ_FOLDER_VIDEOS,
  BIZ_SAVED_VIDEOS,
  getVisibleSections,
  filterVideos,
  TYPE_COLORS,
  VISIBILITY_LABELS,
  VISIBILITY_COLORS,
  type BizLibrarySectionId,
  type BizLibrarySection,
  type BizLibraryFolder,
  type BizLibraryVideo,
} from '@/data/mock-business-library';

// =============================================================================
// MOCK USER CONTEXT (Founder — A5, V4, D5)
// =============================================================================

const MOCK_USER_VISIBILITY = 4; // Sees all (0..3)
const IS_FOUNDER = true;

// =============================================================================
// NAVIGATION STATE
// =============================================================================

type NavState =
  | { level: 'sections' }
  | { level: 'folders'; sectionId: BizLibrarySectionId; sectionName: string }
  | { level: 'videos'; sectionId: BizLibrarySectionId; folderId: string; folderName: string };

// =============================================================================
// SECTION CARD
// =============================================================================

function SectionCard({
  section,
  colors,
  onPress,
}: {
  section: BizLibrarySection;
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
  folder: BizLibraryFolder;
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
  video: BizLibraryVideo;
  colors: typeof Colors.light;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const typeColor = TYPE_COLORS[video.type];
  const visColor = VISIBILITY_COLORS[video.visibilityClass] ?? '#9C9790';
  const visLabel = VISIBILITY_LABELS[video.visibilityClass] ?? '';

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
      {/* Thumbnail (16:9) */}
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

        {/* Pills row */}
        <View style={videoStyles.pillRow}>
          <View style={[videoStyles.typePill, { backgroundColor: typeColor + '15' }]}>
            <ThemedText style={[videoStyles.pillText, { color: typeColor }]}>{video.type}</ThemedText>
          </View>
          <View style={[videoStyles.visPill, { backgroundColor: visColor + '15', borderColor: visColor + '30', borderWidth: 1 }]}>
            <ThemedText style={[videoStyles.pillText, { color: visColor }]}>{visLabel}</ThemedText>
          </View>
        </View>

        {/* Meta row */}
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

        {/* Linked metadata */}
        {(video.linkedDeal || video.linkedEvent || video.linkedDocument) && (
          <View style={videoStyles.linkedRow}>
            {video.linkedDeal && (
              <View style={[videoStyles.linkedBadge, { backgroundColor: colors.backgroundTertiary }]}>
                <IconSymbol name="link" size={8} color={colors.textTertiary} />
                <ThemedText style={[videoStyles.linkedText, { color: colors.textSecondary }]}>{video.linkedDeal}</ThemedText>
              </View>
            )}
            {video.linkedEvent && (
              <View style={[videoStyles.linkedBadge, { backgroundColor: colors.backgroundTertiary }]}>
                <IconSymbol name="calendar" size={8} color={colors.textTertiary} />
                <ThemedText style={[videoStyles.linkedText, { color: colors.textSecondary }]}>{video.linkedEvent}</ThemedText>
              </View>
            )}
            {video.linkedDocument && (
              <View style={[videoStyles.linkedBadge, { backgroundColor: colors.backgroundTertiary }]}>
                <IconSymbol name="doc" size={8} color={colors.textTertiary} />
                <ThemedText style={[videoStyles.linkedText, { color: colors.textSecondary }]}>{video.linkedDocument}</ThemedText>
              </View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const videoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm + 2,
  },
  thumb: {
    width: 80,
    height: 45,
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
    gap: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 4,
  },
  typePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
  },
  visPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
  },
  pillText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
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
  linkedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 1,
  },
  linkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    gap: 3,
  },
  linkedText: {
    fontSize: 9,
    fontWeight: '500',
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

export function BusinessLibraryV2() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Navigation
  const [nav, setNav] = useState<NavState>({ level: 'sections' });
  const [search, setSearch] = useState('');

  // Quick Actions sheet
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetItem, setSheetItem] = useState<BizLibraryVideo | null>(null);

  // Visible sections
  const visibleSections = useMemo(
    () => getVisibleSections(MOCK_USER_VISIBILITY),
    [],
  );

  // Current folders (for folder-level view)
  const currentFolders = useMemo(() => {
    if (nav.level !== 'folders') return [];
    return BIZ_LIBRARY_FOLDERS[nav.sectionId] ?? [];
  }, [nav]);

  // Current videos (for video-level view)
  const currentVideos = useMemo(() => {
    if (nav.level === 'videos') {
      const raw = BIZ_FOLDER_VIDEOS[nav.folderId] ?? [];
      return filterVideos(raw, MOCK_USER_VISIBILITY, search);
    }
    // Saved section goes straight to videos from folders level
    if (nav.level === 'folders' && nav.sectionId === 'saved') {
      return filterVideos(BIZ_SAVED_VIDEOS, MOCK_USER_VISIBILITY, search);
    }
    return [];
  }, [nav, search]);

  // Navigation handlers
  const handleSectionPress = useCallback((section: BizLibrarySection) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNav({ level: 'folders', sectionId: section.id, sectionName: section.name });
    setSearch('');
  }, []);

  const handleFolderPress = useCallback((folder: BizLibraryFolder) => {
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

  const handleVideoLongPress = useCallback((video: BizLibraryVideo) => {
    if (!IS_FOUNDER) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSheetItem(video);
    setSheetVisible(true);
  }, []);

  const handleAction = useCallback(() => {
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

  // Back title
  const backTitle = useMemo(() => {
    if (nav.level === 'folders') return nav.sectionName;
    if (nav.level === 'videos') return nav.folderName;
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
              placeholder="Search title / deal / year / domain / speaker"
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

        <FounderQuickActionsSheet
          visible={sheetVisible}
          item={sheetItem}
          colors={colors}
          onClose={() => setSheetVisible(false)}
          onAction={handleAction}
          onShare={handleShareAction}
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

        <FounderQuickActionsSheet
          visible={sheetVisible}
          item={sheetItem}
          colors={colors}
          onClose={() => setSheetVisible(false)}
          onAction={handleAction}
          onShare={handleShareAction}
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
            placeholder="Search title / deal / speaker / playlist"
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

      <FounderQuickActionsSheet
        visible={sheetVisible}
        item={sheetItem}
        colors={colors}
        onClose={() => setSheetVisible(false)}
        onAction={handleAction}
        onShare={handleShareAction}
      />
    </View>
  );
}

// =============================================================================
// FOUNDER QUICK ACTIONS SHEET
// =============================================================================

function FounderQuickActionsSheet({
  visible,
  item,
  colors,
  onClose,
  onAction,
  onShare,
}: {
  visible: boolean;
  item: BizLibraryVideo | null;
  colors: typeof Colors.light;
  onClose: () => void;
  onAction: () => void;
  onShare: () => void;
}) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={item?.title ?? 'Actions'}
      useModal
    >
      <View style={styles.sheetActions}>
        <ThemedText style={[styles.sheetNote, { color: colors.textTertiary }]}>
          All actions: Propose → Validate → Confirm → Commit
        </ThemedText>

        <Pressable style={styles.sheetAction} onPress={onAction}>
          <IconSymbol name="text.badge.plus" size={20} color={colors.text} />
          <ThemedText style={[styles.sheetActionText, { color: colors.text }]}>Add to Playlist</ThemedText>
        </Pressable>

        <Pressable style={styles.sheetAction} onPress={onAction}>
          <IconSymbol name="pin" size={20} color={colors.text} />
          <ThemedText style={[styles.sheetActionText, { color: colors.text }]}>Pin within Folder</ThemedText>
        </Pressable>

        <Pressable style={styles.sheetAction} onPress={onAction}>
          <IconSymbol name="link" size={20} color={colors.text} />
          <ThemedText style={[styles.sheetActionText, { color: colors.text }]}>Link to Deal</ThemedText>
        </Pressable>

        <Pressable style={styles.sheetAction} onPress={onAction}>
          <IconSymbol name="lock.shield" size={20} color={colors.text} />
          <ThemedText style={[styles.sheetActionText, { color: colors.text }]}>Link to Vault</ThemedText>
        </Pressable>

        <Pressable style={styles.sheetAction} onPress={onShare}>
          <IconSymbol name="paperplane" size={20} color={colors.text} />
          <ThemedText style={[styles.sheetActionText, { color: colors.text }]}>Share</ThemedText>
        </Pressable>

        <Pressable style={styles.sheetAction} onPress={onAction}>
          <IconSymbol name="archivebox" size={20} color="#B85C5C" />
          <ThemedText style={[styles.sheetActionText, { color: '#B85C5C' }]}>Archive</ThemedText>
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
  sheetNote: {
    fontSize: 11,
    marginBottom: 8,
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
