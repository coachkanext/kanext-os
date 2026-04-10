/**
 * About Settings — App version, legal links, and build info.
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
const APP_VERSION = '2.4.1';
const BUILD_NUMBER = '14';

type LegalItem = { icon: string; label: string };
type BuildItem = { label: string; value: string };

const LEGAL_ITEMS: LegalItem[] = [
  { icon: 'doc.text.fill',    label: 'Terms of Service'       },
  { icon: 'hand.raised.fill', label: 'Privacy Policy'         },
  { icon: 'curlybraces',      label: 'Open Source Licenses'   },
  { icon: 'globe',            label: 'KaNeXT Website'         },
];

const BUILD_ITEMS: BuildItem[] = [
  { label: 'Version',     value: APP_VERSION       },
  { label: 'Build',       value: BUILD_NUMBER       },
  { label: 'Platform',    value: 'iOS 17.4'         },
  { label: 'Device',      value: 'iPhone 16 Pro'    },
  { label: 'Environment', value: 'Production'       },
];

export default function AboutSettingsScreen() {
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
          <Text style={[s.pillText, { color: C.label }]}>About</Text>
        </View>
        <View style={s.topBarBtn} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* App Branding Block */}
        <View style={[s.brandBlock, { marginTop: 32 }]}>
          <View style={[s.appIcon, { backgroundColor: C.label }]}>
            <Text style={[s.appIconText, { color: C.bg }]}>KN</Text>
          </View>
          <Text style={[s.appName, { color: C.label }]}>KaNeXT</Text>
          <Text style={[s.appVersion, { color: C.secondary }]}>
            v{APP_VERSION} (Build {BUILD_NUMBER})
          </Text>
        </View>

        {/* LEGAL */}
        <Text style={[s.sectionLabel, { color: C.secondary, marginTop: 32 }]}>LEGAL</Text>
        <GlassView tier={1} style={s.card}>
          {LEGAL_ITEMS.map((item, idx) => (
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
              <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
              <IconSymbol name="arrow.up.right.square" size={13} color={C.muted} />
            </Pressable>
          ))}
        </GlassView>

        {/* BUILD INFO */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>BUILD INFO</Text>
        <GlassView tier={1} style={s.card}>
          {BUILD_ITEMS.map((item, idx) => (
            <View
              key={item.label}
              style={[
                s.row,
                { backgroundColor: C.surface },
                idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
              ]}
            >
              <Text style={[s.buildLabel, { color: C.secondary }]}>{item.label}</Text>
              <Text style={[s.buildValue, { color: C.label }]}>{item.value}</Text>
            </View>
          ))}
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
    topBarBtn:    { width: 40, height: 32, alignItems: 'center', justifyContent: 'center' },
    pill:         { flex: 1, alignItems: 'center', justifyContent: 'center', height: 32, borderRadius: 16, borderWidth: 1, marginHorizontal: 10 },
    pillText:     { fontSize: 14, fontWeight: '700' },
    brandBlock:   { alignItems: 'center' },
    appIcon:      { width: 72, height: 72, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    appIconText:  { fontSize: 24, fontWeight: '800' },
    appName:      { fontSize: 20, fontWeight: '800', marginTop: 12 },
    appVersion:   { fontSize: 13, marginTop: 4 },
    sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 6, marginTop: 24 },
    card:         { borderRadius: 12, overflow: 'hidden', marginHorizontal: 16 },
    row:          { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
    rowLabel:     { flex: 1, fontSize: 15 },
    buildLabel:   { flex: 1, fontSize: 14 },
    buildValue:   { fontSize: 14 },
  });
}
