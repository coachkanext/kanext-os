/**
 * Community Courses — Pastor-only course management view.
 * Redirects Member to community-learn in useFocusEffect.
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
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { KMenuButton } from '@/components/ui/k-menu-button';

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

const TOP_BAR_H = 52;

type CourseType = 'Required Training' | 'Course' | 'Devotional' | 'Bible Study';

interface Course {
  emoji: string;
  title: string;
  type: CourseType;
  lessons: number;
  enrolled: number;
  completionPct: number;
  status: 'Live' | 'Draft';
}

const COURSES: Course[] = [
  { emoji: '👋', title: 'New Member Orientation',       type: 'Required Training', lessons: 6,  enrolled: 87, completionPct: 91, status: 'Live' },
  { emoji: '💰', title: 'Biblical Financial Stewardship', type: 'Course',           lessons: 12, enrolled: 43, completionPct: 68, status: 'Live' },
  { emoji: '🙏', title: 'Prayer & Fasting',              type: 'Devotional',        lessons: 30, enrolled: 54, completionPct: 77, status: 'Live' },
  { emoji: '📖', title: 'Church History 101',            type: 'Bible Study',       lessons: 8,  enrolled: 23, completionPct: 45, status: 'Live' },
  { emoji: '🧒', title: 'Kids Ministry Training',        type: 'Required Training', lessons: 4,  enrolled: 18, completionPct: 55, status: 'Live' },
];

const REQUIRED_TRAINING = [
  { title: 'Sheepfold Child Safety',  completed: 18, total: 22, color: GAIN    },
  { title: 'Usher Protocol',          completed: 8,  total: 12, color: CAUTION },
];

const FILTER_PILLS = ['All', 'Courses', 'Training', 'Devotionals', 'Studies'] as const;

function typeBadgeStyle(type: CourseType) {
  switch (type) {
    case 'Required Training': return { bg: HEAT + '22',    text: HEAT    };
    case 'Devotional':        return { bg: CAUTION + '22', text: CAUTION };
    case 'Bible Study':       return { bg: GAIN + '22',    text: GAIN    };
    default:                  return { bg: null,            text: null    };
  }
}

export default function CommunityCoursesScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('community:kaystudios');
  const isPastor = role === roleCycles[0];

  const TOP_BAR_H_FULL = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(TOP_BAR_H_FULL);

  const [activeFilter, setActiveFilter] = React.useState<string>('All');

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) {
      router.replace('/(tabs)/(main)/kaystudios/community-learn' as any);
    }
  }, [isPastor]));

  const openCourseMenu = (title: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(title, 'Choose an action', [
      { text: 'Edit' },
      { text: 'Duplicate' },
      { text: 'Unpublish' },
      { text: 'Delete', style: 'destructive' },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.kBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Courses</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{
          paddingTop: TOP_BAR_H_FULL + 12,
          paddingBottom: insets.bottom + 80,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Row */}
        <View style={[s.statsCard, { backgroundColor: C.surface }]}>
          <View style={s.statCell}>
            <Text style={[s.statValue, { color: C.label }]}>12</Text>
            <Text style={[s.statSub, { color: C.secondary }]}>Total Courses</Text>
          </View>
          <View style={[s.statDivider, { backgroundColor: C.separator }]} />
          <View style={s.statCell}>
            <Text style={[s.statValue, { color: C.label }]}>187</Text>
            <Text style={[s.statSub, { color: C.secondary }]}>Total Enrolled</Text>
          </View>
          <View style={[s.statDivider, { backgroundColor: C.separator }]} />
          <View style={s.statCell}>
            <Text style={[s.statValue, { color: GAIN }]}>74%</Text>
            <Text style={[s.statSub, { color: C.secondary }]}>Completion</Text>
          </View>
          <View style={[s.statDivider, { backgroundColor: C.separator }]} />
          <View style={s.statCell}>
            <Text style={[s.statValue, { color: HEAT }]}>3</Text>
            <Text style={[s.statSub, { color: C.secondary }]}>Active Training</Text>
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {FILTER_PILLS.map(pill => {
            const active = activeFilter === pill;
            return (
              <Pressable
                key={pill}
                style={[
                  s.filterPill,
                  { backgroundColor: active ? C.label : C.separator },
                ]}
                onPress={() => setActiveFilter(pill)}
              >
                <Text style={[s.filterPillText, { color: active ? C.bg : C.secondary }]}>{pill}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Course List */}
        <View style={{ gap: 10 }}>
          {COURSES.map(course => {
            const badge = typeBadgeStyle(course.type);
            const isSeparator = badge.bg === null;
            return (
              <View
                key={course.title}
                style={[s.courseCard, { backgroundColor: C.surface }]}
              >
                {/* Row 1: emoji + title + badge + three-dot */}
                <View style={s.courseHeader}>
                  <View style={[s.emojiCircle, { backgroundColor: C.separator }]}>
                    <Text style={s.emojiText}>{course.emoji}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[s.courseTitle, { color: C.label }]}>{course.title}</Text>
                    <View style={[
                      s.typeBadge,
                      {
                        backgroundColor: isSeparator ? C.separator : badge.bg!,
                        alignSelf: 'flex-start',
                      },
                    ]}>
                      <Text style={[s.typeBadgeText, { color: isSeparator ? C.secondary : badge.text! }]}>
                        {course.type}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    hitSlop={8}
                    onPress={() => openCourseMenu(course.title)}
                    style={s.dotBtn}
                  >
                    <Text style={[s.dotText, { color: C.secondary }]}>···</Text>
                  </Pressable>
                </View>

                {/* Row 2: meta */}
                <View style={s.courseMeta}>
                  <Text style={[s.metaText, { color: C.secondary }]}>
                    {course.lessons} lessons
                  </Text>
                  <View style={s.metaDot} />
                  <IconSymbol name="person.fill" size={11} color={C.secondary} />
                  <Text style={[s.metaText, { color: C.secondary }]}>{course.enrolled} enrolled</Text>
                  <View style={s.metaDot} />
                  <Text style={[s.metaText, { color: C.secondary }]}>{course.completionPct}% complete</Text>
                  <View style={s.metaDot} />
                  <View style={[s.statusDot, { backgroundColor: course.status === 'Live' ? GAIN : C.secondary }]} />
                  <Text style={[s.metaText, { color: course.status === 'Live' ? GAIN : C.secondary }]}>
                    {course.status}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Required Training Section */}
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          <View style={[s.divider, { backgroundColor: C.separator }]} />
          <Text style={[s.sectionLabel, { color: C.secondary }]}>Required Training</Text>
          {REQUIRED_TRAINING.map(t => {
            const pct = Math.round((t.completed / t.total) * 100);
            return (
              <View key={t.title} style={[s.trainingCard, { backgroundColor: C.surface }]}>
                <View style={s.trainingRow}>
                  <Text style={[s.trainingTitle, { color: C.label }]}>{t.title}</Text>
                  <Text style={[s.trainingCount, { color: t.color }]}>
                    {t.completed}/{t.total}
                  </Text>
                </View>
                <View style={[s.progressTrack, { backgroundColor: C.separator }]}>
                  <View style={[s.progressFill, { backgroundColor: t.color, width: `${pct}%` }]} />
                </View>
                <Text style={[s.trainingSubText, { color: C.secondary }]}>
                  {t.completed} of {t.total} volunteers completed
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 64 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Alert.alert('New Course', 'Create a new course, training, or devotional.');
        }}
      >
        <Text style={[s.fabText, { color: C.bg }]}>+</Text>
      </Pressable>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },

    topBarOuter: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      flexDirection: 'row', alignItems: 'flex-end',
      paddingBottom: 10, paddingHorizontal: 16,
      height: TOP_BAR_H,
    },
    kBtn:         { width: 44, height: 36, justifyContent: 'center' },
    titlePill:    { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
    titleText:    { fontSize: 13, fontWeight: '700' },
    rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },

    statsCard: {
      flexDirection: 'row', borderRadius: 12, marginHorizontal: 16,
      paddingVertical: 14, paddingHorizontal: 8,
    },
    statCell:    { flex: 1, alignItems: 'center' },
    statValue:   { fontSize: 18, fontWeight: '700' },
    statSub:     { fontSize: 10, marginTop: 2, textAlign: 'center' },
    statDivider: { width: StyleSheet.hairlineWidth, marginVertical: 6 },

    filterPill:     { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
    filterPillText: { fontSize: 13, fontWeight: '500' },

    courseCard: {
      borderRadius: 12, marginHorizontal: 16, padding: 14, gap: 10,
    },
    courseHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    emojiCircle:  { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    emojiText:    { fontSize: 20 },
    courseTitle:  { fontSize: 14, fontWeight: '700' },
    typeBadge:    { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
    typeBadgeText:{ fontSize: 11, fontWeight: '600' },
    dotBtn:       { padding: 4 },
    dotText:      { fontSize: 18, fontWeight: '700', letterSpacing: 2 },

    courseMeta:  { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
    metaText:    { fontSize: 12 },
    metaDot:     { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#9C9790' },
    statusDot:   { width: 6, height: 6, borderRadius: 3 },

    divider:      { height: StyleSheet.hairlineWidth, marginVertical: 4 },
    sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },

    trainingCard: { borderRadius: 10, padding: 12, gap: 8 },
    trainingRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    trainingTitle:{ fontSize: 13, fontWeight: '600' },
    trainingCount:{ fontSize: 13, fontWeight: '700' },
    trainingSubText: { fontSize: 11 },

    progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
    progressFill:  { height: 6, borderRadius: 3 },

    fab: {
      position: 'absolute', right: 20,
      width: 52, height: 52, borderRadius: 26,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
      elevation: 4,
    },
    fabText: { fontSize: 28, fontWeight: '300', lineHeight: 32 },
  });
}
