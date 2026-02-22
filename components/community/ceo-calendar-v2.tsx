/**
 * CEO Calendar v2 — Commissioner operating calendar for Competition Mode.
 * 4 sub-pills: Agenda | Sessions | Events | Ops
 * Each pill renders a scrollable CEO-level view.
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';

import {
  CEO_NOW,
  HARD_GATES,
  AGENDA_SESSIONS,
  CEO_APPROVALS,
  RISK_WATCH,
  RUN_OF_SHOW,
  EVENT_READINESS_MAP,
  COMMAND_ITEMS,
  BOARD_ITEMS,
  OPS_APPROVALS,
  LIVE_LOG,
  OPS_SUBVIEW_TABS,
  GATE_STATUS_COLOR,
  LIVE_STATE_COLOR,
  LIVE_STATE_LABEL,
  READINESS_COLOR,
  SEVERITY_COLOR,
  APPROVAL_CATEGORY_COLOR,
  BOARD_CATEGORY_COLOR,
  BOARD_PRIORITY_COLOR,
} from '@/data/mock-ceo-competition';
import type {
  OpsSubview,
  GateStatus,
  SessionLiveState,
} from '@/data/mock-ceo-competition';

// =============================================================================
// TYPES
// =============================================================================


const ACCENT = MODE_ACCENT.competition;
interface Props {
  colors: typeof Colors.light;
}

type CalendarPill = 'agenda' | 'sessions' | 'events' | 'ops';

const CAL_PILLS: { key: CalendarPill; label: string }[] = [
  { key: 'agenda', label: 'Agenda' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'events', label: 'Events' },
  { key: 'ops', label: 'Ops' },
];

// =============================================================================
// SHARED SUB-COMPONENTS
// =============================================================================

function SectionHeader({ title, count, colors }: { title: string; count?: number; colors: typeof Colors.light }) {
  return (
    <View style={s.sectionHeaderRow}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>{title}</ThemedText>
      {count != null && (
        <View style={[s.countBadge, { backgroundColor: colors.backgroundTertiary }]}>
          <ThemedText style={[s.countBadgeText, { color: colors.textSecondary }]}>{count}</ThemedText>
        </View>
      )}
    </View>
  );
}

function StatusDot({ color }: { color: string }) {
  return <View style={[s.statusDot, { backgroundColor: color }]} />;
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.statusBadge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.statusBadgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// AGENDA TAB
// =============================================================================

function AgendaTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
      {/* CEO NOW */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="CEO NOW" colors={colors} />
        {CEO_NOW.map((item) => {
          const urgencyColor = SEVERITY_COLOR[item.urgency] ?? '#A1A1AA';
          return (
            <View key={item.id} style={[s.nowRow, { borderBottomColor: colors.border }]}>
              <StatusDot color={urgencyColor} />
              <View style={s.flex1}>
                <ThemedText style={[s.nowLabel, { color: colors.text }]}>{item.label}</ThemedText>
                <ThemedText style={[s.nowDetail, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.detail}
                </ThemedText>
              </View>
            </View>
          );
        })}
      </View>

      {/* Hard Gates */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Hard Gates" count={HARD_GATES.length} colors={colors} />
        {HARD_GATES.map((gate) => {
          const gateColor = GATE_STATUS_COLOR[gate.status];
          return (
            <View key={gate.id} style={[s.gateRow, { borderBottomColor: colors.border }]}>
              <View style={s.gateHeader}>
                <StatusDot color={gateColor} />
                <ThemedText style={[s.gateTitle, { color: colors.text }]} numberOfLines={1}>{gate.title}</ThemedText>
                <StatusBadge label={gate.status.replace(/_/g, ' ').toUpperCase()} color={gateColor} />
              </View>
              <ThemedText style={[s.gateMeta, { color: colors.textTertiary }]}>
                {gate.owner} · Deadline: {gate.deadline}
              </ThemedText>
              <ThemedText style={[s.gateConsequence, { color: colors.textSecondary }]} numberOfLines={2}>
                {gate.consequence}
              </ThemedText>
            </View>
          );
        })}
      </View>

      {/* Sessions Today */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Sessions Today" count={AGENDA_SESSIONS.length} colors={colors} />
        {AGENDA_SESSIONS.map((session) => {
          const stateColor = LIVE_STATE_COLOR[session.liveState];
          return (
            <View key={session.id} style={[s.sessionRow, { borderBottomColor: colors.border }]}>
              <ThemedText style={[s.sessionTime, { color: stateColor }]}>{session.time}</ThemedText>
              <View style={s.flex1}>
                <ThemedText style={[s.sessionName, { color: colors.text }]}>{session.name}</ThemedText>
                <ThemedText style={[s.sessionTrack, { color: colors.textTertiary }]}>{session.track}</ThemedText>
              </View>
              <StatusBadge label={LIVE_STATE_LABEL[session.liveState]} color={stateColor} />
            </View>
          );
        })}
      </View>

      {/* Approvals Due */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Approvals Due" count={CEO_APPROVALS.filter((a) => a.status === 'pending').length} colors={colors} />
        {CEO_APPROVALS.filter((a) => a.status === 'pending').map((approval) => {
          const catColor = APPROVAL_CATEGORY_COLOR[approval.category] ?? '#A1A1AA';
          const urgencyColor = SEVERITY_COLOR[approval.urgency] ?? '#A1A1AA';
          return (
            <View key={approval.id} style={[s.approvalRow, { borderBottomColor: colors.border }]}>
              <StatusDot color={urgencyColor} />
              <View style={s.flex1}>
                <ThemedText style={[s.approvalTitle, { color: colors.text }]} numberOfLines={2}>{approval.title}</ThemedText>
                <View style={s.approvalMetaRow}>
                  <ThemedText style={[s.approvalMeta, { color: colors.textTertiary }]}>
                    {approval.requestedBy} · {approval.requestDate}
                  </ThemedText>
                  {approval.amount && (
                    <ThemedText style={[s.approvalAmount, { color: colors.text }]}>{approval.amount}</ThemedText>
                  )}
                </View>
              </View>
              <StatusBadge label={approval.category.toUpperCase()} color={catColor} />
            </View>
          );
        })}
      </View>

      {/* Risk Watch */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Risk Watch" count={RISK_WATCH.length} colors={colors} />
        {RISK_WATCH.map((risk) => {
          const riskColor = SEVERITY_COLOR[risk.riskLevel] ?? '#A1A1AA';
          return (
            <View key={risk.id} style={[s.riskRow, { borderBottomColor: colors.border }]}>
              <View style={s.riskHeader}>
                <StatusDot color={riskColor} />
                <ThemedText style={[s.riskTitle, { color: colors.text }]} numberOfLines={1}>{risk.title}</ThemedText>
                <StatusBadge label={risk.riskLevel.toUpperCase()} color={riskColor} />
              </View>
              <ThemedText style={[s.riskDetail, { color: colors.textSecondary }]} numberOfLines={3}>
                {risk.detail}
              </ThemedText>
              <ThemedText style={[s.riskMitigation, { color: colors.textTertiary }]} numberOfLines={2}>
                Mitigation: {risk.mitigationPlan}
              </ThemedText>
              <ThemedText style={[s.riskOwner, { color: colors.textTertiary }]}>
                Owner: {risk.owner}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// SESSIONS TAB (Run-of-Show)
// =============================================================================

function SessionsTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
      {RUN_OF_SHOW.map((session) => {
        const stateColor = LIVE_STATE_COLOR[session.liveState];
        const clearedGates = session.gates.filter((g) => g.status === 'cleared').length;
        const totalGates = session.gates.length;

        return (
          <View key={session.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Session header */}
            <View style={s.rosHeader}>
              <View style={s.flex1}>
                <View style={s.rosNameRow}>
                  <ThemedText style={[s.rosName, { color: colors.text }]}>{session.name}</ThemedText>
                  <StatusBadge label={LIVE_STATE_LABEL[session.liveState]} color={stateColor} />
                </View>
                <ThemedText style={[s.rosTimes, { color: colors.textSecondary }]}>
                  {session.startTime} – {session.endTime}
                </ThemedText>
                <ThemedText style={[s.rosTrack, { color: colors.textTertiary }]}>
                  {session.track}
                </ThemedText>
              </View>
            </View>

            {/* Gate progress */}
            <View style={[s.gateProgressRow, { borderTopColor: colors.border }]}>
              <ThemedText style={[s.gateProgressLabel, { color: colors.textSecondary }]}>
                Gates: {clearedGates}/{totalGates}
              </ThemedText>
              <View style={[s.gateProgressBar, { backgroundColor: colors.backgroundTertiary }]}>
                <View
                  style={[
                    s.gateProgressFill,
                    {
                      backgroundColor: clearedGates === totalGates ? '#22C55E' : '#F59E0B',
                      width: `${totalGates > 0 ? (clearedGates / totalGates) * 100 : 0}%`,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Individual gates */}
            {session.gates.map((gate) => {
              const gColor = GATE_STATUS_COLOR[gate.status];
              return (
                <View key={gate.id} style={[s.gateItem, { borderBottomColor: colors.border }]}>
                  <StatusDot color={gColor} />
                  <View style={s.flex1}>
                    <ThemedText style={[s.gateItemLabel, { color: colors.text }]}>{gate.label}</ThemedText>
                    <ThemedText style={[s.gateItemMeta, { color: colors.textTertiary }]}>
                      {gate.owner} · {gate.time}
                    </ThemedText>
                  </View>
                  <StatusBadge label={gate.status.replace(/_/g, ' ').toUpperCase()} color={gColor} />
                </View>
              );
            })}

            {/* Notes */}
            {session.notes && (
              <View style={[s.rosNoteRow, { borderTopColor: colors.border }]}>
                <ThemedText style={[s.rosNote, { color: '#EF4444' }]}>
                  {session.notes}
                </ThemedText>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// EVENTS TAB (Season Map + Readiness)
// =============================================================================

function EventsTab({ colors }: { colors: typeof Colors.light }) {
  const completed = EVENT_READINESS_MAP.filter((e) => e.status === 'completed');
  const liveOrUpcoming = EVENT_READINESS_MAP.filter((e) => e.status !== 'completed');

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
      {/* Season progress */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Season Progress" colors={colors} />
        <View style={s.seasonProgressRow}>
          <View style={s.seasonStat}>
            <ThemedText style={[s.seasonStatValue, { color: '#22C55E' }]}>{completed.length}</ThemedText>
            <ThemedText style={[s.seasonStatLabel, { color: colors.textTertiary }]}>Completed</ThemedText>
          </View>
          <View style={s.seasonStat}>
            <ThemedText style={[s.seasonStatValue, { color: '#F59E0B' }]}>
              {liveOrUpcoming.filter((e) => e.status === 'live').length}
            </ThemedText>
            <ThemedText style={[s.seasonStatLabel, { color: colors.textTertiary }]}>Live</ThemedText>
          </View>
          <View style={s.seasonStat}>
            <ThemedText style={[s.seasonStatValue, { color: ACCENT }]}>
              {liveOrUpcoming.filter((e) => e.status === 'upcoming').length}
            </ThemedText>
            <ThemedText style={[s.seasonStatLabel, { color: colors.textTertiary }]}>Upcoming</ThemedText>
          </View>
        </View>
        <View style={[s.seasonBarContainer, { backgroundColor: colors.backgroundTertiary }]}>
          <View style={[s.seasonBarFill, { width: `${(completed.length / EVENT_READINESS_MAP.length) * 100}%`, backgroundColor: '#22C55E' }]} />
        </View>
      </View>

      {/* Live & Upcoming events */}
      {liveOrUpcoming.length > 0 && (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SectionHeader title="Active & Upcoming" count={liveOrUpcoming.length} colors={colors} />
          {liveOrUpcoming.map((event) => {
            const readyColor = READINESS_COLOR[event.readiness];
            return (
              <View key={event.id} style={[s.eventReadinessRow, { borderBottomColor: colors.border }]}>
                <View style={s.eventReadinessHeader}>
                  <View style={s.flex1}>
                    <ThemedText style={[s.eventName, { color: colors.text }]}>{event.eventName}</ThemedText>
                    <ThemedText style={[s.eventVenue, { color: colors.textTertiary }]}>
                      {event.date} · {event.venue}, {event.location}
                    </ThemedText>
                  </View>
                  <View style={s.readinessScoreContainer}>
                    <ThemedText style={[s.readinessScore, { color: readyColor }]}>{event.readinessScore}</ThemedText>
                    <ThemedText style={[s.readinessLabel, { color: colors.textTertiary }]}>Ready</ThemedText>
                  </View>
                </View>
                {/* Readiness bars */}
                <View style={s.readinessBreakdown}>
                  {[
                    { label: 'Ops', value: event.opsReadiness },
                    { label: 'Compliance', value: event.complianceReadiness },
                    { label: 'Revenue', value: event.revenueReadiness },
                    { label: 'Broadcast', value: event.broadcastReadiness },
                  ].map((r) => (
                    <View key={r.label} style={s.readinessBarRow}>
                      <ThemedText style={[s.readinessBarLabel, { color: colors.textTertiary }]}>{r.label}</ThemedText>
                      <View style={[s.readinessBar, { backgroundColor: colors.backgroundTertiary }]}>
                        <View
                          style={[
                            s.readinessBarFill,
                            {
                              width: `${r.value}%`,
                              backgroundColor: r.value >= 90 ? '#22C55E' : r.value >= 70 ? '#F59E0B' : '#EF4444',
                            },
                          ]}
                        />
                      </View>
                      <ThemedText style={[s.readinessBarValue, { color: colors.textSecondary }]}>{r.value}%</ThemedText>
                    </View>
                  ))}
                </View>
                {/* Ticket + Sponsor line */}
                {event.ticketsSold != null && event.ticketsCapacity != null && (
                  <ThemedText style={[s.eventTicketLine, { color: colors.textTertiary }]}>
                    Tickets: {event.ticketsSold.toLocaleString()}/{event.ticketsCapacity.toLocaleString()} · {event.sponsorActivations} sponsor activations
                  </ThemedText>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Completed events */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Completed" count={completed.length} colors={colors} />
        {completed.map((event) => (
          <View key={event.id} style={[s.completedEventRow, { borderBottomColor: colors.border }]}>
            <View style={s.flex1}>
              <ThemedText style={[s.eventName, { color: colors.text }]}>{event.eventName}</ThemedText>
              <ThemedText style={[s.eventVenue, { color: colors.textTertiary }]}>
                {event.date} · {event.venue}
              </ThemedText>
            </View>
            <View style={s.completedScoreContainer}>
              <ThemedText style={[s.readinessScore, { color: '#22C55E' }]}>{event.readinessScore}</ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// OPS TAB (4 Subviews)
// =============================================================================

function OpsTab({ colors }: { colors: typeof Colors.light }) {
  const [activeSubview, setActiveSubview] = useState<OpsSubview>('command');

  return (
    <View style={s.flex1}>
      {/* Inner pill nav */}
      <View style={s.opsSubviewRow}>
        {OPS_SUBVIEW_TABS.map((tab) => {
          const isActive = activeSubview === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[s.opsSubviewPill, { backgroundColor: isActive ? colors.text + 'E0' : colors.backgroundTertiary }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveSubview(tab.key); }}
            >
              <ThemedText style={[s.opsSubviewText, { color: isActive ? colors.background : colors.textSecondary }]}>
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {activeSubview === 'command' && <CommandView colors={colors} />}
        {activeSubview === 'board' && <BoardView colors={colors} />}
        {activeSubview === 'approvals' && <ApprovalsView colors={colors} />}
        {activeSubview === 'live_log' && <LiveLogView colors={colors} />}
      </ScrollView>
    </View>
  );
}

function CommandView({ colors }: { colors: typeof Colors.light }) {
  const redCount = COMMAND_ITEMS.filter((c) => c.status === 'red').length;
  const yellowCount = COMMAND_ITEMS.filter((c) => c.status === 'yellow').length;
  const greenCount = COMMAND_ITEMS.filter((c) => c.status === 'green').length;

  return (
    <>
      {/* Summary strip */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Command Center" colors={colors} />
        <View style={s.commandSummary}>
          <View style={s.commandStat}>
            <ThemedText style={[s.commandStatValue, { color: '#22C55E' }]}>{greenCount}</ThemedText>
            <ThemedText style={[s.commandStatLabel, { color: colors.textTertiary }]}>Green</ThemedText>
          </View>
          <View style={s.commandStat}>
            <ThemedText style={[s.commandStatValue, { color: '#F59E0B' }]}>{yellowCount}</ThemedText>
            <ThemedText style={[s.commandStatLabel, { color: colors.textTertiary }]}>Yellow</ThemedText>
          </View>
          <View style={s.commandStat}>
            <ThemedText style={[s.commandStatValue, { color: '#EF4444' }]}>{redCount}</ThemedText>
            <ThemedText style={[s.commandStatLabel, { color: colors.textTertiary }]}>Red</ThemedText>
          </View>
        </View>
      </View>

      {/* Status board */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {COMMAND_ITEMS.map((item) => {
          const statusColor = item.status === 'green' ? '#22C55E' : item.status === 'yellow' ? '#F59E0B' : '#EF4444';
          return (
            <View key={item.id} style={[s.commandRow, { borderBottomColor: colors.border }]}>
              <StatusDot color={statusColor} />
              <View style={s.flex1}>
                <View style={s.commandNameRow}>
                  <ThemedText style={[s.commandArea, { color: colors.text }]}>{item.area}</ThemedText>
                  <ThemedText style={[s.commandLabel, { color: statusColor }]}>{item.label}</ThemedText>
                </View>
                <ThemedText style={[s.commandDetail, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.detail}
                </ThemedText>
                <ThemedText style={[s.commandOwner, { color: colors.textTertiary }]}>
                  {item.owner}
                </ThemedText>
              </View>
            </View>
          );
        })}
      </View>
    </>
  );
}

function BoardView({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <SectionHeader title="Executive Board" count={BOARD_ITEMS.length} colors={colors} />
      {BOARD_ITEMS.map((item) => {
        const catColor = BOARD_CATEGORY_COLOR[item.category] ?? '#A1A1AA';
        const priColor = BOARD_PRIORITY_COLOR[item.priority] ?? '#A1A1AA';
        const statusColor = item.status === 'completed' ? '#22C55E' : item.status === 'in_progress' ? '#F59E0B' : item.status === 'deferred' ? '#A1A1AA' : ACCENT;
        return (
          <View key={item.id} style={[s.boardRow, { borderBottomColor: colors.border }]}>
            <StatusDot color={priColor} />
            <View style={s.flex1}>
              <ThemedText style={[s.boardTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</ThemedText>
              <View style={s.boardMetaRow}>
                <StatusBadge label={item.category.replace(/_/g, ' ').toUpperCase()} color={catColor} />
                <StatusBadge label={item.status.replace(/_/g, ' ').toUpperCase()} color={statusColor} />
              </View>
              <ThemedText style={[s.boardMeta, { color: colors.textTertiary }]}>
                {item.assignee} · Due {item.dueDate}
              </ThemedText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function ApprovalsView({ colors }: { colors: typeof Colors.light }) {
  const pending = OPS_APPROVALS.filter((a) => a.status === 'pending');
  const resolved = OPS_APPROVALS.filter((a) => a.status !== 'pending');

  return (
    <>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Pending Approvals" count={pending.length} colors={colors} />
        {pending.map((item) => {
          const catColor = APPROVAL_CATEGORY_COLOR[item.category] ?? '#A1A1AA';
          return (
            <View key={item.id} style={[s.opsApprovalRow, { borderBottomColor: colors.border }]}>
              <View style={s.flex1}>
                <ThemedText style={[s.opsApprovalTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</ThemedText>
                <ThemedText style={[s.opsApprovalMeta, { color: colors.textTertiary }]}>
                  {item.requestedBy} · {item.submittedAt}
                  {item.amount ? ` · ${item.amount}` : ''}
                </ThemedText>
              </View>
              <StatusBadge label={item.category} color={catColor} />
              <View style={s.approvalActions}>
                <Pressable
                  style={[s.approveBtn, { backgroundColor: '#22C55E20' }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  <ThemedText style={[s.approveBtnText, { color: '#22C55E' }]}>Approve</ThemedText>
                </Pressable>
                <Pressable
                  style={[s.denyBtn, { backgroundColor: '#EF444420' }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  <ThemedText style={[s.denyBtnText, { color: '#EF4444' }]}>Deny</ThemedText>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      {resolved.length > 0 && (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SectionHeader title="Recently Resolved" count={resolved.length} colors={colors} />
          {resolved.map((item) => {
            const catColor = APPROVAL_CATEGORY_COLOR[item.category] ?? '#A1A1AA';
            return (
              <View key={item.id} style={[s.opsApprovalRow, { borderBottomColor: colors.border }]}>
                <View style={s.flex1}>
                  <ThemedText style={[s.opsApprovalTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</ThemedText>
                  <ThemedText style={[s.opsApprovalMeta, { color: colors.textTertiary }]}>
                    {item.requestedBy} · {item.submittedAt}
                  </ThemedText>
                </View>
                <StatusBadge label={item.status.toUpperCase()} color={item.status === 'approved' ? '#22C55E' : '#EF4444'} />
              </View>
            );
          })}
        </View>
      )}
    </>
  );
}

function LiveLogView({ colors }: { colors: typeof Colors.light }) {
  const unacknowledgedCount = LIVE_LOG.filter((e) => !e.acknowledged).length;

  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <SectionHeader title="Live Operations Log" count={LIVE_LOG.length} colors={colors} />
      {unacknowledgedCount > 0 && (
        <View style={[s.unacknowledgedBanner, { backgroundColor: '#EF444415' }]}>
          <ThemedText style={[s.unacknowledgedText, { color: '#EF4444' }]}>
            {unacknowledgedCount} unacknowledged {unacknowledgedCount === 1 ? 'entry' : 'entries'}
          </ThemedText>
        </View>
      )}
      {LIVE_LOG.map((entry) => {
        const sevColor = SEVERITY_COLOR[entry.severity] ?? '#A1A1AA';
        return (
          <View
            key={entry.id}
            style={[
              s.logRow,
              { borderBottomColor: colors.border },
              !entry.acknowledged && { backgroundColor: sevColor + '08' },
            ]}
          >
            <View style={s.logTimeCol}>
              <ThemedText style={[s.logTime, { color: sevColor }]}>{entry.timestamp}</ThemedText>
            </View>
            <StatusDot color={sevColor} />
            <View style={s.flex1}>
              <ThemedText style={[s.logSource, { color: colors.textSecondary }]}>{entry.source}</ThemedText>
              <ThemedText style={[s.logMessage, { color: colors.text }]} numberOfLines={3}>
                {entry.message}
              </ThemedText>
            </View>
            {!entry.acknowledged && (
              <Pressable
                style={[s.ackBtn, { backgroundColor: colors.backgroundTertiary }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <ThemedText style={[s.ackBtnText, { color: colors.textSecondary }]}>ACK</ThemedText>
              </Pressable>
            )}
          </View>
        );
      })}
    </View>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function CEOCalendarV2({ colors }: Props) {
  const [activePill, setActivePill] = useState<CalendarPill>('agenda');

  return (
    <View style={s.flex1}>
      {/* Pill nav */}
      <View style={s.pillRow}>
        {CAL_PILLS.map((pill) => {
          const isActive = activePill === pill.key;
          return (
            <Pressable
              key={pill.key}
              style={[s.pill, { backgroundColor: isActive ? colors.text + 'E0' : colors.backgroundSecondary }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActivePill(pill.key); }}
            >
              <ThemedText style={[s.pillText, { color: isActive ? colors.background : colors.textSecondary }]}>
                {pill.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      {activePill === 'agenda' && <AgendaTab colors={colors} />}
      {activePill === 'sessions' && <SessionsTab colors={colors} />}
      {activePill === 'events' && <EventsTab colors={colors} />}
      {activePill === 'ops' && <OpsTab colors={colors} />}
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  flex1: { flex: 1 },

  // Pill nav
  pillRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: 16, gap: 6 },
  pill: { flex: 1, paddingVertical: 6, borderRadius: 18, alignItems: 'center' },
  pillText: { fontSize: 13, fontWeight: '600' },

  // Scroll
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: 0, paddingBottom: 120, gap: 12 },

  // Card
  card: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md },

  // Section header
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  countBadgeText: { fontSize: 12, fontWeight: '700' },

  // Shared
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  statusBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },

  // CEO NOW
  nowRow: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  nowLabel: { fontSize: 14, fontWeight: '600' },
  nowDetail: { fontSize: 13, marginTop: 2, lineHeight: 18 },

  // Hard Gates
  gateRow: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  gateHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gateTitle: { flex: 1, fontSize: 14, fontWeight: '600' },
  gateMeta: { fontSize: 12, marginTop: 4 },
  gateConsequence: { fontSize: 12, marginTop: 3, fontStyle: 'italic', lineHeight: 17 },

  // Sessions
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  sessionTime: { fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums' as const], width: 70 },
  sessionName: { fontSize: 14, fontWeight: '600' },
  sessionTrack: { fontSize: 12, marginTop: 1 },

  // Approvals
  approvalRow: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  approvalTitle: { fontSize: 14, fontWeight: '600' },
  approvalMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  approvalMeta: { fontSize: 12 },
  approvalAmount: { fontSize: 13, fontWeight: '700' },

  // Risk Watch
  riskRow: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  riskHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  riskTitle: { flex: 1, fontSize: 14, fontWeight: '600' },
  riskDetail: { fontSize: 13, marginTop: 6, lineHeight: 18 },
  riskMitigation: { fontSize: 12, marginTop: 4, lineHeight: 17 },
  riskOwner: { fontSize: 12, marginTop: 3 },

  // Run-of-Show (Sessions tab)
  rosHeader: { flexDirection: 'row' },
  rosNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  rosName: { fontSize: 15, fontWeight: '700' },
  rosTimes: { fontSize: 13, marginTop: 3 },
  rosTrack: { fontSize: 12, marginTop: 2 },

  gateProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 10, marginTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  gateProgressLabel: { fontSize: 12, fontWeight: '600', width: 64 },
  gateProgressBar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  gateProgressFill: { height: 6, borderRadius: 3 },

  gateItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  gateItemLabel: { fontSize: 13, fontWeight: '500' },
  gateItemMeta: { fontSize: 11, marginTop: 1 },

  rosNoteRow: { paddingTop: 8, marginTop: 4, borderTopWidth: StyleSheet.hairlineWidth },
  rosNote: { fontSize: 12, fontStyle: 'italic' },

  // Events tab
  seasonProgressRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  seasonStat: { alignItems: 'center' },
  seasonStatValue: { fontSize: 24, fontWeight: '800' },
  seasonStatLabel: { fontSize: 11, marginTop: 2 },
  seasonBarContainer: { height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 8 },
  seasonBarFill: { height: 8, borderRadius: 4 },

  eventReadinessRow: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  eventReadinessHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  eventName: { fontSize: 15, fontWeight: '600' },
  eventVenue: { fontSize: 12, marginTop: 2 },
  readinessScoreContainer: { alignItems: 'center', marginLeft: 12 },
  readinessScore: { fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums' as const] },
  readinessLabel: { fontSize: 10, marginTop: 1 },
  readinessBreakdown: { marginTop: 10, gap: 6 },
  readinessBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  readinessBarLabel: { fontSize: 11, width: 72 },
  readinessBar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  readinessBarFill: { height: 6, borderRadius: 3 },
  readinessBarValue: { fontSize: 11, fontWeight: '600', fontVariant: ['tabular-nums' as const], width: 36, textAlign: 'right' },
  eventTicketLine: { fontSize: 11, marginTop: 8 },

  completedEventRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  completedScoreContainer: { marginLeft: 12 },

  // Ops tab — inner pills
  opsSubviewRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingBottom: 8, gap: 6 },
  opsSubviewPill: { flex: 1, paddingVertical: 5, borderRadius: 14, alignItems: 'center' },
  opsSubviewText: { fontSize: 12, fontWeight: '600' },

  // Command
  commandSummary: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  commandStat: { alignItems: 'center' },
  commandStatValue: { fontSize: 24, fontWeight: '800' },
  commandStatLabel: { fontSize: 11, marginTop: 2 },
  commandRow: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  commandNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  commandArea: { fontSize: 14, fontWeight: '600' },
  commandLabel: { fontSize: 12, fontWeight: '700' },
  commandDetail: { fontSize: 13, marginTop: 3, lineHeight: 18 },
  commandOwner: { fontSize: 11, marginTop: 3 },

  // Board
  boardRow: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  boardTitle: { fontSize: 14, fontWeight: '600' },
  boardMetaRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  boardMeta: { fontSize: 12, marginTop: 4 },

  // Ops Approvals
  opsApprovalRow: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  opsApprovalTitle: { fontSize: 14, fontWeight: '600' },
  opsApprovalMeta: { fontSize: 12, marginTop: 4 },
  approvalActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  approveBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: BorderRadius.md },
  approveBtnText: { fontSize: 13, fontWeight: '600' },
  denyBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: BorderRadius.md },
  denyBtnText: { fontSize: 13, fontWeight: '600' },

  // Live Log
  unacknowledgedBanner: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginBottom: 8 },
  unacknowledgedText: { fontSize: 12, fontWeight: '700' },
  logRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  logTimeCol: { width: 62 },
  logTime: { fontSize: 11, fontWeight: '700', fontVariant: ['tabular-nums' as const] },
  logSource: { fontSize: 11, fontWeight: '600' },
  logMessage: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  ackBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'center' },
  ackBtnText: { fontSize: 10, fontWeight: '700' },
});
