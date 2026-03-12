/**
 * Settings Panel — X/Twitter-style side menu (FINAL)
 * Sits behind shifting content, revealed when content slides right.
 * Jet black background, no overlay/blur/dimming.
 *
 * Feature shortcuts (Saved, Your Activity, QR Code)
 * Settings rows (Account, Preferences, Notifications, Appearance, Help, Terms, Log Out)
 * Mode/org switching lives in the Profile org drawer.
 */

import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/auth-context';
import { closeSettingsPanel } from '@/utils/global-settings-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useThemePreference, useSetThemePreference } from '@/context/theme-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const SETTINGS_PANEL_WIDTH = Math.min(300, SCREEN_WIDTH * 0.82);


interface SettingsPanelProps {
  visible: boolean;
}

const THEME_OPTIONS = [
  { key: 'light' as const, label: 'Light' },
  { key: 'dark' as const, label: 'Dark' },
  { key: 'system' as const, label: 'System' },
];

export function SettingsPanel({ visible }: SettingsPanelProps) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();
  const themePref = useThemePreference();
  const setThemePref = useSetThemePreference();
  const [showAppearance, setShowAppearance] = useState(false);

  const handleNavigate = useCallback((route: string) => {
    closeSettingsPanel();
    setTimeout(() => {
      router.push(route as any);
    }, 300);
  }, [router]);

  const handleSignOut = useCallback(() => {
    closeSettingsPanel();
    signOut();
  }, [signOut]);

  return (
    <View style={[styles.container, { width: SETTINGS_PANEL_WIDTH }]} pointerEvents={visible ? 'auto' : 'none'}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── FEATURE SHORTCUTS ── */}
        <View style={styles.menuSection}>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => handleNavigate('/settings')}
          >
            <IconSymbol name="bookmark.fill" size={20} color={C.label} />
            <Text style={styles.menuItemText}>Saved</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => handleNavigate('/settings')}
          >
            <IconSymbol name="clock.fill" size={20} color={C.label} />
            <Text style={styles.menuItemText}>Your Activity</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => handleNavigate('/settings')}
          >
            <IconSymbol name="qrcode" size={20} color={C.label} />
            <Text style={styles.menuItemText}>QR Code</Text>
          </Pressable>
        </View>

        {/* ── DIVIDER ── */}
        <View style={styles.divider} />

        {/* ── BOTTOM SECTION: SETTINGS ── */}
        <View style={styles.menuSection}>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => handleNavigate('/settings')}
          >
            <IconSymbol name="person.fill" size={20} color={C.label} />
            <Text style={styles.menuItemText}>Account</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => handleNavigate('/settings')}
          >
            <IconSymbol name="slider.horizontal.3" size={20} color={C.label} />
            <Text style={styles.menuItemText}>Preferences</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => handleNavigate('/settings')}
          >
            <IconSymbol name="bell.fill" size={20} color={C.label} />
            <Text style={styles.menuItemText}>Notifications</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => setShowAppearance(!showAppearance)}
          >
            <IconSymbol name="moon.fill" size={20} color={C.label} />
            <Text style={styles.menuItemText}>Appearance</Text>
            <IconSymbol
              name={showAppearance ? 'chevron.up' : 'chevron.down'}
              size={14}
              color={C.secondary}
            />
          </Pressable>
          {showAppearance && (
            <View style={styles.appearanceRow}>
              {THEME_OPTIONS.map((opt) => {
                const active = themePref === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    style={[styles.themePill, active && styles.themePillActive]}
                    onPress={() => setThemePref(opt.key)}
                  >
                    <Text style={[styles.themePillText, active && styles.themePillTextActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => handleNavigate('/settings')}
          >
            <IconSymbol name="questionmark.circle" size={20} color={C.label} />
            <Text style={styles.menuItemText}>Help & Support</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => handleNavigate('/settings')}
          >
            <IconSymbol name="shield.fill" size={20} color={C.label} />
            <Text style={styles.menuItemText}>Terms & Privacy</Text>
          </Pressable>
        </View>

        {/* Spacer pushes log out to bottom */}
        <View style={styles.spacer} />

        {/* ── DIVIDER ── */}
        <View style={styles.divider} />

        {/* Log Out — always last */}
        <Pressable
          style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
          onPress={handleSignOut}
        >
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#EF4444" />
          <Text style={[styles.menuItemText, styles.logOutText]}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: C.surface,
    zIndex: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },

  // ── Divider ──
  divider: {
    height: 1,
    backgroundColor: C.separator,
    marginVertical: 8,
  },

  // ── Menu items (feature shortcuts + settings) ──
  menuSection: {
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  menuItemPressed: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '400',
    color: C.label,
    flex: 1,
  },
  logOutText: {
    color: C.red,
  },

  // ── Appearance toggle ──
  appearanceRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  themePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  themePillActive: {
    backgroundColor: C.label,
  },
  themePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
  },
  themePillTextActive: {
    color: C.surface,
  },

  // ── Spacer ──
  spacer: {
    flex: 1,
    minHeight: 24,
  },
});
