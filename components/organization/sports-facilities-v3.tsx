/**
 * Sports Facilities V3 — 3-pill ViewBar (Spaces | Bookings | Equipment)
 * KaNeXT Men's Basketball · NAA KaNeXT Conference
 * Head Coach / GM perspective. Inline mock data, no DrillMode.
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

// =============================================================================
// TYPES & MOCK DATA
// =============================================================================

type ViewId = 'spaces' | 'bookings' | 'equipment';

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'spaces', label: 'Spaces' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'equipment', label: 'Equipment' },
];

type SpaceStatus = 'Open' | 'In Use' | 'Closed';

const SPACE_STATUS_COLOR: Record<SpaceStatus, string> = {
  Open: '#22C55E',
  'In Use': '#F59E0B',
  Closed: '#EF4444',
};

interface Facility {
  id: string;
  name: string;
  status: SpaceStatus;
  capacity: number;
  icon: string;
}

const FACILITIES: Facility[] = [
  { id: 'f1', name: 'KaNeXT Wellness Center', status: 'Open', capacity: 2000, icon: 'building.2.fill' },
  { id: 'f2', name: 'Weight Room', status: 'In Use', capacity: 30, icon: 'figure.mind.and.body' },
  { id: 'f3', name: 'Film Room', status: 'Open', capacity: 25, icon: 'play.rectangle.fill' },
  { id: 'f4', name: 'Practice Court', status: 'Open', capacity: 50, icon: 'sportscourt.fill' },
  { id: 'f5', name: 'Locker Room', status: 'Open', capacity: 40, icon: 'lock.fill' },
];

interface Booking {
  id: string;
  date: string;
  time: string;
  space: string;
  team: string;
  purpose: string;
  recurring: boolean;
}

const BOOKINGS: Booking[] = [
  { id: 'b1', date: 'Jan 18', time: '6:00 AM - 8:00 AM', space: 'Weight Room', team: 'Varsity', purpose: 'Morning Lift', recurring: true },
  { id: 'b2', date: 'Jan 18', time: '3:00 PM - 5:30 PM', space: 'Practice Court', team: 'Varsity', purpose: 'Team Practice', recurring: true },
  { id: 'b3', date: 'Jan 19', time: '9:00 AM - 10:30 AM', space: 'Film Room', team: 'Varsity', purpose: 'Game Film Review', recurring: false },
  { id: 'b4', date: 'Jan 19', time: '2:00 PM - 4:00 PM', space: 'Practice Court', team: 'Dev 1', purpose: 'Team Practice', recurring: true },
  { id: 'b5', date: 'Jan 20', time: '6:00 AM - 8:00 AM', space: 'Weight Room', team: 'Dev 1', purpose: 'Morning Lift', recurring: true },
  { id: 'b6', date: 'Jan 20', time: '4:00 PM - 6:00 PM', space: 'Practice Court', team: 'Dev 2', purpose: 'Team Practice', recurring: true },
];

type EquipmentCondition = 'Good' | 'Fair' | 'Maintenance needed';

const CONDITION_COLOR: Record<EquipmentCondition, string> = {
  Good: '#22C55E',
  Fair: '#F59E0B',
  'Maintenance needed': '#EF4444',
};

interface EquipmentItem {
  id: string;
  name: string;
  quantity: number;
  condition: EquipmentCondition;
}

const EQUIPMENT: EquipmentItem[] = [
  { id: 'eq1', name: 'Home Jerseys', quantity: 18, condition: 'Good' },
  { id: 'eq2', name: 'Away Jerseys', quantity: 18, condition: 'Fair' },
  { id: 'eq3', name: 'Practice Jerseys', quantity: 36, condition: 'Good' },
  { id: 'eq4', name: 'Basketballs', quantity: 24, condition: 'Good' },
  { id: 'eq5', name: 'Training Cones', quantity: 50, condition: 'Good' },
  { id: 'eq6', name: 'Resistance Bands', quantity: 20, condition: 'Fair' },
  { id: 'eq7', name: 'Medicine Balls', quantity: 12, condition: 'Good' },
  { id: 'eq8', name: 'Shooting Machine', quantity: 1, condition: 'Maintenance needed' },
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
// VIEW: SPACES
// =============================================================================

function SpacesView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>FACILITIES</ThemedText>
      {FACILITIES.map((facility) => (
        <Pressable
          key={facility.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.selectionAsync()}
        >
          <View style={s.spaceHeader}>
            <IconSymbol name={facility.icon as any} size={20} color={accentColor} />
            <View style={s.spaceInfo}>
              <ThemedText style={[s.spaceName, { color: colors.text }]}>{facility.name}</ThemedText>
              <ThemedText style={[s.spaceCap, { color: colors.textSecondary }]}>
                Capacity: {facility.capacity}
              </ThemedText>
            </View>
            <StatusBadge
              label={facility.status.toUpperCase()}
              color={SPACE_STATUS_COLOR[facility.status]}
            />
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: BOOKINGS
// =============================================================================

function BookingsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>UPCOMING BOOKINGS</ThemedText>
      {BOOKINGS.map((booking) => (
        <View
          key={booking.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.bookingHeader}>
            <View style={s.bookingDateBadge}>
              <ThemedText style={[s.bookingDate, { color: accentColor }]}>{booking.date}</ThemedText>
            </View>
            <View style={s.bookingInfo}>
              <ThemedText style={[s.bookingPurpose, { color: colors.text }]}>{booking.purpose}</ThemedText>
              <ThemedText style={[s.bookingTime, { color: colors.textSecondary }]}>{booking.time}</ThemedText>
            </View>
            {booking.recurring && (
              <StatusBadge label="RECURRING" color="#1D9BF0" />
            )}
          </View>
          <View style={[s.bookingMeta, { borderTopColor: colors.border }]}>
            <View style={s.bookingMetaItem}>
              <IconSymbol name="building.2.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.bookingMetaText, { color: colors.textSecondary }]}>{booking.space}</ThemedText>
            </View>
            <View style={s.bookingMetaItem}>
              <IconSymbol name="person.3.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.bookingMetaText, { color: colors.textSecondary }]}>{booking.team}</ThemedText>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: EQUIPMENT
// =============================================================================

function EquipmentView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>INVENTORY</ThemedText>
      {EQUIPMENT.map((item) => (
        <View
          key={item.id}
          style={[s.listRow, { borderBottomColor: colors.border }]}
        >
          <View style={s.eqInfo}>
            <ThemedText style={[s.eqName, { color: colors.text }]}>{item.name}</ThemedText>
            <ThemedText style={[s.eqQty, { color: colors.textSecondary }]}>
              Qty: {item.quantity} {item.quantity === 1 ? 'unit' : 'sets'}
            </ThemedText>
          </View>
          <StatusBadge
            label={item.condition.toUpperCase()}
            color={CONDITION_COLOR[item.condition]}
          />
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function SportsFacilities({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewId>('spaces');

  const handlePillPress = useCallback((id: ViewId) => {
    Haptics.selectionAsync();
    setActiveView(id);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'spaces':
        return <SpacesView colors={colors} accentColor={accentColor} />;
      case 'bookings':
        return <BookingsView colors={colors} accentColor={accentColor} />;
      case 'equipment':
        return <EquipmentView colors={colors} accentColor={accentColor} />;
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

  // -- Spaces --
  spaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  spaceInfo: {
    flex: 1,
  },
  spaceName: {
    fontSize: 14,
    fontWeight: '700',
  },
  spaceCap: {
    fontSize: 12,
    marginTop: 2,
  },

  // -- Bookings --
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bookingDateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#2F3336',
    borderRadius: 6,
  },
  bookingDate: {
    fontSize: 12,
    fontWeight: '700',
  },
  bookingInfo: {
    flex: 1,
  },
  bookingPurpose: {
    fontSize: 14,
    fontWeight: '700',
  },
  bookingTime: {
    fontSize: 12,
    marginTop: 2,
  },
  bookingMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bookingMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookingMetaText: {
    fontSize: 12,
  },

  // -- Equipment list rows --
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  eqInfo: {
    flex: 1,
  },
  eqName: {
    fontSize: 13,
    fontWeight: '600',
  },
  eqQty: {
    fontSize: 11,
    marginTop: 2,
  },
});
