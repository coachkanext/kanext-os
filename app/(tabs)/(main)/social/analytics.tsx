/**
 * Social Analytics — creator social performance dashboard.
 * Accessed from the Analytics Dashboard card on the Social profile page.
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Image, useWindowDimensions, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ── Data ──────────────────────────────────────────────────────────────────────

const PERIODS = ['7d', '30d', '90d'] as const;
type Period = typeof PERIODS[number];

// Overview stats
const OVERVIEW: Record<Period, Array<{ label: string; value: string; change: string; pos: boolean }>> = {
  '7d': [
    { label: 'Profile Views',        value: '2,341',  change: '+18%', pos: true  },
    { label: 'Accounts Reached',      value: '12.4K',  change: '+22%', pos: true  },
    { label: 'Content Interactions',  value: '3,812',  change: '+9%',  pos: true  },
  ],
  '30d': [
    { label: 'Profile Views',        value: '8,920',  change: '+12%', pos: true  },
    { label: 'Accounts Reached',      value: '48.1K',  change: '+15%', pos: true  },
    { label: 'Content Interactions',  value: '14.7K',  change: '+3%',  pos: true  },
  ],
  '90d': [
    { label: 'Profile Views',        value: '24.1K',  change: '+31%', pos: true  },
    { label: 'Accounts Reached',      value: '142K',   change: '+28%', pos: true  },
    { label: 'Content Interactions',  value: '41.2K',  change: '+11%', pos: true  },
  ],
};

// Follower data
const FOLLOWERS: Record<Period, { total: string; net: string; chartPoints: number[] }> = {
  '7d':  { total: '1,247', net: '+47',  chartPoints: [1200, 1210, 1208, 1215, 1228, 1240, 1247] },
  '30d': { total: '1,247', net: '+112', chartPoints: [1135, 1148, 1162, 1175, 1190, 1210, 1228, 1247] },
  '90d': { total: '1,247', net: '+384', chartPoints: [863, 920, 980, 1030, 1080, 1130, 1180, 1220, 1247] },
};

// Content performance
const CONTENT_PERF = [
  { id: 'cp1', seed: 'cp-01', type: 'Post',  caption: 'Shipping the OS for institutions',  impressions: '8,240', engagement: '892', rate: '10.8%' },
  { id: 'cp2', seed: 'cp-02', type: 'Reel',  caption: 'Day in the life — founder edition', impressions: '6,112', engagement: '734', rate: '12.0%' },
  { id: 'cp3', seed: 'cp-03', type: 'KTV',   caption: 'Building KaNeXT: The Origin Story', impressions: '4,890', engagement: '521', rate: '10.7%' },
  { id: 'cp4', seed: 'cp-04', type: 'Post',  caption: '5 AM club hits different',          impressions: '3,402', engagement: '310', rate: '9.1%'  },
  { id: 'cp5', seed: 'cp-05', type: 'Post',  caption: 'Community combine recap',            impressions: '2,980', engagement: '214', rate: '7.2%'  },
];

// Audience data
const AGE_RANGES = [
  { label: '13–17', pct: 4  },
  { label: '18–24', pct: 28 },
  { label: '25–34', pct: 37 },
  { label: '35–44', pct: 19 },
  { label: '45–54', pct: 8  },
  { label: '55+',   pct: 4  },
];
const TOP_LOCATIONS = [
  { city: 'Atlanta, GA',    pct: 18 },
  { city: 'Houston, TX',    pct: 13 },
  { city: 'Chicago, IL',    pct: 11 },
  { city: 'New York, NY',   pct: 9  },
  { city: 'Los Angeles, CA',pct: 7  },
];
// Active times: rows = days (Mon–Sun), cols = hours (6am,9am,12pm,3pm,6pm,9pm)
const ACTIVE_TIMES = [
  [0.2, 0.4, 0.6, 0.5, 0.7, 0.9],
  [0.3, 0.5, 0.7, 0.6, 0.8, 0.95],
  [0.2, 0.4, 0.65, 0.55, 0.75, 0.9],
  [0.25, 0.45, 0.7, 0.6, 0.8, 1.0],
  [0.3, 0.5, 0.6, 0.5, 0.9, 0.95],
  [0.15, 0.3, 0.5, 0.65, 0.85, 0.8],
  [0.1, 0.25, 0.45, 0.6, 0.7, 0.7],
];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const HOURS = ['6am','9am','12pm','3pm','6pm','9pm'];

// Reach breakdown
const REACH_DATA: Record<Period, { followers: string; nonFollowers: string; follPct: number }> = {
  '7d':  { followers: '7,840',  nonFollowers: '4,560',  follPct: 63 },
  '30d': { followers: '29,100', nonFollowers: '19,000', follPct: 60 },
  '90d': { followers: '84,200', nonFollowers: '57,800', follPct: 59 },
};
// Reach chart
const REACH_CHART: Record<Period, number[]> = {
  '7d':  [1800, 2400, 1900, 2800, 3100, 2200, 2700],
  '30d': [8200, 9400, 11200, 14200, 12800, 11400, 13800, 15400],
  '90d': [34000, 42000, 38000, 51000, 48000, 56000, 62000, 58000, 71000],
};

// Profile activity
const PROFILE_ACTIVITY: Record<Period, Array<{ icon: string; label: string; value: string; change: string; pos: boolean }>> = {
  '7d': [
    { icon: 'person.crop.circle', label: 'Profile Visits',     value: '2,341', change: '+18%', pos: true },
    { icon: 'link',               label: 'External Link Taps', value: '187',   change: '+24%', pos: true },
    { icon: 'person.badge.plus',  label: 'Follow Button Taps', value: '63',    change: '+41%', pos: true },
  ],
  '30d': [
    { icon: 'person.crop.circle', label: 'Profile Visits',     value: '8,920', change: '+12%', pos: true },
    { icon: 'link',               label: 'External Link Taps', value: '712',   change: '+19%', pos: true },
    { icon: 'person.badge.plus',  label: 'Follow Button Taps', value: '248',   change: '+31%', pos: true },
  ],
  '90d': [
    { icon: 'person.crop.circle', label: 'Profile Visits',     value: '24.1K', change: '+31%', pos: true },
    { icon: 'link',               label: 'External Link Taps', value: '2,140', change: '+44%', pos: true },
    { icon: 'person.badge.plus',  label: 'Follow Button Taps', value: '814',   change: '+62%', pos: true },
  ],
};

// ── Sub-components ────────────────────────────────────────────────────────────

// Section wrapper with title
function Section({ title, children, C }: { title: string; children: React.ReactNode; C: ComponentColors }) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 12, letterSpacing: 0.3 }}>{title}</Text>
      {children}
    </View>
  );
}

// Period toggle pills
function PeriodPills({ period, onChange, C }: { period: Period; onChange: (p: Period) => void; C: ComponentColors }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 }}>
      {PERIODS.map(p => {
        const active = period === p;
        return (
          <Pressable
            key={p}
            onPress={() => { Haptics.selectionAsync(); onChange(p); }}
            style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, backgroundColor: active ? C.label : C.surface, borderWidth: active ? 0 : StyleSheet.hairlineWidth, borderColor: C.separator }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: active ? C.bg : C.secondary }}>
              {p === '7d' ? '7d' : p === '30d' ? '30d' : '90d'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Spark line chart (simple polyline using Views)
function SparkLine({ points, C, height = 60 }: { points: number[]; C: ComponentColors; height?: number }) {
  const { width: W } = useWindowDimensions();
  const chartW = W - 32 - 28; // horizontal padding
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const segW = chartW / (points.length - 1);

  const coords = points.map((v, i) => ({
    x: i * segW,
    y: height - ((v - min) / range) * height,
  }));

  return (
    <View style={{ height: height + 8, paddingHorizontal: 0, overflow: 'hidden' }}>
      {coords.slice(0, -1).map((pt, i) => {
        const next = coords[i + 1];
        const dx = next.x - pt.x;
        const dy = next.y - pt.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: pt.x,
              top: pt.y + 4,
              width: len,
              height: 2,
              backgroundColor: C.label,
              transformOrigin: '0 1px',
              transform: [{ rotate: `${angle}deg` }],
            }}
          />
        );
      })}
      {/* Dots */}
      {coords.map((pt, i) => (
        <View key={`d${i}`} style={{ position: 'absolute', left: pt.x - 3, top: pt.y + 4 - 3, width: 6, height: 6, borderRadius: 3, backgroundColor: C.label }} />
      ))}
    </View>
  );
}

// Horizontal bar (for age range)
function HBar({ pct, C }: { pct: number; C: ComponentColors }) {
  return (
    <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: C.separator, overflow: 'hidden' }}>
      <View style={{ width: `${pct}%`, height: '100%', backgroundColor: C.label, borderRadius: 3 }} />
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────

export default function SocialAnalyticsScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [period, setPeriod] = useState<Period>('30d');
  const [contentSort, setContentSort] = useState<'reach' | 'engagement'>('reach');

  const overview  = OVERVIEW[period];
  const followers = FOLLOWERS[period];
  const reach     = REACH_DATA[period];
  const reachPts  = REACH_CHART[period];
  const follPts   = FOLLOWERS[period].chartPoints;
  const profAct   = PROFILE_ACTIVITY[period];

  const sortedContent = useMemo(() => {
    return [...CONTENT_PERF].sort((a, b) => {
      if (contentSort === 'reach') {
        return parseInt(b.impressions.replace(/,/g, '')) - parseInt(a.impressions.replace(/,/g, ''));
      }
      return parseFloat(b.rate) - parseFloat(a.rate);
    });
  }, [contentSort]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: insets.top, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, opacity }}>
        <View style={{ height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }} style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}>
            <IconSymbol name="chevron.left" size={22} color={C.label} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ backgroundColor: C.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 5, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>Analytics</Text>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </Animated.View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 52 + 8, paddingBottom: 120 }} onScroll={onScroll} scrollEventThrottle={scrollEventThrottle}>
        {/* Period pills — global toggle */}
        <PeriodPills period={period} onChange={setPeriod} C={C} />

        {/* ── Overview ── */}
        <Section title="Overview" C={C}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {overview.map(stat => (
              <View key={stat.label} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, padding: 12 }}>
                <Text style={{ fontSize: 19, fontWeight: '800', color: C.label, marginBottom: 2 }}>{stat.value}</Text>
                <Text style={{ fontSize: 10, color: C.secondary, marginBottom: 6, lineHeight: 13 }}>{stat.label}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <IconSymbol name={stat.pos ? 'arrow.up.right' : 'arrow.down.right'} size={10} color={stat.pos ? '#5A8A6E' : '#B85C5C'} />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: stat.pos ? '#5A8A6E' : '#B85C5C' }}>{stat.change}</Text>
                </View>
              </View>
            ))}
          </View>
        </Section>

        {/* ── Followers ── */}
        <Section title="Followers" C={C}>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
              <Text style={{ fontSize: 28, fontWeight: '800', color: C.label }}>{followers.total}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#5A8A6E' }}>{followers.net} last {period}</Text>
            </View>
            <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 16 }}>Total followers</Text>
            <SparkLine points={follPts} C={C} height={70} />
          </View>
        </Section>

        {/* ── Content Performance ── */}
        <Section title="Content Performance" C={C}>
          {/* Sort pills */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            {(['reach', 'engagement'] as const).map(s => {
              const active = contentSort === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => { Haptics.selectionAsync(); setContentSort(s); }}
                  style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 18, backgroundColor: active ? C.label : C.surface, borderWidth: active ? 0 : StyleSheet.hairlineWidth, borderColor: C.separator }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: active ? C.bg : C.secondary }}>
                    {s === 'reach' ? 'By Reach' : 'By Engagement'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, overflow: 'hidden' }}>
            {sortedContent.map((item, i) => (
              <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: i < sortedContent.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
                <Image source={{ uri: `https://picsum.photos/seed/${item.seed}/120/120` }} style={{ width: 48, height: 48, borderRadius: 6 }} resizeMode="cover" />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <View style={{ backgroundColor: C.bg, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: C.secondary }}>{item.type}</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: C.label, flex: 1 }} numberOfLines={1}>{item.caption}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Text style={{ fontSize: 11, color: C.secondary }}>{item.impressions} reach</Text>
                    <Text style={{ fontSize: 11, color: C.secondary }}>{item.engagement} interactions</Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: C.label }}>{item.rate}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Section>

        {/* ── Audience ── */}
        <Section title="Audience" C={C}>
          {/* Age range */}
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Age Range</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, padding: 14, marginBottom: 12 }}>
            {AGE_RANGES.map(row => (
              <View key={row.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Text style={{ width: 40, fontSize: 12, color: C.secondary }}>{row.label}</Text>
                <HBar pct={row.pct} C={C} />
                <Text style={{ width: 32, fontSize: 12, fontWeight: '600', color: C.label, textAlign: 'right' }}>{row.pct}%</Text>
              </View>
            ))}
          </View>
          {/* Gender */}
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Gender Split</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, padding: 14, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <View style={{ flex: 58, height: 8, borderRadius: 4, backgroundColor: C.label }} />
              <View style={{ flex: 42, height: 8, borderRadius: 4, backgroundColor: C.separator }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.label }} />
                <Text style={{ fontSize: 12, color: C.secondary }}>Male</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>58%</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.secondary }} />
                <Text style={{ fontSize: 12, color: C.secondary }}>Female</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>42%</Text>
              </View>
            </View>
          </View>
          {/* Top Locations */}
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Top Locations</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, overflow: 'hidden', marginBottom: 12 }}>
            {TOP_LOCATIONS.map((loc, i) => (
              <View key={loc.city} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: i < TOP_LOCATIONS.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
                <Text style={{ width: 20, fontSize: 12, fontWeight: '700', color: C.secondary }}>#{i + 1}</Text>
                <Text style={{ flex: 1, fontSize: 13, color: C.label }}>{loc.city}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{loc.pct}%</Text>
              </View>
            ))}
          </View>
          {/* Active Times heatmap */}
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Most Active Times</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, padding: 14 }}>
            {/* Hour labels */}
            <View style={{ flexDirection: 'row', marginLeft: 32, marginBottom: 6 }}>
              {HOURS.map(h => (
                <Text key={h} style={{ flex: 1, fontSize: 9, color: C.muted, textAlign: 'center' }}>{h}</Text>
              ))}
            </View>
            {ACTIVE_TIMES.map((row, di) => (
              <View key={di} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ width: 28, fontSize: 10, color: C.secondary }}>{DAYS[di]}</Text>
                {row.map((val, hi) => (
                  <View
                    key={hi}
                    style={{ flex: 1, height: 20, borderRadius: 3, marginHorizontal: 1, backgroundColor: C.label, opacity: Math.max(0.08, val * 0.9) }}
                  />
                ))}
              </View>
            ))}
          </View>
        </Section>

        {/* ── Reach ── */}
        <Section title="Reach" C={C}>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, padding: 16, marginBottom: 12 }}>
            <SparkLine points={reachPts} C={C} height={70} />
          </View>
          {/* Followers vs non-followers */}
          <View style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, padding: 14 }}>
            <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 10 }}>Reach breakdown</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              <View style={{ flex: reach.follPct, height: 8, borderRadius: 4, backgroundColor: C.label }} />
              <View style={{ flex: 100 - reach.follPct, height: 8, borderRadius: 4, backgroundColor: C.separator }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ gap: 2 }}>
                <Text style={{ fontSize: 11, color: C.secondary }}>Followers</Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{reach.followers}</Text>
                <Text style={{ fontSize: 11, color: C.secondary }}>{reach.follPct}%</Text>
              </View>
              <View style={{ gap: 2, alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 11, color: C.secondary }}>Non-followers</Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{reach.nonFollowers}</Text>
                <Text style={{ fontSize: 11, color: C.secondary }}>{100 - reach.follPct}%</Text>
              </View>
            </View>
          </View>
        </Section>

        {/* ── Profile Activity ── */}
        <Section title="Profile Activity" C={C}>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, overflow: 'hidden' }}>
            {profAct.map((item, i) => (
              <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: i < profAct.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
                <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
                <Text style={{ flex: 1, fontSize: 14, color: C.label }}>{item.label}</Text>
                <View style={{ alignItems: 'flex-end', gap: 2 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{item.value}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <IconSymbol name={item.pos ? 'arrow.up.right' : 'arrow.down.right'} size={10} color={item.pos ? '#5A8A6E' : '#B85C5C'} />
                    <Text style={{ fontSize: 11, fontWeight: '600', color: item.pos ? '#5A8A6E' : '#B85C5C' }}>{item.change}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Section>

      </ScrollView>
    </View>
  );
}
