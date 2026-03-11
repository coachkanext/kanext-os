/**
 * KayTV Content — 3-page swipeable layout. Universal across all modes.
 * Page 0: Browse — featured/live banner, horizontal category rows.
 * Page 1: Library — continue watching, history, saved, playlists, downloads, uploads.
 * Page 2: Channels — subscribed, discovery list with subscribe.
 * 3 dots at top. Swipe right on page 0 = side panel.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useMode } from '@/context/app-context';
import { SwipeablePages } from '@/components/ui/swipeable-two-page';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  getFeaturedBanner,
  getBrowseRows,
  getContinueWatching,
  getWatchHistory,
  getSavedVideos,
  getPlaylists,
  getDownloads,
  getYourUploads,
  getChannels,
  formatViewCount,
  CHANNEL_FILTERS,
  type ContentCard,
  type ContentRow,
  type LibraryItem,
  type ChannelItem,
  type PlaylistItem,
} from '@/data/mock-kaytv';
import { openSidePanel } from '@/utils/global-side-panel';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_W = 200;
const CARD_H = 112;

// ─── Shared ───────────────────────────────────────────────────────────────

function PageTopBar({ title }: { title: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={s.topBar}>
      <Text style={s.topBarTitle}>{title}</Text>
    </View>
  );
}

function FilterPills<T extends string>({
  items,
  active,
  onSelect,
}: {
  items: readonly { key: T; label: string }[];
  active: T;
  onSelect: (key: T) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filterRow}
    >
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <Pressable
            key={item.key}
            style={[s.filterPill, isActive && s.filterPillActive]}
            onPress={() => onSelect(item.key)}
          >
            <Text style={[s.filterText, isActive && s.filterTextActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function SectionHeader({ label }: { label: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Text style={s.sectionLabel}>{label}</Text>
  );
}

// ─── Browse: Content Card ─────────────────────────────────────────────────

function BrowseCard({
  item,
  onLongPress,
}: {
  item: ContentCard;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable
      style={({ pressed }) => [s.browseCard, pressed && { opacity: 0.85 }]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={s.thumbContainer}>
        <Image source={{ uri: item.thumbnailUri }} style={s.browseThumb} />
        {item.isLive && (
          <View style={s.liveBadge}>
            <Text style={s.liveBadgeText}>LIVE</Text>
          </View>
        )}
        {item.duration && !item.isLive && (
          <View style={s.durationBadge}>
            <Text style={s.durationText}>{item.duration}</Text>
          </View>
        )}
      </View>
      <Text style={s.browseTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={s.browseMeta} numberOfLines={1}>
        {item.sourceName} · {formatViewCount(item.viewCount)} · {item.timestamp}
      </Text>
    </Pressable>
  );
}

// ─── Browse: Content Row ──────────────────────────────────────────────────

function BrowseRow({
  row,
  onLongPress,
}: {
  row: ContentRow;
  onLongPress: (item: ContentCard, pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={s.browseRowContainer}>
      <SectionHeader label={row.label} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.browseRowScroll}
      >
        {row.items.map((item) => (
          <BrowseCard
            key={item.id}
            item={item}
            onLongPress={(pageY) => onLongPress(item, pageY)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Library: Video Row ───────────────────────────────────────────────────

function LibraryVideoRow({ item }: { item: LibraryItem }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable style={({ pressed }) => [s.libRow, pressed && { opacity: 0.85 }]}>
      <View style={s.libThumbContainer}>
        <Image source={{ uri: item.thumbnailUri }} style={s.libThumb} />
        {item.progress != null && (
          <View style={s.progressBarBg}>
            <View style={[s.progressBarFill, { width: `${item.progress * 100}%` }]} />
          </View>
        )}
        {item.duration && (
          <View style={s.durationBadge}>
            <Text style={s.durationText}>{item.duration}</Text>
          </View>
        )}
      </View>
      <View style={s.libInfo}>
        <Text style={s.libTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={s.libMeta} numberOfLines={1}>
          {item.sourceName}
          {item.dateWatched ? ` · ${item.dateWatched}` : ''}
          {item.fileSize ? ` · ${item.fileSize}` : ''}
          {item.viewCount != null ? ` · ${formatViewCount(item.viewCount)}` : ''}
        </Text>
        {item.visibility && (
          <Text style={[s.libVisibility, item.visibility === 'public' && { color: C.green }]}>
            {item.visibility}
          </Text>
        )}
      </View>
      <IconSymbol name="chevron.right" size={14} color={C.muted} />
    </Pressable>
  );
}

// ─── Library: Playlist Card ───────────────────────────────────────────────

function PlaylistCard({ item }: { item: PlaylistItem }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable style={({ pressed }) => [s.playlistCard, pressed && { opacity: 0.85 }]}>
      <Image source={{ uri: item.thumbnailUri }} style={s.playlistThumb} />
      <Text style={s.playlistName} numberOfLines={1}>{item.name}</Text>
      <Text style={s.playlistCount}>{item.videoCount} videos</Text>
    </Pressable>
  );
}

// ─── Channels: Channel Row ───────────────────────────────────────────────

function ChannelRow({ channel }: { channel: ChannelItem }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const [subscribed, setSubscribed] = useState(channel.isSubscribed);

  return (
    <Pressable style={({ pressed }) => [s.channelRow, pressed && { opacity: 0.85 }]}>
      <View style={[s.channelAvatar, channel.isOrg && s.channelAvatarOrg]}>
        <Text style={s.channelInitials}>{channel.avatarInitials}</Text>
      </View>
      <View style={s.channelInfo}>
        <Text style={s.channelName} numberOfLines={1}>{channel.name}</Text>
        <Text style={s.channelMeta}>
          {channel.subscriberCount >= 1000
            ? `${(channel.subscriberCount / 1000).toFixed(channel.subscriberCount >= 10000 ? 0 : 1)}K`
            : channel.subscriberCount} subscribers · {channel.contentCount} videos
        </Text>
        <Text style={s.channelDesc} numberOfLines={1}>{channel.description}</Text>
      </View>
      <Pressable
        style={[s.subBtn, subscribed && s.subBtnActive]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setSubscribed((v) => !v);
        }}
      >
        <Text style={[s.subBtnText, subscribed && s.subBtnTextActive]}>
          {subscribed ? 'Subscribed' : 'Subscribe'}
        </Text>
      </Pressable>
    </Pressable>
  );
}

// ─── Channels: Top subscribed row ─────────────────────────────────────────

function SubscribedRow({ channels }: { channels: ChannelItem[] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const subscribed = channels.filter((c) => c.isSubscribed);
  if (subscribed.length === 0) return null;

  return (
    <View>
      <SectionHeader label="Subscribed" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.subscribedRow}
      >
        {subscribed.map((ch) => (
          <Pressable key={ch.id} style={s.subscribedItem}>
            <View style={[s.subscribedAvatar, ch.isOrg && s.channelAvatarOrg]}>
              <Text style={s.subscribedInitials}>{ch.avatarInitials}</Text>
            </View>
            <Text style={s.subscribedName} numberOfLines={1}>{ch.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function KayTVContent() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const mode = useMode();

  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);
  const [channelFilter, setChannelFilter] = useState('all');

  // Browse data
  const featured = useMemo(() => getFeaturedBanner(mode), [mode]);
  const browseRows = useMemo(() => getBrowseRows(mode), [mode]);

  // Library data
  const continueWatching = useMemo(() => getContinueWatching(), []);
  const watchHistory = useMemo(() => getWatchHistory(), []);
  const savedVideos = useMemo(() => getSavedVideos(), []);
  const playlists = useMemo(() => getPlaylists(), []);
  const downloads = useMemo(() => getDownloads(), []);
  const uploads = useMemo(() => getYourUploads(), []);

  // Channels
  const channels = useMemo(() => getChannels(channelFilter), [channelFilter]);
  const allChannels = useMemo(() => getChannels(), []);

  // Scroll footer
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  const handlePageChange = useCallback((index: number) => {
    setPageIndex(index);
    showFooter();
  }, []);

  const longPressContent = useCallback((item: ContentCard, pageY: number) => {
    setMenuData({
      title: item.title,
      subtitle: item.sourceName,
      initials: item.sourceName.slice(0, 2).toUpperCase(),
      pageY,
      actions: [
        { key: 'save', label: 'Save', icon: 'bookmark.fill' },
        { key: 'share', label: 'Share', icon: 'square.and.arrow.up' },
        { key: 'playlist', label: 'Add to Playlist', icon: 'text.badge.plus' },
        { key: 'not_interested', label: 'Not Interested', icon: 'hand.thumbsdown' },
      ],
      onAction: () => {},
    });
  }, []);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <SwipeablePages
        activeIndex={pageIndex}
        onPageChange={handlePageChange}
        onEdgeRight={openSidePanel}
      >
        {/* ── PAGE 0: BROWSE ── */}
        <View style={{ flex: 1 }}>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {/* Featured banner */}
            <Pressable style={s.featuredBanner}>
              <Image source={{ uri: featured.imageUri }} style={s.featuredImage} />
              <View style={s.featuredOverlay}>
                {featured.isLive && (
                  <View style={s.liveBadge}>
                    <Text style={s.liveBadgeText}>LIVE</Text>
                  </View>
                )}
                <Text style={s.featuredTitle}>{featured.title}</Text>
                <Text style={s.featuredSubtitle}>{featured.subtitle}</Text>
              </View>
            </Pressable>

            {/* Browse rows */}
            {browseRows.map((row) => (
              <BrowseRow
                key={row.label}
                row={row}
                onLongPress={longPressContent}
              />
            ))}
          </ScrollView>
        </View>

        {/* ── PAGE 1: LIBRARY ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Library" />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {/* Continue Watching */}
            {continueWatching.length > 0 && (
              <>
                <SectionHeader label="Continue Watching" />
                {continueWatching.map((v) => (
                  <LibraryVideoRow key={v.id} item={v} />
                ))}
              </>
            )}

            {/* Watch History */}
            <SectionHeader label="Watch History" />
            {watchHistory.map((v) => (
              <LibraryVideoRow key={v.id} item={v} />
            ))}

            {/* Saved */}
            <SectionHeader label="Saved" />
            {savedVideos.map((v) => (
              <LibraryVideoRow key={v.id} item={v} />
            ))}

            {/* Playlists */}
            <SectionHeader label="Playlists" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.playlistScroll}
            >
              {playlists.map((pl) => (
                <PlaylistCard key={pl.id} item={pl} />
              ))}
            </ScrollView>

            {/* Downloads */}
            <SectionHeader label="Downloads" />
            {downloads.map((v) => (
              <LibraryVideoRow key={v.id} item={v} />
            ))}

            {/* Your Uploads */}
            <SectionHeader label="Your Uploads" />
            {uploads.map((v) => (
              <LibraryVideoRow key={v.id} item={v} />
            ))}
          </ScrollView>
        </View>

        {/* ── PAGE 2: CHANNELS ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Channels" />
            <FilterPills items={CHANNEL_FILTERS} active={channelFilter} onSelect={setChannelFilter} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <SubscribedRow channels={allChannels} />

            <SectionHeader label="Discover" />
            {channels.map((ch, idx) => (
              <View key={ch.id}>
                {idx > 0 && <View style={s.separator} />}
                <ChannelRow channel={ch} />
              </View>
            ))}
          </ScrollView>
        </View>
      </SwipeablePages>

      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  pageScroll: { flex: 1 },

  topBar: { paddingHorizontal: 16, paddingBottom: 8 },
  topBarTitle: { fontSize: 22, fontWeight: '700', color: C.label },

  filterRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  filterPill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
  },
  filterPillActive: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  filterText: { fontSize: 13, fontWeight: '600', color: C.secondary },
  filterTextActive: { color: '#000000' },

  sectionLabel: {
    fontSize: 16, fontWeight: '700', color: C.label,
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8,
  },

  // Featured banner
  featuredBanner: { marginHorizontal: 16, marginTop: 8, borderRadius: 16, overflow: 'hidden', height: 200 },
  featuredImage: { width: '100%', height: '100%', backgroundColor: C.surface },
  featuredOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: 'rgba(0,0,0,0.55)',
  },
  featuredTitle: { fontSize: 18, fontWeight: '700', color: C.label, marginTop: 4 },
  featuredSubtitle: { fontSize: 13, color: C.secondary, marginTop: 2 },

  // Live badge
  liveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.red, borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  liveBadgeText: { fontSize: 10, fontWeight: '800', color: C.label, letterSpacing: 0.5 },

  // Duration badge
  durationBadge: {
    position: 'absolute', bottom: 4, right: 4,
    backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 3,
    paddingHorizontal: 4, paddingVertical: 1,
  },
  durationText: { fontSize: 10, fontWeight: '600', color: C.label },

  // Browse card
  browseRowContainer: { marginBottom: 4 },
  browseRowScroll: { paddingHorizontal: 16, gap: 12 },
  browseCard: { width: CARD_W },
  thumbContainer: { borderRadius: 10, overflow: 'hidden', position: 'relative' },
  browseThumb: { width: CARD_W, height: CARD_H, backgroundColor: C.surface },
  browseTitle: { fontSize: 13, fontWeight: '600', color: C.label, marginTop: 6 },
  browseMeta: { fontSize: 11, color: C.muted, marginTop: 2 },

  // Library row
  libRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  libThumbContainer: { borderRadius: 8, overflow: 'hidden', position: 'relative' },
  libThumb: { width: 120, height: 68, backgroundColor: C.surface },
  progressBarBg: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 3, backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBarFill: { height: '100%', backgroundColor: C.red },
  libInfo: { flex: 1 },
  libTitle: { fontSize: 13, fontWeight: '600', color: C.label },
  libMeta: { fontSize: 11, color: C.muted, marginTop: 2 },
  libVisibility: { fontSize: 10, fontWeight: '600', color: C.muted, marginTop: 2, textTransform: 'capitalize' },

  // Playlists
  playlistScroll: { paddingHorizontal: 16, gap: 12 },
  playlistCard: { width: 140 },
  playlistThumb: { width: 140, height: 80, borderRadius: 8, backgroundColor: C.surface },
  playlistName: { fontSize: 13, fontWeight: '600', color: C.label, marginTop: 4 },
  playlistCount: { fontSize: 11, color: C.muted },

  // Channels
  subscribedRow: { paddingHorizontal: 16, gap: 16, paddingBottom: 8 },
  subscribedItem: { alignItems: 'center', width: 60 },
  subscribedAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  subscribedInitials: { fontSize: 16, fontWeight: '700', color: C.label },
  subscribedName: { fontSize: 10, color: C.secondary, marginTop: 4, textAlign: 'center' },

  channelRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  channelAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  channelAvatarOrg: { borderRadius: 10 },
  channelInitials: { fontSize: 15, fontWeight: '700', color: C.label },
  channelInfo: { flex: 1 },
  channelName: { fontSize: 14, fontWeight: '700', color: C.label },
  channelMeta: { fontSize: 11, color: C.muted, marginTop: 1 },
  channelDesc: { fontSize: 11, color: C.secondary, marginTop: 2 },
  subBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, backgroundColor: C.blue,
  },
  subBtnActive: {
    backgroundColor: 'transparent',
    borderWidth: 1, borderColor: C.separator,
  },
  subBtnText: { fontSize: 12, fontWeight: '700', color: C.label },
  subBtnTextActive: { color: C.secondary },

  separator: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginHorizontal: 16 },
});
