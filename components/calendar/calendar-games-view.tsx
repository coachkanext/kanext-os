/**
 * Calendar Games View
 * Upcoming and Completed sections from KaNeXT_GAMES.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { KaNeXT_GAMES, parseGameDate } from '@/data/fmu';
import { openTeamCard } from '@/utils/global-entity-sheets';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function CalendarGamesView({ colors, accent }: Props) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const upcoming = KaNeXT_GAMES.filter((g) => g.status === 'upcoming' || g.status === 'live')
    .sort((a, b) => {
      const da = parseGameDate(a.date)?.getTime() ?? 0;
      const db = parseGameDate(b.date)?.getTime() ?? 0;
      return da - db;
    });

  const completed = KaNeXT_GAMES.filter((g) => g.status === 'final')
    .sort((a, b) => {
      const da = parseGameDate(a.date)?.getTime() ?? 0;
      const db = parseGameDate(b.date)?.getTime() ?? 0;
      return db - da;
    });

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* UPCOMING */}
      <ThemedText style={[styles.sectionHeader, { color: accent }]}>UPCOMING</ThemedText>
      {upcoming.length === 0 && (
        <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>No upcoming games</ThemedText>
      )}
      {upcoming.map((game) => (
        <Pressable
          key={game.id}
          style={[styles.gameCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openTeamCard({ name: game.opponent, conference: '', record: game.opponentRecord ?? '', kr: game.opponentKR ?? 0 });
          }}
        >
          <View style={styles.gameCardTop}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.opponentName, { color: colors.text }]}>
                {game.location === 'Home' ? 'vs' : '@'} {game.opponent}
              </ThemedText>
              <ThemedText style={[styles.gameMeta, { color: colors.textSecondary }]}>
                {game.date} · {game.gameTime ?? 'TBD'} · {game.venue ?? game.location}
              </ThemedText>
            </View>
            <View style={styles.badgeRow}>
              <View style={[styles.locationBadge, { backgroundColor: game.location === 'Home' ? '#22c55e22' : '#3b82f622' }]}>
                <ThemedText style={[styles.locationBadgeText, { color: game.location === 'Home' ? '#22c55e' : '#3b82f6' }]}>
                  {game.location === 'Home' ? 'HOME' : 'AWAY'}
                </ThemedText>
              </View>
              <View style={[styles.confBadge, { backgroundColor: game.gameType === 'CONF' ? accent + '22' : '#ffffff08' }]}>
                <ThemedText style={[styles.confBadgeText, { color: game.gameType === 'CONF' ? accent : colors.textSecondary }]}>
                  {game.gameType === 'CONF' ? 'CONF' : 'NON-CONF'}
                </ThemedText>
              </View>
            </View>
          </View>
          {game.status === 'live' && (
            <View style={styles.liveBadge}>
              <ThemedText style={styles.liveText}>LIVE {game.clock}</ThemedText>
            </View>
          )}
        </Pressable>
      ))}

      {/* COMPLETED */}
      <ThemedText style={[styles.sectionHeader, { color: accent, marginTop: 20 }]}>COMPLETED</ThemedText>
      {completed.map((game) => {
        const scoreStr = game.score ?? '';
        const isWin = scoreStr.startsWith('W');
        return (
          <Pressable
            key={game.id}
            style={[styles.gameCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openTeamCard({ name: game.opponent, conference: '', record: game.opponentRecord ?? '', kr: game.opponentKR ?? 0 });
            }}
          >
            <View style={styles.gameCardTop}>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.opponentName, { color: colors.text }]}>
                  {game.location === 'Home' ? 'vs' : '@'} {game.opponent}
                </ThemedText>
                <ThemedText style={[styles.gameMeta, { color: colors.textSecondary }]}>
                  {game.date}
                </ThemedText>
              </View>
              <View style={[styles.resultBadge, { backgroundColor: isWin ? '#22c55e22' : '#ef444422' }]}>
                <ThemedText style={[styles.resultText, { color: isWin ? '#22c55e' : '#ef4444' }]}>
                  {scoreStr}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      })}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  sectionHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  emptyText: { fontSize: 13, marginBottom: 16 },
  gameCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  gameCardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  opponentName: { fontSize: 15, fontWeight: '700' },
  gameMeta: { fontSize: 11, marginTop: 3 },
  badgeRow: { flexDirection: 'row', gap: 6, marginLeft: 8 },
  locationBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  locationBadgeText: { fontSize: 10, fontWeight: '700' },
  confBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  confBadgeText: { fontSize: 10, fontWeight: '600' },
  resultBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  resultText: { fontSize: 13, fontWeight: '700' },
  liveBadge: { marginTop: 8, backgroundColor: '#ef4444', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
