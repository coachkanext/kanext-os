/**
 * Settings — main hub screen.
 * Accessed from the Brand Drawer (bottom of drawer, below brand list).
 * Not a tile. Not a footer page.
 * Full-screen with back button → returns to wherever the user came from.
 */

import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAppContext } from '@/context/app-context';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SettingsRow {
  id:       string;
  label:    string;
  icon:     string;
  iconBg:   string;
  route?:   string;
  danger?:  boolean;
}

interface SettingsSection {
  title: string;
  rows:  SettingsRow[];
}

// ── Data ──────────────────────────────────────────────────────────────────────

const SECTIONS: SettingsSection[] = [
  {
    title: 'Account',
    rows: [
      { id: 'profile',   label: 'Edit Profile',        icon: 'person.fill',           iconBg: '#1A1714', route: '/settings/profile-edit' },
      { id: 'username',  label: 'Username',             icon: 'at',                    iconBg: '#6B7280', route: '/settings/username' },
      { id: 'phone',     label: 'Phone Numbers',        icon: 'phone.fill',            iconBg: '#5A8A6E', route: '/settings/phone-numbers' },
      { id: 'security',  label: 'Password & Security',  icon: 'lock.fill',             iconBg: '#B8943E', route: '/settings/password-security' },
    ],
  },
  {
    title: 'Wallet & Payments',
    rows: [
      { id: 'wallet',  label: 'Wallet Settings', icon: 'creditcard.fill',    iconBg: '#1A1714', route: '/settings/wallet-settings' },
      { id: 'cards',   label: 'Linked Cards & Banks', icon: 'banknote.fill', iconBg: '#5A8A6E', route: '/settings/linked-cards' },
    ],
  },
  {
    title: 'Notifications',
    rows: [
      { id: 'push',    label: 'Push Notifications',   icon: 'bell.fill',      iconBg: '#B8943E', route: '/settings/push-notifications' },
      { id: 'inapp',   label: 'In-App Notifications',  icon: 'bell.badge.fill', iconBg: '#6B7280', route: '/settings/in-app-notifications' },
      { id: 'quiet',   label: 'Quiet Hours',           icon: 'moon.fill',      iconBg: '#1A1714', route: '/settings/quiet-hours' },
    ],
  },
  {
    title: 'Preferences',
    rows: [
      { id: 'mode',     label: 'Default Mode',    icon: 'square.grid.2x2.fill', iconBg: '#1A1714', route: '/settings/default-mode' },
      { id: 'language', label: 'Language & Region', icon: 'globe',              iconBg: '#5A8A6E', route: '/settings/language-region' },
    ],
  },
  {
    title: 'Organizations',
    rows: [
      { id: 'create-org', label: 'Create Organization', icon: 'building.2.fill', iconBg: '#1A1714', route: '/settings/create-org' },
    ],
  },
  {
    title: 'Legal',
    rows: [
      { id: 'help',  label: 'Help & Support',  icon: 'questionmark.circle.fill', iconBg: '#1A1714', route: '/settings/help-support' },
      { id: 'terms', label: 'Terms & Privacy',  icon: 'doc.text.fill',            iconBg: '#6B7280', route: '/settings/terms-privacy' },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAppContext();
  const s = useMemo(() => makeStyles(C), [C]);

  const displayName = state.activeContext?.derived_role_badge
    ? 'Demo User'
    : 'Demo User';

  const handleRow = (row: SettingsRow) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (row.route) router.push(row.route as any);
  };

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>

      {/* Top bar */}
      <View style={[s.topBar, { paddingTop: insets.top + 8, borderBottomColor: C.separator }]}>
        <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={[s.title, { color: C.label }]}>Settings</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: insets.bottom + 48 }}
      >

        {/* Profile card */}
        <Pressable
          style={({ pressed }) => [s.profileCard, { backgroundColor: C.surface }, pressed && { opacity: 0.85 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/settings/profile-edit' as any); }}
        >
          <View style={[s.profileAvatar, { backgroundColor: C.accent + '22' }]}>
            <Text style={[s.profileAvatarText, { color: C.accent }]}>DU</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={[s.profileName, { color: C.label }]}>{displayName}</Text>
            <Text style={[s.profileSub, { color: C.secondary }]}>Edit profile</Text>
          </View>
          <IconSymbol name="chevron.right" size={16} color={C.muted} />
        </Pressable>

        {/* Settings sections */}
        {SECTIONS.map(section => (
          <View key={section.title} style={s.section}>
            <Text style={[s.sectionTitle, { color: C.secondary }]}>{section.title.toUpperCase()}</Text>
            <View style={[s.sectionCard, { backgroundColor: C.surface }]}>
              {section.rows.map((row, i) => (
                <View key={row.id}>
                  {i > 0 && <View style={[s.divider, { backgroundColor: C.separator }]} />}
                  <Pressable
                    style={({ pressed }) => [s.row, pressed && { backgroundColor: C.surfacePressed }]}
                    onPress={() => handleRow(row)}
                  >
                    <View style={[s.rowIcon, { backgroundColor: row.iconBg }]}>
                      <IconSymbol name={row.icon as any} size={16} color="#fff" />
                    </View>
                    <Text style={[s.rowLabel, { color: row.danger ? C.red : C.label }]}>{row.label}</Text>
                    <IconSymbol name="chevron.right" size={14} color={C.muted} />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out */}
        <View style={s.section}>
          <View style={[s.sectionCard, { backgroundColor: C.surface }]}>
            <Pressable
              style={({ pressed }) => [s.row, pressed && { backgroundColor: C.surfacePressed }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
            >
              <View style={[s.rowIcon, { backgroundColor: '#B85C5C' }]}>
                <IconSymbol name="rectangle.portrait.and.arrow.right" size={16} color="#fff" />
              </View>
              <Text style={[s.rowLabel, { color: '#B85C5C' }]}>Sign Out</Text>
            </Pressable>
          </View>
        </View>

        {/* Version */}
        <Text style={[s.version, { color: C.muted }]}>KaNeXT OS · v1.0</Text>

      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen: { flex: 1 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title:   { fontSize: 17, fontWeight: '600', color: C.label },

  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: 16, marginBottom: 8,
    padding: 14, borderRadius: 16,
  },
  profileAvatar: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  profileAvatarText: { fontSize: 18, fontWeight: '700' },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { fontSize: 16, fontWeight: '600' },
  profileSub:  { fontSize: 13 },

  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.6,
    marginBottom: 8, marginLeft: 4,
  },
  sectionCard: { borderRadius: 14, overflow: 'hidden' },

  divider: { height: StyleSheet.hairlineWidth, marginLeft: 52 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 14,
  },
  rowIcon: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '400' },

  version: {
    textAlign: 'center', fontSize: 12,
    marginTop: 28,
  },
});
