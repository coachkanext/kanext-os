/**
 * Competition Facilities V3 — 3-pill ViewBar (Venues | Assets | Logistics)
 * Valuetainment Media League · Commissioner perspective
 * 8 race venues, league assets, and per-race logistics planning.
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';

// =============================================================================
// TYPES & MOCK DATA
// =============================================================================


const ACCENT = MODE_ACCENT.competition;
type ViewId = 'venues' | 'assets' | 'logistics';

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'venues', label: 'Venues' },
  { id: 'assets', label: 'Assets' },
  { id: 'logistics', label: 'Logistics' },
];

type VenueStatus = 'Confirmed' | 'Tentative';

interface Venue {
  id: string;
  name: string;
  country: string;
  length: string;
  capacity: string;
  status: VenueStatus;
  round: string;
}

const VENUES: Venue[] = [
  { id: 'v1', name: 'Miami International Autodrome', country: 'USA', length: '5.4km', capacity: '80K', status: 'Confirmed', round: 'R1' },
  { id: 'v2', name: 'Circuit of the Americas', country: 'USA', length: '5.5km', capacity: '120K', status: 'Confirmed', round: 'R2' },
  { id: 'v3', name: 'Autodromo di Monza', country: 'Italy', length: '5.8km', capacity: '100K', status: 'Confirmed', round: 'R3' },
  { id: 'v4', name: 'Suzuka Circuit', country: 'Japan', length: '5.8km', capacity: '155K', status: 'Confirmed', round: 'R4' },
  { id: 'v5', name: 'Spa-Francorchamps', country: 'Belgium', length: '7.0km', capacity: '90K', status: 'Confirmed', round: 'R5' },
  { id: 'v6', name: 'Nurburgring GP', country: 'Germany', length: '5.1km', capacity: '75K', status: 'Tentative', round: 'R6' },
  { id: 'v7', name: 'Mount Panorama', country: 'Australia', length: '6.2km', capacity: '40K', status: 'Confirmed', round: 'R7' },
  { id: 'v8', name: 'Dubai Autodrome', country: 'UAE', length: '5.4km', capacity: '60K', status: 'Confirmed', round: 'R8' },
];

type AssetCondition = 'Excellent' | 'Good' | 'Fair';

interface Asset {
  id: string;
  name: string;
  qty: string;
  condition: AssetCondition;
  location: string;
}

const ASSETS: Asset[] = [
  { id: 'a1', name: 'Timing System', qty: '1 set', condition: 'Excellent', location: 'In transit to Suzuka' },
  { id: 'a2', name: 'Safety Cars', qty: '2', condition: 'Good', location: 'Miami HQ' },
  { id: 'a3', name: 'Medical Car', qty: '1', condition: 'Good', location: 'Miami HQ' },
  { id: 'a4', name: 'Barriers', qty: '200 sets', condition: 'Good', location: 'Distributed (Miami/Monza)' },
  { id: 'a5', name: 'Podium Equipment', qty: '1 set', condition: 'Good', location: 'In transit to Suzuka' },
  { id: 'a6', name: 'Broadcast Truck', qty: '1', condition: 'Good', location: 'In transit to Suzuka' },
  { id: 'a7', name: 'Camera Systems', qty: '24', condition: 'Good', location: 'In transit to Suzuka' },
  { id: 'a8', name: 'Signage Package', qty: '1 set', condition: 'Fair', location: 'Monza warehouse' },
];

const CONDITION_COLORS: Record<AssetCondition, string> = {
  Excellent: '#22C55E',
  Good: ACCENT,
  Fair: '#F59E0B',
};

type CheckStatus = 'complete' | 'pending';

interface SetupItem {
  id: string;
  task: string;
  status: CheckStatus;
}

const VENUE_SETUP: SetupItem[] = [
  { id: 'vs1', task: 'Barrier installation', status: 'complete' },
  { id: 'vs2', task: 'Timing system calibration', status: 'complete' },
  { id: 'vs3', task: 'Camera placement & testing', status: 'complete' },
  { id: 'vs4', task: 'Medical center setup', status: 'pending' },
  { id: 'vs5', task: 'Podium & trophy staging', status: 'pending' },
  { id: 'vs6', task: 'Signage & branding', status: 'pending' },
  { id: 'vs7', task: 'Broadcast truck integration', status: 'pending' },
  { id: 'vs8', task: 'Final safety walkthrough', status: 'pending' },
];

interface OfficialTravel {
  id: string;
  name: string;
  status: 'Confirmed' | 'Pending';
}

const OFFICIAL_TRAVEL: OfficialTravel[] = [
  { id: 'ot1', name: 'Jean-Pierre Moreau', status: 'Confirmed' },
  { id: 'ot2', name: 'Dr. Lisa Grant', status: 'Confirmed' },
  { id: 'ot3', name: 'Hans Mueller', status: 'Confirmed' },
  { id: 'ot4', name: 'Dr. Amara Obi', status: 'Confirmed' },
  { id: 'ot5', name: 'Carlos Mendez', status: 'Confirmed' },
  { id: 'ot6', name: 'Yuki Tanaka', status: 'Confirmed' },
  { id: 'ot7', name: 'Marcus Webb', status: 'Confirmed' },
  { id: 'ot8', name: 'David Chen', status: 'Confirmed' },
  { id: 'ot9', name: 'Martin Brundle Jr.', status: 'Pending' },
  { id: 'ot10', name: 'Sofia Rodriguez', status: 'Pending' },
  { id: 'ot11', name: 'Alex Yamamoto', status: 'Pending' },
  { id: 'ot12', name: 'Chief Medic (TBD)', status: 'Pending' },
];

const TEAM_FREIGHT = [
  { id: 'tf1', team: '3SSB Works Alpha', status: 'Shipped', eta: 'Apr 8' },
  { id: 'tf2', team: 'Porsche Motorsport', status: 'Shipped', eta: 'Apr 7' },
  { id: 'tf3', team: 'McLaren Racing', status: 'In Transit', eta: 'Apr 9' },
  { id: 'tf4', team: 'RUF Performance', status: 'In Transit', eta: 'Apr 9' },
  { id: 'tf5', team: 'HKS Japan', status: 'Delivered', eta: 'Arrived' },
  { id: 'tf6', team: 'Grid One Racing', status: 'Shipped', eta: 'Apr 8' },
];

const FREIGHT_STATUS_COLOR: Record<string, string> = {
  Shipped: ACCENT,
  'In Transit': '#F59E0B',
  Delivered: '#22C55E',
};

const TEARDOWN_SCHEDULE = [
  { id: 'td1', task: 'Post-race vehicle impound release', time: 'Sun 18:00' },
  { id: 'td2', task: 'Camera & timing teardown', time: 'Sun 20:00' },
  { id: 'td3', task: 'Barrier removal begins', time: 'Mon 06:00' },
  { id: 'td4', task: 'Full venue handback', time: 'Tue 18:00' },
];

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// VIEW: VENUES
// =============================================================================

function VenuesView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>RACE VENUES ({VENUES.length})</ThemedText>
      {VENUES.map((venue) => (
        <Pressable
          key={venue.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.selectionAsync()}
        >
          <View style={s.venueHeader}>
            <View style={[s.roundTag, { backgroundColor: accentColor + '20' }]}>
              <ThemedText style={[s.roundTagText, { color: accentColor }]}>{venue.round}</ThemedText>
            </View>
            <ThemedText style={[s.venueName, { color: colors.text }]}>{venue.name}</ThemedText>
            <StatusBadge
              label={venue.status.toUpperCase()}
              color={venue.status === 'Confirmed' ? '#22C55E' : '#F59E0B'}
            />
          </View>
          <View style={[s.venueMeta, { borderTopColor: colors.border }]}>
            <View style={s.venueMetaItem}>
              <ThemedText style={[s.venueMetaLabel, { color: colors.textSecondary }]}>Country</ThemedText>
              <ThemedText style={[s.venueMetaValue, { color: colors.text }]}>{venue.country}</ThemedText>
            </View>
            <View style={s.venueMetaItem}>
              <ThemedText style={[s.venueMetaLabel, { color: colors.textSecondary }]}>Length</ThemedText>
              <ThemedText style={[s.venueMetaValue, { color: colors.text }]}>{venue.length}</ThemedText>
            </View>
            <View style={s.venueMetaItem}>
              <ThemedText style={[s.venueMetaLabel, { color: colors.textSecondary }]}>Capacity</ThemedText>
              <ThemedText style={[s.venueMetaValue, { color: colors.text }]}>{venue.capacity}</ThemedText>
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: ASSETS
// =============================================================================

function AssetsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>LEAGUE ASSETS ({ASSETS.length})</ThemedText>
      {ASSETS.map((asset) => (
        <View key={asset.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.assetHeader}>
            <ThemedText style={[s.assetName, { color: colors.text }]}>{asset.name}</ThemedText>
            <StatusBadge label={asset.condition.toUpperCase()} color={CONDITION_COLORS[asset.condition]} />
          </View>
          <View style={[s.assetMeta, { borderTopColor: colors.border }]}>
            <View style={s.assetMetaRow}>
              <ThemedText style={[s.assetMetaLabel, { color: colors.textSecondary }]}>Quantity</ThemedText>
              <ThemedText style={[s.assetMetaValue, { color: colors.text }]}>{asset.qty}</ThemedText>
            </View>
            <View style={s.assetMetaRow}>
              <ThemedText style={[s.assetMetaLabel, { color: colors.textSecondary }]}>Location</ThemedText>
              <ThemedText style={[s.assetMetaValue, { color: colors.text }]}>{asset.location}</ThemedText>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: LOGISTICS
// =============================================================================

function LogisticsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const confirmedOfficials = OFFICIAL_TRAVEL.filter((o) => o.status === 'Confirmed').length;
  const completedSetup = VENUE_SETUP.filter((i) => i.status === 'complete').length;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Shipping Timeline */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>R4 SUZUKA — EQUIPMENT SHIPPING</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.shippingHeader}>
          <IconSymbol name="airplane" size={16} color={accentColor} />
          <ThemedText style={[s.shippingRoute, { color: colors.text }]}>Miami HQ → Suzuka Circuit</ThemedText>
        </View>
        <StatusBadge label="IN TRANSIT" color="#F59E0B" />
      </View>

      {/* Venue Setup Checklist */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
        VENUE SETUP ({completedSetup}/{VENUE_SETUP.length} COMPLETE)
      </ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {VENUE_SETUP.map((item, idx) => (
          <View
            key={item.id}
            style={[
              s.checkRow,
              idx < VENUE_SETUP.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <IconSymbol
              name={item.status === 'complete' ? 'checkmark.circle.fill' : 'circle.fill'}
              size={16}
              color={item.status === 'complete' ? '#22C55E' : colors.textTertiary}
            />
            <ThemedText style={[s.checkText, { color: item.status === 'complete' ? colors.textSecondary : colors.text }]}>
              {item.task}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Marshal Travel */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
        MARSHAL TRAVEL ({confirmedOfficials}/{OFFICIAL_TRAVEL.length} CONFIRMED)
      </ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {OFFICIAL_TRAVEL.map((official, idx) => (
          <View
            key={official.id}
            style={[
              s.travelRow,
              idx < OFFICIAL_TRAVEL.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <ThemedText style={[s.travelName, { color: colors.text }]}>{official.name}</ThemedText>
            <StatusBadge
              label={official.status.toUpperCase()}
              color={official.status === 'Confirmed' ? '#22C55E' : '#F59E0B'}
            />
          </View>
        ))}
      </View>

      {/* Accommodation */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>ACCOMMODATION</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.accomRow}>
          <IconSymbol name="building.2.fill" size={16} color={accentColor} />
          <View style={s.accomInfo}>
            <ThemedText style={[s.accomTitle, { color: colors.text }]}>Suzuka Circuit Hotel</ThemedText>
            <ThemedText style={[s.accomDetail, { color: colors.textSecondary }]}>12 rooms · Apr 4-8 · Booked</ThemedText>
          </View>
          <StatusBadge label="BOOKED" color="#22C55E" />
        </View>
      </View>

      {/* Team Freight */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>TEAM FREIGHT TRACKING</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {TEAM_FREIGHT.map((tf, idx) => (
          <View
            key={tf.id}
            style={[
              s.freightRow,
              idx < TEAM_FREIGHT.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={s.freightInfo}>
              <ThemedText style={[s.freightTeam, { color: colors.text }]}>{tf.team}</ThemedText>
              <ThemedText style={[s.freightEta, { color: colors.textSecondary }]}>ETA: {tf.eta}</ThemedText>
            </View>
            <StatusBadge label={tf.status.toUpperCase()} color={FREIGHT_STATUS_COLOR[tf.status] || '#A1A1AA'} />
          </View>
        ))}
      </View>

      {/* Teardown Schedule */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>TEARDOWN SCHEDULE</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {TEARDOWN_SCHEDULE.map((td, idx) => (
          <View
            key={td.id}
            style={[
              s.teardownRow,
              idx < TEARDOWN_SCHEDULE.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <ThemedText style={[s.teardownTask, { color: colors.text }]}>{td.task}</ThemedText>
            <ThemedText style={[s.teardownTime, { color: colors.textSecondary }]}>{td.time}</ThemedText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function CompFacilities({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewId>('venues');

  const handlePillPress = useCallback((id: ViewId) => {
    Haptics.selectionAsync();
    setActiveView(id);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'venues':
        return <VenuesView colors={colors} accentColor={accentColor} />;
      case 'assets':
        return <AssetsView colors={colors} accentColor={accentColor} />;
      case 'logistics':
        return <LogisticsView colors={colors} accentColor={accentColor} />;
    }
  };

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
                s.pill,
                { backgroundColor: isActive ? accentColor : '#2F3336' },
              ]}
              onPress={() => handlePillPress(v.id)}
            >
              <ThemedText
                style={[
                  s.pillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {v.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      {renderContent()}
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

  // -- ViewBar --
  viewBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Scroll --
  scroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // -- Section Header --
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  // -- Card --
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
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

  // -- Venue --
  venueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roundTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  roundTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  venueName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  venueMeta: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.lg,
  },
  venueMetaItem: {
    gap: 2,
  },
  venueMetaLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  venueMetaValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Asset --
  assetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  assetName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  assetMeta: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  assetMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetMetaLabel: {
    fontSize: 12,
  },
  assetMetaValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Shipping --
  shippingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  shippingRoute: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },

  // -- Checklist --
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
  },
  checkText: {
    fontSize: 13,
    flex: 1,
  },

  // -- Travel --
  travelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  travelName: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },

  // -- Accommodation --
  accomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  accomInfo: {
    flex: 1,
  },
  accomTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  accomDetail: {
    fontSize: 12,
    marginTop: 2,
  },

  // -- Freight --
  freightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  freightInfo: {
    flex: 1,
  },
  freightTeam: {
    fontSize: 13,
    fontWeight: '500',
  },
  freightEta: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Teardown --
  teardownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  teardownTask: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  teardownTime: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
});
