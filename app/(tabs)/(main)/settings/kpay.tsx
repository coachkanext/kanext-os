/**
 * KPay Settings — Linked banks, card controls, payout preferences,
 * transaction security, saved recipients, and tax information.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { resetFooter } from '@/utils/global-footer-hide';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 44;
const GAIN = '#5A8A6E';
const HEAT = '#B85C5C';

export default function KPaySettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const [cardFrozen,      setCardFrozen]      = useState(false);
  const [intlEnabled,     setIntlEnabled]     = useState(false);
  const [onlineEnabled,   setOnlineEnabled]   = useState(true);
  const [transactionPin,  setTransactionPin]  = useState(false);
  const [payoutMode,      setPayoutMode]      = useState<'keep' | 'auto'>('keep');
  const [payoutFreq,      setPayoutFreq]      = useState<'instant' | 'daily' | 'weekly'>('daily');

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const Toggle = ({
    val,
    setVal,
  }: {
    val: boolean;
    setVal: (fn: (v: boolean) => boolean) => void;
  }) => (
    <Pressable
      onPress={() => { haptic(); setVal(v => !v); }}
      style={{
        width: 44, height: 26, borderRadius: 13, padding: 2,
        justifyContent: 'center',
        backgroundColor: val ? C.label : C.separator,
      }}
    >
      <View style={{
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: C.bg,
        marginLeft: val ? 18 : 0,
      }} />
    </Pressable>
  );

  const cyclePayoutFreq = () => {
    haptic();
    setPayoutFreq(f => f === 'instant' ? 'daily' : f === 'daily' ? 'weekly' : 'instant');
  };

  const freqLabel: Record<typeof payoutFreq, string> = {
    instant: 'Instant',
    daily:   'Daily',
    weekly:  'Weekly',
  };

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { haptic(); router.back(); }} hitSlop={8} style={s.topBarBtn}>
            <IconSymbol name="chevron.left" size={20} color={C.label} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.pill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.pillText, { color: C.label }]}>KPay</Text>
            </View>
          </View>
          <View style={s.topBarBtn} />
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* LINKED BANKS */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>LINKED BANKS</Text>
        <GlassView tier={1} style={s.card}>
          {/* Row 1: Chase */}
          <View style={[s.row, { backgroundColor: C.surface }]}>
            <IconSymbol name="building.columns.fill" size={18} color={C.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: C.label }}>Chase Checking</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>••4521 · Primary</Text>
            </View>
            <View style={{ backgroundColor: GAIN + '22', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 }}>
              <Text style={{ fontSize: 11, color: GAIN, fontWeight: '700' }}>Primary</Text>
            </View>
          </View>

          {/* Row 2: Wells Fargo */}
          <View style={[s.row, s.rowBorderTop, { backgroundColor: C.surface, borderTopColor: C.separator }]}>
            <IconSymbol name="building.columns.fill" size={18} color={C.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: C.label }}>Wells Fargo Savings</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>••7803</Text>
            </View>
            <Text style={{ fontSize: 13, color: C.secondary }}>Set Primary</Text>
          </View>

          {/* Row 3: Add */}
          <Pressable
            onPress={() => haptic()}
            style={[s.row, s.rowBorderTop, { backgroundColor: C.surface, borderTopColor: C.separator }]}
          >
            <IconSymbol name="plus.circle" size={18} color={C.secondary} />
            <Text style={{ fontSize: 15, color: C.secondary }}>Add Bank Account</Text>
          </Pressable>
        </GlassView>

        {/* KANEXT CARD */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>KANEXT CARD</Text>
        <GlassView tier={1} style={s.card}>
          {/* Row 1: Freeze Card */}
          <View style={[s.row, { backgroundColor: C.surface }]}>
            <IconSymbol name="snowflake" size={18} color={C.secondary} />
            <Text style={[{ flex: 1, fontSize: 15 }, { color: cardFrozen ? HEAT : C.label }]}>Freeze Card</Text>
            <Toggle val={cardFrozen} setVal={setCardFrozen} />
          </View>

          {/* Row 2: Spending Limits */}
          <Pressable
            onPress={() => haptic()}
            style={[s.row, s.rowBorderTop, { backgroundColor: C.surface, borderTopColor: C.separator }]}
          >
            <IconSymbol name="creditcard.fill" size={18} color={C.secondary} />
            <Text style={{ flex: 1, fontSize: 15, color: C.label }}>Spending Limits</Text>
            <Text style={{ fontSize: 13, color: C.secondary }}>$5,000/mo</Text>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>

          {/* Row 3: International Payments */}
          <View style={[s.row, s.rowBorderTop, { backgroundColor: C.surface, borderTopColor: C.separator }]}>
            <IconSymbol name="globe" size={18} color={C.secondary} />
            <Text style={{ flex: 1, fontSize: 15, color: C.label }}>International Payments</Text>
            <Toggle val={intlEnabled} setVal={setIntlEnabled} />
          </View>

          {/* Row 4: Online Payments */}
          <View style={[s.row, s.rowBorderTop, { backgroundColor: C.surface, borderTopColor: C.separator }]}>
            <IconSymbol name="wifi" size={18} color={C.secondary} />
            <Text style={{ flex: 1, fontSize: 15, color: C.label }}>Online Payments</Text>
            <Toggle val={onlineEnabled} setVal={setOnlineEnabled} />
          </View>

          {/* Row 5: View Card Number */}
          <Pressable
            onPress={() => haptic()}
            style={[s.row, s.rowBorderTop, { backgroundColor: C.surface, borderTopColor: C.separator }]}
          >
            <IconSymbol name="eye.fill" size={18} color={C.secondary} />
            <Text style={{ flex: 1, fontSize: 15, color: C.label }}>View Card Number</Text>
            <Text style={{ fontSize: 13, color: C.secondary }}>Requires Face ID</Text>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>
        </GlassView>

        {/* PAYOUT PREFERENCES */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>PAYOUT PREFERENCES</Text>
        <GlassView tier={1} style={s.card}>
          {/* Row 1: Payout Mode segmented control */}
          <View style={[{ backgroundColor: C.surface }, { paddingHorizontal: 14, paddingVertical: 12 }]}>
            <Text style={{ fontSize: 14, color: C.secondary, marginBottom: 10 }}>Payout Mode</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {/* Option: Keep in KPay */}
              <Pressable
                onPress={() => { haptic(); setPayoutMode('keep'); }}
                style={[
                  s.segOption,
                  payoutMode === 'keep'
                    ? { borderColor: C.label, backgroundColor: C.label }
                    : { borderColor: C.separator, backgroundColor: C.bg },
                ]}
              >
                <Text style={{
                  fontSize: 13, fontWeight: '600',
                  color: payoutMode === 'keep' ? C.bg : C.secondary,
                }}>
                  Keep in KPay
                </Text>
                <Text style={{
                  fontSize: 11, marginTop: 2,
                  color: payoutMode === 'keep' ? C.bg : C.secondary,
                  opacity: payoutMode === 'keep' ? 0.7 : 1,
                }}>
                  + 4% APY
                </Text>
              </Pressable>

              {/* Option: Auto-Transfer */}
              <Pressable
                onPress={() => { haptic(); setPayoutMode('auto'); }}
                style={[
                  s.segOption,
                  payoutMode === 'auto'
                    ? { borderColor: C.label, backgroundColor: C.label }
                    : { borderColor: C.separator, backgroundColor: C.bg },
                ]}
              >
                <Text style={{
                  fontSize: 13, fontWeight: '600',
                  color: payoutMode === 'auto' ? C.bg : C.secondary,
                }}>
                  Auto-Transfer
                </Text>
                <Text style={{
                  fontSize: 11, marginTop: 2,
                  color: payoutMode === 'auto' ? C.bg : C.secondary,
                  opacity: payoutMode === 'auto' ? 0.7 : 1,
                }}>
                  to bank account
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Row 2: Transfer Frequency (only when auto) */}
          {payoutMode === 'auto' && (
            <Pressable
              onPress={cyclePayoutFreq}
              style={[s.row, s.rowBorderTop, { backgroundColor: C.surface, borderTopColor: C.separator }]}
            >
              <IconSymbol name="tray.and.arrow.down.fill" size={18} color={C.secondary} />
              <Text style={{ flex: 1, fontSize: 15, color: C.label }}>Transfer Frequency</Text>
              <Text style={{ fontSize: 13, color: C.secondary }}>{freqLabel[payoutFreq]}</Text>
              <IconSymbol name="chevron.down" size={13} color={C.muted} />
            </Pressable>
          )}
        </GlassView>

        {/* TRANSACTION SECURITY */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>TRANSACTION SECURITY</Text>
        <GlassView tier={1} style={s.card}>
          {/* Row 1: Transaction PIN */}
          <View style={[s.row, { backgroundColor: C.surface }]}>
            <IconSymbol name="lock.fill" size={18} color={C.secondary} />
            <Text style={{ flex: 1, fontSize: 15, color: C.label }}>Transaction PIN</Text>
            <Toggle val={transactionPin} setVal={setTransactionPin} />
          </View>

          {/* Row 2: Require PIN above threshold (only if PIN enabled) */}
          {transactionPin && (
            <Pressable
              onPress={() => haptic()}
              style={[s.row, s.rowBorderTop, { backgroundColor: C.surface, borderTopColor: C.separator }]}
            >
              <IconSymbol name="lock.open.fill" size={18} color={C.secondary} />
              <Text style={{ flex: 1, fontSize: 15, color: C.label }}>Require PIN above</Text>
              <Text style={{ fontSize: 13, color: C.secondary }}>$500</Text>
              <IconSymbol name="chevron.right" size={13} color={C.muted} />
            </Pressable>
          )}
        </GlassView>

        {/* SAVED RECIPIENTS */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>SAVED RECIPIENTS</Text>
        <GlassView tier={1} style={s.card}>
          {/* Row 1: Marcus Johnson */}
          <View style={[s.row, { backgroundColor: C.surface }]}>
            <IconSymbol name="person.fill" size={18} color={C.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: C.label }}>Marcus Johnson</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>Atlanta, GA · Chase</Text>
            </View>
            <Text style={{ fontSize: 13, color: C.secondary }}>Edit</Text>
          </View>

          {/* Row 2: Aaliyah Brooks */}
          <View style={[s.row, s.rowBorderTop, { backgroundColor: C.surface, borderTopColor: C.separator }]}>
            <IconSymbol name="person.fill" size={18} color={C.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: C.label }}>Aaliyah Brooks</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>NYC · Wells Fargo</Text>
            </View>
            <Text style={{ fontSize: 13, color: C.secondary }}>Edit</Text>
          </View>

          {/* Row 3: Mom */}
          <View style={[s.row, s.rowBorderTop, { backgroundColor: C.surface, borderTopColor: C.separator }]}>
            <IconSymbol name="person.fill" size={18} color={C.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: C.label }}>Mom (Adaeze)</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>Lagos, NG · GTBank</Text>
            </View>
            <Text style={{ fontSize: 13, color: C.secondary }}>Edit</Text>
          </View>

          {/* Row 4: Add Recipient */}
          <Pressable
            onPress={() => haptic()}
            style={[s.row, s.rowBorderTop, { backgroundColor: C.surface, borderTopColor: C.separator }]}
          >
            <IconSymbol name="plus.circle" size={18} color={C.secondary} />
            <Text style={{ fontSize: 15, color: C.secondary }}>Add Recipient</Text>
          </Pressable>
        </GlassView>

        {/* TAX INFORMATION */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>TAX INFORMATION</Text>
        <GlassView tier={1} style={s.card}>
          {/* Row 1: SSN / Tax ID */}
          <Pressable
            onPress={() => haptic()}
            style={[s.row, { backgroundColor: C.surface }]}
          >
            <IconSymbol name="doc.text.fill" size={18} color={C.secondary} />
            <Text style={{ flex: 1, fontSize: 15, color: C.label }}>SSN / Tax ID</Text>
            <Text style={{ fontSize: 13, color: C.secondary }}>••••••4521</Text>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>

          {/* Row 2: Filing Status */}
          <Pressable
            onPress={() => haptic()}
            style={[s.row, s.rowBorderTop, { backgroundColor: C.surface, borderTopColor: C.separator }]}
          >
            <IconSymbol name="person.text.rectangle" size={18} color={C.secondary} />
            <Text style={{ flex: 1, fontSize: 15, color: C.label }}>Filing Status</Text>
            <Text style={{ fontSize: 13, color: C.secondary }}>Single</Text>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>

          {/* Row 3: Mailing Address */}
          <Pressable
            onPress={() => haptic()}
            style={[s.row, s.rowBorderTop, { backgroundColor: C.surface, borderTopColor: C.separator }]}
          >
            <IconSymbol name="mappin.fill" size={18} color={C.secondary} />
            <Text style={{ flex: 1, fontSize: 15, color: C.label }}>Mailing Address</Text>
            <Text style={{ fontSize: 13, color: C.secondary }}>Atlanta, GA</Text>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>
        </GlassView>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },

    topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    topBar: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 12, paddingBottom: 6, height: TOP_BAR_H,
    },
    topBarBtn: { width: 40, height: 32, alignItems: 'center', justifyContent: 'center' },
    pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    pillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

    sectionLabel: {
      fontSize: 11, fontWeight: '700', letterSpacing: 0.6,
      textTransform: 'uppercase', paddingHorizontal: 16,
      marginBottom: 6, marginTop: 24,
    },

    card:        { borderRadius: 12, overflow: 'hidden', marginHorizontal: 16 },
    row:         { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
    rowBorderTop: { borderTopWidth: StyleSheet.hairlineWidth },

    segOption: {
      flex: 1, borderRadius: 10, borderWidth: 1,
      paddingHorizontal: 12, paddingVertical: 10,
    },
  });
}
