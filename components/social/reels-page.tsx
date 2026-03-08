/**
 * ReelsPage — vertical paging FlatList of full-screen reels.
 * Footer hides on scroll (swipe between reels), auto-shows after 3s idle.
 */

import React, { useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { hideFooter } from '@/utils/global-footer-hide';
import { ReelCard } from './reel-card';
import type { SocialReel } from '@/data/mock-social';

interface ReelsPageProps {
  reels: SocialReel[];
  likedReels: Set<string>;
  bookmarkedReels: Set<string>;
  onLikeToggle: (id: string) => void;
  onBookmarkToggle: (id: string) => void;
}

export function ReelsPage({
  reels,
  likedReels,
  bookmarkedReels,
  onLikeToggle,
  onBookmarkToggle,
}: ReelsPageProps) {
  const { height: screenHeight } = useWindowDimensions();
  const hasFiredOnce = useRef(false);

  // Swiping between reels = scroll → hide footer (global 3s idle timer auto-shows)
  // Skip the initial fire on mount so footer stays visible when entering the page
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        if (!hasFiredOnce.current) {
          hasFiredOnce.current = true;
          return;
        }
        hideFooter();
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const renderItem = useCallback(
    ({ item }: { item: SocialReel }) => (
      <ReelCard
        reel={item}
        isLiked={likedReels.has(item.id)}
        isBookmarked={bookmarkedReels.has(item.id)}
        onLikeToggle={() => onLikeToggle(item.id)}
        onBookmarkToggle={() => onBookmarkToggle(item.id)}
      />
    ),
    [likedReels, bookmarkedReels, onLikeToggle, onBookmarkToggle],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={reels}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        snapToInterval={screenHeight}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_data, index) => ({
          length: screenHeight,
          offset: screenHeight * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
