/**
 * KayStudios Analytics — Enrollments, revenue, completion rates, ratings, and
 * audience breakdown for the KayStudios content creator hub. Owner-only view.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  useWindowDimensions,
  Animated,
} from 'react-native';
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

// ─── Constants ────────────────────────────────────────────────────────────────

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';
const TOP_BAR_H = 52;

// ─── Mock data ─────────────────────────────────────────────────────────────────

const ENROLLMENT_TREND = [
  { month: 'Oct', count: 28 },
  { month: 'Nov', count: 45 },
  { month: 'Dec', count: 62 },
  { month: 'Jan', count: 84 },
  { month: 'Feb', count: 103 },
  { month: 'Mar', count: 127 },
  { month: 'Apr', count: 75 }, // partial month
] as const;

type CoursePerf = {
  id: string;
  emoji: string;
  title: string;
  enrolled: number;
  completionRate: number;
  revenue: string;
  rating: number;
};

const COURSE_PERFORMANCE: CoursePerf[] = [
  {
    id: 'cp1',
    emoji: '🎯',
    title: 'Creator Business Foundations',
    enrolled: 284,
    completionRate: 0.68,
    revenue: '$2,840',
    rating: 4.9,
  },
  {
    id: 'cp2',
    emoji: '📱',
    title: 'Social Media Mastery',
    enrolled: 147,
    completionRate: 0.71,
    revenue: '$1,176',
    rating: 4.7,
  },
  {
    id: 'cp3',
    emoji: '💰',
    title: 'Monetize Your Audience',
    enrolled: 93,
    completionRate: 0.55,
    revenue: '$1,395',
    rating: 4.8,
  },
];

const ACTIVE_STUDENTS = [
  { initials: 'JM', name: 'Jordan Mills', activity: 'Active today',     streak: 7  },
  { initials: 'SR', name: 'Sofia Reyes',  activity: 'Active today',     streak: 12 },
  { initials: 'TK', name: 'Tyler Knox',   activity: 'Active yesterday', streak: 4  },
];

const AT_RISK_STUDENTS = [
  { initials: 'AM', name: 'Alex Morgan', lastSeen: '18 days ago', course: 'Social Media Mastery'          },
  { initials: 'CL', name: 'Chris Liu',   lastSeen: '21 days ago', course: 'Creator Business Foundations'  },
];

// ─── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBarOuter: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      height: TOP_BAR_H,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    topBarTitle: {
      position: 'absolute',
      left: 0,
      right: 0,
      textAlign: 'center',
      fontSize: 17,
      fontWeight: '700',
      pointerEvents: 'none',
    },
    topBarRight: {
      marginLeft: 'auto',
    },

    // Scroll content
    scrollContent: {
      gap: 24,
      paddingBottom: 32,
    },

    // Section title
    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      paddingHorizontal: 16,
    },

    // Overview grid
    overviewGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      paddingHorizontal: 16,
    },
    overviewCard: {
      flex: 1,
      minWidth: '45%',
      borderRadius: 12,
      padding: 14,
    },
    overviewValue: {
      fontSize: 28,
      fontWeight: '800',
      color: GAIN,
    },
    overviewLabel: {
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 4,
    },

    // Enrollment chart
    chartRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 16,
    },
    barCol: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
    },
    barCountLabel: {
      fontSize: 10,
      fontWeight: '700',
    },
    barFill: {
      borderRadius: 4,
      minHeight: 4,
    },
    barMonthLabel: {
      fontSize: 10,
    },

    // Course performance
    courseCard: {
      marginHorizontal: 16,
      borderRadius: 12,
      padding: 14,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    courseRank: {
      fontSize: 14,
      width: 20,
      textAlign: 'center',
    },
    courseEmojiCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    courseEmojiText: {
      fontSize: 20,
    },
    courseInfo: {
      flex: 1,
    },
    courseTitle: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 4,
    },
    courseStatsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      alignItems: 'center',
    },
    courseStat: {
      fontSize: 12,
    },
    courseStatDot: {
      fontSize: 12,
    },
    courseRevenueStat: {
      fontSize: 12,
      color: GAIN,
    },

    // Student engagement
    studentSectionBlock: {
      gap: 8,
    },
    studentSubTitle: {
      fontSize: 14,
      fontWeight: '600',
      paddingHorizontal: 16,
    },
    studentCard: {
      marginHorizontal: 16,
      borderRadius: 12,
      overflow: 'hidden',
    },
    studentCardAtRisk: {
      borderLeftWidth: 3,
      borderLeftColor: HEAT,
    },
    studentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 12,
    },
    studentRowDivider: {
      marginHorizontal: 14,
    },
    initialsCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    initialsText: {
      fontSize: 14,
      fontWeight: '700',
    },
    studentInfo: {
      flex: 1,
    },
    studentName: {
      fontSize: 14,
      fontWeight: '600',
    },
    studentActivity: {
      fontSize: 12,
      marginTop: 1,
    },
    studentCourse: {
      fontSize: 12,
      marginTop: 1,
    },
    studentLastSeen: {
      fontSize: 12,
      color: HEAT,
      marginTop: 1,
    },
    streakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    streakCount: {
      fontSize: 14,
      fontWeight: '700',
    },
  });
}

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function KayStudiosAnalyticsScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const { role } = useDemoRole();
  const styles = useMemo(() => makeStyles(C), [C]);

  const isOwner = role === 'owner';

  const TOP_BAR_H_FULL = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(TOP_BAR_H_FULL);

  useFocusEffect(
    useCallback(() => {
      resetFooter();
      if (!isOwner) router.replace('/(tabs)/(main)/kaystudios' as any);
    }, [isOwner]),
  );

  // Bar chart dimensions
  const maxCount = Math.max(...ENROLLMENT_TREND.map((d) => d.count));
  const BAR_MAX_H = 80;
  const barWidth = (screenWidth - 80) / 7;

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      {/* ── Top Bar ── */}
      <Animated.View
        style={[
          styles.topBarOuter,
          { top: 0, paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity },
        ]}
      >
        <View style={styles.topBar}>
          <KMenuButton onPress={() => openSidePanel()} />
          <Text style={[styles.topBarTitle, { color: C.label }]}>Analytics</Text>
          <View style={styles.topBarRight}>
            <RolePill />
          </View>
        </View>
      </Animated.View>

      {/* ── Scrollable Content ── */}
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: TOP_BAR_H_FULL + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Overview Cards ── */}
        <View style={styles.overviewGrid}>
          {/* Total Enrollments */}
          <View style={[styles.overviewCard, { backgroundColor: C.surface }]}>
            <Text style={styles.overviewValue}>524</Text>
            <Text style={[styles.overviewLabel, { color: C.secondary }]}>
              Total Enrollments
            </Text>
          </View>

          {/* Completion Rate */}
          <View style={[styles.overviewCard, { backgroundColor: C.surface }]}>
            <Text style={styles.overviewValue}>65%</Text>
            <Text style={[styles.overviewLabel, { color: C.secondary }]}>
              Completion Rate
            </Text>
          </View>

          {/* Total Revenue */}
          <View style={[styles.overviewCard, { backgroundColor: C.surface }]}>
            <Text style={styles.overviewValue}>$5,411</Text>
            <Text style={[styles.overviewLabel, { color: C.secondary }]}>
              Total Revenue
            </Text>
          </View>

          {/* Average Rating */}
          <View style={[styles.overviewCard, { backgroundColor: C.surface }]}>
            <Text style={styles.overviewValue}>4.8 ★</Text>
            <Text style={[styles.overviewLabel, { color: C.secondary }]}>
              Average Rating
            </Text>
          </View>
        </View>

        {/* ── Enrollment Trend ── */}
        <View style={{ gap: 12 }}>
          <Text style={[styles.sectionTitle, { color: C.label }]}>
            Enrollment Trend
          </Text>
          <View style={[styles.chartRow, { alignItems: 'flex-end' }]}>
            {ENROLLMENT_TREND.map((item) => {
              const barH = Math.max((item.count / maxCount) * BAR_MAX_H, 4);
              return (
                <View key={item.month} style={[styles.barCol, { width: barWidth }]}>
                  <Text style={[styles.barCountLabel, { color: C.label }]}>
                    {item.count}
                  </Text>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: barH,
                        width: barWidth - 8,
                        backgroundColor: C.label,
                      },
                    ]}
                  />
                  <Text style={[styles.barMonthLabel, { color: C.secondary }]}>
                    {item.month}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Course Performance ── */}
        <View style={{ gap: 12 }}>
          <Text style={[styles.sectionTitle, { color: C.label }]}>
            Course Performance
          </Text>
          {COURSE_PERFORMANCE.map((course, idx) => (
            <Pressable
              key={course.id}
              style={[styles.courseCard, { backgroundColor: C.surface }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert(
                  'Course Detail',
                  'Lesson-by-lesson analytics coming soon',
                );
              }}
            >
              <Text style={[styles.courseRank, { color: C.secondary }]}>
                #{idx + 1}
              </Text>
              <View
                style={[
                  styles.courseEmojiCircle,
                  { backgroundColor: C.separator },
                ]}
              >
                <Text style={styles.courseEmojiText}>{course.emoji}</Text>
              </View>
              <View style={styles.courseInfo}>
                <Text style={[styles.courseTitle, { color: C.label }]}>
                  {course.title}
                </Text>
                <View style={styles.courseStatsRow}>
                  <Text style={[styles.courseStat, { color: C.secondary }]}>
                    {course.enrolled} enrolled
                  </Text>
                  <Text style={[styles.courseStatDot, { color: C.secondary }]}>
                    ·
                  </Text>
                  <Text style={[styles.courseStat, { color: C.secondary }]}>
                    {Math.round(course.completionRate * 100)}% completion
                  </Text>
                  <Text style={[styles.courseStatDot, { color: C.secondary }]}>
                    ·
                  </Text>
                  <Text style={styles.courseRevenueStat}>{course.revenue}</Text>
                  <Text style={[styles.courseStatDot, { color: C.secondary }]}>
                    ·
                  </Text>
                  <Text style={[styles.courseStat, { color: C.secondary }]}>
                    ★{course.rating}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* ── Student Engagement ── */}
        <View style={{ gap: 16 }}>
          <Text style={[styles.sectionTitle, { color: C.label }]}>
            Student Engagement
          </Text>

          {/* Most Active */}
          <View style={styles.studentSectionBlock}>
            <Text style={[styles.studentSubTitle, { color: C.secondary }]}>
              Most Active
            </Text>
            <View
              style={[
                styles.studentCard,
                { backgroundColor: C.surface },
              ]}
            >
              {ACTIVE_STUDENTS.map((student, idx) => (
                <React.Fragment key={student.initials}>
                  {idx > 0 && (
                    <View
                      style={[
                        styles.studentRowDivider,
                        {
                          height: StyleSheet.hairlineWidth,
                          backgroundColor: C.separator,
                        },
                      ]}
                    />
                  )}
                  <View style={styles.studentRow}>
                    <View
                      style={[
                        styles.initialsCircle,
                        { backgroundColor: C.label },
                      ]}
                    >
                      <Text style={[styles.initialsText, { color: C.bg }]}>
                        {student.initials}
                      </Text>
                    </View>
                    <View style={styles.studentInfo}>
                      <Text style={[styles.studentName, { color: C.label }]}>
                        {student.name}
                      </Text>
                      <Text
                        style={[styles.studentActivity, { color: C.secondary }]}
                      >
                        {student.activity}
                      </Text>
                    </View>
                    <View style={styles.streakBadge}>
                      <IconSymbol
                        name="flame.fill"
                        size={14}
                        color={CAUTION}
                      />
                      <Text
                        style={[styles.streakCount, { color: C.label }]}
                      >
                        {student.streak}
                      </Text>
                    </View>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* At Risk */}
          <View style={styles.studentSectionBlock}>
            <Text style={[styles.studentSubTitle, { color: C.secondary }]}>
              At Risk
            </Text>
            <View
              style={[
                styles.studentCard,
                styles.studentCardAtRisk,
                { backgroundColor: C.surface },
              ]}
            >
              {AT_RISK_STUDENTS.map((student, idx) => (
                <React.Fragment key={student.initials}>
                  {idx > 0 && (
                    <View
                      style={[
                        styles.studentRowDivider,
                        {
                          height: StyleSheet.hairlineWidth,
                          backgroundColor: C.separator,
                        },
                      ]}
                    />
                  )}
                  <View style={styles.studentRow}>
                    <View
                      style={[
                        styles.initialsCircle,
                        { backgroundColor: HEAT + '22' },
                      ]}
                    >
                      <Text style={[styles.initialsText, { color: HEAT }]}>
                        {student.initials}
                      </Text>
                    </View>
                    <View style={styles.studentInfo}>
                      <Text style={[styles.studentName, { color: C.label }]}>
                        {student.name}
                      </Text>
                      <Text
                        style={[styles.studentCourse, { color: C.secondary }]}
                      >
                        {student.course}
                      </Text>
                      <Text style={styles.studentLastSeen}>
                        {student.lastSeen}
                      </Text>
                    </View>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
