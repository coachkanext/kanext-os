/**
 * Campus — Housing (President only).
 * Lincoln University is a commuter campus. Shows off-campus housing resources for Oakland area.
 * Student → redirect to campus index.
 */

import React, { useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, Linking,
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

const NEIGHBORHOODS = [
  { name: 'Downtown Oakland',   desc: '5 min walk · AC Transit hub',        avgRent: '$1,400–$2,100/mo' },
  { name: 'Lake Merritt',       desc: '10 min walk · Quiet residential',     avgRent: '$1,600–$2,400/mo' },
  { name: 'Temescal',           desc: '15 min bus · Walkable neighborhood',  avgRent: '$1,500–$2,200/mo' },
  { name: 'Fruitvale',          desc: '20 min transit · BART accessible',    avgRent: '$1,200–$1,800/mo' },
];

const RESOURCES = [
  { icon: 'person.2.fill',        label: 'Student Housing Assistance',  sub: 'Financial Aid Office · (510) 628-8023' },
  { icon: 'globe',                label: 'Roomies.com',                  sub: 'Find roommates & shared housing' },
  { icon: 'building.2',           label: 'Oakland Housing Portal',       sub: 'oaklandca.gov/housing' },
  { icon: 'heart.fill',           label: 'Covenant House CA',            sub: 'Emergency housing support' },
  { icon: 'envelope.fill',        label: 'Student Support Services',     sub: 'counseling@lincolnuca.edu' },
];

const TRANSIT = [
  { line: 'AC Transit 1',   desc: 'Broadway corridor · 5 min from campus' },
  { line: 'AC Transit 51B', desc: 'Telegraph Ave · Connects to Berkeley BART' },
  { line: 'AC Transit NL',  desc: 'Transbay to SF · Stops at 14th & Broadway' },
  { line: 'BART — 12th St', desc: '10 min walk · Easy access to East Bay & SF' },
];

export default function HousingScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('education:campus');
  const isPresident = role === roleCycles[0];

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPresident) router.replace('/(tabs)/(main)/campus' as any);
  }, [isPresident, router]));

  if (!isPresident) return null;

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
              <Text style={[s.titleText, { color: C.label }]}>Housing</Text>
            </View>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={true} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 16 }}>
          {/* Commuter campus notice */}
          <View style={[s.noticeCard, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <View style={[s.noticeIcon, { backgroundColor: '#3A2E1A22' }]}>
              <Text style={{ fontSize: 24 }}>🏛️</Text>
            </View>
            <Text style={{ fontSize: 17, fontWeight: '800', color: C.label, textAlign: 'center', marginBottom: 8 }}>
              Commuter Campus
            </Text>
            <Text style={{ fontSize: 14, color: C.secondary, textAlign: 'center', lineHeight: 21 }}>
              Lincoln University is a commuter campus. All students commute to campus from the surrounding Oakland community. No on-campus residential housing is available.
            </Text>
            <View style={[s.divider, { backgroundColor: C.separator }]} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <IconSymbol name="location.fill" size={14} color={C.secondary} />
              <Text style={{ fontSize: 13, color: C.secondary }}>401 15th Street, Oakland, CA 94612</Text>
            </View>
          </View>

          {/* Nearby neighborhoods */}
          <Text style={[s.sectionLabel, { color: C.secondary }]}>Nearby Neighborhoods</Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {NEIGHBORHOODS.map((n, idx) => (
              <View
                key={n.name}
                style={[s.row, idx < NEIGHBORHOODS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
              >
                <View style={[s.neighborhoodDot, { backgroundColor: '#3A2E1A22', borderColor: '#3A2E1A' }]}>
                  <IconSymbol name="mappin" size={14} color="#3A2E1A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{n.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{n.desc}</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, textAlign: 'right', maxWidth: 110 }}>{n.avgRent}</Text>
              </View>
            ))}
          </View>

          {/* Housing resources */}
          <Text style={[s.sectionLabel, { color: C.secondary, marginTop: 12 }]}>Housing Resources</Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {RESOURCES.map((res, idx) => (
              <Pressable
                key={res.label}
                style={[s.row, idx < RESOURCES.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <View style={[s.neighborhoodDot, { backgroundColor: C.bg }]}>
                  <IconSymbol name={res.icon as any} size={16} color={C.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{res.label}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{res.sub}</Text>
                </View>
                <IconSymbol name="chevron.right" size={14} color={C.secondary} />
              </Pressable>
            ))}
          </View>

          {/* Transit */}
          <Text style={[s.sectionLabel, { color: C.secondary, marginTop: 12 }]}>Getting Around</Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {TRANSIT.map((t, idx) => (
              <View
                key={t.line}
                style={[s.row, idx < TRANSIT.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
              >
                <View style={[s.transitBadge, { backgroundColor: '#1A2E4A22', borderColor: '#1A2E4A' }]}>
                  <IconSymbol name="bus.fill" size={12} color="#1A2E4A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{t.line}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{t.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Admin note */}
          <View style={[s.adminNote, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <IconSymbol name="info.circle.fill" size={16} color={C.secondary} />
            <Text style={{ flex: 1, fontSize: 13, color: C.secondary, lineHeight: 19 }}>
              Share these housing resources with incoming students via the Student Portal announcements. Contact Student Affairs to update this information.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:          { flex: 1 },
  topBarOuter:     { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:          { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  titlePill:       { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  titleText:       { fontSize: 13, fontWeight: '700' },
  sectionLabel:    { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  card:            { borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  row:             { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder:       { borderBottomWidth: StyleSheet.hairlineWidth },
  noticeCard:      { borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 24, borderWidth: StyleSheet.hairlineWidth },
  noticeIcon:      { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  divider:         { height: StyleSheet.hairlineWidth, alignSelf: 'stretch', marginVertical: 16 },
  neighborhoodDot: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0 },
  transitBadge:    { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0 },
  adminNote:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 12, padding: 14, borderWidth: StyleSheet.hairlineWidth, marginTop: 12 },
});
