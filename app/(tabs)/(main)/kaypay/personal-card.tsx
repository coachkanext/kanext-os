/**
 * Personal KPay — Card screen.
 * Card visual, Apple Pay, freeze/international/online toggles, recent card transactions.
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
import { CARD_TXS } from '@/data/mock-personal-kaypay';

const TOP_BAR_H = 52;
const HEAT = '#B85C5C';

export default function PersonalKPayCard() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const topBarH = insets.top + TOP_BAR_H;
  const scrollH = useScrollHeader(topBarH);
  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaypay');
  const isOwner = role === roleCycles[0];
  const [cardRevealed,  setCardRevealed]  = useState(false);
  const [cardFrozen,    setCardFrozen]    = useState(false);
  const [intlEnabled,   setIntlEnabled]   = useState(false);
  const [onlineEnabled, setOnlineEnabled] = useState(true);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const Toggle = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => (
    <Pressable
      onPress={() => { Haptics.selectionAsync(); onToggle(); }}
      style={{ width: 44, height: 26, borderRadius: 13, backgroundColor: value ? C.label : C.separator, justifyContent: 'center', paddingHorizontal: 2 }}
    >
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.bg, alignSelf: value ? 'flex-end' : 'flex-start' }} />
    </Pressable>
  );

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
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Card</Text>
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
        {/* Card visual */}
        <View style={{ height: 190, borderRadius: 20, backgroundColor: C.label, padding: 20, justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: C.bg, letterSpacing: 2 }}>KANEXT</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: `${C.bg}99` }}>KPay</Text>
          </View>
          {cardFrozen && (
            <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: `${C.label}CC`, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
              <IconSymbol name="snowflake" size={32} color={C.bg} />
              <Text style={{ color: C.bg, fontWeight: '700', marginTop: 8 }}>Card Frozen</Text>
            </View>
          )}
          <View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.bg, letterSpacing: 3, marginBottom: 12 }}>
              {cardRevealed ? '4821  9031  4721  4821' : '••••  ••••  ••••  4821'}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg, letterSpacing: 1 }}>
                {isOwner ? 'SAMMY KALEJAIYE' : 'CARD HOLDER'}
              </Text>
              <Text style={{ fontSize: 12, color: `${C.bg}99` }}>07/29</Text>
            </View>
          </View>
        </View>

        {/* Actions row */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCardRevealed(p => !p); }}
            style={{ flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: C.separator, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{cardRevealed ? 'Hide Number' : 'Reveal Number'}</Text>
          </Pressable>
          <Pressable
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Add to Apple Pay</Text>
          </Pressable>
        </View>

        {/* Card controls */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Card Controls</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
          {[
            { label: 'Freeze card',               sub: cardFrozen ? 'Card temporarily paused' : 'Card active',   value: cardFrozen,    onToggle: () => setCardFrozen(p => !p)    },
            { label: 'International transactions', sub: 'Use card abroad',                                        value: intlEnabled,   onToggle: () => setIntlEnabled(p => !p)   },
            { label: 'Online transactions',        sub: 'Use card for online purchases',                          value: onlineEnabled, onToggle: () => setOnlineEnabled(p => !p) },
          ].map((ctrl, i) => (
            <View key={ctrl.label} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{ctrl.label}</Text>
                <Text style={{ fontSize: 12, color: C.secondary }}>{ctrl.sub}</Text>
              </View>
              <Toggle value={ctrl.value} onToggle={ctrl.onToggle} />
            </View>
          ))}
        </View>

        {/* Recent transactions */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Recent Transactions</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden' }}>
          {CARD_TXS.map((ct, i) => (
            <View key={ct.id} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
              <Text style={{ flex: 1, fontSize: 14, color: C.label }}>{ct.merchant}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginRight: 12 }}>{ct.date}</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: HEAT }}>-${Math.abs(ct.amount).toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
