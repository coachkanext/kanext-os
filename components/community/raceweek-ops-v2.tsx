/**
 * RaceweekOpsV2 — CEO/Commissioner Race Weekend Control Room
 * 5-panel pill nav: Timeline | Readiness | Incidents | Approvals | Bulletins
 * Fixed top bar + CEO Top 5 strip above scrollable pill content.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import {
  CEO_TOP_5, BULLETINS, CEO_APPROVALS,
  BULLETIN_TYPE_COLOR, BULLETIN_STATUS_COLOR,
  SEVERITY_COLOR as CEO_SEVERITY_COLOR,
  APPROVAL_CATEGORY_COLOR,
} from '@/data/mock-ceo-competition';
import type { CEOTop5Item, Bulletin, ApprovalItem } from '@/data/mock-ceo-competition';
import {
  RACE_WEEK_SESSIONS, TEAM_READINESS, RACE_INCIDENTS,
  ENTRANT_LIST, EVENT_SESSIONS, EVENT_INCIDENTS,
  getBlockerTasks, getUpcomingDeliverables, SPONSOR_DELIVERABLES,
  PAYOUT_ITEMS, OPS_TASKS,
} from '@/data/mock-competition-v2';
import type {
  RaceWeekSession, TeamReadiness, RaceIncident, EntrantObject, EventIncident,
} from '@/data/mock-competition-v2';
import { mapRoleToCompetitionLens, isFullAccess } from '@/utils/competition-rbac';

// =============================================================================
// CONSTANTS
// =============================================================================


const ACCENT = MODE_ACCENT.competition;
type OpsPill = 'timeline' | 'readiness' | 'incidents' | 'approvals' | 'bulletins';

const OPS_PILLS: { key: OpsPill; label: string }[] = [
  { key: 'timeline', label: 'Timeline' },
  { key: 'readiness', label: 'Readiness' },
  { key: 'incidents', label: 'Incidents' },
  { key: 'approvals', label: 'Approvals' },
  { key: 'bulletins', label: 'Bulletins' },
];

const SESSION_STATUS_COLOR: Record<RaceWeekSession['status'], string> = {
  completed: '#22C55E',
  live: '#F59E0B',
  upcoming: '#A1A1AA',
  delayed: '#EF4444',
};

const SESSION_TYPE_LABEL: Record<RaceWeekSession['type'], string> = {
  practice: 'Practice',
  qualifying: 'Qualifying',
  race: 'Race',
  setup: 'Setup',
  inspection: 'Inspection',
};

const SEVERITY_COLOR: Record<RaceIncident['severity'], string> = {
  minor: ACCENT,
  moderate: '#F59E0B',
  major: '#EF4444',
};

const INCIDENT_STATUS_COLOR: Record<RaceIncident['status'], string> = {
  under_review: '#F59E0B',
  decided: '#22C55E',
  no_action: '#A1A1AA',
};

const INCIDENT_STATUS_LABEL: Record<RaceIncident['status'], string> = {
  under_review: 'Under Review',
  decided: 'Decided',
  no_action: 'No Action',
};

const CHECK_STATUS_ICON: Record<'pass' | 'fail' | 'pending', { name: 'checkmark.circle.fill' | 'xmark.circle.fill' | 'clock.fill'; color: string }> = {
  pass: { name: 'checkmark.circle.fill', color: '#22C55E' },
  fail: { name: 'xmark.circle.fill', color: '#EF4444' },
  pending: { name: 'clock.fill', color: '#F59E0B' },
};

const URGENCY_COLOR: Record<string, string> = {
  critical: '#EF4444',
  high: '#F59E0B',
  normal: ACCENT,
};

const RANK_COLOR: Record<number, string> = {
  1: '#F59E0B',
  2: '#F59E0B',
  3: '#F59E0B',
  4: '#A1A1AA',
  5: '#A1A1AA',
};

// =============================================================================
// TOP BAR
// =============================================================================

function TopBar({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={[styles.topBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.topBarRow}>
        <View style={{ flex: 1 }}>
          <ThemedText style={[styles.topBarEvent, { color: colors.text }]}>
            Thunder Classic
          </ThemedText>
        </View>
        <View style={[styles.modeBadge, { backgroundColor: colors.text + '15' }]}>
          <ThemedText style={[styles.modeBadgeText, { color: colors.text }]}>
            RACEWEEK OPS
          </ThemedText>
        </View>
      </View>
      <ThemedText style={[styles.topBarCountdown, { color: colors.textSecondary }]}>
        Race: Sun 2:00 PM
      </ThemedText>
    </View>
  );
}

// =============================================================================
// CEO TOP 5 STRIP
// =============================================================================

function CEOTop5Strip({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={styles.top5Container}>
      {CEO_TOP_5.map((item) => {
        const sevColor = CEO_SEVERITY_COLOR[item.severity] ?? '#A1A1AA';
        const rankColor = RANK_COLOR[item.rank] ?? '#A1A1AA';

        return (
          <View
            key={item.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.top5Row}>
              {/* Rank */}
              <ThemedText style={[styles.top5Rank, { color: rankColor }]}>
                {item.rank}
              </ThemedText>

              {/* Title + Owner + Unblock */}
              <View style={styles.top5Info}>
                <ThemedText style={[styles.top5Title, { color: colors.text }]}>
                  {item.title}
                </ThemedText>
                <ThemedText style={[styles.top5Owner, { color: colors.textSecondary }]}>
                  {item.owner}
                </ThemedText>
                {item.unblockAction && (
                  <ThemedText style={[styles.top5Unblock, { color: colors.textTertiary }]}>
                    {item.unblockAction}
                  </ThemedText>
                )}
              </View>

              {/* Severity Badge */}
              <View style={[styles.badge, { backgroundColor: sevColor + '20' }]}>
                <ThemedText style={[styles.badgeText, { color: sevColor }]}>
                  {item.severity.toUpperCase()}
                </ThemedText>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// =============================================================================
// SECTION: TIMELINE
// =============================================================================

function TimelineSection({ colors }: { colors: typeof Colors.light }) {
  const sessions = [...RACE_WEEK_SESSIONS].sort((a, b) => {
    const dayOrder: Record<string, number> = { Thu: 0, Fri: 1, Sat: 2, Sun: 3 };
    const dayA = a.startTime.split(' ')[0];
    const dayB = b.startTime.split(' ')[0];
    return (dayOrder[dayA] ?? 99) - (dayOrder[dayB] ?? 99);
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {sessions.map((session, index) => {
        const statusColor = SESSION_STATUS_COLOR[session.status];
        const isLast = index === sessions.length - 1;
        const isLive = session.status === 'live';

        return (
          <View key={session.id} style={styles.timelineNode}>
            {/* Left: Time range */}
            <View style={styles.timelineTimeCol}>
              <ThemedText style={[styles.timelineTime, { color: isLive ? statusColor : colors.textSecondary }]}>
                {session.startTime}
              </ThemedText>
              <ThemedText style={[styles.timelineTimeEnd, { color: colors.textTertiary }]}>
                {session.endTime}
              </ThemedText>
            </View>

            {/* Center: Line + Dot */}
            <View style={styles.timelineCenterCol}>
              <View
                style={[
                  styles.timelineDot,
                  {
                    backgroundColor: statusColor,
                    borderColor: isLive ? statusColor + '40' : 'transparent',
                    borderWidth: isLive ? 3 : 0,
                  },
                ]}
              />
              {!isLast && (
                <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
              )}
            </View>

            {/* Right: Session info */}
            <View style={styles.timelineInfoCol}>
              <ThemedText style={[styles.timelineSessionName, { color: colors.text }]}>
                {session.name}
              </ThemedText>
              <View style={styles.timelineBadgeRow}>
                <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
                  <ThemedText style={[styles.badgeText, { color: statusColor }]}>
                    {SESSION_TYPE_LABEL[session.type]}
                  </ThemedText>
                </View>
                {isLive && (
                  <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
                    <ThemedText style={[styles.badgeText, { color: statusColor }]}>
                      LIVE
                    </ThemedText>
                  </View>
                )}
              </View>
              {session.weather && (
                <ThemedText style={[styles.timelineWeather, { color: colors.textTertiary }]}>
                  {session.weather}
                </ThemedText>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// =============================================================================
// SECTION: READINESS (League Readiness Board)
// =============================================================================

function ReadinessSection({ colors }: { colors: typeof Colors.light }) {
  const readyCount = TEAM_READINESS.filter((t) => t.overallReady).length;
  const notReadyCount = TEAM_READINESS.filter((t) => !t.overallReady).length;

  return (
    <>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          League Readiness Board
        </ThemedText>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: '#22C55E' }]}>
              {readyCount}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
              Ready
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: '#EF4444' }]}>
              {notReadyCount}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
              Not Ready
            </ThemedText>
          </View>
        </View>
      </View>

      {TEAM_READINESS.map((team) => {
        const checks: { label: string; status: 'pass' | 'fail' | 'pending' }[] = [
          { label: 'Tech Inspection', status: team.techInspection },
          { label: 'Safety Check', status: team.safetyCheck },
          { label: 'Credentialing', status: team.credentialing },
        ];

        return (
          <View
            key={team.teamId}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.readinessTeamHeader}>
              <View style={[styles.teamBadge, { backgroundColor: team.teamColor + '20' }]}>
                <ThemedText style={[styles.teamBadgeText, { color: team.teamColor }]}>
                  {team.abbreviation}
                </ThemedText>
              </View>
              <View style={styles.readinessTeamInfo}>
                <ThemedText style={[styles.readinessTeamName, { color: colors.text }]}>
                  {team.teamName}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.readyBadge,
                  {
                    backgroundColor: team.overallReady ? '#22C55E20' : '#EF444420',
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.readyBadgeText,
                    { color: team.overallReady ? '#22C55E' : '#EF4444' },
                  ]}
                >
                  {team.overallReady ? 'READY' : 'NOT READY'}
                </ThemedText>
              </View>
            </View>

            <View style={styles.readinessChecks}>
              {checks.map((check) => {
                const icon = CHECK_STATUS_ICON[check.status];
                return (
                  <View key={check.label} style={styles.readinessCheckRow}>
                    <IconSymbol name={icon.name} size={18} color={icon.color} />
                    <ThemedText style={[styles.readinessCheckLabel, { color: colors.textSecondary }]}>
                      {check.label}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </>
  );
}

// =============================================================================
// SECTION: INCIDENTS & STEWARDING
// =============================================================================

function IncidentsSection({ colors }: { colors: typeof Colors.light }) {
  const majorCount = RACE_INCIDENTS.filter((i) => i.severity === 'major').length;
  const moderateCount = RACE_INCIDENTS.filter((i) => i.severity === 'moderate').length;
  const minorCount = RACE_INCIDENTS.filter((i) => i.severity === 'minor').length;

  return (
    <>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Incidents & Stewarding
        </ThemedText>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: '#EF4444' }]}>
              {majorCount}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
              Major
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: '#F59E0B' }]}>
              {moderateCount}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
              Moderate
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: ACCENT }]}>
              {minorCount}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
              Minor
            </ThemedText>
          </View>
        </View>
      </View>

      {RACE_INCIDENTS.map((incident) => {
        const sevColor = SEVERITY_COLOR[incident.severity];
        const statusColor = INCIDENT_STATUS_COLOR[incident.status];

        return (
          <View
            key={incident.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {/* Top row: severity + status badges */}
            <View style={styles.incidentTopRow}>
              <View style={[styles.badge, { backgroundColor: sevColor + '20' }]}>
                <ThemedText style={[styles.badgeText, { color: sevColor }]}>
                  {incident.severity.toUpperCase()}
                </ThemedText>
              </View>
              <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
                <ThemedText style={[styles.badgeText, { color: statusColor }]}>
                  {INCIDENT_STATUS_LABEL[incident.status]}
                </ThemedText>
              </View>
            </View>

            {/* Lap + Time */}
            <ThemedText style={[styles.incidentLapTime, { color: colors.text }]}>
              Lap {incident.lap} — {incident.time}
            </ThemedText>

            {/* Description */}
            <ThemedText style={[styles.incidentDescription, { color: colors.textSecondary }]}>
              {incident.description}
            </ThemedText>

            {/* Drivers involved */}
            <View style={styles.incidentDriversRow}>
              {incident.driversInvolved.map((driver) => (
                <View
                  key={driver}
                  style={[styles.driverTag, { backgroundColor: colors.backgroundSecondary }]}
                >
                  <ThemedText style={[styles.driverTagText, { color: colors.text }]}>
                    {driver}
                  </ThemedText>
                </View>
              ))}
            </View>

            {/* Decision */}
            <ThemedText style={[styles.incidentDecision, { color: colors.textTertiary }]}>
              {incident.decision}
            </ThemedText>
          </View>
        );
      })}
    </>
  );
}

// =============================================================================
// SECTION: CEO APPROVALS
// =============================================================================

function ApprovalsSection({ colors }: { colors: typeof Colors.light }) {
  const handleApprove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleDeny = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          CEO Approvals
        </ThemedText>
        <ThemedText style={[styles.metaText, { color: colors.textTertiary }]}>
          {CEO_APPROVALS.filter((a) => a.status === 'pending').length} pending
        </ThemedText>
      </View>

      {CEO_APPROVALS.map((approval) => {
        const catColor = APPROVAL_CATEGORY_COLOR[approval.category] ?? '#A1A1AA';
        const urgColor = URGENCY_COLOR[approval.urgency] ?? '#A1A1AA';
        const isPending = approval.status === 'pending';

        return (
          <View
            key={approval.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {/* Title */}
            <ThemedText style={[styles.approvalTitle, { color: colors.text }]}>
              {approval.title}
            </ThemedText>

            {/* Badges row */}
            <View style={styles.approvalBadgeRow}>
              <View style={[styles.badge, { backgroundColor: catColor + '20' }]}>
                <ThemedText style={[styles.badgeText, { color: catColor }]}>
                  {approval.category.toUpperCase()}
                </ThemedText>
              </View>
              <View style={[styles.badge, { backgroundColor: urgColor + '20' }]}>
                <ThemedText style={[styles.badgeText, { color: urgColor }]}>
                  {approval.urgency.toUpperCase()}
                </ThemedText>
              </View>
              {!isPending && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        approval.status === 'approved' ? '#22C55E20' : '#EF444420',
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.badgeText,
                      {
                        color: approval.status === 'approved' ? '#22C55E' : '#EF4444',
                      },
                    ]}
                  >
                    {approval.status.toUpperCase()}
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Meta */}
            <ThemedText style={[styles.approvalMeta, { color: colors.textTertiary }]}>
              {approval.requestedBy} · {approval.requestDate}
            </ThemedText>

            {/* Amount */}
            {approval.amount && (
              <ThemedText style={[styles.approvalAmount, { color: colors.text }]}>
                {approval.amount}
              </ThemedText>
            )}

            {/* Action buttons (pending only) */}
            {isPending && (
              <View style={styles.approvalActions}>
                <Pressable
                  style={[styles.approveButton, { backgroundColor: '#22C55E20' }]}
                  onPress={handleApprove}
                >
                  <ThemedText style={[styles.actionButtonText, { color: '#22C55E' }]}>
                    Approve
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.denyButton, { backgroundColor: '#EF444420' }]}
                  onPress={handleDeny}
                >
                  <ThemedText style={[styles.actionButtonText, { color: '#EF4444' }]}>
                    Deny
                  </ThemedText>
                </Pressable>
              </View>
            )}
          </View>
        );
      })}
    </>
  );
}

// =============================================================================
// SECTION: COMMUNICATIONS / BULLETINS
// =============================================================================

function BulletinsSection({ colors }: { colors: typeof Colors.light }) {
  return (
    <>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Communications & Bulletins
        </ThemedText>
        <ThemedText style={[styles.metaText, { color: colors.textTertiary }]}>
          {BULLETINS.length} bulletins
        </ThemedText>
      </View>

      {BULLETINS.map((bulletin) => {
        const typeColor = BULLETIN_TYPE_COLOR[bulletin.type] ?? '#A1A1AA';
        const statusColor = BULLETIN_STATUS_COLOR[bulletin.status] ?? '#A1A1AA';
        const isDraft = bulletin.status === 'draft';
        const isPublished = bulletin.status === 'published';

        return (
          <View
            key={bulletin.id}
            style={[
              styles.bulletinCard,
              {
                backgroundColor: colors.card,
                borderColor: isDraft ? colors.border : colors.border,
                borderLeftColor: isPublished ? '#22C55E' : colors.border,
                borderLeftWidth: isPublished ? 3 : 1,
              },
            ]}
          >
            {/* Title */}
            <ThemedText style={[styles.bulletinTitle, { color: colors.text }]}>
              {bulletin.title}
            </ThemedText>

            {/* Badges */}
            <View style={styles.bulletinBadgeRow}>
              <View style={[styles.badge, { backgroundColor: typeColor + '20' }]}>
                <ThemedText style={[styles.badgeText, { color: typeColor }]}>
                  {bulletin.type.toUpperCase()}
                </ThemedText>
              </View>
              <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
                <ThemedText style={[styles.badgeText, { color: statusColor }]}>
                  {bulletin.status.toUpperCase()}
                </ThemedText>
              </View>
            </View>

            {/* Author + Date */}
            <ThemedText style={[styles.bulletinMeta, { color: colors.textTertiary }]}>
              {bulletin.author} · {bulletin.date}
            </ThemedText>

            {/* Summary */}
            <ThemedText style={[styles.bulletinSummary, { color: colors.textSecondary }]}>
              {bulletin.summary}
            </ThemedText>

            {/* Audience */}
            <ThemedText style={[styles.bulletinAudience, { color: colors.textTertiary }]}>
              Audience: {bulletin.audience}
            </ThemedText>
          </View>
        );
      })}
    </>
  );
}

// =============================================================================
// BLOCK 2: EXECUTIVE SNAPSHOT
// =============================================================================

function ExecutiveSnapshot({ colors }: { colors: typeof Colors.light }) {
  const blockerTasks = getBlockerTasks();
  const upcomingDeliverables = getUpcomingDeliverables();
  const pendingApprovals = CEO_APPROVALS.filter((a) => a.status === 'pending').length;
  const holdPayouts = PAYOUT_ITEMS.filter((p) => p.status === 'hold').length;
  const releasedPayouts = PAYOUT_ITEMS.filter((p) => p.status === 'released').length;
  const atRiskDeliverables = SPONSOR_DELIVERABLES.filter((d) => d.status === 'at_risk').length;
  const openIncidents = EVENT_INCIDENTS.filter((i) => i.status === 'under_review').length;

  const snapItems: { label: string; value: string; color: string }[] = [
    { label: 'Blockers', value: String(blockerTasks.length), color: blockerTasks.length > 0 ? '#EF4444' : '#22C55E' },
    { label: 'Approvals Queue', value: String(pendingApprovals), color: pendingApprovals > 0 ? '#F59E0B' : '#22C55E' },
    { label: 'Integrity Signals', value: String(openIncidents), color: openIncidents > 0 ? '#EF4444' : '#22C55E' },
    { label: 'Payouts Ready', value: `${releasedPayouts}/${PAYOUT_ITEMS.length}`, color: holdPayouts > 0 ? '#F59E0B' : '#22C55E' },
    { label: 'Broadcast Health', value: 'On Track', color: '#22C55E' },
    { label: 'Sponsor Delivery', value: atRiskDeliverables > 0 ? `${atRiskDeliverables} at risk` : 'On Track', color: atRiskDeliverables > 0 ? '#F59E0B' : '#22C55E' },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
        Executive Snapshot
      </ThemedText>
      <View style={styles.snapGrid}>
        {snapItems.map((item) => (
          <View key={item.label} style={styles.snapCell}>
            <ThemedText style={[styles.snapValue, { color: item.color }]}>{item.value}</ThemedText>
            <ThemedText style={[styles.snapLabel, { color: colors.textTertiary }]}>{item.label}</ThemedText>
          </View>
        ))}
      </View>

      {/* Top 3 blockers */}
      {blockerTasks.length > 0 && (
        <View style={styles.blockersList}>
          <ThemedText style={[styles.blockersListTitle, { color: colors.textTertiary }]}>
            Top Blockers
          </ThemedText>
          {blockerTasks.slice(0, 3).map((task) => (
            <View key={task.id} style={styles.blockerItem}>
              <View style={[styles.blockerDot, { backgroundColor: '#EF4444' }]} />
              <ThemedText style={[styles.blockerItemText, { color: colors.text }]} numberOfLines={1}>
                {task.title}
              </ThemedText>
              <ThemedText style={[styles.blockerItemDeadline, { color: colors.textTertiary }]}>
                {task.deadline}
              </ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Next 3 deadlines */}
      <View style={styles.blockersList}>
        <ThemedText style={[styles.blockersListTitle, { color: colors.textTertiary }]}>
          Next Deadlines
        </ThemedText>
        {OPS_TASKS.filter((t) => t.status !== 'done').slice(0, 3).map((task) => (
          <View key={task.id} style={styles.blockerItem}>
            <View style={[styles.blockerDot, { backgroundColor: task.status === 'blocker' ? '#EF4444' : '#F59E0B' }]} />
            <ThemedText style={[styles.blockerItemText, { color: colors.text }]} numberOfLines={1}>
              {task.title}
            </ThemedText>
            <ThemedText style={[styles.blockerItemDeadline, { color: colors.textTertiary }]}>
              {task.deadline}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

// =============================================================================
// BLOCK 4: COMMAND PANELS (4 tiles)
// =============================================================================

function CommandPanels({ colors }: { colors: typeof Colors.light }) {
  const role = mapRoleToCompetitionLens('owner');
  const tiles: { title: string; icon: string; count: number; color: string }[] = [
    { title: 'Ops Command', icon: 'antenna.radiowaves.left.and.right', count: OPS_TASKS.filter((t) => t.status !== 'done').length, color: ACCENT },
    { title: 'Tech & Compliance', icon: 'checkmark.shield.fill', count: TEAM_READINESS.filter((t) => !t.overallReady).length, color: ACCENT },
    { title: 'Broadcast Ops', icon: 'play.rectangle.fill', count: 0, color: '#F59E0B' },
    { title: 'Sponsor Delivery', icon: 'gift.fill', count: SPONSOR_DELIVERABLES.filter((d) => d.status === 'at_risk').length, color: '#22C55E' },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
        Command Panels
      </ThemedText>
      <View style={styles.commandGrid}>
        {tiles.map((tile) => (
          <Pressable
            key={tile.title}
            style={[styles.commandTile, { backgroundColor: tile.color + '10', borderColor: tile.color + '30' }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name={tile.icon as any} size={20} color={tile.color} />
            <ThemedText style={[styles.commandTileTitle, { color: colors.text }]}>
              {tile.title}
            </ThemedText>
            {tile.count > 0 && (
              <View style={[styles.commandCountBadge, { backgroundColor: tile.color + '20' }]}>
                <ThemedText style={[styles.commandCountText, { color: tile.color }]}>
                  {tile.count}
                </ThemedText>
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// =============================================================================
// BLOCK 5: PARTICIPANTS & TEAMS
// =============================================================================

function ParticipantsBlock({ colors }: { colors: typeof Colors.light }) {
  const role = mapRoleToCompetitionLens('owner');
  const entries = ENTRANT_LIST.filter((e) => e.seriesId === 'series-k1').slice(0, 8);

  const ENTRANT_STATUS_COLOR: Record<string, string> = {
    active: '#22C55E',
    under_review: '#F59E0B',
    suspended: '#EF4444',
    withdrawn: '#A1A1AA',
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
        Participants & Teams
      </ThemedText>
      {entries.map((entry: EntrantObject) => {
        const statusColor = ENTRANT_STATUS_COLOR[entry.status] ?? '#A1A1AA';
        return (
          <View key={entry.id} style={[styles.entrantRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.entrantDot, { backgroundColor: entry.teamColor }]} />
            <View style={styles.entrantInfo}>
              <ThemedText style={[styles.entrantName, { color: colors.text }]}>
                {entry.name}
              </ThemedText>
              <ThemedText style={[styles.entrantMeta, { color: colors.textTertiary }]}>
                P{entry.rank} · {entry.points} pts
              </ThemedText>
            </View>
            <View style={styles.entrantChips}>
              <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
                <ThemedText style={[styles.badgeText, { color: statusColor }]}>
                  {entry.status === 'under_review' ? 'REVIEW' : entry.status.toUpperCase()}
                </ThemedText>
              </View>
              {entry.atRiskFlags.length > 0 && (
                <View style={[styles.badge, { backgroundColor: '#EF444420' }]}>
                  <ThemedText style={[styles.badgeText, { color: '#EF4444' }]}>
                    {entry.atRiskFlags.length} FLAG{entry.atRiskFlags.length !== 1 ? 'S' : ''}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// =============================================================================
// BLOCK 6: INCIDENTS & REQUESTS
// =============================================================================

function IncidentsRequestsBlock({ colors }: { colors: typeof Colors.light }) {
  const incidents = EVENT_INCIDENTS;
  const INCIDENT_TYPE_COLOR: Record<string, string> = {
    protest: '#F59E0B',
    penalty: '#EF4444',
    safety: ACCENT,
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
        Incidents & Requests
      </ThemedText>
      {incidents.map((incident: EventIncident) => {
        const typeColor = INCIDENT_TYPE_COLOR[incident.type] ?? '#A1A1AA';
        const statusColor = incident.status === 'decided' ? '#22C55E' : incident.status === 'under_review' ? '#F59E0B' : '#A1A1AA';
        return (
          <View key={incident.id} style={[styles.incidentBlockRow, { borderBottomColor: colors.border }]}>
            <View style={styles.incidentBlockInfo}>
              <ThemedText style={[styles.incidentBlockTitle, { color: colors.text }]}>
                {incident.title}
              </ThemedText>
              <ThemedText style={[styles.incidentBlockDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {incident.description}
              </ThemedText>
              <ThemedText style={[styles.incidentBlockMeta, { color: colors.textTertiary }]}>
                {incident.filedAt} · {incident.owner}
              </ThemedText>
            </View>
            <View style={styles.incidentBlockBadges}>
              <View style={[styles.badge, { backgroundColor: typeColor + '20' }]}>
                <ThemedText style={[styles.badgeText, { color: typeColor }]}>
                  {incident.type.toUpperCase()}
                </ThemedText>
              </View>
              <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
                <ThemedText style={[styles.badgeText, { color: statusColor }]}>
                  {incident.status === 'under_review' ? 'REVIEW' : incident.status.toUpperCase()}
                </ThemedText>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function RaceweekOpsV2({ colors }: { colors: typeof Colors.light }) {
  const [activePill, setActivePill] = useState<OpsPill>('timeline');

  const handlePillPress = (pill: OpsPill) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActivePill(pill);
  };

  // Determine if the 6-block overview or the drilled-in pill panel is active
  const showOverview = activePill === 'timeline';

  return (
    <View style={styles.container}>
      {/* Block 1: Race Week Header */}
      <TopBar colors={colors} />

      {/* Pill Nav — drills into subsection or shows overview */}
      <View style={styles.pillRow}>
        {OPS_PILLS.map((pill) => {
          const isActive = activePill === pill.key;
          return (
            <Pressable
              key={pill.key}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive
                    ? colors.text + 'E0'
                    : colors.backgroundSecondary,
                },
              ]}
              onPress={() => handlePillPress(pill.key)}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  {
                    color: isActive ? colors.background : colors.textSecondary,
                  },
                ]}
              >
                {pill.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {showOverview ? (
          <>
            {/* Block 2: Executive Snapshot */}
            <ExecutiveSnapshot colors={colors} />

            {/* Block 3: Today Timeline */}
            <TimelineSection colors={colors} />

            {/* Block 4: Command Panels */}
            <CommandPanels colors={colors} />

            {/* Block 5: Participants & Teams */}
            <ParticipantsBlock colors={colors} />

            {/* Block 6: Incidents & Requests */}
            <IncidentsRequestsBlock colors={colors} />

            {/* CEO Top 5 */}
            <CEOTop5Strip colors={colors} />
          </>
        ) : (
          <>
            {activePill === 'readiness' && <ReadinessSection colors={colors} />}
            {activePill === 'incidents' && <IncidentsSection colors={colors} />}
            {activePill === 'approvals' && <ApprovalsSection colors={colors} />}
            {activePill === 'bulletins' && <BulletinsSection colors={colors} />}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ---------------------------------------------------------------------------
  // Top Bar
  // ---------------------------------------------------------------------------
  topBar: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBarEvent: {
    fontSize: 16,
    fontWeight: '700',
  },
  modeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  topBarCountdown: {
    fontSize: 13,
    marginTop: 4,
  },

  // ---------------------------------------------------------------------------
  // CEO Top 5
  // ---------------------------------------------------------------------------
  top5Container: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: 8,
  },
  top5Row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  top5Rank: {
    fontSize: 24,
    fontWeight: '800',
    width: 28,
    textAlign: 'center',
  },
  top5Info: {
    flex: 1,
  },
  top5Title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  top5Owner: {
    fontSize: 12,
    marginBottom: 2,
  },
  top5Unblock: {
    fontSize: 12,
    fontStyle: 'italic',
  },

  // ---------------------------------------------------------------------------
  // Pill Nav
  // ---------------------------------------------------------------------------
  pillRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: 6,
  },
  pill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 18,
    alignItems: 'center',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ---------------------------------------------------------------------------
  // ScrollView
  // ---------------------------------------------------------------------------
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 120,
    gap: 12,
  },

  // ---------------------------------------------------------------------------
  // Cards
  // ---------------------------------------------------------------------------
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 13,
    lineHeight: 18,
  },

  // ---------------------------------------------------------------------------
  // Shared Badge
  // ---------------------------------------------------------------------------
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // ---------------------------------------------------------------------------
  // Shared Stats Row
  // ---------------------------------------------------------------------------
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // ---------------------------------------------------------------------------
  // Timeline
  // ---------------------------------------------------------------------------
  timelineNode: {
    flexDirection: 'row',
    minHeight: 72,
  },
  timelineTimeCol: {
    width: 90,
    paddingTop: 2,
    paddingRight: 8,
  },
  timelineTime: {
    fontSize: 12,
    fontWeight: '600',
  },
  timelineTimeEnd: {
    fontSize: 11,
    marginTop: 2,
  },
  timelineCenterCol: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineInfoCol: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 16,
  },
  timelineSessionName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  timelineWeather: {
    fontSize: 12,
    marginTop: 2,
  },

  // ---------------------------------------------------------------------------
  // Readiness
  // ---------------------------------------------------------------------------
  readinessTeamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  teamBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  readinessTeamInfo: {
    flex: 1,
  },
  readinessTeamName: {
    fontSize: 15,
    fontWeight: '700',
  },
  readyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  readyBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  readinessChecks: {
    gap: 8,
  },
  readinessCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readinessCheckLabel: {
    fontSize: 13,
  },

  // ---------------------------------------------------------------------------
  // Incidents
  // ---------------------------------------------------------------------------
  incidentTopRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  incidentLapTime: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  incidentDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },
  incidentDriversRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  driverTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  driverTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  incidentDecision: {
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },

  // ---------------------------------------------------------------------------
  // Approvals
  // ---------------------------------------------------------------------------
  approvalTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  approvalBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  approvalMeta: {
    fontSize: 12,
    marginBottom: 4,
  },
  approvalAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 8,
  },
  approvalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  approveButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  denyButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // ---------------------------------------------------------------------------
  // Bulletins
  // ---------------------------------------------------------------------------
  bulletinCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  bulletinTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  bulletinBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  bulletinMeta: {
    fontSize: 12,
    marginBottom: 6,
  },
  bulletinSummary: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },
  bulletinAudience: {
    fontSize: 12,
    fontStyle: 'italic',
  },

  // ---------------------------------------------------------------------------
  // Executive Snapshot (Block 2)
  // ---------------------------------------------------------------------------
  snapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  snapCell: {
    width: '33.33%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  snapValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  snapLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  blockersList: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#A1A1AA30',
    gap: 6,
  },
  blockersListTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  blockerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  blockerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  blockerItemText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  blockerItemDeadline: {
    fontSize: 11,
  },

  // ---------------------------------------------------------------------------
  // Command Panels (Block 4)
  // ---------------------------------------------------------------------------
  commandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  commandTile: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  commandTileTitle: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  commandCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
  },
  commandCountText: {
    fontSize: 11,
    fontWeight: '800',
  },

  // ---------------------------------------------------------------------------
  // Participants Block (Block 5)
  // ---------------------------------------------------------------------------
  entrantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  entrantDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  entrantInfo: {
    flex: 1,
  },
  entrantName: {
    fontSize: 14,
    fontWeight: '600',
  },
  entrantMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  entrantChips: {
    flexDirection: 'row',
    gap: 4,
  },

  // ---------------------------------------------------------------------------
  // Incidents Block (Block 6)
  // ---------------------------------------------------------------------------
  incidentBlockRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  incidentBlockInfo: {
    marginBottom: 8,
  },
  incidentBlockTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  incidentBlockDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  incidentBlockMeta: {
    fontSize: 11,
  },
  incidentBlockBadges: {
    flexDirection: 'row',
    gap: 6,
  },
});
