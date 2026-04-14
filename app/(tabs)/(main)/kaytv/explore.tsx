/**
 * KayTV — Explore (Personal Mode)
 * Discover content from other Personal Mode creators.
 * Both Owner and Follower see identical view.
 * Sections: Search · Trending · Categories · Recommended For You · Popular Channels · New on KTV
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput, StyleSheet, Animated,
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

const TOP_BAR_H = 52;

type VideoCategory = 'All' | 'Sports' | 'Business' | 'Education' | 'Faith' | 'Lifestyle' | 'Music' | 'Tech' | 'Entertainment';

type VideoCard = {
  id: string;
  title: string;
  creator: string;
  creatorInitials: string;
  views: string;
  timeAgo: string;
  duration: string;
  hue: number;
  emoji: string;
  category: Exclude<VideoCategory, 'All'>;
};

type ChannelCard = {
  id: string;
  name: string;
  initials: string;
  hue: number;
  subscribers: string;
};

// ── Mock data ─────────────────────────────────────────────────────────────────

const TRENDING_VIDEOS: VideoCard[] = [
  { id: 't1', title: 'How to Scale a Creator Brand',       creator: 'Marcus James',  creatorInitials: 'MJ', views: '82.4K', timeAgo: '1d ago',  duration: '22:14', hue: 200, emoji: '🚀', category: 'Business'     },
  { id: 't2', title: 'Pre-Season Training Secrets',        creator: 'Coach Riley',   creatorInitials: 'CR', views: '54.1K', timeAgo: '2d ago',  duration: '18:55', hue: 120, emoji: '🏋️', category: 'Sports'       },
  { id: 't3', title: 'Building Routines That Last',        creator: 'Alicia Chen',   creatorInitials: 'AC', views: '41.2K', timeAgo: '3d ago',  duration: '14:30', hue: 45,  emoji: '⏰', category: 'Lifestyle'    },
  { id: 't4', title: 'AI Tools Every Creator Needs',       creator: 'Dev Mora',      creatorInitials: 'DM', views: '38.7K', timeAgo: '3d ago',  duration: '9:15',  hue: 280, emoji: '🤖', category: 'Tech'         },
  { id: 't5', title: 'Sunday Sermon: Find Your Purpose',   creator: 'Pastor Grant',  creatorInitials: 'PG', views: '29.3K', timeAgo: '4d ago',  duration: '31:00', hue: 60,  emoji: '✝️', category: 'Faith'        },
  { id: 't6', title: 'Lofi Study Beats Vol. 7',            creator: 'Kai Beats',     creatorInitials: 'KB', views: '19.8K', timeAgo: '5d ago',  duration: '58:00', hue: 350, emoji: '🎵', category: 'Music'        },
  { id: 't7', title: 'Stand-Up Special: Real Life',        creator: 'Jada Rivers',   creatorInitials: 'JR', views: '67.5K', timeAgo: '1w ago',  duration: '44:20', hue: 170, emoji: '🎭', category: 'Entertainment'},
  { id: 't8', title: 'Healthy Meal Prep in 30 Minutes',    creator: 'Mia Torres',    creatorInitials: 'MT', views: '33.6K', timeAgo: '1w ago',  duration: '11:45', hue: 100, emoji: '🥗', category: 'Lifestyle'    },
];

const RECOMMENDED_VIDEOS: VideoCard[] = [
  { id: 'r1', title: 'The Secret to Staying Consistent as a Creator', creator: 'Jordan Wells',  creatorInitials: 'JW', views: '12.4K', timeAgo: '6h ago',  duration: '17:22', hue: 220, emoji: '🎯', category: 'Business'     },
  { id: 'r2', title: 'Film Study: Breaking Down Elite Guards',         creator: 'Coach Riley',   creatorInitials: 'CR', views: '8.9K',  timeAgo: '1d ago',  duration: '23:44', hue: 120, emoji: '🏀', category: 'Sports'       },
  { id: 'r3', title: 'My Favorite Apps for Productivity',              creator: 'Dev Mora',      creatorInitials: 'DM', views: '21.1K', timeAgo: '2d ago',  duration: '12:08', hue: 280, emoji: '📱', category: 'Tech'         },
  { id: 'r4', title: 'Faith Over Fear: How I Overcame Doubt',         creator: 'Pastor Grant',  creatorInitials: 'PG', views: '16.7K', timeAgo: '3d ago',  duration: '28:30', hue: 60,  emoji: '🙏', category: 'Faith'        },
  { id: 'r5', title: 'Original Beat: "The Grind" (Full Track)',        creator: 'Kai Beats',     creatorInitials: 'KB', views: '9.2K',  timeAgo: '4d ago',  duration: '4:55',  hue: 350, emoji: '🎧', category: 'Music'        },
];

const NEW_VIDEOS: VideoCard[] = [
  { id: 'n1', title: 'Day in My Life: Film & Hustle',         creator: 'Jada Rivers',  creatorInitials: 'JR', views: '1.2K', timeAgo: '2h ago',  duration: '19:11', hue: 170, emoji: '🎬', category: 'Entertainment'},
  { id: 'n2', title: 'How I Landed My First Brand Deal',       creator: 'Marcus James', creatorInitials: 'MJ', views: '4.4K', timeAgo: '5h ago',  duration: '13:30', hue: 200, emoji: '🤝', category: 'Business'     },
  { id: 'n3', title: 'Upper Body Strength Circuit',            creator: 'Coach Riley',  creatorInitials: 'CR', views: '2.1K', timeAgo: '8h ago',  duration: '7:45',  hue: 120, emoji: '💪', category: 'Sports'       },
  { id: 'n4', title: 'Vlog: Cooking & Conversations',          creator: 'Mia Torres',   creatorInitials: 'MT', views: '0.8K', timeAgo: '10h ago', duration: '24:00', hue: 100, emoji: '🍳', category: 'Lifestyle'    },
  { id: 'n5', title: 'Building a $100K Freelance Business',    creator: 'Alicia Chen',  creatorInitials: 'AC', views: '3.1K', timeAgo: '12h ago', duration: '31:15', hue: 45,  emoji: '💰', category: 'Business'     },
  { id: 'n6', title: 'Lo-fi Chill Vibes: Late Night Mix',      creator: 'Kai Beats',    creatorInitials: 'KB', views: '0.5K', timeAgo: '1d ago',  duration: '1:02:00',hue: 350,emoji: '🌙', category: 'Music'        },
];

const CHANNELS: ChannelCard[] = [
  { id: 'ch1', name: 'Marcus James',  initials: 'MJ', hue: 200, subscribers: '14.2K' },
  { id: 'ch2', name: 'Coach Riley',   initials: 'CR', hue: 120, subscribers: '9.8K'  },
  { id: 'ch3', name: 'Alicia Chen',   initials: 'AC', hue: 45,  subscribers: '7.4K'  },
  { id: 'ch4', name: 'Dev Mora',      initials: 'DM', hue: 280, subscribers: '22.1K' },
  { id: 'ch5', name: 'Jada Rivers',   initials: 'JR', hue: 170, subscribers: '5.6K'  },
];

const CATEGORIES: VideoCategory[] = ['All', 'Sports', 'Business', 'Education', 'Faith', 'Lifestyle', 'Music', 'Tech', 'Entertainment'];

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ title, C }: { title: string; C: ComponentColors }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.6, paddingHorizontal: 16, marginBottom: 10 }}>
      {title}
    </Text>
  );
}

function HorizontalThumbCard({ video, C, onPress }: { video: VideoCard; C: ComponentColors; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ width: 160 }}>
      <View style={{ height: 100, borderRadius: 10, backgroundColor: `hsl(${video.hue},38%,20%)`, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <Text style={{ fontSize: 36 }}>{video.emoji}</Text>
        <View style={{ position: 'absolute', bottom: 5, right: 6, backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2 }}>
          <Text style={{ fontSize: 9, color: '#fff', fontWeight: '700' }}>{video.duration}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: `hsl(${video.hue},40%,30%)`, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 9, fontWeight: '700', color: '#fff' }}>{video.creatorInitials}</Text>
        </View>
        <Text style={{ fontSize: 11, color: C.secondary, flex: 1 }} numberOfLines={1}>{video.creator}</Text>
      </View>
      <Text style={{ fontSize: 12, fontWeight: '600', color: C.label, marginTop: 2 }} numberOfLines={2}>{video.title}</Text>
      <Text style={{ fontSize: 11, color: C.secondary, marginTop: 1 }}>{video.views} views</Text>
    </Pressable>
  );
}

function VerticalVideoCard({ video, C, onPress }: { video: VideoCard; C: ComponentColors; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <View style={{ height: 180, borderRadius: 12, backgroundColor: `hsl(${video.hue},38%,20%)`, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginHorizontal: 16 }}>
        <Text style={{ fontSize: 64 }}>{video.emoji}</Text>
        <View style={{ position: 'absolute', bottom: 8, right: 10, backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3 }}>
          <Text style={{ fontSize: 11, color: '#fff', fontWeight: '700' }}>{video.duration}</Text>
        </View>
      </View>
      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, lineHeight: 20 }} numberOfLines={2}>{video.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 6 }}>
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: `hsl(${video.hue},40%,30%)`, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 9, fontWeight: '700', color: '#fff' }}>{video.creatorInitials}</Text>
          </View>
          <Text style={{ fontSize: 12, color: C.secondary }}>{video.creator}</Text>
          <Text style={{ fontSize: 12, color: C.secondary }}>·</Text>
          <Text style={{ fontSize: 12, color: C.secondary }}>{video.views} views</Text>
          <Text style={{ fontSize: 12, color: C.secondary }}>·</Text>
          <Text style={{ fontSize: 12, color: C.secondary }}>{video.timeAgo}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function ExploreScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaytv');
  const isOwner = role === roleCycles[0];

  const [searchQuery,      setSearchQuery]      = useState('');
  const [activeCategory,   setActiveCategory]   = useState<VideoCategory>('All');
  const [subscribedChannels, setSubscribedChannels] = useState<Set<string>>(new Set());

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  function filterByCategory<T extends { category: Exclude<VideoCategory, 'All'> }>(arr: T[]) {
    if (activeCategory === 'All') return arr;
    return arr.filter(v => v.category === activeCategory);
  }

  function toggleSubscribe(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubscribedChannels(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const trending    = useMemo(() => filterByCategory(TRENDING_VIDEOS),    [activeCategory]);
  const recommended = useMemo(() => filterByCategory(RECOMMENDED_VIDEOS), [activeCategory]);
  const newVideos   = useMemo(() => filterByCategory(NEW_VIDEOS),         [activeCategory]);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* ── Top Bar ── */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, alignItems: 'center' }}>
            <KMenuButton />
          </Pressable>
          <View style={s.titleWrap}>
            <Text style={[s.title, { color: C.label }]}>Explore</Text>
          </View>
          <RolePill role={role} onPress={cycleRole} accentColor="#1A1714" isPrimary={isOwner} />
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: insets.bottom + 100 }}
      >
        {/* ── Search Bar ── */}
        <View style={[s.searchWrap, { backgroundColor: C.surface }]}>
          <IconSymbol name="magnifyingglass" size={15} color={C.secondary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search videos, creators, topics, hashtags…"
            placeholderTextColor={C.secondary}
            style={[s.searchInput, { color: C.label }]}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={15} color={C.secondary} />
            </Pressable>
          )}
        </View>

        {/* ── Category Pills ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 4 }}>
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat}
              onPress={() => { Haptics.selectionAsync(); setActiveCategory(cat); }}
              style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: activeCategory === cat ? C.activePill : C.surface }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: activeCategory === cat ? C.activePillText : C.secondary }}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={{ height: 20 }} />

        {/* ── Trending ── */}
        {trending.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <SectionLabel title="Trending" C={C} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {trending.map(v => (
                <HorizontalThumbCard
                  key={v.id} video={v} C={C}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.navigate({ pathname: '/(tabs)/(main)/kaytv/player' as any, params: { videoId: v.id } }); }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Recommended For You ── */}
        {recommended.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <SectionLabel title="Recommended For You" C={C} />
            {recommended.map(v => (
              <VerticalVideoCard
                key={v.id} video={v} C={C}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.navigate({ pathname: '/(tabs)/(main)/kaytv/player' as any, params: { videoId: v.id } }); }}
              />
            ))}
          </View>
        )}

        {/* ── Popular Channels ── */}
        <View style={{ marginBottom: 24 }}>
          <SectionLabel title="Popular Channels" C={C} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}>
            {CHANNELS.map(ch => {
              const subscribed = subscribedChannels.has(ch.id);
              return (
                <View key={ch.id} style={{ alignItems: 'center', width: 90, gap: 6 }}>
                  <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: `hsl(${ch.hue},40%,28%)`, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>{ch.initials}</Text>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: C.label, textAlign: 'center' }} numberOfLines={1}>{ch.name}</Text>
                  <Text style={{ fontSize: 10, color: C.secondary }}>{ch.subscribers} subs</Text>
                  <Pressable
                    onPress={() => toggleSubscribe(ch.id)}
                    style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, backgroundColor: subscribed ? C.surface : C.label, borderWidth: subscribed ? 1 : 0, borderColor: C.separator }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: subscribed ? C.secondary : C.bg }}>{subscribed ? 'Following' : 'Follow'}</Text>
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* ── New on KTV ── */}
        {newVideos.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            <SectionLabel title="New on KTV" C={C} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {newVideos.map(v => (
                <HorizontalThumbCard
                  key={v.id} video={v} C={C}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.navigate({ pathname: '/(tabs)/(main)/kaytv/player' as any, params: { videoId: v.id } }); }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {trending.length === 0 && recommended.length === 0 && newVideos.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 60, gap: 12, paddingHorizontal: 32 }}>
            <IconSymbol name="safari" size={40} color={C.secondary} />
            <Text style={{ fontSize: 17, fontWeight: '700', color: C.label }}>Nothing in this category yet</Text>
            <Text style={{ fontSize: 14, color: C.secondary, textAlign: 'center', lineHeight: 20 }}>Try a different category or check back soon.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root:        { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:      { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  titleWrap:   { flex: 1, alignItems: 'center' },
  title:       { fontSize: 15, fontWeight: '700' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 12,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15 },
});
