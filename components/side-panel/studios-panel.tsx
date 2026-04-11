import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';

export function StudiosPanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('personal:kaystudios');
  const isOwner = role === roleCycles[0];

  const go = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  const NAV_ITEMS = isOwner ? [
    { icon: 'square.grid.2x2.fill', label: 'My Courses', route: '/(tabs)/(main)/kaystudios' },
    { icon: 'safari.fill',          label: 'Explore',    route: '/(tabs)/(main)/kaystudios/explore' },
    { icon: 'books.vertical.fill',  label: 'Library',    route: '/(tabs)/(main)/kaystudios/library'  },
  ] : [
    { icon: 'play.rectangle.fill',  label: 'Courses',    route: '/(tabs)/(main)/kaystudios' },
    { icon: 'safari.fill',          label: 'Explore',    route: '/(tabs)/(main)/kaystudios/explore' },
    { icon: 'books.vertical.fill',  label: 'Library',    route: '/(tabs)/(main)/kaystudios/library'  },
  ];

  const MANAGE_ITEMS = [
    { icon: 'chart.bar.fill',  label: 'Analytics', route: '/(tabs)/(main)/kaystudios/analytics' },
    { icon: 'gearshape.fill',  label: 'Settings',  route: '/(tabs)/(main)/kaystudios/settings'  },
  ];

  return (
    <View style={[s.root, { backgroundColor: C.surface }]}>
      {/* Nav items */}
      {NAV_ITEMS.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [s.row, pressed && { backgroundColor: C.bg }, idx < NAV_ITEMS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
          onPress={() => go(item.route)}
        >
          <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
          <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
        </Pressable>
      ))}

      {/* MANAGE section — Owner only */}
      {isOwner && (
        <>
          <View style={[s.divider, { backgroundColor: C.separator }]} />
          <Text style={[s.sectionLabel, { color: C.secondary }]}>Manage</Text>
          {MANAGE_ITEMS.map((item, idx) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [s.row, pressed && { backgroundColor: C.bg }, idx < MANAGE_ITEMS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
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
    root: { flex: 1 },
    divider: { height: StyleSheet.hairlineWidth, marginVertical: 12, marginHorizontal: 16 },
    sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 2, marginTop: 4 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13, borderRadius: 8 },
    rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },
    rowLabel: { flex: 1, fontSize: 15 },
  });
}
