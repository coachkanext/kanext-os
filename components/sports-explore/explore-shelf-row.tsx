/**
 * ExploreShelfRow — Wraps ContentRail with sort toggle pills for a single shelf.
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ContentRail } from '@/components/sports-explore/content-rail';
import { ExploreShelfItemCard } from '@/components/sports-explore/explore-shelf-item-card';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SHELF_SORT_OPTIONS, type ExploreShelf, type ExploreShelfItem, type ShelfSort } from '@/data/mock-sports-explore-v2';

interface ExploreShelfRowProps {
  shelf: ExploreShelf;
}

function sortItems(items: ExploreShelfItem[], sort: ShelfSort): ExploreShelfItem[] {
  switch (sort) {
    case 'latest':
      return items;
    case 'most_watched':
      return [...items].sort((a, b) => b.viewCount - a.viewCount);
    case 'staff_picks':
      return [...items].filter((i) => i.badge).concat(items.filter((i) => !i.badge));
    case 'kr_linked':
      return items;
    default:
      return items;
  }
}

export function ExploreShelfRow({ shelf }: ExploreShelfRowProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeSort, setActiveSort] = useState<ShelfSort>('latest');

  const sorted = useMemo(() => sortItems(shelf.items, activeSort), [shelf.items, activeSort]);

  return (
    <View style={styles.container}>
      {/* Sort pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortRow}
      >
        {SHELF_SORT_OPTIONS.map((opt) => (
          <Pressable
            key={opt.key}
            style={[
              styles.sortPill,
              { backgroundColor: activeSort === opt.key ? '#fff' : colors.backgroundTertiary },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveSort(opt.key);
            }}
          >
            <ThemedText
              style={[
                styles.sortText,
                { color: activeSort === opt.key ? '#000' : colors.textTertiary },
              ]}
            >
              {opt.label}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* Rail */}
      <ContentRail
        title={shelf.title}
        data={sorted}
        keyExtractor={(item) => item.id}
        itemWidth={180}
        renderItem={(item: ExploreShelfItem) => <ExploreShelfItemCard item={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  sortRow: {
    paddingHorizontal: Spacing.md,
    gap: 6,
    marginBottom: 4,
  },
  sortPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  sortText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
