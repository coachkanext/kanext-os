/**
 * Sports Calendar V2 — 4 pill tabs: Agenda, Schedule, Standings, News
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, FlatList } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import {
  AGENDA_ITEMS,
  getAgendaTypeColor,
  getScheduleGames,
  getStandings,
  NEWS_POSTS,
  getNewsBadgeColor,
  type AgendaItem,
  type NewsPost,
} from '@/data/mock-calendar-v2';

const PILLS = ['Agenda', 'Schedule', 'Standings', 'News'] as const;
type PillTab = (typeof PILLS)[number];

interface Props {
  colors: typeof Colors.light;
}

export function SportsCalendarV2({ colors: propColors }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = propColors ?? Colors[colorScheme];
  const accent = ModeColors.sports.primary;
  const [activeTab, setActiveTab] = useState<PillTab>('Agenda');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Pill Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillBar}>
        {PILLS.map((pill) => (
          <Pressable
            key={pill}
            style={[styles.pill, activeTab === pill && { backgroundColor: accent }]}
            onPress={() => setActiveTab(pill)}
          >
            <ThemedText style={[styles.pillText, { color: activeTab === pill ? '#fff' : colors.textSecondary }]}>
              {pill}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* Content */}
      {activeTab === 'Agenda' && <AgendaView colors={colors} accent={accent} />}
      {activeTab === 'Schedule' && <ScheduleView colors={colors} accent={accent} />}
      {activeTab === 'Standings' && <StandingsView colors={colors} accent={accent} />}
      {activeTab === 'News' && <NewsView colors={colors} accent={accent} />}
    </View>
  );
}

// =============================================================================
// AGENDA VIEW
// =============================================================================

function AgendaView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  let lastDay = '';
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {AGENDA_ITEMS.map((item) => {
        const showDay = item.dayLabel !== lastDay;
        lastDay = item.dayLabel;
        return (
          <View key={item.id}>
            {showDay && (
              <ThemedText style={[styles.dayHeader, { color: accent }]}>{item.dayLabel}</ThemedText>
            )}
            <View style={[styles.agendaRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.agendaTypeDot, { backgroundColor: getAgendaTypeColor(item.type) }]} />
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.agendaTitle, { color: colors.text }]}>{item.title}</ThemedText>
                <ThemedText style={[styles.agendaMeta, { color: colors.textSecondary }]}>
                  {item.time} \u00b7 {item.location}
                </ThemedText>
              </View>
              <View style={[styles.agendaTypeBadge, { backgroundColor: getAgendaTypeColor(item.type) + '22' }]}>
                <ThemedText style={[styles.agendaTypeText, { color: getAgendaTypeColor(item.type) }]}>{item.type}</ThemedText>
              </View>
            </View>
          </View>
        );
      })}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// =============================================================================
// SCHEDULE VIEW
// =============================================================================

function ScheduleView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  const games = getScheduleGames();
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {games.map((game) => (
        <View key={game.id} style={[styles.scheduleRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.scheduleOpponent, { color: colors.text }]}>
              {game.location === 'Home' ? 'vs' : '@'} {game.opponent}
            </ThemedText>
            <ThemedText style={[styles.scheduleMeta, { color: colors.textSecondary }]}>
              {game.date} \u00b7 {game.gameType}
            </ThemedText>
          </View>
          {game.status === 'final' && game.result && (
            <View style={[styles.resultBadge, { backgroundColor: game.result === 'W' ? '#22c55e22' : '#ef444422' }]}>
              <ThemedText style={[styles.resultText, { color: game.result === 'W' ? '#22c55e' : '#ef4444' }]}>
                {game.result} {game.score}
              </ThemedText>
            </View>
          )}
          {game.status === 'upcoming' && (
            <ThemedText style={[styles.upcomingText, { color: accent }]}>Upcoming</ThemedText>
          )}
          {game.status === 'live' && (
            <View style={[styles.liveBadge, { backgroundColor: '#ef4444' }]}>
              <ThemedText style={styles.liveText}>LIVE</ThemedText>
            </View>
          )}
        </View>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// =============================================================================
// STANDINGS VIEW
// =============================================================================

function StandingsView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  const standings = getStandings();
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.standingsTable, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.standingsHeader}>
          <ThemedText style={[styles.shText, { flex: 0.1, color: colors.textSecondary }]}>#</ThemedText>
          <ThemedText style={[styles.shText, { flex: 0.4, color: colors.textSecondary }]}>Team</ThemedText>
          <ThemedText style={[styles.shText, { flex: 0.15, textAlign: 'center', color: colors.textSecondary }]}>Conf</ThemedText>
          <ThemedText style={[styles.shText, { flex: 0.2, textAlign: 'center', color: colors.textSecondary }]}>Overall</ThemedText>
          <ThemedText style={[styles.shText, { flex: 0.15, textAlign: 'center', color: colors.textSecondary }]}>Strk</ThemedText>
        </View>
        {standings.map((row) => (
          <View key={row.team} style={[styles.standingsRow, row.isUs && { backgroundColor: accent + '18' }]}>
            <ThemedText style={[styles.srText, { flex: 0.1, color: colors.text }]}>{row.rank}</ThemedText>
            <ThemedText style={[styles.srText, { flex: 0.4, color: row.isUs ? accent : colors.text, fontWeight: row.isUs ? '700' : '400' }]}>{row.team}</ThemedText>
            <ThemedText style={[styles.srText, { flex: 0.15, textAlign: 'center', color: colors.text }]}>{row.confW}-{row.confL}</ThemedText>
            <ThemedText style={[styles.srText, { flex: 0.2, textAlign: 'center', color: colors.text }]}>{row.overallW}-{row.overallL}</ThemedText>
            <ThemedText style={[styles.srText, { flex: 0.15, textAlign: 'center', color: colors.text }]}>{row.streak}</ThemedText>
          </View>
        ))}
      </View>
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// =============================================================================
// NEWS VIEW
// =============================================================================

function NewsView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {NEWS_POSTS.map((post) => (
        <View key={post.id} style={[styles.newsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {post.badge !== 'none' && (
            <View style={[styles.newsBadge, { backgroundColor: getNewsBadgeColor(post.badge) + '22' }]}>
              <ThemedText style={[styles.newsBadgeText, { color: getNewsBadgeColor(post.badge) }]}>
                {post.badge === 'action-required' ? 'Action Required' : post.badge === 'alert' ? 'Alert' : 'Info'}
              </ThemedText>
            </View>
          )}
          <ThemedText style={[styles.newsTitle, { color: colors.text }]}>{post.title}</ThemedText>
          <ThemedText style={[styles.newsSummary, { color: colors.textSecondary }]} numberOfLines={2}>{post.summary}</ThemedText>
          <ThemedText style={[styles.newsMeta, { color: colors.textSecondary }]}>
            {post.source} \u00b7 {post.timestamp}
          </ThemedText>
        </View>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  pillBar: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
  pillText: { fontSize: 13, fontWeight: '600' },

  // Agenda
  dayHeader: { fontSize: 14, fontWeight: '700', marginTop: 16, marginBottom: 6, textTransform: 'uppercase' },
  agendaRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6, gap: 10 },
  agendaTypeDot: { width: 8, height: 8, borderRadius: 4 },
  agendaTitle: { fontSize: 14, fontWeight: '600' },
  agendaMeta: { fontSize: 11, marginTop: 2 },
  agendaTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  agendaTypeText: { fontSize: 10, fontWeight: '600' },

  // Schedule
  scheduleRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  scheduleOpponent: { fontSize: 14, fontWeight: '600' },
  scheduleMeta: { fontSize: 11, marginTop: 2 },
  resultBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  resultText: { fontSize: 12, fontWeight: '600' },
  upcomingText: { fontSize: 12, fontWeight: '600' },
  liveBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  // Standings
  standingsTable: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  standingsHeader: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  shText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  standingsRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10 },
  srText: { fontSize: 13 },

  // News
  newsRow: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  newsBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginBottom: 6 },
  newsBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  newsTitle: { fontSize: 15, fontWeight: '700' },
  newsSummary: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  newsMeta: { fontSize: 10, marginTop: 6 },
});
