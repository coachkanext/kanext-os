/**
 * Sports Hub Side Panel — White & Silver theme, role-aware nav.
 * Head Coach: Program Overview, Film Room, Scouting, Game Day + MANAGE section.
 * Player: My Dashboard, My Film, My Development, My Academics.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useDemoRole } from '@/utils/demo-role-store';

const BG      = '#F2F4FA';
const SURFACE = '#FFFFFF';
const BORDER  = 'rgba(0,0,0,0.06)';
const DEEP    = '#0A0C14';
const SUB     = '#6B7080';
const MUTED   = '#A8AABC';
const SILVER  = '#9BA5B8';
const PRESSED = 'rgba(0,0,0,0.04)';

export function SportsHubPanel() {
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('sports:hub');
  const isHeadCoach = role === roleCycles[0];

  const go = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  const COACH_NAV = [
    { icon: 'house.fill',               label: 'Program Overview', route: '/(tabs)/(main)/hub/sports-program-overview' },
    { icon: 'film.fill',                label: 'Film Room',        route: '/(tabs)/(main)/hub/sports-film-room'        },
    { icon: 'doc.text.magnifyingglass', label: 'Scouting',         route: '/(tabs)/(main)/hub/sports-scouting'         },
    { icon: 'gamecontroller.fill',      label: 'Game Day',         route: '/(tabs)/(main)/hub/sports-game-day'         },
  ];

  const COACH_MANAGE = [
    { icon: 'list.clipboard.fill',   label: 'Practice Plans', route: '/(tabs)/(main)/hub/sports-practice-plans' },
    { icon: 'checkmark.shield.fill', label: 'Compliance',     route: '/(tabs)/(main)/hub/sports-compliance'     },
    { icon: 'person.3.fill',         label: 'Staff',          route: '/(tabs)/(main)/hub/sports-staff'          },
  ];

  const PLAYER_NAV = [
    { icon: 'house.fill',         label: 'My Dashboard',   route: '/(tabs)/(main)/hub/sports-player-dashboard'   },
    { icon: 'film.fill',          label: 'My Film',        route: '/(tabs)/(main)/hub/sports-player-film'        },
    { icon: 'figure.run',         label: 'My Development', route: '/(tabs)/(main)/hub/sports-player-development' },
    { icon: 'graduationcap.fill', label: 'My Academics',   route: '/(tabs)/(main)/hub/sports-player-academics'   },
  ];

  const navItems = isHeadCoach ? COACH_NAV : PLAYER_NAV;

  return (
    <View style={s.root}>
      {navItems.map(item => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [s.row, pressed && s.rowPressed]}
          onPress={() => go(item.route)}
        >
          <View style={s.iconWrap}>
            <IconSymbol name={item.icon as any} size={15} color={SUB} />
          </View>
          <Text style={s.rowLabel}>{item.label}</Text>
          <IconSymbol name="chevron.right" size={11} color={MUTED} />
        </Pressable>
      ))}

      {isHeadCoach && (
        <>
          {/* Silver gradient divider */}
          <LinearGradient
            colors={['transparent', SILVER, 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={s.divider}
          />
          <Text style={s.sectionLabel}>MANAGE</Text>
          {COACH_MANAGE.map(item => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [s.row, pressed && s.rowPressed]}
              onPress={() => go(item.route)}
            >
              <View style={s.iconWrap}>
                <IconSymbol name={item.icon as any} size={15} color={SUB} />
              </View>
              <Text style={s.rowLabel}>{item.label}</Text>
              <IconSymbol name="chevron.right" size={11} color={MUTED} />
            </Pressable>
          ))}
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13, gap: 12,
    borderRadius: 10, marginHorizontal: 8,
  },
  rowPressed: { backgroundColor: PRESSED },

  iconWrap: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: SURFACE,
    borderWidth: 1, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },

  rowLabel: { flex: 1, fontSize: 15, color: DEEP, fontWeight: '500' },

  divider: { height: 1, marginVertical: 10, marginHorizontal: 16 },

  sectionLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.4,
    textTransform: 'uppercase', color: MUTED,
    paddingHorizontal: 24, paddingBottom: 4, paddingTop: 4,
  },
});
