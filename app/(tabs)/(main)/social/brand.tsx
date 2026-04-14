/**
 * Brand Profile Page
 * Full-page social profile for a brand/organization.
 * Route param: brand (e.g. "Varsity FC", "NovaTech Inc.")
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet,
  useWindowDimensions, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { getFeedPosts, type FeedPost } from '@/data/mock-social';
import type { Mode } from '@/types';

// ── Brand data ────────────────────────────────────────────────────────────────

interface BrandData {
  mode:      Mode;
  initials:  string;
  tagline:   string;
  founded:   string;
  memberIds: string[];
  members:   { id: string; name: string; initials: string; role: string }[];
}

const BRAND_DATA: Record<string, BrandData> = {
  'Varsity FC': {
    mode: 'sports', initials: 'VFC',
    tagline: 'Building champions on and off the field.',
    founded: '2018',
    memberIds: ['sa1','sa2','sa3','sa4','sa5','sa6'],
    members: [
      { id: 'sa1', name: 'Alex Rivera',   initials: 'AR', role: 'Head Coach' },
      { id: 'sa2', name: 'Jordan Smith',  initials: 'JS', role: 'Forward'    },
      { id: 'sa3', name: 'Casey Park',    initials: 'CP', role: 'Midfielder' },
      { id: 'sa4', name: 'Morgan Lee',    initials: 'ML', role: 'Defender'   },
      { id: 'sa5', name: 'Riley Nguyen',  initials: 'RN', role: 'Analyst'    },
      { id: 'sa6', name: 'Drew Wilson',   initials: 'DW', role: 'Captain'    },
    ],
  },
  'NovaTech Inc.': {
    mode: 'business', initials: 'NT',
    tagline: 'Technology solutions for a connected world.',
    founded: '2019',
    memberIds: ['ba1','ba2','ba3','ba4','ba5','ba6'],
    members: [
      { id: 'ba1', name: 'Sam Chen',     initials: 'SC', role: 'CEO'          },
      { id: 'ba2', name: 'Taylor Reed',  initials: 'TR', role: 'Product Lead' },
      { id: 'ba3', name: 'Jamie Torres', initials: 'JT', role: 'Operations'   },
      { id: 'ba4', name: 'Quinn Patel',  initials: 'QP', role: 'Marketing'    },
      { id: 'ba5', name: 'Avery Kim',    initials: 'AK', role: 'Data Lead'    },
      { id: 'ba6', name: 'Dana Flores',  initials: 'DF', role: 'Designer'     },
    ],
  },
  'Grace Church': {
    mode: 'community', initials: 'GC',
    tagline: 'Love God. Love People. Serve Together.',
    founded: '1992',
    memberIds: ['ca1','ca2','ca3','ca4','ca5','ca6'],
    members: [
      { id: 'ca1', name: 'Taylor Brooks', initials: 'TB', role: 'Lead Pastor'    },
      { id: 'ca2', name: 'Chris Monroe',  initials: 'CM', role: 'Worship Leader' },
      { id: 'ca3', name: 'Robin Shah',    initials: 'RS', role: 'Tech Director'  },
      { id: 'ca4', name: 'Jesse Grant',   initials: 'JG', role: 'Ministry Lead'  },
      { id: 'ca5', name: 'Sage Okafor',   initials: 'SO', role: 'Volunteer'      },
      { id: 'ca6', name: 'Blake Turner',  initials: 'BT', role: 'Elder'          },
    ],
  },
  'Lincoln Univ.': {
    mode: 'education', initials: 'LU',
    tagline: 'Knowledge. Excellence. Service.',
    founded: '1965',
    memberIds: ['ea1','ea2','ea3','ea4','ea5','ea6'],
    members: [
      { id: 'ea1', name: 'Jordan Lee',    initials: 'JL', role: 'Professor'      },
      { id: 'ea2', name: 'Skyler Adams',  initials: 'SA', role: 'Student'        },
      { id: 'ea3', name: 'Morgan Ellis',  initials: 'ME', role: 'Dean'           },
      { id: 'ea4', name: 'Reese Chu',     initials: 'RC', role: 'Student'        },
      { id: 'ea5', name: 'Parker James',  initials: 'PJ', role: 'Professor'      },
      { id: 'ea6', name: 'Finley Cross',  initials: 'FC', role: 'Student Council'},
    ],
  },
};

type BrandTab = 'posts' | 'members' | 'about';

// ── Screen ────────────────────────────────────────────────────────────────────

export default function BrandProfileScreen() {
  const { brand: brandParam } = useLocalSearchParams<{ brand: string }>();
  const brand = brandParam ?? '';

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const C      = useColors();
  const { width } = useWindowDimensions();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [activeTab, setActiveTab] = useState<BrandTab>('posts');
  const [following, setFollowing] = useState(false);

  const data    = BRAND_DATA[brand];
  const cellSz  = (width - 2) / 3;

  const posts: FeedPost[] = useMemo(
    () => data ? getFeedPosts(data.mode) : [],
    [data],
  );
  const gridPosts = posts.filter(p => p.media.length > 0).slice(0, 12);

  if (!data) {
    return (
      <View style={[styles.root, { backgroundColor: C.bg, paddingTop: insets.top }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <View style={styles.emptyCenter}>
          <Text style={[styles.emptyText, { color: C.muted }]}>Brand not found</Text>
        </View>
      </View>
    );
  }

  const postCount = posts.length;

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[styles.topBarOuter, { paddingTop: insets.top + 6, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={styles.headerInner}>
          <Pressable
            style={styles.backBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <IconSymbol name="chevron.left" size={20} color={C.label} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: C.label }]}>{brand}</Text>
          <View style={styles.backBtn} />
        </View>
      </Animated.View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 6 + 56 + 8, paddingBottom: 60 }}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* Brand avatar + stats */}
        <View style={styles.topRow}>
          <View style={[styles.brandAvatar, { backgroundColor: C.label }]}>
            <Text style={[styles.brandInitials, { color: C.bg }]}>{data.initials}</Text>
          </View>
          <View style={styles.statsRow}>
            {[
              { label: 'Posts',   value: String(postCount) },
              { label: 'Members', value: String(data.members.length) },
              { label: 'Founded', value: data.founded },
            ].map(s => (
              <View key={s.label} style={styles.statItem}>
                <Text style={[styles.statValue, { color: C.label }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: C.secondary }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Brand info */}
        <View style={styles.infoBlock}>
          <Text style={[styles.brandName,    { color: C.label }]}>{brand}</Text>
          <Text style={[styles.brandTagline, { color: C.secondary }]}>{data.tagline}</Text>
        </View>

        {/* Follow / Message Brand */}
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.followBtn, {
              backgroundColor: following ? C.surface : C.accent,
              borderColor:     following ? C.inputBorder : C.accent,
            }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setFollowing(f => !f);
            }}
          >
            <Text style={[styles.followLabel, { color: following ? C.label : '#fff' }]}>
              {following ? 'Following' : 'Follow'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.messageBtn, { borderColor: C.inputBorder }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={[styles.messageLabel, { color: C.label }]}>Message</Text>
          </Pressable>
        </View>

        {/* Tab bar: Posts / Members / About */}
        <View style={[styles.tabBar, { borderColor: C.separator }]}>
          {(['posts', 'members', 'about'] as BrandTab[]).map(t => (
            <Pressable
              key={t}
              style={[styles.tab, activeTab === t && { borderBottomColor: C.label }]}
              onPress={() => { Haptics.selectionAsync(); setActiveTab(t); }}
            >
              <Text style={[styles.tabLabel, {
                color: activeTab === t ? C.label : C.muted,
                fontWeight: activeTab === t ? '600' : '400',
              }]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Posts grid */}
        {activeTab === 'posts' ? (
          gridPosts.length === 0 ? (
            <View style={styles.emptyCenter}>
              <IconSymbol name="photo" size={36} color={C.muted} />
              <Text style={[styles.emptyText, { color: C.muted }]}>No posts yet</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {gridPosts.map((post, i) => (
                <Pressable
                  key={post.id}
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
                </Pressable>
              ))}
            </View>
          )
        ) : null}

        {/* Members list */}
        {activeTab === 'members' ? (
          <View style={styles.memberList}>
            {data.members.map(member => (
              <Pressable
                key={member.id}
                style={[styles.memberRow, { borderBottomColor: C.separator }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({
                    pathname: '/(tabs)/(main)/social/person',
                    params: { authorId: member.id },
                  } as any);
                }}
              >
                <View style={[styles.memberAvatar, { backgroundColor: C.accent }]}>
                  <Text style={[styles.memberInitials, { color: '#fff' }]}>{member.initials}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={[styles.memberName, { color: C.label }]}>{member.name}</Text>
                  <Text style={[styles.memberRole, { color: C.secondary }]}>{member.role}</Text>
                </View>
                <IconSymbol name="chevron.right" size={14} color={C.muted} />
              </Pressable>
            ))}
          </View>
        ) : null}

        {/* About */}
        {activeTab === 'about' ? (
          <View style={styles.aboutBlock}>
            <View style={[styles.aboutRow, { borderBottomColor: C.separator }]}>
              <IconSymbol name="building.2" size={18} color={C.accent} />
              <View>
                <Text style={[styles.aboutLabel, { color: C.muted }]}>Organization</Text>
                <Text style={[styles.aboutValue, { color: C.label }]}>{brand}</Text>
              </View>
            </View>
            <View style={[styles.aboutRow, { borderBottomColor: C.separator }]}>
              <IconSymbol name="calendar" size={18} color={C.accent} />
              <View>
                <Text style={[styles.aboutLabel, { color: C.muted }]}>Founded</Text>
                <Text style={[styles.aboutValue, { color: C.label }]}>{data.founded}</Text>
              </View>
            </View>
            <View style={[styles.aboutRow, { borderBottomColor: C.separator }]}>
              <IconSymbol name="person.2" size={18} color={C.accent} />
              <View>
                <Text style={[styles.aboutLabel, { color: C.muted }]}>Members</Text>
                <Text style={[styles.aboutValue, { color: C.label }]}>{data.members.length} active</Text>
              </View>
            </View>
            <View style={[styles.aboutRow, { borderBottomColor: 'transparent' }]}>
              <IconSymbol name="quote.bubble" size={18} color={C.accent} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.aboutLabel, { color: C.muted }]}>Tagline</Text>
                <Text style={[styles.aboutValue, { color: C.label }]}>{data.tagline}</Text>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  headerInner: {
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
    paddingTop: 24,
    paddingBottom: 16,
    gap: 18,
  },
  brandAvatar:   { width: 84, height: 84, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  brandInitials: { fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
  statsRow:      { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  statItem:      { alignItems: 'center', gap: 3 },
  statValue:     { fontSize: 20, fontWeight: '700' },
  statLabel:     { fontSize: 12 },
  infoBlock:     { paddingHorizontal: 16, paddingBottom: 16, gap: 4 },
  brandName:     { fontSize: 18, fontWeight: '700' },
  brandTagline:  { fontSize: 14, lineHeight: 20 },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  followBtn:    { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1.5 },
  followLabel:  { fontSize: 14, fontWeight: '600' },
  messageBtn:   { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1.5 },
  messageLabel: { fontSize: 14, fontWeight: '600' },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: { fontSize: 13 },
  // Grid
  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 1 },
  gridCell:  { overflow: 'hidden', position: 'relative' },
  multiIcon: { position: 'absolute', top: 6, right: 6 },
  // Members
  memberList:     { paddingHorizontal: 0 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  memberAvatar:   { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  memberInitials: { fontSize: 14, fontWeight: '700' },
  memberInfo:     { flex: 1 },
  memberName:     { fontSize: 15, fontWeight: '500' },
  memberRole:     { fontSize: 13, marginTop: 1 },
  // About
  aboutBlock:  { paddingHorizontal: 16, paddingTop: 16 },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  aboutLabel: { fontSize: 12, marginBottom: 2 },
  aboutValue: { fontSize: 15 },
  // Empty
  emptyCenter: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText:   { fontSize: 14 },
});
