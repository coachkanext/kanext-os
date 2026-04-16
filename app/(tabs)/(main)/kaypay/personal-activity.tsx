/**
 * Personal KPay — Activity screen.
 * Owner: All / Income / Expenses / Transfers filter + TX list.
 * Follower: All / Purchases / Subscriptions / Transfers filter + TX list.
 */

import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { OWNER_TXS, FOLLOWER_TXS, type KPayTx } from '@/data/mock-personal-kaypay';

const TOP_BAR_H = 52;
const GAIN = '#5A8A6E';
const HEAT = '#B85C5C';

export default function PersonalKPayActivity() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const topBarH = insets.top + TOP_BAR_H;
  const scrollH = useScrollHeader(topBarH);
  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaypay');
  const isOwner = role === roleCycles[0];
  const router = useRouter();
  useEffect(() => { if (!isOwner) router.back(); }, [isOwner]);
  const [txFilter, setTxFilter] = useState('All');
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const ownerFilters    = ['All', 'Income', 'Expenses', 'Transfers'];
  const followerFilters = ['All', 'Purchases', 'Subscriptions', 'Transfers'];
  const filters = isOwner ? ownerFilters : followerFilters;

  const txList = isOwner
    ? OWNER_TXS.filter(tx => {
        if (txFilter === 'All')       return true;
        if (txFilter === 'Income')    return tx.type === 'income';
        if (txFilter === 'Expenses')  return tx.type === 'expense';
        if (txFilter === 'Transfers') return tx.type === 'transfer';
        return true;
      })
    : FOLLOWER_TXS.filter(tx => {
        if (txFilter === 'All')            return true;
        if (txFilter === 'Purchases')      return tx.category === 'store' || tx.category === 'booking' || tx.category === 'purchase';
        if (txFilter === 'Subscriptions')  return tx.category === 'subscription';
        if (txFilter === 'Transfers')      return tx.type === 'transfer';
        return true;
      });

  const TxRow = ({ tx }: { tx: KPayTx }) => {
    const isOpen = expandedTx === tx.id;
    const iconName  = tx.type === 'income'   ? 'arrow.down.circle.fill'
                    : tx.type === 'expense'  ? 'arrow.up.circle.fill'
                    : 'arrow.left.arrow.right.circle.fill';
    const iconColor = tx.type === 'income'   ? GAIN
                    : tx.type === 'expense'  ? HEAT
                    : C.secondary;
    const amtColor  = tx.amount > 0 ? GAIN : tx.type === 'transfer' ? C.secondary : HEAT;
    return (
      <View>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setExpandedTx(isOpen ? null : tx.id); }}
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }}
        >
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
            <IconSymbol name={iconName as any} size={20} color={iconColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={1}>{tx.description}</Text>
            <Text style={{ fontSize: 12, color: C.secondary }}>{tx.date}</Text>
          </View>
          <Text style={{ fontSize: 15, fontWeight: '700', color: amtColor }}>
            {tx.amount > 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount).toFixed(2)}
          </Text>
        </Pressable>
        {isOpen && (
          <View style={{ backgroundColor: C.surface, borderRadius: 10, padding: 14, marginBottom: 8 }}>
            {[
              ['Event',         tx.description],
              ['Rules',         'Platform fee 10%'],
              ['Authorization', `${tx.date}, 2026`],
              ['Payment',       'Settled to KaNeXT Wallet'],
              ['Settlement',    'T+0 instant'],
              ['Audit ID',      tx.txId],
            ].map(([label, value]) => (
              <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 }}>
                <Text style={{ fontSize: 12, color: C.secondary, flex: 1 }}>{label}</Text>
                <Text style={{ fontSize: 12, color: C.label, flex: 2, textAlign: 'right' }} numberOfLines={1}>{value}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

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
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Activity</Text>
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
        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 16 }}>
          {filters.map(f => (
            <Pressable
              key={f}
              onPress={() => { Haptics.selectionAsync(); setTxFilter(f); }}
              style={{ backgroundColor: txFilter === f ? C.label : C.surface, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 7 }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: txFilter === f ? C.bg : C.label }}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {txList.map(tx => <TxRow key={tx.id} tx={tx} />)}

        {txList.length === 0 && (
          <Text style={{ fontSize: 14, color: C.secondary, textAlign: 'center', paddingTop: 40 }}>No transactions</Text>
        )}
      </ScrollView>
    </View>
  );
}
