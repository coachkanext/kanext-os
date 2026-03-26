/**
 * Social Analytics — reach, impressions, engagement, follower trends.
 * Admin-only screen accessed from Social side panel.
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { getSammyPosts, formatPostTime } from '@/data/mock-social';

// ── Mock analytics data ────────────────────────────────────────────────────────

const PERIODS = ['7d', '30d', '90d'] as const;
type Period = typeof PERIODS[number];

const STATS: Record<Period, { reach: string; impressions: string; engagement: string; followers: string; reachTrend: string; impTrend: string; engTrend: string; follTrend: string }> = {
  '7d':  { reach: '12.4K', impressions: '31.2K', engagement: '4.2%', followers: '+127', reachTrend: '+18%', impTrend: '+22%', engTrend: '+0.8%', follTrend: '+14%' },
  '30d': { reach: '48.1K', impressions: '124K',  engagement: '3.9%', followers: '+412', reachTrend: '+12%', impTrend: '+15%', engTrend: '+0.3%', follTrend: '+11%' },
  '90d': { reach: '142K',  impressions: '380K',  engagement: '4.1%', followers: '+1.2K', reachTrend: '+31%', impTrend: '+28%', engTrend: '+1.1%', follTrend: '+32%' },
};

const CHART_DATA: Record<Period, { label: string; value: number }[]> = {
  '7d': [
    { label: 'Mon', value: 1400 }, { label: 'Tue', value: 1800 },
    { label: 'Wed', value: 1200 }, { label: 'Thu', value: 2100 },
    { label: 'Fri', value: 2400 }, { label: 'Sat', value: 1600 },
    { label: 'Sun', value: 1900 },
  ],
  '30d': [
    { label: 'W1', value: 8200 }, { label: 'W2', value: 11400 },
    { label: 'W3', value: 9800 }, { label: 'W4', value: 14200 },
  ],
  '90d': [
    { label: 'Jan', value: 34000 }, { label: 'Feb', value: 48000 },
    { label: 'Mar', value: 60000 },
  ],
};

const TOP_CONTENT = [
  { type: 'Post',  label: 'Training Day 💪',         reach: '4.2K', engagement: '8.4%', badge: '🔥' },
  { type: 'Reel',  label: 'Game Highlights — Finals', reach: '3.8K', engagement: '11.2%', badge: '🎯' },
  { type: 'Post',  label: 'Team announcement',        reach: '2.1K', engagement: '6.7%', badge: '📣' },
];

// ── Bar chart ─────────────────────────────────────────────────────────────────

function BarChart({ data, C }: { data: { label: string; value: number }[]; C: ComponentColors }) {
  const maxVal = Math.max(...data.map(d => d.value));
  const BAR_MAX_H = 100;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, paddingHorizontal: 4, height: BAR_MAX_H + 28 }}>
      {data.map((d, i) => {
        const h = Math.max(4, Math.round((d.value / maxVal) * BAR_MAX_H));
        const isMax = d.value === maxVal;
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <View
              style={{
                width: '100%', height: h, borderRadius: 4,
                backgroundColor: isMax ? C.accent : C.accent + '50',
              }}
            />
            <Text style={{ fontSize: 9, color: C.muted, textAlign: 'center' }}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, trend, icon, C }: {
  label: string; value: string; trend: string; icon: string; C: ComponentColors;
}) {
  const isPos = trend.startsWith('+');
  return (
    <View style={[sc.card, { backgroundColor: C.surface, borderColor: C.separator }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <IconSymbol name={icon as any} size={16} color={C.muted} />
        <View style={[sc.trendBadge, { backgroundColor: isPos ? '#5A8A6E18' : '#B85C5C18' }]}>
          <Text style={[sc.trendText, { color: isPos ? '#5A8A6E' : '#B85C5C' }]}>{trend}</Text>
        </View>
      </View>
      <Text style={[sc.value, { color: C.label }]}>{value}</Text>
      <Text style={[sc.label, { color: C.secondary }]}>{label}</Text>
    </View>
  );
}

const sc = StyleSheet.create({
  card:       { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, minWidth: 0 },
  trendBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  trendText:  { fontSize: 10, fontWeight: '700' },
  value:      { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  label:      { fontSize: 11, fontWeight: '500' },
});

// ── Main screen ────────────────────────────────────────────────────────────────

export default function AnalyticsScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('7d');

  const stats = STATS[period];
  const chartData = CHART_DATA[period];

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8, borderBottomColor: C.separator }]}>
        <Pressable
          style={s.backBtn}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
        >
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={[s.title, { color: C.label }]}>Analytics</Text>
        <View style={[s.adminBadge, { backgroundColor: C.accent + '18' }]}>
          <IconSymbol name="lock.fill" size={10} color={C.accent} />
          <Text style={[s.adminText, { color: C.accent }]}>Admin</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>

        {/* Period toggle */}
        <View style={[s.periodRow, { borderBottomColor: C.separator }]}>
          {PERIODS.map(p => (
            <Pressable
              key={p}
              style={[s.periodPill, period === p && { backgroundColor: C.label, borderColor: C.label }, { borderColor: C.separator }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPeriod(p); }}
            >
              <Text style={[s.periodText, { color: period === p ? C.bg : C.secondary }]}>
                {p === '7d' ? 'Last 7 days' : p === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Stat cards 2×2 */}
        <View style={s.statsSection}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>OVERVIEW</Text>
          <View style={s.statsRow}>
            <StatCard label="Reach"       value={stats.reach}       trend={stats.reachTrend} icon="eye"              C={C} />
            <StatCard label="Impressions" value={stats.impressions} trend={stats.impTrend}   icon="chart.bar"        C={C} />
          </View>
          <View style={[s.statsRow, { marginTop: 8 }]}>
            <StatCard label="Engagement"     value={stats.engagement} trend={stats.engTrend}  icon="heart"            C={C} />
            <StatCard label="New Followers"  value={stats.followers}  trend={stats.follTrend} icon="person.badge.plus" C={C} />
          </View>
        </View>

        {/* Bar chart */}
        <View style={s.chartSection}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>REACH OVER TIME</Text>
          <View style={[s.chartCard, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <BarChart data={chartData} C={C} />
          </View>
        </View>

        {/* Top content */}
        <View style={s.topSection}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>TOP PERFORMING CONTENT</Text>
          <View style={[s.topCard, { backgroundColor: C.surface, borderColor: C.separator }]}>
            {TOP_CONTENT.map((item, i) => (
              <View
                key={i}
                style={[
                  s.topRow,
                  { borderBottomColor: C.separator },
                  i < TOP_CONTENT.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth },
                ]}
              >
                <Text style={[s.rankNum, { color: C.muted }]}>#{i + 1}</Text>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[s.topBadge, { backgroundColor: C.surfacePressed, color: C.muted }]}>{item.type}</Text>
                    <Text style={[s.topLabel, { color: C.label }]} numberOfLines={1}>{item.label}</Text>
                    <Text style={{ fontSize: 13 }}>{item.badge}</Text>
                  </View>
                  <Text style={[s.topMeta, { color: C.secondary }]}>{item.reach} reach · {item.engagement} engagement</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Follower growth note */}
        <View style={s.noteSection}>
          <View style={[s.noteCard, { backgroundColor: C.surfacePressed, borderColor: C.inputBorder }]}>
            <IconSymbol name="info.circle" size={14} color={C.muted} />
            <Text style={[s.noteText, { color: C.secondary }]}>
              Analytics reflect content posted under your active brand. Switch brands to view their analytics.
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen:       { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 8 },
  backBtn:      { width: 40, alignItems: 'flex-start', justifyContent: 'center' },
  title:        { flex: 1, fontSize: 17, fontWeight: '700' },
  adminBadge:   { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  adminText:    { fontSize: 11, fontWeight: '600' },
  periodRow:    { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  periodPill:   { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5 },
  periodText:   { fontSize: 12, fontWeight: '500' },
  statsSection: { paddingHorizontal: 16, paddingTop: 20 },
  statsRow:     { flexDirection: 'row', gap: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 10 },
  chartSection: { paddingHorizontal: 16, paddingTop: 20 },
  chartCard:    { borderRadius: 14, borderWidth: 1, padding: 16 },
  topSection:   { paddingHorizontal: 16, paddingTop: 20 },
  topCard:      { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  topRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
  rankNum:      { width: 22, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  topLabel:     { flex: 1, fontSize: 13, fontWeight: '500' },
  topBadge:     { fontSize: 10, fontWeight: '600', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  topMeta:      { fontSize: 11, marginTop: 2 },
  noteSection:  { paddingHorizontal: 16, paddingTop: 16 },
  noteCard:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  noteText:     { flex: 1, fontSize: 12, lineHeight: 17 },
});
