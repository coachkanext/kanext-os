/**
 * Booster — Shop (Player only)
 * Browse merch with player discount, featured section, category filters, order history.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol }    from '@/components/ui/icon-symbol';
import { KMenuButton }   from '@/components/ui/k-menu-button';
import { RolePill }      from '@/components/ui/role-pill';
import { GlassView }     from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel }  from '@/utils/global-side-panel';
import { resetFooter }    from '@/utils/global-footer-hide';
import { useDemoRole }    from '@/utils/demo-role-store';
import { MERCH_PRODUCTS, type MerchCategory } from '@/data/mock-sports-hub';

const TOP_BAR_H  = 54;
const GAIN       = '#5A8A6E';
const HEAT       = '#B85C5C';
const CAUTION    = '#B8943E';
const DISCOUNT   = 0.35; // 35% player discount

type CategoryFilter = 'All' | MerchCategory;
const CATEGORIES: CategoryFilter[] = ['All', 'Apparel', 'Headwear', 'Accessories', 'Special'];

const MY_ORDERS = [
  { id: 'ord1', name: 'LU Oaklanders Snapback', amount: 18.19, date: 'Mar 12, 2026', status: 'Delivered' },
  { id: 'ord2', name: 'Oakland Classic T-Shirt', amount: 19.49, date: 'Feb 28, 2026', status: 'Delivered' },
];

const ORDER_STATUS_COLOR: Record<string, string> = {
  Delivered:  GAIN,
  Shipped:    CAUTION,
  Processing: '#8A837C',
};

export default function ShopScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('sports:booster');
  const isCoach = role === roleCycles[0];
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (isCoach) router.replace('/(tabs)/(main)/booster/dashboard' as any);
  }, [isCoach, router]);

  if (isCoach) return null;

  const featured = MERCH_PRODUCTS.filter(p => p.isFeatured);
  const filtered = activeCategory === 'All'
    ? MERCH_PRODUCTS
    : MERCH_PRODUCTS.filter(p => p.category === activeCategory);

  const discountedPrice = (price: number) => (price * (1 - DISCOUNT)).toFixed(2);

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
              <Text style={[s.titlePillText, { color: C.label }]}>Shop</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={!isCoach} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: totalTopH + 16, paddingBottom: insets.bottom + 100 }}
      >

        {/* Discount banner */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <GlassView tier={1} style={{ borderRadius: 14, padding: 14 }}>
            <View style={s.row}>
              <View style={[s.discountBadge, { backgroundColor: GAIN }]}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#fff' }}>35%</Text>
                <Text style={{ fontSize: 9,  fontWeight: '700', color: '#fff' }}>OFF</Text>
              </View>
              <View style={{ marginLeft: 14 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>Player Discount Active</Text>
                <Text style={{ fontSize: 13, color: C.secondary, marginTop: 2 }}>Prices shown reflect your 35% discount.</Text>
              </View>
            </View>
          </GlassView>
        </View>

        {/* Featured items — horizontal scroll */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, paddingHorizontal: 16, marginBottom: 12 }]}>Featured</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {featured.map(item => (
              <Pressable
                key={item.id}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert(item.name, `$${discountedPrice(item.price)} with your discount\n\nColors: ${item.colors.join(', ')}\n\n★ ${item.rating} (${item.reviews} reviews)`); }}
                style={({ pressed }) => [s.featuredCard, { backgroundColor: C.surface, borderColor: C.separator, opacity: pressed ? 0.7 : 1 }]}
              >
                <View style={[s.featuredThumb, { backgroundColor: C.separator }]}>
                  <IconSymbol name="bag.fill" size={28} color={C.secondary} />
                  {item.isLimited && (
                    <View style={[s.limitedBadge, { backgroundColor: CAUTION }]}>
                      <Text style={{ fontSize: 8, fontWeight: '700', color: '#fff' }}>LIMITED</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, marginTop: 8 }} numberOfLines={2}>{item.name}</Text>
                <View style={[s.row, { marginTop: 4, gap: 6 }]}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: GAIN }}>${discountedPrice(item.price)}</Text>
                  <Text style={{ fontSize: 11, color: C.secondary, textDecorationLine: 'line-through' }}>${item.price.toFixed(2)}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Category filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginBottom: 16 }}
        >
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => { Haptics.selectionAsync(); setActiveCategory(cat); }}
                style={[s.filterPill, {
                  backgroundColor: active ? C.label : C.surface,
                  borderColor:     active ? C.label : C.separator,
                }]}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: active ? C.bg : C.label }}>{cat}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Product grid */}
        <View style={{ paddingHorizontal: 16, marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {filtered.map(item => (
              <Pressable
                key={item.id}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert(item.name, `$${discountedPrice(item.price)} with your discount\n\nColors: ${item.colors.join(', ')}\n\n★ ${item.rating} (${item.reviews} reviews)`); }}
                style={({ pressed }) => [s.gridCard, { backgroundColor: C.surface, borderColor: C.separator, width: '47%', opacity: pressed ? 0.7 : 1 }]}
              >
                <View style={[s.gridThumb, { backgroundColor: C.separator }]}>
                  <IconSymbol name="bag.fill" size={24} color={C.secondary} />
                  {item.isLimited && (
                    <View style={[s.limitedBadge, { backgroundColor: CAUTION }]}>
                      <Text style={{ fontSize: 8, fontWeight: '700', color: '#fff' }}>LIMITED</Text>
                    </View>
                  )}
                </View>
                <View style={{ padding: 10 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, marginBottom: 2 }} numberOfLines={2}>{item.name}</Text>
                  <Text style={{ fontSize: 10, color: C.secondary, marginBottom: 6 }}>{item.category}</Text>
                  <View style={[s.row, { gap: 6 }]}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: GAIN }}>${discountedPrice(item.price)}</Text>
                    <Text style={{ fontSize: 11, color: C.secondary, textDecorationLine: 'line-through' }}>${item.price.toFixed(2)}</Text>
                  </View>
                  <Text style={{ fontSize: 10, color: C.secondary, marginTop: 4 }}>★ {item.rating} ({item.reviews})</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* My orders */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>My Orders</Text>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {MY_ORDERS.map((order, i) => (
              <Pressable
                key={order.id}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert(order.name, `Order placed: ${order.date}\nStatus: ${order.status}`); }}
                style={({ pressed }) => [
                  s.row, { paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{order.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{order.date}</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginRight: 8 }}>${order.amount.toFixed(2)}</Text>
                <View style={[s.statusPill, {
                  backgroundColor: (ORDER_STATUS_COLOR[order.status] ?? C.secondary) + '18',
                  borderColor:     (ORDER_STATUS_COLOR[order.status] ?? C.secondary) + '60',
                }]}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: ORDER_STATUS_COLOR[order.status] ?? C.secondary }}>
                    {order.status}
                  </Text>
                </View>
              </Pressable>
            ))}
          </GlassView>
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
    sectionTitle:  { fontSize: 17, fontWeight: '700' },
    discountBadge: { width: 54, height: 54, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    featuredCard:  { width: 160, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden', padding: 12 },
    featuredThumb: { height: 100, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    gridCard:      { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
    gridThumb:     { height: 100, alignItems: 'center', justifyContent: 'center' },
    limitedBadge:  { position: 'absolute', top: 6, right: 6, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
    filterPill:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
    statusPill:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  });
}
