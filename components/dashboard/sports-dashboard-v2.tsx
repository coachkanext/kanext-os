/**
 * Sports Dashboard V2 — Full Coach HQ Dashboard
 * Blocks: Video Strip, Team Truth, Today+Next, Command Center,
 * Conference Pulse, Game Ops Readiness, Work Queue.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, FlatList } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { HomeHeroVideoCard } from '@/components/dashboard/home-hero-video-card';

import {
  VIDEO_STRIP_CARDS,
  TEAM_TRUTH_HEADER,
  TODAY_SCHEDULE,
  MUST_DO_TASKS,
  NEXT_GAME_CARD,
  COMMAND_TILES,
  CONFERENCE_PULSE_STANDINGS,
  GAME_OPS_READINESS,
  MY_WORK_QUEUE,
  getVideoTagColor,
  getWorkItemIcon,
  getWorkPriorityColor,
  type VideoStripCard,
  type CommandTile,
  type WorkQueueItem,
} from '@/data/mock-dashboard-v2';

interface Props {
  onTabJump?: (tabIndex: number) => void;
}

export function SportsDashboardV2({ onTabJump }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 0. HERO VIDEO */}
      <HomeHeroVideoCard role="R1" />

      {/* 1. VIDEO STRIP */}
      <VideoStrip colors={colors} />

      {/* 2. TEAM TRUTH HEADER */}
      <TeamTruth colors={colors} accent={accent} />

      {/* 3. TODAY + NEXT */}
      <TodayNext colors={colors} accent={accent} />

      {/* 4. COMMAND CENTER */}
      <CommandCenter colors={colors} accent={accent} onTabJump={onTabJump} />

      {/* 5. CONFERENCE PULSE */}
      <ConferencePulse colors={colors} accent={accent} />

      {/* 6. GAME OPS READINESS */}
      {GAME_OPS_READINESS.length > 0 && <GameOpsReadiness colors={colors} accent={accent} />}

      {/* 7. MY WORK QUEUE */}
      <WorkQueue colors={colors} accent={accent} />

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// =============================================================================
// VIDEO STRIP
// =============================================================================

function VideoStrip({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={styles.section}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Film & Media</ThemedText>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={VIDEO_STRIP_CARDS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 4 }}
        renderItem={({ item }) => <VideoCard item={item} colors={colors} />}
      />
    </View>
  );
}

function VideoCard({ item, colors }: { item: VideoStripCard; colors: typeof Colors.light }) {
  return (
    <Pressable style={[styles.videoCard, { backgroundColor: item.thumbnailColor }]}>
      <View style={[styles.videoTag, { backgroundColor: getVideoTagColor(item.tag) }]}>
        <ThemedText style={styles.videoTagText}>{item.tag}</ThemedText>
      </View>
      <View style={styles.videoCardBottom}>
        <ThemedText style={styles.videoTitle} numberOfLines={2}>{item.title}</ThemedText>
        <View style={styles.videoMeta}>
          <ThemedText style={styles.videoMetaText}>{item.duration}</ThemedText>
          <ThemedText style={styles.videoMetaText}> · {item.timestamp}</ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

// =============================================================================
// TEAM TRUTH HEADER
// =============================================================================

function TeamTruth({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  const h = TEAM_TRUTH_HEADER;
  return (
    <View style={[styles.truthCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.truthRow}>
        <ThemedText style={[styles.truthName, { color: colors.text }]}>{h.programName}</ThemedText>
        <View style={[styles.krBadge, { backgroundColor: accent }]}>
          <ThemedText style={styles.krText}>KR {h.teamKR}</ThemedText>
        </View>
      </View>
      <ThemedText style={[styles.truthSub, { color: colors.textSecondary }]}>
        {h.level} · {h.conference} · {h.season}
      </ThemedText>
      <View style={styles.truthStats}>
        <StatChip label="Record" value={h.record} colors={colors} />
        <StatChip label="Conf" value={h.confRecord} colors={colors} />
        <StatChip label="Streak" value={h.streak} colors={colors} />
        <StatChip label="Avail" value={`${h.availability.available}/${h.availability.available + h.availability.injured + h.availability.out}`} colors={colors} />
      </View>
      {h.nextGameSummary && (
        <ThemedText style={[styles.truthNext, { color: accent }]}>{h.nextGameSummary}</ThemedText>
      )}
    </View>
  );
}

function StatChip({ label, value, colors }: { label: string; value: string; colors: typeof Colors.light }) {
  return (
    <View style={[styles.statChip, { backgroundColor: colors.background }]}>
      <ThemedText style={[styles.statChipLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
      <ThemedText style={[styles.statChipValue, { color: colors.text }]}>{value}</ThemedText>
    </View>
  );
}

// =============================================================================
// TODAY + NEXT
// =============================================================================

function TodayNext({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <View style={styles.section}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Today + Next</ThemedText>

      {/* Today's Schedule */}
      <View style={[styles.todayCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {TODAY_SCHEDULE.map((item) => (
          <View key={item.id} style={styles.todayRow}>
            <ThemedText style={[styles.todayTime, { color: accent }]}>{item.time}</ThemedText>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.todayTitle, { color: colors.text }]}>{item.type}</ThemedText>
              <ThemedText style={[styles.todayLocation, { color: colors.textSecondary }]}>{item.location}</ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Must-Do Tasks */}
      <View style={[styles.mustDoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.mustDoTitle, { color: colors.text }]}>Must-Do</ThemedText>
        {MUST_DO_TASKS.map((task) => (
          <View key={task.id} style={styles.mustDoRow}>
            <IconSymbol name={task.done ? 'checkmark.circle.fill' : 'circle'} size={18} color={task.done ? '#22c55e' : colors.textSecondary} />
            <ThemedText style={[styles.mustDoText, { color: colors.text, textDecorationLine: task.done ? 'line-through' : 'none' }]}>{task.title}</ThemedText>
          </View>
        ))}
      </View>

      {/* Next Game Card */}
      {NEXT_GAME_CARD && (
        <View style={[styles.nextGameCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.nextGameOpponent, { color: colors.text }]}>
            {NEXT_GAME_CARD.location === 'Home' ? 'vs' : '@'} {NEXT_GAME_CARD.opponent}
          </ThemedText>
          <ThemedText style={[styles.nextGameDate, { color: colors.textSecondary }]}>
            {NEXT_GAME_CARD.date} · {NEXT_GAME_CARD.countdownDays}d away
          </ThemedText>
          <View style={styles.statusChips}>
            {NEXT_GAME_CARD.statusChips.map((chip) => (
              <View key={chip.label} style={[styles.statusChip, { backgroundColor: chip.status === 'done' ? '#22c55e22' : chip.status === 'in-progress' ? '#f59e0b22' : '#9C979022' }]}>
                <ThemedText style={[styles.statusChipText, { color: chip.status === 'done' ? '#22c55e' : chip.status === 'in-progress' ? '#f59e0b' : '#9C9790' }]}>{chip.label}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// COMMAND CENTER
// =============================================================================

function CommandCenter({ colors, accent, onTabJump }: { colors: typeof Colors.light; accent: string; onTabJump?: (idx: number) => void }) {
  return (
    <View style={styles.section}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Command Center</ThemedText>
      <View style={styles.tileGrid}>
        {COMMAND_TILES.map((tile) => (
          <Pressable
            key={tile.id}
            style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => tile.targetTab != null && onTabJump?.(tile.targetTab)}
          >
            <IconSymbol name={tile.icon as any} size={22} color={accent} />
            <ThemedText style={[styles.tileLabel, { color: colors.text }]}>{tile.label}</ThemedText>
            <ThemedText style={[styles.tileCount, { color: colors.text }]}>{tile.count}</ThemedText>
            <View style={[styles.tileChip, { backgroundColor: tile.statusColor === 'green' ? '#22c55e22' : tile.statusColor === 'yellow' ? '#f59e0b22' : tile.statusColor === 'red' ? '#ef444422' : '#9C979022' }]}>
              <ThemedText style={[styles.tileChipText, { color: tile.statusColor === 'green' ? '#22c55e' : tile.statusColor === 'yellow' ? '#f59e0b' : tile.statusColor === 'red' ? '#ef4444' : '#9C9790' }]}>{tile.statusChip}</ThemedText>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// =============================================================================
// CONFERENCE PULSE
// =============================================================================

function ConferencePulse({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <View style={styles.section}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Conference Pulse</ThemedText>
      <View style={[styles.standingsTable, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.standingsHeader}>
          <ThemedText style={[styles.standingsHeaderText, { color: colors.textSecondary, flex: 0.15 }]}>#</ThemedText>
          <ThemedText style={[styles.standingsHeaderText, { color: colors.textSecondary, flex: 0.45 }]}>Team</ThemedText>
          <ThemedText style={[styles.standingsHeaderText, { color: colors.textSecondary, flex: 0.2, textAlign: 'center' }]}>Conf</ThemedText>
          <ThemedText style={[styles.standingsHeaderText, { color: colors.textSecondary, flex: 0.2, textAlign: 'center' }]}>Streak</ThemedText>
        </View>
        {CONFERENCE_PULSE_STANDINGS.slice(0, 6).map((row) => (
          <View key={row.team} style={[styles.standingsRow, row.isUs && { backgroundColor: accent + '18' }]}>
            <ThemedText style={[styles.standingsCell, { color: colors.text, flex: 0.15 }]}>{row.rank}</ThemedText>
            <ThemedText style={[styles.standingsCell, { color: row.isUs ? accent : colors.text, flex: 0.45, fontWeight: row.isUs ? '700' : '400' }]}>{row.team}</ThemedText>
            <ThemedText style={[styles.standingsCell, { color: colors.text, flex: 0.2, textAlign: 'center' }]}>{row.confRecord}</ThemedText>
            <ThemedText style={[styles.standingsCell, { color: colors.text, flex: 0.2, textAlign: 'center' }]}>{row.streak}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

// =============================================================================
// GAME OPS READINESS
// =============================================================================

function GameOpsReadiness({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <View style={styles.section}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Game Ops Readiness</ThemedText>
      <View style={styles.opsChips}>
        {GAME_OPS_READINESS.map((chip) => (
          <View key={chip.id} style={[styles.opsChip, { backgroundColor: chip.ready ? '#22c55e22' : '#f59e0b22', borderColor: chip.ready ? '#22c55e44' : '#f59e0b44' }]}>
            <IconSymbol name={chip.ready ? 'checkmark.circle.fill' : 'clock.fill'} size={14} color={chip.ready ? '#22c55e' : '#f59e0b'} />
            <ThemedText style={[styles.opsChipText, { color: chip.ready ? '#22c55e' : '#f59e0b' }]}>{chip.label}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

// =============================================================================
// WORK QUEUE
// =============================================================================

function WorkQueue({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? MY_WORK_QUEUE : MY_WORK_QUEUE.slice(0, 5);

  return (
    <View style={styles.section}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>My Work Queue</ThemedText>
      {visibleItems.map((item) => (
        <WorkRow key={item.id} item={item} colors={colors} />
      ))}
      {MY_WORK_QUEUE.length > 5 && (
        <Pressable onPress={() => setExpanded(!expanded)} style={styles.expandButton}>
          <ThemedText style={[styles.expandText, { color: accent }]}>
            {expanded ? 'Show Less' : `Show All (${MY_WORK_QUEUE.length})`}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

function WorkRow({ item, colors }: { item: WorkQueueItem; colors: typeof Colors.light }) {
  return (
    <View style={[styles.workRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <IconSymbol name={getWorkItemIcon(item.type) as any} size={18} color={getWorkPriorityColor(item.priority)} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <ThemedText style={[styles.workTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</ThemedText>
        <ThemedText style={[styles.workMeta, { color: colors.textSecondary }]}>
          {item.dueDate} · {item.owner}
        </ThemedText>
      </View>
      <View style={[styles.priorityDot, { backgroundColor: getWorkPriorityColor(item.priority) }]} />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingTop: 8 },
  section: { marginBottom: 20, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Video Strip
  videoCard: { width: 180, height: 120, borderRadius: 12, marginRight: 10, overflow: 'hidden', justifyContent: 'flex-end' },
  videoTag: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  videoTagText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  videoCardBottom: { padding: 8, backgroundColor: 'rgba(0,0,0,0.55)' },
  videoTitle: { color: '#fff', fontSize: 12, fontWeight: '600' },
  videoMeta: { flexDirection: 'row', marginTop: 2 },
  videoMetaText: { color: 'rgba(255,255,255,0.7)', fontSize: 10 },

  // Team Truth
  truthCard: { marginHorizontal: 16, marginBottom: 20, padding: 16, borderRadius: 14, borderWidth: 1 },
  truthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  truthName: { fontSize: 18, fontWeight: '800' },
  krBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  krText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  truthSub: { fontSize: 12, marginTop: 4 },
  truthStats: { flexDirection: 'row', gap: 8, marginTop: 12 },
  truthNext: { fontSize: 13, fontWeight: '600', marginTop: 12 },

  statChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  statChipLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  statChipValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },

  // Today + Next
  todayCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  todayRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 12 },
  todayTime: { fontSize: 12, fontWeight: '700', width: 70 },
  todayTitle: { fontSize: 14, fontWeight: '600' },
  todayLocation: { fontSize: 11, marginTop: 1 },

  mustDoCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  mustDoTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  mustDoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  mustDoText: { fontSize: 13, flex: 1 },

  nextGameCard: { padding: 14, borderRadius: 12, borderWidth: 1 },
  nextGameOpponent: { fontSize: 16, fontWeight: '700' },
  nextGameDate: { fontSize: 12, marginTop: 4 },
  statusChips: { flexDirection: 'row', gap: 8, marginTop: 10 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusChipText: { fontSize: 11, fontWeight: '600' },

  // Command Center
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '47%', padding: 14, borderRadius: 12, borderWidth: 1, flexGrow: 1, flexBasis: '47%' },
  tileLabel: { fontSize: 12, fontWeight: '600', marginTop: 6 },
  tileCount: { fontSize: 22, fontWeight: '800', marginTop: 2 },
  tileChip: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 6 },
  tileChipText: { fontSize: 10, fontWeight: '600' },

  // Conference Pulse
  standingsTable: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  standingsHeader: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#2F3336' },
  standingsHeaderText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  standingsRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8 },
  standingsCell: { fontSize: 13 },

  // Game Ops
  opsChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opsChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  opsChipText: { fontSize: 12, fontWeight: '600' },

  // Work Queue
  workRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  workTitle: { fontSize: 13, fontWeight: '600' },
  workMeta: { fontSize: 11, marginTop: 2 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  expandButton: { alignItems: 'center', paddingVertical: 10 },
  expandText: { fontSize: 13, fontWeight: '600' },
});
