/**
 * Tech & Compliance v2 — CEO / Commissioner Level
 * 6-tab flat workspace: Clearance | Scrutineering | Eligibility | Vehicles | Audits | Log
 * Top KPI strip always visible. No drill-down navigation.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

import {
  COMPLIANCE_CEO_KPIS,
  CLEARANCE_BOARD,
  SCRUTINEERING_QUEUE,
  CLEARANCE_STATUS_COLOR,
  CLEARANCE_STATUS_LABEL,
  DOMAIN_STATUS_COLOR,
  SCRUTINEERING_STAGE_COLOR,
  SCRUTINEERING_STAGE_LABEL,
} from '@/data/mock-ceo-competition';
import type {
  ClearanceBoardEntry,
  ScrutineeringItem,
  ComplianceCEOKPI,
} from '@/data/mock-ceo-competition';

import {
  COMPLIANCE_ENTITIES,
  COMPLIANCE_AUDIT_LOG,
  COMPLIANCE_SUMMARIES,
} from '@/data/mock-competition-v2';
import type {
  ComplianceWorkspace,
  ComplianceEntity,
  ComplianceAuditEntry,
  ComplianceSummary,
} from '@/data/mock-competition-v2';

// =============================================================================
// TYPES
// =============================================================================

type TabKey = 'clearance' | 'scrutineering' | 'eligibility' | 'vehicles' | 'audits' | 'log';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'clearance', label: 'Clearance' },
  { key: 'scrutineering', label: 'Scrutineering' },
  { key: 'eligibility', label: 'Eligibility' },
  { key: 'vehicles', label: 'Vehicles' },
  { key: 'audits', label: 'Audits' },
  { key: 'log', label: 'Log' },
];

// =============================================================================
// CONSTANTS
// =============================================================================

const STATUS_COLOR: Record<ComplianceEntity['status'], string> = {
  approved: '#22C55E',
  pending: '#F59E0B',
  flagged: '#EF4444',
  expired: '#9CA3AF',
};

const DOMAIN_LABELS: { key: keyof ClearanceBoardEntry['domains']; label: string }[] = [
  { key: 'technical', label: 'Tech' },
  { key: 'safety', label: 'Safety' },
  { key: 'medical', label: 'Med' },
  { key: 'financial', label: 'Fin' },
  { key: 'credential', label: 'Cred' },
];

// =============================================================================
// HELPERS
// =============================================================================

function getSummary(workspace: ComplianceWorkspace): ComplianceSummary | undefined {
  return COMPLIANCE_SUMMARIES.find((s) => s.workspace === workspace);
}

function getAuditDotColor(action: string): string {
  const lower = action.toLowerCase();
  if (lower.includes('approved') || lower.includes('pass')) return '#22C55E';
  if (lower.includes('flagged')) return '#EF4444';
  if (lower.includes('pending') || lower.includes('submitted') || lower.includes('started') || lower.includes('initiated')) return '#F59E0B';
  return '#6B7280';
}

// =============================================================================
// SUB-COMPONENT — CEO KPI Strip
// =============================================================================

function KPIStrip({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={styles.kpiRow}>
      {COMPLIANCE_CEO_KPIS.map((kpi) => (
        <View
          key={kpi.id}
          style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <ThemedText style={[styles.kpiLabel, { color: colors.textTertiary }]}>
            {kpi.label}
          </ThemedText>
          <ThemedText style={[styles.kpiValue, { color: kpi.color }]}>
            {kpi.value}
          </ThemedText>
          <ThemedText style={[styles.kpiSublabel, { color: colors.textTertiary }]}>
            {kpi.sublabel}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

// =============================================================================
// SUB-COMPONENT — Pill Nav
// =============================================================================

function PillNav({
  activeTab,
  onSelect,
  colors,
}: {
  activeTab: TabKey;
  onSelect: (tab: TabKey) => void;
  colors: typeof Colors.light;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.pillRow}
    >
      {TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            style={[
              styles.pill,
              { backgroundColor: isActive ? colors.text + 'E0' : colors.backgroundSecondary },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(tab.key);
            }}
          >
            <ThemedText
              style={[
                styles.pillText,
                { color: isActive ? colors.background : colors.textSecondary },
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
// TAB 1 — Clearance Board
// =============================================================================

function ClearanceBoardView({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={styles.tabContent}>
      {CLEARANCE_BOARD.map((entry) => (
        <ClearanceCard key={entry.id} entry={entry} colors={colors} />
      ))}
    </View>
  );
}

function ClearanceCard({
  entry,
  colors,
}: {
  entry: ClearanceBoardEntry;
  colors: typeof Colors.light;
}) {
  const statusColor = CLEARANCE_STATUS_COLOR[entry.clearanceStatus] ?? '#6B7280';
  const statusLabel = CLEARANCE_STATUS_LABEL[entry.clearanceStatus] ?? entry.clearanceStatus;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Top: entity name + type badge + status badge */}
      <View style={styles.cardTopRow}>
        <ThemedText style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>
          {entry.entityName}
        </ThemedText>
        <View style={[styles.badge, { backgroundColor: colors.backgroundSecondary }]}>
          <ThemedText style={[styles.badgeText, { color: colors.textSecondary }]}>
            {entry.entityType.toUpperCase()}
          </ThemedText>
        </View>
        <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
          <ThemedText style={[styles.badgeText, { color: statusColor }]}>
            {statusLabel}
          </ThemedText>
        </View>
      </View>

      {/* Team row */}
      <View style={styles.teamRow}>
        <View style={[styles.teamDot, { backgroundColor: entry.teamColor }]} />
        <ThemedText style={[styles.teamName, { color: colors.textSecondary }]}>
          {entry.teamName}
        </ThemedText>
      </View>

      {/* Domain checks row */}
      <View style={styles.domainRow}>
        {DOMAIN_LABELS.map(({ key, label }) => {
          const domainStatus = entry.domains[key];
          const domainColor = DOMAIN_STATUS_COLOR[domainStatus] ?? '#6B7280';
          return (
            <View key={key} style={styles.domainIndicator}>
              <View style={[styles.domainCircle, { backgroundColor: domainColor }]} />
              <ThemedText style={[styles.domainLabel, { color: colors.textTertiary }]}>
                {label}
              </ThemedText>
            </View>
          );
        })}
      </View>

      {/* Blockers */}
      {entry.blockers && entry.blockers.length > 0 && (
        <View style={styles.blockerList}>
          {entry.blockers.map((blocker, idx) => (
            <View key={idx} style={styles.blockerRow}>
              <View style={[styles.blockerDot, { backgroundColor: '#EF4444' }]} />
              <ThemedText style={[styles.blockerText, { color: colors.textSecondary }]}>
                {blocker}
              </ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Last updated */}
      <ThemedText style={[styles.timestampText, { color: colors.textTertiary }]}>
        Updated {entry.lastUpdated}
      </ThemedText>
    </View>
  );
}

// =============================================================================
// TAB 2 — Scrutineering Queue
// =============================================================================

function ScrutineeringQueueView({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={styles.tabContent}>
      {SCRUTINEERING_QUEUE.map((item) => (
        <ScrutineeringCard key={item.id} item={item} colors={colors} />
      ))}
    </View>
  );
}

function ScrutineeringCard({
  item,
  colors,
}: {
  item: ScrutineeringItem;
  colors: typeof Colors.light;
}) {
  const stageColor = SCRUTINEERING_STAGE_COLOR[item.stage] ?? '#6B7280';
  const stageLabel = SCRUTINEERING_STAGE_LABEL[item.stage] ?? item.stage;
  const isInProgress = item.stage === 'in_progress';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        isInProgress && styles.inProgressBorder,
      ]}
    >
      <View style={styles.scrutTopRow}>
        {/* Queue position */}
        <ThemedText style={[styles.queuePosition, { color: colors.text }]}>
          {item.queuePosition}
        </ThemedText>

        {/* Name + team */}
        <View style={styles.scrutMidBlock}>
          <ThemedText style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>
            {item.itemName}
          </ThemedText>
          <View style={styles.teamRow}>
            <View style={[styles.teamDot, { backgroundColor: item.teamColor }]} />
            <ThemedText style={[styles.teamName, { color: colors.textSecondary }]}>
              {item.teamName}
            </ThemedText>
          </View>
        </View>

        {/* Stage badge */}
        <View style={[styles.badge, { backgroundColor: stageColor + '20' }]}>
          <ThemedText style={[styles.badgeText, { color: stageColor }]}>
            {stageLabel}
          </ThemedText>
        </View>
      </View>

      {/* Inspector */}
      <ThemedText style={[styles.inspectorText, { color: colors.textTertiary }]}>
        Inspector: {item.inspector}
      </ThemedText>

      {/* Times */}
      {(item.startedAt || item.completedAt) && (
        <View style={styles.timesRow}>
          {item.startedAt && (
            <ThemedText style={[styles.timestampText, { color: colors.textTertiary }]}>
              Started: {item.startedAt}
            </ThemedText>
          )}
          {item.completedAt && (
            <ThemedText style={[styles.timestampText, { color: colors.textTertiary }]}>
              Completed: {item.completedAt}
            </ThemedText>
          )}
        </View>
      )}

      {/* Notes */}
      {item.notes ? (
        <ThemedText style={[styles.notesText, { color: colors.textSecondary }]}>
          {item.notes}
        </ThemedText>
      ) : null}
    </View>
  );
}

// =============================================================================
// TAB 3 — Eligibility
// =============================================================================

function EligibilityView({ colors }: { colors: typeof Colors.light }) {
  const entities = COMPLIANCE_ENTITIES.filter((e) => e.workspace === 'eligibility');

  if (entities.length === 0) {
    return (
      <View style={styles.emptyState}>
        <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
          No eligibility items.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      {entities.map((entity) => (
        <EntityCard key={entity.id} entity={entity} colors={colors} />
      ))}
    </View>
  );
}

// =============================================================================
// TAB 4 — Vehicles (Vehicle Tech / Homologation)
// =============================================================================

function VehiclesView({ colors }: { colors: typeof Colors.light }) {
  const entities = COMPLIANCE_ENTITIES.filter((e) => e.workspace === 'homologation');
  const summary = getSummary('homologation');

  return (
    <View style={styles.tabContent}>
      {/* Summary card for homologation */}
      {summary && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.summaryTitle, { color: colors.text }]}>
            {summary.label}
          </ThemedText>
          <View style={styles.summaryStatsRow}>
            <View style={styles.summaryStatItem}>
              <ThemedText style={[styles.summaryStatValue, { color: STATUS_COLOR.approved }]}>
                {summary.approved}
              </ThemedText>
              <ThemedText style={[styles.summaryStatLabel, { color: colors.textTertiary }]}>
                OK
              </ThemedText>
            </View>
            <View style={styles.summaryStatItem}>
              <ThemedText style={[styles.summaryStatValue, { color: STATUS_COLOR.pending }]}>
                {summary.pending}
              </ThemedText>
              <ThemedText style={[styles.summaryStatLabel, { color: colors.textTertiary }]}>
                PEND
              </ThemedText>
            </View>
            <View style={styles.summaryStatItem}>
              <ThemedText style={[styles.summaryStatValue, { color: STATUS_COLOR.flagged }]}>
                {summary.flagged}
              </ThemedText>
              <ThemedText style={[styles.summaryStatLabel, { color: colors.textTertiary }]}>
                FLAG
              </ThemedText>
            </View>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.backgroundSecondary }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.round((summary.approved / Math.max(summary.total, 1)) * 100)}%`,
                  backgroundColor: STATUS_COLOR.approved,
                },
              ]}
            />
          </View>
          <ThemedText style={[styles.progressLabel, { color: colors.textTertiary }]}>
            {summary.approved}/{summary.total} approved
          </ThemedText>
        </View>
      )}

      {entities.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No vehicle tech items.
          </ThemedText>
        </View>
      ) : (
        entities.map((entity) => (
          <EntityCard key={entity.id} entity={entity} colors={colors} />
        ))
      )}
    </View>
  );
}

// =============================================================================
// TAB 5 — Compliance Audits
// =============================================================================

function AuditsView({ colors }: { colors: typeof Colors.light }) {
  const displaySummaries = COMPLIANCE_SUMMARIES.filter((s) => s.workspace !== 'audit_log');

  return (
    <View style={styles.tabContent}>
      <View style={styles.auditSummaryGrid}>
        {displaySummaries.map((summary) => {
          const approvedRatio = summary.total > 0 ? summary.approved / summary.total : 0;

          return (
            <View
              key={summary.workspace}
              style={[
                styles.auditSummaryCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.auditSummaryHeader}>
                <IconSymbol name={summary.icon as any} size={16} color={colors.textSecondary} />
                <ThemedText
                  style={[styles.auditSummaryLabel, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {summary.label}
                </ThemedText>
              </View>

              <View style={styles.summaryStatsRow}>
                <View style={styles.summaryStatItem}>
                  <ThemedText style={[styles.summaryStatValue, { color: STATUS_COLOR.approved }]}>
                    {summary.approved}
                  </ThemedText>
                  <ThemedText style={[styles.summaryStatLabel, { color: colors.textTertiary }]}>
                    OK
                  </ThemedText>
                </View>
                <View style={styles.summaryStatItem}>
                  <ThemedText style={[styles.summaryStatValue, { color: STATUS_COLOR.pending }]}>
                    {summary.pending}
                  </ThemedText>
                  <ThemedText style={[styles.summaryStatLabel, { color: colors.textTertiary }]}>
                    PEND
                  </ThemedText>
                </View>
                <View style={styles.summaryStatItem}>
                  <ThemedText style={[styles.summaryStatValue, { color: STATUS_COLOR.flagged }]}>
                    {summary.flagged}
                  </ThemedText>
                  <ThemedText style={[styles.summaryStatLabel, { color: colors.textTertiary }]}>
                    FLAG
                  </ThemedText>
                </View>
              </View>

              <View style={[styles.progressTrack, { backgroundColor: colors.backgroundSecondary }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.round(approvedRatio * 100)}%`,
                      backgroundColor: STATUS_COLOR.approved,
                    },
                  ]}
                />
              </View>

              <ThemedText style={[styles.progressLabel, { color: colors.textTertiary }]}>
                {summary.approved}/{summary.total} approved
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// =============================================================================
// TAB 6 — Audit Log
// =============================================================================

function AuditLogView({ colors }: { colors: typeof Colors.light }) {
  if (COMPLIANCE_AUDIT_LOG.length === 0) {
    return (
      <View style={styles.emptyState}>
        <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
          No audit entries recorded.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      {COMPLIANCE_AUDIT_LOG.map((entry) => (
        <AuditLogEntry key={entry.id} entry={entry} colors={colors} />
      ))}
    </View>
  );
}

function AuditLogEntry({
  entry,
  colors,
}: {
  entry: ComplianceAuditEntry;
  colors: typeof Colors.light;
}) {
  const dotColor = getAuditDotColor(entry.action);
  const workspaceSummary = getSummary(entry.workspace);
  const wsLabel = workspaceSummary?.label ?? entry.workspace;

  return (
    <View style={styles.timelineEntry}>
      {/* Timeline column */}
      <View style={styles.timelineCol}>
        <View style={[styles.timelineDot, { backgroundColor: dotColor }]} />
        <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
      </View>

      {/* Content */}
      <View style={styles.timelineContent}>
        <ThemedText style={[styles.timelineTimestamp, { color: colors.textTertiary }]}>
          {entry.timestamp}
        </ThemedText>

        <View style={styles.timelineActionRow}>
          <ThemedText style={[styles.timelineAction, { color: dotColor }]}>
            {entry.action}
          </ThemedText>
          <ThemedText
            style={[styles.timelineEntity, { color: colors.text }]}
            numberOfLines={1}
          >
            {' '}{entry.entity}
          </ThemedText>
        </View>

        <ThemedText style={[styles.timelineActor, { color: colors.textSecondary }]}>
          {entry.actor}
        </ThemedText>

        <View style={[styles.wsBadge, { backgroundColor: colors.backgroundSecondary }]}>
          <ThemedText style={[styles.wsBadgeText, { color: colors.textSecondary }]}>
            {wsLabel}
          </ThemedText>
        </View>

        <ThemedText style={[styles.timelineDetails, { color: colors.textTertiary }]}>
          {entry.details}
        </ThemedText>
      </View>
    </View>
  );
}

// =============================================================================
// SHARED — Entity Card (Eligibility + Vehicles tabs)
// =============================================================================

function EntityCard({
  entity,
  colors,
}: {
  entity: ComplianceEntity;
  colors: typeof Colors.light;
}) {
  const statusColor = STATUS_COLOR[entity.status];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Top Row: Status + Name + Type */}
      <View style={styles.cardTopRow}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <View style={{ flex: 1 }}>
          <ThemedText style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>
            {entity.name}
          </ThemedText>
        </View>
        <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
          <ThemedText style={[styles.badgeText, { color: statusColor }]}>
            {entity.type.toUpperCase()}
          </ThemedText>
        </View>
      </View>

      {/* Team Row */}
      <View style={styles.teamRow}>
        <View style={[styles.teamDot, { backgroundColor: entity.teamColor }]} />
        <ThemedText style={[styles.teamName, { color: colors.textSecondary }]}>
          {entity.teamName}
        </ThemedText>
      </View>

      {/* Dates Row */}
      <View style={styles.datesRow}>
        <ThemedText style={[styles.dateText, { color: colors.textTertiary }]}>
          Inspected: {entity.lastInspected}
        </ThemedText>
        <ThemedText style={[styles.dateText, { color: colors.textTertiary }]}>
          Expires: {entity.expiresAt}
        </ThemedText>
      </View>

      {/* Notes */}
      {entity.notes ? (
        <ThemedText style={[styles.notesText, { color: statusColor }]}>
          {entity.notes}
        </ThemedText>
      ) : null}
    </View>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function TechComplianceV2({ colors }: { colors: typeof Colors.light }) {
  const [activeTab, setActiveTab] = useState<TabKey>('clearance');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'clearance':
        return <ClearanceBoardView colors={colors} />;
      case 'scrutineering':
        return <ScrutineeringQueueView colors={colors} />;
      case 'eligibility':
        return <EligibilityView colors={colors} />;
      case 'vehicles':
        return <VehiclesView colors={colors} />;
      case 'audits':
        return <AuditsView colors={colors} />;
      case 'log':
        return <AuditLogView colors={colors} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* KPI Strip — always visible */}
      <KPIStrip colors={colors} />

      {/* Pill Nav — always visible */}
      <PillNav activeTab={activeTab} onSelect={setActiveTab} colors={colors} />

      {/* Tab Content — scrollable */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderTabContent()}
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
  // KPI Strip
  // ---------------------------------------------------------------------------
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  kpiSublabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },

  // ---------------------------------------------------------------------------
  // Pill Nav
  // ---------------------------------------------------------------------------
  pillRow: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // ---------------------------------------------------------------------------
  // Scroll / Tab Content
  // ---------------------------------------------------------------------------
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  tabContent: {
    gap: 10,
  },

  // ---------------------------------------------------------------------------
  // Cards (shared)
  // ---------------------------------------------------------------------------
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },

  // ---------------------------------------------------------------------------
  // Badge (shared)
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
  // Team Row (shared)
  // ---------------------------------------------------------------------------
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  teamDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  teamName: {
    fontSize: 13,
    fontWeight: '500',
  },

  // ---------------------------------------------------------------------------
  // Status Dot (shared)
  // ---------------------------------------------------------------------------
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // ---------------------------------------------------------------------------
  // Domain Indicators (Clearance)
  // ---------------------------------------------------------------------------
  domainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  domainIndicator: {
    alignItems: 'center',
    gap: 4,
  },
  domainCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  domainLabel: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },

  // ---------------------------------------------------------------------------
  // Blockers (Clearance)
  // ---------------------------------------------------------------------------
  blockerList: {
    marginTop: 10,
    gap: 4,
  },
  blockerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  blockerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  blockerText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },

  // ---------------------------------------------------------------------------
  // Timestamp (shared)
  // ---------------------------------------------------------------------------
  timestampText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 8,
  },

  // ---------------------------------------------------------------------------
  // Scrutineering
  // ---------------------------------------------------------------------------
  scrutTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  queuePosition: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
    minWidth: 28,
    textAlign: 'center',
  },
  scrutMidBlock: {
    flex: 1,
  },
  inspectorText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
  },
  timesRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  inProgressBorder: {
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  notesText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 17,
  },

  // ---------------------------------------------------------------------------
  // Entity Card (Eligibility / Vehicles)
  // ---------------------------------------------------------------------------
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // ---------------------------------------------------------------------------
  // Audits Summary Grid
  // ---------------------------------------------------------------------------
  auditSummaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  auditSummaryCard: {
    width: '47.5%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  auditSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  auditSummaryLabel: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryStatItem: {
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  summaryStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '500',
  },

  // ---------------------------------------------------------------------------
  // Audit Log Timeline
  // ---------------------------------------------------------------------------
  timelineEntry: {
    flexDirection: 'row',
    paddingBottom: 16,
  },
  timelineCol: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  timelineLine: {
    width: 1,
    flex: 1,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 10,
  },
  timelineTimestamp: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 3,
  },
  timelineActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  timelineAction: {
    fontSize: 14,
    fontWeight: '700',
  },
  timelineEntity: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  timelineActor: {
    fontSize: 12,
    marginTop: 3,
  },
  wsBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginTop: 6,
  },
  wsBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  timelineDetails: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },

  // ---------------------------------------------------------------------------
  // Empty State
  // ---------------------------------------------------------------------------
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
