/**
 * KayPay Card — Virtual card management: freeze, spend summary, boosts,
 * card transactions, and card settings.
 * Personal mode · KayPay tile.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Constants ─────────────────────────────────────────────────────────────────

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';
const TOP_BAR_H = 52;

// ── Data ──────────────────────────────────────────────────────────────────────

const SPEND_CATEGORIES = [
  { name: 'Food & Drink',  amount: '$124.50', pct: 0.43, color: CAUTION },
  { name: 'Shopping',      amount: '$89.23',  pct: 0.31, color: GAIN    },
  { name: 'Transport',     amount: '$43.20',  pct: 0.15, color: '#1A1714'},
  { name: 'Entertainment', amount: '$30.50',  pct: 0.11, color: HEAT    },
] as const;

const BOOSTS = [
  { merchant: 'Starbucks',  rate: '5%',  label: 'cash back', active: true  },
  { merchant: 'Amazon',     rate: '3%',  label: 'cash back', active: true  },
  { merchant: 'Uber Eats',  rate: '4%',  label: 'cash back', active: false },
  { merchant: 'Apple Pay',  rate: '2%',  label: 'everywhere',active: true  },
] as const;

const CARD_TRANSACTIONS = [
  { merchant: 'Starbucks',     category: 'Food & Drink',  amount: '-$6.75',  date: 'Apr 7',  cashback: '+$0.34'  },
  { merchant: 'Amazon',        category: 'Shopping',      amount: '-$34.99', date: 'Apr 6',  cashback: '+$1.05'  },
  { merchant: 'Uber Eats',     category: 'Food & Drink',  amount: '-$22.40', date: 'Apr 5',  cashback: null      },
  { merchant: 'Apple Store',   category: 'Shopping',      amount: '-$9.99',  date: 'Apr 3',  cashback: '+$0.20'  },
  { merchant: 'Lyft',          category: 'Transport',     amount: '-$14.20', date: 'Apr 2',  cashback: null      },
  { merchant: 'Netflix',       category: 'Entertainment', amount: '-$15.99', date: 'Apr 1',  cashback: null      },
] as const;

const CATEGORY_ICONS: Record<string, string> = {
  'Food & Drink':  'fork.knife',
  'Shopping':      'bag.fill',
  'Transport':     'car.fill',
  'Entertainment': 'play.fill',
};

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function CardScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);

  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaypay');
  const isOwner = role === roleCycles[0];

  const [frozen,        setFrozen]        = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [international, setInternational] = useState(false);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <View style={[s.topBarOuter, {
        backgroundColor: C.bg,
        borderBottomColor: C.separator,
        paddingTop: insets.top,
      }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { tap(); openSidePanel(); }} style={{ width: 40, alignItems: 'center' }}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[s.topBarTitle, { color: C.label }]}>Card</Text>
          </View>
          <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={isOwner} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + TOP_BAR_H + 16,
          paddingBottom: insets.bottom + 60,
          gap: 24,
        }}
      >

        {/* ── 1. Card Visual ──────────────────────────────────────────────── */}
        <View style={[s.cardVisual, { backgroundColor: C.label, marginHorizontal: 16 }]}>
          {/* Header row */}
          <View style={s.cardRow}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5 }}>
              KANEXT
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              {frozen ? (
                <View style={[s.badgeChip, { borderColor: '#B8943E', backgroundColor: 'rgba(184,148,62,0.15)' }]}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: CAUTION }}>FROZEN</Text>
                </View>
              ) : (
                <View style={[s.badgeChip, { borderColor: GAIN, backgroundColor: 'rgba(90,138,110,0.15)' }]}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: GAIN }}>ACTIVE</Text>
                </View>
              )}
            </View>
          </View>

          {/* Card number */}
          <Text style={s.cardNumber}>•••• •••• •••• 4521</Text>

          {/* Bottom row */}
          <View style={s.cardRow}>
            <View>
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>CARD HOLDER</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>SAMMY KALEJAIYE</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>EXPIRES</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>04/28</Text>
            </View>
          </View>
        </View>

        {/* ── 2. Action Buttons ───────────────────────────────────────────── */}
        <View style={[s.actionRow, { paddingHorizontal: 16 }]}>
          {/* Freeze / Unfreeze */}
          <Pressable
            style={{ alignItems: 'center', gap: 6 }}
            onPress={() => {
              tap();
              setFrozen(f => !f);
            }}
          >
            <View style={[s.actionCircle, { backgroundColor: C.surface }]}>
              <IconSymbol name={frozen ? 'snowflake' : 'snowflake'} size={22} color={frozen ? CAUTION : C.label} />
            </View>
            <Text style={{ fontSize: 11, color: C.secondary }}>{frozen ? 'Unfreeze' : 'Freeze'}</Text>
          </Pressable>

          {/* Card Number */}
          <Pressable
            style={{ alignItems: 'center', gap: 6 }}
            onPress={() => { tap(); Alert.alert('Card Number', '4521  9823  1047  4521'); }}
          >
            <View style={[s.actionCircle, { backgroundColor: C.surface }]}>
              <IconSymbol name="number" size={22} color={C.label} />
            </View>
            <Text style={{ fontSize: 11, color: C.secondary }}>Number</Text>
          </Pressable>

          {/* Apple Pay */}
          <Pressable style={{ alignItems: 'center', gap: 6 }} onPress={() => tap()}>
            <View style={[s.actionCircle, { backgroundColor: C.surface }]}>
              <IconSymbol name="apple.logo" size={22} color={C.label} />
            </View>
            <Text style={{ fontSize: 11, color: C.secondary }}>Apple Pay</Text>
          </Pressable>

          {/* Google Pay */}
          <Pressable style={{ alignItems: 'center', gap: 6 }} onPress={() => tap()}>
            <View style={[s.actionCircle, { backgroundColor: C.surface }]}>
              <IconSymbol name="g.circle.fill" size={22} color={C.label} />
            </View>
            <Text style={{ fontSize: 11, color: C.secondary }}>Google Pay</Text>
          </Pressable>

          {/* Order */}
          <Pressable
            style={{ alignItems: 'center', gap: 6 }}
            onPress={() => { tap(); Alert.alert('Order Card', 'A physical card will be mailed within 5–7 business days.'); }}
          >
            <View style={[s.actionCircle, { backgroundColor: C.surface }]}>
              <IconSymbol name="shippingbox.fill" size={22} color={C.label} />
            </View>
            <Text style={{ fontSize: 11, color: C.secondary }}>Order</Text>
          </Pressable>
        </View>

        {/* ── 3. Spending Summary ─────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Spending Summary</Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}>
              <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 2 }}>This month</Text>
              <Text style={{ fontSize: 28, fontWeight: '800', color: C.label }}>$287.43</Text>
            </View>
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginHorizontal: 16 }} />
            {SPEND_CATEGORIES.map((cat, idx) => (
              <View
                key={cat.name}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderBottomWidth: idx < SPEND_CATEGORIES.length - 1 ? StyleSheet.hairlineWidth : 0,
                  borderBottomColor: C.separator,
                  gap: 6,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: C.label }}>{cat.name}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{cat.amount}</Text>
                </View>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: C.separator, overflow: 'hidden' }}>
                  <View style={{ width: `${Math.round(cat.pct * 100)}%` as any, height: 6, borderRadius: 3, backgroundColor: cat.color }} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── 4. Boosts ───────────────────────────────────────────────────── */}
        <View>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12, paddingHorizontal: 16 }]}>Boosts</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
            {BOOSTS.map(boost => (
              <View key={boost.merchant} style={[s.boostCard, { backgroundColor: C.surface }]}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: GAIN }}>{boost.rate}</Text>
                <Text style={{ fontSize: 11, color: C.secondary }}>{boost.label}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginTop: 6 }}>{boost.merchant}</Text>
                <View style={[
                  s.boostPill,
                  boost.active
                    ? { backgroundColor: 'rgba(90,138,110,0.12)', borderColor: GAIN }
                    : { backgroundColor: C.separator + '33', borderColor: C.separator },
                ]}>
                  <Text style={{
                    fontSize: 10, fontWeight: '700',
                    color: boost.active ? GAIN : C.secondary,
                  }}>
                    {boost.active ? 'Active' : 'Tap to add'}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── 5. Card Transactions ─────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Card Transactions</Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {CARD_TRANSACTIONS.map((tx, idx) => {
              const icon = CATEGORY_ICONS[tx.category] ?? 'creditcard.fill';
              return (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    borderBottomWidth: idx < CARD_TRANSACTIONS.length - 1 ? StyleSheet.hairlineWidth : 0,
                    borderBottomColor: C.separator,
                    gap: 12,
                  }}
                >
                  <View style={[s.txIconCircle, { backgroundColor: C.bg }]}>
                    <IconSymbol name={icon as any} size={16} color={C.secondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{tx.merchant}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{tx.category}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 3 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: HEAT }}>{tx.amount}</Text>
                    <Text style={{ fontSize: 11, color: C.secondary }}>{tx.date}</Text>
                    {tx.cashback != null && (
                      <Text style={{ fontSize: 11, fontWeight: '600', color: GAIN }}>{tx.cashback}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── 6. Card Settings ────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Card Settings</Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>

            {/* Notifications */}
            <View style={[s.settingsRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
              <Text style={{ flex: 1, fontSize: 15, color: C.label }}>Transaction Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={v => { tap(); setNotifications(v); }}
                trackColor={{ true: C.label, false: C.separator }}
                thumbColor={C.bg}
                ios_backgroundColor={C.separator}
              />
            </View>

            {/* Daily Limit */}
            <Pressable
              onPress={() => { tap(); Alert.alert('Daily Limit', 'Set your daily spending limit.'); }}
              style={({ pressed }) => ([
                s.settingsRow,
                { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, backgroundColor: pressed ? C.separator : 'transparent' },
              ])}
            >
              <Text style={{ flex: 1, fontSize: 15, color: C.label }}>Daily Limit</Text>
              <Text style={{ fontSize: 14, color: C.secondary, marginRight: 6 }}>$500</Text>
              <IconSymbol name="chevron.right" size={13} color={C.secondary} />
            </Pressable>

            {/* International */}
            <View style={[s.settingsRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
              <Text style={{ flex: 1, fontSize: 15, color: C.label }}>International Payments</Text>
              <Switch
                value={international}
                onValueChange={v => { tap(); setInternational(v); }}
                trackColor={{ true: C.label, false: C.separator }}
                thumbColor={C.bg}
                ios_backgroundColor={C.separator}
              />
            </View>

            {/* Change PIN */}
            <Pressable
              onPress={() => { tap(); Alert.alert('Change PIN', 'You will be asked for your current PIN.'); }}
              style={({ pressed }) => ([
                s.settingsRow,
                { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, backgroundColor: pressed ? C.separator : 'transparent' },
              ])}
            >
              <Text style={{ flex: 1, fontSize: 15, color: C.label }}>Change PIN</Text>
              <IconSymbol name="chevron.right" size={13} color={C.secondary} />
            </Pressable>

            {/* Replace Card */}
            <Pressable
              onPress={() => { tap(); Alert.alert('Replace Card', 'A new card will be mailed. Your current card will be deactivated.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Replace', style: 'destructive', onPress: () => {} }]); }}
              style={({ pressed }) => ([
                s.settingsRow,
                { backgroundColor: pressed ? C.separator : 'transparent' },
              ])}
            >
              <Text style={{ flex: 1, fontSize: 15, color: C.label }}>Replace Card</Text>
              <IconSymbol name="chevron.right" size={13} color={C.secondary} />
            </Pressable>

          </View>
        </View>

      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:        { flex: 1 },
    topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, borderBottomWidth: StyleSheet.hairlineWidth },
    topBar:      { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
    topBarTitle: { fontSize: 17, fontWeight: '700' },

    cardVisual: {
      borderRadius: 20,
      padding: 20,
      height: 200,
      justifyContent: 'space-between',
    },
    cardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    badgeChip: {
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    cardNumber: {
      fontSize: 20,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 3,
      alignSelf: 'center',
      marginTop: 8,
    },

    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    actionCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
    },

    sectionTitle: { fontSize: 17, fontWeight: '700' },
    card: { borderRadius: 14, overflow: 'hidden' },

    boostCard: {
      width: 130,
      borderRadius: 12,
      padding: 14,
      gap: 2,
    },
    boostPill: {
      marginTop: 8,
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },

    txIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },

    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 13,
    },
  });
}
