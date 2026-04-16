/**
 * Store Purchases — Follower view of everything bought from this creator's store.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 52;
const GAIN      = '#5A8A6E';
const CAUTION   = '#B8943E';

type PurchaseType   = 'Digital' | 'Course' | 'Merch' | 'Service';
type PurchaseStatus = 'Delivered' | 'Processing' | 'Shipped';

type Purchase = {
  id: string;
  type: PurchaseType;
  title: string;
  price: number;
  date: string;
  status: PurchaseStatus;
  coverHue: number;
};

const MOCK_PURCHASES: Purchase[] = [
  { id: 'p1', type: 'Digital',  title: 'Content Strategy Playbook',  price: 29,  date: 'Apr 8',  status: 'Delivered',  coverHue: 220 },
  { id: 'p2', type: 'Course',   title: 'Creator Masterclass',        price: 149, date: 'Mar 15', status: 'Delivered',  coverHue: 270 },
  { id: 'p3', type: 'Merch',    title: '"Build in Public" Hoodie',   price: 45,  date: 'Apr 10', status: 'Shipped',    coverHue: 30  },
  { id: 'p4', type: 'Service',  title: '1-on-1 Coaching Call',       price: 150, date: 'Apr 12', status: 'Processing', coverHue: 160 },
  { id: 'p5', type: 'Digital',  title: 'Social Media Template Pack', price: 0,   date: 'Feb 20', status: 'Delivered',  coverHue: 45  },
];

const STATUS_CONFIG: Record<PurchaseStatus, { color: string }> = {
  Delivered:  { color: GAIN    },
  Processing: { color: CAUTION },
  Shipped:    { color: '#1A1714' },
};

function tapLabel(type: PurchaseType): string {
  switch (type) {
    case 'Digital':  return 'Downloading...';
    case 'Course':   return 'Opening in KPlay...';
    case 'Merch':    return 'Tracking shipment...';
    case 'Service':  return 'Viewing booking details...';
  }
}

type Filter = 'All' | 'Digital' | 'Courses' | 'Merch' | 'Services';
const FILTERS: Filter[] = ['All', 'Digital', 'Courses', 'Merch', 'Services'];

function matchesFilter(p: Purchase, f: Filter): boolean {
  if (f === 'All')      return true;
  if (f === 'Digital')  return p.type === 'Digital';
  if (f === 'Courses')  return p.type === 'Course';
  if (f === 'Merch')    return p.type === 'Merch';
  if (f === 'Services') return p.type === 'Service';
  return true;
}

export default function StorePurchasesScreen() {
  const C       = useColors();
  const insets  = useSafeAreaInsets();
  const isDark  = C.bg === '#1C1410';
  const topBarH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);
  const [role, cycleRole, roleCycles] = useDemoRole('personal:store');
  const isOwner = role === roleCycles[0];
  const router  = useRouter();
  useEffect(() => { if (isOwner) router.navigate('/(tabs)/(main)/store' as any); }, [isOwner]);
  const [filter, setFilter] = useState<Filter>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filtered = useMemo(() => MOCK_PURCHASES.filter(p => matchesFilter(p, filter)), [filter]);

  function handleTap(purchase: Purchase) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(purchase.title, tapLabel(purchase.type));
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Top Bar ── */}
      <Animated.View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        paddingTop: insets.top, backgroundColor: C.bg, opacity,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
      }}>
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
          <View style={{ flex: 1 }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ backgroundColor: C.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Purchases</Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{ paddingTop: topBarH + 16, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginBottom: 20 }}
        >
          {FILTERS.map(f => (
            <Pressable
              key={f}
              onPress={() => { Haptics.selectionAsync(); setFilter(f); }}
              style={{
                backgroundColor: filter === f ? C.label : C.surface,
                borderRadius: 14, paddingHorizontal: 14, paddingVertical: 7,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: filter === f ? C.bg : C.label }}>
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {filtered.length === 0 ? (
          /* ── Empty state ── */
          <View style={{ alignItems: 'center', paddingHorizontal: 32, paddingTop: 48, gap: 12 }}>
            <IconSymbol name="bag" size={44} color={C.secondary} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, textAlign: 'center' }}>
              No purchases yet
            </Text>
            <Text style={{ fontSize: 14, color: C.secondary, textAlign: 'center', lineHeight: 20 }}>
              Browse the store to find something you love.
            </Text>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.navigate('/(tabs)/(main)/store' as any); }}
              style={{ backgroundColor: C.label, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 11, marginTop: 4 }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Browse Store</Text>
            </Pressable>
          </View>
        ) : (
          /* ── Purchase list ── */
          <View style={{ backgroundColor: C.surface, marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' }}>
            {filtered.map((purchase, idx) => {
              const thumbBg = `hsl(${purchase.coverHue}, 22%, ${isDark ? 26 : 76}%)`;
              const { color } = STATUS_CONFIG[purchase.status];
              return (
                <Pressable
                  key={purchase.id}
                  onPress={() => handleTap(purchase)}
                  style={({ pressed }) => ({
                    flexDirection: 'row', alignItems: 'center',
                    paddingHorizontal: 14, paddingVertical: 12,
                    borderTopWidth: idx === 0 ? 0 : StyleSheet.hairlineWidth,
                    borderTopColor: C.separator,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  {/* Thumbnail */}
                  <View style={{
                    width: 48, height: 48, borderRadius: 10,
                    backgroundColor: thumbBg, marginRight: 12,
                  }} />

                  {/* Title + type + date */}
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }} numberOfLines={1}>
                      {purchase.title}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={{ backgroundColor: C.separator, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                          {purchase.type}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 11, color: C.secondary }}>{purchase.date}</Text>
                    </View>
                  </View>

                  {/* Price + status pill */}
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>
                      {purchase.price === 0 ? 'Free' : `$${purchase.price}`}
                    </Text>
                    <View style={{ backgroundColor: `${color}20`, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color }}>{purchase.status}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
