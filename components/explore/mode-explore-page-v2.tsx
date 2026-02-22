/**
 * ModeExplorePageV2 — Shelf-based discovery page for non-sports modes.
 * Search bar, filter chips, horizontal shelf rows of games/clips/reels/channels.
 * Uses mode-keyed data from mock-video.ts.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme'
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Mode } from '@/types';
import {
  VIDEO_GAMES_BY_MODE,
  VIDEO_CLIPS_BY_MODE,
  REELS_BY_MODE,
  PLAYER_CHANNELS_BY_MODE,
  SCOUT_PACKS_BY_MODE,
  TRENDING_BY_MODE,
  formatDuration,
  getResultColor,
  type VideoGame,
  type VideoClip,
  type Reel,
  type PlayerChannel,
  type ScoutPack,
  type TrendingItem,
} from '@/data/mock-video';

// =============================================================================
// MODE CONFIG
// =============================================================================

type FilterChip = string;

interface ModeConfig {
  searchPlaceholder: string;
  filters: FilterChip[];
  shelfLabels: {
    games: string;
    clips: string;
    reels: string;
    channels: string;
    upcoming: string;
  };
}

const MODE_CONFIG: Record<Mode, ModeConfig> = {
  sports: {
    searchPlaceholder: 'Search games, clips, players...',
    filters: ['All', 'Games', 'Practice', 'Highlights', 'Scout'],
    shelfLabels: { games: 'Game Film', clips: 'Clips', reels: 'Reels', channels: 'Player Channels', upcoming: 'Scout Packs' },
  },
  church: {
    searchPlaceholder: 'Search sermons, worship, ministries...',
    filters: ['All', 'Sermons', 'Worship', 'Teaching', 'Events', 'Youth'],
    shelfLabels: { games: 'Services & Events', clips: 'Ministry Clips', reels: 'Highlights', channels: 'Ministry Channels', upcoming: 'Upcoming Events' },
  },
  education: {
    searchPlaceholder: 'Search lectures, events, departments...',
    filters: ['All', 'Lectures', 'Events', 'Campus', 'Athletics', 'Research'],
    shelfLabels: { games: 'Lectures & Events', clips: 'Academic Clips', reels: 'Campus Highlights', channels: 'Department Channels', upcoming: 'Upcoming' },
  },
  business: {
    searchPlaceholder: 'Search demos, all-hands, sprints...',
    filters: ['All', 'Product', 'Engineering', 'Marketing', 'Customer', 'Press'],
    shelfLabels: { games: 'Meetings & Events', clips: 'Product Clips', reels: 'Team Highlights', channels: 'Team Channels', upcoming: 'Upcoming' },
  },
  competition: {
    searchPlaceholder: 'Search races, onboards, drivers...',
    filters: ['All', 'Races', 'Qualifying', 'Onboard', 'Analysis', 'Paddock'],
    shelfLabels: { games: 'Race Sessions', clips: 'Race Clips', reels: 'Paddock Highlights', channels: 'Driver & Team Channels', upcoming: 'Upcoming Races' },
  },
};

// =============================================================================
// SHELF ROW
// =============================================================================

function ShelfRow<T>({
  title,
  data,
  keyExtractor,
  renderItem,
  accent,
}: {
  title: string;
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  accent: string;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();

  if (data.length === 0) return null;

  return (
    <View style={shelfStyles.container}>
      <View style={shelfStyles.header}>
        <ThemedText style={[shelfStyles.title, { color: colors.text }]}>{title}</ThemedText>
        <Pressable
          hitSlop={8}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <ThemedText style={[shelfStyles.seeAll, { color: accent }]}>See All</ThemedText>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={shelfStyles.scroll}
      >
        {data.map((item) => (
          <View key={keyExtractor(item)}>{renderItem(item)}</View>
        ))}
      </ScrollView>
    </View>
  );
}

const shelfStyles = StyleSheet.create({
  container: { marginBottom: Spacing.md + 4 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  title: { fontSize: 15, fontWeight: '700' },
  seeAll: { fontSize: 13, fontWeight: '600' },
  scroll: { paddingHorizontal: Spacing.md, gap: 10 },
});

// =============================================================================
// CARD COMPONENTS
// =============================================================================

function GameCard({ game }: { game: VideoGame }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <Pressable
      style={[cardStyles.gameCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[cardStyles.gameThumbnail, { backgroundColor: game.thumbnailColor }]}>
        <IconSymbol name="play.fill" size={14} color="#fff" />
        <View style={cardStyles.durationBadge}>
          <ThemedText style={cardStyles.durationText}>{formatDuration(game.duration)}</ThemedText>
        </View>
      </View>
      <View style={cardStyles.cardInfo}>
        <ThemedText style={[cardStyles.cardTitle, { color: colors.text }]} numberOfLines={1}>
          {game.opponent}
        </ThemedText>
        <View style={cardStyles.metaRow}>
          <ThemedText style={[cardStyles.cardMeta, { color: getResultColor(game.result) }]}>
            {game.result} {game.score}
          </ThemedText>
        </View>
        <ThemedText style={[cardStyles.cardSub, { color: colors.textTertiary }]}>
          {game.date} · {game.clipCount} clips
        </ThemedText>
      </View>
    </Pressable>
  );
}

function ClipCard({ clip }: { clip: VideoClip }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const typeColor = clip.type === 'highlight' ? '#22C55E' : clip.type === 'breakdown' ? accent : clip.type === 'scout' ? '#F59E0B' : accent;
  return (
    <Pressable
      style={[cardStyles.clipCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[cardStyles.clipThumbnail, { backgroundColor: clip.thumbnailColor }]}>
        <IconSymbol name="play.fill" size={12} color="#fff" />
        <View style={[cardStyles.typeBadge, { backgroundColor: typeColor }]}>
          <ThemedText style={cardStyles.typeBadgeText}>{clip.type.toUpperCase()}</ThemedText>
        </View>
      </View>
      <View style={cardStyles.cardInfo}>
        <ThemedText style={[cardStyles.cardTitle, { color: colors.text }]} numberOfLines={2}>
          {clip.title}
        </ThemedText>
        <ThemedText style={[cardStyles.cardSub, { color: colors.textTertiary }]}>
          {formatDuration(clip.duration)} · {clip.source}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function ReelCard({ reel }: { reel: Reel }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <Pressable
      style={[cardStyles.reelCard, { backgroundColor: reel.thumbnailColor }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={cardStyles.reelOverlay}>
        <IconSymbol name="play.fill" size={18} color="#fff" />
      </View>
      <View style={cardStyles.reelBottom}>
        <ThemedText style={cardStyles.reelTitle} numberOfLines={1}>{reel.title}</ThemedText>
        <ThemedText style={cardStyles.reelCaption} numberOfLines={1}>{reel.caption}</ThemedText>
        <View style={cardStyles.reelStats}>
          <IconSymbol name="heart.fill" size={10} color="rgba(255,255,255,0.7)" />
          <ThemedText style={cardStyles.reelStatText}>{reel.likes}</ThemedText>
          <IconSymbol name="bookmark.fill" size={10} color="rgba(255,255,255,0.7)" />
          <ThemedText style={cardStyles.reelStatText}>{reel.saves}</ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

function ChannelCard({ channel }: { channel: PlayerChannel }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <Pressable
      style={[cardStyles.channelCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[cardStyles.channelAvatar, { backgroundColor: colors.backgroundTertiary }]}>
        <ThemedText style={[cardStyles.channelInitials, { color: colors.text }]}>
          {channel.avatarInitials}
        </ThemedText>
      </View>
      <ThemedText style={[cardStyles.cardTitle, { color: colors.text }]} numberOfLines={1}>
        {channel.name}
      </ThemedText>
      {channel.position ? (
        <ThemedText style={[cardStyles.cardSub, { color: colors.textTertiary }]} numberOfLines={1}>
          {channel.number ? `#${channel.number} · ` : ''}{channel.position}
        </ThemedText>
      ) : null}
      <ThemedText style={[cardStyles.channelCount, { color: colors.textSecondary }]}>
        {channel.clipCount} clips
      </ThemedText>
    </Pressable>
  );
}

function ScoutCard({ pack, accent }: { pack: ScoutPack; accent: string }) {
  return (
    <Pressable
      style={[cardStyles.scoutCard, { backgroundColor: pack.coverColor }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      {pack.tags[0] && (
        <View style={cardStyles.scoutBadge}>
          <ThemedText style={cardStyles.scoutBadgeText}>{pack.tags[0].toUpperCase()}</ThemedText>
        </View>
      )}
      <View style={cardStyles.scoutBottom}>
        <ThemedText style={cardStyles.scoutTitle} numberOfLines={1}>{pack.opponent}</ThemedText>
        <ThemedText style={cardStyles.scoutDate}>{pack.date} · {pack.clipCount} clips</ThemedText>
      </View>
    </Pressable>
  );
}

const cardStyles = StyleSheet.create({
  // Game card
  gameCard: { width: 200, borderRadius: BorderRadius.md, borderWidth: 1, overflow: 'hidden' },
  gameThumbnail: { height: 80, justifyContent: 'center', alignItems: 'center' },
  durationBadge: { position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3 },
  durationText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  cardInfo: { padding: 8 },
  cardTitle: { fontSize: 13, fontWeight: '600' },
  cardMeta: { fontSize: 11, fontWeight: '700' },
  cardSub: { fontSize: 11, marginTop: 2 },
  metaRow: { marginTop: 2 },

  // Clip card
  clipCard: { width: 160, borderRadius: BorderRadius.md, borderWidth: 1, overflow: 'hidden' },
  clipThumbnail: { height: 60, justifyContent: 'center', alignItems: 'center' },
  typeBadge: { position: 'absolute', top: 4, left: 4, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3 },
  typeBadgeText: { fontSize: 8, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  // Reel card
  reelCard: { width: 130, height: 180, borderRadius: BorderRadius.md, overflow: 'hidden', justifyContent: 'flex-end' },
  reelOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  reelBottom: { padding: 8, backgroundColor: 'rgba(0,0,0,0.5)' },
  reelTitle: { fontSize: 11, fontWeight: '700', color: '#fff' },
  reelCaption: { fontSize: 9, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  reelStats: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  reelStatText: { fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },

  // Channel card
  channelCard: { width: 120, borderRadius: BorderRadius.md, borderWidth: 1, padding: 10, alignItems: 'center' },
  channelAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  channelInitials: { fontSize: 14, fontWeight: '800' },
  channelCount: { fontSize: 11, fontWeight: '600', marginTop: 4 },

  // Scout card
  scoutCard: { width: 180, height: 100, borderRadius: BorderRadius.md, overflow: 'hidden', justifyContent: 'flex-end' },
  scoutBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  scoutBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  scoutBottom: { padding: 8, backgroundColor: 'rgba(0,0,0,0.5)' },
  scoutTitle: { fontSize: 13, fontWeight: '700', color: '#fff' },
  scoutDate: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface Props {
  mode: Mode;
}

export function ModeExplorePageV2({ mode }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = ModeColors[mode]?.primary ?? '#fff';
  const config = MODE_CONFIG[mode];

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const games = useMemo(() => {
    let list = VIDEO_GAMES_BY_MODE[mode] ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((g) => g.opponent.toLowerCase().includes(q) || g.tags.some((t) => t.toLowerCase().includes(q)));
    }
    return list;
  }, [mode, search]);

  const clips = useMemo(() => {
    let list = VIDEO_CLIPS_BY_MODE[mode] ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q)));
    }
    return list;
  }, [mode, search]);

  const reels = useMemo(() => {
    let list = REELS_BY_MODE[mode] ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q) || r.caption.toLowerCase().includes(q));
    }
    return list;
  }, [mode, search]);

  const channels = PLAYER_CHANNELS_BY_MODE[mode] ?? [];
  const upcoming = SCOUT_PACKS_BY_MODE[mode] ?? [];
  const trending = TRENDING_BY_MODE[mode] ?? [];

  // Filter chip → shelf visibility mapping
  const FILTER_SHELF_MAP: Record<Mode, Record<string, ('games' | 'clips' | 'reels' | 'channels' | 'upcoming')[]>> = {
    church: { Sermons: ['games'], Worship: ['reels'], Teaching: ['clips'], Events: ['upcoming'], Youth: ['clips', 'reels'] },
    education: { Lectures: ['games'], Events: ['upcoming'], Campus: ['reels'], Athletics: ['reels'], Research: ['clips'] },
    business: { Product: ['games', 'clips'], Engineering: ['clips'], Marketing: ['reels'], Customer: ['reels'], Press: ['upcoming'] },
    competition: { Races: ['games'], Qualifying: ['games'], Onboard: ['clips'], Analysis: ['clips'], Paddock: ['reels'] },
    sports: {},
  };

  const showShelf = (shelf: 'games' | 'clips' | 'reels' | 'channels' | 'upcoming') => {
    if (activeFilter === 'All') return true;
    const map = FILTER_SHELF_MAP[mode]?.[activeFilter];
    return map ? map.includes(shelf) : true;
  };

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
          placeholder={config.searchPlaceholder}
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Trending Section */}
      {trending.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingScroll}
          style={styles.trendingContainer}
        >
          {trending.map((item) => (
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
      )}

      {/* Filter Chips */}
      <View style={styles.chipRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {config.filters.map((filter) => (
            <Pressable
              key={filter}
              style={[
                styles.chip,
                { backgroundColor: activeFilter === filter ? '#fff' : colors.backgroundTertiary, borderColor: colors.border },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveFilter(filter);
              }}
            >
              <ThemedText style={[styles.chipText, { color: activeFilter === filter ? '#000' : colors.textSecondary }]}>
                {filter}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Shelf A: Games/Services/Lectures/Meetings/Races */}
      {showShelf('games') && (
        <ShelfRow
          title={config.shelfLabels.games}
          data={games}
          keyExtractor={(g) => g.id}
          renderItem={(g) => <GameCard game={g} />}
          accent={accent}
        />
      )}

      {/* Shelf B: Clips */}
      {showShelf('clips') && (
        <ShelfRow
          title={config.shelfLabels.clips}
          data={clips.slice(0, 8)}
          keyExtractor={(c) => c.id}
          renderItem={(c) => <ClipCard clip={c} />}
          accent={accent}
        />
      )}

      {/* Shelf C: Reels/Highlights */}
      {showShelf('reels') && (
        <ShelfRow
          title={config.shelfLabels.reels}
          data={reels}
          keyExtractor={(r) => r.id}
          renderItem={(r) => <ReelCard reel={r} />}
          accent={accent}
        />
      )}

      {/* Shelf D: Channels */}
      {showShelf('channels') && (
        <ShelfRow
          title={config.shelfLabels.channels}
          data={channels}
          keyExtractor={(c) => c.id}
          renderItem={(c) => <ChannelCard channel={c} />}
          accent={accent}
        />
      )}

      {/* Shelf E: Upcoming/Scout Packs */}
      {showShelf('upcoming') && (
        <ShelfRow
          title={config.shelfLabels.upcoming}
          data={upcoming}
          keyExtractor={(s) => s.id}
          renderItem={(s) => <ScoutCard pack={s} accent={accent} />}
          accent={accent}
        />
      )}

      {games.length === 0 && clips.length === 0 && reels.length === 0 && (
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
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  chipRow: { marginBottom: Spacing.md },
  chipScroll: { paddingHorizontal: Spacing.md, gap: 8, alignItems: 'center' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },
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
  emptyState: { alignItems: 'center', paddingTop: Spacing.xxl * 2, gap: 8 },
  emptyText: { fontSize: 14 },
});
