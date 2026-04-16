/**
 * Company Finances — Business CEO KPay default screen.
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

const EXPENSES = [
  { label: 'Payroll',    amount: '$12,400', pct: 38, share: 0.38 },
  { label: 'Software',   amount: '$4,200',  pct: 13, share: 0.13 },
  { label: 'Marketing',  amount: '$3,800',  pct: 12, share: 0.12 },
  { label: 'Travel',     amount: '$2,100',  pct: 6,  share: 0.06 },
  { label: 'Legal',      amount: '$1,500',  pct: 5,  share: 0.05 },
  { label: 'Office',     amount: '$1,200',  pct: 4,  share: 0.04 },
];

const OVERDUE = [
  { client: 'Acme Corp',       invoice: 'INV-0041', amount: '$3,500', days: 14 },
  { client: 'Horizon Media',   invoice: 'INV-0038', amount: '$1,200', days: 22 },
];

const BUDGET_ITEMS = [
  { dept: 'Engineering', budget: 20000, actual: 18400 },
  { dept: 'Marketing',   budget: 8000,  actual: 9200  },
  { dept: 'Operations',  budget: 6000,  actual: 5100  },
  { dept: 'Sales',       budget: 5000,  actual: 4600  },
];

export default function CompanyFinancesScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('business');
  const isCEO = role === roleCycles[0];

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
              <Text style={[st.pillText, { color: C.label }]}>Company Finances</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isCEO} />
          </View>
        </View>
      </Animated.View>

      <ScrollView onScroll={onScroll} scrollEventThrottle={scrollEventThrottle} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}>

        {/* Revenue hero */}
        <GlassView tier={1} radius={16} style={{ padding: 20, marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, letterSpacing: 0.4, marginBottom: 6 }}>REVENUE THIS MONTH</Text>
          <Text style={{ fontSize: 40, fontWeight: '700', color: C.label, letterSpacing: -1 }}>$32,500</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: GAIN, marginTop: 4 }}>+18% vs last month</Text>
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginVertical: 14 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>$48,200</Text>
              <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>AR (receivable)</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>$25,200</Text>
              <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>AP (payable)</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: GAIN }}>+$7,300</Text>
              <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>Net Cash</Text>
            </View>
          </View>
        </GlassView>

        {/* Cash flow */}
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>Cash Flow</Text>
        <GlassView tier={1} radius={14} style={{ padding: 16, marginBottom: 24 }}>
          {[
            { label: 'Inflows this month',  value: '$32,500', color: GAIN  },
            { label: 'Outflows this month', value: '$25,200', color: HEAT  },
            { label: 'Net cash flow',       value: '+$7,300', color: GAIN  },
          ].map((r, idx) => (
            <View key={r.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: idx > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: C.separator }}>
              <Text style={{ fontSize: 14, color: C.label }}>{r.label}</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: r.color }}>{r.value}</Text>
            </View>
          ))}
        </GlassView>

        {/* Expense breakdown */}
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>Expense Breakdown</Text>
        <GlassView tier={1} radius={14} style={{ padding: 16, marginBottom: 24 }}>
          {EXPENSES.map((e, idx) => (
            <View key={e.label} style={{ paddingVertical: 10, borderTopWidth: idx > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: C.separator }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '500', color: C.label }}>{e.label}</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{e.pct}%</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{e.amount}</Text>
                </View>
              </View>
              <View style={{ height: 4, borderRadius: 2, backgroundColor: C.separator, overflow: 'hidden' }}>
                <View style={{ height: 4, borderRadius: 2, backgroundColor: C.label, width: `${e.pct}%` as any }} />
              </View>
            </View>
          ))}
        </GlassView>

        {/* Overdue */}
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>Overdue Invoices</Text>
        <GlassView tier={1} radius={14} style={{ overflow: 'hidden', marginBottom: 24 }}>
          {OVERDUE.map((o, idx) => (
            <View key={o.invoice} style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: idx < OVERDUE.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
              <IconSymbol name="exclamationmark.circle.fill" size={20} color={HEAT} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{o.client}</Text>
                <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{o.invoice} · {o.days} days overdue</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: HEAT }}>{o.amount}</Text>
            </View>
          ))}
        </GlassView>

        {/* Budget vs actual */}
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>Budget vs Actual</Text>
        <GlassView tier={1} radius={14} style={{ padding: 16 }}>
          {BUDGET_ITEMS.map((b, idx) => {
            const over = b.actual > b.budget;
            const pct = Math.min((b.actual / b.budget) * 100, 100);
            return (
              <View key={b.dept} style={{ paddingVertical: 10, borderTopWidth: idx > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: C.separator }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: '500', color: C.label }}>{b.dept}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: over ? HEAT : GAIN }}>
                    {over ? `+$${(b.actual - b.budget).toLocaleString()} over` : `$${(b.budget - b.actual).toLocaleString()} left`}
                  </Text>
                </View>
                <View style={{ height: 4, borderRadius: 2, backgroundColor: C.separator, overflow: 'hidden' }}>
                  <View style={{ height: 4, borderRadius: 2, backgroundColor: over ? HEAT : GAIN, width: `${pct}%` as any }} />
                </View>
              </View>
            );
          })}
        </GlassView>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  pill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  pillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
});
