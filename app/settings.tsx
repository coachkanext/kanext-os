/**
 * Settings & Privacy Screen
 * System settings, preferences, and authentication (Log In / Log Out).
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useAppContext } from '@/context/app-context';

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, setAuthState, logout } = useAppContext();

  const isLoggedIn = state.authState === 'owner';

  const handleLogin = () => {
    // Demo login - in production this would open auth flow
    setAuthState('owner');
    Alert.alert('Logged In', 'You are now logged in as Alex Morgan.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings & Privacy</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACCOUNT</Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {isLoggedIn ? (
              <>
                <SettingsRow
                  icon="person.circle"
                  label="Alex Morgan"
                  subtitle="sammy@kanext.com"
                  colors={colors}
                />
                <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />
                <Pressable
                  style={({ pressed }) => [
                    styles.settingsRow,
                    pressed && { backgroundColor: colors.backgroundTertiary },
                  ]}
                  onPress={handleLogout}
                >
                  <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={colors.error} />
                  <Text style={[styles.rowLabel, { color: colors.error }]}>Log Out</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.settingsRow,
                  pressed && { backgroundColor: colors.backgroundTertiary },
                ]}
                onPress={handleLogin}
              >
                <IconSymbol name="person.crop.circle.badge.plus" size={20} color={accent} />
                <Text style={[styles.rowLabel, { color: accent }]}>Log In</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PREFERENCES</Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            <SettingsRow
              icon="bell"
              label="Notifications"
              colors={colors}
              onPress={() => {}}
            />
            <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />
            <SettingsRow
              icon="eye"
              label="Appearance"
              colors={colors}
              onPress={() => {}}
            />
            <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />
            <SettingsRow
              icon="lock"
              label="Privacy"
              colors={colors}
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DATA</Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            <SettingsRow
              icon="arrow.down.circle"
              label="Download My Data"
              colors={colors}
              onPress={() => {}}
            />
            <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />
            <SettingsRow
              icon="trash"
              label="Clear Cache"
              colors={colors}
              onPress={() => Alert.alert('Cache Cleared', 'Local cache has been cleared.')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  subtitle,
  colors,
  onPress,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  colors: typeof Colors.light;
  onPress?: () => void;
}) {
  const content = (
    <>
      <IconSymbol name={icon as any} size={20} color={colors.icon} />
      <View style={styles.rowTextContainer}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        {subtitle && (
          <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        )}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.settingsRow,
          pressed && { backgroundColor: colors.backgroundTertiary },
        ]}
        onPress={onPress}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.settingsRow}>{content}</View>;
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
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  rowTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    marginLeft: 14,
  },
  rowSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md + 34,
  },
});
