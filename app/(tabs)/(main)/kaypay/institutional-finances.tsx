/**
 * Institutional Finances — Education President KPay default screen.
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

const PROGRAMS = [
  { name: 'Business Admin', revenue: '$312,000', share: 0.37 },
  { name: 'Health Sciences', revenue: '$268,500', share: 0.32 },
  { name: 'Social Sciences', revenue: '$160,200', share: 0.19 },
  { name: 'General Studies', revenue: '$101,300', share: 0.12 },
];

const AID_TYPES = [
  { type: 'Federal Grants',       amount: '$182,400', pct: 38 },
  { type: 'Institutional Grants', amount: '$144,000', pct: 30 },
  { type: 'Scholarships',         amount: '$115,200', pct: 24 },
  { type: 'Work-Study',           amount: '$38,400',  pct: 8  },
];

const DEPTS = [
  { name: 'Academic Affairs', budget: 280000, spent: 196000 },
  { name: 'Student Services',  budget: 120000, spent: 88400  },
  { name: 'Athletics',         budget: 95000,  spent: 71200  },
  { name: 'Facilities',        budget: 140000, spent: 152000 },
];

export default function InstitutionalFinancesScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('education');
  const isPresident = role === roleCycles[0];

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
              <Text style={[st.pillText, { color: C.label }]}>Institutional Finances</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isPresident} />
          </View>
        </View>
      </Animated.View>

      <ScrollView onScroll={onScroll} scrollEventThrottle={scrollEventThrottle} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}>

        {/* Tuition hero */}
        <GlassView tier={1} radius={16} style={{ padding: 20, marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, letterSpacing: 0.4, marginBottom: 6 }}>TUITION COLLECTED — SPRING 2026</Text>
          <Text style={{ fontSize: 38, fontWeight: '700', color: C.label, letterSpacing: -1 }}>$842,000</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: GAIN }}>+6% vs last semester</Text>
            <View style={{ backgroundColor: GAIN + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: GAIN }}>78% collected</Text>
            </View>
          </View>
        </GlassView>

        {/* Revenue by program */}
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>Revenue by Program</Text>
        <GlassView tier={1} radius={14} style={{ padding: 16, marginBottom: 24 }}>
          {PROGRAMS.map((p, idx) => (
            <View key={p.name} style={{ paddingVertical: 10, borderTopWidth: idx > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: C.separator }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '500', color: C.label }}>{p.name}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{p.revenue}</Text>
              </View>
              <View style={{ height: 4, borderRadius: 2, backgroundColor: C.separator, overflow: 'hidden' }}>
                <View style={{ height: 4, borderRadius: 2, backgroundColor: C.label, width: `${Math.round(p.share * 100)}%` as any }} />
              </View>
            </View>
          ))}
        </GlassView>

        {/* Financial aid */}
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>Financial Aid</Text>
        <GlassView tier={1} radius={14} style={{ padding: 16, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
            <View>
              <Text style={{ fontSize: 22, fontWeight: '700', color: C.label }}>$480,000</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>Total aid distributed</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>$8,640</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>Avg net cost/student</Text>
            </View>
          </View>
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginBottom: 14 }} />
          {AID_TYPES.map((a, idx) => (
            <View key={a.type} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: idx > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: C.separator }}>
              <Text style={{ fontSize: 13, color: C.label }}>{a.type}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{a.amount}</Text>
            </View>
          ))}
        </GlassView>

        {/* Dept budgets */}
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>Department Budgets</Text>
        <GlassView tier={1} radius={14} style={{ padding: 16, marginBottom: 24 }}>
          {DEPTS.map((d, idx) => {
            const over = d.spent > d.budget;
            const pct = Math.min((d.spent / d.budget) * 100, 100);
            return (
              <View key={d.name} style={{ paddingVertical: 10, borderTopWidth: idx > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: C.separator }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: '500', color: C.label }}>{d.name}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: over ? HEAT : C.secondary }}>
                    ${d.spent.toLocaleString()} / ${d.budget.toLocaleString()}
                  </Text>
                </View>
                <View style={{ height: 4, borderRadius: 2, backgroundColor: C.separator, overflow: 'hidden' }}>
                  <View style={{ height: 4, borderRadius: 2, backgroundColor: over ? HEAT : GAIN, width: `${pct}%` as any }} />
                </View>
              </View>
            );
          })}
        </GlassView>

        {/* Outstanding balances */}
        <GlassView tier={1} radius={14} style={{ padding: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>Outstanding Balances</Text>
          {[
            { label: 'Students with unpaid balance', value: '47 students', color: CAUTION },
            { label: 'Total outstanding',             value: '$183,400',   color: HEAT   },
            { label: 'On payment plans',              value: '31 students', color: GAIN  },
            { label: 'Payment plan adherence',        value: '89%',         color: GAIN  },
          ].map((r, idx) => (
            <View key={r.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: idx > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: C.separator }}>
              <Text style={{ fontSize: 13, color: C.label }}>{r.label}</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: r.color }}>{r.value}</Text>
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
