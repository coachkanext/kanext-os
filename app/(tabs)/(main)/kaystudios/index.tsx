import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  ActionSheetIOS,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, Redirect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppContext } from '@/context/app-context';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

// ─── Constants ────────────────────────────────────────────────────────────────

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';
const TOP_BAR_H = 52;

// ─── Types ────────────────────────────────────────────────────────────────────

type CourseStatus = 'Live' | 'Draft';

type Course = {
  id: string;
  emoji: string;
  title: string;
  lessons: number;
  status: CourseStatus;
  enrolled: number;
  revenue: string;
};

type EnrolledCourse = {
  id: string;
  emoji: string;
  title: string;
  progress: number;
};

type AvailableCourse = {
  id: string;
  emoji: string;
  title: string;
  lessons: number;
  enrolled: number;
  price: string;
  rating: number;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_COURSES: Course[] = [
  { id: 'c1', emoji: '🎯', title: 'Creator Business Foundations', lessons: 12, status: 'Live',  enrolled: 284, revenue: '$2,840' },
  { id: 'c2', emoji: '📱', title: 'Social Media Mastery',         lessons: 8,  status: 'Live',  enrolled: 147, revenue: '$1,176' },
  { id: 'c3', emoji: '💰', title: 'Monetize Your Audience',       lessons: 10, status: 'Live',  enrolled: 93,  revenue: '$1,395' },
  { id: 'c4', emoji: '🎬', title: 'Video Production Basics',      lessons: 6,  status: 'Draft', enrolled: 0,   revenue: '$0'     },
  { id: 'c5', emoji: '✍️', title: 'Content Writing Workshop',      lessons: 5,  status: 'Draft', enrolled: 0,   revenue: '$0'     },
];

const ENROLLED_COURSES: EnrolledCourse[] = [
  { id: 'e1', emoji: '🎯', title: 'Creator Business Foundations', progress: 0.42 },
  { id: 'e2', emoji: '📱', title: 'Social Media Mastery',         progress: 0.75 },
];

const AVAILABLE_COURSES: AvailableCourse[] = [
  { id: 'a1', emoji: '💰', title: 'Monetize Your Audience',    lessons: 10, enrolled: 93, price: '$15/mo',                       rating: 4.8 },
  { id: 'a2', emoji: '🎬', title: 'Video Production Basics',   lessons: 6,  enrolled: 0,  price: 'Free',                         rating: 0   },
  { id: 'a3', emoji: '✍️', title: 'Content Writing Workshop',   lessons: 5,  enrolled: 0,  price: 'Included with Inner Circle',   rating: 0   },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
    },
    topBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingBottom: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      zIndex: 100,
    },
    iconBtn: {
      width: 40,
      alignItems: 'center',
    },
    // ── Stats ──
    statsRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      gap: 10,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      borderRadius: 12,
      padding: 12,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '800',
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    // ── Filter pills ──
    filterRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      gap: 8,
      marginBottom: 16,
    },
    pill: {
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    pillText: {
      fontSize: 13,
      fontWeight: '600',
    },
    // ── Course card (Owner) ──
    courseCard: {
      borderRadius: 14,
      padding: 14,
      marginHorizontal: 16,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    emojiCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emojiCircleSm: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    courseInfo: {
      flex: 1,
    },
    courseTitle: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 2,
    },
    courseMeta: {
      fontSize: 12,
      marginBottom: 6,
    },
    courseMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    statusBadge: {
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '700',
    },
    enrolledText: {
      fontSize: 13,
      fontWeight: '700',
    },
    revenueText: {
      fontSize: 13,
      fontWeight: '700',
      color: GAIN,
    },
    dotsBtn: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dotsText: {
      fontSize: 16,
      letterSpacing: 1,
    },
    // ── Section header ──
    sectionHeader: {
      fontSize: 16,
      fontWeight: '700',
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    // ── Enrolled (Follower) ──
    enrolledScroll: {
      paddingLeft: 16,
      paddingRight: 4,
      gap: 12,
      marginBottom: 24,
    },
    enrolledCard: {
      width: 160,
      borderRadius: 12,
      padding: 12,
    },
    enrolledTitle: {
      fontSize: 13,
      fontWeight: '700',
      marginTop: 8,
      marginBottom: 8,
    },
    progressTrack: {
      height: 4,
      borderRadius: 2,
      marginBottom: 4,
    },
    progressFill: {
      height: 4,
      borderRadius: 2,
      backgroundColor: GAIN,
    },
    progressText: {
      fontSize: 11,
      marginBottom: 6,
    },
    continueBtn: {
      borderRadius: 8,
      paddingVertical: 6,
      alignItems: 'center',
      marginTop: 2,
    },
    continueBtnText: {
      fontSize: 12,
      fontWeight: '700',
    },
    // ── Available course card (Follower) ──
    availableCard: {
      borderRadius: 14,
      padding: 14,
      marginHorizontal: 16,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    availableInfo: {
      flex: 1,
    },
    availableTitle: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 2,
    },
    availableMeta: {
      fontSize: 12,
      marginBottom: 6,
    },
    priceFree: {
      fontSize: 13,
      fontWeight: '700',
      color: GAIN,
    },
    priceIncluded: {
      fontSize: 12,
      fontWeight: '600',
      color: CAUTION,
    },
    pricePaid: {
      fontSize: 13,
      fontWeight: '700',
    },
    ratingText: {
      fontSize: 12,
    },
  });
}

// ─── Owner View ───────────────────────────────────────────────────────────────

interface OwnerViewProps {
  C: ComponentColors;
  s: ReturnType<typeof makeStyles>;
  filter: 'All' | 'Live' | 'Draft';
  setFilter: (f: 'All' | 'Live' | 'Draft') => void;
  filteredCourses: Course[];
  tap: () => void;
}

function OwnerView({ C, s, filter, setFilter, filteredCourses, tap }: OwnerViewProps) {
  const handleDots = (course: Course) => {
    tap();
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Edit', 'Duplicate', 'Unpublish', 'Delete', 'Cancel'],
        cancelButtonIndex: 4,
        destructiveButtonIndex: 3,
        title: course.title,
      },
      (idx) => {
        if (idx === 0) Alert.alert('Edit Course', 'Coming soon');
        else if (idx === 1) Alert.alert('Duplicate Course', 'Coming soon');
        else if (idx === 2) Alert.alert('Unpublish Course', 'Coming soon');
        else if (idx === 3)
          Alert.alert('Delete Course', 'This action cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => {} },
          ]);
      },
    );
  };

  return (
    <>
      {/* Stats row */}
      <View style={s.statsRow}>
        <View style={[s.statCard, { backgroundColor: C.surface }]}>
          <Text style={[s.statValue, { color: C.label }]}>5</Text>
          <Text style={[s.statLabel, { color: C.secondary }]}>Total Courses</Text>
        </View>
        <View style={[s.statCard, { backgroundColor: C.surface }]}>
          <Text style={[s.statValue, { color: GAIN }]}>524</Text>
          <Text style={[s.statLabel, { color: C.secondary }]}>Enrolled</Text>
        </View>
        <View style={[s.statCard, { backgroundColor: C.surface }]}>
          <Text style={[s.statValue, { color: GAIN }]}>$5,411</Text>
          <Text style={[s.statLabel, { color: C.secondary }]}>Revenue</Text>
        </View>
      </View>

      {/* Filter pills */}
      <View style={s.filterRow}>
        {(['All', 'Live', 'Draft'] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => { tap(); setFilter(f); }}
            style={[
              s.pill,
              { backgroundColor: filter === f ? C.label : C.surface },
            ]}
          >
            <Text
              style={[
                s.pillText,
                { color: filter === f ? C.bg : C.secondary },
              ]}
            >
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Course list */}
      {filteredCourses.map((course) => (
        <Pressable
          key={course.id}
          style={[s.courseCard, { backgroundColor: C.surface }]}
          onPress={() => { tap(); Alert.alert('Course Editor', 'Coming soon'); }}
        >
          <View style={[s.emojiCircleSm, { backgroundColor: C.separator }]}>
            <Text style={{ fontSize: 20 }}>{course.emoji}</Text>
          </View>

          <View style={s.courseInfo}>
            <Text style={[s.courseTitle, { color: C.label }]} numberOfLines={1}>
              {course.title}
            </Text>
            <Text style={[s.courseMeta, { color: C.secondary }]}>
              {course.lessons} lessons
            </Text>
            <View style={s.courseMetaRow}>
              {/* Status badge */}
              <View
                style={[
                  s.statusBadge,
                  {
                    backgroundColor:
                      course.status === 'Live'
                        ? GAIN + '22'
                        : C.separator,
                  },
                ]}
              >
                <Text
                  style={[
                    s.statusText,
                    {
                      color:
                        course.status === 'Live' ? GAIN : C.secondary,
                    },
                  ]}
                >
                  {course.status}
                </Text>
              </View>

              {/* Enrolled */}
              {course.status === 'Live' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <IconSymbol name="person.fill" size={12} color={C.secondary} />
                  <Text style={[s.enrolledText, { color: C.label }]}>
                    {course.enrolled}
                  </Text>
                </View>
              )}

              {/* Revenue */}
              {course.status === 'Live' && (
                <Text style={s.revenueText}>{course.revenue}</Text>
              )}
            </View>
          </View>

          {/* 3-dot button */}
          <Pressable
            style={s.dotsBtn}
            onPress={() => handleDots(course)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[s.dotsText, { color: C.secondary }]}>•••</Text>
          </Pressable>
        </Pressable>
      ))}
    </>
  );
}

// ─── Follower View ────────────────────────────────────────────────────────────

interface FollowerViewProps {
  C: ComponentColors;
  s: ReturnType<typeof makeStyles>;
  tap: () => void;
}

function FollowerView({ C, s, tap }: FollowerViewProps) {
  return (
    <>
      {/* Enrolled section */}
      {ENROLLED_COURSES.length > 0 && (
        <>
          <Text style={[s.sectionHeader, { color: C.label }]}>
            Continue Learning
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.enrolledScroll}
            style={{ marginBottom: 24 }}
          >
            {ENROLLED_COURSES.map((course) => (
              <View
                key={course.id}
                style={[s.enrolledCard, { backgroundColor: C.surface }]}
              >
                <View
                  style={[
                    s.emojiCircle,
                    { backgroundColor: C.separator, alignSelf: 'flex-start' },
                  ]}
                >
                  <Text style={{ fontSize: 22 }}>{course.emoji}</Text>
                </View>
                <Text
                  style={[s.enrolledTitle, { color: C.label }]}
                  numberOfLines={2}
                >
                  {course.title}
                </Text>
                {/* Progress bar */}
                <View style={[s.progressTrack, { backgroundColor: C.separator }]}>
                  <View
                    style={[s.progressFill, { width: `${course.progress * 100}%` }]}
                  />
                </View>
                <Text style={[s.progressText, { color: C.secondary }]}>
                  {Math.round(course.progress * 100)}% complete
                </Text>
                <Pressable
                  style={[s.continueBtn, { backgroundColor: C.label }]}
                  onPress={() => { tap(); Alert.alert('Course Player', 'Coming soon'); }}
                >
                  <Text style={[s.continueBtnText, { color: C.bg }]}>
                    Continue
                  </Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </>
      )}

      {/* Available courses section */}
      <Text style={[s.sectionHeader, { color: C.label, marginTop: 4 }]}>
        Available Courses
      </Text>
      {AVAILABLE_COURSES.map((course) => (
        <Pressable
          key={course.id}
          style={[s.availableCard, { backgroundColor: C.surface }]}
          onPress={() => { tap(); Alert.alert('Course Detail', 'Coming soon'); }}
        >
          <View style={[s.emojiCircle, { backgroundColor: C.separator }]}>
            <Text style={{ fontSize: 22 }}>{course.emoji}</Text>
          </View>

          <View style={s.availableInfo}>
            <Text style={[s.availableTitle, { color: C.label }]} numberOfLines={2}>
              {course.title}
            </Text>
            <Text style={[s.availableMeta, { color: C.secondary }]}>
              {course.lessons} lessons
              {course.enrolled > 0 ? ` · ${course.enrolled} enrolled` : ''}
            </Text>

            {/* Price */}
            {course.price === 'Free' ? (
              <Text style={s.priceFree}>Free</Text>
            ) : course.price.startsWith('Included') ? (
              <Text style={s.priceIncluded}>{course.price}</Text>
            ) : (
              <Text style={[s.pricePaid, { color: C.label }]}>{course.price}</Text>
            )}

            {/* Rating */}
            {course.rating > 0 && (
              <Text style={[s.ratingText, { color: C.secondary, marginTop: 3 }]}>
                {'★'} {course.rating}
              </Text>
            )}
          </View>

          <IconSymbol name="chevron.right" size={16} color={C.secondary} />
        </Pressable>
      ))}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function KayStudiosScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);

  const { state } = useAppContext();
  const mode = state.activeContext?.mode ?? state.mode ?? 'personal';

  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaystudios');
  const isOwner = role === roleCycles[0];

  const [filter, setFilter] = useState<'All' | 'Live' | 'Draft'>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  // ── Community mode: redirect to Courses (Pastor) — community-courses redirects Member to community-learn ──
  if (mode === 'community') {
    return <Redirect href="/(tabs)/(main)/kaystudios/community-courses" />;
  }

  const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const filteredCourses = useMemo(
    () =>
      filter === 'All'
        ? MOCK_COURSES
        : MOCK_COURSES.filter((c) => c.status === filter),
    [filter],
  );

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top bar */}
      <View
        style={[
          s.topBar,
          {
            paddingTop: insets.top,
            height: insets.top + TOP_BAR_H,
            backgroundColor: C.bg,
            borderBottomColor: C.separator,
          },
        ]}
      >
        <Pressable
          style={s.iconBtn}
          onPress={() => { tap(); openSidePanel(); }}
        >
          <KMenuButton />
        </Pressable>

        <Text style={{ fontSize: 17, fontWeight: '700', color: C.label }}>
          {isOwner ? 'My Courses' : 'Courses'}
        </Text>

        <RolePill
          role={role}
          onPress={cycleRole}
          accentColor={C.label}
          isPrimary={isOwner}
        />
      </View>

      {/* Scrollable content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + TOP_BAR_H + 16,
          paddingBottom: insets.bottom + 100,
        }}
      >
        {isOwner ? (
          <OwnerView
            C={C}
            s={s}
            filter={filter}
            setFilter={setFilter}
            filteredCourses={filteredCourses}
            tap={tap}
          />
        ) : (
          <FollowerView C={C} s={s} tap={tap} />
        )}
      </ScrollView>

      {/* Owner FAB */}
      {isOwner && (
        <Pressable
          onPress={() => { tap(); Alert.alert('New Course', 'Coming soon'); }}
          style={{
            position: 'absolute',
            bottom: insets.bottom + 70,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: C.label,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconSymbol name="plus" size={24} color={C.bg} />
        </Pressable>
      )}
    </View>
  );
}
