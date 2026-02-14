/**
 * Video Home — Instagram-style feed with story circles at top and posts below.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';
import {
  STORY_CIRCLES,
  VIDEO_FEED_POSTS,
} from '@/data/mock-video-feed';
import type { StoryCircle, VideoFeedPost } from '@/data/mock-video-feed';

// =============================================================================
// STORY CIRCLES
// =============================================================================

function StoryAvatar({ story }: { story: StoryCircle }) {
  return (
    <Pressable
      style={styles.storyItem}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[styles.storyRing, story.hasNew && styles.storyRingActive]}>
        <View style={styles.storyAvatar}>
          <ThemedText style={styles.storyInitials}>{story.initials}</ThemedText>
        </View>
      </View>
      {story.isYou && (
        <View style={styles.addBadge}>
          <IconSymbol name="plus" size={10} color="#fff" />
        </View>
      )}
      <ThemedText style={styles.storyName} numberOfLines={1}>
        {story.isYou ? 'Your Story' : story.name.split(' ').pop()}
      </ThemedText>
    </Pressable>
  );
}

function StoriesRow() {
  return (
    <View style={styles.storiesContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesScroll}
      >
        {STORY_CIRCLES.map((story) => (
          <StoryAvatar key={story.id} story={story} />
        ))}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// FEED POST
// =============================================================================

function FeedPost({ post }: { post: VideoFeedPost }) {
  const [liked, setLiked] = useState(post.liked ?? false);
  const [saved, setSaved] = useState(post.saved ?? false);

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked(!liked);
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSaved(!saved);
  };

  const timeAgo = formatTimeAgo(post.timestamp);

  return (
    <View style={styles.postContainer}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.postAvatar}>
          <ThemedText style={styles.postAvatarText}>{post.authorInitials}</ThemedText>
        </View>
        <View style={styles.postAuthorInfo}>
          <ThemedText style={styles.postAuthorName}>{post.authorName}</ThemedText>
          <ThemedText style={styles.postAuthorRole}>{post.authorRole}</ThemedText>
        </View>
        <Pressable style={styles.postMoreBtn} hitSlop={8}>
          <IconSymbol name="ellipsis" size={16} color="#6e6e6e" />
        </Pressable>
      </View>

      {/* Media Placeholder */}
      {post.media && (
        <Pressable
          style={styles.mediaPlaceholder}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={styles.mediaPlayBtn}>
            <IconSymbol name="play.fill" size={28} color="#fff" />
          </View>
          <ThemedText style={styles.mediaTitle}>{post.media.title}</ThemedText>
          <View style={styles.mediaTypeBadge}>
            <ThemedText style={styles.mediaTypeText}>
              {post.media.type === 'clip' ? 'CLIP' : post.media.type === 'reel' ? 'REEL' : 'PHOTO'}
            </ThemedText>
          </View>
        </Pressable>
      )}

      {/* Action Row */}
      <View style={styles.actionRow}>
        <View style={styles.actionLeft}>
          <Pressable onPress={handleLike} style={styles.actionBtn} hitSlop={6}>
            <IconSymbol
              name={liked ? 'heart.fill' : 'heart'}
              size={22}
              color={liked ? '#EF4444' : '#f5f5f5'}
            />
          </Pressable>
          <Pressable style={styles.actionBtn} hitSlop={6}>
            <IconSymbol name="bubble.right" size={22} color="#f5f5f5" />
          </Pressable>
          <Pressable style={styles.actionBtn} hitSlop={6}>
            <IconSymbol name="paperplane" size={22} color="#f5f5f5" />
          </Pressable>
        </View>
        <Pressable onPress={handleSave} hitSlop={6}>
          <IconSymbol
            name={saved ? 'bookmark.fill' : 'bookmark'}
            size={22}
            color="#f5f5f5"
          />
        </Pressable>
      </View>

      {/* Likes */}
      <ThemedText style={styles.likesText}>
        {liked ? post.likes + 1 : post.likes} likes
      </ThemedText>

      {/* Caption */}
      <View style={styles.captionRow}>
        <ThemedText style={styles.captionText}>
          <ThemedText style={styles.captionAuthor}>{post.authorName}</ThemedText>
          {'  '}{post.caption}
        </ThemedText>
      </View>

      {/* Comments link */}
      {post.comments > 0 && (
        <Pressable>
          <ThemedText style={styles.commentsLink}>
            View all {post.comments} comments
          </ThemedText>
        </Pressable>
      )}

      {/* Timestamp */}
      <ThemedText style={styles.timestampText}>{timeAgo}</ThemedText>
    </View>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  if (diffDay === 1) return '1 day ago';
  return `${diffDay} days ago`;
}

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function VideoHomeScreen() {
  const insets = useSafeAreaInsets();

  const renderPost = useCallback(
    ({ item }: { item: VideoFeedPost }) => <FeedPost post={item} />,
    [],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={VIDEO_FEED_POSTS}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        ListHeaderComponent={<StoriesRow />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  listContent: {
    paddingBottom: 100,
  },

  // Stories
  storiesContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 10,
  },
  storiesScroll: {
    paddingHorizontal: Spacing.md,
    gap: 14,
    paddingTop: 8,
  },
  storyItem: {
    alignItems: 'center',
    width: 64,
  },
  storyRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyRingActive: {
    borderColor: '#E1306C',
  },
  storyAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f5f5f5',
  },
  addBadge: {
    position: 'absolute',
    bottom: 18,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  storyName: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },

  // Post
  postContainer: {
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    marginBottom: 4,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  postAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  postAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f5f5f5',
  },
  postAuthorInfo: {
    flex: 1,
  },
  postAuthorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f5f5f5',
  },
  postAuthorRole: {
    fontSize: 11,
    color: '#6e6e6e',
  },
  postMoreBtn: {
    padding: 4,
  },

  // Media
  mediaPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPlayBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mediaTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ccc',
  },
  mediaTypeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mediaTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#f5f5f5',
    letterSpacing: 0.5,
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: 10,
    paddingBottom: 6,
  },
  actionLeft: {
    flexDirection: 'row',
    gap: 14,
  },
  actionBtn: {
    padding: 2,
  },
  likesText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f5f5f5',
    paddingHorizontal: Spacing.md,
    marginBottom: 4,
  },
  captionRow: {
    paddingHorizontal: Spacing.md,
    marginBottom: 4,
  },
  captionText: {
    fontSize: 13,
    color: '#ccc',
    lineHeight: 18,
  },
  captionAuthor: {
    fontWeight: '700',
    color: '#f5f5f5',
  },
  commentsLink: {
    fontSize: 13,
    color: '#6e6e6e',
    paddingHorizontal: Spacing.md,
    marginBottom: 2,
  },
  timestampText: {
    fontSize: 11,
    color: '#555',
    paddingHorizontal: Spacing.md,
    marginTop: 2,
  },
});
