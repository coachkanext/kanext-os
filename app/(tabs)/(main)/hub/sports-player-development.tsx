import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
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

const GAIN = '#5A8A6E';
const HEAT = '#B85C5C';
const CAUTION = '#B8943E';

const COMPONENTS = [
  { label: 'OKR (Off)', value: 89 },
  { label: 'DKR (Def)', value: 71 },
  { label: 'TKR (Tech)', value: 88 },
  { label: 'IQKR (IQ)', value: 84 },
  { label: 'Physical', value: 74 },
  { label: 'Potential', value: 91 },
];

const GOALS = [
  {
    title: '3-Point Consistency',
    sub: '68 → 75 3P efficiency score',
    progress: 1.0,
    status: 'COMPLETED ✓',
    statusColor: GAIN,
    target: null,
  },
  {
    title: 'Free Throw Rate at Next Level',
    sub: '1.4 FTA/G (current) → 4.0 FTA/G target',
    progress: 0.25,
    status: 'IN PROGRESS',
    statusColor: CAUTION,
    target: 'Target: Training + Heel rehab',
  },
  {
    title: 'Rim Finishing',
    sub: 'Restore pre-injury above-rim game',
    progress: 0.40,
    status: 'IN PROGRESS',
    statusColor: CAUTION,
    target: 'Target: 6-12 months w/ D1 sports medicine',
  },
];

const BADGES = [
  { emoji: '🎯', name: 'Logo Shooter', tier: 'GOLD', tierColor: CAUTION },
  { emoji: '🏆', name: 'All-Conference', tier: 'SILVER', tierColor: '#9C9790' },
  { emoji: '🔥', name: 'Clutch Performer', tier: 'GOLD', tierColor: CAUTION },
  { emoji: '⚡', name: 'Iron Man', tier: 'SILVER', tierColor: '#9C9790' },
  { emoji: '🎪', name: 'Playmaker', tier: 'BRONZE', tierColor: '#8B6A3E' },
];

function getBarColor(value: number, C: ComponentColors): string {
  if (value >= 80) return GAIN;
  if (value >= 70) return C.label;
  if (value >= 60) return CAUTION;
  return HEAT;
}

export default function SportsPlayerDevelopment() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('sports:hub');
  const isHeadCoach = role === roleCycles[0];
  const s = useMemo(() => makeStyles(C), [C]);
  const topBarHeight = insets.top + 56;

  useFocusEffect(
    useCallback(() => {
      resetFooter();
      if (isHeadCoach) {
        router.replace('/(tabs)/(main)/hub' as any);
      }
    }, [isHeadCoach])
  );

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <View style={[s.topBar, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable
          style={s.kBtn}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
          hitSlop={8}
        >
          <KMenuButton />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={[s.titleText, { color: C.label }]}>MY DEVELOPMENT</Text>
          </View>
        </View>
        <View style={s.rolePillWrap}>
          <RolePill role={role} onPress={cycleRole} isPrimary={isHeadCoach} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topBarHeight + 16, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* KR Trajectory Card */}
        <View style={s.krCard}>
          <View style={s.krCardHeader}>
            <Text style={s.krCardLabel}>MY KR RATING</Text>
            <Text style={s.krCardSeason}>2025-26 Season</Text>
          </View>
          <Text style={[s.krBigNumber, { color: GAIN }]}>86</Text>
          <View style={s.krTrajectoryRow}>
            <Text style={s.krTrajectoryItem}>Season Start: 82</Text>
            <Text style={s.krArrow}> → </Text>
            <Text style={s.krTrajectoryItem}>Current: 86</Text>
            <Text style={[s.krDelta, { color: GAIN }]}>  +4 ↑</Text>
          </View>
          <Text style={[s.krProjected, { color: CAUTION }]}>
            Projected (with D1 resources): 88-91
          </Text>
          {/* Progress bar: start(82) → current(86) in GAIN, gap to projected(90) in CAUTION */}
          <View style={s.krBarTrack}>
            {/* GAIN fill: 82→86 = 4 pts out of 10 range (82-92) = 40% */}
            <View style={[s.krBarGain, { width: '40%', backgroundColor: GAIN }]} />
            {/* CAUTION fill: 86→90 = 4 pts = another 40% */}
            <View style={[s.krBarCaution, { width: '40%', backgroundColor: CAUTION, opacity: 0.4 }]} />
          </View>
          <View style={s.krBarLabels}>
            <Text style={s.krBarLabelText}>82</Text>
            <Text style={s.krBarLabelText}>86</Text>
            <Text style={s.krBarLabelText}>90</Text>
            <Text style={s.krBarLabelText}>92</Text>
          </View>
          <Text style={s.krFooterNote}>
            HIGH-IMPACT STARTER → FRANCHISE ANCHOR trajectory
          </Text>
        </View>

        {/* Component KR Bars */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>COMPONENT RATINGS</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {COMPONENTS.map((comp, i) => (
            <View
              key={comp.label}
              style={[
                s.compRow,
                i < COMPONENTS.length - 1 && { marginBottom: 14 },
              ]}
            >
              <Text style={[s.compLabel, { color: C.secondary }]}>{comp.label}</Text>
              <View style={[s.compBarTrack, { backgroundColor: C.separator }]}>
                <View
                  style={[
                    s.compBarFill,
                    {
                      backgroundColor: getBarColor(comp.value, C),
                      width: `${comp.value}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[s.compValue, { color: C.label }]}>{comp.value}</Text>
            </View>
          ))}
        </View>

        {/* Goals */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>MY GOALS</Text>
        <View style={s.goalsList}>
          {GOALS.map((goal, i) => (
            <View key={i} style={[s.goalCard, { backgroundColor: C.surface }]}>
              <View style={s.goalHeader}>
                <Text style={[s.goalTitle, { color: C.label }]}>{goal.title}</Text>
                <View style={[s.goalStatusBadge, { backgroundColor: goal.statusColor + '22' }]}>
                  <Text style={[s.goalStatusText, { color: goal.statusColor }]}>{goal.status}</Text>
                </View>
              </View>
              <Text style={[s.goalSub, { color: C.secondary }]}>{goal.sub}</Text>
              <View style={[s.goalBarTrack, { backgroundColor: C.separator }]}>
                <View
                  style={[
                    s.goalBarFill,
                    {
                      backgroundColor: goal.progress >= 1.0 ? GAIN : CAUTION,
                      width: `${goal.progress * 100}%`,
                    },
                  ]}
                />
              </View>
              {goal.target && (
                <Text style={[s.goalTarget, { color: C.secondary }]}>{goal.target}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Badges */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>EARNED BADGES</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.badgesScroll}>
          {BADGES.map((badge, i) => (
            <View key={i} style={[s.badgeCard, { backgroundColor: C.surface }]}>
              <Text style={s.badgeEmoji}>{badge.emoji}</Text>
              <Text style={[s.badgeName, { color: C.secondary }]}>{badge.name}</Text>
              <Text style={[s.badgeTier, { color: badge.tierColor }]}>{badge.tier}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Coach Notes */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>COACH NOTES</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <Text style={[s.noteAuthor, { color: C.secondary }]}>Coach Kalejaiye — Mar 27, 2026</Text>
          <Text style={[s.noteText, { color: C.label }]}>
            Laolu is the founding proof of concept for Nexus Basketball Intelligence. With proper medical support and D1 infrastructure, projects to 88-91 KR. Heel recovery is the #1 priority.
          </Text>
          <View style={[s.noteSep, { backgroundColor: C.separator }]} />
          <Text style={[s.noteAuthor, { color: C.secondary }]}>Coach Middlebrooks — Mar 15, 2026</Text>
          <Text style={[s.noteText, { color: C.label }]}>
            Elite competitor. Has never had the resources he deserves. Gets better every game.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBar: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
      flexDirection: 'row', alignItems: 'flex-end',
      paddingBottom: 10, paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    kBtn: { width: 44, height: 36, justifyContent: 'center' },
    titlePill: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
    titleText: { fontSize: 13, fontWeight: '700' },
    rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },
    sectionHeader: {
      fontSize: 11, fontWeight: '700', letterSpacing: 0.8,
      marginHorizontal: 16, marginBottom: 8, marginTop: 20,
    },
    card: { borderRadius: 12, marginHorizontal: 16, padding: 14 },
    // KR Card
    krCard: {
      backgroundColor: '#1A1714', borderRadius: 16,
      marginHorizontal: 16, padding: 16,
    },
    krCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    krCardLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: 'rgba(255,255,255,0.5)' },
    krCardSeason: { fontSize: 10, color: 'rgba(255,255,255,0.4)' },
    krBigNumber: { fontSize: 52, fontWeight: '700', textAlign: 'center', lineHeight: 60, marginBottom: 8 },
    krTrajectoryRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    krTrajectoryItem: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
    krArrow: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
    krDelta: { fontSize: 14, fontWeight: '700' },
    krProjected: { fontSize: 12, textAlign: 'center', marginBottom: 12, fontStyle: 'italic' },
    krBarTrack: {
      height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)',
      flexDirection: 'row', overflow: 'hidden', marginBottom: 6,
    },
    krBarGain: { height: 8 },
    krBarCaution: { height: 8 },
    krBarLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    krBarLabelText: { fontSize: 10, color: 'rgba(255,255,255,0.4)' },
    krFooterNote: { fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },
    // Component bars
    compRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    compLabel: { fontSize: 12, width: 90 },
    compBarTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
    compBarFill: { height: 8, borderRadius: 4 },
    compValue: { fontSize: 14, fontWeight: '700', width: 30, textAlign: 'right' },
    // Goals
    goalsList: { gap: 8, paddingHorizontal: 16 },
    goalCard: { borderRadius: 12, padding: 14 },
    goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
    goalTitle: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
    goalStatusBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
    goalStatusText: { fontSize: 10, fontWeight: '700' },
    goalSub: { fontSize: 12, marginBottom: 10 },
    goalBarTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
    goalBarFill: { height: 6, borderRadius: 3 },
    goalTarget: { fontSize: 11, fontStyle: 'italic' },
    // Badges
    badgesScroll: { paddingHorizontal: 16, gap: 10 },
    badgeCard: {
      width: 80, height: 80, borderRadius: 12, padding: 8,
      alignItems: 'center', justifyContent: 'center', gap: 2,
    },
    badgeEmoji: { fontSize: 24 },
    badgeName: { fontSize: 9, textAlign: 'center' },
    badgeTier: { fontSize: 10, fontWeight: '700' },
    // Coach Notes
    noteAuthor: { fontSize: 12, marginBottom: 6 },
    noteText: { fontSize: 14, lineHeight: 20, marginBottom: 14 },
    noteSep: { height: StyleSheet.hairlineWidth, marginBottom: 14 },
  });
}
