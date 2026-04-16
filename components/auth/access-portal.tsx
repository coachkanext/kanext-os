/**
 * KaNeXT Access Portal — Invite-Code Onboarding Flow
 *
 * Screen flow:
 *   portal → (invalid code) fomo-video → request-access → request-confirm → portal
 *   portal → (valid code)   confidentiality → email-auth → email-verify → account-setup → personalized-video → app
 *
 * Design: Monochrome design system (useColors). No blue. No accent. See use-colors.ts.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useAuth } from '@/context/auth-context';
import { useAppContext } from '@/context/app-context';

// ── Assets ───────────────────────────────────────────────────────────────────

const KX_LOGO = require('@/assets/images/kx-logo.png');

// ── Valid codes ───────────────────────────────────────────────────────────────

const VALID_CODES = new Set([
  'KX2026', 'TOM2026', 'PBD2026', 'LINDY2026', 'VINCE2026', 'RAY2026',
  'KX-INVESTOR-2026', 'KX-SEED-ROUND', 'KX-PBD-001',
  'LU2026', 'LU2026MBB', 'ICCLA2026',
]);

// ── Code-specific personalized video titles ───────────────────────────────────

const CODE_VIDEO_TITLE: Record<string, string> = {
  TOM2026:          'Welcome, Tom',
  PBD2026:          'Welcome to KaNeXT',
  LINDY2026:        'Welcome, Lindy',
  VINCE2026:        'Welcome, Vince',
  RAY2026:          'Welcome, Ray',
  'KX-INVESTOR-2026': 'Welcome, Investor',
  'KX-SEED-ROUND':  'Welcome to the Round',
  'KX-PBD-001':     'Welcome to KaNeXT',
  LU2026:           'Welcome, Lincoln University (CA)',
  LU2026MBB:        'Welcome, LU Basketball',
  ICCLA2026:        'Welcome, ICCLA',
};

// ── Types ─────────────────────────────────────────────────────────────────────

type OnboardStep =
  | 'portal'
  | 'fomo-video'
  | 'request-access'
  | 'request-confirm'
  | 'confidentiality'
  | 'email-auth'
  | 'email-verify'
  | 'account-setup'
  | 'personalized-video';

export interface AccessPortalProps {
  visible: boolean;
}

// ── Password validation helpers ───────────────────────────────────────────────

function hasMinLength(pw: string): boolean { return pw.length >= 8; }
function hasNumber(pw: string): boolean { return /\d/.test(pw); }
function hasUppercase(pw: string): boolean { return /[A-Z]/.test(pw); }

// ── Component ─────────────────────────────────────────────────────────────────

export function AccessPortal({ visible }: AccessPortalProps) {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completeOnboarding, signIn } = useAuth();
  const { switchMode } = useAppContext();

  // ── Step state ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState<OnboardStep>('portal');

  // ── Portal ──────────────────────────────────────────────────────────────────
  const [codeInput, setCodeInput] = useState('');
  const [enteredCode, setEnteredCode] = useState('');

  // ── Request access form ─────────────────────────────────────────────────────
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqCompany, setReqCompany] = useState('');

  // ── Email auth ──────────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');

  // ── Email verify (OTP) ──────────────────────────────────────────────────────
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendVisible, setResendVisible] = useState(false);
  const otpRefs = useRef<(TextInput | null)[]>([null, null, null, null, null, null]);

  // ── Account setup ───────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Animations ──────────────────────────────────────────────────────────────
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ── Resend timer for email-verify ───────────────────────────────────────────
  useEffect(() => {
    if (step === 'email-verify') {
      setResendVisible(false);
      const t = setTimeout(() => setResendVisible(true), 30000);
      return () => clearTimeout(t);
    }
  }, [step]);

  // ── Auto-return to portal after request-confirm ─────────────────────────────
  useEffect(() => {
    if (step === 'request-confirm') {
      const t = setTimeout(() => {
        resetAllState();
        transitionTo('portal');
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [step]);

  // ── Auto-advance after fomo-video ───────────────────────────────────────────
  useEffect(() => {
    if (step === 'fomo-video') {
      const t = setTimeout(() => transitionTo('request-access'), 3000);
      return () => clearTimeout(t);
    }
  }, [step]);

  // ── Reset all form state ────────────────────────────────────────────────────
  const resetAllState = useCallback(() => {
    setCodeInput('');
    setEnteredCode('');
    setReqName('');
    setReqEmail('');
    setReqCompany('');
    setEmail('');
    setOtp(['', '', '', '', '', '']);
    setResendVisible(false);
    setFirstName('');
    setLastName('');
    setUsername('');
    setPassword('');
    setShowPassword(false);
  }, []);

  // ── Transition ──────────────────────────────────────────────────────────────
  const transitionTo = useCallback((next: OnboardStep) => {
    Animated.timing(screenOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setStep(next);
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  }, [screenOpacity]);

  // ── Shake animation (invalid code) ─────────────────────────────────────────
  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,  duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,  duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -4, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 40, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  // ── Pulse animation (valid code) ────────────────────────────────────────────
  const triggerPulse = useCallback((onComplete: () => void) => {
    pulseAnim.setValue(1);
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.02, duration: 150, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1,    duration: 150, useNativeDriver: true }),
    ]).start(onComplete);
  }, [pulseAnim]);

  // ── Handle code submit ──────────────────────────────────────────────────────
  const handleCodeSubmit = useCallback(() => {
    const code = codeInput.trim().toUpperCase();
    if (!code) return;

    if (VALID_CODES.has(code)) {
      setEnteredCode(code);
      triggerPulse(() => {
        setTimeout(() => transitionTo('confidentiality'), 50);
      });
    } else {
      triggerShake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => transitionTo('fomo-video'), 800);
    }
  }, [codeInput, triggerPulse, triggerShake, transitionTo]);

  // ── Handle OTP digit input ──────────────────────────────────────────────────
  const handleOtpChange = useCallback((text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-advance when all 6 digits filled
    if (newOtp.every(d => d !== '')) {
      setTimeout(() => transitionTo('account-setup'), 200);
    }
  }, [otp, transitionTo]);

  // ── Handle OTP backspace to go back ────────────────────────────────────────
  const handleOtpKeyPress = useCallback((key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  // ── Account setup validation ────────────────────────────────────────────────
  const accountValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    username.trim().length > 0 &&
    hasMinLength(password) &&
    hasNumber(password) &&
    hasUppercase(password);

  // ── Complete onboarding and enter app ──────────────────────────────────────
  const completeAndEnter = useCallback(async () => {
    await signIn('apple');
    await completeOnboarding();
    switchMode('business');
    router.replace('/(tabs)/(main)' as any);
  }, [signIn, completeOnboarding, switchMode, router]);

  // ── Render guard ────────────────────────────────────────────────────────────
  if (!visible) return null;

  // ── Shared styles built from C ──────────────────────────────────────────────
  const inputStyle = {
    backgroundColor: C.surface,
    borderColor: C.separator,
    color: C.label,
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: C.bg, zIndex: 9999, opacity: screenOpacity },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >

        {/* ── SCREEN 1: Portal ──────────────────────────────────────────────── */}
        {step === 'portal' && (
          <View style={[styles.screen, { paddingTop: insets.top }]}>
            {/* Centered content */}
            <View style={styles.portalCenter}>
              <Image
                source={KX_LOGO}
                style={[styles.logoLarge, { tintColor: C.label }]}
                resizeMode="contain"
              />
              <View style={{ height: 40 }} />
              <Animated.View
                style={[
                  styles.codeInputWrap,
                  {
                    transform: [
                      { translateX: shakeAnim },
                      { scale: pulseAnim },
                    ],
                  },
                ]}
              >
                <TextInput
                  style={[styles.codeInput, inputStyle]}
                  value={codeInput}
                  onChangeText={setCodeInput}
                  placeholder=""
                  placeholderTextColor={C.secondary}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleCodeSubmit}
                  textAlign="center"
                />
              </Animated.View>
            </View>

            {/* Bottom links */}
            <View style={[styles.portalFooter, { paddingBottom: insets.bottom + 24 }]}>
              <Pressable
                hitSlop={12}
                onPress={() => transitionTo('request-access')}
              >
                <Text style={[styles.textLink, { color: C.secondary }]}>
                  Request access
                </Text>
              </Pressable>
              <View style={{ height: 10 }} />
              <Pressable
                hitSlop={12}
                onPress={() => transitionTo('email-auth')}
              >
                <Text style={[styles.textLink, { color: C.secondary }]}>
                  Sign in
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── SCREEN 2A: FOMO Video ─────────────────────────────────────────── */}
        {step === 'fomo-video' && (
          <View style={styles.videoScreen}>
            {/* Skip button */}
            <Pressable
              style={[styles.skipBtn, { top: insets.top + 12 }]}
              onPress={() => transitionTo('request-access')}
              hitSlop={12}
            >
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>

            {/* Video placeholder */}
            <View style={styles.videoContent}>
              <Text style={styles.videoTitle}>KaNeXT</Text>
              <View style={{ height: 12 }} />
              <Text style={styles.videoSubtitle}>
                The Operating System for Every Institution
              </Text>
            </View>
          </View>
        )}

        {/* ── SCREEN 3: Request Access ──────────────────────────────────────── */}
        {step === 'request-access' && (
          <View style={[styles.screen, { paddingTop: insets.top }]}>
            <ScrollView
              contentContainerStyle={[
                styles.formContent,
                { paddingBottom: insets.bottom + 120 },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Logo small */}
              <View style={styles.logoSmallWrap}>
                <Image
                  source={KX_LOGO}
                  style={[styles.logoSmall, { tintColor: C.label }]}
                  resizeMode="contain"
                />
              </View>

              <Text style={[styles.screenTitle, { color: C.label }]}>
                Request Access
              </Text>
              <View style={{ height: 24 }} />

              {/* Name */}
              <TextInput
                style={[styles.formInput, inputStyle]}
                value={reqName}
                onChangeText={setReqName}
                placeholder="Name"
                placeholderTextColor={C.secondary}
                autoCorrect={false}
                returnKeyType="next"
              />
              <View style={{ height: 12 }} />

              {/* Email */}
              <TextInput
                style={[styles.formInput, inputStyle]}
                value={reqEmail}
                onChangeText={setReqEmail}
                placeholder="Email"
                placeholderTextColor={C.secondary}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
              />
              <View style={{ height: 12 }} />

              {/* Company */}
              <TextInput
                style={[styles.formInput, inputStyle]}
                value={reqCompany}
                onChangeText={setReqCompany}
                placeholder="Company / Organization"
                placeholderTextColor={C.secondary}
                autoCorrect={false}
                returnKeyType="done"
              />
            </ScrollView>

            {/* Submit button */}
            <View
              style={[
                styles.footerBtn,
                { paddingBottom: insets.bottom + 24, backgroundColor: C.bg },
              ]}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: C.label, opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={() => transitionTo('request-confirm')}
              >
                <Text style={[styles.primaryBtnText, { color: C.bg }]}>
                  Submit
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── SCREEN 4: Request Confirm ─────────────────────────────────────── */}
        {step === 'request-confirm' && (
          <View style={[styles.screen, { backgroundColor: C.bg }]}>
            <View style={styles.centeredBody}>
              <Text style={[styles.confirmTitle, { color: C.label }]}>
                Request received.
              </Text>
              <View style={{ height: 8 }} />
              <Text style={[styles.confirmSub, { color: C.secondary }]}>
                {"We'll be in touch."}
              </Text>
            </View>
          </View>
        )}

        {/* ── SCREEN 5: Confidentiality ─────────────────────────────────────── */}
        {step === 'confidentiality' && (
          <View style={[styles.screen, { paddingTop: insets.top }]}>
            <ScrollView
              contentContainerStyle={[
                styles.formContent,
                { paddingBottom: insets.bottom + 120 },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Logo small */}
              <View style={styles.logoSmallWrap}>
                <Image
                  source={KX_LOGO}
                  style={[styles.logoSmall, { tintColor: C.label }]}
                  resizeMode="contain"
                />
              </View>

              <Text style={[styles.screenTitle, { color: C.label, fontWeight: '500' }]}>
                Confidential
              </Text>
              <View style={{ height: 20 }} />

              <Text style={[styles.ndaBody, { color: C.label }]}>
                The information you are about to access is proprietary and
                confidential. By continuing, you agree not to distribute,
                reproduce, or share any materials, data, or intelligence
                accessed through this platform without the express written
                consent of KaNeXT LLC.
              </Text>
            </ScrollView>

            {/* Buttons */}
            <View
              style={[
                styles.footerBtn,
                { paddingBottom: insets.bottom + 24, backgroundColor: C.bg },
              ]}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: C.label, opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={() => transitionTo('email-auth')}
              >
                <Text style={[styles.primaryBtnText, { color: C.bg }]}>
                  I Agree
                </Text>
              </Pressable>
              <View style={{ height: 14 }} />
              <Pressable
                hitSlop={12}
                onPress={() => transitionTo('portal')}
              >
                <Text style={[styles.textLink, { color: C.secondary }]}>
                  Decline
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── SCREEN 6: Email Auth ──────────────────────────────────────────── */}
        {step === 'email-auth' && (
          <View style={[styles.screen, { paddingTop: insets.top }]}>
            <View style={styles.formContent}>
              {/* Logo small */}
              <View style={styles.logoSmallWrap}>
                <Image
                  source={KX_LOGO}
                  style={[styles.logoSmall, { tintColor: C.label }]}
                  resizeMode="contain"
                />
              </View>

              <Text style={[styles.screenTitleMedium, { color: C.label }]}>
                Enter your email
              </Text>
              <View style={{ height: 20 }} />

              {/* Email input with arrow button */}
              <View
                style={[
                  styles.emailInputRow,
                  {
                    backgroundColor: C.surface,
                    borderColor: C.separator,
                  },
                ]}
              >
                <TextInput
                  style={[styles.emailInputField, { color: C.label }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@email.com"
                  placeholderTextColor={C.secondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="go"
                  onSubmitEditing={() => email.trim() && transitionTo('email-verify')}
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.emailArrowBtn,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                  onPress={() => email.trim() && transitionTo('email-verify')}
                >
                  <IconSymbol name="arrow.right" size={18} color={C.label} />
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* ── SCREEN 7: Email Verify (OTP) ─────────────────────────────────── */}
        {step === 'email-verify' && (
          <View style={[styles.screen, { paddingTop: insets.top }]}>
            <View style={styles.formContent}>
              {/* Logo small */}
              <View style={styles.logoSmallWrap}>
                <Image
                  source={KX_LOGO}
                  style={[styles.logoSmall, { tintColor: C.label }]}
                  resizeMode="contain"
                />
              </View>

              <Text style={[styles.screenTitleMedium, { color: C.label }]}>
                Check your email
              </Text>
              <View style={{ height: 8 }} />
              <Text style={[styles.subtitleText, { color: C.secondary }]}>
                We sent a verification code to {email}
              </Text>
              <View style={{ height: 28 }} />

              {/* OTP boxes */}
              <View style={styles.otpRow}>
                {otp.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    style={[
                      styles.otpBox,
                      {
                        backgroundColor: C.surface,
                        borderColor: C.separator,
                        color: C.label,
                      },
                    ]}
                    value={digit}
                    onChangeText={text => handleOtpChange(text, i)}
                    onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, i)}
                    maxLength={1}
                    keyboardType="number-pad"
                    textAlign="center"
                    autoFocus={i === 0}
                  />
                ))}
              </View>

              {/* Resend code */}
              {resendVisible && (
                <View style={{ marginTop: 24, alignItems: 'center' }}>
                  <Pressable hitSlop={12} onPress={() => setResendVisible(false)}>
                    <Text style={[styles.textLink, { color: C.secondary }]}>
                      Resend code
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── SCREEN 8: Account Setup ───────────────────────────────────────── */}
        {step === 'account-setup' && (
          <View style={[styles.screen, { paddingTop: insets.top }]}>
            <ScrollView
              contentContainerStyle={[
                styles.formContent,
                { paddingBottom: insets.bottom + 120 },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Logo small */}
              <View style={styles.logoSmallWrap}>
                <Image
                  source={KX_LOGO}
                  style={[styles.logoSmall, { tintColor: C.label }]}
                  resizeMode="contain"
                />
              </View>

              <Text style={[styles.screenTitleMedium, { color: C.label }]}>
                Set up your account
              </Text>
              <View style={{ height: 20 }} />

              {/* First name */}
              <TextInput
                style={[styles.formInput, inputStyle]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor={C.secondary}
                autoCorrect={false}
                returnKeyType="next"
              />
              <View style={{ height: 12 }} />

              {/* Last name */}
              <TextInput
                style={[styles.formInput, inputStyle]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor={C.secondary}
                autoCorrect={false}
                returnKeyType="next"
              />
              <View style={{ height: 12 }} />

              {/* Username with @ prefix */}
              <View
                style={[
                  styles.prefixInputRow,
                  {
                    backgroundColor: C.surface,
                    borderColor: C.separator,
                  },
                ]}
              >
                <Text style={[styles.inputPrefix, { color: C.secondary }]}>@</Text>
                <TextInput
                  style={[styles.prefixInputField, { color: C.label }]}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="username"
                  placeholderTextColor={C.secondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
              <View style={{ height: 12 }} />

              {/* Password with show/hide */}
              <View
                style={[
                  styles.prefixInputRow,
                  {
                    backgroundColor: C.surface,
                    borderColor: C.separator,
                  },
                ]}
              >
                <TextInput
                  style={[styles.prefixInputField, { color: C.label }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor={C.secondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                />
                <Pressable
                  hitSlop={10}
                  onPress={() => setShowPassword(v => !v)}
                  style={{ paddingHorizontal: 4 }}
                >
                  <IconSymbol
                    name={showPassword ? 'eye.slash' : 'eye'}
                    size={18}
                    color={C.secondary}
                  />
                </Pressable>
              </View>

              {/* Password requirements */}
              <View style={{ marginTop: 10, gap: 4 }}>
                <PasswordReq
                  met={hasMinLength(password)}
                  label="8+ characters"
                  gainColor="#5A8A6E"
                  driftColor={C.secondary}
                />
                <PasswordReq
                  met={hasNumber(password)}
                  label="One number"
                  gainColor="#5A8A6E"
                  driftColor={C.secondary}
                />
                <PasswordReq
                  met={hasUppercase(password)}
                  label="One uppercase letter"
                  gainColor="#5A8A6E"
                  driftColor={C.secondary}
                />
              </View>
            </ScrollView>

            {/* Continue button */}
            <View
              style={[
                styles.footerBtn,
                { paddingBottom: insets.bottom + 24, backgroundColor: C.bg },
              ]}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    backgroundColor: accountValid ? C.label : C.separator,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                disabled={!accountValid}
                onPress={() => transitionTo('personalized-video')}
              >
                <Text
                  style={[
                    styles.primaryBtnText,
                    { color: accountValid ? C.bg : C.secondary },
                  ]}
                >
                  Continue
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── SCREEN 9: Personalized Video ─────────────────────────────────── */}
        {step === 'personalized-video' && (
          <View style={styles.videoScreen}>
            {/* Skip button */}
            <Pressable
              style={[styles.skipBtn, { top: insets.top + 12 }]}
              onPress={completeAndEnter}
              hitSlop={12}
            >
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>

            {/* Content */}
            <View style={styles.videoContent}>
              <Image
                source={KX_LOGO}
                style={[styles.logoLarge, { tintColor: '#FFFFFF', opacity: 0.9 }]}
                resizeMode="contain"
              />
              <View style={{ height: 24 }} />
              <Text style={styles.videoSubtitle}>
                {CODE_VIDEO_TITLE[enteredCode] ?? 'Welcome to KaNeXT'}
              </Text>
            </View>

            {/* Enter KaNeXT button */}
            <View style={[styles.videoFooter, { paddingBottom: insets.bottom + 32 }]}>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryBtn,
                  styles.primaryBtnLight,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={completeAndEnter}
              >
                <Text style={[styles.primaryBtnText, { color: '#1C1410' }]}>
                  Enter KaNeXT
                </Text>
              </Pressable>
            </View>
          </View>
        )}

      </KeyboardAvoidingView>
    </Animated.View>
  );
}

// ── Password requirement row ──────────────────────────────────────────────────

interface PasswordReqProps {
  met: boolean;
  label: string;
  gainColor: string;
  driftColor: string;
}

function PasswordReq({ met, label, gainColor, driftColor }: PasswordReqProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Text style={{ fontSize: 12, color: met ? gainColor : driftColor }}>
        {met ? '✓' : '○'}
      </Text>
      <Text style={{ fontSize: 12, color: met ? gainColor : driftColor }}>
        {label}
      </Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Layouts ──
  screen: {
    flex: 1,
  },
  centeredBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  formContent: {
    paddingHorizontal: 28,
    paddingTop: 16,
  },

  // ── Portal ──
  portalCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  portalFooter: {
    alignItems: 'center',
    paddingBottom: 0,
  },

  // ── Logo ──
  logoLarge: {
    width: 120,
    height: 120,
  },
  logoSmall: {
    width: 48,
    height: 48,
  },
  logoSmallWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },

  // ── Code input ──
  codeInputWrap: {
    width: '100%',
  },
  codeInput: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 20,
    fontSize: 18,
    textAlign: 'center',
  },

  // ── Text links ──
  textLink: {
    fontSize: 13,
    textAlign: 'center',
  },

  // ── Video screens ──
  videoScreen: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoContent: {
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  videoTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  videoSubtitle: {
    fontSize: 16,
    color: '#8A837C',
    textAlign: 'center',
    lineHeight: 24,
  },
  videoFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    paddingTop: 12,
  },
  skipBtn: {
    position: 'absolute',
    right: 20,
  },
  skipText: {
    fontSize: 14,
    color: '#8A837C',
  },

  // ── Screen titles ──
  screenTitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  screenTitleMedium: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Form inputs ──
  formInput: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 20,
    fontSize: 16,
  },

  // ── Email input with arrow ──
  emailInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingLeft: 20,
    paddingRight: 8,
  },
  emailInputField: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  emailArrowBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Prefix input row (username, password) ──
  prefixInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    gap: 4,
  },
  inputPrefix: {
    fontSize: 16,
    fontWeight: '500',
  },
  prefixInputField: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },

  // ── OTP ──
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  otpBox: {
    width: 48,
    height: 60,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 24,
    textAlign: 'center',
  },

  // ── NDA body ──
  ndaBody: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'left',
  },

  // ── Request confirm ──
  confirmTitle: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  confirmSub: {
    fontSize: 14,
    textAlign: 'center',
  },

  // ── Primary buttons ──
  primaryBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primaryBtnLight: {
    backgroundColor: '#FFFFFF',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // ── Footer button container ──
  footerBtn: {
    paddingHorizontal: 28,
    paddingTop: 12,
  },
});
