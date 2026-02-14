/**
 * Reels — TikTok-style vertical feed of short-form video content.
 * FlatList with pagingEnabled, tap pause/play, side actions, bottom overlay.
 */

import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ReelItem } from '@/components/media/reel-item';
import { ShareSheet } from '@/components/media/share-sheet';
import { Layout } from '@/constants/theme';
import { MOCK_REELS } from '@/data/mock-video';
import type { Reel } from '@/data/mock-video';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAIN_TAB_BAR_H = Platform.OS === 'ios' ? Layout.tabBarHeight : 60;
const SUB_FOOTER_H = 52;
const ITEM_HEIGHT = SCREEN_HEIGHT - MAIN_TAB_BAR_H - SUB_FOOTER_H;

export default function ReelsScreen() {
  const insets = useSafeAreaInsets();
  const [shareVisible, setShareVisible] = useState(false);
  const [shareTitle, setShareTitle] = useState('');

  // Sort by most recent
  const reels = [...MOCK_REELS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const handleShare = useCallback((reel: Reel) => {
    setShareTitle(reel.caption);
    setShareVisible(true);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Reel }) => (
      <ReelItem
        reel={item}
        height={ITEM_HEIGHT}
        onShare={() => handleShare(item)}
      />
    ),
    [handleShare],
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header overlay */}
      <View style={[styles.headerOverlay, { top: insets.top }]}>
        <ThemedText style={styles.headerTitle}>Reels</ThemedText>
      </View>

      <FlatList
        data={reels}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
      />

      <ShareSheet
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        title={shareTitle}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerOverlay: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
