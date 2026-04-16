/**
 * Store Analytics — Owner revenue, order, and product performance.
 */

import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 52;
const GAIN      = '#5A8A6E';
const CAUTION   = '#B8943E';

const TOP_PRODUCTS = [
  { title: 'Creator Masterclass',       revenue: 46488, sold: 312, type: 'Course'     },
  { title: 'Content Strategy Playbook', revenue: 24563, sold: 847, type: 'Digital'    },
  { title: '1-on-1 Coaching Call',      revenue: 13350, sold: 89,  type: 'Service'    },
  { title: 'Build in Public Hoodie',    revenue: 9135,  sold: 203, type: 'Merch'      },
  { title: 'Monthly Newsletter',        revenue: 930,   sold: 186, type: 'Membership' },
];

const REVENUE_TREND = [
  { month: 'Nov', value: 6200  },
  { month: 'Dec', value: 8900  },
  { month: 'Jan', value: 7400  },
  { month: 'Feb', value: 9800  },
  { month: 'Mar', value: 12100 },
  { month: 'Apr', value: 8300  },
];

const MAX_TREND = Math.max(...REVENUE_TREND.map(r => r.value));

const STORE_METRICS = [
  { label: 'Conversion Rate', value: '3.4%', note: 'Visits → purchases'  },
  { label: 'Avg Order Value',  value: '$97',  note: 'Per transaction'     },
  { label: 'Repeat Buyers',    value: '28%',  note: 'Of total customers'  },
  { label: 'Avg Rating',       value: '4.8 ★', note: 'Across all products' },
];

export default function StoreAnalyticsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const topBarH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);
  const [role, cycleRole, roleCycles] = useDemoRole('personal:store');
  const isOwner = role === roleCycles[0];
  const router = useRouter();
  useEffect(() => { if (!isOwner) router.navigate('/(tabs)/(main)/store' as any); }, [isOwner]);
  const [selectedBar, setSelectedBar] = useState<string | null>(null);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const totalRevenue = TOP_PRODUCTS.reduce((s, p) => s + p.revenue, 0);
  const totalOrders  = TOP_PRODUCTS.reduce((s, p) => s + p.sold, 0);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, paddingTop: insets.top, backgroundColor: C.bg, opacity, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
          <View style={{ flex: 1 }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ backgroundColor: C.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Analytics</Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{ paddingTop: topBarH + 20, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Key metrics */}
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 28 }}>
          {[
            { label: 'Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}K` },
            { label: 'Orders',  value: totalOrders.toLocaleString() },
            { label: 'Products', value: `${TOP_PRODUCTS.length}` },
            { label: 'Avg ★',   value: '4.8' },
          ].map(stat => (
            <View key={stat.label} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 12, alignItems: 'center', gap: 3 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: C.label, letterSpacing: -0.5 }} numberOfLines={1} adjustsFontSizeToFit>{stat.value}</Text>
              <Text style={{ fontSize: 9, color: C.secondary, textAlign: 'center' }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Revenue trend */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 16, marginBottom: 12 }}>
          Revenue Trend
        </Text>
        <View style={{ backgroundColor: C.surface, marginHorizontal: 16, borderRadius: 14, padding: 16, marginBottom: 28 }}>
          {/* Tooltip */}
          {selectedBar ? (() => {
            const r = REVENUE_TREND.find(x => x.month === selectedBar)!;
            return (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>{r.month} Revenue</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: C.label }}>${r.value.toLocaleString()}</Text>
              </View>
            );
          })() : (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 12, color: C.secondary }}>Tap a bar for details</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 80 }}>
            {REVENUE_TREND.map(r => {
              const barH = Math.max(4, Math.round((r.value / MAX_TREND) * 80));
              const isSelected = selectedBar === r.month;
              return (
                <Pressable
                  key={r.month}
                  style={{ flex: 1, alignItems: 'center', gap: 6 }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedBar(prev => prev === r.month ? null : r.month);
                  }}
                >
                  <View style={{ width: '100%', height: barH, backgroundColor: isSelected ? C.label : GAIN, borderRadius: 4 }} />
                  <Text style={{ fontSize: 10, color: isSelected ? C.label : C.secondary, fontWeight: isSelected ? '700' : '400' }}>{r.month}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Top products */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 16, marginBottom: 12 }}>
          Top Products
        </Text>
        <View style={{ backgroundColor: C.surface, marginHorizontal: 16, borderRadius: 14, overflow: 'hidden', marginBottom: 28 }}>
          {TOP_PRODUCTS.map((p, idx) => {
            const pct = Math.round((p.revenue / totalRevenue) * 100);
            return (
              <View key={p.title} style={{ paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: idx === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }} numberOfLines={1}>{p.title}</Text>
                    <Text style={{ fontSize: 11, color: C.secondary }}>{p.type} · {p.sold.toLocaleString()} sold</Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>${(p.revenue / 1000).toFixed(1)}K</Text>
                </View>
                <View style={{ height: 3, backgroundColor: C.separator, borderRadius: 2 }}>
                  <View style={{ height: 3, width: `${pct}%` as any, backgroundColor: GAIN, borderRadius: 2 }} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Store performance */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 16, marginBottom: 12 }}>
          Store Performance
        </Text>
        <View style={{ backgroundColor: C.surface, marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' }}>
          {STORE_METRICS.map((m, idx) => (
            <View key={m.label} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: idx === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{m.label}</Text>
                <Text style={{ fontSize: 11, color: C.secondary }}>{m.note}</Text>
              </View>
              <Text style={{ fontSize: 16, fontWeight: '800', color: C.label }}>{m.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
