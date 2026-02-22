/**
 * Biz Calendar News View — Video-first vertical scroll with category pills.
 * Category filters: All | Product | Founder | Press | Investor | Partnership
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { BIZ_NEWS, type BizNewsItem } from '@/data/mock-business-home';

const CATEGORY_COLORS: Record<BizNewsItem['category'], string> = {
  product: '#1D9BF0',
  founder: '#F59E0B',
  press: '#EF4444',
  investor: '#22C55E',
  partnership: '#1D9BF0',
};

const CATEGORY_PILLS = ['All', 'Product', 'Founder', 'Press', 'Investor', 'Partnership'] as const;
type CategoryFilter = (typeof CATEGORY_PILLS)[number];

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function BizCalendarNewsView({ colors, accent }: Props) {
  const [filter, setFilter] = useState<CategoryFilter>('All');

  const filtered = useMemo(() => {
    if (filter === 'All') return BIZ_NEWS;
    return BIZ_NEWS.filter((n) => n.category.toLowerCase() === filter.toLowerCase());
  }, [filter]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Category Pills */}
      <View style={styles.filterRow}>
        {CATEGORY_PILLS.map((pill) => {
          const isActive = filter === pill;
          return (
            <Pressable
              key={pill}
              style={[styles.filterPill, isActive && { backgroundColor: accent }]}
              onPress={() => setFilter(pill)}
            >
              <ThemedText style={[styles.filterText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {pill}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* News Cards */}
      {filtered.map((item) => {
        const catColor = CATEGORY_COLORS[item.category];
        const isVideo = item.type === 'video';
        return (
          <Pressable key={item.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Thumbnail (16:9) */}
            <View style={styles.thumbnail}>
              <LinearGradient
                colors={[item.thumbnailColor ?? '#0B0F14', '#0B0F14']}
                style={styles.thumbnailGradient}
              >
                {isVideo && (
                  <IconSymbol name="play.circle.fill" size={40} color="rgba(255,255,255,0.5)" />
                )}
              </LinearGradient>
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
              {/* Category badge */}
              <View style={[styles.categoryBadge, { backgroundColor: catColor + '22' }]}>
                <ThemedText style={[styles.categoryText, { color: catColor }]}>
                  {item.category.toUpperCase()}
                </ThemedText>
              </View>

              <ThemedText style={[styles.headline, { color: colors.text }]}>{item.headline}</ThemedText>
              <ThemedText style={[styles.meta, { color: colors.textSecondary }]}>
                {item.date}
                {item.speaker ? ` · ${item.speaker}` : ''}
                {item.duration ? ` · ${item.duration}` : ''}
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
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  filterPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#2F3336' },
  filterText: { fontSize: 12, fontWeight: '600' },
  card: { borderRadius: 12, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  thumbnail: { width: '100%', aspectRatio: 16 / 9 },
  thumbnailGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardContent: { padding: 14 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginBottom: 8 },
  categoryText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  headline: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  meta: { fontSize: 10 },
});
