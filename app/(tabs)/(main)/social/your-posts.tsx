/**
 * Your Posts — grid of all your posts.
 * Mirrors profile Posts grid tab. Tap → grid-feed.
 */

import React, { useMemo } from 'react';
import {
  View, Text, Pressable, Image, ScrollView, StyleSheet, useWindowDimensions, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { getSammyPosts } from '@/data/mock-social';
import { useScrollHeader } from '@/hooks/use-scroll-header';

export default function YourPostsScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const posts = useMemo(() => getSammyPosts(), []);
  const cellSize = (width - 2) / 3;

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      {/* Header */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top + 8, borderBottomColor: C.separator, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.header}>
          <Pressable
            style={s.backBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
          >
            <IconSymbol name="chevron.left" size={20} color={C.label} />
          </Pressable>
          <Text style={[s.title, { color: C.label }]}>Your Posts</Text>
          <View style={s.backBtn} />
        </View>
      </Animated.View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 8 + 52 + 8, paddingBottom: insets.bottom + 80 }} onScroll={onScroll} scrollEventThrottle={scrollEventThrottle}>
        {/* Stats bar */}
        <View style={[s.statsBar, { borderBottomColor: C.separator }]}>
          <Text style={[s.statsText, { color: C.secondary }]}>
            {posts.length} posts
          </Text>
        </View>

        {/* 3-column grid */}
        <View style={s.grid}>
          {posts.map((post, i) => (
            <Pressable
              key={post.id}
              style={[s.cell, { width: cellSize, height: cellSize }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: '/(tabs)/(main)/social/grid-feed' as any,
                  params: { startPostId: post.id },
                });
              }}
            >
              {post.media[0] ? (
                <Image source={{ uri: post.media[0].uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: `hsl(${(i * 37 + 200) % 360},18%,82%)` }]} />
              )}
              {/* Multi-image indicator */}
              {post.media.length > 1 && (
                <View style={s.multiIcon}>
                  <IconSymbol name="square.on.square" size={12} color="#fff" />
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {posts.length === 0 && (
          <View style={s.empty}>
            <IconSymbol name="photo.on.rectangle.angled" size={40} color={C.muted} />
            <Text style={[s.emptyText, { color: C.muted }]}>No posts yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen:      { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  header:      { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  backBtn:     { width: 40, alignItems: 'flex-start', justifyContent: 'center' },
  title:       { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  statsBar:  { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  statsText: { fontSize: 13 },
  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 1 },
  cell:      { overflow: 'hidden', backgroundColor: '#ddd' },
  multiIcon: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 4, padding: 3 },
  empty:     { alignItems: 'center', gap: 12, paddingTop: 80 },
  emptyText: { fontSize: 15 },
});
