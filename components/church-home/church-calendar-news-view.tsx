/**
 * Church Calendar — News View
 * Video-first vertical scroll with category pill filters.
 * Categories: All | Sermon | Testimony | Ministry | Announcement | Outreach | Worship
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { CHURCH_NEWS, type ChurchNewsItem } from '@/data/mock-church-home';
import { openLeaderCard } from '@/utils/global-entity-sheets';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

const CATEGORIES = ['All', 'Sermon', 'Testimony', 'Ministry', 'Announcement', 'Outreach', 'Worship'] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

function getCategoryColor(cat: ChurchNewsItem['category']): string {
  switch (cat) {
    case 'sermon': return '#1D9BF0';
    case 'testimony': return '#22C55E';
    case 'ministry_highlight': return '#1D9BF0';
    case 'announcement': return '#F59E0B';
    case 'outreach': return '#1D9BF0';
    case 'worship': return '#1D9BF0';
    default: return '#A1A1AA';
  }
}

function getCategoryLabel(cat: ChurchNewsItem['category']): string {
  switch (cat) {
    case 'sermon': return 'Sermon';
    case 'testimony': return 'Testimony';
    case 'ministry_highlight': return 'Ministry';
    case 'announcement': return 'Announcement';
    case 'outreach': return 'Outreach';
    case 'worship': return 'Worship';
    default: return cat;
  }
}

function filterMatchesCategory(filter: CategoryFilter, cat: ChurchNewsItem['category']): boolean {
  if (filter === 'All') return true;
  if (filter === 'Ministry') return cat === 'ministry_highlight';
  return cat === filter.toLowerCase();
}

export function ChurchCalendarNewsView({ colors, accent }: Props) {
  const [activeCat, setActiveCat] = useState<CategoryFilter>('All');

  const filtered = useMemo(() => {
    if (activeCat === 'All') return CHURCH_NEWS;
    return CHURCH_NEWS.filter((n) => filterMatchesCategory(activeCat, n.category));
  }, [activeCat]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Category Pills */}
      <View style={styles.pillWrap}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            style={[
              styles.catPill,
              activeCat === cat
                ? { backgroundColor: accent }
                : { backgroundColor: '#2F3336' },
            ]}
            onPress={() => setActiveCat(cat)}
          >
            <ThemedText
              style={[
                styles.catPillText,
                { color: activeCat === cat ? '#000' : colors.textSecondary },
              ]}
            >
              {cat}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* News Cards */}
      {filtered.map((post) => {
        const catColor = getCategoryColor(post.category);
        return (
          <Pressable
            key={post.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {/* Thumbnail */}
            {post.isVideo ? (
              <View style={styles.thumbnail}>
                <LinearGradient colors={['#0B0F14', '#0B0F14']} style={styles.thumbnailGradient}>
                  <IconSymbol name="play.circle.fill" size={40} color="rgba(255,255,255,0.5)" />
                </LinearGradient>
                {post.duration && (
                  <View style={styles.durationBadge}>
                    <ThemedText style={styles.durationText}>{post.duration}</ThemedText>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.thumbnailPlaceholder}>
                <LinearGradient colors={['#0B0F14', '#0B0F14']} style={styles.thumbnailGradient}>
                  <IconSymbol name="doc.text.fill" size={28} color="rgba(255,255,255,0.3)" />
                </LinearGradient>
              </View>
            )}

            {/* Content */}
            <View style={styles.cardContent}>
              <View style={[styles.categoryBadge, { backgroundColor: catColor + '22' }]}>
                <ThemedText style={[styles.categoryText, { color: catColor }]}>
                  {getCategoryLabel(post.category)}
                </ThemedText>
              </View>
              <ThemedText style={[styles.headline, { color: colors.text }]}>{post.title}</ThemedText>
              <View style={styles.dateRow}>
                <ThemedText style={[styles.date, { color: colors.textSecondary }]}>
                  {post.date}
                </ThemedText>
                {post.speaker && (
                  <Pressable
                    onPress={() => openLeaderCard({ name: post.speaker!, title: '' })}
                    hitSlop={6}
                  >
                    <ThemedText style={[styles.speakerLink, { color: accent }]}>
                      {post.speaker}
                    </ThemedText>
                  </Pressable>
                )}
              </View>
            </View>
          </Pressable>
        );
      })}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  catPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  catPillText: { fontSize: 12, fontWeight: '600' },
  card: { borderRadius: 12, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  thumbnail: { width: '100%', aspectRatio: 16 / 9 },
  thumbnailPlaceholder: { width: '100%', aspectRatio: 21 / 9 },
  thumbnailGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardContent: { padding: 14 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginBottom: 6 },
  categoryText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  headline: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  date: { fontSize: 11 },
  speakerLink: { fontSize: 11, fontWeight: '600' },
  durationBadge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  durationText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
