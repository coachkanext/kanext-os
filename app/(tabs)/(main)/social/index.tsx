/**
 * Personal Social — Feed + Channels (High Fidelity)
 *
 * Two top-level tabs: Feed | Channels
 * Role-aware: Owner (full management) vs Subscriber (consumer view)
 * Feed: post composer (Owner), filter pills, multi-voice post cards
 * Channels: grouped by access (Open / Subscribers / Inner Circle)
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet,
  Animated, Alert, Image,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ── Semantic data colors ──────────────────────────────────────────────────────

const GAIN    = '#5A8A6E';
const CAUTION = '#B8943E';
const EMBER   = '#8B2500';

// ── Author avatar palette (brand-appropriate neutrals) ────────────────────────

const AUTHOR_META: Record<string, { bg: string }> = {
  'Sammy Kalejaiye': { bg: '#1A1714' },  // carbon — it's their platform
  'Nike':            { bg: '#111111' },  // brand black
  'Alex Rivera':     { bg: '#2E5B3E' },  // muted forest
  'KaNeXT':          { bg: '#1E3A28' },  // deep brand green
  'Marcus Johnson':  { bg: '#4A3525' },  // warm brown
  'Gary Vaynerchuk': { bg: '#7A3B10' },  // amber-dark
  'Emma Chen':       { bg: '#5A3A4A' },  // muted plum
  'Jordan Wells':    { bg: '#1A3A5A' },  // deep navy
  'Reebok':          { bg: '#8B1A1A' },  // brand red-dark
  'Lena Park':       { bg: '#3A4A2E' },  // olive-dark
  'The Verge':       { bg: '#2A1A3A' },  // deep purple
  'Chris Doe':       { bg: '#2A3A4A' },  // slate
};

const getAuthorMeta = (name: string) => AUTHOR_META[name] ?? { bg: '#333333' };

// ── Per-post media themes (brand-appropriate color "photos") ──────────────────


// ── Types ─────────────────────────────────────────────────────────────────────

type AuthorKind = 'owner' | 'creator' | 'brand' | 'company';

type Post = {
  id: string;
  author: string;
  handle: string;
  kind: AuthorKind;
  content: string;
  timestamp: string;
  visibility: 'Public' | 'Subscribers Only';
  pinned?: boolean;
  scheduled?: boolean;
  scheduledTime?: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  imageUri?: string;
  mediaTag?: 'PHOTO' | 'VIDEO';
  repost?: boolean;
};

// ── Static data ───────────────────────────────────────────────────────────────

const POSTS: Post[] = [
  {
    id: '1',
    author: 'Sammy Kalejaiye', handle: '@sammyk', kind: 'owner',
    content: 'Just hit a major milestone — sharing the exact framework I used to grow from 0 to 10K in 90 days. Full breakdown dropping in the resources channel.',
    timestamp: '2h ago',
    visibility: 'Public',
    pinned: true,
    likes: 247, comments: 38, shares: 91, views: 3820,
  },
  {
    id: '2',
    author: 'Nike', handle: '@nike', kind: 'brand',
    content: "Summer campaign applications are open. We're looking for creators who move culture — not just followers. DM us your media kit.",
    timestamp: '4h ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=450&fit=crop&q=80',
    mediaTag: 'PHOTO',
    likes: 8420, comments: 312, shares: 1840, views: 94300,
  },
  {
    id: '3',
    author: 'Sammy Kalejaiye', handle: '@sammyk', kind: 'owner',
    content: "The one thing nobody tells you about brand deals: the rate card matters less than the relationship. I turned down a $15K deal last week because of a bad-fit brand. Here's why that was the right call...",
    timestamp: '1d ago',
    visibility: 'Subscribers Only',
    likes: 89, comments: 24, shares: 12, views: 1240,
  },
  {
    id: '4',
    author: 'Alex Rivera', handle: '@alexcreates', kind: 'creator',
    content: 'Just crossed 50K subscribers. Here\'s what I actually learned:\n\n1. Your first 1K is the hardest\n2. Consistency > quality early on\n3. The algorithm rewards completion rate\n4. Comments are your best research tool\n5. Burnout is real — build rest into your schedule',
    timestamp: '1d ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=450&fit=crop&q=80',
    mediaTag: 'VIDEO',
    likes: 2140, comments: 418, shares: 673, views: 31200,
  },
  {
    id: '5',
    author: 'KaNeXT', handle: '@kanext', kind: 'company',
    content: 'v2.0 is live. The operating system for creators, teams, and institutions. One platform. Every mode.',
    timestamp: '2d ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop&q=80',
    mediaTag: 'PHOTO',
    likes: 1870, comments: 203, shares: 891, views: 28400,
  },
  {
    id: '6',
    author: 'Marcus Johnson', handle: '@marcusj', kind: 'creator',
    content: 'My content strategy for Q2. Thread below.\n\nFocus: 3 long-form YouTube videos per month. Everything else (Shorts, IG, TikTok) is repurposed from those 3 pieces. Stop creating for every platform independently.',
    timestamp: '3d ago',
    visibility: 'Public',
    likes: 934, comments: 187, shares: 342, views: 14600,
  },
  {
    id: '7',
    author: 'Sammy Kalejaiye', handle: '@sammyk', kind: 'owner',
    content: 'Content audit template I use every quarter. Drop a 🔥 in comments if you want a full breakdown of how to run your own audit.',
    timestamp: '5d ago',
    visibility: 'Subscribers Only',
    likes: 143, comments: 57, shares: 28, views: 1890,
  },
  {
    id: '8',
    author: 'Gary Vaynerchuk', handle: '@garyvee', kind: 'creator',
    content: "The creator economy is not a bubble. It's a restructuring of attention. The brands that figure out how to work WITH creators instead of THROUGH agencies are going to win the next decade.",
    timestamp: '6d ago',
    visibility: 'Public',
    repost: true,
    likes: 18400, comments: 2310, shares: 5670, views: 284000,
  },

  // ── Subscribers Only batch ─────────────────────────────────────────────────

  {
    id: '9',
    author: 'Sammy Kalejaiye', handle: '@sammyk', kind: 'owner',
    content: "March P&L breakdown — just for subscribers.\n\nRevenue: $18,400\n• Subscriptions: $9,200\n• Brand deals: $7,500\n• Digital products: $1,700\n\nExpenses: $4,100\n• Tools & software: $890\n• Studio time: $1,200\n• Editor: $2,010\n\nNet: $14,300. Here's what I'm reinvesting and what I'm keeping liquid...",
    timestamp: '7h ago',
    visibility: 'Subscribers Only',
    likes: 312, comments: 84, shares: 0, views: 2140,
  },
  {
    id: '11',
    author: 'Sammy Kalejaiye', handle: '@sammyk', kind: 'owner',
    content: "The email I sent that landed a $30K brand deal. Full script below.\n\nSubject line: \"[First name] — 3 reasons [Brand] should be in front of my audience\"\n\nBody:\nHi [Name],\n\nI'll keep this short...\n\n(Members only — full script in the resources channel)",
    timestamp: '1d ago',
    visibility: 'Subscribers Only',
    likes: 203, comments: 61, shares: 0, views: 1870,
  },
  {
    id: '13',
    author: 'Sammy Kalejaiye', handle: '@sammyk', kind: 'owner',
    content: "I negotiate every brand deal with one rule: never accept the first offer.\n\nHere's my 3-step counter-offer framework:\n\n1. Always ask for 15% more than they offer\n2. Add a usage rights clause (2x your day rate per year)\n3. Request kill fee language upfront\n\nThis alone added $40K to my brand deal income last year.",
    timestamp: '2d ago',
    visibility: 'Subscribers Only',
    likes: 418, comments: 93, shares: 0, views: 3290,
  },
  {
    id: '15',
    author: 'Sammy Kalejaiye', handle: '@sammyk', kind: 'owner',
    content: "Recorded a 90-minute deep-dive on the exact content system I use — from ideation to upload to monetization. Dropping it in the resources channel this Friday.\n\nSubscribers get early access + the full workflow template as a bonus.",
    timestamp: '3d ago',
    visibility: 'Subscribers Only',
    likes: 176, comments: 44, shares: 0, views: 2010,
  },
  {
    id: '18',
    author: 'Sammy Kalejaiye', handle: '@sammyk', kind: 'owner',
    content: "Q&A responses — part 1.\n\n@jess_m: How do you handle creative burnout?\nMy honest answer: I don't try to push through it. I have a 'slow week' protocol — light content, heavy thinking. Always leads to better output.\n\n@coachtyler: When should I charge for my content?\nEarlier than you think. The pricing conversation is the most valuable one you'll ever have with yourself.",
    timestamp: '4d ago',
    visibility: 'Subscribers Only',
    likes: 287, comments: 112, shares: 0, views: 2740,
  },
  {
    id: '19',
    author: 'Sammy Kalejaiye', handle: '@sammyk', kind: 'owner',
    content: "Behind the scenes: what it actually cost to build this community from zero.\n\nYear 1 losses: $12K\nYear 2 break-even: month 9\nYear 3 first $10K month: June\n\nThe thing nobody tells you — the first 18 months feel like you're building in the dark. Then the flywheel kicks in and everything compounds. Stick with it.",
    timestamp: '6d ago',
    visibility: 'Subscribers Only',
    likes: 534, comments: 148, shares: 0, views: 4820,
  },
  {
    id: '21',
    author: 'KaNeXT', handle: '@kanext', kind: 'company',
    content: "Product roadmap — Q2 2026 (subscribers only preview).\n\n• KaNeXT Spaces — live rooms for brand-gated audio sessions\n• Subscriber tiers 2.0 — custom perks per tier\n• KPay direct payouts — same-day creator transfers\n• Analytics v3 — cohort retention, churn signals, LTV\n\nPublic announcement drops May 1.",
    timestamp: '1w ago',
    visibility: 'Subscribers Only',
    likes: 891, comments: 217, shares: 0, views: 7840,
  },

  // ── More Public posts ──────────────────────────────────────────────────────

  {
    id: '10',
    author: 'Alex Rivera', handle: '@alexcreates', kind: 'creator',
    content: "How I research a YouTube video before I write a single word:\n\n1. Search the topic + sort by Views\n2. Note the 3 highest-performing thumbnails\n3. Read the top 20 comments on each\n4. Find the question nobody answered\n5. That's your angle\n\nThe best videos answer questions people didn't know they had.",
    timestamp: '7h ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=450&fit=crop&q=80',
    mediaTag: 'VIDEO',
    likes: 3240, comments: 521, shares: 1140, views: 42800,
  },
  {
    id: '12',
    author: 'Reebok', handle: '@reebok', kind: 'brand',
    content: "We're partnering with 10 independent creators for the Classic Leather relaunch. No agency middlemen. Direct contracts. Full creative control.\n\nApplications open to this community first. Link in bio.",
    timestamp: '10h ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&h=450&fit=crop&q=80',
    mediaTag: 'PHOTO',
    likes: 4120, comments: 608, shares: 2310, views: 61400,
  },
  {
    id: '14',
    author: 'Marcus Johnson', handle: '@marcusj', kind: 'creator',
    content: "YouTube changed the algorithm again. Here's what actually changed (and what didn't):\n\nChanged: Click-through rate matters less than watch time in the first 30 seconds\nChanged: Shorts now feed long-form if you cross-post intelligently\nDidn't change: Consistency still beats everything\n\nFull breakdown in the video ↓",
    timestamp: '14h ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&h=450&fit=crop&q=80',
    mediaTag: 'VIDEO',
    likes: 1870, comments: 342, shares: 891, views: 28100,
  },
  {
    id: '16',
    author: 'Emma Chen', handle: '@emmacreates', kind: 'creator',
    content: "Took 6 months off social media to focus on product.\n\nRevenue went UP 34%.\n\nThe lesson: audience attention isn't the same as customer attention. Build for buyers, not viewers.",
    timestamp: '18h ago',
    visibility: 'Public',
    likes: 6820, comments: 934, shares: 2840, views: 89200,
  },
  {
    id: '17',
    author: 'Jordan Wells', handle: '@jordanwells', kind: 'creator',
    content: "12-week transformation challenge starts Monday. Open to everyone in this community.\n\n• Daily check-in thread in #general\n• Weekly live session every Sunday 7pm ET\n• Accountability partners matched in week 1\n\nComment 'IN' to be added to the list.",
    timestamp: '22h ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=450&fit=crop&q=80',
    mediaTag: 'VIDEO',
    likes: 2910, comments: 1240, shares: 673, views: 34800,
  },
  {
    id: '20',
    author: 'Emma Chen', handle: '@emmacreates', kind: 'creator',
    content: "The creator I study most isn't in tech or business. It's Virgil Abloh.\n\nHe treated everything as a draft — '3% rule': change any existing thing by just 3% and it becomes yours.\n\nEvery piece of content I make, I ask: what's my 3%?",
    timestamp: '2d ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop&q=80',
    mediaTag: 'PHOTO',
    likes: 4380, comments: 612, shares: 1820, views: 57300,
  },
  {
    id: '22',
    author: 'Lena Park', handle: '@lenapark', kind: 'creator',
    content: "I turned my newsletter into a $140K/year business. Here's the full breakdown:\n\n• 14,200 subscribers (free: 12,800 / paid: 1,400)\n• $9.99/month paid tier\n• 3 sponsored issues/month @ $3,500 each\n• 1 annual cohort course @ $2,400\n\nRevenue = subscriptions ($16.8K) + sponsors ($126K) + course (~$14.4K) = $157K gross",
    timestamp: '2d ago',
    visibility: 'Public',
    imageUri: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800&h=450&fit=crop&q=80',
    mediaTag: 'PHOTO',
    likes: 9140, comments: 1830, shares: 4210, views: 128000,
  },
  {
    id: '23',
    author: 'Gary Vaynerchuk', handle: '@garyvee', kind: 'creator',
    content: "Stop waiting for permission to be a creator. Nobody is going to tap you on the shoulder and say 'now it's your time.' You have to decide that it's your time and then go.",
    timestamp: '3d ago',
    visibility: 'Public',
    likes: 24800, comments: 3140, shares: 8920, views: 412000,
  },
  {
    id: '24',
    author: 'The Verge', handle: '@theverge', kind: 'company',
    content: "The creator middle class is real and growing. New data: 47% of full-time creators now earn between $50K–$200K annually. Three years ago that number was 18%.\n\nThe platform wars are over. Creators won.",
    timestamp: '4d ago',
    visibility: 'Public',
    likes: 7340, comments: 892, shares: 3410, views: 94700,
  },
  {
    id: '25',
    author: 'Chris Doe', handle: '@chrisdoe', kind: 'creator',
    content: "Nobody talks about the loneliness of building in public.\n\nYou're celebrating milestones that most people in your life don't understand. Your wins feel small to others. Your struggles feel invisible.\n\nFind your people. This community is mine.",
    timestamp: '5d ago',
    visibility: 'Public',
    likes: 5610, comments: 2140, shares: 1830, views: 71200,
  },
];

// ── Main Component ────────────────────────────────────────────────────────────────

export default function SocialScreen() {
  const C       = useColors();
  const insets  = useSafeAreaInsets();
  const router  = useRouter();
  const s       = useMemo(() => makeStyles(C), [C]);

  const [role, cycleRole, roleCycles] = useDemoRole('personal:social');
  const isOwner = role === roleCycles[0];

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [activeFilter, setActiveFilter]         = useState<'All' | 'Public' | 'Subscribers Only'>('All');
  const [composerVisibility, setComposerVisibility] = useState<'Public' | 'Subscribers Only'>('Public');

  useFocusEffect(useCallback(() => {
    resetFooter();
  }, []));

  const filteredPosts = useMemo(() => {
    if (activeFilter === 'All') return POSTS;
    return POSTS.filter(p => p.visibility === activeFilter);
  }, [activeFilter]);

  const fmtCount = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1000)      return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  // ── Composer (X-style) ────────────────────────────────────────────────────────────

  const renderComposer = () => (
    <View style={[s.composerWrap, { borderBottomColor: C.separator }]}>
      <View style={s.composerRow}>
        <View style={[s.avatar, { backgroundColor: '#1A1714' }]}>
          <Text style={s.avatarText}>S</Text>
        </View>
        <Pressable
          style={s.composerInput}
          onPress={() => Alert.alert('Composer', 'Full composer coming soon')}
        >
          <Text style={[s.composerPlaceholder, { color: C.secondary }]}>
            What's on your mind?
          </Text>
          <View style={s.composerVisRow}>
            {(['Public', 'Subscribers Only'] as const).map(v => {
              const isActive = composerVisibility === v;
              const accent   = v === 'Public' ? GAIN : CAUTION;
              return (
                <Pressable
                  key={v}
                  style={[
                    s.composerVisPill,
                    { borderColor: accent, backgroundColor: isActive ? accent : 'transparent' },
                  ]}
                  onPress={() => { Haptics.selectionAsync(); setComposerVisibility(v); }}
                >
                  <Text style={[s.composerVisPillText, { color: isActive ? '#FFFFFF' : accent }]}>
                    {v === 'Subscribers Only' ? 'Subs Only' : v}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </View>

      <View style={[s.composerToolbar, { borderTopColor: C.separator }]}>
        <View style={s.composerIcons}>
          <IconSymbol name="photo"     size={20} color={GAIN} />
          <IconSymbol name="video"     size={20} color={C.secondary} />
          <IconSymbol name="link"      size={20} color={C.secondary} />
          <IconSymbol name="checklist" size={20} color={C.secondary} />
        </View>
        <Pressable
          style={[s.postBtn, { backgroundColor: C.label }]}
          onPress={() => Alert.alert('Composer', 'Full composer coming soon')}
        >
          <Text style={[s.postBtnText, { color: C.bg }]}>Post</Text>
        </Pressable>
      </View>
    </View>
  );

  // ── Post card (X-style) ───────────────────────────────────────────────────────────

  const renderPostCard = (post: Post) => {
    const isLocked   = !isOwner && post.visibility === 'Subscribers Only';
    const isPinned   = !!post.pinned;
    const meta       = getAuthorMeta(post.author);
    const isOwnerPost = post.kind === 'owner';

    return (
      <View
        key={post.id}
        style={[s.post, { borderBottomColor: C.separator }, post.scheduled && { opacity: 0.65 }]}
      >
        {/* Pinned / Repost meta banner */}
        {(isPinned || post.repost) && (
          <View style={s.metaBanner}>
            <View style={s.metaBannerSpacer} />
            <IconSymbol
              name={isPinned ? 'pin.fill' : 'arrow.2.squarepath'}
              size={13}
              color={isPinned ? EMBER : C.secondary}
            />
            <Text style={[s.metaBannerText, { color: isPinned ? EMBER : C.secondary }]}>
              {isPinned ? 'Pinned post' : 'Reposted'}
            </Text>
          </View>
        )}

        {/* Two-column layout */}
        <View style={s.postRow}>

          {/* Avatar column */}
          <View style={s.avatarCol}>
            <View style={[s.avatar, { backgroundColor: meta.bg }]}>
              <Text style={s.avatarText}>{post.author.charAt(0).toUpperCase()}</Text>
            </View>
          </View>

          {/* Content column */}
          <View style={s.contentCol}>

            {/* Author row */}
            <View style={s.authorRow}>
              <Text style={[s.authorName, { color: C.label }]} numberOfLines={1}>
                {post.author}
              </Text>
              {isOwnerPost && (
                <View style={[s.youBadge, { borderColor: C.separator }]}>
                  <Text style={[s.youBadgeText, { color: C.secondary }]}>you</Text>
                </View>
              )}
              <Text style={[s.authorSub, { color: C.secondary }]} numberOfLines={1}>
                {' '}· {post.handle} · {post.timestamp}
              </Text>
              <View style={{ flex: 1 }} />
              {post.visibility === 'Subscribers Only' && (
                <View style={{ marginRight: 8 }}>
                  <IconSymbol name="lock.fill" size={11} color={CAUTION} />
                </View>
              )}
              {isOwner && (
                <Pressable
                  hitSlop={10}
                  onPress={() => Alert.alert('Post Options', '', [
                    { text: 'Edit',   onPress: () => {} },
                    { text: 'Pin',    onPress: () => {} },
                    { text: 'Delete', style: 'destructive', onPress: () => {} },
                    { text: 'Cancel', style: 'cancel' },
                  ])}
                >
                  <IconSymbol name="ellipsis" size={16} color={C.secondary} />
                </Pressable>
              )}
            </View>

            {/* Body */}
            {isLocked ? (
              <View style={s.lockedBlock}>
                <Text style={[s.postBody, { color: C.label, opacity: 0.18 }]} numberOfLines={3}>
                  {post.content}
                </Text>
                <View style={[s.lockedCard, { borderColor: C.separator, backgroundColor: C.surface }]}>
                  <View style={[s.lockedIconCircle, { backgroundColor: C.bg }]}>
                    <IconSymbol name="lock.fill" size={20} color={CAUTION} />
                  </View>
                  <Text style={[s.lockedTitle, { color: C.label }]}>Subscribers Only</Text>
                  <Text style={[s.lockedSub, { color: C.secondary }]}>
                    Subscribe to unlock this post and all subscriber content
                  </Text>
                  <Pressable
                    style={[s.subscribeBtn, { backgroundColor: C.label }]}
                    onPress={() => Alert.alert('Subscribe')}
                  >
                    <Text style={[s.subscribeBtnText, { color: C.bg }]}>Subscribe · $9/mo</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Text style={[s.postBody, { color: C.label }]}>{post.content}</Text>
            )}

            {/* Media */}
            {post.imageUri && !isLocked && (
              <Pressable
                style={s.mediaBlock}
                onPress={() => Alert.alert(post.mediaTag === 'VIDEO' ? 'Play video' : 'View photo')}
              >
                <Image
                  source={{ uri: post.imageUri }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
                {post.mediaTag === 'VIDEO' && (
                  <View style={s.playBtn}>
                    <IconSymbol name="play.fill" size={22} color="#FFFFFF" />
                  </View>
                )}
              </Pressable>
            )}

            {/* Engagement */}
            {!isLocked && (
              <View style={s.engBar}>
                <Pressable style={s.engItem} onPress={() => Haptics.selectionAsync()}>
                  <IconSymbol name="bubble.left" size={17} color={C.secondary} />
                  <Text style={[s.engCount, { color: C.secondary }]}>{fmtCount(post.comments)}</Text>
                </Pressable>
                <Pressable style={s.engItem} onPress={() => Haptics.selectionAsync()}>
                  <IconSymbol name="arrow.2.squarepath" size={17} color={C.secondary} />
                  <Text style={[s.engCount, { color: C.secondary }]}>{fmtCount(post.shares)}</Text>
                </Pressable>
                <Pressable style={s.engItem} onPress={() => Haptics.selectionAsync()}>
                  <IconSymbol name="heart" size={17} color={C.secondary} />
                  <Text style={[s.engCount, { color: C.secondary }]}>{fmtCount(post.likes)}</Text>
                </Pressable>
                <Pressable style={s.engItem} onPress={() => Haptics.selectionAsync()}>
                  <IconSymbol name="eye" size={15} color={C.secondary} />
                  <Text style={[s.engCount, { color: C.secondary }]}>{fmtCount(post.views)}</Text>
                </Pressable>
                <View style={{ flex: 1 }} />
                <Pressable style={s.engItem} onPress={() => Haptics.selectionAsync()}>
                  <IconSymbol name="bookmark" size={17} color={C.secondary} />
                </Pressable>
              </View>
            )}

          </View>
        </View>
      </View>
    );
  };

  // ── Feed ─────────────────────────────────────────────────────────────────────────

  const renderFeed = () => (
    <View>
      {/* Filter tab bar — Owner only */}
      {isOwner && (
        <View style={[s.filterTabBar, { borderBottomColor: C.separator }]}>
          {(['All', 'Public', 'Subscribers Only'] as const).map(f => {
            const isActive = activeFilter === f;
            return (
              <Pressable
                key={f}
                style={s.filterTab}
                onPress={() => { Haptics.selectionAsync(); setActiveFilter(f); }}
              >
                <Text style={[s.filterTabText, { color: isActive ? C.label : C.secondary }]}>
                  {f === 'Subscribers Only' ? 'Subs Only' : f}
                </Text>
                {isActive && <View style={[s.filterTabUnderline, { backgroundColor: C.label }]} />}
              </Pressable>
            );
          })}
        </View>
      )}

      {isOwner && renderComposer()}

      {filteredPosts.map(renderPostCard)}
    </View>
  );

  // ── Render ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* Fixed top bar — fades on scroll */}
      <Animated.View
        style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}
      >
        <View style={s.topBar}>
          <Pressable
            hitSlop={8}
            style={s.kBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openSidePanel();
            }}
          >
            <KMenuButton />
          </Pressable>

          <View style={s.centerPill}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Feed</Text>
            </View>
          </View>

          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      {/* Scrollable feed */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.scrollContent,
          { paddingTop: insets.top + 52, paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {renderFeed()}
      </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },

  // ── Top bar ──────────────────────────────────────────────────────────────────
  topBarOuter: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBar: {
    height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
  },
  kBtn:          { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  centerPill:    { flex: 1, alignItems: 'center' },
  titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap:  { width: 80, alignItems: 'flex-end' },

  // ── Scroll ───────────────────────────────────────────────────────────────────
  scrollContent: {},

  // ── Filter tab bar (X-style) ──────────────────────────────────────────────────
  filterTabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterTab: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
  },
  filterTabText:      { fontSize: 15, fontWeight: '600' },
  filterTabUnderline: {
    position: 'absolute', bottom: 0, left: '20%', right: '20%',
    height: 3, borderRadius: 2,
  },

  // ── Composer (X-style) ─────────────────────────────────────────────────────
  composerWrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
  },
  composerRow: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 16, paddingBottom: 10,
  },
  composerInput:       { flex: 1 },
  composerPlaceholder: { fontSize: 18, marginBottom: 10 },
  composerVisRow:      { flexDirection: 'row', gap: 8 },
  composerVisPill: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1,
  },
  composerVisPillText: { fontSize: 11, fontWeight: '600' },
  composerToolbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  composerIcons: { flexDirection: 'row', gap: 18 },
  postBtn:       { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20 },
  postBtnText:   { fontSize: 14, fontWeight: '700' },

  // ── Avatar ─────────────────────────────────────────────────────────────────────
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },

  // ── Post ───────────────────────────────────────────────────────────────────────
  post: { borderBottomWidth: StyleSheet.hairlineWidth },

  metaBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 2,
  },
  metaBannerSpacer: { width: 56 },  // avatar (44) + gap (12)
  metaBannerText:   { fontSize: 13, fontWeight: '500' },

  postRow: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4,
  },
  avatarCol:  { width: 44, flexShrink: 0 },
  contentCol: { flex: 1, paddingBottom: 10 },

  // ── Author ────────────────────────────────────────────────────────────────────
  authorRow: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 4, flexWrap: 'nowrap',
  },
  authorName: { fontSize: 15, fontWeight: '700', flexShrink: 0, maxWidth: '45%' },
  youBadge: {
    paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, borderWidth: 1,
    marginLeft: 5, flexShrink: 0,
  },
  youBadgeText: { fontSize: 10, fontWeight: '500' },
  authorSub:    { fontSize: 14, flexShrink: 1 },

  // ── Body ──────────────────────────────────────────────────────────────────────
  postBody: { fontSize: 15, lineHeight: 22, marginBottom: 10 },

  // ── Locked ─────────────────────────────────────────────────────────────────────
  lockedBlock: { marginBottom: 10 },
  lockedCard: {
    marginTop: 14, borderRadius: 14, borderWidth: 1,
    padding: 20, alignItems: 'center', gap: 8,
  },
  lockedIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  lockedTitle:      { fontSize: 16, fontWeight: '700', marginTop: 2 },
  lockedSub:        { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  subscribeBtn:     { marginTop: 6, paddingHorizontal: 22, paddingVertical: 11, borderRadius: 12 },
  subscribeBtnText: { fontSize: 14, fontWeight: '700' },

  // ── Media ──────────────────────────────────────────────────────────────────────
  mediaBlock: {
    height: 220, borderRadius: 14, marginBottom: 10,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
  },
  playBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
    paddingLeft: 3,
  },

  // ── Engagement ───────────────────────────────────────────────────────────────
  engBar:   { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginLeft: -6 },
  engItem:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4, paddingHorizontal: 6, marginRight: 10 },
  engCount: { fontSize: 13 },
});
