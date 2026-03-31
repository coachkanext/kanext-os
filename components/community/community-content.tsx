/**
 * Community — 3-page swipeable layout for education mode.
 * Page 0: Members — summary card, role filter pills, member list.
 * Page 1: Organizations — category filter pills, org list.
 * Page 2: Development — section pills, career/advising/mentoring/wellness/success.
 * Identical SwipeablePages / LongPressContextMenu patterns as Roster/Team.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { SwipeablePages } from '@/components/ui/swipeable-two-page';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import {
  COMMUNITY_SUMMARY,
  JOB_POSTINGS,
  ADVISING_ENTRIES,
  MENTORING_PAIRINGS,
  WELLNESS_RESOURCES,
  SUCCESS_ALERTS,
  getMembers,
  getOrganizations,
  type CommunityMemberItem,
  type MemberFilter,
  type MemberSort,
  type OrgFilter,
  type OrgCategory,
  type OrgStatus,
  type DevSection,
  type CommunityRole,
  type ClassYear,
  type JobType,
  type MentoringType,
  type WellnessCategory,
  type AlertSeverity,
  type OrganizationItem,
} from '@/data/mock-community-screen';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';

// ── Color Maps ──

const ROLE_COLORS: Record<CommunityRole, string> = {
  student: '#1A1714',
  faculty: '#1A1714',
  staff: '#B8943E',
};

const ROLE_LABELS: Record<CommunityRole, string> = {
  student: 'Student',
  faculty: 'Faculty',
  staff: 'Staff',
};

const CLASS_YEAR_COLORS: Record<NonNullable<ClassYear>, string> = {
  freshman: '#5A8A6E',
  sophomore: '#1A1714',
  junior: '#B8943E',
  senior: '#1A1714',
  grad: '#6366F1',
};

const CLASS_YEAR_LABELS: Record<NonNullable<ClassYear>, string> = {
  freshman: 'Freshman',
  sophomore: 'Sophomore',
  junior: 'Junior',
  senior: 'Senior',
  grad: 'Grad',
};

const ORG_CATEGORY_COLORS: Record<OrgCategory, string> = {
  clubs: '#1A1714',
  'greek-life': '#1A1714',
  academic: '#6366F1',
  'sports-clubs': '#5A8A6E',
  arts: '#1A1714',
  service: '#B8943E',
  religious: '#B85C5C',
  'student-gov': '#9C9790',
};

const ORG_CATEGORY_LABELS: Record<OrgCategory, string> = {
  clubs: 'Clubs',
  'greek-life': 'Greek Life',
  academic: 'Academic',
  'sports-clubs': 'Sports Clubs',
  arts: 'Arts',
  service: 'Service',
  religious: 'Religious',
  'student-gov': 'Student Gov',
};

const ORG_STATUS_COLORS: Record<OrgStatus, string> = {
  active: '#5A8A6E',
  inactive: '#52525B',
  pending: '#B8943E',
};

const ORG_STATUS_LABELS: Record<OrgStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
};

const JOB_TYPE_COLORS: Record<JobType, string> = {
  internship: '#1A1714',
  'part-time': '#B8943E',
  'full-time': '#5A8A6E',
};

const JOB_TYPE_LABELS: Record<JobType, string> = {
  internship: 'Internship',
  'part-time': 'Part-Time',
  'full-time': 'Full-Time',
};

const MENTORING_TYPE_COLORS: Record<MentoringType, string> = {
  peer: '#5A8A6E',
  faculty: '#1A1714',
  alumni: '#1A1714',
};

const MENTORING_TYPE_LABELS: Record<MentoringType, string> = {
  peer: 'Peer',
  faculty: 'Faculty',
  alumni: 'Alumni',
};

const WELLNESS_CATEGORY_COLORS: Record<WellnessCategory, string> = {
  health: '#5A8A6E',
  counseling: '#1A1714',
  programs: '#1A1714',
  crisis: '#B85C5C',
};

const WELLNESS_CATEGORY_LABELS: Record<WellnessCategory, string> = {
  health: 'Health',
  counseling: 'Counseling',
  programs: 'Programs',
  crisis: 'Crisis',
};

const ALERT_SEVERITY_COLORS: Record<AlertSeverity, string> = {
  high: '#B85C5C',
  medium: '#B8943E',
  low: '#9C9790',
};

const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

// ─── Page Top Bar ────────────────────────────────────────────────────────────

function PageTopBar({ title }: { title: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={s.topBar}>
      <Text style={s.topBarTitle}>{title}</Text>
    </View>
  );
}

// ─── Filter Pills (generic) ────────────────────────────────────────────────

function FilterPills<T extends string>({
  items,
  active,
  onSelect,
}: {
  items: { key: T; label: string }[];
  active: T;
  onSelect: (key: T) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filterRow}
    >
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <Pressable
            key={item.key}
            style={[s.filterPill, isActive && s.filterPillActive]}
            onPress={() => onSelect(item.key)}
          >
            <Text style={[s.filterText, isActive && s.filterTextActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Community Summary Card ─────────────────────────────────────────────────

function CommunitySummaryCard() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const segments = [
    { label: 'Students', count: COMMUNITY_SUMMARY.totalStudents },
    { label: 'Faculty',  count: COMMUNITY_SUMMARY.totalFaculty },
    { label: 'Staff',    count: COMMUNITY_SUMMARY.totalStaff },
  ];
  const total = COMMUNITY_SUMMARY.totalStudents + COMMUNITY_SUMMARY.totalFaculty + COMMUNITY_SUMMARY.totalStaff;

  return (
    <View style={s.summaryCard}>
      <View style={s.summaryHeader}>
        <Text style={s.summaryLabel}>COMMUNITY</Text>
        <View style={s.summaryBadge}>
          <Text style={s.summaryBadgeText}>{total.toLocaleString()} people</Text>
        </View>
      </View>
      <View style={s.summaryPositions}>
        {segments.map((seg) => (
          <View key={seg.label} style={s.summaryPosItem}>
            <Text style={s.summaryPosCount}>{seg.count.toLocaleString()}</Text>
            <Text style={s.summaryPosLabel}>{seg.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Member Row ─────────────────────────────────────────────────────────────

function MemberRow({
  member,
  onLongPress,
}: {
  member: CommunityMemberItem;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const roleColor = ROLE_COLORS[member.role];
  const onlineColor = member.isOnline ? C.green : C.muted;

  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={s.memberAvatarContainer}>
        <View style={s.playerAvatar}>
          <Text style={s.playerInitials}>{member.initials}</Text>
        </View>
        <View style={[s.onlineDot, { backgroundColor: onlineColor }]} />
      </View>
      <View style={s.rowContent}>
        <View style={s.playerNameRow}>
          <Text style={s.rowName} numberOfLines={1}>{member.name}</Text>
          <Text style={s.username}>@{member.username}</Text>
        </View>
        <Text style={s.memberTitle} numberOfLines={1}>{member.department}</Text>
        <View style={s.playerMetaRow}>
          <View style={[s.microBadge, { backgroundColor: roleColor + '22' }]}>
            <Text style={[s.microBadgeText, { color: roleColor }]}>{ROLE_LABELS[member.role]}</Text>
          </View>
          {member.classYear && (
            <View style={[s.microBadge, { backgroundColor: CLASS_YEAR_COLORS[member.classYear] + '22' }]}>
              <Text style={[s.microBadgeText, { color: CLASS_YEAR_COLORS[member.classYear] }]}>{CLASS_YEAR_LABELS[member.classYear]}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// ─── Org Row ────────────────────────────────────────────────────────────────

function OrgRow({
  org,
  onLongPress,
}: {
  org: OrganizationItem;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const categoryColor = ORG_CATEGORY_COLORS[org.category];
  const statusColor = ORG_STATUS_COLORS[org.status];

  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={[s.squircleIcon, { backgroundColor: categoryColor + '22' }]}>
        <IconSymbol name="person.3.fill" size={16} color={categoryColor} />
      </View>
      <View style={s.rowContent}>
        <Text style={s.rowName} numberOfLines={1}>{org.name}</Text>
        <View style={s.playerMetaRow}>
          <View style={[s.microBadge, { backgroundColor: categoryColor + '22' }]}>
            <Text style={[s.microBadgeText, { color: categoryColor }]}>{ORG_CATEGORY_LABELS[org.category]}</Text>
          </View>
          <Text style={s.playerMeta}>{org.memberCount} members</Text>
          <View style={[s.statusDot, { backgroundColor: statusColor }]} />
          <Text style={s.playerMeta}>{ORG_STATUS_LABELS[org.status]}</Text>
        </View>
        <View style={s.playerMetaRow}>
          <Text style={s.playerMeta}>{org.leaderInitials} · {org.leaderName}</Text>
          {org.nextEventDate && (
            <>
              <Text style={s.mgmtDot}>·</Text>
              <Text style={s.playerMeta}>Next: {org.nextEventDate}</Text>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// ─── Job Posting Row ────────────────────────────────────────────────────────

function JobPostingRow({ entry }: { entry: typeof JOB_POSTINGS[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const typeColor = JOB_TYPE_COLORS[entry.type];

  return (
    <View style={s.mgmtRow}>
      <View style={[s.squircleIcon, { backgroundColor: typeColor + '22' }]}>
        <IconSymbol name="briefcase.fill" size={16} color={typeColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.mgmtName}>{entry.title}</Text>
        <Text style={s.mgmtDescription}>{entry.company}</Text>
        <View style={s.mgmtMetaRow}>
          <View style={[s.microBadge, { backgroundColor: typeColor + '22' }]}>
            <Text style={[s.microBadgeText, { color: typeColor }]}>{JOB_TYPE_LABELS[entry.type]}</Text>
          </View>
          <Text style={s.mgmtMeta}>Due {entry.deadline}</Text>
          <Text style={s.mgmtDot}>·</Text>
          <Text style={s.mgmtMeta}>{entry.location}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Advising Row ───────────────────────────────────────────────────────────

function AdvisingRow({ entry }: { entry: typeof ADVISING_ENTRIES[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const progressColor = entry.degreeProgress >= 80 ? C.green : entry.degreeProgress >= 50 ? C.amber : C.blue;

  return (
    <View style={s.mgmtRow}>
      <View style={s.mgmtAvatar}>
        <Text style={s.mgmtInitials}>{entry.studentInitials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.mgmtName}>{entry.studentName}</Text>
        <Text style={s.mgmtDescription}>Advisor: {entry.advisorName}</Text>
        <View style={s.mgmtMetaRow}>
          {entry.nextAppointment ? (
            <Text style={s.mgmtMeta}>Next: {entry.nextAppointment}</Text>
          ) : (
            <Text style={[s.mgmtMeta, { color: C.amber }]}>No appointment</Text>
          )}
          {entry.holdCount > 0 && (
            <>
              <Text style={s.mgmtDot}>·</Text>
              <View style={[s.microBadge, { backgroundColor: C.red + '22' }]}>
                <Text style={[s.microBadgeText, { color: C.red }]}>{entry.holdCount} hold{entry.holdCount > 1 ? 's' : ''}</Text>
              </View>
            </>
          )}
        </View>
        <View style={s.progressBarBg}>
          <View style={[s.progressBarFill, { width: `${entry.degreeProgress}%`, backgroundColor: progressColor }]} />
        </View>
        <Text style={[s.mgmtMeta, { marginTop: 2 }]}>{entry.degreeProgress}% degree progress</Text>
      </View>
    </View>
  );
}

// ─── Mentoring Row ──────────────────────────────────────────────────────────

function MentoringRow({ entry }: { entry: typeof MENTORING_PAIRINGS[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const typeColor = MENTORING_TYPE_COLORS[entry.type];

  return (
    <View style={s.mgmtRow}>
      <View style={s.mgmtAvatar}>
        <Text style={s.mgmtInitials}>{entry.mentorInitials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.mgmtName}>{entry.mentorName} → {entry.menteeName}</Text>
        <View style={s.mgmtMetaRow}>
          <View style={[s.microBadge, { backgroundColor: typeColor + '22' }]}>
            <Text style={[s.microBadgeText, { color: typeColor }]}>{MENTORING_TYPE_LABELS[entry.type]}</Text>
          </View>
          <Text style={s.mgmtMeta}>{entry.meetingSchedule}</Text>
        </View>
        <Text style={s.mgmtDescription}>{entry.goalSummary}</Text>
      </View>
    </View>
  );
}

// ─── Wellness Row ───────────────────────────────────────────────────────────

function WellnessRow({ entry }: { entry: typeof WELLNESS_RESOURCES[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const catColor = WELLNESS_CATEGORY_COLORS[entry.category];

  return (
    <View style={s.mgmtRow}>
      <View style={[s.squircleIcon, { backgroundColor: catColor + '22' }]}>
        <IconSymbol name="heart.fill" size={16} color={catColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.mgmtName}>{entry.title}</Text>
        <View style={s.mgmtMetaRow}>
          <View style={[s.microBadge, { backgroundColor: catColor + '22' }]}>
            <Text style={[s.microBadgeText, { color: catColor }]}>{WELLNESS_CATEGORY_LABELS[entry.category]}</Text>
          </View>
          <Text style={s.mgmtMeta}>{entry.availability}</Text>
        </View>
        <Text style={s.mgmtDescription}>{entry.description}</Text>
      </View>
    </View>
  );
}

// ─── Success Alert Row ──────────────────────────────────────────────────────

function SuccessAlertRow({ entry }: { entry: typeof SUCCESS_ALERTS[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const sevColor = ALERT_SEVERITY_COLORS[entry.severity];

  return (
    <View style={s.mgmtRow}>
      <View style={s.mgmtAvatar}>
        <Text style={s.mgmtInitials}>{entry.studentInitials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.mgmtName}>{entry.studentName}</Text>
        <Text style={s.mgmtDescription}>{entry.reason}</Text>
        <View style={s.mgmtMetaRow}>
          <View style={[s.microBadge, { backgroundColor: sevColor + '22' }]}>
            <Text style={[s.microBadgeText, { color: sevColor }]}>{ALERT_SEVERITY_LABELS[entry.severity]}</Text>
          </View>
          <Text style={s.mgmtMeta}>{entry.department}</Text>
          <Text style={s.mgmtDot}>·</Text>
          <Text style={s.mgmtMeta}>GPA {entry.gpa}</Text>
          <Text style={s.mgmtDot}>·</Text>
          <Text style={s.mgmtMeta}>{entry.flaggedBy}</Text>
        </View>
        {entry.actionTaken && (
          <Text style={[s.mgmtMeta, { marginTop: 2, color: C.green }]}>{entry.actionTaken}</Text>
        )}
      </View>
    </View>
  );
}

// ─── Section Header ─────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionHeaderText}>{title}</Text>
    </View>
  );
}

// ─── FAB ────────────────────────────────────────────────────────────────────

function FAB({ onPress }: { onPress: () => void }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable
      style={({ pressed }) => [s.fab, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
    >
      <IconSymbol name="plus" size={24} color={C.label} />
    </Pressable>
  );
}

// ─── Filter Data ────────────────────────────────────────────────────────────

const MEMBER_FILTERS: { key: MemberFilter; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'students', label: 'Students' },
  { key: 'faculty',  label: 'Faculty' },
  { key: 'staff',    label: 'Staff' },
];

const ORG_FILTERS: { key: OrgFilter; label: string }[] = [
  { key: 'all',          label: 'All' },
  { key: 'clubs',        label: 'Clubs' },
  { key: 'greek-life',   label: 'Greek Life' },
  { key: 'academic',     label: 'Academic' },
  { key: 'sports-clubs', label: 'Sports Clubs' },
  { key: 'arts',         label: 'Arts' },
  { key: 'service',      label: 'Service' },
  { key: 'religious',    label: 'Religious' },
  { key: 'student-gov',  label: 'Student Gov' },
];

const DEV_SECTIONS: { key: DevSection; label: string }[] = [
  { key: 'career',    label: 'Career' },
  { key: 'advising',  label: 'Advising' },
  { key: 'mentoring', label: 'Mentoring' },
  { key: 'wellness',  label: 'Wellness' },
  { key: 'success',   label: 'Success' },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export function CommunityContent() {
  const insets = useSafeAreaInsets();
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);
  const [memberFilter, setMemberFilter] = useState<MemberFilter>('all');
  const [memberSort] = useState<MemberSort>('name');
  const [orgFilter, setOrgFilter] = useState<OrgFilter>('all');
  const [devSection, setDevSection] = useState<DevSection>('career');

  // ── Data ──
  const filteredMembers = useMemo(() => getMembers(memberFilter, memberSort), [memberFilter, memberSort]);
  const filteredOrgs = useMemo(() => getOrganizations(orgFilter), [orgFilter]);

  // ── Scroll footer hide ──
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  // ── Long press: Member ──
  const longPressMember = useCallback((member: CommunityMemberItem, pageY: number) => {
    setMenuData({
      title: member.name,
      subtitle: `${ROLE_LABELS[member.role]} · ${member.department}`,
      initials: member.initials,
      pageY,
      actions: [
        { key: 'message', label: 'Message', icon: 'bubble.left.fill' },
        { key: 'call', label: 'Call', icon: 'phone.fill' },
        { key: 'profile', label: 'View Profile', icon: 'person.fill' },
        { key: 'edit', label: 'Edit', icon: 'pencil' },
        { key: 'status', label: 'Change Status', icon: 'arrow.right.arrow.left' },
      ],
      onAction: () => {},
    });
  }, []);

  // ── Long press: Organization ──
  const longPressOrg = useCallback((org: OrganizationItem, pageY: number) => {
    setMenuData({
      title: org.name,
      subtitle: `${ORG_CATEGORY_LABELS[org.category]} · ${org.memberCount} members`,
      initials: org.leaderInitials,
      pageY,
      actions: [
        { key: 'pin', label: 'Pin', icon: 'pin.fill' },
        { key: 'edit', label: 'Edit', icon: 'pencil' },
        { key: 'archive', label: 'Archive', icon: 'archivebox.fill', destructive: true },
        { key: 'delete', label: 'Delete', icon: 'trash.fill', destructive: true },
      ],
      onAction: () => {},
    });
  }, []);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <SwipeablePages
        activeIndex={pageIndex}
        onPageChange={setPageIndex}
      >
        {/* ── PAGE 0: MEMBERS ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Members" />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <CommunitySummaryCard />
            <View style={{ marginTop: 4 }}>
              <FilterPills items={MEMBER_FILTERS} active={memberFilter} onSelect={setMemberFilter} />
            </View>
            {filteredMembers.map((member, idx) => (
              <View key={member.id}>
                {idx > 0 && <View style={s.separator} />}
                <MemberRow
                  member={member}
                  onLongPress={(pageY) => longPressMember(member, pageY)}
                />
              </View>
            ))}
          </ScrollView>
          <FAB onPress={() => {}} />
        </View>

        {/* ── PAGE 1: ORGANIZATIONS ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Organizations" />
            <FilterPills items={ORG_FILTERS} active={orgFilter} onSelect={setOrgFilter} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {filteredOrgs.map((org, idx) => (
              <View key={org.id}>
                {idx > 0 && <View style={s.separator} />}
                <OrgRow
                  org={org}
                  onLongPress={(pageY) => longPressOrg(org, pageY)}
                />
              </View>
            ))}
          </ScrollView>
          <FAB onPress={() => {}} />
        </View>

        {/* ── PAGE 2: DEVELOPMENT ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Development" />
            <FilterPills items={DEV_SECTIONS} active={devSection} onSelect={setDevSection} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {devSection === 'career' && (
              <>
                <SectionHeader title="Job Postings" />
                {JOB_POSTINGS.map((entry) => (
                  <JobPostingRow key={entry.id} entry={entry} />
                ))}
              </>
            )}
            {devSection === 'advising' && (
              <>
                <SectionHeader title="Academic Advising" />
                {ADVISING_ENTRIES.map((entry) => (
                  <AdvisingRow key={entry.id} entry={entry} />
                ))}
              </>
            )}
            {devSection === 'mentoring' && (
              <>
                <SectionHeader title="Mentoring Pairings" />
                {MENTORING_PAIRINGS.map((entry) => (
                  <MentoringRow key={entry.id} entry={entry} />
                ))}
              </>
            )}
            {devSection === 'wellness' && (
              <>
                <SectionHeader title="Wellness Resources" />
                {WELLNESS_RESOURCES.map((entry) => (
                  <WellnessRow key={entry.id} entry={entry} />
                ))}
              </>
            )}
            {devSection === 'success' && (
              <>
                <SectionHeader title="Success Alerts" />
                {SUCCESS_ALERTS.map((entry) => (
                  <SuccessAlertRow key={entry.id} entry={entry} />
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </SwipeablePages>

      {/* Long-press context menu */}
      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  pageScroll: { flex: 1 },

  // Top bar
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topBarTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Filter pills
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: C.surface,
  },
  filterPillActive: {
    backgroundColor: C.label,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.label,
  },
  filterTextActive: {
    color: '#000000',
  },

  // Summary card
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.secondary,
    letterSpacing: 0.5,
  },
  summaryBadge: {
    backgroundColor: C.blue + '22',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  summaryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.blue,
  },
  summaryPositions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryPosItem: {
    alignItems: 'center',
    gap: 2,
  },
  summaryPosCount: {
    fontSize: 20,
    fontWeight: '700',
    color: C.label,
  },
  summaryPosLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.secondary,
  },

  // Shared row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 12,
    backgroundColor: C.bg,
  },
  rowPressed: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  rowContent: { flex: 1, marginLeft: 12, marginRight: 8 },
  rowName: { fontSize: 16, fontWeight: '500', color: C.label },

  // Member row
  memberAvatarContainer: {
    position: 'relative',
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerInitials: { fontSize: 12, fontWeight: '700', color: C.secondary },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: C.bg,
  },
  playerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  username: { fontSize: 13, fontWeight: '500', color: C.muted },
  memberTitle: { fontSize: 13, color: C.secondary, marginTop: 1 },
  playerMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  playerMeta: { fontSize: 12, color: C.muted },
  microBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  microBadgeText: { fontSize: 9, fontWeight: '700' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  // Squircle icon for orgs
  squircleIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Management rows
  mgmtRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 10,
  },
  mgmtAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mgmtInitials: {
    fontSize: 11,
    fontWeight: '700',
    color: C.label,
  },
  mgmtName: {
    fontSize: 15,
    fontWeight: '500',
    color: C.label,
  },
  mgmtDescription: {
    fontSize: 13,
    color: C.muted,
    marginTop: 2,
  },
  mgmtMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  mgmtMeta: {
    fontSize: 12,
    color: C.muted,
  },
  mgmtDot: {
    fontSize: 12,
    color: C.muted,
  },

  // Progress bar
  progressBarBg: {
    height: 4,
    backgroundColor: C.separator,
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },

  // Section header
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Separator
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 68 },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
