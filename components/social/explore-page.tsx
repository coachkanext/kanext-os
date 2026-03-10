/**
 * Explore Page — Instagram Explore-style content discovery grid.
 * Trending row + category pills + mixed-size tiles + suggested accounts.
 * Page 3 in the Social SwipeablePages container.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';
import type { Mode } from '@/types';
import type { TrendingTopic, ExploreTile, SuggestedAccount } from '@/data/mock-social';
import { EXPLORE_CATEGORIES } from '@/data/mock-social';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const TILE_GAP = 2;
const TILE_SIZE = (SCREEN_WIDTH - TILE_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

const C = {
  bg: '#000000',
  surface: '#0B0F14',
  label: '#FFFFFF',
  secondary: '#A1A1AA',
  muted: '#52525B',
  separator: 'rgba(255,255,255,0.08)',
  blue: '#3B82F6',
};

type CategoryKey = typeof EXPLORE_CATEGORIES[number]['key'];

// ─── Trending Row ─────────────────────────────────────────────────────────

function TrendingRow({ topics }: { topics: TrendingTopic[] }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.trendingRow}
    >
      {topics.map((t) => (
        <Pressable key={t.id} style={styles.trendingPill}>
          <Text style={styles.trendingHash}>{t.hashtag}</Text>
          <Text style={styles.trendingCount}>
            {t.postCount >= 1000 ? `${(t.postCount / 1000).toFixed(1)}K` : t.postCount} posts
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ─── Category Pills ───────────────────────────────────────────────────────

function CategoryPills({
  active,
  onSelect,
}: {
  active: CategoryKey;
  onSelect: (key: CategoryKey) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryRow}
    >
      {EXPLORE_CATEGORIES.map((cat) => {
        const isActive = active === cat.key;
        return (
          <Pressable
            key={cat.key}
            style={[styles.categoryPill, isActive && styles.categoryPillActive]}
            onPress={() => onSelect(cat.key)}
          >
            <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
              {cat.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Suggested Account Card ──────────────────────────────────────────────

function SuggestedAccountCard({ account }: { account: SuggestedAccount }) {
  const [following, setFollowing] = useState(false);

  return (
    <View style={styles.suggestedCard}>
      <View style={styles.suggestedAvatar}>
        <Text style={styles.suggestedInitials}>{account.initials}</Text>
      </View>
      <View style={styles.suggestedInfo}>
        <Text style={styles.suggestedName} numberOfLines={1}>{account.name}</Text>
        <Text style={styles.suggestedUsername} numberOfLines={1}>{account.username}</Text>
        <Text style={styles.suggestedMeta}>
          {account.followerCount >= 1000
            ? `${(account.followerCount / 1000).toFixed(1)}K`
            : account.followerCount}{' '}
          followers
          {account.mutualCount > 0 ? ` \u00B7 ${account.mutualCount} mutual` : ''}
        </Text>
      </View>
      <Pressable
        style={[styles.followBtn, following && styles.followBtnActive]}
        onPress={() => setFollowing((f) => !f)}
      >
        <Text style={[styles.followBtnText, following && styles.followBtnTextActive]}>
          {following ? 'Following' : 'Follow'}
        </Text>
      </Pressable>
    </View>
  );
}

// ─── Grid Tile ────────────────────────────────────────────────────────────

function GridTile({ tile }: { tile: ExploreTile }) {
  return (
    <View style={styles.tile}>
      <Image source={{ uri: tile.uri }} style={styles.tileImage} />
      {(tile.type === 'video' || tile.type === 'reel') && (
        <View style={styles.playOverlay}>
          <IconSymbol
            name={tile.type === 'reel' ? 'play.circle.fill' : 'play.fill'}
            size={20}
            color="rgba(255,255,255,0.9)"
          />
        </View>
      )}
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

interface ExplorePageProps {
  mode: Mode;
  trendingTopics: TrendingTopic[];
  tiles: ExploreTile[];
  suggestedAccounts: SuggestedAccount[];
}

type GridItem =
  | { type: 'tile'; data: ExploreTile }
  | { type: 'suggested'; data: SuggestedAccount };

export function ExplorePage({ mode, trendingTopics, tiles, suggestedAccounts }: ExplorePageProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('for_you');

  // Scroll-driven footer hide/show
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  // Build mixed list: tiles + suggested accounts interspersed every ~9 tiles
  const gridItems: GridItem[] = [];
  let sugIdx = 0;
  tiles.forEach((tile, i) => {
    gridItems.push({ type: 'tile', data: tile });
    if ((i + 1) % 9 === 0 && sugIdx < suggestedAccounts.length) {
      gridItems.push({ type: 'suggested', data: suggestedAccounts[sugIdx] });
      sugIdx++;
    }
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={gridItems}
        keyExtractor={(item) => (item.type === 'tile' ? item.data.id : `sug-${item.data.id}`)}
        numColumns={NUM_COLUMNS}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
        ListHeaderComponent={
          <View>
            <TrendingRow topics={trendingTopics} />
            <CategoryPills active={activeCategory} onSelect={setActiveCategory} />
          </View>
        }
        renderItem={({ item }) => {
          if (item.type === 'suggested') {
            return <SuggestedAccountCard account={item.data} />;
          }
          return <GridTile tile={item.data} />;
        }}
        getItemLayout={undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  gridContent: {
    paddingBottom: 100,
  },

  // Trending row
  trendingRow: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 8,
  },
  trendingPill: {
    backgroundColor: C.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.separator,
  },
  trendingHash: {
    fontSize: 13,
    fontWeight: '700',
    color: C.label,
  },
  trendingCount: {
    fontSize: 11,
    color: C.muted,
    marginTop: 1,
  },

  // Category pills
  categoryRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.separator,
  },
  categoryPillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
  },
  categoryTextActive: {
    color: '#000000',
  },

  // Grid tile
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    marginRight: TILE_GAP,
    marginBottom: TILE_GAP,
  },
  tileImage: {
    width: '100%',
    height: '100%',
    backgroundColor: C.surface,
  },
  playOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
  },

  // Suggested account card
  suggestedCard: {
    width: SCREEN_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: C.surface,
    marginBottom: TILE_GAP,
    gap: 12,
  },
  suggestedAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedInitials: {
    fontSize: 15,
    fontWeight: '700',
    color: C.label,
  },
  suggestedInfo: {
    flex: 1,
  },
  suggestedName: {
    fontSize: 14,
    fontWeight: '700',
    color: C.label,
  },
  suggestedUsername: {
    fontSize: 12,
    color: C.secondary,
  },
  suggestedMeta: {
    fontSize: 11,
    color: C.muted,
    marginTop: 2,
  },
  followBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: C.blue,
  },
  followBtnActive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: C.separator,
  },
  followBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  followBtnTextActive: {
    color: C.secondary,
  },
});
