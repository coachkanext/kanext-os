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
      return '#F59E0B';
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

type LegalDocCategory = 'Corporate' | 'IP & Trademark' | 'Employment' | 'Privacy' | 'Regulatory' | 'Contracts' | 'Other';

/** Map each legal doc to a category based on content */
function getLegalDocCategory(doc: LegalDoc): LegalDocCategory {
  const t = doc.title.toLowerCase();
  if (t.includes('incorporation') || t.includes('ein') || t.includes('franchise')) return 'Corporate';
  if (t.includes('trademark') || t.includes('ip') || t.includes('patent')) return 'IP & Trademark';
  if (t.includes('advisor') || t.includes('employment') || t.includes('nda')) return 'Employment';
  if (t.includes('privacy') || t.includes('consent') || t.includes('gdpr')) return 'Privacy';
  if (t.includes('regulatory') || t.includes('kyc') || t.includes('aml')) return 'Regulatory';
  if (t.includes('agreement') || t.includes('safe') || t.includes('contract') || t.includes('license') || t.includes('partnership')) return 'Contracts';
  return 'Other';
}

const LEGAL_DOC_CATEGORIES: LegalDocCategory[] = [
  'Corporate', 'IP & Trademark', 'Employment', 'Privacy', 'Regulatory', 'Contracts', 'Other',
];

function LegalDocsContent() {
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});

  const toggleCat = (cat: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCollapsedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  /** Group docs by category */
  const grouped = LEGAL_DOC_CATEGORIES.reduce<Record<LegalDocCategory, LegalDoc[]>>((acc, cat) => {
    acc[cat] = LEGAL_DOCS.filter((doc) => getLegalDocCategory(doc) === cat);
    return acc;
  }, {} as Record<LegalDocCategory, LegalDoc[]>);

  return (
    <View>
      <BizCard>
        <BizCardTitle text="LEGAL DOCUMENTS" />
        {LEGAL_DOC_CATEGORIES.map((cat) => {
          const docs = grouped[cat];
          if (docs.length === 0) return null;
          const isCollapsed = !!collapsedCats[cat];

          return (
            <View key={cat}>
              {/* Category header */}
              <Pressable
                style={s.legalCatHeader}
                onPress={() => toggleCat(cat)}
              >
                <IconSymbol
                  name={isCollapsed ? 'chevron.right' : 'chevron.down'}
                  size={12}
                  color={BP.champagneGold}
                />
                <ThemedText style={[s.legalCatTitle, { color: BP.champagneGold }]}>
                  {cat}
                </ThemedText>
                <View style={[s.legalCatCount, { backgroundColor: BP.glass }]}>
                  <ThemedText style={[s.legalCatCountText, { color: BP.ash }]}>
                    {docs.length}
                  </ThemedText>
                </View>
              </Pressable>

              {/* Docs (collapsible) */}
              {!isCollapsed && docs.map((doc, idx) => (
                <Pressable
                  key={doc.id}
                  style={({ pressed }) => [
                    s.listRow,
                    idx < docs.length - 1 && s.listRowBorder,
                    { opacity: pressed ? 0.7 : 1, paddingLeft: Spacing.lg },
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
            </View>
          );
        })}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SUB-TAB: POLICIES
// =============================================================================

/** Mock attestation data per policy */
const POLICY_ATTESTATION: Record<string, { attested: number; total: number; outstanding: number; lastAttested: string }> = {
  'pol-1': { attested: 12, total: 15, outstanding: 3, lastAttested: '2026-02-10' },
  'pol-2': { attested: 8, total: 10, outstanding: 2, lastAttested: '2026-01-28' },
  'pol-3': { attested: 5, total: 15, outstanding: 10, lastAttested: '2026-01-15' },
  'pol-4': { attested: 4, total: 4, outstanding: 0, lastAttested: '2026-02-12' },
  'pol-5': { attested: 0, total: 12, outstanding: 12, lastAttested: '' },
};

function PoliciesContent() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="POLICIES" />
        {POLICIES.map((pol, idx) => {
          const att = POLICY_ATTESTATION[pol.id];

          return (
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

                {/* Attestation tracking */}
                {att && (
                  <View style={s.attestationRow}>
                    <View style={s.attestationItem}>
                      <IconSymbol name="checkmark.circle.fill" size={11} color={att.attested === att.total ? BP.emerald : BP.amber} />
                      <ThemedText style={[s.attestationText, { color: BP.ash }]}>
                        {att.attested}/{att.total} attested
                      </ThemedText>
                    </View>
                    {att.outstanding > 0 && (
                      <View style={s.attestationItem}>
                        <IconSymbol name="exclamationmark.circle.fill" size={11} color={BP.amber} />
                        <ThemedText style={[s.attestationText, { color: BP.amber }]}>
                          {att.outstanding} outstanding
                        </ThemedText>
                      </View>
                    )}
                    {att.lastAttested ? (
                      <ThemedText style={[s.attestationText, { color: BP.ash }]}>
                        Last: {formatDate(att.lastAttested)}
                      </ThemedText>
                    ) : null}
                  </View>
                )}

                <View style={{ marginTop: Spacing.xs }}>
                  <BizStatusChip
                    label={pol.status.toUpperCase().replace('_', ' ')}
                    variant={statusVariant(pol.status === 'under_review' ? 'in_review' : pol.status)}
                  />
                </View>
              </View>
            </Pressable>
          );
        })}
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

/** Mock evidence data per control */
const CONTROL_EVIDENCE: Record<string, { requirement: string; evidenceStatus: 'present' | 'missing' | 'overdue' }> = {
  'ctrl-1': { requirement: 'Quarterly cap table export with auditor sign-off', evidenceStatus: 'present' },
  'ctrl-2': { requirement: 'KYC verification receipt per transaction batch', evidenceStatus: 'missing' },
  'ctrl-3': { requirement: 'Signed board resolution document per approval', evidenceStatus: 'present' },
  'ctrl-4': { requirement: 'Access log exports from data infrastructure', evidenceStatus: 'present' },
  'ctrl-5': { requirement: 'Documented incident response drill report', evidenceStatus: 'overdue' },
};

function evidenceStatusColor(status: 'present' | 'missing' | 'overdue'): string {
  switch (status) {
    case 'present': return BP.emerald;
    case 'missing': return BP.red;
    case 'overdue': return BP.amber;
  }
}

function evidenceStatusLabel(status: 'present' | 'missing' | 'overdue'): string {
  switch (status) {
    case 'present': return 'Present';
    case 'missing': return 'Missing';
    case 'overdue': return 'Overdue';
  }
}

function ControlsContent() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="CONTROLS" />
        {CONTROLS.map((ctrl, idx) => {
          const evidence = CONTROL_EVIDENCE[ctrl.id];

          return (
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

                {/* Evidence fields */}
                {evidence && (
                  <View style={s.evidenceRow}>
                    <ThemedText style={[s.evidenceReqText, { color: BP.platinum }]} numberOfLines={2}>
                      Evidence: {evidence.requirement}
                    </ThemedText>
                    <View style={[s.evidenceBadge, { backgroundColor: evidenceStatusColor(evidence.evidenceStatus) + '15' }]}>
                      <ThemedText style={[s.evidenceBadgeText, { color: evidenceStatusColor(evidence.evidenceStatus) }]}>
                        {evidenceStatusLabel(evidence.evidenceStatus)}
                      </ThemedText>
                    </View>
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SUB-TAB: AUDITS
// =============================================================================

/** Mock findings per audit */
interface AuditFinding {
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  remediation: 'Open' | 'In Progress' | 'Resolved';
}

const AUDIT_FINDINGS: Record<string, AuditFinding[]> = {
  'aud-1': [
    { title: 'KYC documentation gaps for Mercury sub-account', severity: 'Critical', remediation: 'In Progress' },
    { title: 'Missing board resolution for SAFE amendment', severity: 'High', remediation: 'Open' },
    { title: 'Expired NDA with legacy vendor', severity: 'Medium', remediation: 'Resolved' },
    { title: 'Incomplete data retention schedule', severity: 'Medium', remediation: 'In Progress' },
    { title: 'Minor capitalization table formatting error', severity: 'Low', remediation: 'Resolved' },
  ],
  'aud-2': [],
  'aud-3': [],
  'aud-4': [
    { title: 'Cookie consent banner missing on mobile web', severity: 'High', remediation: 'Open' },
    { title: 'User data export does not include analytics logs', severity: 'Medium', remediation: 'In Progress' },
    { title: 'Privacy policy version out of date in footer', severity: 'Low', remediation: 'Open' },
  ],
};

function findingSeverityColor(sev: string): string {
  switch (sev) {
    case 'Critical': return BP.red;
    case 'High': return '#F59E0B';
    case 'Medium': return BP.amber;
    case 'Low': return BP.emerald;
    default: return BP.ash;
  }
}

function findingRemediationVariant(status: string): 'error' | 'warning' | 'success' {
  switch (status) {
    case 'Open': return 'error';
    case 'In Progress': return 'warning';
    case 'Resolved': return 'success';
    default: return 'error';
  }
}

function AuditsContent() {
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null);

  return (
    <View>
      <BizCard>
        <BizCardTitle text="AUDIT RECORDS" />
        {AUDIT_RECORDS.map((audit, idx) => {
          const findings = AUDIT_FINDINGS[audit.id] ?? [];
          const isExpanded = expandedAudit === audit.id;

          return (
            <Pressable
              key={audit.id}
              style={({ pressed }) => [
                s.listRow,
                idx < AUDIT_RECORDS.length - 1 && s.listRowBorder,
                { opacity: pressed ? 0.7 : 1, flexDirection: 'column' as const },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setExpandedAudit(isExpanded ? null : audit.id);
              }}
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

                {/* Findings count */}
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
                  {findings.length > 0 && (
                    <IconSymbol
                      name={isExpanded ? 'chevron.up' : 'chevron.down'}
                      size={11}
                      color={BP.ash}
                    />
                  )}
                </View>
              </View>

              {/* Expandable findings list */}
              {isExpanded && findings.length > 0 && (
                <View style={s.findingsList}>
                  {findings.map((f, fIdx) => (
                    <View key={fIdx} style={[s.findingItem, fIdx < findings.length - 1 && s.findingItemBorder]}>
                      <View style={s.findingTitleRow}>
                        <View style={[s.findingSevDot, { backgroundColor: findingSeverityColor(f.severity) }]} />
                        <ThemedText style={[s.findingTitle, { color: BP.smoke }]} numberOfLines={2}>
                          {f.title}
                        </ThemedText>
                      </View>
                      <View style={s.findingMetaRow}>
                        <View style={[s.findingSevBadge, { backgroundColor: findingSeverityColor(f.severity) + '15' }]}>
                          <ThemedText style={[s.findingSevBadgeText, { color: findingSeverityColor(f.severity) }]}>
                            {f.severity.toUpperCase()}
                          </ThemedText>
                        </View>
                        <BizStatusChip
                          label={f.remediation.toUpperCase()}
                          variant={findingRemediationVariant(f.remediation)}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </Pressable>
          );
        })}
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
        {INCIDENTS.map((inc, idx) => {
          const isClosed = inc.status === 'closed';

          return (
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
                  {/* Immutability lock for closed incidents */}
                  {isClosed && (
                    <View style={s.lockBadge}>
                      <IconSymbol name="lock.fill" size={12} color={BP.ash} />
                    </View>
                  )}
                </View>

                {/* Meta */}
                <ThemedText style={[s.listRowMeta, { color: BP.ash }]}>
                  {formatDate(inc.date)} \u00B7 {inc.category}
                </ThemedText>
                <ThemedText style={[s.listRowMeta, { color: BP.ash }]}>
                  Assignee: {inc.assignee}
                </ThemedText>

                {/* Status + immutability label */}
                <View style={s.incidentStatusRow}>
                  <BizStatusChip
                    label={inc.status.toUpperCase()}
                    variant={statusVariant(inc.status === 'investigating' ? 'in_review' : inc.status === 'resolved' ? 'done' : inc.status === 'closed' ? 'done' : inc.status)}
                  />
                  {isClosed && (
                    <ThemedText style={[s.immutableLabel, { color: BP.ash }]}>
                      Immutable Record
                    </ThemedText>
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}
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

      {/* Submit Exception Request CTA */}
      <Pressable
        style={({ pressed }) => [
          s.generateCTA,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      >
        <IconSymbol name="plus.circle.fill" size={18} color={BP.champagneGold} />
        <ThemedText style={[s.generateCTAText, { color: BP.champagneGold }]}>
          Submit Exception Request
        </ThemedText>
      </Pressable>
    </View>
  );
}

// =============================================================================
// SUB-TAB: EXPORTS
// =============================================================================

/** Export packet builder — named packets with checklist items */
const EXPORT_PACKETS: { name: string; items: string[] }[] = [
  { name: 'Full Compliance Pack', items: ['Risk Register Matrix', 'All Active Policies', 'Controls Evidence Log', 'Audit History'] },
  { name: 'Board Summary', items: ['Compliance Score Card', 'Open Incidents Summary', 'Key Risk Highlights'] },
  { name: 'Regulatory Filing', items: ['Delaware Franchise Tax Docs', 'KYC/AML Compliance Report', 'Data Privacy Assessment', 'Incident Disclosures'] },
  { name: 'Audit Response', items: ['Findings Remediation Status', 'Evidence Attachments', 'Control Test Results'] },
];

function ExportsContent() {
  const [packetChecks, setPacketChecks] = useState<Record<string, Record<number, boolean>>>({});

  const togglePacketItem = (packetName: string, itemIdx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPacketChecks((prev) => ({
      ...prev,
      [packetName]: {
        ...(prev[packetName] ?? {}),
        [itemIdx]: !(prev[packetName]?.[itemIdx]),
      },
    }));
  };

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

      {/* Packet Builder */}
      <BizCard>
        <BizCardTitle text="PACKET BUILDER" />
        {EXPORT_PACKETS.map((packet) => (
          <View key={packet.name} style={s.packetBuilderSection}>
            <ThemedText style={[s.packetBuilderName, { color: BP.smoke }]}>
              {packet.name}
            </ThemedText>
            {packet.items.map((item, itemIdx) => {
              const checked = !!packetChecks[packet.name]?.[itemIdx];
              return (
                <Pressable
                  key={itemIdx}
                  style={s.packetBuilderItem}
                  onPress={() => togglePacketItem(packet.name, itemIdx)}
                >
                  <IconSymbol
                    name={checked ? 'checkmark.square.fill' : 'square'}
                    size={16}
                    color={checked ? BP.champagneGold : BP.ash}
                  />
                  <ThemedText style={[s.packetBuilderItemText, { color: checked ? BP.smoke : BP.ash }]}>
                    {item}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
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

  // Legal Docs — category grouping
  legalCatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  legalCatTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    flex: 1,
  },
  legalCatCount: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  legalCatCountText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Policies — attestation tracking
  attestationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    flexWrap: 'wrap',
  },
  attestationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  attestationText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Controls — evidence fields
  evidenceRow: {
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  evidenceReqText: {
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  evidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  evidenceBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // Audits — expandable findings
  findingsList: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BP.graphite,
    width: '100%',
  },
  findingItem: {
    paddingVertical: Spacing.xs,
  },
  findingItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  findingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  findingSevDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  findingTitle: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    lineHeight: 16,
  },
  findingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingLeft: 20,
  },
  findingSevBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  findingSevBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // Incidents — immutability lock
  lockBadge: {
    marginLeft: Spacing.xs,
  },
  incidentStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  immutableLabel: {
    fontSize: 10,
    fontWeight: '600',
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },

  // Exports — packet builder
  packetBuilderSection: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  packetBuilderName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  packetBuilderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 4,
    paddingLeft: Spacing.xs,
  },
  packetBuilderItemText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
