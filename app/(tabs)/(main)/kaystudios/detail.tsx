/**
 * KayStudios — Content Detail Page
 * Metadata, launch button (Resume/Play/Begin/etc.), save action, reviews, related.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import {
  getContentById, getRelatedContent, getReviews, getLaunchLabel,
  type StudioContent, type Review,
} from '@/data/mock-kaystudios';
import {
  isItemSaved, saveItem, unsaveItem, getProgress, clearProgress,
  type ProgressEntry,
} from '@/utils/studios-progress';

const BACKDROP_H = 260;
const RELATED_W = 110;
const RELATED_H = 80;

// ── Stars ───────────────────────────────────────────────────────────────────

function Stars({ rating, C }: { rating: number; C: ComponentColors }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(i => (
        <IconSymbol
          key={i}
          name={i <= Math.round(rating) ? 'star.fill' : 'star'}
          size={12}
          color={i <= Math.round(rating) ? C.accent : C.muted}
        />
      ))}
      <Text style={[styles.ratingNum, { color: C.secondary }]}>{rating.toFixed(1)}</Text>
    </View>
  );
}

// ── Review Row ──────────────────────────────────────────────────────────────

function ReviewRow({ review, C }: { review: Review; C: ComponentColors }) {
  return (
    <View style={[styles.reviewRow, { borderBottomColor: C.separator }]}>
      <View style={[styles.reviewAvatar, { backgroundColor: C.surface }]}>
        <Text style={[styles.reviewInitials, { color: C.label }]}>{review.initials}</Text>
      </View>
      <View style={styles.reviewBody}>
        <View style={styles.reviewHeader}>
          <Text style={[styles.reviewAuthor, { color: C.label }]}>{review.author}</Text>
          <Text style={[styles.reviewTime, { color: C.muted }]}>{review.timeAgo}</Text>
        </View>
        <Stars rating={review.rating} C={C} />
        <Text style={[styles.reviewText, { color: C.secondary }]}>{review.text}</Text>
      </View>
    </View>
  );
}

// ── Related Card ────────────────────────────────────────────────────────────

function RelatedCard({ item, C, onPress }: { item: StudioContent; C: ComponentColors; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.relatedCard, { opacity: pressed ? 0.88 : 1 }]}>
      <View style={[styles.relatedThumb, { backgroundColor: `hsl(${item.thumbHue},42%,26%)` }]}>
        <Text style={styles.relatedEmoji}>{item.thumbEmoji}</Text>
      </View>
      <Text style={[styles.relatedTitle, { color: C.label }]} numberOfLines={2}>{item.title}</Text>
    </Pressable>
  );
}

// ── Detail Screen ────────────────────────────────────────────────────────────

export default function DetailScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { contentId } = useLocalSearchParams<{ contentId: string }>();
  const [saved, setSaved] = useState(false);
  const [progress, setProgress] = useState<ProgressEntry | null>(null);

  const item = useMemo(() => getContentById(contentId ?? ''), [contentId]);
  const related = useMemo(() => item ? getRelatedContent(item.id) : [], [item]);
  const reviews = useMemo(() => getReviews(), []);

  useEffect(() => {
    if (!contentId) return;
    isItemSaved(contentId).then(setSaved);
    getProgress(contentId).then(setProgress);
  }, [contentId]);

  const handleSaveToggle = useCallback(async () => {
    if (!contentId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (saved) {
      await unsaveItem(contentId);
      setSaved(false);
    } else {
      await saveItem(contentId);
      setSaved(true);
    }
  }, [contentId, saved]);

  const handleLaunch = useCallback(() => {
    if (!item) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/(tabs)/(main)/kaystudios/experience' as any,
      params: { contentId: item.id },
    });
  }, [item, router]);

  const handleRestart = useCallback(async () => {
    if (!contentId || !item) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await clearProgress(contentId);
    setProgress(null);
    router.push({
      pathname: '/(tabs)/(main)/kaystudios/experience' as any,
      params: { contentId: item.id },
    });
  }, [contentId, item, router]);

  if (!item) {
    return (
      <View style={[styles.notFound, { backgroundColor: C.bg }]}>
        <Text style={[styles.notFoundText, { color: C.secondary }]}>Content not found</Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={[styles.notFoundBack, { color: C.accent }]}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const launchLabel = getLaunchLabel(item.type);
  const hasProgress = progress && progress.progress > 0 && !progress.completed;
  const isCompleted = progress?.completed;

  return (
    <View style={[styles.screen, { backgroundColor: C.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── Backdrop ── */}
        <View style={[styles.backdrop, { height: BACKDROP_H + insets.top }]}>
          <View style={[styles.backdropBg, { backgroundColor: `hsl(${item.thumbHue},42%,22%)` }]}>
            <Text style={styles.backdropEmoji}>{item.thumbEmoji}</Text>
          </View>
          <Pressable
            style={[styles.backBtn, { top: insets.top + 12 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
            hitSlop={12}
          >
            <View style={styles.backBtnBg}>
              <IconSymbol name="chevron.left" size={16} color="#fff" />
            </View>
          </Pressable>
        </View>

        {/* ── Metadata ── */}
        <View style={styles.metaBlock}>
          <Text style={[styles.title, { color: C.label }]}>{item.title}</Text>
          <Text style={[styles.brand, { color: C.secondary }]}>{item.brand} · @{item.brandHandle}</Text>

          <View style={styles.metaRow}>
            {[item.type.charAt(0).toUpperCase() + item.type.slice(1), item.difficulty, item.duration].map(tag => (
              <View key={tag} style={[styles.metaTag, { backgroundColor: C.surfacePressed }]}>
                <Text style={[styles.metaTagText, { color: C.secondary }]}>{tag}</Text>
              </View>
            ))}
          </View>

          <Stars rating={item.rating} C={C} />
          <Text style={[styles.participants, { color: C.muted }]}>{item.participants}</Text>
          <Text style={[styles.description, { color: C.secondary }]}>{item.description}</Text>

          {/* Progress bar */}
          {hasProgress && (
            <View style={styles.progressSection}>
              <View style={[styles.progressBg, { backgroundColor: C.surfacePressed }]}>
                <View style={[styles.progressFill, { width: `${Math.round(progress!.progress * 100)}%` as any, backgroundColor: C.accent }]} />
              </View>
              <Text style={[styles.progressLabel, { color: C.muted }]}>
                {Math.round(progress!.progress * 100)}% complete
              </Text>
            </View>
          )}

          {/* Completed badge */}
          {isCompleted && (
            <View style={[styles.completedBadge, { backgroundColor: C.green + '22' }]}>
              <IconSymbol name="checkmark.seal.fill" size={14} color={C.green} />
              <Text style={[styles.completedText, { color: C.green }]}>
                {progress!.score != null ? `Completed · Score: ${progress!.score}%` : 'Completed'}
              </Text>
            </View>
          )}
        </View>

        {/* ── CTAs ── */}
        <View style={styles.ctas}>
          <Pressable
            style={({ pressed }) => [styles.launchBtn, { backgroundColor: C.label, opacity: pressed ? 0.88 : 1 }]}
            onPress={handleLaunch}
          >
            <Text style={[styles.launchBtnText, { color: C.bg }]}>
              {hasProgress ? `Resume ${launchLabel}` : isCompleted ? `Play Again` : launchLabel}
            </Text>
          </Pressable>

          <View style={[styles.actionRow, { borderColor: C.separator }]}>
            <Pressable style={styles.actionItem} onPress={handleSaveToggle}>
              <IconSymbol name={saved ? 'bookmark.fill' : 'bookmark'} size={20} color={saved ? C.accent : C.label} />
              <Text style={[styles.actionLabel, { color: C.secondary }]}>{saved ? 'Saved' : 'Save'}</Text>
            </Pressable>
            <Pressable style={styles.actionItem} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <IconSymbol name="square.and.arrow.up" size={20} color={C.label} />
              <Text style={[styles.actionLabel, { color: C.secondary }]}>Share</Text>
            </Pressable>
            {(hasProgress || isCompleted) && (
              <Pressable style={styles.actionItem} onPress={handleRestart}>
                <IconSymbol name="arrow.counterclockwise" size={20} color={C.label} />
                <Text style={[styles.actionLabel, { color: C.secondary }]}>Restart</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* ── Related ── */}
        {related.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.sectionDivider, { backgroundColor: C.surface }]} />
            <Text style={[styles.sectionTitle, { color: C.label }]}>More Like This</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, gap: 12 }}
            >
              {related.map(r => (
                <RelatedCard
                  key={r.id}
                  item={r}
                  C={C}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.replace({
                      pathname: '/(tabs)/(main)/kaystudios/detail' as any,
                      params: { contentId: r.id },
                    });
                  }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Reviews ── */}
        <View style={styles.section}>
          <View style={[styles.sectionDivider, { backgroundColor: C.surface }]} />
          <Text style={[styles.sectionTitle, { color: C.label }]}>Reviews</Text>
          {reviews.map((r, i) => (
            <ReviewRow key={i} review={r} C={C} />
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },

  backdrop: { position: 'relative', overflow: 'hidden' },
  backdropBg: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  backdropEmoji: { fontSize: 90, opacity: 0.45 },
  backBtn: { position: 'absolute', left: 16 },
  backBtnBg: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.42)',
    alignItems: 'center', justifyContent: 'center',
  },

  metaBlock: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '900', lineHeight: 30, marginBottom: 6 },
  brand: { fontSize: 13, marginBottom: 12 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  metaTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  metaTagText: { fontSize: 11, fontWeight: '600' },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 4 },
  ratingNum: { fontSize: 12, marginLeft: 4 },
  participants: { fontSize: 12, marginBottom: 10 },
  description: { fontSize: 14, lineHeight: 21 },

  progressSection: { marginTop: 14 },
  progressBg: { height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: 4, borderRadius: 2 },
  progressLabel: { fontSize: 12 },

  completedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12,
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
  },
  completedText: { fontSize: 13, fontWeight: '600' },

  ctas: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  launchBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, paddingVertical: 15, marginBottom: 16,
  },
  launchBtnText: { fontSize: 16, fontWeight: '700' },
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionItem: { alignItems: 'center', gap: 5, paddingVertical: 4, paddingHorizontal: 12 },
  actionLabel: { fontSize: 11, fontWeight: '500' },

  section: { marginTop: 4 },
  sectionDivider: { height: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '800', paddingHorizontal: 20, paddingVertical: 14 },

  relatedCard: { width: RELATED_W },
  relatedThumb: {
    width: RELATED_W, height: RELATED_H, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 6,
  },
  relatedEmoji: { fontSize: 30 },
  relatedTitle: { fontSize: 12, fontWeight: '500', lineHeight: 16 },

  reviewRow: {
    flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  reviewInitials: { fontSize: 12, fontWeight: '700' },
  reviewBody: { flex: 1 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  reviewAuthor: { fontSize: 13, fontWeight: '700' },
  reviewTime: { fontSize: 11 },
  reviewText: { fontSize: 13, lineHeight: 19, marginTop: 6 },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 16 },
  notFoundBack: { fontSize: 15, fontWeight: '600' },
});
