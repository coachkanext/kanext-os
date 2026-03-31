/**
 * Brand Creation — 3-step flow (§20.8)
 * Step 1: Choose Mode
 * Step 2: Brand Info (name, logo optional, description optional)
 * Step 3: Confirmation preview + Create Brand
 *
 * Entry: Brand Drawer → "Create Brand" above Settings row.
 * On completion: switches to new brand, Nexus welcome opens.
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

// ── Types ─────────────────────────────────────────────────────────────────────

type BrandMode = 'sports' | 'business' | 'education' | 'community';

interface ModeOption {
  key:      BrandMode;
  label:    string;
  subtitle: string;
  icon:     string;
  color:    string;
}

// ── Config ────────────────────────────────────────────────────────────────────

const MODE_OPTIONS: ModeOption[] = [
  { key: 'sports',    label: 'Sports',    subtitle: 'Team, program, or league',        icon: 'trophy.fill',        color: '#1A1714' },
  { key: 'business',  label: 'Business',  subtitle: 'Company, startup, or agency',     icon: 'briefcase.fill',     color: '#1A1714' },
  { key: 'education', label: 'Education', subtitle: 'School, university, or program',  icon: 'graduationcap.fill', color: '#1A1714' },
  { key: 'community', label: 'Community', subtitle: 'Church, nonprofit, or organization', icon: 'person.3.fill',  color: '#1A1714' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function CreateOrgScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [step,     setStep]     = useState<0 | 1 | 2>(0);
  const [mode,     setMode]     = useState<BrandMode | null>(null);
  const [name,     setName]     = useState('');
  const [desc,     setDesc]     = useState('');

  const selectedMode = MODE_OPTIONS.find(m => m.key === mode);

  const goBack = () => {
    if (step === 0) { router.back(); return; }
    setStep((s => (s - 1) as 0 | 1 | 2)(step));
  };

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s => (s + 1) as 0 | 1 | 2)(step));
  };

  const handleCreate = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)/(main)');
  };

  // ── Step 1: Mode ────────────────────────────────────────────────────────────

  const renderStep0 = () => (
    <>
      <View style={s.stepHeader}>
        <Text style={[s.stepTitle, { color: C.label }]}>Choose a mode</Text>
        <Text style={[s.stepSub, { color: C.secondary }]}>
          The mode determines which tools appear in your brand.
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[s.modeList, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {MODE_OPTIONS.map(opt => {
          const active = mode === opt.key;
          return (
            <Pressable
              key={opt.key}
              style={({ pressed }) => [
                s.modeCard,
                { backgroundColor: C.surface, borderColor: active ? opt.color : 'transparent' },
                pressed && !active && { opacity: 0.8 },
              ]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMode(opt.key); }}
            >
              <View style={[s.modeIcon, { backgroundColor: opt.color + '18' }]}>
                <IconSymbol name={opt.icon as any} size={22} color={opt.color} />
              </View>
              <View style={s.modeInfo}>
                <Text style={[s.modeLabel, { color: C.label }]}>{opt.label}</Text>
                <Text style={[s.modeSub, { color: C.secondary }]}>{opt.subtitle}</Text>
              </View>
              <View style={[s.radio, { borderColor: active ? opt.color : C.separator }]}>
                {active && <View style={[s.radioDot, { backgroundColor: opt.color }]} />}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={[s.primaryBtn, { backgroundColor: mode ? C.label : C.surfacePressed }]}
          disabled={!mode}
          onPress={goNext}
        >
          <Text style={[s.primaryBtnText, { color: mode ? C.bg : C.muted }]}>Continue</Text>
        </Pressable>
      </View>
    </>
  );

  // ── Step 2: Brand Info ──────────────────────────────────────────────────────

  const renderStep1 = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[s.infoList, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.stepHeader}>
          <Text style={[s.stepTitle, { color: C.label }]}>Brand info</Text>
          <Text style={[s.stepSub, { color: C.secondary }]}>You can update these any time in Brand Settings.</Text>
        </View>

        {/* Name */}
        <Text style={[s.fieldLabel, { color: C.secondary }]}>Brand name *</Text>
        <TextInput
          style={[s.textInput, { backgroundColor: C.surface, color: C.label, borderColor: C.inputBorder }]}
          placeholder="e.g. LU Men's Basketball"
          placeholderTextColor={C.muted}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          returnKeyType="next"
        />

        {/* Logo placeholder */}
        <Text style={[s.fieldLabel, { color: C.secondary, marginTop: 20 }]}>Logo (optional)</Text>
        <Pressable style={[s.logoUpload, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <IconSymbol name="photo" size={22} color={C.muted} />
          <Text style={[s.logoUploadText, { color: C.secondary }]}>Upload photo or take picture</Text>
        </Pressable>

        {/* Description */}
        <Text style={[s.fieldLabel, { color: C.secondary, marginTop: 20 }]}>Description (optional)</Text>
        <TextInput
          style={[s.textInput, s.textArea, { backgroundColor: C.surface, color: C.label, borderColor: C.inputBorder }]}
          placeholder="Tell people what your brand is about..."
          placeholderTextColor={C.muted}
          value={desc}
          onChangeText={setDesc}
          multiline
          numberOfLines={3}
          returnKeyType="done"
        />
      </ScrollView>

      <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={[s.primaryBtn, { backgroundColor: name.trim() ? C.label : C.surfacePressed }]}
          disabled={!name.trim()}
          onPress={goNext}
        >
          <Text style={[s.primaryBtnText, { color: name.trim() ? C.bg : C.muted }]}>Continue</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );

  // ── Step 3: Confirmation ────────────────────────────────────────────────────

  const renderStep2 = () => (
    <>
      <View style={s.stepHeader}>
        <Text style={[s.stepTitle, { color: C.label }]}>Looks good?</Text>
        <Text style={[s.stepSub, { color: C.secondary }]}>Review your brand before creating it.</Text>
      </View>

      {/* Preview card */}
      <View style={[s.previewCard, { backgroundColor: C.surface }]}>
        <View style={[s.previewAvatar, { backgroundColor: (selectedMode?.color ?? C.accent) + '18' }]}>
          <Text style={[s.previewInitials, { color: selectedMode?.color ?? C.accent }]}>
            {name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '??'}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[s.previewName, { color: C.label }]}>{name.trim() || 'Untitled Brand'}</Text>
          <View style={[s.modeBadge, { backgroundColor: (selectedMode?.color ?? C.accent) + '18' }]}>
            <Text style={[s.modeBadgeText, { color: selectedMode?.color ?? C.accent }]}>
              {selectedMode?.label ?? ''}
            </Text>
          </View>
        </View>
      </View>

      {desc.trim() !== '' && (
        <Text style={[s.previewDesc, { color: C.secondary }]}>{desc.trim()}</Text>
      )}

      <View style={[s.infoNote, { backgroundColor: C.surfacePressed }]}>
        <IconSymbol name="info.circle" size={16} color={C.secondary} />
        <Text style={[s.infoNoteText, { color: C.secondary }]}>
          You'll be the owner (R0). Invite members from Brand Settings after creation.
        </Text>
      </View>

      <View style={{ flex: 1 }} />

      <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable style={[s.primaryBtn, { backgroundColor: selectedMode?.color ?? C.accent }]} onPress={handleCreate}>
          <Text style={[s.primaryBtnText, { color: '#fff' }]}>Create Brand</Text>
        </Pressable>
      </View>
    </>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  const STEP_LABELS = ['Choose mode', 'Brand info', 'Confirm'];

  return (
    <View style={[s.screen, { backgroundColor: C.bg, paddingTop: insets.top }]}>

      {/* Top bar */}
      <View style={s.topBar}>
        <Pressable style={s.backBtn} onPress={goBack} hitSlop={8}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={[s.topTitle, { color: C.label }]}>Create Brand</Text>
        <View style={s.backBtn} />
      </View>

      {/* Progress dots */}
      <View style={s.dots}>
        {[0, 1, 2].map(i => (
          <View
            key={i}
            style={[
              s.dot,
              {
                backgroundColor: i <= step ? C.label : C.separator,
                width: i === step ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>

      {step === 0 && renderStep0()}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen: { flex: 1 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, paddingVertical: 4, minHeight: 44,
  },
  backBtn:  { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 17, fontWeight: '600' },

  dots: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 6, paddingVertical: 12,
  },
  dot: { height: 8, borderRadius: 4, transition: 'width' as any },

  stepHeader: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  stepTitle: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
  stepSub:   { fontSize: 14, lineHeight: 20 },

  // Step 0
  modeList: { paddingHorizontal: 16, gap: 10 },
  modeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 16, borderWidth: 1.5,
    paddingVertical: 18, paddingHorizontal: 16,
  },
  modeIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  modeInfo: { flex: 1, minWidth: 0 },
  modeLabel: { fontSize: 16, fontWeight: '600' },
  modeSub:   { fontSize: 13, marginTop: 2 },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },

  // Step 1
  infoList:   { paddingHorizontal: 20, paddingTop: 8, gap: 4 },
  fieldLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.4, marginBottom: 8, marginTop: 4 },
  textInput: {
    fontSize: 16, paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  logoUpload: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderStyle: 'dashed', borderRadius: 12,
    paddingVertical: 18, paddingHorizontal: 14,
  },
  logoUploadText: { fontSize: 14 },

  // Step 2
  previewCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: 20, marginBottom: 16,
    padding: 16, borderRadius: 16,
  },
  previewAvatar: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  previewInitials: { fontSize: 18, fontWeight: '700' },
  previewName:     { fontSize: 17, fontWeight: '600' },
  modeBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  modeBadgeText: { fontSize: 11, fontWeight: '700' },
  previewDesc: {
    fontSize: 14, lineHeight: 20, marginHorizontal: 20, marginBottom: 20,
  },
  infoNote: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    marginHorizontal: 20, padding: 14, borderRadius: 12,
  },
  infoNoteText: { flex: 1, fontSize: 13, lineHeight: 18 },

  // Shared
  footer: { paddingHorizontal: 20, paddingTop: 12 },
  primaryBtn: {
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700' },
});
