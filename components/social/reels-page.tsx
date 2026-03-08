/**
 * ReelsPage — vertical paging FlatList of full-screen reels.
 * Hides footer on mount, shows on unmount.
 * 5s idle timer to show footer after inactivity.
 */

import React, { useRef, useCallback, useEffect } from 'react';
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
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();

  const resetIdle = useCallback(() => {
    hideFooter();
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      showFooter();
    }, 5000);
  }, []);

  // Hide footer on mount, show on unmount
  useEffect(() => {
    hideFooter();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      showFooter();
    };
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        resetIdle();
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
        onScrollBeginDrag={resetIdle}
        onTouchStart={resetIdle}
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
