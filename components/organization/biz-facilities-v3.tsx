/**
 * BizFacilities — Physical Location Directory (Facilities Tab)
 * Single vertical scroll. Structured location cards.
 * No financial overlays. No operational dashboards.
 * Facilities = structured location registry.
 */
import React, { useState, useMemo, useRef, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput, Linking, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
  onNavigateTab?: (tabIndex: number) => void;
}

// =============================================================================
// TYPES
// =============================================================================

type OwnershipType = 'Owned' | 'Leased' | 'Shared';
type LocationStatus = 'Active' | 'Inactive' | 'Under Development';
type LocationCategory = 'Headquarters' | 'Satellite Office' | 'Warehouse' | 'Training Facility' | 'Event Space';

// =============================================================================
// INLINE DATA — Location directory only
// =============================================================================

const LOCATIONS = [
  {
    id: 'loc-1',
    name: 'Valuetainment HQ',
    city: 'Miami',
    state: 'FL',
    fullAddress: '1111 Brickell Ave, Suite 800, Miami, FL 33131',
    ownership: 'Leased' as OwnershipType,
    status: 'Active' as LocationStatus,
    category: 'Headquarters' as LocationCategory,
    primaryUse: 'Corporate headquarters and primary workspace',
    sqft: '4,200 sq ft',
    headcount: 8,
    hours: 'Mon–Fri, 8:00 AM – 6:00 PM',
  },
  {
    id: 'loc-2',
    name: 'Nashville Office',
    city: 'Nashville',
    state: 'TN',
    fullAddress: '505 Church St, Suite 300, Nashville, TN 37219',
    ownership: 'Leased' as OwnershipType,
    status: 'Active' as LocationStatus,
    category: 'Satellite Office' as LocationCategory,
    primaryUse: 'Operations and client services',
    sqft: '1,800 sq ft',
    headcount: 3,
    hours: 'Mon–Fri, 9:00 AM – 5:00 PM',
  },
  {
    id: 'loc-3',
    name: 'Innovation Lab',
    city: 'Miami',
    state: 'FL',
    fullAddress: '200 S Biscayne Blvd, Miami, FL 33131',
    ownership: 'Shared' as OwnershipType,
    status: 'Active' as LocationStatus,
    category: 'Training Facility' as LocationCategory,
    primaryUse: 'Product demos, workshops, and training sessions',
    sqft: '1,200 sq ft',
    headcount: 0,
    hours: 'By appointment',
  },
  {
    id: 'loc-4',
    name: 'Doral Warehouse',
    city: 'Doral',
    state: 'FL',
    fullAddress: '8200 NW 27th St, Doral, FL 33122',
    ownership: 'Leased' as OwnershipType,
    status: 'Inactive' as LocationStatus,
    category: 'Warehouse' as LocationCategory,
    primaryUse: 'Equipment storage and fulfillment',
    sqft: '3,600 sq ft',
    headcount: 0,
    hours: 'N/A',
  },
  {
    id: 'loc-5',
    name: 'Wynwood Event Space',
    city: 'Miami',
    state: 'FL',
    fullAddress: '318 NW 23rd St, Miami, FL 33127',
    ownership: 'Shared' as OwnershipType,
    status: 'Under Development' as LocationStatus,
    category: 'Event Space' as LocationCategory,
    primaryUse: 'Corporate events, investor meetings, launches',
    sqft: '2,800 sq ft',
    headcount: 0,
    hours: 'TBD',
  },
];

const INFO_NOTE = 'Primary headquarters located in Miami, FL. Secondary operational footprint in Nashville, TN.';

const STATUS_COLOR: Record<LocationStatus, string> = {
  Active: '#22C55E',
  Inactive: '#9CA3AF',
  'Under Development': '#F59E0B',
};

const OWNERSHIP_ICON: Record<OwnershipType, string> = {
  Owned: 'house.fill',
  Leased: 'key.fill',
  Shared: 'person.2.fill',
};

// Tab indices: 0=Program, 1=People, 2=Finance, 3=Compliance, 4=Facilities, 5=Ledger
const TAB_LEDGER = 5;

// =============================================================================
// COMPONENT
// =============================================================================

export function BizFacilities({ colors, accentColor, onNavigateTab }: Props) {
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<typeof LOCATIONS[0] | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  // Sort: Active first, then alphabetical
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    let list = [...LOCATIONS];

    if (term) {
      list = list.filter((loc) => loc.name.toLowerCase().includes(term));
    }

    list.sort((a, b) => {
      const statusOrder: Record<LocationStatus, number> = { Active: 0, 'Under Development': 1, Inactive: 2 };
      const diff = statusOrder[a.status] - statusOrder[b.status];
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [search]);

  const openDetail = (loc: typeof LOCATIONS[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLocation(loc);
    setDetailVisible(true);
  };

  const openInMaps = (address: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const encoded = encodeURIComponent(address);
    const url = Platform.OS === 'ios'
      ? `maps:?q=${encoded}`
      : `geo:0,0?q=${encoded}`;
    Linking.openURL(url);
  };

  const navigate = (tabIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNavigateTab?.(tabIndex);
  };

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Block 0 — Header */}
        <View style={[s.block, { borderColor: colors.border }]}>
          <ThemedText style={[s.pageTitle, { color: colors.text }]}>Facilities</ThemedText>
          <View style={[s.searchBar, { backgroundColor: colors.backgroundTertiary }]}>
            <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
            <TextInput
              style={[s.searchInput, { color: colors.text }]}
              placeholder="Search locations"
              placeholderTextColor={colors.textTertiary}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              autoCorrect={false}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Block 1 — Locations Grid */}
        <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>
          LOCATIONS ({filtered.length})
        </ThemedText>
        {filtered.length === 0 ? (
          <View style={[s.block, { borderColor: colors.border }]}>
            <ThemedText style={[s.emptyNote, { color: colors.textTertiary }]}>
              No locations match your search.
            </ThemedText>
          </View>
        ) : (
          filtered.map((loc) => {
            const statusColor = STATUS_COLOR[loc.status];
            return (
              <Pressable
                key={loc.id}
                style={({ pressed }) => [
                  s.block,
                  s.locationCard,
                  { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => openDetail(loc)}
              >
                <View style={s.locationHeader}>
                  <View style={[s.locationIcon, { backgroundColor: accentColor + '15' }]}>
                    <IconSymbol
                      name={OWNERSHIP_ICON[loc.ownership] as any}
                      size={18}
                      color={accentColor}
                    />
                  </View>
                  <View style={s.locationInfo}>
                    <ThemedText style={[s.locationName, { color: colors.text }]}>{loc.name}</ThemedText>
                    <ThemedText style={[s.locationCity, { color: colors.textSecondary }]}>
                      {loc.city}, {loc.state}
                    </ThemedText>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
                </View>

                <View style={s.locationMeta}>
                  <View style={[s.ownershipChip, { backgroundColor: colors.backgroundTertiary }]}>
                    <ThemedText style={[s.ownershipText, { color: colors.textSecondary }]}>
                      {loc.ownership}
                    </ThemedText>
                  </View>
                  <View style={[s.statusChip, { backgroundColor: statusColor + '20' }]}>
                    <View style={[s.statusDot, { backgroundColor: statusColor }]} />
                    <ThemedText style={[s.statusText, { color: statusColor }]}>
                      {loc.status}
                    </ThemedText>
                  </View>
                </View>
              </Pressable>
            );
          })
        )}

        {/* Block 3 — Informational Note */}
        <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>NOTES</ThemedText>
        <View style={[s.block, { borderColor: colors.border }]}>
          <ThemedText style={[s.infoNote, { color: colors.textSecondary }]}>
            {INFO_NOTE}
          </ThemedText>
        </View>
      </ScrollView>

      {/* Location Detail Sheet */}
      <BottomSheet
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        title={selectedLocation?.name ?? 'Location'}
      >
        {selectedLocation && (
          <BottomSheetScrollView contentContainerStyle={s.detailScroll}>
            {/* Status + Ownership */}
            <View style={s.detailChipsRow}>
              <View style={[s.ownershipChip, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[s.ownershipText, { color: colors.textSecondary }]}>
                  {selectedLocation.ownership}
                </ThemedText>
              </View>
              <View style={[s.statusChip, { backgroundColor: STATUS_COLOR[selectedLocation.status] + '20' }]}>
                <View style={[s.statusDot, { backgroundColor: STATUS_COLOR[selectedLocation.status] }]} />
                <ThemedText style={[s.statusText, { color: STATUS_COLOR[selectedLocation.status] }]}>
                  {selectedLocation.status}
                </ThemedText>
              </View>
            </View>

            {/* Detail Fields */}
            <View style={[s.detailBlock, { borderColor: colors.border }]}>
              <DetailRow label="Full Address" value={selectedLocation.fullAddress} colors={colors} multiline />
              <DetailRow label="Category" value={selectedLocation.category} colors={colors} />
              <DetailRow label="Primary Use" value={selectedLocation.primaryUse} colors={colors} multiline />
              <DetailRow label="Square Footage" value={selectedLocation.sqft} colors={colors} />
              <DetailRow
                label="Headcount Assigned"
                value={selectedLocation.headcount === 0 ? 'None' : String(selectedLocation.headcount)}
                colors={colors}
              />
              <DetailRow label="Hours of Operation" value={selectedLocation.hours} colors={colors} />
            </View>

            {/* Actions */}
            <View style={s.detailActions}>
              <Pressable
                style={({ pressed }) => [
                  s.actionButton,
                  { backgroundColor: accentColor, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => openInMaps(selectedLocation.fullAddress)}
              >
                <IconSymbol name="map.fill" size={16} color="#FFFFFF" />
                <ThemedText style={s.actionButtonText}>Open in Maps</ThemedText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  s.actionButton,
                  { backgroundColor: colors.backgroundTertiary, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => {
                  setDetailVisible(false);
                  navigate(TAB_LEDGER);
                }}
              >
                <IconSymbol name="doc.text.fill" size={16} color={colors.text} />
                <ThemedText style={[s.actionButtonText, { color: colors.text }]}>Open in Vault</ThemedText>
              </Pressable>
            </View>
          </BottomSheetScrollView>
        )}
      </BottomSheet>
    </>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function DetailRow({
  label,
  value,
  colors,
  multiline,
}: {
  label: string;
  value: string;
  colors: typeof Colors.light;
  multiline?: boolean;
}) {
  return (
    <View style={[s.fieldRow, multiline && s.fieldRowMultiline]}>
      <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
      <ThemedText style={[s.fieldValue, { color: colors.text }, multiline && s.fieldValueMultiline]}>
        {value}
      </ThemedText>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  scroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  block: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },

  // Header
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
  },

  // Location cards
  locationCard: {
    marginBottom: Spacing.sm,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '600',
  },
  locationCity: {
    fontSize: 13,
    marginTop: 2,
  },
  locationMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
  },

  // Chips
  ownershipChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ownershipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Info note
  infoNote: {
    fontSize: 13,
    lineHeight: 19,
  },

  // Empty
  emptyNote: {
    fontSize: 13,
    fontStyle: 'italic',
  },

  // Detail sheet
  detailScroll: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  detailChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  detailBlock: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Field rows
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  fieldRowMultiline: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    maxWidth: '55%',
  },
  fieldValueMultiline: {
    textAlign: 'left',
    maxWidth: '100%',
    lineHeight: 19,
  },
});
