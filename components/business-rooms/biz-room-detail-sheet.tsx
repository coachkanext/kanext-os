/**
 * BizRoomDetailSheet — Structured enterprise room detail.
 *
 * Section 1: Header (name, type, status, visibility, domain, linked event)
 * Section 2: Participants (role + status list)
 * Section 3: Controls (Founder level — all Propose → Validate → Confirm → Commit)
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import {
  ROOM_TYPE_COLORS,
  VISIBILITY_LABELS,
  VISIBILITY_COLORS,
  STATUS_COLORS,
  RECORDING_COLORS,
  formatRoomDateTime,
  type BizRoom,
  type ParticipantStatus,
} from '@/data/mock-business-rooms';

// =============================================================================
// PARTICIPANT STATUS COLORS
// =============================================================================

const PARTICIPANT_STATUS_COLORS: Record<ParticipantStatus, string> = {
  Invited: '#9C9790',
  Accepted: '#5A8A6E',
  Declined: '#B85C5C',
  Attended: '#1A1714',
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface Props {
  room: BizRoom | null;
  visible: boolean;
  onClose: () => void;
  colors: typeof Colors.light;
}

export function BizRoomDetailSheet({ room, visible, onClose, colors }: Props) {
  if (!room) return null;

  const typeColor = ROOM_TYPE_COLORS[room.type];
  const visColor = VISIBILITY_COLORS[room.visibilityClass];
  const visLabel = VISIBILITY_LABELS[room.visibilityClass];
  const statusColor = STATUS_COLORS[room.status];
  const recColor = RECORDING_COLORS[room.recordingStatus];

  const handleAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Room Detail" useModal>
      <View style={s.container}>
        {/* ── SECTION 1: Header ──────────────────────────────────────── */}
        <View style={s.section}>
          <ThemedText style={[s.roomName, { color: colors.text }]}>{room.name}</ThemedText>

          {/* Pills row */}
          <View style={s.pillRow}>
            <View style={[s.pill, { backgroundColor: typeColor + '20' }]}>
              <ThemedText style={[s.pillText, { color: typeColor }]}>{room.type}</ThemedText>
            </View>
            <View style={[s.pill, { backgroundColor: statusColor + '20' }]}>
              <View style={[s.statusDot, { backgroundColor: statusColor }]} />
              <ThemedText style={[s.pillText, { color: statusColor }]}>{room.status}</ThemedText>
            </View>
            <View style={[s.pill, { backgroundColor: visColor + '15', borderColor: visColor + '30', borderWidth: 1 }]}>
              <ThemedText style={[s.pillText, { color: visColor }]}>{visLabel}</ThemedText>
            </View>
          </View>

          {/* Meta grid */}
          <View style={s.metaGrid}>
            <View style={s.metaItem}>
              <ThemedText style={[s.metaLabel, { color: colors.textTertiary }]}>Domain</ThemedText>
              <ThemedText style={[s.metaValue, { color: colors.text }]}>{room.linkedDomain}</ThemedText>
            </View>
            <View style={s.metaItem}>
              <ThemedText style={[s.metaLabel, { color: colors.textTertiary }]}>Scheduled</ThemedText>
              <ThemedText style={[s.metaValue, { color: colors.text }]}>
                {formatRoomDateTime(room.scheduledAt)}
              </ThemedText>
            </View>
            {room.linkedEvent && (
              <View style={s.metaItem}>
                <ThemedText style={[s.metaLabel, { color: colors.textTertiary }]}>Linked Event</ThemedText>
                <ThemedText style={[s.metaValue, { color: colors.text }]}>{room.linkedEvent}</ThemedText>
              </View>
            )}
            {room.linkedDeal && (
              <View style={s.metaItem}>
                <ThemedText style={[s.metaLabel, { color: colors.textTertiary }]}>Linked Deal</ThemedText>
                <ThemedText style={[s.metaValue, { color: colors.text }]}>{room.linkedDeal}</ThemedText>
              </View>
            )}
            {room.linkedObligation && (
              <View style={s.metaItem}>
                <ThemedText style={[s.metaLabel, { color: colors.textTertiary }]}>Linked Obligation</ThemedText>
                <ThemedText style={[s.metaValue, { color: colors.text }]}>{room.linkedObligation}</ThemedText>
              </View>
            )}
            {room.duration && (
              <View style={s.metaItem}>
                <ThemedText style={[s.metaLabel, { color: colors.textTertiary }]}>Duration</ThemedText>
                <ThemedText style={[s.metaValue, { color: colors.text }]}>{room.duration}</ThemedText>
              </View>
            )}
            <View style={s.metaItem}>
              <ThemedText style={[s.metaLabel, { color: colors.textTertiary }]}>Recording</ThemedText>
              <ThemedText style={[s.metaValue, { color: recColor }]}>{room.recordingStatus}</ThemedText>
            </View>
          </View>
        </View>

        <View style={[s.divider, { backgroundColor: colors.border }]} />

        {/* ── SECTION 2: Participants ────────────────────────────────── */}
        <View style={s.section}>
          <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Participants</ThemedText>
          <View style={s.participantList}>
            {room.participants.map((p, i) => {
              const pColor = PARTICIPANT_STATUS_COLORS[p.status];
              return (
                <View key={`${p.role}-${i}`} style={[s.participantRow, { borderBottomColor: colors.border }]}>
                  <View style={[s.participantIcon, { backgroundColor: colors.backgroundTertiary }]}>
                    <ThemedText style={[s.participantInitial, { color: colors.text }]}>
                      {p.role[0]}
                    </ThemedText>
                  </View>
                  <ThemedText style={[s.participantRole, { color: colors.text }]}>{p.role}</ThemedText>
                  <View style={[s.participantStatusPill, { backgroundColor: pColor + '15' }]}>
                    <View style={[s.participantStatusDot, { backgroundColor: pColor }]} />
                    <ThemedText style={[s.participantStatusText, { color: pColor }]}>{p.status}</ThemedText>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[s.divider, { backgroundColor: colors.border }]} />

        {/* ── SECTION 3: Controls (Founder) ──────────────────────────── */}
        <View style={s.section}>
          <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Controls</ThemedText>
          <ThemedText style={[s.confirmNote, { color: colors.textTertiary }]}>
            All actions: Propose → Validate → Confirm → Commit
          </ThemedText>

          <View style={s.controlsGrid}>
            {room.status === 'Scheduled' && (
              <Pressable style={[s.controlBtn, { backgroundColor: '#5A8A6E' + '15' }]} onPress={handleAction}>
                <IconSymbol name="play.fill" size={16} color="#5A8A6E" />
                <ThemedText style={[s.controlBtnText, { color: '#5A8A6E' }]}>Start Room</ThemedText>
              </Pressable>
            )}
            {room.status === 'Live' && (
              <Pressable style={[s.controlBtn, { backgroundColor: '#B85C5C' + '15' }]} onPress={handleAction}>
                <IconSymbol name="stop.fill" size={16} color="#B85C5C" />
                <ThemedText style={[s.controlBtnText, { color: '#B85C5C' }]}>End Room</ThemedText>
              </Pressable>
            )}
            {room.status !== 'Completed' && (
              <>
                <Pressable style={[s.controlBtn, { backgroundColor: colors.backgroundTertiary }]} onPress={handleAction}>
                  <IconSymbol name="eye" size={16} color={colors.text} />
                  <ThemedText style={[s.controlBtnText, { color: colors.text }]}>Change Visibility</ThemedText>
                </Pressable>
                <Pressable style={[s.controlBtn, { backgroundColor: colors.backgroundTertiary }]} onPress={handleAction}>
                  <IconSymbol name="person.badge.plus" size={16} color={colors.text} />
                  <ThemedText style={[s.controlBtnText, { color: colors.text }]}>Invite Role</ThemedText>
                </Pressable>
                <Pressable style={[s.controlBtn, { backgroundColor: colors.backgroundTertiary }]} onPress={handleAction}>
                  <IconSymbol name="link" size={16} color={colors.text} />
                  <ThemedText style={[s.controlBtnText, { color: colors.text }]}>Link to Deal</ThemedText>
                </Pressable>
                <Pressable style={[s.controlBtn, { backgroundColor: colors.backgroundTertiary }]} onPress={handleAction}>
                  <IconSymbol name="doc" size={16} color={colors.text} />
                  <ThemedText style={[s.controlBtnText, { color: colors.text }]}>Link to Obligation</ThemedText>
                </Pressable>
                <Pressable style={[s.controlBtn, { backgroundColor: room.recordingEnabled ? '#5A8A6E15' : colors.backgroundTertiary }]} onPress={handleAction}>
                  <IconSymbol name="record.circle" size={16} color={room.recordingEnabled ? '#5A8A6E' : colors.textTertiary} />
                  <ThemedText style={[s.controlBtnText, { color: room.recordingEnabled ? '#5A8A6E' : colors.textTertiary }]}>
                    Recording {room.recordingEnabled ? 'On' : 'Off'}
                  </ThemedText>
                </Pressable>
              </>
            )}
            {room.status === 'Completed' && (
              <View style={[s.readOnlyBadge, { backgroundColor: colors.backgroundTertiary }]}>
                <IconSymbol name="lock.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.readOnlyText, { color: colors.textTertiary }]}>
                  Room completed — read-only
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingTop: 4,
  },

  // Sections
  section: { paddingVertical: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  divider: { height: StyleSheet.hairlineWidth },

  // Header
  roomName: { fontSize: 18, fontWeight: '800', marginBottom: 10 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 5,
  },
  pillText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },

  // Meta grid
  metaGrid: { gap: 8 },
  metaItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaLabel: { fontSize: 12 },
  metaValue: { fontSize: 12, fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 16 },

  // Participants
  participantList: { gap: 0 },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  participantIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantInitial: { fontSize: 11, fontWeight: '700' },
  participantRole: { fontSize: 13, fontWeight: '500', flex: 1 },
  participantStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  participantStatusDot: { width: 5, height: 5, borderRadius: 2.5 },
  participantStatusText: { fontSize: 10, fontWeight: '700' },

  // Controls
  confirmNote: { fontSize: 11, marginBottom: 10 },
  controlsGrid: { gap: 8 },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    gap: 10,
  },
  controlBtnText: { fontSize: 14, fontWeight: '600' },
  readOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  readOnlyText: { fontSize: 13, fontWeight: '500' },
});
