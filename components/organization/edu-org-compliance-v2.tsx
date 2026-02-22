/**
 * Education Organization Compliance v2 — 10-view sub-tab hub.
 * Sub-tabs: Overview | Policies | Controls | Evidence | Risk Register | Audits | Findings | Incidents | Exceptions | Exports
 * RBAC: E1/E2 full 10-tab, E3 limited (Overview + Policies + Controls + Evidence submit), E4/E5 locked.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import type { EducationRoleLens } from '@/utils/education-rbac';
import { isDeanLevel, isFacultyLevel } from '@/utils/education-rbac';
import {
  getEduComplianceData,
  POLICY_STATUS_LABELS,
  POLICY_STATUS_COLORS,
  POLICY_CATEGORY_LABELS,
  POLICY_CATEGORY_ICONS,
  CONTROL_FREQUENCY_LABELS,
  CONTROL_STATUS_LABELS,
  CONTROL_STATUS_COLORS,
  EVIDENCE_TYPE_LABELS,
  EVIDENCE_STATUS_LABELS,
  EVIDENCE_STATUS_COLORS,
  RISK_CATEGORY_LABELS,
  RISK_SEVERITY_COLORS,
  RISK_SEVERITY_LABELS,
  AUDIT_STATUS_LABELS,
  AUDIT_STATUS_COLORS,
  FINDING_SEVERITY_LABELS,
  FINDING_SEVERITY_COLORS,
  FINDING_STATUS_LABELS,
  FINDING_STATUS_COLORS,
  INCIDENT_TYPE_LABELS,
  INCIDENT_STATUS_LABELS,
  INCIDENT_STATUS_COLORS,
  EXCEPTION_STATUS_LABELS,
  EXCEPTION_STATUS_COLORS,
  COMPLIANCE_STATUS_COLORS,
  COMPLIANCE_DOMAIN_LABELS,
  EXPORT_PACKET_TYPE_LABELS,
  EXPORT_PACKET_TYPE_ICONS,
} from '@/data/mock-edu-org-compliance';
import type {
  CompliancePolicy,
  ComplianceControl,
  EvidenceItem,
  RiskRegisterItem,
  AuditRun,
  AuditFinding,
  ComplianceIncident,
  ComplianceException,
  ExportPacket,
} from '@/data/mock-edu-org-compliance';

// =============================================================================
// CONSTANTS
// =============================================================================


const ACCENT = MODE_ACCENT.education;
const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'policies', label: 'Policies' },
  { id: 'controls', label: 'Controls' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'risk-register', label: 'Risk Register' },
  { id: 'audits', label: 'Audits' },
  { id: 'findings', label: 'Findings' },
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
  role?: EducationRoleLens;
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
  data: ReturnType<typeof getEduComplianceData>;
}) {
  const { posture, topRisks, financeIntegrity, controls, policies } = data;

  // Posture KPIs
  const postureColor = COMPLIANCE_STATUS_COLORS[posture.status];

  // Control status strip
  const onTrackCount = controls.filter((c) => c.status === 'on_track').length;
  const atRiskCount = controls.filter((c) => c.status === 'at_risk').length;
  const failedCount = controls.filter((c) => c.status === 'failed').length;

  // Quick action buttons
  const quickActions = [
    { id: 'qa-1', label: 'Run Audit', icon: 'magnifyingglass.circle.fill' },
    { id: 'qa-2', label: 'Upload Evidence', icon: 'arrow.up.doc.fill' },
    { id: 'qa-3', label: 'File Incident', icon: 'exclamationmark.triangle.fill' },
    { id: 'qa-4', label: 'Export Report', icon: 'arrow.down.doc.fill' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Posture Card */}
      <View style={[s.postureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.postureHeader}>
          <View style={[s.postureDot, { backgroundColor: postureColor }]} />
          <ThemedText style={[s.postureTitle, { color: colors.text }]}>Compliance Posture</ThemedText>
          <StatusBadge label={posture.status.toUpperCase()} color={postureColor} />
        </View>
        <View style={s.postureKpiGrid}>
          <View style={s.postureKpiItem}>
            <ThemedText style={[s.postureKpiValue, { color: posture.criticalRisks > 0 ? '#EF4444' : '#22C55E' }]}>
              {posture.criticalRisks}
            </ThemedText>
            <ThemedText style={[s.postureKpiLabel, { color: colors.textSecondary }]}>Critical Risks</ThemedText>
          </View>
          <View style={s.postureKpiItem}>
            <ThemedText style={[s.postureKpiValue, { color: posture.openIncidents > 0 ? '#F59E0B' : '#22C55E' }]}>
              {posture.openIncidents}
            </ThemedText>
            <ThemedText style={[s.postureKpiLabel, { color: colors.textSecondary }]}>Open Incidents</ThemedText>
          </View>
          <View style={s.postureKpiItem}>
            <ThemedText style={[s.postureKpiValue, { color: posture.openFindings > 0 ? '#F59E0B' : '#22C55E' }]}>
              {posture.openFindings}
            </ThemedText>
            <ThemedText style={[s.postureKpiLabel, { color: colors.textSecondary }]}>Open Findings</ThemedText>
          </View>
          <View style={s.postureKpiItem}>
            <ThemedText style={[s.postureKpiValue, { color: posture.activeExceptions > 0 ? ACCENT : '#22C55E' }]}>
              {posture.activeExceptions}
            </ThemedText>
            <ThemedText style={[s.postureKpiLabel, { color: colors.textSecondary }]}>Active Exceptions</ThemedText>
          </View>
        </View>
        <View style={s.postureProgressRow}>
          <View style={s.postureProgressLabel}>
            <IconSymbol name="checkmark.shield.fill" size={14} color={accentColor} />
            <ThemedText style={[s.postureProgressText, { color: colors.text }]}>Evidence Completeness</ThemedText>
            <ThemedText style={[s.postureProgressPercent, { color: accentColor }]}>{posture.evidenceCompleteness}%</ThemedText>
          </View>
          <ProgressBar percent={posture.evidenceCompleteness} color={accentColor} />
        </View>
      </View>

      {/* Control Status Strip */}
      <View style={[s.statusStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.statusStripItem}>
          <View style={[s.statusDot, { backgroundColor: '#22C55E' }]} />
          <ThemedText style={[s.statusCount, { color: colors.text }]}>{onTrackCount}</ThemedText>
          <ThemedText style={[s.statusLabel, { color: colors.textSecondary }]}>On Track</ThemedText>
        </View>
        <View style={s.statusStripItem}>
          <View style={[s.statusDot, { backgroundColor: '#F59E0B' }]} />
          <ThemedText style={[s.statusCount, { color: colors.text }]}>{atRiskCount}</ThemedText>
          <ThemedText style={[s.statusLabel, { color: colors.textSecondary }]}>At Risk</ThemedText>
        </View>
        <View style={s.statusStripItem}>
          <View style={[s.statusDot, { backgroundColor: '#EF4444' }]} />
          <ThemedText style={[s.statusCount, { color: colors.text }]}>{failedCount}</ThemedText>
          <ThemedText style={[s.statusLabel, { color: colors.textSecondary }]}>Failed</ThemedText>
        </View>
      </View>

      {/* Top 5 Things That Can Break Us */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Top 5 Things That Can Break Us
      </ThemedText>
      {topRisks.map((risk, index) => {
        const sevColor = RISK_SEVERITY_COLORS[risk.severity];
        return (
          <View
            key={risk.id}
            style={[s.topRiskRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[s.topRiskRank, { backgroundColor: sevColor + '18' }]}>
              <ThemedText style={[s.topRiskRankText, { color: sevColor }]}>{index + 1}</ThemedText>
            </View>
            <View style={s.topRiskTextCol}>
              <ThemedText style={[s.topRiskTitle, { color: colors.text }]} numberOfLines={2}>
                {risk.title}
              </ThemedText>
              <View style={s.topRiskMetaRow}>
                <StatusBadge label={COMPLIANCE_DOMAIN_LABELS[risk.domain].toUpperCase()} color={accentColor} />
                <StatusBadge label={RISK_SEVERITY_LABELS[risk.severity].toUpperCase()} color={sevColor} />
              </View>
            </View>
            <ThemedText style={[s.topRiskDate, { color: colors.textTertiary }]}>
              {formatDate(risk.dueDate)}
            </ThemedText>
          </View>
        );
      })}

      {/* Compliance <-> Finance/Rails Integrity Panel */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Finance / Rails Integrity
      </ThemedText>
      <View style={[s.integrityPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.integrityRow}>
          <View style={s.integrityItem}>
            <ThemedText style={[s.integrityValue, { color: financeIntegrity.complianceHolds > 0 ? '#F59E0B' : '#22C55E' }]}>
              {financeIntegrity.complianceHolds}
            </ThemedText>
            <ThemedText style={[s.integrityLabel, { color: colors.textSecondary }]}>Compliance Holds</ThemedText>
          </View>
          <View style={s.integrityItem}>
            <ThemedText style={[s.integrityValue, { color: financeIntegrity.restrictedFundsPolicy ? '#22C55E' : '#EF4444' }]}>
              {financeIntegrity.restrictedFundsPolicy ? 'Yes' : 'No'}
            </ThemedText>
            <ThemedText style={[s.integrityLabel, { color: colors.textSecondary }]}>Restricted Funds</ThemedText>
          </View>
          <View style={s.integrityItem}>
            <ThemedText style={[s.integrityValue, { color: accentColor }]}>
              {financeIntegrity.auditCompleteness}%
            </ThemedText>
            <ThemedText style={[s.integrityLabel, { color: colors.textSecondary }]}>Audit Complete</ThemedText>
          </View>
        </View>
        <View style={[s.integrityStatusRow, { borderTopColor: colors.border }]}>
          <IconSymbol name="creditcard.fill" size={14} color={accentColor} />
          <ThemedText style={[s.integrityStatusText, { color: colors.text }]}>
            {financeIntegrity.moneyChainStatus}
          </ThemedText>
        </View>
      </View>

      {/* Quick Actions */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Quick Actions
      </ThemedText>
      <View style={s.quickActionGrid}>
        {quickActions.map((action) => (
          <Pressable
            key={action.id}
            style={[s.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name={action.icon as any} size={22} color={accentColor} />
            <ThemedText style={[s.quickActionLabel, { color: colors.text }]}>{action.label}</ThemedText>
          </Pressable>
        ))}
      </View>
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
}: {
  colors: typeof Colors.light;
  accentColor: string;
  policies: CompliancePolicy[];
  onSelectPolicy: (policy: CompliancePolicy) => void;
}) {
  // Group policies by category
  const grouped = useMemo(() => {
    const map: Record<string, CompliancePolicy[]> = {};
    policies.forEach((p) => {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    });
    return Object.entries(map);
  }, [policies]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {grouped.map(([category, items]) => {
        const catLabel = POLICY_CATEGORY_LABELS[category as keyof typeof POLICY_CATEGORY_LABELS];
        const catIcon = POLICY_CATEGORY_ICONS[category as keyof typeof POLICY_CATEGORY_ICONS];
        return (
          <View key={category}>
            <View style={s.policyCategoryHeader}>
              <IconSymbol name={catIcon as any} size={14} color={accentColor} />
              <ThemedText style={[s.policyCategoryTitle, { color: colors.text }]}>{catLabel}</ThemedText>
              <ThemedText style={[s.policyCategoryCount, { color: colors.textTertiary }]}>
                {items.length}
              </ThemedText>
            </View>
            {items.map((item) => {
              const statusColor = POLICY_STATUS_COLORS[item.status];
              const statusLabel = POLICY_STATUS_LABELS[item.status];
              return (
                <Pressable
                  key={item.id}
                  style={[s.policyCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onSelectPolicy(item);
                  }}
                >
                  <View style={s.policyCardTop}>
                    <ThemedText style={[s.policyTitle, { color: colors.text }]} numberOfLines={2}>
                      {item.title}
                    </ThemedText>
                  </View>
                  <View style={s.policyBadgeRow}>
                    <StatusBadge label={`v${item.version}`} color={colors.textSecondary} />
                    <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
                    {item.attestationRequired && (
                      <StatusBadge
                        label="ATTESTATION"
                        color={item.attestationAudience ? '#22C55E' : '#F59E0B'}
                      />
                    )}
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
                  </View>
                  <ThemedText style={[s.policySummary, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.summary}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        );
      })}

      {policies.length === 0 && (
        <EmptyState icon="doc.text.fill" label="No policies available" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// CONTROLS SUB-TAB
// =============================================================================

function ControlsTab({
  colors,
  accentColor,
  controls,
  onSelectControl,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  controls: ComplianceControl[];
  onSelectControl: (control: ComplianceControl) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: ComplianceControl }) => {
      const freqLabel = CONTROL_FREQUENCY_LABELS[item.frequency];
      const statusColor = CONTROL_STATUS_COLORS[item.status];
      const statusLabel = CONTROL_STATUS_LABELS[item.status];
      const scopeColor = item.scope === 'finance' || item.scope === 'data_privacy' ? ACCENT : ACCENT;
      const scopeLabel = COMPLIANCE_DOMAIN_LABELS[item.scope] || item.scope;
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
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
            <StatusBadge label={scopeLabel.toUpperCase()} color={scopeColor} />
            {item.evidenceRequired.length > 0 && (
              <StatusBadge
                label={`${item.evidenceRequired.length} EVIDENCE`}
                color={colors.textSecondary}
              />
            )}
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectControl],
  );

  return (
    <FlatList
      data={controls}
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
// EVIDENCE SUB-TAB
// =============================================================================

function EvidenceTab({
  colors,
  accentColor,
  evidenceItems,
  role,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  evidenceItems: EvidenceItem[];
  role: EducationRoleLens;
}) {
  // Sort: draft/submitted first, then verified, then rejected
  const sorted = useMemo(() => {
    const statusOrder: Record<string, number> = { draft: 0, submitted: 1, rejected: 2, verified: 3 };
    return [...evidenceItems].sort((a, b) => (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4));
  }, [evidenceItems]);

  const renderItem = useCallback(
    ({ item }: { item: EvidenceItem }) => {
      const statusColor = EVIDENCE_STATUS_COLORS[item.status];
      const statusLabel = EVIDENCE_STATUS_LABELS[item.status];
      const typeLabel = EVIDENCE_TYPE_LABELS[item.type];
      const isActionable = isFacultyLevel(role) && (item.status === 'draft' || item.status === 'rejected');
      return (
        <View
          style={[s.evidenceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.evidenceCardTop}>
            <IconSymbol name="paperclip" size={16} color={accentColor} />
            <View style={s.evidenceTextCol}>
              <ThemedText style={[s.evidenceName, { color: colors.text }]} numberOfLines={2}>
                {item.controlName}
              </ThemedText>
              <ThemedText style={[s.evidenceSubmitter, { color: colors.textSecondary }]}>
                {item.submittedBy} — {formatDate(item.submittedDate)}
              </ThemedText>
            </View>
          </View>
          <View style={s.evidenceBadgeRow}>
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
            <StatusBadge label={typeLabel.toUpperCase()} color={colors.textSecondary} />
          </View>
          {item.reviewerNotes && (
            <View style={[s.evidenceNotesRow, { borderTopColor: colors.border }]}>
              <IconSymbol name="text.bubble.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.evidenceNotesText, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.reviewerNotes}
              </ThemedText>
            </View>
          )}
          {isActionable && (
            <Pressable
              style={[s.evidenceActionButton, { backgroundColor: accentColor + '18', borderColor: accentColor + '40' }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            >
              <IconSymbol name="arrow.up.doc.fill" size={12} color={accentColor} />
              <ThemedText style={[s.evidenceActionText, { color: accentColor }]}>
                {item.status === 'draft' ? 'Submit' : 'Resubmit'}
              </ThemedText>
            </Pressable>
          )}
          {isDeanLevel(role) && item.status === 'submitted' && (
            <View style={s.evidenceReviewActions}>
              <Pressable
                style={[s.evidenceReviewBtn, { backgroundColor: '#22C55E18', borderColor: '#22C55E40' }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                <IconSymbol name="checkmark.circle.fill" size={12} color="#22C55E" />
                <ThemedText style={[s.evidenceReviewBtnText, { color: '#22C55E' }]}>Verify</ThemedText>
              </Pressable>
              <Pressable
                style={[s.evidenceReviewBtn, { backgroundColor: '#EF444418', borderColor: '#EF444440' }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                <IconSymbol name="xmark.circle.fill" size={12} color="#EF4444" />
                <ThemedText style={[s.evidenceReviewBtnText, { color: '#EF4444' }]}>Reject</ThemedText>
              </Pressable>
            </View>
          )}
        </View>
      );
    },
    [colors, accentColor, role],
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="paperclip" label="No evidence items" colors={colors} />
      }
    />
  );
}

// =============================================================================
// RISK REGISTER SUB-TAB
// =============================================================================

function RiskRegisterTab({
  colors,
  accentColor,
  risks,
  onSelectRisk,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  risks: RiskRegisterItem[];
  onSelectRisk: (risk: RiskRegisterItem) => void;
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
          <Pressable
            key={risk.id}
            style={[s.riskCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectRisk(risk);
            }}
          >
            <View style={[s.riskSeverityBar, { backgroundColor: sevColor }]} />
            <View style={s.riskContent}>
              <ThemedText style={[s.riskTitle, { color: colors.text }]} numberOfLines={2}>
                {risk.title}
              </ThemedText>
              <View style={s.riskBadgeRow}>
                <StatusBadge label={catLabel.toUpperCase()} color={accentColor} />
                <StatusBadge label={sevLabel.toUpperCase()} color={sevColor} />
                <StatusBadge label={likelihoodLabel.toUpperCase()} color={risk.likelihood === 'high' ? '#EF4444' : risk.likelihood === 'medium' ? '#F59E0B' : '#22C55E'} />
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
              {risk.department && (
                <View style={s.riskDeptRow}>
                  <IconSymbol name="building.2.fill" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.riskMetaText, { color: colors.textTertiary }]}>
                    {risk.department}
                  </ThemedText>
                </View>
              )}
            </View>
          </Pressable>
        );
      })}

      {risks.length === 0 && (
        <EmptyState icon="shield.lefthalf.filled" label="No risks registered" colors={colors} />
      )}
    </ScrollView>
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
        const statusColor = AUDIT_STATUS_COLORS[audit.status];
        const statusLabel = AUDIT_STATUS_LABELS[audit.status];

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
              <View style={s.auditMetaItem}>
                <IconSymbol name="slider.horizontal.3" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.auditMetaText, { color: colors.textTertiary }]}>
                  {audit.controlsChecked} controls checked
                </ThemedText>
              </View>
            </View>

            {audit.findingsCount > 0 && (
              <View style={s.findingsCountRow}>
                <StatusBadge label={`${audit.findingsCount} FINDING${audit.findingsCount !== 1 ? 'S' : ''}`} color="#F59E0B" />
              </View>
            )}

            {/* Expandable findings summary */}
            {isExpanded && audit.findingsCount > 0 && (
              <View style={[s.findingsSection, { borderTopColor: colors.border }]}>
                <ThemedText style={[s.findingsSectionTitle, { color: colors.text }]}>
                  Audit Details
                </ThemedText>
                <View style={s.auditDetailGrid}>
                  <View style={s.auditDetailItem}>
                    <ThemedText style={[s.auditDetailValue, { color: colors.text }]}>
                      {audit.controlsChecked}
                    </ThemedText>
                    <ThemedText style={[s.auditDetailLabel, { color: colors.textSecondary }]}>Controls</ThemedText>
                  </View>
                  <View style={s.auditDetailItem}>
                    <ThemedText style={[s.auditDetailValue, { color: audit.findingsCount > 0 ? '#F59E0B' : '#22C55E' }]}>
                      {audit.findingsCount}
                    </ThemedText>
                    <ThemedText style={[s.auditDetailLabel, { color: colors.textSecondary }]}>Findings</ThemedText>
                  </View>
                  <View style={s.auditDetailItem}>
                    <ThemedText style={[s.auditDetailValue, { color: colors.text }]}>
                      {audit.reviewers.length}
                    </ThemedText>
                    <ThemedText style={[s.auditDetailLabel, { color: colors.textSecondary }]}>Reviewers</ThemedText>
                  </View>
                </View>
                <ThemedText style={[s.auditReviewersList, { color: colors.textSecondary }]}>
                  Reviewers: {audit.reviewers.join(', ')}
                </ThemedText>
              </View>
            )}

            {isExpanded && audit.findingsCount === 0 && (
              <View style={[s.findingsSection, { borderTopColor: colors.border }]}>
                <ThemedText style={[s.findingsEmpty, { color: colors.textSecondary }]}>
                  No findings — audit {audit.status === 'planned' ? 'not yet started' : 'clean'}
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
// FINDINGS SUB-TAB
// =============================================================================

function FindingsTab({
  colors,
  accentColor,
  findings,
  onSelectFinding,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  findings: AuditFinding[];
  onSelectFinding: (finding: AuditFinding) => void;
}) {
  // Sort: open first, then by severity
  const sorted = useMemo(() => {
    const statusOrder: Record<string, number> = { open: 0, assigned: 1, remediation: 2, proof_uploaded: 3, closed: 4 };
    const sevOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...findings].sort((a, b) => {
      const sDiff = statusOrder[a.status] - statusOrder[b.status];
      if (sDiff !== 0) return sDiff;
      return sevOrder[a.severity] - sevOrder[b.severity];
    });
  }, [findings]);

  const renderItem = useCallback(
    ({ item }: { item: AuditFinding }) => {
      const sevColor = FINDING_SEVERITY_COLORS[item.severity];
      const sevLabel = FINDING_SEVERITY_LABELS[item.severity];
      const statusColor = FINDING_STATUS_COLORS[item.status];
      const statusLabel = FINDING_STATUS_LABELS[item.status];
      const domainLabel = COMPLIANCE_DOMAIN_LABELS[item.impactArea] || item.impactArea;
      return (
        <Pressable
          style={[s.findingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectFinding(item);
          }}
        >
          <View style={[s.findingSeverityBar, { backgroundColor: sevColor }]} />
          <View style={s.findingContent}>
            <ThemedText style={[s.findingTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </ThemedText>
            <View style={s.findingBadgeRow}>
              <StatusBadge label={sevLabel.toUpperCase()} color={sevColor} />
              <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
            </View>
            <View style={s.findingDetailRows}>
              <View style={s.findingDetailRow}>
                <ThemedText style={[s.findingDetailLabel, { color: colors.textTertiary }]}>Policy:</ThemedText>
                <ThemedText style={[s.findingDetailValue, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.policyFailed}
                </ThemedText>
              </View>
              <View style={s.findingDetailRow}>
                <ThemedText style={[s.findingDetailLabel, { color: colors.textTertiary }]}>Impact:</ThemedText>
                <ThemedText style={[s.findingDetailValue, { color: colors.textSecondary }]}>
                  {domainLabel}
                </ThemedText>
              </View>
              <View style={s.findingDetailRow}>
                <ThemedText style={[s.findingDetailLabel, { color: colors.textTertiary }]}>Owner:</ThemedText>
                <ThemedText style={[s.findingDetailValue, { color: colors.textSecondary }]}>
                  {item.owner}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={[s.findingPlan, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.remediationPlan}
            </ThemedText>

            {/* Workflow step indicator */}
            <View style={s.findingWorkflowRow}>
              {(['open', 'assigned', 'remediation', 'proof_uploaded', 'closed'] as const).map((step) => {
                const stepColor = FINDING_STATUS_COLORS[step];
                const isCurrent = item.status === step;
                const stepIdx = ['open', 'assigned', 'remediation', 'proof_uploaded', 'closed'].indexOf(step);
                const currentIdx = ['open', 'assigned', 'remediation', 'proof_uploaded', 'closed'].indexOf(item.status);
                const isPast = stepIdx < currentIdx;
                return (
                  <View key={step} style={s.findingWorkflowStep}>
                    <View
                      style={[
                        s.findingWorkflowDot,
                        {
                          backgroundColor: isCurrent ? stepColor : isPast ? stepColor + '60' : colors.border,
                          borderColor: isCurrent ? stepColor : 'transparent',
                          borderWidth: isCurrent ? 2 : 0,
                        },
                      ]}
                    />
                    {isCurrent && (
                      <ThemedText style={[s.findingWorkflowLabel, { color: stepColor }]}>
                        {FINDING_STATUS_LABELS[step]}
                      </ThemedText>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectFinding],
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="doc.text.magnifyingglass" label="No findings recorded" colors={colors} />
      }
    />
  );
}

// =============================================================================
// INCIDENTS SUB-TAB
// =============================================================================

function IncidentsTab({
  colors,
  accentColor,
  incidents,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  incidents: ComplianceIncident[];
}) {
  const sorted = useMemo(() => {
    const sevOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    const statusOrder: Record<string, number> = { open: 0, investigating: 1, contained: 2, resolved: 3, closed: 4 };
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
        const hasAddenda = incident.addenda && incident.addenda.length > 0;
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
                {isClosed && <StatusBadge label="IMMUTABLE" color="#A1A1AA" />}
                {hasAddenda && (
                  <StatusBadge label={`${incident.addenda!.length} ADDENDA`} color={ACCENT} />
                )}
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
              </View>
              <ThemedText style={[s.incidentDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {incident.description}
              </ThemedText>

              {/* Containment */}
              {incident.containment && (
                <View style={[s.incidentContainmentRow, { borderTopColor: colors.border }]}>
                  <IconSymbol name="shield.fill" size={12} color={accentColor} />
                  <ThemedText style={[s.incidentContainmentText, { color: colors.textSecondary }]} numberOfLines={2}>
                    {incident.containment}
                  </ThemedText>
                </View>
              )}

              {/* Root cause (if resolved/closed) */}
              {incident.rootCause && (
                <View style={s.incidentDetailSection}>
                  <ThemedText style={[s.incidentDetailLabel, { color: colors.textTertiary }]}>Root Cause:</ThemedText>
                  <ThemedText style={[s.incidentDetailText, { color: colors.textSecondary }]} numberOfLines={2}>
                    {incident.rootCause}
                  </ThemedText>
                </View>
              )}

              {/* Addenda list */}
              {hasAddenda && (
                <View style={[s.incidentAddendaSection, { borderTopColor: colors.border }]}>
                  <ThemedText style={[s.incidentAddendaTitle, { color: colors.textTertiary }]}>
                    Addenda (append-only):
                  </ThemedText>
                  {incident.addenda!.map((addendum, i) => (
                    <ThemedText
                      key={`${incident.id}-add-${i}`}
                      style={[s.incidentAddendaItem, { color: colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {i + 1}. {addendum}
                    </ThemedText>
                  ))}
                </View>
              )}
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

            {/* Duration & Risk */}
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

            {/* Risk acknowledgment */}
            <View style={s.exceptionRiskSection}>
              <ThemedText style={[s.exceptionRiskLabel, { color: colors.textTertiary }]}>Risk Acknowledgment:</ThemedText>
              <ThemedText style={[s.exceptionRiskText, { color: colors.textSecondary }]} numberOfLines={2}>
                {exc.riskAcknowledgment}
              </ThemedText>
            </View>

            {/* Compensating controls */}
            <View style={s.exceptionCompSection}>
              <ThemedText style={[s.exceptionCompLabel, { color: colors.textTertiary }]}>Compensating Controls:</ThemedText>
              <ThemedText style={[s.exceptionCompText, { color: colors.textSecondary }]} numberOfLines={2}>
                {exc.compensatingControls}
              </ThemedText>
            </View>

            {/* Approver chain */}
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

      {packets.map((packet) => {
        const typeLabel = EXPORT_PACKET_TYPE_LABELS[packet.type];
        const typeIcon = EXPORT_PACKET_TYPE_ICONS[packet.type];
        return (
          <View
            key={packet.id}
            style={[s.exportCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.exportCardTop}>
              <IconSymbol name={typeIcon as any} size={18} color={accentColor} />
              <View style={s.exportTextCol}>
                <ThemedText style={[s.exportName, { color: colors.text }]}>{packet.name}</ThemedText>
                <StatusBadge label={typeLabel.toUpperCase()} color={accentColor} />
              </View>
            </View>
            <ThemedText style={[s.exportDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {packet.description}
            </ThemedText>

            {/* Contents preview */}
            <View style={[s.exportContentsSection, { borderTopColor: colors.border }]}>
              <ThemedText style={[s.exportContentsTitle, { color: colors.textTertiary }]}>Contents:</ThemedText>
              {packet.contents.map((item, i) => (
                <ThemedText key={`${packet.id}-c-${i}`} style={[s.exportContentsItem, { color: colors.textSecondary }]}>
                  {item}
                </ThemedText>
              ))}
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
        );
      })}

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
  attestations,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  policy: CompliancePolicy | null;
  controls: ComplianceControl[];
  attestations: ReturnType<typeof getEduComplianceData>['attestations'];
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!policy) return null;

  const statusColor = POLICY_STATUS_COLORS[policy.status];
  const statusLabel = POLICY_STATUS_LABELS[policy.status];
  const catLabel = POLICY_CATEGORY_LABELS[policy.category];
  const linkedControls = controls.filter((c) => c.linkedPolicyId === policy.id);
  const policyAttestations = attestations.filter((a) => a.policyId === policy.id);

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

      {/* Details Grid */}
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
          {policyAttestations.length > 0 && (
            <View style={{ marginTop: Spacing.sm }}>
              {policyAttestations.map((att) => {
                const attColor = att.status === 'completed' ? '#22C55E' : att.status === 'overdue' ? '#EF4444' : '#F59E0B';
                return (
                  <View key={att.id} style={s.sheetListRow}>
                    <View style={[s.timelineDot, { backgroundColor: attColor }]} />
                    <View style={s.sheetListTextCol}>
                      <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>{att.employeeName}</ThemedText>
                      <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                        {att.status === 'completed'
                          ? `Completed ${formatDate(att.completedDate)}`
                          : att.status === 'overdue'
                            ? `Overdue — due ${formatDate(att.dueDate)}`
                            : `Pending — due ${formatDate(att.dueDate)}`
                        }
                      </ThemedText>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
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
        {linkedControls.map((ctrl) => {
          const ctrlStatusColor = CONTROL_STATUS_COLORS[ctrl.status];
          const ctrlStatusLabel = CONTROL_STATUS_LABELS[ctrl.status];
          return (
            <View key={ctrl.id} style={s.sheetListRow}>
              <IconSymbol name="slider.horizontal.3" size={14} color={accentColor} />
              <View style={s.sheetListTextCol}>
                <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                  {ctrl.name}
                </ThemedText>
                <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                  {CONTROL_FREQUENCY_LABELS[ctrl.frequency]} — {ctrlStatusLabel}
                </ThemedText>
              </View>
              <View style={[s.timelineDot, { backgroundColor: ctrlStatusColor }]} />
            </View>
          );
        })}
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
  const statusColor = CONTROL_STATUS_COLORS[control.status];
  const statusLabel = CONTROL_STATUS_LABELS[control.status];
  const linkedEvidence = evidenceItems.filter((e) => e.controlId === control.id);
  const scopeLabel = COMPLIANCE_DOMAIN_LABELS[control.scope] || control.scope;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={control.name} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={freqLabel.toUpperCase()} color={accentColor} />
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
        <StatusBadge label={scopeLabel.toUpperCase()} color={ACCENT} />
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
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{scopeLabel}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Scope</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {control.lastEvidenceDate ? formatDate(control.lastEvidenceDate) : '--'}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Last Evidence</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {control.evidenceRequired.map((t) => EVIDENCE_TYPE_LABELS[t]).join(', ')}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Evidence Types</ThemedText>
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
                  {EVIDENCE_TYPE_LABELS[ev.type]} — {ev.submittedBy}
                </ThemedText>
                <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                  {formatDate(ev.submittedDate)}
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
          <View style={[s.timelineDot, { backgroundColor: statusColor }]} />
          <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
            Current: {statusLabel}
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
// RISK DETAIL BOTTOM SHEET
// =============================================================================

function RiskDetailSheet({
  visible,
  onClose,
  risk,
  controls,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  risk: RiskRegisterItem | null;
  controls: ComplianceControl[];
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!risk) return null;

  const sevColor = RISK_SEVERITY_COLORS[risk.severity];
  const sevLabel = RISK_SEVERITY_LABELS[risk.severity];
  const catLabel = RISK_CATEGORY_LABELS[risk.category];
  const residualColor = RISK_SEVERITY_COLORS[risk.residualRisk];
  const residualLabel = RISK_SEVERITY_LABELS[risk.residualRisk];
  const linkedControls = controls.filter((c) => risk.linkedControls.includes(c.id));

  return (
    <BottomSheet visible={visible} onClose={onClose} title={risk.title} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={catLabel.toUpperCase()} color={accentColor} />
        <StatusBadge label={sevLabel.toUpperCase()} color={sevColor} />
        <StatusBadge label={`LIKELIHOOD: ${risk.likelihood.toUpperCase()}`} color={risk.likelihood === 'high' ? '#EF4444' : risk.likelihood === 'medium' ? '#F59E0B' : '#22C55E'} />
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{risk.owner}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Owner</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatDate(risk.targetDate)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Target Date</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: residualColor }]}>{residualLabel}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Residual Risk</ThemedText>
          </View>
          {risk.department && (
            <View style={s.sheetDetailItem}>
              <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{risk.department}</ThemedText>
              <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Department</ThemedText>
            </View>
          )}
        </View>
      </View>

      {/* Mitigation Plan */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Mitigation Plan</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>{risk.mitigationPlan}</ThemedText>
      </View>

      {/* Linked Controls */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Linked Controls ({linkedControls.length})
        </ThemedText>
        {linkedControls.map((ctrl) => {
          const ctrlStatusColor = CONTROL_STATUS_COLORS[ctrl.status];
          const ctrlStatusLabel = CONTROL_STATUS_LABELS[ctrl.status];
          return (
            <View key={ctrl.id} style={s.sheetListRow}>
              <IconSymbol name="slider.horizontal.3" size={14} color={accentColor} />
              <View style={s.sheetListTextCol}>
                <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                  {ctrl.name}
                </ThemedText>
                <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                  {CONTROL_FREQUENCY_LABELS[ctrl.frequency]} — {ctrlStatusLabel}
                </ThemedText>
              </View>
              <View style={[s.timelineDot, { backgroundColor: ctrlStatusColor }]} />
            </View>
          );
        })}
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
// FINDING DETAIL BOTTOM SHEET
// =============================================================================

function FindingDetailSheet({
  visible,
  onClose,
  finding,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  finding: AuditFinding | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!finding) return null;

  const sevColor = FINDING_SEVERITY_COLORS[finding.severity];
  const sevLabel = FINDING_SEVERITY_LABELS[finding.severity];
  const statusColor = FINDING_STATUS_COLORS[finding.status];
  const statusLabel = FINDING_STATUS_LABELS[finding.status];
  const domainLabel = COMPLIANCE_DOMAIN_LABELS[finding.impactArea] || finding.impactArea;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={finding.title} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={sevLabel.toUpperCase()} color={sevColor} />
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{finding.owner}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Owner</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{domainLabel}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Impact Area</ThemedText>
          </View>
        </View>
      </View>

      {/* Policy & Control Failed */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Compliance Gap</ThemedText>
        <View style={s.sheetListRow}>
          <IconSymbol name="doc.text.fill" size={14} color={accentColor} />
          <View style={s.sheetListTextCol}>
            <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>Policy Failed</ThemedText>
            <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
              {finding.policyFailed}
            </ThemedText>
          </View>
        </View>
        <View style={s.sheetListRow}>
          <IconSymbol name="slider.horizontal.3" size={14} color={accentColor} />
          <View style={s.sheetListTextCol}>
            <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>Control Failed</ThemedText>
            <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
              {finding.controlFailed}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Remediation Plan */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Remediation Plan</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>{finding.remediationPlan}</ThemedText>
      </View>

      {/* Evidence to Close */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Evidence to Close</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>{finding.evidenceToClose}</ThemedText>
      </View>

      {/* Workflow Status */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Workflow Status</ThemedText>
        <View style={s.sheetWorkflowRow}>
          {(['open', 'assigned', 'remediation', 'proof_uploaded', 'closed'] as const).map((step) => {
            const stepColor = FINDING_STATUS_COLORS[step];
            const isCurrent = finding.status === step;
            const stepIdx = ['open', 'assigned', 'remediation', 'proof_uploaded', 'closed'].indexOf(step);
            const currentIdx = ['open', 'assigned', 'remediation', 'proof_uploaded', 'closed'].indexOf(finding.status);
            const isPast = stepIdx < currentIdx;
            return (
              <View key={step} style={s.sheetWorkflowStep}>
                <View
                  style={[
                    s.sheetWorkflowDot,
                    {
                      backgroundColor: isCurrent || isPast ? stepColor : colors.border,
                      borderColor: isCurrent ? stepColor : 'transparent',
                      borderWidth: isCurrent ? 2 : 0,
                    },
                  ]}
                />
                <ThemedText
                  style={[
                    s.sheetWorkflowLabel,
                    { color: isCurrent ? stepColor : isPast ? stepColor + '80' : colors.textTertiary },
                  ]}
                >
                  {FINDING_STATUS_LABELS[step]}
                </ThemedText>
              </View>
            );
          })}
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

export function EduOrgComplianceV2({ colors, accentColor, role = 'E1' }: Props) {
  // === RBAC Gate: E4/E5 locked ===
  if (role === 'E4' || role === 'E5') {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Compliance</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          Compliance information is not available for your role
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [selectedPolicy, setSelectedPolicy] = useState<CompliancePolicy | null>(null);
  const [policySheetVisible, setPolicySheetVisible] = useState(false);
  const [selectedControl, setSelectedControl] = useState<ComplianceControl | null>(null);
  const [controlSheetVisible, setControlSheetVisible] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<RiskRegisterItem | null>(null);
  const [riskSheetVisible, setRiskSheetVisible] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<AuditFinding | null>(null);
  const [findingSheetVisible, setFindingSheetVisible] = useState(false);

  // === Data ===
  const data = useMemo(() => getEduComplianceData(), []);

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

  const handleSelectRisk = useCallback((risk: RiskRegisterItem) => {
    setSelectedRisk(risk);
    setRiskSheetVisible(true);
  }, []);

  const handleCloseRiskSheet = useCallback(() => {
    setRiskSheetVisible(false);
  }, []);

  const handleSelectFinding = useCallback((finding: AuditFinding) => {
    setSelectedFinding(finding);
    setFindingSheetVisible(true);
  }, []);

  const handleCloseFindingSheet = useCallback(() => {
    setFindingSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (isDeanLevel(role)) return SUB_TABS; // E1/E2: full 10 tabs
    if (isFacultyLevel(role)) {
      // E3 (Faculty/Staff): Overview + Policies + Controls + Evidence (submit only)
      return SUB_TABS.filter(
        (t) => t.id === 'overview' || t.id === 'policies' || t.id === 'controls' || t.id === 'evidence',
      );
    }
    // E4/E5 already handled by locked gate above
    return SUB_TABS;
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return <OverviewTab colors={colors} accentColor={accentColor} data={data} />;
      case 'policies':
        return (
          <PoliciesTab
            colors={colors}
            accentColor={accentColor}
            policies={data.policies}
            onSelectPolicy={handleSelectPolicy}
          />
        );
      case 'controls':
        return (
          <ControlsTab
            colors={colors}
            accentColor={accentColor}
            controls={data.controls}
            onSelectControl={handleSelectControl}
          />
        );
      case 'evidence':
        return (
          <EvidenceTab
            colors={colors}
            accentColor={accentColor}
            evidenceItems={data.evidenceItems}
            role={role}
          />
        );
      case 'risk-register':
        if (!isDeanLevel(role)) return null;
        return (
          <RiskRegisterTab
            colors={colors}
            accentColor={accentColor}
            risks={data.risks}
            onSelectRisk={handleSelectRisk}
          />
        );
      case 'audits':
        if (!isDeanLevel(role)) return null;
        return <AuditsTab colors={colors} accentColor={accentColor} audits={data.auditRuns} />;
      case 'findings':
        if (!isDeanLevel(role)) return null;
        return (
          <FindingsTab
            colors={colors}
            accentColor={accentColor}
            findings={data.findings}
            onSelectFinding={handleSelectFinding}
          />
        );
      case 'incidents':
        if (!isDeanLevel(role)) return null;
        return (
          <IncidentsTab
            colors={colors}
            accentColor={accentColor}
            incidents={data.incidents}
          />
        );
      case 'exceptions':
        if (!isDeanLevel(role)) return null;
        return <ExceptionsTab colors={colors} accentColor={accentColor} exceptions={data.exceptions} />;
      case 'exports':
        if (!isDeanLevel(role)) return null;
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
        attestations={data.attestations}
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

      {/* Risk Detail Bottom Sheet */}
      <RiskDetailSheet
        visible={riskSheetVisible}
        onClose={handleCloseRiskSheet}
        risk={selectedRisk}
        controls={data.controls}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Finding Detail Bottom Sheet */}
      <FindingDetailSheet
        visible={findingSheetVisible}
        onClose={handleCloseFindingSheet}
        finding={selectedFinding}
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

  // -- Posture Card --
  postureCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  postureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  postureDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  postureTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  postureKpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  postureKpiItem: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  postureKpiValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  postureKpiLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  postureProgressRow: {
    marginTop: Spacing.xs,
  },
  postureProgressLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  postureProgressText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  postureProgressPercent: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
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

  // -- Top Risk Row --
  topRiskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  topRiskRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRiskRankText: {
    fontSize: 13,
    fontWeight: '700',
  },
  topRiskTextCol: {
    flex: 1,
    gap: 4,
  },
  topRiskTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  topRiskMetaRow: {
    flexDirection: 'row',
    gap: 6,
  },
  topRiskDate: {
    fontSize: 11,
  },

  // -- Integrity Panel --
  integrityPanel: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  integrityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },
  integrityItem: {
    alignItems: 'center',
  },
  integrityValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  integrityLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  integrityStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  integrityStatusText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // -- Quick Actions --
  quickActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickActionCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Policy Card --
  policyCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  policyCategoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  policyCategoryCount: {
    fontSize: 12,
    fontWeight: '600',
  },
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

  // -- Evidence Card --
  evidenceCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  evidenceCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  evidenceTextCol: {
    flex: 1,
  },
  evidenceName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  evidenceSubmitter: {
    fontSize: 11,
  },
  evidenceBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  evidenceNotesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  evidenceNotesText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  evidenceActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
  evidenceActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  evidenceReviewActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  evidenceReviewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  evidenceReviewBtnText: {
    fontSize: 12,
    fontWeight: '600',
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
  riskDeptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
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
  auditDetailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },
  auditDetailItem: {
    alignItems: 'center',
  },
  auditDetailValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  auditDetailLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  auditReviewersList: {
    fontSize: 11,
    lineHeight: 16,
  },
  findingsCountRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: Spacing.sm,
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
  findingsEmpty: {
    fontSize: 12,
    fontStyle: 'italic',
  },

  // -- Finding Card --
  findingCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  findingSeverityBar: {
    width: 4,
  },
  findingContent: {
    flex: 1,
    padding: Spacing.md,
  },
  findingTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  findingBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  findingDetailRows: {
    marginBottom: Spacing.sm,
  },
  findingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  findingDetailLabel: {
    fontSize: 11,
    fontWeight: '600',
    width: 50,
  },
  findingDetailValue: {
    fontSize: 11,
    flex: 1,
  },
  findingPlan: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  findingWorkflowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  findingWorkflowStep: {
    alignItems: 'center',
    gap: 2,
  },
  findingWorkflowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  findingWorkflowLabel: {
    fontSize: 8,
    fontWeight: '600',
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
  incidentContainmentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.sm,
  },
  incidentContainmentText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  incidentDetailSection: {
    marginTop: Spacing.sm,
  },
  incidentDetailLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  incidentDetailText: {
    fontSize: 11,
    lineHeight: 16,
  },
  incidentAddendaSection: {
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.sm,
  },
  incidentAddendaTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  incidentAddendaItem: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 2,
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
  exceptionRiskSection: {
    marginBottom: Spacing.sm,
  },
  exceptionRiskLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  exceptionRiskText: {
    fontSize: 11,
    lineHeight: 16,
  },
  exceptionCompSection: {
    marginBottom: Spacing.sm,
  },
  exceptionCompLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  exceptionCompText: {
    fontSize: 11,
    lineHeight: 16,
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
    gap: 4,
  },
  exportName: {
    fontSize: 14,
    fontWeight: '600',
  },
  exportDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  exportContentsSection: {
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  exportContentsTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  exportContentsItem: {
    fontSize: 11,
    lineHeight: 16,
    marginLeft: Spacing.sm,
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

  // -- Finding Detail Sheet Workflow --
  sheetWorkflowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
  },
  sheetWorkflowStep: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  sheetWorkflowDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  sheetWorkflowLabel: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
});
