/**
 * Store Customers — Owner view of all customers.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet, Animated } from 'react-native';
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

type Customer = {
  id: string;
  name: string;
  initials: string;
  email: string;
  totalSpent: number;
  productCount: number;
  lastPurchase: string;
};

const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Marcus Johnson',   initials: 'MJ', email: 'marcus@email.com',   totalSpent: 298, productCount: 2, lastPurchase: 'Apr 13' },
  { id: 'c2', name: 'Aaliyah Thompson', initials: 'AT', email: 'aaliyah@email.com',  totalSpent: 29,  productCount: 1, lastPurchase: 'Apr 13' },
  { id: 'c3', name: 'Devon Williams',   initials: 'DW', email: 'devon@email.com',    totalSpent: 150, productCount: 1, lastPurchase: 'Apr 12' },
  { id: 'c4', name: 'Priya Sharma',     initials: 'PS', email: 'priya@email.com',    totalSpent: 194, productCount: 3, lastPurchase: 'Apr 12' },
  { id: 'c5', name: 'Jordan Lee',       initials: 'JL', email: 'jordan@email.com',   totalSpent: 149, productCount: 1, lastPurchase: 'Apr 11' },
  { id: 'c6', name: 'Keisha Morgan',    initials: 'KM', email: 'keisha@email.com',   totalSpent: 450, productCount: 4, lastPurchase: 'Apr 10' },
  { id: 'c7', name: 'Alex Rivera',      initials: 'AR', email: 'alex@email.com',     totalSpent: 65,  productCount: 2, lastPurchase: 'Apr 9'  },
  { id: 'c8', name: 'Sofia Chen',       initials: 'SC', email: 'sofia@email.com',    totalSpent: 344, productCount: 3, lastPurchase: 'Apr 7'  },
];

export default function StoreCustomersScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const topBarH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);
  const [role, cycleRole, roleCycles] = useDemoRole('personal:store');
  const isOwner = role === roleCycles[0];
  const router = useRouter();
  useEffect(() => { if (!isOwner) router.navigate('/(tabs)/(main)/store' as any); }, [isOwner]);
  const [search, setSearch] = useState('');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_CUSTOMERS;
    const q = search.toLowerCase();
    return MOCK_CUSTOMERS.filter(c =>
      c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [search]);

  const totalRevenue = MOCK_CUSTOMERS.reduce((s, c) => s + c.totalSpent, 0);

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
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Customers</Text>
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
        keyboardShouldPersistTaps="handled"
      >
        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 16, height: 44, paddingHorizontal: 12, gap: 8 }}>
          <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
          <TextInput
            style={{ flex: 1, fontSize: 15, color: C.label }}
            placeholder="Search customers..."
            placeholderTextColor={C.secondary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <IconSymbol name="xmark.circle.fill" size={16} color={C.secondary} />
            </Pressable>
          )}
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 14, alignItems: 'center', gap: 3 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: C.label }}>{MOCK_CUSTOMERS.length}</Text>
            <Text style={{ fontSize: 11, color: C.secondary }}>Customers</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 14, alignItems: 'center', gap: 3 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: C.label }}>${totalRevenue.toLocaleString()}</Text>
            <Text style={{ fontSize: 11, color: C.secondary }}>Total Revenue</Text>
          </View>
        </View>

        {/* List */}
        <View style={{ backgroundColor: C.surface, marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: C.secondary }}>No customers found.</Text>
            </View>
          ) : filtered.map((customer, idx) => (
            <Pressable
              key={customer.id}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12,
                borderTopWidth: idx === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: C.separator,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary }}>{customer.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{customer.name}</Text>
                <Text style={{ fontSize: 12, color: C.secondary }}>{customer.email}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 2 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>${customer.totalSpent}</Text>
                <Text style={{ fontSize: 11, color: C.secondary }}>
                  {customer.productCount} purchase{customer.productCount !== 1 ? 's' : ''} · {customer.lastPurchase}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
