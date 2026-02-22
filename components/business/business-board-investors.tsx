/**
 * BusinessBoardInvestors — Board & Investors tab for Business Mode.
 * 6 sub-tabs: Board, Investors, Updates, Dataroom, Resolutions, Distributions.
 * RBAC-gated via BusinessRoleLens: B1 (full), B2b (4 tabs), B2a (2 tabs), B3 (locked).
 */

import React, { useState, useCallback } from 'react';
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
import { isFounder, isBoardLevel, isInvestor } from '@/utils/business-rbac';
import type { BusinessRoleLens } from '@/utils/business-rbac';
import { DEFAULT_ENTITY } from '@/data/mock-business-v3';
import {
  BOARD_SEATS,
  INVESTOR_RECORDS,
  INVESTOR_UPDATES,
  DATAROOM_DOCS,
  RESOLUTIONS,
  DISTRIBUTIONS,
  getVisibleBoardSubTabs,
  getVisibleDataroomDocs,
  getVisibleUpdates,
  formatBoardSeatDate,
  formatInvestorType,
  formatResolutionType,
  formatDistributionType,
  formatDate,
} from '@/data/mock-biz-board-investors';
import type {
  BoardSubTab,
  BoardSeat,
  InvestorRecord,
  InvestorUpdate,
  DataroomDoc,
  Resolution,
  Distribution,
} from '@/data/mock-biz-board-investors';

// =============================================================================
// CONSTANTS
// =============================================================================

const BP = BusinessPalette;

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  role?: BusinessRoleLens;
}

// =============================================================================
// BOARD CONTENT
// =============================================================================

function BoardContent({ colors, role }: { colors: typeof Colors.light; role: BusinessRoleLens }) {
  return (
    <View>
      {/* Visual seat map card */}
      <BizCard>
        <BizCardTitle text="BOARD SEATS" />
        <ThemedText style={[s.sectionSubtitle, { color: BP.ash }]}>
          {BOARD_SEATS.length} seats {'\u00B7'}{' '}
          {BOARD_SEATS.filter((bs) => bs.votingRights).length} voting
        </ThemedText>

        <View style={s.seatMapGrid}>
          {BOARD_SEATS.map((seat) => (
            <View key={seat.id} style={[s.seatMapItem, { borderColor: BP.graphite }]}>
              {/* Avatar placeholder + name */}
              <View style={s.seatMapLeft}>
                <View style={[s.seatMapAvatar, { backgroundColor: statusColor(seat.status) + '20' }]}>
                  <ThemedText style={[s.seatMapInitial, { color: statusColor(seat.status) }]}>
                    {seat.holder.charAt(0)}
                  </ThemedText>
                </View>
                <View style={s.seatMapInfo}>
                  <ThemedText style={[s.seatMapName, { color: BP.smoke }]} numberOfLines={1}>
                    {seat.holder}
                  </ThemedText>
                  <ThemedText style={[s.seatMapRole, { color: BP.ash }]}>
                    {seat.title}
                  </ThemedText>
                </View>
              </View>
              {/* Seat type badge: Voting / Observer */}
              <View
                style={[
                  s.seatTypeBadge,
                  {
                    backgroundColor: seat.votingRights ? BP.emerald + '15' : BP.amber + '15',
                  },
                ]}
              >
                <ThemedText
                  style={[
                    s.seatTypeBadgeText,
                    { color: seat.votingRights ? BP.emerald : BP.amber },
                  ]}
                >
                  {seat.votingRights ? 'Voting' : 'Observer'}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Board Room link row */}
        <Pressable
          style={({ pressed }) => [s.roomLinkRow, { borderColor: BP.graphite, opacity: pressed ? 0.7 : 1 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={s.roomLinkLeft}>
            <IconSymbol name="person.3.fill" size={14} color={BP.champagneGold} />
            <ThemedText style={[s.roomLinkText, { color: BP.champagneGold }]}>
              Board Room
            </ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={12} color={BP.ash} />
        </Pressable>
      </BizCard>

      {/* Detailed board composition */}
      <BizCard>
        <BizCardTitle text="BOARD COMPOSITION" />

        {BOARD_SEATS.map((seat, idx) => (
          <View
            key={seat.id}
            style={[
              s.seatCard,
              { borderColor: BP.graphite },
              idx < BOARD_SEATS.length - 1 && s.seatCardSpaced,
            ]}
          >
            {/* Header row: holder name + status dot */}
            <View style={s.seatHeader}>
              <View style={s.seatHeaderLeft}>
                {/* Status dot */}
                <View
                  style={[
                    s.statusDot,
                    { backgroundColor: statusColor(seat.status) },
                  ]}
                />
                <ThemedText style={[s.seatHolder, { color: BP.smoke }]}>
                  {seat.holder}
                </ThemedText>
              </View>
              <BizStatusChip
                label={seat.status.toUpperCase()}
                variant={statusVariant(seat.status)}
              />
            </View>

            {/* Title */}
            <ThemedText style={[s.seatTitle, { color: BP.champagneGold }]}>
              {seat.title}
            </ThemedText>

            {/* Description */}
            <ThemedText style={[s.seatDescription, { color: BP.ash }]} numberOfLines={3}>
              {seat.description}
            </ThemedText>

            {/* Footer row: appointed date + voting rights badge */}
            <View style={s.seatFooter}>
              {seat.appointedDate && (
                <ThemedText style={[s.seatMeta, { color: BP.platinum }]}>
                  Appointed {formatBoardSeatDate(seat.appointedDate)}
                </ThemedText>
              )}
              <View
                style={[
                  s.votingBadge,
                  {
                    backgroundColor: seat.votingRights
                      ? BP.emerald + '15'
                      : BP.glass,
                  },
                ]}
              >
                <IconSymbol
                  name={seat.votingRights ? 'checkmark.circle.fill' : 'minus.circle' as any}
                  size={10}
                  color={seat.votingRights ? BP.emerald : BP.ash}
                />
                <ThemedText
                  style={[
                    s.votingBadgeText,
                    { color: seat.votingRights ? BP.emerald : BP.ash },
                  ]}
                >
                  {seat.votingRights ? 'VOTING' : 'NON-VOTING'}
                </ThemedText>
              </View>
            </View>
          </View>
        ))}
      </BizCard>

      {/* Board governance summary (founder only) */}
      {isFounder(role) && (
        <BizCard>
          <BizCardTitle text="GOVERNANCE NOTES" />
          <ThemedText style={[s.governanceText, { color: BP.ash }]}>
            Valuetainment Inc. operates with a single-class common stock structure. The
            founder holds majority voting control. Advisory and observer seats do
            not carry voting rights unless explicitly converted by board vote.
            All board resolutions require simple majority of voting seats.
          </ThemedText>
        </BizCard>
      )}
    </View>
  );
}

// =============================================================================
// INVESTORS CONTENT
// =============================================================================

// Inline mock: investor access tiers
const INVESTOR_ACCESS_TIERS: Record<string, 'Full Access' | 'Board Pack Only' | 'Updates Only'> = {
  'inv-1': 'Full Access',
  'inv-2': 'Full Access',
  'inv-3': 'Board Pack Only',
  'inv-4': 'Updates Only',
  'inv-5': 'Updates Only',
};

function accessTierColor(tier: string): string {
  switch (tier) {
    case 'Full Access':
      return BP.emerald;
    case 'Board Pack Only':
      return BP.champagneGold;
    case 'Updates Only':
      return BP.amber;
    default:
      return BP.ash;
  }
}

function InvestorsContent({ colors, role }: { colors: typeof Colors.light; role: BusinessRoleLens }) {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="INVESTOR TABLE" />
        <ThemedText style={[s.sectionSubtitle, { color: BP.ash }]}>
          {INVESTOR_RECORDS.length} investors {'\u00B7'}{' '}
          {INVESTOR_RECORDS.filter((i) => i.status === 'active').length} active
        </ThemedText>

        {INVESTOR_RECORDS.map((investor, idx) => {
          const tier = INVESTOR_ACCESS_TIERS[investor.id] ?? 'Updates Only';
          return (
            <Pressable
              key={investor.id}
              style={({ pressed }) => [
                s.investorRow,
                { borderColor: BP.graphite, opacity: pressed ? 0.8 : 1 },
                idx < INVESTOR_RECORDS.length - 1 && s.investorRowSpaced,
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              {/* Top row: name + status chip */}
              <View style={s.investorHeader}>
                <ThemedText style={[s.investorName, { color: BP.smoke }]}>
                  {investor.name}
                </ThemedText>
                <BizStatusChip
                  label={investor.status.toUpperCase()}
                  variant={statusVariant(investor.status)}
                />
              </View>

              {/* Type badge + access tier badge */}
              <View style={s.investorTypeBadgeRow}>
                <View style={[s.typePill, { backgroundColor: BP.glass, borderColor: BP.graphite }]}>
                  <ThemedText style={[s.typePillText, { color: BP.platinum }]}>
                    {formatInvestorType(investor.type)}
                  </ThemedText>
                </View>
                <View style={[s.typePill, { backgroundColor: BP.glass, borderColor: BP.graphite }]}>
                  <ThemedText style={[s.typePillText, { color: BP.platinum }]}>
                    {investor.instrument}
                  </ThemedText>
                </View>
                {/* Access tier badge */}
                <View
                  style={[
                    s.accessTierBadge,
                    { backgroundColor: accessTierColor(tier) + '15' },
                  ]}
                >
                  <ThemedText style={[s.accessTierBadgeText, { color: accessTierColor(tier) }]}>
                    {tier.toUpperCase()}
                  </ThemedText>
                </View>
              </View>

              {/* Metrics row: invested, equity, last contact */}
              <View style={s.investorMetricsRow}>
                <View style={s.investorMetric}>
                  <ThemedText style={[s.investorMetricLabel, { color: BP.ash }]}>
                    Invested
                  </ThemedText>
                  <ThemedText style={[s.investorMetricValue, { color: BP.champagneGold }]}>
                    {investor.invested}
                  </ThemedText>
                </View>
                <View style={s.investorMetric}>
                  <ThemedText style={[s.investorMetricLabel, { color: BP.ash }]}>
                    Equity
                  </ThemedText>
                  <ThemedText style={[s.investorMetricValue, { color: BP.champagneGold }]}>
                    {investor.equity}
                  </ThemedText>
                </View>
                <View style={s.investorMetric}>
                  <ThemedText style={[s.investorMetricLabel, { color: BP.ash }]}>
                    Last Contact
                  </ThemedText>
                  <ThemedText style={[s.investorMetricValue, { color: BP.smoke }]}>
                    {formatDate(investor.lastContact)}
                  </ThemedText>
                </View>
              </View>
            </Pressable>
          );
        })}

        {/* Investor Room link row */}
        <Pressable
          style={({ pressed }) => [s.roomLinkRow, { borderColor: BP.graphite, opacity: pressed ? 0.7 : 1 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={s.roomLinkLeft}>
            <IconSymbol name="banknote.fill" size={14} color={BP.champagneGold} />
            <ThemedText style={[s.roomLinkText, { color: BP.champagneGold }]}>
              Investor Room
            </ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={12} color={BP.ash} />
        </Pressable>
      </BizCard>

      {/* Totals summary */}
      {isFounder(role) && (
        <BizCard>
          <BizCardTitle text="CAP TABLE SUMMARY" />
          <View style={s.capTableRow}>
            <View style={s.capTableMetric}>
              <ThemedText style={[s.capTableLabel, { color: BP.ash }]}>
                Total Raised
              </ThemedText>
              <ThemedText style={[s.capTableValue, { color: BP.champagneGold }]}>
                $925,000
              </ThemedText>
            </View>
            <View style={s.capTableMetric}>
              <ThemedText style={[s.capTableLabel, { color: BP.ash }]}>
                Total Dilution
              </ThemedText>
              <ThemedText style={[s.capTableValue, { color: BP.champagneGold }]}>
                15.7%
              </ThemedText>
            </View>
            <View style={s.capTableMetric}>
              <ThemedText style={[s.capTableLabel, { color: BP.ash }]}>
                Founder Ownership
              </ThemedText>
              <ThemedText style={[s.capTableValue, { color: BP.emerald }]}>
                84.3%
              </ThemedText>
            </View>
          </View>
        </BizCard>
      )}
    </View>
  );
}

// =============================================================================
// UPDATES CONTENT
// =============================================================================

// Inline mock: KPI snapshots per update
const UPDATE_KPIS: Record<string, { label: string; value: string }[]> = {
  'iu-1': [
    { label: 'MRR', value: '$21.3K' },
    { label: 'Runway', value: '7.2mo' },
    { label: 'Pipeline', value: '$1.5M' },
    { label: 'Team', value: '4' },
  ],
  'iu-2': [
    { label: 'MRR', value: '$22.1K' },
    { label: 'Runway', value: '6.8mo' },
    { label: 'Pipeline', value: '$2.1M' },
    { label: 'Team', value: '4' },
  ],
  'iu-3': [
    { label: 'MRR', value: '$24.0K' },
    { label: 'Runway', value: '6.5mo' },
    { label: 'Pipeline', value: '$2.8M' },
    { label: 'Team', value: '5' },
  ],
  'iu-4': [
    { label: 'MRR', value: '$22.1K' },
    { label: 'Runway', value: '6.8mo' },
    { label: 'Pipeline', value: '$2.1M' },
    { label: 'Team', value: '4' },
  ],
};

function UpdatesContent({ colors, role }: { colors: typeof Colors.light; role: BusinessRoleLens }) {
  const visibleUpdates = getVisibleUpdates(role);

  if (visibleUpdates.length === 0) {
    return (
      <BizEmptyLock
        title="No Updates Available"
        message="There are no investor updates for your access level."
      />
    );
  }

  return (
    <View>
      <BizCard>
        <BizCardTitle text="INVESTOR UPDATES" />
        <ThemedText style={[s.sectionSubtitle, { color: BP.ash }]}>
          {visibleUpdates.length} update{visibleUpdates.length !== 1 ? 's' : ''} {'\u00B7'}{' '}
          {visibleUpdates.filter((u) => u.status === 'sent').length} sent
        </ThemedText>

        {/* Cadence indicator */}
        <ThemedText style={[s.cadenceText, { color: BP.platinum }]}>
          Monthly to all investors
        </ThemedText>

        {visibleUpdates.map((update, idx) => {
          const kpis = UPDATE_KPIS[update.id] ?? [];
          return (
            <Pressable
              key={update.id}
              style={({ pressed }) => [
                s.updateCard,
                { borderColor: BP.graphite, opacity: pressed ? 0.8 : 1 },
                idx < visibleUpdates.length - 1 && s.updateCardSpaced,
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              {/* Header: title + status chip */}
              <View style={s.updateHeader}>
                <ThemedText style={[s.updateTitle, { color: BP.smoke }]} numberOfLines={1}>
                  {update.title}
                </ThemedText>
                <BizStatusChip
                  label={update.status.toUpperCase()}
                  variant={statusVariant(update.status)}
                />
              </View>

              {/* Date + recipients */}
              <View style={s.updateMetaRow}>
                <ThemedText style={[s.updateDate, { color: BP.platinum }]}>
                  {formatDate(update.date)}
                </ThemedText>
                <View style={s.metaDivider} />
                <ThemedText style={[s.updateRecipients, { color: BP.ash }]}>
                  {update.recipients}
                </ThemedText>
              </View>

              {/* KPI snapshot chip row */}
              {kpis.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={s.kpiChipScroll}
                  contentContainerStyle={s.kpiChipRow}
                >
                  {kpis.map((kpi) => (
                    <View key={kpi.label} style={[s.kpiChip, { backgroundColor: BP.glass, borderColor: BP.graphite }]}>
                      <ThemedText style={[s.kpiChipLabel, { color: BP.ash }]}>
                        {kpi.label}:
                      </ThemedText>
                      <ThemedText style={[s.kpiChipValue, { color: BP.champagneGold }]}>
                        {kpi.value}
                      </ThemedText>
                    </View>
                  ))}
                </ScrollView>
              )}

              {/* Summary preview */}
              <ThemedText style={[s.updateSummary, { color: BP.ash }]} numberOfLines={3}>
                {update.summary}
              </ThemedText>

              {/* Tier badge */}
              <View style={s.updateFooter}>
                <View style={[s.tierBadge, { backgroundColor: tierBadgeColor(update.tier) + '15' }]}>
                  <ThemedText style={[s.tierBadgeText, { color: tierBadgeColor(update.tier) }]}>
                    {update.tier === 'all' ? 'ALL INVESTORS' : update.tier === 'board' ? 'BOARD' : 'STRATEGIC'}
                  </ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={12} color={BP.ash} />
              </View>
            </Pressable>
          );
        })}
      </BizCard>

      {/* Draft New Update CTA (founder only) */}
      {isFounder(role) && (
        <Pressable
          style={({ pressed }) => [
            s.ctaButton,
            { borderColor: BP.graphite, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <IconSymbol name="plus.circle.fill" size={16} color={BP.champagneGold} />
          <ThemedText style={[s.ctaButtonText, { color: BP.champagneGold }]}>
            Draft New Update
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

// =============================================================================
// DATAROOM CONTENT
// =============================================================================

// Canonical dataroom categories for section grouping
const DATAROOM_CATEGORIES = ['Overview', 'Legal', 'Finance', 'Product', 'Contracts', 'Compliance', 'Other'] as const;

function mapDocCategory(cat: string): string {
  // Map existing categories to canonical groups
  switch (cat) {
    case 'Pitch':
    case 'Brand':
      return 'Overview';
    case 'Legal':
    case 'Governance':
      return 'Legal';
    case 'Financials':
      return 'Finance';
    case 'Product':
      return 'Product';
    case 'Contracts':
      return 'Contracts';
    case 'Compliance':
      return 'Compliance';
    default:
      return 'Other';
  }
}

function DataroomContent({ colors, role }: { colors: typeof Colors.light; role: BusinessRoleLens }) {
  const visibleDocs = getVisibleDataroomDocs(role);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCategory = useCallback((cat: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }, []);

  if (visibleDocs.length === 0) {
    return (
      <BizEmptyLock
        title="Dataroom Restricted"
        message="You do not have access to dataroom documents at this role level."
      />
    );
  }

  // Group docs by canonical category
  const grouped: Record<string, DataroomDoc[]> = {};
  for (const doc of visibleDocs) {
    const group = mapDocCategory(doc.category);
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(doc);
  }

  return (
    <View>
      <BizCard>
        <BizCardTitle text="DATA ROOM" />
        <ThemedText style={[s.sectionSubtitle, { color: BP.ash }]}>
          {visibleDocs.length} document{visibleDocs.length !== 1 ? 's' : ''} available
        </ThemedText>

        {DATAROOM_CATEGORIES.map((cat) => {
          const docs = grouped[cat];
          if (!docs || docs.length === 0) return null;
          const isCollapsed = !!collapsed[cat];

          return (
            <View key={cat} style={s.dataroomSection}>
              {/* Collapsible category header */}
              <Pressable
                style={({ pressed }) => [
                  s.dataroomSectionHeader,
                  { borderColor: BP.graphite, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => toggleCategory(cat)}
              >
                <View style={s.dataroomSectionLeft}>
                  <IconSymbol
                    name={isCollapsed ? 'chevron.right' : 'chevron.down' as any}
                    size={10}
                    color={BP.platinum}
                  />
                  <ThemedText style={[s.dataroomSectionTitle, { color: BP.smoke }]}>
                    {cat}
                  </ThemedText>
                  <View style={[s.dataroomCountBadge, { backgroundColor: BP.glass }]}>
                    <ThemedText style={[s.dataroomCountText, { color: BP.ash }]}>
                      {docs.length}
                    </ThemedText>
                  </View>
                </View>
              </Pressable>

              {/* Documents in this category */}
              {!isCollapsed && docs.map((doc, idx) => (
                <Pressable
                  key={doc.id}
                  style={({ pressed }) => [
                    s.docRow,
                    { borderColor: BP.graphite, opacity: pressed ? 0.8 : 1 },
                    idx < docs.length - 1 && s.docRowSpaced,
                  ]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  {/* Icon + title */}
                  <View style={s.docHeader}>
                    <View style={[s.docIconWrap, { backgroundColor: BP.glass }]}>
                      <IconSymbol name="doc.text.fill" size={14} color={BP.platinum} />
                    </View>
                    <View style={s.docTitleBlock}>
                      <ThemedText style={[s.docTitle, { color: BP.smoke }]} numberOfLines={1}>
                        {doc.title}
                      </ThemedText>
                      <ThemedText style={[s.docUpdated, { color: BP.ash }]}>
                        Updated {formatDate(doc.updatedAt)}
                      </ThemedText>
                    </View>
                    <IconSymbol name="chevron.right" size={12} color={BP.ash} />
                  </View>

                  {/* Badges row: category, version, access level, watermark */}
                  <View style={s.docBadgeRow}>
                    {/* Category pill */}
                    <View style={[s.categoryPill, { backgroundColor: BP.glass, borderColor: BP.graphite }]}>
                      <ThemedText style={[s.categoryPillText, { color: BP.platinum }]}>
                        {doc.category}
                      </ThemedText>
                    </View>

                    {/* Version badge */}
                    <View style={[s.versionBadge, { backgroundColor: BP.glass }]}>
                      <ThemedText style={[s.versionBadgeText, { color: BP.ash }]}>
                        v{doc.version}
                      </ThemedText>
                    </View>

                    {/* Access level indicator */}
                    <View
                      style={[
                        s.accessBadge,
                        { backgroundColor: accessLevelColor(doc.accessLevel) + '15' },
                      ]}
                    >
                      <IconSymbol
                        name={accessLevelIcon(doc.accessLevel) as any}
                        size={9}
                        color={accessLevelColor(doc.accessLevel)}
                      />
                      <ThemedText
                        style={[s.accessBadgeText, { color: accessLevelColor(doc.accessLevel) }]}
                      >
                        {doc.accessLevel.toUpperCase()}
                      </ThemedText>
                    </View>

                    {/* Watermark badge */}
                    {doc.watermarked && (
                      <View style={[s.watermarkBadge, { backgroundColor: BP.amber + '15' }]}>
                        <IconSymbol name="eye.fill" size={9} color={BP.amber} />
                        <ThemedText style={[s.watermarkBadgeText, { color: BP.amber }]}>
                          WM
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          );
        })}
      </BizCard>

      {/* Upload CTA (founder only) */}
      {isFounder(role) && (
        <Pressable
          style={({ pressed }) => [
            s.ctaButton,
            { borderColor: BP.graphite, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="arrow.up.doc.fill" size={16} color={BP.champagneGold} />
          <ThemedText style={[s.ctaButtonText, { color: BP.champagneGold }]}>
            Upload Document
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

// =============================================================================
// RESOLUTIONS CONTENT
// =============================================================================

// Full lifecycle states for resolutions
type ResolutionLifecycleState = 'Draft' | 'Sent' | 'Voting' | 'Approved' | 'Rejected' | 'Archived';

function lifecycleFromOutcome(outcome: string): ResolutionLifecycleState {
  switch (outcome) {
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'deferred':
      return 'Archived';
    case 'pending':
      return 'Voting';
    default:
      return 'Draft';
  }
}

function lifecycleColor(state: ResolutionLifecycleState): string {
  switch (state) {
    case 'Draft':
      return BP.ash;
    case 'Sent':
      return BP.platinum;
    case 'Voting':
      return BP.amber;
    case 'Approved':
      return BP.emerald;
    case 'Rejected':
      return BP.red;
    case 'Archived':
      return BP.platinum;
    default:
      return BP.ash;
  }
}

// Inline mock: per-member vote status per resolution
type VoteStatus = 'Pending' | 'For' | 'Against' | 'Abstain';

interface MemberVote {
  name: string;
  vote: VoteStatus;
}

const RESOLUTION_VOTES: Record<string, { members: MemberVote[]; quorumNeeded: number }> = {
  'res-1': {
    members: [
      { name: 'Alex Morgan', vote: 'For' },
      { name: 'Patrick Bet-David', vote: 'For' },
      { name: 'Tom Ellsworth', vote: 'For' },
    ],
    quorumNeeded: 2,
  },
  'res-2': {
    members: [
      { name: 'Alex Morgan', vote: 'For' },
      { name: 'Patrick Bet-David', vote: 'Pending' },
      { name: 'Tom Ellsworth', vote: 'Abstain' },
    ],
    quorumNeeded: 2,
  },
  'res-3': {
    members: [
      { name: 'Alex Morgan', vote: 'For' },
      { name: 'Patrick Bet-David', vote: 'For' },
      { name: 'Tom Ellsworth', vote: 'For' },
    ],
    quorumNeeded: 2,
  },
  'res-4': {
    members: [
      { name: 'Alex Morgan', vote: 'Pending' },
      { name: 'Patrick Bet-David', vote: 'Pending' },
      { name: 'Tom Ellsworth', vote: 'Pending' },
    ],
    quorumNeeded: 2,
  },
  'res-5': {
    members: [
      { name: 'Alex Morgan', vote: 'For' },
      { name: 'Tom Ellsworth', vote: 'For' },
    ],
    quorumNeeded: 1,
  },
};

function voteStatusColor(vote: VoteStatus): string {
  switch (vote) {
    case 'For':
      return BP.emerald;
    case 'Against':
      return BP.red;
    case 'Abstain':
      return BP.platinum;
    case 'Pending':
    default:
      return BP.amber;
  }
}

function ResolutionsContent({ colors, role }: { colors: typeof Colors.light; role: BusinessRoleLens }) {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="BOARD RESOLUTIONS" />
        <ThemedText style={[s.sectionSubtitle, { color: BP.ash }]}>
          {RESOLUTIONS.length} resolution{RESOLUTIONS.length !== 1 ? 's' : ''} {'\u00B7'}{' '}
          {RESOLUTIONS.filter((r) => r.outcome === 'pending').length} pending
        </ThemedText>

        {RESOLUTIONS.map((resolution, idx) => {
          const lifecycle = lifecycleFromOutcome(resolution.outcome);
          const voteData = RESOLUTION_VOTES[resolution.id];
          const castCount = voteData
            ? voteData.members.filter((m) => m.vote !== 'Pending').length
            : 0;
          const totalMembers = voteData ? voteData.members.length : 0;
          const quorumNeeded = voteData ? voteData.quorumNeeded : 0;
          const hasPendingVotes = voteData
            ? voteData.members.some((m) => m.vote === 'Pending')
            : false;

          return (
            <Pressable
              key={resolution.id}
              style={({ pressed }) => [
                s.resolutionCard,
                { borderColor: BP.graphite, opacity: pressed ? 0.8 : 1 },
                idx < RESOLUTIONS.length - 1 && s.resolutionCardSpaced,
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              {/* Header: title + lifecycle state badge */}
              <View style={s.resolutionHeader}>
                <ThemedText style={[s.resolutionTitle, { color: BP.smoke }]} numberOfLines={2}>
                  {resolution.title}
                </ThemedText>
                <View style={[s.lifecycleBadge, { backgroundColor: lifecycleColor(lifecycle) + '15' }]}>
                  <ThemedText style={[s.lifecycleBadgeText, { color: lifecycleColor(lifecycle) }]}>
                    {lifecycle.toUpperCase()}
                  </ThemedText>
                </View>
              </View>

              {/* Meta row: date, type badge, proposer */}
              <View style={s.resolutionMetaRow}>
                <ThemedText style={[s.resolutionDate, { color: BP.platinum }]}>
                  {formatDate(resolution.date)}
                </ThemedText>
                <View style={s.metaDivider} />
                <View style={[s.resTypeBadge, { backgroundColor: resolutionTypeColor(resolution.type) + '15' }]}>
                  <ThemedText style={[s.resTypeBadgeText, { color: resolutionTypeColor(resolution.type) }]}>
                    {formatResolutionType(resolution.type)}
                  </ThemedText>
                </View>
              </View>

              {/* Proposer */}
              <View style={s.proposerRow}>
                <IconSymbol name="person.fill" size={10} color={BP.ash} />
                <ThemedText style={[s.proposerText, { color: BP.ash }]}>
                  {resolution.proposer}
                </ThemedText>
              </View>

              {/* Summary */}
              <ThemedText style={[s.resolutionSummary, { color: BP.ash }]} numberOfLines={3}>
                {resolution.summary}
              </ThemedText>

              {/* Per-member vote status rows */}
              {voteData && (
                <View style={s.voteSection}>
                  <ThemedText style={[s.voteSectionTitle, { color: BP.platinum }]}>
                    VOTES
                  </ThemedText>
                  {voteData.members.map((member) => (
                    <View key={member.name} style={s.voteRow}>
                      <ThemedText style={[s.voteRowName, { color: BP.smoke }]} numberOfLines={1}>
                        {member.name}
                      </ThemedText>
                      <View style={[s.voteStatusBadge, { backgroundColor: voteStatusColor(member.vote) + '15' }]}>
                        <ThemedText style={[s.voteStatusText, { color: voteStatusColor(member.vote) }]}>
                          {member.vote.toUpperCase()}
                        </ThemedText>
                      </View>
                    </View>
                  ))}

                  {/* Quorum progress bar */}
                  <View style={s.quorumBlock}>
                    <View style={s.quorumLabelRow}>
                      <ThemedText style={[s.quorumLabel, { color: BP.ash }]}>
                        {castCount}/{totalMembers} votes cast, need {quorumNeeded} for quorum
                      </ThemedText>
                    </View>
                    <View style={[s.quorumBarBg, { backgroundColor: BP.glass }]}>
                      <View
                        style={[
                          s.quorumBarFill,
                          {
                            backgroundColor: castCount >= quorumNeeded ? BP.emerald : BP.amber,
                            width: `${totalMembers > 0 ? (castCount / totalMembers) * 100 : 0}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Cast Vote CTA for pending votes */}
                  {hasPendingVotes && isBoardLevel(role) && (
                    <Pressable
                      style={({ pressed }) => [
                        s.castVoteBtn,
                        { borderColor: BP.champagneGold + '40', opacity: pressed ? 0.7 : 1 },
                      ]}
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                    >
                      <IconSymbol name="checkmark.circle.fill" size={14} color={BP.champagneGold} />
                      <ThemedText style={[s.castVoteBtnText, { color: BP.champagneGold }]}>
                        Cast Vote
                      </ThemedText>
                    </Pressable>
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </BizCard>

      {/* Create resolution CTA (founder only) */}
      {isFounder(role) && (
        <Pressable
          style={({ pressed }) => [
            s.ctaButton,
            { borderColor: BP.graphite, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="plus.circle.fill" size={16} color={BP.champagneGold} />
          <ThemedText style={[s.ctaButtonText, { color: BP.champagneGold }]}>
            Create Resolution
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

// =============================================================================
// DISTRIBUTIONS CONTENT
// =============================================================================

// Inline mock: which distributions have receipts available
const DISTRIBUTION_RECEIPTS: Record<string, boolean> = {
  'dist-1': true,
  'dist-2': true,
  'dist-3': false,
  'dist-4': false,
};

function DistributionsContent({ colors, role }: { colors: typeof Colors.light; role: BusinessRoleLens }) {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="DISTRIBUTIONS" />
        <ThemedText style={[s.sectionSubtitle, { color: BP.ash }]}>
          {DISTRIBUTIONS.length} distribution{DISTRIBUTIONS.length !== 1 ? 's' : ''} {'\u00B7'}{' '}
          {DISTRIBUTIONS.filter((d) => d.status === 'paid').length} paid
        </ThemedText>

        {DISTRIBUTIONS.map((dist, idx) => {
          const hasReceipt = !!DISTRIBUTION_RECEIPTS[dist.id];
          return (
            <Pressable
              key={dist.id}
              style={({ pressed }) => [
                s.distributionCard,
                { borderColor: BP.graphite, opacity: pressed ? 0.8 : 1 },
                idx < DISTRIBUTIONS.length - 1 && s.distributionCardSpaced,
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              {/* Header: title + status chip */}
              <View style={s.distributionHeader}>
                <ThemedText style={[s.distributionTitle, { color: BP.smoke }]} numberOfLines={1}>
                  {dist.title}
                </ThemedText>
                <BizStatusChip
                  label={dist.status === 'pending_approval' ? 'PENDING' : dist.status.toUpperCase()}
                  variant={distStatusVariant(dist.status)}
                />
              </View>

              {/* Amount + date row */}
              <View style={s.distributionAmountRow}>
                <ThemedText style={[s.distributionAmount, { color: BP.champagneGold }]}>
                  {dist.amount}
                </ThemedText>
                <View style={s.metaDivider} />
                <ThemedText style={[s.distributionDate, { color: BP.platinum }]}>
                  {formatDate(dist.date)}
                </ThemedText>
              </View>

              {/* Type badge + recipients */}
              <View style={s.distributionFooter}>
                <View style={[s.distTypeBadge, { backgroundColor: BP.glass, borderColor: BP.graphite }]}>
                  <ThemedText style={[s.distTypeBadgeText, { color: BP.platinum }]}>
                    {formatDistributionType(dist.type)}
                  </ThemedText>
                </View>
                <View style={s.recipientsRow}>
                  <IconSymbol name="person.2.fill" size={10} color={BP.ash} />
                  <ThemedText style={[s.recipientsText, { color: BP.ash }]}>
                    {dist.recipients}
                  </ThemedText>
                </View>
              </View>

              {/* Receipt link (read-only) */}
              {hasReceipt && (
                <View style={s.receiptRow}>
                  <IconSymbol name="doc.text.fill" size={12} color={BP.emerald} />
                  <ThemedText style={[s.receiptText, { color: BP.emerald }]}>
                    View Receipt
                  </ThemedText>
                </View>
              )}
            </Pressable>
          );
        })}
      </BizCard>

      {/* Totals card (founder only) */}
      {isFounder(role) && (
        <BizCard>
          <BizCardTitle text="DISTRIBUTION SUMMARY" />
          <View style={s.distSummaryRow}>
            <View style={s.distSummaryMetric}>
              <ThemedText style={[s.distSummaryLabel, { color: BP.ash }]}>
                Total Paid
              </ThemedText>
              <ThemedText style={[s.distSummaryValue, { color: BP.emerald }]}>
                $16,700
              </ThemedText>
            </View>
            <View style={s.distSummaryMetric}>
              <ThemedText style={[s.distSummaryLabel, { color: BP.ash }]}>
                Scheduled
              </ThemedText>
              <ThemedText style={[s.distSummaryValue, { color: BP.amber }]}>
                $15,000
              </ThemedText>
            </View>
            <View style={s.distSummaryMetric}>
              <ThemedText style={[s.distSummaryLabel, { color: BP.ash }]}>
                Pending Approval
              </ThemedText>
              <ThemedText style={[s.distSummaryValue, { color: BP.red }]}>
                $25,000
              </ThemedText>
            </View>
          </View>
        </BizCard>
      )}
    </View>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function tierBadgeColor(tier: 'all' | 'board' | 'strategic'): string {
  switch (tier) {
    case 'all':
      return BP.emerald;
    case 'board':
      return BP.champagneGold;
    case 'strategic':
      return BP.amber;
    default:
      return BP.ash;
  }
}

function accessLevelColor(level: string): string {
  switch (level) {
    case 'public':
      return BP.emerald;
    case 'retail':
      return BP.amber;
    case 'board':
      return BP.champagneGold;
    case 'founder':
      return BP.red;
    default:
      return BP.ash;
  }
}

function accessLevelIcon(level: string): string {
  switch (level) {
    case 'public':
      return 'globe';
    case 'retail':
      return 'person.fill';
    case 'board':
      return 'person.3.fill';
    case 'founder':
      return 'lock.fill';
    default:
      return 'questionmark.circle';
  }
}

function resolutionTypeColor(type: string): string {
  switch (type) {
    case 'board_vote':
      return BP.champagneGold;
    case 'written_consent':
      return BP.emerald;
    case 'advisory':
      return BP.platinum;
    default:
      return BP.ash;
  }
}

function distStatusVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  switch (status) {
    case 'paid':
      return 'success';
    case 'scheduled':
      return 'warning';
    case 'pending_approval':
      return 'error';
    default:
      return 'neutral';
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BusinessBoardInvestors({ colors, role = 'B1' }: Props) {
  const visibleTabs = getVisibleBoardSubTabs(role);
  const [activeTab, setActiveTab] = useState<BoardSubTab>(
    visibleTabs.length > 0 ? visibleTabs[0].id : 'board'
  );

  // B3+ (locked)
  if (visibleTabs.length === 0) {
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
          title="Board & Investors"
          message="This section is restricted. You need board-level or investor access to view board composition, investor data, and governance documents."
        />
        <View style={s.bottomSpacer} />
      </ScrollView>
    );
  }

  // Ensure active tab is valid for the current role
  const isActiveTabValid = visibleTabs.some((t) => t.id === activeTab);
  const effectiveTab = isActiveTabValid ? activeTab : visibleTabs[0].id;

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
        tabs={visibleTabs}
        activeId={effectiveTab}
        onSelect={(id) => setActiveTab(id as BoardSubTab)}
      />

      {/* Content area */}
      {effectiveTab === 'board' && <BoardContent colors={colors} role={role} />}
      {effectiveTab === 'investors' && <InvestorsContent colors={colors} role={role} />}
      {effectiveTab === 'updates' && <UpdatesContent colors={colors} role={role} />}
      {effectiveTab === 'dataroom' && <DataroomContent colors={colors} role={role} />}
      {effectiveTab === 'resolutions' && <ResolutionsContent colors={colors} role={role} />}
      {effectiveTab === 'distributions' && <DistributionsContent colors={colors} role={role} />}

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

  // Section subtitle
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: Spacing.md,
  },

  // ------------------------------------------------------------------
  // BOARD
  // ------------------------------------------------------------------
  seatCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    backgroundColor: BP.glass,
  },
  seatCardSpaced: {
    marginBottom: Spacing.sm,
  },
  seatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  seatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  seatHolder: {
    fontSize: 15,
    fontWeight: '600',
  },
  seatTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  seatDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  seatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seatMeta: {
    fontSize: 11,
  },
  votingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  votingBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  governanceText: {
    fontSize: 13,
    lineHeight: 19,
  },

  // Seat map grid
  seatMapGrid: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  seatMapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    backgroundColor: BP.glass,
  },
  seatMapLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    marginRight: Spacing.sm,
  },
  seatMapAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatMapInitial: {
    fontSize: 15,
    fontWeight: '700',
  },
  seatMapInfo: {
    flex: 1,
  },
  seatMapName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 1,
  },
  seatMapRole: {
    fontSize: 11,
  },
  seatTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  seatTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Room link row (shared by Board Room + Investor Room)
  roomLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    backgroundColor: BP.glass,
  },
  roomLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  roomLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // ------------------------------------------------------------------
  // INVESTORS
  // ------------------------------------------------------------------
  investorRow: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    backgroundColor: BP.glass,
  },
  investorRowSpaced: {
    marginBottom: Spacing.sm,
  },
  investorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  investorName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  investorTypeBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  typePillText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  investorMetricsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  investorMetric: {
    flex: 1,
  },
  investorMetricLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  investorMetricValue: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Access tier badge
  accessTierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  accessTierBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Cap table summary
  capTableRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  capTableMetric: {
    flex: 1,
  },
  capTableLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  capTableValue: {
    fontSize: 16,
    fontWeight: '700',
  },

  // ------------------------------------------------------------------
  // UPDATES
  // ------------------------------------------------------------------
  updateCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    backgroundColor: BP.glass,
  },
  updateCardSpaced: {
    marginBottom: Spacing.sm,
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  updateTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  updateMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  updateDate: {
    fontSize: 12,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: BP.ash,
  },
  updateRecipients: {
    fontSize: 12,
  },
  updateSummary: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  updateFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  tierBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Cadence indicator
  cadenceText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },

  // KPI chip row
  kpiChipScroll: {
    marginBottom: Spacing.sm,
  },
  kpiChipRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  kpiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  kpiChipLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  kpiChipValue: {
    fontSize: 10,
    fontWeight: '700',
  },

  // CTA button
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // ------------------------------------------------------------------
  // DATAROOM
  // ------------------------------------------------------------------
  docRow: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    backgroundColor: BP.glass,
  },
  docRowSpaced: {
    marginBottom: Spacing.sm,
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  docIconWrap: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitleBlock: {
    flex: 1,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  docUpdated: {
    fontSize: 11,
  },
  docBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  versionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  versionBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  accessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  accessBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  watermarkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  watermarkBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Dataroom section grouping
  dataroomSection: {
    marginBottom: Spacing.sm,
  },
  dataroomSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderBottomWidth: 1,
    marginBottom: Spacing.sm,
  },
  dataroomSectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dataroomSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  dataroomCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  dataroomCountText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // ------------------------------------------------------------------
  // RESOLUTIONS
  // ------------------------------------------------------------------
  resolutionCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    backgroundColor: BP.glass,
  },
  resolutionCardSpaced: {
    marginBottom: Spacing.sm,
  },
  resolutionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  resolutionTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
    lineHeight: 19,
  },
  resolutionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  resolutionDate: {
    fontSize: 12,
  },
  resTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  resTypeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  proposerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  proposerText: {
    fontSize: 12,
  },
  resolutionSummary: {
    fontSize: 13,
    lineHeight: 18,
  },

  // Lifecycle badge
  lifecycleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  lifecycleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Vote section
  voteSection: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#2F3336',
  },
  voteSectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  voteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  voteRowName: {
    fontSize: 13,
    flex: 1,
    marginRight: Spacing.sm,
  },
  voteStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  voteStatusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Quorum progress bar
  quorumBlock: {
    marginTop: Spacing.sm,
  },
  quorumLabelRow: {
    marginBottom: 4,
  },
  quorumLabel: {
    fontSize: 11,
  },
  quorumBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  quorumBarFill: {
    height: 6,
    borderRadius: 3,
  },

  // Cast vote button
  castVoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  castVoteBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ------------------------------------------------------------------
  // DISTRIBUTIONS
  // ------------------------------------------------------------------
  distributionCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    backgroundColor: BP.glass,
  },
  distributionCardSpaced: {
    marginBottom: Spacing.sm,
  },
  distributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  distributionTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  distributionAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  distributionAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  distributionDate: {
    fontSize: 12,
  },
  distributionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  distTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  distTypeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  recipientsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipientsText: {
    fontSize: 12,
  },

  // Receipt link
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#2F3336',
  },
  receiptText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Distribution summary
  distSummaryRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  distSummaryMetric: {
    flex: 1,
  },
  distSummaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  distSummaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
