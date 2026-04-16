/**
 * Auth + Onboarding Flow
 *
 * Route → Auth → Home (auto-join matched org)
 * Returning users skip entirely (isAuthenticated && !isNewUser).
 *
 * Handle auto-generated @firstnamelastname. Personal brand auto-created silently.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, Image,
  KeyboardAvoidingView, Platform, Animated, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/auth-context';
import { useAppContext } from '@/context/app-context';
import type { Mode } from '@/types';

const KX_LOGO = require('@/assets/images/kx-logo.png');

// ── Domain / invite-code registry ─────────────────────────────────────────────

type OrgMatch = {
  name: string;
  mode: Mode;
  orgType: string;
  modeLabel: string;
};

const DOMAIN_REGISTRY: Record<string, OrgMatch> = {
  'kanext.io':    { name: 'KaNeXT',              mode: 'business',  orgType: 'platform',          modeLabel: 'Business'  },
  'lincolnu.edu': { name: 'Lincoln University (CA)',  mode: 'education', orgType: 'university',        modeLabel: 'Education' },
  'iccla.org':    { name: 'ICCLA',               mode: 'community', orgType: 'faith',             modeLabel: 'Community' },
};

const CODE_REGISTRY: Record<string, OrgMatch> = {
  'KX2026':    { name: 'KaNeXT',              mode: 'business',  orgType: 'platform',          modeLabel: 'Business'  },
  'LU2026':    { name: 'Lincoln University (CA)',  mode: 'education', orgType: 'university',        modeLabel: 'Education' },
  'LU2026MBB': { name: "Lincoln Men's Basketball", mode: 'sports',    orgType: 'college_athletics', modeLabel: 'Athletics'    },
  'ICCLA2026': { name: 'ICCLA',               mode: 'community', orgType: 'faith',             modeLabel: 'Community' },
};

function checkRouteInput(text: string): OrgMatch | null {
  const trimmed = text.trim();
  if (trimmed.includes('@')) {
    const domain = trimmed.split('@')[1]?.toLowerCase() ?? '';
    return DOMAIN_REGISTRY[domain] ?? null;
  }
  if (trimmed.length >= 4) {
    return CODE_REGISTRY[trimmed.toUpperCase()] ?? null;
  }
  return null;
}

// ── Types ──────────────────────────────────────────────────────────────────────

type Step = 'route' | 'apply' | 'confirm' | 'auth';
type AppMode = 'business' | 'education' | 'sports' | 'community';

const MODE_OPTIONS: { key: AppMode; label: string; icon: string }[] = [
  { key: 'business',  label: 'Business',  icon: 'briefcase.fill' },
  { key: 'education', label: 'Education', icon: 'graduationcap.fill' },
  { key: 'sports',    label: 'Athletics',    icon: 'trophy.fill' },
  { key: 'community', label: 'Community', icon: 'person.3.fill' },
];

interface AuthModalProps { visible: boolean; }

// ── Component ──────────────────────────────────────────────────────────────────

export function AuthModal({ visible }: AuthModalProps) {
  const { signIn, completeOnboarding } = useAuth();
  const { switchMode } = useAppContext();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [step, setStep] = useState<Step>('route');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [routeInput, setRouteInput] = useState('');
  const [routeInputFocused, setRouteInputFocused] = useState(false);
  const [matchedOrg, setMatchedOrg] = useState<OrgMatch | null>(null);
  const cardAnim = useRef(new Animated.Value(0)).current;

  // Apply form state
  const [applyName, setApplyName] = useState('');
  const [applyEmail, setApplyEmail] = useState('');
  const [applyInstitution, setApplyInstitution] = useState('');
  const [applyMode, setApplyMode] = useState<AppMode | null>(null);

  const applyValid = applyName.trim().length > 0 && applyEmail.trim().includes('@') && applyInstitution.trim().length > 0 && applyMode !== null;

  // Org card spring
  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: matchedOrg ? 1 : 0,
      tension: 100, friction: 12, useNativeDriver: true,
    }).start();
  }, [matchedOrg, cardAnim]);

  // Reset on show
  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(1);
      setStep('route');
      setRouteInput('');
      setMatchedOrg(null);
      setApplyName('');
      setApplyEmail('');
      setApplyInstitution('');
      setApplyMode(null);
    }
  }, [visible, fadeAnim]);

  const handleRouteInputChange = (text: string) => {
    setRouteInput(text);
    setMatchedOrg(checkRouteInput(text));
  };

  /** Replace nav stack with home, fade out, THEN complete onboarding */
  const fadeOutAndComplete = useCallback(() => {
    router.replace('/(tabs)/(main)' as any);
    Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true })
      .start(async () => { await completeOnboarding(); });
  }, [fadeAnim, completeOnboarding, router]);

  const handleContinue = useCallback(async () => {
    // Always land on KaNeXT business for demo
    switchMode('business');
    await signIn('apple');
    fadeOutAndComplete();
  }, [switchMode, signIn, fadeOutAndComplete]);


  if (!visible) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim }]}>

      {/* ── ROUTE ─────────────────────────────────────────────────────────────── */}
      {step === 'route' && (
        <KeyboardAvoidingView
          style={[styles.screen, { paddingTop: insets.top + 8 }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.routeMiddle}>
            <View style={styles.routeLogoWrap}>
              <Image source={KX_LOGO} style={styles.routeLogo} resizeMode="contain" />
              <Text style={styles.routeTitle}>KaNeXT</Text>
            </View>

            <View style={[styles.routeInput, routeInputFocused && styles.routeInputFocused]}>
              <TextInput
                style={styles.routeTextInput}
                value={routeInput}
                onChangeText={handleRouteInputChange}
                onFocus={() => setRouteInputFocused(true)}
                onBlur={() => setRouteInputFocused(false)}
                placeholder="Enter your invite code or KaNeXT email"
                placeholderTextColor="rgba(0,0,0,0.25)"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="go"
                onSubmitEditing={matchedOrg ? () => setStep('auth') : undefined}
              />
            </View>

            {/* Animated org match card */}
            <Animated.View
              style={[
                styles.orgCard,
                {
                  opacity: cardAnim,
                  transform: [{
                    translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }),
                  }],
                },
              ]}
              pointerEvents={matchedOrg ? 'auto' : 'none'}
            >
              {matchedOrg && (
                <Pressable
                  style={({ pressed }) => [styles.orgCardInner, pressed && { opacity: 0.75 }]}
                  onPress={() => setStep('auth')}
                >
                  <View style={styles.orgCardAvatar}>
                    <Text style={styles.orgCardInitials}>
                      {matchedOrg.name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.orgCardInfo}>
                    <Text style={styles.orgCardName}>{matchedOrg.name}</Text>
                    <Text style={styles.orgCardMeta}>{matchedOrg.modeLabel}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color="rgba(0,0,0,0.25)" />
                </Pressable>
              )}
            </Animated.View>
          </View>

        </KeyboardAvoidingView>
      )}

      {/* ── APPLY ─────────────────────────────────────────────────────────────── */}
      {step === 'apply' && (
        <KeyboardAvoidingView
          style={[styles.screen, { paddingTop: insets.top }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.stepNav}>
            <Pressable style={styles.navBtn} onPress={() => setStep('route')} hitSlop={12}>
              <IconSymbol name="chevron.left" size={22} color="#1A1A1A" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.applyScroll}
            contentContainerStyle={[styles.applyContent, { paddingBottom: insets.bottom + 120 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.applyHeading}>Bring your institution{'\n'}to KaNeXT.</Text>

            {/* Name */}
            <View style={styles.applyFieldWrap}>
              <Text style={styles.applyLabel}>NAME</Text>
              <View style={styles.applyField}>
                <TextInput
                  style={styles.applyInput}
                  value={applyName}
                  onChangeText={setApplyName}
                  placeholder="Your full name"
                  placeholderTextColor="rgba(0,0,0,0.25)"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.applyFieldWrap}>
              <Text style={styles.applyLabel}>EMAIL</Text>
              <View style={styles.applyField}>
                <TextInput
                  style={styles.applyInput}
                  value={applyEmail}
                  onChangeText={setApplyEmail}
                  placeholder="your@email.com"
                  placeholderTextColor="rgba(0,0,0,0.25)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Institution */}
            <View style={styles.applyFieldWrap}>
              <Text style={styles.applyLabel}>INSTITUTION NAME</Text>
              <View style={styles.applyField}>
                <TextInput
                  style={styles.applyInput}
                  value={applyInstitution}
                  onChangeText={setApplyInstitution}
                  placeholder="Your institution or organization"
                  placeholderTextColor="rgba(0,0,0,0.25)"
                  autoCorrect={false}
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Mode */}
            <View style={styles.applyFieldWrap}>
              <Text style={styles.applyLabel}>MODE</Text>
              <View style={styles.modeGrid}>
                {MODE_OPTIONS.map((m) => {
                  const active = applyMode === m.key;
                  return (
                    <Pressable
                      key={m.key}
                      style={({ pressed }) => [
                        styles.modeCard,
                        active && styles.modeCardActive,
                        pressed && !active && { opacity: 0.7 },
                      ]}
                      onPress={() => setApplyMode(m.key)}
                    >
                      <IconSymbol name={m.icon as any} size={20} color={active ? '#1A1A1A' : 'rgba(0,0,0,0.35)'} />
                      <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>{m.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={[styles.applyFooter, { paddingBottom: insets.bottom + 24 }]}>
            <Pressable
              style={[styles.btn, styles.btnFilled, !applyValid && styles.btnDisabled]}
              disabled={!applyValid}
              onPress={() => setStep('confirm')}
            >
              <Text style={[styles.btnText, { color: '#F8F7F4' }]}>Submit Application</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* ── CONFIRM ───────────────────────────────────────────────────────────── */}
      {step === 'confirm' && (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
          <View style={styles.confirmBody}>
            <View style={styles.confirmIcon}>
              <IconSymbol name="checkmark" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.confirmTitle}>Application received.</Text>
            <Text style={styles.confirmSub}>
              We'll review your institution and send you an invite code within 48 hours.
            </Text>
          </View>

          <View style={[styles.applyFooter, { paddingBottom: insets.bottom + 24 }]}>
            <Pressable
              style={[styles.btn, styles.btnFilled]}
              onPress={() => setStep('route')}
            >
              <Text style={[styles.btnText, { color: '#F8F7F4' }]}>Done</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ── AUTH ──────────────────────────────────────────────────────────────── */}
      {step === 'auth' && (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
          <View style={styles.stepNav}>
            <Pressable style={styles.navBtn} onPress={() => setStep('route')} hitSlop={12}>
              <IconSymbol name="chevron.left" size={22} color="#1A1A1A" />
            </Pressable>
          </View>

          <View style={styles.authTop}>
            <Image source={KX_LOGO} style={styles.authLogo} resizeMode="contain" />
            <Text style={styles.authTitle}>
              {matchedOrg ? `Join ${matchedOrg.name}` : 'Create your account'}
            </Text>
            <Text style={styles.authSubtitle}>Choose how you'd like to sign in.</Text>
          </View>

          <View style={[styles.authBottom, { paddingBottom: insets.bottom + 32 }]}>
            <Pressable
              style={({ pressed }) => [styles.btn, styles.btnFilled, pressed && { opacity: 0.8 }]}
              onPress={() => handleContinue()}
            >
              <IconSymbol name="apple.logo" size={18} color="#F8F7F4" />
              <Text style={[styles.btnText, { color: '#F8F7F4' }]}>Continue with Apple</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.btn, styles.btnOutlined, pressed && { opacity: 0.8 }]}
              onPress={() => handleContinue()}
            >
              <IconSymbol name="globe" size={18} color="#1A1A1A" />
              <Text style={[styles.btnText, { color: '#1A1A1A' }]}>Continue with Google</Text>
            </Pressable>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
            <Pressable
              style={({ pressed }) => [styles.btn, styles.btnOutlined, pressed && { opacity: 0.8 }]}
              onPress={() => handleContinue()}
            >
              <IconSymbol name="phone.fill" size={18} color="#1A1A1A" />
              <Text style={[styles.btnText, { color: '#1A1A1A' }]}>Continue with Phone</Text>
            </Pressable>
            <Text style={styles.termsText}>
              By continuing, you agree to KaNeXT's Terms of Service and Privacy Policy.
            </Text>
          </View>
        </View>
      )}

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F7F4',
    justifyContent: 'space-between',
  },

  // ── Nav ──
  stepNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: 52,
  },
  navBtn: {
    width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Route ──
  routeMiddle: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 16,
  },
  routeLogoWrap: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  routeLogo: { width: 96, height: 96 },
  routeTitle: {
    fontSize: 12, fontWeight: '600', color: 'rgba(0,0,0,0.30)',
    textAlign: 'center', letterSpacing: 2, textTransform: 'uppercase',
  },
  routeInput: {
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.10)',
    borderRadius: 14, height: 56,
    justifyContent: 'center', paddingHorizontal: 16,
  },
  routeInputFocused: { borderColor: '#4A6D8C' },
  routeTextInput: { fontSize: 15, color: '#1A1A1A' },

  // ── Org match card ──
  orgCard: { borderRadius: 14, overflow: 'hidden' },
  orgCardInner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 16,
  },
  orgCardAvatar: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  orgCardInitials: { fontSize: 14, fontWeight: '700', color: 'rgba(0,0,0,0.52)' },
  orgCardInfo: { flex: 1, minWidth: 0 },
  orgCardName: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  orgCardMeta: { fontSize: 12, color: 'rgba(0,0,0,0.40)', marginTop: 2 },

  // ── Apply ──
  applyScroll: { flex: 1 },
  applyContent: { paddingHorizontal: 28, paddingTop: 8 },
  applyHeading: {
    fontSize: 26, fontWeight: '600', color: '#1A1A1A',
    lineHeight: 34, marginBottom: 32,
  },
  applyFieldWrap: { marginBottom: 24 },
  applyLabel: {
    fontSize: 11, fontWeight: '600', color: 'rgba(0,0,0,0.35)',
    letterSpacing: 0.8, marginBottom: 8,
  },
  applyField: {
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.10)',
    borderRadius: 14, height: 52,
    justifyContent: 'center', paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  applyInput: { fontSize: 15, color: '#1A1A1A' },
  applyFooter: { paddingHorizontal: 28, paddingTop: 12, backgroundColor: '#F8F7F4' },

  // ── Mode grid ──
  modeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  modeCard: {
    flex: 1, minWidth: '45%',
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 14,
  },
  modeCardActive: {
    borderColor: '#1A1A1A',
    backgroundColor: '#F8F7F4',
  },
  modeLabel: { fontSize: 14, fontWeight: '500', color: 'rgba(0,0,0,0.45)' },
  modeLabelActive: { color: '#1A1A1A', fontWeight: '600' },

  // ── Confirm ──
  confirmBody: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 36,
  },
  confirmIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#5A8A6E',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  confirmTitle: {
    fontSize: 24, fontWeight: '600', color: '#1A1A1A',
    textAlign: 'center', marginBottom: 12,
  },
  confirmSub: {
    fontSize: 15, color: 'rgba(0,0,0,0.45)',
    textAlign: 'center', lineHeight: 22,
  },

  // ── Auth ──
  authTop: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 28,
  },
  authLogo: { width: 72, height: 72, marginBottom: 20 },
  authTitle: {
    fontSize: 24, fontWeight: '600', color: '#1A1A1A',
    textAlign: 'center', marginBottom: 8,
  },
  authSubtitle: { fontSize: 14, color: 'rgba(0,0,0,0.45)', textAlign: 'center' },
  authBottom: { paddingHorizontal: 28, gap: 12 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.08)' },
  dividerText: { fontSize: 12, color: 'rgba(0,0,0,0.25)' },
  termsText: {
    fontSize: 11, color: 'rgba(0,0,0,0.25)',
    textAlign: 'center', lineHeight: 16,
  },

  // ── Buttons ──
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, paddingVertical: 15, paddingHorizontal: 20, gap: 10,
  },
  btnFilled: { backgroundColor: '#1A1A1A' },
  btnOutlined: { borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.10)', backgroundColor: 'transparent' },
  btnDisabled: { backgroundColor: 'rgba(0,0,0,0.10)' },
  btnText: { fontSize: 15, fontWeight: '600' },
});
