/**
 * Universal Member Sheet — Church Mode
 * Member "truth page" with up to 9 RBAC-gated tabs.
 * This is the CONTENT component — the parent handles the bottom sheet wrapper.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import {
  type ChurchMember,
  type FollowUp,
  type PrayerRequest,
  type VolunteerAssignment,
  type ChurchIncident,
  CHURCH_MEMBERS,
  FOLLOW_UPS,
  PRAYER_REQUESTS,
  VOLUNTEER_ASSIGNMENTS,
  SERVICE_EVENTS,
  MINISTRIES,
  CHURCH_INCIDENTS,
  getFollowUpsByMember,
} from '@/data/mock-church-v2';

import {
  type ChurchRoleLens,
  type MemberTab,
  getMemberSheetTabs,
  isSeniorPastor,
  isMinistryLevel,
} from '@/utils/church-rbac';

const ACCENT = MODE_ACCENT.church;

// =============================================================================
// PROPS
// =============================================================================

interface UniversalMemberSheetProps {
  member: ChurchMember;
  roleLens: ChurchRoleLens;
  onClose: () => void;
  onOpenMinistry?: (ministryId: string) => void;
}

// =============================================================================
// STATUS COLORS
// =============================================================================

const MEMBER_STATUS_COLORS: Record<string, string> = {
  active: '#5A8A6E',
  visitor: ACCENT,
  inactive: '#9C9790',
  under_review: '#B8943E',
};

const SAFETY_STATUS_COLORS: Record<string, string> = {
  cleared: '#5A8A6E',
  pending: '#B8943E',
  restricted: '#B85C5C',
};

const TASK_STATUS_COLORS: Record<string, string> = {
  open: '#B8943E',
  in_progress: ACCENT,
  completed: '#5A8A6E',
};

const FOLLOW_UP_CATEGORY_COLORS: Record<string, string> = {
  new_visitor: ACCENT,
  returning: '#5A8A6E',
  prayer_request: ACCENT,
  hospital: '#B85C5C',
  counseling: '#B8943E',
  discipline: '#B85C5C',
  other: '#9C9790',
};

const INCIDENT_TYPE_COLORS: Record<string, string> = {
  child_safety: '#B85C5C',
  medical: '#B8943E',
  conflict: ACCENT,
  property: '#9C9790',
  other: '#9C9790',
};

const SENSITIVITY_COLORS: Record<string, string> = {
  public: '#5A8A6E',
  restricted: '#B8943E',
  confidential: '#B85C5C',
};

// =============================================================================
// INLINE MOCK DATA (tabs that need additional data not in mock-church-v2)
// =============================================================================

const MEMBER_ATTENDANCE_TIMELINE = [
  { id: 'att-1', date: 'Feb 16, 2026', service: 'Sunday Service 10AM', checkedIn: true },
  { id: 'att-2', date: 'Feb 9, 2026', service: 'Sunday Service 10AM', checkedIn: true },
  { id: 'att-3', date: 'Feb 2, 2026', service: 'Sunday Service 10AM', checkedIn: true },
  { id: 'att-4', date: 'Jan 26, 2026', service: 'Sunday Service 10AM', checkedIn: false },
  { id: 'att-5', date: 'Jan 19, 2026', service: 'Sunday Service 10AM', checkedIn: true },
  { id: 'att-6', date: 'Jan 12, 2026', service: 'Sunday Service 10AM', checkedIn: true },
  { id: 'att-7', date: 'Jan 5, 2026', service: 'Sunday Service 10AM', checkedIn: true },
  { id: 'att-8', date: 'Dec 29, 2025', service: 'Sunday Service 10AM', checkedIn: false },
];

const MEMBER_TASKS_MOCK = [
  { id: 'mt-1', title: 'Complete volunteer orientation packet', status: 'completed', assignedBy: 'Pastor Philip Anthony Mitchell', dueDate: 'Jan 15, 2026', type: 'onboarding' },
  { id: 'mt-2', title: 'Upload signed photo/video consent form', status: 'open', assignedBy: 'Admin Team', dueDate: 'Mar 1, 2026', type: 'task' },
  { id: 'mt-3', title: 'Safeguarding Level 1 e-learning module', status: 'in_progress', assignedBy: 'Safety Coordinator', dueDate: 'Feb 28, 2026', type: 'training' },
];

const MEMBER_WORKFLOW_QUEUE = [
  { id: 'wf-1', label: 'Background Check', status: 'completed', completedDate: 'Dec 5, 2025' },
  { id: 'wf-2', label: 'New Member Onboarding', status: 'completed', completedDate: 'Dec 20, 2025' },
  { id: 'wf-3', label: 'Safeguarding Level 1 Training', status: 'in_progress', completedDate: null },
  { id: 'wf-4', label: 'Ministry-Specific Training', status: 'not_started', completedDate: null },
];

const MEMBER_MESSAGE_THREADS = [
  { id: 'thr-1', roomName: 'Pastoral Care', lastMessage: 'Thank you for checking in. I am doing much better this week.', date: 'Feb 14, 2026', unread: 0 },
  { id: 'thr-2', roomName: "Children's Ministry Team", lastMessage: 'VBS theme finalized: "Adventure Island"', date: 'Feb 12, 2026', unread: 2 },
  { id: 'thr-3', roomName: 'All-Church Announcements', lastMessage: 'Spring service schedule changes starting March 1', date: 'Feb 10, 2026', unread: 0 },
];

const MEMBER_GIVING_MOCK = [
  { id: 'gv-1', month: 'Feb 2026', amount: '$850.00', type: 'Tithe' },
  { id: 'gv-2', month: 'Jan 2026', amount: '$850.00', type: 'Tithe' },
  { id: 'gv-3', month: 'Jan 2026', amount: '$200.00', type: 'Missions' },
  { id: 'gv-4', month: 'Dec 2025', amount: '$850.00', type: 'Tithe' },
  { id: 'gv-5', month: 'Dec 2025', amount: '$500.00', type: 'Building Fund' },
  { id: 'gv-6', month: 'Nov 2025', amount: '$850.00', type: 'Tithe' },
];

const MEMBER_PLEDGES = [
  { id: 'pl-1', name: '2026 Building Fund', pledged: '$2,400', given: '$500', remaining: '$1,900', deadline: 'Dec 31, 2026' },
  { id: 'pl-2', name: 'Global Missions 2026', pledged: '$1,200', given: '$200', remaining: '$1,000', deadline: 'Dec 31, 2026' },
];

const TRAINING_CHECKLIST_ITEMS = [
  { id: 'tr-1', label: 'Safeguarding Level 1', required: true },
  { id: 'tr-2', label: 'Safeguarding Level 2', required: true },
  { id: 'tr-3', label: 'Child Protection Policy', required: true },
  { id: 'tr-4', label: 'First Aid / CPR', required: false },
  { id: 'tr-5', label: 'Conflict Resolution', required: false },
  { id: 'tr-6', label: 'Data Protection Awareness', required: false },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function UniversalMemberSheet({
  member,
  roleLens,
  onClose,
  onOpenMinistry,
}: UniversalMemberSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const tabs = useMemo(() => getMemberSheetTabs(roleLens), [roleLens]);
  const [activeTab, setActiveTab] = useState<MemberTab>(tabs[0]?.id ?? 'overview');

  const seniorPastor = isSeniorPastor(roleLens);
  const ministryLevel = isMinistryLevel(roleLens);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <MemberHeader
        member={member}
        roleLens={roleLens}
        colors={colors}
        seniorPastor={seniorPastor}
        onClose={onClose}
      />

      {/* TAB BAR */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              style={[
                styles.tabPill,
                {
                  backgroundColor: isActive ? '#FFFFFF' : colors.card,
                  borderColor: isActive ? '#FFFFFF' : colors.border,
                },
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <ThemedText
                style={[
                  styles.tabPillText,
                  { color: isActive ? '#000000' : colors.textSecondary },
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* TAB CONTENT */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && (
          <OverviewTab member={member} colors={colors} seniorPastor={seniorPastor} />
        )}
        {activeTab === 'ministry_involvement' && (
          <MinistryInvolvementTab member={member} colors={colors} seniorPastor={seniorPastor} onOpenMinistry={onOpenMinistry} />
        )}
        {activeTab === 'schedule_attendance' && (
          <ScheduleAttendanceTab member={member} colors={colors} seniorPastor={seniorPastor} />
        )}
        {activeTab === 'care_followup' && (
          <CareFollowUpTab member={member} colors={colors} seniorPastor={seniorPastor} />
        )}
        {activeTab === 'tasks_workflow' && (
          <TasksWorkflowTab member={member} colors={colors} seniorPastor={seniorPastor} />
        )}
        {activeTab === 'messages' && (
          <MessagesTab member={member} colors={colors} seniorPastor={seniorPastor} />
        )}
        {activeTab === 'safety_compliance' && (
          <SafetyComplianceTab member={member} colors={colors} seniorPastor={seniorPastor} />
        )}
        {activeTab === 'admin' && (
          <AdminTab member={member} colors={colors} seniorPastor={seniorPastor} />
        )}
        {activeTab === 'giving' && (
          <GivingTab member={member} colors={colors} />
        )}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// HEADER
// =============================================================================

function MemberHeader({
  member,
  roleLens,
  colors,
  seniorPastor,
  onClose,
}: {
  member: ChurchMember;
  roleLens: ChurchRoleLens;
  colors: typeof Colors.light;
  seniorPastor: boolean;
  onClose: () => void;
}) {
  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const org = '2819 Church';

  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      {/* Top row: avatar + name + close */}
      <View style={styles.headerTopRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[styles.avatarInitials, { color: colors.textSecondary }]}>
              {initials}
            </ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.memberName, { color: colors.text }]}>
              {member.name}
            </ThemedText>
            <ThemedText style={[styles.orgLabel, { color: colors.textSecondary }]}>
              {org}
            </ThemedText>
          </View>
        </View>
        <Pressable onPress={onClose} hitSlop={12}>
          <IconSymbol name="xmark" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Status pills */}
      <View style={styles.pillRow}>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: (MEMBER_STATUS_COLORS[member.status] ?? '#9C9790') + '1A' },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: MEMBER_STATUS_COLORS[member.status] ?? '#9C9790' },
            ]}
          />
          <ThemedText
            style={[
              styles.statusPillText,
              { color: MEMBER_STATUS_COLORS[member.status] ?? '#9C9790' },
            ]}
          >
            {member.status.replace('_', ' ').toUpperCase()}
          </ThemedText>
        </View>

        <View
          style={[
            styles.typePill,
            { backgroundColor: colors.card },
          ]}
        >
          <ThemedText style={[styles.typePillText, { color: colors.textSecondary }]}>
            {member.type.toUpperCase()}
          </ThemedText>
        </View>

        {/* Safety badge (RBAC-gated) */}
        {seniorPastor && (
          <View
            style={[
              styles.safetyPill,
              { backgroundColor: (SAFETY_STATUS_COLORS[member.safetyClearance] ?? '#9C9790') + '1A' },
            ]}
          >
            <IconSymbol
              name="shield.fill"
              size={10}
              color={SAFETY_STATUS_COLORS[member.safetyClearance] ?? '#9C9790'}
            />
            <ThemedText
              style={[
                styles.safetyPillText,
                { color: SAFETY_STATUS_COLORS[member.safetyClearance] ?? '#9C9790' },
              ]}
            >
              {member.safetyClearance.toUpperCase()}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Quick actions */}
      <View style={styles.actionRow}>
        <ActionIcon icon="bubble.left.fill" label="Message" colors={colors} />
        {seniorPastor && <ActionIcon icon="note.text.badge.plus" label="Add Note" colors={colors} />}
        {seniorPastor && <ActionIcon icon="checklist" label="Assign Task" colors={colors} />}
        {seniorPastor && <ActionIcon icon="person.badge.plus" label="Add Ministry" colors={colors} />}
        {seniorPastor && <ActionIcon icon="hands.sparkles.fill" label="Request" colors={colors} />}
        {seniorPastor && <ActionIcon icon="doc.fill" label="Export" colors={colors} />}
      </View>
    </View>
  );
}

// =============================================================================
// TAB 1: OVERVIEW
// =============================================================================

function OverviewTab({
  member,
  colors,
  seniorPastor,
}: {
  member: ChurchMember;
  colors: typeof Colors.light;
  seniorPastor: boolean;
}) {
  const followUps = getFollowUpsByMember(member.id);
  const memberMinistries = MINISTRIES.filter((m) => member.ministries.includes(m.id) || member.ministries.includes('all'));

  return (
    <View>
      {/* Identity */}
      <SectionCard title="Identity" colors={colors}>
        <InfoRow label="Full Name" value={member.name} colors={colors} />
        {seniorPastor && member.phone && (
          <InfoRow label="Phone" value={member.phone} colors={colors} />
        )}
        {seniorPastor && member.email && (
          <InfoRow label="Email" value={member.email} colors={colors} />
        )}
        <InfoRow label="Campus" value="2819 Church" colors={colors} />
      </SectionCard>

      {/* Profile */}
      <SectionCard title="Profile" colors={colors}>
        <InfoRow label="Member Type" value={member.type.charAt(0).toUpperCase() + member.type.slice(1)} colors={colors} />
        <InfoRow label="Baptized" value={member.baptized ? 'Yes' : 'No'} colors={colors} />
        <InfoRow label="Membership" value={member.membershipStatus === 'full' ? 'Full Member' : member.membershipStatus === 'provisional' ? 'Provisional' : 'None'} colors={colors} />
      </SectionCard>

      {/* Quick Summary */}
      <SectionCard title="Quick Summary" colors={colors}>
        <View style={styles.statRow}>
          <StatBlock
            label="Last Attended"
            value={member.lastAttendance ?? 'N/A'}
            color="#FFFFFF"
            colors={colors}
            small
          />
          <StatBlock
            label="Ministries"
            value={String(memberMinistries.length)}
            color={ACCENT}
            colors={colors}
          />
          <StatBlock
            label="Follow-Ups"
            value={String(followUps.length)}
            color={followUps.length > 0 ? '#B8943E' : '#5A8A6E'}
            colors={colors}
          />
        </View>
      </SectionCard>

      {/* Action Buttons */}
      <View style={styles.actionButtonGrid}>
        <ActionButton label="Start Follow-Up" icon="arrow.turn.down.right" colors={colors} />
        <ActionButton label="Invite to Event" icon="calendar.badge.plus" colors={colors} />
      </View>
    </View>
  );
}

// =============================================================================
// TAB 2: MINISTRY INVOLVEMENT
// =============================================================================

function MinistryInvolvementTab({
  member,
  colors,
  seniorPastor,
  onOpenMinistry,
}: {
  member: ChurchMember;
  colors: typeof Colors.light;
  seniorPastor: boolean;
  onOpenMinistry?: (ministryId: string) => void;
}) {
  const memberMinistries = MINISTRIES.filter(
    (m) => member.ministries.includes(m.id) || member.ministries.includes('all')
  );

  // Role mapping inline
  const getRoleInMinistry = (ministryId: string): string => {
    if (member.ministries.includes('all')) return 'Senior Pastor';
    if (member.type === 'leader') return 'Ministry Lead';
    if (member.type === 'volunteer') return 'Volunteer';
    return 'Member';
  };

  return (
    <View>
      {/* Assigned Ministries */}
      <SectionCard title="Assigned Ministries" colors={colors}>
        {memberMinistries.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No ministry assignments
          </ThemedText>
        ) : (
          memberMinistries.map((ministry) => (
            <Pressable
              key={ministry.id}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
              onPress={() => onOpenMinistry?.(ministry.id)}
            >
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {ministry.name}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  Role: {getRoleInMinistry(ministry.id)} · {ministry.campus}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.ministryStatusBadge,
                  { backgroundColor: ministry.status === 'active' ? '#5A8A6E22' : '#B8943E22' },
                ]}
              >
                <ThemedText
                  style={[
                    styles.ministryStatusText,
                    { color: ministry.status === 'active' ? '#5A8A6E' : '#B8943E' },
                  ]}
                >
                  {ministry.status.toUpperCase()}
                </ThemedText>
              </View>
            </Pressable>
          ))
        )}
      </SectionCard>

      {/* Availability */}
      <SectionCard title="Availability" colors={colors}>
        <InfoRow label="Preferred Times" value={member.type === 'visitor' ? 'Not set' : 'Sunday AM, Wednesday PM'} colors={colors} />
        <InfoRow label="Volunteer Days" value={member.type === 'visitor' ? 'Not set' : 'Sundays, Wednesdays'} colors={colors} />
      </SectionCard>

      {/* Senior Pastor Actions */}
      {seniorPastor && (
        <View style={styles.actionButtonGrid}>
          <ActionButton label="Add Role" icon="person.badge.plus" colors={colors} />
          <ActionButton label="Remove Role" icon="person.badge.minus" colors={colors} />
        </View>
      )}
    </View>
  );
}

// =============================================================================
// TAB 3: SCHEDULE + ATTENDANCE
// =============================================================================

function ScheduleAttendanceTab({
  member,
  colors,
  seniorPastor,
}: {
  member: ChurchMember;
  colors: typeof Colors.light;
  seniorPastor: boolean;
}) {
  const assignments = VOLUNTEER_ASSIGNMENTS.filter((a) => a.memberId === member.id);
  const upcomingServices = SERVICE_EVENTS.filter((s) => s.status === 'upcoming');

  return (
    <View>
      {/* Attendance Timeline */}
      <SectionCard title="Attendance Timeline" colors={colors}>
        {MEMBER_ATTENDANCE_TIMELINE.map((entry) => (
          <View
            key={entry.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View
              style={[
                styles.attendanceDot,
                { backgroundColor: entry.checkedIn ? '#5A8A6E' : '#B85C5C' },
              ]}
            />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {entry.service}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {entry.date}
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.statusLabel,
                { color: entry.checkedIn ? '#5A8A6E' : '#B85C5C' },
              ]}
            >
              {entry.checkedIn ? 'PRESENT' : 'ABSENT'}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* Upcoming Assignments */}
      <SectionCard title="Upcoming Assignments" colors={colors}>
        {assignments.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No upcoming assignments
          </ThemedText>
        ) : (
          assignments.map((assign) => {
            const service = SERVICE_EVENTS.find((s) => s.id === assign.serviceId);
            return (
              <View
                key={assign.id}
                style={[styles.listRow, { borderBottomColor: colors.border }]}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                    {service?.title ?? 'Service'}
                  </ThemedText>
                  <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                    Role: {assign.role} · {service?.date ?? ''}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.assignmentStatusBadge,
                    { backgroundColor: assign.status === 'confirmed' ? '#5A8A6E22' : '#B8943E22' },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.assignmentStatusText,
                      { color: assign.status === 'confirmed' ? '#5A8A6E' : '#B8943E' },
                    ]}
                  >
                    {assign.status.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
            );
          })
        )}
      </SectionCard>

      {/* Action Buttons */}
      {seniorPastor && (
        <View style={styles.actionButtonGrid}>
          <ActionButton label="Mark Attendance" icon="checkmark.circle.fill" colors={colors} />
          <ActionButton label="Assign to Service" icon="calendar.badge.plus" colors={colors} />
        </View>
      )}
    </View>
  );
}

// =============================================================================
// TAB 4: CARE + FOLLOW-UP (sensitive)
// =============================================================================

function CareFollowUpTab({
  member,
  colors,
  seniorPastor,
}: {
  member: ChurchMember;
  colors: typeof Colors.light;
  seniorPastor: boolean;
}) {
  const followUps = getFollowUpsByMember(member.id);
  const prayerRequests = PRAYER_REQUESTS.filter((p) => p.memberId === member.id);
  const needsFollowUp = member.followUpCount > 0 || member.status === 'visitor';

  return (
    <View>
      {/* Care Status */}
      <SectionCard title="Care Status" colors={colors}>
        <View style={styles.pillRow}>
          {needsFollowUp && (
            <View style={[styles.careTagPill, { backgroundColor: '#B8943E22' }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={10} color="#B8943E" />
              <ThemedText style={[styles.careTagText, { color: '#B8943E' }]}>
                NEEDS FOLLOW-UP
              </ThemedText>
            </View>
          )}
          {member.status === 'visitor' && (
            <View style={[styles.careTagPill, { backgroundColor: `${ACCENT}22` }]}>
              <ThemedText style={[styles.careTagText, { color: ACCENT }]}>
                NEW VISITOR
              </ThemedText>
            </View>
          )}
          {member.status === 'under_review' && (
            <View style={[styles.careTagPill, { backgroundColor: '#B85C5C22' }]}>
              <ThemedText style={[styles.careTagText, { color: '#B85C5C' }]}>
                UNDER REVIEW
              </ThemedText>
            </View>
          )}
          {!needsFollowUp && member.status !== 'under_review' && (
            <View style={[styles.careTagPill, { backgroundColor: '#5A8A6E22' }]}>
              <IconSymbol name="checkmark.circle.fill" size={10} color="#5A8A6E" />
              <ThemedText style={[styles.careTagText, { color: '#5A8A6E' }]}>
                NO OPEN CARE ITEMS
              </ThemedText>
            </View>
          )}
        </View>
      </SectionCard>

      {/* Follow-Up Log */}
      <SectionCard title="Follow-Up Log" colors={colors}>
        {followUps.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No follow-up history
          </ThemedText>
        ) : (
          followUps.map((fu) => (
            <View
              key={fu.id}
              style={[styles.followUpCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.followUpHeader}>
                <View
                  style={[
                    styles.followUpCategoryBadge,
                    { backgroundColor: (FOLLOW_UP_CATEGORY_COLORS[fu.category] ?? '#9C9790') + '22' },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.followUpCategoryText,
                      { color: FOLLOW_UP_CATEGORY_COLORS[fu.category] ?? '#9C9790' },
                    ]}
                  >
                    {fu.category.replace('_', ' ').toUpperCase()}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.captionText, { color: colors.textTertiary }]}>
                  {fu.date}
                </ThemedText>
              </View>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary, marginTop: 2 }]}>
                Owner: {fu.owner}
              </ThemedText>
              <ThemedText style={[styles.bodyText, { color: colors.text, marginTop: Spacing.xs }]}>
                {fu.summary}
              </ThemedText>
              {fu.outcome && (
                <ThemedText style={[styles.captionText, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                  Outcome: {fu.outcome}
                </ThemedText>
              )}
              {fu.nextStep && (
                <ThemedText style={[styles.captionText, { color: ACCENT, marginTop: 2 }]}>
                  Next: {fu.nextStep}
                </ThemedText>
              )}
            </View>
          ))
        )}
      </SectionCard>

      {/* Prayer Requests (RBAC-gated) */}
      {seniorPastor && (
        <SectionCard title="Prayer Requests" colors={colors}>
          {prayerRequests.length === 0 ? (
            <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
              No prayer requests on file
            </ThemedText>
          ) : (
            prayerRequests.map((pr) => (
              <View
                key={pr.id}
                style={[styles.listRow, { borderBottomColor: colors.border }]}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.bodyText, { color: colors.text }]}>
                    {pr.text}
                  </ThemedText>
                  <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                    {pr.date} · Visibility: {pr.visibility}
                  </ThemedText>
                </View>
              </View>
            ))
          )}
        </SectionCard>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtonGrid}>
        <ActionButton label="Create Follow-Up" icon="arrow.turn.down.right" colors={colors} />
        <ActionButton label="Assign Owner" icon="person.badge.plus" colors={colors} />
        <ActionButton label="Escalate to Pastor" icon="exclamationmark.bubble.fill" colors={colors} />
      </View>
    </View>
  );
}

// =============================================================================
// TAB 5: TASKS + WORKFLOW
// =============================================================================

function TasksWorkflowTab({
  member,
  colors,
  seniorPastor,
}: {
  member: ChurchMember;
  colors: typeof Colors.light;
  seniorPastor: boolean;
}) {
  return (
    <View>
      {/* Assigned Tasks */}
      <SectionCard title="Assigned Tasks" colors={colors}>
        {MEMBER_TASKS_MOCK.map((task) => (
          <View
            key={task.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View
              style={[
                styles.taskStatusBadge,
                { backgroundColor: (TASK_STATUS_COLORS[task.status] ?? '#9C9790') + '22' },
              ]}
            >
              <ThemedText
                style={[
                  styles.taskStatusText,
                  { color: TASK_STATUS_COLORS[task.status] ?? '#9C9790' },
                ]}
              >
                {task.status.replace('_', ' ').toUpperCase()}
              </ThemedText>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {task.title}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                Assigned by: {task.assignedBy} · Due: {task.dueDate}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>

      {/* Workflow Queue */}
      <SectionCard title="Workflow Queue" colors={colors}>
        {MEMBER_WORKFLOW_QUEUE.map((item) => {
          const statusColor =
            item.status === 'completed' ? '#5A8A6E' :
            item.status === 'in_progress' ? ACCENT : '#9C9790';
          return (
            <View
              key={item.id}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
            >
              <IconSymbol
                name={item.status === 'completed' ? 'checkmark.circle.fill' : item.status === 'in_progress' ? 'arrow.triangle.2.circlepath' : 'circle' as any}
                size={18}
                color={statusColor}
              />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {item.label}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {item.status === 'completed'
                    ? `Completed: ${item.completedDate}`
                    : item.status === 'in_progress'
                    ? 'In progress'
                    : 'Not started'}
                </ThemedText>
              </View>
            </View>
          );
        })}
      </SectionCard>

      {/* Action Buttons */}
      <View style={styles.actionButtonGrid}>
        {seniorPastor && <ActionButton label="Create Task" icon="plus.circle.fill" colors={colors} />}
        <ActionButton label="Mark Complete" icon="checkmark.circle.fill" colors={colors} />
      </View>
    </View>
  );
}

// =============================================================================
// TAB 6: MESSAGES
// =============================================================================

function MessagesTab({
  member,
  colors,
  seniorPastor,
}: {
  member: ChurchMember;
  colors: typeof Colors.light;
  seniorPastor: boolean;
}) {
  return (
    <View>
      {/* Message Threads */}
      <SectionCard title="Message Threads" colors={colors}>
        {MEMBER_MESSAGE_THREADS.map((thread) => (
          <Pressable
            key={thread.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.threadHeaderRow}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {thread.roomName}
                </ThemedText>
                {thread.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <ThemedText style={styles.unreadBadgeText}>
                      {thread.unread}
                    </ThemedText>
                  </View>
                )}
              </View>
              <ThemedText style={[styles.bodyText, { color: colors.textSecondary }]} numberOfLines={1}>
                {thread.lastMessage}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textTertiary }]}>
                {thread.date}
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </Pressable>
        ))}
      </SectionCard>

      {/* Action Buttons */}
      <View style={styles.actionButtonGrid}>
        <ActionButton label="Open Thread" icon="bubble.left.fill" colors={colors} />
        {seniorPastor && <ActionButton label="Add to Room" icon="person.badge.plus" colors={colors} />}
      </View>
    </View>
  );
}

// =============================================================================
// TAB 7: SAFETY + COMPLIANCE (high sensitivity)
// =============================================================================

function SafetyComplianceTab({
  member,
  colors,
  seniorPastor,
}: {
  member: ChurchMember;
  colors: typeof Colors.light;
  seniorPastor: boolean;
}) {
  const incidents = CHURCH_INCIDENTS.filter((inc) => {
    const assignments = VOLUNTEER_ASSIGNMENTS.filter((a) => a.memberId === member.id);
    const serviceIds = assignments.map((a) => a.serviceId);
    return serviceIds.includes(inc.serviceId);
  });

  return (
    <View>
      {/* Background Check Status */}
      <SectionCard title="Background Check" colors={colors}>
        <View style={styles.statRow}>
          <StatBlock
            label="Status"
            value={member.safetyClearance.charAt(0).toUpperCase() + member.safetyClearance.slice(1)}
            color={SAFETY_STATUS_COLORS[member.safetyClearance] ?? '#9C9790'}
            colors={colors}
          />
          <StatBlock
            label="Child Safety"
            value={member.safetyClearance === 'cleared' ? 'Cleared' : 'Not Cleared'}
            color={member.safetyClearance === 'cleared' ? '#5A8A6E' : '#B85C5C'}
            colors={colors}
          />
          <StatBlock
            label="Incidents"
            value="0"
            color="#5A8A6E"
            colors={colors}
          />
        </View>
      </SectionCard>

      {/* Training Completion Checklist */}
      <SectionCard title="Training Completion" colors={colors}>
        {TRAINING_CHECKLIST_ITEMS.map((item) => {
          const isCompleted = member.safetyClearance === 'cleared'; // simplified check
          return (
            <View
              key={item.id}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
            >
              <IconSymbol
                name={isCompleted ? 'checkmark.circle.fill' : 'circle' as any}
                size={18}
                color={isCompleted ? '#5A8A6E' : colors.textTertiary}
              />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {item.label}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {item.required ? 'Required' : 'Recommended'}
                </ThemedText>
              </View>
            </View>
          );
        })}
      </SectionCard>

      {/* Incident Flags */}
      <SectionCard title="Incident History" colors={colors}>
        {incidents.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No incidents associated with this member
          </ThemedText>
        ) : (
          incidents.map((inc) => (
            <View
              key={inc.id}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
            >
              <View
                style={[
                  styles.incidentTypeBadge,
                  { backgroundColor: (INCIDENT_TYPE_COLORS[inc.type] ?? '#9C9790') + '22' },
                ]}
              >
                <ThemedText
                  style={[
                    styles.incidentTypeText,
                    { color: INCIDENT_TYPE_COLORS[inc.type] ?? '#9C9790' },
                  ]}
                >
                  {inc.type.replace('_', ' ').toUpperCase()}
                </ThemedText>
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {inc.title}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {inc.date} · {inc.sensitivity}
                </ThemedText>
              </View>
            </View>
          ))
        )}
      </SectionCard>

      {/* Senior Pastor Actions */}
      {seniorPastor && (
        <View style={styles.actionButtonGrid}>
          <ActionButton label="Request Background Check" icon="shield.fill" colors={colors} />
          <ActionButton label="Restrict from Children's" icon="exclamationmark.shield.fill" colors={colors} />
          <ActionButton label="Create Incident Report" icon="doc.badge.plus" colors={colors} />
        </View>
      )}
    </View>
  );
}

// =============================================================================
// TAB 8: ADMIN (Senior Pastor only)
// =============================================================================

function AdminTab({
  member,
  colors,
  seniorPastor,
}: {
  member: ChurchMember;
  colors: typeof Colors.light;
  seniorPastor: boolean;
}) {
  return (
    <View>
      {/* Membership Lifecycle */}
      <SectionCard title="Membership Lifecycle" colors={colors}>
        <InfoRow label="Member Since" value={member.type === 'visitor' ? 'N/A (Visitor)' : 'Dec 2020'} colors={colors} />
        <InfoRow label="Baptism Date" value={member.baptized ? 'Jun 15, 2021' : 'Not baptized'} colors={colors} />
        <InfoRow label="Current Status" value={member.status.replace('_', ' ').charAt(0).toUpperCase() + member.status.replace('_', ' ').slice(1)} colors={colors} />
        <InfoRow label="Membership Class" value={member.membershipStatus === 'full' ? 'Completed' : member.membershipStatus === 'provisional' ? 'In Progress' : 'Not Started'} colors={colors} />
        <InfoRow label="Last Status Change" value="Jan 5, 2026" colors={colors} />
      </SectionCard>

      {/* Consent Forms Status */}
      <SectionCard title="Consent Forms" colors={colors}>
        <View style={[styles.listRow, { borderBottomColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
              Photo / Video Consent
            </ThemedText>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
              Allows use of member photos and video in church media
            </ThemedText>
          </View>
          <View style={[styles.consentBadge, { backgroundColor: '#5A8A6E22' }]}>
            <ThemedText style={[styles.consentBadgeText, { color: '#5A8A6E' }]}>
              APPROVED
            </ThemedText>
          </View>
        </View>
        <View style={[styles.listRow, { borderBottomColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
              Child Pickup Authorization
            </ThemedText>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
              Authorized individuals for child release
            </ThemedText>
          </View>
          <View style={[styles.consentBadge, { backgroundColor: member.type === 'visitor' ? '#9C979022' : '#B8943E22' }]}>
            <ThemedText style={[styles.consentBadgeText, { color: member.type === 'visitor' ? '#9C9790' : '#B8943E' }]}>
              {member.type === 'visitor' ? 'N/A' : 'PENDING'}
            </ThemedText>
          </View>
        </View>
        <View style={[styles.listRow, { borderBottomColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
              Data Privacy Consent
            </ThemedText>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
              Acknowledgment of data handling practices
            </ThemedText>
          </View>
          <View style={[styles.consentBadge, { backgroundColor: '#5A8A6E22' }]}>
            <ThemedText style={[styles.consentBadgeText, { color: '#5A8A6E' }]}>
              APPROVED
            </ThemedText>
          </View>
        </View>
      </SectionCard>

      {/* Documentation Checklist */}
      <SectionCard title="Documentation Checklist" colors={colors}>
        {[
          { label: 'Photo consent form', done: true },
          { label: 'Emergency contact info', done: true },
          { label: 'Membership application', done: member.membershipStatus === 'full' },
          { label: 'Baptism certificate', done: member.baptized },
          { label: 'Background check authorization', done: member.safetyClearance === 'cleared' },
          { label: 'Volunteer agreement', done: member.type === 'volunteer' || member.type === 'leader' },
        ].map((item, idx) => (
          <View
            key={idx}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <IconSymbol
              name={item.done ? 'checkmark.circle.fill' : 'circle' as any}
              size={18}
              color={item.done ? '#5A8A6E' : colors.textTertiary}
            />
            <ThemedText style={[styles.bodyText, { color: colors.text, marginLeft: Spacing.sm }]}>
              {item.label}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* Action Buttons */}
      <View style={styles.actionButtonGrid}>
        <ActionButton label="Request Form" icon="doc.badge.plus" colors={colors} />
        {seniorPastor && <ActionButton label="Approve Form" icon="checkmark.seal.fill" colors={colors} />}
      </View>
    </View>
  );
}

// =============================================================================
// TAB 9: GIVING (Senior Pastor only)
// =============================================================================

function GivingTab({
  member,
  colors,
}: {
  member: ChurchMember;
  colors: typeof Colors.light;
}) {
  return (
    <View>
      {/* Giving History */}
      <SectionCard title="Giving History" colors={colors}>
        {/* Table Header */}
        <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
          <ThemedText style={[styles.tableHeaderCell, { flex: 1, color: colors.textTertiary }]}>
            Month
          </ThemedText>
          <ThemedText style={[styles.tableHeaderCell, { width: 80, textAlign: 'right', color: colors.textTertiary }]}>
            Amount
          </ThemedText>
          <ThemedText style={[styles.tableHeaderCell, { width: 80, textAlign: 'right', color: colors.textTertiary }]}>
            Type
          </ThemedText>
        </View>
        {MEMBER_GIVING_MOCK.map((record) => (
          <View
            key={record.id}
            style={[styles.tableRow, { borderBottomColor: colors.border }]}
          >
            <ThemedText style={[styles.tableCell, { flex: 1, color: colors.textSecondary }]}>
              {record.month}
            </ThemedText>
            <ThemedText style={[styles.tableCell, { width: 80, textAlign: 'right', color: colors.text, fontWeight: '600' }]}>
              {record.amount}
            </ThemedText>
            <ThemedText style={[styles.tableCell, { width: 80, textAlign: 'right', color: colors.textSecondary }]}>
              {record.type}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* Pledges */}
      <SectionCard title="Active Pledges" colors={colors}>
        {MEMBER_PLEDGES.map((pledge) => (
          <View
            key={pledge.id}
            style={[styles.pledgeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
              {pledge.name}
            </ThemedText>
            <View style={styles.pledgeRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  Pledged: {pledge.pledged}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: '#5A8A6E' }]}>
                  Given: {pledge.given}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: '#B8943E' }]}>
                  Remaining: {pledge.remaining}
                </ThemedText>
              </View>
              <ThemedText style={[styles.captionText, { color: colors.textTertiary }]}>
                Due: {pledge.deadline}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>

      {/* Restricted Note */}
      <SectionCard title="Restricted Notes" colors={colors}>
        <ThemedText style={[styles.bodyText, { color: colors.textSecondary }]}>
          Giving data is confidential and visible only to the Senior Pastor and authorized finance team members. Do not share or export without pastoral approval.
        </ThemedText>
      </SectionCard>

      {/* Action Buttons */}
      <View style={styles.actionButtonGrid}>
        <ActionButton label="Export Giving Summary" icon="doc.fill" colors={colors} />
      </View>
    </View>
  );
}

// =============================================================================
// SHARED UI COMPONENTS
// =============================================================================

function ActionIcon({
  icon,
  label,
  colors,
}: {
  icon: string;
  label: string;
  colors: typeof Colors.light;
}) {
  return (
    <Pressable style={styles.actionIconWrap}>
      <View style={[styles.actionIconCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name={icon as any} size={16} color={colors.textSecondary} />
      </View>
      <ThemedText style={[styles.actionIconLabel, { color: colors.textSecondary }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function SectionCard({
  title,
  colors,
  children,
}: {
  title: string;
  colors: typeof Colors.light;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{title}</ThemedText>
      {children}
    </View>
  );
}

function StatBlock({
  label,
  value,
  color,
  colors,
  small,
}: {
  label: string;
  value: string;
  color: string;
  colors: typeof Colors.light;
  small?: boolean;
}) {
  return (
    <View style={styles.statBlock}>
      <ThemedText style={[small ? styles.statValueSmall : styles.statValue, { color }]}>{value}</ThemedText>
      <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  colors,
}: {
  label: string;
  icon: string;
  colors: typeof Colors.light;
}) {
  return (
    <Pressable style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <IconSymbol name={icon as any} size={16} color={colors.textSecondary} />
      <ThemedText style={[styles.actionButtonText, { color: colors.textSecondary }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function InfoRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
      <ThemedText style={[styles.infoValue, { color: colors.text }]}>{value}</ThemedText>
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

  // Header
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '700',
  },
  memberName: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  orgLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  typePill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  safetyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  safetyPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: Spacing.lg,
    marginTop: Spacing.md,
    flexWrap: 'wrap',
  },
  actionIconWrap: {
    alignItems: 'center',
    gap: 4,
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconLabel: {
    fontSize: 10,
  },

  // Tab bar
  tabBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  tabPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Scroll content
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Section card
  sectionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },

  // Text styles
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  captionText: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
  },

  // Info row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 120,
  },
  infoValue: {
    fontSize: 13,
    flex: 1,
    textAlign: 'right',
  },

  // Stat row
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBlock: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statValueSmall: {
    fontSize: 13,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // List row
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  listRowTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Ministry badges
  ministryStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  ministryStatusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Attendance
  attendanceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Assignment badges
  assignmentStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  assignmentStatusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Care tags
  careTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  careTagText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Follow-up card
  followUpCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  followUpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  followUpCategoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  followUpCategoryText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Task badges
  taskStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  taskStatusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Message threads
  threadHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  unreadBadge: {
    backgroundColor: '#B85C5C',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Incident badges
  incidentTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  incidentTypeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Consent badges
  consentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  consentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Table
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    marginBottom: Spacing.xs,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tableCell: {
    fontSize: 13,
  },

  // Pledge card
  pledgeCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  pledgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },

  // Action buttons
  actionButtonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
