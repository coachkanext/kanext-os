/**
 * Competition Calendar — News View
 * Video-first vertical scroll cards with category filter pills.
 * Categories: race_recap | onboard | interview | technical | wildcard
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { COMP_NEWS, COMP_NEWS_CATEGORY_LABELS, type CompNewsItem } from '@/data/mock-competition-home';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

const CATEGORY_COLORS: Record<CompNewsItem['category'], string> = {
  race_recap: '#EF4444',
  onboard: '#3B82F6',
  interview: '#8B5CF6',
  technical: '#F59E0B',
  wildcard: '#22C55E',
};

type FilterCategory = 'all' | CompNewsItem['category'];

const FILTER_PILLS: { key: FilterCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'race_recap', label: COMP_NEWS_CATEGORY_LABELS.race_recap },
  { key: 'onboard', label: COMP_NEWS_CATEGORY_LABELS.onboard },
  { key: 'interview', label: COMP_NEWS_CATEGORY_LABELS.interview },
  { key: 'technical', label: COMP_NEWS_CATEGORY_LABELS.technical },
  { key: 'wildcard', label: COMP_NEWS_CATEGORY_LABELS.wildcard },
];

export function CompCalendarNewsView({ colors, accent }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');

  const filtered = activeFilter === 'all'
    ? COMP_NEWS
    : COMP_NEWS.filter((n) => n.category === activeFilter);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Category Pills */}
      <View style={styles.filterRow}>
        {FILTER_PILLS.map((fp) => (
          <Pressable
            key={fp.key}
            style={[styles.filterPill, activeFilter === fp.key && { backgroundColor: accent }]}
            onPress={() => setActiveFilter(fp.key)}
          >
            <ThemedText style={[styles.filterText, { color: activeFilter === fp.key ? '#000' : colors.textSecondary }]}>
              {fp.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* News Cards */}
      {filtered.map((post) => {
        const catColor = CATEGORY_COLORS[post.category];
        return (
          <Pressable
            key={post.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              // TODO: navigate to news detail
            }}
          >
            {/* Thumbnail placeholder (16:9) */}
            <View style={styles.thumbnail}>
              <LinearGradient
                colors={['#1a1a2e', '#16213e']}
                style={styles.thumbnailGradient}
              >
                {post.isVideo && (
                  <IconSymbol name="play.circle.fill" size={40} color="rgba(255,255,255,0.5)" />
                )}
              </LinearGradient>
              {post.duration && (
                <View style={styles.durationBadge}>
                  <ThemedText style={styles.durationText}>{post.duration}</ThemedText>
                </View>
              )}
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
              {/* Category badge */}
              <View style={[styles.categoryPill, { backgroundColor: catColor + '22' }]}>
                <ThemedText style={[styles.categoryText, { color: catColor }]}>
                  {COMP_NEWS_CATEGORY_LABELS[post.category]}
                </ThemedText>
              </View>

              <ThemedText style={[styles.headline, { color: colors.text }]}>{post.title}</ThemedText>
              <ThemedText style={[styles.meta, { color: colors.textSecondary }]}>
                {post.date}{post.isVideo ? ' · Video' : ' · Article'}
              </ThemedText>
            </View>
          </Pressable>
        );
      })}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  filterText: { fontSize: 11, fontWeight: '600' },
  card: { borderRadius: 12, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  thumbnail: { width: '100%', aspectRatio: 16 / 9, position: 'relative' },
  thumbnailGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  cardContent: { padding: 14 },
  categoryPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 8 },
  categoryText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  headline: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  meta: { fontSize: 10 },
});
