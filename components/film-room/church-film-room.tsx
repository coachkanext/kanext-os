/**
 * ChurchFilmRoom — Ministry Rooms: sermons, teachings, events.
 * Pill nav: Sermons | Teachings | Events | All
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  SERMON_RECORDINGS,
  TEACHING_SESSIONS,
  MINISTRY_EVENTS,
  formatFilmDuration,
  formatFilmDate,
  getStatusColor,
  getStatusLabel,
  type SermonRecording,
  type TeachingSession,
  type MinistryEvent,
} from '@/data/mock-film-room';

type Tab = 'sermons' | 'teachings' | 'events' | 'all';

const TABS: { key: Tab; label: string }[] = [
  { key: 'sermons', label: 'Sermons' },
  { key: 'teachings', label: 'Teachings' },
  { key: 'events', label: 'Events' },
  { key: 'all', label: 'All' },
];

type ChurchItem =
  | (SermonRecording & { _type: 'sermon' })
  | (TeachingSession & { _type: 'teaching' })
  | (MinistryEvent & { _type: 'event' });

// ─── Sermon Card ───

function SermonCard({ item }: { item: SermonRecording }) {
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
          {item.speaker}
        </ThemedText>
        <View style={styles.metaRow}>
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatFilmDate(item.date)}
          </ThemedText>
          <View style={styles.metaDot} />
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatFilmDuration(item.duration)}
          </ThemedText>
          <View style={styles.metaDot} />
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
            {item.seriesName}
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

// ─── Teaching Card ───

function TeachingCard({ item }: { item: TeachingSession }) {
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
            {item.topic}
          </ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '1A' }]}>
            <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.facilitator}
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

// ─── Ministry Event Card ───

function EventCard({ item }: { item: MinistryEvent }) {
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
        <View style={styles.metaRow}>
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatFilmDate(item.date)}
          </ThemedText>
          <View style={styles.metaDot} />
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatFilmDuration(item.duration)}
          </ThemedText>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: colors.backgroundTertiary }]}>
          <ThemedText style={[styles.typeBadgeText, { color: colors.textSecondary }]}>
            {item.eventType}
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

// ─── All Items Card ───

function AllItemCard({ item }: { item: ChurchItem }) {
  switch (item._type) {
    case 'sermon':
      return <SermonCard item={item} />;
    case 'teaching':
      return <TeachingCard item={item} />;
    case 'event':
      return <EventCard item={item} />;
  }
}

// ─── Main Component ───

export function ChurchFilmRoom() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState<Tab>('sermons');

  const handleTabPress = (tab: Tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const allItems: ChurchItem[] = [
    ...SERMON_RECORDINGS.map((s) => ({ ...s, _type: 'sermon' as const })),
    ...TEACHING_SESSIONS.map((t) => ({ ...t, _type: 'teaching' as const })),
    ...MINISTRY_EVENTS.map((e) => ({ ...e, _type: 'event' as const })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const renderContent = () => {
    switch (activeTab) {
      case 'sermons':
        return (
          <FlatList
            data={SERMON_RECORDINGS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <SermonCard item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'teachings':
        return (
          <FlatList
            data={TEACHING_SESSIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TeachingCard item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'events':
        return (
          <FlatList
            data={MINISTRY_EVENTS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <EventCard item={item} />}
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
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
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
    backgroundColor: '#52525B',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
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
