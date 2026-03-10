/**
 * Wallet Side Panel — swipe right on KayPay.
 * 6 navigation items: Remittance, Family, Statements, Linked Accounts, Security, Settings.
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';

const C = {
  label: '#FFFFFF',
  secondary: '#A1A1AA',
  separator: 'rgba(255,255,255,0.08)',
};

const NAV_ITEMS = [
  { icon: 'globe',                label: 'Remittance',      route: '/(tabs)/(main)/wallet/remittance' },
  { icon: 'person.2.fill',       label: 'Family',           route: '/(tabs)/(main)/wallet/family' },
  { icon: 'doc.text.fill',       label: 'Statements',       route: '/(tabs)/(main)/wallet/statements' },
  { icon: 'building.columns.fill', label: 'Linked Accounts', route: '/(tabs)/(main)/wallet/linked' },
  { icon: 'shield.fill',         label: 'Security',         route: '/(tabs)/(main)/wallet/security' },
  { icon: 'gearshape.fill',      label: 'Settings',         route: '/(tabs)/(main)/wallet/settings' },
] as const;

export function WalletPanel() {
  const router = useRouter();

  const navigateTo = (route: string) => {
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>KayPay</Text>

      {NAV_ITEMS.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            styles.navRow,
            pressed && styles.navRowPressed,
            idx < NAV_ITEMS.length - 1 && styles.navRowBorder,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigateTo(item.route);
          }}
        >
          <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
          <Text style={styles.navLabel}>{item.label}</Text>
          <IconSymbol name="chevron.right" size={14} color="rgba(255,255,255,0.25)" />
        </Pressable>
      ))}

      <View style={{ height: 32 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: C.label,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  navRowPressed: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  navRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.separator,
  },
  navLabel: {
    flex: 1,
    fontSize: 16,
    color: C.label,
  },
});
