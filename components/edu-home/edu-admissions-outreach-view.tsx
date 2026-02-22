/**
 * Education Admissions Outreach View
 * Upcoming (scheduled) + Completed sections with event cards.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { OUTREACH_EVENTS, type OutreachEvent, type OutreachEventType } from '@/data/mock-education-home';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

const TYPE_COLORS: Record<OutreachEventType, string> = {
  high_school_visit: '#1D9BF0',
  college_fair: '#1D9BF0',
  open_house: '#22C55E',
  virtual_info_session: '#F59E0B',
  community_event: '#EF4444',
};

const TYPE_LABELS: Record<OutreachEventType, string> = {
  high_school_visit: 'HS Visit',
  college_fair: 'College Fair',
  open_house: 'Open House',
  virtual_info_session: 'Virtual Session',
  community_event: 'Community',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function EduAdmissionsOutreachView({ colors, accent }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const upcoming = useMemo(() => {
    return OUTREACH_EVENTS
      .filter((e) => e.status === 'scheduled')
      .sort((a, b) => a.date.localeCompare(b.date));
  }, []);

  const completed = useMemo(() => {
    let result = OUTREACH_EVENTS.filter((e) => e.status === 'completed');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) => e.name.toLowerCase().includes(q) || e.recruiterName.toLowerCase().includes(q),
      );
    }
    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [searchQuery]);

  const renderCard = (event: OutreachEvent) => {
    const typeColor = TYPE_COLORS[event.type];
    const typeLabel = TYPE_LABELS[event.type];
    const isCompleted = event.status === 'completed';

    return (
      <View
        key={event.id}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <ThemedText style={[styles.eventName, { color: colors.text }]} numberOfLines={1}>
            {event.name}
          </ThemedText>
          <View style={[styles.typeBadge, { backgroundColor: typeColor + '22' }]}>
            <ThemedText style={[styles.typeText, { color: typeColor }]}>{typeLabel}</ThemedText>
          </View>
        </View>

        {/* Date & audience */}
        <ThemedText style={[styles.meta, { color: colors.textSecondary }]}>
          {formatDate(event.date)} · {event.targetAudience}
        </ThemedText>

        {/* Recruiter */}
        <ThemedText style={[styles.recruiter, { color: colors.textSecondary }]}>
          Recruiter: {event.recruiterName}
        </ThemedText>

        {/* Leads (completed only) */}
        {isCompleted && event.leadsGenerated !== undefined && (
          <View style={styles.leadsRow}>
            <View style={[styles.leadsBadge, { backgroundColor: accent + '22' }]}>
              <ThemedText style={[styles.leadsText, { color: accent }]}>
                {event.leadsGenerated} leads generated
              </ThemedText>
            </View>
          </View>
        )}

        {/* Status indicator */}
        {!isCompleted && (
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: '#22C55E' }]} />
            <ThemedText style={[styles.statusLabel, { color: colors.textSecondary }]}>Scheduled</ThemedText>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* UPCOMING */}
      <ThemedText style={[styles.sectionHeader, { color: accent }]}>UPCOMING</ThemedText>
      {upcoming.length === 0 && (
        <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
          No upcoming events
        </ThemedText>
      )}
      {upcoming.map(renderCard)}

      {/* COMPLETED + Search */}
      <ThemedText style={[styles.sectionHeader, { color: accent, marginTop: 16 }]}>COMPLETED</ThemedText>
      <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search completed events..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="done"
        />
      </View>
      {completed.length === 0 && (
        <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
          No matching events
        </ThemedText>
      )}
      {completed.map(renderCard)}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  sectionHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  emptyText: { fontSize: 13, marginBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 8,
    height: 36,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eventName: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeText: { fontSize: 10, fontWeight: '700' },
  meta: { fontSize: 12 },
  recruiter: { fontSize: 11 },
  leadsRow: { flexDirection: 'row', marginTop: 4 },
  leadsBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  leadsText: { fontSize: 11, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 11 },
});
