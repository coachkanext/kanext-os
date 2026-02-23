/**
 * SportsExplorePageV2 — RBAC-gated shelf-based discovery page.
 * Search bar, type/access filter chips, 8 horizontal shelves filtered by role.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ExploreShelfRow } from '@/components/sports-explore/explore-shelf-row';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getVideoSectionVisibility, type SportsRoleLens } from '@/utils/sports-rbac';
import {
  SPORTS_EXPLORE_SHELVES,
  SPORTS_TRENDING,
  EXPLORE_TYPE_OPTIONS,
  EXPLORE_ACCESS_OPTIONS,
  type ExploreFilterType,
  type ExploreFilterAccess,
  type TrendingItem,
} from '@/data/mock-sports-explore-v2';

// Default to R3 for now — will wire to context later
const DEFAULT_ROLE: SportsRoleLens = 'R3';

export function SportsExplorePageV2() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<ExploreFilterType>('All');
  const [activeAccess, setActiveAccess] = useState<ExploreFilterAccess>('All');

  const role = DEFAULT_ROLE;

  const visibleShelves = useMemo(() => {
    return SPORTS_EXPLORE_SHELVES.filter((shelf) => {
      const vis = getVideoSectionVisibility(shelf.rbacSection, role);
      if (vis === 'hidden') return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const titleMatch = shelf.title.toLowerCase().includes(q);
        const itemMatch = shelf.items.some(
          (i) => i.title.toLowerCase().includes(q) || i.subtitle.toLowerCase().includes(q),
        );
        return titleMatch || itemMatch;
      }
      return true;
    });
  }, [role, search]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search shelves, clips, players..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Trending Section */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.trendingScroll}
        style={styles.trendingContainer}
      >
        {SPORTS_TRENDING.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.trendingCard, { backgroundColor: item.thumbnailColor }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={styles.trendingBadge}>
              <ThemedText style={styles.trendingBadgeText}>
                {item.badge === 'featured' ? 'FEATURED' : 'TRENDING'}
              </ThemedText>
            </View>
            <IconSymbol name="play.fill" size={24} color="rgba(255,255,255,0.8)" />
            <View style={styles.trendingBottom}>
              <ThemedText style={styles.trendingTitle} numberOfLines={1}>{item.title}</ThemedText>
              <ThemedText style={styles.trendingSubtitle} numberOfLines={1}>{item.subtitle}</ThemedText>
              <View style={styles.trendingMeta}>
                <ThemedText style={styles.trendingMetaText}>{item.duration}</ThemedText>
                <View style={styles.trendingMetaDot} />
                <ThemedText style={styles.trendingMetaText}>{item.viewCount.toLocaleString()} views</ThemedText>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Filter Chips */}
      <View style={styles.chipRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {EXPLORE_TYPE_OPTIONS.map((type) => (
            <Pressable
              key={type}
              style={[
                styles.chip,
                { backgroundColor: activeType === type ? '#fff' : colors.backgroundTertiary, borderColor: colors.border },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveType(type);
              }}
            >
              <ThemedText style={[styles.chipText, { color: activeType === type ? '#000' : colors.textSecondary }]}>
                {type}
              </ThemedText>
            </Pressable>
          ))}
          <View style={[styles.chipDivider, { backgroundColor: colors.border }]} />
          {EXPLORE_ACCESS_OPTIONS.map((access) => (
            <Pressable
              key={access}
              style={[
                styles.chip,
                { backgroundColor: activeAccess === access ? '#fff' : colors.backgroundTertiary, borderColor: colors.border },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveAccess(access);
              }}
            >
              <ThemedText style={[styles.chipText, { color: activeAccess === access ? '#000' : colors.textSecondary }]}>
                {access}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Shelves */}
      {visibleShelves.map((shelf) => (
        <ExploreShelfRow key={shelf.id} shelf={shelf} />
      ))}

      {visibleShelves.length === 0 && (
        <View style={styles.emptyState}>
          <IconSymbol name="magnifyingglass" size={28} color={colors.textTertiary} />
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No matching content
          </ThemedText>
        </View>
      )}

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: Spacing.sm, paddingBottom: 40 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: Spacing.sm,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  chipRow: {
    marginBottom: Spacing.md,
  },
  chipScroll: {
    paddingHorizontal: Spacing.md,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipDivider: {
    width: 1,
    height: 20,
    marginHorizontal: 4,
  },
  trendingContainer: {
    flexGrow: 0,
    marginBottom: Spacing.md,
  },
  trendingScroll: {
    paddingHorizontal: Spacing.md,
    gap: 12,
  },
  trendingCard: {
    width: 280,
    height: 200,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  trendingBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.8,
  },
  trendingBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  trendingSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  trendingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  trendingMetaText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  trendingMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
  },
});
