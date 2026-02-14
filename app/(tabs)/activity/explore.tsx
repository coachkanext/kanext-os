/**
 * Explore Screen — Search bar, scope chips, trending content blocks.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TrendingBlock } from '@/components/messages/trending-block';
import { Spacing, BorderRadius } from '@/constants/theme';
import {
  MOCK_FEED,
  EXPLORE_SCOPES,
  getTrendingPosts,
  getDeadlinePosts,
} from '@/data/mock-messages';
import type { ExploreScope } from '@/data/mock-messages';

export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<ExploreScope>('all');

  const trending = useMemo(() => getTrendingPosts(MOCK_FEED, 5), []);
  const deadlines = useMemo(() => getDeadlinePosts(MOCK_FEED), []);
  const scoutWatch = useMemo(
    () => MOCK_FEED.filter((p) => p.type === 'recruiting').slice(0, 3),
    [],
  );
  const playerDev = useMemo(
    () => MOCK_FEED.filter((p) => p.type === 'player_dev').slice(0, 3),
    [],
  );
  const culture = useMemo(
    () => MOCK_FEED.filter((p) => p.type === 'culture').slice(0, 3),
    [],
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" size={16} color="#555" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Comms..."
            placeholderTextColor="#555"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Scope Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
      >
        {EXPLORE_SCOPES.map((s) => {
          const isActive = scope === s.key;
          return (
            <Pressable
              key={s.key}
              style={[
                styles.chip,
                { backgroundColor: isActive ? '#f5f5f5' : '#111' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setScope(s.key);
              }}
            >
              <ThemedText
                style={[styles.chipText, { color: isActive ? '#000' : '#6e6e6e' }]}
              >
                {s.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Trending Blocks */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.blocksContent}
      >
        <TrendingBlock
          icon="chart.bar.fill"
          title="Trending Now"
          posts={trending}
        />
        <TrendingBlock
          icon="exclamationmark.triangle.fill"
          title="Upcoming Deadlines"
          posts={deadlines}
        />
        <TrendingBlock
          icon="person.badge.plus"
          title="Scout Watch"
          posts={scoutWatch}
        />
        <TrendingBlock
          icon="chart.bar.fill"
          title="Player Development"
          posts={playerDev}
        />
        <TrendingBlock
          icon="heart.fill"
          title="Culture"
          posts={culture}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  searchRow: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#f5f5f5',
  },
  chipScroll: {
    flexGrow: 0,
    marginBottom: Spacing.md,
  },
  chipRow: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  blocksContent: {
    paddingBottom: 100,
    paddingTop: Spacing.xs,
  },
});
