/**
 * Give — Member giving screen (default for Member).
 * Pastor redirects to giving-dashboard.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert,
  TextInput, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;
const GAIN      = '#5A8A6E';
const CAUTION   = '#B8943E';

const FUNDS = ['General Offering', 'Building Fund', 'Missions', 'Benevolence'];

const RECURRING_GIFTS = [
  { id: 'r1', amount: '$100', fund: 'General Offering', frequency: 'Monthly',  nextDate: 'May 1'  },
  { id: 'r2', amount: '$25',  fund: 'Missions',         frequency: 'Monthly',  nextDate: 'May 1'  },
];

const PLEDGES = [
  { id: 'pl1', campaign: 'Building Expansion Phase 2', pledged: 500, paid: 200, nextDate: 'May 1' },
];

export default function GiveScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('community:give');
  const isPastor = role === roleCycles[0];

  const [amount,      setAmount]      = useState('');
  const [selectedFund,setSelectedFund]= useState(0);

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (isPastor) router.replace('/(tabs)/(main)/give/giving-dashboard' as any);
  }, [isPastor, router]));

  if (isPastor) return null;

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>

      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <View style={s.topBarSide}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Give</Text>
            </View>
          </View>
          <View style={[s.topBarSide, { alignItems: 'flex-end' }]}>
            <RolePill role={role} onPress={cycleRole} isPrimary={false} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Give Now Card */}
        <View style={[s.giveCard, { backgroundColor: C.surface }]}>
          <Text style={[s.giveCardTitle, { color: C.label }]}>Give Now</Text>
          <View style={[s.amountInput, { borderColor: C.separator }]}>
            <Text style={[s.dollarSign, { color: C.secondary }]}>$</Text>
            <TextInput
              style={[s.amountText, { color: C.label }]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={C.secondary}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Fund picker */}
          <Text style={[s.fundLabel, { color: C.secondary }]}>Fund</Text>
          <View style={s.fundPills}>
            {FUNDS.map((fund, idx) => (
              <Pressable
                key={fund}
                style={[s.fundPill, selectedFund === idx ? { backgroundColor: C.label } : { backgroundColor: C.bg, borderColor: C.separator, borderWidth: 1 }]}
                onPress={() => { Haptics.selectionAsync(); setSelectedFund(idx); }}
              >
                <Text style={[s.fundPillText, { color: selectedFund === idx ? C.bg : C.secondary }]}>{fund}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[s.giveBtn, { backgroundColor: C.label }]}
            onPress={() => {
              if (!amount || parseFloat(amount) <= 0) { Alert.alert('Enter an amount'); return; }
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Alert.alert('Confirm Gift', `Give $${amount} to ${FUNDS[selectedFund]}?`, [
                { text: 'Cancel' },
                { text: 'Give', onPress: () => { setAmount(''); Alert.alert('Thank you!', 'Your gift has been processed through KPay.'); } },
              ]);
            }}
          >
            <Text style={[s.giveBtnText, { color: C.bg }]}>Give via KPay</Text>
          </Pressable>
        </View>

        {/* Recurring Giving */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>Recurring Giving</Text>
        <View style={[s.card, { backgroundColor: C.surface, marginBottom: 24 }]}>
          {RECURRING_GIFTS.map((r, idx) => (
            <View key={r.id} style={[s.recurringRow, idx < RECURRING_GIFTS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}>
              <View style={{ flex: 1 }}>
                <Text style={[s.recurringAmount, { color: C.label }]}>{r.amount} · {r.frequency}</Text>
                <Text style={[s.recurringSub, { color: C.secondary }]}>{r.fund} · Next {r.nextDate}</Text>
              </View>
              <Pressable onPress={() => Alert.alert('Edit Recurring Gift', `Edit or cancel ${r.amount} ${r.frequency} to ${r.fund}?`, [{ text: 'Cancel Gift', style: 'destructive', onPress: () => {} }, { text: 'Edit', onPress: () => {} }, { text: 'Close', style: 'cancel' }])}>
                <Text style={[s.editLink, { color: C.secondary }]}>Edit</Text>
              </Pressable>
            </View>
          ))}
          <Pressable
            style={[s.addRecurringBtn, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
            onPress={() => Alert.alert('Set Up Recurring', 'Configure a new recurring gift?', [{ text: 'Cancel' }, { text: 'Set Up' }])}
          >
            <IconSymbol name="plus" size={14} color={C.secondary} />
            <Text style={[s.addRecurringText, { color: C.secondary }]}>Add Recurring Gift</Text>
          </Pressable>
        </View>

        {/* My Pledges */}
        {PLEDGES.length > 0 && (
          <>
            <Text style={[s.sectionLabel, { color: C.secondary }]}>My Pledges</Text>
            <View style={[s.card, { backgroundColor: C.surface, marginBottom: 24 }]}>
              {PLEDGES.map((p) => {
                const pct = Math.round((p.paid / p.pledged) * 100);
                const remaining = p.pledged - p.paid;
                return (
                  <View key={p.id} style={{ padding: 14 }}>
                    <Text style={[s.pledgeCampaign, { color: C.label }]}>{p.campaign}</Text>
                    <View style={{ height: 4, backgroundColor: C.separator, borderRadius: 2, marginVertical: 8 }}>
                      <View style={{ height: 4, width: `${pct}%` as any, backgroundColor: GAIN, borderRadius: 2 }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={[s.pledgeSub, { color: C.secondary }]}>${p.paid} of ${p.pledged} paid ({pct}%)</Text>
                      <Text style={[s.pledgeSub, { color: CAUTION }]}>${remaining} remaining · Next {p.nextDate}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Quick Stats */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>Year to Date</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {[
            { label: 'Total Given',    value: '$1,500' },
            { label: 'Number of Gifts', value: '14'    },
          ].map((stat, idx, arr) => (
            <View key={stat.label} style={[s.statRow, idx < arr.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}>
              <Text style={[s.statLabel, { color: C.secondary }]}>{stat.label}</Text>
              <Text style={[s.statValue, { color: C.label }]}>{stat.value}</Text>
            </View>
          ))}
          <Pressable
            style={[s.receiptBtn, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
            onPress={() => Alert.alert('Tax Receipt', 'Download your year-end giving statement?', [{ text: 'Cancel' }, { text: 'Download' }])}
          >
            <IconSymbol name="arrow.down.doc" size={14} color={C.label} />
            <Text style={[s.receiptBtnText, { color: C.label }]}>Download Tax Receipt</Text>
          </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:      { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:      { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:  { width: 80, justifyContent: 'center' },
  titlePill:   { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  titleText:   { fontSize: 13, fontWeight: '700' },

  giveCard:      { borderRadius: 14, padding: 20, marginBottom: 24 },
  giveCardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 16 },
  amountInput:   { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, height: 64, marginBottom: 16 },
  dollarSign:    { fontSize: 28, fontWeight: '300', marginRight: 4 },
  amountText:    { flex: 1, fontSize: 36, fontWeight: '700' },
  fundLabel:     { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
  fundPills:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  fundPill:      { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  fundPillText:  { fontSize: 13, fontWeight: '500' },
  giveBtn:       { borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  giveBtnText:   { fontSize: 16, fontWeight: '700' },

  sectionLabel:  { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  card:          { borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  rowBorder:     { borderBottomWidth: StyleSheet.hairlineWidth },

  recurringRow:    { flexDirection: 'row', alignItems: 'center', padding: 14 },
  recurringAmount: { fontSize: 14, fontWeight: '600' },
  recurringSub:    { fontSize: 12, marginTop: 2 },
  editLink:        { fontSize: 13, fontWeight: '500' },
  addRecurringBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 },
  addRecurringText:{ fontSize: 13, fontWeight: '500' },

  pledgeCampaign: { fontSize: 14, fontWeight: '600' },
  pledgeSub:      { fontSize: 11 },

  statRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  statLabel:      { fontSize: 14 },
  statValue:      { fontSize: 15, fontWeight: '700' },
  receiptBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 },
  receiptBtnText: { fontSize: 13, fontWeight: '600' },
});
