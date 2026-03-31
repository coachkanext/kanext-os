/**
 * Church Organization Compliance/Legal v2 — 9-view sub-tab hub.
 * Sub-tabs: Overview | Policies | Legal Docs | Controls | Audits | Risk Register | Incidents | Exceptions | Exports
 * RBAC: C1/C2 full, C3 limited (Overview + Policies + Controls + Incidents for their ministry), C4 Policies only, C5 locked.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import type { ChurchRoleLens } from '@/utils/church-rbac';
import { isElderLevel, isStaffLevel } from '@/utils/church-rbac';
import {
  getChurchComplianceLegalData,
  POLICY_STATUS_LABELS,
  POLICY_STATUS_COLORS,
  POLICY_CATEGORY_LABELS,
  POLICY_CATEGORY_ICONS,
  LEGAL_DOC_CATEGORY_LABELS,
  LEGAL_DOC_STATUS_LABELS,
  LEGAL_DOC_STATUS_COLORS,
  SENSITIVITY_LABELS,
  SENSITIVITY_COLORS,
  CONTROL_FREQUENCY_LABELS,
  EVIDENCE_TYPE_LABELS,
  EVIDENCE_STATUS_LABELS,
  EVIDENCE_STATUS_COLORS,
  AUDIT_FINDING_SEVERITY_COLORS,
  AUDIT_FINDING_STATUS_LABELS,
  RISK_SEVERITY_COLORS,
  RISK_SEVERITY_LABELS,
  RISK_CATEGORY_LABELS,
  INCIDENT_TYPE_LABELS,
  INCIDENT_STATUS_LABELS,
  INCIDENT_STATUS_COLORS,
  EXCEPTION_STATUS_LABELS,
  EXCEPTION_STATUS_COLORS,
} from '@/data/mock-church-org-compliance-legal';
import type {
  CompliancePolicy,
  LegalDocument,
  ComplianceControl,
  EvidenceItem,
  AuditRun,
  AuditFinding,
  ComplianceRisk,
  ComplianceIncident,
  ComplianceException,
  ExportPacket,
} from '@/data/mock-church-org-compliance-legal';

// =============================================================================
// CONSTANTS
// =============================================================================


const ACCENT = MODE_ACCENT.church;
const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'policies', label: 'Policies' },
  { id: 'legal-docs', label: 'Legal Docs' },
  { id: 'controls', label: 'Controls' },
  { id: 'audits', label: 'Audits' },
  { id: 'risk-register', label: 'Risk Register' },
  { id: 'incidents', label: 'Incidents' },
  { id: 'exceptions', label: 'Exceptions' },
  { id: 'exports', label: 'Exports' },
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

function formatDate(dateStr: string): string {
  if (!dateStr) return '--';
  const parts = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[parseInt(parts[1], 10) - 1] || parts[1];
  const day = parseInt(parts[2], 10);
  return `${month} ${day}`;
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
// OVERVIEW SUB-TAB
// =============================================================================

function OverviewTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getChurchComplianceLegalData>;
}) {
  const { overviewStatus, policies, risks, incidents, controls } = data;

  // Counts
  const publishedPolicies = policies.filter((p) => p.status === 'published').length;
  const draftPolicies = policies.filter((p) => p.status === 'draft' || p.status === 'in_review').length;
  const openIncidents = incidents.filter((i) => i.status !== 'closed').length;
  const highRisks = risks.filter((r) => r.severity === 'critical' || r.severity === 'high').length;

  // Status strip
  const greenCount = controls.filter((c) => c.evidenceStatus === 'accepted').length;
  const yellowCount = controls.filter((c) => c.evidenceStatus === 'submitted' || c.evidenceStatus === 'pending').length;
  const redCount = controls.filter((c) => c.evidenceStatus === 'rejected').length;

  // Top 5 Actions — auto-ranked
  const topActions: { id: string; rank: number; title: string; urgency: 'high' | 'medium' | 'low' }[] = [];
  if (overviewStatus.openIncidents > 0) topActions.push({ id: 'ta-1', rank: 1, title: `Resolve ${overviewStatus.openIncidents} open incident(s)`, urgency: 'high' });
  if (overviewStatus.openCriticalRisks > 0) topActions.push({ id: 'ta-2', rank: 2, title: `Mitigate ${overviewStatus.openCriticalRisks} critical/high risk(s)`, urgency: 'high' });
  if (overviewStatus.missingPolicies > 0) topActions.push({ id: 'ta-3', rank: 3, title: `Finalize ${overviewStatus.missingPolicies} draft policy(ies)`, urgency: 'medium' });
  topActions.push({ id: 'ta-4', rank: 4, title: `Insurance COI renewal — expiring soon`, urgency: 'high' });
  topActions.push({ id: 'ta-5', rank: 5, title: `Complete Q1 finance controls review`, urgency: 'medium' });

  // Recent changes
  const recentChanges = [
    { id: 'rc-1', text: 'Suspicious financial request flagged — investigating', timestamp: 'Feb 10' },
    { id: 'rc-2', text: 'Insurance COI expiring — renewal pending', timestamp: 'Feb 15' },
    { id: 'rc-3', text: 'Event Safety policy moved to In Review', timestamp: 'Feb 12' },
    { id: 'rc-4', text: 'Q1 Finance Controls audit in progress', timestamp: 'Feb 8' },
    { id: 'rc-5', text: 'Data privacy incident closed — corrective actions applied', timestamp: 'Jan 15' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Status Strip */}
      <View style={[s.statusStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.statusStripItem}>
          <View style={[s.statusDot, { backgroundColor: '#5A8A6E' }]} />
          <ThemedText style={[s.statusCount, { color: colors.text }]}>{greenCount}</ThemedText>
          <ThemedText style={[s.statusLabel, { color: colors.textSecondary }]}>Current</ThemedText>
        </View>
        <View style={s.statusStripItem}>
          <View style={[s.statusDot, { backgroundColor: '#B8943E' }]} />
          <ThemedText style={[s.statusCount, { color: colors.text }]}>{yellowCount}</ThemedText>
          <ThemedText style={[s.statusLabel, { color: colors.textSecondary }]}>Pending</ThemedText>
        </View>
        <View style={s.statusStripItem}>
          <View style={[s.statusDot, { backgroundColor: '#B85C5C' }]} />
          <ThemedText style={[s.statusCount, { color: colors.text }]}>{redCount}</ThemedText>
          <ThemedText style={[s.statusLabel, { color: colors.textSecondary }]}>Rejected</ThemedText>
        </View>
      </View>

      {/* KPI Row */}
      <View style={s.kpiRow}>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: colors.text }]}>{publishedPolicies}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Policies</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: highRisks > 0 ? '#B85C5C' : '#5A8A6E' }]}>{highRisks}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>High Risks</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: openIncidents > 0 ? '#B8943E' : '#5A8A6E' }]}>{openIncidents}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Incidents</ThemedText>
        </View>
      </View>

      {/* Evidence Completeness */}
      <View style={[s.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.sectionCardHeader}>
          <IconSymbol name="checkmark.shield.fill" size={16} color={accentColor} />
          <ThemedText style={[s.sectionCardTitle, { color: colors.text }]}>Evidence Completeness</ThemedText>
          <ThemedText style={[s.percentLabel, { color: accentColor }]}>{overviewStatus.evidenceCompleteness}%</ThemedText>
        </View>
        <ProgressBar percent={overviewStatus.evidenceCompleteness} color={accentColor} />
      </View>

      {/* Top 5 Actions */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Top Actions
      </ThemedText>
      {topActions.map((action) => {
        const urgencyColor = action.urgency === 'high' ? '#B85C5C' : action.urgency === 'medium' ? '#B8943E' : '#5A8A6E';
        return (
          <View
            key={action.id}
            style={[s.actionRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[s.actionRank, { backgroundColor: urgencyColor + '18' }]}>
              <ThemedText style={[s.actionRankText, { color: urgencyColor }]}>{action.rank}</ThemedText>
            </View>
            <ThemedText style={[s.actionText, { color: colors.text }]} numberOfLines={2}>
              {action.title}
            </ThemedText>
            <StatusBadge label={action.urgency.toUpperCase()} color={urgencyColor} />
          </View>
        );
      })}

      {/* Recent Changes */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Recent Changes
      </ThemedText>
      {recentChanges.map((change) => (
        <View key={change.id} style={[s.changeRow, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.changeText, { color: colors.text }]} numberOfLines={2}>
            {change.text}
          </ThemedText>
          <ThemedText style={[s.changeTime, { color: colors.textTertiary }]}>{change.timestamp}</ThemedText>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// POLICIES SUB-TAB
// =============================================================================

function PoliciesTab({
  colors,
  accentColor,
  policies,
  onSelectPolicy,
  readOnly,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  policies: CompliancePolicy[];
  onSelectPolicy: (policy: CompliancePolicy) => void;
  readOnly: boolean;
}) {
  const renderItem = useCallback(
    ({ item }: { item: CompliancePolicy }) => {
      const catLabel = POLICY_CATEGORY_LABELS[item.category];
      const catIcon = POLICY_CATEGORY_ICONS[item.category];
      const statusColor = POLICY_STATUS_COLORS[item.status];
      const statusLabel = POLICY_STATUS_LABELS[item.status];
      return (
        <Pressable
          style={[s.policyCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectPolicy(item);
          }}
        >
          <View style={s.policyCardTop}>
            <IconSymbol name={catIcon as any} size={16} color={accentColor} />
            <ThemedText style={[s.policyTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </ThemedText>
          </View>
          <View style={s.policyBadgeRow}>
            <StatusBadge label={catLabel.toUpperCase()} color={accentColor} />
            <StatusBadge label={`v${item.version}`} color={colors.textSecondary} />
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
          </View>
          <View style={[s.policyMeta, { borderTopColor: colors.border }]}>
            <View style={s.policyMetaItem}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.policyMetaText, { color: colors.textTertiary }]}>{item.owner}</ThemedText>
            </View>
            <View style={s.policyMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.policyMetaText, { color: colors.textTertiary }]}>
                {item.effectiveDate ? formatDate(item.effectiveDate) : 'TBD'}
              </ThemedText>
            </View>
            {item.attestationRequired && (
              <View style={s.policyMetaItem}>
                <IconSymbol name="checkmark.seal.fill" size={11} color={item.attestationAudience ? '#5A8A6E' : '#B8943E'} />
                <ThemedText style={[s.policyMetaText, { color: colors.textTertiary }]}>Attestation</ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={[s.policySummary, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.summary}
          </ThemedText>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectPolicy],
  );

  // For C4 (read-only), only show published
  const filtered = readOnly ? policies.filter((p) => p.status === 'published') : policies;

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="doc.text.fill" label="No policies available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// LEGAL DOCS SUB-TAB
// =============================================================================

function LegalDocsTab({
  colors,
  accentColor,
  docs,
  role,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  docs: LegalDocument[];
  role: ChurchRoleLens;
}) {
  // C3/C4: hide restricted sensitivity docs
  const filtered = useMemo(() => {
    if (isElderLevel(role)) return docs;
    return docs.filter((d) => d.sensitivity !== 'restricted');
  }, [docs, role]);

  const renderItem = useCallback(
    ({ item }: { item: LegalDocument }) => {
      const catLabel = LEGAL_DOC_CATEGORY_LABELS[item.category];
      const statusColor = LEGAL_DOC_STATUS_COLORS[item.status];
      const statusLabel = LEGAL_DOC_STATUS_LABELS[item.status];
      const sensitivityColor = SENSITIVITY_COLORS[item.sensitivity];
      const sensitivityLabel = SENSITIVITY_LABELS[item.sensitivity];
      return (
        <View style={[s.legalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.legalCardTop}>
            <IconSymbol name="doc.fill" size={16} color={accentColor} />
            <ThemedText style={[s.legalTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </ThemedText>
          </View>
          <View style={s.legalBadgeRow}>
            <StatusBadge label={catLabel.toUpperCase()} color={accentColor} />
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
            <StatusBadge label={sensitivityLabel.toUpperCase()} color={sensitivityColor} />
          </View>
          <View style={[s.legalMeta, { borderTopColor: colors.border }]}>
            <View style={s.legalMetaItem}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.legalMetaText, { color: colors.textTertiary }]}>{item.owner}</ThemedText>
            </View>
            <View style={s.legalMetaItem}>
              <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.legalMetaText, { color: colors.textTertiary }]}>
                {formatDate(item.lastUpdated)}
              </ThemedText>
            </View>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="doc.fill" label="No legal documents available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// CONTROLS SUB-TAB
// =============================================================================

function ControlsTab({
  colors,
  accentColor,
  controls,
  role,
  onSelectControl,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  controls: ComplianceControl[];
  role: ChurchRoleLens;
  onSelectControl: (control: ComplianceControl) => void;
}) {
  // C3: only ministry-scoped controls
  const filtered = useMemo(() => {
    if (isElderLevel(role)) return controls;
    return controls.filter((c) => c.scope === 'ministry');
  }, [controls, role]);

  const renderItem = useCallback(
    ({ item }: { item: ComplianceControl }) => {
      const freqLabel = CONTROL_FREQUENCY_LABELS[item.frequency];
      const evidenceTypeLabel = EVIDENCE_TYPE_LABELS[item.evidenceType];
      const evidenceStatusColor = EVIDENCE_STATUS_COLORS[item.evidenceStatus];
      const evidenceStatusLabel = EVIDENCE_STATUS_LABELS[item.evidenceStatus];
      const scopeColor = item.scope === 'whole_church' ? ACCENT : ACCENT;
      return (
        <Pressable
          style={[s.controlCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectControl(item);
          }}
        >
          <ThemedText style={[s.controlName, { color: colors.text }]} numberOfLines={2}>
            {item.name}
          </ThemedText>
          <ThemedText style={[s.controlPolicy, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.linkedPolicyTitle}
          </ThemedText>
          <View style={s.controlMetaRow}>
            <View style={s.controlMetaItem}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.controlMetaText, { color: colors.textTertiary }]}>{item.owner}</ThemedText>
            </View>
          </View>
          <View style={s.controlBadgeRow}>
            <StatusBadge label={freqLabel.toUpperCase()} color={accentColor} />
            <StatusBadge label={evidenceTypeLabel.toUpperCase()} color={colors.textSecondary} />
            <StatusBadge label={evidenceStatusLabel.toUpperCase()} color={evidenceStatusColor} />
            <StatusBadge label={item.scope === 'whole_church' ? 'CHURCH-WIDE' : 'MINISTRY'} color={scopeColor} />
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectControl],
  );

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="slider.horizontal.3" label="No controls available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// AUDITS SUB-TAB
// =============================================================================

function AuditsTab({
  colors,
  accentColor,
  audits,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  audits: AuditRun[];
}) {
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {audits.map((audit) => {
        const isExpanded = expandedAudit === audit.id;
        const statusColor = audit.status === 'completed' ? '#5A8A6E' : audit.status === 'in_progress' ? '#B8943E' : ACCENT;
        const statusLabel = audit.status === 'completed' ? 'Completed' : audit.status === 'in_progress' ? 'In Progress' : 'Scheduled';

        // Finding counts by severity
        const critCount = audit.findings.filter((f) => f.severity === 'critical').length;
        const highCount = audit.findings.filter((f) => f.severity === 'high').length;
        const medCount = audit.findings.filter((f) => f.severity === 'medium').length;
        const lowCount = audit.findings.filter((f) => f.severity === 'low').length;

        return (
          <Pressable
            key={audit.id}
            style={[s.auditCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setExpandedAudit(isExpanded ? null : audit.id);
            }}
          >
            <View style={s.auditHeader}>
              <View style={s.auditHeaderText}>
                <ThemedText style={[s.auditName, { color: colors.text }]} numberOfLines={2}>
                  {audit.name}
                </ThemedText>
                <ThemedText style={[s.auditScope, { color: colors.textSecondary }]} numberOfLines={1}>
                  {audit.scope.length} policy area{audit.scope.length !== 1 ? 's' : ''} — {audit.owner}
                </ThemedText>
              </View>
              <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
            </View>

            <View style={s.auditMetaRow}>
              <View style={s.auditMetaItem}>
                <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.auditMetaText, { color: colors.textTertiary }]}>
                  Due {formatDate(audit.dueDate)}
                </ThemedText>
              </View>
              {audit.findings.length > 0 && (
                <View style={s.findingsCountRow}>
                  {critCount > 0 && <StatusBadge label={`${critCount} CRIT`} color="#B85C5C" />}
                  {highCount > 0 && <StatusBadge label={`${highCount} HIGH`} color="#B85C5C" />}
                  {medCount > 0 && <StatusBadge label={`${medCount} MED`} color="#B8943E" />}
                  {lowCount > 0 && <StatusBadge label={`${lowCount} LOW`} color="#5A8A6E" />}
                </View>
              )}
            </View>

            {/* Expandable findings */}
            {isExpanded && audit.findings.length > 0 && (
              <View style={[s.findingsSection, { borderTopColor: colors.border }]}>
                <ThemedText style={[s.findingsSectionTitle, { color: colors.text }]}>
                  Findings ({audit.findings.length})
                </ThemedText>
                {audit.findings.map((finding) => {
                  const sevColor = AUDIT_FINDING_SEVERITY_COLORS[finding.severity];
                  const fStatusLabel = AUDIT_FINDING_STATUS_LABELS[finding.status];
                  return (
                    <View
                      key={finding.id}
                      style={[s.findingRow, { borderLeftColor: sevColor }]}
                    >
                      <ThemedText style={[s.findingTitle, { color: colors.text }]} numberOfLines={2}>
                        {finding.title}
                      </ThemedText>
                      <View style={s.findingBadgeRow}>
                        <StatusBadge label={finding.severity.toUpperCase()} color={sevColor} />
                        <StatusBadge label={fStatusLabel.toUpperCase()} color={finding.status === 'remediated' || finding.status === 'closed' ? '#5A8A6E' : '#B8943E'} />
                      </View>
                      <ThemedText style={[s.findingPlan, { color: colors.textSecondary }]} numberOfLines={2}>
                        {finding.remediationPlan}
                      </ThemedText>
                    </View>
                  );
                })}
              </View>
            )}

            {isExpanded && audit.findings.length === 0 && (
              <View style={[s.findingsSection, { borderTopColor: colors.border }]}>
                <ThemedText style={[s.findingsEmpty, { color: colors.textSecondary }]}>
                  No findings — audit {audit.status === 'scheduled' ? 'not yet started' : 'clean'}
                </ThemedText>
              </View>
            )}

            <View style={s.auditExpandHint}>
              <IconSymbol
                name={isExpanded ? 'chevron.up' : 'chevron.down'}
                size={12}
                color={colors.textTertiary}
              />
            </View>
          </Pressable>
        );
      })}

      {audits.length === 0 && (
        <EmptyState icon="magnifyingglass.circle.fill" label="No audits scheduled" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// RISK REGISTER SUB-TAB
// =============================================================================

function RiskRegisterTab({
  colors,
  accentColor,
  risks,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  risks: ComplianceRisk[];
}) {
  const sorted = useMemo(() => {
    const sevOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...risks].sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);
  }, [risks]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {sorted.map((risk) => {
        const sevColor = RISK_SEVERITY_COLORS[risk.severity];
        const sevLabel = RISK_SEVERITY_LABELS[risk.severity];
        const catLabel = RISK_CATEGORY_LABELS[risk.category];
        const likelihoodLabel = risk.likelihood.charAt(0).toUpperCase() + risk.likelihood.slice(1);
        const residualColor = RISK_SEVERITY_COLORS[risk.residualRisk];
        const residualLabel = RISK_SEVERITY_LABELS[risk.residualRisk];
        return (
          <View
            key={risk.id}
            style={[s.riskCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[s.riskSeverityBar, { backgroundColor: sevColor }]} />
            <View style={s.riskContent}>
              <ThemedText style={[s.riskTitle, { color: colors.text }]} numberOfLines={2}>
                {risk.title}
              </ThemedText>
              <View style={s.riskBadgeRow}>
                <StatusBadge label={catLabel.toUpperCase()} color={accentColor} />
                <StatusBadge label={sevLabel.toUpperCase()} color={sevColor} />
                <StatusBadge label={likelihoodLabel.toUpperCase()} color={risk.likelihood === 'high' ? '#B85C5C' : risk.likelihood === 'medium' ? '#B8943E' : '#5A8A6E'} />
              </View>
              <View style={s.riskMetaRow}>
                <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.riskMetaText, { color: colors.textTertiary }]}>{risk.owner}</ThemedText>
              </View>
              <ThemedText style={[s.riskPlan, { color: colors.textSecondary }]} numberOfLines={2}>
                {risk.mitigationPlan}
              </ThemedText>
              <View style={s.riskFooter}>
                <View style={s.riskMetaRow}>
                  <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.riskMetaText, { color: colors.textTertiary }]}>
                    Target: {formatDate(risk.targetDate)}
                  </ThemedText>
                </View>
                <StatusBadge label={`RESIDUAL: ${residualLabel.toUpperCase()}`} color={residualColor} />
              </View>
            </View>
          </View>
        );
      })}

      {risks.length === 0 && (
        <EmptyState icon="shield.lefthalf.filled" label="No risks registered" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// INCIDENTS SUB-TAB
// =============================================================================

function IncidentsTab({
  colors,
  accentColor,
  incidents,
  role,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  incidents: ComplianceIncident[];
  role: ChurchRoleLens;
}) {
  // C3: only their ministry's incidents (no filtering field in data, so show all for now)
  const sorted = useMemo(() => {
    const sevOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    const statusOrder: Record<string, number> = { open: 0, investigating: 1, resolved: 2, closed: 3 };
    return [...incidents].sort((a, b) => {
      const sDiff = statusOrder[a.status] - statusOrder[b.status];
      if (sDiff !== 0) return sDiff;
      return sevOrder[a.severity] - sevOrder[b.severity];
    });
  }, [incidents]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {sorted.map((incident) => {
        const sevColor = RISK_SEVERITY_COLORS[incident.severity];
        const typeLabel = INCIDENT_TYPE_LABELS[incident.type];
        const statusColor = INCIDENT_STATUS_COLORS[incident.status];
        const statusLabel = INCIDENT_STATUS_LABELS[incident.status];
        const isClosed = incident.status === 'closed';
        return (
          <View
            key={incident.id}
            style={[s.incidentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[s.incidentSeverityBar, { backgroundColor: sevColor }]} />
            <View style={s.incidentContent}>
              <View style={s.incidentHeader}>
                <ThemedText style={[s.incidentTitle, { color: colors.text }]} numberOfLines={2}>
                  {incident.title}
                </ThemedText>
              </View>
              <View style={s.incidentBadgeRow}>
                <StatusBadge label={typeLabel.toUpperCase()} color={accentColor} />
                <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
                {isClosed && <StatusBadge label="IMMUTABLE" color="#9C9790" />}
              </View>
              <View style={s.incidentMetaRow}>
                <View style={s.incidentMetaItem}>
                  <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.incidentMetaText, { color: colors.textTertiary }]}>
                    {incident.reportedBy}
                  </ThemedText>
                </View>
                <View style={s.incidentMetaItem}>
                  <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.incidentMetaText, { color: colors.textTertiary }]}>
                    {formatDate(incident.reportedDate)}
                  </ThemedText>
                </View>
                {incident.evidenceCount > 0 && (
                  <View style={s.incidentMetaItem}>
                    <IconSymbol name="paperclip" size={11} color={colors.textTertiary} />
                    <ThemedText style={[s.incidentMetaText, { color: colors.textTertiary }]}>
                      {incident.evidenceCount}
                    </ThemedText>
                  </View>
                )}
              </View>
              <ThemedText style={[s.incidentDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {incident.description}
              </ThemedText>
            </View>
          </View>
        );
      })}

      {incidents.length === 0 && (
        <EmptyState icon="exclamationmark.triangle.fill" label="No incidents reported" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// EXCEPTIONS SUB-TAB
// =============================================================================

function ExceptionsTab({
  colors,
  accentColor,
  exceptions,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  exceptions: ComplianceException[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {exceptions.map((exc) => {
        const statusColor = EXCEPTION_STATUS_COLORS[exc.status];
        const statusLabel = EXCEPTION_STATUS_LABELS[exc.status];
        return (
          <View
            key={exc.id}
            style={[s.exceptionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.exceptionHeader}>
              <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
            </View>
            <ThemedText style={[s.exceptionPolicy, { color: colors.text }]} numberOfLines={1}>
              {exc.policyTitle}
            </ThemedText>
            <ThemedText style={[s.exceptionReason, { color: colors.textSecondary }]} numberOfLines={3}>
              {exc.reason}
            </ThemedText>
            <View style={[s.exceptionMeta, { borderTopColor: colors.border }]}>
              <View style={s.exceptionMetaItem}>
                <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.exceptionMetaText, { color: colors.textTertiary }]}>
                  {exc.duration}
                </ThemedText>
              </View>
              <View style={s.exceptionMetaItem}>
                <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.exceptionMetaText, { color: colors.textTertiary }]}>
                  {exc.requestedBy}
                </ThemedText>
              </View>
              <View style={s.exceptionMetaItem}>
                <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.exceptionMetaText, { color: colors.textTertiary }]}>
                  {formatDate(exc.requestedDate)}
                </ThemedText>
              </View>
            </View>
            <View style={s.approverRow}>
              <ThemedText style={[s.approverLabel, { color: colors.textTertiary }]}>Approvers:</ThemedText>
              {exc.approvers.map((approver, i) => (
                <ThemedText key={`${exc.id}-approver-${i}`} style={[s.approverName, { color: colors.textSecondary }]}>
                  {approver}{i < exc.approvers.length - 1 ? ', ' : ''}
                </ThemedText>
              ))}
            </View>
          </View>
        );
      })}

      {exceptions.length === 0 && (
        <EmptyState icon="hand.raised.fill" label="No exceptions on record" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// EXPORTS SUB-TAB
// =============================================================================

function ExportsTab({
  colors,
  accentColor,
  packets,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  packets: ExportPacket[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Export Packets</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Generate compliance report packages
      </ThemedText>

      {packets.map((packet) => (
        <View
          key={packet.id}
          style={[s.exportCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.exportCardTop}>
            <IconSymbol name="doc.text.fill" size={18} color={accentColor} />
            <View style={s.exportTextCol}>
              <ThemedText style={[s.exportName, { color: colors.text }]}>{packet.name}</ThemedText>
              <ThemedText style={[s.exportDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {packet.description}
              </ThemedText>
            </View>
          </View>
          <View style={s.exportCountsRow}>
            <ThemedText style={[s.exportCountText, { color: colors.textTertiary }]}>
              {packet.includedPolicies} policies
            </ThemedText>
            <ThemedText style={[s.exportCountText, { color: colors.textTertiary }]}>
              {packet.includedControls} controls
            </ThemedText>
            <ThemedText style={[s.exportCountText, { color: colors.textTertiary }]}>
              {packet.includedEvidence} evidence
            </ThemedText>
          </View>
          <Pressable
            style={[s.generateButton, { backgroundColor: accentColor + '18', borderColor: accentColor + '40' }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <IconSymbol name="arrow.down.doc.fill" size={14} color={accentColor} />
            <ThemedText style={[s.generateButtonText, { color: accentColor }]}>Generate</ThemedText>
          </Pressable>
        </View>
      ))}

      {packets.length === 0 && (
        <EmptyState icon="arrow.down.doc.fill" label="No export packets available" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// POLICY DETAIL BOTTOM SHEET
// =============================================================================

function PolicyDetailSheet({
  visible,
  onClose,
  policy,
  controls,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  policy: CompliancePolicy | null;
  controls: ComplianceControl[];
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!policy) return null;

  const statusColor = POLICY_STATUS_COLORS[policy.status];
  const statusLabel = POLICY_STATUS_LABELS[policy.status];
  const catLabel = POLICY_CATEGORY_LABELS[policy.category];
  const linkedControls = controls.filter((c) => c.linkedPolicyId === policy.id);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={policy.title} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={catLabel.toUpperCase()} color={accentColor} />
        <StatusBadge label={`v${policy.version}`} color={colors.textSecondary} />
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
      </View>

      {/* Summary */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Summary</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>{policy.summary}</ThemedText>
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{policy.owner}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Owner</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{policy.approver}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Approver</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {policy.effectiveDate ? formatDate(policy.effectiveDate) : 'TBD'}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Effective</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>v{policy.version}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Version</ThemedText>
          </View>
        </View>
      </View>

      {/* Attestation */}
      {policy.attestationRequired && (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Attestation</ThemedText>
          <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
            Required for: {policy.attestationAudience || 'All applicable personnel'}
          </ThemedText>
        </View>
      )}

      {/* Version History (stub) */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Version History</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
          v{policy.version} — Current ({policy.effectiveDate ? formatDate(policy.effectiveDate) : 'Draft'})
        </ThemedText>
      </View>

      {/* Linked Controls */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Linked Controls ({linkedControls.length})
        </ThemedText>
        {linkedControls.map((ctrl) => (
          <View key={ctrl.id} style={s.sheetListRow}>
            <IconSymbol name="slider.horizontal.3" size={14} color={accentColor} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {ctrl.name}
              </ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                {CONTROL_FREQUENCY_LABELS[ctrl.frequency]} — {EVIDENCE_STATUS_LABELS[ctrl.evidenceStatus]}
              </ThemedText>
            </View>
          </View>
        ))}
        {linkedControls.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No linked controls
          </ThemedText>
        )}
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
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>Close</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// CONTROL DETAIL BOTTOM SHEET
// =============================================================================

function ControlDetailSheet({
  visible,
  onClose,
  control,
  evidenceItems,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  control: ComplianceControl | null;
  evidenceItems: EvidenceItem[];
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!control) return null;

  const freqLabel = CONTROL_FREQUENCY_LABELS[control.frequency];
  const evidenceTypeLabel = EVIDENCE_TYPE_LABELS[control.evidenceType];
  const evidenceStatusColor = EVIDENCE_STATUS_COLORS[control.evidenceStatus];
  const evidenceStatusLabel = EVIDENCE_STATUS_LABELS[control.evidenceStatus];
  const linkedEvidence = evidenceItems.filter((e) => e.controlId === control.id);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={control.name} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={freqLabel.toUpperCase()} color={accentColor} />
        <StatusBadge label={evidenceTypeLabel.toUpperCase()} color={colors.textSecondary} />
        <StatusBadge label={evidenceStatusLabel.toUpperCase()} color={evidenceStatusColor} />
      </View>

      {/* Linked Policy */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Linked Policy</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
          {control.linkedPolicyTitle}
        </ThemedText>
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{control.owner}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Owner</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {control.scope === 'whole_church' ? 'Church-Wide' : 'Ministry'}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Scope</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {control.lastEvidenceDate ? formatDate(control.lastEvidenceDate) : '--'}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Last Evidence</ThemedText>
          </View>
        </View>
        {control.notes && (
          <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
            {control.notes}
          </ThemedText>
        )}
      </View>

      {/* Evidence Items */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Evidence ({linkedEvidence.length})
        </ThemedText>
        {linkedEvidence.map((ev) => {
          const evStatusColor = EVIDENCE_STATUS_COLORS[ev.status];
          const evStatusLabel = EVIDENCE_STATUS_LABELS[ev.status];
          return (
            <View key={ev.id} style={s.sheetListRow}>
              <IconSymbol name="paperclip" size={14} color={accentColor} />
              <View style={s.sheetListTextCol}>
                <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                  {ev.controlName}
                </ThemedText>
                <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                  {ev.submittedBy} — {formatDate(ev.submittedDate)}
                </ThemedText>
              </View>
              <StatusBadge label={evStatusLabel.toUpperCase()} color={evStatusColor} />
            </View>
          );
        })}
        {linkedEvidence.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No evidence items linked
          </ThemedText>
        )}
      </View>

      {/* Status Timeline (stub) */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Status Timeline</ThemedText>
        <View style={s.sheetListRow}>
          <View style={[s.timelineDot, { backgroundColor: evidenceStatusColor }]} />
          <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
            Current: {evidenceStatusLabel}
          </ThemedText>
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
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>Close</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function ChurchOrgCompliance({ colors, accentColor, role = 'C1' }: Props) {
  // === RBAC Gate: C5-C11 locked (hidden per RBAC matrix) ===
  if (role !== 'C0' && role !== 'C1' && role !== 'C2' && role !== 'C3' && role !== 'C4') {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Compliance</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          Compliance information is not available
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState((role === 'C3' || role === 'C4') ? 'policies' : 'overview');
  const [selectedPolicy, setSelectedPolicy] = useState<CompliancePolicy | null>(null);
  const [policySheetVisible, setPolicySheetVisible] = useState(false);
  const [selectedControl, setSelectedControl] = useState<ComplianceControl | null>(null);
  const [controlSheetVisible, setControlSheetVisible] = useState(false);

  // === Data ===
  const data = useMemo(() => getChurchComplianceLegalData(), []);

  // === Callbacks ===
  const handleSelectPolicy = useCallback((policy: CompliancePolicy) => {
    setSelectedPolicy(policy);
    setPolicySheetVisible(true);
  }, []);

  const handleClosePolicySheet = useCallback(() => {
    setPolicySheetVisible(false);
  }, []);

  const handleSelectControl = useCallback((control: ComplianceControl) => {
    setSelectedControl(control);
    setControlSheetVisible(true);
  }, []);

  const handleCloseControlSheet = useCallback(() => {
    setControlSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (isElderLevel(role)) return SUB_TABS; // C1/C2: full 9 tabs
    if (isStaffLevel(role)) {
      // C3 (Ministry Leader): Overview + Policies + Controls + Incidents
      return SUB_TABS.filter(
        (t) => t.id === 'overview' || t.id === 'policies' || t.id === 'controls' || t.id === 'incidents',
      );
    }
    // C4 (Volunteer): Policies only
    return SUB_TABS.filter((t) => t.id === 'policies');
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        if (!isElderLevel(role)) return null;
        return <OverviewTab colors={colors} accentColor={accentColor} data={data} />;
      case 'policies':
        return (
          <PoliciesTab
            colors={colors}
            accentColor={accentColor}
            policies={data.policies}
            onSelectPolicy={handleSelectPolicy}
            readOnly={!isElderLevel(role)}
          />
        );
      case 'legal-docs':
        if (!isElderLevel(role)) return null;
        return (
          <LegalDocsTab
            colors={colors}
            accentColor={accentColor}
            docs={data.legalDocs}
            role={role}
          />
        );
      case 'controls':
        if (!isElderLevel(role)) return null;
        return (
          <ControlsTab
            colors={colors}
            accentColor={accentColor}
            controls={data.controls}
            role={role}
            onSelectControl={handleSelectControl}
          />
        );
      case 'audits':
        if (!isElderLevel(role)) return null;
        return <AuditsTab colors={colors} accentColor={accentColor} audits={data.auditRuns} />;
      case 'risk-register':
        if (!isElderLevel(role)) return null;
        return <RiskRegisterTab colors={colors} accentColor={accentColor} risks={data.risks} />;
      case 'incidents':
        if (!isElderLevel(role)) return null;
        return (
          <IncidentsTab
            colors={colors}
            accentColor={accentColor}
            incidents={data.incidents}
            role={role}
          />
        );
      case 'exceptions':
        if (!isElderLevel(role)) return null;
        return <ExceptionsTab colors={colors} accentColor={accentColor} exceptions={data.exceptions} />;
      case 'exports':
        if (!isElderLevel(role)) return null;
        return <ExportsTab colors={colors} accentColor={accentColor} packets={data.exportPackets} />;
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

      {/* Policy Detail Bottom Sheet */}
      <PolicyDetailSheet
        visible={policySheetVisible}
        onClose={handleClosePolicySheet}
        policy={selectedPolicy}
        controls={data.controls}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Control Detail Bottom Sheet */}
      <ControlDetailSheet
        visible={controlSheetVisible}
        onClose={handleCloseControlSheet}
        control={selectedControl}
        evidenceItems={data.evidenceItems}
        colors={colors}
        accentColor={accentColor}
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

  // -- Status Strip --
  statusStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  statusStripItem: {
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusCount: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statusLabel: {
    fontSize: 11,
  },

  // -- KPI Row --
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  kpiCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Section Card --
  sectionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  percentLabel: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Action Row --
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  actionRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRankText: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },

  // -- Change Row --
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  changeText: {
    flex: 1,
    fontSize: 13,
  },
  changeTime: {
    fontSize: 11,
    marginTop: 1,
  },

  // -- Policy Card --
  policyCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  policyCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  policyTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  policyBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  policyMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  policyMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  policyMetaText: {
    fontSize: 11,
  },
  policySummary: {
    fontSize: 12,
    lineHeight: 17,
  },

  // -- Legal Doc Card --
  legalCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  legalCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  legalTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  legalBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  legalMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  legalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legalMetaText: {
    fontSize: 11,
  },

  // -- Control Card --
  controlCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  controlName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  controlPolicy: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  controlMetaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  controlMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  controlMetaText: {
    fontSize: 11,
  },
  controlBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  // -- Audit Card --
  auditCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  auditHeaderText: {
    flex: 1,
  },
  auditName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  auditScope: {
    fontSize: 12,
  },
  auditMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  auditMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  auditMetaText: {
    fontSize: 11,
  },
  findingsCountRow: {
    flexDirection: 'row',
    gap: 4,
  },
  auditExpandHint: {
    alignItems: 'center',
    paddingTop: Spacing.xs,
  },

  // -- Findings Section --
  findingsSection: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  findingsSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  findingRow: {
    borderLeftWidth: 3,
    paddingLeft: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  findingTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  findingBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  findingPlan: {
    fontSize: 11,
    lineHeight: 16,
  },
  findingsEmpty: {
    fontSize: 12,
    fontStyle: 'italic',
  },

  // -- Risk Card --
  riskCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  riskSeverityBar: {
    width: 4,
  },
  riskContent: {
    flex: 1,
    padding: Spacing.md,
  },
  riskTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  riskBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  riskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  riskMetaText: {
    fontSize: 11,
  },
  riskPlan: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  riskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // -- Incident Card --
  incidentCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  incidentTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    marginRight: Spacing.sm,
  },
  incidentBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  incidentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
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
  },

  // -- Exception Card --
  exceptionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  exceptionHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  exceptionPolicy: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  exceptionReason: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  exceptionMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  exceptionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exceptionMetaText: {
    fontSize: 11,
  },
  approverRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  approverLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  approverName: {
    fontSize: 11,
  },

  // -- Export Card --
  exportCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  exportCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  exportTextCol: {
    flex: 1,
  },
  exportName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  exportDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  exportCountsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  exportCountText: {
    fontSize: 11,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  generateButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Bottom Sheet --
  sheetBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  sheetBodyText: {
    fontSize: 13,
    lineHeight: 19,
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
  sheetDetailLabel: {
    fontSize: 11,
    marginTop: 1,
  },
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
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
