/**
 * Feed Screen — X-style feed with scope switch, sort/filter, FeedCard list, FAB compose.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { FeedCard } from '@/components/messages/feed-card';
import { FeedScopeRow } from '@/components/messages/feed-scope-row';
import { ComposeSheetV2 } from '@/components/messages/compose-sheet-v2';
import { Spacing, BorderRadius } from '@/constants/theme';
import {
  MOCK_FEED,
  FEED_FILTERS,
  FEED_SORTS,
  sortFeed,
} from '@/data/mock-messages';
import type {
  FeedPost,
  FeedFilter,
  FeedSort,
  FeedScope,
} from '@/data/mock-messages';

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const [scope, setScope] = useState<FeedScope>('my_team');
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [sort, setSort] = useState<FeedSort>('recent');
  const [composeVisible, setComposeVisible] = useState(false);

  const filtered = useMemo(() => {
    let base = MOCK_FEED;

    // Apply scope filter
    if (scope !== 'all') {
      const scopeToFilter: Partial<Record<FeedScope, FeedFilter[]>> = {
        my_team: ['team'],
        staff: ['staff'],
        players: ['players'],
        parents: ['parents'],
        recruiting: ['recruiting'],
        league: ['team', 'system'],
      };
      const allowed = scopeToFilter[scope];
      if (allowed) {
        base = base.filter((p) => allowed.includes(p.filter));
      }
    }

    // Apply content filter
    if (filter !== 'all') {
      base = base.filter((p) => p.filter === filter);
    }

    return sortFeed(base, sort);
  }, [scope, filter, sort]);

  const renderPost = useCallback(
    ({ item }: { item: FeedPost }) => <FeedCard post={item} />,
    [],
  );

  return (
    <View style={styles.container}>
      {/* Scope Row */}
      <FeedScopeRow activeScope={scope} onScopeChange={setScope} />

      {/* Sort Picker */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.sortScroll}
      >
        {FEED_SORTS.map((s) => {
          const isActive = sort === s.key;
          return (
            <Pressable
              key={s.key}
              style={[
                styles.sortChip,
                { backgroundColor: isActive ? '#2a2a2a' : 'transparent', borderColor: isActive ? '#2a2a2a' : '#1a1a1a' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSort(s.key);
              }}
            >
              <ThemedText
                style={[styles.sortChipText, { color: isActive ? '#f5f5f5' : '#555' }]}
              >
                {s.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.filterScroll}
      >
        {FEED_FILTERS.map((f) => {
          const isActive = filter === f.key;
          return (
            <Pressable
              key={f.key}
              style={[
                styles.filterChip,
                { backgroundColor: isActive ? '#f5f5f5' : '#111' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFilter(f.key);
              }}
            >
              <ThemedText
                style={[styles.filterChipText, { color: isActive ? '#000' : '#6e6e6e' }]}
              >
                {f.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Feed List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + 80, opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setComposeVisible(true);
        }}
      >
        <IconSymbol name="plus" size={24} color="#000" />
      </Pressable>

      {/* Compose Sheet */}
      <BottomSheet
        visible={composeVisible}
        onClose={() => setComposeVisible(false)}
        title="New Post"
        useModal
      >
        <ComposeSheetV2 onClose={() => setComposeVisible(false)} />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  sortScroll: {
    flexGrow: 0,
    marginBottom: 4,
  },
  filterScroll: {
    flexGrow: 0,
    marginBottom: Spacing.sm,
  },
  chipRow: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: Spacing.xs,
  },
  fab: {
    position: 'absolute',
    right: Spacing.md,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
