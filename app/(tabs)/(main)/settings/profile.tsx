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

const GAIN = '#5A8A6E';

export default function ProfileSettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const topBarH           = insets.top + TOP_BAR_H;
  const contentPaddingTop = topBarH + 8;

  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const [name,   setName]   = useState('Sammy Kalejaiye');
  const [handle, setHandle] = useState('sammykalejaiye');
  const [bio,    setBio]    = useState('Sports content creator, coach, and athlete. Atlanta-based. Building in public.');
  const [phone,  setPhone]  = useState('+1 (404) 555-0192');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { height: topBarH, paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable onPress={() => { haptic(); router.back(); }} hitSlop={8} style={s.topBarBtn}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <View style={[s.pill, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[s.pillText, { color: C.label }]}>Profile</Text>
        </View>
        <View style={s.topBarBtn} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* AVATAR */}
        <View style={{ marginTop: 24, marginHorizontal: 16 }}>
          <GlassView tier={1} style={[s.card, { marginHorizontal: 0, paddingVertical: 20, alignItems: 'center' }]}>
            {/* Initials circle */}
            <View style={[s.avatarCircle, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.avatarInitials, { color: C.label }]}>SK</Text>
            </View>

            {/* Picker buttons */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              {([
                { label: 'Camera',   icon: 'camera.fill'            },
                { label: 'Library',  icon: 'photo.fill'             },
                { label: 'Memoji',   icon: 'face.smiling'           },
                { label: 'Initials', icon: 'character.cursor.ibeam' },
              ] as const).map(opt => (
                <Pressable
                  key={opt.label}
                  onPress={() => haptic()}
                  style={[s.pickerBtn, { borderColor: C.separator, backgroundColor: C.bg }]}
                >
                  <IconSymbol name={opt.icon as any} size={13} color={C.secondary} />
                  <Text style={[s.pickerBtnText, { color: C.secondary }]}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          </GlassView>
        </View>

        {/* PERSONAL */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>PERSONAL</Text>
        <GlassView tier={1} style={s.card}>
          {/* Row 1: Display name */}
          <View style={[s.row, { backgroundColor: C.surface }]}>
            <Text style={[s.rowLabel, { color: C.secondary }]}>Display name</Text>
            <TextInput
              style={[s.rowInput, { color: C.label }]}
              value={name}
              onChangeText={setName}
              textAlign="right"
              returnKeyType="done"
            />
          </View>

          {/* Row 2: Handle */}
          <View style={[s.row, s.rowBorderTop, { backgroundColor: C.surface, borderTopColor: C.separator }]}>
            <Text style={[{ fontSize: 15, color: C.secondary }]}>@</Text>
            <TextInput
              style={[s.rowInput, { color: C.label }]}
              value={handle}
              onChangeText={setHandle}
              autoCapitalize="none"
              returnKeyType="done"
            />
          </View>
        </GlassView>

        {/* BIO */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>BIO</Text>
        <GlassView tier={1} style={s.card}>
          <TextInput
            style={[s.bioInput, { color: C.label }]}
            value={bio}
            onChangeText={setBio}
            multiline
            maxLength={160}
            placeholder="Write a bio…"
            placeholderTextColor={C.muted}
            textAlignVertical="top"
          />
          <View style={[s.bioCounter, { borderTopColor: C.separator }]}>
            <Text style={[s.bioCounterText, { color: C.secondary }]}>{bio.length}/160</Text>
          </View>
        </GlassView>

        {/* CONTACT */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>CONTACT</Text>
        <GlassView tier={1} style={s.card}>
          {/* Row 1: Email (non-editable) */}
          <View style={[s.row, { backgroundColor: C.surface }]}>
            <Text style={[s.rowLabelWide, { color: C.secondary }]}>Email</Text>
            <View style={{ flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
              <Text style={[{ fontSize: 15, color: C.label }]}>sammy@kanext.io</Text>
              <IconSymbol name="checkmark.seal.fill" size={14} color={GAIN} />
            </View>
          </View>

          {/* Row 2: Phone (editable) */}
          <View style={[s.row, s.rowBorderTop, { backgroundColor: C.surface, borderTopColor: C.separator }]}>
            <Text style={[s.rowLabelWide, { color: C.secondary }]}>Phone</Text>
            <TextInput
              style={[s.rowInput, { color: C.label }]}
              value={phone}
              onChangeText={setPhone}
              textAlign="right"
              keyboardType="phone-pad"
              returnKeyType="done"
            />
          </View>
        </GlassView>

        {/* PERSONAL DETAILS */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>PERSONAL DETAILS</Text>
        <GlassView tier={1} style={s.card}>
          <Pressable
            onPress={() => haptic()}
            style={[s.row, { backgroundColor: C.surface }]}
          >
            <Text style={[{ flex: 1, fontSize: 15, color: C.label }]}>Date of Birth</Text>
            <Text style={[{ fontSize: 14, color: C.secondary }]}>July 14, 1993</Text>
            <IconSymbol name="chevron.right" size={13} color={C.muted} style={{ marginLeft: 4 }} />
          </Pressable>
        </GlassView>

        {/* Save Button */}
        <Pressable
          onPress={() => haptic()}
          style={[s.saveBtn, { backgroundColor: C.label }]}
        >
          <Text style={[s.saveBtnText, { color: C.bg }]}>Save Changes</Text>
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
    pill: {
      flex: 1, alignItems: 'center', justifyContent: 'center',
      height: 32, borderRadius: 16, borderWidth: 1, marginHorizontal: 10,
    },
    pillText: { fontSize: 14, fontWeight: '700' },

    sectionLabel: {
      fontSize: 11, fontWeight: '700', letterSpacing: 0.6,
      textTransform: 'uppercase', paddingHorizontal: 16,
      marginBottom: 6, marginTop: 24,
    },

    card: { borderRadius: 12, overflow: 'hidden', marginHorizontal: 16 },

    row: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 14, paddingVertical: 14,
    },
    rowBorderTop: { borderTopWidth: StyleSheet.hairlineWidth },
    rowLabel:     { width: 120, fontSize: 14 },
    rowLabelWide: { width: 100, fontSize: 14 },
    rowInput:     { flex: 1, fontSize: 15 },

    avatarCircle: {
      width: 72, height: 72, borderRadius: 36,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1,
    },
    avatarInitials: { fontSize: 24, fontWeight: '800' },

    pickerBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      paddingHorizontal: 12, height: 32, borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
    },
    pickerBtnText: { fontSize: 12 },

    bioInput: {
      paddingHorizontal: 14, paddingVertical: 12,
      fontSize: 15, minHeight: 80,
    },
    bioCounter: {
      borderTopWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: 14, paddingVertical: 8,
      alignItems: 'flex-end',
    },
    bioCounterText: { fontSize: 11 },

    saveBtn: {
      marginHorizontal: 16, marginTop: 24,
      height: 48, borderRadius: 12,
      alignItems: 'center', justifyContent: 'center',
    },
    saveBtnText: { fontSize: 16, fontWeight: '700' },
  });
}
