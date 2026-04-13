/**
 * Hub Side Panel — X/Twitter-style.
 * Identity header + bare-icon nav + brand switcher at bottom.
 * Owner only.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAppContext } from '@/context/app-context';
import { useDemoRole } from '@/utils/demo-role-store';
import type { Mode } from '@/types';

// ── Data ──────────────────────────────────────────────────────────────────────

type NavItem = { icon: string; label: string; route: string; params?: Record<string, string> };

const NAV_ITEMS: NavItem[] = [
  { icon: 'person.crop.rectangle', label: 'Profile',   route: '/(tabs)/(main)/hub'                         },
  { icon: 'rectangle.stack',       label: 'Content',   route: '/(tabs)/(main)/hub', params: { tab: 'Content'   } },
  { icon: 'chart.bar',             label: 'Analytics', route: '/(tabs)/(main)/hub', params: { tab: 'Analytics' } },
  { icon: 'doc.richtext',          label: 'Media Kit', route: '/(tabs)/(main)/hub/media-kit'                },
  { icon: 'qrcode',                label: 'QR Code',   route: '/(tabs)/(main)/hub/qr-code'                  },
];

const BOTTOM_ITEMS: NavItem[] = [
  { icon: 'sparkles',             label: 'Dipson',   route: '/nexus'                         },
  { icon: 'gearshape',            label: 'Settings', route: '/(tabs)/(main)/hub/settings'    },
  { icon: 'questionmark.circle',  label: 'Help',     route: '/(tabs)/(main)/hub/help'        },
];

type BrandEntry = { mode: Mode; label: string };
const BRANDS: BrandEntry[] = [
  { mode: 'personal',  label: 'Sammy Kalejaiye'    },
  { mode: 'business',  label: 'KaNeXT'             },
  { mode: 'education', label: 'Lincoln University' },
  { mode: 'sports',    label: "LU Men's Basketball" },
  { mode: 'community', label: 'ICCLA'              },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function HubPanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const { state, switchMode } = useAppContext();
  const [role, , roleCycles] = useDemoRole('personal:hub');
  const isOwner = role === roleCycles[0];
  const [brandOpen, setBrandOpen] = useState(false);

  const go = useCallback((item: NavItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
    setTimeout(() => {
      if (item.params) {
        router.navigate({ pathname: item.route as any, params: item.params });
      } else {
        router.navigate(item.route as any);
      }
    }, 80);
  }, [router]);

  const handleBrandSwitch = useCallback((mode: Mode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBrandOpen(false);
    switchMode(mode);
    closeSidePanel();
    setTimeout(() => router.push('/(tabs)/(main)/hub' as any), 80);
  }, [switchMode, router]);

  if (!isOwner) return null;

  const currentBrand = BRANDS.find(b => b.mode === state.mode)?.label ?? 'Personal';

  return (
    <View style={s.root}>

      {/* ── Identity header ── */}
      <View style={s.header}>
        <View style={[s.avatar, { backgroundColor: C.separator }]}>
          <IconSymbol name="person.fill" size={20} color={C.secondary} />
        </View>
        <Text style={[s.name, { color: C.label }]}>Sammy Kalejaiye</Text>
        <Text style={[s.handle, { color: C.secondary }]}>@sammyk</Text>
        <View style={s.statsRow}>
          <Text style={[s.statNum, { color: C.label }]}>847</Text>
          <Text style={[s.statLabel, { color: C.secondary }]}> Following</Text>
          <Text style={[s.statLabel, { color: C.secondary }]}>{'   '}</Text>
          <Text style={[s.statNum, { color: C.label }]}>1,247</Text>
          <Text style={[s.statLabel, { color: C.secondary }]}> Followers</Text>
        </View>
      </View>

      {/* ── Main nav ── */}
      <View style={s.nav}>
        {NAV_ITEMS.map(item => (
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

      {/* ── Bottom nav ── */}
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

      {/* ── Brand switcher ── */}
      <View style={[s.brandSection, { borderTopColor: C.separator }]}>
        {brandOpen && (
          <View style={[s.brandList, { borderColor: C.separator }]}>
            {BRANDS.map(b => (
              <Pressable
                key={b.mode}
                style={({ pressed }) => [
                  s.brandItem,
                  (b.mode === state.mode || pressed) && { backgroundColor: C.bg },
                ]}
                onPress={() => handleBrandSwitch(b.mode)}
              >
                <Text style={[s.brandItemLabel, { color: b.mode === state.mode ? C.label : C.secondary }]}>
                  {b.label}
                </Text>
                {b.mode === state.mode && (
                  <IconSymbol name="checkmark" size={12} color={C.label} />
                )}
              </Pressable>
            ))}
          </View>
        )}

        <Pressable
          style={({ pressed }) => [s.brandBtn, pressed && { backgroundColor: C.bg }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setBrandOpen(v => !v);
          }}
        >
          <View style={[s.brandAvatar, { backgroundColor: C.separator }]}>
            <IconSymbol name="person.circle" size={16} color={C.secondary} />
          </View>
          <Text style={[s.brandName, { color: C.label }]} numberOfLines={1}>{currentBrand}</Text>
          <IconSymbol
            name={brandOpen ? 'chevron.down' : 'chevron.up'}
            size={12}
            color={C.secondary}
          />
        </Pressable>
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
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
  },
  statNum:   { fontSize: 14, fontWeight: '600' },
  statLabel: { fontSize: 14, fontWeight: '400' },

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

  brandSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
    paddingBottom: 8,
  },
  brandBtn: {
    flexDirection: 'row', alignItems: 'center',
    height: 52, gap: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    marginTop: 2,
  },
  brandAvatar: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  brandName: { flex: 1, fontSize: 14, fontWeight: '500' },

  brandList: {
    marginHorizontal: 8,
    marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    overflow: 'hidden',
  },
  brandItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 11,
    justifyContent: 'space-between',
  },
  brandItemLabel: { fontSize: 14, fontWeight: '500' },
});
