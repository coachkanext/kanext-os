/**
 * Sports Facilities V3 — A2 (Assistant Coach) Room Directory
 * 3 blocks: Rooms Grid, Equipment Highlights, Issues Placeholder
 * + Room Detail Sheet on tap.
 *
 * Facilities = Physical Space Directory (read-only).
 * No booking. No maintenance. No asset values.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

// =============================================================================
// TYPES
// =============================================================================

type RoomStatus = 'Open' | 'Limited' | 'Closed';

interface Room {
  id: string;
  name: string;
  building: string;
  icon: string;
  status: RoomStatus;
  capacity?: number;
  surface?: string;
  hours?: string;
  usageNotes?: string;
  address?: string;
}

interface EquipmentHighlight {
  id: string;
  name: string;
  icon: string;
}

// =============================================================================
// MOCK DATA
// =============================================================================

const ROOMS: Room[] = [
  {
    id: 'r1', name: 'Arena / Main Gym', building: 'PE Center', icon: 'sportscourt.fill',
    status: 'Open', capacity: 2000, surface: 'Hardwood', hours: '6:00 AM – 10:00 PM',
    usageNotes: 'Home games, team practice, community events',
    address: '1601 N Benton Ave, Helena, MT 59625',
  },
  {
    id: 'r2', name: 'Practice Gym', building: 'PE Center', icon: 'figure.basketball',
    status: 'Open', capacity: 50, surface: 'Hardwood', hours: '6:00 AM – 9:00 PM',
    usageNotes: 'Daily practice, individual workouts, skill sessions',
    address: '1601 N Benton Ave, Helena, MT 59625',
  },
  {
    id: 'r3', name: 'Weight Room', building: 'PE Center', icon: 'dumbbell.fill',
    status: 'Open', capacity: 30, hours: '5:30 AM – 9:00 PM',
    usageNotes: 'Team lifts, individual strength training',
    address: '1601 N Benton Ave, Helena, MT 59625',
  },
  {
    id: 'r4', name: 'Training Room', building: 'PE Center', icon: 'cross.case.fill',
    status: 'Open', capacity: 15, hours: '7:00 AM – 6:00 PM',
    usageNotes: 'Athletic training, treatment, rehab, taping',
    address: '1601 N Benton Ave, Helena, MT 59625',
  },
  {
    id: 'r5', name: 'Film Room', building: 'PE Center', icon: 'play.rectangle.fill',
    status: 'Open', capacity: 25, hours: '8:00 AM – 8:00 PM',
    usageNotes: 'Game film review, scouting prep, team meetings',
    address: '1601 N Benton Ave, Helena, MT 59625',
  },
  {
    id: 'r6', name: 'Locker Room', building: 'PE Center', icon: 'lock.fill',
    status: 'Open', capacity: 40,
    usageNotes: 'Pre/post game, daily use',
    address: '1601 N Benton Ave, Helena, MT 59625',
  },
  {
    id: 'r7', name: 'Coaches Offices', building: 'PE Center', icon: 'person.2.fill',
    status: 'Open', hours: '8:00 AM – 6:00 PM',
    usageNotes: 'Staff offices, recruiting meetings, player meetings',
    address: '1601 N Benton Ave, Helena, MT 59625',
  },
  {
    id: 'r8', name: 'Team Lounge', building: 'PE Center', icon: 'sofa.fill',
    status: 'Open', capacity: 20,
    usageNotes: 'Player lounge, study area, team bonding',
    address: '1601 N Benton Ave, Helena, MT 59625',
  },
  {
    id: 'r9', name: 'Academic Center', building: 'Simperman Hall', icon: 'book.fill',
    status: 'Limited', hours: '8:00 AM – 5:00 PM (shared)',
    usageNotes: 'Tutoring, study hall, academic advising',
    address: '1601 N Benton Ave, Helena, MT 59625',
  },
  {
    id: 'r10', name: 'Equipment Storage', building: 'PE Center', icon: 'shippingbox.fill',
    status: 'Open',
    usageNotes: 'Gear storage, practice equipment, game-day kits',
    address: '1601 N Benton Ave, Helena, MT 59625',
  },
];

const EQUIPMENT_HIGHLIGHTS: EquipmentHighlight[] = [
  { id: 'eq1', name: 'Shooting Machine (Dr. Dish)', icon: 'target' },
  { id: 'eq2', name: 'Cold Tub', icon: 'snowflake' },
  { id: 'eq3', name: 'Film System (Hudl)', icon: 'video.fill' },
  { id: 'eq4', name: 'VertiMax', icon: 'arrow.up.circle.fill' },
  { id: 'eq5', name: 'GPS Tracking System', icon: 'location.fill' },
  { id: 'eq6', name: 'Recovery Pool', icon: 'drop.fill' },
];

const ROOM_STATUS_COLOR: Record<RoomStatus, string> = {
  Open: '#5A8A6E',
  Limited: '#B8943E',
  Closed: '#B85C5C',
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

function SectionHeader({ label, colors }: { label: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
      {label}
    </ThemedText>
  );
}

function StatusChip({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.chip, { backgroundColor: color + '18' }]}>
      <ThemedText style={[s.chipText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// BLOCK 1 — ROOMS GRID
// =============================================================================

function RoomsGrid({ colors, accentColor, search, onSelectRoom }: {
  colors: typeof Colors.light;
  accentColor: string;
  search: string;
  onSelectRoom: (room: Room) => void;
}) {
  const filtered = useMemo(() => {
    if (!search.trim()) return ROOMS;
    const q = search.toLowerCase();
    return ROOMS.filter((r) => r.name.toLowerCase().includes(q));
  }, [search]);

  return (
    <>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: 0 }]}>
        ROOMS · {filtered.length}
      </ThemedText>
      <View style={s.grid}>
        {filtered.map((room) => (
          <Pressable
            key={room.id}
            style={({ pressed }) => [s.roomCard, { backgroundColor: colors.card, borderColor: colors.border }, pressed && { opacity: 0.7 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectRoom(room);
            }}
          >
            <View style={s.roomIconRow}>
              <IconSymbol name={room.icon as any} size={22} color={accentColor} />
              <StatusChip label={room.status} color={ROOM_STATUS_COLOR[room.status]} />
            </View>
            <ThemedText style={[s.roomName, { color: colors.text }]} numberOfLines={2}>{room.name}</ThemedText>
            <ThemedText style={[s.roomBuilding, { color: colors.textSecondary }]} numberOfLines={1}>{room.building}</ThemedText>
          </Pressable>
        ))}
      </View>
      {filtered.length === 0 && (
        <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>No rooms match your search.</ThemedText>
      )}
    </>
  );
}

// =============================================================================
// BLOCK 2 — EQUIPMENT HIGHLIGHTS
// =============================================================================

function EquipmentBlock({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  if (EQUIPMENT_HIGHLIGHTS.length === 0) return null;

  return (
    <>
      <SectionHeader label="EQUIPMENT HIGHLIGHTS" colors={colors} />
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {EQUIPMENT_HIGHLIGHTS.map((item, idx) => (
          <View
            key={item.id}
            style={[
              s.eqRow,
              idx < EQUIPMENT_HIGHLIGHTS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <IconSymbol name={item.icon as any} size={16} color={accentColor} />
            <ThemedText style={[s.eqName, { color: colors.text }]}>{item.name}</ThemedText>
          </View>
        ))}
      </View>
    </>
  );
}

// =============================================================================
// BLOCK 3 — ISSUES / REQUESTS
// =============================================================================

function IssuesBlock({ colors }: { colors: typeof Colors.light }) {
  return (
    <>
      <SectionHeader label="ISSUES / REQUESTS" colors={colors} />
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.issueRow}>
          <IconSymbol name="checkmark.seal.fill" size={16} color="#5A8A6E" />
          <ThemedText style={[s.issueText, { color: colors.textSecondary }]}>No issues logged.</ThemedText>
        </View>
      </View>
    </>
  );
}

// =============================================================================
// ROOM DETAIL SHEET
// =============================================================================

function RoomDetailSheet({ visible, onClose, room, colors, accentColor }: {
  visible: boolean;
  onClose: () => void;
  room: Room | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!room) return null;

  const handleOpenMaps = () => {
    if (!room.address) return;
    const encoded = encodeURIComponent(room.address);
    Linking.openURL(`https://maps.apple.com/?q=${encoded}`);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={room.name} useModal>
      <BottomSheetScrollView contentContainerStyle={s.sheetScroll}>
        {/* Status + Building */}
        <View style={s.sheetHeaderRow}>
          <View style={s.sheetHeaderInfo}>
            <ThemedText style={[s.sheetBuilding, { color: colors.textSecondary }]}>{room.building}</ThemedText>
          </View>
          <StatusChip label={room.status} color={ROOM_STATUS_COLOR[room.status]} />
        </View>

        {/* Details card */}
        <View style={[s.sheetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {room.hours && (
            <View style={s.sheetDetailRow}>
              <IconSymbol name="clock.fill" size={14} color={colors.textTertiary} />
              <View style={s.sheetDetailInfo}>
                <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Hours</ThemedText>
                <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{room.hours}</ThemedText>
              </View>
            </View>
          )}
          {room.capacity && (
            <View style={s.sheetDetailRow}>
              <IconSymbol name="person.2.fill" size={14} color={colors.textTertiary} />
              <View style={s.sheetDetailInfo}>
                <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Capacity</ThemedText>
                <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{room.capacity}</ThemedText>
              </View>
            </View>
          )}
          {room.surface && (
            <View style={s.sheetDetailRow}>
              <IconSymbol name="square.grid.3x3.fill" size={14} color={colors.textTertiary} />
              <View style={s.sheetDetailInfo}>
                <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Surface</ThemedText>
                <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{room.surface}</ThemedText>
              </View>
            </View>
          )}
        </View>

        {/* Usage notes */}
        {room.usageNotes && (
          <>
            <ThemedText style={[s.sheetSectionLabel, { color: colors.textSecondary }]}>USAGE</ThemedText>
            <View style={[s.sheetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.sheetUsage, { color: colors.text }]}>{room.usageNotes}</ThemedText>
            </View>
          </>
        )}

        {/* Open in Maps */}
        {room.address && (
          <Pressable
            style={({ pressed }) => [s.mapsButton, { backgroundColor: accentColor }, pressed && { opacity: 0.7 }]}
            onPress={handleOpenMaps}
          >
            <IconSymbol name="map.fill" size={16} color="#000" />
            <ThemedText style={s.mapsButtonText}>Open in Maps</ThemedText>
          </Pressable>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function SportsFacilities({ colors, accentColor, role }: Props) {
  const [search, setSearch] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const handleSelectRoom = useCallback((room: Room) => {
    setSelectedRoom(room);
    setSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
  }, []);

  return (
    <>
      <ScrollView
        style={s.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Search */}
        <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search rooms..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <RoomsGrid colors={colors} accentColor={accentColor} search={search} onSelectRoom={handleSelectRoom} />
        <EquipmentBlock colors={colors} accentColor={accentColor} />
        <IssuesBlock colors={colors} />
      </ScrollView>

      <RoomDetailSheet
        visible={sheetVisible}
        onClose={handleCloseSheet}
        room={selectedRoom}
        colors={colors}
        accentColor={accentColor}
      />
    </>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.md, paddingTop: 4, paddingBottom: 120 },

  // ── Section Header ──
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 20,
    textTransform: 'uppercase',
  },

  // ── Card ──
  card: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 14,
    marginBottom: 12,
  },

  // ── Status Chip ──
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ── Search ──
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },

  // ── Rooms Grid ──
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  roomCard: {
    width: '47.5%',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 14,
  },
  roomIconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  roomName: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  roomBuilding: {
    fontSize: 11,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },

  // ── Equipment ──
  eqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
  },
  eqName: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },

  // ── Issues ──
  issueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  issueText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // ── Room Detail Sheet ──
  sheetScroll: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetHeaderInfo: {
    flex: 1,
  },
  sheetBuilding: {
    fontSize: 14,
    fontWeight: '500',
  },
  sheetCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 12,
    marginBottom: 16,
  },
  sheetDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  sheetDetailInfo: {
    flex: 1,
  },
  sheetDetailLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  sheetDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 1,
  },
  sheetSectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sheetUsage: {
    fontSize: 13,
    lineHeight: 18,
  },
  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    marginTop: 4,
  },
  mapsButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
});
