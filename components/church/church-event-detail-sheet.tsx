/**
 * Church Event Detail Sheet
 * Bottom sheet for viewing a single church event.
 *
 * 7 blocks:
 *   Block 0 — Header (title, campus badge, date/time, status chip)
 *   Block 1 — Event Overview (type, location, description, recurring label, add to calendar)
 *   Block 2 — RSVP (conditional — only when rsvpEnabled)
 *   Block 3 — Your Role (conditional — only when roleAssignment exists)
 *   Block 4 — Attendees (count)
 *   Block 5 — Media (optional)
 *   Block 6 — Actions Row (Message Organizer, Share, Add to Calendar)
 *
 * RSVP uses lightweight Propose → Confirm → Commit pattern (Alert confirmation).
 * No editing controls in v1.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert, Share } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ImpactFeedbackStyle } from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing } from '@/constants/theme';
import type { ChurchEvent, RSVPStatus } from '@/data/mock-church-events';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  visible: boolean;
  onClose: () => void;
  event: ChurchEvent | null;
  colors: typeof Colors.light;
  accent: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const EVENT_TYPE_CONFIG: Record<string, { label: string; color: string; icon: IconSymbolName }> = {
  SERVICE: { label: 'Service', color: '#1A1714', icon: 'play.circle.fill' },
  MINISTRY: { label: 'Ministry', color: '#5A8A6E', icon: 'heart.fill' },
  OUTREACH: { label: 'Outreach', color: '#B8943E', icon: 'hand.raised.fill' },
  OTHER: { label: 'Event', color: '#9C9790', icon: 'calendar' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  upcoming: { label: 'Upcoming', color: '#1A1714' },
  live: { label: 'Live', color: '#B85C5C' },
  completed: { label: 'Completed', color: '#9C9790' },
  cancelled: { label: 'Cancelled', color: '#B85C5C' },
};

const MEDIA_ICON: Record<string, IconSymbolName> = {
  video: 'play.rectangle.fill',
  document: 'doc.text.fill',
  flyer: 'photo.fill',
};

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ChurchEventDetailSheet({ visible, onClose, event, colors, accent }: Props) {
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>(null);

  if (!event) {
    return (
      <BottomSheet visible={false} onClose={onClose} useModal>
        <View />
      </BottomSheet>
    );
  }

  const typeConfig = EVENT_TYPE_CONFIG[event.type] || EVENT_TYPE_CONFIG.OTHER;
  const statusConfig = STATUS_CONFIG[event.status] || STATUS_CONFIG.upcoming;

  // ── RSVP: Propose → Confirm → Commit ──
  const handleRsvp = (status: RSVPStatus) => {
    const label = status === 'GOING' ? 'Going' : status === 'MAYBE' ? 'Maybe' : 'Not Going';
    Alert.alert(`Confirm RSVP: ${label}?`, `You are responding "${label}" for ${event.title}.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setRsvpStatus(status);
        },
      },
    ]);
  };

  const handleShare = async () => {
    Haptics.impactAsync(ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `${event.title}\n${formatDate(event.startTime)}\n${formatTime(event.startTime)} \u2013 ${formatTime(event.endTime)}\n${event.location}\n\n${event.description}`,
      });
    } catch {
      // user cancelled
    }
  };

  const handleAddToCalendar = () => {
    Haptics.impactAsync(ImpactFeedbackStyle.Light);
    Alert.alert('Add to Calendar', 'Calendar integration coming soon.');
  };

  const handleMessageOrganizer = () => {
    Haptics.impactAsync(ImpactFeedbackStyle.Light);
    Alert.alert('Message Organizer', `Opening conversation with ${event.organizer}\u2026`);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      {/* ════════════════════════════════════════════════════════════════════
          BLOCK 0 — HEADER
          ════════════════════════════════════════════════════════════════════ */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <View style={[s.statusChip, { backgroundColor: statusConfig.color + '20' }]}>
            {event.status === 'live' && (
              <View style={[s.liveDot, { backgroundColor: statusConfig.color }]} />
            )}
            <ThemedText style={[s.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </ThemedText>
          </View>
          <View style={[s.campusBadge, { borderColor: accent }]}>
            <ThemedText style={[s.campusBadgeText, { color: accent }]}>
              {event.campusName}
            </ThemedText>
          </View>
        </View>

        <ThemedText style={[s.title, { color: colors.text }]}>{event.title}</ThemedText>

        <View style={s.metaRow}>
          <IconSymbol name="calendar" size={14} color={colors.textSecondary} />
          <ThemedText style={[s.metaText, { color: colors.textSecondary }]}>
            {formatDate(event.startTime)}
          </ThemedText>
        </View>
        <View style={s.metaRow}>
          <IconSymbol name="clock" size={14} color={colors.textSecondary} />
          <ThemedText style={[s.metaText, { color: colors.textSecondary }]}>
            {formatTime(event.startTime)} \u2013 {formatTime(event.endTime)}
          </ThemedText>
        </View>
      </View>

      {/* ════════════════════════════════════════════════════════════════════
          BLOCK 1 — EVENT OVERVIEW
          ════════════════════════════════════════════════════════════════════ */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.overviewHeader}>
          <View style={[s.typeBadge, { backgroundColor: typeConfig.color + '20' }]}>
            <IconSymbol name={typeConfig.icon} size={14} color={typeConfig.color} />
            <ThemedText style={[s.typeText, { color: typeConfig.color }]}>
              {typeConfig.label}
            </ThemedText>
          </View>
        </View>

        <View style={s.metaRow}>
          <IconSymbol name="mappin.and.ellipse" size={14} color={colors.textSecondary} />
          <ThemedText style={[s.metaText, { color: colors.textSecondary }]}>
            {event.location}
          </ThemedText>
        </View>

        <ThemedText style={[s.description, { color: colors.textSecondary }]}>
          {event.description}
        </ThemedText>

        {event.isRecurring && event.seriesLabel && (
          <View style={[s.seriesBadge, { backgroundColor: accent + '15' }]}>
            <IconSymbol name="arrow.triangle.2.circlepath" size={12} color={accent} />
            <ThemedText style={[s.seriesText, { color: accent }]}>{event.seriesLabel}</ThemedText>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            s.calendarBtn,
            { backgroundColor: colors.backgroundSecondary },
            pressed && { opacity: 0.7 },
          ]}
          onPress={handleAddToCalendar}
        >
          <IconSymbol name="calendar.badge.plus" size={16} color={accent} />
          <ThemedText style={[s.calendarBtnText, { color: accent }]}>Add to Calendar</ThemedText>
        </Pressable>
      </View>

      {/* ════════════════════════════════════════════════════════════════════
          BLOCK 2 — RSVP (Conditional)
          ════════════════════════════════════════════════════════════════════ */}
      {event.rsvpEnabled && (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.sectionTitle, { color: colors.text }]}>RSVP</ThemedText>

          {rsvpStatus && (
            <View
              style={[
                s.rsvpCurrentStatus,
                {
                  backgroundColor:
                    rsvpStatus === 'GOING'
                      ? '#5A8A6E15'
                      : rsvpStatus === 'MAYBE'
                        ? '#B8943E15'
                        : '#B85C5C15',
                },
              ]}
            >
              <ThemedText
                style={[
                  s.rsvpCurrentText,
                  {
                    color:
                      rsvpStatus === 'GOING'
                        ? '#5A8A6E'
                        : rsvpStatus === 'MAYBE'
                          ? '#B8943E'
                          : '#B85C5C',
                  },
                ]}
              >
                {rsvpStatus === 'GOING'
                  ? "You're Going!"
                  : rsvpStatus === 'MAYBE'
                    ? 'Marked as Maybe'
                    : 'Not Going'}
              </ThemedText>
            </View>
          )}

          <View style={s.rsvpRow}>
            <Pressable
              style={({ pressed }) => [
                s.rsvpBtn,
                {
                  backgroundColor:
                    rsvpStatus === 'GOING' ? '#5A8A6E' : colors.backgroundSecondary,
                },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => handleRsvp('GOING')}
            >
              <IconSymbol
                name="checkmark.circle.fill"
                size={16}
                color={rsvpStatus === 'GOING' ? '#fff' : '#5A8A6E'}
              />
              <ThemedText
                style={[
                  s.rsvpBtnText,
                  { color: rsvpStatus === 'GOING' ? '#fff' : colors.text },
                ]}
              >
                Going
              </ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                s.rsvpBtn,
                {
                  backgroundColor:
                    rsvpStatus === 'MAYBE' ? '#B8943E' : colors.backgroundSecondary,
                },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => handleRsvp('MAYBE')}
            >
              <IconSymbol
                name="questionmark.circle.fill"
                size={16}
                color={rsvpStatus === 'MAYBE' ? '#fff' : '#B8943E'}
              />
              <ThemedText
                style={[
                  s.rsvpBtnText,
                  { color: rsvpStatus === 'MAYBE' ? '#fff' : colors.text },
                ]}
              >
                Maybe
              </ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                s.rsvpBtn,
                {
                  backgroundColor:
                    rsvpStatus === 'NOT_GOING' ? '#B85C5C' : colors.backgroundSecondary,
                },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => handleRsvp('NOT_GOING')}
            >
              <IconSymbol
                name="xmark.circle.fill"
                size={16}
                color={rsvpStatus === 'NOT_GOING' ? '#fff' : '#B85C5C'}
              />
              <ThemedText
                style={[
                  s.rsvpBtnText,
                  { color: rsvpStatus === 'NOT_GOING' ? '#fff' : colors.text },
                ]}
              >
                Not Going
              </ThemedText>
            </Pressable>
          </View>
        </View>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          BLOCK 3 — YOUR ROLE (Conditional)
          ════════════════════════════════════════════════════════════════════ */}
      {event.roleAssignment && (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Your Role</ThemedText>

          <View style={s.roleGrid}>
            <View style={s.roleItem}>
              <IconSymbol name="person.fill" size={14} color={accent} />
              <ThemedText style={[s.roleLabel, { color: colors.textSecondary }]}>Role</ThemedText>
              <ThemedText style={[s.roleValue, { color: colors.text }]}>
                {event.roleAssignment.role}
              </ThemedText>
            </View>
            <View style={s.roleItem}>
              <IconSymbol name="door.left.hand.open" size={14} color={accent} />
              <ThemedText style={[s.roleLabel, { color: colors.textSecondary }]}>Room</ThemedText>
              <ThemedText style={[s.roleValue, { color: colors.text }]}>
                {event.roleAssignment.room}
              </ThemedText>
            </View>
            <View style={s.roleItem}>
              <IconSymbol name="clock.fill" size={14} color={accent} />
              <ThemedText style={[s.roleLabel, { color: colors.textSecondary }]}>
                Check-in
              </ThemedText>
              <ThemedText style={[s.roleValue, { color: colors.text }]}>
                {event.roleAssignment.checkInTime}
              </ThemedText>
            </View>
            <View style={s.roleItem}>
              <IconSymbol name="person.crop.circle" size={14} color={accent} />
              <ThemedText style={[s.roleLabel, { color: colors.textSecondary }]}>
                Coordinator
              </ThemedText>
              <ThemedText style={[s.roleValue, { color: colors.text }]}>
                {event.roleAssignment.coordinator}
              </ThemedText>
            </View>
          </View>
        </View>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          BLOCK 4 — ATTENDEES
          ════════════════════════════════════════════════════════════════════ */}
      {event.attendeeCount != null && event.attendeeCount > 0 && (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.attendeeRow}>
            <IconSymbol name="person.2.fill" size={18} color={accent} />
            <ThemedText style={[s.attendeeText, { color: colors.text }]}>
              {event.attendeeCount} attending
            </ThemedText>
          </View>
        </View>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          BLOCK 5 — MEDIA (Optional)
          ════════════════════════════════════════════════════════════════════ */}
      {event.mediaItems && event.mediaItems.length > 0 && (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Media</ThemedText>

          {event.mediaItems.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                s.mediaItem,
                { backgroundColor: colors.backgroundSecondary },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => Haptics.impactAsync(ImpactFeedbackStyle.Light)}
            >
              <IconSymbol
                name={MEDIA_ICON[item.type] || 'doc.fill'}
                size={18}
                color={accent}
              />
              <ThemedText style={[s.mediaTitle, { color: colors.text }]}>{item.title}</ThemedText>
              <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
            </Pressable>
          ))}
        </View>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          BLOCK 6 — ACTIONS ROW
          ════════════════════════════════════════════════════════════════════ */}
      <View style={s.actionsRow}>
        <Pressable
          style={({ pressed }) => [
            s.actionBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
          onPress={handleMessageOrganizer}
        >
          <IconSymbol name="bubble.left.fill" size={18} color={accent} />
          <ThemedText style={[s.actionLabel, { color: colors.text }]}>Message</ThemedText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            s.actionBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
          onPress={handleShare}
        >
          <IconSymbol name="square.and.arrow.up" size={18} color={accent} />
          <ThemedText style={[s.actionLabel, { color: colors.text }]}>Share</ThemedText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            s.actionBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
          onPress={handleAddToCalendar}
        >
          <IconSymbol name="calendar.badge.plus" size={18} color={accent} />
          <ThemedText style={[s.actionLabel, { color: colors.text }]}>Calendar</ThemedText>
        </Pressable>
      </View>

      <View style={{ height: 20 }} />
    </BottomSheet>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // Header
  header: { marginBottom: 16 },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  campusBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  campusBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5, marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  metaText: { fontSize: 13 },

  // Card
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 12,
  },

  // Overview
  overviewHeader: { marginBottom: 10 },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  typeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  description: { fontSize: 14, lineHeight: 20, marginTop: 10, marginBottom: 12 },
  seriesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  seriesText: { fontSize: 11, fontWeight: '600' },
  calendarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  calendarBtnText: { fontSize: 13, fontWeight: '700' },

  // RSVP
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  rsvpCurrentStatus: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  rsvpCurrentText: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  rsvpRow: { flexDirection: 'row', gap: 8 },
  rsvpBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  rsvpBtnText: { fontSize: 13, fontWeight: '700' },

  // Role
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  roleItem: { width: '50%', paddingVertical: 6, paddingRight: 8 },
  roleLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  roleValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },

  // Attendees
  attendeeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  attendeeText: { fontSize: 15, fontWeight: '700' },

  // Media
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  mediaTitle: { fontSize: 14, fontWeight: '600', flex: 1 },

  // Actions
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: { fontSize: 12, fontWeight: '700' },
});
