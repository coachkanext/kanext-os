/**
 * Education Hub — Finance (President only)
 * Tuition collected, budget, financial aid, revenue by program, outstanding balances.
 */

import React, { useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const GAIN = '#5A8A6E';
const HEAT = '#B85C5C';

const DEPARTMENTS = [
  { name: 'Academic Affairs',  spent: 1200000, budget: 1400000 },
  { name: 'Student Services',  spent: 480000,  budget: 450000  },
  { name: 'Operations',        spent: 620000,  budget: 700000  },
  { name: 'IT & Technology',   spent: 310000,  budget: 300000  },
  { name: 'Marketing',         spent: 190000,  budget: 250000  },
];

const PROGRAM_REVENUE = [
  { program: 'MBA',                   enrollment: 142, tuition: 8500, revenue: 1207000 },
  { program: 'BS Diagnostic Imaging', enrollment: 115, tuition: 7200, revenue: 828000  },
  { program: 'BA Business Admin',     enrollment: 89,  tuition: 6800, revenue: 605200  },
  { program: "MS Int'l Business",     enrollment: 68,  tuition: 8200, revenue: 557600  },
  { program: 'DBA',                   enrollment: 22,  tuition: 9500, revenue: 209000  },
];

function fmt(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000)    return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
}

function SH({ title, C }: { title: string; C: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 24 }}>
      <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.8, textTransform: 'uppercase' }}>{title}</Text>
    </View>
  );
}

export default function EduFinance() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [role, toggleRole, roleCycles] = useDemoRole('education');
  const isPresident = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{ backgroundColor: C.bg, paddingTop: insets.top }}>
        <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
            <Text style={{ fontSize: 20, fontWeight: '800', letterSpacing: -0.5, color: C.label }}>K</Text>
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 5 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Finance</Text>
            </View>
          </View>
          <RolePill role={role} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleRole(); }} isPrimary={isPresident} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {!isPresident ? (
          <View style={{ marginTop: 60, alignItems: 'center' }}>
            <IconSymbol name="lock.fill" size={32} color={C.secondary} />
            <Text style={{ fontSize: 15, color: C.secondary, marginTop: 12, textAlign: 'center' }}>This section is for administrators</Text>
          </View>
        ) : (
          <>
            {/* TUITION COLLECTED */}
            <View style={{ marginTop: 16 }} />
            <View style={{ backgroundColor: C.surface, borderRadius: 16, padding: 20, marginBottom: 8 }}>
              <Text style={{ fontSize: 32, fontWeight: '800', color: C.label, marginBottom: 4 }}>$3.24M</Text>
              <Text style={{ fontSize: 14, color: C.secondary, marginBottom: 8 }}>Tuition Collected — Spring 2026</Text>
              <Text style={{ fontSize: 13, color: GAIN, marginBottom: 4 }}>↑8.7% vs $2.98M last semester</Text>
              <Text style={{ fontSize: 13, color: C.secondary }}>94.2% of billed tuition collected</Text>
            </View>

            {/* BUDGET OVERVIEW */}
            <SH title="Budget Overview" C={C} />
            <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                {[
                  { label: 'Total Budget', value: '$4.1M' },
                  { label: 'Spent',        value: '$2.8M' },
                  { label: 'Remaining',    value: '$1.3M' },
                ].map((s, i) => (
                  <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 17, fontWeight: '600', color: C.label, marginBottom: 2 }}>{s.value}</Text>
                    <Text style={{ fontSize: 11, color: C.secondary }}>{s.label}</Text>
                  </View>
                ))}
              </View>
              {DEPARTMENTS.map((d, i) => {
                const over = d.spent > d.budget;
                return (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
                    <Text style={{ flex: 1, fontSize: 13, color: C.label }}>{d.name}</Text>
                    <Text style={{ fontSize: 12, color: over ? HEAT : C.secondary }}>{fmt(d.spent)}</Text>
                    <Text style={{ fontSize: 12, color: C.muted }}> / {fmt(d.budget)}</Text>
                  </View>
                );
              })}
            </View>

            {/* FINANCIAL AID SUMMARY */}
            <SH title="Financial Aid Summary" C={C} />
            <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, marginBottom: 12 }}>Total Aid Distributed: $1.82M</Text>
              {[
                { name: 'Institutional Scholarships', amount: '$940K' },
                { name: 'Grants (Pell + State)',       amount: '$580K' },
                { name: 'Institutional Aid',           amount: '$300K' },
              ].map((a, i) => (
                <View key={i} style={{ flexDirection: 'row', paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
                  <Text style={{ flex: 1, fontSize: 14, color: C.label }}>{a.name}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{a.amount}</Text>
                </View>
              ))}
              <View style={{ marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, paddingTop: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Avg net cost: $4,180/semester</Text>
                <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>after $8,360 avg annual aid</Text>
              </View>
            </View>

            {/* REVENUE BY PROGRAM */}
            <SH title="Revenue by Program" C={C} />
            {PROGRAM_REVENUE.map((p, i) => (
              <View key={i} style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 2 }}>{p.program}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{p.enrollment} students · ${p.tuition.toLocaleString()}/semester</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{fmt(p.revenue)}</Text>
              </View>
            ))}

            {/* OUTSTANDING BALANCES */}
            <SH title="Outstanding Balances" C={C} />
            <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 8 }}>
                23 students with outstanding balances — $187,400 total
              </Text>
              <Text style={{ fontSize: 13, color: GAIN, marginBottom: 6 }}>
                18 of 23 on payment plans (78% adherence)
              </Text>
              <Text style={{ fontSize: 13, color: HEAT, marginBottom: 14 }}>
                5 students at risk of enrollment hold — $12,400 total
              </Text>
              <Pressable style={{ borderWidth: 1, borderColor: C.separator, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start' }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>View All Balances</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
