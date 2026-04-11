/**
 * Community Learn — Member learning hub (courses in progress, required, available, devotionals, completed).
 */

import React, { useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { KMenuButton } from '@/components/ui/k-menu-button';

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

const TOP_BAR_H = 52;

const IN_PROGRESS = [
  { emoji: '💰', title: 'Biblical Financial Stewardship', progress: 33, lessonsDone: 4,  lessonsTotal: 12, label: '4/12 lessons' },
  { emoji: '🙏', title: 'Prayer & Fasting',               progress: 40, lessonsDone: 12, lessonsTotal: 30, label: 'Day 12/30' },
];

const AVAILABLE_COURSES = [
  { emoji: '📖', title: 'Church History 101',  type: 'Bible Study',  lessons: 8,  enrolled: 23 },
  { emoji: '🧒', title: 'Kids Ministry Training', type: 'Required Training', lessons: 4, enrolled: 18 },
  { emoji: '🌍', title: 'Global Missions 101', type: 'Course',       lessons: 6,  enrolled: 31 },
];

const DEVOTIONALS = [
  { emoji: '🙏', title: '30-Day Prayer Challenge',   day: 12, total: 30, pct: 40 },
  { emoji: '📜', title: 'Scripture Memory: Psalms',  day: 15, total: 30, pct: 50, isVerses: true },
];

const COMPLETED = [
  { emoji: '👋', title: 'New Member Orientation', completedDate: 'Feb 14, 2026', type: 'Required Training' },
];

function TypeBadge({ type, C }: { type: string; C: any }) {
  let bg: string;
  let textColor: string;
  switch (type) {
    case 'Required Training': bg = HEAT + '22';    textColor = HEAT;    break;
    case 'Devotional':        bg = CAUTION + '22'; textColor = CAUTION; break;
    case 'Bible Study':       bg = GAIN + '22';    textColor = GAIN;    break;
    default:                  bg = C.separator;    textColor = C.secondary; break;
  }
  return (
    <View style={{ backgroundColor: bg, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start' }}>
      <Text style={{ fontSize: 11, fontWeight: '600', color: textColor }}>{type}</Text>
    </View>
  );
}

export default function CommunityLearnScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [role, cycleRole, roleCycles] = useDemoRole('community:kaystudios');
  const isPastor = role === roleCycles[0];

  useFocusEffect(useCallback(() => {
    resetFooter();
  }, []));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable style={s.kBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8}>
          <KMenuButton />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={[s.titleText, { color: C.label }]}>Learn</Text>
          </View>
        </View>
        <View style={s.rolePillWrap}>
          <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + TOP_BAR_H + 12,
          paddingBottom: insets.bottom + 80,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* My Progress */}
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          <Text style={[s.sectionTitle, { color: C.label }]}>My Progress</Text>
          {IN_PROGRESS.map(c => (
            <View key={c.title} style={[s.card, { backgroundColor: C.surface }]}>
              <View style={s.courseRow}>
                <View style={[s.emojiCircle, { backgroundColor: C.separator }]}>
                  <Text style={s.emojiText}>{c.emoji}</Text>
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[s.courseTitle, { color: C.label }]}>{c.title}</Text>
                  <Text style={[s.courseSub, { color: C.secondary }]}>{c.label}</Text>
                  <View style={[s.progressTrack, { backgroundColor: C.separator }]}>
                    <View style={[s.progressFill, { backgroundColor: GAIN, width: `${c.progress}%` }]} />
                  </View>
                </View>
                <Pressable
                  style={[s.continueBtn, { backgroundColor: C.label }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Alert.alert('Continue', `Resuming "${c.title}"`);
                  }}
                >
                  <Text style={[s.continueBtnText, { color: C.bg }]}>Continue</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* Required Training */}
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          <Text style={[s.sectionTitle, { color: C.label }]}>Required Training</Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[s.emojiCircle, { backgroundColor: C.separator }]}>
                <Text style={s.emojiText}>👋</Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={[s.courseTitle, { color: C.label }]}>New Member Orientation</Text>
                <Text style={[s.courseSub, { color: C.secondary }]}>Complete to unlock serving roles</Text>
              </View>
              <View style={[s.urgencyBadge, { backgroundColor: HEAT + '22' }]}>
                <Text style={[s.urgencyText, { color: HEAT }]}>Required</Text>
              </View>
            </View>
            <Pressable
              style={[s.startBtn, { backgroundColor: C.label }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Start Course', 'Starting "New Member Orientation"');
              }}
            >
              <Text style={[s.continueBtnText, { color: C.bg }]}>Start Now</Text>
            </Pressable>
          </View>
        </View>

        {/* Available Courses */}
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          <Text style={[s.sectionTitle, { color: C.label }]}>Available Courses</Text>
          {AVAILABLE_COURSES.map(c => (
            <Pressable
              key={c.title}
              style={[s.card, { backgroundColor: C.surface }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert(c.title, 'Enroll in this course?', [
                  { text: 'Enroll', onPress: () => {} },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <View style={[s.emojiCircle, { backgroundColor: C.separator }]}>
                  <Text style={s.emojiText}>{c.emoji}</Text>
                </View>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={[s.courseTitle, { color: C.label }]}>{c.title}</Text>
                  <TypeBadge type={c.type} C={C} />
                  <View style={s.metaRow}>
                    <Text style={[s.metaText, { color: C.secondary }]}>{c.lessons} lessons</Text>
                    <View style={s.metaDot} />
                    <IconSymbol name="person.fill" size={11} color={C.secondary} />
                    <Text style={[s.metaText, { color: C.secondary }]}>{c.enrolled} enrolled</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Devotional Plans */}
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          <Text style={[s.sectionTitle, { color: C.label }]}>Devotional Plans</Text>
          {DEVOTIONALS.map(d => (
            <View key={d.title} style={[s.card, { backgroundColor: C.surface, gap: 10 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[s.emojiCircle, { backgroundColor: C.separator }]}>
                  <Text style={s.emojiText}>{d.emoji}</Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[s.courseTitle, { color: C.label }]}>{d.title}</Text>
                  <Text style={[s.courseSub, { color: C.secondary }]}>
                    {d.isVerses ? `${d.day} of ${d.total} verses` : `Day ${d.day} of ${d.total}`}
                  </Text>
                </View>
              </View>
              <View style={[s.progressTrack, { backgroundColor: C.separator }]}>
                <View style={[s.progressFill, { backgroundColor: GAIN, width: `${d.pct}%` }]} />
              </View>
              <Pressable
                style={[s.continueBtn, { backgroundColor: C.label, alignSelf: 'flex-start' }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Continue', `Continuing "${d.title}"`);
                }}
              >
                <Text style={[s.continueBtnText, { color: C.bg }]}>Continue</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Completed */}
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          <Text style={[s.sectionTitle, { color: C.label }]}>Completed</Text>
          {COMPLETED.map(c => (
            <View key={c.title} style={[s.card, { backgroundColor: C.surface }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[s.emojiCircle, { backgroundColor: GAIN + '22' }]}>
                  <Text style={s.emojiText}>{c.emoji ?? '✅'}</Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[s.courseTitle, { color: C.label }]}>{c.title}</Text>
                  <Text style={[s.courseSub, { color: C.secondary }]}>Completed {c.completedDate}</Text>
                </View>
                <View style={[s.certBadge, { backgroundColor: GAIN + '22' }]}>
                  <Text style={[s.certText, { color: GAIN }]}>Certificate</Text>
                </View>
              </View>
            </View>
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
    kBtn:         { width: 44, height: 36, justifyContent: 'center' },
    titlePill:    { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
    titleText:    { fontSize: 13, fontWeight: '700' },
    rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },

    sectionTitle: { fontSize: 16, fontWeight: '700' },

    card: { borderRadius: 12, padding: 14, gap: 10 },

    courseRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    emojiCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    emojiText:   { fontSize: 20 },
    courseTitle: { fontSize: 14, fontWeight: '700' },
    courseSub:   { fontSize: 12 },

    progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
    progressFill:  { height: 6, borderRadius: 3 },

    continueBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
    startBtn:    { borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 4 },
    continueBtnText: { fontSize: 13, fontWeight: '600' },

    urgencyBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
    urgencyText:  { fontSize: 11, fontWeight: '700' },

    metaRow:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText:  { fontSize: 12 },
    metaDot:   { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#9C9790' },

    certBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
    certText:  { fontSize: 11, fontWeight: '600' },
  });
}
