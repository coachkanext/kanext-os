/**
 * Community KPay Side Panel — role-aware nav panel for community:kaypay.
 * Pastor: Church Finances · Pay · Invest · Card + MANAGE (Budget · Payroll · Invoices · Tax · Settings)
 * Member: Wallet · Pay · Invest · Card + MANAGE (Tax · Settings)
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';

type NavItem = { icon: string; label: string; route: string };

export function CommunityKaypayPanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('community:kaypay');
  const isPastor = role === roleCycles[0];

  const go = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  const PASTOR_NAV_ITEMS: NavItem[] = [
    { icon: 'building.columns.fill',     label: 'Church Finances', route: '/(tabs)/(main)/kaypay/church-finances' },
    { icon: 'arrow.up.circle.fill',      label: 'Pay',             route: '/(tabs)/(main)/kaypay/pay'             },
    { icon: 'chart.line.uptrend.xyaxis', label: 'Invest',          route: '/(tabs)/(main)/kaypay/invest'          },
    { icon: 'creditcard.fill',           label: 'Card',            route: '/(tabs)/(main)/kaypay/card'            },
  ];

  const PASTOR_MANAGE_ITEMS: NavItem[] = [
    { icon: 'dollarsign.circle.fill',       label: 'Budget',   route: '/(tabs)/(main)/kaypay/budget'   },
    { icon: 'person.text.rectangle.fill',   label: 'Payroll',  route: '/(tabs)/(main)/kaypay/payroll'  },
    { icon: 'doc.text.fill',                label: 'Invoices', route: '/(tabs)/(main)/kaypay/invoices' },
    { icon: 'doc.badge.gearshape.fill',     label: 'Tax',      route: '/(tabs)/(main)/kaypay/tax'      },
    { icon: 'gearshape.fill',               label: 'Settings', route: '/(tabs)/(main)/kaypay/settings' },
  ];

  const MEMBER_NAV_ITEMS: NavItem[] = [
    { icon: 'wallet.pass.fill',          label: 'Wallet',  route: '/(tabs)/(main)/kaypay/index'   },
    { icon: 'arrow.up.circle.fill',      label: 'Pay',     route: '/(tabs)/(main)/kaypay/pay'     },
    { icon: 'chart.line.uptrend.xyaxis', label: 'Invest',  route: '/(tabs)/(main)/kaypay/invest'  },
    { icon: 'creditcard.fill',           label: 'Card',    route: '/(tabs)/(main)/kaypay/card'    },
  ];

  const MEMBER_MANAGE_ITEMS: NavItem[] = [
    { icon: 'doc.badge.gearshape.fill', label: 'Tax',      route: '/(tabs)/(main)/kaypay/tax'      },
    { icon: 'gearshape.fill',           label: 'Settings', route: '/(tabs)/(main)/kaypay/settings' },
  ];

  const navItems    = isPastor ? PASTOR_NAV_ITEMS    : MEMBER_NAV_ITEMS;
  const manageItems = isPastor ? PASTOR_MANAGE_ITEMS : MEMBER_MANAGE_ITEMS;

  return (
    <View style={[s.root, { backgroundColor: C.surface }]}>
      {navItems.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            s.row,
            pressed && { backgroundColor: C.bg },
            idx < navItems.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
          ]}
          onPress={() => go(item.route)}
        >
          <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
          <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
        </Pressable>
      ))}

      <View style={[s.divider, { backgroundColor: C.separator }]} />
      <Text style={[s.sectionLabel, { color: C.secondary }]}>Manage</Text>
      {manageItems.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            s.row,
            pressed && { backgroundColor: C.bg },
            idx < manageItems.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
          ]}
          onPress={() => go(item.route)}
        >
          <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
          <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:         { flex: 1 },
    divider:      { height: StyleSheet.hairlineWidth, marginVertical: 12, marginHorizontal: 16 },
    sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 2, marginTop: 4 },
    row:          { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13, borderRadius: 8 },
    rowBorder:    { borderBottomWidth: StyleSheet.hairlineWidth },
    rowLabel:     { flex: 1, fontSize: 15 },
  });
}
