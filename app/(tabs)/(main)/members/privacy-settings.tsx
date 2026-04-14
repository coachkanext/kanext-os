/**
 * Members — Privacy Settings (Pastor only).
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Switch, Alert, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;

export default function PrivacySettingsScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('community:members');
  const isPastor = role === roleCycles[0];

  const [showDirectory,    setShowDirectory]    = useState(true);
  const [allowMessaging,   setAllowMessaging]   = useState(true);
  const [showAttendance,   setShowAttendance]   = useState(false);
  const [showGiving,       setShowGiving]       = useState(false);

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) {
      router.replace('/(tabs)/(main)/members' as any);
    }
  }, [isPastor, router]));

  if (!isPastor) return null;

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <View style={s.topBarSide}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
              <KMenuButton />
            </Pressable>
          </View>
          <Text style={[s.topBarTitle, { color: C.label }]}>Privacy Settings</Text>
          <View style={[s.topBarSide, { alignItems: 'flex-end' }]}>
            <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={isPastor} />
          </View>
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Switch rows */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {[
            { label: 'Show Member Directory to All Members', value: showDirectory,  setter: setShowDirectory  },
            { label: 'Allow Members to Message Each Other',  value: allowMessaging, setter: setAllowMessaging },
            { label: 'Show Attendance to Member',            value: showAttendance, setter: setShowAttendance },
            { label: 'Show Giving to Member',                value: showGiving,     setter: setShowGiving     },
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
                onValueChange={() => { Haptics.selectionAsync(); item.setter(!item.value); }}
                trackColor={{ false: C.separator, true: C.label }}
                thumbColor={C.bg}
              />
            </View>
          ))}
        </View>

        {/* Chevron rows */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {[
            { label: 'Data Retention Policy',  detail: '7 years' },
            { label: 'GDPR/CCPA Export',        detail: 'On request' },
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
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:      { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
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
