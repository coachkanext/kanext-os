/**
 * CompetitionExplorePage — Competition YouTube discovery homepage for racing content.
 * Search bar, filter chips, 7 horizontal carousels.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ContentRail } from '@/components/sports-explore/content-rail';
import { HeroFeatureCard } from '@/components/sports-explore/hero-feature-card';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  FEATURED_RACE,
  TOP_RACES,
  DRIVER_SPOTLIGHTS,
  TEAM_PROFILES,
  TECHNIQUE_VIDEOS,
  CHAMPIONSHIP_STANDINGS,
  UPCOMING_EVENTS,
  EXPLORE_FILTERS,
  type TopRace,
  type DriverSpotlight,
  type TeamProfile,
  type TechniqueVideo,
  type ChampionshipStanding,
  type UpcomingEvent,
  type CompetitionScope,
} from '@/data/mock-competition-explore';

export function CompetitionExplorePage() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeScope, setActiveScope] = useState<CompetitionScope>('All');

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
          placeholder="Search races, drivers, teams..."
          placeholderTextColor={colors.textTertiary}
          editable={false}
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.chipRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {EXPLORE_FILTERS.map((scope) => (
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
        </ScrollView>
      </View>

      {/* Block A: Featured Race */}
      <HeroFeatureCard
        title={FEATURED_RACE.title}
        subtitle={FEATURED_RACE.subtitle}
        hookText={FEATURED_RACE.hookText}
        badgeText={FEATURED_RACE.badgeText}
        ctaLabel={FEATURED_RACE.ctaLabel}
        thumbnailColor={FEATURED_RACE.thumbnailColor}
        leftInitials={FEATURED_RACE.leftInitials}
        rightInitials={FEATURED_RACE.rightInitials}
      />

      {/* Block B: Top Races */}
      <ContentRail
        title="Top Races"
        data={TOP_RACES}
        keyExtractor={(item) => item.id}
        itemWidth={160}
        renderItem={(item: TopRace, c) => (
          <Pressable
            style={[styles.card, { backgroundColor: c.backgroundTertiary, borderColor: c.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.thumbnail, { backgroundColor: item.thumbnailColor }]}>
              <IconSymbol name="play.fill" size={14} color={item.thumbnailColor === '#FFFFFF' ? '#000' : '#fff'} />
              <View style={styles.durationBadge}>
                <ThemedText style={styles.durationText}>{item.duration}</ThemedText>
              </View>
            </View>
            <View style={styles.cardInfo}>
              <ThemedText style={[styles.cardTitle, { color: c.text }]} numberOfLines={1}>{item.title}</ThemedText>
              <ThemedText style={[styles.cardSub, { color: c.textTertiary }]} numberOfLines={1}>{item.track}</ThemedText>
              <ThemedText style={[styles.cardMeta, { color: c.textSecondary }]}>Winner: {item.winner}</ThemedText>
            </View>
          </Pressable>
        )}
      />

      {/* Block C: Driver Spotlights */}
      <ContentRail
        title="Driver Spotlights"
        data={DRIVER_SPOTLIGHTS}
        keyExtractor={(item) => item.id}
        itemWidth={160}
        renderItem={(item: DriverSpotlight, c) => (
          <Pressable
            style={[styles.driverTile, { backgroundColor: c.backgroundTertiary, borderColor: c.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.driverAvatar, { backgroundColor: item.thumbnailColor }]}>
              <ThemedText style={styles.driverInitials}>
                {item.name.split(' ').map(n => n[0]).join('')}
              </ThemedText>
            </View>
            <ThemedText style={[styles.driverName, { color: c.text }]} numberOfLines={1}>{item.name}</ThemedText>
            <ThemedText style={[styles.driverTeam, { color: c.textTertiary }]}>{item.team}</ThemedText>
            <ThemedText style={[styles.driverPoints, { color: c.textSecondary }]}>P{item.position} • {item.points} pts</ThemedText>
          </Pressable>
        )}
      />

      {/* Block D: Team Profiles */}
      <ContentRail
        title="Team Profiles"
        data={TEAM_PROFILES}
        keyExtractor={(item) => item.id}
        itemWidth={160}
        renderItem={(item: TeamProfile, c) => (
          <Pressable
            style={[styles.teamTile, { backgroundColor: c.backgroundTertiary, borderColor: c.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.teamAvatar, { backgroundColor: item.thumbnailColor }]}>
              <ThemedText style={styles.teamInitials}>
                {item.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </ThemedText>
            </View>
            <ThemedText style={[styles.teamName, { color: c.text }]} numberOfLines={1}>{item.name}</ThemedText>
            <ThemedText style={[styles.teamMeta, { color: c.textTertiary }]}>{item.drivers} drivers</ThemedText>
            <ThemedText style={[styles.teamWins, { color: c.textSecondary }]}>{item.wins} wins</ThemedText>
          </Pressable>
        )}
      />

      {/* Block E: Technique Videos */}
      <ContentRail
        title="Technique Videos"
        data={TECHNIQUE_VIDEOS}
        keyExtractor={(item) => item.id}
        itemWidth={160}
        renderItem={(item: TechniqueVideo, c) => (
          <Pressable
            style={[styles.card, { backgroundColor: c.backgroundTertiary, borderColor: c.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.thumbnail, { backgroundColor: item.thumbnailColor }]}>
              <IconSymbol name="play.fill" size={14} color="#fff" />
              <View style={styles.difficultyBadge}>
                <ThemedText style={styles.difficultyText}>{item.difficulty.toUpperCase()}</ThemedText>
              </View>
            </View>
            <View style={styles.cardInfo}>
              <ThemedText style={[styles.cardTitle, { color: c.text }]} numberOfLines={1}>{item.title}</ThemedText>
              <ThemedText style={[styles.cardSub, { color: c.textTertiary }]} numberOfLines={1}>{item.instructor}</ThemedText>
              <ThemedText style={[styles.cardMeta, { color: c.textTertiary }]}>{item.duration}</ThemedText>
            </View>
          </Pressable>
        )}
      />

      {/* Block F: Championship Standings */}
      <ContentRail
        title="Championship Standings"
        data={CHAMPIONSHIP_STANDINGS}
        keyExtractor={(item) => item.id}
        itemWidth={160}
        renderItem={(item: ChampionshipStanding, c) => (
          <Pressable
            style={[styles.standingTile, { backgroundColor: c.backgroundTertiary, borderColor: c.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.standingAvatar, { backgroundColor: item.thumbnailColor }]}>
              <ThemedText style={styles.standingInitials}>
                {item.driverName.split(' ').map(n => n[0]).join('')}
              </ThemedText>
            </View>
            <ThemedText style={[styles.standingName, { color: c.text }]} numberOfLines={1}>{item.driverName}</ThemedText>
            <ThemedText style={[styles.standingTeam, { color: c.textTertiary }]}>{item.team}</ThemedText>
            <ThemedText style={[styles.standingPoints, { color: c.textSecondary }]}>{item.points} pts</ThemedText>
          </Pressable>
        )}
      />

      {/* Block G: Upcoming Events */}
      <ContentRail
        title="Upcoming Events"
        data={UPCOMING_EVENTS}
        keyExtractor={(item) => item.id}
        itemWidth={160}
        renderItem={(item: UpcomingEvent, c) => (
          <Pressable
            style={[styles.eventCard, { backgroundColor: item.thumbnailColor }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={styles.eventBadge}>
              <ThemedText style={styles.eventBadgeText}>{item.type.toUpperCase()}</ThemedText>
            </View>
            <View style={styles.eventBottom}>
              <ThemedText style={[styles.eventTitle, { color: item.thumbnailColor === '#FFFFFF' ? '#000' : '#fff' }]} numberOfLines={1}>{item.title}</ThemedText>
              <ThemedText style={[styles.eventMeta, { color: item.thumbnailColor === '#FFFFFF' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }]}>{item.track} • {item.date}</ThemedText>
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

  // Generic cards (races, technique)
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumbnail: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    padding: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardSub: {
    fontSize: 11,
    marginTop: 2,
  },
  cardMeta: {
    fontSize: 10,
    marginTop: 2,
  },

  // Duration badge
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  durationText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },

  // Difficulty badge
  difficultyBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  difficultyText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },

  // Driver tiles
  driverTile: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  driverInitials: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  driverName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  driverTeam: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  driverPoints: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },

  // Team tiles
  teamTile: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  teamAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamInitials: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  teamName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  teamMeta: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  teamWins: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },

  // Standing tiles
  standingTile: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  standingAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  standingInitials: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  standingName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  standingTeam: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  standingPoints: {
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
  },
  eventMeta: {
    fontSize: 10,
    marginTop: 2,
  },
});
