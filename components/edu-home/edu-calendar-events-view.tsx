/**
 * Education Calendar Events View
 * Search + Upcoming / Past sections with category badges.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TextInput, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import {
  EDU_EVENTS,
  EDU_EVENT_CATEGORY_COLORS,
  type EduEvent,
  type EduEventCategory,
} from '@/data/mock-education-home';
import { openPersonCard } from '@/utils/global-entity-sheets';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

function CategoryBadge({ category, colors }: { category: EduEventCategory; colors: typeof Colors.light }) {
  const badgeColor = EDU_EVENT_CATEGORY_COLORS[category];
  const label = category.replace('_', ' ');
  return (
    <View style={[styles.categoryBadge, { backgroundColor: badgeColor + '22' }]}>
      <ThemedText style={[styles.categoryBadgeText, { color: badgeColor }]}>
        {label}
      </ThemedText>
    </View>
  );
}

function EventCard({ event, colors, showOutcome }: { event: EduEvent; colors: typeof Colors.light; showOutcome?: boolean }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <CategoryBadge category={event.category} colors={colors} />
      </View>
      <ThemedText style={[styles.cardTitle, { color: colors.text }]}>{event.title}</ThemedText>
      <ThemedText style={[styles.cardMeta, { color: colors.textSecondary }]}>
        {event.date} · {event.time} · {event.location}
      </ThemedText>
      {(event.instructor || event.speaker) && (
        <Pressable
          onPress={() => {
            const name = event.instructor || event.speaker!;
            openPersonCard({ name, role: 'Speaker', status: 'active' });
          }}
        >
          <ThemedText style={[styles.cardSpeaker, { color: colors.textSecondary }]}>
            {event.instructor ? 'Instructor' : 'Speaker'}: <ThemedText style={styles.cardSpeakerLink}>{event.instructor || event.speaker}</ThemedText>
          </ThemedText>
        </Pressable>
      )}
      {showOutcome && event.attendance != null && (
        <ThemedText style={[styles.cardOutcome, { color: colors.textSecondary }]}>
          Attendance: {event.attendance.toLocaleString()}
          {event.outcome ? ` · ${event.outcome}` : ''}
        </ThemedText>
      )}
      {showOutcome && !event.attendance && event.outcome && (
        <ThemedText style={[styles.cardOutcome, { color: colors.textSecondary }]}>
          {event.outcome}
        </ThemedText>
      )}
    </View>
  );
}

export function EduCalendarEventsView({ colors, accent }: Props) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return EDU_EVENTS;
    const q = search.toLowerCase();
    return EDU_EVENTS.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.speaker && e.speaker.toLowerCase().includes(q)) ||
        e.category.toLowerCase().includes(q),
    );
  }, [search]);

  const upcoming = filtered.filter((e) => e.status === 'upcoming');
  const past = [...filtered.filter((e) => e.status === 'completed')].reverse();

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search events..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Upcoming */}
      <ThemedText style={[styles.sectionHeader, { color: accent }]}>UPCOMING</ThemedText>
      {upcoming.length === 0 && (
        <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
          No upcoming events
        </ThemedText>
      )}
      {upcoming.map((e) => (
        <EventCard key={e.id} event={e} colors={colors} />
      ))}

      {/* Past */}
      <ThemedText style={[styles.sectionHeader, { color: accent, marginTop: 20 }]}>PAST</ThemedText>
      {past.length === 0 && (
        <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
          No past events
        </ThemedText>
      )}
      {past.map((e) => (
        <EventCard key={e.id} event={e} colors={colors} showOutcome />
      ))}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  searchBar: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  searchInput: { fontSize: 14, padding: 0 },
  sectionHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  emptyText: { fontSize: 13, marginBottom: 16 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  cardHeader: { flexDirection: 'row', marginBottom: 6 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  categoryBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  cardMeta: { fontSize: 11, marginBottom: 2 },
  cardSpeaker: { fontSize: 11, fontStyle: 'italic', marginTop: 2 },
  cardSpeakerLink: { textDecorationLine: 'underline' },
  cardOutcome: { fontSize: 11, marginTop: 4 },
});
