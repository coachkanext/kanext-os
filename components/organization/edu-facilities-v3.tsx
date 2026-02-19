/**
 * Edu Facilities V3 — 3-pill ViewBar (Campus | Bookings | Maintenance)
 * Florida Memorial University · President perspective
 * HBCU · Founded 1879 · Miami Gardens, FL · SACSCOC Accredited
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

type ViewId = 'campus' | 'bookings' | 'maintenance';

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'campus', label: 'Campus' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'maintenance', label: 'Maintenance' },
];

type BuildingType = 'Academic' | 'Student Life' | 'Residential' | 'Athletic';
type Condition = 'Good' | 'Fair' | 'Poor';

interface Building {
  id: string;
  name: string;
  type: BuildingType;
  capacity: number;
  condition: Condition;
  icon: 'graduationcap.fill' | 'person.3.fill' | 'building.2.fill' | 'sportscourt.fill' | 'book.fill';
}

const BUILDINGS: Building[] = [
  { id: 'b1', name: 'Science Building', type: 'Academic', capacity: 400, condition: 'Good', icon: 'graduationcap.fill' },
  { id: 'b2', name: 'Business Building', type: 'Academic', capacity: 300, condition: 'Good', icon: 'graduationcap.fill' },
  { id: 'b3', name: 'Library', type: 'Academic', capacity: 200, condition: 'Fair', icon: 'book.fill' },
  { id: 'b4', name: 'Student Center', type: 'Student Life', capacity: 500, condition: 'Good', icon: 'person.3.fill' },
  { id: 'b5', name: 'Residence Hall A', type: 'Residential', capacity: 200, condition: 'Good', icon: 'building.2.fill' },
  { id: 'b6', name: 'Residence Hall B', type: 'Residential', capacity: 180, condition: 'Fair', icon: 'building.2.fill' },
  { id: 'b7', name: 'Athletic Center', type: 'Athletic', capacity: 2000, condition: 'Good', icon: 'sportscourt.fill' },
  { id: 'b8', name: 'Dining Hall', type: 'Student Life', capacity: 300, condition: 'Good', icon: 'person.3.fill' },
];

type BookingType = 'Recurring' | 'One-Time' | 'Event';

interface Booking {
  id: string;
  title: string;
  location: string;
  schedule: string;
  type: BookingType;
}

const BOOKINGS: Booking[] = [
  { id: 'bk1', title: 'Class Schedules — Spring 2025', location: 'Science & Business Buildings', schedule: 'Mon-Fri 8AM-6PM', type: 'Recurring' },
  { id: 'bk2', title: 'Weekly Faculty Meeting', location: 'Business Building Room 201', schedule: 'Tuesdays 2PM-3PM', type: 'Recurring' },
  { id: 'bk3', title: 'Guest Speaker — Convocation', location: 'Student Center Auditorium', schedule: 'Feb 20, 10AM-12PM', type: 'Event' },
  { id: 'bk4', title: 'Library Study Room Reservations', location: 'Library Rooms 101-106', schedule: 'Daily 9AM-9PM', type: 'Recurring' },
  { id: 'bk5', title: 'Basketball Home Games', location: 'Athletic Center', schedule: 'Saturdays, Feb-Mar', type: 'Event' },
  { id: 'bk6', title: 'Student Org Fair', location: 'Student Center Main Hall', schedule: 'Mar 1, 11AM-3PM', type: 'One-Time' },
];

type Priority = 'Urgent' | 'Normal' | 'Low';

interface WorkOrder {
  id: string;
  title: string;
  location: string;
  priority: Priority;
  status: 'Open' | 'In Progress' | 'Scheduled';
}

const WORK_ORDERS: WorkOrder[] = [
  { id: 'wo1', title: 'Library roof repair', location: 'Library', priority: 'Urgent', status: 'In Progress' },
  { id: 'wo2', title: 'Residence Hall B plumbing', location: 'Residence Hall B', priority: 'Normal', status: 'Open' },
  { id: 'wo3', title: 'Science lab equipment calibration', location: 'Science Building Lab 3', priority: 'Normal', status: 'Scheduled' },
  { id: 'wo4', title: 'Parking lot lighting replacement', location: 'Lot C', priority: 'Low', status: 'Open' },
  { id: 'wo5', title: 'Student Center HVAC maintenance', location: 'Student Center', priority: 'Normal', status: 'Scheduled' },
];

const CAPITAL_PROJECTS = [
  { id: 'cp1', name: 'New STEM Building', budget: '$12M', status: 'In Progress', completePct: 35 },
];

const DEFERRED_MAINTENANCE = [
  { id: 'dm1', item: 'Dining Hall kitchen renovation', estimate: '$450K' },
  { id: 'dm2', item: 'Residence Hall A elevator modernization', estimate: '$220K' },
  { id: 'dm3', item: 'Athletic Center locker room update', estimate: '$180K' },
];

const CONDITION_COLOR: Record<Condition, string> = {
  Good: '#22C55E',
  Fair: '#F59E0B',
  Poor: '#EF4444',
};

const PRIORITY_COLOR: Record<Priority, string> = {
  Urgent: '#EF4444',
  Normal: '#6AA9FF',
  Low: '#22C55E',
};

const BOOKING_TYPE_COLOR: Record<BookingType, string> = {
  Recurring: '#6AA9FF',
  'One-Time': '#F59E0B',
  Event: '#A78BFA',
};

const STATUS_COLOR: Record<string, string> = {
  Open: '#F59E0B',
  'In Progress': '#6AA9FF',
  Scheduled: '#22C55E',
};

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
// VIEW: CAMPUS
// =============================================================================

function CampusView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
        CAMPUS BUILDINGS ({BUILDINGS.length})
      </ThemedText>
      {BUILDINGS.map((bldg) => (
        <Pressable
          key={bldg.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.selectionAsync()}
        >
          <View style={s.bldgHeader}>
            <IconSymbol name={bldg.icon} size={18} color={accentColor} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.bldgName, { color: colors.text }]}>{bldg.name}</ThemedText>
              <ThemedText style={[s.bldgType, { color: colors.textSecondary }]}>{bldg.type}</ThemedText>
            </View>
            <StatusBadge label={bldg.condition.toUpperCase()} color={CONDITION_COLOR[bldg.condition]} />
          </View>
          <View style={[s.bldgMeta, { borderTopColor: colors.border }]}>
            <View style={s.metaItem}>
              <IconSymbol name="person.3.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textSecondary }]}>
                Capacity: {bldg.capacity.toLocaleString()}
              </ThemedText>
            </View>
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
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
        ACTIVE BOOKINGS ({BOOKINGS.length})
      </ThemedText>
      {BOOKINGS.map((bk) => (
        <Pressable
          key={bk.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.selectionAsync()}
        >
          <View style={s.bookingHeader}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.bookingTitle, { color: colors.text }]}>{bk.title}</ThemedText>
              <ThemedText style={[s.bookingLoc, { color: colors.textSecondary }]}>{bk.location}</ThemedText>
            </View>
            <StatusBadge label={bk.type.toUpperCase()} color={BOOKING_TYPE_COLOR[bk.type]} />
          </View>
          <View style={[s.bookingSchedule, { borderTopColor: colors.border }]}>
            <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
            <ThemedText style={[s.scheduleText, { color: colors.textSecondary }]}>{bk.schedule}</ThemedText>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: MAINTENANCE
// =============================================================================

function MaintenanceView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Work Orders */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
        WORK ORDERS ({WORK_ORDERS.length})
      </ThemedText>
      {WORK_ORDERS.map((wo) => (
        <View key={wo.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.woHeader}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.woTitle, { color: colors.text }]}>{wo.title}</ThemedText>
              <ThemedText style={[s.woLoc, { color: colors.textSecondary }]}>{wo.location}</ThemedText>
            </View>
            <StatusBadge label={wo.priority.toUpperCase()} color={PRIORITY_COLOR[wo.priority]} />
          </View>
          <View style={[s.woStatus, { borderTopColor: colors.border }]}>
            <StatusBadge label={wo.status.toUpperCase()} color={STATUS_COLOR[wo.status]} />
          </View>
        </View>
      ))}

      {/* Capital Projects */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>CAPITAL PROJECTS</ThemedText>
      {CAPITAL_PROJECTS.map((cp) => (
        <View key={cp.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.cpHeader}>
            <IconSymbol name="building.2.fill" size={18} color={accentColor} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.cpName, { color: colors.text }]}>{cp.name}</ThemedText>
              <ThemedText style={[s.cpBudget, { color: colors.textSecondary }]}>Budget: {cp.budget}</ThemedText>
            </View>
            <StatusBadge label={cp.status.toUpperCase()} color="#6AA9FF" />
          </View>
          <View style={[s.progressContainer, { marginTop: 10 }]}>
            <View style={[s.progressTrack, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
              <View style={[s.progressFill, { width: `${cp.completePct}%`, backgroundColor: accentColor + '60' }]} />
            </View>
            <ThemedText style={[s.pctLabel, { color: colors.textSecondary }]}>{cp.completePct}%</ThemedText>
          </View>
        </View>
      ))}

      {/* Deferred Maintenance */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>DEFERRED MAINTENANCE</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {DEFERRED_MAINTENANCE.map((dm, idx) => (
          <View
            key={dm.id}
            style={[
              s.deferredRow,
              { borderBottomColor: colors.border },
              idx === DEFERRED_MAINTENANCE.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <ThemedText style={[s.deferredItem, { color: colors.text }]}>{dm.item}</ThemedText>
            <ThemedText style={[s.deferredEst, { color: colors.textSecondary }]}>{dm.estimate}</ThemedText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function EduFacilities({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewId>('campus');

  const handlePillPress = useCallback((id: ViewId) => {
    Haptics.selectionAsync();
    setActiveView(id);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'campus':
        return <CampusView colors={colors} accentColor={accentColor} />;
      case 'bookings':
        return <BookingsView colors={colors} accentColor={accentColor} />;
      case 'maintenance':
        return <MaintenanceView colors={colors} accentColor={accentColor} />;
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
                { backgroundColor: isActive ? accentColor : 'rgba(255,255,255,0.08)' },
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

  // -- Building --
  bldgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bldgName: {
    fontSize: 15,
    fontWeight: '700',
  },
  bldgType: {
    fontSize: 12,
    marginTop: 2,
  },
  bldgMeta: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },

  // -- Booking --
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bookingTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  bookingLoc: {
    fontSize: 12,
    marginTop: 2,
  },
  bookingSchedule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  scheduleText: {
    fontSize: 12,
  },

  // -- Work Orders --
  woHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  woTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  woLoc: {
    fontSize: 12,
    marginTop: 2,
  },
  woStatus: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
  },

  // -- Capital Projects --
  cpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cpName: {
    fontSize: 15,
    fontWeight: '700',
  },
  cpBudget: {
    fontSize: 12,
    marginTop: 2,
  },

  // -- Progress --
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  pctLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    width: 32,
    textAlign: 'right',
  },

  // -- Deferred --
  deferredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  deferredItem: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  deferredEst: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
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
});
