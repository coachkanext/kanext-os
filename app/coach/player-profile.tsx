/**
 * Player Profile — Global player page.
 * Shows identity, quick actions, career timeline, stats, media links, recruiting context.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { PLAYER_POOL } from '@/data/playerPool';
import { PLAYER_SEASONS } from '@/data/playerSeasons';
import { RECRUITING_BOARD } from '@/data/recruitingBoard';
import { EVAL_SNAPSHOTS } from '@/data/evalSnapshots';
import { TabFooter } from '@/components/tab-footer';

const STATUS_COLORS: Record<string, string> = {
  Watching: '#6e6e6e',
  Contacted: '#d4d4d4',
  Offered: '#ffffff',
  Committed: '#f5f5f5',
  Archived: '#555555',
};

export default function PlayerProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const player = PLAYER_POOL.find((p) => p.id === id);
  const seasons = PLAYER_SEASONS.filter((s) => s.playerId === id);
  const boardEntry = RECRUITING_BOARD.find((e) => e.playerId === id);
  const evals = EVAL_SNAPSHOTS.filter((e) => e.playerId === id);

  if (!player) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top, backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
          <View style={styles.headerContent}>
            <Pressable style={styles.backButton} onPress={() => router.navigate({ pathname: '/(tabs)/index', params: { hubTab: '2' } } as any)}>
              <IconSymbol name="chevron.left" size={20} color={colors.text} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Player Profile</Text>
            <View style={styles.headerSpacer} />
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={{ color: colors.textTertiary, fontSize: 16 }}>Player not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
        <View style={styles.headerContent}>
          <Pressable
            style={({ pressed }) => [styles.backButton, { backgroundColor: pressed ? colors.backgroundSecondary : 'transparent' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.navigate({ pathname: '/(tabs)/index', params: { hubTab: '2' } } as any);
            }}
          >
            <IconSymbol name="chevron.left" size={20} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Player Profile</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1) Identity Header */}
        <View style={[styles.identityCard, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={[styles.playerName, { color: colors.text }]}>
            {player.firstName} {player.lastName}
          </Text>
          <Text style={[styles.playerMeta, { color: colors.textSecondary }]}>
            {player.position} · {player.height}
            {player.weight ? ` · ${player.weight} lbs` : ''}
            {' · Class '}{player.classYear}
          </Text>
          <View style={[styles.schoolBadge, { backgroundColor: colors.backgroundTertiary }]}>
            <Text style={[styles.schoolText, { color: colors.text }]}>{player.currentSchool}</Text>
            <Text style={[styles.levelText, { color: colors.textTertiary }]}>{player.level}</Text>
          </View>
          <Text style={[styles.statLine, { color: colors.textSecondary }]}>{player.keyStatLine}</Text>
          <View style={styles.locationRow}>
            <IconSymbol name="mappin" size={12} color={colors.textTertiary} />
            <Text style={[styles.locationText, { color: colors.textTertiary }]}>{player.state}</Text>
            {player.hasFilm && (
              <View style={[styles.filmBadge, { backgroundColor: '#f5f5f520' }]}>
                <Text style={styles.filmBadgeText}>Film Available</Text>
              </View>
            )}
          </View>
        </View>

        {/* 2) Quick Actions */}
        <View style={styles.actionsRow}>
          {!boardEntry ? (
            <Pressable style={[styles.actionBtn, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.actionBtnText, { color: colors.text }]}>Add to Board</Text>
            </Pressable>
          ) : (
            <View style={[styles.actionBtn, { backgroundColor: STATUS_COLORS[boardEntry.status] + '20' }]}>
              <Text style={[styles.actionBtnText, { color: STATUS_COLORS[boardEntry.status] }]}>
                On Board: {boardEntry.status}
              </Text>
            </View>
          )}
          <Pressable style={[styles.actionBtn, { backgroundColor: '#ffffff20' }]}>
            <Text style={[styles.actionBtnText, { color: '#ffffff' }]}>Open in Nexus</Text>
          </Pressable>
          {evals.length > 0 && (
            <Pressable style={[styles.actionBtn, { backgroundColor: '#d4d4d420' }]}>
              <Text style={[styles.actionBtnText, { color: '#d4d4d4' }]}>{evals.length} Evaluation{evals.length > 1 ? 's' : ''}</Text>
            </Pressable>
          )}
        </View>

        {/* 3) Career Timeline */}
        {seasons.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>CAREER TIMELINE</Text>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              {seasons.map((s, idx) => (
                <View key={`${s.season}-${s.school}`}>
                  {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
                  <View style={styles.timelineRow}>
                    <Text style={[styles.timelineSeason, { color: colors.text }]}>{s.season}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.timelineSchool, { color: colors.text }]}>{s.school}</Text>
                      <Text style={[styles.timelineLevel, { color: colors.textTertiary }]}>{s.level} · {s.gp} games</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 4) Season Stats */}
        {seasons.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SEASON STATS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                {/* Header */}
                <View style={[styles.statsHeaderRow, { borderBottomColor: colors.divider }]}>
                  {['SEASON', 'GP', 'MPG', 'PPG', 'RPG', 'APG', 'SPG', 'BPG', 'FG%', '3P%', 'FT%'].map((col) => (
                    <Text key={col} style={[styles.statsHeaderCell, { color: colors.textSecondary }]}>{col}</Text>
                  ))}
                </View>
                {/* Rows */}
                {seasons.map((s, idx) => (
                  <View key={s.season} style={[styles.statsRow, idx % 2 === 1 && { backgroundColor: colors.backgroundSecondary + '60' }]}>
                    <Text style={[styles.statsCell, styles.statsCellSeason, { color: colors.text }]}>{s.season}</Text>
                    <Text style={[styles.statsCell, { color: colors.text }]}>{s.gp}</Text>
                    <Text style={[styles.statsCell, { color: colors.text }]}>{s.mpg.toFixed(1)}</Text>
                    <Text style={[styles.statsCell, styles.statsCellHighlight, { color: colors.text }]}>{s.ppg.toFixed(1)}</Text>
                    <Text style={[styles.statsCell, { color: colors.text }]}>{s.rpg.toFixed(1)}</Text>
                    <Text style={[styles.statsCell, { color: colors.text }]}>{s.apg.toFixed(1)}</Text>
                    <Text style={[styles.statsCell, { color: colors.text }]}>{s.spg.toFixed(1)}</Text>
                    <Text style={[styles.statsCell, { color: colors.text }]}>{s.bpg.toFixed(1)}</Text>
                    <Text style={[styles.statsCell, { color: colors.textSecondary }]}>{s.fgPct.toFixed(1)}</Text>
                    <Text style={[styles.statsCell, { color: colors.textSecondary }]}>{s.threePct > 0 ? s.threePct.toFixed(1) : '—'}</Text>
                    <Text style={[styles.statsCell, { color: colors.textSecondary }]}>{s.ftPct.toFixed(1)}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* 5) Media Links */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>MEDIA & LINKS</Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {[
              { label: 'Game Film (Hudl)', icon: 'play.rectangle.fill' as const, color: '#EF4444' },
              { label: 'Highlights (YouTube)', icon: 'play.fill' as const, color: '#EF4444' },
              { label: 'School Bio', icon: 'person.fill' as const, color: '#ffffff' },
              { label: 'Social Media', icon: 'bubble.left.fill' as const, color: '#d4d4d4' },
            ].map((link, idx) => (
              <View key={link.label}>
                {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
                <Pressable style={styles.mediaRow}>
                  <IconSymbol name={link.icon} size={16} color={link.color} />
                  <Text style={[styles.mediaText, { color: colors.text }]}>{link.label}</Text>
                  <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* 6) Recruiting Context */}
        {boardEntry && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>RECRUITING STATUS</Text>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={styles.recruitingRow}>
                <Text style={[styles.recruitingLabel, { color: colors.textTertiary }]}>Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[boardEntry.status] + '20' }]}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: STATUS_COLORS[boardEntry.status] }}>
                    {boardEntry.status}
                  </Text>
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              <View style={styles.recruitingRow}>
                <Text style={[styles.recruitingLabel, { color: colors.textTertiary }]}>Priority</Text>
                <Text style={[styles.recruitingValue, { color: colors.text }]}>{boardEntry.priority}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              <View style={styles.recruitingRow}>
                <Text style={[styles.recruitingLabel, { color: colors.textTertiary }]}>Coach</Text>
                <Text style={[styles.recruitingValue, { color: colors.text }]}>{boardEntry.assignedCoach}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              <View style={styles.recruitingRow}>
                <Text style={[styles.recruitingLabel, { color: colors.textTertiary }]}>Next Step</Text>
                <Text style={[styles.recruitingValue, { color: colors.text }]} numberOfLines={1}>{boardEntry.nextStep || '—'}</Text>
              </View>
              {boardEntry.shortNotes ? (
                <>
                  <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                  <View style={{ padding: Spacing.md }}>
                    <Text style={[styles.recruitingLabel, { color: colors.textTertiary, marginBottom: 4 }]}>Notes</Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 19 }}>{boardEntry.shortNotes}</Text>
                  </View>
                </>
              ) : null}
            </View>
          </View>
        )}

        {/* Saved Evaluations */}
        {evals.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SAVED EVALUATIONS</Text>
            {evals.map((ev) => (
              <View key={ev.id} style={[styles.card, { backgroundColor: colors.backgroundSecondary, marginBottom: 8 }]}>
                <View style={{ padding: Spacing.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{ev.evaluator}</Text>
                    <Text style={{ fontSize: 12, color: colors.textTertiary }}>
                      {new Date(ev.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 19 }} numberOfLines={3}>
                    {ev.summary}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <TabFooter activeTab="Home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: StyleSheet.hairlineWidth },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  backButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: BorderRadius.md },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  headerSpacer: { width: 32 },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Identity
  identityCard: { borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  playerName: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  playerMeta: { fontSize: 14, marginBottom: 10 },
  schoolBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, gap: 8, marginBottom: 10 },
  schoolText: { fontSize: 14, fontWeight: '600' },
  levelText: { fontSize: 12 },
  statLine: { fontSize: 15, fontWeight: '500', marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 13 },
  filmBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginLeft: 8 },
  filmBadgeText: { fontSize: 11, fontWeight: '600', color: '#f5f5f5' },

  // Actions
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  actionBtnText: { fontSize: 13, fontWeight: '600' },

  // Sections
  section: { marginBottom: Spacing.lg },
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 },
  card: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth },

  // Timeline
  timelineRow: { flexDirection: 'row', padding: Spacing.md, gap: 12 },
  timelineSeason: { fontSize: 14, fontWeight: '600', width: 64 },
  timelineSchool: { fontSize: 14, fontWeight: '500' },
  timelineLevel: { fontSize: 12, marginTop: 2 },

  // Stats table
  statsHeaderRow: { flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 8, marginBottom: 4 },
  statsHeaderCell: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3, width: 52, textAlign: 'center' },
  statsRow: { flexDirection: 'row', paddingVertical: 10 },
  statsCell: { fontSize: 13, width: 52, textAlign: 'center' },
  statsCellSeason: { fontWeight: '600', width: 52 },
  statsCellHighlight: { fontWeight: '700' },

  // Media
  mediaRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: 10 },
  mediaText: { flex: 1, fontSize: 14, fontWeight: '500' },

  // Recruiting
  recruitingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md },
  recruitingLabel: { fontSize: 13 },
  recruitingValue: { fontSize: 14, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
});
