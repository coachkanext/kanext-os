/**
 * ChurchExplorePage — Ministry YouTube discovery homepage for church content.
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
  FEATURED_MINISTRY,
  RECENT_SERMONS,
  WORSHIP_HIGHLIGHTS,
  MINISTRY_SPOTLIGHTS,
  YOUTH_CONTENT,
  BIBLE_STUDIES,
  COMMUNITY_OUTREACH,
  EXPLORE_FILTERS,
  type Sermon,
  type WorshipHighlight,
  type MinistrySpotlight,
  type YouthContent,
  type BibleStudy,
  type CommunityOutreach,
  type ChurchScope,
} from '@/data/mock-church-explore';

export function ChurchExplorePage() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeScope, setActiveScope] = useState<ChurchScope>('All');

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
          placeholder="Search sermons, worship, ministries..."
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

      {/* Block A: Featured Ministry */}
      <HeroFeatureCard
        title={FEATURED_MINISTRY.title}
        subtitle={FEATURED_MINISTRY.subtitle}
        hookText={FEATURED_MINISTRY.hookText}
        badgeText={FEATURED_MINISTRY.badgeText}
        ctaLabel={FEATURED_MINISTRY.ctaLabel}
        thumbnailColor={FEATURED_MINISTRY.thumbnailColor}
      />

      {/* Block B: Recent Sermons */}
      <ContentRail
        title="Recent Sermons"
        data={RECENT_SERMONS}
        keyExtractor={(item) => item.id}
        itemWidth={160}
        renderItem={(item: Sermon, c) => (
          <Pressable
            style={[styles.card, { backgroundColor: c.backgroundTertiary, borderColor: c.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.thumbnail, { backgroundColor: item.thumbnailColor }]}>
              <IconSymbol name="play.fill" size={14} color="#fff" />
              <View style={styles.durationBadge}>
                <ThemedText style={styles.durationText}>{item.duration}</ThemedText>
              </View>
            </View>
            <View style={styles.cardInfo}>
              <ThemedText style={[styles.cardTitle, { color: c.text }]} numberOfLines={1}>{item.title}</ThemedText>
              <ThemedText style={[styles.cardSub, { color: c.textTertiary }]} numberOfLines={1}>{item.speaker}</ThemedText>
              <ThemedText style={[styles.cardMeta, { color: c.textTertiary }]}>{item.date}</ThemedText>
            </View>
          </Pressable>
        )}
      />

      {/* Block C: Worship Highlights */}
      <ContentRail
        title="Worship Highlights"
        data={WORSHIP_HIGHLIGHTS}
        keyExtractor={(item) => item.id}
        itemWidth={160}
        renderItem={(item: WorshipHighlight, c) => (
          <Pressable
            style={[styles.card, { backgroundColor: c.backgroundTertiary, borderColor: c.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.thumbnail, { backgroundColor: item.thumbnailColor }]}>
              <IconSymbol name="play.fill" size={14} color="#fff" />
              <View style={styles.typeBadge}>
                <ThemedText style={styles.typeBadgeText}>{item.type.toUpperCase()}</ThemedText>
              </View>
            </View>
            <View style={styles.cardInfo}>
              <ThemedText style={[styles.cardTitle, { color: c.text }]} numberOfLines={1}>{item.title}</ThemedText>
              <ThemedText style={[styles.cardSub, { color: c.textTertiary }]}>{item.duration} • {item.date}</ThemedText>
            </View>
          </Pressable>
        )}
      />

      {/* Block D: Ministry Spotlights */}
      <ContentRail
        title="Ministry Spotlights"
        data={MINISTRY_SPOTLIGHTS}
        keyExtractor={(item) => item.id}
        itemWidth={160}
        renderItem={(item: MinistrySpotlight, c) => (
          <Pressable
            style={[styles.ministryTile, { backgroundColor: c.backgroundTertiary, borderColor: c.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.ministryAvatar, { backgroundColor: item.thumbnailColor }]}>
              <ThemedText style={styles.ministryInitials}>
                {item.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </ThemedText>
            </View>
            <ThemedText style={[styles.ministryName, { color: c.text }]} numberOfLines={1}>{item.name}</ThemedText>
            <ThemedText style={[styles.ministryDesc, { color: c.textTertiary }]} numberOfLines={1}>{item.description}</ThemedText>
            <ThemedText style={[styles.ministryCount, { color: c.textSecondary }]}>{item.memberCount} members</ThemedText>
          </Pressable>
        )}
      />

      {/* Block E: Youth Content */}
      <ContentRail
        title="Youth Content"
        data={YOUTH_CONTENT}
        keyExtractor={(item) => item.id}
        itemWidth={160}
        renderItem={(item: YouthContent, c) => (
          <Pressable
            style={[styles.card, { backgroundColor: c.backgroundTertiary, borderColor: c.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.thumbnail, { backgroundColor: item.thumbnailColor }]}>
              <IconSymbol name="play.fill" size={14} color="#fff" />
              <View style={styles.typeBadge}>
                <ThemedText style={styles.typeBadgeText}>{item.type.toUpperCase()}</ThemedText>
              </View>
            </View>
            <View style={styles.cardInfo}>
              <ThemedText style={[styles.cardTitle, { color: c.text }]} numberOfLines={1}>{item.title}</ThemedText>
              <ThemedText style={[styles.cardSub, { color: c.textTertiary }]}>{item.duration} • {item.date}</ThemedText>
            </View>
          </Pressable>
        )}
      />

      {/* Block F: Bible Studies */}
      <ContentRail
        title="Bible Studies"
        data={BIBLE_STUDIES}
        keyExtractor={(item) => item.id}
        itemWidth={160}
        renderItem={(item: BibleStudy, c) => (
          <Pressable
            style={[styles.card, { backgroundColor: c.backgroundTertiary, borderColor: c.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.thumbnail, { backgroundColor: item.thumbnailColor }]}>
              <IconSymbol name="book.fill" size={18} color="#fff" />
            </View>
            <View style={styles.cardInfo}>
              <ThemedText style={[styles.cardTitle, { color: c.text }]} numberOfLines={1}>{item.title}</ThemedText>
              <ThemedText style={[styles.cardSub, { color: c.textTertiary }]} numberOfLines={1}>{item.facilitator}</ThemedText>
              <ThemedText style={[styles.cardMeta, { color: c.textTertiary }]}>{item.book}</ThemedText>
            </View>
          </Pressable>
        )}
      />

      {/* Block G: Community Outreach */}
      <ContentRail
        title="Community Outreach"
        data={COMMUNITY_OUTREACH}
        keyExtractor={(item) => item.id}
        itemWidth={160}
        renderItem={(item: CommunityOutreach, c) => (
          <Pressable
            style={[styles.outreachCard, { backgroundColor: item.thumbnailColor }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={styles.outreachBadge}>
              <ThemedText style={styles.outreachBadgeText}>{item.type.toUpperCase()}</ThemedText>
            </View>
            <View style={styles.outreachBottom}>
              <ThemedText style={styles.outreachTitle} numberOfLines={1}>{item.title}</ThemedText>
              <ThemedText style={styles.outreachDate}>{item.date}</ThemedText>
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

  // Generic cards (sermons, worship, youth, bible studies)
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

  // Duration badge on thumbnail
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

  // Type badge on thumbnail
  typeBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  typeBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },

  // Ministry tiles
  ministryTile: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  ministryAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  ministryInitials: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  ministryName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  ministryDesc: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  ministryCount: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },

  // Outreach event cards
  outreachCard: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    height: 100,
    justifyContent: 'flex-end',
  },
  outreachBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  outreachBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  outreachBottom: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  outreachTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  outreachDate: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
});
