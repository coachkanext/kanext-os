/**
 * Education Organization Sponsors Tab — 6-tab Sponsors Hub.
 * Overview, Sponsors, Endowments, Campaigns, Retention, Partnerships.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, TextInput, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { EducationRoleLens } from '@/utils/education-rbac';
import { isPresident, isDeanLevel, isFacultyLevel } from '@/utils/education-rbac';
import {
  EDU_SPONSORS_TABS,
  EDU_SPONSORS_SCOPE_CHIPS,
  SPONSOR_TIER_COLOR,
  SPONSOR_TYPE_COLOR,
  SPONSOR_TYPE_LABEL,
  SPONSOR_STATUS_COLOR,
  CAMPAIGN_STATUS_COLOR,
  PARTNERSHIP_STATUS_COLOR,
  getEduSponsorsData,
  formatCurrency,
} from '@/data/mock-edu-org-sponsors';
import type {
  EduSponsorsTabId,
  EduSponsor,
  Endowment,
  SponsorshipStats,
  Campaign,
  PartnershipOpportunity,
} from '@/data/mock-edu-org-sponsors';

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

function tierLabel(tier: EduSponsor['tier']): string {
  switch (tier) {
    case 'platinum': return 'PLATINUM';
    case 'gold': return 'GOLD';
    case 'silver': return 'SILVER';
    case 'bronze': return 'BRONZE';
  }
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
// OVERVIEW TAB
// =============================================================================

function OverviewTab({
  colors,
  accentColor,
  stats,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  stats: SponsorshipStats;
}) {
  const progressPct = stats.goalAmount > 0 ? Math.round((stats.totalRaised / stats.goalAmount) * 100) : 0;

  const kpis = [
    { id: 'raised', label: 'Total Raised', value: formatCurrency(stats.totalRaised), icon: 'dollarsign.circle.fill', color: '#22C55E' },
    { id: 'goal', label: 'Goal Amount', value: formatCurrency(stats.goalAmount), icon: 'flag.fill', color: '#1D9BF0' },
    { id: 'donors', label: 'Total Donors', value: `${stats.donorCount}`, icon: 'person.2.fill', color: '#1D9BF0' },
    { id: 'new', label: 'New Donors', value: `${stats.newDonors}`, icon: 'person.badge.plus', color: '#F59E0B' },
    { id: 'endowment', label: 'Endowment', value: formatCurrency(stats.endowmentTotal), icon: 'building.columns.fill', color: '#1D9BF0' },
    { id: 'annual', label: 'Annual Fund', value: formatCurrency(stats.annualFundTotal), icon: 'chart.bar.fill', color: '#1D9BF0' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Fundraising Progress */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Fundraising Progress</ThemedText>
      <View style={[s.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.progressHeader}>
          <ThemedText style={[s.progressRaised, { color: '#22C55E' }]}>
            {formatCurrency(stats.totalRaised)}
          </ThemedText>
          <ThemedText style={[s.progressGoal, { color: colors.textTertiary }]}>
            of {formatCurrency(stats.goalAmount)}
          </ThemedText>
        </View>
        <View style={s.progressBarContainer}>
          <View style={s.progressBar}>
            <View style={[s.progressBarFill, { backgroundColor: '#22C55E', width: `${Math.min(progressPct, 100)}%` }]} />
          </View>
          <ThemedText style={[s.progressPercent, { color: accentColor }]}>
            {progressPct}%
          </ThemedText>
        </View>
      </View>

      {/* KPI Grid */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Key Metrics
      </ThemedText>
      <View style={s.kpiGrid}>
        {kpis.map((kpi) => (
          <View key={kpi.id} style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.kpiHeader}>
              <IconSymbol name={kpi.icon as any} size={18} color={kpi.color} />
              <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>{kpi.label}</ThemedText>
            </View>
            <ThemedText style={[s.kpiValue, { color: colors.text }]}>{kpi.value}</ThemedText>
          </View>
        ))}
      </View>

      {/* Retention Rate */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Donor Retention
      </ThemedText>
      <View style={[s.retentionSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.retentionSummaryRow}>
          <View style={s.retentionSummaryItem}>
            <ThemedText style={[s.retentionSummaryValue, { color: accentColor }]}>
              {stats.retentionRate}%
            </ThemedText>
            <ThemedText style={[s.retentionSummaryLabel, { color: colors.textTertiary }]}>
              Retention Rate
            </ThemedText>
          </View>
          <View style={s.retentionSummaryItem}>
            <ThemedText style={[s.retentionSummaryValue, { color: '#22C55E' }]}>
              {stats.newDonors}
            </ThemedText>
            <ThemedText style={[s.retentionSummaryLabel, { color: colors.textTertiary }]}>
              New This Year
            </ThemedText>
          </View>
          <View style={s.retentionSummaryItem}>
            <ThemedText style={[s.retentionSummaryValue, { color: '#1D9BF0' }]}>
              {stats.donorCount}
            </ThemedText>
            <ThemedText style={[s.retentionSummaryLabel, { color: colors.textTertiary }]}>
              Total Donors
            </ThemedText>
          </View>
        </View>
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
  data: EduSponsor[];
  onSelectSponsor: (sponsor: EduSponsor) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const tColor = SPONSOR_TIER_COLOR[item.tier];
        const typeColor = SPONSOR_TYPE_COLOR[item.type];
        const stColor = SPONSOR_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.sponsorCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectSponsor(item);
            }}
          >
            {/* Top row: name + badges */}
            <View style={s.sponsorCardTop}>
              <View style={s.sponsorCardInfo}>
                <View style={[s.sponsorLogoCircle, { backgroundColor: tColor + '30' }]}>
                  <ThemedText style={[s.sponsorLogoText, { color: tColor }]}>
                    {item.name.substring(0, 2).toUpperCase()}
                  </ThemedText>
                </View>
                <View style={s.sponsorCardMid}>
                  <ThemedText style={[s.sponsorCardName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <View style={s.sponsorCardBadgeRow}>
                    <StatusBadge label={tierLabel(item.tier)} color={tColor} />
                    <StatusBadge label={SPONSOR_TYPE_LABEL[item.type]} color={typeColor} />
                    <StatusBadge label={item.status.toUpperCase()} color={stColor} />
                  </View>
                </View>
              </View>
            </View>

            {/* Details */}
            <View style={[s.sponsorCardDetails, { borderTopColor: colors.border }]}>
              <View style={s.sponsorDetailItem}>
                <ThemedText style={[s.sponsorDetailValue, { color: colors.text }]}>
                  {formatCurrency(item.totalGiving)}
                </ThemedText>
                <ThemedText style={[s.sponsorDetailLabel, { color: colors.textTertiary }]}>
                  Total Given
                </ThemedText>
              </View>
              <View style={s.sponsorDetailItem}>
                <ThemedText style={[s.sponsorDetailValue, { color: colors.text }]}>
                  {formatCurrency(item.currentYear)}
                </ThemedText>
                <ThemedText style={[s.sponsorDetailLabel, { color: colors.textTertiary }]}>
                  This Year
                </ThemedText>
              </View>
              <View style={s.sponsorDetailItem}>
                <ThemedText style={[s.sponsorDetailValue, { color: colors.text }]}>
                  {item.since}
                </ThemedText>
                <ThemedText style={[s.sponsorDetailLabel, { color: colors.textTertiary }]}>
                  Since
                </ThemedText>
              </View>
            </View>

            {/* Focus areas */}
            <View style={s.sponsorCardFooter}>
              <View style={s.focusRow}>
                {item.focus.map((area, idx) => (
                  <StatusBadge key={idx} label={area.toUpperCase()} color={colors.textTertiary} />
                ))}
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="person.2.fill" label="No sponsors found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// ENDOWMENTS TAB
// =============================================================================

function EndowmentsTab({
  colors,
  accentColor,
  data,
  role,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: Endowment[];
  role?: EducationRoleLens;
}) {
  const totalValue = data.reduce((sum, e) => sum + e.value, 0);
  const totalDistribution = data.reduce((sum, e) => sum + e.annualDistribution, 0);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={s.endowmentSummary}>
          <View style={[s.endowmentSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.endowmentSummaryRow}>
              <View style={s.endowmentSummaryItem}>
                <ThemedText style={[s.endowmentSummaryValue, { color: colors.text }]}>
                  {formatCurrency(totalValue)}
                </ThemedText>
                <ThemedText style={[s.endowmentSummaryLabel, { color: colors.textTertiary }]}>
                  Total Endowment
                </ThemedText>
              </View>
              <View style={s.endowmentSummaryItem}>
                <ThemedText style={[s.endowmentSummaryValue, { color: '#22C55E' }]}>
                  {formatCurrency(totalDistribution)}
                </ThemedText>
                <ThemedText style={[s.endowmentSummaryLabel, { color: colors.textTertiary }]}>
                  Annual Distribution
                </ThemedText>
              </View>
              <View style={s.endowmentSummaryItem}>
                <ThemedText style={[s.endowmentSummaryValue, { color: accentColor }]}>
                  {data.length}
                </ThemedText>
                <ThemedText style={[s.endowmentSummaryLabel, { color: colors.textTertiary }]}>
                  Funds
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <View style={[s.endowmentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.endowmentCardTop}>
            <ThemedText style={[s.endowmentName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </ThemedText>
            <ThemedText style={[s.endowmentYear, { color: colors.textTertiary }]}>
              Est. {item.establishedYear}
            </ThemedText>
          </View>
          <ThemedText style={[s.endowmentPurpose, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.purpose}
          </ThemedText>
          <View style={[s.endowmentMeta, { borderTopColor: colors.border }]}>
            <View style={s.endowmentMetaItem}>
              <ThemedText style={[s.endowmentMetaValue, { color: colors.text }]}>
                {formatCurrency(item.value)}
              </ThemedText>
              <ThemedText style={[s.endowmentMetaLabel, { color: colors.textTertiary }]}>
                Value
              </ThemedText>
            </View>
            <View style={s.endowmentMetaItem}>
              <ThemedText style={[s.endowmentMetaValue, { color: '#22C55E' }]}>
                {formatCurrency(item.annualDistribution)}
              </ThemedText>
              <ThemedText style={[s.endowmentMetaLabel, { color: colors.textTertiary }]}>
                Annual
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[s.endowmentDonor, { color: colors.textTertiary }]}>
            Donor: {item.donor}
          </ThemedText>
        </View>
      )}
      ListEmptyComponent={
        <EmptyState icon="building.columns.fill" label="No endowments found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// CAMPAIGNS TAB
// =============================================================================

function CampaignsTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: Campaign[];
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = CAMPAIGN_STATUS_COLOR[item.status];
        const progressPct = item.goal > 0 ? Math.round((item.raised / item.goal) * 100) : 0;
        const barColor = progressPct >= 100 ? '#22C55E' : accentColor;
        return (
          <View style={[s.campaignCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.campaignCardTop}>
              <View style={s.campaignCardInfo}>
                <ThemedText style={[s.campaignName, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </ThemedText>
                <ThemedText style={[s.campaignDates, { color: colors.textTertiary }]}>
                  {item.startDate} \u2013 {item.endDate}
                </ThemedText>
              </View>
              <StatusBadge label={item.status.toUpperCase()} color={stColor} />
            </View>

            <ThemedText style={[s.campaignDescription, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </ThemedText>

            {/* Progress */}
            <View style={s.campaignProgress}>
              <View style={s.campaignProgressHeader}>
                <ThemedText style={[s.campaignRaised, { color: '#22C55E' }]}>
                  {formatCurrency(item.raised)}
                </ThemedText>
                <ThemedText style={[s.campaignGoal, { color: colors.textTertiary }]}>
                  of {formatCurrency(item.goal)}
                </ThemedText>
              </View>
              <View style={s.campaignProgressBar}>
                <View
                  style={[
                    s.campaignProgressBarFill,
                    { backgroundColor: barColor, width: `${Math.min(progressPct, 100)}%` },
                  ]}
                />
              </View>
              <ThemedText style={[s.campaignProgressPercent, { color: colors.textSecondary }]}>
                {progressPct}% of goal
              </ThemedText>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="megaphone.fill" label="No campaigns found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// RETENTION TAB
// =============================================================================

function RetentionTab({
  colors,
  accentColor,
  retentionMetrics,
  role,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  retentionMetrics: ReturnType<typeof getEduSponsorsData>['retentionMetrics'];
  role?: EducationRoleLens;
}) {
  // Only show detailed retention to dean-level+
  if (role && !isDeanLevel(role)) {
    return (
      <View style={s.restrictedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.restrictedText, { color: colors.textSecondary }]}>
          Retention data requires Dean-level access or above.
        </ThemedText>
      </View>
    );
  }

  const tierRetention = [
    { tier: 'Platinum', rate: retentionMetrics.platinumRetention, color: '#A1A1AA' },
    { tier: 'Gold', rate: retentionMetrics.goldRetention, color: '#F59E0B' },
    { tier: 'Silver', rate: retentionMetrics.silverRetention, color: '#A1A1AA' },
    { tier: 'Bronze', rate: retentionMetrics.bronzeRetention, color: '#1D9BF0' },
  ];

  const channelRetention = [
    { channel: 'Alumni', rate: retentionMetrics.alumniRetention, color: '#F59E0B' },
    { channel: 'Corporate', rate: retentionMetrics.corporateRetention, color: '#1D9BF0' },
    { channel: 'First-Time', rate: retentionMetrics.firstTimeRetention, color: '#1D9BF0' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Overall Rate */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Overall Retention</ThemedText>
      <View style={[s.overallRetentionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.overallRetentionRow}>
          <View style={s.overallRetentionItem}>
            <ThemedText style={[s.overallRetentionValue, { color: accentColor }]}>
              {retentionMetrics.overallRate}%
            </ThemedText>
            <ThemedText style={[s.overallRetentionLabel, { color: colors.textTertiary }]}>
              Retention Rate
            </ThemedText>
          </View>
          <View style={s.overallRetentionItem}>
            <ThemedText style={[s.overallRetentionValue, { color: '#EF4444' }]}>
              {retentionMetrics.lapsedDonors}
            </ThemedText>
            <ThemedText style={[s.overallRetentionLabel, { color: colors.textTertiary }]}>
              Lapsed
            </ThemedText>
          </View>
          <View style={s.overallRetentionItem}>
            <ThemedText style={[s.overallRetentionValue, { color: '#22C55E' }]}>
              {retentionMetrics.reactivated}
            </ThemedText>
            <ThemedText style={[s.overallRetentionLabel, { color: colors.textTertiary }]}>
              Reactivated
            </ThemedText>
          </View>
          <View style={s.overallRetentionItem}>
            <ThemedText style={[s.overallRetentionValue, { color: '#1D9BF0' }]}>
              +{retentionMetrics.avgGiftGrowth}%
            </ThemedText>
            <ThemedText style={[s.overallRetentionLabel, { color: colors.textTertiary }]}>
              Avg Growth
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Retention by Tier */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Retention by Tier
      </ThemedText>
      <View style={[s.retentionByTierCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {tierRetention.map((item, index) => (
          <View
            key={item.tier}
            style={[
              s.retentionTierRow,
              index < tierRetention.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={s.retentionTierLeft}>
              <View style={[s.retentionTierDot, { backgroundColor: item.color }]} />
              <ThemedText style={[s.retentionTierLabel, { color: colors.text }]}>{item.tier}</ThemedText>
            </View>
            <View style={s.retentionTierRight}>
              <View style={s.retentionTierBar}>
                <View style={[s.retentionTierBarFill, { backgroundColor: item.color, width: `${item.rate}%` }]} />
              </View>
              <ThemedText style={[s.retentionTierValue, { color: colors.textSecondary }]}>
                {item.rate}%
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Retention by Channel */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Retention by Channel
      </ThemedText>
      <View style={[s.retentionByTierCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {channelRetention.map((item, index) => (
          <View
            key={item.channel}
            style={[
              s.retentionTierRow,
              index < channelRetention.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={s.retentionTierLeft}>
              <View style={[s.retentionTierDot, { backgroundColor: item.color }]} />
              <ThemedText style={[s.retentionTierLabel, { color: colors.text }]}>{item.channel}</ThemedText>
            </View>
            <View style={s.retentionTierRight}>
              <View style={s.retentionTierBar}>
                <View style={[s.retentionTierBarFill, { backgroundColor: item.color, width: `${item.rate}%` }]} />
              </View>
              <ThemedText style={[s.retentionTierValue, { color: colors.textSecondary }]}>
                {item.rate}%
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Monthly Trend */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Monthly Trend
      </ThemedText>
      <View style={[s.trendCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {retentionMetrics.monthlyTrend.map((point, index) => (
          <View
            key={point.month}
            style={[
              s.trendRow,
              index < retentionMetrics.monthlyTrend.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <ThemedText style={[s.trendMonth, { color: colors.textSecondary }]}>{point.month}</ThemedText>
            <View style={s.trendBarContainer}>
              <View style={s.trendBar}>
                <View style={[s.trendBarFill, { backgroundColor: accentColor, width: `${point.rate}%` }]} />
              </View>
            </View>
            <ThemedText style={[s.trendValue, { color: colors.text }]}>{point.rate}%</ThemedText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// PARTNERSHIPS TAB
// =============================================================================

function PartnershipsTab({
  colors,
  accentColor,
  data,
  onSelectPartnership,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: PartnershipOpportunity[];
  onSelectPartnership: (partnership: PartnershipOpportunity) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const tColor = SPONSOR_TIER_COLOR[item.tier];
        const stColor = PARTNERSHIP_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.partnershipCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectPartnership(item);
            }}
          >
            <View style={s.partnershipCardTop}>
              <View style={s.partnershipCardInfo}>
                <ThemedText style={[s.partnershipTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </ThemedText>
                <View style={s.partnershipBadgeRow}>
                  <StatusBadge label={tierLabel(item.tier)} color={tColor} />
                  <StatusBadge label={item.status.replace('_', ' ').toUpperCase()} color={stColor} />
                </View>
              </View>
            </View>

            <ThemedText style={[s.partnershipDescription, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </ThemedText>

            <View style={[s.partnershipMeta, { borderTopColor: colors.border }]}>
              <View style={s.partnershipMetaItem}>
                <IconSymbol name="dollarsign.circle.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.partnershipMetaText, { color: colors.textSecondary }]}>
                  {formatCurrency(item.estimatedValue)}
                </ThemedText>
              </View>
              <View style={s.partnershipMetaItem}>
                <IconSymbol name="checkmark.circle.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.partnershipMetaText, { color: colors.textTertiary }]}>
                  {item.benefits.length} benefits
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="handshake.fill" label="No partnerships found" colors={colors} />
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
  sponsor: EduSponsor | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!sponsor) return null;

  const tColor = SPONSOR_TIER_COLOR[sponsor.tier];
  const typeColor = SPONSOR_TYPE_COLOR[sponsor.type];
  const stColor = SPONSOR_STATUS_COLOR[sponsor.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={sponsor.name} useModal>
      {/* Tier + Type + Status */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={tierLabel(sponsor.tier)} color={tColor} />
        <StatusBadge label={SPONSOR_TYPE_LABEL[sponsor.type]} color={typeColor} />
        <StatusBadge label={sponsor.status.toUpperCase()} color={stColor} />
      </View>

      {/* KPIs */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatCurrency(sponsor.totalGiving)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Total Given</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatCurrency(sponsor.currentYear)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>This Year</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{sponsor.since}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Since</ThemedText>
        </View>
      </View>

      {/* Focus Areas */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Focus Areas</ThemedText>
        <View style={s.sheetFocusRow}>
          {sponsor.focus.map((area, idx) => (
            <StatusBadge key={idx} label={area.toUpperCase()} color={accentColor} />
          ))}
        </View>
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
// PARTNERSHIP DETAIL BOTTOM SHEET
// =============================================================================

function PartnershipDetailSheet({
  visible,
  onClose,
  partnership,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  partnership: PartnershipOpportunity | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!partnership) return null;

  const tColor = SPONSOR_TIER_COLOR[partnership.tier];
  const stColor = PARTNERSHIP_STATUS_COLOR[partnership.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={partnership.title} useModal>
      {/* Tier + Status */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={tierLabel(partnership.tier)} color={tColor} />
        <StatusBadge label={partnership.status.replace('_', ' ').toUpperCase()} color={stColor} />
      </View>

      {/* Value */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatCurrency(partnership.estimatedValue)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Est. Value</ThemedText>
        </View>
      </View>

      {/* Description */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Description</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {partnership.description}
        </ThemedText>
      </View>

      {/* Benefits */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Benefits</ThemedText>
        {partnership.benefits.map((benefit, idx) => (
          <View key={idx} style={s.benefitRow}>
            <IconSymbol name="checkmark.circle.fill" size={14} color={accentColor} />
            <ThemedText style={[s.benefitText, { color: colors.textSecondary }]}>{benefit}</ThemedText>
          </View>
        ))}
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
          <ThemedText style={s.sheetActionButtonText}>Express Interest</ThemedText>
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

export function EduOrgSponsors({ colors, accentColor, role }: Props) {
  // === State ===
  const [activeTab, setActiveTab] = useState<EduSponsorsTabId>('overview');
  const [activeScope, setActiveScope] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSponsor, setSelectedSponsor] = useState<EduSponsor | null>(null);
  const [showSponsorDetail, setShowSponsorDetail] = useState(false);
  const [selectedPartnership, setSelectedPartnership] = useState<PartnershipOpportunity | null>(null);
  const [showPartnershipDetail, setShowPartnershipDetail] = useState(false);

  // === Data ===
  const scopeLabel = EDU_SPONSORS_SCOPE_CHIPS[activeScope] ?? 'All Donors';
  const data = useMemo(() => getEduSponsorsData(scopeLabel), [scopeLabel]);

  // === Filtered data ===
  const filteredSponsors = useMemo(() => {
    let result = data.sponsors;
    // Apply scope filter
    if (activeScope === 1) result = result.filter((sp) => sp.tier === 'platinum');
    else if (activeScope === 2) result = result.filter((sp) => sp.tier === 'gold');
    else if (activeScope === 3) result = result.filter((sp) => sp.tier === 'silver');
    else if (activeScope === 4) result = result.filter((sp) => sp.tier === 'bronze');
    else if (activeScope === 5) result = result.filter((sp) => sp.type === 'alumni');

    if (!searchQuery.trim()) return result;
    const q = searchQuery.toLowerCase();
    return result.filter(
      (sp) =>
        sp.name.toLowerCase().includes(q) ||
        sp.type.toLowerCase().includes(q) ||
        sp.focus.some((f) => f.toLowerCase().includes(q)),
    );
  }, [data.sponsors, searchQuery, activeScope]);

  const filteredEndowments = useMemo(() => {
    if (!searchQuery.trim()) return data.endowments;
    const q = searchQuery.toLowerCase();
    return data.endowments.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.purpose.toLowerCase().includes(q) ||
        e.donor.toLowerCase().includes(q),
    );
  }, [data.endowments, searchQuery]);

  const filteredCampaigns = useMemo(() => {
    if (!searchQuery.trim()) return data.campaigns;
    const q = searchQuery.toLowerCase();
    return data.campaigns.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }, [data.campaigns, searchQuery]);

  const filteredPartnerships = useMemo(() => {
    if (!searchQuery.trim()) return data.partnerships;
    const q = searchQuery.toLowerCase();
    return data.partnerships.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }, [data.partnerships, searchQuery]);

  // === Callbacks ===
  const handleTabPress = useCallback((tabId: EduSponsorsTabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  }, []);

  const handleScopePress = useCallback((index: number) => {
    Haptics.selectionAsync();
    setActiveScope(index);
  }, []);

  const handleSelectSponsor = useCallback((sponsor: EduSponsor) => {
    setSelectedSponsor(sponsor);
    setShowSponsorDetail(true);
  }, []);

  const handleSelectPartnership = useCallback((partnership: PartnershipOpportunity) => {
    setSelectedPartnership(partnership);
    setShowPartnershipDetail(true);
  }, []);

  // === Visible tabs — hide retention from non-admin ===
  const visibleTabs = useMemo(() => {
    if (role && !isDeanLevel(role)) {
      return EDU_SPONSORS_TABS.filter((t) => t.id !== 'retention');
    }
    return EDU_SPONSORS_TABS;
  }, [role]);

  // === Tab content renderer ===
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab colors={colors} accentColor={accentColor} stats={data.stats} />;
      case 'sponsors':
        return (
          <SponsorsTab
            colors={colors}
            accentColor={accentColor}
            data={filteredSponsors}
            onSelectSponsor={handleSelectSponsor}
          />
        );
      case 'endowments':
        return (
          <EndowmentsTab
            colors={colors}
            accentColor={accentColor}
            data={filteredEndowments}
            role={role}
          />
        );
      case 'campaigns':
        return <CampaignsTab colors={colors} accentColor={accentColor} data={filteredCampaigns} />;
      case 'retention':
        return (
          <RetentionTab
            colors={colors}
            accentColor={accentColor}
            retentionMetrics={data.retentionMetrics}
            role={role}
          />
        );
      case 'partnerships':
        return (
          <PartnershipsTab
            colors={colors}
            accentColor={accentColor}
            data={filteredPartnerships}
            onSelectPartnership={handleSelectPartnership}
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
        contentContainerStyle={s.tabPillRow}
      >
        {visibleTabs.map((tab) => {
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
        contentContainerStyle={s.scopeChipRow}
      >
        {EDU_SPONSORS_SCOPE_CHIPS.map((chip, index) => {
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
            placeholder="Search sponsors\u2026"
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
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
      <PartnershipDetailSheet
        visible={showPartnershipDetail}
        onClose={() => setShowPartnershipDetail(false)}
        partnership={selectedPartnership}
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

  // -- Restricted access --
  restrictedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  restrictedText: {
    fontSize: 14,
    marginTop: Spacing.md,
    textAlign: 'center',
    lineHeight: 20,
  },

  // -- Overview: Progress --
  progressCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  progressRaised: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  progressGoal: {
    fontSize: 14,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A1A1AA',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Overview: KPI Grid --
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  kpiCard: {
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

  // -- Overview: Retention Summary --
  retentionSummaryCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  retentionSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  retentionSummaryItem: {
    alignItems: 'center',
  },
  retentionSummaryValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  retentionSummaryLabel: {
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
    flexWrap: 'wrap',
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
  focusRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },

  // -- Endowments --
  endowmentSummary: {
    marginBottom: Spacing.md,
  },
  endowmentSummaryCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  endowmentSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  endowmentSummaryItem: {
    alignItems: 'center',
  },
  endowmentSummaryValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  endowmentSummaryLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  endowmentCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  endowmentCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  endowmentName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  endowmentYear: {
    fontSize: 12,
  },
  endowmentPurpose: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  endowmentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: 6,
  },
  endowmentMetaItem: {
    alignItems: 'center',
  },
  endowmentMetaValue: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  endowmentMetaLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  endowmentDonor: {
    fontSize: 12,
    fontStyle: 'italic',
  },

  // -- Campaigns --
  campaignCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  campaignCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  campaignCardInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  campaignDates: {
    fontSize: 12,
  },
  campaignDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  campaignProgress: {
    marginTop: 4,
  },
  campaignProgressHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
    marginBottom: 6,
  },
  campaignRaised: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  campaignGoal: {
    fontSize: 13,
  },
  campaignProgressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A1A1AA',
    marginBottom: 4,
    overflow: 'hidden',
  },
  campaignProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  campaignProgressPercent: {
    fontSize: 11,
  },

  // -- Retention --
  overallRetentionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  overallRetentionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  overallRetentionItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  overallRetentionValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  overallRetentionLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  retentionByTierCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  retentionTierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  retentionTierLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    width: 90,
  },
  retentionTierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  retentionTierLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  retentionTierRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  retentionTierBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A1A1AA',
    overflow: 'hidden',
  },
  retentionTierBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  retentionTierValue: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    width: 40,
    textAlign: 'right',
  },

  // -- Retention: Monthly Trend --
  trendCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  trendMonth: {
    fontSize: 13,
    fontWeight: '500',
    width: 35,
  },
  trendBarContainer: {
    flex: 1,
  },
  trendBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A1A1AA',
    overflow: 'hidden',
  },
  trendBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  trendValue: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    width: 40,
    textAlign: 'right',
  },

  // -- Partnerships --
  partnershipCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  partnershipCardTop: {
    marginBottom: 6,
  },
  partnershipCardInfo: {
    flex: 1,
  },
  partnershipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  partnershipBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  partnershipDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  partnershipMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  partnershipMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  partnershipMetaText: {
    fontSize: 12,
  },

  // -- Bottom Sheet shared --
  sheetBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
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
  sheetFocusRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 3,
  },
  benefitText: {
    fontSize: 13,
    flex: 1,
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
