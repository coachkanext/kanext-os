/**
 * Earn Side Panel — role-aware.
 * Owner:    Manage · Notifications
 * Follower: (nothing)
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';

const GAIN    = '#5A8A6E';
const CAUTION = '#B8943E';
const EMBER   = '#8B2500';

// ── Nav items ─────────────────────────────────────────────────────────────────

type ManageItem = { icon: string; label: string; route: string };

const MANAGE_ITEMS: ManageItem[] = [
  { icon: 'tag',      label: 'Pricing Manager',   route: '/(tabs)/(main)/earn/pricing-manager'   },
  { icon: 'doc.text', label: 'Tax Center',        route: '/(tabs)/(main)/earn/tax-center'        },
  { icon: 'person.2', label: 'Subscriber Health', route: '/(tabs)/(main)/earn/subscriber-health' },
  { icon: 'gear',     label: 'Payout Settings',   route: '/(tabs)/(main)/earn/payout-settings'   },
];

const NOTIF_ITEMS: {
  icon: string;
  label: string;
  badge: string | null;
  iconBg: string;
  iconColor: string;
  tab: string | null;
}[] = [
  { icon: 'dollarsign', label: '$340 pending',      badge: null, iconBg: CAUTION + '22', iconColor: CAUTION, tab: 'Payouts'  },
  { icon: 'bag',        label: '3 new sales today', badge: '3',  iconBg: EMBER   + '18', iconColor: EMBER,   tab: 'Products' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function EarnPanel() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('personal:earn');
  const isOwner = role === roleCycles[0];

  const goTab = (tab: string | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
    if (!tab) return;
    setTimeout(() => {
      router.navigate({ pathname: '/(tabs)/(main)/earn' as any, params: { tab } });
    }, 80);
  };

  const goPage = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
    setTimeout(() => { router.navigate(route as any); }, 80);
  };

  if (!isOwner) return null;

  // ── Owner view ───────────────────────────────────────────────────────────────
  return (
    <View style={[s.root, { backgroundColor: C.surface }]}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── Home ── */}
        <Pressable
          style={({ pressed }) => [s.row, s.rowBorder, { borderBottomColor: C.separator }, pressed && { backgroundColor: C.bg }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            closeSidePanel();
            setTimeout(() => router.navigate('/(tabs)/(main)/earn' as any), 80);
          }}
        >
          <IconSymbol name="house.fill" size={18} color={C.label} />
          <Text style={[s.rowLabel, { color: C.label }]}>Home</Text>
        </Pressable>

        <View style={[s.divider, { backgroundColor: C.separator }]} />

        <Text style={[s.sectionLabel, { color: C.secondary }]}>Manage</Text>
        {MANAGE_ITEMS.map((item, idx) => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [
              s.row,
              pressed && { backgroundColor: C.bg },
              idx < MANAGE_ITEMS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
            ]}
            onPress={() => goPage(item.route)}
          >
            <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
            <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
          </Pressable>
        ))}

        <View style={[s.divider, { backgroundColor: C.separator }]} />

        <Text style={[s.sectionLabel, { color: C.secondary }]}>Notifications</Text>
        {NOTIF_ITEMS.map((item, idx) => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [
              s.row,
              pressed && { backgroundColor: C.bg },
              idx < NOTIF_ITEMS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
            ]}
            onPress={() => goTab(item.tab)}
          >
            <View style={s.iconWrap}>
              <View style={[s.notifCircle, { backgroundColor: item.iconBg }]}>
                <IconSymbol name={item.icon as any} size={14} color={item.iconColor} />
              </View>
              {item.badge && (
                <View style={[s.badge, { backgroundColor: EMBER }]}>
                  <Text style={[s.badgeText, { color: '#fff' }]}>{item.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
          </Pressable>
        ))}

      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root:    { flex: 1 },
  scroll:  { flex: 1 },
  content: { paddingTop: 8, paddingBottom: 16 },

  divider: { height: StyleSheet.hairlineWidth, marginVertical: 12, marginHorizontal: 16 },

  sectionLabel: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 2, marginTop: 4,
  },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 13,
    borderRadius: 8,
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },
  rowLabel:  { flex: 1, fontSize: 15 },

  iconWrap: { position: 'relative', width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  notifCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute', top: -4, right: -6,
    minWidth: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, fontWeight: '800' },
});
