/**
 * History — Pastor only.
 * Redirects Member to give/index in useFocusEffect.
 * Date range, filter pills, transaction list, Export Report row.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useScrollHeader } from '@/hooks/use-scroll-header';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { KMenuButton } from '@/components/ui/k-menu-button';

const GAIN = '#5A8A6E';
const TOP_BAR_H = 52;

const FILTER_PILLS = ['All', 'Tithe', 'Building Fund', 'Missions', 'Special Needs'];

const TRANSACTIONS = [
  { donor: 'Marcus Johnson',  amount: 300,  fund: 'General / Tithe', date: 'Apr 9, 2026',  method: 'KPay'  },
  { donor: 'Aisha Williams',  amount: 250,  fund: 'Building Fund',   date: 'Apr 9, 2026',  method: 'Card'  },
  { donor: 'David Chen',      amount: 1000, fund: 'Missions',        date: 'Apr 8, 2026',  method: 'KPay'  },
  { donor: 'Sarah Thompson',  amount: 150,  fund: 'General / Tithe', date: 'Apr 8, 2026',  method: 'Check' },
  { donor: 'James Okafor',    amount: 75,   fund: 'Special Needs',   date: 'Apr 7, 2026',  method: 'Cash'  },
  { donor: 'Linda Pearson',   amount: 50,   fund: 'Missions',        date: 'Apr 5, 2026',  method: 'Card'  },
  { donor: 'Tunde Adeyemi',   amount: 500,  fund: 'Building Fund',   date: 'Apr 3, 2026',  method: 'KPay'  },
  { donor: 'Grace Kim',       amount: 200,  fund: 'General / Tithe', date: 'Apr 1, 2026',  method: 'Card'  },
];

export default function HistoryScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('community:give');
  const isPastor = role === roleCycles[0];
  const [activeFilter, setActiveFilter] = useState('All');

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) {
      router.replace('/(tabs)/(main)/give' as any);
    }
  }, [isPastor]));

  const filtered = activeFilter === 'All'
    ? TRANSACTIONS
    : TRANSACTIONS.filter(t => t.fund.toLowerCase().includes(activeFilter.toLowerCase()));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.kBtn} onPress={() => openSidePanel()} hitSlop={8}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>History</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
          </View>
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: insets.bottom + 80, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Date range row */}
        <Pressable
          style={[s.dateRow, { backgroundColor: C.surface }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Date Range', 'Date range picker coming soon.', [{ text: 'OK' }]);
          }}
        >
          <IconSymbol name="calendar" size={16} color={C.secondary} />
          <Text style={[s.dateText, { color: C.label }]}>Jan 1 – Apr 10, 2026</Text>
          <IconSymbol name="chevron.down" size={12} color={C.secondary} />
        </Pressable>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {FILTER_PILLS.map(pill => (
            <Pressable
              key={pill}
              onPress={() => { Haptics.selectionAsync(); setActiveFilter(pill); }}
              style={[
                s.filterPill,
                {
                  backgroundColor: activeFilter === pill ? C.label : C.surface,
                  borderColor: activeFilter === pill ? C.label : C.separator,
                },
              ]}
            >
              <Text style={[s.filterPillText, { color: activeFilter === pill ? C.bg : C.secondary }]}>
                {pill}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Transaction list */}
        <View style={[s.listCard, { backgroundColor: C.surface }]}>
          {filtered.map((t, i) => (
            <View
              key={`${t.donor}-${i}`}
              style={[
                s.txRow,
                i < filtered.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[s.txDonor, { color: C.label }]}>{t.donor}</Text>
                <Text style={[s.txMeta, { color: C.secondary }]}>{t.fund} · {t.date}</Text>
              </View>
              <View style={s.txRight}>
                <Text style={[s.txAmount, { color: GAIN }]}>${t.amount.toLocaleString()}</Text>
                <View style={[s.methodBadge, { borderColor: C.separator }]}>
                  <Text style={[s.methodText, { color: C.secondary }]}>{t.method}</Text>
                </View>
              </View>
            </View>
          ))}
          {filtered.length === 0 && (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={[s.txMeta, { color: C.secondary }]}>No transactions for this fund.</Text>
            </View>
          )}
        </View>

        {/* Export row */}
        <Pressable
          style={[s.exportRow, { backgroundColor: C.surface }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Export Report', 'Generating giving report PDF...', [{ text: 'OK' }]);
          }}
        >
          <Text style={[s.exportText, { color: C.label }]}>Export Report</Text>
          <IconSymbol name="arrow.right" size={14} color={C.secondary} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:    { flex: 1 },
    topBarOuter: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      height: TOP_BAR_H,
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16,
    },
    kBtn:         { width: 44, height: 36, justifyContent: 'center' },
    titlePill:    { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
    titleText:    { fontSize: 13, fontWeight: '700' },
    rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },

    dateRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, padding: 12 },
    dateText:   { flex: 1, fontSize: 14, fontWeight: '500' },

    filterPill:     { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1 },
    filterPillText: { fontSize: 13, fontWeight: '500' },

    listCard:   { borderRadius: 12, overflow: 'hidden' },
    txRow:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
    txDonor:    { fontSize: 14, fontWeight: '600' },
    txMeta:     { fontSize: 12 },
    txRight:    { alignItems: 'flex-end', gap: 4 },
    txAmount:   { fontSize: 15, fontWeight: '700' },
    methodBadge:{ borderRadius: 6, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
    methodText: { fontSize: 10 },

    exportRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, padding: 16 },
    exportText: { fontSize: 15, fontWeight: '600' },
  });
}
