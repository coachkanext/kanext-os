/**
 * Church Organization Donations/Giving V2 — 10-view sub-tab hub.
 * Sub-tabs: Overview | Give | Funds | Campaigns | Donors | Recurring | Receipts | Reports | Reconciliation | Controls
 * RBAC: C1 (Senior Pastor) full, C2 (Elder) full, C3 (Staff) limited, C4 (Member) limited, C5 (Public) minimal.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { ChurchRoleLens } from '@/utils/church-rbac';
import { isElderLevel, isStaffLevel, isMember } from '@/utils/church-rbac';
import {
  getChurchDonationsV2Data,
  FUND_TYPE_LABELS,
  FUND_TYPE_ICONS,
  FUND_TYPE_COLORS,
  FUND_STATUS_LABELS,
  FUND_RESTRICTION_LABELS,
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_COLORS,
  GIFT_FREQUENCY_LABELS,
  GIFT_METHOD_LABELS,
  GIFT_METHOD_ICONS,
  RECEIPT_STATUS_LABELS,
  RECEIPT_STATUS_COLORS,
  RECONCILIATION_STATUS_LABELS,
  RECONCILIATION_STATUS_COLORS,
  DONOR_STATUS_LABELS,
  DONOR_STATUS_COLORS,
} from '@/data/mock-church-org-donations-v2';
import type {
  GivingFund,
  GivingCampaign,
  DonorProfile,
  RecurringGift,
  GivingReceipt,
  ReconciliationItem,
  GivingControl,
  CampaignUpdate,
} from '@/data/mock-church-org-donations-v2';

// =============================================================================
// CONSTANTS
// =============================================================================

const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'give', label: 'Give' },
  { id: 'funds', label: 'Funds' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'donors', label: 'Donors' },
  { id: 'recurring', label: 'Recurring' },
  { id: 'receipts', label: 'Receipts' },
  { id: 'reports', label: 'Reports' },
  { id: 'reconciliation', label: 'Reconciliation' },
  { id: 'controls', label: 'Controls' },
];

const GIVE_FREQUENCIES = [
  { id: 'one_time', label: 'One-Time' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
];

const GIVE_AMOUNTS = [25, 50, 100, 250, 500, 1000];

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

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return '$' + (amount / 1000000).toFixed(1) + 'M';
  }
  if (amount >= 1000) {
    return '$' + (amount / 1000).toFixed(amount >= 10000 ? 0 : 1) + 'K';
  }
  return '$' + amount.toLocaleString('en-US');
}

function formatCurrencyFull(amount: number): string {
  return '$' + amount.toLocaleString('en-US');
}

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[parseInt(parts[1], 10) - 1] || parts[1];
  const day = parseInt(parts[2], 10);
  return `${month} ${day}`;
}

function daysUntil(dateStr: string): number {
  const now = new Date('2026-02-18');
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function progressPercent(raised: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(Math.round((raised / goal) * 100), 100);
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
  role,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getChurchDonationsV2Data>;
  role: ChurchRoleLens;
}) {
  const tiles = data.overviewTiles;
  const isFinanceLevel = isElderLevel(role);

  const tileData = [
    { label: 'Total Giving MTD', value: tiles.totalGivingMTD, icon: 'dollarsign.circle.fill', color: '#22C55E' },
    { label: 'Total Giving YTD', value: tiles.totalGivingYTD, icon: 'chart.line.uptrend.xyaxis', color: '#6AA9FF' },
    { label: 'Active Recurring', value: String(tiles.activeRecurring), icon: 'arrow.triangle.2.circlepath', color: '#8B5CF6' },
    { label: 'Fund Balances', value: isFinanceLevel ? formatCurrency(data.funds.reduce((s, f) => s + f.balance, 0)) : '---', icon: 'banknote.fill', color: '#F59E0B' },
    { label: 'Campaign Progress', value: `${data.campaigns.filter((c) => c.status === 'active').length} Active`, icon: 'flag.fill', color: '#EC4899' },
    { label: 'Exception Flags', value: String(tiles.exceptionFlags), icon: 'exclamationmark.triangle.fill', color: '#EF4444' },
  ];

  // Attention items for C1/C2
  const attentionItems = isFinanceLevel
    ? [
        ...(data.reconciliation.filter((r) => r.status === 'failed' || r.status === 'returned').map((r) => ({
          id: r.id,
          title: `${RECONCILIATION_STATUS_LABELS[r.status]} Transaction`,
          description: `${r.transactionRef} — ${formatCurrencyFull(r.amount)} (${GIFT_METHOD_LABELS[r.method]})${r.notes ? ': ' + r.notes : ''}`,
          color: RECONCILIATION_STATUS_COLORS[r.status],
        }))),
        ...(data.recurringGifts.filter((r) => r.status === 'failed').map((r) => ({
          id: r.id,
          title: 'Failed Recurring Gift',
          description: `${r.donorName} — ${formatCurrencyFull(r.amount)} ${GIFT_FREQUENCY_LABELS[r.frequency]} to ${FUND_TYPE_LABELS[r.designation]}`,
          color: '#EF4444',
        }))),
      ]
    : [];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* KPI Tile Grid */}
      <View style={s.kpiGrid}>
        {tileData.map((tile, i) => (
          <View
            key={`tile-${i}`}
            style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <IconSymbol name={tile.icon as any} size={16} color={tile.color} />
            <ThemedText style={[s.kpiValue, { color: colors.text }]}>{tile.value}</ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>{tile.label}</ThemedText>
          </View>
        ))}
      </View>

      {/* What Needs Attention */}
      {attentionItems.length > 0 && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            What Needs Attention
          </ThemedText>
          {attentionItems.map((item) => (
            <View
              key={item.id}
              style={[s.alertCard, { backgroundColor: item.color + '10', borderColor: item.color + '30' }]}
            >
              <IconSymbol name="exclamationmark.triangle.fill" size={16} color={item.color} />
              <View style={s.alertTextCol}>
                <ThemedText style={[s.alertTitle, { color: colors.text }]}>{item.title}</ThemedText>
                <ThemedText style={[s.alertSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.description}
                </ThemedText>
              </View>
            </View>
          ))}
        </>
      )}

      {/* Active Campaign Progress */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Active Campaigns
      </ThemedText>
      {data.campaigns
        .filter((c) => c.status === 'active')
        .slice(0, 3)
        .map((camp) => {
          const pct = progressPercent(camp.raisedAmount, camp.goalAmount);
          return (
            <View
              key={camp.id}
              style={[s.campaignPreview, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={s.campaignPreviewHeader}>
                <ThemedText style={[s.campaignPreviewName, { color: colors.text }]} numberOfLines={1}>
                  {camp.name}
                </ThemedText>
                <ThemedText style={[s.campaignPreviewPct, { color: accentColor }]}>{pct}%</ThemedText>
              </View>
              <ProgressBar percent={pct} color={accentColor} />
              <View style={s.campaignPreviewMeta}>
                <ThemedText style={[s.campaignPreviewMetaText, { color: colors.textTertiary }]}>
                  {isFinanceLevel ? formatCurrencyFull(camp.raisedAmount) : '---'} of {formatCurrencyFull(camp.goalAmount)}
                </ThemedText>
                <ThemedText style={[s.campaignPreviewMetaText, { color: colors.textTertiary }]}>
                  {camp.donorCount} donors
                </ThemedText>
              </View>
            </View>
          );
        })}

      {/* Public Transparency Strip */}
      {!isFinanceLevel && (
        <View style={[s.transparencyStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="eye.fill" size={14} color={colors.textSecondary} />
          <ThemedText style={[s.transparencyText, { color: colors.textSecondary }]}>
            Detailed financial data is available to authorized roles only
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );
}

// =============================================================================
// GIVE SUB-TAB
// =============================================================================

function GiveTab({
  colors,
  accentColor,
  funds,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  funds: GivingFund[];
}) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState('one_time');
  const [selectedFundId, setSelectedFundId] = useState(funds[0]?.id || '');
  const [coverFees, setCoverFees] = useState(false);

  const publicFunds = funds.filter((f) => f.status === 'active' && f.publicPage);
  const selectedFund = funds.find((f) => f.id === selectedFundId);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Amount Selection */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Select Amount</ThemedText>
      <View style={s.amountGrid}>
        {GIVE_AMOUNTS.map((amt) => {
          const isActive = selectedAmount === amt;
          return (
            <Pressable
              key={amt}
              style={[
                s.amountChip,
                {
                  backgroundColor: isActive ? accentColor + '20' : colors.card,
                  borderColor: isActive ? accentColor + '40' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedAmount(amt);
              }}
            >
              <ThemedText
                style={[s.amountChipText, { color: isActive ? accentColor : colors.text }]}
              >
                ${amt}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Display Amount */}
      <View style={s.amountDisplay}>
        <ThemedText style={[s.amountDisplayValue, { color: colors.text }]}>
          {selectedAmount ? formatCurrencyFull(selectedAmount) : '$0'}
        </ThemedText>
      </View>

      {/* Frequency Selector */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>Frequency</ThemedText>
      <View style={s.frequencyRow}>
        {GIVE_FREQUENCIES.map((freq) => {
          const isActive = selectedFrequency === freq.id;
          return (
            <Pressable
              key={freq.id}
              style={[
                s.frequencyChip,
                {
                  backgroundColor: isActive ? accentColor + '20' : colors.card,
                  borderColor: isActive ? accentColor + '40' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedFrequency(freq.id);
              }}
            >
              <ThemedText
                style={[s.frequencyChipText, { color: isActive ? accentColor : colors.textSecondary }]}
              >
                {freq.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Designation Picker */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>Designation</ThemedText>
      {publicFunds.map((fund) => {
        const isActive = fund.id === selectedFundId;
        const typeColor = FUND_TYPE_COLORS[fund.type];
        return (
          <Pressable
            key={fund.id}
            style={[
              s.designationRow,
              {
                backgroundColor: isActive ? accentColor + '08' : colors.card,
                borderColor: isActive ? accentColor + '30' : colors.border,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedFundId(fund.id);
            }}
          >
            <View style={[s.designationIcon, { backgroundColor: typeColor + '18' }]}>
              <IconSymbol name={FUND_TYPE_ICONS[fund.type] as any} size={16} color={typeColor} />
            </View>
            <View style={s.designationTextCol}>
              <ThemedText style={[s.designationName, { color: colors.text }]}>{fund.name}</ThemedText>
              <ThemedText style={[s.designationPurpose, { color: colors.textSecondary }]} numberOfLines={1}>
                {fund.purpose}
              </ThemedText>
            </View>
            {isActive && (
              <IconSymbol name="checkmark.circle.fill" size={20} color={accentColor} />
            )}
          </Pressable>
        );
      })}

      {/* Cover Fees Toggle */}
      <View style={[s.coverFeesRow, { borderTopColor: colors.border }]}>
        <View style={s.coverFeesTextCol}>
          <ThemedText style={[s.coverFeesTitle, { color: colors.text }]}>Cover processing fees</ThemedText>
          <ThemedText style={[s.coverFeesSubtitle, { color: colors.textSecondary }]}>
            Add ~3% so 100% of your gift goes to the fund
          </ThemedText>
        </View>
        <Pressable
          style={[
            s.toggleTrack,
            { backgroundColor: coverFees ? accentColor : colors.border },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setCoverFees(!coverFees);
          }}
        >
          <View style={[s.toggleThumb, { transform: [{ translateX: coverFees ? 18 : 2 }] }]} />
        </Pressable>
      </View>

      {/* Confirmation Preview */}
      {selectedAmount && (
        <View style={[s.confirmationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.confirmationTitle, { color: colors.text }]}>Gift Summary</ThemedText>
          <View style={s.confirmationRow}>
            <ThemedText style={[s.confirmationLabel, { color: colors.textSecondary }]}>Amount</ThemedText>
            <ThemedText style={[s.confirmationValue, { color: colors.text }]}>
              {formatCurrencyFull(coverFees ? Math.round(selectedAmount * 1.03) : selectedAmount)}
            </ThemedText>
          </View>
          <View style={s.confirmationRow}>
            <ThemedText style={[s.confirmationLabel, { color: colors.textSecondary }]}>Frequency</ThemedText>
            <ThemedText style={[s.confirmationValue, { color: colors.text }]}>
              {GIVE_FREQUENCIES.find((f) => f.id === selectedFrequency)?.label}
            </ThemedText>
          </View>
          <View style={s.confirmationRow}>
            <ThemedText style={[s.confirmationLabel, { color: colors.textSecondary }]}>Fund</ThemedText>
            <ThemedText style={[s.confirmationValue, { color: colors.text }]}>
              {selectedFund?.name || '---'}
            </ThemedText>
          </View>
          {coverFees && (
            <View style={s.confirmationRow}>
              <ThemedText style={[s.confirmationLabel, { color: colors.textSecondary }]}>Processing Fee</ThemedText>
              <ThemedText style={[s.confirmationValue, { color: colors.textSecondary }]}>
                +{formatCurrencyFull(Math.round(selectedAmount * 0.03))}
              </ThemedText>
            </View>
          )}
        </View>
      )}

      {/* Give CTA */}
      <Pressable
        style={[
          s.giveCTA,
          { backgroundColor: selectedAmount ? accentColor : colors.border },
        ]}
        onPress={() => {
          if (selectedAmount) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }}
        disabled={!selectedAmount}
      >
        <ThemedText style={[s.giveCTAText, { color: selectedAmount ? '#000' : colors.textTertiary }]}>
          {selectedAmount ? `Give ${formatCurrencyFull(coverFees ? Math.round(selectedAmount * 1.03) : selectedAmount)}` : 'Select an Amount'}
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}

// =============================================================================
// FUNDS SUB-TAB
// =============================================================================

function FundsTab({
  colors,
  accentColor,
  funds,
  role,
  onSelectFund,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  funds: GivingFund[];
  role: ChurchRoleLens;
  onSelectFund: (fund: GivingFund) => void;
}) {
  const isFinanceLevel = isElderLevel(role);

  const renderItem = useCallback(
    ({ item }: { item: GivingFund }) => {
      const typeColor = FUND_TYPE_COLORS[item.type];
      const pct = item.goalAmount ? progressPercent(item.balance, item.goalAmount) : null;
      return (
        <Pressable
          style={[s.fundCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectFund(item);
          }}
        >
          <View style={s.fundCardTop}>
            <View style={[s.fundIconCircle, { backgroundColor: typeColor + '18' }]}>
              <IconSymbol name={FUND_TYPE_ICONS[item.type] as any} size={18} color={typeColor} />
            </View>
            <View style={s.fundNameCol}>
              <ThemedText style={[s.fundName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <View style={s.fundBadgeRow}>
                <StatusBadge label={FUND_TYPE_LABELS[item.type].toUpperCase()} color={typeColor} />
                <StatusBadge label={FUND_RESTRICTION_LABELS[item.restriction].toUpperCase()} color={item.restriction === 'unrestricted' ? '#22C55E' : item.restriction === 'designated' ? '#6AA9FF' : '#F59E0B'} />
                <StatusBadge label={FUND_STATUS_LABELS[item.status].toUpperCase()} color={item.status === 'active' ? '#22C55E' : '#8F8F8F'} />
              </View>
            </View>
          </View>

          {/* Purpose */}
          <ThemedText style={[s.fundPurpose, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.purpose}
          </ThemedText>

          {/* Balance */}
          <View style={[s.fundDetails, { borderTopColor: colors.border }]}>
            <View style={s.fundDetailItem}>
              <ThemedText style={[s.fundDetailValue, { color: colors.text }]}>
                {isFinanceLevel ? formatCurrency(item.balance) : '---'}
              </ThemedText>
              <ThemedText style={[s.fundDetailLabel, { color: colors.textTertiary }]}>Balance</ThemedText>
            </View>
            <View style={s.fundDetailItem}>
              <ThemedText style={[s.fundDetailValue, { color: colors.text }]}>{item.owner}</ThemedText>
              <ThemedText style={[s.fundDetailLabel, { color: colors.textTertiary }]}>Owner</ThemedText>
            </View>
            <View style={s.fundDetailItem}>
              <ThemedText style={[s.fundDetailValue, { color: colors.text }]}>{item.usedByCampaigns}</ThemedText>
              <ThemedText style={[s.fundDetailLabel, { color: colors.textTertiary }]}>Campaigns</ThemedText>
            </View>
          </View>

          {/* Goal Progress */}
          {pct !== null && (
            <View style={s.fundGoalSection}>
              <View style={s.fundGoalRow}>
                <ThemedText style={[s.fundGoalLabel, { color: colors.textSecondary }]}>Goal Progress</ThemedText>
                <ThemedText style={[s.fundGoalPct, { color: accentColor }]}>{pct}%</ThemedText>
              </View>
              <ProgressBar percent={pct} color={accentColor} />
            </View>
          )}
        </Pressable>
      );
    },
    [colors, accentColor, role, onSelectFund],
  );

  return (
    <FlatList
      data={funds}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="banknote.fill" label="No funds available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// CAMPAIGNS SUB-TAB
// =============================================================================

function CampaignsTab({
  colors,
  accentColor,
  campaigns,
  role,
  onSelectCampaign,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  campaigns: GivingCampaign[];
  role: ChurchRoleLens;
  onSelectCampaign: (campaign: GivingCampaign) => void;
}) {
  const isFinanceLevel = isElderLevel(role);

  // C5 public only, C4 public only, C3+ all
  const visibleCampaigns = useMemo(() => {
    if (isStaffLevel(role)) return campaigns;
    return campaigns.filter((c) => c.isPublic);
  }, [campaigns, role]);

  const renderItem = useCallback(
    ({ item }: { item: GivingCampaign }) => {
      const pct = progressPercent(item.raisedAmount, item.goalAmount);
      const statusColor = CAMPAIGN_STATUS_COLORS[item.status];
      const days = daysUntil(item.deadline);
      return (
        <Pressable
          style={[s.campaignCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectCampaign(item);
          }}
        >
          <View style={s.campaignCardHeader}>
            <ThemedText style={[s.campaignName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </ThemedText>
            <View style={s.campaignBadgeRow}>
              <StatusBadge label={CAMPAIGN_STATUS_LABELS[item.status].toUpperCase()} color={statusColor} />
              <StatusBadge label={item.isPublic ? 'PUBLIC' : 'PRIVATE'} color={item.isPublic ? '#22C55E' : '#F59E0B'} />
            </View>
          </View>

          <View style={s.campaignFundRow}>
            <IconSymbol name="tag.fill" size={11} color={colors.textTertiary} />
            <ThemedText style={[s.campaignFundName, { color: colors.textTertiary }]}>{item.fundName}</ThemedText>
          </View>

          {/* Progress */}
          <View style={s.campaignProgressSection}>
            <View style={s.campaignProgressRow}>
              <ThemedText style={[s.campaignProgressText, { color: colors.textSecondary }]}>
                {isFinanceLevel ? formatCurrencyFull(item.raisedAmount) : '---'} of {formatCurrencyFull(item.goalAmount)}
              </ThemedText>
              <ThemedText style={[s.campaignProgressPct, { color: accentColor }]}>{pct}%</ThemedText>
            </View>
            <ProgressBar percent={pct} color={accentColor} />
          </View>

          {/* Meta Row */}
          <View style={[s.campaignMeta, { borderTopColor: colors.border }]}>
            <View style={s.campaignMetaItem}>
              <IconSymbol name="person.2.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.campaignMetaText, { color: colors.textTertiary }]}>
                {item.donorCount} donors
              </ThemedText>
            </View>
            <View style={s.campaignMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.campaignMetaText, { color: colors.textTertiary }]}>
                {days > 0 ? `${days}d left` : 'Ended'}
              </ThemedText>
            </View>
            {item.updatesCount > 0 && (
              <View style={s.campaignMetaItem}>
                <IconSymbol name="bell.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.campaignMetaText, { color: colors.textTertiary }]}>
                  {item.updatesCount} updates
                </ThemedText>
              </View>
            )}
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, role, onSelectCampaign],
  );

  return (
    <FlatList
      data={visibleCampaigns}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="flag.fill" label="No campaigns available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// DONORS SUB-TAB (C1/C2 only)
// =============================================================================

function DonorsTab({
  colors,
  accentColor,
  donors,
  onSelectDonor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  donors: DonorProfile[];
  onSelectDonor: (donor: DonorProfile) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: DonorProfile }) => {
      const statusColor = DONOR_STATUS_COLORS[item.status];
      return (
        <Pressable
          style={[s.donorCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectDonor(item);
          }}
        >
          <View style={s.donorCardTop}>
            <View style={[s.donorAvatar, { backgroundColor: accentColor + '18' }]}>
              <ThemedText style={[s.donorAvatarText, { color: accentColor }]}>
                {item.name.charAt(0)}
              </ThemedText>
            </View>
            <View style={s.donorNameCol}>
              <ThemedText style={[s.donorName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <View style={s.donorBadgeRow}>
                <StatusBadge label={item.lifetimeGivingBand} color={accentColor} />
                <StatusBadge label={DONOR_STATUS_LABELS[item.status].toUpperCase()} color={statusColor} />
                {item.recurringStatus && (
                  <StatusBadge label="RECURRING" color="#8B5CF6" />
                )}
              </View>
            </View>
          </View>

          <View style={[s.donorDetails, { borderTopColor: colors.border }]}>
            <View style={s.donorDetailItem}>
              <ThemedText style={[s.donorDetailValue, { color: colors.text }]}>
                {formatDate(item.lastGiftDate)}
              </ThemedText>
              <ThemedText style={[s.donorDetailLabel, { color: colors.textTertiary }]}>Last Gift</ThemedText>
            </View>
            <View style={s.donorDetailItem}>
              <ThemedText style={[s.donorDetailValue, { color: colors.text }]}>
                {formatCurrencyFull(item.totalGiftsYTD)}
              </ThemedText>
              <ThemedText style={[s.donorDetailLabel, { color: colors.textTertiary }]}>YTD</ThemedText>
            </View>
            <View style={s.donorDetailItem}>
              <IconSymbol
                name={item.taxStatementReady ? 'checkmark.circle.fill' : 'clock.fill'}
                size={16}
                color={item.taxStatementReady ? '#22C55E' : '#F59E0B'}
              />
              <ThemedText style={[s.donorDetailLabel, { color: colors.textTertiary }]}>Tax Stmt</ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectDonor],
  );

  return (
    <FlatList
      data={donors}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="person.2.fill" label="No donor records" colors={colors} />
      }
    />
  );
}

// =============================================================================
// RECURRING SUB-TAB
// =============================================================================

function RecurringTab({
  colors,
  accentColor,
  recurringGifts,
  role,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  recurringGifts: RecurringGift[];
  role: ChurchRoleLens;
  data: ReturnType<typeof getChurchDonationsV2Data>;
}) {
  const isFinanceLevel = isElderLevel(role);

  // C4: show only "own" recurring (simulate with a subset)
  const visibleGifts = useMemo(() => {
    if (isFinanceLevel) return recurringGifts;
    // C4: show first 2 as "my gifts"
    return recurringGifts.slice(0, 2);
  }, [recurringGifts, role]);

  // Summary for C1/C2
  const activeCount = recurringGifts.filter((r) => r.status === 'active').length;
  const failedCount = recurringGifts.filter((r) => r.status === 'failed').length;
  const pausedCount = recurringGifts.filter((r) => r.status === 'paused').length;
  const totalExpected = recurringGifts
    .filter((r) => r.status === 'active')
    .reduce((sum, r) => {
      const multiplier = r.frequency === 'weekly' ? 4 : r.frequency === 'quarterly' ? 0.33 : 1;
      return sum + r.amount * multiplier;
    }, 0);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Summary for C1/C2 */}
      {isFinanceLevel && (
        <View style={s.kpiRow}>
          <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.kpiValue, { color: '#22C55E' }]}>{activeCount}</ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Active</ThemedText>
          </View>
          <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.kpiValue, { color: '#EF4444' }]}>{failedCount}</ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Failed</ThemedText>
          </View>
          <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.kpiValue, { color: colors.text }]}>{formatCurrency(Math.round(totalExpected))}</ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Expected/mo</ThemedText>
          </View>
        </View>
      )}

      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>
        {isFinanceLevel ? 'All Recurring Gifts' : 'My Recurring Gifts'}
      </ThemedText>

      {visibleGifts.map((gift) => {
        const statusColor = gift.status === 'active' ? '#22C55E' : gift.status === 'paused' ? '#F59E0B' : gift.status === 'failed' ? '#EF4444' : '#8F8F8F';
        return (
          <View
            key={gift.id}
            style={[s.recurringCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.recurringCardHeader}>
              <View style={s.recurringNameCol}>
                <ThemedText style={[s.recurringDonor, { color: colors.text }]} numberOfLines={1}>
                  {gift.donorName}
                </ThemedText>
                <ThemedText style={[s.recurringDesignation, { color: colors.textSecondary }]}>
                  {FUND_TYPE_LABELS[gift.designation]}
                </ThemedText>
              </View>
              <View style={s.recurringAmountCol}>
                <ThemedText style={[s.recurringAmount, { color: colors.text }]}>
                  {formatCurrencyFull(gift.amount)}
                </ThemedText>
                <ThemedText style={[s.recurringFrequency, { color: colors.textTertiary }]}>
                  {GIFT_FREQUENCY_LABELS[gift.frequency]}
                </ThemedText>
              </View>
            </View>

            <View style={[s.recurringMeta, { borderTopColor: colors.border }]}>
              <View style={s.recurringMetaItem}>
                <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.recurringMetaText, { color: colors.textTertiary }]}>
                  Next: {formatDate(gift.nextChargeDate)}
                </ThemedText>
              </View>
              <View style={s.recurringMetaItem}>
                <IconSymbol name={GIFT_METHOD_ICONS[gift.method] as any} size={11} color={colors.textTertiary} />
                <ThemedText style={[s.recurringMetaText, { color: colors.textTertiary }]}>
                  {GIFT_METHOD_LABELS[gift.method]}
                </ThemedText>
              </View>
              <StatusBadge label={gift.status.toUpperCase()} color={statusColor} />
            </View>

            {/* Edit/Pause actions for own gifts */}
            {!isFinanceLevel && (
              <View style={s.recurringActions}>
                <Pressable
                  style={[s.recurringActionBtn, { borderColor: colors.border }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <ThemedText style={[s.recurringActionText, { color: colors.textSecondary }]}>Edit</ThemedText>
                </Pressable>
                <Pressable
                  style={[s.recurringActionBtn, { borderColor: colors.border }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <ThemedText style={[s.recurringActionText, { color: '#F59E0B' }]}>
                    {gift.status === 'paused' ? 'Resume' : 'Pause'}
                  </ThemedText>
                </Pressable>
              </View>
            )}
          </View>
        );
      })}

      {visibleGifts.length === 0 && (
        <EmptyState icon="arrow.triangle.2.circlepath" label="No recurring gifts" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// RECEIPTS SUB-TAB
// =============================================================================

function ReceiptsTab({
  colors,
  accentColor,
  receipts,
  role,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  receipts: GivingReceipt[];
  role: ChurchRoleLens;
}) {
  const isFinanceLevel = isElderLevel(role);

  // C4: only "own" receipts (simulate with subset)
  const visibleReceipts = useMemo(() => {
    if (isFinanceLevel) return receipts;
    return receipts.slice(0, 3);
  }, [receipts, role]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Statement Generation (C1/C2) */}
      {isFinanceLevel && (
        <View style={[s.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.lg }]}>
          <View style={s.sectionCardHeader}>
            <IconSymbol name="doc.text.fill" size={16} color={accentColor} />
            <ThemedText style={[s.sectionCardTitle, { color: colors.text }]}>Statement Generation</ThemedText>
          </View>
          <ThemedText style={[s.statementDesc, { color: colors.textSecondary }]}>
            Generate tax statements for donors with date range selection
          </ThemedText>
          <Pressable
            style={[s.statementGenBtn, { backgroundColor: accentColor }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <ThemedText style={s.statementGenBtnText}>Generate Statements</ThemedText>
          </Pressable>
        </View>
      )}

      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>
        {isFinanceLevel ? 'All Receipts' : 'My Receipts'}
      </ThemedText>

      {visibleReceipts.map((receipt) => {
        const statusColor = RECEIPT_STATUS_COLORS[receipt.status];
        return (
          <View
            key={receipt.id}
            style={[s.receiptCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.receiptCardHeader}>
              <View style={s.receiptNameCol}>
                <ThemedText style={[s.receiptDonor, { color: colors.text }]} numberOfLines={1}>
                  {receipt.donorName}
                </ThemedText>
                <ThemedText style={[s.receiptId, { color: colors.textTertiary }]}>
                  {receipt.receiptId}
                </ThemedText>
              </View>
              <ThemedText style={[s.receiptAmount, { color: colors.text }]}>
                {formatCurrencyFull(receipt.amount)}
              </ThemedText>
            </View>

            <View style={[s.receiptMeta, { borderTopColor: colors.border }]}>
              <View style={s.receiptMetaItem}>
                <ThemedText style={[s.receiptMetaText, { color: colors.textTertiary }]}>
                  {receipt.fundName}
                </ThemedText>
              </View>
              <View style={s.receiptMetaItem}>
                <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.receiptMetaText, { color: colors.textTertiary }]}>
                  {formatDate(receipt.date)}
                </ThemedText>
              </View>
              <StatusBadge label={GIFT_METHOD_LABELS[receipt.method].toUpperCase()} color={accentColor} />
              <StatusBadge label={RECEIPT_STATUS_LABELS[receipt.status].toUpperCase()} color={statusColor} />
            </View>

            {receipt.taxDeductible && (
              <View style={s.taxDeductibleRow}>
                <IconSymbol name="checkmark.seal.fill" size={12} color="#22C55E" />
                <ThemedText style={[s.taxDeductibleText, { color: '#22C55E' }]}>Tax Deductible</ThemedText>
              </View>
            )}
          </View>
        );
      })}

      {visibleReceipts.length === 0 && (
        <EmptyState icon="doc.text.fill" label="No receipts" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// REPORTS SUB-TAB (C1/C2 full, C3 limited)
// =============================================================================

function ReportsTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const reports = [
    { id: 'rpt-001', name: 'Giving by Fund', description: 'Total giving breakdown by fund with trends over time', icon: 'chart.pie.fill', category: 'giving' },
    { id: 'rpt-002', name: 'Giving by Campaign', description: 'Campaign-level giving analysis with donor metrics', icon: 'chart.bar.fill', category: 'giving' },
    { id: 'rpt-003', name: 'New vs Returning Donors', description: 'Donor acquisition and retention analysis', icon: 'person.2.fill', category: 'donor' },
    { id: 'rpt-004', name: 'Recurring Coverage', description: 'Recurring giving as percentage of budget needs', icon: 'arrow.triangle.2.circlepath', category: 'recurring' },
    { id: 'rpt-005', name: 'Allocation Summary', description: 'How funds are allocated across ministries and operations', icon: 'square.grid.2x2.fill', category: 'allocation' },
    { id: 'rpt-006', name: 'Benevolence Summary', description: 'Benevolence fund usage, recipients, and impact metrics', icon: 'heart.fill', category: 'allocation' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Available Reports</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Select a report to generate
      </ThemedText>

      {reports.map((report) => (
        <Pressable
          key={report.id}
          style={[s.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={[s.reportIconCircle, { backgroundColor: accentColor + '18' }]}>
            <IconSymbol name={report.icon as any} size={20} color={accentColor} />
          </View>
          <View style={s.reportTextCol}>
            <ThemedText style={[s.reportName, { color: colors.text }]}>{report.name}</ThemedText>
            <ThemedText style={[s.reportDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {report.description}
            </ThemedText>
          </View>
          <Pressable
            style={[s.generateBtn, { backgroundColor: accentColor + '15', borderColor: accentColor + '30' }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <ThemedText style={[s.generateBtnText, { color: accentColor }]}>Generate</ThemedText>
          </Pressable>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// RECONCILIATION SUB-TAB (C1/C2 only)
// =============================================================================

function ReconciliationTab({
  colors,
  accentColor,
  items,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  items: ReconciliationItem[];
}) {
  const processedCount = items.filter((i) => i.status === 'processed').length;
  const pendingCount = items.filter((i) => i.status === 'pending').length;
  const failedCount = items.filter((i) => i.status === 'failed').length;
  const returnedCount = items.filter((i) => i.status === 'returned' || i.status === 'needs_action').length;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Reconciliation Bridge */}
      <View style={s.kpiRow}>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: '#22C55E' }]}>{processedCount}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Processed</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: '#F59E0B' }]}>{pendingCount}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Pending</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: '#EF4444' }]}>{failedCount}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Failed</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: '#8B5CF6' }]}>{returnedCount}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Returned</ThemedText>
        </View>
      </View>

      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Transaction Items
      </ThemedText>

      {items.map((item, index) => {
        const statusColor = RECONCILIATION_STATUS_COLORS[item.status];
        return (
          <Pressable
            key={item.id}
            style={[s.reconCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[s.reconStatusBar, { backgroundColor: statusColor }]} />
            <View style={s.reconContent}>
              <View style={s.reconHeader}>
                <ThemedText style={[s.reconRef, { color: colors.text }]}>{item.transactionRef}</ThemedText>
                <ThemedText style={[s.reconAmount, { color: colors.text }]}>
                  {formatCurrencyFull(item.amount)}
                </ThemedText>
              </View>
              <View style={s.reconMetaRow}>
                <ThemedText style={[s.reconFund, { color: colors.textSecondary }]}>
                  {FUND_TYPE_LABELS[item.fund]}
                </ThemedText>
                <StatusBadge label={GIFT_METHOD_LABELS[item.method].toUpperCase()} color={accentColor} />
                <StatusBadge label={RECONCILIATION_STATUS_LABELS[item.status].toUpperCase()} color={statusColor} />
              </View>
              <View style={s.reconDateRow}>
                <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.reconDateText, { color: colors.textTertiary }]}>
                  {formatDate(item.date)}
                </ThemedText>
              </View>
              {item.notes && (
                <ThemedText style={[s.reconNotes, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.notes}
                </ThemedText>
              )}
            </View>
          </Pressable>
        );
      })}

      {items.length === 0 && (
        <EmptyState icon="arrow.triangle.2.circlepath" label="No reconciliation items" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// CONTROLS SUB-TAB (C1/C2 only)
// =============================================================================

function ControlsTab({
  colors,
  accentColor,
  controls,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  controls: GivingControl[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Giving Controls</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Policies and safeguards governing donation processing
      </ThemedText>

      {controls.map((ctrl) => {
        const statusColor = ctrl.status === 'active' ? '#22C55E' : '#F59E0B';
        const statusLabel = ctrl.status === 'active' ? 'ACTIVE' : 'NEEDS REVIEW';
        return (
          <View
            key={ctrl.id}
            style={[s.controlCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.controlHeader}>
              <ThemedText style={[s.controlName, { color: colors.text }]}>{ctrl.name}</ThemedText>
              <StatusBadge label={statusLabel} color={statusColor} />
            </View>
            <ThemedText style={[s.controlDesc, { color: colors.textSecondary }]} numberOfLines={3}>
              {ctrl.description}
            </ThemedText>
            <View style={s.controlOwnerRow}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.controlOwner, { color: colors.textTertiary }]}>{ctrl.owner}</ThemedText>
            </View>
          </View>
        );
      })}

      {controls.length === 0 && (
        <EmptyState icon="gearshape.fill" label="No controls configured" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// FUND DETAIL BOTTOM SHEET
// =============================================================================

function FundDetailSheet({
  visible,
  onClose,
  fund,
  colors,
  accentColor,
  campaigns,
  receipts,
  role,
}: {
  visible: boolean;
  onClose: () => void;
  fund: GivingFund | null;
  colors: typeof Colors.light;
  accentColor: string;
  campaigns: GivingCampaign[];
  receipts: GivingReceipt[];
  role: ChurchRoleLens;
}) {
  if (!fund) return null;

  const isFinanceLevel = isElderLevel(role);
  const typeColor = FUND_TYPE_COLORS[fund.type];
  const linkedCampaigns = campaigns.filter((c) => c.fundId === fund.id);
  const recentGifts = receipts.filter((r) => r.designation === fund.type).slice(0, 5);
  const pct = fund.goalAmount ? progressPercent(fund.balance, fund.goalAmount) : null;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={fund.name} useModal>
      {/* Status Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={FUND_TYPE_LABELS[fund.type].toUpperCase()} color={typeColor} />
        <StatusBadge label={FUND_RESTRICTION_LABELS[fund.restriction].toUpperCase()} color={fund.restriction === 'unrestricted' ? '#22C55E' : fund.restriction === 'designated' ? '#6AA9FF' : '#F59E0B'} />
        <StatusBadge label={FUND_STATUS_LABELS[fund.status].toUpperCase()} color={fund.status === 'active' ? '#22C55E' : '#8F8F8F'} />
      </View>

      {/* Balance */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Balance</ThemedText>
        <ThemedText style={[s.sheetBalanceValue, { color: colors.text }]}>
          {isFinanceLevel ? formatCurrencyFull(fund.balance) : 'Restricted'}
        </ThemedText>
        {pct !== null && (
          <>
            <View style={s.sheetGoalRow}>
              <ThemedText style={[s.sheetGoalLabel, { color: colors.textSecondary }]}>
                Goal: {formatCurrencyFull(fund.goalAmount!)}
              </ThemedText>
              <ThemedText style={[s.sheetGoalPct, { color: accentColor }]}>{pct}%</ThemedText>
            </View>
            <ProgressBar percent={pct} color={accentColor} />
          </>
        )}
      </View>

      {/* Purpose */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Purpose</ThemedText>
        <ThemedText style={[s.sheetPurposeText, { color: colors.textSecondary }]}>{fund.purpose}</ThemedText>
      </View>

      {/* Restriction Rules */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Restriction Rules</ThemedText>
        <ThemedText style={[s.sheetPurposeText, { color: colors.textSecondary }]}>
          {fund.restriction === 'unrestricted'
            ? 'No restrictions. Funds may be used for any approved purpose.'
            : fund.restriction === 'designated'
            ? 'Donor-designated for specific purpose. Must be used according to designation.'
            : 'Legally restricted. Principal or usage governed by external agreement or donor stipulation.'}
        </ThemedText>
      </View>

      {/* Linked Campaigns */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Linked Campaigns ({linkedCampaigns.length})
        </ThemedText>
        {linkedCampaigns.map((camp) => (
          <View key={camp.id} style={s.sheetListRow}>
            <IconSymbol name="flag.fill" size={14} color={accentColor} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {camp.name}
              </ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                {CAMPAIGN_STATUS_LABELS[camp.status]} — {camp.donorCount} donors
              </ThemedText>
            </View>
          </View>
        ))}
        {linkedCampaigns.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No campaigns linked to this fund
          </ThemedText>
        )}
      </View>

      {/* Recent Gifts */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Recent Gifts ({recentGifts.length})
        </ThemedText>
        {recentGifts.map((gift) => (
          <View key={gift.id} style={s.sheetListRow}>
            <IconSymbol name="dollarsign.circle.fill" size={14} color="#22C55E" />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {isFinanceLevel ? gift.donorName : 'Donor'} — {formatCurrencyFull(gift.amount)}
              </ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                {formatDate(gift.date)} — {GIFT_METHOD_LABELS[gift.method]}
              </ThemedText>
            </View>
          </View>
        ))}
        {recentGifts.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No recent gifts to this fund
          </ThemedText>
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
          <ThemedText style={s.sheetActionButtonText}>View Full Details</ThemedText>
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
// CAMPAIGN DETAIL BOTTOM SHEET
// =============================================================================

function CampaignDetailSheet({
  visible,
  onClose,
  campaign,
  colors,
  accentColor,
  campaignUpdates,
  role,
}: {
  visible: boolean;
  onClose: () => void;
  campaign: GivingCampaign | null;
  colors: typeof Colors.light;
  accentColor: string;
  campaignUpdates: CampaignUpdate[];
  role: ChurchRoleLens;
}) {
  if (!campaign) return null;

  const isFinanceLevel = isElderLevel(role);
  const pct = progressPercent(campaign.raisedAmount, campaign.goalAmount);
  const statusColor = CAMPAIGN_STATUS_COLORS[campaign.status];
  const updates = campaignUpdates.filter((u) => u.campaignId === campaign.id);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={campaign.name} useModal>
      {/* Status Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={CAMPAIGN_STATUS_LABELS[campaign.status].toUpperCase()} color={statusColor} />
        <StatusBadge label={campaign.isPublic ? 'PUBLIC' : 'PRIVATE'} color={campaign.isPublic ? '#22C55E' : '#F59E0B'} />
        <StatusBadge label={campaign.fundName.toUpperCase()} color={accentColor} />
      </View>

      {/* Goal + Progress */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Goal Progress</ThemedText>
        <View style={s.sheetGoalRow}>
          <ThemedText style={[s.sheetBalanceValue, { color: colors.text }]}>
            {isFinanceLevel ? formatCurrencyFull(campaign.raisedAmount) : '---'}
          </ThemedText>
          <ThemedText style={[s.sheetGoalPct, { color: accentColor }]}>{pct}%</ThemedText>
        </View>
        <ThemedText style={[s.sheetGoalLabel, { color: colors.textSecondary, marginBottom: Spacing.sm }]}>
          of {formatCurrencyFull(campaign.goalAmount)} goal
        </ThemedText>
        <ProgressBar percent={pct} color={accentColor} />
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{campaign.donorCount}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Donors</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatDate(campaign.deadline)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Deadline</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{campaign.owner}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Owner</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{campaign.ministry || '---'}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Ministry</ThemedText>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Where Funds Go</ThemedText>
        <ThemedText style={[s.sheetPurposeText, { color: colors.textSecondary }]}>
          {campaign.description}
        </ThemedText>
      </View>

      {/* Updates Feed */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Updates ({updates.length})
        </ThemedText>
        {updates.map((update) => (
          <View key={update.id} style={s.updateCard}>
            <View style={s.updateHeader}>
              <ThemedText style={[s.updateTitle, { color: colors.text }]}>{update.title}</ThemedText>
              <ThemedText style={[s.updateDate, { color: colors.textTertiary }]}>
                {formatDate(update.postedDate)}
              </ThemedText>
            </View>
            <ThemedText style={[s.updateContent, { color: colors.textSecondary }]} numberOfLines={3}>
              {update.content}
            </ThemedText>
            <ThemedText style={[s.updateAuthor, { color: colors.textTertiary }]}>
              — {update.postedBy}
            </ThemedText>
          </View>
        ))}
        {updates.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No updates posted yet
          </ThemedText>
        )}
      </View>

      {/* Give to Campaign CTA */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>Give to This Campaign</ThemedText>
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
// DONOR DETAIL BOTTOM SHEET (C1/C2 only)
// =============================================================================

function DonorDetailSheet({
  visible,
  onClose,
  donor,
  colors,
  accentColor,
  receipts,
  recurringGifts,
}: {
  visible: boolean;
  onClose: () => void;
  donor: DonorProfile | null;
  colors: typeof Colors.light;
  accentColor: string;
  receipts: GivingReceipt[];
  recurringGifts: RecurringGift[];
}) {
  if (!donor) return null;

  const donorReceipts = receipts.filter((r) => r.donorId === donor.id);
  const donorRecurring = recurringGifts.filter((r) => r.donorId === donor.id);
  const statusColor = DONOR_STATUS_COLORS[donor.status];

  // Designation breakdown
  const designationMap = new Map<string, number>();
  donorReceipts.forEach((r) => {
    const current = designationMap.get(r.fundName) || 0;
    designationMap.set(r.fundName, current + r.amount);
  });

  return (
    <BottomSheet visible={visible} onClose={onClose} title={donor.name} useModal>
      {/* Status Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={donor.lifetimeGivingBand} color={accentColor} />
        <StatusBadge label={DONOR_STATUS_LABELS[donor.status].toUpperCase()} color={statusColor} />
        {donor.recurringStatus && <StatusBadge label="RECURRING" color="#8B5CF6" />}
      </View>

      {/* Quick Stats */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Giving Summary</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatCurrencyFull(donor.totalGiftsYTD)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>YTD Giving</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatDate(donor.lastGiftDate)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Last Gift</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {GIFT_METHOD_LABELS[donor.preferredMethod]}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Preferred Method</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <IconSymbol
              name={donor.taxStatementReady ? 'checkmark.circle.fill' : 'clock.fill'}
              size={16}
              color={donor.taxStatementReady ? '#22C55E' : '#F59E0B'}
            />
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Tax Statement</ThemedText>
          </View>
        </View>
      </View>

      {/* Designation Breakdown */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Designation Breakdown</ThemedText>
        {Array.from(designationMap.entries()).map(([fundName, amount]) => (
          <View key={fundName} style={s.sheetListRow}>
            <IconSymbol name="dollarsign.circle.fill" size={14} color={accentColor} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>{fundName}</ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                {formatCurrencyFull(amount)}
              </ThemedText>
            </View>
          </View>
        ))}
        {designationMap.size === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No designation data
          </ThemedText>
        )}
      </View>

      {/* Recurring Gifts */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Recurring Gifts ({donorRecurring.length})
        </ThemedText>
        {donorRecurring.map((rec) => {
          const recStatusColor = rec.status === 'active' ? '#22C55E' : rec.status === 'failed' ? '#EF4444' : '#F59E0B';
          return (
            <View key={rec.id} style={s.sheetListRow}>
              <IconSymbol name="arrow.triangle.2.circlepath" size={14} color={recStatusColor} />
              <View style={s.sheetListTextCol}>
                <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>
                  {formatCurrencyFull(rec.amount)} {GIFT_FREQUENCY_LABELS[rec.frequency]}
                </ThemedText>
                <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                  {FUND_TYPE_LABELS[rec.designation]} — {rec.status.toUpperCase()}
                </ThemedText>
              </View>
            </View>
          );
        })}
        {donorRecurring.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No recurring gifts
          </ThemedText>
        )}
      </View>

      {/* Recent Receipts */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Recent Receipts ({donorReceipts.length})
        </ThemedText>
        {donorReceipts.slice(0, 5).map((receipt) => (
          <View key={receipt.id} style={s.sheetListRow}>
            <IconSymbol name="doc.text.fill" size={14} color={accentColor} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>
                {receipt.receiptId} — {formatCurrencyFull(receipt.amount)}
              </ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                {formatDate(receipt.date)} — {receipt.fundName}
              </ThemedText>
            </View>
          </View>
        ))}
        {donorReceipts.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No receipts on file
          </ThemedText>
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
          <ThemedText style={s.sheetActionButtonText}>View Full Profile</ThemedText>
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

export function ChurchOrgDonationsV2({ colors, accentColor, role = 'C1' }: Props) {
  // === RBAC Gate: C5 — only Give (public campaigns) + Campaigns (public only) ===
  // C4 — Overview (limited) + Give + Campaigns (public) + Recurring (own) + Receipts (own)
  // C3 — Overview + Give + Funds (their campaigns only) + Campaigns (their ministry) + Recurring (summary)
  // C2/C1 — Full 10 sub-tabs

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [selectedFund, setSelectedFund] = useState<GivingFund | null>(null);
  const [fundSheetVisible, setFundSheetVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<GivingCampaign | null>(null);
  const [campaignSheetVisible, setCampaignSheetVisible] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<DonorProfile | null>(null);
  const [donorSheetVisible, setDonorSheetVisible] = useState(false);

  // === Data ===
  const data = useMemo(() => getChurchDonationsV2Data(), []);

  // === Callbacks ===
  const handleSelectFund = useCallback((fund: GivingFund) => {
    setSelectedFund(fund);
    setFundSheetVisible(true);
  }, []);

  const handleCloseFundSheet = useCallback(() => {
    setFundSheetVisible(false);
  }, []);

  const handleSelectCampaign = useCallback((campaign: GivingCampaign) => {
    setSelectedCampaign(campaign);
    setCampaignSheetVisible(true);
  }, []);

  const handleCloseCampaignSheet = useCallback(() => {
    setCampaignSheetVisible(false);
  }, []);

  const handleSelectDonor = useCallback((donor: DonorProfile) => {
    setSelectedDonor(donor);
    setDonorSheetVisible(true);
  }, []);

  const handleCloseDonorSheet = useCallback(() => {
    setDonorSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (isElderLevel(role)) {
      // C1/C2: all 10 sub-tabs
      return SUB_TABS;
    }
    if (isStaffLevel(role)) {
      // C3: Overview + Give + Funds (limited) + Campaigns (ministry) + Recurring (summary)
      return SUB_TABS.filter((t) =>
        ['overview', 'give', 'funds', 'campaigns', 'recurring', 'reports'].includes(t.id),
      );
    }
    if (isMember(role)) {
      // C4: Overview (limited) + Give + Campaigns (public) + Recurring (own) + Receipts (own)
      return SUB_TABS.filter((t) =>
        ['overview', 'give', 'campaigns', 'recurring', 'receipts'].includes(t.id),
      );
    }
    // C5: Give + Campaigns (public only)
    return SUB_TABS.filter((t) => ['give', 'campaigns'].includes(t.id));
  }, [role]);

  // Reset to first visible tab if current is no longer visible
  const effectiveSubTab = useMemo(() => {
    if (visibleSubTabs.some((t) => t.id === activeSubTab)) return activeSubTab;
    return visibleSubTabs[0]?.id || 'give';
  }, [activeSubTab, visibleSubTabs]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (effectiveSubTab) {
      case 'overview':
        return <OverviewTab colors={colors} accentColor={accentColor} data={data} role={role} />;
      case 'give':
        return <GiveTab colors={colors} accentColor={accentColor} funds={data.funds} />;
      case 'funds':
        return (
          <FundsTab
            colors={colors}
            accentColor={accentColor}
            funds={data.funds}
            role={role}
            onSelectFund={handleSelectFund}
          />
        );
      case 'campaigns':
        return (
          <CampaignsTab
            colors={colors}
            accentColor={accentColor}
            campaigns={data.campaigns}
            role={role}
            onSelectCampaign={handleSelectCampaign}
          />
        );
      case 'donors':
        if (!isElderLevel(role)) return null;
        return (
          <DonorsTab
            colors={colors}
            accentColor={accentColor}
            donors={data.donors}
            onSelectDonor={handleSelectDonor}
          />
        );
      case 'recurring':
        return (
          <RecurringTab
            colors={colors}
            accentColor={accentColor}
            recurringGifts={data.recurringGifts}
            role={role}
            data={data}
          />
        );
      case 'receipts':
        return (
          <ReceiptsTab
            colors={colors}
            accentColor={accentColor}
            receipts={data.receipts}
            role={role}
          />
        );
      case 'reports':
        if (!isStaffLevel(role)) return null;
        return <ReportsTab colors={colors} accentColor={accentColor} />;
      case 'reconciliation':
        if (!isElderLevel(role)) return null;
        return (
          <ReconciliationTab
            colors={colors}
            accentColor={accentColor}
            items={data.reconciliation}
          />
        );
      case 'controls':
        if (!isElderLevel(role)) return null;
        return (
          <ControlsTab
            colors={colors}
            accentColor={accentColor}
            controls={data.controls}
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
        activeId={effectiveSubTab}
        onSelect={setActiveSubTab}
        accentColor={accentColor}
        colors={colors}
      />

      {/* Content */}
      <View style={s.contentContainer}>
        {renderContent()}
      </View>

      {/* Fund Detail Bottom Sheet */}
      <FundDetailSheet
        visible={fundSheetVisible}
        onClose={handleCloseFundSheet}
        fund={selectedFund}
        colors={colors}
        accentColor={accentColor}
        campaigns={data.campaigns}
        receipts={data.receipts}
        role={role}
      />

      {/* Campaign Detail Bottom Sheet */}
      <CampaignDetailSheet
        visible={campaignSheetVisible}
        onClose={handleCloseCampaignSheet}
        campaign={selectedCampaign}
        colors={colors}
        accentColor={accentColor}
        campaignUpdates={data.campaignUpdates}
        role={role}
      />

      {/* Donor Detail Bottom Sheet (C1/C2) */}
      {isElderLevel(role) && (
        <DonorDetailSheet
          visible={donorSheetVisible}
          onClose={handleCloseDonorSheet}
          donor={selectedDonor}
          colors={colors}
          accentColor={accentColor}
          receipts={data.receipts}
          recurringGifts={data.recurringGifts}
        />
      )}
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },

  // -- KPI Grid (6 tiles) --
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  kpiCard: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginTop: 4,
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

  // -- Alert Card --
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  alertTextCol: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // -- Campaign Preview (overview) --
  campaignPreview: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  campaignPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  campaignPreviewName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  campaignPreviewPct: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  campaignPreviewMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  campaignPreviewMetaText: {
    fontSize: 11,
  },

  // -- Transparency Strip --
  transparencyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  transparencyText: {
    fontSize: 12,
    flex: 1,
  },

  // -- Give Tab --
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  amountChip: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  amountChipText: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  amountDisplay: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  amountDisplayValue: {
    fontSize: 36,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  frequencyChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  frequencyChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  designationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  designationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  designationTextCol: {
    flex: 1,
  },
  designationName: {
    fontSize: 14,
    fontWeight: '600',
  },
  designationPurpose: {
    fontSize: 11,
    marginTop: 2,
  },
  coverFeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.md,
    marginTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  coverFeesTextCol: {
    flex: 1,
  },
  coverFeesTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  coverFeesSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  confirmationCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  confirmationTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  confirmationLabel: {
    fontSize: 13,
  },
  confirmationValue: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  giveCTA: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  giveCTAText: {
    fontSize: 16,
    fontWeight: '700',
  },

  // -- Fund Card --
  fundCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  fundCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  fundIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fundNameCol: {
    flex: 1,
  },
  fundName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  fundBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  fundPurpose: {
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  fundDetails: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  fundDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  fundDetailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  fundDetailLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  fundGoalSection: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  fundGoalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fundGoalLabel: {
    fontSize: 11,
  },
  fundGoalPct: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Campaign Card --
  campaignCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    padding: Spacing.md,
  },
  campaignCardHeader: {
    marginBottom: Spacing.sm,
  },
  campaignName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  campaignBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  campaignFundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  campaignFundName: {
    fontSize: 11,
  },
  campaignProgressSection: {
    marginBottom: Spacing.sm,
  },
  campaignProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  campaignProgressText: {
    fontSize: 12,
  },
  campaignProgressPct: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  campaignMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  campaignMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  campaignMetaText: {
    fontSize: 11,
  },

  // -- Donor Card --
  donorCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  donorCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  donorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donorAvatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  donorNameCol: {
    flex: 1,
  },
  donorName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  donorBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  donorDetails: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  donorDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  donorDetailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  donorDetailLabel: {
    fontSize: 10,
    marginTop: 1,
  },

  // -- Recurring Card --
  recurringCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    padding: Spacing.md,
  },
  recurringCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  recurringNameCol: {
    flex: 1,
  },
  recurringDonor: {
    fontSize: 14,
    fontWeight: '600',
  },
  recurringDesignation: {
    fontSize: 12,
    marginTop: 2,
  },
  recurringAmountCol: {
    alignItems: 'flex-end',
  },
  recurringAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  recurringFrequency: {
    fontSize: 11,
    marginTop: 2,
  },
  recurringMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexWrap: 'wrap',
  },
  recurringMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recurringMetaText: {
    fontSize: 11,
  },
  recurringActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  recurringActionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  recurringActionText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Receipt Card --
  receiptCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    padding: Spacing.md,
  },
  receiptCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  receiptNameCol: {
    flex: 1,
  },
  receiptDonor: {
    fontSize: 14,
    fontWeight: '600',
  },
  receiptId: {
    fontSize: 11,
    marginTop: 2,
  },
  receiptAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  receiptMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexWrap: 'wrap',
  },
  receiptMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  receiptMetaText: {
    fontSize: 11,
  },
  taxDeductibleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
  taxDeductibleText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // -- Statement Generation --
  statementDesc: {
    fontSize: 12,
    marginBottom: Spacing.md,
  },
  statementGenBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  statementGenBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },

  // -- Report Card --
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  reportIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportTextCol: {
    flex: 1,
  },
  reportName: {
    fontSize: 14,
    fontWeight: '600',
  },
  reportDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  generateBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  generateBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // -- Reconciliation Card --
  reconCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  reconStatusBar: {
    width: 4,
  },
  reconContent: {
    flex: 1,
    padding: Spacing.md,
  },
  reconHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reconRef: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  reconAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  reconMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  reconFund: {
    fontSize: 12,
  },
  reconDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  reconDateText: {
    fontSize: 11,
  },
  reconNotes: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 15,
  },

  // -- Control Card --
  controlCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  controlName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  controlDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  controlOwnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  controlOwner: {
    fontSize: 11,
  },

  // -- Bottom Sheet --
  sheetBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
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
  sheetBalanceValue: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sheetGoalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  sheetGoalLabel: {
    fontSize: 12,
  },
  sheetGoalPct: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sheetPurposeText: {
    fontSize: 13,
    lineHeight: 19,
  },
  sheetDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.sm,
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

  // -- Campaign Update Card (sheet) --
  updateCard: {
    paddingVertical: Spacing.sm,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  updateTitle: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  updateDate: {
    fontSize: 11,
  },
  updateContent: {
    fontSize: 12,
    lineHeight: 17,
  },
  updateAuthor: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
