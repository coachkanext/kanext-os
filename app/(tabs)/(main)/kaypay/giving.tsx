/**
 * Giving — Community Pastor KPay default screen.
 * Church giving dashboard: this week, funds, trend, top givers, alerts.
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

const FUNDS = [
  { name: 'General Offering', balance: '$28,400', goal: 40000, current: 28400 },
  { name: 'Building Fund',    balance: '$62,800', goal: 100000, current: 62800 },
  { name: 'Missions',         balance: '$8,200',  goal: 15000,  current: 8200  },
  { name: 'Benevolence',      balance: '$3,100',  goal: 5000,   current: 3100  },
];

const TREND_MONTHS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
const TREND_H = [0.60, 0.55, 0.50, 0.65, 0.70, 0.80, 0.85, 0.90, 0.72, 0.68, 0.78, 1.00];

const TOP_GIVERS = [
  { initials: 'MT', name: 'M. Thompson',    amount: '$850/mo',  ytd: '$3,400'  },
  { initials: 'AW', name: 'A. Williams',    amount: '$600/mo',  ytd: '$2,400'  },
  { initials: 'JB', name: 'J. Brown',       amount: '$500/mo',  ytd: '$2,000'  },
  { initials: 'SC', name: 'S. Carter',      amount: '$400/mo',  ytd: '$1,600'  },
];

export default function GivingScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('community:kaypay');
  const isPastor = role === roleCycles[0];

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
              <Text style={[st.pillText, { color: C.label }]}>Giving</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
          </View>
        </View>
      </Animated.View>

      <ScrollView onScroll={onScroll} scrollEventThrottle={scrollEventThrottle} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}>

        {/* This week hero */}
        <GlassView tier={1} radius={16} style={{ padding: 20, marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, letterSpacing: 0.4, marginBottom: 6 }}>THIS WEEK'S GIVING</Text>
          <Text style={{ fontSize: 40, fontWeight: '700', color: C.label, letterSpacing: -1 }}>$4,850</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: GAIN, marginTop: 4 }}>+8% vs last week</Text>
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginVertical: 14 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>$18,240</Text>
              <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>Month-to-date</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>$102,500</Text>
              <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>Year-to-date</Text>
            </View>
          </View>
        </GlassView>

        {/* Fund breakdown */}
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>Fund Breakdown</Text>
        <GlassView tier={1} radius={14} style={{ padding: 16, marginBottom: 24 }}>
          {FUNDS.map((f, idx) => {
            const pct = Math.round((f.current / f.goal) * 100);
            return (
              <View key={f.name} style={{ paddingVertical: 10, borderTopWidth: idx > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: C.separator }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{f.name}</Text>
                  <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{pct}%</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{f.balance}</Text>
                  </View>
                </View>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: C.separator, overflow: 'hidden' }}>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: pct >= 80 ? GAIN : C.label, width: `${pct}%` as any }} />
                </View>
              </View>
            );
          })}
        </GlassView>

        {/* Giving trend */}
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>12-Month Trend</Text>
        <GlassView tier={1} radius={14} style={{ padding: 16, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 3 }}>
            {TREND_MONTHS.map((m, i) => (
              <View key={m} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <View style={{ width: '100%', height: TREND_H[i] * 64, backgroundColor: C.label, opacity: i === TREND_MONTHS.length - 1 ? 1 : 0.25 + i * 0.06, borderRadius: 3 }} />
                <Text style={{ fontSize: 7, color: C.secondary }}>{m.slice(0, 1)}</Text>
              </View>
            ))}
          </View>
        </GlassView>

        {/* Top givers */}
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>Top Givers</Text>
        <GlassView tier={1} radius={14} style={{ overflow: 'hidden', marginBottom: 24 }}>
          {TOP_GIVERS.map((g, idx) => (
            <View key={g.initials} style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: idx < TOP_GIVERS.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{g.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{g.name}</Text>
                <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{g.amount}</Text>
              </View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{g.ytd} YTD</Text>
            </View>
          ))}
        </GlassView>

        {/* Alerts */}
        <GlassView tier={1} radius={14} style={{ padding: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>Alerts</Text>
          {[
            { icon: 'exclamationmark.triangle.fill', msg: 'Missions Fund 15% below monthly target', color: CAUTION },
            { icon: 'clock.fill',                    msg: '3 pledges past due — $1,200 total',       color: HEAT   },
          ].map((a, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 8, borderTopWidth: idx > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: C.separator }}>
              <IconSymbol name={a.icon as any} size={16} color={a.color} />
              <Text style={{ flex: 1, fontSize: 13, color: C.label }}>{a.msg}</Text>
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
