/**
 * Church Organization Donations / Giving — Donation management, campaigns, reports.
 * Sub-tabs: Overview | Campaigns | Recent | Donors | Funds | Tax Receipts
 * RBAC: C1 (Senior Pastor) full, C2 (Elder) full, C3 (Staff) limited, C4 (Member) limited, C5 limited.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { ChurchRoleLens } from '@/utils/church-rbac';
import { isSeniorPastor, isElderLevel, isStaffLevel } from '@/utils/church-rbac';
import {
  getChurchDonationsData,
  formatCurrency,
  formatCurrencyFull,
  METHOD_LABELS,
  METHOD_ICONS,
  METHOD_COLORS,
  CAMPAIGN_STATUS_COLOR,
  CAMPAIGN_STATUS_LABELS,
} from '@/data/mock-church-org-donations';
import type {
  DonationRecord,
  GivingCampaign,
  GivingStats,
  FundAllocation,
  DonationMethod,
} from '@/data/mock-church-org-donations';

// =============================================================================
// CONSTANTS
// =============================================================================

const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'recent', label: 'Recent' },
  { id: 'donors', label: 'Donors' },
  { id: 'funds', label: 'Funds' },
  { id: 'receipts', label: 'Tax Receipts' },
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
  const parts = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[parseInt(parts[1], 10) - 1] || parts[1];
  const day = parseInt(parts[2], 10);
  return `${month} ${day}`;
}

function trendPercent(current: number, previous: number): { value: string; positive: boolean } {
  if (previous === 0) return { value: '+100%', positive: true };
  const annualizedCurrent = current * (12 / 1.5); // ~1.5 months into 2026
  const diff = ((annualizedCurrent - previous) / previous) * 100;
  return {
    value: `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`,
    positive: diff >= 0,
  };
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

function ProgressBar({ percent, color, height = 4 }: { percent: number; color: string; height?: number }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <View style={[s.progressTrack, { height }]}>
      <View style={[s.progressFill, { width: `${clamped}%`, backgroundColor: color, height }]} />
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
  stats,
  campaigns,
  donations,
  fundAllocations,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  stats: GivingStats;
  campaigns: GivingCampaign[];
  donations: DonationRecord[];
  fundAllocations: FundAllocation[];
}) {
  const trend = trendPercent(stats.totalYTD, stats.totalLastYear);
  const activeCampaigns = campaigns.filter((c) => c.status === 'active');

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Giving Overview Card */}
      <View style={[s.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.overviewLabel, { color: colors.textSecondary }]}>
          Year-to-Date Giving
        </ThemedText>
        <View style={s.overviewValueRow}>
          <ThemedText style={[s.overviewValue, { color: colors.text }]}>
            {formatCurrency(stats.totalYTD)}
          </ThemedText>
          <View style={[s.trendBadge, { backgroundColor: trend.positive ? '#22C55E20' : '#EF444420' }]}>
            <IconSymbol
              name={trend.positive ? 'arrow.up.right' : 'arrow.down.right'}
              size={10}
              color={trend.positive ? '#22C55E' : '#EF4444'}
            />
            <ThemedText
              style={[s.trendText, { color: trend.positive ? '#22C55E' : '#EF4444' }]}
            >
              {trend.value}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={[s.overviewSubtext, { color: colors.textTertiary }]}>
          vs. {formatCurrency(stats.totalLastYear)} full year 2025
        </ThemedText>
      </View>

      {/* KPI Row */}
      <View style={s.kpiRow}>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: colors.text }]}>{formatCurrency(stats.averageGift)}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Avg Gift</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: '#22C55E' }]}>{stats.recurringDonors}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Recurring</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: '#1D9BF0' }]}>{stats.totalDonors}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Donors</ThemedText>
        </View>
      </View>

      {/* Donor Breakdown */}
      <View style={[s.breakdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.breakdownTitle, { color: colors.text }]}>Donor Breakdown</ThemedText>
        <View style={s.breakdownRow}>
          <View style={s.breakdownItem}>
            <View style={[s.breakdownDot, { backgroundColor: '#22C55E' }]} />
            <ThemedText style={[s.breakdownLabel, { color: colors.textSecondary }]}>Recurring</ThemedText>
            <ThemedText style={[s.breakdownPercent, { color: colors.text }]}>
              {Math.round((stats.recurringDonors / stats.totalDonors) * 100)}%
            </ThemedText>
          </View>
          <View style={s.breakdownItem}>
            <View style={[s.breakdownDot, { backgroundColor: '#1D9BF0' }]} />
            <ThemedText style={[s.breakdownLabel, { color: colors.textSecondary }]}>One-time</ThemedText>
            <ThemedText style={[s.breakdownPercent, { color: colors.text }]}>
              {Math.round(((stats.totalDonors - stats.recurringDonors) / stats.totalDonors) * 100)}%
            </ThemedText>
          </View>
        </View>
        <View style={s.breakdownBarRow}>
          <View style={[s.breakdownBarSegment, { flex: stats.recurringDonors, backgroundColor: '#22C55E', borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }]} />
          <View style={[s.breakdownBarSegment, { flex: stats.totalDonors - stats.recurringDonors, backgroundColor: '#1D9BF0', borderTopRightRadius: 3, borderBottomRightRadius: 3 }]} />
        </View>
      </View>

      {/* Active Campaigns */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Active Campaigns
      </ThemedText>
      {activeCampaigns.map((campaign) => {
        const pct = campaign.goal > 0 ? (campaign.raised / campaign.goal) * 100 : 0;
        const barColor = pct >= 100 ? '#22C55E' : pct >= 50 ? '#1D9BF0' : '#F59E0B';
        return (
          <Pressable
            key={campaign.id}
            style={[s.campaignCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.campaignCardHeader}>
              <ThemedText style={[s.campaignName, { color: colors.text }]} numberOfLines={1}>
                {campaign.name}
              </ThemedText>
              <StatusBadge label="ACTIVE" color="#22C55E" />
            </View>
            <View style={s.campaignStats}>
              <ThemedText style={[s.campaignRaised, { color: colors.text }]}>
                {formatCurrency(campaign.raised)}
              </ThemedText>
              <ThemedText style={[s.campaignGoal, { color: colors.textTertiary }]}>
                of {formatCurrency(campaign.goal)} goal
              </ThemedText>
            </View>
            <ProgressBar percent={pct} color={barColor} height={6} />
            <View style={s.campaignMeta}>
              <ThemedText style={[s.campaignMetaText, { color: colors.textTertiary }]}>
                {campaign.donorCount} donors
              </ThemedText>
              <ThemedText style={[s.campaignMetaText, { color: colors.textTertiary }]}>
                {Math.round(pct)}% funded
              </ThemedText>
            </View>
          </Pressable>
        );
      })}

      {/* Fund Allocation */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Fund Allocation
      </ThemedText>
      <View style={[s.fundCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Stacked bar */}
        <View style={s.fundBarRow}>
          {fundAllocations.map((fund) => (
            <View
              key={fund.id}
              style={[
                s.fundBarSegment,
                {
                  flex: fund.percent,
                  backgroundColor: fund.color,
                },
              ]}
            />
          ))}
        </View>
        {/* Legend */}
        {fundAllocations.map((fund, index) => (
          <View
            key={fund.id}
            style={[
              s.fundRow,
              index < fundAllocations.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={[s.fundDot, { backgroundColor: fund.color }]} />
            <View style={s.fundTextCol}>
              <ThemedText style={[s.fundName, { color: colors.text }]}>{fund.name}</ThemedText>
            </View>
            <View style={s.fundRight}>
              <ThemedText style={[s.fundAmount, { color: colors.text }]}>
                {formatCurrency(fund.amount)}
              </ThemedText>
              <ThemedText style={[s.fundPct, { color: colors.textTertiary }]}>
                {fund.percent}%
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Recent Donations */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Recent Donations
      </ThemedText>
      {donations.slice(0, 4).map((don) => {
        const mColor = METHOD_COLORS[don.method];
        return (
          <View
            key={don.id}
            style={[s.donationRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[s.donationMethodIcon, { backgroundColor: mColor + '18' }]}>
              <IconSymbol name={METHOD_ICONS[don.method] as any} size={16} color={mColor} />
            </View>
            <View style={s.donationTextCol}>
              <ThemedText style={[s.donationDonor, { color: colors.text }]}>
                {don.anonymous ? 'Anonymous' : don.donor}
              </ThemedText>
              <ThemedText style={[s.donationFund, { color: colors.textSecondary }]}>
                {don.fund} — {formatDate(don.date)}
              </ThemedText>
            </View>
            <View style={s.donationRight}>
              <ThemedText style={[s.donationAmount, { color: colors.text }]}>
                {formatCurrencyFull(don.amount)}
              </ThemedText>
              {don.recurring && (
                <StatusBadge label="RECURRING" color="#1D9BF0" />
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// CAMPAIGNS SUB-TAB
// =============================================================================

function CampaignsTab({
  colors,
  accentColor,
  campaigns,
  onSelectCampaign,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  campaigns: GivingCampaign[];
  onSelectCampaign: (campaign: GivingCampaign) => void;
}) {
  const sorted = useMemo(() => {
    const statusOrder: Record<string, number> = { active: 0, upcoming: 1, completed: 2 };
    return [...campaigns].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }, [campaigns]);

  const renderItem = useCallback(
    ({ item }: { item: GivingCampaign }) => {
      const pct = item.goal > 0 ? (item.raised / item.goal) * 100 : 0;
      const barColor = pct >= 100 ? '#22C55E' : pct >= 50 ? '#1D9BF0' : '#F59E0B';
      const sColor = CAMPAIGN_STATUS_COLOR[item.status];
      return (
        <Pressable
          style={[s.campaignDetailCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectCampaign(item);
          }}
        >
          <View style={s.campaignDetailHeader}>
            <ThemedText style={[s.campaignDetailName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </ThemedText>
            <StatusBadge label={CAMPAIGN_STATUS_LABELS[item.status].toUpperCase()} color={sColor} />
          </View>

          {/* Progress */}
          <View style={s.campaignDetailStats}>
            <ThemedText style={[s.campaignDetailRaised, { color: colors.text }]}>
              {formatCurrency(item.raised)}
            </ThemedText>
            <ThemedText style={[s.campaignDetailGoal, { color: colors.textTertiary }]}>
              / {formatCurrency(item.goal)}
            </ThemedText>
            <ThemedText style={[s.campaignDetailPct, { color: barColor }]}>
              {Math.round(pct)}%
            </ThemedText>
          </View>
          <ProgressBar percent={pct} color={barColor} height={6} />

          {/* Meta Row */}
          <View style={[s.campaignDetailMeta, { borderTopColor: colors.border }]}>
            <View style={s.campaignDetailMetaItem}>
              <IconSymbol name="person.3.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.campaignDetailMetaText, { color: colors.textSecondary }]}>
                {item.donorCount} donors
              </ThemedText>
            </View>
            <View style={s.campaignDetailMetaItem}>
              <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.campaignDetailMetaText, { color: colors.textSecondary }]}>
                {formatDate(item.startDate)} — {formatDate(item.endDate)}
              </ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, onSelectCampaign],
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="heart.fill" label="No campaigns" colors={colors} />
      }
    />
  );
}

// =============================================================================
// RECENT DONATIONS SUB-TAB
// =============================================================================

function RecentTab({
  colors,
  accentColor,
  donations,
  role,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  donations: DonationRecord[];
  role: ChurchRoleLens;
}) {
  // Non-elder roles see redacted donor names
  const canSeeDonorNames = isElderLevel(role);

  const renderItem = useCallback(
    ({ item }: { item: DonationRecord }) => {
      const mColor = METHOD_COLORS[item.method];
      const displayDonor = item.anonymous
        ? 'Anonymous'
        : canSeeDonorNames
          ? item.donor
          : 'Member';
      return (
        <View style={[s.donationDetailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.donationDetailTop}>
            <View style={[s.donationDetailIcon, { backgroundColor: mColor + '18' }]}>
              <IconSymbol name={METHOD_ICONS[item.method] as any} size={18} color={mColor} />
            </View>
            <View style={s.donationDetailTextCol}>
              <ThemedText style={[s.donationDetailDonor, { color: colors.text }]}>
                {displayDonor}
              </ThemedText>
              <ThemedText style={[s.donationDetailFund, { color: colors.textSecondary }]}>
                {item.fund}
              </ThemedText>
            </View>
            <View style={s.donationDetailRight}>
              <ThemedText style={[s.donationDetailAmount, { color: colors.text }]}>
                {formatCurrencyFull(item.amount)}
              </ThemedText>
              <ThemedText style={[s.donationDetailDate, { color: colors.textTertiary }]}>
                {formatDate(item.date)}
              </ThemedText>
            </View>
          </View>
          <View style={[s.donationDetailFooter, { borderTopColor: colors.border }]}>
            <StatusBadge label={METHOD_LABELS[item.method].toUpperCase()} color={mColor} />
            {item.recurring && <StatusBadge label="RECURRING" color="#1D9BF0" />}
          </View>
        </View>
      );
    },
    [colors, canSeeDonorNames],
  );

  return (
    <FlatList
      data={donations}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="dollarsign.circle.fill" label="No recent donations" colors={colors} />
      }
    />
  );
}

// =============================================================================
// DONORS SUB-TAB
// =============================================================================

function DonorsTab({
  colors,
  accentColor,
  stats,
  donations,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  stats: GivingStats;
  donations: DonationRecord[];
}) {
  // Aggregate donor stats
  const donorStats = useMemo(() => {
    const map = new Map<string, { total: number; count: number; recurring: boolean }>();
    donations.forEach((d) => {
      const key = d.anonymous ? 'Anonymous' : d.donor;
      const existing = map.get(key) || { total: 0, count: 0, recurring: false };
      map.set(key, {
        total: existing.total + d.amount,
        count: existing.count + 1,
        recurring: existing.recurring || d.recurring,
      });
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [donations]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Donor Stats */}
      <View style={s.kpiRow}>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: colors.text }]}>{stats.totalDonors}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Total Donors</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: '#22C55E' }]}>{stats.recurringDonors}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Recurring</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: '#1D9BF0' }]}>{stats.totalDonors - stats.recurringDonors}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>One-Time</ThemedText>
        </View>
      </View>

      {/* Donor Leaderboard */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.md }]}>
        Top Givers (Recent)
      </ThemedText>
      {donorStats.map((donor, index) => (
        <View
          key={`donor-${index}`}
          style={[s.donorRow, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={[s.donorRank, { backgroundColor: accentColor + '12' }]}>
            <ThemedText style={[s.donorRankText, { color: accentColor }]}>{index + 1}</ThemedText>
          </View>
          <View style={s.donorTextCol}>
            <ThemedText style={[s.donorName, { color: colors.text }]}>{donor.name}</ThemedText>
            <View style={s.donorMetaRow}>
              <ThemedText style={[s.donorMetaText, { color: colors.textTertiary }]}>
                {donor.count} gift{donor.count !== 1 ? 's' : ''}
              </ThemedText>
              {donor.recurring && <StatusBadge label="RECURRING" color="#1D9BF0" />}
            </View>
          </View>
          <ThemedText style={[s.donorTotal, { color: colors.text }]}>
            {formatCurrencyFull(donor.total)}
          </ThemedText>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// FUNDS SUB-TAB
// =============================================================================

function FundsTab({
  colors,
  accentColor,
  fundAllocations,
  stats,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  fundAllocations: FundAllocation[];
  stats: GivingStats;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Giving Type Breakdown */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Giving Type Breakdown</ThemedText>
      <View style={[s.givingTypeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.givingTypeRow}>
          <View style={[s.givingTypeDot, { backgroundColor: '#1D9BF0' }]} />
          <ThemedText style={[s.givingTypeLabel, { color: colors.textSecondary }]}>Tithes</ThemedText>
          <ThemedText style={[s.givingTypeValue, { color: colors.text }]}>{stats.tithesPercent}%</ThemedText>
        </View>
        <ProgressBar percent={stats.tithesPercent} color="#1D9BF0" />
        <View style={s.givingTypeRow}>
          <View style={[s.givingTypeDot, { backgroundColor: '#1D9BF0' }]} />
          <ThemedText style={[s.givingTypeLabel, { color: colors.textSecondary }]}>Offerings</ThemedText>
          <ThemedText style={[s.givingTypeValue, { color: colors.text }]}>{stats.offeringsPercent}%</ThemedText>
        </View>
        <ProgressBar percent={stats.offeringsPercent} color="#1D9BF0" />
        <View style={s.givingTypeRow}>
          <View style={[s.givingTypeDot, { backgroundColor: '#F59E0B' }]} />
          <ThemedText style={[s.givingTypeLabel, { color: colors.textSecondary }]}>Special</ThemedText>
          <ThemedText style={[s.givingTypeValue, { color: colors.text }]}>{stats.specialPercent}%</ThemedText>
        </View>
        <ProgressBar percent={stats.specialPercent} color="#F59E0B" />
      </View>

      {/* Fund Details */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Fund Allocation Detail
      </ThemedText>
      {fundAllocations.map((fund) => (
        <View
          key={fund.id}
          style={[s.fundDetailCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.fundDetailTop}>
            <View style={[s.fundDetailDot, { backgroundColor: fund.color }]} />
            <View style={s.fundDetailTextCol}>
              <ThemedText style={[s.fundDetailName, { color: colors.text }]}>{fund.name}</ThemedText>
              <ThemedText style={[s.fundDetailPct, { color: colors.textSecondary }]}>
                {fund.percent}% of total giving
              </ThemedText>
            </View>
            <ThemedText style={[s.fundDetailAmount, { color: colors.text }]}>
              {formatCurrency(fund.amount)}
            </ThemedText>
          </View>
          <View style={{ paddingLeft: 22 }}>
            <ProgressBar percent={fund.percent} color={fund.color} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// TAX RECEIPTS SUB-TAB
// =============================================================================

function TaxReceiptsTab({
  colors,
  accentColor,
  stats,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  stats: GivingStats;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Status Card */}
      <View style={[s.receiptStatusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[s.receiptStatusIcon, { backgroundColor: '#22C55E18' }]}>
          <IconSymbol name="checkmark.circle.fill" size={28} color="#22C55E" />
        </View>
        <ThemedText style={[s.receiptStatusTitle, { color: colors.text }]}>
          2025 Tax Receipts Sent
        </ThemedText>
        <ThemedText style={[s.receiptStatusSubtitle, { color: colors.textSecondary }]}>
          All donor tax receipts for the 2025 tax year have been generated and distributed.
        </ThemedText>
      </View>

      {/* Receipt Stats */}
      <View style={s.kpiRow}>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: colors.text }]}>{stats.totalDonors}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Receipts Sent</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: '#22C55E' }]}>98%</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Delivered</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: '#F59E0B' }]}>8</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Pending</ThemedText>
        </View>
      </View>

      {/* 2026 YTD Status */}
      <View style={[s.receiptYearCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.receiptYearHeader}>
          <IconSymbol name="doc.text.fill" size={16} color={accentColor} />
          <ThemedText style={[s.receiptYearTitle, { color: colors.text }]}>
            2026 Year-to-Date
          </ThemedText>
        </View>
        <ThemedText style={[s.receiptYearText, { color: colors.textSecondary }]}>
          Tax receipts for 2026 will be generated at year-end. Current tracked giving: {formatCurrency(stats.totalYTD)}
        </ThemedText>
        <View style={s.receiptYearActions}>
          <Pressable
            style={[s.receiptActionBtn, { backgroundColor: accentColor + '12' }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <ThemedText style={[s.receiptActionText, { color: accentColor }]}>Preview Statement</ThemedText>
          </Pressable>
          <Pressable
            style={[s.receiptActionBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <ThemedText style={[s.receiptActionText, { color: colors.textSecondary }]}>Export Data</ThemedText>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// CAMPAIGN DETAIL BOTTOM SHEET
// =============================================================================

function CampaignDetailSheet({
  visible,
  onClose,
  campaign,
  colors,
  accentColor,
  donations,
}: {
  visible: boolean;
  onClose: () => void;
  campaign: GivingCampaign | null;
  colors: typeof Colors.light;
  accentColor: string;
  donations: DonationRecord[];
}) {
  if (!campaign) return null;

  const pct = campaign.goal > 0 ? (campaign.raised / campaign.goal) * 100 : 0;
  const barColor = pct >= 100 ? '#22C55E' : pct >= 50 ? '#1D9BF0' : '#F59E0B';
  const sColor = CAMPAIGN_STATUS_COLOR[campaign.status];
  const remaining = Math.max(campaign.goal - campaign.raised, 0);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={campaign.name} useModal>
      {/* Status */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={CAMPAIGN_STATUS_LABELS[campaign.status].toUpperCase()} color={sColor} />
      </View>

      {/* Progress */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Progress</ThemedText>
        <View style={s.sheetProgressRow}>
          <View style={s.sheetProgressItem}>
            <ThemedText style={[s.sheetProgressValue, { color: colors.text }]}>
              {formatCurrency(campaign.raised)}
            </ThemedText>
            <ThemedText style={[s.sheetProgressLabel, { color: colors.textSecondary }]}>Raised</ThemedText>
          </View>
          <View style={s.sheetProgressItem}>
            <ThemedText style={[s.sheetProgressValue, { color: colors.text }]}>
              {formatCurrency(campaign.goal)}
            </ThemedText>
            <ThemedText style={[s.sheetProgressLabel, { color: colors.textSecondary }]}>Goal</ThemedText>
          </View>
          <View style={s.sheetProgressItem}>
            <ThemedText style={[s.sheetProgressValue, { color: barColor }]}>
              {Math.round(pct)}%
            </ThemedText>
            <ThemedText style={[s.sheetProgressLabel, { color: colors.textSecondary }]}>Funded</ThemedText>
          </View>
        </View>
        <ProgressBar percent={pct} color={barColor} height={8} />
        <ThemedText style={[s.sheetRemainingText, { color: colors.textTertiary }]}>
          {formatCurrency(remaining)} remaining to reach goal
        </ThemedText>
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailRowInline}>
          <IconSymbol name="person.3.fill" size={13} color={colors.textTertiary} />
          <ThemedText style={[s.sheetDetailText, { color: colors.textSecondary }]}>
            {campaign.donorCount} donors
          </ThemedText>
        </View>
        <View style={s.sheetDetailRowInline}>
          <IconSymbol name="calendar" size={13} color={colors.textTertiary} />
          <ThemedText style={[s.sheetDetailText, { color: colors.textSecondary }]}>
            {formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}
          </ThemedText>
        </View>
        {campaign.donorCount > 0 && (
          <View style={s.sheetDetailRowInline}>
            <IconSymbol name="dollarsign.circle.fill" size={13} color={colors.textTertiary} />
            <ThemedText style={[s.sheetDetailText, { color: colors.textSecondary }]}>
              Avg gift: {formatCurrencyFull(Math.round(campaign.raised / campaign.donorCount))}
            </ThemedText>
          </View>
        )}
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
          <ThemedText style={s.sheetActionButtonText}>Give to Campaign</ThemedText>
        </Pressable>
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

export function ChurchOrgDonations({ colors, accentColor, role = 'C1' }: Props) {
  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [selectedCampaign, setSelectedCampaign] = useState<GivingCampaign | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  // === Data ===
  const data = useMemo(() => getChurchDonationsData(), []);

  // === Callbacks ===
  const handleSelectCampaign = useCallback((campaign: GivingCampaign) => {
    setSelectedCampaign(campaign);
    setSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  // C1/C2: all tabs, C3: overview + campaigns + recent + funds, C4/C5: overview + campaigns
  const visibleSubTabs = useMemo(() => {
    if (isElderLevel(role)) return SUB_TABS;
    if (isStaffLevel(role)) return SUB_TABS.filter((t) => ['overview', 'campaigns', 'recent', 'funds'].includes(t.id));
    // C4 and C5: overview + campaigns only
    return SUB_TABS.filter((t) => t.id === 'overview' || t.id === 'campaigns');
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return (
          <OverviewTab
            colors={colors}
            accentColor={accentColor}
            stats={data.stats}
            campaigns={data.campaigns}
            donations={data.donations}
            fundAllocations={data.fundAllocations}
          />
        );
      case 'campaigns':
        return (
          <CampaignsTab
            colors={colors}
            accentColor={accentColor}
            campaigns={data.campaigns}
            onSelectCampaign={handleSelectCampaign}
          />
        );
      case 'recent':
        if (!isStaffLevel(role)) return null;
        return (
          <RecentTab
            colors={colors}
            accentColor={accentColor}
            donations={data.donations}
            role={role}
          />
        );
      case 'donors':
        if (!isElderLevel(role)) return null;
        return (
          <DonorsTab
            colors={colors}
            accentColor={accentColor}
            stats={data.stats}
            donations={data.donations}
          />
        );
      case 'funds':
        if (!isStaffLevel(role)) return null;
        return (
          <FundsTab
            colors={colors}
            accentColor={accentColor}
            fundAllocations={data.fundAllocations}
            stats={data.stats}
          />
        );
      case 'receipts':
        if (!isElderLevel(role)) return null;
        return (
          <TaxReceiptsTab
            colors={colors}
            accentColor={accentColor}
            stats={data.stats}
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
        activeId={activeSubTab}
        onSelect={setActiveSubTab}
        accentColor={accentColor}
        colors={colors}
      />

      {/* Content */}
      <View style={s.contentContainer}>
        {renderContent()}
      </View>

      {/* Campaign Detail Bottom Sheet */}
      <CampaignDetailSheet
        visible={sheetVisible}
        onClose={handleCloseSheet}
        campaign={selectedCampaign}
        colors={colors}
        accentColor={accentColor}
        donations={data.donations}
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
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: 4,
    borderRadius: 3,
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
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Overview Card --
  overviewCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  overviewLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  overviewValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  overviewValue: {
    fontSize: 30,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  overviewSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // -- Breakdown Card --
  breakdownCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownLabel: {
    fontSize: 12,
  },
  breakdownPercent: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  breakdownBarRow: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownBarSegment: {
    height: 6,
  },

  // -- Campaign Card --
  campaignCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  campaignCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  campaignName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  campaignStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 6,
  },
  campaignRaised: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  campaignGoal: {
    fontSize: 12,
  },
  campaignMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  campaignMetaText: {
    fontSize: 11,
  },

  // -- Campaign Detail Card --
  campaignDetailCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  campaignDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  campaignDetailName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  campaignDetailStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 6,
  },
  campaignDetailRaised: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  campaignDetailGoal: {
    fontSize: 12,
  },
  campaignDetailPct: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  campaignDetailMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  campaignDetailMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  campaignDetailMetaText: {
    fontSize: 11,
  },

  // -- Fund Card --
  fundCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  fundBarRow: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  fundBarSegment: {
    height: 8,
  },
  fundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  fundDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  fundTextCol: {
    flex: 1,
  },
  fundName: {
    fontSize: 13,
    fontWeight: '600',
  },
  fundRight: {
    alignItems: 'flex-end',
  },
  fundAmount: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  fundPct: {
    fontSize: 10,
    marginTop: 1,
  },

  // -- Donation Row (overview) --
  donationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  donationMethodIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donationTextCol: {
    flex: 1,
  },
  donationDonor: {
    fontSize: 14,
    fontWeight: '600',
  },
  donationFund: {
    fontSize: 11,
    marginTop: 2,
  },
  donationRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  donationAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Donation Detail Card --
  donationDetailCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  donationDetailTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  donationDetailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donationDetailTextCol: {
    flex: 1,
  },
  donationDetailDonor: {
    fontSize: 14,
    fontWeight: '600',
  },
  donationDetailFund: {
    fontSize: 12,
    marginTop: 2,
  },
  donationDetailRight: {
    alignItems: 'flex-end',
  },
  donationDetailAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  donationDetailDate: {
    fontSize: 11,
    marginTop: 2,
  },
  donationDetailFooter: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  // -- Donor Tab --
  donorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  donorRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donorRankText: {
    fontSize: 13,
    fontWeight: '700',
  },
  donorTextCol: {
    flex: 1,
  },
  donorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  donorMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  donorMetaText: {
    fontSize: 11,
  },
  donorTotal: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Giving Type Card --
  givingTypeCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  givingTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  givingTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  givingTypeLabel: {
    fontSize: 13,
    flex: 1,
  },
  givingTypeValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Fund Detail Card --
  fundDetailCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  fundDetailTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  fundDetailDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  fundDetailTextCol: {
    flex: 1,
  },
  fundDetailName: {
    fontSize: 14,
    fontWeight: '600',
  },
  fundDetailPct: {
    fontSize: 11,
    marginTop: 1,
  },
  fundDetailAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Tax Receipts --
  receiptStatusCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  receiptStatusIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  receiptStatusTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  receiptStatusSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  receiptYearCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  receiptYearHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  receiptYearTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  receiptYearText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  receiptYearActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  receiptActionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  receiptActionText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Bottom Sheet --
  sheetBadgeRow: {
    flexDirection: 'row',
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
  sheetProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },
  sheetProgressItem: {
    alignItems: 'center',
  },
  sheetProgressValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sheetProgressLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  sheetRemainingText: {
    fontSize: 12,
    textAlign: 'center',
  },
  sheetDetailRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  sheetDetailText: {
    fontSize: 13,
    flex: 1,
  },
  sheetActions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
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
