/**
 * Organization Facilities Tab -- 11-tab Facilities Hub (Sports Mode).
 * Dashboard, Spaces, Bookings, Work Orders, Issues, Inventory,
 * Vendors, Safety, Reports, Audit, Settings.
 *
 * Uses PagedTabBar + PagerView with EdgeHoldAdvance wrapping.
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  SectionList,
  Pressable,
  Switch,
  StyleSheet,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PagedTabBar } from '@/components/ui/paged-tab-bar';
import { EdgeHoldAdvance } from '@/components/ui/edge-hold-advance';
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
;
import {
  FACILITIES_HUB_TABS,
  FACILITY_SPACES,
  FACILITY_BOOKINGS,
  FACILITY_WORK_ORDERS,
  FACILITY_ISSUES,
  FACILITY_ASSETS,
  FACILITY_VENDORS,
  SAFETY_INSPECTIONS,
  FACILITY_AUDIT_LOG,
  FACILITY_SETTINGS,
} from '@/data/mock-facilities-v2';
import type {
  FacilitySpace,
  Booking,
  WorkOrder,
  FacilityIssue,
  FacilityAsset,
  FacilityVendor,
  SafetyInspection,
  FacilityAuditEntry,
  FacilitySettingToggle,
} from '@/data/mock-facilities-v2';

// =============================================================================
// HELPERS
// =============================================================================

function fmtTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function dayLabel(d: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

function timeAgo(d: Date): string {
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// =============================================================================
// PROPS
// =============================================================================

interface OrgFacilitiesTabProps {
  colors: typeof Colors.light;
  accentColor: string;
}

// =============================================================================
// STATUS / SEVERITY COLOR MAPS
// =============================================================================

const SPACE_STATUS_COLOR: Record<string, string> = {
  open: '#22C55E',
  booked: accent,
  maintenance: '#F59E0B',
  closed: '#EF4444',
};

const WORK_ORDER_STATUS_COLOR: Record<string, string> = {
  requested: '#A1A1AA',
  approved: accent,
  assigned: '#F59E0B',
  in_progress: '#F59E0B',
  completed: '#22C55E',
  closed: '#A1A1AA',
};

const SEVERITY_COLOR: Record<string, string> = {
  P0: '#EF4444',
  P1: '#F59E0B',
  P2: accent,
  P3: '#A1A1AA',
  critical: '#EF4444',
  high: '#F59E0B',
  medium: accent,
  low: '#A1A1AA',
};

const ISSUE_STATUS_COLOR: Record<string, string> = {
  open: '#EF4444',
  investigating: '#F59E0B',
  resolved: '#22C55E',
  closed: '#A1A1AA',
};

const SAFETY_STATUS_COLOR: Record<string, string> = {
  compliant: '#22C55E',
  due_soon: '#F59E0B',
  overdue: '#EF4444',
};

const CONDITION_COLOR: Record<string, string> = {
  good: '#22C55E',
  needs_service: '#F59E0B',
  out: '#EF4444',
};

const BOOKING_TYPE_COLOR: Record<string, string> = {
  practice: accent,
  game: '#EF4444',
  meeting: accent,
  event: '#F59E0B',
  maintenance: '#F59E0B',
  other: '#A1A1AA',
};

// =============================================================================
// AUDIT ICON / COLOR MAP
// =============================================================================

function auditIcon(action: string): string {
  switch (action) {
    case 'space_booked':
      return 'calendar.badge.plus';
    case 'work_order_created':
      return 'wrench.and.screwdriver.fill';
    case 'issue_reported':
      return 'exclamationmark.triangle.fill';
    case 'issue_resolved':
      return 'checkmark.circle.fill';
    case 'inspection_completed':
      return 'checkmark.seal.fill';
    case 'asset_updated':
      return 'shippingbox.fill';
    case 'vendor_added':
      return 'person.badge.plus';
    case 'setting_changed':
      return 'gearshape.fill';
    case 'booking_cancelled':
      return 'calendar.badge.minus';
    case 'work_order_completed':
      return 'checkmark.circle.fill';
    default:
      return 'clock.fill';
  }
}

function auditColor(action: string): string {
  switch (action) {
    case 'space_booked':
      return accent;
    case 'work_order_created':
      return '#F59E0B';
    case 'issue_reported':
      return '#EF4444';
    case 'issue_resolved':
      return '#22C55E';
    case 'inspection_completed':
      return accent;
    case 'asset_updated':
      return accent;
    case 'vendor_added':
      return accent;
    case 'setting_changed':
      return '#A1A1AA';
    case 'booking_cancelled':
      return '#EF4444';
    case 'work_order_completed':
      return '#22C55E';
    default:
      return '#A1A1AA';
  }
}

// =============================================================================
// REPORT CARD DATA
// =============================================================================

const REPORT_CARDS = [
  {
    id: 'bookings-export',
    icon: 'calendar' as const,
    title: 'Bookings Export',
    description: 'Export all bookings for the selected date range as CSV.',
  },
  {
    id: 'work-orders-summary',
    icon: 'wrench.and.screwdriver' as const,
    title: 'Work Orders Summary',
    description: 'Summary of all work orders by status, priority, and assignee.',
  },
  {
    id: 'issues-log',
    icon: 'exclamationmark.triangle' as const,
    title: 'Issues Log',
    description: 'Full log of reported facility issues with resolution status.',
  },
  {
    id: 'safety-inspection-log',
    icon: 'checkmark.shield' as const,
    title: 'Safety Inspection Log',
    description: 'Inspection history, compliance status, and upcoming due dates.',
  },
  {
    id: 'inventory-report',
    icon: 'shippingbox' as const,
    title: 'Inventory Report',
    description: 'Current asset inventory with condition and service schedule.',
  },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function OrgFacilitiesTab({ colors, accentColor }: OrgFacilitiesTabProps) {
  // === State ===
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const [settingToggles, setSettingToggles] = useState<Record<string, boolean>>({});

  // === Callbacks ===
  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  const handlePageSelected = useCallback((e: { nativeEvent: { position: number } }) => {
    setActiveIndex(e.nativeEvent.position);
  }, []);

  const handleAdvance = useCallback((newIndex: number) => {
    pagerRef.current?.setPage(newIndex);
  }, []);

  // ===================================================================
  // TAB 0: DASHBOARD
  // ===================================================================

  const renderDashboard = () => {
    // Today's bookings — next 3
    const todayBookings = FACILITY_BOOKINGS.slice(0, 3);

    // Open work orders count
    const openWorkOrders = FACILITY_WORK_ORDERS.filter(
      (wo) => wo.status !== 'completed' && wo.status !== 'closed',
    );
    const p0p1Count = openWorkOrders.filter(
      (wo) => wo.severity === 'critical' || wo.severity === 'high',
    ).length;

    // Open issues count
    const openIssues = FACILITY_ISSUES.filter(
      (iss) => iss.status === 'open' || iss.status === 'investigating',
    );
    const critHighCount = openIssues.filter(
      (iss) => iss.severity === 'critical' || iss.severity === 'high',
    ).length;

    // Most-used spaces (first 4)
    const topSpaces = FACILITY_SPACES.slice(0, 4);

    // Safety pulse
    const safetyDueSoon = SAFETY_INSPECTIONS.filter((si) => si.status === 'due_soon').length;
    const safetyOverdue = SAFETY_INSPECTIONS.filter((si) => si.status === 'overdue').length;

    // Vendor pulse — vendors with upcoming renewals
    const vendorsWithRenewals = FACILITY_VENDORS.filter((v) => v.renewalDate != null);

    return (
      <ScrollView contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
        {/* Today's Bookings */}
        <ThemedText style={[s.sectionHeader, { color: colors.textTertiary }]}>
          TODAY'S BOOKINGS
        </ThemedText>
        {todayBookings.map((booking) => (
          <View
            key={booking.id}
            style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.cardRow}>
              <View style={s.cardInfo}>
                <View style={s.titleRow}>
                  <ThemedText style={[s.cardTitle, { color: colors.text }]} numberOfLines={1}>
                    {booking.title}
                  </ThemedText>
                  <View
                    style={[
                      s.badge,
                      { backgroundColor: (BOOKING_TYPE_COLOR[booking.type] ?? '#A1A1AA') + '33' },
                    ]}
                  >
                    <ThemedText
                      style={[
                        s.badgeText,
                        { color: BOOKING_TYPE_COLOR[booking.type] ?? '#A1A1AA' },
                      ]}
                    >
                      {booking.type}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={[s.cardSub, { color: colors.textSecondary }]}>
                  {fmtTime(booking.start)} - {fmtTime(booking.end)}
                </ThemedText>
                <ThemedText style={[s.cardSub, { color: colors.textTertiary }]}>
                  {booking.spaceName}
                </ThemedText>
                <ThemedText style={[s.cardSub, { color: colors.textTertiary }]}>
                  {booking.owner}
                </ThemedText>
              </View>
            </View>
          </View>
        ))}

        {/* Quick Actions */}
        <ThemedText style={[s.sectionHeader, { color: colors.textTertiary, marginTop: Spacing.md }]}>
          QUICK ACTIONS
        </ThemedText>
        <View style={s.quickActionsRow}>
          <Pressable
            style={[s.quickActionBtn, { backgroundColor: accentColor }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="calendar.badge.plus" size={16} color="#000" />
            <ThemedText style={s.quickActionText}>Book Space</ThemedText>
          </Pressable>
          <Pressable
            style={[s.quickActionBtn, { backgroundColor: accentColor }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="exclamationmark.triangle" size={16} color="#000" />
            <ThemedText style={s.quickActionText}>Report Issue</ThemedText>
          </Pressable>
        </View>

        {/* Facility Pulse */}
        <ThemedText style={[s.sectionHeader, { color: colors.textTertiary, marginTop: Spacing.md }]}>
          FACILITY PULSE
        </ThemedText>
        <View style={s.pulseRow}>
          <View style={[s.pulseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.pulseValue, { color: colors.text }]}>
              {openWorkOrders.length}
            </ThemedText>
            <ThemedText style={[s.pulseLabel, { color: colors.textTertiary }]}>
              Open Work Orders
            </ThemedText>
            <ThemedText style={[s.pulseDetail, { color: '#F59E0B' }]}>
              {p0p1Count} P0/P1
            </ThemedText>
          </View>
          <View style={[s.pulseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.pulseValue, { color: colors.text }]}>
              {openIssues.length}
            </ThemedText>
            <ThemedText style={[s.pulseLabel, { color: colors.textTertiary }]}>
              Open Issues
            </ThemedText>
            <ThemedText style={[s.pulseDetail, { color: '#EF4444' }]}>
              {critHighCount} critical/high
            </ThemedText>
          </View>
        </View>

        {/* Most-Used Spaces */}
        <ThemedText style={[s.sectionHeader, { color: colors.textTertiary, marginTop: Spacing.md }]}>
          MOST-USED SPACES
        </ThemedText>
        {topSpaces.map((space, idx) => {
          const usagePercent = Math.max(0.2, 1 - idx * 0.2);
          return (
            <View
              key={space.id}
              style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={s.spaceUsageRow}>
                <ThemedText style={[s.cardTitle, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                  {space.name}
                </ThemedText>
                <View style={[s.badge, { backgroundColor: (SPACE_STATUS_COLOR[space.status] ?? '#A1A1AA') + '33' }]}>
                  <ThemedText style={[s.badgeText, { color: SPACE_STATUS_COLOR[space.status] ?? '#A1A1AA' }]}>
                    {space.status}
                  </ThemedText>
                </View>
              </View>
              <View style={s.usageBarContainer}>
                <View style={[s.usageBarTrack, { backgroundColor: colors.text + '10' }]}>
                  <View
                    style={[
                      s.usageBarFill,
                      { width: `${usagePercent * 100}%`, backgroundColor: accentColor },
                    ]}
                  />
                </View>
              </View>
            </View>
          );
        })}

        {/* Safety Pulse */}
        <ThemedText style={[s.sectionHeader, { color: colors.textTertiary, marginTop: Spacing.md }]}>
          SAFETY PULSE
        </ThemedText>
        <View style={s.pulseRow}>
          <View style={[s.pulseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.pulseValue, { color: '#F59E0B' }]}>
              {safetyDueSoon}
            </ThemedText>
            <ThemedText style={[s.pulseLabel, { color: colors.textTertiary }]}>
              Due Soon
            </ThemedText>
          </View>
          <View style={[s.pulseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.pulseValue, { color: '#EF4444' }]}>
              {safetyOverdue}
            </ThemedText>
            <ThemedText style={[s.pulseLabel, { color: colors.textTertiary }]}>
              Overdue
            </ThemedText>
          </View>
        </View>

        {/* Vendor Pulse */}
        <ThemedText style={[s.sectionHeader, { color: colors.textTertiary, marginTop: Spacing.md }]}>
          VENDOR PULSE
        </ThemedText>
        <View style={[s.pulseCard, { backgroundColor: colors.card, borderColor: colors.border, alignSelf: 'stretch' }]}>
          <ThemedText style={[s.pulseValue, { color: colors.text }]}>
            {vendorsWithRenewals.length}
          </ThemedText>
          <ThemedText style={[s.pulseLabel, { color: colors.textTertiary }]}>
            Vendors with upcoming renewals
          </ThemedText>
        </View>
      </ScrollView>
    );
  };

  // ===================================================================
  // TAB 1: SPACES
  // ===================================================================

  const renderSpaces = () => (
    <FlatList<FacilitySpace>
      data={FACILITY_SPACES}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      renderItem={({ item }) => {
        const statusColor = SPACE_STATUS_COLOR[item.status] ?? '#A1A1AA';
        return (
          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.cardInfo}>
              <View style={s.titleRow}>
                <ThemedText style={[s.cardTitle, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                  {item.name}
                </ThemedText>
                <View style={[s.badge, { backgroundColor: statusColor + '33' }]}>
                  <ThemedText style={[s.badgeText, { color: statusColor }]}>
                    {item.status}
                  </ThemedText>
                </View>
              </View>
              <View style={s.badgeRow}>
                <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>
                    {item.type}
                  </ThemedText>
                </View>
                {item.capacity != null && (
                  <ThemedText style={[s.cardSub, { color: colors.textSecondary }]}>
                    Cap: {item.capacity}
                  </ThemedText>
                )}
              </View>
              {item.location != null && (
                <ThemedText style={[s.cardSub, { color: colors.textTertiary }]}>
                  {item.location}
                </ThemedText>
              )}
              <View style={s.spaceActionsRow}>
                <Pressable
                  style={[s.inlineBtn, { backgroundColor: accentColor + '18' }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <IconSymbol name="calendar.badge.plus" size={12} color={accentColor} />
                  <ThemedText style={[s.inlineBtnText, { color: accentColor }]}>Book</ThemedText>
                </Pressable>
                <Pressable
                  style={[s.inlineBtn, { backgroundColor: colors.backgroundTertiary }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <IconSymbol name="exclamationmark.triangle" size={12} color={colors.textSecondary} />
                  <ThemedText style={[s.inlineBtnText, { color: colors.textSecondary }]}>Report Issue</ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
        );
      }}
    />
  );

  // ===================================================================
  // TAB 2: BOOKINGS
  // ===================================================================

  const renderBookings = () => {
    // Sort by start time
    const sortedBookings = [...FACILITY_BOOKINGS].sort((a, b) =>
      a.start.getTime() - b.start.getTime(),
    );

    // Group by day label
    const grouped: Record<string, Booking[]> = {};
    for (const booking of sortedBookings) {
      const dl = dayLabel(booking.start);
      if (!grouped[dl]) grouped[dl] = [];
      grouped[dl].push(booking);
    }
    const dayLabels = Object.keys(grouped);

    return (
      <ScrollView contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
        {dayLabels.map((day) => (
          <View key={day}>
            <ThemedText style={[s.sectionHeader, { color: colors.textTertiary }]}>
              {day.toUpperCase()}
            </ThemedText>
            {grouped[day].map((booking) => (
              <View
                key={booking.id}
                style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={s.cardInfo}>
                  <View style={s.titleRow}>
                    <ThemedText style={[s.cardTitle, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                      {booking.title}
                    </ThemedText>
                    <View
                      style={[
                        s.badge,
                        { backgroundColor: (BOOKING_TYPE_COLOR[booking.type] ?? '#A1A1AA') + '33' },
                      ]}
                    >
                      <ThemedText
                        style={[
                          s.badgeText,
                          { color: BOOKING_TYPE_COLOR[booking.type] ?? '#A1A1AA' },
                        ]}
                      >
                        {booking.type}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[s.cardSub, { color: colors.textSecondary }]}>
                    {fmtTime(booking.start)} - {fmtTime(booking.end)}
                  </ThemedText>
                  <ThemedText style={[s.cardSub, { color: colors.textTertiary }]}>
                    {booking.spaceName}
                  </ThemedText>
                  <ThemedText style={[s.cardSub, { color: colors.textTertiary }]}>
                    {booking.owner}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    );
  };

  // ===================================================================
  // TAB 3: WORK ORDERS
  // ===================================================================

  const renderWorkOrders = () => (
    <FlatList<WorkOrder>
      data={FACILITY_WORK_ORDERS}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      renderItem={({ item }) => {
        const sevColor = SEVERITY_COLOR[item.severity] ?? '#A1A1AA';
        const statusColor = WORK_ORDER_STATUS_COLOR[item.status] ?? '#A1A1AA';
        return (
          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.cardInfo}>
              <View style={s.titleRow}>
                <View style={[s.badge, { backgroundColor: sevColor + '33' }]}>
                  <ThemedText style={[s.badgeText, { color: sevColor }]}>
                    {item.severity}
                  </ThemedText>
                </View>
                <ThemedText style={[s.cardTitle, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                  {item.title}
                </ThemedText>
              </View>
              <ThemedText style={[s.cardSub, { color: colors.textSecondary }]}>
                {item.spaceName}
              </ThemedText>
              <View style={s.badgeRow}>
                <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>
                    {item.issueType}
                  </ThemedText>
                </View>
                <View style={[s.badge, { backgroundColor: statusColor + '33' }]}>
                  <ThemedText style={[s.badgeText, { color: statusColor }]}>
                    {item.status.replace(/_/g, ' ')}
                  </ThemedText>
                </View>
              </View>
              {item.assignee != null && (
                <ThemedText style={[s.cardSub, { color: colors.textTertiary }]}>
                  Assigned: {item.assignee}
                </ThemedText>
              )}
              <ThemedText style={[s.cardSub, { color: colors.textTertiary }]}>
                {fmtDate(item.createdAt)}
              </ThemedText>
            </View>
          </View>
        );
      }}
    />
  );

  // ===================================================================
  // TAB 4: ISSUES
  // ===================================================================

  const renderIssues = () => (
    <FlatList<FacilityIssue>
      data={FACILITY_ISSUES}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      renderItem={({ item }) => {
        const sevColor = SEVERITY_COLOR[item.severity] ?? '#A1A1AA';
        const statusColor = ISSUE_STATUS_COLOR[item.status] ?? '#A1A1AA';
        return (
          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.cardInfo}>
              <View style={s.titleRow}>
                <View style={[s.badge, { backgroundColor: sevColor + '33' }]}>
                  <ThemedText style={[s.badgeText, { color: sevColor }]}>
                    {item.severity}
                  </ThemedText>
                </View>
                <ThemedText style={[s.cardTitle, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                  {item.title}
                </ThemedText>
              </View>
              <ThemedText style={[s.cardSub, { color: colors.textSecondary }]}>
                {item.spaceName}
              </ThemedText>
              <ThemedText style={[s.cardSub, { color: colors.textTertiary }]}>
                Reported by: {item.owner}
              </ThemedText>
              <View style={s.badgeRow}>
                <View style={[s.badge, { backgroundColor: statusColor + '33' }]}>
                  <ThemedText style={[s.badgeText, { color: statusColor }]}>
                    {item.status}
                  </ThemedText>
                </View>
              </View>
              {item.lastUpdate != null && (
                <ThemedText style={[s.cardSub, { color: colors.textTertiary }]}>
                  Last update: {item.lastUpdate}
                </ThemedText>
              )}
            </View>
          </View>
        );
      }}
    />
  );

  // ===================================================================
  // TAB 5: INVENTORY
  // ===================================================================

  const renderInventory = () => {
    // Group assets by category
    const categoryMap: Record<string, FacilityAsset[]> = {};
    for (const asset of FACILITY_ASSETS) {
      if (!categoryMap[asset.category]) categoryMap[asset.category] = [];
      categoryMap[asset.category].push(asset);
    }
    const sections = Object.keys(categoryMap).map((cat) => ({
      title: cat,
      data: categoryMap[cat],
    }));

    return (
      <SectionList<FacilityAsset>
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        renderSectionHeader={({ section }) => (
          <ThemedText style={[s.sectionHeader, { color: colors.textTertiary }]}>
            {section.title.toUpperCase()}
          </ThemedText>
        )}
        renderItem={({ item }) => {
          const condColor = CONDITION_COLOR[item.condition] ?? '#A1A1AA';
          return (
            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={s.cardInfo}>
                <View style={s.titleRow}>
                  <ThemedText style={[s.cardTitle, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <View style={[s.badge, { backgroundColor: condColor + '33' }]}>
                    <ThemedText style={[s.badgeText, { color: condColor }]}>
                      {item.condition.replace(/_/g, ' ')}
                    </ThemedText>
                  </View>
                </View>
                {item.assignedSpaceName != null && (
                  <ThemedText style={[s.cardSub, { color: colors.textSecondary }]}>
                    {item.assignedSpaceName}
                  </ThemedText>
                )}
                <View style={s.badgeRow}>
                  {item.quantity != null && (
                    <ThemedText style={[s.cardSub, { color: colors.textTertiary }]}>
                      Qty: {item.quantity}
                    </ThemedText>
                  )}
                  {item.nextServiceDate != null && (
                    <ThemedText style={[s.cardSub, { color: colors.textTertiary }]}>
                      Next service: {fmtDate(item.nextServiceDate!)}
                    </ThemedText>
                  )}
                </View>
              </View>
            </View>
          );
        }}
      />
    );
  };

  // ===================================================================
  // TAB 6: VENDORS
  // ===================================================================

  const renderVendors = () => (
    <FlatList<FacilityVendor>
      data={FACILITY_VENDORS}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      renderItem={({ item }) => {
        const openWOCount = FACILITY_WORK_ORDERS.filter(
          (wo) =>
            wo.vendor === item.name &&
            wo.status !== 'completed' &&
            wo.status !== 'closed',
        ).length;
        return (
          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.cardInfo}>
              <View style={s.titleRow}>
                <ThemedText style={[s.cardTitle, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                  {item.name}
                </ThemedText>
                {openWOCount > 0 && (
                  <View style={[s.badge, { backgroundColor: '#F59E0B33' }]}>
                    <ThemedText style={[s.badgeText, { color: '#F59E0B' }]}>
                      {openWOCount} open WO
                    </ThemedText>
                  </View>
                )}
              </View>
              <View style={s.badgeRow}>
                <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>
                    {item.serviceType}
                  </ThemedText>
                </View>
              </View>
              {item.linkedSpaces != null && item.linkedSpaces.length > 0 && (
                <ThemedText style={[s.cardSub, { color: colors.textSecondary }]}>
                  Spaces: {item.linkedSpaces.join(', ')}
                </ThemedText>
              )}
              <ThemedText style={[s.cardSub, { color: colors.textTertiary }]}>
                Contact: {item.contact}
              </ThemedText>
              {item.renewalDate != null && (
                <ThemedText style={[s.cardSub, { color: colors.textTertiary }]}>
                  Renewal: {fmtDate(item.renewalDate!)}
                </ThemedText>
              )}
            </View>
          </View>
        );
      }}
    />
  );

  // ===================================================================
  // TAB 7: SAFETY
  // ===================================================================

  const renderSafety = () => (
    <FlatList<SafetyInspection>
      data={SAFETY_INSPECTIONS}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      renderItem={({ item }) => {
        const statusColor = SAFETY_STATUS_COLOR[item.status] ?? '#A1A1AA';
        return (
          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.cardInfo}>
              <View style={s.titleRow}>
                <ThemedText style={[s.cardTitle, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                  {item.template}
                </ThemedText>
                <View style={[s.badge, { backgroundColor: statusColor + '33' }]}>
                  <ThemedText style={[s.badgeText, { color: statusColor }]}>
                    {item.status.replace(/_/g, ' ')}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[s.cardSub, { color: colors.textSecondary }]}>
                {item.spaceName}
              </ThemedText>
              <View style={s.badgeRow}>
                <View style={[s.badge, { backgroundColor: colors.backgroundTertiary }]}>
                  <ThemedText style={[s.badgeText, { color: colors.textSecondary }]}>
                    {item.cadence}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[s.cardSub, { color: colors.textTertiary }]}>
                Next due: {fmtDate(item.nextDue)}
              </ThemedText>
              {item.lastCompleted != null && (
                <ThemedText style={[s.cardSub, { color: colors.textTertiary }]}>
                  Last completed: {fmtDate(item.lastCompleted)}
                </ThemedText>
              )}
            </View>
          </View>
        );
      }}
    />
  );

  // ===================================================================
  // TAB 8: REPORTS
  // ===================================================================

  const renderReports = () => (
    <ScrollView contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
      {REPORT_CARDS.map((report) => (
        <View
          key={report.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.reportCardRow}>
            <View style={[s.reportIconCircle, { backgroundColor: accentColor + '18' }]}>
              <IconSymbol name={report.icon as any} size={20} color={accentColor} />
            </View>
            <View style={s.reportCardInfo}>
              <ThemedText style={[s.cardTitle, { color: colors.text }]}>
                {report.title}
              </ThemedText>
              <ThemedText style={[s.cardSub, { color: colors.textTertiary }]}>
                {report.description}
              </ThemedText>
            </View>
          </View>
          <Pressable
            style={[s.exportBtn, { backgroundColor: accentColor }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="square.and.arrow.up" size={14} color="#000" />
            <ThemedText style={s.exportBtnText}>Export</ThemedText>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );

  // ===================================================================
  // TAB 9: AUDIT
  // ===================================================================

  const renderAudit = () => {
    const sortedLog = [...FACILITY_AUDIT_LOG].sort((a, b) =>
      b.timestamp.getTime() - a.timestamp.getTime(),
    );

    return (
      <FlatList<FacilityAuditEntry>
        data={sortedLog}
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
              <View style={s.auditInfo}>
                <ThemedText style={[s.auditAction, { color: colors.text }]}>
                  {item.action.replace(/_/g, ' ')}
                </ThemedText>
                <ThemedText style={[s.cardSub, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.target}
                </ThemedText>
                <ThemedText style={[s.auditMeta, { color: colors.textTertiary }]}>
                  {item.actor} · {timeAgo(item.timestamp)}
                </ThemedText>
              </View>
            </View>
          );
        }}
      />
    );
  };

  // ===================================================================
  // TAB 10: SETTINGS
  // ===================================================================

  const renderSettings = () => (
    <ScrollView contentContainerStyle={s.settingsContent} showsVerticalScrollIndicator={false}>
      <ThemedText style={[s.sectionHeader, { color: colors.textTertiary }]}>
        FACILITIES SETTINGS
      </ThemedText>
      <View style={[s.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {FACILITY_SETTINGS.map((setting: FacilitySettingToggle, index: number) => {
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
    </ScrollView>
  );

  // ===================================================================
  // RENDER -- MAIN
  // ===================================================================

  return (
    <View style={s.container}>
      {/* === PagedTabBar === */}
      <PagedTabBar
        tabs={FACILITIES_HUB_TABS}
        activeIndex={activeIndex}
        onTabPress={handleTabPress}
      />

      {/* === EdgeHoldAdvance + PagerView === */}
      <EdgeHoldAdvance
        activeIndex={activeIndex}
        tabCount={FACILITIES_HUB_TABS.length}
        onAdvance={handleAdvance}
      >
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={handlePageSelected}
        >
          {/* Page 0: Dashboard */}
          <View key="dashboard" style={{ flex: 1 }}>
            {renderDashboard()}
          </View>

          {/* Page 1: Spaces */}
          <View key="spaces" style={{ flex: 1 }}>
            {renderSpaces()}
          </View>

          {/* Page 2: Bookings */}
          <View key="bookings" style={{ flex: 1 }}>
            {renderBookings()}
          </View>

          {/* Page 3: Work Orders */}
          <View key="work-orders" style={{ flex: 1 }}>
            {renderWorkOrders()}
          </View>

          {/* Page 4: Issues */}
          <View key="issues" style={{ flex: 1 }}>
            {renderIssues()}
          </View>

          {/* Page 5: Inventory */}
          <View key="inventory" style={{ flex: 1 }}>
            {renderInventory()}
          </View>

          {/* Page 6: Vendors */}
          <View key="vendors" style={{ flex: 1 }}>
            {renderVendors()}
          </View>

          {/* Page 7: Safety */}
          <View key="safety" style={{ flex: 1 }}>
            {renderSafety()}
          </View>

          {/* Page 8: Reports */}
          <View key="reports" style={{ flex: 1 }}>
            {renderReports()}
          </View>

          {/* Page 9: Audit */}
          <View key="audit" style={{ flex: 1 }}>
            {renderAudit()}
          </View>

          {/* Page 10: Settings */}
          <View key="settings" style={{ flex: 1 }}>
            {renderSettings()}
          </View>
        </PagerView>
      </EdgeHoldAdvance>
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

  // === Content ===
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  settingsContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // === Section Header ===
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },

  // === Card ===
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardSub: {
    fontSize: 12,
  },

  // === Title Row ===
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  // === Badge ===
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
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

  // === Quick Actions ===
  quickActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },

  // === Pulse Cards ===
  pulseRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  pulseCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'flex-start',
    gap: 4,
  },
  pulseValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  pulseLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  pulseDetail: {
    fontSize: 11,
    fontWeight: '600',
  },

  // === Usage Bar (Dashboard) ===
  spaceUsageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  usageBarContainer: {
    marginTop: 4,
  },
  usageBarTrack: {
    height: 4,
    borderRadius: BorderRadius.sm,
  },
  usageBarFill: {
    height: 4,
    borderRadius: BorderRadius.sm,
  },

  // === Spaces — Inline Buttons ===
  spaceActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 4,
  },
  inlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  inlineBtnText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // === Reports ===
  reportCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  reportIconCircle: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportCardInfo: {
    flex: 1,
    gap: 4,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  exportBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
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
    borderRadius: BorderRadius.full,
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
    textTransform: 'capitalize',
  },
  auditMeta: {
    fontSize: 11,
  },

  // === Settings ===
  settingsCard: {
    borderRadius: BorderRadius.lg,
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
