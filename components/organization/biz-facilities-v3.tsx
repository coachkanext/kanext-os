/**
 * Business Organization Facilities Tab -- V3
 * 3-pill ViewBar: Spaces | Assets | Vendors
 * KaNeXT founder view. All data inline.
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

// =============================================================================
// TYPES
// =============================================================================

type ViewMode = 'spaces' | 'assets' | 'vendors';

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// INLINE DATA
// =============================================================================

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: 'spaces', label: 'Spaces' },
  { id: 'assets', label: 'Assets' },
  { id: 'vendors', label: 'Vendors' },
];

// Spaces
const SPACES = [
  {
    id: 'sp1',
    name: 'WeWork Miami',
    type: 'Co-working',
    address: '1111 Brickell Ave, Miami, FL 33131',
    monthly: '$800/mo',
    status: 'active' as const,
    lease: 'Month-to-month',
    capacity: '4 desks',
    notes: 'Hot desk membership, meeting room access included',
  },
  {
    id: 'sp2',
    name: 'Home Office',
    type: 'Remote HQ',
    address: 'Miami, FL',
    monthly: '$0',
    status: 'active' as const,
    lease: 'N/A',
    capacity: 'Primary workspace',
    notes: 'Founder primary workspace, dedicated setup',
  },
];

// Assets
const ASSETS = [
  { id: 'a1', name: 'MacBook Pro M3 Max', assignedTo: 'Sammy Kalejaiye', purchaseDate: 'Jan 2024', condition: 'Excellent', value: '$3,499' },
  { id: 'a2', name: 'MacBook Pro M2 Pro', assignedTo: 'Marcus Chen', purchaseDate: 'Jun 2024', condition: 'Excellent', value: '$2,499' },
  { id: 'a3', name: 'LG UltraFine 5K Display', assignedTo: 'Sammy Kalejaiye', purchaseDate: 'Jan 2024', condition: 'Good', value: '$1,299' },
  { id: 'a4', name: 'Dell U2723QE Monitor', assignedTo: 'Marcus Chen', purchaseDate: 'Jun 2024', condition: 'Good', value: '$619' },
  { id: 'a5', name: 'iPad Pro 12.9" M2', assignedTo: 'Aisha Williams', purchaseDate: 'Aug 2024', condition: 'Excellent', value: '$1,099' },
  { id: 'a6', name: 'iPhone 15 Pro', assignedTo: 'Sammy Kalejaiye', purchaseDate: 'Sep 2024', condition: 'Excellent', value: '$999' },
];

// Vendors
const VENDORS = [
  { id: 'v1', name: 'AWS', service: 'Cloud Infrastructure', monthly: '$1,200/mo', contract: '$14,400/yr', terms: 'On-demand', status: 'active' as const },
  { id: 'v2', name: 'Vercel', service: 'Hosting & Deployment', monthly: '$20/mo', contract: '$240/yr', terms: 'Monthly', status: 'active' as const },
  { id: 'v3', name: 'Figma', service: 'Design Tools', monthly: '$45/mo', contract: '$540/yr', terms: 'Annual', status: 'active' as const },
  { id: 'v4', name: 'Linear', service: 'Project Management', monthly: '$40/mo', contract: '$480/yr', terms: 'Monthly', status: 'active' as const },
  { id: 'v5', name: 'OpenAI', service: 'AI / LLM Services', monthly: '$200/mo', contract: '$2,400/yr', terms: 'Usage-based', status: 'active' as const },
];

const CONDITION_COLORS: Record<string, string> = {
  Excellent: '#22C55E',
  Good: '#3B82F6',
  Fair: '#F59E0B',
  Poor: '#EF4444',
};

const STATUS_COLORS: Record<string, string> = {
  active: '#22C55E',
};

// =============================================================================
// HELPERS
// =============================================================================

function getTotalAssetValue(): string {
  const total = ASSETS.reduce((sum, a) => {
    const val = parseInt(a.value.replace(/[$,]/g, ''), 10);
    return sum + val;
  }, 0);
  return `$${total.toLocaleString()}`;
}

function getTotalMonthlyVendor(): string {
  const total = VENDORS.reduce((sum, v) => {
    const val = parseInt(v.monthly.replace(/[$,/mo]/g, ''), 10);
    return sum + val;
  }, 0);
  return `$${total.toLocaleString()}/mo`;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function BizFacilities({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewMode>('spaces');

  const handleViewPress = useCallback((id: ViewMode) => {
    Haptics.selectionAsync();
    setActiveView(id);
  }, []);

  // ---------------------------------------------------------------------------
  // SPACES
  // ---------------------------------------------------------------------------
  const renderSpaces = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>WORKSPACES ({SPACES.length})</ThemedText>
      {SPACES.map((space) => (
        <View key={space.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}>
          <View style={s.spaceHeader}>
            <View style={[s.spaceIcon, { backgroundColor: accentColor + '15' }]}>
              <IconSymbol name="mappin.and.ellipse" size={18} color={accentColor} />
            </View>
            <View style={s.spaceHeaderInfo}>
              <ThemedText style={[s.spaceName, { color: colors.text }]}>{space.name}</ThemedText>
              <ThemedText style={[s.spaceType, { color: colors.textSecondary }]}>{space.type}</ThemedText>
            </View>
            <View style={[s.statusBadge, { backgroundColor: '#22C55E20' }]}>
              <ThemedText style={[s.statusBadgeText, { color: '#22C55E' }]}>ACTIVE</ThemedText>
            </View>
          </View>

          <View style={[s.spaceDetails, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
            <View style={s.spaceDetailRow}>
              <ThemedText style={[s.spaceDetailLabel, { color: colors.textSecondary }]}>Address</ThemedText>
              <ThemedText style={[s.spaceDetailValue, { color: colors.text }]} numberOfLines={1}>{space.address}</ThemedText>
            </View>
            <View style={s.spaceDetailRow}>
              <ThemedText style={[s.spaceDetailLabel, { color: colors.textSecondary }]}>Cost</ThemedText>
              <ThemedText style={[s.spaceDetailValue, { color: colors.text }]}>{space.monthly}</ThemedText>
            </View>
            <View style={s.spaceDetailRow}>
              <ThemedText style={[s.spaceDetailLabel, { color: colors.textSecondary }]}>Lease</ThemedText>
              <ThemedText style={[s.spaceDetailValue, { color: colors.text }]}>{space.lease}</ThemedText>
            </View>
            <View style={s.spaceDetailRow}>
              <ThemedText style={[s.spaceDetailLabel, { color: colors.textSecondary }]}>Capacity</ThemedText>
              <ThemedText style={[s.spaceDetailValue, { color: colors.text }]}>{space.capacity}</ThemedText>
            </View>
          </View>

          <ThemedText style={[s.spaceNotes, { color: colors.textSecondary }]}>{space.notes}</ThemedText>
        </View>
      ))}
    </ScrollView>
  );

  // ---------------------------------------------------------------------------
  // ASSETS
  // ---------------------------------------------------------------------------
  const renderAssets = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Summary */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.assetSummaryRow}>
          <View style={s.assetSummaryItem}>
            <ThemedText style={[s.assetSummaryValue, { color: colors.text }]}>{ASSETS.length}</ThemedText>
            <ThemedText style={[s.assetSummaryLabel, { color: colors.textSecondary }]}>Total Assets</ThemedText>
          </View>
          <View style={s.assetSummaryItem}>
            <ThemedText style={[s.assetSummaryValue, { color: accentColor }]}>{getTotalAssetValue()}</ThemedText>
            <ThemedText style={[s.assetSummaryLabel, { color: colors.textSecondary }]}>Total Value</ThemedText>
          </View>
        </View>
      </View>

      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>INVENTORY</ThemedText>
      {ASSETS.map((asset) => {
        const condColor = CONDITION_COLORS[asset.condition] ?? colors.textSecondary;
        return (
          <View key={asset.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}>
            <View style={s.assetHeader}>
              <View style={s.assetInfo}>
                <ThemedText style={[s.assetName, { color: colors.text }]}>{asset.name}</ThemedText>
                <ThemedText style={[s.assetAssigned, { color: colors.textSecondary }]}>Assigned: {asset.assignedTo}</ThemedText>
              </View>
              <ThemedText style={[s.assetValue, { color: colors.text }]}>{asset.value}</ThemedText>
            </View>
            <View style={[s.assetMeta, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
              <ThemedText style={[s.assetMetaText, { color: colors.textSecondary }]}>Purchased: {asset.purchaseDate}</ThemedText>
              <View style={[s.statusBadge, { backgroundColor: condColor + '20' }]}>
                <ThemedText style={[s.statusBadgeText, { color: condColor }]}>{asset.condition.toUpperCase()}</ThemedText>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  // ---------------------------------------------------------------------------
  // VENDORS
  // ---------------------------------------------------------------------------
  const renderVendors = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Summary */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.vendorSummaryRow}>
          <View style={s.vendorSummaryItem}>
            <ThemedText style={[s.vendorSummaryValue, { color: colors.text }]}>{VENDORS.length}</ThemedText>
            <ThemedText style={[s.vendorSummaryLabel, { color: colors.textSecondary }]}>Vendors</ThemedText>
          </View>
          <View style={s.vendorSummaryItem}>
            <ThemedText style={[s.vendorSummaryValue, { color: '#EF4444' }]}>{getTotalMonthlyVendor()}</ThemedText>
            <ThemedText style={[s.vendorSummaryLabel, { color: colors.textSecondary }]}>Monthly Spend</ThemedText>
          </View>
        </View>
      </View>

      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>ACTIVE VENDORS</ThemedText>
      {VENDORS.map((vendor) => (
        <View key={vendor.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}>
          <View style={s.vendorHeader}>
            <View style={[s.vendorIcon, { backgroundColor: accentColor + '15' }]}>
              <IconSymbol name="briefcase.fill" size={16} color={accentColor} />
            </View>
            <View style={s.vendorHeaderInfo}>
              <ThemedText style={[s.vendorName, { color: colors.text }]}>{vendor.name}</ThemedText>
              <ThemedText style={[s.vendorService, { color: colors.textSecondary }]}>{vendor.service}</ThemedText>
            </View>
            <ThemedText style={[s.vendorMonthly, { color: '#EF4444' }]}>{vendor.monthly}</ThemedText>
          </View>

          <View style={[s.vendorDetails, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
            <View style={s.vendorDetailRow}>
              <ThemedText style={[s.vendorDetailLabel, { color: colors.textSecondary }]}>Annual Value</ThemedText>
              <ThemedText style={[s.vendorDetailValue, { color: colors.text }]}>{vendor.contract}</ThemedText>
            </View>
            <View style={s.vendorDetailRow}>
              <ThemedText style={[s.vendorDetailLabel, { color: colors.textSecondary }]}>Terms</ThemedText>
              <ThemedText style={[s.vendorDetailValue, { color: colors.text }]}>{vendor.terms}</ThemedText>
            </View>
            <View style={s.vendorDetailRow}>
              <ThemedText style={[s.vendorDetailLabel, { color: colors.textSecondary }]}>Status</ThemedText>
              <View style={[s.statusBadge, { backgroundColor: '#22C55E20' }]}>
                <ThemedText style={[s.statusBadgeText, { color: '#22C55E' }]}>ACTIVE</ThemedText>
              </View>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <View style={s.container}>
      {/* ViewBar */}
      <View style={s.viewBar}>
        {VIEWS.map((v) => {
          const isActive = v.id === activeView;
          return (
            <Pressable
              key={v.id}
              style={[
                s.viewPill,
                { backgroundColor: isActive ? accentColor : 'rgba(255,255,255,0.08)' },
              ]}
              onPress={() => handleViewPress(v.id)}
            >
              <ThemedText style={[s.viewPillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {v.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      {activeView === 'spaces' && renderSpaces()}
      {activeView === 'assets' && renderAssets()}
      {activeView === 'vendors' && renderVendors()}
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

  // ViewBar
  viewBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  viewPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  viewPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Scroll
  scroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // Section Header
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  // Card
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: Spacing.sm,
  },

  // Status badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Spaces
  spaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  spaceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceHeaderInfo: {
    flex: 1,
  },
  spaceName: {
    fontSize: 15,
    fontWeight: '600',
  },
  spaceType: {
    fontSize: 12,
    marginTop: 2,
  },
  spaceDetails: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    gap: 6,
  },
  spaceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spaceDetailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  spaceDetailValue: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  spaceNotes: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 17,
    marginTop: Spacing.sm,
  },

  // Assets
  assetSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  assetSummaryItem: {
    alignItems: 'center',
  },
  assetSummaryValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  assetSummaryLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  assetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 14,
    fontWeight: '600',
  },
  assetAssigned: {
    fontSize: 12,
    marginTop: 2,
  },
  assetValue: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  assetMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  assetMetaText: {
    fontSize: 12,
  },

  // Vendors
  vendorSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  vendorSummaryItem: {
    alignItems: 'center',
  },
  vendorSummaryValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  vendorSummaryLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  vendorIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorHeaderInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  vendorService: {
    fontSize: 12,
    marginTop: 2,
  },
  vendorMonthly: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  vendorDetails: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    gap: 6,
  },
  vendorDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vendorDetailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  vendorDetailValue: {
    fontSize: 12,
    fontWeight: '600',
  },
});
