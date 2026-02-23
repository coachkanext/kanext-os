/**
 * Church Organization Facilities V2 — 10-view sub-tab hub.
 * Sub-tabs: Overview | Spaces | Scheduling | Requests | Work Orders |
 *           Vendors | Safety | Assets | Capital Projects | Reports
 * RBAC:
 *   C5 (Public): Locked
 *   C4 (Volunteer): Overview + Spaces (read-only) + Scheduling (their bookings)
 *   C3 (Ministry Leader): Overview + Spaces + Scheduling + Requests + Work Orders (submit)
 *   C2 (Facilities Admin): Full 10 sub-tabs
 *   C1 (Senior Pastor): Full 10 sub-tabs
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import type { ChurchRoleLens } from '@/utils/church-rbac';
import { isElderLevel, isStaffLevel, isMember } from '@/utils/church-rbac';
import {
  getChurchFacilitiesV2Data,
  SPACE_TYPE_LABELS,
  SPACE_TYPE_ICONS,
  SPACE_TYPE_COLORS,
  SPACE_STATUS_LABELS,
  SPACE_STATUS_COLORS,
  ACCESS_LEVEL_LABELS,
  ACCESS_LEVEL_COLORS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  REQUEST_TYPE_LABELS,
  REQUEST_TYPE_COLORS,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_COLORS,
  WORK_ORDER_SEVERITY_COLORS,
  WORK_ORDER_STATUS_COLORS,
  VENDOR_STATUS_COLORS,
  INSPECTION_STATUS_COLORS,
  ASSET_CONDITION_COLORS,
  ASSET_CATEGORY_COLORS,
  PROJECT_STATUS_COLORS,
  WO_CATEGORY_LABELS,
  WO_CATEGORY_COLORS,
  WO_SEVERITY_LABELS,
  WO_STATUS_LABELS,
  CONTRACT_STATUS_LABELS,
  INSPECTION_STATUS_LABELS,
  ASSET_CONDITION_LABELS,
  ASSET_CATEGORY_LABELS,
  PROJECT_STATUS_LABELS,
} from '@/data/mock-church-org-facilities-v2';
import type {
  FacilitySpace,
  FacilityBooking,
  FacilityRequest,
  WorkOrder,
  FacilityVendor,
  SafetyInspection,
  FacilityAsset,
  CapitalProject,
  FacilityReport,
} from '@/data/mock-church-org-facilities-v2';

// =============================================================================
// CONSTANTS
// =============================================================================


const ACCENT = MODE_ACCENT.church;
const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'spaces', label: 'Spaces' },
  { id: 'scheduling', label: 'Scheduling' },
  { id: 'requests', label: 'Requests' },
  { id: 'work-orders', label: 'Work Orders' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'safety', label: 'Safety' },
  { id: 'assets', label: 'Assets' },
  { id: 'capital-projects', label: 'Capital Projects' },
  { id: 'reports', label: 'Reports' },
];

const DAY_LABELS = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'];
const DAY_DATES = [
  '2026-02-18', '2026-02-19', '2026-02-20',
  '2026-02-21', '2026-02-22', '2026-02-23', '2026-02-24',
];

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: ChurchRoleLens;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[parseInt(parts[1], 10) - 1] || parts[1];
  const day = parseInt(parts[2], 10);
  return `${month} ${day}`;
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 || 12;
  return m > 0 ? `${hr}:${m.toString().padStart(2, '0')} ${ampm}` : `${hr} ${ampm}`;
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

function daysUntil(dateStr: string): number {
  const now = new Date('2026-02-18');
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({ icon, label, colors }: { icon: string; label: string; colors: typeof Colors.light }) {
  return (
    <View style={s.emptyContainer}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// STATUS BADGE
// =============================================================================

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// PROGRESS BAR
// =============================================================================

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <View style={s.progressTrack}>
      <View style={[s.progressFill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

// =============================================================================
// SUB-TAB BAR
// =============================================================================

function SubTabBar({
  tabs,
  activeId,
  onSelect,
  accentColor,
  colors,
}: {
  tabs: typeof SUB_TABS;
  activeId: string;
  onSelect: (id: string) => void;
  accentColor: string;
  colors: typeof Colors.light;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.subTabRow}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <Pressable
            key={tab.id}
            style={[
              s.subTab,
              {
                borderBottomColor: isActive ? accentColor : 'transparent',
                borderBottomWidth: isActive ? 2 : 0,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(tab.id);
            }}
          >
            <ThemedText
              style={[
                s.subTabText,
                { color: isActive ? colors.text : colors.textSecondary },
              ]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// OVERVIEW SUB-TAB
// =============================================================================

function OverviewTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getChurchFacilitiesV2Data>;
}) {
  const tiles = data.overviewTiles;

  const healthTiles: { label: string; value: number; color: string; icon: string }[] = [
    { label: 'Open Work Orders', value: tiles.openWorkOrders, color: '#F59E0B', icon: 'wrench.and.screwdriver.fill' },
    { label: 'Critical Issues', value: tiles.criticalIssues, color: '#EF4444', icon: 'exclamationmark.triangle.fill' },
    { label: 'Inspections Due', value: tiles.upcomingInspections, color: ACCENT, icon: 'checkmark.shield.fill' },
    { label: 'Today Bookings', value: tiles.todayBookings, color: '#22C55E', icon: 'calendar' },
    { label: 'Conflicts', value: tiles.conflicts, color: ACCENT, icon: 'exclamationmark.2' },
    { label: 'SLA Breaches', value: tiles.vendorSlaBreaches, color: tiles.vendorSlaBreaches > 0 ? '#EF4444' : '#22C55E', icon: 'clock.badge.exclamationmark' },
  ];

  const todayBookings = data.bookings
    .filter((b) => b.date === '2026-02-18')
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, 3);

  const pendingRequests = data.requests.filter((r) => r.status === 'new' || r.status === 'under_review').slice(0, 3);

  const criticalWorkOrders = data.workOrders.filter(
    (w) => w.severity === 'critical' && w.status !== 'completed' && w.status !== 'closed',
  );

  // Risk flags
  const riskFlags: { label: string; color: string }[] = [];
  if (tiles.criticalIssues > 0) riskFlags.push({ label: `${tiles.criticalIssues} critical work order(s)`, color: '#EF4444' });
  const overdueInspections = data.inspections.filter((i) => i.status === 'overdue');
  if (overdueInspections.length > 0) riskFlags.push({ label: `${overdueInspections.length} overdue inspection(s)`, color: '#F59E0B' });
  const expiringVendors = data.vendors.filter((v) => v.contractStatus === 'expiring');
  if (expiringVendors.length > 0) riskFlags.push({ label: `${expiringVendors.length} vendor contract(s) expiring`, color: '#F59E0B' });
  const noCoi = data.vendors.filter((v) => !v.insuranceCoi);
  if (noCoi.length > 0) riskFlags.push({ label: `${noCoi.length} vendor(s) missing COI`, color: '#EF4444' });

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Health Strip */}
      <View style={s.healthStrip}>
        {healthTiles.map((tile, i) => (
          <View key={i} style={[s.healthTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <IconSymbol name={tile.icon as any} size={14} color={tile.color} />
            <ThemedText style={[s.healthTileValue, { color: tile.value > 0 ? tile.color : colors.text }]}>
              {tile.value}
            </ThemedText>
            <ThemedText style={[s.healthTileLabel, { color: colors.textTertiary }]} numberOfLines={1}>
              {tile.label}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Today Triage — Next Bookings */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Today's Triage</ThemedText>
      {todayBookings.length > 0 ? (
        todayBookings.map((booking) => (
          <View
            key={booking.id}
            style={[s.triageCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.triageTime}>
              <ThemedText style={[s.triageTimeText, { color: accentColor }]}>
                {formatTime(booking.startTime)}
              </ThemedText>
              <ThemedText style={[s.triageTimeSub, { color: colors.textTertiary }]}>
                {formatTime(booking.endTime)}
              </ThemedText>
            </View>
            <View style={s.triageContent}>
              <ThemedText style={[s.triageTitle, { color: colors.text }]} numberOfLines={1}>
                {booking.title}
              </ThemedText>
              <ThemedText style={[s.triageMeta, { color: colors.textSecondary }]}>
                {booking.spaceName} — {booking.ministry}
              </ThemedText>
              {booking.riskFlags.length > 0 && (
                <View style={s.triageFlagsRow}>
                  {booking.riskFlags.map((flag, i) => (
                    <StatusBadge key={i} label={flag.toUpperCase().replace(/_/g, ' ')} color="#F59E0B" />
                  ))}
                </View>
              )}
            </View>
            <StatusBadge
              label={BOOKING_STATUS_LABELS[booking.status]?.toUpperCase() ?? booking.status.toUpperCase()}
              color={BOOKING_STATUS_COLORS[booking.status] ?? '#A1A1AA'}
            />
          </View>
        ))
      ) : (
        <ThemedText style={[s.emptyInlineText, { color: colors.textSecondary }]}>
          No bookings today.
        </ThemedText>
      )}

      {/* Approval Requests */}
      {pendingRequests.length > 0 && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            Pending Approvals
          </ThemedText>
          {pendingRequests.map((req) => (
            <View
              key={req.id}
              style={[s.triageCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[s.requestTypeIcon, { backgroundColor: (REQUEST_TYPE_COLORS[req.type as keyof typeof REQUEST_TYPE_COLORS] ?? '#A1A1AA') + '18' }]}>
                <IconSymbol name="doc.text.fill" size={16} color={REQUEST_TYPE_COLORS[req.type as keyof typeof REQUEST_TYPE_COLORS] ?? '#A1A1AA'} />
              </View>
              <View style={s.triageContent}>
                <ThemedText style={[s.triageTitle, { color: colors.text }]} numberOfLines={1}>
                  {REQUEST_TYPE_LABELS[req.type as keyof typeof REQUEST_TYPE_LABELS] ?? req.type} — {req.spaceName ?? 'General'}
                </ThemedText>
                <ThemedText style={[s.triageMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                  {req.requester} ({req.ministry})
                </ThemedText>
              </View>
              <StatusBadge
                label={REQUEST_STATUS_LABELS[req.status as keyof typeof REQUEST_STATUS_LABELS]?.toUpperCase() ?? req.status.toUpperCase()}
                color={REQUEST_STATUS_COLORS[req.status as keyof typeof REQUEST_STATUS_COLORS] ?? '#A1A1AA'}
              />
            </View>
          ))}
        </>
      )}

      {/* Critical Issues */}
      {criticalWorkOrders.length > 0 && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            Critical Issues
          </ThemedText>
          {criticalWorkOrders.map((wo) => (
            <View
              key={wo.id}
              style={[s.alertCard, { backgroundColor: '#EF444410', borderColor: '#EF444430' }]}
            >
              <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#EF4444" />
              <View style={s.alertTextCol}>
                <ThemedText style={[s.alertTitle, { color: colors.text }]}>{wo.title}</ThemedText>
                <ThemedText style={[s.alertSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>
                  {wo.spaceName} — SLA: {formatDate(wo.slaTargetDate)}
                </ThemedText>
              </View>
              <StatusBadge label="CRITICAL" color="#EF4444" />
            </View>
          ))}
        </>
      )}

      {/* Risk Flags */}
      {riskFlags.length > 0 && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            Risk Flags
          </ThemedText>
          {riskFlags.map((flag, i) => (
            <View
              key={i}
              style={[s.riskFlagRow, { borderColor: colors.border }]}
            >
              <View style={[s.riskFlagDot, { backgroundColor: flag.color }]} />
              <ThemedText style={[s.riskFlagText, { color: colors.text }]}>{flag.label}</ThemedText>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

// =============================================================================
// SPACES SUB-TAB
// =============================================================================

function SpacesTab({
  colors,
  accentColor,
  spaces,
  onSelectSpace,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  spaces: FacilitySpace[];
  onSelectSpace: (space: FacilitySpace) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: FacilitySpace }) => {
      const typeColor = SPACE_TYPE_COLORS[item.type];
      const statusColor = SPACE_STATUS_COLORS[item.status];
      const accessColor = ACCESS_LEVEL_COLORS[item.accessLevel];
      return (
        <Pressable
          style={[s.spaceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectSpace(item);
          }}
        >
          {/* Top Row */}
          <View style={s.spaceCardTop}>
            <View style={[s.spaceIconCircle, { backgroundColor: typeColor + '18' }]}>
              <IconSymbol name={SPACE_TYPE_ICONS[item.type] as any} size={18} color={typeColor} />
            </View>
            <View style={s.spaceNameCol}>
              <ThemedText style={[s.spaceName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <ThemedText style={[s.spaceBuilding, { color: colors.textSecondary }]}>
                {item.building}
              </ThemedText>
            </View>
          </View>

          {/* Badge Row */}
          <View style={s.spaceBadgeRow}>
            <StatusBadge label={SPACE_TYPE_LABELS[item.type].toUpperCase()} color={typeColor} />
            <StatusBadge label={SPACE_STATUS_LABELS[item.status].toUpperCase()} color={statusColor} />
            <StatusBadge label={ACCESS_LEVEL_LABELS[item.accessLevel].toUpperCase()} color={accessColor} />
          </View>

          {/* Allowed Uses Tags */}
          <View style={s.usesRow}>
            {item.allowedUses.slice(0, 4).map((use, i) => (
              <View key={i} style={[s.useTag, { backgroundColor: accentColor + '10' }]}>
                <ThemedText style={[s.useTagText, { color: accentColor }]}>{use}</ThemedText>
              </View>
            ))}
            {item.allowedUses.length > 4 && (
              <ThemedText style={[s.useTagMore, { color: colors.textTertiary }]}>
                +{item.allowedUses.length - 4}
              </ThemedText>
            )}
          </View>

          {/* Details Row */}
          <View style={[s.spaceDetails, { borderTopColor: colors.border }]}>
            <View style={s.spaceDetailItem}>
              <ThemedText style={[s.spaceDetailValue, { color: colors.text }]}>{item.capacity}</ThemedText>
              <ThemedText style={[s.spaceDetailLabel, { color: colors.textTertiary }]}>Capacity</ThemedText>
            </View>
            <View style={s.spaceDetailItem}>
              <ThemedText style={[s.spaceDetailValue, { color: colors.text }]}>
                {item.lastInspectionDate ? formatDate(item.lastInspectionDate) : '—'}
              </ThemedText>
              <ThemedText style={[s.spaceDetailLabel, { color: colors.textTertiary }]}>Last Inspection</ThemedText>
            </View>
            <View style={s.spaceDetailItem}>
              <ThemedText style={[s.spaceDetailValue, { color: item.lastIncidentDate ? '#EF4444' : '#22C55E' }]}>
                {item.lastIncidentDate ? formatDate(item.lastIncidentDate) : 'None'}
              </ThemedText>
              <ThemedText style={[s.spaceDetailLabel, { color: colors.textTertiary }]}>Last Incident</ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectSpace],
  );

  return (
    <FlatList
      data={spaces}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="building.2.fill" label="No spaces found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// SCHEDULING SUB-TAB
// =============================================================================

function SchedulingTab({
  colors,
  accentColor,
  bookings,
  spaces,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  bookings: FacilityBooking[];
  spaces: FacilitySpace[];
}) {
  const [selectedDay, setSelectedDay] = useState(0);
  const selectedDate = DAY_DATES[selectedDay];

  const dayBookings = useMemo(() => {
    return bookings
      .filter((b) => b.date === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [bookings, selectedDate]);

  // Group bookings by space
  const grouped = useMemo(() => {
    const map = new Map<string, FacilityBooking[]>();
    dayBookings.forEach((b) => {
      const list = map.get(b.spaceName) || [];
      list.push(b);
      map.set(b.spaceName, list);
    });
    return Array.from(map.entries());
  }, [dayBookings]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Day Selector */}
      <View style={s.dayPillRow}>
        {DAY_LABELS.map((day, i) => {
          const isActive = i === selectedDay;
          return (
            <Pressable
              key={i}
              style={[
                s.dayPill,
                {
                  backgroundColor: isActive ? accentColor : colors.card,
                  borderColor: isActive ? accentColor : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedDay(i);
              }}
            >
              <ThemedText style={[s.dayPillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {day}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Grouped Bookings */}
      {grouped.length === 0 ? (
        <EmptyState icon="calendar" label="No bookings on this day" colors={colors} />
      ) : (
        grouped.map(([spaceName, spaceBookings]) => (
          <View key={spaceName} style={s.scheduleGroup}>
            <ThemedText style={[s.scheduleGroupTitle, { color: colors.text }]}>
              {spaceName}
            </ThemedText>
            {spaceBookings.map((booking) => (
              <View
                key={booking.id}
                style={[s.bookingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={s.bookingTimeCol}>
                  <ThemedText style={[s.bookingStartTime, { color: accentColor }]}>
                    {formatTime(booking.startTime)}
                  </ThemedText>
                  <ThemedText style={[s.bookingEndTime, { color: colors.textTertiary }]}>
                    {formatTime(booking.endTime)}
                  </ThemedText>
                </View>
                <View style={s.bookingContent}>
                  <ThemedText style={[s.bookingTitle, { color: colors.text }]} numberOfLines={1}>
                    {booking.title}
                  </ThemedText>
                  <ThemedText style={[s.bookingMeta, { color: colors.textSecondary }]}>
                    {booking.ministry} — {booking.owner}
                  </ThemedText>
                  <View style={s.bookingFooter}>
                    <ThemedText style={[s.bookingAttendance, { color: colors.textTertiary }]}>
                      {booking.attendanceEstimate} expected
                    </ThemedText>
                    <StatusBadge
                      label={BOOKING_STATUS_LABELS[booking.status]?.toUpperCase() ?? booking.status.toUpperCase()}
                      color={BOOKING_STATUS_COLORS[booking.status] ?? '#A1A1AA'}
                    />
                  </View>
                  {booking.riskFlags.length > 0 && (
                    <View style={s.bookingFlagsRow}>
                      <IconSymbol name="exclamationmark.triangle.fill" size={11} color="#F59E0B" />
                      {booking.riskFlags.map((flag, i) => (
                        <ThemedText key={i} style={[s.bookingFlagText, { color: '#F59E0B' }]}>
                          {flag.replace(/_/g, ' ')}
                        </ThemedText>
                      ))}
                    </View>
                  )}
                  {booking.checklistRequired && (
                    <View style={s.bookingChecklistRow}>
                      <IconSymbol name="checklist" size={11} color="#22C55E" />
                      <ThemedText style={[s.bookingChecklistText, { color: '#22C55E' }]}>
                        Checklist required
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

// =============================================================================
// REQUESTS SUB-TAB
// =============================================================================

function RequestsTab({
  colors,
  accentColor,
  requests,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  requests: FacilityRequest[];
}) {
  const renderItem = useCallback(
    ({ item }: { item: FacilityRequest }) => {
      const typeColor = REQUEST_TYPE_COLORS[item.type as keyof typeof REQUEST_TYPE_COLORS] ?? '#A1A1AA';
      const statusColor = REQUEST_STATUS_COLORS[item.status as keyof typeof REQUEST_STATUS_COLORS] ?? '#A1A1AA';
      return (
        <View style={[s.requestCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.requestCardHeader}>
            <StatusBadge
              label={(REQUEST_TYPE_LABELS[item.type as keyof typeof REQUEST_TYPE_LABELS] ?? item.type).toUpperCase()}
              color={typeColor}
            />
            <StatusBadge
              label={(REQUEST_STATUS_LABELS[item.status as keyof typeof REQUEST_STATUS_LABELS] ?? item.status).toUpperCase()}
              color={statusColor}
            />
          </View>
          <ThemedText style={[s.requestSpace, { color: colors.text }]}>
            {item.spaceName ?? 'General Request'}
          </ThemedText>
          <ThemedText style={[s.requestRequester, { color: colors.textSecondary }]}>
            {item.requester} — {item.ministry}
          </ThemedText>
          <ThemedText style={[s.requestDesc, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </ThemedText>
          <View style={s.requestFooter}>
            <ThemedText style={[s.requestDate, { color: colors.textTertiary }]}>
              {formatDate(item.dateRequested)}
            </ThemedText>
            {item.approvals.length > 0 && (
              <ThemedText style={[s.requestApprovals, { color: colors.textTertiary }]}>
                Approvals: {item.approvals.join(', ')}
              </ThemedText>
            )}
          </View>
        </View>
      );
    },
    [colors],
  );

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="doc.text.fill" label="No facility requests" colors={colors} />
      }
    />
  );
}

// =============================================================================
// WORK ORDERS SUB-TAB
// =============================================================================

function WorkOrdersTab({
  colors,
  accentColor,
  workOrders,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  workOrders: WorkOrder[];
}) {
  const sorted = useMemo(() => {
    const severityOrder: Record<string, number> = { critical: 0, high: 1, normal: 2, low: 3 };
    return [...workOrders]
      .filter((w) => w.status !== 'completed' && w.status !== 'closed')
      .sort((a, b) => {
        const sImpact = (b.impactTags.length > 0 ? 1 : 0) - (a.impactTags.length > 0 ? 1 : 0);
        if (sImpact !== 0) return sImpact;
        return (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9);
      });
  }, [workOrders]);

  const renderItem = useCallback(
    ({ item }: { item: WorkOrder }) => {
      const sevColor = WORK_ORDER_SEVERITY_COLORS[item.severity];
      const statusColor = WORK_ORDER_STATUS_COLORS[item.status];
      const catColor = WO_CATEGORY_COLORS[item.category] ?? '#A1A1AA';
      return (
        <View style={[s.woCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Severity bar */}
          <View style={[s.woSeverityBar, { backgroundColor: sevColor }]} />
          <View style={s.woContent}>
            <View style={s.woHeader}>
              <ThemedText style={[s.woTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <StatusBadge
                label={WO_STATUS_LABELS[item.status]?.toUpperCase() ?? item.status.toUpperCase()}
                color={statusColor}
              />
            </View>
            <View style={s.woBadgeRow}>
              <StatusBadge
                label={(WO_CATEGORY_LABELS[item.category] ?? item.category).toUpperCase()}
                color={catColor}
              />
              <StatusBadge
                label={(WO_SEVERITY_LABELS[item.severity] ?? item.severity).toUpperCase()}
                color={sevColor}
              />
            </View>
            <ThemedText style={[s.woMeta, { color: colors.textSecondary }]}>
              {item.spaceName} — {item.owner}
            </ThemedText>
            {item.vendorAssigned && (
              <ThemedText style={[s.woVendor, { color: colors.textTertiary }]}>
                Vendor: {item.vendorAssigned}
              </ThemedText>
            )}
            <View style={s.woFooter}>
              <ThemedText style={[s.woSla, { color: daysUntil(item.slaTargetDate) <= 2 ? '#EF4444' : colors.textTertiary }]}>
                SLA: {formatDate(item.slaTargetDate)}
              </ThemedText>
              {item.impactTags.length > 0 && (
                <View style={s.woImpactRow}>
                  {item.impactTags.slice(0, 2).map((tag, i) => (
                    <StatusBadge key={i} label={tag.toUpperCase().replace(/_/g, ' ')} color="#F59E0B" />
                  ))}
                </View>
              )}
            </View>
            {item.evidence.length > 0 && (
              <ThemedText style={[s.woEvidence, { color: colors.textTertiary }]}>
                {item.evidence.length} evidence file(s)
              </ThemedText>
            )}
          </View>
        </View>
      );
    },
    [colors],
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="wrench.and.screwdriver.fill" label="No open work orders" colors={colors} />
      }
    />
  );
}

// =============================================================================
// VENDORS SUB-TAB
// =============================================================================

function VendorsTab({
  colors,
  accentColor,
  vendors,
  onSelectVendor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  vendors: FacilityVendor[];
  onSelectVendor: (vendor: FacilityVendor) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: FacilityVendor }) => {
      const contractColor = VENDOR_STATUS_COLORS[item.contractStatus];
      return (
        <Pressable
          style={[s.vendorCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectVendor(item);
          }}
        >
          <View style={s.vendorHeader}>
            <View style={s.vendorNameCol}>
              <ThemedText style={[s.vendorName, { color: colors.text }]}>{item.name}</ThemedText>
              <ThemedText style={[s.vendorCategory, { color: colors.textSecondary }]}>{item.category}</ThemedText>
            </View>
            <StatusBadge
              label={(CONTRACT_STATUS_LABELS[item.contractStatus] ?? item.contractStatus).toUpperCase()}
              color={contractColor}
            />
          </View>
          <ThemedText style={[s.vendorSla, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.slaSummary}
          </ThemedText>
          <View style={[s.vendorFooter, { borderTopColor: colors.border }]}>
            <View style={s.vendorFooterItem}>
              <ThemedText style={[s.vendorFooterValue, { color: colors.text }]}>
                {item.lastInvoiceDate ? formatDate(item.lastInvoiceDate) : '—'}
              </ThemedText>
              <ThemedText style={[s.vendorFooterLabel, { color: colors.textTertiary }]}>Last Invoice</ThemedText>
            </View>
            <View style={s.vendorFooterItem}>
              <ThemedText style={[s.vendorFooterValue, { color: colors.text }]}>
                {item.openWorkOrders}
              </ThemedText>
              <ThemedText style={[s.vendorFooterLabel, { color: colors.textTertiary }]}>Open WOs</ThemedText>
            </View>
            <View style={s.vendorFooterItem}>
              <View style={[s.coiIndicator, { backgroundColor: item.insuranceCoi ? '#22C55E20' : '#EF444420' }]}>
                <IconSymbol
                  name={item.insuranceCoi ? 'checkmark.shield.fill' : 'xmark.shield.fill'}
                  size={14}
                  color={item.insuranceCoi ? '#22C55E' : '#EF4444'}
                />
              </View>
              <ThemedText style={[s.vendorFooterLabel, { color: colors.textTertiary }]}>COI</ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, onSelectVendor],
  );

  return (
    <FlatList
      data={vendors}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="building.2.fill" label="No vendors on file" colors={colors} />
      }
    />
  );
}

// =============================================================================
// SAFETY SUB-TAB
// =============================================================================

function SafetyTab({
  colors,
  accentColor,
  inspections,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  inspections: SafetyInspection[];
}) {
  const sorted = useMemo(() => {
    const statusOrder: Record<string, number> = { overdue: 0, failed: 1, scheduled: 2, passed: 3 };
    return [...inspections].sort(
      (a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9),
    );
  }, [inspections]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Inspections</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Sorted by urgency — overdue and failed first
      </ThemedText>

      {sorted.map((insp) => {
        const statusColor = INSPECTION_STATUS_COLORS[insp.status] ?? '#A1A1AA';
        return (
          <View
            key={insp.id}
            style={[s.inspectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[s.inspectionIcon, { backgroundColor: statusColor + '18' }]}>
              <IconSymbol name="checkmark.shield.fill" size={20} color={statusColor} />
            </View>
            <View style={s.inspectionTextCol}>
              <ThemedText style={[s.inspectionName, { color: colors.text }]}>{insp.spaceName}</ThemedText>
              <View style={s.inspectionBadgeRow}>
                <StatusBadge label={insp.type.replace(/_/g, ' ').toUpperCase()} color={accentColor} />
                <StatusBadge
                  label={(INSPECTION_STATUS_LABELS[insp.status] ?? insp.status).toUpperCase()}
                  color={statusColor}
                />
              </View>
              <ThemedText style={[s.inspectionMeta, { color: colors.textTertiary }]}>
                {formatDate(insp.scheduledDate)} — {insp.inspector}
              </ThemedText>
              {insp.findings && (
                <ThemedText style={[s.inspectionFindings, { color: colors.textSecondary }]} numberOfLines={2}>
                  {insp.findings}
                </ThemedText>
              )}
            </View>
          </View>
        );
      })}

      {/* Checklist Stub */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.xl }]}>
        Safety Checklists
      </ThemedText>
      <View style={[s.stubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name="checklist" size={24} color={colors.textTertiary} />
        <ThemedText style={[s.stubText, { color: colors.textSecondary }]}>
          Safety checklists will be configured here. Templates for fire drills, lockdown procedures, and emergency response.
        </ThemedText>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// ASSETS SUB-TAB
// =============================================================================

function AssetsTab({
  colors,
  accentColor,
  assets,
  role,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  assets: FacilityAsset[];
  role: ChurchRoleLens;
}) {
  const showValue = isElderLevel(role);

  const renderItem = useCallback(
    ({ item }: { item: FacilityAsset }) => {
      const condColor = ASSET_CONDITION_COLORS[item.condition];
      const catColor = ASSET_CATEGORY_COLORS[item.category as keyof typeof ASSET_CATEGORY_COLORS] ?? '#A1A1AA';
      return (
        <View style={[s.assetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.assetHeader}>
            <ThemedText style={[s.assetName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </ThemedText>
            <StatusBadge
              label={(ASSET_CONDITION_LABELS[item.condition] ?? item.condition).toUpperCase()}
              color={condColor}
            />
          </View>
          <View style={s.assetBadgeRow}>
            <StatusBadge
              label={(ASSET_CATEGORY_LABELS[item.category as keyof typeof ASSET_CATEGORY_LABELS] ?? item.category).toUpperCase()}
              color={catColor}
            />
          </View>
          <ThemedText style={[s.assetLocation, { color: colors.textSecondary }]}>
            {item.location}
          </ThemedText>
          <ThemedText style={[s.assetCustodian, { color: colors.textTertiary }]}>
            Custodian: {item.custodian}
          </ThemedText>
          {showValue && item.replacementValueBand && (
            <ThemedText style={[s.assetValue, { color: accentColor }]}>
              Replacement: {item.replacementValueBand}
            </ThemedText>
          )}
        </View>
      );
    },
    [colors, accentColor, showValue],
  );

  return (
    <FlatList
      data={assets}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="archivebox.fill" label="No assets on record" colors={colors} />
      }
    />
  );
}

// =============================================================================
// CAPITAL PROJECTS SUB-TAB
// =============================================================================

function CapitalProjectsTab({
  colors,
  accentColor,
  projects,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  projects: CapitalProject[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Capital Projects</ThemedText>

      {projects.map((project) => {
        const statusColor = PROJECT_STATUS_COLORS[project.status];
        return (
          <View
            key={project.id}
            style={[s.projectCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.projectHeader}>
              <ThemedText style={[s.projectName, { color: colors.text }]}>{project.name}</ThemedText>
              <StatusBadge
                label={(PROJECT_STATUS_LABELS[project.status] ?? project.status).toUpperCase()}
                color={statusColor}
              />
            </View>
            <View style={s.projectMetaRow}>
              <View style={s.projectMetaItem}>
                <IconSymbol name="dollarsign.circle.fill" size={12} color={accentColor} />
                <ThemedText style={[s.projectMetaText, { color: colors.textSecondary }]}>
                  {project.budgetBand}
                </ThemedText>
              </View>
              <View style={s.projectMetaItem}>
                <IconSymbol name="calendar" size={12} color={accentColor} />
                <ThemedText style={[s.projectMetaText, { color: colors.textSecondary }]}>
                  {project.timeline}
                </ThemedText>
              </View>
            </View>

            {project.vendors.length > 0 && (
              <View style={s.projectVendorsRow}>
                <ThemedText style={[s.projectLabel, { color: colors.textTertiary }]}>Vendors:</ThemedText>
                <ThemedText style={[s.projectVendorsText, { color: colors.textSecondary }]}>
                  {project.vendors.join(', ')}
                </ThemedText>
              </View>
            )}

            {project.dependencies.length > 0 && (
              <View style={s.projectDeps}>
                <ThemedText style={[s.projectLabel, { color: colors.textTertiary }]}>Dependencies:</ThemedText>
                {project.dependencies.map((dep, i) => (
                  <View key={i} style={s.projectDepRow}>
                    <View style={[s.projectDepDot, { backgroundColor: colors.textTertiary }]} />
                    <ThemedText style={[s.projectDepText, { color: colors.textSecondary }]}>{dep}</ThemedText>
                  </View>
                ))}
              </View>
            )}

            {project.approvalLog.length > 0 && (
              <View style={[s.projectApprovals, { borderTopColor: colors.border }]}>
                <ThemedText style={[s.projectLabel, { color: colors.textTertiary }]}>Approval Log:</ThemedText>
                {project.approvalLog.map((entry, i) => (
                  <View key={i} style={s.projectApprovalRow}>
                    <ThemedText style={[s.projectApprovalDate, { color: colors.textTertiary }]}>
                      {formatDate(entry.date)}
                    </ThemedText>
                    <ThemedText style={[s.projectApprovalText, { color: colors.textSecondary }]}>
                      {entry.approver}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}

      {projects.length === 0 && (
        <EmptyState icon="hammer.fill" label="No capital projects" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// REPORTS SUB-TAB
// =============================================================================

function ReportsTab({
  colors,
  accentColor,
  reports,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  reports: FacilityReport[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Facility Reports</ThemedText>

      {reports.map((report) => (
        <View
          key={report.id}
          style={[s.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.reportContent}>
            <ThemedText style={[s.reportName, { color: colors.text }]}>{report.title}</ThemedText>
            <ThemedText style={[s.reportDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {report.description}
            </ThemedText>
            <View style={s.reportMeta}>
              <ThemedText style={[s.reportMetaText, { color: colors.textTertiary }]}>
                {report.frequency} — Last: {formatDate(report.lastGenerated)}
              </ThemedText>
            </View>
          </View>
          <Pressable
            style={[s.reportGenerateBtn, { backgroundColor: accentColor + '15' }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <ThemedText style={[s.reportGenerateText, { color: accentColor }]}>Generate</ThemedText>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// SPACE DETAIL BOTTOM SHEET
// =============================================================================

function SpaceDetailSheet({
  visible,
  onClose,
  space,
  colors,
  accentColor,
  bookings,
  workOrders,
}: {
  visible: boolean;
  onClose: () => void;
  space: FacilitySpace | null;
  colors: typeof Colors.light;
  accentColor: string;
  bookings: FacilityBooking[];
  workOrders: WorkOrder[];
}) {
  if (!space) return null;

  const typeColor = SPACE_TYPE_COLORS[space.type];
  const statusColor = SPACE_STATUS_COLORS[space.status];
  const spaceBookings = bookings.filter((b) => b.spaceId === space.id).slice(0, 5);
  const spaceWorkOrders = workOrders.filter(
    (w) => w.spaceId === space.id && w.status !== 'completed' && w.status !== 'closed',
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} title={space.name} useModal>
      {/* Status Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={SPACE_TYPE_LABELS[space.type].toUpperCase()} color={typeColor} />
        <StatusBadge label={SPACE_STATUS_LABELS[space.status].toUpperCase()} color={statusColor} />
        <StatusBadge label={ACCESS_LEVEL_LABELS[space.accessLevel].toUpperCase()} color={ACCESS_LEVEL_COLORS[space.accessLevel]} />
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{space.capacity}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Capacity</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{space.building}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Building</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{space.zone}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Zone</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {space.lastInspectionDate ? formatDate(space.lastInspectionDate) : '—'}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Last Inspection</ThemedText>
          </View>
        </View>
      </View>

      {/* AV Profile */}
      {space.avProfile && space.avProfile.length > 0 && (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>AV Profile</ThemedText>
          <View style={s.amenitiesGrid}>
            {space.avProfile.map((item, i) => (
              <View key={i} style={[s.amenityChip, { backgroundColor: accentColor + '12' }]}>
                <ThemedText style={[s.amenityChipText, { color: accentColor }]}>{item}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Rules */}
      {space.allowedUses.length > 0 && (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Allowed Uses</ThemedText>
          <View style={s.amenitiesGrid}>
            {space.allowedUses.map((use, i) => (
              <View key={i} style={[s.amenityChip, { backgroundColor: '#22C55E12' }]}>
                <ThemedText style={[s.amenityChipText, { color: '#22C55E' }]}>{use}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Booking Calendar Preview (next 5) */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Upcoming Bookings ({spaceBookings.length})
        </ThemedText>
        {spaceBookings.map((booking) => (
          <View key={booking.id} style={s.sheetListRow}>
            <IconSymbol name="calendar" size={14} color={accentColor} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {booking.title}
              </ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                {formatDate(booking.date)} — {formatTime(booking.startTime)} to {formatTime(booking.endTime)}
              </ThemedText>
            </View>
          </View>
        ))}
        {spaceBookings.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No upcoming bookings
          </ThemedText>
        )}
      </View>

      {/* Issue History (work orders) */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Open Work Orders ({spaceWorkOrders.length})
        </ThemedText>
        {spaceWorkOrders.map((wo) => (
          <View key={wo.id} style={s.sheetListRow}>
            <View style={[s.priorityDot, { backgroundColor: WORK_ORDER_SEVERITY_COLORS[wo.severity] }]} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {wo.title}
              </ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                {(WO_SEVERITY_LABELS[wo.severity] ?? wo.severity).toUpperCase()} — {WO_STATUS_LABELS[wo.status] ?? wo.status}
              </ThemedText>
            </View>
          </View>
        ))}
        {spaceWorkOrders.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No open work orders
          </ThemedText>
        )}
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>View Full Details</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>Close</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// VENDOR DETAIL BOTTOM SHEET
// =============================================================================

function VendorDetailSheet({
  visible,
  onClose,
  vendor,
  colors,
  accentColor,
  role,
}: {
  visible: boolean;
  onClose: () => void;
  vendor: FacilityVendor | null;
  colors: typeof Colors.light;
  accentColor: string;
  role: ChurchRoleLens;
}) {
  if (!vendor) return null;

  const contractColor = VENDOR_STATUS_COLORS[vendor.contractStatus];
  const showContact = isElderLevel(role);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={vendor.name} useModal>
      {/* Contract Info */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge
          label={(CONTRACT_STATUS_LABELS[vendor.contractStatus] ?? vendor.contractStatus).toUpperCase()}
          color={contractColor}
        />
        <StatusBadge
          label={vendor.insuranceCoi ? 'COI ON FILE' : 'COI MISSING'}
          color={vendor.insuranceCoi ? '#22C55E' : '#EF4444'}
        />
      </View>

      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Contract Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{vendor.category}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Category</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{vendor.openWorkOrders}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Open WOs</ThemedText>
          </View>
        </View>
        <ThemedText style={[s.vendorSheetSla, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
          SLA: {vendor.slaSummary}
        </ThemedText>
      </View>

      {/* Contact (RBAC-gated) */}
      {showContact && vendor.contactName && (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Contact</ThemedText>
          <ThemedText style={[s.vendorContactText, { color: colors.text }]}>{vendor.contactName}</ThemedText>
          {vendor.contactPhone && (
            <ThemedText style={[s.vendorContactText, { color: colors.textSecondary }]}>
              {vendor.contactPhone}
            </ThemedText>
          )}
        </View>
      )}

      {/* Performance */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Performance</ThemedText>
        {vendor.lastInvoiceDate && (
          <ThemedText style={[s.vendorPerfText, { color: colors.textSecondary }]}>
            Last invoice: {formatDate(vendor.lastInvoiceDate)}
            {vendor.lastInvoiceAmount ? ` — ${formatCurrency(vendor.lastInvoiceAmount)}` : ''}
          </ThemedText>
        )}
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>Close</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function ChurchOrgFacilitiesV2({ colors, accentColor, role = 'C1' }: Props) {
  // === RBAC Gate: C9-C11 locked (hidden per RBAC matrix) ===
  if (role === 'C9' || role === 'C10' || role === 'C11') {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Facilities</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          This section is restricted. Contact church staff for access.
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [selectedSpace, setSelectedSpace] = useState<FacilitySpace | null>(null);
  const [spaceSheetVisible, setSpaceSheetVisible] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<FacilityVendor | null>(null);
  const [vendorSheetVisible, setVendorSheetVisible] = useState(false);

  // === Data ===
  const data = useMemo(() => getChurchFacilitiesV2Data(), []);

  // === Callbacks ===
  const handleSelectSpace = useCallback((space: FacilitySpace) => {
    setSelectedSpace(space);
    setSpaceSheetVisible(true);
  }, []);

  const handleCloseSpaceSheet = useCallback(() => {
    setSpaceSheetVisible(false);
  }, []);

  const handleSelectVendor = useCallback((vendor: FacilityVendor) => {
    setSelectedVendor(vendor);
    setVendorSheetVisible(true);
  }, []);

  const handleCloseVendorSheet = useCallback(() => {
    setVendorSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (isElderLevel(role)) return SUB_TABS; // C1/C2: full 10
    if (isStaffLevel(role)) {
      // C3: Overview + Spaces + Scheduling + Requests + Work Orders (submit)
      return SUB_TABS.filter((t) =>
        ['overview', 'spaces', 'scheduling', 'requests', 'work-orders'].includes(t.id),
      );
    }
    // C4: Overview + Spaces (read-only) + Scheduling (their bookings)
    return SUB_TABS.filter((t) =>
      ['overview', 'spaces', 'scheduling'].includes(t.id),
    );
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return <OverviewTab colors={colors} accentColor={accentColor} data={data} />;
      case 'spaces':
        return (
          <SpacesTab
            colors={colors}
            accentColor={accentColor}
            spaces={data.spaces}
            onSelectSpace={handleSelectSpace}
          />
        );
      case 'scheduling':
        return (
          <SchedulingTab
            colors={colors}
            accentColor={accentColor}
            bookings={data.bookings}
            spaces={data.spaces}
          />
        );
      case 'requests':
        if (!isStaffLevel(role)) return null;
        return (
          <RequestsTab
            colors={colors}
            accentColor={accentColor}
            requests={data.requests}
          />
        );
      case 'work-orders':
        if (!isStaffLevel(role)) return null;
        return (
          <WorkOrdersTab
            colors={colors}
            accentColor={accentColor}
            workOrders={data.workOrders}
          />
        );
      case 'vendors':
        if (!isElderLevel(role)) return null;
        return (
          <VendorsTab
            colors={colors}
            accentColor={accentColor}
            vendors={data.vendors}
            onSelectVendor={handleSelectVendor}
          />
        );
      case 'safety':
        if (!isElderLevel(role)) return null;
        return (
          <SafetyTab
            colors={colors}
            accentColor={accentColor}
            inspections={data.inspections}
          />
        );
      case 'assets':
        if (!isElderLevel(role)) return null;
        return (
          <AssetsTab
            colors={colors}
            accentColor={accentColor}
            assets={data.assets}
            role={role}
          />
        );
      case 'capital-projects':
        if (!isElderLevel(role)) return null;
        return (
          <CapitalProjectsTab
            colors={colors}
            accentColor={accentColor}
            projects={data.capitalProjects}
          />
        );
      case 'reports':
        if (!isElderLevel(role)) return null;
        return (
          <ReportsTab
            colors={colors}
            accentColor={accentColor}
            reports={data.reports}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      {/* Sub-tab bar */}
      <SubTabBar
        tabs={visibleSubTabs}
        activeId={activeSubTab}
        onSelect={setActiveSubTab}
        accentColor={accentColor}
        colors={colors}
      />

      {/* Content */}
      <View style={s.contentContainer}>
        {renderContent()}
      </View>

      {/* Space Detail Bottom Sheet */}
      <SpaceDetailSheet
        visible={spaceSheetVisible}
        onClose={handleCloseSpaceSheet}
        space={selectedSpace}
        colors={colors}
        accentColor={accentColor}
        bookings={data.bookings}
        workOrders={data.workOrders}
      />

      {/* Vendor Detail Bottom Sheet */}
      <VendorDetailSheet
        visible={vendorSheetVisible}
        onClose={handleCloseVendorSheet}
        vendor={selectedVendor}
        colors={colors}
        accentColor={accentColor}
        role={role}
      />
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
  flex1: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },

  // -- Locked state --
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  lockedMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // -- Sub-tab bar --
  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  subTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Tab scroll containers --
  tabScroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  tabListContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // -- Section titles --
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: Spacing.md,
  },

  // -- Empty state --
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  emptyInlineText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
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

  // -- Progress bar --
  progressTrack: {
    height: 4,
    backgroundColor: '#2F3336',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },

  // -- Health Strip (Overview) --
  healthStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  healthTile: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: 2,
  },
  healthTileValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  healthTileLabel: {
    fontSize: 10,
    textAlign: 'center',
  },

  // -- Triage Card (Overview) --
  triageCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  triageTime: {
    alignItems: 'center',
    minWidth: 52,
  },
  triageTimeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  triageTimeSub: {
    fontSize: 10,
    marginTop: 1,
  },
  triageContent: {
    flex: 1,
  },
  triageTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  triageMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  triageFlagsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },

  // -- Request Type Icon --
  requestTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // -- Alert Card --
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  alertTextCol: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // -- Risk Flags --
  riskFlagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  riskFlagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  riskFlagText: {
    fontSize: 13,
  },

  // -- Space Card --
  spaceCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  spaceCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  spaceIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceNameCol: {
    flex: 1,
  },
  spaceName: {
    fontSize: 15,
    fontWeight: '600',
  },
  spaceBuilding: {
    fontSize: 11,
    marginTop: 1,
  },
  spaceBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  usesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  useTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  useTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  useTagMore: {
    fontSize: 10,
    paddingVertical: 2,
  },
  spaceDetails: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  spaceDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  spaceDetailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  spaceDetailLabel: {
    fontSize: 10,
    marginTop: 1,
  },

  // -- Day Pill Selector (Scheduling) --
  dayPillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dayPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  dayPillText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Schedule Group --
  scheduleGroup: {
    marginBottom: Spacing.lg,
  },
  scheduleGroupTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },

  // -- Booking Card --
  bookingCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  bookingTimeCol: {
    alignItems: 'center',
    minWidth: 52,
  },
  bookingStartTime: {
    fontSize: 12,
    fontWeight: '700',
  },
  bookingEndTime: {
    fontSize: 10,
    marginTop: 1,
  },
  bookingContent: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  bookingMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  bookingAttendance: {
    fontSize: 11,
  },
  bookingFlagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  bookingFlagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  bookingChecklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  bookingChecklistText: {
    fontSize: 10,
    fontWeight: '500',
  },

  // -- Request Card --
  requestCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  requestCardHeader: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  requestSpace: {
    fontSize: 14,
    fontWeight: '600',
  },
  requestRequester: {
    fontSize: 12,
    marginTop: 2,
  },
  requestDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  requestFooter: {
    marginTop: Spacing.sm,
    gap: 2,
  },
  requestDate: {
    fontSize: 11,
  },
  requestApprovals: {
    fontSize: 10,
  },

  // -- Work Order Card --
  woCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  woSeverityBar: {
    width: 4,
  },
  woContent: {
    flex: 1,
    padding: Spacing.md,
  },
  woHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  woTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  woBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  woMeta: {
    fontSize: 12,
  },
  woVendor: {
    fontSize: 11,
    marginTop: 2,
  },
  woFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  woSla: {
    fontSize: 11,
    fontWeight: '600',
  },
  woImpactRow: {
    flexDirection: 'row',
    gap: 4,
  },
  woEvidence: {
    fontSize: 10,
    marginTop: 4,
    fontStyle: 'italic',
  },

  // -- Vendor Card --
  vendorCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  vendorNameCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  vendorName: {
    fontSize: 15,
    fontWeight: '600',
  },
  vendorCategory: {
    fontSize: 12,
    marginTop: 1,
  },
  vendorSla: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  vendorFooter: {
    flexDirection: 'row',
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  vendorFooterItem: {
    flex: 1,
    alignItems: 'center',
  },
  vendorFooterValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  vendorFooterLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  coiIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // -- Inspection Card (Safety) --
  inspectionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  inspectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inspectionTextCol: {
    flex: 1,
  },
  inspectionName: {
    fontSize: 15,
    fontWeight: '600',
  },
  inspectionBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  inspectionMeta: {
    fontSize: 11,
    marginTop: 4,
  },
  inspectionFindings: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
    lineHeight: 16,
  },

  // -- Stub Card --
  stubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  stubText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },

  // -- Asset Card --
  assetCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  assetName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  assetBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  assetLocation: {
    fontSize: 12,
  },
  assetCustodian: {
    fontSize: 11,
    marginTop: 2,
  },
  assetValue: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },

  // -- Capital Project Card --
  projectCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  projectName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  projectMetaRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  projectMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  projectMetaText: {
    fontSize: 12,
  },
  projectVendorsRow: {
    marginBottom: Spacing.sm,
  },
  projectLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  projectVendorsText: {
    fontSize: 12,
  },
  projectDeps: {
    marginBottom: Spacing.sm,
  },
  projectDepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  projectDepDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  projectDepText: {
    fontSize: 12,
  },
  projectApprovals: {
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  projectApprovalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  projectApprovalDate: {
    fontSize: 11,
    minWidth: 44,
  },
  projectApprovalText: {
    fontSize: 12,
  },

  // -- Report Card --
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  reportContent: {
    flex: 1,
  },
  reportName: {
    fontSize: 14,
    fontWeight: '600',
  },
  reportDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  reportMeta: {
    marginTop: 4,
  },
  reportMetaText: {
    fontSize: 10,
  },
  reportGenerateBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  reportGenerateText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Priority Dot --
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // -- Bottom Sheet --
  sheetBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sheetSection: {
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  sheetDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  sheetDetailItem: {
    width: '45%',
  },
  sheetDetailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  sheetDetailLabel: {
    fontSize: 11,
    marginTop: 1,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  amenityChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  amenityChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sheetListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  sheetListTextCol: {
    flex: 1,
  },
  sheetListTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  sheetListSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  sheetEmptyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  sheetActions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sheetActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  sheetActionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  sheetGhostButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sheetGhostButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // -- Vendor Sheet Specific --
  vendorSheetSla: {
    fontSize: 12,
    lineHeight: 17,
  },
  vendorContactText: {
    fontSize: 13,
    marginBottom: 2,
  },
  vendorPerfText: {
    fontSize: 12,
    lineHeight: 17,
  },
});
