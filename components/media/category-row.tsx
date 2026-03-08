/**
 * CategoryRow — horizontal scrollable row of BrowseVideoCards with category label.
 * Header: category label left, "See All" right.
 */

import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { BrowseVideoCard } from '@/components/media/browse-video-card';
import type { BrowseCategory } from '@/data/mock-media';

interface CategoryRowProps {
  category: BrowseCategory;
  onVideoLongPress?: (videoId: string, videoTitle: string, creatorInitials: string, pageY: number) => void;
}

export function CategoryRow({ category, onVideoLongPress }: CategoryRowProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.label}>{category.label}</Text>
        <Pressable hitSlop={8}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      </View>

      {/* Horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {category.videos.map((video) => (
          <BrowseVideoCard
            key={video.id}
            video={video}
            onLongPress={
              onVideoLongPress
                ? (pageY) => onVideoLongPress(video.id, video.title, video.creatorInitials, pageY)
                : undefined
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  seeAll: {
    color: '#A1A1AA',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
});
