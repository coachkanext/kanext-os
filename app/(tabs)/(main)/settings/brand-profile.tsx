/**
 * Brand Profile — Settings detail screen.
 * Owner can edit description and contact fields; brand name is locked.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, TextInput, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { resetFooter } from '@/utils/global-footer-hide';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 44;

export default function BrandProfileSettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [brandName]     = useState('Laolu Kalejaiye');
  const [description, setDescription] = useState('Sports content creator, coach, and athlete. Personal brand in Personal mode.');
  const [contactEmail, setContactEmail] = useState('sammy@kanext.io');
  const [contactPhone, setContactPhone] = useState('+1 (404) 555-0192');
  const [website,      setWebsite]      = useState('sammykalejaiye.com');
  const [address,      setAddress]      = useState('Atlanta, GA 30301');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { haptic(); router.back(); }} hitSlop={8} style={s.topBarBtn}>
            <IconSymbol name="chevron.left" size={20} color={C.label} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.pill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.pillText, { color: C.label }]}>Brand Profile</Text>
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
        keyboardShouldPersistTaps="handled"
      >
        {/* ── BRAND IDENTITY ─────────────────────────────────────────────── */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>BRAND IDENTITY</Text>
        <GlassView tier={1} style={s.card}>

          {/* Logo row */}
          <Pressable
            onPress={() => haptic()}
            style={({ pressed }) => [s.logoRow, { backgroundColor: pressed ? C.bg : C.surface }]}
          >
            <View style={[s.initialsCircle, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.initialsText, { color: C.label }]}>SK</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 15, color: C.label }}>Brand Logo</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>Tap to change</Text>
            </View>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>

          {/* Brand name — locked */}
          <View style={[s.row, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
            <IconSymbol name="building.2.fill" size={18} color={C.secondary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 12, color: C.secondary }}>Brand Name</Text>
              <Text style={{ fontSize: 15, color: C.label, marginTop: 2 }}>{brandName}</Text>
            </View>
            <IconSymbol name="lock.fill" size={14} color={C.muted} />
          </View>

          {/* Description field */}
          <View style={[s.descriptionRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
            <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 8 }}>Description</Text>
            <TextInput
              multiline
              value={description}
              onChangeText={setDescription}
              style={{ fontSize: 14, color: C.label, minHeight: 60, textAlignVertical: 'top' }}
              placeholderTextColor={C.muted}
              placeholder="Describe your brand…"
            />
            <Text style={{ fontSize: 11, color: C.secondary, marginTop: 6, textAlign: 'right' }}>
              {description.length}/200
            </Text>
          </View>
        </GlassView>

        {/* ── MODE ───────────────────────────────────────────────────────── */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>MODE</Text>
        <GlassView tier={1} style={s.card}>
          <View style={s.row}>
            <IconSymbol name="square.grid.2x2.fill" size={18} color={C.secondary} />
            <Text style={{ flex: 1, fontSize: 15, color: C.label, marginLeft: 12 }}>Mode</Text>
            <Text style={{ fontSize: 14, color: C.secondary }}>Personal</Text>
            <IconSymbol name="lock.fill" size={13} color={C.muted} style={{ marginLeft: 8 }} />
          </View>
        </GlassView>

        {/* ── CONTACT ────────────────────────────────────────────────────── */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>CONTACT</Text>
        <GlassView tier={1} style={s.card}>

          {/* Email */}
          <View style={s.row}>
            <IconSymbol name="envelope.fill" size={18} color={C.secondary} />
            <Text style={s.contactLabel}>Email</Text>
            <TextInput
              value={contactEmail}
              onChangeText={setContactEmail}
              style={[s.contactInput, { color: C.label }]}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="–"
              placeholderTextColor={C.muted}
            />
          </View>

          {/* Phone */}
          <View style={[s.row, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
            <IconSymbol name="phone.fill" size={18} color={C.secondary} />
            <Text style={s.contactLabel}>Phone</Text>
            <TextInput
              value={contactPhone}
              onChangeText={setContactPhone}
              style={[s.contactInput, { color: C.label }]}
              keyboardType="phone-pad"
              placeholder="–"
              placeholderTextColor={C.muted}
            />
          </View>

          {/* Website */}
          <View style={[s.row, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
            <IconSymbol name="globe" size={18} color={C.secondary} />
            <Text style={s.contactLabel}>Website</Text>
            <TextInput
              value={website}
              onChangeText={setWebsite}
              style={[s.contactInput, { color: C.label }]}
              keyboardType="url"
              autoCapitalize="none"
              placeholder="–"
              placeholderTextColor={C.muted}
            />
          </View>

          {/* Address */}
          <View style={[s.row, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
            <IconSymbol name="mappin.fill" size={18} color={C.secondary} />
            <Text style={s.contactLabel}>Address</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              style={[s.contactInput, { color: C.label }]}
              placeholder="–"
              placeholderTextColor={C.muted}
            />
          </View>
        </GlassView>

        {/* ── BRAND CODE ─────────────────────────────────────────────────── */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>BRAND CODE</Text>
        <GlassView tier={1} style={s.card}>
          <View style={s.row}>
            <IconSymbol name="qrcode" size={18} color={C.secondary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 12, color: C.secondary }}>Join Code</Text>
              <Text style={{ fontSize: 16, color: C.label, fontWeight: '700', letterSpacing: 1, marginTop: 2 }}>
                SAMKALE-7X2
              </Text>
            </View>
            <Pressable
              onPress={() => haptic()}
              style={[s.copyBtn, { borderColor: C.separator, backgroundColor: C.bg }]}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Copy</Text>
            </Pressable>
          </View>
        </GlassView>

        {/* ── SAVE BUTTON ────────────────────────────────────────────────── */}
        <Pressable
          style={[s.saveBtn, { backgroundColor: C.label }]}
          onPress={() => haptic()}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.bg }}>Save Changes</Text>
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
    pill:      { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    pillText:  { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

    sectionLabel: {
      fontSize: 11, fontWeight: '700', letterSpacing: 0.6,
      textTransform: 'uppercase', paddingHorizontal: 16,
      marginBottom: 6, marginTop: 24,
    },
    card: { borderRadius: 12, overflow: 'hidden', marginHorizontal: 16 },

    logoRow: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 14, paddingVertical: 12,
    },
    initialsCircle: {
      width: 44, height: 44, borderRadius: 22,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1,
    },
    initialsText: { fontSize: 16, fontWeight: '800' },

    row: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 14, paddingVertical: 14,
      backgroundColor: C.surface,
    },
    descriptionRow: {
      paddingHorizontal: 14, paddingVertical: 12,
      backgroundColor: C.surface,
    },

    contactLabel: { width: 80, fontSize: 14, color: C.secondary },
    contactInput:  { flex: 1, textAlign: 'right', fontSize: 15 },

    copyBtn: {
      borderRadius: 8, borderWidth: 1,
      paddingHorizontal: 12, paddingVertical: 6,
    },

    saveBtn: {
      marginHorizontal: 16, marginTop: 24,
      height: 48, borderRadius: 12,
      alignItems: 'center', justifyContent: 'center',
    },
  });
}
