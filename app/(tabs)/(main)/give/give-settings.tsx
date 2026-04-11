/**
 * Give Settings — Pastor only (MANAGE section).
 * Redirects Member to give/index in useFocusEffect.
 * Switch rows and chevron nav rows.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch, Alert } from 'react-native';
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

const TOP_BAR_H = 52;

export default function GiveSettingsScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('community:give');
  const isPastor = role === roleCycles[0];

  const [recurringEnabled, setRecurringEnabled]   = useState(true);
  const [anonymousEnabled, setAnonymousEnabled]   = useState(true);
  const [coverFeesEnabled, setCoverFeesEnabled]   = useState(true);

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) {
      router.replace('/(tabs)/(main)/give' as any);
    }
  }, [isPastor]));

  function handleChevronRow(label: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(label, `${label} settings coming soon.`, [{ text: 'OK' }]);
  }

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable style={s.kBtn} onPress={() => openSidePanel()} hitSlop={8}>
          <KMenuButton />
        </Pressable>
        <Text style={[s.topTitle, { color: C.label }]}>Settings</Text>
        <View style={s.rolePillWrap}>
          <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 8, paddingHorizontal: 16, paddingBottom: insets.bottom + 80, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Switch rows */}
        <View style={[s.listCard, { backgroundColor: C.surface }]}>
          <View style={[s.switchRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.rowLabel, { color: C.label }]}>Recurring Giving</Text>
              <Text style={[s.rowSub, { color: C.secondary }]}>Allow members to set up recurring gifts</Text>
            </View>
            <Switch
              value={recurringEnabled}
              onValueChange={v => { Haptics.selectionAsync(); setRecurringEnabled(v); }}
              trackColor={{ true: C.label, false: C.separator }}
              thumbColor={C.bg}
            />
          </View>
          <View style={[s.switchRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.rowLabel, { color: C.label }]}>Anonymous Giving</Text>
              <Text style={[s.rowSub, { color: C.secondary }]}>Members can give anonymously</Text>
            </View>
            <Switch
              value={anonymousEnabled}
              onValueChange={v => { Haptics.selectionAsync(); setAnonymousEnabled(v); }}
              trackColor={{ true: C.label, false: C.separator }}
              thumbColor={C.bg}
            />
          </View>
          <View style={s.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={[s.rowLabel, { color: C.label }]}>Cover Fees Option</Text>
              <Text style={[s.rowSub, { color: C.secondary }]}>Allow members to cover processing fees</Text>
            </View>
            <Switch
              value={coverFeesEnabled}
              onValueChange={v => { Haptics.selectionAsync(); setCoverFeesEnabled(v); }}
              trackColor={{ true: C.label, false: C.separator }}
              thumbColor={C.bg}
            />
          </View>
        </View>

        {/* Chevron rows */}
        <View style={[s.listCard, { backgroundColor: C.surface }]}>
          {[
            'Default Fund',
            'Fiscal Year',
            'Payment Methods',
            'Notification Settings',
          ].map((label, i, arr) => (
            <Pressable
              key={label}
              style={({ pressed }) => [
                s.chevronRow,
                pressed && { backgroundColor: C.bg },
                i < arr.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
              onPress={() => handleChevronRow(label)}
            >
              <Text style={[s.rowLabel, { color: C.label }]}>{label}</Text>
              <IconSymbol name="chevron.right" size={14} color={C.secondary} />
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
    switchRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
    chevronRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 },
    rowLabel:   { fontSize: 15, fontWeight: '500' },
    rowSub:     { fontSize: 12, marginTop: 1 },
  });
}
