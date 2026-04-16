/**
 * Personal KPay — Earnings screen.
 * Owner: This Month card, By Source breakdown, 6-month trend.
 */

import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { REVENUE_SOURCES, REVENUE_TREND } from '@/data/mock-personal-kaypay';

const TOP_BAR_H = 52;
const GAIN = '#5A8A6E';

export default function PersonalKPayEarnings() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const topBarH = insets.top + TOP_BAR_H;
  const scrollH = useScrollHeader(topBarH);
  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaypay');
  const isOwner = role === roleCycles[0];
  const router = useRouter();
  useEffect(() => { if (!isOwner) router.back(); }, [isOwner]);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const maxAmount = Math.max(...REVENUE_TREND.map(r => r.amount));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Top bar ── */}
      <Animated.View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        height: topBarH, paddingTop: insets.top, backgroundColor: C.bg,
        opacity: scrollH.opacity,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
      }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 10 }}>
          <View style={{ flex: 1 }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ backgroundColor: C.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Earnings</Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
            <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      {/* ── Content ── */}
      <ScrollView
        onScroll={scrollH.onScroll}
        scrollEventThrottle={scrollH.scrollEventThrottle}
        contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* This Month summary */}
        <View style={{ backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 6 }}>This Month</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Text style={{ fontSize: 32, fontWeight: '800', color: C.label, letterSpacing: -1 }}>$4,200</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${GAIN}20`, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 12, color: GAIN }}>↑</Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: GAIN }}>+8% vs last month</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View>
              <Text style={{ fontSize: 11, color: C.secondary, marginBottom: 2 }}>TRANSACTIONS</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>24</Text>
            </View>
            <View>
              <Text style={{ fontSize: 11, color: C.secondary, marginBottom: 2 }}>AVG PER TX</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>$175</Text>
            </View>
            <View>
              <Text style={{ fontSize: 11, color: C.secondary, marginBottom: 2 }}>PENDING</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>$340</Text>
            </View>
          </View>
        </View>

        {/* By Source */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>By Source</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
          {REVENUE_SOURCES.map((src, i) => (
            <View key={src.label} style={{
              flexDirection: 'row', alignItems: 'center',
              paddingHorizontal: 16, paddingVertical: 14,
              borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: C.separator,
            }}>
              <Text style={{ fontSize: 14, color: C.label, flex: 1 }}>{src.label}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 80, height: 4, backgroundColor: C.separator, borderRadius: 2 }}>
                  <View style={{ width: `${src.pct}%` as any, height: 4, backgroundColor: src.color, borderRadius: 2 }} />
                </View>
                <Text style={{ fontSize: 12, color: C.secondary, width: 30, textAlign: 'right' }}>{src.pct}%</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, width: 64, textAlign: 'right' }}>${src.amount.toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 6-Month Trend */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>6-Month Trend</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 80 }}>
            {REVENUE_TREND.map(r => (
              <View key={r.month} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                <View style={{ flex: 1, width: '100%', justifyContent: 'flex-end' }}>
                  <View style={{ width: '100%', height: `${Math.round((r.amount / maxAmount) * 100)}%` as any, backgroundColor: C.label, borderRadius: 4 }} />
                </View>
                <Text style={{ fontSize: 10, color: C.secondary }}>{r.month}</Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            <Text style={{ fontSize: 12, color: C.secondary }}>Oct 2025</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: C.label }}>$4,200 in Mar</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
