/**
 * Competition Calendar — Races View
 * Upcoming and Completed race rounds from RACE_ROUNDS.
 * The "next" round gets a highlighted accent border.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { RACE_ROUNDS, type RaceRound } from '@/data/mock-competition-home';
import { openDriverCard, openTeamCard } from '@/utils/global-entity-sheets';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

function RaceCard({ round, colors, accent, isNext }: { round: RaceRound; colors: typeof Colors.light; accent: string; isNext: boolean }) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: isNext ? accent : colors.border },
        isNext && { borderWidth: 2 },
      ]}
    >
      <View style={styles.cardTop}>
        {/* Round badge */}
        <View style={[styles.roundBadge, { backgroundColor: isNext ? accent : 'rgba(255,255,255,0.08)' }]}>
          <ThemedText style={[styles.roundBadgeText, { color: isNext ? '#000' : colors.textSecondary }]}>
            R{round.round}
          </ThemedText>
        </View>

        <View style={{ flex: 1 }}>
          <ThemedText style={[styles.raceName, { color: colors.text }]}>{round.name}</ThemedText>
          <ThemedText style={[styles.raceMeta, { color: colors.textSecondary }]}>
            {round.venue}, {round.city}
          </ThemedText>
          <ThemedText style={[styles.raceDate, { color: colors.textSecondary }]}>
            {round.weekendDates.fri} – {round.weekendDates.sun}
          </ThemedText>
        </View>

        {isNext && (
          <View style={[styles.nextBadge, { backgroundColor: accent + '22' }]}>
            <ThemedText style={[styles.nextBadgeText, { color: accent }]}>NEXT</ThemedText>
          </View>
        )}
      </View>

      {/* Completed details — P1, P2, P3, Fastest Lap */}
      {round.status === 'completed' && (
        <View style={[styles.completedDetails, { borderTopColor: colors.border }]}>
          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>P1</ThemedText>
            <View style={styles.detailTapRow}>
              <Pressable
                onPress={() =>
                  openDriverCard({ name: round.winner!, number: '', team: round.winnerTeam || '' })
                }
              >
                <ThemedText style={[styles.detailValue, { color: accent }]}>{round.winner}</ThemedText>
              </Pressable>
              {round.winnerTeam && (
                <Pressable
                  onPress={() =>
                    openTeamCard({ name: round.winnerTeam!, record: '' })
                  }
                >
                  <ThemedText style={[styles.detailTeam, { color: colors.textSecondary }]}>
                    {' '}· {round.winnerTeam}
                  </ThemedText>
                </Pressable>
              )}
            </View>
          </View>
          {round.p2 && (
            <View style={styles.detailRow}>
              <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>P2</ThemedText>
              <ThemedText style={[styles.detailValue, { color: colors.text }]}>{round.p2}</ThemedText>
            </View>
          )}
          {round.p3 && (
            <View style={styles.detailRow}>
              <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>P3</ThemedText>
              <ThemedText style={[styles.detailValue, { color: colors.text }]}>{round.p3}</ThemedText>
            </View>
          )}
          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>FL</ThemedText>
            <ThemedText style={[styles.detailValue, { color: colors.text }]}>{round.fastestLap}</ThemedText>
          </View>
        </View>
      )}

      {/* Upcoming details — entry count + time */}
      {(round.status === 'next' || round.status === 'upcoming') && (round.entryCount || round.time) && (
        <View style={[styles.completedDetails, { borderTopColor: colors.border }]}>
          {round.entryCount != null && (
            <View style={styles.detailRow}>
              <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>Entries</ThemedText>
              <ThemedText style={[styles.detailValue, { color: colors.text }]}>{round.entryCount} entries confirmed</ThemedText>
            </View>
          )}
          {round.time && (
            <View style={styles.detailRow}>
              <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>Time</ThemedText>
              <ThemedText style={[styles.detailValue, { color: colors.text }]}>{round.time}</ThemedText>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export function CompCalendarRacesView({ colors, accent }: Props) {
  const upcoming = RACE_ROUNDS.filter((r) => r.status === 'next' || r.status === 'upcoming');
  const completed = RACE_ROUNDS.filter((r) => r.status === 'completed').reverse();

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* UPCOMING */}
      <ThemedText style={[styles.sectionHeader, { color: accent }]}>UPCOMING</ThemedText>
      {upcoming.length === 0 && (
        <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>No upcoming races</ThemedText>
      )}
      {upcoming.map((round) => (
        <RaceCard key={round.id} round={round} colors={colors} accent={accent} isNext={round.status === 'next'} />
      ))}

      {/* COMPLETED */}
      <ThemedText style={[styles.sectionHeader, { color: accent, marginTop: 20 }]}>COMPLETED</ThemedText>
      {completed.map((round) => (
        <RaceCard key={round.id} round={round} colors={colors} accent={accent} isNext={false} />
      ))}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  sectionHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  emptyText: { fontSize: 13, marginBottom: 16 },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  roundBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBadgeText: { fontSize: 13, fontWeight: '800' },
  raceName: { fontSize: 15, fontWeight: '700' },
  raceMeta: { fontSize: 11, marginTop: 2 },
  raceDate: { fontSize: 11, marginTop: 1 },
  nextBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  nextBadgeText: { fontSize: 10, fontWeight: '700' },
  completedDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 4,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailTapRow: { flexDirection: 'row', alignItems: 'center' },
  detailLabel: { fontSize: 11 },
  detailValue: { fontSize: 11, fontWeight: '600' },
  detailTeam: { fontSize: 11 },
});
