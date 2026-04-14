/**
 * My Content — Browse, manage, and create KayStudios content.
 * Owner: full management with FAB to create. Subscriber: read-only consumer view.
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { GlassView } from '@/components/ui/glass-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ── Module-level semantic colors (data values and status badges only) ──────────

const GAIN  = '#5A8A6E';
const HEAT  = '#B85C5C';
const EMBER = '#8B2500';

// ── Static mock data ───────────────────────────────────────────────────────────

type ContentItem = {
  id: string;
  emoji: string;
  title: string;
  type: 'Course' | 'Quiz' | 'Challenge' | 'Poll';
  status: 'Live' | 'Draft';
  lessons: number;
  enrolled: number;
  plays: number;
  revenue: number;
  avgRating: number;
  completion: number;
};

const CONTENT_ITEMS: ContentItem[] = [
  { id: 'c1', emoji: '📘', title: 'Brand Building 101',         type: 'Course',    status: 'Live',  lessons: 12, enrolled: 284, plays: 1420, revenue: 2840, avgRating: 4.8, completion: 77 },
  { id: 'c2', emoji: '🏀', title: 'Basketball IQ Trivia',       type: 'Quiz',      status: 'Live',  lessons: 20, enrolled: 0,   plays: 8430, revenue: 0,    avgRating: 4.6, completion: 82 },
  { id: 'c3', emoji: '💪', title: '30-Day Creator Challenge',   type: 'Challenge', status: 'Live',  lessons: 30, enrolled: 156, plays: 3200, revenue: 780,  avgRating: 4.9, completion: 61 },
  { id: 'c4', emoji: '📊', title: 'Market Analysis Deep Dive',  type: 'Course',    status: 'Live',  lessons: 8,  enrolled: 92,  plays: 460,  revenue: 1840, avgRating: 4.4, completion: 55 },
  { id: 'c5', emoji: '🎯', title: 'Goal Setting Workshop',      type: 'Course',    status: 'Draft', lessons: 6,  enrolled: 0,   plays: 0,    revenue: 0,    avgRating: 0,   completion: 0  },
  { id: 'c6', emoji: '❓', title: 'Business Fundamentals Quiz', type: 'Quiz',      status: 'Draft', lessons: 15, enrolled: 0,   plays: 0,    revenue: 0,    avgRating: 0,   completion: 0  },
];

const FILTER_OPTIONS = ['All', 'Courses', 'Quizzes', 'Challenges', 'Polls'] as const;
type FilterOption = typeof FILTER_OPTIONS[number];

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatPlays(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function formatRevenue(n: number): string {
  return `$${n.toLocaleString('en-US')}`;
}

function filterItems(items: ContentItem[], filter: FilterOption): ContentItem[] {
  if (filter === 'All')       return items;
  if (filter === 'Courses')   return items.filter(i => i.type === 'Course');
  if (filter === 'Quizzes')   return items.filter(i => i.type === 'Quiz');
  if (filter === 'Challenges')return items.filter(i => i.type === 'Challenge');
  if (filter === 'Polls')     return items.filter(i => i.type === 'Poll');
  return items;
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

type StatCardProps = {
  label: string;
  value: string;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
  C: ComponentColors;
};

function StatCard({ label, value, onPress, styles, C }: StatCardProps) {
  return (
    <Pressable onPress={onPress}>
      <GlassView tier={1} style={styles.statCard}>
        <Text style={[styles.statValue, { color: C.label }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: C.secondary }]}>{label}</Text>
      </GlassView>
    </Pressable>
  );
}

// ── Content Row ────────────────────────────────────────────────────────────────

type ContentRowProps = {
  item: ContentItem;
  isOwner: boolean;
  styles: ReturnType<typeof makeStyles>;
  C: ComponentColors;
};

function ContentRow({ item, isOwner, styles, C }: ContentRowProps) {
  const isLive = item.status === 'Live';

  const lessonLabel = item.type === 'Quiz' ? 'questions' : 'lessons';

  function handleEllipsis() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(item.title, undefined, [
      { text: 'Edit',      onPress: () => {} },
      { text: 'Duplicate', onPress: () => {} },
      { text: 'Archive',   onPress: () => {} },
      { text: 'Delete',    style: 'destructive', onPress: () => {} },
      { text: 'Cancel',    style: 'cancel' },
    ]);
  }

  return (
    <GlassView tier={1} style={styles.contentRow}>
      {/* Left: emoji circle */}
      <View style={[styles.emojiCircle, { backgroundColor: C.surface }]}>
        <Text style={styles.emojiText}>{item.emoji}</Text>
      </View>

      {/* Center: info */}
      <View style={styles.contentCenter}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={[styles.contentTitle, { color: C.label }]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.badgeRow}>
            {/* Status badge */}
            {isLive ? (
              <View style={[styles.statusBadge, { backgroundColor: GAIN + '22' }]}>
                <Text style={[styles.statusBadgeText, { color: GAIN }]}>Live</Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: C.separator }]}>
                <Text style={[styles.statusBadgeText, { color: C.secondary }]}>Draft</Text>
              </View>
            )}
            {/* Type badge */}
            <View style={[styles.typeBadge, { backgroundColor: C.surface }]}>
              <Text style={[styles.typeBadgeText, { color: C.secondary }]}>{item.type}</Text>
            </View>
          </View>
        </View>

        {/* Draft: resume editing hint */}
        {!isLive && (
          <Text style={[styles.resumeText, { color: C.secondary }]}>Resume Editing</Text>
        )}

        {/* Stats row (Live only) */}
        {isLive && (
          <View style={styles.statsRow}>
            <Text style={[styles.statChip, { color: C.secondary }]}>
              {item.lessons} {lessonLabel}
            </Text>
            <Text style={[styles.statDot, { color: C.separator }]}>·</Text>
            {item.enrolled > 0 ? (
              <Text style={[styles.statChip, { color: C.secondary }]}>
                {item.enrolled} enrolled
              </Text>
            ) : (
              <Text style={[styles.statChip, { color: C.secondary }]}>
                {formatPlays(item.plays)} plays
              </Text>
            )}
            {item.enrolled > 0 && (
              <>
                <Text style={[styles.statDot, { color: C.separator }]}>·</Text>
                <Text style={[styles.statChip, { color: C.secondary }]}>
                  {item.completion}% done
                </Text>
              </>
            )}
          </View>
        )}

        {/* Revenue (Live + > 0) */}
        {isLive && item.revenue > 0 && (
          <Text style={[styles.revenueText, { color: GAIN }]}>
            {formatRevenue(item.revenue)}
          </Text>
        )}
      </View>

      {/* Right: ellipsis (Owner only) */}
      {isOwner && (
        <Pressable onPress={handleEllipsis} hitSlop={8} style={styles.ellipsisBtn}>
          <Text style={[styles.ellipsisText, { color: C.secondary }]}>•••</Text>
        </Pressable>
      )}
    </GlassView>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────────

export default function MyContentPage() {
  const C       = useColors();
  const insets  = useSafeAreaInsets();

  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaystudios');
  const isOwner = role === roleCycles[0];

  const [filter, setFilter] = useState<FilterOption>('All');

  const scrollRef = useRef<ScrollView>(null);

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const styles = useMemo(() => makeStyles(C), [C]);

  // Derived stats
  const liveCount   = CONTENT_ITEMS.filter(i => i.status === 'Live').length;
  const totalPlays  = CONTENT_ITEMS.reduce((sum, i) => sum + i.plays, 0);
  const totalRevenue = CONTENT_ITEMS.reduce((sum, i) => sum + i.revenue, 0);

  const visibleItems = useMemo(() => filterItems(CONTENT_ITEMS, filter), [filter]);

  function scrollToList() {
    scrollRef.current?.scrollTo({ y: 220, animated: true });
  }

  // ── JSX ──────────────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Animated Top Bar ────────────────────────────────────────────────── */}
      <Animated.View style={[styles.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            style={styles.topBarLeft}
          >
            <KMenuButton />
          </Pressable>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[styles.staticPill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[styles.staticPillText, { color: C.label }]}>My Content</Text>
            </View>
          </View>

          <View style={styles.topBarRight}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      {/* ── Scroll Content ──────────────────────────────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: insets.top + 52 + 8,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Stat Cards ──────────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
          contentContainerStyle={{ paddingRight: 4, gap: 10 }}
        >
          <StatCard
            label="Published"
            value={String(liveCount)}
            onPress={scrollToList}
            styles={styles}
            C={C}
          />
          <StatCard
            label="Total Plays"
            value={formatPlays(totalPlays)}
            onPress={scrollToList}
            styles={styles}
            C={C}
          />
          <StatCard
            label="Revenue"
            value={formatRevenue(totalRevenue)}
            onPress={scrollToList}
            styles={styles}
            C={C}
          />
        </ScrollView>

        {/* ── Filter Pills ────────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
          contentContainerStyle={{ paddingRight: 4, gap: 8 }}
        >
          {FILTER_OPTIONS.map((opt) => {
            const active = filter === opt;
            return (
              <Pressable
                key={opt}
                onPress={() => {
                  Haptics.selectionAsync();
                  setFilter(opt);
                }}
                style={[
                  styles.filterPill,
                  active
                    ? { backgroundColor: C.activePill }
                    : { backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator },
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: active ? C.activePillText : C.secondary },
                  ]}
                >
                  {opt}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Content List ────────────────────────────────────────────────── */}
        {visibleItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: C.secondary }]}>No content in this category yet.</Text>
          </View>
        ) : (
          visibleItems.map((item) => (
            <ContentRow
              key={item.id}
              item={item}
              isOwner={isOwner}
              styles={styles}
              C={C}
            />
          ))
        )}

      </ScrollView>

      {/* ── FAB (Owner only) ────────────────────────────────────────────────── */}
      {isOwner && (
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          style={[styles.fab, { backgroundColor: C.label }]}
        >
          <IconSymbol name="plus" size={22} color={C.bg} />
        </Pressable>
      )}

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    // Top bar
    topBarOuter: {
      position: 'absolute',
      top: 0, left: 0, right: 0,
      zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      height: 52,
    },
    topBarLeft: {
      width: 40,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    topBarRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    staticPill: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 18,
      borderWidth: 1.5,
    },
    staticPillText: {
      fontSize: 13,
      fontWeight: '700',
    },

    // Stat cards (horizontal scroll)
    statCard: {
      width: 120,
      borderRadius: 12,
      padding: 14,
      alignItems: 'flex-start',
    },
    statValue: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },

    // Filter pills
    filterPill: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
    },
    filterPillText: {
      fontSize: 13,
      fontWeight: '600',
    },

    // Content row
    contentRow: {
      flexDirection: 'row',
      padding: 12,
      marginBottom: 8,
      borderRadius: 12,
      alignItems: 'flex-start',
    },
    emojiCircle: {
      width: 52,
      height: 52,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      flexShrink: 0,
    },
    emojiText: {
      fontSize: 26,
    },
    contentCenter: {
      flex: 1,
      minWidth: 0,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 4,
    },
    contentTitle: {
      fontSize: 14,
      fontWeight: '700',
      flexShrink: 1,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flexShrink: 0,
    },
    statusBadge: {
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 6,
    },
    statusBadgeText: {
      fontSize: 11,
      fontWeight: '700',
    },
    typeBadge: {
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 6,
    },
    typeBadgeText: {
      fontSize: 10,
      fontWeight: '600',
    },
    resumeText: {
      fontSize: 11,
      marginTop: 2,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 4,
      marginTop: 2,
    },
    statChip: {
      fontSize: 12,
    },
    statDot: {
      fontSize: 12,
    },
    revenueText: {
      fontSize: 13,
      fontWeight: '700',
      marginTop: 4,
    },

    // Ellipsis button
    ellipsisBtn: {
      paddingLeft: 8,
      alignSelf: 'flex-start',
      paddingTop: 2,
    },
    ellipsisText: {
      fontSize: 16,
      letterSpacing: -1,
    },

    // Empty state
    emptyState: {
      paddingVertical: 48,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
    },

    // FAB
    fab: {
      position: 'absolute',
      right: 24,
      bottom: 80,
      zIndex: 20,
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
