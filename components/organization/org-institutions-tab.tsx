/**
 * Organization Institutions Tab v2 — Education Mode Institutions Hub
 *
 * Directory view of institutions with cards, filter/sort sheet,
 * create institution sheet, and a 16-tab institution hub detail view.
 */

import React, { useState, useMemo, useCallback } from 'react';
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
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
;
import {
  INSTITUTION_SCOPE_CHIPS,
  INSTITUTION_HUB_TABS,
  INSTITUTIONS,
  KaNeXT_ACADEMICS,
  KaNeXT_ADMISSIONS,
  KaNeXT_STUDENT_LIFE,
  INSTITUTION_DEPARTMENTS,
  INSTITUTION_EVENTS,
  INSTITUTION_ROOMS,
  INSTITUTION_AUDIT,
  filterInstitutions,
  sortInstitutions,
  getDepartmentsForInstitution,
  getEventsForInstitution,
  getRoomsForInstitution,
  getAuditForInstitution,
  STATUS_COLOR_MAP,
  TYPE_ICON_MAP,
  CREATE_DEFAULTS,
  type InstitutionFull,
  type InstitutionStatus,
  type InstitutionType,
  type InstitutionHubTabId,
  type InstitutionDepartment,
  type InstitutionEvent,
  type InstitutionRoom,
  type InstitutionAuditEntry,
} from '@/data/mock-institutions-v2';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SORT_OPTIONS: { key: 'az' | 'recent' | 'status'; label: string }[] = [
  { key: 'az', label: 'Name A\u2013Z' },
  { key: 'recent', label: 'Recently active' },
  { key: 'status', label: 'Status' },
];

const STATUS_OPTIONS: InstitutionStatus[] = ['active', 'partner', 'prospect', 'archived'];

const TYPE_OPTIONS: InstitutionType[] = ['university', 'college', 'academy', 'other'];

const EVENT_TYPE_COLORS: Record<string, string> = {
  academic: accent,
  admissions: '#22C55E',
  athletics: '#F59E0B',
  cultural: accent,
  administrative: '#A1A1AA',
};

const AUDIT_ACTION_ICON: Record<string, string> = {
  created: 'plus.circle.fill',
  added: 'person.fill.badge.plus',
  department: 'building.2.fill',
  room: 'bubble.left.fill',
  updated: 'pencil',
  compliance: 'shield.fill',
  partnership: 'link',
  library: 'book.fill',
  enrollment: 'chart.bar.fill',
  prospect: 'magnifyingglass',
  default: 'circle.fill',
};

const AUDIT_ACTION_COLOR: Record<string, string> = {
  created: '#22C55E',
  added: accent,
  department: accent,
  room: accent,
  updated: '#F59E0B',
  compliance: accent,
  partnership: accent,
  library: '#A1A1AA',
  enrollment: '#22C55E',
  prospect: '#F59E0B',
  default: '#A1A1AA',
};

function getAuditActionKey(action: string): string {
  const lower = action.toLowerCase();
  if (lower.includes('created') && lower.includes('institution')) return 'created';
  if (lower.includes('admin added') || lower.includes('added')) return 'added';
  if (lower.includes('department')) return 'department';
  if (lower.includes('room')) return 'room';
  if (lower.includes('updated') || lower.includes('deadline') || lower.includes('milestone')) return 'updated';
  if (lower.includes('compliance') || lower.includes('sacscoc')) return 'compliance';
  if (lower.includes('partnership')) return 'partnership';
  if (lower.includes('library') || lower.includes('collection')) return 'library';
  if (lower.includes('enrollment')) return 'enrollment';
  if (lower.includes('prospect')) return 'prospect';
  if (lower.includes('created')) return 'created';
  return 'default';
}

/** Create defaults: label + key for Switch toggles */
const CREATE_DEFAULTS_LIST: { key: keyof typeof CREATE_DEFAULTS; label: string }[] = [
  { key: 'leadershipRoom', label: 'Leadership Room' },
  { key: 'admissionsRoom', label: 'Admissions Room' },
  { key: 'studentSupportRoom', label: 'Student Support Room' },
  { key: 'facilitiesOpsRoom', label: 'Facilities Ops Room' },
  { key: 'baseLibraryCollections', label: 'Base Library' },
];

// =============================================================================
// STAT CARD
// =============================================================================

function StatCard({
  label,
  value,
  colors,
}: {
  label: string;
  value: string | number;
  colors: typeof Colors.light;
}) {
  return (
    <View style={[s.statCard, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
      <ThemedText style={[s.statValue, { color: colors.text }]}>{value}</ThemedText>
      <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// STAT ROW
// =============================================================================

function StatRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string | number;
  colors: typeof Colors.light;
}) {
  return (
    <>
      <View style={s.summaryRow}>
        <ThemedText style={[s.summaryLabel, { color: colors.textTertiary }]}>{label}</ThemedText>
        <ThemedText style={[s.summaryValue, { color: colors.text }]}>{String(value)}</ThemedText>
      </View>
      <View style={[s.summaryDivider, { borderColor: colors.border }]} />
    </>
  );
}

// =============================================================================
// INSTITUTION CARD
// =============================================================================

function InstitutionCard({
  institution,
  colors,
  accentColor,
  onPress,
}: {
  institution: InstitutionFull;
  colors: typeof Colors.light;
  accentColor: string;
  onPress: () => void;
}) {
  const statusColor = STATUS_COLOR_MAP[institution.status];
  const typeIcon = TYPE_ICON_MAP[institution.type];

  return (
    <Pressable
      style={[s.instCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      {/* Top: Logo circle + name/location + status */}
      <View style={s.cardTopRow}>
        <View style={[s.logoCircle, { backgroundColor: institution.avatarColor }]}>
          <ThemedText style={s.logoText}>{institution.shortName}</ThemedText>
        </View>

        <View style={s.cardMidColumn}>
          <ThemedText style={[s.instName, { color: colors.text }]} numberOfLines={1}>
            {institution.name}
          </ThemedText>

          {/* Location + type badge */}
          <View style={s.cardMetaRow}>
            <ThemedText style={[s.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
              {institution.location}
            </ThemedText>
            {institution.type ? (
              <View style={[s.typeBadge, { backgroundColor: statusColor + '2E' }]}>
                <IconSymbol name={typeIcon as any} size={10} color={statusColor} />
                <ThemedText style={[s.typeBadgeText, { color: statusColor }]}>
                  {institution.type.charAt(0).toUpperCase() + institution.type.slice(1)}
                </ThemedText>
              </View>
            ) : null}
          </View>
        </View>

        {/* Status badge */}
        <View style={[s.statusBadge, { backgroundColor: statusColor + '2E' }]}>
          <ThemedText style={[s.statusBadgeText, { color: statusColor }]}>
            {institution.status.toUpperCase()}
          </ThemedText>
        </View>
      </View>

      {/* Admin avatars + names */}
      {institution.admins.length > 0 ? (
        <View style={s.adminsRow}>
          <View style={s.avatarStack}>
            {institution.admins.slice(0, 3).map((admin, i) => (
              <View
                key={admin.id}
                style={[
                  s.adminAvatar,
                  {
                    backgroundColor: admin.avatarColor,
                    marginLeft: i > 0 ? -8 : 0,
                    zIndex: 3 - i,
                  },
                ]}
              >
                <ThemedText style={s.adminInitials}>{admin.initials}</ThemedText>
              </View>
            ))}
          </View>
          <ThemedText style={[s.adminNames, { color: colors.textSecondary }]} numberOfLines={1}>
            {institution.admins.map((a) => a.name).join(', ')}
          </ThemedText>
        </View>
      ) : null}

      {/* Next key date */}
      {institution.nextKeyDate ? (
        <View style={s.keyDateRow}>
          <IconSymbol name="calendar" size={12} color={colors.textSecondary} />
          <ThemedText style={[s.keyDateText, { color: colors.textSecondary }]}>
            {institution.nextKeyDate.label} {'·'} {institution.nextKeyDate.date}
          </ThemedText>
        </View>
      ) : null}

      {/* People count */}
      <View style={s.peopleRow}>
        <IconSymbol name="person.3.fill" size={12} color={colors.textTertiary} />
        <ThemedText style={[s.peopleText, { color: colors.textTertiary }]}>
          {institution.peopleCount.toLocaleString()} people
        </ThemedText>
      </View>

      {/* Quick actions */}
      <View style={[s.quickActionsRow, { borderTopColor: colors.border }]}>
        <Pressable
          style={[s.quickBtn, { backgroundColor: accentColor + '18' }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <ThemedText style={[s.quickBtnText, { color: accentColor }]}>Open</ThemedText>
        </Pressable>
        {institution.hasRooms ? (
          <Pressable
            style={[s.quickBtn, { backgroundColor: colors.backgroundTertiary }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <ThemedText style={[s.quickBtnText, { color: colors.textSecondary }]}>Rooms</ThemedText>
          </Pressable>
        ) : null}
        <Pressable
          style={[s.quickBtn, { backgroundColor: colors.backgroundTertiary }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <ThemedText style={[s.quickBtnText, { color: colors.textSecondary }]}>Operations</ThemedText>
        </Pressable>
      </View>
    </Pressable>
  );
}

// =============================================================================
// INSTITUTION HUB (DETAIL VIEW)
// =============================================================================

function InstitutionHub({
  institution,
  colors,
  accentColor,
  onBack,
}: {
  institution: InstitutionFull;
  colors: typeof Colors.light;
  accentColor: string;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<InstitutionHubTabId>('overview');
  const statusColor = STATUS_COLOR_MAP[institution.status];
  const typeIcon = TYPE_ICON_MAP[institution.type];

  // === Data lookups ===
  const departments = useMemo(() => getDepartmentsForInstitution(institution.id), [institution.id]);
  const events = useMemo(() => getEventsForInstitution(institution.id), [institution.id]);
  const rooms = useMemo(() => getRoomsForInstitution(institution.id), [institution.id]);
  const auditEntries = useMemo(
    () => getAuditForInstitution(institution.id).sort((a, b) => b.timestampMs - a.timestampMs),
    [institution.id],
  );

  // === Tab content renderer ===
  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      // ── Overview ──
      case 'overview':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.hubScroll}>
            {/* Description */}
            <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.sectionTitle, { color: colors.text }]}>About</ThemedText>
              <ThemedText style={[s.descText, { color: colors.textSecondary }]}>
                {institution.description}
              </ThemedText>
            </View>

            {/* Key metrics */}
            <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Key Metrics</ThemedText>
              <View style={s.statGrid}>
                <StatCard label="Enrollment" value={institution.peopleCount.toLocaleString()} colors={colors} />
                <StatCard label="Programs" value={KaNeXT_ACADEMICS.totalPrograms} colors={colors} />
                <StatCard label="Faculty Ratio" value={KaNeXT_ACADEMICS.studentFacultyRatio} colors={colors} />
                <StatCard label="Grad Rate" value="48%" colors={colors} />
              </View>
            </View>

            {/* Next key date */}
            {institution.nextKeyDate ? (
              <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Next Key Date</ThemedText>
                <View style={s.keyDateRow}>
                  <IconSymbol name="calendar" size={14} color={accentColor} />
                  <ThemedText style={[s.keyDateLabel, { color: colors.text }]}>
                    {institution.nextKeyDate.label} {'·'} {institution.nextKeyDate.date}
                  </ThemedText>
                </View>
              </View>
            ) : null}

            {/* Admins */}
            <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Administrators</ThemedText>
              {institution.admins.map((admin) => (
                <View key={admin.id} style={s.adminListRow}>
                  <View style={[s.adminAvatarLg, { backgroundColor: admin.avatarColor }]}>
                    <ThemedText style={s.adminInitialsLg}>{admin.initials}</ThemedText>
                  </View>
                  <View style={s.adminInfo}>
                    <ThemedText style={[s.adminName, { color: colors.text }]}>{admin.name}</ThemedText>
                    <ThemedText style={[s.adminTitle, { color: colors.textSecondary }]}>{admin.title}</ThemedText>
                  </View>
                </View>
              ))}
            </View>

            {/* Quick stats */}
            <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Quick Stats</ThemedText>
              <StatRow label="Departments" value={departments.length} colors={colors} />
              <StatRow label="Upcoming Events" value={events.length} colors={colors} />
              <StatRow label="Active Rooms" value={rooms.length} colors={colors} />
              <StatRow label="Founded" value={institution.founded} colors={colors} />
            </View>
          </ScrollView>
        );

      // ── Academics ──
      case 'academics':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.hubScroll}>
            <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Academic Programs</ThemedText>
              <View style={s.statGrid}>
                <StatCard label="Total Programs" value={KaNeXT_ACADEMICS.totalPrograms} colors={colors} />
                <StatCard label="Undergraduate" value={KaNeXT_ACADEMICS.undergrad} colors={colors} />
                <StatCard label="Graduate" value={KaNeXT_ACADEMICS.graduate} colors={colors} />
                <StatCard label="Certificates" value={KaNeXT_ACADEMICS.certificates} colors={colors} />
              </View>
            </View>

            <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Program Formats</ThemedText>
              <View style={s.chipRow}>
                {KaNeXT_ACADEMICS.programFormats.map((fmt) => (
                  <View key={fmt} style={[s.formatChip, { backgroundColor: colors.backgroundTertiary }]}>
                    <ThemedText style={[s.formatChipText, { color: colors.textSecondary }]}>{fmt}</ThemedText>
                  </View>
                ))}
              </View>
              <StatRow label="Student-Faculty Ratio" value={KaNeXT_ACADEMICS.studentFacultyRatio} colors={colors} />
            </View>

            <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Departments</ThemedText>
              {departments.map((dept) => (
                <View key={dept.id} style={[s.deptRow, { borderColor: colors.border }]}>
                  <ThemedText style={[s.deptName, { color: colors.text }]} numberOfLines={1}>{dept.name}</ThemedText>
                  <ThemedText style={[s.deptMeta, { color: colors.textTertiary }]}>
                    {dept.programCount} programs {'·'} {dept.facultyCount} faculty
                  </ThemedText>
                </View>
              ))}
            </View>
          </ScrollView>
        );

      // ── Admissions ──
      case 'admissions':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.hubScroll}>
            <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Admissions Overview</ThemedText>
              <StatRow label="Acceptance Rate" value={KaNeXT_ADMISSIONS.acceptanceRate} colors={colors} />
              <StatRow label="Avg GPA" value={KaNeXT_ADMISSIONS.avgGPA} colors={colors} />
              <StatRow label="Application Deadline" value={KaNeXT_ADMISSIONS.applicationDeadline} colors={colors} />
              <StatRow label="Total Enrollment" value={KaNeXT_ADMISSIONS.enrollmentTotal.toLocaleString()} colors={colors} />
              <StatRow label="New Students" value={KaNeXT_ADMISSIONS.newStudents.toLocaleString()} colors={colors} />
            </View>
          </ScrollView>
        );

      // ── Student Life ──
      case 'student-life':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.hubScroll}>
            <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Student Life</ThemedText>
              <View style={s.statGrid}>
                <StatCard label="Clubs" value={KaNeXT_STUDENT_LIFE.clubs} colors={colors} />
                <StatCard label="Athletics" value={KaNeXT_STUDENT_LIFE.athletics} colors={colors} />
                <StatCard label="Housing Capacity" value={KaNeXT_STUDENT_LIFE.housingCapacity} colors={colors} />
                <StatCard label="Dining Plans" value={KaNeXT_STUDENT_LIFE.diningPlans} colors={colors} />
              </View>
            </View>
          </ScrollView>
        );

      // ── Departments ──
      case 'departments':
        return (
          <FlatList
            data={departments}
            keyExtractor={(item) => item.id}
            contentContainerStyle={s.hubScroll}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ThemedText style={[s.deptName, { color: colors.text }]}>{item.name}</ThemedText>
                <ThemedText style={[s.deptChair, { color: colors.textSecondary }]}>
                  Chairperson: {item.chairperson}
                </ThemedText>
                <View style={s.deptStatsRow}>
                  <ThemedText style={[s.deptStat, { color: colors.textTertiary }]}>
                    {item.programCount} programs
                  </ThemedText>
                  <ThemedText style={[s.deptStat, { color: colors.textTertiary }]}>
                    {item.facultyCount} faculty
                  </ThemedText>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={s.emptyContainer}>
                <IconSymbol name="building.2" size={32} color={colors.textTertiary} />
                <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>No departments</ThemedText>
              </View>
            }
          />
        );

      // ── People ──
      case 'people':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.hubScroll}>
            {/* Admins */}
            <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Administrators</ThemedText>
              {institution.admins.map((admin) => (
                <View key={admin.id} style={s.adminListRow}>
                  <View style={[s.adminAvatarLg, { backgroundColor: admin.avatarColor }]}>
                    <ThemedText style={s.adminInitialsLg}>{admin.initials}</ThemedText>
                  </View>
                  <View style={s.adminInfo}>
                    <ThemedText style={[s.adminName, { color: colors.text }]}>{admin.name}</ThemedText>
                    <ThemedText style={[s.adminTitle, { color: colors.textSecondary }]}>{admin.title}</ThemedText>
                  </View>
                </View>
              ))}
            </View>

            {/* Faculty & Staff placeholder */}
            <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Faculty & Staff</ThemedText>
              <View style={s.placeholderContent}>
                <IconSymbol name="person.3.fill" size={28} color={colors.textTertiary} />
                <ThemedText style={[s.placeholderText, { color: colors.textSecondary }]}>
                  {institution.peopleCount.toLocaleString()} people in this institution
                </ThemedText>
              </View>
            </View>
          </ScrollView>
        );

      // ── Events ──
      case 'events':
        return (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            contentContainerStyle={s.hubScroll}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const d = new Date(item.date);
              const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
              const day = d.getDate();
              const typeColor = EVENT_TYPE_COLORS[item.type] ?? '#A1A1AA';
              return (
                <View style={[s.eventRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {/* Date box */}
                  <View style={[s.dateBox, { backgroundColor: colors.backgroundTertiary }]}>
                    <ThemedText style={[s.dateMonth, { color: accentColor }]}>{month}</ThemedText>
                    <ThemedText style={[s.dateDay, { color: colors.text }]}>{day}</ThemedText>
                  </View>

                  {/* Info column */}
                  <View style={s.eventInfo}>
                    <ThemedText style={[s.eventTitle, { color: colors.text }]} numberOfLines={2}>
                      {item.title}
                    </ThemedText>
                    <ThemedText style={[s.eventTime, { color: colors.textSecondary }]}>
                      {item.time}
                    </ThemedText>
                    <View style={s.eventMetaRow}>
                      <View style={[s.eventTypeBadge, { backgroundColor: typeColor + '2E' }]}>
                        <ThemedText style={[s.eventTypeText, { color: typeColor }]}>
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </ThemedText>
                      </View>
                      {item.location ? (
                        <ThemedText style={[s.eventLocation, { color: colors.textTertiary }]} numberOfLines={1}>
                          {item.location}
                        </ThemedText>
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={s.emptyContainer}>
                <IconSymbol name="calendar" size={32} color={colors.textTertiary} />
                <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>No events</ThemedText>
              </View>
            }
          />
        );

      // ── Operations ──
      case 'operations':
        return (
          <View style={s.placeholderContainer}>
            <IconSymbol name="gearshape.fill" size={36} color={colors.textTertiary} />
            <ThemedText style={[s.placeholderText, { color: colors.textSecondary }]}>
              Institution operations and logistics
            </ThemedText>
          </View>
        );

      // ── Finance ──
      case 'finance':
        return (
          <View style={s.placeholderContainer}>
            <IconSymbol name="dollarsign.circle.fill" size={36} color={colors.textTertiary} />
            <ThemedText style={[s.placeholderText, { color: colors.textSecondary }]}>
              Institution financial overview
            </ThemedText>
          </View>
        );

      // ── Payment Rails ──
      case 'payment-rails':
        return (
          <View style={s.placeholderContainer}>
            <IconSymbol name="creditcard.fill" size={36} color={colors.textTertiary} />
            <ThemedText style={[s.placeholderText, { color: colors.textSecondary }]}>
              Institution payment processing
            </ThemedText>
          </View>
        );

      // ── Compliance ──
      case 'compliance':
        return (
          <View style={s.placeholderContainer}>
            <IconSymbol name="shield.fill" size={36} color={colors.textTertiary} />
            <ThemedText style={[s.placeholderText, { color: colors.textSecondary }]}>
              Accreditation and regulatory compliance
            </ThemedText>
          </View>
        );

      // ── Film Room ──
      case 'film-room':
        return institution.hasFilmRoom ? (
          <View style={s.placeholderContainer}>
            <Pressable
              style={[s.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="film.fill" size={28} color={accentColor} />
              <ThemedText style={[s.actionCardTitle, { color: colors.text }]}>Open Film Room</ThemedText>
              <ThemedText style={[s.actionCardSub, { color: colors.textSecondary }]}>
                Access institutional film archives and media
              </ThemedText>
            </Pressable>
          </View>
        ) : (
          <View style={s.placeholderContainer}>
            <IconSymbol name="film" size={36} color={colors.textTertiary} />
            <ThemedText style={[s.placeholderText, { color: colors.textSecondary }]}>
              Film Room not enabled for this institution
            </ThemedText>
          </View>
        );

      // ── Library ──
      case 'library':
        return institution.hasLibrary ? (
          <View style={s.placeholderContainer}>
            <Pressable
              style={[s.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="books.vertical.fill" size={28} color={accentColor} />
              <ThemedText style={[s.actionCardTitle, { color: colors.text }]}>Open Library</ThemedText>
              <ThemedText style={[s.actionCardSub, { color: colors.textSecondary }]}>
                Access institutional library collections and resources
              </ThemedText>
            </Pressable>
          </View>
        ) : (
          <View style={s.placeholderContainer}>
            <IconSymbol name="book" size={36} color={colors.textTertiary} />
            <ThemedText style={[s.placeholderText, { color: colors.textSecondary }]}>
              Library not enabled for this institution
            </ThemedText>
          </View>
        );

      // ── Rooms ──
      case 'rooms':
        return (
          <FlatList
            data={rooms}
            keyExtractor={(item) => item.id}
            contentContainerStyle={s.hubScroll}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                style={[s.roomRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <View style={[s.roomIconCircle, { backgroundColor: accentColor + '18' }]}>
                  <IconSymbol name={item.icon as any} size={16} color={accentColor} />
                </View>
                <View style={s.roomInfo}>
                  <ThemedText style={[s.roomTitle, { color: colors.text }]}>{item.title}</ThemedText>
                  <ThemedText style={[s.roomMeta, { color: colors.textTertiary }]}>
                    {item.memberCount} members
                  </ThemedText>
                </View>
                {item.unreadCount > 0 ? (
                  <View style={[s.unreadBadge, { backgroundColor: accentColor }]}>
                    <ThemedText style={s.unreadText}>{item.unreadCount}</ThemedText>
                  </View>
                ) : null}
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={s.emptyContainer}>
                <IconSymbol name="bubble.left.and.bubble.right" size={32} color={colors.textTertiary} />
                <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>No rooms</ThemedText>
              </View>
            }
          />
        );

      // ── Audit ──
      case 'audit':
        return (
          <FlatList
            data={auditEntries}
            keyExtractor={(item) => item.id}
            contentContainerStyle={s.hubScroll}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const actionKey = getAuditActionKey(item.action);
              const actionColor = AUDIT_ACTION_COLOR[actionKey] ?? AUDIT_ACTION_COLOR.default;
              const actionIcon = AUDIT_ACTION_ICON[actionKey] ?? AUDIT_ACTION_ICON.default;
              return (
                <View style={[s.auditRow, { borderColor: colors.border }]}>
                  <View style={[s.auditIconCircle, { backgroundColor: actionColor + '26' }]}>
                    <IconSymbol name={actionIcon as any} size={14} color={actionColor} />
                  </View>
                  <View style={s.auditTextColumn}>
                    <ThemedText style={[s.auditDesc, { color: colors.text }]} numberOfLines={2}>
                      {item.description}
                    </ThemedText>
                    <ThemedText style={[s.auditMeta, { color: colors.textTertiary }]}>
                      {item.actor} {'·'} {item.timestamp}
                    </ThemedText>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={s.emptyContainer}>
                <IconSymbol name="list.clipboard" size={32} color={colors.textTertiary} />
                <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>No audit entries</ThemedText>
              </View>
            }
          />
        );

      // ── Settings ──
      case 'settings':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.hubScroll}>
            <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Institution Settings</ThemedText>
              <Pressable
                style={[s.settingsButton, { borderColor: colors.border }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="pencil" size={16} color={colors.textSecondary} />
                <ThemedText style={[s.settingsButtonText, { color: colors.text }]}>Edit Institution</ThemedText>
              </Pressable>
              <Pressable
                style={[s.settingsButton, { borderColor: colors.border }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="archivebox" size={16} color={colors.textSecondary} />
                <ThemedText style={[s.settingsButtonText, { color: colors.text }]}>Archive</ThemedText>
              </Pressable>
              <Pressable
                style={[s.settingsButton, { borderColor: colors.border }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="person.fill" size={16} color={colors.textSecondary} />
                <ThemedText style={[s.settingsButtonText, { color: colors.text }]}>Change Owner</ThemedText>
              </Pressable>
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  }, [activeTab, institution, colors, accentColor, departments, events, rooms, auditEntries]);

  return (
    <View style={s.flex1}>
      {/* === Identity Header === */}
      <View style={s.hubHeader}>
        <View style={s.hubHeaderTop}>
          <Pressable
            style={s.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onBack();
            }}
          >
            <IconSymbol name="chevron.left" size={18} color={colors.text} />
          </Pressable>

          <View style={[s.logoCircleLg, { backgroundColor: institution.avatarColor }]}>
            <ThemedText style={s.logoTextLg}>{institution.shortName}</ThemedText>
          </View>

          <View style={s.hubHeaderInfo}>
            <ThemedText style={[s.hubName, { color: colors.text }]} numberOfLines={1}>
              {institution.name}
            </ThemedText>
            <View style={s.hubHeaderMeta}>
              <ThemedText style={[s.hubLocation, { color: colors.textSecondary }]}>
                {institution.location}
              </ThemedText>
              <View style={[s.typeBadge, { backgroundColor: statusColor + '2E' }]}>
                <IconSymbol name={typeIcon as any} size={10} color={statusColor} />
                <ThemedText style={[s.typeBadgeText, { color: statusColor }]}>
                  {institution.type.charAt(0).toUpperCase() + institution.type.slice(1)}
                </ThemedText>
              </View>
              <View style={[s.statusBadge, { backgroundColor: statusColor + '2E' }]}>
                <ThemedText style={[s.statusBadgeText, { color: statusColor }]}>
                  {institution.status.toUpperCase()}
                </ThemedText>
              </View>
            </View>
            {institution.founded || institution.accreditation ? (
              <ThemedText style={[s.hubFoundLine, { color: colors.textTertiary }]}>
                {institution.founded ? `Est. ${institution.founded}` : ''}
                {institution.founded && institution.accreditation ? ' · ' : ''}
                {institution.accreditation ? `Accredited: ${institution.accreditation}` : ''}
              </ThemedText>
            ) : null}
          </View>
        </View>

        {/* Primary action buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.hubActionsRow}
        >
          {institution.hasRooms ? (
            <Pressable
              style={[s.hubActionBtn, { backgroundColor: accentColor + '18' }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="bubble.left.fill" size={14} color={accentColor} />
              <ThemedText style={[s.hubActionText, { color: accentColor }]}>Open Rooms</ThemedText>
            </Pressable>
          ) : null}
          {institution.hasFilmRoom ? (
            <Pressable
              style={[s.hubActionBtn, { backgroundColor: colors.backgroundTertiary }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="film.fill" size={14} color={colors.textSecondary} />
              <ThemedText style={[s.hubActionText, { color: colors.textSecondary }]}>Open Film Room</ThemedText>
            </Pressable>
          ) : null}
          {institution.hasLibrary ? (
            <Pressable
              style={[s.hubActionBtn, { backgroundColor: colors.backgroundTertiary }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="books.vertical.fill" size={14} color={colors.textSecondary} />
              <ThemedText style={[s.hubActionText, { color: colors.textSecondary }]}>Open Library</ThemedText>
            </Pressable>
          ) : null}
          <Pressable
            style={[s.hubActionBtn, { backgroundColor: colors.backgroundTertiary }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="gearshape.fill" size={14} color={colors.textSecondary} />
            <ThemedText style={[s.hubActionText, { color: colors.textSecondary }]}>Settings</ThemedText>
          </Pressable>
        </ScrollView>

        {/* 16-tab pill nav */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabPillRow}
        >
          {INSTITUTION_HUB_TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <Pressable
                key={tab.id}
                style={[
                  s.tabPill,
                  { backgroundColor: isActive ? accentColor : colors.backgroundTertiary },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(tab.id);
                }}
              >
                <ThemedText
                  style={[s.tabPillText, { color: isActive ? '#000' : colors.textSecondary }]}
                >
                  {tab.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* === Tab Content === */}
      <View style={s.flex1}>{renderTabContent()}</View>
    </View>
  );
}

// =============================================================================
// FILTER BOTTOM SHEET
// =============================================================================

function FilterSheet({
  visible,
  onClose,
  colors,
  accentColor,
  filterState,
  onApply,
}: {
  visible: boolean;
  onClose: () => void;
  colors: typeof Colors.light;
  accentColor: string;
  filterState: {
    sort: 'az' | 'recent' | 'status';
    statuses: InstitutionStatus[];
    types: InstitutionType[];
  };
  onApply: (state: {
    sort: 'az' | 'recent' | 'status';
    statuses: InstitutionStatus[];
    types: InstitutionType[];
  }) => void;
}) {
  const [localSort, setLocalSort] = useState(filterState.sort);
  const [localStatuses, setLocalStatuses] = useState<InstitutionStatus[]>(filterState.statuses);
  const [localTypes, setLocalTypes] = useState<InstitutionType[]>(filterState.types);

  const toggleStatus = useCallback((status: InstitutionStatus) => {
    setLocalStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
  }, []);

  const toggleType = useCallback((type: InstitutionType) => {
    setLocalTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }, []);

  const handleClear = useCallback(() => {
    setLocalSort('az');
    setLocalStatuses([]);
    setLocalTypes([]);
  }, []);

  const handleApply = useCallback(() => {
    onApply({ sort: localSort, statuses: localStatuses, types: localTypes });
    onClose();
  }, [localSort, localStatuses, localTypes, onApply, onClose]);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filter Institutions" useModal>
      {/* Sort */}
      <ThemedText style={[s.filterSectionLabel, { color: colors.text }]}>Sort</ThemedText>
      {SORT_OPTIONS.map((opt) => {
        const isActive = localSort === opt.key;
        return (
          <Pressable
            key={opt.key}
            style={s.filterOptionRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setLocalSort(opt.key);
            }}
          >
            <View
              style={[
                s.radioOuter,
                { borderColor: isActive ? accentColor : colors.textTertiary },
              ]}
            >
              {isActive ? <View style={[s.radioInner, { backgroundColor: accentColor }]} /> : null}
            </View>
            <ThemedText style={[s.filterOptionText, { color: colors.text }]}>
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}

      {/* Status */}
      <ThemedText style={[s.filterSectionLabel, { color: colors.text, marginTop: Spacing.md }]}>
        Status
      </ThemedText>
      {STATUS_OPTIONS.map((status) => {
        const isChecked = localStatuses.includes(status);
        const sColor = STATUS_COLOR_MAP[status];
        return (
          <Pressable
            key={status}
            style={s.filterOptionRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleStatus(status);
            }}
          >
            <View
              style={[
                s.checkboxOuter,
                {
                  borderColor: isChecked ? accentColor : colors.textTertiary,
                  backgroundColor: isChecked ? accentColor : 'transparent',
                },
              ]}
            >
              {isChecked ? <IconSymbol name="checkmark" size={12} color="#000" /> : null}
            </View>
            <View style={[s.filterDot, { backgroundColor: sColor }]} />
            <ThemedText style={[s.filterOptionText, { color: colors.text }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </ThemedText>
          </Pressable>
        );
      })}

      {/* Type */}
      <ThemedText style={[s.filterSectionLabel, { color: colors.text, marginTop: Spacing.md }]}>
        Type
      </ThemedText>
      {TYPE_OPTIONS.map((type) => {
        const isChecked = localTypes.includes(type);
        return (
          <Pressable
            key={type}
            style={s.filterOptionRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleType(type);
            }}
          >
            <View
              style={[
                s.checkboxOuter,
                {
                  borderColor: isChecked ? accentColor : colors.textTertiary,
                  backgroundColor: isChecked ? accentColor : 'transparent',
                },
              ]}
            >
              {isChecked ? <IconSymbol name="checkmark" size={12} color="#000" /> : null}
            </View>
            <ThemedText style={[s.filterOptionText, { color: colors.text }]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </ThemedText>
          </Pressable>
        );
      })}

      {/* Action buttons */}
      <View style={s.filterActions}>
        <Pressable
          style={[s.filterGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            handleClear();
          }}
        >
          <ThemedText style={[s.filterGhostText, { color: colors.textSecondary }]}>
            Clear
          </ThemedText>
        </Pressable>
        <Pressable
          style={[s.filterApplyButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleApply();
          }}
        >
          <ThemedText style={s.filterApplyText}>Apply</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// CREATE INSTITUTION BOTTOM SHEET
// =============================================================================

function CreateInstitutionSheet({
  visible,
  onClose,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [statusVal, setStatusVal] = useState<'active' | 'partner'>('active');
  const [defaults, setDefaults] = useState({ ...CREATE_DEFAULTS });

  const toggleDefault = useCallback((key: keyof typeof CREATE_DEFAULTS) => {
    setDefaults((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="New Institution" useModal>
      {/* Institution Name */}
      <ThemedText style={[s.formLabel, { color: colors.textSecondary }]}>Institution Name</ThemedText>
      <TextInput
        style={[s.formInput, { color: colors.text, backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
        placeholder="Enter institution name"
        placeholderTextColor={colors.textTertiary}
        value={name}
        onChangeText={setName}
      />

      {/* Location */}
      <ThemedText style={[s.formLabel, { color: colors.textSecondary }]}>Location</ThemedText>
      <TextInput
        style={[s.formInput, { color: colors.text, backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
        placeholder="City, State"
        placeholderTextColor={colors.textTertiary}
        value={location}
        onChangeText={setLocation}
      />

      {/* Primary Admin */}
      <ThemedText style={[s.formLabel, { color: colors.textSecondary }]}>Primary Admin</ThemedText>
      <Pressable
        style={[s.formInput, s.formSelect, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <ThemedText style={[s.formSelectText, { color: colors.textTertiary }]}>Select admin...</ThemedText>
        <IconSymbol name="chevron.down" size={14} color={colors.textTertiary} />
      </Pressable>

      {/* Status */}
      <ThemedText style={[s.formLabel, { color: colors.textSecondary }]}>Status</ThemedText>
      <View style={s.statusPickerRow}>
        {(['active', 'partner'] as const).map((st) => {
          const isActive = statusVal === st;
          return (
            <Pressable
              key={st}
              style={[
                s.statusPickerPill,
                {
                  backgroundColor: isActive ? accentColor : colors.backgroundTertiary,
                  borderColor: isActive ? accentColor : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setStatusVal(st);
              }}
            >
              <ThemedText
                style={[s.statusPickerText, { color: isActive ? '#000' : colors.textSecondary }]}
              >
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Defaults */}
      <ThemedText style={[s.formLabel, { color: colors.textSecondary, marginTop: Spacing.md }]}>
        Defaults
      </ThemedText>
      {CREATE_DEFAULTS_LIST.map((item) => (
        <View key={item.key} style={s.switchRow}>
          <ThemedText style={[s.switchLabel, { color: colors.text }]}>{item.label}</ThemedText>
          <Switch
            value={defaults[item.key]}
            onValueChange={() => toggleDefault(item.key)}
            trackColor={{ false: colors.backgroundTertiary, true: accentColor + '60' }}
            thumbColor={defaults[item.key] ? accentColor : colors.textTertiary}
          />
        </View>
      ))}

      {/* Create button */}
      <Pressable
        style={[s.createButton, { backgroundColor: accentColor, marginTop: Spacing.lg }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          // Visual only
        }}
      >
        <ThemedText style={s.createButtonText}>Create Institution</ThemedText>
      </Pressable>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function OrgInstitutionsTab({ colors, accentColor }: Props) {
  // === State ===
  const [activeScope, setActiveScope] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionFull | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [filterSort, setFilterSort] = useState<'az' | 'recent' | 'status'>('az');
  const [filterStatuses, setFilterStatuses] = useState<InstitutionStatus[]>([]);
  const [filterTypes, setFilterTypes] = useState<InstitutionType[]>([]);

  // === Derived data ===
  const processedInstitutions = useMemo(() => {
    const filtered = filterInstitutions(INSTITUTIONS, search, activeScope, filterStatuses, filterTypes);
    return sortInstitutions(filtered, filterSort);
  }, [search, activeScope, filterStatuses, filterTypes, filterSort]);

  const handleApplyFilter = useCallback(
    (state: { sort: 'az' | 'recent' | 'status'; statuses: InstitutionStatus[]; types: InstitutionType[] }) => {
      setFilterSort(state.sort);
      setFilterStatuses(state.statuses);
      setFilterTypes(state.types);
    },
    [],
  );

  // === If institution hub selected ===
  if (selectedInstitution) {
    return (
      <InstitutionHub
        institution={selectedInstitution}
        colors={colors}
        accentColor={accentColor}
        onBack={() => setSelectedInstitution(null)}
      />
    );
  }

  // === Directory view ===
  return (
    <View style={s.flex1}>
      {/* Header */}
      <FlatList
        data={processedInstitutions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={s.headerArea}>
            {/* Row: Title + filter + new institution */}
            <View style={s.headerRow}>
              <ThemedText style={[s.headerTitle, { color: colors.text }]}>Institutions</ThemedText>
              <View style={s.headerActions}>
                <Pressable
                  style={[s.iconButton, { backgroundColor: colors.backgroundTertiary }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowFilter(true);
                  }}
                >
                  <IconSymbol name="slider.horizontal.3" size={16} color={colors.textSecondary} />
                </Pressable>
                <Pressable
                  style={[s.newButton, { backgroundColor: accentColor }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowCreate(true);
                  }}
                >
                  <IconSymbol name="plus" size={14} color="#000" />
                  <ThemedText style={s.newButtonText}>New Institution</ThemedText>
                </Pressable>
              </View>
            </View>

            {/* Scope chip bar */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.scopeChipRow}
            >
              {INSTITUTION_SCOPE_CHIPS.map((chip) => {
                const isActive = chip.key === activeScope;
                return (
                  <Pressable
                    key={chip.key}
                    style={[
                      s.scopeChip,
                      {
                        backgroundColor: isActive ? accentColor : colors.backgroundTertiary,
                        borderColor: isActive ? accentColor : colors.border,
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setActiveScope(chip.key);
                    }}
                  >
                    <ThemedText
                      style={[s.scopeChipText, { color: isActive ? '#000' : colors.textSecondary }]}
                    >
                      {chip.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Search bar */}
            <View style={s.searchContainer}>
              <View
                style={[s.searchBar, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
              >
                <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
                <TextInput
                  style={[s.searchInput, { color: colors.text }]}
                  placeholder="Search institutions\u2026"
                  placeholderTextColor={colors.textTertiary}
                  value={search}
                  onChangeText={setSearch}
                />
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <InstitutionCard
            institution={item}
            colors={colors}
            accentColor={accentColor}
            onPress={() => setSelectedInstitution(item)}
          />
        )}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <IconSymbol name="building.columns" size={32} color={colors.textTertiary} />
            <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>
              No institutions match your search
            </ThemedText>
          </View>
        }
      />

      {/* === Bottom Sheets === */}
      <FilterSheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        colors={colors}
        accentColor={accentColor}
        filterState={{ sort: filterSort, statuses: filterStatuses, types: filterTypes }}
        onApply={handleApplyFilter}
      />
      <CreateInstitutionSheet
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        colors={colors}
        accentColor={accentColor}
      />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  flex1: {
    flex: 1,
  },

  // === Header area ===
  headerArea: {
    paddingTop: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  newButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },

  // === Scope chips ===
  scopeChipRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  scopeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  scopeChipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // === Search ===
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    height: 40,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },

  // === Tab pills ===
  tabPillRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // === Institution card ===
  instCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardMidColumn: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  instName: {
    fontSize: 17,
    fontWeight: '600',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  locationText: {
    fontSize: 13,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Admin avatars
  adminsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  adminAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0B0F14',
  },
  adminInitials: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  adminNames: {
    fontSize: 12,
    flex: 1,
  },

  // Key date
  keyDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  keyDateText: {
    fontSize: 12,
  },
  keyDateLabel: {
    fontSize: 14,
    fontWeight: '500',
  },

  // People
  peopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  peopleText: {
    fontSize: 12,
  },

  // Quick actions
  quickActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  quickBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  quickBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // === List ===
  listContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // === Institution Hub ===
  hubHeader: {
    paddingTop: Spacing.sm,
  },
  hubHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircleLg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTextLg: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hubHeaderInfo: {
    flex: 1,
  },
  hubName: {
    fontSize: 18,
    fontWeight: '700',
  },
  hubHeaderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
    flexWrap: 'wrap',
  },
  hubLocation: {
    fontSize: 13,
  },
  hubFoundLine: {
    fontSize: 12,
    marginTop: 2,
  },

  // Hub actions row
  hubActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  hubActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  hubActionText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Hub scroll
  hubScroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  hubCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  descText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Stat grid
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // Summary row
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  // Admin list
  adminListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
  },
  adminAvatarLg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminInitialsLg: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 14,
    fontWeight: '600',
  },
  adminTitle: {
    fontSize: 12,
  },

  // Department rows
  deptRow: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  deptName: {
    fontSize: 15,
    fontWeight: '600',
  },
  deptChair: {
    fontSize: 13,
    marginTop: 2,
  },
  deptStatsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: 4,
  },
  deptStat: {
    fontSize: 12,
  },
  deptMeta: {
    fontSize: 12,
    marginTop: 2,
  },

  // Chip row (formats)
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  formatChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  formatChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Events
  eventRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  dateBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '700',
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  eventTime: {
    fontSize: 12,
    marginTop: 2,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  eventTypeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  eventLocation: {
    fontSize: 12,
    flex: 1,
  },

  // Rooms
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  roomIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomInfo: {
    flex: 1,
  },
  roomTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  roomMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
  },

  // Audit
  auditRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  auditIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  auditTextColumn: {
    flex: 1,
  },
  auditDesc: {
    fontSize: 14,
    fontWeight: '500',
  },
  auditMeta: {
    fontSize: 12,
    marginTop: 2,
  },

  // Settings
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingsButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Placeholders
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.md,
  },
  placeholderContent: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  placeholderText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // Action cards (film room / library)
  actionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
    gap: Spacing.sm,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionCardSub: {
    fontSize: 13,
    textAlign: 'center',
  },

  // === Filter sheet ===
  filterSectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  filterOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
  },
  filterOptionText: {
    fontSize: 14,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  checkboxOuter: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  filterGhostButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  filterGhostText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterApplyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  filterApplyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },

  // === Create sheet ===
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: Spacing.sm,
  },
  formInput: {
    height: 44,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    fontSize: 14,
    justifyContent: 'center',
  },
  formSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formSelectText: {
    fontSize: 14,
  },
  statusPickerRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statusPickerPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  statusPickerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
  },
  createButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },

  // === Empty state ===
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: 14,
    marginTop: Spacing.sm,
  },
});
