/**
 * Church Ministry Detail Sheet
 * Bottom sheet for viewing a single ministry's details.
 *
 * Blocks:
 *   Block 0 — Header (name, campus, status chip)
 *   Block 1 — About (description, leader, meeting rhythm)
 *   Block 2 — Upcoming Events (next 3, tap → Event Detail)
 *   Block 3 — Members (role-gated: A2+ only)
 *   Block 4 — Join / Leave
 *
 * Campus-scoped. No inline editing. Writes via Nexus only.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ImpactFeedbackStyle } from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing } from '@/constants/theme';
import type { Ministry } from '@/data/mock-church-home';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  visible: boolean;
  onClose: () => void;
  ministry: Ministry | null;
  colors: typeof Colors.light;
  accent: string;
  /** User's role in this ministry — null if not a member */
  userRole: string | null;
  /** Whether user is a member of this ministry */
  isMember: boolean;
  /** Church role level: 'A1' (member), 'A2' (teacher/leader), 'A3+' (leadership) */
  churchRole: string;
  onEventTap?: (eventId: string) => void;
}

// =============================================================================
// MOCK — UPCOMING EVENTS PER MINISTRY
// =============================================================================

interface MinistryUpcomingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
}

/** Next 3 upcoming events for each ministry (keyed by ministry id) */
const MINISTRY_UPCOMING: Record<string, MinistryUpcomingEvent[]> = {
  'min-002': [
    { id: 'mue-001', title: "Children's Church — Sunday Session", date: 'Sun, Mar 2', time: '9:30 AM', location: "Children's Wing — Room B2" },
    { id: 'mue-002', title: 'Volunteer Training — Easter Prep', date: 'Sat, Mar 8', time: '10:00 AM', location: "Children's Wing — Room A1" },
    { id: 'mue-003', title: "Children's Church — Sunday Session", date: 'Sun, Mar 9', time: '9:30 AM', location: "Children's Wing — Room B2" },
  ],
  'min-singles': [
    { id: 'mue-101', title: 'Social Mixer — Game Night', date: 'Fri, Mar 7', time: '6:30 PM', location: 'Fellowship Hall' },
    { id: 'mue-102', title: 'Bible Study — Walking in Purpose', date: 'Fri, Mar 14', time: '7:00 PM', location: 'Conference Room B' },
    { id: 'mue-103', title: 'Community Serve Day', date: 'Sat, Mar 22', time: '9:00 AM', location: 'West End Community Center' },
  ],
  'min-001': [
    { id: 'mue-201', title: 'Youth Night — Worship & Word', date: 'Fri, Mar 7', time: '6:30 PM', location: 'Youth Auditorium' },
    { id: 'mue-202', title: 'Youth Night — Worship & Word', date: 'Fri, Mar 14', time: '6:30 PM', location: 'Youth Auditorium' },
    { id: 'mue-203', title: 'Youth Outreach — Park Day', date: 'Sat, Mar 15', time: '10:00 AM', location: 'Piedmont Park' },
  ],
  'min-006': [
    { id: 'mue-301', title: 'Worship Team Rehearsal', date: 'Thu, Mar 6', time: '7:00 PM', location: 'Main Sanctuary' },
    { id: 'mue-302', title: 'Worship Team Rehearsal', date: 'Thu, Mar 13', time: '7:00 PM', location: 'Main Sanctuary' },
    { id: 'mue-303', title: 'Worship Night — Special Service', date: 'Fri, Mar 21', time: '7:00 PM', location: 'Main Sanctuary' },
  ],
  'min-008': [
    { id: 'mue-401', title: 'Community Outreach — Feeding Program', date: 'Sat, Mar 8', time: '8:00 AM', location: 'West End Community Center' },
    { id: 'mue-402', title: 'Street Evangelism', date: 'Sat, Mar 22', time: '9:00 AM', location: 'Downtown Atlanta' },
    { id: 'mue-403', title: 'Prison Ministry Visit', date: 'Sat, Mar 29', time: '8:00 AM', location: 'Atlanta City Detention Center' },
  ],
  'min-009': [
    { id: 'mue-501', title: 'Corporate Prayer — Morning Watch', date: 'Tue, Mar 4', time: '6:00 AM', location: 'Prayer Room' },
    { id: 'mue-502', title: 'Corporate Prayer — Morning Watch', date: 'Fri, Mar 7', time: '6:00 AM', location: 'Prayer Room' },
    { id: 'mue-503', title: 'Night of Prayer & Fasting', date: 'Fri, Mar 14', time: '7:00 PM', location: 'Main Sanctuary' },
  ],
};

/** Mock member list for A2+ view */
interface MinistryMember {
  id: string;
  name: string;
  role: string;
  initials: string;
}

const MINISTRY_MEMBERS: Record<string, MinistryMember[]> = {
  'min-002': [
    { id: 'mm-01', name: 'Sister Angela Davis', role: 'Lead Teacher', initials: 'AD' },
    { id: 'mm-02', name: 'You', role: 'Teacher', initials: 'ME' },
    { id: 'mm-03', name: 'Sister Keisha Brown', role: 'Teacher', initials: 'KB' },
    { id: 'mm-04', name: 'Brother Marcus Johnson', role: 'Volunteer', initials: 'MJ' },
    { id: 'mm-05', name: 'Sister Tanya Williams', role: 'Volunteer', initials: 'TW' },
  ],
  'min-singles': [
    { id: 'mm-11', name: 'Minister Desiree Hamilton', role: 'Leader', initials: 'DH' },
    { id: 'mm-12', name: 'You', role: 'Member', initials: 'ME' },
    { id: 'mm-13', name: 'Brother David Chen', role: 'Member', initials: 'DC' },
    { id: 'mm-14', name: 'Sister Amara Okafor', role: 'Member', initials: 'AO' },
  ],
};

// =============================================================================
// CONSTANTS
// =============================================================================

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: '#5A8A6E' },
  seasonal: { label: 'Seasonal', color: '#B8943E' },
  launching: { label: 'Launching', color: '#1A1714' },
};

const CATEGORY_ICONS: Record<string, IconSymbolName> = {
  worship: 'music.note.list',
  youth: 'flame.fill',
  fellowship: 'person.3.fill',
  outreach: 'hand.raised.fill',
  service: 'hands.sparkles.fill',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function ChurchMinistryDetailSheet({
  visible,
  onClose,
  ministry,
  colors,
  accent,
  userRole,
  isMember,
  churchRole,
  onEventTap,
}: Props) {
  const [memberJoined, setMemberJoined] = useState(isMember);

  // Reset joined state when ministry changes
  React.useEffect(() => {
    setMemberJoined(isMember);
  }, [isMember, ministry?.id]);

  if (!ministry) return null;

  const statusConf = STATUS_CONFIG[ministry.status] || STATUS_CONFIG.active;
  const upcomingEvents = MINISTRY_UPCOMING[ministry.id] || [];
  const members = MINISTRY_MEMBERS[ministry.id] || [];
  const canSeeMembers = churchRole === 'A2' || churchRole === 'A3+' || churchRole === 'admin';

  const handleJoinLeave = () => {
    Haptics.impactAsync(ImpactFeedbackStyle.Medium);
    if (memberJoined) {
      Alert.alert(
        'Leave Ministry',
        `Are you sure you want to leave ${ministry.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => setMemberJoined(false),
          },
        ],
      );
    } else {
      Alert.alert(
        'Join Ministry',
        `Would you like to join ${ministry.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Join',
            onPress: () => setMemberJoined(true),
          },
        ],
      );
    }
  };

  const handleEventTap = (eventId: string) => {
    Haptics.impactAsync(ImpactFeedbackStyle.Light);
    onEventTap?.(eventId);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {/* ── Block 0 — Header ── */}
      <View style={s.headerBlock}>
        <View style={[s.ministryIconLg, { backgroundColor: ministry.color + '20' }]}>
          <IconSymbol
            name={(ministry.icon as IconSymbolName) || CATEGORY_ICONS[ministry.category]}
            size={28}
            color={ministry.color}
          />
        </View>
        <ThemedText style={[s.ministryTitle, { color: colors.text }]}>
          {ministry.name}
        </ThemedText>
        <View style={s.headerChips}>
          <View style={[s.statusChip, { backgroundColor: statusConf.color + '18' }]}>
            <ThemedText style={[s.statusText, { color: statusConf.color }]}>
              {statusConf.label}
            </ThemedText>
          </View>
          <View style={[s.campusChip, { backgroundColor: colors.backgroundSecondary }]}>
            <ThemedText style={[s.campusText, { color: colors.textSecondary }]}>
              2819 Church · ICCLA
            </ThemedText>
          </View>
        </View>
        {userRole && (
          <View style={[s.roleBadge, { backgroundColor: accent + '18' }]}>
            <ThemedText style={[s.roleText, { color: accent }]}>
              {userRole}
            </ThemedText>
          </View>
        )}
      </View>

      {/* ── Block 1 — About ── */}
      <View style={[s.block, { borderTopColor: colors.border }]}>
        <ThemedText style={[s.blockTitle, { color: colors.text }]}>About</ThemedText>
        <ThemedText style={[s.description, { color: colors.textSecondary }]}>
          {ministry.mission}
        </ThemedText>

        <View style={s.infoRow}>
          <IconSymbol name="person.fill" size={14} color={colors.textSecondary} />
          <ThemedText style={[s.infoLabel, { color: colors.textSecondary }]}>Leader</ThemedText>
          <ThemedText style={[s.infoValue, { color: colors.text }]}>{ministry.leader}</ThemedText>
        </View>

        {ministry.meetingDay && (
          <View style={s.infoRow}>
            <IconSymbol name="calendar" size={14} color={colors.textSecondary} />
            <ThemedText style={[s.infoLabel, { color: colors.textSecondary }]}>Meets</ThemedText>
            <ThemedText style={[s.infoValue, { color: colors.text }]}>
              {ministry.meetingDay}{ministry.meetingTime ? ` · ${ministry.meetingTime}` : ''}
            </ThemedText>
          </View>
        )}

        <View style={s.infoRow}>
          <IconSymbol name="person.2.fill" size={14} color={colors.textSecondary} />
          <ThemedText style={[s.infoLabel, { color: colors.textSecondary }]}>Volunteers</ThemedText>
          <ThemedText style={[s.infoValue, { color: colors.text }]}>{ministry.volunteers}</ThemedText>
        </View>
      </View>

      {/* ── Block 2 — Upcoming Events ── */}
      <View style={[s.block, { borderTopColor: colors.border }]}>
        <ThemedText style={[s.blockTitle, { color: colors.text }]}>Upcoming Events</ThemedText>
        {upcomingEvents.length === 0 ? (
          <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>
            No upcoming events scheduled.
          </ThemedText>
        ) : (
          upcomingEvents.map((ev) => (
            <Pressable
              key={ev.id}
              style={({ pressed }) => [
                s.eventRow,
                { borderBottomColor: colors.border },
                pressed && { opacity: 0.6, backgroundColor: colors.backgroundSecondary },
              ]}
              onPress={() => handleEventTap(ev.id)}
            >
              <View style={s.eventInfo}>
                <ThemedText style={[s.eventTitle, { color: colors.text }]} numberOfLines={1}>
                  {ev.title}
                </ThemedText>
                <ThemedText style={[s.eventMeta, { color: colors.textSecondary }]}>
                  {ev.date} · {ev.time}
                </ThemedText>
                <ThemedText style={[s.eventLocation, { color: colors.textSecondary }]} numberOfLines={1}>
                  {ev.location}
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
            </Pressable>
          ))
        )}
      </View>

      {/* ── Block 3 — Members (A2+ only) ── */}
      {canSeeMembers && members.length > 0 && (
        <View style={[s.block, { borderTopColor: colors.border }]}>
          <ThemedText style={[s.blockTitle, { color: colors.text }]}>
            Members ({members.length})
          </ThemedText>
          {members.map((m) => (
            <View key={m.id} style={[s.memberRow, { borderBottomColor: colors.border }]}>
              <View style={[s.avatar, { backgroundColor: accent + '20' }]}>
                <ThemedText style={[s.avatarText, { color: accent }]}>{m.initials}</ThemedText>
              </View>
              <View style={s.memberInfo}>
                <ThemedText style={[s.memberName, { color: colors.text }]}>{m.name}</ThemedText>
                <ThemedText style={[s.memberRole, { color: colors.textSecondary }]}>{m.role}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ── Block 4 — Join / Leave ── */}
      <View style={[s.block, { borderTopColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [
            s.joinBtn,
            memberJoined
              ? { backgroundColor: '#B85C5C' + '18' }
              : { backgroundColor: accent },
            pressed && { opacity: 0.7 },
          ]}
          onPress={handleJoinLeave}
        >
          <IconSymbol
            name={memberJoined ? 'xmark.circle.fill' : 'plus.circle.fill'}
            size={16}
            color={memberJoined ? '#B85C5C' : '#000'}
          />
          <ThemedText
            style={[
              s.joinText,
              { color: memberJoined ? '#B85C5C' : '#000' },
            ]}
          >
            {memberJoined ? 'Leave Ministry' : 'Join Ministry'}
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // Header
  headerBlock: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 16,
  },
  ministryIconLg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  ministryTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  headerChips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  campusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  campusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  roleBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Block
  block: {
    paddingTop: 16,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  blockTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 70,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },

  // Events
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  eventInfo: { flex: 1 },
  eventTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  eventMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  eventLocation: {
    fontSize: 11,
    marginTop: 1,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
  },

  // Members
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '700',
  },
  memberInfo: { flex: 1 },
  memberName: {
    fontSize: 13,
    fontWeight: '600',
  },
  memberRole: {
    fontSize: 11,
    marginTop: 1,
  },

  // Join/Leave
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  joinText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
