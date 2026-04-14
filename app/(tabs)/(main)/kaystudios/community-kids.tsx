/**
 * Community Kids — Member kids learning hub (Bible stories, activities, memory verse, age filter).
 */

import React, { useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { KMenuButton } from '@/components/ui/k-menu-button';

const TOP_BAR_H = 52;

const AGE_FILTERS = ['All', 'Toddler (2–4)', 'Elementary (5–10)', 'Preteen (11–13)'] as const;

const BIBLE_STORIES = [
  { emoji: '🪨', title: 'David & Goliath', duration: '8 min', ageRange: 'Ages 5–10' },
  { emoji: '🚢', title: "Noah's Ark",       duration: '6 min', ageRange: 'Ages 2–6'  },
  { emoji: '🧥', title: "Joseph's Coat",    duration: '10 min', ageRange: 'Ages 5–12' },
];

const ACTIVITIES = [
  { emoji: '🎨', title: 'Coloring Pages',          desc: '12 printable pages — downloadable PDF' },
  { emoji: '📋', title: 'Bible Story Worksheets',  desc: '8 activity sheets — downloadable PDF'  },
];

const MEMORY_CHECKS = [true, true, true, false, false];

export default function CommunityKidsScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [role, cycleRole, roleCycles] = useDemoRole('community:kaystudios');
  const isPastor = role === roleCycles[0];

  const [activeAge, setActiveAge] = React.useState<string>('All');

  const TOP_BAR_H_FULL = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(TOP_BAR_H_FULL);

  useFocusEffect(useCallback(() => {
    resetFooter();
  }, []));

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
              <Text style={[s.titleText, { color: C.label }]}>Kids</Text>
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
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Age Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {AGE_FILTERS.map(pill => {
            const active = activeAge === pill;
            return (
              <Pressable
                key={pill}
                style={[s.agePill, { backgroundColor: active ? C.label : C.separator }]}
                onPress={() => setActiveAge(pill)}
              >
                <Text style={[s.agePillText, { color: active ? C.bg : C.secondary }]}>{pill}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Bible Stories */}
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          <Text style={[s.sectionTitle, { color: C.label }]}>Bible Stories</Text>
          {BIBLE_STORIES.map(story => (
            <Pressable
              key={story.title}
              style={[s.card, { backgroundColor: C.surface }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert(story.title, `${story.duration} · ${story.ageRange}\n\nPlay this story?`, [
                  { text: 'Play', onPress: () => {} },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[s.emojiCircle, { backgroundColor: C.separator }]}>
                  <Text style={s.emojiText}>{story.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.storyTitle, { color: C.label }]}>{story.title}</Text>
                  <Text style={[s.storySub, { color: C.secondary }]}>{story.duration}</Text>
                </View>
                <View style={[s.ageBadge, { backgroundColor: C.separator }]}>
                  <Text style={[s.ageBadgeText, { color: C.secondary }]}>{story.ageRange}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Activities */}
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          <Text style={[s.sectionTitle, { color: C.label }]}>Activities</Text>
          {ACTIVITIES.map(act => (
            <Pressable
              key={act.title}
              style={[s.card, { backgroundColor: C.surface }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert(act.title, `${act.desc}\n\nDownload?`, [
                  { text: 'Download', onPress: () => {} },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[s.emojiCircle, { backgroundColor: C.separator }]}>
                  <Text style={s.emojiText}>{act.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.storyTitle, { color: C.label }]}>{act.title}</Text>
                  <Text style={[s.storySub, { color: C.secondary }]}>{act.desc}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Memory Verse of the Week */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 10 }]}>Memory Verse of the Week</Text>
          <View style={[s.memoryCard, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={[s.verseText, { color: C.label }]}>
              "I can do all things through Christ who strengthens me."
            </Text>
            <Text style={[s.verseRef, { color: C.label }]}>— Philippians 4:13</Text>

            {/* Completion tracker */}
            <View style={s.checkRow}>
              {MEMORY_CHECKS.map((checked, idx) => (
                <View
                  key={idx}
                  style={[
                    s.checkCircle,
                    {
                      backgroundColor: checked ? C.label : 'transparent',
                      borderColor: checked ? C.label : C.separator,
                    },
                  ]}
                >
                  {checked && <Text style={[s.checkMark, { color: C.bg }]}>✓</Text>}
                </View>
              ))}
            </View>
            <Text style={[s.checkHint, { color: C.secondary }]}>3 of 5 days memorized</Text>

            <Pressable
              style={[s.memorizedBtn, { backgroundColor: C.label }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Alert.alert('Verse Memorized', 'Great job! Keep it up.');
              }}
            >
              <Text style={[s.memorizedBtnText, { color: C.bg }]}>Mark as Memorized</Text>
            </Pressable>
          </View>
        </View>

        {/* Safe Environment Note */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={[s.safeNote, { color: C.secondary }]}>
            Content curated by ICCLA leadership for a safe learning environment.
          </Text>
        </View>
      </ScrollView>
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

    agePill:     { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
    agePillText: { fontSize: 13, fontWeight: '500' },

    sectionTitle: { fontSize: 16, fontWeight: '700' },

    card: { borderRadius: 12, padding: 14 },

    emojiCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    emojiText:   { fontSize: 20 },
    storyTitle:  { fontSize: 14, fontWeight: '700' },
    storySub:    { fontSize: 12, marginTop: 2 },
    ageBadge:    { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
    ageBadgeText:{ fontSize: 11, fontWeight: '500' },

    memoryCard: {
      borderRadius: 12, padding: 16, borderWidth: 1, gap: 12,
    },
    verseText: { fontSize: 15, fontStyle: 'italic', lineHeight: 22 },
    verseRef:  { fontSize: 13, fontWeight: '700' },

    checkRow:    { flexDirection: 'row', gap: 10, marginTop: 4 },
    checkCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    checkMark:   { fontSize: 14, fontWeight: '700' },
    checkHint:   { fontSize: 12 },

    memorizedBtn:     { borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
    memorizedBtnText: { fontSize: 14, fontWeight: '700' },

    safeNote: { fontSize: 12, fontStyle: 'italic', textAlign: 'center', lineHeight: 18 },
  });
}
