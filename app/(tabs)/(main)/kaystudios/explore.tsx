import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert } from 'react-native';
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

const GAIN = '#5A8A6E';
const HEAT = '#B85C5C';
const CAUTION = '#B8943E';
const TOP_BAR_H = 52;

const CATEGORIES = ['All', 'Business', 'Coaching', 'Fitness', 'Tech', 'Creative', 'Personal Growth'] as const;
type Category = typeof CATEGORIES[number];

const TRENDING = [
  { id: 't1', emoji: '📈', title: 'Scale Your Brand',       creator: 'Marcus Cole',  enrolled: 1240, rating: 4.9, price: '$19/mo' },
  { id: 't2', emoji: '🎙️', title: 'Podcast Mastery',        creator: 'Aria Chen',    enrolled: 892,  rating: 4.8, price: 'Free'   },
  { id: 't3', emoji: '🏋️', title: 'Home Fitness Blueprint', creator: 'Devon Mills',  enrolled: 2100, rating: 4.7, price: '$9/mo'  },
  { id: 't4', emoji: '💻', title: 'No-Code App Building',   creator: 'Priya Nair',   enrolled: 673,  rating: 4.6, price: '$14/mo' },
  { id: 't5', emoji: '🎨', title: 'Design for Creators',    creator: 'Leo Santos',   enrolled: 445,  rating: 4.8, price: 'Free'   },
] as const;

const RECOMMENDED = [
  { id: 'r1', emoji: '✍️', title: 'Newsletter Growth System', creator: 'Zoe Harper', enrolled: 380, rating: 4.7, price: '$12/mo' },
  { id: 'r2', emoji: '📊', title: 'Analytics for Creators',   creator: 'Jake Wu',    enrolled: 156, rating: 4.5, price: 'Free'   },
  { id: 'r3', emoji: '🎬', title: 'Short-Form Video Strategy',creator: 'Nadia Bell', enrolled: 920, rating: 4.9, price: '$8/mo'  },
] as const;

const TOP_CREATORS = [
  { id: 'cr1', initials: 'MC', name: 'Marcus Cole',  courses: 8,  students: 4200 },
  { id: 'cr2', initials: 'AC', name: 'Aria Chen',    courses: 5,  students: 2800 },
  { id: 'cr3', initials: 'DM', name: 'Devon Mills',  courses: 12, students: 6100 },
  { id: 'cr4', initials: 'PN', name: 'Priya Nair',   courses: 4,  students: 1900 },
] as const;

const NEW_COURSES = [
  { id: 'n1', emoji: '🔮', title: 'AI for Content Creators',   creator: 'Sam Okafor',   price: '$15/mo' },
  { id: 'n2', emoji: '🌍', title: 'Global Brand Expansion',    creator: 'Yuki Tanaka',  price: 'Free'   },
  { id: 'n3', emoji: '💡', title: 'Idea to Product in 30 Days',creator: 'Rachel Bloom', price: '$10/mo' },
] as const;

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBarOuter: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
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
    categoryPill: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      marginRight: 8,
    },
    categoryText: {
      fontSize: 13,
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: C.label,
      marginHorizontal: 16,
      marginBottom: 12,
    },
    trendCard: {
      width: 160,
      backgroundColor: C.surface,
      borderRadius: 12,
      padding: 12,
      marginRight: 10,
    },
    emojiCircleLg: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: C.separator,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    emojiCircleMd: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: C.separator,
      alignItems: 'center',
      justifyContent: 'center',
    },
    trendTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: C.label,
      marginBottom: 4,
    },
    trendCreator: {
      fontSize: 11,
      color: C.secondary,
      marginBottom: 8,
    },
    trendMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap',
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    metaText: {
      fontSize: 11,
      color: C.secondary,
    },
    recCard: {
      backgroundColor: C.surface,
      marginHorizontal: 16,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    recInfo: {
      flex: 1,
    },
    recTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: C.label,
      marginBottom: 2,
    },
    recCreator: {
      fontSize: 12,
      color: C.secondary,
      marginBottom: 4,
    },
    recMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    creatorCard: {
      width: 120,
      backgroundColor: C.surface,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      marginRight: 10,
    },
    initialsCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    creatorName: {
      fontSize: 13,
      fontWeight: '700',
      color: C.label,
      textAlign: 'center',
      marginBottom: 2,
    },
    creatorMeta: {
      fontSize: 11,
      color: C.secondary,
      textAlign: 'center',
    },
    newCard: {
      backgroundColor: C.surface,
      marginHorizontal: 16,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    newInfo: {
      flex: 1,
    },
    newTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: C.label,
      marginBottom: 2,
    },
    newCreator: {
      fontSize: 12,
      color: C.secondary,
    },
  });
}

export default function ExploreScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(C), [C]);
  const { role, cycleRole, isOwner } = useDemoRole('kaystudios');
  const tap = useCallback(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), []);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  useFocusEffect(
    useCallback(() => {
      resetFooter();
    }, [])
  );

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top bar */}
      <View style={[s.topBarOuter, { backgroundColor: C.bg, borderBottomColor: C.separator, paddingTop: insets.top }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { tap(); openSidePanel(); }} style={{ width: 40, alignItems: 'center' }}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: C.label }}>Explore</Text>
          </View>
          <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={isOwner} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + TOP_BAR_H + 12,
          paddingBottom: insets.bottom + 80,
          gap: 24,
        }}
      >
        {/* Search bar */}
        <View>
          <View style={s.searchRow}>
            <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
            <TextInput
              style={s.searchInput}
              placeholder="Search courses and creators..."
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

          {/* Category pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <Pressable
                  key={cat}
                  style={[
                    s.categoryPill,
                    { backgroundColor: isActive ? C.label : C.surface },
                  ]}
                  onPress={() => { tap(); setActiveCategory(cat); }}
                >
                  <Text style={[s.categoryText, { color: isActive ? C.bg : C.secondary }]}>
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Trending Courses */}
        <View>
          <Text style={s.sectionTitle}>Trending Courses</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {TRENDING.map((course) => (
              <Pressable
                key={course.id}
                style={s.trendCard}
                onPress={() => { tap(); Alert.alert('Course', course.title); }}
              >
                <View style={s.emojiCircleLg}>
                  <Text style={{ fontSize: 22 }}>{course.emoji}</Text>
                </View>
                <Text style={s.trendTitle} numberOfLines={2}>{course.title}</Text>
                <Text style={s.trendCreator}>{course.creator}</Text>
                <View style={s.trendMeta}>
                  <View style={s.metaItem}>
                    <IconSymbol name="person.fill" size={10} color={C.secondary} />
                    <Text style={s.metaText}>{course.enrolled.toLocaleString()}</Text>
                  </View>
                  <View style={s.metaItem}>
                    <Text style={s.metaText}>★ {course.rating}</Text>
                  </View>
                  <Text style={[s.metaText, { color: course.price === 'Free' ? GAIN : C.label, fontWeight: '600' }]}>
                    {course.price}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Recommended for You */}
        <View>
          <Text style={s.sectionTitle}>Recommended for You</Text>
          {RECOMMENDED.map((course) => (
            <Pressable
              key={course.id}
              style={s.recCard}
              onPress={() => { tap(); Alert.alert('Course', course.title); }}
            >
              <View style={s.emojiCircleMd}>
                <Text style={{ fontSize: 20 }}>{course.emoji}</Text>
              </View>
              <View style={s.recInfo}>
                <Text style={s.recTitle}>{course.title}</Text>
                <Text style={s.recCreator}>{course.creator}</Text>
                <View style={s.recMeta}>
                  <Text style={[s.metaText, { color: course.price === 'Free' ? GAIN : C.label, fontWeight: '600' }]}>
                    {course.price}
                  </Text>
                  <Text style={s.metaText}>★ {course.rating}</Text>
                  <View style={s.metaItem}>
                    <IconSymbol name="person.fill" size={10} color={C.secondary} />
                    <Text style={s.metaText}>{course.enrolled.toLocaleString()}</Text>
                  </View>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={14} color={C.secondary} />
            </Pressable>
          ))}
        </View>

        {/* Top Creators */}
        <View>
          <Text style={s.sectionTitle}>Top Creators</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {TOP_CREATORS.map((creator) => (
              <Pressable
                key={creator.id}
                style={s.creatorCard}
                onPress={() => { tap(); Alert.alert('Creator', creator.name); }}
              >
                <View style={[s.initialsCircle, { backgroundColor: C.label }]}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: C.bg }}>
                    {creator.initials}
                  </Text>
                </View>
                <Text style={s.creatorName}>{creator.name}</Text>
                <Text style={s.creatorMeta}>{creator.courses} courses</Text>
                <Text style={s.creatorMeta}>{creator.students.toLocaleString()} students</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* New Courses */}
        <View>
          <Text style={s.sectionTitle}>New Courses</Text>
          {NEW_COURSES.map((course) => (
            <Pressable
              key={course.id}
              style={s.newCard}
              onPress={() => { tap(); Alert.alert('Course', course.title); }}
            >
              <View style={s.emojiCircleMd}>
                <Text style={{ fontSize: 20 }}>{course.emoji}</Text>
              </View>
              <View style={s.newInfo}>
                <Text style={s.newTitle}>{course.title}</Text>
                <Text style={s.newCreator}>{course.creator}</Text>
              </View>
              <Text style={[s.metaText, { color: course.price === 'Free' ? GAIN : C.label, fontWeight: '600', fontSize: 13 }]}>
                {course.price}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
