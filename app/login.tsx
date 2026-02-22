/**
 * Login Screen (Placeholder)
 * Simple stub screen for authentication flow.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useAppContext } from '@/context/app-context';

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setAuthState } = useAppContext();

  const handleDemoLogin = () => {
    setAuthState('owner');
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Log In</Text>
        <View style={styles.backButton} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.backgroundTertiary },
          ]}
        >
          <IconSymbol name="person.crop.circle" size={64} color={colors.icon} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          Welcome to KaNeXT
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Sign in to access your organization and manage your programs.
        </Text>

        {/* Demo Login Button */}
        <Pressable
          style={({ pressed }) => [
            styles.loginButton,
            { backgroundColor: pressed ? accent + 'DD' : accent },
          ]}
          onPress={handleDemoLogin}
        >
          <Text style={styles.loginButtonText}>Demo Login</Text>
        </Pressable>

        <Text style={[styles.note, { color: colors.textTertiary }]}>
          This is a placeholder screen. Full authentication will be implemented in a future update.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  loginButton: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  note: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});
