/**
 * My History — all roles.
 * Personal giving transaction list with date range filter, tax receipt button, export row.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useScrollHeader } from '@/hooks/use-scroll-header';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { KMenuButton } from '@/components/ui/k-menu-button';

const GAIN    = '#5A8A6E';
const CAUTION = '#B8943E';
const TOP_BAR_H = 52;

const MY_TRANSACTIONS = [
  { amount: 200, fund: 'General / Tithe', date: 'Apr 1, 2026',  method: 'KPay',  status: 'Completed' as const },
  { amount: 50,  fund: 'Missions',        date: 'Apr 1, 2026',  method: 'KPay',  status: 'Completed' as const },
  { amount: 200, fund: 'General / Tithe', date: 'Mar 1, 2026',  method: 'KPay',  status: 'Completed' as const },
  { amount: 50,  fund: 'Missions',        date: 'Mar 1, 2026',  method: 'KPay',  status: 'Completed' as const },
  { amount: 100, fund: 'Building Fund',   date: 'Feb 14, 2026', method: 'Card',  status: 'Completed' as const },
  { amount: 50,  fund: 'Special Needs',   date: 'Feb 1, 2026',  method: 'KPay',  status: 'Pending'   as const },
];

export default function MyHistoryScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [role, cycleRole, roleCycles] = useDemoRole('community:give');
  const isPastor = role === roleCycles[0];

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.kBtn} onPress={() => openSidePanel()} hitSlop={8}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>My History</Text>
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
        {/* Date range filter */}
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

        {/* Transaction list */}
        <View style={[s.listCard, { backgroundColor: C.surface }]}>
          {MY_TRANSACTIONS.map((t, i) => (
            <View
              key={i}
              style={[
                s.txRow,
                i < MY_TRANSACTIONS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[s.txFund, { color: C.label }]}>{t.fund}</Text>
                <Text style={[s.txMeta, { color: C.secondary }]}>{t.date} · {t.method}</Text>
              </View>
              <View style={s.txRight}>
                <Text style={[s.txAmount, { color: GAIN }]}>${t.amount.toLocaleString()}</Text>
                <View
                  style={[
                    s.statusBadge,
                    {
                      backgroundColor: t.status === 'Completed' ? GAIN + '22' : CAUTION + '22',
                      borderColor: t.status === 'Completed' ? GAIN + '44' : CAUTION + '44',
                    },
                  ]}
                >
                  <Text style={[s.statusText, { color: t.status === 'Completed' ? GAIN : CAUTION }]}>
                    {t.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Export row */}
        <Pressable
          style={[s.exportRow, { backgroundColor: C.surface }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Export', 'Generating your giving history export...', [{ text: 'OK' }]);
          }}
        >
          <Text style={[s.exportText, { color: C.label }]}>Export History</Text>
          <IconSymbol name="arrow.right" size={14} color={C.secondary} />
        </Pressable>

        {/* Tax Receipt button */}
        <Pressable
          style={[s.taxBtn, { backgroundColor: C.label }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('Tax Receipt', 'Your 2026 annual giving statement has been sent to your email address on file.', [{ text: 'OK' }]);
          }}
        >
          <IconSymbol name="doc.text.fill" size={16} color={C.bg} />
          <Text style={[s.taxBtnText, { color: C.bg }]}>Request Tax Receipt</Text>
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

    listCard:   { borderRadius: 12, overflow: 'hidden' },
    txRow:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
    txFund:     { fontSize: 14, fontWeight: '600' },
    txMeta:     { fontSize: 12 },
    txRight:    { alignItems: 'flex-end', gap: 4 },
    txAmount:   { fontSize: 15, fontWeight: '700' },
    statusBadge:{ borderRadius: 8, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2 },
    statusText: { fontSize: 11, fontWeight: '600' },

    exportRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, padding: 16 },
    exportText: { fontSize: 15, fontWeight: '600' },

    taxBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14 },
    taxBtnText: { fontSize: 15, fontWeight: '700' },
  });
}
