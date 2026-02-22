/**
 * Sports Development V2 — Full Development OS (7 RBAC-gated tabs)
 * Tabs: Overview, KR Profile, Pathway, Weekly Plan, Evidence, Pro Readiness, Transfer
 * Player selector at top — tabs 2-6 re-render when player changes.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Text } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ModeColors } from '@/constants/theme'
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMembershipId } from '@/context/app-context';
import { getSportsRole, getDevelopmentHubTabs, getKRVisibility, formatKR, type DevelopmentTab } from '@/utils/sports-rbac';
import { getKRColor } from '@/utils/kr-display';
import {
  WEEKLY_NON_NEGOTIABLES,
  TEAM_PRIORITIES,
  POSITION_GROUPS,
  PLAYER_ALERTS,
  CURRENT_WEEKLY_PLAN,
  WEEKLY_PLANS,
  PLAYER_PLANS,
  DRILL_LIBRARY,
  DRILL_ASSIGNMENTS,
  EVIDENCE_QUEUE_EXTENDED,
  TRANSFER_METRICS,
  PROGRESS_SNAPSHOT,
  PLAYER_DEV_NOTES,
  type PlayerPlan,
  type DrillTemplate,
  type EvidenceItem,
  type TransferMetric,
} from '@/data/mock-development-v2';

import { CLUSTER_ORDER } from '@/utils/kr-display';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PROGRESS_COLORS: Record<string, string> = { 'needs-work': '#EF4444', progressing: '#F59E0B', achieved: '#22C55E' };
const SESSION_COLORS: Record<string, string> = { practice: '#22C55E', lift: '#F59E0B', film: accent, individual: accent, rest: '#A1A1AA' };

// Mock KR data for players (would come from national pool in production)
const PLAYER_KR_DATA: Record<string, { kr: number; okr: number; dkr: number; archetype: string; clusters: number[] }> = {
  '1': { kr: 78.4, okr: 82.1, dkr: 71.8, archetype: 'Primary Ball Handler', clusters: [85, 72, 78, 68, 74, 81, 76] },
  '2': { kr: 74.2, okr: 71.8, dkr: 78.9, archetype: '3-and-D Wing', clusters: [72, 80, 68, 76, 82, 65, 74] },
  '3': { kr: 72.8, okr: 70.4, dkr: 74.2, archetype: 'Stretch 4', clusters: [68, 74, 65, 80, 72, 62, 78] },
  '4': { kr: 73.1, okr: 68.5, dkr: 79.4, archetype: 'Versatile Wing', clusters: [65, 82, 72, 75, 78, 68, 71] },
  '5': { kr: 80.6, okr: 72.8, dkr: 88.4, archetype: 'Rim Protector', clusters: [70, 90, 62, 72, 86, 58, 82] },
  '6': { kr: 68.2, okr: 65.8, dkr: 70.1, archetype: 'Backup Ball Handler', clusters: [72, 64, 68, 60, 66, 70, 62] },
  '7': { kr: 70.4, okr: 74.8, dkr: 62.1, archetype: 'Sharpshooter', clusters: [82, 58, 74, 55, 60, 78, 56] },
  '8': { kr: 75.8, okr: 68.2, dkr: 84.6, archetype: 'Defensive Stopper', clusters: [62, 88, 70, 78, 84, 64, 80] },
  '9': { kr: 71.2, okr: 72.4, dkr: 68.8, archetype: 'Energy Big', clusters: [70, 72, 64, 76, 70, 74, 68] },
  '10': { kr: 58.4, okr: 52.1, dkr: 62.8, archetype: 'Developmental Big', clusters: [48, 65, 42, 58, 62, 40, 55] },
};

// Mock pro readiness data
const PRO_READINESS: Record<string, { proKRProjection: number; draftRange: string; strengthsForPro: string[]; gaps: string[]; timeline: string }> = {
  '1': { proKRProjection: 72, draftRange: 'Late 2nd Round / UDFA', strengthsForPro: ['Elite court vision translates', 'PnR reads already pro-caliber'], gaps: ['Frame needs 15 lbs', 'Off-hand finishing'], timeline: '1-2 seasons' },
  '5': { proKRProjection: 74, draftRange: '2nd Round', strengthsForPro: ['Rim protection elite', 'Shot-blocking instinct'], gaps: ['Perimeter D mobility', 'FT% must reach 75%'], timeline: '1 season' },
  '2': { proKRProjection: 65, draftRange: 'UDFA / Overseas', strengthsForPro: ['3PT shooting range', 'Defensive versatility'], gaps: ['Ball creation off-dribble', 'Transition decision-making'], timeline: '2-3 seasons' },
  '8': { proKRProjection: 68, draftRange: 'UDFA / Overseas', strengthsForPro: ['On-ball defense elite', 'Transition energy'], gaps: ['Offensive creation', 'Pull-up shooting'], timeline: '2 seasons' },
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function SportsDevelopmentV2() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const membershipId = useMembershipId();
  const role = getSportsRole(membershipId);
  const krVis = getKRVisibility(role);
  const tabs = useMemo(() => getDevelopmentHubTabs(role), [role]);
  const [activeTab, setActiveTab] = useState<DevelopmentTab>(tabs[0]?.key ?? 'overview');

  // Player selector
  const [playerIndex, setPlayerIndex] = useState(0);
  const player = PLAYER_PLANS[playerIndex] ?? PLAYER_PLANS[0];
  const [dropOpen, setDropOpen] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Player Selector */}
      <View style={styles.selectorRow}>
        <Pressable
          style={[styles.selectorBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setDropOpen(!dropOpen)}
        >
          <Text style={[styles.selectorText, { color: colors.text }]}>#{player.number} {player.playerName}</Text>
          <IconSymbol name="chevron.down" size={12} color={colors.textSecondary} />
        </Pressable>
        <View style={[styles.progressBadgeSmall, { backgroundColor: PROGRESS_COLORS[player.progress] + '22' }]}>
          <Text style={[styles.progressBadgeText, { color: PROGRESS_COLORS[player.progress] }]}>{player.progress.toUpperCase()}</Text>
        </View>
      </View>
      {dropOpen && (
        <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {PLAYER_PLANS.map((pp, i) => (
            <Pressable
              key={pp.playerId}
              style={[styles.dropdownItem, i === playerIndex && { backgroundColor: accent + '18' }]}
              onPress={() => { setPlayerIndex(i); setDropOpen(false); }}
            >
              <Text style={[styles.dropdownItemText, { color: colors.text }]}>#{pp.number} {pp.playerName}</Text>
              <Text style={[styles.dropdownItemMeta, { color: colors.textSecondary }]}>{pp.position} · {pp.roleTarget}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Pill Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillBar}>
        {tabs.map((t) => (
          <Pressable key={t.key} style={[styles.pill, activeTab === t.key && { backgroundColor: accent }]} onPress={() => setActiveTab(t.key)}>
            <Text style={[styles.pillText, { color: activeTab === t.key ? '#000' : colors.textSecondary }]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab colors={colors} accent={accent} />}
      {activeTab === 'player_kr_profile' && <KRProfileTab player={player} colors={colors} accent={accent} krVis={krVis} />}
      {activeTab === 'pathway' && <PathwayTab player={player} colors={colors} accent={accent} />}
      {activeTab === 'weekly_plan' && <WeeklyPlanTab colors={colors} accent={accent} />}
      {activeTab === 'evidence' && <EvidenceTab player={player} colors={colors} accent={accent} />}
      {activeTab === 'pro_readiness' && <ProReadinessTab player={player} colors={colors} accent={accent} krVis={krVis} />}
      {activeTab === 'transfer_portal' && <TransferTab colors={colors} accent={accent} />}
    </View>
  );
}

type TabProps = { colors: typeof Colors.light; accent: string; player?: PlayerPlan; krVis?: string };

// ---------------------------------------------------------------------------
// Tab 1: Overview
// ---------------------------------------------------------------------------

function OverviewTab({ colors, accent }: TabProps) {
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
        const alertColor = alert.type === 'regression' ? '#EF4444' : alert.type === 'injury' ? '#F59E0B' : alert.type === 'breakout' ? '#22C55E' : accent;
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

// ---------------------------------------------------------------------------
// Tab 2: KR Profile
// ---------------------------------------------------------------------------

function KRProfileTab({ player, colors, accent, krVis }: TabProps) {
  if (!player) return null;
  const krData = PLAYER_KR_DATA[player.playerId];
  if (!krData) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>No KR data available for {player.playerName}</ThemedText>
      </ScrollView>
    );
  }

  const clusterLabels = CLUSTER_ORDER ?? ['Shooting', 'On-Ball Defense', 'Playmaking', 'Rebounding', 'Team Defense', 'Finishing', 'Physical'];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* KR Header */}
      <View style={[styles.krHeaderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.krHeaderRow}>
          <View style={{ alignItems: 'center' }}>
            <View style={[styles.krBadge, { backgroundColor: getKRColor(krData.kr) + '22' }]}>
              <ThemedText style={[styles.krBadgeText, { color: getKRColor(krData.kr) }]}>{formatKR(krData.kr, krVis ?? 'full')}</ThemedText>
            </View>
            <ThemedText style={[styles.krBadgeLabel, { color: colors.textSecondary }]}>KR</ThemedText>
          </View>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={[styles.krSubValue, { color: getKRColor(krData.okr) }]}>{formatKR(krData.okr, krVis ?? 'full')}</ThemedText>
            <ThemedText style={[styles.krBadgeLabel, { color: colors.textSecondary }]}>OKR</ThemedText>
          </View>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={[styles.krSubValue, { color: getKRColor(krData.dkr) }]}>{formatKR(krData.dkr, krVis ?? 'full')}</ThemedText>
            <ThemedText style={[styles.krBadgeLabel, { color: colors.textSecondary }]}>DKR</ThemedText>
          </View>
        </View>
        <View style={[styles.archetypeBadge, { backgroundColor: accent + '18' }]}>
          <ThemedText style={[styles.archetypeText, { color: accent }]}>{krData.archetype}</ThemedText>
        </View>
      </View>

      {/* 7 Cluster Bars */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>CLUSTER SCORES</ThemedText>
      <View style={[styles.tableCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {clusterLabels.map((label, i) => {
          const score = krData.clusters[i] ?? 0;
          return (
            <View key={label} style={styles.clusterRow}>
              <ThemedText style={[styles.clusterLabel, { color: colors.text }]}>{label}</ThemedText>
              <View style={styles.clusterBarBg}>
                <View style={[styles.clusterBarFill, { width: `${score}%`, backgroundColor: getKRColor(score) }]} />
              </View>
              <ThemedText style={[styles.clusterScore, { color: getKRColor(score) }]}>{score}</ThemedText>
            </View>
          );
        })}
      </View>

      {/* Badges */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>BADGES</ThemedText>
      <View style={styles.badgeRow}>
        {krData.clusters.map((score, i) => {
          if (score < 90) return null;
          const tier = score >= 97 ? 'Gold' : score >= 94 ? 'Silver' : 'Bronze';
          const tierColor = tier === 'Gold' ? accent : tier === 'Silver' ? '#A1A1AA' : accent;
          return (
            <View key={i} style={[styles.badgeChip, { backgroundColor: tierColor + '22' }]}>
              <ThemedText style={[styles.badgeChipText, { color: tierColor }]}>{tier} · {clusterLabels[i]}</ThemedText>
            </View>
          );
        })}
        {krData.clusters.every((s) => s < 90) && (
          <ThemedText style={[styles.noBadges, { color: colors.textSecondary }]}>No badges earned yet</ThemedText>
        )}
      </View>

      {/* Top Gaps */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>DEVELOPMENT GAPS</ThemedText>
      {player.topGaps.map((gap, i) => (
        <View key={i} style={[styles.gapRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.gapDot, { backgroundColor: '#EF4444' }]} />
          <ThemedText style={[styles.gapText, { color: colors.text }]}>{gap}</ThemedText>
        </View>
      ))}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Tab 3: Pathway
// ---------------------------------------------------------------------------

function PathwayTab({ player, colors, accent }: TabProps) {
  if (!player) return null;
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Role Target */}
      <View style={[styles.roleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.roleLabel, { color: colors.textSecondary }]}>ROLE TARGET</ThemedText>
        <ThemedText style={[styles.roleValue, { color: colors.text }]}>{player.roleTarget}</ThemedText>
      </View>

      {/* Coach Note */}
      <ThemedText style={[styles.coachNote, { color: colors.textSecondary }]}>{player.coachNote}</ThemedText>

      {/* Plan Blocks */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>PLAN BLOCKS</ThemedText>
      {player.planBlocks.map((pb) => {
        const expanded = expandedBlock === pb.id;
        return (
          <Pressable
            key={pb.id}
            style={[styles.planBlockCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setExpandedBlock(expanded ? null : pb.id)}
          >
            <View style={styles.planBlockHeader}>
              <View style={[styles.planBlockDot, { backgroundColor: PROGRESS_COLORS[pb.status] }]} />
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.planBlockTitle, { color: colors.text }]}>{pb.title}</ThemedText>
                <ThemedText style={[styles.planBlockMeta, { color: colors.textSecondary }]}>{pb.cluster} · {pb.trait} · by {pb.targetDate}</ThemedText>
              </View>
              <View style={[styles.statusChip, { backgroundColor: PROGRESS_COLORS[pb.status] + '22' }]}>
                <ThemedText style={[styles.statusChipText, { color: PROGRESS_COLORS[pb.status] }]}>{pb.status}</ThemedText>
              </View>
            </View>
            {expanded && (
              <View style={styles.planBlockExpanded}>
                <ThemedText style={[styles.expandedLabel, { color: accent }]}>ASSIGNED DRILLS</ThemedText>
                {pb.drills.map((d, i) => (
                  <ThemedText key={i} style={[styles.expandedDrill, { color: colors.textSecondary }]}>• {d}</ThemedText>
                ))}
              </View>
            )}
          </Pressable>
        );
      })}

      {/* Measurables */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>MEASURABLES</ThemedText>
      <View style={[styles.tableCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {player.measurables.map((m) => (
          <View key={m.name} style={styles.measurableRow}>
            <ThemedText style={[styles.measName, { color: colors.text }]}>{m.name}</ThemedText>
            <ThemedText style={[styles.measCurrent, { color: colors.textSecondary }]}>{m.current}</ThemedText>
            <ThemedText style={[styles.measArrow, { color: colors.textSecondary }]}>→</ThemedText>
            <ThemedText style={[styles.measTarget, { color: accent }]}>{m.target}</ThemedText>
            <ThemedText style={[styles.measDelta, { color: '#22C55E' }]}>{m.delta}</ThemedText>
          </View>
        ))}
      </View>

      {/* Progress Timeline */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>PROGRESS TIMELINE</ThemedText>
      <View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.timelineRow}>
          {player.progressTimeline.map((pt, i) => {
            const prev = i > 0 ? player.progressTimeline[i - 1].score : pt.score;
            const delta = pt.score - prev;
            return (
              <View key={pt.week} style={styles.timelinePoint}>
                <ThemedText style={[styles.timelineScore, { color: accent }]}>{pt.score}</ThemedText>
                {i > 0 && (
                  <ThemedText style={[styles.timelineDelta, { color: delta >= 0 ? '#22C55E' : '#EF4444' }]}>
                    {delta >= 0 ? '+' : ''}{delta}
                  </ThemedText>
                )}
                <ThemedText style={[styles.timelineWeek, { color: colors.textSecondary }]}>{pt.week}</ThemedText>
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Tab 4: Weekly Plan
// ---------------------------------------------------------------------------

function WeeklyPlanTab({ colors, accent }: TabProps) {
  const [weekIndex, setWeekIndex] = useState(0);
  const plan = WEEKLY_PLANS[weekIndex] ?? CURRENT_WEEKLY_PLAN;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Week Selector */}
      <View style={styles.weekSelector}>
        {WEEKLY_PLANS.map((w, i) => (
          <Pressable
            key={w.weekLabel}
            style={[styles.weekBtn, i === weekIndex && { backgroundColor: accent }]}
            onPress={() => setWeekIndex(i)}
          >
            <Text style={[styles.weekBtnText, { color: i === weekIndex ? '#000' : colors.textSecondary }]}>{w.weekLabel}</Text>
          </Pressable>
        ))}
      </View>

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
                <View style={[styles.sessionDot, { backgroundColor: SESSION_COLORS[session.type] ?? '#A1A1AA' }]} />
                <ThemedText style={[styles.sessionTitle, { color: colors.text }]}>{session.title}</ThemedText>
                <ThemedText style={[styles.sessionTime, { color: colors.textSecondary }]}>{session.time}</ThemedText>
              </View>
              <ThemedText style={[styles.sessionDuration, { color: colors.textSecondary }]}>{session.duration}{session.focus ? ` · ${session.focus}` : ''}</ThemedText>
            </View>
          ))}
        </View>
      ))}

      {/* Drill Assignments */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>DRILL ASSIGNMENTS</ThemedText>
      {DRILL_ASSIGNMENTS.slice(0, 5).map((da) => {
        const statusColor = da.status === 'completed' ? '#22C55E' : da.status === 'in-progress' ? '#F59E0B' : '#A1A1AA';
        return (
          <View key={da.id} style={[styles.drillAssignCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.drillAssignHeader}>
              <ThemedText style={[styles.drillAssignName, { color: colors.text }]}>{da.drillName}</ThemedText>
              <View style={[styles.drillAssignStatus, { backgroundColor: statusColor + '22' }]}>
                <ThemedText style={[styles.drillAssignStatusText, { color: statusColor }]}>{da.status}</ThemedText>
              </View>
            </View>
            <ThemedText style={[styles.drillAssignPlayers, { color: colors.textSecondary }]}>
              {da.assignedPlayers.map((p) => `#${p.number} ${p.name}`).join(', ')}
            </ThemedText>
            {da.coachNotes && (
              <ThemedText style={[styles.drillAssignNote, { color: accent }]}>{da.coachNotes}</ThemedText>
            )}
          </View>
        );
      })}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Tab 5: Evidence
// ---------------------------------------------------------------------------

function EvidenceTab({ player, colors, accent }: TabProps) {
  if (!player) return null;
  const statusColors: Record<string, string> = { pending: '#F59E0B', reviewed: '#22C55E', flagged: '#EF4444' };

  // Filter evidence for selected player (or show all)
  const playerEvidence = EVIDENCE_QUEUE_EXTENDED.filter((ev) => ev.playerId === player.playerId);
  const allEvidence = playerEvidence.length > 0 ? playerEvidence : EVIDENCE_QUEUE_EXTENDED;
  const showingAll = playerEvidence.length === 0;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {showingAll && (
        <ThemedText style={[styles.filterNote, { color: colors.textSecondary }]}>
          No evidence for {player.playerName} — showing all {allEvidence.length} items
        </ThemedText>
      )}
      {!showingAll && (
        <ThemedText style={[styles.filterNote, { color: accent }]}>
          {playerEvidence.length} evidence item{playerEvidence.length !== 1 ? 's' : ''} for {player.playerName}
        </ThemedText>
      )}

      {allEvidence.map((ev) => (
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

// ---------------------------------------------------------------------------
// Tab 6: Pro Readiness
// ---------------------------------------------------------------------------

function ProReadinessTab({ player, colors, accent, krVis }: TabProps) {
  if (!player) return null;
  const krData = PLAYER_KR_DATA[player.playerId];
  const proData = PRO_READINESS[player.playerId];

  if (!proData) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
          Pro readiness assessment not yet available for {player.playerName}.
        </ThemedText>
        <ThemedText style={[styles.emptySubtext, { color: colors.textSecondary }]}>
          Assessment requires minimum 20 games of data and coach evaluation.
        </ThemedText>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* KR Comparison */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>KR CROSS-LEVEL PROJECTION</ThemedText>
      <View style={[styles.proCompCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.proCompRow}>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={[styles.proCompValue, { color: getKRColor(krData?.kr ?? 0) }]}>
              {formatKR(krData?.kr ?? 0, krVis ?? 'full')}
            </ThemedText>
            <ThemedText style={[styles.proCompLabel, { color: colors.textSecondary }]}>College KR</ThemedText>
          </View>
          <ThemedText style={[styles.proCompArrow, { color: accent }]}>→</ThemedText>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={[styles.proCompValue, { color: getKRColor(proData.proKRProjection) }]}>
              {formatKR(proData.proKRProjection, krVis ?? 'full')}
            </ThemedText>
            <ThemedText style={[styles.proCompLabel, { color: colors.textSecondary }]}>Pro KR (Proj)</ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.proCompRange, { color: colors.textSecondary }]}>Draft Range: {proData.draftRange}</ThemedText>
        <ThemedText style={[styles.proCompTimeline, { color: accent }]}>Timeline to Pro Ready: {proData.timeline}</ThemedText>
      </View>

      {/* Strengths for Pro */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>STRENGTHS THAT TRANSLATE</ThemedText>
      {proData.strengthsForPro.map((s, i) => (
        <View key={i} style={[styles.proItemRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.proItemDot, { backgroundColor: '#22C55E' }]} />
          <ThemedText style={[styles.proItemText, { color: colors.text }]}>{s}</ThemedText>
        </View>
      ))}

      {/* Gaps for Pro */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>GAPS TO CLOSE</ThemedText>
      {proData.gaps.map((g, i) => (
        <View key={i} style={[styles.proItemRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.proItemDot, { backgroundColor: '#EF4444' }]} />
          <ThemedText style={[styles.proItemText, { color: colors.text }]}>{g}</ThemedText>
        </View>
      ))}

      {/* Development Notes for this player */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>DEVELOPMENT NOTES</ThemedText>
      {PLAYER_DEV_NOTES.filter((n) => n.playerNumber === player.number).length > 0 ? (
        PLAYER_DEV_NOTES.filter((n) => n.playerNumber === player.number).map((note) => (
          <View key={note.id} style={[styles.devNoteCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.devNoteHeader}>
              <ThemedText style={[styles.devNoteTitle, { color: accent }]}>{note.priorityTitle}</ThemedText>
              <View style={[styles.devNoteStatus, { backgroundColor: PROGRESS_COLORS[note.progressIndicator] + '22' }]}>
                <ThemedText style={[styles.devNoteStatusText, { color: PROGRESS_COLORS[note.progressIndicator] }]}>{note.progressIndicator}</ThemedText>
              </View>
            </View>
            <ThemedText style={[styles.devNoteBody, { color: colors.textSecondary }]}>{note.note}</ThemedText>
            {note.actionItems.map((ai, i) => (
              <ThemedText key={i} style={[styles.devNoteAction, { color: colors.text }]}>• {ai}</ThemedText>
            ))}
          </View>
        ))
      ) : (
        <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
          No priority-linked development notes for {player.playerName}
        </ThemedText>
      )}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Tab 7: Transfer / Portal
// ---------------------------------------------------------------------------

function TransferTab({ colors, accent }: TabProps) {
  const transferColors: Record<string, string> = { positive: '#22C55E', neutral: '#F59E0B', negative: '#EF4444', emerging: accent };

  // Group by transfer label
  const negative = TRANSFER_METRICS.filter((t) => t.transferLabel === 'negative');
  const positive = TRANSFER_METRICS.filter((t) => t.transferLabel === 'positive');
  const emerging = TRANSFER_METRICS.filter((t) => t.transferLabel === 'emerging');
  const neutral = TRANSFER_METRICS.filter((t) => t.transferLabel === 'neutral');

  const renderGroup = (label: string, items: TransferMetric[], color: string) => {
    if (items.length === 0) return null;
    return (
      <View key={label}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{label.toUpperCase()} TRANSFER ({items.length})</ThemedText>
        {items.map((tm) => (
          <View key={tm.id} style={[styles.transferCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.transferHeader}>
              <ThemedText style={[styles.transferPlayer, { color: colors.text }]}>{tm.playerName}</ThemedText>
              <View style={[styles.transferBadge, { backgroundColor: color + '22' }]}>
                <ThemedText style={[styles.transferBadgeLabel, { color }]}>{tm.transferLabel}</ThemedText>
              </View>
            </View>
            <ThemedText style={[styles.transferSkill, { color: accent }]}>{tm.skillArea}</ThemedText>
            <View style={styles.transferScores}>
              <ThemedText style={[styles.transferScore, { color: colors.textSecondary }]}>Practice: {tm.practiceScore}</ThemedText>
              <ThemedText style={[styles.transferScore, { color: colors.textSecondary }]}>Game: {tm.gameScore}</ThemedText>
              <ThemedText style={[styles.transferDelta, { color: tm.delta >= 0 ? '#22C55E' : '#EF4444' }]}>Δ {tm.delta > 0 ? '+' : ''}{tm.delta}</ThemedText>
            </View>
            {/* Practice→Game transfer bar */}
            <View style={styles.transferBarContainer}>
              <View style={styles.transferBarBg}>
                <View style={[styles.transferBarFill, { width: `${Math.min(100, (tm.gameScore / Math.max(tm.practiceScore, 1)) * 100)}%`, backgroundColor: color }]} />
              </View>
              <ThemedText style={[styles.transferBarLabel, { color: colors.textSecondary }]}>
                {Math.round((tm.gameScore / Math.max(tm.practiceScore, 1)) * 100)}% transfer rate
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Summary */}
      <View style={[styles.transferSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.transferSummaryRow}>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={[styles.transferSummaryValue, { color: '#22C55E' }]}>{positive.length}</ThemedText>
            <ThemedText style={[styles.transferSummaryLabel, { color: colors.textSecondary }]}>Positive</ThemedText>
          </View>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={[styles.transferSummaryValue, { color: accent }]}>{emerging.length}</ThemedText>
            <ThemedText style={[styles.transferSummaryLabel, { color: colors.textSecondary }]}>Emerging</ThemedText>
          </View>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={[styles.transferSummaryValue, { color: '#F59E0B' }]}>{neutral.length}</ThemedText>
            <ThemedText style={[styles.transferSummaryLabel, { color: colors.textSecondary }]}>Neutral</ThemedText>
          </View>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={[styles.transferSummaryValue, { color: '#EF4444' }]}>{negative.length}</ThemedText>
            <ThemedText style={[styles.transferSummaryLabel, { color: colors.textSecondary }]}>Negative</ThemedText>
          </View>
        </View>
      </View>

      {renderGroup('Negative', negative, '#EF4444')}
      {renderGroup('Emerging', emerging, accent)}
      {renderGroup('Neutral', neutral, '#F59E0B')}
      {renderGroup('Positive', positive, '#22C55E')}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  // Selector
  selectorRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, gap: 8 },
  selectorBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, flex: 1 },
  selectorText: { fontSize: 15, fontWeight: '700' },
  progressBadgeSmall: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  progressBadgeText: { fontSize: 10, fontWeight: '700' },
  dropdown: { marginHorizontal: 16, borderRadius: 10, borderWidth: 1, overflow: 'hidden', marginTop: 4, maxHeight: 300 },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 10 },
  dropdownItemText: { fontSize: 14, fontWeight: '600' },
  dropdownItemMeta: { fontSize: 11, marginTop: 2 },

  // Pills
  pillBar: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2F3336' },
  pillText: { fontSize: 13, fontWeight: '600' },

  // Section
  sectionTitle: { fontSize: 13, fontWeight: '700', marginTop: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Overview
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
  progressBarBg: { height: 6, borderRadius: 3, backgroundColor: '#2F3336', marginTop: 8 },
  progressBarFill: { height: 6, borderRadius: 3 },

  posGroupRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  posGroupCard: { width: '47%', padding: 12, borderRadius: 10, borderWidth: 1 },
  posGroupName: { fontSize: 14, fontWeight: '700' },
  posGroupHealth: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  posGroupFocus: { fontSize: 10, marginTop: 4 },

  // KR Profile
  krHeaderCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  krHeaderRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  krBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  krBadgeText: { fontSize: 24, fontWeight: '800' },
  krBadgeLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', marginTop: 4 },
  krSubValue: { fontSize: 18, fontWeight: '800' },
  archetypeBadge: { alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, marginTop: 12 },
  archetypeText: { fontSize: 13, fontWeight: '700' },

  tableCard: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  clusterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  clusterLabel: { fontSize: 12, fontWeight: '600', width: 100 },
  clusterBarBg: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#2F3336' },
  clusterBarFill: { height: 8, borderRadius: 4 },
  clusterScore: { fontSize: 13, fontWeight: '800', width: 30, textAlign: 'right' },

  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badgeChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  badgeChipText: { fontSize: 11, fontWeight: '700' },
  noBadges: { fontSize: 12 },

  gapRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 4 },
  gapDot: { width: 8, height: 8, borderRadius: 4 },
  gapText: { fontSize: 12, flex: 1 },

  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 32 },
  emptySubtext: { fontSize: 12, textAlign: 'center', marginTop: 8 },

  // Pathway
  roleCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  roleLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  roleValue: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  coachNote: { fontSize: 12, fontStyle: 'italic', lineHeight: 18, marginVertical: 8 },

  planBlockCard: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  planBlockHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  planBlockDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  planBlockTitle: { fontSize: 13, fontWeight: '700' },
  planBlockMeta: { fontSize: 10, marginTop: 1 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusChipText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  planBlockExpanded: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#2F3336' },
  expandedLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  expandedDrill: { fontSize: 11, lineHeight: 18 },

  measurableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  measName: { fontSize: 12, fontWeight: '600', flex: 1 },
  measCurrent: { fontSize: 12 },
  measArrow: { fontSize: 10 },
  measTarget: { fontSize: 12, fontWeight: '700' },
  measDelta: { fontSize: 11, fontWeight: '700', width: 40, textAlign: 'right' },

  timelineCard: { padding: 14, borderRadius: 12, borderWidth: 1 },
  timelineRow: { flexDirection: 'row', justifyContent: 'space-around' },
  timelinePoint: { alignItems: 'center' },
  timelineScore: { fontSize: 16, fontWeight: '800' },
  timelineDelta: { fontSize: 10, fontWeight: '700' },
  timelineWeek: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },

  // Weekly Plan
  weekSelector: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  weekBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2F3336' },
  weekBtnText: { fontSize: 13, fontWeight: '600' },
  weekLabel: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  dayHeader: { fontSize: 14, fontWeight: '700', marginTop: 16, marginBottom: 6, textTransform: 'uppercase' },

  nnRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 4 },
  nnText: { fontSize: 12, flex: 1 },

  sessionCard: { padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 4 },
  sessionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sessionDot: { width: 8, height: 8, borderRadius: 4 },
  sessionTitle: { fontSize: 13, fontWeight: '600', flex: 1 },
  sessionTime: { fontSize: 11 },
  sessionDuration: { fontSize: 11, marginTop: 2, marginLeft: 16 },

  drillAssignCard: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  drillAssignHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  drillAssignName: { fontSize: 13, fontWeight: '700', flex: 1 },
  drillAssignStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  drillAssignStatusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  drillAssignPlayers: { fontSize: 11, marginTop: 4 },
  drillAssignNote: { fontSize: 11, fontWeight: '600', marginTop: 4 },

  // Evidence
  filterNote: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
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

  // Pro Readiness
  proCompCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  proCompRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  proCompValue: { fontSize: 24, fontWeight: '800' },
  proCompLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },
  proCompArrow: { fontSize: 24, fontWeight: '800' },
  proCompRange: { fontSize: 12, textAlign: 'center', marginTop: 12 },
  proCompTimeline: { fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 4 },

  proItemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 4 },
  proItemDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  proItemText: { fontSize: 12, flex: 1 },

  devNoteCard: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  devNoteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  devNoteTitle: { fontSize: 13, fontWeight: '700', flex: 1 },
  devNoteStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  devNoteStatusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  devNoteBody: { fontSize: 12, lineHeight: 18, marginBottom: 6 },
  devNoteAction: { fontSize: 11, lineHeight: 18, marginLeft: 4 },

  // Transfer
  transferSummary: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  transferSummaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  transferSummaryValue: { fontSize: 22, fontWeight: '800' },
  transferSummaryLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },

  transferCard: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  transferHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  transferPlayer: { fontSize: 14, fontWeight: '700' },
  transferBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  transferBadgeLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  transferSkill: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  transferScores: { flexDirection: 'row', gap: 12, marginTop: 6 },
  transferScore: { fontSize: 12 },
  transferDelta: { fontSize: 12, fontWeight: '700' },
  transferBarContainer: { marginTop: 8 },
  transferBarBg: { height: 6, borderRadius: 3, backgroundColor: '#2F3336' },
  transferBarFill: { height: 6, borderRadius: 3 },
  transferBarLabel: { fontSize: 10, marginTop: 2 },
});
