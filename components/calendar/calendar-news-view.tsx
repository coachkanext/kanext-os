/**
 * Calendar News View — Video-first vertical scroll
 * Each item: large thumbnail, headline, date, category tag pill
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { NEWS_POSTS, getNewsBadgeColor, getNewsCategoryColor, type NewsCategoryTag } from '@/data/mock-calendar-v2';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function CalendarNewsView({ colors, accent }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {NEWS_POSTS.map((post) => (
        <Pressable key={post.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Thumbnail placeholder (16:9) */}
          <View style={styles.thumbnail}>
            <LinearGradient
              colors={['#1a1a2e', '#16213e']}
              style={styles.thumbnailGradient}
            >
              <IconSymbol name="play.circle.fill" size={40} color="rgba(255,255,255,0.5)" />
            </LinearGradient>
          </View>

          {/* Content */}
          <View style={styles.cardContent}>
            {/* Category + badge row */}
            <View style={styles.tagRow}>
              {post.category && (
                <View style={[styles.categoryPill, { backgroundColor: getNewsCategoryColor(post.category) + '22' }]}>
                  <ThemedText style={[styles.categoryText, { color: getNewsCategoryColor(post.category) }]}>
                    {post.category}
                  </ThemedText>
                </View>
              )}
              {post.badge !== 'none' && (
                <View style={[styles.badgePill, { backgroundColor: getNewsBadgeColor(post.badge) + '22' }]}>
                  <ThemedText style={[styles.badgeText, { color: getNewsBadgeColor(post.badge) }]}>
                    {post.badge === 'action-required' ? 'Action Required' : post.badge === 'alert' ? 'Alert' : 'Info'}
                  </ThemedText>
                </View>
              )}
            </View>

            <ThemedText style={[styles.headline, { color: colors.text }]}>{post.title}</ThemedText>
            <ThemedText style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={2}>
              {post.summary}
            </ThemedText>
            <ThemedText style={[styles.meta, { color: colors.textSecondary }]}>
              {post.source} · {post.timestamp}
            </ThemedText>
          </View>
        </Pressable>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  card: { borderRadius: 12, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  thumbnail: { width: '100%', aspectRatio: 16 / 9 },
  thumbnailGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: { padding: 14 },
  tagRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  categoryPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  categoryText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  badgePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  headline: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  summary: { fontSize: 12, lineHeight: 18, marginBottom: 6 },
  meta: { fontSize: 10 },
});
