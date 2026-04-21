/**
 * Athletics Hub — LU Men's Basketball Program Overview.
 * Matches Personal Hub profile page pattern exactly:
 * photo cover → floating top bar → overlapping avatar → identity → metrics → sections.
 * Head Coach: NEXT GAME, ROSTER HEALTH, RECENT RESULTS, SEASON STATS, RECRUITING, STAFF.
 * Player: NEXT GAME, MY STATS, TEAM LEADERS, MY TOOLS.
 */

import React, { useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, Image, StyleSheet, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';
const GOLD    = '#B8943E';

const TOP_BAR_H   = 52;
const AVATAR_SIZE = 80;
const AVATAR_OVR  = AVATAR_SIZE / 2;

// ─── Data ─────────────────────────────────────────────────────────────────────

const TEAM = {
  name:      "Lincoln Men's Basketball",
  sub:       'SWS Conference — Laney College',
  bio:       'HC: William Middlebrooks  ·  AC: Sammy Kalejaiye',
  kr:        72,
  sysFit:    53,
  record:    '15-8',
  streak:    'W5',
  champions: 'SWS Reg. Season + GAAC Tournament Champions · Back to Back',
};

const NEXT_GAME = {
  opponent: 'Season Complete',
  oppKR:    0,
  date:     'Final Record: 15-8',
  time:     '',
  location: 'GAAC Tournament Champions',
  isHome:   true,
};

const ROSTER_HEALTH = [
  { initials: 'LK', name: 'Laolu Kalejaiye',   status: 'available' as const },
  { initials: 'BW', name: 'Brandon Williams',   status: 'available' as const },
  { initials: 'CM', name: 'Claude McKesey',     status: 'available' as const },
  { initials: 'NC', name: 'Nathan Chatelain',   status: 'available' as const },
  { initials: 'AH', name: 'Adrian Hernandez',   status: 'available' as const },
  { initials: 'CP', name: 'Chris Plantey',      status: 'available' as const },
  { initials: 'SW', name: 'Samuel Wall',        status: 'limited'   as const },
  { initials: 'PD', name: 'Paul Diomande',      status: 'out'       as const },
];

const RECENT_RESULTS = [
  { opp: 'Cal Intercontinental',   result: 'W', score: '92-80', krDelta: +3 },
  { opp: 'Cal Intercontinental',   result: 'W', score: '99-76', krDelta: +3 },
  { opp: 'Daytona Beach Christian',result: 'W', score: '83-54', krDelta: +4 },
  { opp: 'Cal Intercontinental',   result: 'W', score: '97-77', krDelta: +3 },
  { opp: 'John Melvin Christian',  result: 'W', score: '98-90', krDelta: +2 },
];

const SEASON_STATS = [
  { label: 'PPG',    value: '90.0' },
  { label: 'OppPPG', value: '93.4' },
  { label: 'FG%',    value: '43.9' },
  { label: '3P%',    value: '31.7' },
  { label: 'RPG',    value: '29.0' },
  { label: 'APG',    value: '16.0' },
];

const STAFF = [
  { name: 'William Middlebrooks', role: 'Head Coach' },
  { name: 'Sammy Kalejaiye',      role: 'Asst. Coach' },
  { name: 'Marcus Reed',          role: 'Team Manager' },
];

const MY_STATS = [
  { label: 'PPG', value: '27.3' },
  { label: 'RPG', value: '2.9'  },
  { label: 'APG', value: '2.9'  },
  { label: 'FG%', value: '39.5' },
];

const TEAM_LEADERS = [
  { name: 'Laolu Kalejaiye',  stat: '27.3 PPG', pos: 'G' },
  { name: 'Brandon Williams', stat: '19.3 PPG', pos: 'G' },
  { name: 'Claude McKesey',   stat: '12.4 PPG', pos: 'G' },
];

function healthColor(s: 'available' | 'limited' | 'out'): string {
  return s === 'available' ? GAIN : s === 'limited' ? CAUTION : HEAT;
}
function krColor(kr: number): string {
  return kr >= 90 ? GOLD : kr >= 80 ? GAIN : kr >= 70 ? '#1A1714' : kr >= 60 ? CAUTION : HEAT;
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SH({ title, C }: { title: string; C: any }) {
  return (
    <Text style={[s.sh, { color: C.secondary }]}>{title}</Text>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SportsHub() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [role, toggleRole, roleCycles] = useDemoRole('sports:hub');
  const isCoach = role === roleCycles[0];

  const COVER_H = 220 + insets.top + TOP_BAR_H;

  useFocusEffect(useCallback(() => { resetFooter(); }, []));
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(insets.top + TOP_BAR_H + 10);

  const go = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* ── Floating top bar ─────────────────────────────────────────────── */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, height: insets.top + TOP_BAR_H, opacity }]}>
        <View style={s.topBar}>
          <KMenuButton onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} />
          <View style={s.topCenter}>
            <Text style={s.topTitle}>Hub</Text>
          </View>
          <RolePill role={role} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleRole(); }} />
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* ── Cover photo + overlapping avatar ─────────────────────────── */}
        <View style={{ position: 'relative', marginBottom: AVATAR_OVR + 12 }}>
          <View style={{ height: COVER_H, overflow: 'hidden' }}>
            <Image
              source={require('@/assets/images/lincoln-back-to-back.jpg')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top + 70, backgroundColor: 'rgba(0,0,0,0.40)' }} />
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'rgba(0,0,0,0.20)' }} />
          </View>
          <View style={{ position: 'absolute', bottom: -AVATAR_OVR, left: 20 }}>
            <View style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, borderWidth: 3, borderColor: C.bg, overflow: 'hidden' }}>
              <Image source={require('@/assets/images/lu-mbb-logo.png')} style={{ width: '100%', height: '100%', transform: [{ scale: 1.5 }] }} resizeMode="cover" />
            </View>
          </View>
        </View>

        {/* ── Identity ─────────────────────────────────────────────────── */}
        <View style={[s.identity, { paddingHorizontal: 20 }]}>
          <Text style={[s.name, { color: C.label }]}>{TEAM.name}</Text>
          <Text style={[s.handle, { color: C.secondary }]}>{TEAM.sub}</Text>
          <Text style={[s.bio, { color: C.label }]}>{TEAM.bio}</Text>
        </View>

        {/* ── Key metrics + action row ──────────────────────────────────── */}
        <View style={[s.metricActionRow, { paddingHorizontal: 20, borderColor: C.separator }]}>
          <Text style={{ fontSize: 14, color: C.secondary }}>
            <Text style={{ fontWeight: '700', color: krColor(TEAM.kr) }}>{TEAM.kr}</Text>{' KR  ·  '}
            <Text style={{ fontWeight: '700', color: GAIN }}>{TEAM.sysFit}%</Text>{' Fit  ·  '}
            <Text style={{ fontWeight: '700', color: C.label }}>{TEAM.record}</Text>
          </Text>
          <Pressable style={[s.editBtn, { borderColor: C.separator }]}>
            <Text style={[s.editBtnText, { color: C.label }]}>Edit</Text>
          </Pressable>
        </View>

        {/* ── Champions badge row ───────────────────────────────────────── */}
        <View style={[s.champRow, { borderTopColor: C.separator, borderBottomColor: C.separator }]}>
          <View style={[s.champBadge, { backgroundColor: GOLD + '18', borderColor: GOLD + '44' }]}>
            <Text style={[s.champText, { color: GOLD }]}>🏆 {TEAM.champions}</Text>
          </View>
        </View>

        {isCoach ? (
          <>
            {/* NEXT GAME */}
            <View style={s.section}>
              <SH title="Next Game" C={C} />
              <Pressable
                style={({ pressed }) => [s.card, { backgroundColor: C.surface }, pressed && { opacity: 0.8 }]}
                onPress={() => go('/(tabs)/(main)/hub/sports-scouting')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: C.label }]}>{NEXT_GAME.opponent}</Text>
                    <Text style={[s.cardMeta, { color: C.secondary, marginTop: 3 }]}>{NEXT_GAME.date} · {NEXT_GAME.time}</Text>
                    <Text style={[s.cardMeta, { color: C.secondary }]}>{NEXT_GAME.isHome ? '🏠 Home' : '✈️ Away'} · {NEXT_GAME.location}</Text>
                  </View>
                  <View style={{ alignItems: 'center', gap: 2 }}>
                    <Text style={[{ fontSize: 22, fontWeight: '800', color: krColor(TEAM.kr) }]}>{TEAM.kr}</Text>
                    <Text style={{ fontSize: 9, color: C.secondary, fontWeight: '600' }}>vs {NEXT_GAME.oppKR}</Text>
                  </View>
                </View>
                <Text style={[s.cardCTA, { color: C.secondary }]}>Tap for Scouting Report →</Text>
              </Pressable>
            </View>

            {/* ROSTER HEALTH */}
            <View style={s.section}>
              <SH title="Roster Health" C={C} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
                {ROSTER_HEALTH.map(p => (
                  <View key={p.initials} style={s.healthPlayer}>
                    <View style={[s.healthAvatar, { borderColor: healthColor(p.status), backgroundColor: C.surface }]}>
                      <Text style={[s.healthInitials, { color: C.label }]}>{p.initials}</Text>
                    </View>
                    <Text style={[s.healthName, { color: C.secondary }]} numberOfLines={1}>{p.initials}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* RECENT RESULTS */}
            <View style={s.section}>
              <SH title="Recent Results" C={C} />
              {RECENT_RESULTS.map((r, i) => (
                <View
                  key={i}
                  style={[s.card, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }]}
                >
                  <View style={[s.resultBadge, { backgroundColor: r.result === 'W' ? GAIN + '22' : HEAT + '22' }]}>
                    <Text style={[s.resultBadgeText, { color: r.result === 'W' ? GAIN : HEAT }]}>{r.result}</Text>
                  </View>
                  <Text style={[s.cardTitle, { color: C.label, flex: 1, fontSize: 14 }]}>{r.opp}</Text>
                  <Text style={[s.cardMeta, { color: C.secondary }]}>{r.score}</Text>
                  <Text style={[{ fontSize: 11, fontWeight: '700', color: r.krDelta > 0 ? GAIN : HEAT, minWidth: 46, textAlign: 'right' }]}>
                    {r.krDelta > 0 ? '+' : ''}{r.krDelta} KR
                  </Text>
                </View>
              ))}
            </View>

            {/* SEASON STATS */}
            <View style={s.section}>
              <SH title="Season Stats" C={C} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
                {SEASON_STATS.map(st => (
                  <View key={st.label} style={[s.statPill, { backgroundColor: C.surface, marginRight: 8 }]}>
                    <Text style={[s.statPillValue, { color: C.label }]}>{st.value}</Text>
                    <Text style={[s.statPillLabel, { color: C.secondary }]}>{st.label}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* RECRUITING */}
            <View style={s.section}>
              <SH title="Recruiting" C={C} />
              <Pressable
                style={({ pressed }) => [s.card, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 0 }, pressed && { opacity: 0.8 }]}
                onPress={() => go('/(tabs)/(main)/roster/recruits')}
              >
                <View style={[s.iconBox, { backgroundColor: C.separator }]}>
                  <IconSymbol name="person.badge.plus" size={16} color={C.label} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.cardTitle, { color: C.label }]}>Recruiting Board</Text>
                  <Text style={[s.cardMeta, { color: C.secondary, marginTop: 1 }]}>8 Committed · 16 Offered · 24 Total</Text>
                </View>
                <IconSymbol name="chevron.right" size={14} color={C.muted as string} />
              </Pressable>
            </View>

            {/* STAFF */}
            <View style={s.section}>
              <SH title="Staff" C={C} />
              {STAFF.map((m, i) => (
                <View key={i} style={[s.card, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }]}>
                  <View style={[s.personAvatar, { backgroundColor: C.separator }]}>
                    <Text style={[s.personInitials, { color: C.label }]}>{m.name.split(' ').map(w => w[0]).join('')}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: C.label }]}>{m.name}</Text>
                    <Text style={[s.cardMeta, { color: C.secondary, marginTop: 1 }]}>{m.role}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* QUICK ACCESS */}
            <View style={s.section}>
              <SH title="Quick Access" C={C} />
              {[
                { icon: 'film.fill',                label: 'Film Room',      sub: 'Game & practice film',         route: '/(tabs)/(main)/hub/sports-film-room'      },
                { icon: 'doc.text.magnifyingglass', label: 'Scouting',       sub: 'Opponent intel & reports',     route: '/(tabs)/(main)/hub/sports-scouting'       },
                { icon: 'gamecontroller.fill',      label: 'Game Day',       sub: 'Live stats & game ops',        route: '/(tabs)/(main)/hub/sports-game-day'       },
                { icon: 'list.clipboard.fill',      label: 'Practice Plans', sub: 'Drills & session planning',    route: '/(tabs)/(main)/hub/sports-practice-plans' },
                { icon: 'checkmark.shield.fill',    label: 'Compliance',     sub: 'Eligibility & rule tracking',  route: '/(tabs)/(main)/hub/sports-compliance'     },
              ].map(item => (
                <Pressable
                  key={item.label}
                  style={({ pressed }) => [s.card, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }, pressed && { opacity: 0.8 }]}
                  onPress={() => go(item.route)}
                >
                  <View style={[s.iconBox, { backgroundColor: C.separator }]}>
                    <IconSymbol name={item.icon as any} size={16} color={C.label} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: C.label }]}>{item.label}</Text>
                    <Text style={[s.cardMeta, { color: C.secondary, marginTop: 1 }]}>{item.sub}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={C.muted as string} />
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* PLAYER — NEXT GAME */}
            <View style={s.section}>
              <SH title="Next Game" C={C} />
              <View style={[s.card, { backgroundColor: C.surface }]}>
                <Text style={[s.cardTitle, { color: C.label }]}>{NEXT_GAME.opponent}</Text>
                <Text style={[s.cardMeta, { color: C.secondary, marginTop: 3 }]}>{NEXT_GAME.date} · {NEXT_GAME.time} · {NEXT_GAME.isHome ? 'Home' : 'Away'}</Text>
                <View style={[{ marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: GAIN + '22', alignSelf: 'flex-start' }]}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: GAIN }}>W13 Winning Streak</Text>
                </View>
              </View>
            </View>

            {/* MY STATS */}
            <View style={s.section}>
              <SH title="My Stats" C={C} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
                {MY_STATS.map(st => (
                  <View key={st.label} style={[s.statPill, { backgroundColor: C.surface, marginRight: 8 }]}>
                    <Text style={[s.statPillValue, { color: C.label }]}>{st.value}</Text>
                    <Text style={[s.statPillLabel, { color: C.secondary }]}>{st.label}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* TEAM LEADERS */}
            <View style={s.section}>
              <SH title="Team Leaders" C={C} />
              {TEAM_LEADERS.map((p, i) => (
                <View key={i} style={[s.card, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }]}>
                  <View style={[s.personAvatar, { backgroundColor: C.separator }]}>
                    <Text style={[s.personInitials, { color: C.label }]}>{p.pos}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: C.label }]}>{p.name}</Text>
                    <Text style={[s.cardMeta, { color: C.secondary, marginTop: 1 }]}>{p.stat}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* MY TOOLS */}
            <View style={s.section}>
              <SH title="My Tools" C={C} />
              {[
                { icon: 'film.fill',          label: 'My Film',         sub: 'Game tape & highlights',     route: '/(tabs)/(main)/hub/sports-player-film'        },
                { icon: 'figure.run',         label: 'My Development',  sub: 'Skill tracking & goals',     route: '/(tabs)/(main)/hub/sports-player-development' },
                { icon: 'graduationcap.fill', label: 'My Academics',    sub: 'Courses, GPA, eligibility',  route: '/(tabs)/(main)/hub/sports-player-academics'   },
                { icon: 'calendar',           label: 'My Schedule',     sub: 'Games, practices & events',  route: '/(tabs)/(main)/hub/sports-player-dashboard'   },
              ].map(item => (
                <Pressable
                  key={item.label}
                  style={({ pressed }) => [s.card, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }, pressed && { opacity: 0.8 }]}
                  onPress={() => go(item.route)}
                >
                  <View style={[s.iconBox, { backgroundColor: C.separator }]}>
                    <IconSymbol name={item.icon as any} size={16} color={C.label} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: C.label }]}>{item.label}</Text>
                    <Text style={[s.cardMeta, { color: C.secondary, marginTop: 1 }]}>{item.sub}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={C.muted as string} />
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },

  topBarOuter: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
  },
  topBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingBottom: 10,
  },
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle:  { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },

  avatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3, alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 36 },

  identity:      { marginBottom: 14 },
  name:          { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  handle:        { fontSize: 14, marginBottom: 6 },
  bio:           { fontSize: 14, lineHeight: 20, opacity: 0.85 },

  metricActionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, marginBottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  editBtn:     { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  editBtnText: { fontSize: 13, fontWeight: '600' },

  champRow: {
    paddingHorizontal: 20, paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  champBadge: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start' },
  champText:  { fontSize: 12, fontWeight: '700' },

  section: { paddingHorizontal: 20, marginBottom: 28 },

  sh: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase',
    marginBottom: 12, marginTop: 4,
  },

  card: {
    borderRadius: 12, padding: 14, marginBottom: 0,
  },
  cardTitle:  { fontSize: 14, fontWeight: '600' },
  cardMeta:   { fontSize: 12 },
  cardCTA:    { fontSize: 12, marginTop: 10, textAlign: 'right' },

  iconBox: {
    width: 36, height: 36, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },

  resultBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, minWidth: 28, alignItems: 'center' },
  resultBadgeText: { fontSize: 11, fontWeight: '800' },

  healthPlayer: { alignItems: 'center', gap: 4, width: 52, marginRight: 8 },
  healthAvatar: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 2.5,
    alignItems: 'center', justifyContent: 'center',
  },
  healthInitials: { fontSize: 13, fontWeight: '700' },
  healthName:     { fontSize: 9, fontWeight: '500', width: 52, textAlign: 'center' },

  statPill: {
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    alignItems: 'center', minWidth: 76,
  },
  statPillValue: { fontSize: 18, fontWeight: '800' },
  statPillLabel: { fontSize: 10, fontWeight: '600', marginTop: 2 },

  personAvatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  personInitials: { fontSize: 12, fontWeight: '700' },
});
