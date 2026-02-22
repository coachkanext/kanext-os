/**
 * Sports Organization Sponsors V2 — 7-view sub-tab hub.
 * Sub-tabs: Overview | Sponsors | Pipeline | Deliverables | Proof | Invoices | Renewals
 * RBAC: R1 full 7-tab, R2 (Player) Overview only,
 *        R3 (Asst Coach) Overview + Sponsors + Deliverables, R4/R5 locked.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { SportsRoleLens } from '@/utils/sports-rbac';
import {
  getSponsorsOverview,
  getSponsors,
  getPipelineItems,
  getDeliverables,
  getProofItems,
  getSponsorInvoices,
  getRenewalItems,
  SPONSOR_TIER_LABEL,
  SPONSOR_TIER_COLOR,
  SPONSOR_STATUS_LABEL,
  SPONSOR_STATUS_COLOR,
  PIPELINE_STAGE_LABEL,
  PIPELINE_STAGE_COLOR,
  PIPELINE_PRIORITY_LABEL,
  PIPELINE_PRIORITY_COLOR,
  DELIVERABLE_TYPE_LABEL,
  DELIVERABLE_TYPE_COLOR,
  DELIVERABLE_STATUS_LABEL,
  DELIVERABLE_STATUS_COLOR,
  PROOF_TYPE_LABEL,
  PROOF_TYPE_COLOR,
  PROOF_STATUS_LABEL,
  PROOF_STATUS_COLOR,
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_COLOR,
  RENEWAL_RISK_LABEL,
  RENEWAL_RISK_COLOR,
} from '@/data/mock-sports-org-sponsors-v2';
import type {
  Sponsor,
  SponsorPipelineItem,
  Deliverable,
  ProofItem,
  SponsorInvoice,
  RenewalItem,
} from '@/data/mock-sports-org-sponsors-v2';

// =============================================================================
// CONSTANTS
// =============================================================================

const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'sponsors', label: 'Sponsors' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'deliverables', label: 'Deliverables' },
  { id: 'proof', label: 'Proof' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'renewals', label: 'Renewals' },
];

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: SportsRoleLens;
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
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  }
  return `$${amount}`;
}

function formatCurrencyFull(amount: number): string {
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
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const overview = useMemo(() => getSponsorsOverview(), []);
  const collectionRate = overview.committed > 0
    ? Math.round((overview.collected / overview.committed) * 100)
    : 0;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* KPI Grid */}
      <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.kpiCardTitle, { color: colors.text }]}>Sponsors Overview</ThemedText>
        <View style={s.kpiGrid}>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: accentColor }]}>{overview.activeCount}</ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Active Sponsors</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: accentColor }]}>{formatCurrency(overview.committed)}</ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Total Committed</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: '#22c55e' }]}>{formatCurrency(overview.collected)}</ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Total Collected</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: overview.deliverablesDue > 0 ? '#f59e0b' : '#22c55e' }]}>
              {overview.deliverablesDue}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Deliverables Due (30d)</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: overview.proofPending > 0 ? '#ef4444' : '#22c55e' }]}>
              {overview.proofPending}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Proof Pending</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: overview.renewalsDue > 0 ? '#f59e0b' : '#22c55e' }]}>
              {overview.renewalsDue}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Renewals Upcoming</ThemedText>
          </View>
        </View>
      </View>

      {/* Collection Rate */}
      <View style={[s.collectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.collectionHeader}>
          <IconSymbol name="chart.bar.fill" size={14} color={accentColor} />
          <ThemedText style={[s.collectionTitle, { color: colors.text }]}>Collection Rate</ThemedText>
          <ThemedText style={[s.collectionPercent, { color: accentColor }]}>{collectionRate}%</ThemedText>
        </View>
        <ProgressBar percent={collectionRate} color={accentColor} />
        <View style={s.collectionAmountsRow}>
          <ThemedText style={[s.collectionAmountText, { color: colors.textSecondary }]}>
            {formatCurrencyFull(overview.collected)} of {formatCurrencyFull(overview.committed)}
          </ThemedText>
        </View>
      </View>
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
}: {
  colors: typeof Colors.light;
  accentColor: string;
  sponsors: Sponsor[];
  onSelectSponsor: (sponsor: Sponsor) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: Sponsor }) => {
      const tierColor = SPONSOR_TIER_COLOR[item.tier];
      const tierLabel = SPONSOR_TIER_LABEL[item.tier];
      const statusColor = SPONSOR_STATUS_COLOR[item.status];
      const statusLabel = SPONSOR_STATUS_LABEL[item.status];
      const collectionPct = item.committedAmount > 0
        ? Math.round((item.collectedAmount / item.committedAmount) * 100)
        : 0;
      return (
        <Pressable
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectSponsor(item);
          }}
        >
          <View style={s.cardHeader}>
            <ThemedText style={[s.cardTitle, { color: colors.text, flex: 1 }]} numberOfLines={1}>
              {item.name}
            </ThemedText>
          </View>
          <View style={s.badgeRow}>
            <StatusBadge label={tierLabel.toUpperCase()} color={tierColor} />
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
          </View>
          <View style={s.sponsorAmountsRow}>
            <ThemedText style={[s.sponsorAmountLabel, { color: colors.textSecondary }]}>
              {formatCurrencyFull(item.collectedAmount)} / {formatCurrencyFull(item.committedAmount)}
            </ThemedText>
            <ThemedText style={[s.sponsorAmountPercent, { color: accentColor }]}>
              {collectionPct}%
            </ThemedText>
          </View>
          <ProgressBar percent={collectionPct} color={accentColor} />
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>{item.primaryContact}</ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectSponsor],
  );

  return (
    <FlatList
      data={sponsors}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="building.2.fill" label="No sponsors available" colors={colors} />
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
  pipelineItems,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  pipelineItems: SponsorPipelineItem[];
}) {
  const renderItem = useCallback(
    ({ item }: { item: SponsorPipelineItem }) => {
      const stageColor = PIPELINE_STAGE_COLOR[item.stage];
      const stageLabel = PIPELINE_STAGE_LABEL[item.stage];
      const prioColor = PIPELINE_PRIORITY_COLOR[item.priority];
      const prioLabel = PIPELINE_PRIORITY_LABEL[item.priority];
      return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </ThemedText>
          <View style={s.badgeRow}>
            <StatusBadge label={stageLabel.toUpperCase()} color={stageColor} />
            <StatusBadge label={prioLabel.toUpperCase()} color={prioColor} />
          </View>
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>
                {item.daysInStage}d in stage
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
      data={pipelineItems}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="arrow.right.circle.fill" label="No pipeline items" colors={colors} />
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
  onSelectDeliverable: (del: Deliverable) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: Deliverable }) => {
      const typeColor = DELIVERABLE_TYPE_COLOR[item.type];
      const typeLabel = DELIVERABLE_TYPE_LABEL[item.type];
      const statusColor = DELIVERABLE_STATUS_COLOR[item.status];
      const statusLabel = DELIVERABLE_STATUS_LABEL[item.status];
      return (
        <Pressable
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectDeliverable(item);
          }}
        >
          <ThemedText style={[s.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {item.sponsorName}
          </ThemedText>
          <View style={s.badgeRow}>
            <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
          </View>
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>Due {formatDate(item.dueDate)}</ThemedText>
            </View>
            <View style={s.metaItem}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>{item.owner}</ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectDeliverable],
  );

  return (
    <FlatList
      data={deliverables}
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
  proofItems,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  proofItems: ProofItem[];
}) {
  const renderItem = useCallback(
    ({ item }: { item: ProofItem }) => {
      const typeColor = PROOF_TYPE_COLOR[item.type];
      const typeLabel = PROOF_TYPE_LABEL[item.type];
      const statusColor = PROOF_STATUS_COLOR[item.status];
      const statusLabel = PROOF_STATUS_LABEL[item.status];
      return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.cardTitle, { color: colors.text }]} numberOfLines={2}>
            {item.deliverableName}
          </ThemedText>
          <View style={s.badgeRow}>
            <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
          </View>
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>{formatDate(item.timestamp)}</ThemedText>
            </View>
            {item.reviewer && (
              <View style={s.metaItem}>
                <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>{item.reviewer}</ThemedText>
              </View>
            )}
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={proofItems}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="camera.fill" label="No proof items" colors={colors} />
      }
    />
  );
}

// =============================================================================
// INVOICES SUB-TAB
// =============================================================================

function InvoicesTab({
  colors,
  accentColor,
  invoices,
  onSelectInvoice,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  invoices: SponsorInvoice[];
  onSelectInvoice: (inv: SponsorInvoice) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: SponsorInvoice }) => {
      const statusColor = INVOICE_STATUS_COLOR[item.status];
      const statusLabel = INVOICE_STATUS_LABEL[item.status];
      return (
        <Pressable
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectInvoice(item);
          }}
        >
          <View style={s.cardHeader}>
            <ThemedText style={[s.cardTitle, { color: colors.text, flex: 1 }]} numberOfLines={1}>
              {item.sponsorName}
            </ThemedText>
            <ThemedText style={[s.invoiceAmount, { color: colors.text }]}>
              {formatCurrencyFull(item.amount)}
            </ThemedText>
          </View>
          <View style={s.badgeRow}>
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
          </View>
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>Due {formatDate(item.dueDate)}</ThemedText>
            </View>
          </View>
          {item.blockedReason && (
            <View style={[s.blockedReasonRow, { borderTopColor: colors.border }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={11} color="#f59e0b" />
              <ThemedText style={[s.blockedReasonText, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.blockedReason}
              </ThemedText>
            </View>
          )}
        </Pressable>
      );
    },
    [colors, accentColor, onSelectInvoice],
  );

  return (
    <FlatList
      data={invoices}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="doc.text.fill" label="No invoices" colors={colors} />
      }
    />
  );
}

// =============================================================================
// RENEWALS SUB-TAB
// =============================================================================

function RenewalsTab({
  colors,
  accentColor,
  renewalItems,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  renewalItems: RenewalItem[];
}) {
  const renderItem = useCallback(
    ({ item }: { item: RenewalItem }) => {
      const riskColor = RENEWAL_RISK_COLOR[item.riskLevel];
      const riskLabel = RENEWAL_RISK_LABEL[item.riskLevel];
      return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.cardHeader}>
            <ThemedText style={[s.cardTitle, { color: colors.text, flex: 1 }]} numberOfLines={1}>
              {item.sponsorName}
            </ThemedText>
            <StatusBadge label={riskLabel.toUpperCase()} color={riskColor} />
          </View>
          <View style={s.badgeRow}>
            <StatusBadge label={item.tier.toUpperCase()} color={accentColor} />
            <StatusBadge label={`${item.daysUntilRenewal}D`} color={item.daysUntilRenewal <= 120 ? '#f59e0b' : '#22c55e'} />
          </View>
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>
                Contract ends {formatDate(item.contractEnd)}
              </ThemedText>
            </View>
          </View>
          <View style={[s.recommendedActionRow, { borderTopColor: colors.border }]}>
            <IconSymbol name="lightbulb.fill" size={11} color={accentColor} />
            <ThemedText style={[s.recommendedActionText, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.recommendedAction}
            </ThemedText>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={renewalItems}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="arrow.triangle.2.circlepath" label="No renewals" colors={colors} />
      }
    />
  );
}

// === SPONSOR DETAIL BOTTOM SHEET ===
function SponsorDetailSheet({ visible, onClose, sponsor, colors, accentColor }: {
  visible: boolean; onClose: () => void; sponsor: Sponsor | null;
  colors: typeof Colors.light; accentColor: string;
}) {
  if (!sponsor) return null;
  const tierColor = SPONSOR_TIER_COLOR[sponsor.tier];
  const tierLabel = SPONSOR_TIER_LABEL[sponsor.tier];
  const statusColor = SPONSOR_STATUS_COLOR[sponsor.status];
  const statusLabel = SPONSOR_STATUS_LABEL[sponsor.status];
  const pct = sponsor.committedAmount > 0 ? Math.round((sponsor.collectedAmount / sponsor.committedAmount) * 100) : 0;
  return (
    <BottomSheet visible={visible} onClose={onClose} title={sponsor.name} useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={tierLabel.toUpperCase()} color={tierColor} />
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
      </View>
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          {[
            [sponsor.primaryContact, 'Primary Contact'],
            [sponsor.ownerInProgram, 'Program Owner'],
            [formatDate(sponsor.contractStart), 'Contract Start'],
            [formatDate(sponsor.contractEnd), 'Contract End'],
          ].map(([val, lbl]) => (
            <View key={lbl} style={s.sheetDetailItem}>
              <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{val}</ThemedText>
              <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>{lbl}</ThemedText>
            </View>
          ))}
        </View>
      </View>
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Financials</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatCurrencyFull(sponsor.committedAmount)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Committed</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: '#22c55e' }]}>{formatCurrencyFull(sponsor.collectedAmount)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Collected</ThemedText>
          </View>
        </View>
        <View style={s.sheetProgressRow}>
          <ThemedText style={[s.sheetProgressLabel, { color: colors.textSecondary }]}>Collection Rate: {pct}%</ThemedText>
          <ProgressBar percent={pct} color={accentColor} />
        </View>
      </View>
      <View style={s.sheetActions}>
        <Pressable style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onClose(); }}>
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>Close</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// === DELIVERABLE DETAIL BOTTOM SHEET ===
function DeliverableDetailSheet({ visible, onClose, deliverable, colors, accentColor }: {
  visible: boolean; onClose: () => void; deliverable: Deliverable | null;
  colors: typeof Colors.light; accentColor: string;
}) {
  if (!deliverable) return null;
  const typeColor = DELIVERABLE_TYPE_COLOR[deliverable.type];
  const typeLabel = DELIVERABLE_TYPE_LABEL[deliverable.type];
  const statusColor = DELIVERABLE_STATUS_COLOR[deliverable.status];
  const statusLabel = DELIVERABLE_STATUS_LABEL[deliverable.status];
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Deliverable" useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
      </View>
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          {[
            [deliverable.sponsorName, 'Sponsor'], [typeLabel, 'Type'],
            [formatDate(deliverable.dueDate), 'Due Date'], [deliverable.owner, 'Owner'],
          ].map(([val, lbl]) => (
            <View key={lbl} style={s.sheetDetailItem}>
              <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{val}</ThemedText>
              <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>{lbl}</ThemedText>
            </View>
          ))}
        </View>
      </View>
      {deliverable.eventLink && (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Event Link</ThemedText>
          <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>{deliverable.eventLink}</ThemedText>
        </View>
      )}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Proof Required</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
          {deliverable.proofRequired ? 'Yes - proof documentation required upon completion' : 'No - proof not required'}
        </ThemedText>
      </View>
      <View style={s.sheetActions}>
        <Pressable style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onClose(); }}>
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>Close</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// === INVOICE DETAIL BOTTOM SHEET ===
function InvoiceDetailSheet({ visible, onClose, invoice, colors, accentColor }: {
  visible: boolean; onClose: () => void; invoice: SponsorInvoice | null;
  colors: typeof Colors.light; accentColor: string;
}) {
  if (!invoice) return null;
  const statusColor = INVOICE_STATUS_COLOR[invoice.status];
  const statusLabel = INVOICE_STATUS_LABEL[invoice.status];
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Invoice" useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
        <StatusBadge label={formatCurrencyFull(invoice.amount)} color={accentColor} />
      </View>
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          {[
            [invoice.sponsorName, 'Sponsor'], [formatCurrencyFull(invoice.amount), 'Amount'],
            [formatDate(invoice.issueDate), 'Issue Date'], [formatDate(invoice.dueDate), 'Due Date'],
          ].map(([val, lbl]) => (
            <View key={lbl} style={s.sheetDetailItem}>
              <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{val}</ThemedText>
              <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>{lbl}</ThemedText>
            </View>
          ))}
        </View>
      </View>
      {invoice.blockedReason && (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Blocked Reason</ThemedText>
          <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>{invoice.blockedReason}</ThemedText>
        </View>
      )}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Status</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>{statusLabel}</ThemedText>
      </View>
      <View style={s.sheetActions}>
        <Pressable style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onClose(); }}>
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>Close</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function SportsOrgSponsorsV2({ colors, accentColor, role = 'R1' }: Props) {
  // === RBAC Gate: R4/R5 locked ===
  if (role === 'R4' || role === 'R5') {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Sponsors</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          Sponsor information is not available for your role
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [drillMode, setDrillMode] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [sponsorSheetVisible, setSponsorSheetVisible] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [deliverableSheetVisible, setDeliverableSheetVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SponsorInvoice | null>(null);
  const [invoiceSheetVisible, setInvoiceSheetVisible] = useState(false);

  // === Data ===
  const sponsors = useMemo(() => getSponsors(), []);
  const pipelineItems = useMemo(() => getPipelineItems(), []);
  const deliverables = useMemo(() => getDeliverables(), []);
  const proofItems = useMemo(() => getProofItems(), []);
  const invoices = useMemo(() => getSponsorInvoices(), []);
  const renewalItems = useMemo(() => getRenewalItems(), []);

  // === Callbacks ===
  const handleSelectSponsor = useCallback((sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setSponsorSheetVisible(true);
  }, []);

  const handleCloseSponsorSheet = useCallback(() => {
    setSponsorSheetVisible(false);
  }, []);

  const handleSelectDeliverable = useCallback((del: Deliverable) => {
    setSelectedDeliverable(del);
    setDeliverableSheetVisible(true);
  }, []);

  const handleCloseDeliverableSheet = useCallback(() => {
    setDeliverableSheetVisible(false);
  }, []);

  const handleSelectInvoice = useCallback((inv: SponsorInvoice) => {
    setSelectedInvoice(inv);
    setInvoiceSheetVisible(true);
  }, []);

  const handleCloseInvoiceSheet = useCallback(() => {
    setInvoiceSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (role === 'R1') return SUB_TABS; // R1: full 7 tabs
    if (role === 'R3') {
      // R3 (Asst Coach): Overview + Sponsors + Deliverables
      return SUB_TABS.filter(
        (t) => t.id === 'overview' || t.id === 'sponsors' || t.id === 'deliverables',
      );
    }
    if (role === 'R2') {
      // R2 (Player): Overview only
      return SUB_TABS.filter((t) => t.id === 'overview');
    }
    return SUB_TABS;
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return <OverviewTab colors={colors} accentColor={accentColor} />;
      case 'sponsors':
        if (role === 'R2') return null;
        return (
          <SponsorsTab
            colors={colors}
            accentColor={accentColor}
            sponsors={sponsors}
            onSelectSponsor={handleSelectSponsor}
          />
        );
      case 'pipeline':
        if (role !== 'R1') return null;
        return (
          <PipelineTab
            colors={colors}
            accentColor={accentColor}
            pipelineItems={pipelineItems}
          />
        );
      case 'deliverables':
        if (role === 'R2') return null;
        return (
          <DeliverablesTab
            colors={colors}
            accentColor={accentColor}
            deliverables={deliverables}
            onSelectDeliverable={handleSelectDeliverable}
          />
        );
      case 'proof':
        if (role !== 'R1') return null;
        return (
          <ProofTab
            colors={colors}
            accentColor={accentColor}
            proofItems={proofItems}
          />
        );
      case 'invoices':
        if (role !== 'R1') return null;
        return (
          <InvoicesTab
            colors={colors}
            accentColor={accentColor}
            invoices={invoices}
            onSelectInvoice={handleSelectInvoice}
          />
        );
      case 'renewals':
        if (role !== 'R1') return null;
        return (
          <RenewalsTab
            colors={colors}
            accentColor={accentColor}
            renewalItems={renewalItems}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      {/* Sub-tab bar — hidden until drill mode */}
      {drillMode ? (
        <>
          <Pressable
            style={[s.overviewBackBar, { borderBottomColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setDrillMode(false);
              setActiveSubTab('overview');
            }}
          >
            <IconSymbol name="chevron.left" size={14} color={accentColor} />
            <ThemedText style={[s.overviewBackText, { color: accentColor }]}>Overview</ThemedText>
          </Pressable>
          <SubTabBar
            tabs={visibleSubTabs}
            activeId={activeSubTab}
            onSelect={setActiveSubTab}
            accentColor={accentColor}
            colors={colors}
          />
        </>
      ) : null}

      {/* Content */}
      <View style={s.contentContainer}>
        {renderContent()}
      </View>

      {/* Explore bar — overview-only mode */}
      {!drillMode && (
        <Pressable
          style={[s.exploreBar, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setDrillMode(true);
          }}
        >
          <IconSymbol name="rectangle.grid.1x2.fill" size={16} color="#FFFFFF" />
          <ThemedText style={s.exploreBarText}>Explore All Sections</ThemedText>
          <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
        </Pressable>
      )}

      {/* Sponsor Detail Bottom Sheet */}
      <SponsorDetailSheet
        visible={sponsorSheetVisible}
        onClose={handleCloseSponsorSheet}
        sponsor={selectedSponsor}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Deliverable Detail Bottom Sheet */}
      <DeliverableDetailSheet
        visible={deliverableSheetVisible}
        onClose={handleCloseDeliverableSheet}
        deliverable={selectedDeliverable}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Invoice Detail Bottom Sheet */}
      <InvoiceDetailSheet
        visible={invoiceSheetVisible}
        onClose={handleCloseInvoiceSheet}
        invoice={selectedInvoice}
        colors={colors}
        accentColor={accentColor}
      />
    </View>
  );
}

// === STYLES ===
const s = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flex: 1 },
  lockedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  lockedTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.md },
  lockedMessage: { fontSize: 14, textAlign: 'center', marginTop: Spacing.sm },
  overviewBackBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  overviewBackText: {
    fontSize: 14,
    fontWeight: '600',
  },
  exploreBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  exploreBarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  subTabRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.md },
  subTab: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xs },
  subTabText: { fontSize: 13, fontWeight: '600' },
  tabScroll: { padding: Spacing.md, paddingBottom: 120 },
  tabListContent: { padding: Spacing.md, paddingBottom: 120 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl },
  emptyText: { fontSize: 14, marginTop: Spacing.sm, textAlign: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  badgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  progressTrack: { height: 4, backgroundColor: '#2F3336', borderRadius: 2, overflow: 'hidden', marginBottom: Spacing.sm },
  progressFill: { height: 4, borderRadius: 2 },
  kpiCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.md },
  kpiCardTitle: { fontSize: 15, fontWeight: '700', marginBottom: Spacing.md },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  kpiItem: { width: '47%', alignItems: 'center', paddingVertical: Spacing.sm },
  kpiValue: { fontSize: 22, fontWeight: '700', fontVariant: ['tabular-nums'] },
  kpiLabel: { fontSize: 11, marginTop: 2, textAlign: 'center' },
  collectionCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.md },
  collectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  collectionTitle: { fontSize: 13, fontWeight: '600', flex: 1 },
  collectionPercent: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  collectionAmountsRow: { marginTop: Spacing.xs },
  collectionAmountText: { fontSize: 12 },
  card: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  cardTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  cardSubtitle: { fontSize: 12, marginBottom: Spacing.sm },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11 },
  sponsorAmountsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  sponsorAmountLabel: { fontSize: 12 },
  sponsorAmountPercent: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  invoiceAmount: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  blockedReasonRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingTop: Spacing.sm, marginTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  blockedReasonText: { fontSize: 12, flex: 1, lineHeight: 17 },
  recommendedActionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingTop: Spacing.sm, marginTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  recommendedActionText: { fontSize: 12, flex: 1, lineHeight: 17 },
  sheetBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  sheetSection: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  sheetSectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: Spacing.sm },
  sheetBodyText: { fontSize: 13, lineHeight: 19 },
  sheetDetailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  sheetDetailItem: { width: '47%', marginBottom: Spacing.sm },
  sheetDetailValue: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  sheetDetailLabel: { fontSize: 11 },
  sheetProgressRow: { marginTop: Spacing.md },
  sheetProgressLabel: { fontSize: 12, marginBottom: Spacing.sm },
  sheetActions: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  sheetGhostButton: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, borderWidth: 1 },
  sheetGhostButtonText: { fontSize: 13, fontWeight: '600' },
});
