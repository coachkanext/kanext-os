import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { useDemoRole } from '@/utils/demo-role-store';
import { openSidePanel } from '@/utils/global-side-panel';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SpaceTier = 'free' | 'supporters' | 'inner_circle';

interface SpaceItem {
  id: string;
  icon: string;
  name: string;
  tier: SpaceTier;
  tierLabel: string;
  members: number;
  lastActive: string;
  unread: number;
}

interface PostItem {
  id: string;
  authorName: string;
  initials: string;
  hue: number;
  tier: SpaceTier;
  tierLabel: string;
  timestamp: string;
  content: string;
  likes: number;
  replies: number;
  isPinned?: boolean;
}

interface ReplyItem {
  id: string;
  authorName: string;
  initials: string;
  hue: number;
  timestamp: string;
  content: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const SPACES: SpaceItem[] = [
  { id: 'general',      icon: 'bubble.left.and.bubble.right.fill', name: 'General',             tier: 'free',         tierLabel: 'Free Community', members: 1247, lastActive: '2m ago',  unread: 3 },
  { id: 'wins',         icon: 'trophy.fill',                       name: 'Wins',                tier: 'free',         tierLabel: 'Free Community', members: 1247, lastActive: '14m ago', unread: 0 },
  { id: 'coaching',     icon: 'questionmark.circle.fill',          name: 'Coaching Q&A',        tier: 'supporters',   tierLabel: 'Supporters',     members: 312,  lastActive: '1h ago',  unread: 7 },
  { id: 'resources',    icon: 'folder.fill',                       name: 'Resources',           tier: 'supporters',   tierLabel: 'Supporters',     members: 312,  lastActive: '3h ago',  unread: 0 },
  { id: 'inner_lounge', icon: 'star.fill',                         name: 'Inner Circle Lounge', tier: 'inner_circle', tierLabel: 'Inner Circle',   members: 48,   lastActive: '30m ago', unread: 1 },
];

const FOLLOWER_TIER: SpaceTier = 'supporters';
const TIER_RANK: Record<string, number> = { free: 0, supporters: 1, inner_circle: 2 };

const MOCK_POSTS: Record<string, PostItem[]> = {
  general: [
    { id: 'g1', authorName: 'Marcus Webb',   initials: 'MW', hue: 210, tier: 'free',         tierLabel: 'Free Community', timestamp: '2m ago',  content: 'Just dropped my latest YouTube video! Check it out 🎬',                                likes: 24, replies: 3 },
    { id: 'g2', authorName: 'Priya Nair',    initials: 'PN', hue: 280, tier: 'free',         tierLabel: 'Free Community', timestamp: '18m ago', content: 'Anyone from Chicago here? Would love to connect IRL',                                   likes: 11, replies: 6 },
    { id: 'g3', authorName: 'Devon Clarke',  initials: 'DC', hue: 160, tier: 'supporters',   tierLabel: 'Supporters',     timestamp: '45m ago', content: 'This community is exactly what I needed. Week 1 done! 💪',                              likes: 38, replies: 9 },
  ],
  wins: [
    { id: 'w1', authorName: 'Tasha Monroe',  initials: 'TM', hue: 30,  tier: 'free',         tierLabel: 'Free Community', timestamp: '5m ago',  content: 'Just hit 10K followers on Instagram!',                                                  likes: 61, replies: 14 },
    { id: 'w2', authorName: 'Jordan Felix',  initials: 'JF', hue: 190, tier: 'supporters',   tierLabel: 'Supporters',     timestamp: '1h ago',  content: "Landed my first brand deal — $2,500! Couldn't have done it without the coaching here.", likes: 93, replies: 21 },
    { id: 'w3', authorName: 'Alicia Voss',   initials: 'AV', hue: 340, tier: 'supporters',   tierLabel: 'Supporters',     timestamp: '3h ago',  content: 'Sold out my first digital product in 48 hours!',                                        likes: 77, replies: 18 },
  ],
  coaching: [
    { id: 'c1', authorName: 'Remi Okafor',   initials: 'RO', hue: 55,  tier: 'supporters',   tierLabel: 'Supporters',     timestamp: '10m ago', content: "How do I price my 1-on-1 coaching calls? Starting out and not sure what's fair.",      likes: 8,  replies: 12 },
    { id: 'c2', authorName: 'Sasha Bloom',   initials: 'SB', hue: 240, tier: 'free',         tierLabel: 'Free Community', timestamp: '2h ago',  content: 'Is it better to niche down or stay broad early on?',                                    likes: 19, replies: 8  },
    { id: 'c3', authorName: 'Keon Bright',   initials: 'KB', hue: 170, tier: 'supporters',   tierLabel: 'Supporters',     timestamp: '5h ago',  content: 'Any advice on dealing with creative burnout?',                                          likes: 32, replies: 15 },
  ],
  resources: [
    { id: 'r1', authorName: 'Lily Chen',     initials: 'LC', hue: 120, tier: 'supporters',   tierLabel: 'Supporters',     timestamp: '20m ago', content: 'Just shared a Notion template for content planning in the files section.',              likes: 44, replies: 7  },
    { id: 'r2', authorName: 'Omar Diallo',   initials: 'OD', hue: 310, tier: 'supporters',   tierLabel: 'Supporters',     timestamp: '4h ago',  content: "Here's the email funnel I use to convert subscribers to paying clients.",              likes: 56, replies: 11 },
    { id: 'r3', authorName: 'Nadia Reyes',   initials: 'NR', hue: 20,  tier: 'free',         tierLabel: 'Free Community', timestamp: '1d ago',  content: "Book rec: 'Million Dollar Weekend' by Noah Kagan — game changer.",                     likes: 29, replies: 5  },
  ],
  inner_lounge: [
    { id: 'i1', authorName: 'Chris Malone',  initials: 'CM', hue: 260, tier: 'inner_circle', tierLabel: 'Inner Circle',   timestamp: '30m ago', content: "Sammy — what's the one thing you'd tell your 2020 self?",                              likes: 7,  replies: 4  },
    { id: 'i2', authorName: 'Brianna Koss',  initials: 'BK', hue: 90,  tier: 'inner_circle', tierLabel: 'Inner Circle',   timestamp: '2h ago',  content: 'Monthly check-in: revenue up 34% this month!',                                         likes: 22, replies: 6  },
    { id: 'i3', authorName: 'Nico Farrell',  initials: 'NF', hue: 200, tier: 'inner_circle', tierLabel: 'Inner Circle',   timestamp: '6h ago',  content: 'I used your exact pricing framework. Closed a $15K retainer.',                         likes: 31, replies: 9  },
  ],
};

const MOCK_REPLIES: Record<string, ReplyItem[]> = {
  g1: [
    { id: 'r-g1-1', authorName: 'Priya Nair',   initials: 'PN', hue: 280, timestamp: '1m ago',  content: 'Watched it — fire content! The editing is next level 🔥' },
    { id: 'r-g1-2', authorName: 'Devon Clarke',  initials: 'DC', hue: 160, timestamp: '2m ago',  content: 'Subscribed! Keep it coming.' },
  ],
  w1: [
    { id: 'r-w1-1', authorName: 'Jordan Felix',  initials: 'JF', hue: 190, timestamp: '3m ago',  content: "Let's gooo! You put in the work, you earned it!" },
    { id: 'r-w1-2', authorName: 'Alicia Voss',   initials: 'AV', hue: 340, timestamp: '4m ago',  content: '10K is just the beginning 🚀' },
  ],
  c1: [
    { id: 'r-c1-1', authorName: 'Sasha Bloom',   initials: 'SB', hue: 240, timestamp: '8m ago',  content: 'I started at $75/hr and raised to $150 after 3 months. Test and adjust!' },
    { id: 'r-c1-2', authorName: 'Keon Bright',   initials: 'KB', hue: 170, timestamp: '9m ago',  content: 'Look at what others in your niche charge and position in the middle third.' },
  ],
  r1: [
    { id: 'r-r1-1', authorName: 'Omar Diallo',   initials: 'OD', hue: 310, timestamp: '15m ago', content: 'This template saved me hours every week — highly recommend.' },
    { id: 'r-r1-2', authorName: 'Nadia Reyes',   initials: 'NR', hue: 20,  timestamp: '18m ago', content: 'Could you share a walkthrough video of how you use it?' },
  ],
  i1: [
    { id: 'r-i1-1', authorName: 'Brianna Koss',  initials: 'BK', hue: 90,  timestamp: '28m ago', content: 'Curious about this too — the mindset shift must have been huge.' },
    { id: 'r-i1-2', authorName: 'Nico Farrell',  initials: 'NF', hue: 200, timestamp: '29m ago', content: "I'd say: \"Charge more and stop over-delivering for free.\"" },
  ],
};

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------

function Avatar({ initials, hue, size = 36 }: { initials: string; hue: number; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: `hsl(${hue},35%,75%)`, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.35, fontWeight: '700', color: '#1A1714' }}>{initials}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function SpacesScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('personal:network');
  const isOwner = role === roleCycles[0];

  const topBarH = insets.top + 52;

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [upgradeSheet, setUpgradeSheet] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState<SpaceItem | null>(null);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const activeSpace = useMemo(() => SPACES.find(s => s.id === spaceId) ?? null, [spaceId]);
  const posts = spaceId ? (MOCK_POSTS[spaceId] ?? []) : [];

  const accessibleSpaces = SPACES.filter(s => TIER_RANK[s.tier] <= TIER_RANK[FOLLOWER_TIER]);
  const lockedSpaces = SPACES.filter(s => TIER_RANK[s.tier] > TIER_RANK[FOLLOWER_TIER]);

  // ── Tier badge ─────────────────────────────────────────────────────────────

  function TierBadge({ tier, tierLabel }: { tier: SpaceTier; tierLabel: string }) {
    if (tier === 'inner_circle') {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.surface, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
          <IconSymbol name="star.fill" size={9} color={C.label} />
          <Text style={{ fontSize: 11, color: C.label, fontWeight: '600' }}>{tierLabel}</Text>
        </View>
      );
    }
    if (tier === 'supporters') {
      return (
        <View style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: '#B8943E', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
          <Text style={{ fontSize: 11, color: '#B8943E', fontWeight: '600' }}>{tierLabel}</Text>
        </View>
      );
    }
    return <Text style={{ fontSize: 11, color: C.secondary }}>{tierLabel}</Text>;
  }

  // ── Space card ─────────────────────────────────────────────────────────────

  function SpaceCard({ space, locked = false }: { space: SpaceItem; locked?: boolean }) {
    return (
      <Pressable
        onPress={() => {
          if (locked) {
            setUpgradeTarget(space);
            setUpgradeSheet(true);
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSpaceId(space.id);
          }
        }}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: C.surface,
          borderRadius: 14,
          padding: 14,
          marginHorizontal: 16,
          marginBottom: 10,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: C.separator,
          gap: 12,
          opacity: locked ? 0.5 : pressed ? 0.75 : 1,
        })}
      >
        <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
          <IconSymbol name={(locked ? 'lock.fill' : space.icon) as any} size={20} color={C.secondary} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{space.name}</Text>
          <TierBadge tier={space.tier} tierLabel={space.tierLabel} />
          <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>
            {space.members.toLocaleString()} members · {space.lastActive}
          </Text>
        </View>
        {!locked && space.unread > 0 ? (
          <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: C.ember, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFFFFF' }}>{space.unread}</Text>
          </View>
        ) : (
          <IconSymbol name="chevron.right" size={14} color={C.secondary} />
        )}
      </Pressable>
    );
  }

  // ── Post card ──────────────────────────────────────────────────────────────

  function PostCard({ post, isFirst }: { post: PostItem; isFirst: boolean }) {
    const replies = MOCK_REPLIES[post.id] ?? [];
    const isExpanded = expandedPost === post.id;
    const isMenuOpen = menuOpenId === post.id;

    return (
      <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
        {post.isPinned && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 }}>
            <IconSymbol name="pin.fill" size={11} color={C.secondary} />
            <Text style={{ fontSize: 12, color: C.secondary }}>Pinned</Text>
          </View>
        )}
        <View style={{ backgroundColor: post.isPinned ? C.surface : C.bg, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, padding: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <Avatar initials={post.initials} hue={post.hue} size={36} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{post.authorName}</Text>
                <TierBadge tier={post.tier} tierLabel={post.tierLabel} />
                <Text style={{ fontSize: 12, color: C.secondary }}>{post.timestamp}</Text>
              </View>
              <Text style={{ fontSize: 14, color: C.label, lineHeight: 20, marginTop: 6 }}>{post.content}</Text>
            </View>
            {isOwner && (
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMenuOpenId(isMenuOpen ? null : post.id); }}
                style={{ padding: 4 }}
              >
                <IconSymbol name="ellipsis" size={16} color={C.secondary} />
              </Pressable>
            )}
          </View>

          {isOwner && isMenuOpen && (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
              {[
                { icon: 'pin.fill',        label: 'Pin',    color: C.label },
                { icon: 'trash.fill',      label: 'Delete', color: '#B85C5C' },
                { icon: 'person.fill.xmark', label: 'Remove', color: '#B85C5C' },
              ].map(a => (
                <Pressable
                  key={a.label}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setMenuOpenId(null); }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.surface, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}
                >
                  <IconSymbol name={a.icon as any} size={13} color={a.color} />
                  <Text style={{ fontSize: 13, color: a.color }}>{a.label}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 20, marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <IconSymbol name="heart" size={15} color={C.secondary} />
              <Text style={{ fontSize: 13, color: C.secondary }}>{post.likes}</Text>
            </Pressable>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setExpandedPost(isExpanded ? null : post.id); }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
            >
              <IconSymbol name="bubble.right" size={15} color={C.secondary} />
              <Text style={{ fontSize: 13, color: C.secondary }}>{post.replies}</Text>
            </Pressable>
          </View>

          {isFirst && isExpanded && replies.length > 0 && (
            <View style={{ marginTop: 12, gap: 10 }}>
              {replies.map(reply => (
                <View key={reply.id} style={{ flexDirection: 'row', gap: 8, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
                  <Avatar initials={reply.initials} hue={reply.hue} size={28} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{reply.authorName}</Text>
                      <Text style={{ fontSize: 12, color: C.secondary }}>{reply.timestamp}</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: C.label, lineHeight: 18, marginTop: 3 }}>{reply.content}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  }

  // ── Detail view ────────────────────────────────────────────────────────────

  if (spaceId && activeSpace) {
    const pinnedPost: PostItem | undefined = spaceId === 'general'
      ? { id: 'pinned-general', authorName: 'Sammy Kalejaiye', initials: 'SK', hue: 25, tier: 'inner_circle', tierLabel: 'Inner Circle', timestamp: '3d ago', content: 'Welcome to the community! 🎉 Drop an intro below — tell us who you are, what you do, and what you\'re building. We\'re all here to grow together.', likes: 0, replies: 0, isPinned: true }
      : undefined;

    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={{ height: topBarH, paddingTop: insets.top, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, backgroundColor: C.bg }}>
          <Pressable onPress={() => { setSpaceId(null); setExpandedPost(null); setMenuOpenId(null); }} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
            <IconSymbol name="chevron.left" size={20} color={C.label} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ backgroundColor: C.label, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>{activeSpace.name}</Text>
            </View>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 80 }} showsVerticalScrollIndicator={false}>
          {/* Post composer */}
          <View style={{ margin: 16, padding: 12, backgroundColor: C.surface, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
            <TextInput
              placeholder="Share something..."
              placeholderTextColor={C.secondary}
              style={{ fontSize: 15, color: C.label, minHeight: 44 }}
              multiline
            />
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
              {(['photo.fill', 'video.fill', 'paperclip', 'chart.bar.fill'] as const).map(icon => (
                <Pressable key={icon} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                  <IconSymbol name={icon as any} size={20} color={C.secondary} />
                </Pressable>
              ))}
              <View style={{ flex: 1 }} />
              <Pressable
                style={{ backgroundColor: C.label, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 6 }}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.bg }}>Post</Text>
              </Pressable>
            </View>
          </View>

          {pinnedPost && <PostCard post={pinnedPost} isFirst={false} />}
          {posts.map((post, idx) => (
            <PostCard key={post.id} post={post} isFirst={idx === 0} />
          ))}
        </ScrollView>
      </View>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar — absolute, animated */}
      <Animated.View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        height: topBarH, paddingTop: insets.top,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
        backgroundColor: C.bg, opacity,
      }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ backgroundColor: C.label, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Spaces</Text>
            </View>
          </View>
          <View style={{ width: 36 }} />
        </View>
      </Animated.View>
      <ScrollView contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: insets.bottom + 80 }} showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={scrollEventThrottle}>
        {isOwner ? (
          <>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginHorizontal: 16, marginBottom: 8, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              All Spaces
            </Text>
            {SPACES.map(space => <SpaceCard key={space.id} space={space} />)}
          </>
        ) : (
          <>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginHorizontal: 16, marginBottom: 8, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Your Spaces
            </Text>
            {accessibleSpaces.map(space => <SpaceCard key={space.id} space={space} />)}

            {lockedSpaces.length > 0 && (
              <>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginHorizontal: 16, marginBottom: 8, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  Upgrade to Unlock
                </Text>
                {lockedSpaces.map(space => <SpaceCard key={space.id} space={space} locked />)}
              </>
            )}
          </>
        )}
      </ScrollView>

      {isOwner && (
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          style={({ pressed }) => ({
            position: 'absolute',
            bottom: insets.bottom + 64,
            right: 20,
            backgroundColor: C.label,
            borderRadius: 24,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 18,
            paddingVertical: 12,
            opacity: pressed ? 0.8 : 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.18,
            shadowRadius: 6,
            elevation: 4,
          })}
        >
          <IconSymbol name="plus" size={16} color={C.bg} />
          <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>New Space</Text>
        </Pressable>
      )}

      <BottomSheet visible={upgradeSheet} onClose={() => setUpgradeSheet(false)} useModal>
        <View style={{ padding: 24, gap: 16, paddingBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.label }}>
            Upgrade to {upgradeTarget?.tierLabel}
          </Text>
          <Text style={{ fontSize: 14, color: C.secondary, lineHeight: 20 }}>
            Unlock {upgradeTarget?.name} and all {upgradeTarget?.tierLabel} Spaces to get access to exclusive discussions, resources, and direct access.
          </Text>
          <Pressable
            style={{ backgroundColor: C.label, borderRadius: 14, padding: 16, alignItems: 'center' }}
            onPress={() => { setUpgradeSheet(false); router.push('/(tabs)/(main)/hub' as any); }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>View Plans</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </View>
  );
}
