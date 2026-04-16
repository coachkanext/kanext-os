/**
 * Drafts — admin-only across all modes.
 * Mode-aware: role key, draft content, and top bar all adapt to active mode.
 * Swipe left on a card to reveal Delete.
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Animated,
  PanResponder,
  Alert,
  StyleSheet,
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

type DraftType = 'post' | 'reel' | 'ktv' | 'thread';

interface Draft {
  id: string;
  type: DraftType;
  title: string;
  status: string;
  lastEdited: string;
  thumbnail: string | null;
}

// ─── Draft data per mode ──────────────────────────────────────────────────────

const DRAFTS_PERSONAL: Draft[] = [
  {
    id: 'd1',
    type: 'post',
    title: 'The mindset shift that changed everything for me...',
    status: 'Post · No image attached',
    lastEdited: 'Last edited 2h ago',
    thumbnail: null,
  },
  {
    id: 'd2',
    type: 'reel',
    title: 'Morning routine breakdown — the 6AM protocol',
    status: 'Reel · Video ready, needs caption',
    lastEdited: 'Last edited yesterday',
    thumbnail: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=128&h=128&fit=crop',
  },
  {
    id: 'd3',
    type: 'ktv',
    title: 'Q1 revenue breakdown — full transparency',
    status: 'KTV · Needs intro/outro editing',
    lastEdited: 'Last edited Apr 3',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=128&h=128&fit=crop',
  },
  {
    id: 'd4',
    type: 'thread',
    title: '5 brand deal mistakes I made in year one...',
    status: 'Thread · 3 of 7 parts written',
    lastEdited: 'Last edited Apr 2',
    thumbnail: null,
  },
];

const DRAFTS_COMMUNITY: Draft[] = [
  {
    id: 'cd1',
    type: 'post',
    title: "Easter Sunday message outline — 'Walking in His Resurrection'",
    status: 'Post · No image attached',
    lastEdited: 'Last edited 1h ago',
    thumbnail: null,
  },
  {
    id: 'cd2',
    type: 'reel',
    title: 'Worship night promo — April 27',
    status: 'Reel · Video ready, needs caption',
    lastEdited: 'Last edited yesterday',
    thumbnail: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=128&h=128&fit=crop',
  },
  {
    id: 'cd3',
    type: 'post',
    title: 'Community outreach recap — March serving statistics',
    status: 'Post · Photo attached, caption incomplete',
    lastEdited: 'Last edited Apr 4',
    thumbnail: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=128&h=128&fit=crop',
  },
  {
    id: 'cd4',
    type: 'thread',
    title: 'Testimony series — Part 3: Grace Miller story',
    status: 'Thread · 2 of 5 parts written',
    lastEdited: 'Last edited Apr 2',
    thumbnail: null,
  },
  {
    id: 'cd5',
    type: 'post',
    title: 'Annual giving report — Q1 2026 stewardship update',
    status: 'Post · Leadership visibility · Awaiting final numbers',
    lastEdited: 'Last edited Apr 1',
    thumbnail: null,
  },
];

const DRAFTS_SPORTS: Draft[] = [
  {
    id: 'sd1',
    type: 'post',
    title: 'Film session breakdown — second-chance points problem',
    status: 'Post · Team visibility · No image',
    lastEdited: 'Last edited 3h ago',
    thumbnail: null,
  },
  {
    id: 'sd2',
    type: 'reel',
    title: 'Speed & agility drill breakdown — training series',
    status: 'Reel · Video ready, needs caption',
    lastEdited: 'Last edited yesterday',
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=128&h=128&fit=crop',
  },
  {
    id: 'sd3',
    type: 'post',
    title: 'Recruiting update — spring evaluations',
    status: 'Post · Team visibility · Draft in progress',
    lastEdited: 'Last edited Apr 3',
    thumbnail: null,
  },
  {
    id: 'sd4',
    type: 'thread',
    title: '5 things we fixed from last season...',
    status: 'Thread · 4 of 6 parts written',
    lastEdited: 'Last edited Apr 1',
    thumbnail: null,
  },
];

const DRAFTS_BUSINESS: Draft[] = [
  {
    id: 'bd1',
    type: 'post',
    title: 'Q2 OKR announcement — all-hands follow-up',
    status: 'Post · Company visibility · Draft in progress',
    lastEdited: 'Last edited 2h ago',
    thumbnail: null,
  },
  {
    id: 'bd2',
    type: 'reel',
    title: 'Product walkthrough — KaNeXT Spaces beta',
    status: 'Reel · Video ready, needs caption',
    lastEdited: 'Last edited yesterday',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=128&h=128&fit=crop',
  },
  {
    id: 'bd3',
    type: 'post',
    title: 'Series A announcement — the full story',
    status: 'Post · Public · Embargo until Apr 20',
    lastEdited: 'Last edited Apr 4',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=128&h=128&fit=crop',
  },
  {
    id: 'bd4',
    type: 'thread',
    title: 'Building KaNeXT — 18 months of lessons',
    status: 'Thread · 5 of 8 parts written',
    lastEdited: 'Last edited Apr 2',
    thumbnail: null,
  },
];

const DRAFTS_EDUCATION: Draft[] = [
  {
    id: 'ed1',
    type: 'post',
    title: 'UC Berkeley partnership announcement — full details',
    status: 'Post · Public · Awaiting final approval',
    lastEdited: 'Last edited 4h ago',
    thumbnail: null,
  },
  {
    id: 'ed2',
    type: 'reel',
    title: 'Spring Showcase 2026 — campus highlights reel',
    status: 'Reel · Editing in progress',
    lastEdited: 'Last edited yesterday',
    thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=128&h=128&fit=crop',
  },
  {
    id: 'ed3',
    type: 'post',
    title: 'Fall 2026 housing policy update — key changes',
    status: 'Post · Institutional · Draft in progress',
    lastEdited: 'Last edited Apr 3',
    thumbnail: null,
  },
  {
    id: 'ed4',
    type: 'thread',
    title: 'What Lincoln University stands for — our founding principles',
    status: 'Thread · 2 of 4 parts written',
    lastEdited: 'Last edited Apr 1',
    thumbnail: null,
  },
];

const DRAFTS_BY_MODE: Record<string, Draft[]> = {
  personal:  DRAFTS_PERSONAL,
  community: DRAFTS_COMMUNITY,
  sports:    DRAFTS_SPORTS,
  business:  DRAFTS_BUSINESS,
  education: DRAFTS_EDUCATION,
};

const ROLE_KEY_BY_MODE: Record<string, string> = {
  personal:  'personal:social',
  community: 'community:social',
  sports:    'sports:social',
  business:  'business:social',
  education: 'education:social',
};

// ─── DraftCard ────────────────────────────────────────────────────────────────

interface DraftCardProps {
  draft: Draft;
  onDelete: (id: string) => void;
}

function DraftCard({ draft, onDelete }: DraftCardProps) {
  const C = useColors();
  const translateX = useRef(new Animated.Value(0)).current;
  const swipedOpen = useRef(false);

  const iconConfig: Record<DraftType, { name: string; bg: string }> = {
    post:   { name: 'doc.text',            bg: C.label },
    reel:   { name: 'film',                bg: C.label },
    ktv:    { name: 'play.rectangle.fill', bg: C.gain  },
    thread: { name: 'text.bubble',         bg: C.label },
  };
  const { name: iconName, bg: iconBg } = iconConfig[draft.type];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderGrant: () => {
        translateX.setOffset(swipedOpen.current ? -80 : 0);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, g) => {
        translateX.setValue(Math.min(0, Math.max(-80, g.dx)));
      },
      onPanResponderRelease: (_, g) => {
        translateX.flattenOffset();
        const cur = swipedOpen.current ? -80 + g.dx : g.dx;
        if (cur < -40) {
          Animated.spring(translateX, { toValue: -80, useNativeDriver: true, tension: 100, friction: 12 }).start();
          swipedOpen.current = true;
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 100, friction: 12 }).start();
          swipedOpen.current = false;
        }
      },
    })
  ).current;

  const confirmDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Delete Draft?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Animated.timing(translateX, { toValue: -400, duration: 250, useNativeDriver: true }).start(() => {
            onDelete(draft.id);
          });
        },
      },
    ]);
  };

  return (
    <View style={[dc.wrapper, { marginHorizontal: 16, marginBottom: 10 }]}>
      <View style={[dc.deleteBg, { backgroundColor: C.heat }]}>
        <Pressable style={dc.deleteBtn} onPress={confirmDelete}>
          <Text style={dc.deleteLabel}>Delete</Text>
        </Pressable>
      </View>

      <Animated.View
        style={[dc.card, { backgroundColor: C.surface, transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <View style={[dc.iconCircle, { backgroundColor: iconBg }]}>
          <IconSymbol name={iconName as any} size={18} color={C.bg} />
        </View>

        <View style={dc.textBlock}>
          <Text style={[dc.titleText, { color: C.label }]} numberOfLines={1}>{draft.title}</Text>
          <Text style={[dc.statusText, { color: C.secondary }]} numberOfLines={1}>{draft.status}</Text>
          <Text style={[dc.editedText, { color: C.muted }]}>{draft.lastEdited}</Text>
        </View>

        {draft.thumbnail ? (
          <Image source={{ uri: draft.thumbnail }} style={dc.thumbnail} resizeMode="cover" />
        ) : null}
      </Animated.View>
    </View>
  );
}

const dc = StyleSheet.create({
  wrapper:     { position: 'relative', borderRadius: 14, overflow: 'hidden' },
  deleteBg:    { ...StyleSheet.absoluteFillObject, alignItems: 'flex-end', justifyContent: 'center' },
  deleteBtn:   { width: 80, height: '100%', alignItems: 'center', justifyContent: 'center' },
  deleteLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  card:        { borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconCircle:  { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  textBlock:   { flex: 1, gap: 2 },
  titleText:   { fontSize: 15, fontWeight: '600' },
  statusText:  { fontSize: 13 },
  editedText:  { fontSize: 12 },
  thumbnail:   { width: 64, height: 64, borderRadius: 8, flexShrink: 0 },
});

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  const C = useColors();
  return (
    <View style={es.container}>
      <IconSymbol name="doc.text" size={40} color={C.muted} />
      <Text style={[es.heading, { color: C.label }]}>No drafts</Text>
      <Text style={[es.sub, { color: C.secondary }]}>Start creating and save as draft anytime.</Text>
    </View>
  );
}

const es = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 32 },
  heading:   { fontSize: 17, fontWeight: '600' },
  sub:       { fontSize: 14, textAlign: 'center' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DraftsScreen() {
  const insets = useSafeAreaInsets();
  const C = useColors();
  const mode = useMode();

  const roleKey = ROLE_KEY_BY_MODE[mode] ?? 'personal:social';
  const [role, cycleRole, roleCycles] = useDemoRole(roleKey);
  const isAdmin = role === roleCycles[0];
  const guardedCycle = useOwnerGuard(role, roleCycles, cycleRole, '/(tabs)/(main)/social');
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const initialDrafts = useMemo(() => DRAFTS_BY_MODE[mode] ?? DRAFTS_PERSONAL, [mode]);
  const [drafts, setDrafts] = useState<Draft[]>(initialDrafts);

  // Reset drafts when mode changes
  const prevMode = useRef(mode);
  if (prevMode.current !== mode) {
    prevMode.current = mode;
    setDrafts(DRAFTS_BY_MODE[mode] ?? DRAFTS_PERSONAL);
  }

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const handleDelete = (id: string) => setDrafts(prev => prev.filter(d => d.id !== id));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* Top Bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, borderBottomColor: C.separator, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.kBtn} onPress={() => openSidePanel()} hitSlop={8}>
            <KMenuButton />
          </Pressable>

          <View style={s.centerPill}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Drafts</Text>
            </View>
          </View>

          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={guardedCycle} isPrimary={isAdmin} />
          </View>
        </View>
      </Animated.View>

      {/* Draft list */}
      {drafts.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: insets.top + 52 + 12, paddingBottom: 49 + insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={scrollEventThrottle}
        >
          {drafts.map(d => <DraftCard key={d.id} draft={d} onDelete={handleDelete} />)}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar:      { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  kBtn:        { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  centerPill:  { flex: 1, alignItems: 'center' },
  titlePill:   { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titleText:   { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap: { alignItems: 'flex-end', flexShrink: 0 },
});
