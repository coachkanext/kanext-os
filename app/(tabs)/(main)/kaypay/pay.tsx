/**
 * KPay — Pay screen (standalone, mode-agnostic).
 * Both Owner and Follower see their own payment activity.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const TOP_BAR_H = 52;

const BALANCE = 2340.50;
function formatCurrency(n: number) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const RECURRING = [
  { id: 'r1', name: 'Sammy K — Inner Circle', amount: '$25.00', freq: 'Monthly', next: 'May 1',  status: 'Active'  },
  { id: 'r2', name: 'Netflix',                  amount: '$15.99', freq: 'Monthly', next: 'May 8',  status: 'Active'  },
  { id: 'r3', name: 'Gym Membership',            amount: '$45.00', freq: 'Monthly', next: 'Apr 28', status: 'Active'  },
  { id: 'r4', name: '@coach_davis — Supporter',  amount: '$10.00', freq: 'Monthly', next: 'May 3',  status: 'Paused'  },
];

const CONTACTS = [
  { id: 'c1', name: 'James O',   initials: 'JO' },
  { id: 'c2', name: 'Dad',       initials: 'D'  },
  { id: 'c3', name: 'Aria M',    initials: 'AM' },
  { id: 'c4', name: 'Coach T',   initials: 'CT' },
  { id: 'c5', name: 'Sam W',     initials: 'SW' },
];

const ACTIVITY = [
  { id: 'a1', name: 'James Okonkwo',  desc: 'Lunch split',       amount: '-$24.50', color: HEAT, date: 'Apr 7', status: 'Completed' },
  { id: 'a2', name: 'Aria M.',         desc: 'Ticket reimburse',  amount: '+$18.00', color: GAIN, date: 'Apr 6', status: 'Completed' },
  { id: 'a3', name: 'Sammy K (Tip)',   desc: '',                  amount: '-$10.00', color: HEAT, date: 'Apr 6', status: 'Completed' },
  { id: 'a4', name: 'Sam Wilson',      desc: 'Coffee',            amount: '-$6.50',  color: HEAT, date: 'Apr 5', status: 'Pending'   },
  { id: 'a5', name: 'Coach T.',        desc: 'Session refund',    amount: '+$50.00', color: GAIN, date: 'Apr 4', status: 'Completed' },
  { id: 'a6', name: 'Amazon Pay',      desc: 'Purchase',          amount: '-$33.20', color: HEAT, date: 'Apr 3', status: 'Completed' },
];

export default function PayScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);

  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaypay');
  const isOwner = role === roleCycles[0];

  const [search,     setSearch]     = useState('');
  const [recipient,  setRecipient]  = useState('');
  const [amount,     setAmount]     = useState('');
  const [note,       setNote]       = useState('');
  const [method,     setMethod]     = useState<'kpay' | 'card'>('kpay');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const topBarH = insets.top + TOP_BAR_H;

  const handleSend = () => {
    if (!recipient || !amount) {
      Alert.alert('Missing Info', 'Enter a recipient and amount.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Payment Sent', `$${amount} sent to ${recipient}.`);
    setRecipient(''); setAmount(''); setNote('');
  };

  const handleRequest = () => {
    Alert.alert('Request Money', 'Payment request flow coming soon.');
  };

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* ── Top Bar ── */}
      <View style={[s.topBarOuter, { backgroundColor: C.bg, borderBottomColor: C.separator, paddingTop: insets.top }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={s.kBtn}>
            <KMenuButton />
          </Pressable>
          <View style={s.titleWrap}>
            <Text style={[s.title, { color: C.label }]}>Pay</Text>
          </View>
          <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={isOwner} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: topBarH + 16, paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
      >

        {/* Search */}
        <View style={[s.searchBar, { backgroundColor: C.surface, marginHorizontal: 16 }]}>
          <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
          <TextInput
            value={search} onChangeText={setSearch}
            placeholder="Search transactions..." placeholderTextColor={C.secondary}
            style={[s.searchInput, { color: C.label }]}
          />
        </View>

        {/* Pay Someone */}
        <View style={[s.card, { backgroundColor: C.surface, marginTop: 16, marginHorizontal: 16 }]}>
          <Text style={[s.cardHeader, { color: C.label }]}>Pay Someone</Text>

          <TextInput
            value={recipient} onChangeText={setRecipient}
            placeholder="Name, @handle, phone, or email"
            placeholderTextColor={C.secondary}
            style={[s.input, { backgroundColor: C.bg, color: C.label, marginTop: 10 }]}
          />

          <View style={[s.amountRow, { marginTop: 8 }]}>
            <Text style={[s.dollar, { color: C.label }]}>$</Text>
            <TextInput
              value={amount} onChangeText={setAmount}
              placeholder="0.00" placeholderTextColor={C.secondary}
              keyboardType="decimal-pad"
              style={[s.amountInput, { color: C.label }]}
            />
          </View>

          <TextInput
            value={note} onChangeText={setNote}
            placeholder="Add a note..."
            placeholderTextColor={C.secondary}
            style={[s.input, { backgroundColor: C.bg, color: C.label, marginTop: 8 }]}
          />

          {/* Method pills */}
          <View style={[s.methodRow, { marginTop: 10 }]}>
            {(['kpay', 'card'] as const).map(m => (
              <Pressable
                key={m}
                onPress={() => { Haptics.selectionAsync(); setMethod(m); }}
                style={[s.methodPill, { backgroundColor: method === m ? C.label : C.surface, borderColor: C.separator }]}
              >
                <Text style={[s.methodPillText, { color: method === m ? C.bg : C.secondary }]}>
                  {m === 'kpay' ? 'KPay (0% fee)' : 'Card (+2.9%)'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={handleSend}
            style={[s.sendBtn, { backgroundColor: C.label, marginTop: 12 }]}
          >
            <Text style={[s.sendBtnText, { color: C.bg }]}>Send Payment</Text>
          </Pressable>

          <Pressable onPress={handleRequest} style={{ alignItems: 'center', marginTop: 10, paddingBottom: 4 }}>
            <Text style={{ fontSize: 14, color: C.secondary }}>Request Money</Text>
          </Pressable>
        </View>

        {/* Recurring Payments */}
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <Text style={[s.sectionHeader, { color: C.label }]}>Recurring Payments</Text>
          <View style={[s.listCard, { backgroundColor: C.surface }]}>
            {RECURRING.map((item, idx) => (
              <View key={item.id}>
                <Pressable style={s.recurRow} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                  <View style={[s.avatar, { backgroundColor: C.bg }]}>
                    <Text style={[s.avatarText, { color: C.label }]}>{item.name.slice(0,2).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.recurName, { color: C.label }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[s.recurSub, { color: C.secondary }]}>{item.freq} · Next {item.next}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={[s.recurAmount, { color: C.label }]}>{item.amount}</Text>
                    <View style={[s.statusDot, { backgroundColor: item.status === 'Active' ? GAIN + '22' : '#B8943E22' }]}>
                      <View style={[s.dot, { backgroundColor: item.status === 'Active' ? GAIN : '#B8943E' }]} />
                      <Text style={[s.statusText, { color: item.status === 'Active' ? GAIN : '#B8943E' }]}>{item.status}</Text>
                    </View>
                  </View>
                </Pressable>
                {idx < RECURRING.length - 1 && <View style={[s.hairline, { backgroundColor: C.separator }]} />}
              </View>
            ))}
          </View>
        </View>

        {/* Frequent Contacts */}
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <Text style={[s.sectionHeader, { color: C.label }]}>Frequent</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingVertical: 8 }}>
            {CONTACTS.map(c => (
              <Pressable
                key={c.id}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setRecipient(c.name); }}
                style={{ alignItems: 'center', gap: 6 }}
              >
                <View style={[s.contactAvatar, { backgroundColor: C.surface }]}>
                  <Text style={[s.contactInitials, { color: C.label }]}>{c.initials}</Text>
                </View>
                <Text style={[s.contactName, { color: C.secondary }]}>{c.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Recent Activity */}
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <Text style={[s.sectionHeader, { color: C.label }]}>Recent Activity</Text>
          <View style={[s.listCard, { backgroundColor: C.surface }]}>
            {ACTIVITY.map((item, idx) => (
              <View key={item.id}>
                <Pressable style={s.actRow} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                  <View style={[s.actIcon, { backgroundColor: item.color + '22' }]}>
                    <IconSymbol
                      name={item.color === GAIN ? 'arrow.down.circle.fill' : 'arrow.up.circle.fill'}
                      size={20}
                      color={item.color}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.actName, { color: C.label }]} numberOfLines={1}>{item.name}</Text>
                    {!!item.desc && <Text style={[s.actDesc, { color: C.secondary }]}>{item.desc}</Text>}
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Text style={[s.actAmount, { color: item.color }]}>{item.amount}</Text>
                    <Text style={[s.actDate, { color: C.secondary }]}>{item.date}</Text>
                    <View style={[s.statusSmall, { borderColor: C.separator }]}>
                      <Text style={[s.statusSmallText, { color: C.secondary }]}>{item.status}</Text>
                    </View>
                  </View>
                </Pressable>
                {idx < ACTIVITY.length - 1 && <View style={[s.hairline, { backgroundColor: C.separator }]} />}
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root:        { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:      { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
  kBtn:        { width: 40, alignItems: 'center' },
  titleWrap:   { flex: 1, alignItems: 'center' },
  title:       { fontSize: 17, fontWeight: '700' },

  searchBar:   { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, fontSize: 15 },

  card:        { borderRadius: 16, padding: 16 },
  cardHeader:  { fontSize: 16, fontWeight: '700' },

  input:       { borderRadius: 10, padding: 12, fontSize: 15 },
  amountRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' },
  dollar:      { fontSize: 24, fontWeight: '600', marginRight: 4 },
  amountInput: { flex: 1, fontSize: 24, fontWeight: '600' },

  methodRow:   { flexDirection: 'row', gap: 8 },
  methodPill:  { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1 },
  methodPillText: { fontSize: 13, fontWeight: '600' },

  sendBtn:     { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  sendBtnText: { fontSize: 15, fontWeight: '700' },

  sectionHeader: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  listCard:      { borderRadius: 12, overflow: 'hidden' },
  hairline:      { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },

  recurRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13 },
  avatar:      { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontSize: 12, fontWeight: '700' },
  recurName:   { fontSize: 14, fontWeight: '600' },
  recurSub:    { fontSize: 12, marginTop: 1 },
  recurAmount: { fontSize: 14, fontWeight: '700' },
  statusDot:   { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  dot:         { width: 6, height: 6, borderRadius: 3 },
  statusText:  { fontSize: 11, fontWeight: '600' },

  contactAvatar:   { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  contactInitials: { fontSize: 16, fontWeight: '700' },
  contactName:     { fontSize: 11, textAlign: 'center' },

  actRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13 },
  actIcon:   { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  actName:   { fontSize: 14, fontWeight: '600' },
  actDesc:   { fontSize: 12, marginTop: 1 },
  actAmount: { fontSize: 14, fontWeight: '700' },
  actDate:   { fontSize: 11 },
  statusSmall:     { borderWidth: StyleSheet.hairlineWidth, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  statusSmallText: { fontSize: 10 },
});
