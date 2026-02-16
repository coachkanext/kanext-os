/**
 * Reels — TikTok-style vertical feed of short-form video content.
 * FlatList with pagingEnabled, tap pause/play, side actions, bottom overlay.
 * Premium design with "Following | For You" toggle.
 */

import React, { useState, useCallback } from 'react';
import { View, FlatList, Pressable, StyleSheet, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ReelItem } from '@/components/media/reel-item';
import { ShareSheet } from '@/components/media/share-sheet';
import { Layout } from '@/constants/theme';
import { MOCK_REELS } from '@/data/mock-video';
import type { Reel } from '@/data/mock-video';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAIN_TAB_BAR_H = Platform.OS === 'ios' ? Layout.tabBarHeight : 60;
const SUB_FOOTER_H = 52;
const ITEM_HEIGHT = SCREEN_HEIGHT - MAIN_TAB_BAR_H - SUB_FOOTER_H;

type ReelFeed = 'following' | 'for_you';

export default function ReelsScreen() {
  const insets = useSafeAreaInsets();
  const [shareVisible, setShareVisible] = useState(false);
  const [shareTitle, setShareTitle] = useState('');
  const [activeFeed, setActiveFeed] = useState<ReelFeed>('for_you');

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
        <Pressable style={styles.headerIconBtn}>
          <IconSymbol name="tv" size={18} color="#fff" />
        </Pressable>

        {/* Following / For You toggle */}
        <View style={styles.feedToggle}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveFeed('following');
            }}
          >
            <ThemedText
              style={[
                styles.feedToggleText,
                activeFeed === 'following' && styles.feedToggleActive,
              ]}
            >
              Following
            </ThemedText>
            {activeFeed === 'following' && <View style={styles.feedToggleIndicator} />}
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveFeed('for_you');
            }}
          >
            <ThemedText
              style={[
                styles.feedToggleText,
                activeFeed === 'for_you' && styles.feedToggleActive,
              ]}
            >
              For You
            </ThemedText>
            {activeFeed === 'for_you' && <View style={styles.feedToggleIndicator} />}
          </Pressable>
        </View>

        <Pressable style={styles.headerIconBtn}>
          <IconSymbol name="magnifyingglass" size={18} color="#fff" />
        </Pressable>
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
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Feed toggle
  feedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  feedToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center',
  },
  feedToggleActive: {
    color: '#fff',
    fontWeight: '700',
  },
  feedToggleIndicator: {
    width: 24,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: '#fff',
    alignSelf: 'center',
    marginTop: 4,
  },
});
