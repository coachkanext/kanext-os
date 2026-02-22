/**
 * Business Organization Program Tab -- V3
 * 3-pill ViewBar: Identity | Entities | Operations
 * KaNeXT founder view. All data inline.
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

// =============================================================================
// TYPES
// =============================================================================

type ViewMode = 'identity' | 'entities' | 'operations';

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// INLINE DATA
// =============================================================================

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'entities', label: 'Entities' },
  { id: 'operations', label: 'Operations' },
];

const PROOF_INSTITUTIONS = [
  { name: 'KaNeXT', type: 'Sports' },
  { name: 'KaNeXT Church', type: 'Church' },
  { name: 'KaNeXT', type: 'Competition' },
];

const MILESTONES = [
  { id: 'm1', label: 'MVP Complete', date: 'Sep 2024', status: 'complete' as const },
  { id: 'm2', label: 'Beta Launch', date: 'Jan 2025', status: 'complete' as const },
  { id: 'm3', label: 'V1 Ship', date: 'Jun 2025', status: 'in_progress' as const },
  { id: 'm4', label: 'Series A', date: 'Q4 2025', status: 'planned' as const },
];

const ENTITIES = [
  {
    id: 'e1',
    name: 'OSK Group LLC',
    type: 'Holding Company',
    state: 'Delaware',
    status: 'Active',
    purpose: 'Parent holding entity for all KaNeXT operating and IP subsidiaries. Delaware formation for investor-friendly governance.',
  },
  {
    id: 'e2',
    name: 'KaNeXT Operations LLC',
    type: 'Operating Company',
    state: 'Tennessee',
    status: 'Active',
    purpose: 'Day-to-day operations, employment, revenue collection, and customer contracts. Ridgemont formation for operational base.',
  },
  {
    id: 'e3',
    name: 'KaNeXT IP Holdings LLC',
    type: 'IP Protection',
    state: 'Delaware',
    status: 'Active',
    purpose: 'Owns all intellectual property including trademarks, patents, trade secrets, and proprietary algorithms. Licenses IP to OpCo.',
  },
];

const TASKS = [
  { id: 't1', label: 'Finalize pitch deck for pre-seed', priority: 'high' as const, assignee: 'Alex M.' },
  { id: 't2', label: 'Complete NAA player pool scrape', priority: 'high' as const, assignee: 'Engineering' },
  { id: 't3', label: 'File KaNeXT trademark', priority: 'medium' as const, assignee: 'Legal' },
  { id: 't4', label: 'Onboard 2 beta partners', priority: 'medium' as const, assignee: 'Alex M.' },
  { id: 't5', label: 'Set up CI/CD pipeline', priority: 'low' as const, assignee: 'Engineering' },
];

const SPRINT_CURRENT = [
  { id: 'sc1', label: 'V3 org tab components', status: 'in_progress' as const },
  { id: 'sc2', label: 'KR engine pro mode', status: 'in_progress' as const },
  { id: 'sc3', label: 'Entity sheet polish', status: 'done' as const },
  { id: 'sc4', label: 'Calendar games view', status: 'done' as const },
];

const SPRINT_BACKLOG = [
  { id: 'sb1', label: 'Push notification system' },
  { id: 'sb2', label: 'Church tithe integration' },
  { id: 'sb3', label: 'Education transcript module' },
  { id: 'sb4', label: 'Competition bracket engine' },
  { id: 'sb5', label: 'Analytics dashboard v1' },
  { id: 'sb6', label: 'Offline mode sync' },
];

const APPROVALS = [
  { id: 'a1', label: 'AWS infrastructure upgrade', amount: '$2,400', from: 'CTO' },
  { id: 'a2', label: 'Legal retainer renewal', amount: '$3,000', from: 'Operations' },
  { id: 'a3', label: 'Conference travel budget', amount: '$1,800', from: 'Head of Product' },
];

const OPS_MILESTONES = [
  { id: 'om1', label: 'Beta launch', target: 'Jan 2025', status: 'complete' as const },
  { id: 'om2', label: '1,000 player profiles', target: 'Mar 2025', status: 'complete' as const },
  { id: 'om3', label: '10 institutional partners', target: 'Jun 2025', status: 'in_progress' as const },
  { id: 'om4', label: 'Revenue milestone $50K MRR', target: 'Dec 2025', status: 'planned' as const },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#A1A1AA',
};

const STATUS_COLORS: Record<string, string> = {
  complete: '#22C55E',
  in_progress: '#1D9BF0',
  planned: '#A1A1AA',
  done: '#22C55E',
};

const STATUS_LABELS: Record<string, string> = {
  complete: 'COMPLETE',
  in_progress: 'IN PROGRESS',
  planned: 'PLANNED',
  done: 'DONE',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function BizProgram({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewMode>('identity');

  const handleViewPress = useCallback((id: ViewMode) => {
    Haptics.selectionAsync();
    setActiveView(id);
  }, []);

  // ---------------------------------------------------------------------------
  // IDENTITY
  // ---------------------------------------------------------------------------
  const renderIdentity = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Brand Card */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.brandName, { color: colors.text }]}>KaNeXT</ThemedText>
        <ThemedText style={[s.brandTagline, { color: colors.textSecondary }]}>
          The institutional operating system
        </ThemedText>
        <View style={s.brandMetaRow}>
          <View style={s.brandMetaItem}>
            <ThemedText style={[s.brandMetaLabel, { color: colors.textSecondary }]}>Founded</ThemedText>
            <ThemedText style={[s.brandMetaValue, { color: colors.text }]}>2023</ThemedText>
          </View>
          <View style={s.brandMetaItem}>
            <ThemedText style={[s.brandMetaLabel, { color: colors.textSecondary }]}>HQ</ThemedText>
            <ThemedText style={[s.brandMetaValue, { color: colors.text }]}>Miami, FL</ThemedText>
          </View>
        </View>
      </View>

      {/* Product */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>PRODUCT</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.cardTitle, { color: colors.text }]}>KaNeXT OS</ThemedText>
        <ThemedText style={[s.cardSubtitle, { color: colors.textSecondary }]}>
          Cross-platform mobile application with 5 institutional modes
        </ThemedText>
        <View style={s.modeChipsRow}>
          {['Sports', 'Church', 'Education', 'Business', 'Competition'].map((mode) => (
            <View key={mode} style={[s.modeChip, { backgroundColor: accentColor + '15' }]}>
              <ThemedText style={[s.modeChipText, { color: accentColor }]}>{mode}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Proof Institutions */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>PROOF INSTITUTIONS</ThemedText>
      {PROOF_INSTITUTIONS.map((inst) => (
        <View
          key={inst.name}
          style={[s.listRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
        >
          <View style={[s.institutionIcon, { backgroundColor: accentColor + '15' }]}>
            <IconSymbol name="building.2.fill" size={16} color={accentColor} />
          </View>
          <View style={s.listRowContent}>
            <ThemedText style={[s.listRowTitle, { color: colors.text }]}>{inst.name}</ThemedText>
            <ThemedText style={[s.listRowSub, { color: colors.textSecondary }]}>{inst.type}</ThemedText>
          </View>
        </View>
      ))}

      {/* Milestones Timeline */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: Spacing.lg }]}>MILESTONES</ThemedText>
      {MILESTONES.map((ms, idx) => {
        const stColor = STATUS_COLORS[ms.status];
        return (
          <View key={ms.id} style={s.timelineItem}>
            <View style={s.timelineLine}>
              <View style={[s.timelineDot, { backgroundColor: stColor }]} />
              {idx < MILESTONES.length - 1 && (
                <View style={[s.timelineConnector, { backgroundColor: colors.border }]} />
              )}
            </View>
            <View style={[s.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={s.timelineCardHeader}>
                <ThemedText style={[s.timelineLabel, { color: colors.text }]}>{ms.label}</ThemedText>
                <View style={[s.statusBadge, { backgroundColor: stColor + '20' }]}>
                  <ThemedText style={[s.statusBadgeText, { color: stColor }]}>
                    {STATUS_LABELS[ms.status]}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[s.timelineDate, { color: colors.textSecondary }]}>{ms.date}</ThemedText>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  // ---------------------------------------------------------------------------
  // ENTITIES
  // ---------------------------------------------------------------------------
  const renderEntities = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>CORPORATE STRUCTURE</ThemedText>
      {ENTITIES.map((entity) => (
        <View key={entity.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}>
          <View style={s.entityHeader}>
            <View style={[s.entityIcon, { backgroundColor: accentColor + '15' }]}>
              <IconSymbol name="building.2.fill" size={18} color={accentColor} />
            </View>
            <View style={s.entityHeaderInfo}>
              <ThemedText style={[s.cardTitle, { color: colors.text }]}>{entity.name}</ThemedText>
              <ThemedText style={[s.entityType, { color: colors.textSecondary }]}>{entity.type}</ThemedText>
            </View>
            <View style={[s.statusBadge, { backgroundColor: '#22C55E20' }]}>
              <ThemedText style={[s.statusBadgeText, { color: '#22C55E' }]}>{entity.status.toUpperCase()}</ThemedText>
            </View>
          </View>

          <View style={[s.entityDetailRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
            <View style={s.entityDetailItem}>
              <ThemedText style={[s.entityDetailLabel, { color: colors.textSecondary }]}>State</ThemedText>
              <ThemedText style={[s.entityDetailValue, { color: colors.text }]}>{entity.state}</ThemedText>
            </View>
            <View style={s.entityDetailItem}>
              <ThemedText style={[s.entityDetailLabel, { color: colors.textSecondary }]}>Type</ThemedText>
              <ThemedText style={[s.entityDetailValue, { color: colors.text }]}>{entity.type}</ThemedText>
            </View>
          </View>

          <ThemedText style={[s.entityPurpose, { color: colors.textSecondary }]}>{entity.purpose}</ThemedText>
        </View>
      ))}
    </ScrollView>
  );

  // ---------------------------------------------------------------------------
  // OPERATIONS
  // ---------------------------------------------------------------------------
  const renderOperations = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Tasks */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>TASKS ({TASKS.length})</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {TASKS.map((task, idx) => (
          <View
            key={task.id}
            style={[
              s.taskRow,
              idx < TASKS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={[s.priorityDot, { backgroundColor: PRIORITY_COLORS[task.priority] }]} />
            <View style={s.taskContent}>
              <ThemedText style={[s.taskLabel, { color: colors.text }]} numberOfLines={1}>{task.label}</ThemedText>
              <ThemedText style={[s.taskAssignee, { color: colors.textSecondary }]}>{task.assignee}</ThemedText>
            </View>
            <View style={[s.statusBadge, { backgroundColor: PRIORITY_COLORS[task.priority] + '20' }]}>
              <ThemedText style={[s.statusBadgeText, { color: PRIORITY_COLORS[task.priority] }]}>
                {task.priority.toUpperCase()}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Sprint Board */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: Spacing.lg }]}>CURRENT SPRINT</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {SPRINT_CURRENT.map((item, idx) => {
          const stColor = STATUS_COLORS[item.status];
          return (
            <View
              key={item.id}
              style={[
                s.sprintRow,
                idx < SPRINT_CURRENT.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.sprintStatusDot, { backgroundColor: stColor }]} />
              <ThemedText style={[s.sprintLabel, { color: colors.text }]} numberOfLines={1}>{item.label}</ThemedText>
              <View style={[s.statusBadge, { backgroundColor: stColor + '20' }]}>
                <ThemedText style={[s.statusBadgeText, { color: stColor }]}>{STATUS_LABELS[item.status]}</ThemedText>
              </View>
            </View>
          );
        })}
      </View>

      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: Spacing.md }]}>BACKLOG ({SPRINT_BACKLOG.length})</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {SPRINT_BACKLOG.map((item, idx) => (
          <View
            key={item.id}
            style={[
              s.backlogRow,
              idx < SPRINT_BACKLOG.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <IconSymbol name="circle.fill" size={8} color={colors.textTertiary} />
            <ThemedText style={[s.backlogLabel, { color: colors.textSecondary }]}>{item.label}</ThemedText>
          </View>
        ))}
      </View>

      {/* Pending Approvals */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: Spacing.lg }]}>PENDING APPROVALS ({APPROVALS.length})</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {APPROVALS.map((appr, idx) => (
          <View
            key={appr.id}
            style={[
              s.approvalRow,
              idx < APPROVALS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={s.approvalContent}>
              <ThemedText style={[s.approvalLabel, { color: colors.text }]}>{appr.label}</ThemedText>
              <ThemedText style={[s.approvalFrom, { color: colors.textSecondary }]}>From: {appr.from}</ThemedText>
            </View>
            <ThemedText style={[s.approvalAmount, { color: '#F59E0B' }]}>{appr.amount}</ThemedText>
          </View>
        ))}
      </View>

      {/* Ops Milestones */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: Spacing.lg }]}>MILESTONES</ThemedText>
      {OPS_MILESTONES.map((ms) => {
        const stColor = STATUS_COLORS[ms.status];
        return (
          <View key={ms.id} style={[s.opsMilestone, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.opsMilestoneLeft}>
              <ThemedText style={[s.opsMilestoneLabel, { color: colors.text }]}>{ms.label}</ThemedText>
              <ThemedText style={[s.opsMilestoneTarget, { color: colors.textSecondary }]}>Target: {ms.target}</ThemedText>
            </View>
            <View style={[s.statusBadge, { backgroundColor: stColor + '20' }]}>
              <ThemedText style={[s.statusBadgeText, { color: stColor }]}>{STATUS_LABELS[ms.status]}</ThemedText>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <View style={s.container}>
      {/* ViewBar */}
      <View style={s.viewBar}>
        {VIEWS.map((v) => {
          const isActive = v.id === activeView;
          return (
            <Pressable
              key={v.id}
              style={[
                s.viewPill,
                { backgroundColor: isActive ? accentColor : '#2F3336' },
              ]}
              onPress={() => handleViewPress(v.id)}
            >
              <ThemedText style={[s.viewPillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {v.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      {activeView === 'identity' && renderIdentity()}
      {activeView === 'entities' && renderEntities()}
      {activeView === 'operations' && renderOperations()}
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

  // ViewBar
  viewBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  viewPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  viewPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Scroll
  scroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // Section Header
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  // Card
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  // Brand
  brandName: {
    fontSize: 24,
    fontWeight: '800',
  },
  brandTagline: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
  },
  brandMetaRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: Spacing.xl,
  },
  brandMetaItem: {
    gap: 2,
  },
  brandMetaLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  brandMetaValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Mode chips
  modeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.sm,
  },
  modeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  modeChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Status badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // List row
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
  },
  listRowContent: {
    flex: 1,
  },
  listRowTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  listRowSub: {
    fontSize: 12,
    marginTop: 2,
  },

  // Institution icon
  institutionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Timeline
  timelineItem: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  timelineLine: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 14,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginLeft: Spacing.sm,
  },
  timelineCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  timelineDate: {
    fontSize: 12,
    marginTop: 4,
  },

  // Entity
  entityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  entityHeaderInfo: {
    flex: 1,
  },
  entityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entityType: {
    fontSize: 12,
    marginTop: 2,
  },
  entityDetailRow: {
    flexDirection: 'row',
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
    gap: Spacing.lg,
  },
  entityDetailItem: {
    gap: 2,
  },
  entityDetailLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  entityDetailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  entityPurpose: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: Spacing.sm,
  },

  // Tasks
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskContent: {
    flex: 1,
  },
  taskLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  taskAssignee: {
    fontSize: 11,
    marginTop: 2,
  },

  // Sprint
  sprintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
  },
  sprintStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sprintLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },

  // Backlog
  backlogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
  },
  backlogLabel: {
    flex: 1,
    fontSize: 13,
  },

  // Approvals
  approvalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  approvalContent: {
    flex: 1,
  },
  approvalLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  approvalFrom: {
    fontSize: 11,
    marginTop: 2,
  },
  approvalAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // Ops Milestones
  opsMilestone: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: Spacing.sm,
  },
  opsMilestoneLeft: {
    flex: 1,
  },
  opsMilestoneLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  opsMilestoneTarget: {
    fontSize: 12,
    marginTop: 2,
  },
});
