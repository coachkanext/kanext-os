/**
 * KayStudios Analytics — Enrollments, revenue, completion rates, ratings, and
 * audience breakdown for the KayStudios content creator hub. Owner-only view.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
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

// ── Module-level semantic colors (data values only) ───────────────────────────

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

// ── Static data ───────────────────────────────────────────────────────────────

const PERIODS = ['Last 7 Days', 'Last 28 Days', 'Last 90 Days', 'All Time'] as const;
type Period = typeof PERIODS[number];

const OVERVIEW_CARDS = [
  { label: 'Total Enrollments', value: '2,402', delta: '+18%', up: true },
  { label: 'Total Revenue',     value: '$5,460', delta: '+12%', up: true },
  { label: 'Avg Completion',    value: '77%',    delta: '+5%',  up: true },
  { label: 'Avg Rating',        value: '4.8/5',  delta: '+0.2', up: true },
];

// Relative heights: index 0 = Mon, index 6 = Sun (highest = 100%)
const BAR_HEIGHTS = [0.30, 0.45, 0.55, 0.40, 0.70, 0.85, 1.00];
const BAR_DAYS    = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const REVENUE_BY_CONTENT = [
  { rank: 1, emoji: '📘', title: 'Brand Building 101',  type: 'Course',    revenue: '$2,840', pct: '52%' },
  { rank: 2, emoji: '💪', title: '30-Day Challenge',    type: 'Challenge', revenue: '$780',   pct: '14%' },
  { rank: 3, emoji: '📊', title: 'Market Analysis',     type: 'Course',    revenue: '$1,840', pct: '34%' },
];

const COMPLETION_ROWS = [
  { emoji: '📘', title: 'Brand Building 101',       rate: 77, type: 'Course'    },
  { emoji: '🏀', title: 'Basketball IQ Trivia',     rate: 82, type: 'Quiz'      },
  { emoji: '💪', title: '30-Day Creator Challenge', rate: 61, type: 'Challenge' },
  { emoji: '📊', title: 'Market Analysis',          rate: 55, type: 'Course'    },
];

const DEMO_LOCATIONS = ['US 52%', 'Nigeria 21%', 'UK 15%', 'Canada 8%'];
const DEMO_MODES     = ['Personal 45%', 'Sports 28%', 'Business 17%', 'Education 10%'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function completionColor(rate: number): string {
  if (rate >= 70) return GAIN;
  if (rate >= 50) return CAUTION;
  return HEAT;
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function KPlayAnalyticsPage() {
  const C       = useColors();
  const insets  = useSafeAreaInsets();
  const topBarH = insets.top + 52;

  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaystudios');
  const isOwner = role === roleCycles[0];

  const [period, setPeriod] = useState<Period>('Last 28 Days');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const styles = useMemo(() => makeStyles(C), [C]);

  // ── JSX ──────────────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <View style={[styles.topBar, { height: topBarH, paddingTop: insets.top, backgroundColor: C.bg }]}>
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

      {/* ── Scroll Content ──────────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={{
          paddingTop: topBarH + 16,
          paddingHorizontal: 16,
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

        {/* ── Overview Stat Cards — 2×2 grid ──────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.overviewGrid}>
            {OVERVIEW_CARDS.map((card, idx) => (
              <Pressable
                key={idx}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={styles.overviewCardWrap}
              >
                <GlassView tier={1} radius={12} style={styles.overviewCard}>
                  <Text style={[styles.overviewValue, { color: C.label }]}>{card.value}</Text>
                  <Text style={[styles.overviewDelta, { color: card.up ? GAIN : HEAT }]}>
                    {card.delta}
                  </Text>
                  <Text style={[styles.overviewLabel, { color: C.secondary }]}>{card.label}</Text>
                </GlassView>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Enrollment Trend Bar Chart ───────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.label }]}>Enrollment Trend</Text>

          <GlassView tier={1} radius={12} style={styles.chartCard}>
            <View style={styles.chartBars}>
              {BAR_HEIGHTS.map((h, idx) => {
                const isLast  = idx === BAR_HEIGHTS.length - 1;
                const opacity = isLast ? 1.0 : 0.3 + (idx / (BAR_HEIGHTS.length - 1)) * 0.7;
                return (
                  <View key={idx} style={styles.barColumn}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${h * 100}%`,
                            backgroundColor: C.label,
                            opacity,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barLabel, { color: C.secondary }]}>
                      {BAR_DAYS[idx]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </GlassView>
        </View>

        {/* ── Revenue by Content ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.label }]}>Revenue by Content</Text>

          <GlassView tier={1} radius={12} style={{ overflow: 'hidden' }}>
            {REVENUE_BY_CONTENT.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.revenueRow,
                  idx < REVENUE_BY_CONTENT.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: C.separator,
                  },
                ]}
              >
                {/* Rank */}
                <Text style={[styles.revenueRank, { color: C.secondary }]}>{item.rank}</Text>

                {/* Emoji + title + type badge */}
                <View style={styles.revenueMeta}>
                  <View style={styles.revenueTitleRow}>
                    <Text style={styles.revenueEmoji}>{item.emoji}</Text>
                    <Text style={[styles.revenueTitle, { color: C.label }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                  </View>
                  <View style={[styles.typeBadge, { backgroundColor: C.surface, borderColor: C.separator }]}>
                    <Text style={[styles.typeBadgeText, { color: C.secondary }]}>{item.type}</Text>
                  </View>
                </View>

                {/* Pct + revenue right */}
                <View style={styles.revenueRight}>
                  <Text style={[styles.revenueValue, { color: GAIN }]}>{item.revenue}</Text>
                  <Text style={[styles.revenuePct, { color: C.secondary }]}>{item.pct}</Text>
                </View>
              </View>
            ))}
          </GlassView>
        </View>

        {/* ── Completion Analysis ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.label }]}>Completion Analysis</Text>

          <GlassView tier={1} radius={12} style={{ overflow: 'hidden' }}>
            {COMPLETION_ROWS.map((item, idx) => {
              const barColor = completionColor(item.rate);
              const needsAttention = item.rate < 50;
              return (
                <View
                  key={idx}
                  style={[
                    styles.completionRow,
                    idx < COMPLETION_ROWS.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: C.separator,
                    },
                  ]}
                >
                  {/* Emoji */}
                  <Text style={styles.completionEmoji}>{item.emoji}</Text>

                  {/* Title + bar */}
                  <View style={styles.completionBody}>
                    <View style={styles.completionTitleRow}>
                      <Text style={[styles.completionTitle, { color: C.label }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={[styles.completionRate, { color: barColor }]}>
                        {item.rate}%
                      </Text>
                    </View>
                    <View style={[styles.progressTrack, { backgroundColor: C.separator }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${item.rate}%`,
                            backgroundColor: barColor,
                          },
                        ]}
                      />
                    </View>
                    {needsAttention && (
                      <Text style={[styles.attentionText, { color: HEAT }]}>Needs attention</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </GlassView>
        </View>

        {/* ── Top Content Card ─────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.label }]}>Top Content</Text>

          <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <GlassView tier={1} radius={12} style={styles.topContentCard}>
              {/* Header row */}
              <View style={styles.topContentHeader}>
                <Text style={styles.topContentEmoji}>📘</Text>
                <View style={styles.topContentMeta}>
                  <Text style={[styles.topContentTitle, { color: C.label }]} numberOfLines={1}>
                    Content Creator Playbook
                  </Text>
                  <View style={[styles.typeBadge, { backgroundColor: C.surface, borderColor: C.separator }]}>
                    <Text style={[styles.typeBadgeText, { color: C.secondary }]}>Course</Text>
                  </View>
                </View>
                <Text style={[styles.topContentRating, { color: GAIN }]}>4.8 ★</Text>
              </View>

              {/* Stats row */}
              <View style={styles.topContentStats}>
                <Text style={[styles.topContentStat, { color: C.secondary }]}>
                  1,240 enrolled
                </Text>
                <Text style={[styles.topContentDot, { color: C.separator }]}>·</Text>
                <Text style={[styles.topContentStat, { color: C.secondary }]}>
                  82% completion
                </Text>
              </View>
            </GlassView>
          </Pressable>
        </View>

        {/* ── Student Demographics ─────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.label }]}>Student Demographics</Text>

          <GlassView tier={1} radius={12} style={styles.demoCard}>
            {/* Locations */}
            <Text style={[styles.demoSubLabel, { color: C.secondary }]}>Locations</Text>
            <View style={[styles.pillRow, { marginBottom: 16 }]}>
              {DEMO_LOCATIONS.map((loc, idx) => (
                <View
                  key={idx}
                  style={[styles.demoPill, { backgroundColor: C.surface, borderColor: C.separator }]}
                >
                  <Text style={[styles.demoPillText, { color: C.secondary }]}>{loc}</Text>
                </View>
              ))}
            </View>

            {/* Modes */}
            <Text style={[styles.demoSubLabel, { color: C.secondary }]}>Modes</Text>
            <View style={styles.pillRow}>
              {DEMO_MODES.map((mode, idx) => (
                <View
                  key={idx}
                  style={[styles.demoPill, { backgroundColor: C.surface, borderColor: C.separator }]}
                >
                  <Text style={[styles.demoPillText, { color: C.secondary }]}>{mode}</Text>
                </View>
              ))}
            </View>
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
    topBar: {
      position: 'absolute',
      top: 0, left: 0, right: 0,
      zIndex: 10,
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 16,
      paddingBottom: 8,
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

    // Overview cards grid
    overviewGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    overviewCardWrap: {
      width: '48%',
    },
    overviewCard: {
      padding: 14,
    },
    overviewValue: {
      fontSize: 22,
      fontWeight: '700',
    },
    overviewDelta: {
      fontSize: 13,
      fontWeight: '600',
      marginTop: 2,
    },
    overviewLabel: {
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

    // Revenue by content
    revenueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      gap: 10,
    },
    revenueRank: {
      fontSize: 18,
      fontWeight: '700',
      width: 24,
      textAlign: 'center',
    },
    revenueMeta: {
      flex: 1,
      gap: 4,
    },
    revenueTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    revenueEmoji: {
      fontSize: 16,
    },
    revenueTitle: {
      fontSize: 13,
      fontWeight: '600',
      flex: 1,
    },
    revenueRight: {
      alignItems: 'flex-end',
      gap: 2,
    },
    revenueValue: {
      fontSize: 14,
      fontWeight: '700',
    },
    revenuePct: {
      fontSize: 12,
    },

    // Type badge
    typeBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
    },
    typeBadgeText: {
      fontSize: 10,
      fontWeight: '600',
    },

    // Completion analysis
    completionRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 14,
      gap: 10,
    },
    completionEmoji: {
      fontSize: 20,
      marginTop: 1,
    },
    completionBody: {
      flex: 1,
      gap: 6,
    },
    completionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    completionTitle: {
      fontSize: 13,
      fontWeight: '600',
      flex: 1,
    },
    completionRate: {
      fontSize: 13,
      fontWeight: '700',
    },
    progressTrack: {
      height: 4,
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      position: 'absolute',
      left: 0,
      top: 0,
      height: 4,
      borderRadius: 2,
    },
    attentionText: {
      fontSize: 10,
      fontWeight: '600',
      marginTop: 2,
    },

    // Top content card
    topContentCard: {
      padding: 16,
      gap: 10,
    },
    topContentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    topContentEmoji: {
      fontSize: 36,
    },
    topContentMeta: {
      flex: 1,
      gap: 4,
    },
    topContentTitle: {
      fontSize: 15,
      fontWeight: '700',
    },
    topContentRating: {
      fontSize: 15,
      fontWeight: '700',
    },
    topContentStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    topContentStat: {
      fontSize: 13,
    },
    topContentDot: {
      fontSize: 13,
    },

    // Student demographics
    demoCard: {
      padding: 16,
    },
    demoSubLabel: {
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
    demoPill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
    },
    demoPillText: {
      fontSize: 11,
    },
  });
}
