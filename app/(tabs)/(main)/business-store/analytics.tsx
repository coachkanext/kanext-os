/**
 * Business Store — Analytics (CEO only)
 * Period pills, KPI cards, revenue by product, top products, subscription metrics.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 54;
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

type Period = 'This Month' | 'This Quarter' | 'This Year';

const REVENUE_BY_PRODUCT = [
  { name: 'Basketball Intelligence API Pro',    revenue: 1996, pct: 31 },
  { name: 'KaNeXT OS Enterprise',               revenue: 1911, pct: 30 },
  { name: 'KaNeXT OS Pro',                      revenue: 1305, pct: 20 },
  { name: 'Basketball Intelligence API Starter', revenue: 1188, pct: 19 },
];

const TOP_PRODUCTS = [
  { name: 'KaNeXT OS Pro',                    units: 45, revenue: 1305, trend: '+18%', up: true  },
  { name: 'Basketball Intelligence API Starter', units: 12, revenue: 1188, trend: '+5%',  up: true  },
  { name: 'Basketball Intelligence API Pro',   units: 4,  revenue: 1996, trend: '+12%', up: true  },
  { name: 'KaNeXT Tee',                        units: 38, revenue: 1330, trend: '-4%',  up: false },
  { name: 'KaNeXT Hoodie',                     units: 22, revenue: 1430, trend: '+2%',  up: true  },
];

const MONTHLY_MRR = [
  { month:'Nov', mrr:3200 },
  { month:'Dec', mrr:3800 },
  { month:'Jan', mrr:4100 },
  { month:'Feb', mrr:4900 },
  { month:'Mar', mrr:5700 },
  { month:'Apr', mrr:6400 },
];

export default function StoreAnalyticsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('business:store');
  const isCEO = role === roleCycles[0];

  const [period, setPeriod] = useState<Period>('This Month');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (!isCEO) router.replace('/(tabs)/(main)/business-store/purchases' as any);
  }, [isCEO, router]);

  if (!isCEO) return null;

  const maxMrr = Math.max(...MONTHLY_MRR.map(m => m.mrr));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* Top Bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.iconBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Analytics</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 8 }}>
            <Pressable onPress={() => Alert.alert('Export', 'CSV / PDF — coming soon')} style={s.iconBtn}>
              <IconSymbol name="square.and.arrow.up" size={20} color={C.label} />
            </Pressable>
            <RolePill role={role} onPress={cycleRole} isPrimary={isCEO} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: totalTopH + 16, paddingBottom: insets.bottom + 100 }}
      >

        {/* Period pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 16 }}>
          {(['This Month', 'This Quarter', 'This Year'] as Period[]).map(p => (
            <Pressable
              key={p}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPeriod(p); }}
              style={[s.filterPill, { backgroundColor: period === p ? C.label : C.surface, borderColor: period === p ? C.label : C.separator }]}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: period === p ? C.bg : C.secondary }}>{p}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* KPI cards */}
        <View style={[s.row, { gap: 10, paddingHorizontal: 16, marginBottom: 24 }]}>
          {[
            { label: 'MRR',      value: '$6,400', trend: '+12%', up: true  },
            { label: 'Orders',   value: '63',     trend: '+8%',  up: true  },
            { label: 'Avg Order',value: '$101',   trend: '-3%',  up: false },
            { label: 'Churn',    value: '2.1%',   trend: '-0.4%',up: true  },
          ].map(kpi => (
            <GlassView key={kpi.label} tier={1} style={[s.kpiCard, { flex: 1 }]}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: C.label }}>{kpi.value}</Text>
              <Text style={{ fontSize: 10, color: C.secondary, marginTop: 2 }}>{kpi.label}</Text>
              <View style={[s.row, { gap: 3, marginTop: 4 }]}>
                <IconSymbol
                  name={kpi.up ? 'arrow.up.right' : 'arrow.down.right'}
                  size={10}
                  color={kpi.up ? GAIN : HEAT}
                />
                <Text style={{ fontSize: 10, fontWeight: '700', color: kpi.up ? GAIN : HEAT }}>{kpi.trend}</Text>
              </View>
            </GlassView>
          ))}
        </View>

        {/* MRR Growth chart */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>MRR Growth</Text>
          <GlassView tier={1} style={{ borderRadius: 14, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 80 }}>
              {MONTHLY_MRR.map((m, i) => {
                const barH = (m.mrr / maxMrr) * 80;
                const isLast = i === MONTHLY_MRR.length - 1;
                return (
                  <View key={m.month} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                    <View style={{ width: '100%', height: barH, borderRadius: 3, backgroundColor: isLast ? C.label : C.separator }} />
                    <Text style={{ fontSize: 9, color: C.secondary }}>{m.month}</Text>
                  </View>
                );
              })}
            </View>
          </GlassView>
        </View>

        {/* Revenue by product */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Revenue by Product</Text>
          <GlassView tier={1} style={{ borderRadius: 14, padding: 14 }}>
            {REVENUE_BY_PRODUCT.map((p, i) => (
              <View key={p.name} style={{ marginBottom: i < REVENUE_BY_PRODUCT.length - 1 ? 12 : 0 }}>
                <View style={[s.row, { justifyContent: 'space-between', marginBottom: 4 }]}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, flex: 1 }} numberOfLines={1}>{p.name}</Text>
                  <View style={s.row}>
                    <Text style={{ fontSize: 11, color: C.secondary, marginRight: 8 }}>{p.pct}%</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: GAIN }}>${p.revenue.toLocaleString()}/mo</Text>
                  </View>
                </View>
                <View style={[s.progressTrack, { backgroundColor: C.separator }]}>
                  <View style={[s.progressFill, { width: `${p.pct}%` as any, backgroundColor: GAIN }]} />
                </View>
              </View>
            ))}
          </GlassView>
        </View>

        {/* Top products */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Top Products</Text>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {TOP_PRODUCTS.map((p, i) => (
              <View key={p.name} style={[s.row, { paddingVertical: 12, paddingHorizontal: 14 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: C.secondary, width: 18 }}>{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }} numberOfLines={1}>{p.name}</Text>
                  <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{p.units} units · ${p.revenue.toLocaleString()}</Text>
                </View>
                <View style={[s.row, { gap: 3 }]}>
                  <IconSymbol name={p.up ? 'arrow.up.right' : 'arrow.down.right'} size={10} color={p.up ? GAIN : HEAT} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: p.up ? GAIN : HEAT }}>{p.trend}</Text>
                </View>
              </View>
            ))}
          </GlassView>
        </View>

        {/* Subscription metrics */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Subscription Metrics</Text>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {[
              { label: 'Total Subscribers',  value: '64',     color: C.label },
              { label: 'New This Month',      value: '+8',     color: GAIN    },
              { label: 'Churned This Month',  value: '-1',     color: HEAT    },
              { label: 'Net New',             value: '+7',     color: GAIN    },
              { label: 'Churn Rate',          value: '2.1%',   color: C.label },
              { label: 'Avg LTV',             value: '$720',   color: C.label },
            ].map((m, i) => (
              <View key={m.label} style={[s.row, { paddingVertical: 13, paddingHorizontal: 14 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
                <Text style={{ fontSize: 14, color: C.label, flex: 1 }}>{m.label}</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: m.color }}>{m.value}</Text>
              </View>
            ))}
          </GlassView>
        </View>

      </ScrollView>

    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:          { flex: 1 },
    topBarOuter:   { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
    iconBtn:       { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
    titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    row:           { flexDirection: 'row', alignItems: 'center' },
    sectionTitle:  { fontSize: 17, fontWeight: '700' },
    filterPill:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
    kpiCard:       { alignItems: 'center', padding: 12, borderRadius: 12 },
    progressTrack: { height: 5, borderRadius: 2.5, overflow: 'hidden' },
    progressFill:  { height: 5, borderRadius: 2.5 },
  });
}
