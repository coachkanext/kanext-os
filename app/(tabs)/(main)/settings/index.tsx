/**
 * Settings — Universal account-level settings.
 * One page for all modes. Scrolling sections with flat rows.
 * No brand settings here — those live inside each brand.
 * Monochrome design system. No blue. No accent.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  Switch,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ── Semantic colors ───────────────────────────────────────────────────────────

const HEAT = '#B85C5C';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;

// ── Types ─────────────────────────────────────────────────────────────────────

type NavRow = {
  kind: 'nav';
  icon: string;
  label: string;
  preview?: string;
  route: string;
};

type ToggleRow = {
  kind: 'toggle';
  icon: string;
  label: string;
  stateKey: 'reduceMotion' | 'highContrast';
};

type ActionRow = {
  kind: 'action';
  label: string;
  danger?: boolean;
  onPress: () => void;
};

type AnyRow = NavRow | ToggleRow | ActionRow;

type Section = {
  header: string;
  rows: AnyRow[];
};

// ── Section definitions ───────────────────────────────────────────────────────

function buildSections(
  go: (route: string) => void,
  logout: () => void,
  logoutAll: () => void,
): Section[] {
  return [
    {
      header: 'ACCOUNT',
      rows: [
        { kind: 'nav', icon: 'person.fill',       label: 'Profile',       preview: 'Sammy Kalejaiye', route: '/(tabs)/(main)/settings/profile'       },
        { kind: 'nav', icon: 'lock.fill',          label: 'Security',      preview: 'Face ID on',      route: '/(tabs)/(main)/settings/security'      },
        { kind: 'nav', icon: 'bell.fill',          label: 'Notifications', preview: 'On',              route: '/(tabs)/(main)/settings/notifications'  },
        { kind: 'nav', icon: 'shield.fill',        label: 'Privacy',                                   route: '/(tabs)/(main)/settings/privacy'       },
      ] as AnyRow[],
    },
    {
      header: 'PAYMENTS',
      rows: [
        { kind: 'nav', icon: 'creditcard.fill', label: 'KPay Settings', preview: 'Chase ••4521', route: '/(tabs)/(main)/settings/kpay' },
      ] as AnyRow[],
    },
    {
      header: 'APPEARANCE',
      rows: [
        { kind: 'nav',    icon: 'paintbrush.fill',         label: 'Theme',          preview: 'Light',  route: '/(tabs)/(main)/settings/appearance' },
        { kind: 'nav',    icon: 'textformat',               label: 'Text Size',      preview: 'Medium', route: '/(tabs)/(main)/settings/appearance' },
        { kind: 'toggle', icon: 'figure.walk',              label: 'Reduce Motion',  stateKey: 'reduceMotion'  },
        { kind: 'toggle', icon: 'circle.lefthalf.filled',   label: 'High Contrast',  stateKey: 'highContrast'  },
      ] as AnyRow[],
    },
    {
      header: 'GENERAL',
      rows: [
        { kind: 'nav', icon: 'globe',                label: 'Language',       preview: 'English', route: '/(tabs)/(main)/settings/language' },
        { kind: 'nav', icon: 'questionmark.circle',  label: 'Help & Support',                     route: '/(tabs)/(main)/settings/help'     },
        { kind: 'nav', icon: 'info.circle',          label: 'About',          preview: 'v2.4.1',  route: '/(tabs)/(main)/settings/about'    },
      ] as AnyRow[],
    },
    {
      header: 'ACCOUNT ACTIONS',
      rows: [
        { kind: 'action', label: 'Log out (this device)',  onPress: logout    },
        { kind: 'action', label: 'Log out all devices',    onPress: logoutAll },
        { kind: 'action', label: 'Deactivate account',     onPress: () => go('/(tabs)/(main)/settings/danger-zone') },
        { kind: 'action', label: 'Delete account',         danger: true, onPress: () => go('/(tabs)/(main)/settings/danger-zone') },
      ] as AnyRow[],
    },
  ];
}

// ── Row components ────────────────────────────────────────────────────────────

function NavRowItem({
  row, C, s, onPress,
}: { row: NavRow; C: ComponentColors; s: ReturnType<typeof makeStyles>; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && { backgroundColor: C.surface }]}
      onPress={onPress}
    >
      <IconSymbol name={row.icon as any} size={22} color={C.label} />
      <Text style={[s.rowLabel, { color: C.label }]}>{row.label}</Text>
      {row.preview ? (
        <Text style={[s.rowPreview, { color: C.secondary }]} numberOfLines={1}>
          {row.preview}
        </Text>
      ) : null}
      <IconSymbol name="chevron.right" size={13} color={C.secondary} />
    </Pressable>
  );
}

function ToggleRowItem({
  row, C, s, value, onToggle,
}: {
  row: ToggleRow;
  C: ComponentColors;
  s: ReturnType<typeof makeStyles>;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={s.row}>
      <IconSymbol name={row.icon as any} size={22} color={C.label} />
      <Text style={[s.rowLabel, { color: C.label }]}>{row.label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: C.separator, true: C.label }}
        thumbColor={C.bg}
        ios_backgroundColor={C.separator}
      />
    </View>
  );
}

function ActionRowItem({
  row, C, s,
}: { row: ActionRow; C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && { backgroundColor: C.surface }]}
      onPress={() => { Haptics.selectionAsync(); row.onPress(); }}
    >
      <Text style={[s.actionLabel, { color: row.danger ? HEAT : C.label }]}>
        {row.label}
      </Text>
    </Pressable>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:hub');
  const isOwner = role === roleCycles[0];

  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const go = useCallback((route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  }, [router]);

  const logout = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Log Out',
      'Log out of KaNeXT on this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => {} },
      ],
    );
  }, []);

  const logoutAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Log Out All Devices',
      'This will end your sessions on all devices.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out All', style: 'destructive', onPress: () => {} },
      ],
    );
  }, []);

  const toggleValues: Record<string, boolean> = {
    reduceMotion,
    highContrast,
  };

  const handleToggle = useCallback((key: string) => {
    Haptics.selectionAsync();
    if (key === 'reduceMotion') setReduceMotion(v => !v);
    if (key === 'highContrast') setHighContrast(v => !v);
  }, []);

  const sections = useMemo(
    () => buildSections(go, logout, logoutAll),
    [go, logout, logoutAll],
  );

  function renderRow(row: AnyRow, idx: number, isLast: boolean) {
    const separator = idx > 0
      ? <View style={[s.rowSep, { backgroundColor: C.separator }]} />
      : null;

    if (row.kind === 'nav') {
      return (
        <View key={row.label}>
          {separator}
          <NavRowItem row={row} C={C} s={s} onPress={() => go(row.route)} />
        </View>
      );
    }

    if (row.kind === 'toggle') {
      return (
        <View key={row.label}>
          {separator}
          <ToggleRowItem
            row={row}
            C={C}
            s={s}
            value={toggleValues[row.stateKey]}
            onToggle={() => handleToggle(row.stateKey)}
          />
        </View>
      );
    }

    return (
      <View key={row.label}>
        {separator}
        <ActionRowItem row={row} C={C} s={s} />
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          s.topBarOuter,
          { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity },
        ]}
      >
        <View style={s.topBar}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            hitSlop={8}
            style={s.kBtn}
          >
            <KMenuButton />
          </Pressable>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Settings</Text>
            </View>
          </View>

          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      {/* ── Scrollable content ────────────────────────────────────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.scrollContent,
          { paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {sections.map((section, sIdx) => (
          <View key={section.header} style={sIdx > 0 ? s.sectionGap : undefined}>

            {/* Section header */}
            <Text style={[s.sectionHeader, { color: C.secondary }]}>
              {section.header}
            </Text>

            {/* Rows */}
            <View style={[s.sectionRows, { borderTopColor: C.separator, borderBottomColor: C.separator }]}>
              {section.rows.map((row, rIdx) =>
                renderRow(row, rIdx, rIdx === section.rows.length - 1),
              )}
            </View>

          </View>
        ))}
      </ScrollView>

    </View>
  );
}

// ── makeStyles ────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },

    // Top bar
    topBarOuter: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      height: TOP_BAR_H,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
    },
    kBtn: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
    titlePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },

    // Scroll
    scrollContent: { paddingHorizontal: 0 },

    // Section
    sectionGap: { marginTop: 32 },
    sectionHeader: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    sectionRows: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },

    // Row
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingHorizontal: 16,
      paddingVertical: 13,
      minHeight: 50,
    },
    rowSep: {
      height: StyleSheet.hairlineWidth,
      marginLeft: 52,  // aligns with text, after icon + gap
    },
    rowLabel: { flex: 1, fontSize: 16 },
    rowPreview: { fontSize: 14, maxWidth: 140, textAlign: 'right' },

    // Action row label (no icon)
    actionLabel: { flex: 1, fontSize: 16 },
  });
}
