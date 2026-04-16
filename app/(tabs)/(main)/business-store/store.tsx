/**
 * Business Store — Storefront
 * CEO: manage products + FAB. Client: shop / browse.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

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

type ProductCategory = 'All' | 'Software' | 'API' | 'Merch' | 'Free';

type StoreProduct = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  priceLabel: string;
  category: ProductCategory;
  icon: string;
  badge?: string;
  accentColor?: string; // tint for icon bg
  isActive: boolean;
};

const STORE_PRODUCTS: StoreProduct[] = [
  { id:'sp01', name:'KaNeXT OS Free',   description:'Full platform access. Free forever for individuals.',             price:0,    priceLabel:'Free',    category:'Free',     icon:'star.fill',            badge:'Free',    accentColor:'#B8943E', isActive:true },
  { id:'sp02', name:'KaNeXT OS Pro',    description:'Unlimited modes, advanced analytics, and priority support.',      price:29,   priceLabel:'$29/mo',  category:'Software', icon:'app.fill',             badge:'Popular', accentColor:'#5A8A6E', isActive:true },
  { id:'sp03', name:'KaNeXT OS Enterprise', description:'Custom deployment, SSO, dedicated account manager.',          price:null, priceLabel:'Custom',  category:'Software', icon:'building.2.fill',      badge:undefined, accentColor:'#1A1714', isActive:true },
  { id:'sp04', name:'Basketball Intelligence API Starter', description:'Full stats API access. Up to 10K req/month.', price:99,   priceLabel:'$99/mo',  category:'API',      icon:'curlybraces',          badge:undefined, accentColor:'#5A8A6E', isActive:true },
  { id:'sp05', name:'Basketball Intelligence API Pro', description:'Unlimited requests, live webhooks, priority SLA.',price:499,  priceLabel:'$499/mo', category:'API',      icon:'antenna.radiowaves.left.and.right', badge:'Pro', accentColor:'#1A1714', isActive:true },
  { id:'sp06', name:'KaNeXT Tee',       description:'100% cotton. Black & White. Sizes S–XXL.',                       price:35,   priceLabel:'$35',     category:'Merch',    icon:'tshirt.fill',          badge:undefined, accentColor:'#9C9790', isActive:true },
  { id:'sp07', name:'KaNeXT Hoodie',    description:'Premium heavyweight hoodie. Embroidered logo.',                  price:65,   priceLabel:'$65',     category:'Merch',    icon:'hanger',               badge:undefined, accentColor:'#9C9790', isActive:true },
];

const FILTERS: ProductCategory[] = ['All', 'Software', 'API', 'Merch', 'Free'];
const FEATURED_IDS = ['sp02', 'sp05'];

export default function StoreScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('business:store');
  const isCEO = role === roleCycles[0];

  const [filter, setFilter] = useState<ProductCategory>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const featured = STORE_PRODUCTS.filter(p => FEATURED_IDS.includes(p.id));
  const filtered = STORE_PRODUCTS.filter(p => filter === 'All' || p.category === filter);

  function handleProductPress(product: StoreProduct) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(product.name, isCEO ? 'Edit product — coming soon' : 'Purchase flow — coming soon');
  }

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
              <Text style={[s.titlePillText, { color: C.label }]}>Store</Text>
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
        contentContainerStyle={{ paddingTop: totalTopH + 12, paddingBottom: insets.bottom + 100 }}
      >

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 20 }}>
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

        {/* ── Featured ── */}
        {filter === 'All' && (
          <View style={{ marginBottom: 28 }}>
            <Text style={[s.sectionLabel, { color: C.label, paddingHorizontal: 16, marginBottom: 12 }]}>Featured</Text>

            {/* Hero card — dark, full-bleed */}
            {featured[0] && (
              <Pressable
                onPress={() => handleProductPress(featured[0])}
                style={({ pressed }) => [s.heroCard, { backgroundColor: C.label, marginHorizontal: 16, marginBottom: 10, opacity: pressed ? 0.92 : 1 }]}
              >
                {/* Icon badge */}
                <View style={[s.heroIconBox, { backgroundColor: `${featured[0].accentColor}30` }]}>
                  <IconSymbol name={featured[0].icon as any} size={28} color="#fff" />
                </View>

                <View style={s.heroBadgeRow}>
                  {featured[0].badge && (
                    <View style={s.heroBadge}>
                      <Text style={s.heroBadgeText}>{featured[0].badge}</Text>
                    </View>
                  )}
                </View>

                <Text style={s.heroName}>{featured[0].name}</Text>
                <Text style={s.heroDesc} numberOfLines={2}>{featured[0].description}</Text>

                <View style={s.heroFooter}>
                  <Text style={s.heroPrice}>{featured[0].priceLabel}</Text>
                  <View style={s.heroCta}>
                    <Text style={s.heroCtaText}>{isCEO ? 'Edit' : 'Get Started'}</Text>
                  </View>
                </View>
              </Pressable>
            )}

            {/* Secondary featured — light card with accent border */}
            {featured[1] && (
              <Pressable
                onPress={() => handleProductPress(featured[1])}
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
              >
                <GlassView tier={1} style={[s.secondaryCard, { marginHorizontal: 16, borderColor: C.separator }]}>
                  <View style={[s.secondaryIconBox, { backgroundColor: (featured[1].accentColor ?? C.label) + '15' }]}>
                    <IconSymbol name={featured[1].icon as any} size={22} color={featured[1].accentColor ?? C.label} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={[s.row, { gap: 8, marginBottom: 3 }]}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{featured[1].name}</Text>
                      {featured[1].badge && (
                        <View style={[s.inlineBadge, { backgroundColor: C.label }]}>
                          <Text style={{ fontSize: 9, fontWeight: '700', color: C.bg }}>{featured[1].badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ fontSize: 12, color: C.secondary }} numberOfLines={2}>{featured[1].description}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6, marginLeft: 8 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: C.label }}>{featured[1].priceLabel}</Text>
                    <View style={[s.smallCta, { backgroundColor: C.label }]}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: C.bg }}>{isCEO ? 'Edit' : 'Buy'}</Text>
                    </View>
                  </View>
                </GlassView>
              </Pressable>
            )}
          </View>
        )}

        {/* ── Product grid ── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionLabel, { color: C.label, marginBottom: 14 }]}>
            {filter === 'All' ? 'All Products' : filter}
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {filtered.map(product => (
              <Pressable
                key={product.id}
                onPress={() => handleProductPress(product)}
                style={({ pressed }) => [{ width: '47.5%', opacity: pressed ? 0.85 : 1 }]}
              >
                <GlassView tier={1} style={s.gridCard}>
                  {/* App-icon style image area */}
                  <View style={[s.gridIconWrap, { backgroundColor: (product.accentColor ?? C.label) + '12' }]}>
                    <IconSymbol name={product.icon as any} size={26} color={product.accentColor ?? C.label} />
                    {product.badge && (
                      <View style={[s.gridBadge, { backgroundColor: C.label }]}>
                        <Text style={{ fontSize: 8, fontWeight: '700', color: C.bg }}>{product.badge}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 4 }} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: C.secondary, marginBottom: 12, lineHeight: 15 }} numberOfLines={3}>
                    {product.description}
                  </Text>

                  {/* Price + action row */}
                  <View style={[s.gridFooter]}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: C.label }}>{product.priceLabel}</Text>
                    {isCEO ? (
                      <Pressable
                        hitSlop={8}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert(product.name, 'Edit product — coming soon'); }}
                      >
                        <IconSymbol name="ellipsis" size={18} color={C.secondary} />
                      </Pressable>
                    ) : (
                      <View style={[s.gridCta, { backgroundColor: C.label }]}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: C.bg }}>
                          {product.price === 0 ? 'Free' : 'Buy'}
                        </Text>
                      </View>
                    )}
                  </View>
                </GlassView>
              </Pressable>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* CEO FAB */}
      {isCEO && (
        <Pressable
          style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 72 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Add Product', 'Coming soon'); }}
        >
          <IconSymbol name="plus" size={22} color={C.bg} />
        </Pressable>
      )}

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
    sectionLabel:  { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
    filterPill:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },

    // Hero card
    heroCard: {
      borderRadius: 20, padding: 20,
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 6,
    },
    heroIconBox:  { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
    heroBadgeRow: { flexDirection: 'row', marginBottom: 6 },
    heroBadge:    { backgroundColor: 'rgba(255,255,255,0.20)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    heroBadgeText:{ fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
    heroName:     { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.4, marginBottom: 6 },
    heroDesc:     { fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 20, marginBottom: 20 },
    heroFooter:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    heroPrice:    { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
    heroCta:      { backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
    heroCtaText:  { fontSize: 14, fontWeight: '700', color: '#fff' },

    // Secondary featured card
    secondaryCard: { borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
    secondaryIconBox: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    inlineBadge:   { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    smallCta:      { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },

    // Grid cards
    gridCard: { borderRadius: 16, padding: 14 },
    gridIconWrap: {
      width: 56, height: 56, borderRadius: 16,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 12,
    },
    gridBadge: {
      position: 'absolute', top: -4, right: -4,
      paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5,
    },
    gridFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' as any },
    gridCta:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },

    // FAB
    fab: {
      position: 'absolute', right: 20,
      width: 52, height: 52, borderRadius: 26,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 8, elevation: 5,
    },
  });
}
