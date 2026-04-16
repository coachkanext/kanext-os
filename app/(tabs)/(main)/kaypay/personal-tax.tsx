/**
 * Personal KPay — Tax screen.
 * Estimated tax owed, auto-save toggle, quarterly estimates, export.
 */

import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { TAX_QUARTERS } from '@/data/mock-personal-kaypay';

const TOP_BAR_H = 52;
const GAIN    = '#5A8A6E';
const CAUTION = '#B8943E';
const HEAT    = '#B85C5C';

export default function PersonalKPayTax() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const topBarH = insets.top + TOP_BAR_H;
  const scrollH = useScrollHeader(topBarH);
  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaypay');
  const isOwner = role === roleCycles[0];
  const router = useRouter();
  useEffect(() => { if (!isOwner) router.back(); }, [isOwner]);
  const [autoTaxSave, setAutoTaxSave] = useState(false);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const Toggle = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => (
    <Pressable
      onPress={() => { Haptics.selectionAsync(); onToggle(); }}
      style={{ width: 44, height: 26, borderRadius: 13, backgroundColor: value ? C.label : C.separator, justifyContent: 'center', paddingHorizontal: 2 }}
    >
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.bg, alignSelf: value ? 'flex-end' : 'flex-start' }} />
    </Pressable>
  );

  const TAX_DOCS = [
    { label: '2025 1099-NEC',    sub: 'Nonemployee compensation',         date: 'Feb 1, 2026' },
    { label: '2025 1099-K',      sub: 'Payment card transactions',        date: 'Jan 31, 2026' },
    { label: '2024 1099-NEC',    sub: 'Nonemployee compensation',         date: 'Feb 3, 2025' },
  ];

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
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Tax</Text>
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
        {/* Estimated owed */}
        <View style={{ backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text style={{ fontSize: 13, color: C.secondary }}>Estimated Tax Owed</Text>
            <View style={{ backgroundColor: `${CAUTION}20`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: CAUTION }}>Q2 2026</Text>
            </View>
          </View>
          <Text style={{ fontSize: 32, fontWeight: '800', color: C.label, letterSpacing: -1, marginBottom: 16 }}>$1,680</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Auto-save for taxes</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>25% of income held in reserve</Text>
            </View>
            <Toggle value={autoTaxSave} onToggle={() => setAutoTaxSave(p => !p)} />
          </View>
          {autoTaxSave && (
            <View style={{ marginTop: 12, backgroundColor: `${GAIN}15`, borderRadius: 10, padding: 10 }}>
              <Text style={{ fontSize: 13, color: GAIN, fontWeight: '600' }}>Auto-save active · $0 in reserve</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>25% of future earnings will be set aside</Text>
            </View>
          )}
        </View>

        {/* Quarterly estimates */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Quarterly Estimates</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
          {TAX_QUARTERS.map((q, i) => (
            <View key={q.q} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{q.q}</Text>
                <Text style={{ fontSize: 12, color: C.secondary }}>{q.period}</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: q.settled ? GAIN : q.amount === '—' ? C.secondary : C.label }}>{q.amount}</Text>
              {q.settled && (
                <View style={{ marginLeft: 8, backgroundColor: `${GAIN}20`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: GAIN }}>Paid</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Tax documents */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Tax Documents</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
          {TAX_DOCS.map((doc, i) => (
            <Pressable
              key={doc.label}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: C.separator }}
            >
              <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <IconSymbol name="doc.text.fill" size={16} color={C.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{doc.label}</Text>
                <Text style={{ fontSize: 12, color: C.secondary }}>{doc.sub}</Text>
              </View>
              <Text style={{ fontSize: 12, color: C.secondary }}>{doc.date}</Text>
            </Pressable>
          ))}
        </View>

        {/* Export */}
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={{ height: 48, borderRadius: 14, borderWidth: 1.5, borderColor: C.label, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
        >
          <IconSymbol name="square.and.arrow.up" size={16} color={C.label} />
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>Export Tax Report</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
