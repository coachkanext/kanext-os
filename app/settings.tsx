/**
 * Settings Screen
 * Spec: kanext-settings.html
 *
 * Profile card → Account → Preferences → Notifications → Appearance → KayPay → Support → Log Out
 * Triggered by: hold home icon OR tap name in Nexus sidebar.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';

export default function SettingsScreen() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, logout } = useAppContext();
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');

  const isLoggedIn = state.authState === 'owner';

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={styles.topBarTitle}>Settings</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <Pressable
          style={({ pressed }) => [
            styles.profileCard,
            { backgroundColor: pressed ? C.separator : C.surface },
          ]}
        >
          <View style={styles.avatar}>
            <Text style={[styles.avatarInitials, { color: C.secondary }]}>CW</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: C.label }]}>Coach Williams</Text>
            <Text style={[styles.profileHandle, { color: C.secondary }]}>@coachwilliams</Text>
            <Text style={[styles.profileSub, { color: C.muted }]}>Tap to edit profile</Text>
          </View>
          <IconSymbol name="chevron.right" size={16} color={C.muted} />
        </Pressable>

        {/* Account */}
        <SectionGroup label="Account" C={C} styles={styles}>
          <SettingsRow label="Username" value="@coachwilliams" iconBg="#111" icon="person" C={C} styles={styles} />
          <RowDivider C={C} styles={styles} />
          <SettingsRow label="Phone Numbers" value="2 active" iconBg="#111" icon="phone" C={C} styles={styles} />
          <RowDivider C={C} styles={styles} />
          <SettingsRow label="Password & Security" iconBg="#111" icon="lock" C={C} styles={styles} />
        </SectionGroup>

        {/* Preferences */}
        <SectionGroup label="Preferences" C={C} styles={styles}>
          <SettingsRow label="Default Mode" value="Sports" iconBg="#444" icon="slider.horizontal.3" C={C} styles={styles} />
          <RowDivider C={C} styles={styles} />
          <SettingsRow label="Language & Region" value="English" iconBg="#444" icon="globe" C={C} styles={styles} />
        </SectionGroup>

        {/* Notifications */}
        <SectionGroup label="Notifications" C={C} styles={styles}>
          <SettingsRow label="Push Notifications" iconBg="#666" icon="bell" C={C} styles={styles} />
          <RowDivider C={C} styles={styles} />
          <SettingsRow label="In-App Notifications" iconBg="#666" icon="app.badge" C={C} styles={styles} />
          <RowDivider C={C} styles={styles} />
          <SettingsRow label="Quiet Hours" value="10 PM – 7 AM" iconBg="#666" icon="moon" C={C} styles={styles} />
        </SectionGroup>

        {/* Appearance */}
        <SectionGroup label="Appearance" C={C} styles={styles}>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: '#222' }]}>
              <IconSymbol name="moon" size={16} color="#FFFFFF" />
            </View>
            <Text style={[styles.rowLabel, { color: C.label }]}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: 'rgba(0,0,0,0.12)', true: '#111111' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="rgba(0,0,0,0.12)"
            />
          </View>
        </SectionGroup>

        {/* KayPay */}
        <SectionGroup label="KayPay" C={C} styles={styles}>
          <SettingsRow label="Wallet Settings" iconBg="#111" icon="creditcard" C={C} styles={styles} />
          <RowDivider C={C} styles={styles} />
          <SettingsRow label="Linked Cards" value="1 card" iconBg="#111" icon="rectangle.stack" C={C} styles={styles} />
        </SectionGroup>

        {/* Support */}
        <SectionGroup label="Support" C={C} styles={styles}>
          <SettingsRow label="Help & Support" iconBg="#888" icon="questionmark.circle" C={C} styles={styles} />
          <RowDivider C={C} styles={styles} />
          <SettingsRow label="Terms & Privacy" iconBg="#888" icon="doc.text" C={C} styles={styles} />
        </SectionGroup>

        {/* Log Out */}
        <View style={[styles.group, { marginTop: 24, backgroundColor: C.surface }]}>
          <Pressable
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: pressed ? C.separator : 'transparent', justifyContent: 'center' },
            ]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </View>

        <Text style={[styles.version, { color: C.muted }]}>KaNeXT OS v1.0</Text>
      </ScrollView>
    </View>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function SectionGroup({
  label,
  children,
  C,
  styles,
}: {
  label: string;
  children: React.ReactNode;
  C: ComponentColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: C.muted }]}>{label.toUpperCase()}</Text>
      <View style={[styles.group, { backgroundColor: C.surface }]}>{children}</View>
    </View>
  );
}

function RowDivider({
  C,
  styles,
}: {
  C: ComponentColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  return <View style={[styles.rowDivider, { backgroundColor: 'rgba(0,0,0,0.06)' }]} />;
}

function SettingsRow({
  label,
  value,
  iconBg,
  icon,
  C,
  styles,
  onPress,
}: {
  label: string;
  value?: string;
  iconBg: string;
  icon: string;
  C: ComponentColors;
  styles: ReturnType<typeof makeStyles>;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? C.separator : 'transparent' },
      ]}
      onPress={onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <IconSymbol name={icon as any} size={16} color="#FFFFFF" />
      </View>
      <Text style={[styles.rowLabel, { color: C.label }]}>{label}</Text>
      {value != null && <Text style={[styles.rowValue, { color: C.muted }]}>{value}</Text>}
      <IconSymbol name="chevron.right" size={14} color={C.muted} />
    </Pressable>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.bg,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      minHeight: 44,
    },
    backBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 18,
    },
    topBarTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 17,
      fontWeight: '600',
      color: C.label,
    },
    scroll: { flex: 1 },

    // Profile card
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      marginHorizontal: 16,
      marginTop: 8,
      padding: 16,
      borderRadius: 14,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(0,0,0,0.06)',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: 'rgba(0,0,0,0.06)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitials: { fontSize: 22, fontWeight: '700' },
    profileInfo: { flex: 1 },
    profileName: { fontSize: 17, fontWeight: '700' },
    profileHandle: { fontSize: 13, marginTop: 1 },
    profileSub: { fontSize: 12, marginTop: 3 },

    // Sections
    section: { marginTop: 24 },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.7,
      paddingHorizontal: 32,
      paddingBottom: 6,
    },
    group: {
      marginHorizontal: 16,
      borderRadius: 14,
      overflow: 'hidden',
    },

    // Rows
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      gap: 12,
    },
    rowIcon: {
      width: 30,
      height: 30,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
    rowValue: { fontSize: 14, marginRight: 4 },
    rowDivider: { height: StyleSheet.hairlineWidth, marginLeft: 58 },

    // Log out
    logoutText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#D93636',
      textAlign: 'center',
    },

    version: {
      textAlign: 'center',
      paddingVertical: 20,
      fontSize: 12,
    },
  });
