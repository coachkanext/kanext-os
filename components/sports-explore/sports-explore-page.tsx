/**
 * SportsExplorePage — YouTube-style discovery homepage for sports content.
 * Search bar, filter chips, 8 horizontal carousels.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ContentRail } from '@/components/sports-explore/content-rail';
import { HeroFeatureCard } from '@/components/sports-explore/hero-feature-card';
import { GameCard } from '@/components/sports-explore/game-card';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  HERO_FEATURE,
  CONTINUE_WATCHING,
  TOP_GAMES,
  NEW_UPLOADS,
  TRENDING_PROGRAMS,
  PLAYERS_TO_WATCH,
  EVENTS_SHOWCASES,
  COACH_PICKS,
  EXPLORE_SCOPE_OPTIONS,
  EXPLORE_SORT_OPTIONS,
  type GameCard as GameCardType,
  type ContinueWatchingItem,
  type ProgramTile,
  type PlayerSpotlight,
  type EventCard,
  type CoachPick,
  type ExploreFilterScope,
  type ExploreSort,
} from '@/data/mock-sports-explore';

export function SportsExplorePage() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeScope, setActiveScope] = useState<ExploreFilterScope>('All');
  const [activeSort, setActiveSort] = useState<ExploreSort>('Trending');

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
          placeholder="Search games, teams, players..."
          placeholderTextColor={colors.textTertiary}
          editable={false}
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.chipRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {EXPLORE_SCOPE_OPTIONS.map((scope) => (
            <Pressable
              key={scope}
              style={[
                styles.chip,
                { backgroundColor: activeScope === scope ? '#fff' : colors.backgroundTertiary, borderColor: colors.border },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveScope(scope);
              }}
            >
              <ThemedText style={[styles.chipText, { color: activeScope === scope ? '#000' : colors.textSecondary }]}>
                {scope}
              </ThemedText>
            </Pressable>
          ))}
          <View style={[styles.chipDivider, { backgroundColor: colors.border }]} />
          {EXPLORE_SORT_OPTIONS.map((sort) => (
            <Pressable
              key={sort}
              style={[
                styles.chip,
                { backgroundColor: activeSort === sort ? '#fff' : colors.backgroundTertiary, borderColor: colors.border },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveSort(sort);
              }}
            >
              <ThemedText style={[styles.chipText, { color: activeSort === sort ? '#000' : colors.textSecondary }]}>
                {sort}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Block A: Hero Feature */}
      <HeroFeatureCard
        title={`${HERO_FEATURE.homeTeam} vs ${HERO_FEATURE.awayTeam}`}
        subtitle={HERO_FEATURE.league}
        hookText={HERO_FEATURE.hookText}
        badgeText={HERO_FEATURE.badgeText}
        ctaLabel="Watch"
        thumbnailColor={HERO_FEATURE.thumbnailColor}
        leftInitials={HERO_FEATURE.homeInitials}
        rightInitials={HERO_FEATURE.awayInitials}
      />

      {/* Block B: Continue Watching */}
      {CONTINUE_WATCHING.length > 0 && (
        <ContentRail
          title="Continue Watching"
          data={CONTINUE_WATCHING}
          keyExtractor={(item) => item.id}
          itemWidth={200}
          renderItem={(item: ContinueWatchingItem, c) => (
            <Pressable
              style={[styles.cwCard, { backgroundColor: item.thumbnailColor }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={styles.cwContent}>
                <ThemedText style={styles.cwTitle} numberOfLines={1}>{item.title}</ThemedText>
                <ThemedText style={styles.cwSub} numberOfLines={1}>{item.subtitle}</ThemedText>
              </View>
              <View style={styles.cwProgressBg}>
                <View style={[styles.cwProgressFill, { width: `${item.progress * 100}%` }]} />
              </View>
              <View style={styles.cwDuration}>
                <ThemedText style={styles.cwDurationText}>{item.duration}</ThemedText>
              </View>
            </Pressable>
          )}
        />
      )}

      {/* Block C: Top Games */}
      <ContentRail
        title="Top Games Right Now"
        data={TOP_GAMES}
        keyExtractor={(item) => item.id}
        itemWidth={160}
        renderItem={(item: GameCardType) => (
          <GameCard
            homeInitials={item.homeInitials}
            awayInitials={item.awayInitials}
            score={item.score}
            date={item.date}
            badge={item.badge}
            duration={item.duration}
            thumbnailColor={item.thumbnailColor}
            isLive={item.isLive}
          />
        )}
      />

      {/* Block D: New Uploads */}
      <ContentRail
        title="New Uploads"
        data={NEW_UPLOADS}
        keyExtractor={(item) => item.id}
        itemWidth={160}
        renderItem={(item: GameCardType) => (
          <GameCard
            homeInitials={item.homeInitials}
            awayInitials={item.awayInitials}
            score={item.score}
            date={item.date}
            badge={item.badge}
            duration={item.duration}
            thumbnailColor={item.thumbnailColor}
          />
        )}
      />

      {/* Block E: Trending Programs */}
      <ContentRail
        title="Trending Programs"
        data={TRENDING_PROGRAMS}
        keyExtractor={(item) => item.id}
        itemWidth={140}
        renderItem={(item: ProgramTile, c) => (
          <Pressable
            style={[styles.programTile, { backgroundColor: c.backgroundTertiary, borderColor: c.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.programAvatar, { backgroundColor: item.thumbnailColor }]}>
              <ThemedText style={styles.programInitials}>{item.initials}</ThemedText>
            </View>
            <ThemedText style={[styles.programName, { color: c.text }]} numberOfLines={1}>{item.name}</ThemedText>
            <ThemedText style={[styles.programMeta, { color: c.textTertiary }]}>{item.record} • {item.conference}</ThemedText>
          </Pressable>
        )}
      />

      {/* Block F: Players to Watch */}
      <ContentRail
        title="Players to Watch"
        data={PLAYERS_TO_WATCH}
        keyExtractor={(item) => item.id}
        itemWidth={160}
        renderItem={(item: PlayerSpotlight, c) => (
          <Pressable
            style={[styles.playerCard, { backgroundColor: c.backgroundTertiary, borderColor: c.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.playerAvatar, { backgroundColor: item.thumbnailColor }]}>
              <ThemedText style={styles.playerInitials}>
                {item.name.split(' ').map(n => n[0]).join('')}
              </ThemedText>
            </View>
            <ThemedText style={[styles.playerName, { color: c.text }]} numberOfLines={1}>{item.name}</ThemedText>
            <ThemedText style={[styles.playerPos, { color: c.textTertiary }]}>{item.position} • {item.team}</ThemedText>
            <ThemedText style={[styles.playerStat, { color: c.textSecondary }]}>{item.stat}</ThemedText>
          </Pressable>
        )}
      />

      {/* Block G: Events & Showcases */}
      <ContentRail
        title="Events & Showcases"
        data={EVENTS_SHOWCASES}
        keyExtractor={(item) => item.id}
        itemWidth={200}
        renderItem={(item: EventCard, c) => (
          <Pressable
            style={[styles.eventCard, { backgroundColor: item.thumbnailColor }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={styles.eventBadge}>
              <ThemedText style={styles.eventBadgeText}>{item.type.toUpperCase()}</ThemedText>
            </View>
            <View style={styles.eventBottom}>
              <ThemedText style={styles.eventTitle} numberOfLines={1}>{item.title}</ThemedText>
              <ThemedText style={styles.eventMeta}>{item.date} • {item.location}</ThemedText>
            </View>
          </Pressable>
        )}
      />

      {/* Block H: Coach Picks */}
      <ContentRail
        title="Coach Picks"
        data={COACH_PICKS}
        keyExtractor={(item) => item.id}
        itemWidth={220}
        renderItem={(item: CoachPick, c) => (
          <Pressable
            style={[styles.pickCard, { backgroundColor: c.backgroundTertiary, borderColor: c.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.pickThumb, { backgroundColor: item.thumbnailColor }]}>
              <IconSymbol name="play.fill" size={16} color="#fff" />
              <View style={styles.pickDuration}>
                <ThemedText style={styles.pickDurationText}>{item.duration}</ThemedText>
              </View>
            </View>
            <View style={styles.pickInfo}>
              <ThemedText style={[styles.pickTitle, { color: c.text }]} numberOfLines={2}>{item.title}</ThemedText>
              <ThemedText style={[styles.pickSub, { color: c.textTertiary }]} numberOfLines={1}>{item.subtitle}</ThemedText>
              <ThemedText style={[styles.pickAuthor, { color: c.textTertiary }]}>{item.authorName}</ThemedText>
            </View>
          </Pressable>
        )}
      />

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: Spacing.sm, paddingBottom: 40 },

  // Search bar
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

  // Filter chips
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

  // Continue watching
  cwCard: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    height: 100,
    justifyContent: 'flex-end',
  },
  cwContent: {
    padding: 8,
  },
  cwTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  cwSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 1,
  },
  cwProgressBg: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cwProgressFill: {
    height: '100%',
    backgroundColor: '#B85C5C',
  },
  cwDuration: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  cwDurationText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },

  // Program tiles
  programTile: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  programAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  programInitials: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  programName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  programMeta: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },

  // Player cards
  playerCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  playerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerInitials: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  playerName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  playerPos: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  playerStat: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },

  // Event cards
  eventCard: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    height: 100,
    justifyContent: 'flex-end',
  },
  eventBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  eventBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  eventBottom: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  eventMeta: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },

  // Coach picks
  pickCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pickThumb: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickDuration: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  pickDurationText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  pickInfo: {
    padding: 8,
  },
  pickTitle: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },
  pickSub: {
    fontSize: 11,
    marginTop: 3,
  },
  pickAuthor: {
    fontSize: 10,
    marginTop: 3,
  },
});
