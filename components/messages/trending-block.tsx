/**
 * TrendingBlock — Section block with icon + title header and up to 3 FeedCards.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { IconSymbolName } from '@/components/ui/icon-symbol';
import { FeedCard } from '@/components/messages/feed-card';
import { Spacing } from '@/constants/theme';
import type { FeedPost } from '@/data/mock-messages';

interface TrendingBlockProps {
  icon: IconSymbolName;
  title: string;
  posts: FeedPost[];
}

export function TrendingBlock({ icon, title, posts }: TrendingBlockProps) {
  if (posts.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconSymbol name={icon} size={16} color="#9C9790" />
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>
      {posts.slice(0, 3).map((post) => (
        <FeedCard key={post.id} post={post} />
      ))}
      {posts.length > 3 && (
        <Pressable style={styles.seeAll}>
          <ThemedText style={styles.seeAllText}>See All</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  seeAll: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9C9790',
  },
});
