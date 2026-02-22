/**
 * Competition Entries -- Confirmed View
 * Shows confirmed and pending entries with a progress bar header.
 */

import React, { useMemo } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { ENTRIES_CONFIRMED, ENTRY_DEADLINE, MAX_GRID_SIZE, RACE_ROUNDS } from '@/data/mock-competition-home';
import { openDriverCard } from '@/utils/global-entity-sheets';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function CompEntriesConfirmedView({ colors, accent }: Props) {
  const confirmed = useMemo(() => ENTRIES_CONFIRMED.filter((e) => e.status === 'confirmed'), []);
  const pending = useMemo(() => ENTRIES_CONFIRMED.filter((e) => e.status === 'pending'), []);
  const withdrawn = useMemo(() => ENTRIES_CONFIRMED.filter((e) => e.status === 'withdrawn'), []);
  const confirmedCount = confirmed.length;
  const permanentConfirmed = confirmed.filter((e) => e.type === 'permanent').length;
  const wildcardSlots = MAX_GRID_SIZE - permanentConfirmed;
  const progress = confirmedCount / MAX_GRID_SIZE;

  const nextRound = RACE_ROUNDS.find((r) => r.status === 'next');

  // Calculate days until entry deadline
  const deadlineDays = useMemo(() => {
    const deadlineDate = new Date(ENTRY_DEADLINE);
    const now = new Date();
    const diff = deadlineDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Round header */}
      {nextRound && (
        <View style={[styles.roundHeader, { backgroundColor: accent + '15', borderColor: accent + '30' }]}>
          <ThemedText style={[styles.roundHeaderText, { color: accent }]}>
            Round {nextRound.round} · {nextRound.city}
          </ThemedText>
        </View>
      )}

      {/* Progress header */}
      <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.progressTitle, { color: colors.text }]}>
          {confirmedCount}/{MAX_GRID_SIZE} entries confirmed · {wildcardSlots} wildcard slots open
        </ThemedText>
        <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
          <View
            style={[styles.progressBarFill, { backgroundColor: accent, width: `${progress * 100}%` }]}
          />
        </View>
        <ThemedText style={[styles.progressSub, { color: colors.textSecondary }]}>
          {pending.length} pending · {withdrawn.length > 0 ? `${withdrawn.length} withdrawn · ` : ''}
          {MAX_GRID_SIZE - confirmedCount - pending.length} open slot{MAX_GRID_SIZE - confirmedCount - pending.length !== 1 ? 's' : ''}
        </ThemedText>
      </View>

      {/* Entry deadline */}
      <View style={[styles.deadlineCard, { backgroundColor: '#F59E0B15', borderColor: '#F59E0B30' }]}>
        <ThemedText style={[styles.deadlineText, { color: '#F59E0B' }]}>
          Entry Deadline: {ENTRY_DEADLINE} · {deadlineDays} day{deadlineDays !== 1 ? 's' : ''}
        </ThemedText>
      </View>

      {/* Confirmed entries */}
      <ThemedText style={[styles.sectionHeader, { color: accent }]}>CONFIRMED</ThemedText>
      {confirmed.map((entry) => (
        <Pressable
          key={entry.id}
          style={[styles.entryRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => openDriverCard({ name: entry.driver, number: entry.number, team: entry.team })}
        >
          <ThemedText style={[styles.entryNumber, { color: colors.textSecondary }]}>#{entry.number}</ThemedText>
          <View style={styles.entryInfo}>
            <ThemedText style={[styles.entryDriver, { color: colors.text }]}>{entry.driver}</ThemedText>
            <ThemedText style={[styles.entryTeam, { color: colors.textSecondary }]}>{entry.team}</ThemedText>
          </View>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: entry.type === 'permanent' ? '#1D9BF020' : '#F59E0B20' },
            ]}
          >
            <ThemedText
              style={[
                styles.typeText,
                { color: entry.type === 'permanent' ? '#1D9BF0' : '#F59E0B' },
              ]}
            >
              {entry.type === 'permanent' ? 'Permanent' : 'Wildcard'}
            </ThemedText>
          </View>
          <View style={[styles.statusDot, { backgroundColor: '#22C55E' }]} />
        </Pressable>
      ))}

      {/* Pending entries */}
      {pending.length > 0 && (
        <>
          <ThemedText style={[styles.sectionHeader, { color: '#F59E0B', marginTop: 20 }]}>PENDING</ThemedText>
          {pending.map((entry) => (
            <Pressable
              key={entry.id}
              style={[styles.entryRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => openDriverCard({ name: entry.driver, number: entry.number, team: entry.team })}
            >
              <ThemedText style={[styles.entryNumber, { color: colors.textSecondary }]}>#{entry.number}</ThemedText>
              <View style={styles.entryInfo}>
                <ThemedText style={[styles.entryDriver, { color: colors.text }]}>{entry.driver}</ThemedText>
                <ThemedText style={[styles.entryTeam, { color: colors.textSecondary }]}>{entry.team}</ThemedText>
              </View>
              <View style={[styles.typeBadge, { backgroundColor: '#F59E0B20' }]}>
                <ThemedText style={[styles.typeText, { color: '#F59E0B' }]}>Wildcard</ThemedText>
              </View>
              <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
            </Pressable>
          ))}
        </>
      )}

      {/* Withdrawn entries */}
      {withdrawn.length > 0 && (
        <>
          <ThemedText style={[styles.sectionHeader, { color: '#EF4444', marginTop: 20 }]}>WITHDRAWN</ThemedText>
          {withdrawn.map((entry) => (
            <Pressable
              key={entry.id}
              style={[styles.entryRow, { backgroundColor: colors.card, borderColor: colors.border, opacity: 0.6 }]}
              onPress={() => openDriverCard({ name: entry.driver, number: entry.number, team: entry.team })}
            >
              <ThemedText style={[styles.entryNumber, { color: colors.textSecondary }]}>#{entry.number}</ThemedText>
              <View style={styles.entryInfo}>
                <ThemedText style={[styles.entryDriver, { color: colors.text }]}>{entry.driver}</ThemedText>
                <ThemedText style={[styles.entryTeam, { color: colors.textSecondary }]}>{entry.team}</ThemedText>
              </View>
              <View style={[styles.typeBadge, { backgroundColor: '#EF444420' }]}>
                <ThemedText style={[styles.typeText, { color: '#EF4444' }]}>Withdrawn</ThemedText>
              </View>
              <View style={[styles.statusDot, { backgroundColor: '#EF4444' }]} />
            </Pressable>
          ))}
        </>
      )}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  roundHeader: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  roundHeaderText: { fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
  progressCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  progressTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 6, borderRadius: 3 },
  progressSub: { fontSize: 12, marginTop: 8 },
  deadlineCard: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  deadlineText: { fontSize: 13, fontWeight: '600' },
  sectionHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  entryNumber: { fontSize: 13, fontWeight: '700', width: 32 },
  entryInfo: { flex: 1 },
  entryDriver: { fontSize: 14, fontWeight: '600' },
  entryTeam: { fontSize: 11, marginTop: 2 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeText: { fontSize: 10, fontWeight: '700' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});
