/**
 * Church Facilities V3 — 2819 Church · Senior Pastor
 * ViewBar: Spaces | Bookings | Maintenance
 * Self-contained with inline mock data.
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

type ViewId = 'spaces' | 'bookings' | 'maintenance';

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// VIEWS
// =============================================================================

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'spaces', label: 'Spaces' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'maintenance', label: 'Maintenance' },
];

// =============================================================================
// MOCK DATA
// =============================================================================

type SpaceStatus = 'Available' | 'In Use' | 'Reserved';

interface Space {
  id: string;
  name: string;
  capacity: number;
  status: SpaceStatus;
  icon: string;
}

const SPACES: Space[] = [
  { id: 'sp1', name: 'Sanctuary', capacity: 500, status: 'Available', icon: 'building.columns.fill' },
  { id: 'sp2', name: 'Fellowship Hall', capacity: 200, status: 'Available', icon: 'person.3.fill' },
  { id: 'sp3', name: 'Classroom A', capacity: 30, status: 'In Use', icon: 'book.fill' },
  { id: 'sp4', name: 'Classroom B', capacity: 30, status: 'Available', icon: 'book.fill' },
  { id: 'sp5', name: 'Offices', capacity: 10, status: 'Available', icon: 'briefcase.fill' },
  { id: 'sp6', name: 'Kitchen', capacity: 15, status: 'Available', icon: 'hands.sparkles.fill' },
  { id: 'sp7', name: 'Nursery', capacity: 20, status: 'Available', icon: 'figure.and.child.holdinghands' },
  { id: 'sp8', name: 'Youth Room', capacity: 40, status: 'Available', icon: 'person.3.fill' },
];

interface Booking {
  id: string;
  title: string;
  space: string;
  schedule: string;
  recurring: boolean;
  ministry: string;
}

const BOOKINGS: Booking[] = [
  { id: 'bk1', title: 'Sunday Morning Service', space: 'Sanctuary', schedule: 'Sundays 10:00 AM', recurring: true, ministry: 'Worship' },
  { id: 'bk2', title: 'Sunday Evening Service', space: 'Sanctuary', schedule: 'Sundays 6:00 PM', recurring: true, ministry: 'Worship' },
  { id: 'bk3', title: 'Wednesday Bible Study', space: 'Fellowship Hall', schedule: 'Wednesdays 7:00 PM', recurring: true, ministry: 'Rooted' },
  { id: 'bk4', title: 'Catalyst Friday', space: 'Youth Room', schedule: 'Fridays 7:00 PM', recurring: true, ministry: 'Catalyst' },
  { id: 'bk5', title: 'Connect Group 1', space: 'Classroom A', schedule: 'Tuesdays 7:00 PM', recurring: true, ministry: 'Connect Groups' },
  { id: 'bk6', title: 'Connect Group 3', space: 'Classroom B', schedule: 'Thursdays 7:00 PM', recurring: true, ministry: 'Connect Groups' },
  { id: 'bk7', title: 'Connect Group 5', space: 'Fellowship Hall', schedule: 'Saturdays 10:00 AM', recurring: true, ministry: 'Connect Groups' },
  { id: 'bk8', title: 'Leadership Retreat Planning', space: 'Offices', schedule: 'Feb 28, 2025 2:00 PM', recurring: false, ministry: 'Leadership' },
];

type WorkOrderPriority = 'Urgent' | 'Normal' | 'Low';
type WorkOrderStatus = 'Open' | 'In Progress' | 'Scheduled';

interface WorkOrder {
  id: string;
  title: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  description: string;
  reportedDate: string;
}

const WORK_ORDERS: WorkOrder[] = [
  { id: 'wo1', title: 'Sound system speaker replacement', priority: 'Urgent', status: 'In Progress', description: 'Left channel speaker crackling during worship. Need replacement unit.', reportedDate: 'Feb 10, 2025' },
  { id: 'wo2', title: 'Parking lot restriping', priority: 'Normal', status: 'Scheduled', description: 'Lines faded and ADA spaces need repainting. Vendor scheduled.', reportedDate: 'Jan 28, 2025' },
  { id: 'wo3', title: 'Fellowship Hall AC maintenance', priority: 'Normal', status: 'Open', description: 'Annual HVAC maintenance due. Getting quotes from 2 vendors.', reportedDate: 'Feb 5, 2025' },
  { id: 'wo4', title: 'Nursery carpet cleaning', priority: 'Low', status: 'Scheduled', description: 'Deep clean scheduled for next Saturday. Nursery will relocate to Classroom B.', reportedDate: 'Feb 12, 2025' },
];

type EquipmentCondition = 'Good' | 'Fair' | 'Needs Repair';

interface Equipment {
  id: string;
  name: string;
  condition: EquipmentCondition;
  quantity?: number;
  lastServiced: string;
}

const EQUIPMENT: Equipment[] = [
  { id: 'eq1', name: 'Sound System', condition: 'Good', lastServiced: 'Jan 2025' },
  { id: 'eq2', name: 'Projector (Sanctuary)', condition: 'Good', lastServiced: 'Dec 2024' },
  { id: 'eq3', name: 'Projector (Fellowship Hall)', condition: 'Fair', lastServiced: 'Oct 2024' },
  { id: 'eq4', name: 'Musical Instruments', condition: 'Good', lastServiced: 'Nov 2024' },
  { id: 'eq5', name: 'Chairs', condition: 'Good', quantity: 500, lastServiced: 'Sep 2024' },
];

// =============================================================================
// HELPERS
// =============================================================================

const SPACE_STATUS_COLORS: Record<SpaceStatus, string> = {
  Available: '#22C55E',
  'In Use': '#F59E0B',
  Reserved: '#1D9BF0',
};

const PRIORITY_COLORS: Record<WorkOrderPriority, string> = {
  Urgent: '#EF4444',
  Normal: '#F59E0B',
  Low: '#A1A1AA',
};

const WO_STATUS_COLORS: Record<WorkOrderStatus, string> = {
  Open: '#EF4444',
  'In Progress': '#1D9BF0',
  Scheduled: '#22C55E',
};

const CONDITION_COLORS: Record<EquipmentCondition, string> = {
  Good: '#22C55E',
  Fair: '#F59E0B',
  'Needs Repair': '#EF4444',
};

// =============================================================================
// VIEW BAR
// =============================================================================

function ViewBar({
  views,
  activeId,
  onSelect,
  accentColor,
  colors,
}: {
  views: typeof VIEWS;
  activeId: ViewId;
  onSelect: (id: ViewId) => void;
  accentColor: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={s.viewBar}>
      {views.map((v) => {
        const isActive = v.id === activeId;
        return (
          <Pressable
            key={v.id}
            style={[
              s.viewPill,
              {
                backgroundColor: isActive ? accentColor : '#2F3336',
              },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(v.id);
            }}
          >
            <ThemedText
              style={[
                s.viewPillText,
                { color: isActive ? '#000' : colors.textSecondary },
              ]}
            >
              {v.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

// =============================================================================
// SPACES VIEW
// =============================================================================

function SpacesView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const available = SPACES.filter((s) => s.status === 'Available').length;
  const totalCapacity = SPACES.reduce((sum, s) => sum + s.capacity, 0);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Summary */}
      <View style={s.summaryRow}>
        <View style={[s.summaryTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.summaryValue, { color: accentColor }]}>{SPACES.length}</ThemedText>
          <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Total Spaces</ThemedText>
        </View>
        <View style={[s.summaryTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.summaryValue, { color: '#22C55E' }]}>{available}</ThemedText>
          <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Available</ThemedText>
        </View>
        <View style={[s.summaryTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.summaryValue, { color: '#1D9BF0' }]}>{totalCapacity}</ThemedText>
          <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Total Capacity</ThemedText>
        </View>
      </View>

      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>ALL SPACES</ThemedText>
      {SPACES.map((space) => (
        <View
          key={space.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.spaceRow}>
            <IconSymbol name={space.icon as any} size={20} color={accentColor} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.spaceName, { color: colors.text }]}>{space.name}</ThemedText>
              <ThemedText style={[s.spaceCapacity, { color: colors.textSecondary }]}>Capacity: {space.capacity}</ThemedText>
            </View>
            <View style={[s.statusBadge, { backgroundColor: SPACE_STATUS_COLORS[space.status] + '20' }]}>
              <ThemedText style={[s.statusBadgeText, { color: SPACE_STATUS_COLORS[space.status] }]}>
                {space.status}
              </ThemedText>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// BOOKINGS VIEW
// =============================================================================

function BookingsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const recurringBookings = BOOKINGS.filter((b) => b.recurring);
  const specialBookings = BOOKINGS.filter((b) => !b.recurring);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>RECURRING BOOKINGS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {recurringBookings.map((booking, idx) => (
          <View
            key={booking.id}
            style={[
              s.bookingRow,
              idx < recurringBookings.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={[s.recurringDot, { backgroundColor: accentColor }]} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.bookingTitle, { color: colors.text }]}>{booking.title}</ThemedText>
              <ThemedText style={[s.bookingMeta, { color: colors.textSecondary }]}>
                {booking.space} · {booking.schedule}
              </ThemedText>
              <ThemedText style={[s.bookingMinistry, { color: colors.textTertiary }]}>{booking.ministry}</ThemedText>
            </View>
            <View style={[s.statusBadge, { backgroundColor: '#1D9BF020' }]}>
              <ThemedText style={[s.statusBadgeText, { color: '#1D9BF0' }]}>Recurring</ThemedText>
            </View>
          </View>
        ))}
      </View>

      {specialBookings.length > 0 && (
        <>
          <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>SPECIAL BOOKINGS</ThemedText>
          {specialBookings.map((booking) => (
            <View
              key={booking.id}
              style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={s.bookingRow}>
                <IconSymbol name="calendar.badge.plus" size={16} color={accentColor} />
                <View style={{ flex: 1 }}>
                  <ThemedText style={[s.bookingTitle, { color: colors.text }]}>{booking.title}</ThemedText>
                  <ThemedText style={[s.bookingMeta, { color: colors.textSecondary }]}>
                    {booking.space} · {booking.schedule}
                  </ThemedText>
                  <ThemedText style={[s.bookingMinistry, { color: colors.textTertiary }]}>{booking.ministry}</ThemedText>
                </View>
                <View style={[s.statusBadge, { backgroundColor: '#F59E0B20' }]}>
                  <ThemedText style={[s.statusBadgeText, { color: '#F59E0B' }]}>One-time</ThemedText>
                </View>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

// =============================================================================
// MAINTENANCE VIEW
// =============================================================================

function MaintenanceView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Work Orders */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>WORK ORDERS</ThemedText>
      {WORK_ORDERS.map((wo) => (
        <View
          key={wo.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.woHeader}>
            <View style={[s.priorityDot, { backgroundColor: PRIORITY_COLORS[wo.priority] }]} />
            <ThemedText style={[s.woTitle, { color: colors.text }]}>{wo.title}</ThemedText>
            <View style={[s.statusBadge, { backgroundColor: WO_STATUS_COLORS[wo.status] + '20' }]}>
              <ThemedText style={[s.statusBadgeText, { color: WO_STATUS_COLORS[wo.status] }]}>{wo.status}</ThemedText>
            </View>
          </View>
          <ThemedText style={[s.woDesc, { color: colors.textSecondary }]}>{wo.description}</ThemedText>
          <View style={s.woFooter}>
            <View style={[s.statusBadge, { backgroundColor: PRIORITY_COLORS[wo.priority] + '20' }]}>
              <ThemedText style={[s.statusBadgeText, { color: PRIORITY_COLORS[wo.priority] }]}>{wo.priority}</ThemedText>
            </View>
            <ThemedText style={[s.woDate, { color: colors.textTertiary }]}>Reported: {wo.reportedDate}</ThemedText>
          </View>
        </View>
      ))}

      {/* Equipment */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>EQUIPMENT INVENTORY</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {EQUIPMENT.map((eq, idx) => (
          <View
            key={eq.id}
            style={[
              s.equipRow,
              idx < EQUIPMENT.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.equipName, { color: colors.text }]}>
                {eq.name}{eq.quantity ? ` (x${eq.quantity})` : ''}
              </ThemedText>
              <ThemedText style={[s.equipServiced, { color: colors.textSecondary }]}>Last serviced: {eq.lastServiced}</ThemedText>
            </View>
            <View style={[s.statusBadge, { backgroundColor: CONDITION_COLORS[eq.condition] + '20' }]}>
              <ThemedText style={[s.statusBadgeText, { color: CONDITION_COLORS[eq.condition] }]}>{eq.condition}</ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function ChurchFacilities({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewId>('spaces');

  const handleViewChange = useCallback((id: ViewId) => {
    setActiveView(id);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'spaces':
        return <SpacesView colors={colors} accentColor={accentColor} />;
      case 'bookings':
        return <BookingsView colors={colors} accentColor={accentColor} />;
      case 'maintenance':
        return <MaintenanceView colors={colors} accentColor={accentColor} />;
      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      <ViewBar
        views={VIEWS}
        activeId={activeView}
        onSelect={handleViewChange}
        accentColor={accentColor}
        colors={colors}
      />
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

  // -- View Bar --
  viewBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
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
    marginTop: Spacing.lg,
    textTransform: 'uppercase',
  },

  // -- Card --
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: Spacing.sm,
  },

  // -- Status Badge --
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // -- Summary --
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  summaryTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },

  // -- Space --
  spaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  spaceName: {
    fontSize: 15,
    fontWeight: '600',
  },
  spaceCapacity: {
    fontSize: 12,
    marginTop: 2,
  },

  // -- Booking --
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
  },
  recurringDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bookingTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  bookingMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  bookingMinistry: {
    fontSize: 11,
    marginTop: 1,
  },

  // -- Work Order --
  woHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 6,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  woTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  woDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  woFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  woDate: {
    fontSize: 11,
  },

  // -- Equipment --
  equipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  equipName: {
    fontSize: 14,
    fontWeight: '500',
  },
  equipServiced: {
    fontSize: 11,
    marginTop: 2,
  },
});
