/**
 * Church Calendar — Services View
 * Upcoming and Past services with search, type badges, live indicator, and attendance.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { CHURCH_SERVICES, type ChurchService } from '@/data/mock-church-home';
import { openLeaderCard } from '@/utils/global-entity-sheets';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

function getTypeBadgeColor(type: ChurchService['type']): string {
  switch (type) {
    case 'sunday_morning': return '#1D9BF0';
    case 'sunday_evening': return '#1D9BF0';
    case 'midweek': return '#1D9BF0';
    case 'special': return '#F59E0B';
    default: return '#A1A1AA';
  }
}

function getTypeLabel(type: ChurchService['type']): string {
  switch (type) {
    case 'sunday_morning': return 'SUNDAY';
    case 'sunday_evening': return 'SUNDAY EVE';
    case 'midweek': return 'MIDWEEK';
    case 'special': return 'SPECIAL';
    default: return type.toUpperCase();
  }
}

export function ChurchCalendarServicesView({ colors, accent }: Props) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return CHURCH_SERVICES;
    const q = search.toLowerCase();
    return CHURCH_SERVICES.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.speaker.toLowerCase().includes(q) ||
        (s.topic?.toLowerCase().includes(q) ?? false),
    );
  }, [search]);

  const upcoming = filtered.filter((s) => s.status === 'upcoming');
  const past = filtered.filter((s) => s.status === 'past');

  const renderCard = (service: ChurchService) => {
    const badgeColor = getTypeBadgeColor(service.type);
    const isSpecial = service.type === 'special';
    return (
      <Pressable
        key={service.id}
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
          isSpecial && { borderLeftWidth: 2, borderLeftColor: accent },
        ]}
      >
        <View style={styles.cardTop}>
          <View style={[styles.typeBadge, { backgroundColor: badgeColor + '22' }]}>
            <ThemedText style={[styles.typeBadgeText, { color: badgeColor }]}>
              {getTypeLabel(service.type)}
            </ThemedText>
          </View>
          {service.isLive && (
            <View style={styles.liveBadge}>
              <ThemedText style={styles.liveText}>LIVE</ThemedText>
            </View>
          )}
          {service.status === 'past' && service.videoId && (
            <View style={[styles.videoBadge, { backgroundColor: '#1D9BF022' }]}>
              <ThemedText style={[styles.videoBadgeText, { color: '#1D9BF0' }]}>VIDEO</ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={[styles.title, { color: colors.text }]}>{service.title}</ThemedText>
        {service.seriesName && (
          <ThemedText style={[styles.seriesLabel, { color: accent }]}>
            {service.seriesName}
          </ThemedText>
        )}
        <ThemedText style={[styles.meta, { color: colors.textSecondary }]}>
          {service.date} · {service.time}
        </ThemedText>
        <Pressable
          onPress={() => openLeaderCard({ name: service.speaker, title: '' })}
          hitSlop={6}
        >
          <ThemedText style={[styles.speakerLink, { color: accent }]}>
            {service.speaker}
          </ThemedText>
        </Pressable>
        {service.topic && (
          <ThemedText style={[styles.topic, { color: colors.textSecondary }]} numberOfLines={1}>
            {service.topic}
          </ThemedText>
        )}
        {service.status === 'past' && service.attendance != null && (
          <ThemedText style={[styles.attendance, { color: accent }]}>
            {service.attendance.toLocaleString()} attended
          </ThemedText>
        )}
      </Pressable>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search services..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Upcoming */}
      <ThemedText style={[styles.sectionHeader, { color: accent }]}>UPCOMING</ThemedText>
      {upcoming.length === 0 && (
        <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
          No upcoming services found
        </ThemedText>
      )}
      {upcoming.map(renderCard)}

      {/* Past */}
      <ThemedText style={[styles.sectionHeader, { color: accent, marginTop: 20 }]}>PAST</ThemedText>
      {past.length === 0 && (
        <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
          No past services found
        </ThemedText>
      )}
      {past.map(renderCard)}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  searchBar: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, marginBottom: 14 },
  searchInput: { height: 40, fontSize: 14 },
  sectionHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  emptyText: { fontSize: 13, marginBottom: 16 },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },
  liveBadge: { backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  title: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  seriesLabel: { fontSize: 11, fontWeight: '600', fontStyle: 'italic', marginBottom: 2 },
  meta: { fontSize: 12, marginTop: 2 },
  speakerLink: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  topic: { fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  attendance: { fontSize: 12, fontWeight: '600', marginTop: 6 },
  videoBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  videoBadgeText: { fontSize: 10, fontWeight: '700' },
});
