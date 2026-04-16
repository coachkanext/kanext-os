/**
 * Education Hub Side Panel — matches community-hub-panel.tsx format.
 * Identity header + nav rows (size 24, height 44, gap 16) + divider + Dipson / Settings / Help.
 *
 * President: Profile, Academics, Enrollment, Students, Finance, Faculty
 * Student:   Profile, My Courses, Registration, Financial Aid
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

type NavItem = { icon: string; label: string; route?: string; isDipson?: boolean };

const PRESIDENT_NAV: NavItem[] = [
  { icon: 'person.crop.rectangle.fill', label: 'Profile',    route: '/(tabs)/(main)/hub/education'       },
  { icon: 'book.fill',                  label: 'Academics',  route: '/(tabs)/(main)/hub/edu-academics'   },
  { icon: 'tray.fill',                  label: 'Enrollment', route: '/(tabs)/(main)/hub/edu-enrollment'  },
  { icon: 'person.3.fill',              label: 'Students',   route: '/(tabs)/(main)/hub/edu-students'    },
  { icon: 'dollarsign.circle.fill',     label: 'Finance',    route: '/(tabs)/(main)/hub/edu-finance'     },
  { icon: 'person.badge.clock.fill',    label: 'Faculty',    route: '/(tabs)/(main)/hub/edu-faculty'     },
];

const STUDENT_NAV: NavItem[] = [
  { icon: 'person.crop.rectangle.fill', label: 'Profile',       route: '/(tabs)/(main)/hub/education'          },
  { icon: 'book.fill',                  label: 'My Courses',    route: '/(tabs)/(main)/hub/edu-my-courses'     },
  { icon: 'calendar.badge.plus',        label: 'Registration',  route: '/(tabs)/(main)/hub/edu-registration'   },
  { icon: 'creditcard.fill',            label: 'Financial Aid', route: '/(tabs)/(main)/hub/edu-financial-aid'  },
];

const BOTTOM_ITEMS: NavItem[] = [
  { icon: 'sparkles',            label: 'Dipson',   isDipson: true                            },
  { icon: 'gearshape',           label: 'Settings', route: '/(tabs)/(main)/hub/edu-settings'  },
  { icon: 'questionmark.circle', label: 'Help',     route: '/(tabs)/(main)/hub/edu-help'      },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function EducationHubPanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('education');
  const isPresident = role === roleCycles[0];

  const go = useCallback((item: NavItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.isDipson) {
      closeSidePanel();
      setTimeout(() => openDipsonSheet('Education'), 300);
      return;
    }
    closeSidePanel();
    setTimeout(() => { if (item.route) router.navigate(item.route as any); }, 80);
  }, [router]);

  const navItems = isPresident ? PRESIDENT_NAV : STUDENT_NAV;

  return (
    <View style={s.root}>

      {/* ── Identity header ── */}
      <View style={s.header}>
        <View style={[s.avatar, { backgroundColor: C.separator }]}>
          <Text style={s.avatarEmoji}>🏛️</Text>
        </View>
        <Text style={[s.name, { color: C.label }]}>Lincoln University (CA)</Text>
        <Text style={[s.handle, { color: C.secondary }]}>@lincolnu · Oakland, CA</Text>
        <Text style={[s.followers, { color: C.secondary }]}>
          <Text style={{ fontWeight: '600', color: C.label }}>436</Text>{' Students'}
        </Text>
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

      {/* ── Bottom utilities ── */}
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

  header:    { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  avatar:    { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarEmoji: { fontSize: 22 },
  name:      { fontSize: 17, fontWeight: '700', letterSpacing: -0.3, marginBottom: 2 },
  handle:    { fontSize: 14, fontWeight: '400', marginBottom: 6 },
  followers: { fontSize: 14, fontWeight: '400' },

  nav:       { paddingHorizontal: 8 },
  navRow:    { flexDirection: 'row', alignItems: 'center', height: 44, gap: 16, paddingHorizontal: 12, borderRadius: 8 },
  navLabel:  { fontSize: 16, fontWeight: '500' },

  divider:   { height: StyleSheet.hairlineWidth, marginVertical: 8, marginHorizontal: 20 },
});
