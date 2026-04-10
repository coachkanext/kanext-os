/**
 * Billing Settings — Current plan, payment method, plan options, billing history.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { resetFooter } from '@/utils/global-footer-hide';

const TOP_BAR_H = 44;

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

const BILLING_HISTORY = [
  { id: 'bh1', description: 'KaNeXT Pro — Monthly',    amount: 29.99, date: 'Apr 1, 2024', status: 'Paid' },
  { id: 'bh2', description: 'KaNeXT Pro — Monthly',    amount: 29.99, date: 'Mar 1, 2024', status: 'Paid' },
  { id: 'bh3', description: 'KaNeXT Pro — Monthly',    amount: 29.99, date: 'Feb 1, 2024', status: 'Paid' },
  { id: 'bh4', description: 'KaNeXT Starter (legacy)', amount: 14.99, date: 'Jan 1, 2024', status: 'Paid' },
];

const PLAN_FEATURES = [
  '5 brand modes',
  '1,500 member capacity',
  'All creator tools',
  'Priority support',
  'Advanced analytics',
  'Custom domain',
];

export default function BillingSettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const topBarH           = insets.top + TOP_BAR_H;
  const contentPaddingTop = topBarH + 8;
  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { height: topBarH, paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable onPress={() => { haptic(); router.back(); }} hitSlop={8} style={s.topBarBtn}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <View style={[s.pill, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[s.pillText, { color: C.label }]}>Billing</Text>
        </View>
        <View style={s.topBarBtn} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Plan Card */}
        <GlassView tier={1} style={{ borderRadius: 12, overflow: 'hidden', marginHorizontal: 16, marginTop: 16 }}>
          <View style={{ padding: 16, backgroundColor: C.surface }}>
            {/* Plan header row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: C.label }}>Pro Plan</Text>
                <Text style={{ fontSize: 13, color: C.secondary, marginTop: 2 }}>Personal Brand</Text>
              </View>
              <View style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: GAIN + '22',
                borderWidth: 1,
                borderColor: GAIN,
              }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: GAIN }}>Active</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginVertical: 14 }} />

            <Text style={{ fontSize: 17, fontWeight: '800', color: C.label }}>$29.99/month</Text>
            <Text style={{ fontSize: 13, color: C.secondary, marginTop: 4 }}>Renews May 1, 2024</Text>

            {/* Divider */}
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginVertical: 14 }} />

            <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, marginBottom: 8 }}>Includes:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {PLAN_FEATURES.map((feature) => (
                <View key={feature} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, width: '50%', paddingRight: 8 }}>
                  <IconSymbol name="checkmark.circle.fill" size={13} color={GAIN} />
                  <Text style={{ fontSize: 13, color: C.label, flexShrink: 1 }}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        </GlassView>

        {/* PAYMENT METHOD */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>PAYMENT METHOD</Text>
        <GlassView tier={1} style={s.card}>
          <Pressable
            onPress={() => haptic()}
            style={[s.row, { backgroundColor: C.surface }]}
          >
            <IconSymbol name="creditcard.fill" size={18} color={C.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: C.label }}>Chase Checking</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>Paid via KPay · ••4521</Text>
            </View>
            <Text style={{ fontSize: 13, color: C.secondary }}>Change</Text>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>
        </GlassView>

        {/* PLAN OPTIONS */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>PLAN OPTIONS</Text>
        <GlassView tier={1} style={s.card}>
          {/* Upgrade */}
          <Pressable
            onPress={() => haptic()}
            style={[s.row, { backgroundColor: C.surface }]}
          >
            <IconSymbol name="arrow.up.circle.fill" size={18} color={GAIN} />
            <Text style={[s.rowLabel, { color: C.label }]}>Upgrade to Enterprise</Text>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>

          {/* Downgrade */}
          <Pressable
            onPress={() => haptic()}
            style={[s.row, { backgroundColor: C.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
          >
            <IconSymbol name="arrow.down.circle" size={18} color={C.secondary} />
            <Text style={[s.rowLabel, { color: C.secondary }]}>Downgrade to Starter</Text>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>
        </GlassView>

        {/* BILLING HISTORY */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>BILLING HISTORY</Text>
        <GlassView tier={1} style={s.card}>
          {BILLING_HISTORY.map((item, idx) => (
            <View
              key={item.id}
              style={[
                { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: C.surface },
                idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{item.description}</Text>
                <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{item.date}</Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginRight: 8 }}>
                ${item.amount.toFixed(2)}
              </Text>
              <View style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                backgroundColor: GAIN + '22',
                borderWidth: 1,
                borderColor: GAIN,
              }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: GAIN }}>Paid</Text>
              </View>
              <Pressable onPress={() => haptic()} hitSlop={8}>
                <IconSymbol name="arrow.down.doc" size={14} color={C.secondary} />
              </Pressable>
            </View>
          ))}
        </GlassView>
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
      paddingHorizontal: 12, paddingBottom: 6,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBarBtn: { width: 40, height: 32, alignItems: 'center', justifyContent: 'center' },
    pill:      { flex: 1, alignItems: 'center', justifyContent: 'center', height: 32, borderRadius: 16, borderWidth: 1, marginHorizontal: 10 },
    pillText:  { fontSize: 14, fontWeight: '700' },

    sectionLabel: {
      fontSize: 11, fontWeight: '700', letterSpacing: 0.6,
      textTransform: 'uppercase',
      paddingHorizontal: 16, marginBottom: 6, marginTop: 24,
    },
    card:    { borderRadius: 12, overflow: 'hidden', marginHorizontal: 16 },
    row:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
    rowLabel: { flex: 1, fontSize: 15 },
  });
}
