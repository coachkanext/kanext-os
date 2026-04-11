/**
 * Budget — Pastor MANAGE: annual budget tracker with category breakdown.
 * Pastor only — no redirect needed (panel only shows to Pastor).
 */

import React, { useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { KMenuButton } from '@/components/ui/k-menu-button';

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

const TOP_BAR_H = 52;

interface BudgetCategory {
  category: string;
  spent: number;
  budget: number;
}

const CATEGORIES: BudgetCategory[] = [
  { category: 'Staff / Payroll',   spent: 87000, budget: 135000 },
  { category: 'Facilities',        spent: 18000, budget: 24000  },
  { category: 'Ministry Programs', spent: 12000, budget: 18000  },
  { category: 'Missions',          spent: 8500,  budget: 12000  },
  { category: 'Operations',        spent: 6000,  budget: 11000  },
  { category: 'Events',            spent: 3000,  budget: 6000   },
  { category: 'Benevolence',       spent: 4200,  budget: 5500   },
];

const TOTAL_BUDGET  = 200000;
const TOTAL_SPENT   = CATEGORIES.reduce((acc, c) => acc + c.spent, 0);
const OVERALL_PCT   = Math.round((TOTAL_SPENT / TOTAL_BUDGET) * 100);

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `$${n.toLocaleString()}`;
}

function barColor(pct: number) {
  if (pct >= 100) return HEAT;
  if (pct >= 80)  return CAUTION;
  return GAIN;
}

export default function BudgetScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [role, cycleRole, roleCycles] = useDemoRole('community:kaypay');
  const isPastor = role === roleCycles[0];

  useFocusEffect(useCallback(() => {
    resetFooter();
  }, []));

  const overBudget = CATEGORIES.filter(c => c.spent >= c.budget);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable style={s.kBtn} onPress={() => openSidePanel()} hitSlop={8}>
          <KMenuButton />
        </Pressable>
        <Text style={[s.topTitle, { color: C.label }]}>Budget</Text>
        <View style={s.rolePillWrap}>
          <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + TOP_BAR_H + 12,
          paddingBottom: insets.bottom + 80,
          gap: 14,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Over-budget alert — none currently */}
        {overBudget.length > 0 && (
          <View style={[s.alertCard, { backgroundColor: HEAT + '18', borderColor: HEAT + '44' }]}>
            <Text style={[s.alertText, { color: HEAT }]}>
              {overBudget.length} {overBudget.length === 1 ? 'category is' : 'categories are'} over budget: {overBudget.map(c => c.category).join(', ')}
            </Text>
          </View>
        )}

        {/* Annual Budget Card */}
        <View style={[s.annualCard, { backgroundColor: C.surface }]}>
          <View style={s.annualHeader}>
            <View>
              <Text style={[s.annualLabel, { color: C.secondary }]}>Annual Budget</Text>
              <Text style={[s.annualAmount, { color: C.label }]}>$200,000</Text>
              <Text style={[s.annualPeriod, { color: C.secondary }]}>FY2026 · Jan 1 – Dec 31</Text>
            </View>
            <View style={[s.overallPill, { backgroundColor: C.separator }]}>
              <Text style={[s.overallPct, { color: C.label }]}>{OVERALL_PCT}% used</Text>
            </View>
          </View>
          <View style={[s.progressTrack, { backgroundColor: C.separator, marginTop: 8 }]}>
            <View style={[s.progressFill, { backgroundColor: C.label, width: `${OVERALL_PCT}%` }]} />
          </View>
          <Text style={[s.spentLabel, { color: C.secondary }]}>
            {fmt(TOTAL_SPENT)} spent of {fmt(TOTAL_BUDGET)} budgeted
          </Text>
        </View>

        {/* Category Rows */}
        <View style={[s.card, { backgroundColor: C.surface, gap: 14 }]}>
          <Text style={[s.sectionTitle, { color: C.label }]}>Category Breakdown</Text>
          {CATEGORIES.map((row) => {
            const p     = Math.min(100, Math.round((row.spent / row.budget) * 100));
            const color = barColor(p);
            return (
              <View key={row.category} style={s.categoryRow}>
                <View style={s.categoryMeta}>
                  <Text style={[s.categoryName, { color: C.label }]}>{row.category}</Text>
                  <Text style={[s.categoryFigures, { color: C.secondary }]}>
                    {fmt(row.spent)} / {fmt(row.budget)} · <Text style={{ color }}>{p}%</Text>
                  </Text>
                </View>
                <View style={[s.progressTrack, { backgroundColor: C.separator }]}>
                  <View style={[s.progressFill, { backgroundColor: color, width: `${p}%` }]} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Edit Budget */}
        <Pressable
          style={[s.editBtn, { borderColor: C.separator }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Edit Budget', 'Adjust annual budget allocations for FY2026.');
          }}
        >
          <Text style={[s.editBtnText, { color: C.label }]}>Edit Budget</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },

    topBar: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
      flexDirection: 'row', alignItems: 'flex-end',
      paddingBottom: 10, paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    kBtn:         { width: 44, height: 36, justifyContent: 'center' },
    topTitle:     { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', paddingBottom: 2 },
    rolePillWrap: { width: 44 + 32, alignItems: 'flex-end', justifyContent: 'center' },

    alertCard: {
      borderRadius: 10, borderWidth: 1, padding: 12,
    },
    alertText: { fontSize: 13, fontWeight: '600', lineHeight: 18 },

    annualCard: { borderRadius: 12, padding: 16, gap: 6 },
    annualHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    annualLabel:  { fontSize: 12, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
    annualAmount: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
    annualPeriod: { fontSize: 12, marginTop: 2 },
    overallPill:  { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
    overallPct:   { fontSize: 13, fontWeight: '700' },
    spentLabel:   { fontSize: 12, marginTop: 4 },

    sectionTitle: { fontSize: 15, fontWeight: '700' },

    card: { borderRadius: 12, padding: 14 },

    categoryRow:     { gap: 6 },
    categoryMeta:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    categoryName:    { fontSize: 13, fontWeight: '600' },
    categoryFigures: { fontSize: 12 },

    progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
    progressFill:  { height: 6, borderRadius: 3 },

    editBtn: {
      borderWidth: 1, borderRadius: 12, paddingVertical: 14,
      alignItems: 'center',
    },
    editBtnText: { fontSize: 14, fontWeight: '600' },
  });
}
