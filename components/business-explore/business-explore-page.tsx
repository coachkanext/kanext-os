/**
 * BusinessExplorePage — Company YouTube discovery homepage for business content.
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
  FEATURED_CONTENT,
  TRENDING_COMPANIES,
  LATEST_PRESENTATIONS,
  TRAINING_MODULES,
  INVESTOR_UPDATES,
  INDUSTRY_NEWS,
  WEBINARS_EVENTS,
  EXPLORE_FILTERS,
  type TrendingCompany,
  type Presentation,
  type TrainingModule,
  type InvestorUpdate,
  type IndustryNewsItem,
  type WebinarEvent,
  type BusinessScope,
} from '@/data/mock-business-explore';

export function BusinessExplorePage() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeScope, setActiveScope] = useState<BusinessScope>('All');

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
          placeholder="Search companies, training, news..."
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

      {/* Block A: Featured Content */}
      <HeroFeatureCard
        title={FEATURED_CONTENT.title}
        subtitle={FEATURED_CONTENT.subtitle}
        hookText={FEATURED_CONTENT.hookText}
        badgeText={FEATURED_CONTENT.badgeText}
        ctaLabel={FEATURED_CONTENT.ctaLabel}
        thumbnailColor={FEATURED_CONTENT.thumbnailColor}
      />

      {/* Block B: Trending Companies */}
      <ContentRail
        title="Trending Companies"
        data={TRENDING_COMPANIES}
        keyExtractor={(item) => item.id}
        itemWidth={160}
        renderItem={(item: TrendingCompany, c) => (
          <Pressable
            style={[styles.companyTile, { backgroundColor: c.backgroundTertiary, borderColor: c.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.companyAvatar, { backgroundColor: item.thumbnailColor }]}>
              <ThemedText style={[styles.companyInitials, { color: item.thumbnailColor === '#FFFFFF' ? '#000' : '#fff' }]}>
                {item.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </ThemedText>
            </View>
            <ThemedText style={[styles.companyName, { color: c.text }]} numberOfLines={1}>{item.name}</ThemedText>
            <ThemedText style={[styles.companyIndustry, { color: c.textTertiary }]}>{item.industry}</ThemedText>
            <ThemedText style={[styles.companySize, { color: c.textSecondary }]}>{item.employeeCount} employees</ThemedText>
          </Pressable>
        )}
      />

      {/* Block C: Latest Presentations */}
      <ContentRail
        title="Latest Presentations"
        data={LATEST_PRESENTATIONS}
        keyExtractor={(item) => item.id}
        itemWidth={160}
        renderItem={(item: Presentation, c) => (
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
              <ThemedText style={[styles.cardSub, { color: c.textTertiary }]} numberOfLines={1}>{item.presenter}</ThemedText>
              <ThemedText style={[styles.cardMeta, { color: c.textTertiary }]}>{item.company} • {item.date}</ThemedText>
            </View>
          </Pressable>
        )}
      />

      {/* Block D: Training Modules */}
      <ContentRail
        title="Training Modules"
        data={TRAINING_MODULES}
        keyExtractor={(item) => item.id}
        itemWidth={160}
        renderItem={(item: TrainingModule, c) => (
          <Pressable
            style={[styles.card, { backgroundColor: c.backgroundTertiary, borderColor: c.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.thumbnail, { backgroundColor: item.thumbnailColor }]}>
              <IconSymbol name="play.fill" size={14} color={item.thumbnailColor === '#FFFFFF' ? '#000' : '#fff'} />
              <View style={styles.categoryBadge}>
                <ThemedText style={styles.categoryBadgeText}>{item.category.toUpperCase()}</ThemedText>
              </View>
            </View>
            <View style={styles.cardInfo}>
              <ThemedText style={[styles.cardTitle, { color: c.text }]} numberOfLines={1}>{item.title}</ThemedText>
              <ThemedText style={[styles.cardSub, { color: c.textTertiary }]}>{item.duration}</ThemedText>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${item.completionRate * 100}%` }]} />
              </View>
              <ThemedText style={[styles.progressText, { color: c.textTertiary }]}>{Math.round(item.completionRate * 100)}% complete</ThemedText>
            </View>
          </Pressable>
        )}
      />

      {/* Block E: Investor Updates */}
      <ContentRail
        title="Investor Updates"
        data={INVESTOR_UPDATES}
        keyExtractor={(item) => item.id}
        itemWidth={160}
        renderItem={(item: InvestorUpdate, c) => (
          <Pressable
            style={[styles.card, { backgroundColor: c.backgroundTertiary, borderColor: c.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.thumbnail, { backgroundColor: item.thumbnailColor }]}>
              <IconSymbol name="chart.line.uptrend.xyaxis" size={18} color={item.thumbnailColor === '#FFFFFF' ? '#000' : '#fff'} />
            </View>
            <View style={styles.cardInfo}>
              <ThemedText style={[styles.cardTitle, { color: c.text }]} numberOfLines={1}>{item.title}</ThemedText>
              <ThemedText style={[styles.cardSub, { color: c.textTertiary }]}>{item.company}</ThemedText>
              <ThemedText style={[styles.cardMeta, { color: c.textTertiary }]}>{item.quarter} • {item.date}</ThemedText>
            </View>
          </Pressable>
        )}
      />

      {/* Block F: Industry News */}
      <ContentRail
        title="Industry News"
        data={INDUSTRY_NEWS}
        keyExtractor={(item) => item.id}
        itemWidth={160}
        renderItem={(item: IndustryNewsItem, c) => (
          <Pressable
            style={[styles.card, { backgroundColor: c.backgroundTertiary, borderColor: c.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.thumbnail, { backgroundColor: item.thumbnailColor }]}>
              <IconSymbol name="newspaper.fill" size={18} color={item.thumbnailColor === '#FFFFFF' ? '#000' : '#fff'} />
            </View>
            <View style={styles.cardInfo}>
              <ThemedText style={[styles.cardTitle, { color: c.text }]} numberOfLines={2}>{item.title}</ThemedText>
              <ThemedText style={[styles.cardSub, { color: c.textTertiary }]}>{item.source} • {item.date}</ThemedText>
            </View>
          </Pressable>
        )}
      />

      {/* Block G: Webinars & Events */}
      <ContentRail
        title="Webinars & Events"
        data={WEBINARS_EVENTS}
        keyExtractor={(item) => item.id}
        itemWidth={160}
        renderItem={(item: WebinarEvent, c) => (
          <Pressable
            style={[styles.eventCard, { backgroundColor: item.thumbnailColor }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={styles.eventBadge}>
              <ThemedText style={styles.eventBadgeText}>{item.status.toUpperCase()}</ThemedText>
            </View>
            <View style={styles.eventBottom}>
              <ThemedText style={[styles.eventTitle, { color: item.thumbnailColor === '#FFFFFF' ? '#000' : '#fff' }]} numberOfLines={1}>{item.title}</ThemedText>
              <ThemedText style={[styles.eventMeta, { color: item.thumbnailColor === '#FFFFFF' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }]}>{item.speaker} • {item.date}</ThemedText>
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

  // Company tiles
  companyTile: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  companyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  companyInitials: {
    fontSize: 14,
    fontWeight: '800',
  },
  companyName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  companyIndustry: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  companySize: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },

  // Generic cards (presentations, training, investor, news)
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

  // Category badge
  categoryBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  categoryBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },

  // Progress bar (training modules)
  progressBarBg: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginTop: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 9,
    marginTop: 3,
  },

  // Event cards (webinars)
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
