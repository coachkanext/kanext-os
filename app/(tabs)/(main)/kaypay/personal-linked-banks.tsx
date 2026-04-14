/**
 * Personal KPay — Linked Banks screen.
 * List of linked accounts, primary indicator, add/remove.
 */

import React, { useCallback, useState } from 'react';
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
import { LINKED_BANKS } from '@/data/mock-personal-kaypay';

const TOP_BAR_H = 52;
const GAIN = '#5A8A6E';

export default function PersonalKPayLinkedBanks() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const topBarH = insets.top + TOP_BAR_H;
  const scrollH = useScrollHeader(topBarH);
  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaypay');
  const isOwner = role === roleCycles[0];
  const [banks, setBanks] = useState(LINKED_BANKS);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const setPrimary = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBanks(prev => prev.map(b => ({ ...b, primary: b.id === id })));
  };

  const removeBank = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBanks(prev => prev.filter(b => b.id !== id));
  };

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
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Linked Banks</Text>
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
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
          Accounts ({banks.length})
        </Text>

        {banks.length > 0 ? (
          <View style={{ backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
            {banks.map((bank, i) => (
              <View key={bank.id} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <IconSymbol name="building.columns.fill" size={18} color={C.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{bank.name}</Text>
                    {bank.primary && (
                      <View style={{ backgroundColor: `${GAIN}20`, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: GAIN }}>Primary</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{bank.type} ••••{bank.last4}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {!bank.primary && (
                    <Pressable
                      onPress={() => setPrimary(bank.id)}
                      style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: C.separator }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }}>Set Primary</Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() => removeBank(bank.id)}
                    style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: C.separator }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#B85C5C' }}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={{ backgroundColor: C.surface, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 }}>
            <IconSymbol name="building.columns" size={32} color={C.secondary} />
            <Text style={{ fontSize: 14, color: C.secondary, marginTop: 12 }}>No linked accounts</Text>
          </View>
        )}

        {/* Add bank */}
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={{ height: 48, borderRadius: 14, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
        >
          <IconSymbol name="plus" size={16} color={C.bg} />
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>Link a Bank Account</Text>
        </Pressable>

        <Text style={{ fontSize: 12, color: C.secondary, textAlign: 'center', marginTop: 12 }}>
          Bank connections are secured via Plaid.{'\n'}KaNeXT never stores your credentials.
        </Text>
      </ScrollView>
    </View>
  );
}
