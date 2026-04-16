/**
 * Recruits — Program (Player default).
 * Public recruitment page — what a prospective student-athlete sees.
 * Head Coach redirects to Board (index).
 */

import React, { useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;
const GAIN      = '#5A8A6E';

const BY_NUMBERS = [
  { label: 'Win Percentage', value: '68%' },
  { label: 'Conference Titles', value: '4' },
  { label: 'Players Placed Next Level', value: '40+' },
  { label: 'Avg Team GPA', value: '3.1' },
  { label: 'Graduation Rate', value: '87%' },
];

const STAFF = [
  { name: 'Coach Middlebrooks', role: 'Head Coach', bio: '8 years at Lincoln. 4 conference titles. Known for player development and academic focus.' },
  { name: 'Laolu Kalejaiye',     role: 'Asst. Coach', bio: 'Former Lincoln alum. Handles guard development and recruiting.' },
];

const ACADEMICS = [
  'BA Business Administration',
  'BS Diagnostic Imaging Technology',
  'MBA (accelerated)',
  'MS IBFM',
  'DBA',
];

export default function ProgramScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('sports:recruits');
  const isCoach = role === roleCycles[0];

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (isCoach) router.replace('/(tabs)/(main)/recruits' as any);
  }, [isCoach, router]));

  if (isCoach) return null;

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>

      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Program</Text>
            </View>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={false} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[s.hero, { backgroundColor: '#1A2E4A' }]}>
          <View style={[s.heroLogo, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#fff' }}>LU</Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#fff', marginTop: 12, textAlign: 'center' }}>Lincoln Men's Basketball</Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4, textAlign: 'center' }}>Golden State Athletic Conference · NAIA</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12, alignItems: 'center' }}>
            <View style={[s.heroBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>22-8 (2024-25)</Text>
            </View>
            <View style={[s.heroBadge, { backgroundColor: GAIN + '44' }]}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: GAIN }}>GAAC Champions</Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          {/* About */}
          <Text style={[s.sectionLabel, { color: C.secondary, marginTop: 20 }]}>About the Program</Text>
          <View style={[s.card, { backgroundColor: C.surface, padding: 16 }]}>
            <Text style={{ fontSize: 14, color: C.label, lineHeight: 21 }}>
              Lincoln Men's Basketball is built on a foundation of player development, academic excellence, and competitive excellence in the GAAC. Our system emphasizes PnR motion offense, versatile switching defense, and team chemistry. We develop players for the next level — 40+ alumni have played professionally or at higher divisions.
            </Text>
          </View>

          {/* By the Numbers */}
          <Text style={[s.sectionLabel, { color: C.secondary, marginTop: 20 }]}>By the Numbers</Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {BY_NUMBERS.map((stat, idx) => (
              <View key={stat.label} style={[s.row, idx < BY_NUMBERS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}>
                <Text style={{ fontSize: 14, color: C.secondary }}>{stat.label}</Text>
                <Text style={{ fontSize: 15, fontWeight: '800', color: C.label }}>{stat.value}</Text>
              </View>
            ))}
          </View>

          {/* Coaching Staff */}
          <Text style={[s.sectionLabel, { color: C.secondary, marginTop: 20 }]}>Coaching Staff</Text>
          {STAFF.map(coach => (
            <View key={coach.name} style={[s.card, { backgroundColor: C.surface, padding: 14, marginBottom: 8 }]}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A2E4A', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>{coach.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{coach.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{coach.role}</Text>
                  <Text style={{ fontSize: 13, color: C.secondary, marginTop: 6, lineHeight: 19 }}>{coach.bio}</Text>
                </View>
              </View>
            </View>
          ))}

          {/* Academics */}
          <Text style={[s.sectionLabel, { color: C.secondary, marginTop: 12 }]}>Academic Programs</Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {ACADEMICS.map((prog, idx) => (
              <View key={prog} style={[s.row, idx < ACADEMICS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}>
                <IconSymbol name="graduationcap.fill" size={14} color={C.secondary} />
                <Text style={{ flex: 1, fontSize: 14, color: C.label }}>{prog}</Text>
              </View>
            ))}
            <View style={[s.row, [s.rowBorder, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]]}>
              <IconSymbol name="book.fill" size={14} color={C.secondary} />
              <Text style={{ flex: 1, fontSize: 14, color: C.label }}>Mandatory study hall · Tutoring · Academic advisor assigned</Text>
            </View>
          </View>

          {/* Location */}
          <Text style={[s.sectionLabel, { color: C.secondary, marginTop: 20 }]}>Location</Text>
          <View style={[s.card, { backgroundColor: C.surface, padding: 14, marginBottom: 24 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <IconSymbol name="location.fill" size={16} color={C.secondary} />
              <View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>Oakland, California</Text>
                <Text style={{ fontSize: 13, color: C.secondary }}>Lincoln University · 401 15th St, Oakland, CA</Text>
              </View>
            </View>
            <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 19 }}>Home court at Laney College. 10 min from downtown Oakland. Close to OAK airport. Bay Area's most competitive athletic district.</Text>
          </View>
        </View>
      </ScrollView>

      {/* I'm Interested button */}
      <View style={[s.interestBar, { backgroundColor: C.bg, paddingBottom: insets.bottom + 12, borderTopColor: C.separator }]}>
        <Pressable
          style={[s.interestBtn, { backgroundColor: '#1A1714' }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.navigate('/(tabs)/(main)/recruits/questionnaire' as any); }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>I'm Interested — Fill Out Questionnaire</Text>
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:       { flex: 1 },
  topBarOuter:  { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:       { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:   { width: 80, justifyContent: 'center' },
  titlePill:    { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  titleText:    { fontSize: 13, fontWeight: '700' },

  hero:         { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 28, alignItems: 'center' },
  heroLogo:     { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  heroBadge:    { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },

  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  card:         { borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  row:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 14 },
  rowBorder:    { borderBottomWidth: StyleSheet.hairlineWidth },

  interestBar:  { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  interestBtn:  { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
});
