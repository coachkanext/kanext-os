/**
 * ReelsPage — Instagram-style full-screen vertical paging reels.
 * X-style footer: hides on scroll down, shows on scroll up.
 * Each reel = full screen height. pagingEnabled for clean snapping.
 */

import React, { useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  useWindowDimensions,
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
}

export function ReelsPage({
  reels,
  likedReels,
  bookmarkedReels,
  onLikeToggle,
  onBookmarkToggle,
}: ReelsPageProps) {
  const { height: screenHeight } = useWindowDimensions();
  const lastScrollY = useRef(0);

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
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
