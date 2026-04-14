/**
 * Person Profile Page
 * Full-page social profile for an individual member.
 * Route param: authorId (e.g. "sa1", "ba3")
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { getFeedPosts, type FeedPost } from '@/data/mock-social';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ── Data ──────────────────────────────────────────────────────────────────────

const AUTHOR_META: Record<string, { role: string; brand: string }> = {
  sa1: { role: 'Head Coach',    brand: 'Varsity FC'    },
  sa2: { role: 'Forward',       brand: 'Varsity FC'    },
  sa3: { role: 'Midfielder',    brand: 'Varsity FC'    },
  sa4: { role: 'Defender',      brand: 'Varsity FC'    },
  sa5: { role: 'Analyst',       brand: 'Varsity FC'    },
  sa6: { role: 'Captain',       brand: 'Varsity FC'    },
  ca1: { role: 'Lead Pastor',   brand: 'Grace Church'  },
  ca2: { role: 'Worship Leader',brand: 'Grace Church'  },
  ca3: { role: 'Tech Director', brand: 'Grace Church'  },
  ca4: { role: 'Ministry Lead', brand: 'Grace Church'  },
  ca5: { role: 'Volunteer',     brand: 'Grace Church'  },
  ca6: { role: 'Elder',         brand: 'Grace Church'  },
  ea1: { role: 'Professor',     brand: 'Lincoln Univ.' },
  ea2: { role: 'Student',       brand: 'Lincoln Univ.' },
  ea3: { role: 'Dean',          brand: 'Lincoln Univ.' },
  ea4: { role: 'Student',       brand: 'Lincoln Univ.' },
  ea5: { role: 'Professor',     brand: 'Lincoln Univ.' },
  ea6: { role: 'Student Council',brand: 'Lincoln Univ.'},
  ba1: { role: 'CEO',           brand: 'NovaTech Inc.' },
  ba2: { role: 'Product Lead',  brand: 'NovaTech Inc.' },
  ba3: { role: 'Operations',    brand: 'NovaTech Inc.' },
  ba4: { role: 'Marketing',     brand: 'NovaTech Inc.' },
  ba5: { role: 'Data Lead',     brand: 'NovaTech Inc.' },
  ba6: { role: 'Designer',      brand: 'NovaTech Inc.' },
};

const MOCK_BIOS: Record<string, string> = {
  sa1: 'Building champions on and off the field. ⚽',
  sa2: 'Forward. Fast. Focused. #VarsityFC',
  ba1: 'Building the future of work. 🚀',
  ba2: 'Product obsessed. Always shipping.',
  ca1: 'Serving our community with love and purpose. 🙏',
  ea1: 'Inspiring curiosity, one lecture at a time. 📚',
  ea3: 'Excellence in education, leadership in action.',
};

function authorStats(id: string) {
  const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    postCount:      ((seed * 7)  % 140) + 8,
    followerCount:  ((seed * 13) % 2800) + 50,
    followingCount: ((seed * 11) % 380) + 30,
  };
}

function fmtStat(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

type GridTab = 'posts' | 'reels' | 'tagged';

const ALL_FEED_MODES = ['sports', 'business', 'community', 'education'] as const;

// ── Screen ────────────────────────────────────────────────────────────────────

export default function PersonProfileScreen() {
  const { authorId } = useLocalSearchParams<{ authorId: string }>();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const C       = useColors();
  const { width } = useWindowDimensions();

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [gridTab,  setGridTab]  = useState<GridTab>('posts');
  const [followed, setFollowed] = useState(false);

  // Gather all posts across all modes to find this author's
  const allPosts: FeedPost[] = useMemo(
    () => ALL_FEED_MODES.flatMap(m => getFeedPosts(m)),
    [],
  );

  const authorPost = allPosts.find(p => p.author.id === authorId);
  const meta       = authorId ? AUTHOR_META[authorId] : null;
  const stats      = authorId ? authorStats(authorId) : null;

  if (!authorPost || !stats) {
    return (
      <View style={[styles.root, { backgroundColor: C.bg, paddingTop: insets.top }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <View style={styles.emptyCenter}>
          <Text style={[styles.emptyText, { color: C.muted }]}>Profile not found</Text>
        </View>
      </View>
    );
  }

  const author     = authorPost.author;
  const bio        = MOCK_BIOS[authorId ?? ''] ?? `Member of ${meta?.brand ?? 'the community'}.`;
  const cellSz     = (width - 2) / 3;

  // Posts with media for the grid
  const mediaPosts = allPosts.filter(p => p.author.id === authorId && p.media.length > 0);
  const gridItems  = mediaPosts.length >= 3
    ? mediaPosts
    : allPosts.filter(p => p.media.length > 0).slice(0, 9);

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      {/* Header */}
      <Animated.View style={[styles.topBarOuter, { paddingTop: insets.top + 6, borderBottomColor: C.separator, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={styles.header}>
          <Pressable
            style={styles.backBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <IconSymbol name="chevron.left" size={20} color={C.label} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: C.label }]}>{author.name}</Text>
          <View style={styles.backBtn} />
        </View>
      </Animated.View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 6 + 56 + 8, paddingBottom: 60 }}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* Avatar + stats */}
        <View style={styles.topRow}>
          <View style={[styles.avatar, { backgroundColor: C.accent }]}>
            <Text style={styles.avatarText}>{author.initials}</Text>
          </View>
          <View style={styles.statsRow}>
            {[
              { label: 'Posts',     value: fmtStat(stats.postCount) },
              { label: 'Followers', value: fmtStat(stats.followerCount) },
              { label: 'Following', value: fmtStat(stats.followingCount) },
            ].map(s => (
              <View key={s.label} style={styles.statItem}>
                <Text style={[styles.statValue, { color: C.label }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: C.secondary }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Name / handle / role / bio */}
        <View style={styles.infoBlock}>
          <Text style={[styles.fullName, { color: C.label }]}>{author.name}</Text>
          <Text style={[styles.handle,   { color: C.secondary }]}>{author.username}</Text>
          {meta && (
            <Text style={[styles.role, { color: C.muted }]}>{meta.role} · {meta.brand}</Text>
          )}
          <Text style={[styles.bio, { color: C.label }]}>{bio}</Text>
        </View>

        {/* Follow / Message */}
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.followBtn, {
              backgroundColor: followed ? C.surface : C.accent,
              borderColor:     followed ? C.inputBorder : C.accent,
            }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setFollowed(f => !f);
            }}
          >
            <Text style={[styles.followLabel, { color: followed ? C.label : '#fff' }]}>
              {followed ? 'Following' : 'Follow'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.messageBtn, { borderColor: C.inputBorder }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={[styles.messageLabel, { color: C.label }]}>Message</Text>
          </Pressable>
        </View>

        {/* Grid sub-tabs */}
        <View style={[styles.gridTabBar, { borderColor: C.separator }]}>
          {(['posts', 'reels', 'tagged'] as GridTab[]).map(t => (
            <Pressable
              key={t}
              style={[styles.gridTab, gridTab === t && { borderBottomColor: C.label }]}
              onPress={() => { Haptics.selectionAsync(); setGridTab(t); }}
            >
              <IconSymbol
                name={
                  t === 'posts'  ? 'squareshape.split.2x2' :
                  t === 'reels'  ? 'play.square' :
                                   'person.crop.rectangle'
                }
                size={20}
                color={gridTab === t ? C.label : C.muted}
              />
            </Pressable>
          ))}
        </View>

        {/* Grid content */}
        {gridTab === 'tagged' ? (
          <View style={styles.emptyCenter}>
            <IconSymbol name="person.crop.rectangle" size={36} color={C.muted} />
            <Text style={[styles.emptyText, { color: C.muted }]}>No tagged posts yet</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {gridItems.slice(0, 12).map((post, i) => (
              <Pressable
                key={post.id + i}
                style={[styles.gridCell, { width: cellSz, height: cellSz }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <View style={[StyleSheet.absoluteFill, {
                  backgroundColor: `hsl(${(i * 37 + 200) % 360},18%,82%)`,
                }]} />
                {post.media.length > 1 ? (
                  <View style={styles.multiIcon}>
                    <IconSymbol name="square.on.square" size={11} color="#fff" />
                  </View>
                ) : null}
                {gridTab === 'reels' ? (
                  <View style={[StyleSheet.absoluteFill, styles.reelOverlay]}>
                    <IconSymbol name="play.fill" size={22} color="rgba(255,255,255,0.7)" />
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  backBtn:     { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', textAlign: 'center' },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 14,
    gap: 18,
  },
  avatar:     { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 30, fontWeight: '700', color: '#fff' },
  statsRow:   { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  statItem:   { alignItems: 'center', gap: 3 },
  statValue:  { fontSize: 20, fontWeight: '700' },
  statLabel:  { fontSize: 12 },
  infoBlock:  { paddingHorizontal: 16, paddingBottom: 16, gap: 2 },
  fullName:   { fontSize: 16, fontWeight: '700' },
  handle:     { fontSize: 14 },
  role:       { fontSize: 13, marginTop: 1 },
  bio:        { fontSize: 15, lineHeight: 22, marginTop: 8 },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  followBtn:     { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1.5 },
  followLabel:   { fontSize: 14, fontWeight: '600' },
  messageBtn:    { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1.5 },
  messageLabel:  { fontSize: 14, fontWeight: '600' },
  gridTabBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 1,
  },
  gridTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 1 },
  gridCell:  { overflow: 'hidden', position: 'relative' },
  multiIcon: { position: 'absolute', top: 6, right: 6 },
  reelOverlay: { alignItems: 'center', justifyContent: 'center' },
  emptyCenter: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText:   { fontSize: 14 },
});
