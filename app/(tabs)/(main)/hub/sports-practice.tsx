/**
 * Sports Hub — Practice. Head Coach only.
 * Today's session hero, drill plan, Dipson card, practice calendar.
 */
import React, { useMemo, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { openDipsonSheet } from '@/utils/global-dipson-sheet';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 52;

type FocusTag = 'OFFENSE' | 'DEFENSE' | 'CONDITIONING' | 'SPECIAL';

interface Drill {
  name: string;
  duration: string;
  focus: FocusTag;
  description: string;
  completed: boolean;
}

const DRILLS: Drill[] = [
  { name: 'Dynamic Warm-Up',        duration: '10 min', focus: 'CONDITIONING', description: 'Full-body activation, hip openers, ankle mobility circuit.',            completed: true  },
  { name: '3-Man Weave',            duration: '10 min', focus: 'OFFENSE',      description: 'Ball movement + layup finishing. Emphasize no dribbles on pass.',     completed: true  },
  { name: 'Shell Defense',          duration: '15 min', focus: 'DEFENSE',      description: 'Defensive positioning, closeouts, no middle drives.',                 completed: false },
  { name: 'Pick-and-Roll Coverage', duration: '15 min', focus: 'DEFENSE',      description: 'Hedge vs drop vs switch reads. Film reference: Duke tape.',           completed: false },
  { name: 'Half-Court Offense',     duration: '20 min', focus: 'OFFENSE',      description: 'Motion sets: Horns, Floppy, Chin. 10 reps each side.',               completed: false },
  { name: '5-on-5 Live',            duration: '20 min', focus: 'OFFENSE',      description: 'Green/White. Focus: execution under fatigue, late-clock offense.',    completed: false },
  { name: 'Free Throw Shooting',    duration: '8 min',  focus: 'CONDITIONING', description: 'Pairs. 10 FTs then sub. Team goal: 80% total session.',               completed: false },
  { name: 'Cool Down + Film Notes', duration: '7 min',  focus: 'SPECIAL',      description: 'Dipson generates session clips, coach reviews 2 key possessions.',   completed: false },
];

const FOCUS_COLORS: Record<FocusTag, string> = {
  OFFENSE:      '#5A8A6E',
  DEFENSE:      '#B85C5C',
  CONDITIONING: '#B8943E',
  SPECIAL:      '#9C9790',
};

type DayStatus = 'past' | 'today' | 'upcoming' | 'off';
interface CalDay { day: string; date: string; status: DayStatus; focus: string }

const CALENDAR: CalDay[] = [
  { day: 'MON', date: 'Apr 7',  status: 'past',     focus: 'Scouting + Offense' },
  { day: 'TUE', date: 'Apr 8',  status: 'past',     focus: 'Defense + Live 5v5' },
  { day: 'WED', date: 'Apr 9',  status: 'past',     focus: 'Shooting + Film'    },
  { day: 'THU', date: 'Apr 10', status: 'past',     focus: 'Game Day vs Duke'   },
  { day: 'FRI', date: 'Apr 11', status: 'past',     focus: 'Recovery'           },
  { day: 'MON', date: 'Apr 14', status: 'past',     focus: 'Film Review'        },
  { day: 'TUE', date: 'Apr 15', status: 'today',    focus: 'Defense + Sets'     },
  { day: 'WED', date: 'Apr 16', status: 'upcoming', focus: 'Shooting Day'       },
  { day: 'THU', date: 'Apr 17', status: 'upcoming', focus: 'Game Day vs Fisk'   },
  { day: 'FRI', date: 'Apr 18', status: 'off',      focus: 'Rest Day'           },
];

const completedCount = DRILLS.filter(d => d.completed).length;
const totalDuration = DRILLS.reduce((acc, d) => acc + parseInt(d.duration), 0);

export default function SportsPractice() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('sports:hub');
  const isCoach = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (!isCoach) router.replace('/(tabs)/(main)/hub/sports-program-overview' as any);
  }, [isCoach]);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.kBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Practice</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isCoach} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* TODAY'S PRACTICE HERO */}
        <View style={[s.heroCard, { backgroundColor: C.surface }]}>
          <View style={s.heroTopRow}>
            <View>
              <Text style={[s.heroTitle, { color: C.label }]}>Today's Practice</Text>
              <Text style={[s.heroMeta, { color: C.secondary }]}>Tue, Apr 15 · 3:30 PM · Coleman Fieldhouse</Text>
            </View>
            <View style={[s.durationBadge, { backgroundColor: C.bg, borderColor: C.separator }]}>
              <Text style={[s.durationText, { color: C.label }]}>{totalDuration} min</Text>
            </View>
          </View>

          <View style={[s.divider, { backgroundColor: C.separator }]} />

          <View style={s.heroFocusRow}>
            <View style={[s.focusTagChip, { backgroundColor: FOCUS_COLORS.DEFENSE + '22' }]}>
              <Text style={[s.focusTagText, { color: FOCUS_COLORS.DEFENSE }]}>DEFENSE</Text>
            </View>
            <View style={[s.focusTagChip, { backgroundColor: FOCUS_COLORS.OFFENSE + '22' }]}>
              <Text style={[s.focusTagText, { color: FOCUS_COLORS.OFFENSE }]}>OFFENSE</Text>
            </View>
            <Text style={[s.focusContext, { color: C.secondary }]}>Prep: vs Fisk Thu</Text>
          </View>

          <View style={[s.divider, { backgroundColor: C.separator }]} />

          <View style={s.progressRow}>
            <Text style={[s.progressLabel, { color: C.secondary }]}>DRILL PROGRESS</Text>
            <Text style={[s.progressCount, { color: C.label }]}>{completedCount}/{DRILLS.length} complete</Text>
          </View>
          <View style={[s.progressTrack, { backgroundColor: C.separator }]}>
            <View style={[s.progressFill, { backgroundColor: C.label, width: `${(completedCount / DRILLS.length) * 100}%` as any }]} />
          </View>
        </View>

        {/* DRILL PLAN */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>DRILL PLAN</Text>
        {DRILLS.map((drill, i) => (
          <View key={i} style={[s.drillCard, { backgroundColor: C.surface }]}>
            <View style={s.drillTopRow}>
              <View style={s.drillCheckAndName}>
                <View style={[s.drillCheck, { borderColor: drill.completed ? C.label : C.separator, backgroundColor: drill.completed ? C.label : 'transparent' }]}>
                  {drill.completed && <IconSymbol name="checkmark" size={10} color={C.bg} />}
                </View>
                <Text style={[s.drillName, { color: drill.completed ? C.secondary : C.label, textDecorationLine: drill.completed ? 'line-through' : 'none' }]}>
                  {drill.name}
                </Text>
              </View>
              <View style={s.drillMeta}>
                <View style={[s.focusTagSmall, { backgroundColor: FOCUS_COLORS[drill.focus] + '22' }]}>
                  <Text style={[s.focusTagSmallText, { color: FOCUS_COLORS[drill.focus] }]}>{drill.focus}</Text>
                </View>
                <Text style={[s.drillDuration, { color: C.secondary }]}>{drill.duration}</Text>
              </View>
            </View>
            <Text style={[s.drillDesc, { color: C.secondary }]}>{drill.description}</Text>
          </View>
        ))}

        {/* BUILD WITH DIPSON */}
        <View style={[s.dipsonCard, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <View style={s.dipsonIconRow}>
            <IconSymbol name="sparkles" size={22} color={C.label} />
            <Text style={[s.dipsonTitle, { color: C.label }]}>Build with Dipson</Text>
          </View>
          <Text style={[s.dipsonDesc, { color: C.secondary }]}>
            Generate a custom drill plan based on last game film, your opponent this week, and individual player development goals.
          </Text>
          <Pressable
            style={[s.dipsonBtn, { backgroundColor: C.label }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); openDipsonSheet('Athletics'); }}
          >
            <Text style={[s.dipsonBtnText, { color: C.bg }]}>Open Dipson →</Text>
          </Pressable>
        </View>

        {/* PRACTICE CALENDAR */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>PRACTICE CALENDAR</Text>
        <View style={[s.calCard, { backgroundColor: C.surface }]}>
          {CALENDAR.map((d, i) => (
            <Pressable
              key={i}
              style={[
                s.calRow,
                i < CALENDAR.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                d.status === 'today' && { backgroundColor: C.bg },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={s.calDayCol}>
                <Text style={[s.calDayLabel, { color: d.status === 'today' ? C.label : C.secondary, fontWeight: d.status === 'today' ? '700' : '500' }]}>
                  {d.day}
                </Text>
                <Text style={[s.calDateLabel, { color: d.status === 'today' ? C.label : C.secondary }]}>{d.date}</Text>
              </View>
              <Text style={[
                s.calFocus,
                { color: d.status === 'off' ? C.secondary : d.status === 'today' ? C.label : C.label },
                d.status === 'off' && { fontStyle: 'italic' },
                d.status === 'past' && { color: C.secondary },
              ]}>
                {d.focus}
              </Text>
              {d.status === 'today' && (
                <View style={[s.todayDot, { backgroundColor: C.label }]} />
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root:          { flex: 1 },
  topBarOuter:   { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  kBtn:          { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap:  { alignItems: 'flex-end' },
  sectionHeader: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8, marginTop: 20 },
  divider:       { height: StyleSheet.hairlineWidth, marginVertical: 12 },

  heroCard:       { borderRadius: 16, padding: 16, marginBottom: 4 },
  heroTopRow:     { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  heroTitle:      { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  heroMeta:       { fontSize: 13 },
  durationBadge:  { borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  durationText:   { fontSize: 12, fontWeight: '700' },
  heroFocusRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  focusTagChip:   { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  focusTagText:   { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  focusContext:   { fontSize: 12, marginLeft: 4 },
  progressRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel:  { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  progressCount:  { fontSize: 12, fontWeight: '600' },
  progressTrack:  { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill:   { height: 8, borderRadius: 4 },

  drillCard:       { borderRadius: 12, padding: 14, marginBottom: 8 },
  drillTopRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  drillCheckAndName: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  drillCheck:      { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  drillName:       { fontSize: 15, fontWeight: '600', flex: 1 },
  drillMeta:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  focusTagSmall:   { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  focusTagSmallText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.4 },
  drillDuration:   { fontSize: 12 },
  drillDesc:       { fontSize: 13, lineHeight: 18 },

  dipsonCard:     { borderRadius: 16, padding: 16, marginTop: 20, borderWidth: 1 },
  dipsonIconRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  dipsonTitle:    { fontSize: 16, fontWeight: '700' },
  dipsonDesc:     { fontSize: 13, lineHeight: 18, marginBottom: 16 },
  dipsonBtn:      { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 11, alignSelf: 'flex-start' },
  dipsonBtnText:  { fontSize: 14, fontWeight: '600' },

  calCard:      { borderRadius: 16, overflow: 'hidden' },
  calRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  calDayCol:    { width: 42 },
  calDayLabel:  { fontSize: 10, letterSpacing: 0.5 },
  calDateLabel: { fontSize: 13, fontWeight: '600' },
  calFocus:     { flex: 1, fontSize: 14 },
  todayDot:     { width: 6, height: 6, borderRadius: 3 },
});
