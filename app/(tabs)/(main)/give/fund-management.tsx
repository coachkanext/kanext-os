/**
 * Fund Management — Pastor only (MANAGE section).
 * Redirects Member to give/index in useFocusEffect.
 * Lists 6 funds with balance and restricted badge. Tap → Alert.
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { KMenuButton } from '@/components/ui/k-menu-button';

const GAIN = '#5A8A6E';
const TOP_BAR_H = 52;

const FUNDS = [
  { name: 'General / Tithe', balance: 48200,  restricted: false },
  { name: 'Building Fund',   balance: 68000,  restricted: true  },
  { name: 'Missions',        balance: 41300,  restricted: true  },
  { name: 'Benevolence',     balance: 8750,   restricted: true  },
  { name: 'Youth',           balance: 4200,   restricted: false },
  { name: 'Worship',         balance: 3100,   restricted: false },
];

export default function FundManagementScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('community:give');
  const isPastor = role === roleCycles[0];

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) {
      router.replace('/(tabs)/(main)/give' as any);
    }
  }, [isPastor]));

  function showFundDetail(fund: typeof FUNDS[0]) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      fund.name,
      `Balance: $${fund.balance.toLocaleString()}\nType: ${fund.restricted ? 'Restricted' : 'Unrestricted'}\n\nRestricted funds may only be used for their designated purpose.`,
      [{ text: 'Close', style: 'cancel' }],
    );
  }

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable style={s.kBtn} onPress={() => openSidePanel()} hitSlop={8}>
          <KMenuButton />
        </Pressable>
        <Text style={[s.topTitle, { color: C.label }]}>Fund Management</Text>
        <View style={s.rolePillWrap}>
          <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 8, paddingHorizontal: 16, paddingBottom: insets.bottom + 80, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[s.listCard, { backgroundColor: C.surface }]}>
          {FUNDS.map((fund, i) => (
            <Pressable
              key={fund.name}
              style={({ pressed }) => [
                s.fundRow,
                pressed && { backgroundColor: C.bg },
                i < FUNDS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
              onPress={() => showFundDetail(fund)}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <View style={s.nameRow}>
                  <Text style={[s.fundName, { color: C.label }]}>{fund.name}</Text>
                  {fund.restricted && (
                    <View style={[s.lockBadge, { borderColor: C.separator }]}>
                      <IconSymbol name="lock.fill" size={10} color={C.secondary} />
                      <Text style={[s.lockText, { color: C.secondary }]}>Restricted</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={[s.fundBalance, { color: GAIN }]}>${fund.balance.toLocaleString()}</Text>
              <IconSymbol name="chevron.right" size={12} color={C.secondary} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:    { flex: 1 },
    topBar: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
      flexDirection: 'row', alignItems: 'flex-end',
      paddingBottom: 10, paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    kBtn:         { width: 44, height: 36, justifyContent: 'center' },
    topTitle:     { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', paddingBottom: 2 },
    rolePillWrap: { width: 44 + 32, alignItems: 'flex-end', justifyContent: 'center' },

    listCard:   { borderRadius: 12, overflow: 'hidden' },
    fundRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
    nameRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
    fundName:   { fontSize: 15, fontWeight: '600' },
    fundBalance:{ fontSize: 16, fontWeight: '700', marginRight: 4 },
    lockBadge:  { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 6, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
    lockText:   { fontSize: 10 },
  });
}
