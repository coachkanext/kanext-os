/**
 * Settings Panel — X/Twitter-style side menu (FINAL)
 * Sits behind shifting content, revealed when content slides right.
 * Jet black background, no overlay/blur/dimming.
 *
 * TOP: Avatar + Name + @username + Mode switcher + Org switcher
 * MIDDLE: Feature shortcuts (Saved, Your Activity, QR Code)
 * BOTTOM: Settings rows (Account, Preferences, Notifications, Appearance, Help, Terms, Log Out)
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PanelHeader } from '@/components/side-panel/panel-header';
import { useAuth } from '@/context/auth-context';
import { closeSettingsPanel } from '@/utils/global-settings-panel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const SETTINGS_PANEL_WIDTH = Math.min(300, SCREEN_WIDTH * 0.82);


interface SettingsPanelProps {
  visible: boolean;
}

export function SettingsPanel({ visible }: SettingsPanelProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();

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
        {/* Identity + mode circles + org switcher (shared component) */}
        <PanelHeader />

        {/* ── DIVIDER ── */}
        <View style={styles.divider} />

        {/* ── MIDDLE SECTION: FEATURE SHORTCUTS ── */}
        <View style={styles.menuSection}>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => handleNavigate('/settings')}
          >
            <IconSymbol name="bookmark.fill" size={20} color="#FFFFFF" />
            <Text style={styles.menuItemText}>Saved</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => handleNavigate('/settings')}
          >
            <IconSymbol name="clock.fill" size={20} color="#FFFFFF" />
            <Text style={styles.menuItemText}>Your Activity</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => handleNavigate('/settings')}
          >
            <IconSymbol name="qrcode" size={20} color="#FFFFFF" />
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
            <IconSymbol name="person.fill" size={20} color="#FFFFFF" />
            <Text style={styles.menuItemText}>Account</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => handleNavigate('/settings')}
          >
            <IconSymbol name="slider.horizontal.3" size={20} color="#FFFFFF" />
            <Text style={styles.menuItemText}>Preferences</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => handleNavigate('/settings')}
          >
            <IconSymbol name="bell.fill" size={20} color="#FFFFFF" />
            <Text style={styles.menuItemText}>Notifications</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => handleNavigate('/settings')}
          >
            <IconSymbol name="moon.fill" size={20} color="#FFFFFF" />
            <Text style={styles.menuItemText}>Appearance</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => handleNavigate('/settings')}
          >
            <IconSymbol name="questionmark.circle" size={20} color="#FFFFFF" />
            <Text style={styles.menuItemText}>Help & Support</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => handleNavigate('/settings')}
          >
            <IconSymbol name="shield.fill" size={20} color="#FFFFFF" />
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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#000000',
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
    backgroundColor: '#2F3336',
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
    color: '#FFFFFF',
  },
  logOutText: {
    color: '#EF4444',
  },

  // ── Spacer ──
  spacer: {
    flex: 1,
    minHeight: 24,
  },
});
