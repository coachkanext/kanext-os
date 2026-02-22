/**
 * Library Hub — Mode-aware library with 3-tab pill nav.
 * Tabs: Saved | Downloads | History
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
  LIBRARY_TABS,
  getTypeIcon,
  getTypeColor,
} from '@/data/mock-library-v2';
import type { LibraryTab, LibraryItem } from '@/data/mock-library-v2';
import {
  WATCH_HISTORY_BY_MODE,
  formatDuration,
  type WatchHistoryItem,
} from '@/data/mock-video';

// =============================================================================
// LIBRARY HUB
// =============================================================================

export function LibraryHub() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const mode = useMode();

  // Sports mode uses the RBAC-gated library
  if (mode === 'sports') return <SportsLibrary />;

  const [activeTab, setActiveTab] = useState<LibraryTab>('saved');

  const items = LIBRARY_ITEMS[mode];
  const history = WATCH_HISTORY_BY_MODE[mode] ?? [];

  const savedItems = useMemo(() => items.filter((i) => !i.archived), [items]);
  const downloadedItems = useMemo(() => items.filter((i) => i.downloaded), [items]);

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
      {activeTab === 'saved' && (
        <FlatList
          data={savedItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ItemRow item={item} colors={colors} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState colors={colors} label="No saved items" icon="bookmark" />
          }
        />
      )}
      {activeTab === 'downloads' && (
        <FlatList
          data={downloadedItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <DownloadRow item={item} colors={colors} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState colors={colors} label="No downloads" icon="arrow.down.circle" />
          }
        />
      )}
      {activeTab === 'history' && (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HistoryRow item={item} colors={colors} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState colors={colors} label="No watch history" icon="clock" />
          }
        />
      )}
    </View>
  );
}

// =============================================================================
// ITEM ROW (Saved)
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
      <View style={[styles.typeIndicator, { backgroundColor: typeColor + '20' }]}>
        <IconSymbol name={typeIcon as any} size={18} color={typeColor} />
      </View>
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
      <IconSymbol name="ellipsis" size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

// =============================================================================
// DOWNLOAD ROW
// =============================================================================

function DownloadRow({ item, colors }: ItemRowProps) {
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
      <View style={[styles.typeIndicator, { backgroundColor: typeColor + '20' }]}>
        <IconSymbol name={typeIcon as any} size={18} color={typeColor} />
      </View>
      <View style={styles.itemContent}>
        <ThemedText style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </ThemedText>
        <View style={styles.itemMeta}>
          <ThemedText style={[styles.itemSource, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.source}
          </ThemedText>
          <ThemedText style={[styles.itemDate, { color: colors.textTertiary }]}>
            {item.downloadSize ?? item.date}
          </ThemedText>
        </View>
      </View>
      <IconSymbol name="checkmark.circle.fill" size={16} color="#22C55E" />
    </Pressable>
  );
}

// =============================================================================
// HISTORY ROW
// =============================================================================

function HistoryRow({ item, colors }: { item: WatchHistoryItem; colors: typeof Colors.dark }) {
  const typeColor = item.contentType === 'game' ? '#1D9BF0' : item.contentType === 'reel' ? '#1D9BF0' : '#22C55E';
  return (
    <Pressable
      style={({ pressed }) => [
        styles.historyCard,
        { backgroundColor: pressed ? colors.cardElevated : colors.card },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[styles.historyStrip, { backgroundColor: item.thumbnailColor }]} />
      <View style={styles.historyContent}>
        <View style={styles.historyHeader}>
          <ThemedText style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <View style={[styles.historyBadge, { backgroundColor: typeColor + '1A' }]}>
            <ThemedText style={[styles.historyBadgeText, { color: typeColor }]}>
              {item.contentType.toUpperCase()}
            </ThemedText>
          </View>
        </View>
        <View style={styles.itemMeta}>
          <ThemedText style={[styles.itemSource, { color: colors.textSecondary }]}>
            {formatDuration(item.duration)}
          </ThemedText>
          <ThemedText style={[styles.itemDate, { color: colors.textTertiary }]}>
            {item.watchedAt}
          </ThemedText>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.backgroundTertiary }]}>
          <View style={[styles.progressFill, { width: `${item.progress}%`, backgroundColor: item.progress === 100 ? '#22C55E' : '#1D9BF0' }]} />
        </View>
      </View>
    </Pressable>
  );
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({ colors, label, icon }: { colors: typeof Colors.dark; label: string; icon: string }) {
  return (
    <View style={styles.emptyContainer}>
      <IconSymbol name={icon as any} size={28} color={colors.textTertiary} />
      <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
        {label}
      </ThemedText>
    </View>
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
    borderBottomColor: '#2F3336',
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

  // History card
  historyCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  historyStrip: {
    width: 4,
  },
  historyContent: {
    flex: 1,
    padding: Spacing.sm + 4,
    gap: 6,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  historyBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  progressTrack: {
    height: 3,
    borderRadius: 1.5,
    marginTop: 2,
  },
  progressFill: {
    height: 3,
    borderRadius: 1.5,
  },

  // Empty state
  emptyContainer: {
    paddingTop: Spacing.xxl * 2,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
  },
});
