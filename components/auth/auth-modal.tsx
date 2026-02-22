/**
 * Auth Modal
 * Full-screen modal over locked Nexus background.
 * Three auth buttons: Apple, Google, Email.
 * Animated entrance (slide up from bottom). No dismiss — must authenticate.
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/auth-context';
import type { AuthProvider } from '@/types';

interface AuthModalProps {
  visible: boolean;
}

export function AuthModal({ visible }: AuthModalProps) {
  const { signIn, signInAsInvestor } = useAuth();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleSignIn = (provider: AuthProvider) => {
    signIn(provider);
  };

  if (!visible) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, { opacity: fadeAnim }]}>
      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ translateY: slideAnim }],
            paddingBottom: insets.bottom + 40,
          },
        ]}
      >
        {/* KX Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>KX</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Continue to Nexus</Text>
        <Text style={styles.subtitle}>Sign in to unlock your intelligence surface</Text>

        {/* Auth Buttons */}
        <View style={styles.buttons}>
          {/* Apple */}
          <Pressable
            style={({ pressed }) => [
              styles.authButton,
              styles.appleButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => handleSignIn('apple')}
          >
            <IconSymbol name="apple.logo" size={20} color="#FFFFFF" />
            <Text style={[styles.authButtonText, { color: '#FFFFFF' }]}>
              Continue with Apple
            </Text>
          </Pressable>

          {/* Google */}
          <Pressable
            style={({ pressed }) => [
              styles.authButton,
              styles.googleButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => handleSignIn('google')}
          >
            <IconSymbol name="globe" size={20} color="#0B0F14" />
            <Text style={[styles.authButtonText, { color: '#0B0F14' }]}>
              Continue with Google
            </Text>
          </Pressable>

          {/* Email */}
          <Pressable
            style={({ pressed }) => [
              styles.authButton,
              styles.emailButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => handleSignIn('email')}
          >
            <IconSymbol name="envelope.fill" size={20} color="#FFFFFF" />
            <Text style={[styles.authButtonText, { color: '#FFFFFF' }]}>
              Continue with Email
            </Text>
          </Pressable>

          {/* Investor Demo */}
          <Pressable
            style={({ pressed }) => [
              styles.investorButton,
              pressed && { opacity: 0.6 },
            ]}
            onPress={signInAsInvestor}
          >
            <Text style={styles.investorButtonText}>
              Investor Demo
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  appleButton: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#0B0F14',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
  },
  emailButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  investorButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  investorButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.45)',
    textDecorationLine: 'underline',
  },
});
