/**
 * KayTV — Home / Explore / Library via dropdown pill.
 * Home: mode-scoped feed (all brands in mode), subscribed brands first.
 *       Category pills hidden by default, toggled via filter icon.
 * Explore: cross-brand/cross-mode discovery rows.
 * Library: personal history, saved, liked, playlists — mode-agnostic.
 * Personal mode: Owner sees full creator tools; Subscriber sees Videos view.
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
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAppContext } from '@/context/app-context';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import { useDemoRole, MODE_ACCENTS } from '@/utils/demo-role-store';
import {
  getKayTVFeed, getExploreRows, getWatchHistoryFeed, getWatchLaterFeed,
  getLikedVideosFeed, getPlaylists, KAYTV_CATEGORIES,
  formatViewCount, formatVideoTimestamp,
  type KayTVFeedItem, type PlaylistItem,
} from '@/data/mock-kaytv';

type KayTab = 'Home' | 'Explore' | 'Library';

const TOP_BAR_H = 52;
const PILL_ROW_H = 48;

// ── Subscriber filter pills ────────────────────────────────────────────────

const SUB_FILTERS = ['All', 'Public', 'Exclusive'] as const;
type SubFilter = typeof SUB_FILTERS[number];

const SUBSCRIBER_VIDEOS = [
  { id: 'sv1', title: 'Building KaNeXT OS | Ep 1',          views: '4.2K views', duration: '18:32', locked: false },
  { id: 'sv2', title: 'Morning Routine 2026',                views: '8.7K views', duration: '12:15', locked: false },
  { id: 'sv3', title: 'Creator Systems',                     views: '6.1K views', duration: '22:44', locked: false },
  { id: 'sv4', title: 'Subscribers Only: Business Strategy', views: '',           duration: '',      locked: true  },
];

// ── VideoCard — YouTube-style ──────────────────────────────────────────────

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
      {/* 16:9 Thumbnail */}
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
        <Text style={[styles.videoTitle, { color: C.label }]} numberOfLines={2}>
          {video.title}
        </Text>
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

// ── CommunityMemberWatchView ──────────────────────────────────────────────

type WatchCat = 'Sermons' | 'Worship' | 'Teaching' | "Children's" | 'Testimonies';
const COMMUNITY_WATCH_VIDEOS: Record<WatchCat, Array<{ id: string; title: string; speaker: string; date: string; duration: string }>> = {
  Sermons: [
    { id: 'cw1', title: 'The Power of Grace',             speaker: 'Dr. Oladipo Kalejaiye',   date: 'Mar 30, 2026', duration: '47 min' },
    { id: 'cw2', title: 'Walking in Faith',               speaker: 'Dr. Oladipo Kalejaiye',   date: 'Mar 23, 2026', duration: '42 min' },
    { id: 'cw3', title: 'Rooted in Prayer',               speaker: 'Dr. Nonyelum Kalejaiye',  date: 'Mar 16, 2026', duration: '38 min' },
    { id: 'cw4', title: 'The Kingdom Is Now',             speaker: 'Dr. Oladipo Kalejaiye',   date: 'Mar 9, 2026',  duration: '51 min' },
    { id: 'cw5', title: 'Your Healing Is Coming',         speaker: 'Dr. Nonyelum Kalejaiye',  date: 'Mar 2, 2026',  duration: '44 min' },
  ],
  Worship: [
    { id: 'cw6', title: 'Sunday Worship — Mar 30',       speaker: 'ICCLA Worship Team',       date: 'Mar 30, 2026', duration: '28 min' },
    { id: 'cw7', title: 'Praise Night Highlights',       speaker: 'ICCLA Worship Team',       date: 'Mar 21, 2026', duration: '55 min' },
    { id: 'cw8', title: 'Wednesday Worship Set',         speaker: 'ICCLA Worship Team',       date: 'Mar 19, 2026', duration: '22 min' },
  ],
  Teaching: [
    { id: 'cw9',  title: 'Romans 8 — Deep Dive Series', speaker: 'Dr. Oladipo Kalejaiye',    date: 'Apr 2, 2026',  duration: '56 min' },
    { id: 'cw10', title: "Marriage & Family: God's Design", speaker: 'Dr. Nonyelum Kalejaiye', date: 'Mar 25, 2026', duration: '48 min' },
    { id: 'cw11', title: 'Financial Stewardship Pt. 2', speaker: 'Guest Speaker',             date: 'Mar 18, 2026', duration: '39 min' },
  ],
  "Children's": [
    { id: 'cw12', title: "God Loves Me! — Lesson 4",   speaker: "Children's Ministry",       date: 'Mar 30, 2026', duration: '12 min' },
    { id: 'cw13', title: 'Bible Heroes: Daniel',        speaker: "Children's Ministry",       date: 'Mar 23, 2026', duration: '15 min' },
    { id: 'cw14', title: 'Worship with Kids — Easter', speaker: "Children's Ministry",        date: 'Mar 16, 2026', duration: '18 min' },
  ],
  Testimonies: [
    { id: 'cw15', title: 'From Addiction to Purpose',  speaker: 'Michael A.',                date: 'Mar 28, 2026', duration: '8 min' },
    { id: 'cw16', title: 'Answered Prayer: Healing',   speaker: 'Grace O.',                  date: 'Mar 14, 2026', duration: '6 min' },
    { id: 'cw17', title: 'Finding ICCLA Changed My Life', speaker: 'James & Linda F.',       date: 'Feb 28, 2026', duration: '11 min' },
  ],
};
const WATCH_CATS: WatchCat[] = ['Sermons', 'Worship', 'Teaching', "Children's", 'Testimonies'];

function CommunityMemberWatchView({
  C, insets, role, cycleRole, accent, router: nav,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
  accent: string;
  router: ReturnType<typeof useRouter>;
}) {
  const [watchCat, setWatchCat] = React.useState<WatchCat>('Sermons');
  const [bookmarked, setBookmarked] = React.useState<Set<string>>(new Set());
  const topBarH = insets.top + TOP_BAR_H;
  const vids = COMMUNITY_WATCH_VIDEOS[watchCat];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{ paddingTop: insets.top, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, zIndex: 10, backgroundColor: C.bg }}>
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Pressable style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: C.label }}>Watch</Text>
          </View>
          <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary={false} />
        </View>
        {/* Category pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 10, gap: 8, flexDirection: 'row' }}>
          {WATCH_CATS.map(cat => (
            <Pressable
              key={cat}
              onPress={() => { Haptics.selectionAsync(); setWatchCat(cat); }}
              style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: watchCat === cat ? C.label : C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: watchCat === cat ? C.label : C.separator }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: watchCat === cat ? C.bg : C.secondary }}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {vids.map(vid => (
          <Pressable
            key={vid.id}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); nav.push({ pathname: '/(tabs)/(main)/kaytv/player', params: { id: vid.id } } as any); }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: pressed ? C.surfacePressed : 'transparent',
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: C.separator,
            })}
          >
            <View style={{ width: 96, height: 60, borderRadius: 8, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconSymbol name="play.fill" size={22} color={C.secondary} />
              <View style={{ position: 'absolute', bottom: 4, right: 6, backgroundColor: C.label + 'cc', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: C.bg }}>{vid.duration}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, lineHeight: 20, marginBottom: 3 }} numberOfLines={2}>{vid.title}</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>{vid.speaker}</Text>
              <Text style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{vid.date}</Text>
            </View>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setBookmarked(s => { const n = new Set(s); if (n.has(vid.id)) n.delete(vid.id); else n.add(vid.id); return n; }); }}
              hitSlop={8}
              style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
            >
              <IconSymbol name={bookmarked.has(vid.id) ? 'bookmark.fill' : 'bookmark'} size={18} color={bookmarked.has(vid.id) ? C.label : C.secondary} />
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// ── SubscriberVideoCard ────────────────────────────────────────────────────

function SubscriberVideoCard({
  video, C,
}: {
  video: typeof SUBSCRIBER_VIDEOS[number];
  C: ComponentColors;
}) {
  return (
    <Pressable
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      style={({ pressed }) => [
        styles.subVideoCard,
        { backgroundColor: C.surface, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      {/* Thumbnail area */}
      <View style={[styles.subVideoThumb, { backgroundColor: C.separator }]}>
        <IconSymbol name="play.fill" size={24} color={C.secondary} />
        {video.locked && (
          <View style={styles.subVideoLockOverlay}>
            <IconSymbol name="lock.fill" size={20} color="#fff" />
          </View>
        )}
      </View>
      {/* Info row */}
      <View style={styles.subVideoInfo}>
        <Text style={[styles.subVideoTitle, { color: C.label }]} numberOfLines={2}>
          {video.title}
        </Text>
        {video.locked ? (
          <Text style={[styles.subVideoMeta, { color: C.secondary }]}>Subscribe to watch</Text>
        ) : (
          <Text style={[styles.subVideoMeta, { color: C.secondary }]}>
            {video.views}  ·  {video.duration}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

// ── KayTV role keys per mode ──────────────────────────────────────────────
const KAYTV_ROLE_KEYS: Record<string, string> = {
  sports:    'sports',
  education: 'education',
  community: 'community',
  business:  'business',
  personal:  'personal:kaytv',
};

// Admin role labels per mode
const KAYTV_ADMIN_LABELS: Record<string, { header: string; tools: string[] }> = {
  sports:    { header: 'Film Library',         tools: ['Practice Film', 'Game Film', 'Opponent Film', 'Custom Playlists', 'Intelligence Overlay'] },
  education: { header: 'Content Management',   tools: ['Upload Video', 'Manage Library', 'Organize Playlists', 'Gate Content', 'Schedule Live Stream'] },
  community: { header: 'Sermon & Media Hub',   tools: ['Upload Sermon', 'Manage Library', 'Manage Access', 'Schedule Live Stream', 'Organize Series'] },
  business:  { header: 'Internal Content Hub', tools: ['Investor Updates', 'Internal Training', 'Demo Library', 'Sales Enablement', 'All-Hands Recordings'] },
  personal:  { header: 'My Content',           tools: ['Upload Video', 'Manage Channel', 'Analytics', 'Schedule Post'] },
};


// ── Community Pastor Media View ───────────────────────────────────────────────

type MediaTab = 'Library' | 'Upload' | 'Schedule' | 'Live' | 'Analytics';

const MEDIA_LIBRARY = [
  { id: 'ml1', title: 'Easter Sunday Message — "He Is Risen"',  speaker: 'Dr. Oladipo Kalejaiye', date: 'Apr 20',  views: 1247, duration: '52:18', category: 'Sermons',    visibility: 'Public' },
  { id: 'ml2', title: 'Wednesday Bible Study — Romans 8',        speaker: 'Pastor Nonyelum',       date: 'Apr 16',  views: 312,  duration: '44:02', category: 'Teaching',   visibility: 'Members' },
  { id: 'ml3', title: 'Worship Night Highlights',                 speaker: 'ICCLA Worship Team',    date: 'Apr 13',  views: 892,  duration: '18:44', category: 'Worship',    visibility: 'Public' },
  { id: 'ml4', title: 'Children\'s Ministry — Easter Story',      speaker: 'Sis. Naomi Wright',     date: 'Apr 20',  views: 438,  duration: '22:10', category: 'Children\'s', visibility: 'Public' },
  { id: 'ml5', title: 'Marriage Enrichment Week 3',               speaker: 'Drs. Kalejaiye',         date: 'Apr 9',   views: 214,  duration: '61:33', category: 'Teaching',   visibility: 'Members' },
];

function CommunityPastorMediaView({
  C, insets, role, cycleRole,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
}) {
  const [mediaTab, setMediaTab] = useState<MediaTab>('Library');
  const [mediaDrop, setMediaDrop] = useState(false);
  const topBarH = insets.top + 52;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top Bar */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, height: topBarH, paddingTop: insets.top, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
        </Pressable>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMediaDrop(v => !v); }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{mediaTab}</Text>
          <IconSymbol name={mediaDrop ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary} />
        </Pressable>
        <View style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <RolePill role={role} onPress={cycleRole} isPrimary />
        </View>
      </View>

      {/* Dropdown */}
      {mediaDrop && (
        <View style={{ position: 'absolute', top: topBarH + 4, left: '14%', right: '14%', backgroundColor: C.surface, borderRadius: 14, zIndex: 100, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8, overflow: 'hidden' }}>
          {(['Library', 'Upload', 'Schedule', 'Live', 'Analytics'] as MediaTab[]).map((tab, i, arr) => (
            <Pressable key={tab} onPress={() => { Haptics.selectionAsync(); setMediaTab(tab); setMediaDrop(false); }} style={{ paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
              <Text style={{ fontSize: 15, color: tab === mediaTab ? C.label : C.secondary, fontWeight: tab === mediaTab ? '600' : '400' }}>{tab}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <ScrollView style={{ flex: 1, marginTop: topBarH }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}>

        {/* LIBRARY */}
        {mediaTab === 'Library' && (
          <>
            <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 8 }}>
              {(['All', 'Sermons', 'Worship', 'Teaching', "Children's"] as const).map(cat => (
                <Pressable key={cat} onPress={() => Haptics.selectionAsync()} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: cat === 'All' ? C.label : C.surfacePressed }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: cat === 'All' ? C.bg : C.secondary }}>{cat}</Text>
                </Pressable>
              ))}
            </View>
            {MEDIA_LIBRARY.map(video => (
              <Pressable key={video.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: pressed ? C.surfacePressed : 'transparent' })}>
                <View style={{ width: 80, height: 52, borderRadius: 8, backgroundColor: C.surfacePressed, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconSymbol name="play.fill" size={18} color={C.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, marginBottom: 2 }} numberOfLines={2}>{video.title}</Text>
                  <Text style={{ fontSize: 11, color: C.secondary }}>{video.speaker}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}>
                    <Text style={{ fontSize: 11, color: C.muted }}>{video.duration}</Text>
                    <Text style={{ fontSize: 11, color: C.muted }}>·</Text>
                    <Text style={{ fontSize: 11, color: C.muted }}>{video.views.toLocaleString()} views</Text>
                    <View style={{ paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5, backgroundColor: video.visibility === 'Public' ? '#5A8A6E22' : C.surfacePressed }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: video.visibility === 'Public' ? '#5A8A6E' : C.secondary }}>{video.visibility}</Text>
                    </View>
                  </View>
                </View>
                <IconSymbol name="ellipsis" size={16} color={C.secondary} />
              </Pressable>
            ))}
          </>
        )}

        {/* UPLOAD */}
        {mediaTab === 'Upload' && (
          <View style={{ paddingHorizontal: 16 }}>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={({ pressed }) => ({ backgroundColor: pressed ? '#0a0a0a' : '#1A1714', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 })}>
              <IconSymbol name="arrow.up.to.line" size={32} color="#fff" />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 12, marginBottom: 4 }}>Upload Video</Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>Select from device or record directly</Text>
            </Pressable>
            {[
              { label: 'Title', placeholder: 'e.g. Sunday Message — April 20' },
              { label: 'Speaker / Leader', placeholder: 'e.g. Dr. Oladipo Kalejaiye' },
            ].map(field => (
              <View key={field.label} style={{ marginBottom: 14 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>{field.label}</Text>
                <View style={{ backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
                  <Text style={{ fontSize: 14, color: C.muted }}>{field.placeholder}</Text>
                </View>
              </View>
            ))}
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Category</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {['Sermons', 'Teaching', 'Worship', "Children's", 'Testimonies', 'Events'].map(cat => (
                <Pressable key={cat} onPress={() => Haptics.selectionAsync()} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: cat === 'Sermons' ? C.label : C.surfacePressed }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: cat === 'Sermons' ? C.bg : C.secondary }}>{cat}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Visibility</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
              {['Public', 'Members Only', 'Leadership'].map(v => (
                <Pressable key={v} onPress={() => Haptics.selectionAsync()} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: v === 'Public' ? C.label : C.surfacePressed }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: v === 'Public' ? C.bg : C.secondary }}>{v}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={({ pressed }) => ({ backgroundColor: pressed ? '#0a0a0a' : '#1A1714', borderRadius: 14, paddingVertical: 14, alignItems: 'center' })}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Publish Video</Text>
            </Pressable>
          </View>
        )}

        {/* SCHEDULE */}
        {mediaTab === 'Schedule' && (
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>SCHEDULED RELEASES</Text>
            {[
              { title: 'Easter Message Full Recording', date: 'Apr 21 · 9:00 AM', type: 'Video' },
              { title: 'Marriage Enrichment Week 4', date: 'Apr 23 · 7:00 PM', type: 'Video' },
              { title: 'Sunday Worship Live Stream', date: 'Apr 27 · 10:00 AM', type: 'Live' },
            ].map((item, i) => (
              <View key={i} style={{ backgroundColor: C.surface, borderRadius: 14, marginBottom: 10, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: C.surfacePressed, alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name={item.type === 'Live' ? 'dot.radiowaves.left.and.right' : 'video.fill'} size={16} color={C.label} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={1}>{item.title}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{item.date}</Text>
                </View>
                {item.type === 'Live' && (
                  <View style={{ paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, backgroundColor: '#B85C5C22' }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#B85C5C' }}>LIVE</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* LIVE */}
        {mediaTab === 'Live' && (
          <View style={{ paddingHorizontal: 16, alignItems: 'center' }}>
            <View style={{ width: '100%', backgroundColor: '#1A1714', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20 }}>
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#B85C5C22', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <IconSymbol name="dot.radiowaves.left.and.right" size={28} color="#B85C5C" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 8 }}>Go Live</Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 19, marginBottom: 20 }}>Stream your Sunday service, Bible study, or special event directly to your congregation.</Text>
              <Pressable onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)} style={({ pressed }) => ({ backgroundColor: pressed ? '#cc4040' : '#B85C5C', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40, alignItems: 'center' })}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Start Stream</Text>
              </Pressable>
            </View>
            {[{ label: 'Title', ph: 'e.g. Sunday Worship Service' }, { label: 'Chat', ph: 'Enabled' }].map(f => (
              <View key={f.label} style={{ width: '100%', marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>{f.label}</Text>
                <View style={{ backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
                  <Text style={{ fontSize: 14, color: C.muted }}>{f.ph}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ANALYTICS */}
        {mediaTab === 'Analytics' && (
          <View style={{ paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {[{ label: 'Total Views', value: '18.4K' }, { label: 'Watch Hours', value: '1,247' }, { label: 'Subscribers', value: '892' }].map(s => (
                <View key={s.label} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: C.label }}>{s.value}</Text>
                  <Text style={{ fontSize: 10, color: C.secondary, textAlign: 'center', marginTop: 2 }}>{s.label}</Text>
                </View>
              ))}
            </View>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>TOP VIDEOS</Text>
            {MEDIA_LIBRARY.slice(0, 4).map((v, i) => (
              <View key={v.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, marginBottom: 8, padding: 12, gap: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: C.muted, width: 20 }}>{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }} numberOfLines={1}>{v.title}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{v.views.toLocaleString()} views · {v.duration}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

export default function KayTVScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAppContext();
  const mode = state.activeContext?.mode ?? state.mode ?? 'business';

  const roleKey = KAYTV_ROLE_KEYS[mode] ?? 'business';
  const [role, cycleRole, roleCycles] = useDemoRole(roleKey);
  const isOwner = role === roleCycles[0];
  const accent  = MODE_ACCENTS[mode] ?? C.accent;

  // Personal subscriber filter state
  const [subFilter, setSubFilter] = useState<SubFilter>('All');

  const [activeTab, setActiveTab] = useState<KayTab>('Home');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterPillsVisible, setFilterPillsVisible] = useState(false);
  const pillsRevealAnim = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);

  const canUpload = isOwner && mode !== 'personal';
  const categories = KAYTV_CATEGORIES[mode] ?? KAYTV_CATEGORIES.sports;

  const topBarH = insets.top + TOP_BAR_H;
  const contentTop = topBarH + (filterPillsVisible ? PILL_ROW_H : 0);

  // Reset filter state whenever mode changes
  useEffect(() => {
    setSelectedCategory('All');
    setFilterPillsVisible(false);
    pillsRevealAnim.setValue(0);
    setSubFilter('All');
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

  // ── Personal Subscriber "Videos" view ─────────────────────────────────
  if (mode === 'personal' && !isOwner) {
    return (
      <View style={[styles.screen, { backgroundColor: C.bg }]}>
        {/* Top bar */}
        <View style={[styles.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
          <View style={styles.topBar}>
            {/* Left: hamburger */}
            <View style={styles.topBarSide}>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
                hitSlop={8}
              >
                <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
              </Pressable>
            </View>
            {/* Center: plain "Videos" title */}
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: C.label }}>Videos</Text>
            </View>
            {/* Right: RolePill */}
            <View style={[styles.topBarSide, { alignItems: 'flex-end' }]}>
              <RolePill
                role={role}
                onPress={cycleRole}
                accentColor={accent}
                isPrimary={false}
              />
            </View>
          </View>
        </View>

        <ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: topBarH + 12, paddingBottom: 120 }}
        >
          {/* Filter pills row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}
            style={{ marginBottom: 16 }}
          >
            {SUB_FILTERS.map(f => {
              const isExclusive = f === 'Exclusive';
              const active = subFilter === f && !isExclusive;
              return (
                <Pressable
                  key={f}
                  onPress={() => {
                    if (!isExclusive) {
                      Haptics.selectionAsync();
                      setSubFilter(f);
                    }
                  }}
                  style={[
                    styles.subFilterPill,
                    active
                      ? { backgroundColor: C.label, borderColor: C.label }
                      : { borderColor: C.separator },
                    isExclusive && { opacity: 0.45 },
                  ]}
                >
                  {isExclusive && (
                    <IconSymbol
                      name="lock.fill"
                      size={11}
                      color={active ? C.bg : C.secondary}
                      style={{ marginRight: 4 }}
                    />
                  )}
                  <Text style={[
                    styles.subFilterPillText,
                    { color: active ? C.bg : C.secondary },
                  ]}>
                    {f}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Video cards */}
          {SUBSCRIBER_VIDEOS.map(video => (
            <SubscriberVideoCard key={video.id} video={video} C={C} />
          ))}
        </ScrollView>
      </View>
    );
  }

  // ── Community Pastor: Media management view ───────────────────────────────
  if (mode === 'community' && isOwner) {
    return (
      <CommunityPastorMediaView
        C={C}
        insets={insets}
        role={role}
        cycleRole={cycleRole}
      />
    );
  }

  // ── Community Member: simplified Watch view ──────────────────────────────
  if (mode === 'community' && !isOwner) {
    return (
      <CommunityMemberWatchView
        C={C}
        insets={insets}
        role={role}
        cycleRole={cycleRole}
        accent={accent}
        router={router}
      />
    );
  }

  // ── Owner / non-personal modes: full existing screen ──────────────────
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
          ListHeaderComponent={
            isOwner ? (
              <View style={{ marginHorizontal: 12, marginTop: 12, marginBottom: 4, backgroundColor: accent + '12', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: accent + '30' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <IconSymbol name="play.rectangle.fill" size={16} color={accent} />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: accent }}>{KAYTV_ADMIN_LABELS[mode]?.header ?? 'Content Tools'}</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                  {(KAYTV_ADMIN_LABELS[mode]?.tools ?? []).map(tool => (
                    <Pressable
                      key={tool}
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: accent + '20', borderWidth: 1, borderColor: accent + '40' }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: accent }}>{tool}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <View style={{ marginHorizontal: 12, marginTop: 12, marginBottom: 4, backgroundColor: C.surface, borderRadius: 14, padding: 14 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 4 }}>
                  {mode === 'sports' ? 'Watch Live & Highlights' :
                   mode === 'education' ? 'Lectures & Campus Content' :
                   mode === 'community' ? 'Sermons & Teaching Series' :
                   mode === 'business' ? 'Demos & Tutorials' : 'Browse Content'}
                </Text>
                <Text style={{ fontSize: 12, color: C.secondary }}>
                  {mode === 'sports' ? 'Game broadcasts, highlight reels & podcasts' :
                   mode === 'education' ? 'Course videos, campus updates & public library' :
                   mode === 'community' ? "Worship, devotionals & children's content" :
                   mode === 'business' ? 'Product demos, onboarding & public content' : 'Discover and enjoy content'}
                </Text>
              </View>
            )
          }
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
          {/* Left: hamburger */}
          <View style={styles.topBarSide}>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
              hitSlop={8}
            >
              <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
            </Pressable>
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

          {/* Right: RolePill + filter icon */}
          <View style={[styles.topBarSide, { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', gap: 8, width: 'auto' as any }]}>
            <RolePill
              role={role}
              onPress={cycleRole}
              accentColor={accent}
              isPrimary={isOwner}
            />
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

        {/* Category pills — toggled via filter icon */}
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
                    active ? { backgroundColor: C.activePill } : { borderColor: C.separator },
                  ]}
                  onPress={() => handleCategorySelect(cat)}
                >
                  <Text style={[
                    styles.pillText,
                    { color: active ? C.activePillText : C.secondary },
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

      {/* ── Upload FAB (owners only, non-personal) ── */}
      {canUpload && (
        <Pressable
          style={[styles.fab, { bottom: insets.bottom + 49 + 16 + 56, backgroundColor: C.label }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/(tabs)/(main)/kaytv/upload' as any);
          }}
        >
          <IconSymbol name="plus" size={20} color={C.bg} />
        </Pressable>
      )}

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
  topBarSide: { width: 72, justifyContent: 'center' },

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

  // Category pills
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

  // Subscriber video cards
  subVideoCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  subVideoThumb: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subVideoLockOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subVideoInfo: { padding: 10 },
  subVideoTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  subVideoMeta: { fontSize: 12 },

  // Subscriber filter pills
  subFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  subFilterPillText: { fontSize: 13 },

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
