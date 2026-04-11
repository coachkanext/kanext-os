/**
 * Members — Attendance Policies (Pastor only).
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Switch, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;

export default function AttendancePoliciesScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('community:members');
  const isPastor = role === roleCycles[0];

  const [trackAttendance,   setTrackAttendance]   = useState(true);
  const [autoAtRisk,        setAutoAtRisk]         = useState(true);
  const [visitorAutoFlag,   setVisitorAutoFlag]    = useState(true);
  const [sendReminders,     setSendReminders]      = useState(false);

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) {
      router.replace('/(tabs)/(main)/members' as any);
    }
  }, [isPastor, router]));

  const topBarH = insets.top + TOP_BAR_H;

  if (!isPastor) return null;

  const toggleSwitch = (label: string, value: boolean, setter: (v: boolean) => void) => {
    Haptics.selectionAsync();
    setter(!value);
  };

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topBarH + 20, paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Switch rows */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {[
            { label: 'Track Attendance',             value: trackAttendance,   setter: setTrackAttendance   },
            { label: 'Auto At-Risk After 30 Days',   value: autoAtRisk,        setter: setAutoAtRisk         },
            { label: 'Visitor Auto-Flagging',        value: visitorAutoFlag,   setter: setVisitorAutoFlag    },
            { label: 'Send Reminder Notifications',  value: sendReminders,     setter: setSendReminders      },
          ].map((item, idx) => (
            <View
              key={item.label}
              style={[
                s.switchRow,
                idx < 3 && [s.rowBorder, { borderBottomColor: C.separator }],
              ]}
            >
              <Text style={[s.switchLabel, { color: C.label }]}>{item.label}</Text>
              <Switch
                value={item.value}
                onValueChange={() => toggleSwitch(item.label, item.value, item.setter)}
                trackColor={{ false: C.separator, true: C.label }}
                thumbColor={C.bg}
              />
            </View>
          ))}
        </View>

        {/* Chevron rows */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {[
            { label: 'At-Risk Threshold',     detail: '30 days' },
            { label: 'Absence Notification',  detail: 'After 3 absences' },
          ].map((item, idx) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                s.chevronRow,
                pressed && { backgroundColor: C.bg },
                idx === 0 && [s.rowBorder, { borderBottomColor: C.separator }],
              ]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert(item.label, `Current setting: ${item.detail}`, [{ text: 'Edit' }, { text: 'Close', style: 'cancel' }]); }}
            >
              <Text style={[s.switchLabel, { color: C.label }]}>{item.label}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[s.detailText, { color: C.secondary }]}>{item.detail}</Text>
                <IconSymbol name="chevron.right" size={14} color={C.secondary} />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Top bar */}
      <View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={s.topBar}>
          <View style={s.topBarSide}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
              <KMenuButton />
            </Pressable>
          </View>
          <Text style={[s.topBarTitle, { color: C.label }]}>Attendance Policies</Text>
          <View style={[s.topBarSide, { alignItems: 'flex-end' }]}>
            <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={isPastor} />
          </View>
        </View>
      </View>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:      { flex: 1 },
  topBarWrap:  { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar:      { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:  { width: 80, justifyContent: 'center' },
  topBarTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },

  card:       { borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  switchRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  chevronRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder:  { borderBottomWidth: StyleSheet.hairlineWidth },

  switchLabel: { flex: 1, fontSize: 15 },
  detailText:  { fontSize: 14 },
});
