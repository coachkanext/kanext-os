/**
 * KayTV See All — full vertical list for an Explore row.
 * Receives rowId and label params from Explore view.
 */

import React, { useCallback, useMemo, useRef } from 'react';
import {
  View, Text, Pressable, FlatList, StyleSheet, useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAppContext } from '@/context/app-context';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';
import {
  getExploreRows, formatViewCount, formatVideoTimestamp, type KayTVFeedItem,
} from '@/data/mock-kaytv';

const TOP_BAR_H = 52;

// ── VideoCard (inlined, matches Home view layout) ─────────────────────────

function VideoCard({
  video, C, onPress,
}: { video: KayTVFeedItem; C: ComponentColors; onPress: () => void }) {
  const { width } = useWindowDimensions();
  const thumbW = width - 24;
  const thumbH = Math.round(thumbW * (9 / 16));

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.92 : 1 }]}
    >
      <View style={styles.thumbWrap}>
        <View style={[styles.thumb, { height: thumbH, backgroundColor: `hsl(${video.thumbHue},38%,32%)` }]}>
          <Text style={styles.thumbEmoji}>{video.thumbEmoji}</Text>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{video.duration}</Text>
          </View>
        </View>
      </View>
      <View style={styles.infoBlock}>
        <View style={styles.uploaderRow}>
          <View style={[styles.brandAvatar, { backgroundColor: C.surfacePressed }]}>
            <Text style={[styles.brandAvatarText, { color: C.label }]}>{video.uploaderInitials}</Text>
          </View>
          <Text style={[styles.uploaderLine, { color: C.secondary }]} numberOfLines={1}>
            {video.uploaderName} · {video.uploaderHandle}
          </Text>
          <Pressable
            hitSlop={10}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            style={styles.optionsBtn}
          >
            <IconSymbol name="ellipsis" size={14} color={C.secondary} />
          </Pressable>
        </View>
        <Text style={[styles.videoTitle, { color: C.label }]} numberOfLines={2}>{video.title}</Text>
        <Text style={[styles.videoMeta, { color: C.secondary }]} numberOfLines={1}>
          {video.brandName} · {formatViewCount(video.viewCount)} · {formatVideoTimestamp(video.timestamp)}
        </Text>
      </View>
    </Pressable>
  );
}

// ── See All Screen ─────────────────────────────────────────────────────────

export default function KayTVSeeAllScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAppContext();
  const mode = state.activeContext.mode as string;
  const { rowId, label } = useLocalSearchParams<{ rowId: string; label: string }>();
  const lastScrollY = useRef(0);

  const row = useMemo(() => getExploreRows(mode).find(r => r.id === rowId), [mode, rowId]);

  const topBarH = insets.top + TOP_BAR_H;

  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  return (
    <View style={[styles.screen, { backgroundColor: C.bg }]}>
      {/* Top bar */}
      <View style={[styles.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
            <IconSymbol name="chevron.left" size={20} color={C.label} />
          </Pressable>
          <Text style={[styles.topBarTitle, { color: C.label }]} numberOfLines={1}>
            {label ?? 'Videos'}
          </Text>
          <View style={{ width: 36 }} />
        </View>
      </View>

      {/* Content */}
      {!row ? (
        <View style={[styles.empty, { marginTop: topBarH + 40 }]}>
          <IconSymbol name="play.rectangle" size={44} color={C.muted} />
          <Text style={[styles.emptyText, { color: C.secondary }]}>No videos found</Text>
        </View>
      ) : (
        <FlatList
          data={row.items}
          keyExtractor={item => item.id}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: topBarH, paddingBottom: 120 }}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: C.surface }]} />
          )}
          renderItem={({ item }) => (
            <VideoCard
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

  topBarWrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 10,
  },
  topBar: {
    height: TOP_BAR_H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  backBtn: { padding: 4 },
  topBarTitle: { flex: 1, fontSize: 17, fontWeight: '600' },

  // VideoCard
  card: { backgroundColor: 'transparent' },
  thumb: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  thumbEmoji: { fontSize: 52 },
  durationBadge: {
    position: 'absolute', bottom: 8, right: 8,
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.78)',
  },
  durationText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  metaRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 12, gap: 10,
  },
  uploaderAvatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 2,
  },
  uploaderAvatarText: { fontSize: 12, fontWeight: '600' },
  metaText: { flex: 1, minWidth: 0 },
  videoTitle: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  videoMeta: { fontSize: 12, marginTop: 3, lineHeight: 16 },
  optionsBtn: { padding: 4, marginTop: 2 },
  separator: { height: 8 },

  empty: { alignItems: 'center', gap: 10 },
  emptyText: { fontSize: 15 },
});
