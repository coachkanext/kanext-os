/**
 * EducationExplorePage — School discovery homepage for education mode.
 * Search bar, filter chips, 7 horizontal carousels.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ContentRail } from '@/components/sports-explore/content-rail';
import { HeroFeatureCard } from '@/components/sports-explore/hero-feature-card';
import { SchoolCard } from '@/components/education-explore/school-card';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  FEATURED_SCHOOL,
  SCHOOLS_FOR_YOU,
  TRENDING_NOW,
  UPCOMING_EVENTS,
  TOP_PROGRAMS,
  CAMPUS_LIFE,
  ADMISSIONS_SPOTLIGHT,
  EDUCATION_SCOPE_OPTIONS,
  type SchoolCard as SchoolCardType,
  type TrendingItem,
  type EducationEvent,
  type ProgramTile,
  type CampusCard,
  type AdmissionsSpotlight,
  type EducationScope,
} from '@/data/mock-education-explore';

export function EducationExplorePage() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeScope, setActiveScope] = useState<EducationScope>('All Schools');

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
          placeholder="Search schools, programs, events..."
          placeholderTextColor={colors.textTertiary}
          editable={false}
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.chipRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {EDUCATION_SCOPE_OPTIONS.map((scope) => (
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

      {/* Block A: Featured School */}
      <HeroFeatureCard
        title={FEATURED_SCHOOL.name}
        subtitle={FEATURED_SCHOOL.type}
        hookText={FEATURED_SCHOOL.tagline}
        badgeText="FEATURED"
        ctaLabel="Explore"
        thumbnailColor={FEATURED_SCHOOL.thumbnailColor}
      />

      {/* Block B: Schools For You */}
      <ContentRail
        title="Schools For You"
        data={SCHOOLS_FOR_YOU}
        keyExtractor={(item) => item.id}
        itemWidth={150}
        renderItem={(item: SchoolCardType, c) => (
          <SchoolCard
            initials={item.initials}
            name={item.name}
            location={item.location}
            type={item.type}
            badges={item.badges}
            thumbnailColor={item.thumbnailColor}
            colors={c}
          />
        )}
      />

      {/* Block C: Trending Now */}
      <ContentRail
        title="Trending Now"
        data={TRENDING_NOW}
        keyExtractor={(item) => item.id}
        itemWidth={220}
        renderItem={(item: TrendingItem, c) => (
          <Pressable
            style={[styles.trendingCard, { backgroundColor: c.backgroundTertiary, borderColor: c.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.trendingIcon, { backgroundColor: item.thumbnailColor + '20' }]}>
              <IconSymbol
                name={item.type === 'event' ? 'calendar' : item.type === 'announcement' ? 'megaphone.fill' : 'star.fill'}
                size={16}
                color={item.thumbnailColor}
              />
            </View>
            <View style={styles.trendingInfo}>
              <ThemedText style={[styles.trendingBadge, { color: item.thumbnailColor }]}>
                {item.type.toUpperCase()}
              </ThemedText>
              <ThemedText style={[styles.trendingTitle, { color: c.text }]} numberOfLines={1}>{item.title}</ThemedText>
              <ThemedText style={[styles.trendingSub, { color: c.textTertiary }]} numberOfLines={1}>{item.subtitle}</ThemedText>
            </View>
          </Pressable>
        )}
      />

      {/* Block D: Upcoming Events */}
      <ContentRail
        title="Upcoming Events"
        data={UPCOMING_EVENTS}
        keyExtractor={(item) => item.id}
        itemWidth={200}
        renderItem={(item: EducationEvent, c) => (
          <Pressable
            style={[styles.eventCard, { backgroundColor: item.thumbnailColor }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={styles.eventBadge}>
              <ThemedText style={styles.eventBadgeText}>{item.type.replace('-', ' ').toUpperCase()}</ThemedText>
            </View>
            <View style={styles.eventBottom}>
              <ThemedText style={styles.eventTitle} numberOfLines={1}>{item.title}</ThemedText>
              <ThemedText style={styles.eventMeta}>{item.date} • {item.location}</ThemedText>
            </View>
          </Pressable>
        )}
      />

      {/* Block E: Top Programs */}
      <ContentRail
        title="Top Programs"
        data={TOP_PROGRAMS}
        keyExtractor={(item) => item.id}
        itemWidth={150}
        renderItem={(item: ProgramTile, c) => (
          <Pressable
            style={[styles.programTile, { backgroundColor: c.backgroundTertiary, borderColor: c.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.programIcon, { backgroundColor: item.thumbnailColor + '20' }]}>
              <IconSymbol name="book.fill" size={20} color={item.thumbnailColor} />
            </View>
            <ThemedText style={[styles.programName, { color: c.text }]} numberOfLines={1}>{item.name}</ThemedText>
            <ThemedText style={[styles.programCategory, { color: c.textTertiary }]}>{item.category}</ThemedText>
            <ThemedText style={[styles.programSchools, { color: c.textSecondary }]}>{item.schoolCount} schools</ThemedText>
          </Pressable>
        )}
      />

      {/* Block F: Campus Life */}
      <ContentRail
        title="Campus Life"
        data={CAMPUS_LIFE}
        keyExtractor={(item) => item.id}
        itemWidth={200}
        renderItem={(item: CampusCard, c) => (
          <Pressable
            style={[styles.campusCard, { backgroundColor: item.thumbnailColor }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={styles.campusBadge}>
              <ThemedText style={styles.campusBadgeText}>{item.category.toUpperCase()}</ThemedText>
            </View>
            <View style={styles.campusBottom}>
              <ThemedText style={styles.campusTitle} numberOfLines={1}>{item.title}</ThemedText>
              <ThemedText style={styles.campusSchool}>{item.schoolName}</ThemedText>
            </View>
          </Pressable>
        )}
      />

      {/* Block G: Admissions */}
      <ContentRail
        title="Admissions"
        data={ADMISSIONS_SPOTLIGHT}
        keyExtractor={(item) => item.id}
        itemWidth={200}
        renderItem={(item: AdmissionsSpotlight, c) => (
          <Pressable
            style={[styles.admCard, { backgroundColor: c.backgroundTertiary, borderColor: c.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.admAvatar, { backgroundColor: item.thumbnailColor }]}>
              <ThemedText style={styles.admInitials}>{item.initials}</ThemedText>
            </View>
            <ThemedText style={[styles.admName, { color: c.text }]} numberOfLines={1}>{item.schoolName}</ThemedText>
            <ThemedText style={[styles.admLocation, { color: c.textTertiary }]}>{item.location}</ThemedText>
            <View style={styles.admStats}>
              <View style={styles.admStatItem}>
                <ThemedText style={[styles.admStatValue, { color: c.text }]}>{item.acceptanceRate}</ThemedText>
                <ThemedText style={[styles.admStatLabel, { color: c.textTertiary }]}>Acceptance</ThemedText>
              </View>
              <View style={styles.admStatItem}>
                <ThemedText style={[styles.admStatValue, { color: c.text }]}>{item.avgAid}</ThemedText>
                <ThemedText style={[styles.admStatLabel, { color: c.textTertiary }]}>Avg Aid</ThemedText>
              </View>
            </View>
            <View style={styles.admCtas}>
              {item.ctas.map((cta, i) => (
                <View key={i} style={[styles.admCtaBtn, { backgroundColor: i === 0 ? '#fff' : c.card, borderColor: c.border }]}>
                  <ThemedText style={[styles.admCtaText, { color: i === 0 ? '#000' : c.textSecondary }]}>{cta}</ThemedText>
                </View>
              ))}
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

  // Trending cards
  trendingCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 10,
    gap: 10,
    alignItems: 'center',
  },
  trendingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingInfo: {
    flex: 1,
  },
  trendingBadge: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  trendingTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  trendingSub: {
    fontSize: 11,
    marginTop: 1,
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

  // Program tiles
  programTile: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  programIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  programName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  programCategory: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  programSchools: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },

  // Campus cards
  campusCard: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    height: 100,
    justifyContent: 'flex-end',
  },
  campusBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  campusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  campusBottom: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  campusTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  campusSchool: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },

  // Admissions
  admCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  admAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  admInitials: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  admName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  admLocation: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  admStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  admStatItem: {
    alignItems: 'center',
  },
  admStatValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  admStatLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 1,
  },
  admCtas: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  admCtaBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
  },
  admCtaText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
