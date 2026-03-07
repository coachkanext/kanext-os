/**
 * Organization Compliance Tab — 12-tab Compliance Hub.
 * Dashboard, Requirements, Checklists, Evidence, Incidents,
 * Actions, Training, Policies, Deadlines, Reports, Audit, Settings.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, FlatList, TextInput, Pressable, Switch, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
;
import type { Mode } from '@/types';
import {
  COMPLIANCE_TABS,
  COMPLIANCE_SCOPE_CHIPS,
  getComplianceData,
  REQUIREMENT_STATUS_COLOR,
  EVIDENCE_STATUS_COLOR,
  INCIDENT_STATUS_COLOR,
  SEVERITY_COLOR,
  CHECKLIST_STATUS_COLOR,
  DASHBOARD_STATUS_COLOR,
} from '@/data/mock-compliance-v2';
import type {
  ComplianceTabId,
  ComplianceDashboardBlock,
  ComplianceRequirement,
  ComplianceChecklist,
  ComplianceEvidence,
  ComplianceIncident,
  ComplianceAction,
  ComplianceTraining,
  CompliancePolicy,
  ComplianceDeadline,
  ComplianceReport,
  ComplianceAuditEntry,
  ComplianceSortOption,
} from '@/data/mock-compliance-v2';

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  mode: Mode;
  colors: typeof Colors.light;
  accentColor: string;
}

// =============================================================================
// SUB-COMPONENTS — Badges
// =============================================================================

function RequirementStatusBadge({ status }: { status: ComplianceRequirement['status'] }) {
  const fg = REQUIREMENT_STATUS_COLOR[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '33' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{status.replace('-', ' ')}</ThemedText>
    </View>
  );
}

function EvidenceStatusBadge({ status }: { status: ComplianceEvidence['status'] }) {
  const fg = EVIDENCE_STATUS_COLOR[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '33' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{status}</ThemedText>
    </View>
  );
}

function IncidentStatusBadge({ status }: { status: ComplianceIncident['status'] }) {
  const fg = INCIDENT_STATUS_COLOR[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '33' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{status}</ThemedText>
    </View>
  );
}

function ChecklistStatusBadge({ status }: { status: ComplianceChecklist['status'] }) {
  const fg = CHECKLIST_STATUS_COLOR[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '33' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{status.replace('-', ' ')}</ThemedText>
    </View>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const fg = SEVERITY_COLOR[severity] ?? '#A1A1AA';
  return (
    <View style={[s.badge, { backgroundColor: fg + '33' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{severity}</ThemedText>
    </View>
  );
}

function EmptyState({ icon, text, colors: c }: { icon: string; text: string; colors: typeof Colors.light }) {
  return (
    <View style={s.emptyState}>
      <IconSymbol name={icon as any} size={40} color={c.textTertiary} />
      <ThemedText style={[s.emptyText, { color: c.textSecondary }]}>{text}</ThemedText>
    </View>
  );
}

// =============================================================================
// MODE LABEL
// =============================================================================

const MODE_LABELS: Record<Mode, string> = {
  sports: 'Sports',
  business: 'Business',
  church: 'Faith',
  education: 'Education',
  competition: 'Competition',
};

// =============================================================================
// ACTION STATUS COLORS
// =============================================================================

const ACTION_STATUS_COLOR: Record<ComplianceAction['status'], string> = {
  pending: '#F59E0B',
  'in-progress': '#1D9BF0',
  completed: '#22C55E',
  verified: '#1D9BF0',
};

// =============================================================================
// TRAINING STATUS COLORS
// =============================================================================

const TRAINING_STATUS_COLOR: Record<ComplianceTraining['status'], string> = {
  assigned: '#A1A1AA',
  'in-progress': '#1D9BF0',
  completed: '#22C55E',
  overdue: '#EF4444',
};

// =============================================================================
// POLICY STATUS COLORS
// =============================================================================

const POLICY_STATUS_COLOR: Record<CompliancePolicy['status'], string> = {
  active: '#22C55E',
  'under-review': '#F59E0B',
  draft: '#A1A1AA',
  archived: '#A1A1AA',
};

// =============================================================================
// DEADLINE STATUS COLORS
// =============================================================================

const DEADLINE_STATUS_COLOR: Record<ComplianceDeadline['status'], string> = {
  upcoming: '#22C55E',
  'due-soon': '#F59E0B',
  overdue: '#EF4444',
  completed: '#A1A1AA',
};

// =============================================================================
// REPORT FORMAT COLORS
// =============================================================================

const REPORT_FORMAT_COLOR: Record<ComplianceReport['format'], string> = {
  PDF: '#1D9BF0',
  CSV: '#22C55E',
  XLSX: '#F59E0B',
};

// =============================================================================
// AUDIT ICON MAP
// =============================================================================

function auditIcon(action: string): string {
  switch (action) {
    case 'requirement_verified': return 'checkmark.seal.fill';
    case 'evidence_submitted': return 'doc.fill';
    case 'incident_opened': return 'exclamationmark.triangle.fill';
    case 'checklist_completed': return 'checklist';
    case 'policy_updated': return 'doc.text.fill';
    case 'training_completed': return 'graduationcap.fill';
    case 'deadline_met': return 'clock.fill';
    case 'action_verified': return 'checkmark.circle.fill';
    default: return 'clock.fill';
  }
}

function auditColor(action: string): string {
  switch (action) {
    case 'requirement_verified': return '#1D9BF0';
    case 'evidence_submitted': return '#1D9BF0';
    case 'incident_opened': return '#EF4444';
    case 'checklist_completed': return '#22C55E';
    case 'policy_updated': return '#F59E0B';
    case 'training_completed': return '#1D9BF0';
    case 'deadline_met': return '#22C55E';
    case 'action_verified': return '#1D9BF0';
    default: return '#A1A1AA';
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function OrgComplianceTab({ mode, colors, accentColor }: Props) {
  // === State ===
  const [activeTab, setActiveTab] = useState<ComplianceTabId>('dashboard');
  const [activeScope, setActiveScope] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  // Filter state
  const [filterSort, setFilterSort] = useState<ComplianceSortOption>('due-soonest');
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [filterSeverities, setFilterSeverities] = useState<string[]>([]);

  // Settings toggles (local visual state)
  const [settingToggles, setSettingToggles] = useState<Record<string, boolean>>({});

  // === Data ===
  const data = useMemo(() => getComplianceData(mode), [mode]);
  const scopeChips = COMPLIANCE_SCOPE_CHIPS[mode];

  // === Callbacks ===
  const handleTabPress = useCallback((tabId: ComplianceTabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  }, []);

  const handleScopePress = useCallback((index: number) => {
    Haptics.selectionAsync();
    setActiveScope(index);
  }, []);

  const handleFilterToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilterVisible(true);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilterSort('due-soonest');
    setFilterStatuses([]);
    setFilterSeverities([]);
  }, []);

  const toggleFilterStatus = useCallback((st: string) => {
    setFilterStatuses((prev) =>
      prev.includes(st) ? prev.filter((x) => x !== st) : [...prev, st],
    );
  }, []);

  const toggleFilterSeverity = useCallback((sev: string) => {
    setFilterSeverities((prev) =>
      prev.includes(sev) ? prev.filter((x) => x !== sev) : [...prev, sev],
    );
  }, []);

  // ===================================================================
  // RENDER — TAB CONTENT
  // ===================================================================

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'requirements':
        return renderRequirements();
      case 'checklists':
        return renderChecklists();
      case 'evidence':
        return renderEvidence();
      case 'incidents':
        return renderIncidents();
      case 'actions':
        return renderActions();
      case 'training':
        return renderTraining();
      case 'policies':
        return renderPolicies();
      case 'deadlines':
        return renderDeadlines();
      case 'reports':
        return renderReports();
      case 'audit':
        return renderAudit();
      case 'settings':
        return renderSettings();
      default:
        return null;
    }
  };

  // === Tab 1: Dashboard ===
  const renderDashboard = () => (
    <View style={s.tabContent}>
      <View style={s.dashboardGrid}>
        {data.dashboard.map((block: ComplianceDashboardBlock) => {
          const statusColor = DASHBOARD_STATUS_COLOR[block.status];
          return (
            <View
              key={block.id}
              style={[s.dashboardCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <ThemedText style={[s.dashboardLabel, { color: colors.textTertiary }]}>{block.label}</ThemedText>
              <View style={s.dashboardValueRow}>
                <ThemedText style={[s.dashboardValue, { color: colors.text }]}>{block.value}</ThemedText>
                <View style={[s.statusDot, { backgroundColor: statusColor }]} />
              </View>
              {block.detail != null && (
                <ThemedText style={[s.dashboardDetail, { color: colors.textSecondary }]} numberOfLines={2}>
                  {block.detail}
                </ThemedText>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );

  // === Tab 2: Requirements ===
  const renderRequirements = () => (
    <FlatList<ComplianceRequirement>
      data={data.requirements}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="checkmark.shield" text="No requirements" colors={colors} />}
      renderItem={({ item }) => {
        const isOverdue = item.status === 'overdue';
        return (
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.listCardInfo}>
              <View style={s.reqTopRow}>
                <ThemedText style={s.listCardTitle} numberOfLines={1}>{item.title}</ThemedText>
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]} numberOfLines={1}>
                {item.description}
              </ThemedText>
              <View style={s.reqBadgeRow}>
                <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.category}</ThemedText>
                </View>
                <View style={[s.badge, { backgroundColor: colors.text + '10' }]}>
                  <ThemedText style={[s.badgeText, { color: colors.textSecondary }]}>{item.cadence}</ThemedText>
                </View>
                <SeverityBadge severity={item.severity} />
                <RequirementStatusBadge status={item.status} />
              </View>
              <View style={s.reqBottomRow}>
                <View style={s.reqOwnerRow}>
                  <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
                    <ThemedText style={[s.avatarText, { color: accentColor }]}>{item.ownerInitials}</ThemedText>
                  </View>
                  <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>{item.owner}</ThemedText>
                </View>
                <ThemedText
                  style={[
                    s.listCardSub,
                    { color: isOverdue ? '#EF4444' : colors.textTertiary },
                  ]}
                >
                  Due: {item.dueDate}
                </ThemedText>
              </View>
              {item.lastVerified != null && (
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                  Last verified: {item.lastVerified}
                </ThemedText>
              )}
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 3: Checklists ===
  const renderChecklists = () => (
    <FlatList<ComplianceChecklist>
      data={data.checklists}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="checklist" text="No checklists" colors={colors} />}
      renderItem={({ item }) => {
        const progress = item.requirementCount > 0 ? item.completedCount / item.requirementCount : 0;
        return (
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.listCardInfo}>
              <ThemedText style={s.listCardTitle}>{item.title}</ThemedText>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]} numberOfLines={1}>
                {item.description}
              </ThemedText>
              <View style={s.checklistProgressRow}>
                <View style={[s.progressTrack, { backgroundColor: colors.text + '10' }]}>
                  <View style={[s.progressFill, { width: `${progress * 100}%`, backgroundColor: accentColor }]} />
                </View>
                <ThemedText style={[s.checklistFraction, { color: colors.textSecondary }]}>
                  {item.completedCount}/{item.requirementCount}
                </ThemedText>
              </View>
              <View style={s.checklistMetaRow}>
                <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
                  <ThemedText style={[s.avatarText, { color: accentColor }]}>{item.ownerInitials}</ThemedText>
                </View>
                <ChecklistStatusBadge status={item.status} />
                <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.scope}</ThemedText>
                </View>
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                Due: {item.dueDate}
              </ThemedText>
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 4: Evidence ===
  const renderEvidence = () => (
    <FlatList<ComplianceEvidence>
      data={data.evidence}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="doc.fill" text="No evidence" colors={colors} />}
      renderItem={({ item }) => {
        const typeColor =
          item.type === 'document' ? accentColor :
          item.type === 'link' ? accentColor :
          item.type === 'attestation' ? '#F59E0B' :
          accentColor; // certificate
        const expiresDateSoon = item.expiresDate != null && new Date(item.expiresDate).getTime() - Date.now() < 60 * 86400000;
        return (
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.listCardRow}>
              <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
                <ThemedText style={[s.avatarText, { color: accentColor }]}>{item.submittedByInitials}</ThemedText>
              </View>
              <View style={s.listCardInfo}>
                <ThemedText style={s.listCardTitle} numberOfLines={1}>{item.title}</ThemedText>
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]} numberOfLines={1}>
                  {item.requirementTitle}
                </ThemedText>
                <View style={s.evidenceMetaRow}>
                  <View style={[s.badge, { backgroundColor: typeColor + '33' }]}>
                    <ThemedText style={[s.badgeText, { color: typeColor }]}>{item.type}</ThemedText>
                  </View>
                  <EvidenceStatusBadge status={item.status} />
                </View>
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                  Submitted: {item.submittedDate}
                </ThemedText>
                {item.verifiedBy != null && item.verifiedDate != null && (
                  <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                    Verified by {item.verifiedBy} on {item.verifiedDate}
                  </ThemedText>
                )}
                {item.expiresDate != null && (
                  <ThemedText
                    style={[
                      s.listCardSub,
                      { color: expiresDateSoon ? '#F59E0B' : colors.textTertiary },
                    ]}
                  >
                    Expires: {item.expiresDate}
                  </ThemedText>
                )}
              </View>
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 5: Incidents ===
  const renderIncidents = () => (
    <FlatList<ComplianceIncident>
      data={data.incidents}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="exclamationmark.triangle" text="No incidents" colors={colors} />}
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardInfo}>
            <ThemedText style={s.listCardTitle}>{item.title}</ThemedText>
            <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]} numberOfLines={2}>
              {item.description}
            </ThemedText>
            <View style={s.incidentBadgeRow}>
              <SeverityBadge severity={item.severity} />
              <IncidentStatusBadge status={item.status} />
              <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.scope}</ThemedText>
              </View>
            </View>
            <View style={s.incidentBottomRow}>
              <View style={s.incidentReporterRow}>
                <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
                  <ThemedText style={[s.avatarText, { color: accentColor }]}>{item.reportedByInitials}</ThemedText>
                </View>
                <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>{item.reportedBy}</ThemedText>
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                {item.reportedDate}
              </ThemedText>
            </View>
            {item.assignedTo != null && (
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                Assigned to: {item.assignedTo}
              </ThemedText>
            )}
            {item.resolvedDate != null && (
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                Resolved: {item.resolvedDate}
              </ThemedText>
            )}
          </View>
        </View>
      )}
    />
  );

  // === Tab 6: Actions ===
  const renderActions = () => (
    <FlatList<ComplianceAction>
      data={data.actions}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="bolt.fill" text="No actions" colors={colors} />}
      renderItem={({ item }) => {
        const statusColor = ACTION_STATUS_COLOR[item.status];
        const priorityColor = SEVERITY_COLOR[item.priority] ?? '#A1A1AA';
        const isOverdue = (item.status === 'pending' || item.status === 'in-progress') && new Date(item.dueDate) < new Date();
        return (
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.listCardRow}>
              <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
                <ThemedText style={[s.avatarText, { color: accentColor }]}>{item.assigneeInitials}</ThemedText>
              </View>
              <View style={s.listCardInfo}>
                <ThemedText style={s.listCardTitle} numberOfLines={1}>{item.title}</ThemedText>
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]} numberOfLines={1}>
                  {item.description}
                </ThemedText>
                {item.incidentTitle != null && (
                  <ThemedText style={[s.listCardSub, { color: accentColor }]} numberOfLines={1}>
                    {item.incidentTitle}
                  </ThemedText>
                )}
                <View style={s.actionBadgeRow}>
                  <View style={[s.badge, { backgroundColor: priorityColor + '33' }]}>
                    <ThemedText style={[s.badgeText, { color: priorityColor }]}>{item.priority}</ThemedText>
                  </View>
                  <View style={[s.badge, { backgroundColor: statusColor + '33' }]}>
                    <ThemedText style={[s.badgeText, { color: statusColor }]}>{item.status.replace('-', ' ')}</ThemedText>
                  </View>
                </View>
                <ThemedText
                  style={[
                    s.listCardSub,
                    { color: isOverdue ? '#EF4444' : colors.textTertiary },
                  ]}
                >
                  Due: {item.dueDate}{isOverdue ? ' (OVERDUE)' : ''}
                </ThemedText>
                {item.verifiedBy != null && item.verifiedDate != null && (
                  <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                    Verified by {item.verifiedBy} on {item.verifiedDate}
                  </ThemedText>
                )}
              </View>
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 7: Training ===
  const renderTraining = () => (
    <FlatList<ComplianceTraining>
      data={data.training}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="graduationcap" text="No training" colors={colors} />}
      renderItem={({ item }) => {
        const statusColor = TRAINING_STATUS_COLOR[item.status];
        return (
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.listCardRow}>
              <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
                <ThemedText style={[s.avatarText, { color: accentColor }]}>{item.assigneeInitials}</ThemedText>
              </View>
              <View style={s.listCardInfo}>
                <ThemedText style={s.listCardTitle}>{item.title}</ThemedText>
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]} numberOfLines={1}>
                  {item.module}
                </ThemedText>
                <View style={s.trainingBadgeRow}>
                  <View style={[s.badge, { backgroundColor: statusColor + '33' }]}>
                    <ThemedText style={[s.badgeText, { color: statusColor }]}>{item.status.replace('-', ' ')}</ThemedText>
                  </View>
                  {item.score != null && (
                    <ThemedText style={[s.trainingScore, { color: colors.text }]}>
                      {item.score}%
                    </ThemedText>
                  )}
                </View>
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                  Due: {item.dueDate}
                </ThemedText>
                {item.completedDate != null && (
                  <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                    Completed: {item.completedDate}
                  </ThemedText>
                )}
              </View>
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 8: Policies ===
  const renderPolicies = () => (
    <FlatList<CompliancePolicy>
      data={data.policies}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="doc.text" text="No policies" colors={colors} />}
      renderItem={({ item }) => {
        const statusColor = POLICY_STATUS_COLOR[item.status];
        const ackProgress = item.totalCount > 0 ? item.acknowledgedCount / item.totalCount : 0;
        return (
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.listCardInfo}>
              <ThemedText style={s.listCardTitle}>{item.title}</ThemedText>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]} numberOfLines={2}>
                {item.description}
              </ThemedText>
              <View style={s.policyMetaRow}>
                <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.version}</ThemedText>
                </View>
                <View style={[s.badge, { backgroundColor: statusColor + '33' }]}>
                  <ThemedText style={[s.badgeText, { color: statusColor }]}>{item.status.replace('-', ' ')}</ThemedText>
                </View>
              </View>
              <View style={s.policyDateRow}>
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                  Effective: {item.effectiveDate}
                </ThemedText>
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                  Review: {item.reviewDate}
                </ThemedText>
              </View>
              <View style={s.policyOwnerRow}>
                <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
                  <ThemedText style={[s.avatarText, { color: accentColor }]}>{item.ownerInitials}</ThemedText>
                </View>
                <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>{item.owner}</ThemedText>
              </View>
              <View style={s.policyAckRow}>
                <View style={[s.progressTrack, { backgroundColor: colors.text + '10' }]}>
                  <View style={[s.progressFill, { width: `${ackProgress * 100}%`, backgroundColor: accentColor }]} />
                </View>
                <ThemedText style={[s.policyAckFraction, { color: colors.textSecondary }]}>
                  {item.acknowledgedCount}/{item.totalCount}
                </ThemedText>
              </View>
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 9: Deadlines ===
  const renderDeadlines = () => (
    <FlatList<ComplianceDeadline>
      data={data.deadlines}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="clock" text="No deadlines" colors={colors} />}
      renderItem={({ item }) => {
        const dueDateColor = DEADLINE_STATUS_COLOR[item.status];
        return (
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.listCardRow}>
              <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
                <ThemedText style={[s.avatarText, { color: accentColor }]}>{item.ownerInitials}</ThemedText>
              </View>
              <View style={s.listCardInfo}>
                <ThemedText style={s.listCardTitle} numberOfLines={1}>{item.title}</ThemedText>
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]} numberOfLines={1}>
                  {item.description}
                </ThemedText>
                <View style={s.deadlineDateRow}>
                  <ThemedText style={[s.deadlineDate, { color: dueDateColor }]}>
                    {item.dueDate}
                  </ThemedText>
                  <View style={[s.badge, { backgroundColor: dueDateColor + '33' }]}>
                    <ThemedText style={[s.badgeText, { color: dueDateColor }]}>{item.status.replace('-', ' ')}</ThemedText>
                  </View>
                </View>
                <View style={s.deadlineIndicatorRow}>
                  {item.proofRequired && (
                    <View style={s.deadlineIndicator}>
                      <IconSymbol name="doc.badge.ellipsis" size={12} color={colors.textSecondary} />
                      <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>Proof required</ThemedText>
                    </View>
                  )}
                  {item.proofSubmitted ? (
                    <View style={s.deadlineIndicator}>
                      <IconSymbol name="checkmark.circle.fill" size={12} color="#22C55E" />
                      <ThemedText style={[s.listCardSub, { color: '#22C55E' }]}>Submitted</ThemedText>
                    </View>
                  ) : item.proofRequired ? (
                    <View style={s.deadlineIndicator}>
                      <IconSymbol name="clock" size={12} color="#F59E0B" />
                      <ThemedText style={[s.listCardSub, { color: '#F59E0B' }]}>Pending</ThemedText>
                    </View>
                  ) : null}
                </View>
                <View style={[s.badge, { backgroundColor: accentColor + '18', alignSelf: 'flex-start' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.scope}</ThemedText>
                </View>
              </View>
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 10: Reports ===
  const renderReports = () => (
    <FlatList<ComplianceReport>
      data={data.reports}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="chart.bar.doc.horizontal" text="No reports" colors={colors} />}
      renderItem={({ item }) => {
        const formatColor = REPORT_FORMAT_COLOR[item.format];
        return (
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.listCardInfo}>
              <ThemedText style={s.listCardTitle}>{item.title}</ThemedText>
              <View style={s.reportMetaRow}>
                <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.type}</ThemedText>
                </View>
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>{item.period}</ThemedText>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                Generated: {item.generatedAt}
              </ThemedText>
              <View style={s.reportBottomRow}>
                <View style={[s.badge, { backgroundColor: formatColor + '33' }]}>
                  <ThemedText style={[s.badgeText, { color: formatColor }]}>{item.format}</ThemedText>
                </View>
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>{item.size}</ThemedText>
              </View>
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 11: Audit ===
  const renderAudit = () => (
    <FlatList<ComplianceAuditEntry>
      data={data.audit}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="clock.fill" text="No audit entries" colors={colors} />}
      renderItem={({ item }) => {
        const aColor = auditColor(item.action);
        const aIcon = auditIcon(item.action);
        return (
          <View style={s.auditRow}>
            <View style={[s.auditIconCircle, { backgroundColor: aColor + '20' }]}>
              <IconSymbol name={aIcon as any} size={14} color={aColor} />
            </View>
            <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
              <ThemedText style={[s.avatarText, { color: accentColor }]}>{item.actorInitials}</ThemedText>
            </View>
            <View style={s.auditInfo}>
              <ThemedText style={s.auditAction}>{item.action.replace(/_/g, ' ')}</ThemedText>
              <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.target}
              </ThemedText>
              <ThemedText style={[s.auditMeta, { color: colors.textTertiary }]}>
                {item.actor} · {item.timestamp}
              </ThemedText>
              {item.detail != null && (
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]} numberOfLines={1}>
                  {item.detail}
                </ThemedText>
              )}
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 12: Settings ===
  const renderSettings = () => (
    <View style={s.tabContent}>
      <ThemedText style={[s.settingsHeader, { color: colors.textSecondary }]}>
        {MODE_LABELS[mode]} Compliance Settings
      </ThemedText>
      <View style={[s.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {data.settings.map((setting, index) => {
          const toggled = settingToggles[setting.id] ?? setting.enabled;
          return (
            <React.Fragment key={setting.id}>
              {index > 0 && (
                <View style={[s.settingsDivider, { backgroundColor: colors.divider }]} />
              )}
              <View style={s.settingsRow}>
                <View style={s.settingsLabelGroup}>
                  <ThemedText style={s.settingsLabel}>{setting.label}</ThemedText>
                  <ThemedText style={[s.settingsDesc, { color: colors.textTertiary }]}>
                    {setting.description}
                  </ThemedText>
                </View>
                <Switch
                  value={toggled}
                  onValueChange={(val) =>
                    setSettingToggles((prev) => ({ ...prev, [setting.id]: val }))
                  }
                  trackColor={{ false: colors.backgroundTertiary, true: accentColor + '60' }}
                  thumbColor={toggled ? accentColor : colors.textTertiary}
                />
              </View>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );

  // ===================================================================
  // RENDER — MAIN
  // ===================================================================

  return (
    <View style={s.container}>
      {/* === Header === */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <ThemedText style={s.headerTitle}>Compliance</ThemedText>
          <Pressable
            style={({ pressed }) => [s.filterBtn, pressed && { opacity: 0.7 }]}
            onPress={handleFilterToggle}
          >
            <IconSymbol name="slider.horizontal.3" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Scope chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.scopeBar}
        >
          {scopeChips.map((chip, i) => (
            <Pressable
              key={chip.key}
              style={[
                s.scopeChip,
                i === activeScope
                  ? { backgroundColor: accentColor }
                  : { backgroundColor: colors.backgroundTertiary },
              ]}
              onPress={() => handleScopePress(i)}
            >
              <ThemedText
                style={[
                  s.scopeChipText,
                  { color: i === activeScope ? '#000' : colors.textSecondary },
                ]}
              >
                {chip.label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {/* Search bar */}
        <View style={[s.searchBar, { backgroundColor: colors.backgroundTertiary }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search compliance..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* === Tab Nav === */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tabBar}
        style={s.tabBarContainer}
      >
        {COMPLIANCE_TABS.map((tab) => (
          <Pressable
            key={tab.id}
            style={[
              s.tabPill,
              activeTab === tab.id
                ? { backgroundColor: accentColor }
                : { backgroundColor: colors.backgroundTertiary },
            ]}
            onPress={() => handleTabPress(tab.id)}
          >
            <ThemedText
              style={[
                s.tabPillText,
                { color: activeTab === tab.id ? '#000' : colors.textSecondary },
              ]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* === Tab Content === */}
      <View style={s.contentArea}>
        {renderTabContent()}
      </View>

      {/* === Filter Bottom Sheet === */}
      <BottomSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        title="Filter Compliance"
        useModal
      >
        <View style={s.filterSection}>
          <ThemedText style={[s.filterSectionTitle, { color: colors.textSecondary }]}>Status</ThemedText>
          <View style={s.filterChipsWrap}>
            {(['due-soon', 'overdue', 'compliant', 'waived']).map((st) => {
              const fg = REQUIREMENT_STATUS_COLOR[st as keyof typeof REQUIREMENT_STATUS_COLOR] ?? '#A1A1AA';
              const selected = filterStatuses.includes(st);
              return (
                <Pressable
                  key={st}
                  style={[
                    s.filterChip,
                    {
                      backgroundColor: selected ? fg + '20' : colors.backgroundTertiary,
                      borderColor: selected ? fg + '40' : 'transparent',
                    },
                  ]}
                  onPress={() => toggleFilterStatus(st)}
                >
                  <View style={[s.filterDot, { backgroundColor: fg }]} />
                  <ThemedText
                    style={[s.filterChipText, { color: selected ? fg : colors.textSecondary }]}
                  >
                    {st.replace('-', ' ')}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={s.filterSection}>
          <ThemedText style={[s.filterSectionTitle, { color: colors.textSecondary }]}>Severity</ThemedText>
          <View style={s.filterChipsWrap}>
            {(['critical', 'high', 'medium', 'low']).map((sev) => {
              const fg = SEVERITY_COLOR[sev] ?? '#A1A1AA';
              const selected = filterSeverities.includes(sev);
              return (
                <Pressable
                  key={sev}
                  style={[
                    s.filterChip,
                    {
                      backgroundColor: selected ? fg + '20' : colors.backgroundTertiary,
                      borderColor: selected ? fg + '40' : 'transparent',
                    },
                  ]}
                  onPress={() => toggleFilterSeverity(sev)}
                >
                  <View style={[s.filterDot, { backgroundColor: fg }]} />
                  <ThemedText
                    style={[s.filterChipText, { color: selected ? fg : colors.textSecondary }]}
                  >
                    {sev}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={s.filterSection}>
          <ThemedText style={[s.filterSectionTitle, { color: colors.textSecondary }]}>Sort</ThemedText>
          {([
            { key: 'due-soonest' as ComplianceSortOption, label: 'Due soonest' },
            { key: 'recent-activity' as ComplianceSortOption, label: 'Recent activity' },
            { key: 'severity' as ComplianceSortOption, label: 'Severity' },
          ]).map((opt) => (
            <Pressable
              key={opt.key}
              style={s.filterRadioRow}
              onPress={() => setFilterSort(opt.key)}
            >
              <View
                style={[
                  s.radioOuter,
                  { borderColor: filterSort === opt.key ? accentColor : colors.textTertiary },
                ]}
              >
                {filterSort === opt.key && (
                  <View style={[s.radioInner, { backgroundColor: accentColor }]} />
                )}
              </View>
              <ThemedText style={s.filterRadioLabel}>{opt.label}</ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={s.filterFooter}>
          <Pressable
            style={({ pressed }) => [s.filterClearBtn, pressed && { opacity: 0.7 }]}
            onPress={handleClearFilters}
          >
            <ThemedText style={[s.filterClearText, { color: colors.textSecondary }]}>Clear</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              s.filterApplyBtn,
              { backgroundColor: accentColor },
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => setFilterVisible(false)}
          >
            <ThemedText style={s.filterApplyText}>Apply</ThemedText>
          </Pressable>
        </View>
      </BottomSheet>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // === Layout ===
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  filterBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },

  // === Scope Chips ===
  scopeBar: {
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  scopeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  scopeChipText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // === Search ===
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    height: 36,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },

  // === Tab Bar ===
  tabBarContainer: {
    flexGrow: 0,
    marginTop: Spacing.sm,
  },
  tabBar: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // === Content Area ===
  contentArea: {
    flex: 1,
    marginTop: Spacing.sm,
  },
  tabContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },

  // === Dashboard ===
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  dashboardCard: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'flex-start',
    gap: 4,
  },
  dashboardLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dashboardValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dashboardValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  dashboardDetail: {
    fontSize: 11,
    marginTop: 2,
  },

  // === List Cards ===
  listCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  listCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  listCardInfo: {
    flex: 1,
    gap: 4,
  },
  listCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  listCardSub: {
    fontSize: 12,
  },

  // === Avatar ===
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 9,
    fontWeight: '700',
  },

  // === Badges ===
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // === Status Dot ===
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.full,
  },

  // === Requirements ===
  reqTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  reqBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  reqBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  reqOwnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // === Checklists ===
  checklistProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  checklistFraction: {
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  checklistMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },

  // === Progress Bar ===
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: BorderRadius.sm,
  },
  progressFill: {
    height: 4,
    borderRadius: BorderRadius.sm,
  },

  // === Evidence ===
  evidenceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  // === Incidents ===
  incidentBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  incidentBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  incidentReporterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // === Actions ===
  actionBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  // === Training ===
  trainingBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  trainingScore: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // === Policies ===
  policyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  policyDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  policyOwnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  policyAckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  policyAckFraction: {
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },

  // === Deadlines ===
  deadlineDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  deadlineDate: {
    fontSize: 13,
    fontWeight: '600',
  },
  deadlineIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  deadlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // === Reports ===
  reportMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  reportBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },

  // === Audit ===
  auditRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  auditIconCircle: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  auditInfo: {
    flex: 1,
    gap: 2,
  },
  auditAction: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  auditMeta: {
    fontSize: 11,
  },

  // === Settings ===
  settingsHeader: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  settingsCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  settingsLabelGroup: {
    flex: 1,
    marginRight: Spacing.sm,
    gap: 2,
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingsDesc: {
    fontSize: 11,
  },
  settingsDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },

  // === Empty State ===
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 240,
  },

  // === Filter Sheet ===
  filterSection: {
    marginBottom: Spacing.lg,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  filterRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
  },
  filterRadioLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.full,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  filterFooter: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  filterClearBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
  },
  filterClearText: {
    fontSize: 15,
    fontWeight: '600',
  },
  filterApplyBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
  },
  filterApplyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
});
