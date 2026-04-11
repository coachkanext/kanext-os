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
  StyleSheet, useWindowDimensions, Animated,
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
import {
  getKayTVFeed, getExploreRows, getWatchHistoryFeed, getWatchLaterFeed,
  getLikedVideosFeed, getPlaylists, KAYTV_CATEGORIES,
  formatViewCount, formatVideoTimestamp,
  type KayTVFeedItem, type PlaylistItem,
} from '@/data/mock-kaytv';

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

  const visibleVideos = libCat === 'All' ? EDU_MEDIA_LIBRARY : EDU_MEDIA_LIBRARY.filter(v => v.category === libCat);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top Bar */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, height: topBarH, paddingTop: insets.top, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <KMenuButton />
        </Pressable>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMediaDrop(v => !v); }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{mediaTab}</Text>
          <IconSymbol name={mediaDrop ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary} />
        </Pressable>
        <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary />
      </View>

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

      <ScrollView style={{ flex: 1, marginTop: topBarH }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}>

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

  const toggleBookmark = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBookmarked(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top Bar */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, height: topBarH, paddingTop: insets.top, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <KMenuButton />
        </Pressable>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setWatchDrop(v => !v); }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{watchTab}</Text>
          <IconSymbol name={watchDrop ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary} />
        </Pressable>
        <RolePill role={role} onPress={cycleRole} isPrimary={false} />
      </View>

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

      <ScrollView style={{ flex: 1, marginTop: topBarH }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}>

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

  const visibleVideos = libCat === 'All' ? BIZ_MEDIA_LIBRARY : BIZ_MEDIA_LIBRARY.filter(v => v.category === libCat);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top Bar */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, height: topBarH, paddingTop: insets.top, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <KMenuButton />
        </Pressable>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMediaDrop(v => !v); }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{mediaTab}</Text>
          <IconSymbol name={mediaDrop ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary} />
        </Pressable>
        <RolePill role={role} onPress={cycleRole} isPrimary />
      </View>

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

      <ScrollView style={{ flex: 1, marginTop: topBarH }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}>

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

  const visibleVideos = activeTab === 'All' ? BIZ_CUSTOMER_VIDEOS : BIZ_CUSTOMER_VIDEOS.filter(v => v.category === activeTab);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top Bar */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, height: topBarH, paddingTop: insets.top, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <KMenuButton />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>Resources</Text>
        </View>
        <RolePill role={role} onPress={cycleRole} isPrimary={false} />
      </View>

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

      <ScrollView style={{ flex: 1, marginTop: topBarH + 50 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 12, paddingHorizontal: 16, paddingBottom: 120 }}>
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

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top Bar */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, height: topBarH, paddingTop: insets.top, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <KMenuButton />
        </Pressable>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMediaDrop(v => !v); }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{mediaTab}</Text>
          <IconSymbol name={mediaDrop ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary} />
        </Pressable>
        <RolePill role={role} onPress={cycleRole} isPrimary />
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

// ── Personal Mode Owner KTV data ─────────────────────────────────────────────

type PersonalVideo = {
  id: string; title: string; series: string | null; duration: string;
  views: string; timeAgo: string; emoji: string; hue: number;
  category: string; featured?: boolean;
};

const PERSONAL_VIDEOS: PersonalVideo[] = [
  // Series 1 - Building KaNeXT
  { id: 'pk1',  title: 'Why I Built an OS',                  series: 'Building KaNeXT',    duration: '12:34', views: '5.1K', timeAgo: '3 weeks ago', emoji: '🏗️',  hue: 200, category: 'Business' },
  { id: 'pk2',  title: 'KaNeXT Product Demo',                series: 'Building KaNeXT',    duration: '8:22',  views: '2.4K', timeAgo: '2 weeks ago', emoji: '📱',  hue: 220, category: 'Business' },
  { id: 'pk3',  title: 'The 4,000 Page Architecture',        series: 'Building KaNeXT',    duration: '15:47', views: '1.8K', timeAgo: '1 week ago',  emoji: '🗺️',  hue: 240, category: 'Business' },
  { id: 'pk4',  title: 'From Coach to CEO',                  series: 'Building KaNeXT',    duration: '10:15', views: '3.2K', timeAgo: '5 days ago',  emoji: '🎯',  hue: 30,  category: 'Business' },
  // Series 2 - Coaching Philosophy
  { id: 'pk5',  title: 'Why System Fit Matters More Than Talent', series: 'Coaching Philosophy', duration: '9:45',  views: '4.2K', timeAgo: '1 month ago', emoji: '🧩', hue: 150, category: 'Coaching' },
  { id: 'pk6',  title: 'Building Culture at Lincoln',        series: 'Coaching Philosophy', duration: '11:20', views: '2.8K', timeAgo: '3 weeks ago', emoji: '🏛️', hue: 165, category: 'Coaching' },
  { id: 'pk7',  title: 'Player Development Framework',       series: 'Coaching Philosophy', duration: '13:08', views: '1.9K', timeAgo: '2 weeks ago', emoji: '📊', hue: 180, category: 'Coaching' },
  // Series 3 - Creator Toolkit
  { id: 'pk8',  title: 'How I Use AI to Build Faster',       series: 'Creator Toolkit',     duration: '7:30',  views: '6.8K', timeAgo: '4 days ago',  emoji: '⚡', hue: 280, category: 'Creator' },
  { id: 'pk9',  title: 'My Content Creation Workflow',       series: 'Creator Toolkit',     duration: '8:55',  views: '3.4K', timeAgo: '1 week ago',  emoji: '🎬', hue: 300, category: 'Creator' },
  { id: 'pk10', title: 'Brand Deal Negotiation Tips',        series: 'Creator Toolkit',     duration: '11:42', views: '4.1K', timeAgo: '2 weeks ago', emoji: '🤝', hue: 320, category: 'Creator' },
  // Standalones
  { id: 'pk11', title: 'Day in My Life - Coach & CEO',       series: null,                  duration: '16:22', views: '8.9K', timeAgo: '2 days ago',  emoji: '🌟', hue: 45,  category: 'Behind the Scenes', featured: true },
  { id: 'pk12', title: 'Q&A: Ask Me Anything March 2026',   series: null,                  duration: '22:15', views: '2.1K', timeAgo: '1 week ago',  emoji: '🎙️', hue: 190, category: 'Q&A' },
];

const PERSONAL_SERIES = [
  { key: 'Building KaNeXT',    count: 4 },
  { key: 'Coaching Philosophy', count: 3 },
  { key: 'Creator Toolkit',    count: 3 },
];

const PERSONAL_CATEGORIES = ['All', 'Coaching', 'Business', 'Creator', 'Behind the Scenes', 'Q&A', 'Live'];

const EXPLORE_TRENDING = [
  { id: 'et1', title: 'How I Closed My First $100K Deal',    creator: 'Marcus Rivera',      handle: '@marcusrivera', initials: 'MR', views: '45K', duration: '12:45', emoji: '💰', hue: 25,  category: 'Business' },
  { id: 'et2', title: 'Sunday Service Highlights - Easter 2026', creator: 'Grace Church',  handle: '@gracechurch',  initials: 'GC', views: '28K', duration: '18:42', emoji: '✝️', hue: 195, category: 'Faith' },
  { id: 'et3', title: 'Full Game: Atlanta vs Chicago - Week 12', creator: 'HoopsNetwork',  handle: '@hoopsnet',     initials: 'HN', views: '62K', duration: '1:48:22', emoji: '🏀', hue: 210, category: 'Sports' },
  { id: 'et4', title: '5 AI Tools Every Creator Needs in 2026', creator: 'TechWithTanya', handle: '@techtanya',    initials: 'TT', views: '38K', duration: '9:30',  emoji: '🤖', hue: 270, category: 'Tech' },
  { id: 'et5', title: 'Morning Routine That Changed My Life',   creator: 'Nia Johnson',    handle: '@niawellness',  initials: 'NJ', views: '51K', duration: '14:22', emoji: '☀️', hue: 50,  category: 'Lifestyle' },
];

const EXPLORE_CREATORS = [
  { id: 'ec1', name: 'Marcus Rivera',    handle: '@marcusrivera', initials: 'MR', subscribers: '12K', category: 'Business',         latestVideo: 'Pitch Deck Breakdown',         hue: 25  },
  { id: 'ec2', name: 'TechWithTanya',    handle: '@techtanya',    initials: 'TT', subscribers: '8.4K', category: 'Tech',            latestVideo: 'Claude Code Deep Dive',        hue: 270 },
  { id: 'ec3', name: 'Coach DeMarcus',   handle: '@coachdm',      initials: 'CD', subscribers: '5.2K', category: 'Coaching/Sports', latestVideo: 'Defensive Schemes 101',        hue: 150 },
  { id: 'ec4', name: 'Grace Church Media', handle: '@gracechurch', initials: 'GC', subscribers: '3.8K', category: 'Faith',          latestVideo: "Pastor's Corner Ep. 24",      hue: 195 },
  { id: 'ec5', name: 'The Creator Lab',  handle: '@creatorlab',   initials: 'CL', subscribers: '15K', category: 'Business',         latestVideo: 'Monetize Your Audience',       hue: 40  },
  { id: 'ec6', name: 'Nia Johnson',      handle: '@niawellness',  initials: 'NJ', subscribers: '9.1K', category: 'Lifestyle',       latestVideo: 'Reset Your Week',              hue: 50  },
];

const EXPLORE_NEW_THIS_WEEK = [
  { id: 'en1', title: 'Building in Public - Week 14', creator: 'StartupSam', initials: 'SS', timeAgo: '2 days ago', views: '1.2K', duration: '18:30', emoji: '🚀', hue: 220 },
  { id: 'en2', title: 'How to Read a Balance Sheet',  creator: 'BizAcademy', initials: 'BA', timeAgo: '3 days ago', views: '890',  duration: '14:15', emoji: '📊', hue: 160 },
  { id: 'en3', title: 'Worship Set - Acoustic Session', creator: 'Vineyard Voices', initials: 'VV', timeAgo: '1 day ago', views: '2.1K', duration: '22:10', emoji: '🎸', hue: 200 },
  { id: 'en4', title: 'Film Breakdown: Zone Defense', creator: 'CoachDM',   initials: 'CD', timeAgo: '4 days ago', views: '3.4K', duration: '11:45', emoji: '📋', hue: 150 },
  { id: 'en5', title: 'My Studio Setup Tour 2026',    creator: 'CreatorKit', initials: 'CK', timeAgo: '2 days ago', views: '1.8K', duration: '9:22',  emoji: '🎙️', hue: 290 },
  { id: 'en6', title: 'Meal Prep Sunday',             creator: 'FitChef Marcus', initials: 'FM', timeAgo: '1 day ago', views: '4.2K', duration: '16:08', emoji: '🥗', hue: 120 },
];

const LIBRARY_HISTORY = [
  { id: 'lh1', title: 'Day in My Life - Coach & CEO',               creator: 'Sammy Kalejaiye',  duration: '16:22', timeAgo: 'Today',      emoji: '🌟', hue: 45  },
  { id: 'lh2', title: 'Lincoln @ LMU — Laolu 2 Three-Pointers',     creator: 'Lincoln Basketball', duration: '2:34', timeAgo: 'Today',      emoji: '🏀', hue: 0   },
  { id: 'lh3', title: 'Lincoln @ Simpson — Laolu 8 Three-Pointers', creator: 'Lincoln Basketball', duration: '4:05', timeAgo: 'Yesterday',  emoji: '🏀', hue: 10  },
  { id: 'lh4', title: 'How I Closed My First $100K Deal',           creator: 'Marcus Rivera',    duration: '12:45', timeAgo: 'Yesterday',  emoji: '💰', hue: 25  },
  { id: 'lh5', title: 'Lincoln @ Pepperdine — Laolu 12 Three-Pointers', creator: 'Lincoln Basketball', duration: '4:12', timeAgo: '2 days ago', emoji: '🏀', hue: 215 },
  { id: 'lh6', title: 'KaNeXT Product Demo',                        creator: 'Sammy Kalejaiye',  duration: '8:22',  timeAgo: '3 days ago', emoji: '📱', hue: 220 },
  { id: 'lh7', title: '5 AI Tools Every Creator Needs',             creator: 'TechWithTanya',    duration: '9:30',  timeAgo: '3 days ago', emoji: '🤖', hue: 270 },
];

const LIBRARY_WATCH_LATER = [
  { id: 'll1', title: 'My First KayTV Upload - Testing 1 2 3', creator: 'Sammy Kalejaiye', duration: '0:47',  emoji: '📹', hue: 190 },
  { id: 'll2', title: 'Q4 Product Roadmap Presentation',       creator: 'Alex Rivera CPO', duration: '31:48', emoji: '🗺️', hue: 240 },
  { id: 'll3', title: 'Top 10 Plays - Week 7 Highlights Reel', creator: 'Coach Rodriguez', duration: '4:15',  emoji: '🔥', hue: 12  },
  { id: 'll4', title: 'Lincoln @ Cal Maritime — Laolu 6 Three-Pointers', creator: 'Lincoln Basketball', duration: '3:15', emoji: '🏀', hue: 205 },
  { id: 'll5', title: 'Defensive Schemes 101',                  creator: 'CoachDM',         duration: '14:22', emoji: '📋', hue: 150 },
];

const LIBRARY_LIKED = [
  { id: 'lk1', title: 'Lincoln @ Pepperdine — Laolu 12 Three-Pointers', creator: 'Lincoln Basketball', duration: '4:12', emoji: '🏀', hue: 215 },
  { id: 'lk2', title: 'Lincoln @ Long Beach State — Laolu 6 Three-Pointers', creator: 'Lincoln Basketball', duration: '3:48', emoji: '🏀', hue: 45 },
  { id: 'lk3', title: 'Why I Built an OS',                      creator: 'Sammy Kalejaiye', duration: '12:34', emoji: '🏗️', hue: 200 },
  { id: 'lk4', title: 'How I Use AI to Build Faster',           creator: 'Sammy Kalejaiye', duration: '7:30',  emoji: '⚡', hue: 280 },
  { id: 'lk5', title: 'Sunday Service Highlights - Easter 2026', creator: 'Grace Church', duration: '18:42',  emoji: '✝️', hue: 195 },
];

const LIBRARY_PLAYLISTS = [
  { id: 'lp1', name: "Laolu's Best Games", count: 8, emojis: ['🏀','🏀','🏀','🏀'], hue: 215 },
  { id: 'lp2', name: 'Film Study',         count: 8, emojis: ['📋','🏀','🎬','📊'], hue: 150 },
  { id: 'lp3', name: 'Building KaNeXT',   count: 4, emojis: ['🏗️','📱','🗺️','🎯'], hue: 200 },
  { id: 'lp4', name: 'Inspiration',        count: 5, emojis: ['💰','✝️','🤖','☀️'], hue: 40  },
];

// ── Personal Mode Owner KTV View ─────────────────────────────────────────────

type LibTab = 'All' | 'Uploads' | 'Saved' | 'Watch Later';
const LIB_PILLS: LibTab[] = ['All', 'Uploads', 'Saved', 'Watch Later'];
type HomeSort = 'Recent' | 'Popular';

function PersonalOwnerKayTVView({
  C, insets, role, cycleRole, accent, tabParam, router,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
  accent: string;
  tabParam: string | string[] | undefined;
  router: any;
}) {
  const topBarH = insets.top + TOP_BAR_H;

  const [activeTab, setActiveTab] = React.useState<KayTab>(() =>
    (tabParam === 'Explore' || tabParam === 'Library') ? tabParam as KayTab : 'Home'
  );
  React.useEffect(() => {
    if (tabParam === 'Explore' || tabParam === 'Library' || tabParam === 'Home') {
      setActiveTab(tabParam as KayTab);
    }
  }, [tabParam]);

  const [homeCat, setHomeCat] = React.useState('All');
  const [homeSort, setHomeSort] = React.useState<HomeSort>('Recent');
  const [libPill, setLibPill] = React.useState<LibTab>('All');
  const [searchText, setSearchText] = React.useState('');
  const [subscribedIds, setSubscribedIds] = React.useState<string[]>([]);

  const featuredVideo = PERSONAL_VIDEOS.find(v => v.featured);

  const homeVideos = React.useMemo(() => {
    let list = homeCat === 'All' ? PERSONAL_VIDEOS : PERSONAL_VIDEOS.filter(v => v.category === homeCat);
    if (homeSort === 'Popular') {
      list = [...list].sort((a, b) => parseFloat(b.views) - parseFloat(a.views));
    }
    return list;
  }, [homeCat, homeSort]);

  const filteredTrending = React.useMemo(() => {
    if (!searchText.trim()) return EXPLORE_TRENDING;
    const q = searchText.toLowerCase();
    return EXPLORE_TRENDING.filter(v => v.title.toLowerCase().includes(q) || v.creator.toLowerCase().includes(q));
  }, [searchText]);

  const filteredNew = React.useMemo(() => {
    if (!searchText.trim()) return EXPLORE_NEW_THIS_WEEK;
    const q = searchText.toLowerCase();
    return EXPLORE_NEW_THIS_WEEK.filter(v => v.title.toLowerCase().includes(q));
  }, [searchText]);

  // ── Render helpers ──────────────────────────────────────────────────────────

  // Compact horizontal thumb card
  const ThumbCard = ({ item }: { item: { emoji: string; hue: number; title: string; duration: string; views?: string; timeAgo?: string } }) => (
    <Pressable
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      style={{ width: 160, marginRight: 10 }}
    >
      <View style={{ width: 160, height: 94, borderRadius: 10, backgroundColor: `hsl(${item.hue},38%,28%)`, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
        <Text style={{ fontSize: 36 }}>{item.emoji}</Text>
        <View style={{ position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 }}>
          <Text style={{ fontSize: 10, color: '#fff', fontWeight: '700' }}>{item.duration}</Text>
        </View>
      </View>
      <Text style={{ fontSize: 12, fontWeight: '600', color: C.label, marginBottom: 2 }} numberOfLines={1}>{item.title}</Text>
      {item.views !== undefined && (
        <Text style={{ fontSize: 11, color: C.secondary }}>{item.views} views</Text>
      )}
    </Pressable>
  );

  // Full-width video row
  const VideoRow = ({ v }: { v: PersonalVideo }) => (
    <Pressable
      key={v.id}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, marginBottom: 16 })}
    >
      {/* Thumbnail */}
      <View style={{ height: 196, borderRadius: 12, backgroundColor: `hsl(${v.hue},38%,28%)`, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <Text style={{ fontSize: 60 }}>{v.emoji}</Text>
        <View style={{ position: 'absolute', bottom: 8, right: 10, backgroundColor: 'rgba(0,0,0,0.72)', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3 }}>
          <Text style={{ fontSize: 12, color: '#fff', fontWeight: '700' }}>{v.duration}</Text>
        </View>
      </View>
      {/* Info */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.label }}>SK</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 3 }} numberOfLines={2}>{v.title}</Text>
          <Text style={{ fontSize: 12, color: C.secondary }}>Sammy Kalejaiye · @sammyk</Text>
          <Text style={{ fontSize: 11, color: C.secondary, marginTop: 1 }}>{v.views} views · {v.timeAgo}</Text>
        </View>
        <Pressable hitSlop={10} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <IconSymbol name="ellipsis" size={14} color={C.secondary} />
        </Pressable>
      </View>
    </Pressable>
  );

  // Section header with optional "See all"
  const SectionHeader = ({ title, count, onSeeAll }: { title: string; count?: number; onSeeAll?: () => void }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12, marginTop: 4 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, flex: 1 }}>{title}</Text>
      {count !== undefined && <Text style={{ fontSize: 13, color: C.secondary, marginRight: 8 }}>{count}</Text>}
      {onSeeAll && (
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text style={{ fontSize: 13, color: C.secondary, fontWeight: '600' }}>See all</Text>
        </Pressable>
      )}
    </View>
  );

  // ── Top bar ─────────────────────────────────────────────────────────────────

  const TopBar = () => (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, height: topBarH, paddingTop: insets.top, backgroundColor: C.bg, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8 }}>
      <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
        <KMenuButton />
      </Pressable>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{activeTab === 'Home' ? 'KayTV' : activeTab}</Text>
      </View>
      <RolePill role={role} onPress={cycleRole} isPrimary={true} />
    </View>
  );

  // ── HOME TAB ───────────────────────────────────────────────────────────────

  const HomeView = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: topBarH + 12, paddingBottom: 120 }}>

      {/* 1. Featured Video */}
      {featuredVideo && (
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          style={{ marginHorizontal: 16, marginBottom: 24 }}
        >
          <View style={{ height: 220, borderRadius: 16, backgroundColor: `hsl(${featuredVideo.hue},45%,25%)`, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <Text style={{ fontSize: 72 }}>{featuredVideo.emoji}</Text>
            {/* Gradient overlay at bottom */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end', padding: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 4 }} numberOfLines={1}>{featuredVideo.title}</Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>{featuredVideo.views} views · {featuredVideo.timeAgo}</Text>
            </View>
            {/* Duration badge */}
            <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.72)', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 }}>
              <Text style={{ fontSize: 12, color: '#fff', fontWeight: '700' }}>{featuredVideo.duration}</Text>
            </View>
            {/* Featured badge */}
            <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: '#8B2500', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 }}>
              <Text style={{ fontSize: 10, color: '#fff', fontWeight: '700' }}>FEATURED</Text>
            </View>
          </View>
        </Pressable>
      )}

      {/* 2. Series Rows */}
      {PERSONAL_SERIES.map(series => {
        const seriesVideos = PERSONAL_VIDEOS.filter(v => v.series === series.key);
        return (
          <View key={series.key} style={{ marginBottom: 24 }}>
            <SectionHeader title={series.key} count={series.count} onSeeAll={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
              {seriesVideos.map(v => <ThumbCard key={v.id} item={v} />)}
            </ScrollView>
          </View>
        );
      })}

      {/* 3. Categories section */}
      <View style={{ marginBottom: 20 }}>
        <SectionHeader title="Browse" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {PERSONAL_CATEGORIES.map(cat => (
            <Pressable
              key={cat}
              onPress={() => { Haptics.selectionAsync(); setHomeCat(cat); }}
              style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: homeCat === cat ? C.label : C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: homeCat === cat ? C.label : C.separator }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: homeCat === cat ? C.bg : C.secondary }}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* 4. All Videos */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 14 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, flex: 1 }}>All Videos</Text>
        {/* Sort toggle */}
        <View style={{ flexDirection: 'row', backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
          {(['Recent', 'Popular'] as HomeSort[]).map(s => (
            <Pressable key={s} onPress={() => { Haptics.selectionAsync(); setHomeSort(s); }} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: homeSort === s ? C.label : 'transparent' }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: homeSort === s ? C.bg : C.secondary }}>{s}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        {homeVideos.map(v => <VideoRow key={v.id} v={v} />)}
      </View>

    </ScrollView>
  );

  // ── EXPLORE TAB ────────────────────────────────────────────────────────────

  const ExploreView = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: topBarH + 12, paddingBottom: 120 }}>

      {/* Search bar */}
      <View style={{ marginHorizontal: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}>
        <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
        <Text style={{ flex: 1, fontSize: 14, color: C.secondary }}>Search KTV...</Text>
      </View>

      {/* Trending Now */}
      <View style={{ marginBottom: 24 }}>
        <SectionHeader title="Trending Now" onSeeAll={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
          {filteredTrending.map(v => (
            <Pressable key={v.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ width: 200 }}>
              <View style={{ height: 120, borderRadius: 12, backgroundColor: `hsl(${v.hue},40%,28%)`, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 44 }}>{v.emoji}</Text>
                <View style={{ position: 'absolute', bottom: 6, right: 7, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, color: '#fff', fontWeight: '700' }}>{v.duration}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 3 }} numberOfLines={2}>{v.title}</Text>
              <Text style={{ fontSize: 11, color: C.secondary }}>{v.creator} · {v.views} views</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Browse by Category */}
      <View style={{ marginBottom: 24 }}>
        <SectionHeader title="Browse by Category" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
          {[
            { name: 'Sports', emoji: '🏆', hue: 210 },
            { name: 'Business', emoji: '💼', hue: 30 },
            { name: 'Education', emoji: '🎓', hue: 160 },
            { name: 'Faith', emoji: '✝️', hue: 195 },
            { name: 'Lifestyle', emoji: '☀️', hue: 50 },
            { name: 'Music', emoji: '🎵', hue: 290 },
            { name: 'Tech', emoji: '💻', hue: 230 },
            { name: 'Coaching', emoji: '📊', hue: 150 },
            { name: 'Podcasts', emoji: '🎙️', hue: 320 },
          ].map(cat => (
            <Pressable key={cat.name} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={{ width: 90, height: 70, borderRadius: 12, backgroundColor: `hsl(${cat.hue},30%,20%)`, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <Text style={{ fontSize: 24 }}>{cat.emoji}</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff' }}>{cat.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Creators You Might Like */}
      <View style={{ marginBottom: 24 }}>
        <SectionHeader title="Creators You Might Like" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
          {EXPLORE_CREATORS.map(creator => (
            <View key={creator.id} style={{ width: 140, backgroundColor: C.surface, borderRadius: 14, padding: 12, alignItems: 'center' }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: `hsl(${creator.hue},38%,32%)`, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>{creator.initials}</Text>
              </View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, textAlign: 'center', marginBottom: 2 }} numberOfLines={1}>{creator.name}</Text>
              <Text style={{ fontSize: 11, color: C.secondary, marginBottom: 4 }}>{creator.subscribers} subscribers</Text>
              <Text style={{ fontSize: 10, color: C.secondary, marginBottom: 10, textAlign: 'center' }} numberOfLines={1}>{creator.latestVideo}</Text>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSubscribedIds(prev => prev.includes(creator.id) ? prev.filter(id => id !== creator.id) : [...prev, creator.id]); }}
                style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, backgroundColor: subscribedIds.includes(creator.id) ? C.label : 'transparent', borderWidth: 1.5, borderColor: subscribedIds.includes(creator.id) ? C.label : C.separator }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: subscribedIds.includes(creator.id) ? C.bg : C.label }}>
                  {subscribedIds.includes(creator.id) ? 'Subscribed' : 'Subscribe'}
                </Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* New This Week - 2 col grid */}
      <View style={{ marginBottom: 24 }}>
        <SectionHeader title="New This Week" />
        <View style={{ paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {filteredNew.map(v => (
            <Pressable key={v.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={{ width: '47%' }}>
              <View style={{ height: 90, borderRadius: 10, backgroundColor: `hsl(${v.hue},38%,28%)`, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 32 }}>{v.emoji}</Text>
                <View style={{ position: 'absolute', bottom: 5, right: 6, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1 }}>
                  <Text style={{ fontSize: 9, color: '#fff', fontWeight: '700' }}>{v.duration}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.label, marginBottom: 2 }} numberOfLines={2}>{v.title}</Text>
              <Text style={{ fontSize: 11, color: C.secondary }}>{v.creator} · {v.views} views</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* For You */}
      <View style={{ marginBottom: 24 }}>
        <SectionHeader title="For You" />
        <View style={{ paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {[...PERSONAL_VIDEOS].sort(() => Math.random() - 0.5).slice(0, 6).map(v => (
            <Pressable key={v.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ width: '47%' }}>
              <View style={{ height: 90, borderRadius: 10, backgroundColor: `hsl(${v.hue},38%,28%)`, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 32 }}>{v.emoji}</Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.label, marginBottom: 1 }} numberOfLines={2}>{v.title}</Text>
              <Text style={{ fontSize: 11, color: C.secondary }}>{v.views} views</Text>
            </Pressable>
          ))}
        </View>
      </View>

    </ScrollView>
  );

  // ── LIBRARY TAB ────────────────────────────────────────────────────────────

  const LibraryView = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: topBarH + 56, paddingBottom: 120 }}>

      {/* Library Row helper */}
      {([
        { label: 'Watch History', items: LIBRARY_HISTORY },
        { label: 'Watch Later',   items: LIBRARY_WATCH_LATER },
        { label: 'Liked Videos',  items: LIBRARY_LIKED },
      ] as const).map(({ label, items }) => {
        const show = libPill === 'All' || (libPill === 'Saved' && (label === 'Watch Later' || label === 'Liked Videos')) || (libPill === 'Watch Later' && label === 'Watch Later');
        if (!show) return null;
        return (
          <View key={label} style={{ marginBottom: 24 }}>
            <SectionHeader title={label} onSeeAll={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
              {(items as any[]).map((v: any) => <ThumbCard key={v.id} item={v} />)}
            </ScrollView>
          </View>
        );
      })}

      {/* Playlists */}
      {(libPill === 'All' || libPill === 'Saved') && (
        <View style={{ marginBottom: 24 }}>
          <SectionHeader title="Playlists" onSeeAll={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {LIBRARY_PLAYLISTS.map(pl => (
              <Pressable key={pl.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ width: 140 }}>
                <View style={{ height: 90, borderRadius: 10, backgroundColor: `hsl(${pl.hue},38%,28%)`, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 28 }}>{pl.emojis[0]}</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 2 }} numberOfLines={1}>{pl.name}</Text>
                <Text style={{ fontSize: 11, color: C.secondary }}>{pl.count} videos</Text>
              </Pressable>
            ))}
            {/* + New Playlist */}
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ width: 140, height: 90, borderRadius: 10, borderWidth: 1.5, borderColor: C.separator, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' }}>
              <IconSymbol name="plus" size={22} color={C.secondary} />
              <Text style={{ fontSize: 11, color: C.secondary, marginTop: 4 }}>New Playlist</Text>
            </Pressable>
          </ScrollView>
        </View>
      )}

      {/* Uploads (Owner only, visible when All or Uploads) */}
      {(libPill === 'All' || libPill === 'Uploads') && (
        <View style={{ marginBottom: 24 }}>
          <SectionHeader title="Your Uploads" count={PERSONAL_VIDEOS.length} onSeeAll={() => router.push('/(tabs)/(main)/kaytv/my-channel' as any)} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
            {PERSONAL_VIDEOS.map(v => (
              <Pressable key={v.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ width: 160 }}>
                <View style={{ width: 160, height: 94, borderRadius: 10, backgroundColor: `hsl(${v.hue},38%,28%)`, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 36 }}>{v.emoji}</Text>
                  <View style={{ position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 10, color: '#fff', fontWeight: '700' }}>{v.duration}</Text>
                  </View>
                  <View style={{ position: 'absolute', top: 6, left: 6, backgroundColor: '#5A8A6E', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 9, color: '#fff', fontWeight: '700' }}>Published</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: C.label, marginBottom: 2 }} numberOfLines={1}>{v.title}</Text>
                <Text style={{ fontSize: 11, color: C.secondary }}>{v.views} views</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

    </ScrollView>
  );

  // ── Library filter pills (only on Library tab) ─────────────────────────────

  const LibraryPills = () => activeTab === 'Library' ? (
    <View style={{ position: 'absolute', top: topBarH, left: 0, right: 0, zIndex: 15, backgroundColor: C.bg, paddingVertical: 8 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {LIB_PILLS.map(p => (
          <Pressable key={p} onPress={() => { Haptics.selectionAsync(); setLibPill(p); }}
            style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: libPill === p ? C.label : C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: libPill === p ? C.label : C.separator }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: libPill === p ? C.bg : C.secondary }}>{p}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  ) : null;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar />
      <LibraryPills />
      {activeTab === 'Home'    && <HomeView />}
      {activeTab === 'Explore' && <ExploreView />}
      {activeTab === 'Library' && <LibraryView />}
      {/* FAB — Upload (only on Home tab) */}
      {activeTab === 'Home' && (
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/(tabs)/(main)/kaytv/upload' as any); }}
          style={{ position: 'absolute', bottom: 80, right: 24, width: 52, height: 52, borderRadius: 26, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
        >
          <IconSymbol name="plus" size={22} color={C.bg} />
        </Pressable>
      )}
    </View>
  );
}

// ── Personal Mode Subscriber KTV data ─────────────────────────────────────────

const SUB_VIDEOS = [
  { id: 'sv1',  title: 'Day in My Life - Coach & CEO',             emoji: '🌟', hue: 45,  duration: '16:22', views: '8.9K', timeAgo: '2 days ago',  locked: false },
  { id: 'sv2',  title: 'How I Use AI to Build Faster',             emoji: '⚡', hue: 280, duration: '7:30',  views: '6.8K', timeAgo: '4 days ago',  locked: false },
  { id: 'sv3',  title: 'Why I Built an OS',                        emoji: '🏗️',  hue: 200, duration: '12:34', views: '5.1K', timeAgo: '2 weeks ago', locked: false },
  { id: 'sv4',  title: 'Brand Deal Negotiation Tips',              emoji: '🤝', hue: 320, duration: '11:42', views: '4.1K', timeAgo: '3 weeks ago', locked: false },
  { id: 'sv5',  title: 'Why System Fit Matters More Than Talent',  emoji: '🧩', hue: 150, duration: '9:45',  views: '4.2K', timeAgo: '3 weeks ago', locked: false },
  { id: 'sv6',  title: 'My Content Creation Workflow',             emoji: '🎬', hue: 300, duration: '8:55',  views: '3.4K', timeAgo: '3 weeks ago', locked: false },
  { id: 'sv7',  title: 'From Coach to CEO',                        emoji: '🎯', hue: 30,  duration: '10:15', views: '3.2K', timeAgo: '1 month ago', locked: false },
  { id: 'sv8',  title: 'Building Culture at Lincoln',              emoji: '🏛️', hue: 165, duration: '11:20', views: '2.8K', timeAgo: '1 month ago', locked: false },
  { id: 'sv9',  title: 'Inner Circle: Full Business Breakdown',    emoji: '🔒', hue: 100, duration: '28:30', views: '',     timeAgo: '',            locked: true  },
  { id: 'sv10', title: 'Inner Circle: Fundraising Strategy',       emoji: '🔒', hue: 130, duration: '19:15', views: '',     timeAgo: '',            locked: true  },
];

const SUB_MORE_FOR_YOU = [
  { id: 'my1', title: 'Ep 12: Building in Public', creator: 'Chris Walker', emoji: '🛠️', hue: 200, duration: '22:10', views: '12K' },
  { id: 'my2', title: 'Morning Habits That Scale', creator: 'Aaliya Rhodes', emoji: '🌅', hue: 50,  duration: '9:45',  views: '8.4K' },
  { id: 'my3', title: 'Pitch Perfect Framework',   creator: 'Jordan Hayes', emoji: '🎯', hue: 340, duration: '14:22', views: '6.2K' },
  { id: 'my4', title: 'Deep Work Protocol 2026',   creator: 'Priya Nair',   emoji: '🧠', hue: 270, duration: '18:00', views: '15K'  },
];

const SUB_EXPLORE_TRENDING = [
  { id: 'et1', title: 'The Creator Economy Is Dead (Long Live It)', creator: 'Marcus Bell',   emoji: '📈', hue: 30,  views: '142K', duration: '24:18' },
  { id: 'et2', title: 'How I Made $0 to $10K in 90 Days',         creator: 'Lena Park',      emoji: '💰', hue: 80,  views: '98K',  duration: '18:44' },
  { id: 'et3', title: 'AI Tools for Athletes & Coaches',           creator: 'Devon Walsh',   emoji: '🤖', hue: 200, views: '67K',  duration: '12:30' },
  { id: 'et4', title: 'Building a Brand With Zero Budget',         creator: 'Talia James',   emoji: '🎨', hue: 300, views: '54K',  duration: '15:22' },
  { id: 'et5', title: 'Fitness Meets Entrepreneurship',            creator: 'Rafael Torres', emoji: '💪', hue: 150, views: '41K',  duration: '20:08' },
];

const SUB_LIB_HISTORY = [
  { id: 'lh1', title: 'Day in My Life - Coach & CEO', creator: 'Sammy Kalejaiye', emoji: '🌟', hue: 45,  duration: '16:22', progress: 0.72 },
  { id: 'lh2', title: 'How I Use AI to Build Faster', creator: 'Sammy Kalejaiye', emoji: '⚡', hue: 280, duration: '7:30',  progress: 1.00 },
  { id: 'lh3', title: 'The Creator Economy Is Dead',  creator: 'Marcus Bell',      emoji: '📈', hue: 30,  duration: '24:18', progress: 0.35 },
];

const SUB_WATCH_LATER = [
  { id: 'wl1', title: 'Building a Brand With Zero Budget', creator: 'Talia James',   emoji: '🎨', hue: 300, duration: '15:22' },
  { id: 'wl2', title: 'Fitness Meets Entrepreneurship',    creator: 'Rafael Torres', emoji: '💪', hue: 150, duration: '20:08' },
  { id: 'wl3', title: 'Pitch Perfect Framework',           creator: 'Jordan Hayes',  emoji: '🎯', hue: 340, duration: '14:22' },
];

function PersonalSubscriberKayTVView({
  C, insets, role, cycleRole, accent, tabParam,
}: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  role: string;
  cycleRole: () => void;
  accent: string;
  tabParam?: string;
}) {
  type SubTab = 'Home' | 'Explore' | 'Library';
  const [activeTab, setActiveTab] = React.useState<SubTab>(() =>
    (tabParam === 'Explore' || tabParam === 'Library') ? tabParam : 'Home'
  );
  const [subFilter, setSubFilter] = React.useState<'All' | 'Public' | 'Subscribers Only'>('All');
  const [subscribed, setSubscribed] = React.useState(true);
  const topBarH = insets.top + 52;

  React.useEffect(() => {
    if (tabParam === 'Home' || tabParam === 'Explore' || tabParam === 'Library') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);


  // ── Home: creator's channel view ────────────────────────────────────────────
  const HomeView = () => {
    const filteredVideos = subFilter === 'Public'
      ? SUB_VIDEOS.filter(v => !v.locked)
      : subFilter === 'Subscribers Only'
      ? SUB_VIDEOS.filter(v => v.locked)
      : SUB_VIDEOS;

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Channel header */}
        <View style={{ backgroundColor: '#1A2535', height: 140, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 24, opacity: 0.3 }}>
            <Text style={{ fontSize: 40 }}>🏀</Text>
            <Text style={{ fontSize: 40 }}>💻</Text>
            <Text style={{ fontSize: 40 }}>🎬</Text>
          </View>
        </View>

        {/* Avatar + info */}
        <View style={{ alignItems: 'center', marginTop: -36, paddingBottom: 16 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#2A3550', borderWidth: 3, borderColor: C.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff' }}>SK</Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.label }}>Sammy Kalejaiye</Text>
          <Text style={{ fontSize: 13, color: C.secondary, marginTop: 2 }}>@sammyk · 3.4K subscribers</Text>
          <Text style={{ fontSize: 12, color: C.secondary, marginTop: 4 }}>12 videos · 142.8K views</Text>

          {/* Subscribe button */}
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setSubscribed(!subscribed); }}
            style={{ marginTop: 12, paddingHorizontal: 28, paddingVertical: 10, borderRadius: 22, backgroundColor: subscribed ? C.surface : C.label, borderWidth: subscribed ? 1 : 0, borderColor: C.separator }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: subscribed ? C.secondary : C.bg }}>
              {subscribed ? '✓ Subscribed' : 'Subscribe'}
            </Text>
          </Pressable>
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}>
          {(['All', 'Public', 'Subscribers Only'] as const).map(f => {
            const active = subFilter === f;
            return (
              <Pressable key={f} onPress={() => { Haptics.selectionAsync(); setSubFilter(f); }}
                style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: active ? C.activePill : C.surface }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: active ? C.activePillText : C.secondary }}>
                  {f === 'Subscribers Only' ? '🔒 Subscribers Only' : f}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Video grid 2-column */}
        <View style={{ paddingHorizontal: 12 }}>
          {Array.from({ length: Math.ceil(filteredVideos.length / 2) }).map((_, rowIdx) => {
            const pair = filteredVideos.slice(rowIdx * 2, rowIdx * 2 + 2);
            return (
              <View key={rowIdx} style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                {pair.map(video => (
                  <Pressable
                    key={video.id}
                    onPress={() => Haptics.selectionAsync()}
                    style={({ pressed }) => [{ flex: 1, borderRadius: 10, overflow: 'hidden', backgroundColor: C.surface, opacity: pressed ? 0.85 : 1 }]}
                  >
                    <View style={{ height: 90, backgroundColor: video.locked ? C.separator : `hsl(${video.hue},35%,${video.locked ? '20' : '28'}%)`, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 28, opacity: video.locked ? 0.4 : 1 }}>{video.emoji}</Text>
                      {video.locked && (
                        <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                          <Text style={{ fontSize: 20 }}>🔒</Text>
                        </View>
                      )}
                      {!video.locked && (
                        <View style={{ position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 }}>
                          <Text style={{ fontSize: 8, color: '#fff', fontWeight: '700' }}>{video.duration}</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ padding: 8 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: video.locked ? C.secondary : C.label, lineHeight: 16 }} numberOfLines={2}>{video.title}</Text>
                      {video.locked
                        ? <Text style={{ fontSize: 10, color: CAUTION, marginTop: 3 }}>Upgrade to watch</Text>
                        : <Text style={{ fontSize: 10, color: C.secondary, marginTop: 3 }}>{video.views} views · {video.timeAgo}</Text>
                      }
                    </View>
                  </Pressable>
                ))}
                {pair.length === 1 && <View style={{ flex: 1 }} />}
              </View>
            );
          })}
        </View>

        {/* More For You */}
        <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, paddingHorizontal: 16, marginTop: 8, marginBottom: 10 }}>More For You</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
          {SUB_MORE_FOR_YOU.map(v => (
            <Pressable key={v.id} onPress={() => Haptics.selectionAsync()} style={{ width: 160 }}>
              <View style={{ height: 90, borderRadius: 10, backgroundColor: `hsl(${v.hue},35%,28%)`, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 28 }}>{v.emoji}</Text>
                <View style={{ position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 }}>
                  <Text style={{ fontSize: 8, color: '#fff', fontWeight: '700' }}>{v.duration}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: C.label }} numberOfLines={2}>{v.title}</Text>
              <Text style={{ fontSize: 10, color: C.secondary }}>{v.creator}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>
    );
  };

  // ── Explore: same discovery content as Owner ────────────────────────────────
  const ExploreView = () => {
    const [searchText, setSearchText] = React.useState('');
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}>
        {/* Search bar */}
        <View style={{ marginHorizontal: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 12, gap: 8 }}>
          <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
          <TextInput style={{ flex: 1, fontSize: 15, color: C.label, paddingVertical: 12 }} placeholder="Search KTV..." placeholderTextColor={C.secondary} value={searchText} onChangeText={setSearchText} />
        </View>

        {/* Trending */}
        <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, paddingHorizontal: 16, marginBottom: 10 }}>🔥 Trending Now</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 16 }}>
          {SUB_EXPLORE_TRENDING.map(v => (
            <Pressable key={v.id} onPress={() => Haptics.selectionAsync()} style={{ width: 200 }}>
              <View style={{ height: 112, borderRadius: 10, backgroundColor: `hsl(${v.hue},35%,28%)`, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 36 }}>{v.emoji}</Text>
                <View style={{ position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 }}>
                  <Text style={{ fontSize: 9, color: '#fff', fontWeight: '700' }}>{v.duration}</Text>
                </View>
                <View style={{ position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 9, color: '#fff' }}>{v.views} views</Text>
                </View>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: C.label, lineHeight: 16 }} numberOfLines={2}>{v.title}</Text>
              <Text style={{ fontSize: 10, color: C.secondary }}>{v.creator}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>
    );
  };

  // ── Library: follower's own cross-brand library ─────────────────────────────
  const LibraryView = () => {
    type LibPill = 'All' | 'Saved' | 'Watch Later';
    const [libPill, setLibPill] = React.useState<LibPill>('All');
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}>
        {/* Filter pills — no Uploads for follower */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 14 }}>
          {(['All', 'Saved', 'Watch Later'] as LibPill[]).map(p => {
            const active = libPill === p;
            return (
              <Pressable key={p} onPress={() => { Haptics.selectionAsync(); setLibPill(p); }}
                style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: active ? C.activePill : C.surface }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: active ? C.activePillText : C.secondary }}>{p}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Watch History */}
        {(libPill === 'All' || libPill === 'Saved') && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, paddingHorizontal: 16, marginBottom: 10 }}>Continue Watching</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {SUB_LIB_HISTORY.map(v => (
                <Pressable key={v.id} onPress={() => Haptics.selectionAsync()} style={{ width: 180 }}>
                  <View style={{ height: 100, borderRadius: 10, backgroundColor: `hsl(${v.hue},35%,28%)`, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                    <Text style={{ fontSize: 32 }}>{v.emoji}</Text>
                    {/* Progress bar */}
                    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.2)', borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
                      <View style={{ width: `${v.progress * 100}%`, height: 3, backgroundColor: CAUTION, borderBottomLeftRadius: 10 }} />
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }} numberOfLines={2}>{v.title}</Text>
                  <Text style={{ fontSize: 10, color: C.secondary }}>{v.creator}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Watch Later */}
        {(libPill === 'All' || libPill === 'Watch Later') && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, paddingHorizontal: 16, marginBottom: 10 }}>Watch Later</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {SUB_WATCH_LATER.map(v => (
                <Pressable key={v.id} onPress={() => Haptics.selectionAsync()} style={{ width: 160 }}>
                  <View style={{ height: 90, borderRadius: 10, backgroundColor: `hsl(${v.hue},35%,28%)`, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                    <Text style={{ fontSize: 28 }}>{v.emoji}</Text>
                    <View style={{ position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 }}>
                      <Text style={{ fontSize: 8, color: '#fff', fontWeight: '700' }}>{v.duration}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }} numberOfLines={2}>{v.title}</Text>
                  <Text style={{ fontSize: 10, color: C.secondary }}>{v.creator}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: insets.top, height: topBarH, backgroundColor: C.bg, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, alignItems: 'center' }}>
          <KMenuButton />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{activeTab === 'Home' ? 'KayTV' : activeTab}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <RolePill role={role} onPress={cycleRole} isPrimary={false} />
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1, marginTop: topBarH }}>
        {activeTab === 'Home'    && <HomeView />}
        {activeTab === 'Explore' && <ExploreView />}
        {activeTab === 'Library' && <LibraryView />}
      </View>
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

  // ── Personal mode: default to My Channel (redirect unless Explore/Library param) ──
  if (mode === 'personal' && (!tabParam || tabParam === 'Home')) {
    return <Redirect href="/(tabs)/(main)/kaytv/my-channel" />;
  }

  // ── Personal Subscriber: creator channel view with tabs ───────────────────
  if (mode === 'personal' && !isOwner) {
    return (
      <PersonalSubscriberKayTVView
        C={C}
        insets={insets}
        role={role}
        cycleRole={cycleRole}
        accent={accent}
        tabParam={tabParam}
      />
    );
  }

  // ── Personal Owner: structured creator KTV view ───────────────────────────
  if (mode === 'personal' && isOwner) {
    return (
      <PersonalOwnerKayTVView
        C={C}
        insets={insets}
        role={role}
        cycleRole={cycleRole}
        accent={accent}
        tabParam={tabParam}
        router={router}
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
