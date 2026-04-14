/**
 * Drafts — Owner-only. Saved draft posts, reels, KTV episodes, and threads.
 * Swipe left on a card to reveal Delete.
 */

import React, { useState, useRef, useCallback } from 'react';
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

// ─── Demo Data ────────────────────────────────────────────────────────────────

const INITIAL_DRAFTS: Draft[] = [
  {
    id: 'd1',
    type: 'post',
    title: 'The coaching philosophy that changed everything...',
    status: 'Post · No image attached',
    lastEdited: 'Last edited 2h ago',
    thumbnail: null,
  },
  {
    id: 'd2',
    type: 'reel',
    title: 'Speed & agility drill breakdown',
    status: 'Reel · Video ready, needs caption',
    lastEdited: 'Last edited yesterday',
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=128&h=128&fit=crop',
  },
  {
    id: 'd3',
    type: 'ktv',
    title: 'Interview with Coach Middlebrooks',
    status: 'KTV · Needs intro/outro editing',
    lastEdited: 'Last edited Apr 3',
    thumbnail: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=128&h=128&fit=crop',
  },
  {
    id: 'd4',
    type: 'thread',
    title: '5 recruiting mistakes I see every year...',
    status: 'Thread · 3 of 7 parts written',
    lastEdited: 'Last edited Apr 2',
    thumbnail: null,
  },
];

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
      {/* Delete action revealed behind */}
      <View style={[dc.deleteBg, { backgroundColor: C.heat }]}>
        <Pressable style={dc.deleteBtn} onPress={confirmDelete}>
          <Text style={dc.deleteLabel}>Delete</Text>
        </Pressable>
      </View>

      {/* Swipeable front */}
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
  const [role, cycleRole, roleCycles] = useDemoRole('personal:social');
  const isOwner = role === roleCycles[0];
  const guardedCycle = useOwnerGuard(role, roleCycles, cycleRole, '/(tabs)/(main)/social');
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [drafts, setDrafts] = useState<Draft[]>(INITIAL_DRAFTS);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  if (!isOwner) return null;

  const handleDelete = (id: string) => setDrafts(prev => prev.filter(d => d.id !== id));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top + 8, borderBottomColor: C.separator, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => openSidePanel()} hitSlop={8}>
            <KMenuButton />
          </Pressable>

          <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={[s.titleText, { color: C.label }]}>Drafts</Text>
          </View>

          <RolePill role={role} onPress={guardedCycle} isPrimary={isOwner} />
        </View>
      </Animated.View>

      {/* Draft list */}
      {drafts.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: insets.top + 8 + 52 + 12, paddingBottom: 49 + insets.bottom + 24 }}
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
  topBar:      { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  titlePill:   { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titleText:   { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
});
