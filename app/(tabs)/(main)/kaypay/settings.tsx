/**
 * KayPay — Settings
 * Bank accounts, payment methods, payout schedule, filing status,
 * notifications, security, currency, and statements.
 * Personal mode · KayPay tile · Owner + Follower views.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Switch, Alert, Animated,
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
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 54;
const GAIN      = '#5A8A6E';
const CAUTION   = '#B8943E';
// ── Helper ────────────────────────────────────────────────────────────────────

const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function KayPaySettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);

  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaypay');
  const isOwner = role === roleCycles[0];

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(insets.top + TOP_BAR_H);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  // ── State ─────────────────────────────────────────────────────────────────
  const [autoCashOut,           setAutoCashOut]           = useState(true);
  const [notifyPaymentReceived, setNotifyPaymentReceived] = useState(true);
  const [notifyCashOut,         setNotifyCashOut]         = useState(true);
  const [notifyCardTransaction, setNotifyCardTransaction] = useState(true);
  const [notifyInvoicePaid,     setNotifyInvoicePaid]     = useState(true);
  const [notifyLowBalance,      setNotifyLowBalance]      = useState(false);
  const [notifyTaxReminder,     setNotifyTaxReminder]     = useState(true);
  const [biometric,             setBiometric]             = useState(true);
  const [twoFactorLarge,        setTwoFactorLarge]        = useState(true);

  // ── Inline helpers ────────────────────────────────────────────────────────

  function SectionHeader({ title }: { title: string }) {
    return (
      <Text style={[s.sectionHeader, { color: C.secondary }]}>{title}</Text>
    );
  }

  function SwitchRow({
    label, value, onChange, isLast,
  }: { label: string; value: boolean; onChange: (v: boolean) => void; isLast?: boolean }) {
    return (
      <View style={[s.row, { borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
        <Text style={{ fontSize: 15, color: C.label, flex: 1 }}>{label}</Text>
        <Switch
          value={value}
          onValueChange={(v) => { tap(); onChange(v); }}
          trackColor={{ true: C.label, false: C.separator }}
          thumbColor={C.bg}
          ios_backgroundColor={C.separator}
        />
      </View>
    );
  }

  function ChevronRow({
    label, value, onPress, isLast,
  }: { label: string; value?: string; onPress?: () => void; isLast?: boolean }) {
    return (
      <Pressable
        onPress={() => { tap(); onPress?.(); }}
        style={({ pressed }) => ([
          s.row,
          {
            backgroundColor: pressed ? C.separator : 'transparent',
            borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
            borderBottomColor: C.separator,
          },
        ])}
      >
        <Text style={{ fontSize: 15, color: C.label, flex: 1 }}>{label}</Text>
        {value != null && (
          <Text style={{ fontSize: 14, color: C.secondary, marginRight: 6 }}>{value}</Text>
        )}
        <IconSymbol name="chevron.right" size={13} color={C.secondary} />
      </Pressable>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      <Animated.View style={[s.topBarOuter, { backgroundColor: C.bg, borderBottomColor: C.separator, paddingTop: insets.top, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { tap(); openSidePanel(); }} hitSlop={8} style={s.kBtn}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>KPay Settings</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + TOP_BAR_H + 16,
          paddingBottom: insets.bottom + 40,
          gap: 20,
        }}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
      >

        {/* 1. Bank Accounts */}
        <View>
          <SectionHeader title="Bank Accounts" />
          <View style={[s.card, { backgroundColor: C.surface }]}>
            <View style={[s.row, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
              <Text style={{ fontSize: 15, color: C.label, flex: 1 }}>Chase ••4521</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 8 }}>
                <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: GAIN }} />
                <Text style={{ fontSize: 13, color: GAIN }}>Connected</Text>
              </View>
              <View style={{ backgroundColor: C.separator, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2, marginRight: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary }}>Default</Text>
              </View>
              <IconSymbol name="chevron.right" size={13} color={C.secondary} />
            </View>
            <Pressable
              onPress={() => tap()}
              style={({ pressed }) => ([
                s.row,
                {
                  backgroundColor: pressed ? C.separator : 'transparent',
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: C.separator,
                },
              ])}
            >
              <Text style={{ fontSize: 15, color: C.label, flex: 1 }}>Wells Fargo ••8823</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 8 }}>
                <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: GAIN }} />
                <Text style={{ fontSize: 13, color: GAIN }}>Connected</Text>
              </View>
              <IconSymbol name="chevron.right" size={13} color={C.secondary} />
            </Pressable>
            <Pressable
              onPress={() => tap()}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginHorizontal: 16, marginVertical: 12, paddingVertical: 12,
                borderRadius: 10, borderWidth: 1.5, borderStyle: 'dashed',
                borderColor: C.separator,
                backgroundColor: pressed ? C.separator : 'transparent',
              })}
            >
              <IconSymbol name="plus" size={15} color={CAUTION} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: CAUTION }}>Add Bank Account</Text>
            </Pressable>
          </View>
        </View>

        {/* 2. Payment Methods */}
        <View>
          <SectionHeader title="Payment Methods" />
          <View style={[s.card, { backgroundColor: C.surface }]}>
            <View style={[s.row, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
              <Text style={{ fontSize: 15, color: C.label, flex: 1 }}>KPay Wallet</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: GAIN }}>Default</Text>
            </View>
            <Pressable
              onPress={() => tap()}
              style={({ pressed }) => ([
                s.row,
                {
                  backgroundColor: pressed ? C.separator : 'transparent',
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: C.separator,
                },
              ])}
            >
              <Text style={{ fontSize: 15, color: C.label, flex: 1 }}>Visa ••4521</Text>
              <IconSymbol name="chevron.right" size={13} color={C.secondary} />
            </Pressable>
            <Pressable
              onPress={() => tap()}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginHorizontal: 16, marginVertical: 12, paddingVertical: 12,
                borderRadius: 10, borderWidth: 1.5, borderStyle: 'dashed',
                borderColor: C.separator,
                backgroundColor: pressed ? C.separator : 'transparent',
              })}
            >
              <IconSymbol name="plus" size={15} color={CAUTION} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: CAUTION }}>Add Card</Text>
            </Pressable>
          </View>
        </View>

        {/* 3. Payout Schedule (Owner only) */}
        {isOwner && (
          <View>
            <SectionHeader title="Payout Schedule" />
            <View style={[s.card, { backgroundColor: C.surface }]}>
              <SwitchRow label="Auto Cash Out" value={autoCashOut} onChange={setAutoCashOut} />
              {autoCashOut && (
                <ChevronRow label="Frequency" value="Weekly" />
              )}
              <ChevronRow label="Minimum Payout" value="$50.00" />
              <View style={[s.row, { borderBottomWidth: 0 }]}>
                <Text style={{ fontSize: 15, color: C.label, flex: 1 }}>Next Payout</Text>
                <Text style={{ fontSize: 14, color: C.secondary }}>Apr 14, 2026</Text>
              </View>
            </View>
          </View>
        )}

        {/* 4. Filing Status (Owner only) */}
        {isOwner && (
          <View>
            <SectionHeader title="Filing Status" />
            <View style={[s.card, { backgroundColor: C.surface }]}>
              <ChevronRow label="Tax Filing Status" value="Single" />
              <ChevronRow label="State" value="Texas" isLast />
              <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
                <Text style={{ fontSize: 12, color: C.secondary, lineHeight: 17 }}>
                  Used for estimated quarterly tax calculations.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 5. Notifications */}
        <View>
          <SectionHeader title="Notifications" />
          <View style={[s.card, { backgroundColor: C.surface }]}>
            <SwitchRow label="Payment Received"   value={notifyPaymentReceived} onChange={setNotifyPaymentReceived} />
            <SwitchRow label="Cash Out Completed" value={notifyCashOut}         onChange={setNotifyCashOut} />
            <SwitchRow label="Card Transaction"   value={notifyCardTransaction} onChange={setNotifyCardTransaction} />
            {isOwner && (
              <SwitchRow label="Invoice Paid" value={notifyInvoicePaid} onChange={setNotifyInvoicePaid} />
            )}
            <SwitchRow
              label="Low Balance Alert"
              value={notifyLowBalance}
              onChange={setNotifyLowBalance}
              isLast={!isOwner}
            />
            {isOwner && (
              <SwitchRow label="Tax Reminder" value={notifyTaxReminder} onChange={setNotifyTaxReminder} isLast />
            )}
          </View>
        </View>

        {/* 6. Security */}
        <View>
          <SectionHeader title="Security" />
          <View style={[s.card, { backgroundColor: C.surface }]}>
            <SwitchRow label="Biometric Auth" value={biometric} onChange={setBiometric} />
            <ChevronRow label="Transaction PIN" value="Set" />
            <SwitchRow label="Two-Factor (Large Transfers)" value={twoFactorLarge} onChange={setTwoFactorLarge} />
            <ChevronRow label="Daily Spending Limit" value="$1,000" isLast />
          </View>
        </View>

        {/* 7. Currency */}
        <View>
          <SectionHeader title="Currency" />
          <View style={[s.card, { backgroundColor: C.surface }]}>
            <ChevronRow label="Display Currency" value="USD ($)" isLast />
          </View>
        </View>

        {/* 8. Statements */}
        <View>
          <SectionHeader title="Statements" />
          <View style={[s.card, { backgroundColor: C.surface }]}>
            <ChevronRow
              label="Monthly Statements"
              onPress={() => Alert.alert('KPay', 'Opening monthly statements…')}
            />
            <ChevronRow label="Annual Statement 2025" isLast />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBarOuter: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
    },
    kBtn: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
    titlePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },
    card: { marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },
    sectionHeader: {
      fontSize: 12, fontWeight: '600', letterSpacing: 0.5,
      textTransform: 'uppercase', paddingHorizontal: 16,
      marginBottom: 6,
    },
    row: {
      height: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    },
  });
}
