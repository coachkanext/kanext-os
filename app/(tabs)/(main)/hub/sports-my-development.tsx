/**
 * Sports Hub — My Development. Player only.
 * KR trajectory, archetype badge, component KR bars, goals, season stats, history.
 */
import React, { useMemo, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 52;
const GAIN = '#5A8A6E';
const HEAT = '#B85C5C';
const CAUTION = '#B8943E';

const BAR_MONTHS = [
  { label: 'Oct', value: 78 },
  { label: 'Nov', value: 80 },
  { label: 'Dec', value: 82 },
  { label: 'Feb', value: 84 },
  { label: 'Mar', value: 86 },
];
const BAR_MAX_H = 60;
const BAR_MIN_VAL = 75;
const BAR_RANGE = 15;

const COMPONENTS = [
  { label: 'OKR',  value: 91 },
  { label: 'DKR',  value: 78 },
  { label: 'TKR',  value: 88 },
  { label: 'IQKR', value: 85 },
];

type GoalStatus = 'On Track' | 'Behind' | 'Achieved';
interface Goal {
  title: string;
  target: string;
  current: string;
  status: GoalStatus;
  progress: number;
}

const GOALS: Goal[] = [
  { title: 'Improve Free Throw %',           target: 'Target: 85%',                    current: 'Current: 84%',       status: 'On Track', progress: 84 },
  { title: 'Add Consistent Mid-Range Pull-Up', target: 'Target: .420 FG% mid-range',   current: 'Current: In Progress', status: 'Behind',   progress: 40 },
  { title: 'Defensive Closeout Discipline',   target: 'Target: 0 broken-down closeouts/game', current: 'Current: 0.8/game', status: 'Behind', progress: 25 },
];

const SEASON_STATS = [
  { label: 'PPG',  value: '27.3' },
  { label: 'RPG',  value: '2.9'  },
  { label: 'APG',  value: '2.9'  },
  { label: 'FG%',  value: '.395' },
];

function getCompBarColor(value: number, C: ComponentColors): string {
  if (value >= 88) return GAIN;
  if (value >= 80) return C.label as string;
  return CAUTION;
}

function getStatusColors(status: GoalStatus, C: ComponentColors): { bg: string; text: string } {
  if (status === 'On Track') return { bg: GAIN + '22', text: GAIN };
  if (status === 'Behind')   return { bg: HEAT + '22', text: HEAT };
  return { bg: C.label as string, text: C.bg as string };
}

export default function SportsMyDevelopment() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('sports:hub');
  const isCoach = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (isCoach) router.replace('/(tabs)/(main)/hub/sports-program-overview' as any);
  }, [isCoach]);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { top: 0, paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable
            style={s.kBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            hitSlop={8}
          >
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>My Development</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={!isCoach} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + TOP_BAR_H + 16,
          paddingBottom: insets.bottom + 80,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* KR TRAJECTORY */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>KR TRAJECTORY</Text>
        <View style={[s.heroCard, { backgroundColor: C.surface }]}>
          <View style={s.krTopRow}>
            <Text style={[s.krBigNumber, { color: C.label }]}>86</Text>
            <View style={s.krRightCol}>
              <Text style={[s.krRatingLabel, { color: C.secondary }]}>KLVN RATING</Text>
              <Text style={[s.krDelta, { color: GAIN }]}>+4 this season</Text>
              <Text style={[s.krRank, { color: C.secondary }]}>Top 15% of all guards</Text>
            </View>
          </View>
          <View style={[s.divider, { backgroundColor: C.separator }]} />
          <Text style={[s.subSectionLabel, { color: C.secondary }]}>Season KR Progression</Text>
          <View style={s.barChartRow}>
            {BAR_MONTHS.map((m, i) => {
              const heightPct = Math.max(0, (m.value - BAR_MIN_VAL) / BAR_RANGE);
              const barH = Math.round(heightPct * BAR_MAX_H) + 8;
              const isActive = i === BAR_MONTHS.length - 1;
              return (
                <View key={m.label} style={s.barCol}>
                  <Text style={[s.barValue, { color: C.label }]}>{m.value}</Text>
                  <View style={[s.bar, { height: barH, backgroundColor: isActive ? C.label : C.separator }]} />
                  <Text style={[s.barLabel, { color: C.secondary }]}>{m.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ARCHETYPE BADGE */}
        <View style={[s.archetypeCard, { backgroundColor: C.surface }]}>
          <View style={s.archetypeTopRow}>
            <View style={[s.archetypeBadgeCircle, { backgroundColor: C.label }]}>
              <Text style={s.archetypeBadgeText}>PnR</Text>
            </View>
            <View style={s.archetypeRightCol}>
              <Text style={[s.archetypeTitle, { color: C.label }]}>PnR Operator</Text>
              <Text style={[s.archetypePrimary, { color: C.secondary }]}>Primary archetype</Text>
              <Text style={[s.archetypeSince, { color: C.secondary }]}>Since Dec 2025</Text>
            </View>
          </View>
          <View style={[s.divider, { backgroundColor: C.separator }]} />
          <Text style={[s.archetypeDesc, { color: C.secondary }]}>
            Elite pick-and-roll initiator. Exceptional at reading coverage and making the correct decision: pull up, attack, or kick. Drives offense through ball screen actions.
          </Text>
        </View>

        {/* COMPONENT KR */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>COMPONENT KR</Text>
        <View style={[s.compCard, { backgroundColor: C.surface }]}>
          {COMPONENTS.map((comp, i) => (
            <View key={comp.label}>
              <View style={s.compRow}>
                <Text style={[s.compLabel, { color: C.label }]}>{comp.label}</Text>
                <View style={[s.compBarTrack, { backgroundColor: C.separator }]}>
                  <View style={[s.compBarFill, { width: `${comp.value}%` as any, backgroundColor: getCompBarColor(comp.value, C) }]} />
                </View>
                <Text style={[s.compValue, { color: C.label }]}>{comp.value}</Text>
              </View>
              {i < COMPONENTS.length - 1 && <View style={[s.hairline, { backgroundColor: C.separator }]} />}
            </View>
          ))}
        </View>

        {/* ACTIVE GOALS */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>ACTIVE GOALS</Text>
        {GOALS.map((goal, i) => {
          const { bg, text } = getStatusColors(goal.status, C);
          return (
            <View key={i} style={[s.goalCard, { backgroundColor: C.surface }]}>
              <View style={s.goalRow1}>
                <View style={[s.statusBadge, { backgroundColor: bg }]}>
                  <Text style={[s.statusBadgeText, { color: text }]}>{goal.status}</Text>
                </View>
                <Text style={[s.goalTitle, { color: C.label }]}>{goal.title}</Text>
              </View>
              <View style={s.goalRow2}>
                <Text style={[s.goalTarget, { color: C.secondary }]}>{goal.target}</Text>
                <Text style={[s.goalCurrent, { color: C.label }]}>{goal.current}</Text>
              </View>
              <View style={[s.goalBarTrack, { backgroundColor: C.separator }]}>
                <View style={[s.goalBarFill, { width: `${goal.progress}%` as any, backgroundColor: goal.status === 'On Track' ? GAIN : HEAT }]} />
              </View>
            </View>
          );
        })}

        {/* SEASON STATS */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>SEASON STATS</Text>
        <View style={[s.statsCard, { backgroundColor: C.surface }]}>
          <View style={s.statsGrid}>
            {SEASON_STATS.map((stat, i) => (
              <View
                key={stat.label}
                style={[
                  s.statCell,
                  i < SEASON_STATS.length - 1 && { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: C.separator },
                ]}
              >
                <Text style={[s.statValue, { color: C.label }]}>{stat.value}</Text>
                <Text style={[s.statLabel, { color: C.secondary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
          <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <Text style={[s.viewGameLog, { color: C.secondary }]}>View Game Log →</Text>
          </Pressable>
        </View>

        {/* DEVELOPMENT HISTORY */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>DEVELOPMENT HISTORY</Text>
        <View style={[s.historyCard, { backgroundColor: C.surface }]}>
          <Text style={[s.historySeasonLabel, { color: C.secondary }]}>Last Season (2024-25)</Text>
          <View style={s.historyRow}>
            <Text style={[s.historyItem, { color: C.label }]}>KR: 82 → 86 </Text>
            <Text style={[s.historyDelta, { color: GAIN }]}>(+4)</Text>
          </View>
          <View style={s.historyRow}>
            <Text style={[s.historyItem, { color: C.label }]}>FT%: 78% → 88% </Text>
            <Text style={[s.historyAchieved, { color: GAIN }]}>✓</Text>
          </View>
          <Text style={[s.historyItem, { color: C.label }]}>Assist Rate improved from 3.1 to 4.2 APG</Text>
          <Text style={[s.historyItem, { color: C.label }]}>Named 1st Team All-GAAC</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root:          { flex: 1 },
  topBarOuter:   { position: 'absolute', left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  kBtn:          { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap:  { alignItems: 'flex-end' },
  sectionHeader: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8, marginTop: 20 },
  divider:       { height: StyleSheet.hairlineWidth, marginVertical: 12 },
  hairline:      { height: StyleSheet.hairlineWidth },

  heroCard:        { borderRadius: 16, padding: 16, marginBottom: 20 },
  krTopRow:        { flexDirection: 'row', alignItems: 'center', gap: 16 },
  krBigNumber:     { fontSize: 48, fontWeight: '900', lineHeight: 54 },
  krRightCol:      { flex: 1, gap: 2 },
  krRatingLabel:   { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  krDelta:         { fontSize: 13, fontWeight: '600' },
  krRank:          { fontSize: 12 },
  subSectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  barChartRow:     { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingTop: 4 },
  barCol:          { flex: 1, alignItems: 'center', gap: 4 },
  bar:             { width: 40, borderRadius: 4 },
  barValue:        { fontSize: 10, fontWeight: '600' },
  barLabel:        { fontSize: 10 },

  archetypeCard:        { borderRadius: 12, padding: 14, marginBottom: 16 },
  archetypeTopRow:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  archetypeBadgeCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  archetypeBadgeText:   { fontSize: 13, fontWeight: '900', color: '#FFFFFF' },
  archetypeRightCol:    { flex: 1, gap: 2 },
  archetypeTitle:       { fontSize: 16, fontWeight: '700' },
  archetypePrimary:     { fontSize: 12 },
  archetypeSince:       { fontSize: 11 },
  archetypeDesc:        { fontSize: 13, lineHeight: 18 },

  compCard:       { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 4 },
  compRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  compLabel:      { fontSize: 13, fontWeight: '600', width: 60 },
  compBarTrack:   { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  compBarFill:    { height: 8, borderRadius: 4 },
  compValue:      { fontSize: 14, fontWeight: '800', width: 30, textAlign: 'right' },

  goalCard:        { borderRadius: 12, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 10, marginBottom: 8 },
  goalRow1:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  statusBadge:     { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  goalTitle:       { fontSize: 14, fontWeight: '600', flex: 1 },
  goalRow2:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  goalTarget:      { fontSize: 12 },
  goalCurrent:     { fontSize: 12, fontWeight: '700' },
  goalBarTrack:    { height: 6, borderRadius: 3, overflow: 'hidden' },
  goalBarFill:     { height: 6, borderRadius: 3 },

  statsCard:  { borderRadius: 12 },
  statsGrid:  { flexDirection: 'row' },
  statCell:   { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statValue:  { fontSize: 22, fontWeight: '800' },
  statLabel:  { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginTop: 2 },
  viewGameLog:{ fontSize: 13, fontWeight: '600', paddingVertical: 10, paddingHorizontal: 14 },

  historyCard:        { borderRadius: 12, padding: 14 },
  historySeasonLabel: { fontSize: 11, fontWeight: '700', marginBottom: 8 },
  historyRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  historyItem:        { fontSize: 13, lineHeight: 20, marginBottom: 4 },
  historyDelta:       { fontSize: 13, fontWeight: '700', lineHeight: 20 },
  historyAchieved:    { fontSize: 13, fontWeight: '700', lineHeight: 20 },
});
