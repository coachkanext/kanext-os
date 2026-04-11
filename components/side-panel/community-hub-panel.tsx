/**
 * Community Hub Side Panel — nav items for community/church screens.
 * Pattern: studios-panel.tsx (simple nav items only, no stats, no brand header).
 *
 * Pastor: Church Overview, Services, Groups, Volunteers + MANAGE: Care Requests, Check-In
 * Member: Church Overview, Services, Groups (no MANAGE section)
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';

export function CommunityHubPanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('community:hub');
  const isPastor = role === roleCycles[0];

  const go = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  const PASTOR_NAV_ITEMS = [
    { icon: 'chart.bar.fill',    label: 'Church Overview', route: '/(tabs)/(main)/hub/community' },
    { icon: 'music.note.list',   label: 'Services',        route: '/(tabs)/(main)/hub/services'  },
    { icon: 'person.3.fill',     label: 'Groups',          route: '/(tabs)/(main)/hub/groups'    },
    { icon: 'hand.raised.fill',  label: 'Volunteers',      route: '/(tabs)/(main)/hub/volunteers' },
  ];

  const MEMBER_NAV_ITEMS = [
    { icon: 'chart.bar.fill',  label: 'Church Overview', route: '/(tabs)/(main)/hub/community' },
    { icon: 'music.note.list', label: 'Services',        route: '/(tabs)/(main)/hub/services'  },
    { icon: 'person.3.fill',   label: 'Groups',          route: '/(tabs)/(main)/hub/groups'    },
  ];

  const MANAGE_ITEMS = [
    { icon: 'heart.text.square.fill',  label: 'Care Requests', route: '/(tabs)/(main)/hub/care-requests' },
    { icon: 'checkmark.circle.fill',   label: 'Check-In',      route: '/(tabs)/(main)/hub/check-in'      },
  ];

  const NAV_ITEMS = isPastor ? PASTOR_NAV_ITEMS : MEMBER_NAV_ITEMS;

  return (
    <View style={[s.root, { backgroundColor: C.surface }]}>
      {NAV_ITEMS.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            s.row,
            pressed && { backgroundColor: C.bg },
            idx < NAV_ITEMS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
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
          {MANAGE_ITEMS.map((item, idx) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                s.row,
                pressed && { backgroundColor: C.bg },
                idx < MANAGE_ITEMS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
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
