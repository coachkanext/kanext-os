/**
 * KayTV — Library ("You" tab, YouTube style).
 * Compact channel header → History → Playlists → Utility links.
 * Owner:    History, Playlists (with + button), Your Videos, Downloads, Watch Later.
 * Follower: History, Watch Later, Liked videos.
 */

import React, { useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Image, Animated,
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
import { useMode } from '@/context/app-context';

const TOP_BAR_H = 52;

// ── Mock data ──────────────────────────────────────────────────────────────────

type HistoryVideo = {
  id: string; title: string; channel: string; duration: string;
  thumbUri: string; thumbHue: number; progress?: number;
};

type Playlist = { id: string; title: string; count: number; thumbUri: string; thumbHue: number };
type UtilLink  = { icon: string; label: string; route?: string };

// ── Channel identity (mirrors my-channel.tsx) ──────────────────────────────────

type ChannelIdentity = { initials: string; name: string; handle: string; stats: string; darkAvatar: boolean };
const CHANNEL_IDENTITY_BY_MODE: Record<string, ChannelIdentity> = {
  personal:  { initials: 'SK', name: 'Sammy Kalejaiye',        handle: '@sammyk',   stats: '3.4K subscribers', darkAvatar: true  },
  business:  { initials: 'KN', name: 'KaNeXT',                 handle: '@kanext',   stats: '1.2K subscribers', darkAvatar: true  },
  education: { initials: 'LU', name: 'Lincoln University (CA)', handle: '@lincolnu', stats: '842 subscribers',  darkAvatar: false },
  community: { initials: 'IC', name: 'ICCLA',                   handle: '@iccla',    stats: '2.1K subscribers', darkAvatar: false },
  sports:    { initials: 'LU', name: "LU Men's Basketball",     handle: '@lumbb',    stats: '1.8K subscribers', darkAvatar: false },
};

// ── History ────────────────────────────────────────────────────────────────────

const HISTORY_BY_MODE: Record<string, HistoryVideo[]> = {
  personal: [
    { id: 'h1', title: 'Lincoln @ Pepperdine — Full Film',    channel: 'Lincoln Basketball', duration: '4:12',  thumbUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=320&h=180&fit=crop&q=80', thumbHue: 215, progress: 0.62 },
    { id: 'h2', title: 'Building KaNeXT OS — Ep. 7',          channel: 'Sammy Kalejaiye',    duration: '18:32', thumbUri: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=320&h=180&fit=crop&q=80', thumbHue: 200, progress: 0.30 },
    { id: 'h3', title: 'Brand Deal Negotiation Tips',          channel: 'Sammy Kalejaiye',    duration: '11:42', thumbUri: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=320&h=180&fit=crop&q=80', thumbHue: 320 },
    { id: 'h4', title: 'NAIA Tournament Bracket 2026 Preview', channel: 'KaNeXT Sports',      duration: '14:30', thumbUri: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=320&h=180&fit=crop&q=80', thumbHue: 350 },
    { id: 'h5', title: 'Creator Systems: Content → Revenue',   channel: 'Alicia Chen',        duration: '47:15', thumbUri: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=320&h=180&fit=crop&q=80', thumbHue: 280 },
  ],
  business: [
    { id: 'bh1', title: 'KaNeXT OS v2.0 Full Walkthrough',            channel: 'KaNeXT',          duration: '22:15', thumbUri: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=320&h=180&fit=crop&q=80', thumbHue: 200, progress: 0.45 },
    { id: 'bh2', title: 'How We Closed Our First Enterprise Client',   channel: 'KaNeXT',          duration: '12:40', thumbUri: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=320&h=180&fit=crop&q=80', thumbHue: 320, progress: 0.80 },
    { id: 'bh3', title: 'SaaS Pricing Strategy 2026',                  channel: 'Growth Playbook', duration: '24:18', thumbUri: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=320&h=180&fit=crop&q=80', thumbHue: 280 },
    { id: 'bh4', title: 'Investor Update — Q1 2026',                   channel: 'KaNeXT',          duration: '8:30',  thumbUri: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=320&h=180&fit=crop&q=80', thumbHue: 200, progress: 0.15 },
    { id: 'bh5', title: 'B2B Sales Frameworks That Scale',             channel: 'Sales Academy',   duration: '31:22', thumbUri: 'https://images.unsplash.com/photo-1503457574462-bd27054394c1?w=320&h=180&fit=crop&q=80', thumbHue: 45  },
  ],
  education: [
    { id: 'eh1', title: 'BUSN 301 — Strategic Management Lec. 8',    channel: 'Lincoln University', duration: '52:10', thumbUri: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=320&h=180&fit=crop&q=80', thumbHue: 200, progress: 0.62 },
    { id: 'eh2', title: 'Medical Imaging Lab Demo — Dr. Patel',       channel: 'Lincoln University', duration: '18:20', thumbUri: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=320&h=180&fit=crop&q=80', thumbHue: 150 },
    { id: 'eh3', title: 'Top 10 HBCU Programs 2026',                  channel: 'HBCU Connect',       duration: '14:30', thumbUri: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=320&h=180&fit=crop&q=80', thumbHue: 45  },
    { id: 'eh4', title: 'Virtual Campus Tour 2026',                   channel: 'Lincoln University', duration: '6:45',  thumbUri: 'https://images.unsplash.com/photo-1503457574462-bd27054394c1?w=320&h=180&fit=crop&q=80', thumbHue: 280, progress: 0.90 },
    { id: 'eh5', title: 'Study Skills for Academic Success',          channel: 'Academic Edge',      duration: '22:15', thumbUri: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=320&h=180&fit=crop&q=80', thumbHue: 320 },
  ],
  community: [
    { id: 'ch1', title: 'Easter Sunday — He Is Risen',          channel: 'ICCLA',         duration: '45:22',   thumbUri: 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=320&h=180&fit=crop&q=80', thumbHue: 30,  progress: 0.80 },
    { id: 'ch2', title: 'Hotline to Heaven — Episode 142',       channel: 'ICCLA',         duration: '58:00',   thumbUri: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=320&h=180&fit=crop&q=80', thumbHue: 280, progress: 0.35 },
    { id: 'ch3', title: 'Praise & Worship Compilation — Live',   channel: 'Hillsong',      duration: '42:10',   thumbUri: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=320&h=180&fit=crop&q=80', thumbHue: 45  },
    { id: 'ch4', title: 'Rooted Session 3 — Finding Your Place', channel: 'ICCLA',         duration: '32:40',   thumbUri: 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=320&h=180&fit=crop&q=80', thumbHue: 30,  progress: 0.20 },
    { id: 'ch5', title: 'Sunday Service — Apr 6',                channel: 'Mosaic Church', duration: '1:02:18', thumbUri: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=320&h=180&fit=crop&q=80', thumbHue: 280 },
  ],
  sports: [
    { id: 'sh1', title: 'LU vs Cal Maritime — Full Game',          channel: "LU Men's Basketball", duration: '1:42:30', thumbUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=320&h=180&fit=crop&q=80', thumbHue: 215, progress: 0.55 },
    { id: 'sh2', title: 'Laolu Kalejaiye — 38pts at Pepperdine',   channel: "LU Men's Basketball", duration: '3:22',    thumbUri: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=320&h=180&fit=crop&q=80', thumbHue: 45  },
    { id: 'sh3', title: 'GAAC Championship Preview',               channel: 'KaNeXT Sports',       duration: '18:40',   thumbUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=320&h=180&fit=crop&q=80', thumbHue: 215, progress: 0.75 },
    { id: 'sh4', title: 'Inside LU Basketball Ep. 6',              channel: "LU Men's Basketball", duration: '24:15',   thumbUri: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=320&h=180&fit=crop&q=80', thumbHue: 215 },
    { id: 'sh5', title: 'Film Session — Cal Maritime Defense',     channel: 'CoachVid Pro',        duration: '14:22',   thumbUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=320&h=180&fit=crop&q=80', thumbHue: 215 },
  ],
};

// ── Owner playlists ────────────────────────────────────────────────────────────

const OWNER_PLAYLISTS_BY_MODE: Record<string, Playlist[]> = {
  personal:  [
    { id: 'pl1', title: 'Building KaNeXT',     count: 4, thumbUri: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=320&h=180&fit=crop&q=80', thumbHue: 200 },
    { id: 'pl2', title: 'Coaching Philosophy', count: 3, thumbUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=320&h=180&fit=crop&q=80', thumbHue: 215 },
    { id: 'pl3', title: 'Creator Toolkit',     count: 3, thumbUri: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=320&h=180&fit=crop&q=80', thumbHue: 280 },
  ],
  business:  [
    { id: 'bpl1', title: 'Product Demos',     count: 4, thumbUri: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=320&h=180&fit=crop&q=80', thumbHue: 200 },
    { id: 'bpl2', title: 'Company Updates',   count: 3, thumbUri: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=320&h=180&fit=crop&q=80', thumbHue: 320 },
    { id: 'bpl3', title: 'Webinars',          count: 2, thumbUri: 'https://images.unsplash.com/photo-1503457574462-bd27054394c1?w=320&h=180&fit=crop&q=80', thumbHue: 45  },
  ],
  education: [
    { id: 'epl1', title: 'BUSN 301 Series',  count: 8, thumbUri: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=320&h=180&fit=crop&q=80', thumbHue: 200 },
    { id: 'epl2', title: 'Campus Life',      count: 5, thumbUri: 'https://images.unsplash.com/photo-1503457574462-bd27054394c1?w=320&h=180&fit=crop&q=80', thumbHue: 45  },
    { id: 'epl3', title: 'Athletics',        count: 3, thumbUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=320&h=180&fit=crop&q=80', thumbHue: 215 },
  ],
  community: [
    { id: 'cpl1', title: 'Sermon Series',    count: 12, thumbUri: 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=320&h=180&fit=crop&q=80', thumbHue: 30  },
    { id: 'cpl2', title: 'Worship Sessions', count: 8,  thumbUri: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=320&h=180&fit=crop&q=80', thumbHue: 280 },
    { id: 'cpl3', title: 'Rooted Series',    count: 4,  thumbUri: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=320&h=180&fit=crop&q=80', thumbHue: 45  },
  ],
  sports:    [
    { id: 'spl1', title: 'Game Film',     count: 5, thumbUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=320&h=180&fit=crop&q=80', thumbHue: 215 },
    { id: 'spl2', title: 'Highlights',    count: 8, thumbUri: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=320&h=180&fit=crop&q=80', thumbHue: 45  },
    { id: 'spl3', title: 'Inside LU BBall', count: 6, thumbUri: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=320&h=180&fit=crop&q=80', thumbHue: 215 },
  ],
};

const MEMBER_PLAYLISTS: Playlist[] = [
  { id: 'fpl1', title: 'Watch Later',  count: 6,  thumbUri: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=320&h=180&fit=crop&q=80', thumbHue: 200 },
  { id: 'fpl2', title: 'Liked Videos', count: 11, thumbUri: 'https://images.unsplash.com/photo-1603739903239-8b6e64c3b185?w=320&h=180&fit=crop&q=80', thumbHue: 25  },
];

// ── Util links ─────────────────────────────────────────────────────────────────

const OWNER_LINKS_BY_MODE: Record<string, UtilLink[]> = {
  personal:  [{ icon: 'arrow.up.circle', label: 'Your videos',     route: '/(tabs)/(main)/kaytv/my-channel' }, { icon: 'arrow.down.circle', label: 'Downloads' }, { icon: 'clock', label: 'Watch later' }],
  business:  [{ icon: 'arrow.up.circle', label: 'Your videos',     route: '/(tabs)/(main)/kaytv/my-channel' }, { icon: 'arrow.down.circle', label: 'Downloads' }, { icon: 'clock', label: 'Watch later' }],
  education: [{ icon: 'arrow.up.circle', label: 'Your lectures',   route: '/(tabs)/(main)/kaytv/my-channel' }, { icon: 'arrow.down.circle', label: 'Downloads' }, { icon: 'clock', label: 'Watch later' }],
  community: [{ icon: 'arrow.up.circle', label: 'Your sermons',    route: '/(tabs)/(main)/kaytv/my-channel' }, { icon: 'arrow.down.circle', label: 'Downloads' }, { icon: 'clock', label: 'Watch later' }],
  sports:    [{ icon: 'arrow.up.circle', label: 'Your broadcasts', route: '/(tabs)/(main)/kaytv/my-channel' }, { icon: 'arrow.down.circle', label: 'Downloads' }, { icon: 'clock', label: 'Watch later' }],
};

const MEMBER_LINKS: UtilLink[] = [
  { icon: 'heart',             label: 'Liked videos' },
  { icon: 'clock',             label: 'Watch later'  },
  { icon: 'arrow.down.circle', label: 'Downloads'    },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function HistoryCard({
  video, C, onPress,
}: { video: HistoryVideo; C: ComponentColors; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.histCard, { opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={[s.histThumb, { backgroundColor: `hsl(${video.thumbHue},38%,22%)` }]}>
        <Image source={{ uri: video.thumbUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={s.durationBadge}>
          <Text style={s.durationText}>{video.duration}</Text>
        </View>
        {video.progress !== undefined && (
          <View style={[s.progressBar, { backgroundColor: C.separator }]}>
            <View style={[s.progressFill, { width: `${Math.round(video.progress * 100)}%` as any }]} />
          </View>
        )}
      </View>
      <Text style={[s.histTitle, { color: C.label }]} numberOfLines={2}>{video.title}</Text>
      <Text style={[s.histMeta, { color: C.secondary }]}>{video.channel}</Text>
    </Pressable>
  );
}

function PlaylistCard({
  pl, C, onPress,
}: { pl: Playlist; C: ComponentColors; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.plCard, { opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={[s.plThumb, { backgroundColor: `hsl(${pl.thumbHue},38%,22%)` }]}>
        <Image source={{ uri: pl.thumbUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={s.plCountBadge}>
          <IconSymbol name="list.bullet" size={9} color="#fff" />
          <Text style={s.plCountText}>{pl.count}</Text>
        </View>
      </View>
      <Text style={[s.plTitle, { color: C.label }]} numberOfLines={2}>{pl.title}</Text>
    </Pressable>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────

export default function LibraryScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mode   = useMode();

  const _rk = mode === 'sports' ? 'sports:agenda' : mode === 'community' ? 'community:kaytv' : mode === 'education' ? 'education' : mode === 'business' ? 'business' : 'personal:kaytv';
  const [role, cycleRole, roleCycles] = useDemoRole(_rk);
  const isOwner = role === roleCycles[0];

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const identity  = CHANNEL_IDENTITY_BY_MODE[mode]        ?? CHANNEL_IDENTITY_BY_MODE.personal;
  const history   = HISTORY_BY_MODE[mode]                 ?? HISTORY_BY_MODE.personal;
  const playlists = isOwner ? (OWNER_PLAYLISTS_BY_MODE[mode] ?? OWNER_PLAYLISTS_BY_MODE.personal) : MEMBER_PLAYLISTS;
  const utilLinks = isOwner ? (OWNER_LINKS_BY_MODE[mode]    ?? OWNER_LINKS_BY_MODE.personal)      : MEMBER_LINKS;
  const avatarBg  = identity.darkAvatar ? C.label : C.separator;
  const avatarText = identity.darkAvatar ? C.bg   : C.label;

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* ── Top bar ── */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            style={s.kBtn}
          >
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Library</Text>
            </View>
          </View>
          <View style={s.topBarRight}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H, paddingBottom: insets.bottom + 80 }}
      >

        {/* ── Compact channel header ── */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (isOwner) router.navigate('/(tabs)/(main)/kaytv/my-channel' as any);
          }}
          style={({ pressed }) => [s.channelHeader, { borderBottomColor: C.separator, opacity: pressed ? 0.85 : 1 }]}
        >
          <View style={[s.channelAvatar, { backgroundColor: avatarBg }]}>
            <Text style={[s.channelAvatarText, { color: avatarText }]}>{identity.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.channelName, { color: C.label }]}>{identity.name}</Text>
            <Text style={[s.channelHandle, { color: C.secondary }]}>{identity.handle} · {identity.stats}</Text>
          </View>
          {isOwner && (
            <View style={[s.manageBtn, { borderColor: C.separator }]}>
              <Text style={[s.manageBtnText, { color: C.label }]}>Manage</Text>
            </View>
          )}
          <IconSymbol name="chevron.right" size={14} color={C.secondary} />
        </Pressable>

        {/* ── History ── */}
        <View style={[s.section, { borderBottomColor: C.separator }]}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: C.label }]}>History</Text>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <Text style={[s.seeAll, { color: C.secondary }]}>See all</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 4 }}
          >
            {history.map(v => (
              <HistoryCard
                key={v.id}
                video={v}
                C={C}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.navigate({ pathname: '/(tabs)/(main)/kaytv/player' as any, params: { videoId: v.id } });
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* ── Playlists ── */}
        <View style={[s.section, { borderBottomColor: C.separator }]}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: C.label }]}>Playlists</Text>
            {isOwner && (
              <Pressable
                style={s.addBtn}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="plus" size={13} color={C.secondary} />
                <Text style={[s.addBtnText, { color: C.secondary }]}>New</Text>
              </Pressable>
            )}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 4 }}
          >
            {playlists.map(pl => (
              <PlaylistCard
                key={pl.id}
                pl={pl}
                C={C}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ── Utility links ── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          {utilLinks.map((link, idx) => (
            <Pressable
              key={link.label}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (link.route) router.navigate(link.route as any);
              }}
              style={({ pressed }) => [
                s.utilRow,
                {
                  borderBottomWidth: idx < utilLinks.length - 1 ? StyleSheet.hairlineWidth : 0,
                  borderBottomColor: C.separator,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <View style={[s.utilIconWrap, { backgroundColor: C.surface }]}>
                <IconSymbol name={link.icon as any} size={18} color={C.label} />
              </View>
              <Text style={[s.utilLabel, { color: C.label }]}>{link.label}</Text>
              <IconSymbol name="chevron.right" size={14} color={C.secondary} />
            </Pressable>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:        { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:      { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  kBtn:        { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  titlePill:   { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  topBarRight: { alignItems: 'flex-end', justifyContent: 'center' },

  // Channel header
  channelHeader:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  channelAvatar:     { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  channelAvatarText: { fontSize: 15, fontWeight: '700' },
  channelName:       { fontSize: 15, fontWeight: '700' },
  channelHandle:     { fontSize: 12, marginTop: 1 },
  manageBtn:         { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  manageBtnText:     { fontSize: 12, fontWeight: '600' },

  // Sections
  section:       { paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  sectionTitle:  { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  seeAll:        { fontSize: 13, fontWeight: '500' },
  addBtn:        { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText:    { fontSize: 13, fontWeight: '500' },

  // History card (16:9 thumb)
  histCard:  { width: 160 },
  histThumb: { width: 160, height: 90, borderRadius: 8, overflow: 'hidden', marginBottom: 6 },
  durationBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2 },
  durationText:  { fontSize: 9, color: '#fff', fontWeight: '700' },
  progressBar:   { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, borderRadius: 1.5 },
  progressFill:  { height: 3, borderRadius: 1.5, backgroundColor: '#CC0000' },
  histTitle:     { fontSize: 12, fontWeight: '600', lineHeight: 16 },
  histMeta:      { fontSize: 11, marginTop: 2 },

  // Playlist card
  plCard:       { width: 140 },
  plThumb:      { width: 140, height: 79, borderRadius: 8, overflow: 'hidden', marginBottom: 6 },
  plCountBadge: { position: 'absolute', bottom: 0, right: 0, borderBottomRightRadius: 8, backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 3 },
  plCountText:  { fontSize: 10, color: '#fff', fontWeight: '700' },
  plTitle:      { fontSize: 12, fontWeight: '600', lineHeight: 16 },

  // Utility links
  utilRow:      { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  utilIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  utilLabel:    { flex: 1, fontSize: 15, fontWeight: '500' },
});
