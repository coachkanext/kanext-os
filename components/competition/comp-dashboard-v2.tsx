/**
 * Competition Dashboard V2
 * - Video Hero with LinearGradient + LIVE badge + play button
 * - Next Event Card (next round from RACE_ROUNDS)
 * - Commerce Row (3 cards: Tickets, Watch, Wildcard Entry)
 * - Quick Standings (top 3 drivers)
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import {
  COMP_HERO,
  COMP_COMMERCE,
  RACE_ROUNDS,
  DRIVER_STANDINGS,
} from '@/data/mock-competition-home';
import { openDriverCard } from '@/utils/global-entity-sheets';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function CompDashboardV2({ colors, accent }: Props) {
  const nextRound = RACE_ROUNDS.find((r) => r.status === 'next');
  const topDrivers = DRIVER_STANDINGS.slice(0, 3);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* ─── Video Hero ──────────────────────────────────────────── */}
      <View style={styles.heroWrapper}>
        <LinearGradient
          colors={['#1a0a0a', '#0d0d0d', '#000']}
          style={styles.heroGradient}
        >
          {/* Play button */}
          <Pressable style={styles.playButton}>
            <IconSymbol name="play.fill" size={28} color="#fff" />
          </Pressable>

          {/* Overlay text */}
          <View style={styles.heroOverlay}>
            {COMP_HERO.isLive && (
              <View style={styles.liveBadge}>
                <ThemedText style={styles.liveText}>LIVE</ThemedText>
              </View>
            )}
            <ThemedText style={styles.heroTitle}>{COMP_HERO.title}</ThemedText>
            <ThemedText style={styles.heroSubtitle}>{COMP_HERO.subtitle}</ThemedText>
          </View>
        </LinearGradient>
      </View>

      {/* ─── Next Event Card ─────────────────────────────────────── */}
      {nextRound && (
        <View style={[styles.nextEventCard, { backgroundColor: colors.card, borderColor: accent }]}>
          <View style={styles.nextEventHeader}>
            <View style={[styles.roundBadge, { backgroundColor: accent }]}>
              <ThemedText style={styles.roundBadgeText}>R{nextRound.round}</ThemedText>
            </View>
            <View style={[styles.nextLabel, { backgroundColor: accent + '22' }]}>
              <ThemedText style={[styles.nextLabelText, { color: accent }]}>NEXT RACE</ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.nextEventName, { color: colors.text }]}>{nextRound.name}</ThemedText>
          <ThemedText style={[styles.nextEventMeta, { color: colors.textSecondary }]}>
            {nextRound.venue}, {nextRound.city} · {nextRound.date}
          </ThemedText>

          {/* Weekend schedule */}
          <View style={styles.weekendSchedule}>
            <ThemedText style={[styles.weekendRow, { color: colors.textSecondary }]}>
              Fri {nextRound.weekendDates.fri} · Practice + Qualifying
            </ThemedText>
            <ThemedText style={[styles.weekendRow, { color: colors.textSecondary }]}>
              Sat {nextRound.weekendDates.sat} · Wildcard Heats + Finals
            </ThemedText>
            <ThemedText style={[styles.weekendRow, { color: colors.textSecondary }]}>
              Sun {nextRound.weekendDates.sun} · K-1 Grand Prix
            </ThemedText>
          </View>

          {/* Defending winner */}
          {nextRound.defendingWinner && (
            <Pressable
              style={styles.defendingRow}
              onPress={() =>
                openDriverCard({ name: nextRound.defendingWinner!, number: '', team: '' })
              }
            >
              <ThemedText style={[styles.defendingLabel, { color: colors.textSecondary }]}>
                Defending Winner
              </ThemedText>
              <ThemedText style={[styles.defendingName, { color: accent }]}>
                {nextRound.defendingWinner}
              </ThemedText>
            </Pressable>
          )}
        </View>
      )}

      {/* ─── Commerce Row ────────────────────────────────────────── */}
      <View style={styles.commerceRow}>
        {COMP_COMMERCE.map((card) => (
          <Pressable
            key={card.id}
            style={[styles.commerceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.commerceIconCircle, { backgroundColor: card.color + '22' }]}>
              <IconSymbol name={card.icon as any} size={20} color={card.color} />
            </View>
            <ThemedText style={[styles.commerceTitle, { color: colors.text }]}>{card.title}</ThemedText>
          </Pressable>
        ))}
      </View>

      {/* ─── Quick Standings ─────────────────────────────────────── */}
      <ThemedText style={[styles.sectionHeader, { color: accent }]}>DRIVER STANDINGS</ThemedText>
      <View style={[styles.standingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {topDrivers.map((d, i) => (
          <View
            key={d.position}
            style={[
              styles.standingsRow,
              i < topDrivers.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
          >
            <ThemedText style={[styles.standingsPos, { color: i === 0 ? accent : colors.textSecondary }]}>
              {d.position}
            </ThemedText>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.standingsName, { color: i === 0 ? accent : colors.text, fontWeight: i === 0 ? '700' : '400' }]}>
                {d.name}
              </ThemedText>
              <ThemedText style={[styles.standingsTeam, { color: colors.textSecondary }]}>{d.team}</ThemedText>
            </View>
            <ThemedText style={[styles.standingsPoints, { color: colors.text }]}>{d.points} pts</ThemedText>
            <DeltaIndicator delta={d.delta} colors={colors} />
          </View>
        ))}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function DeltaIndicator({ delta, colors }: { delta: number; colors: typeof Colors.light }) {
  if (delta > 0) {
    return <ThemedText style={[styles.delta, { color: '#22C55E' }]}>{'\u25B2'}{delta}</ThemedText>;
  }
  if (delta < 0) {
    return <ThemedText style={[styles.delta, { color: '#EF4444' }]}>{'\u25BC'}{Math.abs(delta)}</ThemedText>;
  }
  return <ThemedText style={[styles.delta, { color: colors.textTertiary }]}>{'\u2014'}</ThemedText>;
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  // Hero
  heroWrapper: { borderRadius: 16, overflow: 'hidden', marginBottom: 14 },
  heroGradient: {
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  liveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  heroSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },

  // Next Event
  nextEventCard: { borderRadius: 12, borderWidth: 2, padding: 14, marginBottom: 14 },
  nextEventHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  roundBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBadgeText: { color: '#000', fontSize: 12, fontWeight: '800' },
  nextLabel: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  nextLabelText: { fontSize: 10, fontWeight: '700' },
  nextEventName: { fontSize: 17, fontWeight: '700' },
  nextEventMeta: { fontSize: 12, marginTop: 3 },
  weekendSchedule: { marginTop: 10, gap: 4 },
  weekendRow: { fontSize: 11 },
  defendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  defendingLabel: { fontSize: 11 },
  defendingName: { fontSize: 12, fontWeight: '700' },

  // Commerce
  commerceRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  commerceCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 8,
  },
  commerceIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commerceTitle: { fontSize: 12, fontWeight: '600' },

  // Standings
  sectionHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  standingsCard: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  standingsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  standingsPos: { width: 24, fontSize: 14, fontWeight: '700' },
  standingsName: { fontSize: 14 },
  standingsTeam: { fontSize: 10, marginTop: 1 },
  standingsPoints: { fontSize: 13, fontWeight: '700', marginRight: 4 },
  delta: { fontSize: 10, fontWeight: '600', width: 28, textAlign: 'right' },
});
