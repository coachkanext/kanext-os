/**
 * Personal KPay — Invoices screen.
 * Invoice list with Paid / Pending / Overdue status, create new.
 */

import React, { useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { MOCK_INVOICES } from '@/data/mock-personal-kaypay';

const TOP_BAR_H = 52;
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

const STATUS_COLOR: Record<string, string> = {
  Paid:    GAIN,
  Pending: CAUTION,
  Overdue: HEAT,
};

export default function PersonalKPayInvoices() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const topBarH = insets.top + TOP_BAR_H;
  const scrollH = useScrollHeader(topBarH);
  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaypay');
  const isOwner = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const totalPending = MOCK_INVOICES
    .filter(inv => inv.status !== 'Paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Top bar ── */}
      <Animated.View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        height: topBarH, paddingTop: insets.top, backgroundColor: C.bg,
        opacity: scrollH.opacity,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
      }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 10 }}>
          <View style={{ flex: 1 }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ backgroundColor: C.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Invoices</Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
            <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      {/* ── Content ── */}
      <ScrollView
        onScroll={scrollH.onScroll}
        scrollEventThrottle={scrollH.scrollEventThrottle}
        contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 14, padding: 14 }}>
            <Text style={{ fontSize: 11, color: C.secondary, marginBottom: 4 }}>OUTSTANDING</Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: C.label }}>${totalPending.toLocaleString()}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 14, padding: 14 }}>
            <Text style={{ fontSize: 11, color: C.secondary, marginBottom: 4 }}>TOTAL INVOICES</Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: C.label }}>{MOCK_INVOICES.length}</Text>
          </View>
        </View>

        {/* Invoice list */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>All Invoices</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
          {MOCK_INVOICES.map((inv, i) => {
            const statusColor = STATUS_COLOR[inv.status] ?? C.secondary;
            return (
              <Pressable
                key={inv.id}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: C.separator }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{inv.client}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>
                    Issued {inv.date} · Due {inv.dueDate}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>${inv.amount.toLocaleString()}</Text>
                  <View style={{ backgroundColor: `${statusColor}20`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: statusColor }}>{inv.status}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Create invoice */}
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={{ height: 48, borderRadius: 14, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
        >
          <IconSymbol name="plus" size={16} color={C.bg} />
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>Create Invoice</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
