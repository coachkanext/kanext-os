/**
 * Store Orders — Owner view of all orders.
 * Filter: All / Fulfilled / Pending / Refunded
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 52;
const GAIN      = '#5A8A6E';
const HEAT      = '#B85C5C';
const CAUTION   = '#B8943E';

type OrderStatus = 'Fulfilled' | 'Pending' | 'Refunded';
type Order = {
  id: string;
  buyer: string;
  buyerInitials: string;
  product: string;
  date: string;
  amount: number;
  status: OrderStatus;
};

const MOCK_ORDERS: Order[] = [
  { id: 'o1', buyer: 'Marcus Johnson',   buyerInitials: 'MJ', product: 'Creator Masterclass',       date: 'Apr 13', amount: 149, status: 'Fulfilled' },
  { id: 'o2', buyer: 'Aaliyah Thompson', buyerInitials: 'AT', product: 'Content Strategy Playbook', date: 'Apr 13', amount: 29,  status: 'Fulfilled' },
  { id: 'o3', buyer: 'Devon Williams',   buyerInitials: 'DW', product: '1-on-1 Coaching Call',      date: 'Apr 12', amount: 150, status: 'Pending'   },
  { id: 'o4', buyer: 'Priya Sharma',     buyerInitials: 'PS', product: 'Build in Public Hoodie',    date: 'Apr 12', amount: 45,  status: 'Fulfilled' },
  { id: 'o5', buyer: 'Jordan Lee',       buyerInitials: 'JL', product: 'Creator Masterclass',       date: 'Apr 11', amount: 149, status: 'Fulfilled' },
  { id: 'o6', buyer: 'Ryan Brooks',      buyerInitials: 'RB', product: 'Content Strategy Playbook', date: 'Apr 10', amount: 29,  status: 'Refunded'  },
  { id: 'o7', buyer: 'Keisha Morgan',    buyerInitials: 'KM', product: '1-on-1 Coaching Call',      date: 'Apr 10', amount: 150, status: 'Pending'   },
  { id: 'o8', buyer: 'Alex Rivera',      buyerInitials: 'AR', product: 'Monthly Newsletter',        date: 'Apr 9',  amount: 5,   status: 'Fulfilled' },
];

const STATUS_COLOR: Record<OrderStatus, string> = {
  Fulfilled: GAIN,
  Pending:   CAUTION,
  Refunded:  HEAT,
};

type Filter = 'All' | OrderStatus;
const FILTERS: Filter[] = ['All', 'Fulfilled', 'Pending', 'Refunded'];

export default function StoreOrdersScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const topBarH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);
  const [role, cycleRole, roleCycles] = useDemoRole('personal:store');
  const isOwner = role === roleCycles[0];
  const router = useRouter();
  useEffect(() => { if (!isOwner) router.navigate('/(tabs)/(main)/store' as any); }, [isOwner]);
  const [filter, setFilter] = useState<Filter>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filtered = useMemo(() => {
    if (filter === 'All') return MOCK_ORDERS;
    return MOCK_ORDERS.filter(o => o.status === filter);
  }, [filter]);

  const revenue = useMemo(() =>
    filtered.filter(o => o.status !== 'Refunded').reduce((s, o) => s + o.amount, 0), [filtered]);

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
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Orders</Text>
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginBottom: 16 }}>
          {FILTERS.map(f => (
            <Pressable
              key={f}
              onPress={() => { Haptics.selectionAsync(); setFilter(f); }}
              style={{ backgroundColor: filter === f ? C.label : C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 7 }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: filter === f ? C.bg : C.label }}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 14, alignItems: 'center', gap: 3 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: C.label }}>{filtered.length}</Text>
            <Text style={{ fontSize: 11, color: C.secondary }}>Orders</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 14, alignItems: 'center', gap: 3 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: C.label }}>${revenue.toLocaleString()}</Text>
            <Text style={{ fontSize: 11, color: C.secondary }}>Revenue</Text>
          </View>
        </View>

        {/* Order list */}
        <View style={{ backgroundColor: C.surface, marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: C.secondary }}>No orders in this filter.</Text>
            </View>
          ) : filtered.map((order, idx) => {
            const color = STATUS_COLOR[order.status];
            return (
              <Pressable
                key={order.id}
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12,
                  borderTopWidth: idx === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: C.separator,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary }}>{order.buyerInitials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{order.buyer}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }} numberOfLines={1}>{order.product} · {order.date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>${order.amount}</Text>
                  <View style={{ backgroundColor: `${color}20`, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color }}>{order.status}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
