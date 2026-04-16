/**
 * Business Store — Orders (CEO only)
 * Filter pills, stats row, order list, abandoned cart section.
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
const CAUTION = '#B8943E';

type OrderStatus = 'Completed' | 'Processing' | 'Shipped' | 'Refunded';

type Order = {
  id: string;
  customer: string;
  product: string;
  amount: number;
  date: string;
  status: OrderStatus;
};

const ORDERS: Order[] = [
  { id:'o01', customer:'Marcus Webb',    product:'KaNeXT OS Pro',                    amount:29,  date:'Apr 14', status:'Completed'  },
  { id:'o02', customer:'Sandra Ellis',   product:'Basketball Intelligence API Starter', amount:99, date:'Apr 13', status:'Completed'  },
  { id:'o03', customer:'Priya Nair',     product:'KaNeXT Hoodie',                    amount:65,  date:'Apr 12', status:'Shipped'    },
  { id:'o04', customer:'Kevin Shaw',     product:'KaNeXT OS Pro',                    amount:29,  date:'Apr 11', status:'Completed'  },
  { id:'o05', customer:'Deja Collins',   product:'KaNeXT Tee',                       amount:35,  date:'Apr 10', status:'Completed'  },
  { id:'o06', customer:'Tyler Okafor',   product:'Basketball Intelligence API Pro',   amount:499, date:'Apr 9',  status:'Processing' },
  { id:'o07', customer:'Aisha Brooks',   product:'KaNeXT OS Pro',                    amount:29,  date:'Apr 8',  status:'Completed'  },
  { id:'o08', customer:'Linda Washington', product:'KaNeXT Hoodie',                  amount:65,  date:'Apr 7',  status:'Completed'  },
  { id:'o09', customer:'Jordan Lee',     product:'KaNeXT OS Pro',                    amount:29,  date:'Apr 6',  status:'Refunded'   },
  { id:'o10', customer:'Victoria James', product:'Basketball Intelligence API Starter', amount:99, date:'Apr 5', status:'Completed'  },
];

const ABANDONED = [
  { id:'ab01', customer:'Robert King',    product:'KaNeXT OS Pro',    cart: '$29', mins: '2h ago'  },
  { id:'ab02', customer:'Anthony Bell',   product:'KaNeXT Hoodie',    cart: '$65', mins: '5h ago'  },
  { id:'ab03', customer:'Kevin Shaw',     product:'Basketball Intelligence API Pro', cart: '$499', mins: '1d ago'  },
];

const STATUS_COLOR: Record<OrderStatus, string> = {
  Completed:  GAIN,
  Processing: CAUTION,
  Shipped:    '#1A1714',
  Refunded:   HEAT,
};

type OrderFilter = 'All' | 'Completed' | 'Processing' | 'Shipped' | 'Refunded';
const FILTERS: OrderFilter[] = ['All', 'Completed', 'Processing', 'Shipped', 'Refunded'];

export default function OrdersScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('business:store');
  const isCEO = role === roleCycles[0];

  const [filter, setFilter] = useState<OrderFilter>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (!isCEO) router.replace('/(tabs)/(main)/business-store/purchases' as any);
  }, [isCEO, router]);

  if (!isCEO) return null;

  const filtered = ORDERS.filter(o => filter === 'All' || o.status === filter);
  const totalRevenue = ORDERS.filter(o => o.status !== 'Refunded').reduce((s, o) => s + o.amount, 0);
  const refunds = ORDERS.filter(o => o.status === 'Refunded').reduce((s, o) => s + o.amount, 0);

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
              <Text style={[s.titlePillText, { color: C.label }]}>Orders</Text>
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

        {/* Stats row */}
        <View style={[s.row, { gap: 10, paddingHorizontal: 16, marginBottom: 20 }]}>
          {[
            { label: 'Total Orders', value: `${ORDERS.length}`,       color: C.label },
            { label: 'Revenue',      value: `$${totalRevenue}`,        color: GAIN    },
            { label: 'Refunds',      value: `-$${refunds}`,            color: HEAT    },
            { label: 'Abandoned',    value: `${ABANDONED.length}`,     color: CAUTION },
          ].map(stat => (
            <GlassView key={stat.label} tier={1} style={[s.statCard, { flex: 1 }]}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: stat.color }}>{stat.value}</Text>
              <Text style={{ fontSize: 10, color: C.secondary, marginTop: 2 }}>{stat.label}</Text>
            </GlassView>
          ))}
        </View>

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

        {/* Order list */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {filtered.map((order, i) => (
              <Pressable
                key={order.id}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert(order.customer, `${order.product}\n$${order.amount} · ${order.date}`); }}
                style={({ pressed }) => [
                  s.row, { paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{order.customer}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }} numberOfLines={1}>{order.product}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: order.status === 'Refunded' ? HEAT : C.label }}>${order.amount}</Text>
                  <View style={[s.statusPill, { backgroundColor: STATUS_COLOR[order.status] + '18', borderColor: STATUS_COLOR[order.status] + '60' }]}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: STATUS_COLOR[order.status] }}>{order.status}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 11, color: C.secondary, width: 38, textAlign: 'right' }}>{order.date}</Text>
              </Pressable>
            ))}
          </GlassView>
        </View>

        {/* Abandoned carts */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Abandoned Carts</Text>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {ABANDONED.map((cart, i) => (
              <Pressable
                key={cart.id}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Send Recovery Email', `Send cart recovery to ${cart.customer}?`); }}
                style={({ pressed }) => [
                  s.row, { paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <IconSymbol name="cart.badge.minus" size={16} color={CAUTION} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{cart.customer}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }} numberOfLines={1}>{cart.product}</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: CAUTION }}>{cart.cart}</Text>
                <Text style={{ fontSize: 11, color: C.secondary }}>{cart.mins}</Text>
              </Pressable>
            ))}
          </GlassView>
          <Pressable
            style={[s.recoverBtn, { backgroundColor: C.surface, borderColor: C.separator, marginTop: 10 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Send Recovery Emails', 'Sending to all 3 abandoned carts — coming soon'); }}
          >
            <IconSymbol name="paperplane.fill" size={15} color={C.label} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginLeft: 8 }}>Send Recovery Emails</Text>
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
    sectionTitle:  { fontSize: 17, fontWeight: '700' },
    filterPill:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
    statCard:      { alignItems: 'center', padding: 12, borderRadius: 12 },
    statusPill:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
    recoverBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 46, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  });
}
