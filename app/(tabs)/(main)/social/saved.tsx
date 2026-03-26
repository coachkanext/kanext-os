/**
 * Saved — bookmarked posts.
 * Shows a curated set of mock saved content.
 */

import React, { useMemo } from 'react';
import {
  View, Text, Pressable, Image, ScrollView, StyleSheet, useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { getFeedPosts } from '@/data/mock-social';

// Pick a fixed subset of posts to act as saved content
const SAVED_MODES = ['sports', 'business', 'community', 'education'] as const;

export default function SavedScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cellSize = (width - 2) / 3;

  const savedPosts = useMemo(() => {
    return SAVED_MODES.flatMap(m => getFeedPosts(m).filter(p => p.isBookmarked));
  }, []);

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8, borderBottomColor: C.separator }]}>
        <Pressable
          style={s.backBtn}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
        >
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={[s.title, { color: C.label }]}>Saved</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
        {/* Stats */}
        <View style={[s.statsBar, { borderBottomColor: C.separator }]}>
          <Text style={[s.statsText, { color: C.secondary }]}>{savedPosts.length} saved posts</Text>
        </View>

        {/* Grid */}
        <View style={s.grid}>
          {savedPosts.map((post, i) => (
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
                <View style={[StyleSheet.absoluteFill, { backgroundColor: `hsl(${(i * 53 + 160) % 360},18%,82%)` }]}>
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                    <Text style={{ fontSize: 11, color: '#555', textAlign: 'center' }} numberOfLines={3}>{post.caption}</Text>
                  </View>
                </View>
              )}
              {/* Bookmark badge */}
              <View style={s.bookmarkBadge}>
                <IconSymbol name="bookmark.fill" size={10} color="#fff" />
              </View>
            </Pressable>
          ))}
        </View>

        {savedPosts.length === 0 && (
          <View style={s.empty}>
            <IconSymbol name="bookmark" size={40} color={C.muted} />
            <Text style={[s.emptyTitle, { color: C.label }]}>Nothing saved yet</Text>
            <Text style={[s.emptyText, { color: C.secondary }]}>Bookmark posts to save them here</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen:         { flex: 1 },
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn:        { width: 40, alignItems: 'flex-start', justifyContent: 'center' },
  title:          { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  statsBar:       { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  statsText:      { fontSize: 13 },
  grid:           { flexDirection: 'row', flexWrap: 'wrap', gap: 1 },
  cell:           { overflow: 'hidden', backgroundColor: '#ddd' },
  bookmarkBadge:  { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.50)', borderRadius: 4, padding: 3 },
  empty:          { alignItems: 'center', gap: 10, paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle:     { fontSize: 17, fontWeight: '600', textAlign: 'center' },
  emptyText:      { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
