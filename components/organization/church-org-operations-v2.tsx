/**
 * Church Organization Operations — Sunday Command Center.
 * Sub-tabs: Command | Run of Show | Teams | Checklists | Incidents
 * RBAC: C1 (Senior Pastor) full, C2 (Elder) full, C3 (Staff) limited, C4/C5 hidden.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { ChurchRoleLens } from '@/utils/church-rbac';
import { isStaffLevel, isElderLevel } from '@/utils/church-rbac';
import {
  getChurchOperationsData,
  SERVICE_STATUS_COLORS,
  READINESS_COLORS,
  TASK_PRIORITY_COLORS,
  TASK_STATUS_COLORS,
  SLOT_STATUS_COLORS,
  INCIDENT_SEVERITY_COLORS,
  INCIDENT_STATUS_COLORS,
  SEGMENT_TYPE_LABELS,
  SEGMENT_TYPE_COLORS,
  SERVICE_STATUS_LABELS,
  READINESS_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  SLOT_STATUS_LABELS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_LABELS,
  TASK_CATEGORY_COLORS,
} from '@/data/mock-church-org-operations';
import type {
  ServiceSchedule,
  OpsTask,
  RunOfShowSegment,
  OpsTeam,
  TeamSlot,
  OpsChecklist,
  ChecklistItem,
  OpsIncident,
} from '@/data/mock-church-org-operations';

// =============================================================================
// CONSTANTS
// =============================================================================

const SUB_TABS = [
  { id: 'command', label: 'Command' },
  { id: 'run-of-show', label: 'Run of Show' },
  { id: 'teams', label: 'Teams' },
  { id: 'checklists', label: 'Checklists' },
  { id: 'incidents', label: 'Incidents' },
];

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: ChurchRoleLens;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatTimestamp(isoStr: string): string {
  const d = new Date(isoStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hr = hours % 12 || 12;
  return `${month} ${day}, ${hr}:${minutes} ${ampm}`;
}

function getCategoryIcon(category: string): string {
  switch (category) {
    case 'AV':
      return 'video.fill';
    case 'Facilities':
      return 'wrench.and.screwdriver.fill';
    case 'Worship':
      return 'music.note.list';
    case 'Security':
      return 'shield.checkered';
    case 'Kids':
      return 'figure.and.child.holdinghands';
    case 'Parking':
      return 'car.fill';
    default:
      return 'square.grid.2x2.fill';
  }
}

function getReadinessScoreColor(score: number): string {
  if (score >= 85) return '#22C55E';
  if (score >= 70) return '#F59E0B';
  return '#EF4444';
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({ icon, label, colors }: { icon: string; label: string; colors: typeof Colors.light }) {
  return (
    <View style={s.emptyContainer}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// STATUS BADGE
// =============================================================================

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// PROGRESS BAR
// =============================================================================

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <View style={s.progressTrack}>
      <View style={[s.progressFill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

// =============================================================================
// SUB-TAB BAR
// =============================================================================

function SubTabBar({
  tabs,
  activeId,
  onSelect,
  accentColor,
  colors,
}: {
  tabs: typeof SUB_TABS;
  activeId: string;
  onSelect: (id: string) => void;
  accentColor: string;
  colors: typeof Colors.light;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.subTabRow}
      style={{ flexGrow: 0 }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <Pressable
            key={tab.id}
            style={[
              s.subTab,
              {
                borderBottomColor: isActive ? accentColor : 'transparent',
                borderBottomWidth: isActive ? 2 : 0,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(tab.id);
            }}
          >
            <ThemedText
              style={[
                s.subTabText,
                { color: isActive ? colors.text : colors.textSecondary },
              ]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// COMMAND TAB — Sunday Dashboard / Readiness Command Center
// =============================================================================

function CommandTab({
  colors,
  accentColor,
  data,
  onSelectService,
  onSelectTask,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getChurchOperationsData>;
  onSelectService: (svc: ServiceSchedule) => void;
  onSelectTask: (task: OpsTask) => void;
}) {
  const { services, opsQueue, commandTiles } = data;
  const readinessScore = commandTiles.readinessScore;
  const readinessColor = getReadinessScoreColor(readinessScore);
  const nextService = commandTiles.nextService;

  // Sort tasks: urgent first, then high, medium, low; within same priority pending first
  const sortedTasks = useMemo(() => {
    const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    const statusOrder: Record<string, number> = { pending: 0, in_progress: 1, done: 2 };
    return [...opsQueue]
      .filter((t) => t.status !== 'done')
      .sort((a, b) => {
        const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (pDiff !== 0) return pDiff;
        return statusOrder[a.status] - statusOrder[b.status];
      });
  }, [opsQueue]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* ---- Readiness Score Circle ---- */}
      <View style={s.readinessSection}>
        <View style={[s.readinessCircle, { borderColor: readinessColor + '40' }]}>
          <ThemedText style={[s.readinessScore, { color: readinessColor }]}>
            {readinessScore}
          </ThemedText>
          <ThemedText style={[s.readinessLabel, { color: colors.textSecondary }]}>
            Readiness Score
          </ThemedText>
        </View>
      </View>

      {/* ---- Next Service Strip Card ---- */}
      <Pressable
        style={[s.nextServiceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSelectService(nextService);
        }}
      >
        <View style={[s.nextServiceBorder, { backgroundColor: accentColor }]} />
        <View style={s.nextServiceContent}>
          <View style={s.nextServiceTopRow}>
            <ThemedText style={[s.nextServiceName, { color: colors.text }]} numberOfLines={1}>
              {nextService.name}
            </ThemedText>
            <StatusBadge
              label={SERVICE_STATUS_LABELS[nextService.status].toUpperCase()}
              color={SERVICE_STATUS_COLORS[nextService.status]}
            />
          </View>
          <View style={s.nextServiceDetailsRow}>
            <View style={s.nextServiceDetailItem}>
              <IconSymbol name="clock.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.nextServiceTime, { color: colors.textSecondary }]}>
                {nextService.startTime} - {nextService.endTime}
              </ThemedText>
            </View>
            <View style={s.nextServiceDetailItem}>
              <IconSymbol name="mappin.circle.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.nextServiceVenue, { color: colors.textSecondary }]}>
                {nextService.venue}
              </ThemedText>
            </View>
          </View>
          <View style={s.nextServiceBottomRow}>
            <View style={s.nextServiceDetailItem}>
              <IconSymbol name="person.3.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.nextServiceAttendance, { color: colors.textSecondary }]}>
                {nextService.expectedAttendance} expected
              </ThemedText>
            </View>
            <StatusBadge
              label={READINESS_LABELS[nextService.readiness].toUpperCase()}
              color={READINESS_COLORS[nextService.readiness]}
            />
          </View>
        </View>
      </Pressable>

      {/* ---- All Services Quick View ---- */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        All Services
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.serviceQuickRow}
        style={{ flexGrow: 0 }}
      >
        {services.map((svc) => {
          const isNext = svc.id === nextService.id;
          return (
            <Pressable
              key={svc.id}
              style={[
                s.serviceQuickCard,
                {
                  backgroundColor: isNext ? accentColor + '12' : colors.card,
                  borderColor: isNext ? accentColor + '40' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelectService(svc);
              }}
            >
              <View style={s.serviceQuickTopRow}>
                <View
                  style={[
                    s.serviceQuickDot,
                    { backgroundColor: READINESS_COLORS[svc.readiness] },
                  ]}
                />
                <ThemedText
                  style={[s.serviceQuickName, { color: isNext ? accentColor : colors.text }]}
                  numberOfLines={1}
                >
                  {svc.name}
                </ThemedText>
              </View>
              <ThemedText style={[s.serviceQuickTime, { color: colors.textSecondary }]}>
                {svc.startTime}
              </ThemedText>
              <ThemedText style={[s.serviceQuickVenue, { color: colors.textTertiary }]}>
                {svc.venue}
              </ThemedText>
              <View style={s.serviceQuickScoreRow}>
                <ThemedText
                  style={[
                    s.serviceQuickScoreValue,
                    { color: getReadinessScoreColor(svc.readinessScore) },
                  ]}
                >
                  {svc.readinessScore}
                </ThemedText>
                <ThemedText style={[s.serviceQuickScoreLabel, { color: colors.textTertiary }]}>
                  ready
                </ThemedText>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ---- Ops Queue ---- */}
      <View style={s.opsQueueHeader}>
        <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Open Tasks</ThemedText>
        <View style={[s.opsQueueCountBadge, { backgroundColor: '#F59E0B20' }]}>
          <ThemedText style={[s.opsQueueCount, { color: '#F59E0B' }]}>
            {sortedTasks.length}
          </ThemedText>
        </View>
      </View>

      {sortedTasks.map((task, index) => {
        const pColor = TASK_PRIORITY_COLORS[task.priority];
        const sColor = TASK_STATUS_COLORS[task.status];
        const catColor = TASK_CATEGORY_COLORS[task.category] || colors.textTertiary;
        return (
          <Pressable
            key={task.id}
            style={[s.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectTask(task);
            }}
          >
            <View style={[s.taskCategoryIconContainer, { backgroundColor: catColor + '18' }]}>
              <IconSymbol name={getCategoryIcon(task.category) as any} size={16} color={catColor} />
            </View>
            <View style={s.taskInfo}>
              <ThemedText style={[s.taskTitle, { color: colors.text }]} numberOfLines={1}>
                {task.title}
              </ThemedText>
              <View style={s.taskMetaRow}>
                <View style={[s.taskPriorityDot, { backgroundColor: pColor }]} />
                <ThemedText style={[s.taskAssignee, { color: colors.textSecondary }]}>
                  {task.assignee}
                </ThemedText>
              </View>
            </View>
            <View style={s.taskRightCol}>
              <StatusBadge label={TASK_STATUS_LABELS[task.status].toUpperCase()} color={sColor} />
              <ThemedText style={[s.taskDueTime, { color: colors.textTertiary }]}>
                {task.dueTime}
              </ThemedText>
            </View>
          </Pressable>
        );
      })}

      {sortedTasks.length === 0 && (
        <EmptyState icon="checkmark.circle.fill" label="All tasks completed" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// RUN OF SHOW TAB — Service Timeline Visualization
// =============================================================================

function RunOfShowTab({
  colors,
  accentColor,
  services,
  segments,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  services: ServiceSchedule[];
  segments: RunOfShowSegment[];
}) {
  // Default to the 10:30 AM service (svc-002) if available
  const defaultServiceId = services.find((s) => s.id === 'svc-002')?.id || services[0]?.id || '';
  const [selectedServiceId, setSelectedServiceId] = useState(defaultServiceId);
  const [expandedSegments, setExpandedSegments] = useState<Set<string>>(new Set());

  const filteredSegments = useMemo(() => {
    return segments
      .filter((seg) => seg.serviceId === selectedServiceId)
      .sort((a, b) => a.order - b.order);
  }, [segments, selectedServiceId]);

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId),
    [services, selectedServiceId],
  );

  const toggleSegmentExpand = useCallback((segId: string) => {
    setExpandedSegments((prev) => {
      const next = new Set(prev);
      if (next.has(segId)) {
        next.delete(segId);
      } else {
        next.add(segId);
      }
      return next;
    });
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Service Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.serviceSelector}
        style={{ flexGrow: 0 }}
      >
        {services.map((svc) => {
          const isActive = svc.id === selectedServiceId;
          return (
            <Pressable
              key={svc.id}
              style={[
                s.servicePill,
                {
                  backgroundColor: isActive ? accentColor + '20' : colors.card,
                  borderColor: isActive ? accentColor + '40' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedServiceId(svc.id);
              }}
            >
              <ThemedText
                style={[
                  s.servicePillText,
                  { color: isActive ? accentColor : colors.textSecondary },
                ]}
              >
                {svc.name}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Selected Service Info */}
      {selectedService && (
        <View style={[s.rosServiceInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.rosServiceInfoRow}>
            <IconSymbol name="clock.fill" size={12} color={colors.textTertiary} />
            <ThemedText style={[s.rosServiceInfoText, { color: colors.textSecondary }]}>
              {selectedService.startTime} - {selectedService.endTime}
            </ThemedText>
          </View>
          <View style={s.rosServiceInfoRow}>
            <IconSymbol name="mappin.circle.fill" size={12} color={colors.textTertiary} />
            <ThemedText style={[s.rosServiceInfoText, { color: colors.textSecondary }]}>
              {selectedService.venue}
            </ThemedText>
          </View>
          <StatusBadge
            label={READINESS_LABELS[selectedService.readiness].toUpperCase()}
            color={READINESS_COLORS[selectedService.readiness]}
          />
        </View>
      )}

      {/* Timeline */}
      {filteredSegments.length > 0 ? (
        <View style={s.timelineContainer}>
          {filteredSegments.map((seg, index) => {
            const isLast = index === filteredSegments.length - 1;
            const segColor = SEGMENT_TYPE_COLORS[seg.type];
            const isExpanded = expandedSegments.has(seg.id);
            return (
              <View key={seg.id} style={s.timelineSegment}>
                {/* Left timeline line and dot */}
                <View style={s.timelineLeftCol}>
                  <View style={[s.timelineDot, { backgroundColor: segColor }]} />
                  {!isLast && (
                    <View style={[s.timelineConnector, { backgroundColor: colors.border }]} />
                  )}
                </View>

                {/* Segment card */}
                <Pressable
                  style={[s.segmentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    toggleSegmentExpand(seg.id);
                  }}
                >
                  <View style={s.segmentHeaderRow}>
                    <StatusBadge
                      label={SEGMENT_TYPE_LABELS[seg.type].toUpperCase()}
                      color={segColor}
                    />
                    <ThemedText style={[s.segmentTime, { color: colors.textTertiary }]}>
                      {seg.startTime} ({seg.duration})
                    </ThemedText>
                  </View>
                  <ThemedText style={[s.segmentLabel, { color: colors.text }]}>
                    {seg.label}
                  </ThemedText>
                  <View style={s.segmentOwnerRow}>
                    <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                    <ThemedText style={[s.segmentOwner, { color: colors.textSecondary }]}>
                      {seg.owner}
                    </ThemedText>
                  </View>

                  {/* Expandable cues + notes */}
                  {isExpanded && (
                    <>
                      {seg.cues.length > 0 && (
                        <View style={[s.cuesList, { borderTopColor: colors.border }]}>
                          <ThemedText style={[s.cuesTitle, { color: colors.textSecondary }]}>
                            Cues
                          </ThemedText>
                          {seg.cues.map((cue, ci) => (
                            <View key={`cue-${ci}`} style={s.cueItem}>
                              <View style={[s.cueDot, { backgroundColor: segColor }]} />
                              <ThemedText style={[s.cueText, { color: colors.textSecondary }]}>
                                {cue}
                              </ThemedText>
                            </View>
                          ))}
                        </View>
                      )}
                      {seg.notes.length > 0 && (
                        <View style={[s.segmentNotes, { backgroundColor: accentColor + '08' }]}>
                          <ThemedText style={[s.segmentNotesText, { color: colors.textSecondary }]}>
                            {seg.notes}
                          </ThemedText>
                        </View>
                      )}
                    </>
                  )}

                  {/* Expand hint */}
                  <View style={s.segmentExpandHint}>
                    <IconSymbol
                      name={isExpanded ? 'chevron.up' : 'chevron.down'}
                      size={12}
                      color={colors.textTertiary}
                    />
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : (
        <EmptyState
          icon="list.bullet.clipboard"
          label="No run of show for this service"
          colors={colors}
        />
      )}
    </ScrollView>
  );
}

// =============================================================================
// TEAMS TAB — Teams & Coverage
// =============================================================================

function TeamsTab({
  colors,
  accentColor,
  teams,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  teams: OpsTeam[];
}) {
  // Compute summary
  const summary = useMemo(() => {
    let totalSlots = 0;
    let filled = 0;
    let vacant = 0;
    let tentative = 0;
    for (const team of teams) {
      for (const slot of team.slots) {
        totalSlots++;
        if (slot.status === 'filled') filled++;
        else if (slot.status === 'vacant') vacant++;
        else if (slot.status === 'tentative') tentative++;
      }
    }
    return { totalSlots, filled, vacant, tentative };
  }, [teams]);

  const renderTeamCard = useCallback(
    ({ item: team }: { item: OpsTeam }) => {
      const filledCount = team.slots.filter((sl) => sl.status === 'filled').length;
      const totalCount = team.slots.length;
      const fillPercent = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

      return (
        <View style={[s.teamCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Team Header */}
          <View style={s.teamHeader}>
            <View style={[s.teamIconContainer, { backgroundColor: team.color + '18' }]}>
              <IconSymbol name={team.icon as any} size={18} color={team.color} />
            </View>
            <ThemedText style={[s.teamName, { color: colors.text }]}>{team.name}</ThemedText>
            <ThemedText style={[s.teamFillRatio, { color: colors.textSecondary }]}>
              {filledCount}/{totalCount}
            </ThemedText>
          </View>

          {/* Color bar */}
          <View style={[s.teamColorBar, { backgroundColor: team.color + '30' }]}>
            <View
              style={[
                s.teamColorBarFill,
                { width: `${fillPercent}%`, backgroundColor: team.color },
              ]}
            />
          </View>

          {/* Slot Grid */}
          <View style={s.slotGrid}>
            {team.slots.map((slot) => {
              const slotColor = SLOT_STATUS_COLORS[slot.status];
              return (
                <View
                  key={slot.id}
                  style={[s.slotCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
                >
                  <View style={s.slotHeaderRow}>
                    <View style={[s.slotStatusDot, { backgroundColor: slotColor }]} />
                    <ThemedText style={[s.slotRole, { color: colors.text }]} numberOfLines={1}>
                      {slot.role}
                    </ThemedText>
                    {slot.critical && (
                      <View style={s.slotCriticalFlag}>
                        <IconSymbol name="exclamationmark.circle.fill" size={10} color="#EF4444" />
                      </View>
                    )}
                  </View>
                  <ThemedText
                    style={[
                      s.slotAssignee,
                      {
                        color: slot.assignee ? colors.textSecondary : '#EF4444',
                        fontWeight: slot.assignee ? '400' : '700',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {slot.assignee || 'VACANT'}
                  </ThemedText>
                </View>
              );
            })}
          </View>

          {/* Coverage progress */}
          <View style={s.teamCoverageRow}>
            <ThemedText style={[s.teamCoverageLabel, { color: colors.textTertiary }]}>
              Coverage
            </ThemedText>
            <ThemedText style={[s.teamCoverageValue, { color: colors.textSecondary }]}>
              {fillPercent}%
            </ThemedText>
          </View>
          <ProgressBar percent={fillPercent} color={team.color} />
        </View>
      );
    },
    [colors],
  );

  return (
    <View style={s.flex1}>
      {/* Summary Row */}
      <View style={s.summaryRow}>
        <View style={[s.summaryTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.summaryValue, { color: colors.text }]}>
            {summary.totalSlots}
          </ThemedText>
          <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Total</ThemedText>
        </View>
        <View style={[s.summaryTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.summaryValue, { color: '#22C55E' }]}>
            {summary.filled}
          </ThemedText>
          <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Filled</ThemedText>
        </View>
        <View style={[s.summaryTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.summaryValue, { color: '#EF4444' }]}>
            {summary.vacant}
          </ThemedText>
          <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Vacant</ThemedText>
        </View>
        <View style={[s.summaryTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.summaryValue, { color: '#F59E0B' }]}>
            {summary.tentative}
          </ThemedText>
          <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Tentative</ThemedText>
        </View>
      </View>

      {/* Team Cards FlatList */}
      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        renderItem={renderTeamCard}
        contentContainerStyle={s.tabListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="person.3.fill" label="No teams configured" colors={colors} />
        }
      />
    </View>
  );
}

// =============================================================================
// CHECKLISTS TAB — Completion Tracking
// =============================================================================

function ChecklistsTab({
  colors,
  accentColor,
  checklists,
  expandedChecklists,
  onToggleChecklist,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  checklists: OpsChecklist[];
  expandedChecklists: Set<string>;
  onToggleChecklist: (id: string) => void;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Overall progress */}
      {(() => {
        const totalDone = checklists.reduce((sum, cl) => sum + cl.completedCount, 0);
        const totalItems = checklists.reduce((sum, cl) => sum + cl.totalCount, 0);
        const overallPercent = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;
        return (
          <View style={[s.overallProgressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.overallProgressHeader}>
              <IconSymbol name="checkmark.square.fill" size={16} color={accentColor} />
              <ThemedText style={[s.overallProgressTitle, { color: colors.text }]}>
                Overall Progress
              </ThemedText>
              <ThemedText style={[s.overallProgressValue, { color: accentColor }]}>
                {totalDone}/{totalItems}
              </ThemedText>
            </View>
            <ProgressBar percent={overallPercent} color={accentColor} />
          </View>
        );
      })()}

      {/* Checklist Cards */}
      {checklists.map((cl) => {
        const isExpanded = expandedChecklists.has(cl.id);
        const percent = cl.totalCount > 0 ? Math.round((cl.completedCount / cl.totalCount) * 100) : 0;
        const clColor = percent === 100 ? '#22C55E' : percent >= 50 ? '#F59E0B' : '#EF4444';
        return (
          <View key={cl.id}>
            <Pressable
              style={[s.checklistCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onToggleChecklist(cl.id);
              }}
            >
              {/* Header */}
              <View style={s.checklistHeader}>
                <View style={[s.checklistIconContainer, { backgroundColor: clColor + '18' }]}>
                  <IconSymbol name={cl.icon as any} size={16} color={clColor} />
                </View>
                <View style={s.checklistHeaderText}>
                  <ThemedText style={[s.checklistName, { color: colors.text }]}>{cl.name}</ThemedText>
                  <ThemedText style={[s.checklistProgress, { color: colors.textSecondary }]}>
                    {cl.completedCount}/{cl.totalCount} completed
                  </ThemedText>
                </View>
                <IconSymbol
                  name={isExpanded ? 'chevron.up' : 'chevron.down'}
                  size={14}
                  color={colors.textTertiary}
                />
              </View>

              {/* Progress bar */}
              <ProgressBar percent={percent} color={clColor} />

              {/* Expanded items */}
              {isExpanded && (
                <View style={[s.checklistItemsContainer, { borderTopColor: colors.border }]}>
                  {cl.items.map((item) => (
                    <View key={item.id} style={s.checklistItemRow}>
                      <IconSymbol
                        name={item.completed ? 'checkmark.circle.fill' : 'circle'}
                        size={18}
                        color={item.completed ? '#22C55E' : colors.textTertiary}
                      />
                      <View style={s.checklistItemTextCol}>
                        <ThemedText
                          style={[
                            s.checklistItemLabel,
                            {
                              color: item.completed ? colors.textTertiary : colors.text,
                              textDecorationLine: item.completed ? 'line-through' : 'none',
                            },
                          ]}
                          numberOfLines={2}
                        >
                          {item.label}
                        </ThemedText>
                        <ThemedText style={[s.checklistItemAssignee, { color: colors.textTertiary }]}>
                          {item.assignee}
                        </ThemedText>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </Pressable>
          </View>
        );
      })}

      {checklists.length === 0 && (
        <EmptyState icon="checkmark.square.fill" label="No checklists available" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// INCIDENTS TAB — Historical Incident Cards
// =============================================================================

function IncidentsTab({
  colors,
  accentColor,
  incidents,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  incidents: OpsIncident[];
}) {
  // Sort: open first, then investigating, then resolved
  const sorted = useMemo(() => {
    const statusOrder: Record<string, number> = { open: 0, investigating: 1, resolved: 2 };
    return [...incidents].sort(
      (a, b) => statusOrder[a.status] - statusOrder[b.status],
    );
  }, [incidents]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Incidents</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Sorted by status — open first
      </ThemedText>

      {sorted.map((inc) => {
        const sevColor = INCIDENT_SEVERITY_COLORS[inc.severity];
        const statColor = INCIDENT_STATUS_COLORS[inc.status];
        return (
          <View
            key={inc.id}
            style={[s.incidentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {/* Severity bar */}
            <View style={[s.incidentSeverityBar, { backgroundColor: sevColor }]} />

            <View style={s.incidentContent}>
              {/* Header */}
              <View style={s.incidentHeader}>
                <ThemedText style={[s.incidentTitle, { color: colors.text }]} numberOfLines={2}>
                  {inc.title}
                </ThemedText>
              </View>

              {/* Badges */}
              <View style={s.incidentBadgeRow}>
                <StatusBadge
                  label={INCIDENT_SEVERITY_LABELS[inc.severity].toUpperCase()}
                  color={sevColor}
                />
                <StatusBadge
                  label={INCIDENT_STATUS_LABELS[inc.status].toUpperCase()}
                  color={statColor}
                />
              </View>

              {/* Service link */}
              {inc.serviceName && (
                <View style={s.incidentMeta}>
                  <View style={s.incidentMetaItem}>
                    <IconSymbol name="calendar.badge.clock" size={11} color={colors.textTertiary} />
                    <ThemedText style={[s.incidentMetaText, { color: colors.textSecondary }]}>
                      {inc.serviceName}
                    </ThemedText>
                  </View>
                </View>
              )}

              {/* Reported by + timestamp */}
              <View style={s.incidentMeta}>
                <View style={s.incidentMetaItem}>
                  <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.incidentMetaText, { color: colors.textTertiary }]}>
                    {inc.reportedBy}
                  </ThemedText>
                </View>
                <View style={s.incidentMetaItem}>
                  <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.incidentMetaText, { color: colors.textTertiary }]}>
                    {formatTimestamp(inc.reportedAt)}
                  </ThemedText>
                </View>
              </View>

              {/* Description */}
              <ThemedText style={[s.incidentDesc, { color: colors.textSecondary }]}>
                {inc.description}
              </ThemedText>

              {/* Resolution (if resolved) */}
              {inc.resolution && (
                <View style={[s.resolutionSection, { backgroundColor: '#22C55E10' }]}>
                  <View style={s.resolutionHeader}>
                    <IconSymbol name="checkmark.circle.fill" size={12} color="#22C55E" />
                    <ThemedText style={[s.resolutionTitle, { color: '#22C55E' }]}>
                      Resolution
                    </ThemedText>
                  </View>
                  <ThemedText style={[s.resolutionText, { color: colors.textSecondary }]}>
                    {inc.resolution}
                  </ThemedText>
                </View>
              )}

              {/* Prevention Notes (if present) */}
              {inc.preventionNotes && (
                <View style={[s.preventionSection, { backgroundColor: '#1D9BF010' }]}>
                  <View style={s.preventionHeader}>
                    <IconSymbol name="lightbulb.fill" size={12} color="#1D9BF0" />
                    <ThemedText style={[s.preventionTitle, { color: '#1D9BF0' }]}>
                      Prevention Notes
                    </ThemedText>
                  </View>
                  <ThemedText style={[s.preventionText, { color: colors.textSecondary }]}>
                    {inc.preventionNotes}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        );
      })}

      {sorted.length === 0 && (
        <EmptyState
          icon="exclamationmark.triangle.fill"
          label="No incidents recorded"
          colors={colors}
        />
      )}
    </ScrollView>
  );
}

// =============================================================================
// SERVICE DETAIL BOTTOM SHEET
// =============================================================================

function ServiceDetailSheet({
  visible,
  onClose,
  service,
  colors,
  accentColor,
  teams,
  tasks,
  segments,
}: {
  visible: boolean;
  onClose: () => void;
  service: ServiceSchedule | null;
  colors: typeof Colors.light;
  accentColor: string;
  teams: OpsTeam[];
  tasks: OpsTask[];
  segments: RunOfShowSegment[];
}) {
  if (!service) return null;

  const statusColor = SERVICE_STATUS_COLORS[service.status];
  const readinessColor = READINESS_COLORS[service.readiness];

  // Tasks for this service
  const serviceTasks = tasks.filter((t) => t.serviceId === service.id && t.status !== 'done');

  // Segments for this service (preview first 3)
  const serviceSegments = segments
    .filter((seg) => seg.serviceId === service.id)
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);

  // Team coverage: count filled slots for teams that have slots for this service
  const teamCoverage = useMemo(() => {
    return teams.map((team) => {
      const serviceSlots = team.slots.filter((sl) => sl.serviceId === service.id);
      const filled = serviceSlots.filter((sl) => sl.status === 'filled').length;
      return { teamName: team.name, teamColor: team.color, filled, total: serviceSlots.length };
    }).filter((t) => t.total > 0);
  }, [teams, service.id]);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={service.name} useModal>
      {/* Status + Readiness Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge
          label={SERVICE_STATUS_LABELS[service.status].toUpperCase()}
          color={statusColor}
        />
        <StatusBadge
          label={READINESS_LABELS[service.readiness].toUpperCase()}
          color={readinessColor}
        />
      </View>

      {/* Details Section */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {service.date}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Date</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {service.startTime} - {service.endTime}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Time</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{service.venue}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Venue</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {service.expectedAttendance}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>
              Expected Attendance
            </ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText
              style={[
                s.sheetDetailValue,
                { color: getReadinessScoreColor(service.readinessScore) },
              ]}
            >
              {service.readinessScore}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>
              Readiness Score
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Team Coverage */}
      {teamCoverage.length > 0 && (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
            Team Coverage
          </ThemedText>
          {teamCoverage.map((tc, i) => (
            <View key={`tc-${i}`} style={s.sheetTeamRow}>
              <View style={[s.sheetTeamDot, { backgroundColor: tc.teamColor }]} />
              <ThemedText style={[s.sheetTeamName, { color: colors.text }]}>{tc.teamName}</ThemedText>
              <ThemedText style={[s.sheetTeamRatio, { color: colors.textSecondary }]}>
                {tc.filled}/{tc.total}
              </ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Open Tasks */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Open Tasks ({serviceTasks.length})
        </ThemedText>
        {serviceTasks.map((task) => (
          <View key={task.id} style={s.sheetListRow}>
            <View style={[s.sheetTaskPriorityDot, { backgroundColor: TASK_PRIORITY_COLORS[task.priority] }]} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {task.title}
              </ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                {task.assignee} — Due {task.dueTime}
              </ThemedText>
            </View>
            <StatusBadge
              label={TASK_STATUS_LABELS[task.status].toUpperCase()}
              color={TASK_STATUS_COLORS[task.status]}
            />
          </View>
        ))}
        {serviceTasks.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No open tasks for this service
          </ThemedText>
        )}
      </View>

      {/* Run of Show Preview */}
      {serviceSegments.length > 0 && (
        <View style={s.sheetSection}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
            Run of Show (Preview)
          </ThemedText>
          {serviceSegments.map((seg) => (
            <View key={seg.id} style={s.sheetListRow}>
              <View
                style={[
                  s.sheetSegmentDot,
                  { backgroundColor: SEGMENT_TYPE_COLORS[seg.type] },
                ]}
              />
              <View style={s.sheetListTextCol}>
                <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                  {seg.label}
                </ThemedText>
                <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                  {SEGMENT_TYPE_LABELS[seg.type]} — {seg.duration}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Close
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// TASK DETAIL BOTTOM SHEET
// =============================================================================

function TaskDetailSheet({
  visible,
  onClose,
  task,
  colors,
  accentColor,
  services,
}: {
  visible: boolean;
  onClose: () => void;
  task: OpsTask | null;
  colors: typeof Colors.light;
  accentColor: string;
  services: ServiceSchedule[];
}) {
  if (!task) return null;

  const pColor = TASK_PRIORITY_COLORS[task.priority];
  const sColor = TASK_STATUS_COLORS[task.status];
  const catColor = TASK_CATEGORY_COLORS[task.category] || colors.textTertiary;
  const linkedService = services.find((svc) => svc.id === task.serviceId);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={task.title} useModal>
      {/* Priority + Status Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={TASK_PRIORITY_LABELS[task.priority].toUpperCase()} color={pColor} />
        <StatusBadge label={TASK_STATUS_LABELS[task.status].toUpperCase()} color={sColor} />
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <View style={s.sheetDetailValueRow}>
              <IconSymbol name={getCategoryIcon(task.category) as any} size={14} color={catColor} />
              <ThemedText style={[s.sheetDetailValue, { color: colors.text, marginLeft: 4 }]}>
                {task.category}
              </ThemedText>
            </View>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>
              Category
            </ThemedText>
          </View>
          {linkedService && (
            <View style={s.sheetDetailItem}>
              <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
                {linkedService.name}
              </ThemedText>
              <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>
                Service
              </ThemedText>
            </View>
          )}
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {task.assignee}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>
              Assignee
            </ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {task.dueTime}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>
              Due Time
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Close
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// LOCKED STATE
// =============================================================================

function LockedState({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={s.lockedContainer}>
      <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
      <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Operations</ThemedText>
      <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
        This section is restricted to staff and leadership. Contact church staff for access.
      </ThemedText>
    </View>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function ChurchOrgOperations({ colors, accentColor, role = 'C1' }: Props) {
  // RBAC Gate: C4/C5 locked
  if (!isStaffLevel(role)) {
    return <LockedState colors={colors} />;
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('command');
  const [selectedService, setSelectedService] = useState<ServiceSchedule | null>(null);
  const [serviceSheetVisible, setServiceSheetVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<OpsTask | null>(null);
  const [taskSheetVisible, setTaskSheetVisible] = useState(false);
  const [expandedChecklists, setExpandedChecklists] = useState<Set<string>>(new Set());

  // === Data ===
  const data = useMemo(() => getChurchOperationsData(), []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (isElderLevel(role)) return SUB_TABS;
    if (isStaffLevel(role))
      return SUB_TABS.filter((t) => ['command', 'teams', 'checklists'].includes(t.id));
    return [];
  }, [role]);

  // === Callbacks ===
  const handleSelectService = useCallback((svc: ServiceSchedule) => {
    setSelectedService(svc);
    setServiceSheetVisible(true);
  }, []);

  const handleCloseServiceSheet = useCallback(() => {
    setServiceSheetVisible(false);
  }, []);

  const handleSelectTask = useCallback((task: OpsTask) => {
    setSelectedTask(task);
    setTaskSheetVisible(true);
  }, []);

  const handleCloseTaskSheet = useCallback(() => {
    setTaskSheetVisible(false);
  }, []);

  const handleToggleChecklist = useCallback((id: string) => {
    setExpandedChecklists((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'command':
        return (
          <CommandTab
            colors={colors}
            accentColor={accentColor}
            data={data}
            onSelectService={handleSelectService}
            onSelectTask={handleSelectTask}
          />
        );
      case 'run-of-show':
        if (!isElderLevel(role)) return null;
        return (
          <RunOfShowTab
            colors={colors}
            accentColor={accentColor}
            services={data.services}
            segments={data.runOfShow}
          />
        );
      case 'teams':
        return (
          <TeamsTab
            colors={colors}
            accentColor={accentColor}
            teams={data.teams}
          />
        );
      case 'checklists':
        return (
          <ChecklistsTab
            colors={colors}
            accentColor={accentColor}
            checklists={data.checklists}
            expandedChecklists={expandedChecklists}
            onToggleChecklist={handleToggleChecklist}
          />
        );
      case 'incidents':
        if (!isElderLevel(role)) return null;
        return (
          <IncidentsTab
            colors={colors}
            accentColor={accentColor}
            incidents={data.incidents}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      {/* Sub-tab bar */}
      <SubTabBar
        tabs={visibleSubTabs}
        activeId={activeSubTab}
        onSelect={setActiveSubTab}
        accentColor={accentColor}
        colors={colors}
      />

      {/* Content */}
      <View style={s.contentContainer}>
        {renderContent()}
      </View>

      {/* Service Detail Bottom Sheet */}
      <ServiceDetailSheet
        visible={serviceSheetVisible}
        onClose={handleCloseServiceSheet}
        service={selectedService}
        colors={colors}
        accentColor={accentColor}
        teams={data.teams}
        tasks={data.opsQueue}
        segments={data.runOfShow}
      />

      {/* Task Detail Bottom Sheet */}
      <TaskDetailSheet
        visible={taskSheetVisible}
        onClose={handleCloseTaskSheet}
        task={selectedTask}
        colors={colors}
        accentColor={accentColor}
        services={data.services}
      />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },

  // -- Locked state --
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  lockedMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // -- Sub-tab bar --
  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  subTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Tab scroll containers --
  tabScroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  tabListContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // -- Section titles --
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: Spacing.md,
  },

  // -- Badge --
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // -- Progress bar --
  progressTrack: {
    height: 4,
    backgroundColor: '#2F3336',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },

  // -- Empty state --
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },

  // =========================================================================
  // COMMAND TAB — Readiness Center
  // =========================================================================

  readinessSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  readinessCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readinessScore: {
    fontSize: 48,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  readinessLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },

  // -- Next Service Card --
  nextServiceCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  nextServiceBorder: {
    width: 4,
  },
  nextServiceContent: {
    flex: 1,
    padding: Spacing.md,
  },
  nextServiceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  nextServiceName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: Spacing.sm,
  },
  nextServiceDetailsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  nextServiceDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nextServiceTime: {
    fontSize: 12,
  },
  nextServiceVenue: {
    fontSize: 12,
  },
  nextServiceBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextServiceAttendance: {
    fontSize: 12,
  },

  // -- Service Quick View --
  serviceQuickRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  serviceQuickCard: {
    width: 150,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  serviceQuickTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  serviceQuickDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  serviceQuickName: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  serviceQuickTime: {
    fontSize: 12,
    marginBottom: 2,
  },
  serviceQuickVenue: {
    fontSize: 11,
    marginBottom: Spacing.xs,
  },
  serviceQuickScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  serviceQuickScoreValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  serviceQuickScoreLabel: {
    fontSize: 10,
  },

  // -- Ops Queue --
  opsQueueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  opsQueueCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  opsQueueCount: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Task Card --
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  taskCategoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskPriorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskAssignee: {
    fontSize: 12,
  },
  taskRightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  taskDueTime: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },

  // =========================================================================
  // RUN OF SHOW TAB
  // =========================================================================

  // -- Service Selector --
  serviceSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  servicePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  servicePillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- ROS Service Info --
  rosServiceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  rosServiceInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rosServiceInfoText: {
    fontSize: 12,
  },

  // -- Timeline --
  timelineContainer: {
    paddingLeft: 2,
  },
  timelineSegment: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timelineLeftCol: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: Spacing.md,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    marginTop: 2,
    marginBottom: 0,
  },

  // -- Segment Card --
  segmentCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginLeft: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  segmentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  segmentLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  segmentTime: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  segmentOwnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  segmentOwner: {
    fontSize: 12,
  },

  // -- Cues --
  cuesList: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cuesTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: Spacing.xs,
  },
  cueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  cueDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  cueText: {
    fontSize: 12,
  },

  // -- Segment Notes --
  segmentNotes: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  segmentNotesText: {
    fontSize: 12,
    lineHeight: 17,
  },

  // -- Segment Expand Hint --
  segmentExpandHint: {
    alignItems: 'center',
    marginTop: Spacing.xs,
  },

  // =========================================================================
  // TEAMS TAB
  // =========================================================================

  // -- Summary Row --
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  summaryTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    fontSize: 10,
    marginTop: 2,
  },

  // -- Team Card --
  teamCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  teamIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  teamFillRatio: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // -- Team Color Bar --
  teamColorBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  teamColorBarFill: {
    height: 4,
    borderRadius: 2,
  },

  // -- Slot Grid --
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  slotCard: {
    width: '47%',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
  },
  slotHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  slotStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  slotRole: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  slotAssignee: {
    fontSize: 11,
    marginLeft: 10,
  },
  slotCriticalFlag: {
    marginLeft: 2,
  },

  // -- Team Coverage --
  teamCoverageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  teamCoverageLabel: {
    fontSize: 11,
  },
  teamCoverageValue: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // =========================================================================
  // CHECKLISTS TAB
  // =========================================================================

  // -- Overall Progress Card --
  overallProgressCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  overallProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  overallProgressTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  overallProgressValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Checklist Card --
  checklistCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  checklistIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistHeaderText: {
    flex: 1,
  },
  checklistName: {
    fontSize: 14,
    fontWeight: '600',
  },
  checklistProgress: {
    fontSize: 11,
    marginTop: 1,
  },

  // -- Checklist Items --
  checklistItemsContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  checklistItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  checklistItemTextCol: {
    flex: 1,
  },
  checklistItemLabel: {
    fontSize: 13,
    lineHeight: 18,
  },
  checklistItemAssignee: {
    fontSize: 11,
    marginTop: 1,
  },

  // =========================================================================
  // INCIDENTS TAB
  // =========================================================================

  incidentCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  incidentSeverityBar: {
    width: 4,
  },
  incidentContent: {
    flex: 1,
    padding: Spacing.md,
  },
  incidentHeader: {
    marginBottom: Spacing.xs,
  },
  incidentTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  incidentBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  incidentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  incidentMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  incidentMetaText: {
    fontSize: 11,
  },
  incidentDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },

  // -- Resolution Section --
  resolutionSection: {
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  resolutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  resolutionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  resolutionText: {
    fontSize: 12,
    lineHeight: 17,
  },

  // -- Prevention Section --
  preventionSection: {
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  preventionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  preventionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  preventionText: {
    fontSize: 12,
    lineHeight: 17,
  },

  // =========================================================================
  // BOTTOM SHEETS — Shared
  // =========================================================================

  sheetBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sheetSection: {
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  sheetDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  sheetDetailItem: {
    width: '45%',
  },
  sheetDetailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  sheetDetailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetDetailLabel: {
    fontSize: 11,
    marginTop: 1,
  },

  // -- Sheet List Row --
  sheetListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  sheetListTextCol: {
    flex: 1,
  },
  sheetListTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  sheetListSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  sheetEmptyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },

  // -- Sheet Team Row --
  sheetTeamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  sheetTeamDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sheetTeamName: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  sheetTeamRatio: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // -- Sheet dots --
  sheetTaskPriorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sheetSegmentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // -- Sheet Actions --
  sheetActions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sheetGhostButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sheetGhostButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
