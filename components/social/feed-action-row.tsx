/**
 * FeedActionRow — heart, comment, share | bookmark action buttons.
 * Heart: filled red when liked, white outline when not.
 * Bookmark: filled white when saved, outline when not.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface FeedActionRowProps {
  isLiked: boolean;
  isBookmarked: boolean;
  onLikeToggle: () => void;
  onCommentPress: () => void;
  onSharePress: () => void;
  onBookmarkToggle: () => void;
}

export function FeedActionRow({
  isLiked,
  isBookmarked,
  onLikeToggle,
  onCommentPress,
  onSharePress,
  onBookmarkToggle,
}: FeedActionRowProps) {
  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLikeToggle();
  };

  const handleBookmark = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBookmarkToggle();
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftActions}>
        <Pressable onPress={handleLike} hitSlop={8}>
          <IconSymbol
            name={isLiked ? 'heart.fill' : 'heart'}
            size={24}
            color={isLiked ? '#FF3B30' : '#FFFFFF'}
          />
        </Pressable>
        <Pressable onPress={onCommentPress} hitSlop={8}>
          <IconSymbol name="bubble.right" size={24} color="#FFFFFF" />
        </Pressable>
        <Pressable onPress={onSharePress} hitSlop={8}>
          <IconSymbol name="paperplane" size={22} color="#FFFFFF" />
        </Pressable>
      </View>
      <Pressable onPress={handleBookmark} hitSlop={8}>
        <IconSymbol
          name={isBookmarked ? 'bookmark.fill' : 'bookmark'}
          size={24}
          color="#FFFFFF"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
});
