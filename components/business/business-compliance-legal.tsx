/**
 * BusinessComplianceLegal — 9 sub-tab Compliance & Legal tab for Business Mode.
 * Sub-tabs: Overview, Legal Docs, Policies, Risk Register, Controls, Audits,
 * Incidents, Exceptions, Exports.
 *
 * RBAC:
 *   B1  — all 9 sub-tabs
 *   B2b — overview, risk_register, audits, controls, exports (5 tabs)
 *   B2a / B3 — locked
 */

import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, BusinessPalette } from '@/constants/theme';
import { EntityScopeBar } from '@/components/business/entity-scope-bar';
import {
  BizCard,
  BizCardTitle,
  BizSubTabBar,
  BizStatusChip,
  BizEmptyLock,
  statusColor,
  statusVariant,
} from '@/components/business/business-shared';
import { isFounder, isBoardLevel } from '@/utils/business-rbac';
import type { BusinessRoleLens } from '@/utils/business-rbac';
import { DEFAULT_ENTITY } from '@/data/mock-business-v3';

import {
  COMPLIANCE_SUB_TABS,
  COMPLIANCE_OVERVIEW,
  LEGAL_DOCS,
  POLICIES,
  RISK_REGISTER,
  CONTROLS,
  AUDIT_RECORDS,
  INCIDENTS,
  COMPLIANCE_EXCEPTIONS,
  EXPORT_RECORDS,
} from '@/data/mock-biz-compliance-legal';
import type {
  ComplianceSubTab,
  LegalDoc,
  PolicyItem,
  RiskRegisterItem,
  ControlItem,
  AuditRecord,
  IncidentRecord,
  ExceptionItem,
  ExportRecord,
} from '@/data/mock-biz-compliance-legal';

const BP = BusinessPalette;

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  role?: BusinessRoleLens;
}

// =============================================================================
// RBAC — SUB-TAB FILTERING
// =============================================================================

const B2B_TABS: ComplianceSubTab[] = ['overview', 'risk_register', 'audits', 'controls', 'exports'];

function getAllowedTabs(role: BusinessRoleLens) {
  if (isFounder(role)) return COMPLIANCE_SUB_TABS;
  if (role === 'B2b') return COMPLIANCE_SUB_TABS.filter((t) => B2B_TABS.includes(t.id));
  return [];
}

// =============================================================================
// HELPERS
// =============================================================================

function severityColor(sev: string): string {
  switch (sev) {
    case 'critical':
      return BP.red;
    case 'high':
      return '#FF8C42';
    case 'medium':
      return BP.amber;
    case 'low':
      return BP.emerald;
    default:
      return BP.ash;
  }
}

function controlTypeColor(type: string): string {
  switch (type) {
    case 'preventive':
      return BP.emerald;
    case 'detective':
      return BP.amber;
    case 'corrective':
      return BP.red;
    default:
      return BP.ash;
  }
}

function controlStatusVariant(status: string): 'success' | 'warning' | 'error' | 'neutral' {
  switch (status) {
    case 'effective':
      return 'success';
    case 'needs_improvement':
      return 'warning';
    case 'not_tested':
      return 'neutral';
    default:
      return 'neutral';
  }
}

function auditStatusVariant(status: string): 'success' | 'warning' | 'info' | 'neutral' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'warning';
    case 'scheduled':
      return 'info';
    default:
      return 'neutral';
  }
}

function exportTypeLabel(type: string): string {
  switch (type) {
    case 'compliance_report':
      return 'REPORT';
    case 'audit_pack':
      return 'AUDIT';
    case 'risk_matrix':
      return 'RISK';
    case 'policy_bundle':
      return 'POLICY';
    default:
      return type.toUpperCase();
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function complianceScoreColor(score: number): string {
  if (score >= 80) return BP.emerald;
  if (score >= 60) return BP.amber;
  return BP.red;
}

// =============================================================================
// SUB-TAB: OVERVIEW
// =============================================================================

function OverviewContent() {
  const overview = COMPLIANCE_OVERVIEW;
  const scoreColor = complianceScoreColor(overview.score);

  return (
    <View>
      {/* Score hero */}
      <BizCard>
        <BizCardTitle text="COMPLIANCE SCORE" />
        <View style={s.scoreRow}>
          <ThemedText style={[s.scoreNumber, { color: scoreColor }]}>
            {overview.score}
          </ThemedText>
          <View style={s.scoreMetaCol}>
            <BizStatusChip label={overview.status.toUpperCase().replace('_', ' ')} variant={statusVariant(overview.status)} />
            <ThemedText style={[s.scoreMeta, { color: BP.ash }]}>
              out of 100
            </ThemedText>
          </View>
        </View>
      </BizCard>

      {/* Health indicators */}
      <BizCard>
        <BizCardTitle text="HEALTH INDICATORS" />
        <View style={s.healthGrid}>
          <View style={s.healthItem}>
            <IconSymbol name="exclamationmark.circle.fill" size={16} color={BP.amber} />
            <ThemedText style={[s.healthValue, { color: BP.smoke }]}>
              {overview.openItems}
            </ThemedText>
            <ThemedText style={[s.healthLabel, { color: BP.ash }]}>Open Items</ThemedText>
          </View>
          <View style={s.healthItem}>
            <IconSymbol name="calendar.badge.clock" size={16} color={BP.champagneGold} />
            <ThemedText style={[s.healthValue, { color: BP.smoke }]}>
              {overview.upcomingDeadlines}
            </ThemedText>
            <ThemedText style={[s.healthLabel, { color: BP.ash }]}>Upcoming Deadlines</ThemedText>
          </View>
          <View style={s.healthItem}>
            <IconSymbol name="checkmark.shield.fill" size={16} color={BP.emerald} />
            <ThemedText style={[s.healthValue, { color: BP.smoke }]}>
              {formatDate(overview.lastAudit)}
            </ThemedText>
            <ThemedText style={[s.healthLabel, { color: BP.ash }]}>Last Audit</ThemedText>
          </View>
        </View>
      </BizCard>

      {/* Quick summary cards */}
      <BizCard>
        <BizCardTitle text="QUICK SUMMARY" />
        <View style={s.summaryRow}>
          <View style={[s.summaryChip, { backgroundColor: BP.emerald + '15' }]}>
            <ThemedText style={[s.summaryChipValue, { color: BP.emerald }]}>
              {LEGAL_DOCS.filter((d) => d.status === 'active').length}
            </ThemedText>
            <ThemedText style={[s.summaryChipLabel, { color: BP.ash }]}>Active Docs</ThemedText>
          </View>
          <View style={[s.summaryChip, { backgroundColor: BP.amber + '15' }]}>
            <ThemedText style={[s.summaryChipValue, { color: BP.amber }]}>
              {RISK_REGISTER.filter((r) => r.status === 'open').length}
            </ThemedText>
            <ThemedText style={[s.summaryChipLabel, { color: BP.ash }]}>Open Risks</ThemedText>
          </View>
          <View style={[s.summaryChip, { backgroundColor: BP.red + '15' }]}>
            <ThemedText style={[s.summaryChipValue, { color: BP.red }]}>
              {INCIDENTS.filter((i) => i.status === 'open' || i.status === 'investigating').length}
            </ThemedText>
            <ThemedText style={[s.summaryChipLabel, { color: BP.ash }]}>Active Incidents</ThemedText>
          </View>
        </View>
      </BizCard>
    </View>
  );
}

// =============================================================================
// SUB-TAB: LEGAL DOCS
// =============================================================================

function LegalDocsContent() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="LEGAL DOCUMENTS" />
        {LEGAL_DOCS.map((doc, idx) => (
          <Pressable
            key={doc.id}
            style={({ pressed }) => [
              s.listRow,
              idx < LEGAL_DOCS.length - 1 && s.listRowBorder,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.listRowLeft}>
              {/* Type badge */}
              <View style={[s.typeBadge, { backgroundColor: BP.glass }]}>
                <ThemedText style={[s.typeBadgeText, { color: BP.champagneGold }]}>
                  {doc.type.toUpperCase()}
                </ThemedText>
              </View>

              {/* Title + meta */}
              <View style={s.listRowContent}>
                <ThemedText style={[s.listRowTitle, { color: BP.smoke }]} numberOfLines={2}>
                  {doc.title}
                </ThemedText>
                <ThemedText style={[s.listRowMeta, { color: BP.ash }]}>
                  {doc.entity}
                  {doc.counterparty ? ` \u00B7 ${doc.counterparty}` : ''}
                </ThemedText>
                <ThemedText style={[s.listRowMeta, { color: BP.ash }]}>
                  Effective: {formatDate(doc.effectiveDate)}
                  {doc.expiryDate ? ` \u2014 Expires: ${formatDate(doc.expiryDate)}` : ''}
                </ThemedText>
              </View>
            </View>

            <BizStatusChip label={doc.status.toUpperCase()} variant={statusVariant(doc.status)} />
          </Pressable>
        ))}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SUB-TAB: POLICIES
// =============================================================================

function PoliciesContent() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="POLICIES" />
        {POLICIES.map((pol, idx) => (
          <Pressable
            key={pol.id}
            style={({ pressed }) => [
              s.listRow,
              idx < POLICIES.length - 1 && s.listRowBorder,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.listRowContent}>
              <View style={s.policyHeader}>
                <ThemedText style={[s.listRowTitle, { color: BP.smoke, flex: 1 }]} numberOfLines={2}>
                  {pol.title}
                </ThemedText>
                <View style={[s.versionBadge, { backgroundColor: BP.glass }]}>
                  <ThemedText style={[s.versionBadgeText, { color: BP.platinum }]}>
                    v{pol.version}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[s.listRowMeta, { color: BP.ash }]}>
                {pol.category} \u00B7 Last reviewed: {formatDate(pol.lastReviewed)}
              </ThemedText>
              <ThemedText style={[s.listRowMeta, { color: BP.ash }]}>
                Owner: {pol.owner}
              </ThemedText>
              <View style={{ marginTop: Spacing.xs }}>
                <BizStatusChip
                  label={pol.status.toUpperCase().replace('_', ' ')}
                  variant={statusVariant(pol.status === 'under_review' ? 'in_review' : pol.status)}
                />
              </View>
            </View>
          </Pressable>
        ))}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SUB-TAB: RISK REGISTER
// =============================================================================

function RiskRegisterContent() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="RISK REGISTER" />
        {RISK_REGISTER.map((risk, idx) => (
          <Pressable
            key={risk.id}
            style={({ pressed }) => [
              s.listRow,
              idx < RISK_REGISTER.length - 1 && s.listRowBorder,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.listRowContent}>
              {/* Title row with severity dot */}
              <View style={s.riskTitleRow}>
                <View style={[s.severityDot, { backgroundColor: severityColor(risk.severity) }]} />
                <ThemedText style={[s.listRowTitle, { color: BP.smoke, flex: 1 }]} numberOfLines={2}>
                  {risk.title}
                </ThemedText>
              </View>

              {/* Category + likelihood/impact */}
              <ThemedText style={[s.listRowMeta, { color: BP.ash }]}>
                {risk.category} \u00B7 Severity: {risk.severity.toUpperCase()} \u00B7 Likelihood: {risk.likelihood}
              </ThemedText>

              {/* Impact */}
              <ThemedText style={[s.listRowMeta, { color: BP.ash }]} numberOfLines={2}>
                Impact: {risk.impact}
              </ThemedText>

              {/* Mitigation */}
              <ThemedText style={[s.mitigationText, { color: BP.platinum }]} numberOfLines={2}>
                Mitigation: {risk.mitigation}
              </ThemedText>

              {/* Owner + status */}
              <View style={s.riskFooter}>
                <ThemedText style={[s.listRowMeta, { color: BP.ash }]}>
                  Owner: {risk.owner}
                </ThemedText>
                <BizStatusChip
                  label={risk.status.toUpperCase()}
                  variant={statusVariant(risk.status === 'mitigated' ? 'done' : risk.status === 'accepted' ? 'active' : risk.status === 'transferred' ? 'active' : risk.status)}
                />
              </View>
            </View>
          </Pressable>
        ))}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SUB-TAB: CONTROLS
// =============================================================================

function ControlsContent() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="CONTROLS" />
        {CONTROLS.map((ctrl, idx) => (
          <Pressable
            key={ctrl.id}
            style={({ pressed }) => [
              s.listRow,
              idx < CONTROLS.length - 1 && s.listRowBorder,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.listRowContent}>
              {/* Header with type badge */}
              <View style={s.controlHeader}>
                <View style={[s.controlTypeBadge, { backgroundColor: controlTypeColor(ctrl.type) + '15' }]}>
                  <ThemedText style={[s.controlTypeBadgeText, { color: controlTypeColor(ctrl.type) }]}>
                    {ctrl.type.toUpperCase()}
                  </ThemedText>
                </View>
                <BizStatusChip
                  label={ctrl.status.toUpperCase().replace('_', ' ')}
                  variant={controlStatusVariant(ctrl.status)}
                />
              </View>

              {/* Title */}
              <ThemedText style={[s.listRowTitle, { color: BP.smoke }]} numberOfLines={2}>
                {ctrl.title}
              </ThemedText>

              {/* Meta */}
              <ThemedText style={[s.listRowMeta, { color: BP.ash }]}>
                Frequency: {ctrl.frequency} \u00B7 Last tested: {formatDate(ctrl.lastTested)}
              </ThemedText>
              <ThemedText style={[s.listRowMeta, { color: BP.ash }]}>
                Owner: {ctrl.owner}
              </ThemedText>
            </View>
          </Pressable>
        ))}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SUB-TAB: AUDITS
// =============================================================================

function AuditsContent() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="AUDIT RECORDS" />
        {AUDIT_RECORDS.map((audit, idx) => (
          <Pressable
            key={audit.id}
            style={({ pressed }) => [
              s.listRow,
              idx < AUDIT_RECORDS.length - 1 && s.listRowBorder,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.listRowContent}>
              {/* Header: type badge + status */}
              <View style={s.auditHeader}>
                <View style={[s.typeBadge, { backgroundColor: BP.glass }]}>
                  <ThemedText style={[s.typeBadgeText, { color: BP.champagneGold }]}>
                    {audit.type.toUpperCase().replace('_', ' ')}
                  </ThemedText>
                </View>
                <BizStatusChip
                  label={audit.status.toUpperCase().replace('_', ' ')}
                  variant={auditStatusVariant(audit.status)}
                />
              </View>

              {/* Title */}
              <ThemedText style={[s.listRowTitle, { color: BP.smoke }]} numberOfLines={2}>
                {audit.title}
              </ThemedText>

              {/* Date + auditor */}
              <ThemedText style={[s.listRowMeta, { color: BP.ash }]}>
                Date: {formatDate(audit.date)} \u00B7 Auditor: {audit.auditor}
              </ThemedText>

              {/* Findings */}
              <View style={s.findingsRow}>
                <ThemedText style={[s.findingsText, { color: BP.ash }]}>
                  Findings: {audit.findings}
                </ThemedText>
                {audit.criticalFindings > 0 && (
                  <View style={[s.criticalBadge, { backgroundColor: BP.red + '15' }]}>
                    <ThemedText style={[s.criticalBadgeText, { color: BP.red }]}>
                      {audit.criticalFindings} CRITICAL
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        ))}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SUB-TAB: INCIDENTS
// =============================================================================

function IncidentsContent() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="INCIDENTS" />
        {INCIDENTS.map((inc, idx) => (
          <Pressable
            key={inc.id}
            style={({ pressed }) => [
              s.listRow,
              idx < INCIDENTS.length - 1 && s.listRowBorder,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.listRowContent}>
              {/* Title row with severity dot */}
              <View style={s.riskTitleRow}>
                <View style={[s.severityDot, { backgroundColor: severityColor(inc.severity) }]} />
                <ThemedText style={[s.listRowTitle, { color: BP.smoke, flex: 1 }]} numberOfLines={2}>
                  {inc.title}
                </ThemedText>
              </View>

              {/* Meta */}
              <ThemedText style={[s.listRowMeta, { color: BP.ash }]}>
                {formatDate(inc.date)} \u00B7 {inc.category}
              </ThemedText>
              <ThemedText style={[s.listRowMeta, { color: BP.ash }]}>
                Assignee: {inc.assignee}
              </ThemedText>

              {/* Status */}
              <View style={{ marginTop: Spacing.xs }}>
                <BizStatusChip
                  label={inc.status.toUpperCase()}
                  variant={statusVariant(inc.status === 'investigating' ? 'in_review' : inc.status === 'resolved' ? 'done' : inc.status === 'closed' ? 'done' : inc.status)}
                />
              </View>
            </View>
          </Pressable>
        ))}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SUB-TAB: EXCEPTIONS
// =============================================================================

function ExceptionsContent() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="COMPLIANCE EXCEPTIONS" />
        {COMPLIANCE_EXCEPTIONS.map((exc, idx) => (
          <Pressable
            key={exc.id}
            style={({ pressed }) => [
              s.listRow,
              idx < COMPLIANCE_EXCEPTIONS.length - 1 && s.listRowBorder,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.listRowContent}>
              {/* Title */}
              <ThemedText style={[s.listRowTitle, { color: BP.smoke }]} numberOfLines={2}>
                {exc.title}
              </ThemedText>

              {/* Type badge + status */}
              <View style={s.exceptionHeader}>
                <View style={[s.typeBadge, { backgroundColor: BP.glass }]}>
                  <ThemedText style={[s.typeBadgeText, { color: BP.platinum }]}>
                    {exc.type.toUpperCase()}
                  </ThemedText>
                </View>
                <BizStatusChip
                  label={exc.status.toUpperCase()}
                  variant={statusVariant(exc.status === 'denied' ? 'rejected' : exc.status)}
                />
              </View>

              {/* Requested / Approved */}
              <ThemedText style={[s.listRowMeta, { color: BP.ash }]}>
                Requested by: {exc.requestedBy}
                {exc.approvedBy ? ` \u00B7 Approved by: ${exc.approvedBy}` : ''}
              </ThemedText>

              {/* Valid until */}
              <ThemedText style={[s.listRowMeta, { color: BP.ash }]}>
                Valid until: {formatDate(exc.validUntil)}
              </ThemedText>

              {/* Reason */}
              <ThemedText style={[s.reasonText, { color: BP.platinum }]} numberOfLines={3}>
                {exc.reason}
              </ThemedText>
            </View>
          </Pressable>
        ))}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SUB-TAB: EXPORTS
// =============================================================================

function ExportsContent() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="EXPORTED REPORTS" />
        {EXPORT_RECORDS.map((exp, idx) => (
          <Pressable
            key={exp.id}
            style={({ pressed }) => [
              s.listRow,
              idx < EXPORT_RECORDS.length - 1 && s.listRowBorder,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.listRowLeft}>
              {/* Download icon */}
              <View style={[s.exportIconWrap, { backgroundColor: BP.glass }]}>
                <IconSymbol name="arrow.down.circle.fill" size={20} color={BP.champagneGold} />
              </View>

              {/* Content */}
              <View style={s.listRowContent}>
                <ThemedText style={[s.listRowTitle, { color: BP.smoke }]} numberOfLines={2}>
                  {exp.title}
                </ThemedText>

                {/* Type badge + format pill */}
                <View style={s.exportBadgeRow}>
                  <View style={[s.typeBadge, { backgroundColor: BP.glass }]}>
                    <ThemedText style={[s.typeBadgeText, { color: BP.champagneGold }]}>
                      {exportTypeLabel(exp.type)}
                    </ThemedText>
                  </View>
                  <View style={[s.formatPill, { backgroundColor: BP.emerald + '15' }]}>
                    <ThemedText style={[s.formatPillText, { color: BP.emerald }]}>
                      {exp.format}
                    </ThemedText>
                  </View>
                </View>

                {/* Date + size */}
                <ThemedText style={[s.listRowMeta, { color: BP.ash }]}>
                  Generated: {formatDate(exp.generatedAt)} \u00B7 {exp.size}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        ))}
      </BizCard>

      {/* Generate new export CTA */}
      <Pressable
        style={({ pressed }) => [
          s.generateCTA,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      >
        <IconSymbol name="plus.circle.fill" size={18} color={BP.champagneGold} />
        <ThemedText style={[s.generateCTAText, { color: BP.champagneGold }]}>
          Generate New Export
        </ThemedText>
      </Pressable>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BusinessComplianceLegal({ colors, role = 'B1' }: Props) {
  const allowedTabs = getAllowedTabs(role);
  const [activeTab, setActiveTab] = useState<ComplianceSubTab>(
    allowedTabs.length > 0 ? allowedTabs[0].id : 'overview',
  );

  // B2a / B3+ — locked out
  if (allowedTabs.length === 0) {
    return (
      <ScrollView
        style={[s.container, { backgroundColor: colors.background }]}
        contentContainerStyle={s.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <EntityScopeBar
          entityId={DEFAULT_ENTITY.id}
          entityName={DEFAULT_ENTITY.name}
          entityType={DEFAULT_ENTITY.type}
          status={DEFAULT_ENTITY.status}
          colors={colors}
        />
        <BizEmptyLock
          title="Compliance & Legal"
          message="This section is restricted to authorized roles. Contact the Founder or Board for access."
        />
        <View style={s.bottomSpacer} />
      </ScrollView>
    );
  }

  // Render active sub-tab content
  function renderContent() {
    switch (activeTab) {
      case 'overview':
        return <OverviewContent />;
      case 'legal_docs':
        return <LegalDocsContent />;
      case 'policies':
        return <PoliciesContent />;
      case 'risk_register':
        return <RiskRegisterContent />;
      case 'controls':
        return <ControlsContent />;
      case 'audits':
        return <AuditsContent />;
      case 'incidents':
        return <IncidentsContent />;
      case 'exceptions':
        return <ExceptionsContent />;
      case 'exports':
        return <ExportsContent />;
      default:
        return null;
    }
  }

  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Entity scope bar */}
      <EntityScopeBar
        entityId={DEFAULT_ENTITY.id}
        entityName={DEFAULT_ENTITY.name}
        entityType={DEFAULT_ENTITY.type}
        status={DEFAULT_ENTITY.status}
        colors={colors}
      />

      {/* Sub-tab bar */}
      <BizSubTabBar
        tabs={allowedTabs}
        activeId={activeTab}
        onSelect={(id) => setActiveTab(id as ComplianceSubTab)}
      />

      {/* Content */}
      {renderContent()}

      {/* Bottom spacer */}
      <View style={s.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  bottomSpacer: {
    height: 120,
  },

  // Overview — Score
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  scoreNumber: {
    fontSize: 56,
    fontWeight: '800',
    lineHeight: 64,
  },
  scoreMetaCol: {
    gap: Spacing.xs,
  },
  scoreMeta: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },

  // Overview — Health indicators
  healthGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  healthItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  healthValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  healthLabel: {
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  // Overview — Summary
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  summaryChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  summaryChipValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  summaryChipLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  // List rows (shared across sub-tabs)
  listRow: {
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  listRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  listRowLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    flex: 1,
  },
  listRowContent: {
    flex: 1,
    gap: 3,
  },
  listRowTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
  listRowMeta: {
    fontSize: 12,
    lineHeight: 16,
  },

  // Type badge
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Policies — version badge
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  versionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  versionBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Risk Register
  riskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  mitigationText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
    marginTop: 2,
  },
  riskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },

  // Controls
  controlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  controlTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  controlTypeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Audits
  auditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  findingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  findingsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  criticalBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  criticalBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Exceptions
  exceptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  reasonText: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },

  // Exports
  exportIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  formatPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  formatPillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  generateCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: BP.carbon,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: BP.graphite,
    borderStyle: 'dashed',
    marginBottom: Spacing.md,
  },
  generateCTAText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
