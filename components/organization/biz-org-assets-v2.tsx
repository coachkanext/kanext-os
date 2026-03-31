/**
 * Business Organization Assets Tab — 10-tab Assets Hub.
 * Overview, Registry, Locations, Vendors, Maintenance,
 * Insurance, Acquisitions, Diligence, Requests, Exports.
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
import { Colors, Spacing, BorderRadius, BusinessPalette , MODE_ACCENT } from '@/constants/theme';
import { BizCard, BizSubTabBar, BizStatusChip, BizAlertCard, BizEmptyLock, statusVariant } from '@/components/business/business-shared';
import type { BusinessRoleLens } from '@/utils/business-rbac';
import { isFounder, isBoardLevel, isInvestor } from '@/utils/business-rbac';
import { useBusiness } from '@/context/business-context';
import { formatCurrency, KANEXT_HOLDCO, KANEXT_OPSCO, KANEXT_IP, TARGET_BANK, SLIEMA_WANDERERS, SEEDED_ENTITY_NAMES } from '@/data/biz-org-shared-types';
import type { CrossTabLink } from '@/data/biz-org-shared-types';
import {
  BIZ_ASSETS_TABS,
  getBizAssetsData,
  ASSET_TYPE_COLOR,
  ASSET_TYPE_LABEL,
  ASSET_STATUS_COLOR,
  LEASE_STATUS_COLOR,
  LEASE_STATUS_LABEL,
  VENDOR_CONTRACT_COLOR,
  MAINTENANCE_TYPE_COLOR,
  MAINTENANCE_STATUS_COLOR,
  INSURANCE_TYPE_COLOR,
  INSURANCE_TYPE_LABEL,
  ACQUISITION_STAGE_COLOR,
  ACQUISITION_STAGE_LABEL,
  REQUEST_TYPE_COLOR,
  REQUEST_STATUS_COLOR,
  EXPORT_FORMAT_COLOR,
} from '@/data/mock-biz-org-assets';
import type {
  BizAssetsTabId,
  AssetType,
  AssetItem,
  AssetLocation,
  AssetVendor,
  AssetMaintenance,
  AssetInsurance,
  AssetAcquisition,
  AssetDiligenceItem,
  AssetRequest,
  AssetExportOption,
  RequestLifecycle,
} from '@/data/mock-biz-org-assets';

// =============================================================================
// PROPS
// =============================================================================


const ACCENT = MODE_ACCENT.business;
interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: BusinessRoleLens;
}

const BP = BusinessPalette;

// =============================================================================
// SUB-COMPONENTS — Badges
// =============================================================================

function AssetTypeBadge({ type }: { type: AssetType }) {
  const fg = ASSET_TYPE_COLOR[type];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>
        {ASSET_TYPE_LABEL[type]}
      </ThemedText>
    </View>
  );
}

function AssetStatusBadge({ status }: { status: AssetItem['status'] }) {
  const fg = ASSET_STATUS_COLOR[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{status}</ThemedText>
    </View>
  );
}

function LeaseStatusBadge({ status }: { status: AssetLocation['leaseStatus'] }) {
  const fg = LEASE_STATUS_COLOR[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>
        {LEASE_STATUS_LABEL[status]}
      </ThemedText>
    </View>
  );
}

function VendorContractBadge({ status }: { status: AssetVendor['contractStatus'] }) {
  const fg = VENDOR_CONTRACT_COLOR[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{status}</ThemedText>
    </View>
  );
}

function MaintenanceTypeBadge({ type }: { type: AssetMaintenance['type'] }) {
  const fg = MAINTENANCE_TYPE_COLOR[type];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{type}</ThemedText>
    </View>
  );
}

function MaintenanceStatusBadge({ status }: { status: AssetMaintenance['status'] }) {
  const fg = MAINTENANCE_STATUS_COLOR[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{status}</ThemedText>
    </View>
  );
}

function InsuranceTypeBadge({ type }: { type: AssetInsurance['type'] }) {
  const fg = INSURANCE_TYPE_COLOR[type];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>
        {INSURANCE_TYPE_LABEL[type]}
      </ThemedText>
    </View>
  );
}

function AcquisitionStageBadge({ stage }: { stage: AssetAcquisition['stage'] }) {
  const fg = ACQUISITION_STAGE_COLOR[stage];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>
        {ACQUISITION_STAGE_LABEL[stage]}
      </ThemedText>
    </View>
  );
}

function RequestTypeBadge({ type }: { type: AssetRequest['type'] }) {
  const fg = REQUEST_TYPE_COLOR[type];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{type}</ThemedText>
    </View>
  );
}

function RequestStatusBadge({ status }: { status: AssetRequest['status'] }) {
  const fg = REQUEST_STATUS_COLOR[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{status}</ThemedText>
    </View>
  );
}

function ExportFormatBadge({ format }: { format: AssetExportOption['format'] }) {
  const fg = EXPORT_FORMAT_COLOR[format];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{format}</ThemedText>
    </View>
  );
}

function EmptyState({ icon, text, colors }: { icon: string; text: string; colors: typeof Colors.light }) {
  return (
    <View style={s.emptyState}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>{text}</ThemedText>
    </View>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function renderStars(rating: number): string {
  const filled = Math.round(Math.min(Math.max(rating, 0), 5));
  const empty = 5 - filled;
  return '\u2605'.repeat(filled) + '\u2606'.repeat(empty);
}

function starColor(rating: number): string {
  if (rating >= 4) return '#5A8A6E';
  if (rating >= 3) return '#B8943E';
  return '#B85C5C';
}

// =============================================================================
// PROGRESS BAR
// =============================================================================

function ProgressBar({ percent, color, bgColor }: { percent: number; color: string; bgColor: string }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <View style={[s.progressTrack, { backgroundColor: bgColor }]}>
      <View style={[s.progressFill, { width: `${clamped}%` as any, backgroundColor: color }]} />
    </View>
  );
}

// =============================================================================
// ASSET HEALTH DATA & COMPONENT
// =============================================================================

type HealthStatus = 'green' | 'yellow' | 'red';
interface AssetHealth { maintenance: HealthStatus; insurance: HealthStatus; compliance: HealthStatus; payments: HealthStatus }

const ASSET_HEALTH_MAP: Record<string, AssetHealth> = {
  'ast-1':  { maintenance: 'green',  insurance: 'green',  compliance: 'green',  payments: 'green' },
  'ast-2':  { maintenance: 'yellow', insurance: 'green',  compliance: 'green',  payments: 'green' },
  'ast-3':  { maintenance: 'green',  insurance: 'red',    compliance: 'yellow', payments: 'green' },
  'ast-4':  { maintenance: 'green',  insurance: 'green',  compliance: 'green',  payments: 'yellow' },
  'ast-5':  { maintenance: 'red',    insurance: 'yellow', compliance: 'green',  payments: 'green' },
  'ast-6':  { maintenance: 'green',  insurance: 'green',  compliance: 'red',    payments: 'green' },
  'ast-7':  { maintenance: 'green',  insurance: 'green',  compliance: 'green',  payments: 'red' },
  'ast-8':  { maintenance: 'yellow', insurance: 'yellow', compliance: 'green',  payments: 'green' },
  'ast-9':  { maintenance: 'green',  insurance: 'green',  compliance: 'yellow', payments: 'yellow' },
  'ast-10': { maintenance: 'green',  insurance: 'green',  compliance: 'green',  payments: 'green' },
  default:  { maintenance: 'green',  insurance: 'green',  compliance: 'green',  payments: 'green' },
};

function getAssetHealth(assetId: string): AssetHealth {
  return ASSET_HEALTH_MAP[assetId] ?? ASSET_HEALTH_MAP['default'];
}

function AssetHealthStrip({ health }: { health: AssetHealth }) {
  const dims = [
    { key: 'maintenance', label: 'Maint' },
    { key: 'insurance', label: 'Ins' },
    { key: 'compliance', label: 'Comp' },
    { key: 'payments', label: 'Pay' },
  ] as const;
  const colorMap: Record<string, string> = { green: '#5A8A6E', yellow: '#B8943E', red: '#B85C5C' };
  return (
    <View style={s.assetHealthStrip}>
      {dims.map((d) => (
        <View key={d.key} style={s.assetHealthItem}>
          <View style={[s.assetHealthDot, { backgroundColor: colorMap[health[d.key]] || '#5A8A6E' }]} />
          <ThemedText style={[s.assetHealthLabel, { color: BP.ash }]}>{d.label}</ThemedText>
        </View>
      ))}
    </View>
  );
}

// =============================================================================
// INSURANCE ALERTS DATA
// =============================================================================

const INSURANCE_ALERTS = [
  { assetName: 'Office Lease \u2014 Austin HQ', policyType: 'General Liability', expiryDate: '2026-01-15', status: 'expired' as const },
];

// =============================================================================
// DILIGENCE TEMPLATES DATA
// =============================================================================

const DILIGENCE_TEMPLATES = [
  { id: 'dt-1', name: 'Bank Acquisition Checklist', type: 'bank', itemCount: 24, completedCount: 8 },
  { id: 'dt-2', name: 'Vendor Onboarding Checklist', type: 'vendor', itemCount: 12, completedCount: 12 },
  { id: 'dt-3', name: 'Real Estate Due Diligence', type: 'real_estate', itemCount: 18, completedCount: 0 },
];

const TEMPLATE_TYPE_COLOR: Record<string, string> = {
  bank: ACCENT,
  vendor: ACCENT,
  real_estate: ACCENT,
};

// =============================================================================
// REQUEST LIFECYCLE BAR
// =============================================================================

const REQUEST_LIFECYCLE_STAGES: { key: RequestLifecycle; label: string }[] = [
  { key: 'draft', label: 'Draft' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'approved', label: 'Approved' },
  { key: 'routed_to_finance', label: 'Finance' },
  { key: 'archived', label: 'Archived' },
];

function RequestLifecycleBar({ currentStage }: { currentStage: RequestLifecycle }) {
  const currentIdx = REQUEST_LIFECYCLE_STAGES.findIndex((st) => st.key === currentStage);
  return (
    <View style={s.lifecycleRow}>
      {REQUEST_LIFECYCLE_STAGES.map((stage, idx) => {
        const isActive = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <React.Fragment key={stage.key}>
            {idx > 0 && (
              <View style={[s.lifecycleLine, { backgroundColor: isActive ? '#5A8A6E' : BP.ash + '40' }]} />
            )}
            <View style={s.lifecycleStep}>
              <View
                style={[
                  s.lifecycleDot,
                  {
                    backgroundColor: isCurrent ? '#5A8A6E' : isActive ? '#5A8A6E80' : BP.ash + '40',
                    borderWidth: isCurrent ? 2 : 0,
                    borderColor: isCurrent ? '#5A8A6E' : 'transparent',
                  },
                ]}
              />
              <ThemedText
                style={[
                  s.lifecycleLabel,
                  { color: isCurrent ? '#5A8A6E' : isActive ? BP.smoke : BP.ash },
                ]}
                numberOfLines={1}
              >
                {stage.label}
              </ThemedText>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

// =============================================================================
// STAT CARD (Overview)
// =============================================================================

function StatCard({
  label,
  value,
  icon,
  iconColor,
  colors,
}: {
  label: string;
  value: string;
  icon: string;
  iconColor: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={[s.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={s.statCardHeader}>
        <IconSymbol name={icon as any} size={18} color={iconColor} />
        <ThemedText style={[s.statCardLabel, { color: colors.textSecondary }]}>
          {label}
        </ThemedText>
      </View>
      <ThemedText style={[s.statCardValue, { color: colors.text }]}>{value}</ThemedText>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BizOrgAssetsV2({ colors, accentColor, role = 'B1' }: Props) {
  // === RBAC Gate: non-founder/board/investor/B5 locked ===
  if (!isFounder(role) && !isBoardLevel(role) && !isInvestor(role) && role !== 'B5') {
    return <BizEmptyLock title="Assets" message="This section is restricted. Contact the Founder for access." />;
  }

  // === Entity Scope ===
  const { selectedEntityId } = useBusiness();
  // TODO: filter all asset data by selectedEntityId once backend supports entity-scoped queries

  // === State ===
  const [activeTab, setActiveTab] = useState<BizAssetsTabId>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all');

  // Detail bottom sheets
  const [assetDetailVisible, setAssetDetailVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetItem | null>(null);
  const [locationDetailVisible, setLocationDetailVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<AssetLocation | null>(null);
  const [vendorDetailVisible, setVendorDetailVisible] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<AssetVendor | null>(null);
  const [maintenanceDetailVisible, setMaintenanceDetailVisible] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<AssetMaintenance | null>(null);
  const [insuranceDetailVisible, setInsuranceDetailVisible] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState<AssetInsurance | null>(null);
  const [acquisitionDetailVisible, setAcquisitionDetailVisible] = useState(false);
  const [selectedAcquisition, setSelectedAcquisition] = useState<AssetAcquisition | null>(null);
  const [requestDetailVisible, setRequestDetailVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AssetRequest | null>(null);

  // === Data ===
  const data = useMemo(() => getBizAssetsData(), []);

  // === Filter data ===
  const filteredAssets = useMemo(() => {
    let items = data.assets;
    if (typeFilter !== 'all') {
      items = items.filter((a) => a.type === typeFilter);
    }
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.entityName.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q),
    );
  }, [data.assets, searchQuery, typeFilter]);

  const filteredLocations = useMemo(() => {
    if (!searchQuery) return data.locations;
    const q = searchQuery.toLowerCase();
    return data.locations.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q) ||
        l.entityName.toLowerCase().includes(q),
    );
  }, [data.locations, searchQuery]);

  const filteredVendors = useMemo(() => {
    if (!searchQuery) return data.vendors;
    const q = searchQuery.toLowerCase();
    return data.vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.entityName.toLowerCase().includes(q),
    );
  }, [data.vendors, searchQuery]);

  const filteredMaintenance = useMemo(() => {
    if (!searchQuery) return data.maintenance;
    const q = searchQuery.toLowerCase();
    return data.maintenance.filter(
      (m) =>
        m.assetName.toLowerCase().includes(q) ||
        m.assignee.toLowerCase().includes(q),
    );
  }, [data.maintenance, searchQuery]);

  const filteredInsurance = useMemo(() => {
    if (!searchQuery) return data.insurance;
    const q = searchQuery.toLowerCase();
    return data.insurance.filter(
      (ins) =>
        ins.policyName.toLowerCase().includes(q) ||
        ins.entityName.toLowerCase().includes(q),
    );
  }, [data.insurance, searchQuery]);

  const filteredAcquisitions = useMemo(() => {
    if (!searchQuery) return data.acquisitions;
    const q = searchQuery.toLowerCase();
    return data.acquisitions.filter(
      (a) =>
        a.targetName.toLowerCase().includes(q) ||
        a.entityName.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q),
    );
  }, [data.acquisitions, searchQuery]);

  const filteredRequests = useMemo(() => {
    if (!searchQuery) return data.requests;
    const q = searchQuery.toLowerCase();
    return data.requests.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.requestedBy.toLowerCase().includes(q) ||
        r.entityName.toLowerCase().includes(q),
    );
  }, [data.requests, searchQuery]);

  // === Diligence grouped by acquisition ===
  const diligenceByAcquisition = useMemo(() => {
    const map = new Map<string, { name: string; items: AssetDiligenceItem[] }>();
    for (const item of data.diligenceItems) {
      if (!map.has(item.acquisitionId)) {
        map.set(item.acquisitionId, { name: item.acquisitionName, items: [] });
      }
      map.get(item.acquisitionId)!.items.push(item);
    }
    return Array.from(map.entries()).map(([id, group]) => ({
      acquisitionId: id,
      acquisitionName: group.name,
      items: group.items,
      completedCount: group.items.filter((i) => i.completed).length,
      totalCount: group.items.length,
    }));
  }, [data.diligenceItems]);

  // === Derived alerts for overview ===
  const overdueMaintenanceItems = useMemo(
    () => data.maintenance.filter((m) => m.status === 'overdue'),
    [data.maintenance],
  );
  const expiringInsuranceItems = useMemo(
    () => data.insurance.filter((ins) => ins.renewalAlert),
    [data.insurance],
  );

  // === Callbacks ===
  const handleTabPress = useCallback((tabId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId as BizAssetsTabId);
    setSearchQuery('');
    setTypeFilter('all');
  }, []);

  const handleAssetPress = useCallback((asset: AssetItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAsset(asset);
    setAssetDetailVisible(true);
  }, []);

  const handleLocationPress = useCallback((location: AssetLocation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLocation(location);
    setLocationDetailVisible(true);
  }, []);

  const handleVendorPress = useCallback((vendor: AssetVendor) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedVendor(vendor);
    setVendorDetailVisible(true);
  }, []);

  const handleMaintenancePress = useCallback((item: AssetMaintenance) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMaintenance(item);
    setMaintenanceDetailVisible(true);
  }, []);

  const handleInsurancePress = useCallback((policy: AssetInsurance) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedInsurance(policy);
    setInsuranceDetailVisible(true);
  }, []);

  const handleAcquisitionPress = useCallback((acq: AssetAcquisition) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAcquisition(acq);
    setAcquisitionDetailVisible(true);
  }, []);

  const handleRequestPress = useCallback((req: AssetRequest) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRequest(req);
    setRequestDetailVisible(true);
  }, []);

  const handleTypeFilterPress = useCallback((type: AssetType | 'all') => {
    Haptics.selectionAsync();
    setTypeFilter(type);
  }, []);

  // ===================================================================
  // RENDER — TAB CONTENT
  // ===================================================================

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'registry':
        return renderRegistry();
      case 'locations':
        return renderLocations();
      case 'vendors':
        return renderVendors();
      case 'maintenance':
        return renderMaintenance();
      case 'insurance':
        return renderInsurance();
      case 'acquisitions':
        return renderAcquisitions();
      case 'diligence':
        return renderDiligence();
      case 'requests':
        return renderRequests();
      case 'exports':
        return renderExports();
      default:
        return null;
    }
  };

  // ===================================================================
  // OVERVIEW TAB
  // ===================================================================

  const renderOverview = () => {
    const ov = data.overview;
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
        {/* KPI Cards */}
        <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Asset Dashboard</ThemedText>
        <View style={s.statGrid}>
          <StatCard
            label="Total Asset Value"
            value={formatCurrency(ov.totalValue)}
            icon="chart.line.uptrend.xyaxis"
            iconColor="#5A8A6E"
            colors={colors}
          />
          <StatCard
            label="Active Locations"
            value={String(ov.activeLocations)}
            icon="mappin.and.ellipse"
            iconColor={ACCENT}
            colors={colors}
          />
          <StatCard
            label="Vendor Count"
            value={String(ov.vendorCount)}
            icon="person.2"
            iconColor={ACCENT}
            colors={colors}
          />
          <StatCard
            label="Maintenance Due"
            value={String(ov.maintenanceDue)}
            icon="wrench.and.screwdriver"
            iconColor={ov.maintenanceDue > 0 ? '#B85C5C' : '#5A8A6E'}
            colors={colors}
          />
          <StatCard
            label="Insurance Expiry Alerts"
            value={String(ov.insuranceExpiryAlerts)}
            icon="shield.checkered"
            iconColor={ov.insuranceExpiryAlerts > 0 ? '#B8943E' : '#5A8A6E'}
            colors={colors}
          />
          <StatCard
            label="Acquisition Pipeline"
            value={String(ov.acquisitionPipeline)}
            icon="arrow.triangle.merge"
            iconColor={ACCENT}
            colors={colors}
          />
        </View>

        {/* Alerts */}
        {(overdueMaintenanceItems.length > 0 || expiringInsuranceItems.length > 0) && (
          <View style={{ marginTop: Spacing.lg }}>
            <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Alerts</ThemedText>

            {overdueMaintenanceItems.map((m) => (
              <Pressable
                key={m.id}
                style={[s.alertCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: '#B85C5C' }]}
                onPress={() => handleMaintenancePress(m)}
              >
                <View style={[s.alertIconWrap, { backgroundColor: '#B85C5C15' }]}>
                  <IconSymbol name="wrench.and.screwdriver" size={16} color="#B85C5C" />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[s.alertTitle, { color: colors.text }]}>
                    Maintenance Overdue
                  </ThemedText>
                  <ThemedText style={[s.alertSubtitle, { color: colors.textSecondary }]}>
                    {m.assetName} — scheduled {m.scheduledDate}
                  </ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
              </Pressable>
            ))}

            {expiringInsuranceItems.map((ins) => (
              <Pressable
                key={ins.id}
                style={[s.alertCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: '#B8943E' }]}
                onPress={() => handleInsurancePress(ins)}
              >
                <View style={[s.alertIconWrap, { backgroundColor: '#B8943E15' }]}>
                  <IconSymbol name="shield.checkered" size={16} color="#B8943E" />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[s.alertTitle, { color: colors.text }]}>
                    Insurance Expiry Alert
                  </ThemedText>
                  <ThemedText style={[s.alertSubtitle, { color: colors.textSecondary }]}>
                    {ins.policyName} — expires {ins.expiryDate}
                  </ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
              </Pressable>
            ))}
          </View>
        )}

        {/* Quick Summary */}
        <View style={{ marginTop: Spacing.lg }}>
          <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Quick Summary</ThemedText>
          <BizCard>
            <View style={s.summaryRow}>
              <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>
                Total Assets
              </ThemedText>
              <ThemedText style={[s.summaryValue, { color: colors.text }]}>
                {data.assets.length}
              </ThemedText>
            </View>
            <View style={s.summaryRow}>
              <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>
                Active
              </ThemedText>
              <ThemedText style={[s.summaryValue, { color: '#5A8A6E' }]}>
                {data.assets.filter((a) => a.status === 'active').length}
              </ThemedText>
            </View>
            <View style={s.summaryRow}>
              <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>
                Pending
              </ThemedText>
              <ThemedText style={[s.summaryValue, { color: '#B8943E' }]}>
                {data.assets.filter((a) => a.status === 'pending').length}
              </ThemedText>
            </View>
            <View style={s.summaryRow}>
              <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>
                Active Vendors
              </ThemedText>
              <ThemedText style={[s.summaryValue, { color: colors.text }]}>
                {data.vendors.filter((v) => v.contractStatus === 'active').length}
              </ThemedText>
            </View>
            <View style={s.summaryRow}>
              <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>
                Total Vendor Spend YTD
              </ThemedText>
              <ThemedText style={[s.summaryValue, { color: accentColor }]}>
                {formatCurrency(data.vendors.reduce((sum, v) => sum + v.spendYTD, 0))}
              </ThemedText>
            </View>
          </BizCard>
        </View>
      </ScrollView>
    );
  };

  // ===================================================================
  // REGISTRY TAB
  // ===================================================================

  const ASSET_TYPE_FILTERS: { key: AssetType | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'real_estate', label: 'Real Estate' },
    { key: 'vehicles', label: 'Vehicles' },
    { key: 'equipment', label: 'Equipment' },
    { key: 'digital', label: 'Digital' },
    { key: 'financial', label: 'Financial' },
    { key: 'institutional', label: 'Institutional' },
  ];

  const renderRegistry = () => {
    return (
      <View style={{ flex: 1 }}>
        {/* Search */}
        <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textSecondary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search assets..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>

        {/* Type filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterChipRow}
          style={{ flexGrow: 0 }}
        >
          {ASSET_TYPE_FILTERS.map((chip) => {
            const isActive = typeFilter === chip.key;
            return (
              <Pressable
                key={chip.key}
                style={[
                  s.filterChip,
                  {
                    backgroundColor: isActive ? accentColor + '20' : colors.card,
                    borderColor: isActive ? accentColor + '40' : colors.border,
                  },
                ]}
                onPress={() => handleTypeFilterPress(chip.key)}
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

        {/* Asset list */}
        {filteredAssets.length === 0 ? (
          <EmptyState icon="tray" text="No assets found" colors={colors} />
        ) : (
          <FlatList
            data={filteredAssets}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.listContent}
            renderItem={({ item }) => (
              <Pressable
                style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleAssetPress(item)}
              >
                <View style={s.listCardHeader}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.name}
                    </ThemedText>
                    <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                      {item.entityName}
                    </ThemedText>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
                </View>

                <View style={s.listCardBadgeRow}>
                  <AssetTypeBadge type={item.type} />
                  <AssetStatusBadge status={item.status} />
                </View>

                <View style={s.listCardFooter}>
                  <View style={s.listCardFooterItem}>
                    <ThemedText style={[s.listCardFooterLabel, { color: colors.textTertiary }]}>
                      Value
                    </ThemedText>
                    <ThemedText style={[s.listCardFooterValue, { color: accentColor }]}>
                      {formatCurrency(item.value)}
                    </ThemedText>
                  </View>
                  <View style={s.listCardFooterItem}>
                    <ThemedText style={[s.listCardFooterLabel, { color: colors.textTertiary }]}>
                      Depreciation
                    </ThemedText>
                    <ThemedText style={[s.listCardFooterValue, { color: colors.textSecondary }]}>
                      {item.depreciation}
                    </ThemedText>
                  </View>
                  <View style={s.listCardFooterItem}>
                    <ThemedText style={[s.listCardFooterLabel, { color: colors.textTertiary }]}>
                      Acquired
                    </ThemedText>
                    <ThemedText style={[s.listCardFooterValue, { color: colors.textSecondary }]}>
                      {item.acquiredDate}
                    </ThemedText>
                  </View>
                </View>

                {/* Asset Health Strip */}
                <AssetHealthStrip health={getAssetHealth(item.id)} />
              </Pressable>
            )}
          />
        )}
      </View>
    );
  };

  // ===================================================================
  // LOCATIONS TAB
  // ===================================================================

  const renderLocations = () => {
    return (
      <View style={{ flex: 1 }}>
        <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textSecondary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search locations..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>

        {filteredLocations.length === 0 ? (
          <EmptyState icon="mappin.slash" text="No locations found" colors={colors} />
        ) : (
          <FlatList
            data={filteredLocations}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.listContent}
            renderItem={({ item }) => (
              <Pressable
                style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleLocationPress(item)}
              >
                <View style={s.listCardHeader}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.name}
                    </ThemedText>
                    <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]} numberOfLines={2}>
                      {item.address}
                    </ThemedText>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
                </View>

                <View style={s.listCardBadgeRow}>
                  <LeaseStatusBadge status={item.leaseStatus} />
                </View>

                <View style={s.listCardFooter}>
                  <View style={s.listCardFooterItem}>
                    <ThemedText style={[s.listCardFooterLabel, { color: colors.textTertiary }]}>
                      Assets
                    </ThemedText>
                    <ThemedText style={[s.listCardFooterValue, { color: colors.text }]}>
                      {item.assignedAssets}
                    </ThemedText>
                  </View>
                  <View style={s.listCardFooterItem}>
                    <ThemedText style={[s.listCardFooterLabel, { color: colors.textTertiary }]}>
                      Occupancy
                    </ThemedText>
                    <ThemedText style={[s.listCardFooterValue, { color: accentColor }]}>
                      {item.occupancy}
                    </ThemedText>
                  </View>
                  <View style={s.listCardFooterItem}>
                    <ThemedText style={[s.listCardFooterLabel, { color: colors.textTertiary }]}>
                      Entity
                    </ThemedText>
                    <ThemedText style={[s.listCardFooterValue, { color: colors.textSecondary }]} numberOfLines={1}>
                      {item.entityName}
                    </ThemedText>
                  </View>
                </View>
              </Pressable>
            )}
          />
        )}
      </View>
    );
  };

  // ===================================================================
  // VENDORS TAB
  // ===================================================================

  const renderVendors = () => {
    return (
      <View style={{ flex: 1 }}>
        <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textSecondary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search vendors..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>

        {filteredVendors.length === 0 ? (
          <EmptyState icon="person.2.slash" text="No vendors found" colors={colors} />
        ) : (
          <FlatList
            data={filteredVendors}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.listContent}
            renderItem={({ item }) => (
              <Pressable
                style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleVendorPress(item)}
              >
                <View style={s.listCardHeader}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.name}
                    </ThemedText>
                    <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                      {item.category}
                    </ThemedText>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
                </View>

                <View style={s.listCardBadgeRow}>
                  <VendorContractBadge status={item.contractStatus} />
                </View>

                <View style={s.listCardFooter}>
                  <View style={s.listCardFooterItem}>
                    <ThemedText style={[s.listCardFooterLabel, { color: colors.textTertiary }]}>
                      Spend YTD
                    </ThemedText>
                    <ThemedText style={[s.listCardFooterValue, { color: accentColor }]}>
                      {formatCurrency(item.spendYTD)}
                    </ThemedText>
                  </View>
                  <View style={s.listCardFooterItem}>
                    <ThemedText style={[s.listCardFooterLabel, { color: colors.textTertiary }]}>
                      Rating
                    </ThemedText>
                    <ThemedText
                      style={[
                        s.listCardFooterValue,
                        { color: starColor(item.performanceRating), fontSize: 14 },
                      ]}
                    >
                      {renderStars(item.performanceRating)}
                    </ThemedText>
                  </View>
                  <View style={s.listCardFooterItem}>
                    <ThemedText style={[s.listCardFooterLabel, { color: colors.textTertiary }]}>
                      Entity
                    </ThemedText>
                    <ThemedText style={[s.listCardFooterValue, { color: colors.textSecondary }]} numberOfLines={1}>
                      {item.entityName}
                    </ThemedText>
                  </View>
                </View>
              </Pressable>
            )}
          />
        )}
      </View>
    );
  };

  // ===================================================================
  // MAINTENANCE TAB
  // ===================================================================

  const renderMaintenance = () => {
    return (
      <View style={{ flex: 1 }}>
        <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textSecondary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search maintenance..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>

        {filteredMaintenance.length === 0 ? (
          <EmptyState icon="wrench.and.screwdriver" text="No maintenance items" colors={colors} />
        ) : (
          <FlatList
            data={filteredMaintenance}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.listContent}
            renderItem={({ item }) => (
              <Pressable
                style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleMaintenancePress(item)}
              >
                <View style={s.listCardHeader}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.assetName}
                    </ThemedText>
                    <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                      Assignee: {item.assignee}
                    </ThemedText>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
                </View>

                <View style={s.listCardBadgeRow}>
                  <MaintenanceTypeBadge type={item.type} />
                  <MaintenanceStatusBadge status={item.status} />
                </View>

                <View style={s.listCardFooter}>
                  <View style={s.listCardFooterItem}>
                    <ThemedText style={[s.listCardFooterLabel, { color: colors.textTertiary }]}>
                      Scheduled
                    </ThemedText>
                    <ThemedText style={[s.listCardFooterValue, { color: colors.textSecondary }]}>
                      {item.scheduledDate}
                    </ThemedText>
                  </View>
                  <View style={s.listCardFooterItem}>
                    <ThemedText style={[s.listCardFooterLabel, { color: colors.textTertiary }]}>
                      Cost
                    </ThemedText>
                    <ThemedText style={[s.listCardFooterValue, { color: accentColor }]}>
                      {item.cost !== null ? formatCurrency(item.cost) : '--'}
                    </ThemedText>
                  </View>
                  {item.completedDate && (
                    <View style={s.listCardFooterItem}>
                      <ThemedText style={[s.listCardFooterLabel, { color: colors.textTertiary }]}>
                        Completed
                      </ThemedText>
                      <ThemedText style={[s.listCardFooterValue, { color: '#5A8A6E' }]}>
                        {item.completedDate}
                      </ThemedText>
                    </View>
                  )}
                </View>
              </Pressable>
            )}
          />
        )}
      </View>
    );
  };

  // ===================================================================
  // INSURANCE TAB
  // ===================================================================

  const renderInsurance = () => {
    return (
      <View style={{ flex: 1 }}>
        {/* Expired Policy Alerts */}
        {INSURANCE_ALERTS.filter((a) => a.status === 'expired').length > 0 && (
          <View style={s.insuranceAlert}>
            {INSURANCE_ALERTS.filter((a) => a.status === 'expired').map((alert, idx) => (
              <BizAlertCard
                key={`ins-alert-${idx}`}
                icon="exclamationmark.shield"
                title={`Expired: ${alert.policyType}`}
                subtitle={`${alert.assetName} \u2014 expired ${alert.expiryDate}`}
                variant="error"
              />
            ))}
          </View>
        )}

        <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textSecondary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search insurance..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>

        {filteredInsurance.length === 0 ? (
          <EmptyState icon="shield.checkered" text="No policies found" colors={colors} />
        ) : (
          <FlatList
            data={filteredInsurance}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.listContent}
            renderItem={({ item }) => (
              <Pressable
                style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleInsurancePress(item)}
              >
                <View style={s.listCardHeader}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.policyName}
                    </ThemedText>
                    <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                      {item.entityName}
                    </ThemedText>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
                </View>

                <View style={s.listCardBadgeRow}>
                  <InsuranceTypeBadge type={item.type} />
                  {item.renewalAlert && (
                    <View style={[s.badge, { backgroundColor: '#B8943E20' }]}>
                      <ThemedText style={[s.badgeText, { color: '#B8943E' }]}>Renewal Alert</ThemedText>
                    </View>
                  )}
                  {item.coiTracking && (
                    <View style={[s.badge, { backgroundColor: '#5A8A6E20' }]}>
                      <ThemedText style={[s.badgeText, { color: '#5A8A6E' }]}>COI Tracked</ThemedText>
                    </View>
                  )}
                </View>

                <View style={s.listCardFooter}>
                  <View style={s.listCardFooterItem}>
                    <ThemedText style={[s.listCardFooterLabel, { color: colors.textTertiary }]}>
                      Coverage
                    </ThemedText>
                    <ThemedText style={[s.listCardFooterValue, { color: colors.text }]}>
                      {item.coverage}
                    </ThemedText>
                  </View>
                  <View style={s.listCardFooterItem}>
                    <ThemedText style={[s.listCardFooterLabel, { color: colors.textTertiary }]}>
                      Premium
                    </ThemedText>
                    <ThemedText style={[s.listCardFooterValue, { color: accentColor }]}>
                      {formatCurrency(item.premium)}
                    </ThemedText>
                  </View>
                  <View style={s.listCardFooterItem}>
                    <ThemedText style={[s.listCardFooterLabel, { color: colors.textTertiary }]}>
                      Expires
                    </ThemedText>
                    <ThemedText
                      style={[
                        s.listCardFooterValue,
                        { color: item.renewalAlert ? '#B8943E' : colors.textSecondary },
                      ]}
                    >
                      {item.expiryDate}
                    </ThemedText>
                  </View>
                </View>
              </Pressable>
            )}
          />
        )}
      </View>
    );
  };

  // ===================================================================
  // ACQUISITIONS TAB
  // ===================================================================

  const renderAcquisitions = () => {
    return (
      <View style={{ flex: 1 }}>
        <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textSecondary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search acquisitions..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>

        {filteredAcquisitions.length === 0 ? (
          <EmptyState icon="arrow.triangle.merge" text="No acquisitions found" colors={colors} />
        ) : (
          <FlatList
            data={filteredAcquisitions}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.listContent}
            renderItem={({ item }) => (
              <Pressable
                style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleAcquisitionPress(item)}
              >
                <View style={s.listCardHeader}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.targetName}
                    </ThemedText>
                    <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                      {item.entityName}
                    </ThemedText>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
                </View>

                <View style={s.listCardBadgeRow}>
                  <AcquisitionStageBadge stage={item.stage} />
                </View>

                <ThemedText
                  style={[s.listCardDescription, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {item.description}
                </ThemedText>

                <View style={s.listCardFooter}>
                  <View style={s.listCardFooterItem}>
                    <ThemedText style={[s.listCardFooterLabel, { color: colors.textTertiary }]}>
                      Deal Value
                    </ThemedText>
                    <ThemedText style={[s.listCardFooterValue, { color: accentColor }]}>
                      {formatCurrency(item.dealValue)}
                    </ThemedText>
                  </View>
                  <View style={s.listCardFooterItem}>
                    <ThemedText style={[s.listCardFooterLabel, { color: colors.textTertiary }]}>
                      Last Activity
                    </ThemedText>
                    <ThemedText style={[s.listCardFooterValue, { color: colors.textSecondary }]}>
                      {item.lastActivity}
                    </ThemedText>
                  </View>
                </View>
              </Pressable>
            )}
          />
        )}
      </View>
    );
  };

  // ===================================================================
  // DILIGENCE TAB
  // ===================================================================

  const renderDiligence = () => {
    if (diligenceByAcquisition.length === 0) {
      return <EmptyState icon="checklist" text="No diligence items" colors={colors} />;
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
        {/* Checklist Templates */}
        <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Templates</ThemedText>
        {DILIGENCE_TEMPLATES.map((tpl) => {
          const pct = tpl.itemCount > 0 ? Math.round((tpl.completedCount / tpl.itemCount) * 100) : 0;
          const barClr = pct >= 80 ? '#5A8A6E' : pct >= 40 ? '#B8943E' : '#B85C5C';
          const typeBg = TEMPLATE_TYPE_COLOR[tpl.type] || ACCENT;
          return (
            <View key={tpl.id} style={[s.templateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs }}>
                <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                  {tpl.name}
                </ThemedText>
                <View style={[s.badge, { backgroundColor: typeBg + '20' }]}>
                  <ThemedText style={[s.badgeText, { color: typeBg }]}>{tpl.type.replace('_', ' ')}</ThemedText>
                </View>
              </View>
              <View style={s.templateProgress}>
                <ProgressBar percent={pct} color={barClr} bgColor={colors.border} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <ThemedText style={[s.listCardFooterLabel, { color: colors.textTertiary }]}>
                  {tpl.completedCount}/{tpl.itemCount} items
                </ThemedText>
                <ThemedText style={[s.templateProgressBar, { color: barClr }]}>
                  {pct}%
                </ThemedText>
              </View>
            </View>
          );
        })}

        <View style={{ height: Spacing.lg }} />
        <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Active Checklists</ThemedText>
        {diligenceByAcquisition.map((group) => {
          const completionPercent = Math.round((group.completedCount / group.totalCount) * 100);
          const barColor = completionPercent >= 80 ? '#5A8A6E' : completionPercent >= 50 ? '#B8943E' : '#B85C5C';

          return (
            <View key={group.acquisitionId} style={{ marginBottom: Spacing.lg }}>
              {/* Acquisition header */}
              <View style={s.diligenceGroupHeader}>
                <ThemedText style={[s.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                  {group.acquisitionName}
                </ThemedText>
                <ThemedText style={[s.diligenceCompletionText, { color: colors.textSecondary }]}>
                  {group.completedCount}/{group.totalCount} completed
                </ThemedText>
              </View>

              {/* Progress bar */}
              <View style={{ marginBottom: Spacing.md }}>
                <ProgressBar
                  percent={completionPercent}
                  color={barColor}
                  bgColor={colors.border}
                />
                <ThemedText
                  style={[s.progressLabel, { color: barColor }]}
                >
                  {completionPercent}%
                </ThemedText>
              </View>

              {/* Checklist items */}
              {group.items.map((item) => (
                <View
                  key={item.id}
                  style={[
                    s.diligenceItem,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <View style={s.diligenceCheckboxWrap}>
                    <View
                      style={[
                        s.diligenceCheckbox,
                        {
                          backgroundColor: item.completed ? '#5A8A6E' : 'transparent',
                          borderColor: item.completed ? '#5A8A6E' : colors.textTertiary,
                        },
                      ]}
                    >
                      {item.completed && (
                        <IconSymbol name="checkmark" size={10} color="#FFFFFF" />
                      )}
                    </View>
                  </View>

                  <View style={{ flex: 1 }}>
                    <ThemedText
                      style={[
                        s.diligenceItemText,
                        {
                          color: item.completed ? colors.textSecondary : colors.text,
                          textDecorationLine: item.completed ? 'line-through' : 'none',
                        },
                      ]}
                    >
                      {item.item}
                    </ThemedText>
                    <View style={s.diligenceItemMeta}>
                      <View style={[s.badge, { backgroundColor: `${ACCENT}20` }]}>
                        <ThemedText style={[s.badgeText, { color: ACCENT }]}>
                          {item.category}
                        </ThemedText>
                      </View>
                      {item.linkedDocumentId && (
                        <View style={[s.badge, { backgroundColor: `${ACCENT}20` }]}>
                          <ThemedText style={[s.badgeText, { color: ACCENT }]}>
                            Linked Doc
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    );
  };

  // ===================================================================
  // REQUESTS TAB
  // ===================================================================

  const renderRequests = () => {
    return (
      <View style={{ flex: 1 }}>
        <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textSecondary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search requests..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>

        {filteredRequests.length === 0 ? (
          <EmptyState icon="envelope.open" text="No requests found" colors={colors} />
        ) : (
          <FlatList
            data={filteredRequests}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.listContent}
            renderItem={({ item }) => (
              <Pressable
                style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleRequestPress(item)}
              >
                <View style={s.listCardHeader}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={2}>
                      {item.title}
                    </ThemedText>
                    <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                      {item.entityName}
                    </ThemedText>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
                </View>

                <View style={s.listCardBadgeRow}>
                  <RequestTypeBadge type={item.type} />
                  <RequestStatusBadge status={item.status} />
                </View>

                <View style={s.listCardFooter}>
                  <View style={s.listCardFooterItem}>
                    <ThemedText style={[s.listCardFooterLabel, { color: colors.textTertiary }]}>
                      Amount
                    </ThemedText>
                    <ThemedText style={[s.listCardFooterValue, { color: accentColor }]}>
                      {item.amount > 0 ? formatCurrency(item.amount) : '--'}
                    </ThemedText>
                  </View>
                  <View style={s.listCardFooterItem}>
                    <ThemedText style={[s.listCardFooterLabel, { color: colors.textTertiary }]}>
                      Requested By
                    </ThemedText>
                    <ThemedText style={[s.listCardFooterValue, { color: colors.textSecondary }]}>
                      {item.requestedBy}
                    </ThemedText>
                  </View>
                  <View style={s.listCardFooterItem}>
                    <ThemedText style={[s.listCardFooterLabel, { color: colors.textTertiary }]}>
                      Date
                    </ThemedText>
                    <ThemedText style={[s.listCardFooterValue, { color: colors.textSecondary }]}>
                      {item.date}
                    </ThemedText>
                  </View>
                </View>

                {/* Request Lifecycle Indicator */}
                <RequestLifecycleBar currentStage={item.requestLifecycle} />
              </Pressable>
            )}
          />
        )}
      </View>
    );
  };

  // ===================================================================
  // EXPORTS TAB
  // ===================================================================

  const renderExports = () => {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
        <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Export Options</ThemedText>
        <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
          Generate and download asset reports in various formats.
        </ThemedText>

        {data.exportOptions.map((opt) => (
          <Pressable
            key={opt.id}
            style={[s.exportCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <View style={[s.exportIconWrap, { backgroundColor: EXPORT_FORMAT_COLOR[opt.format] + '15' }]}>
              <IconSymbol name={opt.icon as any} size={20} color={EXPORT_FORMAT_COLOR[opt.format]} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.exportCardHeader}>
                <ThemedText style={[s.exportCardTitle, { color: colors.text }]}>
                  {opt.label}
                </ThemedText>
                <ExportFormatBadge format={opt.format} />
              </View>
              <ThemedText style={[s.exportCardDesc, { color: colors.textSecondary }]}>
                {opt.description}
              </ThemedText>
            </View>
            <IconSymbol name="square.and.arrow.down" size={18} color={accentColor} />
          </Pressable>
        ))}
      </ScrollView>
    );
  };

  // ===================================================================
  // BOTTOM SHEETS
  // ===================================================================

  const renderAssetDetailSheet = () => (
    <BottomSheet
      visible={assetDetailVisible}
      onClose={() => setAssetDetailVisible(false)}
      title="Asset Details"
      useModal
    >
      {selectedAsset && (
        <View style={s.detailContainer}>
          <ThemedText style={[s.detailTitle, { color: colors.text }]}>
            {selectedAsset.name}
          </ThemedText>

          <View style={s.detailBadgeRow}>
            <AssetTypeBadge type={selectedAsset.type} />
            <AssetStatusBadge status={selectedAsset.status} />
          </View>

          {/* Value Card */}
          <View style={s.detailValueGrid}>
            <View style={[s.detailValueCard, { backgroundColor: accentColor + '10' }]}>
              <ThemedText style={[s.detailValueNumber, { color: accentColor }]}>
                {formatCurrency(selectedAsset.value)}
              </ThemedText>
              <ThemedText style={[s.detailValueLabel, { color: colors.textSecondary }]}>
                Current Value
              </ThemedText>
            </View>
          </View>

          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Entity</ThemedText>
            <ThemedText style={[s.detailValue, { color: colors.text }]}>
              {selectedAsset.entityName}
            </ThemedText>
          </View>
          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Depreciation</ThemedText>
            <ThemedText style={[s.detailValue, { color: colors.text }]}>
              {selectedAsset.depreciation}
            </ThemedText>
          </View>
          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Acquired</ThemedText>
            <ThemedText style={[s.detailValue, { color: colors.text }]}>
              {selectedAsset.acquiredDate}
            </ThemedText>
          </View>

          <View style={[s.detailDescBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <ThemedText style={[s.detailDescLabel, { color: colors.textTertiary }]}>
              Description
            </ThemedText>
            <ThemedText style={[s.detailDescText, { color: colors.textSecondary }]}>
              {selectedAsset.description}
            </ThemedText>
          </View>

          <View style={s.detailActions}>
            <Pressable
              style={[s.detailActionBtn, { backgroundColor: accentColor + '15' }]}
              onPress={() => setAssetDetailVisible(false)}
            >
              <IconSymbol name="pencil" size={14} color={accentColor} />
              <ThemedText style={[s.detailActionText, { color: accentColor }]}>Edit</ThemedText>
            </Pressable>
            <Pressable
              style={[s.detailActionBtn, { backgroundColor: '#B85C5C15' }]}
              onPress={() => setAssetDetailVisible(false)}
            >
              <IconSymbol name="trash" size={14} color="#B85C5C" />
              <ThemedText style={[s.detailActionText, { color: '#B85C5C' }]}>Dispose</ThemedText>
            </Pressable>
          </View>
        </View>
      )}
    </BottomSheet>
  );

  const renderLocationDetailSheet = () => (
    <BottomSheet
      visible={locationDetailVisible}
      onClose={() => setLocationDetailVisible(false)}
      title="Location Details"
      useModal
    >
      {selectedLocation && (
        <View style={s.detailContainer}>
          <ThemedText style={[s.detailTitle, { color: colors.text }]}>
            {selectedLocation.name}
          </ThemedText>

          <View style={s.detailBadgeRow}>
            <LeaseStatusBadge status={selectedLocation.leaseStatus} />
          </View>

          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Address</ThemedText>
            <ThemedText style={[s.detailValue, { color: colors.text, flex: 1, textAlign: 'right' }]}>
              {selectedLocation.address}
            </ThemedText>
          </View>
          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Entity</ThemedText>
            <ThemedText style={[s.detailValue, { color: colors.text }]}>
              {selectedLocation.entityName}
            </ThemedText>
          </View>
          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Assigned Assets</ThemedText>
            <ThemedText style={[s.detailValue, { color: accentColor }]}>
              {selectedLocation.assignedAssets}
            </ThemedText>
          </View>
          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Occupancy</ThemedText>
            <ThemedText style={[s.detailValue, { color: accentColor }]}>
              {selectedLocation.occupancy}
            </ThemedText>
          </View>

          <View style={s.detailActions}>
            <Pressable
              style={[s.detailActionBtn, { backgroundColor: accentColor + '15' }]}
              onPress={() => setLocationDetailVisible(false)}
            >
              <IconSymbol name="pencil" size={14} color={accentColor} />
              <ThemedText style={[s.detailActionText, { color: accentColor }]}>Edit</ThemedText>
            </Pressable>
            <Pressable
              style={[s.detailActionBtn, { backgroundColor: `${ACCENT}15` }]}
              onPress={() => setLocationDetailVisible(false)}
            >
              <IconSymbol name="map" size={14} color={ACCENT} />
              <ThemedText style={[s.detailActionText, { color: ACCENT }]}>View Map</ThemedText>
            </Pressable>
          </View>
        </View>
      )}
    </BottomSheet>
  );

  const renderVendorDetailSheet = () => (
    <BottomSheet
      visible={vendorDetailVisible}
      onClose={() => setVendorDetailVisible(false)}
      title="Vendor Details"
      useModal
    >
      {selectedVendor && (
        <View style={s.detailContainer}>
          <ThemedText style={[s.detailTitle, { color: colors.text }]}>
            {selectedVendor.name}
          </ThemedText>

          <View style={s.detailBadgeRow}>
            <VendorContractBadge status={selectedVendor.contractStatus} />
          </View>

          <View style={s.detailValueGrid}>
            <View style={[s.detailValueCard, { backgroundColor: accentColor + '10' }]}>
              <ThemedText style={[s.detailValueNumber, { color: accentColor }]}>
                {formatCurrency(selectedVendor.spendYTD)}
              </ThemedText>
              <ThemedText style={[s.detailValueLabel, { color: colors.textSecondary }]}>
                Spend YTD
              </ThemedText>
            </View>
            <View style={[s.detailValueCard, { backgroundColor: starColor(selectedVendor.performanceRating) + '10' }]}>
              <ThemedText style={[s.detailValueNumber, { color: starColor(selectedVendor.performanceRating) }]}>
                {selectedVendor.performanceRating}/5
              </ThemedText>
              <ThemedText style={[s.detailValueLabel, { color: colors.textSecondary }]}>
                Rating
              </ThemedText>
            </View>
          </View>

          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Category</ThemedText>
            <ThemedText style={[s.detailValue, { color: colors.text }]}>
              {selectedVendor.category}
            </ThemedText>
          </View>
          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Entity</ThemedText>
            <ThemedText style={[s.detailValue, { color: colors.text }]}>
              {selectedVendor.entityName}
            </ThemedText>
          </View>
          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Performance</ThemedText>
            <ThemedText
              style={[
                s.detailValue,
                { color: starColor(selectedVendor.performanceRating), fontSize: 16 },
              ]}
            >
              {renderStars(selectedVendor.performanceRating)}
            </ThemedText>
          </View>

          <View style={s.detailActions}>
            <Pressable
              style={[s.detailActionBtn, { backgroundColor: accentColor + '15' }]}
              onPress={() => setVendorDetailVisible(false)}
            >
              <IconSymbol name="pencil" size={14} color={accentColor} />
              <ThemedText style={[s.detailActionText, { color: accentColor }]}>Edit</ThemedText>
            </Pressable>
            <Pressable
              style={[s.detailActionBtn, { backgroundColor: `${ACCENT}15` }]}
              onPress={() => setVendorDetailVisible(false)}
            >
              <IconSymbol name="doc.text" size={14} color={ACCENT} />
              <ThemedText style={[s.detailActionText, { color: ACCENT }]}>View Contract</ThemedText>
            </Pressable>
          </View>
        </View>
      )}
    </BottomSheet>
  );

  const renderMaintenanceDetailSheet = () => (
    <BottomSheet
      visible={maintenanceDetailVisible}
      onClose={() => setMaintenanceDetailVisible(false)}
      title="Maintenance Details"
      useModal
    >
      {selectedMaintenance && (
        <View style={s.detailContainer}>
          <ThemedText style={[s.detailTitle, { color: colors.text }]}>
            {selectedMaintenance.assetName}
          </ThemedText>

          <View style={s.detailBadgeRow}>
            <MaintenanceTypeBadge type={selectedMaintenance.type} />
            <MaintenanceStatusBadge status={selectedMaintenance.status} />
          </View>

          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Scheduled Date</ThemedText>
            <ThemedText style={[s.detailValue, { color: colors.text }]}>
              {selectedMaintenance.scheduledDate}
            </ThemedText>
          </View>
          {selectedMaintenance.completedDate && (
            <View style={s.detailRow}>
              <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Completed Date</ThemedText>
              <ThemedText style={[s.detailValue, { color: '#5A8A6E' }]}>
                {selectedMaintenance.completedDate}
              </ThemedText>
            </View>
          )}
          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Cost</ThemedText>
            <ThemedText style={[s.detailValue, { color: accentColor }]}>
              {selectedMaintenance.cost !== null ? formatCurrency(selectedMaintenance.cost) : 'TBD'}
            </ThemedText>
          </View>
          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Assignee</ThemedText>
            <ThemedText style={[s.detailValue, { color: colors.text }]}>
              {selectedMaintenance.assignee}
            </ThemedText>
          </View>

          <View style={s.detailActions}>
            <Pressable
              style={[s.detailActionBtn, { backgroundColor: '#5A8A6E15' }]}
              onPress={() => setMaintenanceDetailVisible(false)}
            >
              <IconSymbol name="checkmark.circle" size={14} color="#5A8A6E" />
              <ThemedText style={[s.detailActionText, { color: '#5A8A6E' }]}>Mark Complete</ThemedText>
            </Pressable>
            <Pressable
              style={[s.detailActionBtn, { backgroundColor: accentColor + '15' }]}
              onPress={() => setMaintenanceDetailVisible(false)}
            >
              <IconSymbol name="calendar" size={14} color={accentColor} />
              <ThemedText style={[s.detailActionText, { color: accentColor }]}>Reschedule</ThemedText>
            </Pressable>
          </View>
        </View>
      )}
    </BottomSheet>
  );

  const renderInsuranceDetailSheet = () => (
    <BottomSheet
      visible={insuranceDetailVisible}
      onClose={() => setInsuranceDetailVisible(false)}
      title="Insurance Policy"
      useModal
    >
      {selectedInsurance && (
        <View style={s.detailContainer}>
          <ThemedText style={[s.detailTitle, { color: colors.text }]}>
            {selectedInsurance.policyName}
          </ThemedText>

          <View style={s.detailBadgeRow}>
            <InsuranceTypeBadge type={selectedInsurance.type} />
            {selectedInsurance.renewalAlert && (
              <View style={[s.badge, { backgroundColor: '#B8943E20' }]}>
                <ThemedText style={[s.badgeText, { color: '#B8943E' }]}>Renewal Alert</ThemedText>
              </View>
            )}
            {selectedInsurance.coiTracking && (
              <View style={[s.badge, { backgroundColor: '#5A8A6E20' }]}>
                <ThemedText style={[s.badgeText, { color: '#5A8A6E' }]}>COI Tracked</ThemedText>
              </View>
            )}
          </View>

          <View style={s.detailValueGrid}>
            <View style={[s.detailValueCard, { backgroundColor: accentColor + '10' }]}>
              <ThemedText style={[s.detailValueNumber, { color: accentColor }]}>
                {selectedInsurance.coverage}
              </ThemedText>
              <ThemedText style={[s.detailValueLabel, { color: colors.textSecondary }]}>
                Coverage
              </ThemedText>
            </View>
            <View style={[s.detailValueCard, { backgroundColor: '#B8943E10' }]}>
              <ThemedText style={[s.detailValueNumber, { color: '#B8943E' }]}>
                {formatCurrency(selectedInsurance.premium)}
              </ThemedText>
              <ThemedText style={[s.detailValueLabel, { color: colors.textSecondary }]}>
                Annual Premium
              </ThemedText>
            </View>
          </View>

          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Entity</ThemedText>
            <ThemedText style={[s.detailValue, { color: colors.text }]}>
              {selectedInsurance.entityName}
            </ThemedText>
          </View>
          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Expiry Date</ThemedText>
            <ThemedText
              style={[
                s.detailValue,
                { color: selectedInsurance.renewalAlert ? '#B8943E' : colors.text },
              ]}
            >
              {selectedInsurance.expiryDate}
            </ThemedText>
          </View>

          <View style={s.detailActions}>
            <Pressable
              style={[s.detailActionBtn, { backgroundColor: '#5A8A6E15' }]}
              onPress={() => setInsuranceDetailVisible(false)}
            >
              <IconSymbol name="arrow.clockwise" size={14} color="#5A8A6E" />
              <ThemedText style={[s.detailActionText, { color: '#5A8A6E' }]}>Renew</ThemedText>
            </Pressable>
            <Pressable
              style={[s.detailActionBtn, { backgroundColor: `${ACCENT}15` }]}
              onPress={() => setInsuranceDetailVisible(false)}
            >
              <IconSymbol name="doc.text" size={14} color={ACCENT} />
              <ThemedText style={[s.detailActionText, { color: ACCENT }]}>View Policy</ThemedText>
            </Pressable>
          </View>
        </View>
      )}
    </BottomSheet>
  );

  const renderAcquisitionDetailSheet = () => (
    <BottomSheet
      visible={acquisitionDetailVisible}
      onClose={() => setAcquisitionDetailVisible(false)}
      title="Acquisition Details"
      useModal
    >
      {selectedAcquisition && (
        <View style={s.detailContainer}>
          <ThemedText style={[s.detailTitle, { color: colors.text }]}>
            {selectedAcquisition.targetName}
          </ThemedText>

          <View style={s.detailBadgeRow}>
            <AcquisitionStageBadge stage={selectedAcquisition.stage} />
          </View>

          <View style={s.detailValueGrid}>
            <View style={[s.detailValueCard, { backgroundColor: accentColor + '10' }]}>
              <ThemedText style={[s.detailValueNumber, { color: accentColor }]}>
                {formatCurrency(selectedAcquisition.dealValue)}
              </ThemedText>
              <ThemedText style={[s.detailValueLabel, { color: colors.textSecondary }]}>
                Deal Value
              </ThemedText>
            </View>
          </View>

          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Entity</ThemedText>
            <ThemedText style={[s.detailValue, { color: colors.text }]}>
              {selectedAcquisition.entityName}
            </ThemedText>
          </View>
          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Last Activity</ThemedText>
            <ThemedText style={[s.detailValue, { color: colors.text }]}>
              {selectedAcquisition.lastActivity}
            </ThemedText>
          </View>

          <View style={[s.detailDescBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <ThemedText style={[s.detailDescLabel, { color: colors.textTertiary }]}>
              Description
            </ThemedText>
            <ThemedText style={[s.detailDescText, { color: colors.textSecondary }]}>
              {selectedAcquisition.description}
            </ThemedText>
          </View>

          {/* Diligence progress for this acquisition */}
          {(() => {
            const group = diligenceByAcquisition.find(
              (g) => g.acquisitionId === selectedAcquisition.id,
            );
            if (!group) return null;
            const pct = Math.round((group.completedCount / group.totalCount) * 100);
            const barClr = pct >= 80 ? '#5A8A6E' : pct >= 50 ? '#B8943E' : '#B85C5C';
            return (
              <View style={{ alignSelf: 'stretch', marginTop: Spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>
                    Diligence Progress
                  </ThemedText>
                  <ThemedText style={[s.detailValue, { color: barClr }]}>
                    {group.completedCount}/{group.totalCount} ({pct}%)
                  </ThemedText>
                </View>
                <ProgressBar percent={pct} color={barClr} bgColor={colors.border} />
              </View>
            );
          })()}

          <View style={s.detailActions}>
            <Pressable
              style={[s.detailActionBtn, { backgroundColor: accentColor + '15' }]}
              onPress={() => {
                setAcquisitionDetailVisible(false);
                setActiveTab('diligence');
              }}
            >
              <IconSymbol name="checklist" size={14} color={accentColor} />
              <ThemedText style={[s.detailActionText, { color: accentColor }]}>View Diligence</ThemedText>
            </Pressable>
            <Pressable
              style={[s.detailActionBtn, { backgroundColor: `${ACCENT}15` }]}
              onPress={() => setAcquisitionDetailVisible(false)}
            >
              <IconSymbol name="doc.text" size={14} color={ACCENT} />
              <ThemedText style={[s.detailActionText, { color: ACCENT }]}>View Deal Memo</ThemedText>
            </Pressable>
          </View>
        </View>
      )}
    </BottomSheet>
  );

  const renderRequestDetailSheet = () => (
    <BottomSheet
      visible={requestDetailVisible}
      onClose={() => setRequestDetailVisible(false)}
      title="Request Details"
      useModal
    >
      {selectedRequest && (
        <View style={s.detailContainer}>
          <ThemedText style={[s.detailTitle, { color: colors.text }]}>
            {selectedRequest.title}
          </ThemedText>

          <View style={s.detailBadgeRow}>
            <RequestTypeBadge type={selectedRequest.type} />
            <RequestStatusBadge status={selectedRequest.status} />
          </View>

          {selectedRequest.amount > 0 && (
            <View style={s.detailValueGrid}>
              <View style={[s.detailValueCard, { backgroundColor: accentColor + '10' }]}>
                <ThemedText style={[s.detailValueNumber, { color: accentColor }]}>
                  {formatCurrency(selectedRequest.amount)}
                </ThemedText>
                <ThemedText style={[s.detailValueLabel, { color: colors.textSecondary }]}>
                  Amount
                </ThemedText>
              </View>
            </View>
          )}

          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Requested By</ThemedText>
            <ThemedText style={[s.detailValue, { color: colors.text }]}>
              {selectedRequest.requestedBy}
            </ThemedText>
          </View>
          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Entity</ThemedText>
            <ThemedText style={[s.detailValue, { color: colors.text }]}>
              {selectedRequest.entityName}
            </ThemedText>
          </View>
          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Date</ThemedText>
            <ThemedText style={[s.detailValue, { color: colors.text }]}>
              {selectedRequest.date}
            </ThemedText>
          </View>

          {selectedRequest.status === 'pending' && (
            <View style={s.detailActions}>
              <Pressable
                style={[s.detailActionBtn, { backgroundColor: '#5A8A6E15' }]}
                onPress={() => setRequestDetailVisible(false)}
              >
                <IconSymbol name="checkmark.circle" size={14} color="#5A8A6E" />
                <ThemedText style={[s.detailActionText, { color: '#5A8A6E' }]}>Approve</ThemedText>
              </Pressable>
              <Pressable
                style={[s.detailActionBtn, { backgroundColor: '#B85C5C15' }]}
                onPress={() => setRequestDetailVisible(false)}
              >
                <IconSymbol name="xmark.circle" size={14} color="#B85C5C" />
                <ThemedText style={[s.detailActionText, { color: '#B85C5C' }]}>Reject</ThemedText>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </BottomSheet>
  );

  // ===================================================================
  // MAIN RENDER
  // ===================================================================

  // RBAC-aware sub-tabs: investor/B5 see overview only
  const subTabs = useMemo(() => {
    const all = BIZ_ASSETS_TABS.map((t) => ({ id: t.id, label: t.label }));
    if (isFounder(role) || isBoardLevel(role)) return all;
    // Investor / B5: overview + registry only
    return all.filter((t) => t.id === 'overview' || t.id === 'registry');
  }, [role]);

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <ThemedText style={[s.headerTitle, { color: colors.text }]}>Assets</ThemedText>
        </View>

        {/* Sub-tab bar */}
        <BizSubTabBar tabs={subTabs} activeId={activeTab} onSelect={handleTabPress} />
      </View>

      {/* Tab content */}
      <View style={{ flex: 1, paddingHorizontal: Spacing.md }}>
        {renderTabContent()}
      </View>

      {/* Bottom sheets */}
      {renderAssetDetailSheet()}
      {renderLocationDetailSheet()}
      {renderVendorDetailSheet()}
      {renderMaintenanceDetailSheet()}
      {renderInsuranceDetailSheet()}
      {renderAcquisitionDetailSheet()}
      {renderRequestDetailSheet()}
    </View>
  );
}

// =============================================================================
// EXPORT ALIAS
// =============================================================================

export { BizOrgAssetsV2 as BizOrgAssetsTab };

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // === Layout ===
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  tabScroll: {
    paddingBottom: Spacing.xxl,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },

  // === Search ===
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    height: 36,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },

  // === Filter Chips ===
  filterChipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
    paddingRight: Spacing.md,
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

  // === Section ===
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: Spacing.md,
    marginTop: -4,
  },

  // === Stat Grid (Overview) ===
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    width: '48%' as any,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  statCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statCardValue: {
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },

  // === Alert Card ===
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  alertIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  alertSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // === Summary Row ===
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // === List Card ===
  listCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  listCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  listCardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  listCardSub: {
    fontSize: 12,
    marginTop: 2,
  },
  listCardBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  listCardDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  listCardFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  listCardFooterItem: {
    gap: 2,
  },
  listCardFooterLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  listCardFooterValue: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // === Badge ===
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // === Empty State ===
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },

  // === Progress Bar ===
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 2,
  },

  // === Diligence ===
  diligenceGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  diligenceCompletionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  diligenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
  },
  diligenceCheckboxWrap: {
    paddingTop: 2,
  },
  diligenceCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diligenceItemText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  diligenceItemMeta: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },

  // === Export Card ===
  exportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  exportIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  exportCardTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  exportCardDesc: {
    fontSize: 12,
    lineHeight: 17,
  },

  // === Detail Sheet ===
  detailContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  detailBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  detailValueGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignSelf: 'stretch',
    marginVertical: Spacing.sm,
  },
  detailValueCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  detailValueNumber: {
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  detailValueLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailDescBox: {
    alignSelf: 'stretch',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginTop: Spacing.xs,
  },
  detailDescLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  detailDescText: {
    fontSize: 13,
    lineHeight: 19,
  },
  detailActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  detailActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
  },
  detailActionText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // === Asset Health Strip ===
  assetHealthStrip: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#FFFFFF10',
  },
  assetHealthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assetHealthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  assetHealthLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // === Insurance Alert ===
  insuranceAlert: {
    marginBottom: Spacing.sm,
  },

  // === Diligence Template Card ===
  templateCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  templateProgress: {
    marginBottom: Spacing.xs,
  },
  templateProgressBar: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // === Request Lifecycle ===
  lifecycleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#FFFFFF10',
  },
  lifecycleStep: {
    alignItems: 'center',
    gap: 3,
  },
  lifecycleStepActive: {},
  lifecycleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  lifecycleLine: {
    height: 2,
    width: 16,
    borderRadius: 1,
    marginHorizontal: 2,
    marginBottom: 14,
  },
  lifecycleLabel: {
    fontSize: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
});
