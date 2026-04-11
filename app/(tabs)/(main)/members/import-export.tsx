/**
 * Members — Import/Export (Pastor only).
 */

import React, { useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert,
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

export default function ImportExportScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('community:members');
  const isPastor = role === roleCycles[0];

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) {
      router.replace('/(tabs)/(main)/members' as any);
    }
  }, [isPastor, router]));

  const topBarH = insets.top + TOP_BAR_H;

  if (!isPastor) return null;

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topBarH + 20, paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Import Card */}
        <View style={[s.actionCard, { backgroundColor: C.surface }]}>
          <View style={s.cardHeader}>
            <IconSymbol name="square.and.arrow.down" size={22} color={C.label} />
            <View style={{ flex: 1 }}>
              <Text style={[s.cardTitle, { color: C.label }]}>Import Members</Text>
              <Text style={[s.cardDesc, { color: C.secondary }]}>Upload a CSV file to add or update member records in bulk. Supports standard church management CSV format.</Text>
            </View>
          </View>
          <Pressable
            style={[s.btn, { backgroundColor: C.label }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Import Members', 'Select a CSV file from your device to import member records.', [{ text: 'Cancel' }, { text: 'Choose File' }]); }}
          >
            <Text style={[s.btnText, { color: C.bg }]}>Import from CSV</Text>
          </Pressable>
        </View>

        {/* Export Card */}
        <View style={[s.actionCard, { backgroundColor: C.surface }]}>
          <View style={s.cardHeader}>
            <IconSymbol name="square.and.arrow.up" size={22} color={C.label} />
            <View style={{ flex: 1 }}>
              <Text style={[s.cardTitle, { color: C.label }]}>Export Members</Text>
              <Text style={[s.cardDesc, { color: C.secondary }]}>Download your member directory in your preferred format.</Text>
            </View>
          </View>
          {/* Format selector */}
          <Text style={[s.formatLabel, { color: C.secondary }]}>Export Format</Text>
          {(['CSV', 'PDF', 'Excel'] as const).map(fmt => (
            <View key={fmt} style={[s.formatRow, { borderBottomColor: C.separator }]}>
              <View style={[s.radioOuter, { borderColor: C.secondary }]}>
                {fmt === 'CSV' && <View style={[s.radioInner, { backgroundColor: C.label }]} />}
              </View>
              <Text style={[s.formatText, { color: C.label }]}>{fmt}</Text>
            </View>
          ))}
          <Pressable
            style={[s.btn, { backgroundColor: C.label, marginTop: 12 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Export Members', '247 member records will be exported as CSV.', [{ text: 'Cancel' }, { text: 'Export' }]); }}
          >
            <Text style={[s.btnText, { color: C.bg }]}>Export</Text>
          </Pressable>
        </View>

        {/* Last import info */}
        <View style={[s.infoCard, { backgroundColor: C.surface }]}>
          <Text style={[s.infoTitle, { color: C.secondary }]}>Last Import</Text>
          <Text style={[s.infoValue, { color: C.label }]}>Mar 15, 2026</Text>
          <Text style={[s.infoSub, { color: C.secondary }]}>12 records imported · 2 updated · 0 errors</Text>
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
          <Text style={[s.topBarTitle, { color: C.label }]}>Import/Export</Text>
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

  actionCard: { borderRadius: 16, padding: 16, marginBottom: 16, gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardTitle:  { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardDesc:   { fontSize: 13, lineHeight: 18 },

  formatLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  formatRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth },
  radioOuter:  { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner:  { width: 10, height: 10, borderRadius: 5 },
  formatText:  { fontSize: 14 },

  btn:     { borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  btnText: { fontSize: 15, fontWeight: '700' },

  infoCard:  { borderRadius: 14, padding: 16, gap: 4 },
  infoTitle: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  infoSub:   { fontSize: 13 },
});
