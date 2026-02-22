/**
 * SportsLibrary — 3-tab layout: Saved | Downloads | History
 * Simplified from the old 4-section RBAC-gated collapsible layout.
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  SPORTS_LIBRARY_RECORDS,
  getAccessLevelColor,
  getAccessLevelLabel,
  getRecordTypeLabel,
  type LibraryRecord,
} from '@/data/mock-sports-library';
import {
  WATCH_HISTORY_BY_MODE,
  formatDuration,
  type WatchHistoryItem,
} from '@/data/mock-video';

type SportsLibraryTab = 'saved' | 'downloads' | 'history';

const TABS: { key: SportsLibraryTab; label: string }[] = [
  { key: 'saved', label: 'Saved' },
  { key: 'downloads', label: 'Downloads' },
  { key: 'history', label: 'History' },
];

export function SportsLibrary() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState<SportsLibraryTab>('saved');

  const savedRecords = useMemo(() => SPORTS_LIBRARY_RECORDS, []);
  const downloadedRecords = useMemo(() => SPORTS_LIBRARY_RECORDS.filter((r) => r.downloaded), []);
  const history = WATCH_HISTORY_BY_MODE.sports ?? [];

  const handleTabPress = (tab: SportsLibraryTab) => {
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
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => handleTabPress(tab.key)}
              style={[
                styles.pill,
                { backgroundColor: isActive ? '#fff' : colors.backgroundTertiary },
              ]}
            >
              <ThemedText
                style={[styles.pillText, { color: isActive ? '#000' : colors.textSecondary }]}
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
          data={savedRecords}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RecordRow record={item} colors={colors} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState colors={colors} label="No saved items" icon="bookmark" />}
        />
      )}
      {activeTab === 'downloads' && (
        <FlatList
          data={downloadedRecords}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RecordRow record={item} colors={colors} showDownloadSize />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState colors={colors} label="No downloads" icon="arrow.down.circle" />}
        />
      )}
      {activeTab === 'history' && (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HistoryRow item={item} colors={colors} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState colors={colors} label="No watch history" icon="clock" />}
        />
      )}
    </View>
  );
}

// =============================================================================
// RECORD ROW
// =============================================================================

function RecordRow({ record, colors, showDownloadSize }: { record: LibraryRecord; colors: typeof Colors.dark; showDownloadSize?: boolean }) {
  const accessColor = getAccessLevelColor(record.accessLevel);
  return (
    <Pressable
      style={({ pressed }) => [
        styles.recordCard,
        { backgroundColor: pressed ? colors.cardElevated : colors.card },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[styles.recordStrip, { backgroundColor: record.thumbnailColor }]} />
      <View style={styles.recordContent}>
        <View style={styles.recordHeader}>
          <ThemedText style={[styles.recordTitle, { color: colors.text }]} numberOfLines={1}>
            {record.title}
          </ThemedText>
          <View style={[styles.accessBadge, { backgroundColor: accessColor + '1A' }]}>
            <ThemedText style={[styles.accessText, { color: accessColor }]}>
              {getAccessLevelLabel(record.accessLevel)}
            </ThemedText>
          </View>
        </View>
        <View style={styles.recordMeta}>
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
            {getRecordTypeLabel(record.type)}
          </ThemedText>
          <View style={styles.metaDot} />
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>{record.duration}</ThemedText>
          <View style={styles.metaDot} />
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>{record.date}</ThemedText>
        </View>
        {showDownloadSize && record.downloadSize && (
          <View style={styles.downloadInfo}>
            <IconSymbol name="checkmark.circle.fill" size={12} color="#22C55E" />
            <ThemedText style={[styles.downloadSize, { color: colors.textTertiary }]}>
              {record.downloadSize}
            </ThemedText>
          </View>
        )}
        <View style={styles.tagRow}>
          {record.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={[styles.tagChip, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[styles.tagText, { color: colors.textSecondary }]}>{tag}</ThemedText>
            </View>
          ))}
        </View>
      </View>
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
        styles.recordCard,
        { backgroundColor: pressed ? colors.cardElevated : colors.card },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[styles.recordStrip, { backgroundColor: item.thumbnailColor }]} />
      <View style={styles.recordContent}>
        <View style={styles.recordHeader}>
          <ThemedText style={[styles.recordTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <View style={[styles.accessBadge, { backgroundColor: typeColor + '1A' }]}>
            <ThemedText style={[styles.accessText, { color: typeColor }]}>
              {item.contentType.toUpperCase()}
            </ThemedText>
          </View>
        </View>
        <View style={styles.recordMeta}>
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>{formatDuration(item.duration)}</ThemedText>
          <View style={styles.metaDot} />
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>{item.watchedAt}</ThemedText>
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
    <View style={styles.emptyState}>
      <IconSymbol name={icon as any} size={28} color={colors.textTertiary} />
      <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>{label}</ThemedText>
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
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  recordCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  recordStrip: {
    width: 4,
  },
  recordContent: {
    flex: 1,
    padding: Spacing.sm + 4,
    gap: 6,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  accessBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  accessText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#52525B',
  },
  downloadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  downloadSize: {
    fontSize: 11,
    fontWeight: '600',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  tagChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
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
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
  },
});
