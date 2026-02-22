/**
 * Person Detail Hub — 7-tab pill nav detail view for a single person.
 * Tabs: Overview | Roles & Access | Assignments | Rooms | Evidence | Notes | Audit
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Person, PersonStatus } from '@/data/mock-people-v2';

// =============================================================================
// TYPES
// =============================================================================

type Tab = 'Overview' | 'Roles & Access' | 'Assignments' | 'Rooms' | 'Evidence' | 'Notes' | 'Audit';

const TABS: Tab[] = ['Overview', 'Roles & Access', 'Assignments', 'Rooms', 'Evidence', 'Notes', 'Audit'];

// =============================================================================
// STATUS HELPERS
// =============================================================================

const STATUS_COLORS: Record<PersonStatus, string> = {
  active: '#22C55E',
  inactive: '#A1A1AA',
  pending: '#F59E0B',
  away: '#1D9BF0',
};

const STATUS_LABELS: Record<PersonStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  away: 'Away',
};

// =============================================================================
// MOCK DATA — Roles & Access
// =============================================================================

interface RoleEntry {
  id: string;
  role: string;
  scope: string;
  grantedBy: string;
  grantedDate: string;
}

function getMockRoles(person: Person): RoleEntry[] {
  return [
    { id: 'role-1', role: person.role, scope: person.unit, grantedBy: 'Admin', grantedDate: person.joinDate },
    { id: 'role-2', role: 'Directory Viewer', scope: 'Organization', grantedBy: 'System', grantedDate: person.joinDate },
  ];
}

interface AccessPermission {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

function getMockAccess(): AccessPermission[] {
  return [
    { id: 'acc-1', label: 'View Directory', description: 'Can view the people directory', enabled: true },
    { id: 'acc-2', label: 'Send Messages', description: 'Can send messages in rooms', enabled: true },
    { id: 'acc-3', label: 'Create Rooms', description: 'Can create new rooms', enabled: false },
    { id: 'acc-4', label: 'Edit Organization', description: 'Can edit organization settings', enabled: false },
  ];
}

// =============================================================================
// MOCK DATA — Assignments
// =============================================================================

interface Assignment {
  id: string;
  title: string;
  type: string;
  status: 'active' | 'completed' | 'upcoming';
  dueDate?: string;
}

function getMockAssignments(): Assignment[] {
  return [
    { id: 'asgn-1', title: 'Weekly meeting attendance', type: 'Recurring', status: 'active' },
    { id: 'asgn-2', title: 'Compliance training', type: 'Training', status: 'completed', dueDate: '2025-12-01' },
    { id: 'asgn-3', title: 'Quarterly review', type: 'Review', status: 'upcoming', dueDate: '2026-03-15' },
    { id: 'asgn-4', title: 'Onboarding checklist', type: 'Onboarding', status: 'completed', dueDate: '2025-07-01' },
  ];
}

// =============================================================================
// MOCK DATA — Rooms
// =============================================================================

interface PersonRoom {
  id: string;
  title: string;
  memberCount: number;
  lastActivity: string;
}

function getMockRooms(): PersonRoom[] {
  return [
    { id: 'rm-1', title: 'General', memberCount: 24, lastActivity: '2 hours ago' },
    { id: 'rm-2', title: 'Team Channel', memberCount: 12, lastActivity: '4 hours ago' },
    { id: 'rm-3', title: 'Announcements', memberCount: 45, lastActivity: '1 day ago' },
  ];
}

// =============================================================================
// MOCK DATA — Evidence
// =============================================================================

interface EvidenceEntry {
  id: string;
  type: 'film' | 'document' | 'note' | 'metric';
  title: string;
  source: string;
  timestamp: string;
}

function getMockEvidence(): EvidenceEntry[] {
  return [
    { id: 'ev-1', type: 'document', title: 'Signed agreement', source: 'Upload', timestamp: '1 week ago' },
    { id: 'ev-2', type: 'note', title: 'Performance check-in', source: 'Admin', timestamp: '2 weeks ago' },
    { id: 'ev-3', type: 'metric', title: 'Attendance log', source: 'System', timestamp: '3 weeks ago' },
    { id: 'ev-4', type: 'document', title: 'Certification', source: 'Upload', timestamp: '1 month ago' },
  ];
}

// =============================================================================
// MOCK DATA — Notes
// =============================================================================

interface NoteEntry {
  id: string;
  date: string;
  author: string;
  text: string;
}

function getMockNotes(personName: string): NoteEntry[] {
  return [
    { id: 'note-1', date: '2025-12-10', author: 'Admin', text: `${personName} demonstrated strong leadership in the recent project review.` },
    { id: 'note-2', date: '2025-11-22', author: 'Admin', text: 'Follow up on performance goals for next quarter.' },
    { id: 'note-3', date: '2025-10-15', author: 'Admin', text: 'Completed required compliance training ahead of schedule.' },
  ];
}

// =============================================================================
// MOCK DATA — Audit
// =============================================================================

interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  icon: string;
}

function getMockAudit(personName: string): AuditEntry[] {
  return [
    { id: 'aud-1', action: `${personName} added to organization`, actor: 'Admin', timestamp: '6 months ago', icon: 'person.badge.plus' },
    { id: 'aud-2', action: 'Role assigned: Staff', actor: 'Admin', timestamp: '6 months ago', icon: 'lock.fill' },
    { id: 'aud-3', action: 'Joined room: General', actor: 'System', timestamp: '6 months ago', icon: 'text.bubble' },
    { id: 'aud-4', action: 'Profile updated', actor: personName, timestamp: '3 months ago', icon: 'pencil' },
    { id: 'aud-5', action: 'Directory visibility changed', actor: 'Admin', timestamp: '2 months ago', icon: 'eye.fill' },
    { id: 'aud-6', action: 'Access reviewed', actor: 'System', timestamp: '1 month ago', icon: 'checkmark.shield.fill' },
  ];
}

// =============================================================================
// TAB CONTENT — Overview
// =============================================================================

function OverviewTab({ person, colors }: { person: Person; colors: typeof Colors.dark }) {
  return (
    <ScrollView style={styles.tabScroll} showsVerticalScrollIndicator={false}>
      {/* Large avatar */}
      <View style={styles.overviewHeader}>
        <View style={[styles.avatarLarge, { backgroundColor: person.avatarColor }]}>
          <ThemedText style={styles.avatarLargeText}>{person.initials}</ThemedText>
        </View>
        <ThemedText style={[styles.overviewName, { color: colors.text }]}>
          {person.name}
        </ThemedText>
        <ThemedText style={[styles.overviewRole, { color: colors.textSecondary }]}>
          {person.role}
        </ThemedText>
        <ThemedText style={[styles.overviewDept, { color: colors.textTertiary }]}>
          {person.unit}
        </ThemedText>

        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[person.status] + '20' }]}>
          <View style={[styles.statusDotSmall, { backgroundColor: STATUS_COLORS[person.status] }]} />
          <ThemedText style={[styles.statusBadgeText, { color: STATUS_COLORS[person.status] }]}>
            {STATUS_LABELS[person.status]}
          </ThemedText>
        </View>
      </View>

      {/* Contact info */}
      <View style={[styles.section, { borderTopColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          CONTACT
        </ThemedText>
        <View style={styles.contactRow}>
          <IconSymbol name="envelope.fill" size={16} color={colors.textTertiary} />
          <ThemedText style={[styles.contactText, { color: colors.text }]}>
            {person.email}
          </ThemedText>
        </View>
        {person.phone && (
          <View style={styles.contactRow}>
            <IconSymbol name="phone.fill" size={16} color={colors.textTertiary} />
            <ThemedText style={[styles.contactText, { color: colors.text }]}>
              {person.phone}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Bio */}
      <View style={[styles.section, { borderTopColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          BIO
        </ThemedText>
        <ThemedText style={[styles.bioText, { color: colors.text }]}>
          {person.bio}
        </ThemedText>
      </View>

      {/* Tags */}
      <View style={[styles.section, { borderTopColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          TAGS
        </ThemedText>
        <View style={styles.tagsWrap}>
          {person.tags.map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[styles.tagText, { color: colors.textSecondary }]}>
                {tag}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Join date */}
      <View style={[styles.section, { borderTopColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          JOINED
        </ThemedText>
        <ThemedText style={[styles.contactText, { color: colors.text }]}>
          {person.joinDate}
        </ThemedText>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// TAB CONTENT — Roles & Access
// =============================================================================

function RolesAccessTab({ person, colors }: { person: Person; colors: typeof Colors.dark }) {
  const roles = useMemo(() => getMockRoles(person), [person]);
  const access = useMemo(() => getMockAccess(), []);

  return (
    <ScrollView style={styles.tabScroll} showsVerticalScrollIndicator={false}>
      {/* Active Roles */}
      <View style={[styles.section, { borderTopWidth: 0 }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          ACTIVE ROLES
        </ThemedText>
        {roles.map((role) => (
          <View
            key={role.id}
            style={[styles.roleCard, { backgroundColor: colors.backgroundTertiary }]}
          >
            <View style={styles.roleCardHeader}>
              <ThemedText style={[styles.roleLabel, { color: colors.text }]}>
                {role.role}
              </ThemedText>
              <ThemedText style={[styles.roleScope, { color: colors.textTertiary }]}>
                {role.scope}
              </ThemedText>
            </View>
            <View style={styles.roleCardFooter}>
              <ThemedText style={[styles.roleGranted, { color: colors.textTertiary }]}>
                Granted by {role.grantedBy} on {role.grantedDate}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Access Permissions */}
      <View style={[styles.section, { borderTopColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          ACCESS PERMISSIONS
        </ThemedText>
        {access.map((perm) => (
          <View key={perm.id} style={styles.accessRow}>
            <View style={styles.accessInfo}>
              <ThemedText style={[styles.accessLabel, { color: colors.text }]}>
                {perm.label}
              </ThemedText>
              <ThemedText style={[styles.accessDesc, { color: colors.textTertiary }]}>
                {perm.description}
              </ThemedText>
            </View>
            <Switch
              value={perm.enabled}
              trackColor={{ false: colors.backgroundTertiary, true: '#22C55E' }}
              thumbColor="#FFFFFF"
              disabled
            />
          </View>
        ))}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// TAB CONTENT — Assignments
// =============================================================================

const ASSIGNMENT_STATUS_COLORS: Record<string, string> = {
  active: '#22C55E',
  completed: '#A1A1AA',
  upcoming: '#1D9BF0',
};

function AssignmentsTab({ colors }: { colors: typeof Colors.dark }) {
  const assignments = useMemo(() => getMockAssignments(), []);

  return (
    <ScrollView style={styles.tabScroll} showsVerticalScrollIndicator={false}>
      <View style={[styles.section, { borderTopWidth: 0 }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          ASSIGNMENTS
        </ThemedText>
        {assignments.map((a, index) => (
          <View
            key={a.id}
            style={[
              styles.assignmentRow,
              index < assignments.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={[styles.assignmentStatusDot, { backgroundColor: ASSIGNMENT_STATUS_COLORS[a.status] }]} />
            <View style={styles.assignmentInfo}>
              <ThemedText style={[styles.assignmentTitle, { color: colors.text }]}>
                {a.title}
              </ThemedText>
              <View style={styles.assignmentMeta}>
                <ThemedText style={[styles.assignmentType, { color: colors.textTertiary }]}>
                  {a.type}
                </ThemedText>
                {a.dueDate && (
                  <ThemedText style={[styles.assignmentDue, { color: colors.textTertiary }]}>
                    Due: {a.dueDate}
                  </ThemedText>
                )}
              </View>
            </View>
            <View style={[styles.assignmentBadge, { backgroundColor: ASSIGNMENT_STATUS_COLORS[a.status] + '20' }]}>
              <ThemedText style={[styles.assignmentBadgeText, { color: ASSIGNMENT_STATUS_COLORS[a.status] }]}>
                {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// TAB CONTENT — Rooms
// =============================================================================

function RoomsTab({ colors }: { colors: typeof Colors.dark }) {
  const rooms = useMemo(() => getMockRooms(), []);

  return (
    <ScrollView style={styles.tabScroll} showsVerticalScrollIndicator={false}>
      <View style={[styles.section, { borderTopWidth: 0 }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          ROOMS
        </ThemedText>
        {rooms.map((room, index) => (
          <View
            key={room.id}
            style={[
              styles.roomRow,
              index < rooms.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={[styles.roomIcon, { backgroundColor: colors.backgroundTertiary }]}>
              <IconSymbol name="text.bubble" size={16} color={colors.textSecondary} />
            </View>
            <View style={styles.roomInfo}>
              <ThemedText style={[styles.roomTitle, { color: colors.text }]}>
                {room.title}
              </ThemedText>
              <ThemedText style={[styles.roomMeta, { color: colors.textTertiary }]}>
                {room.memberCount} members · {room.lastActivity}
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </View>
        ))}
      </View>
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// TAB CONTENT — Evidence
// =============================================================================

const EVIDENCE_ICONS: Record<string, string> = {
  film: 'film',
  document: 'doc.fill',
  note: 'note.text',
  metric: 'chart.bar.fill',
};

function EvidenceTab({ colors }: { colors: typeof Colors.dark }) {
  const evidence = useMemo(() => getMockEvidence(), []);

  return (
    <ScrollView style={styles.tabScroll} showsVerticalScrollIndicator={false}>
      <View style={[styles.section, { borderTopWidth: 0 }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          EVIDENCE LOG
        </ThemedText>
        {evidence.map((ev, index) => (
          <View
            key={ev.id}
            style={[
              styles.evidenceRow,
              index < evidence.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={[styles.evidenceIcon, { backgroundColor: colors.backgroundTertiary }]}>
              <IconSymbol
                name={EVIDENCE_ICONS[ev.type] as any}
                size={16}
                color={colors.textSecondary}
              />
            </View>
            <View style={styles.evidenceInfo}>
              <ThemedText style={[styles.evidenceTitle, { color: colors.text }]}>
                {ev.title}
              </ThemedText>
              <ThemedText style={[styles.evidenceMeta, { color: colors.textTertiary }]}>
                {ev.source} · {ev.timestamp}
              </ThemedText>
            </View>
            <View style={[styles.evidenceTypeBadge, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[styles.evidenceTypeText, { color: colors.textSecondary }]}>
                {ev.type}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// TAB CONTENT — Notes
// =============================================================================

function NotesTab({ person, colors }: { person: Person; colors: typeof Colors.dark }) {
  const notes = useMemo(() => getMockNotes(person.name), [person.name]);

  return (
    <ScrollView style={styles.tabScroll} showsVerticalScrollIndicator={false}>
      <View style={[styles.section, { borderTopWidth: 0 }]}>
        <View style={styles.notesSectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            NOTES
          </ThemedText>
          <View style={[styles.addNoteButton, { backgroundColor: colors.backgroundTertiary }]}>
            <IconSymbol name="plus" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.addNoteText, { color: colors.textSecondary }]}>
              Add Note
            </ThemedText>
          </View>
        </View>
        {notes.map((note, index) => (
          <View
            key={note.id}
            style={[
              styles.noteCard,
              { backgroundColor: colors.backgroundTertiary },
              index < notes.length - 1 && { marginBottom: Spacing.sm },
            ]}
          >
            <View style={styles.noteHeader}>
              <ThemedText style={[styles.noteDate, { color: colors.textTertiary }]}>
                {note.date}
              </ThemedText>
              <ThemedText style={[styles.noteAuthor, { color: colors.textTertiary }]}>
                {note.author}
              </ThemedText>
            </View>
            <ThemedText style={[styles.noteText, { color: colors.text }]}>
              {note.text}
            </ThemedText>
          </View>
        ))}
      </View>
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// TAB CONTENT — Audit
// =============================================================================

function AuditTab({ person, colors }: { person: Person; colors: typeof Colors.dark }) {
  const audit = useMemo(() => getMockAudit(person.name), [person.name]);

  return (
    <ScrollView style={styles.tabScroll} showsVerticalScrollIndicator={false}>
      <View style={[styles.section, { borderTopWidth: 0 }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          AUDIT LOG
        </ThemedText>
        {audit.map((entry, index) => (
          <View
            key={entry.id}
            style={[
              styles.auditRow,
              index < audit.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={[styles.auditIcon, { backgroundColor: colors.backgroundTertiary }]}>
              <IconSymbol
                name={entry.icon as any}
                size={14}
                color={colors.textSecondary}
              />
            </View>
            <View style={styles.auditInfo}>
              <ThemedText style={[styles.auditAction, { color: colors.text }]}>
                {entry.action}
              </ThemedText>
              <ThemedText style={[styles.auditMeta, { color: colors.textTertiary }]}>
                {entry.actor} · {entry.timestamp}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// PERSON DETAIL HUB
// =============================================================================

export function PersonDetailHub({ person }: { person: Person }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  const handleTabPress = useCallback((tab: Tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  }, []);

  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'Overview':
        return <OverviewTab person={person} colors={colors} />;
      case 'Roles & Access':
        return <RolesAccessTab person={person} colors={colors} />;
      case 'Assignments':
        return <AssignmentsTab colors={colors} />;
      case 'Rooms':
        return <RoomsTab colors={colors} />;
      case 'Evidence':
        return <EvidenceTab colors={colors} />;
      case 'Notes':
        return <NotesTab person={person} colors={colors} />;
      case 'Audit':
        return <AuditTab person={person} colors={colors} />;
      default:
        return null;
    }
  }, [activeTab, person, colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Pill nav */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillNavContent}
        style={styles.pillNav}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? '#fff' : colors.backgroundTertiary,
                },
              ]}
              onPress={() => handleTabPress(tab)}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {tab}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Tab content */}
      <View style={styles.tabContent}>{renderTabContent()}</View>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pillNav: {
    flexGrow: 0,
    flexShrink: 0,
  },
  pillNavContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  pill: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  tabScroll: {
    flex: 1,
  },
  bottomSpacer: {
    height: 48,
  },

  // ---------- Overview ----------
  overviewHeader: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: 4,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarLargeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  overviewName: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  overviewRole: {
    fontSize: 15,
    lineHeight: 20,
  },
  overviewDept: {
    fontSize: 13,
    lineHeight: 18,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: Spacing.sm,
    gap: 6,
  },
  statusDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 6,
  },
  contactText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // ---------- Roles & Access ----------
  roleCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  roleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  roleScope: {
    fontSize: 12,
    fontWeight: '500',
  },
  roleCardFooter: {
    marginTop: 2,
  },
  roleGranted: {
    fontSize: 12,
    lineHeight: 16,
  },
  accessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  accessInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  accessLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  accessDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },

  // ---------- Assignments ----------
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: Spacing.sm,
  },
  assignmentStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  assignmentInfo: {
    flex: 1,
    gap: 2,
  },
  assignmentTitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  assignmentMeta: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  assignmentType: {
    fontSize: 12,
    lineHeight: 16,
  },
  assignmentDue: {
    fontSize: 12,
    lineHeight: 16,
  },
  assignmentBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  assignmentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // ---------- Rooms ----------
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: Spacing.sm,
  },
  roomIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomInfo: {
    flex: 1,
    gap: 2,
  },
  roomTitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  roomMeta: {
    fontSize: 12,
    lineHeight: 16,
  },

  // ---------- Evidence ----------
  evidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: Spacing.sm,
  },
  evidenceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceInfo: {
    flex: 1,
    gap: 2,
  },
  evidenceTitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  evidenceMeta: {
    fontSize: 12,
    lineHeight: 16,
  },
  evidenceTypeBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  evidenceTypeText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },

  // ---------- Notes ----------
  notesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  addNoteText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noteCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  noteDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  noteAuthor: {
    fontSize: 12,
    fontWeight: '500',
  },
  noteText: {
    fontSize: 14,
    lineHeight: 22,
  },

  // ---------- Audit ----------
  auditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: Spacing.sm,
  },
  auditIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  auditInfo: {
    flex: 1,
    gap: 2,
  },
  auditAction: {
    fontSize: 14,
    lineHeight: 20,
  },
  auditMeta: {
    fontSize: 12,
    lineHeight: 16,
  },
});
