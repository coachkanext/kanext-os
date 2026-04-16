/**
 * Program Finances — Athletics Head Coach KPay default screen.
 * Budget overview, revenue, expenses, budget vs actual, scholarship tracker, NIL pool.
 */
import React, { useCallback } from 'react';
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
const HEAT = '#B85C5C';
const CAUTION = '#B8943E';
const TOP_BAR_H = 52;

const REVENUE_ITEMS = [
  { label: 'Booster Giving',     amount: '$82,000', share: 0.48 },
  { label: 'NIL Contributions',  amount: '$38,000', share: 0.22 },
  { label: 'Ticket Sales',       amount: '$24,000', share: 0.14 },
  { label: 'Merchandise',        amount: '$18,000', share: 0.11 },
  { label: 'Broadcast Rights',   amount: '$9,000',  share: 0.05 },
];

const EXPENSE_ITEMS = [
  { label: 'Travel',             amount: '$48,200', pct: 30, over: false },
  { label: 'Scholarships',       amount: '$72,800', pct: 45, over: false },
  { label: 'Equipment',          amount: '$18,400', pct: 11, over: false },
  { label: 'Recruiting',         amount: '$12,600', pct:  8, over: false },
  { label: 'Game Ops',           amount: '$7,200',  pct:  4, over: false },
  { label: 'Marketing',          amount: '$3,800',  pct:  2, over: false },
];

const BUDGET_VS = [
  { label: 'Travel',    budget: 45000, actual: 48200 },
  { label: 'Equipment', budget: 20000, actual: 18400 },
  { label: 'Recruiting',budget: 15000, actual: 12600 },
  { label: 'Game Ops',  budget: 8000,  actual: 7200  },
];

const SCHOLARSHIPS = [
  { name: 'Laolu Kalejaiye',   year: 'Jr', renewal: 'Jun 2026', status: 'Renewing'  },
  { name: 'Marcus D.',         year: 'Sr', renewal: 'May 2026', status: 'Final Year' },
  { name: 'Devon T.',          year: 'Fr', renewal: 'Jun 2026', status: 'Renewing'  },
  { name: 'Isaiah R.',         year: 'So', renewal: 'Jun 2026', status: 'Review'    },
];

export default function ProgramFinancesScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('sports:agenda');
  const isCoach = role === roleCycles[0];

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
              <Text style={[st.pillText, { color: C.label }]}>Program Finances</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isCoach} />
          </View>
        </View>
      </Animated.View>

      <ScrollView onScroll={onScroll} scrollEventThrottle={scrollEventThrottle} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}>

        {/* Budget overview */}
        <GlassView tier={1} radius={16} style={{ padding: 20, marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, letterSpacing: 0.4, marginBottom: 6 }}>PROGRAM BUDGET — FY2026</Text>
          <Text style={{ fontSize: 38, fontWeight: '700', color: C.label, letterSpacing: -1 }}>$425,000</Text>
          <Text style={{ fontSize: 12, color: C.secondary, marginTop: 4 }}>Funded by Athletic Department</Text>
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginVertical: 14 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>$312,000</Text>
              <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>Spent</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: GAIN }}>$113,000</Text>
              <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>Remaining</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>73%</Text>
              <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>Used</Text>
            </View>
          </View>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: C.separator, overflow: 'hidden', marginTop: 14 }}>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: C.label, width: '73%' }} />
          </View>
        </GlassView>

        {/* Revenue */}
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>Revenue Sources</Text>
        <GlassView tier={1} radius={14} style={{ padding: 16, marginBottom: 24 }}>
          {REVENUE_ITEMS.map((r, idx) => (
            <View key={r.label} style={{ paddingVertical: 10, borderTopWidth: idx > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: C.separator }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '500', color: C.label }}>{r.label}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{r.amount}</Text>
              </View>
              <View style={{ height: 4, borderRadius: 2, backgroundColor: C.separator, overflow: 'hidden' }}>
                <View style={{ height: 4, borderRadius: 2, backgroundColor: C.label, width: `${Math.round(r.share * 100)}%` as any }} />
              </View>
            </View>
          ))}
        </GlassView>

        {/* Budget vs actual */}
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>Budget vs Actual</Text>
        <GlassView tier={1} radius={14} style={{ padding: 16, marginBottom: 24 }}>
          {BUDGET_VS.map((b, idx) => {
            const over = b.actual > b.budget;
            const pct = Math.min((b.actual / b.budget) * 100, 100);
            return (
              <View key={b.label} style={{ paddingVertical: 10, borderTopWidth: idx > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: C.separator }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: '500', color: C.label }}>{b.label}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: over ? HEAT : GAIN }}>
                    {over ? `$${(b.actual - b.budget).toLocaleString()} over` : `$${(b.budget - b.actual).toLocaleString()} under`}
                  </Text>
                </View>
                <View style={{ height: 4, borderRadius: 2, backgroundColor: C.separator, overflow: 'hidden' }}>
                  <View style={{ height: 4, borderRadius: 2, backgroundColor: over ? HEAT : GAIN, width: `${pct}%` as any }} />
                </View>
              </View>
            );
          })}
        </GlassView>

        {/* Scholarship tracker */}
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 4 }}>Scholarship Tracker</Text>
        <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 12 }}>NAIA MBB limit: 11 scholarships · 9 allocated · 2 available</Text>
        <GlassView tier={1} radius={14} style={{ overflow: 'hidden', marginBottom: 24 }}>
          {SCHOLARSHIPS.map((s, idx) => (
            <View key={s.name} style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: idx < SCHOLARSHIPS.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{s.name}</Text>
                <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{s.year} · Renewal {s.renewal}</Text>
              </View>
              <View style={{ backgroundColor: s.status === 'Review' ? CAUTION + '22' : GAIN + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: s.status === 'Review' ? CAUTION : GAIN }}>{s.status}</Text>
              </View>
            </View>
          ))}
        </GlassView>

        {/* NIL pool */}
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>NIL Pool</Text>
        <GlassView tier={1} radius={14} style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
            <View>
              <Text style={{ fontSize: 28, fontWeight: '700', color: C.label }}>$28,000</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>Pool balance</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: GAIN }}>+$4,500</Text>
              <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>This month</Text>
            </View>
          </View>
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginBottom: 14 }} />
          {[
            { label: 'Fan contributions', value: '$18,000' },
            { label: 'Collective inflows', value: '$10,000' },
            { label: 'Per-player avg (PTV)', value: '$3,111' },
          ].map((r, idx) => (
            <View key={r.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: idx > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: C.separator }}>
              <Text style={{ fontSize: 13, color: C.label }}>{r.label}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{r.value}</Text>
            </View>
          ))}
        </GlassView>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  pill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  pillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
});
