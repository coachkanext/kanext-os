/**
 * CommunityFilmRoom — Paddock: competition footage, events, technique breakdowns.
 * Pill nav: Races | Events | Breakdowns | All
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  COMPETITION_FOOTAGE,
  EVENT_RECORDINGS,
  formatFilmDuration,
  formatFilmDate,
  getStatusColor,
  getStatusLabel,
  type CompetitionFootage,
  type EventRecording,
} from '@/data/mock-film-room';

type Tab = 'races' | 'events' | 'breakdowns' | 'all';

const TABS: { key: Tab; label: string }[] = [
  { key: 'races', label: 'Races' },
  { key: 'events', label: 'Events' },
  { key: 'breakdowns', label: 'Breakdowns' },
  { key: 'all', label: 'All' },
];

type CommunityItem =
  | (CompetitionFootage & { _type: 'race' })
  | (EventRecording & { _type: 'event' });

// ─── Race Card ───

function RaceCard({ item }: { item: CompetitionFootage }) {
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
          {item.eventName}
        </ThemedText>
        <View style={styles.metaRow}>
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
            {item.track}
          </ThemedText>
          <View style={styles.metaDot} />
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatFilmDate(item.date)}
          </ThemedText>
          <View style={styles.metaDot} />
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatFilmDuration(item.duration)}
          </ThemedText>
        </View>
        <View style={[styles.resultBadge, { backgroundColor: colors.backgroundTertiary }]}>
          <IconSymbol name="flag.fill" size={10} color={colors.text} />
          <ThemedText style={[styles.resultText, { color: colors.text }]}>
            {item.result}
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

// ─── Event Card ───

function EventCard({ item }: { item: EventRecording }) {
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

// ─── Breakdown Card (technique breakdowns from competition footage) ───

function BreakdownCard({ item }: { item: CompetitionFootage }) {
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
          {item.category.charAt(0).toUpperCase() + item.category.slice(1)} Technique
        </ThemedText>
        <View style={styles.metaRow}>
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatFilmDuration(item.duration)}
          </ThemedText>
          <View style={styles.metaDot} />
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
            {item.eventName}
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

function AllItemCard({ item }: { item: CommunityItem }) {
  switch (item._type) {
    case 'race':
      return <RaceCard item={item} />;
    case 'event':
      return <EventCard item={item} />;
  }
}

// ─── Main Component ───

export function CommunityFilmRoom() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState<Tab>('races');

  const handleTabPress = (tab: Tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const allItems: CommunityItem[] = [
    ...COMPETITION_FOOTAGE.map((c) => ({ ...c, _type: 'race' as const })),
    ...EVENT_RECORDINGS.map((e) => ({ ...e, _type: 'event' as const })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  // "Breakdowns" tab = competition footage items treated as technique breakdowns
  const breakdownItems = COMPETITION_FOOTAGE;

  const renderContent = () => {
    switch (activeTab) {
      case 'races':
        return (
          <FlatList
            data={COMPETITION_FOOTAGE}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <RaceCard item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'events':
        return (
          <FlatList
            data={EVENT_RECORDINGS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <EventCard item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'breakdowns':
        return (
          <FlatList
            data={breakdownItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <BreakdownCard item={item} />}
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
  resultBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  resultText: {
    fontSize: 11,
    fontWeight: '600',
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
