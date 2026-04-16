/**
 * Personal KPay — Savings screen (Follower).
 * Savings balance, APY, round-up / auto-save toggles, savings goal.
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

const TOP_BAR_H = 52;
const GAIN = '#5A8A6E';

export default function PersonalKPaySavings() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const topBarH = insets.top + TOP_BAR_H;
  const scrollH = useScrollHeader(topBarH);
  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaypay');
  const isOwner = role === roleCycles[0];
  const router = useRouter();
  useEffect(() => { if (!isOwner) router.back(); }, [isOwner]);
  const [roundUp,  setRoundUp]  = useState(true);
  const [autoSave, setAutoSave] = useState(false);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const Toggle = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => (
    <Pressable
      onPress={() => { Haptics.selectionAsync(); onToggle(); }}
      style={{ width: 44, height: 26, borderRadius: 13, backgroundColor: value ? C.label : C.separator, justifyContent: 'center', paddingHorizontal: 2 }}
    >
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.bg, alignSelf: value ? 'flex-end' : 'flex-start' }} />
    </Pressable>
  );

  const SAVINGS_RULES = [
    { label: 'Round-Up',  sub: 'Round every purchase to nearest dollar and save the difference', value: roundUp,  onToggle: () => setRoundUp(p => !p)  },
    { label: 'Auto-Save', sub: 'Save $25 automatically every Friday',                           value: autoSave, onToggle: () => setAutoSave(p => !p) },
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
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Savings</Text>
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
        {/* Savings balance */}
        <View style={{ backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: GAIN }} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: GAIN }}>4.15% APY</Text>
          </View>
          <Text style={{ fontSize: 32, fontWeight: '800', color: C.label, letterSpacing: -1 }}>$89.20</Text>
          <Text style={{ fontSize: 13, color: C.secondary, marginTop: 4 }}>Savings balance · Earning $3.70/yr at current rate</Text>
        </View>

        {/* Auto-save rules */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Auto-Save Rules</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
          {SAVINGS_RULES.map((rule, i) => (
            <View key={rule.label} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{rule.label}</Text>
                <Text style={{ fontSize: 12, color: C.secondary }}>{rule.sub}</Text>
              </View>
              <Toggle value={rule.value} onToggle={rule.onToggle} />
            </View>
          ))}
        </View>

        {/* Savings goal */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Savings Goal</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 4 }}>Emergency Fund</Text>
          <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 12 }}>$89.20 of $1,000 goal · 8.9% complete</Text>
          <View style={{ height: 6, backgroundColor: C.separator, borderRadius: 3, marginBottom: 8 }}>
            <View style={{ width: '9%', height: 6, backgroundColor: C.label, borderRadius: 3 }} />
          </View>
          <Text style={{ fontSize: 12, color: C.secondary }}>At your current rate, you'll reach this goal in ~34 months</Text>
        </View>

        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={{ height: 48, borderRadius: 14, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>Move Money to Savings</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
