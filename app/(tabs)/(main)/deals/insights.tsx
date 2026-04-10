import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { resetFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import {
  MONTHLY_REVENUE, CRM_STAGES,
  getDealsByStage,
} from '@/data/mock-personal-deals';

// ── Constants ─────────────────────────────────────────────────────────────────

const TIME_RANGES = ['This Month', 'This Quarter', 'This Year', 'All Time'] as const;
type TimeRange = typeof TIME_RANGES[number];

const REVENUE_BY_RANGE: Record<TimeRange, { main: string; label: string; change: number; quarter: string; year: string }> = {
  'This Month':   { main: '$12,400',  label: 'This Month',   change: 18,  quarter: '$38,200',  year: '$87,600'  },
  'This Quarter': { main: '$38,200',  label: 'This Quarter', change: 11,  quarter: '$38,200',  year: '$87,600'  },
  'This Year':    { main: '$87,600',  label: 'This Year',    change: -5,  quarter: '$38,200',  year: '$87,600'  },
  'All Time':     { main: '$147,900', label: 'All Time',     change: 0,   quarter: '$38,200',  year: '$87,600'  },
};

const METRICS_BY_RANGE: Record<TimeRange, { winRate: string; winTrend: number; avgDeal: string; avgTrend: number; timeToClose: string; timeTrend: number; totalWon: string }> = {
  'This Month':   { winRate: '68%', winTrend: 4,  avgDeal: '$8,200', avgTrend: 6,  timeToClose: '23 days', timeTrend: -2, totalWon: '14 deals'  },
  'This Quarter': { winRate: '62%', winTrend: 2,  avgDeal: '$7,640', avgTrend: 3,  timeToClose: '26 days', timeTrend: 1,  totalWon: '38 deals'  },
  'This Year':    { winRate: '58%', winTrend: -3, avgDeal: '$6,900', avgTrend: -1, timeToClose: '29 days', timeTrend: 4,  totalWon: '89 deals'  },
  'All Time':     { winRate: '61%', winTrend: 0,  avgDeal: '$7,200', avgTrend: 0,  timeToClose: '27 days', timeTrend: 0,  totalWon: '147 deals' },
};

const TOP_BRANDS = [
  { name: 'Nike',         value: '$15,000' },
  { name: 'TEDx',         value: '$12,000' },
  { name: 'FitLife Pro',  value: '$9,500'  },
  { name: 'Jordan Brand', value: '$8,200'  },
  { name: 'Adidas',       value: '$6,800'  },
];

const DEAL_TYPES = [
  { type: 'Sponsored Post',  count: 6, total: '$28,400', avg: '$4,733',  best: false },
  { type: 'Ambassadorship',  count: 3, total: '$38,500', avg: '$12,833', best: true  },
  { type: 'Speaking',        count: 2, total: '$24,000', avg: '$12,000', best: false },
  { type: 'Consulting',      count: 4, total: '$14,200', avg: '$3,550',  best: false },
  { type: 'Content Bundle',  count: 2, total: '$12,000', avg: '$6,000',  best: false },
];

const PIPELINE_STAGES = [
  { name: 'Lead',        count: 5, value: 18500 },
  { name: 'Contacted',   count: 8, value: 42000 },
  { name: 'Proposal',    count: 4, value: 31200 },
  { name: 'Negotiation', count: 2, value: 24800 },
];

const GAIN = '#5A8A6E';
const HEAT = '#B85C5C';

// ── Screen ────────────────────────────────────────────────────────────────────

export default function InsightsScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const topBarH = insets.top + 52;

  const [activeRange, setActiveRange] = useState<TimeRange>('This Month');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const revenue = REVENUE_BY_RANGE[activeRange];
  const metrics = METRICS_BY_RANGE[activeRange];
  const maxBar = useMemo(() => Math.max(...MONTHLY_REVENUE.map(m => m.value), 1), []);
  const pipelineTotal = PIPELINE_STAGES.reduce((s, p) => s + p.value, 0);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* Top Bar */}
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        height: topBarH, paddingTop: insets.top,
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
        backgroundColor: C.bg,
      }}>
        <KMenuButton onPress={openSidePanel} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ backgroundColor: C.label, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 5 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Insights</Text>
          </View>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Time Range Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginBottom: 12 }} style={{ marginBottom: 12 }}>
          {TIME_RANGES.map(r => {
            const active = r === activeRange;
            return (
              <Pressable
                key={r}
                onPress={() => { Haptics.selectionAsync(); setActiveRange(r); }}
                style={{
                  borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
                  backgroundColor: active ? C.label : C.surface,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: active ? C.label : C.separator,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: active ? '700' : '400', color: active ? C.bg : C.secondary }}>{r}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Revenue Summary */}
        <View style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: C.surface, borderRadius: 16, padding: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
          <View style={{ flexDirection: 'row', marginBottom: 14 }}>
            {[
              { val: revenue.main,    lbl: revenue.label  },
              { val: revenue.quarter, lbl: 'This Quarter' },
              { val: revenue.year,    lbl: 'This Year'    },
            ].map((stat, i) => (
              <React.Fragment key={stat.lbl}>
                {i > 0 && <View style={{ width: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginVertical: 4 }} />}
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontSize: i === 0 ? 22 : 18, fontWeight: '800', color: C.label }}>{stat.val}</Text>
                  <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{stat.lbl}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
          {revenue.change !== 0 ? (
            <Text style={{ fontSize: 13, fontWeight: '600', color: revenue.change > 0 ? GAIN : HEAT }}>
              {revenue.change > 0 ? `+${revenue.change}%` : `${revenue.change}%`} vs last period
            </Text>
          ) : (
            <Text style={{ fontSize: 13, color: C.secondary }}>All-time cumulative</Text>
          )}
        </View>

        {/* Revenue Trend */}
        <View style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: C.surface, borderRadius: 14, padding: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 12 }}>Revenue Trend</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 4 }}>
              {MONTHLY_REVENUE.map((item, idx) => {
                const isLast = idx === MONTHLY_REVENUE.length - 1;
                const barH = Math.max(4, (item.value / maxBar) * 100);
                const displayVal = item.value >= 1000 ? `$${(item.value / 1000).toFixed(0)}k` : `$${item.value}`;
                return (
                  <View key={item.month} style={{ alignItems: 'center', marginHorizontal: 4 }}>
                    <Text style={{ fontSize: 9, color: C.secondary, marginBottom: 2 }}>{displayVal}</Text>
                    <View style={{ width: 28, height: barH, backgroundColor: C.label, opacity: isLast ? 1 : 0.45, borderRadius: 4 }} />
                    <Text style={{ fontSize: 10, color: C.secondary, marginTop: 3 }}>{item.month}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Pipeline Value by Stage */}
        <View style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: C.surface, borderRadius: 14, padding: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Pipeline Value</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: C.label }}>${pipelineTotal.toLocaleString()}</Text>
          </View>
          {PIPELINE_STAGES.map((stage, idx) => {
            const fill = pipelineTotal > 0 ? stage.value / pipelineTotal : 0;
            return (
              <View key={stage.name} style={{ marginBottom: idx < PIPELINE_STAGES.length - 1 ? 12 : 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.label, marginRight: 8 }} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, flex: 1 }}>{stage.name}</Text>
                  <View style={{ backgroundColor: C.separator, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginRight: 8 }}>
                    <Text style={{ fontSize: 10, color: C.secondary }}>{stage.count}</Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>${stage.value.toLocaleString()}</Text>
                </View>
                <View style={{ height: 3, backgroundColor: C.separator, borderRadius: 2 }}>
                  <View style={{ height: 3, backgroundColor: C.label, borderRadius: 2, width: `${fill * 100}%` }} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Key Metrics 2×2 */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, marginBottom: 12 }}>
          {[
            { label: 'Win Rate',      value: metrics.winRate,     trend: metrics.winTrend,    trendUnit: 'pts', lowerIsBetter: false },
            { label: 'Avg Deal Size', value: metrics.avgDeal,     trend: metrics.avgTrend,    trendUnit: '%',   lowerIsBetter: false },
            { label: 'Time to Close', value: metrics.timeToClose, trend: metrics.timeTrend,   trendUnit: 'd',   lowerIsBetter: true  },
            { label: 'Total Won',     value: metrics.totalWon,    trend: 0,                   trendUnit: '',    lowerIsBetter: false },
          ].map(m => (
            <View key={m.label} style={{ width: '47.5%', backgroundColor: C.surface, borderRadius: 12, padding: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
              <Text style={{ fontSize: 11, color: C.secondary, marginBottom: 6 }}>{m.label}</Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: C.label }}>{m.value}</Text>
              {m.trend !== 0 && (
                <Text style={{ fontSize: 12, fontWeight: '600', marginTop: 2, color: (m.lowerIsBetter ? m.trend < 0 : m.trend > 0) ? GAIN : HEAT }}>
                  {m.trend > 0 ? `↑ ${m.trend}${m.trendUnit}` : `↓ ${Math.abs(m.trend)}${m.trendUnit}`}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Top Brands */}
        <View style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: C.surface, borderRadius: 14, padding: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 4 }}>Top Brands</Text>
          {TOP_BRANDS.map((brand, idx) => (
            <View key={brand.name}>
              {idx > 0 && <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator }} />}
              <Pressable
                onPress={() => Haptics.selectionAsync()}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 11 }}
              >
                <Text style={{ fontSize: 13, color: C.secondary, width: 22 }}>{idx + 1}</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, flex: 1 }}>{brand.name}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{brand.value}</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Deal Type Breakdown */}
        <View style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: C.surface, borderRadius: 14, padding: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 4 }}>Deal Type Performance</Text>
          {DEAL_TYPES.map((item, idx) => (
            <View key={item.type}>
              {idx > 0 && <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator }} />}
              <View style={{ paddingVertical: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, flex: 1 }}>{item.type}</Text>
                  <View style={{ backgroundColor: C.separator, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginRight: 6 }}>
                    <Text style={{ fontSize: 10, color: C.secondary }}>{item.count}</Text>
                  </View>
                  {item.best && (
                    <View style={{ backgroundColor: C.label, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginRight: 6 }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: C.bg }}>BEST</Text>
                    </View>
                  )}
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{item.total}</Text>
                </View>
                <Text style={{ fontSize: 11, color: C.secondary }}>avg {item.avg}</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}
