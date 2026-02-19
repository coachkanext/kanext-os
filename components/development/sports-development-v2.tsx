/**
 * Sports Development V2 — Full Development OS
 * Pill tabs: Overview, Weekly Plan, Players, Drills, Evidence, Transfer
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import {
  WEEKLY_NON_NEGOTIABLES,
  TEAM_PRIORITIES,
  POSITION_GROUPS,
  PLAYER_ALERTS,
  CURRENT_WEEKLY_PLAN,
  PLAYER_PLANS,
  DRILL_LIBRARY,
  EVIDENCE_QUEUE,
  TRANSFER_METRICS,
  PROGRESS_SNAPSHOT,
  type PlayerPlan,
  type DrillTemplate,
  type EvidenceItem,
  type TransferMetric,
} from '@/data/mock-development-v2';

const PILLS = ['Overview', 'Weekly Plan', 'Players', 'Drills', 'Evidence', 'Transfer'] as const;
type PillTab = (typeof PILLS)[number];

const PROGRESS_COLORS = { 'needs-work': '#EF4444', progressing: '#F59E0B', achieved: '#22C55E' };
const SESSION_COLORS: Record<string, string> = { practice: '#22C55E', lift: '#F59E0B', film: '#6AA9FF', individual: '#8B5CF6', rest: '#8F8F8F' };

export function SportsDevelopmentV2() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = ModeColors.sports.primary;
  const [activeTab, setActiveTab] = useState<PillTab>('Overview');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.pillBar}>
        {PILLS.map((pill) => (
          <Pressable key={pill} style={[styles.pill, activeTab === pill && { backgroundColor: accent }]} onPress={() => setActiveTab(pill)}>
            <ThemedText style={[styles.pillText, { color: activeTab === pill ? '#fff' : colors.textSecondary }]}>{pill}</ThemedText>
          </Pressable>
        ))}
      </View>

      {activeTab === 'Overview' && <OverviewView colors={colors} accent={accent} />}
      {activeTab === 'Weekly Plan' && <WeeklyPlanView colors={colors} accent={accent} />}
      {activeTab === 'Players' && <PlayersView colors={colors} accent={accent} />}
      {activeTab === 'Drills' && <DrillsView colors={colors} accent={accent} />}
      {activeTab === 'Evidence' && <EvidenceView colors={colors} accent={accent} />}
      {activeTab === 'Transfer' && <TransferView colors={colors} accent={accent} />}
    </View>
  );
}

function OverviewView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  const snap = PROGRESS_SNAPSHOT;
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Progress Snapshot */}
      <View style={[styles.snapCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.snapRow}>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={[styles.snapScore, { color: accent }]}>{snap.overallScore}</ThemedText>
            <ThemedText style={[styles.snapLabel, { color: colors.textSecondary }]}>Overall</ThemedText>
          </View>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={[styles.snapDelta, { color: '#22C55E' }]}>+{snap.deltaFromLastWeek}</ThemedText>
            <ThemedText style={[styles.snapLabel, { color: colors.textSecondary }]}>vs Last Week</ThemedText>
          </View>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={[styles.snapScore, { color: '#22C55E' }]}>{snap.achievedCount}</ThemedText>
            <ThemedText style={[styles.snapLabel, { color: colors.textSecondary }]}>Achieved</ThemedText>
          </View>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={[styles.snapScore, { color: '#F59E0B' }]}>{snap.progressingCount}</ThemedText>
            <ThemedText style={[styles.snapLabel, { color: colors.textSecondary }]}>Progressing</ThemedText>
          </View>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={[styles.snapScore, { color: '#EF4444' }]}>{snap.needsWorkCount}</ThemedText>
            <ThemedText style={[styles.snapLabel, { color: colors.textSecondary }]}>Needs Work</ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.snapImprover, { color: colors.textSecondary }]}>Top Improver: {snap.topImprover} (+{snap.topImproverDelta})</ThemedText>
      </View>

      {/* Player Alerts */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>PLAYER ALERTS</ThemedText>
      {PLAYER_ALERTS.map((alert) => {
        const alertColor = alert.type === 'regression' ? '#EF4444' : alert.type === 'injury' ? '#FF6B35' : alert.type === 'breakout' ? '#22C55E' : '#6AA9FF';
        return (
          <View key={alert.id} style={[styles.alertCard, { backgroundColor: colors.card, borderColor: alertColor + '44' }]}>
            <View style={styles.alertHeader}>
              <View style={[styles.alertBadge, { backgroundColor: alertColor + '22' }]}>
                <ThemedText style={[styles.alertType, { color: alertColor }]}>{alert.type}</ThemedText>
              </View>
              <ThemedText style={[styles.alertDate, { color: colors.textSecondary }]}>{alert.date}</ThemedText>
            </View>
            <ThemedText style={[styles.alertName, { color: colors.text }]}>{alert.playerName}</ThemedText>
            <ThemedText style={[styles.alertMsg, { color: colors.textSecondary }]}>{alert.message}</ThemedText>
          </View>
        );
      })}

      {/* Team Priorities */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>TOP 5 TEAM PRIORITIES</ThemedText>
      {TEAM_PRIORITIES.map((tp) => (
        <View key={tp.id} style={[styles.priorityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.priorityHeader}>
            <View style={[styles.rankBadge, { backgroundColor: accent + '22' }]}>
              <ThemedText style={[styles.rankText, { color: accent }]}>#{tp.rank}</ThemedText>
            </View>
            <ThemedText style={[styles.priorityTitle, { color: colors.text }]}>{tp.title}</ThemedText>
          </View>
          <ThemedText style={[styles.priorityDesc, { color: colors.textSecondary }]}>{tp.description}</ThemedText>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${tp.progress}%`, backgroundColor: tp.coverageTier === 'strong' ? '#22C55E' : tp.coverageTier === 'adequate' ? '#F59E0B' : '#EF4444' }]} />
          </View>
        </View>
      ))}

      {/* Position Groups */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>POSITION GROUPS</ThemedText>
      <View style={styles.posGroupRow}>
        {POSITION_GROUPS.map((pg) => (
          <View key={pg.id} style={[styles.posGroupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[styles.posGroupName, { color: colors.text }]}>{pg.name}</ThemedText>
            <ThemedText style={[styles.posGroupHealth, { color: pg.healthScore >= 70 ? '#22C55E' : pg.healthScore >= 50 ? '#F59E0B' : '#EF4444' }]}>{pg.healthScore}</ThemedText>
            <ThemedText style={[styles.posGroupFocus, { color: colors.textSecondary }]}>{pg.topFocus}</ThemedText>
          </View>
        ))}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function WeeklyPlanView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  const plan = CURRENT_WEEKLY_PLAN;
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ThemedText style={[styles.weekLabel, { color: accent }]}>{plan.weekLabel} · {plan.startDate} – {plan.endDate}</ThemedText>

      {/* Non-Negotiables */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>NON-NEGOTIABLES</ThemedText>
      {WEEKLY_NON_NEGOTIABLES.map((nn) => (
        <View key={nn.id} style={[styles.nnRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="checkmark.seal.fill" size={14} color="#22C55E" />
          <ThemedText style={[styles.nnText, { color: colors.text }]}>{nn.rule}</ThemedText>
        </View>
      ))}

      {/* Day Plans */}
      {plan.days.map((day) => (
        <View key={day.day}>
          <ThemedText style={[styles.dayHeader, { color: accent }]}>{day.day} · {day.date}</ThemedText>
          {day.sessions.map((session) => (
            <View key={session.id} style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.sessionHeader}>
                <View style={[styles.sessionDot, { backgroundColor: SESSION_COLORS[session.type] ?? '#8F8F8F' }]} />
                <ThemedText style={[styles.sessionTitle, { color: colors.text }]}>{session.title}</ThemedText>
                <ThemedText style={[styles.sessionTime, { color: colors.textSecondary }]}>{session.time}</ThemedText>
              </View>
              <ThemedText style={[styles.sessionDuration, { color: colors.textSecondary }]}>{session.duration}{session.focus ? ` · ${session.focus}` : ''}</ThemedText>
            </View>
          ))}
        </View>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function PlayersView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {PLAYER_PLANS.map((player) => {
        const expanded = expandedId === player.playerId;
        return (
          <Pressable key={player.playerId} onPress={() => setExpandedId(expanded ? null : player.playerId)} style={[styles.playerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.playerHeader}>
              <View>
                <ThemedText style={[styles.playerName, { color: colors.text }]}>#{player.number} {player.playerName}</ThemedText>
                <ThemedText style={[styles.playerRole, { color: colors.textSecondary }]}>{player.position} · {player.roleTarget}</ThemedText>
              </View>
              <View style={[styles.progressBadge, { backgroundColor: PROGRESS_COLORS[player.progress] + '22' }]}>
                <ThemedText style={[styles.progressText, { color: PROGRESS_COLORS[player.progress] }]}>{player.progress}</ThemedText>
              </View>
            </View>

            {expanded && (
              <View style={styles.playerExpanded}>
                <ThemedText style={[styles.coachNote, { color: colors.textSecondary }]}>{player.coachNote}</ThemedText>
                <ThemedText style={[styles.subSection, { color: accent }]}>Plan Blocks</ThemedText>
                {player.planBlocks.map((pb) => (
                  <View key={pb.id} style={styles.planBlockRow}>
                    <View style={[styles.planBlockDot, { backgroundColor: PROGRESS_COLORS[pb.status] }]} />
                    <View style={{ flex: 1 }}>
                      <ThemedText style={[styles.planBlockTitle, { color: colors.text }]}>{pb.title}</ThemedText>
                      <ThemedText style={[styles.planBlockMeta, { color: colors.textSecondary }]}>{pb.cluster} · {pb.trait} · by {pb.targetDate}</ThemedText>
                    </View>
                  </View>
                ))}
                <ThemedText style={[styles.subSection, { color: accent }]}>Measurables</ThemedText>
                {player.measurables.map((m) => (
                  <View key={m.name} style={styles.measurableRow}>
                    <ThemedText style={[styles.measName, { color: colors.text }]}>{m.name}</ThemedText>
                    <ThemedText style={[styles.measCurrent, { color: colors.textSecondary }]}>{m.current}</ThemedText>
                    <ThemedText style={[styles.measArrow, { color: colors.textSecondary }]}>→</ThemedText>
                    <ThemedText style={[styles.measTarget, { color: accent }]}>{m.target}</ThemedText>
                  </View>
                ))}
              </View>
            )}
          </Pressable>
        );
      })}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function DrillsView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  const diffColors = { beginner: '#22C55E', intermediate: '#F59E0B', advanced: '#EF4444' };
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {DRILL_LIBRARY.map((drill) => (
        <View key={drill.id} style={[styles.drillCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.drillHeader}>
            <ThemedText style={[styles.drillName, { color: colors.text }]}>{drill.name}</ThemedText>
            <View style={[styles.diffBadge, { backgroundColor: diffColors[drill.difficulty] + '22' }]}>
              <ThemedText style={[styles.diffText, { color: diffColors[drill.difficulty] }]}>{drill.difficulty}</ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.drillMeta, { color: colors.textSecondary }]}>{drill.cluster} · {drill.trait} · {drill.duration}</ThemedText>
          <ThemedText style={[styles.drillRx, { color: accent }]}>{drill.repPrescription}</ThemedText>
        </View>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function EvidenceView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  const statusColors = { pending: '#F59E0B', reviewed: '#22C55E', flagged: '#EF4444' };
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {EVIDENCE_QUEUE.map((ev) => (
        <View key={ev.id} style={[styles.evidenceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.evidenceHeader}>
            <View style={[styles.evStatusBadge, { backgroundColor: statusColors[ev.status] + '22' }]}>
              <ThemedText style={[styles.evStatusText, { color: statusColors[ev.status] }]}>{ev.status}</ThemedText>
            </View>
            <View style={[styles.evTypeBadge, { backgroundColor: colors.background }]}>
              <ThemedText style={[styles.evTypeText, { color: colors.textSecondary }]}>{ev.type}</ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.evPlayer, { color: colors.text }]}>{ev.playerName}</ThemedText>
          <ThemedText style={[styles.evPlan, { color: accent }]}>{ev.planItemTitle}</ThemedText>
          <ThemedText style={[styles.evDesc, { color: colors.textSecondary }]}>{ev.description}</ThemedText>
          <ThemedText style={[styles.evDate, { color: colors.textSecondary }]}>{ev.date}</ThemedText>
        </View>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function TransferView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  const transferColors = { positive: '#22C55E', neutral: '#F59E0B', negative: '#EF4444', emerging: '#6AA9FF' };
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {TRANSFER_METRICS.map((tm) => (
        <View key={tm.id} style={[styles.transferCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.transferHeader}>
            <ThemedText style={[styles.transferPlayer, { color: colors.text }]}>{tm.playerName}</ThemedText>
            <View style={[styles.transferBadge, { backgroundColor: transferColors[tm.transferLabel] + '22' }]}>
              <ThemedText style={[styles.transferLabel, { color: transferColors[tm.transferLabel] }]}>{tm.transferLabel}</ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.transferSkill, { color: accent }]}>{tm.skillArea}</ThemedText>
          <View style={styles.transferScores}>
            <ThemedText style={[styles.transferScore, { color: colors.textSecondary }]}>Practice: {tm.practiceScore}</ThemedText>
            <ThemedText style={[styles.transferScore, { color: colors.textSecondary }]}>Game: {tm.gameScore}</ThemedText>
            <ThemedText style={[styles.transferDelta, { color: tm.delta >= 0 ? '#22C55E' : '#EF4444' }]}>Δ {tm.delta > 0 ? '+' : ''}{tm.delta}</ThemedText>
          </View>
        </View>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  pillBar: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
  pillText: { fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginTop: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  weekLabel: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  dayHeader: { fontSize: 14, fontWeight: '700', marginTop: 16, marginBottom: 6, textTransform: 'uppercase' },

  snapCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  snapRow: { flexDirection: 'row', justifyContent: 'space-between' },
  snapScore: { fontSize: 22, fontWeight: '800' },
  snapDelta: { fontSize: 18, fontWeight: '800' },
  snapLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },
  snapImprover: { fontSize: 11, marginTop: 10, textAlign: 'center' },

  alertCard: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  alertBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  alertType: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  alertDate: { fontSize: 10 },
  alertName: { fontSize: 14, fontWeight: '700' },
  alertMsg: { fontSize: 12, marginTop: 2 },

  priorityCard: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  priorityHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rankBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  rankText: { fontSize: 12, fontWeight: '800' },
  priorityTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  priorityDesc: { fontSize: 12, marginTop: 4 },
  progressBarBg: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 8 },
  progressBarFill: { height: 6, borderRadius: 3 },

  posGroupRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  posGroupCard: { width: '47%', padding: 12, borderRadius: 10, borderWidth: 1 },
  posGroupName: { fontSize: 14, fontWeight: '700' },
  posGroupHealth: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  posGroupFocus: { fontSize: 10, marginTop: 4 },

  nnRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 4 },
  nnText: { fontSize: 12, flex: 1 },

  sessionCard: { padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 4 },
  sessionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sessionDot: { width: 8, height: 8, borderRadius: 4 },
  sessionTitle: { fontSize: 13, fontWeight: '600', flex: 1 },
  sessionTime: { fontSize: 11 },
  sessionDuration: { fontSize: 11, marginTop: 2, marginLeft: 16 },

  playerCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  playerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  playerName: { fontSize: 15, fontWeight: '700' },
  playerRole: { fontSize: 11, marginTop: 2 },
  progressBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  progressText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  playerExpanded: { marginTop: 12 },
  coachNote: { fontSize: 12, lineHeight: 18, marginBottom: 8, fontStyle: 'italic' },
  subSection: { fontSize: 11, fontWeight: '700', marginTop: 8, marginBottom: 4, textTransform: 'uppercase' },
  planBlockRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 4 },
  planBlockDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  planBlockTitle: { fontSize: 13, fontWeight: '600' },
  planBlockMeta: { fontSize: 10, marginTop: 1 },
  measurableRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
  measName: { fontSize: 12, fontWeight: '600', flex: 1 },
  measCurrent: { fontSize: 12 },
  measArrow: { fontSize: 10 },
  measTarget: { fontSize: 12, fontWeight: '700' },

  drillCard: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  drillHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  drillName: { fontSize: 14, fontWeight: '700', flex: 1 },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  diffText: { fontSize: 10, fontWeight: '700' },
  drillMeta: { fontSize: 11, marginTop: 4 },
  drillRx: { fontSize: 12, fontWeight: '600', marginTop: 4 },

  evidenceCard: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  evidenceHeader: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  evStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  evStatusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  evTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  evTypeText: { fontSize: 10, fontWeight: '600' },
  evPlayer: { fontSize: 14, fontWeight: '700' },
  evPlan: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  evDesc: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  evDate: { fontSize: 10, marginTop: 4 },

  transferCard: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  transferHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  transferPlayer: { fontSize: 14, fontWeight: '700' },
  transferBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  transferLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  transferSkill: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  transferScores: { flexDirection: 'row', gap: 12, marginTop: 6 },
  transferScore: { fontSize: 12 },
  transferDelta: { fontSize: 12, fontWeight: '700' },
});
