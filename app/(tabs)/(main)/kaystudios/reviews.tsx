/**
 * KPlay Reviews — All reviews across all content.
 * Owner: approve, delete, reply, pin. Owner-only screen.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Animated, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;
const CAUTION   = '#B8943E';
const GAIN      = '#5A8A6E';

// ── Mock data ─────────────────────────────────────────────────────────────────

type Review = {
  id: string;
  contentId: string;
  contentTitle: string;
  contentEmoji: string;
  author: string;
  initials: string;
  date: string;
  rating: number;
  text: string;
  pinned: boolean;
  approved: boolean;
};

const MOCK_REVIEWS: Review[] = [
  { id: 'r1', contentId: 'g1', contentTitle: 'Business Strategy Challenge', contentEmoji: '🏆', author: 'Marcus J.', initials: 'MJ', date: 'Apr 10', rating: 5, text: 'Best strategy game I\'ve played. Learned more about pricing models here than in my MBA.', pinned: true, approved: true },
  { id: 'r2', contentId: 'c1', contentTitle: 'Brand Building 101', contentEmoji: '📚', author: 'Aaliyah T.', initials: 'AT', date: 'Apr 9', rating: 5, text: 'Completed all 4 modules. The storytelling section was a game changer for my Etsy brand.', pinned: false, approved: true },
  { id: 'r3', contentId: 'q1', contentTitle: 'Sports Marketing Quiz', contentEmoji: '🧠', author: 'Devon W.', initials: 'DW', date: 'Apr 8', rating: 4, text: 'Solid quiz. The NIL question stumped me at first but I learned from it. Would love more questions.', pinned: false, approved: true },
  { id: 'r4', contentId: 'g2', contentTitle: 'Athlete Finance Sim', contentEmoji: '🧪', author: 'Priya K.', initials: 'PK', date: 'Apr 7', rating: 5, text: 'This simulation is incredible. Finally understand contract negotiations. Use this in every onboarding.', pinned: false, approved: true },
  { id: 'r5', contentId: 'c1', contentTitle: 'Brand Building 101', contentEmoji: '📚', author: 'Ryan B.', initials: 'RB', date: 'Apr 6', rating: 3, text: 'Good content but module 3 feels rushed. Could use more examples for physical product brands.', pinned: false, approved: false },
  { id: 'r6', contentId: 'q2', contentTitle: 'NIL Knowledge Check', contentEmoji: '🧠', author: 'Jordan L.', initials: 'JL', date: 'Apr 5', rating: 4, text: 'Really helpful before my first deal signing. Recommend this to every athlete.', pinned: false, approved: true },
  { id: 'r7', contentId: 'g1', contentTitle: 'Business Strategy Challenge', contentEmoji: '🏆', author: 'Keisha M.', initials: 'KM', date: 'Apr 3', rating: 5, text: 'This is exactly what young entrepreneurs need. Worth every penny of the subscription.', pinned: false, approved: true },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function KPlayReviewsScreen() {
  const C       = useColors();
  const insets  = useSafeAreaInsets();
  const s       = useMemo(() => makeStyles(C), [C]);
  const topBarH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);

  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaystudios');
  const isOwner = role === roleCycles[0];

  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [filter, setFilter]   = useState<'All' | 'Pinned' | 'Pending'>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filtered = useMemo(() => {
    if (filter === 'Pinned')  return reviews.filter(r => r.pinned);
    if (filter === 'Pending') return reviews.filter(r => !r.approved);
    return reviews;
  }, [reviews, filter]);

  const avgRating = useMemo(() => {
    const approved = reviews.filter(r => r.approved);
    if (!approved.length) return 0;
    return approved.reduce((sum, r) => sum + r.rating, 0) / approved.length;
  }, [reviews]);

  function togglePin(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReviews(prev => prev.map(r => r.id === id ? { ...r, pinned: !r.pinned } : r));
  }

  function approveReview(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: true } : r));
  }

  function deleteReview(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Delete Review', 'Remove this review permanently?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setReviews(prev => prev.filter(r => r.id !== id)) },
    ]);
  }

  function replyToReview(author: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Reply to ' + author, 'Reply functionality coming soon.');
  }

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* ── Top bar ── */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <View style={{ flex: 1 }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ backgroundColor: C.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Reviews</Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{ paddingTop: topBarH + 16, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Summary card ── */}
        <View style={[s.summaryCard, { backgroundColor: C.surface }]}>
          <View style={s.summaryRow}>
            <View style={s.summaryItem}>
              <Text style={[s.summaryNum, { color: C.label }]}>{avgRating.toFixed(1)}</Text>
              <Text style={[s.summaryLbl, { color: C.secondary }]}>Avg Rating</Text>
              <Text style={{ fontSize: 14, color: CAUTION }}>{'★'.repeat(Math.round(avgRating))}</Text>
            </View>
            <View style={[s.summaryDivider, { backgroundColor: C.separator }]} />
            <View style={s.summaryItem}>
              <Text style={[s.summaryNum, { color: C.label }]}>{reviews.filter(r => r.approved).length}</Text>
              <Text style={[s.summaryLbl, { color: C.secondary }]}>Published</Text>
            </View>
            <View style={[s.summaryDivider, { backgroundColor: C.separator }]} />
            <View style={s.summaryItem}>
              <Text style={[s.summaryNum, { color: reviews.filter(r => !r.approved).length > 0 ? CAUTION : C.label }]}>
                {reviews.filter(r => !r.approved).length}
              </Text>
              <Text style={[s.summaryLbl, { color: C.secondary }]}>Pending</Text>
            </View>
          </View>
        </View>

        {/* ── Filter pills ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginBottom: 16 }}>
          {(['All', 'Pinned', 'Pending'] as const).map(f => (
            <Pressable
              key={f}
              onPress={() => { Haptics.selectionAsync(); setFilter(f); }}
              style={{ backgroundColor: filter === f ? C.label : C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 7 }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: filter === f ? C.bg : C.label }}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Review list ── */}
        {filtered.length === 0 && (
          <Text style={{ fontSize: 14, color: C.secondary, textAlign: 'center', marginTop: 40 }}>No reviews in this filter.</Text>
        )}
        {filtered.map((review, idx) => (
          <View
            key={review.id}
            style={[s.reviewCard, { backgroundColor: C.surface, borderTopWidth: idx === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
          >
            {/* Content label */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Text style={{ fontSize: 15 }}>{review.contentEmoji}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, flex: 1 }} numberOfLines={1}>{review.contentTitle}</Text>
              {review.pinned && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <IconSymbol name="pin.fill" size={11} color={CAUTION} />
                  <Text style={{ fontSize: 11, color: CAUTION, fontWeight: '600' }}>Pinned</Text>
                </View>
              )}
              {!review.approved && (
                <View style={{ backgroundColor: `${CAUTION}20`, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: CAUTION }}>Pending</Text>
                </View>
              )}
            </View>

            {/* Author + rating */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary }}>{review.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{review.author}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{review.date}</Text>
                </View>
                <Text style={{ fontSize: 12, color: CAUTION }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</Text>
              </View>
            </View>

            {/* Review text */}
            <Text style={{ fontSize: 14, color: C.label, lineHeight: 20, marginBottom: 12 }}>{review.text}</Text>

            {/* Owner actions */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={() => replyToReview(review.author)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: C.separator }}
              >
                <IconSymbol name="bubble.right" size={13} color={C.label} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }}>Reply</Text>
              </Pressable>
              <Pressable
                onPress={() => togglePin(review.id)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: review.pinned ? CAUTION : C.separator }}
              >
                <IconSymbol name={review.pinned ? 'pin.slash' : 'pin'} size={13} color={review.pinned ? CAUTION : C.label} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: review.pinned ? CAUTION : C.label }}>{review.pinned ? 'Unpin' : 'Pin'}</Text>
              </Pressable>
              {!review.approved && (
                <Pressable
                  onPress={() => approveReview(review.id)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: `${GAIN}20` }}
                >
                  <IconSymbol name="checkmark" size={13} color={GAIN} />
                  <Text style={{ fontSize: 12, fontWeight: '600', color: GAIN }}>Approve</Text>
                </Pressable>
              )}
              <Pressable
                onPress={() => deleteReview(review.id)}
                style={{ marginLeft: 'auto', padding: 6 }}
              >
                <IconSymbol name="trash" size={16} color={C.secondary} />
              </Pressable>
            </View>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBarOuter: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
    },
    summaryCard: {
      marginHorizontal: 16, borderRadius: 16, marginBottom: 16,
    },
    summaryRow: {
      flexDirection: 'row', padding: 16,
    },
    summaryItem: {
      flex: 1, alignItems: 'center', gap: 3,
    },
    summaryDivider: {
      width: StyleSheet.hairlineWidth, marginVertical: 4,
    },
    summaryNum: { fontSize: 24, fontWeight: '800' },
    summaryLbl: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    reviewCard: {
      marginHorizontal: 16, marginBottom: 12, padding: 14,
      backgroundColor: 'transparent',
      borderRadius: 12,
    },
  });
}
