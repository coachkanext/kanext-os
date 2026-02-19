/**
 * Universal Ministry Sheet — Church Mode
 * Ministry "truth page" with up to 8 RBAC-gated tabs.
 * This is the CONTENT component — the parent handles the bottom sheet wrapper.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import {
  type Ministry,
  type ChurchMember,
  type MinistryNote,
  type ServiceEvent,
  type OpsChecklist,
  CHURCH_MEMBERS,
  SERVICE_EVENTS,
  MINISTRY_NOTES,
  OPS_CHECKLISTS,
  VOLUNTEER_ASSIGNMENTS,
  getMinistriesByOrg,
  getMembersByMinistry,
} from '@/data/mock-church-v2';

import {
  type ChurchRoleLens,
  type MinistryTab,
  getMinistrySheetTabs,
  isSeniorPastor,
  isMinistryLevel,
} from '@/utils/church-rbac';

// =============================================================================
// PROPS
// =============================================================================

interface UniversalMinistrySheetProps {
  ministry: Ministry;
  roleLens: ChurchRoleLens;
  onClose: () => void;
  onSelectMember?: (memberId: string) => void;
}

// =============================================================================
// STATUS / COLOR HELPERS
// =============================================================================

const MINISTRY_STATUS_COLORS: Record<string, string> = {
  active: '#22C55E',
  seasonal: '#6AA9FF',
  paused: '#8F8F8F',
};

const BUDGET_STATUS_COLORS: Record<string, string> = {
  on_track: '#22C55E',
  over_budget: '#EF4444',
  under_budget: '#6AA9FF',
};

const CONTENT_TYPE_COLORS: Record<string, string> = {
  lesson_plan: '#A78BFA',
  announcement: '#6AA9FF',
  media_asset: '#F59E0B',
};

// =============================================================================
// INLINE MOCK DATA (for tabs not fully covered in mock-church-v2)
// =============================================================================

const MINISTRY_SCHEDULE = [
  { id: 'ms-1', title: 'Sunday Service (Children)', date: 'Feb 23, 2026', time: '10:00 AM', location: 'Fellowship Hall B', staffingStatus: '5/6 filled' },
  { id: 'ms-2', title: 'Sunday Service (Children)', date: 'Mar 1, 2026', time: '10:00 AM', location: 'Fellowship Hall B', staffingStatus: '4/6 filled' },
  { id: 'ms-3', title: 'Wednesday Bible Club', date: 'Feb 25, 2026', time: '6:30 PM', location: 'Room 204', staffingStatus: '3/3 filled' },
  { id: 'ms-4', title: 'VBS Planning Meeting', date: 'Mar 1, 2026', time: '2:00 PM', location: 'Conference Room', staffingStatus: 'N/A' },
  { id: 'ms-5', title: 'Volunteer Training Session', date: 'Mar 8, 2026', time: '9:00 AM', location: 'Fellowship Hall B', staffingStatus: 'N/A' },
];

const MINISTRY_OPS_TASKS = [
  { id: 'mot-1', title: 'Replace projector in Room 204', status: 'open', owner: 'Facilities Team', category: 'equipment', dueDate: 'Feb 28, 2026' },
  { id: 'mot-2', title: 'Order craft supplies for Q2', status: 'in_progress', owner: 'Sis. Angela Foster', category: 'supplies', dueDate: 'Mar 5, 2026' },
  { id: 'mot-3', title: 'Update check-in iPad software', status: 'completed', owner: 'IT Team', category: 'tech', dueDate: 'Feb 15, 2026' },
  { id: 'mot-4', title: 'Deep clean children\'s rooms', status: 'open', owner: 'Cleaning Team', category: 'room', dueDate: 'Feb 22, 2026' },
];

const MINISTRY_BLOCKERS = [
  { id: 'mb-1', title: 'Background check pending for 1 volunteer', severity: 'high', owner: 'Admin Team', createdDate: 'Feb 10, 2026' },
];

const MINISTRY_SAFETY_DATA = {
  trainingCompletionPct: 78,
  backgroundChecksPending: 1,
  childPickupPolicyItems: [
    { id: 'cp-1', label: 'Digital check-in/out system active', completed: true },
    { id: 'cp-2', label: 'Photo ID required for unfamiliar pickups', completed: true },
    { id: 'cp-3', label: 'Authorized pickup list updated (all families)', completed: false },
    { id: 'cp-4', label: 'Emergency contact forms on file', completed: true },
    { id: 'cp-5', label: 'Two-adult rule enforced in all rooms', completed: true },
    { id: 'cp-6', label: 'Incident response protocol posted', completed: true },
  ],
};

const MINISTRY_BUDGET_DATA = [
  { id: 'mb-1', category: 'Curriculum & Materials', allocated: 4800, spent: 2100, status: 'on_track' },
  { id: 'mb-2', category: 'VBS 2026', allocated: 3200, spent: 450, status: 'on_track' },
  { id: 'mb-3', category: 'Supplies & Crafts', allocated: 1800, spent: 1200, status: 'on_track' },
  { id: 'mb-4', category: 'Equipment', allocated: 2000, spent: 2400, status: 'over_budget' },
  { id: 'mb-5', category: 'Events & Outings', allocated: 1500, spent: 300, status: 'under_budget' },
];

const MINISTRY_CONTENT_ASSETS = [
  { id: 'mca-1', title: 'Q1 Curriculum: Heroes of Faith', type: 'lesson_plan', date: 'Jan 5, 2026', url: '/content/children/q1-curriculum' },
  { id: 'mca-2', title: 'VBS 2026 Theme Announcement', type: 'announcement', date: 'Feb 14, 2026', url: '/content/children/vbs-announcement' },
  { id: 'mca-3', title: 'Parent Welcome Video', type: 'media_asset', date: 'Jan 12, 2026', url: '/content/children/parent-welcome' },
  { id: 'mca-4', title: 'Volunteer Orientation Guide', type: 'lesson_plan', date: 'Dec 15, 2025', url: '/content/children/volunteer-guide' },
  { id: 'mca-5', title: 'Easter Program Flyer', type: 'announcement', date: 'Feb 18, 2026', url: '/content/children/easter-flyer' },
];

const ONBOARDING_PIPELINE = [
  { id: 'op-1', name: 'Chioma Eze', stage: 'Background Check', progress: 'Pending', startDate: 'Feb 5, 2026' },
  { id: 'op-2', name: 'New Recruit (Mar)', stage: 'Application', progress: 'Not Started', startDate: 'Mar 1, 2026' },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function UniversalMinistrySheet({
  ministry,
  roleLens,
  onClose,
  onSelectMember,
}: UniversalMinistrySheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const tabs = useMemo(() => getMinistrySheetTabs(roleLens), [roleLens]);
  const [activeTab, setActiveTab] = useState<MinistryTab>(tabs[0]?.id ?? 'overview');

  const seniorPastor = isSeniorPastor(roleLens);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <MinistryHeader
        ministry={ministry}
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
          <OverviewTab ministry={ministry} colors={colors} />
        )}
        {activeTab === 'people' && (
          <PeopleTab ministry={ministry} colors={colors} seniorPastor={seniorPastor} onSelectMember={onSelectMember} />
        )}
        {activeTab === 'schedule' && (
          <ScheduleTab ministry={ministry} colors={colors} />
        )}
        {activeTab === 'operations' && (
          <OperationsTab ministry={ministry} colors={colors} />
        )}
        {activeTab === 'safety_compliance' && (
          <SafetyComplianceTab ministry={ministry} colors={colors} seniorPastor={seniorPastor} />
        )}
        {activeTab === 'budget' && (
          <BudgetTab ministry={ministry} colors={colors} />
        )}
        {activeTab === 'content_media' && (
          <ContentMediaTab ministry={ministry} colors={colors} />
        )}
        {activeTab === 'notes' && (
          <NotesTab ministry={ministry} colors={colors} />
        )}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// HEADER
// =============================================================================

function MinistryHeader({
  ministry,
  colors,
  seniorPastor,
  onClose,
}: {
  ministry: Ministry;
  colors: typeof Colors.light;
  seniorPastor: boolean;
  onClose: () => void;
}) {
  const campusLabel = 'ICCLA';

  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      {/* Top row: name + close */}
      <View style={styles.headerTopRow}>
        <View style={{ flex: 1 }}>
          <ThemedText style={[styles.ministryName, { color: colors.text }]}>
            {ministry.name}
          </ThemedText>
          <ThemedText style={[styles.campusLabel, { color: colors.textSecondary }]}>
            {ministry.campus}
          </ThemedText>
        </View>
        <Pressable onPress={onClose} hitSlop={12}>
          <IconSymbol name="xmark" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Pills: campus + status */}
      <View style={styles.pillRow}>
        <View style={[styles.campusPill, { backgroundColor: '#6AA9FF1A' }]}>
          <ThemedText style={[styles.campusPillText, { color: '#6AA9FF' }]}>
            {campusLabel}
          </ThemedText>
        </View>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: (MINISTRY_STATUS_COLORS[ministry.status] ?? '#8F8F8F') + '1A' },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: MINISTRY_STATUS_COLORS[ministry.status] ?? '#8F8F8F' },
            ]}
          />
          <ThemedText
            style={[
              styles.statusPillText,
              { color: MINISTRY_STATUS_COLORS[ministry.status] ?? '#8F8F8F' },
            ]}
          >
            {ministry.status.charAt(0).toUpperCase() + ministry.status.slice(1)}
          </ThemedText>
        </View>
      </View>

      {/* Quick Metrics */}
      <View style={styles.quickMetricRow}>
        <View style={styles.quickMetric}>
          <ThemedText style={[styles.quickMetricValue, { color: colors.text }]}>
            {ministry.activeVolunteers}
          </ThemedText>
          <ThemedText style={[styles.quickMetricLabel, { color: colors.textSecondary }]}>
            Volunteers
          </ThemedText>
        </View>
        <View style={styles.quickMetric}>
          <ThemedText style={[styles.quickMetricValue, { color: colors.text }]}>
            {ministry.upcomingEvents}
          </ThemedText>
          <ThemedText style={[styles.quickMetricLabel, { color: colors.textSecondary }]}>
            Events
          </ThemedText>
        </View>
        {seniorPastor && (
          <View style={styles.quickMetric}>
            <ThemedText
              style={[
                styles.quickMetricValue,
                { color: ministry.openBlockers > 0 ? '#EF4444' : '#22C55E' },
              ]}
            >
              {ministry.openBlockers}
            </ThemedText>
            <ThemedText style={[styles.quickMetricLabel, { color: colors.textSecondary }]}>
              Blockers
            </ThemedText>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <ActionIcon icon="bubble.left.fill" label="Msg Room" colors={colors} />
        <ActionIcon icon="calendar.badge.plus" label="Create Event" colors={colors} />
        <ActionIcon icon="hands.sparkles.fill" label="Request" colors={colors} />
        <ActionIcon icon="doc.fill" label="Export" colors={colors} />
      </View>
    </View>
  );
}

// =============================================================================
// TAB 1: OVERVIEW
// =============================================================================

function OverviewTab({
  ministry,
  colors,
}: {
  ministry: Ministry;
  colors: typeof Colors.light;
}) {
  return (
    <View>
      {/* Mission Statement */}
      <SectionCard title="Mission Statement" colors={colors}>
        <ThemedText style={[styles.bodyText, { color: colors.text }]}>
          {ministry.mission}
        </ThemedText>
      </SectionCard>

      {/* Current Goals */}
      <SectionCard title="Current Goals" colors={colors}>
        {ministry.goals.map((goal, idx) => (
          <View
            key={idx}
            style={[styles.goalRow, { borderBottomColor: colors.border }]}
          >
            <View style={[styles.goalBullet, { backgroundColor: '#6AA9FF' }]} />
            <ThemedText style={[styles.bodyText, { color: colors.text, flex: 1 }]}>
              {goal}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* Weekly Cadence */}
      <SectionCard title="Weekly Cadence" colors={colors}>
        <ThemedText style={[styles.bodyText, { color: colors.text }]}>
          Sunday 10:00 AM service, Wednesday 6:30 PM Bible club, Saturday volunteer prep as needed
        </ThemedText>
      </SectionCard>

      {/* Top Needs */}
      <SectionCard title="Top Needs" colors={colors}>
        {[
          { label: 'Volunteers', detail: `${ministry.activeVolunteers} active, need ${ministry.activeVolunteers + 3} for full coverage` },
          { label: 'Supplies', detail: 'Craft supplies running low for Q2 programming' },
          { label: 'Rooms', detail: 'Room 204 projector needs replacement' },
        ].map((need, idx) => (
          <View
            key={idx}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <IconSymbol name="exclamationmark.circle.fill" size={16} color="#F59E0B" />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {need.label}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {need.detail}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 2: PEOPLE
// =============================================================================

function PeopleTab({
  ministry,
  colors,
  seniorPastor,
  onSelectMember,
}: {
  ministry: Ministry;
  colors: typeof Colors.light;
  seniorPastor: boolean;
  onSelectMember?: (memberId: string) => void;
}) {
  const members = getMembersByMinistry(ministry.id);
  const leaders = members.filter((m) => m.type === 'leader' || m.type === 'staff');
  const volunteers = members.filter((m) => m.type === 'volunteer');

  return (
    <View>
      {/* Leaders */}
      <SectionCard title="Leaders" colors={colors}>
        {leaders.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No leaders assigned
          </ThemedText>
        ) : (
          leaders.map((leader) => (
            <Pressable
              key={leader.id}
              style={[styles.personRow, { borderBottomColor: colors.border }]}
              onPress={() => onSelectMember?.(leader.id)}
            >
              <View style={[styles.personAvatar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ThemedText style={[styles.personAvatarText, { color: colors.textSecondary }]}>
                  {leader.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {leader.name}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {leader.type === 'staff' ? 'Staff' : 'Ministry Lead'} · {leader.safetyClearance === 'cleared' ? 'Cleared' : 'Pending'}
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
            </Pressable>
          ))
        )}
      </SectionCard>

      {/* Volunteers */}
      <SectionCard title="Volunteers" colors={colors}>
        {volunteers.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No volunteers assigned
          </ThemedText>
        ) : (
          volunteers.map((vol) => (
            <Pressable
              key={vol.id}
              style={[styles.personRow, { borderBottomColor: colors.border }]}
              onPress={() => onSelectMember?.(vol.id)}
            >
              <View style={[styles.personAvatar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ThemedText style={[styles.personAvatarText, { color: colors.textSecondary }]}>
                  {vol.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {vol.name}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  Volunteer · Safety: {vol.safetyClearance}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.safetyBadge,
                  {
                    backgroundColor:
                      vol.safetyClearance === 'cleared' ? '#22C55E22' :
                      vol.safetyClearance === 'pending' ? '#F59E0B22' : '#EF444422',
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.safetyBadgeText,
                    {
                      color:
                        vol.safetyClearance === 'cleared' ? '#22C55E' :
                        vol.safetyClearance === 'pending' ? '#F59E0B' : '#EF4444',
                    },
                  ]}
                >
                  {vol.safetyClearance.toUpperCase()}
                </ThemedText>
              </View>
            </Pressable>
          ))
        )}
      </SectionCard>

      {/* Onboarding Pipeline */}
      <SectionCard title="Onboarding Pipeline" colors={colors}>
        {ONBOARDING_PIPELINE.map((item) => (
          <View
            key={item.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {item.name}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                Stage: {item.stage} · {item.progress} · Started: {item.startDate}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>

      {/* Action Buttons */}
      <View style={styles.actionButtonGrid}>
        <ActionButton label="Invite Volunteer" icon="person.badge.plus" colors={colors} />
        {seniorPastor && <ActionButton label="Assign Role" icon="person.fill.checkmark" colors={colors} />}
      </View>
    </View>
  );
}

// =============================================================================
// TAB 3: SCHEDULE
// =============================================================================

function ScheduleTab({
  ministry,
  colors,
}: {
  ministry: Ministry;
  colors: typeof Colors.light;
}) {
  const services = SERVICE_EVENTS.filter((s) => s.ministryId === ministry.id);

  return (
    <View>
      {/* Upcoming Events */}
      <SectionCard title="Upcoming Events / Services" colors={colors}>
        {MINISTRY_SCHEDULE.map((evt) => (
          <View
            key={evt.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View style={[styles.calendarIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[styles.calendarDay, { color: colors.text }]}>
                {evt.date.split(',')[0].split(' ').slice(-1)[0]}
              </ThemedText>
              <ThemedText style={[styles.calendarMonth, { color: colors.textSecondary }]}>
                {evt.date.split(' ')[0].slice(0, 3)}
              </ThemedText>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {evt.title}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {evt.time} · {evt.location}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textTertiary }]}>
                Staffing: {evt.staffingStatus}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>

      {/* Staffing Assignments per Event */}
      <SectionCard title="Staffing Assignments" colors={colors}>
        {services.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No services linked to this ministry
          </ThemedText>
        ) : (
          services.map((svc) => {
            const assigns = VOLUNTEER_ASSIGNMENTS.filter((a) => a.serviceId === svc.id);
            return (
              <View key={svc.id} style={{ marginBottom: Spacing.sm }}>
                <ThemedText style={[styles.subSectionTitle, { color: colors.text }]}>
                  {svc.title} ({svc.date})
                </ThemedText>
                {assigns.length === 0 ? (
                  <ThemedText style={[styles.captionText, { color: colors.textTertiary, marginLeft: Spacing.sm }]}>
                    No assignments yet
                  </ThemedText>
                ) : (
                  assigns.map((a) => {
                    const member = CHURCH_MEMBERS.find((m) => m.id === a.memberId);
                    return (
                      <View
                        key={a.id}
                        style={[styles.assignRow, { borderBottomColor: colors.border }]}
                      >
                        <ThemedText style={[styles.captionText, { color: colors.textSecondary, width: 80 }]}>
                          {a.role.replace('_', ' ')}
                        </ThemedText>
                        <ThemedText style={[styles.bodyText, { color: colors.text, flex: 1 }]}>
                          {member?.name ?? 'Unknown'}
                        </ThemedText>
                        <View
                          style={[
                            styles.assignStatusBadge,
                            { backgroundColor: a.status === 'confirmed' ? '#22C55E22' : '#F59E0B22' },
                          ]}
                        >
                          <ThemedText
                            style={[
                              styles.assignStatusText,
                              { color: a.status === 'confirmed' ? '#22C55E' : '#F59E0B' },
                            ]}
                          >
                            {a.status.toUpperCase()}
                          </ThemedText>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            );
          })
        )}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 4: OPERATIONS
// =============================================================================

function OperationsTab({
  ministry,
  colors,
}: {
  ministry: Ministry;
  colors: typeof Colors.light;
}) {
  const checklists = OPS_CHECKLISTS.filter((c) => {
    const svc = SERVICE_EVENTS.find((s) => s.ministryId === ministry.id);
    return svc ? c.serviceId === svc.id : false;
  });

  const openTasks = MINISTRY_OPS_TASKS.filter((t) => t.status !== 'completed');
  const completedTasks = MINISTRY_OPS_TASKS.filter((t) => t.status === 'completed');

  return (
    <View>
      {/* Checklists */}
      <SectionCard title="Checklists" colors={colors}>
        {checklists.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No checklists for current services
          </ThemedText>
        ) : (
          checklists.map((item) => (
            <View
              key={item.id}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
            >
              <IconSymbol
                name={item.completed ? 'checkmark.circle.fill' : 'circle' as any}
                size={18}
                color={item.completed ? '#22C55E' : colors.textTertiary}
              />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <ThemedText style={[styles.bodyText, { color: colors.text }]}>
                  {item.item}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {item.category.toUpperCase()} {item.assignee ? `· ${item.assignee}` : ''}
                </ThemedText>
              </View>
            </View>
          ))
        )}
      </SectionCard>

      {/* Open Tasks */}
      <SectionCard title="Open Tasks" colors={colors}>
        {openTasks.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            All tasks completed
          </ThemedText>
        ) : (
          openTasks.map((task) => (
            <View
              key={task.id}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
            >
              <View
                style={[
                  styles.opsTaskBadge,
                  { backgroundColor: task.status === 'open' ? '#F59E0B22' : '#6AA9FF22' },
                ]}
              >
                <ThemedText
                  style={[
                    styles.opsTaskBadgeText,
                    { color: task.status === 'open' ? '#F59E0B' : '#6AA9FF' },
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
                  {task.owner} · {task.category} · Due: {task.dueDate}
                </ThemedText>
              </View>
            </View>
          ))
        )}
      </SectionCard>

      {/* Completed Tasks */}
      <SectionCard title="Completed Tasks" colors={colors}>
        {completedTasks.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No completed tasks
          </ThemedText>
        ) : (
          completedTasks.map((task) => (
            <View
              key={task.id}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
            >
              <IconSymbol name="checkmark.circle.fill" size={18} color="#22C55E" />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {task.title}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {task.owner} · {task.category}
                </ThemedText>
              </View>
            </View>
          ))
        )}
      </SectionCard>

      {/* Blockers */}
      {MINISTRY_BLOCKERS.length > 0 && (
        <SectionCard title="Blockers" colors={colors}>
          {MINISTRY_BLOCKERS.map((blocker) => (
            <View
              key={blocker.id}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
            >
              <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#EF4444" />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {blocker.title}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  Severity: {blocker.severity} · Owner: {blocker.owner} · Created: {blocker.createdDate}
                </ThemedText>
              </View>
            </View>
          ))}
        </SectionCard>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtonGrid}>
        <ActionButton label="Create Ops Task" icon="plus.circle.fill" colors={colors} />
        <ActionButton label="Assign Owner" icon="person.badge.plus" colors={colors} />
      </View>
    </View>
  );
}

// =============================================================================
// TAB 5: SAFETY + COMPLIANCE
// =============================================================================

function SafetyComplianceTab({
  ministry,
  colors,
  seniorPastor,
}: {
  ministry: Ministry;
  colors: typeof Colors.light;
  seniorPastor: boolean;
}) {
  const data = MINISTRY_SAFETY_DATA;

  return (
    <View>
      {/* Training Completion */}
      <SectionCard title="Training Completion" colors={colors}>
        <View style={styles.statRow}>
          <StatBlock
            label="Completion"
            value={`${data.trainingCompletionPct}%`}
            color={data.trainingCompletionPct >= 80 ? '#22C55E' : '#F59E0B'}
            colors={colors}
          />
          <StatBlock
            label="BG Checks Pending"
            value={String(data.backgroundChecksPending)}
            color={data.backgroundChecksPending > 0 ? '#EF4444' : '#22C55E'}
            colors={colors}
          />
        </View>
      </SectionCard>

      {/* Background Checks */}
      <SectionCard title="Background Checks Pending" colors={colors}>
        {data.backgroundChecksPending === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            All background checks cleared
          </ThemedText>
        ) : (
          <View style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#EF4444" />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                1 volunteer awaiting background check results
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                Submitted: Feb 5, 2026 · Expected: Feb 25, 2026
              </ThemedText>
            </View>
          </View>
        )}
      </SectionCard>

      {/* Child Pickup Policy Checklist (kids ministry) */}
      <SectionCard title="Child Pickup Policy Checklist" colors={colors}>
        {data.childPickupPolicyItems.map((item) => (
          <View
            key={item.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <IconSymbol
              name={item.completed ? 'checkmark.circle.fill' : 'circle' as any}
              size={18}
              color={item.completed ? '#22C55E' : colors.textTertiary}
            />
            <ThemedText style={[styles.bodyText, { color: colors.text, flex: 1, marginLeft: Spacing.sm }]}>
              {item.label}
            </ThemedText>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 6: BUDGET (Senior Pastor only)
// =============================================================================

function BudgetTab({
  ministry,
  colors,
}: {
  ministry: Ministry;
  colors: typeof Colors.light;
}) {
  const totalAllocated = MINISTRY_BUDGET_DATA.reduce((sum, b) => sum + b.allocated, 0);
  const totalSpent = MINISTRY_BUDGET_DATA.reduce((sum, b) => sum + b.spent, 0);
  const remaining = totalAllocated - totalSpent;

  return (
    <View>
      {/* Budget Summary */}
      <SectionCard title="Budget Summary" colors={colors}>
        <View style={styles.financeGrid}>
          <FinanceCard
            label="Allocated"
            value={`$${(totalAllocated / 1000).toFixed(1)}K`}
            subtitle="Annual budget"
            color="#6AA9FF"
            colors={colors}
          />
          <FinanceCard
            label="Spent"
            value={`$${(totalSpent / 1000).toFixed(1)}K`}
            subtitle="Year to date"
            color={totalSpent > totalAllocated ? '#EF4444' : '#F59E0B'}
            colors={colors}
          />
        </View>
        <View style={[styles.budgetRemaining, { marginTop: Spacing.sm }]}>
          <ThemedText style={[styles.captionText, { color: remaining >= 0 ? '#22C55E' : '#EF4444' }]}>
            Remaining: ${(remaining / 1000).toFixed(1)}K
          </ThemedText>
        </View>
      </SectionCard>

      {/* Spend Categories */}
      <SectionCard title="Spend Categories" colors={colors}>
        {MINISTRY_BUDGET_DATA.map((item) => (
          <View
            key={item.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {item.category}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                Allocated: ${item.allocated.toLocaleString()} · Spent: ${item.spent.toLocaleString()}
              </ThemedText>
            </View>
            <View
              style={[
                styles.budgetStatusBadge,
                { backgroundColor: (BUDGET_STATUS_COLORS[item.status] ?? '#8F8F8F') + '22' },
              ]}
            >
              <ThemedText
                style={[
                  styles.budgetStatusText,
                  { color: BUDGET_STATUS_COLORS[item.status] ?? '#8F8F8F' },
                ]}
              >
                {item.status.replace('_', ' ').toUpperCase()}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>

      {/* Requests Pending */}
      <SectionCard title="Requests Pending" colors={colors}>
        <View style={[styles.listRow, { borderBottomColor: colors.border }]}>
          <IconSymbol name="clock.fill" size={16} color="#F59E0B" />
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
              VBS Additional Supplies Request
            </ThemedText>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
              $450 · Submitted Feb 18 · Awaiting pastoral approval
            </ThemedText>
          </View>
        </View>
        <View style={[styles.listRow, { borderBottomColor: colors.border }]}>
          <IconSymbol name="clock.fill" size={16} color="#F59E0B" />
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
              Sound Equipment Upgrade
            </ThemedText>
            <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
              $1,200 · Submitted Feb 10 · Under review
            </ThemedText>
          </View>
        </View>
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 7: CONTENT + MEDIA
// =============================================================================

function ContentMediaTab({
  ministry,
  colors,
}: {
  ministry: Ministry;
  colors: typeof Colors.light;
}) {
  return (
    <View>
      {/* Lesson Plans */}
      <SectionCard title="Lesson Plans" colors={colors}>
        {MINISTRY_CONTENT_ASSETS
          .filter((a) => a.type === 'lesson_plan')
          .map((asset) => (
            <Pressable
              key={asset.id}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
            >
              <IconSymbol name="doc.text.fill" size={18} color="#A78BFA" />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {asset.title}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {asset.date}
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
            </Pressable>
          ))}
      </SectionCard>

      {/* Announcements */}
      <SectionCard title="Announcements" colors={colors}>
        {MINISTRY_CONTENT_ASSETS
          .filter((a) => a.type === 'announcement')
          .map((asset) => (
            <Pressable
              key={asset.id}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
            >
              <IconSymbol name="megaphone.fill" size={18} color="#6AA9FF" />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {asset.title}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {asset.date}
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
            </Pressable>
          ))}
      </SectionCard>

      {/* Media Assets */}
      <SectionCard title="Media Assets" colors={colors}>
        {MINISTRY_CONTENT_ASSETS
          .filter((a) => a.type === 'media_asset')
          .map((asset) => (
            <Pressable
              key={asset.id}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
            >
              <IconSymbol name="play.rectangle.fill" size={18} color="#F59E0B" />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {asset.title}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {asset.date}
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
            </Pressable>
          ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 8: NOTES
// =============================================================================

function NotesTab({
  ministry,
  colors,
}: {
  ministry: Ministry;
  colors: typeof Colors.light;
}) {
  const notes = MINISTRY_NOTES.filter((n) => n.ministryId === ministry.id);

  return (
    <View>
      <SectionCard title="Ministry Notes" colors={colors}>
        {notes.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No notes recorded
          </ThemedText>
        ) : (
          notes.map((note) => {
            const author = CHURCH_MEMBERS.find((m) => m.id === note.author);
            return (
              <View
                key={note.id}
                style={[styles.noteCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.noteHeader}>
                  <ThemedText style={[styles.noteAuthor, { color: colors.text }]}>
                    {author?.name ?? note.author}
                  </ThemedText>
                  <ThemedText style={[styles.captionText, { color: colors.textTertiary }]}>
                    {note.date}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.bodyText, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                  {note.content}
                </ThemedText>
              </View>
            );
          })
        )}
      </SectionCard>
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
}: {
  label: string;
  value: string;
  color: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={styles.statBlock}>
      <ThemedText style={[styles.statValue, { color }]}>{value}</ThemedText>
      <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

function FinanceCard({
  label,
  value,
  subtitle,
  color,
  colors,
}: {
  label: string;
  value: string;
  subtitle: string;
  color: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={[styles.financeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
        {label}
      </ThemedText>
      <ThemedText style={[styles.financeValue, { color }]}>{value}</ThemedText>
      <ThemedText style={[styles.captionText, { color: colors.textTertiary }]}>
        {subtitle}
      </ThemedText>
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
  ministryName: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  campusLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  campusPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  campusPillText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  quickMetricRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  quickMetric: {
    alignItems: 'center',
  },
  quickMetricValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  quickMetricLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: Spacing.lg,
    marginTop: Spacing.md,
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
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
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

  // Goals
  goalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  goalBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },

  // Person row
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  personAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personAvatarText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Safety badge
  safetyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  safetyBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Calendar icon
  calendarIcon: {
    width: 40,
    height: 44,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDay: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  calendarMonth: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Assign row
  assignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingLeft: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  assignStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  assignStatusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Ops task badge
  opsTaskBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  opsTaskBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Budget
  financeGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  financeCard: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 2,
  },
  financeValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  budgetRemaining: {
    alignItems: 'center',
  },
  budgetStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  budgetStatusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Notes
  noteCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteAuthor: {
    fontSize: 13,
    fontWeight: '600',
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
