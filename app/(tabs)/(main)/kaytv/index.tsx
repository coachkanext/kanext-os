/**
 * KayTV — Home / Explore / Library via dropdown pill.
 * Home: mode-scoped feed (all brands in mode), subscribed brands first.
 *       Category pills hidden by default, toggled via filter icon.
 * Explore: cross-brand/cross-mode discovery rows.
 * Library: personal history, saved, liked, playlists — mode-agnostic.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, Pressable, FlatList, ScrollView,
  StyleSheet, useWindowDimensions, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAppContext } from '@/context/app-context';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';
import {
  getKayTVFeed, getExploreRows, getWatchHistoryFeed, getWatchLaterFeed,
  getLikedVideosFeed, getPlaylists, KAYTV_CATEGORIES,
  formatViewCount, formatVideoTimestamp,
  type KayTVFeedItem, type PlaylistItem,
} from '@/data/mock-kaytv';

type KayTab = 'Home' | 'Explore' | 'Library';

const TOP_BAR_H = 52;
const PILL_ROW_H = 48;

// ── VideoCard — YouTube-style ──────────────────────────────────────────────

function VideoCard({
  video, C, onPress,
}: { video: KayTVFeedItem; C: ComponentColors; onPress: () => void }) {
  const { width } = useWindowDimensions();
  const thumbW = width - 24; // 12px padding each side
  const thumbH = Math.round(thumbW * (9 / 16));

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.92 : 1 }]}
    >
      {/* 16:9 Thumbnail with horizontal padding */}
      <View style={styles.thumbWrap}>
        <View style={[styles.thumb, { height: thumbH, backgroundColor: `hsl(${video.thumbHue},38%,32%)` }]}>
          <Text style={styles.thumbEmoji}>{video.thumbEmoji}</Text>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{video.duration}</Text>
          </View>
        </View>
      </View>

      {/* Info block */}
      <View style={styles.infoBlock}>
        {/* Uploader row: avatar · name · @handle · ⋮ */}
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

        {/* Title */}
        <Text style={[styles.videoTitle, { color: C.label }]} numberOfLines={2}>
          {video.title}
        </Text>

        {/* Meta: brand · views · time */}
        <Text style={[styles.videoMeta, { color: C.secondary }]} numberOfLines={1}>
          {video.brandName} · {formatViewCount(video.viewCount)} · {formatVideoTimestamp(video.timestamp)}
        </Text>
      </View>
    </Pressable>
  );
}

// ── ExploreCard ────────────────────────────────────────────────────────────

function ExploreCard({
  video, C, onPress,
}: { video: KayTVFeedItem; C: ComponentColors; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.exploreCard, { opacity: pressed ? 0.9 : 1 }]}>
      <View style={[styles.exploreThumb, { backgroundColor: `hsl(${video.thumbHue},38%,32%)` }]}>
        <Text style={styles.exploreEmoji}>{video.thumbEmoji}</Text>
        <View style={styles.exploreDurationBadge}>
          <Text style={styles.exploreDurationText}>{video.duration}</Text>
        </View>
      </View>
      <Text style={[styles.exploreTitle, { color: C.label }]} numberOfLines={2}>{video.title}</Text>
      <Text style={[styles.exploreUploader, { color: C.secondary }]} numberOfLines={1}>{video.uploaderName}</Text>
    </Pressable>
  );
}

// ── LibraryCard ────────────────────────────────────────────────────────────

function LibraryCard({
  video, C, onPress,
}: { video: KayTVFeedItem; C: ComponentColors; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.libCard, { opacity: pressed ? 0.9 : 1 }]}>
      <View style={[styles.libThumb, { backgroundColor: `hsl(${video.thumbHue},38%,32%)` }]}>
        <Text style={styles.libEmoji}>{video.thumbEmoji}</Text>
        <View style={styles.libDurationBadge}>
          <Text style={styles.libDurationText}>{video.duration}</Text>
        </View>
      </View>
      <Text style={[styles.libTitle, { color: C.label }]} numberOfLines={2}>{video.title}</Text>
    </Pressable>
  );
}

// ── PlaylistCard ───────────────────────────────────────────────────────────

function PlaylistCard({
  playlist, C, onPress,
}: { playlist: PlaylistItem; C: ComponentColors; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.libCard, { opacity: pressed ? 0.9 : 1 }]}>
      <View style={[styles.libThumb, { backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ fontSize: 28 }}>📋</Text>
      </View>
      <Text style={[styles.libTitle, { color: C.label }]} numberOfLines={2}>{playlist.name}</Text>
      <Text style={[styles.libSubtitle, { color: C.secondary }]}>{playlist.videoCount} videos</Text>
    </Pressable>
  );
}

// ── KayTV Screen ──────────────────────────────────────────────────────────

export default function KayTVScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAppContext();
  const mode = state.activeContext.mode as string;

  const [activeTab, setActiveTab] = useState<KayTab>('Home');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterPillsVisible, setFilterPillsVisible] = useState(false);
  const pillsRevealAnim = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);

  const canUpload = mode !== 'personal';
  const categories = KAYTV_CATEGORIES[mode] ?? KAYTV_CATEGORIES.sports;

  const topBarH = insets.top + TOP_BAR_H;
  const contentTop = topBarH + (filterPillsVisible ? PILL_ROW_H : 0);

  // Reset filter state whenever mode changes
  useEffect(() => {
    setSelectedCategory('All');
    setFilterPillsVisible(false);
    pillsRevealAnim.setValue(0);
  }, [mode, pillsRevealAnim]);

  const videos = useMemo(() => getKayTVFeed(mode, selectedCategory), [mode, selectedCategory]);
  const exploreRows = useMemo(() => getExploreRows(mode, selectedCategory), [mode, selectedCategory]);
  const watchHistoryFeed = useMemo(() => getWatchHistoryFeed(mode), [mode]);
  const watchLaterFeed = useMemo(() => getWatchLaterFeed(mode), [mode]);
  const likedVideosFeed = useMemo(() => getLikedVideosFeed(mode), [mode]);
  const playlists = useMemo(() => getPlaylists(), []);

  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  const handleCategorySelect = useCallback((cat: string) => {
    Haptics.selectionAsync();
    setSelectedCategory(cat);
  }, []);

  const handleTabSelect = useCallback((tab: KayTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    setDropdownOpen(false);
  }, []);

  const toggleFilterPills = useCallback(() => {
    setFilterPillsVisible(prev => {
      const next = !prev;
      Animated.timing(pillsRevealAnim, {
        toValue: next ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      return next;
    });
  }, [pillsRevealAnim]);

  const navigateToPlayer = useCallback((videoId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(tabs)/(main)/kaytv/player' as any,
      params: { videoId },
    });
  }, [router]);

  return (
    <View style={[styles.screen, { backgroundColor: C.bg }]}>

      {/* ── Home View ── */}
      {activeTab === 'Home' && (
        <FlatList
          data={videos}
          keyExtractor={item => item.id}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: contentTop, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <VideoCard video={item} C={C} onPress={() => navigateToPlayer(item.id)} />
          )}
          ListEmptyComponent={
            <View style={[styles.empty, { marginTop: contentTop + 40 }]}>
              <IconSymbol name="play.rectangle" size={44} color={C.muted} />
              <Text style={[styles.emptyText, { color: C.secondary }]}>No videos yet</Text>
            </View>
          }
        />
      )}

      {/* ── Explore View ── */}
      {activeTab === 'Explore' && (
        <ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: contentTop, paddingBottom: 120 }}
        >
          {exploreRows.length === 0 ? (
            <View style={[styles.empty, { marginTop: 60 }]}>
              <IconSymbol name="sparkles" size={44} color={C.muted} />
              <Text style={[styles.emptyText, { color: C.secondary }]}>
                {mode === 'personal' ? 'Switch modes to explore content' : 'No discovery content yet'}
              </Text>
            </View>
          ) : exploreRows.map(row => (
            <View key={row.id} style={styles.exploreSection}>
              <View style={styles.exploreSectionHeader}>
                <Text style={[styles.exploreSectionLabel, { color: C.label }]}>{row.label}</Text>
                <Pressable
                  hitSlop={8}
                  onPress={() => router.push({
                    pathname: '/(tabs)/(main)/kaytv/see-all' as any,
                    params: { rowId: row.id, label: row.label },
                  })}
                >
                  <Text style={[styles.seeAllText, { color: C.accent }]}>See all</Text>
                </Pressable>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, gap: 12 }}
              >
                {row.items.map(v => (
                  <ExploreCard key={v.id} video={v} C={C} onPress={() => navigateToPlayer(v.id)} />
                ))}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── Library View ── */}
      {activeTab === 'Library' && (
        <ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: contentTop, paddingBottom: 120 }}
        >
          {[
            { label: 'Watch History', items: watchHistoryFeed },
            { label: 'Watch Later',   items: watchLaterFeed },
            { label: 'Liked Videos',  items: likedVideosFeed },
          ].map(({ label, items }) => {
            const visible = selectedCategory === 'All'
              ? items : items.filter(v => v.category === selectedCategory);
            if (visible.length === 0) return null;
            return (
              <View key={label} style={styles.libSection}>
                <View style={styles.libSectionHeader}>
                  <Text style={[styles.libSectionTitle, { color: C.label }]}>{label}</Text>
                  <Pressable hitSlop={8}><Text style={[styles.seeAllText, { color: C.accent }]}>See all</Text></Pressable>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, gap: 12 }}>
                  {visible.slice(0, 4).map(v => (
                    <LibraryCard key={v.id} video={v} C={C} onPress={() => navigateToPlayer(v.id)} />
                  ))}
                </ScrollView>
              </View>
            );
          })}

          <View style={styles.libSection}>
            <View style={styles.libSectionHeader}>
              <Text style={[styles.libSectionTitle, { color: C.label }]}>Playlists</Text>
              <Pressable hitSlop={8}><Text style={[styles.seeAllText, { color: C.accent }]}>See all</Text></Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, gap: 12 }}>
              {playlists.map(pl => (
                <PlaylistCard
                  key={pl.id}
                  playlist={pl}
                  C={C}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                />
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      )}

      {/* ── Fixed top bar ── */}
      <View style={[styles.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={styles.topBar}>
          {/* Left: upload */}
          <View style={styles.topBarSide}>
            {canUpload ? (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/(tabs)/(main)/kaytv/upload' as any);
                }}
                hitSlop={8}
              >
                <IconSymbol name="plus" size={22} color={C.label} />
              </Pressable>
            ) : null}
          </View>

          {/* Center: KayTV ▾ dropdown */}
          <View style={styles.dropdownPillWrap}>
            <Pressable
              style={[styles.dropdownPill, { backgroundColor: C.surfacePressed }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDropdownOpen(v => !v);
              }}
            >
              <Text style={[styles.dropdownPillText, { color: C.label }]}>{activeTab}</Text>
              <IconSymbol name="chevron.down" size={12} color={C.secondary} />
            </Pressable>
          </View>

          {/* Right: filter icon (all tabs) */}
          <View style={[styles.topBarSide, { alignItems: 'flex-end' }]}>
            <Pressable onPress={toggleFilterPills} hitSlop={12}>
              <IconSymbol
                name={filterPillsVisible || selectedCategory !== 'All'
                  ? 'line.3.horizontal.decrease.circle.fill'
                  : 'line.3.horizontal.decrease.circle'}
                size={22}
                color={filterPillsVisible || selectedCategory !== 'All' ? C.accent : C.label}
              />
            </Pressable>
          </View>
        </View>

        {/* Category pills — all tabs, toggled via filter icon */}
        <Animated.View style={{
          height: pillsRevealAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILL_ROW_H] }),
          opacity: pillsRevealAnim,
          overflow: 'hidden',
        }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsContent}
            style={[styles.pillsRow, { borderTopColor: C.separator }]}
          >
            {categories.map(cat => {
              const active = cat === selectedCategory;
              return (
                <Pressable
                  key={cat}
                  style={[
                    styles.pill,
                    active ? { backgroundColor: C.label } : { borderColor: C.separator },
                  ]}
                  onPress={() => handleCategorySelect(cat)}
                >
                  <Text style={[
                    styles.pillText,
                    { color: active ? C.bg : C.secondary },
                    active && { fontWeight: '600' },
                  ]}>
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>

      {/* ── Dropdown ── */}
      {dropdownOpen ? (
        <>
          <Pressable
            style={[StyleSheet.absoluteFillObject, { zIndex: 98 }]}
            onPress={() => setDropdownOpen(false)}
          />
          <View style={[
            styles.dropdown,
            { top: insets.top + 56, backgroundColor: C.bg, borderColor: C.separator, zIndex: 99 },
          ]}>
            {(['Home', 'Explore', 'Library'] as KayTab[]).map(tab => (
              <Pressable key={tab} style={styles.dropdownOption} onPress={() => handleTabSelect(tab)}>
                <Text style={[
                  styles.dropdownOptionText,
                  { color: tab === activeTab ? C.label : C.secondary },
                  tab === activeTab && { fontWeight: '600' },
                ]}>
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      {/* ── Search FAB ── */}
      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 49 + 16, backgroundColor: C.accent }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push({
            pathname: '/(tabs)/(main)/kaytv/search' as any,
            params: { source: activeTab },
          });
        }}
      >
        <IconSymbol name="magnifyingglass" size={20} color="#fff" />
      </Pressable>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // Top bar
  topBarWrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 10,
  },
  topBar: {
    height: TOP_BAR_H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  topBarSide: { width: 48, justifyContent: 'center' },

  // Dropdown pill
  dropdownPillWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  dropdownPillText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },

  // Dropdown menu
  dropdown: {
    position: 'absolute',
    left: '50%',
    marginLeft: -110,
    minWidth: 220,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  dropdownOption: { paddingVertical: 14, paddingHorizontal: 20 },
  dropdownOptionText: { fontSize: 15 },

  // Category pills (Home, always visible)
  pillsRow: {
    height: PILL_ROW_H,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  pillsContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  pillText: { fontSize: 13 },

  // VideoCard (YouTube style)
  card: { paddingBottom: 20 },
  thumbWrap: { paddingHorizontal: 12, marginBottom: 9 },
  thumb: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  thumbEmoji: { fontSize: 48 },
  durationBadge: {
    position: 'absolute', bottom: 8, right: 8,
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.78)',
  },
  durationText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  infoBlock: { paddingHorizontal: 12 },
  uploaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  brandAvatar: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  brandAvatarText: { fontSize: 9, fontWeight: '700' },
  uploaderLine: { flex: 1, fontSize: 12 },
  optionsBtn: { paddingLeft: 4 },
  videoTitle: { fontSize: 14, fontWeight: '600', lineHeight: 20, marginBottom: 4 },
  videoMeta: { fontSize: 12, lineHeight: 17 },

  // ExploreCard
  exploreCard: { width: 160 },
  exploreThumb: {
    width: 160, height: 100, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  exploreEmoji: { fontSize: 32 },
  exploreDurationBadge: {
    position: 'absolute', bottom: 5, right: 5,
    paddingHorizontal: 5, paddingVertical: 1,
    borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.78)',
  },
  exploreDurationText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  exploreTitle: { fontSize: 12, fontWeight: '500', lineHeight: 17, marginTop: 6 },
  exploreUploader: { fontSize: 11, marginTop: 2 },

  // Explore section
  exploreSection: { marginBottom: 20 },
  exploreSectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  exploreSectionLabel: { fontSize: 16, fontWeight: '700' },
  seeAllText: { fontSize: 13, fontWeight: '500' },

  // LibraryCard
  libCard: { width: 140 },
  libThumb: {
    width: 140, height: 80, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  libEmoji: { fontSize: 28 },
  libDurationBadge: {
    position: 'absolute', bottom: 4, right: 4,
    paddingHorizontal: 4, paddingVertical: 1,
    borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.78)',
  },
  libDurationText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  libTitle: { fontSize: 12, fontWeight: '500', lineHeight: 16, marginTop: 5 },
  libSubtitle: { fontSize: 11, marginTop: 2 },

  // Library section
  libSection: { marginBottom: 20 },
  libSectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  libSectionTitle: { fontSize: 16, fontWeight: '700' },

  // FAB
  fab: {
    position: 'absolute',
    right: 24,
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 20,
  },

  // Empty state
  empty: { alignItems: 'center', gap: 10 },
  emptyText: { fontSize: 15 },
});
