/**
 * KayTV — Library (Personal Mode)
 * Owner:    All-modes saved videos — Watch Later, Liked, Saved Playlists
 * Follower: Personal Mode saved videos only — Watch Later, Liked
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput, StyleSheet, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;

type LibraryFilter = 'All' | 'Watch Later' | 'Liked' | 'Saved Playlists';
type VideoMode     = 'Personal' | 'Business' | 'Education' | 'Community' | 'Athletics';
type SaveType      = 'watch_later' | 'liked' | 'playlist';

type SavedVideo = {
  id: string;
  title: string;
  creator: string;
  mode: VideoMode;
  dateSaved: string;
  duration: string;
  hue: number;
  emoji: string;
  saveType: SaveType;
  playlist?: string;
};

// ── Mock data ─────────────────────────────────────────────────────────────────

const OWNER_VIDEOS: SavedVideo[] = [
  { id: 'sv1',  title: 'How to Scale a Creator Brand',        creator: 'Marcus James',   mode: 'Personal',  dateSaved: 'Today',    duration: '22:14', hue: 200, emoji: '🚀', saveType: 'watch_later'  },
  { id: 'sv2',  title: 'Q4 Sales Strategy Masterclass',       creator: 'Acme Corp',      mode: 'Business',  dateSaved: 'Today',    duration: '47:30', hue: 30,  emoji: '📊', saveType: 'liked'        },
  { id: 'sv3',  title: 'Basketball IQ Training Vol. 3',        creator: 'Coach Riley',    mode: 'Athletics', dateSaved: 'Yesterday',duration: '18:55', hue: 120, emoji: '🏀', saveType: 'watch_later'  },
  { id: 'sv4',  title: 'Student Success Summit Keynote',       creator: 'Lincoln Univ.',  mode: 'Education', dateSaved: 'Yesterday',duration: '35:00', hue: 280, emoji: '🎓', saveType: 'playlist', playlist: 'Education Gems' },
  { id: 'sv5',  title: 'Community Leadership 101',             creator: 'City Connect',   mode: 'Community', dateSaved: '3 days ago',duration: '28:22', hue: 170, emoji: '🏙️', saveType: 'liked'       },
  { id: 'sv6',  title: 'My Morning Routine (Real Talk)',       creator: 'Sammy K',        mode: 'Personal',  dateSaved: '3 days ago',duration: '9:22',  hue: 45,  emoji: '☀️', saveType: 'playlist', playlist: 'Morning Fuel' },
  { id: 'sv7',  title: 'Recruiting Film Analysis 2026',        creator: 'Coach Reid',     mode: 'Athletics', dateSaved: '1 week ago',duration: '14:08', hue: 350, emoji: '🏈', saveType: 'watch_later' },
  { id: 'sv8',  title: 'Building a SaaS from Scratch',         creator: 'TechVentures',   mode: 'Business',  dateSaved: '1 week ago',duration: '52:40', hue: 220, emoji: '💻', saveType: 'liked'        },
  { id: 'sv9',  title: 'Faith & Entrepreneurship Panel',       creator: 'Hope Church',    mode: 'Community', dateSaved: '2 weeks ago',duration: '61:15',hue: 60,  emoji: '✝️', saveType: 'playlist', playlist: 'Inspiration'  },
  { id: 'sv10', title: 'Campus Tour: Engineering Wing',        creator: 'Howard Univ.',   mode: 'Education', dateSaved: '2 weeks ago',duration: '8:00', hue: 190, emoji: '🏛️', saveType: 'liked'       },
  { id: 'sv11', title: 'Brand Deal Negotiation Tips',          creator: 'Sammy K',        mode: 'Personal',  dateSaved: '1 month ago',duration: '11:42',hue: 320, emoji: '🤝', saveType: 'watch_later' },
  { id: 'sv12', title: 'Strength & Conditioning Pre-Season',   creator: 'Elite Training', mode: 'Athletics', dateSaved: '1 month ago',duration: '31:05',hue: 150, emoji: '💪', saveType: 'playlist', playlist: 'Workouts'     },
];

const FOLLOWER_VIDEOS: SavedVideo[] = [
  { id: 'fv1', title: 'Why I Built an OS',                   creator: 'Sammy K',      mode: 'Personal', dateSaved: 'Today',     duration: '12:34', hue: 200, emoji: '🏗️', saveType: 'watch_later'  },
  { id: 'fv2', title: 'From Coach to CEO',                   creator: 'Sammy K',      mode: 'Personal', dateSaved: 'Yesterday', duration: '10:15', hue: 30,  emoji: '🎯', saveType: 'liked'        },
  { id: 'fv3', title: 'How I Use AI to Build Faster',        creator: 'Dev Mora',     mode: 'Personal', dateSaved: '2 days ago',duration: '7:30',  hue: 280, emoji: '⚡', saveType: 'watch_later'  },
  { id: 'fv4', title: 'Creator Blueprint Ep. 12',            creator: 'Alicia Chen',  mode: 'Personal', dateSaved: '3 days ago',duration: '24:00', hue: 120, emoji: '📋', saveType: 'liked'        },
  { id: 'fv5', title: 'My Content Creation Workflow',        creator: 'Sammy K',      mode: 'Personal', dateSaved: '1 week ago',duration: '8:55',  hue: 300, emoji: '🎬', saveType: 'liked'        },
  { id: 'fv6', title: 'Building Personal Brand on Socials',  creator: 'Jordan Wells', mode: 'Personal', dateSaved: '1 week ago',duration: '19:22', hue: 170, emoji: '📱', saveType: 'watch_later'  },
  { id: 'fv7', title: 'Day in My Life - Entrepreneur',       creator: 'Mia Torres',   mode: 'Personal', dateSaved: '2 weeks ago',duration: '16:40',hue: 45,  emoji: '🌟', saveType: 'liked'        },
  { id: 'fv8', title: 'Morning Habits That Changed My Life', creator: 'Kai Johnson',  mode: 'Personal', dateSaved: '3 weeks ago',duration: '11:05',hue: 60,  emoji: '☀️', saveType: 'watch_later'  },
];

const MODE_BADGE_COLORS: Record<VideoMode, string> = {
  Personal:  '#9C9790',
  Business:  '#9C9790',
  Education: '#9C9790',
  Community: '#9C9790',
  Athletics: '#9C9790',
};

// ── Main screen ───────────────────────────────────────────────────────────────

export default function LibraryScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaytv');
  const isOwner = role === roleCycles[0];

  const allVideos   = isOwner ? OWNER_VIDEOS : FOLLOWER_VIDEOS;
  const ownerFilters: LibraryFilter[]    = ['All', 'Watch Later', 'Liked', 'Saved Playlists'];
  const followerFilters: LibraryFilter[] = ['All', 'Watch Later', 'Liked'];
  const filters = isOwner ? ownerFilters : followerFilters;

  const [activeFilter, setActiveFilter] = useState<LibraryFilter>('All');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [removed,      setRemoved]      = useState<Set<string>>(new Set());

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filtered = useMemo(() => {
    let list = allVideos.filter(v => !removed.has(v.id));
    if (activeFilter === 'Watch Later')    list = list.filter(v => v.saveType === 'watch_later');
    else if (activeFilter === 'Liked')     list = list.filter(v => v.saveType === 'liked');
    else if (activeFilter === 'Saved Playlists') list = list.filter(v => v.saveType === 'playlist');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(v => v.title.toLowerCase().includes(q) || v.creator.toLowerCase().includes(q));
    }
    return list;
  }, [allVideos, activeFilter, searchQuery, removed]);

  function removeVideo(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRemoved(prev => new Set([...prev, id]));
  }

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* ── Top Bar ── */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, alignItems: 'center' }}>
            <KMenuButton />
          </Pressable>
          <View style={s.titleWrap}>
            <Text style={[s.title, { color: C.label }]}>Library</Text>
          </View>
          <RolePill role={role} onPress={cycleRole} accentColor="#1A1714" isPrimary={isOwner} />
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: insets.bottom + 100 }}
      >
        {/* ── Search Bar ── */}
        <View style={[s.searchWrap, { backgroundColor: C.surface }]}>
          <IconSymbol name="magnifyingglass" size={15} color={C.secondary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search saved videos…"
            placeholderTextColor={C.secondary}
            style={[s.searchInput, { color: C.label }]}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={15} color={C.secondary} />
            </Pressable>
          )}
        </View>

        {/* ── Filter Pills ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 4 }}>
          {filters.map(f => (
            <Pressable
              key={f}
              onPress={() => { Haptics.selectionAsync(); setActiveFilter(f); }}
              style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: activeFilter === f ? C.activePill : C.surface }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: activeFilter === f ? C.activePillText : C.secondary }}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Count label ── */}
        <Text style={[s.countLabel, { color: C.secondary }]}>
          {filtered.length} {filtered.length === 1 ? 'video' : 'videos'}
          {!isOwner ? ' · Personal Mode' : ''}
        </Text>

        {/* ── Video list ── */}
        {filtered.length === 0 ? (
          <View style={s.emptyState}>
            <IconSymbol name="books.vertical" size={40} color={C.secondary} />
            <Text style={[s.emptyTitle, { color: C.label }]}>Nothing here yet</Text>
            <Text style={[s.emptyBody, { color: C.secondary }]}>
              {searchQuery ? 'No results for that search.' : 'Videos you save will appear here.'}
            </Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16, gap: 1 }}>
            {filtered.map((video, idx) => (
              <Pressable
                key={video.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.navigate({ pathname: '/(tabs)/(main)/kaytv/player' as any, params: { videoId: video.id } });
                }}
                onLongPress={() => removeVideo(video.id)}
                style={[
                  s.videoRow,
                  { borderBottomColor: C.separator, borderBottomWidth: idx < filtered.length - 1 ? StyleSheet.hairlineWidth : 0 },
                ]}
              >
                {/* Thumbnail */}
                <View style={[s.thumb, { backgroundColor: `hsl(${video.hue},38%,22%)` }]}>
                  <Text style={{ fontSize: 22 }}>{video.emoji}</Text>
                  <View style={s.durationBadge}>
                    <Text style={s.durationText}>{video.duration}</Text>
                  </View>
                </View>

                {/* Info */}
                <View style={s.info}>
                  <Text style={[s.videoTitle, { color: C.label }]} numberOfLines={2}>{video.title}</Text>
                  <Text style={[s.creatorName, { color: C.secondary }]}>{video.creator}</Text>
                  <View style={s.metaRow}>
                    {isOwner && (
                      <View style={[s.modeBadge, { backgroundColor: C.surface }]}>
                        <Text style={[s.modeBadgeText, { color: C.secondary }]}>{video.mode}</Text>
                      </View>
                    )}
                    {video.playlist && (
                      <View style={[s.modeBadge, { backgroundColor: C.surface }]}>
                        <IconSymbol name="list.bullet" size={9} color={C.secondary} />
                        <Text style={[s.modeBadgeText, { color: C.secondary }]}>{video.playlist}</Text>
                      </View>
                    )}
                    <Text style={[s.dateSaved, { color: C.secondary }]}>{video.dateSaved}</Text>
                  </View>
                </View>

                {/* Save type icon */}
                <IconSymbol
                  name={video.saveType === 'liked' ? 'heart.fill' : video.saveType === 'playlist' ? 'list.bullet' : 'clock.fill'}
                  size={14}
                  color={C.secondary}
                />
              </Pressable>
            ))}
            <Text style={[s.swipeHint, { color: C.secondary }]}>Long-press a video to remove it from Library</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root:        { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:      { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  titleWrap:   { flex: 1, alignItems: 'center' },
  title:       { fontSize: 15, fontWeight: '700' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 12,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15 },

  countLabel: { fontSize: 12, fontWeight: '600', paddingHorizontal: 16, marginTop: 8, marginBottom: 10 },

  videoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12,
  },
  thumb: {
    width: 120, height: 72, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  durationBadge: {
    position: 'absolute', bottom: 4, right: 5,
    backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 4,
    paddingHorizontal: 4, paddingVertical: 2,
  },
  durationText: { fontSize: 9, color: '#fff', fontWeight: '700' },

  info:       { flex: 1, gap: 3 },
  videoTitle: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  creatorName:{ fontSize: 12 },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  modeBadge:  { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  modeBadgeText: { fontSize: 10, fontWeight: '600' },
  dateSaved:  { fontSize: 11 },

  swipeHint:  { fontSize: 11, textAlign: 'center', paddingVertical: 16, fontStyle: 'italic' },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '700' },
  emptyBody:  { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
