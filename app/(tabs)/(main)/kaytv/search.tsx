/**
 * KayTV Search — real-time search across brand (Home), all (Explore), or library.
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, Pressable, FlatList, StyleSheet,
  useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAppContext } from '@/context/app-context';
import {
  getKayTVFeed, getExploreRows, getWatchHistoryFeed, getWatchLaterFeed,
  getLikedVideosFeed, formatViewCount, formatVideoTimestamp,
  type KayTVFeedItem,
} from '@/data/mock-kaytv';

// ── Search Result Card ─────────────────────────────────────────────────────

function SearchResultCard({
  video, C, onPress,
}: { video: KayTVFeedItem; C: ComponentColors; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.resultCard, { opacity: pressed ? 0.9 : 1 }]}
    >
      <View style={[styles.resultThumb, { backgroundColor: `hsl(${video.thumbHue},38%,32%)` }]}>
        <Text style={styles.resultEmoji}>{video.thumbEmoji}</Text>
        <View style={styles.resultDurationBadge}>
          <Text style={styles.resultDurationText}>{video.duration}</Text>
        </View>
      </View>
      <View style={styles.resultMeta}>
        <Text style={[styles.resultTitle, { color: C.label }]} numberOfLines={2}>{video.title}</Text>
        <Text style={[styles.resultUploader, { color: C.secondary }]} numberOfLines={1}>
          {video.uploaderName}
        </Text>
        <Text style={[styles.resultViews, { color: C.muted }]}>
          {formatViewCount(video.viewCount)} · {formatVideoTimestamp(video.timestamp)}
        </Text>
      </View>
    </Pressable>
  );
}

// ── Search Screen ──────────────────────────────────────────────────────────

export default function KayTVSearchScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAppContext();
  const mode = state.activeContext.mode as string;
  const { source } = useLocalSearchParams<{ source: string }>();

  const [query, setQuery] = useState('');

  const allItems = useMemo(() => {
    if (source === 'Explore') {
      // Discovery search: mode-scoped, non-member brands
      const rows = getExploreRows(mode);
      const seen = new Set<string>();
      return rows.flatMap(r => r.items).filter(v => {
        if (seen.has(v.id)) return false;
        seen.add(v.id);
        return true;
      });
    }
    if (source === 'Library') {
      const combined = [...getWatchHistoryFeed(mode), ...getWatchLaterFeed(mode), ...getLikedVideosFeed(mode)];
      const seen = new Set<string>();
      return combined.filter(v => { if (seen.has(v.id)) return false; seen.add(v.id); return true; });
    }
    return getKayTVFeed(mode);
  }, [source, mode]);

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return allItems.filter(v =>
      v.title.toLowerCase().includes(q) || v.uploaderName.toLowerCase().includes(q)
    );
  }, [query, allItems]);

  const sourceLabel = source === 'Explore' ? 'Search all videos…' : source === 'Library' ? 'Search your library…' : 'Search KayTV…';

  return (
    <View style={[styles.screen, { backgroundColor: C.bg, paddingTop: insets.top }]}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <View style={[styles.searchBar, { backgroundColor: C.surface, borderColor: C.inputBorder }]}>
          <IconSymbol name="magnifyingglass" size={15} color={C.secondary} />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder={sourceLabel}
            placeholderTextColor={C.muted}
            style={[styles.searchInput, { color: C.label }]}
            returnKeyType="search"
            clearButtonMode="never"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={16} color={C.muted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Results */}
      {results === null ? (
        <View style={styles.emptyState}>
          <IconSymbol name="magnifyingglass" size={40} color={C.muted} />
          <Text style={[styles.emptyTitle, { color: C.secondary }]}>Search KayTV</Text>
          <Text style={[styles.emptySub, { color: C.muted }]}>
            {source === 'Explore' ? 'Search across all videos' : source === 'Library' ? 'Search your library' : 'Search brand videos'}
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="magnifyingglass" size={40} color={C.muted} />
          <Text style={[styles.emptyTitle, { color: C.secondary }]}>No results for "{query}"</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={v => v.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <SearchResultCard
              video={item}
              C={C}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: '/(tabs)/(main)/kaytv/player' as any,
                  params: { videoId: item.id },
                });
              }}
            />
          )}
        />
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  backBtn: { padding: 4 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: 40,
    padding: 0,
  },

  // Result card
  resultCard: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    alignItems: 'flex-start',
  },
  resultThumb: {
    width: 120,
    height: 68,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
  },
  resultEmoji: { fontSize: 24 },
  resultDurationBadge: {
    position: 'absolute', bottom: 4, right: 4,
    paddingHorizontal: 4, paddingVertical: 1,
    borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.78)',
  },
  resultDurationText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  resultMeta: { flex: 1, minWidth: 0 },
  resultTitle: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  resultUploader: { fontSize: 12, marginTop: 4 },
  resultViews: { fontSize: 11, marginTop: 2 },

  // Empty state
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingHorizontal: 32, paddingBottom: 80,
  },
  emptyTitle: { fontSize: 16, fontWeight: '500', textAlign: 'center' },
  emptySub: { fontSize: 13, textAlign: 'center' },
});
