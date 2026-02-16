/**
 * Media Screen — Universal across all modes (v1 LOCKED)
 * 4 swipeable top tabs: Feed | Explore | Room (mode-specific) | Library
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
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMode } from '@/context/app-context';
import {
  STORY_CIRCLES,
  VIDEO_FEED_POSTS,
} from '@/data/mock-video-feed';
import type { StoryCircle, VideoFeedPost } from '@/data/mock-video-feed';
import type { Mode } from '@/types';

const ACCENT_GOLD = '#FFFFFF';

// =============================================================================
// MEDIA TOP TABS (v1 LOCKED)
// 4 swipeable pages — Feed | Explore | Room (mode-specific) | Library
// =============================================================================

const ROOM_LABEL: Record<Mode, string> = {
  sports: 'Film Room',
  church: 'Ministry Rooms',
  education: 'Classrooms',
  enterprise: 'Workspaces',
  community: 'Paddock',
};

function getMediaTabs(mode: Mode) {
  return [
    { id: 'feed', label: 'Feed' },
    { id: 'explore', label: 'Explore' },
    { id: 'room', label: ROOM_LABEL[mode] ?? 'Room' },
    { id: 'library', label: 'Library' },
  ];
}

// =============================================================================
// MODE-SPECIFIC VIDEO DATA
// =============================================================================

const MODE_STORIES: Record<Mode, StoryCircle[]> = {
  sports: STORY_CIRCLES,
  enterprise: [
    { id: 'bs-1', name: 'KaNeXT', initials: 'KX', hasNew: true, isYou: true },
    { id: 'bs-2', name: 'Demo Day', initials: 'DD', hasNew: true },
    { id: 'bs-3', name: 'Product', initials: 'PR', hasNew: true },
    { id: 'bs-4', name: 'Investors', initials: 'IV', hasNew: false },
    { id: 'bs-5', name: 'Press', initials: 'PS', hasNew: false },
  ],
  church: [
    { id: 'cs-1', name: 'ICCLA', initials: 'IC', hasNew: true, isYou: true },
    { id: 'cs-2', name: 'Worship', initials: 'WO', hasNew: true },
    { id: 'cs-3', name: 'Sermons', initials: 'SR', hasNew: true },
    { id: 'cs-4', name: 'Youth', initials: 'YT', hasNew: false },
    { id: 'cs-5', name: 'Outreach', initials: 'OR', hasNew: false },
  ],
  education: [
    { id: 'es-1', name: 'FMU', initials: 'FM', hasNew: true, isYou: true },
    { id: 'es-2', name: 'Campus', initials: 'CM', hasNew: true },
    { id: 'es-3', name: 'Lectures', initials: 'LC', hasNew: true },
    { id: 'es-4', name: 'Athletics', initials: 'AT', hasNew: false },
    { id: 'es-5', name: 'Alumni', initials: 'AL', hasNew: false },
  ],
  community: [
    { id: 'ks-1', name: 'K-1', initials: 'K1', hasNew: true, isYou: true },
    { id: 'ks-2', name: 'Race Day', initials: 'RD', hasNew: true },
    { id: 'ks-3', name: 'Onboards', initials: 'OB', hasNew: true },
    { id: 'ks-4', name: 'Highlights', initials: 'HL', hasNew: false },
    { id: 'ks-5', name: 'Teams', initials: 'TM', hasNew: false },
  ],
};

const MODE_POSTS: Record<Mode, VideoFeedPost[]> = {
  sports: VIDEO_FEED_POSTS,
  enterprise: [
    { id: 'bv-1', authorName: 'KaNeXT Team', authorInitials: 'KX', authorRole: 'Company', timestamp: new Date('2026-02-14'), caption: 'Product demo walkthrough — V2 feature preview for investor partners.', media: { type: 'clip', title: 'KaNeXT V2 Demo', duration: '4:32', thumbnailColor: '#FFFFFF' }, likes: 24, comments: 5 },
    { id: 'bv-2', authorName: 'Sammy Kalejaiye', authorInitials: 'SK', authorRole: 'Founder', timestamp: new Date('2026-02-10'), caption: 'Behind the scenes: building the sports OS that runs itself.', media: { type: 'reel', title: 'Founder Diary #12', duration: '1:45', thumbnailColor: '#6AA9FF' }, likes: 67, comments: 12 },
    { id: 'bv-3', authorName: 'KaNeXT Press', authorInitials: 'KP', authorRole: 'Media', timestamp: new Date('2026-02-06'), caption: 'MLK Truth Classic announcement — 16-team tournament, $3M+ Year 1.', media: { type: 'clip', title: 'MLK Classic Reveal', duration: '2:18', thumbnailColor: '#22C55E' }, likes: 103, comments: 28 },
  ],
  church: [
    { id: 'cv-1', authorName: 'Pastor Dipo Kalejaiye', authorInitials: 'DK', authorRole: 'Senior Pastor', timestamp: new Date('2026-02-12'), caption: '"Walking in Faith" — this week\'s message from the Faith Forward series.', media: { type: 'clip', title: 'Walking in Faith', duration: '45:32', thumbnailColor: '#1B4F8A' }, likes: 89, comments: 14 },
    { id: 'cv-2', authorName: 'Worship Team', authorInitials: 'WT', authorRole: 'Ministry', timestamp: new Date('2026-02-09'), caption: 'Sunday worship highlights — "Great Is Thy Faithfulness"', media: { type: 'reel', title: 'Worship Highlights', duration: '3:12', thumbnailColor: '#7C3AED' }, likes: 156, comments: 23 },
    { id: 'cv-3', authorName: 'ICCLA Youth', authorInitials: 'YT', authorRole: 'Youth Ministry', timestamp: new Date('2026-02-05'), caption: 'Youth retreat recap — 3 days of fellowship and growth.', media: { type: 'clip', title: 'Youth Retreat 2026', duration: '5:44', thumbnailColor: '#22C55E' }, likes: 201, comments: 45 },
  ],
  education: [
    { id: 'ev-1', authorName: 'FMU Athletics', authorInitials: 'FA', authorRole: 'Athletics', timestamp: new Date('2026-02-13'), caption: 'Lions basketball season highlights — 16-8, Sun Conference contenders.', media: { type: 'clip', title: 'Lions 2025-26 Season', duration: '6:15', thumbnailColor: '#FFFFFF' }, likes: 312, comments: 47 },
    { id: 'ev-2', authorName: 'FMU Campus', authorInitials: 'FC', authorRole: 'University', timestamp: new Date('2026-02-08'), caption: 'Spring 2026 campus tour — explore our Miami Gardens campus.', media: { type: 'clip', title: 'Campus Tour', duration: '3:48', thumbnailColor: '#3B82F6' }, likes: 145, comments: 18 },
    { id: 'ev-3', authorName: 'Aviation Program', authorInitials: 'AP', authorRole: 'Academics', timestamp: new Date('2026-02-03'), caption: 'HBCU aviation excellence — first solo flights of the semester.', media: { type: 'reel', title: 'Solo Flight Day', duration: '2:22', thumbnailColor: '#06B6D4' }, likes: 487, comments: 62 },
  ],
  community: [
    { id: 'kv-1', authorName: 'K-1 Official', authorInitials: 'K1', authorRole: 'League', timestamp: new Date('2026-02-14'), caption: 'Race 6 recap — Apex Racing dominates at Laguna Seca.', media: { type: 'clip', title: 'Laguna Seca Highlights', duration: '8:12', thumbnailColor: '#EF4444' }, likes: 543, comments: 89 },
    { id: 'kv-2', authorName: 'Apex Racing', authorInitials: 'AR', authorRole: 'Team', timestamp: new Date('2026-02-11'), caption: 'Car setup deep-dive — how we tuned for Laguna\'s corkscrew.', media: { type: 'clip', title: 'Setup Breakdown', duration: '4:56', thumbnailColor: '#EF4444' }, likes: 234, comments: 41 },
    { id: 'kv-3', authorName: 'K-1 Grid', authorInitials: 'KG', authorRole: 'League', timestamp: new Date('2026-02-07'), caption: 'Driver spotlight: Marcus Kane leads championship after 5 rounds.', media: { type: 'reel', title: 'Kane Spotlight', duration: '1:38', thumbnailColor: '#FFFFFF' }, likes: 378, comments: 56 },
  ],
};

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

const GRADIENT_COLORS: [string, string, string] = ['#FFFFFF', '#E1306C', '#7A5CFF'];

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
            backgroundColor: post.media.type === 'reel' ? '#7A5CFF' : 'rgba(0,0,0,0.6)',
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

function ExplorePage({ colors }: { colors: typeof Colors.light }) {
  return (
    <ScrollView contentContainerStyle={styles.placeholderContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.placeholderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={32} color={colors.textTertiary} />
        <ThemedText style={[styles.placeholderTitle, { color: colors.text }]}>Explore</ThemedText>
        <ThemedText style={[styles.placeholderText, { color: colors.textTertiary }]}>
          Discover trending content, creators, and topics across your organization.
        </ThemedText>
      </View>
    </ScrollView>
  );
}

function RoomPage({ colors, label }: { colors: typeof Colors.light; label: string }) {
  return (
    <ScrollView contentContainerStyle={styles.placeholderContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.placeholderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name="play.rectangle.fill" size={32} color={colors.textTertiary} />
        <ThemedText style={[styles.placeholderTitle, { color: colors.text }]}>{label}</ThemedText>
        <ThemedText style={[styles.placeholderText, { color: colors.textTertiary }]}>
          Curated content rooms for focused viewing and collaboration.
        </ThemedText>
      </View>
    </ScrollView>
  );
}

function LibraryPage({ colors }: { colors: typeof Colors.light }) {
  return (
    <ScrollView contentContainerStyle={styles.placeholderContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.placeholderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name="square.stack.fill" size={32} color={colors.textTertiary} />
        <ThemedText style={[styles.placeholderTitle, { color: colors.text }]}>Library</ThemedText>
        <ThemedText style={[styles.placeholderText, { color: colors.textTertiary }]}>
          Your saved videos, watch history, and playlists — all in one place.
        </ThemedText>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function VideoHomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const mode = useMode();
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const tabs = getMediaTabs(mode);
  const roomLabel = ROOM_LABEL[mode] ?? 'Room';

  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  return (
    <ThemedView style={styles.container}>
      {/* ===== MEDIA HUB TAB BAR ===== */}
      <PagedTabBar tabs={tabs} activeIndex={activeIndex} onTabPress={handleTabPress} />

      {/* ===== SWIPEABLE CONTENT ===== */}
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={tabs.length} onAdvance={handleTabPress}>
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
            <ExplorePage colors={colors} />
          </View>
          <View key="room" style={{ flex: 1 }}>
            <RoomPage colors={colors} label={roomLabel} />
          </View>
          <View key="library" style={{ flex: 1 }}>
            <LibraryPage colors={colors} />
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
    color: '#F2F4F8',
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
