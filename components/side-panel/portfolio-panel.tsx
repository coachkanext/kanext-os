/**
 * Portfolio Side Panel — Personal Mode.
 * Sections nav (Projects, Press, Testimonials, Archive, Credentials).
 * Both Owner and Subscriber see Dipson, Settings, Help at bottom.
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

type NavItem = { icon: string; label: string; route?: string };

const SECTION_ITEMS: NavItem[] = [
  { icon: 'briefcase.fill',      label: 'Projects',     route: '/(tabs)/(main)/portfolio'              },
  { icon: 'newspaper.fill',      label: 'Press',        route: '/(tabs)/(main)/portfolio/press'        },
  { icon: 'quote.bubble.fill',   label: 'Testimonials', route: '/(tabs)/(main)/portfolio/testimonials' },
  { icon: 'doc.text.fill',       label: 'Archive',      route: '/(tabs)/(main)/portfolio/archive'      },
  { icon: 'checkmark.seal.fill', label: 'Credentials',  route: '/(tabs)/(main)/portfolio/credentials'  },
];

const BOTTOM_ITEMS: NavItem[] = [
  { icon: 'sparkles',            label: 'Dipson',   route: '/nexus'                        },
  { icon: 'gearshape',           label: 'Settings', route: '/(tabs)/(main)/portfolio/settings' },
  { icon: 'questionmark.circle', label: 'Help',     route: '/(tabs)/(main)/portfolio/help'  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function PortfolioPanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('personal:portfolio');
  const isOwner = role === roleCycles[0];

  const go = useCallback((item: NavItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.label === 'Dipson') {
      closeSidePanel();
      setTimeout(() => openDipsonSheet('Portfolio'), 300);
      return;
    }
    closeSidePanel();
    setTimeout(() => {
      if (item.route) {
        router.navigate(item.route as any);
      }
    }, 80);
  }, [router]);

  return (
    <View style={s.root}>

      {/* ── Identity header ── */}
      <View style={s.header}>
        <View style={[s.avatar, { backgroundColor: C.separator }]}>
          <IconSymbol name="person.fill" size={20} color={C.secondary} />
        </View>
        <Text style={[s.name, { color: C.label }]}>Laolu Kalejaiye</Text>
        <Text style={[s.handle, { color: C.secondary }]}>@sammyk</Text>
        {isOwner && (
          <Text style={[s.followers, { color: C.secondary }]}>
            <Text style={{ fontWeight: '600', color: C.label }}>1,247</Text>{' Followers'}
          </Text>
        )}
      </View>

      {/* ── Section nav ── */}
      <View style={s.nav}>
        {SECTION_ITEMS.map(item => (
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

      {/* ── Bottom items — both roles ── */}
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
