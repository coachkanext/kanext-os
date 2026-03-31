/**
 * ModeFilmRoomV2 — Pill-nav tabbed film room for non-sports modes.
 * Each mode gets 3 mode-specific tabs.
 * Uses mode-keyed data from mock-video.ts.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Mode } from '@/types';
import {
  VIDEO_GAMES_BY_MODE,
  VIDEO_CLIPS_BY_MODE,
  REELS_BY_MODE,
  formatDuration,
  getResultColor,
  type VideoGame,
  type VideoClip,
  type Reel,
} from '@/data/mock-video';

// =============================================================================
// MODE TAB CONFIGURATION
// =============================================================================

type TabKey = 'primary' | 'secondary' | 'tertiary';

interface TabDef {
  key: TabKey;
  label: string;
}

interface ModeTabConfig {
  tabs: TabDef[];
}

const TAB_CONFIG: Record<Mode, ModeTabConfig> = {
  sports: {
    tabs: [
      { key: 'primary', label: 'Games' },
      { key: 'secondary', label: 'Clips' },
      { key: 'tertiary', label: 'Reels' },
    ],
  },
  church: {
    tabs: [
      { key: 'primary', label: 'Services' },
      { key: 'secondary', label: 'Ministry Content' },
      { key: 'tertiary', label: 'Testimonies' },
    ],
  },
  education: {
    tabs: [
      { key: 'primary', label: 'Lectures' },
      { key: 'secondary', label: 'Campus' },
      { key: 'tertiary', label: 'Training' },
    ],
  },
  business: {
    tabs: [
      { key: 'primary', label: 'Demos' },
      { key: 'secondary', label: 'Meetings' },
      { key: 'tertiary', label: 'Content' },
    ],
  },
  competition: {
    tabs: [
      { key: 'primary', label: 'Race Film' },
      { key: 'secondary', label: 'Technical' },
      { key: 'tertiary', label: 'Broadcast' },
    ],
  },
};

// =============================================================================
// CARD COMPONENTS
// =============================================================================

function GameRow({ game, colors }: { game: VideoGame; colors: typeof Colors.light }) {
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

function ClipRow({ clip, colors }: { clip: VideoClip; colors: typeof Colors.light }) {
  const typeColor = clip.type === 'highlight' ? '#5A8A6E' : clip.type === 'breakdown' ? accent : clip.type === 'scout' ? '#B8943E' : accent;
  return (
    <Pressable
      style={({ pressed }) => [
        cardStyles.card,
        { backgroundColor: pressed ? colors.cardElevated : colors.card },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[cardStyles.colorStrip, { backgroundColor: clip.thumbnailColor }]} />
      <View style={cardStyles.cardContent}>
        <View style={cardStyles.cardHeader}>
          <ThemedText style={[cardStyles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {clip.title}
          </ThemedText>
          <View style={[cardStyles.typeBadge, { backgroundColor: typeColor + '1A' }]}>
            <ThemedText style={[cardStyles.typeText, { color: typeColor }]}>
              {clip.type.toUpperCase()}
            </ThemedText>
          </View>
        </View>
        <View style={cardStyles.metaRow}>
          <ThemedText style={[cardStyles.metaText, { color: colors.textSecondary }]}>{formatDuration(clip.duration)}</ThemedText>
          <View style={cardStyles.metaDot} />
          <ThemedText style={[cardStyles.metaText, { color: colors.textSecondary }]}>{clip.source}</ThemedText>
        </View>
        <View style={cardStyles.tagRow}>
          {clip.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={[cardStyles.tagChip, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[cardStyles.tagText, { color: colors.textSecondary }]}>{tag}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

function ReelRow({ reel, colors }: { reel: Reel; colors: typeof Colors.light }) {
  return (
    <Pressable
      style={({ pressed }) => [
        cardStyles.card,
        { backgroundColor: pressed ? colors.cardElevated : colors.card },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[cardStyles.colorStrip, { backgroundColor: reel.thumbnailColor }]} />
      <View style={cardStyles.cardContent}>
        <View style={cardStyles.cardHeader}>
          <ThemedText style={[cardStyles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {reel.title}
          </ThemedText>
          <View style={cardStyles.reelStats}>
            <IconSymbol name="heart.fill" size={10} color={colors.textTertiary} />
            <ThemedText style={[cardStyles.reelStatNum, { color: colors.textTertiary }]}>{reel.likes}</ThemedText>
          </View>
        </View>
        <ThemedText style={[cardStyles.reelCaption, { color: colors.textSecondary }]} numberOfLines={1}>
          {reel.caption}
        </ThemedText>
        <View style={cardStyles.metaRow}>
          <ThemedText style={[cardStyles.metaText, { color: colors.textSecondary }]}>{formatDuration(reel.duration)}</ThemedText>
          <View style={cardStyles.metaDot} />
          <ThemedText style={[cardStyles.metaText, { color: colors.textSecondary }]}>{reel.source}</ThemedText>
          <View style={cardStyles.metaDot} />
          <ThemedText style={[cardStyles.metaText, { color: colors.textSecondary }]}>{reel.createdAt}</ThemedText>
        </View>
        <View style={cardStyles.tagRow}>
          {reel.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={[cardStyles.tagChip, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[cardStyles.tagText, { color: colors.textSecondary }]}>{tag}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
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
  reelCaption: { fontSize: 12 },
  reelStats: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  reelStatNum: { fontSize: 11, fontWeight: '600' },
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface Props {
  mode: Mode;
}

export function ModeFilmRoomV2({ mode }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const config = TAB_CONFIG[mode];
  const [activeTab, setActiveTab] = useState<TabKey>(config.tabs[0]?.key ?? 'primary');

  const games = VIDEO_GAMES_BY_MODE[mode] ?? [];
  const clips = VIDEO_CLIPS_BY_MODE[mode] ?? [];
  const reels = REELS_BY_MODE[mode] ?? [];

  const handleTabPress = (tab: TabKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'primary':
        return (
          <FlatList
            data={games}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <GameRow game={item} colors={colors} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyState colors={colors} label="No content yet" icon="play.rectangle.fill" />}
          />
        );
      case 'secondary':
        return (
          <FlatList
            data={clips}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ClipRow clip={item} colors={colors} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyState colors={colors} label="No clips" icon="film" />}
          />
        );
      case 'tertiary':
        return (
          <FlatList
            data={reels}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ReelRow reel={item} colors={colors} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyState colors={colors} label="No content" icon="play.circle" />}
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
        {config.tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.pill, { backgroundColor: active ? '#fff' : colors.backgroundTertiary }]}
              onPress={() => handleTabPress(tab.key)}
            >
              <ThemedText style={[styles.pillText, { color: active ? '#000' : colors.textSecondary }]}>
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

function EmptyState({ colors, label, icon }: { colors: typeof Colors.light; label: string; icon: string }) {
  return (
    <View style={styles.emptyState}>
      <IconSymbol name={icon as any} size={28} color={colors.textTertiary} />
      <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pillScroll: { flexGrow: 0, paddingVertical: Spacing.sm },
  pillRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.md },
  pill: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6 },
  pillText: { fontSize: 13, fontWeight: '600' },
  contentArea: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.sm },
  emptyState: { alignItems: 'center', paddingTop: Spacing.xxl * 2, gap: 8 },
  emptyText: { fontSize: 14 },
});
