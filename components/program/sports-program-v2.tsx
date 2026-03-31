/**
 * Sports Program V2 — Full Program Section
 * Pill tabs: Overview, People, Teams, Seasons, Permissions, Audit, Settings
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ModeColors } from '@/constants/theme'
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

import {
  PROGRAM_IDENTITY,
  PROGRAM_SNAPSHOT,
  QUICK_ACTIONS,
  TODAY_NEXT,
  PROGRAM_HEALTH,
  PINNED_INTEL,
  STAFF_MEMBERS,
  ATHLETE_MEMBERS,
  PROGRAM_TEAMS,
  PROGRAM_SEASONS,
  PERMISSION_ROLES,
  AUDIT_LOG,
  AUDIT_ACTION_META,
  ROSTER_AVAILABILITY,
  PROGRAM_SYSTEMS,
  UPCOMING_GAMES,
  OPS_PULSE,
  FINANCE_PULSE,
  COMPLIANCE_PULSE,
  PROGRAM_ROOMS,
  PROGRAM_SETTINGS,
  type StaffMember,
  type AthleteMember,
  type ProgramSeason,
  type AuditEntry,
} from '@/data/mock-program-v2';

const PILLS = ['Overview', 'People', 'Teams', 'Seasons', 'Permissions', 'Audit', 'Settings'] as const;
type PillTab = (typeof PILLS)[number];

export function SportsProgramV2() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const [activeTab, setActiveTab] = useState<PillTab>('Overview');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillBar}>
        {PILLS.map((pill) => (
          <Pressable key={pill} style={[styles.pill, activeTab === pill && { backgroundColor: accent }]} onPress={() => setActiveTab(pill)}>
            <ThemedText style={[styles.pillText, { color: activeTab === pill ? '#fff' : colors.textSecondary }]}>{pill}</ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {activeTab === 'Overview' && <OverviewView colors={colors} accent={accent} />}
      {activeTab === 'People' && <PeopleView colors={colors} accent={accent} />}
      {activeTab === 'Teams' && <TeamsView colors={colors} accent={accent} />}
      {activeTab === 'Seasons' && <SeasonsView colors={colors} accent={accent} />}
      {activeTab === 'Permissions' && <PermissionsView colors={colors} accent={accent} />}
      {activeTab === 'Audit' && <AuditView colors={colors} accent={accent} />}
      {activeTab === 'Settings' && <SettingsView colors={colors} accent={accent} />}
    </View>
  );
}

function OverviewView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  const id = PROGRAM_IDENTITY;
  const snap = PROGRAM_SNAPSHOT;
  const health = PROGRAM_HEALTH;
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Identity */}
      <View style={[styles.idCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.idName, { color: colors.text }]}>{id.name}</ThemedText>
        <ThemedText style={[styles.idMeta, { color: colors.textSecondary }]}>{id.level} · {id.conference} · {id.location}</ThemedText>
        <View style={styles.snapRow}>
          <SnapChip label="Teams" value={String(snap.teamsCount)} color={accent} colors={colors} />
          <SnapChip label="Roster" value={String(snap.rosterTotal)} color={accent} colors={colors} />
          <SnapChip label="Staff" value={String(snap.staffCount)} color={accent} colors={colors} />
        </View>
      </View>

      {/* Systems */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>SYSTEMS</ThemedText>
      <View style={[styles.systemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.systemRow}>
          <ThemedText style={[styles.sysLabel, { color: colors.textSecondary }]}>Offense</ThemedText>
          <ThemedText style={[styles.sysValue, { color: colors.text }]}>{PROGRAM_SYSTEMS.offenseSystem}</ThemedText>
        </View>
        <View style={styles.systemRow}>
          <ThemedText style={[styles.sysLabel, { color: colors.textSecondary }]}>Defense</ThemedText>
          <ThemedText style={[styles.sysValue, { color: colors.text }]}>{PROGRAM_SYSTEMS.defenseSystem}</ThemedText>
        </View>
        <ThemedText style={[styles.sysNote, { color: colors.textSecondary }]}>{PROGRAM_SYSTEMS.notes}</ThemedText>
      </View>

      {/* Health */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>PROGRAM HEALTH</ThemedText>
      <View style={styles.healthRow}>
        <SnapChip label="Availability" value={`${health.availability}%`} color="#5A8A6E" colors={colors} />
        <SnapChip label="Compliance" value={health.compliance} color={health.compliance === 'compliant' ? '#5A8A6E' : '#B85C5C'} colors={colors} />
        <SnapChip label="Rotation" value={`${health.rotationStability}%`} color="#B8943E" colors={colors} />
      </View>

      {/* Roster Availability */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>ROSTER AVAILABILITY</ThemedText>
      <View style={styles.healthRow}>
        <SnapChip label="Available" value={String(ROSTER_AVAILABILITY.available)} color="#5A8A6E" colors={colors} />
        <SnapChip label="Injured" value={String(ROSTER_AVAILABILITY.injured)} color="#B85C5C" colors={colors} />
        <SnapChip label="Redshirt" value={String(ROSTER_AVAILABILITY.redshirt)} color="#9C9790" colors={colors} />
      </View>

      {/* Today/Next */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>TODAY & NEXT</ThemedText>
      <View style={[styles.todayCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.todayItem, { color: colors.text }]}>Next Event: {TODAY_NEXT.nextEvent} · {TODAY_NEXT.nextEventTime}</ThemedText>
        <ThemedText style={[styles.todayItem, { color: colors.text }]}>Next Game: {TODAY_NEXT.nextGame} · {TODAY_NEXT.nextGameDate}</ThemedText>
        <ThemedText style={[styles.todayItem, { color: colors.textSecondary }]}>Last Result: {TODAY_NEXT.lastResult}</ThemedText>
      </View>

      {/* Upcoming Games */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>UPCOMING SCHEDULE</ThemedText>
      {UPCOMING_GAMES.map((g) => (
        <View key={g.id} style={[styles.gameRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.gameOpponent, { color: colors.text }]}>{g.location === 'Home' ? 'vs' : '@'} {g.opponent}</ThemedText>
          <ThemedText style={[styles.gameMeta, { color: colors.textSecondary }]}>{g.date} · {g.time}</ThemedText>
        </View>
      ))}

      {/* Pinned Intel */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>PINNED INTELLIGENCE</ThemedText>
      {PINNED_INTEL.map((pin) => (
        <View key={pin.id} style={[styles.pinRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name={pin.type === 'sim' ? 'wand.and.stars' : pin.type === 'game-plan' ? 'doc.text.fill' : 'arrow.up.right' as any} size={14} color={accent} />
          <ThemedText style={[styles.pinTitle, { color: colors.text }]}>{pin.title}</ThemedText>
          <ThemedText style={[styles.pinDate, { color: colors.textSecondary }]}>{pin.date}</ThemedText>
        </View>
      ))}

      {/* Quick Rooms */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>ROOMS</ThemedText>
      <View style={styles.roomsRow}>
        {PROGRAM_ROOMS.map((room) => (
          <View key={room.id} style={[styles.roomChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[styles.roomTitle, { color: colors.text }]}>{room.title}</ThemedText>
            {room.unread > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: accent }]}>
                <ThemedText style={styles.unreadText}>{room.unread}</ThemedText>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function PeopleView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>STAFF ({STAFF_MEMBERS.length})</ThemedText>
      {STAFF_MEMBERS.map((s) => (
        <View key={s.id} style={[styles.personRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: accent + '33' }]}>
            <ThemedText style={[styles.avatarText, { color: accent }]}>{s.initials}</ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.personName, { color: colors.text }]}>{s.name}</ThemedText>
            <ThemedText style={[styles.personRole, { color: colors.textSecondary }]}>{s.role} · {s.teamAssignment}</ThemedText>
          </View>
          <View style={[styles.tierBadge, { backgroundColor: s.permissionTier === 'admin' ? '#B85C5C22' : s.permissionTier === 'coach' ? accent + '22' : '#9C979022' }]}>
            <ThemedText style={[styles.tierText, { color: s.permissionTier === 'admin' ? '#B85C5C' : s.permissionTier === 'coach' ? accent : '#9C9790' }]}>{s.permissionTier}</ThemedText>
          </View>
        </View>
      ))}

      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>ATHLETES ({ATHLETE_MEMBERS.length})</ThemedText>
      {ATHLETE_MEMBERS.map((a) => (
        <View key={a.id} style={[styles.personRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.numberBadge, { backgroundColor: colors.background }]}>
            <ThemedText style={[styles.numberText, { color: accent }]}>#{a.number}</ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.personName, { color: colors.text }]}>{a.name}</ThemedText>
            <ThemedText style={[styles.personRole, { color: colors.textSecondary }]}>{a.position} · {a.classYear} · {a.team}</ThemedText>
          </View>
        </View>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function TeamsView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {PROGRAM_TEAMS.map((team) => (
        <View key={team.id} style={[styles.teamCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.teamHeader}>
            <ThemedText style={[styles.teamName, { color: colors.text }]}>{team.name}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: team.status === 'active' ? '#5A8A6E22' : '#9C979022' }]}>
              <ThemedText style={[styles.statusText, { color: team.status === 'active' ? '#5A8A6E' : '#9C9790' }]}>{team.status}</ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.teamMeta, { color: colors.textSecondary }]}>HC: {team.headCoach} · Record: {team.record} · Roster: {team.rosterCount}</ThemedText>
        </View>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function SeasonsView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  const statusColors = { active: '#5A8A6E', completed: accent, archived: '#9C9790' };
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {PROGRAM_SEASONS.map((season) => (
        <View key={season.id} style={[styles.seasonCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.seasonHeader}>
            <ThemedText style={[styles.seasonLabel, { color: colors.text }]}>{season.label}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: statusColors[season.status] + '22' }]}>
              <ThemedText style={[styles.statusText, { color: statusColors[season.status] }]}>{season.status}</ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.seasonMeta, { color: colors.textSecondary }]}>Record: {season.record} · Conference: {season.conferenceFinish} · Teams: {season.teamCount}</ThemedText>
          {season.lockedDate && <ThemedText style={[styles.seasonLocked, { color: colors.textSecondary }]}>Locked: {season.lockedDate}</ThemedText>}
        </View>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function PermissionsView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {PERMISSION_ROLES.map((role) => (
        <View key={role.tier} style={[styles.permCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.permHeader}>
            <ThemedText style={[styles.permLabel, { color: colors.text }]}>{role.label}</ThemedText>
            <ThemedText style={[styles.permCount, { color: accent }]}>{role.memberCount} members</ThemedText>
          </View>
          <ThemedText style={[styles.permDesc, { color: colors.textSecondary }]}>{role.description}</ThemedText>
          <View style={styles.permCaps}>
            {role.capabilities.map((cap) => (
              <View key={cap} style={[styles.capChip, { backgroundColor: colors.background }]}>
                <ThemedText style={[styles.capText, { color: colors.textSecondary }]}>{cap}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function AuditView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {AUDIT_LOG.map((entry) => {
        const meta = AUDIT_ACTION_META[entry.action];
        return (
          <View key={entry.id} style={[styles.auditRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.auditHeader}>
              <View style={[styles.auditBadge, { backgroundColor: meta.color + '22' }]}>
                <ThemedText style={[styles.auditBadgeText, { color: meta.color }]}>{meta.label}</ThemedText>
              </View>
              <ThemedText style={[styles.auditTime, { color: colors.textSecondary }]}>{entry.timestamp}</ThemedText>
            </View>
            <ThemedText style={[styles.auditDesc, { color: colors.text }]}>{entry.description}</ThemedText>
            <ThemedText style={[styles.auditActor, { color: colors.textSecondary }]}>by {entry.actor}</ThemedText>
          </View>
        );
      })}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function SettingsView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  let lastSection = '';
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {PROGRAM_SETTINGS.map((setting) => {
        const showHeader = setting.section !== lastSection;
        lastSection = setting.section;
        return (
          <View key={setting.id}>
            {showHeader && <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{setting.section.toUpperCase()}</ThemedText>}
            <View style={[styles.settingRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.settingLabel, { color: colors.text }]}>{setting.label}</ThemedText>
                <ThemedText style={[styles.settingDesc, { color: colors.textSecondary }]}>{setting.description}</ThemedText>
              </View>
              {setting.type === 'toggle' && (
                <View style={[styles.toggleIndicator, { backgroundColor: setting.enabled ? '#5A8A6E' : '#9C9790' }]}>
                  <ThemedText style={styles.toggleText}>{setting.enabled ? 'ON' : 'OFF'}</ThemedText>
                </View>
              )}
              {setting.type === 'action' && (
                <IconSymbol name="chevron.right" size={14} color={colors.textSecondary} />
              )}
            </View>
          </View>
        );
      })}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function SnapChip({ label, value, color, colors }: { label: string; value: string; color: string; colors: typeof Colors.light }) {
  return (
    <View style={[styles.snapChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.snapChipValue, { color }]}>{value}</ThemedText>
      <ThemedText style={[styles.snapChipLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  pillBar: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2F3336' },
  pillText: { fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginTop: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },

  idCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  idName: { fontSize: 20, fontWeight: '800' },
  idMeta: { fontSize: 12, marginTop: 4 },
  snapRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  snapChip: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 1 },
  snapChipValue: { fontSize: 18, fontWeight: '800' },
  snapChipLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },

  systemCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  systemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  sysLabel: { fontSize: 11, fontWeight: '600', width: 65 },
  sysValue: { fontSize: 14, fontWeight: '700' },
  sysNote: { fontSize: 11, marginTop: 8, lineHeight: 16 },

  healthRow: { flexDirection: 'row', gap: 8 },

  todayCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  todayItem: { fontSize: 13, marginBottom: 4 },

  gameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  gameOpponent: { fontSize: 14, fontWeight: '600' },
  gameMeta: { fontSize: 11 },

  pinRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  pinTitle: { fontSize: 13, fontWeight: '600', flex: 1 },
  pinDate: { fontSize: 10 },

  roomsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roomChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  roomTitle: { fontSize: 13, fontWeight: '600' },
  unreadBadge: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  unreadText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  personRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '700' },
  personName: { fontSize: 14, fontWeight: '700' },
  personRole: { fontSize: 11, marginTop: 1 },
  tierBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tierText: { fontSize: 10, fontWeight: '700' },
  numberBadge: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontSize: 13, fontWeight: '800' },

  teamCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  teamHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  teamName: { fontSize: 16, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  teamMeta: { fontSize: 12, marginTop: 4 },

  seasonCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  seasonHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seasonLabel: { fontSize: 16, fontWeight: '700' },
  seasonMeta: { fontSize: 12, marginTop: 4 },
  seasonLocked: { fontSize: 10, marginTop: 4 },

  permCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  permHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  permLabel: { fontSize: 16, fontWeight: '700' },
  permCount: { fontSize: 12, fontWeight: '600' },
  permDesc: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  permCaps: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  capChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  capText: { fontSize: 10, fontWeight: '600' },

  auditRow: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  auditHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  auditBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  auditBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  auditTime: { fontSize: 10 },
  auditDesc: { fontSize: 13, fontWeight: '600' },
  auditActor: { fontSize: 10, marginTop: 2 },

  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 6, gap: 12 },
  settingLabel: { fontSize: 14, fontWeight: '600' },
  settingDesc: { fontSize: 11, marginTop: 2 },
  toggleIndicator: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  toggleText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
