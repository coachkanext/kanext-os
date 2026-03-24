/**
 * Profile Reels — full-screen reels viewer for Sammy's own reels.
 * Identical UX to main Reels view. startIndex param scrolls to tapped reel.
 * Back: rounded-circle button top-left.
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View, Pressable, StyleSheet, useWindowDimensions, FlatList,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { ReelCard } from '@/components/social/reel-card';
import { getSammyReels, type SocialReel } from '@/data/mock-social';
import type { ViewToken } from 'react-native';

export default function ProfileReelsScreen() {
  const { startIndex: startIndexParam } = useLocalSearchParams<{ startIndex: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const C = useColors();
  const { height: screenHeight } = useWindowDimensions();

  const reels = useMemo(() => getSammyReels(), []);
  const startIndex = Math.min(
    Math.max(0, parseInt(startIndexParam ?? '0', 10)),
    reels.length - 1,
  );

  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [likedReels, setLikedReels] = useState<Set<string>>(
    () => new Set(reels.filter(r => r.isLiked).map(r => r.id)),
  );
  const [bookmarkedReels, setBookmarkedReels] = useState<Set<string>>(
    () => new Set(reels.filter(r => r.isBookmarked).map(r => r.id)),
  );

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

  const toggleLike = useCallback((id: string) => {
    setLikedReels(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarkedReels(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: SocialReel; index: number }) => (
      <ReelCard
        reel={item}
        isLiked={likedReels.has(item.id)}
        isBookmarked={bookmarkedReels.has(item.id)}
        isActive={index === activeIndex}
        onLikeToggle={() => toggleLike(item.id)}
        onBookmarkToggle={() => toggleBookmark(item.id)}
      />
    ),
    [likedReels, bookmarkedReels, activeIndex, toggleLike, toggleBookmark],
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={reels}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        pagingEnabled
        initialScrollIndex={startIndex}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_data, index) => ({
          length: screenHeight,
          offset: screenHeight * index,
          index,
        })}
      />

      {/* Back button */}
      <Pressable
        style={[styles.backBtn, { top: insets.top + 10, backgroundColor: 'rgba(0,0,0,0.45)' }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back();
        }}
        hitSlop={8}
      >
        <IconSymbol name="chevron.left" size={18} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
  },
  backBtn: {
    position: 'absolute',
    left: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
