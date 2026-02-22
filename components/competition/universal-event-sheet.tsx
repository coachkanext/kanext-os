/**
 * Universal Event Sheet — Content component for Competition Mode event detail.
 * Renders Event header + 8 RBAC-gated tabs:
 * Agenda | Sessions | Ops | Live Control | Results | Incidents | Payouts | Media Deliverables
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

import type {
  EventObject,
  EventSession,
  EventIncident,
  PayoutItem,
  SponsorDeliverable,
  OpsTask,
  SessionType,
  SessionStatus,
  IncidentStatus,
  PayoutStatus,
  DeliverableStatus,
} from '@/data/mock-competition-v2';
import {
  getSessionsByEvent,
  getIncidentsByEvent,
  PAYOUT_ITEMS,
  SPONSOR_DELIVERABLES,
  OPS_TASKS,
} from '@/data/mock-competition-v2';
import {

  type CompetitionRoleLens,
  type EventTab,
  getEventSheetTabs,
  isFullAccess,
} from '@/utils/competition-rbac';

const ACCENT = MODE_ACCENT.competition;

// =============================================================================
// PROPS
// =============================================================================

interface UniversalEventSheetProps {
  event: EventObject;
  roleLens: CompetitionRoleLens;
  onClose: () => void;
  onSelectEntrant?: (id: string) => void;
}

// =============================================================================
// STATUS HELPERS
// =============================================================================

function getStatusColor(status: 'upcoming' | 'live' | 'completed'): string {
  switch (status) {
    case 'live': return '#22C55E';
    case 'completed': return '#A1A1AA';
    case 'upcoming': return ACCENT;
  }
}

function getStatusLabel(status: 'upcoming' | 'live' | 'completed'): string {
  switch (status) {
    case 'live': return 'Live';
    case 'completed': return 'Completed';
    case 'upcoming': return 'Upcoming';
  }
}

function getSessionTypeIcon(type: SessionType): string {
  switch (type) {
    case 'practice': return 'sportscourt';
    case 'qualifying': return 'timer';
    case 'main': return 'flag.fill';
    case 'media': return 'video.fill';
    case 'tech': return 'gearshape';
    case 'ceremony': return 'star.fill';
    case 'wildcard': return 'star.circle.fill';
    default: return 'calendar';
  }
}

function getSessionStatusColor(status: SessionStatus): string {
  switch (status) {
    case 'live': return '#22C55E';
    case 'delayed': return '#F59E0B';
    case 'red_flag': return '#EF4444';
    case 'complete': return '#A1A1AA';
    case 'scheduled': return ACCENT;
    default: return '#A1A1AA';
  }
}

function getSessionStatusLabel(status: SessionStatus): string {
  switch (status) {
    case 'live': return 'LIVE';
    case 'delayed': return 'DELAYED';
    case 'red_flag': return 'RED FLAG';
    case 'complete': return 'Complete';
    case 'scheduled': return 'Scheduled';
    default: return status;
  }
}

function getIncidentStatusColor(status: IncidentStatus): string {
  switch (status) {
    case 'new': return ACCENT;
    case 'assigned': return '#F59E0B';
    case 'under_review': return '#F59E0B';
    case 'decided': return '#22C55E';
    case 'closed': return '#A1A1AA';
    default: return '#A1A1AA';
  }
}

function getPayoutStatusColor(status: PayoutStatus): string {
  switch (status) {
    case 'released': return '#22C55E';
    case 'hold': return '#EF4444';
    case 'pending': return '#F59E0B';
    case 'locked': return '#A1A1AA';
    default: return '#A1A1AA';
  }
}

function getDeliverableStatusColor(status: DeliverableStatus): string {
  switch (status) {
    case 'on_track': return '#22C55E';
    case 'at_risk': return '#F59E0B';
    case 'overdue': return '#EF4444';
    case 'delivered': return '#A1A1AA';
    default: return '#A1A1AA';
  }
}

function getDeliverableStatusLabel(status: DeliverableStatus): string {
  switch (status) {
    case 'on_track': return 'On Track';
    case 'at_risk': return 'At Risk';
    case 'overdue': return 'Overdue';
    case 'delivered': return 'Delivered';
    default: return status;
  }
}

// =============================================================================
// OPS CATEGORIES
// =============================================================================

const OPS_CATEGORIES = [
  { key: 'Venue', icon: 'mappin.and.ellipse' },
  { key: 'Safety', icon: 'shield.fill' },
  { key: 'Officials', icon: 'person.badge.shield.checkmark.fill' },
  { key: 'Tech', icon: 'gearshape' },
  { key: 'Broadcast', icon: 'video.fill' },
  { key: 'Sponsor', icon: 'building.2.fill' },
] as const;

// =============================================================================
// LIVE CONTROL CHECKLIST (mock)
// =============================================================================

const LIVE_CONTROL_ITEMS = [
  { id: 'lc-1', label: 'Session Start Lock', status: 'cleared' as const, owner: 'Race Director' },
  { id: 'lc-2', label: 'Result Lock — Provisional', status: 'pending' as const, owner: 'Chief Steward' },
  { id: 'lc-3', label: 'Incident Routing Active', status: 'cleared' as const, owner: 'Chief Steward' },
  { id: 'lc-4', label: 'Broadcast "Go Live" Checklist', status: 'pending' as const, owner: 'Broadcast Producer' },
  { id: 'lc-5', label: 'Safety Car Deployment Ready', status: 'cleared' as const, owner: 'Safety Director' },
  { id: 'lc-6', label: 'Fire Suppression Active', status: 'pending' as const, owner: 'Safety Director' },
];

// =============================================================================
// MOCK RESULTS DATA
// =============================================================================

const MOCK_RESULTS = [
  { entrantId: 'ent-1', name: 'Apex Racing #1', session: 'Qualifying', position: 1, gap: 'POLE', teamColor: '#EF4444' },
  { entrantId: 'ent-3', name: 'Velocity Works #3', session: 'Qualifying', position: 2, gap: '+0.234s', teamColor: ACCENT },
  { entrantId: 'ent-5', name: 'Phoenix Motorsport #5', session: 'Qualifying', position: 3, gap: '+0.512s', teamColor: '#F59E0B' },
  { entrantId: 'ent-6', name: 'Zenith Racing #6', session: 'Qualifying', position: 4, gap: '+0.718s', teamColor: '#22C55E' },
  { entrantId: 'ent-2', name: 'Apex Racing #2', session: 'Qualifying', position: 5, gap: '+0.892s', teamColor: '#EF4444' },
  { entrantId: 'ent-7', name: 'Shadow GP #7', session: 'Qualifying', position: 6, gap: '+1.103s', teamColor: ACCENT },
  { entrantId: 'ent-4', name: 'Velocity Works #4', session: 'Qualifying', position: 7, gap: '+1.324s', teamColor: ACCENT },
  { entrantId: 'ent-9', name: 'Titan Racing #9', session: 'Qualifying', position: 8, gap: '+1.567s', teamColor: ACCENT },
  { entrantId: 'ent-10', name: 'Nova Speed #10', session: 'Qualifying', position: 9, gap: '+1.801s', teamColor: ACCENT },
  { entrantId: 'ent-8', name: 'Shadow GP #8', session: 'Qualifying', position: 10, gap: '+2.045s', teamColor: ACCENT },
  { entrantId: 'ent-11', name: 'Iron Circuit #11', session: 'Qualifying', position: 11, gap: '+2.312s', teamColor: '#A1A1AA' },
  { entrantId: 'ent-12', name: 'Iron Circuit #12', session: 'Qualifying', position: 12, gap: '+2.798s', teamColor: '#A1A1AA' },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function UniversalEventSheet({
  event,
  roleLens,
  onClose,
  onSelectEntrant,
}: UniversalEventSheetProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const tabs = useMemo(() => getEventSheetTabs(roleLens), [roleLens]);
  const [activeTab, setActiveTab] = useState<EventTab>(tabs[0]?.id ?? 'agenda');
  const fullAccess = isFullAccess(roleLens);

  const sessions = useMemo(() => getSessionsByEvent(event.id), [event.id]);
  const incidents = useMemo(() => getIncidentsByEvent(event.id), [event.id]);
  const blockers = useMemo(
    () => OPS_TASKS.filter((t) => t.status === 'blocker'),
    [],
  );
  const eventDeliverables = useMemo(
    () => SPONSOR_DELIVERABLES.filter((d) => d.eventId === event.id),
    [event.id],
  );

  // Track inline-expanded sessions (Agenda tab)
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // HEADER
  // ─────────────────────────────────────────────────────────────────────────

  const renderHeader = () => {
    const statusColor = getStatusColor(event.status);
    const statusLabel = getStatusLabel(event.status);

    return (
      <View style={styles.header}>
        {/* Event Name */}
        <ThemedText style={[styles.eventName, { color: colors.text }]}>
          {event.name}
        </ThemedText>

        {/* Venue + Date */}
        <Text style={[styles.venueText, { color: colors.textSecondary }]}>
          {event.venue} {'\u00B7'} {event.location}
        </Text>
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
          {event.dateRange}
        </Text>

        {/* Status Pill + Chips */}
        <View style={styles.chipRow}>
          {/* Status */}
          <View style={[styles.statusPill, { backgroundColor: statusColor + '18' }]}>
            {event.status === 'live' && (
              <View style={[styles.liveDot, { backgroundColor: statusColor }]} />
            )}
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>

          {/* Next Session */}
          {event.nextSession ? (
            <View style={[styles.chip, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
              <IconSymbol name="timer" size={12} color={colors.textSecondary} />
              <Text style={[styles.chipText, { color: colors.text }]}>{event.nextSession}</Text>
            </View>
          ) : null}

          {/* Ops Blockers (C1/C2 only) */}
          {fullAccess && event.opsBlockers > 0 && (
            <View style={[styles.chip, { backgroundColor: '#EF444418', borderColor: '#EF444440' }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#EF4444" />
              <Text style={[styles.chipText, { color: '#EF4444' }]}>
                {event.opsBlockers} Blocker{event.opsBlockers !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          {fullAccess && (
            <>
              <Pressable
                style={[styles.actionButton, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="list.clipboard" size={14} color={colors.text} />
                <Text style={[styles.actionButtonText, { color: colors.text }]}>Open Ops Room</Text>
              </Pressable>
              <Pressable
                style={[styles.actionButton, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="plus" size={14} color={colors.text} />
                <Text style={[styles.actionButtonText, { color: colors.text }]}>Create Request</Text>
              </Pressable>
            </>
          )}
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="square.and.arrow.up" size={14} color={colors.text} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Share</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // TAB PILLS
  // ─────────────────────────────────────────────────────────────────────────

  const renderTabPills = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tabScroll}
      contentContainerStyle={styles.tabRow}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            style={[
              styles.tabPill,
              { borderColor: colors.border },
              isActive && { backgroundColor: colors.text, borderColor: colors.text },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab(tab.id);
            }}
          >
            <Text
              style={[
                styles.tabText,
                { color: colors.textSecondary },
                isActive && { color: colors.background },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // TAB 1: AGENDA
  // ─────────────────────────────────────────────────────────────────────────

  const renderAgenda = () => {
    // Group sessions by day prefix (e.g. "Fri", "Sat", "Sun")
    const dayMap = new Map<string, EventSession[]>();
    sessions.forEach((s) => {
      const day = s.startTime.split(' ')[0] ?? 'Other';
      const list = dayMap.get(day) ?? [];
      list.push(s);
      dayMap.set(day, list);
    });

    return (
      <View style={styles.tabContent}>
        <SectionLabel label="EVENT AGENDA" colors={colors} />
        {Array.from(dayMap.entries()).map(([day, daySessions]) => (
          <View key={day} style={{ marginBottom: Spacing.md }}>
            <Text style={[styles.dayLabel, { color: colors.text }]}>{day}</Text>
            {daySessions.map((session) => {
              const isExpanded = expandedSession === session.id;
              const statusCol = getSessionStatusColor(session.status);
              return (
                <Pressable
                  key={session.id}
                  style={[styles.agendaRow, { borderColor: colors.border }]}
                  onPress={() => setExpandedSession(isExpanded ? null : session.id)}
                >
                  <View style={styles.agendaTimeBlock}>
                    <Text style={[styles.agendaTime, { color: colors.textSecondary }]}>
                      {session.startTime.replace(/^\w+\s/, '')}
                    </Text>
                    <Text style={[styles.agendaTimeSep, { color: colors.textTertiary }]}> — </Text>
                    <Text style={[styles.agendaTime, { color: colors.textSecondary }]}>
                      {session.endTime.replace(/^\w+\s/, '')}
                    </Text>
                  </View>
                  <View style={styles.agendaDetail}>
                    <View style={styles.agendaNameRow}>
                      <IconSymbol
                        name={getSessionTypeIcon(session.type) as any}
                        size={14}
                        color={statusCol}
                      />
                      <Text style={[styles.agendaName, { color: colors.text }]}>{session.name}</Text>
                    </View>
                    <View style={[styles.miniPill, { backgroundColor: statusCol + '18' }]}>
                      <Text style={[styles.miniPillText, { color: statusCol }]}>
                        {getSessionStatusLabel(session.status)}
                      </Text>
                    </View>
                    {isExpanded && (
                      <View style={[styles.agendaExpanded, { borderTopColor: colors.border }]}>
                        <DetailRow label="Owner" value={session.owner} colors={colors} />
                        {session.format && <DetailRow label="Format" value={session.format} colors={colors} />}
                        {session.participantsScope && (
                          <DetailRow label="Participants" value={session.participantsScope} colors={colors} />
                        )}
                        {session.dependencies.length > 0 && (
                          <View style={{ marginTop: Spacing.xs }}>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Dependencies</Text>
                            {session.dependencies.map((dep, i) => (
                              <Text key={i} style={[styles.depItem, { color: colors.textSecondary }]}>
                                {'\u2022'} {dep}
                              </Text>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // TAB 2: SESSIONS
  // ─────────────────────────────────────────────────────────────────────────

  const renderSessions = () => (
    <View style={styles.tabContent}>
      <SectionLabel label="SESSIONS" colors={colors} />
      {sessions.map((session) => {
        const statusCol = getSessionStatusColor(session.status);
        return (
          <View key={session.id} style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sessionCardHeader}>
              <View style={styles.sessionCardLeft}>
                <View style={[styles.sessionTypeIcon, { backgroundColor: statusCol + '18' }]}>
                  <IconSymbol name={getSessionTypeIcon(session.type) as any} size={16} color={statusCol} />
                </View>
                <View>
                  <Text style={[styles.sessionCardName, { color: colors.text }]}>{session.name}</Text>
                  <Text style={[styles.sessionCardTime, { color: colors.textSecondary }]}>
                    {session.startTime} — {session.endTime}
                  </Text>
                </View>
              </View>
              <View style={[styles.miniPill, { backgroundColor: statusCol + '18' }]}>
                <Text style={[styles.miniPillText, { color: statusCol }]}>
                  {getSessionStatusLabel(session.status)}
                </Text>
              </View>
            </View>
            <View style={[styles.sessionCardBody, { borderTopColor: colors.border }]}>
              <DetailRow label="Owner" value={session.owner} colors={colors} />
              {session.format && <DetailRow label="Format" value={session.format} colors={colors} />}
              {session.dependencies.length > 0 && (
                <View style={{ marginTop: Spacing.xs }}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Dependencies</Text>
                  {session.dependencies.map((dep, i) => (
                    <View key={i} style={styles.depRow}>
                      <IconSymbol name="checkmark.circle.fill" size={12} color={colors.textTertiary} />
                      <Text style={[styles.depText, { color: colors.textSecondary }]}>{dep}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // TAB 3: OPS
  // ─────────────────────────────────────────────────────────────────────────

  const renderOps = () => {
    const isReadOnly = roleLens === 'CO3';
    return (
      <View style={styles.tabContent}>
        <SectionLabel label="OPS CHECKLISTS" colors={colors} />

        {/* Ops by Category */}
        {OPS_CATEGORIES.map((cat) => {
          const catTasks = OPS_TASKS.filter(
            (t) => t.department.toLowerCase() === cat.key.toLowerCase() ||
              (cat.key === 'Officials' && t.department === 'Compliance') ||
              (cat.key === 'Venue' && t.department === 'Event Ops'),
          );
          if (catTasks.length === 0) return null;
          return (
            <View key={cat.key} style={{ marginBottom: Spacing.md }}>
              <View style={styles.opsCatHeader}>
                <IconSymbol name={cat.icon as any} size={14} color={colors.textSecondary} />
                <Text style={[styles.opsCatTitle, { color: colors.text }]}>{cat.key}</Text>
                <Text style={[styles.opsCatCount, { color: colors.textTertiary }]}>
                  {catTasks.length} task{catTasks.length !== 1 ? 's' : ''}
                </Text>
              </View>
              {catTasks.map((task) => {
                const isBlocker = task.status === 'blocker';
                const isDone = task.status === 'done';
                return (
                  <View
                    key={task.id}
                    style={[
                      styles.opsTaskRow,
                      { borderColor: isBlocker ? '#EF444440' : colors.border },
                      isBlocker && { backgroundColor: '#EF444408' },
                    ]}
                  >
                    <View style={styles.opsTaskLeft}>
                      <IconSymbol
                        name={isDone ? 'checkmark.circle.fill' : isBlocker ? 'exclamationmark.triangle.fill' : 'circle.fill'}
                        size={14}
                        color={isDone ? '#22C55E' : isBlocker ? '#EF4444' : colors.textTertiary}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.opsTaskTitle, { color: colors.text }]}>{task.title}</Text>
                        <Text style={[styles.opsTaskMeta, { color: colors.textSecondary }]}>
                          {task.owner} {'\u00B7'} {task.deadline}
                        </Text>
                      </View>
                    </View>
                    {isBlocker && (
                      <View style={[styles.miniPill, { backgroundColor: '#EF444418' }]}>
                        <Text style={[styles.miniPillText, { color: '#EF4444' }]}>Blocker</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* Blockers List */}
        {blockers.length > 0 && (
          <>
            <SectionLabel label="BLOCKERS" colors={colors} />
            {blockers.map((b) => (
              <View key={b.id} style={[styles.blockerCard, { backgroundColor: '#EF444410', borderColor: '#EF444430' }]}>
                <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#EF4444" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.blockerTitle, { color: '#EF4444' }]}>{b.title}</Text>
                  <Text style={[styles.blockerMeta, { color: colors.textSecondary }]}>
                    {b.owner} {'\u00B7'} Due: {b.deadline}
                  </Text>
                  {b.impactFlags.length > 0 && (
                    <View style={styles.flagRow}>
                      {b.impactFlags.map((f, i) => (
                        <View key={i} style={[styles.flagChip, { backgroundColor: '#EF444418' }]}>
                          <Text style={[styles.flagText, { color: '#EF4444' }]}>{f}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </>
        )}

        {/* Action Buttons (C1/C2 only) */}
        {!isReadOnly && (
          <View style={styles.opsActions}>
            <ActionButton label="Create Ops Task" icon="plus.circle.fill" colors={colors} />
            <ActionButton label="Assign Owner" icon="person.badge.plus" colors={colors} />
            <ActionButton label="Mark Blocker" icon="exclamationmark.triangle.fill" colors={colors} accent="#EF4444" />
          </View>
        )}
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // TAB 4: LIVE CONTROL
  // ─────────────────────────────────────────────────────────────────────────

  const renderLiveControl = () => (
    <View style={styles.tabContent}>
      <SectionLabel label="LIVE CONTROL" colors={colors} />
      <Text style={[styles.liveControlSubtext, { color: colors.textSecondary }]}>
        All items must be cleared before session start or broadcast lock.
      </Text>
      {LIVE_CONTROL_ITEMS.map((item) => {
        const isCleared = item.status === 'cleared';
        return (
          <View key={item.id} style={[styles.liveControlRow, { borderColor: colors.border }]}>
            <IconSymbol
              name={isCleared ? 'checkmark.circle.fill' : 'circle.fill'}
              size={18}
              color={isCleared ? '#22C55E' : '#F59E0B'}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.liveControlLabel, { color: colors.text }]}>{item.label}</Text>
              <Text style={[styles.liveControlOwner, { color: colors.textSecondary }]}>{item.owner}</Text>
            </View>
            <View style={[styles.miniPill, { backgroundColor: isCleared ? '#22C55E18' : '#F59E0B18' }]}>
              <Text style={[styles.miniPillText, { color: isCleared ? '#22C55E' : '#F59E0B' }]}>
                {isCleared ? 'Cleared' : 'Pending'}
              </Text>
            </View>
          </View>
        );
      })}

      {/* Session Start Lock */}
      <View style={{ marginTop: Spacing.lg }}>
        <SectionLabel label="SESSION CONTROLS" colors={colors} />
        <ActionButton label="Lock Session Start" icon="lock.fill" colors={colors} />
        <View style={{ height: Spacing.sm }} />
        <ActionButton label="Lock Results (Provisional)" icon="checkmark.seal.fill" colors={colors} />
        <View style={{ height: Spacing.sm }} />
        <ActionButton label="Route Incident" icon="exclamationmark.triangle.fill" colors={colors} accent="#F59E0B" />
        <View style={{ height: Spacing.sm }} />
        <ActionButton label="Broadcast — Go Live" icon="video.fill" colors={colors} accent="#22C55E" />
      </View>
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // TAB 5: RESULTS
  // ─────────────────────────────────────────────────────────────────────────

  const renderResults = () => (
    <View style={styles.tabContent}>
      <SectionLabel label="RESULTS — QUALIFYING" colors={colors} />
      <View style={[styles.resultsTable, { borderColor: colors.border }]}>
        {/* Header */}
        <View style={[styles.resultsHeaderRow, { backgroundColor: colors.backgroundTertiary, borderBottomColor: colors.border }]}>
          <Text style={[styles.resultsHeaderCell, styles.posCol, { color: colors.textSecondary }]}>P</Text>
          <Text style={[styles.resultsHeaderCell, styles.nameCol, { color: colors.textSecondary }]}>Entrant</Text>
          <Text style={[styles.resultsHeaderCell, styles.gapCol, { color: colors.textSecondary }]}>Gap</Text>
        </View>
        {/* Rows */}
        {MOCK_RESULTS.map((row) => (
          <Pressable
            key={row.entrantId}
            style={[styles.resultsRow, { borderBottomColor: colors.border }]}
            onPress={() => onSelectEntrant?.(row.entrantId)}
          >
            <Text style={[styles.resultsCell, styles.posCol, { color: colors.text }]}>{row.position}</Text>
            <View style={[styles.nameCol, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
              <View style={[styles.teamDot, { backgroundColor: row.teamColor }]} />
              <Text style={[styles.resultsCell, { color: colors.text }]} numberOfLines={1}>{row.name}</Text>
            </View>
            <Text style={[styles.resultsCell, styles.gapCol, { color: colors.textSecondary }]}>{row.gap}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // TAB 6: INCIDENTS
  // ─────────────────────────────────────────────────────────────────────────

  const renderIncidents = () => {
    const isReadOnly = roleLens === 'CO3';
    return (
      <View style={styles.tabContent}>
        <SectionLabel label="INCIDENTS" colors={colors} />
        {incidents.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No incidents filed for this event.</Text>
        ) : (
          incidents.map((inc) => {
            const statusCol = getIncidentStatusColor(inc.status);
            const typeLabel = inc.type.charAt(0).toUpperCase() + inc.type.slice(1);
            return (
              <View key={inc.id} style={[styles.incidentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.incidentHeader}>
                  <View style={[styles.incidentTypePill, { backgroundColor: statusCol + '18' }]}>
                    <Text style={[styles.incidentTypeText, { color: statusCol }]}>{typeLabel}</Text>
                  </View>
                  <View style={[styles.miniPill, { backgroundColor: statusCol + '18' }]}>
                    <Text style={[styles.miniPillText, { color: statusCol }]}>
                      {inc.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.incidentTitle, { color: colors.text }]}>{inc.title}</Text>
                <Text style={[styles.incidentDesc, { color: colors.textSecondary }]}>{inc.description}</Text>
                <View style={styles.incidentMeta}>
                  <DetailRow label="Owner" value={inc.owner} colors={colors} />
                  <DetailRow label="Filed" value={inc.filedAt} colors={colors} />
                  {inc.driversInvolved.length > 0 && (
                    <DetailRow label="Involved" value={inc.driversInvolved.join(', ')} colors={colors} />
                  )}
                </View>
                {inc.impactFlags.length > 0 && (
                  <View style={styles.flagRow}>
                    {inc.impactFlags.map((f, i) => (
                      <View key={i} style={[styles.flagChip, { backgroundColor: '#F59E0B18' }]}>
                        <Text style={[styles.flagText, { color: '#F59E0B' }]}>{f}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // TAB 7: PAYOUTS
  // ─────────────────────────────────────────────────────────────────────────

  const renderPayouts = () => (
    <View style={styles.tabContent}>
      <SectionLabel label="PAYOUT QUEUE" colors={colors} />
      {PAYOUT_ITEMS.map((item) => {
        const statusCol = getPayoutStatusColor(item.status);
        const isHold = item.status === 'hold';
        return (
          <View key={item.id} style={[styles.payoutCard, { backgroundColor: colors.card, borderColor: isHold ? '#EF444430' : colors.border }]}>
            <View style={styles.payoutHeader}>
              <Text style={[styles.payoutName, { color: colors.text }]}>{item.entrantName}</Text>
              <Text style={[styles.payoutAmount, { color: colors.text }]}>{item.amount}</Text>
            </View>
            <View style={styles.payoutBody}>
              <View style={[styles.miniPill, { backgroundColor: statusCol + '18' }]}>
                <Text style={[styles.miniPillText, { color: statusCol }]}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
              <Text style={[styles.payoutGates, { color: colors.textSecondary }]}>
                {item.gatesCleared}/{item.gatesTotal} gates cleared
              </Text>
            </View>
            {item.reason && (
              <Text style={[styles.payoutReason, { color: isHold ? '#EF4444' : colors.textSecondary }]}>
                {item.reason}
              </Text>
            )}
            {isHold && fullAccess && (
              <Pressable
                style={[styles.releaseButton, { borderColor: '#F59E0B40' }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                <IconSymbol name="lock.fill" size={12} color="#F59E0B" />
                <Text style={[styles.releaseButtonText, { color: '#F59E0B' }]}>Release Hold (Approval Required)</Text>
              </Pressable>
            )}
          </View>
        );
      })}
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // TAB 8: MEDIA DELIVERABLES
  // ─────────────────────────────────────────────────────────────────────────

  const renderMediaDeliverables = () => (
    <View style={styles.tabContent}>
      <SectionLabel label="MEDIA DELIVERABLES" colors={colors} />

      {/* Group by sponsor */}
      {Array.from(new Set(eventDeliverables.map((d) => d.sponsorName))).map((sponsor) => {
        const items = eventDeliverables.filter((d) => d.sponsorName === sponsor);
        return (
          <View key={sponsor} style={{ marginBottom: Spacing.md }}>
            <View style={styles.deliverableSponsorHeader}>
              <IconSymbol name="building.2.fill" size={14} color={colors.textSecondary} />
              <Text style={[styles.deliverableSponsorName, { color: colors.text }]}>{sponsor}</Text>
            </View>
            {items.map((item) => {
              const statusCol = getDeliverableStatusColor(item.status);
              return (
                <View
                  key={item.id}
                  style={[styles.deliverableRow, { borderColor: colors.border }]}
                >
                  <IconSymbol
                    name={item.status === 'delivered' ? 'checkmark.circle.fill' : 'circle.fill'}
                    size={14}
                    color={statusCol}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.deliverableTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.deliverableMeta, { color: colors.textSecondary }]}>
                      {item.owner} {'\u00B7'} Due: {item.dueDate}
                    </Text>
                  </View>
                  <View style={[styles.miniPill, { backgroundColor: statusCol + '18' }]}>
                    <Text style={[styles.miniPillText, { color: statusCol }]}>
                      {getDeliverableStatusLabel(item.status)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}

      {/* Broadcast deliverables (static mock) */}
      <View style={{ marginBottom: Spacing.md }}>
        <View style={styles.deliverableSponsorHeader}>
          <IconSymbol name="video.fill" size={14} color={colors.textSecondary} />
          <Text style={[styles.deliverableSponsorName, { color: colors.text }]}>Broadcast</Text>
        </View>
        <View style={[styles.deliverableRow, { borderColor: colors.border }]}>
          <IconSymbol name="checkmark.circle.fill" size={14} color="#22C55E" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.deliverableTitle, { color: colors.text }]}>Pre-race driver intro package</Text>
            <Text style={[styles.deliverableMeta, { color: colors.textSecondary }]}>
              Broadcast Producer {'\u00B7'} Due: Sun 1:30 PM
            </Text>
          </View>
          <View style={[styles.miniPill, { backgroundColor: '#22C55E18' }]}>
            <Text style={[styles.miniPillText, { color: '#22C55E' }]}>Delivered</Text>
          </View>
        </View>
        <View style={[styles.deliverableRow, { borderColor: colors.border }]}>
          <IconSymbol name="circle.fill" size={14} color="#F59E0B" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.deliverableTitle, { color: colors.text }]}>Post-race highlight reel</Text>
            <Text style={[styles.deliverableMeta, { color: colors.textSecondary }]}>
              Media Director {'\u00B7'} Due: Sun 6:00 PM
            </Text>
          </View>
          <View style={[styles.miniPill, { backgroundColor: '#F59E0B18' }]}>
            <Text style={[styles.miniPillText, { color: '#F59E0B' }]}>At Risk</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // TAB CONTENT ROUTER
  // ─────────────────────────────────────────────────────────────────────────

  const renderTabContent = () => {
    switch (activeTab) {
      case 'agenda': return renderAgenda();
      case 'sessions': return renderSessions();
      case 'ops': return renderOps();
      case 'live_control': return renderLiveControl();
      case 'results': return renderResults();
      case 'incidents': return renderIncidents();
      case 'payouts': return renderPayouts();
      case 'media_deliverables': return renderMediaDeliverables();
      default: return null;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      {renderHeader()}
      {renderTabPills()}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function SectionLabel({ label, colors }: { label: string; colors: typeof Colors.dark }) {
  return (
    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{label}</Text>
  );
}

function DetailRow({ label, value, colors }: { label: string; value: string; colors: typeof Colors.dark }) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  colors,
  accent,
}: {
  label: string;
  icon: string;
  colors: typeof Colors.dark;
  accent?: string;
}) {
  const color = accent ?? colors.text;
  return (
    <Pressable
      style={[styles.opsActionButton, { borderColor: (accent ?? colors.border) + '40', backgroundColor: (accent ?? colors.textTertiary) + '08' }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <IconSymbol name={icon as any} size={14} color={color} />
      <Text style={[styles.opsActionText, { color }]}>{label}</Text>
    </Pressable>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  eventName: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: Spacing.xs,
  },
  venueText: {
    fontSize: 13,
    lineHeight: 18,
  },
  dateText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Tab Pills
  tabScroll: {
    maxHeight: 44,
    paddingHorizontal: Spacing.md,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Scroll Area
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Tab Content
  tabContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },

  // Section Label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },

  // Detail Row
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Mini Pill
  miniPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  miniPillText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Agenda
  dayLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  agendaRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: Spacing.sm,
    gap: 12,
  },
  agendaTimeBlock: {
    width: 90,
    flexDirection: 'column',
  },
  agendaTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  agendaTimeSep: {
    fontSize: 10,
  },
  agendaDetail: {
    flex: 1,
  },
  agendaNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  agendaName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  agendaExpanded: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  depItem: {
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 8,
  },

  // Sessions
  sessionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  sessionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  sessionCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sessionTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionCardName: {
    fontSize: 14,
    fontWeight: '600',
  },
  sessionCardTime: {
    fontSize: 12,
    marginTop: 2,
  },
  sessionCardBody: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  depRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  depText: {
    fontSize: 12,
    flex: 1,
  },

  // Ops
  opsCatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  opsCatTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  opsCatCount: {
    fontSize: 12,
  },
  opsTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  opsTaskLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
  },
  opsTaskTitle: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  opsTaskMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  opsActions: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  opsActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  opsActionText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Blockers
  blockerCard: {
    flexDirection: 'row',
    gap: 10,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  blockerTitle: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  blockerMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  flagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.xs,
  },
  flagChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  flagText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Live Control
  liveControlSubtext: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  liveControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  liveControlLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  liveControlOwner: {
    fontSize: 12,
    marginTop: 2,
  },

  // Results
  resultsTable: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
  },
  resultsHeaderCell: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
  },
  resultsCell: {
    fontSize: 13,
    fontWeight: '500',
  },
  posCol: {
    width: 30,
  },
  nameCol: {
    flex: 1,
  },
  gapCol: {
    width: 80,
    textAlign: 'right',
  },
  teamDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Incidents
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  incidentCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  incidentTypePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  incidentTypeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  incidentTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 4,
  },
  incidentDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: Spacing.sm,
  },
  incidentMeta: {
    gap: 2,
  },

  // Payouts
  payoutCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  payoutName: {
    fontSize: 14,
    fontWeight: '600',
  },
  payoutAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  payoutBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  payoutGates: {
    fontSize: 12,
  },
  payoutReason: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: Spacing.xs,
  },
  releaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
  },
  releaseButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Media Deliverables
  deliverableSponsorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  deliverableSponsorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  deliverableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  deliverableTitle: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  deliverableMeta: {
    fontSize: 11,
    marginTop: 2,
  },
});
