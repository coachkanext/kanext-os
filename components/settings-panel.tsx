/**
 * Settings Panel — X/Twitter-style side menu (FINAL)
 * Sits behind shifting content, revealed when content slides right.
 * Jet black background, no overlay/blur/dimming.
 *
 * TOP: Avatar + Name + @username + Mode switcher + Org switcher
 * MIDDLE: Feature shortcuts (Saved, Your Activity, QR Code)
 * BOTTOM: Settings rows (Account, Preferences, Notifications, Appearance, Help, Terms, Log Out)
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { closeSettingsPanel } from '@/utils/global-settings-panel';
import {
  getOrgsForModeV2,
  getMembershipsForOrg,
  getOrgById,
  getProgramsForOrg,
  getCurrentSeasonForOrg,
  getMembershipsForOrgProgram,
} from '@/data/mock-memberships';
import type { Mode, ActiveContext } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const SETTINGS_PANEL_WIDTH = Math.min(300, SCREEN_WIDTH * 0.82);

const MODE_ITEMS: { mode: Mode; label: string; image: any }[] = [
  { mode: 'sports', label: 'Sports', image: require('@/assets/images/mode-sports.png') },
  { mode: 'business', label: 'Business', image: require('@/assets/images/mode-business.png') },
  { mode: 'church', label: 'Faith', image: require('@/assets/images/mode-church.png') },
  { mode: 'education', label: 'Education', image: require('@/assets/images/mode-education.png') },
];

interface SettingsPanelProps {
  visible: boolean;
}

export function SettingsPanel({ visible }: SettingsPanelProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, switchMode, switchContext } = useAppContext();
  const { state: authState, signOut } = useAuth();

  const currentMode = state.mode;
  const activeOrgId = state.activeContext.org_id;
  const displayName = authState.session?.displayName ?? 'User';
  const username = '@' + displayName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16);

  // Get all orgs + memberships for the current mode
  const orgRows = useMemo(() => {
    const orgs = getOrgsForModeV2(currentMode);
    return orgs.map((org) => {
      const memberships = getMembershipsForOrg(org.org_id);
      const roleLabel = memberships[0]?.role_titles.join(' · ') ?? '';
      return { org, roleLabel, membership: memberships[0] };
    });
  }, [currentMode]);

  const handleModeSwitch = useCallback((mode: Mode) => {
    if (mode === currentMode) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    switchMode(mode);
  }, [currentMode, switchMode]);

  const handleOrgSwitch = useCallback((orgId: string) => {
    if (orgId === activeOrgId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const org = getOrgById(orgId);
    if (!org) return;
    const programs = getProgramsForOrg(orgId);
    const program = programs[0];
    if (!program) return;
    const season = getCurrentSeasonForOrg(orgId);
    if (!season) return;
    const memberships = getMembershipsForOrgProgram(orgId, program.program_id);
    const membership = memberships[0];
    if (!membership) return;
    const ctx: ActiveContext = {
      mode: org.mode,
      org_id: orgId,
      program_id: program.program_id,
      season_id: season.season_id,
      membership_id: membership.membership_id,
      derived_role_badge: membership.role_titles.join(' · '),
    };
    switchContext(ctx);
  }, [activeOrgId, switchContext]);

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
        {/* ── TOP SECTION: IDENTITY ── */}

        {/* Avatar — tap opens Profile */}
        <Pressable onPress={() => handleNavigate('/profile')}>
          <Image
            source={require('@/assets/images/sammy-kalejaiye.jpg')}
            style={styles.avatar}
          />
        </Pressable>

        {/* Name */}
        <Text style={styles.name}>{displayName}</Text>

        {/* @username */}
        <Text style={styles.username}>{username}</Text>

        {/* 16px space */}
        <View style={{ height: 16 }} />

        {/* Mode switcher — horizontal row of 4 circles */}
        <View style={styles.modeRow}>
          {MODE_ITEMS.map((m) => {
            const isActive = m.mode === currentMode;
            return (
              <Pressable
                key={m.mode}
                style={({ pressed }) => [
                  styles.modeCircleWrap,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => handleModeSwitch(m.mode)}
              >
                <View style={[styles.modeCircle, isActive && styles.modeCircleActive]}>
                  <Image source={m.image} style={styles.modeImage} />
                </View>
                <Text style={[styles.modeLabel, isActive && styles.modeLabelActive]}>
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* 12px space */}
        <View style={{ height: 12 }} />

        {/* Org switcher — vertical list */}
        <View style={styles.orgSection}>
          {orgRows.map(({ org, roleLabel }) => {
            const isActive = org.org_id === activeOrgId;
            return (
              <Pressable
                key={org.org_id}
                style={({ pressed }) => [
                  styles.orgRow,
                  isActive && styles.orgRowActive,
                  pressed && !isActive && { backgroundColor: 'rgba(255,255,255,0.04)' },
                ]}
                onPress={() => handleOrgSwitch(org.org_id)}
              >
                <Text
                  style={[styles.orgName, isActive && styles.orgNameActive]}
                  numberOfLines={1}
                >
                  {org.org_name}
                </Text>
                <Text style={styles.orgRole} numberOfLines={1}>{roleLabel}</Text>
              </Pressable>
            );
          })}
        </View>

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

  // ── Identity ──
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  username: {
    fontSize: 14,
    fontWeight: '400',
    color: '#A1A1AA',
    marginTop: 2,
  },

  // ── Mode switcher ──
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  modeCircleWrap: {
    alignItems: 'center',
    gap: 6,
  },
  modeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0B0F14',
    borderWidth: 2,
    borderColor: 'transparent',
    opacity: 0.4,
  },
  modeCircleActive: {
    opacity: 1,
    borderColor: '#FFFFFF',
  },
  modeImage: {
    width: '100%',
    height: '100%',
  },
  modeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.35)',
  },
  modeLabelActive: {
    color: '#FFFFFF',
  },

  // ── Org switcher ──
  orgSection: {
    marginBottom: 4,
  },
  orgRow: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 2,
  },
  orgRowActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  orgName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#A1A1AA',
    marginBottom: 2,
  },
  orgNameActive: {
    color: '#FFFFFF',
  },
  orgRole: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.35)',
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
