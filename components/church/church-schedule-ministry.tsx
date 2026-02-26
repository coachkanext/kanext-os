/**
 * Church Schedule — Ministry View
 *
 * Events for ministries you belong to in the active campus.
 * Grouped by ministry → then by date within each ministry.
 * SERVING badge when assigned to serve.
 * Tap → Event Detail Sheet.
 *
 * Demo user roles:
 *   ICCLA — Singles Ministry (Member) + Formation Kids (Teacher)
 *   ICCIE — Formation Kids (Teacher)
 *
 * Campus-scoped. Ministry-membership filtered.
 * Read-only. No inline editing. Writes via Nexus only.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, SectionList } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ImpactFeedbackStyle } from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { ChurchEventDetailSheet } from '@/components/church/church-event-detail-sheet';
import type { ChurchEvent } from '@/data/mock-church-events';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

type MinistryEventType = 'CLASS' | 'SMALL_GROUP' | 'PLANNING' | 'OUTREACH' | 'TRAINING';

interface MinistryEventRow {
  id: string;
  ministryId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  room: string;
  type: MinistryEventType;
  servingRole?: string;
  isServing: boolean;
  rsvpEnabled: boolean;
  description?: string;
}

interface MinistryInfo {
  id: string;
  name: string;
  leader: string;
  description: string;
  color: string;
  icon: IconSymbolName;
}

interface MinistrySection {
  ministry: MinistryInfo;
  data: MinistryEventRow[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

const TYPE_CONFIG: Record<MinistryEventType, { label: string; color: string; icon: IconSymbolName }> = {
  CLASS: { label: 'Class', color: '#1D9BF0', icon: 'book.fill' },
  SMALL_GROUP: { label: 'Small Group', color: '#22C55E', icon: 'person.3.fill' },
  PLANNING: { label: 'Planning', color: '#8B5CF6', icon: 'list.clipboard.fill' },
  OUTREACH: { label: 'Outreach', color: '#F59E0B', icon: 'hand.raised.fill' },
  TRAINING: { label: 'Training', color: '#EC4899', icon: 'star.fill' },
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// =============================================================================
// MOCK — MINISTRY INFO (user's ministries)
// =============================================================================

const USER_MINISTRIES_ICCLA: MinistryInfo[] = [
  {
    id: 'min-002',
    name: 'Formation Kids',
    leader: 'Sister Angela Davis',
    description: 'Children ages 3–12 — Bible teaching, worship, and creative learning.',
    color: '#1D9BF0',
    icon: 'heart.circle.fill',
  },
  {
    id: 'min-singles',
    name: 'Single & Purposeful',
    leader: 'Minister Desiree Hamilton',
    description: 'Fellowship, community, and spiritual growth for singles.',
    color: '#F59E0B',
    icon: 'person.2.fill',
  },
];

const USER_MINISTRIES_ICCIE: MinistryInfo[] = [
  {
    id: 'min-002',
    name: 'Formation Kids',
    leader: 'Sister Angela Davis',
    description: 'Children ages 3–12 — Bible teaching, worship, and creative learning.',
    color: '#1D9BF0',
    icon: 'heart.circle.fill',
  },
];

// =============================================================================
// MOCK — MINISTRY EVENTS
// =============================================================================

const FORMATION_KIDS_EVENTS: MinistryEventRow[] = [
  {
    id: 'mev-001',
    ministryId: 'min-002',
    title: "Children's Church — Sunday Session",
    startTime: new Date('2025-03-02T09:30:00'),
    endTime: new Date('2025-03-02T11:30:00'),
    room: "Children's Wing — Room B2",
    type: 'CLASS',
    servingRole: "Children's Teacher",
    isServing: true,
    rsvpEnabled: false,
    description: 'Weekly children\'s church during main service. Ages 3–12.',
  },
  {
    id: 'mev-002',
    ministryId: 'min-002',
    title: 'Volunteer Training — Easter Prep',
    startTime: new Date('2025-03-08T10:00:00'),
    endTime: new Date('2025-03-08T12:00:00'),
    room: "Children's Wing — Room A1",
    type: 'TRAINING',
    servingRole: "Children's Teacher",
    isServing: true,
    rsvpEnabled: true,
    description: 'Easter program training for all Formation Kids volunteers.',
  },
  {
    id: 'mev-003',
    ministryId: 'min-002',
    title: "Children's Church — Sunday Session",
    startTime: new Date('2025-03-09T09:30:00'),
    endTime: new Date('2025-03-09T11:30:00'),
    room: "Children's Wing — Room B2",
    type: 'CLASS',
    servingRole: "Children's Teacher",
    isServing: true,
    rsvpEnabled: false,
    description: 'Weekly children\'s church during main service. Ages 3–12.',
  },
  {
    id: 'mev-004',
    ministryId: 'min-002',
    title: 'Planning Meeting — Spring Curriculum',
    startTime: new Date('2025-03-12T18:30:00'),
    endTime: new Date('2025-03-12T20:00:00'),
    room: "Children's Wing — Room A1",
    type: 'PLANNING',
    isServing: false,
    rsvpEnabled: true,
    description: 'Review Q2 curriculum and plan Easter Sunday program.',
  },
  {
    id: 'mev-005',
    ministryId: 'min-002',
    title: "Children's Church — Sunday Session",
    startTime: new Date('2025-03-16T09:30:00'),
    endTime: new Date('2025-03-16T11:30:00'),
    room: "Children's Wing — Room B2",
    type: 'CLASS',
    servingRole: "Children's Teacher",
    isServing: true,
    rsvpEnabled: false,
    description: 'Weekly children\'s church during main service. Ages 3–12.',
  },
  {
    id: 'mev-006',
    ministryId: 'min-002',
    title: 'Easter Kids Program Rehearsal',
    startTime: new Date('2025-04-12T10:00:00'),
    endTime: new Date('2025-04-12T13:00:00'),
    room: "Children's Wing — All Rooms",
    type: 'TRAINING',
    servingRole: "Children's Teacher",
    isServing: true,
    rsvpEnabled: true,
    description: 'Full dress rehearsal for Easter Sunday children\'s program.',
  },
];

const SINGLES_EVENTS_ICCLA: MinistryEventRow[] = [
  {
    id: 'mev-101',
    ministryId: 'min-singles',
    title: 'Social Mixer — Game Night',
    startTime: new Date('2025-03-07T18:30:00'),
    endTime: new Date('2025-03-07T21:00:00'),
    room: 'Fellowship Hall',
    type: 'SMALL_GROUP',
    isServing: false,
    rsvpEnabled: true,
    description: 'Game night and fellowship. Potluck style — bring a dish to share!',
  },
  {
    id: 'mev-102',
    ministryId: 'min-singles',
    title: 'Bible Study — Walking in Purpose',
    startTime: new Date('2025-03-14T19:00:00'),
    endTime: new Date('2025-03-14T20:30:00'),
    room: 'Conference Room B',
    type: 'SMALL_GROUP',
    isServing: false,
    rsvpEnabled: false,
    description: 'Bi-weekly Bible study for singles ministry members.',
  },
  {
    id: 'mev-103',
    ministryId: 'min-singles',
    title: 'Community Serve Day',
    startTime: new Date('2025-03-22T09:00:00'),
    endTime: new Date('2025-03-22T13:00:00'),
    room: 'West End Community Center',
    type: 'OUTREACH',
    isServing: false,
    rsvpEnabled: true,
    description: 'Singles ministry serve day — feeding program partnership.',
  },
  {
    id: 'mev-104',
    ministryId: 'min-singles',
    title: 'Bible Study — Walking in Purpose',
    startTime: new Date('2025-03-28T19:00:00'),
    endTime: new Date('2025-03-28T20:30:00'),
    room: 'Conference Room B',
    type: 'SMALL_GROUP',
    isServing: false,
    rsvpEnabled: false,
    description: 'Bi-weekly Bible study for singles ministry members.',
  },
];

// =============================================================================
// HELPERS
// =============================================================================

function formatTime(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'p' : 'a';
  const hr = h % 12 || 12;
  return m === 0 ? `${hr}${ampm}` : `${hr}:${String(m).padStart(2, '0')}${ampm}`;
}

function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)}\u2013${formatTime(end)}`;
}

function formatEventDate(d: Date): string {
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

/** Convert MinistryEventRow → ChurchEvent for the detail sheet */
function ministryEventToChurchEvent(ev: MinistryEventRow, ministry: MinistryInfo): ChurchEvent {
  return {
    id: ev.id,
    orgId: 'org-icc',
    campusId: 'campus-kcc',
    campusName: '2819 Church',
    ministryId: ministry.id,
    ministryName: ministry.name,
    title: ev.title,
    description: ev.description || '',
    startTime: ev.startTime,
    endTime: ev.endTime,
    location: ev.room,
    type: 'MINISTRY',
    status: ev.startTime > new Date() ? 'upcoming' : 'completed',
    rsvpEnabled: ev.rsvpEnabled,
    visibilityScope: 'PUBLIC',
    organizer: ministry.leader,
    roleAssignment: ev.isServing && ev.servingRole
      ? {
          role: ev.servingRole,
          room: ev.room.split(' — ')[1] || ev.room,
          checkInTime: formatTime(new Date(ev.startTime.getTime() - 60 * 60 * 1000)),
          coordinator: ministry.leader,
        }
      : undefined,
  };
}

// =============================================================================
// DATA PIPELINE
// =============================================================================

function buildMinistrySections(campus: 'ICCLA' | 'ICCIE'): MinistrySection[] {
  const ministries = campus === 'ICCLA' ? USER_MINISTRIES_ICCLA : USER_MINISTRIES_ICCIE;
  const allEvents: Record<string, MinistryEventRow[]> = {
    'min-002': FORMATION_KIDS_EVENTS,
    'min-singles': campus === 'ICCLA' ? SINGLES_EVENTS_ICCLA : [],
  };

  const sections: MinistrySection[] = [];
  for (const ministry of ministries) {
    const events = (allEvents[ministry.id] || [])
      .filter((e) => e.startTime > new Date('2025-02-20'))
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    if (events.length > 0) {
      sections.push({ ministry, data: events });
    }
  }

  return sections;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ChurchScheduleMinistry({ colors, accent }: Props) {
  const [eventSheetVisible, setEventSheetVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);

  // Demo: active campus is ICCLA
  const campus: 'ICCLA' | 'ICCIE' = 'ICCLA';
  const sections = buildMinistrySections(campus);

  const handleEventTap = useCallback(
    (ev: MinistryEventRow, ministry: MinistryInfo) => {
      Haptics.impactAsync(ImpactFeedbackStyle.Light);
      setSelectedEvent(ministryEventToChurchEvent(ev, ministry));
      setEventSheetVisible(true);
    },
    [],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: MinistrySection }) => (
      <View style={[s.ministryHeader, { backgroundColor: colors.background }]}>
        <View style={s.ministryHeaderRow}>
          <View style={[s.ministryIcon, { backgroundColor: section.ministry.color + '20' }]}>
            <IconSymbol name={section.ministry.icon} size={16} color={section.ministry.color} />
          </View>
          <View style={s.ministryHeaderText}>
            <ThemedText style={[s.ministryName, { color: colors.text }]}>
              {section.ministry.name}
            </ThemedText>
            <ThemedText style={[s.ministryLeader, { color: colors.textSecondary }]}>
              {section.ministry.leader}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={[s.ministryDesc, { color: colors.textSecondary }]}>
          {section.ministry.description}
        </ThemedText>
      </View>
    ),
    [colors],
  );

  const renderItem = useCallback(
    ({ item, section }: { item: MinistryEventRow; section: MinistrySection }) => {
      const typeConf = TYPE_CONFIG[item.type];
      return (
        <Pressable
          style={({ pressed }) => [
            s.eventRow,
            { borderBottomColor: colors.border },
            pressed && { opacity: 0.6, backgroundColor: colors.backgroundSecondary },
          ]}
          onPress={() => handleEventTap(item, section.ministry)}
        >
          {/* Left — Date + Time */}
          <View style={s.timeCol}>
            <ThemedText style={[s.dateText, { color: colors.text }]}>
              {formatEventDate(item.startTime)}
            </ThemedText>
            <ThemedText style={[s.timeText, { color: colors.textSecondary }]}>
              {formatTimeRange(item.startTime, item.endTime)}
            </ThemedText>
          </View>

          {/* Middle — Type chip */}
          <View style={[s.typeChip, { backgroundColor: typeConf.color + '18' }]}>
            <IconSymbol name={typeConf.icon} size={10} color={typeConf.color} />
            <ThemedText style={[s.typeLabel, { color: typeConf.color }]}>
              {typeConf.label}
            </ThemedText>
          </View>

          {/* Right — Title + subline */}
          <View style={s.detailCol}>
            <View style={s.titleRow}>
              <ThemedText style={[s.eventTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </ThemedText>
              {item.isServing && (
                <View style={s.servingBadge}>
                  <ThemedText style={s.servingText}>SERVING</ThemedText>
                </View>
              )}
            </View>
            <ThemedText style={[s.roomText, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.room}
            </ThemedText>
            {item.servingRole && (
              <ThemedText style={[s.roleText, { color: accent }]} numberOfLines={1}>
                {item.servingRole}
              </ThemedText>
            )}
          </View>

          <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
        </Pressable>
      );
    },
    [colors, accent, handleEventTap],
  );

  const keyExtractor = useCallback((item: MinistryEventRow) => item.id, []);

  return (
    <ThemedView style={s.container}>
      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        renderSectionHeader={renderSectionHeader as any}
        renderItem={renderItem as any}
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        ListEmptyComponent={
          <View style={s.empty}>
            <IconSymbol name="heart.fill" size={32} color="#A1A1AA" />
            <ThemedText style={[s.emptyTitle, { color: colors.text }]}>No Ministries</ThemedText>
            <ThemedText style={[s.emptyDesc, { color: colors.textSecondary }]}>
              You are not part of any ministries at this campus.
            </ThemedText>
          </View>
        }
      />

      {/* ── Event Detail Sheet ── */}
      <ChurchEventDetailSheet
        visible={eventSheetVisible}
        onClose={() => setEventSheetVisible(false)}
        event={selectedEvent}
        colors={colors}
        accent={accent}
      />
    </ThemedView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 80 },

  // Ministry section header
  ministryHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  ministryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  ministryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ministryHeaderText: { flex: 1 },
  ministryName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  ministryLeader: {
    fontSize: 11,
    letterSpacing: 0.1,
    marginTop: 1,
  },
  ministryDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },

  // Event row
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },

  // Time column
  timeCol: { width: 82 },
  dateText: { fontSize: 11, fontWeight: '700', letterSpacing: -0.1 },
  timeText: { fontSize: 10, letterSpacing: -0.1, marginTop: 1 },

  // Type chip
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // Detail column
  detailCol: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eventTitle: { fontSize: 13, fontWeight: '700', letterSpacing: -0.2, flex: 1 },
  roomText: { fontSize: 11, letterSpacing: 0.1, marginTop: 2 },
  roleText: { fontSize: 10, fontWeight: '600', letterSpacing: 0.1, marginTop: 1 },

  // Serving badge
  servingBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  servingText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  // Empty state
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptyDesc: { fontSize: 13, textAlign: 'center', marginTop: 6 },
});
