/**
 * Wallet Side Panel — role-aware (Personal mode KPay).
 * Owner: Wallet · Pay · Invest · Card · MANAGE (Invoices · Tax · Settings)
 * Follower: Wallet · Pay · Invest · Card · MANAGE (Tax · Settings)
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Types ──────────────────────────────────────────────────────────────────────

type NavItem = { icon: string; label: string; route: string; bold?: boolean };

// ── Nav item definitions ───────────────────────────────────────────────────────

const PRIMARY_ITEMS: NavItem[] = [
  { icon: 'wallet.bifold.fill',        label: 'Wallet',  route: '/(tabs)/(main)/kaypay',         bold: true },
  { icon: 'arrow.up.arrow.down',       label: 'Pay',     route: '/(tabs)/(main)/kaypay/pay'              },
  { icon: 'chart.line.uptrend.xyaxis', label: 'Invest',  route: '/(tabs)/(main)/kaypay/invest'           },
  { icon: 'creditcard.fill',           label: 'Card',    route: '/(tabs)/(main)/kaypay/card'             },
];

const MANAGE_OWNER: NavItem[] = [
  { icon: 'doc.text.fill',        label: 'Invoices', route: '/(tabs)/(main)/kaypay/invoices'  },
  { icon: 'building.columns.fill', label: 'Tax',      route: '/(tabs)/(main)/kaypay/tax'       },
  { icon: 'gearshape.fill',        label: 'Settings', route: '/(tabs)/(main)/kaypay/settings'  },
];

const MANAGE_FOLLOWER: NavItem[] = [
  { icon: 'building.columns.fill', label: 'Tax',      route: '/(tabs)/(main)/kaypay/tax'      },
  { icon: 'gearshape.fill',        label: 'Settings', route: '/(tabs)/(main)/kaypay/settings' },
];

// ── Component ──────────────────────────────────────────────────────────────────

export function WalletPanel() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('personal:kaypay');
  const isOwner = role === roleCycles[0];

  const manageItems = isOwner ? MANAGE_OWNER : MANAGE_FOLLOWER;

  const goPage = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
    setTimeout(() => { router.navigate(route as any); }, 80);
  };

  return (
    <View style={[s.root, { backgroundColor: C.surface }]}>

      {/* ── Primary items ── */}
      {PRIMARY_ITEMS.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            s.row,
            pressed && { backgroundColor: C.bg },
            idx < PRIMARY_ITEMS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
          ]}
          onPress={() => goPage(item.route)}
        >
          <IconSymbol
            name={item.icon as any}
            size={18}
            color={item.bold ? C.label : C.secondary}
          />
          <Text
            style={[
              s.rowLabel,
              { color: C.label },
              item.bold && { fontWeight: '600' },
            ]}
          >
            {item.label}
          </Text>
        </Pressable>
      ))}

      {/* ── Divider ── */}
      <View style={[s.divider, { backgroundColor: C.separator }]} />

      {/* ── Manage section ── */}
      <Text style={[s.sectionLabel, { color: C.secondary }]}>Manage</Text>
      {manageItems.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            s.row,
            pressed && { backgroundColor: C.bg },
            idx < manageItems.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
          ]}
          onPress={() => goPage(item.route)}
        >
          <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
          <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
        </Pressable>
      ))}

    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1, paddingTop: 8, paddingBottom: 16 },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
    marginHorizontal: 16,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 2,
    marginTop: 4,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 8,
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },
  rowLabel:  { flex: 1, fontSize: 15 },
});
