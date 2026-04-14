import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 44;
const GAIN = '#5A8A6E';
const CAUTION = '#B8943E';

const DRILLS = [
  { name: 'Shell Drill', duration: '20 min' },
  { name: 'Scramble D', duration: '15 min' },
  { name: 'Iowa Drill', duration: '10 min' },
  { name: '5-on-5 Competitive', duration: '45 min' },
  { name: 'Film Review', duration: '30 min' },
];

const WEEK_DAYS = [
  { day: 'Mon', theme: 'Transition Defense', duration: '2hr' },
  { day: 'Tue', theme: 'Shooting + Conditioning', duration: '90min' },
  { day: 'Wed', theme: 'Half-Court Offense', duration: '2hr' },
  { day: 'Thu', theme: 'Opponent Scout + Walk-Through', duration: '90min' },
  { day: 'Fri', theme: 'Game Prep + Free Throws', duration: '60min' },
];

export default function SportsPracticePlans() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('sports:hub');
  const isHeadCoach = role === roleCycles[0];

  useFocusEffect(
    useCallback(() => {
      resetFooter();
      if (!isHeadCoach) {
        router.replace('/(tabs)/(main)/hub' as any);
      }
    }, [isHeadCoach])
  );

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <Pressable
            style={s.kBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openSidePanel();
            }}
            hitSlop={8}
          >
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Practice Plans</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isHeadCoach} />
          </View>
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* TODAY'S PRACTICE */}
        <View style={s.darkCard}>
          <View style={s.todayHeader}>
            <View style={s.todayBadge}>
              <Text style={s.todayBadgeText}>TODAY'S PRACTICE</Text>
            </View>
            <Text style={s.todayTime}>2:30 PM</Text>
          </View>
          <Text style={s.practiceTitle}>Transition Defense + Half-Court Sets</Text>
          <Text style={s.practiceDuration}>2:30 PM — 4:30 PM · 2 hours</Text>
          <View style={s.drillsList}>
            {DRILLS.map((drill, i) => (
              <View key={i} style={s.drillRow}>
                <View style={s.drillBullet} />
                <Text style={s.drillName}>{drill.name}</Text>
                <Text style={s.drillDuration}>{drill.duration}</Text>
              </View>
            ))}
          </View>
          <Pressable
            style={[s.viewPlanBtn, { backgroundColor: C.surface }]}
            onPress={() => Alert.alert('Practice Plan', 'Opening full practice plan...')}
          >
            <Text style={[s.viewPlanText, { color: C.label }]}>View Full Plan</Text>
          </Pressable>
        </View>

        {/* PRACTICE CALENDAR */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>PRACTICE CALENDAR</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.calendarScroll}
        >
          {WEEK_DAYS.map((d, i) => (
            <View key={i} style={[s.dayCard, { backgroundColor: C.surface }]}>
              <Text style={[s.dayLabel, { color: C.secondary }]}>{d.day}</Text>
              <Text style={[s.dayTheme, { color: C.label }]}>{d.theme}</Text>
              <Text style={[s.dayDuration, { color: C.secondary }]}>{d.duration}</Text>
            </View>
          ))}
        </ScrollView>

        {/* PRACTICE BUILDER */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>PRACTICE BUILDER</Text>
        <Pressable
          style={[s.builderCard, { backgroundColor: C.surface }]}
          onPress={() => Alert.alert('Practice Builder', 'Opening drill library...')}
        >
          <IconSymbol name="list.bullet.clipboard.fill" size={40} color={C.secondary} />
          <Text style={[s.builderTitle, { color: C.label }]}>Build Practice Plan</Text>
          <Text style={[s.builderSubtext, { color: C.secondary }]}>Drag-and-drop drill blocks</Text>
        </Pressable>

        {/* DIPSON INTEGRATION */}
        <Pressable
          style={s.dipsonCard}
          onPress={() => Alert.alert('Dipson', 'Generating practice plan...')}
        >
          <View style={s.dipsonRow}>
            <IconSymbol name="sparkles" size={20} color={GAIN} />
            <Text style={s.dipsonTitle}>Ask Dipson</Text>
            <IconSymbol name="chevron.right" size={14} color="rgba(255,255,255,0.4)" style={{ marginLeft: 'auto' }} />
          </View>
          <Text style={s.dipsonSubtext}>Generate a full practice plan from a text prompt</Text>
          <View style={s.dipsonPromptBox}>
            <Text style={s.dipsonPromptText}>
              "Build a practice plan focused on transition defense for Wednesday"
            </Text>
          </View>
        </Pressable>
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 70 }]}
        onPress={() => Alert.alert('New Plan', 'Creating new practice plan...')}
      >
        <Text style={[s.fabText, { color: C.bg }]}>+</Text>
      </Pressable>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBar: {
      flexDirection: 'row', alignItems: 'flex-end',
      paddingBottom: 10, paddingHorizontal: 16,
    },
    kBtn: { width: 44, height: 36, justifyContent: 'center' },
    titlePill: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
    titleText: { fontSize: 13, fontWeight: '700' },
    rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },
    sectionHeader: {
      fontSize: 11, fontWeight: '700', letterSpacing: 0.8,
      marginHorizontal: 16, marginBottom: 10, marginTop: 24,
    },
    darkCard: {
      backgroundColor: '#1A1714', borderRadius: 14,
      marginHorizontal: 16, padding: 16, gap: 10,
    },
    todayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    todayBadge: {
      backgroundColor: GAIN, borderRadius: 6,
      paddingHorizontal: 8, paddingVertical: 3,
    },
    todayBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
    todayTime: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
    practiceTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    practiceDuration: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
    drillsList: { gap: 6 },
    drillRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    drillBullet: { width: 7, height: 7, borderRadius: 4, backgroundColor: GAIN },
    drillName: { color: '#FFFFFF', fontSize: 14, flex: 1 },
    drillDuration: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
    viewPlanBtn: {
      borderRadius: 10, paddingVertical: 10,
      alignItems: 'center', marginTop: 4,
    },
    viewPlanText: { fontSize: 14, fontWeight: '600' },
    calendarScroll: { paddingHorizontal: 16, gap: 10 },
    dayCard: {
      width: 100, borderRadius: 12, padding: 12, gap: 4,
    },
    dayLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
    dayTheme: { fontSize: 13, fontWeight: '700', lineHeight: 17 },
    dayDuration: { fontSize: 12, marginTop: 2 },
    builderCard: {
      marginHorizontal: 16, borderRadius: 14, padding: 20,
      alignItems: 'center', gap: 8,
    },
    builderTitle: { fontSize: 16, fontWeight: '700' },
    builderSubtext: { fontSize: 13 },
    dipsonCard: {
      backgroundColor: '#1A1714', marginHorizontal: 16,
      borderRadius: 12, padding: 14, marginTop: 24, gap: 6,
    },
    dipsonRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dipsonTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    dipsonSubtext: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
    dipsonPromptBox: {
      backgroundColor: '#2A1F10', borderRadius: 8,
      paddingHorizontal: 14, paddingVertical: 8, marginTop: 2,
    },
    dipsonPromptText: { color: CAUTION, fontSize: 11, fontStyle: 'italic' },
    fab: {
      position: 'absolute', right: 20,
      width: 52, height: 52, borderRadius: 26,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2, shadowRadius: 6, elevation: 6,
    },
    fabText: { fontSize: 28, fontWeight: '300', lineHeight: 32, marginTop: -2 },
  });
}
