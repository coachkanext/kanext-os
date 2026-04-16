/**
 * Sports Hub — My Academics. Player only.
 * Eligibility status, GPA, current courses, advisor, study hall.
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
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 52;
const GAIN = '#5A8A6E';
const CAUTION = '#B8943E';

type GradeLetter = 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';

interface Course {
  code: string;
  name: string;
  grade: GradeLetter;
  note: string;
}

const COURSES: Course[] = [
  { code: 'BUSI 201', name: 'Business Communication', grade: 'A-', note: 'Final Exam due May 15' },
  { code: 'KINE 150', name: 'Exercise Science',        grade: 'B+', note: 'Lab report due Apr 20' },
  { code: 'COMM 101', name: 'Public Speaking',          grade: 'A',  note: 'Speech Apr 22'         },
  { code: 'HIST 110', name: 'US History',               grade: 'B',  note: 'Midterm Apr 18'        },
];

const CHECK_INS = [
  { day: 'Mon Apr 14', time: '2:00 PM – 4:00 PM', hours: '2 hrs' },
  { day: 'Wed Apr 9',  time: '3:00 PM – 5:00 PM', hours: '2 hrs' },
  { day: 'Mon Apr 7',  time: '1:00 PM – 2:00 PM', hours: '1 hr'  },
];

function getGradeColors(grade: GradeLetter, C: ComponentColors): { bg: string; text: string } {
  if (grade.startsWith('A')) return { bg: GAIN + '22', text: GAIN };
  if (grade.startsWith('B')) return { bg: C.surface as string, text: C.label as string };
  if (grade.startsWith('C')) return { bg: CAUTION + '22', text: CAUTION };
  return { bg: '#B85C5C22', text: '#B85C5C' };
}

export default function SportsMyAcademics() {
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
              <Text style={[s.titlePillText, { color: C.label }]}>My Academics</Text>
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
        {/* ELIGIBILITY HERO */}
        <View style={[s.heroCard, { backgroundColor: C.surface }]}>
          <View style={s.eligibilityRow}>
            <IconSymbol name="checkmark.circle.fill" size={32} color={GAIN} />
            <View style={s.eligibilityText}>
              <Text style={[s.eligibilityTitle, { color: C.label }]}>Eligible to Compete</Text>
              <Text style={[s.eligibilitySeason, { color: C.secondary }]}>2025–26 Season</Text>
            </View>
          </View>
          <View style={[s.divider, { backgroundColor: C.separator }]} />
          <View style={s.eligibilityPillRow}>
            <View style={[s.infoPill, { backgroundColor: C.bg, borderColor: C.separator }]}>
              <Text style={[s.infoPillText, { color: C.secondary }]}>Class Standing: RS Sophomore</Text>
            </View>
            <View style={[s.infoPill, { backgroundColor: C.bg, borderColor: C.separator }]}>
              <Text style={[s.infoPillText, { color: C.secondary }]}>Remaining Eligibility: 2 years</Text>
            </View>
          </View>
        </View>

        {/* GPA CARD */}
        <View style={[s.gpaCard, { backgroundColor: C.surface }]}>
          <View style={s.gpaTopRow}>
            <Text style={[s.gpaBigNumber, { color: GAIN }]}>3.2</Text>
            <View style={s.gpaRightCol}>
              <Text style={[s.gpaLabel, { color: C.secondary }]}>GPA</Text>
              <Text style={[s.gpaDelta, { color: GAIN }]}>↑ +0.1 vs last semester</Text>
              <View style={[s.goodStandingBadge, { backgroundColor: GAIN + '22' }]}>
                <Text style={[s.goodStandingText, { color: GAIN }]}>Good Standing</Text>
              </View>
            </View>
          </View>
          <View style={[s.divider, { backgroundColor: C.separator }]} />
          <Text style={[s.creditsLine, { color: C.secondary }]}>42 completed · 18 in progress · 60 remaining</Text>
          <Text style={[s.gradLine, { color: C.secondary }]}>Expected Graduation: May 2027</Text>
        </View>

        {/* CURRENT COURSES */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>CURRENT COURSES</Text>
        <View style={[s.coursesContainer, { backgroundColor: C.surface }]}>
          {COURSES.map((course, i) => {
            const gradeColors = getGradeColors(course.grade, C);
            return (
              <Pressable
                key={course.code}
                style={[
                  s.courseRow,
                  i < COURSES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <View style={s.courseInfo}>
                  <Text style={[s.courseName, { color: C.label }]}>{course.code} — {course.name}</Text>
                  <Text style={[s.courseNote, { color: C.secondary }]}>{course.note}</Text>
                </View>
                <View style={[s.gradeBadge, { backgroundColor: gradeColors.bg }]}>
                  <Text style={[s.gradeText, { color: gradeColors.text }]}>{course.grade}</Text>
                </View>
                <IconSymbol name="chevron.right" size={14} color={C.secondary} />
              </Pressable>
            );
          })}
        </View>

        {/* ADVISOR */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>ADVISOR</Text>
        <View style={[s.advisorCard, { backgroundColor: C.surface }]}>
          <View style={s.advisorTopRow}>
            <View style={[s.initialsCircle, { backgroundColor: C.separator }]}>
              <Text style={[s.initialsText, { color: C.label }]}>DR</Text>
            </View>
            <View style={s.advisorInfo}>
              <Text style={[s.advisorName, { color: C.label }]}>Dr. Angela Rivera</Text>
              <Text style={[s.advisorRole, { color: C.secondary }]}>Academic Advisor</Text>
              <View style={s.advisorIcons}>
                <IconSymbol name="phone.fill"    size={14} color={C.secondary} />
                <IconSymbol name="envelope.fill" size={14} color={C.secondary} />
              </View>
            </View>
          </View>
          <Pressable
            style={[s.meetingBtn, { backgroundColor: C.label }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <Text style={[s.meetingBtnText, { color: C.bg }]}>Schedule Meeting</Text>
          </Pressable>
          <Text style={[s.lastMet, { color: C.secondary }]}>Last met: Mar 12, 2026</Text>
        </View>

        {/* STUDY HALL */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>STUDY HALL</Text>
        <View style={[s.studyCard, { backgroundColor: C.surface }]}>
          <Text style={[s.studyWeekLabel, { color: C.secondary }]}>THIS WEEK</Text>
          <Text style={[s.studyHoursText, { color: C.label }]}>4 of 6 hours completed</Text>
          <View style={[s.studyBarTrack, { backgroundColor: C.separator }]}>
            <View style={[s.studyBarFill, { backgroundColor: GAIN, width: '67%' }]} />
          </View>
          <Text style={[s.studyRemaining, { color: CAUTION }]}>Remaining: 2 hours</Text>
          <View style={[s.divider, { backgroundColor: C.separator }]} />
          {CHECK_INS.map((ci, i) => (
            <View
              key={i}
              style={[
                s.checkInRow,
                i < CHECK_INS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <Text style={[s.checkInDay, { color: C.label }]}>{ci.day}</Text>
              <Text style={[s.checkInTime, { color: C.secondary }]}>{ci.time}</Text>
              <Text style={[s.checkInHours, { color: GAIN }]}>{ci.hours} ✓</Text>
            </View>
          ))}
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

  heroCard:          { borderRadius: 16, padding: 16, marginBottom: 20 },
  eligibilityRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  eligibilityText:   { flex: 1 },
  eligibilityTitle:  { fontSize: 20, fontWeight: '700' },
  eligibilitySeason: { fontSize: 13, marginTop: 2 },
  eligibilityPillRow:{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  infoPill:          { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  infoPillText:      { fontSize: 12 },

  gpaCard:           { borderRadius: 12, padding: 14, marginBottom: 16 },
  gpaTopRow:         { flexDirection: 'row', alignItems: 'center', gap: 16 },
  gpaBigNumber:      { fontSize: 40, fontWeight: '900' },
  gpaRightCol:       { flex: 1, gap: 4 },
  gpaLabel:          { fontSize: 10, fontWeight: '700' },
  gpaDelta:          { fontSize: 13 },
  goodStandingBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  goodStandingText:  { fontSize: 11, fontWeight: '700' },
  creditsLine:       { fontSize: 13 },
  gradLine:          { fontSize: 13, marginTop: 4 },

  coursesContainer: { borderRadius: 12, paddingHorizontal: 14 },
  courseRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 10 },
  courseInfo:       { flex: 1 },
  courseName:       { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  courseNote:       { fontSize: 12 },
  gradeBadge:       { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  gradeText:        { fontSize: 12, fontWeight: '700' },

  advisorCard:    { borderRadius: 12, padding: 14, marginBottom: 12 },
  advisorTopRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  initialsCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  initialsText:   { fontSize: 14, fontWeight: '800' },
  advisorInfo:    { flex: 1, gap: 2 },
  advisorName:    { fontSize: 15, fontWeight: '600' },
  advisorRole:    { fontSize: 12 },
  advisorIcons:   { flexDirection: 'row', gap: 10, marginTop: 4 },
  meetingBtn:     { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, alignSelf: 'flex-start', marginTop: 10 },
  meetingBtnText: { fontSize: 14, fontWeight: '600' },
  lastMet:        { fontSize: 12, marginTop: 8 },

  studyCard:       { borderRadius: 12, padding: 14 },
  studyWeekLabel:  { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 },
  studyHoursText:  { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  studyBarTrack:   { height: 8, borderRadius: 4, overflow: 'hidden' },
  studyBarFill:    { height: 8, borderRadius: 4 },
  studyRemaining:  { fontSize: 13, marginTop: 8 },
  checkInRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, gap: 8 },
  checkInDay:      { fontSize: 13, fontWeight: '600', flex: 1 },
  checkInTime:     { fontSize: 12 },
  checkInHours:    { fontSize: 12, fontWeight: '700' },
});
