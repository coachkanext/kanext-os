/**
 * Data & Export Settings — Data retention info, compliance/privacy actions,
 * full data export (CSV/JSON), and last export record.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { resetFooter } from '@/utils/global-footer-hide';

const TOP_BAR_H = 44;

export default function DataExportSettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const topBarH           = insets.top + TOP_BAR_H;
  const contentPaddingTop = topBarH + 8;
  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const [exporting, setExporting] = useState(false);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { height: topBarH, paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable onPress={() => { haptic(); router.back(); }} hitSlop={8} style={s.topBarBtn}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <View style={[s.pill, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[s.pillText, { color: C.label }]}>Data &amp; Export</Text>
        </View>
        <View style={s.topBarBtn} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Export All Data — standalone card */}
        <GlassView tier={1} style={[s.exportCard, { borderColor: C.separator }]}>
          <Text style={[s.exportTitle, { color: C.label }]}>Export Brand Data</Text>
          <Text style={[s.exportDesc, { color: C.secondary }]}>
            Download a complete export of all your brand data including members, content, messages, analytics, and transaction history.
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={() => haptic()}
              style={[s.exportBtn, { borderColor: C.separator, backgroundColor: C.surface }]}
            >
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <IconSymbol name="tablecells.fill" size={14} color={C.label} />
                <Text style={[s.exportBtnText, { color: C.label }]}>Export CSV</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => haptic()}
              style={[s.exportBtn, { borderColor: C.separator, backgroundColor: C.surface }]}
            >
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <IconSymbol name="curlybraces" size={14} color={C.label} />
                <Text style={[s.exportBtnText, { color: C.label }]}>Export JSON</Text>
              </View>
            </Pressable>
          </View>
        </GlassView>

        {/* DATA RETENTION */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>DATA RETENTION</Text>
        <GlassView tier={1} style={s.card}>
          <View style={[s.row, { backgroundColor: C.surface }]}>
            <IconSymbol name="calendar.fill" size={18} color={C.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={[s.rowLabel, { color: C.label }]}>Messages</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>Retained for 3 years</Text>
            </View>
          </View>
          <View style={[s.row, { backgroundColor: C.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
            <IconSymbol name="photo.fill" size={18} color={C.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={[s.rowLabel, { color: C.label }]}>Media &amp; Files</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>Retained for 2 years</Text>
            </View>
          </View>
          <View style={[s.row, { backgroundColor: C.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
            <IconSymbol name="doc.text.fill" size={18} color={C.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={[s.rowLabel, { color: C.label }]}>Analytics Data</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>Retained for 5 years</Text>
            </View>
          </View>
        </GlassView>

        {/* COMPLIANCE & PRIVACY */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>COMPLIANCE &amp; PRIVACY</Text>
        <GlassView tier={1} style={s.card}>
          <Pressable
            onPress={() => haptic()}
            style={[s.row, { backgroundColor: C.surface }]}
          >
            <IconSymbol name="shield.fill" size={18} color={C.secondary} />
            <Text style={[{ flex: 1, fontSize: 15, color: C.label }]}>GDPR Data Request</Text>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>
          <Pressable
            onPress={() => haptic()}
            style={[s.row, { backgroundColor: C.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
          >
            <IconSymbol name="trash.fill" size={18} color={C.secondary} />
            <Text style={[{ flex: 1, fontSize: 15, color: C.label }]}>Request Data Deletion</Text>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>
          <Pressable
            onPress={() => haptic()}
            style={[s.row, { backgroundColor: C.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
          >
            <IconSymbol name="eye.slash.fill" size={18} color={C.secondary} />
            <Text style={[{ flex: 1, fontSize: 15, color: C.label }]}>Opt Out of Analytics</Text>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>
        </GlassView>

        {/* LAST EXPORT */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>LAST EXPORT</Text>
        <GlassView tier={1} style={s.card}>
          <View style={[s.row, { backgroundColor: C.surface }]}>
            <IconSymbol name="clock.fill" size={18} color={C.secondary} />
            <Text style={[{ flex: 1, fontSize: 14, color: C.secondary }]}>
              Mar 12, 2024 at 3:15 PM — CSV, 2.4 MB
            </Text>
            <Pressable onPress={() => haptic()}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Download</Text>
            </Pressable>
          </View>
        </GlassView>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBar: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
      flexDirection: 'row', alignItems: 'flex-end',
      paddingHorizontal: 12, paddingBottom: 6,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBarBtn: { width: 40, height: 32, alignItems: 'center', justifyContent: 'center' },
    pill:      { flex: 1, alignItems: 'center', justifyContent: 'center', height: 32, borderRadius: 16, borderWidth: 1, marginHorizontal: 10 },
    pillText:  { fontSize: 14, fontWeight: '700' },

    exportCard: {
      borderRadius: 12,
      marginHorizontal: 16,
      marginTop: 16,
      padding: 20,
      borderWidth: StyleSheet.hairlineWidth,
    },
    exportTitle: {
      fontSize: 17,
      fontWeight: '800',
      marginBottom: 8,
    },
    exportDesc: {
      fontSize: 13,
      lineHeight: 19,
      marginBottom: 16,
    },
    exportBtn: {
      flex: 1,
      height: 44,
      borderRadius: 10,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    exportBtnText: {
      fontSize: 14,
      fontWeight: '600',
    },

    sectionLabel: {
      fontSize: 11, fontWeight: '700', letterSpacing: 0.6,
      textTransform: 'uppercase',
      paddingHorizontal: 16, marginBottom: 6, marginTop: 24,
    },
    card:     { borderRadius: 12, overflow: 'hidden', marginHorizontal: 16 },
    row:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
    rowLabel: { flex: 1, fontSize: 15 },
  });
}
