/**
 * Profile — Identity + Organizations + Mode Stats + Settings.
 * Inner route so footer stays visible and popInnerToHome() pops back naturally.
 */

import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAppContext, useMode } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { useThemePreference, useSetThemePreference } from '@/context/theme-context';
import {
  getOrgsForModeV2,
  getMembershipsForOrg,
} from '@/data/mock-memberships';
import type { Mode } from '@/types';

// ─── Demo stats per mode ───────────────────────────────────
const SPORTS_STATS = [
  { label: 'Coaching Record', value: '142–67' },
  { label: 'Championships', value: '3' },
  { label: 'Years Coaching', value: '12' },
  { label: 'Players Developed', value: '84' },
];

const BUSINESS_STATS = [
  { label: 'Company Founded', value: 'KaNeXT (2024)' },
  { label: 'Role', value: 'Founder & CEO' },
  { label: 'Milestones', value: 'Seed Round, Beta Launch' },
];

const CHURCH_STATS = [
  { label: 'Years of Membership', value: '8' },
  { label: 'Roles Served', value: 'Youth Leader, Deacon' },
  { label: 'Ministries', value: 'Music, Outreach' },
];

const EDUCATION_STATS = [
  { label: 'Degrees', value: 'B.S. Computer Science' },
  { label: 'Certifications', value: 'AWS Solutions Architect' },
  { label: 'Years in Education', value: '6' },
];

const MODE_STATS: Record<Mode, { label: string; value: string }[]> = {
  sports: SPORTS_STATS,
  business: BUSINESS_STATS,
  church: CHURCH_STATS,
  education: EDUCATION_STATS,
  competition: SPORTS_STATS,
};

const STATS_SECTION_TITLES: Record<Mode, string> = {
  sports: 'Coaching Stats',
  business: 'Career Highlights',
  church: 'Ministry & Service',
  education: 'Credentials',
  competition: 'Competition Stats',
};

const ORG_STATUS_LABELS: Record<string, string> = {
  sports_kx: 'Active',
  sports_chs: 'Active',
  sports_gsac: 'Active',
  biz_kx: 'Active',
  church_kx: 'Active',
  church_grace: 'Active',
  edu_kx: 'Active',
  comp_kx: 'Active',
};

const THEME_OPTIONS = [
  { key: 'light' as const, label: 'Light' },
  { key: 'dark' as const, label: 'Dark' },
  { key: 'system' as const, label: 'System' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const C = useColors();
  const mode = useMode();
  const { state } = useAppContext();
  const { state: authState, signOut } = useAuth();
  const themePref = useThemePreference();
  const setThemePref = useSetThemePreference();
  const [showAppearance, setShowAppearance] = useState(false);

  const displayName = authState.session?.displayName ?? 'User';
  const email = authState.session?.email ?? '';

  const orgCards = useMemo(() => {
    const orgs = getOrgsForModeV2(mode);
    return orgs.map((org) => {
      const memberships = getMembershipsForOrg(org.org_id);
      const roleLabel = memberships[0]?.role_titles.join(', ') ?? '';
      const isActive = org.org_id === state.activeContext.org_id;
      const status = ORG_STATUS_LABELS[org.org_id] ?? 'Active';
      return { org, roleLabel, isActive, status };
    });
  }, [mode, state.activeContext.org_id]);

  const stats = MODE_STATS[mode] ?? [];
  const statsTitle = STATS_SECTION_TITLES[mode] ?? 'Stats';

  const handleSignOut = useCallback(() => {
    signOut();
  }, [signOut]);

  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Identity Section ─── */}
        <View style={s.identitySection}>
          <Image
            source={require('@/assets/images/sammy-kalejaiye.jpg')}
            style={s.avatar}
          />
          <Text style={s.fullName}>{displayName}</Text>
          {email ? <Text style={s.handle}>{email}</Text> : null}
          <Text style={s.bio}>
            Building the future of organizational software. Coach, creator, and community builder.
          </Text>
        </View>

        {/* ─── Organizations Section ─── */}
        <View style={s.section}>
          <Text style={s.sectionHeader}>Your Organizations</Text>
          {orgCards.map(({ org, roleLabel, isActive, status }) => (
            <View key={org.org_id} style={s.orgCard}>
              <View style={s.orgCardContent}>
                <View style={s.orgCardTop}>
                  <Text style={s.orgCardName} numberOfLines={1}>{org.org_name}</Text>
                  <View style={[s.statusPill, isActive && s.statusPillActive]}>
                    <Text style={[s.statusText, isActive && s.statusTextActive]}>
                      {status}
                    </Text>
                  </View>
                </View>
                <Text style={s.orgCardRole} numberOfLines={1}>{roleLabel}</Text>
                {org.location ? (
                  <Text style={s.orgCardLocation}>{org.location}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        {/* ─── Stats Section ─── */}
        <View style={s.section}>
          <Text style={s.sectionHeader}>{statsTitle}</Text>
          <View style={s.statsCard}>
            {stats.map((stat, i) => (
              <View key={i} style={[s.statRow, i < stats.length - 1 && s.statRowBorder]}>
                <Text style={s.statLabel}>{stat.label}</Text>
                <Text style={s.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── Settings Section ─── */}
        <View style={s.settingsDivider} />

        {/* Feature shortcuts */}
        <View style={s.settingsSection}>
          <Pressable style={({ pressed }) => [s.settingsRow, pressed && s.settingsRowPressed]}>
            <IconSymbol name="bookmark.fill" size={20} color={C.label} />
            <Text style={s.settingsRowText}>Saved</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [s.settingsRow, pressed && s.settingsRowPressed]}>
            <IconSymbol name="clock.fill" size={20} color={C.label} />
            <Text style={s.settingsRowText}>Your Activity</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [s.settingsRow, pressed && s.settingsRowPressed]}>
            <IconSymbol name="qrcode" size={20} color={C.label} />
            <Text style={s.settingsRowText}>QR Code</Text>
          </Pressable>
        </View>

        <View style={s.settingsDivider} />

        {/* Settings rows */}
        <View style={s.settingsSection}>
          <Pressable style={({ pressed }) => [s.settingsRow, pressed && s.settingsRowPressed]}>
            <IconSymbol name="person.fill" size={20} color={C.label} />
            <Text style={s.settingsRowText}>Account</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [s.settingsRow, pressed && s.settingsRowPressed]}>
            <IconSymbol name="slider.horizontal.3" size={20} color={C.label} />
            <Text style={s.settingsRowText}>Preferences</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [s.settingsRow, pressed && s.settingsRowPressed]}>
            <IconSymbol name="bell.fill" size={20} color={C.label} />
            <Text style={s.settingsRowText}>Notifications</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [s.settingsRow, pressed && s.settingsRowPressed]}
            onPress={() => setShowAppearance(!showAppearance)}
          >
            <IconSymbol name="moon.fill" size={20} color={C.label} />
            <Text style={s.settingsRowText}>Appearance</Text>
            <IconSymbol
              name={showAppearance ? 'chevron.up' : 'chevron.down'}
              size={14}
              color={C.secondary}
            />
          </Pressable>
          {showAppearance && (
            <View style={s.appearanceRow}>
              {THEME_OPTIONS.map((opt) => {
                const active = themePref === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    style={[s.themePill, active && s.themePillActive]}
                    onPress={() => setThemePref(opt.key)}
                  >
                    <Text style={[s.themePillText, active && s.themePillTextActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          <Pressable style={({ pressed }) => [s.settingsRow, pressed && s.settingsRowPressed]}>
            <IconSymbol name="questionmark.circle" size={20} color={C.label} />
            <Text style={s.settingsRowText}>Help & Support</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [s.settingsRow, pressed && s.settingsRowPressed]}>
            <IconSymbol name="shield.fill" size={20} color={C.label} />
            <Text style={s.settingsRowText}>Terms & Privacy</Text>
          </Pressable>
        </View>

        <View style={s.settingsDivider} />

        {/* Log Out */}
        <Pressable
          style={({ pressed }) => [s.settingsRow, pressed && s.settingsRowPressed]}
          onPress={handleSignOut}
        >
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#EF4444" />
          <Text style={[s.settingsRowText, { color: '#EF4444' }]}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.bg,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
    },

    // ─── Identity ───
    identitySection: {
      alignItems: 'center',
      paddingTop: 24,
      paddingBottom: 32,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      marginBottom: 16,
    },
    fullName: {
      fontSize: 24,
      fontWeight: '700',
      color: C.label,
      letterSpacing: -0.3,
      marginBottom: 4,
    },
    handle: {
      fontSize: 14,
      fontWeight: '400',
      color: C.secondary,
      marginBottom: 12,
    },
    bio: {
      fontSize: 15,
      fontWeight: '400',
      color: C.secondary,
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: 12,
    },

    // ─── Section ───
    section: {
      marginBottom: 28,
    },
    sectionHeader: {
      fontSize: 13,
      fontWeight: '700',
      color: C.muted,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: 12,
    },

    // ─── Org Cards ───
    orgCard: {
      backgroundColor: C.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 8,
    },
    orgCardContent: {
      gap: 3,
    },
    orgCardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    orgCardName: {
      fontSize: 16,
      fontWeight: '600',
      color: C.label,
      flex: 1,
      marginRight: 8,
    },
    statusPill: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      backgroundColor: C.surfacePressed,
    },
    statusPillActive: {
      backgroundColor: 'rgba(34,197,94,0.15)',
    },
    statusText: {
      fontSize: 11,
      fontWeight: '600',
      color: C.muted,
    },
    statusTextActive: {
      color: C.green,
    },
    orgCardRole: {
      fontSize: 13,
      fontWeight: '400',
      color: C.secondary,
    },
    orgCardLocation: {
      fontSize: 12,
      fontWeight: '400',
      color: C.muted,
    },

    // ─── Stats ───
    statsCard: {
      backgroundColor: C.surface,
      borderRadius: 12,
      overflow: 'hidden',
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 14,
    },
    statRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: C.separator,
    },
    statLabel: {
      fontSize: 14,
      fontWeight: '400',
      color: C.secondary,
    },
    statValue: {
      fontSize: 14,
      fontWeight: '600',
      color: C.label,
    },

    // ─── Settings ───
    settingsDivider: {
      height: 1,
      backgroundColor: C.separator,
      marginVertical: 8,
    },
    settingsSection: {
      marginTop: 4,
    },
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 14,
      paddingHorizontal: 4,
      borderRadius: 8,
    },
    settingsRowPressed: {
      backgroundColor: C.surfacePressed,
    },
    settingsRowText: {
      fontSize: 16,
      fontWeight: '400',
      color: C.label,
      flex: 1,
    },

    // ─── Appearance toggle ───
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
      backgroundColor: C.surfacePressed,
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
  });
