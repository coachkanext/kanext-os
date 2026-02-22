/**
 * Business Organization Legal Tab v2 — 7-tab Legal Hub.
 * Overview | Agreements | Signatures | Obligations | Templates | Requests | Exports
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
import { BizCard, BizSubTabBar, BizStatusChip, BizEmptyLock, statusVariant } from '@/components/business/business-shared';
import type { BusinessRoleLens } from '@/utils/business-rbac';
import { isFounder, isBoardLevel } from '@/utils/business-rbac';
import { useBusiness } from '@/context/business-context';
import type { CrossTabLink, BizReceipt } from '@/data/biz-org-shared-types';
import {
  KANEXT_HOLDCO,
  KANEXT_OPSCO,
  KANEXT_IP,
  VALUETAINMENT,
  SLIEMA_WANDERERS,
  SEEDED_ENTITY_NAMES,
} from '@/data/biz-org-shared-types';
import {
  LEGAL_SUB_TABS,
  AGREEMENT_TYPE_CHIPS,
  AGREEMENT_TYPE_LABEL,
  AGREEMENT_TYPE_COLOR,
  AGREEMENT_STATUS_COLOR,
  OBLIGATION_STATUS_COLOR,
  REQUEST_TYPE_LABEL,
  REQUEST_TYPE_COLOR,
  REQUEST_PRIORITY_COLOR,
  REQUEST_STATUS_COLOR,
  getBizLegalData,
} from '@/data/mock-biz-org-legal';
import type {
  LegalSubTabId,
  LegalAgreement,
  SignatureAuthority,
  LegalObligation,
  LegalTemplate,
  LegalRequest,
  LegalOverviewStats,
  LegalActivityEvent,
  LegalDeadline,
  LegalExportOption,
  AgreementType,
} from '@/data/mock-biz-org-legal';

const BP = BusinessPalette;

// =============================================================================
// ENHANCEMENT DATA
// =============================================================================

const CONTRACT_PIPELINE = {
  draft: 3,
  review: 2,
  sent: 1,
  executed: 12,
  expiring: 2,
};

const PIPELINE_STAGES: {
  key: keyof typeof CONTRACT_PIPELINE;
  label: string;
  color: string;
}[] = [
  { key: 'draft', label: 'Draft', color: '#A1A1AA' },
  { key: 'review', label: 'Review', color: '#F59E0B' },
  { key: 'sent', label: 'Sent', color: '#1D9BF0' },
  { key: 'executed', label: 'Executed', color: '#22C55E' },
  { key: 'expiring', label: 'Expiring', color: '#EF4444' },
];

const SAMPLE_KEY_TERMS = [
  { term: 'Term Length', value: '3 years' },
  { term: 'Auto-Renewal', value: 'Yes, 1-year increments' },
  { term: 'Termination Notice', value: '90 days' },
  { term: 'Governing Law', value: 'Delaware' },
];

const AUTHORITY_TYPES = [
  { type: 'contract_signing', label: 'Contract Signing', color: '#1D9BF0', threshold: '$500K' },
  { type: 'spend_approval', label: 'Spend Approval', color: '#22C55E', threshold: '$100K' },
  { type: 'policy_signoff', label: 'Policy Sign-off', color: '#1D9BF0', threshold: 'N/A' },
];

const OBLIGATION_LINKAGE: Record<string, { label: string; color: string }> = {
  payment: { label: '\u2192 Finance', color: '#22C55E' },
  compliance: { label: '\u2192 Compliance', color: '#1D9BF0' },
  deliverable: { label: '\u2192 Operations', color: '#1D9BF0' },
  renewal: { label: '\u2192 Legal', color: '#F59E0B' },
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
// HELPERS
// =============================================================================

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatAgreementStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatObligationStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatRequestStatus(status: string): string {
  switch (status) {
    case 'in_progress':
      return 'In Progress';
    case 'open':
      return 'Open';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
}

function formatRequestPriority(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function obligationStatusVariant(status: LegalObligation['status']): 'success' | 'warning' | 'error' | 'neutral' {
  switch (status) {
    case 'met':
      return 'success';
    case 'pending':
      return 'warning';
    case 'overdue':
      return 'error';
    case 'waived':
      return 'neutral';
  }
}

function deadlineUrgencyColor(urgency: LegalDeadline['urgency']): string {
  switch (urgency) {
    case 'overdue':
      return '#EF4444';
    case 'critical':
      return '#F59E0B';
    case 'soon':
      return '#1D9BF0';
    case 'normal':
      return '#22C55E';
  }
}

// =============================================================================
// SUB-COMPONENTS — Badges
// =============================================================================

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

function EmptyState({
  icon,
  text,
  colors,
}: {
  icon: string;
  text: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={s.emptyState}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>
        {text}
      </ThemedText>
    </View>
  );
}

// =============================================================================
// OVERVIEW TAB
// =============================================================================

function OverviewTab({
  colors,
  accentColor,
  stats,
  recentActivity,
  upcomingDeadlines,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  stats: LegalOverviewStats;
  recentActivity: LegalActivityEvent[];
  upcomingDeadlines: LegalDeadline[];
}) {
  const statCards = [
    {
      id: 'stat-1',
      label: 'Active Agreements',
      value: String(stats.activeAgreements),
      icon: 'doc.text.fill',
      color: '#22C55E',
    },
    {
      id: 'stat-2',
      label: 'Pending Signatures',
      value: String(stats.pendingSignatures),
      icon: 'pencil.line',
      color: '#F59E0B',
    },
    {
      id: 'stat-3',
      label: 'Upcoming Obligations',
      value: String(stats.upcomingObligations),
      icon: 'exclamationmark.triangle.fill',
      color: '#EF4444',
    },
    {
      id: 'stat-4',
      label: 'Open Requests',
      value: String(stats.openRequests),
      icon: 'tray.full.fill',
      color: '#1D9BF0',
    },
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.tabScroll}
    >
      {/* Contract Pipeline */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>
        Contract Pipeline
      </ThemedText>
      <View style={[s.pipelineRow, { marginBottom: Spacing.lg }]}>
        {PIPELINE_STAGES.map((stage) => (
          <View
            key={stage.key}
            style={[
              s.pipelineCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: stage.color,
                marginBottom: 4,
              }}
            />
            <ThemedText style={[s.pipelineCount, { color: stage.color }]}>
              {CONTRACT_PIPELINE[stage.key]}
            </ThemedText>
            <ThemedText style={[s.pipelineLabel, { color: colors.textSecondary }]}>
              {stage.label}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Stat Cards */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>
        Overview
      </ThemedText>
      <View style={s.statGrid}>
        {statCards.map((card) => (
          <View
            key={card.id}
            style={[
              s.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[s.statIconCircle, { backgroundColor: card.color + '18' }]}>
              <IconSymbol name={card.icon as any} size={18} color={card.color} />
            </View>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>
              {card.label}
            </ThemedText>
            <ThemedText style={[s.statValue, { color: card.color }]}>
              {card.value}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Recent Activity */}
      <ThemedText
        style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}
      >
        Recent Activity
      </ThemedText>
      <View
        style={[
          s.activityCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {recentActivity.map((item, index) => (
          <View
            key={item.id}
            style={[
              s.activityRow,
              index < recentActivity.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={[s.activityDot, { backgroundColor: accentColor }]} />
            <View style={s.activityTextCol}>
              <ThemedText
                style={[s.activityText, { color: colors.text }]}
                numberOfLines={2}
              >
                {item.text}
              </ThemedText>
              <ThemedText style={[s.activityTime, { color: colors.textTertiary }]}>
                {item.time}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Upcoming Deadlines */}
      <ThemedText
        style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}
      >
        Upcoming Deadlines
      </ThemedText>
      {upcomingDeadlines.map((dl) => {
        const urgencyColor = deadlineUrgencyColor(dl.urgency);
        return (
          <View
            key={dl.id}
            style={[
              s.deadlineCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderLeftColor: urgencyColor,
              },
            ]}
          >
            <View style={s.deadlineContent}>
              <ThemedText
                style={[s.deadlineLabel, { color: colors.text }]}
                numberOfLines={2}
              >
                {dl.label}
              </ThemedText>
              <View style={s.deadlineMeta}>
                <ThemedText
                  style={[
                    s.deadlineDate,
                    { color: colors.textSecondary, fontVariant: ['tabular-nums'] },
                  ]}
                >
                  {dl.dueDate}
                </ThemedText>
                <StatusBadge
                  label={
                    dl.daysRemaining < 0
                      ? `${Math.abs(dl.daysRemaining)}d OVERDUE`
                      : `${dl.daysRemaining}d remaining`
                  }
                  color={urgencyColor}
                />
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// AGREEMENTS TAB
// =============================================================================

function AgreementsTab({
  colors,
  accentColor,
  agreements,
  searchQuery,
  onSearchChange,
  activeTypeFilter,
  onTypeFilterChange,
  onSelectAgreement,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  agreements: LegalAgreement[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTypeFilter: AgreementType | 'all';
  onTypeFilterChange: (f: AgreementType | 'all') => void;
  onSelectAgreement: (a: LegalAgreement) => void;
}) {
  return (
    <View style={s.flex1}>
      {/* Search bar */}
      <View style={s.searchContainer}>
        <View
          style={[
            s.searchBar,
            {
              backgroundColor: colors.backgroundTertiary,
              borderColor: colors.border,
            },
          ]}
        >
          <IconSymbol
            name="magnifyingglass"
            size={16}
            color={colors.textTertiary}
          />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search agreements..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => onSearchChange('')} hitSlop={8}>
              <IconSymbol
                name="xmark.circle.fill"
                size={16}
                color={colors.textTertiary}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Type filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={s.filterChipRow}
      >
        {AGREEMENT_TYPE_CHIPS.map((chip) => {
          const isActive = chip.id === activeTypeFilter;
          return (
            <Pressable
              key={chip.id}
              style={[
                s.filterChip,
                {
                  backgroundColor: isActive
                    ? accentColor + '20'
                    : colors.backgroundTertiary,
                  borderColor: isActive ? accentColor + '40' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onTypeFilterChange(chip.id);
              }}
            >
              <ThemedText
                style={[
                  s.filterChipText,
                  { color: isActive ? accentColor : colors.textSecondary },
                ]}
              >
                {chip.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Agreement list */}
      <FlatList<LegalAgreement>
        data={agreements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="doc.text.fill"
            text="No agreements found"
            colors={colors}
          />
        }
        renderItem={({ item }) => {
          const typeColor = AGREEMENT_TYPE_COLOR[item.type];
          const statusColor = AGREEMENT_STATUS_COLOR[item.status];
          return (
            <Pressable
              style={({ pressed }) => [
                s.agreementCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelectAgreement(item);
              }}
            >
              {/* Header row */}
              <View style={s.agreementHeader}>
                <View style={s.agreementTitleCol}>
                  <ThemedText
                    style={[s.agreementTitle, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {item.title}
                  </ThemedText>
                  <View style={s.agreementBadgeRow}>
                    <StatusBadge
                      label={AGREEMENT_TYPE_LABEL[item.type].toUpperCase()}
                      color={typeColor}
                    />
                    <StatusBadge
                      label={formatAgreementStatus(item.status).toUpperCase()}
                      color={statusColor}
                    />
                  </View>
                </View>
              </View>

              {/* Meta info */}
              <View style={s.agreementMeta}>
                <View style={s.agreementMetaItem}>
                  <IconSymbol
                    name="person.fill"
                    size={12}
                    color={colors.textTertiary}
                  />
                  <ThemedText
                    style={[s.agreementMetaText, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {item.counterparty}
                  </ThemedText>
                </View>
                <View style={s.agreementMetaItem}>
                  <IconSymbol
                    name="building.2"
                    size={12}
                    color={colors.textTertiary}
                  />
                  <ThemedText
                    style={[s.agreementMetaText, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {item.entityName}
                  </ThemedText>
                </View>
              </View>

              {/* Bottom row: dates + value */}
              <View
                style={[
                  s.agreementFooter,
                  { borderTopColor: colors.border },
                ]}
              >
                <View style={s.agreementFooterItem}>
                  <ThemedText
                    style={[
                      s.agreementFooterValue,
                      { color: colors.text, fontVariant: ['tabular-nums'] },
                    ]}
                  >
                    {item.effectiveDate}
                  </ThemedText>
                  <ThemedText
                    style={[
                      s.agreementFooterLabel,
                      { color: colors.textTertiary },
                    ]}
                  >
                    Effective
                  </ThemedText>
                </View>
                <View style={s.agreementFooterItem}>
                  <ThemedText
                    style={[
                      s.agreementFooterValue,
                      { color: colors.text, fontVariant: ['tabular-nums'] },
                    ]}
                  >
                    {item.expiryDate}
                  </ThemedText>
                  <ThemedText
                    style={[
                      s.agreementFooterLabel,
                      { color: colors.textTertiary },
                    ]}
                  >
                    Expiry
                  </ThemedText>
                </View>
                <View style={s.agreementFooterItem}>
                  <ThemedText
                    style={[
                      s.agreementFooterValue,
                      { color: accentColor, fontVariant: ['tabular-nums'] },
                    ]}
                  >
                    {item.value}
                  </ThemedText>
                  <ThemedText
                    style={[
                      s.agreementFooterLabel,
                      { color: colors.textTertiary },
                    ]}
                  >
                    Value
                  </ThemedText>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

// =============================================================================
// SIGNATURES TAB
// =============================================================================

function SignaturesTab({
  colors,
  accentColor,
  authorities,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  authorities: SignatureAuthority[];
}) {
  return (
    <FlatList<SignatureAuthority>
      data={authorities}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <ThemedText
          style={[s.sectionTitle, { color: colors.text, marginBottom: Spacing.sm }]}
        >
          Signature Authority Matrix
        </ThemedText>
      }
      ListEmptyComponent={
        <EmptyState
          icon="pencil.line"
          text="No signature authorities configured"
          colors={colors}
        />
      }
      renderItem={({ item }) => (
        <View
          style={[
            s.signatureCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* Person info */}
          <View style={s.signatureHeader}>
            <View
              style={[s.signatureAvatar, { backgroundColor: accentColor + '20' }]}
            >
              <ThemedText style={[s.signatureAvatarText, { color: accentColor }]}>
                {getInitials(item.personName)}
              </ThemedText>
            </View>
            <View style={s.signatureInfo}>
              <ThemedText
                style={[s.signatureName, { color: colors.text }]}
                numberOfLines={1}
              >
                {item.personName}
              </ThemedText>
              <ThemedText
                style={[s.signatureTitle, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {item.personTitle}
              </ThemedText>
            </View>
            <View style={s.signatureAmountBadge}>
              <ThemedText
                style={[
                  s.signatureAmountText,
                  {
                    color:
                      item.maxAmount === 'Unlimited' ? '#22C55E' : accentColor,
                    fontVariant: ['tabular-nums'],
                  },
                ]}
              >
                {item.maxAmount}
              </ThemedText>
              <ThemedText
                style={[s.signatureAmountLabel, { color: colors.textTertiary }]}
              >
                Max Amount
              </ThemedText>
            </View>
          </View>

          {/* Entity */}
          <View style={s.signatureEntityRow}>
            <IconSymbol
              name="building.2"
              size={12}
              color={colors.textTertiary}
            />
            <ThemedText
              style={[s.signatureEntityText, { color: colors.textSecondary }]}
            >
              {item.entityName}
            </ThemedText>
          </View>

          {/* Agreement types */}
          <View
            style={[s.signatureTypesRow, { borderTopColor: colors.border }]}
          >
            <ThemedText
              style={[s.signatureTypesLabel, { color: colors.textTertiary }]}
            >
              Authorized Types:
            </ThemedText>
            <View style={s.signatureTypesWrap}>
              {item.types.map((type, idx) => (
                <StatusBadge key={idx} label={type} color={accentColor} />
              ))}
            </View>
          </View>

          {/* Authority Types */}
          <View
            style={[
              s.signatureTypesRow,
              { borderTopColor: colors.border },
            ]}
          >
            <ThemedText
              style={[s.signatureTypesLabel, { color: colors.textTertiary }]}
            >
              Authority Types:
            </ThemedText>
            <View style={s.signatureTypesWrap}>
              {AUTHORITY_TYPES.map((at) => (
                <View key={at.type} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={[s.authorityTypeBadge, { backgroundColor: at.color + '20' }]}>
                    <ThemedText style={[s.badgeText, { color: at.color }]}>
                      {at.label.toUpperCase()}
                    </ThemedText>
                  </View>
                  <ThemedText style={[s.authorityThreshold, { color: at.color }]}>
                    {'>'}{at.threshold}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>

          {/* Cross-link to People */}
          <Pressable
            style={[s.crossLinkRow, { backgroundColor: accentColor + '08' }]}
            onPress={() =>
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            }
          >
            <IconSymbol name="link" size={12} color={accentColor} />
            <ThemedText style={[s.crossLinkText, { color: accentColor }]}>
              View in People tab
            </ThemedText>
            <IconSymbol
              name="chevron.right"
              size={12}
              color={accentColor}
            />
          </Pressable>
        </View>
      )}
    />
  );
}

// =============================================================================
// OBLIGATIONS TAB
// =============================================================================

function ObligationsTab({
  colors,
  accentColor,
  obligations,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  obligations: LegalObligation[];
}) {
  // Sort: overdue first, then pending, then met/waived
  const sortedObligations = useMemo(() => {
    const priority: Record<LegalObligation['status'], number> = {
      overdue: 0,
      pending: 1,
      met: 2,
      waived: 3,
    };
    return [...obligations].sort(
      (a, b) => priority[a.status] - priority[b.status]
    );
  }, [obligations]);

  return (
    <FlatList<LegalObligation>
      data={sortedObligations}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState
          icon="exclamationmark.triangle.fill"
          text="No obligations found"
          colors={colors}
        />
      }
      renderItem={({ item }) => {
        const statusColor = OBLIGATION_STATUS_COLOR[item.status];
        const variant = obligationStatusVariant(item.status);
        return (
          <View
            style={[
              s.obligationCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderLeftColor: statusColor,
              },
            ]}
          >
            {/* Description + status */}
            <View style={s.obligationHeader}>
              <ThemedText
                style={[s.obligationDescription, { color: colors.text }]}
                numberOfLines={3}
              >
                {item.description}
              </ThemedText>
              <BizStatusChip
                label={formatObligationStatus(item.status).toUpperCase()}
                variant={variant}
              />
            </View>

            {/* Originating agreement */}
            <View style={s.obligationAgreementRow}>
              <IconSymbol
                name="doc.text"
                size={12}
                color={colors.textTertiary}
              />
              <ThemedText
                style={[
                  s.obligationAgreementText,
                  { color: colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {item.agreementTitle}
              </ThemedText>
            </View>

            {/* Due date */}
            <View style={s.obligationMetaRow}>
              <View style={s.obligationMetaItem}>
                <IconSymbol
                  name="calendar"
                  size={12}
                  color={colors.textTertiary}
                />
                <ThemedText
                  style={[
                    s.obligationMetaText,
                    {
                      color:
                        item.status === 'overdue'
                          ? '#EF4444'
                          : colors.textSecondary,
                      fontVariant: ['tabular-nums'],
                    },
                  ]}
                >
                  Due: {item.dueDate}
                </ThemedText>
              </View>
              <View style={s.obligationMetaItem}>
                <IconSymbol
                  name="building.2"
                  size={12}
                  color={colors.textTertiary}
                />
                <ThemedText
                  style={[
                    s.obligationMetaText,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {item.entityName}
                </ThemedText>
              </View>
            </View>

            {/* Impacts */}
            {(item.financialImpact || item.complianceImpact) && (
              <View
                style={[
                  s.obligationImpacts,
                  { borderTopColor: colors.border },
                ]}
              >
                {item.financialImpact && (
                  <View style={s.obligationImpactRow}>
                    <IconSymbol
                      name="dollarsign.circle.fill"
                      size={14}
                      color="#F59E0B"
                    />
                    <ThemedText
                      style={[
                        s.obligationImpactText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Financial Impact:{' '}
                      <ThemedText
                        style={{
                          color: '#F59E0B',
                          fontWeight: '700',
                          fontVariant: ['tabular-nums'],
                        }}
                      >
                        {item.financialImpact}
                      </ThemedText>
                    </ThemedText>
                  </View>
                )}
                {item.complianceImpact && (
                  <View style={s.obligationImpactRow}>
                    <IconSymbol
                      name="exclamationmark.shield.fill"
                      size={14}
                      color="#EF4444"
                    />
                    <ThemedText
                      style={[
                        s.obligationImpactText,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={2}
                    >
                      Compliance:{' '}
                      <ThemedText style={{ color: '#EF4444', fontWeight: '600' }}>
                        {item.complianceImpact}
                      </ThemedText>
                    </ThemedText>
                  </View>
                )}
              </View>
            )}

            {/* Linkage Indicators */}
            <View
              style={[
                s.obligationImpacts,
                { borderTopColor: colors.border, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
              ]}
            >
              {/* Derive linkage types from obligation characteristics */}
              {item.financialImpact && OBLIGATION_LINKAGE.payment && (
                <View style={[s.linkageChip, { backgroundColor: OBLIGATION_LINKAGE.payment.color + '18' }]}>
                  <ThemedText style={[s.linkageChipText, { color: OBLIGATION_LINKAGE.payment.color }]}>
                    {OBLIGATION_LINKAGE.payment.label}
                  </ThemedText>
                </View>
              )}
              {item.complianceImpact && OBLIGATION_LINKAGE.compliance && (
                <View style={[s.linkageChip, { backgroundColor: OBLIGATION_LINKAGE.compliance.color + '18' }]}>
                  <ThemedText style={[s.linkageChipText, { color: OBLIGATION_LINKAGE.compliance.color }]}>
                    {OBLIGATION_LINKAGE.compliance.label}
                  </ThemedText>
                </View>
              )}
              {item.description.toLowerCase().includes('deliver') && OBLIGATION_LINKAGE.deliverable && (
                <View style={[s.linkageChip, { backgroundColor: OBLIGATION_LINKAGE.deliverable.color + '18' }]}>
                  <ThemedText style={[s.linkageChipText, { color: OBLIGATION_LINKAGE.deliverable.color }]}>
                    {OBLIGATION_LINKAGE.deliverable.label}
                  </ThemedText>
                </View>
              )}
              {(item.description.toLowerCase().includes('renew') || item.status === 'pending') && OBLIGATION_LINKAGE.renewal && (
                <View style={[s.linkageChip, { backgroundColor: OBLIGATION_LINKAGE.renewal.color + '18' }]}>
                  <ThemedText style={[s.linkageChipText, { color: OBLIGATION_LINKAGE.renewal.color }]}>
                    {OBLIGATION_LINKAGE.renewal.label}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        );
      }}
    />
  );
}

// =============================================================================
// TEMPLATES TAB
// =============================================================================

function TemplatesTab({
  colors,
  accentColor,
  templates,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  templates: LegalTemplate[];
}) {
  return (
    <FlatList<LegalTemplate>
      data={templates}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <ThemedText
          style={[s.sectionTitle, { color: colors.text, marginBottom: Spacing.sm }]}
        >
          Template Library
        </ThemedText>
      }
      ListEmptyComponent={
        <EmptyState
          icon="doc.on.doc.fill"
          text="No templates available"
          colors={colors}
        />
      }
      renderItem={({ item }) => {
        const typeColor = AGREEMENT_TYPE_COLOR[item.type];
        return (
          <View
            style={[
              s.templateCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={s.templateHeader}>
              <View style={[s.templateIconCircle, { backgroundColor: typeColor + '18' }]}>
                <IconSymbol name="doc.on.doc.fill" size={18} color={typeColor} />
              </View>
              <View style={s.templateInfo}>
                <ThemedText
                  style={[s.templateName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.name}
                </ThemedText>
                <View style={s.templateBadgeRow}>
                  <StatusBadge
                    label={AGREEMENT_TYPE_LABEL[item.type].toUpperCase()}
                    color={typeColor}
                  />
                  <StatusBadge
                    label={`v${item.version}`}
                    color={accentColor}
                  />
                </View>
              </View>
            </View>

            <ThemedText
              style={[s.templateDescription, { color: colors.textSecondary }]}
              numberOfLines={3}
            >
              {item.description}
            </ThemedText>

            <View style={[s.templateFooter, { borderTopColor: colors.border }]}>
              <View style={s.templateFooterItem}>
                <IconSymbol
                  name="calendar"
                  size={12}
                  color={colors.textTertiary}
                />
                <ThemedText
                  style={[
                    s.templateFooterText,
                    { color: colors.textSecondary, fontVariant: ['tabular-nums'] },
                  ]}
                >
                  Updated: {item.lastUpdated}
                </ThemedText>
              </View>
              <Pressable
                style={({ pressed }) => [
                  s.templateUseBtn,
                  { backgroundColor: accentColor + '15' },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                }
              >
                <IconSymbol name="doc.badge.plus" size={14} color={accentColor} />
                <ThemedText style={[s.templateUseBtnText, { color: accentColor }]}>
                  Use Template
                </ThemedText>
              </Pressable>
            </View>
          </View>
        );
      }}
    />
  );
}

// =============================================================================
// REQUESTS TAB
// =============================================================================

function RequestsTab({
  colors,
  accentColor,
  requests,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  requests: LegalRequest[];
}) {
  // Sort by priority: urgent > high > normal > low
  const sortedRequests = useMemo(() => {
    const priorityOrder: Record<LegalRequest['priority'], number> = {
      urgent: 0,
      high: 1,
      normal: 2,
      low: 3,
    };
    return [...requests].sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }, [requests]);

  return (
    <FlatList<LegalRequest>
      data={sortedRequests}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <ThemedText
          style={[s.sectionTitle, { color: colors.text, marginBottom: Spacing.sm }]}
        >
          Legal Request Queue
        </ThemedText>
      }
      ListEmptyComponent={
        <EmptyState
          icon="tray.full.fill"
          text="No open requests"
          colors={colors}
        />
      }
      renderItem={({ item }) => {
        const typeColor = REQUEST_TYPE_COLOR[item.type];
        const priorityColor = REQUEST_PRIORITY_COLOR[item.priority];
        const statusColor = REQUEST_STATUS_COLOR[item.status];
        return (
          <View
            style={[
              s.requestCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderLeftColor: priorityColor,
              },
            ]}
          >
            {/* Title + badges */}
            <View style={s.requestHeader}>
              <ThemedText
                style={[s.requestTitle, { color: colors.text }]}
                numberOfLines={2}
              >
                {item.title}
              </ThemedText>
              <View style={s.requestBadgeRow}>
                <StatusBadge
                  label={REQUEST_TYPE_LABEL[item.type].toUpperCase()}
                  color={typeColor}
                />
                <StatusBadge
                  label={formatRequestPriority(item.priority).toUpperCase()}
                  color={priorityColor}
                />
                <StatusBadge
                  label={formatRequestStatus(item.status).toUpperCase()}
                  color={statusColor}
                />
              </View>
            </View>

            {/* Meta */}
            <View style={[s.requestMeta, { borderTopColor: colors.border }]}>
              <View style={s.requestMetaItem}>
                <IconSymbol
                  name="person.fill"
                  size={12}
                  color={colors.textTertiary}
                />
                <ThemedText
                  style={[s.requestMetaText, { color: colors.textSecondary }]}
                >
                  Requested by: {item.requestedBy}
                </ThemedText>
              </View>
              <View style={s.requestMetaItem}>
                <IconSymbol
                  name="person.badge.clock"
                  size={12}
                  color={colors.textTertiary}
                />
                <ThemedText
                  style={[
                    s.requestMetaText,
                    {
                      color: item.assignee
                        ? colors.textSecondary
                        : '#F59E0B',
                    },
                  ]}
                >
                  {item.assignee ?? 'Unassigned'}
                </ThemedText>
              </View>
              <View style={s.requestMetaItem}>
                <IconSymbol
                  name="calendar"
                  size={12}
                  color={colors.textTertiary}
                />
                <ThemedText
                  style={[
                    s.requestMetaText,
                    { color: colors.textSecondary, fontVariant: ['tabular-nums'] },
                  ]}
                >
                  {item.createdDate}
                </ThemedText>
              </View>
              <View style={s.requestMetaItem}>
                <IconSymbol
                  name="building.2"
                  size={12}
                  color={colors.textTertiary}
                />
                <ThemedText
                  style={[s.requestMetaText, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {item.entityName}
                </ThemedText>
              </View>
            </View>
          </View>
        );
      }}
    />
  );
}

// =============================================================================
// EXPORTS TAB
// =============================================================================

function ExportsTab({
  colors,
  accentColor,
  exportOptions,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  exportOptions: LegalExportOption[];
}) {
  return (
    <FlatList<LegalExportOption>
      data={exportOptions}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <ThemedText
          style={[s.sectionTitle, { color: colors.text, marginBottom: Spacing.sm }]}
        >
          Export Options
        </ThemedText>
      }
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [
            s.exportCard,
            { backgroundColor: colors.card, borderColor: colors.border },
            pressed && { opacity: 0.85 },
          ]}
          onPress={() =>
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          }
        >
          <View style={s.exportRow}>
            <View
              style={[
                s.exportIconCircle,
                { backgroundColor: accentColor + '18' },
              ]}
            >
              <IconSymbol
                name={item.icon as any}
                size={20}
                color={accentColor}
              />
            </View>
            <View style={s.exportInfo}>
              <ThemedText
                style={[s.exportLabel, { color: colors.text }]}
                numberOfLines={1}
              >
                {item.label}
              </ThemedText>
              <ThemedText
                style={[s.exportDescription, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {item.description}
              </ThemedText>
              <View style={s.exportFormatRow}>
                <StatusBadge label={item.format} color={accentColor} />
              </View>
            </View>
            <IconSymbol
              name="square.and.arrow.up"
              size={18}
              color={accentColor}
            />
          </View>
        </Pressable>
      )}
    />
  );
}

// =============================================================================
// AGREEMENT DETAIL BOTTOM SHEET
// =============================================================================

function AgreementDetailSheet({
  visible,
  onClose,
  agreement,
  colors,
  accentColor,
  role,
}: {
  visible: boolean;
  onClose: () => void;
  agreement: LegalAgreement | null;
  colors: typeof Colors.light;
  accentColor: string;
  role: BusinessRoleLens;
}) {
  if (!agreement) return null;

  const typeColor = AGREEMENT_TYPE_COLOR[agreement.type];
  const statusColor = AGREEMENT_STATUS_COLOR[agreement.status];

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={agreement.title}
      useModal
    >
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge
          label={AGREEMENT_TYPE_LABEL[agreement.type].toUpperCase()}
          color={typeColor}
        />
        <StatusBadge
          label={formatAgreementStatus(agreement.status).toUpperCase()}
          color={statusColor}
        />
      </View>

      {/* KPIs */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText
            style={[
              s.sheetKpiValue,
              { color: accentColor, fontVariant: ['tabular-nums'] },
            ]}
          >
            {agreement.value}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>
            Value
          </ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText
            style={[
              s.sheetKpiValue,
              { color: colors.text, fontVariant: ['tabular-nums'] },
            ]}
          >
            {agreement.effectiveDate}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>
            Effective
          </ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText
            style={[
              s.sheetKpiValue,
              { color: colors.text, fontVariant: ['tabular-nums'] },
            ]}
          >
            {agreement.expiryDate}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>
            Expiry
          </ThemedText>
        </View>
      </View>

      {/* Counterparty */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Counterparty
        </ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {agreement.counterparty}
        </ThemedText>
      </View>

      {/* Entity */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Entity
        </ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {agreement.entityName}
        </ThemedText>
      </View>

      {/* Summary */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Summary
        </ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {agreement.summary}
        </ThemedText>
      </View>

      {/* Key Terms — founder/board only */}
      {(isFounder(role) || isBoardLevel(role)) && (
        <View style={[s.sheetSection, { borderColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
            Key Terms
          </ThemedText>
          <View style={s.keyTermsGrid}>
            {SAMPLE_KEY_TERMS.map((kt, idx) => (
              <View key={idx} style={s.keyTermRow}>
                <ThemedText
                  style={[s.keyTermLabel, { color: colors.textTertiary }]}
                  numberOfLines={1}
                >
                  {kt.term}
                </ThemedText>
                <ThemedText
                  style={[s.keyTermValue, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {kt.value}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>
            View Full Agreement
          </ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText
            style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}
          >
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function BizOrgLegalV2({ colors, accentColor, role = 'B1' }: Props) {
  // === RBAC Gate: Only B1 and B2b (board) can access legal ===
  if (!isBoardLevel(role)) {
    return <BizEmptyLock title="Legal" message="This section is restricted. Contact the Founder for access." />;
  }

  // === Entity Scope ===
  const { selectedEntityId } = useBusiness();
  // TODO: filter legal data by selectedEntityId when backend supports entity-scoped queries

  // === State ===
  const [activeTab, setActiveTab] = useState<LegalSubTabId>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState<
    AgreementType | 'all'
  >('all');
  const [selectedAgreement, setSelectedAgreement] =
    useState<LegalAgreement | null>(null);
  const [showAgreementDetail, setShowAgreementDetail] = useState(false);

  // === Data ===
  const data = useMemo(() => getBizLegalData(), []);

  // === Filtered agreements ===
  const filteredAgreements = useMemo(() => {
    let result = data.agreements;

    // Filter by type
    if (activeTypeFilter !== 'all') {
      result = result.filter((a) => a.type === activeTypeFilter);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.counterparty.toLowerCase().includes(q) ||
          a.entityName.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q)
      );
    }

    return result;
  }, [data.agreements, activeTypeFilter, searchQuery]);

  // === Callbacks ===
  const handleTabChange = useCallback((tabId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId as LegalSubTabId);
    // Reset search when changing tabs
    setSearchQuery('');
    setActiveTypeFilter('all');
  }, []);

  const handleSelectAgreement = useCallback((agreement: LegalAgreement) => {
    setSelectedAgreement(agreement);
    setShowAgreementDetail(true);
  }, []);

  // === Tab content renderer ===
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            colors={colors}
            accentColor={accentColor}
            stats={data.overviewStats}
            recentActivity={data.recentActivity}
            upcomingDeadlines={data.upcomingDeadlines}
          />
        );
      case 'agreements':
        return (
          <AgreementsTab
            colors={colors}
            accentColor={accentColor}
            agreements={filteredAgreements}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTypeFilter={activeTypeFilter}
            onTypeFilterChange={setActiveTypeFilter}
            onSelectAgreement={handleSelectAgreement}
          />
        );
      case 'signatures':
        return (
          <SignaturesTab
            colors={colors}
            accentColor={accentColor}
            authorities={data.signatureAuthorities}
          />
        );
      case 'obligations':
        return (
          <ObligationsTab
            colors={colors}
            accentColor={accentColor}
            obligations={data.obligations}
          />
        );
      case 'templates':
        return (
          <TemplatesTab
            colors={colors}
            accentColor={accentColor}
            templates={data.templates}
          />
        );
      case 'requests':
        return (
          <RequestsTab
            colors={colors}
            accentColor={accentColor}
            requests={data.requests}
          />
        );
      case 'exports':
        return (
          <ExportsTab
            colors={colors}
            accentColor={accentColor}
            exportOptions={data.exportOptions}
          />
        );
      default:
        return null;
    }
  };

  // === Render ===
  return (
    <View style={s.container}>
      {/* Sub-tab bar */}
      <BizSubTabBar
        tabs={LEGAL_SUB_TABS}
        activeId={activeTab}
        onSelect={handleTabChange}
      />

      {/* Tab content */}
      <View style={s.contentArea}>{renderTabContent()}</View>

      {/* Agreement Detail Bottom Sheet */}
      <AgreementDetailSheet
        visible={showAgreementDetail}
        onClose={() => setShowAgreementDetail(false)}
        agreement={selectedAgreement}
        colors={colors}
        accentColor={accentColor}
        role={role}
      />
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
  flex1: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
  },

  // === Tab scroll containers ===
  tabScroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 120,
    gap: Spacing.sm,
  },

  // === Section titles ===
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },

  // === Badges ===
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

  // === Empty state ===
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

  // === Search ===
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    height: 40,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },

  // === Filter chips ===
  filterChipRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
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
    fontWeight: '600',
  },

  // ===================================================================
  // OVERVIEW TAB
  // ===================================================================

  // Stat grid
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
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
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // Activity
  activityCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  activityTextCol: {
    flex: 1,
  },
  activityText: {
    fontSize: 13,
    lineHeight: 18,
  },
  activityTime: {
    fontSize: 11,
    marginTop: 2,
  },

  // Deadlines
  deadlineCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  deadlineContent: {
    gap: 6,
  },
  deadlineLabel: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19,
  },
  deadlineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deadlineDate: {
    fontSize: 12,
  },

  // ===================================================================
  // AGREEMENTS TAB
  // ===================================================================

  agreementCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  agreementHeader: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  agreementTitleCol: {
    gap: 6,
  },
  agreementTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
  agreementBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  agreementMeta: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: 4,
  },
  agreementMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  agreementMetaText: {
    fontSize: 12,
    flex: 1,
  },
  agreementFooter: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  agreementFooterItem: {
    flex: 1,
    alignItems: 'center',
  },
  agreementFooterValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  agreementFooterLabel: {
    fontSize: 10,
    marginTop: 2,
  },

  // ===================================================================
  // SIGNATURES TAB
  // ===================================================================

  signatureCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  signatureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  signatureAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureAvatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  signatureInfo: {
    flex: 1,
  },
  signatureName: {
    fontSize: 15,
    fontWeight: '600',
  },
  signatureTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  signatureAmountBadge: {
    alignItems: 'flex-end',
  },
  signatureAmountText: {
    fontSize: 14,
    fontWeight: '700',
  },
  signatureAmountLabel: {
    fontSize: 9,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  signatureEntityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  signatureEntityText: {
    fontSize: 12,
  },
  signatureTypesRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  signatureTypesLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  signatureTypesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  crossLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  crossLinkText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },

  // ===================================================================
  // OBLIGATIONS TAB
  // ===================================================================

  obligationCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderLeftWidth: 3,
    overflow: 'hidden',
  },
  obligationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  obligationDescription: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19,
    flex: 1,
  },
  obligationAgreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  obligationAgreementText: {
    fontSize: 12,
    flex: 1,
  },
  obligationMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  obligationMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  obligationMetaText: {
    fontSize: 12,
  },
  obligationImpacts: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  obligationImpactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  obligationImpactText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },

  // ===================================================================
  // TEMPLATES TAB
  // ===================================================================

  templateCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  templateIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateInfo: {
    flex: 1,
    gap: 4,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
  },
  templateBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  templateDescription: {
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  templateFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  templateFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  templateFooterText: {
    fontSize: 12,
  },
  templateUseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  templateUseBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ===================================================================
  // REQUESTS TAB
  // ===================================================================

  requestCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderLeftWidth: 3,
    overflow: 'hidden',
  },
  requestHeader: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: 6,
  },
  requestTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
  requestBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  requestMeta: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  requestMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  requestMetaText: {
    fontSize: 12,
  },

  // ===================================================================
  // EXPORTS TAB
  // ===================================================================

  exportCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  exportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  exportIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportInfo: {
    flex: 1,
    gap: 4,
  },
  exportLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  exportDescription: {
    fontSize: 12,
    lineHeight: 17,
  },
  exportFormatRow: {
    flexDirection: 'row',
    marginTop: 2,
  },

  // ===================================================================
  // AGREEMENT DETAIL BOTTOM SHEET
  // ===================================================================

  sheetBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sheetKpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
  },
  sheetKpiItem: {
    alignItems: 'center',
  },
  sheetKpiValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  sheetKpiLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  sheetSection: {
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  sheetSectionBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  sheetActions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  sheetActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  sheetActionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
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

  // ===================================================================
  // CONTRACT PIPELINE
  // ===================================================================

  pipelineRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  pipelineCard: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  pipelineCount: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  pipelineLabel: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 2,
  },

  // ===================================================================
  // KEY TERMS (Agreement Detail Sheet)
  // ===================================================================

  keyTermsGrid: {
    gap: 6,
  },
  keyTermRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  keyTermLabel: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  keyTermValue: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },

  // ===================================================================
  // AUTHORITY TYPES (Signatures Tab)
  // ===================================================================

  authorityTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  authorityThreshold: {
    fontSize: 10,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // ===================================================================
  // LINKAGE CHIPS (Obligations Tab)
  // ===================================================================

  linkageChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  linkageChipText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
