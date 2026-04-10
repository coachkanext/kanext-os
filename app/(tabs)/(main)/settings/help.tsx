/**
 * Help & Support Settings — Links to help resources and support channels.
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
const GAIN = '#5A8A6E';

type SupportItem = { icon: string; label: string; note: string | null };

const SUPPORT_ITEMS: SupportItem[] = [
  { icon: 'book.fill',       label: 'Help Center',      note: null           },
  { icon: 'message.fill',    label: 'Contact Support',  note: 'Via Messages' },
  { icon: 'ant.fill',        label: 'Report a Bug',     note: null           },
  { icon: 'lightbulb.fill',  label: 'Feature Request',  note: null           },
  { icon: 'person.3.fill',   label: 'Community Forum',  note: null           },
];

export default function HelpSupportSettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const topBarH           = insets.top + TOP_BAR_H;
  const contentPaddingTop = topBarH + 8;
  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { height: topBarH, paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable onPress={() => { haptic(); router.back(); }} hitSlop={8} style={s.topBarBtn}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <View style={[s.pill, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[s.pillText, { color: C.label }]}>Help & Support</Text>
        </View>
        <View style={s.topBarBtn} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={[s.searchBar, { backgroundColor: C.surface, borderColor: C.separator, marginTop: 16 }]}>
          <IconSymbol name="magnifyingglass" size={15} color={C.secondary} />
          <Text style={[s.searchPlaceholder, { color: C.muted }]}>Search help articles…</Text>
        </View>

        {/* SUPPORT */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>SUPPORT</Text>
        <GlassView tier={1} style={s.card}>
          {SUPPORT_ITEMS.map((item, idx) => (
            <Pressable
              key={item.label}
              onPress={() => haptic()}
              style={[
                s.row,
                { backgroundColor: C.surface },
                idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
              ]}
            >
              <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
              <View style={{ flex: 1 }}>
                <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
                {item.note !== null && (
                  <Text style={[s.rowNote, { color: C.secondary }]}>{item.note}</Text>
                )}
              </View>
              <IconSymbol name="chevron.right" size={13} color={C.muted} />
            </Pressable>
          ))}
        </GlassView>

        {/* RESPONSE TIME */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>RESPONSE TIME</Text>
        <GlassView tier={1} style={s.card}>
          <View style={[s.row, { backgroundColor: C.surface }]}>
            <IconSymbol name="clock.fill" size={18} color={GAIN} />
            <Text style={[s.rowLabel, { color: C.label }]}>Average response time: ~2 hours</Text>
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
    topBarBtn:         { width: 40, height: 32, alignItems: 'center', justifyContent: 'center' },
    pill:              { flex: 1, alignItems: 'center', justifyContent: 'center', height: 32, borderRadius: 16, borderWidth: 1, marginHorizontal: 10 },
    pillText:          { fontSize: 14, fontWeight: '700' },
    searchBar:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, paddingHorizontal: 12, height: 40, borderRadius: 10, borderWidth: 1 },
    searchPlaceholder: { fontSize: 14 },
    sectionLabel:      { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 6, marginTop: 24 },
    card:              { borderRadius: 12, overflow: 'hidden', marginHorizontal: 16 },
    row:               { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
    rowLabel:          { fontSize: 15 },
    rowNote:           { fontSize: 12, marginTop: 1 },
  });
}
