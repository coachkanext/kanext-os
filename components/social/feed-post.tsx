/**
 * FeedPost — single post card with header, media, actions, caption.
 * Double-tap detection for like animation. Long press for context menu.
 */

import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { FeedActionRow } from './feed-action-row';
import { LikeAnimation } from './like-animation';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { formatPostTime } from '@/data/mock-social';
import type { FeedPost as FeedPostType } from '@/data/mock-social';

interface FeedPostProps {
  post: FeedPostType;
  isLiked: boolean;
  isBookmarked: boolean;
  onLikeToggle: () => void;
  onBookmarkToggle: () => void;
  onLongPress: (pageY: number) => void;
}

export function FeedPost({
  post,
  isLiked,
  isBookmarked,
  onLikeToggle,
  onBookmarkToggle,
  onLongPress,
}: FeedPostProps) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { width: screenWidth } = useWindowDimensions();
  const lastTapRef = useRef(0);
  const [showLikeAnim, setShowLikeAnim] = useState(false);
  const rowRef = useRef<View>(null);

  const handleMediaTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap
      if (!isLiked) onLikeToggle();
      setShowLikeAnim(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    lastTapRef.current = now;
  }, [isLiked, onLikeToggle]);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    rowRef.current?.measureInWindow((_x, y) => {
      onLongPress(y);
    });
  }, [onLongPress]);

  const media = post.media[0];
  const mediaHeight = media ? screenWidth * media.aspectRatio : screenWidth;
  const likeCount = isLiked && !post.isLiked
    ? post.likeCount + 1
    : !isLiked && post.isLiked
      ? post.likeCount - 1
      : post.likeCount;

  return (
    <View ref={rowRef} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{post.author.initials}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.authorName}>{post.author.name}</Text>
          <Text style={styles.authorMeta}>
            {post.author.username} · {formatPostTime(post.timestamp)}
          </Text>
        </View>
      </View>

      {/* Media */}
      {media && (
        <Pressable
          onPress={handleMediaTap}
          onLongPress={handleLongPress}
          delayLongPress={400}
        >
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: media.uri }}
              style={{ width: screenWidth, height: mediaHeight }}
              resizeMode="cover"
            />
            <LikeAnimation
              visible={showLikeAnim}
              onComplete={() => setShowLikeAnim(false)}
            />
          </View>
        </Pressable>
      )}

      {/* Actions */}
      <FeedActionRow
        isLiked={isLiked}
        isBookmarked={isBookmarked}
        onLikeToggle={onLikeToggle}
        onCommentPress={() => {}}
        onSharePress={() => {}}
        onBookmarkToggle={onBookmarkToggle}
      />

      {/* Like count + Caption */}
      <View style={styles.captionArea}>
        <Text style={styles.likeCount}>
          {likeCount.toLocaleString()} likes
        </Text>
        <Text style={styles.caption} numberOfLines={3}>
          <Text style={styles.captionAuthor}>{post.author.username} </Text>
          {post.caption}
        </Text>
        {post.commentCount > 0 && (
          <Text style={styles.viewComments}>
            View all {post.commentCount} comments
          </Text>
        )}
      </View>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: {
    backgroundColor: C.bg,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.label,
  },
  headerText: {
    marginLeft: 10,
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: C.label,
  },
  authorMeta: {
    fontSize: 12,
    color: C.secondary,
    marginTop: 1,
  },
  captionArea: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  likeCount: {
    fontSize: 14,
    fontWeight: '600',
    color: C.label,
    marginBottom: 4,
  },
  caption: {
    fontSize: 14,
    color: C.label,
    lineHeight: 20,
  },
  captionAuthor: {
    fontWeight: '600',
  },
  viewComments: {
    fontSize: 14,
    color: C.secondary,
    marginTop: 4,
  },
});
