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

const COURSES = [
  {
    name: 'Business Administration 301',
    credits: 3,
    grade: 'B+',
    gradeColor: GAIN,
    prof: 'Prof. Martinez',
    next: 'Case Study — Due Apr 12',
  },
  {
    name: 'Sports Management 201',
    credits: 3,
    grade: 'A-',
    gradeColor: GAIN,
    prof: 'Prof. Chen',
    next: 'Midterm — Apr 15',
  },
  {
    name: 'Communications 150',
    credits: 3,
    grade: 'B',
    gradeColor: null,
    prof: 'Prof. Williams',
    next: 'Presentation — Apr 18',
  },
  {
    name: 'Physical Education 101',
    credits: 1,
    grade: 'A',
    gradeColor: GAIN,
    prof: 'Prof. Davis',
    next: 'No upcoming due',
  },
];

const TRAINING = [
  { label: 'New Member Orientation', status: 'Completed', detail: 'Feb 1', done: true },
  { label: 'Sheepfold Child Safety', status: 'Due: Apr 20', detail: '3 lessons remaining', done: false },
  { label: 'Athletic Code of Conduct', status: 'Completed', detail: 'Jan 15', done: true },
];

const RESOURCES = [
  { icon: 'book.fill' as const, title: 'Tutoring Center', sub: 'Mon-Fri 9AM-6PM' },
  { icon: 'calendar' as const, title: 'Academic Advisor', sub: 'Dr. Johnson — Next appt: Apr 14' },
  { icon: 'doc.fill' as const, title: 'Scholarship Requirements', sub: 'Maintain 2.5 GPA' },
];

export default function SportsPlayerAcademics() {
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
            <Text style={[s.titleText, { color: C.label }]}>MY ACADEMICS</Text>
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
        {/* Academic Status Card */}
        <View style={[s.statusCard, { backgroundColor: C.surface }]}>
          <View style={s.statusHeaderRow}>
            <Text style={[s.statusHeaderLabel, { color: C.secondary }]}>ELIGIBILITY STATUS</Text>
            <View style={[s.eligibleBadge, { backgroundColor: GAIN }]}>
              <Text style={s.eligibleBadgeText}>ELIGIBLE</Text>
            </View>
          </View>
          <View style={s.statusStatsRow}>
            <View style={s.statusStatCell}>
              <Text style={[s.statusStatValue, { color: GAIN }]}>3.2</Text>
              <Text style={[s.statusStatLabel, { color: C.secondary }]}>GPA</Text>
            </View>
            <View style={[s.statusStatDivider, { backgroundColor: C.separator }]} />
            <View style={s.statusStatCell}>
              <Text style={[s.statusStatValue, { color: C.label }]}>62</Text>
              <Text style={[s.statusStatLabel, { color: C.secondary }]}>Credits</Text>
            </View>
            <View style={[s.statusStatDivider, { backgroundColor: C.separator }]} />
            <View style={s.statusStatCell}>
              <Text style={[s.statusStatValue, { color: C.label }]}>Junior</Text>
              <Text style={[s.statusStatLabel, { color: C.secondary }]}>Standing</Text>
            </View>
          </View>
          <View style={s.semesterProgressRow}>
            <Text style={[s.semesterLabel, { color: C.secondary }]}>Week 11 of 16</Text>
            <Text style={[s.semesterPct, { color: C.secondary }]}>69%</Text>
          </View>
          <View style={[s.semesterBarTrack, { backgroundColor: C.separator }]}>
            <View style={[s.semesterBarFill, { backgroundColor: GAIN, width: '69%' }]} />
          </View>
        </View>

        {/* Current Courses */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>CURRENT COURSES</Text>
        <View style={s.coursesList}>
          {COURSES.map((course, i) => (
            <View key={i} style={[s.courseCard, { backgroundColor: C.surface }]}>
              <View style={s.courseHeaderRow}>
                <Text style={[s.courseName, { color: C.label }]}>{course.name}</Text>
                <View style={[s.gradeBadge, { backgroundColor: (course.gradeColor ?? C.secondary) + '22' }]}>
                  <Text style={[s.gradeText, { color: course.gradeColor ?? C.secondary }]}>{course.grade}</Text>
                </View>
              </View>
              <View style={s.courseMeta}>
                <Text style={[s.courseMetaText, { color: C.secondary }]}>{course.credits} cr · {course.prof}</Text>
              </View>
              <Text style={[s.courseNext, { color: C.secondary }]}>{course.next}</Text>
            </View>
          ))}
        </View>

        {/* Required Training */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>TEAM REQUIRED TRAINING</Text>
        <View style={[s.trainingCard, { backgroundColor: C.surface }]}>
          {TRAINING.map((item, i) => (
            <View
              key={i}
              style={[
                s.trainingRow,
                i < TRAINING.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <View style={[s.trainingIconWrap, { backgroundColor: item.done ? GAIN + '22' : CAUTION + '22' }]}>
                <IconSymbol
                  name={item.done ? 'checkmark' : 'exclamationmark.triangle.fill'}
                  size={14}
                  color={item.done ? GAIN : CAUTION}
                />
              </View>
              <View style={s.trainingInfo}>
                <Text style={[s.trainingLabel, { color: C.label }]}>{item.label}</Text>
                <Text style={[s.trainingDetail, { color: C.secondary }]}>{item.status} · {item.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Academic Resources */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>RESOURCES</Text>
        <View style={s.resourcesList}>
          {RESOURCES.map((res, i) => (
            <Pressable
              key={i}
              style={[s.resourceCard, { backgroundColor: C.surface }]}
              onPress={() => Alert.alert(res.title, `Opening ${res.title}...`)}
            >
              <IconSymbol name={res.icon} size={20} color={C.secondary} />
              <View style={s.resourceInfo}>
                <Text style={[s.resourceTitle, { color: C.label }]}>{res.title}</Text>
                <Text style={[s.resourceSub, { color: C.secondary }]}>{res.sub}</Text>
              </View>
              <IconSymbol name="chevron.right" size={14} color={C.secondary} />
            </Pressable>
          ))}
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
    // Status Card
    statusCard: { borderRadius: 14, marginHorizontal: 16, padding: 16 },
    statusHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    statusHeaderLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
    eligibleBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
    eligibleBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
    statusStatsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    statusStatCell: { flex: 1, alignItems: 'center' },
    statusStatValue: { fontSize: 22, fontWeight: '700', marginBottom: 2 },
    statusStatLabel: { fontSize: 11 },
    statusStatDivider: { width: StyleSheet.hairlineWidth, height: 40 },
    semesterProgressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    semesterLabel: { fontSize: 11 },
    semesterPct: { fontSize: 11, fontWeight: '600' },
    semesterBarTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
    semesterBarFill: { height: 6, borderRadius: 3 },
    // Courses
    coursesList: { gap: 8, paddingHorizontal: 16 },
    courseCard: { borderRadius: 12, padding: 14 },
    courseHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
    courseName: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
    gradeBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    gradeText: { fontSize: 12, fontWeight: '700' },
    courseMeta: { marginBottom: 4 },
    courseMetaText: { fontSize: 11 },
    courseNext: { fontSize: 12 },
    // Training
    trainingCard: { borderRadius: 12, marginHorizontal: 16, overflow: 'hidden' },
    trainingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
    trainingIconWrap: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    trainingInfo: { flex: 1 },
    trainingLabel: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
    trainingDetail: { fontSize: 11 },
    // Resources
    resourcesList: { gap: 8, paddingHorizontal: 16 },
    resourceCard: {
      borderRadius: 12, padding: 14,
      flexDirection: 'row', alignItems: 'center', gap: 12,
    },
    resourceInfo: { flex: 1 },
    resourceTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
    resourceSub: { fontSize: 12 },
  });
}
