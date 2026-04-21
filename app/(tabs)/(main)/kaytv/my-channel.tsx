/**
 * My Channel — KayTV channel page (all modes).
 * Owner:    full management (upload, analytics, comments, edit).
 * Member:   subscribe + browse.
 * Tabs vary by mode:
 *   personal:  Videos · Shorts · Live · Playlists
 *   business:  Product · Company (owner only) · About
 *   education: Lectures · Campus Life · Athletics · About
 *   community: Sermons · Worship · Events · About
 *   sports (admin):  Broadcasts · Network · Film
 *   sports (member): Broadcasts · Network · Highlights
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Animated,
  ActionSheetIOS, Platform, Alert, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useMode } from '@/context/app-context';

const TOP_BAR_H = 52;

// ── Mode config ────────────────────────────────────────────────────────────────

const CHANNEL_TITLE_BY_MODE: Record<string, string> = {
  personal:  'Channel',
  business:  'Channel',
  education: 'Channel',
  community: 'Channel',
  sports:    'Channel',
};

type ChannelIdentity = { initials: string; name: string; handle: string; stats: string; darkAvatar: boolean };
const CHANNEL_IDENTITY_BY_MODE: Record<string, ChannelIdentity> = {
  personal:  { initials: 'LK', name: 'Laolu Kalejaiye',        handle: '@sammyk',   stats: '3.4K subscribers · 12 videos', darkAvatar: true  },
  business:  { initials: 'KN', name: 'KaNeXT',                 handle: '@kanext',   stats: '1.2K subscribers · 8 videos',  darkAvatar: true  },
  education: { initials: 'LU', name: 'Lincoln University (CA)', handle: '@lincolnu', stats: '842 subscribers · 24 videos',  darkAvatar: false },
  community: { initials: 'IC', name: 'ICCLA',                   handle: '@iccla',    stats: '2.1K subscribers · 38 videos', darkAvatar: false },
  sports:    { initials: 'LU', name: "LU Men's Basketball",     handle: '@lumbb',    stats: '1.8K subscribers · 16 videos', darkAvatar: false },
};

const SPORTS_ADMIN_TABS  = ['Broadcasts', 'Network', 'Film'];
const SPORTS_MEMBER_TABS = ['Broadcasts', 'Network', 'Highlights'];

const TABS_BY_MODE: Record<string, string[]> = {
  personal:  ['Videos', 'Shorts', 'Live', 'Playlists'],
  business:  ['Product', 'Company', 'About'],
  education: ['Lectures', 'Campus Life', 'Athletics', 'About'],
  community: ['Sermons', 'Worship', 'Events', 'About'],
};

function getInitialTab(mode: string): string {
  if (mode === 'community') return 'Sermons';
  if (mode === 'sports')    return 'Broadcasts';
  if (mode === 'business')  return 'Product';
  if (mode === 'education') return 'Lectures';
  return 'Videos';
}

// ── Mock data ──────────────────────────────────────────────────────────────────

type Video = {
  id: string; title: string; views: string; date: string;
  duration: string; thumbUri: string; locked: boolean; featured?: boolean;
  tab?: string;
};

const VIDEOS_BY_MODE: Record<string, Video[]> = {
  personal: [
    { id: 'v1', title: 'Day in My Life — Coach & CEO',     views: '8.9K', date: 'Apr 5',  duration: '16:22', thumbUri: 'https://images.unsplash.com/photo-1530126483408-aa533e55bdb2?w=400&h=225&fit=crop&q=80', locked: false, featured: true },
    { id: 'v2', title: 'How I Use AI to Build Faster',     views: '6.8K', date: 'Apr 3',  duration: '7:30',  thumbUri: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=225&fit=crop&q=80', locked: true  },
    { id: 'v3', title: 'Why I Built an OS',                views: '5.1K', date: 'Mar 22', duration: '12:34', thumbUri: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=225&fit=crop&q=80', locked: false },
    { id: 'v4', title: 'Brand Deal Negotiation Tips',      views: '4.1K', date: 'Mar 18', duration: '11:42', thumbUri: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=225&fit=crop&q=80', locked: true  },
    { id: 'v5', title: 'My Content Creation Workflow',     views: '3.4K', date: 'Mar 14', duration: '8:55',  thumbUri: 'https://images.unsplash.com/photo-1603739903239-8b6e64c3b185?w=400&h=225&fit=crop&q=80', locked: false },
    { id: 'v6', title: 'From Coach to CEO',                views: '3.2K', date: 'Mar 10', duration: '10:15', thumbUri: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=225&fit=crop&q=80', locked: false },
    { id: 'v7', title: 'KaNeXT Product Demo',              views: '2.4K', date: 'Feb 28', duration: '8:22',  thumbUri: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=225&fit=crop&q=80', locked: false },
    { id: 'v8', title: 'Player Development Framework',     views: '1.9K', date: 'Feb 18', duration: '13:08', thumbUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop&q=80', locked: false },
  ],
  business: [
    { id: 'bv1', title: 'KaNeXT OS v2.0 Full Walkthrough',           views: '8.2K', date: 'Apr 10', duration: '22:15', thumbUri: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=225&fit=crop&q=80', locked: false, featured: true, tab: 'Product'  },
    { id: 'bv2', title: 'How We Closed Our First Enterprise Client',  views: '5.7K', date: 'Apr 2',  duration: '12:40', thumbUri: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=225&fit=crop&q=80', locked: false,                  tab: 'Company'  },
    { id: 'bv3', title: 'Q1 Product Update',                         views: '3.1K', date: 'Mar 28', duration: '8:30',  thumbUri: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=225&fit=crop&q=80', locked: true,                   tab: 'Product'  },
    { id: 'bv4', title: 'Onboarding Best Practices',                 views: '2.4K', date: 'Mar 14', duration: '15:44', thumbUri: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=225&fit=crop&q=80', locked: false,                  tab: 'Product'  },
    { id: 'bv5', title: 'Investor Data Room Walkthrough',            views: '1.8K', date: 'Mar 5',  duration: '18:22', thumbUri: 'https://images.unsplash.com/photo-1503457574462-bd27054394c1?w=400&h=225&fit=crop&q=80', locked: true,                   tab: 'Company'  },
    { id: 'bv6', title: 'Product Roadmap — Q2 2026',                 views: '1.2K', date: 'Feb 20', duration: '11:05', thumbUri: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=225&fit=crop&q=80', locked: true,                   tab: 'Product'  },
  ],
  education: [
    { id: 'ev1', title: 'BUSN 301 — Strategic Management Lec. 8',   views: '412',  date: 'Apr 8',  duration: '52:10', thumbUri: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=225&fit=crop&q=80', locked: false, featured: true, tab: 'Lectures'    },
    { id: 'ev2', title: 'Virtual Campus Tour 2026',                  views: '1.8K', date: 'Apr 1',  duration: '6:45',  thumbUri: 'https://images.unsplash.com/photo-1503457574462-bd27054394c1?w=400&h=225&fit=crop&q=80', locked: false,                  tab: 'Campus Life' },
    { id: 'ev3', title: 'Medical Imaging Lab Demo — Dr. Patel',      views: '622',  date: 'Mar 25', duration: '18:20', thumbUri: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=225&fit=crop&q=80', locked: false,                  tab: 'Lectures'    },
    { id: 'ev4', title: 'Graduation 2025 Highlights',                views: '3.4K', date: 'May 18', duration: '4:30',  thumbUri: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=225&fit=crop&q=80', locked: false,                  tab: 'Campus Life' },
    { id: 'ev5', title: 'BUSN 301 — Strategic Management Lec. 7',   views: '388',  date: 'Apr 1',  duration: '49:55', thumbUri: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=225&fit=crop&q=80', locked: false,                  tab: 'Lectures'    },
    { id: 'ev6', title: 'LU Athletics — GAAC Championship Recap',   views: '2.1K', date: 'Mar 10', duration: '8:14',  thumbUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop&q=80', locked: false,                  tab: 'Athletics'   },
  ],
  community: [
    { id: 'cv1', title: 'Easter Sunday — He Is Risen',               views: '2.1K', date: 'Apr 13', duration: '45:22',   thumbUri: 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=400&h=225&fit=crop&q=80', locked: false, featured: true, tab: 'Sermons' },
    { id: 'cv2', title: 'Vineyard Voices Worship Set — Apr 13',      views: '890',  date: 'Apr 13', duration: '28:15',   thumbUri: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=225&fit=crop&q=80', locked: false,                  tab: 'Worship' },
    { id: 'cv3', title: 'Rooted Session 3 — Finding Your Place',     views: '345',  date: 'Apr 6',  duration: '32:40',   thumbUri: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=400&h=225&fit=crop&q=80', locked: false,                  tab: 'Events'  },
    { id: 'cv4', title: 'Hotline to Heaven — Episode 142',           views: '1.6K', date: 'Apr 5',  duration: '58:00',   thumbUri: 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=400&h=225&fit=crop&q=80', locked: false,                  tab: 'Sermons' },
    { id: 'cv5', title: 'Good Friday Service 2026',                  views: '1.2K', date: 'Apr 10', duration: '1:12:04', thumbUri: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=225&fit=crop&q=80', locked: false,                  tab: 'Sermons' },
    { id: 'cv6', title: 'Rooted Session 2 — Identity in Christ',     views: '288',  date: 'Mar 30', duration: '38:15',   thumbUri: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=400&h=225&fit=crop&q=80', locked: false,                  tab: 'Events'  },
  ],
  sports: [
    { id: 'sv1', title: 'LU vs Cal Maritime — Full Game',            views: '3.2K',  date: 'Apr 12', duration: '1:42:30', thumbUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop&q=80', locked: false, featured: true, tab: 'Broadcasts'  },
    { id: 'sv2', title: 'Laolu Kalejaiye — 38pts at Pepperdine',     views: '18.4K', date: 'Apr 8',  duration: '3:22',    thumbUri: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400&h=225&fit=crop&q=80', locked: false,                  tab: 'Highlights'  },
    { id: 'sv3', title: 'Inside LU Basketball Ep. 6',                views: '1.1K',  date: 'Apr 5',  duration: '24:15',   thumbUri: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400&h=225&fit=crop&q=80', locked: false,                  tab: 'Network'     },
    { id: 'sv4', title: 'GAAC Weekly — Championship Preview',        views: '4.8K',  date: 'Apr 3',  duration: '18:40',   thumbUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop&q=80', locked: false,                  tab: 'Network'     },
    { id: 'sv5', title: 'LU vs Dominican — Full Game',               views: '2.1K',  date: 'Apr 5',  duration: '1:38:14', thumbUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop&q=80', locked: false,                  tab: 'Broadcasts'  },
    { id: 'sv6', title: 'Inside LU Basketball Ep. 5',                views: '880',   date: 'Mar 28', duration: '22:08',   thumbUri: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400&h=225&fit=crop&q=80', locked: false,                  tab: 'Network'     },
  ],
};

type AboutInfo = { description: string; detail: string; contact: string };
const ABOUT_BY_MODE: Record<string, AboutInfo> = {
  personal:  { description: 'Creator · Coach · Builder', detail: 'Building KaNeXT OS and helping athletes navigate life beyond the game. Content drops weekly.', contact: 'sammy@kanext.co' },
  business:  { description: 'The operating system for modern organizations.', detail: 'KaNeXT helps creators, athletes, businesses, schools, and communities run smarter — all in one platform.', contact: 'hello@kanext.co' },
  education: { description: 'Private HBCU in Oakland, CA.', detail: 'Lincoln University (CA) offers programs in business, health sciences, and social sciences with a 140+ year legacy of excellence.', contact: 'info@lincolnu.edu' },
  community: { description: 'Multicultural church community in Los Angeles.', detail: 'ICCLA is a Spirit-filled, Word-centered community gathering every Sunday. All are welcome.', contact: 'hello@iccla.org' },
  sports:    { description: "LU Men's Basketball — GAAC Conference.", detail: "Lincoln University (CA) Men's Basketball competes in the GAAC Conference. Home games at the Lions Den.", contact: 'athletics@lincolnu.edu' },
};

type Short = { id: string; title: string; views: string; duration: string; thumbUri: string };
const SHORTS: Short[] = [
  { id: 's1', title: '60-sec free throw drill', views: '142K', duration: '0:58', thumbUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=270&h=480&fit=crop&q=80' },
  { id: 's2', title: 'Why I wake up at 5am',    views: '88K',  duration: '0:45', thumbUri: 'https://images.unsplash.com/photo-1530126483408-aa533e55bdb2?w=270&h=480&fit=crop&q=80' },
  { id: 's3', title: 'My desk setup',           views: '56K',  duration: '0:52', thumbUri: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=270&h=480&fit=crop&q=80' },
  { id: 's4', title: 'Building in public',      views: '33K',  duration: '0:38', thumbUri: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=270&h=480&fit=crop&q=80' },
];

type LiveRec = { id: string; title: string; views: string; date: string; duration: string; thumbUri: string; locked: boolean };
const LIVE_RECORDINGS: LiveRec[] = [
  { id: 'l1', title: 'Q&A: Ask Me Anything March 2026', views: '2.1K', date: 'Mar 2',  duration: '58:22',   thumbUri: 'https://images.unsplash.com/photo-1503457574462-bd27054394c1?w=400&h=225&fit=crop&q=80', locked: true  },
  { id: 'l2', title: 'Lincoln Game Watch Party',        views: '1.4K', date: 'Feb 15', duration: '2:12:00', thumbUri: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400&h=225&fit=crop&q=80', locked: false },
];

type Playlist = { id: string; title: string; count: number; thumbUri: string };
const PLAYLISTS: Playlist[] = [
  { id: 'pl1', title: 'Building KaNeXT',     count: 4, thumbUri: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=225&fit=crop&q=80' },
  { id: 'pl2', title: 'Coaching Philosophy', count: 3, thumbUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop&q=80' },
  { id: 'pl3', title: 'Creator Toolkit',     count: 3, thumbUri: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=225&fit=crop&q=80' },
];


// ── Main Screen ────────────────────────────────────────────────────────────────

export default function MyChannelPage() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mode   = useMode();

  const _rk = mode === 'sports' ? 'sports:agenda' : mode === 'community' ? 'community:kaytv' : mode === 'education' ? 'education' : mode === 'business' ? 'business' : 'personal:kaytv';
  const [role, cycleRole, roleCycles] = useDemoRole(_rk);
  const isOwner = role === roleCycles[0];

  // Compute tabs for the current mode + role
  const baseTabs = mode === 'sports'
    ? (isOwner ? SPORTS_ADMIN_TABS : SPORTS_MEMBER_TABS)
    : (TABS_BY_MODE[mode] ?? TABS_BY_MODE.personal);
  // Business: Customer (non-owner) doesn't see Company tab
  const tabs = (mode === 'business' && !isOwner)
    ? baseTabs.filter(t => t !== 'Company')
    : baseTabs;

  const initialTab = getInitialTab(mode);
  const [activeTab,  setActiveTab]  = useState<string>(initialTab);
  const [videoSort,  setVideoSort]  = useState<'Recent' | 'Popular' | 'Oldest'>('Recent');
  const [subscribed, setSubscribed] = useState(false);

  // Reset tab when mode changes
  useEffect(() => { setActiveTab(getInitialTab(mode)); }, [mode]);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  function handleVideoMore() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Edit', 'Delete', 'Move to Playlist', 'Set as Featured', 'Cancel'], cancelButtonIndex: 4, destructiveButtonIndex: 1 },
        (idx) => { if (idx < 4) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); },
      );
    }
  }

  function handleVideoPress(video: { locked: boolean; id: string }) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isOwner && video.locked) {
      Alert.alert('Subscribers Only', 'Subscribe to unlock this video.', [
        { text: 'Subscribe', onPress: () => setSubscribed(true) },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    router.navigate({ pathname: '/(tabs)/(main)/kaytv/player' as any, params: { videoId: video.id } });
  }

  const modeVideos = VIDEOS_BY_MODE[mode] ?? VIDEOS_BY_MODE.personal;

  // ── Tab: Videos ─────────────────────────────────────────────────────────────

  const renderVideos = (videos: Video[]) => {
    const sorted = [...videos].sort((a, b) => {
      if (videoSort === 'Popular') return parseFloat(b.views) - parseFloat(a.views);
      if (videoSort === 'Oldest')  return videos.indexOf(b) - videos.indexOf(a);
      return 0;
    });
    const pairs: Video[][] = [];
    for (let i = 0; i < sorted.length; i += 2) pairs.push(sorted.slice(i, i + 2));

    return (
      <View>
        {/* Sort pills */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {(['Recent', 'Popular', 'Oldest'] as const).map(srt => (
            <Pressable
              key={srt}
              onPress={() => { Haptics.selectionAsync(); setVideoSort(srt); }}
              style={[
                st.sortPill,
                videoSort === srt
                  ? { backgroundColor: C.activePill, borderColor: C.activePill }
                  : { backgroundColor: C.surface, borderColor: C.separator },
              ]}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: videoSort === srt ? C.activePillText : C.secondary }}>
                {srt}
              </Text>
            </Pressable>
          ))}
        </View>

        {pairs.map((pair, rowIdx) => (
          <View key={rowIdx} style={st.videoRow}>
            {pair.map(video => (
              <Pressable
                key={video.id}
                onPress={() => handleVideoPress(video)}
                style={({ pressed }) => [st.videoCard, { opacity: pressed ? 0.85 : 1 }]}
              >
                <View style={[st.videoThumb, { backgroundColor: '#1A2535' }]}>
                  <Image source={{ uri: video.thumbUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                  {video.featured && (
                    <View style={st.featuredBadge}>
                      <Text style={st.featuredBadgeText}>FEATURED</Text>
                    </View>
                  )}
                  {!isOwner && video.locked && (
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }]}>
                      <IconSymbol name="lock.fill" size={20} color="#fff" />
                    </View>
                  )}
                  <View style={st.durationBadge}>
                    <Text style={st.durationText}>{video.duration}</Text>
                  </View>
                </View>
                <View style={st.videoInfo}>
                  <View style={{ flex: 1 }}>
                    <Text style={[st.videoTitle, { color: C.label }]} numberOfLines={2}>{video.title}</Text>
                    <Text style={[st.videoMeta, { color: C.secondary }]}>{video.views} views · {video.date}</Text>
                    {!isOwner && video.locked && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
                        <IconSymbol name="lock.fill" size={9} color={C.secondary} />
                        <Text style={{ fontSize: 10, color: C.secondary }}>Subscribers only</Text>
                      </View>
                    )}
                  </View>
                  {isOwner && (
                    <Pressable onPress={handleVideoMore} hitSlop={8} style={{ paddingLeft: 4 }}>
                      <IconSymbol name="ellipsis" size={13} color={C.secondary} />
                    </Pressable>
                  )}
                </View>
              </Pressable>
            ))}
            {pair.length === 1 && <View style={st.videoCardSpacer} />}
          </View>
        ))}

        {isOwner && (
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.navigate('/(tabs)/(main)/kaytv/upload' as any); }}
            style={[st.uploadCta, { borderColor: C.separator, backgroundColor: C.surface }]}
          >
            <IconSymbol name="plus" size={18} color={C.label} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Upload Video</Text>
          </Pressable>
        )}
      </View>
    );
  };

  // ── Tab: Shorts ──────────────────────────────────────────────────────────────

  const renderShorts = () => (
    <View>
      {SHORTS.map((s, idx) => (
        <Pressable
          key={s.id}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={({ pressed }) => [
            st.listRow,
            { borderBottomWidth: idx < SHORTS.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <View style={[st.shortThumb, { backgroundColor: '#1A2535' }]}>
            <Image source={{ uri: s.thumbUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            <View style={st.durationBadge}>
              <Text style={st.durationText}>{s.duration}</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[{ fontSize: 13, fontWeight: '600', lineHeight: 18, color: C.label }]} numberOfLines={2}>{s.title}</Text>
            <Text style={{ fontSize: 11, color: C.secondary, marginTop: 3 }}>{s.views} views</Text>
          </View>
          {isOwner && (
            <Pressable onPress={handleVideoMore} hitSlop={8}>
              <IconSymbol name="ellipsis" size={13} color={C.secondary} />
            </Pressable>
          )}
        </Pressable>
      ))}
    </View>
  );

  // ── Tab: Live ────────────────────────────────────────────────────────────────

  const renderLive = () => (
    <View>
      {LIVE_RECORDINGS.map((v, idx) => (
        <Pressable
          key={v.id}
          onPress={() => handleVideoPress(v)}
          style={({ pressed }) => [
            st.listRow,
            { borderBottomWidth: idx < LIVE_RECORDINGS.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <View style={[st.liveThumb, { backgroundColor: '#1A2535' }]}>
            <Image source={{ uri: v.thumbUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            <View style={st.durationBadge}>
              <Text style={st.durationText}>{v.duration}</Text>
            </View>
            {!isOwner && v.locked && (
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }]}>
                <IconSymbol name="lock.fill" size={18} color="#fff" />
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[{ fontSize: 13, fontWeight: '600', lineHeight: 18, color: C.label }]} numberOfLines={2}>{v.title}</Text>
            <Text style={{ fontSize: 11, color: C.secondary, marginTop: 3 }}>{v.views} views · {v.date}</Text>
          </View>
          {isOwner && (
            <Pressable onPress={handleVideoMore} hitSlop={8}>
              <IconSymbol name="ellipsis" size={13} color={C.secondary} />
            </Pressable>
          )}
        </Pressable>
      ))}
      {isOwner && (
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={[st.uploadCta, { borderColor: C.separator, backgroundColor: C.surface }]}
        >
          <IconSymbol name="video.badge.plus" size={18} color={C.label} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Go Live</Text>
        </Pressable>
      )}
    </View>
  );

  // ── Tab: Playlists ───────────────────────────────────────────────────────────

  const renderPlaylists = () => (
    <View>
      {PLAYLISTS.map((pl, idx) => (
        <Pressable
          key={pl.id}
          onPress={() => Haptics.selectionAsync()}
          style={({ pressed }) => [
            st.listRow,
            { borderBottomWidth: idx < PLAYLISTS.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <View style={[st.liveThumb, { backgroundColor: '#1A2535' }]}>
            <Image source={{ uri: pl.thumbUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[{ fontSize: 14, fontWeight: '700', color: C.label }]}>{pl.title}</Text>
            <Text style={[{ fontSize: 12, color: C.secondary, marginTop: 2 }]}>{pl.count} videos</Text>
          </View>
          <IconSymbol name="chevron.right" size={14} color={C.secondary} />
        </Pressable>
      ))}
      {isOwner && (
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 }}
        >
          <View style={{ width: 60, height: 60, borderRadius: 8, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
            <IconSymbol name="plus" size={20} color={C.secondary} />
          </View>
          <Text style={{ fontSize: 14, fontWeight: '600', color: C.secondary }}>Create Playlist</Text>
        </Pressable>
      )}
    </View>
  );

  // ── Tab: About ───────────────────────────────────────────────────────────────

  const renderAbout = () => {
    const about = ABOUT_BY_MODE[mode] ?? ABOUT_BY_MODE.personal;
    const id2 = identity;
    return (
      <View style={{ gap: 20 }}>
        <View style={[st.aboutCard, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[st.aboutHeading, { color: C.label }]}>{id2.name}</Text>
          <Text style={[st.aboutDesc, { color: C.secondary }]}>{about.description}</Text>
          <Text style={[st.aboutBody, { color: C.label }]}>{about.detail}</Text>
        </View>
        <View style={[st.aboutCard, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[st.aboutLabel, { color: C.secondary }]}>CONTACT</Text>
          <Text style={[st.aboutBody, { color: C.label }]}>{about.contact}</Text>
        </View>
      </View>
    );
  };

  // ── Tab: Film CTA (sports coach) ─────────────────────────────────────────────

  const renderFilmCta = () => (
    <View style={{ gap: 12 }}>
      {modeVideos.filter(v => v.tab === 'Broadcasts').map((v, idx, arr) => (
        <Pressable
          key={v.id}
          onPress={() => handleVideoPress(v)}
          style={({ pressed }) => [
            st.listRow,
            { borderBottomWidth: idx < arr.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <View style={[st.liveThumb, { backgroundColor: '#1A2535' }]}>
            <Image source={{ uri: v.thumbUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            <View style={st.durationBadge}><Text style={st.durationText}>{v.duration}</Text></View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[{ fontSize: 13, fontWeight: '600', lineHeight: 18, color: C.label }]} numberOfLines={2}>{v.title}</Text>
            <Text style={{ fontSize: 11, color: C.secondary, marginTop: 3 }}>{v.views} views · {v.date}</Text>
          </View>
          <IconSymbol name="play.circle" size={20} color={C.secondary} />
        </Pressable>
      ))}
      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.navigate('/(tabs)/(main)/kaytv/film' as any); }}
        style={[st.uploadCta, { borderColor: C.separator, backgroundColor: C.surface }]}
      >
        <IconSymbol name="film.fill" size={16} color={C.label} />
        <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Open Full Film Room</Text>
      </Pressable>
    </View>
  );

  // ── Generic content renderer ──────────────────────────────────────────────────

  const renderContent = (tab: string) => {
    if (tab === 'Videos')    return renderVideos(modeVideos);
    if (tab === 'Shorts')    return renderShorts();
    if (tab === 'Live')      return renderLive();
    if (tab === 'Playlists') return renderPlaylists();
    if (tab === 'About')     return renderAbout();
    if (tab === 'Film')      return renderFilmCta();
    // All other mode-specific tabs: filter by tab tag
    const tabVideos = modeVideos.filter(v => v.tab === tab);
    return renderVideos(tabVideos.length > 0 ? tabVideos : modeVideos);
  };

  // ── JSX ───────────────────────────────────────────────────────────────────────

  const channelTitle    = CHANNEL_TITLE_BY_MODE[mode] ?? 'Channel';
  const identity        = CHANNEL_IDENTITY_BY_MODE[mode] ?? CHANNEL_IDENTITY_BY_MODE.personal;
  const avatarBg        = identity.darkAvatar ? C.label : C.separator;
  const avatarText      = identity.darkAvatar ? C.bg    : C.label;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Top Bar ── */}
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: insets.top, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, opacity }}>
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            style={{ width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' }}
          >
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[st.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[st.titlePillText, { color: C.label }]}>{channelTitle}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      {/* ── Scroll ── */}
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Compact identity header ── */}
        <View style={[st.identity, { borderBottomColor: C.separator }]}>
          <View style={[st.channelAvatar, { backgroundColor: avatarBg }]}>
            <Text style={[st.channelAvatarText, { color: avatarText }]}>{identity.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[st.channelName, { color: C.label }]}>{identity.name}</Text>
            <Text style={[st.channelStats, { color: C.secondary }]}>{identity.handle} · {identity.stats}</Text>
          </View>
        </View>

        {/* Follower subscribe row */}
        {!isOwner && (
          <View style={[st.actionRow, { paddingHorizontal: 16 }]}>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setSubscribed(!subscribed); }}
              style={[
                st.subscribeBtn,
                { backgroundColor: subscribed ? C.surface : C.label, borderWidth: subscribed ? 1 : 0, borderColor: C.separator },
              ]}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: subscribed ? C.secondary : C.bg }}>
                {subscribed ? '✓ Subscribed' : 'Subscribe'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={[st.bellBtn, { borderColor: C.separator }]}
            >
              <IconSymbol name="bell" size={16} color={C.label} />
            </Pressable>
          </View>
        )}

        {/* ── Tab bar ── */}
        <View style={[st.tabBar, { borderBottomColor: C.separator }]}>
          {tabs.map(tab => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => { setActiveTab(tab); Haptics.selectionAsync(); }}
                style={[st.tabItem, isActive && { borderBottomWidth: 2, borderBottomColor: C.label }]}
              >
                <Text style={[st.tabLabel, { color: isActive ? C.label : C.secondary }]}>{tab}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── Tab content ── */}
        <View style={st.tabContent}>
          {renderContent(activeTab)}
        </View>
      </ScrollView>

      {/* ── Owner FAB — quick upload ── */}
      {isOwner && (
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.navigate('/(tabs)/(main)/kaytv/upload' as any); }}
          style={[st.fab, { backgroundColor: C.label, bottom: insets.bottom + 70 }]}
        >
          <IconSymbol name="plus" size={24} color={C.bg} />
        </Pressable>
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const st = StyleSheet.create({
  // Top bar
  titlePill:    { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText:{ fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

  // Compact identity header
  identity:          { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  channelAvatar:     { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  channelAvatarText: { fontSize: 18, fontWeight: '700' },
  channelName:       { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  channelStats:      { fontSize: 12 },

  // Follower action row
  actionRow:    { flexDirection: 'row', gap: 8, paddingVertical: 12 },
  subscribeBtn: { borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10 },
  bellBtn:      { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  // FAB
  fab: { position: 'absolute', right: 20, width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6 },

  // Tab bar
  tabBar:    { flexDirection: 'row', marginTop: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  tabItem:   { flex: 1, alignItems: 'center', paddingVertical: 12, marginBottom: -StyleSheet.hairlineWidth },
  tabLabel:  { fontSize: 13, fontWeight: '600' },
  tabContent:{ paddingTop: 16, paddingHorizontal: 16 },

  // Sort pills
  sortPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },

  // 2-column video grid
  videoRow:        { flexDirection: 'row', gap: 10, marginBottom: 12 },
  videoCard:       { flex: 1, borderRadius: 8, overflow: 'hidden' },
  videoCardSpacer: { flex: 1 },
  videoThumb:      { aspectRatio: 16 / 9 },
  videoInfo:       { flexDirection: 'row', alignItems: 'flex-start', padding: 6, gap: 4 },
  videoTitle:      { fontSize: 11, fontWeight: '600', lineHeight: 15 },
  videoMeta:       { fontSize: 10, marginTop: 2 },
  featuredBadge:   { position: 'absolute', top: 4, left: 4, backgroundColor: '#8B2500', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  featuredBadgeText: { fontSize: 8, color: '#fff', fontWeight: '800' },
  durationBadge:   { position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  durationText:    { fontSize: 9, color: '#fff', fontWeight: '600' },
  uploadCta:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },

  // List rows (Shorts / Live / Playlists)
  listRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  shortThumb: { width: 80, aspectRatio: 9 / 16, borderRadius: 6, overflow: 'hidden' },
  liveThumb:  { width: 140, height: 79, borderRadius: 8, overflow: 'hidden' },

  // About tab
  aboutCard:    { borderWidth: 1, borderRadius: 14, padding: 16, gap: 6 },
  aboutHeading: { fontSize: 15, fontWeight: '700' },
  aboutDesc:    { fontSize: 12, fontWeight: '500' },
  aboutLabel:   { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  aboutBody:    { fontSize: 14, lineHeight: 20 },
});
