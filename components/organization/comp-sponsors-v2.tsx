/**
 * Competition Organization Sponsors Tab — 10-tab Sponsors Hub.
 * Dashboard, Sponsors, Packages, Activations, Contracts, Fulfillment, Assets, Revenue, Prospecting, Settings.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, TextInput, Pressable, Switch, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import {
  COMP_SPONSORS_TABS,
  COMP_SPONSORS_SCOPE_CHIPS,
  TIER_COLOR,
  SPONSOR_STATUS_COLOR,
  ACTIVATION_STATUS_COLOR,
  CONTRACT_STATUS_COLOR,
  FULFILLMENT_STATUS_COLOR,
  PROSPECT_STAGE_COLOR,
  getCompSponsorsData,
} from '@/data/mock-comp-org-sponsors';
import type {
  CompSponsorsTabId,
  SponsorsDashboardBlock,
  CompSponsor,
  SponsorPackage,
  Activation,
  SponsorContract,
  FulfillmentItem,
  SponsorAsset,
  SponsorRevenue,
  Prospect,
  SponsorSettingToggle,
} from '@/data/mock-comp-org-sponsors';

// =============================================================================
// PROPS
// =============================================================================


const ACCENT = MODE_ACCENT.competition;
interface Props {
  colors: typeof Colors.light;
  accentColor: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function tierLabel(tier: CompSponsor['tier']): string {
  switch (tier) {
    case 'title': return 'TITLE';
    case 'gold': return 'GOLD';
    case 'silver': return 'SILVER';
    case 'bronze': return 'BRONZE';
    case 'in-kind': return 'IN-KIND';
  }
}

function activationTypeLabel(type: Activation['type']): string {
  switch (type) {
    case 'signage': return 'SIGNAGE';
    case 'digital': return 'DIGITAL';
    case 'event': return 'EVENT';
    case 'product': return 'PRODUCT';
    case 'media': return 'MEDIA';
    case 'naming-rights': return 'NAMING RIGHTS';
  }
}

function assetTypeLabel(type: SponsorAsset['type']): string {
  switch (type) {
    case 'logo': return 'LOGO';
    case 'banner': return 'BANNER';
    case 'video': return 'VIDEO';
    case 'audio': return 'AUDIO';
    case 'document': return 'DOCUMENT';
    case 'social-media': return 'SOCIAL';
  }
}

function assetTypeIcon(type: SponsorAsset['type']): string {
  switch (type) {
    case 'logo': return 'photo.fill';
    case 'banner': return 'rectangle.fill';
    case 'video': return 'video.fill';
    case 'audio': return 'speaker.wave.2.fill';
    case 'document': return 'doc.text.fill';
    case 'social-media': return 'square.and.arrow.up.fill';
  }
}

function revenueTypeLabel(type: SponsorRevenue['type']): string {
  switch (type) {
    case 'cash': return 'CASH';
    case 'in-kind': return 'IN-KIND';
    case 'bonus': return 'BONUS';
    case 'renewal': return 'RENEWAL';
  }
}

function revenueTypeColor(type: SponsorRevenue['type']): string {
  switch (type) {
    case 'cash': return '#22C55E';
    case 'in-kind': return ACCENT;
    case 'bonus': return '#F59E0B';
    case 'renewal': return ACCENT;
  }
}

function revenueStatusColor(status: SponsorRevenue['status']): string {
  switch (status) {
    case 'received': return '#22C55E';
    case 'invoiced': return ACCENT;
    case 'overdue': return '#EF4444';
    case 'projected': return '#A1A1AA';
  }
}

function assetStatusColor(status: SponsorAsset['status']): string {
  switch (status) {
    case 'approved': return '#22C55E';
    case 'pending': return '#F59E0B';
    case 'rejected': return '#EF4444';
  }
}

function prospectStageLabel(stage: Prospect['stage']): string {
  switch (stage) {
    case 'lead': return 'LEAD';
    case 'outreach': return 'OUTREACH';
    case 'meeting': return 'MEETING';
    case 'proposal': return 'PROPOSAL';
    case 'negotiation': return 'NEGOTIATION';
    case 'closed-won': return 'CLOSED WON';
    case 'closed-lost': return 'CLOSED LOST';
  }
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
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
// DASHBOARD TAB
// =============================================================================

function DashboardTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getCompSponsorsData>;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* KPI Cards */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Overview</ThemedText>
      <View style={s.kpiGrid}>
        {data.dashboard.map((block: SponsorsDashboardBlock) => (
          <View
            key={block.id}
            style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.kpiHeader}>
              <IconSymbol name={block.icon as any} size={18} color={block.color} />
              <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>
                {block.label}
              </ThemedText>
            </View>
            <ThemedText style={[s.kpiValue, { color: colors.text }]}>{block.value}</ThemedText>
            <ThemedText style={[s.kpiDelta, { color: colors.textTertiary }]}>{block.delta}</ThemedText>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Quick Actions
      </ThemedText>
      <View style={s.quickActionsGrid}>
        {data.quickActions.map((action) => (
          <Pressable
            key={action.id}
            style={[s.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[s.quickActionIconCircle, { backgroundColor: action.color + '18' }]}>
              <IconSymbol name={action.icon as any} size={20} color={action.color} />
            </View>
            <ThemedText style={[s.quickActionLabel, { color: colors.text }]} numberOfLines={1}>
              {action.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* Recent Activity */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Recent Activity
      </ThemedText>
      <View style={[s.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {data.recentActivity.map((item, index) => (
          <View
            key={item.id}
            style={[
              s.activityRow,
              index < data.recentActivity.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={[s.activityDot, { backgroundColor: accentColor }]} />
            <View style={s.activityTextCol}>
              <ThemedText style={[s.activityText, { color: colors.text }]} numberOfLines={2}>
                {item.text}
              </ThemedText>
              <ThemedText style={[s.activityTime, { color: colors.textTertiary }]}>
                {item.time}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// SPONSORS TAB
// =============================================================================

function SponsorsTab({
  colors,
  accentColor,
  data,
  onSelectSponsor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: CompSponsor[];
  onSelectSponsor: (sponsor: CompSponsor) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const tColor = TIER_COLOR[item.tier];
        const stColor = SPONSOR_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.sponsorCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectSponsor(item);
            }}
          >
            {/* Top row: logo + name + badges */}
            <View style={s.sponsorCardTop}>
              <View style={s.sponsorCardInfo}>
                <View style={[s.sponsorLogoCircle, { backgroundColor: tColor + '30' }]}>
                  <ThemedText style={[s.sponsorLogoText, { color: tColor }]}>
                    {item.logoPlaceholder}
                  </ThemedText>
                </View>
                <View style={s.sponsorCardMid}>
                  <ThemedText style={[s.sponsorCardName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <View style={s.sponsorCardBadgeRow}>
                    <StatusBadge label={tierLabel(item.tier)} color={tColor} />
                    <StatusBadge label={item.status.toUpperCase()} color={stColor} />
                  </View>
                </View>
              </View>
            </View>

            {/* Details */}
            <View style={[s.sponsorCardDetails, { borderTopColor: colors.border }]}>
              <View style={s.sponsorDetailItem}>
                <ThemedText style={[s.sponsorDetailValue, { color: colors.text }]}>
                  {item.annualValueFormatted}
                </ThemedText>
                <ThemedText style={[s.sponsorDetailLabel, { color: colors.textTertiary }]}>
                  Annual
                </ThemedText>
              </View>
              <View style={s.sponsorDetailItem}>
                <ThemedText style={[s.sponsorDetailValue, { color: colors.text }]}>
                  {item.activationsCount}
                </ThemedText>
                <ThemedText style={[s.sponsorDetailLabel, { color: colors.textTertiary }]}>
                  Activations
                </ThemedText>
              </View>
              <View style={s.sponsorDetailItem}>
                <ThemedText style={[s.sponsorDetailValue, { color: colors.text }]}>
                  {item.fulfillmentPct}%
                </ThemedText>
                <ThemedText style={[s.sponsorDetailLabel, { color: colors.textTertiary }]}>
                  Fulfilled
                </ThemedText>
              </View>
            </View>

            {/* Contact + dates */}
            <View style={s.sponsorCardFooter}>
              <ThemedText style={[s.sponsorContact, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.contactName}
              </ThemedText>
              <ThemedText style={[s.sponsorDates, { color: colors.textTertiary }]}>
                {item.startDate} \u2013 {item.endDate}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="building.2.fill" label="No sponsors found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// PACKAGES TAB
// =============================================================================

function PackagesTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: SponsorPackage[];
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const tColor = TIER_COLOR[item.tier];
        const statusLabel = item.status === 'sold-out' ? 'SOLD OUT'
          : item.status === 'custom' ? 'CUSTOM'
          : 'AVAILABLE';
        const statusColor = item.status === 'sold-out' ? '#EF4444'
          : item.status === 'custom' ? ACCENT
          : '#22C55E';
        return (
          <View style={[s.packageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.packageHeader}>
              <View style={s.packageHeaderLeft}>
                <ThemedText style={[s.packageName, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </ThemedText>
                <ThemedText style={[s.packagePrice, { color: accentColor }]}>
                  {item.price}
                </ThemedText>
              </View>
              <View style={s.packageBadges}>
                <StatusBadge label={tierLabel(item.tier)} color={tColor} />
                <StatusBadge label={statusLabel} color={statusColor} />
              </View>
            </View>

            {/* Capacity bar */}
            <View style={s.packageCapacity}>
              <View style={s.packageCapacityBar}>
                <View
                  style={[
                    s.packageCapacityFill,
                    {
                      backgroundColor: tColor,
                      width: item.maxSponsors > 0
                        ? `${Math.min((item.currentSponsors / item.maxSponsors) * 100, 100)}%`
                        : '0%',
                    },
                  ]}
                />
              </View>
              <ThemedText style={[s.packageCapacityText, { color: colors.textSecondary }]}>
                {item.currentSponsors}/{item.maxSponsors} sponsors
              </ThemedText>
            </View>

            {/* Benefits list */}
            <View style={[s.benefitsList, { borderTopColor: colors.border }]}>
              {item.benefits.map((benefit, idx) => (
                <View key={idx} style={s.benefitRow}>
                  <IconSymbol name="checkmark.circle.fill" size={14} color={tColor} />
                  <ThemedText style={[s.benefitText, { color: colors.textSecondary }]}>
                    {benefit}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="shippingbox.fill" label="No packages configured" colors={colors} />
      }
    />
  );
}

// =============================================================================
// ACTIVATIONS TAB
// =============================================================================

function ActivationsTab({
  colors,
  data,
  onSelectActivation,
}: {
  colors: typeof Colors.light;
  data: Activation[];
  onSelectActivation: (activation: Activation) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = ACTIVATION_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.activationCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectActivation(item);
            }}
          >
            <View style={s.activationHeader}>
              <View style={s.activationHeaderLeft}>
                <ThemedText style={[s.activationName, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </ThemedText>
                <ThemedText style={[s.activationSponsor, { color: colors.textSecondary }]}>
                  {item.sponsor}
                </ThemedText>
              </View>
              <StatusBadge label={item.status.toUpperCase()} color={stColor} />
            </View>

            <View style={[s.activationMeta, { borderTopColor: colors.border }]}>
              <View style={s.activationMetaItem}>
                <IconSymbol name="bolt.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.activationMetaText, { color: colors.textSecondary }]}>
                  {activationTypeLabel(item.type)}
                </ThemedText>
              </View>
              <View style={s.activationMetaItem}>
                <IconSymbol name="eye.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.activationMetaText, { color: colors.textSecondary }]}>
                  {item.impressions} impressions
                </ThemedText>
              </View>
            </View>

            <View style={s.activationFooter}>
              <ThemedText style={[s.activationSeries, { color: colors.textTertiary }]}>
                {item.series}
              </ThemedText>
              <ThemedText style={[s.activationDates, { color: colors.textTertiary }]}>
                {item.startDate} \u2013 {item.endDate}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="bolt.fill" label="No activations found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// CONTRACTS TAB
// =============================================================================

function ContractsTab({
  colors,
  data,
  onSelectContract,
}: {
  colors: typeof Colors.light;
  data: SponsorContract[];
  onSelectContract: (contract: SponsorContract) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = CONTRACT_STATUS_COLOR[item.status];
        const tColor = TIER_COLOR[item.tier];
        return (
          <Pressable
            style={[s.contractCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectContract(item);
            }}
          >
            <View style={s.contractHeader}>
              <View style={s.contractHeaderLeft}>
                <ThemedText style={[s.contractSponsor, { color: colors.text }]} numberOfLines={1}>
                  {item.sponsor}
                </ThemedText>
                <ThemedText style={[s.contractValue, { color: colors.textSecondary }]}>
                  {item.totalValue}
                </ThemedText>
              </View>
              <View style={s.contractBadges}>
                <StatusBadge label={tierLabel(item.tier)} color={tColor} />
                <StatusBadge label={item.status.replace('-', ' ').toUpperCase()} color={stColor} />
              </View>
            </View>

            <View style={[s.contractMeta, { borderTopColor: colors.border }]}>
              <View style={s.contractMetaItem}>
                <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.contractMetaText, { color: colors.textSecondary }]}>
                  {item.startDate} \u2013 {item.endDate}
                </ThemedText>
              </View>
              <View style={s.contractMetaItem}>
                <IconSymbol name="arrow.triangle.2.circlepath" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.contractMetaText, { color: colors.textSecondary }]}>
                  {item.autoRenew ? 'Auto-renew' : 'Manual renewal'}
                </ThemedText>
              </View>
            </View>

            <ThemedText style={[s.contractTerms, { color: colors.textTertiary }]} numberOfLines={2}>
              {item.terms}
            </ThemedText>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="doc.text.fill" label="No contracts found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// FULFILLMENT TAB
// =============================================================================

function FulfillmentTab({
  colors,
  data,
}: {
  colors: typeof Colors.light;
  data: FulfillmentItem[];
}) {
  // Group by status
  const grouped = useMemo(() => {
    const statusOrder: FulfillmentItem['status'][] = ['overdue', 'in-progress', 'upcoming', 'completed'];
    return statusOrder.map((status) => ({
      status,
      items: data.filter((f) => f.status === status),
    })).filter((g) => g.items.length > 0);
  }, [data]);

  const statusLabels: Record<FulfillmentItem['status'], string> = {
    overdue: 'Overdue',
    'in-progress': 'In Progress',
    upcoming: 'Upcoming',
    completed: 'Completed',
  };

  return (
    <FlatList
      data={grouped}
      keyExtractor={(item) => item.status}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item: group }) => {
        const grpColor = FULFILLMENT_STATUS_COLOR[group.status];
        return (
          <View style={s.fulfillmentGroup}>
            <View style={s.fulfillmentGroupHeader}>
              <View style={[s.fulfillmentGroupDot, { backgroundColor: grpColor }]} />
              <ThemedText style={[s.fulfillmentGroupTitle, { color: colors.text }]}>
                {statusLabels[group.status]}
              </ThemedText>
              <ThemedText style={[s.fulfillmentGroupCount, { color: colors.textTertiary }]}>
                {group.items.length}
              </ThemedText>
            </View>
            {group.items.map((item) => (
              <View
                key={item.id}
                style={[s.fulfillmentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={s.fulfillmentCardTop}>
                  <ThemedText style={[s.fulfillmentObligation, { color: colors.text }]} numberOfLines={2}>
                    {item.obligation}
                  </ThemedText>
                  <StatusBadge label={item.status.replace('-', ' ').toUpperCase()} color={grpColor} />
                </View>
                <View style={s.fulfillmentCardMeta}>
                  <ThemedText style={[s.fulfillmentSponsor, { color: colors.textSecondary }]}>
                    {item.sponsor}
                  </ThemedText>
                  <ThemedText style={[s.fulfillmentDue, { color: colors.textTertiary }]}>
                    Due: {item.dueDate}
                  </ThemedText>
                </View>
                <View style={s.fulfillmentCardBottom}>
                  <StatusBadge label={item.category.toUpperCase()} color={colors.textTertiary} />
                  <ThemedText style={[s.fulfillmentNotes, { color: colors.textTertiary }]} numberOfLines={1}>
                    {item.notes}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="checkmark.seal.fill" label="No fulfillment items" colors={colors} />
      }
    />
  );
}

// =============================================================================
// ASSETS TAB
// =============================================================================

function AssetsTab({
  colors,
  data,
}: {
  colors: typeof Colors.light;
  data: SponsorAsset[];
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = assetStatusColor(item.status);
        return (
          <View style={[s.assetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.assetCardTop}>
              <View style={[s.assetIconCircle, { backgroundColor: stColor + '18' }]}>
                <IconSymbol name={assetTypeIcon(item.type) as any} size={16} color={stColor} />
              </View>
              <View style={s.assetCardInfo}>
                <ThemedText style={[s.assetName, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </ThemedText>
                <ThemedText style={[s.assetSponsor, { color: colors.textSecondary }]}>
                  {item.sponsor}
                </ThemedText>
              </View>
              <StatusBadge label={item.status.toUpperCase()} color={stColor} />
            </View>
            <View style={[s.assetCardMeta, { borderTopColor: colors.border }]}>
              <View style={s.assetMetaItem}>
                <StatusBadge label={assetTypeLabel(item.type)} color={colors.textTertiary} />
              </View>
              <ThemedText style={[s.assetMetaText, { color: colors.textTertiary }]}>
                {item.fileSize}
              </ThemedText>
              <ThemedText style={[s.assetMetaText, { color: colors.textTertiary }]}>
                {item.uploadDate}
              </ThemedText>
              <ThemedText style={[s.assetMetaText, { color: colors.textSecondary }]}>
                {item.usageCount} uses
              </ThemedText>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="photo.stack.fill" label="No assets uploaded" colors={colors} />
      }
    />
  );
}

// =============================================================================
// REVENUE TAB
// =============================================================================

function RevenueTab({
  colors,
  data,
}: {
  colors: typeof Colors.light;
  data: SponsorRevenue[];
}) {
  // Summary stats
  const totals = useMemo(() => {
    let received = 0;
    let invoiced = 0;
    let overdue = 0;
    let projected = 0;
    data.forEach((r) => {
      switch (r.status) {
        case 'received': received += r.amountValue; break;
        case 'invoiced': invoiced += r.amountValue; break;
        case 'overdue': overdue += r.amountValue; break;
        case 'projected': projected += r.amountValue; break;
      }
    });
    return { received, invoiced, overdue, projected };
  }, [data]);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={s.revenueSummary}>
          <View style={[s.revenueSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.revenueSummaryRow}>
              <View style={s.revenueSummaryItem}>
                <ThemedText style={[s.revenueSummaryValue, { color: '#22C55E' }]}>
                  {formatCurrency(totals.received)}
                </ThemedText>
                <ThemedText style={[s.revenueSummaryLabel, { color: colors.textTertiary }]}>
                  Received
                </ThemedText>
              </View>
              <View style={s.revenueSummaryItem}>
                <ThemedText style={[s.revenueSummaryValue, { color: ACCENT }]}>
                  {formatCurrency(totals.invoiced)}
                </ThemedText>
                <ThemedText style={[s.revenueSummaryLabel, { color: colors.textTertiary }]}>
                  Invoiced
                </ThemedText>
              </View>
              <View style={s.revenueSummaryItem}>
                <ThemedText style={[s.revenueSummaryValue, { color: '#EF4444' }]}>
                  {formatCurrency(totals.overdue)}
                </ThemedText>
                <ThemedText style={[s.revenueSummaryLabel, { color: colors.textTertiary }]}>
                  Overdue
                </ThemedText>
              </View>
              <View style={s.revenueSummaryItem}>
                <ThemedText style={[s.revenueSummaryValue, { color: '#A1A1AA' }]}>
                  {formatCurrency(totals.projected)}
                </ThemedText>
                <ThemedText style={[s.revenueSummaryLabel, { color: colors.textTertiary }]}>
                  Projected
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      }
      renderItem={({ item }) => {
        const stColor = revenueStatusColor(item.status);
        const tColor = revenueTypeColor(item.type);
        return (
          <View style={[s.revenueRow, { borderBottomColor: colors.border }]}>
            <View style={s.revenueRowLeft}>
              <ThemedText style={[s.revenueSponsor, { color: colors.text }]} numberOfLines={1}>
                {item.sponsor}
              </ThemedText>
              <ThemedText style={[s.revenuePeriod, { color: colors.textTertiary }]}>
                {item.period}
              </ThemedText>
            </View>
            <View style={s.revenueRowRight}>
              <ThemedText style={[s.revenueAmount, { color: colors.text }]}>
                {item.amount}
              </ThemedText>
              <View style={s.revenueBadges}>
                <StatusBadge label={revenueTypeLabel(item.type)} color={tColor} />
                <StatusBadge label={item.status.toUpperCase()} color={stColor} />
              </View>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="dollarsign.circle.fill" label="No revenue records" colors={colors} />
      }
    />
  );
}

// =============================================================================
// PROSPECTING TAB
// =============================================================================

function ProspectingTab({
  colors,
  accentColor,
  data,
  onSelectProspect,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: Prospect[];
  onSelectProspect: (prospect: Prospect) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = PROSPECT_STAGE_COLOR[item.stage];
        return (
          <Pressable
            style={[s.prospectCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectProspect(item);
            }}
          >
            <View style={s.prospectHeader}>
              <View style={s.prospectHeaderLeft}>
                <ThemedText style={[s.prospectCompany, { color: colors.text }]} numberOfLines={1}>
                  {item.companyName}
                </ThemedText>
                <ThemedText style={[s.prospectContact, { color: colors.textSecondary }]}>
                  {item.contactName}
                </ThemedText>
              </View>
              <StatusBadge label={prospectStageLabel(item.stage)} color={stColor} />
            </View>

            <View style={[s.prospectMeta, { borderTopColor: colors.border }]}>
              <View style={s.prospectMetaItem}>
                <IconSymbol name="dollarsign.circle.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.prospectMetaText, { color: colors.textSecondary }]}>
                  {item.estimatedValue}
                </ThemedText>
              </View>
              <View style={s.prospectMetaItem}>
                <IconSymbol name="building.2.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.prospectMetaText, { color: colors.textSecondary }]}>
                  {item.industry}
                </ThemedText>
              </View>
              <View style={s.prospectMetaItem}>
                <IconSymbol name="clock.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.prospectMetaText, { color: colors.textTertiary }]}>
                  {item.lastActivity}
                </ThemedText>
              </View>
            </View>

            <ThemedText style={[s.prospectNotes, { color: colors.textTertiary }]} numberOfLines={2}>
              {item.notes}
            </ThemedText>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="binoculars.fill" label="No prospects in pipeline" colors={colors} />
      }
    />
  );
}

// =============================================================================
// SETTINGS TAB
// =============================================================================

function SettingsTab({
  colors,
  accentColor,
  data,
  onToggle,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: SponsorSettingToggle[];
  onToggle: (id: string) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={[s.settingRow, { borderBottomColor: colors.border }]}>
          <View style={s.settingInfo}>
            <ThemedText style={[s.settingLabel, { color: colors.text }]}>{item.label}</ThemedText>
            <ThemedText style={[s.settingDescription, { color: colors.textTertiary }]}>
              {item.description}
            </ThemedText>
          </View>
          <Switch
            value={item.enabled}
            onValueChange={() => onToggle(item.id)}
            trackColor={{ false: colors.backgroundTertiary, true: accentColor + '60' }}
            thumbColor={item.enabled ? accentColor : colors.textTertiary}
          />
        </View>
      )}
      ListEmptyComponent={
        <EmptyState icon="gear" label="No settings available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// SPONSOR DETAIL BOTTOM SHEET
// =============================================================================

function SponsorDetailSheet({
  visible,
  onClose,
  sponsor,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  sponsor: CompSponsor | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!sponsor) return null;

  const tColor = TIER_COLOR[sponsor.tier];
  const stColor = SPONSOR_STATUS_COLOR[sponsor.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={sponsor.name} useModal>
      {/* Tier + status */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={tierLabel(sponsor.tier)} color={tColor} />
        <StatusBadge label={sponsor.status.toUpperCase()} color={stColor} />
      </View>

      {/* KPIs */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{sponsor.annualValueFormatted}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Annual Value</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{sponsor.activationsCount}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Activations</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{sponsor.fulfillmentPct}%</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Fulfilled</ThemedText>
        </View>
      </View>

      {/* Contact */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Contact</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {sponsor.contactName}
        </ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textTertiary }]}>
          {sponsor.contactEmail}
        </ThemedText>
      </View>

      {/* Schedule */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Contract Period</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {sponsor.startDate} \u2013 {sponsor.endDate}
        </ThemedText>
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>View Full Profile</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// ACTIVATION DETAIL BOTTOM SHEET
// =============================================================================

function ActivationDetailSheet({
  visible,
  onClose,
  activation,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  activation: Activation | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!activation) return null;

  const stColor = ACTIVATION_STATUS_COLOR[activation.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={activation.name} useModal>
      {/* Status + type */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={activation.status.toUpperCase()} color={stColor} />
        <StatusBadge label={activationTypeLabel(activation.type)} color={accentColor} />
      </View>

      {/* KPIs */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{activation.impressions}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Impressions</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{activation.sponsor}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Sponsor</ThemedText>
        </View>
      </View>

      {/* Series */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Series</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {activation.series}
        </ThemedText>
      </View>

      {/* Schedule */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Schedule</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {activation.startDate} \u2013 {activation.endDate}
        </ThemedText>
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>View Full Activation</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// CONTRACT DETAIL BOTTOM SHEET
// =============================================================================

function ContractDetailSheet({
  visible,
  onClose,
  contract,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  contract: SponsorContract | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!contract) return null;

  const stColor = CONTRACT_STATUS_COLOR[contract.status];
  const tColor = TIER_COLOR[contract.tier];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={`${contract.sponsor} Contract`} useModal>
      {/* Status + tier */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={tierLabel(contract.tier)} color={tColor} />
        <StatusBadge label={contract.status.replace('-', ' ').toUpperCase()} color={stColor} />
      </View>

      {/* KPIs */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{contract.totalValue}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Total Value</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{contract.autoRenew ? 'Yes' : 'No'}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Auto-Renew</ThemedText>
        </View>
      </View>

      {/* Schedule */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Contract Period</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {contract.startDate} \u2013 {contract.endDate}
        </ThemedText>
      </View>

      {/* Terms */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Terms</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {contract.terms}
        </ThemedText>
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>View Full Contract</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// PROSPECT DETAIL BOTTOM SHEET
// =============================================================================

function ProspectDetailSheet({
  visible,
  onClose,
  prospect,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  prospect: Prospect | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!prospect) return null;

  const stColor = PROSPECT_STAGE_COLOR[prospect.stage];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={prospect.companyName} useModal>
      {/* Stage */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={prospectStageLabel(prospect.stage)} color={stColor} />
        <StatusBadge label={prospect.industry.toUpperCase()} color={accentColor} />
      </View>

      {/* KPIs */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{prospect.estimatedValue}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Est. Value</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{prospect.lastActivity}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Last Activity</ThemedText>
        </View>
      </View>

      {/* Contact */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Contact</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {prospect.contactName}
        </ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textTertiary }]}>
          {prospect.contactEmail}
        </ThemedText>
      </View>

      {/* Notes */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Notes</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {prospect.notes}
        </ThemedText>
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>View Full Profile</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
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

export function CompSponsorsV2({ colors, accentColor }: Props) {
  // === State ===
  const [activeTab, setActiveTab] = useState<CompSponsorsTabId>('dashboard');
  const [activeScope, setActiveScope] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSponsor, setSelectedSponsor] = useState<CompSponsor | null>(null);
  const [showSponsorDetail, setShowSponsorDetail] = useState(false);
  const [selectedActivation, setSelectedActivation] = useState<Activation | null>(null);
  const [showActivationDetail, setShowActivationDetail] = useState(false);
  const [selectedContract, setSelectedContract] = useState<SponsorContract | null>(null);
  const [showContractDetail, setShowContractDetail] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [showProspectDetail, setShowProspectDetail] = useState(false);

  // Settings state (local toggle tracking)
  const [settingOverrides, setSettingOverrides] = useState<Record<string, boolean>>({});

  // === Data ===
  const scopeLabel = COMP_SPONSORS_SCOPE_CHIPS[activeScope] ?? 'All Sponsors';
  const data = useMemo(() => getCompSponsorsData(scopeLabel), [scopeLabel]);

  // Settings with overrides applied
  const settingsWithOverrides = useMemo(() => {
    return data.settings.map((setting) => ({
      ...setting,
      enabled: settingOverrides[setting.id] !== undefined
        ? settingOverrides[setting.id]
        : setting.enabled,
    }));
  }, [data.settings, settingOverrides]);

  // === Filtered data based on search ===
  const filteredSponsors = useMemo(() => {
    if (!searchQuery.trim()) return data.sponsors;
    const q = searchQuery.toLowerCase();
    return data.sponsors.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.tier.toLowerCase().includes(q) ||
        s.contactName.toLowerCase().includes(q),
    );
  }, [data.sponsors, searchQuery]);

  const filteredPackages = useMemo(() => {
    if (!searchQuery.trim()) return data.packages;
    const q = searchQuery.toLowerCase();
    return data.packages.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tier.toLowerCase().includes(q),
    );
  }, [data.packages, searchQuery]);

  const filteredActivations = useMemo(() => {
    if (!searchQuery.trim()) return data.activations;
    const q = searchQuery.toLowerCase();
    return data.activations.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.sponsor.toLowerCase().includes(q) ||
        a.series.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q),
    );
  }, [data.activations, searchQuery]);

  const filteredContracts = useMemo(() => {
    if (!searchQuery.trim()) return data.contracts;
    const q = searchQuery.toLowerCase();
    return data.contracts.filter(
      (c) =>
        c.sponsor.toLowerCase().includes(q) ||
        c.tier.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q),
    );
  }, [data.contracts, searchQuery]);

  const filteredFulfillment = useMemo(() => {
    if (!searchQuery.trim()) return data.fulfillment;
    const q = searchQuery.toLowerCase();
    return data.fulfillment.filter(
      (f) =>
        f.obligation.toLowerCase().includes(q) ||
        f.sponsor.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q),
    );
  }, [data.fulfillment, searchQuery]);

  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return data.assets;
    const q = searchQuery.toLowerCase();
    return data.assets.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.sponsor.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q),
    );
  }, [data.assets, searchQuery]);

  const filteredRevenue = useMemo(() => {
    if (!searchQuery.trim()) return data.revenue;
    const q = searchQuery.toLowerCase();
    return data.revenue.filter(
      (r) =>
        r.sponsor.toLowerCase().includes(q) ||
        r.period.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q),
    );
  }, [data.revenue, searchQuery]);

  const filteredProspects = useMemo(() => {
    if (!searchQuery.trim()) return data.prospects;
    const q = searchQuery.toLowerCase();
    return data.prospects.filter(
      (p) =>
        p.companyName.toLowerCase().includes(q) ||
        p.contactName.toLowerCase().includes(q) ||
        p.industry.toLowerCase().includes(q) ||
        p.stage.toLowerCase().includes(q),
    );
  }, [data.prospects, searchQuery]);

  // === Callbacks ===
  const handleTabPress = useCallback((tabId: CompSponsorsTabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  }, []);

  const handleScopePress = useCallback((index: number) => {
    Haptics.selectionAsync();
    setActiveScope(index);
  }, []);

  const handleSelectSponsor = useCallback((sponsor: CompSponsor) => {
    setSelectedSponsor(sponsor);
    setShowSponsorDetail(true);
  }, []);

  const handleSelectActivation = useCallback((activation: Activation) => {
    setSelectedActivation(activation);
    setShowActivationDetail(true);
  }, []);

  const handleSelectContract = useCallback((contract: SponsorContract) => {
    setSelectedContract(contract);
    setShowContractDetail(true);
  }, []);

  const handleSelectProspect = useCallback((prospect: Prospect) => {
    setSelectedProspect(prospect);
    setShowProspectDetail(true);
  }, []);

  const handleToggleSetting = useCallback((id: string) => {
    setSettingOverrides((prev) => {
      const currentVal = prev[id] !== undefined
        ? prev[id]
        : data.settings.find((s) => s.id === id)?.enabled ?? false;
      return { ...prev, [id]: !currentVal };
    });
  }, [data.settings]);

  // === Tab content renderer ===
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab colors={colors} accentColor={accentColor} data={data} />;
      case 'sponsors':
        return (
          <SponsorsTab
            colors={colors}
            accentColor={accentColor}
            data={filteredSponsors}
            onSelectSponsor={handleSelectSponsor}
          />
        );
      case 'packages':
        return <PackagesTab colors={colors} accentColor={accentColor} data={filteredPackages} />;
      case 'activations':
        return (
          <ActivationsTab
            colors={colors}
            data={filteredActivations}
            onSelectActivation={handleSelectActivation}
          />
        );
      case 'contracts':
        return (
          <ContractsTab
            colors={colors}
            data={filteredContracts}
            onSelectContract={handleSelectContract}
          />
        );
      case 'fulfillment':
        return <FulfillmentTab colors={colors} data={filteredFulfillment} />;
      case 'assets':
        return <AssetsTab colors={colors} data={filteredAssets} />;
      case 'revenue':
        return <RevenueTab colors={colors} data={filteredRevenue} />;
      case 'prospecting':
        return (
          <ProspectingTab
            colors={colors}
            accentColor={accentColor}
            data={filteredProspects}
            onSelectProspect={handleSelectProspect}
          />
        );
      case 'settings':
        return (
          <SettingsTab
            colors={colors}
            accentColor={accentColor}
            data={settingsWithOverrides}
            onToggle={handleToggleSetting}
          />
        );
      default:
        return null;
    }
  };

  // === Render ===
  return (
    <View style={s.container}>
      {/* Sub-tab pill bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={s.tabPillRow}
      >
        {COMP_SPONSORS_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              style={[
                s.tabPill,
                { backgroundColor: isActive ? accentColor : colors.backgroundTertiary },
              ]}
              onPress={() => handleTabPress(tab.id)}
            >
              <ThemedText
                style={[
                  s.tabPillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Scope chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={s.scopeChipRow}
      >
        {COMP_SPONSORS_SCOPE_CHIPS.map((chip, index) => {
          const isActive = index === activeScope;
          return (
            <Pressable
              key={chip}
              style={[
                s.scopeChip,
                { backgroundColor: isActive ? accentColor + '20' : colors.backgroundTertiary },
                isActive && { borderColor: accentColor, borderWidth: 1 },
              ]}
              onPress={() => handleScopePress(index)}
            >
              <ThemedText
                style={[
                  s.scopeChipText,
                  { color: isActive ? accentColor : colors.textSecondary },
                ]}
              >
                {chip}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Search bar */}
      <View style={s.searchContainer}>
        <View
          style={[
            s.searchBar,
            { backgroundColor: colors.backgroundTertiary, borderColor: colors.border },
          ]}
        >
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search\u2026"
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery('')}
              hitSlop={8}
            >
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Tab content */}
      <View style={s.contentContainer}>
        {renderTabContent()}
      </View>

      {/* Bottom Sheets */}
      <SponsorDetailSheet
        visible={showSponsorDetail}
        onClose={() => setShowSponsorDetail(false)}
        sponsor={selectedSponsor}
        colors={colors}
        accentColor={accentColor}
      />
      <ActivationDetailSheet
        visible={showActivationDetail}
        onClose={() => setShowActivationDetail(false)}
        activation={selectedActivation}
        colors={colors}
        accentColor={accentColor}
      />
      <ContractDetailSheet
        visible={showContractDetail}
        onClose={() => setShowContractDetail(false)}
        contract={selectedContract}
        colors={colors}
        accentColor={accentColor}
      />
      <ProspectDetailSheet
        visible={showProspectDetail}
        onClose={() => setShowProspectDetail(false)}
        prospect={selectedProspect}
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

  // -- Tab pills --
  tabPillRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Scope chips --
  scopeChipRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  scopeChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  scopeChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Search --
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
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },

  // -- Badges --
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

  // -- Dashboard: KPI --
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  kpiCard: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    flexGrow: 1,
    flexBasis: '46%',
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiDelta: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Dashboard: Quick Actions --
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickActionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    flexBasis: '30%',
    minHeight: 80,
  },
  quickActionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // -- Dashboard: Activity --
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

  // -- Sponsors --
  sponsorCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  sponsorCardTop: {
    padding: Spacing.md,
  },
  sponsorCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sponsorLogoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsorLogoText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sponsorCardMid: {
    flex: 1,
  },
  sponsorCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sponsorCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sponsorCardDetails: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  sponsorDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  sponsorDetailValue: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sponsorDetailLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  sponsorCardFooter: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  sponsorContact: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  sponsorDates: {
    fontSize: 12,
    marginTop: 2,
  },

  // -- Packages --
  packageCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  packageHeaderLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  packageName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  packagePrice: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  packageBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  packageCapacity: {
    marginBottom: Spacing.sm,
  },
  packageCapacityBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A1A1AA',
    marginBottom: 4,
    overflow: 'hidden',
  },
  packageCapacityFill: {
    height: '100%',
    borderRadius: 3,
  },
  packageCapacityText: {
    fontSize: 11,
  },
  benefitsList: {
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingVertical: 3,
  },
  benefitText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },

  // -- Activations --
  activationCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  activationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  activationHeaderLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  activationName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  activationSponsor: {
    fontSize: 13,
  },
  activationMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  activationMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activationMetaText: {
    fontSize: 12,
  },
  activationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activationSeries: {
    fontSize: 12,
  },
  activationDates: {
    fontSize: 12,
  },

  // -- Contracts --
  contractCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  contractHeaderLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  contractSponsor: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  contractValue: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  contractBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  contractMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  contractMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contractMetaText: {
    fontSize: 12,
  },
  contractTerms: {
    fontSize: 12,
    lineHeight: 17,
  },

  // -- Fulfillment --
  fulfillmentGroup: {
    marginBottom: Spacing.lg,
  },
  fulfillmentGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  fulfillmentGroupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  fulfillmentGroupTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  fulfillmentGroupCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  fulfillmentCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  fulfillmentCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: 6,
  },
  fulfillmentObligation: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  fulfillmentCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fulfillmentSponsor: {
    fontSize: 12,
  },
  fulfillmentDue: {
    fontSize: 11,
  },
  fulfillmentCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  fulfillmentNotes: {
    fontSize: 11,
    flex: 1,
  },

  // -- Assets --
  assetCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  assetCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 6,
  },
  assetIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetCardInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 13,
    fontWeight: '600',
  },
  assetSponsor: {
    fontSize: 12,
    marginTop: 1,
  },
  assetCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  assetMetaItem: {
    marginRight: 4,
  },
  assetMetaText: {
    fontSize: 11,
  },

  // -- Revenue --
  revenueSummary: {
    marginBottom: Spacing.md,
  },
  revenueSummaryCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  revenueSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  revenueSummaryItem: {
    alignItems: 'center',
  },
  revenueSummaryValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  revenueSummaryLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  revenueRowLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  revenueSponsor: {
    fontSize: 14,
    fontWeight: '500',
  },
  revenuePeriod: {
    fontSize: 11,
    marginTop: 1,
  },
  revenueRowRight: {
    alignItems: 'flex-end',
  },
  revenueAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginBottom: 4,
  },
  revenueBadges: {
    flexDirection: 'row',
    gap: 4,
  },

  // -- Prospecting --
  prospectCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  prospectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  prospectHeaderLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  prospectCompany: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  prospectContact: {
    fontSize: 13,
  },
  prospectMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  prospectMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prospectMetaText: {
    fontSize: 12,
  },
  prospectNotes: {
    fontSize: 12,
    lineHeight: 17,
  },

  // -- Settings --
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },

  // -- Bottom Sheet shared --
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
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
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
});
