/**
 * Permissions Settings — Content approval, member directory visibility, moderation sensitivity.
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

const MOD_DESCRIPTIONS: Record<'low' | 'medium' | 'high', string> = {
  low:    'Basic filtering only. Most content passes automatically.',
  medium: 'Standard filtering. Flagged content requires review.',
  high:   'Strict filtering. All non-member content requires approval.',
};

export default function PermissionsSettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const topBarH           = insets.top + TOP_BAR_H;
  const contentPaddingTop = topBarH + 8;
  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const [contentApproval,          setContentApproval]          = useState(false);
  const [directoryMemberNames,     setDirectoryMemberNames]     = useState(true);
  const [directoryMemberProfiles,  setDirectoryMemberProfiles]  = useState(true);
  const [directoryMemberActivity,  setDirectoryMemberActivity]  = useState(false);
  const [modSensitivity,           setModSensitivity]           = useState<'low' | 'medium' | 'high'>('medium');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const Toggle = ({ val, setVal }: { val: boolean; setVal: (fn: (v: boolean) => boolean) => void }) => (
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

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { height: topBarH, paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable onPress={() => { haptic(); router.back(); }} hitSlop={8} style={s.topBarBtn}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <View style={[s.pill, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[s.pillText, { color: C.label }]}>Permissions</Text>
        </View>
        <View style={s.topBarBtn} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* CONTENT */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>CONTENT</Text>
        <GlassView tier={1} style={s.card}>
          <View style={[s.row, { backgroundColor: C.surface }]}>
            <IconSymbol name="checkmark.shield.fill" size={18} color={C.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: C.label }}>Content Approval</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>
                Require approval before member posts go live
              </Text>
            </View>
            <Toggle val={contentApproval} setVal={setContentApproval} />
          </View>
        </GlassView>

        {/* MEMBER DIRECTORY */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>MEMBER DIRECTORY</Text>
        <Text style={[s.infoText, { color: C.secondary }]}>
          Control what members can see about each other in your brand directory.
        </Text>
        <GlassView tier={1} style={s.card}>
          {/* Member Names */}
          <View style={[s.row, { backgroundColor: C.surface }]}>
            <IconSymbol name="person.fill" size={18} color={C.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: C.label }}>Member Names</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>
                Members can see each other's names
              </Text>
            </View>
            <Toggle val={directoryMemberNames} setVal={setDirectoryMemberNames} />
          </View>

          {/* Member Profiles */}
          <View style={[s.row, { backgroundColor: C.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
            <IconSymbol name="person.circle.fill" size={18} color={C.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: C.label }}>Member Profiles</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>
                Members can tap to view each other's profiles
              </Text>
            </View>
            <Toggle val={directoryMemberProfiles} setVal={setDirectoryMemberProfiles} />
          </View>

          {/* Activity Status */}
          <View style={[s.row, { backgroundColor: C.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
            <IconSymbol name="clock.fill" size={18} color={C.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: C.label }}>Activity Status</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>
                Members can see when others were last active
              </Text>
            </View>
            <Toggle val={directoryMemberActivity} setVal={setDirectoryMemberActivity} />
          </View>
        </GlassView>

        {/* CONTENT MODERATION */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>CONTENT MODERATION</Text>
        <GlassView tier={1} style={s.card}>
          <View style={{ paddingHorizontal: 14, paddingVertical: 14, backgroundColor: C.surface }}>
            <Text style={{ fontSize: 15, color: C.label, marginBottom: 12 }}>Sensitivity Level</Text>

            {/* Three-option segment */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['low', 'medium', 'high'] as const).map((level) => {
                const active = modSensitivity === level;
                return (
                  <Pressable
                    key={level}
                    onPress={() => { haptic(); setModSensitivity(level); }}
                    style={{
                      flex: 1,
                      height: 36,
                      borderRadius: 8,
                      borderWidth: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: active ? C.label : C.bg,
                      borderColor: active ? C.label : C.separator,
                    }}
                  >
                    <Text style={{
                      fontSize: 13,
                      fontWeight: active ? '700' : '400',
                      color: active ? C.bg : C.secondary,
                      textTransform: 'capitalize',
                    }}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Description */}
            <Text style={{ fontSize: 13, color: C.secondary, marginTop: 12 }}>
              {MOD_DESCRIPTIONS[modSensitivity]}
            </Text>
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
    card: { borderRadius: 12, overflow: 'hidden', marginHorizontal: 16 },
    row:  { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  });
}
