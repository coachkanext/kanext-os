/**
 * Wallet — Universal lower-role KPay default (all modes).
 * Balance card · Quick actions · Recent activity (mode-specific) · Savings
 */
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlassView } from '@/components/ui/glass-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useMode } from '@/context/app-context';

const GAIN = '#5A8A6E';
const HEAT = '#B85C5C';
const TOP_BAR_H = 52;

type Tx = { id: string; icon: string; desc: string; amount: string; time: string; positive: boolean };
type TxSet = { admin: Tx[]; member: Tx[] };

const BALANCES: Record<string, { admin: string; member: string }> = {
  personal:  { admin: '$4,280.00',  member: '$342.50'   },
  business:  { admin: '$28,450.00', member: '$1,840.00' },
  education: { admin: '$6,120.00',  member: '$890.00'   },
  community: { admin: '$3,640.00',  member: '$1,205.00' },
  sports:    { admin: '$5,340.00',  member: '$720.00'   },
};

const RECENT_TXS: Record<string, TxSet> = {
  personal: {
    admin: [
      { id: 'pa1', icon: 'arrow.down.circle',  desc: 'KPay Earnings — April',            amount: '+$820.00',  time: '2h ago',    positive: true  },
      { id: 'pa2', icon: 'star.fill',          desc: 'Brand Deal — SportsTech',          amount: '+$1,500.00',time: 'Apr 12',    positive: true  },
      { id: 'pa3', icon: 'doc.text.fill',      desc: 'Content Strategy Playbook sale',   amount: '+$29.00',   time: 'Apr 10',    positive: true  },
      { id: 'pa4', icon: 'creditcard.fill',    desc: 'LinkedIn Premium',                 amount: '-$39.99',   time: 'Apr 8',     positive: false },
      { id: 'pa5', icon: 'arrow.up.circle',    desc: 'Transfer to Chase',                amount: '-$500.00',  time: 'Apr 5',     positive: false },
    ],
    member: [
      { id: 'pm1', icon: 'person.fill',        desc: 'Sammy K — Inner Circle',           amount: '-$25.00',   time: '2h ago',    positive: false },
      { id: 'pm2', icon: 'doc.text.fill',      desc: 'Content Strategy Playbook',        amount: '-$29.00',   time: 'Yesterday', positive: false },
      { id: 'pm3', icon: 'arrow.down.circle',  desc: 'Transfer from Chase',              amount: '+$200.00',  time: 'Apr 13',    positive: true  },
      { id: 'pm4', icon: 'cart.fill',          desc: 'Apple — MacBook Pro Subscription', amount: '-$19.99',   time: 'Apr 12',    positive: false },
      { id: 'pm5', icon: 'arrow.down.circle',  desc: 'Direct Deposit — Employer',        amount: '+$2,400.00',time: 'Apr 10',    positive: true  },
    ],
  },
  business: {
    admin: [
      { id: 'ba1', icon: 'arrow.down.circle',  desc: 'Client Retainer — Q2',             amount: '+$5,000.00',time: '3h ago',    positive: true  },
      { id: 'ba2', icon: 'person.2.fill',      desc: 'Payroll Run — April',              amount: '-$18,400.00',time: 'Apr 10',   positive: false },
      { id: 'ba3', icon: 'building.2.fill',    desc: 'Office Rent — April',              amount: '-$2,800.00',time: 'Apr 1',     positive: false },
      { id: 'ba4', icon: 'creditcard.fill',    desc: 'AWS — Cloud Infrastructure',       amount: '-$312.00',  time: 'Mar 28',    positive: false },
      { id: 'ba5', icon: 'arrow.down.circle',  desc: 'Transfer from Business Chase',     amount: '+$10,000.00',time: 'Mar 25',   positive: true  },
    ],
    member: [
      { id: 'bm1', icon: 'building.2.fill',   desc: 'KaNeXT — OS Pro Subscription',     amount: '-$99.00',   time: '3h ago',    positive: false },
      { id: 'bm2', icon: 'doc.text.fill',      desc: 'Design Services Invoice',          amount: '-$1,200.00',time: 'Apr 13',    positive: false },
      { id: 'bm3', icon: 'arrow.down.circle',  desc: 'Transfer from Chase',              amount: '+$2,000.00',time: 'Apr 10',    positive: true  },
      { id: 'bm4', icon: 'cart.fill',          desc: 'Shopify — Monthly Plan',           amount: '-$79.00',   time: 'Apr 8',     positive: false },
      { id: 'bm5', icon: 'arrow.down.circle',  desc: 'Consulting Retainer',              amount: '-$500.00',  time: 'Apr 5',     positive: false },
    ],
  },
  education: {
    admin: [
      { id: 'ea1', icon: 'arrow.down.circle',  desc: 'Lincoln University — Salary',      amount: '+$8,200.00',time: 'Apr 1',     positive: true  },
      { id: 'ea2', icon: 'airplane',           desc: 'Faculty Conference — Registration',amount: '-$450.00',  time: 'Mar 28',    positive: false },
      { id: 'ea3', icon: 'arrow.up.circle',    desc: 'Transfer to Personal Savings',     amount: '-$1,000.00',time: 'Mar 25',    positive: false },
      { id: 'ea4', icon: 'briefcase.fill',     desc: 'Pension Contribution',             amount: '-$820.00',  time: 'Mar 20',    positive: false },
      { id: 'ea5', icon: 'arrow.down.circle',  desc: 'Travel Reimbursement',             amount: '+$340.00',  time: 'Mar 15',    positive: true  },
    ],
    member: [
      { id: 'em1', icon: 'building.columns.fill', desc: 'Lincoln University — Tuition', amount: '-$6,575.00',time: 'Apr 1',     positive: false },
      { id: 'em2', icon: 'book.fill',          desc: 'Bookstore — BUSN 301 Textbook',   amount: '-$89.00',   time: 'Mar 28',    positive: false },
      { id: 'em3', icon: 'arrow.down.circle',  desc: 'Financial Aid Disbursement',       amount: '+$3,200.00',time: 'Mar 25',    positive: true  },
      { id: 'em4', icon: 'fork.knife',         desc: 'Cafeteria — Meal Plan Reload',     amount: '-$200.00',  time: 'Mar 20',    positive: false },
      { id: 'em5', icon: 'arrow.down.circle',  desc: 'Transfer from Bank of America',   amount: '+$500.00',  time: 'Mar 15',    positive: true  },
    ],
  },
  community: {
    admin: [
      { id: 'ca1', icon: 'arrow.down.circle',  desc: 'ICCLA — Monthly Salary',           amount: '+$4,200.00',time: 'Apr 1',     positive: true  },
      { id: 'ca2', icon: 'person.fill',        desc: 'Conference Registration',           amount: '-$250.00',  time: 'Mar 28',    positive: false },
      { id: 'ca3', icon: 'arrow.up.circle',    desc: 'Transfer to Personal Savings',     amount: '-$500.00',  time: 'Mar 25',    positive: false },
      { id: 'ca4', icon: 'book.fill',          desc: 'Ministry Resources',                amount: '-$85.00',   time: 'Mar 20',    positive: false },
      { id: 'ca5', icon: 'arrow.down.circle',  desc: 'Direct Deposit — Employer',        amount: '+$100.00',  time: 'Mar 15',    positive: true  },
    ],
    member: [
      { id: 'cm1', icon: 'heart.fill',         desc: 'ICCLA — Sunday Offering',          amount: '-$50.00',   time: '2d ago',    positive: false },
      { id: 'cm2', icon: 'building.2.fill',    desc: 'Building Fund',                    amount: '-$100.00',  time: 'Apr 6',     positive: false },
      { id: 'cm3', icon: 'arrow.down.circle',  desc: 'Transfer from Bank of America',   amount: '+$500.00',  time: 'Apr 5',     positive: true  },
      { id: 'cm4', icon: 'heart.fill',         desc: 'ICCLA — Missions Giving',          amount: '-$25.00',   time: 'Mar 30',    positive: false },
      { id: 'cm5', icon: 'arrow.down.circle',  desc: 'Direct Deposit — Employer',        amount: '+$2,400.00',time: 'Mar 28',    positive: true  },
    ],
  },
  sports: {
    admin: [
      { id: 'sa1', icon: 'arrow.down.circle',  desc: 'LU Athletics — Monthly Salary',    amount: '+$6,500.00',time: 'Apr 1',     positive: true  },
      { id: 'sa2', icon: 'airplane',           desc: 'Recruiting Trip — Flight',          amount: '-$620.00',  time: 'Mar 28',    positive: false },
      { id: 'sa3', icon: 'arrow.down.circle',  desc: 'Team Dinner Reimbursement',        amount: '+$280.00',  time: 'Mar 25',    positive: true  },
      { id: 'sa4', icon: 'person.fill',        desc: 'NABC Conference — Registration',   amount: '-$375.00',  time: 'Mar 20',    positive: false },
      { id: 'sa5', icon: 'arrow.up.circle',    desc: 'Transfer to Personal Savings',     amount: '-$1,000.00',time: 'Mar 15',    positive: false },
    ],
    member: [
      { id: 'sm1', icon: 'star.fill',          desc: 'NIL Pool Allocation — Apr',        amount: '+$450.00',  time: '3d ago',    positive: true  },
      { id: 'sm2', icon: 'graduationcap.fill', desc: 'Scholarship Disbursement',          amount: '+$6,575.00',time: 'Apr 1',     positive: true  },
      { id: 'sm3', icon: 'tshirt.fill',        desc: 'Team Store — Warm-up Jacket',      amount: '-$65.00',   time: 'Mar 28',    positive: false },
      { id: 'sm4', icon: 'cart.fill',          desc: 'Campus Bookstore',                  amount: '-$42.00',   time: 'Mar 25',    positive: false },
      { id: 'sm5', icon: 'arrow.down.circle',  desc: 'Transfer from Chase',              amount: '+$200.00',  time: 'Mar 20',    positive: true  },
    ],
  },
};

export default function WalletScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mode   = useMode();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const _rk = mode === 'sports' ? 'sports:agenda' : mode === 'community' ? 'community:kaypay' : mode === 'education' ? 'education' : mode === 'business' ? 'business' : 'personal:kaypay';
  const [role, cycleRole, roleCycles] = useDemoRole(_rk);
  const isOwner = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const txs = (RECENT_TXS[mode] ?? RECENT_TXS.personal)[isOwner ? 'admin' : 'member'];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: insets.top, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, opacity }}>
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' }}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[st.pill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[st.pillText, { color: C.label }]}>Wallet</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={role === roleCycles[0]} />
          </View>
        </View>
      </Animated.View>

      <ScrollView onScroll={onScroll} scrollEventThrottle={scrollEventThrottle} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}>

        {/* Balance card */}
        <GlassView tier={1} radius={16} style={{ padding: 24, marginBottom: 16, alignItems: 'center' }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary, letterSpacing: 0.4, marginBottom: 8 }}>AVAILABLE BALANCE</Text>
          <Text style={{ fontSize: 42, fontWeight: '700', color: C.label, letterSpacing: -1 }}>{(BALANCES[mode] ?? BALANCES.personal)[isOwner ? 'admin' : 'member']}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <View style={{ backgroundColor: GAIN + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: GAIN }}>4.00% APY</Text>
            </View>
          </View>
        </GlassView>

        {/* Quick actions */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 }}>
          {[
            { icon: 'paperplane.fill', label: 'Pay',     route: '/(tabs)/(main)/kaypay/pay'   },
            { icon: 'arrow.down.circle.fill', label: 'Request', route: '/(tabs)/(main)/kaypay/pay' },
            { icon: 'creditcard.fill', label: 'Card',    route: '/(tabs)/(main)/kaypay/card'  },
            { icon: 'qrcode',          label: 'Scan',    route: null },
          ].map(a => (
            <Pressable key={a.label} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (a.route) router.navigate(a.route as any); }} style={{ alignItems: 'center', gap: 8 }}>
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
                <IconSymbol name={a.icon as any} size={22} color={C.label} />
              </View>
              <Text style={{ fontSize: 12, fontWeight: '500', color: C.secondary }}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Recent activity */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>Recent Activity</Text>
          <Text style={{ fontSize: 13, color: C.secondary }}>See all</Text>
        </View>
        <GlassView tier={1} radius={14} style={{ overflow: 'hidden', marginBottom: 24 }}>
          {txs.map((tx, idx) => (
            <View key={tx.id} style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: idx < txs.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
                <IconSymbol name={tx.icon as any} size={16} color={C.label} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }} numberOfLines={1}>{tx.desc}</Text>
                <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{tx.time}</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: tx.positive ? GAIN : C.label }}>{tx.amount}</Text>
            </View>
          ))}
        </GlassView>

        {/* Savings */}
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 12 }}>Savings</Text>
        <GlassView tier={1} radius={14} style={{ padding: 16, gap: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 22, fontWeight: '700', color: C.label }}>$1,240.00</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>4.00% APY · Earning $4.13/mo</Text>
            </View>
            <View style={{ backgroundColor: GAIN + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: GAIN }}>4.00%</Text>
            </View>
          </View>
          <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator }]} />
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Emergency Fund</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>$1,240 / $5,000</Text>
            </View>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: C.separator, overflow: 'hidden' }}>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: C.label, width: '24.8%' }} />
            </View>
          </View>
        </GlassView>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  pill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  pillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
});
