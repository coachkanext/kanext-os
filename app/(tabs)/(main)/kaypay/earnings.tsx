/**
 * Earnings — Personal Owner KPay default screen.
 * Creator revenue dashboard: total earnings, sources, trend, recent transactions, payout.
 */
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlassView } from '@/components/ui/glass-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const GAIN = '#5A8A6E';
const TOP_BAR_H = 52;

const SOURCES = [
  { label: 'Subscriptions',    pct: 43, amount: '$2,470', share: 0.43 },
  { label: 'Digital Products', pct: 19, amount: '$1,100', share: 0.19 },
  { label: 'Brand Deals',      pct: 16, amount: '$920',   share: 0.16 },
  { label: 'Services',         pct: 10, amount: '$580',   share: 0.10 },
  { label: 'Courses',          pct:  6, amount: '$340',   share: 0.06 },
  { label: 'Affiliate',        pct:  4, amount: '$230',   share: 0.04 },
  { label: 'Tips',             pct:  2, amount: '$120',   share: 0.02 },
];

const BAR_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr'];
const BAR_HEIGHTS = [0.55, 0.70, 0.82, 1.00];

const RECENT_TXS = [
  { id: 'e1', icon: 'person.fill',    desc: 'Jordan W. subscribed to Supporter',        amount: '+$10.00',  time: '2h ago'   },
  { id: 'e2', icon: 'doc.text.fill',  desc: 'Content Strategy Playbook — Sale',          amount: '+$29.00',  time: '5h ago'   },
  { id: 'e3', icon: 'star.fill',      desc: 'Brand Deal — Nike Campus Campaign',         amount: '+$500.00', time: 'Yesterday' },
  { id: 'e4', icon: 'person.fill',    desc: 'Maya A. subscribed to Supporter',           amount: '+$10.00',  time: 'Yesterday' },
  { id: 'e5', icon: 'video.fill',     desc: 'Coaching Call — 60 min',                   amount: '+$150.00', time: 'Apr 13'   },
];

export default function EarningsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaypay');
  const isOwner = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: insets.top, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, opacity }}>
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' }}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[st.pill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[st.pillText, { color: C.label }]}>Earnings</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      <ScrollView onScroll={onScroll} scrollEventThrottle={scrollEventThrottle} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}>

        {/* Total earnings hero */}
        <GlassView tier={1} radius={16} style={{ padding: 20, marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, letterSpacing: 0.4, marginBottom: 6 }}>TOTAL EARNINGS</Text>
          <Text style={{ fontSize: 40, fontWeight: '700', color: C.label, letterSpacing: -1 }}>$3,400</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: GAIN }}>+12% vs last month</Text>
          </View>
          <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginVertical: 14 }]} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {[{ label: 'This Week', val: '$820' }, { label: 'This Month', val: '$3,400' }, { label: 'This Year', val: '$22,600' }].map(s => (
              <View key={s.label} style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{s.val}</Text>
                <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </GlassView>

        {/* Revenue by source */}
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>Revenue by Source</Text>
        <GlassView tier={1} radius={14} style={{ padding: 16, marginBottom: 24 }}>
          {/* Stacked bar */}
          <View style={{ height: 10, borderRadius: 5, flexDirection: 'row', overflow: 'hidden', marginBottom: 16 }}>
            {SOURCES.map((s, i) => (
              <View key={i} style={{ flex: s.share, backgroundColor: C.label, opacity: 1 - i * 0.12 }} />
            ))}
          </View>
          {SOURCES.map((s, idx) => (
            <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: idx > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: C.separator }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.label, opacity: 1 - idx * 0.12, marginRight: 10 }} />
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: C.label }}>{s.label}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginRight: 12 }}>{s.pct}%</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{s.amount}</Text>
            </View>
          ))}
        </GlassView>

        {/* Trend chart */}
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>Earnings Trend</Text>
        <GlassView tier={1} radius={14} style={{ padding: 16, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 8 }}>
            {BAR_MONTHS.map((m, i) => (
              <View key={m} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                <View style={{ width: '100%', height: BAR_HEIGHTS[i] * 64, backgroundColor: C.label, opacity: i === BAR_MONTHS.length - 1 ? 1 : 0.35 + i * 0.15, borderRadius: 4 }} />
                <Text style={{ fontSize: 10, color: C.secondary }}>{m}</Text>
              </View>
            ))}
          </View>
        </GlassView>

        {/* Recent transactions */}
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>Recent Earnings</Text>
        <GlassView tier={1} radius={14} style={{ overflow: 'hidden', marginBottom: 24 }}>
          {RECENT_TXS.map((tx, idx) => (
            <View key={tx.id} style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: idx < RECENT_TXS.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
                <IconSymbol name={tx.icon as any} size={15} color={C.label} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '500', color: C.label }} numberOfLines={1}>{tx.desc}</Text>
                <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{tx.time}</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: GAIN }}>{tx.amount}</Text>
            </View>
          ))}
        </GlassView>

        {/* Payout */}
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>Payout</Text>
        <GlassView tier={1} radius={14} style={{ padding: 16, gap: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 12, color: C.secondary }}>Available to cash out</Text>
              <Text style={{ fontSize: 24, fontWeight: '700', color: C.label, marginTop: 2 }}>$3,400.00</Text>
            </View>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={{ backgroundColor: C.label, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Cash Out</Text>
            </Pressable>
          </View>
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator }} />
          <Text style={{ fontSize: 12, color: C.secondary }}>Next scheduled payout: Apr 25 · to Chase ••4521</Text>
        </GlassView>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  pill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  pillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
});
