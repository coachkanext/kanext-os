/**
 * BusinessFilmRoom — Workspaces: meetings, training, presentations.
 * Pill nav: Meetings | Training | Presentations | All
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  MEETING_RECORDINGS,
  TRAINING_VIDEOS,
  formatFilmDuration,
  formatFilmDate,
  getStatusColor,
  getStatusLabel,
  type MeetingRecording,
  type TrainingVideo,
} from '@/data/mock-film-room';

type Tab = 'meetings' | 'training' | 'presentations' | 'all';

const TABS: { key: Tab; label: string }[] = [
  { key: 'meetings', label: 'Meetings' },
  { key: 'training', label: 'Training' },
  { key: 'presentations', label: 'Presentations' },
  { key: 'all', label: 'All' },
];

type BusinessItem =
  | (MeetingRecording & { _type: 'meeting' })
  | (TrainingVideo & { _type: 'training' });

// ─── Meeting Card ───

function MeetingCard({ item }: { item: MeetingRecording }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: pressed ? colors.cardElevated : colors.card },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[styles.colorStrip, { backgroundColor: item.thumbnailColor }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <ThemedText style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '1A' }]}>
            <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </ThemedText>
          </View>
        </View>
        <View style={styles.metaRow}>
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatFilmDate(item.date)}
          </ThemedText>
          <View style={styles.metaDot} />
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatFilmDuration(item.duration)}
          </ThemedText>
          <View style={styles.metaDot} />
          <View style={styles.metaIconRow}>
            <IconSymbol name="person.2.fill" size={11} color={colors.textSecondary} />
            <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
              {item.attendeesCount}
            </ThemedText>
          </View>
        </View>
        <View style={styles.actionRow}>
          <View style={[styles.actionBadge, { backgroundColor: colors.backgroundTertiary }]}>
            <IconSymbol name="checklist" size={10} color={colors.textSecondary} />
            <ThemedText style={[styles.actionBadgeText, { color: colors.textSecondary }]}>
              {item.actionItemsCount} action items
            </ThemedText>
          </View>
        </View>
        <View style={styles.tagRow}>
          {item.tags.map((tag) => (
            <View key={tag} style={[styles.tagChip, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[styles.tagText, { color: colors.textSecondary }]}>{tag}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

// ─── Training Card ───

function TrainingCard({ item }: { item: TrainingVideo }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const progressColor =
    item.completionPct >= 100 ? '#5A8A6E' : item.completionPct > 0 ? '#B8943E' : '#52525B';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: pressed ? colors.cardElevated : colors.card },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[styles.colorStrip, { backgroundColor: item.thumbnailColor }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <ThemedText style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '1A' }]}>
            <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.moduleName}
        </ThemedText>
        <View style={styles.metaRow}>
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
          </ThemedText>
          <View style={styles.metaDot} />
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatFilmDuration(item.duration)}
          </ThemedText>
        </View>
        {/* Progress bar */}
        <View style={styles.progressRow}>
          <View style={[styles.progressTrack, { backgroundColor: colors.backgroundTertiary }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: progressColor,
                  width: `${item.completionPct}%`,
                },
              ]}
            />
          </View>
          <ThemedText style={[styles.progressText, { color: progressColor }]}>
            {item.completionPct}%
          </ThemedText>
        </View>
        <View style={styles.tagRow}>
          {item.tags.map((tag) => (
            <View key={tag} style={[styles.tagChip, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[styles.tagText, { color: colors.textSecondary }]}>{tag}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

// ─── All Items Card ───

function AllItemCard({ item }: { item: BusinessItem }) {
  switch (item._type) {
    case 'meeting':
      return <MeetingCard item={item} />;
    case 'training':
      return <TrainingCard item={item} />;
  }
}

// ─── Main Component ───

export function BusinessFilmRoom() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState<Tab>('meetings');

  const handleTabPress = (tab: Tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const allItems: BusinessItem[] = [
    ...MEETING_RECORDINGS.map((m) => ({ ...m, _type: 'meeting' as const })),
    ...TRAINING_VIDEOS.map((t) => ({ ...t, _type: 'training' as const })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  // "Presentations" tab = training videos that are watched (completed presentations)
  const presentationItems = TRAINING_VIDEOS.filter(
    (item) => item.completionPct >= 100 || item.category === 'leadership' || item.category === 'sales'
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'meetings':
        return (
          <FlatList
            data={MEETING_RECORDINGS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MeetingCard item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'training':
        return (
          <FlatList
            data={TRAINING_VIDEOS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TrainingCard item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'presentations':
        return (
          <FlatList
            data={presentationItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TrainingCard item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'all':
        return (
          <FlatList
            data={allItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <AllItemCard item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
    }
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
          const active = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[
                styles.pill,
                {
                  backgroundColor: active ? '#fff' : colors.backgroundTertiary,
                },
              ]}
              onPress={() => handleTabPress(tab.key)}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  { color: active ? '#000' : colors.textSecondary },
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content */}
      <View style={styles.contentArea}>{renderContent()}</View>
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
    paddingVertical: Spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
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
  contentArea: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },

  // Card
  card: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  colorStrip: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: Spacing.sm + 4,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  subtitle: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
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
  actionRow: {
    flexDirection: 'row',
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  actionBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Progress bar
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'right',
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
});
