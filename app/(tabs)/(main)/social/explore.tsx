/**
 * Social Explore — full-screen discovery page.
 * Back arrow + "Explore" pill in top bar.
 * Search bar → grouped results (People / Brands / Content / Hashtags).
 * Default: mixed-size grid + Suggested Creators + Trending hashtags.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { openSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { useMode } from '@/context/app-context';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const SUGGESTED_CREATORS = [
  { id: 'sc1', seed: 'sc-mk', name: 'Marcus King',     handle: '@marcusk',    followers: '24.1K', initials: 'MK' },
  { id: 'sc2', seed: 'sc-jt', name: 'Jordan Thompson', handle: '@jordant',    followers: '8.7K',  initials: 'JT' },
  { id: 'sc3', seed: 'sc-aa', name: 'Aisha Andrews',   handle: '@aishaa',     followers: '51.3K', initials: 'AA' },
  { id: 'sc4', seed: 'sc-dw', name: 'Devon Williams',  handle: '@devonw',     followers: '12.9K', initials: 'DW' },
  { id: 'sc5', seed: 'sc-rs', name: 'Riley Spencer',   handle: '@rileys',     followers: '3.4K',  initials: 'RS' },
  { id: 'sc6', seed: 'sc-no', name: 'Noah Okafor',     handle: '@noaho',      followers: '67.2K', initials: 'NO' },
];

const TRENDING_HASHTAGS = [
  { id: 'th1', tag: '#BuildInPublic',    count: '14.2K posts' },
  { id: 'th2', tag: '#CreatorEconomy',   count: '9.8K posts'  },
  { id: 'th3', tag: '#KaNeXT',           count: '4.1K posts'  },
  { id: 'th4', tag: '#SportsRecruiting', count: '22.5K posts' },
  { id: 'th5', tag: '#BlackTech',        count: '31.7K posts' },
  { id: 'th6', tag: '#EarnEverything',   count: '2.9K posts'  },
  { id: 'th7', tag: '#CollegeLife',      count: '88.4K posts' },
  { id: 'th8', tag: '#Hoops',            count: '55.1K posts' },
];

type GridTile = {
  id: string;
  seed: string;
  type: 'image' | 'video' | 'reel';
  views: string | null;
};

const GRID_TILES: GridTile[] = [
  { id: 'gt1',  seed: 'ex-01', type: 'image', views: null     },
  { id: 'gt2',  seed: 'ex-02', type: 'video', views: '12.4K'  },
  { id: 'gt3',  seed: 'ex-03', type: 'reel',  views: '8.7K'   },
  { id: 'gt4',  seed: 'ex-04', type: 'image', views: null     },
  { id: 'gt5',  seed: 'ex-05', type: 'image', views: null     },
  { id: 'gt6',  seed: 'ex-06', type: 'video', views: '45.1K'  },
  { id: 'gt7',  seed: 'ex-07', type: 'reel',  views: '3.2K'   },
  { id: 'gt8',  seed: 'ex-08', type: 'image', views: null     },
  { id: 'gt9',  seed: 'ex-09', type: 'video', views: '21.8K'  },
  { id: 'gt10', seed: 'ex-10', type: 'image', views: null     },
  { id: 'gt11', seed: 'ex-11', type: 'reel',  views: '6.5K'   },
  { id: 'gt12', seed: 'ex-12', type: 'image', views: null     },
  { id: 'gt13', seed: 'ex-13', type: 'video', views: '18.3K'  },
  { id: 'gt14', seed: 'ex-14', type: 'image', views: null     },
  { id: 'gt15', seed: 'ex-15', type: 'reel',  views: '11.2K'  },
  { id: 'gt16', seed: 'ex-16', type: 'image', views: null     },
  { id: 'gt17', seed: 'ex-17', type: 'video', views: '29.6K'  },
  { id: 'gt18', seed: 'ex-18', type: 'image', views: null     },
];

type SearchPerson = {
  id: string;
  seed: string;
  name: string;
  handle: string;
  type: string;
  followers: string;
};

type SearchBrand = {
  id: string;
  seed: string;
  name: string;
  handle: string;
  type: string;
  followers: string;
};

type SearchHashtag = {
  id: string;
  tag: string;
  count: string;
};

type SearchContentItem = {
  id: string;
  seed: string;
  type: 'image' | 'video' | 'reel';
  caption: string;
  views: string | null;
};

const SEARCH_PEOPLE: SearchPerson[] = [
  { id: 'sp1', seed: 'sr-p1', name: 'Marcus King',  handle: '@marcusk',  type: 'Creator', followers: '24.1K' },
  { id: 'sp2', seed: 'sr-p2', name: 'Aisha Andrews',handle: '@aishaa',   type: 'Creator', followers: '51.3K' },
  { id: 'sp3', seed: 'sr-p3', name: 'Coach Marcus', handle: '@coachmb',  type: 'Coach',   followers: '3.8K'  },
];

const SEARCH_BRANDS: SearchBrand[] = [
  { id: 'sb1', seed: 'sr-b1', name: 'KaNeXT',       handle: '@kanext',    type: 'Platform',  followers: '14.2K' },
  { id: 'sb2', seed: 'sr-b2', name: 'Rise Academy', handle: '@riseacad',  type: 'Education', followers: '2.1K'  },
  { id: 'sb3', seed: 'sr-b3', name: 'Elite Hoops',  handle: '@elitehoops',type: 'Sports',    followers: '8.9K'  },
];

const SEARCH_HASHTAGS_DATA: SearchHashtag[] = [
  { id: 'sh1', tag: '#BuildInPublic', count: '14.2K posts' },
  { id: 'sh2', tag: '#Basketball',    count: '102K posts'  },
  { id: 'sh3', tag: '#KaNeXT',        count: '4.1K posts'  },
];

const SEARCH_CONTENT: SearchContentItem[] = [
  { id: 'sc1', seed: 'sr-c1', type: 'video', caption: 'How I built my brand from zero',    views: '31.2K' },
  { id: 'sc2', seed: 'sr-c2', type: 'image', caption: 'Day 1 vs Day 365 — the journey',    views: null    },
  { id: 'sc3', seed: 'sr-c3', type: 'reel',  caption: 'Training breakdown thread',          views: '8.4K'  },
];

// ---------------------------------------------------------------------------
// Grid helpers
// ---------------------------------------------------------------------------

function renderTile(tile: GridTile, width: number, height: number, C: ComponentColors) {
  return (
    <Pressable
      key={tile.id}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      style={{ width, height, position: 'relative' }}
    >
      <Image
        source={{ uri: `https://picsum.photos/seed/${tile.seed}/${Math.round(width)}/${Math.round(height)}` }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
      {(tile.type === 'video' || tile.type === 'reel') && (
        <>
          <View style={{ position: 'absolute', top: 6, right: 6 }}>
            <IconSymbol
              name={tile.type === 'reel' ? 'play.rectangle.fill' : 'play.fill'}
              size={16}
              color="rgba(255,255,255,0.9)"
            />
          </View>
          {tile.views && (
            <View style={{ position: 'absolute', bottom: 4, right: 4, flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <IconSymbol name="eye.fill" size={9} color="#fff" />
              <Text style={{ fontSize: 10, fontWeight: '600', color: '#fff' }}>{tile.views}</Text>
            </View>
          )}
        </>
      )}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// GridSection
// ---------------------------------------------------------------------------

function GridSection({ tiles, CELL, C }: { tiles: GridTile[]; CELL: number; C: ComponentColors }) {
  const GAP = 1;

  // Group tiles into chunks of 6 for the repeating pattern
  const groups: GridTile[][] = [];
  for (let i = 0; i < tiles.length; i += 6) {
    groups.push(tiles.slice(i, i + 6));
  }

  return (
    <View>
      {groups.map((group, gIdx) => {
        // Pattern alternates per group:
        //   Even: [3-small row] + [large-left | 2-small-right]
        //   Odd:  [3-small row] + [2-small-left | large-right]
        const isEven = gIdx % 2 === 0;
        const small3 = group.slice(0, 3);
        const featured = group[3] as GridTile | undefined;
        const sm1 = group[4] as GridTile | undefined;
        const sm2 = group[5] as GridTile | undefined;

        if (!featured) {
          // Partial last group — render remaining tiles as a small row
          return (
            <View key={gIdx} style={{ flexDirection: 'row', gap: GAP }}>
              {small3.map(t => renderTile(t, CELL, CELL, C))}
            </View>
          );
        }

        const featuredSize = CELL * 2 + GAP;

        const twoSmallStack = (
          <View style={{ gap: GAP }}>
            {sm1 ? renderTile(sm1, CELL, CELL, C) : <View style={{ width: CELL, height: CELL }} />}
            {sm2 ? renderTile(sm2, CELL, CELL, C) : <View style={{ width: CELL, height: CELL }} />}
          </View>
        );
        const featureTile = renderTile(featured, featuredSize, featuredSize, C);

        return (
          <View key={gIdx}>
            {/* 3-small row */}
            <View style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP }}>
              {small3.map(t => renderTile(t, CELL, CELL, C))}
            </View>
            {/* Featured + 2-small row */}
            <View style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP }}>
              {isEven ? (
                <>{featureTile}{twoSmallStack}</>
              ) : (
                <>{twoSmallStack}{featureTile}</>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// SuggestedCreatorsRow
// ---------------------------------------------------------------------------

function SuggestedCreatorsRow({ C }: { C: ComponentColors }) {
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  const toggleFollow = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFollowed(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <View style={{ paddingTop: 16, paddingBottom: 8 }}>
      <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, paddingHorizontal: 16, marginBottom: 10 }}>
        Suggested Creators
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
      >
        {SUGGESTED_CREATORS.map(creator => {
          const isFollowed = followed.has(creator.id);
          return (
            <View
              key={creator.id}
              style={{
                width: 140,
                backgroundColor: C.surface,
                borderRadius: 12,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: C.separator,
                padding: 12,
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Image
                source={{ uri: `https://picsum.photos/seed/${creator.seed}/100/100` }}
                style={{ width: 52, height: 52, borderRadius: 26, marginBottom: 4 }}
                resizeMode="cover"
              />
              <Text
                style={{ fontSize: 13, fontWeight: '700', color: C.label, textAlign: 'center' }}
                numberOfLines={1}
              >
                {creator.name}
              </Text>
              <Text style={{ fontSize: 11, color: C.secondary }} numberOfLines={1}>
                {creator.handle}
              </Text>
              <Text style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>
                {creator.followers} followers
              </Text>
              <Pressable
                onPress={() => toggleFollow(creator.id)}
                style={{
                  width: '100%',
                  height: 30,
                  borderRadius: 8,
                  backgroundColor: isFollowed ? 'transparent' : C.label,
                  borderWidth: isFollowed ? 1 : 0,
                  borderColor: C.separator,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: isFollowed ? C.secondary : C.bg }}>
                  {isFollowed ? 'Following' : 'Follow'}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// TrendingSection
// ---------------------------------------------------------------------------

function TrendingSection({ C }: { C: ComponentColors }) {
  return (
    <View style={{ paddingTop: 8, paddingBottom: 16 }}>
      <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, paddingHorizontal: 16, marginBottom: 10 }}>
        Trending
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {TRENDING_HASHTAGS.map(item => (
          <Pressable
            key={item.id}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            style={{
              backgroundColor: C.surface,
              borderRadius: 20,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: C.separator,
              paddingHorizontal: 14,
              paddingVertical: 9,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{item.tag}</Text>
            <Text style={{ fontSize: 11, color: C.secondary, marginTop: 1 }}>{item.count}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// SearchResults
// ---------------------------------------------------------------------------

function PersonRow({ item, C }: { item: SearchPerson; C: ComponentColors }) {
  const [followed, setFollowed] = useState(false);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 12 }}>
      <Image
        source={{ uri: `https://picsum.photos/seed/${item.seed}/100/100` }}
        style={{ width: 44, height: 44, borderRadius: 22 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{item.name}</Text>
        <Text style={{ fontSize: 12, color: C.secondary }}>{item.handle} · {item.type}</Text>
        <Text style={{ fontSize: 11, color: C.muted }}>{item.followers} followers</Text>
      </View>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setFollowed(f => !f);
        }}
        style={{
          paddingHorizontal: 14,
          height: 30,
          borderRadius: 8,
          backgroundColor: followed ? 'transparent' : C.label,
          borderWidth: followed ? 1 : 0,
          borderColor: C.separator,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '600', color: followed ? C.secondary : C.bg }}>
          {followed ? 'Following' : 'Follow'}
        </Text>
      </Pressable>
    </View>
  );
}

function SectionHeader({ title, C }: { title: string; C: ComponentColors }) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 6,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: C.separator,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          color: C.secondary,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

function Divider({ C }: { C: ComponentColors }) {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator }} />;
}

function SearchResults({ query, C }: { query: string; C: ComponentColors }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* People */}
      <SectionHeader title="People" C={C} />
      {SEARCH_PEOPLE.map(item => (
        <PersonRow key={item.id} item={item} C={C} />
      ))}
      <Divider C={C} />

      {/* Brands */}
      <SectionHeader title="Brands" C={C} />
      {SEARCH_BRANDS.map(item => (
        <View
          key={item.id}
          style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 12 }}
        >
          <Image
            source={{ uri: `https://picsum.photos/seed/${item.seed}/100/100` }}
            style={{ width: 44, height: 44, borderRadius: 10 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{item.name}</Text>
            <Text style={{ fontSize: 12, color: C.secondary }}>{item.handle} · {item.type}</Text>
            <Text style={{ fontSize: 11, color: C.muted }}>{item.followers} followers</Text>
          </View>
        </View>
      ))}
      <Divider C={C} />

      {/* Hashtags */}
      <SectionHeader title="Hashtags" C={C} />
      {SEARCH_HASHTAGS_DATA.map(item => (
        <Pressable
          key={item.id}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: C.surface,
              borderWidth: 1,
              borderColor: C.separator,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '700', color: C.label }}>#</Text>
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{item.tag}</Text>
            <Text style={{ fontSize: 12, color: C.secondary }}>{item.count}</Text>
          </View>
        </Pressable>
      ))}
      <Divider C={C} />

      {/* Content */}
      <SectionHeader title="Content" C={C} />
      {SEARCH_CONTENT.map(item => (
        <Pressable
          key={item.id}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 12 }}
        >
          <View style={{ position: 'relative', width: 72, height: 72, borderRadius: 8, overflow: 'hidden' }}>
            <Image
              source={{ uri: `https://picsum.photos/seed/${item.seed}/200/200` }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            {(item.type === 'video' || item.type === 'reel') && (
              <View style={{ position: 'absolute', top: 4, right: 4 }}>
                <IconSymbol
                  name={item.type === 'reel' ? 'play.rectangle.fill' : 'play.fill'}
                  size={14}
                  color="rgba(255,255,255,0.9)"
                />
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, color: C.label, lineHeight: 19 }} numberOfLines={2}>
              {item.caption}
            </Text>
            {item.views && (
              <Text style={{ fontSize: 11, color: C.secondary, marginTop: 4 }}>
                {item.views} views
              </Text>
            )}
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function SocialExplorePage() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width: SCREEN_W } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const mode = useMode();
  const roleKeyMap: Record<string, string> = {
    personal:  'personal:social',
    community: 'community:social',
    sports:    'sports:social',
    business:  'business:social',
    education: 'education:social',
  };
  const [role, cycleRole, roleCycles] = useDemoRole(roleKeyMap[mode] ?? 'personal:social');
  const isOwner = role === roleCycles[0];

  // 3 columns with 1px gaps between them (2 gaps total)
  const CELL = Math.floor((SCREEN_W - 2) / 3);

  const isSearching = query.trim().length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Shared animated top bar */}
      <Animated.View
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          paddingTop: insets.top,
          backgroundColor: C.bg,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: C.separator,
          opacity,
        }}
      >
        <View style={{ height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openSidePanel();
            }}
            style={{ width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' }}
          >
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.separator, paddingHorizontal: 12, paddingVertical: 5 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', letterSpacing: 0.3, color: C.label }}>Explore</Text>
            </View>
          </View>
          <View style={{ width: 80, alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      {/* Content — search results or default discovery view */}
      {isSearching ? (
        <>
          {/* Spacer to clear the top bar */}
          <View style={{ height: insets.top + 52 }} />
          {/* Search bar */}
          <View style={{ paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, backgroundColor: C.bg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, paddingHorizontal: 12, height: 38, gap: 8 }}>
              <IconSymbol name="magnifyingglass" size={14} color={C.secondary} />
              <TextInput ref={inputRef} value={query} onChangeText={setQuery} placeholder="Search creators, brands, content, #tags" placeholderTextColor={C.muted} style={{ flex: 1, fontSize: 14, color: C.label }} returnKeyType="search" autoCapitalize="none" autoCorrect={false} />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')}>
                  <IconSymbol name="xmark.circle.fill" size={16} color={C.secondary} />
                </Pressable>
              )}
            </View>
          </View>
          <SearchResults query={query} C={C} />
        </>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: insets.top + 52 + 8, paddingBottom: 120 }}
          onScroll={onScroll}
          scrollEventThrottle={scrollEventThrottle}
        >
          {/* Search bar */}
          <View style={{ paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, paddingHorizontal: 12, height: 38, gap: 8 }}>
              <IconSymbol name="magnifyingglass" size={14} color={C.secondary} />
              <TextInput ref={inputRef} value={query} onChangeText={setQuery} placeholder="Search creators, brands, content, #tags" placeholderTextColor={C.muted} style={{ flex: 1, fontSize: 14, color: C.label }} returnKeyType="search" autoCapitalize="none" autoCorrect={false} />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')}>
                  <IconSymbol name="xmark.circle.fill" size={16} color={C.secondary} />
                </Pressable>
              )}
            </View>
          </View>

          <GridSection tiles={GRID_TILES} CELL={CELL} C={C} />
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator }} />
          <SuggestedCreatorsRow C={C} />
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator }} />
          <TrendingSection C={C} />
        </ScrollView>
      )}
    </View>
  );
}
