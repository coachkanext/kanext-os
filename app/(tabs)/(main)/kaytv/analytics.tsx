/**
 * KayTV Analytics — Views, watch time, subscribers, revenue, and audience
 * breakdown for the KayTV personal broadcast channel. Owner-only view.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlassView } from '@/components/ui/glass-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Module-level semantic colors (data values only) ───────────────────────────

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

// ── Static data ───────────────────────────────────────────────────────────────

const PERIODS = ['Last 7 days', 'Last 28 days', 'Last 90 days', 'All time'] as const;
type Period = typeof PERIODS[number];

type PeriodData = {
  cards: { label: string; value: string; delta: string; up: boolean }[];
  barHeights: number[];
  barDays: string[];
  topVideos: { rank: number; title: string; views: string; watchTime: string; emoji: string; hue: number }[];
  revenue: { label: string; value: string; amount: number }[];
};

const PERIOD_DATA: Record<Period, PeriodData> = {
  'Last 7 days': {
    cards: [
      { label: 'Total Views',      value: '4.2K',   delta: '+18%', up: true  },
      { label: 'Watch Time (hrs)', value: '312',    delta: '+14%', up: true  },
      { label: 'New Subscribers',  value: '+48',    delta: '+31%', up: true  },
      { label: 'Revenue',          value: '$124',   delta: '+9%',  up: true  },
    ],
    barHeights: [0.40, 0.55, 0.35, 0.70, 0.80, 0.60, 1.00],
    barDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'],
    topVideos: [
      { rank: 1, title: 'Day in My Life - Coach & CEO',    views: '2.1K views', watchTime: '148 hrs', emoji: '🌟', hue: 45  },
      { rank: 2, title: 'How I Use AI to Build Faster',    views: '1.4K views', watchTime: '84 hrs',  emoji: '⚡', hue: 280 },
      { rank: 3, title: 'From Coach to CEO',               views: '0.7K views', watchTime: '51 hrs',  emoji: '🎯', hue: 30  },
    ],
    revenue: [
      { label: 'Subscriptions', value: '$72',  amount: 72  },
      { label: 'Ad Share',      value: '$31',  amount: 31  },
      { label: 'Tips',          value: '$21',  amount: 21  },
    ],
  },
  'Last 28 days': {
    cards: [
      { label: 'Total Views',      value: '14.8K',  delta: '+12%', up: true  },
      { label: 'Watch Time (hrs)', value: '1.1K',   delta: '+8%',  up: true  },
      { label: 'New Subscribers',  value: '+142',   delta: '+19%', up: true  },
      { label: 'Revenue',          value: '$387',   delta: '+7%',  up: true  },
    ],
    barHeights: [0.30, 0.45, 0.60, 0.40, 0.75, 0.55, 0.90, 0.65, 0.50, 0.80, 0.70, 0.95, 0.45, 1.00],
    barDays: ['W1', '', 'W2', '', 'W3', '', 'W4', '', '', '', '', '', '', 'Today'],
    topVideos: [
      { rank: 1, title: 'Day in My Life - Coach & CEO',    views: '8.9K views', watchTime: '621 hrs', emoji: '🌟', hue: 45  },
      { rank: 2, title: 'How I Use AI to Build Faster',    views: '6.8K views', watchTime: '410 hrs', emoji: '⚡', hue: 280 },
      { rank: 3, title: 'Why I Built an OS',               views: '5.1K views', watchTime: '380 hrs', emoji: '🏗️',  hue: 200 },
    ],
    revenue: [
      { label: 'Subscriptions', value: '$220', amount: 220 },
      { label: 'Ad Share',      value: '$97',  amount: 97  },
      { label: 'Tips',          value: '$70',  amount: 70  },
    ],
  },
  'Last 90 days': {
    cards: [
      { label: 'Total Views',      value: '42.8K',  delta: '+12%', up: true  },
      { label: 'Watch Time (hrs)', value: '3.1K',   delta: '+8%',  up: true  },
      { label: 'New Subscribers',  value: '+384',   delta: '+22%', up: true  },
      { label: 'Revenue',          value: '$937',   delta: '+5%',  up: true  },
    ],
    barHeights: [0.40, 0.55, 0.35, 0.70, 0.80, 0.60, 1.00],
    barDays: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Now'],
    topVideos: [
      { rank: 1, title: 'Day in My Life - Coach & CEO',    views: '8.9K views', watchTime: '621 hrs', emoji: '🌟', hue: 45  },
      { rank: 2, title: 'How I Use AI to Build Faster',    views: '6.8K views', watchTime: '410 hrs', emoji: '⚡', hue: 280 },
      { rank: 3, title: 'Why I Built an OS',               views: '5.1K views', watchTime: '380 hrs', emoji: '🏗️',  hue: 200 },
    ],
    revenue: [
      { label: 'Subscriptions', value: '$550', amount: 550 },
      { label: 'Ad Share',      value: '$247', amount: 247 },
      { label: 'Tips',          value: '$140', amount: 140 },
    ],
  },
  'All time': {
    cards: [
      { label: 'Total Views',      value: '142.8K', delta: '+8%',  up: true  },
      { label: 'Watch Time (hrs)', value: '10.4K',  delta: '+6%',  up: true  },
      { label: 'New Subscribers',  value: '3.4K',   delta: '+15%', up: true  },
      { label: 'Revenue',          value: '$2.8K',  delta: '+4%',  up: true  },
    ],
    barHeights: [0.20, 0.30, 0.45, 0.55, 0.65, 0.80, 1.00],
    barDays: ['2023', '', '2024', '', '', '2025', '2026'],
    topVideos: [
      { rank: 1, title: 'Day in My Life - Coach & CEO',    views: '8.9K views', watchTime: '621 hrs', emoji: '🌟', hue: 45  },
      { rank: 2, title: 'How I Use AI to Build Faster',    views: '6.8K views', watchTime: '410 hrs', emoji: '⚡', hue: 280 },
      { rank: 3, title: 'Why System Fit Matters More Than Talent', views: '4.2K views', watchTime: '290 hrs', emoji: '🧩', hue: 150 },
    ],
    revenue: [
      { label: 'Subscriptions', value: '$1.6K', amount: 1600 },
      { label: 'Ad Share',      value: '$720',  amount: 720  },
      { label: 'Tips',          value: '$480',  amount: 480  },
    ],
  },
};

const AUDIENCE_LOCATIONS = ['US 48%', 'Nigeria 18%', 'UK 12%', 'Canada 9%'];
const AUDIENCE_DEVICES   = ['Mobile 71%', 'Desktop 22%', 'Tablet 7%'];

const periodTotalViews: Record<Period, number> = {
  'Last 7 days': 4200, 'Last 28 days': 14800, 'Last 90 days': 42800, 'All time': 142800,
};

// ── Main Screen ───────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;

export default function KayTVAnalyticsPage() {
  const C       = useColors();
  const insets  = useSafeAreaInsets();
  const topBarH = insets.top + TOP_BAR_H;

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const router = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaytv');
  const isOwner = role === roleCycles[0];

  useEffect(() => {
    if (!isOwner) router.replace('/(tabs)/(main)/kaytv/my-channel' as any);
  }, [isOwner]);

  const [period, setPeriod] = useState<Period>('Last 28 days');
  const [tappedBar, setTappedBar] = useState<number | null>(null);

  const data = PERIOD_DATA[period];
  const revenueMax = Math.max(...data.revenue.map(r => r.amount));

  useEffect(() => {
    if (tappedBar !== null) {
      const t = setTimeout(() => setTappedBar(null), 3000);
      return () => clearTimeout(t);
    }
  }, [tappedBar]);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));


  const styles = useMemo(() => makeStyles(C), [C]);

  // ── JSX ──────────────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
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
              <Text style={[styles.staticPillText, { color: C.label }]}>Analytics</Text>
            </View>
          </View>

          <View style={styles.topBarRight}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      {/* ── Scroll Content ──────────────────────────────────────────────────── */}
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: insets.top + TOP_BAR_H + 8,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Period Filter Pills ─────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
          contentContainerStyle={{ paddingRight: 4 }}
        >
          {PERIODS.map((p, idx) => {
            const active = p === period;
            return (
              <Pressable
                key={p}
                onPress={() => {
                  Haptics.selectionAsync();
                  setPeriod(p);
                }}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: active ? C.activePill : C.surface,
                    marginRight: idx < PERIODS.length - 1 ? 8 : 0,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: active ? C.activePillText : C.secondary },
                  ]}
                >
                  {p}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Summary Cards — 2x2 grid ────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.summaryGrid}>
            {data.cards.map((card, idx) => (
              <GlassView
                key={idx}
                tier={1}
                radius={12}
                style={styles.summaryCard}
              >
                <Text style={[styles.summaryValue, { color: C.label }]}>{card.value}</Text>
                <Text
                  style={[
                    styles.summaryDelta,
                    { color: card.up ? GAIN : HEAT },
                  ]}
                >
                  {card.delta}
                </Text>
                <Text style={[styles.summaryLabel, { color: C.secondary }]}>{card.label}</Text>
              </GlassView>
            ))}
          </View>
        </View>

        {/* ── Bar Chart — Views Over Time ─────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: C.label }]}>Views</Text>
            <Pressable onPress={() => Haptics.selectionAsync()}>
              <Text style={[styles.sectionLink, { color: C.secondary }]}>See report →</Text>
            </Pressable>
          </View>

          <GlassView tier={1} radius={12} style={styles.chartCard}>
            {/* Bar area */}
            <View style={styles.chartBars}>
              {data.barHeights.map((h, idx) => {
                const isLast = idx === data.barHeights.length - 1;
                return (
                  <Pressable
                    key={idx}
                    style={styles.barColumn}
                    onPress={() => { Haptics.selectionAsync(); setTappedBar(tappedBar === idx ? null : idx); }}
                  >
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${h * 100}%`,
                            backgroundColor: C.label,
                            opacity: tappedBar === idx ? 1 : (isLast ? 1 : 0.4 + (idx / data.barHeights.length) * 0.4),
                          },
                        ]}
                      />
                    </View>
                    {tappedBar === idx && (
                      <View style={{ position: 'absolute', top: -30, backgroundColor: C.label, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, zIndex: 10 }}>
                        <Text style={{ fontSize: 10, color: C.bg, fontWeight: '700' }}>
                          {Math.round(h * periodTotalViews[period] / data.barHeights.reduce((a, b) => a + b, 0)).toLocaleString()}
                        </Text>
                      </View>
                    )}
                    <Text style={[styles.barLabel, { color: C.secondary }]}>{data.barDays[idx]}</Text>
                  </Pressable>
                );
              })}
            </View>
          </GlassView>
        </View>

        {/* ── Top Videos ─────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.label }]}>Top Videos</Text>

          <GlassView tier={1} radius={12} style={{ overflow: 'hidden' }}>
            {data.topVideos.map((video, idx) => (
              <View
                key={idx}
                style={[
                  styles.videoRow,
                  idx < data.topVideos.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: C.separator,
                  },
                ]}
              >
                {/* Rank */}
                <Text style={[styles.videoRank, { color: C.secondary }]}>{video.rank}</Text>

                {/* Thumbnail with emoji */}
                <View style={[styles.videoThumb, { backgroundColor: `hsl(${video.hue},35%,28%)`, alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ fontSize: 18 }}>{video.emoji}</Text>
                </View>

                {/* Meta */}
                <View style={styles.videoMeta}>
                  <Text style={[styles.videoTitle, { color: C.label }]} numberOfLines={2}>
                    {video.title}
                  </Text>
                  <Text style={[styles.videoStats, { color: C.secondary }]}>
                    {video.views} · {video.watchTime}
                  </Text>
                </View>
              </View>
            ))}
          </GlassView>
        </View>

        {/* ── Audience Stats ──────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.label }]}>Audience</Text>

          {/* Top Locations */}
          <Text style={[styles.audienceSubLabel, { color: C.secondary }]}>Top Locations</Text>
          <View style={styles.pillRow}>
            {AUDIENCE_LOCATIONS.map((loc, idx) => (
              <View
                key={idx}
                style={[
                  styles.audiencePill,
                  { backgroundColor: C.surface, borderColor: C.separator },
                ]}
              >
                <Text style={[styles.audiencePillText, { color: C.secondary }]}>{loc}</Text>
              </View>
            ))}
          </View>

          {/* Device Split */}
          <Text style={[styles.audienceSubLabel, { color: C.secondary, marginTop: 14 }]}>
            Device Split
          </Text>
          <View style={styles.pillRow}>
            {AUDIENCE_DEVICES.map((device, idx) => (
              <View
                key={idx}
                style={[
                  styles.audiencePill,
                  { backgroundColor: C.surface, borderColor: C.separator },
                ]}
              >
                <Text style={[styles.audiencePillText, { color: C.secondary }]}>{device}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Revenue Breakdown ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.label }]}>Revenue</Text>

          <GlassView tier={1} radius={12} style={{ overflow: 'hidden' }}>
            {data.revenue.map((row, idx) => {
              const fillPct = (row.amount / revenueMax) * 100;
              return (
                <View
                  key={idx}
                  style={[
                    styles.revenueRow,
                    idx < data.revenue.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: C.separator,
                    },
                  ]}
                >
                  <Text style={[styles.revenueLabel, { color: C.label }]}>{row.label}</Text>
                  <View style={styles.revenueBarWrap}>
                    <View style={[styles.revenueBarTrack, { backgroundColor: C.separator }]}>
                      <View
                        style={[
                          styles.revenueBarFill,
                          {
                            width: `${fillPct}%`,
                            backgroundColor: GAIN,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <Text style={[styles.revenueValue, { color: C.label }]}>{row.value}</Text>
                </View>
              );
            })}
          </GlassView>
        </View>

      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    // Top bar
    topBarOuter: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      height: TOP_BAR_H,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
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

    // Section
    section: {
      marginBottom: 28,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 10,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    sectionLink: {
      fontSize: 13,
    },

    // Period filter pills
    filterPill: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
    },
    filterPillText: {
      fontSize: 13,
      fontWeight: '600',
    },

    // Summary cards grid
    summaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    summaryCard: {
      width: '47.5%',
      padding: 14,
    },
    summaryValue: {
      fontSize: 22,
      fontWeight: '700',
    },
    summaryDelta: {
      fontSize: 13,
      fontWeight: '600',
      marginTop: 2,
    },
    summaryLabel: {
      fontSize: 12,
      marginTop: 4,
    },

    // Bar chart
    chartCard: {
      paddingHorizontal: 12,
      paddingTop: 12,
      paddingBottom: 8,
    },
    chartBars: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 140,
      gap: 6,
    },
    barColumn: {
      flex: 1,
      alignItems: 'center',
      height: '100%',
    },
    barTrack: {
      flex: 1,
      width: '100%',
      justifyContent: 'flex-end',
    },
    barFill: {
      width: '100%',
      borderRadius: 3,
    },
    barLabel: {
      fontSize: 10,
      marginTop: 6,
    },

    // Top videos
    videoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      gap: 10,
    },
    videoRank: {
      fontSize: 20,
      fontWeight: '700',
      width: 20,
      textAlign: 'center',
    },
    videoThumb: {
      width: 48,
      height: 48,
      borderRadius: 6,
      flexShrink: 0,
    },
    videoMeta: {
      flex: 1,
    },
    videoTitle: {
      fontSize: 13,
      fontWeight: '600',
      lineHeight: 18,
    },
    videoStats: {
      fontSize: 11,
      marginTop: 3,
    },

    // Audience pills
    audienceSubLabel: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    audiencePill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
    },
    audiencePillText: {
      fontSize: 11,
    },

    // Revenue breakdown
    revenueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      gap: 10,
    },
    revenueLabel: {
      fontSize: 14,
      fontWeight: '600',
      width: 110,
    },
    revenueBarWrap: {
      flex: 1,
    },
    revenueBarTrack: {
      height: 6,
      borderRadius: 3,
      overflow: 'hidden',
    },
    revenueBarFill: {
      position: 'absolute',
      left: 0,
      top: 0,
      height: 6,
      borderRadius: 3,
    },
    revenueValue: {
      fontSize: 14,
      fontWeight: '700',
      width: 46,
      textAlign: 'right',
    },
  });
}
