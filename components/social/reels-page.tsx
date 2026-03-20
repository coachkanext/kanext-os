/**
 * ReelsPage — Instagram-style full-screen vertical reels with video playback.
 * X-style footer: hides on scroll down, shows on scroll up.
 * Tracks visible item to control video playback (only active reel plays).
 */

import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  type ViewToken,
} from 'react-native';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';
import { ReelCard } from './reel-card';
import type { SocialReel } from '@/data/mock-social';

interface ReelsPageProps {
  reels: SocialReel[];
  likedReels: Set<string>;
  bookmarkedReels: Set<string>;
  onLikeToggle: (id: string) => void;
  onBookmarkToggle: (id: string) => void;
  onCommentPress?: (reel: SocialReel) => void;
  onSharePress?: (reel: SocialReel) => void;
}

export function ReelsPage({
  reels,
  likedReels,
  bookmarkedReels,
  onLikeToggle,
  onBookmarkToggle,
  onCommentPress,
  onSharePress,
}: ReelsPageProps) {
  const { height: screenHeight } = useWindowDimensions();
  const lastScrollY = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // X-style: hide footer on scroll down, show on scroll up
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) {
      hideFooter();
    } else if (y < lastScrollY.current - 10) {
      showFooter();
    }
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  // Track which reel is visible (stable refs for FlatList)
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const renderItem = useCallback(
    ({ item, index }: { item: SocialReel; index: number }) => (
      <ReelCard
        reel={item}
        isLiked={likedReels.has(item.id)}
        isBookmarked={bookmarkedReels.has(item.id)}
        isActive={index === activeIndex}
        onLikeToggle={() => onLikeToggle(item.id)}
        onBookmarkToggle={() => onBookmarkToggle(item.id)}
        onCommentPress={() => onCommentPress?.(item)}
        onSharePress={() => onSharePress?.(item)}
      />
    ),
    [likedReels, bookmarkedReels, onLikeToggle, onBookmarkToggle, activeIndex, onCommentPress, onSharePress],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={reels}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
