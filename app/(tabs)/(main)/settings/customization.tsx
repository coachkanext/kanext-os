/**
 * Customization Settings — Brand colors, Profile URL, theme preview.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { resetFooter } from '@/utils/global-footer-hide';

const TOP_BAR_H = 44;

export default function CustomizationSettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const topBarH           = insets.top + TOP_BAR_H;
  const contentPaddingTop = topBarH + 8;
  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const [primaryColor,   setPrimaryColor]   = useState('#1A1714');
  const [secondaryColor, setSecondaryColor] = useState('#9C9790');
  const [customDomain,   setCustomDomain]   = useState('');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { height: topBarH, paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable onPress={() => { haptic(); router.back(); }} hitSlop={8} style={s.topBarBtn}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <View style={[s.pill, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[s.pillText, { color: C.label }]}>Customization</Text>
        </View>
        <View style={s.topBarBtn} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* BRAND COLORS */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>BRAND COLORS</Text>
        <Text style={[s.infoText, { color: C.secondary }]}>
          These colors apply to accents throughout your brand's screens for members.
        </Text>

        <GlassView tier={1} style={s.card}>
          {/* Primary Color */}
          <Pressable
            onPress={() => haptic()}
            style={[s.row, { backgroundColor: C.surface }]}
          >
            <View style={[s.colorSwatch, { backgroundColor: primaryColor, borderColor: C.separator }]} />
            <Text style={[s.rowLabel, { color: C.label }]}>Primary Color</Text>
            <Text style={[s.previewText, { color: C.secondary }]}>#1A1714</Text>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>

          {/* Secondary Color */}
          <Pressable
            onPress={() => haptic()}
            style={[s.row, { backgroundColor: C.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
          >
            <View style={[s.colorSwatch, { backgroundColor: secondaryColor, borderColor: C.separator }]} />
            <Text style={[s.rowLabel, { color: C.label }]}>Secondary Color</Text>
            <Text style={[s.previewText, { color: C.secondary }]}>#9C9790</Text>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>

          {/* Reset to Defaults */}
          <Pressable
            onPress={() => {
              haptic();
              setPrimaryColor('#1A1714');
              setSecondaryColor('#9C9790');
            }}
            style={[s.row, { backgroundColor: C.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
          >
            <IconSymbol name="arrow.counterclockwise" size={18} color={C.secondary} />
            <Text style={[s.rowLabel, { color: C.label }]}>Reset to Defaults</Text>
          </Pressable>
        </GlassView>

        {/* MY PAGE */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>MY PAGE</Text>
        <Text style={[s.infoText, { color: C.secondary }]}>
          Customize the URL for your public-facing Profile.
        </Text>

        <GlassView tier={1} style={s.card}>
          {/* Custom Domain input */}
          <View style={{ paddingHorizontal: 14, paddingVertical: 14, backgroundColor: C.surface }}>
            <Text style={{ fontSize: 14, color: C.secondary, marginBottom: 8 }}>Custom Domain</Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 0,
              backgroundColor: C.bg,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: C.separator,
              overflow: 'hidden',
            }}>
              <View style={{
                paddingHorizontal: 10,
                paddingVertical: 10,
                backgroundColor: C.surface,
                borderRightWidth: 1,
                borderRightColor: C.separator,
              }}>
                <Text style={{ fontSize: 14, color: C.secondary }}>kanext.io/</Text>
              </View>
              <TextInput
                style={{ flex: 1, paddingHorizontal: 10, paddingVertical: 10, fontSize: 14, color: C.label }}
                value={customDomain}
                onChangeText={setCustomDomain}
                placeholder="yourname"
                placeholderTextColor={C.muted}
                autoCapitalize="none"
              />
            </View>
            <Text style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>
              Your Profile will be at kanext.io/yourname
            </Text>
          </View>

          {/* Preview link */}
          <Pressable
            onPress={() => haptic()}
            style={[s.row, { backgroundColor: C.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
          >
            <IconSymbol name="globe" size={18} color={C.secondary} />
            <Text style={[s.rowLabel, { color: C.label }]}>Preview Profile</Text>
            <IconSymbol name="arrow.up.right.square" size={13} color={C.muted} />
          </Pressable>
        </GlassView>

        {/* THEME PREVIEW */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>THEME PREVIEW</Text>
        <GlassView tier={1} style={s.card}>
          <View style={{ paddingHorizontal: 14, paddingVertical: 16, backgroundColor: C.surface }}>
            <Text style={{ fontSize: 13, color: C.secondary, textAlign: 'center' }}>
              Theme preview will appear here after you save your colors.
            </Text>
          </View>
        </GlassView>

        {/* Save Button */}
        <Pressable
          onPress={() => haptic()}
          style={{
            marginHorizontal: 16,
            marginTop: 24,
            height: 48,
            borderRadius: 12,
            backgroundColor: C.label,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.bg }}>Save Customization</Text>
        </Pressable>
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

    sectionLabel: {
      fontSize: 11, fontWeight: '700', letterSpacing: 0.6,
      textTransform: 'uppercase',
      paddingHorizontal: 16, marginBottom: 6, marginTop: 24,
    },
    infoText: {
      fontSize: 13,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    card:        { borderRadius: 12, overflow: 'hidden', marginHorizontal: 16 },
    row:         { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
    rowLabel:    { flex: 1, fontSize: 15 },
    previewText: { fontSize: 13 },
    colorSwatch: { width: 28, height: 28, borderRadius: 8, borderWidth: 1 },
  });
}
