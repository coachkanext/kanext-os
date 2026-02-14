/**
 * Team Channel — team page with Games / Reels / About tabs.
 * Accessible via Team Header tap in Video Home.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GameCard } from '@/components/media/game-card';
import { ReelCard } from '@/components/media/reel-card';
import { Spacing, BorderRadius } from '@/constants/theme';
import { MOCK_VIDEO_GAMES, MOCK_REELS } from '@/data/mock-video';
import type { VideoGame, Reel } from '@/data/mock-video';

type ChannelTab = 'games' | 'reels' | 'about';

export default function TeamChannelScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ChannelTab>('games');

  const renderGame = useCallback(
    ({ item }: { item: VideoGame }) => (
      <GameCard
        game={item}
        onPress={() => router.push(`/coach/video-game?id=${item.id}` as any)}
      />
    ),
    [router],
  );

  const renderReel = useCallback(
    ({ item }: { item: Reel }) => (
      <ReelCard
        reel={item}
        variant="grid"
        onPress={() => router.push(`/coach/reel-viewer?reelId=${item.id}` as any)}
      />
    ),
    [router],
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <IconSymbol name="chevron.left" size={20} color="#f5f5f5" />
        </Pressable>
        <View style={styles.headerInfo}>
          <View style={styles.teamLogo}>
            <ThemedText style={styles.teamLogoText}>FMU</ThemedText>
          </View>
          <View>
            <ThemedText style={styles.teamName}>FMU Lions</ThemedText>
            <ThemedText style={styles.teamSub}>Team Channel</ThemedText>
          </View>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {(['games', 'reels', 'about'] as ChannelTab[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab);
              }}
            >
              <ThemedText
                style={[styles.tabLabel, { color: isActive ? '#f5f5f5' : '#6e6e6e' }]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      {activeTab === 'games' && (
        <FlatList
          data={MOCK_VIDEO_GAMES}
          keyExtractor={(item) => item.id}
          renderItem={renderGame}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === 'reels' && (
        <FlatList
          data={MOCK_REELS}
          keyExtractor={(item) => item.id}
          renderItem={renderReel}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === 'about' && (
        <ScrollView contentContainerStyle={styles.aboutContent}>
          <ThemedText style={styles.aboutTitle}>Florida Memorial University</ThemedText>
          <ThemedText style={styles.aboutText}>
            FMU Lions Men's Basketball{'\n'}
            Miami Gardens, FL{'\n'}
            Conference: Big South{'\n'}
            Head Coach: Coach Williams{'\n\n'}
            Season: 2025-26
          </ThemedText>
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  teamLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a472a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamLogoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  teamName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f5f5f5',
  },
  teamSub: {
    fontSize: 13,
    color: '#6e6e6e',
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1a1a1a',
    marginBottom: Spacing.sm,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#f5f5f5',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Content
  listContent: {
    paddingBottom: 100,
    paddingTop: Spacing.xs,
  },
  gridContent: {
    paddingHorizontal: Spacing.md - 4,
    paddingBottom: 100,
  },
  aboutContent: {
    padding: Spacing.md,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: Spacing.sm,
  },
  aboutText: {
    fontSize: 14,
    color: '#6e6e6e',
    lineHeight: 22,
  },
});
