/**
 * Universal Service Sheet — Church Mode
 * Service/event "truth page" with 7 RBAC-gated tabs.
 * This is the CONTENT component — the parent handles the bottom sheet wrapper.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import {
  type ServiceEvent,
  type AgendaBlock,
  type VolunteerAssignment,
  type OpsChecklist,
  type ChurchIncident,
  CHURCH_MEMBERS,
  VOLUNTEER_ASSIGNMENTS,
  AGENDA_BLOCKS,
  OPS_CHECKLISTS,
  CHURCH_INCIDENTS,
  FOLLOW_UPS,
  getAgendaByService,
  getAssignmentsByService,
  getChecklistByService,
  getIncidentsByService,
} from '@/data/mock-church-v2';

import {
  type ChurchRoleLens,
  type ServiceTab,
  getServiceSheetTabs,
  isSeniorPastor,
  isMinistryLevel,
} from '@/utils/church-rbac';

// =============================================================================
// PROPS
// =============================================================================

interface UniversalServiceSheetProps {
  service: ServiceEvent;
  roleLens: ChurchRoleLens;
  onClose: () => void;
  onSelectMember?: (memberId: string) => void;
}

// =============================================================================
// STATUS / COLOR HELPERS
// =============================================================================

const SERVICE_STATUS_COLORS: Record<string, string> = {
  upcoming: '#1D9BF0',
  live: '#22C55E',
  completed: '#A1A1AA',
};

const AGENDA_TYPE_COLORS: Record<string, string> = {
  setup: '#A1A1AA',
  doors: '#1D9BF0',
  worship: '#1D9BF0',
  teaching: '#F59E0B',
  small_groups: '#22C55E',
  teardown: '#A1A1AA',
  offering: '#F59E0B',
  announcements: '#1D9BF0',
};

const INCIDENT_TYPE_COLORS: Record<string, string> = {
  child_safety: '#EF4444',
  medical: '#F59E0B',
  conflict: '#1D9BF0',
  property: '#A1A1AA',
  other: '#A1A1AA',
};

const SENSITIVITY_COLORS: Record<string, string> = {
  public: '#22C55E',
  restricted: '#F59E0B',
  confidential: '#EF4444',
};

const INCIDENT_STATUS_COLORS: Record<string, string> = {
  open: '#EF4444',
  investigating: '#F59E0B',
  resolved: '#22C55E',
  closed: '#A1A1AA',
};

// =============================================================================
// INLINE MOCK DATA (Run of Show, Recap, etc.)
// =============================================================================

const RUN_OF_SHOW = [
  { id: 'ros-1', order: 1, segment: 'Welcome & Call to Worship', owner: 'Pastor Lisa Grant', duration: '3 min', mediaLink: null, lyricsLink: null, slidesLink: 'slides/welcome-feb23' },
  { id: 'ros-2', order: 2, segment: 'Opening Prayer', owner: 'Mother Evelyn Grant', duration: '2 min', mediaLink: null, lyricsLink: null, slidesLink: null },
  { id: 'ros-3', order: 3, segment: 'Worship Set (4 songs)', owner: 'Min. David Park', duration: '25 min', mediaLink: null, lyricsLink: 'lyrics/set-feb23', slidesLink: 'slides/worship-feb23' },
  { id: 'ros-4', order: 4, segment: 'Announcements', owner: 'Pastor Lisa Grant', duration: '5 min', mediaLink: null, lyricsLink: null, slidesLink: 'slides/announcements-feb23' },
  { id: 'ros-5', order: 5, segment: 'Tithes & Offering', owner: 'Dea. Robert Simmons', duration: '8 min', mediaLink: null, lyricsLink: null, slidesLink: null },
  { id: 'ros-6', order: 6, segment: 'Special Music / Choir', owner: 'Choir Director', duration: '5 min', mediaLink: null, lyricsLink: 'lyrics/special-feb23', slidesLink: null },
  { id: 'ros-7', order: 7, segment: 'Scripture Reading', owner: 'Elder Reader', duration: '3 min', mediaLink: null, lyricsLink: null, slidesLink: null },
  { id: 'ros-8', order: 8, segment: 'Sermon: "Walking in Faith Pt. 3"', owner: 'Pastor Philip Anthony Mitchell', duration: '40 min', mediaLink: null, lyricsLink: null, slidesLink: 'slides/sermon-feb23' },
  { id: 'ros-9', order: 9, segment: 'Altar Call & Ministry Time', owner: 'Prayer Team', duration: '12 min', mediaLink: null, lyricsLink: null, slidesLink: null },
  { id: 'ros-10', order: 10, segment: 'Benediction & Dismissal', owner: 'Pastor Philip Anthony Mitchell', duration: '2 min', mediaLink: null, lyricsLink: null, slidesLink: null },
];

const SERVICE_ROLES_NEEDED = [
  { id: 'rn-1', role: 'Worship Leader', assigned: 'Min. David Park', filled: true },
  { id: 'rn-2', role: 'Vocalist', assigned: 'Jasmine Taylor', filled: true },
  { id: 'rn-3', role: "Children's Church Lead", assigned: 'Sis. Angela Foster', filled: true },
  { id: 'rn-4', role: 'Usher Captain', assigned: 'Dea. Robert Simmons', filled: true },
  { id: 'rn-5', role: 'Prayer Team Lead', assigned: 'Mother Evelyn Grant', filled: true },
  { id: 'rn-6', role: 'AV / Sound Tech', assigned: null, filled: false },
  { id: 'rn-7', role: 'Greeter (Entrance A)', assigned: null, filled: false },
  { id: 'rn-8', role: 'Associate Minister', assigned: 'Pastor Lisa Grant', filled: true },
  { id: 'rn-9', role: 'Parking Team', assigned: 'Emeka Chukwu', filled: true },
  { id: 'rn-10', role: 'Nursery Volunteer', assigned: 'Amara Diallo', filled: true },
];

const SERVICE_ATTENDANCE_DATA = {
  checkInCount: 312,
  newVisitors: 8,
  followUpTargets: [
    { id: 'fut-1', name: 'Michael Okafor', reason: 'First-time visitor', status: 'pending' },
    { id: 'fut-2', name: 'Rita Onyekachi', reason: 'Returning visitor (2nd visit)', status: 'pending' },
    { id: 'fut-3', name: 'Taiwo Olaniyan', reason: 'First-time visitor', status: 'pending' },
    { id: 'fut-4', name: 'Sola Ogunleye', reason: 'Has not attended in 3 weeks', status: 'contacted' },
  ],
};

const SERVICE_RECAP_DATA = {
  notes: [
    'Strong attendance (312). Highest Sunday count in February.',
    'Worship set ran 3 minutes over. Adjust for next week.',
    'Children\'s church had a smooth morning. New curriculum well received.',
    'AV tech position unfilled — backup volunteer covered. Need permanent solution.',
    '8 new visitors. All received welcome packets and info cards.',
  ],
  actionsGenerated: [
    { id: 'ag-1', type: 'follow_up', description: 'Follow up with 8 new visitors within 48 hours', owner: 'Pastor Lisa Grant', status: 'open' },
    { id: 'ag-2', type: 'task', description: 'Post AV tech volunteer position to church bulletin', owner: 'Admin Team', status: 'open' },
    { id: 'ag-3', type: 'follow_up', description: 'Check on Sola Ogunleye — 3 weeks absent', owner: 'Dea. Robert Simmons', status: 'open' },
    { id: 'ag-4', type: 'task', description: 'Review worship set timing with Min. David Park', owner: 'Pastor Philip Anthony Mitchell', status: 'open' },
  ],
  nextServiceAdjustments: [
    'Shorten worship set by 3 minutes (25 min to 22 min) to stay on schedule',
    'Assign permanent AV tech role or recruit backup volunteer',
    'Add second greeter at Entrance A for visitor welcoming',
    'Prepare communion elements earlier (by 9:00 AM instead of 9:30 AM)',
  ],
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function UniversalServiceSheet({
  service,
  roleLens,
  onClose,
  onSelectMember,
}: UniversalServiceSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const tabs = useMemo(() => getServiceSheetTabs(roleLens), [roleLens]);
  const [activeTab, setActiveTab] = useState<ServiceTab>(tabs[0]?.id ?? 'agenda');

  const seniorPastor = isSeniorPastor(roleLens);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <ServiceHeader
        service={service}
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
        {activeTab === 'agenda' && (
          <AgendaTab service={service} colors={colors} />
        )}
        {activeTab === 'assignments' && (
          <AssignmentsTab service={service} colors={colors} seniorPastor={seniorPastor} onSelectMember={onSelectMember} />
        )}
        {activeTab === 'run_of_show' && (
          <RunOfShowTab service={service} colors={colors} />
        )}
        {activeTab === 'ops_checklist' && (
          <OpsChecklistTab service={service} colors={colors} />
        )}
        {activeTab === 'attendance' && (
          <AttendanceTab service={service} colors={colors} seniorPastor={seniorPastor} />
        )}
        {activeTab === 'incidents' && (
          <IncidentsTab service={service} colors={colors} seniorPastor={seniorPastor} />
        )}
        {activeTab === 'recap_followup' && (
          <RecapFollowUpTab service={service} colors={colors} />
        )}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// HEADER
// =============================================================================

function ServiceHeader({
  service,
  colors,
  seniorPastor,
  onClose,
}: {
  service: ServiceEvent;
  colors: typeof Colors.light;
  seniorPastor: boolean;
  onClose: () => void;
}) {
  const campusLabel = '2819 Church';
  const owner = CHURCH_MEMBERS.find((m) => m.id === service.owner);
  const staffingMissing = service.staffingNeeded - service.staffingFilled;

  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      {/* Top row: title + close */}
      <View style={styles.headerTopRow}>
        <View style={{ flex: 1 }}>
          <ThemedText style={[styles.serviceTitle, { color: colors.text }]}>
            {service.title}
          </ThemedText>
          <ThemedText style={[styles.serviceSubtitle, { color: colors.textSecondary }]}>
            {campusLabel} · {service.location}
          </ThemedText>
        </View>
        <Pressable onPress={onClose} hitSlop={12}>
          <IconSymbol name="xmark" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Date/time + Status */}
      <View style={styles.pillRow}>
        <View style={[styles.datePill, { backgroundColor: colors.card }]}>
          <IconSymbol name="calendar" size={12} color={colors.textSecondary} />
          <ThemedText style={[styles.datePillText, { color: colors.textSecondary }]}>
            {service.date} · {service.time}
          </ThemedText>
        </View>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: (SERVICE_STATUS_COLORS[service.status] ?? '#A1A1AA') + '1A' },
          ]}
        >
          {service.status === 'live' && (
            <View style={styles.liveDotOuter}>
              <View style={[styles.liveDot, { backgroundColor: '#22C55E' }]} />
            </View>
          )}
          {service.status !== 'live' && (
            <View
              style={[
                styles.statusDot,
                { backgroundColor: SERVICE_STATUS_COLORS[service.status] ?? '#A1A1AA' },
              ]}
            />
          )}
          <ThemedText
            style={[
              styles.statusPillText,
              { color: SERVICE_STATUS_COLORS[service.status] ?? '#A1A1AA' },
            ]}
          >
            {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
          </ThemedText>
        </View>
      </View>

      {/* Owner */}
      <ThemedText style={[styles.ownerLabel, { color: colors.textSecondary }]}>
        Owner: {owner?.name ?? service.owner}
      </ThemedText>

      {/* Chips (RBAC-gated) */}
      {seniorPastor && (
        <View style={styles.chipRow}>
          {staffingMissing > 0 && (
            <View style={[styles.chip, { backgroundColor: '#EF444422' }]}>
              <IconSymbol name="person.fill.questionmark" size={12} color="#EF4444" />
              <ThemedText style={[styles.chipText, { color: '#EF4444' }]}>
                Staffing: {staffingMissing} missing
              </ThemedText>
            </View>
          )}
          <View
            style={[
              styles.chip,
              { backgroundColor: service.safetyCleared ? '#22C55E22' : '#F59E0B22' },
            ]}
          >
            <IconSymbol
              name="shield.fill"
              size={12}
              color={service.safetyCleared ? '#22C55E' : '#F59E0B'}
            />
            <ThemedText
              style={[
                styles.chipText,
                { color: service.safetyCleared ? '#22C55E' : '#F59E0B' },
              ]}
            >
              Safety: {service.safetyCleared ? 'OK' : 'Review'}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionRow}>
        <ActionIcon icon="person.2.fill" label="Volunteers" colors={colors} />
        <ActionIcon icon="bubble.left.fill" label="Msg Room" colors={colors} />
        <ActionIcon icon="hands.sparkles.fill" label="Request" colors={colors} />
      </View>
    </View>
  );
}

// =============================================================================
// TAB 1: AGENDA
// =============================================================================

function AgendaTab({
  service,
  colors,
}: {
  service: ServiceEvent;
  colors: typeof Colors.light;
}) {
  const agenda = getAgendaByService(service.id);

  return (
    <View>
      <SectionCard title="Service Agenda" colors={colors}>
        {agenda.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No agenda blocks defined
          </ThemedText>
        ) : (
          agenda.map((block, idx) => (
            <View
              key={block.id}
              style={[styles.agendaRow, { borderBottomColor: colors.border }]}
            >
              <View
                style={[
                  styles.agendaTimelineBar,
                  { backgroundColor: AGENDA_TYPE_COLORS[block.type] ?? '#A1A1AA' },
                ]}
              />
              <View style={[styles.agendaTimeCol]}>
                <ThemedText style={[styles.agendaTime, { color: colors.textSecondary }]}>
                  {block.time}
                </ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {block.title}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {block.type.replace('_', ' ').toUpperCase()}{block.owner ? ` · ${CHURCH_MEMBERS.find((m) => m.id === block.owner)?.name ?? block.owner}` : ''}
                </ThemedText>
              </View>
            </View>
          ))
        )}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 2: ASSIGNMENTS
// =============================================================================

function AssignmentsTab({
  service,
  colors,
  seniorPastor,
  onSelectMember,
}: {
  service: ServiceEvent;
  colors: typeof Colors.light;
  seniorPastor: boolean;
  onSelectMember?: (memberId: string) => void;
}) {
  return (
    <View>
      <SectionCard title="Roles & Assignments" colors={colors}>
        {SERVICE_ROLES_NEEDED.map((role) => (
          <Pressable
            key={role.id}
            style={[styles.roleRow, { borderBottomColor: colors.border }]}
            onPress={() => {
              if (role.filled && role.assigned) {
                const member = CHURCH_MEMBERS.find((m) => m.name === role.assigned);
                if (member) onSelectMember?.(member.id);
              }
            }}
          >
            <View
              style={[
                styles.roleFillIndicator,
                { backgroundColor: role.filled ? '#22C55E' : '#EF4444' },
              ]}
            />
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {role.role}
              </ThemedText>
              <ThemedText
                style={[
                  styles.captionText,
                  { color: role.filled ? colors.textSecondary : '#EF4444' },
                ]}
              >
                {role.filled ? role.assigned : 'UNFILLED — needs assignment'}
              </ThemedText>
            </View>
            {role.filled && (
              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
            )}
            {!role.filled && (
              <View style={[styles.unfilledBadge, { backgroundColor: '#EF444422' }]}>
                <ThemedText style={[styles.unfilledBadgeText, { color: '#EF4444' }]}>
                  MISSING
                </ThemedText>
              </View>
            )}
          </Pressable>
        ))}
      </SectionCard>

      {/* Summary */}
      <SectionCard title="Staffing Summary" colors={colors}>
        <View style={styles.statRow}>
          <StatBlock
            label="Total Roles"
            value={String(SERVICE_ROLES_NEEDED.length)}
            color="#FFFFFF"
            colors={colors}
          />
          <StatBlock
            label="Filled"
            value={String(SERVICE_ROLES_NEEDED.filter((r) => r.filled).length)}
            color="#22C55E"
            colors={colors}
          />
          <StatBlock
            label="Missing"
            value={String(SERVICE_ROLES_NEEDED.filter((r) => !r.filled).length)}
            color={SERVICE_ROLES_NEEDED.some((r) => !r.filled) ? '#EF4444' : '#22C55E'}
            colors={colors}
          />
        </View>
      </SectionCard>

      {/* Action Buttons */}
      {seniorPastor && (
        <View style={styles.actionButtonGrid}>
          <ActionButton label="Assign Volunteer" icon="person.badge.plus" colors={colors} />
        </View>
      )}
    </View>
  );
}

// =============================================================================
// TAB 3: RUN OF SHOW
// =============================================================================

function RunOfShowTab({
  service,
  colors,
}: {
  service: ServiceEvent;
  colors: typeof Colors.light;
}) {
  return (
    <View>
      <SectionCard title="Run of Show" colors={colors}>
        {RUN_OF_SHOW.map((segment) => (
          <View
            key={segment.id}
            style={[styles.rosRow, { borderBottomColor: colors.border }]}
          >
            <View style={[styles.rosOrderBadge, { backgroundColor: colors.card }]}>
              <ThemedText style={[styles.rosOrderText, { color: colors.textSecondary }]}>
                {segment.order}
              </ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {segment.segment}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {segment.owner} · {segment.duration}
              </ThemedText>
              {/* Media links */}
              <View style={styles.mediaLinkRow}>
                {segment.slidesLink && (
                  <View style={[styles.mediaLinkChip, { backgroundColor: '#1D9BF022' }]}>
                    <IconSymbol name="doc.fill" size={10} color="#1D9BF0" />
                    <ThemedText style={[styles.mediaLinkText, { color: '#1D9BF0' }]}>
                      Slides
                    </ThemedText>
                  </View>
                )}
                {segment.lyricsLink && (
                  <View style={[styles.mediaLinkChip, { backgroundColor: '#1D9BF022' }]}>
                    <IconSymbol name="music.note" size={10} color="#1D9BF0" />
                    <ThemedText style={[styles.mediaLinkText, { color: '#1D9BF0' }]}>
                      Lyrics
                    </ThemedText>
                  </View>
                )}
                {segment.mediaLink && (
                  <View style={[styles.mediaLinkChip, { backgroundColor: '#F59E0B22' }]}>
                    <IconSymbol name="play.rectangle.fill" size={10} color="#F59E0B" />
                    <ThemedText style={[styles.mediaLinkText, { color: '#F59E0B' }]}>
                      Media
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TAB 4: OPS CHECKLIST
// =============================================================================

function OpsChecklistTab({
  service,
  colors,
}: {
  service: ServiceEvent;
  colors: typeof Colors.light;
}) {
  const checklists = getChecklistByService(service.id);

  const categories = ['setup', 'supplies', 'room', 'safety'] as const;
  const categoryLabels: Record<string, string> = {
    setup: 'Setup Checklist',
    supplies: 'Supplies Checklist',
    room: 'Room Checklist',
    safety: 'Safety Checklist',
  };

  return (
    <View>
      {categories.map((category) => {
        const items = checklists.filter((c) => c.category === category);
        if (items.length === 0) return null;
        return (
          <SectionCard key={category} title={categoryLabels[category]} colors={colors}>
            {items.map((item) => (
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
                  {item.assignee && (
                    <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                      Assignee: {CHURCH_MEMBERS.find((m) => m.id === item.assignee)?.name ?? item.assignee}
                    </ThemedText>
                  )}
                </View>
              </View>
            ))}
          </SectionCard>
        );
      })}

      {/* Blockers */}
      <SectionCard title="Blockers" colors={colors}>
        {checklists.filter((c) => !c.completed).length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No outstanding blockers
          </ThemedText>
        ) : (
          checklists
            .filter((c) => !c.completed)
            .map((item) => (
              <View
                key={item.id}
                style={[styles.listRow, { borderBottomColor: colors.border }]}
              >
                <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#F59E0B" />
                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                  <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                    {item.item}
                  </ThemedText>
                  <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                    {item.category.toUpperCase()} · {item.assignee ? `Assigned: ${CHURCH_MEMBERS.find((m) => m.id === item.assignee)?.name ?? item.assignee}` : 'Unassigned'}
                  </ThemedText>
                </View>
              </View>
            ))
        )}
      </SectionCard>

      {/* Action Buttons */}
      <View style={styles.actionButtonGrid}>
        <ActionButton label="Create Ops Task" icon="plus.circle.fill" colors={colors} />
      </View>
    </View>
  );
}

// =============================================================================
// TAB 5: ATTENDANCE
// =============================================================================

function AttendanceTab({
  service,
  colors,
  seniorPastor,
}: {
  service: ServiceEvent;
  colors: typeof Colors.light;
  seniorPastor: boolean;
}) {
  const data = SERVICE_ATTENDANCE_DATA;

  return (
    <View>
      {/* Check-In Counts */}
      <SectionCard title="Check-In Summary" colors={colors}>
        <View style={styles.statRow}>
          <StatBlock
            label="Total Check-Ins"
            value={String(data.checkInCount)}
            color="#FFFFFF"
            colors={colors}
          />
          <StatBlock
            label="New Visitors"
            value={String(data.newVisitors)}
            color="#1D9BF0"
            colors={colors}
          />
        </View>
      </SectionCard>

      {/* Follow-Up Targets */}
      <SectionCard title="Follow-Up Targets" colors={colors}>
        {data.followUpTargets.map((target) => (
          <View
            key={target.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {target.name}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {target.reason}
              </ThemedText>
            </View>
            <View
              style={[
                styles.followUpStatusBadge,
                { backgroundColor: target.status === 'contacted' ? '#22C55E22' : '#F59E0B22' },
              ]}
            >
              <ThemedText
                style={[
                  styles.followUpStatusText,
                  { color: target.status === 'contacted' ? '#22C55E' : '#F59E0B' },
                ]}
              >
                {target.status.toUpperCase()}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>

      {/* Action Buttons */}
      {seniorPastor && (
        <View style={styles.actionButtonGrid}>
          <ActionButton label="Mark Attendance" icon="checkmark.circle.fill" colors={colors} />
        </View>
      )}
    </View>
  );
}

// =============================================================================
// TAB 6: INCIDENTS (sensitive)
// =============================================================================

function IncidentsTab({
  service,
  colors,
  seniorPastor,
}: {
  service: ServiceEvent;
  colors: typeof Colors.light;
  seniorPastor: boolean;
}) {
  const incidents = getIncidentsByService(service.id);

  return (
    <View>
      <SectionCard title="Incident Reports" colors={colors}>
        {incidents.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No incidents reported for this service
          </ThemedText>
        ) : (
          incidents.map((inc) => (
            <View
              key={inc.id}
              style={[styles.incidentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {/* Type + Sensitivity */}
              <View style={styles.incidentHeaderRow}>
                <View
                  style={[
                    styles.incidentTypeBadge,
                    { backgroundColor: (INCIDENT_TYPE_COLORS[inc.type] ?? '#A1A1AA') + '22' },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.incidentTypeText,
                      { color: INCIDENT_TYPE_COLORS[inc.type] ?? '#A1A1AA' },
                    ]}
                  >
                    {inc.type.replace('_', ' ').toUpperCase()}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.sensitivityBadge,
                    { backgroundColor: (SENSITIVITY_COLORS[inc.sensitivity] ?? '#A1A1AA') + '22' },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.sensitivityText,
                      { color: SENSITIVITY_COLORS[inc.sensitivity] ?? '#A1A1AA' },
                    ]}
                  >
                    {inc.sensitivity.toUpperCase()}
                  </ThemedText>
                </View>
              </View>

              {/* Title + Description */}
              <ThemedText style={[styles.listRowTitle, { color: colors.text, marginTop: Spacing.xs }]}>
                {inc.title}
              </ThemedText>
              <ThemedText style={[styles.bodyText, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                {inc.description}
              </ThemedText>

              {/* Meta */}
              <View style={styles.incidentMeta}>
                <ThemedText style={[styles.captionText, { color: colors.textTertiary }]}>
                  {inc.date} · Reported by: {CHURCH_MEMBERS.find((m) => m.id === inc.owner)?.name ?? inc.owner}
                </ThemedText>
                <View
                  style={[
                    styles.incidentStatusBadge,
                    { backgroundColor: (INCIDENT_STATUS_COLORS[inc.status] ?? '#A1A1AA') + '22' },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.incidentStatusText,
                      { color: INCIDENT_STATUS_COLORS[inc.status] ?? '#A1A1AA' },
                    ]}
                  >
                    {inc.status.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))
        )}
      </SectionCard>

      {/* Action Buttons */}
      <View style={styles.actionButtonGrid}>
        {seniorPastor ? (
          <ActionButton label="Create Incident Report" icon="doc.badge.plus" colors={colors} />
        ) : (
          <ActionButton label="Draft Incident Request" icon="doc.badge.plus" colors={colors} />
        )}
      </View>
    </View>
  );
}

// =============================================================================
// TAB 7: RECAP + FOLLOW-UP
// =============================================================================

function RecapFollowUpTab({
  service,
  colors,
}: {
  service: ServiceEvent;
  colors: typeof Colors.light;
}) {
  const recap = SERVICE_RECAP_DATA;

  return (
    <View>
      {/* Recap Notes */}
      <SectionCard title="Recap Notes" colors={colors}>
        {recap.notes.map((note, idx) => (
          <View
            key={idx}
            style={[styles.recapNoteRow, { borderBottomColor: colors.border }]}
          >
            <View style={[styles.recapBullet, { backgroundColor: '#1D9BF0' }]} />
            <ThemedText style={[styles.bodyText, { color: colors.text, flex: 1 }]}>
              {note}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* Actions Generated */}
      <SectionCard title="Actions Generated" colors={colors}>
        {recap.actionsGenerated.map((action) => (
          <View
            key={action.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View
              style={[
                styles.actionTypeBadge,
                { backgroundColor: action.type === 'follow_up' ? '#1D9BF022' : '#F59E0B22' },
              ]}
            >
              <ThemedText
                style={[
                  styles.actionTypeText,
                  { color: action.type === 'follow_up' ? '#1D9BF0' : '#F59E0B' },
                ]}
              >
                {action.type === 'follow_up' ? 'FOLLOW-UP' : 'TASK'}
              </ThemedText>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {action.description}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                Owner: {action.owner} · {action.status.toUpperCase()}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>

      {/* Next Service Adjustments */}
      <SectionCard title="Next Service Adjustments" colors={colors}>
        {recap.nextServiceAdjustments.map((adj, idx) => (
          <View
            key={idx}
            style={[styles.adjustmentRow, { borderBottomColor: colors.border }]}
          >
            <IconSymbol name="arrow.right.circle.fill" size={16} color="#22C55E" />
            <ThemedText style={[styles.bodyText, { color: colors.text, flex: 1, marginLeft: Spacing.sm }]}>
              {adj}
            </ThemedText>
          </View>
        ))}
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
  serviceTitle: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  serviceSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  datePillText: {
    fontSize: 11,
    fontWeight: '600',
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
  liveDotOuter: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ownerLabel: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
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

  // Agenda
  agendaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  agendaTimelineBar: {
    width: 3,
    height: 36,
    borderRadius: 2,
  },
  agendaTimeCol: {
    width: 60,
    paddingTop: 2,
  },
  agendaTime: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Role row
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  roleFillIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  unfilledBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  unfilledBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Run of Show
  rosRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  rosOrderBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rosOrderText: {
    fontSize: 12,
    fontWeight: '700',
  },
  mediaLinkRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: 4,
  },
  mediaLinkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  mediaLinkText: {
    fontSize: 9,
    fontWeight: '600',
  },

  // Attendance
  followUpStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  followUpStatusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Incidents
  incidentCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  incidentHeaderRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  incidentTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  incidentTypeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sensitivityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  sensitivityText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  incidentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  incidentStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  incidentStatusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Recap
  recapNoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  recapBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  actionTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  actionTypeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  adjustmentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
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
