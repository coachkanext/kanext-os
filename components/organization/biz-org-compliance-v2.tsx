/**
 * Business Organization Compliance Tab V2 — 9-tab Compliance Hub.
 * Overview, Policies, Risk Register, Controls, Evidence,
 * Audits, Incidents, Exceptions, Exports.
 *
 * Key features:
 * - Controls can BLOCK Payment Rails release if failed
 * - Incidents become immutable once closed
 * - Entity-scoped data tied to Valuetainment entities + Sliema Wanderers FC
 * - Compliance score with circular progress indicator
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius, BusinessPalette } from '@/constants/theme';
import {
  BizCard,
  BizSubTabBar,
  BizStatusChip,
  BizAlertCard,
  BizEmptyLock,
  statusVariant,
} from '@/components/business/business-shared';
import type { BusinessRoleLens } from '@/utils/business-rbac';
import { isFounder, isBoardLevel } from '@/utils/business-rbac';
import { useBusiness } from '@/context/business-context';
import type {
  TrafficLight,
  CrossTabLink,
} from '@/data/biz-org-shared-types';
import {
  TRAFFIC_LIGHT_COLORS,
  KANEXT_HOLDCO,
  KANEXT_OPSCO,
  SLIEMA_WANDERERS,
  SEEDED_ENTITY_NAMES,
} from '@/data/biz-org-shared-types';
import {
  COMPLIANCE_SUB_TABS,
  getBizComplianceData,
  POLICY_STATUS_COLOR,
  POLICY_STATUS_LABEL,
  POLICY_CATEGORY_COLOR,
  POLICY_CATEGORY_LABEL,
  RISK_LIKELIHOOD_COLOR,
  RISK_IMPACT_COLOR,
  MITIGATION_STATUS_COLOR,
  MITIGATION_STATUS_LABEL,
  CONTROL_TYPE_COLOR,
  CONTROL_TYPE_LABEL,
  EFFECTIVENESS_COLOR,
  EFFECTIVENESS_LABEL,
  TEST_RESULT_COLOR,
  TEST_RESULT_LABEL,
  EVIDENCE_TYPE_COLOR,
  EVIDENCE_TYPE_LABEL,
  EVIDENCE_REVIEW_COLOR,
  EVIDENCE_REVIEW_LABEL,
  AUDIT_TYPE_COLOR,
  AUDIT_TYPE_LABEL,
  AUDIT_STATUS_COLOR,
  AUDIT_STATUS_LABEL,
  INCIDENT_SEVERITY_COLOR,
  INCIDENT_STATUS_COLOR,
  INCIDENT_STATUS_LABEL,
  EXCEPTION_STATUS_COLOR,
  EXCEPTION_STATUS_LABEL,
  EXPORT_FORMAT_COLOR,
} from '@/data/mock-biz-org-compliance';
import type {
  ComplianceSubTabId,
  ComplianceOverview,
  CompliancePolicy,
  ComplianceRisk,
  ComplianceControl,
  ComplianceEvidence,
  ComplianceAudit,
  ComplianceIncident,
  ComplianceException,
  ComplianceExportOption,
  ComplianceActivity,
} from '@/data/mock-biz-org-compliance';

const BP = BusinessPalette;

// =============================================================================
// PAYMENT RAILS READINESS DATA
// =============================================================================

const RAILS_READINESS = {
  score: 72,
  label: 'On Track',
  items: [
    { label: 'KYC/AML Program', status: 'complete' as const },
    { label: 'PCI-DSS Certification', status: 'in_progress' as const },
    { label: 'BSA Compliance', status: 'pending' as const },
    { label: 'Processor Agreement', status: 'complete' as const },
    { label: 'Dispute Resolution SLA', status: 'complete' as const },
  ],
};

const RAILS_STATUS_COLOR: Record<string, string> = {
  complete: BP.emerald,
  in_progress: BP.amber,
  pending: BP.ash,
};

const RAILS_STATUS_LABEL: Record<string, string> = {
  complete: 'Complete',
  in_progress: 'In Progress',
  pending: 'Pending',
};

// =============================================================================
// NEXT 5 ACTIONS DATA
// =============================================================================

const NEXT_5_ACTIONS = [
  { id: 'na-1', label: 'Complete PCI-DSS SAQ-D self-assessment', severity: 'high' as const, dueDate: 'Mar 31' },
  { id: 'na-2', label: 'Submit Malta FA compliance docs', severity: 'high' as const, dueDate: 'OVERDUE' },
  { id: 'na-3', label: 'File Delaware annual report', severity: 'medium' as const, dueDate: 'Mar 1' },
  { id: 'na-4', label: 'Submit FinCEN BOI report', severity: 'medium' as const, dueDate: 'Mar 15' },
  { id: 'na-5', label: 'Update CRA plan for bank charter', severity: 'low' as const, dueDate: 'Apr 30' },
];

const SEVERITY_BORDER_COLOR: Record<string, string> = {
  high: BP.red,
  medium: BP.amber,
  low: BP.ash,
};

// =============================================================================
// ATTESTATION STATUS DATA
// =============================================================================

const ATTESTATION_STATUS = [
  { policyLabel: 'AML/KYC Policy', attestedCount: 8, requiredCount: 8, status: 'complete' as const },
  { policyLabel: 'Data Privacy Policy', attestedCount: 6, requiredCount: 8, status: 'pending' as const },
  { policyLabel: 'Acceptable Use Policy', attestedCount: 8, requiredCount: 8, status: 'complete' as const },
  { policyLabel: 'Incident Response Plan', attestedCount: 3, requiredCount: 8, status: 'overdue' as const },
];

const ATTESTATION_COLOR: Record<string, string> = {
  complete: BP.emerald,
  pending: BP.amber,
  overdue: BP.red,
};

const ATTESTATION_LABEL: Record<string, string> = {
  complete: 'Complete',
  pending: 'Pending',
  overdue: 'Overdue',
};

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: BusinessRoleLens;
}

// =============================================================================
// SUB-COMPONENTS — Badges
// =============================================================================

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[st.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[st.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

function EmptyState({ icon, text, colors }: { icon: string; text: string; colors: typeof Colors.light }) {
  return (
    <View style={st.emptyState}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[st.emptyText, { color: colors.textSecondary }]}>{text}</ThemedText>
    </View>
  );
}

// =============================================================================
// CIRCULAR PROGRESS — Compliance score indicator
// =============================================================================

function CircularScore({
  score,
  size,
  colors,
  accentColor,
}: {
  score: number;
  size: number;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressAngle = (score / 100) * 360;

  // Use View-based approach: background circle + overlay arcs
  const scoreColor =
    score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background ring */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: colors.backgroundTertiary,
        }}
      />
      {/* Progress ring — top half */}
      {progressAngle > 0 && (
        <View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: scoreColor,
            borderTopColor: progressAngle >= 90 ? scoreColor : 'transparent',
            borderRightColor: progressAngle >= 180 ? scoreColor : progressAngle > 90 ? scoreColor : 'transparent',
            borderBottomColor: progressAngle >= 270 ? scoreColor : progressAngle > 180 ? scoreColor : 'transparent',
            borderLeftColor: progressAngle >= 360 ? scoreColor : progressAngle > 270 ? scoreColor : 'transparent',
            transform: [{ rotate: '-90deg' }],
          }}
        />
      )}
      {/* Center text */}
      <ThemedText style={[st.circularScoreValue, { color: scoreColor }]}>
        {score}
      </ThemedText>
      <ThemedText style={[st.circularScoreLabel, { color: colors.textTertiary }]}>
        /100
      </ThemedText>
    </View>
  );
}

// =============================================================================
// FILTER CHIPS
// =============================================================================

const POLICY_CATEGORIES: Array<{ key: CompliancePolicy['category'] | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'data_privacy', label: 'Data Privacy' },
  { key: 'financial', label: 'Financial' },
  { key: 'operational', label: 'Operational' },
  { key: 'hr', label: 'HR' },
  { key: 'security', label: 'Security' },
  { key: 'regulatory', label: 'Regulatory' },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BizOrgComplianceV2({ colors, accentColor, role = 'B1' }: Props) {
  // === RBAC Gate: Only B1 and B2b (board, limited view) can access compliance ===
  if (!isBoardLevel(role)) {
    return <BizEmptyLock title="Compliance" message="This section is restricted. Contact the Founder for access." />;
  }

  // === Entity Scope ===
  const { selectedEntityId } = useBusiness();
  // TODO: Filter compliance data by selectedEntityId when backend wires up entity-scoped queries

  // === State ===
  const [activeTab, setActiveTab] = useState<ComplianceSubTabId>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [policyCategoryFilter, setPolicyCategoryFilter] = useState<CompliancePolicy['category'] | 'all'>('all');

  // Detail sheets
  const [policyDetailVisible, setPolicyDetailVisible] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<CompliancePolicy | null>(null);
  const [riskDetailVisible, setRiskDetailVisible] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<ComplianceRisk | null>(null);
  const [controlDetailVisible, setControlDetailVisible] = useState(false);
  const [selectedControl, setSelectedControl] = useState<ComplianceControl | null>(null);
  const [evidenceDetailVisible, setEvidenceDetailVisible] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<ComplianceEvidence | null>(null);
  const [auditDetailVisible, setAuditDetailVisible] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<ComplianceAudit | null>(null);
  const [incidentDetailVisible, setIncidentDetailVisible] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<ComplianceIncident | null>(null);
  const [exceptionDetailVisible, setExceptionDetailVisible] = useState(false);
  const [selectedException, setSelectedException] = useState<ComplianceException | null>(null);

  // === Data ===
  const data = useMemo(() => getBizComplianceData(), []);

  // === Active exceptions count for overview ===
  const activeExceptions = useMemo(
    () => data.exceptions.filter((e) => e.status === 'active').length,
    [data.exceptions],
  );

  // === Filtered data ===
  const filteredPolicies = useMemo(() => {
    let filtered = data.policies;
    if (policyCategoryFilter !== 'all') {
      filtered = filtered.filter((p) => p.category === policyCategoryFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.owner.toLowerCase().includes(q) ||
          p.entityName.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [data.policies, policyCategoryFilter, searchQuery]);

  const filteredRisks = useMemo(() => {
    if (!searchQuery) return data.risks;
    const q = searchQuery.toLowerCase();
    return data.risks.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.owner.toLowerCase().includes(q) ||
        r.entityName.toLowerCase().includes(q),
    );
  }, [data.risks, searchQuery]);

  const filteredControls = useMemo(() => {
    if (!searchQuery) return data.controls;
    const q = searchQuery.toLowerCase();
    return data.controls.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.entityName.toLowerCase().includes(q),
    );
  }, [data.controls, searchQuery]);

  const filteredEvidence = useMemo(() => {
    if (!searchQuery) return data.evidence;
    const q = searchQuery.toLowerCase();
    return data.evidence.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.controlName.toLowerCase().includes(q) ||
        e.uploadedBy.toLowerCase().includes(q),
    );
  }, [data.evidence, searchQuery]);

  const filteredAudits = useMemo(() => {
    if (!searchQuery) return data.audits;
    const q = searchQuery.toLowerCase();
    return data.audits.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.entityName.toLowerCase().includes(q),
    );
  }, [data.audits, searchQuery]);

  const filteredIncidents = useMemo(() => {
    if (!searchQuery) return data.incidents;
    const q = searchQuery.toLowerCase();
    return data.incidents.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.entityName.toLowerCase().includes(q),
    );
  }, [data.incidents, searchQuery]);

  const filteredExceptions = useMemo(() => {
    if (!searchQuery) return data.exceptions;
    const q = searchQuery.toLowerCase();
    return data.exceptions.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.policyName.toLowerCase().includes(q) ||
        e.entityName.toLowerCase().includes(q),
    );
  }, [data.exceptions, searchQuery]);

  // === Callbacks ===
  const handleTabSelect = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(id as ComplianceSubTabId);
    setSearchQuery('');
    setPolicyCategoryFilter('all');
  }, []);

  const handlePolicyPress = useCallback((policy: CompliancePolicy) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPolicy(policy);
    setPolicyDetailVisible(true);
  }, []);

  const handleRiskPress = useCallback((risk: ComplianceRisk) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRisk(risk);
    setRiskDetailVisible(true);
  }, []);

  const handleControlPress = useCallback((control: ComplianceControl) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedControl(control);
    setControlDetailVisible(true);
  }, []);

  const handleEvidencePress = useCallback((ev: ComplianceEvidence) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedEvidence(ev);
    setEvidenceDetailVisible(true);
  }, []);

  const handleAuditPress = useCallback((audit: ComplianceAudit) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAudit(audit);
    setAuditDetailVisible(true);
  }, []);

  const handleIncidentPress = useCallback((incident: ComplianceIncident) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIncident(incident);
    setIncidentDetailVisible(true);
  }, []);

  const handleExceptionPress = useCallback((exception: ComplianceException) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedException(exception);
    setExceptionDetailVisible(true);
  }, []);

  const handleExportPress = useCallback((opt: ComplianceExportOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Export action placeholder
  }, []);

  const handleCategoryFilterPress = useCallback((key: CompliancePolicy['category'] | 'all') => {
    Haptics.selectionAsync();
    setPolicyCategoryFilter(key);
  }, []);

  // ===================================================================
  // RENDER — TAB CONTENT
  // ===================================================================

  // === RBAC-aware sub-tabs: B2b hides incidents detail ===
  const visibleSubTabs = useMemo(() => {
    const all = COMPLIANCE_SUB_TABS.map((t) => ({ id: t.id, label: t.label }));
    if (isFounder(role)) return all;
    // B2b: hide incidents (sensitive detail)
    return all.filter((t) => t.id !== 'incidents');
  }, [role]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'policies':
        return renderPolicies();
      case 'risk-register':
        return renderRiskRegister();
      case 'controls':
        return renderControls();
      case 'evidence':
        return renderEvidence();
      case 'audits':
        return renderAudits();
      case 'incidents':
        if (!isFounder(role)) return null;
        return renderIncidents();
      case 'exceptions':
        return renderExceptions();
      case 'exports':
        return renderExports();
      default:
        return null;
    }
  };

  // === Tab 1: Overview ===
  const renderOverview = () => {
    const ov = data.overview;
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={st.tabScroll}
      >
        {/* Payment Rails Readiness */}
        <View style={[st.readinessCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[st.sectionTitle, { color: colors.textSecondary }]}>
            PAYMENT RAILS READINESS
          </ThemedText>
          <View style={st.readinessTopRow}>
            <View style={[st.readinessScoreCircle, { borderColor: BP.amber }]}>
              <ThemedText style={[st.readinessScoreText, { color: BP.amber }]}>
                {RAILS_READINESS.score}%
              </ThemedText>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <ThemedText style={[{ fontSize: 15, fontWeight: '700', color: colors.text }]}>
                {RAILS_READINESS.label}
              </ThemedText>
              <ThemedText style={[{ fontSize: 12, color: colors.textSecondary }]}>
                {RAILS_READINESS.items.filter((i) => i.status === 'complete').length} of {RAILS_READINESS.items.length} requirements met
              </ThemedText>
            </View>
          </View>
          {RAILS_READINESS.items.map((item, idx) => (
            <View key={idx} style={st.readinessItemRow}>
              <View
                style={[
                  st.readinessDot,
                  { backgroundColor: RAILS_STATUS_COLOR[item.status] },
                ]}
              />
              <ThemedText style={[st.readinessItemLabel, { color: colors.text }]}>
                {item.label}
              </ThemedText>
              <ThemedText
                style={[
                  st.readinessItemStatus,
                  { color: RAILS_STATUS_COLOR[item.status] },
                ]}
              >
                {RAILS_STATUS_LABEL[item.status]}
              </ThemedText>
            </View>
          ))}
          <Pressable
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
          >
            <ThemedText style={[st.readinessDeepLink, { color: BP.amber }]}>
              Open Payment Rails →
            </ThemedText>
          </Pressable>
        </View>

        {/* Next 5 Actions */}
        <View style={[st.next5Card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[st.sectionTitle, { color: colors.textSecondary }]}>
            NEXT 5 ACTIONS
          </ThemedText>
          {NEXT_5_ACTIONS.map((action, idx) => (
            <View
              key={action.id}
              style={[
                st.nextActionRow,
                { borderLeftColor: SEVERITY_BORDER_COLOR[action.severity] },
              ]}
            >
              <ThemedText style={[st.nextActionNumber, { color: colors.textTertiary }]}>
                {idx + 1}
              </ThemedText>
              <ThemedText style={[st.nextActionLabel, { color: colors.text }]} numberOfLines={2}>
                {action.label}
              </ThemedText>
              <ThemedText
                style={[
                  st.nextActionDue,
                  {
                    color: action.dueDate === 'OVERDUE' ? BP.red : colors.textSecondary,
                    fontWeight: action.dueDate === 'OVERDUE' ? '700' : '500',
                  },
                ]}
              >
                {action.dueDate}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Compliance Score */}
        <View style={[st.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[st.sectionTitle, { color: colors.textSecondary }]}>
            COMPLIANCE SCORE
          </ThemedText>
          <View style={st.scoreRow}>
            <CircularScore
              score={ov.score}
              size={100}
              colors={colors}
              accentColor={accentColor}
            />
            <View style={st.scoreDetails}>
              <ThemedText style={[st.scoreDetailLabel, { color: colors.textSecondary }]}>
                Overall compliance health across all entities and controls.
              </ThemedText>
              <View style={st.scoreMetaRow}>
                <View
                  style={[
                    st.scoreTrendBadge,
                    { backgroundColor: '#22C55E' + '15' },
                  ]}
                >
                  <IconSymbol name="arrow.up.right" size={10} color="#22C55E" />
                  <ThemedText style={[st.scoreTrendText, { color: '#22C55E' }]}>
                    +3 pts this quarter
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 6 stat cards — 2x3 grid */}
        <View style={st.statsGrid}>
          <View style={[st.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[st.statIconCircle, { backgroundColor: '#22C55E' + '15' }]}>
              <IconSymbol name="doc.text.fill" size={16} color="#22C55E" />
            </View>
            <ThemedText style={[st.statLabel, { color: colors.textSecondary }]}>
              Active Policies
            </ThemedText>
            <ThemedText style={[st.statValue, { color: colors.text }]}>
              {ov.activePolicies}
            </ThemedText>
          </View>

          <View style={[st.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[st.statIconCircle, { backgroundColor: '#EF4444' + '15' }]}>
              <IconSymbol name="shield.lefthalf.filled" size={16} color="#EF4444" />
            </View>
            <ThemedText style={[st.statLabel, { color: colors.textSecondary }]}>
              Open Risks
            </ThemedText>
            <ThemedText style={[st.statValue, { color: ov.openRisks > 0 ? '#EF4444' : colors.text }]}>
              {ov.openRisks}
            </ThemedText>
          </View>

          <View style={[st.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[st.statIconCircle, { backgroundColor: '#1D9BF0' + '15' }]}>
              <IconSymbol name="checkmark.shield.fill" size={16} color="#1D9BF0" />
            </View>
            <ThemedText style={[st.statLabel, { color: colors.textSecondary }]}>
              Control Eff.
            </ThemedText>
            <ThemedText style={[st.statValue, { color: colors.text }]}>
              {ov.controlEffectiveness}%
            </ThemedText>
          </View>

          <View style={[st.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[st.statIconCircle, { backgroundColor: '#F59E0B' + '15' }]}>
              <IconSymbol name="magnifyingglass.circle.fill" size={16} color="#F59E0B" />
            </View>
            <ThemedText style={[st.statLabel, { color: colors.textSecondary }]}>
              Upcoming Audits
            </ThemedText>
            <ThemedText style={[st.statValue, { color: colors.text }]}>
              {ov.upcomingAudits}
            </ThemedText>
          </View>

          <View style={[st.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[st.statIconCircle, { backgroundColor: '#EF4444' + '15' }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#EF4444" />
            </View>
            <ThemedText style={[st.statLabel, { color: colors.textSecondary }]}>
              Recent Incidents
            </ThemedText>
            <ThemedText style={[st.statValue, { color: ov.recentIncidents > 0 ? '#EF4444' : colors.text }]}>
              {ov.recentIncidents}
            </ThemedText>
          </View>

          <View style={[st.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[st.statIconCircle, { backgroundColor: '#1D9BF0' + '15' }]}>
              <IconSymbol name="doc.badge.gearshape" size={16} color="#1D9BF0" />
            </View>
            <ThemedText style={[st.statLabel, { color: colors.textSecondary }]}>
              Active Exceptions
            </ThemedText>
            <ThemedText style={[st.statValue, { color: colors.text }]}>
              {activeExceptions}
            </ThemedText>
          </View>
        </View>

        {/* Recent Activity */}
        <ThemedText style={[st.sectionHeader, { color: colors.text }]}>
          Recent Activity
        </ThemedText>
        <View style={[st.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {data.recentActivity.map((item, idx) => (
            <View
              key={item.id}
              style={[
                st.activityRow,
                idx < data.recentActivity.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={[st.activityDot, { backgroundColor: getActivityColor(item.type) }]} />
              <View style={st.activityTextCol}>
                <ThemedText style={[st.activityText, { color: colors.text }]} numberOfLines={2}>
                  {item.text}
                </ThemedText>
                <ThemedText style={[st.activityTime, { color: colors.textTertiary }]}>
                  {item.timestamp}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // === Tab 2: Policies ===
  const renderPolicies = () => (
    <View style={{ flex: 1 }}>
      {/* Category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={st.filterChipsRow}
        style={st.filterChipsContainer}
      >
        {POLICY_CATEGORIES.map((cat) => {
          const isActive = policyCategoryFilter === cat.key;
          return (
            <Pressable
              key={cat.key}
              style={[
                st.filterChip,
                isActive
                  ? { backgroundColor: accentColor, borderColor: accentColor }
                  : { backgroundColor: colors.backgroundTertiary, borderColor: colors.border },
              ]}
              onPress={() => handleCategoryFilterPress(cat.key)}
            >
              <ThemedText
                style={[
                  st.filterChipText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {cat.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList<CompliancePolicy>
        data={filteredPolicies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={st.listContent}
        ListEmptyComponent={<EmptyState icon="doc.text.fill" text="No policies found" colors={colors} />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              st.listCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => handlePolicyPress(item)}
          >
            <View style={st.listCardRow}>
              <View style={[st.listIconCircle, { backgroundColor: POLICY_CATEGORY_COLOR[item.category] + '15' }]}>
                <IconSymbol name="doc.text.fill" size={16} color={POLICY_CATEGORY_COLOR[item.category]} />
              </View>
              <View style={st.listCardInfo}>
                <View style={st.cardTopRow}>
                  <ThemedText style={[st.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <StatusBadge label={POLICY_STATUS_LABEL[item.status]} color={POLICY_STATUS_COLOR[item.status]} />
                </View>
                <View style={st.cardMetaRow}>
                  <StatusBadge label={POLICY_CATEGORY_LABEL[item.category]} color={POLICY_CATEGORY_COLOR[item.category]} />
                  <ThemedText style={[st.metaText, { color: colors.textTertiary }]}>
                    v{item.version}
                  </ThemedText>
                </View>
                <View style={st.cardStatsRow}>
                  <View style={st.cardStat}>
                    <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                    <ThemedText style={[st.cardStatText, { color: colors.textSecondary }]}>
                      Eff. {item.effectiveDate}
                    </ThemedText>
                  </View>
                  <View style={st.cardStat}>
                    <IconSymbol name="arrow.clockwise" size={12} color={colors.textTertiary} />
                    <ThemedText style={[st.cardStatText, { color: colors.textSecondary }]}>
                      {item.reviewCycle}
                    </ThemedText>
                  </View>
                </View>
                <View style={st.cardStatsRow}>
                  <View style={st.cardStat}>
                    <IconSymbol name="person" size={12} color={colors.textTertiary} />
                    <ThemedText style={[st.cardStatText, { color: colors.textSecondary }]}>
                      {item.owner}
                    </ThemedText>
                  </View>
                  <View style={st.cardStat}>
                    <IconSymbol name="building.2" size={12} color={colors.textTertiary} />
                    <ThemedText style={[st.cardStatText, { color: colors.textSecondary }]}>
                      {item.entityName}
                    </ThemedText>
                  </View>
                </View>
                {/* Attestation row — matched by policy name */}
                {(() => {
                  const att = ATTESTATION_STATUS.find((a) => a.policyLabel === item.name);
                  if (!att) return null;
                  const pct = att.requiredCount > 0 ? (att.attestedCount / att.requiredCount) * 100 : 0;
                  const attColor = ATTESTATION_COLOR[att.status] ?? BP.ash;
                  return (
                    <View style={st.attestationRow}>
                      <ThemedText style={[st.attestationLabel, { color: colors.textSecondary }]}>
                        Attestation: {att.attestedCount}/{att.requiredCount}
                      </ThemedText>
                      <View style={[st.attestationBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                        <View
                          style={[
                            st.attestationBarFill,
                            { width: `${pct}%`, backgroundColor: attColor },
                          ]}
                        />
                      </View>
                      <StatusBadge label={ATTESTATION_LABEL[att.status]} color={attColor} />
                    </View>
                  );
                })()}
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );

  // === Tab 3: Risk Register ===
  const renderRiskRegister = () => (
    <FlatList<ComplianceRisk>
      data={filteredRisks}
      keyExtractor={(item) => item.id}
      contentContainerStyle={st.listContent}
      ListEmptyComponent={<EmptyState icon="shield.lefthalf.filled" text="No risks found" colors={colors} />}
      renderItem={({ item }) => {
        const likelihoodColor = RISK_LIKELIHOOD_COLOR[item.likelihood];
        const impactColor = RISK_IMPACT_COLOR[item.impact];
        const mitigationColor = MITIGATION_STATUS_COLOR[item.mitigationStatus];
        return (
          <Pressable
            style={({ pressed }) => [
              st.listCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => handleRiskPress(item)}
          >
            <View style={st.listCardRow}>
              <View style={[st.listIconCircle, { backgroundColor: mitigationColor + '15' }]}>
                <IconSymbol name="shield.lefthalf.filled" size={16} color={mitigationColor} />
              </View>
              <View style={st.listCardInfo}>
                <View style={st.cardTopRow}>
                  <ThemedText style={[st.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </ThemedText>
                  <StatusBadge
                    label={MITIGATION_STATUS_LABEL[item.mitigationStatus]}
                    color={mitigationColor}
                  />
                </View>
                <ThemedText
                  style={[st.descriptionPreview, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {item.description}
                </ThemedText>
                {/* Likelihood x Impact matrix badge */}
                <View style={st.cardMetaRow}>
                  <View style={[st.matrixBadge, { borderColor: likelihoodColor + '40' }]}>
                    <View style={[st.matrixDot, { backgroundColor: likelihoodColor }]} />
                    <ThemedText style={[st.matrixText, { color: likelihoodColor }]}>
                      L: {item.likelihood.toUpperCase()}
                    </ThemedText>
                  </View>
                  <View style={[st.matrixBadge, { borderColor: impactColor + '40' }]}>
                    <View style={[st.matrixDot, { backgroundColor: impactColor }]} />
                    <ThemedText style={[st.matrixText, { color: impactColor }]}>
                      I: {item.impact.toUpperCase()}
                    </ThemedText>
                  </View>
                  <View style={[st.badge, { backgroundColor: colors.backgroundTertiary }]}>
                    <ThemedText style={[st.badgeText, { color: colors.textSecondary }]}>
                      {item.linkedControlIds.length} control{item.linkedControlIds.length !== 1 ? 's' : ''}
                    </ThemedText>
                  </View>
                </View>
                <View style={st.cardStatsRow}>
                  <View style={st.cardStat}>
                    <IconSymbol name="person" size={12} color={colors.textTertiary} />
                    <ThemedText style={[st.cardStatText, { color: colors.textSecondary }]}>
                      {item.owner}
                    </ThemedText>
                  </View>
                  <View style={st.cardStat}>
                    <IconSymbol name="building.2" size={12} color={colors.textTertiary} />
                    <ThemedText style={[st.cardStatText, { color: colors.textSecondary }]}>
                      {item.entityName}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
        );
      }}
    />
  );

  // === Tab 4: Controls ===
  const renderControls = () => (
    <FlatList<ComplianceControl>
      data={filteredControls}
      keyExtractor={(item) => item.id}
      contentContainerStyle={st.listContent}
      ListEmptyComponent={<EmptyState icon="checkmark.shield.fill" text="No controls found" colors={colors} />}
      renderItem={({ item }) => {
        const typeColor = CONTROL_TYPE_COLOR[item.type];
        const effColor = EFFECTIVENESS_COLOR[item.effectiveness];
        const testColor = TEST_RESULT_COLOR[item.testResult];
        return (
          <Pressable
            style={({ pressed }) => [
              st.listCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              item.canBlockRails && { borderLeftWidth: 3, borderLeftColor: '#EF4444' },
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => handleControlPress(item)}
          >
            <View style={st.listCardRow}>
              <View style={[st.listIconCircle, { backgroundColor: typeColor + '15' }]}>
                <IconSymbol name="checkmark.shield.fill" size={16} color={typeColor} />
              </View>
              <View style={st.listCardInfo}>
                <View style={st.cardTopRow}>
                  <ThemedText style={[st.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <StatusBadge
                    label={EFFECTIVENESS_LABEL[item.effectiveness]}
                    color={effColor}
                  />
                </View>
                <View style={st.cardMetaRow}>
                  <StatusBadge label={CONTROL_TYPE_LABEL[item.type]} color={typeColor} />
                  <StatusBadge
                    label={`Test: ${TEST_RESULT_LABEL[item.testResult]}`}
                    color={testColor}
                  />
                  {item.canBlockRails && (
                    <View style={[st.blocksRailsBadge, { backgroundColor: '#EF4444' + '18' }]}>
                      <IconSymbol name="xmark.octagon.fill" size={10} color="#EF4444" />
                      <ThemedText style={[st.blocksRailsText, { color: '#EF4444' }]}>
                        Blocks Rails
                      </ThemedText>
                    </View>
                  )}
                </View>
                {item.canBlockRails && (
                  <View style={st.blockReleaseBadge}>
                    <IconSymbol name="exclamationmark.octagon.fill" size={12} color="#FFF" />
                    <ThemedText style={st.blockReleaseBadgeText}>
                      CAN BLOCK RELEASE
                    </ThemedText>
                  </View>
                )}
                <View style={st.cardStatsRow}>
                  <View style={st.cardStat}>
                    <IconSymbol name="clock" size={12} color={colors.textTertiary} />
                    <ThemedText style={[st.cardStatText, { color: colors.textSecondary }]}>
                      Tested {item.lastTested}
                    </ThemedText>
                  </View>
                  <View style={st.cardStat}>
                    <IconSymbol name="link" size={12} color={colors.textTertiary} />
                    <ThemedText style={[st.cardStatText, { color: colors.textSecondary }]}>
                      {item.linkedRiskIds.length} risk{item.linkedRiskIds.length !== 1 ? 's' : ''}
                    </ThemedText>
                  </View>
                </View>
                <View style={st.cardStatsRow}>
                  <View style={st.cardStat}>
                    <IconSymbol name="building.2" size={12} color={colors.textTertiary} />
                    <ThemedText style={[st.cardStatText, { color: colors.textSecondary }]}>
                      {item.entityName}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
        );
      }}
    />
  );

  // === Tab 5: Evidence ===
  const renderEvidence = () => (
    <FlatList<ComplianceEvidence>
      data={filteredEvidence}
      keyExtractor={(item) => item.id}
      contentContainerStyle={st.listContent}
      ListEmptyComponent={<EmptyState icon="paperclip" text="No evidence found" colors={colors} />}
      renderItem={({ item }) => {
        const typeColor = EVIDENCE_TYPE_COLOR[item.type];
        const reviewColor = EVIDENCE_REVIEW_COLOR[item.reviewStatus];
        return (
          <Pressable
            style={({ pressed }) => [
              st.listCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => handleEvidencePress(item)}
          >
            <View style={st.listCardRow}>
              <View style={[st.listIconCircle, { backgroundColor: typeColor + '15' }]}>
                <IconSymbol name="paperclip" size={16} color={typeColor} />
              </View>
              <View style={st.listCardInfo}>
                <View style={st.cardTopRow}>
                  <ThemedText style={[st.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </ThemedText>
                  <StatusBadge
                    label={EVIDENCE_REVIEW_LABEL[item.reviewStatus]}
                    color={reviewColor}
                  />
                </View>
                <View style={st.cardMetaRow}>
                  <StatusBadge label={EVIDENCE_TYPE_LABEL[item.type]} color={typeColor} />
                  <ThemedText style={[st.metaText, { color: colors.textTertiary }]}>
                    {item.controlName}
                  </ThemedText>
                </View>
                <View style={st.cardStatsRow}>
                  <View style={st.cardStat}>
                    <IconSymbol name="person" size={12} color={colors.textTertiary} />
                    <ThemedText style={[st.cardStatText, { color: colors.textSecondary }]}>
                      {item.uploadedBy}
                    </ThemedText>
                  </View>
                  <View style={st.cardStat}>
                    <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                    <ThemedText style={[st.cardStatText, { color: colors.textSecondary }]}>
                      {item.uploadDate}
                    </ThemedText>
                  </View>
                </View>
                <View style={st.cardStatsRow}>
                  <View style={st.cardStat}>
                    <IconSymbol name="building.2" size={12} color={colors.textTertiary} />
                    <ThemedText style={[st.cardStatText, { color: colors.textSecondary }]}>
                      {item.entityName}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
        );
      }}
    />
  );

  // === Tab 6: Audits ===
  const renderAudits = () => (
    <FlatList<ComplianceAudit>
      data={filteredAudits}
      keyExtractor={(item) => item.id}
      contentContainerStyle={st.listContent}
      ListEmptyComponent={<EmptyState icon="magnifyingglass.circle.fill" text="No audits found" colors={colors} />}
      renderItem={({ item }) => {
        const typeColor = AUDIT_TYPE_COLOR[item.type];
        const statusColor = AUDIT_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={({ pressed }) => [
              st.listCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => handleAuditPress(item)}
          >
            <View style={st.listCardRow}>
              <View style={[st.listIconCircle, { backgroundColor: typeColor + '15' }]}>
                <IconSymbol name="magnifyingglass.circle.fill" size={16} color={typeColor} />
              </View>
              <View style={st.listCardInfo}>
                <View style={st.cardTopRow}>
                  <ThemedText style={[st.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <StatusBadge
                    label={AUDIT_STATUS_LABEL[item.status]}
                    color={statusColor}
                  />
                </View>
                <View style={st.cardMetaRow}>
                  <StatusBadge label={AUDIT_TYPE_LABEL[item.type]} color={typeColor} />
                  {item.findings > 0 && (
                    <StatusBadge
                      label={`${item.findings} finding${item.findings !== 1 ? 's' : ''}`}
                      color="#EF4444"
                    />
                  )}
                </View>
                <View style={st.cardStatsRow}>
                  <View style={st.cardStat}>
                    <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                    <ThemedText style={[st.cardStatText, { color: colors.textSecondary }]}>
                      {item.scheduledDate}
                    </ThemedText>
                  </View>
                  {item.completedDate && (
                    <View style={st.cardStat}>
                      <IconSymbol name="checkmark.circle" size={12} color={colors.textTertiary} />
                      <ThemedText style={[st.cardStatText, { color: colors.textSecondary }]}>
                        Completed {item.completedDate}
                      </ThemedText>
                    </View>
                  )}
                </View>
                {item.remediationStatus && (
                  <View style={st.cardStatsRow}>
                    <View style={st.cardStat}>
                      <IconSymbol name="wrench.and.screwdriver" size={12} color={colors.textTertiary} />
                      <ThemedText style={[st.cardStatText, { color: colors.textSecondary }]}>
                        {item.remediationStatus}
                      </ThemedText>
                    </View>
                  </View>
                )}
                <View style={st.cardStatsRow}>
                  <View style={st.cardStat}>
                    <IconSymbol name="building.2" size={12} color={colors.textTertiary} />
                    <ThemedText style={[st.cardStatText, { color: colors.textSecondary }]}>
                      {item.entityName}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
        );
      }}
    />
  );

  // === Tab 7: Incidents ===
  const renderIncidents = () => (
    <View style={{ flex: 1 }}>
      <View style={st.immutabilityNote}>
        <IconSymbol name="lock.fill" size={12} color={BP.ash} />
        <ThemedText style={st.immutabilityNoteText}>
          Closed incidents are append-only and cannot be modified
        </ThemedText>
      </View>
    <FlatList<ComplianceIncident>
      data={filteredIncidents}
      keyExtractor={(item) => item.id}
      contentContainerStyle={st.listContent}
      ListEmptyComponent={
        <EmptyState icon="exclamationmark.triangle.fill" text="No incidents found" colors={colors} />
      }
      renderItem={({ item }) => {
        const severityColor = INCIDENT_SEVERITY_COLOR[item.severity];
        const statusColor = INCIDENT_STATUS_COLOR[item.status];
        const isClosed = item.status === 'closed';
        return (
          <Pressable
            style={({ pressed }) => [
              st.listCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => handleIncidentPress(item)}
          >
            <View style={st.listCardRow}>
              <View
                style={[
                  st.severityStrip,
                  { backgroundColor: severityColor + '20' },
                ]}
              >
                <ThemedText
                  style={[st.severityStripText, { color: severityColor }]}
                >
                  {item.severity.toUpperCase().slice(0, 4)}
                </ThemedText>
              </View>
              <View style={st.listCardInfo}>
                <View style={st.cardTopRow}>
                  <ThemedText style={[st.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </ThemedText>
                  <StatusBadge
                    label={INCIDENT_STATUS_LABEL[item.status]}
                    color={statusColor}
                  />
                </View>
                <ThemedText
                  style={[st.descriptionPreview, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {item.description}
                </ThemedText>
                <View style={st.cardMetaRow}>
                  <StatusBadge label={item.severity} color={severityColor} />
                  <View style={[st.badge, { backgroundColor: colors.backgroundTertiary }]}>
                    <ThemedText style={[st.badgeText, { color: colors.textSecondary }]}>
                      {item.linkedControlIds.length} control{item.linkedControlIds.length !== 1 ? 's' : ''}
                    </ThemedText>
                  </View>
                  <View style={[st.badge, { backgroundColor: colors.backgroundTertiary }]}>
                    <ThemedText style={[st.badgeText, { color: colors.textSecondary }]}>
                      {item.linkedRiskIds.length} risk{item.linkedRiskIds.length !== 1 ? 's' : ''}
                    </ThemedText>
                  </View>
                  {isClosed && item.immutableOnceClosed && (
                    <View style={[st.immutableBadge, { backgroundColor: '#A1A1AA' + '20' }]}>
                      <IconSymbol name="lock.fill" size={10} color="#A1A1AA" />
                      <ThemedText style={[st.immutableText, { color: '#A1A1AA' }]}>
                        IMMUTABLE
                      </ThemedText>
                    </View>
                  )}
                </View>
                <View style={st.cardStatsRow}>
                  <View style={st.cardStat}>
                    <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                    <ThemedText style={[st.cardStatText, { color: colors.textSecondary }]}>
                      Reported {item.reportedDate}
                    </ThemedText>
                  </View>
                  {item.resolvedDate && (
                    <View style={st.cardStat}>
                      <IconSymbol name="checkmark.circle" size={12} color={colors.textTertiary} />
                      <ThemedText style={[st.cardStatText, { color: colors.textSecondary }]}>
                        Resolved {item.resolvedDate}
                      </ThemedText>
                    </View>
                  )}
                </View>
                <View style={st.cardStatsRow}>
                  <View style={st.cardStat}>
                    <IconSymbol name="building.2" size={12} color={colors.textTertiary} />
                    <ThemedText style={[st.cardStatText, { color: colors.textSecondary }]}>
                      {item.entityName}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
        );
      }}
    />
    </View>
  );

  // === Tab 8: Exceptions ===
  const renderExceptions = () => (
    <FlatList<ComplianceException>
      data={filteredExceptions}
      keyExtractor={(item) => item.id}
      contentContainerStyle={st.listContent}
      ListEmptyComponent={
        <EmptyState icon="doc.badge.gearshape" text="No exceptions found" colors={colors} />
      }
      renderItem={({ item }) => {
        const statusColor = EXCEPTION_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={({ pressed }) => [
              st.listCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => handleExceptionPress(item)}
          >
            <View style={st.listCardRow}>
              <View style={[st.listIconCircle, { backgroundColor: statusColor + '15' }]}>
                <IconSymbol name="doc.badge.gearshape" size={16} color={statusColor} />
              </View>
              <View style={st.listCardInfo}>
                <View style={st.cardTopRow}>
                  <ThemedText style={[st.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </ThemedText>
                  <StatusBadge
                    label={EXCEPTION_STATUS_LABEL[item.status]}
                    color={statusColor}
                  />
                </View>
                <View style={st.cardMetaRow}>
                  <View style={[st.badge, { backgroundColor: accentColor + '18' }]}>
                    <ThemedText style={[st.badgeText, { color: accentColor }]}>
                      {item.policyName}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText
                  style={[st.descriptionPreview, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {item.justification}
                </ThemedText>
                <View style={st.cardStatsRow}>
                  <View style={st.cardStat}>
                    <IconSymbol name="person" size={12} color={colors.textTertiary} />
                    <ThemedText style={[st.cardStatText, { color: colors.textSecondary }]}>
                      {item.approvedBy}
                    </ThemedText>
                  </View>
                </View>
                <View style={st.cardStatsRow}>
                  <View style={st.cardStat}>
                    <IconSymbol name="clock" size={12} color={colors.textTertiary} />
                    <ThemedText
                      style={[
                        st.cardStatText,
                        {
                          color: item.status === 'expired' ? '#A1A1AA' : colors.textSecondary,
                        },
                      ]}
                    >
                      Expires {item.expiryDate}
                    </ThemedText>
                  </View>
                  <View style={st.cardStat}>
                    <IconSymbol name="building.2" size={12} color={colors.textTertiary} />
                    <ThemedText style={[st.cardStatText, { color: colors.textSecondary }]}>
                      {item.entityName}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
        );
      }}
    />
  );

  // === Tab 9: Exports ===
  const renderExports = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={st.tabScroll}
    >
      <ThemedText style={[st.sectionHeader, { color: colors.text }]}>
        Export Options
      </ThemedText>
      <ThemedText style={[st.exportSubtext, { color: colors.textSecondary }]}>
        Generate and download compliance reports in your preferred format.
      </ThemedText>

      {data.exportOptions.map((opt) => {
        const formatColor = EXPORT_FORMAT_COLOR[opt.format];
        return (
          <Pressable
            key={opt.id}
            style={({ pressed }) => [
              st.exportCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => handleExportPress(opt)}
          >
            <View style={st.listCardRow}>
              <View style={[st.listIconCircle, { backgroundColor: formatColor + '15' }]}>
                <IconSymbol name={opt.icon as any} size={16} color={formatColor} />
              </View>
              <View style={st.listCardInfo}>
                <View style={st.cardTopRow}>
                  <ThemedText style={[st.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                    {opt.label}
                  </ThemedText>
                  <StatusBadge label={opt.format} color={formatColor} />
                </View>
                <ThemedText
                  style={[st.descriptionPreview, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {opt.description}
                </ThemedText>
              </View>
              <View style={st.exportArrow}>
                <IconSymbol name="square.and.arrow.up" size={16} color={accentColor} />
              </View>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  // ===================================================================
  // RENDER — MAIN
  // ===================================================================

  return (
    <View style={st.container}>
      {/* === Header === */}
      <View style={st.header}>
        <View style={st.headerTop}>
          <ThemedText style={[st.headerTitle, { color: colors.text }]}>Compliance</ThemedText>
          <Pressable
            style={({ pressed }) => [
              st.createBtn,
              { backgroundColor: accentColor },
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <IconSymbol name="plus" size={14} color="#000" />
            <ThemedText style={st.createBtnText}>New Entry</ThemedText>
          </Pressable>
        </View>

        {/* Search bar — hidden for Overview and Exports */}
        {activeTab !== 'overview' && activeTab !== 'exports' && (
          <View style={[st.searchBar, { backgroundColor: colors.backgroundTertiary }]}>
            <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
            <TextInput
              style={[st.searchInput, { color: colors.text }]}
              placeholder="Search compliance..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* === Sub-Tab Bar === */}
      <View style={st.subTabContainer}>
        <BizSubTabBar
          tabs={visibleSubTabs}
          activeId={activeTab}
          onSelect={handleTabSelect}
        />
      </View>

      {/* === Tab Content === */}
      <View style={st.contentArea}>{renderTabContent()}</View>

      {/* ================================================================= */}
      {/* BOTTOM SHEETS                                                      */}
      {/* ================================================================= */}

      {/* === Policy Detail === */}
      <BottomSheet
        visible={policyDetailVisible}
        onClose={() => setPolicyDetailVisible(false)}
        title={selectedPolicy?.name ?? 'Policy Detail'}
        useModal
      >
        {selectedPolicy && (
          <View style={st.detailSheet}>
            <View
              style={[
                st.detailIconLarge,
                { backgroundColor: POLICY_CATEGORY_COLOR[selectedPolicy.category] + '25' },
              ]}
            >
              <IconSymbol
                name="doc.text.fill"
                size={28}
                color={POLICY_CATEGORY_COLOR[selectedPolicy.category]}
              />
            </View>
            <ThemedText style={[st.detailName, { color: colors.text }]}>
              {selectedPolicy.name}
            </ThemedText>
            <StatusBadge
              label={POLICY_STATUS_LABEL[selectedPolicy.status]}
              color={POLICY_STATUS_COLOR[selectedPolicy.status]}
            />

            <View style={[st.detailDivider, { backgroundColor: colors.divider }]} />

            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Category</ThemedText>
              <StatusBadge
                label={POLICY_CATEGORY_LABEL[selectedPolicy.category]}
                color={POLICY_CATEGORY_COLOR[selectedPolicy.category]}
              />
            </View>
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Version</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text }]}>v{selectedPolicy.version}</ThemedText>
            </View>
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Effective Date</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text }]}>{selectedPolicy.effectiveDate}</ThemedText>
            </View>
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Review Cycle</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text }]}>{selectedPolicy.reviewCycle}</ThemedText>
            </View>
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Owner</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text }]}>{selectedPolicy.owner}</ThemedText>
            </View>
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Entity</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text }]}>{selectedPolicy.entityName}</ThemedText>
            </View>

            <View style={st.detailActions}>
              <Pressable
                style={({ pressed }) => [
                  st.detailActionBtn,
                  { backgroundColor: accentColor + '15' },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="doc.text" size={16} color={accentColor} />
                <ThemedText style={[st.detailActionText, { color: accentColor }]}>View Policy</ThemedText>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  st.detailActionBtn,
                  { backgroundColor: accentColor + '15' },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="pencil" size={16} color={accentColor} />
                <ThemedText style={[st.detailActionText, { color: accentColor }]}>Edit</ThemedText>
              </Pressable>
            </View>
          </View>
        )}
      </BottomSheet>

      {/* === Risk Detail === */}
      <BottomSheet
        visible={riskDetailVisible}
        onClose={() => setRiskDetailVisible(false)}
        title={selectedRisk?.title ?? 'Risk Detail'}
        useModal
      >
        {selectedRisk && (
          <View style={st.detailSheet}>
            <View
              style={[
                st.detailIconLarge,
                { backgroundColor: MITIGATION_STATUS_COLOR[selectedRisk.mitigationStatus] + '25' },
              ]}
            >
              <IconSymbol
                name="shield.lefthalf.filled"
                size={28}
                color={MITIGATION_STATUS_COLOR[selectedRisk.mitigationStatus]}
              />
            </View>
            <ThemedText style={[st.detailName, { color: colors.text }]}>
              {selectedRisk.title}
            </ThemedText>
            <StatusBadge
              label={MITIGATION_STATUS_LABEL[selectedRisk.mitigationStatus]}
              color={MITIGATION_STATUS_COLOR[selectedRisk.mitigationStatus]}
            />

            <View style={[st.detailDivider, { backgroundColor: colors.divider }]} />

            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Likelihood</ThemedText>
              <StatusBadge label={selectedRisk.likelihood} color={RISK_LIKELIHOOD_COLOR[selectedRisk.likelihood]} />
            </View>
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Impact</ThemedText>
              <StatusBadge label={selectedRisk.impact} color={RISK_IMPACT_COLOR[selectedRisk.impact]} />
            </View>
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Owner</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text }]}>{selectedRisk.owner}</ThemedText>
            </View>
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Entity</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text }]}>{selectedRisk.entityName}</ThemedText>
            </View>
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Linked Controls</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text }]}>
                {selectedRisk.linkedControlIds.length}
              </ThemedText>
            </View>

            <View style={[st.detailDivider, { backgroundColor: colors.divider }]} />

            <View style={st.detailEvidenceSection}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Description</ThemedText>
              <ThemedText style={[st.detailEvidenceText, { color: colors.text }]}>
                {selectedRisk.description}
              </ThemedText>
            </View>

            <View style={st.detailActions}>
              <Pressable
                style={({ pressed }) => [
                  st.detailActionBtn,
                  { backgroundColor: accentColor + '15' },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="doc.text" size={16} color={accentColor} />
                <ThemedText style={[st.detailActionText, { color: accentColor }]}>Details</ThemedText>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  st.detailActionBtn,
                  { backgroundColor: accentColor + '15' },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="pencil" size={16} color={accentColor} />
                <ThemedText style={[st.detailActionText, { color: accentColor }]}>Edit</ThemedText>
              </Pressable>
            </View>
          </View>
        )}
      </BottomSheet>

      {/* === Control Detail === */}
      <BottomSheet
        visible={controlDetailVisible}
        onClose={() => setControlDetailVisible(false)}
        title={selectedControl?.name ?? 'Control Detail'}
        useModal
      >
        {selectedControl && (
          <View style={st.detailSheet}>
            <View
              style={[
                st.detailIconLarge,
                { backgroundColor: CONTROL_TYPE_COLOR[selectedControl.type] + '25' },
              ]}
            >
              <IconSymbol
                name="checkmark.shield.fill"
                size={28}
                color={CONTROL_TYPE_COLOR[selectedControl.type]}
              />
            </View>
            <ThemedText style={[st.detailName, { color: colors.text }]}>
              {selectedControl.name}
            </ThemedText>
            <View style={st.detailBadgeRow}>
              <StatusBadge
                label={CONTROL_TYPE_LABEL[selectedControl.type]}
                color={CONTROL_TYPE_COLOR[selectedControl.type]}
              />
              <StatusBadge
                label={EFFECTIVENESS_LABEL[selectedControl.effectiveness]}
                color={EFFECTIVENESS_COLOR[selectedControl.effectiveness]}
              />
            </View>

            {selectedControl.canBlockRails && (
              <View style={[st.railsWarning, { backgroundColor: '#EF4444' + '12' }]}>
                <IconSymbol name="xmark.octagon.fill" size={14} color="#EF4444" />
                <ThemedText style={[st.railsWarningText, { color: '#EF4444' }]}>
                  This control can BLOCK Payment Rails release if it fails
                </ThemedText>
              </View>
            )}

            <View style={[st.detailDivider, { backgroundColor: colors.divider }]} />

            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Last Tested</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text }]}>{selectedControl.lastTested}</ThemedText>
            </View>
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Test Result</ThemedText>
              <StatusBadge
                label={TEST_RESULT_LABEL[selectedControl.testResult]}
                color={TEST_RESULT_COLOR[selectedControl.testResult]}
              />
            </View>
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Linked Risks</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text }]}>
                {selectedControl.linkedRiskIds.length}
              </ThemedText>
            </View>
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Entity</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text }]}>{selectedControl.entityName}</ThemedText>
            </View>

            <View style={[st.detailDivider, { backgroundColor: colors.divider }]} />

            <View style={st.detailEvidenceSection}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Description</ThemedText>
              <ThemedText style={[st.detailEvidenceText, { color: colors.text }]}>
                {selectedControl.description}
              </ThemedText>
            </View>

            <View style={st.detailActions}>
              <Pressable
                style={({ pressed }) => [
                  st.detailActionBtn,
                  { backgroundColor: accentColor + '15' },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="doc.text" size={16} color={accentColor} />
                <ThemedText style={[st.detailActionText, { color: accentColor }]}>Evidence</ThemedText>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  st.detailActionBtn,
                  { backgroundColor: accentColor + '15' },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="pencil" size={16} color={accentColor} />
                <ThemedText style={[st.detailActionText, { color: accentColor }]}>Edit</ThemedText>
              </Pressable>
            </View>
          </View>
        )}
      </BottomSheet>

      {/* === Evidence Detail === */}
      <BottomSheet
        visible={evidenceDetailVisible}
        onClose={() => setEvidenceDetailVisible(false)}
        title={selectedEvidence?.title ?? 'Evidence Detail'}
        useModal
      >
        {selectedEvidence && (
          <View style={st.detailSheet}>
            <View
              style={[
                st.detailIconLarge,
                { backgroundColor: EVIDENCE_TYPE_COLOR[selectedEvidence.type] + '25' },
              ]}
            >
              <IconSymbol
                name="paperclip"
                size={28}
                color={EVIDENCE_TYPE_COLOR[selectedEvidence.type]}
              />
            </View>
            <ThemedText style={[st.detailName, { color: colors.text }]}>
              {selectedEvidence.title}
            </ThemedText>
            <View style={st.detailBadgeRow}>
              <StatusBadge
                label={EVIDENCE_TYPE_LABEL[selectedEvidence.type]}
                color={EVIDENCE_TYPE_COLOR[selectedEvidence.type]}
              />
              <StatusBadge
                label={EVIDENCE_REVIEW_LABEL[selectedEvidence.reviewStatus]}
                color={EVIDENCE_REVIEW_COLOR[selectedEvidence.reviewStatus]}
              />
            </View>

            <View style={[st.detailDivider, { backgroundColor: colors.divider }]} />

            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Linked Control</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text, flex: 1, textAlign: 'right' }]} numberOfLines={1}>
                {selectedEvidence.controlName}
              </ThemedText>
            </View>
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Uploaded By</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text }]}>{selectedEvidence.uploadedBy}</ThemedText>
            </View>
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Upload Date</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text }]}>{selectedEvidence.uploadDate}</ThemedText>
            </View>
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Entity</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text }]}>{selectedEvidence.entityName}</ThemedText>
            </View>

            <View style={st.detailActions}>
              <Pressable
                style={({ pressed }) => [
                  st.detailActionBtn,
                  { backgroundColor: accentColor + '15' },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="eye" size={16} color={accentColor} />
                <ThemedText style={[st.detailActionText, { color: accentColor }]}>View</ThemedText>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  st.detailActionBtn,
                  { backgroundColor: '#22C55E' + '15' },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="checkmark.circle" size={16} color="#22C55E" />
                <ThemedText style={[st.detailActionText, { color: '#22C55E' }]}>Accept</ThemedText>
              </Pressable>
            </View>
          </View>
        )}
      </BottomSheet>

      {/* === Audit Detail === */}
      <BottomSheet
        visible={auditDetailVisible}
        onClose={() => setAuditDetailVisible(false)}
        title={selectedAudit?.name ?? 'Audit Detail'}
        useModal
      >
        {selectedAudit && (
          <View style={st.detailSheet}>
            <View
              style={[
                st.detailIconLarge,
                { backgroundColor: AUDIT_TYPE_COLOR[selectedAudit.type] + '25' },
              ]}
            >
              <IconSymbol
                name="magnifyingglass.circle.fill"
                size={28}
                color={AUDIT_TYPE_COLOR[selectedAudit.type]}
              />
            </View>
            <ThemedText style={[st.detailName, { color: colors.text }]}>
              {selectedAudit.name}
            </ThemedText>
            <View style={st.detailBadgeRow}>
              <StatusBadge
                label={AUDIT_TYPE_LABEL[selectedAudit.type]}
                color={AUDIT_TYPE_COLOR[selectedAudit.type]}
              />
              <StatusBadge
                label={AUDIT_STATUS_LABEL[selectedAudit.status]}
                color={AUDIT_STATUS_COLOR[selectedAudit.status]}
              />
            </View>

            <View style={[st.detailDivider, { backgroundColor: colors.divider }]} />

            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Scheduled Date</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text }]}>{selectedAudit.scheduledDate}</ThemedText>
            </View>
            {selectedAudit.completedDate && (
              <View style={st.detailRow}>
                <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Completed Date</ThemedText>
                <ThemedText style={[st.detailValue, { color: colors.text }]}>{selectedAudit.completedDate}</ThemedText>
              </View>
            )}
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Findings</ThemedText>
              <ThemedText
                style={[
                  st.detailValue,
                  {
                    color: selectedAudit.findings > 0 ? '#EF4444' : '#22C55E',
                    fontVariant: ['tabular-nums'],
                  },
                ]}
              >
                {selectedAudit.findings}
              </ThemedText>
            </View>
            {selectedAudit.remediationStatus && (
              <View style={st.detailRow}>
                <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Remediation</ThemedText>
                <ThemedText style={[st.detailValue, { color: colors.text, flex: 1, textAlign: 'right' }]} numberOfLines={2}>
                  {selectedAudit.remediationStatus}
                </ThemedText>
              </View>
            )}
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Entity</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text }]}>{selectedAudit.entityName}</ThemedText>
            </View>

            <View style={st.detailActions}>
              <Pressable
                style={({ pressed }) => [
                  st.detailActionBtn,
                  { backgroundColor: accentColor + '15' },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="doc.text" size={16} color={accentColor} />
                <ThemedText style={[st.detailActionText, { color: accentColor }]}>Report</ThemedText>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  st.detailActionBtn,
                  { backgroundColor: accentColor + '15' },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="pencil" size={16} color={accentColor} />
                <ThemedText style={[st.detailActionText, { color: accentColor }]}>Edit</ThemedText>
              </Pressable>
            </View>
          </View>
        )}
      </BottomSheet>

      {/* === Incident Detail === */}
      <BottomSheet
        visible={incidentDetailVisible}
        onClose={() => setIncidentDetailVisible(false)}
        title={selectedIncident?.title ?? 'Incident Detail'}
        useModal
      >
        {selectedIncident && (
          <View style={st.detailSheet}>
            <View
              style={[
                st.detailIconLarge,
                { backgroundColor: INCIDENT_SEVERITY_COLOR[selectedIncident.severity] + '25' },
              ]}
            >
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={28}
                color={INCIDENT_SEVERITY_COLOR[selectedIncident.severity]}
              />
            </View>
            <ThemedText style={[st.detailName, { color: colors.text }]}>
              {selectedIncident.title}
            </ThemedText>
            <View style={st.detailBadgeRow}>
              <StatusBadge
                label={selectedIncident.severity}
                color={INCIDENT_SEVERITY_COLOR[selectedIncident.severity]}
              />
              <StatusBadge
                label={INCIDENT_STATUS_LABEL[selectedIncident.status]}
                color={INCIDENT_STATUS_COLOR[selectedIncident.status]}
              />
              {selectedIncident.status === 'closed' && selectedIncident.immutableOnceClosed && (
                <View style={[st.immutableBadge, { backgroundColor: '#A1A1AA' + '20' }]}>
                  <IconSymbol name="lock.fill" size={10} color="#A1A1AA" />
                  <ThemedText style={[st.immutableText, { color: '#A1A1AA' }]}>IMMUTABLE</ThemedText>
                </View>
              )}
            </View>

            <View style={[st.detailDivider, { backgroundColor: colors.divider }]} />

            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Reported</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text }]}>{selectedIncident.reportedDate}</ThemedText>
            </View>
            {selectedIncident.resolvedDate && (
              <View style={st.detailRow}>
                <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Resolved</ThemedText>
                <ThemedText style={[st.detailValue, { color: colors.text }]}>{selectedIncident.resolvedDate}</ThemedText>
              </View>
            )}
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Linked Controls</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text }]}>
                {selectedIncident.linkedControlIds.length}
              </ThemedText>
            </View>
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Linked Risks</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text }]}>
                {selectedIncident.linkedRiskIds.length}
              </ThemedText>
            </View>
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Entity</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text }]}>{selectedIncident.entityName}</ThemedText>
            </View>

            <View style={[st.detailDivider, { backgroundColor: colors.divider }]} />

            <View style={st.detailEvidenceSection}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Description</ThemedText>
              <ThemedText style={[st.detailEvidenceText, { color: colors.text }]}>
                {selectedIncident.description}
              </ThemedText>
            </View>

            <View style={st.detailActions}>
              <Pressable
                style={({ pressed }) => [
                  st.detailActionBtn,
                  { backgroundColor: accentColor + '15' },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="doc.text" size={16} color={accentColor} />
                <ThemedText style={[st.detailActionText, { color: accentColor }]}>Timeline</ThemedText>
              </Pressable>
              {selectedIncident.status !== 'closed' && selectedIncident.status !== 'resolved' && (
                <Pressable
                  style={({ pressed }) => [
                    st.detailActionBtn,
                    { backgroundColor: '#22C55E' + '15' },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <IconSymbol name="checkmark.circle" size={16} color="#22C55E" />
                  <ThemedText style={[st.detailActionText, { color: '#22C55E' }]}>Resolve</ThemedText>
                </Pressable>
              )}
            </View>
          </View>
        )}
      </BottomSheet>

      {/* === Exception Detail === */}
      <BottomSheet
        visible={exceptionDetailVisible}
        onClose={() => setExceptionDetailVisible(false)}
        title={selectedException?.title ?? 'Exception Detail'}
        useModal
      >
        {selectedException && (
          <View style={st.detailSheet}>
            <View
              style={[
                st.detailIconLarge,
                { backgroundColor: EXCEPTION_STATUS_COLOR[selectedException.status] + '25' },
              ]}
            >
              <IconSymbol
                name="doc.badge.gearshape"
                size={28}
                color={EXCEPTION_STATUS_COLOR[selectedException.status]}
              />
            </View>
            <ThemedText style={[st.detailName, { color: colors.text }]}>
              {selectedException.title}
            </ThemedText>
            <StatusBadge
              label={EXCEPTION_STATUS_LABEL[selectedException.status]}
              color={EXCEPTION_STATUS_COLOR[selectedException.status]}
            />

            <View style={[st.detailDivider, { backgroundColor: colors.divider }]} />

            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Policy</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text, flex: 1, textAlign: 'right' }]} numberOfLines={2}>
                {selectedException.policyName}
              </ThemedText>
            </View>
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Approved By</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text, flex: 1, textAlign: 'right' }]} numberOfLines={2}>
                {selectedException.approvedBy}
              </ThemedText>
            </View>
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Expiry Date</ThemedText>
              <ThemedText
                style={[
                  st.detailValue,
                  {
                    color: selectedException.status === 'expired' ? '#A1A1AA' : colors.text,
                  },
                ]}
              >
                {selectedException.expiryDate}
              </ThemedText>
            </View>
            <View style={st.detailRow}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Entity</ThemedText>
              <ThemedText style={[st.detailValue, { color: colors.text }]}>{selectedException.entityName}</ThemedText>
            </View>

            <View style={[st.detailDivider, { backgroundColor: colors.divider }]} />

            <View style={st.detailEvidenceSection}>
              <ThemedText style={[st.detailLabel, { color: colors.textSecondary }]}>Justification</ThemedText>
              <ThemedText style={[st.detailEvidenceText, { color: colors.text }]}>
                {selectedException.justification}
              </ThemedText>
            </View>

            <View style={st.detailActions}>
              <Pressable
                style={({ pressed }) => [
                  st.detailActionBtn,
                  { backgroundColor: accentColor + '15' },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="doc.text" size={16} color={accentColor} />
                <ThemedText style={[st.detailActionText, { color: accentColor }]}>View Policy</ThemedText>
              </Pressable>
              {selectedException.status === 'active' && (
                <Pressable
                  style={({ pressed }) => [
                    st.detailActionBtn,
                    { backgroundColor: '#EF4444' + '15' },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <IconSymbol name="xmark.circle" size={16} color="#EF4444" />
                  <ThemedText style={[st.detailActionText, { color: '#EF4444' }]}>Revoke</ThemedText>
                </Pressable>
              )}
            </View>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function getActivityColor(type: ComplianceActivity['type']): string {
  switch (type) {
    case 'incident':
      return '#EF4444';
    case 'risk':
      return '#F59E0B';
    case 'control':
      return '#1D9BF0';
    case 'audit':
      return '#1D9BF0';
    case 'evidence':
      return '#22C55E';
    case 'policy':
      return '#1D9BF0';
    case 'exception':
      return '#F59E0B';
    default:
      return '#A1A1AA';
  }
}

// =============================================================================
// STYLES
// =============================================================================

const st = StyleSheet.create({
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
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  createBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
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

  // === Sub-Tab Container ===
  subTabContainer: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },

  // === Content Area ===
  contentArea: {
    flex: 1,
  },
  tabScroll: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },

  // === Filter Chips ===
  filterChipsContainer: {
    flexGrow: 0,
    marginBottom: Spacing.sm,
  },
  filterChipsRow: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // === Overview: Score Card ===
  scoreCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  scoreDetails: {
    flex: 1,
    gap: Spacing.xs,
  },
  scoreDetailLabel: {
    fontSize: 12,
    lineHeight: 17,
  },
  scoreMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  scoreTrendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  scoreTrendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  circularScoreValue: {
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  circularScoreLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: -4,
  },

  // === Overview: Stats Grid ===
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'flex-start',
    gap: 4,
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // === Overview: Recent Activity ===
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  activityCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  activityTextCol: {
    flex: 1,
    gap: 2,
  },
  activityText: {
    fontSize: 13,
    lineHeight: 18,
  },
  activityTime: {
    fontSize: 11,
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
  listIconCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
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

  // === Card Rows ===
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  cardStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: 4,
  },
  cardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardStatText: {
    fontSize: 12,
  },
  metaText: {
    fontSize: 11,
  },

  // === Description Preview ===
  descriptionPreview: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },

  // === Risk Register: Matrix Badge ===
  matrixBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  matrixDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  matrixText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // === Controls: Blocks Rails Badge ===
  blocksRailsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  blocksRailsText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // === Incidents: Severity Strip ===
  severityStrip: {
    width: 48,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityStripText: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },

  // === Incidents: Immutable Badge ===
  immutableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  immutableText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // === Exports ===
  exportCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  exportArrow: {
    alignSelf: 'center',
    marginLeft: Spacing.sm,
  },
  exportSubtext: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
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

  // === Detail Bottom Sheet ===
  detailSheet: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  detailIconLarge: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailName: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
  },
  detailBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  detailDivider: {
    height: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginVertical: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  detailActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
  },
  detailActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailEvidenceSection: {
    alignSelf: 'stretch',
    gap: 4,
  },
  detailEvidenceText: {
    fontSize: 13,
    lineHeight: 19,
  },

  // === Control Detail: Rails Warning ===
  railsWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    alignSelf: 'stretch',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  railsWarningText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },

  // === Payment Rails Readiness ===
  readinessCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  readinessTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  readinessScoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readinessScoreText: {
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  readinessItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 5,
  },
  readinessDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  readinessItemLabel: {
    flex: 1,
    fontSize: 13,
  },
  readinessItemStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  readinessDeepLink: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },

  // === Next 5 Actions ===
  next5Card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  nextActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
    paddingLeft: Spacing.sm,
    borderLeftWidth: 3,
    marginBottom: 2,
  },
  nextActionNumber: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    width: 18,
    textAlign: 'center',
  },
  nextActionLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  nextActionDue: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },

  // === Attestation ===
  attestationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2F3336',
  },
  attestationLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  attestationBarBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  attestationBarFill: {
    height: 4,
    borderRadius: 2,
  },

  // === Block Release Badge ===
  blockReleaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  blockReleaseBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#FFFFFF',
  },

  // === Immutability Note ===
  immutabilityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  immutabilityNoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: BP.ash,
  },
});
