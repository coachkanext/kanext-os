/**
 * Scheduled — Owner-only. Cross-platform scheduling command center.
 * Shows all queued content across KaNeXT and connected external platforms.
 * Swipe left reveals Reschedule + Delete actions.
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
  visibility: 'Public' | 'Subscribers Only';
  thumbnail?: string;
}

type FilterId = 'all' | PlatformId;

// ─── Demo Data ────────────────────────────────────────────────────────────────

const INITIAL_POSTS: ScheduledPost[] = [
  {
    id: 's1',
    type: 'post',
    title: 'My morning routine that changed everything - full breakdown',
    dayGroup: 'TOMORROW (APR 7)',
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
    dayGroup: 'TUESDAY (APR 8)',
    dateTimeDisplay: 'Tue Apr 8, 12:00 PM',
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
    dayGroup: 'WEDNESDAY (APR 9)',
    dateTimeDisplay: 'Wed Apr 9, 5:00 PM',
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
    dayGroup: 'THURSDAY (APR 10)',
    dateTimeDisplay: 'Thu Apr 10, 8:00 AM',
    platforms: [
      { id: 'kanext', label: 'KaNeXT', status: 'ready' },
    ],
    visibility: 'Subscribers Only',
  },
  {
    id: 's5',
    type: 'ktv',
    title: 'The Creator-Coach Blueprint - Episode 1',
    dayGroup: 'FRIDAY (APR 11)',
    dateTimeDisplay: 'Fri Apr 11, 7:00 PM',
    platforms: [
      { id: 'kanext', label: 'KaNeXT', status: 'ready' },
      { id: 'yt',     label: 'YT',     status: 'ready' },
    ],
    visibility: 'Public',
    thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=128&h=128&fit=crop',
  },
];

const DAY_ORDER = [
  'TOMORROW (APR 7)',
  'TUESDAY (APR 8)',
  'WEDNESDAY (APR 9)',
  'THURSDAY (APR 10)',
  'FRIDAY (APR 11)',
];

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

          {post.visibility === 'Subscribers Only' && (
            <Text style={[sc.visibilityText, { color: C.secondary }]}>Subscribers Only</Text>
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
  const [role, cycleRole, roleCycles] = useDemoRole('personal:social');
  const isOwner = role === roleCycles[0];
  const guardedCycle = useOwnerGuard(role, roleCycles, cycleRole, '/(tabs)/(main)/social');
  const [posts, setPosts] = useState<ScheduledPost[]>(INITIAL_POSTS);
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  if (!isOwner) return null;

  const handleDelete = (id: string) => setPosts(prev => prev.filter(p => p.id !== id));
  const handleReschedule = (_id: string) => { /* placeholder — opens date picker */ };

  const filteredPosts = activeFilter === 'all'
    ? posts
    : posts.filter(p => p.platforms.some(pl => pl.id === activeFilter));

  const grouped = DAY_ORDER.reduce<Record<string, ScheduledPost[]>>((acc, day) => {
    const group = filteredPosts.filter(p => p.dayGroup === day);
    if (group.length > 0) acc[day] = group;
    return acc;
  }, {});

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { paddingTop: insets.top + 8, borderBottomColor: C.separator, backgroundColor: C.bg }]}>
        <Pressable onPress={() => openSidePanel()} hitSlop={8}>
          <KMenuButton />
        </Pressable>

        <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[s.titleText, { color: C.label }]}>Scheduled</Text>
        </View>

        <RolePill role={role} onPress={guardedCycle} isPrimary={isOwner} />
      </View>

      {/* Platform Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[s.filterRow, { borderBottomColor: C.separator }]}
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
        >
          {DAY_ORDER.filter(d => grouped[d]).map(day => (
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
  topBar:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  titlePill:      { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth },
  titleText:      { fontSize: 15, fontWeight: '600' },
  filterRow:      { flexGrow: 0, borderBottomWidth: StyleSheet.hairlineWidth },
  filterContent:  { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  filterPill:     { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6 },
  filterPillText: { fontSize: 13, fontWeight: '600' },
});
