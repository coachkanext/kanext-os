import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const GAIN = '#5A8A6E';
const HEAT = '#B85C5C';
const CAUTION = '#B8943E';
const TOP_BAR_H = 52;

type FilterPill = 'All' | 'In Progress' | 'Completed';
const FILTER_PILLS: FilterPill[] = ['All', 'In Progress', 'Completed'];

type LibraryCourse = {
  id: string;
  emoji: string;
  title: string;
  creator: string;
  mode: string;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
};

const OWNER_LIBRARY: LibraryCourse[] = [
  { id: 'ol1', emoji: '📈', title: 'Scale Your Brand',        creator: 'Marcus Cole', mode: 'Personal',  progress: 0.42, lessonsCompleted: 5,  totalLessons: 12 },
  { id: 'ol2', emoji: '🏢', title: 'B2B Sales Fundamentals',  creator: 'Raj Patel',   mode: 'Business',  progress: 0.75, lessonsCompleted: 6,  totalLessons: 8  },
  { id: 'ol3', emoji: '🎓', title: 'Academic Writing 101',    creator: 'Prof. Kim',   mode: 'Education', progress: 1.0,  lessonsCompleted: 10, totalLessons: 10 },
  { id: 'ol4', emoji: '🏈', title: 'Strength & Conditioning', creator: 'Coach Davis', mode: 'Athletics', progress: 0.2,  lessonsCompleted: 2,  totalLessons: 10 },
  { id: 'ol5', emoji: '🌍', title: 'Community Leadership',    creator: 'Maya Evans',  mode: 'Community', progress: 0.0,  lessonsCompleted: 0,  totalLessons: 7  },
  { id: 'ol6', emoji: '🎙️', title: 'Podcast Mastery',        creator: 'Aria Chen',   mode: 'Personal',  progress: 1.0,  lessonsCompleted: 8,  totalLessons: 8  },
];

const FOLLOWER_LIBRARY: LibraryCourse[] = [
  { id: 'fl1', emoji: '🎯', title: 'Creator Business Foundations', creator: 'Sammy Kalejaiye', mode: 'Personal', progress: 0.42, lessonsCompleted: 5,  totalLessons: 12 },
  { id: 'fl2', emoji: '📱', title: 'Social Media Mastery',         creator: 'Sammy Kalejaiye', mode: 'Personal', progress: 0.75, lessonsCompleted: 6,  totalLessons: 8  },
];

const MODE_BADGE_COLORS: Record<string, string> = {
  Personal:  '#5A8A6E',
  Business:  '#9C9790',
  Education: '#B8943E',
  Athletics: '#B85C5C',
  Community: '#9C9790',
};

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBarOuter: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      height: TOP_BAR_H,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.surface,
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 12,
      height: 44,
      paddingHorizontal: 12,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: C.label,
    },
    filterPill: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      marginRight: 8,
    },
    filterText: {
      fontSize: 13,
      fontWeight: '600',
    },
    courseCard: {
      backgroundColor: C.surface,
      marginHorizontal: 16,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 10,
    },
    emojiCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: C.separator,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardInfo: {
      flex: 1,
    },
    courseTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: C.label,
      marginBottom: 2,
    },
    courseCreator: {
      fontSize: 12,
      color: C.secondary,
      marginBottom: 4,
    },
    modeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      alignSelf: 'flex-start',
    },
    modeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    modeBadgeText: {
      fontSize: 11,
      fontWeight: '600',
    },
    progressTrack: {
      height: 4,
      backgroundColor: C.separator,
      borderRadius: 2,
      overflow: 'hidden',
      marginBottom: 6,
    },
    progressFill: {
      height: 4,
      borderRadius: 2,
    },
    lessonCount: {
      fontSize: 11,
      color: C.secondary,
    },
    completedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
    },
    completedText: {
      fontSize: 11,
      color: GAIN,
      fontWeight: '600',
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 60,
    },
    emptyText: {
      fontSize: 15,
      color: C.secondary,
    },
  });
}

export default function LibraryScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(C), [C]);
  const { role, cycleRole, isOwner } = useDemoRole('kaystudios');
  const tap = useCallback(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), []);

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [search, setSearch] = useState('');
  const [filterPill, setFilterPill] = useState<FilterPill>('All');

  useFocusEffect(
    useCallback(() => {
      resetFooter();
    }, [])
  );

  const baseLibrary = isOwner ? OWNER_LIBRARY : FOLLOWER_LIBRARY;

  const filtered = useMemo(() => {
    return baseLibrary
      .filter((c) => {
        if (filterPill === 'All') return true;
        if (filterPill === 'In Progress') return c.progress > 0 && c.progress < 1.0;
        if (filterPill === 'Completed') return c.progress === 1.0;
        return true;
      })
      .filter((c) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return c.title.toLowerCase().includes(q) || c.creator.toLowerCase().includes(q);
      });
  }, [baseLibrary, filterPill, search]);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { tap(); openSidePanel(); }} style={{ width: 40, alignItems: 'center' }}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: C.label }}>Library</Text>
          </View>
          <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={isOwner} />
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + TOP_BAR_H + 8,
          paddingBottom: insets.bottom + 80,
        }}
      >
        {/* Search bar */}
        <View style={s.searchRow}>
          <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
          <TextInput
            style={s.searchInput}
            placeholder="Search your library..."
            placeholderTextColor={C.secondary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <IconSymbol name="xmark.circle.fill" size={16} color={C.secondary} />
            </Pressable>
          )}
        </View>

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, marginBottom: 16 }}
        >
          {FILTER_PILLS.map((pill) => {
            const isActive = filterPill === pill;
            return (
              <Pressable
                key={pill}
                style={[
                  s.filterPill,
                  { backgroundColor: isActive ? C.label : C.surface },
                ]}
                onPress={() => { tap(); setFilterPill(pill); }}
              >
                <Text style={[s.filterText, { color: isActive ? C.bg : C.secondary }]}>
                  {pill}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Course list */}
        {filtered.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyText}>No courses yet</Text>
          </View>
        ) : (
          filtered.map((course) => {
            const isCompleted = course.progress === 1.0;
            const badgeColor = MODE_BADGE_COLORS[course.mode] ?? C.secondary;

            return (
              <Pressable
                key={course.id}
                style={s.courseCard}
                onPress={() => { tap(); Alert.alert('Resume Course', course.title); }}
              >
                <View style={s.cardRow}>
                  <View style={s.emojiCircle}>
                    <Text style={{ fontSize: 22 }}>{course.emoji}</Text>
                  </View>

                  <View style={s.cardInfo}>
                    <Text style={s.courseTitle}>{course.title}</Text>
                    <Text style={s.courseCreator}>{course.creator}</Text>
                    {isOwner && (
                      <View style={s.modeBadge}>
                        <View style={[s.modeDot, { backgroundColor: badgeColor }]} />
                        <Text style={[s.modeBadgeText, { color: badgeColor }]}>
                          {course.mode}
                        </Text>
                      </View>
                    )}
                  </View>

                  <IconSymbol name="chevron.right" size={14} color={C.secondary} />
                </View>

                {isCompleted ? (
                  <View style={s.completedRow}>
                    <IconSymbol name="checkmark.circle.fill" size={14} color={GAIN} />
                    <Text style={s.completedText}>
                      Completed · {course.totalLessons} lessons
                    </Text>
                  </View>
                ) : (
                  <>
                    <View style={s.progressTrack}>
                      <View
                        style={[
                          s.progressFill,
                          {
                            width: `${Math.round(course.progress * 100)}%`,
                            backgroundColor: GAIN,
                          },
                        ]}
                      />
                    </View>
                    <Text style={s.lessonCount}>
                      {course.lessonsCompleted}/{course.totalLessons} lessons
                    </Text>
                  </>
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
