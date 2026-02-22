/**
 * SportsFilmRoomV2 — 3-tab pill nav: Game Film | Practice Film | Scouting
 * Game Film: recorded games, most recent first
 * Practice Film: practice recordings by date
 * Scouting: opponent film organized by team
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  VIDEO_GAMES_BY_MODE,
  SCOUT_PACKS_BY_MODE,
  formatDuration,
  getResultColor,
  type VideoGame,
  type ScoutPack,
} from '@/data/mock-video';
import { MOCK_PRACTICE_FILM, type PracticeFilmItem } from '@/data/mock-sports-workspaces';

type FilmTab = 'game_film' | 'practice_film' | 'scouting';

interface TabDef {
  key: FilmTab;
  label: string;
}

const TABS: TabDef[] = [
  { key: 'game_film', label: 'Game Film' },
  { key: 'practice_film', label: 'Practice Film' },
  { key: 'scouting', label: 'Scouting' },
];

// =============================================================================
// CARD COMPONENTS
// =============================================================================

function GameFilmRow({ game, colors }: { game: VideoGame; colors: typeof Colors.light }) {
  return (
    <Pressable
      style={({ pressed }) => [
        cardStyles.card,
        { backgroundColor: pressed ? colors.cardElevated : colors.card },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[cardStyles.colorStrip, { backgroundColor: game.thumbnailColor }]} />
      <View style={cardStyles.cardContent}>
        <View style={cardStyles.cardHeader}>
          <ThemedText style={[cardStyles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {game.opponent}
          </ThemedText>
          <View style={[cardStyles.resultBadge, { backgroundColor: getResultColor(game.result) + '1A' }]}>
            <ThemedText style={[cardStyles.resultText, { color: getResultColor(game.result) }]}>
              {game.result} {game.score}
            </ThemedText>
          </View>
        </View>
        <View style={cardStyles.metaRow}>
          <ThemedText style={[cardStyles.metaText, { color: colors.textSecondary }]}>{game.date}</ThemedText>
          <View style={cardStyles.metaDot} />
          <ThemedText style={[cardStyles.metaText, { color: colors.textSecondary }]}>{formatDuration(game.duration)}</ThemedText>
          <View style={cardStyles.metaDot} />
          <ThemedText style={[cardStyles.metaText, { color: colors.textSecondary }]}>{game.clipCount} clips</ThemedText>
        </View>
        <View style={cardStyles.tagRow}>
          {game.tags.map((tag) => (
            <View key={tag} style={[cardStyles.tagChip, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[cardStyles.tagText, { color: colors.textSecondary }]}>{tag}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

function PracticeFilmRow({ item, colors }: { item: PracticeFilmItem; colors: typeof Colors.light }) {
  const typeColor = item.practiceType === 'Full Practice' ? '#1D9BF0'
    : item.practiceType === 'Walkthrough' ? '#22C55E'
    : item.practiceType === 'Shootaround' ? '#F59E0B'
    : item.practiceType === 'Film Session' ? '#1D9BF0'
    : '#1D9BF0';
  return (
    <Pressable
      style={({ pressed }) => [
        cardStyles.card,
        { backgroundColor: pressed ? colors.cardElevated : colors.card },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[cardStyles.colorStrip, { backgroundColor: item.thumbnailColor }]} />
      <View style={cardStyles.cardContent}>
        <View style={cardStyles.cardHeader}>
          <ThemedText style={[cardStyles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {item.date}
          </ThemedText>
          <View style={[cardStyles.typeBadge, { backgroundColor: typeColor + '1A' }]}>
            <ThemedText style={[cardStyles.typeText, { color: typeColor }]}>
              {item.practiceType.toUpperCase()}
            </ThemedText>
          </View>
        </View>
        <View style={cardStyles.metaRow}>
          <ThemedText style={[cardStyles.metaText, { color: colors.textSecondary }]}>{item.duration}</ThemedText>
        </View>
        {item.notes && (
          <ThemedText style={[cardStyles.noteText, { color: colors.textTertiary }]} numberOfLines={1}>
            {item.notes}
          </ThemedText>
        )}
      </View>
    </Pressable>
  );
}

function ScoutPackRow({ pack, colors }: { pack: ScoutPack; colors: typeof Colors.light }) {
  return (
    <Pressable
      style={({ pressed }) => [
        cardStyles.card,
        { backgroundColor: pressed ? colors.cardElevated : colors.card },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[cardStyles.colorStrip, { backgroundColor: pack.coverColor }]} />
      <View style={cardStyles.cardContent}>
        <View style={cardStyles.cardHeader}>
          <ThemedText style={[cardStyles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {pack.opponent}
          </ThemedText>
          {pack.tags[0] && (
            <View style={[cardStyles.typeBadge, { backgroundColor: '#F59E0B1A' }]}>
              <ThemedText style={[cardStyles.typeText, { color: '#F59E0B' }]}>
                {pack.tags[0].toUpperCase()}
              </ThemedText>
            </View>
          )}
        </View>
        <View style={cardStyles.metaRow}>
          <ThemedText style={[cardStyles.metaText, { color: colors.textSecondary }]}>{pack.date}</ThemedText>
          <View style={cardStyles.metaDot} />
          <ThemedText style={[cardStyles.metaText, { color: colors.textSecondary }]}>{pack.clipCount} clips</ThemedText>
        </View>
        <View style={cardStyles.tagRow}>
          {pack.tags.slice(1).map((tag) => (
            <View key={tag} style={[cardStyles.tagChip, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[cardStyles.tagText, { color: colors.textSecondary }]}>{tag}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

function EmptyState({ colors, label, icon }: { colors: typeof Colors.light; label: string; icon: string }) {
  return (
    <View style={styles.emptyState}>
      <IconSymbol name={icon as any} size={28} color={colors.textTertiary} />
      <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>{label}</ThemedText>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: { flexDirection: 'row', borderRadius: BorderRadius.lg, overflow: 'hidden' },
  colorStrip: { width: 4 },
  cardContent: { flex: 1, padding: Spacing.sm + 4, gap: 6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: Spacing.sm },
  resultBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  resultText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  typeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12 },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#52525B' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  tagChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  tagText: { fontSize: 10, fontWeight: '500' },
  noteText: { fontSize: 12, fontStyle: 'italic' },
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SportsFilmRoomV2() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState<FilmTab>('game_film');

  const games = VIDEO_GAMES_BY_MODE.sports;
  const practiceFilm = MOCK_PRACTICE_FILM;
  const scoutPacks = SCOUT_PACKS_BY_MODE.sports;

  const handleTabPress = (tab: FilmTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'game_film':
        return (
          <FlatList
            data={games}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <GameFilmRow game={item} colors={colors} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyState colors={colors} label="No game film" icon="play.rectangle.fill" />}
          />
        );
      case 'practice_film':
        return (
          <FlatList
            data={practiceFilm}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PracticeFilmRow item={item} colors={colors} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyState colors={colors} label="No practice film" icon="figure.run" />}
          />
        );
      case 'scouting':
        return (
          <FlatList
            data={scoutPacks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ScoutPackRow pack={item} colors={colors} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyState colors={colors} label="No scouting packs" icon="binoculars.fill" />}
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
                { backgroundColor: active ? '#fff' : colors.backgroundTertiary },
              ]}
              onPress={() => handleTabPress(tab.key)}
            >
              <ThemedText
                style={[styles.pillText, { color: active ? '#000' : colors.textSecondary }]}
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
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
  },
});
