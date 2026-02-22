/**
 * Education Organization Sponsors V2 — 10-view sub-tab hub.
 * Sub-tabs: Overview | Sponsors | Pipeline | Agreements | Deliverables |
 *           Proof | Payments | Risk / Compliance | Contacts | Reports
 * RBAC:
 *   E5 (Public): limited — only curated "Partners" view if enabled
 *   E4 (Student): locked
 *   E3 (Faculty/Staff): limited — view dept sponsors + own deliverables (Sponsors read-only + Deliverables)
 *   E1/E2 (President/Dean): full access
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { EducationRoleLens } from '@/utils/education-rbac';
import { isDeanLevel, isFacultyLevel } from '@/utils/education-rbac';
import {
  getEduSponsorsData,
  SPONSOR_TYPE_LABELS,
  SPONSOR_TYPE_COLORS,
  SPONSOR_SCOPE_LABELS,
  SPONSOR_SCOPE_COLORS,
  SPONSOR_STATUS_LABELS,
  SPONSOR_STATUS_COLORS,
  PIPELINE_STAGE_LABELS,
  PIPELINE_STAGE_COLORS,
  AGREEMENT_TYPE_LABELS,
  AGREEMENT_STATUS_LABELS,
  AGREEMENT_STATUS_COLORS,
  DELIVERABLE_STATUS_LABELS,
  DELIVERABLE_STATUS_COLORS,
  PROOF_TYPE_LABELS,
  PROOF_STATUS_LABELS,
  PROOF_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  RISK_CATEGORY_LABELS,
  RISK_STATUS_LABELS,
  RISK_STATUS_COLORS,
  RISK_SEVERITY_COLORS,
} from '@/data/mock-edu-org-sponsors-v2';
import type {
  Sponsor,
  PipelineItem,
  SponsorAgreement,
  Deliverable,
  DeliverableProof,
  SponsorPayment,
  SponsorRisk,
  SponsorContact,
  SponsorReport,
} from '@/data/mock-edu-org-sponsors-v2';

// =============================================================================
// CONSTANTS
// =============================================================================

const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'sponsors', label: 'Sponsors' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'agreements', label: 'Agreements' },
  { id: 'deliverables', label: 'Deliverables' },
  { id: 'proof', label: 'Proof' },
  { id: 'payments', label: 'Payments' },
  { id: 'risk-compliance', label: 'Risk / Compliance' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'reports', label: 'Reports' },
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

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`;
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
  data: ReturnType<typeof getEduSponsorsData>;
}) {
  const { kpiStrip, priorities, sponsors } = data;

  // Health board — derive from sponsors with riskLevel
  const healthBoard = sponsors
    .filter((sp) => sp.riskLevel)
    .sort((a, b) => {
      const rOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return (rOrder[a.riskLevel || 'low'] ?? 3) - (rOrder[b.riskLevel || 'low'] ?? 3);
    });

  const riskColor = (level: string): string => {
    switch (level) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#22C55E';
      default: return '#A1A1AA';
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* KPI Strip — 6 metrics */}
      <View style={s.kpiGrid}>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: colors.text }]}>{kpiStrip.activeSponsors}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Active Sponsors</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: colors.text }]}>{formatCurrency(kpiStrip.pipelineValue)}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Pipeline Value</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: kpiStrip.deliverablesDueSoon > 3 ? '#F59E0B' : '#22C55E' }]}>{kpiStrip.deliverablesDueSoon}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Due Soon</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: kpiStrip.atRiskAgreements > 0 ? '#EF4444' : '#22C55E' }]}>{kpiStrip.atRiskAgreements}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>At Risk</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: kpiStrip.latePayments > 0 ? '#EF4444' : '#22C55E' }]}>{kpiStrip.latePayments}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Late Payments</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: accentColor }]}>{kpiStrip.proofCompleteness}%</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Proof Complete</ThemedText>
        </View>
      </View>

      {/* Proof Completeness Bar */}
      <View style={[s.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.sectionCardHeader}>
          <IconSymbol name="checkmark.shield.fill" size={16} color={accentColor} />
          <ThemedText style={[s.sectionCardTitle, { color: colors.text }]}>Proof Completeness</ThemedText>
          <ThemedText style={[s.percentLabel, { color: accentColor }]}>{kpiStrip.proofCompleteness}%</ThemedText>
        </View>
        <ProgressBar percent={kpiStrip.proofCompleteness} color={accentColor} />
      </View>

      {/* This Month's Priorities */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        This Month's Priorities
      </ThemedText>
      {priorities.map((pri, idx) => {
        const urgencyColor = pri.urgency === 'critical' ? '#EF4444' : pri.urgency === 'high' ? '#F59E0B' : '#22C55E';
        return (
          <View
            key={pri.id}
            style={[s.actionRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[s.actionRank, { backgroundColor: urgencyColor + '18' }]}>
              <ThemedText style={[s.actionRankText, { color: urgencyColor }]}>{idx + 1}</ThemedText>
            </View>
            <View style={s.actionTextCol}>
              <ThemedText style={[s.actionText, { color: colors.text }]} numberOfLines={2}>
                {pri.title}
              </ThemedText>
              <ThemedText style={[s.actionDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {pri.description}
              </ThemedText>
            </View>
            <StatusBadge label={pri.urgency.toUpperCase()} color={urgencyColor} />
          </View>
        );
      })}

      {/* Sponsor Health Board */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Sponsor Health Board
      </ThemedText>
      {healthBoard.map((sp) => {
        const typeColor = SPONSOR_TYPE_COLORS[sp.type];
        const typeLabel = SPONSOR_TYPE_LABELS[sp.type];
        const statusColor = SPONSOR_STATUS_COLORS[sp.status];
        const statusLabel = SPONSOR_STATUS_LABELS[sp.status];
        const riskC = riskColor(sp.riskLevel || 'low');
        return (
          <View
            key={sp.id}
            style={[s.healthCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.healthCardTop}>
              <ThemedText style={[s.healthName, { color: colors.text }]} numberOfLines={1}>
                {sp.name}
              </ThemedText>
            </View>
            <View style={s.healthBadgeRow}>
              <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
              <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
              <StatusBadge label={(sp.riskLevel || 'low').toUpperCase()} color={riskC} />
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// SPONSORS SUB-TAB
// =============================================================================

function SponsorsTab({
  colors,
  accentColor,
  sponsors,
  onSelectSponsor,
  readOnly,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  sponsors: Sponsor[];
  onSelectSponsor: (sponsor: Sponsor) => void;
  readOnly: boolean;
}) {
  const renderItem = useCallback(
    ({ item }: { item: Sponsor }) => {
      const typeColor = SPONSOR_TYPE_COLORS[item.type];
      const typeLabel = SPONSOR_TYPE_LABELS[item.type];
      const statusColor = SPONSOR_STATUS_COLORS[item.status];
      const statusLabel = SPONSOR_STATUS_LABELS[item.status];
      const riskC = item.riskLevel === 'high' ? '#EF4444' : item.riskLevel === 'medium' ? '#F59E0B' : '#22C55E';
      return (
        <Pressable
          style={[s.sponsorCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectSponsor(item);
          }}
        >
          <View style={s.sponsorCardTop}>
            <ThemedText style={[s.sponsorName, { color: colors.text }]} numberOfLines={2}>
              {item.name}
            </ThemedText>
          </View>
          <View style={s.sponsorBadgeRow}>
            <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
            {item.scope.map((sc) => (
              <StatusBadge key={sc} label={SPONSOR_SCOPE_LABELS[sc].toUpperCase()} color={SPONSOR_SCOPE_COLORS[sc]} />
            ))}
          </View>
          <View style={[s.sponsorMeta, { borderTopColor: colors.border }]}>
            <View style={s.sponsorMetaItem}>
              <IconSymbol name="banknote.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.sponsorMetaText, { color: colors.textTertiary }]}>
                {readOnly ? '---' : item.valueBand}
              </ThemedText>
            </View>
            <View style={s.sponsorMetaItem}>
              <IconSymbol name="person.2.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.sponsorMetaText, { color: colors.textTertiary }]}>
                {item.contactCount} contact{item.contactCount !== 1 ? 's' : ''}
              </ThemedText>
            </View>
            <View style={s.sponsorMetaItem}>
              <IconSymbol name="doc.text.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.sponsorMetaText, { color: colors.textTertiary }]}>
                {item.agreementCount} agreement{item.agreementCount !== 1 ? 's' : ''}
              </ThemedText>
            </View>
          </View>
          {item.nextDeliverable && (
            <View style={s.sponsorNextRow}>
              <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.sponsorNextText, { color: colors.textSecondary }]} numberOfLines={1}>
                Next: {item.nextDeliverable}
              </ThemedText>
            </View>
          )}
          {item.paymentStatus && (
            <View style={s.sponsorNextRow}>
              <IconSymbol name="dollarsign.circle.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.sponsorNextText, { color: colors.textSecondary }]} numberOfLines={1}>
                Payment: {item.paymentStatus}
              </ThemedText>
            </View>
          )}
          <View style={s.sponsorFooter}>
            <StatusBadge label={`RISK: ${(item.riskLevel || 'low').toUpperCase()}`} color={riskC} />
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectSponsor, readOnly],
  );

  return (
    <FlatList
      data={sponsors}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="person.2.fill" label="No sponsors available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// PIPELINE SUB-TAB
// =============================================================================

function PipelineTab({
  colors,
  accentColor,
  pipeline,
  onSelectDeal,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  pipeline: PipelineItem[];
  onSelectDeal: (deal: PipelineItem) => void;
}) {
  const stageOrder: Record<string, number> = {
    prospect: 0,
    contacted: 1,
    proposal_sent: 2,
    negotiating: 3,
    verbal: 4,
    contract_ready: 5,
    signed: 6,
  };

  const sorted = useMemo(() => {
    return [...pipeline].sort((a, b) => (stageOrder[a.stage] ?? 99) - (stageOrder[b.stage] ?? 99));
  }, [pipeline]);

  const renderItem = useCallback(
    ({ item }: { item: PipelineItem }) => {
      const typeColor = SPONSOR_TYPE_COLORS[item.type];
      const typeLabel = SPONSOR_TYPE_LABELS[item.type];
      const stageColor = PIPELINE_STAGE_COLORS[item.stage];
      const stageLabel = PIPELINE_STAGE_LABELS[item.stage];
      return (
        <Pressable
          style={[s.pipelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectDeal(item);
          }}
        >
          <View style={s.pipelineCardTop}>
            <ThemedText style={[s.pipelineName, { color: colors.text }]} numberOfLines={2}>
              {item.sponsorName}
            </ThemedText>
          </View>
          <View style={s.pipelineBadgeRow}>
            <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
            <StatusBadge label={stageLabel.toUpperCase()} color={stageColor} />
          </View>
          <View style={[s.pipelineDetails, { borderTopColor: colors.border }]}>
            <View style={s.pipelineDetailItem}>
              <ThemedText style={[s.pipelineDetailValue, { color: colors.text }]}>
                {formatCurrency(item.expectedValue)}
              </ThemedText>
              <ThemedText style={[s.pipelineDetailLabel, { color: colors.textSecondary }]}>Expected Value</ThemedText>
            </View>
            <View style={s.pipelineDetailItem}>
              <ThemedText style={[s.pipelineDetailValue, { color: colors.text }]}>
                {item.owner}
              </ThemedText>
              <ThemedText style={[s.pipelineDetailLabel, { color: colors.textSecondary }]}>Owner</ThemedText>
            </View>
          </View>
          <View style={s.pipelineMetaRow}>
            <View style={s.pipelineMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.pipelineMetaText, { color: colors.textTertiary }]}>
                Close: {formatDate(item.targetClose)}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[s.pipelineNextStep, { color: colors.textSecondary }]} numberOfLines={2}>
            Next: {item.nextStep}
          </ThemedText>
          {item.blockers ? (
            <View style={s.pipelineBlockerRow}>
              <IconSymbol name="exclamationmark.triangle.fill" size={11} color="#EF4444" />
              <ThemedText style={[s.pipelineBlockerText, { color: '#EF4444' }]} numberOfLines={2}>
                {item.blockers}
              </ThemedText>
            </View>
          ) : null}
        </Pressable>
      );
    },
    [colors, accentColor, onSelectDeal],
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="chart.bar.fill" label="No pipeline deals" colors={colors} />
      }
    />
  );
}

// =============================================================================
// AGREEMENTS SUB-TAB
// =============================================================================

function AgreementsTab({
  colors,
  accentColor,
  agreements,
  onSelectAgreement,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  agreements: SponsorAgreement[];
  onSelectAgreement: (agreement: SponsorAgreement) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: SponsorAgreement }) => {
      const typeLabel = AGREEMENT_TYPE_LABELS[item.type];
      const statusColor = AGREEMENT_STATUS_COLORS[item.status];
      const statusLabel = AGREEMENT_STATUS_LABELS[item.status];
      const scopeColor = SPONSOR_SCOPE_COLORS[item.scope];
      const scopeLabel = SPONSOR_SCOPE_LABELS[item.scope];
      return (
        <Pressable
          style={[s.agreementCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectAgreement(item);
          }}
        >
          <View style={s.agreementCardTop}>
            <IconSymbol name="doc.text.fill" size={16} color={accentColor} />
            <View style={s.agreementTextCol}>
              <ThemedText style={[s.agreementSponsor, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.sponsorName}
              </ThemedText>
            </View>
          </View>
          <View style={s.agreementBadgeRow}>
            <StatusBadge label={typeLabel.toUpperCase()} color={accentColor} />
            <StatusBadge label={scopeLabel.toUpperCase()} color={scopeColor} />
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
          </View>
          <View style={[s.agreementMeta, { borderTopColor: colors.border }]}>
            <View style={s.agreementMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.agreementMetaText, { color: colors.textTertiary }]}>
                {formatDate(item.startDate)} — {formatDate(item.endDate)}
              </ThemedText>
            </View>
            <View style={s.agreementMetaItem}>
              <IconSymbol name="dollarsign.circle.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.agreementMetaText, { color: colors.textTertiary }]}>
                {formatCurrency(item.totalValue)}
              </ThemedText>
            </View>
          </View>
          <View style={s.agreementFooter}>
            <View style={s.agreementMetaItem}>
              <IconSymbol name="checklist" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.agreementMetaText, { color: colors.textTertiary }]}>
                {item.deliverableCount} deliverable{item.deliverableCount !== 1 ? 's' : ''}
              </ThemedText>
            </View>
            <View style={s.agreementMetaItem}>
              <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.agreementMetaText, { color: colors.textTertiary }]}>
                {item.paymentSchedule}
              </ThemedText>
            </View>
            {item.complianceReview && (
              <View style={s.agreementMetaItem}>
                <IconSymbol name="checkmark.shield.fill" size={11} color="#F59E0B" />
                <ThemedText style={[s.agreementMetaText, { color: colors.textTertiary }]}>
                  Compliance
                </ThemedText>
              </View>
            )}
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectAgreement],
  );

  return (
    <FlatList
      data={agreements}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="doc.text.fill" label="No agreements" colors={colors} />
      }
    />
  );
}

// =============================================================================
// DELIVERABLES SUB-TAB
// =============================================================================

function DeliverablesTab({
  colors,
  accentColor,
  deliverables,
  onSelectDeliverable,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  deliverables: Deliverable[];
  onSelectDeliverable: (deliverable: Deliverable) => void;
}) {
  // Sort by due date — soonest first
  const sorted = useMemo(() => {
    return [...deliverables].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [deliverables]);

  const renderItem = useCallback(
    ({ item }: { item: Deliverable }) => {
      const statusColor = DELIVERABLE_STATUS_COLORS[item.status];
      const statusLabel = DELIVERABLE_STATUS_LABELS[item.status];
      const scopeColor = SPONSOR_SCOPE_COLORS[item.scope];
      const scopeLabel = SPONSOR_SCOPE_LABELS[item.scope];
      return (
        <Pressable
          style={[s.deliverableCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectDeliverable(item);
          }}
        >
          <ThemedText style={[s.deliverableTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </ThemedText>
          <View style={s.deliverableBadgeRow}>
            <StatusBadge label={scopeLabel.toUpperCase()} color={scopeColor} />
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
            {item.proofRequired && (
              <StatusBadge label="PROOF REQ" color="#1D9BF0" />
            )}
          </View>
          <View style={[s.deliverableMeta, { borderTopColor: colors.border }]}>
            <View style={s.deliverableMetaItem}>
              <IconSymbol name="building.2.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.deliverableMetaText, { color: colors.textTertiary }]} numberOfLines={1}>
                {item.sponsorName}
              </ThemedText>
            </View>
            <View style={s.deliverableMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.deliverableMetaText, { color: colors.textTertiary }]}>
                Due {formatDate(item.dueDate)}
              </ThemedText>
            </View>
            <View style={s.deliverableMetaItem}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.deliverableMetaText, { color: colors.textTertiary }]} numberOfLines={1}>
                {item.owner}
              </ThemedText>
            </View>
          </View>
          {item.riskIfMissed ? (
            <View style={s.deliverableRiskRow}>
              <IconSymbol name="exclamationmark.triangle.fill" size={11} color="#EF4444" />
              <ThemedText style={[s.deliverableRiskText, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.riskIfMissed}
              </ThemedText>
            </View>
          ) : null}
        </Pressable>
      );
    },
    [colors, accentColor, onSelectDeliverable],
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="checklist" label="No deliverables" colors={colors} />
      }
    />
  );
}

// =============================================================================
// PROOF SUB-TAB
// =============================================================================

function ProofTab({
  colors,
  accentColor,
  proofs,
  role,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  proofs: DeliverableProof[];
  role: EducationRoleLens;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Evidence Library</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Proof items linked to deliverables and agreements
      </ThemedText>

      {proofs.map((proof) => {
        const typeLabel = PROOF_TYPE_LABELS[proof.type];
        const statusColor = PROOF_STATUS_COLORS[proof.status];
        const statusLabel = PROOF_STATUS_LABELS[proof.status];
        const typeColor = proof.type === 'photo' ? '#1D9BF0' : proof.type === 'video' ? '#1D9BF0' : proof.type === 'pdf' ? '#EF4444' : proof.type === 'screenshot' ? '#22C55E' : '#F59E0B';
        return (
          <View
            key={proof.id}
            style={[s.proofCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.proofCardTop}>
              <IconSymbol
                name={proof.type === 'photo' ? 'photo.fill' as any : proof.type === 'video' ? 'video.fill' as any : proof.type === 'pdf' ? 'doc.fill' as any : proof.type === 'screenshot' ? 'camera.fill' as any : 'list.clipboard.fill' as any}
                size={16}
                color={typeColor}
              />
              <View style={s.proofTextCol}>
                <ThemedText style={[s.proofDeliverable, { color: colors.text }]} numberOfLines={1}>
                  Deliverable: {proof.deliverableId}
                </ThemedText>
              </View>
            </View>
            <View style={s.proofBadgeRow}>
              <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
              <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
            </View>
            <View style={[s.proofMeta, { borderTopColor: colors.border }]}>
              {proof.submittedBy ? (
                <View style={s.proofMetaItem}>
                  <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.proofMetaText, { color: colors.textTertiary }]}>
                    {proof.submittedBy}
                  </ThemedText>
                </View>
              ) : null}
              {proof.submittedDate ? (
                <View style={s.proofMetaItem}>
                  <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.proofMetaText, { color: colors.textTertiary }]}>
                    {formatDate(proof.submittedDate)}
                  </ThemedText>
                </View>
              ) : null}
              {proof.verifiedBy ? (
                <View style={s.proofMetaItem}>
                  <IconSymbol name="checkmark.seal.fill" size={11} color="#22C55E" />
                  <ThemedText style={[s.proofMetaText, { color: colors.textTertiary }]}>
                    {proof.verifiedBy} — {proof.verifiedDate ? formatDate(proof.verifiedDate) : '--'}
                  </ThemedText>
                </View>
              ) : null}
            </View>
            {proof.notes ? (
              <ThemedText style={[s.proofNotes, { color: colors.textSecondary }]} numberOfLines={2}>
                {proof.notes}
              </ThemedText>
            ) : null}

            {/* Role-gated verification actions */}
            {isDeanLevel(role) && (proof.status === 'submitted' || proof.status === 'draft') && (
              <View style={s.proofActionsRow}>
                <Pressable
                  style={[s.proofActionButton, { backgroundColor: '#22C55E18', borderColor: '#22C55E40' }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  <IconSymbol name="checkmark.circle.fill" size={14} color="#22C55E" />
                  <ThemedText style={[s.proofActionText, { color: '#22C55E' }]}>Verify</ThemedText>
                </Pressable>
                <Pressable
                  style={[s.proofActionButton, { backgroundColor: '#EF444418', borderColor: '#EF444440' }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  <IconSymbol name="xmark.circle.fill" size={14} color="#EF4444" />
                  <ThemedText style={[s.proofActionText, { color: '#EF4444' }]}>Reject</ThemedText>
                </Pressable>
              </View>
            )}
          </View>
        );
      })}

      {proofs.length === 0 && (
        <EmptyState icon="photo.stack.fill" label="No proof items" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// PAYMENTS SUB-TAB
// =============================================================================

function PaymentsTab({
  colors,
  accentColor,
  payments,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  payments: SponsorPayment[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Payment Expectations</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Read-only ledger — linked to Finance / Payment Rails
      </ThemedText>

      {payments.map((payment) => {
        const statusColor = PAYMENT_STATUS_COLORS[payment.status];
        const statusLabel = PAYMENT_STATUS_LABELS[payment.status];
        return (
          <View
            key={payment.id}
            style={[s.paymentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[s.paymentSeverityBar, { backgroundColor: statusColor }]} />
            <View style={s.paymentContent}>
              <View style={s.paymentHeader}>
                <ThemedText style={[s.paymentSponsor, { color: colors.text }]} numberOfLines={1}>
                  {payment.sponsorName}
                </ThemedText>
                <ThemedText style={[s.paymentAmount, { color: colors.text }]}>
                  {formatCurrency(payment.amount)}
                </ThemedText>
              </View>
              <View style={s.paymentBadgeRow}>
                <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
              </View>
              <View style={s.paymentMetaRow}>
                <View style={s.paymentMetaItem}>
                  <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.paymentMetaText, { color: colors.textTertiary }]}>
                    Due {formatDate(payment.dueDate)}
                  </ThemedText>
                </View>
                <View style={s.paymentMetaItem}>
                  <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.paymentMetaText, { color: colors.textTertiary }]}>
                    {payment.owner}
                  </ThemedText>
                </View>
              </View>
              {payment.notes ? (
                <ThemedText style={[s.paymentNotes, { color: colors.textSecondary }]} numberOfLines={2}>
                  {payment.notes}
                </ThemedText>
              ) : null}
              <View style={s.paymentFinanceRow}>
                <IconSymbol name="link" size={11} color={accentColor} />
                <ThemedText style={[s.paymentFinanceText, { color: accentColor }]}>
                  Link to Finance / Payment Rails
                </ThemedText>
              </View>
            </View>
          </View>
        );
      })}

      {payments.length === 0 && (
        <EmptyState icon="dollarsign.circle.fill" label="No payment records" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// RISK / COMPLIANCE SUB-TAB
// =============================================================================

function RiskComplianceTab({
  colors,
  accentColor,
  risks,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  risks: SponsorRisk[];
}) {
  // Sort by severity
  const sorted = useMemo(() => {
    const sevOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...risks].sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);
  }, [risks]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Sponsor Risk Register</ThemedText>

      {sorted.map((risk) => {
        const sevColor = RISK_SEVERITY_COLORS[risk.severity];
        const catLabel = RISK_CATEGORY_LABELS[risk.category];
        const statusColor = RISK_STATUS_COLORS[risk.status];
        const statusLabel = RISK_STATUS_LABELS[risk.status];
        return (
          <View
            key={risk.id}
            style={[s.riskCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[s.riskSeverityBar, { backgroundColor: sevColor }]} />
            <View style={s.riskContent}>
              <View style={s.riskHeader}>
                <ThemedText style={[s.riskSponsor, { color: colors.text }]} numberOfLines={1}>
                  {risk.sponsorName}
                </ThemedText>
              </View>
              <View style={s.riskBadgeRow}>
                <StatusBadge label={catLabel.toUpperCase()} color={accentColor} />
                <StatusBadge label={risk.severity.toUpperCase()} color={sevColor} />
                <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
              </View>
              <ThemedText style={[s.riskDesc, { color: colors.textSecondary }]} numberOfLines={3}>
                {risk.description}
              </ThemedText>
              <View style={[s.riskMitigation, { borderTopColor: colors.border }]}>
                <ThemedText style={[s.riskMitigationLabel, { color: colors.textTertiary }]}>
                  Mitigation Plan:
                </ThemedText>
                <ThemedText style={[s.riskMitigationText, { color: colors.textSecondary }]} numberOfLines={3}>
                  {risk.mitigationPlan}
                </ThemedText>
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
// CONTACTS SUB-TAB
// =============================================================================

function ContactsTab({
  colors,
  accentColor,
  contacts,
  sponsors,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  contacts: SponsorContact[];
  sponsors: Sponsor[];
}) {
  // Group contacts by sponsor
  const grouped = useMemo(() => {
    const groups: { sponsorId: string; sponsorName: string; contacts: SponsorContact[] }[] = [];
    const sponsorMap = new Map<string, SponsorContact[]>();

    contacts.forEach((contact) => {
      const existing = sponsorMap.get(contact.sponsorId);
      if (existing) {
        existing.push(contact);
      } else {
        sponsorMap.set(contact.sponsorId, [contact]);
      }
    });

    sponsorMap.forEach((ctcs, sponsorId) => {
      const sponsor = sponsors.find((sp) => sp.id === sponsorId);
      groups.push({
        sponsorId,
        sponsorName: sponsor?.name || sponsorId,
        contacts: ctcs,
      });
    });

    return groups;
  }, [contacts, sponsors]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {grouped.map((group) => (
        <View key={group.sponsorId} style={s.contactGroup}>
          <ThemedText style={[s.contactGroupTitle, { color: colors.text }]}>
            {group.sponsorName}
          </ThemedText>
          {group.contacts.map((contact) => (
            <View
              key={contact.id}
              style={[s.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={s.contactCardTop}>
                <IconSymbol name="person.circle.fill" size={20} color={accentColor} />
                <View style={s.contactTextCol}>
                  <ThemedText style={[s.contactName, { color: colors.text }]} numberOfLines={1}>
                    {contact.name}
                  </ThemedText>
                  <ThemedText style={[s.contactRole, { color: colors.textSecondary }]} numberOfLines={1}>
                    {contact.role}
                  </ThemedText>
                </View>
              </View>
              <View style={[s.contactInfo, { borderTopColor: colors.border }]}>
                <View style={s.contactInfoItem}>
                  <IconSymbol name="envelope.fill" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.contactInfoText, { color: colors.textTertiary }]} numberOfLines={1}>
                    {contact.email}
                  </ThemedText>
                </View>
                <View style={s.contactInfoItem}>
                  <IconSymbol name="phone.fill" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.contactInfoText, { color: colors.textTertiary }]}>
                    {contact.phone}
                  </ThemedText>
                </View>
              </View>
              <View style={s.contactTagRow}>
                {contact.tags.map((tag, i) => (
                  <StatusBadge key={`${contact.id}-tag-${i}`} label={tag.toUpperCase()} color={accentColor} />
                ))}
              </View>
              <View style={s.contactTouchRow}>
                <View style={s.contactTouchItem}>
                  <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.contactTouchText, { color: colors.textTertiary }]}>
                    Last: {formatDate(contact.lastTouch)}
                  </ThemedText>
                </View>
                {contact.nextTouch ? (
                  <View style={s.contactTouchItem}>
                    <IconSymbol name="clock.arrow.circlepath" size={11} color={colors.textTertiary} />
                    <ThemedText style={[s.contactTouchText, { color: colors.textTertiary }]}>
                      Next: {formatDate(contact.nextTouch)}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ))}

      {contacts.length === 0 && (
        <EmptyState icon="person.crop.rectangle.stack.fill" label="No contacts" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// REPORTS SUB-TAB
// =============================================================================

function ReportsTab({
  colors,
  accentColor,
  reports,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  reports: SponsorReport[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Report Generator</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Generate sponsor reports and compliance packages
      </ThemedText>

      {reports.map((report) => {
        const typeColor = report.type === 'financial' ? '#22C55E' : report.type === 'compliance' ? '#F59E0B' : report.type === 'strategic' ? '#1D9BF0' : report.type === 'operational' ? '#1D9BF0' : '#1D9BF0';
        return (
          <View
            key={report.id}
            style={[s.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.reportCardTop}>
              <IconSymbol name="doc.text.fill" size={18} color={accentColor} />
              <View style={s.reportTextCol}>
                <ThemedText style={[s.reportName, { color: colors.text }]}>{report.name}</ThemedText>
                <ThemedText style={[s.reportDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                  {report.description}
                </ThemedText>
              </View>
            </View>
            <View style={s.reportTypeRow}>
              <StatusBadge label={report.type.toUpperCase()} color={typeColor} />
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

      {reports.length === 0 && (
        <EmptyState icon="chart.bar.doc.horizontal.fill" label="No reports available" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// SPONSOR DETAIL BOTTOM SHEET
// =============================================================================

function SponsorDetailSheet({
  visible,
  onClose,
  sponsor,
  agreements,
  deliverables,
  proofs,
  payments,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  sponsor: Sponsor | null;
  agreements: SponsorAgreement[];
  deliverables: Deliverable[];
  proofs: DeliverableProof[];
  payments: SponsorPayment[];
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!sponsor) return null;

  const typeColor = SPONSOR_TYPE_COLORS[sponsor.type];
  const typeLabel = SPONSOR_TYPE_LABELS[sponsor.type];
  const statusColor = SPONSOR_STATUS_COLORS[sponsor.status];
  const statusLabel = SPONSOR_STATUS_LABELS[sponsor.status];
  const riskC = sponsor.riskLevel === 'high' ? '#EF4444' : sponsor.riskLevel === 'medium' ? '#F59E0B' : '#22C55E';

  const sponsorAgreements = agreements.filter((a) => a.sponsorId === sponsor.id);
  const sponsorDeliverables = deliverables.filter((d) => d.agreementId && sponsorAgreements.some((a) => a.id === d.agreementId));
  const deliverableIds = new Set(sponsorDeliverables.map((d) => d.id));
  const sponsorProofs = proofs.filter((p) => deliverableIds.has(p.deliverableId));
  const sponsorPayments = payments.filter((p) => p.sponsorName === sponsor.name);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={sponsor.name} useModal>
      {/* Profile badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
        {sponsor.scope.map((sc) => (
          <StatusBadge key={sc} label={SPONSOR_SCOPE_LABELS[sc].toUpperCase()} color={SPONSOR_SCOPE_COLORS[sc]} />
        ))}
        <StatusBadge label={`RISK: ${(sponsor.riskLevel || 'low').toUpperCase()}`} color={riskC} />
      </View>

      {/* Profile details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Profile</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{sponsor.valueBand}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Value Band</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{sponsor.contactCount}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Contacts</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{sponsor.agreementCount}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Agreements</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{sponsor.paymentStatus || '--'}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Payment Status</ThemedText>
          </View>
        </View>
      </View>

      {/* Agreements */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Agreements ({sponsorAgreements.length})
        </ThemedText>
        {sponsorAgreements.map((agr) => (
          <View key={agr.id} style={s.sheetListRow}>
            <IconSymbol name="doc.text.fill" size={14} color={accentColor} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {AGREEMENT_TYPE_LABELS[agr.type]}
              </ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                {AGREEMENT_STATUS_LABELS[agr.status]} — {formatCurrency(agr.totalValue)}
              </ThemedText>
            </View>
          </View>
        ))}
        {sponsorAgreements.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No agreements
          </ThemedText>
        )}
      </View>

      {/* Deliverables */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Deliverables ({sponsorDeliverables.length})
        </ThemedText>
        {sponsorDeliverables.map((del) => (
          <View key={del.id} style={s.sheetListRow}>
            <IconSymbol name="checklist" size={14} color={accentColor} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {del.title}
              </ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                {DELIVERABLE_STATUS_LABELS[del.status]} — Due {formatDate(del.dueDate)}
              </ThemedText>
            </View>
          </View>
        ))}
        {sponsorDeliverables.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No deliverables
          </ThemedText>
        )}
      </View>

      {/* Proof Gallery */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Proof Gallery ({sponsorProofs.length})
        </ThemedText>
        {sponsorProofs.map((pf) => (
          <View key={pf.id} style={s.sheetListRow}>
            <IconSymbol name="paperclip" size={14} color={accentColor} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {PROOF_TYPE_LABELS[pf.type]}
              </ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                {PROOF_STATUS_LABELS[pf.status]} — {pf.submittedBy || 'Unsubmitted'}
              </ThemedText>
            </View>
          </View>
        ))}
        {sponsorProofs.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No proof items
          </ThemedText>
        )}
      </View>

      {/* Payments Snapshot */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Payments ({sponsorPayments.length})
        </ThemedText>
        {sponsorPayments.map((pm) => (
          <View key={pm.id} style={s.sheetListRow}>
            <IconSymbol name="dollarsign.circle.fill" size={14} color={PAYMENT_STATUS_COLORS[pm.status]} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {formatCurrency(pm.amount)}
              </ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                {PAYMENT_STATUS_LABELS[pm.status]} — Due {formatDate(pm.dueDate)}
              </ThemedText>
            </View>
          </View>
        ))}
        {sponsorPayments.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No payment records
          </ThemedText>
        )}
      </View>

      {/* Close */}
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
// AGREEMENT DETAIL BOTTOM SHEET
// =============================================================================

function AgreementDetailSheet({
  visible,
  onClose,
  agreement,
  deliverables,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  agreement: SponsorAgreement | null;
  deliverables: Deliverable[];
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!agreement) return null;

  const typeLabel = AGREEMENT_TYPE_LABELS[agreement.type];
  const statusColor = AGREEMENT_STATUS_COLORS[agreement.status];
  const statusLabel = AGREEMENT_STATUS_LABELS[agreement.status];
  const scopeColor = SPONSOR_SCOPE_COLORS[agreement.scope];
  const scopeLabel = SPONSOR_SCOPE_LABELS[agreement.scope];
  const linkedDeliverables = deliverables.filter((d) => d.agreementId === agreement.id);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={agreement.sponsorName} useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={typeLabel.toUpperCase()} color={accentColor} />
        <StatusBadge label={scopeLabel.toUpperCase()} color={scopeColor} />
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
      </View>

      {/* Terms Summary */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Terms Summary</ThemedText>
        {agreement.terms.map((term) => (
          <View key={term.id} style={s.sheetTermRow}>
            <ThemedText style={[s.sheetTermLabel, { color: colors.textTertiary }]}>{term.label}</ThemedText>
            <ThemedText style={[s.sheetTermValue, { color: colors.textSecondary }]}>{term.value}</ThemedText>
          </View>
        ))}
      </View>

      {/* Details Grid */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatDate(agreement.startDate)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Start Date</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatDate(agreement.endDate)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>End Date</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatCurrency(agreement.totalValue)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Total Value</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {agreement.paymentSchedule}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Payment Schedule</ThemedText>
          </View>
        </View>
      </View>

      {/* Documents */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Documents</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
          Agreement document, terms addendum, compliance checklist stored in document management system.
        </ThemedText>
      </View>

      {/* Deliverables Schedule */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Deliverables Schedule ({linkedDeliverables.length})
        </ThemedText>
        {linkedDeliverables.map((del) => {
          const dStatusColor = DELIVERABLE_STATUS_COLORS[del.status];
          const dStatusLabel = DELIVERABLE_STATUS_LABELS[del.status];
          return (
            <View key={del.id} style={s.sheetListRow}>
              <IconSymbol name="checklist" size={14} color={accentColor} />
              <View style={s.sheetListTextCol}>
                <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                  {del.title}
                </ThemedText>
                <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                  Due {formatDate(del.dueDate)} — {dStatusLabel}
                </ThemedText>
              </View>
              <StatusBadge label={dStatusLabel.toUpperCase()} color={dStatusColor} />
            </View>
          );
        })}
        {linkedDeliverables.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No deliverables linked
          </ThemedText>
        )}
      </View>

      {/* Approval Chain — not present on all agreements but we show a note */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Approval Chain</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
          Agreement cannot be "Executed" without owner, scope, deliverables, and compliance status confirmed.
        </ThemedText>
        <View style={s.sheetListRow}>
          <View style={[s.timelineDot, { backgroundColor: statusColor }]} />
          <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
            Current: {statusLabel}
          </ThemedText>
        </View>
      </View>

      {/* Close */}
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
// DELIVERABLE DETAIL BOTTOM SHEET
// =============================================================================

function DeliverableDetailSheet({
  visible,
  onClose,
  deliverable,
  proofs,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  deliverable: Deliverable | null;
  proofs: DeliverableProof[];
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!deliverable) return null;

  const statusColor = DELIVERABLE_STATUS_COLORS[deliverable.status];
  const statusLabel = DELIVERABLE_STATUS_LABELS[deliverable.status];
  const scopeColor = SPONSOR_SCOPE_COLORS[deliverable.scope];
  const scopeLabel = SPONSOR_SCOPE_LABELS[deliverable.scope];
  const linkedProofs = proofs.filter((p) => p.deliverableId === deliverable.id);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={deliverable.title} useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={scopeLabel.toUpperCase()} color={scopeColor} />
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
        {deliverable.proofRequired && (
          <StatusBadge label="PROOF REQUIRED" color="#1D9BF0" />
        )}
      </View>

      {/* Sponsor & Scope */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{deliverable.sponsorName}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Sponsor</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{deliverable.owner}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Owner</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatDate(deliverable.dueDate)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Due Date</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{scopeLabel}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Scope</ThemedText>
          </View>
        </View>
      </View>

      {/* Risk if Missed */}
      {deliverable.riskIfMissed ? (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Risk if Missed</ThemedText>
          <ThemedText style={[s.sheetBodyText, { color: '#EF4444' }]}>
            {deliverable.riskIfMissed}
          </ThemedText>
        </View>
      ) : null}

      {/* Proof Items */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Proof Items ({linkedProofs.length})
        </ThemedText>
        {linkedProofs.map((pf) => {
          const pfStatusColor = PROOF_STATUS_COLORS[pf.status];
          const pfStatusLabel = PROOF_STATUS_LABELS[pf.status];
          return (
            <View key={pf.id} style={s.sheetListRow}>
              <IconSymbol name="paperclip" size={14} color={accentColor} />
              <View style={s.sheetListTextCol}>
                <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                  {PROOF_TYPE_LABELS[pf.type]}
                </ThemedText>
                <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                  {pfStatusLabel} — {pf.submittedBy || 'Unsubmitted'}
                </ThemedText>
              </View>
              <StatusBadge label={pfStatusLabel.toUpperCase()} color={pfStatusColor} />
            </View>
          );
        })}
        {linkedProofs.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No proof items linked
          </ThemedText>
        )}
      </View>

      {/* Status Timeline */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Status</ThemedText>
        <View style={s.sheetListRow}>
          <View style={[s.timelineDot, { backgroundColor: statusColor }]} />
          <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
            Current: {statusLabel}
          </ThemedText>
        </View>
      </View>

      {/* Close */}
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
// PIPELINE DETAIL BOTTOM SHEET
// =============================================================================

function PipelineDetailSheet({
  visible,
  onClose,
  deal,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  deal: PipelineItem | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!deal) return null;

  const typeColor = SPONSOR_TYPE_COLORS[deal.type];
  const typeLabel = SPONSOR_TYPE_LABELS[deal.type];
  const stageColor = PIPELINE_STAGE_COLORS[deal.stage];
  const stageLabel = PIPELINE_STAGE_LABELS[deal.stage];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={deal.sponsorName} useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
        <StatusBadge label={stageLabel.toUpperCase()} color={stageColor} />
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Deal Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatCurrency(deal.expectedValue)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Expected Value</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{deal.owner}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Owner</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatDate(deal.targetClose)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Target Close</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{stageLabel}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Stage</ThemedText>
          </View>
        </View>
      </View>

      {/* Next Steps */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Next Steps</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
          {deal.nextStep}
        </ThemedText>
      </View>

      {/* Blockers */}
      {deal.blockers ? (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Blockers</ThemedText>
          <ThemedText style={[s.sheetBodyText, { color: '#EF4444' }]}>
            {deal.blockers}
          </ThemedText>
        </View>
      ) : null}

      {/* Stage Timeline */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Stage Progress</ThemedText>
        <View style={s.sheetListRow}>
          <View style={[s.timelineDot, { backgroundColor: stageColor }]} />
          <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
            Current: {stageLabel}
          </ThemedText>
        </View>
      </View>

      {/* Close */}
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

export function EduOrgSponsorsV2({ colors, accentColor, role = 'E1' }: Props) {
  // === RBAC Gate: E4 locked ===
  if (role === 'E4') {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Sponsors</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          Sponsor information is not available for student accounts.
        </ThemedText>
      </View>
    );
  }

  // === RBAC Gate: E5 limited — only curated "Partners" view ===
  if (role === 'E5') {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="building.2.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Partners</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          A curated view of institutional partners is available when enabled by the administration. Contact the advancement office for partnership inquiries.
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [sponsorSheetVisible, setSponsorSheetVisible] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<SponsorAgreement | null>(null);
  const [agreementSheetVisible, setAgreementSheetVisible] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [deliverableSheetVisible, setDeliverableSheetVisible] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<PipelineItem | null>(null);
  const [dealSheetVisible, setDealSheetVisible] = useState(false);

  // === Data ===
  const data = useMemo(() => getEduSponsorsData(), []);

  // === Callbacks ===
  const handleSelectSponsor = useCallback((sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setSponsorSheetVisible(true);
  }, []);

  const handleCloseSponsorSheet = useCallback(() => {
    setSponsorSheetVisible(false);
  }, []);

  const handleSelectAgreement = useCallback((agreement: SponsorAgreement) => {
    setSelectedAgreement(agreement);
    setAgreementSheetVisible(true);
  }, []);

  const handleCloseAgreementSheet = useCallback(() => {
    setAgreementSheetVisible(false);
  }, []);

  const handleSelectDeliverable = useCallback((deliverable: Deliverable) => {
    setSelectedDeliverable(deliverable);
    setDeliverableSheetVisible(true);
  }, []);

  const handleCloseDeliverableSheet = useCallback(() => {
    setDeliverableSheetVisible(false);
  }, []);

  const handleSelectDeal = useCallback((deal: PipelineItem) => {
    setSelectedDeal(deal);
    setDealSheetVisible(true);
  }, []);

  const handleCloseDealSheet = useCallback(() => {
    setDealSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (isDeanLevel(role)) return SUB_TABS; // E1/E2: full 10 tabs
    if (isFacultyLevel(role)) {
      // E3 (Faculty/Staff): Sponsors (read-only) + Deliverables
      return SUB_TABS.filter(
        (t) => t.id === 'sponsors' || t.id === 'deliverables',
      );
    }
    return SUB_TABS;
  }, [role]);

  // Set default active tab for E3 if needed
  const effectiveActiveTab = useMemo(() => {
    if (role === 'E3' && activeSubTab === 'overview') return 'sponsors';
    return activeSubTab;
  }, [role, activeSubTab]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (effectiveActiveTab) {
      case 'overview':
        if (!isDeanLevel(role)) return null;
        return <OverviewTab colors={colors} accentColor={accentColor} data={data} />;
      case 'sponsors':
        return (
          <SponsorsTab
            colors={colors}
            accentColor={accentColor}
            sponsors={data.sponsors}
            onSelectSponsor={handleSelectSponsor}
            readOnly={role === 'E3'}
          />
        );
      case 'pipeline':
        if (!isDeanLevel(role)) return null;
        return (
          <PipelineTab
            colors={colors}
            accentColor={accentColor}
            pipeline={data.pipeline}
            onSelectDeal={handleSelectDeal}
          />
        );
      case 'agreements':
        if (!isDeanLevel(role)) return null;
        return (
          <AgreementsTab
            colors={colors}
            accentColor={accentColor}
            agreements={data.agreements}
            onSelectAgreement={handleSelectAgreement}
          />
        );
      case 'deliverables':
        return (
          <DeliverablesTab
            colors={colors}
            accentColor={accentColor}
            deliverables={data.deliverables}
            onSelectDeliverable={handleSelectDeliverable}
          />
        );
      case 'proof':
        if (!isDeanLevel(role)) return null;
        return (
          <ProofTab
            colors={colors}
            accentColor={accentColor}
            proofs={data.proofs}
            role={role}
          />
        );
      case 'payments':
        if (!isDeanLevel(role)) return null;
        return (
          <PaymentsTab
            colors={colors}
            accentColor={accentColor}
            payments={data.payments}
          />
        );
      case 'risk-compliance':
        if (!isDeanLevel(role)) return null;
        return (
          <RiskComplianceTab
            colors={colors}
            accentColor={accentColor}
            risks={data.risks}
          />
        );
      case 'contacts':
        if (!isDeanLevel(role)) return null;
        return (
          <ContactsTab
            colors={colors}
            accentColor={accentColor}
            contacts={data.contacts}
            sponsors={data.sponsors}
          />
        );
      case 'reports':
        if (!isDeanLevel(role)) return null;
        return (
          <ReportsTab
            colors={colors}
            accentColor={accentColor}
            reports={data.reports}
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
        activeId={effectiveActiveTab}
        onSelect={setActiveSubTab}
        accentColor={accentColor}
        colors={colors}
      />

      {/* Content */}
      <View style={s.contentContainer}>
        {renderContent()}
      </View>

      {/* Sponsor Detail Bottom Sheet */}
      <SponsorDetailSheet
        visible={sponsorSheetVisible}
        onClose={handleCloseSponsorSheet}
        sponsor={selectedSponsor}
        agreements={data.agreements}
        deliverables={data.deliverables}
        proofs={data.proofs}
        payments={data.payments}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Agreement Detail Bottom Sheet */}
      <AgreementDetailSheet
        visible={agreementSheetVisible}
        onClose={handleCloseAgreementSheet}
        agreement={selectedAgreement}
        deliverables={data.deliverables}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Deliverable Detail Bottom Sheet */}
      <DeliverableDetailSheet
        visible={deliverableSheetVisible}
        onClose={handleCloseDeliverableSheet}
        deliverable={selectedDeliverable}
        proofs={data.proofs}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Pipeline Detail Bottom Sheet */}
      <PipelineDetailSheet
        visible={dealSheetVisible}
        onClose={handleCloseDealSheet}
        deal={selectedDeal}
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
    lineHeight: 20,
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

  // -- KPI Grid --
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  kpiCard: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
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

  // -- Action Row (priorities) --
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  actionTextCol: {
    flex: 1,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 11,
    lineHeight: 16,
  },

  // -- Health Card --
  healthCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  healthCardTop: {
    marginBottom: Spacing.sm,
  },
  healthName: {
    fontSize: 14,
    fontWeight: '600',
  },
  healthBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  // -- Sponsor Card --
  sponsorCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sponsorCardTop: {
    marginBottom: Spacing.sm,
  },
  sponsorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  sponsorBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  sponsorMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  sponsorMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sponsorMetaText: {
    fontSize: 11,
  },
  sponsorNextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  sponsorNextText: {
    fontSize: 11,
    flex: 1,
  },
  sponsorFooter: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
  },

  // -- Pipeline Card --
  pipelineCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  pipelineCardTop: {
    marginBottom: Spacing.sm,
  },
  pipelineName: {
    fontSize: 14,
    fontWeight: '600',
  },
  pipelineBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  pipelineDetails: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  pipelineDetailItem: {
    flex: 1,
  },
  pipelineDetailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  pipelineDetailLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  pipelineMetaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  pipelineMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pipelineMetaText: {
    fontSize: 11,
  },
  pipelineNextStep: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.xs,
  },
  pipelineBlockerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: Spacing.xs,
  },
  pipelineBlockerText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },

  // -- Agreement Card --
  agreementCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  agreementCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  agreementTextCol: {
    flex: 1,
  },
  agreementSponsor: {
    fontSize: 14,
    fontWeight: '600',
  },
  agreementBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  agreementMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  agreementMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agreementMetaText: {
    fontSize: 11,
  },
  agreementFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },

  // -- Deliverable Card --
  deliverableCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  deliverableTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  deliverableBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  deliverableMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  deliverableMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliverableMetaText: {
    fontSize: 11,
  },
  deliverableRiskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  deliverableRiskText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },

  // -- Proof Card --
  proofCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  proofCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  proofTextCol: {
    flex: 1,
  },
  proofDeliverable: {
    fontSize: 13,
    fontWeight: '600',
  },
  proofBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  proofMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  proofMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  proofMetaText: {
    fontSize: 11,
  },
  proofNotes: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  proofActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  proofActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  proofActionText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Payment Card --
  paymentCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  paymentSeverityBar: {
    width: 4,
  },
  paymentContent: {
    flex: 1,
    padding: Spacing.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentSponsor: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  paymentBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  paymentMetaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  paymentMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paymentMetaText: {
    fontSize: 11,
  },
  paymentNotes: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  paymentFinanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paymentFinanceText: {
    fontSize: 11,
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
  riskHeader: {
    marginBottom: 4,
  },
  riskSponsor: {
    fontSize: 14,
    fontWeight: '600',
  },
  riskBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  riskDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  riskMitigation: {
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  riskMitigationLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  riskMitigationText: {
    fontSize: 12,
    lineHeight: 17,
  },

  // -- Contact Group --
  contactGroup: {
    marginBottom: Spacing.lg,
  },
  contactGroupTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },

  // -- Contact Card --
  contactCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  contactCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  contactTextCol: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
  },
  contactRole: {
    fontSize: 12,
    marginTop: 1,
  },
  contactInfo: {
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
    gap: 4,
  },
  contactInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactInfoText: {
    fontSize: 11,
    flex: 1,
  },
  contactTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  contactTouchRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  contactTouchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactTouchText: {
    fontSize: 11,
  },

  // -- Report Card --
  reportCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  reportCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  reportTextCol: {
    flex: 1,
  },
  reportName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  reportDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  reportTypeRow: {
    marginBottom: Spacing.sm,
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
  sheetTermRow: {
    marginBottom: Spacing.sm,
  },
  sheetTermLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  sheetTermValue: {
    fontSize: 13,
    lineHeight: 19,
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
