/**
 * Scheduled — Admin-only. Cross-platform scheduling command center.
 * Shows all queued content across KaNeXT and connected external platforms.
 * Swipe left reveals Reschedule + Delete actions.
 * Mode-aware: Personal / Community / Sports / Business / Education
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  PanResponder,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { useDemoRole } from '@/utils/demo-role-store';
import { resetFooter } from '@/utils/global-footer-hide';
import { useOwnerGuard } from '@/hooks/use-owner-guard';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { useMode } from '@/context/app-context';

// ─── Types ────────────────────────────────────────────────────────────────────

type PostType = 'post' | 'reel' | 'ktv' | 'thread';
type PlatformStatus = 'ready' | 'needs-review';
type PlatformId = 'kanext' | 'ig' | 'x' | 'tk' | 'yt' | 'li';

interface PlatformBadge {
  id: PlatformId;
  label: string;
  status: PlatformStatus;
}

interface ScheduledPost {
  id: string;
  type: PostType;
  title: string;
  dayGroup: string;
  dateTimeDisplay: string;
  platforms: PlatformBadge[];
  visibility: string;
  thumbnail?: string;
}

type FilterId = 'all' | PlatformId;

// ─── Role key map ─────────────────────────────────────────────────────────────

const ROLE_KEY_BY_MODE: Record<string, string> = {
  personal:  'personal:social',
  community: 'community:social',
  sports:    'sports:social',
  business:  'business:social',
  education: 'education:social',
};

// ─── Mode-specific scheduled posts ────────────────────────────────────────────

const SCHEDULED_PERSONAL: ScheduledPost[] = [
  {
    id: 's1',
    type: 'post',
    title: 'My morning routine that changed everything - full breakdown',
    dayGroup: 'TOMORROW (APR 16)',
    dateTimeDisplay: 'Tomorrow, 9:00 AM',
    platforms: [
      { id: 'kanext', label: 'KaNeXT', status: 'ready' },
      { id: 'ig',     label: 'IG',     status: 'ready' },
      { id: 'x',      label: 'X',      status: 'ready' },
      { id: 'li',     label: 'LI',     status: 'needs-review' },
    ],
    visibility: 'Public',
    thumbnail: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=128&h=128&fit=crop',
  },
  {
    id: 's2',
    type: 'reel',
    title: 'Behind the scenes from the content shoot',
    dayGroup: 'THURSDAY (APR 17)',
    dateTimeDisplay: 'Thu Apr 17, 12:00 PM',
    platforms: [
      { id: 'kanext', label: 'KaNeXT', status: 'ready' },
      { id: 'ig',     label: 'IG',     status: 'ready' },
      { id: 'tk',     label: 'TK',     status: 'ready' },
    ],
    visibility: 'Public',
    thumbnail: 'https://images.unsplash.com/photo-1555169062-013468b47731?w=128&h=128&fit=crop',
  },
  {
    id: 's3',
    type: 'post',
    title: 'Top 5 things I learned at the combine',
    dayGroup: 'FRIDAY (APR 18)',
    dateTimeDisplay: 'Fri Apr 18, 5:00 PM',
    platforms: [
      { id: 'kanext', label: 'KaNeXT', status: 'ready' },
      { id: 'ig',     label: 'IG',     status: 'ready' },
      { id: 'x',      label: 'X',      status: 'ready' },
    ],
    visibility: 'Public',
    thumbnail: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=128&h=128&fit=crop',
  },
  {
    id: 's4',
    type: 'post',
    title: 'How to negotiate your first brand deal (subscriber exclusive)',
    dayGroup: 'SATURDAY (APR 19)',
    dateTimeDisplay: 'Sat Apr 19, 8:00 AM',
    platforms: [
      { id: 'kanext', label: 'KaNeXT', status: 'ready' },
    ],
    visibility: 'Subscribers Only',
  },
  {
    id: 's5',
    type: 'ktv',
    title: 'The Creator-Coach Blueprint - Episode 1',
    dayGroup: 'MONDAY (APR 21)',
    dateTimeDisplay: 'Mon Apr 21, 7:00 PM',
    platforms: [
      { id: 'kanext', label: 'KaNeXT', status: 'ready' },
      { id: 'yt',     label: 'YT',     status: 'ready' },
    ],
    visibility: 'Public',
    thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=128&h=128&fit=crop',
  },
];

const SCHEDULED_COMMUNITY: ScheduledPost[] = [
  {
    id: 'sc1',
    type: 'post',
    title: 'Resurrection Sunday | A Message of Hope from Pastor Davis',
    dayGroup: 'TOMORROW (APR 16)',
    dateTimeDisplay: 'Tomorrow, 9:00 AM',
    platforms: [
      { id: 'kanext', label: 'KaNeXT', status: 'ready' },
      { id: 'ig',     label: 'IG',     status: 'ready' },
      { id: 'x',      label: 'X',      status: 'ready' },
    ],
    visibility: 'Public',
    thumbnail: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=128&h=128&fit=crop',
  },
  {
    id: 'sc2',
    type: 'reel',
    title: 'Worship Team Spotlight — Spring Season',
    dayGroup: 'THURSDAY (APR 17)',
    dateTimeDisplay: 'Thu Apr 17, 6:00 PM',
    platforms: [
      { id: 'kanext', label: 'KaNeXT', status: 'ready' },
      { id: 'ig',     label: 'IG',     status: 'ready' },
    ],
    visibility: 'Community',
    thumbnail: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=128&h=128&fit=crop',
  },
  {
    id: 'sc3',
    type: 'thread',
    title: 'Community Outreach: Saturday Recap — 200 meals served',
    dayGroup: 'SATURDAY (APR 19)',
    dateTimeDisplay: 'Sat Apr 19, 11:00 AM',
    platforms: [
      { id: 'kanext', label: 'KaNeXT', status: 'ready' },
      { id: 'x',      label: 'X',      status: 'needs-review' },
    ],
    visibility: 'Public',
  },
];

const SCHEDULED_SPORTS: ScheduledPost[] = [
  {
    id: 'ss1',
    type: 'thread',
    title: 'Film Room: Monday Breakdown — 3 adjustments heading into conference play',
    dayGroup: 'TOMORROW (APR 16)',
    dateTimeDisplay: 'Tomorrow, 9:00 AM',
    platforms: [
      { id: 'kanext', label: 'KaNeXT', status: 'ready' },
      { id: 'x',      label: 'X',      status: 'ready' },
    ],
    visibility: 'Public',
  },
  {
    id: 'ss2',
    type: 'reel',
    title: 'Practice Drill Highlight — Full-court press sets',
    dayGroup: 'THURSDAY (APR 17)',
    dateTimeDisplay: 'Thu Apr 17, 3:00 PM',
    platforms: [
      { id: 'kanext', label: 'KaNeXT', status: 'ready' },
      { id: 'ig',     label: 'IG',     status: 'ready' },
      { id: 'tk',     label: 'TK',     status: 'needs-review' },
    ],
    visibility: 'Team',
    thumbnail: 'https://images.unsplash.com/photo-1546519638492-27e2d4f6b96c?w=128&h=128&fit=crop',
  },
  {
    id: 'ss3',
    type: 'post',
    title: 'Recruiting Class Update — 2026 signees officially on board',
    dayGroup: 'MONDAY (APR 21)',
    dateTimeDisplay: 'Mon Apr 21, 10:00 AM',
    platforms: [
      { id: 'kanext', label: 'KaNeXT', status: 'ready' },
      { id: 'x',      label: 'X',      status: 'ready' },
      { id: 'ig',     label: 'IG',     status: 'ready' },
    ],
    visibility: 'Public',
    thumbnail: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=128&h=128&fit=crop',
  },
];

const SCHEDULED_BUSINESS: ScheduledPost[] = [
  {
    id: 'sb1',
    type: 'post',
    title: 'Introducing Spaces 2.0 — Collaborative media rooms for every team',
    dayGroup: 'TOMORROW (APR 16)',
    dateTimeDisplay: 'Tomorrow, 9:00 AM',
    platforms: [
      { id: 'kanext', label: 'KaNeXT', status: 'ready' },
      { id: 'x',      label: 'X',      status: 'ready' },
      { id: 'li',     label: 'LI',     status: 'ready' },
    ],
    visibility: 'Public',
  },
  {
    id: 'sb2',
    type: 'reel',
    title: 'Behind the Build: How the Product Team ships in 48 hours',
    dayGroup: 'THURSDAY (APR 17)',
    dateTimeDisplay: 'Thu Apr 17, 2:00 PM',
    platforms: [
      { id: 'kanext', label: 'KaNeXT', status: 'ready' },
      { id: 'ig',     label: 'IG',     status: 'needs-review' },
    ],
    visibility: 'Public',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=128&h=128&fit=crop',
  },
  {
    id: 'sb3',
    type: 'thread',
    title: 'Series A Announcement Thread — What this funding means for builders',
    dayGroup: 'MONDAY (APR 21)',
    dateTimeDisplay: 'Mon Apr 21, 8:00 AM',
    platforms: [
      { id: 'kanext', label: 'KaNeXT', status: 'ready' },
      { id: 'x',      label: 'X',      status: 'ready' },
      { id: 'li',     label: 'LI',     status: 'ready' },
    ],
    visibility: 'Public',
  },
];

const SCHEDULED_EDUCATION: ScheduledPost[] = [
  {
    id: 'se1',
    type: 'post',
    title: 'Partnership Announcement: UC Berkeley × Lincoln University — Joint research initiative',
    dayGroup: 'TOMORROW (APR 16)',
    dateTimeDisplay: 'Tomorrow, 8:00 AM',
    platforms: [
      { id: 'kanext', label: 'KaNeXT', status: 'ready' },
      { id: 'x',      label: 'X',      status: 'ready' },
      { id: 'li',     label: 'LI',     status: 'ready' },
    ],
    visibility: 'Public',
  },
  {
    id: 'se2',
    type: 'reel',
    title: 'Campus Life: Spring 2026 — Student stories from across campus',
    dayGroup: 'THURSDAY (APR 17)',
    dateTimeDisplay: 'Thu Apr 17, 12:00 PM',
    platforms: [
      { id: 'kanext', label: 'KaNeXT', status: 'ready' },
      { id: 'ig',     label: 'IG',     status: 'ready' },
    ],
    visibility: 'Institutional',
    thumbnail: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=128&h=128&fit=crop',
  },
  {
    id: 'se3',
    type: 'thread',
    title: 'Financial Aid Policy Update — What changes for Fall 2026 applicants',
    dayGroup: 'MONDAY (APR 21)',
    dateTimeDisplay: 'Mon Apr 21, 9:00 AM',
    platforms: [
      { id: 'kanext', label: 'KaNeXT', status: 'ready' },
      { id: 'x',      label: 'X',      status: 'needs-review' },
    ],
    visibility: 'Public',
  },
];

// ─── Mode → data map ──────────────────────────────────────────────────────────

const SCHEDULED_BY_MODE: Record<string, { posts: ScheduledPost[]; dayOrder: string[] }> = {
  personal: {
    posts: SCHEDULED_PERSONAL,
    dayOrder: ['TOMORROW (APR 16)', 'THURSDAY (APR 17)', 'FRIDAY (APR 18)', 'SATURDAY (APR 19)', 'MONDAY (APR 21)'],
  },
  community: {
    posts: SCHEDULED_COMMUNITY,
    dayOrder: ['TOMORROW (APR 16)', 'THURSDAY (APR 17)', 'SATURDAY (APR 19)'],
  },
  sports: {
    posts: SCHEDULED_SPORTS,
    dayOrder: ['TOMORROW (APR 16)', 'THURSDAY (APR 17)', 'MONDAY (APR 21)'],
  },
  business: {
    posts: SCHEDULED_BUSINESS,
    dayOrder: ['TOMORROW (APR 16)', 'THURSDAY (APR 17)', 'MONDAY (APR 21)'],
  },
  education: {
    posts: SCHEDULED_EDUCATION,
    dayOrder: ['TOMORROW (APR 16)', 'THURSDAY (APR 17)', 'MONDAY (APR 21)'],
  },
};

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all',    label: 'All' },
  { id: 'kanext', label: 'KaNeXT' },
  { id: 'ig',     label: 'Instagram' },
  { id: 'x',      label: 'X' },
  { id: 'tk',     label: 'TikTok' },
  { id: 'yt',     label: 'YouTube' },
  { id: 'li',     label: 'LinkedIn' },
];

// ─── ScheduledCard ────────────────────────────────────────────────────────────

interface ScheduledCardProps {
  post: ScheduledPost;
  onDelete: (id: string) => void;
  onReschedule: (id: string) => void;
}

function ScheduledCard({ post, onDelete, onReschedule }: ScheduledCardProps) {
  const C = useColors();
  const translateX = useRef(new Animated.Value(0)).current;
  const swipedOpen = useRef(false);
  const REVEAL_W = 160;

  const iconConfig: Record<PostType, { name: string; bg: string }> = {
    post:   { name: 'doc.text',            bg: C.label },
    reel:   { name: 'film',                bg: C.label },
    ktv:    { name: 'play.rectangle.fill', bg: C.gain  },
    thread: { name: 'text.bubble',         bg: C.label },
  };
  const { name: iconName, bg: iconBg } = iconConfig[post.type];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderGrant: () => {
        translateX.setOffset(swipedOpen.current ? -REVEAL_W : 0);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, g) => {
        translateX.setValue(Math.min(0, Math.max(-REVEAL_W, g.dx)));
      },
      onPanResponderRelease: (_, g) => {
        translateX.flattenOffset();
        const cur = swipedOpen.current ? -REVEAL_W + g.dx : g.dx;
        if (cur < -REVEAL_W / 2) {
          Animated.spring(translateX, { toValue: -REVEAL_W, useNativeDriver: true, tension: 100, friction: 12 }).start();
          swipedOpen.current = true;
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 100, friction: 12 }).start();
          swipedOpen.current = false;
        }
      },
    })
  ).current;

  const closeCard = () => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 100, friction: 12 }).start();
    swipedOpen.current = false;
  };

  const handleReschedule = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeCard();
    onReschedule(post.id);
  };

  const confirmDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Remove scheduled post?', 'The post will be moved back to drafts.', [
      { text: 'Cancel', style: 'cancel', onPress: closeCard },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          Animated.timing(translateX, { toValue: -400, duration: 250, useNativeDriver: true }).start(() => {
            onDelete(post.id);
          });
        },
      },
    ]);
  };

  return (
    <View style={[sc.wrapper, { marginHorizontal: 16, marginBottom: 8 }]}>
      {/* Actions behind card */}
      <View style={sc.actionBg}>
        <Pressable style={[sc.actionBtn, { backgroundColor: C.caution }]} onPress={handleReschedule}>
          <IconSymbol name="clock.arrow.circlepath" size={16} color="#FFFFFF" />
          <Text style={sc.actionLabel}>Reschedule</Text>
        </Pressable>
        <Pressable style={[sc.actionBtn, { backgroundColor: C.heat }]} onPress={confirmDelete}>
          <IconSymbol name="trash" size={16} color="#FFFFFF" />
          <Text style={sc.actionLabel}>Delete</Text>
        </Pressable>
      </View>

      {/* Swipeable front */}
      <Animated.View
        style={[sc.card, { backgroundColor: C.surface, transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <View style={sc.leftCol}>
          <View style={[sc.iconCircle, { backgroundColor: iconBg }]}>
            <IconSymbol name={iconName as any} size={15} color={C.bg} />
          </View>
        </View>

        <View style={sc.mainCol}>
          <Text style={[sc.titleText, { color: C.label }]} numberOfLines={1}>{post.title}</Text>
          <Text style={[sc.dateText, { color: C.label }]}>{post.dateTimeDisplay}</Text>

          <View style={sc.badgeRow}>
            {post.platforms.map(p => (
              <View key={p.id} style={[sc.platformBadge, { borderColor: C.separator }]}>
                <View style={[sc.dot, { backgroundColor: p.status === 'ready' ? C.gain : C.caution }]} />
                <Text style={[sc.platformLabel, { color: C.label }]}>{p.label}</Text>
              </View>
            ))}
          </View>

          {post.visibility !== 'Public' && (
            <Text style={[sc.visibilityText, { color: C.secondary }]}>{post.visibility}</Text>
          )}
        </View>

        {post.thumbnail ? (
          <View style={sc.thumbCol}>
            <Image source={{ uri: post.thumbnail }} style={sc.thumbnail} resizeMode="cover" />
            <View style={[sc.scheduledBadge, { backgroundColor: C.caution }]}>
              <Text style={sc.scheduledBadgeText}>Scheduled</Text>
            </View>
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
}

const sc = StyleSheet.create({
  wrapper:             { position: 'relative', borderRadius: 14, overflow: 'hidden' },
  actionBg:            { ...StyleSheet.absoluteFillObject, flexDirection: 'row', alignItems: 'stretch', justifyContent: 'flex-end' },
  actionBtn:           { width: 80, alignItems: 'center', justifyContent: 'center', gap: 4 },
  actionLabel:         { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  card:                { borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  leftCol:             { flexShrink: 0, paddingTop: 2 },
  iconCircle:          { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  mainCol:             { flex: 1, gap: 4 },
  titleText:           { fontSize: 14, fontWeight: '600', lineHeight: 19 },
  dateText:            { fontSize: 13, fontWeight: '600' },
  badgeRow:            { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  platformBadge:       { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3 },
  dot:                 { width: 6, height: 6, borderRadius: 3 },
  platformLabel:       { fontSize: 11, fontWeight: '600' },
  visibilityText:      { fontSize: 12, marginTop: 2 },
  thumbCol:            { flexShrink: 0, alignItems: 'center', gap: 4 },
  thumbnail:           { width: 60, height: 60, borderRadius: 8 },
  scheduledBadge:      { borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  scheduledBadgeText:  { fontSize: 9, fontWeight: '700', color: '#FFFFFF' },
});

// ─── Day Group ────────────────────────────────────────────────────────────────

function DayGroup({ label, posts, onDelete, onReschedule }: {
  label: string;
  posts: ScheduledPost[];
  onDelete: (id: string) => void;
  onReschedule: (id: string) => void;
}) {
  const C = useColors();
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={[dg.label, { color: C.secondary }]}>{label}</Text>
      {posts.map(p => (
        <ScheduledCard key={p.id} post={p} onDelete={onDelete} onReschedule={onReschedule} />
      ))}
    </View>
  );
}

const dg = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', marginHorizontal: 16, marginBottom: 6, marginTop: 4 },
});

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  const C = useColors();
  return (
    <View style={es.container}>
      <IconSymbol name="clock" size={40} color={C.secondary} />
      <Text style={[es.heading, { color: C.label }]}>Nothing scheduled</Text>
      <Text style={[es.sub, { color: C.secondary }]}>Create content and schedule it for later.</Text>
    </View>
  );
}

const es = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 32 },
  heading:   { fontSize: 17, fontWeight: '600' },
  sub:       { fontSize: 14, textAlign: 'center' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ScheduledScreen() {
  const insets = useSafeAreaInsets();
  const C = useColors();
  const mode = useMode();
  const modeKey = mode ?? 'personal';
  const roleKey = ROLE_KEY_BY_MODE[modeKey] ?? 'personal:social';
  const modeData = SCHEDULED_BY_MODE[modeKey] ?? SCHEDULED_BY_MODE.personal;

  const [role, cycleRole, roleCycles] = useDemoRole(roleKey as any);
  const isAdmin = role === roleCycles[0];
  const guardedCycle = useOwnerGuard(role, roleCycles, cycleRole, '/(tabs)/(main)/social');
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [posts, setPosts] = useState<ScheduledPost[]>(modeData.posts);
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const handleDelete = (id: string) => setPosts(prev => prev.filter(p => p.id !== id));
  const handleReschedule = (_id: string) => { /* placeholder — opens date picker */ };

  const filteredPosts = activeFilter === 'all'
    ? posts
    : posts.filter(p => p.platforms.some(pl => pl.id === activeFilter));

  const grouped = modeData.dayOrder.reduce<Record<string, ScheduledPost[]>>((acc, day) => {
    const group = filteredPosts.filter(p => p.dayGroup === day);
    if (group.length > 0) acc[day] = group;
    return acc;
  }, {});

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top + 8, borderBottomColor: C.separator, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.kBtn} onPress={() => openSidePanel()} hitSlop={8}>
            <KMenuButton />
          </Pressable>

          <View style={s.centerPill}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Scheduled</Text>
            </View>
          </View>

          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={guardedCycle} isPrimary={isAdmin} />
          </View>
        </View>
      </Animated.View>

      {/* Platform Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[s.filterRow, { borderBottomColor: C.separator, marginTop: insets.top + 8 + 52 }]}
        contentContainerStyle={s.filterContent}
      >
        {FILTERS.map(f => {
          const active = activeFilter === f.id;
          return (
            <Pressable
              key={f.id}
              onPress={() => setActiveFilter(f.id)}
              style={[
                s.filterPill,
                active
                  ? { backgroundColor: C.label }
                  : { borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator },
              ]}
            >
              <Text style={[s.filterPillText, { color: active ? C.bg : C.label }]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content */}
      {filteredPosts.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 49 + insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={scrollEventThrottle}
        >
          {modeData.dayOrder.filter(d => grouped[d]).map(day => (
            <DayGroup
              key={day}
              label={day}
              posts={grouped[day]}
              onDelete={handleDelete}
              onReschedule={handleReschedule}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:           { flex: 1 },
  topBarOuter:    { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar:         { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  kBtn:           { width: 44, alignItems: 'flex-start' },
  centerPill:     { flex: 1, alignItems: 'center' },
  titlePill:      { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titleText:      { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap:   { alignItems: 'flex-end', flexShrink: 0 },
  filterRow:      { flexGrow: 0, borderBottomWidth: StyleSheet.hairlineWidth },
  filterContent:  { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  filterPill:     { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6 },
  filterPillText: { fontSize: 13, fontWeight: '600' },
});
