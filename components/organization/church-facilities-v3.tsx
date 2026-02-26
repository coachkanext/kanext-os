/**
 * Church Facilities V3 — Where Ministry Happens (Single-Scroll)
 * 5 blocks: Header + Search, Rooms Grid, Ministry Space Mapping,
 *           Facility Status Summary, Issue Reporting
 *
 * Campus-scoped, RBAC-aware.
 * A1 (Member): View rooms, details, upcoming events. No issue logging, no editing.
 * A2 (Teacher): Same as A1 + assigned classroom highlighted, room capacity visible.
 *               No editing authority.
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { isStaffLevel, type ChurchRoleLens } from '@/utils/rbac/church-registry';

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

const ACCENT = MODE_ACCENT.church;

// =============================================================================
// MOCK CONTEXT
// =============================================================================

/** A2 = Teacher in Children's Ministry — can see assigned classroom highlighted */
const MOCK_CHURCH_ROLE: ChurchRoleLens = {
  roleId: 'C7',
  label: "Children's Teacher",
  authority: 'Execution',
  scope: 'Ministry',
  visibility: 'MinistryInternal',
  decision: 'Recommend',
};

const USER_ASSIGNED_ROOM = 'rm3'; // Children's Wing

// =============================================================================
// MOCK DATA
// =============================================================================

type RoomStatus = 'Open' | 'Limited' | 'Closed';

interface Room {
  id: string;
  name: string;
  building: string;
  status: RoomStatus;
  capacity?: number;
  primaryUse: string;
  address?: string;
  upcomingEvents: { title: string; date: string; time: string }[];
}

const ROOMS: Room[] = [
  {
    id: 'rm1', name: 'Sanctuary', building: 'Main Building', status: 'Open',
    capacity: 500, primaryUse: 'Worship Services',
    address: '2819 W 8th St, Los Angeles, CA 90005',
    upcomingEvents: [
      { title: 'Sunday Worship Service', date: 'Mar 2', time: '10:00 AM' },
      { title: 'Sunday Evening Service', date: 'Mar 2', time: '6:00 PM' },
      { title: 'Wednesday Bible Study', date: 'Mar 5', time: '7:00 PM' },
    ],
  },
  {
    id: 'rm2', name: "Children's Wing", building: 'Main Building', status: 'Open',
    capacity: 60, primaryUse: "Children's Ministry Classes",
    upcomingEvents: [
      { title: '2819 Kids Sunday', date: 'Mar 2', time: '10:00 AM' },
      { title: 'Midweek Kids Club', date: 'Mar 5', time: '6:30 PM' },
    ],
  },
  {
    id: 'rm3', name: 'Youth Room', building: 'Annex', status: 'Open',
    capacity: 40, primaryUse: 'Catalyst Youth Ministry',
    upcomingEvents: [
      { title: 'Catalyst Friday', date: 'Feb 28', time: '7:00 PM' },
    ],
  },
  {
    id: 'rm4', name: 'Fellowship Hall', building: 'Main Building', status: 'Open',
    capacity: 200, primaryUse: 'Events & Gatherings',
    upcomingEvents: [
      { title: 'Singles Ministry Mixer', date: 'Mar 1', time: '6:00 PM' },
      { title: 'Connect Group 5', date: 'Mar 1', time: '10:00 AM' },
    ],
  },
  {
    id: 'rm5', name: 'Prayer Room', building: 'Main Building', status: 'Open',
    capacity: 15, primaryUse: 'Prayer & Meditation',
    upcomingEvents: [
      { title: 'Morning Prayer', date: 'Mar 3', time: '6:00 AM' },
    ],
  },
  {
    id: 'rm6', name: 'Pastor Office', building: 'Main Building', status: 'Limited',
    primaryUse: 'Pastoral Meetings',
    upcomingEvents: [],
  },
  {
    id: 'rm7', name: 'Admin Office', building: 'Main Building', status: 'Open',
    primaryUse: 'Church Administration',
    upcomingEvents: [],
  },
  {
    id: 'rm8', name: 'Storage', building: 'Annex', status: 'Open',
    primaryUse: 'Equipment & Supply Storage',
    upcomingEvents: [],
  },
  {
    id: 'rm9', name: 'Lobby', building: 'Main Building', status: 'Open',
    capacity: 80, primaryUse: 'Welcome & Fellowship',
    upcomingEvents: [],
  },
];

interface MinistryMapping {
  ministry: string;
  room: string;
}

const MINISTRY_MAPPINGS: MinistryMapping[] = [
  { ministry: "Children's Ministry", room: "Children's Wing" },
  { ministry: 'Singles Ministry', room: 'Fellowship Hall' },
  { ministry: 'Catalyst Youth', room: 'Youth Room' },
  { ministry: 'Worship Team', room: 'Sanctuary' },
  { ministry: 'Prayer Ministry', room: 'Prayer Room' },
  { ministry: 'Connect Groups', room: 'Fellowship Hall / Classrooms' },
];

type FacilityStatus = 'Operational' | 'Needs Attention' | 'Under Review';

interface StatusItem {
  label: string;
  status: FacilityStatus;
}

const FACILITY_STATUSES: StatusItem[] = [
  { label: 'Overall Facility Status', status: 'Operational' },
  { label: 'Maintenance Status', status: 'Operational' },
  { label: 'Safety Inspection Status', status: 'Operational' },
];

// =============================================================================
// HELPERS
// =============================================================================

function SectionLabel({ label, colors }: { label: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[s.sectionLabel, { color: colors.textSecondary }]}>
      {label}
    </ThemedText>
  );
}

function Card({ colors, children }: { colors: typeof Colors.light; children: React.ReactNode }) {
  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

const ROOM_STATUS_COLOR: Record<RoomStatus, string> = {
  Open: '#22C55E',
  Limited: '#F59E0B',
  Closed: '#EF4444',
};

const FAC_STATUS_COLOR: Record<FacilityStatus, string> = {
  Operational: '#22C55E',
  'Needs Attention': '#F59E0B',
  'Under Review': '#EF4444',
};

function StatusChip({ status, colorMap }: { status: string; colorMap: Record<string, string> }) {
  const color = colorMap[status] ?? '#A1A1AA';
  return (
    <View style={[s.chip, { backgroundColor: color + '18' }]}>
      <ThemedText style={[s.chipText, { color }]}>{status}</ThemedText>
    </View>
  );
}

// =============================================================================
// ROOM DETAIL SHEET
// =============================================================================

function RoomDetailSheet({
  room,
  visible,
  onClose,
  colors,
  isA2,
}: {
  room: Room | null;
  visible: boolean;
  onClose: () => void;
  colors: typeof Colors.light;
  isA2: boolean;
}) {
  if (!room) return null;
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={s.sheetContent}>
        {/* Room Name + Status */}
        <View style={s.sheetHeader}>
          <ThemedText style={[s.sheetTitle, { color: colors.text }]}>{room.name}</ThemedText>
          <StatusChip status={room.status} colorMap={ROOM_STATUS_COLOR} />
        </View>

        {/* Building */}
        <View style={s.sheetRow}>
          <IconSymbol name="building.2.fill" size={14} color={colors.textSecondary} />
          <ThemedText style={[s.sheetMeta, { color: colors.textSecondary }]}>{room.building}</ThemedText>
        </View>

        {/* Address */}
        {room.address && (
          <View style={s.sheetRow}>
            <IconSymbol name="mappin.circle.fill" size={14} color={colors.textSecondary} />
            <ThemedText style={[s.sheetMeta, { color: colors.textSecondary }]}>{room.address}</ThemedText>
          </View>
        )}

        {/* Capacity (A2 sees this) */}
        {isA2 && room.capacity && (
          <View style={s.sheetRow}>
            <IconSymbol name="person.2.fill" size={14} color={colors.textSecondary} />
            <ThemedText style={[s.sheetMeta, { color: colors.textSecondary }]}>Capacity: {room.capacity}</ThemedText>
          </View>
        )}

        {/* Primary Use */}
        <View style={s.sheetRow}>
          <IconSymbol name="tag.fill" size={14} color={colors.textSecondary} />
          <ThemedText style={[s.sheetMeta, { color: colors.textSecondary }]}>{room.primaryUse}</ThemedText>
        </View>

        {/* Upcoming Events */}
        {room.upcomingEvents.length > 0 && (
          <>
            <ThemedText style={[s.sheetSectionLabel, { color: colors.textSecondary }]}>
              UPCOMING EVENTS
            </ThemedText>
            {room.upcomingEvents.slice(0, 3).map((ev, i) => (
              <View key={i} style={[s.eventRow, { borderColor: colors.border }]}>
                <IconSymbol name="calendar" size={13} color={ACCENT} />
                <View style={{ flex: 1 }}>
                  <ThemedText style={[s.eventTitle, { color: colors.text }]}>{ev.title}</ThemedText>
                  <ThemedText style={[s.eventDate, { color: colors.textSecondary }]}>
                    {ev.date} · {ev.time}
                  </ThemedText>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Open in Maps */}
        {room.address && (
          <Pressable
            style={[s.mapsButton, { backgroundColor: ACCENT }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <IconSymbol name="map.fill" size={15} color="#fff" />
            <ThemedText style={s.mapsButtonText}>Open in Maps</ThemedText>
          </Pressable>
        )}
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// ISSUE REPORT SHEET
// =============================================================================

function IssueReportSheet({
  visible,
  onClose,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  colors: typeof Colors.light;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High'>('Medium');

  const urgencies: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];
  const urgencyColor: Record<string, string> = { Low: '#A1A1AA', Medium: '#F59E0B', High: '#EF4444' };

  const handleSubmit = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTitle('');
    setDescription('');
    setSelectedRoom('');
    setUrgency('Medium');
    onClose();
  }, [onClose]);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={s.sheetContent}>
        <ThemedText style={[s.sheetTitle, { color: colors.text }]}>Report Facility Issue</ThemedText>
        <ThemedText style={[s.sheetSubtitle, { color: colors.textSecondary }]}>
          Routes to leadership via Messages → Escalation
        </ThemedText>

        {/* Title */}
        <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>Title</ThemedText>
        <TextInput
          style={[s.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Brief issue title"
          placeholderTextColor={colors.textTertiary}
          value={title}
          onChangeText={setTitle}
        />

        {/* Description */}
        <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>Description</ThemedText>
        <TextInput
          style={[s.textInput, s.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Describe the issue"
          placeholderTextColor={colors.textTertiary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        {/* Room selector */}
        <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>Room</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.roomPillRow}>
          {ROOMS.map((rm) => {
            const sel = selectedRoom === rm.id;
            return (
              <Pressable
                key={rm.id}
                style={[s.roomPill, { backgroundColor: sel ? ACCENT : colors.card, borderColor: sel ? ACCENT : colors.border }]}
                onPress={() => { Haptics.selectionAsync(); setSelectedRoom(rm.id); }}
              >
                <ThemedText style={[s.roomPillText, { color: sel ? '#fff' : colors.text }]}>{rm.name}</ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Urgency */}
        <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>Urgency</ThemedText>
        <View style={s.urgencyRow}>
          {urgencies.map((u) => {
            const sel = urgency === u;
            return (
              <Pressable
                key={u}
                style={[s.urgencyPill, { backgroundColor: sel ? urgencyColor[u] + '25' : colors.card, borderColor: sel ? urgencyColor[u] : colors.border }]}
                onPress={() => { Haptics.selectionAsync(); setUrgency(u); }}
              >
                <ThemedText style={[s.urgencyText, { color: sel ? urgencyColor[u] : colors.textSecondary }]}>{u}</ThemedText>
              </Pressable>
            );
          })}
        </View>

        {/* Submit */}
        <Pressable
          style={[s.submitBtn, { backgroundColor: ACCENT, opacity: title.trim() ? 1 : 0.4 }]}
          onPress={title.trim() ? handleSubmit : undefined}
        >
          <ThemedText style={s.submitText}>Submit Report</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function ChurchFacilities({ colors, accentColor, role }: Props) {
  const churchRole = MOCK_CHURCH_ROLE;
  const isA2 = isStaffLevel(churchRole);

  const [search, setSearch] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [issueVisible, setIssueVisible] = useState(false);

  // Filtered rooms
  const filteredRooms = search.trim()
    ? ROOMS.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.building.toLowerCase().includes(search.toLowerCase()) ||
        r.primaryUse.toLowerCase().includes(search.toLowerCase())
      )
    : ROOMS;

  const openRoom = useCallback((room: Room) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRoom(room);
    setDetailVisible(true);
  }, []);

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* ── Block 0 — Header + Search ─────────────────────────────── */}
        <ThemedText style={[s.title, { color: colors.text }]}>Facilities</ThemedText>

        <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={15} color={colors.textSecondary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search rooms"
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <IconSymbol name="xmark.circle.fill" size={15} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* ── Block 1 — Rooms Grid ──────────────────────────────────── */}
        <SectionLabel label="ROOMS" colors={colors} />

        {filteredRooms.length === 0 ? (
          <Card colors={colors}>
            <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>
              No rooms match "{search}"
            </ThemedText>
          </Card>
        ) : (
          <View style={s.roomsGrid}>
            {filteredRooms.map((room) => {
              const isAssigned = isA2 && room.id === USER_ASSIGNED_ROOM;
              return (
                <Pressable
                  key={room.id}
                  style={[
                    s.roomCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: isAssigned ? ACCENT : colors.border,
                      borderWidth: isAssigned ? 2 : 1,
                    },
                  ]}
                  onPress={() => openRoom(room)}
                >
                  <View style={s.roomCardHeader}>
                    <StatusChip status={room.status} colorMap={ROOM_STATUS_COLOR} />
                  </View>
                  <ThemedText style={[s.roomName, { color: colors.text }]} numberOfLines={1}>
                    {room.name}
                  </ThemedText>
                  <ThemedText style={[s.roomBuilding, { color: colors.textSecondary }]} numberOfLines={1}>
                    {room.building}
                  </ThemedText>
                  {isA2 && room.capacity && (
                    <ThemedText style={[s.roomCapacity, { color: colors.textTertiary }]}>
                      Cap: {room.capacity}
                    </ThemedText>
                  )}
                  {isAssigned && (
                    <View style={[s.assignedBadge, { backgroundColor: ACCENT + '18' }]}>
                      <ThemedText style={[s.assignedText, { color: ACCENT }]}>Assigned</ThemedText>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {/* ── Block 2 — Ministry Space Mapping ──────────────────────── */}
        <SectionLabel label="MINISTRY SPACE MAPPING" colors={colors} />
        <Card colors={colors}>
          {MINISTRY_MAPPINGS.map((m, i) => (
            <View
              key={i}
              style={[
                s.mappingRow,
                i < MINISTRY_MAPPINGS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <ThemedText style={[s.mappingMinistry, { color: colors.text }]}>{m.ministry}</ThemedText>
              <View style={s.mappingArrow}>
                <IconSymbol name="arrow.right" size={11} color={colors.textTertiary} />
              </View>
              <ThemedText style={[s.mappingRoom, { color: colors.textSecondary }]}>{m.room}</ThemedText>
            </View>
          ))}
        </Card>

        {/* ── Block 3 — Facility Status Summary ─────────────────────── */}
        <SectionLabel label="FACILITY STATUS" colors={colors} />
        <Card colors={colors}>
          {FACILITY_STATUSES.map((item, i) => (
            <View
              key={i}
              style={[
                s.statusRow,
                i < FACILITY_STATUSES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <ThemedText style={[s.statusLabel, { color: colors.text }]}>{item.label}</ThemedText>
              <StatusChip status={item.status} colorMap={FAC_STATUS_COLOR} />
            </View>
          ))}
        </Card>

        {/* ── Block 4 — Issue Reporting ──────────────────────────────── */}
        <SectionLabel label="REPORTING" colors={colors} />
        <Pressable
          style={[s.issueBtn, { backgroundColor: ACCENT }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setIssueVisible(true); }}
        >
          <IconSymbol name="exclamationmark.bubble.fill" size={16} color="#fff" />
          <ThemedText style={s.issueBtnText}>Report Facility Issue</ThemedText>
        </Pressable>
        <ThemedText style={[s.issueHint, { color: colors.textTertiary }]}>
          Routes to leadership via Messages → Escalation. No public feed.
        </ThemedText>
      </ScrollView>

      {/* ── Room Detail Sheet ──────────────────────────────────────── */}
      <RoomDetailSheet
        room={selectedRoom}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        colors={colors}
        isA2={isA2}
      />

      {/* ── Issue Report Sheet ─────────────────────────────────────── */}
      <IssueReportSheet
        visible={issueVisible}
        onClose={() => setIssueVisible(false)}
        colors={colors}
      />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.md, paddingBottom: 120 },

  // -- Header --
  title: { fontSize: 22, fontWeight: '800', marginBottom: 12 },

  // -- Search --
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },

  // -- Section --
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 8, marginTop: 20 },

  // -- Card --
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },

  // -- Chip --
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  chipText: { fontSize: 10, fontWeight: '700' },

  // -- Rooms Grid --
  roomsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  roomCard: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
  },
  roomCardHeader: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  roomName: { fontSize: 15, fontWeight: '700' },
  roomBuilding: { fontSize: 11, marginTop: 2 },
  roomCapacity: { fontSize: 10, marginTop: 2 },
  assignedBadge: { marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  assignedText: { fontSize: 9, fontWeight: '700' },

  // -- Ministry Mapping --
  mappingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8 },
  mappingMinistry: { flex: 1, fontSize: 13, fontWeight: '600' },
  mappingArrow: { opacity: 0.4 },
  mappingRoom: { fontSize: 12 },

  // -- Facility Status --
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  statusLabel: { fontSize: 13, fontWeight: '500' },

  // -- Issue Button --
  issueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  issueBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  issueHint: { fontSize: 11, textAlign: 'center', marginTop: 8 },

  // -- Empty --
  emptyText: { fontSize: 13, textAlign: 'center', paddingVertical: 20 },

  // -- Sheet --
  sheetContent: { padding: Spacing.md, paddingBottom: 40 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sheetTitle: { fontSize: 20, fontWeight: '800' },
  sheetSubtitle: { fontSize: 12, marginBottom: 16 },
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sheetMeta: { fontSize: 13 },
  sheetSectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginTop: 16, marginBottom: 8 },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  eventTitle: { fontSize: 13, fontWeight: '600' },
  eventDate: { fontSize: 11 },
  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  mapsButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // -- Issue Sheet --
  fieldLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, marginBottom: 6, marginTop: 12 },
  textInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  textArea: { minHeight: 70, textAlignVertical: 'top' },
  roomPillRow: { marginBottom: 4 },
  roomPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: 1, marginRight: 8 },
  roomPillText: { fontSize: 12, fontWeight: '600' },
  urgencyRow: { flexDirection: 'row', gap: 10 },
  urgencyPill: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  urgencyText: { fontSize: 12, fontWeight: '600' },
  submitBtn: { alignItems: 'center', paddingVertical: 14, borderRadius: 12, marginTop: 20 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
