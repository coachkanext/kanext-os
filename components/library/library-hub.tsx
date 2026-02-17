/**
 * Library Hub — Mode-aware library with 7-tab pill nav.
 * Tabs: All | Collections | Saved | Created | Shared | Pinned | Archive
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMode } from '@/context/app-context';
import { SportsLibrary } from '@/components/library/sports-library';
import {
  LIBRARY_ITEMS,
  LIBRARY_COLLECTIONS,
  LIBRARY_TABS,
  getTypeIcon,
  getTypeColor,
} from '@/data/mock-library-v2';
import type { LibraryTab, LibraryItem, LibraryCollection } from '@/data/mock-library-v2';

// =============================================================================
// LIBRARY HUB
// =============================================================================

export function LibraryHub() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const mode = useMode();

  // Sports mode uses the RBAC-gated library
  if (mode === 'sports') return <SportsLibrary />;

  const [activeTab, setActiveTab] = useState<LibraryTab>('all');

  const items = LIBRARY_ITEMS[mode];
  const collections = LIBRARY_COLLECTIONS[mode];

  const filteredItems = useMemo(() => {
    switch (activeTab) {
      case 'all':
        return items.filter((i) => !i.archived);
      case 'saved':
        return items.filter((i) => !i.archived);
      case 'created':
        return items.filter((i) => i.createdByMe && !i.archived);
      case 'shared':
        return items.filter((i) => i.shared && !i.archived);
      case 'pinned':
        return items.filter((i) => i.pinned && !i.archived);
      case 'archive':
        return items.filter((i) => i.archived);
      case 'collections':
        return [];
      default:
        return items;
    }
  }, [items, activeTab]);

  const handleTabPress = (tab: LibraryTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Pill Nav */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
        style={styles.pillScroll}
      >
        {LIBRARY_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => handleTabPress(tab.key)}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? '#fff' : colors.backgroundTertiary,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content */}
      {activeTab === 'collections' ? (
        <CollectionGrid collections={collections} colors={colors} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ItemRow item={item} colors={colors} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
                No items in this view
              </ThemedText>
            </View>
          }
        />
      )}
    </View>
  );
}

// =============================================================================
// ITEM ROW
// =============================================================================

interface ItemRowProps {
  item: LibraryItem;
  colors: typeof Colors.dark;
}

function ItemRow({ item, colors }: ItemRowProps) {
  const typeColor = getTypeColor(item.type);
  const typeIcon = getTypeIcon(item.type);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.itemRow,
        {
          backgroundColor: pressed ? colors.backgroundSecondary : 'transparent',
          borderBottomColor: colors.border,
        },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      {/* Type indicator */}
      <View style={[styles.typeIndicator, { backgroundColor: typeColor + '20' }]}>
        <IconSymbol name={typeIcon as any} size={18} color={typeColor} />
      </View>

      {/* Content */}
      <View style={styles.itemContent}>
        <ThemedText style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </ThemedText>
        <View style={styles.itemMeta}>
          <ThemedText style={[styles.itemSource, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.source}
          </ThemedText>
          <ThemedText style={[styles.itemDate, { color: colors.textTertiary }]}>
            {item.date}
          </ThemedText>
        </View>
      </View>

      {/* Status indicators */}
      <View style={styles.itemIndicators}>
        {item.pinned && (
          <IconSymbol name="pin.fill" size={12} color={colors.textTertiary} />
        )}
        {item.shared && (
          <IconSymbol name="paperplane.fill" size={12} color={colors.textTertiary} />
        )}
        <IconSymbol name="ellipsis" size={16} color={colors.textTertiary} />
      </View>
    </Pressable>
  );
}

// =============================================================================
// COLLECTION GRID
// =============================================================================

interface CollectionGridProps {
  collections: LibraryCollection[];
  colors: typeof Colors.dark;
}

function CollectionGrid({ collections, colors }: CollectionGridProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.gridContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.grid}>
        {collections.map((collection) => (
          <Pressable
            key={collection.id}
            style={({ pressed }) => [
              styles.collectionCard,
              {
                backgroundColor: pressed
                  ? colors.backgroundSecondary
                  : colors.backgroundTertiary,
                borderColor: colors.border,
              },
            ]}
            onPress={() =>
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            }
          >
            <View
              style={[
                styles.collectionCover,
                { backgroundColor: collection.coverColor + '20' },
              ]}
            >
              <View
                style={[
                  styles.collectionDot,
                  { backgroundColor: collection.coverColor },
                ]}
              />
            </View>
            <ThemedText
              style={[styles.collectionName, { color: colors.text }]}
              numberOfLines={1}
            >
              {collection.name}
            </ThemedText>
            <ThemedText
              style={[styles.collectionCount, { color: colors.textSecondary }]}
            >
              {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Pill nav
  pillScroll: {
    flexGrow: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  pill: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // List
  listContent: {
    paddingBottom: Spacing.xxl,
  },

  // Item row
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  typeIndicator: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 4,
  },
  itemContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  itemSource: {
    fontSize: 13,
    flex: 1,
  },
  itemDate: {
    fontSize: 12,
  },
  itemIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // Collection grid
  gridContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm + 4,
  },
  collectionCard: {
    width: '47.5%',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
  collectionCover: {
    width: '100%',
    height: 72,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  collectionName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  collectionCount: {
    fontSize: 12,
  },

  // Empty state
  emptyContainer: {
    paddingTop: Spacing.xxl * 2,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
