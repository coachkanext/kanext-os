/**
 * Hub Side Panel — X/Twitter-style.
 * Identity header + bare-icon nav + brand switcher at bottom.
 * Owner only.
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { openDipsonSheet } from '@/utils/global-dipson-sheet';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Data ──────────────────────────────────────────────────────────────────────

type NavItem = { icon: string; label: string; route: string; params?: Record<string, string> };

const OWNER_NAV_ITEMS: NavItem[] = [
  { icon: 'person.crop.rectangle', label: 'Profile',   route: '/(tabs)/(main)/hub'                         },
  { icon: 'rectangle.stack',       label: 'Content',   route: '/(tabs)/(main)/hub', params: { tab: 'Content'   } },
  { icon: 'chart.bar',             label: 'Analytics', route: '/(tabs)/(main)/hub', params: { tab: 'Analytics' } },
  { icon: 'doc.richtext',          label: 'Media Kit', route: '/(tabs)/(main)/hub/media-kit'                },
  { icon: 'qrcode',                label: 'QR Code',   route: '/(tabs)/(main)/hub/qr-code'                  },
];

const FOLLOWER_NAV_ITEMS: NavItem[] = [
  { icon: 'person.crop.rectangle', label: 'Profile', route: '/(tabs)/(main)/hub' },
];

const BOTTOM_ITEMS: NavItem[] = [
  { icon: 'sparkles',             label: 'Dipson',   route: '/nexus'                         },
  { icon: 'gearshape',            label: 'Settings', route: '/(tabs)/(main)/hub/settings'    },
  { icon: 'questionmark.circle',  label: 'Help',     route: '/(tabs)/(main)/hub/help'        },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function HubPanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('personal:hub');
  const isOwner = role === roleCycles[0];

  const go = useCallback((item: NavItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.label === 'Dipson') {
      // Sequential: sidebar closes first, then sheet slides up
      closeSidePanel();
      setTimeout(() => openDipsonSheet(item.params?.context ?? item.label), 300);
      return;
    }
    closeSidePanel();
    setTimeout(() => {
      if (item.params) {
        router.navigate({ pathname: item.route as any, params: item.params });
      } else {
        router.navigate(item.route as any);
      }
    }, 80);
  }, [router]);

  const navItems = isOwner ? OWNER_NAV_ITEMS : FOLLOWER_NAV_ITEMS;

  return (
    <View style={s.root}>

      {/* ── Identity header ── */}
      <View style={s.header}>
        <View style={[s.avatar, { backgroundColor: C.separator }]}>
          <IconSymbol name="person.fill" size={20} color={C.secondary} />
        </View>
        <Text style={[s.name, { color: C.label }]}>Sammy Kalejaiye</Text>
        <Text style={[s.handle, { color: C.secondary }]}>@sammyk</Text>
        {isOwner && (
          <Text style={[s.followers, { color: C.secondary }]}>
            <Text style={{ fontWeight: '600', color: C.label }}>1,247</Text>{' Followers'}
          </Text>
        )}
      </View>

      {/* ── Main nav ── */}
      <View style={s.nav}>
        {navItems.map(item => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.bg }]}
            onPress={() => go(item)}
          >
            <IconSymbol name={item.icon as any} size={24} color={C.label} />
            <Text style={[s.navLabel, { color: C.label }]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={[s.divider, { backgroundColor: C.separator }]} />

      {/* ── Bottom utility (Dipson, Settings, Help) — both roles ── */}
      <View style={s.nav}>
        {BOTTOM_ITEMS.map(item => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.bg }]}
            onPress={() => go(item)}
          >
            <IconSymbol name={item.icon as any} size={24} color={C.label} />
            <Text style={[s.navLabel, { color: C.label }]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 17, fontWeight: '700', letterSpacing: -0.3,
    marginBottom: 2,
  },
  handle: {
    fontSize: 14, fontWeight: '400',
    marginBottom: 6,
  },
  followers: {
    fontSize: 14, fontWeight: '400',
    marginBottom: 4,
  },

  nav: { paddingHorizontal: 8 },

  navRow: {
    flexDirection: 'row', alignItems: 'center',
    height: 44, gap: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  navLabel: { fontSize: 16, fontWeight: '500' },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
    marginHorizontal: 20,
  },

});
