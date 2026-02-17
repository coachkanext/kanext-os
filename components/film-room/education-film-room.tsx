/**
 * EducationFilmRoom — Classrooms: lectures, labs, recordings.
 * Pill nav: Lectures | Labs | Recordings | All
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  LECTURE_RECORDINGS,
  LAB_SESSIONS,
  formatFilmDuration,
  formatFilmDate,
  getStatusColor,
  getStatusLabel,
  type LectureRecording,
  type LabSession,
} from '@/data/mock-film-room';

type Tab = 'lectures' | 'labs' | 'recordings' | 'all';

const TABS: { key: Tab; label: string }[] = [
  { key: 'lectures', label: 'Lectures' },
  { key: 'labs', label: 'Labs' },
  { key: 'recordings', label: 'Recordings' },
  { key: 'all', label: 'All' },
];

type EducationItem =
  | (LectureRecording & { _type: 'lecture' })
  | (LabSession & { _type: 'lab' });

// ─── Lecture Card ───

function LectureCard({ item }: { item: LectureRecording }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: pressed ? colors.cardElevated : colors.card },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[styles.colorStrip, { backgroundColor: item.thumbnailColor }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.titleGroup}>
            <View style={[styles.courseCodeBadge, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[styles.courseCodeText, { color: colors.text }]}>
                {item.courseCode}
              </ThemedText>
            </View>
            <ThemedText style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
              {item.topic}
            </ThemedText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '1A' }]}>
            <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.professor}
        </ThemedText>
        <View style={styles.metaRow}>
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatFilmDate(item.date)}
          </ThemedText>
          <View style={styles.metaDot} />
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatFilmDuration(item.duration)}
          </ThemedText>
        </View>
        <View style={styles.tagRow}>
          {item.tags.map((tag) => (
            <View key={tag} style={[styles.tagChip, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[styles.tagText, { color: colors.textSecondary }]}>{tag}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

// ─── Lab Card ───

function LabCard({ item }: { item: LabSession }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: pressed ? colors.cardElevated : colors.card },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[styles.colorStrip, { backgroundColor: item.thumbnailColor }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <ThemedText style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '1A' }]}>
            <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.labName}
        </ThemedText>
        <View style={styles.metaRow}>
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatFilmDate(item.date)}
          </ThemedText>
          <View style={styles.metaDot} />
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatFilmDuration(item.duration)}
          </ThemedText>
        </View>
        <View style={styles.tagRow}>
          {item.equipmentTags.map((tag) => (
            <View key={tag} style={[styles.tagChip, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[styles.tagText, { color: colors.textSecondary }]}>{tag}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

// ─── All Items Card ───

function AllItemCard({ item }: { item: EducationItem }) {
  switch (item._type) {
    case 'lecture':
      return <LectureCard item={item} />;
    case 'lab':
      return <LabCard item={item} />;
  }
}

// ─── Main Component ───

export function EducationFilmRoom() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState<Tab>('lectures');

  const handleTabPress = (tab: Tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const allItems: EducationItem[] = [
    ...LECTURE_RECORDINGS.map((l) => ({ ...l, _type: 'lecture' as const })),
    ...LAB_SESSIONS.map((l) => ({ ...l, _type: 'lab' as const })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  // "Recordings" tab shows all items (lectures + labs) that are watched or in-progress
  const recordingsItems = allItems.filter(
    (item) => item.status === 'watched' || item.status === 'in-progress'
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'lectures':
        return (
          <FlatList
            data={LECTURE_RECORDINGS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <LectureCard item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'labs':
        return (
          <FlatList
            data={LAB_SESSIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <LabCard item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'recordings':
        return (
          <FlatList
            data={recordingsItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <AllItemCard item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'all':
        return (
          <FlatList
            data={allItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <AllItemCard item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Pill Nav */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
        style={styles.pillScroll}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[
                styles.pill,
                {
                  backgroundColor: active ? '#fff' : colors.backgroundTertiary,
                },
              ]}
              onPress={() => handleTabPress(tab.key)}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  { color: active ? '#000' : colors.textSecondary },
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content */}
      <View style={styles.contentArea}>{renderContent()}</View>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pillScroll: {
    flexGrow: 0,
    paddingVertical: Spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  pill: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },

  // Card
  card: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  colorStrip: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: Spacing.sm + 4,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: Spacing.sm,
  },
  courseCodeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  courseCodeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  subtitle: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#424242',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  tagChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
});
