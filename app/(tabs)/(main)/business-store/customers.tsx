/**
 * Business Store — Customers (CEO only)
 * Search, filter pills, customer list with CLV.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, TextInput, Alert,
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

type CustomerSegment = 'All' | 'Subscribers' | 'One-time' | 'At Risk' | 'High Value';
const FILTERS: CustomerSegment[] = ['All', 'Subscribers', 'One-time', 'At Risk', 'High Value'];

type Customer = {
  id: string; name: string; initials: string; email: string;
  totalSpend: number; orders: number; plan: string | null;
  segment: CustomerSegment; lastOrder: string; isAtRisk?: boolean;
};

const CUSTOMERS: Customer[] = [
  { id:'cu01', name:'Marcus Webb',       initials:'MW', email:'marcus@kanext.com',    totalSpend:2498, orders:7,  plan:'KaNeXT OS Pro',    segment:'High Value',  lastOrder:'Apr 14' },
  { id:'cu02', name:'Sandra Ellis',      initials:'SE', email:'s.ellis@bcu.edu',      totalSpend:1386, orders:4,  plan:'Basketball Intelligence API Starter', segment:'Subscribers', lastOrder:'Apr 13' },
  { id:'cu03', name:'Tyler Okafor',      initials:'TO', email:'tyler@kanext.com',     totalSpend:3493, orders:5,  plan:'Basketball Intelligence API Pro', segment:'High Value',  lastOrder:'Apr 9'  },
  { id:'cu04', name:'Deja Collins',      initials:'DC', email:'deja@kanext.com',      totalSpend:384,  orders:3,  plan:'KaNeXT OS Pro',    segment:'Subscribers', lastOrder:'Apr 10' },
  { id:'cu05', name:'Kevin Shaw',        initials:'KS', email:'k.shaw@loc.edu',       totalSpend:29,   orders:1,  plan:'KaNeXT OS Pro',    segment:'Subscribers', lastOrder:'Apr 11', isAtRisk:true },
  { id:'cu06', name:'Victoria James',    initials:'VJ', email:'v.james@tuskegee.edu', totalSpend:5733, orders:3,  plan:'KaNeXT OS Enterprise', segment:'High Value', lastOrder:'Jan 15' },
  { id:'cu07', name:'Aisha Brooks',      initials:'AB', email:'aisha@kanext.com',     totalSpend:100,  orders:2,  plan:null,               segment:'One-time',    lastOrder:'Apr 8'  },
  { id:'cu08', name:'Jordan Lee',        initials:'JL', email:'jordan@kanext.com',    totalSpend:29,   orders:1,  plan:null,               segment:'At Risk',     lastOrder:'Mar 20', isAtRisk:true },
  { id:'cu09', name:'Linda Washington',  initials:'LW', email:'l.washington@pvamu.edu', totalSpend:65, orders:1,  plan:null,               segment:'One-time',    lastOrder:'Apr 7'  },
  { id:'cu10', name:'Robert King',       initials:'RK', email:'r.king@lane.edu',      totalSpend:0,    orders:0,  plan:null,               segment:'At Risk',     lastOrder:'—',      isAtRisk:true },
];

export default function CustomersScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('business:store');
  const isCEO = role === roleCycles[0];

  const [query, setQuery]   = useState('');
  const [filter, setFilter] = useState<CustomerSegment>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (!isCEO) router.replace('/(tabs)/(main)/business-store/purchases' as any);
  }, [isCEO, router]);

  if (!isCEO) return null;

  const filtered = CUSTOMERS.filter(c => {
    const q = query.toLowerCase();
    const matchQ = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    const matchF = filter === 'All' || c.segment === filter;
    return matchQ && matchF;
  });

  const totalCLV = CUSTOMERS.reduce((s, c) => s + c.totalSpend, 0);
  const atRisk   = CUSTOMERS.filter(c => c.isAtRisk).length;

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
              <Text style={[s.titlePillText, { color: C.label }]}>Customers</Text>
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
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: totalTopH + 16, paddingBottom: insets.bottom + 100 }}
      >

        {/* Stats */}
        <View style={[s.row, { gap: 10, paddingHorizontal: 16, marginBottom: 16 }]}>
          {[
            { label: 'Customers', value: `${CUSTOMERS.length}`,              color: C.label },
            { label: 'Total CLV', value: `$${totalCLV.toLocaleString()}`,    color: GAIN    },
            { label: 'At Risk',   value: `${atRisk}`,                        color: HEAT    },
          ].map(stat => (
            <GlassView key={stat.label} tier={1} style={[s.statCard, { flex: 1 }]}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: stat.color }}>{stat.value}</Text>
              <Text style={{ fontSize: 10, color: C.secondary, marginTop: 2 }}>{stat.label}</Text>
            </GlassView>
          ))}
        </View>

        {/* Search */}
        <View style={[s.searchRow, { marginHorizontal: 16, backgroundColor: C.surface, borderColor: C.separator, marginBottom: 4 }]}>
          <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
          <TextInput
            style={[s.searchInput, { color: C.label }]}
            placeholder="Search customers..."
            placeholderTextColor={C.secondary}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={16} color={C.secondary} />
            </Pressable>
          )}
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 12 }}>
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

        {/* Customer list */}
        <GlassView tier={1} style={{ marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' }}>
          {filtered.map((customer, i) => (
            <Pressable
              key={customer.id}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert(customer.name, `${customer.email}\nTotal Spend: $${customer.totalSpend.toLocaleString()}\nOrders: ${customer.orders}\nLast Order: ${customer.lastOrder}`); }}
              style={({ pressed }) => [
                s.row, { paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={[s.avatar, { backgroundColor: C.label }]}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.bg }}>{customer.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={[s.row, { gap: 6 }]}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{customer.name}</Text>
                  {customer.isAtRisk && (
                    <View style={{ backgroundColor: HEAT + '20', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5 }}>
                      <Text style={{ fontSize: 9, fontWeight: '700', color: HEAT }}>AT RISK</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }} numberOfLines={1}>
                  {customer.plan ?? 'One-time buyer'}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: customer.totalSpend > 1000 ? GAIN : C.label }}>
                  ${customer.totalSpend.toLocaleString()}
                </Text>
                <Text style={{ fontSize: 11, color: C.secondary }}>{customer.orders} order{customer.orders !== 1 ? 's' : ''}</Text>
              </View>
              <IconSymbol name="chevron.right" size={12} color={C.secondary} />
            </Pressable>
          ))}
        </GlassView>

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
    avatar:        { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
    searchRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, height: 42, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
    searchInput:   { flex: 1, fontSize: 15 },
  });
}
