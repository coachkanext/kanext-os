/**
 * Recruits — Questionnaire (Player only).
 * Recruit questionnaire form. Head Coach redirects to Board.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert, Animated, TextInput, Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;

type FieldConfig = { key: string; label: string; placeholder: string; multiline?: boolean; keyboardType?: string };

const FIELDS: FieldConfig[] = [
  { key: 'fullName',      label: 'Full Name',              placeholder: 'First Last' },
  { key: 'email',         label: 'Email',                  placeholder: 'your@email.com', keyboardType: 'email-address' },
  { key: 'phone',         label: 'Phone',                  placeholder: '(555) 555-5555', keyboardType: 'phone-pad' },
  { key: 'school',        label: 'Current School',         placeholder: 'School name' },
  { key: 'gradYear',      label: 'Graduation Year',        placeholder: '2026', keyboardType: 'numeric' },
  { key: 'position',      label: 'Position(s)',            placeholder: 'PG, SG, SF...' },
  { key: 'height',        label: 'Height',                 placeholder: "6'2\"" },
  { key: 'weight',        label: 'Weight (lbs)',           placeholder: '185', keyboardType: 'numeric' },
  { key: 'gpa',           label: 'GPA',                    placeholder: '3.2', keyboardType: 'decimal-pad' },
  { key: 'sat',           label: 'SAT / ACT (optional)',   placeholder: '1150 SAT or 24 ACT' },
  { key: 'aauTeam',       label: 'Current Team / AAU',     placeholder: 'Team name' },
  { key: 'coachName',     label: 'Coach Name & Contact',   placeholder: 'Coach name, phone/email' },
  { key: 'filmLink',      label: 'Highlight Film Link',    placeholder: 'YouTube or Hudl URL' },
  { key: 'social',        label: 'Social Media Handles',   placeholder: '@handle (IG, Twitter)' },
  { key: 'whyLU',         label: 'Why Lincoln Basketball?', placeholder: 'Tell us about your interest...', multiline: true },
  { key: 'academicGoals', label: 'Academic Goals',          placeholder: 'What do you want to study?', multiline: true },
];

export default function QuestionnaireScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('sports:recruits');
  const isCoach = role === roleCycles[0];

  const [form, setForm]         = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (isCoach) router.replace('/(tabs)/(main)/recruits' as any);
  }, [isCoach, router]));

  if (isCoach) return null;

  if (submitted) {
    return (
      <View style={[s.screen, { backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }]}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#5A8A6E22', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 28 }}>✓</Text>
        </View>
        <Text style={{ fontSize: 20, fontWeight: '800', color: C.label, textAlign: 'center', marginBottom: 10 }}>Thank You!</Text>
        <Text style={{ fontSize: 15, color: C.secondary, textAlign: 'center', lineHeight: 22 }}>
          Coach Middlebrooks will review your questionnaire. You'll hear from us within 7 days.
        </Text>
        <Pressable
          style={[s.submitBtn, { backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, marginTop: 24 }]}
          onPress={() => { setSubmitted(false); setForm({}); }}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>Back to Program</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>

      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Questionnaire</Text>
            </View>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={false} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 17, fontWeight: '700', color: C.label, marginBottom: 4 }}>Recruiting Questionnaire</Text>
        <Text style={{ fontSize: 14, color: C.secondary, lineHeight: 20, marginBottom: 20 }}>
          Fill out the form below to express your interest in Lincoln Men's Basketball. All fields required unless marked optional.
        </Text>

        {FIELDS.map(field => (
          <View key={field.key} style={{ marginBottom: 14 }}>
            <Text style={[s.fieldLabel, { color: C.secondary }]}>{field.label}</Text>
            <TextInput
              value={form[field.key] ?? ''}
              onChangeText={val => setForm(prev => ({ ...prev, [field.key]: val }))}
              placeholder={field.placeholder}
              placeholderTextColor={C.secondary}
              multiline={field.multiline}
              keyboardType={(field.keyboardType ?? 'default') as any}
              style={[
                s.textInput,
                { backgroundColor: C.surface, borderColor: C.separator, color: C.label },
                field.multiline && { height: 100, textAlignVertical: 'top', paddingTop: 12 },
              ]}
            />
          </View>
        ))}

        <Pressable
          style={[s.submitBtn, { backgroundColor: '#1A1714', marginTop: 8 }]}
          onPress={() => {
            const required = ['fullName', 'email', 'phone', 'school', 'gradYear', 'position'];
            const missing = required.filter(k => !form[k]?.trim());
            if (missing.length > 0) { Alert.alert('Missing Fields', 'Please fill out all required fields.'); return; }
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setSubmitted(true);
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Submit Questionnaire</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:      { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:      { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:  { width: 80, justifyContent: 'center' },
  titlePill:   { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  titleText:   { fontSize: 13, fontWeight: '700' },
  fieldLabel:  { fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  textInput:   { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 10, fontSize: 14 },
  submitBtn:   { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
});
