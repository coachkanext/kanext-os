/**
 * Community KPlay Side Panel — role-aware nav panel for community:kaystudios.
 * Pastor: Courses · Explore · Library + MANAGE (Analytics · Settings)
 * Member: Learn · Games · Kids · Explore · Library  (no MANAGE)
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

export function CommunityKplayPanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('community:kaystudios');
  const isPastor = role === roleCycles[0];

  const go = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  const PASTOR_NAV_ITEMS: NavItem[] = [
    { icon: 'book.fill',             label: 'Courses', route: '/(tabs)/(main)/kaystudios/community-courses' },
    { icon: 'safari.fill',           label: 'Explore',  route: '/(tabs)/(main)/kaystudios/explore' },
    { icon: 'books.vertical.fill',   label: 'Library',  route: '/(tabs)/(main)/kaystudios/library'  },
  ];

  const PASTOR_MANAGE_ITEMS: NavItem[] = [
    { icon: 'chart.bar.fill', label: 'Analytics', route: '/(tabs)/(main)/kaystudios/analytics' },
    { icon: 'gearshape.fill', label: 'Settings',  route: '/(tabs)/(main)/kaystudios/settings'  },
  ];

  const MEMBER_NAV_ITEMS: NavItem[] = [
    { icon: 'graduationcap.fill',              label: 'Learn',   route: '/(tabs)/(main)/kaystudios/community-learn'  },
    { icon: 'gamecontroller.fill',             label: 'Games',   route: '/(tabs)/(main)/kaystudios/community-games'  },
    { icon: 'figure.and.child.holdinghands',   label: 'Kids',    route: '/(tabs)/(main)/kaystudios/community-kids'   },
    { icon: 'safari.fill',                     label: 'Explore', route: '/(tabs)/(main)/kaystudios/explore'          },
    { icon: 'books.vertical.fill',             label: 'Library', route: '/(tabs)/(main)/kaystudios/library'          },
  ];

  const navItems = isPastor ? PASTOR_NAV_ITEMS : MEMBER_NAV_ITEMS;

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

      {isPastor && (
        <>
          <View style={[s.divider, { backgroundColor: C.separator }]} />
          <Text style={[s.sectionLabel, { color: C.secondary }]}>Manage</Text>
          {PASTOR_MANAGE_ITEMS.map((item, idx) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                s.row,
                pressed && { backgroundColor: C.bg },
                idx < PASTOR_MANAGE_ITEMS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
              ]}
              onPress={() => go(item.route)}
            >
              <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
              <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
            </Pressable>
          ))}
        </>
      )}
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
