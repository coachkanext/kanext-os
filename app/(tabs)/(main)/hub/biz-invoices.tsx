/**
 * Business Hub — Invoices screen. Client only.
 * Outstanding invoices with Pay Now, payment history, download statements.
 */
import React, { useMemo, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;
const GAIN = '#5A8A6E';
const HEAT = '#B85C5C';

type InvoiceStatus = 'Outstanding' | 'Paid';
type Invoice = { id: string; number: string; project: string; amount: number; status: InvoiceStatus; date: string; dueDate?: string };

const INVOICES: Invoice[] = [
  { id: '1', number: 'INV-2024-001', project: 'Nike Partnership Deck',    amount: 12500, status: 'Outstanding', date: 'Apr 1, 2026',  dueDate: 'Apr 30, 2026' },
  { id: '2', number: 'INV-2024-002', project: 'Coaching App Integration', amount: 8750,  status: 'Outstanding', date: 'Mar 15, 2026', dueDate: 'Apr 15, 2026' },
  { id: '3', number: 'INV-2023-018', project: 'Brand Strategy Session',   amount: 5000,  status: 'Paid',        date: 'Feb 1, 2026' },
  { id: '4', number: 'INV-2023-012', project: 'Annual Retainer Q4',       amount: 15000, status: 'Paid',        date: 'Jan 1, 2026' },
];

export default function BizInvoicesScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('business:hub');
  const isCEO  = role === roleCycles[0];

  useEffect(() => {
    if (isCEO) router.replace('/(tabs)/(main)/hub/business' as any);
  }, [isCEO]);

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const outstanding = INVOICES.filter(i => i.status === 'Outstanding');
  const paid        = INVOICES.filter(i => i.status === 'Paid');
  const outstandingTotal = outstanding.reduce((sum, i) => sum + i.amount, 0);
  const paidTotal        = paid.reduce((sum, i) => sum + i.amount, 0);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8} style={s.kBtn}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Invoices</Text>
            </View>
          </View>
          {/* No role pill — client-only screen */}
          <View style={s.rolePillWrap} />
        </View>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* Summary cards */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 14 }}>
            <Text style={[s.summaryLabel, { color: C.secondary }]}>OUTSTANDING</Text>
            <Text style={[s.summaryAmount, { color: HEAT }]}>${outstandingTotal.toLocaleString()}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 14 }}>
            <Text style={[s.summaryLabel, { color: C.secondary }]}>PAID</Text>
            <Text style={[s.summaryAmount, { color: GAIN }]}>${paidTotal.toLocaleString()}</Text>
          </View>
        </View>

        {/* Outstanding */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>Outstanding</Text>
        {outstanding.map(item => (
          <View key={item.id} style={[s.card, { backgroundColor: C.surface }]}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={[s.invoiceNum, { color: C.secondary }]}>{item.number}</Text>
                <Text style={[s.projectName, { color: C.label }]} numberOfLines={1}>{item.project}</Text>
              </View>
              <Text style={[s.amount, { color: HEAT }]}>${item.amount.toLocaleString()}</Text>
            </View>
            <View style={[s.divider, { backgroundColor: C.separator }]} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[s.meta, { color: C.secondary }]}>Due {item.dueDate}</Text>
              <Pressable
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                style={[s.payBtn, { backgroundColor: C.label }]}
              >
                <Text style={[s.payBtnText, { color: C.bg }]}>Pay Now</Text>
              </Pressable>
            </View>
          </View>
        ))}

        {/* Payment history */}
        <Text style={[s.sectionHeader, { color: C.secondary, marginTop: 12 }]}>Payment History</Text>
        {paid.map(item => (
          <View key={item.id} style={[s.card, { backgroundColor: C.surface }]}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={[s.invoiceNum, { color: C.secondary }]}>{item.number}</Text>
                <Text style={[s.projectName, { color: C.label }]} numberOfLines={1}>{item.project}</Text>
              </View>
              <Text style={[s.amount, { color: GAIN }]}>${item.amount.toLocaleString()}</Text>
            </View>
            <View style={[s.divider, { backgroundColor: C.separator }]} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[s.meta, { color: C.secondary }]}>Paid {item.date}</Text>
              <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <Text style={[s.downloadLink, { color: C.secondary }]}>Download</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar: { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  kBtn: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  titlePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap: { width: 80 },
  summaryLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 4 },
  summaryAmount: { fontSize: 22, fontWeight: '800' },
  sectionHeader: { fontSize: 11, fontWeight: '700', letterSpacing: 0.9, textTransform: 'uppercase', marginBottom: 8 },
  card: { borderRadius: 12, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 10, marginBottom: 8 },
  invoiceNum: { fontSize: 11, fontWeight: '600', letterSpacing: 0.4, marginBottom: 2 },
  projectName: { fontSize: 15, fontWeight: '700' },
  amount: { fontSize: 18, fontWeight: '800' },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 10 },
  meta: { fontSize: 12 },
  payBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  payBtnText: { fontSize: 12, fontWeight: '700' },
  downloadLink: { fontSize: 13, fontWeight: '600' },
});
