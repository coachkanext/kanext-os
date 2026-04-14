/**
 * Appearance Settings — Color scheme, text size, and accessibility preferences.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { resetFooter } from '@/utils/global-footer-hide';

const TOP_BAR_H = 44;

export default function AppearanceSettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [darkMode,      setDarkMode]      = useState<'off' | 'on' | 'system'>('off');
  const [oledBlack,     setOledBlack]     = useState(false);
  const [textSize,      setTextSize]      = useState<'small' | 'medium' | 'large' | 'xl'>('medium');
  const [reduceMotion,  setReduceMotion]  = useState(false);
  const [highContrast,  setHighContrast]  = useState(false);

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

  const previewFontSize: Record<typeof textSize, number> = {
    small:  13,
    medium: 15,
    large:  17,
    xl:     19,
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
              <Text style={[s.pillText, { color: C.label }]}>Appearance</Text>
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
        {/* COLOR SCHEME */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>COLOR SCHEME</Text>
        <GlassView tier={1} style={s.card}>
          {/* Row 1: Dark Mode 3-segment */}
          <View style={[{ backgroundColor: C.surface }, { paddingHorizontal: 14, paddingVertical: 14 }]}>
            <Text style={{ fontSize: 15, color: C.label, marginBottom: 10 }}>Dark Mode</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['off', 'on', 'system'] as const).map((mode) => {
                const labels: Record<typeof mode, string> = { off: 'Light', on: 'Dark', system: 'System' };
                const active = darkMode === mode;
                return (
                  <Pressable
                    key={mode}
                    onPress={() => { haptic(); setDarkMode(mode); }}
                    style={[
                      s.segOption,
                      active
                        ? { backgroundColor: C.label, borderColor: C.label }
                        : { backgroundColor: C.bg, borderColor: C.separator },
                    ]}
                  >
                    <Text style={{
                      fontSize: 13, fontWeight: active ? '700' : '400',
                      color: active ? C.bg : C.secondary,
                    }}>
                      {labels[mode]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Row 2: OLED Black (only when dark mode is on or system) */}
          {darkMode !== 'off' && (
            <View style={[s.row, s.rowBorderTop, { backgroundColor: C.surface, borderTopColor: C.separator }]}>
              <IconSymbol name="moon.fill" size={18} color={C.secondary} />
              <Text style={{ flex: 1, fontSize: 15, color: C.label }}>True Black (OLED)</Text>
              <Toggle val={oledBlack} setVal={setOledBlack} />
            </View>
          )}
        </GlassView>

        {/* TEXT SIZE */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>TEXT SIZE</Text>
        <GlassView tier={1} style={s.card}>
          <View style={[{ backgroundColor: C.surface }, { paddingHorizontal: 14, paddingVertical: 16 }]}>
            <Text style={{ fontSize: 15, color: C.label, marginBottom: 12 }}>Text Size</Text>

            {/* Live preview */}
            <Text style={{
              fontSize: previewFontSize[textSize],
              color: C.label,
              textAlign: 'center',
              marginBottom: 14,
            }}>
              The quick brown fox
            </Text>

            {/* 4-segment selector */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['small', 'medium', 'large', 'xl'] as const).map((size) => {
                const labels: Record<typeof size, string> = {
                  small: 'Small', medium: 'Medium', large: 'Large', xl: 'XL',
                };
                const active = textSize === size;
                return (
                  <Pressable
                    key={size}
                    onPress={() => { haptic(); setTextSize(size); }}
                    style={[
                      s.segOptionSm,
                      active
                        ? { backgroundColor: C.label, borderColor: C.label }
                        : { backgroundColor: C.bg, borderColor: C.separator },
                    ]}
                  >
                    <Text style={{
                      fontSize: 12, fontWeight: active ? '700' : '400',
                      color: active ? C.bg : C.secondary,
                    }}>
                      {labels[size]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </GlassView>

        {/* ACCESSIBILITY */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>ACCESSIBILITY</Text>
        <GlassView tier={1} style={s.card}>
          {/* Row 1: Reduce Motion */}
          <View style={[s.row, { backgroundColor: C.surface }]}>
            <IconSymbol name="figure.walk" size={18} color={C.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: C.label }}>Reduce Motion</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>Limits animations</Text>
            </View>
            <Toggle val={reduceMotion} setVal={setReduceMotion} />
          </View>

          {/* Row 2: High Contrast */}
          <View style={[s.row, s.rowBorderTop, { backgroundColor: C.surface, borderTopColor: C.separator }]}>
            <IconSymbol name="circle.lefthalf.filled" size={18} color={C.secondary} />
            <Text style={{ flex: 1, fontSize: 15, color: C.label }}>High Contrast</Text>
            <Toggle val={highContrast} setVal={setHighContrast} />
          </View>
        </GlassView>

        {/* Save Button */}
        <Pressable
          onPress={() => haptic()}
          style={[s.saveBtn, { backgroundColor: C.label, marginTop: 24 }]}
        >
          <Text style={[s.saveBtnText, { color: C.bg }]}>Save Preferences</Text>
        </Pressable>
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

    card:         { borderRadius: 12, overflow: 'hidden', marginHorizontal: 16 },
    row:          { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
    rowBorderTop: { borderTopWidth: StyleSheet.hairlineWidth },

    segOption: {
      flex: 1, height: 36, borderRadius: 8, borderWidth: 1,
      alignItems: 'center', justifyContent: 'center',
    },
    segOptionSm: {
      flex: 1, height: 32, borderRadius: 8, borderWidth: 1,
      alignItems: 'center', justifyContent: 'center',
    },

    saveBtn: {
      marginHorizontal: 16, height: 48, borderRadius: 12,
      alignItems: 'center', justifyContent: 'center',
    },
    saveBtnText: { fontSize: 16, fontWeight: '700' },
  });
}
