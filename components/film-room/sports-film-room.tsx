/**
 * SportsFilmRoom — Game films, practice sessions, breakdown clips, and tags.
 * Pill nav: Games | Practice | Clips | Tags
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  GAME_FILMS,
  PRACTICE_SESSIONS,
  BREAKDOWN_CLIPS,
  FILM_TAGS,
  formatFilmDuration,
  formatFilmDate,
  getStatusColor,
  getStatusLabel,
  type GameFilm,
  type PracticeSession,
  type BreakdownClip,
  type FilmTag,
} from '@/data/mock-film-room';

type Tab = 'games' | 'practice' | 'clips' | 'tags';

const TABS: { key: Tab; label: string }[] = [
  { key: 'games', label: 'Games' },
  { key: 'practice', label: 'Practice' },
  { key: 'clips', label: 'Clips' },
  { key: 'tags', label: 'Tags' },
];

// ─── Game Film Card ───

function GameFilmCard({ item }: { item: GameFilm }) {
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
          {item.result && (
            <>
              <View style={styles.metaDot} />
              <ThemedText
                style={[
                  styles.resultText,
                  { color: item.result === 'W' ? '#22C55E' : '#EF4444' },
                ]}
              >
                {item.result} {item.score}
              </ThemedText>
            </>
          )}
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

// ─── Practice Session Card ───

function PracticeCard({ item }: { item: PracticeSession }) {
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
            {item.focusArea}
          </ThemedText>
          <View style={styles.metaDot} />
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatFilmDuration(item.duration)}
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

// ─── Breakdown Clip Card ───

function BreakdownCard({ item }: { item: BreakdownClip }) {
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
            {item.gameRef}
          </ThemedText>
          <View style={styles.metaDot} />
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatFilmDuration(item.duration)}
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

// ─── Tags View ───

function TagsView() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const categories: Array<{ key: FilmTag['category']; label: string }> = [
    { key: 'offense', label: 'OFFENSE' },
    { key: 'defense', label: 'DEFENSE' },
    { key: 'transition', label: 'TRANSITION' },
    { key: 'special', label: 'SPECIAL' },
  ];

  return (
    <ScrollView style={styles.tagsContainer} contentContainerStyle={styles.tagsContent}>
      {categories.map((cat) => {
        const tags = FILM_TAGS.filter((t) => t.category === cat.key);
        return (
          <View key={cat.key} style={styles.tagCategoryBlock}>
            <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              {cat.label}
            </ThemedText>
            <View style={styles.tagCloud}>
              {tags.map((tag) => (
                <Pressable
                  key={tag.id}
                  style={[styles.tagCloudChip, { backgroundColor: colors.card }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <ThemedText style={[styles.tagCloudLabel, { color: colors.text }]}>
                    {tag.label}
                  </ThemedText>
                  <View style={[styles.tagCountBadge, { backgroundColor: colors.backgroundTertiary }]}>
                    <ThemedText style={[styles.tagCountText, { color: colors.textSecondary }]}>
                      {tag.count}
                    </ThemedText>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

// ─── Main Component ───

export function SportsFilmRoom() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState<Tab>('games');

  const handleTabPress = (tab: Tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'games':
        return (
          <FlatList
            data={GAME_FILMS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <GameFilmCard item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'practice':
        return (
          <FlatList
            data={PRACTICE_SESSIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PracticeCard item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'clips':
        return (
          <FlatList
            data={BREAKDOWN_CLIPS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <BreakdownCard item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'tags':
        return <TagsView />;
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
  metaText: {
    fontSize: 12,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#424242',
  },
  resultText: {
    fontSize: 12,
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

  // Tags view
  tagsContainer: {
    flex: 1,
  },
  tagsContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  tagCategoryBlock: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tagCloudChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  tagCloudLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  tagCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
  },
  tagCountText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
