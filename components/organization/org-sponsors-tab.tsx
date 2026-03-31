/**
 * Organization Sponsors Tab — 11-tab Sponsors Hub (Sports-only).
 * Dashboard, Sponsors, Packages, Inventory, Contracts, Fulfillment,
 * Assets, Invoicing, Reports, Audit, Settings.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TextInput,
  Pressable,
  Switch,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
;
import {
  SPONSORS_TABS,
  SPONSOR_STATUS_COLOR,
  CONTRACT_STATUS_COLOR,
  FULFILLMENT_STATUS_COLOR,
  INVOICE_STATUS_COLOR,
  INVENTORY_CATEGORY_LABEL,
  PACKAGE_TIER_LABEL,
  PACKAGE_TIER_COLOR,
  getSponsorsData,
} from '@/data/mock-sponsors-v2';
import type {
  SponsorsTabId,
  SponsorDashboardBlock,
  SponsorQuickAction,
  Sponsor,
  SponsorPackage,
  InventorySlot,
  InventoryCategory,
  SponsorContract,
  FulfillmentItem,
  FulfillmentStatus,
  SponsorAsset,
  SponsorInvoice,
  SponsorReport,
  SponsorAuditEntry,
  SponsorSettingToggle,
} from '@/data/mock-sponsors-v2';

// =============================================================================
// PROPS
// =============================================================================

interface OrgSponsorsTabProps {
  colors: typeof Colors.light;
  accentColor: string;
}

// =============================================================================
// REPORT FORMAT COLORS
// =============================================================================

const REPORT_FORMAT_COLOR: Record<SponsorReport['format'], string> = {
  PDF: '#1A1714',
  CSV: '#5A8A6E',
  XLSX: '#B8943E',
};

// =============================================================================
// ASSET TYPE LABELS
// =============================================================================

const ASSET_TYPE_LABEL: Record<SponsorAsset['assetType'], string> = {
  'logo-light': 'Logo (Light)',
  'logo-dark': 'Logo (Dark)',
  copy: 'Copy',
  website: 'Website',
  'hex-colors': 'Hex Colors',
  'placement-spec': 'Placement Spec',
  'do-not-use': 'Do Not Use',
};

// =============================================================================
// AUDIT ICON MAP
// =============================================================================

function auditIcon(action: string): string {
  switch (action) {
    case 'sponsor_created':
      return 'person.badge.plus';
    case 'contract_signed':
      return 'signature';
    case 'fulfillment_logged':
      return 'checkmark.circle.fill';
    case 'fulfillment_verified':
      return 'checkmark.seal.fill';
    case 'invoice_sent':
      return 'paperplane.fill';
    case 'invoice_overdue':
      return 'exclamationmark.triangle.fill';
    case 'asset_uploaded':
      return 'photo.badge.plus';
    default:
      return 'clock.fill';
  }
}

function auditColor(action: string): string {
  switch (action) {
    case 'sponsor_created':
      return '#5A8A6E';
    case 'contract_signed':
      return accent;
    case 'fulfillment_logged':
      return accent;
    case 'fulfillment_verified':
      return '#5A8A6E';
    case 'invoice_sent':
      return '#B8943E';
    case 'invoice_overdue':
      return '#B85C5C';
    case 'asset_uploaded':
      return accent;
    default:
      return '#9C9790';
  }
}

// =============================================================================
// DASHBOARD SECTION GROUPINGS
// =============================================================================

const DASHBOARD_SECTIONS: { title: string; ids: string[] }[] = [
  {
    title: 'Revenue Pulse',
    ids: ['db-ytd-revenue', 'db-outstanding-receivables', 'db-next-30-invoices'],
  },
  {
    title: 'Active Sponsors',
    ids: ['db-active-sponsors', 'db-top-tier'],
  },
  {
    title: 'Fulfillment Pulse',
    ids: ['db-deliverables-due-week', 'db-overdue-deliverables', 'db-season-fulfillment'],
  },
  {
    title: 'Inventory Utilization',
    ids: ['db-sold-slots', 'db-available-slots'],
  },
];

// =============================================================================
// STATUS DOT COLOR HELPER
// =============================================================================

const STATUS_DOT_COLOR: Record<string, string> = {
  good: '#5A8A6E',
  warning: '#B8943E',
  critical: '#B85C5C',
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function OrgSponsorsTab({ colors, accentColor }: OrgSponsorsTabProps) {
  // === State ===
  const [activeTab, setActiveTab] = useState<SponsorsTabId>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>('all');
  const [fulfillmentStatusFilter, setFulfillmentStatusFilter] = useState<string>('all');
  const [settingToggles, setSettingToggles] = useState<Record<string, boolean>>({});

  // === Data ===
  const data = getSponsorsData();

  // === Callbacks ===
  const handleTabPress = useCallback((tabId: SponsorsTabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  }, []);

  const handleInventoryCategoryPress = useCallback((cat: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInventoryCategoryFilter(cat);
  }, []);

  const handleFulfillmentStatusPress = useCallback((status: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFulfillmentStatusFilter(status);
  }, []);

  // ===================================================================
  // RENDER — TAB CONTENT
  // ===================================================================

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'sponsors':
        return renderSponsors();
      case 'packages':
        return renderPackages();
      case 'inventory':
        return renderInventory();
      case 'contracts':
        return renderContracts();
      case 'fulfillment':
        return renderFulfillment();
      case 'assets':
        return renderAssets();
      case 'invoicing':
        return renderInvoicing();
      case 'reports':
        return renderReports();
      case 'audit':
        return renderAudit();
      case 'settings':
        return renderSettings();
      default:
        return null;
    }
  };

  // === Tab 1: Dashboard ===
  const renderDashboard = () => {
    const blockMap = new Map<string, SponsorDashboardBlock>();
    data.dashboardBlocks.forEach((b) => blockMap.set(b.id, b));

    return (
      <ScrollView contentContainerStyle={s.tabContent}>
        {DASHBOARD_SECTIONS.map((section) => (
          <View key={section.title} style={[s.dashboardCard, { backgroundColor: colors.card }]}>
            <ThemedText style={[s.dashboardCardTitle, { color: colors.textSecondary }]}>
              {section.title}
            </ThemedText>
            {section.ids.map((id, index) => {
              const block = blockMap.get(id);
              if (!block) return null;
              return (
                <React.Fragment key={block.id}>
                  {index > 0 && (
                    <View style={[s.dashboardDivider, { backgroundColor: colors.border }]} />
                  )}
                  <View style={s.dashboardBlockRow}>
                    <View style={s.dashboardBlockInfo}>
                      <ThemedText style={[s.dashboardBlockLabel, { color: colors.textSecondary }]}>
                        {block.label}
                      </ThemedText>
                      <ThemedText style={[s.dashboardBlockValue, { color: colors.text }]}>
                        {block.value}
                      </ThemedText>
                      {block.detail != null && (
                        <ThemedText
                          style={[s.dashboardBlockDetail, { color: colors.textTertiary }]}
                        >
                          {block.detail}
                        </ThemedText>
                      )}
                    </View>
                    <View
                      style={[s.statusDotLg, { backgroundColor: STATUS_DOT_COLOR[block.status] }]}
                    />
                  </View>
                </React.Fragment>
              );
            })}
          </View>
        ))}

        {/* Quick Actions */}
        <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
          Quick Actions
        </ThemedText>
        <View style={s.quickActionsRow}>
          {data.quickActions.map((action: SponsorQuickAction) => (
            <Pressable
              key={action.id}
              style={[s.quickActionButton, { backgroundColor: accentColor }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name={action.icon as any} size={18} color="#000" />
              <ThemedText style={s.quickActionLabel} numberOfLines={2}>
                {action.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    );
  };

  // === Tab 2: Sponsors ===
  const renderSponsors = () => {
    const filtered = searchQuery
      ? data.sponsors.filter(
          (sp) =>
            sp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sp.primaryContact.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : data.sponsors;

    return (
      <FlatList<Sponsor>
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <View style={[s.searchBar, { backgroundColor: colors.backgroundTertiary }]}>
            <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
            <TextInput
              style={[s.searchInput, { color: colors.text }]}
              placeholder="Search sponsors..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        }
        renderItem={({ item }) => {
          const statusColor = SPONSOR_STATUS_COLOR[item.status];
          return (
            <Pressable
              style={[s.listCard, { backgroundColor: colors.card }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={s.listCardRow}>
                <View style={[s.logoCircle, { backgroundColor: item.logoColor }]}>
                  <ThemedText style={s.logoInitials}>{item.logoInitials}</ThemedText>
                </View>
                <View style={s.listCardInfo}>
                  <View style={s.titleRow}>
                    <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.name}
                    </ThemedText>
                    <View style={[s.statusDot, { backgroundColor: statusColor }]} />
                  </View>
                  <View style={s.badgeRow}>
                    {item.tier != null && (
                      <View
                        style={[
                          s.badge,
                          { backgroundColor: PACKAGE_TIER_COLOR[item.tier] + '33' },
                        ]}
                      >
                        <ThemedText
                          style={[s.badgeText, { color: PACKAGE_TIER_COLOR[item.tier] }]}
                        >
                          {PACKAGE_TIER_LABEL[item.tier]}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  {item.contractWindow != null && (
                    <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                      {item.contractWindow}
                    </ThemedText>
                  )}
                  <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                    {item.primaryContact} - {item.primaryEmail}
                  </ThemedText>
                  <ThemedText style={[s.valueText, { color: colors.text }]}>
                    ${item.value.toLocaleString()}
                  </ThemedText>
                  {/* Quick action buttons */}
                  <View style={s.cardActionsRow}>
                    {['Open', 'Contract', 'Invoice'].map((label) => (
                      <Pressable
                        key={label}
                        style={[s.cardActionBtn, { borderColor: colors.border }]}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                      >
                        <ThemedText style={[s.cardActionBtnText, { color: colors.textSecondary }]}>
                          {label}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    );
  };

  // === Tab 3: Packages ===
  const renderPackages = () => (
    <FlatList<SponsorPackage>
      data={data.packages}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      renderItem={({ item }) => {
        const tierColor = PACKAGE_TIER_COLOR[item.tier];
        const utilRatio =
          item.maxCount > 0 ? item.currentCount / item.maxCount : 0;
        return (
          <Pressable
            style={[s.listCard, { backgroundColor: colors.card }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.listCardRow}>
              <View style={[s.tierCircle, { backgroundColor: tierColor }]}>
                <ThemedText style={s.tierCircleText}>
                  {item.tier.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <View style={s.listCardInfo}>
                <ThemedText style={[s.listCardTitle, { color: colors.text }]}>
                  {PACKAGE_TIER_LABEL[item.tier]}
                </ThemedText>
                <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                  {item.price} / {item.termLength}
                </ThemedText>
                {/* Deliverables chips */}
                <View style={s.chipWrap}>
                  {item.includedDeliverables.map((del) => (
                    <View
                      key={del}
                      style={[s.deliverableChip, { backgroundColor: colors.backgroundTertiary }]}
                    >
                      <ThemedText style={[s.deliverableChipText, { color: colors.textSecondary }]}>
                        {del}
                      </ThemedText>
                    </View>
                  ))}
                </View>
                {/* Utilization */}
                <View style={s.progressRow}>
                  <View style={[s.progressTrack, { backgroundColor: colors.text + '10' }]}>
                    <View
                      style={[
                        s.progressFill,
                        {
                          width: `${utilRatio * 100}%`,
                          backgroundColor: tierColor,
                        },
                      ]}
                    />
                  </View>
                  <ThemedText style={[s.progressLabel, { color: colors.textSecondary }]}>
                    {item.currentCount}/{item.maxCount}
                  </ThemedText>
                </View>
                {item.approvalRequired && (
                  <View style={s.badgeRow}>
                    <View style={[s.badge, { backgroundColor: '#B8943E' + '33' }]}>
                      <ThemedText style={[s.badgeText, { color: '#B8943E' }]}>
                        Approval Required
                      </ThemedText>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        );
      }}
    />
  );

  // === Tab 4: Inventory ===
  const renderInventory = () => {
    const categories: string[] = ['all', ...Object.keys(INVENTORY_CATEGORY_LABEL)];
    const filteredInventory =
      inventoryCategoryFilter === 'all'
        ? data.inventory
        : data.inventory.filter((slot) => slot.category === inventoryCategoryFilter);

    return (
      <FlatList<InventorySlot>
        data={filteredInventory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chipRow}
            style={s.chipRowContainer}
          >
            {categories.map((cat) => {
              const isActive = inventoryCategoryFilter === cat;
              const label =
                cat === 'all'
                  ? 'All'
                  : INVENTORY_CATEGORY_LABEL[cat as InventoryCategory];
              return (
                <Pressable
                  key={cat}
                  style={[
                    s.chipPill,
                    isActive
                      ? { backgroundColor: accentColor }
                      : { backgroundColor: colors.backgroundTertiary },
                  ]}
                  onPress={() => handleInventoryCategoryPress(cat)}
                >
                  <ThemedText
                    style={[
                      s.chipText,
                      { color: isActive ? '#000' : colors.textSecondary },
                    ]}
                  >
                    {label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        }
        renderItem={({ item }) => {
          const availRatio =
            item.quantityAvailable > 0
              ? item.quantitySold / item.quantityAvailable
              : 0;
          const catLabel = INVENTORY_CATEGORY_LABEL[item.category];
          return (
            <Pressable
              style={[s.listCard, { backgroundColor: colors.card }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={s.listCardInfo}>
                <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </ThemedText>
                <View style={s.badgeRow}>
                  <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                    <ThemedText style={[s.badgeText, { color: accentColor }]}>
                      {catLabel}
                    </ThemedText>
                  </View>
                  <View style={[s.badge, { backgroundColor: colors.backgroundTertiary }]}>
                    <ThemedText style={[s.badgeText, { color: colors.textSecondary }]}>
                      {item.unitScope}
                    </ThemedText>
                  </View>
                </View>
                {/* Availability bar */}
                <View style={s.progressRow}>
                  <View style={[s.progressTrack, { backgroundColor: colors.text + '10' }]}>
                    <View
                      style={[
                        s.progressFill,
                        {
                          width: `${availRatio * 100}%`,
                          backgroundColor: accentColor,
                        },
                      ]}
                    />
                  </View>
                  <ThemedText style={[s.progressLabel, { color: colors.textSecondary }]}>
                    {item.quantitySold}/{item.quantityAvailable}
                  </ThemedText>
                </View>
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                  {item.priceGuidance} | {item.duration}
                </ThemedText>
                {item.soldTo != null && (
                  <View style={[s.badge, { backgroundColor: '#5A8A6E' + '33', alignSelf: 'flex-start' }]}>
                    <ThemedText style={[s.badgeText, { color: '#5A8A6E' }]}>
                      {item.soldTo}
                    </ThemedText>
                  </View>
                )}
                {item.rules != null && (
                  <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                    Rules: {item.rules}
                  </ThemedText>
                )}
              </View>
            </Pressable>
          );
        }}
      />
    );
  };

  // === Tab 5: Contracts ===
  const renderContracts = () => (
    <FlatList<SponsorContract>
      data={data.contracts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      renderItem={({ item }) => {
        const statusColor = CONTRACT_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.listCard, { backgroundColor: colors.card }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.listCardInfo}>
              <View style={s.titleRow}>
                <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.sponsorName}
                </ThemedText>
                <View style={[s.statusDot, { backgroundColor: statusColor }]} />
              </View>
              {item.packageName != null && (
                <View style={s.badgeRow}>
                  <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                    <ThemedText style={[s.badgeText, { color: accentColor }]}>
                      {item.packageName}
                    </ThemedText>
                  </View>
                </View>
              )}
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                {item.termStart} - {item.termEnd}
              </ThemedText>
              <ThemedText style={[s.valueText, { color: colors.text }]}>
                ${item.totalValue.toLocaleString()}
              </ThemedText>
              <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                Payment: {item.paymentSchedule}
              </ThemedText>
              <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                Deliverables: {item.deliverableCount}
              </ThemedText>
              {item.signedDate != null && (
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                  Signed: {item.signedDate}
                </ThemedText>
              )}
              {item.renewalReminderDate != null && (
                <View style={[s.badge, { backgroundColor: '#B8943E' + '33', alignSelf: 'flex-start', marginTop: 4 }]}>
                  <ThemedText style={[s.badgeText, { color: '#B8943E' }]}>
                    Renewal: {item.renewalReminderDate}
                  </ThemedText>
                </View>
              )}
            </View>
          </Pressable>
        );
      }}
    />
  );

  // === Tab 6: Fulfillment ===
  const renderFulfillment = () => {
    const statusFilters: { key: string; label: string }[] = [
      { key: 'all', label: 'All' },
      { key: 'pending', label: 'Pending' },
      { key: 'delivered', label: 'Delivered' },
      { key: 'verified', label: 'Verified' },
      { key: 'missed', label: 'Missed' },
    ];

    const filteredFulfillment =
      fulfillmentStatusFilter === 'all'
        ? data.fulfillment
        : data.fulfillment.filter((f) => f.status === fulfillmentStatusFilter);

    return (
      <FlatList<FulfillmentItem>
        data={filteredFulfillment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chipRow}
            style={s.chipRowContainer}
          >
            {statusFilters.map((sf) => {
              const isActive = fulfillmentStatusFilter === sf.key;
              const dotColor =
                sf.key !== 'all'
                  ? FULFILLMENT_STATUS_COLOR[sf.key as FulfillmentStatus]
                  : undefined;
              return (
                <Pressable
                  key={sf.key}
                  style={[
                    s.chipPill,
                    isActive
                      ? { backgroundColor: accentColor }
                      : { backgroundColor: colors.backgroundTertiary },
                  ]}
                  onPress={() => handleFulfillmentStatusPress(sf.key)}
                >
                  {dotColor != null && (
                    <View style={[s.chipDot, { backgroundColor: dotColor }]} />
                  )}
                  <ThemedText
                    style={[
                      s.chipText,
                      { color: isActive ? '#000' : colors.textSecondary },
                    ]}
                  >
                    {sf.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        }
        renderItem={({ item }) => {
          const statusColor = FULFILLMENT_STATUS_COLOR[item.status];
          const catLabel = INVENTORY_CATEGORY_LABEL[item.category];
          return (
            <Pressable
              style={[s.listCard, { backgroundColor: colors.card }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={s.listCardRow}>
                <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
                  <ThemedText style={[s.avatarText, { color: accentColor }]}>
                    {item.ownerInitials}
                  </ThemedText>
                </View>
                <View style={s.listCardInfo}>
                  <View style={s.titleRow}>
                    <ThemedText
                      style={[s.listCardTitle, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {item.deliverableName}
                    </ThemedText>
                    <View style={[s.statusDot, { backgroundColor: statusColor }]} />
                  </View>
                  <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                    {item.sponsorName}
                  </ThemedText>
                  <View style={s.badgeRow}>
                    <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                      <ThemedText style={[s.badgeText, { color: accentColor }]}>
                        {catLabel}
                      </ThemedText>
                    </View>
                    <View style={[s.badge, { backgroundColor: colors.backgroundTertiary }]}>
                      <ThemedText style={[s.badgeText, { color: colors.textSecondary }]}>
                        {item.dueCadence}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                    Due: {item.dueDate}
                  </ThemedText>
                  {item.proofLinks.length > 0 && (
                    <View style={[s.badge, { backgroundColor: accent + '33', alignSelf: 'flex-start' }]}>
                      <ThemedText style={[s.badgeText, { color: accent }]}>
                        {item.proofLinks.length} proof{item.proofLinks.length > 1 ? 's' : ''}
                      </ThemedText>
                    </View>
                  )}
                  {item.verifiedBy != null && (
                    <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                      Verified by: {item.verifiedBy}
                    </ThemedText>
                  )}
                  {item.notes != null && (
                    <ThemedText
                      style={[s.listCardSub, { color: colors.textTertiary }]}
                      numberOfLines={2}
                    >
                      {item.notes}
                    </ThemedText>
                  )}
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    );
  };

  // === Tab 7: Assets ===
  const renderAssets = () => {
    // Group assets by sponsor
    const grouped = new Map<string, SponsorAsset[]>();
    data.assets.forEach((asset) => {
      const existing = grouped.get(asset.sponsorName) ?? [];
      existing.push(asset);
      grouped.set(asset.sponsorName, existing);
    });
    const sections = Array.from(grouped.entries());

    return (
      <ScrollView contentContainerStyle={s.listContent}>
        {sections.map(([sponsorName, assets]) => (
          <View key={sponsorName}>
            <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
              {sponsorName}
            </ThemedText>
            {assets.map((asset) => (
              <Pressable
                key={asset.id}
                style={[s.listCard, { backgroundColor: colors.card, marginBottom: Spacing.sm }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <View style={s.listCardInfo}>
                  <View style={s.titleRow}>
                    <ThemedText
                      style={[s.listCardTitle, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {asset.title}
                    </ThemedText>
                    {asset.approved && (
                      <IconSymbol
                        name="checkmark.circle.fill"
                        size={14}
                        color="#5A8A6E"
                      />
                    )}
                  </View>
                  <View style={s.badgeRow}>
                    <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                      <ThemedText style={[s.badgeText, { color: accentColor }]}>
                        {ASSET_TYPE_LABEL[asset.assetType]}
                      </ThemedText>
                    </View>
                    <View style={[s.badge, { backgroundColor: colors.backgroundTertiary }]}>
                      <ThemedText style={[s.badgeText, { color: colors.textSecondary }]}>
                        v{asset.version}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText
                    style={[s.listCardSub, { color: colors.textTertiary }]}
                    numberOfLines={2}
                  >
                    {asset.description}
                  </ThemedText>
                  <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                    Updated: {asset.updatedAt}
                  </ThemedText>
                </View>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    );
  };

  // === Tab 8: Invoicing ===
  const renderInvoicing = () => (
    <FlatList<SponsorInvoice>
      data={data.invoices}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListHeaderComponent={
        <View style={s.invoiceActionsRow}>
          {['Generate Invoice', 'Mark Paid', 'Send Reminder'].map((label) => (
            <Pressable
              key={label}
              style={[s.invoiceActionBtn, { borderColor: accentColor }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <ThemedText style={[s.invoiceActionBtnText, { color: accentColor }]}>
                {label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      }
      renderItem={({ item }) => {
        const statusColor = INVOICE_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.listCard, { backgroundColor: colors.card }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.listCardInfo}>
              <View style={s.titleRow}>
                <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.invoiceNumber}
                </ThemedText>
                <View style={[s.statusDot, { backgroundColor: statusColor }]} />
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                {item.sponsorName}
              </ThemedText>
              <ThemedText style={[s.valueText, { color: colors.text }]}>
                ${item.amount.toLocaleString()}
              </ThemedText>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                Issued: {item.issuedDate} | Due: {item.dueDate}
              </ThemedText>
              {item.paidDate != null && (
                <ThemedText style={[s.listCardSub, { color: '#5A8A6E' }]}>
                  Paid: {item.paidDate}
                </ThemedText>
              )}
              {item.paymentMethod != null && (
                <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                  Method: {item.paymentMethod}
                </ThemedText>
              )}
              <View style={s.reconciledRow}>
                <IconSymbol
                  name={item.reconciled ? 'checkmark.circle.fill' : 'xmark.circle.fill'}
                  size={14}
                  color={item.reconciled ? '#5A8A6E' : '#B85C5C'}
                />
                <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                  {item.reconciled ? 'Reconciled' : 'Not Reconciled'}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      }}
    />
  );

  // === Tab 9: Reports ===
  const renderReports = () => (
    <FlatList<SponsorReport>
      data={data.reports}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      renderItem={({ item }) => {
        const formatColor = REPORT_FORMAT_COLOR[item.format];
        return (
          <Pressable
            style={[s.listCard, { backgroundColor: colors.card }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.listCardInfo}>
              <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <View style={s.badgeRow}>
                <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>
                    {item.type}
                  </ThemedText>
                </View>
                <View style={[s.badge, { backgroundColor: formatColor + '33' }]}>
                  <ThemedText style={[s.badgeText, { color: formatColor }]}>
                    {item.format}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                {item.period}
              </ThemedText>
              <View style={s.reportBottomRow}>
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                  {item.generatedAt}
                </ThemedText>
                <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                  {item.size}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      }}
    />
  );

  // === Tab 10: Audit ===
  const renderAudit = () => (
    <FlatList<SponsorAuditEntry>
      data={data.audit}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      renderItem={({ item }) => {
        const aColor = auditColor(item.action);
        const aIcon = auditIcon(item.action);
        return (
          <View style={s.auditRow}>
            <View style={[s.auditIconCircle, { backgroundColor: aColor + '20' }]}>
              <IconSymbol name={aIcon as any} size={14} color={aColor} />
            </View>
            <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
              <ThemedText style={[s.avatarText, { color: accentColor }]}>
                {item.actorInitials}
              </ThemedText>
            </View>
            <View style={s.auditInfo}>
              <ThemedText style={[s.auditAction, { color: colors.text }]}>
                {item.target}
              </ThemedText>
              {item.detail != null && (
                <ThemedText
                  style={[s.listCardSub, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {item.detail}
                </ThemedText>
              )}
              <ThemedText style={[s.auditMeta, { color: colors.textTertiary }]}>
                {item.timestamp}
              </ThemedText>
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 11: Settings ===
  const renderSettings = () => (
    <View style={s.tabContent}>
      <ThemedText style={[s.settingsHeader, { color: colors.textSecondary }]}>
        Sponsors Settings
      </ThemedText>
      <View style={[s.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {data.settings.map((setting: SponsorSettingToggle, index: number) => {
          const toggled = settingToggles[setting.id] ?? setting.enabled;
          return (
            <React.Fragment key={setting.id}>
              {index > 0 && (
                <View style={[s.settingsDivider, { backgroundColor: colors.border }]} />
              )}
              <View style={s.settingsRow}>
                <View style={s.settingsLabelGroup}>
                  <ThemedText style={[s.settingsLabel, { color: colors.text }]}>
                    {setting.label}
                  </ThemedText>
                  <ThemedText style={[s.settingsDesc, { color: colors.textTertiary }]}>
                    {setting.description}
                  </ThemedText>
                </View>
                <Switch
                  value={toggled}
                  onValueChange={(val) =>
                    setSettingToggles((prev) => ({ ...prev, [setting.id]: val }))
                  }
                  trackColor={{ false: colors.backgroundTertiary, true: accentColor + '60' }}
                  thumbColor={toggled ? accentColor : colors.textTertiary}
                />
              </View>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );

  // ===================================================================
  // RENDER — MAIN
  // ===================================================================

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      {/* === Pill Nav === */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tabBar}
        style={s.tabBarContainer}
      >
        {SPONSORS_TABS.map((tab) => (
          <Pressable
            key={tab.id}
            style={[
              s.tabPill,
              activeTab === tab.id
                ? { backgroundColor: accentColor }
                : { backgroundColor: colors.backgroundTertiary },
            ]}
            onPress={() => handleTabPress(tab.id)}
          >
            <ThemedText
              style={[
                s.tabPillText,
                { color: activeTab === tab.id ? '#000' : colors.textSecondary },
              ]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* === Tab Content === */}
      <View style={s.contentArea}>{renderTabContent()}</View>
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

  // === Tab Bar ===
  tabBarContainer: {
    flexGrow: 0,
  },
  tabBar: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // === Content Area ===
  contentArea: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },

  // === Search ===
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    height: 36,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },

  // === List Cards ===
  listCard: {
    borderRadius: 12,
    padding: Spacing.md,
  },
  listCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  listCardInfo: {
    flex: 1,
    gap: 4,
  },
  listCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  listCardSub: {
    fontSize: 12,
  },

  // === Logo Circle (Sponsors) ===
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitials: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // === Tier Circle (Packages) ===
  tierCircle: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierCircleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },

  // === Avatar ===
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 9,
    fontWeight: '700',
  },

  // === Badges ===
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },

  // === Status Dot ===
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
  },
  statusDotLg: {
    width: 8,
    height: 8,
    borderRadius: 9999,
    marginTop: 4,
  },

  // === Title Row ===
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  // === Section Header ===
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },

  // === Value Text ===
  valueText: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // === Progress Bar ===
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 4,
  },
  progressFill: {
    height: 4,
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },

  // === Dashboard ===
  dashboardCard: {
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  dashboardCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  dashboardDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.sm,
  },
  dashboardBlockRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  dashboardBlockInfo: {
    flex: 1,
    gap: 2,
  },
  dashboardBlockLabel: {
    fontSize: 12,
  },
  dashboardBlockValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  dashboardBlockDetail: {
    fontSize: 11,
  },

  // === Quick Actions (Dashboard) ===
  quickActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 4,
  },
  quickActionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },

  // === Card Action Buttons (Sponsors) ===
  cardActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 4,
  },
  cardActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  cardActionBtnText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // === Chip / Filter Pills ===
  chipRowContainer: {
    flexGrow: 0,
    marginBottom: Spacing.sm,
  },
  chipRow: {
    gap: Spacing.sm,
  },
  chipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // === Deliverable Chips (Packages) ===
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  deliverableChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  deliverableChipText: {
    fontSize: 10,
  },

  // === Invoice Action Buttons ===
  invoiceActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  invoiceActionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  invoiceActionBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // === Reconciled Row (Invoicing) ===
  reconciledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },

  // === Reports ===
  reportBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  // === Audit ===
  auditRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  auditIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  auditInfo: {
    flex: 1,
    gap: 2,
  },
  auditAction: {
    fontSize: 13,
    fontWeight: '500',
  },
  auditMeta: {
    fontSize: 11,
  },

  // === Settings ===
  settingsHeader: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  settingsCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  settingsLabelGroup: {
    flex: 1,
    marginRight: Spacing.sm,
    gap: 2,
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingsDesc: {
    fontSize: 11,
  },
  settingsDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },
});
