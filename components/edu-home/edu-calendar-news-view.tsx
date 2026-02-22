/**
 * Education Calendar News View
 * Video-first vertical scroll with category filter pills and play icons.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import {
  EDU_NEWS,
  EDU_NEWS_CATEGORY_COLORS,
  type EduNewsCategoryTag,
} from '@/data/mock-education-home';

const CATEGORY_PILLS: { id: EduNewsCategoryTag | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'campus', label: 'Campus' },
  { id: 'student', label: 'Student' },
  { id: 'faculty', label: 'Faculty' },
  { id: 'alumni', label: 'Alumni' },
  { id: 'athletics', label: 'Athletics' },
  { id: 'institutional', label: 'Institutional' },
];

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function EduCalendarNewsView({ colors, accent }: Props) {
  const [activeCategory, setActiveCategory] = useState<EduNewsCategoryTag | 'all'>('all');

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return EDU_NEWS;
    return EDU_NEWS.filter((n) => n.category === activeCategory);
  }, [activeCategory]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Category pills */}
      <View style={styles.categoryBar}>
        {CATEGORY_PILLS.map((pill) => {
          const isActive = activeCategory === pill.id;
          return (
            <Pressable
              key={pill.id}
              style={[styles.categoryPill, isActive && { backgroundColor: accent }]}
              onPress={() => setActiveCategory(pill.id)}
            >
              <ThemedText
                style={[
                  styles.categoryPillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {pill.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* News cards */}
      {filtered.map((item) => {
        const catColor = EDU_NEWS_CATEGORY_COLORS[item.category];
        return (
          <Pressable
            key={item.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {/* Thumbnail (16:9) */}
            <View style={styles.thumbnail}>
              <LinearGradient
                colors={['#0B0F14', '#0B0F14']}
                style={styles.thumbnailGradient}
              >
                {item.type === 'video' && (
                  <IconSymbol name="play.circle.fill" size={40} color="rgba(255,255,255,0.5)" />
                )}
              </LinearGradient>
              {item.type === 'video' && item.duration && (
                <View style={styles.durationBadge}>
                  <ThemedText style={styles.durationText}>{item.duration}</ThemedText>
                </View>
              )}
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
              <View style={[styles.categoryBadge, { backgroundColor: catColor + '22' }]}>
                <ThemedText style={[styles.categoryBadgeText, { color: catColor }]}>
                  {item.category}
                </ThemedText>
              </View>
              <ThemedText style={[styles.headline, { color: colors.text }]}>{item.headline}</ThemedText>
              <ThemedText style={[styles.date, { color: colors.textSecondary }]}>
                {item.date}
                {item.speaker ? ` · ${item.speaker}` : ''}
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
  categoryBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#2F3336',
  },
  categoryPillText: { fontSize: 12, fontWeight: '600' },
  card: { borderRadius: 12, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  thumbnail: { width: '100%', aspectRatio: 16 / 9 },
  thumbnailGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  cardContent: { padding: 14 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginBottom: 6 },
  categoryBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  headline: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  date: { fontSize: 11 },
});
