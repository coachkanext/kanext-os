/**
 * Business Store — Purchases (Client only)
 * Filter pills, purchase history list.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 54;
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';

type PurchaseFilter = 'All' | 'Software' | 'API' | 'Merch';
const FILTERS: PurchaseFilter[] = ['All', 'Software', 'API', 'Merch'];

type Purchase = {
  id: string; product: string; amount: number; date: string;
  category: PurchaseFilter; status: 'Completed' | 'Refunded';
  icon: string;
};

const MY_PURCHASES: Purchase[] = [
  { id:'mp01', product:'KaNeXT OS Pro',                    amount:29,  date:'Apr 14, 2026', category:'Software', status:'Completed', icon:'app.fill'   },
  { id:'mp02', product:'KaNeXT OS Pro',                    amount:29,  date:'Mar 14, 2026', category:'Software', status:'Completed', icon:'app.fill'   },
  { id:'mp03', product:'KaNeXT OS Pro',                    amount:29,  date:'Feb 14, 2026', category:'Software', status:'Completed', icon:'app.fill'   },
  { id:'mp04', product:'KaNeXT Hoodie',                    amount:65,  date:'Mar 8, 2026',  category:'Merch',    status:'Completed', icon:'hanger'     },
  { id:'mp05', product:'KaNeXT Tee',                       amount:35,  date:'Jan 22, 2026', category:'Merch',    status:'Completed', icon:'tshirt.fill'},
  { id:'mp06', product:'Basketball Intelligence API Starter', amount:99, date:'Dec 5, 2025', category:'API',     status:'Refunded',  icon:'curlybraces'},
];

export default function PurchasesScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('business:store');
  const isCEO = role === roleCycles[0];

  const [filter, setFilter] = useState<PurchaseFilter>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (isCEO) router.replace('/(tabs)/(main)/business-store/orders' as any);
  }, [isCEO, router]);

  if (isCEO) return null;

  const filtered = MY_PURCHASES.filter(p => filter === 'All' || p.category === filter);
  const totalSpent = MY_PURCHASES.filter(p => p.status !== 'Refunded').reduce((s, p) => s + p.amount, 0);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* Top Bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.iconBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Purchases</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isCEO} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: totalTopH + 16, paddingBottom: insets.bottom + 100 }}
      >

        {/* Summary card */}
        <GlassView tier={1} style={{ marginHorizontal: 16, borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 4 }}>Total Spent</Text>
          <Text style={{ fontSize: 28, fontWeight: '800', color: C.label }}>${totalSpent}</Text>
          <Text style={{ fontSize: 12, color: C.secondary, marginTop: 4 }}>{MY_PURCHASES.filter(p => p.status !== 'Refunded').length} purchases · {MY_PURCHASES.filter(p => p.status === 'Refunded').length} refund</Text>
        </GlassView>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 16 }}>
          {FILTERS.map(f => (
            <Pressable
              key={f}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(f); }}
              style={[s.filterPill, { backgroundColor: filter === f ? C.label : C.surface, borderColor: filter === f ? C.label : C.separator }]}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: filter === f ? C.bg : C.secondary }}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Purchase list */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {filtered.map((purchase, i) => (
              <Pressable
                key={purchase.id}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert(purchase.product, `$${purchase.amount} · ${purchase.date}\nStatus: ${purchase.status}`); }}
                style={({ pressed }) => [
                  s.row, { paddingVertical: 14, paddingHorizontal: 14, gap: 12 },
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={[s.iconBox, { backgroundColor: C.separator }]}>
                  <IconSymbol name={purchase.icon as any} size={16} color={C.label} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={1}>{purchase.product}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{purchase.date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: purchase.status === 'Refunded' ? HEAT : C.label }}>
                    {purchase.status === 'Refunded' ? '-' : ''}${purchase.amount}
                  </Text>
                  {purchase.status === 'Refunded' && (
                    <View style={{ backgroundColor: HEAT + '18', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: HEAT }}>Refunded</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </GlassView>
        </View>

        {/* Help CTA */}
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <Pressable
            style={[s.helpBtn, { backgroundColor: C.surface, borderColor: C.separator }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Support', 'Opening support — coming soon'); }}
          >
            <IconSymbol name="questionmark.circle" size={17} color={C.label} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginLeft: 8 }}>Need help with an order?</Text>
          </Pressable>
        </View>

      </ScrollView>

    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:          { flex: 1 },
    topBarOuter:   { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
    iconBtn:       { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
    titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    row:           { flexDirection: 'row', alignItems: 'center' },
    filterPill:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
    iconBox:       { width: 36, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
    helpBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  });
}
