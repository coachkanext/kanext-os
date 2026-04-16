/**
 * Store Coupons — Owner coupon management.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 52;
const GAIN      = '#5A8A6E';

type Coupon = {
  id: string;
  code: string;
  discount: string;
  expiry: string;
  uses: number;
  maxUses: number;
  active: boolean;
};

const MOCK_COUPONS: Coupon[] = [
  { id: 'cp1', code: 'LAUNCH30',  discount: '30% off',       expiry: 'May 1',  uses: 142, maxUses: 200, active: true  },
  { id: 'cp2', code: 'WELCOME10', discount: '$10 off',        expiry: 'Jun 30', uses: 89,  maxUses: 500, active: true  },
  { id: 'cp3', code: 'STUDENT50', discount: '50% off',       expiry: 'Apr 30', uses: 23,  maxUses: 50,  active: true  },
  { id: 'cp4', code: 'NEWYR2025', discount: '25% off',       expiry: 'Jan 31', uses: 312, maxUses: 300, active: false },
  { id: 'cp5', code: 'FREESHIP',  discount: 'Free shipping', expiry: 'Mar 15', uses: 67,  maxUses: 100, active: false },
];

export default function StoreCouponsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const topBarH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);
  const [role, cycleRole, roleCycles] = useDemoRole('personal:store');
  const isOwner = role === roleCycles[0];
  const router = useRouter();
  useEffect(() => { if (!isOwner) router.navigate('/(tabs)/(main)/store' as any); }, [isOwner]);
  const [coupons, setCoupons] = useState(MOCK_COUPONS);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  function toggleActive(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  }

  function deleteCoupon(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Delete Coupon', 'Remove this coupon permanently?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setCoupons(prev => prev.filter(c => c.id !== id)) },
    ]);
  }

  const active  = coupons.filter(c => c.active);
  const expired = coupons.filter(c => !c.active);

  function renderCoupon(c: Coupon, isFirst: boolean) {
    const pct = Math.min(100, Math.round((c.uses / c.maxUses) * 100));
    return (
      <View key={c.id} style={{ paddingHorizontal: 14, paddingVertical: 14, borderTopWidth: isFirst ? 0 : StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: C.label, letterSpacing: 0.5 }}>{c.code}</Text>
              <View style={{ backgroundColor: c.active ? `${GAIN}20` : C.separator, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: c.active ? GAIN : C.secondary }}>
                  {c.active ? 'Active' : 'Expired'}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 13, color: C.secondary }}>{c.discount} · Expires {c.expiry}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Pressable onPress={() => toggleActive(c.id)} style={{ padding: 6 }}>
              <IconSymbol name={c.active ? 'pause.circle' : 'play.circle'} size={18} color={C.secondary} />
            </Pressable>
            <Pressable onPress={() => deleteCoupon(c.id)} style={{ padding: 6 }}>
              <IconSymbol name="trash" size={16} color={C.secondary} />
            </Pressable>
          </View>
        </View>
        <View style={{ gap: 4 }}>
          <View style={{ height: 3, backgroundColor: C.separator, borderRadius: 2 }}>
            <View style={{ height: 3, width: `${pct}%` as any, backgroundColor: c.active ? GAIN : C.secondary, borderRadius: 2 }} />
          </View>
          <Text style={{ fontSize: 11, color: C.secondary }}>{c.uses} / {c.maxUses} uses</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, paddingTop: insets.top, backgroundColor: C.bg, opacity, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
          <View style={{ flex: 1 }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ backgroundColor: C.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Coupons</Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{ paddingTop: topBarH + 16, paddingBottom: insets.bottom + 80 + 64 }}
        showsVerticalScrollIndicator={false}
      >
        {active.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 16, marginBottom: 8 }}>
              Active
            </Text>
            <View style={{ backgroundColor: C.surface, marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' }}>
              {active.map((c, i) => renderCoupon(c, i === 0))}
            </View>
          </View>
        )}

        {expired.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 16, marginBottom: 8 }}>
              Expired / Paused
            </Text>
            <View style={{ backgroundColor: C.surface, marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' }}>
              {expired.map((c, i) => renderCoupon(c, i === 0))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={{ position: 'absolute', bottom: insets.bottom + 49 + 16, left: 16, right: 16 }}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Create Coupon', 'Coming soon.'); }}
          style={({ pressed }) => ({ backgroundColor: C.label, borderRadius: 14, paddingVertical: 14, alignItems: 'center', opacity: pressed ? 0.85 : 1 })}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>+ Create Coupon</Text>
        </Pressable>
      </View>
    </View>
  );
}
