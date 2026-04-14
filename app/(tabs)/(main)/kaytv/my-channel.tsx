/**
 * My Channel — KayTV personal channel page.
 * Owner: full management (edit channel, go live, upload).
 * Subscriber: read-only consumer view (videos, playlists, about).
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActionSheetIOS, Platform, Alert, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;

// ── Mock data ──────────────────────────────────────────────────────────────────

const VIDEOS = [
  { id: 'pk11', title: 'Day in My Life - Coach & CEO',              views: '8.9K', date: 'Apr 5',  duration: '16:22', emoji: '🌟', hue: 45,  locked: false, featured: true },
  { id: 'pk8',  title: 'How I Use AI to Build Faster',              views: '6.8K', date: 'Apr 3',  duration: '7:30',  emoji: '⚡', hue: 280, locked: true  },
  { id: 'pk1',  title: 'Why I Built an OS',                         views: '5.1K', date: 'Mar 22', duration: '12:34', emoji: '🏗️', hue: 200,  locked: false },
  { id: 'pk10', title: 'Brand Deal Negotiation Tips',               views: '4.1K', date: 'Mar 18', duration: '11:42', emoji: '🤝', hue: 320, locked: true  },
  { id: 'pk9',  title: 'My Content Creation Workflow',              views: '3.4K', date: 'Mar 14', duration: '8:55',  emoji: '🎬', hue: 300, locked: false },
  { id: 'pk4',  title: 'From Coach to CEO',                         views: '3.2K', date: 'Mar 10', duration: '10:15', emoji: '🎯', hue: 30,  locked: false },
  { id: 'pk6',  title: 'Building Culture at Lincoln',               views: '2.8K', date: 'Mar 5',  duration: '11:20', emoji: '🏛️', hue: 165, locked: true  },
  { id: 'pk2',  title: 'KaNeXT Product Demo',                       views: '2.4K', date: 'Feb 28', duration: '8:22',  emoji: '📱', hue: 220, locked: false },
  { id: 'pk12', title: 'Q&A: Ask Me Anything March 2026',           views: '2.1K', date: 'Feb 24', duration: '22:15', emoji: '🎙️', hue: 190, locked: true  },
  { id: 'pk7',  title: 'Player Development Framework',              views: '1.9K', date: 'Feb 18', duration: '13:08', emoji: '📊', hue: 180, locked: false },
  { id: 'pk3',  title: 'The 4,000 Page Architecture',               views: '1.8K', date: 'Feb 12', duration: '15:47', emoji: '🗺️', hue: 240, locked: false },
  { id: 'pk5',  title: 'Why System Fit Matters More Than Talent',   views: '4.2K', date: 'Feb 5',  duration: '9:45',  emoji: '🧩', hue: 150, locked: false },
];

const PLAYLISTS = [
  { id: 'pl1', title: 'Building KaNeXT',     count: 4, emoji: '🏗️', hue: 200 },
  { id: 'pl2', title: 'Coaching Philosophy', count: 3, emoji: '🏛️', hue: 165 },
  { id: 'pl3', title: 'Creator Toolkit',     count: 3, emoji: '🎬', hue: 300 },
];

const ABOUT_STATS = [
  { label: 'Joined',      value: 'Jan 2023'  },
  { label: 'Total Views', value: '142.8K'    },
  { label: 'Subscribers', value: '3.4K'      },
  { label: 'Videos',      value: '12'        },
];

const ABOUT_LINKS = [
  { icon: 'globe',         label: 'kanext.io'                      },
  { icon: 'camera',        label: '@sammyk (Instagram)'            },
  { icon: 'at',            label: '@sammyk (X/Twitter)'            },
  { icon: 'play.rectangle', label: 'Sammy Kalejaiye (YouTube)'    },
  { icon: 'link',          label: '@sammyk (TikTok)'               },
];

type TabName = 'Videos' | 'Playlists' | 'About';

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function MyChannelPage() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaytv');
  const isOwner = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const [activeTab,  setActiveTab]  = useState<TabName>('Videos');
  const [videoSort,  setVideoSort]  = useState<'Recent' | 'Popular' | 'Oldest'>('Recent');
  const [subscribed, setSubscribed] = useState(false);
  const [editAbout,  setEditAbout]  = useState(false);

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const styles   = useMemo(() => makeStyles(C), [C]);
  const topBarH  = insets.top + TOP_BAR_H;

  function handleVideoMore(video: typeof VIDEOS[0]) {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Edit', 'Delete', 'Move to Playlist', 'Set as Featured', 'Cancel'], cancelButtonIndex: 4, destructiveButtonIndex: 1 },
        (idx) => { if (idx < 4) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); },
      );
    }
  }

  function handleVideoPress(video: typeof VIDEOS[0]) {
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

  // ── Tab helpers ──────────────────────────────────────────────────────────────

  const TABS: TabName[] = ['Videos', 'Playlists', 'About'];

  // ── Video grid ───────────────────────────────────────────────────────────────

  const renderVideoGrid = () => {
    const sorted = [...VIDEOS].sort((a, b) => {
      if (videoSort === 'Popular') return parseFloat(b.views) - parseFloat(a.views);
      if (videoSort === 'Oldest') return VIDEOS.indexOf(b) - VIDEOS.indexOf(a);
      return 0; // Recent = default order
    });
    const pairs: (typeof VIDEOS)[] = [];
    for (let i = 0; i < sorted.length; i += 2) {
      pairs.push(sorted.slice(i, i + 2));
    }
    return (
      <View style={styles.videoGrid}>
        {/* Sort pills */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {(['Recent', 'Popular', 'Oldest'] as const).map(s => (
            <Pressable
              key={s}
              onPress={() => { Haptics.selectionAsync(); setVideoSort(s); }}
              style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
                backgroundColor: videoSort === s ? C.activePill : C.surface }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: videoSort === s ? C.activePillText : C.secondary }}>{s}</Text>
            </Pressable>
          ))}
        </View>
        {pairs.map((pair, rowIdx) => (
          <View key={rowIdx} style={styles.videoRow}>
            {pair.map(video => (
              <Pressable
                key={video.id}
                onPress={() => handleVideoPress(video)}
                style={({ pressed }) => [
                  styles.videoCard,
                  { backgroundColor: C.surface, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                {/* Thumbnail */}
                <View style={[styles.videoThumb, { backgroundColor: `hsl(${video.hue},35%,28%)`, alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ fontSize: 28, position: 'absolute' }}>{video.emoji}</Text>
                  {/* Featured badge */}
                  {'featured' in video && video.featured && (
                    <View style={{ position: 'absolute', top: 4, left: 4, backgroundColor: '#8B2500', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 8, color: '#fff', fontWeight: '800' }}>FEATURED</Text>
                    </View>
                  )}
                  {/* Lock overlay for Follower */}
                  {!isOwner && video.locked && (
                    <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}>
                      <IconSymbol name="lock.fill" size={20} color="#fff" />
                    </View>
                  )}
                  <View style={[styles.durationBadge, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                    <Text style={[styles.durationText, { color: '#fff' }]}>{video.duration}</Text>
                  </View>
                </View>
                {/* Info row */}
                <View style={[styles.videoInfo, { flexDirection: 'row', alignItems: 'flex-start' }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.videoTitle, { color: C.label }]} numberOfLines={2}>
                      {video.title}
                    </Text>
                    <Text style={[styles.videoMeta, { color: C.secondary }]}>
                      {video.views} views · {video.date}
                    </Text>
                    {!isOwner && video.locked && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
                        <IconSymbol name="lock.fill" size={9} color={C.secondary} />
                        <Text style={{ fontSize: 10, color: C.secondary }}>Subscribers only</Text>
                      </View>
                    )}
                  </View>
                  {isOwner && (
                    <Pressable onPress={() => handleVideoMore(video)} hitSlop={8} style={{ paddingLeft: 6, paddingTop: 1 }}>
                      <IconSymbol name="ellipsis" size={13} color={C.secondary} />
                    </Pressable>
                  )}
                </View>
              </Pressable>
            ))}
            {/* If odd row, fill with empty space */}
            {pair.length === 1 && <View style={styles.videoCardSpacer} />}
          </View>
        ))}
      </View>
    );
  };

  // ── Playlists ─────────────────────────────────────────────────────────────────

  const renderPlaylists = () => (
    <View style={styles.playlistList}>
      {PLAYLISTS.map((pl, idx) => (
        <Pressable
          key={pl.id}
          onPress={() => Haptics.selectionAsync()}
          style={({ pressed }) => [
            styles.playlistRow,
            {
              borderBottomWidth: idx < PLAYLISTS.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: C.separator,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <View style={[styles.playlistThumb, { backgroundColor: `hsl(${pl.hue},35%,28%)`, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ fontSize: 22 }}>{pl.emoji}</Text>
          </View>
          <View style={styles.playlistInfo}>
            <Text style={[styles.playlistTitle, { color: C.label }]}>{pl.title}</Text>
            <Text style={[styles.playlistCount, { color: C.secondary }]}>{pl.count} videos</Text>
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

  // ── About ─────────────────────────────────────────────────────────────────────

  const renderAbout = () => (
    <View style={styles.aboutContainer}>
      {/* Bio */}
      <View style={[styles.aboutSection, { backgroundColor: C.surface }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Text style={[styles.aboutSectionTitle, { color: C.label, marginBottom: 0, flex: 1 }]}>Sammy Kalejaiye</Text>
          {isOwner && (
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setEditAbout(true); }}>
              <IconSymbol name="pencil" size={15} color={C.secondary} />
            </Pressable>
          )}
        </View>
        <Text style={[styles.aboutBio, { color: C.secondary }]}>
          Coach. Builder. Creator. This channel covers building KaNeXT OS, developing athletes at Lincoln University, and the creator-entrepreneur life. New videos every week.
        </Text>
      </View>

      {/* Links */}
      <View style={[styles.aboutSection, { backgroundColor: C.surface }]}>
        <Text style={[styles.aboutSectionTitle, { color: C.label }]}>Links</Text>
        {ABOUT_LINKS.map((link, idx) => (
          <View
            key={idx}
            style={[
              styles.linkRow,
              {
                borderTopWidth: idx === 0 ? 0 : StyleSheet.hairlineWidth,
                borderTopColor: C.separator,
              },
            ]}
          >
            <IconSymbol name={link.icon as any} size={16} color={C.secondary} />
            <Text style={[styles.linkText, { color: C.label }]}>{link.label}</Text>
          </View>
        ))}
      </View>

      {/* Stats 2x2 grid */}
      <View style={styles.statsGrid}>
        {ABOUT_STATS.map((stat, idx) => (
          <View
            key={idx}
            style={[styles.statBox, { backgroundColor: C.surface }]}
          >
            <Text style={[styles.statValue, { color: C.label }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: C.secondary }]}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // ── JSX ───────────────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Top Bar ──────────────────────────────────────────────────────────── */}
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: insets.top, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, opacity }}>
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 }}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openSidePanel();
            }}
            style={{ width: 44, alignItems: 'center' }}
          >
            <KMenuButton />
          </Pressable>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: C.label }}>My Channel</Text>
          </View>

          <View style={{ alignItems: 'flex-end', paddingRight: 4 }}>
            <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      {/* ── Scroll Content ───────────────────────────────────────────────────── */}
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Channel cover */}
        <View style={[styles.coverArea, { backgroundColor: '#1A2535', overflow: 'hidden' }]}>
          {/* Banner graphic */}
          <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 24, opacity: 0.3 }}>
            <Text style={{ fontSize: 48 }}>🏀</Text>
            <Text style={{ fontSize: 48 }}>💻</Text>
            <Text style={{ fontSize: 48 }}>🎬</Text>
          </View>
          {/* gradient overlay */}
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(0,0,0,0.3)' }} />
          {/* Avatar */}
          <View
            style={[
              styles.avatar,
              { backgroundColor: C.surface, borderColor: C.bg },
            ]}
          >
            <Text style={[styles.avatarInitials, { color: C.label }]}>SK</Text>
          </View>
        </View>

        {/* Channel identity */}
        <View style={styles.channelIdentity}>
          <Text style={[styles.channelName, { color: C.label }]}>Sammy Kalejaiye</Text>
          <Text style={[styles.channelStats, { color: C.secondary }]}>
            12 videos · 3.4K subscribers · 142.8K views
          </Text>
          <Text style={[styles.channelDescription, { color: C.secondary }]}>
            Coach. Builder. Creator. Sharing the journey of building KaNeXT OS, developing athletes, and growing as a creator-entrepreneur.
          </Text>

          {/* Action buttons */}
          {isOwner ? (
            <View style={styles.actionRow}>
              <Pressable
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={({ pressed }) => [styles.actionBtn, { borderColor: C.separator, opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={[styles.actionBtnText, { color: C.label }]}>Edit Channel</Text>
              </Pressable>
              <Pressable
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={({ pressed }) => [styles.actionBtn, { backgroundColor: '#8B2500', borderColor: '#8B2500', opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={[styles.actionBtnText, { color: '#fff' }]}>Go Live</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setSubscribed(!subscribed); }}
              style={{ marginTop: 14, paddingHorizontal: 28, paddingVertical: 10, borderRadius: 22, backgroundColor: subscribed ? C.surface : C.label, borderWidth: subscribed ? 1 : 0, borderColor: C.separator }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: subscribed ? C.secondary : C.bg }}>
                {subscribed ? '✓ Subscribed' : 'Subscribe'}
              </Text>
            </Pressable>
          )}
        </View>

        {/* ── Tab bar ──────────────────────────────────────────────────────── */}
        <View style={[styles.tabBar, { borderBottomColor: C.separator }]}>
          {TABS.map(tab => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => {
                  setActiveTab(tab);
                  Haptics.selectionAsync();
                }}
                style={[
                  styles.tabItem,
                  isActive && { borderBottomWidth: 2, borderBottomColor: C.label },
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isActive ? C.label : C.secondary },
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── Tab content ──────────────────────────────────────────────────── */}
        <View style={styles.tabContent}>
          {activeTab === 'Videos'    && renderVideoGrid()}
          {activeTab === 'Playlists' && renderPlaylists()}
          {activeTab === 'About'     && renderAbout()}
        </View>
      </ScrollView>

      {/* ── FAB: Owner upload ── */}
      {isOwner && (
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.navigate('/(tabs)/(main)/kaytv/upload' as any); }}
          style={[styles.fab, { backgroundColor: C.label, bottom: insets.bottom + 70 }]}
        >
          <IconSymbol name="plus" size={22} color={C.bg} />
        </Pressable>
      )}

      {/* ── Edit About Sheet ── */}
      <BottomSheet visible={editAbout} onClose={() => setEditAbout(false)} useModal>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: C.label }}>Edit Description</Text>
          <View style={{ borderWidth: 1, borderColor: C.separator, borderRadius: 12, padding: 14, backgroundColor: C.surface, minHeight: 120 }}>
            <Text style={{ fontSize: 14, color: C.label, lineHeight: 21 }}>
              Coach. Builder. Creator. This channel covers building KaNeXT OS, developing athletes at Lincoln University, and the creator-entrepreneur life. New videos every week.
            </Text>
          </View>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setEditAbout(false); }}
            style={{ backgroundColor: C.label, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>Save Changes</Text>
          </Pressable>
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    // Channel cover
    coverArea: {
      height: 160,
      position: 'relative',
      alignItems: 'center',
    },
    avatar: {
      position: 'absolute',
      bottom: -36,
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 3,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitials: {
      fontSize: 22,
      fontWeight: '700',
    },

    // Channel identity block
    channelIdentity: {
      alignItems: 'center',
      marginTop: 44,
      paddingHorizontal: 24,
    },
    channelName: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 4,
    },
    channelStats: {
      fontSize: 13,
      textAlign: 'center',
    },
    channelDescription: {
      fontSize: 13,
      textAlign: 'center',
      marginTop: 6,
    },

    // Action buttons row
    actionRow: {
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'center',
      marginTop: 14,
    },
    actionBtn: {
      borderWidth: 1,
      borderRadius: 18,
      paddingHorizontal: 20,
      paddingVertical: 9,
    },
    actionBtnText: {
      fontSize: 14,
      fontWeight: '600',
    },

    // Tab bar
    tabBar: {
      flexDirection: 'row',
      marginTop: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      marginBottom: -StyleSheet.hairlineWidth,
    },
    tabLabel: {
      fontSize: 14,
      fontWeight: '600',
    },

    // Tab content wrapper
    tabContent: {
      paddingTop: 16,
      paddingHorizontal: 16,
    },

    // Video grid
    videoGrid: {
      gap: 12,
    },
    videoRow: {
      flexDirection: 'row',
      gap: 12,
    },
    videoCard: {
      flex: 1,
      borderRadius: 10,
      overflow: 'hidden',
    },
    videoCardSpacer: {
      flex: 1,
    },
    videoThumb: {
      aspectRatio: 16 / 9,
      position: 'relative',
    },
    durationBadge: {
      position: 'absolute',
      bottom: 5,
      right: 5,
      borderRadius: 4,
      paddingHorizontal: 5,
      paddingVertical: 2,
    },
    durationText: {
      fontSize: 9,
      fontWeight: '600',
    },
    videoInfo: {
      padding: 8,
      gap: 3,
    },
    videoTitle: {
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 16,
    },
    videoMeta: {
      fontSize: 10,
    },

    // Playlists
    playlistList: {
      borderRadius: 12,
      overflow: 'hidden',
    },
    playlistRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      gap: 12,
    },
    playlistThumb: {
      width: 60,
      height: 60,
      borderRadius: 8,
    },
    playlistInfo: {
      flex: 1,
      gap: 3,
    },
    playlistTitle: {
      fontSize: 14,
      fontWeight: '700',
    },
    playlistCount: {
      fontSize: 12,
    },

    // About
    aboutContainer: {
      gap: 12,
    },
    aboutSection: {
      borderRadius: 12,
      padding: 14,
    },
    aboutSectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 6,
    },
    aboutBio: {
      fontSize: 13,
      lineHeight: 19,
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 10,
    },
    linkText: {
      fontSize: 14,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    statBox: {
      width: '47.5%',
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
    },

    fab: {
      position: 'absolute', right: 20,
      width: 52, height: 52, borderRadius: 26,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
      elevation: 5,
    },
  });
}
