/**
 * Feed Screen — Broadcast timeline with scope chips, sort, FeedCard list, FAB compose.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
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
  FEED_SORTS,
  sortFeed,
} from '@/data/mock-messages';
import type {
  FeedPost,
  FeedSort,
  FeedScope,
} from '@/data/mock-messages';

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const [scope, setScope] = useState<FeedScope>('my_team');
  const [sort, setSort] = useState<FeedSort>('recent');
  const [composeVisible, setComposeVisible] = useState(false);

  // Cycle through sort options on button press
  const cycleSort = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const keys = FEED_SORTS.map((s) => s.key);
    const idx = keys.indexOf(sort);
    setSort(keys[(idx + 1) % keys.length]);
  }, [sort]);

  const sortLabel = FEED_SORTS.find((s) => s.key === sort)?.label ?? 'Recent';

  const filtered = useMemo(() => {
    let base = MOCK_FEED;

    if (scope !== 'all') {
      const scopeToFilter: Partial<Record<FeedScope, string[]>> = {
        my_team: ['team'],
        staff: ['staff'],
        players: ['players'],
        parents: ['parents'],
        recruiting: ['recruiting'],
        league: ['team', 'system'],
        game_ops: ['team'],
      };
      const allowed = scopeToFilter[scope];
      if (allowed) {
        base = base.filter((p) => allowed.includes(p.filter));
      }
    }

    return sortFeed(base, sort);
  }, [scope, sort]);

  const renderPost = useCallback(
    ({ item }: { item: FeedPost }) => <FeedCard post={item} />,
    [],
  );

  return (
    <View style={styles.container}>
      {/* Scope Row + Sort Button */}
      <View style={styles.controlRow}>
        <View style={styles.scopeWrap}>
          <FeedScopeRow activeScope={scope} onScopeChange={setScope} />
        </View>
        <Pressable
          style={({ pressed }) => [styles.sortBtn, { opacity: pressed ? 0.7 : 1 }]}
          onPress={cycleSort}
        >
          <IconSymbol name="arrow.up.arrow.down" size={14} color="#6e6e6e" />
          <ThemedText style={styles.sortBtnText}>{sortLabel}</ThemedText>
        </Pressable>
      </View>

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
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  scopeWrap: {
    flex: 1,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#111',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.md,
  },
  sortBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6e6e6e',
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
