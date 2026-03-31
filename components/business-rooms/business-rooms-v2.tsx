/**
 * BusinessRoomsV2 — Enterprise Session Infrastructure
 *
 * Single vertical scroll. Three sections only:
 * 1. Active — Live rooms (large horizontal cards)
 * 2. Upcoming — Scheduled rooms (row list)
 * 3. Past — Completed rooms (row list with recording status)
 *
 * Tap → Room Detail Sheet
 * No grid. No infinite scroll. No social streaming.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getRoomsByStatus,
  formatRoomDate,
  formatRoomTime,
  formatRoomDateTime,
  ROOM_TYPE_COLORS,
  VISIBILITY_LABELS,
  VISIBILITY_COLORS,
  STATUS_COLORS,
  RECORDING_COLORS,
  type BizRoom,
} from '@/data/mock-business-rooms';
import { BizRoomDetailSheet } from '@/components/business-rooms/biz-room-detail-sheet';

// =============================================================================
// SECTION HEADER
// =============================================================================

function SectionHeader({
  title,
  count,
  colors,
}: {
  title: string;
  count: number;
  colors: typeof Colors.light;
}) {
  return (
    <View style={s.sectionHeader}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>{title}</ThemedText>
      <View style={[s.countBadge, { backgroundColor: colors.backgroundTertiary }]}>
        <ThemedText style={[s.countText, { color: colors.textSecondary }]}>{count}</ThemedText>
      </View>
    </View>
  );
}

// =============================================================================
// ACTIVE ROOM CARD (Large horizontal card)
// =============================================================================

function ActiveRoomCard({
  room,
  colors,
  onPress,
}: {
  room: BizRoom;
  colors: typeof Colors.light;
  onPress: () => void;
}) {
  const typeColor = ROOM_TYPE_COLORS[room.type];
  const visColor = VISIBILITY_COLORS[room.visibilityClass];
  const visLabel = VISIBILITY_LABELS[room.visibilityClass];

  return (
    <Pressable
      style={[s.activeCard, { backgroundColor: room.thumbnailColor }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
    >
      {/* LIVE badge */}
      <View style={s.liveBadge}>
        <View style={s.liveDot} />
        <ThemedText style={s.liveText}>LIVE</ThemedText>
      </View>

      {/* Room info */}
      <View style={s.activeInfo}>
        <ThemedText style={s.activeRoomName} numberOfLines={2}>{room.name}</ThemedText>
        <View style={s.activePillRow}>
          <View style={[s.activePill, { backgroundColor: typeColor }]}>
            <ThemedText style={s.activePillText}>{room.type}</ThemedText>
          </View>
          <View style={[s.activePill, { backgroundColor: visColor + '30', borderColor: visColor + '50', borderWidth: 1 }]}>
            <ThemedText style={[s.activePillText, { color: visColor }]}>{visLabel}</ThemedText>
          </View>
        </View>
        <ThemedText style={s.activeTime}>
          Started {formatRoomTime(room.startedAt ?? room.scheduledAt)}
        </ThemedText>
        {room.recordingEnabled && (
          <View style={s.recordingIndicator}>
            <View style={s.recordingDot} />
            <ThemedText style={s.recordingText}>Recording</ThemedText>
          </View>
        )}
      </View>

      {/* Enter button */}
      <View style={s.enterBtn}>
        <ThemedText style={s.enterBtnText}>Enter</ThemedText>
        <IconSymbol name="arrow.right" size={12} color="#000" />
      </View>
    </Pressable>
  );
}

// =============================================================================
// UPCOMING ROOM ROW
// =============================================================================

function UpcomingRoomRow({
  room,
  colors,
  onPress,
}: {
  room: BizRoom;
  colors: typeof Colors.light;
  onPress: () => void;
}) {
  const typeColor = ROOM_TYPE_COLORS[room.type];
  const visColor = VISIBILITY_COLORS[room.visibilityClass];
  const visLabel = VISIBILITY_LABELS[room.visibilityClass];

  return (
    <Pressable
      style={[s.upcomingRow, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={[s.upcomingStrip, { backgroundColor: typeColor }]} />
      <View style={s.upcomingContent}>
        <View style={s.upcomingTop}>
          <ThemedText style={[s.upcomingName, { color: colors.text }]} numberOfLines={1}>
            {room.name}
          </ThemedText>
          <View style={[s.upcomingTypePill, { backgroundColor: typeColor + '15' }]}>
            <ThemedText style={[s.upcomingTypePillText, { color: typeColor }]}>{room.type}</ThemedText>
          </View>
        </View>
        <View style={s.upcomingMeta}>
          <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
          <ThemedText style={[s.upcomingMetaText, { color: colors.textSecondary }]}>
            {formatRoomDateTime(room.scheduledAt)}
          </ThemedText>
        </View>
        <View style={s.upcomingBottom}>
          <View style={[s.visPill, { backgroundColor: visColor + '15' }]}>
            <ThemedText style={[s.visPillText, { color: visColor }]}>{visLabel}</ThemedText>
          </View>
          {room.linkedEvent && (
            <View style={s.linkedEventRow}>
              <IconSymbol name="link" size={10} color={colors.textTertiary} />
              <ThemedText style={[s.linkedEventText, { color: colors.textTertiary }]}>
                {room.linkedEvent}
              </ThemedText>
            </View>
          )}
          {room.linkedDeal && (
            <View style={s.linkedEventRow}>
              <IconSymbol name="link" size={10} color={colors.textTertiary} />
              <ThemedText style={[s.linkedEventText, { color: colors.textTertiary }]}>
                {room.linkedDeal}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
      <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
    </Pressable>
  );
}

// =============================================================================
// PAST ROOM ROW
// =============================================================================

function PastRoomRow({
  room,
  colors,
  onPress,
}: {
  room: BizRoom;
  colors: typeof Colors.light;
  onPress: () => void;
}) {
  const typeColor = ROOM_TYPE_COLORS[room.type];
  const visColor = VISIBILITY_COLORS[room.visibilityClass];
  const visLabel = VISIBILITY_LABELS[room.visibilityClass];
  const recColor = RECORDING_COLORS[room.recordingStatus];
  const hasRecording = room.recordingStatus === 'Recorded';

  return (
    <Pressable
      style={[s.pastRow, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={s.pastContent}>
        <View style={s.pastTop}>
          <ThemedText style={[s.pastName, { color: colors.text }]} numberOfLines={1}>
            {room.name}
          </ThemedText>
        </View>
        <View style={s.pastMeta}>
          <ThemedText style={[s.pastMetaText, { color: colors.textTertiary }]}>
            {formatRoomDate(room.scheduledAt)}
          </ThemedText>
          {room.duration && (
            <>
              <View style={s.pastMetaDot} />
              <ThemedText style={[s.pastMetaText, { color: colors.textTertiary }]}>
                {room.duration}
              </ThemedText>
            </>
          )}
        </View>
        <View style={s.pastBottom}>
          <View style={[s.visPill, { backgroundColor: visColor + '15' }]}>
            <ThemedText style={[s.visPillText, { color: visColor }]}>{visLabel}</ThemedText>
          </View>
          <View style={[s.visPill, { backgroundColor: recColor + '15' }]}>
            <View style={[s.recDot, { backgroundColor: recColor }]} />
            <ThemedText style={[s.visPillText, { color: recColor }]}>
              {room.recordingStatus}
            </ThemedText>
          </View>
        </View>
      </View>
      {hasRecording ? (
        <IconSymbol name="play.circle.fill" size={20} color={colors.textSecondary} />
      ) : (
        <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
      )}
    </Pressable>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BusinessRoomsV2() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [selectedRoom, setSelectedRoom] = useState<BizRoom | null>(null);

  const activeRooms = useMemo(() => getRoomsByStatus('Live'), []);
  const upcomingRooms = useMemo(() => getRoomsByStatus('Scheduled'), []);
  const pastRooms = useMemo(() => getRoomsByStatus('Completed'), []);

  const handleRoomPress = useCallback((room: BizRoom) => {
    setSelectedRoom(room);
  }, []);

  return (
    <View style={s.container}>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── SECTION 1: Active Rooms ─────────────────────────────── */}
        {activeRooms.length > 0 && (
          <View style={s.sectionBlock}>
            <SectionHeader title="Active" count={activeRooms.length} colors={colors} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.activeScroll}
            >
              {activeRooms.map((room) => (
                <ActiveRoomCard
                  key={room.id}
                  room={room}
                  colors={colors}
                  onPress={() => handleRoomPress(room)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── SECTION 2: Upcoming ─────────────────────────────────── */}
        <View style={s.sectionBlock}>
          <SectionHeader title="Upcoming" count={upcomingRooms.length} colors={colors} />
          {upcomingRooms.length === 0 ? (
            <View style={s.emptySection}>
              <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>
                No scheduled rooms.
              </ThemedText>
            </View>
          ) : (
            <View style={s.rowList}>
              {upcomingRooms.map((room) => (
                <UpcomingRoomRow
                  key={room.id}
                  room={room}
                  colors={colors}
                  onPress={() => handleRoomPress(room)}
                />
              ))}
            </View>
          )}
        </View>

        {/* ── SECTION 3: Past ─────────────────────────────────────── */}
        <View style={s.sectionBlock}>
          <SectionHeader title="Past" count={pastRooms.length} colors={colors} />
          {pastRooms.length === 0 ? (
            <View style={s.emptySection}>
              <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>
                No past rooms.
              </ThemedText>
            </View>
          ) : (
            <View style={s.rowList}>
              {pastRooms.map((room) => (
                <PastRoomRow
                  key={room.id}
                  room={room}
                  colors={colors}
                  onPress={() => handleRoomPress(room)}
                />
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Room Detail Sheet ─────────────────────────────────────── */}
      <BizRoomDetailSheet
        room={selectedRoom}
        visible={selectedRoom !== null}
        onClose={() => setSelectedRoom(null)}
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
  scrollContent: { paddingTop: 4 },

  // Sections
  sectionBlock: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: { fontSize: 11, fontWeight: '700' },

  // Active cards (large horizontal)
  activeScroll: { paddingHorizontal: Spacing.md, gap: 12 },
  activeCard: {
    width: 280,
    borderRadius: BorderRadius.lg,
    padding: 16,
    justifyContent: 'space-between',
    minHeight: 160,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#B85C5C20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 5,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#B85C5C' },
  liveText: { fontSize: 10, fontWeight: '800', color: '#B85C5C', letterSpacing: 0.8 },
  activeInfo: { marginTop: 12, gap: 6 },
  activeRoomName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  activePillRow: { flexDirection: 'row', gap: 6 },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  activePillText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  activeTime: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  recordingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  recordingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#B85C5C' },
  recordingText: { fontSize: 10, fontWeight: '600', color: '#B85C5C' },
  enterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    gap: 6,
    marginTop: 8,
  },
  enterBtnText: { fontSize: 12, fontWeight: '700', color: '#000' },

  // Upcoming rows
  rowList: { paddingHorizontal: Spacing.md, gap: 8 },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    paddingRight: 14,
  },
  upcomingStrip: { width: 4, alignSelf: 'stretch' },
  upcomingContent: { flex: 1, paddingVertical: 12, paddingHorizontal: 12, gap: 5 },
  upcomingTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  upcomingName: { fontSize: 14, fontWeight: '600', flex: 1 },
  upcomingTypePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  upcomingTypePillText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  upcomingMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  upcomingMetaText: { fontSize: 12 },
  upcomingBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  visPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  visPillText: { fontSize: 9, fontWeight: '700' },
  linkedEventRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  linkedEventText: { fontSize: 10 },

  // Past rows
  pastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 12,
    paddingRight: 14,
    gap: 10,
  },
  pastContent: { flex: 1, gap: 4 },
  pastTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pastName: { fontSize: 14, fontWeight: '600', flex: 1 },
  pastMeta: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  pastMetaText: { fontSize: 11 },
  pastMetaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#52525B', marginHorizontal: 6 },
  pastBottom: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  recDot: { width: 5, height: 5, borderRadius: 2.5 },

  // Empty
  emptySection: { paddingHorizontal: Spacing.md, paddingVertical: 20, alignItems: 'center' },
  emptyText: { fontSize: 13 },
});
