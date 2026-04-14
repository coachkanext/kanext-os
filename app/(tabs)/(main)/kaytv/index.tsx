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
  View, Text, Pressable, FlatList, ScrollView, TextInput,
  StyleSheet, useWindowDimensions, Animated, Image,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Redirect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAppContext } from '@/context/app-context';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import { useDemoRole, MODE_ACCENTS } from '@/utils/demo-role-store';
import { useDataMode } from '@/utils/global-demo-mode';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import {
  getKayTVFeed, getExploreRows, getWatchHistoryFeed, getWatchLaterFeed,
  getLikedVideosFeed, getPlaylists, KAYTV_CATEGORIES,
  formatViewCount, formatVideoTimestamp,
  type KayTVFeedItem, type PlaylistItem,
} from '@/data/mock-kaytv';
import { BottomSheet } from '@/components/ui/bottom-sheet';

type KayTab = 'Home' | 'Explore' | 'Library';

const TOP_BAR_H = 52;
const PILL_ROW_H = 48;

const CAUTION = '#B8943E';

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
          {video.thumbUri ? (
            <Image source={{ uri: video.thumbUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <Text style={styles.thumbEmoji}>{video.thumbEmoji}</Text>
          )}
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
        {video.thumbUri ? (
          <Image source={{ uri: video.thumbUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <Text style={styles.exploreEmoji}>{video.thumbEmoji}</Text>
        )}
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
  const COMM_PILL_H = 50;
  const vids = COMMUNITY_WATCH_VIDEOS[watchCat];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={{ paddingTop: insets.top, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, backgroundColor: C.bg }}>
          <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
            <Pressable style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
              <KMenuButton />
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


// ── EducationPresidentMediaView ───────────────────────────────────────────────

type EduMediaTab = 'Library' | 'Upload' | 'Schedule' | 'Analytics';

const EDU_MEDIA_LIBRARY = [
  { id: 'em1', title: 'BUS 401: Strategic Management — Week 8',          category: 'Lectures',        creator: 'Dr. Angela Ross',  views: 234,  duration: '52 min',   visibility: 'Course Only' },
  { id: 'em2', title: 'MBA Info Night Spring 2026',                       category: 'Promo',           creator: 'Admissions',       views: 1847, duration: '38 min',   visibility: 'Public'      },
  { id: 'em3', title: 'Spring 2026 Commencement Highlights',              category: 'Commencement',    creator: 'Media Team',       views: 3241, duration: '1h 12min', visibility: 'Public'      },
  { id: 'em4', title: 'Lincoln University Virtual Tour',                  category: 'Virtual Tours',   creator: 'Marketing',        views: 892,  duration: '18 min',   visibility: 'Public'      },
  { id: 'em5', title: 'MBA 520: Finance Week 5 Lecture',                  category: 'Lectures',        creator: 'Prof. James Okafor', views: 187, duration: '48 min', visibility: 'Course Only' },
];

const EDU_LIB_CATS = ['All', 'Lectures', 'Campus Events', 'Commencement', 'Athletics', 'Promo', 'Virtual Tours'] as const;

function EducationPresidentMediaView({
  C, insets, role, cycleRole, accent,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
  accent: string;
}) {
  const [mediaTab, setMediaTab] = useState<EduMediaTab>('Library');
  const [mediaDrop, setMediaDrop] = useState(false);
  const [libCat, setLibCat] = useState('All');
  const [uploadCat, setUploadCat] = useState('Lectures');
  const [uploadVis, setUploadVis] = useState('Public');
  const topBarH = insets.top + 52;

  const { opacity: eduPresTY, onScroll: eduPresOS, scrollEventThrottle: eduPresET } = useScrollHeader(topBarH);
  const visibleVideos = libCat === 'All' ? EDU_MEDIA_LIBRARY : EDU_MEDIA_LIBRARY.filter(v => v.category === libCat);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top Bar */}
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, height: topBarH, paddingTop: insets.top, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, opacity: eduPresTY }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, flex: 1 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
            <KMenuButton />
          </Pressable>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMediaDrop(v => !v); }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{mediaTab}</Text>
            <IconSymbol name={mediaDrop ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary} />
          </Pressable>
          <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary />
        </View>
      </Animated.View>

      {/* Dropdown */}
      {mediaDrop && (
        <View style={{ position: 'absolute', top: topBarH + 4, left: '14%', right: '14%', backgroundColor: C.surface, borderRadius: 14, zIndex: 100, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8, overflow: 'hidden' }}>
          {(['Library', 'Upload', 'Schedule', 'Analytics'] as EduMediaTab[]).map((tab, i, arr) => (
            <Pressable key={tab} onPress={() => { Haptics.selectionAsync(); setMediaTab(tab); setMediaDrop(false); }} style={{ paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
              <Text style={{ fontSize: 15, color: tab === mediaTab ? C.label : C.secondary, fontWeight: tab === mediaTab ? '600' : '400' }}>{tab}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} onScroll={eduPresOS} scrollEventThrottle={eduPresET} contentContainerStyle={{ paddingTop: topBarH + 16, paddingBottom: 120 }}>

        {/* LIBRARY */}
        {mediaTab === 'Library' && (
          <>
            {/* Category filter pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8, flexDirection: 'row' }}>
              {EDU_LIB_CATS.map(cat => (
                <Pressable key={cat} onPress={() => { Haptics.selectionAsync(); setLibCat(cat); }} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: libCat === cat ? C.label : C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: libCat === cat ? C.label : C.separator }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: libCat === cat ? C.bg : C.secondary }}>{cat}</Text>
                </Pressable>
              ))}
            </ScrollView>
            {visibleVideos.map(video => (
              <Pressable key={video.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: pressed ? C.surfacePressed : 'transparent' })}>
                <View style={{ width: 80, height: 52, borderRadius: 8, backgroundColor: C.surfacePressed, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconSymbol name="play.fill" size={18} color={C.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, marginBottom: 2 }} numberOfLines={2}>{video.title}</Text>
                  <Text style={{ fontSize: 11, color: C.secondary }}>{video.creator}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                    <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, backgroundColor: C.surfacePressed }}>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: C.secondary }}>{video.category}</Text>
                    </View>
                    <Text style={{ fontSize: 11, color: C.muted }}>{video.views.toLocaleString()} views</Text>
                    <Text style={{ fontSize: 11, color: C.muted }}>·</Text>
                    <Text style={{ fontSize: 11, color: C.muted }}>{video.duration}</Text>
                    <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, backgroundColor: video.visibility === 'Public' ? C.label : C.surface, borderWidth: video.visibility === 'Public' ? 0 : StyleSheet.hairlineWidth, borderColor: C.separator }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: video.visibility === 'Public' ? C.bg : C.secondary }}>{video.visibility}</Text>
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
            {/* Upload action cards */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={({ pressed }) => ({ flex: 1, backgroundColor: pressed ? '#0a0a0a' : C.label, borderRadius: 14, padding: 20, alignItems: 'center', gap: 8 })}>
                <IconSymbol name="arrow.up.to.line" size={26} color={C.bg} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Upload from Device</Text>
              </Pressable>
              <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={({ pressed }) => ({ flex: 1, backgroundColor: pressed ? '#0a0a0a' : C.label, borderRadius: 14, padding: 20, alignItems: 'center', gap: 8 })}>
                <IconSymbol name="video.fill" size={26} color={C.bg} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Record Video</Text>
              </Pressable>
            </View>
            {/* Title field */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Title</Text>
              <View style={{ backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
                <Text style={{ fontSize: 14, color: C.muted }}>e.g. BUS 401 — Week 9 Lecture</Text>
              </View>
            </View>
            {/* Description field */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Description</Text>
              <View style={{ backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, minHeight: 72, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
                <Text style={{ fontSize: 14, color: C.muted }}>Brief description of the content…</Text>
              </View>
            </View>
            {/* Category */}
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 14, flexDirection: 'row' }}>
              {(['Lectures', 'Campus Events', 'Commencement', 'Athletics', 'Promo', 'Virtual Tours'] as const).map(cat => (
                <Pressable key={cat} onPress={() => { Haptics.selectionAsync(); setUploadCat(cat); }} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: uploadCat === cat ? C.label : C.surfacePressed }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: uploadCat === cat ? C.bg : C.secondary }}>{cat}</Text>
                </Pressable>
              ))}
            </ScrollView>
            {/* Course Link */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Course Link <Text style={{ fontWeight: '400', color: C.muted }}>(optional)</Text></Text>
              <View style={{ backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
                <Text style={{ fontSize: 14, color: C.muted }}>Link to course</Text>
              </View>
            </View>
            {/* Visibility */}
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Visibility</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {(['Public', 'Campus', 'Course-Specific'] as const).map(v => (
                <Pressable key={v} onPress={() => { Haptics.selectionAsync(); setUploadVis(v); }} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: uploadVis === v ? C.label : C.surfacePressed }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: uploadVis === v ? C.bg : C.secondary }}>{v}</Text>
                </Pressable>
              ))}
            </View>
            {/* Schedule Publish Date */}
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
              <IconSymbol name="calendar" size={18} color={C.secondary} />
              <Text style={{ fontSize: 14, color: C.muted }}>Schedule Publish Date</Text>
            </Pressable>
            {/* Publish Now */}
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={({ pressed }) => ({ backgroundColor: pressed ? '#0a0a0a' : C.label, borderRadius: 14, paddingVertical: 14, alignItems: 'center' })}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>Publish Now</Text>
            </Pressable>
          </View>
        )}

        {/* SCHEDULE */}
        {mediaTab === 'Schedule' && (
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>SCHEDULED RELEASES</Text>
            {[
              { title: 'MBA 520 Week 9 Lecture',                                     date: 'Apr 10, 2026', time: '8:00 PM',  visibility: 'Course Only' },
              { title: 'Spring Commencement Live Stream',                             date: 'Jun 20, 2026', time: '10:00 AM', visibility: 'Public'      },
              { title: 'Guest Lecture: Dr. Maria Santos — International Business',   date: 'May 8, 2026',  time: '6:00 PM',  visibility: 'Campus'      },
            ].map((item, i) => (
              <View key={i} style={{ backgroundColor: C.surface, borderRadius: 14, marginBottom: 10, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: C.surfacePressed, alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name="video.fill" size={16} color={C.label} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={2}>{item.title}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{item.date} · {item.time}</Text>
                </View>
                <View style={{ paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, backgroundColor: C.surfacePressed }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: C.secondary }}>{item.visibility}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ANALYTICS */}
        {mediaTab === 'Analytics' && (
          <View style={{ paddingHorizontal: 16 }}>
            {/* KPI cards */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {[{ label: 'Total Views', value: '8,401' }, { label: 'Watch Hours', value: '2,847 hrs' }, { label: 'Avg Completion', value: '61%' }].map(s => (
                <View key={s.label} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: C.label }}>{s.value}</Text>
                  <Text style={{ fontSize: 10, color: C.secondary, textAlign: 'center', marginTop: 2 }}>{s.label}</Text>
                </View>
              ))}
            </View>
            {/* By Category */}
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>BY CATEGORY</Text>
            {[
              { cat: 'Lectures',      views: 4291, completion: '58%' },
              { cat: 'Campus Events', views: 2103, completion: '71%' },
              { cat: 'Commencement',  views: 3241, completion: '89%' },
              { cat: 'Promo',         views: 1847, completion: '44%' },
            ].map(row => (
              <View key={row.cat} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, marginBottom: 8, padding: 12, gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{row.cat}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{row.views.toLocaleString()} views</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{row.completion}</Text>
                <Text style={{ fontSize: 11, color: C.muted }}>completion</Text>
              </View>
            ))}
            {/* Top Lectures */}
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8, marginBottom: 10 }}>TOP LECTURES</Text>
            {EDU_MEDIA_LIBRARY.filter(v => v.category === 'Lectures').slice(0, 3).map((v, i) => (
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

// ── EducationStudentWatchView ─────────────────────────────────────────────────

type WatchTab = 'Lectures' | 'Campus' | 'Athletics' | 'Student Life';

const COURSE_LECTURES = [
  { id: 'el1', title: 'BUS 401 — Week 8: Competitive Dynamics',   instructor: 'Dr. Angela Ross',  duration: '52 min', progress: 0.45, resumeAt: '23:12', status: 'in-progress' as const },
  { id: 'el2', title: 'MKT 350 — Week 7: Decision-Making Models', instructor: 'Prof. Chen',        duration: '47 min', progress: 0,    resumeAt: '',      status: 'not-started' as const },
  { id: 'el3', title: 'MBA 520 — Week 5: Cash Flow Analysis',     instructor: 'Prof. Okafor',      duration: '48 min', progress: 1,    resumeAt: '',      status: 'completed'   as const },
  { id: 'el4', title: 'MBA 510 — Week 6: Leadership in Crisis',   instructor: 'Dr. Williams',      duration: '44 min', progress: 0.12, resumeAt: '',      status: 'in-progress' as const },
];

const CAMPUS_VIDEOS = [
  { id: 'cv1', emoji: '🎓', title: 'MBA Networking Mixer Recap',    date: 'Mar 28, 2026', duration: '22 min' },
  { id: 'cv2', emoji: '🏛️', title: 'Spring Convocation 2026',       date: 'Mar 15, 2026', duration: '1h 8min' },
  { id: 'cv3', emoji: '💼', title: 'Campus Career Fair 2026',       date: 'Mar 5, 2026',  duration: '34 min' },
];

const ATHLETICS_VIDEOS = [
  { id: 'av1', emoji: '🏀', title: 'Oakland Oaklanders Basketball Highlights — Mar 2026', date: 'Mar 31, 2026', duration: '18 min' },
  { id: 'av2', emoji: '⚽', title: 'Intramural Soccer Championship',                      date: 'Mar 20, 2026', duration: '42 min' },
];

const STUDENT_LIFE_VIDEOS = [
  { id: 'sl1', emoji: '🏠', title: 'Dorm Life at Lincoln University',           date: 'Mar 10, 2026', duration: '11 min' },
  { id: 'sl2', emoji: '🎙️', title: 'Student Council President Interview',       date: 'Feb 28, 2026', duration: '24 min' },
  { id: 'sl3', emoji: '✈️', title: 'Study Abroad: Business in Tokyo',           date: 'Feb 14, 2026', duration: '31 min' },
];

const WATCH_TABS: WatchTab[] = ['Lectures', 'Campus', 'Athletics', 'Student Life'];
const SPEED_OPTIONS = [1, 1.25, 1.5, 2] as const;
type SpeedOption = typeof SPEED_OPTIONS[number];

function EducationStudentWatchView({
  C, insets, role, cycleRole,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
}) {
  const [watchTab, setWatchTab] = useState<WatchTab>('Lectures');
  const [watchDrop, setWatchDrop] = useState(false);
  const [speed, setSpeed] = useState<SpeedOption>(1);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const topBarH = insets.top + 52;

  const { opacity: eduStudTY, onScroll: eduStudOS, scrollEventThrottle: eduStudET } = useScrollHeader(topBarH);
  const toggleBookmark = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBookmarked(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top Bar */}
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, height: topBarH, paddingTop: insets.top, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, opacity: eduStudTY }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, flex: 1 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
            <KMenuButton />
          </Pressable>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setWatchDrop(v => !v); }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{watchTab}</Text>
            <IconSymbol name={watchDrop ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary} />
          </Pressable>
          <RolePill role={role} onPress={cycleRole} isPrimary={false} />
        </View>
      </Animated.View>
      {/* Dropdown */}
      {watchDrop && (
        <View style={{ position: 'absolute', top: topBarH + 4, left: '14%', right: '14%', backgroundColor: C.surface, borderRadius: 14, zIndex: 100, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8, overflow: 'hidden' }}>
          {WATCH_TABS.map((tab, i, arr) => (
            <Pressable key={tab} onPress={() => { Haptics.selectionAsync(); setWatchTab(tab); setWatchDrop(false); }} style={{ paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
              <Text style={{ fontSize: 15, color: tab === watchTab ? C.label : C.secondary, fontWeight: tab === watchTab ? '600' : '400' }}>{tab}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} onScroll={eduStudOS} scrollEventThrottle={eduStudET} contentContainerStyle={{ paddingTop: topBarH + 16, paddingBottom: 120 }}>
        {/* LECTURES */}
        {watchTab === 'Lectures' && (
          <>
            {/* Section header */}
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginHorizontal: 16, marginBottom: 12 }}>MY COURSE LECTURES</Text>
            {/* Speed control */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 14 }}>
              <Text style={{ fontSize: 12, color: C.secondary, marginRight: 4 }}>Speed:</Text>
              {SPEED_OPTIONS.map(s => (
                <Pressable key={s} onPress={() => { Haptics.selectionAsync(); setSpeed(s); }} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: speed === s ? C.label : C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: speed === s ? C.label : C.separator }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: speed === s ? C.bg : C.secondary }}>{s}×</Text>
                </Pressable>
              ))}
            </View>
            {/* Lecture cards */}
            {COURSE_LECTURES.map(vid => (
              <View key={vid.id} style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: C.surface, borderRadius: 14, padding: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, lineHeight: 20, marginBottom: 2 }} numberOfLines={2}>{vid.title}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{vid.instructor} · {vid.duration}</Text>
                  </View>
                  <Pressable onPress={() => toggleBookmark(vid.id)} hitSlop={8} style={{ width: 34, height: 34, alignItems: 'center', justifyContent: 'center' }}>
                    <IconSymbol name={bookmarked.has(vid.id) ? 'bookmark.fill' : 'bookmark'} size={18} color={bookmarked.has(vid.id) ? C.label : C.secondary} />
                  </Pressable>
                </View>
                {/* Progress / status */}
                {vid.status === 'completed' ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
                    <IconSymbol name="checkmark.circle.fill" size={16} color="#5A8A6E" />
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#5A8A6E' }}>Completed</Text>
                  </View>
                ) : vid.status === 'not-started' ? (
                  <View style={{ marginTop: 10 }}>
                    <View style={{ height: 3, borderRadius: 2, backgroundColor: C.separator }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <Text style={{ fontSize: 12, color: C.muted }}>Not started</Text>
                      <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: C.label }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: C.bg }}>Play</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View style={{ marginTop: 10 }}>
                    <View style={{ height: 3, borderRadius: 2, backgroundColor: C.separator, overflow: 'hidden' }}>
                      <View style={{ width: `${Math.round(vid.progress * 100)}%`, height: '100%', backgroundColor: C.label, borderRadius: 2 }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <Text style={{ fontSize: 12, color: C.secondary }}>{Math.round(vid.progress * 100)}% watched</Text>
                      {vid.resumeAt ? (
                        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: C.label }}>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: C.bg }}>Resume {vid.resumeAt}</Text>
                        </Pressable>
                      ) : (
                        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: C.label }}>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: C.bg }}>Resume</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* CAMPUS */}
        {watchTab === 'Campus' && (
          <View style={{ paddingHorizontal: 16 }}>
            {CAMPUS_VIDEOS.map(vid => (
              <Pressable key={vid.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={({ pressed }) => ({ backgroundColor: pressed ? C.surfacePressed : C.surface, borderRadius: 14, marginBottom: 12, overflow: 'hidden' })}>
                <View style={{ height: 110, backgroundColor: C.surfacePressed, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 36 }}>{vid.emoji}</Text>
                  <View style={{ position: 'absolute', bottom: 8, right: 10, backgroundColor: C.label + 'cc', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: C.bg }}>{vid.duration}</Text>
                  </View>
                </View>
                <View style={{ padding: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={2}>{vid.title}</Text>
                  <Text style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{vid.date}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* ATHLETICS */}
        {watchTab === 'Athletics' && (
          <View style={{ paddingHorizontal: 16 }}>
            {ATHLETICS_VIDEOS.map(vid => (
              <Pressable key={vid.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={({ pressed }) => ({ backgroundColor: pressed ? C.surfacePressed : C.surface, borderRadius: 14, marginBottom: 12, overflow: 'hidden' })}>
                <View style={{ height: 110, backgroundColor: C.surfacePressed, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 36 }}>{vid.emoji}</Text>
                  <View style={{ position: 'absolute', bottom: 8, right: 10, backgroundColor: C.label + 'cc', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: C.bg }}>{vid.duration}</Text>
                  </View>
                </View>
                <View style={{ padding: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={2}>{vid.title}</Text>
                  <Text style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{vid.date}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* STUDENT LIFE */}
        {watchTab === 'Student Life' && (
          <View style={{ paddingHorizontal: 16 }}>
            {STUDENT_LIFE_VIDEOS.map(vid => (
              <Pressable key={vid.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={({ pressed }) => ({ backgroundColor: pressed ? C.surfacePressed : C.surface, borderRadius: 14, marginBottom: 12, overflow: 'hidden' })}>
                <View style={{ height: 110, backgroundColor: C.surfacePressed, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 36 }}>{vid.emoji}</Text>
                  <View style={{ position: 'absolute', bottom: 8, right: 10, backgroundColor: C.label + 'cc', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: C.bg }}>{vid.duration}</Text>
                  </View>
                </View>
                <View style={{ padding: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={2}>{vid.title}</Text>
                  <Text style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{vid.date}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

// ── BusinessCEOMediaView ─────────────────────────────────────────────────────

type BizMediaTab = 'Library' | 'Upload' | 'Schedule' | 'Gated' | 'Analytics';

const BIZ_LIB_CATS = ['All', 'Demos', 'Tutorials', 'Webinars', 'Training', 'Investor', 'Culture', 'Testimonials'] as const;
type BizLibCat = typeof BIZ_LIB_CATS[number];

const BIZ_MEDIA_LIBRARY = [
  { id: 'bm1', title: 'KaNeXT OS Platform Overview',          category: 'Demos',        views: 1200, duration: '4:32',  visibility: 'Public'    },
  { id: 'bm2', title: 'Intelligence System Deep Dive',         category: 'Tutorials',    views: 847,  duration: '18:45', visibility: 'Public'    },
  { id: 'bm3', title: 'Q1 2026 Investor Update',              category: 'Investor',     views: 34,   duration: '22:10', visibility: 'Investors' },
  { id: 'bm4', title: 'Team Culture Day 2025',                 category: 'Culture',      views: 203,  duration: '6:18',  visibility: 'Team'      },
  { id: 'bm5', title: 'Lincoln University Case Study',         category: 'Testimonials', views: 412,  duration: '8:42',  visibility: 'Clients'   },
  { id: 'bm6', title: 'New Member Onboarding Walkthrough',     category: 'Tutorials',    views: 589,  duration: '12:20', visibility: 'Clients'   },
];

const BIZ_GATED_VIDEOS = [
  { id: 'bg1', title: 'Founder Presentation Apr 2026',        views: 34, watchStats: 'Tiger Global team watched 100%, Sequoia watched 62%' },
  { id: 'bg2', title: 'Financial Model Walkthrough',           views: 18, watchStats: 'Tiger Global watched 88%, a16z watched 45%'          },
  { id: 'bg3', title: 'Market Opportunity Deep Dive',          views: 12, watchStats: 'Sequoia watched 71%, Benchmark watched 30%'          },
];

function BusinessCEOMediaView({
  C, insets, role, cycleRole,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
}) {
  const [mediaTab, setMediaTab] = React.useState<BizMediaTab>('Library');
  const [mediaDrop, setMediaDrop] = React.useState(false);
  const [libCat, setLibCat] = React.useState<BizLibCat>('All');
  const [uploadCat, setUploadCat] = React.useState('Demos');
  const [uploadVis, setUploadVis] = React.useState('Public');
  const topBarH = insets.top + 52;

  const { opacity: bizCeoTY, onScroll: bizCeoOS, scrollEventThrottle: bizCeoET } = useScrollHeader(topBarH);
  const visibleVideos = libCat === 'All' ? BIZ_MEDIA_LIBRARY : BIZ_MEDIA_LIBRARY.filter(v => v.category === libCat);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top Bar */}
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, height: topBarH, paddingTop: insets.top, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, opacity: bizCeoTY }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, flex: 1 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
            <KMenuButton />
          </Pressable>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMediaDrop(v => !v); }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{mediaTab}</Text>
            <IconSymbol name={mediaDrop ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary} />
          </Pressable>
          <RolePill role={role} onPress={cycleRole} isPrimary />
        </View>
      </Animated.View>
      {/* Dropdown */}
      {mediaDrop && (
        <View style={{ position: 'absolute', top: topBarH + 4, left: '14%', right: '14%', backgroundColor: C.surface, borderRadius: 14, zIndex: 100, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8, overflow: 'hidden' }}>
          {(['Library', 'Upload', 'Schedule', 'Gated', 'Analytics'] as BizMediaTab[]).map((tab, i, arr) => (
            <Pressable key={tab} onPress={() => { Haptics.selectionAsync(); setMediaTab(tab); setMediaDrop(false); }} style={{ paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
              <Text style={{ fontSize: 15, color: tab === mediaTab ? C.label : C.secondary, fontWeight: tab === mediaTab ? '600' : '400' }}>{tab}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} onScroll={bizCeoOS} scrollEventThrottle={bizCeoET} contentContainerStyle={{ paddingTop: topBarH + 16, paddingBottom: 120 }}>
        {/* LIBRARY */}
        {mediaTab === 'Library' && (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8, flexDirection: 'row' }}>
              {BIZ_LIB_CATS.map(cat => (
                <Pressable key={cat} onPress={() => { Haptics.selectionAsync(); setLibCat(cat); }} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: libCat === cat ? C.label : C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: libCat === cat ? C.label : C.separator }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: libCat === cat ? C.bg : C.secondary }}>{cat}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 }}>
              {visibleVideos.map(video => (
                <View key={video.id} style={{ width: '47%', backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden' }}>
                  <View style={{ height: 90, backgroundColor: C.surfacePressed, alignItems: 'center', justifyContent: 'center' }}>
                    <IconSymbol name="play.fill" size={24} color={C.label} />
                    <View style={{ position: 'absolute', bottom: 6, right: 8, backgroundColor: C.label + 'cc', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: C.bg }}>{video.duration}</Text>
                    </View>
                  </View>
                  <View style={{ padding: 10 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: C.label, lineHeight: 17, marginBottom: 3 }} numberOfLines={2}>{video.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <View style={{ paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5, backgroundColor: C.surfacePressed }}>
                          <Text style={{ fontSize: 10, fontWeight: '600', color: C.secondary }}>{video.category}</Text>
                        </View>
                        <Text style={{ fontSize: 10, color: C.muted }}>{video.views >= 1000 ? `${(video.views / 1000).toFixed(1)}K` : video.views} views</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} hitSlop={6}>
                          <IconSymbol name="pencil" size={14} color={C.secondary} />
                        </Pressable>
                        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} hitSlop={6}>
                          <IconSymbol name="trash" size={14} color={C.secondary} />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* UPLOAD */}
        {mediaTab === 'Upload' && (
          <View style={{ paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={({ pressed }) => ({ flex: 1, backgroundColor: pressed ? '#0a0a0a' : C.label, borderRadius: 14, padding: 20, alignItems: 'center', gap: 8 })}>
                <IconSymbol name="arrow.up.to.line" size={26} color={C.bg} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Upload Video</Text>
              </Pressable>
              <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={({ pressed }) => ({ flex: 1, backgroundColor: pressed ? C.surfacePressed : C.surface, borderRadius: 14, padding: 20, alignItems: 'center', gap: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator })}>
                <IconSymbol name="video.fill" size={26} color={C.label} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>Record Screen</Text>
              </Pressable>
            </View>
            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Title</Text>
              <View style={{ backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
                <Text style={{ fontSize: 14, color: C.muted }}>e.g. Q2 Product Demo Walkthrough</Text>
              </View>
            </View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 14, flexDirection: 'row' }}>
              {(['Demos', 'Tutorials', 'Webinars', 'Training', 'Investor', 'Culture', 'Testimonials'] as const).map(cat => (
                <Pressable key={cat} onPress={() => { Haptics.selectionAsync(); setUploadCat(cat); }} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: uploadCat === cat ? C.label : C.surfacePressed }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: uploadCat === cat ? C.bg : C.secondary }}>{cat}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Visibility</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {(['Public', 'Clients', 'Team', 'Investors'] as const).map(v => (
                <Pressable key={v} onPress={() => { Haptics.selectionAsync(); setUploadVis(v); }} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: uploadVis === v ? C.label : C.surfacePressed }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: uploadVis === v ? C.bg : C.secondary }}>{v}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
              <IconSymbol name="calendar" size={18} color={C.secondary} />
              <Text style={{ fontSize: 14, color: C.muted }}>Schedule Publish Date</Text>
            </Pressable>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={({ pressed }) => ({ backgroundColor: pressed ? '#0a0a0a' : C.label, borderRadius: 14, paddingVertical: 14, alignItems: 'center' })}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>Upload</Text>
            </Pressable>
          </View>
        )}

        {/* SCHEDULE */}
        {mediaTab === 'Schedule' && (
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>UPCOMING</Text>
            {[
              { title: 'Q2 Product Roadmap Webinar',         date: 'Apr 10',  type: 'Live Webinar',      visibility: 'Clients' },
              { title: 'Customer Success Story: LU Oakland', date: 'Apr 18',  type: 'Scheduled Release', visibility: 'Public'  },
            ].map((item, i) => (
              <View key={i} style={{ backgroundColor: C.surface, borderRadius: 14, marginBottom: 10, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: C.surfacePressed, alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name={item.type === 'Live Webinar' ? 'dot.radiowaves.left.and.right' : 'video.fill'} size={16} color={C.label} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={1}>{item.title}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{item.date} · {item.type} · {item.visibility}</Text>
                </View>
                {item.type === 'Live Webinar' && (
                  <View style={{ paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, backgroundColor: C.surfacePressed }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: C.secondary }}>LIVE</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* GATED */}
        {mediaTab === 'Gated' && (
          <View style={{ paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <IconSymbol name="lock.fill" size={16} color={C.label} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>Investor-Gated Content</Text>
            </View>
            {BIZ_GATED_VIDEOS.map(video => (
              <View key={video.id} style={{ backgroundColor: C.surface, borderRadius: 14, marginBottom: 12, overflow: 'hidden' }}>
                <View style={{ height: 80, backgroundColor: C.surfacePressed, alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name="play.fill" size={22} color={C.secondary} />
                  <View style={{ position: 'absolute', top: 8, right: 10, backgroundColor: C.label, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: C.bg }}>Invite Code Required</Text>
                  </View>
                </View>
                <View style={{ padding: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 6 }}>{video.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <IconSymbol name="eye" size={13} color={C.secondary} />
                    <Text style={{ fontSize: 12, color: C.secondary }}>{video.views} views</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: C.muted, lineHeight: 16 }}>{video.watchStats}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ANALYTICS */}
        {mediaTab === 'Analytics' && (
          <View style={{ paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {[{ label: 'Total Views', value: '3,847' }, { label: 'Watch Hours', value: '284h' }, { label: 'Avg Completion', value: '67%' }].map(s => (
                <View key={s.label} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: C.label }}>{s.value}</Text>
                  <Text style={{ fontSize: 10, color: C.secondary, textAlign: 'center', marginTop: 2 }}>{s.label}</Text>
                </View>
              ))}
            </View>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>BY CATEGORY</Text>
            {[
              { cat: 'Demos',        views: 1200 },
              { cat: 'Tutorials',    views: 1436 },
              { cat: 'Webinars',     views: 620  },
              { cat: 'Culture',      views: 203  },
              { cat: 'Testimonials', views: 412  },
              { cat: 'Investor',     views: 34   },
            ].map(row => {
              const maxViews = 1436;
              const pct = Math.round((row.views / maxViews) * 100);
              return (
                <View key={row.cat} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{row.cat}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{row.views.toLocaleString()} views</Text>
                  </View>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: C.surfacePressed, overflow: 'hidden' }}>
                    <View style={{ width: `${pct}%`, height: '100%', backgroundColor: C.label, borderRadius: 3 }} />
                  </View>
                </View>
              );
            })}
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8, marginBottom: 10 }}>TOP VIDEOS</Text>
            {BIZ_MEDIA_LIBRARY.slice().sort((a, b) => b.views - a.views).slice(0, 4).map((v, i) => (
              <View key={v.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, marginBottom: 8, padding: 12, gap: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: C.muted, width: 20 }}>{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }} numberOfLines={1}>{v.title}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{v.views >= 1000 ? `${(v.views / 1000).toFixed(1)}K` : v.views} views · {v.duration}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

// ── BusinessCustomerResourcesView ─────────────────────────────────────────────

type BizCustomerTab = 'All' | 'Tutorials' | 'Webinars' | 'Help' | 'Client Content';
const BIZ_CUSTOMER_TABS: BizCustomerTab[] = ['All', 'Tutorials', 'Webinars', 'Help', 'Client Content'];

const BIZ_CUSTOMER_VIDEOS: { id: string; title: string; category: BizCustomerTab; duration: string; gated: boolean }[] = [
  { id: 'bc1', title: 'Getting Started with KaNeXT OS',          category: 'Tutorials',      duration: '8:14',  gated: false },
  { id: 'bc2', title: 'Setting Up Your Hub',                      category: 'Tutorials',      duration: '5:42',  gated: false },
  { id: 'bc3', title: 'Using the Agenda Tile',                    category: 'Tutorials',      duration: '4:55',  gated: false },
  { id: 'bc4', title: 'Product Roadmap Q1 2026 (Recording)',      category: 'Webinars',       duration: '38:22', gated: false },
  { id: 'bc5', title: 'Getting the Most Out of KaNeXT',           category: 'Webinars',       duration: '24:10', gated: false },
  { id: 'bc6', title: 'FAQ Video',                                 category: 'Help',           duration: '11:05', gated: false },
  { id: 'bc7', title: 'Troubleshooting Common Issues',            category: 'Help',           duration: '9:30',  gated: false },
  { id: 'bc8', title: 'Your Implementation Guide',                category: 'Client Content', duration: '18:00', gated: true  },
  { id: 'bc9', title: 'Advanced Features for Power Users',        category: 'Client Content', duration: '22:15', gated: true  },
];

function BusinessCustomerResourcesView({
  C, insets, role, cycleRole,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
}) {
  const [activeTab, setActiveTab] = React.useState<BizCustomerTab>('All');
  const topBarH = insets.top + 52;

  const { opacity: bizCustTY, onScroll: bizCustOS, scrollEventThrottle: bizCustET } = useScrollHeader(topBarH);
  const visibleVideos = activeTab === 'All' ? BIZ_CUSTOMER_VIDEOS : BIZ_CUSTOMER_VIDEOS.filter(v => v.category === activeTab);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top Bar */}
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, height: topBarH, paddingTop: insets.top, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, opacity: bizCustTY }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, flex: 1 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>Resources</Text>
          </View>
          <RolePill role={role} onPress={cycleRole} isPrimary={false} />
        </View>
      </Animated.View>
      {/* Category tabs */}
      <View style={{ position: 'absolute', top: topBarH, left: 0, right: 0, zIndex: 15, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: 'row' }}>
          {BIZ_CUSTOMER_TABS.map(tab => (
            <Pressable key={tab} onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: activeTab === tab ? C.label : C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: activeTab === tab ? C.label : C.separator }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: activeTab === tab ? C.bg : C.secondary }}>{tab}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} onScroll={bizCustOS} scrollEventThrottle={bizCustET} contentContainerStyle={{ paddingTop: topBarH + 50 + 12, paddingHorizontal: 16, paddingBottom: 120 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {visibleVideos.map(video => (
            <View key={video.id} style={{ width: '47%', backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden' }}>
              <View style={{ height: 90, backgroundColor: C.surfacePressed, alignItems: 'center', justifyContent: 'center' }}>
                <IconSymbol name="play.fill" size={24} color={C.label} />
                {video.gated && (
                  <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: C.label, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 9, fontWeight: '700', color: C.bg }}>Clients Only</Text>
                  </View>
                )}
                <View style={{ position: 'absolute', bottom: 6, right: 8, backgroundColor: C.label + 'cc', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: C.bg }}>{video.duration}</Text>
                </View>
              </View>
              <View style={{ padding: 10 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: C.label, lineHeight: 17, marginBottom: 8 }} numberOfLines={2}>{video.title}</Text>
                <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={({ pressed }) => ({ backgroundColor: pressed ? '#0a0a0a' : C.label, borderRadius: 8, paddingVertical: 7, alignItems: 'center' })}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: C.bg }}>Watch</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}


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

  const { opacity: comPastTY, onScroll: comPastOS, scrollEventThrottle: comPastET } = useScrollHeader(topBarH);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top Bar */}
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, height: topBarH, paddingTop: insets.top, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, opacity: comPastTY }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, flex: 1 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
            <KMenuButton />
          </Pressable>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMediaDrop(v => !v); }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{mediaTab}</Text>
            <IconSymbol name={mediaDrop ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary} />
          </Pressable>
          <RolePill role={role} onPress={cycleRole} isPrimary />
        </View>
      </Animated.View>
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

      <ScrollView showsVerticalScrollIndicator={false} onScroll={comPastOS} scrollEventThrottle={comPastET} contentContainerStyle={{ paddingTop: topBarH + 16, paddingBottom: 120 }}>
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

// ── Live Mode Public View ──────────────────────────────────────────────────

const LIVE_KTV_CONTENT: Record<string, { title: string; items: Array<{ id: string; title: string; duration: string; thumb: string; locked?: boolean }> }> = {
  personal: {
    title: "Sammy's Videos",
    items: [
      { id: '1', title: 'KaNeXT OS — Full Product Demo', duration: '18:42', thumb: '🎬' },
      { id: '2', title: 'The Future of Sports Intelligence', duration: '12:05', thumb: '🏀' },
      { id: '3', title: 'Founder Story: Why I Built KaNeXT', duration: '24:17', thumb: '🚀' },
      { id: '4', title: 'Live Q&A Recap — March 2026', duration: '45:00', thumb: '💬', locked: true },
    ],
  },
  business: {
    title: 'KaNeXT Media',
    items: [
      { id: '1', title: 'KaNeXT OS Platform Overview', duration: '8:30', thumb: '💼' },
      { id: '2', title: 'Athletic Intelligence — How It Works', duration: '15:22', thumb: '🏟' },
      { id: '3', title: 'Customer Success: Lincoln University', duration: '6:45', thumb: '🎓' },
      { id: '4', title: 'Investor Briefing Q1 2026', duration: '32:00', thumb: '📊', locked: true },
    ],
  },
  education: {
    title: 'Lincoln University Videos',
    items: [
      { id: '1', title: 'Campus Tour — Oakland, CA', duration: '7:12', thumb: '🏛' },
      { id: '2', title: 'MBA Program Overview', duration: '5:48', thumb: '🎓' },
      { id: '3', title: 'Student Testimonials 2026', duration: '9:30', thumb: '👩‍🎓' },
      { id: '4', title: 'Commencement Highlights 2025', duration: '22:15', thumb: '🎉' },
    ],
  },
  community: {
    title: 'ICCLA Sermons & Events',
    items: [
      { id: '1', title: 'Sunday Service — Apr 5: Easter Sunday', duration: '1:12:00', thumb: '✝️' },
      { id: '2', title: 'Wednesday Bible Study — John 15', duration: '52:30', thumb: '📖' },
      { id: '3', title: 'Youth Conference Recap 2025', duration: '28:45', thumb: '🙌' },
      { id: '4', title: 'Sunday Service — Mar 29', duration: '58:20', thumb: '✝️' },
    ],
  },
  sports: {
    title: 'LU Basketball',
    items: [
      { id: '1', title: 'Full Game: LU 78, Dominican 65', duration: '1:48:22', thumb: '🏀' },
      { id: '2', title: 'Season Highlights Reel 2025-26', duration: '4:30', thumb: '🎬' },
      { id: '3', title: 'Laolu Kalejaiye — Player Profile', duration: '3:15', thumb: '⭐' },
      { id: '4', title: 'Behind the Scenes: Road Trip', duration: '8:45', thumb: '🚌' },
    ],
  },
};

function LiveKtvView({ mode, C, insets }: { mode: string; C: any; insets: any }) {
  const content = LIVE_KTV_CONTENT[mode] ?? LIVE_KTV_CONTENT.personal;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ height: insets.top + 52, backgroundColor: C.bg }} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.label, paddingTop: 8, paddingBottom: 4 }}>{content.title}</Text>
        {content.items.map(item => (
          <Pressable key={item.id} style={{ backgroundColor: C.surface, borderRadius: 14, flexDirection: 'row', padding: 14, gap: 14, alignItems: 'center' }}>
            <View style={{ width: 56, height: 56, backgroundColor: C.separator, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 24 }}>{item.thumb}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: item.locked ? C.secondary : C.label }}>{item.title}</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>{item.duration}</Text>
            </View>
            {item.locked ? (
              <View style={{ backgroundColor: C.separator, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                <Text style={{ fontSize: 11, color: C.secondary }}>🔒 Subscribe</Text>
              </View>
            ) : (
              <Text style={{ fontSize: 20, color: C.secondary }}>▶</Text>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// ── Personal Mode KTV data ───────────────────────────────────────────────────

type PersonalVideo = {
  id: string; title: string; duration: string;
  views: string; timeAgo: string; hue: number; description: string;
};

const PVIDEOS: PersonalVideo[] = [
  { id: 'pv1',  title: 'Day in My Life — Coach & CEO',           duration: '16:22', views: '8.9K', timeAgo: '2 days ago',   hue: 45,  description: 'A full day as a coach and startup founder — morning workouts, film review, investor calls, and late-night code sessions.' },
  { id: 'pv2',  title: 'Why I Built an OS',                      duration: '12:34', views: '5.1K', timeAgo: '3 weeks ago',  hue: 200, description: 'The story behind KaNeXT OS — why I quit a $180K job to build a platform for every creator, coach, and community leader.' },
  { id: 'pv3',  title: 'How I Use AI to Build Faster',           duration: '7:30',  views: '6.8K', timeAgo: '4 days ago',   hue: 280, description: 'My exact Claude Code workflow for shipping features 10x faster. Live demo included.' },
  { id: 'pv4',  title: 'Brand Deal Negotiation Tips',            duration: '11:42', views: '4.1K', timeAgo: '2 weeks ago',  hue: 320, description: 'How to negotiate brand deals without an agent — rate cards, usage rights, and the one clause to always push back on.' },
  { id: 'pv5',  title: 'From Coach to CEO',                      duration: '10:15', views: '3.2K', timeAgo: '5 days ago',   hue: 30,  description: 'The mindset shift from athlete-developer to company builder. What coaching taught me about product development.' },
  { id: 'pv6',  title: 'KaNeXT Product Demo',                    duration: '8:22',  views: '2.4K', timeAgo: '2 weeks ago',  hue: 220, description: 'Full walkthrough of KaNeXT OS — Personal, Sports, Business, Education, and Community modes in one platform.' },
  { id: 'pv7',  title: 'My Content Creation Workflow',           duration: '8:55',  views: '3.4K', timeAgo: '1 week ago',   hue: 300, description: 'From idea capture to publish — the system I use to create content across 5 platforms in under 3 hours a week.' },
  { id: 'pv8',  title: 'Player Development Framework',           duration: '13:08', views: '1.9K', timeAgo: '2 weeks ago',  hue: 180, description: 'The 4-pillar framework I use with every player: Physical, Technical, Mental, and Social development.' },
  { id: 'pv9',  title: 'Q&A: Ask Me Anything March 2026',        duration: '22:15', views: '2.1K', timeAgo: '1 week ago',   hue: 190, description: 'I answered every community question — startup funding, coaching philosophy, and morning routines.' },
  { id: 'pv10', title: 'The 4,000 Page Architecture',            duration: '15:47', views: '1.8K', timeAgo: '1 week ago',   hue: 240, description: 'How I wrote 4,000 pages of product specification and why it produces better software.' },
  { id: 'pv11', title: 'Building Culture at Lincoln',            duration: '11:20', views: '2.8K', timeAgo: '3 weeks ago',  hue: 165, description: 'How I transformed a losing program into a conference contender. Culture, accountability, and what team first actually means.' },
  { id: 'pv12', title: 'Why System Fit Beats Talent',            duration: '9:45',  views: '4.2K', timeAgo: '1 month ago',  hue: 150, description: 'The most undervalued concept in recruiting. I have passed on 5-stars and turned walk-ons into starters.' },
];

type PShort   = { id: string; title: string; views: string; hue: number; };
type PLive    = { id: string; title: string; status: 'live' | 'upcoming' | 'past'; viewerCount?: number; scheduledAt?: string; date?: string; duration?: string; hue: number; };
type PPlaylist = { id: string; title: string; videoCount: number; hues: [number, number, number, number]; };
type PComment = { id: string; author: string; initials: string; text: string; timeAgo: string; likes: number; };

const PSHORTS: PShort[] = [
  { id: 'ps1', title: '60-second pitch',          views: '12K',  hue: 45  },
  { id: 'ps2', title: 'Morning routine',          views: '8.4K', hue: 200 },
  { id: 'ps3', title: 'AI trick saves 2hr/day',   views: '22K',  hue: 280 },
  { id: 'ps4', title: 'Metric coaches miss',      views: '6.1K', hue: 150 },
  { id: 'ps5', title: 'My desk setup',            views: '5.3K', hue: 300 },
  { id: 'ps6', title: 'Grow on social fast',      views: '18K',  hue: 320 },
];

const PLIVE: PLive[] = [
  { id: 'pl1', title: 'Creator Q&A — Live Right Now',  status: 'live',     viewerCount: 342,                         hue: 45  },
  { id: 'pl2', title: 'KaNeXT Launch Event',           status: 'upcoming', scheduledAt: 'Apr 18 · 7:00 PM EST',      hue: 220 },
  { id: 'pl3', title: 'Creator Summit Pre-Show',       status: 'past',     date: 'Apr 5, 2026', duration: '1:02:14', hue: 350 },
];

const PPLAYLISTS: PPlaylist[] = [
  { id: 'pp1', title: 'Building KaNeXT',     videoCount: 4, hues: [200, 220, 240, 30]  },
  { id: 'pp2', title: 'Coaching Philosophy', videoCount: 3, hues: [150, 165, 180, 190] },
  { id: 'pp3', title: 'Creator Toolkit',     videoCount: 3, hues: [280, 300, 320, 45]  },
];

const PCOMMENTS: PComment[] = [
  { id: 'pc1', author: 'Marcus J.',  initials: 'MJ', text: 'This is exactly what I needed. The system fit concept changed how I think about my whole team.', timeAgo: '2 days ago', likes: 87  },
  { id: 'pc2', author: 'Aisha M.',   initials: 'AM', text: 'Already saved 90 minutes on my first day trying the AI workflow.',                               timeAgo: '3 days ago', likes: 64  },
  { id: 'pc3', author: 'Jordan W.',  initials: 'JW', text: 'One of the only creators who gives real actionable stuff. Not just motivation.',                   timeAgo: '4 days ago', likes: 43  },
  { id: 'pc4', author: 'Sofia R.',   initials: 'SR', text: 'This plus the masterclass is genuinely the best creator education I have found.',                  timeAgo: '1 week ago', likes: 31  },
];

// ── Personal Mode KTV View ────────────────────────────────────────────────────

type PTab = 'Videos' | 'Shorts' | 'Live' | 'Playlists';
const PTABS: PTab[] = ['Videos', 'Shorts', 'Live', 'Playlists'];

function PersonalKayTVView({
  C, insets, role, cycleRole, isOwner,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
  isOwner: boolean;
}) {
  const { width, height: windowHeight } = useWindowDimensions();
  const topBarH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);

  const [activeTab, setActiveTab]         = React.useState<PTab>('Videos');
  const [selectedVideo, setSelectedVideo] = React.useState<PersonalVideo | null>(null);
  const [shortsOpen, setShortsOpen]       = React.useState(false);
  const [shortsIndex, setShortsIndex]     = React.useState(0);
  const [uploadVisible, setUploadVisible] = React.useState(false);
  const [descExpanded, setDescExpanded]   = React.useState(false);
  const [liked, setLiked]                 = React.useState(false);
  const [disliked, setDisliked]           = React.useState(false);
  const [saved, setSaved]                 = React.useState(false);
  const [subscribed, setSubscribed]       = React.useState(false);
  const [uploadTitle, setUploadTitle]     = React.useState('');
  const [uploadDesc, setUploadDesc]       = React.useState('');
  const [visibility, setVisibility]       = React.useState('Public');
  const shortsRef = useRef<FlatList>(null);

  // ── Video Player view ──────────────────────────────────────────────────────
  if (selectedVideo) {
    const upNext = PVIDEOS.filter(v => v.id !== selectedVideo.id).slice(0, 3);
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        {/* Player thumbnail */}
        <View style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: `hsl(${selectedVideo.hue},38%,28%)`, alignItems: 'center', justifyContent: 'center', marginTop: insets.top }}>
          <Text style={{ fontSize: 64, color: 'rgba(255,255,255,0.9)' }}>▶</Text>
          <Pressable
            onPress={() => { setSelectedVideo(null); setDescExpanded(false); setLiked(false); setDisliked(false); setSaved(false); }}
            style={{ position: 'absolute', top: 10, left: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}
          >
            <IconSymbol name="chevron.left" size={16} color="#fff" />
          </Pressable>
          <View style={{ position: 'absolute', bottom: 8, right: 10, backgroundColor: 'rgba(0,0,0,0.72)', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3 }}>
            <Text style={{ fontSize: 12, color: '#fff', fontWeight: '700' }}>{selectedVideo.duration}</Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + 80 }} showsVerticalScrollIndicator={false}>
          {/* Title + meta */}
          <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: C.label, marginBottom: 4 }}>{selectedVideo.title}</Text>
            <Text style={{ fontSize: 13, color: C.secondary }}>{selectedVideo.views} views · {selectedVideo.timeAgo}</Text>
          </View>

          {/* Action row */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 4, paddingVertical: 4, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
            {([
              { icon: liked ? 'hand.thumbsup.fill' : 'hand.thumbsup', label: liked ? 'Liked' : 'Like', onPress: () => { setLiked(p => !p); if (disliked) setDisliked(false); } },
              { icon: disliked ? 'hand.thumbsdown.fill' : 'hand.thumbsdown', label: 'Dislike', onPress: () => { setDisliked(p => !p); if (liked) setLiked(false); } },
              { icon: 'arrowshape.turn.up.right', label: 'Share', onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) },
              { icon: saved ? 'bookmark.fill' : 'bookmark', label: saved ? 'Saved' : 'Save', onPress: () => setSaved(p => !p) },
              { icon: 'arrow.down.circle', label: 'Download', onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) },
              ...(isOwner ? [{ icon: 'pencil', label: 'Edit', onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }] : []),
            ] as { icon: string; label: string; onPress: () => void }[]).map(action => (
              <Pressable key={action.label} onPress={action.onPress} style={{ flex: 1, alignItems: 'center', paddingVertical: 10, gap: 4 }}>
                <IconSymbol name={action.icon as any} size={20} color={C.label} />
                <Text style={{ fontSize: 10, color: C.secondary }}>{action.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Creator row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `hsl(45,38%,28%)`, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>SK</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>Sammy Kalejaiye</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>42.1K subscribers</Text>
            </View>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (!isOwner) setSubscribed(p => !p); }}
              style={{ backgroundColor: isOwner ? C.surface : subscribed ? C.surface : C.label, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: isOwner ? C.label : subscribed ? C.label : C.bg }}>
                {isOwner ? 'Edit Video' : subscribed ? 'Subscribed' : 'Subscribe'}
              </Text>
            </Pressable>
          </View>

          {/* Description */}
          <Pressable
            onPress={() => setDescExpanded(p => !p)}
            style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}
          >
            <Text style={{ fontSize: 13, color: C.label, lineHeight: 19 }} numberOfLines={descExpanded ? undefined : 3}>
              {selectedVideo.description}
            </Text>
            <Text style={{ fontSize: 12, color: C.secondary, marginTop: 4, fontWeight: '600' }}>
              {descExpanded ? 'Show less' : 'Show more'}
            </Text>
          </Pressable>

          {/* Comments */}
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>Comments</Text>
            {PCOMMENTS.map(c => (
              <View key={c.id} style={{ flexDirection: 'row', marginBottom: 16 }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', marginRight: 10, flexShrink: 0 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: C.label }}>{c.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 3 }}>{c.author} · {c.timeAgo}</Text>
                  <Text style={{ fontSize: 13, color: C.label, lineHeight: 18 }}>{c.text}</Text>
                  <View style={{ flexDirection: 'row', gap: 14, marginTop: 6 }}>
                    <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                      <IconSymbol name="hand.thumbsup" size={13} color={C.secondary} />
                      <Text style={{ fontSize: 11, color: C.secondary }}>{c.likes}</Text>
                    </Pressable>
                    <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                      <Text style={{ fontSize: 11, color: C.secondary }}>Reply</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Up Next */}
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>Up Next</Text>
            {upNext.map(v => (
              <Pressable
                key={v.id}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedVideo(v); setDescExpanded(false); setLiked(false); setDisliked(false); setSaved(false); }}
                style={({ pressed }) => ({ flexDirection: 'row', gap: 10, marginBottom: 14, opacity: pressed ? 0.8 : 1 })}
              >
                <View style={{ width: 120, height: 68, borderRadius: 8, backgroundColor: `hsl(${v.hue},38%,28%)`, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Text style={{ fontSize: 20, color: 'rgba(255,255,255,0.9)' }}>▶</Text>
                  <View style={{ position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.72)', borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1 }}>
                    <Text style={{ fontSize: 10, color: '#fff', fontWeight: '700' }}>{v.duration}</Text>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, marginBottom: 3 }} numberOfLines={2}>{v.title}</Text>
                  <Text style={{ fontSize: 11, color: C.secondary }}>{v.views} views · {v.timeAgo}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Tab content ────────────────────────────────────────────────────────────

  const VideosTab = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      {PVIDEOS.map(v => (
        <Pressable
          key={v.id}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedVideo(v); }}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, marginBottom: 18 })}
        >
          <View style={{ aspectRatio: 16 / 9, borderRadius: 10, backgroundColor: `hsl(${v.hue},38%,28%)`, alignItems: 'center', justifyContent: 'center', marginBottom: 10, overflow: 'hidden' }}>
            <Text style={{ fontSize: 42, color: 'rgba(255,255,255,0.9)' }}>▶</Text>
            <View style={{ position: 'absolute', bottom: 8, right: 10, backgroundColor: 'rgba(0,0,0,0.72)', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3 }}>
              <Text style={{ fontSize: 12, color: '#fff', fontWeight: '700' }}>{v.duration}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: `hsl(45,38%,28%)`, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>SK</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 3 }} numberOfLines={2}>{v.title}</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>Sammy Kalejaiye · {v.views} views · {v.timeAgo}</Text>
            </View>
            {isOwner && (
              <Pressable hitSlop={10} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <IconSymbol name="ellipsis" size={14} color={C.secondary} />
              </Pressable>
            )}
          </View>
        </Pressable>
      ))}
    </View>
  );

  const ShortsTab = () => {
    const colWidth = (width - 4) / 3;
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2, paddingTop: 2 }}>
        {PSHORTS.map((s, i) => (
          <Pressable
            key={s.id}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShortsIndex(i); setShortsOpen(true); }}
            style={{ width: colWidth, aspectRatio: 9 / 16, backgroundColor: `hsl(${s.hue},38%,28%)`, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
          >
            <Text style={{ fontSize: 28, color: 'rgba(255,255,255,0.9)' }}>▶</Text>
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 6, paddingVertical: 5 }}>
              <Text style={{ fontSize: 11, color: '#fff', fontWeight: '600' }} numberOfLines={1}>{s.title}</Text>
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)' }}>{s.views} views</Text>
            </View>
          </Pressable>
        ))}
      </View>
    );
  };

  const LiveTab = () => {
    const liveNow  = PLIVE.filter(l => l.status === 'live');
    const upcoming = PLIVE.filter(l => l.status === 'upcoming');
    const past     = PLIVE.filter(l => l.status === 'past');
    return (
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {liveNow.length > 0 && (
          <>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Live Now</Text>
            {liveNow.map(l => (
              <Pressable key={l.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, flexDirection: 'row', gap: 12, marginBottom: 16 })}>
                <View style={{ width: 120, height: 68, borderRadius: 8, backgroundColor: `hsl(${l.hue},38%,28%)`, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <View style={{ backgroundColor: '#C0392B', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 10, color: '#fff', fontWeight: '800', letterSpacing: 0.5 }}>● LIVE</Text>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 4 }} numberOfLines={2}>{l.title}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{l.viewerCount?.toLocaleString()} watching</Text>
                </View>
              </Pressable>
            ))}
          </>
        )}
        {upcoming.length > 0 && (
          <>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 4 }}>Upcoming</Text>
            {upcoming.map(l => (
              <View key={l.id} style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <View style={{ width: 120, height: 68, borderRadius: 8, backgroundColor: `hsl(${l.hue},38%,28%)`, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconSymbol name="calendar" size={22} color="rgba(255,255,255,0.7)" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 4 }} numberOfLines={2}>{l.title}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 8 }}>{l.scheduledAt}</Text>
                  <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ alignSelf: 'flex-start', borderWidth: 1, borderColor: C.separator, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }}>Set Reminder</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        )}
        {past.length > 0 && (
          <>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 4 }}>Past Streams</Text>
            {past.map(l => (
              <Pressable key={l.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, flexDirection: 'row', gap: 12, marginBottom: 16 })}>
                <View style={{ width: 120, height: 68, borderRadius: 8, backgroundColor: `hsl(${l.hue},38%,28%)`, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '700' }}>{l.duration}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 4 }} numberOfLines={2}>{l.title}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{l.date}</Text>
                </View>
              </Pressable>
            ))}
          </>
        )}
      </View>
    );
  };

  const PlaylistsTab = () => (
    <View style={{ paddingTop: 16 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 8 }}>
        {PPLAYLISTS.map(p => (
          <Pressable key={p.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ width: 160 }}>
            <View style={{ width: 160, height: 100, marginBottom: 8 }}>
              {p.hues.map((h, i) => (
                <View
                  key={i}
                  style={{
                    position: i === 0 ? 'relative' : 'absolute',
                    left: i * 4, top: i * 4,
                    width: 152 - i * 8, height: 92 - i * 8,
                    borderRadius: 8,
                    backgroundColor: `hsl(${h},38%,${28 + i * 5}%)`,
                    zIndex: 4 - i,
                  }}
                />
              ))}
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 2 }} numberOfLines={1}>{p.title}</Text>
            <Text style={{ fontSize: 12, color: C.secondary }}>{p.videoCount} videos</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  // ── Main channel page ──────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Animated top bar */}
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, height: topBarH, paddingTop: insets.top, backgroundColor: C.bg, opacity }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, flex: 1 }}>
          {isOwner ? (
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
              <KMenuButton />
            </Pressable>
          ) : (
            <View style={{ width: 40 }} />
          )}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>KTV</Text>
          </View>
          <View style={{ width: 40, alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      {/* Scrollable content — stickyHeaderIndices=[1] pins the tab bar */}
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{ paddingTop: topBarH, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        {/* Channel header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: `hsl(45,38%,28%)`, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff' }}>SK</Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: C.label, marginBottom: 2 }}>Sammy Kalejaiye</Text>
          <Text style={{ fontSize: 14, color: C.secondary, marginBottom: 3 }}>@sammyk</Text>
          <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 14 }}>42.1K subscribers · {PVIDEOS.length} videos</Text>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (!isOwner) setSubscribed(p => !p); }}
            style={{ alignSelf: 'flex-start', backgroundColor: isOwner ? C.surface : subscribed ? C.surface : C.label, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 9 }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: isOwner ? C.label : subscribed ? C.label : C.bg }}>
              {isOwner ? 'Manage Channel' : subscribed ? 'Subscribed' : 'Subscribe'}
            </Text>
          </Pressable>
        </View>

        {/* Sticky tab bar */}
        <View style={{ backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
            {PTABS.map(tab => (
              <Pressable
                key={tab}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tab); }}
                style={{ paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: activeTab === tab ? C.label : 'transparent' }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: activeTab === tab ? C.label : C.secondary }}>{tab}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Tab content */}
        {activeTab === 'Videos'    && <VideosTab />}
        {activeTab === 'Shorts'    && <ShortsTab />}
        {activeTab === 'Live'      && <LiveTab />}
        {activeTab === 'Playlists' && <PlaylistsTab />}
      </ScrollView>

      {/* Owner FAB — Upload */}
      {isOwner && (
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setUploadVisible(true); }}
          style={{ position: 'absolute', bottom: insets.bottom + 68, right: 20, width: 52, height: 52, borderRadius: 26, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.18, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 6 }}
        >
          <IconSymbol name="plus" size={22} color={C.bg} />
        </Pressable>
      )}

      {/* Shorts fullscreen swipe player */}
      {shortsOpen && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', zIndex: 100 }}>
          <FlatList
            ref={shortsRef}
            data={PSHORTS}
            keyExtractor={s => s.id}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            initialScrollIndex={shortsIndex}
            getItemLayout={(_, i) => ({ length: windowHeight, offset: windowHeight * i, index: i })}
            renderItem={({ item }) => (
              <View style={{ width, height: windowHeight, backgroundColor: `hsl(${item.hue},38%,28%)`, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 72, color: 'rgba(255,255,255,0.9)' }}>▶</Text>
                <View style={{ position: 'absolute', bottom: insets.bottom + 90, left: 16, right: 72 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 }}>{item.title}</Text>
                  <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{item.views} views</Text>
                </View>
              </View>
            )}
          />
          <Pressable
            onPress={() => setShortsOpen(false)}
            style={{ position: 'absolute', top: insets.top + 12, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}
          >
            <IconSymbol name="xmark" size={16} color="#fff" />
          </Pressable>
        </View>
      )}

      {/* Upload sheet (Owner only) */}
      <BottomSheet visible={uploadVisible} onClose={() => setUploadVisible(false)} useModal>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.label, marginBottom: 20 }}>Upload Video</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Title</Text>
          <TextInput
            value={uploadTitle}
            onChangeText={setUploadTitle}
            placeholder="Add a title"
            placeholderTextColor={C.secondary}
            style={{ backgroundColor: C.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: C.label, marginBottom: 16 }}
          />
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>Description</Text>
          <TextInput
            value={uploadDesc}
            onChangeText={setUploadDesc}
            placeholder="Tell viewers about your video (optional)"
            placeholderTextColor={C.secondary}
            multiline
            style={{ backgroundColor: C.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: C.label, minHeight: 80, marginBottom: 16 }}
          />
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary, marginBottom: 8 }}>Visibility</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
            {['Public', 'Unlisted', 'Private'].map(v => (
              <Pressable
                key={v}
                onPress={() => { Haptics.selectionAsync(); setVisibility(v); }}
                style={{ backgroundColor: visibility === v ? C.label : C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 7 }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: visibility === v ? C.bg : C.label }}>{v}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setUploadVisible(false); setUploadTitle(''); setUploadDesc(''); }}
            style={{ backgroundColor: C.label, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.bg }}>Upload</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </View>
  );
}


export default function KayTVScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAppContext();
  const mode = state.activeContext?.mode ?? state.mode ?? 'business';
  const dataMode = useDataMode();

  const roleKey = KAYTV_ROLE_KEYS[mode] ?? 'business';
  const [role, cycleRole, roleCycles] = useDemoRole(roleKey);
  const isOwner = role === roleCycles[0];
  const accent  = MODE_ACCENTS[mode] ?? C.accent;

  // Personal subscriber filter state
  const [subFilter, setSubFilter] = useState<SubFilter>('All');

  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<KayTab>(() =>
    (tabParam === 'Explore' || tabParam === 'Library') ? tabParam : 'Home'
  );
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Sync tab when navigating from sidebar
  useEffect(() => {
    if (tabParam === 'Explore' || tabParam === 'Library' || tabParam === 'Home') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
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

  // Hide filter pills when switching away from Library tab
  useEffect(() => {
    if (activeTab !== 'Library') {
      setFilterPillsVisible(false);
      pillsRevealAnim.setValue(0);
    }
  }, [activeTab]);

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

  if (dataMode === 'live') return <LiveKtvView mode={mode} C={C} insets={insets} />;

  // ── Personal mode: unified channel view ──────────────────────────────────
  if (mode === 'personal') {
    return (
      <PersonalKayTVView
        C={C}
        insets={insets}
        role={role}
        cycleRole={cycleRole}
        isOwner={isOwner}
      />
    );
  }

  // ── Education President: Media management view ───────────────────────────
  if (mode === 'education' && isOwner) {
    return (
      <EducationPresidentMediaView
        C={C}
        insets={insets}
        role={role}
        cycleRole={cycleRole}
        accent={accent}
      />
    );
  }

  // ── Education Student: Watch view ─────────────────────────────────────────
  if (mode === 'education' && !isOwner) {
    return (
      <EducationStudentWatchView
        C={C}
        insets={insets}
        role={role}
        cycleRole={cycleRole}
      />
    );
  }

  // ── Business CEO: Media management view ──────────────────────────────────
  if (mode === 'business' && isOwner) {
    return (
      <BusinessCEOMediaView
        C={C}
        insets={insets}
        role={role}
        cycleRole={cycleRole}
      />
    );
  }

  // ── Business Customer: Resources view ─────────────────────────────────────
  if (mode === 'business' && !isOwner) {
    return (
      <BusinessCustomerResourcesView
        C={C}
        insets={insets}
        role={role}
        cycleRole={cycleRole}
      />
    );
  }


  // ── Community mode: redirect to Sermons (default screen) ────────────────────
  if (mode === 'community') {
    return <Redirect href="/(tabs)/(main)/kaytv/sermons" />;
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
            mode !== 'personal' ? (isOwner ? (
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
            )) : null
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
              <Text style={[styles.emptyText, { color: C.secondary }]}>No discovery content yet</Text>
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
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (isOwner) openSidePanel(); }}
              hitSlop={8}
            >
              <KMenuButton />
            </Pressable>
          </View>

          {/* Center: Home / Explore / Library TabPill */}
          <View style={styles.dropdownPillWrap}>
            <View style={{ flexDirection: 'row', backgroundColor: C.surface, borderRadius: 20, padding: 3, gap: 2 }}>
              {(['Home', 'Explore', 'Library'] as KayTab[]).map(tab => {
                const active = activeTab === tab;
                return (
                  <Pressable
                    key={tab}
                    onPress={() => handleTabSelect(tab)}
                    style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 17, backgroundColor: active ? C.activePill : 'transparent' }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: active ? C.activePillText : C.secondary }}>{tab}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Right: RolePill + filter icon */}
          <View style={[styles.topBarSide, { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', gap: 8, width: 'auto' as any }]}>
            <RolePill
              role={role}
              onPress={cycleRole}
              accentColor={accent}
              isPrimary={isOwner}
            />
            {activeTab === 'Library' ? (
              <Pressable onPress={toggleFilterPills} hitSlop={12}>
                <IconSymbol
                  name={filterPillsVisible || selectedCategory !== 'All'
                    ? 'line.3.horizontal.decrease.circle.fill'
                    : 'line.3.horizontal.decrease.circle'}
                  size={22}
                  color={filterPillsVisible || selectedCategory !== 'All' ? C.accent : C.label}
                />
              </Pressable>
            ) : (
              <View style={styles.iconBtn} />
            )}
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
  iconBtn: { width: 22, height: 22 },

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
