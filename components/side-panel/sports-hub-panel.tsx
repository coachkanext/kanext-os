/**
 * Sports Hub Side Panel — Warm linen palette (cream + carbon).
 * Head Coach: Home, Roster, Recruiting, Film Room, Scouting, Game Day, Development + MANAGE section.
 * Player: Home, My Profile, My Film, My Development, My Academics, My NIL.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useDemoRole } from '@/utils/demo-role-store';

type Dot = { color: string; count?: number } | null;

export function SportsHubPanel() {
  const C = useColors();
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('sports:hub');
  const isHeadCoach = role === roleCycles[0];

  const go = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  const COACH_NAV: { icon: string; label: string; route: string; dot: Dot }[] = [
    { icon: 'house.fill',                label: 'Home',        route: '/(tabs)/(main)/hub/sports-program-overview',   dot: null },
    { icon: 'person.3.fill',             label: 'Roster',      route: '/(tabs)/(main)/roster',                        dot: { color: '#D4A843' } },
    { icon: 'figure.run',                label: 'Recruiting',  route: '/(tabs)/(main)/recruits',                      dot: { color: '#5A8A6E' } },
    { icon: 'film.fill',                 label: 'Film Room',   route: '/(tabs)/(main)/hub/sports-film-room',           dot: { color: '#B85C5C', count: 2 } },
    { icon: 'doc.text.magnifyingglass',  label: 'Scouting',    route: '/(tabs)/(main)/hub/sports-scouting',            dot: null },
    { icon: 'gamecontroller.fill',       label: 'Game Day',    route: '/(tabs)/(main)/hub/sports-game-day',            dot: null },
    { icon: 'chart.line.uptrend.xyaxis', label: 'Development', route: '/(tabs)/(main)/hub/sports-player-development',  dot: null },
  ];

  const COACH_MANAGE: { icon: string; label: string; route: string; dot: Dot }[] = [
    { icon: 'list.clipboard.fill',    label: 'Practice Plans', route: '/(tabs)/(main)/hub/sports-practice-plans', dot: null },
    { icon: 'checkmark.shield.fill',  label: 'Compliance',     route: '/(tabs)/(main)/hub/sports-compliance',     dot: { color: '#D4A843' } },
    { icon: 'dollarsign.circle.fill', label: 'Scholarships',   route: '/(tabs)/(main)/hub/sports-scholarships',   dot: null },
    { icon: 'briefcase.fill',         label: 'NIL',            route: '/(tabs)/(main)/hub/sports-nil',            dot: null },
    { icon: 'megaphone.fill',         label: 'Booster',        route: '/(tabs)/(main)/hub/sports-booster',        dot: null },
    { icon: 'person.2.fill',          label: 'Staff',          route: '/(tabs)/(main)/hub/sports-staff',          dot: null },
  ];

  const PLAYER_NAV = [
    { icon: 'house.fill',         label: 'Home',           route: '/(tabs)/(main)/hub/sports-player-dashboard'   },
    { icon: 'person.fill',        label: 'My Profile',     route: '/(tabs)/(main)/hub/sports-player-profile'     },
    { icon: 'film.fill',          label: 'My Film',        route: '/(tabs)/(main)/hub/sports-player-film'        },
    { icon: 'figure.run',         label: 'My Development', route: '/(tabs)/(main)/hub/sports-player-development' },
    { icon: 'graduationcap.fill', label: 'My Academics',   route: '/(tabs)/(main)/hub/sports-player-academics'   },
    { icon: 'briefcase.fill',     label: 'My NIL',         route: '/(tabs)/(main)/hub/sports-player-nil'         },
  ];

  const navItems = isHeadCoach ? COACH_NAV : PLAYER_NAV;

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {navItems.map(item => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [s.row, pressed && { backgroundColor: C.surface2 }]}
          onPress={() => go(item.route)}
        >
          <View style={[s.iconWrap, { backgroundColor: C.surface }]}>
            <IconSymbol name={item.icon as any} size={15} color={C.label} />
          </View>
          <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {'dot' in item && item.dot && item.dot.count ? (
              <View style={{ backgroundColor: item.dot.color, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1, minWidth: 18, alignItems: 'center' }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#FFFFFF' }}>{item.dot.count}</Text>
              </View>
            ) : 'dot' in item && item.dot ? (
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: item.dot.color }} />
            ) : null}
            <IconSymbol name="chevron.right" size={11} color={C.secondary} />
          </View>
        </Pressable>
      ))}

      {isHeadCoach && (
        <>
          <View style={[s.divider, { backgroundColor: C.separator }]} />
          <Text style={[s.sectionLabel, { color: C.secondary }]}>MANAGE</Text>
          {COACH_MANAGE.map(item => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [s.row, pressed && { backgroundColor: C.surface2 }]}
              onPress={() => go(item.route)}
            >
              <View style={[s.iconWrap, { backgroundColor: C.surface }]}>
                <IconSymbol name={item.icon as any} size={15} color={C.label} />
              </View>
              <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {item.dot && item.dot.count ? (
                  <View style={{ backgroundColor: item.dot.color, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1, minWidth: 18, alignItems: 'center' }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#FFFFFF' }}>{item.dot.count}</Text>
                  </View>
                ) : item.dot ? (
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: item.dot.color }} />
                ) : null}
                <IconSymbol name="chevron.right" size={11} color={C.secondary} />
              </View>
            </Pressable>
          ))}
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13, gap: 12,
    borderRadius: 10, marginHorizontal: 8,
  },

  iconWrap: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },

  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },

  divider: { height: StyleSheet.hairlineWidth, marginVertical: 10, marginHorizontal: 16 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 24, paddingBottom: 4, paddingTop: 4,
  },
});
