/**
 * Auth + Onboarding Flow
 *
 * Admin:  Route → Auth → Choose Mode → Name Org → Home
 * Member: Route → Auth → Home (org auto-joined from domain/code match)
 * Returning: skip entirely (isAuthenticated && !isNewUser)
 *
 * Handle auto-generated from auth provider name — zero manual input.
 * Full screen #F8F7F4. Fades to Home on completion.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, Image,
  KeyboardAvoidingView, Platform, Animated, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/auth-context';
import { useAppContext } from '@/context/app-context';
import type { AuthProvider, Mode, Organization } from '@/types';

const KX_LOGO = require('@/assets/images/kx-logo.png');

// ── Domain / invite-code registry ─────────────────────────────────────────────

type OrgMatch = {
  name: string;
  mode: Mode;
  orgType: string;
  modeLabel: string;
};

const DOMAIN_REGISTRY: Record<string, OrgMatch> = {
  'lincolnu.edu': { name: 'Lincoln University', mode: 'sports',    orgType: 'college_athletics', modeLabel: 'Sports' },
  'howard.edu':   { name: 'Howard University',  mode: 'education', orgType: 'university',        modeLabel: 'Education' },
  'kanext.io':    { name: 'KaNeXT',             mode: 'business',  orgType: 'platform',          modeLabel: 'Business' },
  'iccla.org':    { name: 'ICC',                mode: 'community', orgType: 'faith',             modeLabel: 'Community' },
};

const CODE_REGISTRY: Record<string, OrgMatch> = {
  'LU2026': { name: 'Lincoln University', mode: 'sports',    orgType: 'college_athletics', modeLabel: 'Sports' },
  'HU2026': { name: 'Howard University',  mode: 'education', orgType: 'university',        modeLabel: 'Education' },
  'KX2026': { name: 'KaNeXT',             mode: 'business',  orgType: 'platform',          modeLabel: 'Business' },
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

// ── Org creation ───────────────────────────────────────────────────────────────

const ORG_MODE_CARDS: { mode: Mode; icon: IconSymbolName; label: string; desc: string }[] = [
  { mode: 'business',  icon: 'briefcase.fill',    label: 'Business',  desc: 'Companies, startups, agencies, nonprofits' },
  { mode: 'education', icon: 'graduationcap.fill', label: 'Education', desc: 'Schools, universities, training programs' },
  { mode: 'sports',    icon: 'trophy.fill',        label: 'Sports',    desc: 'Teams, athletics, leagues, clubs' },
  { mode: 'community', icon: 'person.3.fill',      label: 'Community', desc: 'Churches, nonprofits, civic organizations' },
];

const ORG_TYPE: Partial<Record<Mode, string>> = {
  business: 'platform', education: 'university',
  sports: 'college_athletics', community: 'faith',
};

// ── Types ──────────────────────────────────────────────────────────────────────

type Step = 'route' | 'auth' | 'choose-mode' | 'name-org';

interface AuthModalProps { visible: boolean; }

// ── Component ──────────────────────────────────────────────────────────────────

export function AuthModal({ visible }: AuthModalProps) {
  const { signIn, state: authState, completeOnboarding } = useAuth();
  const { setOrganization, switchMode } = useAppContext();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>('route');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  /** Fade to 0 → completeOnboarding → modal unmounts, home tabs revealed */
  const fadeOutAndNavigate = useCallback(() => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 380, useNativeDriver: true })
      .start(async () => { await completeOnboarding(); });
  }, [fadeAnim, completeOnboarding]);

  // ── Route step state ──
  const [routeInput, setRouteInput] = useState('');
  const [routeInputFocused, setRouteInputFocused] = useState(false);
  const [matchedOrg, setMatchedOrg] = useState<OrgMatch | null>(null);
  const cardAnim = useRef(new Animated.Value(0)).current;

  // ── Choose Mode state ──
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);

  // ── Name Org state ──
  const [orgName, setOrgName] = useState('');
  const [orgDisplayName, setOrgDisplayName] = useState('');
  const [orgNameFocused, setOrgNameFocused] = useState(false);
  const [orgDisplayFocused, setOrgDisplayFocused] = useState(false);

  // Org card spring animation
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
      if (authState.isAuthenticated && authState.isNewUser) {
        // App restarted mid-onboarding — skip route/auth, go to create org
        setStep('choose-mode');
      } else if (!authState.isAuthenticated) {
        setStep('route');
        setRouteInput('');
        setMatchedOrg(null);
        setSelectedMode(null);
        setOrgName('');
        setOrgDisplayName('');
      }
    }
  }, [visible, authState.isAuthenticated, authState.isNewUser, fadeAnim]);

  const handleRouteInputChange = (text: string) => {
    setRouteInput(text);
    setMatchedOrg(checkRouteInput(text));
  };

  const handleAuthPress = async (provider: AuthProvider) => {
    await signIn(provider);
    if (matchedOrg) {
      // Matched org — set context and complete
      const org: Organization = {
        id: `org_${Date.now()}`,
        name: matchedOrg.name,
        mode: matchedOrg.mode,
        type: matchedOrg.orgType,
        location: '',
        description: matchedOrg.name,
      };
      setOrganization(org);
      switchMode(matchedOrg.mode);
      fadeOutAndNavigate();
    } else {
      // New admin — go to create org flow
      setStep('choose-mode');
    }
  };

  const handleCreateOrg = useCallback(() => {
    if (!selectedMode || orgName.trim().length < 2) return;
    const newOrg: Organization = {
      id: `org_${Date.now()}`,
      name: orgName.trim(),
      mode: selectedMode,
      type: ORG_TYPE[selectedMode] ?? selectedMode,
      location: '',
      description: orgDisplayName.trim() || orgName.trim(),
    };
    setOrganization(newOrg);
    switchMode(selectedMode);
    fadeOutAndNavigate();
  }, [selectedMode, orgName, orgDisplayName, setOrganization, switchMode, fadeOutAndNavigate]);

  if (!visible) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim }]}>

      {/* ── ROUTE ─────────────────────────────────────────────────────────────── */}
      {step === 'route' && (
        <KeyboardAvoidingView
          style={[styles.screen, { paddingTop: insets.top + 8 }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Logo + title */}
          <View style={styles.routeTop}>
            <Image source={KX_LOGO} style={styles.routeLogo} resizeMode="contain" />
            <Text style={styles.routeTitle}>Sign in to KaNeXT</Text>
          </View>

          {/* Input + org card + skip */}
          <View style={styles.routeMiddle}>
            <View style={[styles.routeInput, routeInputFocused && styles.routeInputFocused]}>
              <TextInput
                style={styles.routeTextInput}
                value={routeInput}
                onChangeText={handleRouteInputChange}
                onFocus={() => setRouteInputFocused(true)}
                onBlur={() => setRouteInputFocused(false)}
                placeholder="Enter your work email or invite code"
                placeholderTextColor="rgba(0,0,0,0.25)"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                autoFocus
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

            <Pressable onPress={() => setStep('auth')} hitSlop={8} style={styles.skipLink}>
              <Text style={styles.skipLinkText}>I don't have an email or code</Text>
            </Pressable>
          </View>

          {/* Continue */}
          <View style={[styles.stepBtnWrap, { paddingBottom: insets.bottom + 32 }]}>
            <Pressable
              style={({ pressed }) => [
                styles.btn, styles.btnFilled,
                routeInput.trim().length === 0 && styles.btnDisabled,
                pressed && { opacity: 0.8 },
              ]}
              disabled={routeInput.trim().length === 0}
              onPress={() => setStep('auth')}
            >
              <Text style={styles.btnTextLight}>Continue</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
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
            <Text style={styles.authSubtitle}>
              {matchedOrg
                ? `Continue to ${matchedOrg.modeLabel}`
                : 'Your intelligent operating system'}
            </Text>
          </View>

          <View style={[styles.authBottom, { paddingBottom: insets.bottom + 32 }]}>
            <Pressable
              style={({ pressed }) => [styles.btn, styles.btnFilled, pressed && { opacity: 0.8 }]}
              onPress={() => handleAuthPress('apple')}
            >
              <IconSymbol name="apple.logo" size={18} color="#F8F7F4" />
              <Text style={[styles.btnText, { color: '#F8F7F4' }]}>Continue with Apple</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.btn, styles.btnOutlined, pressed && { opacity: 0.8 }]}
              onPress={() => handleAuthPress('google')}
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
              onPress={() => handleAuthPress('phone')}
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

      {/* ── CHOOSE MODE ───────────────────────────────────────────────────────── */}
      {step === 'choose-mode' && (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
          {/* No back button per spec */}
          <View style={[styles.stepNav, { minHeight: 20 }]} />

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.stepContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.sectionTitle}>Create an organization</Text>
            <Text style={[styles.sectionSub, { marginBottom: 28 }]}>
              What type of institution are you building?
            </Text>
            <View style={styles.modeCardsGrid}>
              {ORG_MODE_CARDS.map((card) => {
                const isSel = selectedMode === card.mode;
                return (
                  <Pressable
                    key={card.mode}
                    style={[styles.modeCard, isSel && styles.modeCardSelected]}
                    onPress={() => setSelectedMode(card.mode)}
                  >
                    <View style={[styles.modeCardIcon, isSel && styles.modeCardIconSelected]}>
                      <IconSymbol name={card.icon} size={22} color={isSel ? '#F8F7F4' : '#1A1A1A'} />
                    </View>
                    <Text style={[styles.modeCardLabel, isSel && styles.modeCardLabelSel]}>
                      {card.label}
                    </Text>
                    <Text style={styles.modeCardDesc}>{card.desc}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={[styles.stepBtnWrap, { paddingBottom: insets.bottom + 32 }]}>
            <Pressable
              style={({ pressed }) => [
                styles.btn, styles.btnFilled,
                !selectedMode && styles.btnDisabled,
                pressed && { opacity: 0.8 },
              ]}
              disabled={!selectedMode}
              onPress={() => setStep('name-org')}
            >
              <Text style={styles.btnTextLight}>Continue</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ── NAME ORG ──────────────────────────────────────────────────────────── */}
      {step === 'name-org' && (
        <KeyboardAvoidingView
          style={[styles.screen, { paddingTop: insets.top }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.stepNav}>
            <Pressable style={styles.navBtn} onPress={() => setStep('choose-mode')} hitSlop={12}>
              <IconSymbol name="chevron.left" size={22} color="#1A1A1A" />
            </Pressable>
          </View>

          <View style={[styles.stepContent, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>Name your organization</Text>
            <Text style={[styles.sectionSub, { marginBottom: 28 }]}>
              You can update this later in settings.
            </Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>ORGANIZATION NAME</Text>
              <TextInput
                style={[styles.fieldInput, orgNameFocused && styles.fieldFocused]}
                value={orgName}
                onChangeText={setOrgName}
                onFocus={() => setOrgNameFocused(true)}
                onBlur={() => setOrgNameFocused(false)}
                placeholder="Lincoln University"
                placeholderTextColor="rgba(0,0,0,0.25)"
                autoCapitalize="words"
                autoCorrect={false}
                autoFocus
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>DISPLAY NAME</Text>
              <TextInput
                style={[styles.fieldInput, orgDisplayFocused && styles.fieldFocused]}
                value={orgDisplayName}
                onChangeText={setOrgDisplayName}
                onFocus={() => setOrgDisplayFocused(true)}
                onBlur={() => setOrgDisplayFocused(false)}
                placeholder="Lincoln"
                placeholderTextColor="rgba(0,0,0,0.25)"
                autoCapitalize="words"
                autoCorrect={false}
              />
              <Text style={styles.fieldHint}>Short name shown in the app.</Text>
            </View>
          </View>

          <View style={[styles.stepBtnWrap, { paddingBottom: insets.bottom + 32 }]}>
            <Pressable
              style={({ pressed }) => [
                styles.btn, styles.btnFilled,
                orgName.trim().length < 2 && styles.btnDisabled,
                pressed && { opacity: 0.8 },
              ]}
              disabled={orgName.trim().length < 2}
              onPress={handleCreateOrg}
            >
              <Text style={styles.btnTextLight}>Create organization</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
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

  // ── Step chrome ──
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
  stepContent: { paddingHorizontal: 28 },
  stepBtnWrap: { paddingHorizontal: 28 },

  // ── Route ──
  routeTop: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 28,
    gap: 16,
  },
  routeLogo: { width: 64, height: 64 },
  routeTitle: {
    fontSize: 26, fontWeight: '600', color: '#1A1A1A', textAlign: 'center',
  },
  routeMiddle: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 12,
  },
  routeInput: {
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.10)',
    borderRadius: 14, height: 56,
    justifyContent: 'center', paddingHorizontal: 16,
  },
  routeInputFocused: { borderColor: '#4A6D8C' },
  routeTextInput: { fontSize: 15, color: '#1A1A1A' },

  // Org match card
  orgCard: {
    borderRadius: 14,
    overflow: 'hidden',
  },
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

  skipLink: { alignSelf: 'center' },
  skipLinkText: { fontSize: 13, color: 'rgba(0,0,0,0.45)', textDecorationLine: 'underline' },

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

  // ── Shared form ──
  sectionTitle: { fontSize: 26, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  sectionSub: { fontSize: 14, color: 'rgba(0,0,0,0.45)' },
  fieldGroup: { gap: 6, marginBottom: 20 },
  fieldLabel: {
    fontSize: 12, fontWeight: '600',
    color: 'rgba(0,0,0,0.45)', letterSpacing: 0.5,
  },
  fieldInput: {
    fontSize: 15, color: '#1A1A1A',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.10)',
    borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16,
  },
  fieldFocused: { borderColor: '#4A6D8C' },
  fieldHint: { fontSize: 12, color: 'rgba(0,0,0,0.35)', marginTop: 4 },

  // ── Mode cards ──
  modeCardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  modeCard: {
    width: '47%',
    borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.10)',
    borderRadius: 16, padding: 16, gap: 8,
    backgroundColor: '#FFFFFF',
  },
  modeCardSelected: { borderColor: '#4A6D8C', backgroundColor: '#F0F4F8' },
  modeCardIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  modeCardIconSelected: { backgroundColor: '#4A6D8C' },
  modeCardLabel: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  modeCardLabelSel: { color: '#4A6D8C' },
  modeCardDesc: { fontSize: 12, color: 'rgba(0,0,0,0.40)', lineHeight: 17 },

  // ── Shared buttons ──
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, paddingVertical: 15, paddingHorizontal: 20, gap: 10,
  },
  btnFilled: { backgroundColor: '#1A1A1A' },
  btnOutlined: { borderWidth: 1, borderColor: 'rgba(0,0,0,0.10)', backgroundColor: 'transparent' },
  btnDisabled: { opacity: 0.25 },
  btnText: { fontSize: 15, fontWeight: '600' },
  btnTextLight: { fontSize: 16, fontWeight: '600', color: '#F8F7F4' },
});
