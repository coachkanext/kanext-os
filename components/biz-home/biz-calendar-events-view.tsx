/**
 * Biz Calendar Events View — Upcoming + Past event cards
 * Search bar, category badges, tappable attendee names via openPersonCard.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors , MODE_ACCENT } from '@/constants/theme';
import { BIZ_EVENTS, type BizEvent } from '@/data/mock-business-home';
import { openPersonCard } from '@/utils/global-entity-sheets';


const ACCENT = MODE_ACCENT.business;
const CATEGORY_COLORS: Record<BizEvent['category'], string> = {
  investor: '#5A8A6E',
  board: ACCENT,
  product: ACCENT,
  legal: '#9C9790',
  media: '#B85C5C',
  conference: '#B8943E',
};

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function BizCalendarEventsView({ colors, accent }: Props) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return BIZ_EVENTS;
    const q = search.toLowerCase();
    return BIZ_EVENTS.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.attendees.some((a) => a.name.toLowerCase().includes(q)) ||
        e.category.toLowerCase().includes(q),
    );
  }, [search]);

  const upcoming = filtered.filter((e) => e.status === 'upcoming');
  const past = [...filtered.filter((e) => e.status === 'completed')].reverse();

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Search */}
      <TextInput
        style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        placeholder="Search events..."
        placeholderTextColor={colors.textSecondary}
        value={search}
        onChangeText={setSearch}
      />

      {/* Upcoming */}
      <ThemedText style={[styles.sectionHeader, { color: accent }]}>UPCOMING</ThemedText>
      {upcoming.length === 0 && (
        <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>No upcoming events</ThemedText>
      )}
      {upcoming.map((ev) => (
        <EventCard key={ev.id} event={ev} colors={colors} />
      ))}

      {/* Past */}
      <ThemedText style={[styles.sectionHeader, { color: accent, marginTop: 20 }]}>PAST</ThemedText>
      {past.length === 0 && (
        <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>No past events</ThemedText>
      )}
      {past.map((ev) => (
        <EventCard key={ev.id} event={ev} colors={colors} />
      ))}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function EventCard({ event, colors }: { event: BizEvent; colors: typeof Colors.light }) {
  const catColor = CATEGORY_COLORS[event.category];
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Category badge */}
      <View style={[styles.categoryBadge, { backgroundColor: catColor + '22' }]}>
        <ThemedText style={[styles.categoryText, { color: catColor }]}>
          {event.category.toUpperCase()}
        </ThemedText>
      </View>

      <ThemedText style={[styles.title, { color: colors.text }]}>{event.title}</ThemedText>
      <ThemedText style={[styles.meta, { color: colors.textSecondary }]}>
        {event.date} · {event.time} · {event.location}
      </ThemedText>

      {/* Attendees */}
      <View style={styles.attendeeRow}>
        {event.attendees.map((a) => (
          <Pressable
            key={a.name}
            onPress={() => openPersonCard({ name: a.name, role: a.role, status: 'active' })}
          >
            <ThemedText style={[styles.attendeeName, { color: ACCENT }]}>{a.name}</ThemedText>
          </Pressable>
        ))}
      </View>

      {/* Outcome (past events) */}
      {event.outcome && (
        <ThemedText style={[styles.outcome, { color: colors.textSecondary }]}>{event.outcome}</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  searchBar: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  sectionHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  emptyText: { fontSize: 13, marginBottom: 16 },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginBottom: 8 },
  categoryText: { fontSize: 10, fontWeight: '700' },
  title: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  meta: { fontSize: 11, marginBottom: 8 },
  attendeeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  attendeeName: { fontSize: 12, fontWeight: '600' },
  outcome: { fontSize: 12, fontStyle: 'italic', marginTop: 6 },
});
