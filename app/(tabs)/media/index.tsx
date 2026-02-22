/**
 * Media Screen — Universal across all modes (v1 LOCKED)
 * 4 swipeable top tabs: Feed | Explore | Rooms | Library
 * Labels are canonical and never change by mode. Content inside each
 * tab (especially Rooms) varies by mode internally.
 * Same PagerView pattern as Home hub tabs.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
} from 'react-native';
import { PagedTabBar } from '@/components/ui/paged-tab-bar';
import { EdgeHoldAdvance } from '@/components/ui/edge-hold-advance';
import PagerView from 'react-native-pager-view';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme'
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMode } from '@/context/app-context';
import {
  STORY_CIRCLES,
  VIDEO_FEED_POSTS,
  STORY_CIRCLES_BY_MODE,
  FEED_POSTS_BY_MODE,
} from '@/data/mock-video-feed';
import type { StoryCircle, VideoFeedPost } from '@/data/mock-video-feed';
import type { Mode } from '@/types';
import { SportsExplorePageV2 } from '@/components/sports-explore/sports-explore-page-v2';
import { SportsFilmRoomV2 } from '@/components/film-room/sports-film-room-v2';
import { ModeExplorePageV2 } from '@/components/explore/mode-explore-page-v2';
import { ModeFilmRoomV2 } from '@/components/film-room/mode-film-room-v2';
import { LibraryHub } from '@/components/library/library-hub';

const ACCENT_GOLD = '#FFFFFF';

// =============================================================================
// MEDIA TOP TABS (v1 LOCKED — canonical labels, never change by mode)
// 4 swipeable pages — Feed | Explore | Rooms | Library
// =============================================================================

const MEDIA_TABS = [
  { id: 'feed', label: 'Feed' },
  { id: 'explore', label: 'Explore' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'library', label: 'Library' },
];

// =============================================================================
// MODE-SPECIFIC VIDEO DATA
// =============================================================================

const MODE_STORIES: Record<Mode, StoryCircle[]> = STORY_CIRCLES_BY_MODE;
const MODE_POSTS: Record<Mode, VideoFeedPost[]> = FEED_POSTS_BY_MODE;

// =============================================================================
// FORMAT HELPERS
// =============================================================================

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay === 1) return '1d';
  return `${diffDay}d`;
}

function formatViews(views: number): string {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

// =============================================================================
// STORY CIRCLES (Premium gradient rings)
// =============================================================================

const GRADIENT_COLORS: [string, string, string] = ['#FFFFFF', '#1D9BF0', '#1D9BF0'];

function StoryAvatar({ story, colors }: { story: StoryCircle; colors: typeof Colors.light }) {
  const ringColors: [string, string, ...string[]] = story.hasNew
    ? (story.ringColor ? [story.ringColor, story.ringColor] : GRADIENT_COLORS)
    : [colors.border, colors.border];

  return (
    <Pressable
      style={styles.storyItem}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <LinearGradient
        colors={ringColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.storyRing}
      >
        <View style={[styles.storyAvatar, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.storyInitials}>{story.initials}</ThemedText>
        </View>
      </LinearGradient>
      {story.isYou && (
        <View style={[styles.addBadge, { backgroundColor: ACCENT_GOLD }]}>
          <IconSymbol name="plus" size={10} color="#fff" />
        </View>
      )}
      <ThemedText style={[styles.storyName, { color: colors.textTertiary }]} numberOfLines={1}>
        {story.isYou ? 'Your Story' : story.name.split(' ').pop()}
      </ThemedText>
    </Pressable>
  );
}

function StoriesRow({ colors, stories }: { colors: typeof Colors.light; stories: StoryCircle[] }) {
  return (
    <View style={[styles.storiesContainer, { borderBottomColor: colors.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesScroll}
      >
        {stories.map((story) => (
          <StoryAvatar key={story.id} story={story} colors={colors} />
        ))}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// FEED POST (Premium media cards)
// =============================================================================

function FeedPost({ post, colors }: { post: VideoFeedPost; colors: typeof Colors.light }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked(!liked);
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSaved(!saved);
  };

  const timeAgo = formatTimeAgo(post.timestamp);
  const isSystem = post.authorRole === 'System';

  return (
    <View style={[styles.postContainer, { borderBottomColor: colors.border }]}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={[
          styles.postAvatar,
          { backgroundColor: isSystem ? ACCENT_GOLD + '20' : colors.backgroundTertiary },
        ]}>
          <ThemedText style={[
            styles.postAvatarText,
            { color: isSystem ? ACCENT_GOLD : colors.text },
          ]}>{post.authorInitials}</ThemedText>
        </View>
        <View style={styles.postAuthorInfo}>
          <View style={styles.postNameRow}>
            <ThemedText style={[styles.postAuthorName, { color: colors.text }]}>
              {post.authorName}
            </ThemedText>
            {isSystem && (
              <View style={[styles.verifiedBadge, { backgroundColor: ACCENT_GOLD }]}>
                <IconSymbol name="checkmark" size={8} color="#000" />
              </View>
            )}
            <ThemedText style={[styles.postTimestamp, { color: colors.textTertiary }]}>
              · {timeAgo}
            </ThemedText>
          </View>
          <ThemedText style={[styles.postAuthorRole, { color: colors.textTertiary }]}>
            {post.authorRole}
          </ThemedText>
        </View>
        <Pressable style={styles.postMoreBtn} hitSlop={8}>
          <IconSymbol name="ellipsis" size={16} color={colors.textTertiary} />
        </Pressable>
      </View>

      {/* Media Card (Thumbnail + overlay) */}
      {post.media && (
        <Pressable
          style={[
            styles.mediaCard,
            { backgroundColor: post.media.thumbnailColor || colors.card },
          ]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.mediaGradient}
          />
          <View style={styles.mediaPlayBtn}>
            <IconSymbol name="play.fill" size={24} color="#fff" />
          </View>
          <View style={[styles.mediaTypeBadge, {
            backgroundColor: post.media.type === 'reel' ? '#1D9BF0' : 'rgba(0,0,0,0.6)',
          }]}>
            <ThemedText style={styles.mediaTypeText}>
              {post.media.type.toUpperCase()}
            </ThemedText>
          </View>
          {post.media.duration && (
            <View style={styles.durationBadge}>
              <ThemedText style={styles.durationText}>{post.media.duration}</ThemedText>
            </View>
          )}
          <View style={styles.mediaBottom}>
            <ThemedText style={styles.mediaTitle} numberOfLines={1}>{post.media.title}</ThemedText>
            {post.media.views != null && (
              <View style={styles.viewsRow}>
                <IconSymbol name="eye.fill" size={11} color="rgba(255,255,255,0.7)" />
                <ThemedText style={styles.viewsText}>{formatViews(post.media.views)}</ThemedText>
              </View>
            )}
          </View>
        </Pressable>
      )}

      {/* Caption */}
      <View style={styles.captionArea}>
        <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
          <ThemedText style={[styles.captionAuthor, { color: colors.text }]}>
            {post.authorName}
          </ThemedText>
          {'  '}{post.caption}
        </ThemedText>
      </View>

      {/* Action Row */}
      <View style={styles.actionRow}>
        <View style={styles.actionLeft}>
          <Pressable onPress={handleLike} style={styles.actionBtn} hitSlop={6}>
            <IconSymbol
              name={liked ? 'heart.fill' : 'heart'}
              size={20}
              color={liked ? '#EF4444' : colors.textSecondary}
            />
            <ThemedText style={[styles.actionCount, { color: colors.textTertiary }]}>
              {liked ? post.likes + 1 : post.likes}
            </ThemedText>
          </Pressable>
          <Pressable style={styles.actionBtn} hitSlop={6}>
            <IconSymbol name="bubble.right" size={20} color={colors.textSecondary} />
            {post.comments > 0 && (
              <ThemedText style={[styles.actionCount, { color: colors.textTertiary }]}>
                {post.comments}
              </ThemedText>
            )}
          </Pressable>
          <Pressable style={styles.actionBtn} hitSlop={6}>
            <IconSymbol name="paperplane" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
        <Pressable onPress={handleSave} hitSlop={6}>
          <IconSymbol
            name={saved ? 'bookmark.fill' : 'bookmark'}
            size={20}
            color={saved ? ACCENT_GOLD : colors.textSecondary}
          />
        </Pressable>
      </View>
    </View>
  );
}

// =============================================================================
// TAB CONTENT PAGES
// =============================================================================

function FeedPage({ colors, mode }: { colors: typeof Colors.light; mode: Mode }) {
  const stories = MODE_STORIES[mode] ?? STORY_CIRCLES;
  const posts = MODE_POSTS[mode] ?? VIDEO_FEED_POSTS;

  const renderPost = useCallback(
    ({ item }: { item: VideoFeedPost }) => <FeedPost post={item} colors={colors} />,
    [colors],
  );

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={renderPost}
      ListHeaderComponent={<StoriesRow colors={colors} stories={stories} />}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

function ExplorePage({ colors, mode }: { colors: typeof Colors.light; mode: Mode }) {
  if (mode === 'sports') return <SportsExplorePageV2 />;
  return <ModeExplorePageV2 mode={mode} />;
}

function RoomPage({ colors, mode }: { colors: typeof Colors.light; mode: Mode }) {
  if (mode === 'sports') return <SportsFilmRoomV2 />;
  return <ModeFilmRoomV2 mode={mode} />;
}

function LibraryPage() {
  return <LibraryHub />;
}

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function VideoHomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const mode = useMode();
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const tabs = MEDIA_TABS;

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  return (
    <ThemedView style={styles.container}>
      {/* ===== MEDIA HUB TAB BAR ===== */}
      <PagedTabBar tabs={tabs} activeIndex={activeIndex} onTabPress={handleTabPress} accentColor={MODE_ACCENT[mode]} />

      {/* ===== SWIPEABLE CONTENT ===== */}
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={tabs.length} onAdvance={handleTabPress} wrap>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          <View key="feed" style={{ flex: 1 }}>
            <FeedPage colors={colors} mode={mode} />
          </View>
          <View key="explore" style={{ flex: 1 }}>
            <ExplorePage colors={colors} mode={mode} />
          </View>
          <View key="room" style={{ flex: 1 }}>
            <RoomPage colors={colors} mode={mode} />
          </View>
          <View key="library" style={{ flex: 1 }}>
            <LibraryPage />
          </View>
        </PagerView>
      </EdgeHoldAdvance>
    </ThemedView>
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
    paddingBottom: 100,
  },

  // Placeholder pages
  placeholderContent: {
    flex: 1,
    padding: Spacing.md,
    paddingTop: Spacing.xl,
  },
  placeholderCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: 12,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  placeholderText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },

  // Stories
  storiesContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 8,
  },
  storiesScroll: {
    paddingHorizontal: Spacing.md,
    gap: 14,
    paddingTop: 4,
  },
  storyItem: {
    alignItems: 'center',
    width: 68,
  },
  storyRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2.5,
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addBadge: {
    position: 'absolute',
    bottom: 18,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  storyName: {
    fontSize: 11,
    marginTop: 5,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Post
  postContainer: {
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  postAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  postAvatarText: {
    fontSize: 13,
    fontWeight: '700',
  },
  postAuthorInfo: {
    flex: 1,
  },
  postNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postAuthorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  verifiedBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postTimestamp: {
    fontSize: 12,
    fontWeight: '400',
  },
  postAuthorRole: {
    fontSize: 12,
    marginTop: 1,
  },
  postMoreBtn: {
    padding: 4,
  },

  // Media Card
  mediaCard: {
    width: '100%',
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 0,
  },
  mediaGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  mediaPlayBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  mediaTypeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  mediaTypeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.6,
  },
  durationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  mediaBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  mediaTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  viewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewsText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },

  // Caption
  captionArea: {
    paddingHorizontal: Spacing.md,
    paddingTop: 10,
    paddingBottom: 4,
  },
  captionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  captionAuthor: {
    fontWeight: '700',
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: 8,
    paddingBottom: 4,
  },
  actionLeft: {
    flexDirection: 'row',
    gap: 18,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: '600',
  },
});
