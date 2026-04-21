/**
 * Personal Social Side Panel — X/Twitter-style.
 * Identity header + large-icon nav.
 * Owner:      Feed · Explore · Drafts · Scheduled · Posting Policy
 *             Bottom: Dipson · Settings · Help
 * Subscriber: Feed · Explore
 *             Bottom: Dipson · Settings · Help
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { openDipsonSheet } from '@/utils/global-dipson-sheet';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Data ──────────────────────────────────────────────────────────────────────

type NavItem = {
  icon: string;
  label: string;
  route?: string;
  special?: string;
};

const OWNER_NAV_ITEMS: NavItem[] = [
  { icon: 'rectangle.stack',      label: 'Feed',           route: '/(tabs)/(main)/social'                  },
  { icon: 'number',               label: 'Channels',       route: '/(tabs)/(main)/social/channels'         },
  { icon: 'doc.text',             label: 'Drafts',         route: '/(tabs)/(main)/social/drafts'           },
  { icon: 'calendar.badge.clock', label: 'Scheduled',      route: '/(tabs)/(main)/social/scheduled'        },
  { icon: 'shield.fill',          label: 'Posting Policy', route: '/(tabs)/(main)/social/posting-policy'   },
];

const SUBSCRIBER_NAV_ITEMS: NavItem[] = [
  { icon: 'rectangle.stack',      label: 'Feed',      route: '/(tabs)/(main)/social'           },
  { icon: 'number',               label: 'Channels',  route: '/(tabs)/(main)/social/channels'  },
  { icon: 'doc.text',             label: 'Drafts',    route: '/(tabs)/(main)/social/drafts'    },
  { icon: 'calendar.badge.clock', label: 'Scheduled', route: '/(tabs)/(main)/social/scheduled' },
];

const BOTTOM_ITEMS: NavItem[] = [
  { icon: 'sparkles',            label: 'Dipson',   special: 'dipson'                        },
  { icon: 'gearshape',           label: 'Settings', route: '/(tabs)/(main)/social/settings'  },
  { icon: 'questionmark.circle', label: 'Help',     route: '/(tabs)/(main)/social/help'      },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function SocialPanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('personal:social');
  const isOwner = role === roleCycles[0];

  const go = useCallback((item: NavItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.special === 'dipson') {
      closeSidePanel();
      setTimeout(() => openDipsonSheet('Social'), 300);
      return;
    }
    if (!item.route) return;
    closeSidePanel();
    setTimeout(() => router.navigate(item.route as any), 80);
  }, [router]);

  const navItems = isOwner ? OWNER_NAV_ITEMS : SUBSCRIBER_NAV_ITEMS;

  return (
    <View style={s.root}>

      {/* ── Identity header ── */}
      <View style={s.header}>
        <View style={[s.avatar, { backgroundColor: C.separator }]}>
          <IconSymbol name="person.fill" size={20} color={C.secondary} />
        </View>
        <Text style={[s.name, { color: C.label }]}>Laolu Kalejaiye</Text>
        <Text style={[s.handle, { color: C.secondary }]}>@sammyk</Text>
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

      {/* ── Bottom utility: Dipson, Settings, Help ── */}
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
